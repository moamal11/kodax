BEGIN;
-- Ordinary posts can consist of a greeting, image, or text without a forced title.
ALTER TABLE public.community_posts DROP CONSTRAINT community_posts_title_check;
ALTER TABLE public.community_posts ADD CONSTRAINT community_posts_title_check CHECK(char_length(title)<=120 AND (kind<>'question' OR char_length(btrim(title))>=3));
ALTER TABLE public.community_posts ADD COLUMN likes_count integer NOT NULL DEFAULT 0 CHECK(likes_count>=0);
CREATE TABLE public.community_likes(post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(post_id,user_id));
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_likes FROM anon,authenticated;
GRANT SELECT ON public.community_likes TO authenticated;
GRANT ALL ON public.community_likes TO service_role;
CREATE POLICY community_likes_own_read ON public.community_likes FOR SELECT TO authenticated USING(user_id=auth.uid() AND community_readable(post_id));
CREATE FUNCTION public.sync_community_likes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pid uuid:=COALESCE(NEW.post_id,OLD.post_id); BEGIN
 PERFORM 1 FROM community_posts WHERE id=pid FOR UPDATE;
 UPDATE community_posts SET likes_count=(SELECT count(*) FROM community_likes WHERE post_id=pid) WHERE id=pid;
 RETURN NULL;
END $$;
CREATE TRIGGER community_like_count AFTER INSERT OR DELETE ON public.community_likes FOR EACH ROW EXECUTE FUNCTION public.sync_community_likes();
CREATE FUNCTION public.set_community_like(p_post uuid,p_liked boolean) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=_community_writer(); BEGIN
 PERFORM 1 FROM community_posts WHERE id=p_post FOR UPDATE;
 IF NOT community_readable(p_post) OR p_liked IS NULL THEN RAISE EXCEPTION 'post_unavailable' USING ERRCODE='42501'; END IF;
 IF p_liked THEN INSERT INTO community_likes(post_id,user_id) VALUES(p_post,u) ON CONFLICT DO NOTHING;
 ELSE DELETE FROM community_likes WHERE post_id=p_post AND user_id=u; END IF;
 RETURN jsonb_build_object('liked',p_liked,'likes_count',(SELECT likes_count FROM community_posts WHERE id=p_post));
END $$;
REVOKE ALL ON FUNCTION public.sync_community_likes(),public.set_community_like(uuid,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.set_community_like(uuid,boolean) TO authenticated,service_role;

-- Canonical username links are unambiguous regardless of capitalization.
CREATE UNIQUE INDEX profiles_username_case_unique ON public.profiles(lower(username)) WHERE username IS NOT NULL;

-- Shared references do not store private previews in messages. Content is read under
-- the recipient's normal RLS when opened, including later deletion or blocking.
ALTER TABLE public.messages ADD COLUMN shared_type text,ADD COLUMN shared_id uuid;
ALTER TABLE public.messages ADD CONSTRAINT messages_shared_reference CHECK((shared_type IS NULL AND shared_id IS NULL) OR (shared_type IN ('code','discussion') AND shared_id IS NOT NULL));
CREATE FUNCTION public.shared_content_readable(p_type text,p_id uuid,p_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT p_user IS NOT NULL AND EXISTS(SELECT 1 FROM profiles WHERE id=p_user AND NOT COALESCE(is_banned,false)) AND EXISTS(
  SELECT 1 FROM (
   SELECT user_id FROM code_snippets WHERE p_type='code' AND id=p_id AND is_public AND NOT COALESCE(is_hidden,false)
   UNION ALL SELECT user_id FROM community_posts WHERE p_type='discussion' AND id=p_id AND deleted_at IS NULL AND NOT is_hidden
  ) p WHERE p.user_id IS NULL OR NOT EXISTS(SELECT 1 FROM user_blocks b WHERE (b.blocker_id=p_user AND b.blocked_id=p.user_id) OR (b.blocker_id=p.user_id AND b.blocked_id=p_user))
 );
$$;
CREATE FUNCTION public.guard_shared_message() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF current_user IN ('anon','authenticated') AND (
  (TG_OP='INSERT' AND (NEW.shared_type IS NOT NULL OR NEW.shared_id IS NOT NULL)) OR
  (TG_OP='UPDATE' AND (NEW.shared_type IS DISTINCT FROM OLD.shared_type OR NEW.shared_id IS DISTINCT FROM OLD.shared_id))
 ) THEN RAISE EXCEPTION 'shared_reference_server_only' USING ERRCODE='42501'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER messages_shared_guard BEFORE INSERT OR UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.guard_shared_message();
CREATE FUNCTION public.share_recipient_search(p_query text) RETURNS TABLE(id uuid,full_name text,username text,avatar_url text) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=_community_writer(); needle text:='%'||replace(replace(replace(left(btrim(p_query),80),'\','\\'),'%','\%'),'_','\_')||'%'; BEGIN
 IF char_length(btrim(p_query))<2 THEN RETURN; END IF;
 RETURN QUERY SELECT p.id,p.full_name,p.username,p.avatar_url FROM profiles p WHERE p.id<>u AND NOT COALESCE(p.is_banned,false) AND (p.username ILIKE needle OR p.full_name ILIKE needle)
 AND NOT EXISTS(SELECT 1 FROM user_blocks b WHERE (b.blocker_id=u AND b.blocked_id=p.id) OR (b.blocker_id=p.id AND b.blocked_id=u)) ORDER BY p.username LIMIT 20;
END $$;
REVOKE ALL ON FUNCTION public.share_recipient_search(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.share_recipient_search(text) TO authenticated,service_role;
CREATE FUNCTION public.share_community_message(p_message uuid,p_conversation uuid,p_type text,p_content uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=_community_writer(); recipient uuid; old messages; BEGIN
 IF NOT EXISTS(SELECT 1 FROM conversation_participants WHERE conversation_id=p_conversation AND user_id=u)
  OR (SELECT count(*) FROM conversation_participants WHERE conversation_id=p_conversation)<>2 THEN RAISE EXCEPTION 'conversation_not_owned' USING ERRCODE='42501'; END IF;
 SELECT user_id INTO recipient FROM conversation_participants WHERE conversation_id=p_conversation AND user_id<>u;
 IF EXISTS(SELECT 1 FROM user_blocks WHERE (blocker_id=u AND blocked_id=recipient) OR (blocker_id=recipient AND blocked_id=u))
  OR NOT shared_content_readable(p_type,p_content,u) OR NOT shared_content_readable(p_type,p_content,recipient) THEN RAISE EXCEPTION 'share_unavailable' USING ERRCODE='42501'; END IF;
 SELECT * INTO old FROM messages WHERE id=p_message;
 IF FOUND THEN
  IF old.sender_id IS DISTINCT FROM u OR old.conversation_id<>p_conversation OR old.shared_type IS DISTINCT FROM p_type OR old.shared_id IS DISTINCT FROM p_content OR old.is_deleted THEN RAISE EXCEPTION 'message_conflict' USING ERRCODE='42501'; END IF;
  RETURN p_message;
 END IF;
 INSERT INTO messages(id,conversation_id,sender_id,content,shared_type,shared_id) VALUES(p_message,p_conversation,u,CASE WHEN p_type='code' THEN 'مشاركة كود' ELSE 'مشاركة منشور' END,p_type,p_content) ON CONFLICT(id) DO NOTHING;
 SELECT * INTO old FROM messages WHERE id=p_message;
 IF old.sender_id IS DISTINCT FROM u OR old.conversation_id<>p_conversation OR old.shared_type IS DISTINCT FROM p_type OR old.shared_id IS DISTINCT FROM p_content OR old.is_deleted THEN RAISE EXCEPTION 'message_conflict' USING ERRCODE='42501'; END IF;
 RETURN p_message;
END $$;
REVOKE ALL ON FUNCTION public.shared_content_readable(text,uuid,uuid),public.guard_shared_message(),public.share_community_message(uuid,uuid,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.share_community_message(uuid,uuid,text,uuid) TO authenticated,service_role;

-- One durable event per recipient, independent of client retries and token count.
ALTER TABLE public.app_notifications ADD COLUMN event_key text;
ALTER TABLE public.app_notifications ADD CONSTRAINT app_notifications_user_event UNIQUE(user_id,event_key);
CREATE FUNCTION public.guard_social_event_key() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN IF current_user IN ('anon','authenticated') AND NEW.event_key IS NOT NULL THEN RAISE EXCEPTION 'event_key_server_only' USING ERRCODE='42501'; END IF;RETURN NEW;END $$;
CREATE TRIGGER social_event_key_guard BEFORE INSERT OR UPDATE OF event_key ON public.app_notifications FOR EACH ROW EXECUTE FUNCTION public.guard_social_event_key();
REVOKE ALL ON FUNCTION public.guard_social_event_key() FROM PUBLIC,anon,authenticated;
ALTER TABLE public.app_notifications DROP CONSTRAINT app_notifications_type_check;
ALTER TABLE public.app_notifications ADD CONSTRAINT app_notifications_type_check CHECK(type IN ('badge','level_up','challenge','lesson','course','streak','xp','purchase','system','payment_approved','payment_rejected','follow','profile_update','like','comment','post'));
ALTER TABLE public.notification_outbox DROP CONSTRAINT notification_outbox_kind_check;
ALTER TABLE public.notification_outbox ADD CONSTRAINT notification_outbox_kind_check CHECK(kind IN ('like','comment','follow','message','support','daily_goal','streak','system','admin','new_post'));
ALTER TABLE public.notification_preferences ADD COLUMN posts boolean NOT NULL DEFAULT true;
CREATE FUNCTION public.social_notification(p_user uuid,p_actor uuid,p_type text,p_title text,p_body text,p_meta jsonb,p_event text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF p_user IS NULL OR p_actor IS NULL OR p_user=p_actor OR EXISTS(SELECT 1 FROM user_blocks WHERE (blocker_id=p_user AND blocked_id=p_actor) OR (blocker_id=p_actor AND blocked_id=p_user)) THEN RETURN; END IF;
 INSERT INTO app_notifications(id,user_id,type,title,message,read,metadata,event_key) VALUES(gen_random_uuid(),p_user,p_type,p_title,left(p_body,500),false,p_meta||jsonb_build_object('actorId',p_actor::text),p_event)
 ON CONFLICT(user_id,event_key) DO NOTHING;
END $$;
CREATE FUNCTION public.notify_community_like() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE owner uuid; actor text; BEGIN
 SELECT user_id INTO owner FROM community_posts WHERE id=NEW.post_id;
 SELECT COALESCE(full_name,username,'عضو') INTO actor FROM profiles WHERE id=NEW.user_id;
 PERFORM social_notification(owner,NEW.user_id,'like','إعجاب بمنشورك',actor||' أعجب بمنشورك',jsonb_build_object('navigateTo','/discussion/'||NEW.post_id,'postId',NEW.post_id,'actorName',actor),'post-like:'||NEW.post_id||':'||NEW.user_id);
 RETURN NEW;
END $$;
CREATE TRIGGER community_like_notification AFTER INSERT ON public.community_likes FOR EACH ROW EXECUTE FUNCTION public.notify_community_like();
CREATE OR REPLACE FUNCTION public.notify_on_code_comment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE owner uuid; parent_owner uuid; actor text; route text:='/code/'||NEW.snippet_id; meta jsonb; BEGIN
 SELECT user_id INTO owner FROM code_snippets WHERE id=NEW.snippet_id AND is_public AND NOT COALESCE(is_hidden,false);
 IF NOT FOUND THEN RETURN NEW; END IF;
 SELECT user_id INTO parent_owner FROM code_comments WHERE id=NEW.parent_id AND deleted_at IS NULL;
 SELECT COALESCE(full_name,username,'عضو') INTO actor FROM profiles WHERE id=NEW.user_id;
 meta:=jsonb_build_object('navigateTo',route,'snippetId',NEW.snippet_id,'commentId',NEW.id,'parentId',NEW.parent_id,'actorName',actor);
 PERFORM social_notification(owner,NEW.user_id,'comment',CASE WHEN owner=parent_owner THEN 'رد على تعليقك' ELSE 'تعليق على كودك' END,actor||': '||left(NEW.content,140),meta,'code-comment:'||NEW.id);
 IF parent_owner IS DISTINCT FROM owner THEN PERFORM social_notification(parent_owner,NEW.user_id,'comment','رد على تعليقك',actor||': '||left(NEW.content,140),meta,'code-comment:'||NEW.id); END IF;
 RETURN NEW;
END $$;
CREATE FUNCTION public.notify_community_comment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE owner uuid; parent_owner uuid; actor text; meta jsonb; BEGIN
 SELECT user_id INTO owner FROM community_posts WHERE id=NEW.post_id AND deleted_at IS NULL AND NOT is_hidden;
 IF NOT FOUND THEN RETURN NEW; END IF;
 SELECT user_id INTO parent_owner FROM community_comments WHERE id=NEW.parent_id AND deleted_at IS NULL;
 SELECT COALESCE(full_name,username,'عضو') INTO actor FROM profiles WHERE id=NEW.user_id;
 meta:=jsonb_build_object('navigateTo','/discussion/'||NEW.post_id,'postId',NEW.post_id,'commentId',NEW.id,'parentId',NEW.parent_id,'actorName',actor);
 PERFORM social_notification(owner,NEW.user_id,'comment',CASE WHEN owner=parent_owner THEN 'رد على تعليقك' ELSE 'تعليق على منشورك' END,actor||': '||left(NEW.content,140),meta,'post-comment:'||NEW.id);
 IF parent_owner IS DISTINCT FROM owner THEN PERFORM social_notification(parent_owner,NEW.user_id,'comment','رد على تعليقك',actor||': '||left(NEW.content,140),meta,'post-comment:'||NEW.id); END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER community_comment_notification AFTER INSERT ON public.community_comments FOR EACH ROW EXECUTE FUNCTION public.notify_community_comment();
CREATE FUNCTION public.notify_followed_publication() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE kind text:=CASE WHEN TG_TABLE_NAME='code_snippets' THEN 'code' ELSE 'discussion' END; actor text; r record; BEGIN
 IF NEW.user_id IS NULL OR NEW.is_hidden THEN RETURN NEW; END IF;
 IF kind='code' THEN
  IF NOT NEW.is_public OR (TG_OP='UPDATE' AND OLD.is_public) THEN RETURN NEW; END IF;
 ELSE IF NEW.deleted_at IS NOT NULL OR TG_OP<>'INSERT' THEN RETURN NEW; END IF; END IF;
 SELECT COALESCE(full_name,username,'عضو') INTO actor FROM profiles WHERE id=NEW.user_id;
 FOR r IN SELECT follower_id FROM follows WHERE following_id=NEW.user_id LOOP
  PERFORM social_notification(r.follower_id,NEW.user_id,'post',actor||CASE WHEN kind='code' THEN ' نشر كودًا' ELSE ' نشر منشورًا' END,
   COALESCE(NULLIF(NEW.title,''),'منشور جديد'),jsonb_build_object('navigateTo','/'||kind||'/'||NEW.id,'contentType',kind,'contentId',NEW.id,'actorName',actor),'publication:'||kind||':'||NEW.id);
 END LOOP;
 RETURN NEW;
END $$;
CREATE TRIGGER code_publication_notification AFTER INSERT OR UPDATE OF is_public ON public.code_snippets FOR EACH ROW EXECUTE FUNCTION public.notify_followed_publication();
CREATE TRIGGER community_publication_notification AFTER INSERT ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.notify_followed_publication();
REVOKE ALL ON FUNCTION public.social_notification(uuid,uuid,text,text,text,jsonb,text),public.notify_community_like(),public.notify_community_comment(),public.notify_followed_publication(),public.notify_on_code_comment() FROM PUBLIC,anon,authenticated;

-- Reviewed push functions: retain limits, quiet hours and campaign behavior.
CREATE OR REPLACE FUNCTION public._push_enqueue(p_user uuid, p_kind text, p_title text, p_body text, p_data jsonb, p_dedup text, p_campaign bigint DEFAULT NULL::bigint, p_scheduled timestamp with time zone DEFAULT NULL::timestamp with time zone, p_expires timestamp with time zone DEFAULT NULL::timestamp with time zone, p_respect_quiet boolean DEFAULT true)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  p notification_preferences%ROWTYPE;
  v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
  v_when TIMESTAMPTZ := COALESCE(p_scheduled, NOW());
  v_local TIMESTAMP;
  v_hour INTEGER;
  v_deferred TIMESTAMPTZ;
  v_allowed BOOLEAN;
BEGIN
  IF p_user IS NULL THEN RETURN FALSE; END IF;
  IF NOT EXISTS (SELECT 1 FROM push_tokens WHERE user_id = p_user AND enabled) THEN RETURN FALSE; END IF;
  SELECT * INTO p FROM notification_preferences WHERE user_id = p_user;
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id) VALUES (p_user) ON CONFLICT DO NOTHING;
    SELECT * INTO p FROM notification_preferences WHERE user_id = p_user;
  END IF;
  v_allowed := CASE p_kind
    WHEN 'new_post' THEN p.posts WHEN 'like' THEN p.likes WHEN 'comment' THEN p.comments WHEN 'follow' THEN p.follows
    WHEN 'message' THEN p.messages WHEN 'daily_goal' THEN p.daily_goal WHEN 'streak' THEN p.streak
    WHEN 'admin' THEN p.admin WHEN 'support' THEN p.system WHEN 'system' THEN p.system ELSE FALSE END;
  IF NOT v_allowed THEN RETURN FALSE; END IF;

  -- حد معدل لإشعارات التفاعل الاجتماعي
  IF p_kind IN ('like', 'comment', 'follow', 'new_post') AND (
    SELECT COUNT(*) FROM notification_outbox
    WHERE user_id = p_user AND kind IN ('like', 'comment', 'follow', 'new_post') AND created_at > NOW() - INTERVAL '1 hour'
  ) >= COALESCE((_coin_cfg('push')->>'social_per_hour')::int, 10) THEN
    RETURN FALSE;
  END IF;

  -- ساعات الهدوء: تؤجَّل الأنواع غير العاجلة لنهايتها؛ الرسائل الخاصة والدعم والنظام فورية،
  -- والموعد الذي حدّده المشرف صريحاً (p_respect_quiet = FALSE) يُحترم كما هو
  IF p_respect_quiet AND p_kind NOT IN ('message', 'support', 'system') THEN
    v_local := v_when AT TIME ZONE v_tz;
    v_hour := EXTRACT(HOUR FROM v_local);
    IF (p.quiet_start > p.quiet_end AND (v_hour >= p.quiet_start OR v_hour < p.quiet_end))
       OR (p.quiet_start < p.quiet_end AND v_hour >= p.quiet_start AND v_hour < p.quiet_end) THEN
      v_local := date_trunc('day', v_local) + make_interval(hours => p.quiet_end)
                 + CASE WHEN v_hour >= p.quiet_end AND p.quiet_start > p.quiet_end THEN INTERVAL '1 day' ELSE INTERVAL '0' END;
      v_deferred := v_local AT TIME ZONE v_tz;
      -- لا نؤجّل إلى ما بعد انتهاء الصلاحية، وإلا أُلغي بصمت ولم يصل أبداً
      IF p_expires IS NULL OR v_deferred < p_expires THEN
        v_when := v_deferred;
      END IF;
    END IF;
  END IF;

  INSERT INTO notification_outbox (user_id, kind, title, body, data, dedup_key, campaign_id, scheduled_at, expires_at)
  VALUES (p_user, p_kind, LEFT(p_title, 120), LEFT(p_body, 500), COALESCE(p_data, '{}'::jsonb), p_dedup, p_campaign, v_when, p_expires)
  ON CONFLICT (dedup_key) DO NOTHING;
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public._push_from_app_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE v_url TEXT := NEW.metadata->>'navigateTo';
BEGIN
  IF NEW.type IN ('like', 'comment', 'follow', 'post') AND current_user NOT IN ('anon', 'authenticated') THEN
    PERFORM _push_enqueue(NEW.user_id, CASE WHEN NEW.type='post' THEN 'new_post' ELSE NEW.type END, NEW.title, NEW.message,
      NEW.metadata || jsonb_build_object('url', COALESCE(v_url, '/'), 'notification_id', NEW.id), 'appn:' || NEW.id::text);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notification_prefs_set(p_prefs JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'code', 'not_authenticated'); END IF;
  INSERT INTO notification_preferences (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
  UPDATE notification_preferences SET
    posts = COALESCE((p_prefs->>'posts')::boolean, posts),
    daily_goal = COALESCE((p_prefs->>'daily_goal')::boolean, daily_goal),
    streak = COALESCE((p_prefs->>'streak')::boolean, streak),
    likes = COALESCE((p_prefs->>'likes')::boolean, likes),
    comments = COALESCE((p_prefs->>'comments')::boolean, comments),
    follows = COALESCE((p_prefs->>'follows')::boolean, follows),
    messages = COALESCE((p_prefs->>'messages')::boolean, messages),
    system = COALESCE((p_prefs->>'system')::boolean, system),
    admin = COALESCE((p_prefs->>'admin')::boolean, admin),
    quiet_start = COALESCE(LEAST(GREATEST((p_prefs->>'quiet_start')::int, 0), 23)::smallint, quiet_start),
    quiet_end = COALESCE(LEAST(GREATEST((p_prefs->>'quiet_end')::int, 0), 23)::smallint, quiet_end),
    reminder_hour = COALESCE(LEAST(GREATEST((p_prefs->>'reminder_hour')::int, 0), 23)::smallint, reminder_hour),
    updated_at = NOW()
  WHERE user_id = v_uid;
  RETURN notification_prefs_get();
END;
$$;;

CREATE OR REPLACE FUNCTION public.community_feed(p_filter text DEFAULT 'all'::text, p_search text DEFAULT ''::text, p_language text DEFAULT 'all'::text, p_sort text DEFAULT 'recent'::text, p_cursor jsonb DEFAULT NULL::jsonb, p_snapshot timestamp with time zone DEFAULT NULL::timestamp with time zone, p_limit integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE result jsonb; snap timestamptz:=COALESCE(p_snapshot,now()); n integer:=LEAST(GREATEST(p_limit,1),40); needle text:='%'||replace(replace(replace(left(btrim(p_search),120),'\','\\'),'%','\%'),'_','\_')||'%'; BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authorized' USING ERRCODE='42501'; END IF;
  IF p_filter NOT IN ('all','code','discussion') OR p_sort NOT IN ('recent','popular','most_liked','most_viewed') THEN RAISE EXCEPTION 'invalid_filter'; END IF;
  WITH combined AS (
    SELECT 'code'::text AS type,s.id,s.created_at,
      CASE WHEN p_filter<>'code' THEN 0 WHEN p_sort='popular' THEN COALESCE(s.likes_count,0)+COALESCE(s.comments_count,0) WHEN p_sort='most_liked' THEN COALESCE(s.likes_count,0) WHEN p_sort='most_viewed' THEN COALESCE(s.views_count,0) ELSE 0 END::bigint AS rank,
      to_jsonb(s)||jsonb_build_object('profiles',jsonb_build_object('username',pr.username,'full_name',pr.full_name,'avatar_url',pr.avatar_url,'is_verified',pr.is_verified)) AS payload
    FROM code_snippets s LEFT JOIN profiles pr ON pr.id=s.user_id
    WHERE p_filter IN ('all','code') AND s.is_public AND NOT COALESCE(s.is_hidden,false) AND s.created_at<=snap AND NOT is_blocked_with(s.user_id)
      AND (p_filter<>'code' OR p_language='all' OR s.language=p_language)
      AND (btrim(p_search)='' OR s.title ILIKE needle OR s.description ILIKE needle)
    UNION ALL
    SELECT 'discussion',p.id,p.created_at,0::bigint,to_jsonb(p)||jsonb_build_object('liked_by_me',EXISTS(SELECT 1 FROM community_likes cl WHERE cl.post_id=p.id AND cl.user_id=auth.uid()),'profiles',jsonb_build_object('username',pr.username,'full_name',pr.full_name,'avatar_url',pr.avatar_url,'is_verified',pr.is_verified))
    FROM community_posts p LEFT JOIN profiles pr ON pr.id=p.user_id
    WHERE p_filter IN ('all','discussion') AND p.created_at<=snap AND community_readable(p.id)
      AND (btrim(p_search)='' OR p.title ILIKE needle OR p.body ILIKE needle OR p.topic ILIKE needle OR p.language ILIKE needle OR p.code ILIKE needle)
  ), page AS (
    SELECT * FROM combined WHERE p_cursor IS NULL OR (rank,created_at,type,id)<((p_cursor->>'rank')::bigint,(p_cursor->>'created_at')::timestamptz,p_cursor->>'type',(p_cursor->>'id')::uuid)
    ORDER BY rank DESC,created_at DESC,type DESC,id DESC LIMIT n+1
  ), visible AS (SELECT * FROM page ORDER BY rank DESC,created_at DESC,type DESC,id DESC LIMIT n)
  SELECT jsonb_build_object('items',COALESCE((SELECT jsonb_agg(jsonb_build_object('type',type,'id',id,'data',payload) ORDER BY rank DESC,created_at DESC,type DESC,id DESC) FROM visible),'[]'::jsonb),
    'snapshot',snap,'next',CASE WHEN (SELECT count(*) FROM page)>n THEN (SELECT jsonb_build_object('rank',rank,'created_at',created_at,'type',type,'id',id) FROM visible ORDER BY rank,created_at,type,id LIMIT 1) ELSE NULL END) INTO result;
  RETURN result;
END $function$;
-- Recheck current visibility, blocking, and publication preferences at dispatch.
CREATE FUNCTION public.social_delivery_allowed(p_user uuid,p_kind text,p_meta jsonb) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE typ text; target uuid; actor uuid; comment uuid; BEGIN
 IF p_kind='new_post' AND NOT COALESCE((SELECT posts FROM notification_preferences WHERE user_id=p_user),true) THEN RETURN false; END IF;
 actor:=NULLIF(p_meta->>'actorId','')::uuid;
 IF actor IS NOT NULL AND EXISTS(SELECT 1 FROM user_blocks WHERE (blocker_id=p_user AND blocked_id=actor) OR (blocker_id=actor AND blocked_id=p_user)) THEN RETURN false; END IF;
 typ:=CASE WHEN p_meta->>'contentType' IN ('code','discussion') THEN p_meta->>'contentType' WHEN p_meta?'snippetId' THEN 'code' WHEN p_meta?'postId' THEN 'discussion' END;
 target:=COALESCE(NULLIF(p_meta->>'contentId',''),NULLIF(p_meta->>'snippetId',''),NULLIF(p_meta->>'postId',''))::uuid;
 IF typ IS NOT NULL AND NOT shared_content_readable(typ,target,p_user) THEN RETURN false; END IF;
 comment:=NULLIF(p_meta->>'commentId','')::uuid;
 IF comment IS NOT NULL AND ((typ='code' AND NOT EXISTS(SELECT 1 FROM code_comments WHERE id=comment AND deleted_at IS NULL)) OR (typ='discussion' AND NOT EXISTS(SELECT 1 FROM community_comments WHERE id=comment AND deleted_at IS NULL AND NOT is_hidden))) THEN RETURN false; END IF;
 RETURN true;
EXCEPTION WHEN invalid_text_representation THEN RETURN false;
END $$;
REVOKE ALL ON FUNCTION public.social_delivery_allowed(uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.push_claim_batch(p_limit INTEGER DEFAULT 200)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_rows JSONB;
BEGIN
  -- منتهية الصلاحية أو حملات ملغاة
  UPDATE notification_outbox SET status = 'cancelled', last_error = 'expired'
  WHERE status = 'queued' AND expires_at IS NOT NULL AND expires_at < NOW();
  -- عالقة في sending (انقطاع سابق) تعود للطابور
  UPDATE notification_outbox SET status = 'queued'
  WHERE status = 'sending' AND sent_at IS NULL AND created_at < NOW() - INTERVAL '10 minutes'
    AND attempts < COALESCE((_coin_cfg('push')->>'max_attempts')::int, 3);
  UPDATE notification_outbox o SET status='cancelled',last_error='social_content_unavailable' WHERE status='queued' AND kind IN ('like','comment','follow','new_post') AND NOT social_delivery_allowed(o.user_id,o.kind,o.data);

  WITH picked AS (
    SELECT id FROM notification_outbox
    WHERE status = 'queued' AND scheduled_at <= NOW()
    ORDER BY scheduled_at
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 200), 1), 500)
    FOR UPDATE SKIP LOCKED
  ), upd AS (
    UPDATE notification_outbox o SET status = 'sending', attempts = attempts + 1
    FROM picked WHERE o.id = picked.id
    RETURNING o.id, o.user_id, o.kind, o.title, o.body, o.data, o.campaign_id
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'id', u.id, 'kind', u.kind, 'title', u.title, 'body', u.body, 'data', u.data,
           'image', (SELECT c.image_url FROM notification_campaigns c WHERE c.id = u.campaign_id),
           'tokens', COALESCE((SELECT jsonb_agg(t.token) FROM push_tokens t WHERE t.user_id = u.user_id AND t.enabled), '[]'::jsonb))), '[]'::jsonb)
  INTO v_rows FROM upd u;
  RETURN v_rows;
END;
$$;
CREATE OR REPLACE FUNCTION public.notify_on_new_follow() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE actor text; handle text; BEGIN
 SELECT COALESCE(full_name,username,'عضو'),username INTO actor,handle FROM profiles WHERE id=NEW.follower_id;
 PERFORM insert_interaction_notification(NEW.following_id,'follow','متابع جديد',actor||' بدأ بمتابعتك',
 jsonb_build_object('actorId',NEW.follower_id::text,'actorName',actor,'navigateTo','/user/'||COALESCE(handle,NEW.follower_id::text)));
 RETURN NEW;
END $$;
COMMIT;

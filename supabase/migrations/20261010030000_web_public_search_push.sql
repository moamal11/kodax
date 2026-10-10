BEGIN;
-- Anonymous web reads are deliberately projected through RPCs, not raw profile grants.
CREATE FUNCTION public.public_web_author(p_user uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT jsonb_build_object('username',username,'full_name',full_name,'avatar_url',avatar_url,'is_verified',is_verified)
 FROM profiles WHERE id=p_user AND NOT COALESCE(is_banned,false);
$$;
REVOKE ALL ON FUNCTION public.public_web_author(uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.public_web_document(p_kind text,p_key text) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE v jsonb; uid uuid;
BEGIN
 IF length(p_key)>120 THEN RETURN NULL; END IF;
 IF p_kind='user' THEN
  SELECT id INTO uid FROM profiles WHERE (lower(username)=lower(p_key) OR id::text=p_key) AND NOT COALESCE(is_banned,false) LIMIT 1;
  SELECT jsonb_build_object('id',p.id,'username',p.username,'full_name',p.full_name,'avatar_url',p.avatar_url,'cover_url',p.cover_url,'bio',p.bio,
   'followers_visible',p.followers_visible,'following_visible',p.following_visible,'followers_count',p.followers_count,'following_count',p.following_count,
   'xp',p.xp,'level',p.level,'created_at',p.created_at,'is_verified',p.is_verified,
   'snippets',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',s.id,'title',s.title)) FROM (SELECT id,title FROM code_snippets WHERE user_id=p.id AND is_public AND NOT COALESCE(is_hidden,false) ORDER BY created_at DESC LIMIT 30) s),'[]'::jsonb)) INTO v FROM profiles p WHERE p.id=uid;
 ELSIF p_kind='code' THEN
  SELECT jsonb_build_object('id',s.id,'user_id',s.user_id,'title',s.title,'description',s.description,'code',s.code,'language',s.language,'likes_count',s.likes_count,'comments_count',s.comments_count,'views_count',s.views_count,'is_public',true,'created_at',s.created_at,'updated_at',s.updated_at,'profiles',public_web_author(s.user_id)) INTO v
  FROM code_snippets s WHERE s.id::text=p_key AND s.is_public AND NOT COALESCE(s.is_hidden,false) AND EXISTS(SELECT 1 FROM profiles WHERE id=s.user_id AND NOT COALESCE(is_banned,false));
 ELSIF p_kind='discussion' THEN
  SELECT jsonb_build_object('id',s.id,'user_id',s.user_id,'title',s.title,'body',s.body,'kind',s.kind,'image_path',s.image_path,'code',s.code,'language',s.language,'topic',s.topic,'likes_count',s.likes_count,'comments_count',s.comments_count,'accepted_comment_id',s.accepted_comment_id,'created_at',s.created_at,'updated_at',s.updated_at,'edited_at',s.edited_at,'profiles',public_web_author(s.user_id),'liked_by_me',false) INTO v
  FROM community_posts s WHERE s.id::text=p_key AND s.deleted_at IS NULL AND NOT s.is_hidden AND (s.user_id IS NULL OR EXISTS(SELECT 1 FROM profiles WHERE id=s.user_id AND NOT COALESCE(is_banned,false)));
 END IF;
 RETURN v;
END $$;

CREATE FUNCTION public.public_web_comments(p_kind text,p_id text) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE v jsonb;
BEGIN
 IF public_web_document(p_kind,p_id) IS NULL THEN RETURN '[]'::jsonb; END IF;
 IF p_kind='code' THEN
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id',c.id,'user_id',c.user_id,'snippet_id',c.snippet_id,'content',c.content,'parent_id',c.parent_id,'created_at',c.created_at,'updated_at',c.updated_at,'edited_at',c.edited_at,'deleted_at',c.deleted_at,'profiles',public_web_author(c.user_id)) ORDER BY c.created_at,c.id),'[]'::jsonb) INTO v FROM code_comments c WHERE c.snippet_id::text=p_id AND c.deleted_at IS NULL AND (c.user_id IS NULL OR public_web_author(c.user_id) IS NOT NULL);
 ELSIF p_kind='discussion' THEN
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id',c.id,'user_id',c.user_id,'post_id',c.post_id,'content',c.content,'parent_id',c.parent_id,'created_at',c.created_at,'updated_at',c.updated_at,'edited_at',c.edited_at,'deleted_at',c.deleted_at,'profiles',public_web_author(c.user_id)) ORDER BY c.created_at,c.id),'[]'::jsonb) INTO v FROM community_comments c WHERE c.post_id::text=p_id AND c.deleted_at IS NULL AND NOT c.is_hidden AND (c.user_id IS NULL OR public_web_author(c.user_id) IS NOT NULL);
 END IF;
 RETURN COALESCE(v,'[]'::jsonb);
END $$;

CREATE FUNCTION public.public_web_feed(p_filter text DEFAULT 'all',p_search text DEFAULT '',p_language text DEFAULT 'all',p_sort text DEFAULT 'recent',p_cursor jsonb DEFAULT NULL,p_snapshot timestamptz DEFAULT NULL,p_limit integer DEFAULT 20,p_user uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb; lastrow jsonb; snap timestamptz:=COALESCE(p_snapshot,now()); lim integer:=least(greatest(p_limit,1),50);
BEGIN
 WITH items AS (
  SELECT 'code'::text type,s.id,s.created_at,CASE WHEN p_sort IN ('popular','most_liked') THEN s.likes_count WHEN p_sort='most_viewed' THEN s.views_count ELSE 0 END::bigint rank
  FROM code_snippets s WHERE p_filter IN ('all','code') AND s.is_public AND NOT COALESCE(s.is_hidden,false) AND (p_user IS NULL OR s.user_id=p_user) AND s.created_at<=snap
   AND EXISTS(SELECT 1 FROM profiles WHERE id=s.user_id AND NOT COALESCE(is_banned,false))
   AND (COALESCE(p_language,'all') IN ('all','') OR s.language=p_language OR (p_language='web' AND s.language IN ('html','css','web')))
   AND (COALESCE(p_search,'')='' OR s.title ILIKE '%'||left(p_search,100)||'%' OR s.description ILIKE '%'||left(p_search,100)||'%')
  UNION ALL
  SELECT 'discussion',s.id,s.created_at,CASE WHEN p_sort IN ('popular','most_liked') THEN s.likes_count ELSE 0 END::bigint
  FROM community_posts s WHERE p_filter IN ('all','discussion') AND s.deleted_at IS NULL AND NOT s.is_hidden AND (p_user IS NULL OR s.user_id=p_user) AND s.created_at<=snap
   AND (s.user_id IS NULL OR EXISTS(SELECT 1 FROM profiles WHERE id=s.user_id AND NOT COALESCE(is_banned,false)))
   AND (COALESCE(p_language,'all') IN ('all','') OR s.language=p_language)
   AND (COALESCE(p_search,'')='' OR s.title ILIKE '%'||left(p_search,100)||'%' OR s.body ILIKE '%'||left(p_search,100)||'%')
 ), page AS (SELECT * FROM items WHERE p_cursor IS NULL OR (rank,created_at,type,id)<((p_cursor->>'rank')::bigint,(p_cursor->>'created_at')::timestamptz,p_cursor->>'type',(p_cursor->>'id')::uuid) ORDER BY rank DESC,created_at DESC,type DESC,id DESC LIMIT lim)
 SELECT COALESCE(jsonb_agg(jsonb_build_object('type',type,'id',id,'rank',rank,'created_at',created_at,'data',public_web_document(CASE WHEN type='code' THEN 'code' ELSE 'discussion' END,id::text)) ORDER BY rank DESC,created_at DESC,type DESC,id DESC),'[]'::jsonb) INTO result FROM page;
 lastrow:=result->(jsonb_array_length(result)-1);
 RETURN jsonb_build_object('items',result,'snapshot',snap,'next',CASE WHEN jsonb_array_length(result)=lim THEN lastrow-'data' ELSE NULL END);
END $$;

CREATE FUNCTION public.public_web_urls(p_kind text,p_page integer DEFAULT 0,p_limit integer DEFAULT 1000) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT COALESCE(jsonb_agg(r),'[]'::jsonb) FROM (
 SELECT path,updated FROM (
 SELECT '/user/'||username path,created_at updated FROM profiles WHERE p_kind='user' AND username IS NOT NULL AND NOT COALESCE(is_banned,false)
 UNION ALL SELECT '/code/'||s.id,s.updated_at FROM code_snippets s WHERE p_kind='code' AND s.is_public AND NOT COALESCE(s.is_hidden,false) AND EXISTS(SELECT 1 FROM profiles WHERE id=s.user_id AND NOT COALESCE(is_banned,false))
 UNION ALL SELECT '/discussion/'||s.id,s.updated_at FROM community_posts s WHERE p_kind='discussion' AND s.deleted_at IS NULL AND NOT s.is_hidden AND (s.user_id IS NULL OR EXISTS(SELECT 1 FROM profiles WHERE id=s.user_id AND NOT COALESCE(is_banned,false)))
 ) urls ORDER BY path LIMIT least(greatest(p_limit,1),1000) OFFSET least(greatest(p_page,0),1000)*least(greatest(p_limit,1),1000)) r;
$$;
CREATE FUNCTION public.public_web_url_counts() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT jsonb_build_object('user',(SELECT count(*) FROM profiles WHERE username IS NOT NULL AND NOT COALESCE(is_banned,false)),'code',(SELECT count(*) FROM code_snippets s WHERE s.is_public AND NOT COALESCE(s.is_hidden,false) AND EXISTS(SELECT 1 FROM profiles WHERE id=s.user_id AND NOT COALESCE(is_banned,false))),'discussion',(SELECT count(*) FROM community_posts s WHERE s.deleted_at IS NULL AND NOT s.is_hidden AND (s.user_id IS NULL OR EXISTS(SELECT 1 FROM profiles WHERE id=s.user_id AND NOT COALESCE(is_banned,false)))));
$$;
DO $$ DECLARE f text; BEGIN FOREACH f IN ARRAY ARRAY['public_web_document(text,text)','public_web_comments(text,text)','public_web_feed(text,text,text,text,jsonb,timestamptz,integer,uuid)','public_web_urls(text,integer,integer)','public_web_url_counts()'] LOOP EXECUTE 'REVOKE ALL ON FUNCTION public.'||f||' FROM PUBLIC'; EXECUTE 'GRANT EXECUTE ON FUNCTION public.'||f||' TO anon,authenticated,service_role'; END LOOP; END $$;
CREATE POLICY community_web_image_read ON storage.objects FOR SELECT TO anon USING(bucket_id='community-images' AND EXISTS(SELECT 1 FROM public.community_posts p WHERE p.image_path=name AND p.deleted_at IS NULL AND NOT p.is_hidden AND (p.user_id IS NULL OR EXISTS(SELECT 1 FROM public.profiles WHERE id=p.user_id AND NOT COALESCE(is_banned,false)))));
-- The storage policy is evaluated with invoker permissions: use a narrow helper instead of granting raw tables.
CREATE FUNCTION public.public_web_image_allowed(p_path text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM community_posts p WHERE p.image_path=p_path AND p.deleted_at IS NULL AND NOT p.is_hidden AND (p.user_id IS NULL OR EXISTS(SELECT 1 FROM profiles WHERE id=p.user_id AND NOT COALESCE(is_banned,false)))); $$;
REVOKE ALL ON FUNCTION public.public_web_image_allowed(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_web_image_allowed(text) TO anon,authenticated;
ALTER POLICY community_web_image_read ON storage.objects USING(bucket_id='community-images' AND public.public_web_image_allowed(name));

CREATE TABLE public.web_push_config(id boolean PRIMARY KEY DEFAULT true CHECK(id),public_key text NOT NULL);
ALTER TABLE public.web_push_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.web_push_config FROM anon,authenticated;
CREATE FUNCTION public.web_push_public_key() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public_key FROM web_push_config WHERE id; $$;
REVOKE ALL ON FUNCTION public.web_push_public_key() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.web_push_public_key() TO anon,authenticated;
CREATE TABLE public.web_push_subscriptions(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,endpoint text NOT NULL UNIQUE,p256dh text NOT NULL,auth text NOT NULL,enabled boolean NOT NULL DEFAULT true,last_seen timestamptz NOT NULL DEFAULT now(),created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.web_push_subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.web_push_subscriptions FROM anon,authenticated;
GRANT ALL ON public.web_push_subscriptions,public.web_push_config TO service_role;
CREATE INDEX web_push_users ON public.web_push_subscriptions(user_id) WHERE enabled;
CREATE FUNCTION public.web_push_register(p_endpoint text,p_p256dh text,p_auth text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=auth.uid(); BEGIN
 IF u IS NULL OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=u AND NOT COALESCE(is_banned,false)) THEN RAISE EXCEPTION 'not_authenticated' USING ERRCODE='42501'; END IF;
 IF length(p_endpoint)>2048 OR p_endpoint !~ '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|updates\.push\.services\.mozilla\.org|[A-Za-z0-9-]+\.notify\.windows\.com|web\.push\.apple\.com)/[^[:space:]]+$' OR p_p256dh !~ '^[A-Za-z0-9_-]{87}=?$' OR p_auth !~ '^[A-Za-z0-9_-]{22}=?=?$' THEN RAISE EXCEPTION 'invalid_subscription' USING ERRCODE='22023'; END IF;
 IF (SELECT count(*) FROM web_push_subscriptions WHERE user_id=u AND enabled AND endpoint<>p_endpoint)>=5 THEN RAISE EXCEPTION 'device_limit'; END IF;
 INSERT INTO web_push_subscriptions(user_id,endpoint,p256dh,auth) VALUES(u,p_endpoint,p_p256dh,p_auth) ON CONFLICT(endpoint) DO UPDATE SET user_id=u,p256dh=excluded.p256dh,auth=excluded.auth,enabled=true,last_seen=now();
 RETURN jsonb_build_object('success',true);
END $$;
CREATE FUNCTION public.web_push_unregister(p_endpoint text) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ UPDATE web_push_subscriptions SET enabled=false WHERE user_id=auth.uid() AND endpoint=p_endpoint; $$;
REVOKE ALL ON FUNCTION public.web_push_register(text,text,text),public.web_push_unregister(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.web_push_register(text,text,text),public.web_push_unregister(text) TO authenticated;

CREATE TABLE public.web_push_outbox(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,source_id bigint NOT NULL REFERENCES notification_outbox(id) ON DELETE CASCADE,subscription_id bigint NOT NULL REFERENCES web_push_subscriptions(id) ON DELETE CASCADE,status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sending','sent','failed','skipped')),attempts smallint NOT NULL DEFAULT 0,scheduled_at timestamptz NOT NULL,claimed_at timestamptz,last_error text,UNIQUE(source_id,subscription_id));
ALTER TABLE public.web_push_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.web_push_outbox FROM anon,authenticated;
GRANT ALL ON public.web_push_outbox TO service_role;
CREATE INDEX web_push_due ON web_push_outbox(scheduled_at) WHERE status IN ('queued','sending');
CREATE FUNCTION public._queue_web_push() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN INSERT INTO web_push_outbox(source_id,subscription_id,scheduled_at) SELECT NEW.id,id,NEW.scheduled_at FROM web_push_subscriptions WHERE user_id=NEW.user_id AND enabled ON CONFLICT DO NOTHING; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public._queue_web_push() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER queue_web_push AFTER INSERT ON public.notification_outbox FOR EACH ROW EXECUTE FUNCTION public._queue_web_push();
-- Only expand device eligibility. Preserve the reviewed native preferences, economy and timing.
DO $$ DECLARE def text; sig text:='public._push_enqueue(uuid,text,text,text,jsonb,text,bigint,timestamptz,timestamptz,boolean)'; BEGIN
 def:=pg_get_functiondef(sig::regprocedure);
 IF position('IF NOT EXISTS (SELECT 1 FROM push_tokens WHERE user_id = p_user AND enabled) THEN RETURN FALSE; END IF;' IN def)=0 THEN RAISE EXCEPTION 'Unexpected push enqueue definition; review required'; END IF;
 EXECUTE replace(def,'IF NOT EXISTS (SELECT 1 FROM push_tokens WHERE user_id = p_user AND enabled) THEN RETURN FALSE; END IF;','IF NOT EXISTS (SELECT 1 FROM push_tokens WHERE user_id = p_user AND enabled) AND NOT EXISTS (SELECT 1 FROM web_push_subscriptions WHERE user_id = p_user AND enabled) THEN RETURN FALSE; END IF;');
END $$;
CREATE FUNCTION public.web_push_claim(p_limit integer DEFAULT 100) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v jsonb; BEGIN
 UPDATE web_push_outbox SET status='queued' WHERE status='sending' AND claimed_at<now()-interval '5 minutes' AND attempts<3;
 UPDATE web_push_outbox SET status='failed',last_error='attempt_limit' WHERE status='sending' AND claimed_at<now()-interval '5 minutes' AND attempts>=3;
 WITH due AS (SELECT w.id FROM web_push_outbox w WHERE w.status='queued' AND w.scheduled_at<=now() ORDER BY w.id LIMIT least(greatest(p_limit,1),100) FOR UPDATE SKIP LOCKED), claimed AS (UPDATE web_push_outbox w SET status='sending',attempts=attempts+1,claimed_at=now() FROM due WHERE w.id=due.id RETURNING w.*)
 SELECT COALESCE(jsonb_agg(jsonb_build_object('id',w.id,'subscription_id',s.id,'endpoint',s.endpoint,'keys',jsonb_build_object('p256dh',s.p256dh,'auth',s.auth),'title',o.title,'body',CASE WHEN o.kind='message' THEN 'وصلتك رسالة جديدة في Kodax' ELSE o.body END,'data',o.data,'expired',NOT s.enabled OR s.user_id<>o.user_id OR o.status='cancelled' OR (o.expires_at IS NOT NULL AND o.expires_at<=now()))),'[]'::jsonb) INTO v FROM claimed w JOIN web_push_subscriptions s ON s.id=w.subscription_id JOIN notification_outbox o ON o.id=w.source_id;
 RETURN v;
END $$;
CREATE FUNCTION public.web_push_result(p_id bigint,p_status text,p_error text DEFAULT NULL,p_invalid boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF p_invalid THEN UPDATE web_push_subscriptions SET enabled=false WHERE id=(SELECT subscription_id FROM web_push_outbox WHERE id=p_id); END IF;
 UPDATE web_push_outbox SET status=CASE WHEN p_status IN ('sent','skipped') THEN p_status WHEN attempts>=3 OR p_invalid THEN 'failed' ELSE 'queued' END,last_error=left(p_error,150),scheduled_at=CASE WHEN p_status='failed' THEN now()+interval '2 minutes' ELSE scheduled_at END WHERE id=p_id AND status='sending';
END $$;
REVOKE ALL ON FUNCTION public.web_push_claim(integer),public.web_push_result(bigint,text,text,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.web_push_claim(integer),public.web_push_result(bigint,text,text,boolean) TO service_role;
-- Separate web job: native delivery and its existing cron remain intact.
DO $$ BEGIN IF to_regnamespace('cron') IS NOT NULL AND to_regnamespace('vault') IS NOT NULL THEN
 PERFORM cron.schedule('kodax-web-push-send','* * * * *',$job$ SELECT net.http_post(url:='https://krtulodnhmfuoxjqajwl.supabase.co/functions/v1/web-push-send',headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',COALESCE((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='push_cron_secret' LIMIT 1),'')),body:='{}'::jsonb,timeout_milliseconds:=25000) WHERE EXISTS(SELECT 1 FROM public.web_push_outbox WHERE status='queued' AND scheduled_at<=now() OR status='sending' AND claimed_at<now()-interval '5 minutes'); $job$);
END IF; END $$;
COMMIT;

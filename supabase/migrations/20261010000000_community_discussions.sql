BEGIN;
-- Separate discussion records leave the existing code model and reward economy intact.
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY, user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  body text NOT NULL DEFAULT '' CHECK (char_length(body)<=5000),
  kind text NOT NULL CHECK (kind IN ('question','discussion','experience')),
  image_path text, code text NOT NULL DEFAULT '' CHECK (char_length(code)<=10000),
  language text CHECK (char_length(language)<=32), topic text CHECK (char_length(topic)<=60),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz, deleted_at timestamptz, is_hidden boolean NOT NULL DEFAULT false,
  comments_count integer NOT NULL DEFAULT 0 CHECK(comments_count>=0), accepted_comment_id uuid,
  CHECK (deleted_at IS NOT NULL OR length(btrim(body))>0 OR length(btrim(code))>0 OR image_path IS NOT NULL),
  CHECK(image_path IS NULL OR (image_path LIKE user_id::text || '/%' AND image_path NOT LIKE '%..%'))
);
CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY, post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id uuid REFERENCES public.community_comments(id) ON DELETE RESTRICT,
  content text NOT NULL CHECK(deleted_at IS NOT NULL OR char_length(btrim(content)) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz, deleted_at timestamptz, is_hidden boolean NOT NULL DEFAULT false
);
ALTER TABLE public.community_posts ADD CONSTRAINT community_solution_fk FOREIGN KEY(accepted_comment_id) REFERENCES public.community_comments(id) ON DELETE SET NULL;
CREATE INDEX community_posts_feed ON public.community_posts(created_at DESC,id DESC) WHERE deleted_at IS NULL AND NOT is_hidden;
CREATE INDEX community_posts_owner ON public.community_posts(user_id);
CREATE INDEX community_comments_thread ON public.community_comments(post_id,created_at,id);
CREATE INDEX community_comments_parent ON public.community_comments(parent_id);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
-- No raw client writes: all identities, counters, timestamps and solutions are server derived.
REVOKE ALL ON public.community_posts,public.community_comments FROM anon,authenticated;
GRANT SELECT ON public.community_posts,public.community_comments TO authenticated;
GRANT ALL ON public.community_posts,public.community_comments TO service_role;
CREATE FUNCTION public.community_readable(p_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS(SELECT 1 FROM community_posts p WHERE p.id=p_id AND p.deleted_at IS NULL AND NOT p.is_hidden AND (p.user_id IS NULL OR NOT is_blocked_with(p.user_id)));
$$;
REVOKE ALL ON FUNCTION public.community_readable(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.community_readable(uuid) TO authenticated,service_role;
CREATE POLICY community_posts_read ON public.community_posts FOR SELECT TO authenticated USING (community_readable(id));
CREATE POLICY community_comments_read ON public.community_comments FOR SELECT TO authenticated USING (community_readable(post_id) AND NOT is_hidden AND (user_id IS NULL OR NOT is_blocked_with(user_id)));
CREATE FUNCTION public._community_writer() RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=auth.uid(); BEGIN
  IF u IS NULL OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=u AND NOT COALESCE(is_banned,false)) THEN RAISE EXCEPTION 'not_authorized' USING ERRCODE='42501'; END IF;
  RETURN u;
END $$;
REVOKE ALL ON FUNCTION public._community_writer() FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.save_community_post(p_id uuid,p_title text,p_body text,p_kind text,p_image_path text DEFAULT NULL,p_code text DEFAULT '',p_language text DEFAULT NULL,p_topic text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=_community_writer(); old community_posts; BEGIN
  SELECT * INTO old FROM community_posts WHERE id=p_id FOR UPDATE;
  IF FOUND AND (old.user_id IS DISTINCT FROM u OR old.deleted_at IS NOT NULL OR old.is_hidden) THEN RAISE EXCEPTION 'post_not_owned' USING ERRCODE='42501'; END IF;
  IF p_image_path IS NOT NULL AND (p_image_path NOT LIKE u::text || '/%' OR p_image_path LIKE '%..%' OR NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='community-images' AND name=p_image_path)) THEN RAISE EXCEPTION 'invalid_image' USING ERRCODE='42501'; END IF;
  -- The same client UUID and payload is a harmless retry after a lost response.
  IF old.id IS NULL THEN
    INSERT INTO community_posts(id,user_id,title,body,kind,image_path,code,language,topic) VALUES(p_id,u,btrim(p_title),btrim(COALESCE(p_body,'')),p_kind,p_image_path,COALESCE(p_code,''),NULLIF(btrim(p_language),''),NULLIF(btrim(p_topic),''));
  ELSIF (old.title,old.body,old.kind,old.image_path,old.code,old.language,old.topic) IS DISTINCT FROM (btrim(p_title),btrim(COALESCE(p_body,'')),p_kind,p_image_path,COALESCE(p_code,''),NULLIF(btrim(p_language),''),NULLIF(btrim(p_topic),'')) THEN
    UPDATE community_posts SET title=btrim(p_title),body=btrim(COALESCE(p_body,'')),kind=p_kind,image_path=p_image_path,code=COALESCE(p_code,''),language=NULLIF(btrim(p_language),''),topic=NULLIF(btrim(p_topic),''),updated_at=now(),edited_at=now(),accepted_comment_id=CASE WHEN p_kind='question' THEN accepted_comment_id ELSE NULL END WHERE id=p_id;
  END IF;
  RETURN p_id;
END $$;
CREATE FUNCTION public.delete_community_post(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=_community_writer(); BEGIN
  UPDATE community_posts SET deleted_at=COALESCE(deleted_at,now()),body='',code='',image_path=NULL,accepted_comment_id=NULL,updated_at=now() WHERE id=p_id AND user_id=u;
  IF NOT FOUND THEN RAISE EXCEPTION 'post_not_owned' USING ERRCODE='42501'; END IF;
END $$;
CREATE FUNCTION public.save_community_comment(p_id uuid,p_post uuid,p_content text,p_parent uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=_community_writer(); old community_comments; par community_comments; BEGIN
  -- Lock order is post then comments for both solution changes and thread mutations.
  PERFORM 1 FROM community_posts WHERE id=p_post FOR UPDATE;
  IF NOT community_readable(p_post) THEN RAISE EXCEPTION 'post_unavailable' USING ERRCODE='42501'; END IF;
  SELECT * INTO old FROM community_comments WHERE id=p_id;
  IF FOUND THEN
    IF old.user_id IS DISTINCT FROM u OR old.post_id<>p_post OR old.parent_id IS DISTINCT FROM p_parent OR old.content<>btrim(p_content) OR old.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'comment_conflict' USING ERRCODE='42501'; END IF;
    RETURN p_id;
  END IF;
  IF p_parent IS NOT NULL THEN
    SELECT * INTO par FROM community_comments WHERE id=p_parent;
    IF NOT FOUND OR par.post_id<>p_post OR par.parent_id IS NOT NULL OR par.deleted_at IS NOT NULL OR par.is_hidden OR (par.user_id IS NOT NULL AND is_blocked_with(par.user_id)) THEN RAISE EXCEPTION 'invalid_reply_target' USING ERRCODE='42501'; END IF;
  END IF;
  INSERT INTO community_comments(id,post_id,user_id,parent_id,content) VALUES(p_id,p_post,u,p_parent,btrim(p_content));
  RETURN p_id;
END $$;
CREATE FUNCTION public.edit_community_comment(p_id uuid,p_content text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=_community_writer(); pid uuid; BEGIN
  SELECT post_id INTO pid FROM community_comments WHERE id=p_id;
  PERFORM 1 FROM community_posts WHERE id=pid FOR UPDATE;
  IF NOT community_readable(pid) THEN RAISE EXCEPTION 'post_unavailable' USING ERRCODE='42501'; END IF;
  UPDATE community_comments SET content=btrim(p_content),edited_at=CASE WHEN content<>btrim(p_content) THEN now() ELSE edited_at END,updated_at=now() WHERE id=p_id AND user_id=u AND deleted_at IS NULL AND NOT is_hidden;
  IF NOT FOUND THEN RAISE EXCEPTION 'comment_not_owned' USING ERRCODE='42501'; END IF;
END $$;
CREATE FUNCTION public.delete_community_comment(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=_community_writer(); pid uuid; BEGIN
  SELECT post_id INTO pid FROM community_comments WHERE id=p_id;
  PERFORM 1 FROM community_posts WHERE id=pid FOR UPDATE;
  UPDATE community_comments SET content='',deleted_at=COALESCE(deleted_at,now()),updated_at=now() WHERE id=p_id AND user_id=u;
  IF NOT FOUND THEN RAISE EXCEPTION 'comment_not_owned' USING ERRCODE='42501'; END IF;
END $$;
CREATE FUNCTION public.set_community_solution(p_post uuid,p_comment uuid DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=_community_writer(); p community_posts; BEGIN
  SELECT * INTO p FROM community_posts WHERE id=p_post FOR UPDATE;
  IF NOT FOUND OR p.user_id IS DISTINCT FROM u OR p.kind<>'question' OR NOT community_readable(p_post) THEN RAISE EXCEPTION 'solution_not_owned' USING ERRCODE='42501'; END IF;
  IF p_comment IS NOT NULL AND NOT EXISTS(SELECT 1 FROM community_comments WHERE id=p_comment AND post_id=p_post AND deleted_at IS NULL AND NOT is_hidden AND (user_id IS NULL OR NOT is_blocked_with(user_id))) THEN RAISE EXCEPTION 'invalid_solution'; END IF;
  UPDATE community_posts SET accepted_comment_id=p_comment,updated_at=now() WHERE id=p_post;
END $$;
CREATE FUNCTION public.sync_community_comments() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pid uuid:=COALESCE(NEW.post_id,OLD.post_id); BEGIN
  PERFORM 1 FROM community_posts WHERE id=pid FOR UPDATE;
  UPDATE community_posts SET comments_count=(SELECT count(*) FROM community_comments WHERE post_id=pid AND deleted_at IS NULL AND NOT is_hidden),accepted_comment_id=CASE WHEN EXISTS(SELECT 1 FROM community_comments WHERE id=accepted_comment_id AND deleted_at IS NULL AND NOT is_hidden) THEN accepted_comment_id ELSE NULL END WHERE id=pid;
  RETURN NULL;
END $$;
CREATE TRIGGER community_comment_count AFTER INSERT OR UPDATE OR DELETE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION public.sync_community_comments();
CREATE FUNCTION public.anonymize_community_author() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.user_id IS NULL AND OLD.user_id IS NOT NULL THEN
    NEW.deleted_at:=COALESCE(OLD.deleted_at,now()); NEW.updated_at:=now();
    IF TG_TABLE_NAME='community_comments' THEN NEW.content:=''; ELSE NEW.body:=''; NEW.code:=''; NEW.image_path:=NULL; NEW.accepted_comment_id:=NULL; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER community_post_anonymize BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.anonymize_community_author();
CREATE TRIGGER community_comment_anonymize BEFORE UPDATE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION public.anonymize_community_author();
REVOKE ALL ON FUNCTION public.sync_community_comments(),public.anonymize_community_author() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.save_community_post(uuid,text,text,text,text,text,text,text),public.delete_community_post(uuid),public.save_community_comment(uuid,uuid,text,uuid),public.edit_community_comment(uuid,text),public.delete_community_comment(uuid),public.set_community_solution(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_community_post(uuid,text,text,text,text,text,text,text),public.delete_community_post(uuid),public.save_community_comment(uuid,uuid,text,uuid),public.edit_community_comment(uuid,text),public.delete_community_comment(uuid),public.set_community_solution(uuid,uuid) TO authenticated,service_role;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('community-images','community-images',false,5242880,ARRAY['image/jpeg','image/png','image/webp']);
CREATE FUNCTION public.community_image_referenced(p_path text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM community_posts WHERE image_path=p_path); $$;
REVOKE ALL ON FUNCTION public.community_image_referenced(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.community_image_referenced(text) TO authenticated,service_role;
CREATE POLICY community_image_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='community-images' AND ((storage.foldername(name))[1]=auth.uid()::text OR EXISTS(SELECT 1 FROM public.community_posts p WHERE p.image_path=name AND public.community_readable(p.id))));
CREATE POLICY community_image_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='community-images' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY community_image_update ON storage.objects FOR UPDATE TO authenticated USING(bucket_id='community-images' AND (storage.foldername(name))[1]=auth.uid()::text) WITH CHECK(bucket_id='community-images' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY community_image_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id='community-images' AND (storage.foldername(name))[1]=auth.uid()::text AND NOT public.community_image_referenced(name));
-- Restrictive guards prevent older broad storage policies from granting cross-owner access.
CREATE POLICY community_storage_read_guard ON storage.objects AS RESTRICTIVE FOR SELECT TO authenticated USING(bucket_id<>'community-images' OR ((storage.foldername(name))[1]=auth.uid()::text OR EXISTS(SELECT 1 FROM public.community_posts p WHERE p.image_path=name AND public.community_readable(p.id))));
CREATE POLICY community_storage_insert_guard ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(bucket_id<>'community-images' OR (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY community_storage_update_guard ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated USING(bucket_id<>'community-images' OR (storage.foldername(name))[1]=auth.uid()::text) WITH CHECK(bucket_id<>'community-images' OR (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY community_storage_delete_guard ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated USING(bucket_id<>'community-images' OR ((storage.foldername(name))[1]=auth.uid()::text AND NOT public.community_image_referenced(name)));
CREATE POLICY community_storage_anon_guard ON storage.objects AS RESTRICTIVE FOR SELECT TO anon USING(bucket_id<>'community-images');

-- Newest uses a frozen insertion watermark and a strict (rank,time,type,id) keyset, never offset.
CREATE FUNCTION public.community_feed(p_filter text DEFAULT 'all',p_search text DEFAULT '',p_language text DEFAULT 'all',p_sort text DEFAULT 'recent',p_cursor jsonb DEFAULT NULL,p_snapshot timestamptz DEFAULT NULL,p_limit integer DEFAULT 20)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
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
    SELECT 'discussion',p.id,p.created_at,0::bigint,to_jsonb(p)||jsonb_build_object('profiles',jsonb_build_object('username',pr.username,'full_name',pr.full_name,'avatar_url',pr.avatar_url,'is_verified',pr.is_verified))
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
END $$;
REVOKE ALL ON FUNCTION public.community_feed(text,text,text,text,jsonb,timestamptz,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.community_feed(text,text,text,text,jsonb,timestamptz,integer) TO authenticated,service_role;

ALTER TABLE public.content_reports ADD COLUMN discussion_id uuid REFERENCES public.community_posts(id) ON DELETE SET NULL;
ALTER TABLE public.content_reports ADD COLUMN discussion_comment_id uuid REFERENCES public.community_comments(id) ON DELETE SET NULL;
ALTER TABLE public.content_reports DROP CONSTRAINT content_reports_target_type_check;
ALTER TABLE public.content_reports ADD CONSTRAINT content_reports_target_type_check CHECK(target_type IN ('snippet','user','message','discussion','discussion_comment'));
ALTER TABLE public.content_reports DROP CONSTRAINT content_reports_target_present;
ALTER TABLE public.content_reports ADD CONSTRAINT content_reports_target_present CHECK((target_type='snippet' AND snippet_id IS NOT NULL) OR (target_type IN ('user','message') AND reported_user_id IS NOT NULL) OR (target_type='discussion' AND discussion_id IS NOT NULL) OR (target_type='discussion_comment' AND discussion_comment_id IS NOT NULL));
CREATE UNIQUE INDEX community_report_post_unique ON public.content_reports(reporter_id,discussion_id) WHERE target_type='discussion';
CREATE UNIQUE INDEX community_report_comment_unique ON public.content_reports(reporter_id,discussion_comment_id) WHERE target_type='discussion_comment';
CREATE POLICY community_report_insert_guard ON public.content_reports AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(target_type NOT IN ('discussion','discussion_comment'));
CREATE FUNCTION public.report_community(p_post uuid,p_comment uuid DEFAULT NULL,p_reason text DEFAULT 'other',p_details text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=_community_writer(); owner_id uuid; excerpt text; qualifying boolean:=_reporter_qualifies(u); threshold integer:=COALESCE((_coin_cfg('moderation')->>'auto_hide_threshold')::int,3); BEGIN
  IF NOT community_readable(p_post) THEN RAISE EXCEPTION 'post_unavailable' USING ERRCODE='42501'; END IF;
  IF p_comment IS NULL THEN SELECT user_id,title INTO owner_id,excerpt FROM community_posts WHERE id=p_post;
  ELSE SELECT user_id,content INTO owner_id,excerpt FROM community_comments WHERE id=p_comment AND post_id=p_post AND deleted_at IS NULL AND NOT is_hidden AND (user_id IS NULL OR NOT is_blocked_with(user_id)); IF NOT FOUND THEN RAISE EXCEPTION 'comment_unavailable'; END IF; END IF;
  IF owner_id=u THEN RAISE EXCEPTION 'own_content'; END IF;
  IF p_reason NOT IN ('phishing','malicious','offensive','spam','copyright','other','harassment','impersonation') OR char_length(COALESCE(p_details,''))>500 THEN RAISE EXCEPTION 'invalid_report'; END IF;
  INSERT INTO content_reports(reporter_id,target_type,reported_user_id,discussion_id,discussion_comment_id,reason,details,message_excerpt,counts_toward_threshold)
    VALUES(u,CASE WHEN p_comment IS NULL THEN 'discussion' ELSE 'discussion_comment' END,owner_id,p_post,p_comment,p_reason,NULLIF(btrim(p_details),''),left(excerpt,500),qualifying) ON CONFLICT DO NOTHING;
  IF p_comment IS NULL THEN
    IF (SELECT count(DISTINCT reporter_id) FROM content_reports WHERE target_type='discussion' AND discussion_id=p_post AND status='open' AND counts_toward_threshold)>=threshold THEN UPDATE community_posts SET is_hidden=true WHERE id=p_post; END IF;
  ELSE
    IF (SELECT count(DISTINCT reporter_id) FROM content_reports WHERE target_type='discussion_comment' AND discussion_comment_id=p_comment AND status='open' AND counts_toward_threshold)>=threshold THEN UPDATE community_comments SET is_hidden=true WHERE id=p_comment; END IF;
  END IF;
  RETURN jsonb_build_object('success',true);
END $$;
CREATE FUNCTION public.admin_community_reports(p_status text DEFAULT 'open') RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb; BEGIN PERFORM _require_admin();
  SELECT COALESCE(jsonb_agg(to_jsonb(rp)||jsonb_build_object('title',p.title,'post_hidden',p.is_hidden,'comment_hidden',c.is_hidden,'post_body',p.body,'comment_content',c.content) ORDER BY rp.created_at DESC),'[]'::jsonb) INTO r FROM content_reports rp LEFT JOIN community_posts p ON p.id=rp.discussion_id LEFT JOIN community_comments c ON c.id=rp.discussion_comment_id WHERE rp.target_type IN ('discussion','discussion_comment') AND (p_status='all' OR rp.status=p_status);
  RETURN r;
END $$;
CREATE FUNCTION public.admin_moderate_community(p_post uuid,p_comment uuid DEFAULT NULL,p_hidden boolean DEFAULT true,p_note text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN PERFORM _require_admin();
  IF p_comment IS NULL THEN UPDATE community_posts SET is_hidden=p_hidden WHERE id=p_post;
  ELSE UPDATE community_comments SET is_hidden=p_hidden WHERE id=p_comment AND post_id=p_post; END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
  IF NOT p_hidden THEN UPDATE content_reports SET status='dismissed',resolution='dismissed',reviewed_by=auth.uid(),reviewed_at=now(),admin_note=p_note WHERE discussion_id=p_post AND discussion_comment_id IS NOT DISTINCT FROM p_comment AND status='open'; END IF;
  PERFORM _admin_audit(CASE WHEN p_hidden THEN 'hide' ELSE 'restore' END,'discussion',p_post::text,p_note,jsonb_build_object('comment_id',p_comment));
  RETURN jsonb_build_object('success',true);
END $$;
REVOKE ALL ON FUNCTION public.report_community(uuid,uuid,text,text),public.admin_community_reports(text),public.admin_moderate_community(uuid,uuid,boolean,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.report_community(uuid,uuid,text,text),public.admin_community_reports(text),public.admin_moderate_community(uuid,uuid,boolean,text) TO authenticated,service_role;
-- Existing account deletion includes all owned files; also include legacy ownerless discussion objects.
DO $patch$ DECLARE definition text; BEGIN
  SELECT pg_get_functiondef('public.account_delete_prepare(uuid,uuid,text)'::regprocedure) INTO definition;
  definition:=replace(definition,'''avatars'',''profile-covers''','''avatars'',''profile-covers'',''community-images''');
  EXECUTE definition;
END $patch$;
COMMIT;

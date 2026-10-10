-- Prepared for deployment; test locally first. No reward/economy changes.
BEGIN;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS followers_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS following_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_bio_length CHECK (bio IS NULL OR char_length(bio) <= 280);

-- Follow edges must not be reconstructed through an inverse public list.
-- All client reads/writes use scoped RPCs; raw REST access is closed.
REVOKE ALL ON public.follows FROM anon, authenticated;
CREATE OR REPLACE FUNCTION public.profile_follow_list(p_user uuid, p_kind text, p_limit integer DEFAULT 50)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, level integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_profile profiles; v_owner boolean := auth.uid() = p_user;
BEGIN
  IF p_kind NOT IN ('followers', 'following') THEN RAISE EXCEPTION 'invalid_list'; END IF;
  SELECT * INTO v_profile FROM profiles WHERE profiles.id = p_user;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile_not_found'; END IF;
  IF NOT COALESCE(v_owner, false) AND
     NOT (CASE WHEN p_kind = 'followers' THEN v_profile.followers_visible ELSE v_profile.following_visible END)
  THEN RAISE EXCEPTION 'private_list' USING ERRCODE = '42501'; END IF;
  RETURN QUERY SELECT p.id, p.username, p.full_name, p.avatar_url, p.level
    FROM follows f JOIN profiles p ON p.id = CASE WHEN p_kind = 'followers' THEN f.follower_id ELSE f.following_id END
    WHERE (CASE WHEN p_kind = 'followers' THEN f.following_id ELSE f.follower_id END) = p_user
      AND (COALESCE(v_owner, false) OR
        CASE WHEN p_kind = 'followers' THEN p.following_visible ELSE p.followers_visible END)
    ORDER BY f.created_at DESC, f.id LIMIT LEAST(GREATEST(p_limit, 1), 100);
END $$;
CREATE OR REPLACE FUNCTION public.my_following(p_targets uuid[] DEFAULT NULL)
RETURNS TABLE(following_id uuid) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.following_id FROM follows f WHERE auth.uid() IS NOT NULL AND f.follower_id = auth.uid()
    AND (p_targets IS NULL OR f.following_id = ANY(p_targets));
$$;
CREATE OR REPLACE FUNCTION public.set_follow(p_target uuid, p_follow boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL OR p_target = v_user OR p_target IS NULL THEN RAISE EXCEPTION 'invalid_follow' USING ERRCODE = '42501'; END IF;
  IF p_follow THEN
    IF is_blocked_with(p_target) THEN RAISE EXCEPTION 'blocked' USING ERRCODE = '42501'; END IF;
    INSERT INTO follows(follower_id, following_id) VALUES(v_user, p_target) ON CONFLICT(follower_id, following_id) DO NOTHING;
  ELSE DELETE FROM follows WHERE follower_id = v_user AND following_id = p_target;
  END IF;
  RETURN p_follow;
END $$;
REVOKE ALL ON FUNCTION public.profile_follow_list(uuid,text,integer), public.my_following(uuid[]), public.set_follow(uuid,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.profile_follow_list(uuid,text,integer), public.my_following(uuid[]), public.set_follow(uuid,boolean) TO authenticated, service_role;

ALTER TABLE public.code_comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.code_comments(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS edited_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
-- Removing an account anonymizes its comments instead of cascading through other authors' replies.
ALTER TABLE public.code_comments DROP CONSTRAINT code_comments_user_id_fkey;
ALTER TABLE public.code_comments ADD CONSTRAINT code_comments_user_id_fkey FOREIGN KEY(user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS code_comments_thread_idx ON public.code_comments(snippet_id,parent_id,created_at);
ALTER TABLE public.code_comments ADD CONSTRAINT comment_content_valid CHECK (
  (deleted_at IS NOT NULL AND content = '') OR (deleted_at IS NULL AND char_length(btrim(content)) BETWEEN 1 AND 1000)
) NOT VALID; -- Existing long comments remain readable; new writes are validated.
DROP POLICY IF EXISTS "Users can manage their own comments" ON public.code_comments;
DROP POLICY IF EXISTS "Users can view all comments" ON public.code_comments;
CREATE POLICY comments_read ON public.code_comments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM code_snippets s WHERE s.id = snippet_id AND (s.is_public OR s.user_id = auth.uid()) AND NOT COALESCE(s.is_hidden,false))
);
CREATE POLICY comments_insert ON public.code_comments FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND deleted_at IS NULL AND edited_at IS NULL AND
  EXISTS (SELECT 1 FROM code_snippets s WHERE s.id = snippet_id AND (s.is_public OR s.user_id = auth.uid()) AND NOT COALESCE(s.is_hidden,false) AND NOT is_blocked_with(s.user_id))
);
CREATE POLICY comments_update ON public.code_comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
REVOKE DELETE ON public.code_comments FROM anon, authenticated;
REVOKE INSERT, UPDATE ON public.code_comments FROM anon;
CREATE OR REPLACE FUNCTION public.validate_comment_thread()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_parent code_comments;
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.edited_at := NULL; NEW.deleted_at := NULL; NEW.created_at := now(); NEW.updated_at := now();
    IF NEW.parent_id IS NOT NULL THEN
      SELECT * INTO v_parent FROM code_comments WHERE id = NEW.parent_id FOR UPDATE;
      IF NOT FOUND OR v_parent.parent_id IS NOT NULL OR v_parent.snippet_id <> NEW.snippet_id OR v_parent.deleted_at IS NOT NULL
      THEN RAISE EXCEPTION 'invalid_reply_target'; END IF;
    END IF;
  ELSE
    IF NEW.user_id IS NULL AND OLD.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM profiles WHERE id=OLD.user_id) THEN
      NEW.content := ''; NEW.deleted_at := COALESCE(OLD.deleted_at,now()); NEW.updated_at := now(); NEW.edited_at := OLD.edited_at;
      RETURN NEW; -- FK action after account deletion; clients cannot anonymize an existing owner.
    END IF;
    IF NEW.id <> OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.snippet_id IS DISTINCT FROM OLD.snippet_id
      OR NEW.parent_id IS DISTINCT FROM OLD.parent_id OR NEW.created_at IS DISTINCT FROM OLD.created_at
    THEN RAISE EXCEPTION 'immutable_comment_identity' USING ERRCODE = '42501'; END IF;
    IF OLD.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'comment_deleted'; END IF;
    NEW.edited_at := CASE WHEN NEW.content IS DISTINCT FROM OLD.content AND NEW.deleted_at IS NULL THEN now() ELSE OLD.edited_at END;
    NEW.updated_at := now();
    IF NEW.deleted_at IS NOT NULL THEN NEW.deleted_at := now(); NEW.content := ''; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER validate_comment_thread BEFORE INSERT OR UPDATE ON public.code_comments FOR EACH ROW EXECUTE FUNCTION public.validate_comment_thread();
CREATE OR REPLACE FUNCTION public.edit_code_comment(p_id uuid, p_content text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  UPDATE code_comments SET content = btrim(p_content) WHERE id = p_id AND user_id = auth.uid() AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'comment_not_owned' USING ERRCODE = '42501'; END IF;
END $$;
CREATE OR REPLACE FUNCTION public.delete_code_comment(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Tombstones preserve replies authored by other users; DELETE is unavailable to clients.
  UPDATE code_comments SET content = '', deleted_at = now() WHERE id = p_id AND user_id = auth.uid() AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'comment_not_owned' USING ERRCODE = '42501'; END IF;
END $$;
CREATE OR REPLACE FUNCTION public.sync_code_comment_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_snippet uuid := COALESCE(NEW.snippet_id,OLD.snippet_id);
BEGIN
  -- Serialize on the snippet before recounting; counts include live replies, exclude tombstones.
  PERFORM 1 FROM code_snippets WHERE id = v_snippet FOR UPDATE;
  UPDATE code_snippets SET comments_count = (SELECT count(*) FROM code_comments WHERE snippet_id = v_snippet AND deleted_at IS NULL) WHERE id = v_snippet;
  RETURN NULL;
END $$;
CREATE TRIGGER sync_code_comment_count AFTER INSERT OR UPDATE OR DELETE ON public.code_comments FOR EACH ROW EXECUTE FUNCTION public.sync_code_comment_count();
CREATE OR REPLACE FUNCTION public.protect_comment_count()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF current_user IN ('anon','authenticated') THEN
    NEW.comments_count := CASE WHEN TG_OP='INSERT' THEN 0 ELSE OLD.comments_count END;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_comment_count BEFORE INSERT OR UPDATE ON public.code_snippets FOR EACH ROW EXECUTE FUNCTION public.protect_comment_count();
UPDATE public.code_snippets s SET comments_count = (SELECT count(*) FROM public.code_comments c WHERE c.snippet_id = s.id AND c.deleted_at IS NULL);
REVOKE ALL ON FUNCTION public.validate_comment_thread(), public.sync_code_comment_count(), public.protect_comment_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.edit_code_comment(uuid,text), public.delete_code_comment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.edit_code_comment(uuid,text), public.delete_code_comment(uuid) TO authenticated, service_role;

-- Image storage. Public images, owner-only mutations; profiles themselves retain existing owner RLS.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('profile-covers','profile-covers',true,5242880,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT(id) DO UPDATE SET public=true,file_size_limit=5242880,allowed_mime_types=EXCLUDED.allowed_mime_types;
CREATE POLICY covers_read ON storage.objects FOR SELECT USING (bucket_id='profile-covers');
CREATE POLICY covers_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='profile-covers' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY covers_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='profile-covers' AND (storage.foldername(name))[1]=auth.uid()::text) WITH CHECK (bucket_id='profile-covers' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY covers_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id='profile-covers' AND (storage.foldername(name))[1]=auth.uid()::text);
-- A restrictive policy also protects against permissive legacy avatar upload policies.
CREATE POLICY profile_images_insert_guard ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (bucket_id NOT IN ('avatars','profile-covers') OR (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY profile_images_update_guard ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated USING (bucket_id NOT IN ('avatars','profile-covers') OR (storage.foldername(name))[1]=auth.uid()::text) WITH CHECK (bucket_id NOT IN ('avatars','profile-covers') OR (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY profile_images_delete_guard ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated USING (bucket_id NOT IN ('avatars','profile-covers') OR (storage.foldername(name))[1]=auth.uid()::text);
CREATE OR REPLACE FUNCTION public.account_delete_prepare(p_user UUID, p_actor UUID DEFAULT NULL, p_reason TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_objects JSONB;
  v_log BIGINT;
BEGIN
  IF p_user IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user) THEN
    RETURN jsonb_build_object('success', false, 'code', 'user_not_found');
  END IF;
  -- حساب المشرف لا يُحذف من هنا (يُزال الدور أولاً) حتى لا تُفقد الإدارة بالخطأ
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user AND role = 'admin') THEN
    RETURN jsonb_build_object('success', false, 'code', 'admin_account');
  END IF;

  -- أعمدة بلا مفتاح خارجي: فك الارتباط بالمستخدم (الأحداث نفسها لا تحتوي بيانات شخصية)
  UPDATE analytics_events SET user_id = NULL WHERE user_id = p_user;
  UPDATE certificate_audit_log SET actor_id = NULL WHERE actor_id = p_user;
  UPDATE profiles SET banned_by = NULL WHERE banned_by = p_user;

  -- الملفات الشخصية: كل ما يملكه + مسارات المستخدم المعروفة
  SELECT COALESCE(jsonb_agg(jsonb_build_object('bucket', o.bucket_id, 'name', o.name)), '[]'::jsonb)
  INTO v_objects
  FROM storage.objects o
  WHERE o.owner = p_user
     OR (o.bucket_id IN ('avatars','profile-covers') AND (storage.foldername(o.name))[1] = p_user::text)
     OR (o.bucket_id = 'payment-receipts' AND o.name LIKE 'receipts/' || p_user::text || '/%');

  INSERT INTO account_deletions (user_id, initiated_by, reason, storage_objects)
  VALUES (p_user, NULLIF(p_actor, p_user), p_reason, jsonb_array_length(v_objects))
  RETURNING id INTO v_log;

  RETURN jsonb_build_object('success', true, 'log_id', v_log, 'storage_objects', v_objects);
END;
$$;
REVOKE ALL ON FUNCTION public.account_delete_prepare(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.account_delete_prepare(UUID, UUID, TEXT) TO service_role;

COMMIT;

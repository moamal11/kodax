-- Explicit thread deletion requested by the owner of the original comment.
-- No existing data is rewritten. Account anonymization still preserves others' replies.
BEGIN;
CREATE FUNCTION public.cascade_deleted_code_comment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL AND NEW.parent_id IS NULL
    AND NEW.user_id IS NOT NULL AND NEW.user_id IS NOT DISTINCT FROM OLD.user_id THEN
    UPDATE code_comments SET content='',deleted_at=NEW.deleted_at
      WHERE parent_id=NEW.id AND snippet_id=NEW.snippet_id AND deleted_at IS NULL;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER cascade_deleted_code_comment AFTER UPDATE OF deleted_at ON public.code_comments
FOR EACH ROW EXECUTE FUNCTION public.cascade_deleted_code_comment();
CREATE OR REPLACE FUNCTION public.delete_code_comment(p_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE target code_comments;
BEGIN
  SELECT * INTO target FROM code_comments WHERE id=p_id FOR UPDATE;
  IF NOT FOUND OR auth.uid() IS NULL OR target.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'comment_not_owned' USING ERRCODE='42501';
  END IF;
  IF target.deleted_at IS NOT NULL THEN RETURN; END IF;
  UPDATE code_comments SET content='',deleted_at=now() WHERE id=p_id;
END $$;
CREATE FUNCTION public.cascade_deleted_community_comment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL AND NEW.parent_id IS NULL
    AND NEW.user_id IS NOT NULL AND NEW.user_id IS NOT DISTINCT FROM OLD.user_id THEN
    UPDATE community_comments SET content='',deleted_at=NEW.deleted_at,updated_at=now()
      WHERE parent_id=NEW.id AND post_id=NEW.post_id AND deleted_at IS NULL;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER cascade_deleted_community_comment AFTER UPDATE OF deleted_at ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION public.cascade_deleted_community_comment();
CREATE OR REPLACE FUNCTION public.delete_community_comment(p_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=_community_writer(); pid uuid; target community_comments;
BEGIN
  SELECT post_id INTO pid FROM community_comments WHERE id=p_id;
  PERFORM 1 FROM community_posts WHERE id=pid FOR UPDATE;
  SELECT * INTO target FROM community_comments WHERE id=p_id FOR UPDATE;
  IF NOT FOUND OR target.user_id IS DISTINCT FROM u THEN
    RAISE EXCEPTION 'comment_not_owned' USING ERRCODE='42501';
  END IF;
  IF target.deleted_at IS NOT NULL THEN RETURN; END IF;
  UPDATE community_comments SET content='',deleted_at=now(),updated_at=now() WHERE id=p_id;
END $$;
REVOKE ALL ON FUNCTION public.cascade_deleted_code_comment(),public.cascade_deleted_community_comment() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.delete_code_comment(uuid),public.delete_community_comment(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.delete_code_comment(uuid),public.delete_community_comment(uuid) TO authenticated,service_role;
COMMIT;

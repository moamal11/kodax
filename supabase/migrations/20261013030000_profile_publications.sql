BEGIN;
-- One chronological cursor across code and discussion posts; public content only.
CREATE FUNCTION public.profile_publications(p_user uuid, p_cursor jsonb DEFAULT NULL, p_snapshot timestamptz DEFAULT NULL, p_limit integer DEFAULT 10)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb; items jsonb;
BEGIN
 IF p_user IS NULL OR (auth.uid() IS NOT NULL AND is_blocked_with(p_user)) THEN
  RETURN jsonb_build_object('items','[]'::jsonb,'next',NULL,'snapshot',COALESCE(p_snapshot,now()));
 END IF;
 result:=public_web_feed('all','','all','recent',p_cursor,p_snapshot,p_limit,p_user,0);
 SELECT COALESCE(jsonb_agg(CASE WHEN item->>'type'='discussion' THEN
  jsonb_set(item,'{data,liked_by_me}',to_jsonb(EXISTS(SELECT 1 FROM community_likes l WHERE l.post_id=(item->>'id')::uuid AND l.user_id=auth.uid())))
  ELSE item END ORDER BY position),'[]'::jsonb)
 INTO items FROM jsonb_array_elements(result->'items') WITH ORDINALITY AS entry(item,position);
 RETURN jsonb_set(result,'{items}',items);
END $$;
REVOKE ALL ON FUNCTION public.profile_publications(uuid,jsonb,timestamptz,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_publications(uuid,jsonb,timestamptz,integer) TO anon,authenticated,service_role;
COMMIT;

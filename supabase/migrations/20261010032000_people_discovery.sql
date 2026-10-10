BEGIN;
-- Public directory projection. No email, location, private follow lists or write grants.
CREATE FUNCTION public.people_search(p_query text DEFAULT '',p_page integer DEFAULT 0,p_limit integer DEFAULT 12)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 WITH args AS (SELECT lower(left(btrim(COALESCE(p_query,'')),80)) needle,least(greatest(COALESCE(p_limit,12),1),30) lim),
 page AS (
  SELECT p.id,p.username,p.full_name,p.avatar_url,p.bio,p.is_verified,
   row_number() OVER (ORDER BY (lower(p.username)=a.needle) DESC,
    CASE WHEN a.needle='' THEN COALESCE(p.followers_count,0) ELSE 0 END DESC,p.is_verified DESC NULLS LAST,p.username,p.id) seq
  FROM profiles p CROSS JOIN args a
  WHERE p.username IS NOT NULL AND p.username<>'' AND NOT COALESCE(p.is_banned,false)
   AND (auth.uid() IS NULL OR p.id<>auth.uid())
   AND (a.needle='' OR position(a.needle IN lower(COALESCE(p.username,'')||' '||COALESCE(p.full_name,'')))>0)
   AND NOT EXISTS(SELECT 1 FROM user_blocks b WHERE (b.blocker_id=auth.uid() AND b.blocked_id=p.id) OR (b.blocked_id=auth.uid() AND b.blocker_id=p.id))
  ORDER BY (lower(p.username)=a.needle) DESC,
   CASE WHEN a.needle='' THEN COALESCE(p.followers_count,0) ELSE 0 END DESC,p.is_verified DESC NULLS LAST,p.username,p.id
  LIMIT (SELECT lim+1 FROM args) OFFSET least(greatest(COALESCE(p_page,0),0),1000)*(SELECT lim FROM args)
 ), numbered AS (SELECT *,row_number() OVER(ORDER BY seq) n FROM page)
 SELECT jsonb_build_object('items',COALESCE(jsonb_agg(jsonb_build_object('id',id,'username',username,'full_name',full_name,'avatar_url',avatar_url,'bio',bio,'is_verified',is_verified) ORDER BY n) FILTER(WHERE n<=(SELECT lim FROM args)),'[]'::jsonb),'has_more',count(*)>(SELECT lim FROM args)) FROM numbered;
$$;
REVOKE ALL ON FUNCTION public.people_search(text,integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.people_search(text,integer,integer) TO anon,authenticated,service_role;
COMMIT;

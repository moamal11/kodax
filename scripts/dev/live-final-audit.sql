SELECT jsonb_build_object(
 'migrations',(SELECT jsonb_agg(version ORDER BY version) FROM supabase_migrations.schema_migrations WHERE version IN ('20261009000000','20261010000000','20261010010000')),
 'tables',(SELECT jsonb_agg(jsonb_build_object('name',relname,'rls',relrowsecurity)) FROM pg_class JOIN pg_namespace n ON n.oid=relnamespace WHERE n.nspname='public' AND relname IN ('profiles','follows','code_comments','community_posts','community_comments')),
 'buckets',(SELECT jsonb_agg(jsonb_build_object('id',id,'public',public,'limit',file_size_limit,'mime',allowed_mime_types)) FROM storage.buckets WHERE id IN ('avatars','profile-covers','community-images')),
 'cascadeTriggers',(SELECT jsonb_agg(tgname) FROM pg_trigger WHERE tgname IN ('cascade_deleted_code_comment','cascade_deleted_community_comment')),
 'qaProfiles',(SELECT jsonb_agg(jsonb_build_object('id',id,'xp',xp,'bioLength',char_length(bio),'hasCover',cover_url IS NOT NULL,'followersVisible',followers_visible,'followingVisible',following_visible)) FROM profiles WHERE id IN ('cb6ddd26-05a0-4d65-8c28-1cc6143fcde1','67973c40-30d7-4ff1-a09a-d6112f242c0a'))
) AS audit;

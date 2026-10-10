SELECT jsonb_build_object(
 'project','krtulodnhmfuoxjqajwl',
 'migrations',(SELECT jsonb_agg(version ORDER BY version) FROM supabase_migrations.schema_migrations WHERE version IN ('20261009000000','20261010000000','20261010010000','20261010020000')),
 'likesRLS',(SELECT relrowsecurity FROM pg_class WHERE oid='public.community_likes'::regclass),
 'functions',(SELECT jsonb_agg(p.proname ORDER BY p.proname) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('share_community_message','share_recipient_search','set_community_like','notify_community_comment','notify_followed_publication','social_delivery_allowed')),
 'triggers',(SELECT jsonb_agg(tgname ORDER BY tgname) FROM pg_trigger WHERE NOT tgisinternal AND tgname IN ('code_publication_notification','community_publication_notification','community_like_notification','community_comment_notification','messages_shared_guard')),
 'postsPreference',EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_preferences' AND column_name='posts'),
 'usernameUniqueIndex',EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='profiles_username_case_unique'),
 'pushCron',(SELECT jsonb_agg(jsonb_build_object('job',jobname,'active',active,'schedule',schedule)) FROM cron.job WHERE jobname LIKE 'kodax-push%')
) audit;

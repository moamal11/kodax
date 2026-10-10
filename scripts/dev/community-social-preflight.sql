SELECT jsonb_build_object(
 'project','krtulodnhmfuoxjqajwl',
 'functions',(SELECT jsonb_object_agg(p.proname,pg_get_functiondef(p.oid)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('_push_enqueue','_push_from_app_notification','notify_on_code_comment','notify_on_code_like','notify_on_new_follow','insert_interaction_notification','community_feed','save_community_post','get_or_create_conversation','_community_readable','_community_writer')),
 'constraints',(SELECT jsonb_agg(jsonb_build_object('table',conrelid::regclass::text,'name',conname,'definition',pg_get_constraintdef(oid))) FROM pg_constraint WHERE conrelid IN ('public.community_posts'::regclass,'public.app_notifications'::regclass,'public.messages'::regclass,'public.notification_outbox'::regclass,'public.profiles'::regclass)),
 'triggers',(SELECT jsonb_agg(jsonb_build_object('table',tgrelid::regclass::text,'name',tgname,'definition',pg_get_triggerdef(oid))) FROM pg_trigger WHERE NOT tgisinternal AND tgrelid IN ('public.code_snippets'::regclass,'public.code_comments'::regclass,'public.community_posts'::regclass,'public.community_comments'::regclass,'public.app_notifications'::regclass)),
 'cronJobs',(SELECT jsonb_agg(jsonb_build_object('name',jobname,'schedule',schedule,'active',active)) FROM cron.job WHERE jobname LIKE 'kodax-push%'),
 'pushSecrets',(SELECT jsonb_agg(name) FROM vault.secrets WHERE name IN ('push_cron_secret','supabase_url')),
 'devices',(SELECT jsonb_build_object('enabled',count(*) FILTER (WHERE enabled),'android',count(*) FILTER (WHERE enabled AND platform='android')) FROM public.push_tokens),
 'duplicateUsernames',(SELECT count(*) FROM (SELECT lower(username) FROM public.profiles WHERE username IS NOT NULL GROUP BY lower(username) HAVING count(*)>1) d),
 'messageColumns',(SELECT jsonb_agg(jsonb_build_object('name',column_name,'type',data_type)) FROM information_schema.columns WHERE table_schema='public' AND table_name='messages')
) AS audit;

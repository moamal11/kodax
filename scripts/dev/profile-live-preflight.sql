SELECT jsonb_build_object(
 'project',current_database(),
 'columns',(SELECT jsonb_agg(jsonb_build_object('table',table_name,'column',column_name,'nullable',is_nullable,'type',data_type)) FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('profiles','follows','code_comments','code_snippets')),
 'policies',(SELECT jsonb_agg(to_jsonb(p)) FROM pg_policies p WHERE schemaname IN ('public','storage') AND tablename IN ('profiles','follows','code_comments','code_snippets','objects')),
 'triggers',(SELECT jsonb_agg(jsonb_build_object('table',c.relname,'name',t.tgname,'definition',pg_get_triggerdef(t.oid))) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid WHERE NOT t.tgisinternal AND c.relname IN ('users','profiles','follows','code_comments','code_snippets')),
 'constraints',(SELECT jsonb_agg(jsonb_build_object('table',conrelid::regclass::text,'name',conname,'definition',pg_get_constraintdef(oid))) FROM pg_constraint WHERE conrelid IN ('public.profiles'::regclass,'public.code_comments'::regclass)),
 'functions',(SELECT jsonb_agg(jsonb_build_object('name',p.proname,'definition',pg_get_functiondef(p.oid))) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('is_blocked_with','account_delete_prepare','handle_new_user','update_follow_counts','increment_comment_count','decrement_comment_count','profile_follow_list','my_following','set_follow')),
 'buckets',(SELECT jsonb_agg(jsonb_build_object('id',id,'public',public,'limit',file_size_limit,'mime',allowed_mime_types)) FROM storage.buckets WHERE id IN ('avatars','profile-covers')),
 'baseline',(SELECT jsonb_build_object('profiles',count(*),'xp',sum(xp)) FROM public.profiles),
 'counts',jsonb_build_object('follows',(SELECT count(*) FROM public.follows),'comments',(SELECT count(*) FROM public.code_comments)),
 'migrations',(SELECT jsonb_agg(jsonb_build_object('version',version,'name',name)) FROM supabase_migrations.schema_migrations)
) AS preflight;

SELECT p.proname,p.prosrc,p.prosecdef,p.proconfig,p.proacl FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN ('profile_follow_list','my_following','set_follow','validate_comment_thread','edit_code_comment','delete_code_comment','sync_code_comment_count','protect_comment_count','account_delete_prepare');

BEGIN;
DROP FUNCTION public.public_web_feed(text,text,text,text,jsonb,timestamptz,integer,uuid);
CREATE FUNCTION public.public_web_feed(p_filter text DEFAULT 'all',p_search text DEFAULT '',p_language text DEFAULT 'all',p_sort text DEFAULT 'recent',p_cursor jsonb DEFAULT NULL,p_snapshot timestamptz DEFAULT NULL,p_limit integer DEFAULT 20,p_user uuid DEFAULT NULL,p_page integer DEFAULT 0) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb; lastrow jsonb; snap timestamptz:=COALESCE(p_snapshot,now()); lim integer:=least(greatest(p_limit,1),50);
BEGIN
 WITH items AS (
  SELECT 'code'::text type,s.id,s.created_at,CASE WHEN p_sort IN ('popular','most_liked') THEN s.likes_count WHEN p_sort='most_viewed' THEN s.views_count ELSE 0 END::bigint rank
  FROM code_snippets s WHERE p_filter IN ('all','code') AND s.is_public AND NOT COALESCE(s.is_hidden,false) AND (p_user IS NULL OR s.user_id=p_user) AND s.created_at<=snap
   AND EXISTS(SELECT 1 FROM profiles WHERE id=s.user_id AND NOT COALESCE(is_banned,false))
   AND (COALESCE(p_language,'all') IN ('all','') OR s.language=p_language OR (p_language='web' AND s.language IN ('html','css','web')))
   AND (COALESCE(p_search,'')='' OR s.title ILIKE '%'||left(p_search,100)||'%' OR s.description ILIKE '%'||left(p_search,100)||'%')
  UNION ALL
  SELECT 'discussion',s.id,s.created_at,CASE WHEN p_sort IN ('popular','most_liked') THEN s.likes_count ELSE 0 END::bigint
  FROM community_posts s WHERE p_filter IN ('all','discussion') AND s.deleted_at IS NULL AND NOT s.is_hidden AND (p_user IS NULL OR s.user_id=p_user) AND s.created_at<=snap
   AND (s.user_id IS NULL OR EXISTS(SELECT 1 FROM profiles WHERE id=s.user_id AND NOT COALESCE(is_banned,false)))
   AND (COALESCE(p_language,'all') IN ('all','') OR s.language=p_language)
   AND (COALESCE(p_search,'')='' OR s.title ILIKE '%'||left(p_search,100)||'%' OR s.body ILIKE '%'||left(p_search,100)||'%')
 ), page AS (SELECT * FROM items WHERE p_cursor IS NULL OR (rank,created_at,type,id)<((p_cursor->>'rank')::bigint,(p_cursor->>'created_at')::timestamptz,p_cursor->>'type',(p_cursor->>'id')::uuid) ORDER BY rank DESC,created_at DESC,type DESC,id DESC LIMIT lim OFFSET CASE WHEN p_cursor IS NULL THEN least(greatest(p_page,0),1000)*lim ELSE 0 END)
 SELECT COALESCE(jsonb_agg(jsonb_build_object('type',type,'id',id,'rank',rank,'created_at',created_at,'data',public_web_document(CASE WHEN type='code' THEN 'code' ELSE 'discussion' END,id::text)) ORDER BY rank DESC,created_at DESC,type DESC,id DESC),'[]'::jsonb) INTO result FROM page;
 lastrow:=result->(jsonb_array_length(result)-1);
 RETURN jsonb_build_object('items',result,'snapshot',snap,'next',CASE WHEN jsonb_array_length(result)=lim THEN lastrow-'data' ELSE NULL END);
END $$;
REVOKE ALL ON FUNCTION public.public_web_feed(text,text,text,text,jsonb,timestamptz,integer,uuid,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_web_feed(text,text,text,text,jsonb,timestamptz,integer,uuid,integer) TO anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION public.web_push_claim(p_limit integer DEFAULT 100) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v jsonb; BEGIN
 UPDATE web_push_outbox SET status='queued' WHERE status='sending' AND claimed_at<now()-interval '5 minutes' AND attempts<3;
 UPDATE web_push_outbox SET status='failed',last_error='attempt_limit' WHERE status='sending' AND claimed_at<now()-interval '5 minutes' AND attempts>=3;
 WITH due AS (SELECT w.id FROM web_push_outbox w WHERE w.status='queued' AND w.scheduled_at<=now() ORDER BY w.id LIMIT least(greatest(p_limit,1),100) FOR UPDATE SKIP LOCKED), claimed AS (UPDATE web_push_outbox w SET status='sending',attempts=attempts+1,claimed_at=now() FROM due WHERE w.id=due.id RETURNING w.*)
 SELECT COALESCE(jsonb_agg(jsonb_build_object('id',w.id,'subscription_id',s.id,'endpoint',s.endpoint,'keys',jsonb_build_object('p256dh',s.p256dh,'auth',s.auth),'title',o.title,'body',CASE WHEN o.kind='message' THEN 'وصلتك رسالة جديدة في Kodax' ELSE o.body END,'data',o.data,'expired',NOT COALESCE((SELECT CASE o.kind WHEN 'like' THEN np.likes WHEN 'comment' THEN np.comments WHEN 'follow' THEN np.follows WHEN 'new_post' THEN np.posts WHEN 'message' THEN np.messages WHEN 'daily_goal' THEN np.daily_goal WHEN 'streak' THEN np.streak WHEN 'admin' THEN np.admin ELSE np.system END FROM notification_preferences np WHERE np.user_id=o.user_id),true) OR (o.kind IN ('like','comment','follow','new_post') AND NOT social_delivery_allowed(o.user_id,o.kind,o.data)) OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=o.user_id AND NOT COALESCE(is_banned,false)) OR NOT s.enabled OR s.user_id<>o.user_id OR o.status='cancelled' OR (o.expires_at IS NOT NULL AND o.expires_at<=now()))),'[]'::jsonb) INTO v FROM claimed w JOIN web_push_subscriptions s ON s.id=w.subscription_id JOIN notification_outbox o ON o.id=w.source_id;
 RETURN v;
END $$;
CREATE OR REPLACE FUNCTION public.web_push_register(p_endpoint text,p_p256dh text,p_auth text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=auth.uid(); BEGIN
 IF u IS NULL OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=u AND NOT COALESCE(is_banned,false)) THEN RAISE EXCEPTION 'not_authenticated' USING ERRCODE='42501'; END IF;
 IF length(p_endpoint)>2048 OR p_endpoint !~ '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|updates\.push\.services\.mozilla\.org|[A-Za-z0-9-]+\.notify\.windows\.com|web\.push\.apple\.com)/[^[:space:]]+$' OR p_p256dh !~ '^[A-Za-z0-9_-]{87}=?$' OR p_auth !~ '^[A-Za-z0-9_-]{22}=?=?$' THEN RAISE EXCEPTION 'invalid_subscription' USING ERRCODE='22023'; END IF;
 IF (SELECT count(*) FROM web_push_subscriptions WHERE user_id=u AND enabled AND endpoint<>p_endpoint)>=5 THEN RAISE EXCEPTION 'device_limit'; END IF;
 INSERT INTO web_push_subscriptions(user_id,endpoint,p256dh,auth) VALUES(u,p_endpoint,p_p256dh,p_auth) ON CONFLICT(endpoint) DO UPDATE SET user_id=u,p256dh=excluded.p256dh,auth=excluded.auth,enabled=true,last_seen=now();
 INSERT INTO notification_preferences(user_id) VALUES(u) ON CONFLICT DO NOTHING;
 RETURN jsonb_build_object('success',true);
END $$;
DO $$ DECLARE def text; sig text; old text; replacement text; BEGIN
 FOR sig,old,replacement IN SELECT * FROM (VALUES
  ('public.push_schedule_reminders()','EXISTS (SELECT 1 FROM push_tokens t WHERE t.user_id = np.user_id AND t.enabled)','(EXISTS (SELECT 1 FROM push_tokens t WHERE t.user_id = np.user_id AND t.enabled) OR EXISTS (SELECT 1 FROM web_push_subscriptions t WHERE t.user_id = np.user_id AND t.enabled))'),
  ('public._campaign_recipients(text,jsonb)','EXISTS (SELECT 1 FROM push_tokens t WHERE t.user_id = p.id AND t.enabled)','(EXISTS (SELECT 1 FROM push_tokens t WHERE t.user_id = p.id AND t.enabled) OR EXISTS (SELECT 1 FROM web_push_subscriptions t WHERE t.user_id = p.id AND t.enabled))'),
  ('public.notification_prefs_get()','(SELECT COUNT(*) FROM push_tokens WHERE user_id = v_uid AND enabled)','((SELECT COUNT(*) FROM push_tokens WHERE user_id = v_uid AND enabled)+(SELECT COUNT(*) FROM web_push_subscriptions WHERE user_id = v_uid AND enabled))')
 ) t(a,b,c) LOOP def:=pg_get_functiondef(sig::regprocedure);IF position(old IN def)=0 THEN RAISE EXCEPTION 'Unexpected device eligibility definition: %',sig;END IF;EXECUTE replace(def,old,replacement);END LOOP;END $$;
COMMIT;

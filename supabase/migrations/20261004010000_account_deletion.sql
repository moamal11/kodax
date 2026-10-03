-- ============================================================================
-- Phase B: حذف الحساب النهائي
-- ----------------------------------------------------------------------------
-- الحذف الفعلي يتم في Edge Function `delete-account` (service_role):
--   account_delete_prepare → حذف ملفات التخزين الشخصية → auth.admin.deleteUser
-- حذف auth.users يحذف profiles، وكل جداول المستخدم مرتبطة بـ ON DELETE CASCADE (تم فحصها كلها).
-- هنا: إزالة ما كان يمنع الحذف (مفاتيح NO ACTION)، وتنظيف الأعمدة التي لا تملك مفتاحاً خارجياً،
-- وسجل حذف لا يحتوي بيانات شخصية (المعرّف والوقت فقط).
-- ============================================================================

-- 1) مراجع إدارية/تدقيقية كانت NO ACTION (تمنع حذف المستخدم): تبقى السجلات ويُزال الربط
ALTER TABLE admin_action_log ALTER COLUMN admin_id DROP NOT NULL;
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname, c.conrelid::regclass AS tbl, a.attname AS col, c.confrelid::regclass AS ref
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
    WHERE c.contype = 'f' AND c.confdeltype = 'a'
      AND c.confrelid IN ('public.profiles'::regclass, 'auth.users'::regclass)
      AND c.conrelid IN ('public.admin_action_log'::regclass, 'public.app_updates'::regclass,
                         'public.broadcast_messages'::regclass, 'public.payment_orders'::regclass,
                         'public.user_restriction_logs'::regclass, 'public.user_roles'::regclass)
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
    EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %s(id) ON DELETE SET NULL',
                   r.tbl, r.conname, r.col, r.ref);
  END LOOP;
END $$;
-- SET NULL يتطلب أن يقبل العمود NULL
ALTER TABLE user_restriction_logs ALTER COLUMN performed_by DROP NOT NULL;

-- 2) سجل الحذف (بلا بيانات شخصية)
CREATE TABLE IF NOT EXISTS account_deletions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  initiated_by UUID,           -- NULL أو نفس المستخدم = حذف ذاتي؛ غير ذلك = مشرف
  reason TEXT,
  storage_objects INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared', 'completed', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON account_deletions FROM anon, authenticated;
GRANT SELECT ON account_deletions TO authenticated;
DROP POLICY IF EXISTS account_deletions_admin_read ON account_deletions;
CREATE POLICY account_deletions_admin_read ON account_deletions FOR SELECT TO authenticated USING (is_admin());

-- 3) التحضير: تنظيف ما لا يحذفه CASCADE + قائمة الملفات الشخصية للحذف من Storage
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
     OR (o.bucket_id = 'avatars' AND (storage.foldername(o.name))[1] = p_user::text)
     OR (o.bucket_id = 'payment-receipts' AND o.name LIKE 'receipts/' || p_user::text || '/%');

  INSERT INTO account_deletions (user_id, initiated_by, reason, storage_objects)
  VALUES (p_user, NULLIF(p_actor, p_user), p_reason, jsonb_array_length(v_objects))
  RETURNING id INTO v_log;

  RETURN jsonb_build_object('success', true, 'log_id', v_log, 'storage_objects', v_objects);
END;
$$;
REVOKE ALL ON FUNCTION public.account_delete_prepare(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.account_delete_prepare(UUID, UUID, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.account_delete_finish(p_log BIGINT, p_ok BOOLEAN, p_error TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE account_deletions
  SET status = CASE WHEN p_ok THEN 'completed' ELSE 'failed' END,
      error = LEFT(p_error, 500),
      completed_at = NOW()
  WHERE id = p_log;
$$;
REVOKE ALL ON FUNCTION public.account_delete_finish(BIGINT, BOOLEAN, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.account_delete_finish(BIGINT, BOOLEAN, TEXT) TO service_role;

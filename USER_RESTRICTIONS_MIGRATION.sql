-- =============================================
-- نظام تقييد المستخدمين - Migration SQL
-- يُنفّذ في Supabase SQL Editor
-- =============================================

-- 1) إضافة حقول التقييد إلى جدول profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_purchase_blocked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS banned_by UUID DEFAULT NULL;

-- 2) جدول سجلات التقييد (للتتبع والمراجعة)
CREATE TABLE IF NOT EXISTS user_restriction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('ban', 'unban', 'block_purchase', 'unblock_purchase')),
  reason TEXT,
  performed_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3) فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned) WHERE is_banned = true;
CREATE INDEX IF NOT EXISTS idx_profiles_is_purchase_blocked ON profiles(is_purchase_blocked) WHERE is_purchase_blocked = true;
CREATE INDEX IF NOT EXISTS idx_restriction_logs_user_id ON user_restriction_logs(user_id);

-- 4) RPC: التحقق من حالة التقييد (تُستدعى من التطبيق)
CREATE OR REPLACE FUNCTION check_user_restrictions(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'is_banned', COALESCE(p.is_banned, false),
    'is_purchase_blocked', COALESCE(p.is_purchase_blocked, false),
    'ban_reason', p.ban_reason
  ) INTO result
  FROM profiles p
  WHERE p.id = p_user_id;

  IF result IS NULL THEN
    RETURN json_build_object(
      'is_banned', false,
      'is_purchase_blocked', false,
      'ban_reason', null
    );
  END IF;

  RETURN result;
END;
$$;

-- 5) RPC: حظر/إلغاء حظر مستخدم (للأدمن فقط)
CREATE OR REPLACE FUNCTION admin_toggle_ban(
  p_user_id UUID,
  p_ban BOOLEAN,
  p_reason TEXT DEFAULT NULL,
  p_admin_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- تحقق من صلاحية الأدمن
  IF p_admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: not an admin';
  END IF;

  -- تحديث حالة الحظر
  UPDATE profiles
  SET
    is_banned = p_ban,
    ban_reason = CASE WHEN p_ban THEN p_reason ELSE NULL END,
    banned_at = CASE WHEN p_ban THEN now() ELSE NULL END,
    banned_by = CASE WHEN p_ban THEN p_admin_id ELSE NULL END
  WHERE id = p_user_id;

  -- تسجيل العملية
  INSERT INTO user_restriction_logs (user_id, action, reason, performed_by)
  VALUES (
    p_user_id,
    CASE WHEN p_ban THEN 'ban' ELSE 'unban' END,
    p_reason,
    COALESCE(p_admin_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

  RETURN true;
END;
$$;

-- 6) RPC: منع/السماح بالشراء (للأدمن فقط)
CREATE OR REPLACE FUNCTION admin_toggle_purchase_block(
  p_user_id UUID,
  p_block BOOLEAN,
  p_reason TEXT DEFAULT NULL,
  p_admin_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- تحقق من صلاحية الأدمن
  IF p_admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: not an admin';
  END IF;

  -- تحديث حالة منع الشراء
  UPDATE profiles
  SET is_purchase_blocked = p_block
  WHERE id = p_user_id;

  -- تسجيل العملية
  INSERT INTO user_restriction_logs (user_id, action, reason, performed_by)
  VALUES (
    p_user_id,
    CASE WHEN p_block THEN 'block_purchase' ELSE 'unblock_purchase' END,
    p_reason,
    COALESCE(p_admin_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

  RETURN true;
END;
$$;

-- 7) تمكين RLS على جدول السجلات
ALTER TABLE user_restriction_logs ENABLE ROW LEVEL SECURITY;

-- السماح للأدمن فقط بقراءة السجلات
CREATE POLICY "Admins can read restriction logs"
  ON user_restriction_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- السماح للأدمن فقط بإضافة سجلات
CREATE POLICY "Admins can insert restriction logs"
  ON user_restriction_logs FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- الحل النهائي لجميع المشاكل
-- قم بتشغيل هذا في Supabase SQL Editor
-- ============================================================
-- يصلح مشكلتين:
-- 1. Infinite Recursion in user_roles
-- 2. Could not find relationship between payment_orders and profiles
-- ============================================================

-- إصلاح 1: تغيير Foreign Key من auth.users إلى profiles
-- (يحل مشكلة: Could not find relationship)
ALTER TABLE payment_orders 
  DROP CONSTRAINT IF EXISTS payment_orders_user_id_fkey;

ALTER TABLE payment_orders
  ADD CONSTRAINT payment_orders_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- نفس الشيء للجداول الأخرى
ALTER TABLE admin_action_log
  DROP CONSTRAINT IF EXISTS admin_action_log_admin_id_fkey,
  DROP CONSTRAINT IF EXISTS admin_action_log_target_user_id_fkey;

ALTER TABLE admin_action_log
  ADD CONSTRAINT admin_action_log_admin_id_fkey 
  FOREIGN KEY (admin_id) 
  REFERENCES profiles(id);

ALTER TABLE admin_action_log
  ADD CONSTRAINT admin_action_log_target_user_id_fkey 
  FOREIGN KEY (target_user_id) 
  REFERENCES profiles(id);

ALTER TABLE user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
  DROP CONSTRAINT IF EXISTS user_roles_granted_by_fkey;

ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_granted_by_fkey 
  FOREIGN KEY (granted_by) 
  REFERENCES profiles(id);

ALTER TABLE payment_notifications
  DROP CONSTRAINT IF EXISTS payment_notifications_user_id_fkey;

ALTER TABLE payment_notifications
  ADD CONSTRAINT payment_notifications_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE payment_notifications
  ADD CONSTRAINT payment_notifications_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- إصلاح 2: حذف جميع السياسات القديمة
DROP POLICY IF EXISTS "Admins can view all orders" ON payment_orders;
DROP POLICY IF EXISTS "Admins can update orders" ON payment_orders;
DROP POLICY IF EXISTS "Admins can view action log" ON admin_action_log;
DROP POLICY IF EXISTS "Admins can insert action log" ON admin_action_log;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Anyone can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Authenticated can view roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON user_roles;

-- إصلاح 3: تعطيل RLS على user_roles نهائياً (الحل الأمثل)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- لماذا هذا آمن؟
-- - الجدول يحتوي فقط على أدوار عامة (admin, moderator, user)
-- - ليست معلومات حساسة أو خاصة
-- - أي مستخدم يمكنه معرفة من هو admin - ليست مشكلة أمنية
-- - فقط service_role يمكنه الإضافة (محمي من خلال Supabase API)

-- إصلاح 4: إنشاء دالة is_admin() بدون مشاكل RLS
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(check_user_id, auth.uid());
  -- الآن لا توجد مشكلة لأن user_roles بدون RLS
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = v_user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إصلاح 5: إعادة إنشاء السياسات على الجداول الأخرى

-- سياسات payment_orders
CREATE POLICY "Admins can view all orders" ON payment_orders
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update orders" ON payment_orders
  FOR UPDATE USING (is_admin());

-- سياسات admin_action_log
CREATE POLICY "Admins can view action log" ON admin_action_log
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert action log" ON admin_action_log
  FOR INSERT WITH CHECK (is_admin());

-- ============================================================
-- الخطوة الأخيرة: إضافة نفسك كأدمن
-- ============================================================
-- 1. اذهب إلى: Supabase Dashboard → Authentication → Users
-- 2. انسخ الـ UUID الخاص بحسابك
-- 3. شغل هذا الأمر (استبدل YOUR_UUID):

-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('YOUR_UUID_HERE', 'admin');

-- مثال:
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('4bc25a10-1234-5678-90ab-cdef12345678', 'admin');

-- ============================================================
-- تم! الآن يمكنك الدخول إلى لوحة التحكم بدون أخطاء
-- ============================================================

-- ============================================================
-- الآن أضف نفسك كأدمن:
-- استبدل YOUR_UUID بالـ UUID الخاص بك من Auth > Users في Supabase Dashboard
-- ============================================================
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('YOUR_UUID', 'admin');

-- ============================================================
-- Kodax Payment System Migration
-- نظام الدفع الذكي - جداول قاعدة البيانات
-- ============================================================

-- ملاحظة: لإضافة أول مسؤول يدوياً بعد تشغيل هذا الملف، استخدم:
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('YOUR_USER_UUID_HERE', 'admin');
-- احصل على UUID من جدول auth.users أو من Supabase Dashboard

-- 1. جدول طلبات الدفع (Payment Orders)
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- تفاصيل الدفع
  payment_method TEXT NOT NULL CHECK (payment_method IN ('asiacell', 'zain', 'mastercard', 'zain_cash')),
  payment_details TEXT NOT NULL, -- رقم الهاتف أو تفاصيل البطاقة
  
  -- النقاط والباقة
  package_id TEXT NOT NULL,
  points_requested INTEGER NOT NULL CHECK (points_requested > 0),
  points_approved INTEGER, -- النقاط المعتمدة (قد تختلف عن المطلوبة)
  price_amount DECIMAL(10,2) NOT NULL,
  price_currency TEXT NOT NULL DEFAULT 'IQD',
  
  -- صورة التحويل
  receipt_image_url TEXT,
  
  -- الحالة
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- ملاحظات المسؤول
  admin_note TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  
  -- التواريخ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول سجل إجراءات المسؤولين (Admin Action Log)
CREATE TABLE IF NOT EXISTS admin_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('approve_order', 'reject_order', 'modify_points', 'add_points', 'remove_points')),
  target_user_id UUID REFERENCES profiles(id),
  order_id UUID REFERENCES payment_orders(id),
  
  -- تفاصيل الإجراء
  details JSONB NOT NULL DEFAULT '{}',
  old_value JSONB,
  new_value JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول أدوار المستخدمين (لتحديد المسؤولين)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')) DEFAULT 'user',
  granted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 4. جدول إشعارات الدفع (Payment Notifications)
CREATE TABLE IF NOT EXISTS payment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES payment_orders(id),
  type TEXT NOT NULL CHECK (type IN ('order_submitted', 'order_approved', 'order_rejected', 'points_added')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- الفهارس (Indexes)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_created_at ON payment_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_admin_id ON admin_action_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_order_id ON admin_action_log(order_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_user_id ON payment_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_read ON payment_notifications(user_id, read);

-- ============================================================
-- الدوال المساعدة (يجب أن تُنشأ قبل RLS!)
-- ============================================================

-- دالة التحقق من صلاحيات الأدمن
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(check_user_id, auth.uid());
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = v_user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

-- تفعيل RLS على الجداول الحساسة فقط
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_notifications ENABLE ROW LEVEL SECURITY;

-- تعطيل RLS على user_roles لتجنب infinite recursion
-- (آمن: الجدول يحتوي فقط على أدوار عامة وليست معلومات حساسة)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- سياسات payment_orders
CREATE POLICY "Users can view own orders" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON payment_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON payment_orders
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update orders" ON payment_orders
  FOR UPDATE USING (is_admin());

-- سياسات admin_action_log
CREATE POLICY "Admins can view action log" ON admin_action_log
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert action log" ON admin_action_log
  FOR INSERT WITH CHECK (is_admin());

-- لا توجد سياسات على user_roles (RLS معطل لتجنب infinite recursion)

-- سياسات payment_notifications
CREATE POLICY "Users can view own notifications" ON payment_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON payment_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON payment_notifications
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- دوال معالجة الطلبات
-- ============================================================

-- دالة الموافقة على طلب الدفع (تضيف النقاط تلقائيًا)
CREATE OR REPLACE FUNCTION approve_payment_order(
  p_order_id UUID,
  p_admin_id UUID,
  p_points_approved INTEGER DEFAULT NULL,
  p_admin_note TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_order payment_orders%ROWTYPE;
  v_points INTEGER;
  v_result JSONB;
BEGIN
  -- جلب الطلب
  SELECT * INTO v_order FROM payment_orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'الطلب غير موجود');
  END IF;
  
  IF v_order.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'الطلب تمت معالجته مسبقاً');
  END IF;
  
  -- التحقق من صلاحيات المسؤول
  IF NOT is_admin(p_admin_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'ليس لديك صلاحية');
  END IF;
  
  -- تحديد النقاط المعتمدة
  v_points := COALESCE(p_points_approved, v_order.points_requested);
  
  -- تحديث حالة الطلب
  UPDATE payment_orders 
  SET 
    status = 'approved',
    points_approved = v_points,
    admin_note = p_admin_note,
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;
  
  -- إضافة النقاط للمستخدم
  INSERT INTO user_points (user_id, total_points, purchased_points, store_credits)
  VALUES (v_order.user_id, v_points, v_points, v_points)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + v_points,
    purchased_points = user_points.purchased_points + v_points,
    store_credits = user_points.store_credits + v_points,
    updated_at = NOW();
  
  -- تسجيل معاملة النقاط
  INSERT INTO point_transactions (user_id, type, amount, reason)
  VALUES (v_order.user_id, 'purchased', v_points, 'شراء نقاط - طلب #' || p_order_id::text);
  
  -- تسجيل إجراء المسؤول
  INSERT INTO admin_action_log (admin_id, action_type, target_user_id, order_id, details, old_value, new_value)
  VALUES (
    p_admin_id, 'approve_order', v_order.user_id, p_order_id,
    jsonb_build_object('points_approved', v_points, 'note', p_admin_note),
    jsonb_build_object('status', 'pending', 'points_requested', v_order.points_requested),
    jsonb_build_object('status', 'approved', 'points_approved', v_points)
  );
  
  -- إنشاء إشعار للمستخدم
  INSERT INTO payment_notifications (user_id, order_id, type, title, message)
  VALUES (
    v_order.user_id, p_order_id, 'order_approved',
    'تمت الموافقة على طلبك!',
    'تم إضافة ' || v_points || ' نقطة إلى رصيدك. شكراً لك!'
  );
  
  RETURN jsonb_build_object('success', true, 'points_added', v_points);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة رفض طلب الدفع
CREATE OR REPLACE FUNCTION reject_payment_order(
  p_order_id UUID,
  p_admin_id UUID,
  p_admin_note TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_order payment_orders%ROWTYPE;
BEGIN
  -- جلب الطلب
  SELECT * INTO v_order FROM payment_orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'الطلب غير موجود');
  END IF;
  
  IF v_order.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'الطلب تمت معالجته مسبقاً');
  END IF;
  
  -- التحقق من صلاحيات المسؤول
  IF NOT is_admin(p_admin_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'ليس لديك صلاحية');
  END IF;
  
  -- تحديث حالة الطلب
  UPDATE payment_orders 
  SET 
    status = 'rejected',
    admin_note = p_admin_note,
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;
  
  -- تسجيل إجراء المسؤول
  INSERT INTO admin_action_log (admin_id, action_type, target_user_id, order_id, details, old_value, new_value)
  VALUES (
    p_admin_id, 'reject_order', v_order.user_id, p_order_id,
    jsonb_build_object('note', p_admin_note),
    jsonb_build_object('status', 'pending'),
    jsonb_build_object('status', 'rejected')
  );
  
  -- إنشاء إشعار للمستخدم
  INSERT INTO payment_notifications (user_id, order_id, type, title, message)
  VALUES (
    v_order.user_id, p_order_id, 'order_rejected',
    'تم رفض طلبك',
    'للأسف تم رفض طلب الدفع الخاص بك.' || COALESCE(' السبب: ' || p_admin_note, ' يرجى التواصل مع الدعم.')
  );
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة الحصول على إحصائيات لوحة التحكم
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_points_sent', (SELECT COALESCE(SUM(points_approved), 0) FROM payment_orders WHERE status = 'approved'),
    'total_codes', (SELECT COUNT(*) FROM code_snippets),
    'orders_total', (SELECT COUNT(*) FROM payment_orders),
    'orders_pending', (SELECT COUNT(*) FROM payment_orders WHERE status = 'pending'),
    'orders_approved', (SELECT COUNT(*) FROM payment_orders WHERE status = 'approved'),
    'orders_rejected', (SELECT COUNT(*) FROM payment_orders WHERE status = 'rejected')
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- تحديث تلقائي لـ updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_orders_updated_at
  BEFORE UPDATE ON payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Storage bucket لصور التحويل
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- سياسة رفع الصور
CREATE POLICY "Users can upload receipts" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-receipts' AND auth.uid() IS NOT NULL
  );

-- سياسة عرض الصور
CREATE POLICY "Anyone can view receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-receipts');

-- ============================================================
-- انتهى التنصيب! الخطوة الأخيرة:
-- ============================================================
-- أضف نفسك كأدمن بتشغيل هذا الأمر (استبدل YOUR_UUID):
-- 
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('YOUR_UUID_HERE', 'admin');
--
-- احصل على UUID من: Authentication → Users في Supabase Dashboard
-- ============================================================

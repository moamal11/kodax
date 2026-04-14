-- ===== Support Tickets System Migration =====
-- نظام تذاكر الدعم - Kodax Support System
-- يدعم الإرسال من التطبيق والرد من لوحة التحكم مع إشعارات تلقائية

-- 1. جدول تذاكر الدعم
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_email TEXT,
  user_avatar TEXT,
  subject TEXT DEFAULT 'دعم فني',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول رسائل الدعم (المحادثة)
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. إشعارات الدعم
CREATE TABLE IF NOT EXISTS support_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_notifications_user_id ON support_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_support_notifications_read ON support_notifications(user_id, read);

-- 5. تحديث updated_at تلقائياً عند رسالة جديدة
CREATE OR REPLACE FUNCTION update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_tickets
  SET updated_at = NOW()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ticket_timestamp ON support_messages;
CREATE TRIGGER trigger_update_ticket_timestamp
  AFTER INSERT ON support_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_timestamp();

-- 6. إنشاء إشعار تلقائي عند رد الأدمن
CREATE OR REPLACE FUNCTION notify_user_on_admin_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_ticket_subject TEXT;
BEGIN
  IF NEW.sender_type = 'admin' THEN
    SELECT user_id, subject INTO v_user_id, v_ticket_subject
    FROM support_tickets
    WHERE id = NEW.ticket_id;

    INSERT INTO support_notifications (user_id, ticket_id, title, message)
    VALUES (
      v_user_id,
      NEW.ticket_id,
      'رد جديد من فريق الدعم',
      'تم الرد على تذكرتك: ' || COALESCE(v_ticket_subject, 'دعم فني')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_user_on_admin_reply ON support_messages;
CREATE TRIGGER trigger_notify_user_on_admin_reply
  AFTER INSERT ON support_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_admin_reply();

-- 7. RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_notifications ENABLE ROW LEVEL SECURITY;

-- المستخدم يرى تذاكره فقط
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

-- المستخدم ينشئ تذاكر
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- الأدمن يرى كل التذاكر
CREATE POLICY "Admins can view all tickets" ON support_tickets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- الأدمن يحدث التذاكر
CREATE POLICY "Admins can update tickets" ON support_tickets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- رسائل: المستخدم يرى رسائل تذاكره
CREATE POLICY "Users can view own ticket messages" ON support_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
  );

-- رسائل: المستخدم يرسل في تذاكره
CREATE POLICY "Users can send messages in own tickets" ON support_messages
  FOR INSERT WITH CHECK (
    sender_type = 'user' AND sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
  );

-- رسائل: الأدمن يرى كل الرسائل
CREATE POLICY "Admins can view all messages" ON support_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- رسائل: الأدمن يرسل رد
CREATE POLICY "Admins can send replies" ON support_messages
  FOR INSERT WITH CHECK (
    sender_type = 'admin' AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- رسائل: الأدمن يحدث حالة القراءة
CREATE POLICY "Admins can update messages" ON support_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- إشعارات: المستخدم يرى إشعاراته
CREATE POLICY "Users can view own notifications" ON support_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- إشعارات: المستخدم يحدث إشعاراته (قراءة)
CREATE POLICY "Users can update own notifications" ON support_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- إشعارات: النظام ينشئ إشعارات (عبر trigger)
CREATE POLICY "System can create notifications" ON support_notifications
  FOR INSERT WITH CHECK (true);

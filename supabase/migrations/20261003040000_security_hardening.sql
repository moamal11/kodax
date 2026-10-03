-- ============================================================================
-- G-1: تقوية أمان الإنتاج (Production Security Hardening)
-- ----------------------------------------------------------------------------
-- يغلق الثغرات المؤكدة في فحص G-0 (قراءة مباشرة من الإنتاج):
--   1) admin_toggle_ban / admin_toggle_purchase_block كانتا تثقان بـ p_admin_id القادم من العميل
--   2) أعمدة الحظر في profiles قابلة للتعديل من صاحب الحساب نفسه
--   3) insert_interaction_notification قابلة للاستدعاء من anon
--   4) app_notifications / support_notifications: إدراج إشعار لأي مستخدم
--   5) conversation_participants: الانضمام لأي محادثة أو نقل العضوية إليها
--   6) get_or_create_conversation: كشف/إنشاء محادثة بين أي مستخدمَين
--   7) update_course_progress / cleanup_old_ai_usage / get_admin_stats: مفتوحة لـ anon
--   8) is_admin(uuid): فحص صلاحية أي UUID
--   9) messages: تعديل محتوى رسائل الطرف الآخر
-- مبادئ: لا حذف بيانات، نفس التواقيع (لوحة التحكم والتطبيق الحالي يعملان)، وكل الأوامر قابلة لإعادة التشغيل.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0) is_admin: لا يكشف صلاحية مستخدم آخر لغير الموثوقين
-- ----------------------------------------------------------------------------
-- تبقى قابلة للتنفيذ من anon لأن سياسات RLS لجداول يقرؤها الزائر (code_snippets، challenge_catalog،
-- coin_config، lesson_catalog، storage.objects ...) تستدعيها، وسحب التنفيذ يكسر تلك القراءات.
-- الحماية داخل الدالة: فحص UUID غير المستدعي نفسه مسموح فقط لمشرف أو لسياق السيرفر (service_role/postgres).
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_target UUID := COALESCE(check_user_id, auth.uid());
BEGIN
  IF v_target IS NULL THEN
    RETURN FALSE;
  END IF;
  IF v_target IS DISTINCT FROM v_caller THEN
    IF v_caller IS NULL THEN
      -- بلا مستخدم: مسموح لسياق السيرفر فقط، لا لطلبات anon/authenticated
      IF COALESCE(auth.role(), '') IN ('anon', 'authenticated')
         OR COALESCE(current_setting('role', true), '') IN ('anon', 'authenticated') THEN
        RETURN FALSE;
      END IF;
    ELSIF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = v_caller AND role = 'admin') THEN
      RETURN FALSE;
    END IF;
  END IF;
  RETURN EXISTS (SELECT 1 FROM user_roles WHERE user_id = v_target AND role = 'admin');
END;
$$;
REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 1) حماية أعمدة profiles: أعمدة الحظر لا يكتبها إلا المشرف أو دوال السيرفر
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') AND NOT is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.xp := 0;
      NEW.level := 1;
      NEW.is_purchase_blocked := FALSE;
      NEW.streak_days := 0;
      NEW.is_banned := FALSE;
      NEW.ban_reason := NULL;
      NEW.banned_at := NULL;
      NEW.banned_by := NULL;
    ELSE
      NEW.xp := OLD.xp;
      NEW.level := OLD.level;
      NEW.is_purchase_blocked := OLD.is_purchase_blocked;
      NEW.streak_days := OLD.streak_days;
      NEW.is_banned := OLD.is_banned;
      NEW.ban_reason := OLD.ban_reason;
      NEW.banned_at := OLD.banned_at;
      NEW.banned_by := OLD.banned_by;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- سجل إجراءات المشرف يقبل إجراءات الحظر والتقييد (القيم القديمة باقية كما هي)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_action_log_action_type_check') THEN
    ALTER TABLE admin_action_log DROP CONSTRAINT admin_action_log_action_type_check;
  END IF;
  ALTER TABLE admin_action_log ADD CONSTRAINT admin_action_log_action_type_check
    CHECK (action_type IN ('approve_order', 'reject_order', 'modify_points', 'add_points', 'remove_points',
                           'ban', 'unban', 'block_purchase', 'unblock_purchase'));
END $$;

-- ----------------------------------------------------------------------------
-- 2) admin_toggle_ban: المنفذ الحقيقي هو auth.uid()؛ p_admin_id للتوافق فقط ويُتجاهل
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_toggle_ban(
  p_user_id UUID, p_ban BOOLEAN, p_reason TEXT DEFAULT NULL, p_admin_id UUID DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin UUID := auth.uid();
  v_old BOOLEAN;
BEGIN
  IF v_admin IS NULL OR NOT is_admin(v_admin) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF p_user_id IS NULL OR p_ban IS NULL THEN
    RAISE EXCEPTION 'invalid_arguments' USING ERRCODE = '22023';
  END IF;
  IF p_ban AND p_user_id = v_admin THEN
    RAISE EXCEPTION 'cannot_ban_self' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(is_banned, FALSE) INTO v_old FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_not_found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE profiles
  SET is_banned = p_ban,
      ban_reason = CASE WHEN p_ban THEN p_reason ELSE NULL END,
      banned_at = CASE WHEN p_ban THEN now() ELSE NULL END,
      banned_by = CASE WHEN p_ban THEN v_admin ELSE NULL END
  WHERE id = p_user_id;

  INSERT INTO user_restriction_logs (user_id, action, reason, performed_by)
  VALUES (p_user_id, CASE WHEN p_ban THEN 'ban' ELSE 'unban' END, p_reason, v_admin);

  INSERT INTO admin_action_log (admin_id, action_type, target_user_id, details, old_value, new_value)
  VALUES (v_admin, CASE WHEN p_ban THEN 'ban' ELSE 'unban' END, p_user_id,
          jsonb_build_object('reason', p_reason),
          jsonb_build_object('is_banned', v_old), jsonb_build_object('is_banned', p_ban));

  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_toggle_ban(UUID, BOOLEAN, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_toggle_ban(UUID, BOOLEAN, TEXT, UUID) TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 3) admin_toggle_purchase_block (تقييد الكوينات): نفس المبدأ
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_toggle_purchase_block(
  p_user_id UUID, p_block BOOLEAN, p_reason TEXT DEFAULT NULL, p_admin_id UUID DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin UUID := auth.uid();
  v_old BOOLEAN;
BEGIN
  IF v_admin IS NULL OR NOT is_admin(v_admin) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF p_user_id IS NULL OR p_block IS NULL THEN
    RAISE EXCEPTION 'invalid_arguments' USING ERRCODE = '22023';
  END IF;

  SELECT COALESCE(is_purchase_blocked, FALSE) INTO v_old FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_not_found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE profiles SET is_purchase_blocked = p_block WHERE id = p_user_id;

  INSERT INTO user_restriction_logs (user_id, action, reason, performed_by)
  VALUES (p_user_id, CASE WHEN p_block THEN 'block_purchase' ELSE 'unblock_purchase' END, p_reason, v_admin);

  INSERT INTO admin_action_log (admin_id, action_type, target_user_id, details, old_value, new_value)
  VALUES (v_admin, CASE WHEN p_block THEN 'block_purchase' ELSE 'unblock_purchase' END, p_user_id,
          jsonb_build_object('reason', p_reason),
          jsonb_build_object('is_purchase_blocked', v_old), jsonb_build_object('is_purchase_blocked', p_block));

  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_toggle_purchase_block(UUID, BOOLEAN, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_toggle_purchase_block(UUID, BOOLEAN, TEXT, UUID) TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 4) الإشعارات
-- ----------------------------------------------------------------------------
-- تُستدعى فقط من triggers الإعجاب/التعليق/المتابعة (SECURITY DEFINER بمالك postgres)
REVOKE ALL ON FUNCTION public.insert_interaction_notification(UUID, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.insert_interaction_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO service_role;

-- إدراج إشعار لأي مستخدم: يُحذف. يبقى "Users can manage their own notifications" (إشعارات المستخدم لنفسه فقط)
DROP POLICY IF EXISTS "System can insert notifications for any user" ON app_notifications;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON app_notifications FROM anon;

-- إشعار رد الدعم: الـtrigger يكتب بصلاحية النظام بدل صلاحية المشرف، ثم يُغلق الإدراج من العميل
CREATE OR REPLACE FUNCTION public.notify_user_on_admin_reply()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;
REVOKE ALL ON FUNCTION public.notify_user_on_admin_reply() FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "System can create notifications" ON support_notifications;
REVOKE INSERT, DELETE, TRUNCATE, REFERENCES, TRIGGER ON support_notifications FROM anon, authenticated;
REVOKE UPDATE ON support_notifications FROM anon;

-- ----------------------------------------------------------------------------
-- 5) المحادثات الخاصة
-- ----------------------------------------------------------------------------
-- user_is_in_conversation: تستخدمها السياسات دائماً مع auth.uid()؛ لا تجيب عن مستخدم آخر لغير السيرفر
CREATE OR REPLACE FUNCTION public.user_is_in_conversation(conv_id UUID, check_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  IF check_user_id IS DISTINCT FROM auth.uid()
     AND (COALESCE(auth.role(), '') IN ('anon', 'authenticated')
          OR COALESCE(current_setting('role', true), '') IN ('anon', 'authenticated')) THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id AND user_id = check_user_id
  );
END;
$$;
REVOKE ALL ON FUNCTION public.user_is_in_conversation(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_is_in_conversation(UUID, UUID) TO anon, authenticated, service_role;

-- العضوية تُنشأ فقط عبر get_or_create_conversation (SECURITY DEFINER)
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
-- المستخدم يحدّث وقت القراءة فقط؛ لا conversation_id ولا user_id ولا joined_at
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON conversation_participants FROM anon, authenticated;
GRANT UPDATE (last_read_at) ON conversation_participants TO authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON conversations FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_conversation_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;
  -- لا يمكن طلب محادثة باسم مستخدم آخر
  IF user1_id IS DISTINCT FROM v_uid THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF user2_id IS NULL OR user2_id = v_uid THEN
    RAISE EXCEPTION 'invalid_recipient' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user2_id) THEN
    RAISE EXCEPTION 'user_not_found' USING ERRCODE = 'P0002';
  END IF;
  -- الحظر بأي اتجاه يمنع التواصل
  IF EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (blocker_id = v_uid AND blocked_id = user2_id)
       OR (blocker_id = user2_id AND blocked_id = v_uid)
  ) THEN
    RAISE EXCEPTION 'blocked' USING ERRCODE = '42501';
  END IF;

  SELECT c.id INTO v_conversation_id
  FROM conversations c
  WHERE EXISTS (SELECT 1 FROM conversation_participants cp1 WHERE cp1.conversation_id = c.id AND cp1.user_id = v_uid)
    AND EXISTS (SELECT 1 FROM conversation_participants cp2 WHERE cp2.conversation_id = c.id AND cp2.user_id = user2_id)
    AND (SELECT COUNT(*) FROM conversation_participants cp WHERE cp.conversation_id = c.id) = 2
  LIMIT 1;

  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO v_conversation_id;
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (v_conversation_id, v_uid), (v_conversation_id, user2_id);
  END IF;

  RETURN v_conversation_id;
END;
$$;
REVOKE ALL ON FUNCTION public.get_or_create_conversation(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(UUID, UUID) TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 6) الرسائل: المرسل يعدّل رسالته فقط، والمستلم يغيّر حالة القراءة فقط
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update message read status" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS messages_update_participants ON messages;
CREATE POLICY messages_update_participants ON messages FOR UPDATE TO authenticated
  USING (user_is_in_conversation(conversation_id, auth.uid()))
  WITH CHECK (user_is_in_conversation(conversation_id, auth.uid()));

-- أعمدة الملكية (id, conversation_id, sender_id, created_at) غير قابلة للتعديل من العميل إطلاقاً
REVOKE UPDATE, TRUNCATE, REFERENCES, TRIGGER ON messages FROM anon, authenticated;
REVOKE INSERT, DELETE ON messages FROM anon;
GRANT UPDATE (content, is_read, is_edited, is_deleted, updated_at) ON messages TO authenticated;

CREATE OR REPLACE FUNCTION public._messages_guard_update()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') THEN
    RETURN NEW; -- السيرفر/المشرف عبر service_role
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'message_ownership_immutable' USING ERRCODE = '42501';
  END IF;
  IF auth.uid() IS NOT DISTINCT FROM OLD.sender_id THEN
    -- المرسل: تعديل أو حذف ناعم لرسالته، لا تغيير لحالة قراءتها
    IF NEW.is_read IS DISTINCT FROM OLD.is_read THEN
      RAISE EXCEPTION 'sender_cannot_change_read_state' USING ERRCODE = '42501';
    END IF;
  ELSE
    -- المستلم: حالة القراءة فقط
    IF NEW.content IS DISTINCT FROM OLD.content
       OR NEW.is_edited IS DISTINCT FROM OLD.is_edited
       OR NEW.is_deleted IS DISTINCT FROM OLD.is_deleted
       OR NEW.updated_at IS DISTINCT FROM OLD.updated_at THEN
      RAISE EXCEPTION 'only_sender_can_edit_message' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public._messages_guard_update() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_messages_guard_update ON messages;
CREATE TRIGGER trg_messages_guard_update BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION public._messages_guard_update();

-- ----------------------------------------------------------------------------
-- 7) تقدم الدورة (جدول قديم): الكتابة لغير المستخدم نفسه عبر الـtrigger فقط
-- ----------------------------------------------------------------------------
-- الـtrigger كان يستدعي update_course_progress بصلاحية المستخدم؛ صار بصلاحية النظام قبل سحب التنفيذ
CREATE OR REPLACE FUNCTION public.trigger_update_course_progress()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- استدعاء دالة تحديث التقدم
  IF NEW.completed = true AND NEW.course_id IS NOT NULL THEN
    PERFORM update_course_progress(
      NEW.user_id,
      NEW.course_id,
      NEW.lesson_id,
      COALESCE(
        (SELECT CAST(SUBSTRING(NEW.lesson_id FROM '-([0-9]+)$') AS INTEGER)),
        1
      ),
      15 -- قيمة افتراضية، يمكن تحديثها
    );
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.trigger_update_course_progress() FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.update_course_progress(UUID, TEXT, TEXT, INTEGER, INTEGER) SET search_path = public;
REVOKE ALL ON FUNCTION public.update_course_progress(UUID, TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_course_progress(UUID, TEXT, TEXT, INTEGER, INTEGER) TO service_role;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON course_progress FROM anon;

-- ----------------------------------------------------------------------------
-- 8) دوال نظام/مشرف قديمة: للسيرفر فقط (بلا حذف بيانات وبلا حذف الدوال)
-- ----------------------------------------------------------------------------
ALTER FUNCTION public.cleanup_old_ai_usage() SET search_path = public;
REVOKE ALL ON FUNCTION public.cleanup_old_ai_usage() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_ai_usage() TO service_role;

ALTER FUNCTION public.get_admin_stats() SET search_path = public;
REVOKE ALL ON FUNCTION public.get_admin_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO service_role;

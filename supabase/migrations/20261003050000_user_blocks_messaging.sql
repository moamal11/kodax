-- ============================================================================
-- حظر المستخدمين (User-to-User Blocking) — إكمال النظام الموجود دون جدول جديد
-- ----------------------------------------------------------------------------
-- user_blocks وسياسته user_blocks_own (blocker_id = auth.uid()) موجودان منذ 20260930000100 وصحيحان:
-- المستخدم ينشئ/يرى/يحذف حظره هو فقط، و CHECK يمنع حظر النفس. get_or_create_conversation يرفض
-- المحادثة الجديدة بين طرفين بينهما حظر (منذ 20261003040000).
-- الناقص:
--   1) إرسال رسالة جديدة في محادثة قائمة لا يفحص الحظر (المحظور يستطيع الكتابة لمن حظره).
--   2) المشرف لا يستطيع قراءة user_blocks لأغراض الإشراف.
-- لا تغيير لأي صف موجود في user_blocks.
-- ============================================================================

-- هل يوجد حظر (بأي اتجاه) بين المستخدم الحالي وطرف آخر في هذه المحادثة؟
-- تعتمد على auth.uid() فقط: لا تجيب عن علاقة لا يكون المستدعي طرفاً فيها.
CREATE OR REPLACE FUNCTION public.dm_is_blocked(conv_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_participants cp
    JOIN user_blocks b
      ON (b.blocker_id = cp.user_id AND b.blocked_id = auth.uid())
      OR (b.blocker_id = auth.uid() AND b.blocked_id = cp.user_id)
    WHERE cp.conversation_id = conv_id
      AND cp.user_id <> auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.dm_is_blocked(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dm_is_blocked(UUID) TO authenticated, service_role;

-- إرسال رسالة: نفس الشروط السابقة + لا حظر بين الطرفين (بأي اتجاه، مثل بدء المحادثة)
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
    )
    AND NOT dm_is_blocked(conversation_id)
  );

-- المشرف يقرأ علاقات الحظر للإشراف (قراءة فقط؛ الكتابة تبقى لصاحب الحظر)
DROP POLICY IF EXISTS user_blocks_admin_read ON user_blocks;
CREATE POLICY user_blocks_admin_read ON user_blocks FOR SELECT TO authenticated USING (is_admin());

-- الزائر لا يكتب في user_blocks (كانت RLS تمنعه أصلاً؛ هذا إغلاق على مستوى الصلاحيات)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON user_blocks FROM anon;

# إصلاح Infinite Recursion في RLS Policies

## المشكلة

```
{code: '42P17', message: 'infinite recursion detected in policy for relation "conversation_participants"'}
```

### السبب

الـ RLS policy لجدول `conversation_participants` كان يستعلم من نفس الجدول:

```sql
-- ❌ هذا يسبب infinite recursion
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants  -- ⚠️ يستعلم من نفس الجدول!
      WHERE user_id = auth.uid()
    )
  );
```

عندما يحاول Supabase تطبيق policy على استعلام من نفس الجدول، يدخل في حلقة لا نهائية!

---

## الحل

استخدام **SECURITY DEFINER function** لتجاوز RLS policies:

```sql
-- ✅ Function تتجاوز RLS checks
CREATE OR REPLACE FUNCTION user_is_in_conversation(conv_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id
      AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;  -- 🔑 المفتاح هنا
```

ثم نستخدمها في جميع الـ policies:

```sql
-- ✅ بدون recursion
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (user_is_in_conversation(conversation_id, auth.uid()));
```

---

## كيفية التطبيق

### الخطوة 1: افتح Supabase Dashboard

1. اذهب إلى https://supabase.com/dashboard
2. اختر مشروعك
3. اذهب إلى **SQL Editor**

### الخطوة 2: شغّل الـ Migration المحدث

انسخ محتوى أحد الملفات التالية وشغله:

**الخيار 1:** Migration السريع (يحتفظ بالبيانات)

```bash
# استخدم: supabase/messages_edit_delete_migration.sql
```

**الخيار 2:** Schema الكامل (إذا كنت تريد إعادة إنشاء كل شيء)

```bash
# استخدم: supabase/messages_schema.sql
```

### الخطوة 3: تحقق من النجاح

شغل هذا الاستعلام للتأكد من وجود الـ function:

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'user_is_in_conversation';

-- يجب أن ترى:
-- user_is_in_conversation
```

تحقق من الـ policies:

```sql
SELECT * FROM pg_policies
WHERE tablename IN ('conversations', 'conversation_participants', 'messages');

-- يجب أن تكون policies محدثة بدون EXISTS subqueries
```

---

## الملفات المحدثة

1. ✅ **supabase/messages_schema.sql**
   - إضافة `user_is_in_conversation()` function
   - تحديث جميع الـ RLS policies لاستخدام function

2. ✅ **supabase/messages_edit_delete_migration.sql**
   - إضافة `user_is_in_conversation()` function
   - تحديث policies بدون حذف بيانات

---

## قبل وبعد

### قبل (❌ Infinite Recursion):

```sql
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants  -- ⚠️ recursion
      WHERE user_id = auth.uid()
    )
  );
```

### بعد (✅ يعمل بشكل صحيح):

```sql
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (user_is_in_conversation(conversation_id, auth.uid()));
```

---

## التغييرات المطبقة على جميع الـ Policies:

| Policy                             | قبل                                                           | بعد                                                      |
| ---------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| conversations - SELECT             | `EXISTS (SELECT... conversation_participants...)`             | `user_is_in_conversation(id, auth.uid())`                |
| conversation_participants - SELECT | `conversation_id IN (SELECT... conversation_participants...)` | `user_is_in_conversation(conversation_id, auth.uid())`   |
| messages - SELECT                  | `EXISTS (SELECT... conversation_participants...)`             | `user_is_in_conversation(conversation_id, auth.uid())`   |
| messages - INSERT                  | `EXISTS (SELECT... conversation_participants...)`             | `user_is_in_conversation(conversation_id, auth.uid())`   |
| messages - UPDATE                  | `EXISTS (SELECT... conversation_participants...)`             | `sender_id = auth.uid() OR user_is_in_conversation(...)` |

---

## لماذا SECURITY DEFINER يحل المشكلة؟

- **SECURITY DEFINER**: الـ function تعمل بصلاحيات المالك (owner)، **وليس** المستخدم الحالي
- **تتجاوز RLS**: لا تطبق Row Level Security على الاستعلامات داخل الـ function
- **آمنة**: طالما logic الـ function صحيح، الأمان مضمون
- **بدون recursion**: لأن RLS لا يطبق داخل الـ function، لا يوجد حلقة لا نهائية

---

## اختبار الإصلاح

بعد تطبيق الـ migration، جرب:

```bash
# شغل التطبيق
npm start

# افتح محادثة
# يجب أن لا ترى خطأ 42P17
# يجب أن المحادثات تحمل بشكل طبيعي
```

تحقق من Console:

```
✅ لا توجد أخطاء 42P17
✅ لا توجد رسائل infinite recursion
✅ المحادثات تحمل بسرعة
```

---

## حل المشاكل

### المشكلة: Function غير موجودة

```sql
-- تأكد من تشغيل create function
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'user_is_in_conversation';
```

### المشكلة: Policies لم تتحدث

```sql
-- احذف policies القديمة يدوياً
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
-- ثم أعد تشغيل migration
```

### المشكلة: Permission denied

```sql
-- تأكد من GRANT execute
GRANT EXECUTE ON FUNCTION user_is_in_conversation TO authenticated;
```

---

**التاريخ:** February 10, 2026  
**الحالة:** ✅ تم الإصلاح

# إضافة نظام المراسلات - Messages System Setup

تم إضافة نظام مراسلات كامل بين المستخدمين في التطبيق.

## ⚠️ إصلاحات مهمة (Update - 10 Feb 2026)

### 1. إصلاح مشكلة Foreign Key Relationship

**المشكلة:** `Could not find a relationship between 'messages' and 'profiles' in the schema cache`

**السبب:** الجداول كانت تستخدم `REFERENCES auth.users(id)` لكننا نحتاج Join مع `profiles`

**الحل:** تم تغيير Foreign Keys ليشير إلى `profiles` بدلاً من `auth.users`:

```sql
-- OLD
user_id UUID REFERENCES auth.users(id)
sender_id UUID REFERENCES auth.users(id)

-- NEW
user_id UUID REFERENCES profiles(id)
sender_id UUID REFERENCES profiles(id)
```

**⚠️ مهم:** إذا قمت بتشغيل النسخة القديمة من Schema، يجب حذف الجداول وإعادة إنشائها:

```sql
-- احذف الجداول القديمة أولاً (إذا كانت موجودة)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
-- ثم شغل باقي Schema من الملف
```

### 2. إصلاح مشكلة 406 Not Acceptable

**المشكلة:** `GET conversation_participants 406 (Not Acceptable)`

**السبب:** RLS policy كان يسمح فقط برؤية السجلات حيث `user_id = auth.uid()`، لكننا نحتاج رؤية المشاركين الآخرين.

**الحل:** تم تعديل policy ليسمح برؤية جميع المشاركين:

```sql
-- OLD (كان يسبب 406)
USING (user_id = auth.uid());

-- NEW (يسمح برؤية جميع المشاركين في محادثاتك)
USING (
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants
    WHERE user_id = auth.uid()
  )
);
```

### 3. إضافة زر الرسائل في الصفحة الرئيسية

- ✅ **أيقونة الرسائل** - تم إضافة زر بجانب زر الإشعارات
- ✅ **عدد الرسائل غير المقروءة** - badge أحمر يعرض العدد
- ✅ **تحديث تلقائي** - كل 30 ثانية
- ✅ **رسوم متحركة** - animation عند تغير العدد
- ✅ **Component جديد** - `MessagesButton.tsx`

### 4. إصلاح مشكلة Infinite Recursion

**المشكلة:** `infinite recursion detected in policy for relation "conversation_participants"`

**الحل:** تم تبسيط RLS policy لـ `conversation_participants`:

```sql
-- OLD (كان يسبب infinite recursion)
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
  )
);

-- NEW (مبسط وآمن)
USING (user_id = auth.uid());
```

### 3. تحسين المشاركة

- ✅ **إضافة URL حقيقي** - الآن يتم مشاركة رابط `https://kodax.app/user/{userId}`
- ✅ **دعم iOS** - استخدام خاصية `url` للمشاركة كرابط
- ✅ **رسالة محسّنة** - تتضمن اسم المستخدم والرابط

### 4. إزالة التقدم اليومي (Streak Badge)

- ✅ **يظهر فقط في ملفك الشخصي** - لن يظهر streak badge في ملفات المستخدمين الآخرين
- ✅ **الخصوصية** - المستخدمون الآخرون لن يروا تقدمك اليومي

## 🔄 التحديث المطلوب

### خطوات تشغيل Migration المُحدّث

#### إذا كانت هذه أول مرة تشغل فيها Schema:

1. افتح **Supabase Dashboard**
2. اذهب إلى **SQL Editor**
3. انسخ محتوى الملف `supabase/messages_schema.sql` **كاملاً**
4. الصق المحتوى في SQL Editor
5. اضغط **Run**

#### إذا قمت بتشغيل النسخة القديمة من قبل:

1. افتح **Supabase Dashboard** → **SQL Editor**
2. شغّل هذا الأمر أولاً لحذف الجداول القديمة:

```sql
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
```

3. ثم انسخ والصق محتوى `supabase/messages_schema.sql` **الجديد** كاملاً
4. اضغط **Run**

**⚠️ تحذير:** حذف الجداول سيحذف جميع المحادثات والرسائل الموجودة. إذا كان لديك بيانات مهمة، احتفظ بنسخة احتياطية أولاً.

---

## ✨ الميزات الجديدة

### 1. صفحة الكود (Code Feed)

- ✅ **تم إزالة زر الإضافة العائم (FAB)** - لم يعد الزر يظهر فوق المحتوى
- ✅ **زر الإضافة في الهيدر** - تم نقل زر إضافة كود إلى الهيدر
- ✅ **البحث دائم الظهور** - شريط البحث ظاهر دائماً بدون حاجة للنقر

### 2. نظام المراسلات الكامل

- ✅ **محادثات فورية** - إرسال واستقبال الرسائل بشكل فوري
- ✅ **إشعارات الرسائل غير المقروءة** - عدد الرسائل غير المقروءة لكل محادثة
- ✅ **Real-time updates** - تحديث فوري عند وصول رسائل جديدة
- ✅ **صفحة قائمة المحادثات** - عرض جميع المحادثات مع آخر رسالة
- ✅ **صفحة المحادثة الفردية** - واجهة دردشة كاملة مع الرسائل

### 3. إضافات في صفحة الملف الشخصي

- ✅ **زر المراسلة** - بجانب زر المتابعة للمراسلة المباشرة
- ✅ **زر المشاركة** - مشاركة ملف المستخدم

## 🗄️ قاعدة البيانات

تم إنشاء الجداول التالية:

- `conversations` - جدول المحادثات
- `conversation_participants` - المشاركين في كل محادثة
- `messages` - جدول الرسائل

## 📝 خطوات التفعيل

### 1. تشغيل Migration في Supabase

1. افتح **Supabase Dashboard**
2. اذهب إلى **SQL Editor**
3. انسخ محتوى الملف `supabase/messages_schema.sql`
4. الصق المحتوى في SQL Editor
5. اضغط **Run** لتنفيذ الـ SQL

### 2. التأكد من RLS Policies

بعد تشغيل الـ Migration، تأكد من:

- ✅ Row Level Security مفعّل على الجداول الثلاثة
- ✅ Policies موجودة لكل جدول
- ✅ Function `get_or_create_conversation` موجودة

### 3. اختبار النظام

1. قم بتشغيل التطبيق: `npx expo start`
2. سجل دخول بحسابين مختلفين
3. اذهب إلى ملف شخصي لمستخدم آخر
4. اضغط على زر **مراسلة**
5. أرسل رسالة واختبر الرسائل الفورية

## 📱 الصفحات الجديدة

### `/messages` - قائمة المحادثات

- عرض جميع المحادثات
- آخر رسالة في كل محادثة
- عدد الرسائل غير المقروءة
- الصور الشخصية للمستخدمين

### `/message/[id]` - صفحة المحادثة

- عرض جميع الرسائل
- إرسال رسائل جديدة
- تحديث فوري (Real-time)
- تمييز الرسائل المرسلة والمستقبلة
- Keyboard handling

## 🔧 الملفات المعدلة

### Frontend

- ✅ `app/(tabs)/code.tsx` - إزالة FAB وإضافة زر في الهيدر
- ✅ `app/user/[id].tsx` - إضافة أزرار المراسلة والمشاركة
- ✅ `app/messages.tsx` - صفحة قائمة المحادثات (جديد)
- ✅ `app/message/[id].tsx` - صفحة المحادثة الفردية (جديد)

### Backend/Services

- ✅ `src/services/messageService.ts` - جميع وظائف المراسلة (جديد)
- ✅ `supabase/messages_schema.sql` - Schema قاعدة البيانات (جديد)

## 🎨 التصميم

- تصميم داكن متناسق مع باقي التطبيق
- gradients بنفسجية (#8b5cf6, #7c3aed)
- رسوم متحركة سلسة (Animated)
- Responsive design للويب والموبايل

## 🚀 الاستخدام

### فتح محادثة جديدة

```typescript
// من أي مكان في التطبيق
router.push(`/user/${userId}`); // اذهب لملف المستخدم
// ثم اضغط زر "مراسلة"
```

### الوصول للمحادثات

```typescript
router.push('/messages'); // قائمة جميع المحادثات
```

## 📊 الوظائف المتاحة في messageService

```typescript
// إنشاء أو الحصول على محادثة
getOrCreateConversation(currentUserId, otherUserId);

// الحصول على جميع المحادثات
getConversations(userId);

// الحصول على تفاصيل محادثة
getConversationDetail(conversationId, userId);

// إرسال رسالة
sendMessage(conversationId, senderId, content);

// تعليم الرسائل كمقروءة
markMessagesAsRead(conversationId, userId);

// عدد الرسائل غير المقروءة
getUnreadCount(userId);

// الاشتراك في رسائل جديدة (Real-time)
subscribeToMessages(conversationId, onMessage);
```

## ⚡ Real-time Updates

النظام يستخدم Supabase Realtime للحصول على:

- رسائل جديدة فورياً
- تحديث عدد الرسائل غير المقروءة
- تحديث آخر رسالة في قائمة المحادثات

## 🔒 الأمان

- ✅ Row Level Security (RLS) مفعّل على جميع الجداول
- ✅ المستخدمون يرون محادثاتهم فقط
- ✅ لا يمكن قراءة رسائل الآخرين
- ✅ التحقق من الصلاحيات عند الإرسال

## 📌 ملاحظات

- الرسائل محدودة بـ 5000 حرف
- يتم حذف الرسائل تلقائياً عند حذف المحادثة
- يتم تحديث `updated_at` للمحادثة عند كل رسالة جديدة
- الصور الشخصية تظهر من `avatar_url` في جدول profiles

## 🐛 المشاكل المحتملة

### إذا واجهت مشكلة "لم يتم العثور على المحادثة"

- تأكد من تشغيل الـ Migration بشكل صحيح
- تأكد من أن Function `get_or_create_conversation` موجودة

### إذا لم تظهر الرسائل في الوقت الفعلي

- تأكد من تفعيل Realtime في Supabase Dashboard
- تأكد من أن جدول messages مفعّل للـ Realtime

### إذا ظهرت أخطاء RLS

- تأكد من أن جميع Policies مطبقة بشكل صحيح
- تحقق من أن المستخدم مسجل دخول

## ✅ التحقق من نجاح التثبيت

قم بما يلي للتأكد من عمل كل شيء:

1. [ ] تم تشغيل `messages_schema.sql` بنجاح
2. [ ] الجداول الثلاثة موجودة في قاعدة البيانات
3. [ ] RLS مفعّل على جميع الجداول
4. [ ] يمكن فتح صفحة `/messages` بدون أخطاء
5. [ ] زر المراسلة يظهر في ملفات المستخدمين
6. [ ] يمكن إرسال رسالة واستقبالها
7. [ ] عدد الرسائل غير المقروءة يعمل بشكل صحيح
8. [ ] Real-time updates تعمل عند إرسال رسائل

---

**تم التطوير في:** فبراير 2026  
**المطور:** GitHub Copilot  
**الإصدار:** 1.0.0

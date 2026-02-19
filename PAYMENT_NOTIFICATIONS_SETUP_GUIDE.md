# دليل إصلاح إشعارات الدفع - Kodax

## 🔴 المشكلة

عند موافقة أو رفض طلب دفع من لوحة التحكم:

- ❌ المستخدم **لا يستلم أي إشعار** في التطبيق
- ❌ النقاط تصل **بصمت** بدون أي رسالة
- ❌ المستخدم لا يعرف ما حدث لطلبه

## 🔍 سبب المشكلة

1. **لوحة التحكم (kodax-admin)** تستدعي دوال SQL:
   - `approve_payment_order()` ← عند الموافقة
   - `reject_payment_order()` ← عند الرفض

2. **دوال SQL** تُدخل الإشعارات في جدول `payment_notifications` ✅

3. **لكن التطبيق** يقرأ من جدول `app_notifications` ❌

4. **لا يوجد جسر** بين الجدولين! 🚧

### مشكلة إضافية:

جدول `app_notifications` لديه **CHECK constraint** يحدد أنواع الإشعارات المسموحة:

```sql
type IN ('badge', 'level_up', 'challenge', ... 'system')
```

**لا يتضمن**:

- ❌ `payment_approved`
- ❌ `payment_rejected`

---

## ✅ الحل

### 1️⃣ إضافة أنواع الإشعارات الجديدة

تحديث CHECK constraint لقبول أنواع الدفع.

### 2️⃣ إنشاء Trigger تلقائي

عند إضافة إشعار في `payment_notifications`، ينسخه تلقائياً إلى `app_notifications`.

### 3️⃣ النتيجة

```
Admin يوافق/يرفض
    ↓
approve/reject_payment_order()
    ↓
INSERT INTO payment_notifications ✅
    ↓
🔥 TRIGGER تلقائي 🔥
    ↓
INSERT INTO app_notifications ✅
    ↓
📱 المستخدم يستلم الإشعار! ✅
```

---

## 🚀 خطوات التطبيق

### الطريقة 1: ملف شامل (موصى به ⭐)

```bash
# 1. اتصل بقاعدة البيانات
psql -h <YOUR_DB_HOST> -U postgres -d postgres

# 2. شغّل الملف الشامل
\i supabase/SETUP_PAYMENT_NOTIFICATIONS.sql

# 3. تأكد من النجاح
# يجب أن تظهر رسالة: "تم إصلاح نظام الإشعارات بنجاح! ✅"
```

### الطريقة 2: من Supabase Dashboard

1. افتح [dashboard.supabase.com](https://dashboard.supabase.com)
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. انسخ محتوى `supabase/SETUP_PAYMENT_NOTIFICATIONS.sql`
5. الصقه واضغط **Run**

---

## 🧪 اختبار النظام

### اختبار يدوي في SQL:

```sql
-- استبدل YOUR_USER_ID بمعرف مستخدم حقيقي
INSERT INTO payment_notifications (user_id, order_id, type, title, message)
VALUES (
  'YOUR_USER_ID',
  gen_random_uuid(),
  'order_approved',
  'تم اختبار الإشعار',
  'إذا وصلك هذا الإشعار، النظام يعمل! ✅'
);

-- تحقق من النسخ التلقائي
SELECT * FROM app_notifications
WHERE type = 'payment_approved'
ORDER BY created_at DESC
LIMIT 1;
```

### اختبار من لوحة التحكم:

1. ✅ افتح `kodax-admin`
2. ✅ اذهب إلى **Orders**
3. ✅ اختر طلب pending
4. ✅ اضغط **Approve** أو **Reject**
5. ✅ افتح التطبيق المحمول
6. ✅ **يجب أن يظهر إشعار!** 🔔

---

## 📋 التحقق النهائي

بعد التطبيق، تحقق من:

### ✅ Trigger موجود:

```sql
SELECT * FROM pg_trigger
WHERE tgname = 'payment_notification_sync_trigger';
```

**المتوقع**: صف واحد

### ✅ الأنواع الجديدة مسموحة:

```sql
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'app_notifications_type_check';
```

**المتوقع**: يحتوي على `payment_approved` و `payment_rejected`

### ✅ الدالة موجودة:

```sql
SELECT proname FROM pg_proc
WHERE proname = 'sync_payment_notification_to_app';
```

**المتوقع**: صف واحد

---

## 🎯 ما سيحدث الآن

### عند الموافقة:

```
👨‍💼 Admin يضغط "Approve"
    ↓
📊 approve_payment_order() في SQL
    ↓
💰 إضافة النقاط لـ user_points
    ↓
📝 INSERT في payment_notifications
    ↓
⚡ TRIGGER ينطلق تلقائياً
    ↓
📱 INSERT في app_notifications
    ↓
🔔 إشعار يظهر للمستخدم:
   "تمت الموافقة على طلبك! 🎉
    تم إضافة X نقطة إلى رصيدك. شكراً لك!"

👆 الضغط على الإشعار
    ↓
📄 الانتقال إلى /payment/orders
```

### عند الرفض:

```
👨‍💼 Admin يضغط "Reject"
    ↓
📊 reject_payment_order() في SQL
    ↓
📝 INSERT في payment_notifications
    ↓
⚡ TRIGGER ينطلق تلقائياً
    ↓
📱 INSERT في app_notifications
    ↓
🔔 إشعار يظهر للمستخدم:
   "تم رفض طلبك ❌
    للأسف تم رفض طلب الدفع الخاص بك.
    السبب: ..."

👆 الضغط على الإشعار
    ↓
📄 الانتقال إلى /payment/orders
```

---

## 📁 الملفات ذات الصلة

### ✅ تم إنشاؤها/تعديلها:

1. `supabase/SETUP_PAYMENT_NOTIFICATIONS.sql` ⭐ (الملف الشامل)
2. `supabase/sync_payment_notifications.sql` (الـ trigger فقط)
3. `supabase/add_payment_notification_types.sql` (الأنواع فقط)
4. `src/services/notificationService.ts` (دوال الإشعار في الكود)
5. `src/components/editor/NotificationButton.tsx` (دعم الأنواع الجديدة)
6. `app/(tabs)/index.tsx` (معالج التنقل)

### 🗄️ ملفات قاعدة البيانات الأصلية:

- `supabase/payment_system_migration.sql` (يحتوي على approve/reject_payment_order)
- `supabase/fix_platform_sync.sql` (يحتوي على app_notifications)
- `APPLY_THIS_SQL.sql` (يحتوي على app_notifications)

---

## ⚠️ ملاحظات مهمة

1. **لا تنسى تطبيق SQL!** الكود في التطبيق جاهز، لكن قاعدة البيانات تحتاج الـ trigger.

2. **الترتيب مهم**:
   - `payment_system_migration.sql` يجب أن يكون مطبقاً أولاً
   - ثم `SETUP_PAYMENT_NOTIFICATIONS.sql`

3. **RLS Policies**: تأكد من أن policies جدول app_notifications تسمح بـ INSERT من functions:

   ```sql
   -- في SETUP_PAYMENT_NOTIFICATIONS.sql، الدالة SECURITY DEFINER
   -- تعني أنها تعمل بصلاحيات المالك، ليس المستخدم
   ```

4. **لا توجد إشعارات قديمة**: الـ trigger يعمل فقط على الإدخالات **الجديدة** بعد التطبيق.

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا يزال الإشعار لا يصل

#### 1. تحقق من الـ Trigger:

```sql
SELECT * FROM pg_trigger
WHERE tgname = 'payment_notification_sync_trigger';
```

**إذا فارغ**: شغّل `SETUP_PAYMENT_NOTIFICATIONS.sql` مرة أخرى

#### 2. تحقق من payment_notifications:

```sql
SELECT * FROM payment_notifications
ORDER BY created_at DESC LIMIT 5;
```

**إذا فارغ**: المشكلة في approve/reject_payment_order

#### 3. تحقق من app_notifications:

```sql
SELECT * FROM app_notifications
WHERE type IN ('payment_approved', 'payment_rejected')
ORDER BY created_at DESC LIMIT 5;
```

**إذا فارغ**: الـ trigger لا يعمل

#### 4. تحقق من الأخطاء:

```sql
SELECT * FROM pg_stat_statements
WHERE query LIKE '%payment_notification%'
AND calls > 0;
```

#### 5. اختبر يدوياً:

```sql
-- جرب INSERT يدوي
INSERT INTO payment_notifications (user_id, order_id, type, title, message)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  gen_random_uuid(),
  'order_approved',
  'اختبار',
  'رسالة اختبار'
);

-- تحقق فوراً
SELECT COUNT(*) FROM app_notifications
WHERE type = 'payment_approved'
AND created_at > NOW() - INTERVAL '10 seconds';
```

**المتوقع**: 1

---

## 🎉 النتيجة النهائية

بعد التطبيق الصحيح:

✅ **المستخدم يستلم إشعاراً فورياً** عند الموافقة/الرفض
✅ **الإشعار يحتوي على تفاصيل واضحة** (عدد النقاط، السبب، إلخ)
✅ **الضغط على الإشعار ينقل للطلبات** مباشرة
✅ **النظام يعمل تلقائياً** بدون تدخل يدوي
✅ **التجربة أفضل للمستخدم** - شفافية كاملة

---

**آخر تحديث**: 12 فبراير 2026
**الحالة**: ✅ جاهز للتطبيق

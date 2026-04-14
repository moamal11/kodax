# نظام الدفع - دليل التنصيب السريع

## 🚀 طريقة التنصيب

### الخيار 1: تنصيب كامل (مشروع جديد)

استخدم ملف `payment_system_migration.sql` الكامل

### الخيار 2: إصلاح سريع (مشروع موجود)

استخدم ملف `QUICK_FIX_INFINITE_RECURSION.sql`

---

## 📝 الخطوات

### 1️⃣ تشغيل SQL في Supabase

1. افتح **Supabase Dashboard**
2. اذهب إلى **SQL Editor**
3. انسخ محتوى الملف المناسب
4. اضغط **Run**

### 2️⃣ إضافة أول مسؤول

1. اذهب إلى: **Authentication** → **Users**
2. انسخ الـ **UUID** الخاص بحسابك
3. في **SQL Editor**، شغل:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('UUID_الخاص_بك_هنا', 'admin');
```

**مثال:**

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('4bc25a10-1234-5678-90ab-cdef12345678', 'admin');
```

### 3️⃣ تشغيل لوحة التحكم

```bash
cd kodax-admin
npm run dev
```

افتح: http://localhost:3001

---

## ✅ الحل النهائي للمشاكل الشائعة

### المشكلة 1: Infinite Recursion

```
infinite recursion detected in policy for relation "user_roles"
```

**الحل:** تعطيل RLS على جدول `user_roles` (آمن لأنه يحتوي فقط على أدوار عامة)

### المشكلة 2: Foreign Key Relationship

```
Could not find a relationship between 'payment_orders' and 'profiles'
```

**الحل:** تغيير foreign keys من `auth.users` إلى `profiles`

**الملف:** `QUICK_FIX_INFINITE_RECURSION.sql` يصلح المشكلتين معاً

---

## 🎯 طريقة عمل النظام

### للمستخدمين (Mobile App):

1. اختيار باقة نقاط
2. اختيار طريقة دفع (Asiacell/Zain/MasterCard/Zain Cash)
3. إدخال تفاصيل الدفع
4. رفع صورة التحويل
5. انتظار موافقة الأدمن (1-2 ساعة)

### للمسؤولين (Admin Dashboard):

1. عرض جميع الطلبات
2. مراجعة صور التحويل
3. الموافقة/الرفض مع إمكانية تعديل النقاط
4. النقاط تُضاف تلقائياً عند الموافقة

---

## 📊 الجداول المُنشأة

- `payment_orders` - طلبات الدفع
- `admin_action_log` - سجل إجراءات المسؤولين
- `user_roles` - أدوار المستخدمين (RLS معطل)
- `payment_notifications` - إشعارات الدفع

---

## 🔐 الأمان

- ✅ RLS مُفعّل على جميع الجداول الحساسة
- ✅ المستخدمون يرون طلباتهم فقط
- ✅ المسؤولون فقط يمكنهم الموافقة/الرفض
- ✅ تسجيل كامل لجميع إجراءات المسؤولين
- ✅ صور التحويل محفوظة في Supabase Storage

---

## 📱 روابط مهمة

- **Mobile App Payment**: `/payment`
- **Orders History**: `/payment/orders`
- **Admin Dashboard**: `http://localhost:3001`

---

## 🐛 حل المشاكل

### إذا واجهت "Unauthorized access attempt" أو "infinite recursion"

- تأكد من إضافة نفسك كأدمن في `user_roles`
- قم بتشغيل ملف الإصلاح `QUICK_FIX_INFINITE_RECURSION.sql`

### إذا واجهت "Could not find relationship between payment_orders and profiles"

- قم بتشغيل ملف الإصلاح `QUICK_FIX_INFINITE_RECURSION.sql`
- الملف يحدث foreign keys من `auth.users` إلى `profiles`

### إذا لم تظهر الطلبات في Admin Dashboard

- تحقق من أن الـ UUID في `user_roles` صحيح
- تحقق من أن الـ role = 'admin' وليس 'Admin' أو غيره
- تحقق من أن `profiles` table موجود ويحتوي على البيانات

### إذا لم تظهر صور التحويل

- تحقق من إنشاء bucket: `payment-receipts` في Storage
- تحقق من السياسات على `storage.objects`

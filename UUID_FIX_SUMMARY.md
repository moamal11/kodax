## UUID Fix Summary و Notifications Setup

### المشكلة الأساسية
```
Error: function uuid_generate_v4() does not exist
Code: 42883
```

**السبب**: البيانات لم يتم تحميل امتداد `uuid-ossp` في قاعدة البيانات Supabase.

---

## الحل المطبق

### 1. ✅ Code Generation (Client-Side)
**ملف**: `src/services/codeFeedService.ts`

- إضافة دالة `generateUUID()` تولد UUIDs محلياً دون الاعتماد على الخادم
- تحديث الدوال التالية لتوليد UUIDs قبل الإدراج:
  - `addComment()` — يولد UUID للتعليق الجديد
  - `toggleLike()` — يولد UUID للإعجاب الجديد
  - `createSnippet()` — يولد UUID للكود الجديد
  - `incrementViews()` — يولد UUID لتسجيل العرض الجديد

### 2. ✅ Schema Updates
**الملفات المعدلة**:
- `supabase/schema.sql` — إزالة `DEFAULT uuid_generate_v4()` من:
  - `code_snippets.id`
  - `code_likes.id` ✅
  - `code_comments.id` ✅
- `supabase/code_views_migration.sql` — إزالة `DEFAULT uuid_generate_v4()` من `code_views.id`

**ملاحظة**: الجداول الأخرى يمكن تركها كما هي إذا كانت لا تتلقى INSERTs مباشرة من المستخدم.

### 3. ✅ Notification System
**ملف**: `supabase/code_interactions_notifications.sql`
- **SECURITY DEFINER Triggers** أنشأ إشعارات تلقائية عند:
  - 🔴 شخص يعجب بكودك → إشعار للمالك
  - 💬 شخص يعلق على كودك → إشعار للمالك
  - 👤 شخص يتابعك → إشعار للمتابَع
- تفعيل **Realtime** على `app_notifications` لاستقبال الإشعارات فوراً

**ملفات محدثة**:
- `src/services/notificationService.ts`:
  - `subscribeToRealtime(userId)` — يفتح قناة Supabase للاستماع للإشعارات الجديدة
  - `unsubscribeFromRealtime()` — يغلق القناة عند تغيير المستخدم

- `src/contexts/BadgeContext.tsx`:
  - استدعاء `subscribeToRealtime()` بعد التهيئة
  - استدعاء `unsubscribeFromRealtime()` في cleanup

---

## الخطوات التالية (يجب تطبيقها يدويً في Supabase)

### 1️⃣ تشغيل SQL Migration للإشعارات
```
Supabase Dashboard → SQL Editor
ثم: Copy-paste محتوى supabase/code_interactions_notifications.sql
```

### 2️⃣ تشغيل SQL Migration لإصلاح UUID defaults
```
Supabase Dashboard → SQL Editor
ثم: Copy-paste محتوى supabase/fix_uuid_ossp.sql
```

### 3️⃣ اختياري: تشغيل schema.sql الكامل (إذا كنت تعيد إنشاء قاعدة البيانات)

---

## الآن يجب أن تعمل!

✅ إعجابات جديدة → لا خطأ UUID  
✅ تعليقات جديدة → لا خطأ UUID  
✅ أكواد جديدة → توليد UUID محلي  
✅ إشعارات فورية → Realtime channels مفعلة  

---

## Troubleshooting

### لو استمرت الأخطاء بعد التغييرات:
1. **امسح Cache** في المتصفح (Ctrl+Shift+Delete)
2. **أعد تحديث الصفحة** بقوة (Ctrl+F5)
3. **تحقق من Supabase Logs** (Dashboard → Logs) للأخطاء الأساسية

### لو الإشعارات لا تظهر:
1. تأكد من تشغيل `code_interactions_notifications.sql`
2. اختبر الـ INSERT يدوياً:
   ```sql
   INSERT INTO code_comments (id, user_id, snippet_id, content)
   VALUES (uuid_generate_v4(), '<user-id>', '<snippet-id>', 'Test comment');
   ```
3. تحقق من console logs في التطبيق: `✅ Subscribed to realtime notifications`

---

## ملخص التعديلات

| الملف | التغيير |
|------|---------|
| `codeFeedService.ts` | +parseObject `generateUUID()`, تحديث 4 دوال |
| `schema.sql` | إزالة `DEFAULT uuid_generate_v4()` من 3 جداول |
| `code_views_migration.sql` | إزالة `DEFAULT uuid_generate_v4()` |
| `notificationService.ts` | +`subscribeToRealtime()`, +`unsubscribeFromRealtime()` |
| `BadgeContext.tsx` | +realtime subscription في `useEffect` |
| `code_interactions_notifications.sql` | NEW migration file ✨ |
| `fix_uuid_ossp.sql` | NEW diagnostic/fix file ✨ |

تم التطبيق بنجاح! 🎉

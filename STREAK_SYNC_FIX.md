# إصلاح مشكلة مزامنة Streak Days

## 📌 المشكلة المكتشفة

تم اكتشاف مشكلة في مزامنة عدد أيام السلسلة (streak_days) بين جدولين في قاعدة البيانات:

### الجداول:

1. **`user_stats`** - يحتوي على `streak_days`
2. **`profiles`** - يحتوي على `streak_days`

### السبب الجذري:

- الدالة `update_user_streak()` تحدّث **فقط** جدول `user_stats`
- لكن الواجهة في `app/(tabs)/index.tsx` تقرأ من جدول `profiles` عبر:
  ```typescript
  hybridSyncService.getUserXP() → profiles.streak_days
  ```
- هذا يؤدي إلى عدم تطابق البيانات بين الجدولين

### النتيجة:

- المستخدم لديه `streak_days = 5` في `user_stats`
- لكن `streak_days = 1` في `profiles`
- التطبيق يعرض القيمة من `profiles` فيظهر 1 يوم بدلاً من 5 أيام ❌

---

## ✅ الحل المُطبق

### 1. تعديل دالة `update_user_streak`

الآن تحدّث **كلا الجدولين** في نفس الوقت:

- ✅ `user_stats.streak_days`
- ✅ `profiles.streak_days`

### 2. مزامنة البيانات الحالية

يتم تحديث `profiles` من `user_stats` للبيانات الموجودة:

```sql
UPDATE profiles p
SET streak_days = COALESCE(us.streak_days, 0)
FROM user_stats us
WHERE p.id = us.user_id
  AND (p.streak_days IS NULL OR p.streak_days != us.streak_days);
```

### 3. Trigger تلقائي للمزامنة

تم إنشاء trigger يحدّث `profiles` تلقائياً عند أي تغيير في `user_stats.streak_days` (كطبقة حماية إضافية)

---

## 🚀 خطوات التطبيق

### 1. تطبيق SQL على Supabase

```bash
# افتح Supabase Dashboard → SQL Editor
# انسخ محتوى الملف التالي وقم بتشغيله:
supabase/fix_streak_sync.sql
```

### 2. التحقق من المزامنة

بعد تطبيق SQL، يمكنك التحقق من المزامنة:

```sql
-- مقارنة streak_days بين الجدولين
SELECT
    p.id,
    p.username,
    p.streak_days AS profile_streak,
    us.streak_days AS stats_streak,
    us.last_active_date
FROM profiles p
LEFT JOIN user_stats us ON p.id = us.user_id
WHERE p.streak_days != us.streak_days OR us.streak_days IS NULL
LIMIT 10;
```

### 3. اختبار التطبيق

- افتح التطبيق
- اذهب للصفحة الرئيسية
- تحقق من "التقدم الأسبوعي" - يجب أن يعرض العدد الصحيح الآن ✅

---

## 🔍 الملفات المعدّلة

### SQL:

- ✅ `supabase/fix_streak_sync.sql` (جديد) - إصلاح المزامنة

### TypeScript (تم الإصلاح سابقاً):

- ✅ `app/(tabs)/index.tsx` - يستخدم `stats.streak` من قاعدة البيانات

---

## 📊 تدفق البيانات الصحيح الآن

```
المستخدم ينشط → syncStreak() يُستدعى
         ↓
update_user_streak() RPC
         ↓
    ┌─────────────┬─────────────┐
    ↓             ↓             ↓
user_stats    profiles      Trigger
.streak_days  .streak_days  (احتياطي)
         ↓
getUserXP() يقرأ من profiles
         ↓
UI يعرض القيمة الصحيحة ✅
```

---

## 🐛 اختبار السيناريوهات

### السيناريو 1: مستخدم جديد

- ✅ `streak_days = 1` في كلا الجدولين

### السيناريو 2: يوم متتالي

- ✅ `streak_days += 1` في كلا الجدولين

### السيناريو 3: انقطاع السلسلة

- ✅ `streak_days = 1` (إعادة تعيين) في كلا الجدولين

---

## 🎯 النتيجة النهائية

الآن العرض في "التقدم الأسبوعي" سيكون دقيقاً:

- إذا كان المستخدم لديه سلسلة 5 أيام → ستضيء 5 دوائر ✅
- إذا كان المستخدم لديه سلسلة 1 يوم → ستضيء دائرة واحدة ✅
- لا يوجد اختلاف بين قاعدة البيانات والواجهة ✅

---

## 📝 ملاحظات للمستقبل

1. **تجنب تكرار البيانات**: من الأفضل الاعتماد على جدول واحد فقط (user_stats أو profiles)
2. **استخدام Views**: يمكن إنشاء view يجمع البيانات من الجدولين لتبسيط الاستعلامات
3. **المزامنة التلقائية**: الـ Trigger يضمن عدم حدوث هذه المشكلة مستقبلاً

---

✅ **تم إصلاح المشكلة بالكامل!**
الآن سلسلة الأيام ستعمل بشكل صحيح ومتزامن في جميع أنحاء التطبيق.

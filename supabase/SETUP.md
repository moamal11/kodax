# إعداد Supabase للمشروع

## الخطوات

### 1. إنشاء مشروع Supabase جديد

1. اذهب إلى [https://supabase.com](https://supabase.com)
2. سجل دخول أو أنشئ حساب جديد
3. أنشئ مشروع جديد:
   - اختر اسم المشروع: `kodax`
   - اختر كلمة مرور قوية للـ database
   - اختر المنطقة الأقرب لك

### 2. تطبيق Schema

1. في لوحة تحكم Supabase، اذهب إلى "SQL Editor"
2. انسخ محتوى ملف `schema.sql`
3. الصق الكود في المحرر واضغط "Run"
4. انتظر حتى يكتمل التنفيذ

### 3. إعداد Authentication

1. اذهب إلى "Authentication" > "Providers"
2. فعّل Email provider:
   - Enable "Email"
   - Enable "Confirm email" (اختياري)
3. فعّل Google OAuth:
   - اضغط "Google"
   - أدخل Client ID و Client Secret من Google Cloud Console
   - احفظ التغييرات

#### إعداد Google OAuth

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. أنشئ مشروع جديد أو استخدم موجود
3. فعّل Google+ API
4. في "Credentials"، أنشئ OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: أضف الـ URL من Supabase
5. انسخ Client ID و Client Secret

### 4. احصل على API Keys

1. في Supabase، اذهب إلى "Settings" > "API"
2. انسخ:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)

### 5. إعداد المشروع

1. أنشئ ملف `.env` في جذر المشروع:
```bash
cp .env.example .env
```

2. افتح `.env` وأضف القيم:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. إعداد Storage

1. في Supabase، اذهب إلى "Storage"
2. أنشئ bucket جديد:
   - اسم: `avatars`
   - Public: نعم
3. أنشئ bucket آخر:
   - اسم: `payment-proofs`
   - Public: لا

### 7. إعداد RLS Policies

الـ RLS Policies موجودة في `schema.sql` وتم تطبيقها تلقائياً.

للتحقق:
1. اذهب إلى "Authentication" > "Policies"
2. تأكد من وجود policies لكل جدول

## اختبار الإعداد

بعد الانتهاء من الخطوات أعلاه:

1. شغل المشروع:
```bash
npm start
```

2. جرب التسجيل في التطبيق
3. تحقق من إنشاء profile في قاعدة البيانات

## مشاكل شائعة

### خطأ في الاتصال
- تأكد من صحة SUPABASE_URL و SUPABASE_ANON_KEY
- تأكد من إعادة تشغيل التطبيق بعد تغيير .env

### خطأ في RLS
- تأكد من تطبيق جميع RLS Policies
- تحقق من أن المستخدم مسجل دخول

### Google OAuth لا يعمل
- تأكد من إضافة Redirect URI الصحيح
- تأكد من تفعيل Google+ API في Google Cloud Console

## الصيانة

### تحديث Leaderboard

تحديث الـ leaderboard يدوياً:
```sql
SELECT refresh_leaderboard();
```

أو إنشاء Cron Job في Supabase:
1. اذهب إلى "Database" > "Extensions"
2. فعّل `pg_cron`
3. أضف job:
```sql
SELECT cron.schedule(
  'refresh-leaderboard',
  '0 * * * *', -- كل ساعة
  $$ SELECT refresh_leaderboard(); $$
);
```

### Backup

ينصح بعمل backup يومي:
1. في Supabase، اذهب إلى "Settings" > "Database"
2. فعّل "Automatic backups"
3. اختر التردد (يومي موصى به)

## الخطوات التالية

بعد إتمام الإعداد:
- [ ] إنشاء دروس تجريبية في جدول `lessons`
- [ ] إنشاء تحديات في جدول `challenges`
- [ ] اختبار نظام XP والـ Gamification
- [ ] إعداد AI API endpoint

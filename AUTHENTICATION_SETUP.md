# إعداد نظام المصادقة 🔐

تم تنفيذ نظام مصادقة كامل للتطبيق مع Supabase.

## ما تم إنجازه ✅

### 1. صفحة تسجيل الدخول

- ✅ تسجيل دخول بالإيميل وكلمة المرور
- ✅ إنشاء حساب جديد
- ✅ تسجيل دخول بواسطة Google OAuth
- ✅ واجهة مستخدم جميلة وسلسة

### 2. حماية التطبيق

- ✅ التحقق من الجلسة عند فتح التطبيق
- ✅ إعادة توجيه المستخدمين غير المسجلين إلى صفحة تسجيل الدخول
- ✅ تحديث تلقائي للحالة عند تسجيل الدخول/الخروج

### 3. حذف البيانات الوهمية

- ✅ حذف ملف mockData.ts
- ✅ تحديث جميع الصفحات لاستخدام بيانات حقيقية من قاعدة البيانات
- ✅ تكامل مع Supabase للمصادقة وتخزين البيانات

## الخطوات القادمة 🚀

### 1. إعداد Supabase

قم بإنشاء مشروع على Supabase وإضافة المتغيرات البيئية في `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. إعداد Google OAuth (اختياري)

لتفعيل تسجيل الدخول بـ Google:

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد
3. فعّل Google Sign-In API
4. احصل على OAuth 2.0 Client ID
5. أضف Redirect URI: `kodax://auth/callback`
6. في Supabase Dashboard:
   - اذهب إلى Authentication > Providers
   - فعّل Google Provider
   - أضف Client ID و Client Secret

### 3. جدول المستخدمين في قاعدة البيانات

تأكد من وجود جدول `users` في Supabase:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  province TEXT,
  selected_fields TEXT[],
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  completed_challenges INTEGER DEFAULT 0,
  badges TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 4. إنشاء ملف تعريف تلقائي عند التسجيل

في Supabase Dashboard > SQL Editor، أضف:

```sql
-- Function to create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## استخدام النظام 💻

### تسجيل الدخول

- المستخدمون الجدد سيتم توجيههم تلقائيًا لصفحة تسجيل الدخول
- بعد التسجيل، سيتم إنشاء ملف تعريف تلقائيًا

### تسجيل الخروج

- اذهب إلى صفحة الملف الشخصي (Profile)
- اضغط على "تسجيل الخروج"

### الوصول إلى بيانات المستخدم

```typescript
import { supabase } from '@/lib/supabase';

// Get current session
const {
  data: { session },
} = await supabase.auth.getSession();

// Get user profile
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', session.user.id)
  .single();
```

## الملفات المُحدثة 📁

### ملفات جديدة:

- `app/(auth)/login.tsx` - صفحة تسجيل الدخول
- `app/(auth)/_layout.tsx` - تنسيق صفحات المصادقة
- `src/contexts/AuthContext.tsx` - سياق المصادقة

### ملفات مُحدثة:

- `app/_layout.tsx` - إضافة فحص المصادقة
- `app/(tabs)/profile.tsx` - تحديث لاستخدام بيانات حقيقية
- `app/(tabs)/index.tsx` - تحميل بيانات المستخدم من قاعدة البيانات
- `app/(tabs)/ai.tsx` - استخدام معرف المستخدم الحقيقي
- `app/challenges.tsx` - استخدام معرف المستخدم الحقيقي

### ملفات محذوفة:

- `src/lib/mockData.ts` - تم حذف جميع البيانات الوهمية

## اختبار النظام 🧪

1. شغل التطبيق: `npm start`
2. سيتم توجيهك تلقائيًا لصفحة تسجيل الدخول
3. سجل حساب جديد أو سجل دخول
4. سيتم نقلك إلى الصفحة الرئيسية بعد تسجيل الدخول الناجح

## ملاحظات مهمة ⚠️

- تأكد من إعداد متغيرات البيئة قبل التشغيل
- Google OAuth يتطلب إعداد إضافي في Google Cloud Console و Supabase
- جميع البيانات الآن تأتي من قاعدة البيانات، لذا تأكد من إعداد الجداول المطلوبة

## الدعم والمساعدة 📞

إذا واجهت أي مشاكل:

1. تحقق من إعدادات Supabase
2. تأكد من صحة متغيرات البيئة
3. راجع console logs للأخطاء
4. تأكد من تشغيل قاعدة البيانات بشكل صحيح

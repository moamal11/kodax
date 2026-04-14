-- =====================================================
-- إصلاح مشكلة تسجيل الدخول بجوجل على الأندرويد
-- طبّق هذا الـ SQL في Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. سياسة INSERT للملف الشخصي (ضرورية لعمل ensureProfile)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. دالة إنشاء الملف الشخصي تلقائياً عند تسجيل مستخدم جديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- استخرج base username من الإيميل أو المعرف
  base_username := COALESCE(
    LOWER(REGEXP_REPLACE(
      SPLIT_PART(COALESCE(NEW.email, ''), '@', 1),
      '[^a-z0-9_]', '_', 'g'
    )),
    'user'
  );
  -- اقتصر على 14 حرف + 6 من الـ ID
  base_username := SUBSTRING(base_username, 1, 14) || '_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 6);
  final_username := base_username;

  -- تأكد من عدم التكرار
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    xp,
    level,
    streak_days
  ) VALUES (
    NEW.id,
    final_username,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name',
      final_username
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    0,
    1,
    0
  )
  ON CONFLICT (id) DO NOTHING;  -- تجاهل إذا كان الملف موجوداً

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ربط الدالة بـ trigger على جدول auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- تحقق من التطبيق
-- =====================================================
-- SELECT * FROM profiles LIMIT 5;
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- ===============================================
-- 🔍 Verify Certificate System Schema
-- تحقق من صحة schema نظام الشهادات
-- ===============================================

-- 1. التحقق من جدول user_lesson_progress
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_lesson_progress'
ORDER BY ordinal_position;

-- 2. التحقق من جدول challenge_attempts
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'challenge_attempts'
ORDER BY ordinal_position;

-- 3. التحقق من أن challenge_id هو TEXT (وليس UUID)
SELECT 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'challenge_attempts' 
  AND column_name = 'challenge_id';
-- يجب أن يكون النتيجة: text (وليس uuid)

-- 4. فحص بيانات المستخدم (استبدل USER_ID_HERE بـ UUID الخاص بك)
-- SELECT 
--   lesson_id,
--   course_id,
--   completed,
--   xp_earned,
--   score,
--   completed_at
-- FROM user_lesson_progress
-- WHERE user_id = 'USER_ID_HERE'
-- ORDER BY completed_at DESC
-- LIMIT 10;

-- 5. فحص محاولات التحديات
-- SELECT 
--   challenge_id,
--   passed,
--   tests_passed,
--   tests_total,
--   created_at
-- FROM challenge_attempts
-- WHERE user_id = 'USER_ID_HERE'
-- ORDER BY created_at DESC
-- LIMIT 10;

-- ===============================================
-- إذا كانت النتائج كالتالي فالschema صحيح:
-- ===============================================
-- user_lesson_progress:
--   - lesson_id: text
--   - course_id: text  
--   - completed: boolean
--   - score: integer (nullable)
--
-- challenge_attempts:
--   - challenge_id: text (مهم جداً!)
--   - passed: boolean
--   - tests_passed: integer
--   - tests_total: integer
-- ===============================================

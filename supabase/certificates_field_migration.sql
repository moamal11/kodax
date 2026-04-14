-- =====================================================
-- 🎓 Kodax Certificate System - Migration to Field-Based
-- تحويل نظام الشهادات من course-based إلى field-based
-- =====================================================
-- بدلاً من إصدار شهادة لكل كورس، نصدر شهادة واحدة للمجال بأكمله
-- مثال: شهادة Python بعد إكمال جميع دورات Python
-- =====================================================

-- ===== STEP 1: Create Backup =====
-- احتفظ بنسخة من الجدول القديم
CREATE TABLE IF NOT EXISTS certificates_backup_course_based AS 
SELECT * FROM certificates;

-- ===== STEP 2: Drop Old Constraints =====
ALTER TABLE certificates 
  DROP CONSTRAINT IF EXISTS unique_active_certificate;

-- ===== STEP 3: Add New Field Column =====
-- أضف عمود field_id
ALTER TABLE certificates 
  ADD COLUMN IF NOT EXISTS field_id TEXT REFERENCES programming_fields(id);

-- ملء field_id من خلال الربط مع جدول courses
UPDATE certificates c
SET field_id = (
  SELECT co.field_id 
  FROM courses co 
  WHERE co.id = c.course_id
)
WHERE field_id IS NULL;

-- جعل field_id إجباري
ALTER TABLE certificates 
  ALTER COLUMN field_id SET NOT NULL;

-- ===== STEP 4: Update Constraints =====
-- إزالة course_id من الـ constraint الرئيسي
-- والاحتفاظ به فقط كـ reference اختياري للكورس الأخير المكتمل
ALTER TABLE certificates 
  ADD CONSTRAINT unique_active_field_certificate 
  UNIQUE (user_id, field_id, level);

-- ===== STEP 5: Update Indexes =====
DROP INDEX IF EXISTS idx_certificates_course;
CREATE INDEX IF NOT EXISTS idx_certificates_field 
  ON certificates(field_id);

CREATE INDEX IF NOT EXISTS idx_certificates_user_field 
  ON certificates(user_id, field_id);

-- ===== STEP 6: Update Certificate Requirements Table =====
-- إضافة field_id لجدول المتطلبات
ALTER TABLE certificate_requirements 
  ADD COLUMN IF NOT EXISTS field_id TEXT REFERENCES programming_fields(id);

-- ترحيل البيانات
UPDATE certificate_requirements cr
SET field_id = (
  SELECT co.field_id 
  FROM courses co 
  WHERE co.id = cr.course_id
)
WHERE field_id IS NULL;

-- جعل field_id إجباري
ALTER TABLE certificate_requirements 
  ALTER COLUMN field_id SET NOT NULL;

-- إزالة الـ constraint القديم وإضافة الجديد
ALTER TABLE certificate_requirements 
  DROP CONSTRAINT IF EXISTS certificate_requirements_course_id_level_key;

ALTER TABLE certificate_requirements 
  ADD CONSTRAINT unique_field_level_requirements 
  UNIQUE (field_id, level);

-- ===== STEP 7: Add Field Metadata to Certificates =====
-- إضافة أعمدة لحفظ معلومات المجال (snapshot)
ALTER TABLE certificates 
  ADD COLUMN IF NOT EXISTS field_name TEXT,
  ADD COLUMN IF NOT EXISTS field_name_ar TEXT;

-- ملء البيانات من programming_fields
UPDATE certificates c
SET 
  field_name = pf.name,
  field_name_ar = pf.name_ar
FROM programming_fields pf
WHERE pf.id = c.field_id
  AND (c.field_name IS NULL OR c.field_name_ar IS NULL);

-- ===== STEP 8: Update Achievement Snapshot Structure =====
-- لا حاجة لتغيير البنية الداخلية، لكن يجب أن يحتوي على:
-- - total_courses_in_field
-- - completed_courses
-- - total_lessons_in_field  
-- - completed_lessons_in_field
-- - total_challenges_in_field
-- - completed_challenges_in_field

COMMENT ON COLUMN certificates.achievement_snapshot IS 
'Achievement snapshot for the entire field at time of issuance (JSONB):
{
  "field_id": "web-dev",
  "total_courses": 4,
  "completed_courses": 4,
  "total_lessons": 60,
  "completed_lessons": 60,
  "lessons_percent": 100,
  "total_challenges": 20,
  "completed_challenges": 18,
  "challenges_percent": 90,
  "avg_exam_score": 85,
  "critical_errors": 0,
  "completion_days": 45,
  "courses": [
    {"id": "web-html-basics", "completed": true, "score": 90},
    {"id": "web-css-styling", "completed": true, "score": 85},
    {"id": "web-js-basics", "completed": true, "score": 80},
    {"id": "web-react-intro", "completed": true, "score": 88}
  ]
}';

-- ===== STEP 9: Create Default Field Requirements =====
-- متطلبات افتراضية للشهادات على مستوى المجال
INSERT INTO certificate_requirements (field_id, level, min_lessons_percent, min_challenges_percent, max_challenge_errors, min_exam_score, requires_project, max_completion_days) VALUES
  -- Web Development
  ('web-dev', 'silver', 60, 50, NULL, 60, false, NULL),
  ('web-dev', 'gold', 100, 80, 5, 80, true, NULL),
  ('web-dev', 'platinum', 100, 100, 0, 95, true, 180),
  
  -- Python
  ('python', 'silver', 60, 50, NULL, 60, false, NULL),
  ('python', 'gold', 100, 80, 5, 80, true, NULL),
  ('python', 'platinum', 100, 100, 0, 95, true, 180),
  
  -- Cybersecurity
  ('cybersecurity', 'silver', 60, 50, NULL, 60, false, NULL),
  ('cybersecurity', 'gold', 100, 80, 5, 80, true, NULL),
  ('cybersecurity', 'platinum', 100, 100, 0, 95, true, 180),
  
  -- C++
  ('cpp', 'silver', 60, 50, NULL, 60, false, NULL),
  ('cpp', 'gold', 100, 80, 5, 80, true, NULL),
  ('cpp', 'platinum', 100, 100, 0, 95, true, 180),
  
  -- AI & ML
  ('ai-ml', 'silver', 60, 50, NULL, 60, false, NULL),
  ('ai-ml', 'gold', 100, 80, 5, 80, true, NULL),
  ('ai-ml', 'platinum', 100, 100, 0, 95, true, 180),
  
  -- Mobile Development
  ('mobile-dev', 'silver', 60, 50, NULL, 60, false, NULL),
  ('mobile-dev', 'gold', 100, 80, 5, 80, true, NULL),
  ('mobile-dev', 'platinum', 100, 100, 0, 95, true, 180),
  
  -- Backend Development
  ('backend', 'silver', 60, 50, NULL, 60, false, NULL),
  ('backend', 'gold', 100, 80, 5, 80, true, NULL),
  ('backend', 'platinum', 100, 100, 0, 95, true, 180)
ON CONFLICT (field_id, level) DO UPDATE SET
  min_lessons_percent = EXCLUDED.min_lessons_percent,
  min_challenges_percent = EXCLUDED.min_challenges_percent,
  max_challenge_errors = EXCLUDED.max_challenge_errors,
  min_exam_score = EXCLUDED.min_exam_score,
  requires_project = EXCLUDED.requires_project,
  max_completion_days = EXCLUDED.max_completion_days,
  updated_at = NOW();

-- ===== STEP 10: Create Helper View =====
-- View للحصول على تقدم المستخدم في كل مجال
CREATE OR REPLACE VIEW user_field_progress AS
SELECT 
  up.user_id,
  c.field_id,
  pf.name as field_name,
  pf.name_ar as field_name_ar,
  COUNT(DISTINCT c.id) as total_courses,
  COUNT(DISTINCT CASE WHEN up.completion_percent = 100 THEN c.id END) as completed_courses,
  SUM(c.total_lessons) as total_lessons,
  COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.completed = true) as completed_lessons,
  COALESCE(
    ROUND(
      (COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.completed = true)::NUMERIC / 
       NULLIF(SUM(c.total_lessons), 0)) * 100
    ), 0
  ) as lessons_percent
FROM 
  user_progress up
  INNER JOIN courses c ON c.id = up.course_id
  INNER JOIN programming_fields pf ON pf.id = c.field_id
  LEFT JOIN lesson_progress lp ON lp.user_id = up.user_id 
    AND lp.lesson_id IN (
      SELECT id FROM lessons_v2 WHERE course_id = c.id
    )
GROUP BY 
  up.user_id, c.field_id, pf.name, pf.name_ar;

-- ===== STEP 11: Update Comments =====
COMMENT ON TABLE certificates IS 
'🎓 Field-based certificates: Users earn certificates for completing all courses in a field (e.g., Web Development, Python, Cybersecurity)';

COMMENT ON COLUMN certificates.field_id IS 
'The programming field this certificate is awarded for (e.g., web-dev, python, cybersecurity)';

COMMENT ON COLUMN certificates.course_id IS 
'[DEPRECATED - kept for reference] The last course completed in this field';

-- ===== STEP 12: Create Migration Info Table =====
CREATE TABLE IF NOT EXISTS migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT
);

INSERT INTO migration_log (migration_name, description) VALUES
  ('certificates_field_migration', 'Converted certificate system from course-based to field-based. Users now earn certificates per field (e.g., Python, Web Dev) instead of per individual course.');

-- ===== SUCCESS MESSAGE =====
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Certificate system successfully migrated to field-based!';
  RAISE NOTICE '📝 Certificates now issued per field (e.g., Web Dev, Python, Cyber)';
  RAISE NOTICE '🎓 Users earn ONE certificate per field after completing ALL courses';
END $$;

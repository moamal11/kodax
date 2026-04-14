-- ===== Kodax Database Updates =====
-- تحديثات قاعدة البيانات لإصلاح مشاكل الحفظ والمزامنة

-- ===== 1. تحديث جدول user_progress =====
-- IMPORTANT: The original user_progress table uses UUID for lesson_id
-- But the app uses TEXT IDs like "html-1", "python-1", etc.
-- We need to create a new table for app-based progress tracking

-- إنشاء جدول جديد لتتبع التقدم باستخدام String IDs
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- تمكين Row Level Security
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lesson progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lesson progress" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- إنشاء index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_course 
ON user_lesson_progress(user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson
ON user_lesson_progress(user_id, lesson_id);

-- ===== 2. جدول تقدم الكورسات =====
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  completed_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER NOT NULL,
  last_completed_lesson_id TEXT,
  last_completed_order INTEGER DEFAULT 0,
  progress_percent INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- RLS للجدول الجديد
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own course progress" ON course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own course progress" ON course_progress
  FOR ALL USING (auth.uid() = user_id);

-- ===== 3. جدول الأقسام المفتوحة (للشراء المجزأ) =====
CREATE TABLE IF NOT EXISTS user_unlocked_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cost_paid INTEGER DEFAULT 0,
  UNIQUE(user_id, course_id, section_id)
);

ALTER TABLE user_unlocked_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own unlocked sections" ON user_unlocked_sections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own unlocked sections" ON user_unlocked_sections
  FOR ALL USING (auth.uid() = user_id);

-- ===== 4. جدول النقاط المزدوج =====
-- تحديث جدول user_points لدعم العملتين
ALTER TABLE user_points 
ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0;

ALTER TABLE user_points 
ADD COLUMN IF NOT EXISTS store_credits INTEGER DEFAULT 0;

-- ===== 5. دالة تحديث تقدم الكورس =====
CREATE OR REPLACE FUNCTION update_course_progress(
  p_user_id UUID,
  p_course_id TEXT,
  p_lesson_id TEXT,
  p_lesson_order INTEGER,
  p_total_lessons INTEGER
)
RETURNS void AS $$
DECLARE
  v_completed_count INTEGER;
BEGIN
  -- حساب عدد الدروس المكتملة
  SELECT COUNT(*) INTO v_completed_count
  FROM user_lesson_progress
  WHERE user_id = p_user_id 
    AND course_id = p_course_id 
    AND completed = true;
  
  -- تحديث أو إدراج تقدم الكورس
  INSERT INTO course_progress (
    user_id, course_id, completed_lessons, total_lessons,
    last_completed_lesson_id, last_completed_order, progress_percent
  )
  VALUES (
    p_user_id, p_course_id, v_completed_count, p_total_lessons,
    p_lesson_id, p_lesson_order, 
    ROUND((v_completed_count::NUMERIC / p_total_lessons) * 100)
  )
  ON CONFLICT (user_id, course_id) 
  DO UPDATE SET
    completed_lessons = v_completed_count,
    total_lessons = p_total_lessons,
    last_completed_lesson_id = CASE 
      WHEN p_lesson_order > course_progress.last_completed_order 
      THEN p_lesson_id 
      ELSE course_progress.last_completed_lesson_id 
    END,
    last_completed_order = GREATEST(course_progress.last_completed_order, p_lesson_order),
    progress_percent = ROUND((v_completed_count::NUMERIC / p_total_lessons) * 100),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 6. دالة جلب آخر درس مكتمل =====
CREATE OR REPLACE FUNCTION get_last_completed_lesson(
  p_user_id UUID,
  p_course_id TEXT
)
RETURNS TABLE(lesson_id TEXT, lesson_order INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.last_completed_lesson_id,
    cp.last_completed_order
  FROM course_progress cp
  WHERE cp.user_id = p_user_id AND cp.course_id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 7. Indexes للأداء =====
CREATE INDEX IF NOT EXISTS idx_course_progress_user ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_sections_user ON user_unlocked_sections(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_sections_course ON user_unlocked_sections(user_id, course_id);

-- ===== 8. تحديث Trigger لحساب التقدم تلقائياً =====
CREATE OR REPLACE FUNCTION trigger_update_course_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- استدعاء دالة تحديث التقدم
  IF NEW.completed = true AND NEW.course_id IS NOT NULL THEN
    -- نحتاج total_lessons من الجدول أو من parameter
    PERFORM update_course_progress(
      NEW.user_id,
      NEW.course_id,
      NEW.lesson_id,
      COALESCE(
        (SELECT CAST(SUBSTRING(NEW.lesson_id FROM '-([0-9]+)$') AS INTEGER)),
        1
      ),
      15 -- قيمة افتراضية، يمكن تحديثها
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء Trigger (حذف القديم أولاً)
DROP TRIGGER IF EXISTS trg_update_course_progress ON user_lesson_progress;
CREATE TRIGGER trg_update_course_progress
AFTER INSERT OR UPDATE ON user_lesson_progress
FOR EACH ROW
EXECUTE FUNCTION trigger_update_course_progress();

-- ===== الانتهاء =====
SELECT 'Database updates completed successfully!' AS status;

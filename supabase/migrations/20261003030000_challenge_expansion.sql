-- ============================================================================
-- تحديات التوسعة: 73 تحدياً مرتبطة بدروس محددة لسد فجوات الدورات
-- مولَّد تلقائياً بـ scripts/progression/gen-challenge-expansion.ts — لا تعدّله يدوياً
-- py-oop: 6، py-advanced: 7، ai-basics: 4، ai-ml-basics: 4، ai-deep-learning: 8، cyber-basics: 3، cyber-advanced: 3، cpp-oop: 7، cpp-advanced: 6، backend-sql: 5، backend-auth: 4، backend-supabase: 4، backend-firebase: 4، backend-mongodb: 4، web-css-styling: 4
--
-- XP حسب الصعوبة (سهل 15–30، متوسط 30–60، صعب 60–120). وصول التحديات القديمة (169) لم يتغير.
-- الحلول النموذجية في challenge_solutions (20261003020000) وتُعرض فقط بعد إعلان معتمد أو بعد الحل.
-- آمن: إضافة فقط. قابل للتكرار.
-- ============================================================================
BEGIN;

ALTER TABLE challenge_catalog ADD COLUMN IF NOT EXISTS after_lesson_id TEXT;

INSERT INTO challenge_catalog (id, difficulty, points, required_course_id, after_lesson_id) VALUES
  ('pyoop-ch-001', 'easy', 20, 'py-oop', 'py-oop-3'),
  ('pyoop-ch-002', 'easy', 20, 'py-oop', 'py-oop-7'),
  ('pyoop-ch-003', 'medium', 35, 'py-oop', 'py-oop-4'),
  ('pyoop-ch-004', 'medium', 40, 'py-oop', 'py-oop-5'),
  ('pyoop-ch-005', 'medium', 35, 'py-oop', 'py-oop-9'),
  ('pyoop-ch-006', 'hard', 80, 'py-oop', 'py-oop-project'),
  ('pyadv-ch-001', 'easy', 25, 'py-advanced', 'py-adv-7'),
  ('pyadv-ch-002', 'medium', 40, 'py-advanced', 'py-adv-3'),
  ('pyadv-ch-003', 'easy', 25, 'py-advanced', 'py-adv-4'),
  ('pyadv-ch-004', 'medium', 40, 'py-advanced', 'py-adv-5'),
  ('pyadv-ch-005', 'medium', 35, 'py-advanced', 'py-adv-8'),
  ('pyadv-ch-006', 'easy', 25, 'py-advanced', 'py-adv-6'),
  ('pyadv-ch-007', 'hard', 75, 'py-advanced', 'py-adv-project'),
  ('aib-ch-001', 'easy', 15, NULL, 'ai-3'),
  ('aib-ch-002', 'easy', 20, NULL, 'ai-3'),
  ('aib-ch-003', 'medium', 30, NULL, 'ai-2'),
  ('aib-ch-004', 'medium', 30, NULL, 'ai-5'),
  ('ml-ch-001', 'medium', 45, 'ai-ml-basics', 'ml-3'),
  ('ml-ch-002', 'medium', 35, 'ai-ml-basics', 'ml-4'),
  ('ml-ch-003', 'medium', 50, 'ai-ml-basics', 'ml-7'),
  ('ml-ch-004', 'hard', 80, 'ai-ml-basics', 'ml-5'),
  ('dl-ch-001', 'easy', 25, 'ai-deep-learning', 'dl-3'),
  ('dl-ch-002', 'medium', 35, 'ai-deep-learning', 'dl-4'),
  ('dl-ch-003', 'medium', 40, 'ai-deep-learning', 'dl-2'),
  ('dl-ch-004', 'easy', 25, 'ai-deep-learning', 'dl-5'),
  ('dl-ch-005', 'hard', 75, 'ai-deep-learning', 'dl-8'),
  ('dl-ch-006', 'medium', 40, 'ai-deep-learning', 'dl-13'),
  ('dl-ch-007', 'medium', 40, 'ai-deep-learning', 'dl-14'),
  ('dl-ch-008', 'hard', 70, 'ai-deep-learning', 'dl-transformers'),
  ('cybd-ch-001', 'easy', 20, NULL, 'cyber-cookies-sessions'),
  ('cybd-ch-002', 'medium', 30, NULL, 'cyber-3'),
  ('cybd-ch-003', 'easy', 20, NULL, 'cyber-6'),
  ('cybd-ch-004', 'medium', 45, 'cyber-advanced', 'cyber-sql-001'),
  ('cybd-ch-005', 'easy', 20, 'cyber-advanced', 'cyber-xss-001'),
  ('cybd-ch-006', 'medium', 35, 'cyber-advanced', 'cyber-adv-3'),
  ('cppoop-ch-001', 'easy', 15, 'cpp-oop', 'cpp-adv-1'),
  ('cppoop-ch-002', 'easy', 20, 'cpp-oop', 'cpp-adv-3'),
  ('cppoop-ch-003', 'easy', 25, 'cpp-oop', 'cpp-adv-8'),
  ('cppoop-ch-004', 'medium', 45, 'cpp-oop', 'cpp-adv-6'),
  ('cppoop-ch-005', 'medium', 40, 'cpp-oop', 'cpp-adv-4'),
  ('cppoop-ch-006', 'medium', 55, 'cpp-oop', 'cpp-adv-7'),
  ('cppoop-ch-007', 'hard', 85, 'cpp-oop', 'cpp-adv-12'),
  ('cppadv-ch-001', 'easy', 20, 'cpp-advanced', 'cpp-adv-13'),
  ('cppadv-ch-002', 'medium', 35, 'cpp-advanced', 'cpp-advanced-stl-containers'),
  ('cppadv-ch-003', 'medium', 35, 'cpp-advanced', 'cpp-adv-15'),
  ('cppadv-ch-004', 'medium', 30, 'cpp-advanced', 'cpp-adv-17'),
  ('cppadv-ch-005', 'medium', 35, 'cpp-advanced', 'cpp-advanced-modern'),
  ('cppadv-ch-006', 'hard', 70, 'cpp-advanced', 'cpp-adv-22'),
  ('sql-ch-001', 'easy', 15, NULL, 'sql-2'),
  ('sql-ch-002', 'easy', 25, NULL, 'sql-3'),
  ('sql-ch-003', 'medium', 35, NULL, 'sql-4'),
  ('sql-ch-004', 'medium', 45, NULL, 'sql-6'),
  ('sql-ch-005', 'hard', 75, NULL, 'sql-project'),
  ('auth-ch-001', 'easy', 20, 'backend-auth', 'auth-1'),
  ('auth-ch-002', 'medium', 40, 'backend-auth', 'auth-2'),
  ('auth-ch-003', 'medium', 55, 'backend-auth', 'auth-5'),
  ('auth-ch-004', 'hard', 90, 'backend-auth', 'auth-rate-limit-mfa'),
  ('supa-ch-001', 'easy', 25, 'backend-supabase', 'supa-6'),
  ('supa-ch-002', 'medium', 35, 'backend-supabase', 'supa-2'),
  ('supa-ch-003', 'medium', 40, 'backend-supabase', 'supa-3'),
  ('supa-ch-004', 'easy', 25, 'backend-supabase', 'supa-4'),
  ('fire-ch-001', 'easy', 20, 'backend-firebase', 'firebase-2'),
  ('fire-ch-002', 'medium', 40, 'backend-firebase', 'firebase-5'),
  ('fire-ch-003', 'medium', 45, 'backend-firebase', 'firebase-project'),
  ('fire-ch-004', 'easy', 20, 'backend-firebase', 'firebase-4'),
  ('mongo-ch-001', 'medium', 40, 'backend-mongodb', 'mongo-3'),
  ('mongo-ch-002', 'medium', 35, 'backend-mongodb', 'mongo-5'),
  ('mongo-ch-003', 'easy', 25, 'backend-mongodb', 'mongo-4'),
  ('mongo-ch-004', 'hard', 80, 'backend-mongodb', 'mongo-project'),
  ('cssx-ch-001', 'easy', 15, NULL, 'css-8'),
  ('cssx-ch-002', 'easy', 20, NULL, 'css-10'),
  ('cssx-ch-003', 'medium', 30, NULL, 'css-12'),
  ('cssx-ch-004', 'medium', 30, NULL, 'css-11')
ON CONFLICT (id) DO UPDATE SET difficulty = EXCLUDED.difficulty, points = EXCLUDED.points,
  required_course_id = EXCLUDED.required_course_id, after_lesson_id = EXCLUDED.after_lesson_id, updated_at = NOW();

COMMIT;

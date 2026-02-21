-- ===== Kodax Database Migration - Full Supabase Integration =====
-- نقل كامل للاعتماد على Supabase بدون بيانات محلية
-- تاريخ: 2026-02-04

-- ===== 1. جدول الكورسات =====
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  field_id TEXT REFERENCES programming_fields(id),
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  icon TEXT NOT NULL DEFAULT 'book',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  total_lessons INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  order_index INTEGER NOT NULL DEFAULT 1,
  is_locked BOOLEAN DEFAULT FALSE,
  required_course_id TEXT REFERENCES courses(id),
  points_cost INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS للكورسات
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT USING (true);

-- Index للأداء
CREATE INDEX IF NOT EXISTS idx_courses_field ON courses(field_id);
CREATE INDEX IF NOT EXISTS idx_courses_order ON courses(order_index);

-- ===== 2. جدول الدروس (إصدار جديد مع الاختبارات) =====
CREATE TABLE IF NOT EXISTS lessons_v2 (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  field_id TEXT REFERENCES programming_fields(id),
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  code_example TEXT,
  language TEXT,
  xp_reward INTEGER DEFAULT 100,
  order_index INTEGER NOT NULL,
  type TEXT CHECK (type IN ('theory', 'practice', 'quiz')) DEFAULT 'theory',
  estimated_minutes INTEGER DEFAULT 10,
  quiz JSONB, -- {question, options[], correct_answer, explanation}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS للدروس
ALTER TABLE lessons_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons are viewable by everyone" ON lessons_v2
  FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lessons_v2_course ON lessons_v2(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_v2_field ON lessons_v2(field_id);
CREATE INDEX IF NOT EXISTS idx_lessons_v2_order ON lessons_v2(course_id, order_index);

-- ===== 3. جدول تقدم المستخدم في الدروس =====
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0,
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- RLS لتقدم المستخدم
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_course ON user_lesson_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson ON user_lesson_progress(user_id, lesson_id);

-- ===== 4. تحديث جدول التحديات =====
-- إضافة أعمدة جديدة إذا لم تكن موجودة
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS hints JSONB;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'javascript';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS time_limit INTEGER DEFAULT 300;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS category TEXT;

-- ===== 5. تحديث جدول user_unlocked_courses =====
-- (موجود مسبقاً في schema.sql)

-- ===== 6. دالة تحديث تقدم الكورس تلقائياً =====
CREATE OR REPLACE FUNCTION update_course_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث عدد الدروس في الكورس
  UPDATE courses 
  SET 
    total_lessons = (
      SELECT COUNT(*) FROM lessons_v2 WHERE course_id = NEW.course_id
    ),
    total_xp = (
      SELECT COALESCE(SUM(xp_reward), 0) FROM lessons_v2 WHERE course_id = NEW.course_id
    ),
    updated_at = NOW()
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث عدد الدروس
DROP TRIGGER IF EXISTS trg_update_course_lessons ON lessons_v2;
CREATE TRIGGER trg_update_course_lessons
AFTER INSERT OR UPDATE OR DELETE ON lessons_v2
FOR EACH ROW
EXECUTE FUNCTION update_course_lesson_count();

-- ===== 7. دالة حساب المستوى من XP =====
CREATE OR REPLACE FUNCTION calculate_level(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(SQRT(xp_amount / 100.0))::INTEGER);
END;
$$ LANGUAGE plpgsql;

-- ===== 8. دالة تحديث XP المستخدم =====
CREATE OR REPLACE FUNCTION update_user_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS void AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- جلب XP الحالي
  SELECT xp INTO new_xp FROM profiles WHERE id = p_user_id;
  new_xp := COALESCE(new_xp, 0) + p_xp_amount;
  new_level := calculate_level(new_xp);
  
  -- تحديث الملف الشخصي
  UPDATE profiles
  SET 
    xp = new_xp,
    level = new_level,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 9. دالة جلب تقدم كورس معين =====
CREATE OR REPLACE FUNCTION get_course_progress(p_user_id UUID, p_course_id TEXT)
RETURNS TABLE(
  completed_count INTEGER,
  total_count INTEGER,
  progress_percent INTEGER,
  last_lesson_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM user_lesson_progress 
     WHERE user_id = p_user_id AND course_id = p_course_id AND completed = true),
    (SELECT COUNT(*)::INTEGER FROM lessons_v2 WHERE course_id = p_course_id),
    CASE 
      WHEN (SELECT COUNT(*) FROM lessons_v2 WHERE course_id = p_course_id) > 0 
      THEN (
        (SELECT COUNT(*) FROM user_lesson_progress 
         WHERE user_id = p_user_id AND course_id = p_course_id AND completed = true)::NUMERIC /
        (SELECT COUNT(*) FROM lessons_v2 WHERE course_id = p_course_id) * 100
      )::INTEGER
      ELSE 0
    END,
    (SELECT lesson_id FROM user_lesson_progress 
     WHERE user_id = p_user_id AND course_id = p_course_id AND completed = true
     ORDER BY completed_at DESC LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 10. تمكين Realtime للجداول المهمة =====
-- (يجب تفعيل Realtime من Dashboard أيضاً)
ALTER PUBLICATION supabase_realtime ADD TABLE user_lesson_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- ===== 11. إدخال البيانات الأساسية =====

-- مجالات البرمجة (إذا لم تكن موجودة)
INSERT INTO programming_fields (id, name, name_ar, icon, color, description) VALUES
  ('web-dev', 'Web Development', 'تطوير الويب', '🌐', '#3b82f6', 'تعلم HTML, CSS, JavaScript, وأطر العمل الحديثة'),
  ('python', 'Python', 'بايثون', '🐍', '#10b981', 'إتقان برمجة بايثون من الأساسيات للمتقدم'),
  ('cpp', 'C++', 'سي++', '⚡', '#8b5cf6', 'تعلم C++ وبرمجة النظم'),
  ('cybersecurity', 'Cybersecurity', 'الأمن السيبراني', '🔒', '#ef4444', 'تعلم الاختراق الأخلاقي والأمان'),
  ('ai-ml', 'AI & ML', 'الذكاء الاصطناعي', '🤖', '#f59e0b', 'الذكاء الاصطناعي والتعلم الآلي'),
  ('mobile-dev', 'Mobile Development', 'تطوير التطبيقات', '📱', '#06b6d4', 'تطوير تطبيقات الموبايل'),
  ('backend', 'Backend Development', 'تطوير الخوادم', '🖥️', '#6366f1', 'بناء APIs وخدمات الويب')
ON CONFLICT (id) DO NOTHING;

-- ===== 12. إدخال كورسات تجريبية =====

-- كورسات تطوير الويب
INSERT INTO courses (id, field_id, title, title_ar, description, description_ar, icon, color, difficulty, order_index, is_locked, points_cost) VALUES
  ('web-html-basics', 'web-dev', 'HTML Basics', 'أساسيات HTML', 'Learn to build web pages from scratch', 'تعلم بناء صفحات الويب من الصفر', 'document-text', '#e34c26', 'beginner', 1, false, 0),
  ('web-css-styling', 'web-dev', 'CSS Styling', 'تصميم CSS', 'Add beauty to your pages', 'أضف الجمال لصفحاتك', 'color-palette', '#264de4', 'beginner', 2, false, 0),
  ('web-js-basics', 'web-dev', 'JavaScript Basics', 'JavaScript الأساسيات', 'Make your pages interactive', 'اجعل صفحاتك تفاعلية', 'logo-javascript', '#f7df1e', 'intermediate', 3, true, 500),
  ('web-react-intro', 'web-dev', 'React Introduction', 'مقدمة React', 'Build modern web apps', 'ابنِ تطبيقات ويب حديثة', 'logo-react', '#61dafb', 'advanced', 4, true, 1000)
ON CONFLICT (id) DO UPDATE SET
  title_ar = EXCLUDED.title_ar,
  description_ar = EXCLUDED.description_ar,
  updated_at = NOW();

-- كورسات بايثون
INSERT INTO courses (id, field_id, title, title_ar, description, description_ar, icon, color, difficulty, order_index, is_locked, points_cost) VALUES
  ('python-basics', 'python', 'Python Basics', 'أساسيات بايثون', 'Start your Python journey', 'ابدأ رحلتك مع بايثون', 'logo-python', '#3776ab', 'beginner', 1, false, 0),
  ('python-oop', 'python', 'Python OOP', 'البرمجة الكائنية', 'Object-Oriented Programming', 'البرمجة الكائنية في بايثون', 'cube', '#306998', 'intermediate', 2, true, 500),
  ('python-advanced', 'python', 'Advanced Python', 'بايثون المتقدم', 'Advanced Python concepts', 'مفاهيم بايثون المتقدمة', 'rocket', '#ffd43b', 'advanced', 3, true, 1000)
ON CONFLICT (id) DO UPDATE SET
  title_ar = EXCLUDED.title_ar,
  description_ar = EXCLUDED.description_ar,
  updated_at = NOW();

-- ===== 13. إدخال دروس تجريبية مع اختبارات =====

-- دروس HTML
INSERT INTO lessons_v2 (id, course_id, field_id, title, title_ar, description, content, code_example, language, xp_reward, order_index, type, estimated_minutes, quiz) VALUES
  ('html-1', 'web-html-basics', 'web-dev', 'What is HTML?', 'ما هو HTML؟', 'Introduction to HTML', 
   '# ما هو HTML؟

HTML هي اختصار لـ HyperText Markup Language، وهي لغة الترميز الأساسية لإنشاء صفحات الويب.

## لماذا نتعلم HTML؟

- HTML هي أساس كل صفحة ويب
- سهلة التعلم والفهم
- مطلوبة في جميع وظائف تطوير الويب

## أول كود HTML

لنبدأ بأبسط صفحة HTML:',
   '<!DOCTYPE html>
<html>
<head>
  <title>صفحتي الأولى</title>
</head>
<body>
  <h1>مرحباً بالعالم!</h1>
</body>
</html>',
   'html', 100, 1, 'theory', 10,
   '{"question": "ماذا يعني الاختصار HTML؟", "options": ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyper Transfer Markup Language"], "correct_answer": 0, "explanation": "HTML تعني HyperText Markup Language وهي لغة ترميز النص الفائق"}'::JSONB
  ),
  ('html-2', 'web-html-basics', 'web-dev', 'HTML Tags', 'وسوم HTML', 'Learn about HTML tags',
   '# وسوم HTML

الوسوم (Tags) هي العناصر الأساسية في HTML. كل وسم له غرض محدد.

## الوسوم الأساسية

- `<h1>` إلى `<h6>`: العناوين
- `<p>`: الفقرات
- `<a>`: الروابط
- `<img>`: الصور
- `<div>`: حاوية عامة',
   '<h1>عنوان رئيسي</h1>
<h2>عنوان فرعي</h2>
<p>هذه فقرة نصية</p>
<a href="https://google.com">رابط لجوجل</a>',
   'html', 100, 2, 'practice', 15,
   '{"question": "أي وسم يُستخدم لإنشاء رابط؟", "options": ["<link>", "<a>", "<href>", "<url>"], "correct_answer": 1, "explanation": "الوسم <a> يُستخدم لإنشاء الروابط في HTML، و href تحدد عنوان الرابط"}'::JSONB
  ),
  ('html-3', 'web-html-basics', 'web-dev', 'HTML Lists', 'القوائم في HTML', 'Learn to create lists',
   '# القوائم في HTML

هناك نوعان رئيسيان من القوائم:

## القائمة المرقمة (Ordered List)
تستخدم `<ol>` مع `<li>`

## القائمة غير المرقمة (Unordered List)
تستخدم `<ul>` مع `<li>`',
   '<ul>
  <li>عنصر أول</li>
  <li>عنصر ثاني</li>
</ul>

<ol>
  <li>خطوة 1</li>
  <li>خطوة 2</li>
</ol>',
   'html', 100, 3, 'practice', 10,
   '{"question": "ما الوسم المستخدم لإنشاء قائمة مرقمة؟", "options": ["<ul>", "<ol>", "<li>", "<list>"], "correct_answer": 1, "explanation": "الوسم <ol> (Ordered List) يُنشئ قائمة مرقمة، بينما <ul> للقائمة غير المرقمة"}'::JSONB
  ),
  ('html-4', 'web-html-basics', 'web-dev', 'HTML Forms', 'النماذج في HTML', 'Create interactive forms',
   '# النماذج في HTML

النماذج تسمح للمستخدم بإدخال البيانات.

## عناصر النموذج

- `<form>`: حاوية النموذج
- `<input>`: حقل إدخال
- `<button>`: زر
- `<textarea>`: منطقة نص كبيرة
- `<select>`: قائمة منسدلة',
   '<form>
  <label>الاسم:</label>
  <input type="text" name="name">
  
  <label>البريد:</label>
  <input type="email" name="email">
  
  <button type="submit">إرسال</button>
</form>',
   'html', 100, 4, 'practice', 15,
   '{"question": "ما الوسم المستخدم لإنشاء حقل إدخال؟", "options": ["<field>", "<textbox>", "<input>", "<text>"], "correct_answer": 2, "explanation": "الوسم <input> يُستخدم لإنشاء حقول الإدخال المختلفة"}'::JSONB
  ),
  ('html-5', 'web-html-basics', 'web-dev', 'HTML Tables', 'الجداول في HTML', 'Create data tables',
   '# الجداول في HTML

الجداول تُستخدم لعرض البيانات بشكل منظم.

## هيكل الجدول

- `<table>`: حاوية الجدول
- `<tr>`: صف (Table Row)
- `<th>`: خلية عنوان (Table Header)
- `<td>`: خلية بيانات (Table Data)',
   '<table border="1">
  <tr>
    <th>الاسم</th>
    <th>العمر</th>
  </tr>
  <tr>
    <td>أحمد</td>
    <td>25</td>
  </tr>
</table>',
   'html', 100, 5, 'practice', 12,
   '{"question": "ما الوسم المستخدم لإنشاء صف في الجدول؟", "options": ["<td>", "<th>", "<tr>", "<row>"], "correct_answer": 2, "explanation": "الوسم <tr> (Table Row) يُنشئ صفاً في الجدول"}'::JSONB
  )
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  quiz = EXCLUDED.quiz,
  updated_at = NOW();

-- دروس بايثون
INSERT INTO lessons_v2 (id, course_id, field_id, title, title_ar, description, content, code_example, language, xp_reward, order_index, type, estimated_minutes, quiz) VALUES
  ('python-1', 'python-basics', 'python', 'Python Introduction', 'مقدمة في بايثون', 'Your first Python code',
   '# مقدمة في بايثون

بايثون هي لغة برمجة سهلة وقوية، تُستخدم في:
- تطوير الويب
- علم البيانات
- الذكاء الاصطناعي
- الأتمتة

## أول برنامج

لنكتب أول برنامج بايثون:',
   'print("مرحباً بالعالم!")
print("أنا أتعلم بايثون")

# هذا تعليق - لا يُنفذ
name = "كودكس"
print(f"مرحباً {name}")',
   'python', 100, 1, 'theory', 10,
   '{"question": "ما الدالة المستخدمة للطباعة في بايثون؟", "options": ["echo()", "console.log()", "print()", "write()"], "correct_answer": 2, "explanation": "دالة print() تُستخدم لطباعة النصوص في بايثون"}'::JSONB
  ),
  ('python-2', 'python-basics', 'python', 'Variables', 'المتغيرات', 'Learn about variables',
   '# المتغيرات في بايثون

المتغيرات تُخزن البيانات للاستخدام لاحقاً.

## أنواع البيانات

- `int`: أعداد صحيحة
- `float`: أعداد عشرية
- `str`: نصوص
- `bool`: قيم منطقية (True/False)
- `list`: قوائم',
   '# أنواع المتغيرات
age = 25          # int
price = 19.99     # float
name = "أحمد"     # str
is_student = True # bool

# طباعة النوع
print(type(age))  # <class ''int''>',
   'python', 100, 2, 'practice', 12,
   '{"question": "ما نوع المتغير x = 3.14؟", "options": ["int", "str", "float", "bool"], "correct_answer": 2, "explanation": "الأعداد العشرية في بايثون من نوع float"}'::JSONB
  ),
  ('python-3', 'python-basics', 'python', 'Conditionals', 'الشروط', 'If statements',
   '# الجمل الشرطية

الشروط تسمح بتنفيذ كود معين بناءً على حالة.

## بنية if

```python
if condition:
    # كود يُنفذ إذا كان الشرط صحيحاً
elif another_condition:
    # كود بديل
else:
    # كود افتراضي
```',
   'age = 18

if age >= 18:
    print("أنت بالغ")
elif age >= 13:
    print("أنت مراهق")
else:
    print("أنت طفل")

# مثال آخر
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"
print(f"درجتك: {grade}")',
   'python', 100, 3, 'practice', 15,
   '{"question": "ماذا يطبع الكود إذا كان age = 15؟", "options": ["أنت بالغ", "أنت مراهق", "أنت طفل", "لا شيء"], "correct_answer": 1, "explanation": "15 أكبر من أو يساوي 13 وأقل من 18، لذا يطبع \"أنت مراهق\""}'::JSONB
  ),
  ('python-4', 'python-basics', 'python', 'Loops', 'الحلقات', 'For and while loops',
   '# الحلقات التكرارية

الحلقات تكرر تنفيذ كود معين.

## حلقة for
تُستخدم للتكرار على مجموعة عناصر.

## حلقة while
تُستخدم للتكرار طالما الشرط صحيح.',
   '# حلقة for
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# حلقة for على قائمة
fruits = ["تفاح", "موز", "برتقال"]
for fruit in fruits:
    print(fruit)

# حلقة while
count = 0
while count < 3:
    print(count)
    count += 1',
   'python', 100, 4, 'practice', 15,
   '{"question": "كم مرة تُنفذ range(5)؟", "options": ["4 مرات", "5 مرات", "6 مرات", "مرة واحدة"], "correct_answer": 1, "explanation": "range(5) يُنتج الأرقام من 0 إلى 4، أي 5 أرقام"}'::JSONB
  ),
  ('python-5', 'python-basics', 'python', 'Functions', 'الدوال', 'Create reusable functions',
   '# الدوال في بايثون

الدوال تُجمع كوداً قابلاً لإعادة الاستخدام.

## تعريف دالة

```python
def function_name(parameters):
    # كود الدالة
    return result
```',
   '# دالة بسيطة
def greet(name):
    return f"مرحباً {name}!"

print(greet("أحمد"))  # مرحباً أحمد!

# دالة مع قيمة افتراضية
def add(a, b=10):
    return a + b

print(add(5))      # 15
print(add(5, 20))  # 25

# دالة تُرجع قيم متعددة
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers)/len(numbers)

low, high, avg = get_stats([1, 2, 3, 4, 5])',
   'python', 100, 5, 'practice', 18,
   '{"question": "ما قيمة add(5) إذا كانت الدالة def add(a, b=10): return a + b؟", "options": ["5", "10", "15", "خطأ"], "correct_answer": 2, "explanation": "b تأخذ القيمة الافتراضية 10، فيكون الناتج 5 + 10 = 15"}'::JSONB
  )
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  quiz = EXCLUDED.quiz,
  updated_at = NOW();

-- ===== 14. تحديث عدد الدروس في الكورسات =====
UPDATE courses SET 
  total_lessons = (SELECT COUNT(*) FROM lessons_v2 WHERE course_id = courses.id),
  total_xp = (SELECT COALESCE(SUM(xp_reward), 0) FROM lessons_v2 WHERE course_id = courses.id);

-- ===== 15. إدخال تحديات =====
INSERT INTO challenges (id, title, title_ar, description, field_id, difficulty, xp_reward, type, test_cases, starter_code, solution_code, hints, language, category, active) VALUES
  (gen_random_uuid(), 'Hello World', 'مرحباً بالعالم', 'اكتب دالة تُرجع "Hello World"', 'python', 'easy', 50, 'daily',
   '[{"input": "", "expected_output": "Hello World", "description": "يجب أن تُرجع Hello World"}]'::JSONB,
   'def hello():\n    # اكتب كودك هنا\n    pass',
   'def hello():\n    return "Hello World"',
   '["استخدم return", "النص يجب أن يكون بين علامتي تنصيص"]'::JSONB,
   'python', 'basics', true
  ),
  (gen_random_uuid(), 'Sum Two Numbers', 'جمع عددين', 'اكتب دالة تجمع عددين', 'python', 'easy', 75, 'daily',
   '[{"input": "2, 3", "expected_output": "5", "description": "2 + 3 = 5"}, {"input": "10, 20", "expected_output": "30", "description": "10 + 20 = 30"}]'::JSONB,
   'def add(a, b):\n    # اكتب كودك هنا\n    pass',
   'def add(a, b):\n    return a + b',
   '["استخدم عامل الجمع +", "أرجع الناتج باستخدام return"]'::JSONB,
   'python', 'basics', true
  ),
  (gen_random_uuid(), 'Even or Odd', 'زوجي أم فردي', 'اكتب دالة تُحدد إذا كان العدد زوجياً', 'python', 'easy', 100, 'weekly',
   '[{"input": "4", "expected_output": "even", "description": "4 زوجي"}, {"input": "7", "expected_output": "odd", "description": "7 فردي"}]'::JSONB,
   'def check_even_odd(n):\n    # اكتب كودك هنا\n    pass',
   'def check_even_odd(n):\n    return "even" if n % 2 == 0 else "odd"',
   '["استخدم عامل باقي القسمة %", "إذا كان الباقي 0 فالعدد زوجي"]'::JSONB,
   'python', 'basics', true
  )
ON CONFLICT DO NOTHING;

-- ===== الانتهاء =====
SELECT 'Migration completed successfully!' AS status;

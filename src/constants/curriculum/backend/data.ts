/**
 * منهجا backend-sql و backend-mongodb.
 *
 * كان (SQL): 7 دروس بشرح من 5–10 أسطر؛ أمثلة MySQL فقط (AUTO_INCREMENT) بلا ذكر للفروق؛
 * لا مثال يمكن تشغيله وحده (الجداول غير معرّفة في الدروس التالية)؛ لا ذكر للمفاتيح الأجنبية بعمق،
 * ولا لـ NULL في المقارنات، ولا لحقن SQL والاستعلامات المعاملية رغم أنها أهم درس أمني للمطور.
 * كان (MongoDB): 5 دروس قصيرة؛ أمثلة Mongoose بشكل "ورقة غش" تعيد تعريف نفس المتغيرات
 * وتستخدم await خارج دالة async في CommonJS (لا تعمل إن نُسخت)؛ لا ذكر لـ sanitizeFilter
 * ولا لحدود التضمين (16MB) ولا للفهارس.
 * التحقق: أمثلة SQL تُشغَّل فعلياً على SQLite؛ أمثلة Mongoose يُفحص صياغتها فقط (لا خادم MongoDB).
 */
import type { CoursePlan } from '../types';
import { md } from '../md';
import { SQL_NEW_LESSONS } from './more-sql';
import { MONGO_1_CONTENT, MONGO_NEW_LESSONS } from './more-mongo';

const SCHEMA = `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  city TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total REAL NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO users (id, name, email, city) VALUES
  (1, 'سارة', 'sara@example.com', 'بغداد'),
  (2, 'عمر', 'omar@example.com', 'البصرة'),
  (3, 'ليلى', 'layla@example.com', 'بغداد'),
  (4, 'زيد', 'zaid@example.com', NULL);

INSERT INTO orders (user_id, total, status) VALUES
  (1, 120.0, 'paid'), (1, 45.5, 'paid'), (2, 300.0, 'pending'),
  (3, 80.0, 'paid'), (3, 15.0, 'cancelled'), (1, 60.0, 'pending');
`;

export const BACKEND_SQL_PLAN: CoursePlan = {
  courseId: 'backend-sql',
  course: {
    description:
      'من الاستعلام إلى قاعدة بيانات تطبيق حقيقي: تصميم المخطط والتطبيع، CRUD والربط والتجميع والاستعلامات الفرعية، الفهارس والمعاملات وحقن SQL، PostgreSQL من Node.js والترحيلات — مع مشروع قاعدة بيانات متجر.',
  },
  sections: [
    { title: 'الأساسيات', lessons: ['sql-1', 'sql-schema-design', 'sql-2'] },
    { title: 'الاستعلام المتقدم', lessons: ['sql-3', 'sql-4', 'sql-6'] },
    { title: 'الأداء والسلامة', lessons: ['sql-5', 'sql-7', 'sql-injection'] },
    { title: 'PostgreSQL في التطبيقات', lessons: ['sql-postgres-node', 'sql-migrations'] },
    { title: 'المشروع', lessons: ['sql-project'] },
  ],
  patches: {
    'sql-1': {
      description: 'قواعد البيانات العلائقية: الجداول والصفوف والأعمدة، الأنواع، المفتاح الأساسي والأجنبي، القيود، والتطبيع باختصار',
      content: md`
# مقدمة في قواعد البيانات العلائقية

قاعدة البيانات العلائقية تخزن البيانات في **جداول** مترابطة: كل جدول يمثل نوعاً من الأشياء (مستخدمون، طلبات)، وكل **صف** عنصر واحد، وكل **عمود** خاصية.

## لماذا لا نحفظ كل شيء في ملف JSON؟
قاعدة البيانات تعطيك: استعلامات سريعة على ملايين الصفوف، وكتابة متزامنة من مستخدمين كثيرين دون تلف، وقيوداً تحمي صحة البيانات، ومعاملات (كل شيء أو لا شيء).

## الأنظمة الشائعة
| النظام | ملاحظات |
|---|---|
| **PostgreSQL** | الأقوى والأكثر ميزات؛ يستخدمه Supabase |
| MySQL / MariaDB | منتشر جداً في الاستضافات |
| **SQLite** | ملف واحد بلا خادم — ممتاز للتعلم والتطبيقات الصغيرة والجوال؛ أمثلة هذه الدورة تعمل عليه |
| SQL Server / Oracle | بيئات الشركات |
لغة SQL متشابهة بينها بنسبة كبيرة، مع فروق في التفاصيل (مثل الترقيم التلقائي).

## تصميم جدول
\`\`\`sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,                 -- مفتاح أساسي: فريد لكل صف
  name TEXT NOT NULL,                     -- إلزامي
  email TEXT NOT NULL UNIQUE,             -- لا يتكرر
  age INTEGER CHECK (age >= 13),          -- شرط على القيمة
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
\`\`\`
| القيد | يضمن |
|---|---|
| \`PRIMARY KEY\` | هوية فريدة لكل صف |
| \`NOT NULL\` | القيمة موجودة |
| \`UNIQUE\` | لا تكرار (البريد) |
| \`CHECK\` | شرط منطقي |
| \`DEFAULT\` | قيمة تلقائية |
| \`REFERENCES\` (مفتاح أجنبي) | القيمة موجودة في جدول آخر |

القيود خط الدفاع الأخير: حتى لو أخطأ كود التطبيق، ترفض القاعدة البيانات الفاسدة.

## الترقيم التلقائي: فرق بين الأنظمة
| النظام | الصيغة |
|---|---|
| SQLite | \`id INTEGER PRIMARY KEY\` |
| PostgreSQL | \`id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY\` (أو \`SERIAL\` القديم) |
| MySQL | \`id INT AUTO_INCREMENT PRIMARY KEY\` |

## العلاقات بالمفتاح الأجنبي
\`\`\`sql
CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE RESTRICT
);
\`\`\`
| نوع العلاقة | التنفيذ |
|---|---|
| واحد لمتعدد (مؤلف ← كتب) | مفتاح أجنبي في جدول "المتعدد" |
| متعدد لمتعدد (طلاب ↔ دورات) | **جدول وسيط** (enrollments) فيه مفتاحان أجنبيان |
| واحد لواحد | مفتاح أجنبي فريد |

\`ON DELETE\`: \`RESTRICT\` (امنع حذف مؤلف له كتب)، \`CASCADE\` (احذف كتبه معه)، \`SET NULL\`. (في SQLite فعّل المفاتيح الأجنبية بـ \`PRAGMA foreign_keys = ON;\`.)

## التطبيع باختصار
لا تكرر المعلومة: اسم المدينة لا يُكتب نصاً في 10,000 صف ثم يُعدَّل في بعضها فقط. ضع الأشياء المستقلة في جداولها واربطها بالمعرّفات.

## تمرين
صمم جداول لمكتبة: مؤلفون، كتب، أعضاء، واستعارات (عضو يستعير كتاباً بتاريخ ويعيده لاحقاً). حدد المفاتيح والقيود، ونفّذها على SQLite.
`,
      codeExample: `PRAGMA foreign_keys = ON;

CREATE TABLE authors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  published_year INTEGER CHECK (published_year BETWEEN 1400 AND 2100),
  author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE RESTRICT
);

CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

-- متعدد لمتعدد عبر جدول وسيط مع بيانات إضافية (التواريخ)
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id),
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  borrowed_at TEXT NOT NULL DEFAULT (date('now')),
  returned_at TEXT
);

INSERT INTO authors (id, name) VALUES (1, 'طه حسين'), (2, 'نجيب محفوظ');
INSERT INTO books (title, published_year, author_id) VALUES
  ('الأيام', 1929, 1), ('اللص والكلاب', 1961, 2), ('بين القصرين', 1956, 2);
INSERT INTO members (name, email) VALUES ('سارة', 'sara@example.com'), ('عمر', 'omar@example.com');
INSERT INTO loans (book_id, member_id) VALUES (2, 1), (3, 2);

SELECT b.title, a.name AS author FROM books b JOIN authors a ON a.id = b.author_id;`,
    },
    'sql-2': {
      description: 'العمليات الأربع: INSERT و SELECT (WHERE و ORDER BY و LIMIT) و UPDATE و DELETE، التعامل مع NULL، والخطأ الأخطر: نسيان WHERE',
      content: md`
# عمليات CRUD

كل الأمثلة تفترض الجداول التالية (المثال الكامل ينشئها):
\`\`\`sql
${SCHEMA}\`\`\`

## INSERT — إضافة
\`\`\`sql
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL);
INSERT INTO products (name, price) VALUES ('قلم', 1.5);
INSERT INTO products (name, price) VALUES ('دفتر', 3.0), ('ممحاة', 0.5);   -- عدة صفوف
\`\`\`
اكتب أسماء الأعمدة دائماً: يحمي كودك إذا أُضيف عمود جديد للجدول لاحقاً.

## SELECT — قراءة
\`\`\`sql
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL, category TEXT);
INSERT INTO products (name, price, category) VALUES ('قلم', 1.5, 'قرطاسية'), ('سماعة', 25, 'إلكترونيات'), ('دفتر', 3, 'قرطاسية');

SELECT name, price FROM products WHERE category = 'قرطاسية' AND price < 5 ORDER BY price DESC LIMIT 10;
SELECT * FROM products WHERE name LIKE '%ف%';          -- يحتوي "ف"
SELECT * FROM products WHERE price BETWEEN 2 AND 30;
SELECT * FROM products WHERE category IN ('قرطاسية', 'كتب');
SELECT DISTINCT category FROM products;
\`\`\`
- اطلب الأعمدة التي تحتاجها بدل \`*\` في كود الإنتاج.
- \`ORDER BY\` ضروري إن كان الترتيب يهمك؛ بدونه الترتيب **غير مضمون**.

## NULL: ليس قيمة بل "غير معروف"
\`\`\`sql
CREATE TABLE people (name TEXT, city TEXT);
INSERT INTO people VALUES ('سارة', 'بغداد'), ('زيد', NULL);
SELECT * FROM people WHERE city = NULL;        -- لا يعيد شيئاً أبداً!
SELECT * FROM people WHERE city IS NULL;       -- الصحيح
SELECT name, COALESCE(city, 'غير محدد') AS city FROM people;
\`\`\`
أي مقارنة مع NULL نتيجتها "غير معروف" (لا صحيح ولا خطأ). و \`city <> 'بغداد'\` لا تعيد صفوف NULL أيضاً.

## UPDATE — تعديل
\`\`\`sql
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL);
INSERT INTO products VALUES (1, 'قلم', 1.5), (2, 'دفتر', 3);
UPDATE products SET price = price * 1.10 WHERE id = 2;
\`\`\`

## DELETE — حذف
\`\`\`sql
CREATE TABLE sessions (id INTEGER PRIMARY KEY, expires_at TEXT);
INSERT INTO sessions VALUES (1, '2020-01-01'), (2, '2999-01-01');
DELETE FROM sessions WHERE expires_at < date('now');
\`\`\`

## ⚠️ الخطأ الأخطر
\`UPDATE products SET price = 0;\` أو \`DELETE FROM users;\` **بلا WHERE** يعدّل/يحذف **كل** الصفوف. عادات تحميك:
1. اكتب الاستعلام كـ \`SELECT ... WHERE ...\` أولاً وتأكد من الصفوف، ثم حوّله.
2. نفّذ داخل معاملة (\`BEGIN\` ... ثم \`ROLLBACK\` إن أخطأت) — درس المعاملات.
3. نسخ احتياطية دائماً، وصلاحيات محدودة لمستخدم التطبيق.

## الحذف الناعم
تطبيقات كثيرة لا تحذف فعلاً بل تضع \`deleted_at\` وتستبعد هذه الصفوف في الاستعلامات — للاستعادة والتدقيق.

## تمرين
على جداول المثال: أضف مستخدماً، اعرض الطلبات المدفوعة بترتيب تنازلي للمبلغ، غيّر حالة الطلبات المعلقة الأقدم من 30 يوماً إلى cancelled (جرّبها كـ SELECT أولاً)، واعرض المستخدمين بلا مدينة.
`,
      codeExample: SCHEMA + `
-- قراءة
SELECT id, name, city FROM users WHERE city = 'بغداد' ORDER BY name;
SELECT name, COALESCE(city, 'غير محدد') AS city FROM users WHERE city IS NULL;

-- تعديل: جرّب الشرط بـ SELECT أولاً
SELECT id, status FROM orders WHERE status = 'pending' AND user_id = 1;
UPDATE orders SET status = 'paid' WHERE status = 'pending' AND user_id = 1;

-- حذف بشرط
DELETE FROM orders WHERE status = 'cancelled';

SELECT status, COUNT(*) AS n FROM orders GROUP BY status;`,
    },
    'sql-3': {
      description: 'ربط الجداول: INNER JOIN و LEFT JOIN، الأسماء المستعارة، ربط أكثر من جدولين، الربط الذاتي، وإيجاد "ما ليس له" بـ LEFT JOIN',
      content: md`
# JOIN — ربط الجداول

البيانات موزعة على جداول (درس التصميم). JOIN يجمعها في نتيجة واحدة عبر المفاتيح.

## INNER JOIN: المتطابق فقط
\`\`\`sql
${SCHEMA}
SELECT u.name, o.total, o.status
FROM orders o
INNER JOIN users u ON u.id = o.user_id
ORDER BY u.name;
\`\`\`
- \`o\` و \`u\` أسماء مستعارة تختصر الكتابة وتزيل الغموض (كلا الجدولين فيه \`id\`).
- شرط \`ON\` يحدد كيف ترتبط الصفوف.
- المستخدم بلا طلبات **لا يظهر**.

## LEFT JOIN: كل صفوف اليسار
\`\`\`sql
${SCHEMA}
SELECT u.name, COUNT(o.id) AS orders_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;
\`\`\`
كل المستخدمين يظهرون، ومن لا طلبات له تكون أعمدة الطلب NULL. لاحظ \`COUNT(o.id)\` لا \`COUNT(*)\`: الأولى لا تعد صفوف NULL فتعطي 0 صحيحاً.

## إيجاد "من ليس له"
\`\`\`sql
${SCHEMA}
SELECT u.name
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;          -- مستخدمون بلا أي طلب
\`\`\`

## أنواع JOIN
| النوع | النتيجة |
|---|---|
| \`INNER JOIN\` | المتطابق في الجدولين فقط |
| \`LEFT JOIN\` | كل اليسار + المطابق من اليمين (أو NULL) |
| \`RIGHT JOIN\` | العكس (نادر؛ اقلب ترتيب الجداول واستخدم LEFT) |
| \`FULL OUTER JOIN\` | الكل من الطرفين |
| \`CROSS JOIN\` | كل التركيبات (حذار: 1000 × 1000 = مليون صف) |

## ⚠️ شرط الفلترة في ON أم WHERE مع LEFT JOIN؟
\`\`\`sql
${SCHEMA}
-- كل المستخدمين مع طلباتهم المدفوعة فقط (من بلا طلب مدفوع يبقى ظاهراً)
SELECT u.name, o.total FROM users u LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid';
-- هذا يحوّلها عملياً لـ INNER JOIN: يحذف من ليس له طلب مدفوع
SELECT u.name, o.total FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.status = 'paid';
\`\`\`

## الربط الذاتي
جدول يُربط بنفسه، مثل موظف ومديره في جدول employees واحد: \`FROM employees e LEFT JOIN employees m ON m.id = e.manager_id\`.

## عدة جداول
الربط متسلسل: \`FROM loans l JOIN books b ON ... JOIN members m ON ...\` — لكل JOIN شرطه.

## تمرين
على جداول المثال: اعرض لكل مدينة عدد المستخدمين ومجموع مبيعاتهم المدفوعة (المدن بلا مبيعات تظهر بـ 0)، ثم اعرض أسماء المستخدمين الذين لديهم طلب ملغى.
`,
      codeExample: SCHEMA + `
-- INNER: الطلبات مع أسماء أصحابها
SELECT u.name, o.total, o.status
FROM orders o
JOIN users u ON u.id = o.user_id
ORDER BY o.total DESC;

-- LEFT: كل المستخدمين ومجموع مدفوعاتهم (0 لمن لا يملك)
SELECT u.name, COALESCE(SUM(o.total), 0) AS paid_total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid'
GROUP BY u.id, u.name
ORDER BY paid_total DESC;

-- من لا طلب له
SELECT u.name FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.id IS NULL;`,
    },
    'sql-4': {
      description: 'التجميع: COUNT و SUM و AVG و MIN و MAX، GROUP BY، الفرق بين WHERE و HAVING، وترتيب تنفيذ الاستعلام',
      content: md`
# التجميع: GROUP BY والدوال التجميعية

## الدوال التجميعية
تحوّل صفوفاً كثيرة إلى قيمة واحدة:
\`\`\`sql
${SCHEMA}
SELECT COUNT(*) AS orders, SUM(total) AS revenue, AVG(total) AS avg_order,
       MIN(total) AS smallest, MAX(total) AS largest
FROM orders WHERE status = 'paid';
\`\`\`
| الدالة | ملاحظة |
|---|---|
| \`COUNT(*)\` | كل الصفوف |
| \`COUNT(col)\` | الصفوف التي فيها col **ليست NULL** |
| \`COUNT(DISTINCT col)\` | القيم المختلفة |
| \`SUM\` و \`AVG\` | تتجاهل NULL |

## GROUP BY: قيمة لكل مجموعة
\`\`\`sql
${SCHEMA}
SELECT status, COUNT(*) AS n, SUM(total) AS total
FROM orders
GROUP BY status
ORDER BY total DESC;
\`\`\`
القاعدة: كل عمود في SELECT إما **في GROUP BY** أو **داخل دالة تجميعية**. (SQLite و MySQL القديم يتساهلان ويعيدان قيمة عشوائية من المجموعة — PostgreSQL يرفض. التزم بالقاعدة.)

## WHERE مقابل HAVING
\`\`\`sql
${SCHEMA}
SELECT user_id, SUM(total) AS spent
FROM orders
WHERE status = 'paid'          -- يفلتر الصفوف قبل التجميع
GROUP BY user_id
HAVING SUM(total) > 100;       -- يفلتر المجموعات بعد التجميع
\`\`\`
\`WHERE SUM(total) > 100\` خطأ: الصفوف تُفلتر قبل وجود المجاميع.

## ترتيب التنفيذ الفعلي
\`\`\`text
FROM / JOIN ← WHERE ← GROUP BY ← HAVING ← SELECT ← ORDER BY ← LIMIT
\`\`\`
لهذا لا تستطيع استخدام اسم مستعار من SELECT داخل WHERE (لم يُحسب بعد)، لكن تستطيع في ORDER BY.

## التجميع مع الربط
\`\`\`sql
${SCHEMA}
SELECT u.city, COUNT(DISTINCT u.id) AS customers, ROUND(SUM(o.total), 2) AS revenue
FROM users u JOIN orders o ON o.user_id = u.id
WHERE o.status = 'paid'
GROUP BY u.city;
\`\`\`
لاحظ: زيد بلا مدينة (NULL) يشكّل مجموعة خاصة إن كان له طلبات.

## دوال النوافذ (لمحة)
\`SUM(total) OVER (PARTITION BY user_id ORDER BY created_at)\` تحسب مجموعاً تراكمياً **دون** دمج الصفوف — للترتيب داخل المجموعات والمجاميع المتحركة. مدعومة في PostgreSQL و MySQL 8 و SQLite الحديث.

## تمرين
اعرض لكل مستخدم: عدد طلباته، ومتوسط قيمة طلباته المدفوعة، وتاريخ آخر طلب — فقط لمن لديه طلبان أو أكثر.
`,
      codeExample: SCHEMA + `
-- إحصائيات عامة
SELECT COUNT(*) AS orders, ROUND(SUM(total), 2) AS revenue, ROUND(AVG(total), 2) AS avg_order
FROM orders WHERE status = 'paid';

-- لكل حالة
SELECT status, COUNT(*) AS n, ROUND(SUM(total), 2) AS total
FROM orders GROUP BY status ORDER BY total DESC;

-- العملاء الذين دفعوا أكثر من 100 (WHERE قبل التجميع، HAVING بعده)
SELECT u.name, ROUND(SUM(o.total), 2) AS spent, COUNT(*) AS paid_orders
FROM orders o JOIN users u ON u.id = o.user_id
WHERE o.status = 'paid'
GROUP BY u.id, u.name
HAVING SUM(o.total) > 100
ORDER BY spent DESC;`,
    },
    'sql-6': {
      description: 'الاستعلامات الفرعية في WHERE و FROM و SELECT، EXISTS، تعبيرات WITH (CTE) لاستعلامات مقروءة، و Views',
      content: md`
# الاستعلامات الفرعية و Views

## استعلام فرعي في WHERE
\`\`\`sql
${SCHEMA}
-- الطلبات الأكبر من متوسط كل الطلبات
SELECT id, total FROM orders WHERE total > (SELECT AVG(total) FROM orders);
\`\`\`
الاستعلام الداخلي يعيد قيمة واحدة تُستخدم في المقارنة.

## IN و EXISTS
\`\`\`sql
${SCHEMA}
SELECT name FROM users WHERE id IN (SELECT user_id FROM orders WHERE status = 'paid');

SELECT name FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.total > 100);
\`\`\`
\`EXISTS\` يتوقف عند أول تطابق. ⚠️ \`NOT IN\` مع استعلام فرعي قد يعيد NULL يعطي نتيجة فارغة غير متوقعة؛ فضّل \`NOT EXISTS\`.

## استعلام فرعي في FROM (جدول مؤقت)
\`\`\`sql
${SCHEMA}
SELECT AVG(spent) AS avg_customer_spend
FROM (SELECT user_id, SUM(total) AS spent FROM orders WHERE status = 'paid' GROUP BY user_id) AS per_user;
\`\`\`

## WITH (CTE): نفس الشيء بقراءة أوضح
\`\`\`sql
${SCHEMA}
WITH per_user AS (
  SELECT user_id, SUM(total) AS spent
  FROM orders WHERE status = 'paid'
  GROUP BY user_id
),
ranked AS (
  SELECT u.name, p.spent FROM per_user p JOIN users u ON u.id = p.user_id
)
SELECT * FROM ranked WHERE spent > 50 ORDER BY spent DESC;
\`\`\`
CTE تسمّي خطوات الاستعلام وتقرأ من الأعلى للأسفل كخطوات منطقية. (\`WITH RECURSIVE\` تعالج البيانات الشجرية مثل التعليقات المتداخلة.)

## Views: استعلام محفوظ باسم
\`\`\`sql
${SCHEMA}
CREATE VIEW customer_summary AS
SELECT u.id, u.name, COUNT(o.id) AS orders, COALESCE(SUM(CASE WHEN o.status = 'paid' THEN o.total END), 0) AS paid_total
FROM users u LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;

SELECT * FROM customer_summary WHERE orders > 0;
\`\`\`
- تُستخدم كجدول في الاستعلامات.
- لا تخزن بيانات (إلا "Materialized Views" في PostgreSQL التي تُحدَّث يدوياً).
- مفيدة لإخفاء التعقيد، ولتقديم أعمدة محددة فقط (لا تُظهر الحقول الحساسة) — لكن الصلاحيات الفعلية تُضبط على مستوى القاعدة.

## تمرين
بـ CTE: احسب لكل مدينة متوسط إنفاق العميل، ثم اعرض فقط المدن التي يتجاوز متوسطها المتوسط العام لكل العملاء.
`,
      codeExample: SCHEMA + `
-- استعلام فرعي في WHERE
SELECT id, total FROM orders WHERE total > (SELECT AVG(total) FROM orders);

-- NOT EXISTS أأمن من NOT IN
SELECT name FROM users u WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- CTE متعددة الخطوات
WITH paid AS (
  SELECT user_id, SUM(total) AS spent FROM orders WHERE status = 'paid' GROUP BY user_id
)
SELECT u.name, p.spent FROM paid p JOIN users u ON u.id = p.user_id ORDER BY p.spent DESC;

-- View
CREATE VIEW customer_summary AS
SELECT u.id, u.name, COUNT(o.id) AS orders
FROM users u LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;

SELECT * FROM customer_summary ORDER BY orders DESC;`,
    },
    'sql-5': {
      description: 'الفهارس: كيف تسرّع البحث، متى تُنشأ (WHERE و JOIN و ORDER BY)، الفهارس المركبة وترتيب أعمدتها، تكلفتها، وقراءة خطة التنفيذ',
      content: md`
# الفهارس وتحسين الأداء

بدون فهرس، البحث عن \`email = 'x'\` في جدول من مليون صف يعني قراءة **كل** الصفوف (Full Table Scan). الفهرس مثل فهرس الكتاب: بنية مرتبة (B-Tree عادة) تقودك للصف مباشرة.

## إنشاء فهرس
\`\`\`sql
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, status TEXT, created_at TEXT);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);   -- مركب
CREATE UNIQUE INDEX idx_orders_unique_demo ON orders(id, user_id);
\`\`\`
\`PRIMARY KEY\` و \`UNIQUE\` يُنشئان فهارس تلقائياً.

## متى تحتاج فهرساً؟
- أعمدة تظهر كثيراً في \`WHERE\`.
- **المفاتيح الأجنبية** المستخدمة في \`JOIN\` (PostgreSQL و SQLite لا يفهرسانها تلقائياً!).
- أعمدة \`ORDER BY\` مع \`LIMIT\` (آخر 20 طلباً).

## الفهرس المركب: الترتيب مهم
فهرس على \`(status, created_at)\` يفيد:
- \`WHERE status = 'paid'\` ✅
- \`WHERE status = 'paid' AND created_at > '2026-01-01'\` ✅
- \`WHERE status = 'paid' ORDER BY created_at\` ✅
- \`WHERE created_at > '2026-01-01'\` وحده ❌ (مثل البحث في دليل هاتف مرتب بالاسم الأخير عن اسم أول)
ضع العمود الذي تُطابقه بالمساواة أولاً، ثم عمود المدى أو الترتيب.

## اقرأ خطة التنفيذ
\`\`\`sql
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, status TEXT);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE user_id = 5;     -- SCAN orders (بلا فهرس)
CREATE INDEX idx_orders_user ON orders(user_id);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE user_id = 5;     -- SEARCH orders USING INDEX
\`\`\`
في PostgreSQL: \`EXPLAIN ANALYZE\` يشغّل الاستعلام ويعرض الزمن الفعلي لكل خطوة. ابحث عن "Seq Scan" على جداول كبيرة.

## ما يمنع استخدام الفهرس
- دالة على العمود: \`WHERE lower(email) = '...'\` (الحل: فهرس على التعبير، أو تخزين البريد بأحرف صغيرة).
- \`LIKE '%كلمة'\` (نمط يبدأ بـ %). للبحث النصي: فهارس النص الكامل.
- مقارنة أنواع مختلفة (نص مع رقم).

## الفهارس ليست مجانية
كل فهرس يبطئ \`INSERT\` و \`UPDATE\` و \`DELETE\` (يجب تحديثه) ويستهلك مساحة. أنشئها بناءً على **الاستعلامات الفعلية البطيئة**، لا على كل عمود.

## أشهر مشكلة أداء في التطبيقات: N+1
جلب 50 طلباً ثم استعلام منفصل لمستخدم كل طلب = 51 استعلاماً. الحل: \`JOIN\` واحد، أو جلب كل المستخدمين المطلوبين بـ \`WHERE id IN (...)\` دفعة واحدة.

## تمرين
أنشئ جدولاً بـ 100,000 صف (بـ \`WITH RECURSIVE\` لتوليد الأرقام)، وقِس زمن \`SELECT ... WHERE user_id = 777\` قبل الفهرس وبعده، واقرأ \`EXPLAIN QUERY PLAN\` في الحالتين.
`,
      codeExample: `CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- توليد 20,000 طلب تجريبي
WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 20000)
INSERT INTO orders (user_id, status, created_at)
SELECT i % 500, CASE WHEN i % 3 = 0 THEN 'paid' ELSE 'pending' END, date('2026-01-01', '+' || (i % 365) || ' days')
FROM n;

-- بلا فهرس: SCAN
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE user_id = 42;

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);

-- مع الفهرس: SEARCH ... USING INDEX
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE user_id = 42;
EXPLAIN QUERY PLAN SELECT id FROM orders WHERE status = 'paid' AND created_at >= '2026-06-01' ORDER BY created_at LIMIT 20;

SELECT COUNT(*) FROM orders WHERE user_id = 42;`,
    },
    'sql-7': {
      description: 'المعاملات وخصائص ACID: BEGIN و COMMIT و ROLLBACK، مثال تحويل الأموال، الأقفال والتزامن، ومستويات العزل باختصار',
      content: md`
# المعاملات (Transactions)

تحويل 100 دينار من سارة إلى عمر = عمليتان: خصم من سارة، وإضافة لعمر. ماذا لو انقطع الخادم بينهما؟ يضيع المال. **المعاملة** تجعل مجموعة عمليات **وحدة واحدة**: تنجح كلها أو لا يحدث منها شيء.

## الصيغة
\`\`\`sql
CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, balance REAL NOT NULL CHECK (balance >= 0));
INSERT INTO accounts VALUES (1, 'سارة', 500), (2, 'عمر', 100);

BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;        -- تثبيت كل شيء

SELECT owner, balance FROM accounts;
\`\`\`
\`ROLLBACK\` بدل \`COMMIT\` يلغي كل ما حدث منذ \`BEGIN\`.

## ACID
| الحرف | الخاصية | المعنى |
|---|---|---|
| A | Atomicity (الذرية) | كل شيء أو لا شيء |
| C | Consistency (الاتساق) | القيود محترمة دائماً (مثل \`balance >= 0\`) |
| I | Isolation (العزل) | المعاملات المتزامنة لا ترى أنصاف بعضها |
| D | Durability (الديمومة) | بعد COMMIT تبقى البيانات حتى لو انقطع التيار |

## القيود تحمي حتى داخل المعاملة
في المثال الكامل يحاول تحويل مبلغ أكبر من الرصيد: قيد \`CHECK (balance >= 0)\` يرفض التحديث، والتطبيق ينفذ \`ROLLBACK\` فلا يُضاف المال للمستلم.

## من كود التطبيق
\`\`\`javascript
// مع node-postgres (pg) — نفس الفكرة في أي مكتبة
async function transfer(pool, fromId, toId, amount) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const r = await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1", [amount, fromId]);
    if (r.rowCount === 0) throw new Error("رصيد غير كافٍ");
    await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, toId]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();          // أعد الاتصال للمجمع دائماً
  }
}
\`\`\`
لاحظ \`WHERE ... AND balance >= $1\`: الفحص والتعديل في عبارة واحدة يمنع حالة سباق بين "اقرأ الرصيد" و "اخصم".

## التزامن والأقفال
طلبان متزامنان يقرآن رصيد 500 ثم يخصم كل منهما 400 = رصيد سالب أو أموال من العدم. الحلول:
- تحديث ذري كما أعلاه (\`balance = balance - x WHERE balance >= x\`).
- \`SELECT ... FOR UPDATE\` (PostgreSQL/MySQL) يقفل الصف حتى نهاية المعاملة.
- مستويات العزل الأعلى (\`SERIALIZABLE\`) مع إعادة المحاولة عند التعارض.

## نصائح
- معاملات **قصيرة**: لا تنتظر طلب HTTP خارجياً أو إدخال مستخدم داخل معاملة مفتوحة.
- أغلب المكتبات و ORMs توفر غلافاً: \`prisma.$transaction\`، \`knex.transaction\`، \`session.withTransaction\` في MongoDB.

## تمرين
أضف إلى المثال جدول \`transfers\` يسجل كل تحويل، واجعل إدراج السجل جزءاً من نفس المعاملة. ماذا يحدث للسجل إذا فشل التحويل؟
`,
      codeExample: `CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  balance REAL NOT NULL CHECK (balance >= 0)
);
CREATE TABLE transfers (
  id INTEGER PRIMARY KEY,
  from_id INTEGER NOT NULL REFERENCES accounts(id),
  to_id INTEGER NOT NULL REFERENCES accounts(id),
  amount REAL NOT NULL CHECK (amount > 0),
  at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO accounts VALUES (1, 'سارة', 500), (2, 'عمر', 100);

-- تحويل ناجح: ثلاث عمليات كوحدة واحدة
BEGIN;
UPDATE accounts SET balance = balance - 150 WHERE id = 1;
UPDATE accounts SET balance = balance + 150 WHERE id = 2;
INSERT INTO transfers (from_id, to_id, amount) VALUES (1, 2, 150);
COMMIT;

-- تحويل يُلغى: نغيّر رأينا قبل التثبيت
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 2;
UPDATE accounts SET balance = balance + 50 WHERE id = 1;
ROLLBACK;

-- خصم ذري لا يسمح بالسالب: يعدّل 0 صفوف إن كان الرصيد غير كافٍ
UPDATE accounts SET balance = balance - 10000 WHERE id = 1 AND balance >= 10000;

SELECT owner, balance FROM accounts ORDER BY id;
SELECT COUNT(*) AS transfers_logged FROM transfers;`,
    },
  },
  newLessons: [
    {
      id: 'sql-injection',
      title: 'حقن SQL والاستعلامات المعاملية',
      description: 'لماذا لا تُبنى الاستعلامات بلصق النصوص، الاستعلامات المعاملية في Node و Python، ما لا يمكن تمريره كمعامل، وطبقات الحماية الأخرى',
      language: 'python',
      xpReward: 150,
      content: md`
# حقن SQL والاستعلامات المعاملية

أهم درس أمني لأي مطور يكتب SQL. الثغرة قديمة ومعروفة، وما زالت من أكثر الثغرات انتشاراً وأخطرها.

## المشكلة: لصق مدخلات المستخدم في نص الاستعلام
\`\`\`python
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, is_admin INTEGER);
INSERT INTO users (email, is_admin) VALUES ('sara@example.com', 0), ('admin@example.com', 1);
""")

def find_user_unsafe(email):
    query = f"SELECT id, email FROM users WHERE email = '{email}'"   # ❌ لصق مباشر
    return db.execute(query).fetchall()

print(find_user_unsafe("sara@example.com"))
print(find_user_unsafe("x' OR '1'='1"))      # يعيد كل المستخدمين!
\`\`\`
المدخل \`x' OR '1'='1\` يغلق النص ويضيف شرطاً صحيحاً دائماً، فيتغير **معنى** الاستعلام. بنفس الطريقة يمكن قراءة جداول أخرى، أو تعديل البيانات، أو تجاوز تسجيل الدخول — حسب صلاحيات حساب قاعدة البيانات.

## الحل: الاستعلامات المعاملية (Parameterized Queries)
\`\`\`python
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, is_admin INTEGER);
INSERT INTO users (email, is_admin) VALUES ('sara@example.com', 0), ('admin@example.com', 1);
""")

def find_user(email):
    return db.execute("SELECT id, email FROM users WHERE email = ?", (email,)).fetchall()   # ✅

print(find_user("sara@example.com"))
print(find_user("x' OR '1'='1"))             # [] — يُعامل كنص عادي
\`\`\`
القاعدة تستقبل **بنية الاستعلام** و**القيم** منفصلتين؛ القيمة لا يمكن أبداً أن تصبح جزءاً من أوامر SQL مهما احتوت.

## في Node.js
\`\`\`javascript
// node-postgres: $1, $2
// await pool.query("SELECT id, email FROM users WHERE email = $1", [email]);
// mysql2: ?
// await conn.execute("SELECT id, email FROM users WHERE email = ?", [email]);
const email = "x' OR '1'='1";
const params = [email];   // القيمة تُرسل منفصلة عن نص الاستعلام
console.log(params);
\`\`\`
⚠️ القوالب النصية في JavaScript ليست معاملات: كتابة \${email} داخل نص الاستعلام (بين علامتي \`) **مصابة بنفس الثغرة** — مرّر القيمة في مصفوفة المعاملات دائماً.

## ما لا يمكن تمريره كمعامل
المعاملات للـ**قيم** فقط، لا لأسماء الأعمدة والجداول أو اتجاه الترتيب. لترتيب ديناميكي استخدم **قائمة بيضاء**:
\`\`\`python
ALLOWED_SORT = {"name": "name", "newest": "created_at DESC"}

def order_clause(user_choice):
    return "ORDER BY " + ALLOWED_SORT.get(user_choice, "id")   # لا يمر نص المستخدم أبداً

print(order_clause("newest"), "|", order_clause("name; DROP TABLE users"))
\`\`\`

## ORMs و Query Builders
Prisma و Sequelize و SQLAlchemy و Knex تستخدم المعاملات تلقائياً في عملياتها العادية. الخطر يعود عند استخدام دوال **الاستعلام الخام** (\`$queryRawUnsafe\`، \`raw()\`، \`text()\` مع لصق نصوص) — استخدم نسخها الآمنة التي تقبل معاملات.

## طبقات حماية إضافية (لا تغني عن المعاملات)
| الطبقة | الفائدة |
|---|---|
| **أقل صلاحيات** لحساب قاعدة البيانات | حساب التطبيق لا يملك DROP ولا الوصول لجداول لا يحتاجها |
| التحقق من المدخلات | رفض المعرّف إن لم يكن رقماً قبل الوصول للقاعدة |
| رسائل أخطاء عامة | لا ترسل أخطاء SQL للعميل؛ تكشف بنية الجداول |
| المراقبة | سجلات تنبه على أنماط استعلامات غريبة |

## تمرين
حوّل دالة البحث في المثال الكامل التي تجمع عدة فلاتر اختيارية (الاسم، المدينة، الحد الأدنى للمبلغ) إلى نسخة معاملية تبني شروط WHERE وقائمة المعاملات معاً، وجرّب عليها المدخلات الخبيثة.
`,
      codeExample: `import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, city TEXT, spent REAL);
INSERT INTO users (name, city, spent) VALUES
  ('سارة', 'بغداد', 250), ('عمر', 'البصرة', 90), ('ليلى', 'بغداد', 40), ('زيد', 'أربيل', 600);
""")

ALLOWED_SORT = {"name": "name", "spent": "spent DESC"}


def search_users(name=None, city=None, min_spent=None, sort="name"):
    """بحث بفلاتر اختيارية: الشروط والمعاملات تُبنى معاً — لا لصق لمدخلات المستخدم"""
    conditions, params = [], []
    if name:
        conditions.append("name LIKE ?")
        params.append(f"%{name}%")          # الـ % جزء من القيمة لا من الاستعلام
    if city:
        conditions.append("city = ?")
        params.append(city)
    if min_spent is not None:
        conditions.append("spent >= ?")
        params.append(float(min_spent))

    sql = "SELECT name, city, spent FROM users"
    if conditions:
        sql += " WHERE " + " AND ".join(conditions)
    sql += " ORDER BY " + ALLOWED_SORT.get(sort, "id")   # قائمة بيضاء لما لا يُمرَّر كمعامل
    return db.execute(sql, params).fetchall()


print("بغداد:", search_users(city="بغداد"))
print("أنفق 100+ مرتباً:", search_users(min_spent=100, sort="spent"))

# مدخلات خبيثة تُعامل كنصوص عادية
print("حقن في المدينة:", search_users(city="x' OR '1'='1"))
print("حقن في الترتيب:", search_users(sort="name; DROP TABLE users"))
print("الجدول ما زال موجوداً:", db.execute("SELECT COUNT(*) FROM users").fetchone()[0], "صفوف")`,
      quiz: {
        question: 'لماذا تمنع الاستعلامات المعاملية حقن SQL؟',
        options: [
          'لأنها تحذف علامات الاقتباس من المدخلات',
          'لأن بنية الاستعلام والقيم تُرسل لقاعدة البيانات منفصلة، فلا تصبح القيمة جزءاً من أوامر SQL',
          'لأنها تشفر الاستعلام',
          'لأنها أسرع فقط',
        ],
        correctAnswer: 1,
        explanation: 'القيمة تُعامل كبيانات دائماً مهما احتوت؛ أما أسماء الأعمدة والترتيب فتحتاج قوائم بيضاء.',
      },
    },
    ...SQL_NEW_LESSONS,
  ],
};

const MONGO_SETUP = `// npm install mongoose
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/kodax_demo");
mongoose.set("sanitizeFilter", true);   // يحيّد عوامل $ القادمة من مدخلات المستخدم
`;

export const BACKEND_MONGO_PLAN: CoursePlan = {
  courseId: 'backend-mongodb',
  course: {
    description:
      'قواعد بيانات المستندات بـ MongoDB و Mongoose: المستندات والمجموعات، المخططات والتحقق، CRUD بأمان، العلاقات بالتضمين والمراجع، خطوط التجميع، الفهارس والأداء، التحقق على مستوى القاعدة والمعاملات — مع مشروع مدونة.',
  },
  sections: [
    { title: 'الأساسيات', lessons: ['mongo-1', 'mongo-2', 'mongo-3'] },
    { title: 'التصميم والتحليل', lessons: ['mongo-4', 'mongo-5'] },
    { title: 'الإنتاج', lessons: ['mongo-indexes', 'mongo-transactions'] },
    { title: 'المشروع', lessons: ['mongo-project'] },
  ],
  newLessons: MONGO_NEW_LESSONS,
  patches: {
    'mongo-1': {
      description: 'قواعد بيانات المستندات: المستند والمجموعة، BSON و ObjectId، متى تختار MongoDB ومتى SQL، وأول اتصال بالمشغّل الرسمي',
      content: MONGO_1_CONTENT,
    },
    'mongo-2': {
      description: 'Mongoose: المخطط والنموذج، الأنواع والتحقق المدمج، القيم الافتراضية، timestamps، الحقول المخفية، والوسائط (hooks)',
      content: md`
# Mongoose ODM

MongoDB نفسه لا يفرض شكلاً للمستندات: مستند فيه \`email\` وآخر فيه \`mail\` وثالث بلا بريد — كلها مقبولة. **Mongoose** يضيف مخططاً (Schema) في التطبيق: أنواع، وتحقق، وقيم افتراضية، ودوال.

## المخطط والنموذج
\`\`\`javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "الاسم مطلوب"], trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, match: /.+@.+\..+/ },
    age: { type: Number, min: 13, max: 120 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    passwordHash: { type: String, required: true, select: false },   // لا يُعاد افتراضياً
    tags: [String],
  },
  { timestamps: true }   // createdAt و updatedAt تلقائياً
);

export const User = mongoose.model("User", userSchema);   // مجموعة "users"
\`\`\`
| الخيار | الأثر |
|---|---|
| \`required\` و \`min\` و \`max\` و \`enum\` و \`match\` | تحقق قبل الحفظ |
| \`trim\` و \`lowercase\` | تنظيف تلقائي |
| \`default\` | قيمة افتراضية |
| \`select: false\` | لا يُعاد في الاستعلامات إلا بطلب صريح \`.select("+passwordHash")\` |
| \`unique: true\` | يُنشئ **فهرساً فريداً** — ليس تحققاً: الخطأ يأتي من MongoDB (الرمز 11000) |

## التحقق يعمل عند الحفظ
\`create\` و \`save\` تتحقق تلقائياً. أما \`updateOne\` و \`findByIdAndUpdate\` فلا تتحقق **إلا** مع \`{ runValidators: true }\` — مصدر شائع لبيانات فاسدة.

## الوسائط (Middleware / Hooks)
\`\`\`javascript
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({ title: String, slug: String });
postSchema.pre("save", function () {
  if (this.isModified("title")) {
    this.slug = this.title.trim().toLowerCase().replace(/\s+/g, "-");
  }
});
\`\`\`
استخدام شائع: تجزئة كلمة المرور قبل الحفظ عند تعديلها فقط (\`isModified("password")\`).

## دوال المثيل والدوال الساكنة
- \`userSchema.methods.isAdult = function () {...}\` ← \`user.isAdult()\`.
- \`userSchema.statics.findByEmail = function (email) {...}\` ← \`User.findByEmail(...)\`.

## إخفاء الحقول عند التحويل لـ JSON
\`toJSON: { transform(doc, ret) { delete ret.passwordHash; return ret; } }\` في خيارات المخطط — طبقة حماية ثانية مع \`select: false\`.

## الاتصال
\`await mongoose.connect(process.env.MONGODB_URI)\` مرة واحدة عند بدء التطبيق. خيارات مثل \`useNewUrlParser\` و \`useUnifiedTopology\` التي تراها في الشروحات القديمة **لم تعد لازمة** منذ Mongoose 6.

## تمرين
أضف إلى المثال الكامل مخطط \`Product\` بحقول: اسم (إلزامي)، سعر (≥ 0)، فئة من قائمة محددة، و \`stock\` افتراضيه 0. جرّب إنشاء منتج بسعر سالب واقرأ رسالة الخطأ.
`,
      codeExample: MONGO_SETUP + `
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "الاسم مطلوب"], trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    age: { type: Number, min: [13, "العمر الأدنى 13"], max: 120 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    passwordHash: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

userSchema.methods.isAdult = function () {
  return (this.age ?? 0) >= 18;
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: String(email).toLowerCase() });
};

const User = mongoose.models.User ?? mongoose.model("User", userSchema);

try {
  const user = await User.create({ name: "  سارة ", email: "Sara@Example.com", age: 21, passwordHash: "hash-from-bcrypt" });
  console.log("أُنشئ:", user.name, user.email, "بالغ؟", user.isAdult());

  const found = await User.findByEmail("SARA@example.com");
  console.log("passwordHash مُعاد؟", found.passwordHash !== undefined);   // false بسبب select: false

  await User.create({ name: "ع", email: "kid@example.com", age: 9, passwordHash: "x" });
} catch (err) {
  if (err.name === "ValidationError") {
    console.log("فشل التحقق:", Object.values(err.errors).map((e) => e.message));
  } else if (err.code === 11000) {
    console.log("البريد مستخدم مسبقاً");
  } else {
    throw err;
  }
} finally {
  await mongoose.disconnect();
}`,
    },
    'mongo-3': {
      description: 'CRUD مع Mongoose: الإنشاء، الاستعلام بالعوامل والإسقاط والترتيب، التحديث الذري ($set و $inc و $push)، الحذف، و lean',
      content: md`
# CRUD مع Mongoose

## الإنشاء
\`User.create({...})\` (يتحقق ويحفظ) أو \`new User({...}).save()\`، و \`insertMany([...])\` للدفعات.

## القراءة
\`\`\`javascript
// const users = await User.find({ age: { $gte: 18 }, role: "user" })
//   .select("name email")          // الإسقاط: الحقول المطلوبة فقط
//   .sort({ createdAt: -1 })       // تنازلي
//   .limit(20)
//   .lean();                       // كائنات JS عادية — أسرع للقراءة فقط
const filterExample = { age: { $gte: 18 }, role: { $in: ["user", "editor"] }, tags: "مبتدئ" };
console.log(JSON.stringify(filterExample));
\`\`\`
| العامل | المعنى |
|---|---|
| \`$eq\` \`$ne\` | يساوي / لا يساوي |
| \`$gt\` \`$gte\` \`$lt\` \`$lte\` | مقارنات |
| \`$in\` \`$nin\` | ضمن قائمة |
| \`$exists\` | الحقل موجود |
| \`$regex\` | نمط (احذر من مدخلات المستخدم: أنماط مكلفة) |
| \`$or\` \`$and\` | منطق |

- \`findById(id)\` و \`findOne(filter)\` يعيدان مستنداً أو **null** — افحص دائماً.
- \`countDocuments(filter)\` للعد.

## التحديث الذري
\`\`\`javascript
// await Product.updateOne({ _id: id, stock: { $gte: 1 } }, { $inc: { stock: -1 } });
// await User.findByIdAndUpdate(id, { $set: { name } }, { new: true, runValidators: true });
// await Post.updateOne({ _id: postId }, { $push: { comments: { text, author: userId } } });
const update = { $inc: { stock: -1 }, $set: { updatedBy: "u1" } };
console.log(Object.keys(update));
\`\`\`
| العامل | الأثر |
|---|---|
| \`$set\` / \`$unset\` | تعيين / حذف حقل |
| \`$inc\` | زيادة/إنقاص ذري |
| \`$push\` / \`$pull\` / \`$addToSet\` | مصفوفات |
- \`{ new: true }\`: أعد المستند **بعد** التعديل (الافتراضي قبله).
- \`{ runValidators: true }\`: طبّق تحقق المخطط على التحديث.
- **لا تقرأ ثم تعدّل ثم تحفظ** لعدادات المخزون أو الإعجابات: طلبان متزامنان يضيعان تحديثاً. استخدم \`$inc\` مع شرط في الفلتر (\`stock: { $gte: 1 }\`) — عملية واحدة ذرية.

## الحذف
\`deleteOne(filter)\`، \`deleteMany(filter)\`، \`findByIdAndDelete(id)\`. ⚠️ \`deleteMany({})\` يحذف المجموعة كلها. (الدالة القديمة \`remove()\` حُذفت من Mongoose.)

## الأمان: المدخلات كعوامل
إذا مررت \`req.body.email\` مباشرة وكان كائناً \`{ "$ne": null }\` فقد طابقت أول مستخدم! الحماية:
- \`mongoose.set("sanitizeFilter", true)\` يحيّد العوامل في الفلاتر.
- حوّل المدخلات لأنواعها: \`String(req.body.email)\`.
- لا تمرر \`req.body\` كاملاً إلى \`create\` أو \`$set\`؛ اختر الحقول المسموحة.

## تمرين
اكتب دالة \`purchase(productId, qty)\` تنقص المخزون ذرياً فقط إذا كان كافياً، وتعيد خطأ "نفد المخزون" إن لم يُعدَّل أي مستند (\`modifiedCount === 0\`).
`,
      codeExample: MONGO_SETUP + `
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ["كتب", "إلكترونيات", "قرطاسية"], required: true },
    stock: { type: Number, default: 0, min: 0 },
    tags: [String],
  },
  { timestamps: true }
);
const Product = mongoose.models.Product ?? mongoose.model("Product", productSchema);

async function seed() {
  await Product.deleteMany({ name: /^تجربة/ });   // تنظيف بيانات التجربة فقط
  return Product.insertMany([
    { name: "تجربة: قلم", price: 1.5, category: "قرطاسية", stock: 100, tags: ["مدرسة"] },
    { name: "تجربة: سماعة", price: 25, category: "إلكترونيات", stock: 3 },
    { name: "تجربة: رواية", price: 9, category: "كتب", stock: 0 },
  ]);
}

async function listAvailable(maxPrice) {
  return Product.find({ stock: { $gt: 0 }, price: { $lte: Number(maxPrice) } })
    .select("name price stock")
    .sort({ price: 1 })
    .lean();
}

async function purchase(productId, qty) {
  const n = Number(qty);
  if (!Number.isInteger(n) || n < 1) throw new Error("كمية غير صالحة");
  // ذري: الشرط والتعديل في عملية واحدة
  const result = await Product.updateOne({ _id: productId, stock: { $gte: n } }, { $inc: { stock: -n } });
  if (result.modifiedCount === 0) throw new Error("نفد المخزون");
}

try {
  const [pen, headset] = await seed();
  console.log("المتاح بأقل من 30:", await listAvailable(30));

  await purchase(headset._id, 2);
  await purchase(headset._id, 2).catch((e) => console.log("الشراء الثاني:", e.message));

  const updated = await Product.findByIdAndUpdate(pen._id, { $set: { price: 2 }, $addToSet: { tags: "عرض" } }, { new: true, runValidators: true });
  console.log("بعد التحديث:", updated.price, updated.tags);
} finally {
  await mongoose.disconnect();
}`,
    },
    'mongo-4': {
      description: 'العلاقات في MongoDB: التضمين مقابل المراجع، متى تختار كلاً منهما، populate وتكلفته، العلاقات متعدد لمتعدد، وحد 16MB',
      content: md`
# العلاقات: التضمين والمراجع

في SQL القرار واضح: جداول منفصلة ومفاتيح أجنبية. في MongoDB تختار بين **تضمين** البيانات داخل المستند أو **الإشارة** إليها في مجموعة أخرى — والقرار يعتمد على **كيف تقرأ البيانات**.

## التضمين (Embedding)
\`\`\`javascript
const orderDoc = {
  _id: "o1",
  customer: "u1",
  items: [                                        // مضمنة: تُقرأ دائماً مع الطلب
    { productId: "p1", name: "قلم", price: 1.5, qty: 3 },
    { productId: "p2", name: "دفتر", price: 3.0, qty: 1 },
  ],
  shippingAddress: { city: "بغداد", street: "شارع فلسطين" },
};
console.log(orderDoc.items.length, "عناصر في قراءة واحدة");
\`\`\`
✅ قراءة واحدة، وتحديث ذري للمستند كله.
❌ حد المستند **16MB**، والتكرار (اسم المنتج منسوخ في كل طلب).

لاحظ: نسخ اسم المنتج وسعره داخل الطلب **صحيح هنا** — الطلب يجب أن يحفظ السعر وقت الشراء حتى لو تغيّر لاحقاً.

## المراجع (References)
\`\`\`javascript
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
});
// const posts = await Post.find().populate("author", "name");   // يجلب المؤلف من مجموعة users
\`\`\`
✅ لا تكرار، والعلاقات الكبيرة أو غير المحدودة ممكنة.
❌ قراءات إضافية؛ و \`populate\` ليس JOIN: إنه **استعلام ثانٍ** من التطبيق.

## كيف تقرر؟
| السؤال | تضمين | مرجع |
|---|---|---|
| هل تُقرأ البيانات دائماً معاً؟ | ✅ | |
| هل لها معنى مستقل وتُقرأ وحدها؟ | | ✅ |
| كم عدد العناصر؟ | قليلة ومحدودة (عناوين المستخدم) | كثيرة أو غير محدودة (تعليقات منشور مشهور، طلبات عميل) |
| هل تتغير كثيراً وتُشارك بين مستندات؟ | | ✅ |

قاعدة شائعة: "واحد لقليل" ← تضمين، "واحد لكثير جداً" ← مرجع في جهة الكثير (\`comment.post\`)، لا مصفوفة متضخمة في المنشور.

## متعدد لمتعدد
طلاب ↔ دورات: مصفوفة معرّفات في جهة واحدة إن كانت صغيرة (\`student.courses\`)، أو مجموعة وسيطة \`enrollments\` (كالجدول الوسيط في SQL) إن احتاجت بيانات إضافية (تاريخ التسجيل، الدرجة).

## populate بحكمة
- حدد الحقول: \`.populate("author", "name avatar")\` — لا تجلب passwordHash بالخطأ.
- populate داخل حلقة = مشكلة N+1؛ populate لقائمة واحدة يجمع المعرّفات في استعلام واحد بـ \`$in\`.
- للتقارير المعقدة: \`$lookup\` في Aggregation (الدرس التالي).

## فهرس على حقول المراجع
\`author: { ..., index: true }\` — بدونه \`Post.find({ author: id })\` يمسح المجموعة كلها.

## تمرين
صمم مخططات لمتجر: منتجات، عملاء، طلبات (بعناصر)، ومراجعات المنتجات. لكل علاقة قرر تضميناً أم مرجعاً وبرّر قرارك بطريقة القراءة المتوقعة.
`,
      codeExample: MONGO_SETUP + `
const { Schema } = mongoose;

const User = mongoose.models.User4 ?? mongoose.model("User4", new Schema({ name: String, email: String }));

// مرجع: المنشورات كثيرة وتُقرأ وحدها — كل منشور يشير لمؤلفه
const Post = mongoose.models.Post4 ?? mongoose.model("Post4", new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User4", required: true, index: true },
}));

// تضمين: عناصر الطلب وعنوانه تُقرأ دائماً معه، والسعر يُحفظ وقت الشراء
const Order = mongoose.models.Order4 ?? mongoose.model("Order4", new Schema({
  customer: { type: Schema.Types.ObjectId, ref: "User4", required: true, index: true },
  items: [{ name: String, price: Number, qty: { type: Number, min: 1 } }],
  shippingAddress: { city: String, street: String },
}));

try {
  const sara = await User.create({ name: "سارة", email: "sara@example.com" });

  await Post.create([{ title: "أول منشور", author: sara._id }, { title: "عن MongoDB", author: sara._id }]);
  const posts = await Post.find({ author: sara._id }).populate("author", "name").lean();
  console.log(posts.map((p) => \`\${p.title} — \${p.author.name}\`));

  const order = await Order.create({
    customer: sara._id,
    items: [{ name: "قلم", price: 1.5, qty: 3 }, { name: "دفتر", price: 3, qty: 1 }],
    shippingAddress: { city: "بغداد", street: "شارع فلسطين" },
  });
  const total = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  console.log("مجموع الطلب:", total);
} finally {
  await mongoose.disconnect();
}`,
    },
    'mongo-5': {
      description: 'خطوط التجميع: $match و $group و $project و $sort و $lookup و $unwind، ترتيب المراحل للأداء، وأمثلة تقارير حقيقية',
      content: md`
# خط التجميع (Aggregation Pipeline)

\`find\` يجلب المستندات. **Aggregation** يحوّلها: يفلتر، ويجمّع، ويحسب، ويربط مجموعات — مثل GROUP BY و JOIN في SQL. البيانات تمر عبر **مراحل** بالترتيب، وكل مرحلة تستقبل ناتج التي قبلها.

\`\`\`text
orders ← $match (المدفوعة) ← $group (لكل عميل) ← $sort (الأكثر إنفاقاً) ← $limit 5
\`\`\`

## أهم المراحل
| المرحلة | ما يعادلها في SQL | الوظيفة |
|---|---|---|
| \`$match\` | WHERE | فلترة |
| \`$group\` | GROUP BY | تجميع مع \`$sum\` و \`$avg\` و \`$min\` و \`$max\` و \`$push\` |
| \`$project\` / \`$addFields\` | SELECT | اختيار حقول وحسابها |
| \`$sort\` / \`$limit\` / \`$skip\` | ORDER BY / LIMIT | |
| \`$lookup\` | LEFT JOIN | جلب مستندات من مجموعة أخرى |
| \`$unwind\` | — | تفكيك مصفوفة: مستند لكل عنصر |
| \`$count\` / \`$facet\` | — | عد / عدة تقارير في استعلام واحد |

## مثال: أفضل العملاء
\`\`\`javascript
const pipeline = [
  { $match: { status: "paid" } },
  { $group: { _id: "$customer", spent: { $sum: "$total" }, orders: { $sum: 1 } } },
  { $sort: { spent: -1 } },
  { $limit: 5 },
  { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "customer" } },
  { $unwind: "$customer" },
  { $project: { _id: 0, name: "$customer.name", spent: 1, orders: 1 } },
];
console.log(pipeline.map((stage) => Object.keys(stage)[0]).join(" ← "));
// const top = await Order.aggregate(pipeline);
\`\`\`
- \`"$total"\` بعلامة $ تعني "قيمة الحقل total".
- \`_id\` في \`$group\` هو مفتاح التجميع (\`null\` = مجموعة واحدة للكل).

## ترتيب المراحل = الأداء
- ضع \`$match\` **أولاً**: يستفيد من الفهارس ويقلل المستندات لكل ما بعده.
- \`$limit\` قبل \`$lookup\` عندما يمكن: ربط 5 مستندات أرخص من ربط 50,000.
- \`$project\` مبكراً لإسقاط الحقول الكبيرة غير المحتاجة.

## تفكيك المصفوفات
عدد مرات بيع كل منتج من طلبات فيها مصفوفة items:
\`\`\`javascript
const salesPerProduct = [
  { $unwind: "$items" },
  { $group: { _id: "$items.name", qty: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
  { $sort: { revenue: -1 } },
];
console.log(JSON.stringify(salesPerProduct[1].$group.revenue));
\`\`\`

## ملاحظات Mongoose
- \`Model.aggregate()\` **لا يحوّل الأنواع** تلقائياً كما يفعل \`find\`: معرّف نصي من الطلب يجب تحويله: \`new mongoose.Types.ObjectId(id)\`.
- لا يطبق \`select: false\` ولا وسائط المخطط؛ حدد الحقول بنفسك في \`$project\` حتى لا تكشف حقولاً حساسة بعد \`$lookup\`.
- حد الذاكرة لكل مرحلة 100MB؛ للعمليات الكبيرة \`{ allowDiskUse: true }\`.

## تمرين
اكتب خطاً يعيد لكل شهر في 2026: عدد الطلبات المدفوعة ومجموعها ومتوسطها (استخدم \`$month\` في \`$group\`)، مرتبة زمنياً.
`,
      codeExample: MONGO_SETUP + `
const { Schema } = mongoose;
const Customer = mongoose.models.Customer5 ?? mongoose.model("Customer5", new Schema({ name: String, city: String }));
const Order = mongoose.models.Order5 ?? mongoose.model("Order5", new Schema({
  customer: { type: Schema.Types.ObjectId, ref: "Customer5", index: true },
  status: { type: String, enum: ["paid", "pending"], index: true },
  total: Number,
  items: [{ name: String, price: Number, qty: Number }],
  createdAt: { type: Date, default: Date.now },
}));

try {
  await Promise.all([Customer.deleteMany({}), Order.deleteMany({})]);
  const [sara, omar] = await Customer.create([{ name: "سارة", city: "بغداد" }, { name: "عمر", city: "البصرة" }]);
  await Order.create([
    { customer: sara._id, status: "paid", total: 120, items: [{ name: "قلم", price: 1.5, qty: 10 }, { name: "حقيبة", price: 105, qty: 1 }] },
    { customer: sara._id, status: "paid", total: 45, items: [{ name: "دفتر", price: 3, qty: 15 }] },
    { customer: omar._id, status: "pending", total: 300, items: [{ name: "سماعة", price: 300, qty: 1 }] },
  ]);

  // أفضل العملاء: $match أولاً (يستخدم الفهرس)، و $limit قبل $lookup
  const topCustomers = await Order.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: "$customer", spent: { $sum: "$total" }, orders: { $sum: 1 } } },
    { $sort: { spent: -1 } },
    { $limit: 5 },
    { $lookup: { from: Customer.collection.name, localField: "_id", foreignField: "_id", as: "customer" } },
    { $unwind: "$customer" },
    { $project: { _id: 0, name: "$customer.name", city: "$customer.city", spent: 1, orders: 1 } },
  ]);
  console.log("أفضل العملاء:", topCustomers);

  // المبيعات لكل منتج: تفكيك مصفوفة العناصر
  const perProduct = await Order.aggregate([
    { $match: { status: "paid" } },
    { $unwind: "$items" },
    { $group: { _id: "$items.name", qty: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
    { $sort: { revenue: -1 } },
  ]);
  console.log("لكل منتج:", perProduct);

  // aggregate لا يحوّل الأنواع: المعرّف النصي يجب تحويله
  const idFromRequest = String(sara._id);
  const saraTotal = await Order.aggregate([
    { $match: { customer: new mongoose.Types.ObjectId(idFromRequest) } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  console.log("مجموع سارة:", saraTotal[0]?.total);
} finally {
  await mongoose.disconnect();
}`,
    },
  },
};

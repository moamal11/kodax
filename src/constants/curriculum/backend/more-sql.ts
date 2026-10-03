/**
 * توسيع backend-sql: من "كتابة الاستعلامات" إلى "بناء قاعدة بيانات لتطبيق حقيقي".
 * الفجوة: لا تصميم مخطط ولا تطبيع، ولا PostgreSQL فعلي من الكود، ولا ترحيلات، ولا مشروع.
 * أمثلة PostgreSQL تُشغَّل فعلياً على PGlite، وأمثلة SQLite على SQLite.
 */
import type { NewLesson } from '../types';
import { md } from '../md';

const STORE_SCHEMA_PG = `CREATE TABLE customers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
);

CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- سعر الوحدة يُحفظ وقت الشراء: تغيّر سعر المنتج لاحقاً لا يغيّر فواتير الماضي
CREATE TABLE order_items (
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  PRIMARY KEY (order_id, product_id)
);

CREATE INDEX orders_customer_idx ON orders(customer_id);
CREATE INDEX order_items_product_idx ON order_items(product_id);
`;

export const SQL_NEW_LESSONS: NewLesson[] = [
  {
    id: 'sql-schema-design',
    title: 'تصميم المخطط والتطبيع',
    description: 'من متطلبات التطبيق إلى جداول سليمة: الكيانات والعلاقات، مشاكل الجدول الواحد، الصيغ الطبيعية الثلاث، اختيار المفاتيح والأنواع، ومتى نكسر القاعدة',
    language: 'sql',
    xpReward: 150,
    content: md`
# تصميم المخطط والتطبيع

الاستعلامات الجيدة لا تنقذ مخططاً سيئاً. أغلب مشاكل التطبيقات مع البيانات (تكرار، تناقض، تقارير خاطئة) سببها **تصميم الجداول** لا SQL. هذا الدرس منهجية تتبعها قبل كتابة أي \`CREATE TABLE\`.

## الخطوة 1: من المتطلبات إلى الكيانات
اكتب جملاً عن التطبيق، ثم استخرج **الأسماء** (كيانات ← جداول) و**العلاقات** بينها:
> "العميل يضع طلبات. كل طلب يحتوي عدة منتجات بكميات. المنتج له سعر ومخزون."

\`\`\`text
العميل ──< الطلب ──< عنصر الطلب >── المنتج
(واحد لمتعدد)   (واحد لمتعدد)   (متعدد لواحد)
الطلب ↔ المنتج علاقة متعدد لمتعدد ← جدول وسيط order_items يحمل الكمية والسعر
\`\`\`

## الخطوة 2: لماذا لا نضع كل شيء في جدول واحد؟
\`\`\`sql
CREATE TABLE orders_flat (
  order_id INTEGER, customer_name TEXT, customer_email TEXT, customer_city TEXT,
  product_name TEXT, product_price REAL, quantity INTEGER
);
INSERT INTO orders_flat VALUES
  (1, 'سارة', 'sara@example.com', 'بغداد', 'قلم', 1.5, 3),
  (1, 'سارة', 'sara@example.com', 'بغداد', 'دفتر', 3.0, 1),
  (2, 'سارة', 'sara@exmaple.com', 'البصرة', 'قلم', 1.5, 10);   -- خطأ إملائي ومدينة مختلفة!
SELECT DISTINCT customer_email, customer_city FROM orders_flat WHERE customer_name = 'سارة';
\`\`\`
ثلاث مشاكل كلاسيكية (تسمى **شذوذات**):
| الشذوذ | المثال |
|---|---|
| **التحديث** | سارة غيّرت مدينتها: يجب تعديل كل صفوفها؛ نسيان صف = بيانات متناقضة |
| **الإدراج** | لا يمكن إضافة منتج جديد قبل أن يطلبه أحد |
| **الحذف** | حذف آخر طلب لمنتج يحذف معلومة سعره نهائياً |

## الخطوة 3: الصيغ الطبيعية (عملياً)
| الصيغة | القاعدة | السؤال الذي تطرحه |
|---|---|---|
| **1NF** | كل خلية قيمة واحدة؛ لا قوائم داخل عمود | هل يوجد عمود "products" فيه "قلم، دفتر"؟ |
| **2NF** | كل عمود يعتمد على **المفتاح كله** (مهم مع المفاتيح المركبة) | في (order_id, product_id): هل اسم المنتج يعتمد على product_id وحده؟ ← انقله لجدول المنتجات |
| **3NF** | لا عمود يعتمد على عمود آخر غير المفتاح | هل المدينة تعتمد على العميل لا على الطلب؟ ← انقلها لجدول العملاء |
الخلاصة العملية: **كل معلومة تُخزَّن في مكان واحد**، وتُربط بالمعرّفات.

## الخطوة 4: المفاتيح والأنواع
- **مفتاح بديل** (\`id\` رقمي أو UUID) للجداول الرئيسية: لا يتغير أبداً. البريد أو رقم الهاتف يتغيران — اجعلهما \`UNIQUE\` لا مفتاحاً أساسياً.
- **مفتاح مركب** طبيعي للجداول الوسيطة: \`PRIMARY KEY (order_id, product_id)\` يمنع تكرار المنتج في نفس الطلب.
- **المال**: \`NUMERIC(12,2)\` (أو أعداد صحيحة بالفلس/السنت) — لا \`REAL\`/\`FLOAT\`: \`0.1 + 0.2\` لا يساوي \`0.3\` في الأعداد العشرية الثنائية.
- **التواريخ**: \`TIMESTAMPTZ\` في PostgreSQL (بالمنطقة الزمنية)، و UTC دائماً في التخزين.
- **حالات محدودة**: \`CHECK (status IN (...))\` أو نوع enum.
- **التسمية**: أسماء جمع بأحرف صغيرة و \`snake_case\` (\`order_items\`، \`created_at\`)، و \`<الجدول المفرد>_id\` للمفاتيح الأجنبية.

## الخطوة 5: متى نكسر التطبيع؟
التطبيع للكتابة الصحيحة؛ أحياناً نكرر بيانات **عمداً** لسبب واضح:
- **لقطة تاريخية**: \`order_items.unit_price\` يحفظ السعر وقت الشراء — ليس تكراراً بل حقيقة مختلفة عن السعر الحالي.
- **الأداء**: عمود محسوب مسبقاً (عدد التعليقات) لصفحة تُقرأ ملايين المرات — مع آلية تضمن تحديثه (trigger أو معاملة).
اكسر القاعدة بقرار موثّق، لا بالصدفة.

## قائمة مراجعة لأي مخطط
- [ ] كل جدول يمثل شيئاً واحداً، ولكل صف مفتاح أساسي.
- [ ] لا قوائم داخل أعمدة، ولا معلومة مكررة في جدولين (إلا لقطات مقصودة).
- [ ] كل علاقة لها مفتاح أجنبي بسلوك \`ON DELETE\` مقصود.
- [ ] القيود (\`NOT NULL\`، \`UNIQUE\`، \`CHECK\`) تعبّر عن قواعد العمل.
- [ ] فهارس على المفاتيح الأجنبية والأعمدة المستخدمة في البحث.

## تمرين
صمم مخطط "منصة دورات": مستخدمون، دورات، دروس (لكل دورة)، تسجيل المستخدم في الدورة (بتاريخ)، وإكمال الدروس. حدد المفاتيح والقيود وسلوك الحذف، وبرّر كل قرار بإحدى الصيغ الطبيعية.
`,
    codeExample: `-- المخطط بعد التطبيع: كل معلومة في مكان واحد
PRAGMA foreign_keys = ON;

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  city TEXT
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price_fils INTEGER NOT NULL CHECK (price_fils >= 0)   -- المال كعدد صحيح بأصغر وحدة
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE order_items (
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_fils INTEGER NOT NULL,                     -- لقطة السعر وقت الشراء (تكرار مقصود)
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO customers (id, name, email, city) VALUES (1, 'سارة', 'sara@example.com', 'بغداد');
INSERT INTO products (id, name, price_fils) VALUES (1, 'قلم', 1500), (2, 'دفتر', 3000);
INSERT INTO orders (id, customer_id) VALUES (1, 1), (2, 1);
INSERT INTO order_items VALUES (1, 1, 3, 1500), (1, 2, 1, 3000), (2, 1, 10, 1500);

-- تغيير المدينة: صف واحد فقط
UPDATE customers SET city = 'البصرة' WHERE id = 1;

-- تغيير سعر القلم لا يغيّر فواتير الماضي
UPDATE products SET price_fils = 2000 WHERE id = 1;

SELECT o.id AS order_id, c.name, c.city, SUM(oi.quantity * oi.unit_price_fils) / 1000.0 AS total_dinar
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, c.name, c.city;`,
    quiz: {
      question: 'جدول order_items يحتوي unit_price رغم وجود السعر في جدول products. هل هذا خطأ تطبيع؟',
      options: [
        'نعم، يجب حذفه دائماً',
        'لا، هو لقطة للسعر وقت الشراء — معلومة مختلفة عن السعر الحالي',
        'نعم، لأنه يخالف 1NF',
        'لا يهم، الأداء فقط هو المعيار',
      ],
      correctAnswer: 1,
      explanation: 'السعر الحالي قد يتغير، أما الفاتورة فيجب أن تحفظ ما دفعه العميل فعلاً.',
    },
  },
  {
    id: 'sql-postgres-node',
    title: 'PostgreSQL من Node.js',
    description: 'ميزات PostgreSQL التي ستستخدمها يومياً (IDENTITY و TIMESTAMPTZ و RETURNING و ON CONFLICT و JSONB)، ثم الاتصال من Node بمجمّع اتصالات واستعلامات معاملية ومعاملات ورموز الأخطاء',
    language: 'javascript',
    xpReward: 180,
    content: md`
# PostgreSQL من Node.js

درست SQL على SQLite. التطبيقات الحقيقية تستخدم غالباً **PostgreSQL**: قاعدة خادم تتحمل آلاف الاتصالات المتزامنة، بأنواع وميزات أغنى (وهي ما يقوم عليه Supabase). هذا الدرس يجمع الطرفين: ما يختلف في PostgreSQL، وكيف يتحدث معه كود Node بشكل صحيح.

## ميزات PostgreSQL اليومية
\`\`\`sql
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- الترقيم التلقائي الحديث
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',                 -- بيانات مرنة قابلة للفهرسة
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()         -- وقت بالمنطقة الزمنية
);

-- RETURNING: أعد الصف المُدرج (والمعرّف الجديد) في نفس العبارة
INSERT INTO users (email, name) VALUES ('sara@example.com', 'سارة') RETURNING id, created_at;

-- ON CONFLICT: إدراج أو تحديث (upsert) دون سباق بين "هل يوجد؟" و "أدرج"
INSERT INTO users (email, name) VALUES ('sara@example.com', 'سارة أحمد')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
RETURNING id, name;

-- ILIKE: بحث غير حساس لحالة الأحرف، و JSONB
UPDATE users SET settings = settings || '{"theme": "dark"}' WHERE email ILIKE 'SARA@%';
SELECT name, settings->>'theme' AS theme FROM users;
\`\`\`
| الميزة | لماذا تهمك |
|---|---|
| \`GENERATED ALWAYS AS IDENTITY\` | بديل \`SERIAL\` القديم، أوضح وأأمن |
| \`TIMESTAMPTZ\` | يخزن لحظة زمنية حقيقية؛ \`TIMESTAMP\` بدونها مصدر أخطاء مناطق زمنية |
| \`RETURNING\` | لا حاجة لاستعلام ثانٍ لمعرفة المعرّف الجديد |
| \`ON CONFLICT\` | upsert ذري |
| \`JSONB\` | حقول مرنة مع فهارس GIN — لا تجعلها بديلاً عن الأعمدة العادية للبيانات المنظمة |

## الاتصال من Node: حزمة pg
\`\`\`javascript
// npm install pg
import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,   // postgres://user:pass@host:5432/db — من متغيرات البيئة
  max: 10,                                       // أقصى عدد اتصالات مفتوحة
  idleTimeoutMillis: 30_000,
});
\`\`\`
### لماذا مجمّع (Pool)؟
فتح اتصال بقاعدة البيانات مكلف (مصافحة شبكة ومصادقة). المجمّع يحتفظ باتصالات جاهزة ويعيرها للطلبات. أنشئ **مجمّعاً واحداً** للتطبيق كله، لا اتصالاً لكل طلب. و PostgreSQL له حد أقصى للاتصالات (100 افتراضياً) — عشر نسخ من تطبيقك بمجمّع 20 لكل منها تتجاوزه. في البيئات بلا خوادم (Serverless) استخدم مُجمِّعاً خارجياً (PgBouncer أو Supavisor في Supabase).

## الاستعلامات: معاملات دائماً
\`\`\`javascript
// const { rows } = await pool.query("SELECT id, name FROM users WHERE email = $1", [email]);
// const { rows: [user] } = await pool.query(
//   "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id, name, created_at", [email, name]);
const placeholders = ["$1", "$2"];   // PostgreSQL يستخدم $1 و $2 (لا ? كما في SQLite و MySQL)
console.log(placeholders);
\`\`\`
- \`rows\` مصفوفة كائنات بأسماء الأعمدة.
- \`BIGINT\` و \`NUMERIC\` تصل **نصوصاً** افتراضياً (لتجنب فقدان الدقة في أرقام JavaScript). حوّلها بوعي، أو اضبط محلل الأنواع.

## المعاملات: اتصال واحد لكل المعاملة
\`pool.query\` قد يستخدم اتصالاً مختلفاً لكل استدعاء — و \`BEGIN\` على اتصال ثم \`COMMIT\` على آخر لا معنى له. للمعاملة احجز اتصالاً واحداً (\`pool.connect()\`) وحرره في \`finally\` دائماً — المثال الكامل يغلّف ذلك في دالة \`withTransaction\`.

## رموز الأخطاء
أخطاء PostgreSQL تحمل \`code\` قياسياً — حوّلها لاستجابات مفهومة بدل 500:
| الرمز | المعنى | الاستجابة المناسبة |
|---|---|---|
| \`23505\` | unique_violation (بريد مكرر) | 409 Conflict |
| \`23503\` | foreign_key_violation | 400 أو 409 |
| \`23514\` | check_violation | 400 |
| \`40001\` | serialization_failure | أعد المعاملة |

## ORMs و Query Builders
Prisma و Drizzle و Knex و Kysely تولّد SQL وتعطيك أنواع TypeScript. مفيدة جداً — لكن افهم SQL الذي تولّده، وراقب مشكلة N+1، واستخدم نسخها المعاملية لأي SQL خام.

## تمرين
اكتب مستودع \`products\` في Node: \`create\` (يعيد الصف بـ RETURNING)، \`upsertBySku\` (ON CONFLICT)، و \`decreaseStock(id, qty)\` ذري يرمي "نفد المخزون" إن لم يُعدَّل صف. حوّل خطأ 23505 إلى رسالة "SKU مستخدم".
`,
    codeExample: `// db.js — طبقة الوصول لـ PostgreSQL (npm install pg)
import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

// معاملة على اتصال واحد، مع تحرير الاتصال دائماً
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.status = 409;
  }
}

// usersRepository.js
export async function createUser({ email, name }) {
  try {
    const { rows } = await pool.query(
      "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id, email, name, created_at",
      [email.toLowerCase(), name]
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") throw new ConflictError("البريد مستخدم مسبقاً");
    throw err;
  }
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query("SELECT id, email, name FROM users WHERE email = $1", [email.toLowerCase()]);
  return rows[0] ?? null;
}

// تحويل رصيد بين محفظتين: كل شيء أو لا شيء
export async function transferCredits(fromId, toId, amount) {
  return withTransaction(async (client) => {
    const debit = await client.query(
      "UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND balance >= $1 RETURNING balance",
      [amount, fromId]
    );
    if (debit.rowCount === 0) throw new Error("رصيد غير كافٍ");
    await client.query("UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [amount, toId]);
    await client.query("INSERT INTO transfers (from_user, to_user, amount) VALUES ($1, $2, $3)", [fromId, toId, amount]);
    return { remaining: Number(debit.rows[0].balance) };   // NUMERIC يصل نصاً
  });
}

// عند إيقاف الخادم: أغلق المجمّع
process.on("SIGTERM", () => pool.end());`,
    quiz: {
      question: 'لماذا لا تصلح pool.query() لتنفيذ BEGIN ثم UPDATE ثم COMMIT كمعاملة؟',
      options: [
        'لأن pool.query لا يدعم UPDATE',
        'لأن كل استدعاء قد يأخذ اتصالاً مختلفاً من المجمّع، والمعاملة يجب أن تكون على اتصال واحد',
        'لأن PostgreSQL لا يدعم المعاملات',
        'لأن BEGIN يجب أن يُكتب بأحرف صغيرة',
      ],
      correctAnswer: 1,
      explanation: 'احجز اتصالاً بـ pool.connect() ونفّذ المعاملة كلها عليه ثم حرره في finally.',
    },
  },
  {
    id: 'sql-migrations',
    title: 'الترحيلات (Migrations) وتطوّر المخطط',
    description: 'تغيير مخطط قاعدة بيانات فيها بيانات حقيقية بأمان: ملفات ترحيل مرقّمة ومتتابعة، جدول تتبع، التغييرات الآمنة وغير الآمنة، نمط التوسيع ثم التقليص، وبيانات البذر',
    language: 'python',
    xpReward: 160,
    content: md`
# الترحيلات (Migrations) وتطوّر المخطط

المخطط يتغير مع كل ميزة: عمود جديد، جدول جديد، فهرس. على جهازك يمكنك حذف القاعدة وإعادة إنشائها، لكن في الإنتاج هناك **بيانات مستخدمين حقيقية**. الترحيلات هي الطريقة المنضبطة لتطوير المخطط.

## الفكرة
- كل تغيير في ملف SQL مستقل **مرقّم زمنياً**: \`20261001090000_add_phone_to_users.sql\`.
- الملفات تُطبَّق **بالترتيب**، وكل ملف **مرة واحدة**.
- جدول في قاعدة البيانات نفسها يسجّل ما طُبِّق (\`schema_migrations\`).
- الملفات تُرفع إلى Git مع الكود، فيكون المخطط قابلاً للمراجعة والتكرار على أي جهاز وبيئة.

\`\`\`text
migrations/
├── 20260901000000_create_users.sql
├── 20260915000000_create_orders.sql
└── 20261001090000_add_phone_to_users.sql
\`\`\`
المثال الكامل ينفّذ مشغّل ترحيلات صغيراً كاملاً بـ Python و SQLite لتفهم ما تفعله الأدوات.

## القاعدة الذهبية
**لا تعدّل ملف ترحيل طُبِّق في أي بيئة مشتركة.** الملف القديم سجلّ تاريخي؛ إن أخطأت، اكتب ترحيلاً **جديداً** يصحح. تعديل القديم يجعل الإنتاج والتطوير مختلفين بصمت.

## تغييرات آمنة وغير آمنة
| التغيير | الخطر | الطريقة الآمنة |
|---|---|---|
| إضافة جدول | آمن | — |
| إضافة عمود يقبل NULL | آمن | — |
| إضافة عمود \`NOT NULL\` بلا افتراضي | يفشل إن وُجدت صفوف | أضفه nullable ← املأ القيم ← ثم \`SET NOT NULL\` |
| إضافة فهرس على جدول كبير | يقفل الكتابة أثناء البناء (PostgreSQL) | \`CREATE INDEX CONCURRENTLY\` (خارج معاملة) |
| حذف عمود/جدول | **فقدان بيانات** + الكود القديم ينكسر | انتظر حتى لا يستخدمه أي كود، خذ نسخة احتياطية، ثم احذف |
| إعادة تسمية عمود | الكود القديم ينكسر فوراً | توسيع ثم تقليص (أدناه) |
| تغيير النوع | قد يفشل أو يقطع البيانات | عمود جديد + نسخ + تبديل |

## نمط التوسيع ثم التقليص (Expand / Contract)
لإعادة تسمية \`fullname\` إلى \`name\` دون توقف الخدمة:
\`\`\`text
1) توسيع:   أضف name، والكود يكتب في الاثنين ويقرأ من fullname
2) ترحيل:  انسخ القيم القديمة: UPDATE users SET name = fullname WHERE name IS NULL
3) تبديل:  الكود يقرأ من name
4) تقليص:  بعد التأكد، ترحيل يحذف fullname
\`\`\`
أثناء النشر يعمل الكود القديم والجديد معاً لدقائق؛ كل خطوة يجب أن تكون متوافقة مع الاثنين.

## الترحيلات داخل معاملة
في PostgreSQL يمكن لأغلب أوامر DDL أن تكون داخل معاملة: إن فشل جزء، لا يُطبَّق شيء — ميزة كبيرة. (MySQL يثبّت DDL ضمنياً فلا يتراجع.) بعض الأوامر مثل \`CREATE INDEX CONCURRENTLY\` لا تعمل داخل معاملة.

## الرجوع (Down)
بعض الأدوات تطلب ملف "down" يعكس كل ترحيل. مفيد في التطوير، لكن في الإنتاج الرجوع غالباً **ترحيل أمامي جديد**: لا يمكن "إرجاع" عمود حذفته وبياناته.

## البذر (Seed) مقابل الترحيل
- **الترحيل**: بنية + بيانات مرجعية لازمة لعمل التطبيق (قائمة الحالات، الأدوار).
- **البذر**: بيانات تجريبية للتطوير — لا تُشغَّل على الإنتاج.

## الأدوات
| الأداة | ملاحظات |
|---|---|
| Supabase CLI | \`supabase migration new\` ثم \`supabase db push\` |
| Prisma Migrate / Drizzle Kit | تولّد الترحيلات من تعريف المخطط في الكود — راجع SQL المولّد دائماً |
| node-pg-migrate، Knex، Flyway، Alembic (Python) | ترحيلات صريحة |

## قبل تطبيق ترحيل على الإنتاج
- [ ] جُرِّب على نسخة من بيانات حقيقية (أو مخطط مطابق).
- [ ] متوافق مع الكود الحالي المنشور (لا يكسره قبل نشر الكود الجديد).
- [ ] نسخة احتياطية حديثة.
- [ ] الأقفال: هل يقفل جدولاً كبيراً لوقت طويل؟
- [ ] يمكن إعادة تشغيله بأمان (\`IF NOT EXISTS\`) إن انقطع.

## تمرين
أضف إلى المثال الكامل ترحيلاً رابعاً يجعل \`phone\` إلزامياً بالطريقة الآمنة: املأ القيم الفارغة بقيمة مؤقتة ثم أعد بناء الجدول (SQLite لا يدعم \`ALTER COLUMN SET NOT NULL\`). شغّل المشغّل مرتين وتأكد أن الترحيل لا يُطبَّق مرتين.
`,
    codeExample: `# مشغّل ترحيلات مصغّر: يوضح ما تفعله أدوات مثل Supabase CLI و Prisma Migrate
import sqlite3

# في مشروع حقيقي: ملفات migrations/*.sql تُقرأ بترتيب أسمائها
MIGRATIONS = [
    ("20260901000000_create_users", """
        CREATE TABLE users (
          id INTEGER PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          fullname TEXT NOT NULL
        );
    """),
    ("20260915000000_add_phone", """
        ALTER TABLE users ADD COLUMN phone TEXT;          -- عمود يقبل NULL: آمن
    """),
    ("20261001000000_expand_name", """
        ALTER TABLE users ADD COLUMN name TEXT;           -- توسيع: عمود جديد بجانب القديم
        UPDATE users SET name = fullname WHERE name IS NULL;
    """),
]


def migrate(conn):
    conn.execute("""CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )""")
    applied = {row[0] for row in conn.execute("SELECT version FROM schema_migrations")}
    for version, sql in MIGRATIONS:
        if version in applied:
            continue
        try:
            conn.execute("BEGIN")
            # executescript يثبّت ضمنياً؛ ننفذ العبارات واحدة واحدة داخل المعاملة
            for statement in filter(None, (s.strip() for s in sql.split(";"))):
                conn.execute(statement)
            conn.execute("INSERT INTO schema_migrations (version) VALUES (?)", (version,))
            conn.execute("COMMIT")
            print("طُبِّق:", version)
        except Exception as err:
            conn.execute("ROLLBACK")
            raise RuntimeError(f"فشل {version}: {err}") from err


conn = sqlite3.connect(":memory:", isolation_level=None)   # نتحكم بالمعاملات بأنفسنا

# بيانات "إنتاج" قبل الترحيلات اللاحقة
migrate(conn)
conn.execute("INSERT INTO users (email, fullname) VALUES ('sara@example.com', 'سارة أحمد')")

MIGRATIONS.append(("20261005000000_backfill_check", "UPDATE users SET name = fullname WHERE name IS NULL"))
migrate(conn)          # يطبّق الجديد فقط
migrate(conn)          # لا شيء: كل الترحيلات مسجّلة

print(conn.execute("SELECT version FROM schema_migrations ORDER BY version").fetchall())
print(conn.execute("SELECT email, fullname, name, phone FROM users").fetchall())`,
    quiz: {
      question: 'اكتشفت خطأ في ملف ترحيل طُبِّق على الإنتاج قبل أسبوع. ما التصرف الصحيح؟',
      options: [
        'تعديل الملف القديم وإعادة تشغيله',
        'كتابة ترحيل جديد يصحح الخطأ',
        'حذف جدول schema_migrations وإعادة كل شيء',
        'تعديل قاعدة الإنتاج يدوياً دون ملف',
      ],
      correctAnswer: 1,
      explanation: 'الترحيلات المطبقة سجل تاريخي؛ تعديلها يجعل البيئات مختلفة بصمت.',
    },
  },
  {
    id: 'sql-project',
    title: 'مشروع: قاعدة بيانات متجر إلكتروني',
    description: 'مشروع ختامي على PostgreSQL: مخطط متجر كامل بقيود وفهارس، إنشاء طلب داخل معاملة تتحقق من المخزون، تقارير المبيعات، و View للوحة التحكم',
    language: 'sql',
    xpReward: 250,
    content: md`
# مشروع: قاعدة بيانات متجر إلكتروني

مشروع يجمع الدورة: تصميم مخطط، قيود تحمي القواعد، معاملات، فهارس، وتقارير. المثال الكامل يعمل على PostgreSQL (يمكنك تشغيله في Supabase SQL Editor أو أي PostgreSQL محلي).

## المتطلبات
1. عملاء ومنتجات بمخزون وأسعار.
2. طلبات بعدة عناصر، تحفظ سعر الوحدة وقت الشراء.
3. **لا يُباع أكثر من المخزون** أبداً، حتى مع طلبات متزامنة.
4. حالات الطلب: pending ← paid ← shipped، أو cancelled.
5. تقارير: المبيعات اليومية، أفضل المنتجات، أفضل العملاء.

## المخطط
\`\`\`sql
${STORE_SCHEMA_PG}\`\`\`
راجع كل قرار:
| القرار | السبب |
|---|---|
| \`NUMERIC(12,2)\` للأسعار | لا أخطاء تقريب عشري |
| \`CHECK (stock >= 0)\` | القاعدة نفسها ترفض المخزون السالب — خط دفاع حتى لو أخطأ الكود |
| \`unit_price\` في order_items | لقطة السعر وقت الشراء |
| مفتاح مركب في order_items | منتج واحد مرة واحدة في الطلب |
| \`ON DELETE RESTRICT\` للعميل | لا يُحذف عميل له طلبات (سجل مالي) |
| فهارس على المفاتيح الأجنبية | JOINs وتقارير سريعة |

## إنشاء طلب: معاملة واحدة
\`\`\`sql
${STORE_SCHEMA_PG}
INSERT INTO customers (name, email) VALUES ('سارة', 'sara@example.com');
INSERT INTO products (sku, name, price, stock) VALUES ('PEN-01', 'قلم', 1.50, 100), ('NB-01', 'دفتر', 3.00, 2);

BEGIN;
-- 1) إنشاء الطلب
INSERT INTO orders (customer_id) VALUES (1);
-- 2) خصم المخزون ذرياً: يفشل القيد CHECK إن لم يكفِ المخزون فتُلغى المعاملة كلها
UPDATE products SET stock = stock - 2 WHERE sku = 'NB-01';
UPDATE products SET stock = stock - 5 WHERE sku = 'PEN-01';
-- 3) العناصر بسعر اللحظة
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 1, id, CASE sku WHEN 'NB-01' THEN 2 ELSE 5 END, price FROM products WHERE sku IN ('NB-01', 'PEN-01');
COMMIT;

SELECT name, stock FROM products ORDER BY id;
\`\`\`
لماذا \`stock = stock - 2\` بدل "اقرأ المخزون في التطبيق ثم اكتب القيمة الجديدة"؟ لأن طلبين متزامنين قد يقرآن نفس القيمة ويبيعان نفس القطعة مرتين. التحديث الذري مع قيد \`CHECK\` يمنع ذلك.

## التقارير
\`\`\`sql
${STORE_SCHEMA_PG}
INSERT INTO customers (name, email, city) VALUES ('سارة', 's@example.com', 'بغداد'), ('عمر', 'o@example.com', 'البصرة');
INSERT INTO products (sku, name, price, stock) VALUES ('A', 'قلم', 1.50, 100), ('B', 'حقيبة', 25.00, 10);
INSERT INTO orders (customer_id, status) VALUES (1, 'paid'), (2, 'paid'), (1, 'cancelled');
INSERT INTO order_items VALUES (1, 1, 10, 1.50), (1, 2, 1, 25.00), (2, 2, 2, 25.00), (3, 1, 3, 1.50);

-- أفضل المنتجات (الطلبات المدفوعة فقط)
SELECT p.name, SUM(oi.quantity) AS units, SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN orders o ON o.id = oi.order_id AND o.status = 'paid'
JOIN products p ON p.id = oi.product_id
GROUP BY p.name
ORDER BY revenue DESC;

-- المبيعات اليومية
SELECT date_trunc('day', o.created_at) AS day, COUNT(DISTINCT o.id) AS orders, SUM(oi.quantity * oi.unit_price) AS revenue
FROM orders o JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'paid'
GROUP BY 1 ORDER BY 1;
\`\`\`

## View للوحة التحكم
المثال الكامل ينشئ \`order_summaries\`: كل طلب مع اسم العميل وعدد العناصر والمجموع — تستخدمه لوحة التحكم كجدول عادي دون تكرار منطق الحساب في الكود.

## تحديات إضافية
1. جدول \`payments\` (مبلغ، طريقة، حالة) وقيد يمنع دفع طلب ملغى (بـ trigger أو منطق في المعاملة).
2. انتقالات الحالة المسموحة فقط (لا shipped ← pending): دالة PL/pgSQL أو جدول انتقالات.
3. إلغاء الطلب داخل معاملة يعيد الكميات للمخزون.
4. كوبونات خصم بنسبة وصلاحية زمنية وحد استخدام.
5. حوّل المخطط إلى ملفات ترحيل مرقمة (الدرس السابق).
`,
    codeExample: `${STORE_SCHEMA_PG}
-- بيانات تجريبية
INSERT INTO customers (name, email, city) VALUES
  ('سارة', 'sara@example.com', 'بغداد'), ('عمر', 'omar@example.com', 'البصرة');
INSERT INTO products (sku, name, price, stock) VALUES
  ('PEN-01', 'قلم', 1.50, 100), ('NB-01', 'دفتر', 3.00, 20), ('BAG-01', 'حقيبة', 25.00, 3);

-- طلب ناجح: معاملة واحدة
BEGIN;
INSERT INTO orders (customer_id, status) VALUES (1, 'paid');
UPDATE products SET stock = stock - 1 WHERE sku = 'BAG-01';
UPDATE products SET stock = stock - 10 WHERE sku = 'PEN-01';
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 1, id, CASE sku WHEN 'BAG-01' THEN 1 ELSE 10 END, price FROM products WHERE sku IN ('BAG-01', 'PEN-01');
COMMIT;

-- طلب ثانٍ لعميل آخر
BEGIN;
INSERT INTO orders (customer_id, status) VALUES (2, 'paid');
UPDATE products SET stock = stock - 2 WHERE sku = 'BAG-01';
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 2, id, 2, price FROM products WHERE sku = 'BAG-01';
COMMIT;

-- تغيّر السعر لاحقاً: الفواتير السابقة لا تتأثر
UPDATE products SET price = 30.00 WHERE sku = 'BAG-01';

-- View للوحة التحكم
CREATE VIEW order_summaries AS
SELECT o.id, c.name AS customer, o.status, COUNT(*) AS lines,
       SUM(oi.quantity) AS units, SUM(oi.quantity * oi.unit_price) AS total
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, c.name, o.status;

SELECT * FROM order_summaries ORDER BY id;

-- أفضل العملاء
SELECT customer, SUM(total) AS spent FROM order_summaries WHERE status = 'paid' GROUP BY customer ORDER BY spent DESC;

SELECT sku, stock FROM products ORDER BY id;`,
    quiz: {
      question: 'لماذا نخصم المخزون بـ UPDATE products SET stock = stock - 2 بدل قراءة المخزون في التطبيق ثم كتابة القيمة الجديدة؟',
      options: [
        'لأنه أقصر فقط',
        'لأنه تحديث ذري: طلبان متزامنان لا يقرآن نفس القيمة القديمة، ومع CHECK (stock >= 0) لا يُباع أكثر من المتاح',
        'لأن التطبيق لا يستطيع القراءة من قاعدة البيانات',
        'لا فرق بين الطريقتين',
      ],
      correctAnswer: 1,
      explanation: 'القراءة ثم الكتابة من التطبيق تسمح بحالة سباق؛ التحديث الذري مع القيد يجعل القاعدة هي الحَكَم.',
    },
  },
];

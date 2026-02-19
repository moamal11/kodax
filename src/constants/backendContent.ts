/**
 * محتوى Backend الشامل - Kodax
 * Node.js, Express, Databases, APIs
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس Node.js =====
export const NODEJS_LESSONS: Lesson[] = [
  {
    id: 'node-1',
    courseId: 'backend-nodejs',
    title: 'مقدمة في Node.js',
    description: 'تعرف على بيئة تشغيل JavaScript على الخادم',
    content: `
# مقدمة في Node.js

Node.js هو بيئة تشغيل JavaScript خارج المتصفح.

## ما هو Node.js؟
- بيئة JavaScript على الخادم
- مبني على محرك V8 من Google
- غير متزامن (Asynchronous)
- يعتمد على الأحداث (Event-driven)

## لماذا Node.js؟

### 1. السرعة العالية
- I/O غير متزامن
- معالجة آلاف الطلبات معاً
- أداء ممتاز للـ Real-time apps

### 2. نفس اللغة
- JavaScript في الـ Frontend والـ Backend
- مشاركة الكود بين الجهتين
- فريق تطوير واحد

### 3. NPM
- أكبر مدير حزم في العالم
- +1.5 مليون حزمة
- مجتمع ضخم

## التثبيت

\`\`\`bash
# تحميل من الموقع الرسمي
https://nodejs.org

# التحقق من التثبيت
node --version
npm --version
\`\`\`

## أول برنامج

\`\`\`javascript
// hello.js
console.log("مرحباً من Node.js!");

// تشغيل
// node hello.js
\`\`\`
`,
    codeExample: `// أول سيرفر HTTP بسيط
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>مرحباً بك في Node.js!</h1>');
});

server.listen(3000, () => {
  console.log('السيرفر يعمل على http://localhost:3000');
});`,
    language: 'javascript',
    xpReward: 150,
    order: 1,
    quiz: {
      question: 'ما هو محرك JavaScript الذي يستخدمه Node.js؟',
      options: ['SpiderMonkey', 'V8', 'Chakra', 'JavaScriptCore'],
      correctAnswer: 1,
      explanation: 'Node.js مبني على محرك V8 من Google Chrome',
    },
  },
  {
    id: 'node-2',
    courseId: 'backend-nodejs',
    title: 'الـ Modules في Node.js',
    description: 'تعلم نظام الوحدات وتنظيم الكود',
    content: `
# الـ Modules في Node.js

## ما هي الـ Modules؟
طريقة لتقسيم الكود إلى ملفات منظمة قابلة لإعادة الاستخدام.

## أنواع الـ Modules

### 1. Built-in Modules
وحدات مدمجة مع Node.js

### 2. Local Modules
وحدات تنشئها أنت

### 3. Third-party Modules
وحدات من NPM

## التصدير والاستيراد

### CommonJS (القديم)
\`\`\`javascript
// math.js
module.exports = { add, subtract };

// app.js
const { add } = require('./math');
\`\`\`

### ES Modules (الحديث)
\`\`\`javascript
// math.js
export const add = (a, b) => a + b;

// app.js
import { add } from './math.js';
\`\`\`
`,
    codeExample: `// ===== math.js =====
// تصدير دوال متعددة
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => b !== 0 ? a / b : 'Error';

module.exports = { add, subtract, multiply, divide };

// ===== app.js =====
const math = require('./math');

console.log(math.add(5, 3));       // 8
console.log(math.multiply(4, 2));  // 8

// أو استيراد محدد
const { add, subtract } = require('./math');
console.log(add(10, 5));  // 15`,
    language: 'javascript',
    xpReward: 120,
    order: 2,
    quiz: {
      question: 'ما الدالة المستخدمة لاستيراد module في CommonJS؟',
      options: ['import()', 'require()', 'include()', 'load()'],
      correctAnswer: 1,
      explanation:
        'require() هي الدالة المستخدمة في CommonJS لاستيراد الـ modules',
    },
  },
  {
    id: 'node-3',
    courseId: 'backend-nodejs',
    title: 'File System (fs)',
    description: 'التعامل مع الملفات في Node.js',
    content: `
# التعامل مع الملفات

وحدة \`fs\` تتيح قراءة وكتابة الملفات.

## طريقتان للتعامل

### 1. Synchronous (متزامن)
- يوقف البرنامج حتى الانتهاء
- أسهل لكن أبطأ

### 2. Asynchronous (غير متزامن)
- لا يوقف البرنامج
- أفضل للأداء

## العمليات الأساسية

- قراءة ملف
- كتابة ملف
- إضافة لملف
- حذف ملف
- إنشاء مجلد
`,
    codeExample: `const fs = require('fs');
const path = require('path');

// ===== قراءة ملف (غير متزامن) =====
fs.readFile('data.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('خطأ:', err);
    return;
  }
  console.log('المحتوى:', data);
});

// ===== كتابة ملف =====
const content = 'مرحباً بالعالم!';
fs.writeFile('output.txt', content, 'utf8', (err) => {
  if (err) throw err;
  console.log('تم الحفظ!');
});

// ===== الإضافة لملف =====
fs.appendFile('log.txt', 'سطر جديد\\n', (err) => {
  if (err) throw err;
  console.log('تمت الإضافة!');
});

// ===== استخدام Promises =====
const fsPromises = require('fs').promises;

async function readFileAsync() {
  try {
    const data = await fsPromises.readFile('data.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}`,
    language: 'javascript',
    xpReward: 140,
    order: 3,
    quiz: {
      question: 'أي طريقة أفضل للأداء في Node.js؟',
      options: [
        'Synchronous',
        'Asynchronous',
        'كلاهما متساوي',
        'يعتمد على الحالة',
      ],
      correctAnswer: 1,
      explanation:
        'Asynchronous أفضل للأداء لأنها لا توقف البرنامج أثناء انتظار العمليات',
    },
  },
  {
    id: 'node-4',
    courseId: 'backend-nodejs',
    title: 'NPM وإدارة الحزم',
    description: 'تعلم استخدام Node Package Manager',
    content: `
# NPM - مدير الحزم

NPM = Node Package Manager

## الأوامر الأساسية

### تهيئة مشروع
\`\`\`bash
npm init
npm init -y  # القيم الافتراضية
\`\`\`

### تثبيت حزمة
\`\`\`bash
npm install express
npm i express  # اختصار
npm i -D nodemon  # للتطوير فقط
npm i -g typescript  # عالمياً
\`\`\`

### حذف حزمة
\`\`\`bash
npm uninstall express
\`\`\`

## package.json

الملف الرئيسي للمشروع يحتوي:
- معلومات المشروع
- الحزم المطلوبة
- سكريبتات التشغيل
`,
    codeExample: `// package.json
{
  "name": "my-api",
  "version": "1.0.0",
  "description": "API للتطبيق",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.0.0"
  }
}

// تشغيل السكريبتات
// npm start
// npm run dev
// npm test`,
    language: 'json',
    xpReward: 100,
    order: 4,
    quiz: {
      question: 'ما الفرق بين dependencies و devDependencies؟',
      options: [
        'لا فرق',
        'devDependencies للتطوير فقط',
        'dependencies للتطوير فقط',
        'كلاهما للإنتاج',
      ],
      correctAnswer: 1,
      explanation: 'devDependencies حزم للتطوير فقط ولا تُضمن في الإنتاج',
    },
  },
  {
    id: 'node-5',
    courseId: 'backend-nodejs',
    title: 'Express.js الأساسيات',
    description: 'إطار العمل الأشهر لبناء APIs',
    content: `
# Express.js

إطار عمل سريع وبسيط لبناء Web Applications و APIs.

## لماذا Express؟
- خفيف وسريع
- سهل التعلم
- مرن جداً
- مجتمع ضخم

## المفاهيم الأساسية

### 1. Routes
تحديد مسارات الـ API

### 2. Middleware
دوال تعمل قبل الـ Route handler

### 3. Request & Response
التعامل مع الطلب والاستجابة

## HTTP Methods
- GET: جلب بيانات
- POST: إنشاء جديد
- PUT: تحديث كامل
- PATCH: تحديث جزئي
- DELETE: حذف
`,
    codeExample: `const express = require('express');
const app = express();

// Middleware لقراءة JSON
app.use(express.json());

// بيانات وهمية
let users = [
  { id: 1, name: 'أحمد', email: 'ahmed@example.com' },
  { id: 2, name: 'سارة', email: 'sara@example.com' },
];

// GET - جلب كل المستخدمين
app.get('/api/users', (req, res) => {
  res.json(users);
});

// GET - جلب مستخدم واحد
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'غير موجود' });
  res.json(user);
});

// POST - إضافة مستخدم
app.post('/api/users', (req, res) => {
  const user = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email,
  };
  users.push(user);
  res.status(201).json(user);
});

// DELETE - حذف مستخدم
app.delete('/api/users/:id', (req, res) => {
  users = users.filter(u => u.id !== parseInt(req.params.id));
  res.json({ message: 'تم الحذف' });
});

app.listen(3000, () => {
  console.log('السيرفر يعمل على port 3000');
});`,
    language: 'javascript',
    xpReward: 180,
    order: 5,
    quiz: {
      question: 'ما الـ HTTP Method المستخدم لإنشاء resource جديد؟',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correctAnswer: 1,
      explanation: 'POST يستخدم لإنشاء resource جديد على الخادم',
    },
  },
];

// ===== دروس SQL =====
export const SQL_LESSONS: Lesson[] = [
  {
    id: 'sql-1',
    courseId: 'backend-sql',
    title: 'مقدمة في قواعد البيانات',
    description: 'أساسيات قواعد البيانات العلائقية',
    content: `
# قواعد البيانات العلائقية

## ما هي قاعدة البيانات؟
مكان منظم لتخزين البيانات بشكل دائم.

## أنواع قواعد البيانات

### 1. العلائقية (SQL)
- MySQL
- PostgreSQL
- SQLite
- SQL Server

### 2. غير العلائقية (NoSQL)
- MongoDB
- Firebase
- Redis

## المفاهيم الأساسية

### Table (جدول)
يخزن البيانات في صفوف وأعمدة

### Row (صف)
سجل واحد من البيانات

### Column (عمود)
خاصية واحدة

### Primary Key
معرّف فريد لكل صف
`,
    codeExample: `-- إنشاء جدول المستخدمين
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  age INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول المنشورات
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- أنواع البيانات الشائعة
-- INT: أرقام صحيحة
-- VARCHAR(n): نص محدود الطول
-- TEXT: نص طويل
-- BOOLEAN: صح/خطأ
-- DATE: تاريخ
-- TIMESTAMP: تاريخ ووقت`,
    language: 'sql',
    xpReward: 150,
    order: 1,
    quiz: {
      question: 'ما هو Primary Key؟',
      options: [
        'مفتاح للتشفير',
        'معرّف فريد لكل صف',
        'كلمة مرور',
        'اسم الجدول',
      ],
      correctAnswer: 1,
      explanation: 'Primary Key هو معرّف فريد يميز كل صف في الجدول عن غيره',
    },
  },
  {
    id: 'sql-2',
    courseId: 'backend-sql',
    title: 'CRUD Operations',
    description: 'العمليات الأساسية على البيانات',
    content: `
# عمليات CRUD

CRUD = Create, Read, Update, Delete

## 1. CREATE (INSERT)
إضافة بيانات جديدة

## 2. READ (SELECT)
قراءة واستعلام البيانات

## 3. UPDATE
تحديث بيانات موجودة

## 4. DELETE
حذف بيانات

## WHERE Clause
تحديد شرط للعملية

## ORDER BY
ترتيب النتائج

## LIMIT
تحديد عدد النتائج
`,
    codeExample: `-- ===== INSERT - إضافة بيانات =====
INSERT INTO users (name, email, age)
VALUES ('أحمد', 'ahmed@mail.com', 25);

INSERT INTO users (name, email, age) VALUES
  ('سارة', 'sara@mail.com', 22),
  ('محمد', 'mohamed@mail.com', 30);

-- ===== SELECT - قراءة بيانات =====
-- جلب الكل
SELECT * FROM users;

-- جلب أعمدة محددة
SELECT name, email FROM users;

-- مع شرط
SELECT * FROM users WHERE age > 20;

-- ترتيب
SELECT * FROM users ORDER BY age DESC;

-- تحديد العدد
SELECT * FROM users LIMIT 10;

-- ===== UPDATE - تحديث =====
UPDATE users
SET age = 26
WHERE id = 1;

UPDATE users
SET name = 'أحمد محمد', email = 'ahmed2@mail.com'
WHERE id = 1;

-- ===== DELETE - حذف =====
DELETE FROM users WHERE id = 5;

-- حذف الكل (خطير!)
DELETE FROM users;`,
    language: 'sql',
    xpReward: 160,
    order: 2,
    quiz: {
      question: 'ما الأمر المستخدم لقراءة البيانات في SQL؟',
      options: ['GET', 'READ', 'SELECT', 'FETCH'],
      correctAnswer: 2,
      explanation: 'SELECT هو الأمر المستخدم لقراءة واستعلام البيانات في SQL',
    },
  },
  {
    id: 'sql-3',
    courseId: 'backend-sql',
    title: 'JOIN - ربط الجداول',
    description: 'ربط البيانات من جداول متعددة',
    content: `
# JOIN - ربط الجداول

JOIN يربط بيانات من جدولين أو أكثر.

## أنواع JOIN

### 1. INNER JOIN
فقط الصفوف المتطابقة

### 2. LEFT JOIN
كل صفوف الجدول الأيسر + المتطابقة من الأيمن

### 3. RIGHT JOIN
كل صفوف الجدول الأيمن + المتطابقة من الأيسر

### 4. FULL JOIN
كل الصفوف من الجدولين
`,
    codeExample: `-- لدينا جدولين: users و posts

-- ===== INNER JOIN =====
-- المستخدمين الذين لديهم منشورات فقط
SELECT users.name, posts.title
FROM users
INNER JOIN posts ON users.id = posts.user_id;

-- ===== LEFT JOIN =====
-- كل المستخدمين + منشوراتهم (إن وجدت)
SELECT users.name, posts.title
FROM users
LEFT JOIN posts ON users.id = posts.user_id;

-- ===== مثال متقدم =====
SELECT 
  u.name AS user_name,
  u.email,
  COUNT(p.id) AS posts_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id
ORDER BY posts_count DESC;

-- ===== Multiple JOINs =====
SELECT 
  u.name,
  p.title,
  c.content AS comment
FROM users u
JOIN posts p ON u.id = p.user_id
JOIN comments c ON p.id = c.post_id
WHERE u.id = 1;`,
    language: 'sql',
    xpReward: 180,
    order: 3,
    quiz: {
      question: 'ما نوع JOIN الذي يرجع فقط الصفوف المتطابقة؟',
      options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'],
      correctAnswer: 2,
      explanation: 'INNER JOIN يرجع فقط الصفوف التي لها تطابق في كلا الجدولين',
    },
  },
  {
    id: 'sql-4',
    courseId: 'backend-sql',
    title: 'GROUP BY والدوال التجميعية',
    description: 'تجميع البيانات وإجراء الحسابات',
    content: `
# GROUP BY والدوال التجميعية

## الدوال التجميعية (Aggregate Functions)

### COUNT
عدد الصفوف

### SUM
مجموع القيم

### AVG
المتوسط

### MAX / MIN
أكبر وأصغر قيمة

## GROUP BY
تجميع البيانات حسب عمود معين

## HAVING
شرط على المجموعات (بعد GROUP BY)

## الفرق بين WHERE و HAVING
- WHERE: قبل التجميع
- HAVING: بعد التجميع
`,
    codeExample: `-- ===== الدوال التجميعية =====
-- عدد المستخدمين
SELECT COUNT(*) AS total_users FROM users;

-- عدد مع شرط
SELECT COUNT(*) FROM users WHERE age > 18;

-- المتوسط والمجموع
SELECT 
  AVG(age) AS average_age,
  SUM(age) AS total_age,
  MIN(age) AS youngest,
  MAX(age) AS oldest
FROM users;

-- ===== GROUP BY =====
-- عدد المنشورات لكل مستخدم
SELECT user_id, COUNT(*) AS posts_count
FROM posts
GROUP BY user_id;

-- المبيعات حسب الشهر
SELECT 
  MONTH(created_at) AS month,
  SUM(amount) AS total_sales
FROM orders
GROUP BY MONTH(created_at);

-- ===== HAVING - شرط على المجموعات =====
-- المستخدمين الذين لديهم أكثر من 5 منشورات
SELECT user_id, COUNT(*) AS posts_count
FROM posts
GROUP BY user_id
HAVING COUNT(*) > 5;

-- ===== مثال شامل =====
SELECT 
  u.name,
  COUNT(o.id) AS orders_count,
  SUM(o.amount) AS total_spent,
  AVG(o.amount) AS avg_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id
HAVING total_spent > 1000
ORDER BY total_spent DESC;`,
    language: 'sql',
    xpReward: 170,
    order: 4,
    quiz: {
      question: 'ما الفرق بين WHERE و HAVING؟',
      options: [
        'لا يوجد فرق',
        'WHERE قبل GROUP BY، HAVING بعده',
        'HAVING أسرع',
        'WHERE للنصوص فقط',
      ],
      correctAnswer: 1,
      explanation:
        'WHERE يُطبق قبل التجميع على الصفوف الفردية، بينما HAVING يُطبق بعد التجميع على المجموعات',
    },
  },
  {
    id: 'sql-5',
    courseId: 'backend-sql',
    title: 'Indexes وتحسين الأداء',
    description: 'تسريع الاستعلامات باستخدام الفهارس',
    content: `
# Indexes - الفهارس

## ما هو Index؟
هيكل بيانات يسرّع البحث في الجدول.

## متى نستخدم Index؟
- أعمدة البحث المتكرر (WHERE)
- أعمدة JOIN
- أعمدة الترتيب (ORDER BY)

## متى لا نستخدم؟
- الجداول الصغيرة
- الأعمدة المُحدّثة كثيراً
- الأعمدة ذات القيم المكررة

## أنواع الفهارس
- PRIMARY KEY (تلقائي)
- UNIQUE INDEX
- INDEX (عادي)
- COMPOSITE INDEX (متعدد الأعمدة)
`,
    codeExample: `-- ===== إنشاء Index =====
-- فهرس عادي
CREATE INDEX idx_users_email ON users(email);

-- فهرس فريد
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- فهرس مركب (متعدد الأعمدة)
CREATE INDEX idx_orders_user_date 
ON orders(user_id, created_at);

-- ===== حذف Index =====
DROP INDEX idx_users_email ON users;

-- ===== عرض الفهارس =====
SHOW INDEX FROM users;

-- ===== EXPLAIN - تحليل الاستعلام =====
EXPLAIN SELECT * FROM users WHERE email = 'test@mail.com';

-- ===== نصائح للأداء =====
-- 1. استخدم LIMIT
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20;

-- 2. اختر أعمدة محددة بدل *
SELECT id, title FROM posts WHERE user_id = 1;

-- 3. تجنب LIKE مع % في البداية
-- بطيء: WHERE name LIKE '%أحمد'
-- سريع: WHERE name LIKE 'أحمد%'

-- 4. استخدم EXISTS بدل IN للجداول الكبيرة
SELECT * FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);`,
    language: 'sql',
    xpReward: 180,
    order: 5,
    quiz: {
      question: 'متى يُفضل عدم استخدام Index؟',
      options: [
        'في أعمدة البحث المتكرر',
        'في الجداول الصغيرة والأعمدة المُحدّثة كثيراً',
        'في Primary Keys',
        'في أعمدة JOIN',
      ],
      correctAnswer: 1,
      explanation:
        'الجداول الصغيرة لا تستفيد من Index، والأعمدة المُحدّثة كثيراً تتطلب إعادة بناء الفهرس مما يبطئ العمليات',
    },
  },
  {
    id: 'sql-6',
    courseId: 'backend-sql',
    title: 'Subqueries و Views',
    description: 'الاستعلامات الفرعية والعروض',
    content: `
# Subqueries والـ Views

## Subquery (استعلام فرعي)
استعلام داخل استعلام آخر.

### أنواع Subqueries
1. في WHERE
2. في FROM
3. في SELECT

## View (عرض)
استعلام محفوظ باسم، يُعامل كجدول.

### فوائد Views
- تبسيط الاستعلامات المعقدة
- إعادة الاستخدام
- الأمان (إخفاء أعمدة)
`,
    codeExample: `-- ===== Subquery في WHERE =====
-- المستخدمين الذين لديهم طلبات
SELECT * FROM users
WHERE id IN (SELECT DISTINCT user_id FROM orders);

-- المنتجات الأغلى من المتوسط
SELECT * FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- ===== Subquery في FROM =====
SELECT category, avg_price
FROM (
  SELECT category, AVG(price) AS avg_price
  FROM products
  GROUP BY category
) AS category_stats
WHERE avg_price > 100;

-- ===== Subquery في SELECT =====
SELECT 
  name,
  (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) AS orders_count
FROM users;

-- ===== إنشاء View =====
CREATE VIEW active_users AS
SELECT id, name, email, last_login
FROM users
WHERE last_login > DATE_SUB(NOW(), INTERVAL 30 DAY);

-- استخدام View
SELECT * FROM active_users WHERE name LIKE '%أحمد%';

-- ===== View معقد =====
CREATE VIEW user_stats AS
SELECT 
  u.id,
  u.name,
  COUNT(o.id) AS total_orders,
  COALESCE(SUM(o.amount), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;

-- استخدامه ببساطة
SELECT * FROM user_stats WHERE total_spent > 5000;

-- ===== تحديث وحذف View =====
DROP VIEW IF EXISTS active_users;`,
    language: 'sql',
    xpReward: 190,
    order: 6,
    quiz: {
      question: 'ما هو View في SQL؟',
      options: [
        'نوع من الجداول المؤقتة',
        'استعلام محفوظ يُعامل كجدول',
        'طريقة لعرض البيانات فقط',
        'نسخة احتياطية من الجدول',
      ],
      correctAnswer: 1,
      explanation:
        'View هو استعلام SELECT محفوظ باسم، يمكن استخدامه كأنه جدول في استعلامات أخرى',
    },
  },
  {
    id: 'sql-7',
    courseId: 'backend-sql',
    title: 'المعاملات (Transactions)',
    description: 'ضمان سلامة البيانات',
    content: `
# Transactions - المعاملات

## ما هي Transaction؟
مجموعة عمليات تُنفذ كوحدة واحدة.

## خصائص ACID

### Atomicity (ذرية)
إما تنجح كلها أو تفشل كلها

### Consistency (اتساق)
البيانات تبقى صالحة

### Isolation (عزل)
المعاملات لا تتداخل

### Durability (ديمومة)
التغييرات دائمة بعد الحفظ

## الأوامر الأساسية
- BEGIN / START TRANSACTION
- COMMIT (حفظ)
- ROLLBACK (إلغاء)
`,
    codeExample: `-- ===== Transaction بسيطة =====
START TRANSACTION;

UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;

COMMIT;  -- حفظ التغييرات

-- ===== مع ROLLBACK =====
START TRANSACTION;

UPDATE accounts SET balance = balance - 1000 WHERE id = 1;

-- التحقق من الرصيد
SELECT balance FROM accounts WHERE id = 1;
-- إذا سالب، إلغاء!
ROLLBACK;  -- إلغاء كل التغييرات

-- ===== مثال تحويل أموال =====
DELIMITER //
CREATE PROCEDURE transfer_money(
  IN from_account INT,
  IN to_account INT,
  IN amount DECIMAL(10,2)
)
BEGIN
  DECLARE current_balance DECIMAL(10,2);
  
  START TRANSACTION;
  
  -- التحقق من الرصيد
  SELECT balance INTO current_balance 
  FROM accounts WHERE id = from_account FOR UPDATE;
  
  IF current_balance >= amount THEN
    -- خصم من المرسل
    UPDATE accounts 
    SET balance = balance - amount 
    WHERE id = from_account;
    
    -- إضافة للمستلم
    UPDATE accounts 
    SET balance = balance + amount 
    WHERE id = to_account;
    
    COMMIT;
    SELECT 'تم التحويل بنجاح' AS result;
  ELSE
    ROLLBACK;
    SELECT 'رصيد غير كافٍ' AS result;
  END IF;
END //
DELIMITER ;

-- استخدام الـ Procedure
CALL transfer_money(1, 2, 500.00);`,
    language: 'sql',
    xpReward: 200,
    order: 7,
    quiz: {
      question: 'ماذا يفعل ROLLBACK في Transaction؟',
      options: [
        'يحفظ التغييرات',
        'يلغي جميع التغييرات منذ BEGIN',
        'يحذف الجدول',
        'يعيد تشغيل قاعدة البيانات',
      ],
      correctAnswer: 1,
      explanation:
        'ROLLBACK يلغي جميع التغييرات التي حدثت منذ بداية المعاملة (BEGIN/START TRANSACTION)',
    },
  },
];

// ===== دروس Supabase =====
export const SUPABASE_LESSONS: Lesson[] = [
  {
    id: 'supa-1',
    courseId: 'backend-supabase',
    title: 'مقدمة في Supabase',
    description: 'Firebase البديل مفتوح المصدر',
    content: `
# Supabase

Supabase = Firebase البديل مفتوح المصدر

## ما هو Supabase؟
- قاعدة بيانات PostgreSQL
- Authentication جاهز
- Storage للملفات
- Real-time subscriptions
- Edge Functions

## لماذا Supabase؟

### 1. PostgreSQL
قاعدة بيانات قوية ومجانية

### 2. سهولة الاستخدام
Dashboard سهل + SDK لكل اللغات

### 3. مفتوح المصدر
يمكنك استضافته بنفسك

### 4. خطة مجانية سخية
- 500MB قاعدة بيانات
- 1GB storage
- 50,000 مستخدم نشط
`,
    codeExample: `// تثبيت Supabase
// npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

// إنشاء العميل
const supabase = createClient(
  'https://YOUR_PROJECT.supabase.co',
  'YOUR_ANON_KEY'
);

// ===== قراءة البيانات =====
const { data: users, error } = await supabase
  .from('users')
  .select('*');

// ===== مع فلترة =====
const { data } = await supabase
  .from('users')
  .select('name, email')
  .eq('age', 25)
  .order('created_at', { ascending: false })
  .limit(10);

// ===== إضافة بيانات =====
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'أحمد', email: 'ahmed@mail.com' });

// ===== تحديث =====
const { data, error } = await supabase
  .from('users')
  .update({ name: 'أحمد محمد' })
  .eq('id', 1);

// ===== حذف =====
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', 1);`,
    language: 'javascript',
    xpReward: 200,
    order: 1,
    quiz: {
      question: 'ما نوع قاعدة البيانات التي يستخدمها Supabase؟',
      options: ['MySQL', 'MongoDB', 'PostgreSQL', 'SQLite'],
      correctAnswer: 2,
      explanation: 'Supabase مبني على PostgreSQL كقاعدة بيانات رئيسية',
    },
  },
  {
    id: 'supa-2',
    courseId: 'backend-supabase',
    title: 'Authentication مع Supabase',
    description: 'نظام تسجيل دخول جاهز',
    content: `
# Supabase Auth

نظام مصادقة كامل وجاهز.

## الميزات
- Email/Password
- OAuth (Google, GitHub, etc.)
- Magic Links
- Phone Auth
- Row Level Security

## تدفق المصادقة

1. المستخدم يسجل/يدخل
2. Supabase يرجع token
3. استخدم Token في الطلبات
4. RLS يحمي البيانات
`,
    codeExample: `// ===== تسجيل مستخدم جديد =====
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// ===== تسجيل دخول =====
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// ===== تسجيل دخول بـ Google =====
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
});

// ===== الحصول على المستخدم الحالي =====
const { data: { user } } = await supabase.auth.getUser();

// ===== تسجيل خروج =====
const { error } = await supabase.auth.signOut();

// ===== الاستماع لتغييرات الـ Auth =====
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('تم تسجيل الدخول', session.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('تم تسجيل الخروج');
  }
});

// ===== Row Level Security (RLS) =====
// في SQL Editor على Supabase:
/*
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);
*/`,
    language: 'javascript',
    xpReward: 180,
    order: 2,
    quiz: {
      question: 'ما هو RLS في Supabase؟',
      options: [
        'Real-time Live Sync',
        'Row Level Security',
        'Remote Login Service',
        'Request Limit System',
      ],
      correctAnswer: 1,
      explanation:
        'RLS (Row Level Security) نظام لحماية البيانات على مستوى الصفوف',
    },
  },
  {
    id: 'supa-3',
    courseId: 'backend-supabase',
    title: 'Real-time Subscriptions',
    description: 'البيانات الحية في الوقت الفعلي',
    content: `
# Real-time في Supabase

استقبال التحديثات فوراً بدون إعادة تحميل.

## الاستخدامات
- تطبيقات الدردشة
- لوحات المتابعة
- الإشعارات
- التحديثات الحية

## أنواع التغييرات
- INSERT: إضافة جديدة
- UPDATE: تحديث
- DELETE: حذف
- *: كل التغييرات
`,
    codeExample: `// ===== الاشتراك في تغييرات جدول =====
const subscription = supabase
  .channel('public:messages')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('تغيير:', payload);
      
      if (payload.eventType === 'INSERT') {
        console.log('رسالة جديدة:', payload.new);
      }
    }
  )
  .subscribe();

// ===== الاشتراك في INSERT فقط =====
const messagesSubscription = supabase
  .channel('new-messages')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      // أضف الرسالة الجديدة للقائمة
      setMessages(prev => [...prev, payload.new]);
    }
  )
  .subscribe();

// ===== مع فلتر =====
const myMessages = supabase
  .channel('my-messages')
  .on('postgres_changes',
    { 
      event: '*', 
      schema: 'public', 
      table: 'messages',
      filter: 'user_id=eq.123'
    },
    (payload) => {
      console.log('رسالتي:', payload);
    }
  )
  .subscribe();

// ===== إلغاء الاشتراك =====
supabase.removeChannel(subscription);`,
    language: 'javascript',
    xpReward: 170,
    order: 3,
    quiz: {
      question: 'ما فائدة Real-time في Supabase؟',
      options: [
        'تسريع الاستعلامات',
        'استقبال التحديثات فوراً',
        'تشفير البيانات',
        'ضغط الملفات',
      ],
      correctAnswer: 1,
      explanation:
        'Real-time يتيح استقبال التحديثات فور حدوثها بدون إعادة تحميل',
    },
  },
  {
    id: 'supa-4',
    courseId: 'backend-supabase',
    title: 'Storage - تخزين الملفات',
    description: 'رفع وإدارة الملفات والصور',
    content: `
# Supabase Storage

نظام تخزين ملفات قوي ومرن.

## الميزات
- رفع/تحميل الملفات
- إنشاء روابط عامة
- روابط موقعة (محدودة الوقت)
- تحويل الصور
- سياسات الوصول

## Buckets
حاويات لتنظيم الملفات.

### أنواع Buckets
- **Public**: متاح للجميع
- **Private**: يحتاج مصادقة

## تحويل الصور
تغيير الحجم والجودة تلقائياً.
`,
    codeExample: `// ===== إنشاء Bucket (من Dashboard أو SQL) =====
// INSERT INTO storage.buckets (id, name, public)
// VALUES ('avatars', 'avatars', true);

// ===== رفع ملف =====
const file = event.target.files[0];

const { data, error } = await supabase.storage
  .from('avatars')
  .upload(\`user_\${userId}/avatar.png\`, file, {
    cacheControl: '3600',
    upsert: true // استبدال إذا موجود
  });

// ===== رفع من React Native =====
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('avatar.png', {
    uri: imageUri,
    type: 'image/png',
    name: 'avatar.png'
  });

// ===== الحصول على رابط عام =====
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user_123/avatar.png');
  
console.log(data.publicUrl);

// ===== رابط موقع (Signed URL) =====
// للملفات الخاصة - ينتهي بعد وقت محدد
const { data, error } = await supabase.storage
  .from('private-files')
  .createSignedUrl('document.pdf', 3600); // 1 ساعة

// ===== تحميل ملف =====
const { data, error } = await supabase.storage
  .from('avatars')
  .download('user_123/avatar.png');
  
// data هو Blob
const url = URL.createObjectURL(data);

// ===== حذف ملف =====
const { error } = await supabase.storage
  .from('avatars')
  .remove(['user_123/avatar.png', 'user_123/old.png']);

// ===== قائمة الملفات =====
const { data, error } = await supabase.storage
  .from('avatars')
  .list('user_123', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' }
  });

// ===== تحويل الصور =====
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('photo.jpg', {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover', // cover, contain, fill
      quality: 80
    }
  });`,
    language: 'javascript',
    xpReward: 180,
    order: 4,
    quiz: {
      question: 'ما الفرق بين Public و Private Bucket؟',
      options: [
        'لا يوجد فرق',
        'Public متاح للجميع، Private يحتاج مصادقة',
        'Public أسرع',
        'Private مجاني فقط',
      ],
      correctAnswer: 1,
      explanation:
        'Public Bucket يمكن الوصول لملفاته بدون مصادقة، بينما Private يتطلب token صالح',
    },
  },
  {
    id: 'supa-5',
    courseId: 'backend-supabase',
    title: 'Edge Functions',
    description: 'كود Serverless على Supabase',
    content: `
# Supabase Edge Functions

دوال Serverless تعمل على Deno.

## متى نستخدمها؟
- منطق معقد على الخادم
- التكامل مع APIs خارجية
- معالجة Webhooks
- إرسال الإيميلات
- المهام المجدولة

## المميزات
- TypeScript/JavaScript
- Deno runtime (آمن)
- Cold starts سريع
- Global edge network

## الإعداد

\`\`\`bash
# تثبيت Supabase CLI
npm install -g supabase

# إنشاء function
supabase functions new hello-world

# التشغيل محلياً
supabase functions serve

# النشر
supabase functions deploy hello-world
\`\`\`
`,
    codeExample: `// ===== supabase/functions/hello-world/index.ts =====
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // قراءة الجسم
  const { name } = await req.json();
  
  const data = {
    message: \`مرحباً \${name}!\`,
  };

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// ===== Function مع Supabase Client =====
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // الحصول على المستخدم من الـ Token
  const authHeader = req.headers.get('Authorization')!;
  const { data: { user } } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  // استخدام قاعدة البيانات
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id);

  return new Response(JSON.stringify({ user, data }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// ===== إرسال إيميل =====
import { SMTPClient } from 'https://deno.land/x/denomailer/mod.ts';

serve(async (req) => {
  const { to, subject, body } = await req.json();
  
  const client = new SMTPClient({
    connection: {
      hostname: Deno.env.get('SMTP_HOST')!,
      port: 587,
      tls: true,
      auth: {
        username: Deno.env.get('SMTP_USER')!,
        password: Deno.env.get('SMTP_PASS')!,
      },
    },
  });

  await client.send({
    from: 'app@example.com',
    to,
    subject,
    html: body,
  });

  return new Response(JSON.stringify({ success: true }));
});

// ===== استدعاء Function من التطبيق =====
const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'أحمد' },
});

console.log(data.message); // مرحباً أحمد!`,
    language: 'typescript',
    xpReward: 200,
    order: 5,
    quiz: {
      question: 'ما هي بيئة التشغيل التي تستخدمها Edge Functions؟',
      options: ['Node.js', 'Deno', 'Bun', 'Python'],
      correctAnswer: 1,
      explanation:
        'Supabase Edge Functions تعمل على Deno runtime الذي يوفر أماناً أفضل ويدعم TypeScript مباشرة',
    },
  },
  {
    id: 'supa-6',
    courseId: 'backend-supabase',
    title: 'استعلامات متقدمة',
    description: 'فلاتر معقدة و Relations و RPC',
    content: `
# استعلامات Supabase المتقدمة

## الفلاتر المتقدمة

### المقارنات
- eq, neq: يساوي، لا يساوي
- gt, gte, lt, lte: أكبر، أصغر
- like, ilike: نص (ilike = case insensitive)
- in: ضمن قائمة
- is: للـ null

### المنطقية
- or: أو
- and: و (افتراضي)
- not: نفي

## Relations (العلاقات)
جلب بيانات من جداول مرتبطة.

## RPC (دوال PostgreSQL)
استدعاء دوال SQL مخصصة.
`,
    codeExample: `// ===== فلاتر متقدمة =====
// أكبر من
const { data } = await supabase
  .from('products')
  .select()
  .gt('price', 100);

// بين قيمتين
const { data } = await supabase
  .from('products')
  .select()
  .gte('price', 50)
  .lte('price', 200);

// يحتوي على نص
const { data } = await supabase
  .from('products')
  .select()
  .ilike('name', '%هاتف%');

// ضمن قائمة
const { data } = await supabase
  .from('products')
  .select()
  .in('category', ['electronics', 'phones']);

// OR condition
const { data } = await supabase
  .from('products')
  .select()
  .or('price.lt.50,featured.eq.true');

// ===== Relations =====
// جلب المستخدم مع منشوراته
const { data } = await supabase
  .from('users')
  .select(\`
    id,
    name,
    posts (
      id,
      title,
      created_at
    )
  \`)
  .eq('id', 1);

// جلب المنشور مع الكاتب والتعليقات
const { data } = await supabase
  .from('posts')
  .select(\`
    id,
    title,
    content,
    author:users (
      id,
      name,
      avatar_url
    ),
    comments (
      id,
      content,
      user:users (name)
    )
  \`)
  .eq('id', postId);

// ===== RPC - دوال مخصصة =====
// في SQL Editor:
/*
CREATE OR REPLACE FUNCTION search_products(search_term text)
RETURNS SETOF products AS $$
  SELECT * FROM products
  WHERE name ILIKE '%' || search_term || '%'
     OR description ILIKE '%' || search_term || '%'
  ORDER BY created_at DESC;
$$ LANGUAGE sql;
*/

// استدعاء الدالة
const { data } = await supabase
  .rpc('search_products', { search_term: 'هاتف' });

// دالة مع COUNT
/*
CREATE OR REPLACE FUNCTION get_user_stats(user_id uuid)
RETURNS json AS $$
  SELECT json_build_object(
    'posts_count', (SELECT COUNT(*) FROM posts WHERE author_id = user_id),
    'comments_count', (SELECT COUNT(*) FROM comments WHERE user_id = user_id),
    'likes_received', (SELECT COUNT(*) FROM likes l 
                       JOIN posts p ON l.post_id = p.id 
                       WHERE p.author_id = user_id)
  );
$$ LANGUAGE sql;
*/

const { data } = await supabase.rpc('get_user_stats', { 
  user_id: '123e4567-e89b-12d3-a456-426614174000' 
});

// ===== Pagination =====
const pageSize = 10;
const page = 1;

const { data, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .range((page - 1) * pageSize, page * pageSize - 1)
  .order('created_at', { ascending: false });

console.log(\`الصفحة \${page} من \${Math.ceil(count / pageSize)}\`);`,
    language: 'javascript',
    xpReward: 190,
    order: 6,
    quiz: {
      question: 'ما هي طريقة استدعاء دوال PostgreSQL المخصصة من Supabase؟',
      options: [
        'supabase.call()',
        'supabase.rpc()',
        'supabase.exec()',
        'supabase.function()',
      ],
      correctAnswer: 1,
      explanation:
        'supabase.rpc() تستدعي الدوال المخصصة (Remote Procedure Calls) المعرّفة في PostgreSQL',
    },
  },
];

// ===== دروس Firebase =====
export const FIREBASE_LESSONS: Lesson[] = [
  {
    id: 'firebase-1',
    courseId: 'backend-firebase',
    title: 'مقدمة في Firebase',
    description: 'منصة Google للتطوير السريع',
    content: `
# Firebase

منصة من Google لبناء التطبيقات بسرعة.

## خدمات Firebase

### 1. Firestore
قاعدة بيانات NoSQL

### 2. Authentication
نظام مصادقة كامل

### 3. Storage
تخزين الملفات

### 4. Cloud Functions
دوال خادم بدون خادم

### 5. Hosting
استضافة مجانية

## لماذا Firebase؟
- سرعة التطوير
- Scaling تلقائي
- خطة مجانية جيدة
- تكامل مع Google
`,
    codeExample: `// تثبيت Firebase
// npm install firebase

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

// إعداد Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== قراءة البيانات =====
const querySnapshot = await getDocs(collection(db, 'users'));
querySnapshot.forEach((doc) => {
  console.log(doc.id, '=>', doc.data());
});

// ===== إضافة بيانات =====
const docRef = await addDoc(collection(db, 'users'), {
  name: 'أحمد',
  email: 'ahmed@mail.com',
  createdAt: new Date()
});
console.log('Document ID:', docRef.id);`,
    language: 'javascript',
    xpReward: 180,
    order: 1,
    quiz: {
      question: 'ما نوع قاعدة البيانات في Firestore؟',
      options: ['SQL', 'NoSQL', 'Graph', 'Key-Value فقط'],
      correctAnswer: 1,
      explanation: 'Firestore هي قاعدة بيانات NoSQL document-based',
    },
  },
  {
    id: 'firebase-2',
    courseId: 'backend-firebase',
    title: 'Firestore CRUD',
    description: 'العمليات الأساسية على Firestore',
    content: `
# Firestore Operations

## هيكل البيانات
- Collections: مجموعات من Documents
- Documents: كائنات JSON
- Subcollections: مجموعات فرعية

## العمليات
- إضافة (add/set)
- قراءة (get/getDocs)
- تحديث (update)
- حذف (delete)
- استعلام (query)
`,
    codeExample: `import { 
  collection, doc, 
  getDoc, getDocs, 
  addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit 
} from 'firebase/firestore';

// ===== إضافة document =====
// مع ID تلقائي
const docRef = await addDoc(collection(db, 'users'), {
  name: 'أحمد',
  age: 25
});

// مع ID محدد
await setDoc(doc(db, 'users', 'user123'), {
  name: 'سارة',
  age: 22
});

// ===== قراءة document واحد =====
const docSnap = await getDoc(doc(db, 'users', 'user123'));
if (docSnap.exists()) {
  console.log(docSnap.data());
}

// ===== قراءة collection =====
const querySnapshot = await getDocs(collection(db, 'users'));
const users = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

// ===== استعلام مع فلترة =====
const q = query(
  collection(db, 'users'),
  where('age', '>=', 18),
  orderBy('age', 'desc'),
  limit(10)
);
const results = await getDocs(q);

// ===== تحديث =====
await updateDoc(doc(db, 'users', 'user123'), {
  age: 23
});

// ===== حذف =====
await deleteDoc(doc(db, 'users', 'user123'));`,
    language: 'javascript',
    xpReward: 180,
    order: 2,
    quiz: {
      question: 'ما الفرق بين addDoc و setDoc؟',
      options: [
        'لا فرق',
        'addDoc ينشئ ID تلقائي، setDoc تحدد ID',
        'setDoc أسرع',
        'addDoc للتحديث فقط',
      ],
      correctAnswer: 1,
      explanation:
        'addDoc ينشئ document بـ ID عشوائي، setDoc تحدد الـ ID بنفسك',
    },
  },
  {
    id: 'firebase-3',
    courseId: 'backend-firebase',
    title: 'Firebase Authentication',
    description: 'نظام تسجيل الدخول والمصادقة',
    content: `
# Firebase Authentication

نظام مصادقة كامل وآمن من Google.

## طرق المصادقة المدعومة

### 1. البريد وكلمة المرور
أبسط طريقة للتسجيل.

### 2. Google Sign-In
تسجيل بحساب Google.

### 3. Facebook
تسجيل بحساب Facebook.

### 4. Phone Number
رسالة SMS للتحقق.

### 5. Anonymous
تسجيل مجهول الهوية.

## مميزات Firebase Auth
- تشفير آمن
- إدارة الجلسات تلقائياً
- استعادة كلمة المرور
- التحقق من البريد
- ربط حسابات متعددة
`,
    codeExample: `import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';

const auth = getAuth();

// ===== إنشاء حساب جديد =====
async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, email, password
    );
    console.log('تم إنشاء الحساب:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('خطأ:', error.message);
    throw error;
  }
}

// ===== تسجيل الدخول =====
async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, email, password
    );
    return userCredential.user;
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error.message);
    throw error;
  }
}

// ===== تسجيل الخروج =====
async function logout() {
  await signOut(auth);
  console.log('تم تسجيل الخروج');
}

// ===== تسجيل بـ Google =====
async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// ===== مراقبة حالة المستخدم =====
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});

// ===== إعادة تعيين كلمة المرور =====
async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
  console.log('تم إرسال رابط إعادة التعيين');
}`,
    language: 'javascript',
    xpReward: 200,
    order: 3,
    quiz: {
      question: 'ما وظيفة onAuthStateChanged؟',
      options: [
        'إنشاء حساب جديد',
        'مراقبة تغيرات حالة تسجيل الدخول',
        'تسجيل الخروج',
        'تشفير كلمة المرور',
      ],
      correctAnswer: 1,
      explanation:
        'onAuthStateChanged يُراقب التغيرات في حالة المصادقة ويُنفذ callback عند تسجيل دخول أو خروج المستخدم',
    },
  },
  {
    id: 'firebase-4',
    courseId: 'backend-firebase',
    title: 'Firebase Storage',
    description: 'رفع وإدارة الملفات',
    content: `
# Firebase Storage

تخزين الملفات في السحابة.

## استخدامات Storage
- صور المستخدمين
- ملفات PDF
- فيديوهات
- أي نوع من الملفات

## الميزات
- CDN سريع عالمياً
- تأمين بقواعد الأمان
- Resumable uploads
- تتبع التقدم

## هيكل التخزين
\`\`\`
storage/
├── users/
│   ├── user1/
│   │   └── avatar.jpg
│   └── user2/
│       └── avatar.png
└── posts/
    ├── post1/
    │   └── image.jpg
    └── post2/
        └── video.mp4
\`\`\`
`,
    codeExample: `import { 
  getStorage, 
  ref, 
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';

const storage = getStorage();

// ===== رفع ملف بسيط =====
async function uploadFile(file, path) {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}

// ===== رفع مع تتبع التقدم =====
function uploadWithProgress(file, path, onProgress) {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

// ===== استخدام مع input file =====
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const userId = 'user123';
  const path = \`users/\${userId}/avatar.jpg\`;
  
  const url = await uploadWithProgress(file, path, (progress) => {
    console.log(\`تم رفع: \${progress.toFixed(0)}%\`);
  });
  
  console.log('رابط الملف:', url);
});

// ===== حذف ملف =====
async function deleteFile(path) {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
}

// ===== قائمة الملفات =====
async function listFiles(path) {
  const listRef = ref(storage, path);
  const result = await listAll(listRef);
  return result.items.map(item => item.fullPath);
}`,
    language: 'javascript',
    xpReward: 180,
    order: 4,
    quiz: {
      question: 'ما الدالة المستخدمة للحصول على رابط الملف المرفوع؟',
      options: ['uploadBytes', 'ref', 'getDownloadURL', 'listAll'],
      correctAnswer: 2,
      explanation: 'getDownloadURL تُرجع رابط URL للوصول للملف المرفوع',
    },
  },
  {
    id: 'firebase-5',
    courseId: 'backend-firebase',
    title: 'قواعد الأمان في Firebase',
    description: 'حماية بياناتك وملفاتك',
    content: `
# Firebase Security Rules

قواعد لحماية Firestore و Storage.

## لماذا قواعد الأمان؟
- منع الوصول غير المصرح
- التحقق من البيانات
- تحديد الصلاحيات

## صيغة القواعد
\`\`\`
match /path {
  allow action: if condition;
}
\`\`\`

## Actions (الإجراءات)
- **read**: قراءة (get, list)
- **write**: كتابة (create, update, delete)
- أو محددة: get, list, create, update, delete

## شروط شائعة
- \`request.auth != null\` - مسجل دخول
- \`request.auth.uid == userId\` - المالك
- \`resource.data.public == true\` - بيانات عامة
`,
    codeExample: `// ===== قواعد Firestore =====
// firebase.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // دالة مساعدة: هل المستخدم مسجل؟
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // دالة مساعدة: هل المستخدم هو المالك؟
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // ===== قواعد المستخدمين =====
    match /users/{userId} {
      // القراءة: للمالك فقط
      allow read: if isOwner(userId);
      
      // الإنشاء: لأي مستخدم مسجل
      allow create: if isAuthenticated();
      
      // التحديث: للمالك فقط
      allow update: if isOwner(userId);
      
      // الحذف: ممنوع
      allow delete: if false;
    }
    
    // ===== قواعد المنشورات =====
    match /posts/{postId} {
      // القراءة: للجميع إذا منشور عام
      allow read: if resource.data.public == true 
                    || isOwner(resource.data.authorId);
      
      // الإنشاء: للمسجلين مع بيانات صحيحة
      allow create: if isAuthenticated()
                    && request.resource.data.authorId == request.auth.uid
                    && request.resource.data.title.size() > 0
                    && request.resource.data.title.size() <= 100;
      
      // التحديث: للمالك فقط
      allow update: if isOwner(resource.data.authorId);
      
      // الحذف: للمالك فقط
      allow delete: if isOwner(resource.data.authorId);
    }
  }
}

// ===== قواعد Storage =====
// storage.rules

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // ملفات المستخدمين
    match /users/{userId}/{allPaths=**} {
      // القراءة: للجميع
      allow read;
      
      // الكتابة: للمالك فقط
      allow write: if request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024  // 5MB max
                   && request.resource.contentType.matches('image/.*');
    }
    
    // ملفات عامة
    match /public/{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}`,
    language: 'javascript',
    xpReward: 200,
    order: 5,
    quiz: {
      question: 'ما القاعدة التي تسمح بالقراءة فقط للمستخدم المسجل؟',
      options: [
        'allow read: if true',
        'allow read: if request.auth != null',
        'allow read: if false',
        'allow write: if request.auth != null',
      ],
      correctAnswer: 1,
      explanation: 'request.auth != null تتحقق من أن المستخدم مسجل الدخول',
    },
  },
];

// ===== دروس REST API =====
export const REST_API_LESSONS: Lesson[] = [
  {
    id: 'rest-1',
    courseId: 'backend-rest-api',
    title: 'مبادئ REST API',
    description: 'فهم تصميم واجهات برمجة التطبيقات',
    content: `
# مبادئ REST API

REST = Representational State Transfer

## ما هو REST؟
نمط تصميم لبناء APIs قابلة للتطوير والصيانة.

## المبادئ الأساسية

### 1. Stateless (عديم الحالة)
كل طلب مستقل ويحتوي كل المعلومات المطلوبة.

### 2. Client-Server
فصل واضح بين العميل والخادم.

### 3. Uniform Interface
واجهة موحدة ومتسقة.

### 4. Cacheable
إمكانية التخزين المؤقت للاستجابات.

## HTTP Methods

| Method | الوظيفة | مثال |
|--------|---------|------|
| GET | قراءة | جلب مستخدم |
| POST | إنشاء | إضافة مستخدم |
| PUT | تحديث كامل | تعديل كل بيانات المستخدم |
| PATCH | تحديث جزئي | تعديل الاسم فقط |
| DELETE | حذف | حذف مستخدم |

## Response Codes

| Code | المعنى |
|------|--------|
| 200 | OK - نجاح |
| 201 | Created - تم الإنشاء |
| 204 | No Content - نجاح بدون محتوى |
| 400 | Bad Request - طلب خاطئ |
| 401 | Unauthorized - غير مصرح |
| 403 | Forbidden - ممنوع |
| 404 | Not Found - غير موجود |
| 500 | Server Error - خطأ الخادم |
`,
    codeExample: `// مثال على تصميم REST API جيد
const express = require('express');
const app = express();
app.use(express.json());

// ===== GET - جلب الموارد =====
// جلب كل المستخدمين
app.get('/api/users', (req, res) => {
  res.json({ success: true, data: users });
});

// جلب مستخدم واحد
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      error: 'المستخدم غير موجود' 
    });
  }
  res.json({ success: true, data: user });
});

// ===== POST - إنشاء مورد =====
app.post('/api/users', (req, res) => {
  const newUser = {
    id: generateId(),
    ...req.body,
    createdAt: new Date()
  };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// ===== PUT - تحديث كامل =====
app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }
  users[index] = { id: req.params.id, ...req.body };
  res.json({ success: true, data: users[index] });
});

// ===== DELETE - حذف =====
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }
  users.splice(index, 1);
  res.status(204).send();
});`,
    language: 'javascript',
    xpReward: 180,
    order: 1,
    quiz: {
      question: 'ما الـ HTTP Method المستخدم لإنشاء مورد جديد؟',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correctAnswer: 1,
      explanation: 'POST يستخدم لإنشاء موارد جديدة على الخادم',
    },
  },
  {
    id: 'rest-2',
    courseId: 'backend-rest-api',
    title: 'تصميم Routes',
    description: 'أفضل ممارسات تسمية المسارات',
    content: `
# تصميم Routes

## أفضل الممارسات

### 1. استخدم الأسماء وليس الأفعال
✅ \`/users\` 
❌ \`/getUsers\`

### 2. استخدم الجمع
✅ \`/users\`
❌ \`/user\`

### 3. الموارد المتداخلة
\`\`\`
/users/:userId/posts
/posts/:postId/comments
\`\`\`

### 4. Query Parameters للفلترة
\`\`\`
/users?role=admin&status=active
/products?category=electronics&minPrice=100
\`\`\`

### 5. التنظيم بالـ Versions
\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

## هيكل API نموذجي

\`\`\`
/api/v1
├── /users
│   ├── GET /         (جلب الكل)
│   ├── POST /        (إنشاء)
│   ├── GET /:id      (جلب واحد)
│   ├── PUT /:id      (تحديث)
│   └── DELETE /:id   (حذف)
├── /posts
│   ├── GET /
│   ├── POST /
│   └── ...
└── /auth
    ├── POST /login
    ├── POST /register
    └── POST /logout
\`\`\`
`,
    codeExample: `const express = require('express');
const router = express.Router();

// ===== تنظيم الـ Routes في ملفات منفصلة =====

// routes/users.js
const usersRouter = express.Router();

usersRouter.get('/', getAllUsers);
usersRouter.get('/:id', getUserById);
usersRouter.post('/', createUser);
usersRouter.put('/:id', updateUser);
usersRouter.delete('/:id', deleteUser);

// موارد متداخلة - منشورات المستخدم
usersRouter.get('/:userId/posts', getUserPosts);
usersRouter.post('/:userId/posts', createUserPost);

module.exports = usersRouter;

// ===== app.js =====
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const authRouter = require('./routes/auth');

// تسجيل الـ Routes
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/auth', authRouter);

// ===== Query Parameters =====
app.get('/api/v1/products', (req, res) => {
  let results = products;
  
  // الفلترة
  if (req.query.category) {
    results = results.filter(p => p.category === req.query.category);
  }
  
  if (req.query.minPrice) {
    results = results.filter(p => p.price >= parseFloat(req.query.minPrice));
  }
  
  // الترتيب
  if (req.query.sortBy) {
    const [field, order] = req.query.sortBy.split(':');
    results.sort((a, b) => {
      if (order === 'desc') return b[field] - a[field];
      return a[field] - b[field];
    });
  }
  
  res.json({ success: true, data: results, count: results.length });
});`,
    language: 'javascript',
    xpReward: 160,
    order: 2,
    quiz: {
      question: 'أي من الآتي تسمية صحيحة لـ REST endpoint؟',
      options: ['/getUsers', '/user', '/users', '/fetchAllUsers'],
      correctAnswer: 2,
      explanation: 'استخدم الأسماء بصيغة الجمع: /users وليس الأفعال',
    },
  },
  {
    id: 'rest-3',
    courseId: 'backend-rest-api',
    title: 'Request و Response',
    description: 'التعامل مع الطلبات والاستجابات',
    content: `
# Request و Response

## Request Object

### req.params
المعاملات في الـ URL
\`\`\`
GET /users/:id
req.params.id
\`\`\`

### req.query
Query string parameters
\`\`\`
GET /users?page=2&limit=10
req.query.page, req.query.limit
\`\`\`

### req.body
بيانات الـ POST/PUT
\`\`\`javascript
app.use(express.json());
req.body.name, req.body.email
\`\`\`

### req.headers
رؤوس الطلب
\`\`\`
req.headers.authorization
req.headers['content-type']
\`\`\`

## Response Methods

| Method | الاستخدام |
|--------|-----------|
| res.json() | إرجاع JSON |
| res.send() | إرجاع نص أو buffer |
| res.status() | تعيين status code |
| res.redirect() | إعادة توجيه |
| res.render() | عرض template |
`,
    codeExample: `const express = require('express');
const app = express();
app.use(express.json());

// ===== Request Examples =====
app.get('/api/users/:id', (req, res) => {
  // URL: /api/users/123?fields=name,email
  
  console.log('URL Params:', req.params);     // { id: '123' }
  console.log('Query:', req.query);           // { fields: 'name,email' }
  console.log('Headers:', req.headers);       // Authorization, Content-Type, etc.
  console.log('Method:', req.method);         // GET
  console.log('Path:', req.path);             // /api/users/123
});

app.post('/api/users', (req, res) => {
  console.log('Body:', req.body);             // { name: 'أحمد', email: '...' }
});

// ===== Response Examples =====

// JSON Response
app.get('/api/data', (req, res) => {
  res.json({
    success: true,
    data: { message: 'مرحباً' }
  });
});

// Status + JSON
app.post('/api/users', (req, res) => {
  const user = createUser(req.body);
  res.status(201).json({
    success: true,
    data: user
  });
});

// Error Response
app.get('/api/users/:id', (req, res) => {
  const user = findUser(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'المستخدم غير موجود'
      }
    });
  }
  res.json({ success: true, data: user });
});

// Response Headers
app.get('/api/download', (req, res) => {
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename=file.pdf'
  });
  res.send(fileBuffer);
});

// Redirect
app.get('/old-route', (req, res) => {
  res.redirect(301, '/new-route');
});`,
    language: 'javascript',
    xpReward: 170,
    order: 3,
    quiz: {
      question: 'كيف نحصل على البيانات المرسلة في body الطلب؟',
      options: ['req.params', 'req.query', 'req.body', 'req.data'],
      correctAnswer: 2,
      explanation:
        'req.body يحتوي على البيانات المرسلة في جسم الطلب (POST/PUT)',
    },
  },
  {
    id: 'rest-4',
    courseId: 'backend-rest-api',
    title: 'Middleware في Express',
    description: 'فهم واستخدام الـ Middleware',
    content: `
# Middleware

الـ Middleware = دالة تُنفَّذ بين الطلب والاستجابة.

## كيف يعمل؟

\`\`\`
Request → Middleware 1 → Middleware 2 → Route Handler → Response
\`\`\`

## أنواع Middleware

### 1. Application-level
يُطبَّق على كل الطلبات

### 2. Router-level
يُطبَّق على routes محددة

### 3. Error-handling
للتعامل مع الأخطاء

### 4. Built-in
مدمج مع Express

### 5. Third-party
من مكتبات خارجية

## الـ next()
استدعاء next() للانتقال للـ middleware التالي.
`,
    codeExample: `const express = require('express');
const app = express();

// ===== Built-in Middleware =====
app.use(express.json());                 // Parse JSON
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded
app.use(express.static('public'));       // Serve static files

// ===== Custom Middleware =====

// Logger middleware
const logger = (req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path}\`);
  next();  // الانتقال للـ middleware التالي
};

app.use(logger);

// Request time middleware
app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});

// ===== Route-specific Middleware =====
const checkAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  // verify token...
  req.user = decodedUser;
  next();
};

// تطبيق على route محدد
app.get('/api/profile', checkAuth, (req, res) => {
  res.json({ user: req.user });
});

// تطبيق على مجموعة routes
app.use('/api/admin', checkAuth, adminRouter);

// ===== Error Handling Middleware =====
// يجب أن يكون آخر middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'خطأ في الخادم',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// ===== Async Middleware Helper =====
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));`,
    language: 'javascript',
    xpReward: 180,
    order: 4,
    quiz: {
      question: 'ما وظيفة next() في Middleware؟',
      options: [
        'إنهاء الطلب',
        'الانتقال للـ middleware التالي',
        'إرجاع خطأ',
        'إعادة الطلب',
      ],
      correctAnswer: 1,
      explanation: 'next() ينقل التحكم للـ middleware أو route handler التالي',
    },
  },
  {
    id: 'rest-5',
    courseId: 'backend-rest-api',
    title: 'التحقق من البيانات Validation',
    description: 'التأكد من صحة بيانات الطلب',
    content: `
# Validation - التحقق من البيانات

التحقق من صحة البيانات قبل معالجتها.

## لماذا Validation؟
- منع البيانات الخاطئة
- حماية من الهجمات
- تجربة مستخدم أفضل

## أنواع التحقق

### 1. التحقق اليدوي
كتابة الشروط بنفسك

### 2. مكتبات التحقق
- express-validator
- Joi
- Yup
- Zod

## أخطاء التحقق الشائعة
- الحقول المطلوبة
- تنسيق البريد الإلكتروني
- طول النص
- نوع البيانات
- النطاقات (min/max)
`,
    codeExample: `// ===== تثبيت express-validator =====
// npm install express-validator

const { body, param, query, validationResult } = require('express-validator');

// ===== Validation Middleware =====
const validateUser = [
  body('name')
    .trim()
    .notEmpty().withMessage('الاسم مطلوب')
    .isLength({ min: 2, max: 50 }).withMessage('الاسم يجب أن يكون 2-50 حرف'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('البريد مطلوب')
    .isEmail().withMessage('بريد إلكتروني غير صالح')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('كلمة المرور مطلوبة')
    .isLength({ min: 8 }).withMessage('كلمة المرور 8 أحرف على الأقل')
    .matches(/\\d/).withMessage('يجب أن تحتوي على رقم')
    .matches(/[A-Z]/).withMessage('يجب أن تحتوي على حرف كبير'),
  
  body('age')
    .optional()
    .isInt({ min: 1, max: 120 }).withMessage('عمر غير صالح'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator']).withMessage('دور غير صالح'),
];

// ===== Handle Validation Errors =====
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// ===== استخدام في Route =====
app.post('/api/users', validateUser, handleValidation, async (req, res) => {
  // البيانات صالحة هنا
  const user = await createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

// ===== Joi Alternative =====
const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  age: Joi.number().integer().min(1).max(120)
});

const validateWithJoi = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map(d => ({ message: d.message }))
    });
  }
  next();
};

app.post('/api/users', validateWithJoi(userSchema), createUser);`,
    language: 'javascript',
    xpReward: 180,
    order: 5,
    quiz: {
      question: 'لماذا نحتاج التحقق من البيانات على الخادم؟',
      options: [
        'للسرعة فقط',
        'للحماية ومنع البيانات الخاطئة',
        'غير ضروري إذا تحققنا في الـ frontend',
        'لتوفير المساحة',
      ],
      correctAnswer: 1,
      explanation: 'التحقق على الخادم ضروري لأن الـ frontend يمكن تجاوزه',
    },
  },
  {
    id: 'rest-6',
    courseId: 'backend-rest-api',
    title: 'معالجة الأخطاء Error Handling',
    description: 'إدارة الأخطاء بشكل احترافي',
    content: `
# Error Handling

التعامل مع الأخطاء بطريقة موحدة واحترافية.

## أنواع الأخطاء

### 1. Operational Errors
أخطاء متوقعة (input خاطئ، مورد غير موجود)

### 2. Programming Errors
أخطاء برمجية (bugs)

## استراتيجية التعامل

1. استخدام Custom Error Classes
2. Global Error Handler
3. تسجيل الأخطاء (Logging)
4. إخفاء التفاصيل في Production

## Best Practices
- إرجاع رسائل مفيدة
- استخدام Status Codes صحيحة
- تسجيل الأخطاء للتحليل
- عدم تسريب معلومات حساسة
`,
    codeExample: `// ===== Custom Error Class =====
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = \`\${statusCode}\`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(\`\${resource} غير موجود\`, 404);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'غير مصرح') {
    super(message, 401);
  }
}

// ===== Async Handler =====
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ===== Usage in Routes =====
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('المستخدم');
  }
  res.json({ success: true, data: user });
}));

// ===== Global Error Handler =====
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // تسجيل الخطأ
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  if (process.env.NODE_ENV === 'development') {
    // Development: إرجاع كل التفاصيل
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        stack: err.stack,
        status: err.status
      }
    });
  } else {
    // Production: إخفاء التفاصيل
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        error: { message: err.message }
      });
    } else {
      // Programming error
      res.status(500).json({
        success: false,
        error: { message: 'حدث خطأ ما!' }
      });
    }
  }
};

// ===== 404 Handler =====
app.all('*', (req, res, next) => {
  next(new NotFoundError(\`الـ Route \${req.originalUrl}\`));
});

app.use(errorHandler);`,
    language: 'javascript',
    xpReward: 190,
    order: 6,
    quiz: {
      question: 'لماذا نخفي تفاصيل الأخطاء في Production؟',
      options: [
        'للسرعة',
        'لتوفير المساحة',
        'لعدم تسريب معلومات حساسة للمهاجمين',
        'غير مهم',
      ],
      correctAnswer: 2,
      explanation: 'تفاصيل الأخطاء قد تكشف معلومات عن النظام يستغلها المهاجمون',
    },
  },
  {
    id: 'rest-7',
    courseId: 'backend-rest-api',
    title: 'Pagination و Filtering',
    description: 'تصفح البيانات الكبيرة',
    content: `
# Pagination و Filtering

التعامل مع كميات كبيرة من البيانات.

## لماذا Pagination؟
- تحسين الأداء
- تقليل استهلاك الذاكرة
- تجربة مستخدم أفضل

## أنواع Pagination

### 1. Offset-based
\`?page=2&limit=10\`
بسيط لكن مشاكل مع البيانات المتغيرة

### 2. Cursor-based
\`?cursor=abc123&limit=10\`
أفضل للـ real-time والبيانات الكبيرة

## Query Parameters شائعة
- page, limit (pagination)
- sort, order (sorting)
- fields (field selection)
- filter fields (filtering)
- search (text search)
`,
    codeExample: `// ===== Advanced API Features =====
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  
  // Filtering
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);
    
    // Advanced filtering: price[gte]=100 => price: { $gte: 100 }
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\\b(gte|gt|lte|lt)\\b/g, match => \`$\${match}\`);
    
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  
  // Sorting
  sort() {
    if (this.queryString.sort) {
      // sort=price,-rating => 'price -rating'
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  
  // Field Selection
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  
  // Pagination
  paginate() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;
    
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

// ===== Usage =====
app.get('/api/products', asyncHandler(async (req, res) => {
  // GET /api/products?price[gte]=100&sort=-price&fields=name,price&page=2&limit=10
  
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const products = await features.query;
  
  // Pagination info
  const total = await Product.countDocuments();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  res.json({
    success: true,
    results: products.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    data: products
  });
}));`,
    language: 'javascript',
    xpReward: 200,
    order: 7,
    quiz: {
      question: 'ما فائدة Cursor-based pagination على Offset-based؟',
      options: [
        'أبسط في الكتابة',
        'أفضل للبيانات المتغيرة والكبيرة',
        'لا فرق بينهما',
        'أبطأ لكن أدق',
      ],
      correctAnswer: 1,
      explanation: 'Cursor-based يتجنب مشكلة تكرار/فقدان البيانات عند تغيرها',
    },
  },
  {
    id: 'rest-8',
    courseId: 'backend-rest-api',
    title: 'File Upload',
    description: 'رفع الملفات والصور',
    content: `
# رفع الملفات

التعامل مع رفع الملفات في REST API.

## Multer
المكتبة الأشهر لرفع الملفات في Express.

## أنواع التخزين

### 1. Disk Storage
حفظ على القرص المحلي

### 2. Memory Storage
حفظ في الذاكرة (للمعالجة)

### 3. Cloud Storage
S3, Cloudinary, Firebase Storage

## اعتبارات أمنية
- التحقق من نوع الملف
- تحديد الحجم الأقصى
- إعادة تسمية الملفات
- فحص الملفات من الفيروسات
`,
    codeExample: `// npm install multer

const multer = require('multer');
const path = require('path');

// ===== Disk Storage =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // unique filename: user-123-1699999999.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, \`user-\${req.user.id}-\${uniqueSuffix}\${ext}\`);
  }
});

// ===== File Filter =====
const fileFilter = (req, file, cb) => {
  // قبول الصور فقط
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('يرجى رفع صورة فقط'), false);
  }
};

// ===== Multer Configuration =====
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB max
  }
});

// ===== Single File Upload =====
app.post('/api/upload/avatar', 
  upload.single('avatar'),  // 'avatar' = field name
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم رفع ملف' });
    }
    
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  }
);

// ===== Multiple Files =====
app.post('/api/upload/photos',
  upload.array('photos', 5),  // max 5 files
  (req, res) => {
    res.json({
      success: true,
      files: req.files.map(f => ({
        filename: f.filename,
        size: f.size
      }))
    });
  }
);

// ===== Mixed Fields =====
const uploadFields = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 5 }
]);

app.post('/api/upload/profile', uploadFields, (req, res) => {
  const avatar = req.files['avatar'][0];
  const gallery = req.files['gallery'];
  // ...
});

// ===== Error Handling =====
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'الملف كبير جداً (الحد 5MB)' });
    }
  }
  next(err);
});`,
    language: 'javascript',
    xpReward: 190,
    order: 8,
    quiz: {
      question: 'لماذا نعيد تسمية الملفات المرفوعة؟',
      options: [
        'لتوفير المساحة',
        'للأمان ومنع التعارضات',
        'للسرعة',
        'غير ضروري',
      ],
      correctAnswer: 1,
      explanation: 'إعادة التسمية تمنع تعارض الأسماء وتخفي الاسم الأصلي للأمان',
    },
  },
];

// ===== دروس Authentication =====
export const AUTH_LESSONS: Lesson[] = [
  {
    id: 'auth-1',
    courseId: 'backend-auth',
    title: 'مقدمة في Authentication',
    description: 'فهم أساسيات المصادقة',
    content: `
# Authentication - المصادقة

المصادقة = التحقق من هوية المستخدم.

## Authentication vs Authorization

### Authentication (من أنت؟)
إثبات هوية المستخدم

### Authorization (ما صلاحياتك؟)
ما يُسمح للمستخدم فعله

## طرق المصادقة

### 1. Session-based
- الخادم يحفظ الجلسة
- Cookie للمتصفح
- Stateful

### 2. Token-based (JWT)
- Token يحتوي البيانات
- Stateless
- مناسب للـ APIs

### 3. OAuth
- تسجيل دخول بحسابات أخرى
- Google, Facebook, GitHub

## مقارنة

| الميزة | Session | JWT |
|--------|---------|-----|
| التخزين | الخادم | العميل |
| Scalability | صعب | سهل |
| Mobile | غير مثالي | مثالي |
| الإلغاء | سهل | صعب |
`,
    codeExample: `// ===== Session-based Authentication =====
const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000  // 1 day
  }
}));

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user || !await user.comparePassword(password)) {
    return res.status(401).json({ error: 'بيانات خاطئة' });
  }
  
  // حفظ في الجلسة
  req.session.userId = user._id;
  req.session.role = user.role;
  
  res.json({ success: true, user: { name: user.name } });
});

// Protected Route
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'يجب تسجيل الدخول' });
  }
  next();
};

app.get('/profile', requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.json(user);
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'خطأ في تسجيل الخروج' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});`,
    language: 'javascript',
    xpReward: 180,
    order: 1,
    quiz: {
      question: 'ما الفرق بين Authentication و Authorization؟',
      options: [
        'لا فرق',
        'Authentication = من أنت، Authorization = ما صلاحياتك',
        'Authorization = من أنت، Authentication = ما صلاحياتك',
        'كلاهما للتحقق من كلمة المرور',
      ],
      correctAnswer: 1,
      explanation: 'Authentication للتحقق من الهوية، Authorization للصلاحيات',
    },
  },
  {
    id: 'auth-2',
    courseId: 'backend-auth',
    title: 'JWT Authentication',
    description: 'المصادقة باستخدام JSON Web Tokens',
    content: `
# JWT - JSON Web Token

Token يحتوي معلومات المستخدم بشكل مشفر.

## هيكل JWT

\`\`\`
Header.Payload.Signature
\`\`\`

### Header
نوع الـ Token والخوارزمية
\`\`\`json
{ "alg": "HS256", "typ": "JWT" }
\`\`\`

### Payload
البيانات (Claims)
\`\`\`json
{ "userId": "123", "role": "admin", "exp": 1699999999 }
\`\`\`

### Signature
التوقيع للتحقق من الصحة

## مميزات JWT
- Stateless
- Self-contained
- مناسب للـ Microservices
- سهل للـ Mobile apps

## تحذيرات
- لا تخزن معلومات حساسة في Payload
- استخدم HTTPS
- حدد وقت انتهاء قصير
`,
    codeExample: `// npm install jsonwebtoken bcryptjs

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

// ===== Generate Token =====
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// ===== Register =====
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  // التحقق من عدم وجود المستخدم
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'البريد مستخدم' });
  }
  
  // تشفير كلمة المرور
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // إنشاء المستخدم
  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });
  
  // إنشاء Token
  const token = generateToken(user);
  
  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
});

// ===== Login =====
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // البحث عن المستخدم
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ error: 'بيانات خاطئة' });
  }
  
  // التحقق من كلمة المرور
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'بيانات خاطئة' });
  }
  
  const token = generateToken(user);
  
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name }
  });
});

// ===== Auth Middleware =====
const protect = async (req, res, next) => {
  // 1. Get token
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ error: 'يجب تسجيل الدخول' });
  }
  
  // 2. Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token غير صالح' });
  }
};

// ===== Protected Route =====
app.get('/api/profile', protect, (req, res) => {
  res.json({ user: req.user });
});`,
    language: 'javascript',
    xpReward: 200,
    order: 2,
    quiz: {
      question: 'أين يُخزَّن الـ JWT عادةً؟',
      options: [
        'قاعدة البيانات فقط',
        'الخادم',
        'العميل (localStorage أو cookie)',
        'الذاكرة فقط',
      ],
      correctAnswer: 2,
      explanation: 'JWT يُخزَّن عند العميل ويُرسل مع كل طلب',
    },
  },
  {
    id: 'auth-3',
    courseId: 'backend-auth',
    title: 'Password Hashing',
    description: 'تشفير كلمات المرور بأمان',
    content: `
# تشفير كلمات المرور

لماذا لا نخزن كلمات المرور كنص؟

## المخاطر
- اختراق قاعدة البيانات
- الموظفين يرون الكلمات
- نفس الكلمة في مواقع أخرى

## Hashing vs Encryption

### Encryption (تشفير)
- يمكن فك التشفير
- مفتاح للتشفير وفك التشفير

### Hashing
- اتجاه واحد
- لا يمكن استرجاع الأصل
- نفس المدخل = نفس الـ Hash

## Bcrypt
خوارزمية مصممة لكلمات المرور.

### مميزاتها
- Salt تلقائي
- بطيئة عمداً (brute force صعب)
- Cost factor قابل للزيادة
`,
    codeExample: `const bcrypt = require('bcryptjs');

// ===== Hashing Password =====
const hashPassword = async (password) => {
  // Salt rounds: كلما زاد كلما كان أبطأ وأأمن
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

// ===== Comparing Passwords =====
const verifyPassword = async (inputPassword, hashedPassword) => {
  const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
  return isMatch;
};

// ===== Example Usage =====
async function demo() {
  const password = 'mySecretPassword123';
  
  // تشفير
  const hash = await hashPassword(password);
  console.log('Hash:', hash);
  // $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8...
  
  // التحقق - صحيح
  const isValid = await verifyPassword('mySecretPassword123', hash);
  console.log('Valid:', isValid);  // true
  
  // التحقق - خاطئ
  const isInvalid = await verifyPassword('wrongPassword', hash);
  console.log('Invalid:', isInvalid);  // false
}

// ===== In User Model (Mongoose) =====
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // فقط إذا تغيرت كلمة المرور
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// ===== Using in Auth =====
app.post('/register', async (req, res) => {
  // كلمة المرور ستُشفَّر تلقائياً في pre-save
  const user = await User.create({
    email: req.body.email,
    password: req.body.password
  });
  res.json({ success: true });
});

app.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  
  if (!user || !await user.comparePassword(req.body.password)) {
    return res.status(401).json({ error: 'بيانات خاطئة' });
  }
  
  const token = generateToken(user);
  res.json({ token });
});`,
    language: 'javascript',
    xpReward: 180,
    order: 3,
    quiz: {
      question: 'لماذا Bcrypt بطيء عمداً؟',
      options: [
        'خطأ في التصميم',
        'لجعل brute force attacks صعبة جداً',
        'لتوفير الموارد',
        'للتوافق مع الأنظمة القديمة',
      ],
      correctAnswer: 1,
      explanation: 'البطء المقصود يجعل تجربة ملايين كلمات المرور يستغرق سنوات',
    },
  },
  {
    id: 'auth-4',
    courseId: 'backend-auth',
    title: 'Protected Routes',
    description: 'حماية المسارات والصلاحيات',
    content: `
# Protected Routes & Authorization

## مستويات الحماية

### 1. Authentication
هل المستخدم مسجل دخول؟

### 2. Authorization
هل لديه صلاحية لهذا الإجراء؟

### 3. Ownership
هل يملك هذا المورد؟

## Role-Based Access Control (RBAC)
صلاحيات حسب الدور (admin, user, moderator)

## صلاحيات شائعة
- قراءة (read)
- كتابة (write)
- تعديل (update)
- حذف (delete)
- إدارة (manage)
`,
    codeExample: `// ===== Auth Middleware =====
const protect = async (req, res, next) => {
  try {
    // 1. Get token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول' });
    }
    
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'المستخدم غير موجود' });
    }
    
    // 4. Check if password changed after token issued
    if (user.passwordChangedAt > decoded.iat * 1000) {
      return res.status(401).json({ error: 'كلمة المرور تغيرت، أعد تسجيل الدخول' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token غير صالح' });
  }
};

// ===== Role-Based Authorization =====
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'ليس لديك صلاحية لهذا الإجراء' 
      });
    }
    next();
  };
};

// ===== Ownership Check =====
const checkOwnership = (Model) => async (req, res, next) => {
  const doc = await Model.findById(req.params.id);
  
  if (!doc) {
    return res.status(404).json({ error: 'غير موجود' });
  }
  
  // Admin يمكنه الوصول لكل شيء
  if (req.user.role === 'admin') {
    req.resource = doc;
    return next();
  }
  
  // المالك فقط يمكنه الوصول
  if (doc.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'لا يمكنك الوصول لهذا المورد' });
  }
  
  req.resource = doc;
  next();
};

// ===== Usage Examples =====

// Public route
app.get('/api/posts', getAllPosts);

// Authenticated only
app.get('/api/profile', protect, getProfile);

// Admin only
app.delete('/api/users/:id', protect, restrictTo('admin'), deleteUser);

// Admin or Moderator
app.put('/api/posts/:id/approve', 
  protect, 
  restrictTo('admin', 'moderator'), 
  approvePost
);

// Owner only
app.put('/api/posts/:id', 
  protect, 
  checkOwnership(Post), 
  updatePost
);

app.delete('/api/posts/:id', 
  protect, 
  checkOwnership(Post), 
  deletePost
);

// ===== Combining Middlewares =====
const postRouter = express.Router();

postRouter.use(protect);  // كل routes تحتاج auth

postRouter
  .route('/')
  .get(getAllPosts)
  .post(createPost);

postRouter
  .route('/:id')
  .get(getPost)
  .put(checkOwnership(Post), updatePost)
  .delete(checkOwnership(Post), deletePost);`,
    language: 'javascript',
    xpReward: 190,
    order: 4,
    quiz: {
      question: 'ما الفرق بين 401 و 403 status codes؟',
      options: [
        'لا فرق',
        '401 = غير مسجل دخول، 403 = لا صلاحية',
        '401 = خطأ، 403 = نجاح',
        '403 = غير مسجل، 401 = لا صلاحية',
      ],
      correctAnswer: 1,
      explanation:
        '401 Unauthorized = لم تسجل دخول، 403 Forbidden = مسجل لكن لا صلاحية',
    },
  },
  {
    id: 'auth-5',
    courseId: 'backend-auth',
    title: 'Refresh Tokens',
    description: 'تجديد الـ Tokens بأمان',
    content: `
# Refresh Tokens

حل مشكلة انتهاء صلاحية الـ Token.

## المشكلة
- Access Token قصير (15 دقيقة)
- المستخدم يضطر لتسجيل الدخول كثيراً

## الحل: Refresh Token

### Access Token
- قصير العمر (15-60 دقيقة)
- يُستخدم للطلبات
- يُخزَّن في الذاكرة

### Refresh Token
- طويل العمر (7-30 يوم)
- يُستخدم لتجديد Access Token
- يُخزَّن في httpOnly cookie

## التدفق

1. تسجيل الدخول → Access + Refresh tokens
2. استخدام Access للطلبات
3. Access ينتهي → استخدام Refresh للحصول على جديد
4. Refresh ينتهي → إعادة تسجيل الدخول
`,
    codeExample: `const jwt = require('jsonwebtoken');

// ===== Token Generation =====
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

// ===== Login =====
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email }).select('+password');
  if (!user || !await user.comparePassword(password)) {
    return res.status(401).json({ error: 'بيانات خاطئة' });
  }
  
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // حفظ Refresh Token في DB (للإلغاء لاحقاً)
  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  
  // إرسال Refresh Token في cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  });
  
  res.json({
    success: true,
    accessToken,
    user: { id: user._id, name: user.name }
  });
});

// ===== Refresh Token Endpoint =====
app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token مطلوب' });
  }
  
  try {
    // التحقق من الـ Token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // التحقق من وجوده في DB (لم يُلغَ)
    const storedToken = await RefreshToken.findOne({ 
      token: refreshToken,
      user: decoded.userId 
    });
    
    if (!storedToken) {
      return res.status(401).json({ error: 'Token غير صالح' });
    }
    
    // الحصول على المستخدم
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'المستخدم غير موجود' });
    }
    
    // إنشاء Access Token جديد
    const newAccessToken = generateAccessToken(user);
    
    res.json({ accessToken: newAccessToken });
    
  } catch (err) {
    return res.status(401).json({ error: 'Token غير صالح' });
  }
});

// ===== Logout (Revoke Refresh Token) =====
app.post('/api/auth/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  // حذف من DB
  await RefreshToken.deleteOne({ token: refreshToken });
  
  // مسح الـ Cookie
  res.clearCookie('refreshToken');
  
  res.json({ success: true });
});

// ===== Logout from all devices =====
app.post('/api/auth/logout-all', protect, async (req, res) => {
  await RefreshToken.deleteMany({ user: req.user._id });
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'تم تسجيل الخروج من جميع الأجهزة' });
});`,
    language: 'javascript',
    xpReward: 200,
    order: 5,
    quiz: {
      question: 'لماذا نستخدم Refresh Token بدلاً من Access Token طويل؟',
      options: [
        'للسرعة',
        'للأمان - تقليل الضرر عند سرقة Access Token',
        'لتوفير المساحة',
        'لا فرق بينهما',
      ],
      correctAnswer: 1,
      explanation: 'Access Token قصير يعني إذا سُرق يبقى فعالاً لوقت قليل فقط',
    },
  },
  {
    id: 'auth-6',
    courseId: 'backend-auth',
    title: 'OAuth و Social Login',
    description: 'تسجيل الدخول بحسابات خارجية',
    content: `
# OAuth 2.0 & Social Login

تسجيل الدخول باستخدام Google, Facebook, GitHub...

## لماذا OAuth؟
- لا حاجة لإنشاء حساب جديد
- أمان أعلى (Google/Facebook يتعاملان مع الأمان)
- تجربة مستخدم أفضل

## تدفق OAuth 2.0

1. المستخدم يضغط "تسجيل بـ Google"
2. يُوجَّه لصفحة Google
3. يوافق على الصلاحيات
4. Google يرجعه لموقعك مع Code
5. موقعك يستبدل Code بـ Access Token
6. تستخدم Token لجلب بيانات المستخدم

## Passport.js
مكتبة للـ Authentication تدعم 500+ استراتيجية.
`,
    codeExample: `// npm install passport passport-google-oauth20

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// ===== Google OAuth Strategy =====
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // البحث عن المستخدم أو إنشاؤه
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // مستخدم جديد
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          provider: 'google'
        });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// ===== Routes =====

// بدء OAuth flow
app.get('/api/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Callback بعد موافقة المستخدم
app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // إنشاء JWT
    const token = generateToken(req.user);
    
    // إعادة التوجيه للـ Frontend مع الـ Token
    res.redirect(\`\${process.env.FRONTEND_URL}/auth/callback?token=\${token}\`);
  }
);

// ===== GitHub OAuth =====
const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ githubId: profile.id });
    
    if (!user) {
      user = await User.create({
        githubId: profile.id,
        name: profile.displayName || profile.username,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value,
        provider: 'github'
      });
    }
    
    return done(null, user);
  }
));

app.get('/api/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/api/auth/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(\`\${process.env.FRONTEND_URL}/auth/callback?token=\${token}\`);
  }
);`,
    language: 'javascript',
    xpReward: 200,
    order: 6,
    quiz: {
      question: 'ما الذي يرجعه Google بعد موافقة المستخدم؟',
      options: [
        'كلمة المرور',
        'Authorization Code',
        'Access Token مباشرة',
        'بيانات المستخدم الكاملة',
      ],
      correctAnswer: 1,
      explanation: 'Google يرجع Code نستبدله بـ Access Token من الخادم لاحقاً',
    },
  },
];

// ===== دروس MongoDB =====
export const MONGODB_LESSONS: Lesson[] = [
  {
    id: 'mongo-1',
    courseId: 'backend-mongodb',
    title: 'مقدمة في MongoDB',
    description: 'قاعدة بيانات NoSQL الأشهر',
    content: `
# MongoDB

قاعدة بيانات NoSQL document-based.

## ما هو MongoDB؟
- قاعدة بيانات لا علاقية
- تخزين على شكل Documents (JSON)
- مرنة وقابلة للتطوير

## الهيكل

\`\`\`
Database → Collections → Documents
       ↓            ↓           ↓
   مكتبة       كتب/مستخدمين    كتاب واحد
\`\`\`

## Document
\`\`\`json
{
  "_id": "ObjectId(...)",
  "name": "أحمد",
  "email": "ahmed@mail.com",
  "age": 25,
  "hobbies": ["قراءة", "برمجة"],
  "address": {
    "city": "الرياض",
    "country": "السعودية"
  }
}
\`\`\`

## SQL vs MongoDB

| SQL | MongoDB |
|-----|---------|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| JOIN | Embedding / Reference |
`,
    codeExample: `// تثبيت MongoDB driver
// npm install mongodb

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function main() {
  try {
    // الاتصال
    await client.connect();
    console.log('متصل بـ MongoDB!');
    
    // اختيار Database و Collection
    const db = client.db('myapp');
    const users = db.collection('users');
    
    // ===== Insert =====
    // واحد
    const result = await users.insertOne({
      name: 'أحمد',
      email: 'ahmed@mail.com',
      age: 25
    });
    console.log('ID:', result.insertedId);
    
    // متعدد
    await users.insertMany([
      { name: 'سارة', age: 22 },
      { name: 'محمد', age: 30 }
    ]);
    
    // ===== Find =====
    // واحد
    const user = await users.findOne({ email: 'ahmed@mail.com' });
    console.log(user);
    
    // الكل
    const allUsers = await users.find({}).toArray();
    console.log(allUsers);
    
    // مع شروط
    const youngUsers = await users.find({ age: { $lt: 25 } }).toArray();
    
    // ===== Update =====
    await users.updateOne(
      { email: 'ahmed@mail.com' },
      { $set: { age: 26 } }
    );
    
    // ===== Delete =====
    await users.deleteOne({ email: 'ahmed@mail.com' });
    
  } finally {
    await client.close();
  }
}

main().catch(console.error);`,
    language: 'javascript',
    xpReward: 180,
    order: 1,
    quiz: {
      question: 'ما يعادل Table في SQL بمصطلحات MongoDB؟',
      options: ['Database', 'Document', 'Collection', 'Field'],
      correctAnswer: 2,
      explanation: 'Collection في MongoDB تعادل Table في SQL',
    },
  },
  {
    id: 'mongo-2',
    courseId: 'backend-mongodb',
    title: 'Mongoose ODM',
    description: 'إدارة MongoDB بأناقة',
    content: `
# Mongoose

Object Document Mapper لـ MongoDB.

## لماذا Mongoose؟
- Schema للتحكم بالهيكل
- Validation مدمج
- Middleware (hooks)
- Query builders
- Population (joins)

## Schema Types
- String, Number, Boolean
- Date, Buffer
- ObjectId, Array
- Mixed, Map

## مميزات Schema
- required: حقل مطلوب
- unique: قيمة فريدة
- default: قيمة افتراضية
- min/max: حدود الأرقام
- minlength/maxlength: حدود النص
- enum: قيم محددة
`,
    codeExample: `// npm install mongoose

const mongoose = require('mongoose');

// ===== الاتصال =====
mongoose.connect('mongodb://localhost:27017/myapp')
  .then(() => console.log('متصل بـ MongoDB'))
  .catch(err => console.error('خطأ الاتصال:', err));

// ===== Schema =====
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
    minlength: [2, 'الاسم قصير جداً']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'بريد غير صالح']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false  // لا يظهر في queries
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  age: {
    type: Number,
    min: [1, 'عمر غير صالح'],
    max: 120
  },
  hobbies: [String],
  address: {
    city: String,
    country: { type: String, default: 'السعودية' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// ===== Virtual Fields =====
userSchema.virtual('fullName').get(function() {
  return \`\${this.firstName} \${this.lastName}\`;
});

// ===== Instance Methods =====
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ===== Static Methods =====
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

// ===== Middleware =====
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ===== Model =====
const User = mongoose.model('User', userSchema);

// ===== Usage =====
// Create
const user = await User.create({
  name: 'أحمد',
  email: 'ahmed@mail.com',
  password: '12345678'
});

// Read
const users = await User.find({ role: 'user' });
const user = await User.findById(id);
const user = await User.findOne({ email });

// Update
await User.findByIdAndUpdate(id, { name: 'أحمد محمد' }, { new: true });

// Delete
await User.findByIdAndDelete(id);`,
    language: 'javascript',
    xpReward: 200,
    order: 2,
    quiz: {
      question: 'ما فائدة select: false في Schema؟',
      options: [
        'منع التعديل',
        'إخفاء الحقل من نتائج الاستعلام',
        'جعله مطلوباً',
        'تشفير القيمة',
      ],
      correctAnswer: 1,
      explanation:
        'select: false يمنع إرجاع الحقل في الـ queries (مثل password)',
    },
  },
  {
    id: 'mongo-3',
    courseId: 'backend-mongodb',
    title: 'CRUD مع Mongoose',
    description: 'العمليات الأساسية على البيانات',
    content: `
# CRUD Operations

Create, Read, Update, Delete مع Mongoose.

## طرق القراءة

### find()
إرجاع مصفوفة

### findOne()
إرجاع document واحد

### findById()
البحث بالـ ID

## طرق التحديث

### updateOne/updateMany
تحديث بدون إرجاع

### findByIdAndUpdate
تحديث مع إرجاع

## Query Operators

- \`$eq\`, \`$ne\`: يساوي، لا يساوي
- \`$gt\`, \`$gte\`: أكبر، أكبر أو يساوي
- \`$lt\`, \`$lte\`: أصغر، أصغر أو يساوي
- \`$in\`, \`$nin\`: في المصفوفة، ليس في
- \`$and\`, \`$or\`: و، أو
`,
    codeExample: `// ===== CREATE =====

// طريقة 1: new + save
const user = new User({ name: 'أحمد', email: 'ahmed@mail.com' });
await user.save();

// طريقة 2: create
const user = await User.create({ name: 'أحمد', email: 'ahmed@mail.com' });

// متعدد
await User.insertMany([
  { name: 'سارة' },
  { name: 'محمد' }
]);

// ===== READ =====

// كل المستخدمين
const users = await User.find();

// مع شروط
const admins = await User.find({ role: 'admin' });

// Query operators
const users = await User.find({
  age: { $gte: 18, $lte: 30 },
  role: { $in: ['user', 'moderator'] }
});

// OR
const users = await User.find({
  $or: [
    { age: { $lt: 20 } },
    { role: 'admin' }
  ]
});

// واحد فقط
const user = await User.findOne({ email: 'ahmed@mail.com' });
const user = await User.findById('64a1b2c3d4e5f6...');

// Chaining
const users = await User.find({ role: 'user' })
  .select('name email')       // الحقول المطلوبة
  .sort('-createdAt')         // الترتيب
  .skip(10)                   // تخطي
  .limit(10);                 // الحد

// ===== UPDATE =====

// واحد
await User.updateOne(
  { email: 'ahmed@mail.com' },
  { $set: { age: 26 } }
);

// متعدد
await User.updateMany(
  { role: 'user' },
  { $set: { isActive: true } }
);

// findByIdAndUpdate (يرجع الـ document)
const user = await User.findByIdAndUpdate(
  id,
  { name: 'أحمد محمد' },
  { new: true, runValidators: true }  // new: يرجع المحدث
);

// Update operators
await User.updateOne(
  { _id: id },
  {
    $set: { name: 'أحمد' },           // تعيين
    $inc: { points: 10 },             // زيادة
    $push: { hobbies: 'سباحة' },      // إضافة لمصفوفة
    $pull: { hobbies: 'قراءة' },      // حذف من مصفوفة
    $unset: { tempField: 1 }          // حذف حقل
  }
);

// ===== DELETE =====

await User.deleteOne({ email: 'ahmed@mail.com' });
await User.deleteMany({ isActive: false });

const user = await User.findByIdAndDelete(id);  // يرجع المحذوف`,
    language: 'javascript',
    xpReward: 180,
    order: 3,
    quiz: {
      question: 'ما الفرق بين updateOne و findByIdAndUpdate؟',
      options: [
        'لا فرق',
        'findByIdAndUpdate يرجع الـ document المحدث',
        'updateOne أسرع دائماً',
        'findByIdAndUpdate للحذف فقط',
      ],
      correctAnswer: 1,
      explanation:
        'findByIdAndUpdate يرجع الـ document بينما updateOne لا يرجع شيئاً',
    },
  },
  {
    id: 'mongo-4',
    courseId: 'backend-mongodb',
    title: 'Relationships و Population',
    description: 'ربط البيانات بين Collections',
    content: `
# Relationships في MongoDB

طريقتان للربط: Embedding و Referencing.

## 1. Embedding (تضمين)
تخزين البيانات داخل الـ document.

**متى نستخدم؟**
- البيانات تُقرأ معاً دائماً
- العلاقة 1:few
- البيانات لا تتغير كثيراً

## 2. Referencing (مرجع)
تخزين الـ ID فقط.

**متى نستخدم؟**
- البيانات تُقرأ منفصلة
- العلاقة 1:many أو many:many
- البيانات تتغير كثيراً

## Population
جلب البيانات المرجعية تلقائياً.
`,
    codeExample: `// ===== Embedding Example =====

const userSchema = new mongoose.Schema({
  name: String,
  // العنوان مضمن
  address: {
    street: String,
    city: String,
    country: String
  },
  // التعليقات مضمنة (few)
  comments: [{
    text: String,
    date: { type: Date, default: Date.now }
  }]
});

// الاستخدام - كل شيء في query واحد
const user = await User.findById(id);
console.log(user.address.city);
console.log(user.comments[0].text);

// ===== Referencing Example =====

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String
});

// Post Schema - مرجع للمستخدم
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // اسم الـ Model المرجعي
    required: true
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

// Comment Schema
const commentSchema = new mongoose.Schema({
  text: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);

// ===== Population =====

// جلب Post مع بيانات الكاتب
const post = await Post.findById(postId)
  .populate('author');  // يجلب كل بيانات User
  
console.log(post.author.name);  // بدلاً من ID فقط

// تحديد الحقول
const post = await Post.findById(postId)
  .populate('author', 'name email');  // فقط name و email

// Population متعدد
const post = await Post.findById(postId)
  .populate('author', 'name')
  .populate('comments');

// Nested population
const post = await Post.findById(postId)
  .populate({
    path: 'comments',
    populate: {
      path: 'author',
      select: 'name'
    }
  });

// ===== Virtual Population =====

// في User Schema
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author'
});

// الآن يمكن عمل populate للمنشورات من المستخدم
const user = await User.findById(userId)
  .populate('posts');
  
console.log(user.posts);  // كل منشورات المستخدم`,
    language: 'javascript',
    xpReward: 200,
    order: 4,
    quiz: {
      question: 'متى نستخدم Embedding بدلاً من Referencing؟',
      options: [
        'دائماً',
        'عندما البيانات تُقرأ معاً والعلاقة 1:few',
        'عندما البيانات كثيرة ومتغيرة',
        'للعلاقات many:many',
      ],
      correctAnswer: 1,
      explanation:
        'Embedding مناسب عندما البيانات تُقرأ معاً دائماً وحجمها صغير',
    },
  },
  {
    id: 'mongo-5',
    courseId: 'backend-mongodb',
    title: 'Aggregation Pipeline',
    description: 'استعلامات متقدمة وتجميع البيانات',
    content: `
# Aggregation Pipeline

معالجة البيانات على مراحل للحصول على نتائج معقدة.

## المفهوم
مثل خط إنتاج: كل مرحلة تعالج البيانات وتمررها للتالية.

## المراحل الشائعة

| المرحلة | الوظيفة |
|---------|---------|
| $match | فلترة (مثل find) |
| $group | تجميع وحساب |
| $sort | ترتيب |
| $project | اختيار/تعديل الحقول |
| $limit | تحديد العدد |
| $skip | تخطي |
| $lookup | JOIN مع collection آخر |
| $unwind | تفكيك المصفوفات |

## Accumulator Operators
في $group:
- $sum, $avg, $min, $max
- $first, $last
- $push, $addToSet
- $count
`,
    codeExample: `// ===== Basic Aggregation =====

// عدد المستخدمين حسب الدور
const stats = await User.aggregate([
  {
    $group: {
      _id: '$role',
      count: { $sum: 1 },
      avgAge: { $avg: '$age' }
    }
  }
]);
// [{ _id: 'user', count: 100, avgAge: 28 }, { _id: 'admin', count: 5, avgAge: 35 }]

// ===== Match + Group =====

// إحصائيات المنشورات للمستخدمين النشطين
const postStats = await Post.aggregate([
  // 1. فلترة المنشورات المنشورة
  { $match: { status: 'published' } },
  
  // 2. تجميع حسب الكاتب
  { 
    $group: {
      _id: '$author',
      totalPosts: { $sum: 1 },
      totalLikes: { $sum: '$likes' },
      avgLikes: { $avg: '$likes' }
    }
  },
  
  // 3. ترتيب حسب عدد المنشورات
  { $sort: { totalPosts: -1 } },
  
  // 4. أول 10 فقط
  { $limit: 10 }
]);

// ===== $lookup (JOIN) =====

const ordersWithProducts = await Order.aggregate([
  {
    $lookup: {
      from: 'products',           // Collection المرجعي
      localField: 'productId',    // الحقل المحلي
      foreignField: '_id',        // الحقل في products
      as: 'product'               // اسم المصفوفة الناتجة
    }
  },
  { $unwind: '$product' },        // تحويل المصفوفة لـ object
  {
    $project: {
      orderDate: 1,
      quantity: 1,
      'product.name': 1,
      'product.price': 1,
      total: { $multiply: ['$quantity', '$product.price'] }
    }
  }
]);

// ===== Complex Example =====

// تقرير المبيعات الشهري
const salesReport = await Order.aggregate([
  // فلترة حسب السنة
  {
    $match: {
      createdAt: {
        $gte: new Date('2024-01-01'),
        $lt: new Date('2025-01-01')
      }
    }
  },
  // تجميع حسب الشهر
  {
    $group: {
      _id: { $month: '$createdAt' },
      totalSales: { $sum: '$total' },
      ordersCount: { $sum: 1 },
      avgOrderValue: { $avg: '$total' }
    }
  },
  // إضافة اسم الشهر
  {
    $project: {
      month: '$_id',
      totalSales: { $round: ['$totalSales', 2] },
      ordersCount: 1,
      avgOrderValue: { $round: ['$avgOrderValue', 2] }
    }
  },
  // ترتيب حسب الشهر
  { $sort: { month: 1 } }
]);

// ===== $facet - Multiple Pipelines =====

const results = await Product.aggregate([
  {
    $facet: {
      // إحصائيات
      stats: [
        { $group: { _id: null, total: { $sum: 1 }, avgPrice: { $avg: '$price' } } }
      ],
      // حسب الفئة
      byCategory: [
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ],
      // أغلى 5 منتجات
      topProducts: [
        { $sort: { price: -1 } },
        { $limit: 5 },
        { $project: { name: 1, price: 1 } }
      ]
    }
  }
]);`,
    language: 'javascript',
    xpReward: 220,
    order: 5,
    quiz: {
      question: 'ما وظيفة $unwind في Aggregation؟',
      options: [
        'دمج المصفوفات',
        'تفكيك المصفوفة لـ documents منفصلة',
        'حذف المكررات',
        'ترتيب البيانات',
      ],
      correctAnswer: 1,
      explanation:
        '$unwind يحول document بمصفوفة لعدة documents، كل واحد بعنصر',
    },
  },
];

// ===== تحديات Backend =====
export const BACKEND_CHALLENGES: Challenge[] = [
  {
    id: 'backend-ch-1',
    title: 'REST API بسيط',
    description: 'أنشئ API لإدارة المهام',
    difficulty: 'medium',
    points: 50,
    language: 'Node.js',
    icon: 'server',
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

let tasks = [];

// GET /tasks - جلب كل المهام

// POST /tasks - إضافة مهمة

// PUT /tasks/:id - تحديث مهمة

// DELETE /tasks/:id - حذف مهمة

app.listen(3000);`,
    solution: `const express = require('express');
const app = express();
app.use(express.json());

let tasks = [];
let nextId = 1;

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const task = { id: nextId++, ...req.body, completed: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Not found' });
  Object.assign(task, req.body);
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.listen(3000);`,
    hints: [
      'استخدم req.body للبيانات المرسلة',
      'req.params.id للحصول على ID من URL',
      'استخدم find للبحث و filter للحذف',
    ],
    testCases: [
      {
        input:
          'tasks = []\nnext_id = 1\ndef add(title):\n    global next_id\n    t = {"id": next_id, "title": title, "done": False}\n    tasks.append(t)\n    next_id += 1\n    return t\nadd("Buy milk")\nadd("Read book")\nprint(len(tasks))',
        expectedOutput: '2',
        description: 'إضافة مهام والتحقق من العدد',
      },
      {
        input:
          'tasks = [{"id":1,"title":"A"},{"id":2,"title":"B"},{"id":3,"title":"C"}]\ntasks = [t for t in tasks if t["id"] != 2]\nprint([t["title"] for t in tasks])',
        expectedOutput: "['A', 'C']",
        description: 'حذف مهمة بالمعرف',
      },
      {
        input:
          'task = {"id": 1, "title": "Test", "done": False}\ntask["done"] = True\ntask["title"] = "Updated"\nprint(task["done"], task["title"])',
        expectedOutput: 'True Updated',
        description: 'تحديث مهمة',
      },
    ],
    isLocked: false,
    category: 'api',
  },
  {
    id: 'backend-ch-2',
    title: 'استعلام SQL معقد',
    description: 'اكتب استعلام JOIN مع تجميع',
    difficulty: 'hard',
    points: 80,
    language: 'SQL',
    icon: 'storage',
    starterCode: `-- لديك جداول: users, posts, comments
-- اكتب استعلام يرجع:
-- اسم المستخدم، عدد منشوراته، عدد التعليقات على منشوراته
-- مرتب حسب عدد المنشورات تنازلياً

SELECT 
  -- اكتب الاستعلام هنا
FROM users`,
    solution: `SELECT 
  u.name AS user_name,
  COUNT(DISTINCT p.id) AS posts_count,
  COUNT(c.id) AS comments_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY u.id, u.name
ORDER BY posts_count DESC;`,
    hints: [
      'استخدم LEFT JOIN للحصول على كل المستخدمين',
      'COUNT(DISTINCT) لعدم تكرار العد',
      'GROUP BY لتجميع النتائج',
    ],
    testCases: [
      {
        input:
          'users = [{"id":1,"name":"Ali"},{"id":2,"name":"Sara"}]\nposts = [{"id":1,"user_id":1},{"id":2,"user_id":1},{"id":3,"user_id":2}]\ncomments = [{"post_id":1},{"post_id":1},{"post_id":3}]\nresult = []\nfor u in users:\n    up = [p for p in posts if p["user_id"]==u["id"]]\n    pids = {p["id"] for p in up}\n    uc = [c for c in comments if c["post_id"] in pids]\n    result.append((u["name"],len(up),len(uc)))\nresult.sort(key=lambda x:-x[1])\nprint(result)',
        expectedOutput: "[('Ali', 2, 2), ('Sara', 1, 1)]",
        description: 'ربط وتجميع البيانات (JOIN + GROUP BY)',
      },
      {
        input:
          'from collections import Counter\ndata = [{"cat":"A"},{"cat":"B"},{"cat":"A"},{"cat":"A"},{"cat":"B"}]\ncounts = Counter(d["cat"] for d in data)\nprint(sorted(counts.items(), key=lambda x:-x[1]))',
        expectedOutput: "[('A', 3), ('B', 2)]",
        description: 'COUNT مع GROUP BY',
      },
    ],
    isLocked: false,
    category: 'database',
  },
  {
    id: 'backend-ch-3',
    title: 'Middleware للمصادقة',
    description: 'أنشئ middleware للتحقق من Token',
    difficulty: 'medium',
    points: 60,
    language: 'Node.js',
    icon: 'shield',
    starterCode: `// أنشئ middleware يتحقق من وجود وصحة Token
// Token يكون في Header: Authorization: Bearer <token>

const authMiddleware = (req, res, next) => {
  // اكتب الكود هنا
};

module.exports = authMiddleware;`,
    solution: `const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token مطلوب' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token غير صالح' });
  }
};

module.exports = authMiddleware;`,
    hints: [
      'استخرج Token من Authorization header',
      'استخدم jwt.verify للتحقق',
      'أضف بيانات المستخدم لـ req.user',
    ],
    testCases: [
      {
        input:
          'def parse_token(header):\n    if not header or not header.startswith("Bearer "):\n        return None\n    return header.split(" ")[1]\nprint(parse_token("Bearer abc123"))',
        expectedOutput: 'abc123',
        description: 'استخراج Token من Header',
      },
      {
        input:
          'def parse_token(header):\n    if not header or not header.startswith("Bearer "):\n        return None\n    return header.split(" ")[1]\nprint(parse_token(""))',
        expectedOutput: 'None',
        description: 'رفض عند عدم وجود Token',
      },
      {
        input:
          'def parse_token(header):\n    if not header or not header.startswith("Bearer "):\n        return None\n    return header.split(" ")[1]\nprint(parse_token("Basic xyz789"))',
        expectedOutput: 'None',
        description: 'رفض نوع مصادقة غير Bearer',
      },
    ],
    isLocked: false,
    category: 'auth',
  },
  {
    id: 'backend-ch-4',
    title: 'API Rate Limiter',
    description: 'بناء middleware لتحديد معدل الطلبات',
    difficulty: 'medium',
    points: 70,
    language: 'Node.js',
    icon: 'speedometer',
    starterCode: `// أنشئ rate limiter بسيط
// الحد: 100 طلب لكل IP كل دقيقة

const rateLimiter = (maxRequests, windowMs) => {
  const requests = new Map();
  
  return (req, res, next) => {
    // أكمل الكود
  };
};

// الاستخدام:
// app.use(rateLimiter(100, 60000));`,
    solution: `const rateLimiter = (maxRequests, windowMs) => {
  const requests = new Map();
  
  // تنظيف دوري
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requests.entries()) {
      if (now - data.windowStart > windowMs) {
        requests.delete(ip);
      }
    }
  }, windowMs);
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, windowStart: now });
      return next();
    }
    
    const ipData = requests.get(ip);
    
    if (now - ipData.windowStart > windowMs) {
      ipData.count = 1;
      ipData.windowStart = now;
      return next();
    }
    
    if (ipData.count >= maxRequests) {
      return res.status(429).json({
        error: 'تجاوزت الحد المسموح',
        retryAfter: Math.ceil((windowMs - (now - ipData.windowStart)) / 1000)
      });
    }
    
    ipData.count++;
    next();
  };
};

module.exports = rateLimiter;`,
    hints: [
      'استخدم Map لتخزين عدد الطلبات لكل IP',
      'تحقق من وقت النافذة',
      'أرجع 429 عند تجاوز الحد',
    ],
    testCases: [
      {
        input:
          'counts = {}\ndef allow(ip, limit=3):\n    counts[ip] = counts.get(ip, 0) + 1\n    return counts[ip] <= limit\nprint([allow("192.168.1.1") for _ in range(5)])',
        expectedOutput: '[True, True, True, False, False]',
        description: 'تحديد المعدل لعنوان IP',
      },
      {
        input:
          'counts = {}\ndef allow(ip, limit=2):\n    counts[ip] = counts.get(ip, 0) + 1\n    return counts[ip] <= limit\nprint(allow("10.0.0.1"), allow("10.0.0.2"), allow("10.0.0.1"), allow("10.0.0.1"))',
        expectedOutput: 'True True True False',
        description: 'تحديد المعدل لعناوين مختلفة',
      },
    ],
    isLocked: false,
    category: 'security',
  },
  {
    id: 'backend-ch-5',
    title: 'CRUD مع MongoDB',
    description: 'بناء API كامل مع Mongoose',
    difficulty: 'medium',
    points: 80,
    language: 'Node.js',
    icon: 'leaf',
    starterCode: `const mongoose = require('mongoose');
const express = require('express');
const app = express();
app.use(express.json());

// 1. أنشئ Schema للمنتج
// الحقول: name, price, category, inStock

// 2. أنشئ routes للـ CRUD

app.listen(3000);`,
    solution: `const mongoose = require('mongoose');
const express = require('express');
const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost/shop');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['electronics', 'clothing', 'food'] },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Create
app.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all
app.get('/products', async (req, res) => {
  const { category, inStock } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (inStock) filter.inStock = inStock === 'true';
  
  const products = await Product.find(filter);
  res.json(products);
});

// Read one
app.get('/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'غير موجود' });
  res.json(product);
});

// Update
app.put('/products/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) return res.status(404).json({ error: 'غير موجود' });
  res.json(product);
});

// Delete
app.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.listen(3000);`,
    hints: [
      'استخدم Schema للتحقق',
      'findByIdAndUpdate مع new: true',
      'أضف timestamps للتتبع',
    ],
    testCases: [
      {
        input:
          'def validate(product, required):\n    for f in required:\n        if f not in product:\n            return False\n    return True\nprint(validate({"name":"Phone","price":999}, ["name","price"]))',
        expectedOutput: 'True',
        description: 'تحقق من وجود الحقول المطلوبة',
      },
      {
        input:
          'def validate(product, required):\n    for f in required:\n        if f not in product:\n            return False\n    return True\nprint(validate({"name":"Phone"}, ["name","price"]))',
        expectedOutput: 'False',
        description: 'رفض عند نقص حقل مطلوب',
      },
      {
        input:
          'db = {}\nnext_id = 1\ndef create(item):\n    global next_id\n    db[next_id] = item\n    next_id += 1\n    return next_id - 1\ndef read(id):\n    return db.get(id)\ncreate({"name":"A"})\ncreate({"name":"B"})\nprint(read(1), read(3))',
        expectedOutput: "{'name': 'A'} None",
        description: 'إنشاء وقراءة من قاعدة البيانات',
      },
    ],
    isLocked: false,
    category: 'database',
  },
  {
    id: 'backend-ch-6',
    title: 'WebSocket Chat',
    description: 'بناء دردشة فورية بـ Socket.io',
    difficulty: 'hard',
    points: 100,
    language: 'Node.js',
    icon: 'chatbubbles',
    starterCode: `const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// أنشئ:
// 1. حدث اتصال مستخدم جديد
// 2. حدث إرسال رسالة
// 3. حدث انضمام لغرفة
// 4. حدث قطع الاتصال

server.listen(3000);`,
    solution: `const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = new Map();

io.on('connection', (socket) => {
  console.log('مستخدم جديد:', socket.id);
  
  // تسجيل المستخدم
  socket.on('register', (username) => {
    users.set(socket.id, username);
    io.emit('userJoined', { username, users: [...users.values()] });
  });
  
  // إرسال رسالة
  socket.on('message', (data) => {
    const username = users.get(socket.id);
    io.emit('message', {
      username,
      text: data.text,
      timestamp: new Date()
    });
  });
  
  // الانضمام لغرفة
  socket.on('joinRoom', (room) => {
    socket.join(room);
    socket.to(room).emit('notification', \`\${users.get(socket.id)} انضم للغرفة\`);
  });
  
  // رسالة للغرفة
  socket.on('roomMessage', ({ room, text }) => {
    io.to(room).emit('message', {
      username: users.get(socket.id),
      text,
      room,
      timestamp: new Date()
    });
  });
  
  // قطع الاتصال
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    io.emit('userLeft', { username, users: [...users.values()] });
  });
});

server.listen(3000);`,
    hints: [
      'socket.on للاستماع',
      'io.emit للجميع',
      'socket.to(room) لغرفة معينة',
    ],
    testCases: [
      {
        input:
          'users = {}\ndef register(sid, name):\n    users[sid] = name\n    return list(users.values())\ndef disconnect(sid):\n    users.pop(sid, None)\n    return list(users.values())\nregister("s1","Ali")\nregister("s2","Sara")\nprint(disconnect("s1"))',
        expectedOutput: "['Sara']",
        description: 'إدارة اتصال وانفصال المستخدمين',
      },
      {
        input:
          'rooms = {}\ndef join(user, room):\n    rooms.setdefault(room, []).append(user)\ndef members(room):\n    return rooms.get(room, [])\njoin("Ali","general")\njoin("Sara","general")\njoin("Ali","tech")\nprint(members("general"), len(members("tech")))',
        expectedOutput: "['Ali', 'Sara'] 1",
        description: 'إدارة الغرف والأعضاء',
      },
    ],
    isLocked: true,
    category: 'realtime',
  },
  {
    id: 'backend-ch-7',
    title: 'File Upload API',
    description: 'رفع وإدارة الملفات بـ Multer',
    difficulty: 'medium',
    points: 70,
    language: 'Node.js',
    icon: 'cloud-upload',
    starterCode: `const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

// أنشئ:
// 1. storage configuration
// 2. file filter (صور فقط)
// 3. route لرفع ملف واحد
// 4. route لرفع عدة ملفات

app.listen(3000);`,
    solution: `const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// التأكد من وجود مجلد الرفع
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// إعدادات التخزين
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.random().toString(36).slice(2);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

// فلتر الملفات (صور فقط)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedTypes.test(file.mimetype);
  
  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error('فقط الصور مسموحة!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// رفع ملف واحد
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم رفع ملف' });
  }
  res.json({
    message: 'تم الرفع',
    file: {
      filename: req.file.filename,
      size: req.file.size,
      url: \`/uploads/\${req.file.filename}\`
    }
  });
});

// رفع عدة ملفات
app.post('/upload-multiple', upload.array('images', 5), (req, res) => {
  const files = req.files.map(f => ({
    filename: f.filename,
    size: f.size,
    url: \`/uploads/\${f.filename}\`
  }));
  res.json({ message: 'تم الرفع', files });
});

// تقديم الملفات
app.use('/uploads', express.static(uploadDir));

// معالجة أخطاء Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: err.message });
});

app.listen(3000);`,
    hints: [
      'multer.diskStorage للتخزين',
      'fileFilter للتحقق من النوع',
      'limits لتحديد الحجم',
    ],
    testCases: [
      {
        input:
          'def valid_ext(name, allowed):\n    ext = name.rsplit(".",1)[-1].lower() if "." in name else ""\n    return ext in allowed\nallowed = {"jpg","jpeg","png","gif","webp"}\nprint(valid_ext("photo.jpg", allowed), valid_ext("doc.pdf", allowed))',
        expectedOutput: 'True False',
        description: 'التحقق من امتداد الملف',
      },
      {
        input:
          'def check_size(size_bytes, max_mb=5):\n    return size_bytes <= max_mb * 1024 * 1024\nprint(check_size(3*1024*1024), check_size(10*1024*1024))',
        expectedOutput: 'True False',
        description: 'التحقق من حجم الملف',
      },
      {
        input:
          'import os\ndef unique_name(original):\n    name, ext = os.path.splitext(original)\n    return f"12345{ext}"\nprint(unique_name("photo.jpg"), unique_name("doc.png"))',
        expectedOutput: '12345.jpg 12345.png',
        description: 'توليد اسم فريد مع الحفاظ على الامتداد',
      },
    ],
    isLocked: false,
    category: 'files',
  },
  {
    id: 'backend-ch-8',
    title: 'Caching مع Redis',
    description: 'تحسين الأداء بالتخزين المؤقت',
    difficulty: 'hard',
    points: 90,
    language: 'Node.js',
    icon: 'flash',
    starterCode: `const express = require('express');
const Redis = require('ioredis');

const app = express();
const redis = new Redis();

// أنشئ:
// 1. middleware للـ caching
// 2. route مع cache
// 3. invalidation عند التحديث

app.listen(3000);`,
    solution: `const express = require('express');
const Redis = require('ioredis');

const app = express();
app.use(express.json());

const redis = new Redis();

// Middleware للـ Caching
const cache = (duration) => {
  return async (req, res, next) => {
    const key = \`cache:\${req.originalUrl}\`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // تعديل res.json لحفظ النتيجة
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        await redis.setex(key, duration, JSON.stringify(data));
        return originalJson(data);
      };
      
      next();
    } catch (err) {
      next();
    }
  };
};

// بيانات وهمية
const fetchProducts = async () => {
  await new Promise(r => setTimeout(r, 1000)); // محاكاة تأخير
  return [
    { id: 1, name: 'منتج 1', price: 100 },
    { id: 2, name: 'منتج 2', price: 200 },
  ];
};

// Route مع cache (60 ثانية)
app.get('/products', cache(60), async (req, res) => {
  const products = await fetchProducts();
  res.json(products);
});

// إضافة منتج (invalidate cache)
app.post('/products', async (req, res) => {
  // إضافة المنتج...
  
  // حذف الـ cache
  await redis.del('cache:/products');
  
  res.status(201).json({ message: 'تم الإضافة' });
});

// حذف كل الـ cache
app.delete('/cache', async (req, res) => {
  const keys = await redis.keys('cache:*');
  if (keys.length) {
    await redis.del(...keys);
  }
  res.json({ message: 'تم مسح الـ cache', cleared: keys.length });
});

app.listen(3000);`,
    hints: [
      'redis.setex للتخزين مع انتهاء',
      'احذف الـ cache عند التحديث',
      'استخدم key واضح ومنظم',
    ],
    testCases: [
      {
        input:
          'cache = {}\ndef cache_get(key):\n    return cache.get(key)\ndef cache_set(key, val):\n    cache[key] = val\ndef cache_del(key):\n    cache.pop(key, None)\ncache_set("products", [1,2,3])\nprint(cache_get("products"))\ncache_del("products")\nprint(cache_get("products"))',
        expectedOutput: '[1, 2, 3]\nNone',
        description: 'تخزين واسترجاع وحذف من الكاش',
      },
      {
        input:
          'cache = {}\nhits = misses = 0\ndef fetch(key, fn):\n    global hits, misses\n    if key in cache:\n        hits += 1\n        return cache[key]\n    misses += 1\n    cache[key] = fn()\n    return cache[key]\nfetch("a", lambda: 42)\nfetch("a", lambda: 42)\nfetch("a", lambda: 42)\nprint(f"hits={hits} misses={misses}")',
        expectedOutput: 'hits=2 misses=1',
        description: 'إحصائيات الكاش (hits/misses)',
      },
    ],
    isLocked: true,
    category: 'performance',
  },
];

// ===== التصدير =====
export const ALL_BACKEND_LESSONS: Lesson[] = [
  ...NODEJS_LESSONS,
  ...REST_API_LESSONS,
  ...AUTH_LESSONS,
  ...SQL_LESSONS,
  ...MONGODB_LESSONS,
  ...SUPABASE_LESSONS,
  ...FIREBASE_LESSONS,
];

export const ALL_BACKEND_CHALLENGES: Challenge[] = BACKEND_CHALLENGES;

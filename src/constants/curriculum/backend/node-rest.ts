/**
 * منهجا backend-nodejs و backend-rest-api.
 *
 * كان: 13 درساً بشرح من 5–15 سطراً؛ مثال الوحدات يعرّف add في "ملفين" داخل ملف واحد
 * (SyntaxError عند التشغيل)؛ مثال تنظيم المسارات يعرّف usersRouter مرتين ويستدعي دوال غير معرّفة؛
 * مثال الترقيم والفلترة يمرر req.query مباشرة إلى find() — Express يحوّل ?password[$ne]=x إلى
 * عامل MongoDB فيسمح بحقن الاستعلامات (NoSQL injection)، ويقبل limit=1000000؛ مسارات URL
 * ومخطط Middleware موسومة كـ JavaScript؛ لا ذكر لـ async/event loop بعمق ولا لـ ES Modules في
 * Node ولا لـ node --watch؛ رموز الحالة HTTP مذكورة دون متى يُستخدم كل منها.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';
import { NODE_NEW_LESSONS, REST_NEW_LESSONS } from './more-node';

export const BACKEND_NODE_PLAN: CoursePlan = {
  courseId: 'backend-nodejs',
  course: {
    description:
      'تطوير الخلفية بـ Node.js من الأساس إلى الإنتاج: حلقة الأحداث، الوحدات، نظام الملفات، npm، Express، الأحداث والتدفقات، الاختبارات الآلية بـ node:test، وهيكلة مشروع جاهز للإنتاج.',
  },
  sections: [
    { title: 'Node.js', lessons: ['node-1', 'node-2', 'node-3'] },
    { title: 'الأدوات والخادم', lessons: ['node-4', 'node-5'] },    { title: 'ما بعد الأساسيات', lessons: ['node-streams-events', 'node-testing', 'node-project-structure'] },
  ],
  newLessons: NODE_NEW_LESSONS,
  patches: {
    'node-1': {
      description: 'ما Node.js، حلقة الأحداث والإدخال/الإخراج غير الحاجب، الفرق عن JavaScript في المتصفح، وتشغيل أول برنامج',
      content: md`
# مقدمة في Node.js

Node.js بيئة تشغّل JavaScript **خارج المتصفح**، مبنية على محرك V8 (نفس محرك Chrome). بها تكتب خوادم الويب وواجهات API وأدوات سطر الأوامر وسكربتات الأتمتة — باللغة نفسها التي تعرفها من الواجهة.

## ما الذي يختلف عن المتصفح؟
| المتصفح | Node.js |
|---|---|
| \`window\` و \`document\` و DOM | غير موجودة |
| لا وصول للملفات (أمان) | \`fs\` للملفات، \`http\` للشبكة، \`process\` للنظام |
| \`fetch\` و \`localStorage\` | \`fetch\` موجود (Node 18+)، لا localStorage |
| يحمّله المستخدم | يعمل على خادمك: **لا تثق بأي مدخل من العميل** |

## الفكرة الأساسية: لا تنتظر
أغلب عمل الخادم **انتظار**: قراءة قاعدة بيانات، ملف، طلب لخدمة أخرى. Node لا يجمّد البرنامج أثناء الانتظار؛ يسجّل "ماذا يفعل عند الانتهاء" ويخدم طلبات أخرى.
\`\`\`javascript
console.log("1) بداية");
setTimeout(() => console.log("3) بعد 0 ملّي ثانية — لكن بعد انتهاء الكود الحالي"), 0);
Promise.resolve().then(() => console.log("2.5) المهام الصغيرة (Promises) قبل المؤقتات"));
console.log("2) نهاية الكود المتزامن");
\`\`\`
شغّله ولاحظ الترتيب: 1 ← 2 ← 2.5 ← 3.

## حلقة الأحداث (Event Loop)
\`\`\`text
الكود المتزامن ← ينتهي
   ↓
مهام Promises (microtasks) ← كلها
   ↓
المؤقتات / I/O المنتهية / الأحداث (macrotasks) ← واحدة تلو الأخرى، ثم microtasks مجدداً
\`\`\`
Node يعمل بخيط JavaScript **واحد**. لذلك:
- آلاف الاتصالات المتزامنة ممكنة لأن أغلبها ينتظر I/O.
- لكن **حساب ثقيل متزامن** (حلقة بمليار دورة، تشفير كبير متزامن) يجمّد الخادم لكل المستخدمين. استخدم النسخ غير المتزامنة من الدوال، أو \`worker_threads\` للحسابات الثقيلة.

## متى تختار Node؟
- واجهات API وخوادم الوقت الحقيقي (دردشة، إشعارات) — ممتاز.
- فريق يعرف JavaScript ويريد لغة واحدة للواجهة والخلفية.
- أقل ملاءمة لحسابات CPU مكثفة (معالجة فيديو، تعلم آلة) — هناك لغات أنسب.

## التشغيل
\`\`\`bash
node --version          # يفضل إصدار LTS زوجي (20 أو 22)
node app.js             # تشغيل ملف
node --watch app.js     # يعيد التشغيل تلقائياً عند الحفظ (Node 18.11+)
node                    # وضع تفاعلي (REPL) للتجربة
\`\`\`

## تمرين
اكتب \`info.js\` يطبع إصدار Node (\`process.version\`)، ونظام التشغيل (\`process.platform\`)، والمجلد الحالي (\`process.cwd()\`)، ثم توقّع ترتيب الطباعة في مثال حلقة الأحداث قبل تشغيله وتحقق.
`,
    },
    'node-2': {
      description: 'تقسيم الكود إلى وحدات: CommonJS (require/module.exports) و ES Modules (import/export) في Node، الوحدات المدمجة، والفرق بينهما',
      content: md`
# الوحدات (Modules) في Node.js

كل ملف في Node **وحدة** لها نطاقها الخاص: المتغيرات لا تتسرب لغيرها إلا ما تصدّره صراحة. يوجد نظامان — ستقابل الاثنين.

## 1. CommonJS (الأقدم، ما زال شائعاً)
\`\`\`javascript
// math.js
const add = (a, b) => a + b;
const PI = 3.14159;
module.exports = { add, PI };
\`\`\`
\`\`\`javascript
// app.js
const { add, PI } = require("./math");   // ./ = ملف محلي
console.log(add(2, 3), PI);
\`\`\`
- \`require\` متزامن، ويُخزَّن ناتجه: استدعاء الوحدة مرتين يعيد نفس الكائن.
- الامتداد \`.js\` اختياري في require.

## 2. ES Modules (المعيار الحديث)
\`\`\`javascript
// math.mjs
export const add = (a, b) => a + b;
export default function multiply(a, b) { return a * b; }
\`\`\`
\`\`\`javascript
// app.mjs
import multiply, { add } from "./math.mjs";   // الامتداد إلزامي
console.log(add(2, 3), multiply(2, 3));
\`\`\`
لتفعيله لكل ملفات \`.js\`: أضف \`"type": "module"\` إلى package.json. مزاياه: نفس صيغة المتصفح، و**await في المستوى الأعلى** مسموح، وتحليل ثابت (أدوات البناء تحذف الكود غير المستخدم).

| | CommonJS | ES Modules |
|---|---|---|
| التصدير | \`module.exports\` | \`export\` |
| الاستيراد | \`require()\` | \`import\` |
| await في المستوى الأعلى | ❌ | ✅ |
| \`__dirname\` | موجود | \`import.meta.dirname\` (Node 20.11+) |

للمشاريع الجديدة: ES Modules. ولا تخلط الاثنين في نفس الملف.

## الوحدات المدمجة
\`\`\`javascript
const path = require("node:path");
const os = require("node:os");

console.log(path.join("uploads", "images", "a.png"));   // يستخدم فاصل النظام الصحيح
console.log(path.extname("report.pdf"));                // .pdf
console.log(os.cpus().length, "نواة");
\`\`\`
البادئة \`node:\` توضح أنها وحدة مدمجة لا حزمة من npm. أشهرها: \`fs\` و \`path\` و \`http\` و \`crypto\` و \`events\` و \`os\` و \`url\`.

## كيف يجد Node الوحدة؟
- \`./\` أو \`../\`: ملف نسبي لمكان الملف الحالي.
- اسم بلا مسار (\`express\`): حزمة في \`node_modules\` (الدرس القادم).
- \`node:...\`: وحدة مدمجة.

## تمرين
أنشئ \`utils/format.js\` يصدّر \`formatPrice(n)\` (مثلاً "1,500 د.ع") و \`slugify(text)\`، واستورده في \`app.js\` مرة بـ CommonJS ومرة بنسخة ES Modules (\`.mjs\`).
`,
      codeExample: `// مثال واحد يحاكي ملفين ليعمل مباشرة.
// في مشروع حقيقي: كل قسم في ملفه، مع module.exports و require.

// ===== math.js =====
const mathModule = (() => {
  const add = (a, b) => a + b;
  const subtract = (a, b) => a - b;
  const divide = (a, b) => {
    if (b === 0) throw new RangeError("لا يمكن القسمة على صفر");
    return a / b;
  };
  const secretHelper = () => "خاص بالوحدة — غير مصدَّر";
  return { add, subtract, divide };   // module.exports = { add, subtract, divide };
})();

// ===== app.js =====
// const { add, subtract, divide } = require('./math');
const { add, subtract, divide } = mathModule;

console.log("2 + 3 =", add(2, 3));
console.log("10 - 4 =", subtract(10, 4));
try {
  divide(5, 0);
} catch (err) {
  console.log("خطأ:", err.message);
}
console.log("secretHelper مُصدَّرة؟", "secretHelper" in mathModule);

// ===== الوحدات المدمجة =====
const path = require("node:path");
const os = require("node:os");
console.log(path.join("uploads", "2026", "avatar.png"));
console.log("الامتداد:", path.extname("report.final.pdf"));
console.log("نظام التشغيل:", os.platform());`,
    },
    'node-3': {
      description: 'قراءة الملفات وكتابتها بـ fs/promises، المسارات الآمنة، المجلدات، معالجة الأخطاء، والتدفقات للملفات الكبيرة',
      content: md`
# نظام الملفات (fs)

وحدة \`fs\` تقرأ الملفات وتكتبها وتدير المجلدات. لها ثلاث واجهات — استخدم الحديثة.

| الواجهة | مثال | متى |
|---|---|---|
| **Promises** | \`await fs.readFile(...)\` من \`node:fs/promises\` | ✅ الافتراضي |
| Callbacks | \`fs.readFile(path, cb)\` | كود قديم |
| متزامنة | \`fs.readFileSync(...)\` | سكربتات صغيرة وعند بدء التشغيل فقط — **لا في معالجة الطلبات** (تجمّد الخادم) |

## القراءة والكتابة
\`\`\`javascript
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");

async function main() {
  const file = path.join(os.tmpdir(), "kodax-notes.txt");
  await fs.writeFile(file, "السطر الأول\n", "utf8");     // ينشئ أو يستبدل
  await fs.appendFile(file, "السطر الثاني\n", "utf8");   // يضيف للنهاية
  const text = await fs.readFile(file, "utf8");          // بدون "utf8" تحصل على Buffer
  console.log(text.trim().split("\n"));
  await fs.unlink(file);                                  // حذف
}

main().catch((err) => console.error("فشل:", err.message));
\`\`\`

## معالجة الأخطاء
الملف قد لا يوجد، أو بلا صلاحيات. افحص \`err.code\`:
\`\`\`javascript
const fs = require("node:fs/promises");

async function readConfig() {
  try {
    return JSON.parse(await fs.readFile("config-missing.json", "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return { theme: "light" };   // غير موجود ← افتراضي
    throw err;                                               // غيره: لا نخفيه
  }
}
readConfig().then((c) => console.log(c));
\`\`\`
رموز شائعة: \`ENOENT\` (غير موجود)، \`EACCES\` (لا صلاحية)، \`EEXIST\` (موجود مسبقاً).

## المجلدات
\`fs.mkdir(dir, { recursive: true })\` ينشئ المسار كاملاً ولا يفشل إن وُجد. \`fs.readdir(dir)\` يسرد المحتويات، و \`fs.rm(dir, { recursive: true, force: true })\` يحذف مجلداً بمحتواه (بحذر!).

## المسارات: \`__dirname\` و path
المسار النسبي في \`fs\` نسبةً إلى **مكان تشغيل الأمر** لا مكان الملف. للدقة: \`path.join(__dirname, "data", "users.json")\`.

## ⚠️ أمان: لا تبنِ المسار من مدخلات المستخدم مباشرة
\`\`\`javascript
const path = require("node:path");

const UPLOADS = path.resolve("uploads");
function safePath(userFileName) {
  const full = path.resolve(UPLOADS, userFileName);
  if (!full.startsWith(UPLOADS + path.sep)) throw new Error("مسار غير مسموح");
  return full;
}
console.log(safePath("avatar.png"));
try { safePath("../../etc/passwd"); } catch (e) { console.log(e.message); }
\`\`\`
بدون هذا الفحص يستطيع مهاجم طلب \`../../\` والوصول لملفات خارج المجلد (Path Traversal).

## الملفات الكبيرة: Streams
\`readFile\` يحمّل الملف كله في الذاكرة. لملف 2GB استخدم التدفقات: \`fs.createReadStream\` تقرأ قطعة قطعة، و \`pipeline\` من \`node:stream/promises\` تربط القراءة بالكتابة أو الضغط بأمان.

## تمرين
اكتب سكربت \`notes.js\`: \`add "نص"\` يضيف ملاحظة بتاريخها إلى \`notes.json\` (أنشئه إن لم يوجد)، و \`list\` يطبعها. استخدم \`process.argv\` للأوامر و fs/promises للملفات.
`,
      codeExample: `const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");

async function main() {
  // مجلد مؤقت للتجربة (لا نلمس ملفات المشروع)
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kodax-fs-"));
  const notesFile = path.join(dir, "notes.json");

  // ===== قراءة مع قيمة افتراضية إن لم يوجد الملف =====
  async function loadNotes() {
    try {
      return JSON.parse(await fs.readFile(notesFile, "utf8"));
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }

  async function addNote(text) {
    const notes = await loadNotes();
    notes.push({ text, at: new Date().toISOString() });
    await fs.writeFile(notesFile, JSON.stringify(notes, null, 2), "utf8");
  }

  await addNote("تعلم fs/promises");
  await addNote("لا تستخدم readFileSync داخل معالجة الطلبات");

  const notes = await loadNotes();
  notes.forEach((n, i) => console.log(\`\${i + 1}. \${n.text}\`));

  // ===== المجلد =====
  await fs.mkdir(path.join(dir, "archive", "2026"), { recursive: true });
  console.log("محتويات المجلد:", await fs.readdir(dir));

  // ===== التنظيف =====
  await fs.rm(dir, { recursive: true, force: true });
  console.log("تم حذف المجلد المؤقت");
}

main().catch((err) => {
  console.error("فشل:", err.message);
  process.exitCode = 1;
});`,
    },
    'node-4': {
      description: 'npm: package.json، الاعتماديات وأنواعها، الإصدارات الدلالية و package-lock، السكربتات، npx، وأمان الحزم',
      content: md`
# npm وإدارة الحزم

npm (Node Package Manager) يثبّت مكتبات الآخرين ويدير مشروعك. يأتي مع Node.

## بداية مشروع
\`\`\`bash
npm init -y                 # ينشئ package.json بإعدادات افتراضية
npm install express         # اعتمادية تشغيل
npm install -D nodemon      # اعتمادية تطوير فقط
npm install                 # تثبيت كل ما في package.json (بعد clone مثلاً)
npm uninstall express
\`\`\`

## package.json
\`\`\`json
{
  "name": "my-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "test": "node --test"
  },
  "dependencies": { "express": "^5.1.0" },
  "devDependencies": { "eslint": "^9.0.0" },
  "engines": { "node": ">=20" }
}
\`\`\`
| الحقل | المعنى |
|---|---|
| \`dependencies\` | يحتاجها التطبيق ليعمل في الإنتاج |
| \`devDependencies\` | للتطوير فقط (اختبارات، أدوات تنسيق) |
| \`scripts\` | أوامر مختصرة: \`npm run dev\`، و \`npm start\` و \`npm test\` بلا run |
| \`engines\` | إصدار Node المطلوب |

## الإصدارات الدلالية (SemVer)
\`MAJOR.MINOR.PATCH\` مثل \`5.1.2\`:
- PATCH: إصلاحات فقط. MINOR: ميزات متوافقة. MAJOR: تغييرات قد تكسر كودك.
- \`^5.1.0\`: يقبل 5.x.x (لا 6). \`~5.1.0\`: يقبل 5.1.x فقط. \`5.1.0\`: هذا تحديداً.

## package-lock.json
يسجّل **الإصدار الدقيق** لكل حزمة (ولاعتمادياتها) المثبتة. **ارفعه إلى Git** ليحصل الجميع والخادم على نفس الإصدارات. على الخوادم وفي CI استخدم \`npm ci\`: يثبت من الـ lock بالضبط وأسرع.

و \`node_modules\` **لا يُرفع** أبداً (.gitignore).

## npx
\`npx create-vite@latest\` يشغّل أداة من npm دون تثبيتها عالمياً.

## الأمان
كل حزمة تثبتها تشغّل كوداً على جهازك وخادمك:
- تحقق من الاسم (حزم مزيفة بأسماء متشابهة: \`expres\` بدل \`express\`).
- فضّل الحزم النشطة الموثوقة؛ وقلل الاعتماديات.
- \`npm audit\` يعرض الثغرات المعروفة في اعتمادياتك، و \`npm outdated\` الحزم القديمة.
- لا تشغّل \`npm audit fix --force\` بلا مراجعة: قد يرفع إصدارات MAJOR ويكسر المشروع.

## تمرين
أنشئ مشروعاً جديداً، ثبّت \`express\` و \`-D eslint\`، وأضف سكربتي dev و start. احذف \`node_modules\` ثم أعد التثبيت بـ \`npm ci\` وتأكد أن المشروع يعمل.
`,
    },
    'node-5': {
      description: 'أول خادم بـ Express: المسارات وطرق HTTP، المعاملات، قراءة JSON، رموز الحالة، الملفات الثابتة، ومتغير PORT',
      content: md`
# أساسيات Express.js

Node يستطيع إنشاء خادم بوحدة \`http\` المدمجة، لكن Express يجعل التوجيه وقراءة البيانات والاستجابة أبسط بكثير. وهو أشهر إطار خلفي في Node.

## أبسط خادم
\`\`\`javascript
const express = require("express");

const app = express();
app.use(express.json());              // قراءة JSON من جسم الطلب إلى req.body

app.get("/", (req, res) => {
  res.send("مرحباً من Express");
});

const PORT = process.env.PORT || 3000;   // منصات الاستضافة تحدد المنفذ
app.listen(PORT, () => console.log(\`http://localhost:\${PORT}\`));
\`\`\`
\`\`\`bash
npm install express
node --watch server.js
\`\`\`

## المسار = طريقة + مسار + معالج
\`\`\`javascript
const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/books", (req, res) => res.json([]));            // قراءة
app.post("/api/books", (req, res) => res.status(201).json(req.body));   // إنشاء
app.put("/api/books/:id", (req, res) => res.json({ id: req.params.id }));
app.delete("/api/books/:id", (req, res) => res.status(204).end());
\`\`\`

## مصادر البيانات في الطلب
| المصدر | مثال | في الكود |
|---|---|---|
| معاملات المسار | \`/api/books/42\` | \`req.params.id\` ← "42" (**نص دائماً**) |
| سلسلة الاستعلام | \`/api/books?genre=novel\` | \`req.query.genre\` |
| الجسم (JSON) | POST بجسم | \`req.body\` (يحتاج \`express.json()\`) |
| الترويسات | \`Authorization: Bearer ...\` | \`req.get("authorization")\` |

⚠️ \`req.params.id\` نص: \`"42" === 42\` خاطئ. حوّل وتحقق: \`Number(req.params.id)\` مع فحص \`Number.isInteger\`.

## الاستجابة
| الدالة | الاستخدام |
|---|---|
| \`res.json(obj)\` | JSON مع الترويسة الصحيحة |
| \`res.status(201).json(obj)\` | رمز حالة + JSON |
| \`res.status(204).end()\` | نجاح بلا محتوى (بعد الحذف) |
| \`res.send(text)\` | نص أو HTML |

أرسل استجابة **واحدة** لكل طلب: استدعاء \`res.json\` مرتين يعطي خطأ "Cannot set headers after they are sent". استخدم \`return res...\` عند الخروج المبكر.

## الملفات الثابتة
\`app.use(express.static("public"))\` يقدّم ملفات مجلد public (HTML و CSS والصور) مباشرة.

## Express 5
الإصدار 5 (المستقر منذ 2024) يلتقط أخطاء الدوال \`async\` تلقائياً ويمررها لمعالج الأخطاء — في الإصدار 4 كان ذلك يحتاج غلافاً يدوياً (ستراه في درس معالجة الأخطاء).

## تمرين
ابنِ API لقائمة كتب في الذاكرة: جلب الكل، جلب واحد بالمعرّف (404 إن لم يوجد، 400 إن لم يكن رقماً)، إضافة (201 مع التحقق من وجود العنوان)، وحذف (204). جرّبه بـ curl أو Thunder Client.
`,
    },
  },
};

export const BACKEND_REST_PLAN: CoursePlan = {
  courseId: 'backend-rest-api',
  course: {
    description:
      'صمّم واجهات REST احترافية بـ Express: الموارد والطرق ورموز الحالة، المسارات والطلب والاستجابة، Middleware والتحقق والأخطاء، الترقيم والفلترة الآمنة ورفع الملفات، البنية الطبقية والتوثيق بـ OpenAPI — مع مشروع API كامل.',
  },
  sections: [
    { title: 'التصميم', lessons: ['rest-1', 'rest-2', 'rest-3'] },
    { title: 'البنية والجودة', lessons: ['rest-4', 'rest-5', 'rest-6'] },
    { title: 'ميزات متقدمة', lessons: ['rest-7', 'rest-8'] },    { title: 'التطبيق الاحترافي', lessons: ['rest-db-layers', 'rest-openapi'] },
    { title: 'المشروع', lessons: ['rest-project'] },
  ],
  newLessons: REST_NEW_LESSONS,
  patches: {
    'rest-1': {
      description: 'ما REST: الموارد والعناوين، طرق HTTP ومعانيها، الأمان وعدم التكرار (idempotency)، رموز الحالة، وعدم حفظ الحالة',
      content: md`
# مبادئ REST API

الـ API عقد بين الواجهة (أو تطبيق جوال، أو خدمة أخرى) والخادم. **REST** أسلوب لتصميم هذا العقد فوق HTTP بحيث يكون متوقعاً ومتسقاً.

## الموارد والعناوين
كل شيء **مورد** (كتب، مستخدمون، طلبات) له عنوان. العنوان **اسم بالجمع** لا فعل:
| ✅ | ❌ |
|---|---|
| \`GET /books\` | \`GET /getAllBooks\` |
| \`POST /books\` | \`POST /createBook\` |
| \`DELETE /books/42\` | \`GET /deleteBook?id=42\` |
الفعل تحدده **طريقة HTTP**.

## الطرق
| الطريقة | المعنى | آمنة؟ | متكررة بلا أثر إضافي (idempotent)؟ |
|---|---|---|---|
| GET | قراءة | ✅ | ✅ |
| POST | إنشاء (أو إجراء) | ❌ | ❌ — طلبان = موردان |
| PUT | استبدال كامل | ❌ | ✅ |
| PATCH | تعديل جزئي | ❌ | غالباً لا |
| DELETE | حذف | ❌ | ✅ |
- **آمنة**: لا تغيّر شيئاً. لذلك GET يجب ألا يحذف أو يعدّل أبداً (المتصفحات ومحركات البحث تطلب روابط GET تلقائياً).
- **Idempotent**: تكرار الطلب لا يغيّر النتيجة بعد المرة الأولى — مهم عند إعادة المحاولة بعد انقطاع الشبكة.

## رموز الحالة
| الرمز | المعنى | متى |
|---|---|---|
| 200 OK | نجاح | GET، PUT، PATCH |
| 201 Created | أُنشئ | POST (مع المورد الجديد) |
| 204 No Content | نجاح بلا جسم | DELETE |
| 400 Bad Request | مدخلات غير صالحة | فشل التحقق |
| 401 Unauthorized | **غير مسجل** (لا هوية) | لا رمز أو رمز منتهٍ |
| 403 Forbidden | مسجل لكن **غير مسموح** | ليس المالك |
| 404 Not Found | غير موجود | |
| 409 Conflict | تعارض | بريد مستخدم مسبقاً |
| 422 Unprocessable | صيغة صحيحة ومعنى خاطئ | بعض الفرق تفضله للتحقق |
| 429 Too Many Requests | تجاوز الحد | Rate limiting |
| 500 Internal Error | خطأ في الخادم | لا تكشف التفاصيل للعميل |

الرمز الصحيح يسمح للعميل بالتصرف آلياً: 401 ← اطلب تسجيل الدخول، 429 ← انتظر وأعد.

## عدم حفظ الحالة (Stateless)
كل طلب يحمل كل ما يحتاجه الخادم لفهمه (مثل رمز الدخول). الخادم لا يتذكر "الطلب السابق". هذا يسمح بتشغيل عدة نسخ من الخادم خلف موزع حمل.

## شكل البيانات
- JSON بأسماء حقول متسقة (\`createdAt\` أو \`created_at\` — اختر واحداً).
- أخطاء بصيغة موحدة: \`{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }\`.
- تواريخ بصيغة ISO 8601: \`"2026-10-01T12:00:00Z"\`.

## تمرين
صمّم (على الورق) API لمكتبة: الموارد، العناوين، الطرق، رموز الحالة لكل حالة نجاح وفشل، بما فيها: استعارة كتاب مُعار مسبقاً (أي رمز؟).
`,
    },
    'rest-2': {
      description: 'تصميم المسارات: الموارد المتداخلة، سلاسل الاستعلام للفلترة والترتيب، إصدارات API، وتنظيم المسارات بـ express.Router',
      content: md`
# تصميم المسارات (Routes)

## الموارد المتداخلة
عندما ينتمي مورد لآخر:
\`\`\`text
GET  /users/42/posts          منشورات المستخدم 42
POST /users/42/posts          إنشاء منشور له
GET  /posts/7/comments        تعليقات منشور
\`\`\`
لا تتعمق أكثر من مستويين؛ \`/users/42/posts/7/comments/3/likes\` صعب. إذا كان للمورد معرّف فريد عام، استخدمه مباشرة: \`GET /comments/3\`.

## سلسلة الاستعلام: للفلترة لا للهوية
\`\`\`text
/products?category=books&minPrice=10     فلترة
/products?sort=-price,name               ترتيب (- تنازلي)
/products?page=2&limit=20                ترقيم
/products?fields=name,price              اختيار حقول
\`\`\`
القاعدة: **المسار يحدد المورد**، والاستعلام **يعدّل طريقة عرضه**.

## الإصدارات
\`\`\`text
/api/v1/users
\`\`\`
عندما تحتاج تغييراً يكسر العملاء الحاليين (حذف حقل، تغيير شكل)، أطلق \`/api/v2\` وأبقِ v1 فترة. التغييرات المتوافقة (إضافة حقل) لا تحتاج إصداراً جديداً.

## تنظيم المسارات بـ Router
بدل ملف واحد بمئات المسارات، ملف لكل مورد:
\`\`\`text
src/
├── app.js
├── routes/
│   ├── users.routes.js
│   └── products.routes.js
└── controllers/
    └── users.controller.js
\`\`\`
\`\`\`javascript
const express = require("express");

// routes/users.routes.js
const usersRouter = express.Router();
usersRouter.get("/", (req, res) => res.json([]));
usersRouter.get("/:id", (req, res) => res.json({ id: req.params.id }));

// app.js
const app = express();
app.use("/api/v1/users", usersRouter);   // كل مسارات الـ router تبدأ بهذا البادئة
\`\`\`
- **Routes**: أي عنوان يذهب لأي دالة.
- **Controllers**: منطق معالجة الطلب.
- لاحقاً **Services**: منطق العمل والوصول للبيانات — فيصبح Controller رقيقاً وقابلاً للاختبار.

## ترتيب المسارات مهم
Express يطابق بالترتيب: \`/users/:id\` المعرّف قبل \`/users/me\` سيلتقط "me" كمعرّف. ضع المسارات الثابتة أولاً.

## تمرين
نظّم API الكتب من الدرس السابق في Router منفصل تحت \`/api/v1/books\`، وأضف \`GET /api/v1/authors/:id/books\` في Router المؤلفين.
`,
      codeExample: `const express = require("express");

const books = [
  { id: 1, title: "الأيام", authorId: 1, price: 12, category: "سيرة" },
  { id: 2, title: "مدن الملح", authorId: 2, price: 20, category: "رواية" },
  { id: 3, title: "رجال في الشمس", authorId: 3, price: 9, category: "رواية" },
];

// ===== routes/books.routes.js =====
const booksRouter = express.Router();

booksRouter.get("/", (req, res) => {
  let results = [...books];
  const { category, minPrice, sort } = req.query;

  if (typeof category === "string") results = results.filter((b) => b.category === category);
  if (minPrice !== undefined) {
    const min = Number(minPrice);
    if (Number.isNaN(min)) return res.status(400).json({ error: "minPrice يجب أن يكون رقماً" });
    results = results.filter((b) => b.price >= min);
  }
  if (sort === "price") results.sort((a, b) => a.price - b.price);
  if (sort === "-price") results.sort((a, b) => b.price - a.price);

  res.json(results);
});

booksRouter.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "معرّف غير صالح" });
  const book = books.find((b) => b.id === id);
  if (!book) return res.status(404).json({ error: "الكتاب غير موجود" });
  res.json(book);
});

// ===== routes/authors.routes.js =====
const authorsRouter = express.Router();
authorsRouter.get("/:id/books", (req, res) => {
  const id = Number(req.params.id);
  res.json(books.filter((b) => b.authorId === id));
});

// ===== app.js =====
const app = express();
app.use(express.json());
app.use("/api/v1/books", booksRouter);
app.use("/api/v1/authors", authorsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`API على http://localhost:\${PORT}/api/v1/books\`));`,
    },
    'rest-3': {
      description: 'تشريح طلب واستجابة HTTP: الطريقة والترويسات والجسم، Content-Type، أنواع المدخلات في Express، واستجابات متسقة',
      content: md`
# الطلب والاستجابة (Request & Response)

## شكل الطلب
\`\`\`http
POST /api/v1/books?notify=true HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...

{"title": "الأيام", "price": 12}
\`\`\`
سطر الطلب (الطريقة والمسار)، ثم الترويسات، ثم سطر فارغ، ثم الجسم.

## شكل الاستجابة
\`\`\`http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/v1/books/4

{"id": 4, "title": "الأيام", "price": 12}
\`\`\`

## Content-Type مهم
\`express.json()\` يقرأ الجسم فقط إذا كانت ترويسة الطلب \`Content-Type: application/json\`. إذا نسيها العميل، يصبح \`req.body\` فارغاً — من أشهر أسباب "البيانات لا تصل". النماذج التقليدية ترسل \`application/x-www-form-urlencoded\` (يقرؤها \`express.urlencoded()\`)، ورفع الملفات \`multipart/form-data\` (درس رفع الملفات).

## ما يصل من العميل
| المصدر | النوع في Express | ملاحظات |
|---|---|---|
| \`req.params\` | نصوص | من المسار |
| \`req.query\` | نصوص أو **مصفوفات أو كائنات** | \`?tag=a&tag=b\` ← مصفوفة؛ \`?price[gte]=5\` ← كائن! |
| \`req.body\` | أي JSON | قد يحتوي حقولاً لم تتوقعها |
| \`req.headers\` | نصوص (أسماء بأحرف صغيرة) | |

**كل ذلك تحت سيطرة العميل**: لا تفترض أنواعاً ولا حقولاً. تحقق من كل شيء (درس التحقق)، ولا تمرر \`req.body\` كما هو لقاعدة البيانات (قد يحتوي \`role: "admin"\`).

## استجابات متسقة
\`\`\`javascript
const express = require("express");
const app = express();
app.use(express.json());

app.post("/api/v1/books", (req, res) => {
  const { title, price } = req.body ?? {};            // خذ الحقول المسموحة فقط
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "العنوان مطلوب" } });
  }
  const book = { id: 4, title: title.trim(), price: Number(price) || 0 };
  res.status(201).location(\`/api/v1/books/\${book.id}\`).json(book);
});
\`\`\`
- اختر شكلاً واحداً للأخطاء واستخدمه في كل مكان.
- لا ترسل حقولاً حساسة (\`password\`، \`passwordHash\`، رموز داخلية) في الاستجابات أبداً.

## أدوات للتجربة
curl، أو امتداد Thunder Client / REST Client في VS Code، أو Postman/Bruno. مثال:
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/books -H "Content-Type: application/json" -d '{"title":"الأيام"}'
\`\`\`

## تمرين
أرسل طلب POST بلا ترويسة Content-Type ولاحظ \`req.body\`، ثم أرسل \`?tag=a&tag=b\` واطبع \`req.query.tag\` ونوعه.
`,
    },
    'rest-4': {
      description: 'Middleware: السلسلة و next، المدمجة والخارجية (CORS، helmet، تحديد المعدل)، الخاصة بمسار، ومعالج الأخطاء بأربعة معاملات',
      content: md`
# الوسائط (Middleware) في Express

Middleware دالة تقع **بين** وصول الطلب والمعالج النهائي. Express كله سلسلة منها:
\`\`\`text
الطلب ← تسجيل ← JSON ← المصادقة ← التحقق ← المعالج ← الاستجابة
                         (أي حلقة تستطيع إيقاف السلسلة بإرسال استجابة)
\`\`\`

## التوقيع
\`\`\`javascript
function logger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => console.log(\`\${req.method} \${req.originalUrl} \${res.statusCode} \${Date.now() - start}ms\`));
  next();                       // مرّر للحلقة التالية — بدونها يعلق الطلب للأبد
}
\`\`\`
كل Middleware إما أن **يرسل استجابة** أو **يستدعي next()**. نسيان الاثنين = طلب معلّق حتى انتهاء المهلة.

## أين تُركّب؟
\`\`\`javascript
const express = require("express");
const app = express();

app.use(express.json({ limit: "100kb" }));      // لكل الطلبات — مع حد للحجم
app.use("/api", (req, res, next) => next());     // لكل ما يبدأ بـ /api

function requireJson(req, res, next) {
  if (!req.is("application/json")) return res.status(415).json({ error: "JSON فقط" });
  next();
}
app.post("/api/books", requireJson, (req, res) => res.status(201).json(req.body));   // لمسار واحد
\`\`\`
**الترتيب مهم**: \`express.json()\` يجب أن يأتي قبل المسارات التي تقرأ \`req.body\`.

## Middleware شائعة
| الحزمة | الوظيفة |
|---|---|
| \`cors\` | السماح لنطاقات محددة (واجهتك) باستدعاء الـ API من المتصفح. حدد \`origin\` صراحةً؛ \`*\` مع ملفات تعريف الارتباط لا يعمل ولا يُنصح به |
| \`helmet\` | ترويسات أمان افتراضية (منع التضمين، تعطيل كشف التقنية...) |
| \`express-rate-limit\` | حد للطلبات لكل IP — ضروري لمسارات تسجيل الدخول |
| \`morgan\` أو \`pino-http\` | تسجيل الطلبات |
| \`cookie-parser\` | قراءة ملفات تعريف الارتباط |

## معالج الأخطاء: أربعة معاملات
\`\`\`javascript
const express = require("express");
const app = express();

app.get("/boom", (req, res, next) => next(new Error("شيء ما فشل")));

// يُعرَّف بعد كل المسارات، وأول معامل هو الخطأ
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.expose ? err.message : "خطأ في الخادم" });
});
\`\`\`
Express يتعرف عليه من عدد المعاملات (4). أي \`next(err)\` يقفز إليه مباشرة متجاوزاً بقية الوسائط.

## تمرين
اكتب Middleware \`requestId\` يضيف \`req.id\` عشوائياً (\`crypto.randomUUID()\`) ويضعه في ترويسة الاستجابة \`X-Request-Id\`، واطبعه في سجل كل طلب وفي رسائل الأخطاء.
`,
    },
    'rest-5': {
      description: 'التحقق من المدخلات على الخادم: لماذا لا يكفي تحقق الواجهة، القوائم البيضاء للحقول، express-validator و Zod، ورسائل أخطاء مفيدة',
      content: md`
# التحقق من البيانات (Validation)

قاعدة لا استثناء لها: **الخادم لا يثق بأي مدخل**. تحقق الواجهة لراحة المستخدم فقط؛ أي شخص يستطيع إرسال طلب مباشرة بـ curl متجاوزاً واجهتك.

## ماذا نتحقق منه؟
| الفحص | مثال |
|---|---|
| الوجود | \`email\` مطلوب |
| النوع | \`age\` رقم لا نص |
| الصيغة | بريد صالح، تاريخ ISO |
| المدى/الطول | 1 ≤ الكمية ≤ 100، الاسم ≤ 50 حرفاً |
| القيم المسموحة | \`status\` ∈ {pending, paid} |
| **الحقول المسموحة فقط** | تجاهل/ارفض \`role\` و \`isAdmin\` إن أرسلها العميل |

الأخير مهم أمنياً: \`User.create(req.body)\` مع جسم فيه \`"role": "admin"\` = ترقية صلاحيات (Mass Assignment).

## Zod: مخطط واحد للتحقق والأنواع
\`\`\`javascript
const { z } = require("zod");

const createUserSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير").max(50),
  email: z.string().email("بريد غير صالح").toLowerCase(),
  age: z.coerce.number().int().min(13).max(120).optional(),
}).strict();   // ارفض أي حقل غير معرّف (مثل role)

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", details: result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })) },
      });
    }
    req.body = result.data;   // البيانات بعد التنظيف والتحويل
    next();
  };
}
\`\`\`
\`safeParse\` لا يرمي استثناء، و \`result.data\` يحتوي القيم بعد التحويل (أرقام بدل نصوص، أحرف صغيرة...).

## express-validator: البديل الشائع
يعمل بسلسلة قواعد لكل حقل (\`body("email").isEmail().normalizeEmail()\`) ثم \`validationResult(req)\`. المثال الكامل يعرضه. اختر أداة واحدة لمشروعك.

## نصائح
- تحقق من \`params\` و \`query\` أيضاً، لا الجسم فقط (رقم الصفحة، المعرّفات).
- **التحقق ليس بديلاً عن الأمان في الطبقات الأخرى**: استعلامات معاملية في SQL، وتهريب المخرجات في HTML.
- الرسائل للعميل تصف المشكلة دون كشف تفاصيل داخلية.
- قيود قاعدة البيانات (\`NOT NULL\`، \`UNIQUE\`، \`CHECK\`) خط دفاع أخير.

## تمرين
اكتب مخطط Zod لطلب "إنشاء طلبية": مصفوفة عناصر (1–20) كل عنصر \`productId\` نصي و \`quantity\` بين 1 و 10، وعنوان التوصيل اختياري. جرّب إرسال \`quantity: "3"\` و \`quantity: 0\` و حقل إضافي \`discount\`.
`,
    },
    'rest-6': {
      description: 'معالجة الأخطاء المركزية: أصناف أخطاء مخصصة، أخطاء async في Express 4 و 5، معالج عام، 404، وعدم كشف التفاصيل في الإنتاج',
      content: md`
# معالجة الأخطاء (Error Handling)

بدون استراتيجية، كل مسار يعالج أخطاءه بطريقته: رسائل غير متسقة، وتسريب تفاصيل داخلية، ونسيان حالات. الحل: **رمي** الأخطاء من أي مكان، و**معالجتها** في مكان واحد.

## نوعان من الأخطاء
| النوع | أمثلة | الاستجابة |
|---|---|---|
| **تشغيلية** (متوقعة) | مدخل غير صالح، غير موجود، غير مصرح | 4xx مع رسالة واضحة |
| **برمجية** (غير متوقعة) | \`undefined is not a function\`، قاعدة البيانات متوقفة | 500 رسالة عامة + تسجيل كامل للمطور |

## صنف خطأ مخصص
\`\`\`javascript
class AppError extends Error {
  constructor(message, status = 500, code = "INTERNAL") {
    super(message);
    this.status = status;
    this.code = code;
    this.isOperational = status < 500;
  }
}
const notFound = (what) => new AppError(\`\${what} غير موجود\`, 404, "NOT_FOUND");
console.log(notFound("الكتاب").status);
\`\`\`

## أخطاء الدوال async
- **Express 5**: إذا رمت دالة \`async\` أو رُفض Promise، يُمرر الخطأ لمعالج الأخطاء **تلقائياً**.
- **Express 4**: لا يحدث ذلك؛ الخطأ يصبح "unhandled rejection" والطلب يعلق. الحل الشائع غلاف \`asyncHandler\` (في المثال الكامل) أو حزمة \`express-async-errors\`.

## المعالج المركزي
\`\`\`javascript
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);          // سجّل كاملاً للمطور
  res.status(status).json({
    error: {
      code: err.code || "INTERNAL",
      message: status < 500 ? err.message : "حدث خطأ في الخادم",   // لا تكشف التفاصيل
      ...(process.env.NODE_ENV !== "production" && status >= 500 ? { stack: err.stack } : {}),
    },
  });
}
\`\`\`
لا ترسل \`err.stack\` أو رسائل قاعدة البيانات للعميل في الإنتاج: تكشف بنية النظام وتساعد المهاجمين.

## 404 للمسارات غير الموجودة
Middleware عادي **بعد** كل المسارات وقبل معالج الأخطاء: \`app.use((req, res) => res.status(404).json(...))\`.

## أخطاء خارج الطلبات
\`process.on("unhandledRejection")\` و \`process.on("uncaughtException")\`: سجّل الخطأ ثم أنهِ العملية بشكل منظم ودع مدير العمليات (PM2، Docker، المنصة) يعيد تشغيلها — الاستمرار بعد خطأ مجهول قد يترك التطبيق في حالة فاسدة.

## تمرين
أضف للمثال الكامل خطأ \`ConflictError\` (409) يُرمى عند تكرار البريد، وتأكد أن الاستجابة في الإنتاج (\`NODE_ENV=production\`) لا تحتوي stack.
`,
    },
    'rest-7': {
      description: 'الترقيم (offset و cursor) والفلترة والترتيب الآمنة: قوائم بيضاء للحقول والعوامل، حدود قصوى، ومنع حقن عوامل MongoDB',
      content: md`
# الترقيم والفلترة (Pagination & Filtering)

لا تُرجع 100,000 سجل في طلب واحد: بطيء للخادم والشبكة والعميل. الترقيم والفلترة ضروريان — لكنهما أيضاً من أكثر الأماكن عرضة للثغرات.

## الترقيم بالإزاحة (Offset)
\`\`\`text
GET /products?page=3&limit=20   ←   skip = (3 − 1) × 20 = 40
\`\`\`
\`\`\`json
{ "data": [], "pagination": { "page": 3, "limit": 20, "total": 487, "pages": 25, "hasNext": true } }
\`\`\`
- بسيط ويدعم القفز لأي صفحة.
- عيبه: بطيء في الصفحات البعيدة جداً، وإذا أُضيفت سجلات أثناء التصفح تتكرر أو تُفقد عناصر.

## الترقيم بالمؤشر (Cursor)
\`\`\`text
GET /posts?limit=20&after=2026-09-30T10:00:00Z_8f3a
\`\`\`
"أعطني 20 بعد هذا العنصر" (حسب حقل مرتب وفريد). ثابت وسريع مع البيانات المتغيرة — مثالي للتمرير اللانهائي في الخلاصات. لا يسمح بالقفز لصفحة 17.

## الحدود دائماً
\`\`\`javascript
function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}
console.log(parsePagination({ page: "2", limit: "1000000" }));   // limit يُقص إلى 100
\`\`\`
بدون حد أقصى، \`limit=1000000\` طلب واحد يُسقط الخادم.

## ⚠️ الفلترة: لا تمرر req.query لقاعدة البيانات
Express يحلل \`?price[gte]=10\` إلى \`{ price: { gte: "10" } }\` — وكذلك \`?password[$ne]=x\` إلى \`{ password: { $ne: "x" } }\`. إذا مررت الكائن إلى \`Model.find(req.query)\` أو حوّلته بحيلة "أضف $ للعوامل"، يستطيع المهاجم:
- حقن عوامل MongoDB (\`$ne\`، \`$regex\`، \`$where\`) — **NoSQL Injection**.
- الفلترة على حقول لا يجب كشفها (\`passwordHash\`، \`resetToken\`) لاستنتاج قيمها.

**الحل: قوائم بيضاء** للحقول القابلة للفلترة، وللعوامل، وللترتيب، مع تحويل الأنواع:
\`\`\`javascript
const FILTERABLE = { price: "number", category: "string", inStock: "boolean" };
const OPERATORS = { gte: "$gte", lte: "$lte", gt: "$gt", lt: "$lt" };

function buildFilter(query) {
  const filter = {};
  for (const [field, type] of Object.entries(FILTERABLE)) {
    const raw = query[field];
    if (raw === undefined) continue;
    const cast = (v) => (type === "number" ? Number(v) : type === "boolean" ? v === "true" : String(v));
    if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
      for (const [op, value] of Object.entries(raw)) {
        if (!(op in OPERATORS) || typeof value !== "string") continue;   // تجاهل $ne وغيره
        const v = cast(value);
        if (type === "number" && Number.isNaN(v)) continue;
        (filter[field] ??= {})[OPERATORS[op]] = v;
      }
    } else if (typeof raw === "string") {
      filter[field] = cast(raw);
    }
  }
  return filter;
}
console.log(buildFilter({ price: { gte: "10", $ne: "x" }, password: { $ne: "" }, category: "books" }));
\`\`\`
ومع Mongoose فعّل \`mongoose.set("sanitizeFilter", true)\` كطبقة حماية إضافية، وحدد \`select\` للحقول المُعادة.

## الترتيب واختيار الحقول
نفس المبدأ: \`sort\` و \`fields\` من قائمة بيضاء فقط — ترتيب على حقل غير مفهرس قد يكون مكلفاً جداً، وطلب \`fields=passwordHash\` يجب ألا ينجح.

## تمرين
أضف إلى المثال الكامل فلترة \`createdAt[gte]\` بتاريخ (حوّله بـ \`new Date\` وتحقق من صلاحيته)، ثم جرّب إرسال \`?category[$regex]=.*\` وتأكد أنه يُتجاهل.
`,
      codeExample: `// الترقيم والفلترة والترتيب بقوائم بيضاء — يعمل على مصفوفة في الذاكرة
// (نفس منطق بناء الفلتر يُمرر لـ MongoDB أو يُحوَّل لـ SQL معاملي)

const products = Array.from({ length: 57 }, (_, i) => ({
  id: i + 1,
  name: \`منتج \${i + 1}\`,
  price: 5 + ((i * 37) % 200),
  category: ["كتب", "إلكترونيات", "ملابس"][i % 3],
  inStock: i % 4 !== 0,
  passwordHash: "لا يجب كشفه أبداً",   // حقل حساس للتوضيح
}));

const FILTERABLE = { price: "number", category: "string", inStock: "boolean" };
const OPERATORS = { gte: (a, b) => a >= b, lte: (a, b) => a <= b, gt: (a, b) => a > b, lt: (a, b) => a < b };
const SORTABLE = new Set(["price", "name", "id"]);
const SELECTABLE = new Set(["id", "name", "price", "category", "inStock"]);

const cast = (type, v) => (type === "number" ? Number(v) : type === "boolean" ? v === "true" : String(v));

function buildPredicates(query) {
  const preds = [];
  for (const [field, type] of Object.entries(FILTERABLE)) {
    const raw = query[field];
    if (raw === undefined) continue;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const [op, value] of Object.entries(raw)) {
        if (!OPERATORS[op] || typeof value !== "string") continue;   // يتجاهل $ne و $regex...
        const v = cast(type, value);
        if (type === "number" && Number.isNaN(v)) continue;
        preds.push((p) => OPERATORS[op](p[field], v));
      }
    } else if (typeof raw === "string") {
      const v = cast(type, raw);
      preds.push((p) => p[field] === v);
    }
  }
  return preds;
}

function listProducts(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 10));

  let rows = products.filter((p) => buildPredicates(query).every((fn) => fn(p)));

  if (typeof query.sort === "string") {
    const desc = query.sort.startsWith("-");
    const field = query.sort.replace(/^-/, "");
    if (SORTABLE.has(field)) rows.sort((a, b) => (a[field] > b[field] ? 1 : -1) * (desc ? -1 : 1));
  }

  const fields = typeof query.fields === "string" ? query.fields.split(",").filter((f) => SELECTABLE.has(f)) : [...SELECTABLE];
  const total = rows.length;
  const data = rows.slice((page - 1) * limit, page * limit).map((p) => Object.fromEntries(fields.map((f) => [f, p[f]])));

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit), hasNext: page * limit < total } };
}

// كما يحللها Express: ?price[gte]=100&category=كتب&sort=-price&fields=name,price&page=1&limit=3
console.log(JSON.stringify(listProducts({ price: { gte: "100" }, category: "كتب", sort: "-price", fields: "name,price", page: "1", limit: "3" }), null, 1));

// محاولات خبيثة: عوامل غير مسموحة، حقل حساس، limit ضخم
const attack = listProducts({ price: { $ne: "0" }, passwordHash: { $ne: "" }, fields: "passwordHash", limit: "1000000" });
console.log("حقول مُعادة:", Object.keys(attack.data[0]), "| limit المطبق:", attack.pagination.limit);`,
    },
    'rest-8': {
      description: 'رفع الملفات بأمان: multipart/form-data، multer مع حدود الحجم والعدد، التحقق من النوع الحقيقي، أسماء آمنة، والتخزين السحابي',
      content: md`
# رفع الملفات (File Upload)

رفع الملفات من أخطر نقاط أي تطبيق: ملف ضخم يملأ القرص، أو "صورة" هي في الحقيقة سكربت، أو اسم ملف \`../../server.js\`.

## كيف يصل الملف؟
النموذج أو الطلب يُرسل بصيغة \`multipart/form-data\` (لا JSON):
\`\`\`html
<form action="/api/avatar" method="post" enctype="multipart/form-data">
    <input type="file" name="avatar" accept="image/png,image/jpeg">
    <button type="submit">رفع</button>
</form>
\`\`\`
\`express.json()\` لا يقرأ هذه الصيغة؛ نحتاج **multer** (أو busboy).

## multer مع حدود
\`\`\`javascript
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),                 // أو diskStorage
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB، ملف واحد
  fileFilter: (req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("نوع غير مسموح"), ok);
  },
});
// app.post("/api/avatar", requireAuth, upload.single("avatar"), handler)
\`\`\`
**بلا \`limits\`** يستطيع أي شخص رفع ملف بحجم القرص كله.

## لا تثق بالنوع ولا بالاسم
- \`file.mimetype\` والامتداد **يرسلهما العميل** ويمكن تزويرهما. افحص **التوقيع الحقيقي** للملف (البايتات الأولى: PNG يبدأ بـ \`89 50 4E 47\`) بمكتبة مثل \`file-type\`، أو أعد معالجة الصورة بمكتبة صور (sharp) — يزيل أيضاً البيانات الوصفية مثل موقع GPS.
- **لا تستخدم اسم الملف الأصلي** للحفظ: ولّد اسماً عشوائياً (\`crypto.randomUUID() + ".png"\`) وخزّن الاسم الأصلي في قاعدة البيانات إن احتجته.
- لا تحفظ الملفات المرفوعة داخل مجلد يُنفَّذ أو يُقدَّم كصفحات (مثل public مع HTML). ملف \`.html\` مرفوع ومقدَّم من نطاقك = XSS.

## أين تُخزَّن؟
| الخيار | ملاحظات |
|---|---|
| قرص الخادم | بسيط، لكنه يضيع مع إعادة النشر على أغلب المنصات الحديثة ولا يتوسع لعدة خوادم |
| **تخزين سحابي** (S3، Cloudflare R2، Supabase Storage، Firebase Storage) | الحل المعتاد؛ والأفضل: الخادم يصدر **رابط رفع موقّع** قصير المدة، والعميل يرفع مباشرة دون أن يمر الملف بخادمك |

## معالجة أخطاء multer
تجاوز الحد يرمي \`multer.MulterError\` برمز مثل \`LIMIT_FILE_SIZE\`؛ حوّله في معالج الأخطاء إلى 413 أو 400 برسالة واضحة.

## تمرين
أضف إلى المثال الكامل فحص توقيع الملف (أول 4 بايتات) لـ PNG و JPEG من \`req.file.buffer\`، وارفض الملف إذا لم يطابق ادعاء mimetype.
`,
    },
  },
};

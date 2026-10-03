/**
 * منهج web-js-basics — JavaScript الأساسيات.
 *
 * كان: 13 درساً بشرح جيد غالباً، لكن: درسا "ES6+" و "OOP" (js-adv-1/2) مربوطان بدورة
 * web-js-advanced غير الموجودة فلا يظهران لأحد؛ لا درس لمعالجة الأخطاء (try/catch) رغم
 * استخدامها في درس async، ولا للوحدات (import/export) رغم أن كل مشروع حديث يعتمد عليها؛
 * أمثلة تستخدم متغيرات غير معرّفة (name، getUserInput، response، Animal، Admin)؛ مثال
 * "التسلسلي مقابل المتوازي" يعرّف users مرتين (SyntaxError)؛ تطبيق المهام يستخدم Date.now()
 * معرّفاً فتتكرر المعرفات لمهمتين في نفس الملّي ثانية (حذف/تبديل الاثنتين معاً)؛ أجزاء من
 * صنف TodoApp معروضة كدوال منفصلة لا تُترجم؛ واختبار المشروع خياراته غير جادة.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';

export const WEB_JS_PLAN: CoursePlan = {
  courseId: 'web-js-basics',
  course: {
    description:
      'تعلّم JavaScript من الصفر حتى بناء تطبيق: المتغيرات والأنواع، الشروط والحلقات، الدوال والمصفوفات والكائنات، JSON، ميزات ES6+ والأصناف، معالجة الأخطاء والوحدات، DOM والأحداث، البرمجة غير المتزامنة والتخزين — مع مشروع تطبيق مهام.',
  },
  adopt: ['js-adv-1', 'js-adv-2'],
  sections: [
    { title: 'البداية', lessons: ['js-1', 'js-2', 'js-3'] },
    { title: 'التحكم في التدفق', lessons: ['js-4', 'js-5'] },
    { title: 'الدوال والبيانات', lessons: ['js-6', 'js-7', 'js-8', 'js-json-basics'] },
    { title: 'JavaScript الحديثة', lessons: ['js-adv-1', 'js-adv-2', 'js-errors', 'js-modules'] },
    { title: 'المتصفح', lessons: ['js-9', 'js-10', 'js-11'] },
    { title: 'المشروع', lessons: ['js-12'] },
  ],
  contentFixes: {
    'js-2': [["let single = 'مرحباً';", "let name = \"سارة\";\nlet single = 'مرحباً';"]],
    'js-4': [
      ['let username = getUserInput();', 'let username = "";  // مثلاً: حقل إدخال تركه المستخدم فارغاً'],
      ['let name = inputName || "زائر";', 'let inputName = "";\nlet name = inputName || "زائر";'],
    ],
    'js-6': [['// اختصار (بدون أقواس للمعامل الواحد)\nconst greet = name =>', '// اختصار (بدون أقواس للمعامل الواحد)\nconst greetShort = name =>']],
    'js-10': [
      [
        '// Callback Hell 😱\ngetData(function(a) {\n  processA(a, function(b) {\n    processB(b, function(c) {\n      processC(c, function(d) {\n        // 🔥 Pyramid of Doom!\n      });\n    });\n  });\n});',
        '// Callback Hell 😱 (توضيح: getData و processA... دوال افتراضية تأخذ callback)\nfunction loadEverything() {\n  getData(function(a) {\n    processA(a, function(b) {\n      processB(b, function(c) {\n        processC(c, function(d) {\n          // 🔥 Pyramid of Doom!\n        });\n      });\n    });\n  });\n}',
      ],
      [
        'async function fetchAll() {\n  // ❌ تسلسلي (بطيء)\n  const users = await fetch("/api/users");\n  const posts = await fetch("/api/posts");\n  const comments = await fetch("/api/comments");\n  \n  // ✅ متوازي (أسرع)\n',
        '// ❌ تسلسلي (بطيء): كل طلب ينتظر انتهاء الذي قبله\nasync function fetchSequential() {\n  const usersRes = await fetch("/api/users");\n  const postsRes = await fetch("/api/posts");\n  return [await usersRes.json(), await postsRes.json()];\n}\n\n// ✅ متوازي (أسرع): الطلبات تنطلق معاً\nasync function fetchAll() {\n',
      ],
    ],
    'js-12': [
      ['    id: Date.now(),', '    id: crypto.randomUUID(),  // Date.now() قد يتكرر لمهمتين في نفس الملّي ثانية'],
      [
        'addTodo(text) {\n  const todo = {',
        'class TodoApp {\n  // ... المُنشئ و saveTodos و render كما في المثال الكامل\n\naddTodo(text) {\n  const todo = {',
      ],
      ['  this.todos.push(todo);\n  this.saveTodos();\n  this.render();\n}', '  this.todos.push(todo);\n  this.saveTodos();\n  this.render();\n}\n}'],
      ['deleteTodo(id) {\n  this.todos = this.todos.filter(t => t.id !== id);\n  this.saveTodos();', 'class TodoApp {\n  // ...\n\ndeleteTodo(id) {\n  this.todos = this.todos.filter(t => t.id !== id);\n  this.saveTodos();'],
      [
        '    todo.completed = !todo.completed;\n    this.saveTodos();\n    this.render();\n  }\n}',
        '    todo.completed = !todo.completed;\n    this.saveTodos();\n    this.render();\n  }\n}\n}',
      ],
    ],
    'js-adv-1': [
      ['const { user: { name, address: { city } } } = response;', 'const response = { user: { name: "سارة", address: { city: "بغداد" } } };\nconst { user: { name, address: { city } } } = response;'],
      ['const { name: userName = "زائر" } = user;', 'const user = {};  // لا يوجد name\nconst { name: userName = "زائر" } = user;  // userName = "زائر"'],
    ],
    'js-adv-2': [
      ['// Mixin للقدرات المشتركة\n', 'class Animal {\n  constructor(name) { this.name = name; }\n}\n\n// Mixin للقدرات المشتركة\n'],
      [
        'class UserFactory {',
        "class User { constructor(data) { this.name = data.name; this.role = 'user'; } }\nclass Admin extends User { constructor(data) { super(data); this.role = 'admin'; } }\nclass Editor extends User { constructor(data) { super(data); this.role = 'editor'; } }\n\nclass UserFactory {",
      ],
    ],
  },
  codeFixes: {
    'js-12': [['      id: Date.now(),', '      id: crypto.randomUUID(),  // Date.now() قد يتكرر لمهمتين أُضيفتا في نفس الملّي ثانية']],
  },
  patches: {
    'js-12': {
      quiz: {
        question: 'لماذا استبدلنا Date.now() بـ crypto.randomUUID() كمعرّف للمهام؟',
        options: [
          'لأن Date.now() غير موجودة في المتصفحات',
          'لأن مهمتين تُضافان في نفس الملّي ثانية تحصلان على نفس المعرّف، فيحذف أو يبدّل الأمر الاثنتين معاً',
          'لأن randomUUID أسرع',
          'لأن المعرّف يجب أن يكون نصاً عربياً',
        ],
        correctAnswer: 1,
        explanation: 'المعرّف يجب أن يكون فريداً؛ randomUUID يولّد معرّفاً فريداً عملياً في كل استدعاء.',
      },
    },
    'js-adv-1': {
      description: 'Destructuring المتقدم، Template Literals، Symbols، Generators، Proxy، Map و Set، و ?. و ??',
    },
    'js-adv-2': {
      description: 'الأصناف (class): الحقول الخاصة #، getters/setters، static، الوراثة و super، Mixins، وأنماط تصميم شائعة',
    },
  },
  newLessons: [
    {
      id: 'js-errors',
      title: 'معالجة الأخطاء وتتبعها',
      description: 'أنواع الأخطاء، try و catch و finally، رمي أخطاء مخصصة، الأخطاء في الكود غير المتزامن، وتتبع الأخطاء بأدوات المطور',
      language: 'javascript',
      xpReward: 150,
      content: md`
# معالجة الأخطاء وتتبعها

البرامج الحقيقية تواجه مدخلات خاطئة، وشبكة مقطوعة، وبيانات ناقصة. الفرق بين برنامج احترافي وآخر هش ليس "عدم وجود أخطاء" بل **التعامل معها**: رسالة واضحة للمستخدم بدل صفحة بيضاء.

## أنواع الأخطاء الشائعة
| النوع | متى | مثال |
|---|---|---|
| \`SyntaxError\` | الكود نفسه غير صحيح نحوياً (لا يعمل أصلاً) | قوس ناقص |
| \`ReferenceError\` | استخدام متغير غير معرّف | \`console.log(userNmae)\` |
| \`TypeError\` | عملية على نوع لا يدعمها | \`null.length\`، استدعاء ما ليس دالة |
| \`RangeError\` | قيمة خارج المدى المسموح | \`new Array(-1)\` |

\`\`\`javascript
const user = null;
try {
  console.log(user.name);      // TypeError: Cannot read properties of null
} catch (error) {
  console.log(error.name);     // TypeError
  console.log(error.message);  // Cannot read properties of null (reading 'name')
}
\`\`\`
اقرأ رسالة الخطأ **كاملة**: نوعه، ورسالته، ورقم السطر. أغلب الأخطاء تشرح نفسها.

## try و catch و finally
\`\`\`javascript
function parseSettings(text) {
  try {
    const settings = JSON.parse(text);
    return settings;
  } catch (error) {
    console.log("إعدادات تالفة، نستخدم الافتراضية:", error.message);
    return { theme: "light" };
  } finally {
    console.log("انتهت محاولة قراءة الإعدادات");  // يُنفَّذ دائماً
  }
}

console.log(parseSettings('{"theme":"dark"}'));
console.log(parseSettings("{خطأ"));
\`\`\`
- \`try\`: الكود الذي قد يفشل.
- \`catch (error)\`: يُنفَّذ فقط عند حدوث خطأ؛ \`error\` كائن فيه \`name\` و \`message\` و \`stack\`.
- \`finally\`: يُنفَّذ **دائماً** — للتنظيف (إخفاء مؤشر التحميل، إغلاق مورد).

## رمي الأخطاء: throw
دالتك تستطيع الإبلاغ عن مشكلة لمن استدعاها:
\`\`\`javascript
function withdraw(balance, amount) {
  if (typeof amount !== "number" || amount <= 0) {
    throw new TypeError("المبلغ يجب أن يكون رقماً موجباً");
  }
  if (amount > balance) {
    throw new RangeError("الرصيد غير كافٍ");
  }
  return balance - amount;
}

try {
  withdraw(100, 500);
} catch (error) {
  console.log(\`\${error.name}: \${error.message}\`);  // RangeError: الرصيد غير كافٍ
}
\`\`\`
ارمِ دائماً كائن \`Error\` (أو مشتقاً منه)، لا نصاً: \`throw "خطأ"\` يفقد \`stack\` الذي يدلك على مكان المشكلة.

## أخطاء مخصصة
\`\`\`javascript
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function validateUser(user) {
  if (!user.email?.includes("@")) throw new ValidationError("email", "بريد غير صالح");
  return true;
}

try {
  validateUser({ email: "sara.example.com" });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(\`الحقل \${error.field}: \${error.message}\`);  // نعرضه بجانب الحقل
  } else {
    throw error;  // خطأ لم نتوقعه: لا نبتلعه
  }
}
\`\`\`
**لا تبتلع الأخطاء**: \`catch (e) {}\` الفارغ يخفي المشاكل ويجعل التتبع مستحيلاً. التقط ما تعرف كيف تعالجه، وأعد رمي الباقي.

## الأخطاء في الكود غير المتزامن
مع \`async/await\` تعمل try/catch كالمعتاد:
\`\`\`javascript
async function loadUser(id) {
  try {
    const response = await fetch(\`https://jsonplaceholder.typicode.com/users/\${id}\`);
    if (!response.ok) throw new Error(\`فشل الطلب: \${response.status}\`);  // fetch لا يرمي عند 404!
    return await response.json();
  } catch (error) {
    console.error("تعذر تحميل المستخدم:", error.message);
    return null;
  }
}
\`\`\`
⚠️ \`fetch\` لا يرمي خطأ عند الحالة 404 أو 500 — فقط عند فشل الشبكة. افحص \`response.ok\` دائماً.

مع Promises بدون await استخدم \`.catch()\`. الـ Promise المرفوض بلا معالجة يظهر في الطرفية كـ "Uncaught (in promise)".

## التتبع (Debugging)
1. **اقرأ الرسالة ورقم السطر** في الطرفية (Console)، وانقر على اسم الملف للقفز للسطر.
2. **console.log** ذكياً: \`console.log({ user, total })\` يطبع الأسماء مع القيم. و \`console.table(array)\` للمصفوفات.
3. **نقاط التوقف (Breakpoints)**: في تبويب Sources انقر على رقم السطر؛ يتوقف التنفيذ هناك وترى قيم كل المتغيرات، ثم تتقدم سطراً سطراً. أو اكتب \`debugger;\` في الكود.
4. **صغّر المشكلة**: احذف الأجزاء حتى تبقى أصغر نسخة تُظهر الخطأ.

## متى نستخدم try/catch؟
- حول العمليات التي **قد تفشل لأسباب خارجية**: \`JSON.parse\` لبيانات من مصدر خارجي، طلبات الشبكة، \`localStorage\` (قد يكون ممتلئاً أو محظوراً).
- **ليس** بديلاً عن الفحص العادي: إذا كان يمكن فحص الشرط بـ if فافحصه.

## تمرين
اكتب دالة \`safeDivide(a, b)\` ترمي \`TypeError\` إذا لم يكن المعاملان رقمين و \`RangeError\` عند القسمة على صفر. استدعها بثلاث حالات داخل try/catch واطبع نوع كل خطأ. ثم اكتب \`loadSettings()\` تقرأ JSON من localStorage وتعيد إعدادات افتراضية إذا كان تالفاً.
`,
      codeExample: `// خطأ مخصص يحمل اسم الحقل
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function validateSignup({ name, email, age }) {
  if (!name || name.trim().length < 2) throw new ValidationError("name", "الاسم قصير جداً");
  if (!email?.includes("@")) throw new ValidationError("email", "بريد غير صالح");
  if (!Number.isInteger(age) || age < 13) throw new ValidationError("age", "العمر يجب أن يكون 13 فأكثر");
  return true;
}

const attempts = [
  { name: "سارة", email: "sara@example.com", age: 20 },
  { name: "ع", email: "ali@example.com", age: 20 },
  { name: "عمر", email: "omar.example.com", age: 20 },
  { name: "ليلى", email: "layla@example.com", age: 10 },
];

for (const data of attempts) {
  try {
    validateSignup(data);
    console.log(\`✅ \${data.name}: بيانات صحيحة\`);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log(\`❌ \${data.name}: [\${error.field}] \${error.message}\`);
    } else {
      throw error; // خطأ غير متوقع: لا نخفيه
    }
  }
}

// JSON تالف مع قيمة افتراضية و finally
function parseSettings(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.log(\`⚠️ \${error.name}: نستخدم الإعدادات الافتراضية\`);
    return { theme: "light", fontSize: 16 };
  } finally {
    console.log("تمت محاولة قراءة الإعدادات");
  }
}

console.log(parseSettings('{"theme":"dark","fontSize":18}'));
console.log(parseSettings("{تالف"));

// الأخطاء مع async/await
async function riskyTask(shouldFail) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  if (shouldFail) throw new Error("فشلت المهمة");
  return "نجحت المهمة";
}

(async () => {
  for (const fail of [false, true]) {
    try {
      console.log(await riskyTask(fail));
    } catch (error) {
      console.log("التقطنا:", error.message);
    }
  }
})();`,
      quiz: {
        question: 'طلب fetch أعاد الحالة 404. ماذا يحدث داخل try/catch إذا لم تفحص response.ok؟',
        options: [
          'يُنفَّذ catch تلقائياً',
          'لا يُرمى خطأ؛ يكمل الكود كأن الطلب نجح — لذلك يجب فحص response.ok',
          'يتوقف البرنامج',
          'يعيد fetch القيمة null',
        ],
        correctAnswer: 1,
        explanation: 'fetch يرفض فقط عند فشل الشبكة؛ حالات HTTP مثل 404 و 500 تعتبر استجابة ناجحة تقنياً.',
      },
    },
    {
      id: 'js-modules',
      title: 'الوحدات: import و export',
      description: 'تقسيم الكود إلى ملفات: التصدير المسمّى والافتراضي، الاستيراد، الوحدات في المتصفح مع type="module"، الاستيراد الديناميكي، و npm باختصار',
      language: 'javascript',
      xpReward: 150,
      content: md`
# الوحدات (Modules): import و export

عندما يكبر مشروعك يصبح ملف واحد من 2000 سطر كابوساً. **الوحدات** تقسم الكود إلى ملفات صغيرة، لكل منها مسؤولية واحدة، وكل ملف يقرر ما **يصدّره** للآخرين وما يبقيه خاصاً به.

## التصدير المسمّى (Named Export)
\`\`\`javascript
// math.js
export const PI = 3.14159;

export function circleArea(r) {
  return PI * r * r;
}

function helper() {      // غير مصدَّر: خاص بهذا الملف
  return 42;
}
\`\`\`
\`\`\`javascript
// main.js
import { circleArea, PI } from "./math.js";
import { circleArea as area } from "./math.js";   // إعادة تسمية
import * as math from "./math.js";                 // كل شيء ككائن: math.circleArea

console.log(circleArea(2));
\`\`\`
الأسماء بين \`{ }\` يجب أن تطابق أسماء التصدير تماماً.

## التصدير الافتراضي (Default Export)
\`\`\`javascript
// TodoList.js
export default class TodoList {
  constructor() { this.items = []; }
}
\`\`\`
\`\`\`javascript
// main.js
import TodoList from "./TodoList.js";   // بلا أقواس، وأي اسم تختاره
\`\`\`
ملف واحد له تصدير افتراضي **واحد** فقط. كثير من الفرق تفضّل التصديرات المسمّاة فقط: الأسماء ثابتة في كل المشروع وأسهل في البحث وإعادة الهيكلة.

## الوحدات في المتصفح
\`\`\`html
<script type="module" src="js/main.js"></script>
\`\`\`
- \`type="module"\` إلزامي لاستخدام import/export.
- الوحدات تُنفَّذ **مؤجلة** تلقائياً (كأن معها \`defer\`).
- كل وحدة لها **نطاق خاص**: المتغيرات لا تتسرب إلى \`window\`.
- تعمل في **الوضع الصارم** (strict mode) تلقائياً.
- ⚠️ لا تعمل عند فتح الملف مباشرة (\`file://\`) بسبب قيود الأمان؛ تحتاج خادماً محلياً (إضافة Live Server في VS Code، أو \`npx serve\`).
- اكتب الامتداد \`.js\` في المسار — المتصفح لا يخمّنه.

## هيكل مشروع نموذجي
\`\`\`text
todo-app/
├── index.html
└── js/
    ├── main.js        ← نقطة البداية: تربط كل شيء
    ├── storage.js     ← حفظ وتحميل من localStorage
    ├── todos.js       ← منطق المهام (بلا DOM)
    └── ui.js          ← الرسم والأحداث
\`\`\`
فصل **المنطق** (todos.js) عن **الواجهة** (ui.js) يجعل المنطق قابلاً للاختبار وإعادة الاستخدام (حتى في React لاحقاً).

## الاستيراد الديناميكي
تحميل وحدة **عند الحاجة** فقط (ميزة نادرة الاستخدام لا داعي لتحميلها مع الصفحة):
\`\`\`javascript
async function openChart() {
  const { drawChart } = await import("./chart.js");
  drawChart();
}
\`\`\`

## مثال يعمل في Node.js
Node يدعم الوحدات نفسها (ESM) إذا كان الملف بامتداد \`.mjs\` أو في \`package.json\`: \`"type": "module"\`. المثال الكامل لهذا الدرس يحاكي ملفين في ملف واحد لتجربته مباشرة.

## npm باختصار
مكتبات الآخرين تُثبَّت بـ npm وتُستورد باسمها بلا مسار:
\`\`\`javascript
// بعد: npm install dayjs
import dayjs from "dayjs";
console.log(dayjs().format("YYYY-MM-DD"));
\`\`\`
الاستيراد باسم الحزمة يحتاج **أداة بناء** (مثل Vite) أو Node — المتصفح وحده لا يعرف أين \`dayjs\`. ستتعامل مع هذا في React.

## CommonJS: الأسلوب القديم
في كود Node القديم ستجد \`const fs = require("fs")\` و \`module.exports = ...\`. هذا نظام وحدات أقدم (CommonJS). الكود الجديد يستخدم \`import\`/\`export\` (ESM) في كل مكان.

## تمرين
قسّم تطبيق المهام (درس المشروع) إلى أربعة ملفات كما في الهيكل أعلاه، واربطها بـ \`<script type="module">\`، وشغّله عبر Live Server. تأكد أن \`todos.js\` لا يحتوي أي \`document\`.
`,
      codeExample: `// هذا المثال يحاكي وحدتين في ملف واحد ليعمل مباشرة.
// في مشروع حقيقي: كل قسم في ملفه الخاص مع import/export.

// ===== todos.js — منطق نقي بلا DOM =====
const todosModule = (() => {
  let items = [];

  function add(text) {
    const trimmed = text.trim();
    if (!trimmed) throw new Error("نص المهمة فارغ");
    const todo = { id: crypto.randomUUID(), text: trimmed, done: false };
    items = [...items, todo];
    return todo;
  }

  function toggle(id) {
    items = items.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  }

  function remaining() {
    return items.filter((t) => !t.done).length;
  }

  const all = () => items;

  // export { add, toggle, remaining, all };
  return { add, toggle, remaining, all };
})();

// ===== main.js =====
// import { add, toggle, remaining, all } from "./todos.js";
const { add, toggle, remaining, all } = todosModule;

const first = add("تعلم الوحدات");
add("تقسيم المشروع إلى ملفات");
toggle(first.id);

for (const t of all()) {
  console.log(\`\${t.done ? "✅" : "⬜"} \${t.text}\`);
}
console.log("المتبقي:", remaining());

try {
  add("   ");
} catch (error) {
  console.log("رُفضت المهمة:", error.message);
}`,
      quiz: {
        question: 'لماذا لا يعمل import في صفحة فُتحت مباشرة من القرص (file://) حتى مع type="module"؟',
        options: [
          'لأن import غير مدعوم في المتصفحات',
          'لأن المتصفحات تمنع تحميل الوحدات من file:// لأسباب أمنية؛ تحتاج خادماً محلياً',
          'لأن يجب كتابة require بدلاً منها',
          'لأن الملف يجب أن يكون .ts',
        ],
        correctAnswer: 1,
        explanation: 'الوحدات تُحمَّل بسياسة CORS، و file:// لا يحققها؛ استخدم Live Server أو npx serve.',
      },
    },
  ],
};

/**
 * توسيع backend-nodejs و backend-rest-api.
 * الفجوة: الدورتان تتوقفان عند "خادم يعمل": لا أحداث وتدفقات، لا اختبارات، لا هيكلة مشروع،
 * لا ربط بطبقة بيانات، لا توثيق للـ API، ولا مشروع ختامي.
 * الأمثلة تستخدم وحدات Node المدمجة فقط حيث أمكن لتُشغَّل فعلياً (بما فيها الاختبارات بـ node:test).
 */
import type { NewLesson } from '../types';
import { md } from '../md';

export const NODE_NEW_LESSONS: NewLesson[] = [
  {
    id: 'node-streams-events',
    title: 'الأحداث والتدفقات (Events & Streams)',
    description: 'EventEmitter ونمط الأحداث، التدفقات الأربعة، pipeline والضغط العكسي (backpressure)، ومعالجة ملفات ضخمة سطراً بسطر دون استنزاف الذاكرة',
    language: 'javascript',
    xpReward: 160,
    content: md`
# الأحداث والتدفقات

نصف Node مبني على فكرتين: **الأحداث** (شيء حدث، من يهتم؟) و**التدفقات** (بيانات تصل قطعة قطعة). الخادم HTTP نفسه، وقراءة الملفات، والاتصالات بقاعدة البيانات — كلها تستخدمهما.

## EventEmitter
\`\`\`javascript
const { EventEmitter } = require("node:events");

class OrderService extends EventEmitter {
  place(order) {
    // ... حفظ الطلب ...
    this.emit("order:placed", order);          // أعلن: من يهتم فليستمع
  }
}

const orders = new OrderService();
orders.on("order:placed", (o) => console.log("📧 بريد تأكيد إلى", o.email));
orders.on("order:placed", (o) => console.log("📦 إشعار المخزن بالطلب", o.id));
orders.once("order:placed", () => console.log("🎉 أول طلب اليوم!"));   // مرة واحدة فقط
orders.place({ id: 1, email: "sara@example.com" });
orders.place({ id: 2, email: "omar@example.com" });
\`\`\`
- المستمعون يُستدعون **بالترتيب وبشكل متزامن** عند \`emit\`.
- **حدث \`error\` خاص**: إن أُطلق ولا مستمع له، يُرمى الخطأ ويسقط البرنامج. استمع لـ \`error\` دائماً على أي EventEmitter أو تدفق.
- انزع المستمعين عندما لا تحتاجهم (\`off\`) — تحذير "MaxListenersExceeded" غالباً يعني تسرباً.
- الفائدة: فصل الأجزاء — خدمة الطلبات لا تعرف شيئاً عن البريد أو المخزن.

## لماذا التدفقات؟
\`fs.readFile\` على ملف سجلات 4GB يحاول وضعه كله في الذاكرة. التدفق يقرأ **قطعة صغيرة** (64KB افتراضياً)، يعالجها، ويطلب التالية — الذاكرة ثابتة مهما كبر الملف.

| النوع | المثال |
|---|---|
| **Readable** (مصدر) | \`fs.createReadStream\`، طلب HTTP الوارد |
| **Writable** (وجهة) | \`fs.createWriteStream\`، استجابة HTTP |
| **Duplex** | اتصال TCP |
| **Transform** (يقرأ ويكتب معدّلاً) | الضغط \`zlib.createGzip()\`، التشفير، تحويل CSV |

## pipeline: ربط آمن
\`\`\`javascript
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const zlib = require("node:zlib");
const { pipeline } = require("node:stream/promises");

async function main() {
  const src = path.join(os.tmpdir(), "kodax-big.log");
  fs.writeFileSync(src, "سطر سجل\n".repeat(50_000));
  await pipeline(fs.createReadStream(src), zlib.createGzip(), fs.createWriteStream(src + ".gz"));
  console.log("الأصل:", fs.statSync(src).size, "بايت ← مضغوط:", fs.statSync(src + ".gz").size);
  fs.rmSync(src); fs.rmSync(src + ".gz");
}
main().catch(console.error);
\`\`\`
استخدم \`pipeline\` بدل \`.pipe()\` القديم: ينقل الأخطاء من أي مرحلة ويغلق كل التدفقات وينظفها عند الفشل.

## الضغط العكسي (Backpressure)
إذا كان المصدر أسرع من الوجهة (قراءة قرص سريع وإرسال لشبكة بطيئة)، تتراكم البيانات في الذاكرة. التدفقات تحل ذلك: \`write()\` تعيد \`false\` عندما يمتلئ مخزن الوجهة، فيتوقف المصدر حتى حدث \`drain\`. \`pipeline\` يدير ذلك تلقائياً — سبب إضافي لاستخدامه.

## سطراً بسطر
\`\`\`javascript
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const readline = require("node:readline");

async function countErrors(file) {
  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  let errors = 0;
  for await (const line of rl) if (line.includes("ERROR")) errors++;   // سطر واحد في الذاكرة
  return errors;
}

const file = path.join(os.tmpdir(), "kodax-app.log");
fs.writeFileSync(file, ["INFO start", "ERROR db timeout", "INFO ok", "ERROR disk full"].join("\n"));
countErrors(file).then((n) => { console.log("أخطاء:", n); fs.rmSync(file); });
\`\`\`
\`for await\` على التدفقات أوضح طريقة لمعالجتها في الكود الحديث.

## في الخوادم
- رفع ملف كبير: مرّر \`req\` (تدفق قراءة) مباشرة إلى التخزين بدل تجميعه في Buffer.
- تنزيل ملف: \`pipeline(fs.createReadStream(file), res)\`.
- تصدير CSV لمليون صف: اقرأ من قاعدة البيانات بمؤشر (cursor) واكتب للاستجابة صفاً بصف.

## تمرين
اكتب سكربتاً يقرأ ملف CSV كبيراً سطراً بسطر، ويكتب ملفاً جديداً فيه الصفوف التي عمود "الحالة" فيها "paid" فقط، باستخدام Transform و pipeline. قِس استهلاك الذاكرة (\`process.memoryUsage().rss\`) مع ملف 100MB.
`,
    codeExample: `const { EventEmitter } = require("node:events");
const { Transform } = require("node:stream");
const { pipeline } = require("node:stream/promises");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// ===== 1) أحداث: خدمة لا تعرف من يستمع إليها =====
class ImportJob extends EventEmitter {}
const job = new ImportJob();
let processed = 0;
job.on("progress", (n) => { processed = n; });
job.on("error", (err) => console.error("خطأ في الاستيراد:", err.message));   // استمع لـ error دائماً
job.once("done", (stats) => console.log("✅ انتهى:", stats));

// ===== 2) Transform: CSV ← نحتفظ بالطلبات المدفوعة ونحسب المجموع =====
function filterPaid() {
  let header = null;
  let buffered = "";
  let total = 0;
  let count = 0;
  return new Transform({
    readableObjectMode: false,
    transform(chunk, _enc, callback) {
      buffered += chunk.toString("utf8");
      const lines = buffered.split("\\n");
      buffered = lines.pop();                       // آخر سطر قد يكون ناقصاً — نكمله مع القطعة التالية
      const out = [];
      for (const line of lines) {
        if (!header) { header = line; out.push(line); continue; }
        const [id, status, amount] = line.split(",");
        if (status === "paid") { out.push(line); total += Number(amount); count++; }
      }
      job.emit("progress", count);
      callback(null, out.length ? out.join("\\n") + "\\n" : "");
    },
    flush(callback) {
      job.emit("done", { paidOrders: count, total: Math.round(total * 100) / 100 });
      callback();
    },
  });
}

async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kodax-stream-"));
  const input = path.join(dir, "orders.csv");
  const output = path.join(dir, "paid.csv");

  // ملف "كبير" للتجربة
  const rows = ["id,status,amount"];
  for (let i = 1; i <= 20000; i++) rows.push(\`\${i},\${i % 3 === 0 ? "pending" : "paid"},\${(i % 50) + 0.5}\`);
  fs.writeFileSync(input, rows.join("\\n") + "\\n");

  const before = process.memoryUsage().rss;
  await pipeline(fs.createReadStream(input, { highWaterMark: 16 * 1024 }), filterPaid(), fs.createWriteStream(output));
  const after = process.memoryUsage().rss;

  console.log("أسطر الناتج:", fs.readFileSync(output, "utf8").trim().split("\\n").length - 1, "| آخر تقدم:", processed);
  console.log("زيادة الذاكرة تقريباً:", Math.round((after - before) / 1024 / 1024), "MB");
  fs.rmSync(dir, { recursive: true, force: true });
}

main().catch((err) => job.emit("error", err));`,
    quiz: {
      question: 'لماذا يُفضَّل stream.pipeline على ربط التدفقات بـ .pipe()؟',
      options: [
        'لأنه أسرع دائماً',
        'لأنه ينقل الأخطاء من أي مرحلة ويغلق وينظف كل التدفقات عند الفشل، ويدير الضغط العكسي',
        'لأن .pipe() غير موجودة في Node',
        'لأنه يقرأ الملف كله في الذاكرة',
      ],
      correctAnswer: 1,
      explanation: 'مع .pipe() خطأ في المصدر لا يغلق الوجهة تلقائياً، فتتسرب الموارد.',
    },
  },
  {
    id: 'node-testing',
    title: 'الاختبارات الآلية بـ node:test',
    description: 'لماذا نختبر، مشغّل الاختبارات المدمج في Node، describe و it و assert، اختبار الكود غير المتزامن، الدوال الوهمية (mocks)، ما الذي يُختبر، والتغطية',
    language: 'javascript',
    xpReward: 170,
    content: md`
# الاختبارات الآلية بـ node:test

كل مرة تعدّل كوداً، تجرّبه يدوياً؟ مع 30 مساراً و10 حالات لكل منها، يصبح ذلك مستحيلاً — فتصل الأخطاء للمستخدمين. الاختبارات الآلية تجرّب كل شيء في ثوانٍ بعد كل تعديل.

## مشغّل مدمج — بلا مكتبات
منذ Node 20، \`node:test\` مستقر ومدمج:
\`\`\`javascript
const { test, describe, it } = require("node:test");
const assert = require("node:assert/strict");

function slugify(text) {
  return text.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

describe("slugify", () => {
  it("يحوّل المسافات إلى شرطات", () => {
    assert.equal(slugify("Hello World"), "hello-world");
  });
  it("يحافظ على الحروف العربية", () => {
    assert.equal(slugify("  مرحبا يا عالم "), "مرحبا-يا-عالم");
  });
  it("يزيل الرموز من الأطراف", () => {
    assert.equal(slugify("!!Node.js!!"), "node-js");
  });
});
\`\`\`
\`\`\`bash
node --test                 # يشغّل كل ملفات *.test.js و test/*.js
node --test --watch         # يعيد التشغيل عند الحفظ
node --test --experimental-test-coverage
\`\`\`
أضف إلى package.json: \`"test": "node --test"\` ثم \`npm test\`.

## assert: أهم الدوال
| الدالة | للتحقق من |
|---|---|
| \`assert.equal(a, b)\` | تساوٍ صارم (مع \`/strict\`) |
| \`assert.deepEqual(obj1, obj2)\` | كائنات ومصفوفات بالمحتوى |
| \`assert.ok(value)\` | قيمة صحيحة (truthy) |
| \`assert.throws(fn, /رسالة/)\` | دالة ترمي خطأ |
| \`await assert.rejects(promise, ErrorClass)\` | Promise يُرفض |
| \`assert.match(text, /نمط/)\` | نص يطابق نمطاً |

## غير المتزامن
اجعل الاختبار \`async\` وانتظر — المشغّل ينتظر Promise:
\`\`\`javascript
const { test } = require("node:test");
const assert = require("node:assert/strict");

async function fetchUser(id) {
  if (id <= 0) throw new RangeError("معرّف غير صالح");
  return { id, name: "سارة" };
}

test("يعيد المستخدم", async () => {
  assert.deepEqual(await fetchUser(1), { id: 1, name: "سارة" });
});
test("يرفض المعرّف السالب", async () => {
  await assert.rejects(fetchUser(-1), RangeError);
});
\`\`\`

## الدوال الوهمية (Mocks) والاعتماديات
اختبار يرسل بريداً حقيقياً أو يكتب في قاعدة الإنتاج ليس اختباراً بل كارثة. صمم الكود ليستقبل اعتمادياته (**حقن الاعتماديات**)، فتمرر نسخاً وهمية في الاختبار:
\`\`\`javascript
const { test, mock } = require("node:test");
const assert = require("node:assert/strict");

function makeSignup({ usersRepo, mailer }) {
  return async (email) => {
    if (await usersRepo.exists(email)) throw new Error("مستخدم موجود");
    await usersRepo.create(email);
    await mailer.send(email, "مرحباً بك");
  };
}

test("التسجيل يرسل بريد ترحيب مرة واحدة", async () => {
  const usersRepo = { exists: async () => false, create: mock.fn(async () => {}) };
  const mailer = { send: mock.fn(async () => {}) };
  await makeSignup({ usersRepo, mailer })("sara@example.com");
  assert.equal(mailer.send.mock.callCount(), 1);
  assert.deepEqual(mailer.send.mock.calls[0].arguments, ["sara@example.com", "مرحباً بك"]);
});
\`\`\`

## ما الذي يُختبر؟
| النوع | ماذا | السرعة والعدد |
|---|---|---|
| **وحدة** (unit) | دالة أو خدمة معزولة عن الشبكة وقاعدة البيانات | سريعة جداً، كثيرة |
| **تكامل** (integration) | API مع قاعدة بيانات اختبار حقيقية | أبطأ، أقل |
| **شامل** (E2E) | التطبيق كاملاً كما يستخدمه المستخدم | الأبطأ، قليلة للمسارات الحرجة |
اختبر **السلوك** لا التفاصيل الداخلية: "التسجيل ببريد موجود يرفض" لا "الدالة استدعت المتغير x". واختبر حالات الحافة والفشل — هناك تختبئ الأخطاء: مدخلات فارغة، قيم سالبة، صلاحيات، تكرار.

## التغطية: مؤشر لا هدف
تغطية 100% لا تعني خلو الكود من الأخطاء؛ تعني أن كل سطر نُفِّذ مرة. استخدمها لاكتشاف الأجزاء **غير المختبرة إطلاقاً**، لا كرقم للتباهي.

## في كل مشروع
- شغّل الاختبارات في CI (GitHub Actions) مع كل Pull Request.
- عند إصلاح خطأ: اكتب أولاً اختباراً يفشل بسببه، ثم أصلحه — فلا يعود.

## تمرين
اكتب اختبارات لدالة \`parsePagination(query)\` من درس الترقيم: القيم الافتراضية، القص عند limit كبير، page سالب، نصوص غير رقمية. ثم دالة \`transfer\` بمستودع وهمي: تحويل ناجح، رصيد غير كافٍ، مبلغ سالب.
`,
    codeExample: `// cart.test.js — شغّله بـ: node --test (أو node cart.test.js)
const { describe, it, beforeEach, mock } = require("node:test");
const assert = require("node:assert/strict");

// ===== الكود المُختبَر: سلة مشتريات تستقبل اعتمادياتها =====
function createCart({ pricing, clock = () => new Date() }) {
  const items = new Map();
  return {
    add(sku, qty = 1) {
      if (!Number.isInteger(qty) || qty < 1) throw new RangeError("كمية غير صالحة");
      items.set(sku, (items.get(sku) ?? 0) + qty);
    },
    remove(sku) {
      items.delete(sku);
    },
    async total(coupon) {
      let sum = 0;
      for (const [sku, qty] of items) sum += (await pricing.priceOf(sku)) * qty;
      if (coupon === "RAMADAN" && clock().getMonth() === 2) sum *= 0.9;   // خصم في مارس فقط
      return Math.round(sum * 100) / 100;
    },
    count: () => [...items.values()].reduce((a, b) => a + b, 0),
  };
}

// ===== الاختبارات =====
describe("سلة المشتريات", () => {
  let pricing;
  beforeEach(() => {
    pricing = { priceOf: mock.fn(async (sku) => ({ PEN: 1.5, BAG: 25 })[sku] ?? 0) };
  });

  it("تجمع كميات نفس المنتج", () => {
    const cart = createCart({ pricing });
    cart.add("PEN", 2);
    cart.add("PEN", 3);
    assert.equal(cart.count(), 5);
  });

  it("ترفض الكميات غير الصالحة", () => {
    const cart = createCart({ pricing });
    assert.throws(() => cart.add("PEN", 0), RangeError);
    assert.throws(() => cart.add("PEN", 1.5), /كمية غير صالحة/);
  });

  it("تحسب المجموع من خدمة الأسعار", async () => {
    const cart = createCart({ pricing });
    cart.add("PEN", 4);
    cart.add("BAG");
    assert.equal(await cart.total(), 31);
    assert.equal(pricing.priceOf.mock.callCount(), 2);
  });

  it("تطبق الكوبون في الشهر الصحيح فقط (ساعة وهمية)", async () => {
    const march = createCart({ pricing, clock: () => new Date("2026-03-10") });
    const july = createCart({ pricing, clock: () => new Date("2026-07-10") });
    march.add("BAG", 2);
    july.add("BAG", 2);
    assert.equal(await march.total("RAMADAN"), 45);
    assert.equal(await july.total("RAMADAN"), 50);
  });

  it("الحذف يزيل المنتج كلياً", async () => {
    const cart = createCart({ pricing });
    cart.add("PEN", 2);
    cart.remove("PEN");
    assert.equal(await cart.total(), 0);
  });
});`,
    quiz: {
      question: 'لماذا نمرر pricing و clock كمعاملات لـ createCart بدل استيرادها مباشرة داخلها؟',
      options: [
        'لأن Node لا يسمح بالاستيراد داخل الدوال',
        'ليمكن تمرير نسخ وهمية في الاختبارات (أسعار ثابتة وتاريخ محدد) فتكون الاختبارات سريعة ومتكررة النتيجة',
        'لتسريع الكود في الإنتاج',
        'لا فائدة، مجرد أسلوب',
      ],
      correctAnswer: 1,
      explanation: 'حقن الاعتماديات يعزل الكود عن الشبكة والوقت الحقيقي فيصبح قابلاً للاختبار.',
    },
  },
  {
    id: 'node-project-structure',
    title: 'هيكلة مشروع Node للإنتاج',
    description: 'تنظيم المجلدات حسب الميزة، الإعدادات المتحقق منها عند البدء، السجلات المنظمة، الإيقاف المنظم (graceful shutdown)، فحص الصحة، والتعامل مع الأخطاء غير الملتقطة',
    language: 'javascript',
    xpReward: 170,
    content: md`
# هيكلة مشروع Node للإنتاج

ملف \`server.js\` من 800 سطر يعمل... حتى يكبر الفريق أو يسقط الخادم في الثالثة فجراً. هذا الدرس يجمع ما يفصل "يعمل على جهازي" عن "يعمل في الإنتاج".

## تنظيم حسب الميزة
\`\`\`text
src/
├── config.js              ← قراءة متغيرات البيئة والتحقق منها
├── app.js                 ← إنشاء التطبيق (بلا listen) — قابل للاختبار
├── server.js              ← نقطة التشغيل: listen + الإيقاف المنظم
├── lib/
│   ├── logger.js
│   └── errors.js          ← AppError وأصنافه
├── db/
│   └── pool.js
└── modules/
    ├── users/
    │   ├── users.routes.js
    │   ├── users.service.js
    │   ├── users.repository.js
    │   └── users.test.js
    └── orders/
        └── ...
\`\`\`
كل ما يخص "المستخدمين" في مجلد واحد. عندما تعدّل ميزة، لا تقفز بين عشرة مجلدات. فصل \`app.js\` عن \`server.js\` يسمح للاختبارات بإنشاء التطبيق دون فتح منفذ.

## الإعدادات: فشل مبكر
\`\`\`javascript
function loadConfig(env) {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter((k) => !env[k]);
  if (missing.length) throw new Error(\`متغيرات ناقصة: \${missing.join(", ")}\`);
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port)) throw new Error("PORT غير صالح");
  return Object.freeze({ port, databaseUrl: env.DATABASE_URL, jwtSecret: env.JWT_SECRET, isProd: env.NODE_ENV === "production" });
}
try { loadConfig({ PORT: "8080" }); } catch (e) { console.log(e.message); }
\`\`\`
كائن إعدادات واحد مجمّد يُستورد في كل مكان — لا \`process.env\` متناثرة في الكود.

## السجلات المنظمة
\`console.log("user logged in")\` لا يفيد مع آلاف الطلبات. السجل الجيد **JSON** بحقول ثابتة: الوقت، المستوى، الرسالة، معرّف الطلب، والسياق — فتستطيع البحث والتصفية في أدوات المراقبة. مكتبة **pino** معيار شائع وسريع.
- المستويات: \`debug\` ← \`info\` ← \`warn\` ← \`error\`؛ في الإنتاج \`info\` فما فوق.
- **لا تسجّل أبداً**: كلمات المرور، الرموز (tokens)، أرقام البطاقات، ترويسة Authorization كاملة. pino يدعم \`redact\` لحذف حقول تلقائياً.

## الإيقاف المنظم (Graceful Shutdown)
عند إعادة النشر، ترسل المنصة \`SIGTERM\`. إن أُغلق البرنامج فوراً، تنقطع الطلبات الجارية في منتصفها (دفعة نصف مكتملة!). الصحيح:
1. توقف عن قبول اتصالات جديدة (\`server.close()\`).
2. انتظر الطلبات الجارية لتنتهي (بمهلة قصوى).
3. أغلق مجمّع قاعدة البيانات والاتصالات الأخرى.
4. اخرج.
المثال الكامل يطبق ذلك.

## فحص الصحة
مساران تستخدمهما المنصات وموزعات الحمل:
- \`/health/live\`: العملية حيّة (لا تفحص قاعدة البيانات هنا وإلا أعادت المنصة تشغيل كل النسخ عند عطل القاعدة).
- \`/health/ready\`: جاهزة لاستقبال الطلبات (القاعدة متصلة). أثناء الإيقاف تعيد 503 فيتوقف الموزع عن إرسال طلبات.

## الأخطاء غير الملتقطة
\`unhandledRejection\` و \`uncaughtException\`: سجّل الخطأ بالتفصيل، ثم اخرج بشكل منظم (\`process.exitCode = 1\` بعد الإغلاق) ودع مدير العمليات (Docker، المنصة، PM2) يعيد التشغيل. الاستمرار بعد خطأ مجهول قد يترك التطبيق بحالة فاسدة.

## قائمة ما قبل الإنتاج
- [ ] إعدادات متحقق منها، وأسرار في متغيرات البيئة فقط.
- [ ] سجلات JSON بلا بيانات حساسة، ومعرّف لكل طلب.
- [ ] إيقاف منظم وفحوص صحة.
- [ ] \`helmet\` و CORS محدد وتحديد المعدل وحدود حجم الجسم.
- [ ] اختبارات تعمل في CI.
- [ ] \`npm ci\` و \`NODE_ENV=production\` وإصدار Node LTS محدد.

## تمرين
أعد هيكلة API الكتب من دورة Express إلى بنية \`modules/books\` مع \`app.js\` و \`server.js\` منفصلين، وأضف فحصي الصحة والإيقاف المنظم، ثم اختبر المسار \`/health/live\` بـ node:test دون فتح منفذ ثابت (المنفذ 0).
`,
    codeExample: `// خادم بإعدادات متحقق منها، سجلات JSON، فحوص صحة، وإيقاف منظم — بلا مكتبات خارجية
const http = require("node:http");
const { randomUUID } = require("node:crypto");

// ===== config.js =====
function loadConfig(env) {
  const port = Number(env.PORT ?? 0);              // 0 = منفذ حر (للتجربة والاختبار)
  if (!Number.isInteger(port) || port < 0) throw new Error("PORT غير صالح");
  return Object.freeze({ port, shutdownTimeoutMs: 5000, isProd: env.NODE_ENV === "production" });
}

// ===== logger.js: JSON بحقول ثابتة، مع حذف الحقول الحساسة =====
const REDACT = new Set(["password", "token", "authorization"]);
function log(level, msg, ctx = {}) {
  const safe = Object.fromEntries(Object.entries(ctx).map(([k, v]) => [k, REDACT.has(k.toLowerCase()) ? "[محذوف]" : v]));
  console.log(JSON.stringify({ time: new Date().toISOString(), level, msg, ...safe }));
}

// ===== app.js: معالج الطلبات (بلا listen) =====
function createApp(state) {
  return (req, res) => {
    const requestId = randomUUID();
    const started = Date.now();
    res.setHeader("X-Request-Id", requestId);
    res.on("finish", () => log("info", "request", { requestId, method: req.method, url: req.url, status: res.statusCode, ms: Date.now() - started }));

    const send = (status, body) => {
      res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(body));
    };
    if (req.url === "/health/live") return send(200, { ok: true });
    if (req.url === "/health/ready") return state.shuttingDown ? send(503, { ready: false }) : send(200, { ready: true });
    if (req.url === "/api/hello") return send(200, { message: "مرحباً" });
    send(404, { error: "غير موجود" });
  };
}

// ===== server.js =====
const config = loadConfig(process.env);
const state = { shuttingDown: false };
const server = http.createServer(createApp(state));

async function shutdown(signal) {
  if (state.shuttingDown) return;
  state.shuttingDown = true;                       // /health/ready يعيد 503 فيتوقف الموزع عن الإرسال
  log("info", "shutdown started", { signal });
  const timer = setTimeout(() => { log("error", "shutdown timeout"); process.exit(1); }, config.shutdownTimeoutMs);
  server.close(() => {                             // يرفض الجديد وينتظر الجاري
    // await pool.end();                           // أغلق قاعدة البيانات هنا
    clearTimeout(timer);
    log("info", "shutdown complete");
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => { log("error", "unhandledRejection", { error: String(err) }); shutdown("unhandledRejection"); });

server.listen(config.port, () => {
  const { port } = server.address();
  log("info", "listening", { port, token: "سر-لا-يظهر" });

  // تجربة ذاتية: طلبان ثم إيقاف منظم
  const get = (path) => new Promise((resolve, reject) => {
    http.get({ port, path, agent: false }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve(\`\${res.statusCode} \${body}\`));
    }).on("error", reject);                     // بدون مستمع error يسقط البرنامج عند رفض الاتصال
  });
  (async () => {
    console.log(await get("/health/ready"));
    console.log(await get("/api/hello"));
    await shutdown("demo");
    console.log(await get("/health/ready").catch(() => "الخادم مغلق"));
  })();
});`,
    quiz: {
      question: 'لماذا لا يفحص مسار /health/live اتصال قاعدة البيانات؟',
      options: [
        'لأن قاعدة البيانات لا تحتاج فحصاً',
        'لأن فشل القاعدة المؤقت سيجعل المنصة تعيد تشغيل كل نسخ التطبيق بلا فائدة؛ الجاهزية تُفحص في /health/ready',
        'لأنه أسرع فقط',
        'لأن Node لا يستطيع الوصول للقاعدة من مسار health',
      ],
      correctAnswer: 1,
      explanation: 'live = العملية حية؛ ready = تستطيع خدمة الطلبات الآن. الخلط بينهما يسبب إعادة تشغيل متتالية.',
    },
  },
];

export const REST_NEW_LESSONS: NewLesson[] = [
  {
    id: 'rest-db-layers',
    title: 'بنية طبقية: Routes و Services و Repositories',
    description: 'فصل HTTP عن منطق العمل عن الوصول للبيانات: مسؤولية كل طبقة، حقن الاعتماديات، تحويل الأخطاء بين الطبقات، واختبار منطق العمل دون خادم ولا قاعدة بيانات',
    language: 'javascript',
    xpReward: 180,
    content: md`
# البنية الطبقية للـ API

في الأمثلة السابقة، معالج المسار يقرأ الطلب ويتحقق ويستعلم القاعدة ويطبق قواعد العمل ويرسل الاستجابة — كله في دالة واحدة. هذا يصلح لمثال، ويصبح فوضى مع 50 مساراً: منطق مكرر، واختبار مستحيل دون خادم وقاعدة بيانات.

## الطبقات الثلاث
\`\`\`text
HTTP ← Route/Controller ← Service ← Repository ← قاعدة البيانات
        (يعرف HTTP)       (قواعد العمل)  (يعرف SQL/Mongo)
\`\`\`
| الطبقة | تعرف | لا تعرف | مثال |
|---|---|---|---|
| **Route / Controller** | req و res، رموز الحالة، التحقق من شكل المدخلات | SQL، قواعد العمل | يحوّل \`req.body\` إلى بيانات ويستدعي الخدمة ويحدد 201 |
| **Service** | قواعد العمل والتنسيق بين المستودعات | HTTP وتفاصيل القاعدة | "لا يُستعار كتاب مُعار"، "الحد 3 كتب" |
| **Repository** | الاستعلامات وتحويل الصفوف إلى كائنات | قواعد العمل وHTTP | \`findById\`، \`markBorrowed\` |

## حقن الاعتماديات
الخدمة **تستقبل** مستودعاتها بدل استيرادها مباشرة:
\`\`\`javascript
function createLoanService({ booksRepo, loansRepo, clock = () => new Date() }) {
  return {
    async borrow(memberId, bookId) {
      const book = await booksRepo.findById(bookId);
      if (!book) throw Object.assign(new Error("الكتاب غير موجود"), { code: "NOT_FOUND" });
      if (book.borrowedBy) throw Object.assign(new Error("الكتاب مُعار"), { code: "CONFLICT" });
      const active = await loansRepo.countActive(memberId);
      if (active >= 3) throw Object.assign(new Error("الحد الأقصى 3 كتب"), { code: "LIMIT" });
      return loansRepo.create({ memberId, bookId, at: clock() });
    },
  };
}
console.log(typeof createLoanService({ booksRepo: {}, loansRepo: {} }).borrow);
\`\`\`
في الإنتاج تمرر مستودعات PostgreSQL، وفي الاختبار مستودعات في الذاكرة — والخدمة لا تتغير. هذا ما يجعل منطق العمل قابلاً للاختبار في ملّي ثوانٍ.

## الأخطاء عبر الطبقات
- **المستودع** يحوّل أخطاء القاعدة إلى أخطاء نطاق (\`23505\` ← \`ConflictError\`).
- **الخدمة** ترمي أخطاء عمل بمعنى واضح (\`LIMIT\`، \`NOT_FOUND\`).
- **المسار** (أو معالج الأخطاء المركزي) يحوّلها إلى HTTP: NOT_FOUND ← 404، CONFLICT ← 409، LIMIT ← 422.
لا يعرف أي طرف تفاصيل الآخر — يمكنك تغيير القاعدة من MongoDB إلى PostgreSQL بتعديل المستودع وحده.

## المسار رقيق
\`\`\`javascript
// router.post("/loans", requireAuth, validate(loanSchema), async (req, res) => {
//   const loan = await loanService.borrow(req.user.id, req.body.bookId);
//   res.status(201).json(loan);
// });
const responsibilities = ["المصادقة", "التحقق من الشكل", "استدعاء الخدمة", "رمز الحالة"];
console.log(responsibilities.join(" ← "));
\`\`\`

## لا تبالغ
تطبيق صغير بثلاثة مسارات لا يحتاج عشرة ملفات لكل ميزة. ابدأ بفصل **المنطق عن HTTP** (الخدمة)، وأضف المستودع عندما يكثر الوصول للبيانات. البنية وسيلة لتسهيل التغيير والاختبار، لا هدفاً.

## تمرين
أضف للمثال الكامل \`returnBook\` في الخدمة: يُرجع فقط المستعير نفسه، ويحسب غرامة يوم لكل يوم تأخير بعد 14 يوماً باستخدام \`clock\` الوهمي. اكتب ثلاثة اختبارات.
`,
    codeExample: `// خدمة إعارة كتب بطبقات منفصلة + اختبار منطق العمل دون خادم أو قاعدة بيانات
// شغّله بـ: node --test (أو node loans.test.js)
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

// ===== أخطاء النطاق =====
class DomainError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
const HTTP_STATUS = { NOT_FOUND: 404, CONFLICT: 409, LIMIT: 422 };   // يستخدمها معالج الأخطاء في طبقة HTTP

// ===== Repositories: نسخة في الذاكرة (في الإنتاج: PostgreSQL بنفس الواجهة) =====
function createMemoryRepos(seedBooks) {
  const books = new Map(seedBooks.map((b) => [b.id, { ...b, borrowedBy: null }]));
  const loans = [];
  return {
    booksRepo: {
      findById: async (id) => books.get(id) ?? null,
      setBorrower: async (id, memberId) => { books.get(id).borrowedBy = memberId; },
    },
    loansRepo: {
      countActive: async (memberId) => loans.filter((l) => l.memberId === memberId && !l.returnedAt).length,
      create: async (loan) => { const row = { id: loans.length + 1, ...loan, returnedAt: null }; loans.push(row); return row; },
    },
  };
}

// ===== Service: قواعد العمل فقط =====
function createLoanService({ booksRepo, loansRepo, clock = () => new Date(), maxActive = 3 }) {
  return {
    async borrow(memberId, bookId) {
      const book = await booksRepo.findById(bookId);
      if (!book) throw new DomainError("NOT_FOUND", "الكتاب غير موجود");
      if (book.borrowedBy) throw new DomainError("CONFLICT", "الكتاب مُعار حالياً");
      if ((await loansRepo.countActive(memberId)) >= maxActive) throw new DomainError("LIMIT", \`الحد الأقصى \${maxActive} كتب\`);
      await booksRepo.setBorrower(bookId, memberId);
      return loansRepo.create({ memberId, bookId, borrowedAt: clock() });
    },
  };
}

// ===== اختبارات الخدمة =====
describe("خدمة الإعارة", () => {
  const books = [1, 2, 3, 4].map((id) => ({ id, title: \`كتاب \${id}\` }));
  const fixedClock = () => new Date("2026-10-01T10:00:00Z");

  it("تُعير كتاباً متاحاً", async () => {
    const service = createLoanService({ ...createMemoryRepos(books), clock: fixedClock });
    const loan = await service.borrow("sara", 1);
    assert.equal(loan.bookId, 1);
    assert.equal(loan.borrowedAt.toISOString(), "2026-10-01T10:00:00.000Z");
  });

  it("ترفض كتاباً مُعاراً بخطأ CONFLICT (← 409)", async () => {
    const service = createLoanService(createMemoryRepos(books));
    await service.borrow("sara", 1);
    await assert.rejects(service.borrow("omar", 1), (err) => err.code === "CONFLICT" && HTTP_STATUS[err.code] === 409);
  });

  it("تفرض الحد الأقصى للإعارات", async () => {
    const service = createLoanService({ ...createMemoryRepos(books), maxActive: 3 });
    for (const id of [1, 2, 3]) await service.borrow("sara", id);
    await assert.rejects(service.borrow("sara", 4), { code: "LIMIT" });
  });

  it("ترفض كتاباً غير موجود", async () => {
    const service = createLoanService(createMemoryRepos(books));
    await assert.rejects(service.borrow("sara", 99), { code: "NOT_FOUND" });
  });
});`,
    quiz: {
      question: 'في البنية الطبقية، أين يُكتب القرار "العضو لا يستعير أكثر من 3 كتب"؟',
      options: ['في المسار (Route) لأنه يستقبل الطلب', 'في الخدمة (Service) لأنه قاعدة عمل', 'في المستودع (Repository) لأنه يعدّ من القاعدة', 'في الواجهة فقط'],
      correctAnswer: 1,
      explanation: 'قواعد العمل في الخدمة؛ المستودع يجلب العدد، والمسار يحوّل الخطأ إلى رمز HTTP.',
    },
  },
  {
    id: 'rest-openapi',
    title: 'توثيق الـ API بـ OpenAPI',
    description: 'مواصفة OpenAPI 3.1: المسارات والمعاملات والمخططات والاستجابات والأمان، التوثيق كعقد بين الفرق، توليد صفحات التوثيق والعملاء، وإدارة الإصدارات والإيقاف التدريجي',
    language: 'javascript',
    xpReward: 150,
    content: md`
# توثيق الـ API بـ OpenAPI

API بلا توثيق يعني أن مطور الواجهة يسألك في كل مرة: "ما شكل الاستجابة؟ هل الحقل إلزامي؟ ما الأخطاء الممكنة؟". **OpenAPI** معيار لوصف الـ API في ملف واحد (YAML أو JSON) يقرؤه الإنسان والأدوات.

## ماذا يصف؟
\`\`\`yaml
openapi: 3.1.0
info:
  title: Kodax Library API
  version: 1.2.0
servers:
  - url: https://api.example.com/v1
paths:
  /books/{id}:
    get:
      summary: جلب كتاب
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer, minimum: 1 }
      responses:
        "200":
          description: الكتاب
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Book" }
        "404":
          $ref: "#/components/responses/NotFound"
components:
  schemas:
    Book:
      type: object
      required: [id, title]
      properties:
        id: { type: integer }
        title: { type: string, maxLength: 200 }
        borrowed: { type: boolean }
\`\`\`
| القسم | يحتوي |
|---|---|
| \`paths\` | كل مسار وطرقه ومعاملاته (path، query، header) وجسم الطلب والاستجابات لكل رمز حالة |
| \`components.schemas\` | المخططات المشتركة (JSON Schema) تُعاد بـ \`$ref\` |
| \`components.responses\` | استجابات متكررة (أخطاء 404 و 422 بنفس الشكل) |
| \`components.securitySchemes\` | طريقة المصادقة (Bearer JWT، cookie، API key) |

## ماذا تحصل مقابله؟
- **صفحة توثيق تفاعلية** (Swagger UI، Scalar، Redoc) يجرب منها المطورون الطلبات.
- **توليد عملاء** بأنواع TypeScript (openapi-typescript، orval) — الواجهة تعرف الحقول وأنواعها دون كتابتها يدوياً.
- **التحقق تلقائياً** من الطلبات والاستجابات مقابل المواصفة (مثلاً express-openapi-validator).
- **اختبارات عقد**: تأكد أن ما يعيده الخادم يطابق الموثق.

## من أين تأتي المواصفة؟
| الأسلوب | الفكرة |
|---|---|
| **العقد أولاً** (Design-first) | تكتب المواصفة وتتفق عليها الفرق، ثم تُبنى الواجهة والخادم بالتوازي |
| **الكود أولاً** (Code-first) | تولَّد من الكود (مخططات Zod مع zod-to-openapi، أو أطر مثل Fastify و NestJS) |
المهم ألا تنفصل المواصفة عن الحقيقة: توثيق قديم أسوأ من لا توثيق. ولّدها من مصدر واحد أو اختبرها في CI.

## الإصدارات والإيقاف التدريجي
- \`info.version\` بالإصدارات الدلالية؛ التغيير الكاسر = إصدار رئيسي جديد (\`/v2\`).
- علّم ما سيُزال بـ \`deprecated: true\` وأرسل ترويسة \`Deprecation\` و \`Sunset\` بتاريخ الإزالة، وأعطِ العملاء مهلة.
- التغييرات المتوافقة: إضافة حقل اختياري أو مسار جديد. الكاسرة: حذف حقل، تغيير نوعه، جعله إلزامياً في الطلب.

## الأمان في التوثيق
لا تضع أمثلة برموز حقيقية أو بيانات مستخدمين حقيقية في المواصفة. وفكّر: هل تريد صفحة التوثيق عامة؟ API داخلي لا يحتاج نشر خريطته كاملة.

## تمرين
اكتب مواصفة OpenAPI لـ API المكتبة: \`GET /books\` (ترقيم وفلترة)، \`POST /books\` (جسم مع تحقق)، \`POST /loans\` (يحتاج Bearer JWT)، مع استجابات الأخطاء 400 و 401 و 404 و 409 بمخطط Error موحد. اعرضها في Swagger Editor.
`,
    codeExample: `// مواصفة OpenAPI ككائن JavaScript + فحص بسيط يضمن أن كل مسار في الكود موثق
const spec = {
  openapi: "3.1.0",
  info: { title: "Kodax Library API", version: "1.2.0" },
  servers: [{ url: "https://api.example.com/v1" }],
  components: {
    securitySchemes: { bearer: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    schemas: {
      Book: {
        type: "object",
        required: ["id", "title"],
        properties: { id: { type: "integer" }, title: { type: "string", maxLength: 200 }, borrowed: { type: "boolean" } },
      },
      Error: {
        type: "object",
        required: ["error"],
        properties: { error: { type: "object", required: ["code", "message"], properties: { code: { type: "string" }, message: { type: "string" } } } },
      },
    },
    responses: {
      NotFound: { description: "غير موجود", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      Unauthorized: { description: "غير مسجل", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
    },
  },
  paths: {
    "/books": {
      get: {
        summary: "قائمة الكتب",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: { 200: { description: "صفحة من الكتب" } },
      },
    },
    "/books/{id}": {
      get: {
        summary: "جلب كتاب",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: { 200: { description: "الكتاب" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
    },
    "/loans": {
      post: {
        summary: "استعارة كتاب",
        security: [{ bearer: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["bookId"], properties: { bookId: { type: "integer" } } } } } },
        responses: { 201: { description: "تمت الاستعارة" }, 401: { $ref: "#/components/responses/Unauthorized" }, 409: { description: "الكتاب مُعار" } },
      },
    },
  },
};

// المسارات المعرّفة فعلاً في التطبيق (في مشروع حقيقي: تُستخرج من الـ router)
const implemented = [
  ["get", "/books"],
  ["get", "/books/{id}"],
  ["post", "/loans"],
  ["delete", "/loans/{id}"],   // ← نُسي توثيقه
];

// فحص في CI: كل مسار مُنفّذ موثّق، وكل مرجع $ref موجود
const undocumented = implemented.filter(([method, path]) => !spec.paths[path]?.[method]);
const refs = JSON.stringify(spec).match(/"#\\/components\\/[^"]+"/g) ?? [];
const brokenRefs = refs.filter((r) => {
  const parts = r.slice(3, -1).split("/");
  return parts.reduce((node, key) => node?.[key], spec) === undefined;
});

console.log("مسارات موثقة:", Object.keys(spec.paths).length);
console.log("غير موثقة:", undocumented.map(([m, p]) => \`\${m.toUpperCase()} \${p}\`));
console.log("مراجع مكسورة:", brokenRefs);
if (undocumented.length || brokenRefs.length) process.exitCode = 0;   // في CI اجعلها 1 لإفشال البناء`,
    quiz: {
      question: 'أي التغييرات التالية يُعد كاسراً (Breaking) ويحتاج إصداراً رئيسياً جديداً؟',
      options: ['إضافة حقل اختياري جديد للاستجابة', 'إضافة مسار جديد', 'حذف حقل من الاستجابة يعتمد عليه العملاء', 'إضافة مثال للتوثيق'],
      correctAnswer: 2,
      explanation: 'حذف حقل أو تغيير نوعه يكسر العملاء الحاليين؛ الإضافات الاختيارية متوافقة.',
    },
  },
  {
    id: 'rest-project',
    title: 'مشروع: API مهام كامل للإنتاج',
    description: 'مشروع ختامي يجمع الدورة: Express بطبقات، PostgreSQL، التحقق بـ Zod، المصادقة، الترقيم الآمن، الأخطاء المركزية، OpenAPI، والاختبارات',
    language: 'javascript',
    xpReward: 280,
    content: md`
# مشروع: API مهام كامل للإنتاج

ستبني API لتطبيق مهام فرق صغيرة. ليس "قائمة مهام في الذاكرة" بل خدمة تصلح للنشر.

## المتطلبات
1. تسجيل ودخول (رمز وصول قصير + تجديد) — من دورة المصادقة.
2. مشاريع يملكها مستخدم، ومهام داخل المشروع (عنوان، وصف، حالة، أولوية، تاريخ استحقاق).
3. المستخدم يصل لمشاريعه فقط (لا IDOR).
4. قائمة المهام بترقيم وفلترة (الحالة، الأولوية) وترتيب من قائمة بيضاء.
5. توثيق OpenAPI واختبارات.

## المخطط (PostgreSQL)
\`\`\`sql
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE projects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 100)
);
CREATE TABLE tasks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
  priority SMALLINT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX tasks_project_status_idx ON tasks(project_id, status, created_at DESC);
\`\`\`

## البنية
\`\`\`text
src/
├── config.js  app.js  server.js
├── lib/ (errors.js, logger.js, validate.js, auth.js)
├── db/ (pool.js, migrations/)
└── modules/
    ├── auth/      (routes, service, repository, tests)
    ├── projects/
    └── tasks/
\`\`\`

## المسارات
| الطريقة والمسار | الوصف | النجاح |
|---|---|---|
| \`POST /v1/auth/register\` و \`/login\` و \`/refresh\` | المصادقة | 201 / 200 |
| \`GET /v1/projects\` | مشاريعي | 200 |
| \`POST /v1/projects\` | إنشاء مشروع | 201 |
| \`GET /v1/projects/:id/tasks?status=&priority=&sort=&page=&limit=\` | مهام مشروع أملكه | 200 |
| \`POST /v1/projects/:id/tasks\` | إضافة مهمة | 201 |
| \`PATCH /v1/tasks/:id\` | تعديل (حقول مسموحة فقط) | 200 |
| \`DELETE /v1/tasks/:id\` | حذف | 204 |

## قواعد يجب أن تثبتها الاختبارات
- مستخدم ب يطلب مهام مشروع المستخدم أ ← **404** (لا يُكشف وجود المشروع).
- \`PATCH\` بحقل \`project_id\` أو \`id\` ← يُتجاهل أو يُرفض (لا نقل مهمة لمشروع آخر).
- \`limit=1000\` ← يُقص إلى 100؛ \`sort=password_hash\` ← يُتجاهل.
- \`priority: 5\` ← 400 برسالة واضحة؛ بريد مكرر عند التسجيل ← 409.
- كل الاستعلامات معاملية.

## الملكية في الاستعلام نفسه
بدل "اجلب المهمة ثم افحص المالك"، اربط الملكية في SQL:
\`\`\`sql
CREATE TABLE users (id BIGINT PRIMARY KEY);
CREATE TABLE projects (id BIGINT PRIMARY KEY, owner_id BIGINT REFERENCES users(id));
CREATE TABLE tasks (id BIGINT PRIMARY KEY, project_id BIGINT REFERENCES projects(id), title TEXT, status TEXT);
INSERT INTO users VALUES (1), (2);
INSERT INTO projects VALUES (10, 1), (20, 2);
INSERT INTO tasks VALUES (100, 10, 'مهمة سارة', 'todo'), (200, 20, 'مهمة عمر', 'todo');

-- المستخدم 1 يحاول تعديل مهمة المستخدم 2: لا يُعدَّل أي صف ← 404
UPDATE tasks t SET status = 'done'
FROM projects p
WHERE t.id = 200 AND p.id = t.project_id AND p.owner_id = 1
RETURNING t.id;
\`\`\`

## معايير الإنجاز
- [ ] \`npm test\` أخضر، مع اختبارات للحماية لا للنجاح فقط.
- [ ] مواصفة OpenAPI تطابق المسارات (فحص CI من درس التوثيق).
- [ ] لا سر في الكود، والإعدادات متحقق منها عند البدء.
- [ ] سجلات JSON بمعرّف طلب وبلا بيانات حساسة.
- [ ] إيقاف منظم وفحوص صحة.
- [ ] نشر على Render أو Railway مع PostgreSQL مُدار (دورة النشر).
`,
    codeExample: `// tasks.routes.js — مسارات المهام: رقيقة، والملكية جزء من كل استعلام
// npm install express zod pg
import express from "express";
import { z } from "zod";
import { pool } from "../../db/pool.js";
import { requireAuth } from "../../lib/auth.js";

export const tasksRouter = express.Router();

const SORTS = { newest: "t.created_at DESC", priority: "t.priority ASC, t.created_at DESC", due: "t.due_at ASC NULLS LAST" };

const listQuery = z.object({
  status: z.enum(["todo", "doing", "done"]).optional(),
  priority: z.coerce.number().int().min(1).max(3).optional(),
  sort: z.enum(Object.keys(SORTS)).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).catch(20).default(20),   // 1000 ← 20 بدل الخطأ
});

const createTask = z.object({
  title: z.string().trim().min(1).max(200),
  priority: z.number().int().min(1).max(3).default(2),
  dueAt: z.string().datetime().optional(),
}).strict();

const updateTask = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  status: z.enum(["todo", "doing", "done"]).optional(),
  priority: z.number().int().min(1).max(3).optional(),
}).strict();   // project_id و id مرفوضان

const notFound = (res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "غير موجود" } });

tasksRouter.get("/projects/:projectId/tasks", requireAuth, async (req, res) => {
  const q = listQuery.parse(req.query);
  const params = [req.params.projectId, req.user.id];
  const where = ["p.id = $1", "p.owner_id = $2"];
  if (q.status) { params.push(q.status); where.push(\`t.status = $\${params.length}\`); }
  if (q.priority) { params.push(q.priority); where.push(\`t.priority = $\${params.length}\`); }
  params.push(q.limit, (q.page - 1) * q.limit);

  const { rows } = await pool.query(
    \`SELECT t.id, t.title, t.status, t.priority, t.due_at
     FROM tasks t JOIN projects p ON p.id = t.project_id
     WHERE \${where.join(" AND ")}
     ORDER BY \${SORTS[q.sort]}
     LIMIT $\${params.length - 1} OFFSET $\${params.length}\`,
    params
  );
  res.json({ data: rows, page: q.page, limit: q.limit });
});

tasksRouter.post("/projects/:projectId/tasks", requireAuth, async (req, res) => {
  const body = createTask.parse(req.body);
  const { rows } = await pool.query(
    \`INSERT INTO tasks (project_id, title, priority, due_at)
     SELECT p.id, $3, $4, $5 FROM projects p WHERE p.id = $1 AND p.owner_id = $2
     RETURNING id, title, status, priority, due_at\`,
    [req.params.projectId, req.user.id, body.title, body.priority, body.dueAt ?? null]
  );
  if (rows.length === 0) return notFound(res);   // المشروع ليس لك أو غير موجود
  res.status(201).json(rows[0]);
});

tasksRouter.patch("/tasks/:id", requireAuth, async (req, res) => {
  const changes = updateTask.parse(req.body);
  const fields = Object.entries({ title: changes.title, status: changes.status, priority: changes.priority }).filter(([, v]) => v !== undefined);
  if (fields.length === 0) return res.status(400).json({ error: { code: "EMPTY", message: "لا تغييرات" } });

  const sets = fields.map(([k], i) => \`\${k} = $\${i + 3}\`);   // أسماء أعمدة من قائمة ثابتة لا من المستخدم
  const { rows } = await pool.query(
    \`UPDATE tasks t SET \${sets.join(", ")}
     FROM projects p
     WHERE t.id = $1 AND p.id = t.project_id AND p.owner_id = $2
     RETURNING t.id, t.title, t.status, t.priority\`,
    [req.params.id, req.user.id, ...fields.map(([, v]) => v)]
  );
  if (rows.length === 0) return notFound(res);
  res.json(rows[0]);
});

tasksRouter.delete("/tasks/:id", requireAuth, async (req, res) => {
  const { rowCount } = await pool.query(
    "DELETE FROM tasks t USING projects p WHERE t.id = $1 AND p.id = t.project_id AND p.owner_id = $2",
    [req.params.id, req.user.id]
  );
  if (rowCount === 0) return notFound(res);
  res.status(204).end();
});`,
    quiz: {
      question: 'لماذا يُكتب شرط p.owner_id = $2 داخل نفس استعلام UPDATE بدل جلب المهمة أولاً ثم فحص مالكها في الكود؟',
      options: [
        'لأن الكود لا يستطيع قراءة owner_id',
        'لأن الملكية تُفحص ذرياً في عبارة واحدة فلا يمكن تجاوزها أو نسيانها، ونعيد 404 دون كشف وجود المهمة',
        'لأنه يجعل الاستعلام أبطأ عمداً',
        'لا فرق أمني بين الطريقتين',
      ],
      correctAnswer: 1,
      explanation: 'دمج الملكية في الاستعلام يمنع IDOR ويقلل الاستعلامات وحالات السباق.',
    },
  },
];

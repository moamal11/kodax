/**
 * توسيع backend-mongodb: تعميق المقدمة، ثم ما يحتاجه التطبيق الحقيقي بعد CRUD:
 * الفهارس والأداء، والتحقق على مستوى القاعدة والمعاملات، ومشروع متكامل.
 * أمثلة Mongoose/المشغّل تُفحص صياغتها فقط (لا خادم MongoDB في بيئة الفحص)؛
 * منطق تصميم المستندات يُعرض بأمثلة JavaScript قابلة للتشغيل.
 */
import type { NewLesson } from '../types';
import { md } from '../md';

export const MONGO_1_CONTENT = md`
# مقدمة في MongoDB

MongoDB قاعدة بيانات **مستندات**: بدل الصفوف والأعمدة، تخزن **مستندات** تشبه كائنات JSON، داخل **مجموعات**.

\`\`\`text
SQL:      قاعدة بيانات ← جداول ← صفوف ← أعمدة
MongoDB:  قاعدة بيانات ← مجموعات (collections) ← مستندات (documents) ← حقول
\`\`\`

## المستند
\`\`\`javascript
const user = {
  _id: "6714f0c2a1b2c3d4e5f60718",        // ObjectId يولّده MongoDB تلقائياً
  name: "سارة",
  email: "sara@example.com",
  tags: ["مبتدئ", "بايثون"],               // مصفوفة داخل المستند
  address: { city: "بغداد", street: "الكرادة" },   // مستند متداخل
  createdAt: new Date("2026-10-01T09:00:00Z"),
};
console.log(Object.keys(user));
\`\`\`
- يُخزَّن بصيغة **BSON** (JSON ثنائي بأنواع إضافية: تواريخ حقيقية، أرقام صحيحة وعشرية، ObjectId، بيانات ثنائية).
- **\`_id\`** إلزامي وفريد في المجموعة. الـ **ObjectId** الافتراضي (12 بايتاً) يحتوي وقت الإنشاء، فالترتيب به يقارب الترتيب الزمني.
- المستندات في نفس المجموعة **لا تُلزم** بنفس الحقول — مرونة، ومسؤولية عليك (درس Mongoose والتحقق).
- حد حجم المستند **16MB**.

## متى MongoDB ومتى SQL؟
| يميل لـ MongoDB | يميل لـ SQL (PostgreSQL) |
|---|---|
| البيانات تُقرأ ككتلة واحدة (منشور بتعليقاته الأولى، كتالوج منتجات بخصائص مختلفة) | علاقات كثيرة متشابكة وتقارير بربط جداول متعددة |
| شكل البيانات يتغير كثيراً أو يختلف بين العناصر | قيود صارمة وسلامة مالية (ACID عبر جداول كثيرة) |
| توسع أفقي ضخم للكتابة | فريق يعرف SQL، وأدوات تحليل وتقارير |
كلاهما ناضج وقادر. PostgreSQL مع JSONB يغطي كثيراً من حالات المستندات، و MongoDB يدعم المعاملات والتحقق من المخطط. اختر حسب **أنماط القراءة والكتابة** في تطبيقك، لا حسب الموضة.

## المشغّل الرسمي (MongoDB Driver)
المثال الكامل يتصل بالمشغّل الرسمي وينفذ CRUD:
| العملية | الدالة | ملاحظات |
|---|---|---|
| إدراج | \`insertOne\` / \`insertMany\` | يعيد \`insertedId\` |
| قراءة | \`findOne\` / \`find().toArray()\` | \`find\` يعيد **مؤشراً**؛ \`toArray\` يحمّل كل النتائج في الذاكرة — استخدم \`limit\` |
| تحديث | \`updateOne\` / \`updateMany\` مع \`$set\` و \`$inc\` | بدون عامل (\`$set\`) تستبدل المستند كله! |
| حذف | \`deleteOne\` / \`deleteMany\` | \`deleteMany({})\` تحذف الكل |

## الاتصال الصحيح
- **عميل واحد** (\`MongoClient\`) للتطبيق كله يُنشأ عند البدء: يدير مجمّع اتصالات داخلياً. إنشاء عميل لكل طلب يستنزف الاتصالات.
- رابط الاتصال في متغيرات البيئة (\`MONGODB_URI\`) — فيه اسم المستخدم وكلمة المرور.
- في **MongoDB Atlas** (الخدمة السحابية) قيّد عناوين IP المسموحة، واستخدم مستخدماً بصلاحيات قاعدة التطبيق فقط.

## الأمان من البداية
المدخلات قد تحمل عوامل: \`{ email: req.body.email }\` حيث \`req.body.email = { "$ne": null }\` يطابق أول مستخدم. حوّل المدخلات لأنواعها (\`String(...)\`) أو فعّل \`sanitizeFilter\` في Mongoose (الدروس القادمة).

## تمرين
أنشئ حساباً مجانياً في MongoDB Atlas (أو شغّل MongoDB محلياً)، وشغّل المثال الكامل بعد وضع الرابط في \`MONGODB_URI\`. ثم أضف \`createdAt\` لكل مستند، واطلب آخر 5 مستخدمين مرتبين تنازلياً بـ \`sort\` و \`limit\`.
`;

export const MONGO_NEW_LESSONS: NewLesson[] = [
  {
    id: 'mongo-indexes',
    title: 'الفهارس والأداء في MongoDB',
    description: 'لماذا تبطؤ الاستعلامات، أنواع الفهارس (فردي ومركب وفريد و TTL ونصي)، قاعدة ESR لترتيب الحقول، قراءة explain، وأنماط التصميم للأداء',
    language: 'javascript',
    xpReward: 170,
    content: md`
# الفهارس والأداء في MongoDB

بلا فهرس، \`find({ email })\` على مليون مستند يفحص المستندات كلها (**COLLSCAN**). الفهرس بنية مرتبة (B-Tree) تقود الاستعلام للمستندات مباشرة (**IXSCAN**). الفهارس هي أهم أداة أداء في أي قاعدة بيانات.

## إنشاء الفهارس
\`\`\`javascript
// بالمشغّل الرسمي
// await db.collection("users").createIndex({ email: 1 }, { unique: true });
// بـ Mongoose داخل المخطط
// userSchema.index({ email: 1 }, { unique: true });
// orderSchema.index({ customer: 1, createdAt: -1 });
const indexSpec = { customer: 1, createdAt: -1 };   // 1 تصاعدي، -1 تنازلي
console.log(indexSpec);
\`\`\`
| النوع | الاستخدام |
|---|---|
| فردي \`{ email: 1 }\` | البحث بحقل واحد |
| **فريد** \`{ unique: true }\` | منع التكرار (البريد) — يُفرض من القاعدة لا من الكود |
| **مركب** \`{ customer: 1, createdAt: -1 }\` | استعلامات تجمع عدة حقول وترتيباً |
| على مصفوفة (multikey) | \`{ tags: 1 }\` يفهرس كل عنصر |
| **TTL** \`{ expiresAt: 1 }, { expireAfterSeconds: 0 }\` | حذف تلقائي للمستندات المنتهية (رموز التحقق، الجلسات) |
| نصي \`{ title: "text" }\` | بحث نصي أساسي (لبحث متقدم: Atlas Search) |
| جزئي \`partialFilterExpression\` | فهرسة جزء من المستندات فقط (مثل \`status: "active"\`) |

## قاعدة ESR لترتيب حقول الفهرس المركب
**E**quality ← **S**ort ← **R**ange:
\`\`\`javascript
// الاستعلام: طلبات عميل محدد، الأحدث أولاً، بمبلغ أكبر من 100
// find({ customer: id, total: { $gt: 100 } }).sort({ createdAt: -1 })
const esrIndex = { customer: 1, createdAt: -1, total: 1 };   // مساواة ← ترتيب ← مدى
console.log(Object.keys(esrIndex).join(" ← "));
\`\`\`
وكما في SQL: الفهرس \`{ customer: 1, createdAt: -1 }\` يخدم الاستعلام بـ customer وحده، لكنه **لا يخدم** الاستعلام بـ createdAt وحده (البادئة).

## اقرأ خطة التنفيذ
\`\`\`javascript
// const plan = await Order.find({ customer: id }).sort({ createdAt: -1 }).explain("executionStats");
// plan.queryPlanner.winningPlan        ← IXSCAN أم COLLSCAN؟
// plan.executionStats.totalDocsExamined  مقابل  nReturned
const healthy = { nReturned: 20, totalDocsExamined: 20 };   // قريبان = فهرس فعّال
const unhealthy = { nReturned: 20, totalDocsExamined: 480000 };
console.log(healthy.totalDocsExamined / healthy.nReturned, unhealthy.totalDocsExamined / unhealthy.nReturned);
\`\`\`
القاعدة العملية: \`totalDocsExamined\` قريب من \`nReturned\` = جيد. فارق ضخم = فهرس ناقص أو غير مناسب. وفي Atlas يقترح **Performance Advisor** الفهارس الناقصة من الاستعلامات البطيئة الفعلية.

## الفهارس ليست مجانية
كل فهرس يبطئ الكتابة ويستهلك ذاكرة (الأفضل أن تتسع الفهارس المستخدمة في الذاكرة). احذف الفهارس غير المستخدمة (\`$indexStats\`). في الإنتاج، Mongoose يبني الفهارس تلقائياً عند البدء (\`autoIndex\`) — عطّله في الإنتاج وأنشئ الفهارس عمداً عبر سكربت أو ترحيل، لأن بناء فهرس على مجموعة ضخمة مكلف.

## أنماط تصميم للأداء
- **الإسقاط**: اطلب الحقول التي تحتاجها (\`select("name price")\`) — أقل شبكة وذاكرة، وقد يُخدم الاستعلام من الفهرس وحده (covered query).
- **الترقيم بالمؤشر** (\`createdAt < lastSeen\`) بدل \`skip\` الكبير: \`skip(100000)\` يمر على 100,000 مستند.
- **نمط القيمة المحسوبة**: احفظ \`commentsCount\` في المنشور وحدّثه بـ \`$inc\` بدل عدّ التعليقات في كل عرض.
- **نمط الدلو (bucket)**: لبيانات زمنية كثيفة (قراءات حساسات) — مستند لكل ساعة يضم القراءات، أو استخدم **Time Series Collections**.
- **تجنب المصفوفات غير المحدودة** في المستند (كل تعليقات منشور مشهور): تنمو حتى حد 16MB وتبطئ كل تحديث.

## تمرين
لمجموعة \`orders\` بحقول (customer، status، total، createdAt)، صمم فهارس لهذه الاستعلامات، وبرر الترتيب بقاعدة ESR: طلبات عميل الأحدث أولاً؛ الطلبات المعلقة الأقدم من ساعة؛ أكبر 10 طلبات اليوم.
`,
    codeExample: `// indexes.js — تعريف الفهارس بوعي وفحص فعاليتها (npm install mongoose)
import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    status: { type: String, enum: ["pending", "paid", "shipped", "cancelled"], required: true },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, autoIndex: process.env.NODE_ENV !== "production" }   // في الإنتاج: إنشاء متعمد
);

// ESR: مساواة (customer) ← ترتيب (createdAt) ← مدى (total)
orderSchema.index({ customer: 1, createdAt: -1, total: 1 });
// فهرس جزئي: الطلبات المعلقة فقط (أصغر بكثير من فهرسة الكل)
orderSchema.index({ createdAt: 1 }, { partialFilterExpression: { status: "pending" } });

const verificationSchema = new Schema({
  email: { type: String, required: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});
// TTL: يحذف MongoDB المستند تلقائياً بعد expiresAt
verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Order = mongoose.models.OrderIdx ?? mongoose.model("OrderIdx", orderSchema);
const Verification = mongoose.models.Verification ?? mongoose.model("Verification", verificationSchema);

await mongoose.connect(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/kodax_demo");
try {
  await Promise.all([Order.syncIndexes(), Verification.syncIndexes()]);   // تطبيق الفهارس المعرّفة فقط
  console.log("الفهارس:", (await Order.listIndexes()).map((i) => i.name));

  const customerId = new mongoose.Types.ObjectId();
  const plan = await Order.find({ customer: customerId, total: { $gt: 100 } })
    .sort({ createdAt: -1 })
    .limit(20)
    .explain("executionStats");

  const stats = plan.executionStats;
  console.log("المرحلة الفائزة:", JSON.stringify(plan.queryPlanner.winningPlan).includes("IXSCAN") ? "IXSCAN ✅" : "COLLSCAN ⚠️");
  console.log("فُحص", stats.totalDocsExamined, "مستنداً لإعادة", stats.nReturned);

  // ترقيم بالمؤشر بدل skip الكبير
  const firstPage = await Order.find({ customer: customerId }).sort({ createdAt: -1 }).limit(20).lean();
  const last = firstPage.at(-1);
  if (last) {
    await Order.find({ customer: customerId, createdAt: { $lt: last.createdAt } }).sort({ createdAt: -1 }).limit(20).lean();
  }
} finally {
  await mongoose.disconnect();
}`,
    quiz: {
      question: 'استعلام: find({ customer: id, total: { $gt: 100 } }).sort({ createdAt: -1 }). ما ترتيب حقول الفهرس المركب المناسب وفق قاعدة ESR؟',
      options: ['{ total: 1, customer: 1, createdAt: -1 }', '{ customer: 1, createdAt: -1, total: 1 }', '{ createdAt: -1, total: 1, customer: 1 }', 'فهرس منفصل لكل حقل يكفي دائماً'],
      correctAnswer: 1,
      explanation: 'المساواة أولاً (customer)، ثم حقل الترتيب (createdAt)، ثم المدى (total).',
    },
  },
  {
    id: 'mongo-transactions',
    title: 'التحقق على مستوى القاعدة والمعاملات',
    description: 'حماية البيانات خارج كود التطبيق: $jsonSchema validator، العمليات الذرية على مستند واحد، ومعاملات المستندات المتعددة مع withTransaction ومتى تحتاجها',
    language: 'javascript',
    xpReward: 170,
    content: md`
# التحقق على مستوى القاعدة والمعاملات

## لماذا لا يكفي مخطط Mongoose؟
مخطط Mongoose يعمل **داخل تطبيقك فقط**. سكربت صيانة، أو خدمة أخرى، أو \`updateOne\` بلا \`runValidators\`، أو شخص في Compass — كلها تكتب دون المرور به. لحماية البيانات نفسها، أضف تحققاً **على مستوى المجموعة** في MongoDB.

## $jsonSchema validator
\`\`\`javascript
const productsValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["sku", "name", "price", "stock"],
    properties: {
      sku: { bsonType: "string", pattern: "^[A-Z0-9-]{3,20}$" },
      name: { bsonType: "string", minLength: 1, maxLength: 120 },
      price: { bsonType: ["double", "int", "decimal"], minimum: 0 },
      stock: { bsonType: "int", minimum: 0 },
    },
  },
};
// await db.createCollection("products", { validator: productsValidator, validationLevel: "strict", validationAction: "error" });
// لمجموعة موجودة: db.command({ collMod: "products", validator: productsValidator })
console.log(productsValidator.$jsonSchema.required);
\`\`\`
- \`validationAction: "error"\` يرفض الكتابة المخالفة (\`"warn"\` يسجّلها فقط — مفيد عند إضافة تحقق لبيانات قديمة).
- \`validationLevel: "moderate"\` يطبق التحقق على المستندات الصالحة أصلاً فقط عند تعديلها.
- للمال بدقة: نوع **Decimal128** بدل double.

## الذرية على مستند واحد: مجانية
أي عملية على **مستند واحد** ذرية دائماً، حتى لو عدّلت عدة حقول ومصفوفات معاً:
\`\`\`javascript
// خصم المخزون فقط إن كان كافياً — عملية واحدة لا يتداخل معها طلب آخر
// const r = await products.updateOne({ _id: id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
// if (r.modifiedCount === 0) throw new Error("نفد المخزون");
const atomicUpdate = { filter: { stock: { $gte: 2 } }, update: { $inc: { stock: -2 }, $push: { history: "sold 2" } } };
console.log(JSON.stringify(atomicUpdate));
\`\`\`
لذلك التصميم الجيد (تضمين ما يتغير معاً في مستند واحد) يغني عن أغلب المعاملات.

## معاملات المستندات المتعددة
عندما يجب أن تنجح عمليات على **عدة مستندات أو مجموعات** معاً أو تفشل معاً (إنشاء طلب + خصم مخزون عدة منتجات + تسجيل دفعة):
\`\`\`javascript
// const session = await mongoose.startSession();
// try {
//   await session.withTransaction(async () => {
//     await Product.updateOne({ _id: p1, stock: { $gte: 1 } }, { $inc: { stock: -1 } }, { session });
//     await Order.create([{ customer, items }], { session });   // لاحظ: مصفوفة مع session في create
//   });
// } finally {
//   await session.endSession();
// }
const rules = ["مرّر session لكل عملية", "withTransaction يعيد المحاولة عند الأخطاء المؤقتة", "لا عمليات خارجية بطيئة داخلها"];
console.log(rules.join(" | "));
\`\`\`
| القاعدة | السبب |
|---|---|
| مرّر \`{ session }\` لكل عملية داخل المعاملة | عملية بلا session تُنفَّذ **خارجها** ولا تتراجع |
| استخدم \`withTransaction\` | تعيد المحاولة تلقائياً عند الأخطاء العابرة (TransientTransactionError) |
| معاملات قصيرة | حد زمني افتراضي 60 ثانية، وتحجز موارد |
| تتطلب Replica Set | Atlas كذلك دائماً؛ MongoDB المحلي المفرد يحتاج تشغيله كـ replica set |
| لا عمليات خارجية داخلها | لا تستدعِ بوابة الدفع أو ترسل بريداً داخل المعاملة: إن أُعيدت المحاولة تتكرر |

## خطأ فشل ثم أُعيدت المحاولة؟
لأن \`withTransaction\` قد تشغّل الدالة **أكثر من مرة**، يجب أن تكون الدالة نقية من الآثار الجانبية الخارجية. نفّذ الإجراءات الخارجية **بعد** نجاح المعاملة (أو بنمط Outbox: سجّل "حدث" داخل المعاملة، وعملية منفصلة ترسله).

## تمرين
أضف validator لمجموعة \`orders\` يفرض \`status\` من قائمة محددة و \`items\` مصفوفة غير فارغة. ثم اكتب دالة \`cancelOrder\` تعيد كميات العناصر للمخزون وتغيّر الحالة داخل معاملة واحدة.
`,
    codeExample: `// orderService.js — إنشاء طلب يخصم مخزون عدة منتجات بشكل ذري (npm install mongoose)
import mongoose from "mongoose";

const { Schema } = mongoose;
mongoose.set("sanitizeFilter", true);

const Product = mongoose.models.ProductTx ?? mongoose.model("ProductTx", new Schema({
  sku: { type: String, required: true, unique: true },
  name: String,
  price: { type: Number, min: 0, required: true },
  stock: { type: Number, min: 0, required: true },
}));

const Order = mongoose.models.OrderTx ?? mongoose.model("OrderTx", new Schema({
  customer: { type: String, required: true },
  items: [{ sku: String, quantity: { type: Number, min: 1 }, unitPrice: Number }],
  total: Number,
  status: { type: String, enum: ["paid", "cancelled"], default: "paid" },
}, { timestamps: true }));

export class OutOfStockError extends Error {}

export async function placeOrder(customer, requested) {
  const session = await mongoose.startSession();
  try {
    let created;
    await session.withTransaction(async () => {
      const items = [];
      for (const { sku, quantity } of requested) {
        // ذري لكل منتج + session ← يتراجع مع المعاملة إن فشل منتج لاحق
        const product = await Product.findOneAndUpdate(
          { sku: String(sku), stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session }
        );
        if (!product) throw new OutOfStockError(\`نفد المخزون: \${sku}\`);
        items.push({ sku: product.sku, quantity, unitPrice: product.price });
      }
      const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
      [created] = await Order.create([{ customer, items, total }], { session });
    });
    // الإجراءات الخارجية (بريد التأكيد) بعد نجاح المعاملة فقط
    return created;
  } finally {
    await session.endSession();
  }
}

// تجربة (تحتاج Replica Set — Atlas أو mongod --replSet)
await mongoose.connect(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/kodax_demo?replicaSet=rs0");
try {
  await Product.deleteMany({ sku: { $in: ["PEN", "BAG"] } });
  await Product.create([{ sku: "PEN", name: "قلم", price: 1.5, stock: 100 }, { sku: "BAG", name: "حقيبة", price: 25, stock: 1 }]);

  const order = await placeOrder("sara", [{ sku: "PEN", quantity: 3 }, { sku: "BAG", quantity: 1 }]);
  console.log("طلب ناجح، المجموع:", order.total);

  await placeOrder("omar", [{ sku: "PEN", quantity: 2 }, { sku: "BAG", quantity: 1 }])
    .catch((err) => console.log("رُفض:", err.message));

  // القلم لم يُخصم للطلب المرفوض لأن المعاملة تراجعت
  console.log("مخزون القلم:", (await Product.findOne({ sku: "PEN" })).stock);   // 97
} finally {
  await mongoose.disconnect();
}`,
    quiz: {
      question: 'داخل session.withTransaction نسيت تمرير { session } لعملية updateOne واحدة. ماذا يحدث إذا فشلت المعاملة؟',
      options: [
        'تتراجع كل العمليات بما فيها هذه',
        'هذه العملية نُفذت خارج المعاملة فلا تتراجع، فتصبح البيانات غير متسقة',
        'يرمي MongoDB خطأ قبل التنفيذ',
        'لا فرق لأن العملية على مستند واحد',
      ],
      correctAnswer: 1,
      explanation: 'كل عملية داخل المعاملة يجب أن تحمل session، وإلا تُنفذ مستقلة وتبقى حتى لو تراجعت المعاملة.',
    },
  },
  {
    id: 'mongo-project',
    title: 'مشروع: واجهة مدونة بـ MongoDB',
    description: 'مشروع ختامي: تصميم مستندات مدونة (مستخدمون، منشورات، تعليقات) حسب أنماط القراءة، الفهارس، العدّادات الذرية، الترقيم بالمؤشر، وتقرير تجميعي',
    language: 'javascript',
    xpReward: 250,
    content: md`
# مشروع: واجهة مدونة بـ MongoDB

ستصمم طبقة البيانات لمدونة متعددة الكتّاب. الهدف ليس CRUD فقط، بل **قرارات تصميم** مبنية على كيف تُقرأ البيانات.

## الشاشات (أنماط القراءة)
1. **الصفحة الرئيسية**: أحدث المنشورات المنشورة، مع اسم الكاتب وعدد التعليقات — تُقرأ آلاف المرات.
2. **صفحة المنشور**: المنشور كاملاً + أول 20 تعليقاً + زر "المزيد".
3. **صفحة الكاتب**: منشوراته الأحدث أولاً.
4. **لوحة الكاتب**: عدد المشاهدات والتعليقات لكل منشور في آخر 30 يوماً.

## قرارات التصميم
| القرار | السبب |
|---|---|
| \`posts\` يضمّن \`author: { _id, name }\` | الصفحة الرئيسية تعرض الاسم بلا populate؛ عند تغيير الاسم (نادر) نحدّث المنشورات بـ \`updateMany\` |
| \`comments\` مجموعة منفصلة بمرجع \`post\` | التعليقات غير محدودة العدد — مصفوفة داخل المنشور تنمو بلا حد |
| \`commentsCount\` و \`views\` داخل المنشور | تُعرض كثيراً؛ تُحدَّث بـ \`$inc\` ذري بدل العد في كل عرض |
| فهرس \`{ status: 1, publishedAt: -1 }\` | الصفحة الرئيسية |
| فهرس \`{ "author._id": 1, publishedAt: -1 }\` | صفحة الكاتب |
| فهرس \`{ post: 1, createdAt: 1 }\` على التعليقات | تعليقات منشور بالترتيب |
| \`slug\` فريد | روابط مقروءة \`/posts/my-first-post\` |

## تزامن العدّاد مع التعليق
إضافة تعليق = إدراج في \`comments\` + \`$inc: { commentsCount: 1 }\` في المنشور. إن نجح الأول وفشل الثاني ينحرف العدد قليلاً. خياران:
- معاملة (الدرس السابق) — دقة كاملة بتكلفة أعلى.
- قبول انحراف مؤقت + مهمة دورية تعيد حساب العدّادات من التعليقات. شائع جداً لعدّادات العرض، وغير مقبول للمال.
المثال يستخدم المعاملة.

## الترقيم
الصفحة الرئيسية بالمؤشر: \`publishedAt < آخر_تاريخ_في_الصفحة\` (مع \`_id\` لكسر التعادل) بدل \`skip\` — ثابت وسريع مع النشر المستمر.

## التقرير التجميعي
لوحة الكاتب بـ \`aggregate\`: \`$match\` على الكاتب والفترة (يستخدم الفهرس) ← \`$project\` للحقول ← \`$sort\`.

## الأمان
- \`sanitizeFilter\` مفعّل، والمدخلات تُحوّل لأنواعها.
- الكاتب يعدّل منشوراته فقط: الفلتر يتضمن \`"author._id": currentUserId\` في كل تحديث/حذف (منع IDOR).
- محتوى المنشور والتعليقات يُعرض في الواجهة **كنص** أو بعد تعقيم HTML (منع XSS المخزّن).

## تحديات إضافية
1. الإعجابات: مجموعة \`likes\` بفهرس فريد \`{ post, user }\` يمنع الإعجاب المزدوج، مع \`likesCount\`.
2. الوسوم: مصفوفة \`tags\` بفهرس multikey وصفحة لكل وسم.
3. المسودات والنشر المجدول (\`status: "scheduled"\` و \`publishedAt\` مستقبلي).
4. البحث بـ Atlas Search، أو فهرس نصي كبداية.
`,
    codeExample: `// blog.js — طبقة بيانات المدونة (npm install mongoose)
import mongoose from "mongoose";

const { Schema } = mongoose;
mongoose.set("sanitizeFilter", true);

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    body: { type: String, required: true },
    author: { _id: { type: Schema.Types.ObjectId, required: true }, name: { type: String, required: true } },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: Date,
    commentsCount: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);
postSchema.index({ status: 1, publishedAt: -1, _id: -1 });
postSchema.index({ "author._id": 1, publishedAt: -1 });

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "BlogPost", required: true },
    user: { _id: Schema.Types.ObjectId, name: String },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);
commentSchema.index({ post: 1, createdAt: 1 });

const Post = mongoose.models.BlogPost ?? mongoose.model("BlogPost", postSchema);
const Comment = mongoose.models.BlogComment ?? mongoose.model("BlogComment", commentSchema);

// الصفحة الرئيسية: ترقيم بالمؤشر (publishedAt ثم _id لكسر التعادل)
export async function latestPosts({ before, beforeId, limit = 10 } = {}) {
  const filter = { status: "published" };
  if (before) {
    filter.$or = [
      { publishedAt: { $lt: new Date(before) } },
      { publishedAt: new Date(before), _id: { $lt: new mongoose.Types.ObjectId(String(beforeId)) } },
    ];
  }
  return Post.find(filter)
    .sort({ publishedAt: -1, _id: -1 })
    .limit(Math.min(50, limit))
    .select("title slug author.name publishedAt commentsCount")
    .lean();
}

// صفحة المنشور: زيادة المشاهدات ذرياً + أول التعليقات
export async function openPost(slug) {
  const post = await Post.findOneAndUpdate({ slug: String(slug), status: "published" }, { $inc: { views: 1 } }, { new: true }).lean();
  if (!post) return null;
  const comments = await Comment.find({ post: post._id }).sort({ createdAt: 1 }).limit(20).lean();
  return { post, comments };
}

// تعليق + العدّاد معاً في معاملة
export async function addComment(postId, user, text) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const updated = await Post.updateOne({ _id: postId, status: "published" }, { $inc: { commentsCount: 1 } }, { session });
      if (updated.matchedCount === 0) throw new Error("المنشور غير موجود");
      await Comment.create([{ post: postId, user, text: String(text).slice(0, 2000) }], { session });
    });
  } finally {
    await session.endSession();
  }
}

// الكاتب يعدّل منشوراته فقط: المالك جزء من الفلتر (منع IDOR)
export async function updateOwnPost(postId, currentUserId, changes) {
  const allowed = {};
  if (typeof changes.title === "string") allowed.title = changes.title;
  if (typeof changes.body === "string") allowed.body = changes.body;
  const result = await Post.updateOne({ _id: postId, "author._id": currentUserId }, { $set: allowed }, { runValidators: true });
  if (result.matchedCount === 0) throw new Error("غير موجود");   // 404 حتى لا نكشف وجود منشورات الآخرين
}

// لوحة الكاتب: آخر 30 يوماً
export async function authorDashboard(authorId) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return Post.aggregate([
    { $match: { "author._id": new mongoose.Types.ObjectId(String(authorId)), publishedAt: { $gte: since } } },
    { $project: { _id: 0, title: 1, views: 1, commentsCount: 1, engagement: { $add: ["$views", { $multiply: ["$commentsCount", 5] }] } } },
    { $sort: { engagement: -1 } },
  ]);
}`,
    quiz: {
      question: 'لماذا جُعلت التعليقات مجموعة منفصلة بدل مصفوفة داخل مستند المنشور؟',
      options: [
        'لأن MongoDB لا يدعم المصفوفات',
        'لأن عدد التعليقات غير محدود؛ المصفوفة تنمو بلا حد (حتى 16MB) وتبطئ كل تحديث للمنشور',
        'لأن التعليقات لا تُقرأ مع المنشور أبداً',
        'لتقليل عدد الفهارس',
      ],
      correctAnswer: 1,
      explanation: 'التضمين للبيانات المحدودة التي تُقرأ معاً؛ البيانات غير المحدودة تُفصل بمرجع وفهرس.',
    },
  },
];

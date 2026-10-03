/**
 * منهج backend-auth — المصادقة والتفويض.
 *
 * كان: 6 دروس بشرح من 8–15 سطراً؛ مثال الجلسات يكتب السر في الكود ('your-secret-key')، ولا يجدد
 * معرّف الجلسة بعد الدخول (Session Fixation)، ومسار /profile يعيد وثيقة المستخدم كاملة بما فيها
 * hash كلمة المرور؛ وسيط JWT يكمل (next) حتى لو حُذف المستخدم، ولا يحدد الخوارزمية في verify؛
 * Refresh Tokens تُخزَّن نصاً صريحاً في قاعدة البيانات بلا تدوير (rotation) ولا كشف لإعادة
 * الاستخدام؛ OAuth يمرر JWT في رابط إعادة التوجيه (يتسرب عبر السجل والـ Referer وسجلات الخوادم)؛
 * اختبار JWT يقدّم localStorage كإجابة صحيحة دون ذكر خطر XSS.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';
import { AUTH_NEW_LESSONS } from './more-auth-baas';

export const BACKEND_AUTH_PLAN: CoursePlan = {
  courseId: 'backend-auth',
  course: {
    description:
      'أمّن تطبيقك بشكل صحيح: المصادقة والتفويض، الجلسات وملفات تعريف الارتباط الآمنة، JWT، تخزين كلمات المرور، حماية المسارات والملكية، Refresh Tokens مع التدوير، OAuth، تحديد المعدل والمصادقة الثنائية — مع مشروع نظام مصادقة كامل.',
  },
  sections: [
    { title: 'الأساسيات', lessons: ['auth-1', 'auth-3'] },
    { title: 'الرموز والصلاحيات', lessons: ['auth-2', 'auth-4', 'auth-5'] },
    { title: 'تسجيل الدخول الخارجي', lessons: ['auth-6'] },
    { title: 'حماية الحسابات', lessons: ['auth-rate-limit-mfa'] },
    { title: 'المشروع', lessons: ['auth-project'] },
  ],
  newLessons: AUTH_NEW_LESSONS,
  codeFixes: {
    'auth-1': [
      ["  secret: 'your-secret-key',", '  secret: process.env.SESSION_SECRET,   // سر طويل عشوائي من متغيرات البيئة — لا يُكتب في الكود'],
      [
        "  // حفظ في الجلسة\n  req.session.userId = user._id;\n  req.session.role = user.role;\n  \n  res.json({ success: true, user: { name: user.name } });",
        "  // معرّف جلسة جديد بعد الدخول: يمنع Session Fixation\n  req.session.regenerate((err) => {\n    if (err) return res.status(500).json({ error: 'خطأ في الجلسة' });\n    req.session.userId = user._id;\n    req.session.role = user.role;\n    res.json({ success: true, user: { name: user.name } });\n  });",
      ],
      ['  const user = await User.findById(req.session.userId);\n  res.json(user);', "  const user = await User.findById(req.session.userId).select('-password');   // لا تُرجع hash كلمة المرور\n  res.json(user);"],
    ],
    'auth-2': [
      [
        '    const decoded = jwt.verify(token, JWT_SECRET);\n    req.user = await User.findById(decoded.userId);\n    next();',
        "    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });   // حدد الخوارزمية المقبولة\n    const user = await User.findById(decoded.userId).select('-password');\n    if (!user) return res.status(401).json({ error: 'المستخدم لم يعد موجوداً' });\n    req.user = user;\n    next();",
      ],
    ],
    'auth-6': [
      [
        '    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);',
        "    // لا نضع الرمز في الرابط (يتسرب في السجل والـ Referer وسجلات الخوادم): ملف تعريف ارتباط HttpOnly\n    res.cookie('accessToken', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });\n    res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);",
      ],
    ],
  },
  patches: {
    'auth-1': {
      description: 'المصادقة مقابل التفويض، الجلسات مقابل الرموز، ملفات تعريف الارتباط الآمنة (HttpOnly و Secure و SameSite)، وهجمات شائعة',
      content: md`
# مقدمة في المصادقة (Authentication)

## سؤالان مختلفان
| | المصادقة (Authentication) | التفويض (Authorization) |
|---|---|---|
| السؤال | **من أنت؟** | **ماذا يُسمح لك؟** |
| مثال | تسجيل الدخول بكلمة المرور | المستخدم يعدّل منشوراته فقط؛ المشرف يحذف أي منشور |
| الفشل | 401 Unauthorized | 403 Forbidden |

## بعد تسجيل الدخول: كيف يتذكر الخادم المستخدم؟
HTTP بلا حالة: كل طلب مستقل. هناك طريقتان رئيسيتان:
### 1. الجلسات (Sessions)
الخادم ينشئ جلسة (في الذاكرة أو Redis أو قاعدة البيانات) ويعطي المتصفح **معرّفها** في ملف تعريف ارتباط. كل طلب يحمل المعرّف تلقائياً.
- ✅ إلغاء فوري (احذف الجلسة)، والمعرّف لا يحمل بيانات.
- ❌ يحتاج تخزيناً مشتركاً عند تعدد الخوادم.

### 2. الرموز (Tokens / JWT)
الخادم يوقّع رمزاً يحتوي هوية المستخدم ويعطيه للعميل، والعميل يرسله مع كل طلب. الخادم يتحقق من التوقيع دون الرجوع لقاعدة البيانات.
- ✅ مناسب للتطبيقات الجوالة والخدمات المتعددة.
- ❌ صعب الإلغاء قبل انتهاء صلاحيته — لذلك تكون قصيرة العمر مع Refresh Tokens (درس قادم).

لتطبيق ويب تقليدي على نطاق واحد، الجلسات غالباً أبسط وأأمن.

## ملفات تعريف ارتباط آمنة
| الخاصية | الحماية |
|---|---|
| \`HttpOnly\` | JavaScript في الصفحة لا يستطيع قراءته ← حماية من سرقته عبر XSS |
| \`Secure\` | يُرسل عبر HTTPS فقط |
| \`SameSite=Lax\` أو \`Strict\` | لا يُرسل مع طلبات من مواقع أخرى ← حماية من CSRF |
| \`Max-Age\` | مدة صلاحية محددة |

## أخطاء شائعة وما يمنعها
| المشكلة | الوقاية |
|---|---|
| تخمين كلمات المرور آلياً | تحديد معدل المحاولات (rate limiting) والقفل المؤقت |
| رسالة "البريد غير موجود" مقابل "كلمة المرور خاطئة" | رسالة موحدة: "بيانات الدخول غير صحيحة" — لا تكشف وجود الحساب |
| تثبيت الجلسة (Session Fixation) | معرّف جلسة **جديد** بعد الدخول (\`req.session.regenerate\`) |
| أسرار في الكود | متغيرات البيئة |
| كلمات مرور مخزنة كنص | تجزئة بطيئة بملح (الدرس التالي) |
| إرجاع بيانات حساسة | لا تُرجع hash كلمة المرور أو رموز الاستعادة في أي استجابة |

## لا تبنِ كل شيء بنفسك
المصادقة سهلة الخطأ. للمشاريع الحقيقية فكّر في حلول مُختبرة: Supabase Auth، Firebase Auth، Auth.js، Clerk... وافهم ما تفعله (هذه الدورة) لتستخدمها بشكل صحيح.

## تمرين
ارسم تسلسل طلبات تسجيل الدخول ثم طلب صفحة محمية بالجلسات، ثم بـ JWT: ماذا يرسل العميل في كل طلب؟ وأين تُخزَّن الحالة؟ وماذا يحدث عند تسجيل الخروج في كل حالة؟
`,
    },
    'auth-3': {
      description: 'تخزين كلمات المرور: لماذا لا SHA-256، الملح والتجزئة البطيئة (bcrypt و Argon2)، المقارنة الآمنة، سياسات كلمات المرور، والاستعادة',
      content: md`
# تجزئة كلمات المرور (Password Hashing)

قواعد البيانات تُسرَّب — حتى عند الشركات الكبرى. السؤال ليس "هل" بل "ماذا يجد المهاجم عندها". الهدف: حتى لو سُرقت القاعدة، **لا يستطيع أحد استعادة كلمات المرور**.

## ما الخطأ في الطرق البسيطة؟
| الطريقة | المشكلة |
|---|---|
| نص صريح | كارثة: كل الحسابات مكشوفة، والناس يكررون كلمات المرور في مواقع أخرى |
| تشفير (قابل للفك) | من يملك المفتاح يفكّ الكل؛ وغالباً المفتاح على نفس الخادم |
| SHA-256 / MD5 | **سريعة جداً**: بطاقة رسومية تجرب مليارات المحاولات في الثانية؛ وكلمتا مرور متطابقتان تعطيان نفس الناتج |

## الحل: تجزئة بطيئة مع ملح
- **الملح (Salt)**: قيمة عشوائية فريدة لكل مستخدم تُضاف قبل التجزئة ← كلمتا مرور متطابقتان تعطيان ناتجين مختلفين، وتسقط الجداول المحسوبة مسبقاً (Rainbow Tables).
- **بطء مقصود**: كل محاولة تستغرق ~100–250 ملّي ثانية. لا يزعج مستخدماً يسجل دخوله، لكنه يجعل تجربة مليار كلمة مرور مستحيلة عملياً.

| الخوارزمية | ملاحظات |
|---|---|
| **Argon2id** | التوصية الأولى الحالية (OWASP)؛ مقاومة لبطاقات الرسوميات بالذاكرة |
| **bcrypt** | ممتازة ومنتشرة جداً؛ عامل التكلفة 12 تقريباً؛ تتجاهل ما بعد 72 بايتاً |
| scrypt / PBKDF2 | مقبولة (PBKDF2 بعدد تكرارات كبير جداً: 600,000 لـ SHA-256) |

bcrypt تضع الملح والتكلفة **داخل** الناتج نفسه (\`$2b$12$...\`)، فلا تحتاج عموداً منفصلاً للملح.

## بلغة Node المدمجة (scrypt)
\`\`\`javascript
const crypto = require("node:crypto");

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return \`\${salt.toString("hex")}:\${hash.toString("hex")}\`;
}

function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(":");
  const hash = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), 64, { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return crypto.timingSafeEqual(hash, Buffer.from(hashHex, "hex"));   // مقارنة ثابتة الزمن
}

const stored = hashPassword("Kodax-2026!");
console.log(stored.slice(0, 40) + "…");
console.log(verifyPassword("Kodax-2026!", stored), verifyPassword("wrong", stored));
\`\`\`
\`timingSafeEqual\` يمنع استنتاج الناتج من زمن المقارنة (\`===\` يتوقف عند أول اختلاف).

## مع bcrypt (المثال الكامل)
\`bcrypt.hash(password, 12)\` و \`bcrypt.compare(input, hash)\` — المقارنة آمنة زمنياً تلقائياً. نسخة \`bcryptjs\` بلا اعتماديات أصلية (أبطأ قليلاً).

## سياسة كلمات المرور الحديثة (NIST)
- **الطول أهم من التعقيد**: 8 أحرف حداً أدنى (12+ أفضل)، واسمح بالطويلة (64+) وبالمسافات والعربية.
- افحص كلمة المرور مقابل قوائم المسرّب (خدمة Have I Been Pwned بطريقة k-anonymity).
- لا تفرض تغييراً دورياً بلا سبب، ولا قواعد مثل "رمز + رقم + حرف كبير" إلزامياً.
- شجّع مديري كلمات المرور والمصادقة متعددة العوامل.

## استعادة كلمة المرور
رمز عشوائي طويل لمرة واحدة (\`crypto.randomBytes(32)\`)، **خزّن تجزئته** لا الرمز نفسه، صلاحية قصيرة (15–60 دقيقة)، وألغِ كل الجلسات بعد التغيير. ولا تكشف إن كان البريد مسجلاً ("إن كان الحساب موجوداً ستصلك رسالة").

## تمرين
عدّل عامل تكلفة bcrypt في المثال من 10 إلى 14 وقِس الزمن لكل قيمة. اختر قيمة تعطي ~250ms على جهازك. لماذا يجب رفعها مع مرور السنين؟
`,
    },
    'auth-2': {
      description: 'JWT من الداخل: الأجزاء الثلاثة والتوقيع، ما يجب وما لا يجب وضعه فيه، التحقق الصحيح، أين يُخزَّن، ومخاطره',
      content: md`
# مصادقة JWT

**JSON Web Token** رمز موقّع يحمل معلومات (claims) عن المستخدم. الخادم يتحقق من صحته بالتوقيع دون استعلام قاعدة البيانات.

## الأجزاء الثلاثة
\`\`\`text
eyJhbGciOiJIUzI1NiJ9 . eyJzdWIiOiI0MiIsImV4cCI6MTc5MDAwMDAwMH0 . 4pcPyMD09olPSyXnrXCjTwXyr4BsezdI1AVTmud2fU4
      Header                         Payload                                Signature
\`\`\`
- **Header**: الخوارزمية (\`HS256\`).
- **Payload**: البيانات (\`sub\` المعرّف، \`exp\` الانتهاء، \`iat\` وقت الإصدار، \`role\`...).
- **Signature**: توقيع للجزأين بسر الخادم. أي تعديل في الـ Payload يُبطل التوقيع.

⚠️ **الـ Payload مُرمّز (Base64URL) وليس مشفراً**: أي شخص يقرؤه:
\`\`\`javascript
const payload = "eyJzdWIiOiI0MiIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzkwMDAwMDAwfQ";
console.log(JSON.parse(Buffer.from(payload, "base64url").toString()));
\`\`\`
لا تضع فيه كلمات مرور أو بيانات حساسة.

## الإصدار والتحقق
\`\`\`javascript
const jwt = require("jsonwebtoken");

const token = jwt.sign({ sub: "42", role: "user" }, process.env.JWT_SECRET, { expiresIn: "15m" });
const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });   // يرمي إن كان مزوراً أو منتهياً
\`\`\`
قواعد التحقق:
- حدد \`algorithms\` صراحةً (تاريخياً استُغلت مكتبات تقبل \`alg: none\` أو تخلط الخوارزميات).
- **السر**: طويل وعشوائي (32 بايتاً فأكثر)، في متغيرات البيئة، وسر مختلف لـ Refresh Tokens.
- \`expiresIn\` قصير لرموز الوصول (5–15 دقيقة).
- **تحقق أن المستخدم ما زال موجوداً ومفعّلاً** عند الحاجة: الرمز يبقى صالحاً حتى لو حُذف الحساب.

## أين يُخزَّن في المتصفح؟
| المكان | XSS | CSRF |
|---|---|---|
| \`localStorage\` | ❌ أي سكربت في صفحتك (أو مكتبة مخترقة) يقرؤه ويسرقه | ✅ لا يُرسل تلقائياً |
| ملف تعريف ارتباط \`HttpOnly; Secure; SameSite\` | ✅ لا يقرؤه JavaScript | ⚠️ يُرسل تلقائياً — SameSite يحمي في أغلب الحالات |
| الذاكرة فقط (متغير) | ✅ أفضل | يضيع عند التحديث ← يُجدد بـ Refresh Token في cookie |

التوصية الشائعة للويب: رمز وصول قصير في الذاكرة، و Refresh Token في cookie بخاصية HttpOnly. للتطبيقات الجوالة: التخزين الآمن للنظام (Keychain / Keystore، مثل expo-secure-store).

## JWT ليس دائماً الخيار الأفضل
لتطبيق ويب واحد على نطاق واحد، الجلسات أبسط وتُلغى فوراً. JWT يلمع مع الجوال، والخدمات المتعددة، والـ APIs العامة.

## تمرين
فك ترميز رمز JWT حقيقي من تطبيقك (أدوات المطور ← Network) دون معرفة السر — ماذا ترى؟ ثم عدّل حرفاً في الـ Payload وحاول التحقق منه بـ \`jwt.verify\`.
`,
      quiz: {
        question: 'أي عبارة عن تخزين JWT في المتصفح صحيحة؟',
        options: [
          'localStorage هو المكان الأكثر أماناً دائماً',
          'localStorage يمكن لأي سكربت (عبر XSS) قراءته؛ ملف تعريف ارتباط HttpOnly لا يقرؤه JavaScript',
          'يجب تخزينه في رابط الصفحة',
          'الـ Payload مشفر فلا يهم أين يُخزَّن',
        ],
        correctAnswer: 1,
        explanation: 'HttpOnly يحمي من سرقة الرمز عبر XSS، و SameSite يقلل خطر CSRF؛ والـ Payload مرمّز لا مشفّر.',
      },
    },
    'auth-4': {
      description: 'حماية المسارات: وسيط المصادقة، التفويض بالأدوار وبالملكية، منع IDOR، وفحص تغيير كلمة المرور بعد إصدار الرمز',
      content: md`
# حماية المسارات (Protected Routes)

## ثلاث طبقات من الأسئلة
\`\`\`text
1) هل أنت مسجل؟          ← وسيط المصادقة       ← وإلا 401
2) هل دورك يسمح؟         ← فحص الأدوار          ← وإلا 403
3) هل هذا المورد لك؟     ← فحص الملكية          ← وإلا 403 (أو 404)
\`\`\`

## 1. وسيط المصادقة
يستخرج الرمز ويتحقق منه ويحمّل المستخدم إلى \`req.user\`. المثال الكامل يضيف فحصاً مهماً: إذا **غيّر المستخدم كلمة مروره** بعد إصدار الرمز، يُرفض الرمز القديم (\`passwordChangedAt > iat\`) — فمن سرق رمزاً يفقده عندما يغيّر الضحية كلمة المرور.

## 2. التفويض بالأدوار
\`\`\`javascript
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ error: "ليس لديك صلاحية" });
  next();
};
// app.delete("/api/users/:id", protect, restrictTo("admin"), deleteUser);
\`\`\`
**الدور يأتي من الخادم** (قاعدة البيانات أو رمز وقّعه الخادم)، لا من جسم الطلب ولا من ترويسة يرسلها العميل.

## 3. الملكية ومنع IDOR
أشهر ثغرة في واجهات API (المرتبة الأولى في OWASP API Top 10): **IDOR** — تغيير المعرّف في الرابط للوصول لبيانات شخص آخر:
\`\`\`text
GET /api/orders/1001   ← طلبي
GET /api/orders/1002   ← طلب شخص آخر! هل يمنعه الخادم؟
\`\`\`
كون المستخدم مسجلاً **لا يعني** أنه يملك المورد. الحل: قيّد الاستعلام نفسه بالمالك:
\`\`\`javascript
// بدل: Order.findById(req.params.id)
// const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
// if (!order) return res.status(404).json({ error: "غير موجود" });
const orders = [{ id: 1001, user: "u1" }, { id: 1002, user: "u2" }];
const findOwned = (id, userId) => orders.find((o) => o.id === id && o.user === userId);
console.log(findOwned(1001, "u1"), findOwned(1002, "u1"));   // الثاني undefined
\`\`\`
إرجاع 404 بدل 403 للموارد التي لا يملكها يمنع حتى معرفة وجودها. والمعرّفات العشوائية (UUID) تصعّب التخمين لكنها **ليست** بديلاً عن فحص الملكية.

## ترتيب الوسائط
\`app.patch("/api/posts/:id", protect, checkOwnership(Post), validate(schema), updatePost)\` — المصادقة أولاً دائماً، ثم الصلاحية، ثم التحقق من البيانات.

## اختبر الحماية
لكل مسار محمي: طلب بلا رمز (401)، برمز منتهٍ (401)، بمستخدم عادي على مسار المشرف (403)، وبمستخدم آخر على مورد ليس له (403/404). هذه الاختبارات أهم من اختبارات "النجاح".

## تمرين
أضف إلى المثال الكامل مساراً \`GET /api/orders/:id\` يعتمد على \`checkOwnership\`، واكتب أربعة طلبات تجريبية تغطي الحالات أعلاه.
`,
    },
    'auth-5': {
      description: 'رموز التجديد: لماذا رمزان، التخزين في cookie آمن، تخزين التجزئة في قاعدة البيانات، التدوير، وكشف إعادة الاستخدام',
      content: md`
# رموز التجديد (Refresh Tokens)

رمز الوصول (JWT) يجب أن يكون **قصير العمر** (15 دقيقة) لأنه صعب الإلغاء. لكن لا نريد أن يسجل المستخدم دخوله كل ربع ساعة. الحل: رمزان.

| | رمز الوصول (Access) | رمز التجديد (Refresh) |
|---|---|---|
| العمر | دقائق | أيام/أسابيع |
| يُرسل إلى | كل طلب API | مسار \`/auth/refresh\` فقط |
| التخزين في الويب | الذاكرة | ملف تعريف ارتباط HttpOnly + Secure + SameSite=Strict مقيّد بالمسار |
| الإلغاء | ينتهي وحده | **في قاعدة البيانات** (يمكن إلغاؤه فوراً) |

## التدفق
\`\`\`text
تسجيل الدخول ← access (15د) + refresh (7 أيام في cookie)
… طلبات بـ access …
access انتهى ← 401 ← العميل يطلب /auth/refresh (cookie يُرسل تلقائياً)
الخادم يتحقق من refresh ← access جديد + refresh جديد (تدوير) ← يعيد الطلب الأصلي
\`\`\`

## ثلاث ممارسات ضرورية
### 1. خزّن **تجزئة** رمز التجديد لا الرمز نفسه
إذا سُرّبت قاعدة البيانات، لا يجد المهاجم رموزاً صالحة. رمز التجديد عشوائي طويل، فتكفيه تجزئة سريعة (SHA-256) — بعكس كلمات المرور.

### 2. التدوير (Rotation)
كل استخدام لرمز التجديد يُصدر رمزاً **جديداً** ويُلغي القديم. الرمز صالح لمرة واحدة.

### 3. كشف إعادة الاستخدام
إذا وصل رمز تجديد **مُستخدم مسبقاً**، فقد سُرق أحد الرمزين (المهاجم أو المستخدم الحقيقي يستخدم نسخة قديمة). الاستجابة الآمنة: ألغِ **كل** رموز تلك العائلة/المستخدم وأجبره على تسجيل الدخول من جديد.

\`\`\`javascript
const crypto = require("node:crypto");

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const db = new Map();   // tokenHash ← { userId, used }

function issue(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  db.set(sha256(token), { userId, used: false });
  return token;
}

function rotate(token) {
  const rec = db.get(sha256(token));
  if (!rec) return { error: "غير صالح" };
  if (rec.used) {                                  // إعادة استخدام ← اختراق محتمل
    for (const [h, r] of db) if (r.userId === rec.userId) db.delete(h);
    return { error: "إعادة استخدام: أُلغيت كل الجلسات" };
  }
  rec.used = true;
  return { token: issue(rec.userId) };
}

const t1 = issue("u1");
const t2 = rotate(t1).token;
console.log(rotate(t1));          // المهاجم يعيد استخدام القديم
console.log(rotate(t2));          // حتى الجديد أُلغي
\`\`\`

## تسجيل الخروج
احذف رمز التجديد من قاعدة البيانات وامسح الـ cookie. "الخروج من كل الأجهزة" = حذف كل رموز المستخدم. رموز الوصول الحالية تبقى صالحة حتى انتهائها القصير — هذا هو الثمن المقبول.

## تمرين
اربط منطق المثال بمسار Express: \`POST /auth/refresh\` يقرأ الـ cookie، يدوّر الرمز، ويضع الجديد في cookie بنفس الخصائص، ويعيد رمز وصول جديداً.
`,
      codeExample: `// Refresh Tokens مع التدوير وكشف إعادة الاستخدام وتخزين التجزئة
// npm install express cookie-parser jsonwebtoken
const crypto = require("node:crypto");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cookieParser());

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

// في مشروع حقيقي: جدول refresh_tokens (token_hash, user_id, family_id, expires_at, used_at)
const refreshStore = new Map();

function issueAccess(userId) {
  return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: "15m" });
}

function issueRefresh(userId, familyId = crypto.randomUUID()) {
  const token = crypto.randomBytes(32).toString("base64url");
  refreshStore.set(sha256(token), { userId, familyId, expiresAt: Date.now() + REFRESH_TTL_MS, usedAt: null });
  return token;
}

const cookieOptions = { httpOnly: true, secure: true, sameSite: "strict", path: "/api/auth", maxAge: REFRESH_TTL_MS };

function revokeFamily(familyId) {
  for (const [hash, rec] of refreshStore) if (rec.familyId === familyId) refreshStore.delete(hash);
}

app.post("/api/auth/login", async (req, res) => {
  // ... التحقق من البريد وكلمة المرور (درس التجزئة) ...
  const userId = "user-42";
  res.cookie("refreshToken", issueRefresh(userId), cookieOptions);
  res.json({ accessToken: issueAccess(userId) });
});

app.post("/api/auth/refresh", (req, res) => {
  const token = req.cookies.refreshToken;
  const rec = token && refreshStore.get(sha256(token));
  if (!rec || rec.expiresAt < Date.now()) return res.status(401).json({ error: "سجّل الدخول من جديد" });

  if (rec.usedAt) {
    // رمز مستخدم مسبقاً: سُرق أحد الرمزين — نلغي العائلة كلها
    revokeFamily(rec.familyId);
    res.clearCookie("refreshToken", cookieOptions);
    return res.status(401).json({ error: "تم اكتشاف إعادة استخدام؛ سجّل الدخول من جديد" });
  }

  rec.usedAt = Date.now();                                   // صالح لمرة واحدة
  res.cookie("refreshToken", issueRefresh(rec.userId, rec.familyId), cookieOptions);
  res.json({ accessToken: issueAccess(rec.userId) });
});

app.post("/api/auth/logout", (req, res) => {
  const token = req.cookies.refreshToken;
  const rec = token && refreshStore.get(sha256(token));
  if (rec) revokeFamily(rec.familyId);
  res.clearCookie("refreshToken", cookieOptions);
  res.status(204).end();
});

app.listen(process.env.PORT || 3000);`,
    },
    'auth-6': {
      description: 'OAuth 2.0 و OpenID Connect: تدفق رمز التفويض مع PKCE، ربط الحسابات، النطاقات، وتسليم الجلسة للواجهة بأمان',
      content: md`
# OAuth و تسجيل الدخول الاجتماعي

"سجّل الدخول بـ Google" يعني أن Google تتحقق من هوية المستخدم، وتطبيقك يثق بنتيجتها — دون أن يرى كلمة مرور Google أبداً.

## مصطلحات
| المصطلح | المعنى |
|---|---|
| **OAuth 2.0** | بروتوكول **تفويض**: السماح لتطبيقك بالوصول لموارد المستخدم عند مزود (تقويمه، مستودعاته) |
| **OpenID Connect (OIDC)** | طبقة **مصادقة** فوق OAuth: تعطيك \`id_token\` يثبت من هو المستخدم |
| Client ID / Secret | هوية تطبيقك عند المزود؛ السر **على الخادم فقط** |
| Redirect URI | العنوان الذي يعود إليه المستخدم بعد الموافقة؛ يُسجَّل مسبقاً لدى المزود |
| Scopes | الصلاحيات المطلوبة: \`openid email profile\` — اطلب الحد الأدنى |

## تدفق رمز التفويض (Authorization Code)
\`\`\`text
1) المستخدم يضغط "الدخول بـ Google" ← تطبيقك يحوّله إلى Google مع: client_id، redirect_uri، scope، state، code_challenge
2) المستخدم يسجل الدخول في Google ويوافق
3) Google تعيده إلى redirect_uri ومعه ?code=...&state=...
4) خادمك يتحقق من state، ويستبدل code (مع client_secret و code_verifier) بالرموز — اتصال خادم-لخادم
5) خادمك يقرأ هوية المستخدم، ينشئ/يربط الحساب، ويبدأ جلسته الخاصة
\`\`\`
- **state**: قيمة عشوائية تُحفظ قبل التحويل وتُقارن عند العودة ← تمنع CSRF في التدفق.
- **PKCE** (\`code_challenge\`/\`code_verifier\`): يمنع من يعترض الـ code من استخدامه. إلزامي للتطبيقات الجوالة وتطبيقات المتصفح، ومُستحسن للجميع.
- التدفق الضمني القديم (Implicit، الرمز في الرابط) **مُهمل** — لا تستخدمه.

## تسليم الجلسة للواجهة
بعد الخطوة 5، لا تضع الرمز في رابط إعادة التوجيه (\`?token=...\`): يبقى في سجل المتصفح ويُرسل في ترويسة Referer ويظهر في سجلات الخوادم. الأفضل: ملف تعريف ارتباط HttpOnly (كما في المثال الكامل بعد التصحيح)، أو رمز لمرة واحدة قصير جداً تستبدله الواجهة بطلب POST.

## ربط الحسابات
- اربط بالمعرّف الثابت من المزود (\`sub\` أو \`profile.id\`)، **لا بالبريد وحده**.
- إذا وُجد حساب بنفس البريد مسجل بكلمة مرور، لا تدمجهما تلقائياً إلا إذا كان البريد **موثّقاً** لدى المزود (\`email_verified\`) — وإلا يستطيع مهاجم إنشاء حساب عند مزود ببريدك وأخذ حسابك.

## Passport.js
المثال الكامل يستخدم Passport مع استراتيجيات Google و GitHub — تخفي تفاصيل الخطوات 1–4. مكتبات أحدث مثل Auth.js، أو خدمات مثل Supabase Auth و Firebase Auth، تقدم الشيء نفسه بإعداد أقل.

## تمرين
سجّل تطبيق OAuth تجريبياً في GitHub (Settings ← Developer settings)، وحدد Redirect URI محلياً، وشغّل المثال. افحص الطلبات في أدوات المطور: أين يظهر state؟ وأين يظهر code؟ ولماذا لا يظهر client_secret أبداً في المتصفح؟
`,
    },
  },
};

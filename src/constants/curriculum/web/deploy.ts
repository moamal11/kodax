/**
 * منهج web-deployment — نشر المواقع والدومينات.
 *
 * كان: 6 دروس جيدة عموماً، لكن: درس Git قوائم تعريفات بلا شرح لـ .gitignore ولا تحذير من رفع
 * الأسرار؛ لا درس لمتغيرات البيئة رغم أن كل منصة تعتمد عليها (ولا تنبيه أن متغيرات الواجهة
 * VITE_* علنية)؛ مثال Netlify Function يستدعي nodemailer.createTransporter (غير موجودة — الصحيح
 * createTransport)؛ ملف vercel.json يخلط routes مع rewrites/redirects (ترفضه Vercel) ويجمع
 * framework: nextjs مع outputDirectory: dist؛ مثال DNS بصيغة JSON فيه تعليقات # (JSON غير صالح)؛
 * صفحة 404 لـ GitHub Pages بلا lang ولا body؛ كتل DNS و Procfile موسومة كـ JavaScript.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';

const F = '```';

export const WEB_DEPLOY_PLAN: CoursePlan = {
  courseId: 'web-deployment',
  course: {
    description:
      'انشر مشاريعك على الإنترنت باحتراف: Git و GitHub، الاستضافة والدومينات و DNS، متغيرات البيئة وحماية الأسرار، GitHub Pages و Netlify و Vercel للواجهات، ونشر تطبيقات الخلفية.',
  },
  sections: [
    { title: 'الأساسيات', lessons: ['deploy-git-basics', 'deploy-1', 'deploy-env'] },
    { title: 'نشر الواجهات', lessons: ['deploy-4', 'deploy-3', 'deploy-2'] },
    { title: 'نشر الخلفية', lessons: ['deploy-5'] },
  ],
  codeFixes: {
    'deploy-3': [['nodemailer.createTransporter(', 'nodemailer.createTransport(']],
  },
  contentFixes: {
    'deploy-2': [[`${F}\nType: A`, `${F}text\nType: A`]],
    'deploy-3': [[`${F}\nA Record:`, `${F}text\nA Record:`]],
    'deploy-4': [
      [`${F}\nexample.com`, `${F}text\nexample.com`],
      [`${F}\nA Records:`, `${F}text\nA Records:`],
      ['<!DOCTYPE html>\n<html>\n<head>\n  <script>', '<!DOCTYPE html>\n<html lang="ar">\n<head>\n  <meta charset="UTF-8">\n  <title>جارٍ التحويل…</title>\n  <script>'],
      ['  </script>\n</head>\n</html>', '  </script>\n</head>\n<body></body>\n</html>'],
    ],
    'deploy-5': [[`${F}\nweb: node server.js`, `${F}text\nweb: node server.js`]],
  },
  patches: {
    'deploy-1': {
      codeExample: `{
  "domain": "example.com",
  "records": [
    { "type": "A", "name": "@", "content": "185.199.108.153", "ttl": 3600 },
    { "type": "CNAME", "name": "www", "content": "example.com", "ttl": 3600 },
    { "type": "MX", "name": "@", "content": "mail.example.com", "priority": 10, "ttl": 3600 },
    { "type": "TXT", "name": "@", "content": "v=spf1 include:_spf.example.com ~all", "ttl": 3600 }
  ]
}`,
    },
    'deploy-2': {
      language: 'json',
      codeExample: `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ],
  "redirects": [
    { "source": "/old-page", "destination": "/new-page", "permanent": true }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}`,
    },
    'deploy-git-basics': {
      description: 'Git و GitHub للنشر: حالة الملفات، commit و push، ملف .gitignore، الفروع باختصار، والقاعدة الذهبية: لا أسرار في المستودع',
      content: md`
# أساسيات Git و GitHub

كل منصات النشر الحديثة (GitHub Pages، Netlify، Vercel، Render) تنشر موقعك **مباشرة من مستودع Git**: ترفع تعديلاً ← يُبنى الموقع ويُنشر تلقائياً. لذلك Git هو الخطوة الأولى.

- **Git**: برنامج على جهازك يحفظ تاريخ مشروعك (لقطات متتالية).
- **GitHub**: موقع يستضيف نسخة من مستودعك على الإنترنت للمشاركة والنسخ الاحتياطي والنشر.

## المناطق الثلاث
\`\`\`text
مجلد العمل  ──git add──▶  منطقة التجهيز  ──git commit──▶  المستودع المحلي  ──git push──▶  GitHub
(تعديلاتك)               (ما سيدخل اللقطة)               (التاريخ)
\`\`\`

## إعداد لمرة واحدة
\`\`\`bash
git config --global user.name "اسمك"
git config --global user.email "you@example.com"
\`\`\`

## بداية مشروع وأول رفع
\`\`\`bash
cd my-site
git init
git status                 # ما الذي تغيّر؟ (استخدمه كثيراً)
git add .
git commit -m "الصفحة الرئيسية الأولى"
git branch -M main
git remote add origin https://github.com/USERNAME/my-site.git
git push -u origin main
\`\`\`
بعدها، العمل اليومي ثلاثة أوامر: \`git add .\` ثم \`git commit -m "..."\` ثم \`git push\`.

## رسائل commit جيدة
صِف **ماذا ولماذا** باختصار: "إضافة نموذج التواصل" أو "إصلاح القائمة على الجوال". تجنب "تعديلات" و "aaa" — ستحتاج هذا التاريخ عندما تبحث عن متى ظهر خطأ.

## ملف .gitignore: ما لا يُرفع أبداً
ملف نصي في جذر المشروع يسرد ما يتجاهله Git:
\`\`\`text
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
\`\`\`
- \`node_modules/\`: ضخم ويُعاد تثبيته بـ \`npm install\`.
- \`dist/\`: ناتج البناء؛ المنصة تبنيه بنفسها.
- **\`.env\`: الأسرار** (مفاتيح API، كلمات مرور قواعد البيانات).

## ⚠️ القاعدة الذهبية: لا أسرار في Git
GitHub تُفحص باستمرار بواسطة برامج آلية تبحث عن مفاتيح مسرّبة، وتستغلها خلال **دقائق** من رفعها.
- إن رفعت مفتاحاً بالخطأ، **حذفه في commit جديد لا يكفي**: يبقى في التاريخ. الحل الوحيد الآمن: **ألغِ المفتاح فوراً من لوحة الخدمة وأنشئ مفتاحاً جديداً**، ثم أزل الملف من التتبع (\`git rm --cached .env\`) وأضفه إلى .gitignore.
- المستودعات الخاصة ليست مكاناً آمناً للأسرار أيضاً.
- الطريقة الصحيحة لتمرير الأسرار: **متغيرات البيئة** (الدرس بعد التالي).

## الفروع باختصار
\`\`\`bash
git switch -c feature/contact-form   # فرع جديد لتجربة ميزة
# ... تعديلات و commits ...
git switch main
git merge feature/contact-form
\`\`\`
منصات مثل Netlify و Vercel تنشئ **رابط معاينة** لكل فرع أو Pull Request، فتجرّب التعديل على رابط حقيقي قبل دمجه في الموقع الرئيسي.

## أوامر مفيدة أخرى
| الأمر | الفائدة |
|---|---|
| \`git log --oneline\` | التاريخ مختصراً |
| \`git diff\` | ما الذي تغيّر بالضبط قبل الإضافة |
| \`git restore file.html\` | التراجع عن تعديلات ملف لم تُضف بعد |
| \`git pull\` | جلب تحديثات GitHub (عند العمل من أكثر من جهاز) |
| \`git clone URL\` | نسخ مستودع موجود |

## تمرين
أنشئ مستودعاً لصفحتك الشخصية من دورة HTML/CSS: أضف \`.gitignore\`، وارفعه إلى GitHub بثلاثة commits على الأقل برسائل واضحة. ثم أنشئ ملف \`.env\` فيه قيمة تجريبية وتأكد بـ \`git status\` أنه لا يظهر.
`,
      quiz: {
        question: 'رفعت ملف .env يحتوي مفتاح API إلى GitHub بالخطأ. ما الخطوة الأهم؟',
        options: [
          'حذف الملف في commit جديد يكفي',
          'إلغاء المفتاح فوراً من لوحة الخدمة وإنشاء مفتاح جديد، ثم إزالة الملف من التتبع وإضافته إلى .gitignore',
          'جعل المستودع خاصاً',
          'تغيير اسم الملف',
        ],
        correctAnswer: 1,
        explanation: 'المفتاح يبقى في تاريخ Git وقد يكون نُسخ آلياً خلال دقائق؛ إلغاؤه هو الحماية الوحيدة المؤكدة.',
      },
    },
  },
  newLessons: [
    {
      id: 'deploy-env',
      title: 'متغيرات البيئة وحماية الأسرار',
      description: 'ملفات .env، قراءة المتغيرات في Node و Vite، الفرق الحاسم بين متغيرات الواجهة (علنية) والخلفية (سرية)، وإعدادها على منصات النشر',
      language: 'javascript',
      xpReward: 120,
      content: md`
# متغيرات البيئة وحماية الأسرار

موقعك يحتاج إعدادات تختلف بين جهازك والإنترنت (رابط API، وضع التطوير) وأسراراً لا يجب أن يراها أحد (مفتاح قاعدة البيانات، مفتاح الدفع). **متغيرات البيئة** تفصل هذه القيم عن الكود.

## ملف .env محلياً
\`\`\`text
# .env — لا يُرفع إلى Git أبداً (موجود في .gitignore)
DATABASE_URL=postgres://user:password@localhost:5432/app
STRIPE_SECRET_KEY=sk_test_xxxxx
VITE_API_URL=http://localhost:3000
\`\`\`
وأرفق ملف \`.env.example\` **بلا قيم حقيقية** ليعرف زملاؤك ما المتغيرات المطلوبة:
\`\`\`text
DATABASE_URL=
STRIPE_SECRET_KEY=
VITE_API_URL=http://localhost:3000
\`\`\`

## القراءة في Node.js (الخلفية)
\`\`\`javascript
// Node 20.6+ يقرأ الملف بنفسه: node --env-file=.env server.js
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL غير معرّف — راجع ملف .env");
}
\`\`\`
افحص المتغيرات الإلزامية **عند بدء التشغيل**: فشل واضح فوراً أفضل من خطأ غامض لاحقاً. (في الإصدارات الأقدم تُستخدم حزمة dotenv.)

## القراءة في الواجهة (Vite)
\`\`\`javascript
const apiUrl = import.meta.env.VITE_API_URL;
\`\`\`
Vite يكشف للواجهة فقط المتغيرات التي تبدأ بـ \`VITE_\`، ويضعها **حرفياً داخل ملفات JavaScript** الناتجة عند البناء.

## ⚠️ أهم فكرة في الدرس: الواجهة لا تحفظ الأسرار
كل ما يصل إلى المتصفح **يستطيع أي زائر قراءته**: افتح أدوات المطور ← Sources وستجد قيمة \`VITE_API_URL\` مكتوبة. لذلك:
| يجوز في الواجهة (\`VITE_\`) | يجب أن يبقى في الخلفية فقط |
|---|---|
| رابط API العام | مفتاح قاعدة البيانات / كلمة مرورها |
| مفتاح Supabase العام (anon) — محمي بسياسات RLS | مفتاح Supabase الخدمي (service_role) |
| مفتاح خرائط مقيّد بنطاق موقعك | مفتاح OpenAI أو أي API مدفوع |
| مفتاح Stripe العلني \`pk_\` | مفتاح Stripe السري \`sk_\` |

تسمية متغير "سري" بـ \`VITE_\` تنشره للعالم. إن احتاجت الواجهة خدمة بمفتاح سري، فالحل **دالة خلفية** (Serverless Function) تحمل المفتاح وتستدعي الخدمة نيابة عن الواجهة — وتتحقق من المستخدم وتحدّ عدد الطلبات.

## على منصات النشر
لا ترفع .env؛ أدخل المتغيرات في لوحة المنصة:
| المنصة | المكان |
|---|---|
| Vercel | Project ← Settings ← Environment Variables |
| Netlify | Site configuration ← Environment variables |
| Render / Railway | تبويب Environment للخدمة |
| GitHub Actions | Settings ← Secrets and variables ← Actions |

- يمكن تعيين قيم مختلفة لبيئات **الإنتاج** و **المعاينة** و **التطوير**.
- بعد تغيير متغير يجب **إعادة النشر**: متغيرات الواجهة تُدمج عند البناء، وتغييرها لا يؤثر في نسخة مبنية سابقاً.

## إذا تسرب سر
1. **ألغِه فوراً** من لوحة الخدمة وأنشئ بديلاً (rotate).
2. حدّث القيمة في المنصة وأعد النشر.
3. راجع سجلات الخدمة بحثاً عن استخدام غير معتاد.
4. أزل الملف من التتبع وأضفه إلى .gitignore. حذفه من التاريخ (أدوات مثل git filter-repo) خطوة إضافية، لكنها **لا تغني** عن الإلغاء.

## تمرين
في مشروع Vite: أنشئ \`.env\` فيه \`VITE_APP_NAME\` واعرضه في الصفحة، ثم ابنِ المشروع (\`npm run build\`) وابحث عن القيمة داخل مجلد dist. أنشئ \`.env.example\`، وتحقق أن \`.env\` في \`.gitignore\`، ثم أضف المتغير في لوحة Vercel أو Netlify وأعد النشر.
`,
      codeExample: `// config.js — نقطة واحدة لقراءة الإعدادات والتحقق منها (Node.js)
// التشغيل: node --env-file=.env config.js

const REQUIRED = ["DATABASE_URL", "SESSION_SECRET"];

function loadConfig(env = process.env) {
  const missing = REQUIRED.filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(\`متغيرات بيئة ناقصة: \${missing.join(", ")}\`);
  }

  return {
    port: Number(env.PORT) || 3000,
    isProduction: env.NODE_ENV === "production",
    databaseUrl: env.DATABASE_URL,
    sessionSecret: env.SESSION_SECRET,
  };
}

// لا تطبع الأسرار أبداً في السجلات — اعرض أسماءها فقط
function describe(config) {
  return {
    port: config.port,
    isProduction: config.isProduction,
    databaseUrl: config.databaseUrl ? "[مخفي]" : "غير معرّف",
    sessionSecret: config.sessionSecret ? "[مخفي]" : "غير معرّف",
  };
}

try {
  // قيم تجريبية لعرض المثال (في الواقع تأتي من .env أو لوحة المنصة)
  const config = loadConfig({ DATABASE_URL: "postgres://demo", SESSION_SECRET: "demo-secret", PORT: "8080" });
  console.log("الإعدادات:", describe(config));
  loadConfig({ PORT: "8080" });
} catch (error) {
  console.log("❌", error.message);
}`,
      quiz: {
        question: 'وضعت مفتاح OpenAI في VITE_OPENAI_KEY واستخدمته في الواجهة. ما المشكلة؟',
        options: [
          'لا مشكلة: ملف .env غير مرفوع',
          'المتغيرات التي تبدأ بـ VITE_ تُدمج في JavaScript المرسل للمتصفح فيستطيع أي زائر قراءة المفتاح',
          'Vite لا يقرأ متغيرات تبدأ بـ VITE_',
          'المفتاح سيعمل محلياً فقط',
        ],
        correctAnswer: 1,
        explanation: 'كل ما يصل للمتصفح علني؛ المفاتيح السرية مكانها الخلفية أو دالة Serverless.',
      },
    },
  ],
};

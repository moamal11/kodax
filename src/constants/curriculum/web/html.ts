/**
 * منهج web-html-basics — أساسيات HTML.
 *
 * كان: 8 دروس بشرح من 10–15 سطراً (قوائم بأسماء الوسوم بلا شرح متى ولماذا)، بينما كتالوج
 * العملات يقول 12 درساً (الدورة لا يمكن إكمالها)؛ أمثلة صفحات عربية بـ dir="ltr" وبدون
 * <meta charset> و viewport؛ لا شرح للمسارات النسبية، ولا الوسائط (فيديو/صوت)، ولا الوصولية
 * رغم ذكرها؛ مجموعة أزرار radio بلا fieldset/legend؛ 3 دروس بلا اختبار؛ لا مشروع.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';

const RTL_PAGE = (title: string, body: string) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
</head>
<body>
${body}
</body>
</html>`;

export const WEB_HTML_PLAN: CoursePlan = {
  courseId: 'web-html-basics',
  course: {
    description:
      'ابنِ صفحات ويب صحيحة من الصفر: بنية المستند و head، النصوص والروابط والصور والمسارات، القوائم والجداول، الصوت والفيديو، النماذج والتحقق، العناصر الدلالية والوصولية — مع مشروع صفحة شخصية كاملة.',
  },
  sections: [
    { title: 'البداية', lessons: ['html-1', 'html-document'] },
    { title: 'المحتوى', lessons: ['html-2', 'html-3', 'html-4', 'html-5', 'html-media'] },
    { title: 'النماذج', lessons: ['html-6', 'html-7'] },
    { title: 'البنية والوصولية', lessons: ['html-8', 'html-a11y'] },
    { title: 'المشروع', lessons: ['html-project'] },
  ],
  patches: {
    'html-1': {
      description: 'ما هو HTML، كيف يعرض المتصفح الصفحة، والفرق بين الوسم والعنصر والخاصية',
      content: md`
# ما هو HTML؟

كل صفحة ويب تراها مبنية من ثلاث طبقات:
| اللغة | الدور | تشبيه |
|---|---|---|
| **HTML** | الهيكل والمحتوى: عناوين، فقرات، صور، روابط | هيكل البيت وجدرانه |
| **CSS** | الشكل: ألوان، خطوط، تخطيط | الطلاء والأثاث |
| **JavaScript** | السلوك والتفاعل | الكهرباء والأجهزة |

HTML اختصار **HyperText Markup Language**: لغة **ترميز** وليست لغة برمجة — لا متغيرات ولا شروط ولا حلقات. أنت "تُعلِّم" أجزاء المحتوى لتقول للمتصفح: هذا عنوان، هذه قائمة، هذا رابط.

## الوسم والعنصر والخاصية
\`\`\`html
<a href="https://kodax.app">موقع Kodax</a>
\`\`\`
- \`<a>\` **وسم الفتح** و \`</a>\` **وسم الإغلاق** (لاحظ الشرطة /).
- \`href="..."\` **خاصية** (attribute): معلومة إضافية بصيغة \`اسم="قيمة"\` داخل وسم الفتح.
- **العنصر** = وسم الفتح + المحتوى + وسم الإغلاق.

بعض العناصر **فارغة** بلا محتوى ولا وسم إغلاق: \`<img>\`، \`<br>\`، \`<input>\`، \`<meta>\`.

## التداخل (Nesting)
العناصر توضع داخل بعضها، ويجب أن تُغلق بالترتيب العكسي:
\`\`\`html
<p>هذا نص <strong>مهم جداً</strong> في فقرة.</p>
\`\`\`
❌ الخطأ الشائع: \`<p><strong>نص</p></strong>\` — المتصفح سيحاول "إصلاحه" بطريقته وقد تحصل على نتيجة غير متوقعة.

## أول صفحة كاملة
\`\`\`html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>صفحتي الأولى</title>
</head>
<body>
    <h1>مرحباً بالعالم!</h1>
    <p>هذه أول صفحة HTML لي.</p>
</body>
</html>
\`\`\`
- \`<!DOCTYPE html>\`: يخبر المتصفح أن هذه صفحة HTML5 حديثة.
- \`<html lang="ar" dir="rtl">\`: الجذر، واللغة عربية، والاتجاه من اليمين لليسار.
- \`<head>\`: معلومات عن الصفحة لا تظهر في محتواها (الدرس التالي).
- \`<body>\`: كل ما يظهر للزائر.

## كيف تجرّب؟
1. افتح محرر نصوص (VS Code مثلاً) واحفظ الملف باسم \`index.html\`.
2. افتح الملف في المتصفح (نقر مزدوج).
3. عدّل واحفظ ثم حدّث الصفحة (F5).

أداة مهمة: انقر بالزر الأيمن على أي صفحة ← **Inspect / فحص** لترى عناصر HTML الخاصة بها. هكذا تتعلم من مواقع حقيقية.

## المتصفح متسامح — لا تعتمد على ذلك
المتصفح لا يعرض أخطاء: إذا نسيت إغلاق وسم سيخمّن. هذا يخفي الأخطاء بدل إظهارها. تحقق من صفحاتك بالمدقق الرسمي **validator.w3.org**.

## تمرين
أنشئ \`index.html\` فيها عنوان باسمك، وفقرة عن نفسك تحتوي كلمة مهمة داخل \`<strong>\`، ورابطاً لموقعك المفضل. افتحها بالمتصفح ثم افحصها بـ Inspect.
`,
      codeExample: RTL_PAGE('صفحتي الأولى', `    <h1>مرحباً بالعالم!</h1>
    <p>هذه أول صفحة HTML لي، وأنا أتعلم <strong>بناء المواقع</strong> مع Kodax.</p>
    <p>زر <a href="https://developer.mozilla.org/ar/">مرجع MDN</a> لتتعلم المزيد.</p>`),
      quiz: {
        question: 'في السطر <a href="https://kodax.app">Kodax</a>، ما هو href؟',
        options: ['وسم', 'خاصية (attribute)', 'عنصر فارغ', 'تعليق'],
        correctAnswer: 1,
        explanation: 'الخاصية معلومة إضافية بصيغة اسم="قيمة" داخل وسم الفتح؛ href تحدد عنوان الرابط.',
      },
    },
    'html-2': {
      title: 'العناوين والفقرات وتنسيق النص',
      description: 'هيكلة النص بالعناوين h1–h6 والفقرات، والعناصر النصية: strong و em و br و blockquote و code و pre',
      content: md`
# العناوين والفقرات وتنسيق النص

## العناوين h1 إلى h6
العناوين تبني **مخطط** الصفحة مثل فهرس كتاب:
\`\`\`html
<h1>دليل الطبخ</h1>
<h2>المقبلات</h2>
<h3>الحمص</h3>
<h3>المتبل</h3>
<h2>الأطباق الرئيسية</h2>
\`\`\`
قواعد مهمة:
- **\`<h1>\` واحد** يصف موضوع الصفحة.
- **لا تقفز مستويات**: بعد h2 يأتي h3 لا h5. قارئات الشاشة يستخدمها المكفوفون للتنقل بين العناوين، ومحركات البحث تفهم الصفحة منها.
- **لا تستخدم العنوان لتكبير الخط**. الحجم من مسؤولية CSS؛ العنوان يعني "هذا عنوان قسم".

## الفقرات والمسافات
\`\`\`html
<p>هذه فقرة.     المسافات   المتعددة
تُختصر إلى مسافة واحدة، وكذلك أسطر الكود الجديدة.</p>
<p>سطر أول<br>سطر ثانٍ في نفس الفقرة</p>
\`\`\`
- المتصفح **يختصر** المسافات والأسطر الجديدة إلى مسافة واحدة.
- \`<br>\` سطر جديد داخل نفس الفقرة (عنوان بريدي، أبيات شعر). لا تستخدمه لإضافة مسافات بين الفقرات — هذا عمل CSS.
- \`<hr>\` فاصل موضوعي بين أجزاء المحتوى.

## التأكيد: strong و em
\`\`\`html
<p><strong>تحذير:</strong> لا تشارك كلمة المرور.</p>
<p>أنا <em>حقاً</em> أحب البرمجة.</p>
\`\`\`
| العنصر | المعنى | المظهر الافتراضي |
|---|---|---|
| \`<strong>\` | أهمية قوية | عريض |
| \`<em>\` | تشديد في النطق | مائل |
| \`<b>\` / \`<i>\` | مظهر فقط بلا معنى إضافي | عريض / مائل |
| \`<mark>\` | نص مميّز (كالقلم الفسفوري) | خلفية صفراء |
| \`<small>\` | ملاحظة جانبية (حقوق، شروط) | خط أصغر |

اختر العنصر حسب **المعنى**، لا حسب الشكل.

## الاقتباس والكود
\`\`\`html
<blockquote cite="https://example.com/source">
    <p>البساطة هي أقصى درجات التطور.</p>
</blockquote>
<p>اكتب الأمر <code>git status</code> في الطرفية.</p>
<pre><code>function hello() {
    console.log("مرحباً");
}</code></pre>
\`\`\`
- \`<blockquote>\` اقتباس كتلة، و \`<q>\` اقتباس قصير داخل السطر.
- \`<code>\` كود داخل السطر.
- \`<pre>\` يحافظ على المسافات والأسطر كما هي — مثالي لعرض الكود.

## الرموز الخاصة (Entities)
لعرض \`<\` كنص وليس بداية وسم: \`&lt;\`. وكذلك \`&gt;\` لـ >، و \`&amp;\` لـ &، و \`&copy;\` لـ ©، و \`&nbsp;\` لمسافة لا تنكسر.

## التعليقات
\`<!-- هذا تعليق لا يظهر في الصفحة -->\` — لكنه **يظهر** لأي شخص يفتح "عرض المصدر"، فلا تضع فيه معلومات سرية.

## تمرين
اكتب صفحة "وصفة" بعنوان h1 لاسم الطبق، وh2 لـ"المكونات" و"الطريقة"، مع ملاحظة مهمة بـ strong، وتعليق HTML يذكر مصدر الوصفة. تحقق أن مستويات العناوين متسلسلة.
`,
      codeExample: RTL_PAGE('وصفة الحمص', `    <h1>وصفة الحمص</h1>
    <p>طبق شامي <em>سهل</em> ولذيذ، يكفي <strong>4 أشخاص</strong>.</p>

    <h2>المكونات</h2>
    <p>كوب حمص مسلوق<br>ربع كوب طحينة<br>عصير ليمونة</p>

    <h2>الطريقة</h2>
    <p>اخلط المكونات حتى يصبح القوام ناعماً.</p>
    <p><strong>ملاحظة:</strong> أضف الماء البارد تدريجياً.</p>

    <hr>
    <blockquote>
        <p>الطبخ فن، والمكونات الجيدة نصف النجاح.</p>
    </blockquote>
    <!-- المصدر: مطبخ العائلة -->
    <p><small>&copy; 2026 مطبخ Kodax</small></p>`),
      quiz: {
        question: 'لماذا لا نستخدم <h3> فقط لأننا نريد خطاً أكبر؟',
        options: [
          'لأن h3 غير مدعوم',
          'لأن العناوين تحدد هيكل المحتوى وتعتمد عليها قارئات الشاشة ومحركات البحث، والحجم مسؤولية CSS',
          'لأن h3 أصغر من p',
          'لا مانع من ذلك',
        ],
        correctAnswer: 1,
        explanation: 'HTML للمعنى والهيكل؛ استخدام العنوان للشكل يكسر مخطط الصفحة.',
      },
    },
    'html-3': {
      description: 'الروابط: المسارات المطلقة والنسبية، الروابط الداخلية بـ #، mailto و tel؛ والصور: alt والأبعاد و loading="lazy" و figure',
      content: md`
# الروابط والصور

## الرابط \`<a>\`
\`\`\`html
<a href="https://developer.mozilla.org">مرجع MDN</a>
\`\`\`
نص الرابط يجب أن يصف **وجهته**: "مرجع MDN" أوضح من "اضغط هنا"، خاصة لمستخدمي قارئات الشاشة الذين يتصفحون قائمة الروابط فقط.

## المسارات: مطلقة ونسبية
افترض هذا الهيكل:
\`\`\`text
my-site/
├── index.html
├── about.html
├── images/
│   └── logo.png
└── blog/
    └── post.html
\`\`\`
| من الملف | إلى | المسار |
|---|---|---|
| index.html | about.html | \`about.html\` |
| index.html | logo.png | \`images/logo.png\` |
| blog/post.html | index.html | \`../index.html\` (\`..\` = المجلد الأعلى) |
| أي صفحة | جذر الموقع | \`/about.html\` (يبدأ بـ / من جذر النطاق) |
| موقع آخر | — | \`https://...\` (مسار مطلق) |

⚠️ المسار الذي يبدأ بـ \`/\` يعمل على خادم حقيقي لكنه **لا يعمل** عند فتح الملف مباشرة من القرص (\`file://\`). أثناء التعلم استخدم المسارات النسبية.
⚠️ الخوادم غالباً **حساسة لحالة الأحرف**: \`Logo.png\` ليس \`logo.png\`.

## أنواع روابط أخرى
\`\`\`html
<a href="#contact">انتقل لقسم التواصل</a>       <!-- رابط داخل الصفحة -->
<h2 id="contact">تواصل معنا</h2>

<a href="mailto:hello@example.com">راسلنا</a>
<a href="tel:+9647700000000">اتصل بنا</a>
<a href="files/cv.pdf" download>تحميل السيرة الذاتية</a>
\`\`\`

## الفتح في تبويب جديد
\`\`\`html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">مثال (تبويب جديد)</a>
\`\`\`
\`rel="noopener"\` يمنع الصفحة الجديدة من التحكم في صفحتك (المتصفحات الحديثة تفعله تلقائياً لكن كتابته أوضح وأأمن للمتصفحات القديمة). لا تفتح كل الروابط في تبويب جديد؛ دع المستخدم يقرر.

## الصورة \`<img>\`
\`\`\`html
<img src="images/baghdad.jpg" alt="نهر دجلة في بغداد وقت الغروب" width="800" height="533" loading="lazy">
\`\`\`
| الخاصية | لماذا |
|---|---|
| \`src\` | مسار الصورة |
| \`alt\` | **إلزامية**: وصف للصورة لمن لا يراها (قارئ الشاشة، فشل التحميل، محركات البحث) |
| \`width\` / \`height\` | يحجز المتصفح المساحة قبل التحميل فلا "تقفز" الصفحة |
| \`loading="lazy"\` | لا تُحمّل الصورة حتى يقترب المستخدم منها — صفحة أسرع |

### كيف تكتب alt جيداً؟
- صِف ما **يهم** في سياق الصفحة، لا "صورة" أو اسم الملف.
- صورة زخرفية بلا معنى: \`alt=""\` (فارغة لكن موجودة) فيتجاهلها قارئ الشاشة.
- صورة داخل رابط: alt يصف **وجهة الرابط** ("الصفحة الرئيسية لـ Kodax").

### الصيغ
| الصيغة | الاستخدام |
|---|---|
| JPG | الصور الفوتوغرافية |
| PNG | صور بشفافية أو حواف حادة |
| SVG | الشعارات والأيقونات (متجهة، لا تفقد الجودة) |
| WebP / AVIF | صيغ حديثة بحجم أصغر بكثير |

## الصورة مع تعليق
\`\`\`html
<figure>
    <img src="images/chart.png" alt="نمو المستخدمين من 100 إلى 5000 خلال 2025" width="600" height="400">
    <figcaption>شكل 1: نمو المستخدمين خلال 2025</figcaption>
</figure>
\`\`\`

## تمرين
أنشئ مجلداً فيه \`index.html\` و \`about.html\` ومجلد \`images\`. اربط الصفحتين ببعضهما بمسارات نسبية، وأضف صورة بـ alt وصفي وأبعاد، ورابطاً داخلياً يقفز لأسفل الصفحة.
`,
      codeExample: RTL_PAGE('الروابط والصور', `    <h1 id="top">مدن عراقية</h1>
    <nav>
        <a href="#baghdad">بغداد</a> |
        <a href="#basra">البصرة</a>
    </nav>

    <h2 id="baghdad">بغداد</h2>
    <figure>
        <img src="images/baghdad.jpg" alt="نهر دجلة في بغداد وقت الغروب" width="600" height="400" loading="lazy">
        <figcaption>نهر دجلة وسط بغداد</figcaption>
    </figure>

    <h2 id="basra">البصرة</h2>
    <p>اقرأ المزيد في <a href="https://ar.wikipedia.org/wiki/البصرة" target="_blank" rel="noopener noreferrer">ويكيبيديا</a>.</p>

    <p><a href="mailto:hello@example.com">راسلنا</a> أو <a href="#top">العودة للأعلى</a></p>`),
      quiz: {
        question: 'أنت في الملف blog/post.html وتريد ربط index.html الموجود في المجلد الأعلى. ما المسار الصحيح؟',
        options: ['index.html', '../index.html', 'blog/index.html', './blog/index.html'],
        correctAnswer: 1,
        explanation: '.. تعني المجلد الأعلى، فيصبح المسار ../index.html.',
      },
    },
    'html-4': {
      description: 'القوائم غير المرتبة والمرتبة والوصفية، خيارات ol، القوائم المتداخلة، ومتى تكون القائمة هي العنصر الصحيح',
      content: md`
# القوائم

القوائم من أكثر العناصر استخداماً: قوائم التنقل، الخطوات، المميزات، نتائج البحث. القائمة تخبر المتصفح وقارئ الشاشة بعدد العناصر ("قائمة من 5 عناصر") وهذا يساعد التنقل.

## القائمة غير المرتبة \`<ul>\`
عندما لا يهم الترتيب:
\`\`\`html
<ul>
    <li>دعم اللغة العربية</li>
    <li>دروس تفاعلية</li>
    <li>تحديات برمجية</li>
</ul>
\`\`\`

## القائمة المرتبة \`<ol>\`
عندما يهم الترتيب (خطوات، ترتيب فائزين):
\`\`\`html
<ol>
    <li>ثبّت المحرر</li>
    <li>أنشئ ملف index.html</li>
    <li>افتحه في المتصفح</li>
</ol>
\`\`\`
خيارات مفيدة:
| الخاصية | المثال | النتيجة |
|---|---|---|
| \`start\` | \`<ol start="4">\` | يبدأ العد من 4 |
| \`reversed\` | \`<ol reversed>\` | عدّ تنازلي (أفضل 10) |
| \`type\` | \`<ol type="a">\` | a, b, c (أو i, I, A) |

## القائمة الوصفية \`<dl>\`
لأزواج "مصطلح ← تعريف": قاموس، أسئلة شائعة، مواصفات منتج:
\`\`\`html
<dl>
    <dt>HTML</dt>
    <dd>لغة ترميز لهيكل صفحات الويب.</dd>
    <dt>CSS</dt>
    <dd>لغة لتنسيق مظهر الصفحات.</dd>
</dl>
\`\`\`

## القواعد
- العناصر المباشرة داخل \`<ul>\` و \`<ol>\` يجب أن تكون \`<li>\` فقط.
- القائمة المتداخلة توضع **داخل** \`<li>\`، لا بين عنصرين:

\`\`\`html
<ul>
    <li>الواجهة الأمامية
        <ul>
            <li>HTML</li>
            <li>CSS</li>
        </ul>
    </li>
    <li>الواجهة الخلفية</li>
</ul>
\`\`\`
❌ خطأ شائع: وضع \`<ul>\` مباشرة بعد \`</li>\` كعنصر شقيق.

## قوائم التنقل
قائمة روابط الموقع هي قائمة فعلاً، والعرف أن تُكتب هكذا (وCSS يجعلها أفقية لاحقاً):
\`\`\`html
<nav>
    <ul>
        <li><a href="index.html">الرئيسية</a></li>
        <li><a href="courses.html">الدورات</a></li>
        <li><a href="contact.html">تواصل</a></li>
    </ul>
</nav>
\`\`\`

## الشكل من CSS
النقاط والأرقام يمكن تغييرها أو إخفاؤها بـ CSS (\`list-style\`). لا تتجنب القائمة لأنك لا تريد نقاطاً، ولا تكتب أرقاماً يدوياً داخل \`<li>\`.

## تمرين
اكتب صفحة "خطة تعلم" فيها: قائمة مرتبة بالمراحل الثلاث (HTML، CSS، JavaScript)، وتحت كل مرحلة قائمة غير مرتبة بالمواضيع، وفي النهاية قائمة وصفية بثلاثة مصطلحات.
`,
      codeExample: RTL_PAGE('خطة التعلم', `    <h1>خطة تعلم تطوير الويب</h1>
    <ol>
        <li>HTML
            <ul>
                <li>بنية الصفحة</li>
                <li>النماذج</li>
            </ul>
        </li>
        <li>CSS
            <ul>
                <li>Flexbox</li>
                <li>Grid</li>
            </ul>
        </li>
        <li>JavaScript</li>
    </ol>

    <h2>أفضل 3 مشاريع للمبتدئ</h2>
    <ol reversed>
        <li>صفحة شخصية</li>
        <li>صفحة هبوط</li>
        <li>تطبيق مهام</li>
    </ol>

    <h2>مصطلحات</h2>
    <dl>
        <dt>المتصفح</dt>
        <dd>برنامج يقرأ HTML ويعرضه كصفحة.</dd>
        <dt>الخادم</dt>
        <dd>جهاز يرسل ملفات الموقع عند طلبها.</dd>
    </dl>`),
    },
    'html-5': {
      description: 'الجداول للبيانات الجدولية: thead و tbody و tfoot، caption، th مع scope للوصولية، ودمج الخلايا — ولماذا لا تُستخدم للتخطيط',
      content: md`
# الجداول

الجدول لعرض **بيانات جدولية**: صفوف وأعمدة لها معنى (جدول درجات، أسعار، مواعيد). كان يُستخدم قديماً لتخطيط الصفحات — هذا خطأ اليوم: يضر الوصولية والتجاوب. التخطيط من مسؤولية CSS (Flexbox و Grid).

## البنية
\`\`\`html
<table>
    <caption>درجات الفصل الأول</caption>
    <thead>
        <tr>
            <th scope="col">الطالب</th>
            <th scope="col">الرياضيات</th>
            <th scope="col">العلوم</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">سارة</th>
            <td>95</td>
            <td>88</td>
        </tr>
        <tr>
            <th scope="row">عمر</th>
            <td>78</td>
            <td>91</td>
        </tr>
    </tbody>
</table>
\`\`\`
| العنصر | الدور |
|---|---|
| \`<table>\` | الجدول |
| \`<caption>\` | عنوان الجدول (أول عنصر داخله) |
| \`<thead>\` / \`<tbody>\` / \`<tfoot>\` | الرأس / الجسم / الذيل (للمجاميع) |
| \`<tr>\` | صف |
| \`<th>\` | خلية **عنوان** |
| \`<td>\` | خلية بيانات |

## لماذا th و scope؟
قارئ الشاشة يقرأ الخلية "88" مع عناوينها: "عمر، العلوم، 88". بدون \`<th>\` يسمع المستخدم أرقاماً بلا سياق. \`scope="col"\` تعني أن العنوان لعمود، و \`scope="row"\` لصف.

## دمج الخلايا
\`\`\`html
<table>
    <caption>جدول الأسبوع</caption>
    <thead>
        <tr>
            <th scope="col">اليوم</th>
            <th scope="col" colspan="2">الحصص</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row" rowspan="2">الأحد</th>
            <td>HTML</td>
            <td>CSS</td>
        </tr>
        <tr>
            <td colspan="2">مشروع عملي</td>
        </tr>
    </tbody>
</table>
\`\`\`
- \`colspan="2"\` الخلية تمتد عمودين.
- \`rowspan="2"\` الخلية تمتد صفين — فالصف التالي يحتوي خلايا أقل.
استخدم الدمج باعتدال؛ الجداول المعقدة صعبة على قارئات الشاشة. أحياناً جدولان بسيطان أفضل من جدول واحد معقد.

## الذيل للمجاميع
\`\`\`html
<table>
    <caption>فاتورة</caption>
    <thead><tr><th scope="col">المنتج</th><th scope="col">السعر</th></tr></thead>
    <tbody>
        <tr><td>كتاب</td><td>15,000</td></tr>
        <tr><td>دفتر</td><td>3,000</td></tr>
    </tbody>
    <tfoot>
        <tr><th scope="row">المجموع</th><td>18,000</td></tr>
    </tfoot>
</table>
\`\`\`

## الشكل
الجدول الافتراضي بلا حدود. الحدود والألوان والمسافات من CSS (\`border\`، \`border-collapse\`، \`padding\`). لا تستخدم الخاصية القديمة \`border="1"\` في الكود الجديد.

## الجداول على الجوال
الجداول العريضة تتجاوز الشاشة. الحل الشائع: وضع الجدول داخل عنصر يسمح بالتمرير الأفقي بـ CSS (\`overflow-x: auto\`).

## تمرين
أنشئ جدول "مصاريف الشهر" بـ caption، وأعمدة (البند، التصنيف، المبلغ)، وخمسة صفوف، وذيل \`<tfoot>\` بالمجموع. استخدم \`th\` مع scope المناسب.
`,
      codeExample: RTL_PAGE('جدول الدرجات', `    <table>
        <caption>درجات الفصل الأول</caption>
        <thead>
            <tr>
                <th scope="col">الطالب</th>
                <th scope="col">الرياضيات</th>
                <th scope="col">العلوم</th>
                <th scope="col">المعدل</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th scope="row">سارة</th>
                <td>95</td>
                <td>88</td>
                <td>91.5</td>
            </tr>
            <tr>
                <th scope="row">عمر</th>
                <td>78</td>
                <td>91</td>
                <td>84.5</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <th scope="row">معدل الصف</th>
                <td>86.5</td>
                <td>89.5</td>
                <td>88</td>
            </tr>
        </tfoot>
    </table>`),
      quiz: {
        question: 'ما فائدة استخدام <th scope="col"> بدلاً من <td> لعناوين الأعمدة؟',
        options: [
          'تجعل الخط أكبر فقط',
          'تربط كل خلية بعنوانها فتقرأها قارئات الشاشة مع سياقها',
          'تضيف حدوداً للجدول',
          'لا فرق',
        ],
        correctAnswer: 1,
        explanation: 'th مع scope يحدد العلاقة بين العناوين والبيانات، وهذا أساس وصولية الجداول.',
      },
    },
    'html-6': {
      description: 'أساس النماذج: form و action و method (GET مقابل POST)، label و name، أنواع input الأساسية، textarea، أنواع الأزرار، والتحقق المدمج',
      content: md`
# النماذج — الجزء الأول

النماذج هي طريقة جمع البيانات من المستخدم: تسجيل الدخول، البحث، التواصل، الطلب.

## عنصر form
\`\`\`html
<form action="/search" method="get">
    <label for="q">ابحث:</label>
    <input type="search" id="q" name="q">
    <button type="submit">بحث</button>
</form>
\`\`\`
- \`action\`: العنوان الذي تُرسل إليه البيانات.
- \`method\`: طريقة الإرسال.

| | GET | POST |
|---|---|---|
| مكان البيانات | في الرابط: \`/search?q=html\` | في جسم الطلب |
| مناسب لـ | البحث والفلترة (رابط يمكن حفظه ومشاركته) | إنشاء أو تعديل بيانات، تسجيل الدخول |
| كلمات المرور | ❌ أبداً (تظهر في السجل والرابط) | ✅ |

**HTML وحده لا يعالج البيانات**: يرسلها فقط. المعالجة على الخادم (Node.js، Python...) أو بـ JavaScript.

## name و label
\`\`\`html
<label for="email">البريد الإلكتروني</label>
<input type="email" id="email" name="email">
\`\`\`
- **\`name\`** هو اسم الحقل عند الإرسال (\`email=...\`). حقل بلا name **لا يُرسل**!
- **\`<label>\`** مرتبط بالحقل عبر \`for\` = \`id\`. فوائده: النقر على النص يركّز على الحقل (هدف أكبر على الجوال)، وقارئ الشاشة ينطق اسم الحقل.
- \`placeholder\` **ليس بديلاً** عن label: يختفي عند الكتابة، ولونه باهت.

## أنواع input الأساسية
| النوع | الاستخدام | ميزة |
|---|---|---|
| \`text\` | نص عام | — |
| \`email\` | بريد | يتحقق من الصيغة، ولوحة مفاتيح فيها @ على الجوال |
| \`password\` | كلمة مرور | يخفي الأحرف |
| \`number\` | أرقام للعمليات (كمية) | \`min\` \`max\` \`step\` |
| \`tel\` | هاتف | لوحة أرقام على الجوال (بلا تحقق صيغة) |
| \`url\` | رابط | يتحقق من الصيغة |
| \`search\` | بحث | زر مسح |

لا تستخدم \`number\` لأرقام الهواتف أو البطاقات (ليست كميات، والأصفار البادئة تضيع).

## textarea
نص متعدد الأسطر:
\`\`\`html
<label for="msg">رسالتك</label>
<textarea id="msg" name="message" rows="5"></textarea>
\`\`\`

## الأزرار
| النوع | السلوك |
|---|---|
| \`<button type="submit">\` | يرسل النموذج (الافتراضي داخل form!) |
| \`<button type="button">\` | لا يفعل شيئاً — لـ JavaScript |
| \`<button type="reset">\` | يعيد الحقول لقيمها الأولى (نادراً ما يفيد المستخدم) |

اكتب \`type\` دائماً؛ زر بلا type داخل form يرسله، وهذا مصدر أخطاء شائع.

## التحقق المدمج
\`\`\`html
<input type="text" name="username" required minlength="3" maxlength="20" pattern="[a-z0-9_]+">
<input type="number" name="age" min="13" max="120">
\`\`\`
| الخاصية | المعنى |
|---|---|
| \`required\` | إلزامي |
| \`minlength\` / \`maxlength\` | طول النص |
| \`min\` / \`max\` / \`step\` | للأرقام والتواريخ |
| \`pattern\` | تعبير نمطي (regex) يجب أن يطابقه النص |

المتصفح يمنع الإرسال ويعرض رسالة. ⚠️ لكن **التحقق في المتصفح للراحة فقط**: أي شخص يستطيع تجاوزه. التحقق الحقيقي يجب أن يكون **على الخادم** دائماً.

## autocomplete
\`autocomplete="email"\` أو \`"name"\` أو \`"current-password"\` أو \`"new-password"\` تساعد المتصفح ومدير كلمات المرور على الملء الصحيح.

## تمرين
أنشئ نموذج "تسجيل حساب": اسم المستخدم (إلزامي، 3–20 حرفاً)، البريد، كلمة المرور (8 أحرف على الأقل، autocomplete="new-password")، العمر (13 فأكثر)، وزر إرسال. جرّب الإرسال بحقول ناقصة وشاهد رسائل المتصفح.
`,
      codeExample: RTL_PAGE('تسجيل حساب', `    <h1>إنشاء حساب</h1>
    <form action="/register" method="post">
        <p>
            <label for="username">اسم المستخدم</label>
            <input type="text" id="username" name="username" required minlength="3" maxlength="20" autocomplete="username">
        </p>
        <p>
            <label for="email">البريد الإلكتروني</label>
            <input type="email" id="email" name="email" required autocomplete="email">
        </p>
        <p>
            <label for="password">كلمة المرور</label>
            <input type="password" id="password" name="password" required minlength="8" autocomplete="new-password">
        </p>
        <p>
            <label for="age">العمر</label>
            <input type="number" id="age" name="age" min="13" max="120">
        </p>
        <p>
            <label for="bio">نبذة عنك</label>
            <textarea id="bio" name="bio" rows="4"></textarea>
        </p>
        <button type="submit">إنشاء الحساب</button>
    </form>`),
      quiz: {
        question: 'حقل input بدون الخاصية name داخل نموذج — ماذا يحدث عند الإرسال؟',
        options: ['يُرسل باسم id', 'لا تُرسل قيمته', 'يُرسل باسم "input"', 'يظهر خطأ'],
        correctAnswer: 1,
        explanation: 'name هو مفتاح الحقل في البيانات المرسلة؛ بدونه يتجاهل المتصفح الحقل.',
      },
    },
    'html-7': {
      description: 'خيارات المستخدم: checkbox و radio مع fieldset و legend، select و optgroup، datalist، التاريخ والملفات والألوان والمدى',
      content: md`
# النماذج — الجزء الثاني

## مربعات الاختيار (checkbox)
لخيارات **مستقلة**، يمكن تحديد أي عدد منها:
\`\`\`html
<fieldset>
    <legend>المواضيع التي تهمك</legend>
    <label><input type="checkbox" name="topics" value="web"> تطوير الويب</label>
    <label><input type="checkbox" name="topics" value="ai" checked> الذكاء الاصطناعي</label>
    <label><input type="checkbox" name="topics" value="security"> الأمن السيبراني</label>
</fieldset>
\`\`\`
- \`value\` هو ما يُرسل (بدونه يُرسل "on").
- \`checked\` محدد مسبقاً.
- المربع غير المحدد **لا يُرسل** إطلاقاً.

## أزرار الراديو (radio)
لاختيار **واحد فقط** من مجموعة. ما يجعلها مجموعة هو **نفس name**:
\`\`\`html
<fieldset>
    <legend>مستوى خبرتك</legend>
    <label><input type="radio" name="level" value="beginner" required> مبتدئ</label>
    <label><input type="radio" name="level" value="intermediate"> متوسط</label>
    <label><input type="radio" name="level" value="advanced"> متقدم</label>
</fieldset>
\`\`\`
- اختلاف name بالخطأ يجعل كل زر مستقلاً ويمكن تحديدها كلها.
- \`required\` على زر واحد من المجموعة يكفي.

## fieldset و legend
يجمعان الحقول المترابطة، و \`<legend>\` هو **سؤال** المجموعة. بدونهما يسمع مستخدم قارئ الشاشة "مبتدئ، زر اختيار" دون أن يعرف ما السؤال. استخدمهما دائماً مع مجموعات radio و checkbox.

ربط آخر للـ label: وضع الحقل **داخل** \`<label>\` (كما أعلاه) يغني عن for و id.

## القائمة المنسدلة (select)
\`\`\`html
<label for="city">المدينة</label>
<select id="city" name="city" required>
    <option value="">— اختر —</option>
    <optgroup label="الوسط">
        <option value="baghdad">بغداد</option>
        <option value="karbala">كربلاء</option>
    </optgroup>
    <optgroup label="الجنوب">
        <option value="basra" selected>البصرة</option>
    </optgroup>
</select>
\`\`\`
- خيار أول قيمته فارغة مع \`required\` يجبر المستخدم على الاختيار.
- \`multiple\` يسمح بعدة اختيارات (لكن تجربة استخدامه سيئة؛ checkboxes أوضح غالباً).

**radio أم select؟** خيارات قليلة (2–5) ← radio (كلها ظاهرة). خيارات كثيرة ← select.

## datalist: اقتراحات مع حرية الكتابة
\`\`\`html
<label for="lang">لغتك المفضلة</label>
<input type="text" id="lang" name="lang" list="langs">
<datalist id="langs">
    <option value="Python"></option>
    <option value="JavaScript"></option>
    <option value="C++"></option>
</datalist>
\`\`\`

## أنواع خاصة
| النوع | الاستخدام |
|---|---|
| \`date\` / \`time\` / \`datetime-local\` | منتقي تاريخ ووقت من المتصفح |
| \`file\` | رفع ملف: \`accept="image/*"\`، و \`multiple\` لعدة ملفات |
| \`range\` | شريط تمرير بقيمة تقريبية (\`min\` \`max\` \`step\`) |
| \`color\` | منتقي لون |
| \`hidden\` | قيمة تُرسل ولا تظهر (لا تضع فيها أسراراً: تظهر في المصدر) |

⚠️ رفع الملفات يتطلب أن يكون النموذج: \`method="post"\` و \`enctype="multipart/form-data"\`، وإلا يُرسل اسم الملف فقط.

## disabled مقابل readonly
- \`readonly\`: لا يمكن التعديل لكن القيمة **تُرسل**.
- \`disabled\`: لا يمكن التفاعل والقيمة **لا تُرسل**.

## تمرين
أنشئ نموذج "التسجيل في دورة": اختيار الدورة (select بمجموعات)، مستوى الخبرة (radio في fieldset)، أيام الحضور (checkboxes)، تاريخ البدء، ورفع صورة شخصية. تحقق من enctype.
`,
      codeExample: RTL_PAGE('التسجيل في دورة', `    <h1>التسجيل في دورة</h1>
    <form action="/enroll" method="post" enctype="multipart/form-data">
        <p>
            <label for="course">الدورة</label>
            <select id="course" name="course" required>
                <option value="">— اختر دورة —</option>
                <optgroup label="الويب">
                    <option value="html">أساسيات HTML</option>
                    <option value="css">تصميم CSS</option>
                </optgroup>
                <optgroup label="البرمجة">
                    <option value="python">Python</option>
                </optgroup>
            </select>
        </p>

        <fieldset>
            <legend>مستوى خبرتك</legend>
            <label><input type="radio" name="level" value="beginner" required> مبتدئ</label>
            <label><input type="radio" name="level" value="intermediate"> متوسط</label>
        </fieldset>

        <fieldset>
            <legend>أيام الحضور</legend>
            <label><input type="checkbox" name="days" value="sun"> الأحد</label>
            <label><input type="checkbox" name="days" value="tue"> الثلاثاء</label>
            <label><input type="checkbox" name="days" value="thu"> الخميس</label>
        </fieldset>

        <p>
            <label for="start">تاريخ البدء</label>
            <input type="date" id="start" name="start">
        </p>
        <p>
            <label for="photo">صورة شخصية</label>
            <input type="file" id="photo" name="photo" accept="image/*">
        </p>
        <button type="submit">تسجيل</button>
    </form>`),
      quiz: {
        question: 'ما الذي يجعل مجموعة أزرار radio تسمح باختيار واحد فقط؟',
        options: ['وضعها داخل fieldset', 'أن يكون لها نفس قيمة name', 'أن يكون لها نفس value', 'الخاصية single'],
        correctAnswer: 1,
        explanation: 'الأزرار التي تشترك في نفس name تُعامل كمجموعة واحدة؛ fieldset للتجميع والوصولية فقط.',
      },
    },
    'html-8': {
      description: 'العناصر الدلالية: header و nav و main و article و section و aside و footer — ومتى تستخدم div و span',
      content: md`
# العناصر الدلالية (Semantic HTML)

قارن بين هذين:
\`\`\`html
<div class="top"><div class="menu">...</div></div>
<div class="content">...</div>
\`\`\`
\`\`\`html
<header><nav>...</nav></header>
<main>...</main>
\`\`\`
الشكل قد يكون متطابقاً، لكن الثاني **يقول ما هو كل جزء**. هذا مهم لـ:
- **قارئات الشاشة**: تعرض "المناطق" (landmarks) ويقفز المستخدم مباشرة إلى المحتوى الرئيسي أو التنقل.
- **محركات البحث**: تفهم أين المحتوى الأساسي.
- **المطورين**: كود أسهل قراءة من بحر من div.

## العناصر الرئيسية
| العنصر | المعنى | ملاحظات |
|---|---|---|
| \`<header>\` | مقدمة الصفحة أو مقدمة قسم/مقال | يمكن أن يتكرر (رأس لكل مقال) |
| \`<nav>\` | مجموعة روابط تنقل **رئيسية** | ليس كل مجموعة روابط |
| \`<main>\` | المحتوى الرئيسي الفريد للصفحة | **واحد فقط** ومرئي، خارج header و footer |
| \`<article>\` | محتوى مستقل له معنى وحده | مقال، منشور، تعليق، بطاقة منتج |
| \`<section>\` | قسم موضوعي له عنوان | إن لم يكن له عنوان فربما هو div |
| \`<aside>\` | محتوى جانبي مرتبط بشكل غير مباشر | شريط جانبي، صندوق "اقرأ أيضاً" |
| \`<footer>\` | خاتمة الصفحة أو القسم | حقوق، روابط، معلومات الكاتب |

## article أم section؟
اسأل: **هل يمكن نشر هذا الجزء وحده في مكان آخر ويبقى مفهوماً؟**
- نعم ← \`article\` (منشور مدونة، خبر).
- لا، هو جزء من كل أكبر ← \`section\` (قسم "المميزات" في صفحة هبوط).

\`\`\`html
<article>
    <header>
        <h2>كيف تبدأ مع HTML</h2>
        <p>بقلم سارة — <time datetime="2026-03-15">15 مارس 2026</time></p>
    </header>
    <section>
        <h3>الأدوات</h3>
        <p>...</p>
    </section>
    <section>
        <h3>أول صفحة</h3>
        <p>...</p>
    </section>
    <footer><p>الوسوم: HTML، مبتدئ</p></footer>
</article>
\`\`\`
\`<time datetime="...">\` يعطي التاريخ بصيغة يفهمها الحاسوب مع نص يقرؤه الإنسان.

## متى div و span؟
\`<div>\` (كتلة) و \`<span>\` (داخل السطر) **بلا معنى** — استخدمهما عندما تحتاج غلافاً لأجل التنسيق أو JavaScript فقط ولا يوجد عنصر دلالي مناسب. هذا طبيعي وصحيح؛ الخطأ هو استخدام div لكل شيء.

## عناصر دلالية أخرى مفيدة
- \`<address>\`: معلومات التواصل لصاحب الصفحة أو المقال.
- \`<details>\` و \`<summary>\`: قسم قابل للطي بلا JavaScript (ممتاز للأسئلة الشائعة).
- \`<figure>\` و \`<figcaption>\`: محتوى مع تعليق.

\`\`\`html
<details>
    <summary>هل الدورات مجانية؟</summary>
    <p>نعم، كل الدروس مجانية مع نظام العملات.</p>
</details>
\`\`\`

## تمرين
خذ صفحة كتبتها سابقاً وأعد هيكلتها: header فيه شعار و nav، و main فيه section للتعريف و article لمنشور، و aside لروابط، و footer للحقوق. افتح أدوات المطور ← تبويب Accessibility وشاهد المناطق.
`,
      codeExample: RTL_PAGE('مدونة Kodax', `    <header>
        <h1>مدونة Kodax</h1>
        <nav>
            <ul>
                <li><a href="index.html">الرئيسية</a></li>
                <li><a href="about.html">من نحن</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <article>
            <header>
                <h2>كيف تبدأ مع HTML</h2>
                <p>بقلم سارة — <time datetime="2026-03-15">15 مارس 2026</time></p>
            </header>
            <p>HTML هي الخطوة الأولى في تطوير الويب...</p>
            <section>
                <h3>الأدوات التي تحتاجها</h3>
                <p>محرر نصوص ومتصفح فقط.</p>
            </section>
        </article>

        <aside>
            <h2>اقرأ أيضاً</h2>
            <ul>
                <li><a href="css-intro.html">مقدمة في CSS</a></li>
            </ul>
        </aside>
    </main>

    <footer>
        <details>
            <summary>تواصل معنا</summary>
            <address><a href="mailto:hello@example.com">hello@example.com</a></address>
        </details>
        <p><small>&copy; 2026 Kodax</small></p>
    </footer>`),
      quiz: {
        question: 'منشور مدونة يمكن مشاركته وحده ويبقى مفهوماً — ما العنصر الأنسب له؟',
        options: ['<section>', '<article>', '<div>', '<aside>'],
        correctAnswer: 1,
        explanation: 'article للمحتوى المستقل القابل للنشر وحده؛ section لقسم من كل أكبر.',
      },
    },
  },
  newLessons: [
    {
      id: 'html-document',
      title: 'بنية المستند وقسم head',
      description: 'ما يحتاجه كل مستند: DOCTYPE و lang و dir، meta charset و viewport، العنوان والوصف، ربط CSS و JavaScript والأيقونة',
      language: 'html',
      xpReward: 100,
      content: md`
# بنية المستند وقسم head

قسم \`<head>\` لا يظهر في محتوى الصفحة، لكنه يتحكم في أشياء حاسمة: هل تظهر الحروف العربية صحيحة؟ هل الصفحة مناسبة للجوال؟ ماذا يظهر في نتائج البحث وعند المشاركة؟

## القالب الذي تبدأ به كل صفحة
\`\`\`html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>دورات البرمجة | Kodax</title>
    <meta name="description" content="تعلم البرمجة بالعربية مع دروس تفاعلية وتحديات.">
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="css/style.css">
    <script src="js/app.js" defer></script>
</head>
<body>
    <h1>مرحباً</h1>
</body>
</html>
\`\`\`

## سطراً بسطر
### \`<!DOCTYPE html>\`
بدونه يدخل المتصفح "وضع التوافق" (quirks mode) ويقلّد أخطاء متصفحات التسعينات، فيتغير حساب الأحجام في CSS.

### \`lang="ar"\` و \`dir="rtl"\`
- \`lang\`: لغة المحتوى. قارئ الشاشة يختار النطق العربي، والمتصفح يعرض الترجمة بشكل صحيح، ومحركات البحث تفهم لغة الصفحة.
- \`dir="rtl"\`: الاتجاه من اليمين لليسار. بدونه تظهر الصفحة العربية محاذاة لليسار وعلامات الترقيم في أماكن خاطئة.
- لجزء بلغة أخرى داخل الصفحة: \`<span lang="en" dir="ltr">Hello</span>\`.

### \`<meta charset="UTF-8">\`
ترميز الحروف. بدونه قد تظهر العربية رموزاً غريبة مثل \`Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©\`. يجب أن يكون **أول** عنصر في head، واحفظ الملف نفسه بترميز UTF-8 في المحرر.

### \`viewport\`
بدونه يعرض الجوال الصفحة كأنها على شاشة حاسوب عرضها ~980px ثم يصغّرها، فيصبح النص مجهرياً. هذا السطر شرط لأي تصميم متجاوب.

### \`<title>\`
يظهر في تبويب المتصفح، وفي المفضلة، وهو **العنوان الأزرق** في نتائج جوجل. اجعله فريداً لكل صفحة ووصفياً: "دورات البرمجة | Kodax" أفضل من "الرئيسية".

### \`meta description\`
الوصف الذي يظهر غالباً تحت العنوان في نتائج البحث (~150 حرفاً). لا يرفع الترتيب مباشرة لكنه يقنع الناس بالنقر.

### الأيقونة والملفات
- \`<link rel="icon">\`: أيقونة التبويب (favicon).
- \`<link rel="stylesheet">\`: ربط ملف CSS — في head ليُطبَّق التنسيق قبل ظهور المحتوى.
- \`<script defer>\`: \`defer\` يحمّل السكربت دون إيقاف عرض الصفحة وينفّذه بعد قراءة HTML كاملاً. بدونه، سكربت في head يوقف العرض ولا يجد عناصر الصفحة بعد.

## المشاركة على وسائل التواصل
عند مشاركة رابطك تقرأ المنصات وسوم **Open Graph**:
\`\`\`html
<meta property="og:title" content="دورات البرمجة | Kodax">
<meta property="og:description" content="تعلم البرمجة بالعربية">
<meta property="og:image" content="https://example.com/cover.png">
\`\`\`

## ترتيب مقترح داخل head
1. \`meta charset\` (أولاً دائماً)
2. \`viewport\`
3. \`title\` و \`description\`
4. الأيقونة و CSS
5. السكربتات بـ \`defer\`

## أخطاء شائعة
- نسيان viewport ثم التساؤل لماذا لا يعمل التصميم المتجاوب.
- \`dir="ltr"\` في صفحة عربية (نسخ قالب إنجليزي).
- وضع محتوى مرئي داخل head.
- عنوان واحد مكرر لكل صفحات الموقع.

## تمرين
أنشئ ملف \`template.html\` بالقالب الكامل أعلاه (بدون السكربت إن لم يوجد ملف)، واحفظه لتبدأ منه كل صفحة. جرّب حذف \`meta charset\` وحفظ الملف بترميز مختلف، ثم حذف viewport وافتح الصفحة بوضع الجوال في أدوات المطور (Ctrl+Shift+M) — لاحظ الفرق.
`,
      codeExample: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>دورات البرمجة | Kodax</title>
    <meta name="description" content="تعلم البرمجة بالعربية مع دروس تفاعلية وتحديات يومية.">

    <!-- المشاركة على وسائل التواصل -->
    <meta property="og:title" content="دورات البرمجة | Kodax">
    <meta property="og:description" content="تعلم البرمجة بالعربية">

    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="css/style.css">
    <script src="js/app.js" defer></script>
</head>
<body>
    <h1>تعلّم البرمجة بالعربية</h1>
    <p>هذه الفقرة عربية، وهذه كلمة إنجليزية: <span lang="en" dir="ltr">Hello World</span>.</p>
</body>
</html>`,
      quiz: {
        question: 'ماذا يحدث غالباً لصفحة بدون <meta name="viewport"> عند فتحها على الجوال؟',
        options: [
          'لا تفتح أبداً',
          'تُعرض كأنها على شاشة حاسوب عريضة ثم تُصغَّر فيصبح النص صغيراً جداً',
          'تظهر الحروف العربية رموزاً غريبة',
          'تتحول للوضع الليلي',
        ],
        correctAnswer: 1,
        explanation: 'viewport يخبر الجوال أن يستخدم عرض الشاشة الحقيقي؛ وهو شرط للتصميم المتجاوب.',
      },
    },
    {
      id: 'html-media',
      title: 'الصوت والفيديو والتضمين',
      description: 'video و audio مع controls والمصادر والترجمات، picture و srcset للصور المتجاوبة، و iframe لتضمين الخرائط والفيديوهات بأمان',
      language: 'html',
      xpReward: 100,
      content: md`
# الصوت والفيديو والتضمين

## الفيديو
\`\`\`html
<video controls width="640" height="360" poster="images/cover.jpg" preload="metadata">
    <source src="videos/intro.webm" type="video/webm">
    <source src="videos/intro.mp4" type="video/mp4">
    <track kind="subtitles" src="videos/intro.ar.vtt" srclang="ar" label="العربية" default>
    متصفحك لا يدعم الفيديو. <a href="videos/intro.mp4">حمّل الفيديو</a>.
</video>
\`\`\`
| الخاصية | المعنى |
|---|---|
| \`controls\` | أزرار التشغيل — **بدونها لا يستطيع المستخدم التحكم** |
| \`poster\` | صورة تظهر قبل التشغيل |
| \`preload="metadata"\` | حمّل المدة والأبعاد فقط، لا الفيديو كله |
| \`autoplay\` | تشغيل تلقائي — المتصفحات تمنعه إلا مع \`muted\` |
| \`muted\` / \`loop\` / \`playsinline\` | كتم / تكرار / تشغيل داخل الصفحة على iPhone |

- عدة \`<source>\`: يختار المتصفح **أول** صيغة يدعمها.
- النص داخل \`<video>\` يظهر فقط للمتصفحات التي لا تدعمه.
- \`<track>\`: ملف ترجمة بصيغة WebVTT — مهم للصم ولمن يشاهد بلا صوت.

## الصوت
\`\`\`html
<audio controls preload="none">
    <source src="audio/lesson1.mp3" type="audio/mpeg">
    <source src="audio/lesson1.ogg" type="audio/ogg">
    متصفحك لا يدعم الصوت.
</audio>
\`\`\`
للمحتوى الصوتي (بودكاست، درس) وفّر **نصاً مكتوباً** (transcript) أيضاً للوصولية ومحركات البحث.

## الصور المتجاوبة
لماذا يحمّل الجوال صورة بعرض 2000px لشاشة عرضها 400px؟ \`srcset\` يعطي المتصفح خيارات:
\`\`\`html
<img src="images/hero-800.jpg"
     srcset="images/hero-400.jpg 400w, images/hero-800.jpg 800w, images/hero-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 800px"
     alt="طلاب يتعلمون البرمجة" width="800" height="450">
\`\`\`
- \`400w\`: العرض الحقيقي للملف بالبكسل.
- \`sizes\`: كم سيكون عرض الصورة على الشاشة؛ المتصفح يحسب ويختار أصغر ملف كافٍ (مع مراعاة دقة الشاشة).

### picture: صيغ مختلفة أو قص مختلف
\`\`\`html
<picture>
    <source srcset="images/hero.avif" type="image/avif">
    <source srcset="images/hero.webp" type="image/webp">
    <img src="images/hero.jpg" alt="طلاب يتعلمون البرمجة" width="800" height="450">
</picture>
\`\`\`
المتصفح يأخذ أول صيغة يدعمها، و \`<img>\` الأخير هو الاحتياط **وإلزامي** (وفيه alt).

## iframe: تضمين صفحة داخل صفحة
\`\`\`html
<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=44.3,33.2,44.5,33.4"
        width="600" height="400"
        title="خريطة بغداد"
        loading="lazy"></iframe>
\`\`\`
- \`title\` **ضروري**: قارئ الشاشة يعلن عن الإطار بعنوانه.
- \`loading="lazy"\`: لا يُحمّل حتى يقترب المستخدم — الإطارات ثقيلة.
- **الأمان**: الصفحة المضمّنة كود من موقع آخر. للمحتوى غير الموثوق استخدم \`sandbox\` الذي يمنع السكربتات والنماذج إلا ما تسمح به: \`sandbox="allow-scripts"\`.
- كثير من المواقع **تمنع** تضمينها (البنوك، جوجل) لحماية مستخدميها من خداع النقر (clickjacking)، فلن تظهر في iframe.

## نصائح الأداء
- الفيديو أثقل شيء في الصفحة: ضغطه، و \`preload="metadata"\` أو \`none\`.
- للفيديوهات الطويلة استخدم منصة (YouTube، Vimeo) وضمّنها بـ iframe بدل رفعها على خادمك.

## تمرين
أنشئ صفحة "درس مسجل": فيديو بـ controls و poster ومصدرين، وترجمة عربية، ومقطع صوتي للملخص مع نص مكتوب تحته، وخريطة مضمّنة بـ iframe مع title و loading="lazy".
`,
      codeExample: RTL_PAGE('درس مسجل', `    <h1>الدرس الأول: مقدمة في الويب</h1>

    <video controls width="640" height="360" poster="images/lesson1-cover.jpg" preload="metadata">
        <source src="videos/lesson1.webm" type="video/webm">
        <source src="videos/lesson1.mp4" type="video/mp4">
        <track kind="subtitles" src="videos/lesson1.ar.vtt" srclang="ar" label="العربية" default>
        متصفحك لا يدعم الفيديو. <a href="videos/lesson1.mp4">حمّل الفيديو</a>.
    </video>

    <h2>ملخص صوتي</h2>
    <audio controls preload="none">
        <source src="audio/summary.mp3" type="audio/mpeg">
        متصفحك لا يدعم الصوت.
    </audio>
    <details>
        <summary>النص المكتوب</summary>
        <p>في هذا الدرس تعرفنا على HTML و CSS و JavaScript ودور كل منها.</p>
    </details>

    <h2>موقع المعهد</h2>
    <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=44.3,33.2,44.5,33.4"
            width="600" height="400" title="خريطة موقع المعهد في بغداد" loading="lazy"></iframe>`),
      quiz: {
        question: 'لماذا يجب إضافة الخاصية title إلى iframe؟',
        options: ['لتحسين سرعة التحميل', 'ليعلن قارئ الشاشة عن محتوى الإطار بعنوان مفهوم', 'لأن iframe لا يعمل بدونها', 'لمنع السكربتات'],
        correctAnswer: 1,
        explanation: 'title يصف الإطار لمستخدمي قارئات الشاشة؛ sandbox هو ما يقيّد السكربتات.',
      },
    },
    {
      id: 'html-a11y',
      title: 'الوصولية وأساسيات SEO',
      description: 'اجعل صفحتك صالحة للجميع ولمحركات البحث: التنقل بلوحة المفاتيح، النصوص البديلة، الأزرار مقابل الروابط، ARIA بحذر، والتحقق',
      language: 'html',
      xpReward: 100,
      content: md`
# الوصولية (Accessibility) وأساسيات SEO

**الوصولية** تعني أن يستطيع كل شخص استخدام موقعك: من يستخدم قارئ شاشة، أو لوحة المفاتيح فقط، أو يعاني ضعف نظر أو عمى ألوان، أو يستخدم جوالاً قديماً في ضوء الشمس. نحو 15% من البشر لديهم إعاقة ما — والوصولية تفيد الجميع (مثل الترجمة على الفيديو).

الخبر الجيد: **HTML الدلالي الصحيح يعطيك معظم الوصولية مجاناً**. وما يفيد قارئ الشاشة يفيد محركات البحث أيضاً: كلاهما "يقرأ" الصفحة ولا "يراها".

## 1. استخدم العنصر الصحيح
| تريد | استخدم | لا تستخدم |
|---|---|---|
| ينقل لصفحة أخرى | \`<a href>\` | \`<span onclick>\` |
| يفعل شيئاً في الصفحة | \`<button>\` | \`<div onclick>\` |
| عنوان قسم | \`<h2>\` | \`<p class="big">\` |

الزر الحقيقي يعمل بلوحة المفاتيح (Tab للوصول، Enter و Space للتفعيل) ويعلنه قارئ الشاشة "زر". الـ div لا يفعل أياً من ذلك حتى تكتب له كل هذا يدوياً.

## 2. لوحة المفاتيح
جرّب موقعك **بدون فأرة**: Tab للتنقل، Shift+Tab للرجوع، Enter للتفعيل.
- هل ترى أين التركيز؟ لا تحذف إطار التركيز (\`outline\`) في CSS دون بديل.
- هل الترتيب منطقي؟ ترتيب Tab يتبع ترتيب HTML.
- رابط "تخطَّ إلى المحتوى" في أول الصفحة يوفر على مستخدم لوحة المفاتيح عشرات الضغطات:
\`\`\`html
<a href="#main" class="skip-link">تخطَّ إلى المحتوى</a>
<header>...</header>
<main id="main">...</main>
\`\`\`

## 3. نصوص بديلة وأسماء واضحة
- كل \`<img>\` له \`alt\` (فارغ للصور الزخرفية).
- كل حقل له \`<label>\`.
- كل زر وكل رابط له نص مفهوم. زر أيقونة بلا نص يحتاج اسماً:
\`\`\`html
<button type="button" aria-label="إغلاق النافذة">✕</button>
\`\`\`
- نص الرابط يصف الوجهة: "حمّل دليل الطالب (PDF)" لا "اضغط هنا".

## 4. لا تعتمد على اللون وحده
"الحقول باللون الأحمر إلزامية" لا تفيد من لا يميز الأحمر. أضف نصاً أو رمزاً: "الاسم (إلزامي)". وتأكد أن التباين بين النص والخلفية كافٍ (نسبة 4.5:1 على الأقل للنص العادي).

## 5. ARIA: القاعدة الأولى
ARIA خصائص تضيف معنى لقارئات الشاشة (\`aria-label\`، \`aria-expanded\`، \`role\`). **القاعدة الأولى لـ ARIA: لا تستخدمها إذا وُجد عنصر HTML يؤدي الغرض**. \`<button>\` أفضل من \`<div role="button">\`. ARIA الخاطئة أسوأ من عدمها، لأنها تكذب على قارئ الشاشة.

## 6. لغة واتجاه وعناوين
\`lang="ar" dir="rtl"\`، وعناوين متسلسلة بلا قفز، و \`<main>\` واحد. (تعلمتها في الدروس السابقة — الآن تعرف لماذا.)

## أساسيات SEO في HTML
| العنصر | الأثر |
|---|---|
| \`<title>\` فريد ووصفي لكل صفحة | العنوان في نتائج البحث |
| \`meta description\` | الوصف تحت العنوان |
| \`<h1>\` واحد وعناوين منطقية | فهم موضوع الصفحة وأقسامها |
| HTML دلالي | فهم أين المحتوى الرئيسي |
| \`alt\` للصور | الظهور في بحث الصور |
| روابط بنص وصفي | فهم الصفحة المرتبطة |
| صفحة سريعة ومتجاوبة | عامل في الترتيب |

لا توجد حيلة HTML سحرية للترتيب الأول: المحتوى المفيد والصفحة السليمة هما الأساس. وتجنب "حشو الكلمات المفتاحية" — يضر أكثر مما ينفع.

## أدوات الفحص
- **Lighthouse** في أدوات مطور Chrome: تقرير وصولية و SEO وأداء.
- **validator.w3.org**: أخطاء HTML.
- قارئ شاشة حقيقي: NVDA (ويندوز، مجاني)، VoiceOver (Mac و iPhone)، TalkBack (أندرويد).

## تمرين
افتح صفحة كتبتها، وشغّل Lighthouse، وأصلح كل ملاحظات الوصولية. ثم تنقّل فيها بلوحة المفاتيح فقط وأضف رابط "تخطَّ إلى المحتوى".
`,
      codeExample: RTL_PAGE('صفحة يسهل الوصول إليها', `    <a href="#main">تخطَّ إلى المحتوى</a>

    <header>
        <a href="index.html"><img src="images/logo.svg" alt="Kodax — الصفحة الرئيسية" width="120" height="40"></a>
        <nav aria-label="القائمة الرئيسية">
            <ul>
                <li><a href="courses.html">الدورات</a></li>
                <li><a href="challenges.html">التحديات</a></li>
            </ul>
        </nav>
    </header>

    <main id="main">
        <h1>تواصل معنا</h1>
        <form action="/contact" method="post">
            <p>
                <label for="name">الاسم (إلزامي)</label>
                <input type="text" id="name" name="name" required autocomplete="name">
            </p>
            <p>
                <label for="msg">رسالتك (إلزامي)</label>
                <textarea id="msg" name="message" rows="4" required></textarea>
            </p>
            <button type="submit">إرسال الرسالة</button>
        </form>
        <p><a href="files/guide.pdf">حمّل دليل الطالب (PDF، 2 ميغابايت)</a></p>
        <button type="button" aria-label="إغلاق التنبيه">✕</button>
    </main>`),
      quiz: {
        question: 'عنصر يُنقر لفتح نافذة داخل الصفحة (لا ينقل لصفحة أخرى) — ما العنصر الصحيح؟',
        options: ['<a href="#">', '<div onclick="...">', '<button type="button">', '<span role="link">'],
        correctAnswer: 2,
        explanation: 'الأفعال داخل الصفحة أزرار؛ button يعمل بلوحة المفاتيح ويُعلَن "زر" لقارئات الشاشة تلقائياً.',
      },
    },
    {
      id: 'html-project',
      title: 'مشروع: صفحة شخصية كاملة',
      description: 'ابنِ صفحة تعريفية (Portfolio) متعددة الأقسام تجمع كل ما تعلمته، مع قائمة تحقق للجودة',
      language: 'html',
      xpReward: 150,
      content: md`
# مشروع: صفحة شخصية كاملة

حان وقت بناء صفحة حقيقية تضعها على الإنترنت لاحقاً (دورة نشر المواقع). ستضيف لها التنسيق في دورة CSS، فركّز الآن على **هيكل صحيح ونظيف**.

## المطلوب
صفحة \`index.html\` واحدة فيها:
1. **رأس الصفحة**: اسمك ووصف قصير، وقائمة تنقل بروابط داخلية للأقسام.
2. **من أنا**: فقرة وصورة شخصية (alt وأبعاد).
3. **المهارات**: قائمة (أو قائمة وصفية: المهارة ← المستوى).
4. **المشاريع**: كل مشروع \`<article>\` فيه عنوان ووصف ورابط وصورة مع \`figure\`.
5. **الخبرات/الدراسة**: جدول بسيط (السنة، الجهة، الدور) مع caption و th.
6. **تواصل معي**: نموذج (الاسم، البريد، الرسالة) مع labels وتحقق.
7. **التذييل**: حقوق وروابط حساباتك.

## خطوات العمل
1. **ابدأ بالقالب**: انسخ قالب درس "بنية المستند" (charset، viewport، lang، dir، title، description).
2. **ارسم الهيكل أولاً** بالعناصر الدلالية فارغة: header، nav، main وفيه sections، footer.
3. **املأ قسماً قسماً** وافتح الصفحة بعد كل قسم.
4. **أعطِ كل section معرفاً** (\`id="projects"\`) واربطه من nav.
5. **تحقق** بالمدقق و Lighthouse.

## الهيكل المقترح
\`\`\`html
<body>
    <a href="#main">تخطَّ إلى المحتوى</a>
    <header>
        <h1>الاسم</h1>
        <p>الوصف</p>
        <nav aria-label="أقسام الصفحة">
            <ul>
                <li><a href="#about">من أنا</a></li>
                <li><a href="#projects">مشاريعي</a></li>
                <li><a href="#contact">تواصل</a></li>
            </ul>
        </nav>
    </header>
    <main id="main">
        <section id="about"><h2>من أنا</h2></section>
        <section id="projects"><h2>مشاريعي</h2></section>
        <section id="contact"><h2>تواصل معي</h2></section>
    </main>
    <footer></footer>
</body>
\`\`\`

## قائمة التحقق قبل التسليم
- [ ] \`<!DOCTYPE html>\` و \`lang="ar" dir="rtl"\` و \`meta charset\` و viewport.
- [ ] \`<title>\` و description وصفيان.
- [ ] \`<h1>\` واحد، والعناوين متسلسلة (h2 للأقسام، h3 داخلها).
- [ ] \`<main>\` واحد، وكل قسم section له عنوان.
- [ ] كل صورة لها alt مناسب و width و height.
- [ ] كل حقل له label و name، والحقول الإلزامية required.
- [ ] الروابط الخارجية تعمل، ونصوصها وصفية.
- [ ] صفر أخطاء في validator.w3.org.
- [ ] التنقل بلوحة المفاتيح ممكن من أول الصفحة لآخرها.

## تحديات إضافية
- أضف قسم "أسئلة شائعة" بـ \`details\` و \`summary\`.
- أضف فيديو تعريفياً قصيراً بـ controls.
- أنشئ صفحة ثانية \`project-1.html\` لتفاصيل مشروع واربطها بمسار نسبي، مع رابط عودة.

في دورة **تصميم CSS** ستحوّل هذه الصفحة إلى تصميم جذاب ومتجاوب دون تغيير الهيكل تقريباً — وهذه علامة أن HTML مكتوب جيداً.
`,
      codeExample: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>سارة أحمد | مطورة ويب</title>
    <meta name="description" content="الصفحة الشخصية لسارة أحمد: مشاريع ومهارات في تطوير الويب.">
</head>
<body>
    <a href="#main">تخطَّ إلى المحتوى</a>

    <header>
        <h1>سارة أحمد</h1>
        <p>مطورة واجهات ويب مبتدئة من بغداد</p>
        <nav aria-label="أقسام الصفحة">
            <ul>
                <li><a href="#about">من أنا</a></li>
                <li><a href="#skills">المهارات</a></li>
                <li><a href="#projects">مشاريعي</a></li>
                <li><a href="#contact">تواصل</a></li>
            </ul>
        </nav>
    </header>

    <main id="main">
        <section id="about">
            <h2>من أنا</h2>
            <img src="images/sara.jpg" alt="صورة سارة مبتسمة أمام حاسوبها" width="200" height="200">
            <p>أتعلم تطوير الويب منذ 2025، وأحب بناء صفحات <strong>سهلة الاستخدام</strong> للجميع.</p>
        </section>

        <section id="skills">
            <h2>المهارات</h2>
            <dl>
                <dt>HTML</dt>
                <dd>متقدم</dd>
                <dt>CSS</dt>
                <dd>متوسط</dd>
            </dl>
        </section>

        <section id="projects">
            <h2>مشاريعي</h2>
            <article>
                <h3>صفحة مطعم</h3>
                <figure>
                    <img src="images/restaurant.png" alt="لقطة من صفحة المطعم تعرض قائمة الطعام" width="600" height="400" loading="lazy">
                    <figcaption>الصفحة الرئيسية لمطعم تجريبي</figcaption>
                </figure>
                <p>صفحة بقائمة طعام وجدول مواعيد ونموذج حجز.</p>
                <p><a href="project-1.html">تفاصيل المشروع</a></p>
            </article>
        </section>

        <section id="experience">
            <h2>الدراسة</h2>
            <table>
                <caption>المسار التعليمي</caption>
                <thead>
                    <tr>
                        <th scope="col">السنة</th>
                        <th scope="col">الجهة</th>
                        <th scope="col">الدورة</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>2025</td>
                        <td>Kodax</td>
                        <td>أساسيات HTML</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section id="contact">
            <h2>تواصل معي</h2>
            <form action="/contact" method="post">
                <p>
                    <label for="name">الاسم</label>
                    <input type="text" id="name" name="name" required autocomplete="name">
                </p>
                <p>
                    <label for="email">البريد الإلكتروني</label>
                    <input type="email" id="email" name="email" required autocomplete="email">
                </p>
                <p>
                    <label for="message">الرسالة</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </p>
                <button type="submit">إرسال</button>
            </form>
        </section>
    </main>

    <footer>
        <p><small>&copy; 2026 سارة أحمد</small></p>
    </footer>
</body>
</html>`,
      quiz: {
        question: 'أي مما يلي ليس من متطلبات قائمة التحقق لصفحة HTML جيدة؟',
        options: ['h1 واحد وعناوين متسلسلة', 'كل صورة لها alt', 'استخدام div لكل الأقسام بدل العناصر الدلالية', 'كل حقل له label'],
        correctAnswer: 2,
        explanation: 'العناصر الدلالية (header, main, section...) أفضل من div حين يوجد عنصر مناسب.',
      },
    },
  ],
};

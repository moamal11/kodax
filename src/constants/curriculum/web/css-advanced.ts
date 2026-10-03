/**
 * منهج web-css-advanced — CSS المتقدم.
 *
 * كان: 5 دروس بشرح قوائم قصيرة؛ درسا "التصميم المتجاوب" و "CSS Variables" تكرار حرفي تقريباً
 * لدرسي media queries والمتغيرات في دورة تصميم CSS (نفس الاختبار تقريباً)؛ لا ذكر لـ
 * prefers-reduced-motion ولا لأداء الحركات؛ مثال الدوران يضع transition داخل :hover فقط
 * (الحركة لا تعود بسلاسة)؛ مثال خط القائمة يحرّك width (يعيد حساب التخطيط كل إطار)؛ لا مشروع.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';

export const WEB_CSS_ADVANCED_PLAN: CoursePlan = {
  courseId: 'web-css-advanced',
  course: {
    description:
      'ارتقِ بتصاميمك: التحويلات ثنائية وثلاثية الأبعاد، الانتقالات والحركات بأداء عالٍ ومع احترام تفضيلات المستخدم، Container Queries والتخطيطات الذاتية، ونظام تصميم بالمتغيرات و color-mix — مع مشروع مكوّنات تفاعلية.',
  },
  sections: [
    { title: 'الحركة', lessons: ['css-adv-1', 'css-adv-2', 'css-adv-3'] },
    { title: 'CSS الحديثة', lessons: ['css-adv-4', 'css-adv-5'] },
    { title: 'المشروع', lessons: ['css-adv-project'] },
  ],
  codeFixes: {
    'css-adv-1': [
      [
        '.rotate-hover:hover {\n    transform: rotate(360deg);\n    transition: transform 0.5s;\n}',
        '.rotate-hover {\n    transition: transform 0.5s;   /* على الحالة الأساسية: يتحرك ذهاباً وإياباً */\n}\n.rotate-hover:hover {\n    transform: rotate(360deg);\n}',
      ],
    ],
  },
  patches: {
    'css-adv-1': {
      description: 'translate و rotate و scale و skew، ترتيب التحويلات، transform-origin، الخصائص المستقلة، والتحويلات ثلاثية الأبعاد',
      content: md`
# التحويلات (Transforms)

\`transform\` يحرك العنصر ويدوره ويكبره **بصرياً فقط**: مكانه الأصلي في التخطيط يبقى محجوزاً، والعناصر المجاورة لا تتحرك. لهذا هو أساس الحركات السلسة.

## الدوال الأساسية
\`\`\`css
.a { transform: translate(20px, -10px); }   /* إزاحة أفقية ورأسية */
.b { transform: translateY(-4px); }
.c { transform: rotate(15deg); }            /* دوران مع عقارب الساعة */
.d { transform: scale(1.1); }               /* تكبير 110% */
.e { transform: scale(1, 0.5); }            /* عرض كما هو، ارتفاع النصف */
.f { transform: skewX(-10deg); }            /* إمالة */
\`\`\`
- النسبة المئوية في translate من **حجم العنصر نفسه**: \`translate(-50%, -50%)\` يزيحه بنصف عرضه وارتفاعه (أساس التوسيط القديم).
- الوحدات: \`deg\` أو \`turn\` (\`0.5turn\` = 180°).

## ترتيب التحويلات مهم
عدة تحويلات تُطبق **من اليمين لليسار** على نظام إحداثيات يتغير:
\`\`\`css
.one { transform: rotate(45deg) translateX(100px); }  /* يتحرك على المحور المائل */
.two { transform: translateX(100px) rotate(45deg); }  /* يتحرك أفقياً ثم يدور مكانه */
\`\`\`
النتيجتان مختلفتان تماماً. جرّبهما في المتصفح.

⚠️ تعريف \`transform\` مرة ثانية **يستبدل** الأولى بالكامل: \`.card:hover { transform: scale(1.05); }\` يلغي \`translateY\` المكتوب في الحالة الأساسية.

## الخصائص المستقلة (حديثة)
\`\`\`css
.card { translate: 0 0; scale: 1; rotate: 0deg; }
.card:hover { translate: 0 -4px; }          /* لا يلغي scale أو rotate */
.card.selected { scale: 1.05; }
\`\`\`
\`translate\` و \`rotate\` و \`scale\` خصائص منفصلة مدعومة في كل المتصفحات الحديثة: تُدمج ولا تستبدل بعضها، وتُحرَّك كلٌّ على حدة.

## transform-origin: نقطة الارتكاز
الافتراضي مركز العنصر. للدوران حول زاوية:
\`\`\`css
.door { transform-origin: inline-start center; transform: rotateY(-30deg); }
.menu { transform-origin: top center; transform: scaleY(0); }   /* قائمة تنفتح من الأعلى */
\`\`\`

## ثلاثي الأبعاد
\`\`\`css
.scene { perspective: 800px; }           /* على الأب: "مسافة العين" — أصغر = منظور أقوى */
.card3d {
    transform-style: preserve-3d;        /* الأبناء في فضاء ثلاثي حقيقي */
    transition: transform 0.6s;
}
.scene:hover .card3d { transform: rotateY(180deg); }
.face { backface-visibility: hidden; }   /* لا ترى الوجه الخلفي عند الدوران */
.back { transform: rotateY(180deg); }
\`\`\`
هذه وصفة "البطاقة القابلة للقلب" في المثال الكامل.

## الأداء
المتصفح يحرّك \`transform\` و \`opacity\` على **وحدة الرسوميات** دون إعادة حساب التخطيط — لذلك هما الخاصيتان المفضلتان للحركة. تحريك \`top\` أو \`width\` أو \`margin\` يجبر المتصفح على إعادة حساب مواقع العناصر في كل إطار (تقطّع على الأجهزة الضعيفة).

## RTL
الإزاحة لا تنقلب مع الاتجاه: \`translateX(20px)\` يمين في الصفحتين. لحركة "للأمام في اتجاه القراءة" اعكس الإشارة في \`[dir="rtl"]\` أو استخدم متغيراً (درس الخصائص المنطقية).

## تمرين
اصنع بطاقة ترتفع 4px وتكبر قليلاً عند المرور باستخدام \`translate\` و \`scale\` المستقلتين، ثم بطاقة قابلة للقلب ثلاثية الأبعاد تعرض صورة في الأمام ونصاً في الخلف.
`,
    },
    'css-adv-2': {
      description: 'الانتقالات: الخاصية والمدة ومنحنى التوقيت والتأخير، أين تكتب transition، ما يمكن تحريكه، والأداء',
      content: md`
# الانتقالات (Transitions)

بدون انتقال، تغيّر القيمة (عند المرور مثلاً) فوري ومفاجئ. الانتقال يجعل المتصفح **يحسب القيم الوسيطة** خلال مدة تحددها.

## الصيغة
\`\`\`css
.btn {
    background: hsl(224 71% 40%);
    transition: background-color 200ms ease-out;
}
.btn:hover {
    background: hsl(224 71% 32%);
}
\`\`\`
\`transition: <الخاصية> <المدة> <منحنى التوقيت> <التأخير>\`

## أين تُكتب؟ على الحالة الأساسية
إذا كتبت \`transition\` داخل \`:hover\` فقط، يكون الدخول سلساً والخروج **مفاجئاً** (لأن الحالة الأساسية بلا انتقال). اكتبه على العنصر نفسه ليعمل في الاتجاهين.

## عدة خصائص
\`\`\`css
.card {
    transition:
        translate 250ms ease-out,
        box-shadow 250ms ease-out;
}
.card:hover {
    translate: 0 -4px;
    box-shadow: 0 12px 24px rgb(0 0 0 / 12%);
}
\`\`\`
تجنب \`transition: all\`: يحرّك خصائص لم تقصدها (وقد يحرك تغييرات التخطيط فيكون بطيئاً)، ويصعّب التنبؤ.

## منحنيات التوقيت
| المنحنى | الإحساس | الاستخدام |
|---|---|---|
| \`ease\` | بداية سريعة ونهاية هادئة (الافتراضي) | عام |
| \`ease-out\` | يبدأ سريعاً ويتباطأ | عناصر **تدخل** الشاشة، استجابة للمستخدم |
| \`ease-in\` | يبدأ بطيئاً ويتسارع | عناصر **تغادر** |
| \`ease-in-out\` | بطيء-سريع-بطيء | حركة من مكان لمكان |
| \`linear\` | ثابت | الدوران المستمر، أشرطة التقدم |
| \`cubic-bezier(...)\` | مخصص (أدوات المطور فيها محرر) | ارتداد خفيف وغيره |

## المدة المناسبة
- تفاعلات صغيرة (hover، أزرار): **150–250ms**.
- عناصر أكبر (قوائم، نوافذ): **250–400ms**.
- أطول من 500ms يشعر المستخدم بالبطء. الحركة يجب أن **توضح** ما حدث لا أن تؤخر المستخدم.

## ما الذي يمكن تحريكه؟
الخصائص ذات القيم الوسيطة: الألوان، الأطوال، الشفافية، التحويلات، الظلال. أما \`display\` و \`font-family\` فتتغير فوراً. (المتصفحات الحديثة أضافت \`transition-behavior: allow-discrete\` و \`@starting-style\` لتحريك الظهور من display: none — دعمها يتحسن.)

## خط سفلي متحرك للروابط (بأداء جيد)
\`\`\`css
.nav-link {
    position: relative;
}
.nav-link::after {
    content: "";
    position: absolute;
    inset-inline: 0;
    bottom: -2px;
    height: 2px;
    background: currentColor;
    scale: 0 1;                       /* بدل width: 0 */
    transform-origin: inline-start;   /* يبدأ من بداية السطر (اليمين في العربية) */
    transition: scale 250ms ease-out;
}
.nav-link:hover::after,
.nav-link:focus-visible::after {
    scale: 1 1;
}
\`\`\`
تحريك \`scale\` بدل \`width\` لا يعيد حساب التخطيط، والخصائص المنطقية تجعله يبدأ من الجهة الصحيحة في العربية.

## احترم تفضيل تقليل الحركة
\`\`\`css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        transition-duration: 0.01ms !important;
    }
}
\`\`\`

## تمرين
أضف انتقالات لأزرار صفحتك (لون الخلفية 200ms)، ولبطاقات المشاريع (ارتفاع وظل 250ms)، وخطاً سفلياً متحركاً لروابط القائمة يظهر عند المرور **وعند التركيز بلوحة المفاتيح**.
`,
    },
    'css-adv-3': {
      description: 'الحركات بـ @keyframes: المراحل وخصائص animation، fill-mode، الحركات المتكررة، الأداء، و prefers-reduced-motion',
      content: md`
# الحركات (Animations)

الانتقال يحتاج **تغيير حالة** (hover، صنف جديد) وله بداية ونهاية فقط. الحركة بـ \`@keyframes\` تعمل **وحدها**، بعدة مراحل، وتتكرر إن شئت: مؤشرات التحميل، ظهور العناصر، لفت الانتباه.

## التعريف والاستخدام
\`\`\`css
@keyframes fade-up {
    from { opacity: 0; translate: 0 16px; }
    to   { opacity: 1; translate: 0 0; }
}
.reveal {
    animation: fade-up 400ms ease-out both;
}
\`\`\`

## مراحل متعددة
\`\`\`css
@keyframes pulse {
    0%, 100% { scale: 1; }
    50%      { scale: 1.08; }
}
\`\`\`

## خصائص animation
| الخاصية | المعنى | مثال |
|---|---|---|
| \`animation-name\` | اسم @keyframes | \`pulse\` |
| \`animation-duration\` | مدة الدورة الواحدة | \`2s\` |
| \`animation-timing-function\` | المنحنى (لكل مرحلة) | \`ease-in-out\` |
| \`animation-delay\` | تأخير البدء (يقبل سالباً: يبدأ من المنتصف) | \`200ms\` |
| \`animation-iteration-count\` | عدد التكرارات | \`3\` أو \`infinite\` |
| \`animation-direction\` | الاتجاه | \`alternate\` (ذهاب وإياب) |
| \`animation-fill-mode\` | الحالة قبل/بعد التشغيل | \`both\` |
| \`animation-play-state\` | إيقاف مؤقت | \`paused\` |

الاختصار: \`animation: pulse 2s ease-in-out infinite;\`

## fill-mode: مشكلة "القفزة"
بعد انتهاء الحركة يعود العنصر لتنسيقه الأصلي. حركة ظهور تبدأ من opacity: 0 مع تأخير ستُظهر العنصر **أولاً** ثم تخفيه ثم تبدأ!
- \`forwards\`: يبقى على الإطار الأخير.
- \`backwards\`: يطبق الإطار الأول أثناء التأخير.
- \`both\`: الاثنان — الأكثر أماناً لحركات الظهور.

## ظهور متتابع
\`\`\`css
.list-item { animation: fade-up 400ms ease-out both; }
.list-item:nth-child(2) { animation-delay: 80ms; }
.list-item:nth-child(3) { animation-delay: 160ms; }
\`\`\`
أو بمتغير: \`style="--i: 2"\` في HTML و \`animation-delay: calc(var(--i) * 80ms)\`.

## مؤشر تحميل
\`\`\`css
@keyframes spin { to { rotate: 1turn; } }
.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgb(0 0 0 / 15%);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}
\`\`\`
\`from\` مُهمَل هنا: المتصفح يأخذ القيمة الحالية كبداية.

## الأداء والوصولية
- حرّك \`transform\`/\`translate\`/\`scale\`/\`rotate\` و \`opacity\` فقط إن أمكن.
- الحركات اللانهائية تشتت الانتباه وتستهلك البطارية؛ استخدمها لمؤشرات التحميل فقط، وأوقفها عندما لا تلزم.
- **prefers-reduced-motion إلزامي**:
\`\`\`css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
\`\`\`
بعض الناس (اضطرابات الدهليز) تسبب لهم الحركة دواراً وغثياناً حقيقياً.
- تجنب الوميض أكثر من 3 مرات في الثانية (قد يسبب نوبات صرع).

## الحركة المرتبطة بالتمرير (حديث)
\`animation-timeline: view()\` يربط تقدم الحركة بظهور العنصر أثناء التمرير — بلا JavaScript. الدعم ممتاز في Chrome و Edge ويتوسع؛ استخدمه داخل \`@supports (animation-timeline: view())\` كتحسين إضافي.

## تمرين
أنشئ مؤشر تحميل، وحركة ظهور متتابعة لبطاقات المشاريع بـ fill-mode: both، وأوقف كل الحركات مع prefers-reduced-motion. اختبر من أدوات المطور: Rendering ← Emulate prefers-reduced-motion.
`,
      quiz: {
        question: 'حركة ظهور (من opacity: 0) مع تأخير 1s تُظهر العنصر لحظة ثم تخفيه ثم تبدأ. ما الحل؟',
        options: ['animation-direction: reverse', 'animation-fill-mode: both (أو backwards)', 'animation-iteration-count: 0', 'transition بدلاً منها'],
        correctAnswer: 1,
        explanation: 'backwards/both تطبق الإطار الأول أثناء فترة التأخير فلا يظهر العنصر قبل بدء الحركة.',
      },
    },
    'css-adv-4': {
      title: 'Container Queries والتخطيطات الذاتية',
      description: 'مكوّنات تتكيف مع حجم حاويتها لا الشاشة: container queries ووحدات cqi، aspect-ratio و object-fit، و subgrid',
      content: md`
# Container Queries والتخطيطات الذاتية

تعلمت Media Queries في دورة تصميم CSS: تسأل عن **حجم الشاشة**. لكن البطاقة نفسها قد تظهر في عمود عريض في صفحة، وفي شريط جانبي ضيق في صفحة أخرى — على **نفس الشاشة**. السؤال الصحيح للمكوّن: "كم المساحة المتاحة **لي**؟"

## Container Queries
\`\`\`css
.card-wrapper {
    container-type: inline-size;   /* هذا العنصر "حاوية" يمكن الاستعلام عن عرضها */
    container-name: card;          /* اختياري */
}

.card {
    display: grid;
    gap: 12px;
}

@container card (min-width: 420px) {
    .card {
        grid-template-columns: 160px 1fr;   /* صورة بجانب النص عندما تتسع الحاوية */
    }
}
\`\`\`
\`\`\`html
<main class="card-wrapper"><article class="card">...</article></main>
<aside class="card-wrapper"><article class="card">...</article></aside>
\`\`\`
نفس البطاقة: أفقية في المحتوى الرئيسي، رأسية في الجانبية — تلقائياً، دون أصناف إضافية.

- \`container-type: inline-size\`: الاستعلام عن العرض (الأكثر استخداماً).
- الحاوية لا يمكنها الاستعلام عن نفسها؛ القواعد تنطبق على **أبنائها**.
- مدعومة في كل المتصفحات الحديثة منذ 2023.

## وحدات الحاوية
\`cqi\` = 1% من عرض الحاوية (inline size):
\`\`\`css
.card h3 { font-size: clamp(1rem, 4cqi, 1.5rem); }   /* العنوان يتناسب مع البطاقة لا الشاشة */
\`\`\`

## Media أم Container؟
| السؤال | الأداة |
|---|---|
| تخطيط الصفحة العام (عدد الأعمدة، إظهار الجانبية) | Media Query |
| شكل مكوّن قابل لإعادة الاستخدام | Container Query |
| تفضيلات المستخدم (حركة، ألوان، طباعة) | Media Query |

## aspect-ratio: نسبة ثابتة
\`\`\`css
.video-frame { aspect-ratio: 16 / 9; width: 100%; }
.avatar { aspect-ratio: 1; width: 64px; border-radius: 50%; }
\`\`\`
كان يتطلب حيلة padding-top: 56.25%؛ الآن سطر واحد.

## object-fit: الصورة داخل إطارها
\`\`\`css
.thumb {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;          /* تملأ الإطار وتُقص الزيادة دون تشويه */
    object-position: center;
}
\`\`\`
| القيمة | النتيجة |
|---|---|
| \`fill\` | تمدد (تشويه) — الافتراضي |
| \`contain\` | تظهر كاملة مع فراغات |
| \`cover\` | تملأ وتُقص |

## subgrid: محاذاة عبر البطاقات
مشكلة شائعة: بطاقات متجاورة عناوينها بأطوال مختلفة، فلا تتحاذى الأزرار في الأسفل.
\`\`\`css
.cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
}
.cards > .card {
    display: grid;
    grid-row: span 3;
    grid-template-rows: subgrid;   /* صفوف البطاقة تتبع صفوف الشبكة الأم */
}
\`\`\`
كل بطاقات الصف الواحد تتشارك ارتفاع الصورة والعنوان والزر.

## التخطيطات "الذاتية" (Intrinsic)
الفكرة: دع المحتوى والمساحة يقرران بدل نقاط توقف كثيرة: \`auto-fit\` و \`minmax\` و \`clamp\` و \`min()\` و \`flex-wrap\` و container queries معاً تقلل media queries إلى الحد الأدنى.

## تمرين
اجعل بطاقة المشروع مكوّناً بـ container query: رأسية تحت 420px وأفقية فوقها. ضعها في المحتوى الرئيسي وفي الشريط الجانبي وشاهد الشكلين معاً. أضف للصور aspect-ratio و object-fit: cover.
`,
      codeExample: `/* مكوّن بطاقة يتكيف مع حاويته */

.card-slot {
    container-type: inline-size;
    container-name: card;
}

.card {
    display: grid;
    gap: 12px;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: white;
}

.card img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: 8px;
}

.card h3 {
    margin: 0;
    font-size: clamp(1rem, 4cqi, 1.5rem);
}

/* حاوية عريضة: الصورة بجانب النص */
@container card (min-width: 420px) {
    .card {
        grid-template-columns: 160px 1fr;
        align-items: start;
    }
}

/* شبكة تتحاذى فيها أجزاء البطاقات */
.cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
    gap: 20px;
}

.cards > .card {
    grid-row: span 3;
    grid-template-rows: subgrid;
}

/* إطار فيديو بنسبة ثابتة */
.video-frame {
    width: 100%;
    aspect-ratio: 16 / 9;
}`,
      quiz: {
        question: 'متى تكون Container Query أنسب من Media Query؟',
        options: [
          'لتحديد عدد أعمدة الصفحة كلها',
          'لمكوّن يظهر في أماكن بعروض مختلفة على نفس الشاشة ويجب أن يتكيف مع مساحته',
          'لاكتشاف الوضع الليلي',
          'للطباعة',
        ],
        correctAnswer: 1,
        explanation: 'Container Query تسأل عن عرض الحاوية لا الشاشة، فيتكيف المكوّن حيثما وُضع.',
      },
    },
    'css-adv-5': {
      title: 'نظام تصميم بالمتغيرات',
      description: 'بناء نظام تصميم صغير: طبقتا الرموز (tokens)، مقاييس المسافات والخطوط، color-mix و light-dark، متغيرات المكوّنات، و CSS Nesting',
      content: md`
# نظام تصميم بالمتغيرات

في دورة تصميم CSS تعلمت المتغيرات الأساسية. الآن نبني بها **نظام تصميم**: مجموعة قرارات ثابتة (ألوان، مسافات، خطوط، زوايا) تستخدمها كل المكوّنات، فيصبح الموقع متسقاً وتغييره سهلاً.

## طبقتان من الرموز
\`\`\`css
:root {
    /* 1) رموز أولية: القيم الخام — لا تستخدمها المكوّنات مباشرة */
    --indigo-500: #6366f1;
    --indigo-700: #4338ca;
    --gray-50: #f9fafb;
    --gray-900: #111827;
    --red-600: #dc2626;

    /* 2) رموز دلالية: الدور — هذه ما تستخدمه المكوّنات */
    --color-brand: var(--indigo-500);
    --color-brand-strong: var(--indigo-700);
    --color-bg: var(--gray-50);
    --color-text: var(--gray-900);
    --color-danger: var(--red-600);
}
\`\`\`
تغيير هوية الموقع (البنفسجي إلى أخضر) = تعديل الطبقة الدلالية فقط.

## مقاييس بدل أرقام عشوائية
\`\`\`css
:root {
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;

    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
    --text-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);

    --radius-sm: 6px;
    --radius-md: 12px;
    --shadow-md: 0 4px 12px rgb(0 0 0 / 10%);
}
\`\`\`
عندما يسأل أحد "كم المسافة هنا؟" يكون الجواب واحداً من المقياس، لا 13px أو 17px.

## color-mix: درجات من لون واحد
\`\`\`css
.btn:hover { background: color-mix(in oklch, var(--color-brand), black 15%); }
.badge { background: color-mix(in oklch, var(--color-brand) 15%, transparent); }
\`\`\`
بدل تعريف 10 درجات يدوياً، اشتقها من اللون الأساسي. \`oklch\` فضاء ألوان يعطي خلطاً يبدو طبيعياً للعين.

## light-dark(): الوضع الليلي في سطر
\`\`\`css
:root {
    color-scheme: light dark;              /* يخبر المتصفح أننا ندعم الوضعين */
    --color-bg: light-dark(#f9fafb, #0f172a);
    --color-text: light-dark(#111827, #e5e7eb);
}
\`\`\`
\`light-dark(فاتح، داكن)\` تختار حسب تفضيل النظام (أو \`color-scheme\` على العنصر). و \`color-scheme\` يجعل أشرطة التمرير وحقول النماذج الافتراضية داكنة أيضاً. مدعومة في المتصفحات الحديثة منذ 2024؛ للقديمة استخدم أسلوب prefers-color-scheme.

## متغيرات المكوّن: واجهة للتخصيص
\`\`\`css
.btn {
    --btn-bg: var(--color-brand);
    --btn-fg: white;
    --btn-pad: var(--space-2) var(--space-4);

    background: var(--btn-bg);
    color: var(--btn-fg);
    padding: var(--btn-pad);
    border-radius: var(--radius-sm);
}
.btn.danger { --btn-bg: var(--color-danger); }
.btn.ghost { --btn-bg: transparent; --btn-fg: var(--color-brand); }
.btn.small { --btn-pad: var(--space-1) var(--space-3); }
\`\`\`
المتغيرات المحلية تعمل كـ"خيارات" للمكوّن: كل نسخة تغيّر الخيارات فقط، والقاعدة الأساسية مكتوبة مرة واحدة.

## CSS Nesting (أصلي في المتصفح)
\`\`\`css
.card {
    padding: var(--space-4);
    border-radius: var(--radius-md);

    & h3 { margin-block: 0 var(--space-2); }

    &:hover { box-shadow: var(--shadow-md); }

    @media (min-width: 768px) {
        padding: var(--space-6);
    }
}
\`\`\`
\`&\` يعني المحدد الأب. مدعوم في كل المتصفحات الحديثة منذ 2023 — لم تعد تحتاج Sass لهذا. لا تتعمق أكثر من مستويين أو ثلاثة: التداخل العميق يرفع الأولوية ويصعب القراءة.

## @property: متغيرات قابلة للتحريك
\`\`\`css
@property --angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
.ring { background: conic-gradient(from var(--angle), var(--color-brand), transparent); animation: turn 3s linear infinite; }
@keyframes turn { to { --angle: 360deg; } }
\`\`\`
المتغير العادي لا يتحرك بسلاسة (المتصفح لا يعرف نوعه)؛ \`@property\` يعرّف نوعه فيصبح قابلاً للتحريك.

## تمرين
أنشئ ملف \`tokens.css\` بطبقتي الرموز ومقاييس المسافات والخطوط، وحوّل أزرارك إلى مكوّن بمتغيرات (عادي، خطر، شفاف، صغير). استخدم color-mix لحالة hover و light-dark للوضع الليلي.
`,
      codeExample: `/* ===== tokens.css ===== */
:root {
    color-scheme: light dark;

    /* رموز أولية */
    --indigo-500: #6366f1;
    --red-600: #dc2626;

    /* رموز دلالية */
    --color-brand: var(--indigo-500);
    --color-danger: var(--red-600);
    --color-bg: light-dark(#f9fafb, #0f172a);
    --color-surface: light-dark(#ffffff, #1e293b);
    --color-text: light-dark(#111827, #e5e7eb);

    /* مقاييس */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --radius-sm: 6px;
    --radius-md: 12px;
    --shadow-md: 0 4px 12px rgb(0 0 0 / 10%);
}

body {
    background: var(--color-bg);
    color: var(--color-text);
}

/* ===== مكوّن الزر: متغيرات كخيارات ===== */
.btn {
    --btn-bg: var(--color-brand);
    --btn-fg: white;
    --btn-pad: var(--space-2) var(--space-4);

    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--btn-pad);
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: var(--btn-bg);
    color: var(--btn-fg);
    font: inherit;
    cursor: pointer;
    transition: background-color 200ms ease-out;

    &:hover {
        background: color-mix(in oklch, var(--btn-bg), black 15%);
    }

    &:focus-visible {
        outline: 3px solid color-mix(in oklch, var(--btn-bg) 60%, transparent);
        outline-offset: 2px;
    }

    &.danger {
        --btn-bg: var(--color-danger);
    }

    &.ghost {
        --btn-bg: transparent;
        --btn-fg: var(--color-brand);
        border-color: currentColor;
    }

    &.small {
        --btn-pad: var(--space-1) var(--space-3);
    }
}

/* ===== مكوّن البطاقة ===== */
.card {
    padding: var(--space-4);
    border-radius: var(--radius-md);
    background: var(--color-surface);

    &:hover {
        box-shadow: var(--shadow-md);
    }

    @media (min-width: 768px) {
        padding: var(--space-6);
    }
}`,
      quiz: {
        question: 'ما فائدة فصل الرموز إلى أولية (--indigo-500) ودلالية (--color-brand)؟',
        options: [
          'تقليل حجم الملف',
          'المكوّنات تعتمد على الدور، فتغيير هوية الموقع أو السمة يتم بتعديل الطبقة الدلالية فقط',
          'لأن المتصفح يتطلب ذلك',
          'لتسريع الحركات',
        ],
        correctAnswer: 1,
        explanation: 'المكوّن يقول "لون العلامة" لا "بنفسجي"؛ القرار اللوني في مكان واحد.',
      },
    },
  },
  newLessons: [
    {
      id: 'css-adv-project',
      title: 'مشروع: معرض مكوّنات تفاعلية',
      description: 'ابنِ صفحة مكوّنات (أزرار، بطاقات قابلة للقلب، شريط تحميل، نافذة dialog) بنظام رموز وحركات تحترم تفضيلات المستخدم',
      language: 'css',
      xpReward: 150,
      content: md`
# مشروع: معرض مكوّنات تفاعلية

ستبني صفحة واحدة تعرض مكتبة مكوّنات صغيرة — مثل صفحات أنظمة التصميم في الشركات — تجمع كل ما في الدورة.

## المكوّنات المطلوبة
1. **أزرار** بأربعة أشكال (أساسي، خطر، شفاف، صغير) بمتغيرات المكوّن، مع hover و focus-visible و active.
2. **بطاقة قابلة للقلب** ثلاثية الأبعاد: صورة في الأمام ووصف في الخلف، تنقلب عند المرور **وعند التركيز** (\`:focus-within\`) حتى تعمل بلوحة المفاتيح.
3. **بطاقة متكيفة** بـ container query: رأسية في الحاوية الضيقة وأفقية في العريضة.
4. **مؤشر تحميل** و **شريط تقدم متحرك**.
5. **نافذة حوار** بعنصر \`<dialog>\` الأصلي مع خلفية \`::backdrop\` وحركة ظهور.
6. **مبدّل الوضع الليلي** يعتمد على \`light-dark()\` و \`color-scheme\`.

## نافذة dialog بلا مكتبات
\`\`\`html
<button type="button" class="btn" onclick="document.getElementById('info').showModal()">افتح النافذة</button>
<dialog id="info" aria-labelledby="info-title">
    <h2 id="info-title">مرحباً</h2>
    <p>هذه نافذة أصلية: تحبس التركيز وتُغلق بزر Esc تلقائياً.</p>
    <form method="dialog">
        <button class="btn" type="submit">إغلاق</button>
    </form>
</dialog>
\`\`\`
\`\`\`css
dialog {
    border: none;
    border-radius: var(--radius-md, 12px);
    padding: 24px;
    max-width: min(90vw, 480px);
}
dialog::backdrop {
    background: rgb(0 0 0 / 50%);
}
dialog[open] {
    animation: pop 200ms ease-out;
}
@keyframes pop {
    from { opacity: 0; scale: 0.95; }
}
\`\`\`
\`<dialog>\` مع \`showModal()\` يمنحك مجاناً: طبقة فوق كل شيء (لا z-index)، حبس التركيز داخلها، الإغلاق بـ Esc، وخلفية \`::backdrop\`.

## البطاقة القابلة للقلب بلوحة المفاتيح
\`\`\`css
.flip { perspective: 900px; }
.flip-inner {
    position: relative;
    transform-style: preserve-3d;
    transition: rotate 600ms ease-in-out;
}
.flip:hover .flip-inner,
.flip:focus-within .flip-inner {
    rotate: y 180deg;
}
.flip-face {
    backface-visibility: hidden;
}
.flip-back {
    position: absolute;
    inset: 0;
    rotate: y 180deg;
}
\`\`\`
ضع داخل البطاقة رابطاً أو زراً: عندما يصل إليه التركيز بـ Tab تنقلب البطاقة.

## قائمة التحقق
- [ ] كل الألوان والمسافات من \`tokens.css\` — لا قيم سحرية في المكوّنات.
- [ ] كل عنصر تفاعلي له \`:focus-visible\` واضح.
- [ ] كل الحركات تحرّك transform/opacity فقط.
- [ ] \`prefers-reduced-motion: reduce\` يوقف الحركات (والبطاقة تُظهر الوجهين بدون قلب).
- [ ] الوضعان الفاتح والداكن بتباين كافٍ.
- [ ] الصفحة تعمل بعرض 320px وفي \`dir="ltr"\` أيضاً (خصائص منطقية).

## تحديات إضافية
- إشعار (toast) ينزلق من حافة الشاشة في اتجاه القراءة الصحيح لكل لغة.
- حركة ظهور مرتبطة بالتمرير بـ \`animation-timeline: view()\` داخل \`@supports\`.
- حلقة تقدم دائرية متحركة بـ \`@property\` و \`conic-gradient\`.

أنت الآن تملك أدوات CSS الحديثة كاملة تقريباً. الخطوة التالية: **JavaScript** لإضافة السلوك والتفاعل الحقيقي.
`,
      codeExample: `@import url("tokens.css");

/* ===== البطاقة القابلة للقلب ===== */
.flip {
    perspective: 900px;
    inline-size: 260px;
    block-size: 320px;
}

.flip-inner {
    position: relative;
    block-size: 100%;
    transform-style: preserve-3d;
    transition: rotate 600ms ease-in-out;
}

.flip:hover .flip-inner,
.flip:focus-within .flip-inner {
    rotate: y 180deg;
}

.flip-face {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: var(--space-4, 1rem);
    border-radius: var(--radius-md, 12px);
    background: var(--color-surface, white);
    backface-visibility: hidden;
}

.flip-back {
    rotate: y 180deg;
}

/* ===== مؤشر التحميل وشريط التقدم ===== */
@keyframes spin {
    to { rotate: 1turn; }
}

.spinner {
    inline-size: 32px;
    aspect-ratio: 1;
    border: 3px solid color-mix(in oklch, currentColor 20%, transparent);
    border-block-start-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes progress {
    from { scale: 0 1; }
    to { scale: 1 1; }
}

.progress-bar {
    block-size: 6px;
    background: var(--color-brand, #6366f1);
    transform-origin: inline-start;
    animation: progress 2s ease-out both;
}

/* ===== النافذة ===== */
dialog {
    border: none;
    border-radius: var(--radius-md, 12px);
    padding: var(--space-6, 1.5rem);
    max-inline-size: min(90vw, 480px);
}

dialog::backdrop {
    background: rgb(0 0 0 / 50%);
}

dialog[open] {
    animation: pop 200ms ease-out;
}

@keyframes pop {
    from { opacity: 0; scale: 0.95; }
}

/* ===== احترام تقليل الحركة ===== */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }

    /* بلا قلب: نعرض الوجهين تحت بعضهما */
    .flip-inner { transform-style: flat; }
    .flip-face { position: static; backface-visibility: visible; }
    .flip-back { rotate: none; }
}`,
      quiz: {
        question: 'ما الذي يقدمه عنصر <dialog> مع showModal() مجاناً؟',
        options: [
          'حركة ظهور تلقائية فقط',
          'طبقة فوق كل المحتوى، حبس التركيز داخله، الإغلاق بـ Esc، وخلفية ::backdrop',
          'تصميم جاهز بألوان الموقع',
          'إرسال النموذج للخادم',
        ],
        correctAnswer: 1,
        explanation: 'dialog الأصلي يحل مشاكل الطبقات والوصولية التي كانت تتطلب مكتبات JavaScript.',
      },
    },
  ],
};

/**
 * متطلبات بنيوية للتحديات التي لا يمكن تشغيلها داخل التطبيق
 * (React / CSS / HTML / Dart / Express / React Native TS / Dockerfile / Git)
 *
 * المشكلة التي كشفها التدقيق: "الاختبارات" كانت نصوصاً وصفية ("Color changes"،
 * "Live URL"، "_count == 5") والتحقق كان عاماً (عدد الوسوم/الخصائص فقط)،
 * وتحديات Node.js كانت اختباراتها سكربتات Python لا علاقة لها بالكود.
 *
 * الحل: لكل تحدٍ متطلبات صريحة مطابقة لوصفه، تظهر للمستخدم كقائمة مهام،
 * ويُفحص كوده مقابلها (بعد حذف التعليقات). الوصف يذكر المتطلبات نفسها.
 */

import type { ChallengeCheck } from '../services/challengeValidator';
import type { ChallengeFix } from './challengeFixHelpers';

const R = String.raw;
const c = (pattern: string, message: string, extra: Partial<ChallengeCheck> = {}): ChallengeCheck => ({
  pattern,
  message,
  ...extra,
});

/** تحدٍ بنيوي: المتطلبات هي الاختبارات */
const structural = (description: string, checks: ChallengeCheck[], extra: ChallengeFix = {}): ChallengeFix => ({
  description,
  checks,
  validation: 'structural',
  testCases: [],
  ...extra,
});

export const STRUCTURAL_CHALLENGE_FIXES: Record<string, ChallengeFix> = {
  // ============================== React ==============================
  'react-ch-beg-1': structural('أكمل المكون ProfileCard ليعرض صورة المستخدم (avatar) مع نص بديل، والاسم (name)، والمسمى الوظيفي (title).', [
    c(R`<img[^>]*src=\{\s*avatar\s*\}`, 'اعرض الصورة بـ <img src={avatar}>'),
    c(R`<img[^>]*alt=`, 'أضف نصاً بديلاً alt للصورة'),
    c(R`\{\s*name\s*\}`, 'اعرض الاسم {name}'),
    c(R`\{\s*title\s*\}`, 'اعرض المسمى {title}'),
  ]),
  'react-ch-beg-2': structural('اجعل الزر يغيّر لون خلفيته عند الضغط: خزّن اللون في useState، وغيّره في onClick، وطبّقه في style.', [
    c(R`useState\s*\(`, 'استخدم useState لتخزين اللون'),
    c(R`onClick\s*=\s*\{`, 'أضف onClick للزر'),
    c(R`\bset[A-Z]\w*\s*\(`, 'حدّث اللون باستدعاء دالة set...'),
    c(R`(backgroundColor|background)\s*:`, 'طبّق اللون على backgroundColor في style'),
  ]),
  'react-ch-beg-3': structural('اجعل الزر يُظهر النص ويخفيه: حالة منطقية (true/false) في useState، تُعكس عند الضغط، وعرض شرطي للنص.', [
    c(R`useState\s*\(\s*(false|true)\s*\)`, 'استخدم useState بقيمة منطقية (false أو true)'),
    c(R`onClick\s*=\s*\{`, 'أضف onClick للزر'),
    c(R`set\w+\s*\(\s*(!\s*\w+|\(?\s*\w+\s*\)?\s*=>\s*!\s*\w+)`, 'اعكس الحالة عند الضغط (مثلاً setShow(!show))'),
    c(R`\{\s*!?\w+\s*&&|\?\s*\(?\s*<`, 'اعرض النص شرطياً باستخدام && أو ?:'),
  ]),
  'react-ch-beg-4': structural('اعرض عناصر المصفوفة fruits داخل <ul> باستخدام map، وأعطِ كل <li> مفتاح key.', [
    c(R`fruits\s*\.\s*map\s*\(`, 'استخدم fruits.map()'),
    c(R`<li[^>]*\bkey\s*=`, 'أضف key لكل <li>'),
    c(R`<li`, 'اعرض كل فاكهة داخل <li>'),
  ]),
  'react-ch-beg-5': structural('اجعل حقل الإدخال متحكَّماً به: قيمة في useState، مربوطة بـ value، وتتحدّث في onChange، وتُعرض بعد "كتبت:".', [
    c(R`useState\s*\(`, 'أضف state لقيمة الحقل'),
    c(R`<input[^>]*value\s*=\s*\{`, 'اربط value بالـ state'),
    c(R`onChange\s*=\s*\{`, 'حدّث القيمة في onChange'),
    c(R`(e|event|evt)\s*\.\s*target\s*\.\s*value`, 'اقرأ القيمة من e.target.value'),
    c(R`كتبت:\s*\{\s*\w+`, 'اعرض القيمة بعد "كتبت:"'),
  ]),
  'react-ch-int-1': structural('أضف بحثاً يفلتر القائمة أثناء الكتابة: نص البحث في useState، و filter مع includes بدون حساسية لحالة الأحرف، ثم اعرض النتائج بـ map.', [
    c(R`useState\s*\(`, 'خزّن نص البحث في useState'),
    c(R`onChange\s*=\s*\{|onInput\s*=\s*\{`, 'حدّث نص البحث أثناء الكتابة (onChange)'),
    c(R`\.filter\s*\(`, 'فلتر العناصر بـ filter()'),
    // أي طريقة لتجاهل حالة الأحرف: toLowerCase / toUpperCase / regex بعلم i
    c(R`to(Locale)?(Lower|Upper)Case\s*\(|RegExp\s*\([^)]*,\s*['"][a-z]*i|\/[gmsuy]*i[gmsuy]*\s*\.test\s*\(|localeCompare`, 'قارن بدون حساسية لحالة الأحرف'),
    c(R`\.map\s*\(`, 'اعرض النتائج بـ map()'),
  ]),
  'react-ch-int-2': structural('نموذج تسجيل مع تحقق: حقلا email و password، تحقق أن البريد فيه @ وأن كلمة المرور 6 أحرف على الأقل، واعرض رسالة الخطأ تحت الحقل.', [
    c(R`useState\s*\(|useReducer\s*\(`, 'خزّن بيانات النموذج والأخطاء في state'),
    c(R`type\s*=\s*["']email["']`, 'أضف حقل type="email"'),
    c(R`type\s*=\s*["']password["']`, 'أضف حقل type="password"'),
    c(R`(includes|indexOf|split|search)\s*\(\s*["']@["']|\.test\s*\(|\.match\s*\(`, 'تحقق من وجود @ في البريد'),
    c(R`\.length\s*(<\s*6|<=\s*5|>=\s*6|>\s*5)`, 'تحقق أن كلمة المرور 6 أحرف على الأقل'),
    // أي اسم لمتغير الخطأ: errors.email أو emailError ...
    c(R`\{\s*[\w.]*[eE]rrors?\b[\w.]*\s*(&&|\?|\})`, 'اعرض رسائل الأخطاء تحت الحقول'),
  ]),
  'react-ch-int-3': structural('مؤقت عد تنازلي: الوقت وحالة التشغيل في useState، و setInterval داخل useEffect مع تنظيفه بـ clearInterval، وزرّا بدء/إيقاف وإعادة.', [
    c(R`useState\s*\(`, 'خزّن الوقت في useState'),
    c(R`useEffect\s*\(`, 'استخدم useEffect للعد'),
    c(R`setInterval\s*\(`, 'استخدم setInterval'),
    c(R`clearInterval\s*\(`, 'نظّف المؤقت بـ clearInterval'),
    c(R`onClick\s*=\s*\{`, 'أضف أزرار التحكم', { min: 2 }),
  ]),
  'react-ch-int-4': structural('أكمل مكون Modal قابل لإعادة الاستخدام: لا يعرض شيئاً إذا كان isOpen خاطئاً، يعرض title و children، يُغلق بـ onClose، ولا يُغلق عند النقر داخله (stopPropagation).', [
    c(R`if\s*\(\s*!\s*isOpen\s*\)\s*return\s+null|isOpen\s*&&|isOpen\s*\?`, 'لا تعرض شيئاً عندما يكون isOpen = false'),
    c(R`\{\s*title\s*\}`, 'اعرض العنوان {title}'),
    c(R`\{\s*children\s*\}`, 'اعرض المحتوى {children}'),
    c(R`onClick\s*=\s*\{\s*onClose\s*\}`, 'أغلق النافذة بـ onClose'),
    c(R`stopPropagation\s*\(`, 'امنع الإغلاق عند النقر داخل النافذة (stopPropagation)'),
  ]),
  'react-ch-int-5': structural('وضع مظلم بـ Context: ThemeProvider يخزن الحالة في useState ويوفرها عبر ThemeContext.Provider، و ThemeToggle يقرأها بـ useContext ويبدّلها عند الضغط.', [
    c(R`useState\s*\(`, 'خزّن حالة الثيم في useState'),
    c(R`ThemeContext\s*\.\s*Provider`, 'وفّر القيمة عبر ThemeContext.Provider'),
    c(R`useContext\s*\(\s*ThemeContext\s*\)`, 'اقرأ الثيم بـ useContext(ThemeContext)'),
    c(R`onClick\s*=\s*\{`, 'بدّل الثيم عند الضغط'),
    c(R`\{\s*children\s*\}`, 'اعرض children داخل الـ Provider'),
  ]),
  'react-challenge-1': structural('عداد في state يبدأ من 0، بثلاثة أزرار (onClick): - ينقص 1، و 0 يصفّر، و + يزيد 1، والقيمة تظهر بعد "العداد:".', [
    c(R`useState\s*\(\s*0\s*\)`, 'ابدأ العداد بـ useState(0)'),
    c(R`العداد:\s*\{\s*\w+\s*\}`, 'اعرض القيمة بعد "العداد:"'),
    c(R`onClick\s*=\s*\{`, 'أضف onClick للأزرار الثلاثة', { min: 3 }),
    c(R`\+\s*1`, 'زر + يزيد بمقدار 1'),
    c(R`-\s*1`, 'زر - ينقص بمقدار 1'),
    c(R`set\w+\s*\(\s*0\s*\)`, 'زر 0 يصفّر العداد'),
  ]),
  'react-challenge-2': structural('قائمة مهام في state: حقل إدخال مربوط بالـ state، وإضافة مهمة إلى نسخة جديدة من المصفوفة (بدون إضافة نص فارغ)، وعرض المهام، وحذف مهمة، وتبديل إنجازها.', [
    c(R`useState\s*\(|useReducer\s*\(`, 'استخدم state للمهام والإدخال'),
    c(R`onChange\s*=\s*\{`, 'اربط حقل الإدخال بالـ state (onChange)'),
    c(R`\.\.\.\s*\w+|\.concat\s*\(`, 'أضف المهمة الجديدة إلى نسخة من المصفوفة'),
    c(R`\.trim\s*\(\s*\)|\.length\s*(>|===?|!==?)\s*0|if\s*\(\s*!\s*[\w.]+\s*\)`, 'تجاهل النص الفارغ'),
    c(R`\.filter\s*\(|\.splice\s*\(`, 'احذف المهمة'),
    c(R`\.map\s*\(`, 'اعرض المهام بـ map()'),
  ]),
  'react-challenge-3': structural('اجلب المستخدمين من API عند أول عرض (useEffect مع []) واعرض ثلاث حالات: جارٍ التحميل، خطأ، القائمة.', [
    c(R`useEffect\s*\(`, 'اجلب البيانات داخل useEffect'),
    c(R`,\s*\[\s*\]\s*\)`, 'مرّر [] ليعمل الجلب مرة واحدة'),
    c(R`fetch\s*\(|axios`, 'اجلب البيانات من الـ API (fetch)'),
    c(R`[lL]oading|[pP]ending|جار`, 'اعرض حالة التحميل'),
    c(R`catch\b|[eE]rror`, 'تعامل مع الأخطاء واعرضها'),
    c(R`\.map\s*\(`, 'اعرض المستخدمين بـ map()'),
  ]),
  'react-ch-4': structural('أنشئ Hook اسمه useLocalStorage(key, initialValue) يقرأ القيمة من localStorage عند البداية (JSON.parse)، ويحفظها عند التغيير (JSON.stringify)، ويرجع [value, setValue].', [
    c(R`useState\s*\(|useReducer\s*\(`, 'احفظ القيمة في state داخل الـ Hook'),
    c(R`localStorage\s*\.\s*getItem\s*\(`, 'اقرأ القيمة بـ localStorage.getItem'),
    c(R`localStorage\s*\.\s*setItem\s*\(`, 'احفظ القيمة بـ localStorage.setItem'),
    c(R`JSON\s*\.\s*parse`, 'حوّل النص المخزن بـ JSON.parse'),
    c(R`JSON\s*\.\s*stringify`, 'خزّن القيمة بـ JSON.stringify'),
    c(R`return\s*\[`, 'أرجع [value, setValue]'),
  ]),
  'react-ch-5': structural('أنشئ ThemeContext بـ createContext فيه theme ("light"/"dark") و toggleTheme، و ThemeProvider يخزّن الثيم في state ويوفّرهما، و Hook اسمه useTheme يصل إليهما بـ useContext.', [
    c(R`createContext\s*\(`, 'أنشئ الـ Context بـ createContext'),
    c(R`useState\s*\(|useReducer\s*\(`, 'خزّن الثيم في state'),
    c(R`\.\s*Provider`, 'وفّر القيمة عبر Provider'),
    c(R`toggleTheme`, 'أضف الدالة toggleTheme'),
    c(R`["']dark["']`, 'ادعم الوضع "dark"'),
    c(R`(function\s+useTheme|const\s+useTheme)`, 'أنشئ Hook اسمه useTheme'),
    c(R`useContext\s*\(`, 'استخدم useContext داخل useTheme'),
  ]),
  'react-ch-6': structural('نموذج تسجيل بالحقول name و email و password و confirmPassword، يتحقق من كل حقل (ومن تطابق كلمتي المرور)، ويعرض الأخطاء، ويمنع الإرسال إذا كان غير صالح.', [
    c(R`useState\s*\(|useReducer\s*\(`, 'خزّن البيانات والأخطاء في state'),
    c(R`confirmPassword`, 'أضف حقل confirmPassword'),
    c(R`type\s*=\s*["']email["']`, 'أضف حقل type="email"'),
    c(R`onSubmit\s*=\s*\{|onClick\s*=\s*\{`, 'أضف معالج الإرسال'),
    c(R`password\s*!==?\s*[\w.]*confirmPassword|confirmPassword\s*!==?\s*[\w.]*password|password\s*===?\s*[\w.]*confirmPassword|confirmPassword\s*===?\s*[\w.]*password`, 'تحقق من تطابق كلمتي المرور'),
    c(R`\{\s*[\w.]*[eE]rrors?\b[\w.]*\s*(&&|\?|\})`, 'اعرض رسائل الأخطاء'),
  ]),
  'react-ch-7': structural('قائمة بتحميل لا نهائي: استخدم IntersectionObserver مع useRef لمراقبة آخر عنصر، وعند ظهوره حمّل الصفحة التالية ما دام هناك المزيد.', [
    c(R`IntersectionObserver`, 'استخدم IntersectionObserver'),
    c(R`useRef\s*\(`, 'احفظ الـ observer أو العنصر في useRef'),
    c(R`isIntersecting|intersectionRatio`, 'تحقق من ظهور العنصر'),
    c(R`set\w*[pP]age\s*\(|[pP]age\s*\+\s*1|\+\+\s*\w*[pP]age|[pP]age\w*\s*\+\+|load\w*\s*\(|fetch\w*\s*\(`, 'حمّل الصفحة التالية'),
    c(R`[hH]asMore|[lL]oading|[mM]ore|[dD]one|[eE]nd\b`, 'توقف عند التحميل أو عند انتهاء البيانات'),
  ]),

  // ============================== CSS ==============================
  'css-ch-beg-1': structural('نسّق النصوص: .title بحجم خط كبير، وسط الصفحة، مع letter-spacing؛ و .paragraph مع line-height؛ و .highlight بخلفية ملونة.', [
    c(R`\.title\s*\{[^}]*font-size\s*:`, 'حدد font-size للعنوان'),
    c(R`\.title\s*\{[^}]*text-align\s*:\s*center`, 'توسيط العنوان (text-align: center)'),
    c(R`letter-spacing\s*:`, 'أضف letter-spacing'),
    c(R`\.paragraph\s*\{[^}]*line-height\s*:`, 'حدد line-height للفقرة'),
    c(R`\.highlight\s*\{[^}]*background`, 'أضف خلفية للنص المميز'),
  ]),
  'css-ch-beg-2': structural('قائمة بعلامات مخصصة: أزل العلامات الافتراضية، وأضف علامة خاصة عبر li::before، ومسافة داخلية للعناصر.', [
    c(R`list-style(-type)?\s*:\s*none`, 'أزل العلامات الافتراضية (list-style: none)'),
    c(R`li\s*::?before\s*\{[^}]*content\s*:`, 'أضف علامة مخصصة عبر li::before مع content'),
    c(R`\.custom-list\s+li\s*\{[^}]*padding`, 'أضف padding لعناصر القائمة'),
  ]),
  'css-ch-beg-3': structural('الظلال والحدود: box-shadow للصندوق، و text-shadow للنص، و .bordered بحدود وزوايا دائرية وحد ثانٍ عبر outline.', [
    c(R`\.box-shadow\s*\{[^}]*box-shadow\s*:`, 'أضف box-shadow للصندوق'),
    c(R`\.text-shadow\s*\{[^}]*text-shadow\s*:`, 'أضف text-shadow للنص'),
    c(R`\.bordered\s*\{[^}]*border\s*:`, 'أضف border للعنصر .bordered'),
    c(R`border-radius\s*:`, 'أضف border-radius'),
    c(R`outline\s*:`, 'أضف حداً ثانياً باستخدام outline'),
  ]),
  'css-ch-int-1': structural('تخطيط Flexbox: الحاوية display:flex مع justify-content و align-items:center و gap و flex-wrap:wrap، والعناصر بخاصية flex.', [
    c(R`\.container\s*\{[^}]*display\s*:\s*flex`, 'اجعل الحاوية display: flex'),
    c(R`justify-content\s*:`, 'حدد justify-content'),
    c(R`align-items\s*:\s*center`, 'توسيط عمودي (align-items: center)'),
    c(R`gap\s*:`, 'أضف gap بين العناصر'),
    c(R`flex-wrap\s*:\s*wrap`, 'اسمح بالالتفاف (flex-wrap: wrap)'),
    c(R`\.item\s*\{[^}]*flex\s*:`, 'حدد flex للعناصر'),
  ]),
  'css-ch-int-2': structural('شبكة CSS Grid: الحاوية display:grid مع grid-template-columns و gap، والعناصر تكبر قليلاً عند المرور (transform في :hover) مع transition.', [
    c(R`display\s*:\s*grid`, 'استخدم display: grid'),
    c(R`grid-template-columns\s*:`, 'حدد grid-template-columns'),
    c(R`gap\s*:`, 'أضف gap'),
    c(R`:hover\s*\{[^}]*transform\s*:`, 'أضف transform عند :hover'),
    c(R`transition\s*:`, 'أضف transition'),
  ]),
  'css-ch-int-3': structural('تصميم متجاوب: داخل @media (max-width: 768px) غيّر تخطيط .card إلى عمود واحد.', [
    c(R`@media\s*\(\s*max-width\s*:\s*768px\s*\)`, 'استخدم @media (max-width: 768px)'),
    c(R`@media[^{]*\{[\s\S]*\.card\s*\{`, 'عدّل .card داخل الـ media query'),
    c(R`grid-template-columns\s*:\s*1fr\s*;|flex-direction\s*:\s*column`, 'حوّل التخطيط إلى عمود واحد على الموبايل'),
    c(R`^\s*\.card\s*\{[^}]*(display|grid|flex|padding)`, 'نسّق .card للشاشات الكبيرة', { flags: 'im' }),
  ]),
  'css-ch-int-4': structural('حقل إدخال جميل: حدود للحقل، وتأثير عند التركيز (border-color أو box-shadow)، و transition، وتسمية .input-label بموضع absolute تتحرك بـ transform.', [
    c(R`\.input-field\s*\{[^}]*border\s*:`, 'أضف border للحقل'),
    c(R`\.input-field:focus\s*\{[^}]*(border-color|box-shadow|outline)`, 'غيّر الشكل عند التركيز'),
    c(R`transition\s*:`, 'أضف transition'),
    c(R`\.input-label\s*\{[^}]*position\s*:\s*absolute`, 'اجعل التسمية position: absolute'),
    c(R`transform\s*:`, 'حرّك التسمية بـ transform'),
  ]),
  'css-ch-1': structural('زر جذاب: خلفية linear-gradient، زوايا دائرية، cursor: pointer، و transition، ويتحرك أو يظهر له ظل عند المرور.', [
    c(R`\.button\s*\{[^}]*background`, 'أضف خلفية للزر'),
    c(R`linear-gradient\s*\(`, 'استخدم linear-gradient'),
    c(R`border-radius\s*:`, 'أضف زوايا دائرية'),
    c(R`cursor\s*:\s*pointer`, 'أضف cursor: pointer'),
    c(R`transition\s*:`, 'أضف transition'),
    c(R`\.button:hover\s*\{[^}]*(transform|box-shadow)\s*:`, 'أضف تأثيراً عند المرور (transform أو box-shadow)'),
  ]),
  'css-ch-2': structural('بطاقة منتج: زوايا دائرية وظل للبطاقة، تأثير عند المرور مع transition، صورة بعرض كامل، ومسافة داخلية للمعلومات.', [
    c(R`\.product-card\s*\{[^}]*border-radius\s*:`, 'زوايا دائرية للبطاقة'),
    c(R`\.product-card\s*\{[^}]*box-shadow\s*:`, 'ظل للبطاقة'),
    c(R`\.product-card:hover\s*\{`, 'تأثير عند المرور على البطاقة'),
    c(R`transition\s*:`, 'أضف transition'),
    c(R`\.product-image\s*\{[^}]*(width|object-fit)\s*:`, 'نسّق الصورة (width أو object-fit)'),
    c(R`\.product-info\s*\{[^}]*padding\s*:`, 'أضف padding للمعلومات'),
  ]),
  'css-ch-3': structural('قائمة تنقل متحركة: .nav بـ display:flex، والروابط بدون خط سفلي، وخط متحرك عبر ::after يظهر عند المرور مع transition.', [
    c(R`\.nav\s*\{[^}]*display\s*:\s*flex`, 'اجعل القائمة display: flex'),
    c(R`text-decoration\s*:\s*none`, 'أزل الخط السفلي الافتراضي'),
    c(R`::?after\s*\{`, 'أنشئ الخط المتحرك عبر ::after'),
    c(R`\.nav-link:hover`, 'أضف تأثيراً عند المرور'),
    c(R`transition\s*:`, 'أضف transition'),
  ]),
  'css-ch-4': structural('مؤشر تحميل دوّار: دائرة (border-radius: 50%) بحد علوي ملون، و @keyframes spin تدوّر حتى 360deg، وحركة لا نهائية.', [
    c(R`border-radius\s*:\s*50%`, 'اجعله دائرياً (border-radius: 50%)'),
    c(R`border-top(-color)?\s*:`, 'لوّن الحد العلوي'),
    c(R`@keyframes\s+spin[\s\S]*rotate\s*\(\s*360deg\s*\)`, 'أنشئ @keyframes spin تنتهي بـ rotate(360deg)'),
    c(R`animation\s*:[^;]*spin`, 'طبّق الحركة spin'),
    c(R`infinite`, 'اجعل الحركة لا نهائية (infinite)'),
  ]),
  'css-ch-5': structural('وضع مظلم بمتغيرات CSS: عرّف متغيرات في :root، وأعد تعريفها في .dark-mode، واستخدمها بـ var()، ونسّق .toggle-switch مع transition.', [
    c(R`:root\s*\{[^}]*--[\w-]+\s*:`, 'عرّف متغيرات في :root'),
    c(R`\.dark-mode\s*\{[^}]*--[\w-]+\s*:`, 'أعد تعريف المتغيرات في .dark-mode'),
    c(R`var\s*\(\s*--`, 'استخدم المتغيرات بـ var()'),
    c(R`\.toggle-switch\s*\{[^}]*(width|border-radius)\s*:`, 'نسّق زر التبديل'),
    c(R`transition\s*:`, 'أضف transition'),
  ]),

  // ============================== HTML ==============================
  'deploy-challenge-1': structural(
    'أنشئ صفحة Portfolio كاملة جاهزة للنشر: <!DOCTYPE html>، ووسم <meta name="viewport"> للموبايل، و <header>، وثلاثة أقسام <section> (المشاريع، المهارات، التواصل)، و <footer>. (خطوات الرفع على GitHub والنشر على Vercel موضحة في التلميحات ولا يمكن التحقق منها داخل التطبيق.)',
    [
      c(R`<!DOCTYPE\s+html>`, 'ابدأ بـ <!DOCTYPE html>'),
      c(R`<meta[^>]*name\s*=\s*["']viewport["']`, 'أضف وسم viewport'),
      c(R`<header`, 'أضف <header>'),
      c(R`<section`, 'أضف ثلاثة أقسام <section>', { min: 3 }),
      c(R`مشاريع|projects`, 'أضف قسم المشاريع'),
      c(R`مهارات|skills`, 'أضف قسم المهارات'),
      c(R`تواصل|contact`, 'أضف قسم التواصل'),
      c(R`<footer`, 'أضف <footer>'),
    ],
    { hints: ['ارفع الملف إلى مستودع GitHub جديد', 'في Vercel: Add New → Project → اختر المستودع → Deploy', 'استخدم وسوماً دلالية: header و section و footer'] }
  ),
  'html-ch-form-001': structural('نموذج تسجيل متكامل داخل <form>: اسم وبريد (type="email") مطلوبان (required)، حقلا كلمة مرور (type="password") بطول 8 أحرف على الأقل (minlength="8") مع تأكيدها، هاتف (type="tel") بنمط 11 رقماً (pattern)، تاريخ ميلاد (type="date")، جنس بخيارين (type="radio")، موافقة على الشروط (type="checkbox")، وزر إرسال (type="submit").', [
    c(R`<form`, 'أنشئ <form>'),
    c(R`type\s*=\s*["']email["']`, 'حقل type="email"'),
    c(R`\brequired\b`, 'اجعل الحقول الأساسية required', { min: 2 }),
    c(R`type\s*=\s*["']password["']`, 'حقلا كلمة المرور والتأكيد', { min: 2 }),
    c(R`minlength\s*=\s*["']?8`, 'كلمة المرور 8 أحرف على الأقل (minlength="8")'),
    c(R`type\s*=\s*["']tel["']`, 'حقل هاتف type="tel"'),
    c(R`pattern\s*=`, 'تحقق من رقم الهاتف بـ pattern'),
    c(R`type\s*=\s*["']date["']`, 'حقل تاريخ type="date"'),
    c(R`type\s*=\s*["']radio["']`, 'خياران للجنس type="radio"', { min: 2 }),
    c(R`type\s*=\s*["']checkbox["']`, 'موافقة على الشروط type="checkbox"'),
    c(R`<button[^>]*type\s*=\s*["']submit["']|<input[^>]*type\s*=\s*["']submit["']`, 'زر إرسال submit'),
  ]),
  'html-ch-semantic-001': structural('حوّل الصفحة إلى HTML5 دلالي: header و nav و main و article و aside و footer، وتاريخ المقال داخل <time>، ولا تُبقِ div بأسماء مثل header/nav/main.', [
    c(R`<header`, 'استبدل div.header بـ <header>'),
    c(R`<nav`, 'استبدل div.nav بـ <nav>'),
    c(R`<main`, 'استبدل div.main بـ <main>'),
    c(R`<article`, 'استخدم <article> للمقال'),
    c(R`<aside`, 'استخدم <aside> للشريط الجانبي'),
    c(R`<footer`, 'أضف <footer>'),
    c(R`<time`, 'ضع التاريخ داخل <time>'),
    c(R`<div[^>]*class\s*=\s*["'](header|nav|main|article|sidebar|footer)["']`, 'لا تستخدم div بأسماء العناصر الدلالية', { forbid: true }),
  ]),
  'html-ch-table-001': structural('جدول درجات: thead بأربعة أعمدة (الاسم، الرياضيات، العلوم، المعدل)، و tbody لثلاثة طلاب على الأقل، و tfoot للمعدل العام يستخدم colspan.', [
    c(R`<thead`, 'أضف <thead>'),
    c(R`<th[\s>]`, 'أربعة عناوين أعمدة <th>', { min: 4 }),
    c(R`<tbody`, 'أضف <tbody>'),
    c(R`<tr[\s>]`, 'صف العناوين + 3 طلاب + صف المعدل', { min: 5 }),
    c(R`<tfoot`, 'أضف <tfoot>'),
    c(R`colspan\s*=`, 'استخدم colspan في التذييل'),
  ]),
  'html-ch-media-001': structural('صفحة وسائط: <video> مع controls و poster ومصدرين <source> على الأقل، و <audio> مع controls، وصورة <img> بنص بديل alt داخل <figure> مع <figcaption>، ونص بديل للمتصفحات القديمة.', [
    c(R`<video[^>]*\bcontrols\b`, 'فيديو مع controls'),
    c(R`<video[^>]*\bposter\s*=`, 'أضف poster للفيديو'),
    c(R`<audio[^>]*\bcontrols\b`, 'صوت مع controls'),
    c(R`<source`, 'استخدم <source> لصيغ متعددة', { min: 2 }),
    c(R`<figure`, 'استخدم <figure>'),
    c(R`<figcaption`, 'أضف <figcaption>'),
    c(R`<img[^>]*alt\s*=`, 'صورة مع نص بديل alt'),
  ]),
  'html-ch-nav-001': structural('شريط تنقل داخل <nav>: شعار، وقائمة <ul> بأربعة روابط <a href> (الرئيسية، الدورات، المقالات، اتصل بنا)، وقائمة منسدلة <ul> تحت "الدورات" فيها روابط HTML و CSS و JavaScript، مع CSS يُظهرها عند المرور (:hover).', [
    c(R`<nav`, 'استخدم <nav>'),
    c(R`<ul`, 'قائمة رئيسية وقائمة منسدلة <ul>', { min: 2 }),
    c(R`<a[^>]*href`, '4 روابط رئيسية + 3 في القائمة المنسدلة + الشعار', { min: 7 }),
    c(R`الدورات`, 'رابط "الدورات"'),
    c(R`>\s*HTML\s*<`, 'رابط HTML في القائمة المنسدلة'),
    c(R`>\s*(JS|JavaScript)\s*<`, 'رابط JavaScript في القائمة المنسدلة'),
    c(R`:hover`, 'أظهر القائمة المنسدلة عند المرور (:hover)'),
  ]),
  'html-ch-faq-001': structural(
    'صفحة أسئلة شائعة: خمسة أسئلة على الأقل باستخدام <details> و <summary>، أحدها مفتوح افتراضياً (open)، مع تنسيق CSS (<style> أو style).',
    [
      c(R`<details`, 'خمسة عناصر <details>', { min: 5 }),
      c(R`<summary`, 'خمسة عناصر <summary>', { min: 5 }),
      c(R`<details[^>]*\sopen\b`, 'اجعل سؤالاً مفتوحاً بخاصية open'),
      c(R`<style|style\s*=`, 'أضف تنسيق CSS'),
    ],
    {
      // الحل النموذجي كان يذكر "خيارات اشتراك" — Kodax مجاني بالكامل
      // الحلول لا تُشحن داخل التطبيق (babel-plugin-strip-challenge-solutions): solution غير موجودة هناك
      transform: (ch) =>
        ch.solution
          ? {
              solution: ch.solution.replace(
                /نعم، الميزات الأساسية مجانية مع خيارات اشتراك للمحتوى المتقدم\./,
                'نعم، Kodax مجاني بالكامل، والدورات تُفتح بالتقدم في التعلم.'
              ),
            }
          : {},
    }
  ),
  'git-ch-basics-001': structural(
    'اكتب أوامر Git الخمسة بالترتيب الصحيح لرفع مشروع جديد (كل أمر في سطر): git init ثم git add ثم git commit ثم git remote add ثم git push.',
    [
      c(R`git\s+init[\s\S]*git\s+add[\s\S]*git\s+commit[\s\S]*git\s+remote\s+add[\s\S]*git\s+push`, 'الترتيب: init ← add ← commit ← remote add ← push'),
      c(R`git\s+commit\s+-m\s+["']`, 'أضف رسالة للـ commit بـ -m "..."'),
      c(R`git\s+push\s+(-u\s+)?origin`, 'ارفع إلى origin'),
    ],
    { language: 'Git' }
  ),

  // ============================== Dockerfile ==============================
  'deploy-challenge-4': structural(
    'اكتب Dockerfile لتطبيق Node.js: FROM node:18-alpine، ومجلد عمل WORKDIR، ثم COPY لملف package.json و RUN npm install (أو npm ci) قبل COPY . . لبقية الملفات (للاستفادة من cache)، و EXPOSE 3000، وأمر التشغيل CMD.',
    [
      c(R`^\s*FROM\s+node:18-alpine`, 'ابدأ بـ FROM node:18-alpine', { flags: 'im' }),
      c(R`^\s*WORKDIR\s+\S+`, 'حدد مجلد العمل WORKDIR', { flags: 'im' }),
      c(R`^\s*COPY\s+package[^\n]*\.json`, 'انسخ package.json أولاً', { flags: 'im' }),
      c(R`^\s*RUN\s+npm\s+(ci|install)`, 'ثبّت المكتبات بـ RUN npm ci أو npm install', { flags: 'im' }),
      c(R`COPY\s+package[\s\S]*RUN\s+npm[\s\S]*COPY\s+\.\s+\.`, 'ثبّت المكتبات قبل نسخ بقية الملفات (COPY . .)'),
      c(R`^\s*EXPOSE\s+3000`, 'اكشف المنفذ EXPOSE 3000', { flags: 'im' }),
      c(R`^\s*CMD\s+`, 'أضف أمر التشغيل CMD', { flags: 'im' }),
    ]
  ),

  // ============================== Dart / Flutter ==============================
  'flutter-challenge-001': structural(
    'منطق شاشة تسجيل الدخول: validateEmail ترجع "البريد الإلكتروني مطلوب" للقيمة الفارغة و "بريد إلكتروني غير صالح" إذا لم يحتوِ على @ ونقطة؛ validatePassword ترجع "كلمة المرور يجب أن تكون 6 أحرف على الأقل" للكلمة القصيرة؛ و attemptLogin تستخدم الدالتين وترجع {success, error}. (لا يمكن تشغيل Dart داخل التطبيق — يُفحص الكود بنيوياً.)',
    [
      c(R`isEmpty|==\s*['"]{2}|\.length\s*==\s*0`, 'تحقق من القيمة الفارغة'),
      c(R`البريد الإلكتروني مطلوب`, 'رسالة "البريد الإلكتروني مطلوب"'),
      c(R`(contains|indexOf|split)\s*\(\s*['"]@['"]|RegExp\s*\(|hasMatch\s*\(`, 'تحقق من وجود @'),
      c(R`كلمة المرور يجب أن تكون 6 أحرف على الأقل`, 'رسالة كلمة المرور القصيرة'),
      c(R`\.length\s*(<\s*6|<=\s*5|>=\s*6|>\s*5)`, 'تحقق أن الطول 6 على الأقل'),
      c(R`validateEmail\s*\(\s*email\s*\)`, 'استخدم validateEmail داخل attemptLogin'),
      c(R`['"]success['"]\s*:`, 'أرجع مفتاح success من attemptLogin'),
    ]
  ),
  'flutter-challenge-002': structural(
    'منطق قائمة المهام (بأسلوب غير قابل للتغيير): addTask ترجع قائمة جديدة فيها المهمة، و toggleTask تعكس isDone للمهمة ذات المعرّف، و removeTask تحذفها، و completedCount ترجع عدد المهام المنجزة. (يُفحص الكود بنيوياً.)',
    [
      c(R`\[\s*\.\.\.\s*tasks|List<Task>\.from\s*\(\s*tasks|tasks\s*\.\s*add\s*\(`, 'أضف المهمة الجديدة إلى القائمة'),
      c(R`Task\s*\(\s*id\s*:`, 'أنشئ Task جديدة بمعرّف'),
      c(R`isDone\s*=\s*!|isDone\s*:\s*!|!\s*\w+\s*\.\s*isDone`, 'اعكس isDone في toggleTask'),
      c(R`\.where\s*\(|removeWhere\s*\(|removeAt\s*\(|\.remove\s*\(`, 'احذف المهمة في removeTask'),
      c(R`\.where\s*\([^)]*isDone|isDone\s*\)\s*\.\s*length|fold\s*\(|for\s*\(|forEach\s*\(`, 'احسب المهام المنجزة في completedCount'),
    ]
  ),
  'flutter-challenge-003': structural(
    'منطق تطبيق الطقس: kelvinToCelsius (ك - 273.15)، و kelvinToFahrenheit، و parseWeatherJson لقراءة name و main.temp و weather[0].description و main.humidity، و getWeatherAdvice حسب الحرارة. (يُفحص الكود بنيوياً.)',
    [
      c(R`-\s*273\.15`, 'التحويل من كلفن بطرح 273.15'),
      // يقبل الأقواس وترتيب مختلف: (c * 9 / 5) + 32 أو c * 1.8 + 32
      c(R`(9\s*/\s*5|1\.8)[\s\S]{0,25}32|32\s*\+[\s\S]{0,25}(9\s*/\s*5|1\.8)`, 'التحويل إلى فهرنهايت (× 9/5 + 32)'),
      c(R`json\s*\[\s*['"]name['"]\s*\]`, "اقرأ json['name']"),
      c(R`\[\s*['"]main['"]\s*\]\s*\[\s*['"]temp['"]\s*\]`, "اقرأ json['main']['temp']"),
      c(R`\[\s*['"]weather['"]\s*\]\s*\[\s*0\s*\]`, "اقرأ json['weather'][0]"),
    ]
  ),
  'flutter-challenge-004': structural(
    'عربة تسوق: addItem تزيد الكمية إذا كان المنتج موجوداً وإلا تضيفه، و removeItem تحذفه، و totalPrice مجموع السعر × الكمية، و itemCount مجموع الكميات. (يُفحص الكود بنيوياً.)',
    [
      c(R`indexWhere\s*\(|firstWhere\s*\(|\.any\s*\(|\.where\s*\(|\.contains\s*\(|for\s*\(`, 'ابحث إن كان المنتج موجوداً في العربة'),
      c(R`quantity\s*(\+\+|\+=)|\+\+\s*[\w.]*quantity|quantity\s*=\s*[\w.]*quantity\s*\+|quantity\s*:\s*[\w.]*quantity\s*\+`, 'زد الكمية للمنتج الموجود'),
      c(R`removeWhere\s*\(|\.where\s*\(|removeAt\s*\(|\.remove\s*\(`, 'احذف المنتج في removeItem'),
      c(R`price\s*\*\s*[\w.]*quantity|quantity\s*\*\s*[\w.]*price`, 'اضرب السعر في الكمية'),
      c(R`fold\s*\(|reduce\s*\(|for\s*\(|forEach\s*\(`, 'اجمع العناصر لحساب المجموع'),
    ]
  ),
  'flutter-challenge-005': structural(
    'منطق تطبيق الدردشة: formatMessageTime ترجع الوقت بصيغة HH:MM (بأصفار في البداية)، و sortMessages ترتب الرسائل حسب الوقت دون تعديل القائمة الأصلية، و groupByDate تجمع الرسائل حسب اليوم، و unreadCount(messages, lastReadId) تعدّ الرسائل التي بعد آخر رسالة مقروءة (كلها إن لم توجد). (يُفحص الكود بنيوياً.)',
    [
      c(R`padLeft\s*\(\s*2\s*,\s*['"]0['"]\s*\)|<\s*10\s*\?|DateFormat\s*\(`, 'أضف صفراً في البداية (HH:MM)'),
      c(R`\.hour\b|DateFormat\s*\(|substring\s*\(\s*11`, 'استخرج الساعة من الوقت'),
      c(R`\.minute\b|DateFormat\s*\(|substring\s*\(\s*11`, 'استخرج الدقائق من الوقت'),
      c(R`List<Message>\.from\s*\(|\[\s*\.\.\.\s*messages|toList\s*\(`, 'انسخ القائمة قبل الترتيب'),
      c(R`\.sort\s*\(`, 'رتّب بـ sort()'),
      c(R`compareTo\s*\(|isBefore\s*\(|isAfter\s*\(|difference\s*\(|millisecondsSinceEpoch`, 'قارن أوقات الرسائل'),
      c(R`\.day\b|toIso8601String|substring\s*\(\s*0\s*,\s*10\s*\)|DateTime\s*\([^)]*\.year`, 'اجمع الرسائل حسب اليوم في groupByDate'),
      c(R`indexWhere\s*\([\s\S]{0,80}?lastReadId|\.where\s*\(|skipWhile\s*\(`, 'ابحث عن آخر رسالة مقروءة (lastReadId) في unreadCount'),
    ]
  ),
  'flutter-ch-counter-001': structural(
    'عداد Flutter: _increment يزيد العداد، و _decrement ينقصه دون أن يقل عن 0، و _reset يصفّره — كلها داخل setState — مع أنيميشن تكبير عبر AnimationController يُتخلّص منه في dispose. (يُفحص الكود بنيوياً.)',
    [
      c(R`_count\s*\+\+|_count\s*\+=\s*1`, 'زد العداد في _increment'),
      c(R`_count\s*>\s*0|max\s*\(`, 'امنع النزول تحت الصفر'),
      c(R`_count\s*=\s*0`, 'صفّر العداد في _reset'),
      c(R`setState\s*\(`, 'حدّث الواجهة بـ setState', { min: 3 }),
      c(R`AnimationController\s*\(`, 'أنشئ AnimationController للأنيميشن'),
      c(R`dispose\s*\(\s*\)`, 'تخلّص من الـ controller في dispose()'),
    ],
    { title: 'عداد Flutter مع أنيميشن' }
  ),

  // ============================== Node.js / Express ==============================
  // backend-ch-1 / 3 / 4 تُشغَّل فعلياً — انظر challengeFixesNode.ts
  'backend-ch-5': structural(
    'CRUD بـ Mongoose: Schema للمنتج (name و price مطلوبان، category، inStock)، و model، ومسارات POST و GET و PUT/PATCH و DELETE، مع 404 عند عدم وجود المنتج. (يُفحص الكود بنيوياً.)',
    [
      c(R`new\s+mongoose\s*\.\s*Schema\s*\(`, 'أنشئ Schema'),
      c(R`required\s*:\s*true`, 'اجعل name و price مطلوبين', { min: 2 }),
      c(R`mongoose\s*\.\s*model\s*\(`, 'أنشئ model'),
      c(R`app\s*\.\s*post\s*\(`, 'مسار الإنشاء POST'),
      c(R`app\s*\.\s*get\s*\(`, 'مسارات القراءة GET'),
      c(R`app\s*\.\s*(put|patch)\s*\(`, 'مسار التحديث PUT أو PATCH'),
      c(R`app\s*\.\s*delete\s*\(`, 'مسار الحذف DELETE'),
      c(R`status\s*\(\s*404\s*\)`, 'أرجع 404 إذا لم يوجد المنتج'),
    ]
  ),
  'backend-ch-6': structural(
    'دردشة Socket.io: حدث connection، وحدث message يبث الرسالة، وحدث للانضمام لغرفة بـ socket.join، وبث داخل الغرفة بـ to(room)، وحدث disconnect. (يُفحص الكود بنيوياً.)',
    [
      c(R`io\s*\.\s*on\s*\(\s*['"]connection['"]`, 'استمع لحدث connection'),
      c(R`socket\s*\.\s*on\s*\(\s*['"]message`, 'استمع لحدث message'),
      c(R`\.\s*emit\s*\(`, 'ابث الرسائل بـ emit'),
      c(R`socket\s*\.\s*join\s*\(`, 'انضم لغرفة بـ socket.join'),
      c(R`\.\s*(to|in)\s*\(`, 'ابث داخل الغرفة بـ to(room)'),
      c(R`socket\s*\.\s*on\s*\(\s*['"]disconnect['"]`, 'تعامل مع disconnect'),
    ]
  ),
  'backend-ch-7': structural(
    'رفع ملفات بـ Multer: diskStorage مع اسم ملف فريد، و fileFilter يقبل الصور فقط (حسب mimetype أو الامتداد)، وحد لحجم الملف، ومسار لرفع ملف واحد (single) ومسار لعدة ملفات (array). (يُفحص الكود بنيوياً.)',
    [
      c(R`multer\s*\.\s*diskStorage\s*\(`, 'أعدّ التخزين بـ multer.diskStorage'),
      c(R`filename\s*:`, 'حدد اسم الملف'),
      c(R`fileFilter`, 'أضف fileFilter'),
      c(R`mimetype|extname`, 'افحص نوع الملف (mimetype أو extname)'),
      c(R`limits\s*:`, 'حدد حجم الملف الأقصى (limits)'),
      c(R`\.\s*single\s*\(`, 'مسار لملف واحد upload.single'),
      c(R`\.\s*array\s*\(`, 'مسار لعدة ملفات upload.array'),
    ]
  ),
  'backend-ch-8': structural(
    'Caching بـ Redis: Middleware يبحث في الكاش أولاً (redis.get) ويرجع النتيجة المخزنة بعد JSON.parse، وإلا يستدعي next() ويحفظ الرد بعد JSON.stringify بمدة صلاحية (setex)، ويحذف الكاش عند التحديث (redis.del). (يُفحص الكود بنيوياً.)',
    [
      c(R`redis\s*\.\s*get\s*\(`, 'ابحث في الكاش بـ redis.get'),
      c(R`JSON\s*\.\s*parse`, 'حوّل القيمة المخزنة بـ JSON.parse'),
      c(R`redis\s*\.\s*(setex|set)\s*\(`, 'خزّن الرد بـ redis.setex'),
      c(R`JSON\s*\.\s*stringify`, 'خزّن الرد بـ JSON.stringify'),
      c(R`redis\s*\.\s*del\s*\(`, 'احذف الكاش عند التحديث بـ redis.del'),
      c(R`next\s*\(\s*\)`, 'استدعِ next() عند عدم وجود الكاش'),
    ]
  ),

  // ============================== React Native (TypeScript) ==============================
  'rn-ch-todo-001': structural(
    'تطبيق مهام React Native: addTodo يضيف مهمة إلى نسخة جديدة من todos عبر setTodos (بعد trim ويتجاهل النص الفارغ) ثم يفرّغ الحقل بـ setInputText، و toggleTodo يعكس completed، و deleteTodo يحذف المهمة، والعرض عبر FlatList مع keyExtractor.',
    [
      c(R`setTodos\s*\(\s*(\[\s*\.\.\.\s*todos|todos\s*\.\s*concat|\(?\s*\w+\s*\)?\s*=>\s*\[\s*\.\.\.)`, 'أضف المهمة إلى نسخة من todos'),
      c(R`\.trim\s*\(\s*\)`, 'تجاهل النص الفارغ (trim)'),
      c(R`setInputText\s*\(\s*['"]{2}\s*\)`, 'فرّغ حقل الإدخال بعد الإضافة'),
      c(R`completed\s*:\s*!`, 'اعكس completed في toggleTodo'),
      c(R`\.filter\s*\(|\.splice\s*\(`, 'احذف المهمة'),
      c(R`<FlatList`, 'اعرض المهام في FlatList'),
      c(R`keyExtractor`, 'أضف keyExtractor'),
    ]
  ),
};

/**
 * دروس CSS الكاملة - من الصفر إلى الاحتراف
 * Kodax CSS Curriculum
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس CSS - المستوى المبتدئ =====
export const CSS_LESSONS_BEGINNER: Lesson[] = [
  {
    id: 'css-1',
    courseId: 'web-css-styling',
    title: 'ما هو CSS؟',
    description: 'مقدمة شاملة عن CSS وأهميتها',
    content: `
# ما هو CSS؟

CSS تعني **Cascading Style Sheets** - أوراق الأنماط المتتالية.

## لماذا CSS مهمة؟
- 🎨 تحويل HTML الباهت إلى تصميم جذاب
- 📱 إنشاء تصاميم متجاوبة
- ⚡ تحسين تجربة المستخدم
- 🔄 إعادة استخدام الأنماط

## كيف يعمل CSS؟
CSS يعمل بثلاث طرق:
1. **Inline**: داخل عنصر HTML مباشرة
2. **Internal**: داخل وسم <style> في الصفحة
3. **External**: في ملف .css منفصل (الأفضل)

## التركيب الأساسي
\`\`\`css
selector {
    property: value;
}
\`\`\`

- **Selector**: يحدد العنصر المراد تنسيقه
- **Property**: الخاصية المراد تغييرها
- **Value**: القيمة الجديدة
`,
    codeExample: `/* هذا تعليق في CSS */

/* تنسيق كل الفقرات */
p {
    color: blue;
    font-size: 16px;
}

/* تنسيق العناوين */
h1 {
    color: #333;
    text-align: center;
}

/* تنسيق باستخدام class */
.highlight {
    background-color: yellow;
    padding: 10px;
}`,
    language: 'css',
    xpReward: 100,
    order: 1,
    quiz: {
      question: 'ما معنى CSS؟',
      options: [
        'Computer Style Sheets',
        'Cascading Style Sheets',
        'Creative Style System',
        'Colorful Style Sheets',
      ],
      correctAnswer: 1,
      explanation: 'CSS تعني Cascading Style Sheets أي أوراق الأنماط المتتالية',
    },
  },
  {
    id: 'css-2',
    courseId: 'web-css-styling',
    title: 'المحددات (Selectors)',
    description: 'تعلم أنواع المحددات المختلفة',
    content: `
# المحددات في CSS

المحددات تحدد العناصر التي ستتأثر بالتنسيق.

## أنواع المحددات الأساسية

### 1. محدد العنصر (Element Selector)
يحدد كل العناصر من نفس النوع.

### 2. محدد الـ Class
يبدأ بنقطة (.) ويستخدم للعناصر التي تشترك بنفس الـ class.

### 3. محدد الـ ID
يبدأ بـ (#) ويستخدم لعنصر واحد فقط.

### 4. المحدد العام (*)
يحدد كل العناصر في الصفحة.

## الأولوية (Specificity)
1. Inline styles (أعلى أولوية)
2. IDs
3. Classes
4. Elements (أقل أولوية)
`,
    codeExample: `/* محدد العنصر */
p {
    color: gray;
}

/* محدد الـ Class - نقطة + اسم */
.card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
}

/* محدد الـ ID - # + اسم */
#header {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
}

/* المحدد العام */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* محددات مركبة */
div.container {
    max-width: 1200px;
    margin: 0 auto;
}

/* المحدد التنازلي */
nav ul li a {
    text-decoration: none;
}`,
    language: 'css',
    xpReward: 100,
    order: 2,
    quiz: {
      question: 'كيف نحدد عنصر له class="box"؟',
      options: ['#box', '.box', 'box', '*box'],
      correctAnswer: 1,
      explanation: 'نستخدم النقطة (.) قبل اسم الـ class للتحديد',
    },
  },
  {
    id: 'css-3',
    courseId: 'web-css-styling',
    title: 'الألوان في CSS',
    description: 'كل طرق تحديد الألوان',
    content: `
# الألوان في CSS

CSS توفر طرق متعددة لتحديد الألوان.

## طرق تحديد الألوان

### 1. أسماء الألوان
مثل: red, blue, green, yellow, purple

### 2. Hexadecimal
\`#RRGGBB\` حيث كل قيمة من 00 إلى FF
- \`#FF0000\` = أحمر
- \`#00FF00\` = أخضر
- \`#0000FF\` = أزرق

### 3. RGB
\`rgb(red, green, blue)\` كل قيمة من 0 إلى 255

### 4. RGBA
مثل RGB مع الشفافية (alpha) من 0 إلى 1

### 5. HSL
\`hsl(hue, saturation, lightness)\`
- Hue: درجة اللون (0-360)
- Saturation: التشبع (0%-100%)
- Lightness: الإضاءة (0%-100%)

## نصائح
- استخدم أدوات اختيار الألوان
- حافظ على تباين جيد للقراءة
- استخدم لوحة ألوان متناسقة
`,
    codeExample: `/* أسماء الألوان */
.red-text {
    color: red;
    background-color: lightcoral;
}

/* Hexadecimal */
.hex-example {
    color: #3498db;         /* أزرق */
    background: #2ecc71;    /* أخضر */
    border-color: #e74c3c;  /* أحمر */
}

/* RGB */
.rgb-example {
    color: rgb(52, 152, 219);
    background: rgb(46, 204, 113);
}

/* RGBA مع شفافية */
.rgba-example {
    background: rgba(0, 0, 0, 0.5);  /* أسود 50% شفاف */
    color: rgba(255, 255, 255, 0.9);
}

/* HSL */
.hsl-example {
    color: hsl(210, 79%, 46%);       /* أزرق */
    background: hsl(145, 63%, 49%);  /* أخضر */
}

/* تدرج لوني */
.gradient {
    background: linear-gradient(
        45deg, 
        #667eea, 
        #764ba2
    );
}`,
    language: 'css',
    xpReward: 100,
    order: 3,
    quiz: {
      question: 'ما هو كود اللون الأحمر بـ Hex؟',
      options: ['#0000FF', '#00FF00', '#FF0000', '#FFFF00'],
      correctAnswer: 2,
      explanation: 'FF0000 يعني: الأحمر=255، الأخضر=0، الأزرق=0',
    },
  },
  {
    id: 'css-4',
    courseId: 'web-css-styling',
    title: 'تنسيق النصوص',
    description: 'خصائص الخطوط والنصوص',
    content: `
# تنسيق النصوص

CSS توفر تحكماً كاملاً في شكل النصوص.

## خصائص الخط (Font)

### font-family
تحدد نوع الخط.
- استخدم خطوط آمنة (web-safe)
- أو Google Fonts

### font-size
حجم الخط:
- px: ثابت
- em/rem: نسبي (أفضل للتجاوبية)
- %: نسبة من حجم الأب

### font-weight
سماكة الخط:
- normal (400)
- bold (700)
- أرقام من 100 إلى 900

### font-style
- normal
- italic
- oblique

## خصائص النص (Text)

### text-align
محاذاة النص: left, center, right, justify

### text-decoration
- none
- underline
- line-through
- overline

### line-height
ارتفاع السطر (مهم للقراءة)

### letter-spacing
المسافة بين الحروف
`,
    codeExample: `/* خصائص الخط الأساسية */
body {
    font-family: 'Segoe UI', Tahoma, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #333;
}

/* العناوين */
h1 {
    font-size: 2.5rem;      /* 40px */
    font-weight: 800;
    letter-spacing: -1px;
    text-transform: uppercase;
}

h2 {
    font-size: 2rem;
    font-weight: 600;
    color: #2c3e50;
}

/* الفقرات */
p {
    font-size: 1rem;
    line-height: 1.8;
    text-align: justify;
    margin-bottom: 1em;
}

/* الروابط */
a {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
}

a:hover {
    text-decoration: underline;
    color: #2980b9;
}

/* نص مميز */
.highlight-text {
    font-style: italic;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

/* خط عربي */
.arabic-text {
    font-family: 'Cairo', 'Tajawal', sans-serif;
    direction: ltr;
    text-align: right;
}`,
    language: 'css',
    xpReward: 100,
    order: 4,
    quiz: {
      question: 'ما الخاصية التي تحدد سماكة الخط؟',
      options: ['font-size', 'font-style', 'font-weight', 'text-decoration'],
      correctAnswer: 2,
      explanation: 'font-weight تحدد سماكة الخط (من 100 إلى 900)',
    },
  },
  {
    id: 'css-5',
    courseId: 'web-css-styling',
    title: 'نموذج الصندوق (Box Model)',
    description: 'فهم Box Model الأساسي',
    content: `
# نموذج الصندوق (Box Model)

كل عنصر في HTML هو "صندوق" يتكون من:

## المكونات الأربعة

### 1. Content (المحتوى)
- المحتوى الفعلي (نص، صور)
- يُحدد بـ width و height

### 2. Padding (الحشو)
- المسافة بين المحتوى والحدود
- تزيد حجم العنصر

### 3. Border (الحدود)
- خط حول العنصر
- لها width, style, color

### 4. Margin (الهامش)
- المسافة خارج الحدود
- تفصل العناصر عن بعضها

## box-sizing
- \`content-box\`: الافتراضي (width = content فقط)
- \`border-box\`: (width يشمل padding و border) - الأفضل!

## مهم جداً
\`\`\`css
* {
    box-sizing: border-box;
}
\`\`\`
هذا يجعل التصميم أسهل بكثير!
`,
    codeExample: `/* إعداد box-sizing للكل */
*, *::before, *::after {
    box-sizing: border-box;
}

/* مثال على Box Model */
.card {
    /* المحتوى */
    width: 300px;
    height: auto;
    
    /* الحشو - من الداخل */
    padding: 20px;
    /* أو بالتفصيل */
    padding-top: 20px;
    padding-right: 20px;
    padding-bottom: 20px;
    padding-left: 20px;
    /* أو مختصر: padding: top right bottom left */
    padding: 20px 15px 20px 15px;
    
    /* الحدود */
    border: 2px solid #3498db;
    border-radius: 10px;
    
    /* الهامش - من الخارج */
    margin: 20px;
    /* أو للتوسيط أفقياً */
    margin: 20px auto;
}

/* حدود متعددة */
.fancy-border {
    border: 3px solid;
    border-color: #e74c3c #f39c12 #2ecc71 #3498db;
    /* أعلى يمين أسفل يسار */
}

/* ظل الصندوق */
.shadow-box {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* ظل داخلي */
.inner-shadow {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}`,
    language: 'css',
    xpReward: 100,
    order: 5,
    quiz: {
      question: 'ما الذي يفصل بين المحتوى والحدود؟',
      options: ['Margin', 'Border', 'Padding', 'Content'],
      correctAnswer: 2,
      explanation: 'Padding هو المسافة بين المحتوى (content) والحدود (border)',
    },
  },
  {
    id: 'css-6',
    courseId: 'web-css-styling',
    title: 'العرض والإخفاء (Display)',
    description: 'تحكم في طريقة عرض العناصر',
    content: `
# خاصية Display

تحدد كيفية عرض العنصر وتفاعله مع العناصر الأخرى.

## القيم الأساسية

### block
- يأخذ عرض السطر كاملاً
- يبدأ في سطر جديد
- أمثلة: div, p, h1-h6

### inline
- يأخذ عرض محتواه فقط
- لا يبدأ سطر جديد
- لا يقبل width/height
- أمثلة: span, a, strong

### inline-block
- مزيج من الاثنين
- يقبل width/height
- لا يبدأ سطر جديد

### none
- يخفي العنصر تماماً
- لا يأخذ مساحة

### flex
- نظام تخطيط مرن قوي
- (درس منفصل)

### grid
- نظام تخطيط شبكي
- (درس منفصل)

## visibility vs display: none
- \`visibility: hidden\`: يخفي لكن يحتفظ بالمساحة
- \`display: none\`: يخفي ويزيل المساحة
`,
    codeExample: `/* Block - كل واحد في سطر */
.block-element {
    display: block;
    width: 100%;
    margin-bottom: 10px;
}

/* Inline - بجانب بعض */
.inline-element {
    display: inline;
    /* لا يمكن تحديد width/height */
}

/* Inline-block - الأفضل للأزرار */
.button {
    display: inline-block;
    padding: 10px 20px;
    width: auto;
    margin: 5px;
}

/* إخفاء العنصر */
.hidden {
    display: none;
}

.invisible {
    visibility: hidden;
    /* يحتفظ بمساحته */
}

/* تحويل القائمة لأفقية */
nav ul li {
    display: inline-block;
    margin: 0 10px;
}

/* مثال على القائمة */
.horizontal-menu li {
    display: inline-block;
    list-style: none;
}

.horizontal-menu a {
    display: block;
    padding: 15px 25px;
    text-decoration: none;
}`,
    language: 'css',
    xpReward: 100,
    order: 6,
    quiz: {
      question: 'أي display يجعل العنصر يقبل width ولا يبدأ سطر جديد؟',
      options: ['block', 'inline', 'inline-block', 'none'],
      correctAnswer: 2,
      explanation:
        'inline-block يجمع مميزات block (يقبل dimensions) و inline (لا يبدأ سطر جديد)',
    },
  },
  {
    id: 'css-7',
    courseId: 'web-css-styling',
    title: 'التموضع (Position)',
    description: 'تحكم في موقع العناصر',
    content: `
# خاصية Position

تحدد كيف يتم تموضع العنصر في الصفحة.

## القيم

### static (الافتراضي)
- التموضع الطبيعي
- لا يتأثر بـ top, right, bottom, left

### relative
- نسبي لموقعه الأصلي
- يحتفظ بمساحته
- يمكن تحريكه بـ top, right, bottom, left

### absolute
- مطلق بالنسبة لأقرب أب positioned
- يخرج من التدفق الطبيعي
- لا يحتفظ بمساحته

### fixed
- ثابت بالنسبة للشاشة
- لا يتحرك عند التمرير
- ممتاز للنوافذ والأزرار الثابتة

### sticky
- مزيج من relative و fixed
- يلتصق عند نقطة معينة
- رائع للقوائم

## z-index
تحدد ترتيب التراكب (أي عنصر فوق الآخر)
`,
    codeExample: `/* Static - الافتراضي */
.static-box {
    position: static;
    /* top, left, etc. لا تعمل */
}

/* Relative - نسبي */
.relative-box {
    position: relative;
    top: 20px;    /* ينزل 20px */
    left: 30px;   /* يتحرك 30px لليمين */
}

/* Absolute - مطلق */
.container {
    position: relative; /* مهم للأبناء */
}

.absolute-box {
    position: absolute;
    top: 0;
    right: 0;
    /* سيكون في الزاوية العليا اليمنى للـ container */
}

/* Fixed - ثابت */
.fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: white;
}

.back-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999;
}

/* Sticky - لاصق */
.sticky-nav {
    position: sticky;
    top: 0;
    background: white;
    z-index: 100;
}

/* z-index للتراكب */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
}

.modal-content {
    position: fixed;
    z-index: 1001; /* فوق الـ overlay */
}`,
    language: 'css',
    xpReward: 100,
    order: 7,
    quiz: {
      question: 'أي position يبقى ثابتاً عند التمرير؟',
      options: ['static', 'relative', 'absolute', 'fixed'],
      correctAnswer: 3,
      explanation:
        'fixed يجعل العنصر ثابتاً بالنسبة للشاشة ولا يتحرك عند التمرير',
    },
  },
  {
    id: 'css-8',
    courseId: 'web-css-styling',
    title: 'Flexbox الأساسيات',
    description: 'مقدمة في نظام Flexbox',
    content: `
# Flexbox - التخطيط المرن

أقوى نظام تخطيط في CSS الحديث.

## البدء مع Flexbox

### الخطوة الأولى
\`\`\`css
.container {
    display: flex;
}
\`\`\`

## محاور Flexbox
- **Main Axis**: المحور الرئيسي (افتراضياً أفقي)
- **Cross Axis**: المحور المتقاطع (افتراضياً عمودي)

## خصائص الحاوية (Container)

### flex-direction
- row (افتراضي): أفقي
- column: عمودي
- row-reverse: أفقي معكوس
- column-reverse: عمودي معكوس

### justify-content (المحور الرئيسي)
- flex-start, center, flex-end
- space-between, space-around, space-evenly

### align-items (المحور المتقاطع)
- stretch, flex-start, center, flex-end

### flex-wrap
- nowrap: سطر واحد
- wrap: التفاف للسطر التالي

## مهم للتذكر
Flexbox يجعل التوسيط سهلاً جداً!
`,
    codeExample: `/* تفعيل Flexbox */
.flex-container {
    display: flex;
}

/* توسيط تام */
.center-everything {
    display: flex;
    justify-content: center;  /* أفقياً */
    align-items: center;      /* عمودياً */
    height: 100vh;
}

/* قائمة أفقية */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
}

/* توزيع متساوي */
.equal-columns {
    display: flex;
    gap: 20px;
}

.equal-columns > * {
    flex: 1; /* كل عنصر يأخذ نفس المساحة */
}

/* التفاف العناصر */
.card-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.card-grid .card {
    flex: 1 1 300px; /* grow shrink basis */
    /* يكبر، يصغر، حد أدنى 300px */
}

/* عمودي */
.sidebar {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* عكس الترتيب */
.reverse-order {
    display: flex;
    flex-direction: row-reverse;
}`,
    language: 'css',
    xpReward: 100,
    order: 8,
    quiz: {
      question: 'ما الخاصية التي توزع العناصر على المحور الرئيسي؟',
      options: [
        'align-items',
        'flex-direction',
        'justify-content',
        'flex-wrap',
      ],
      correctAnswer: 2,
      explanation:
        'justify-content توزع العناصر على المحور الرئيسي (الأفقي افتراضياً)',
    },
  },
  {
    id: 'css-9',
    courseId: 'web-css-styling',
    title: 'Flexbox المتقدم',
    description: 'خصائص العناصر الفردية',
    content: `
# خصائص عناصر Flex

بعد تعلم خصائص الحاوية، نتعلم خصائص العناصر.

## خصائص العناصر (Items)

### flex-grow
- كيف يكبر العنصر لملء المساحة
- 0 = لا يكبر
- 1+ = يكبر بنسبة

### flex-shrink
- كيف يصغر العنصر عند الضيق
- 0 = لا يصغر
- 1 = يصغر

### flex-basis
- الحجم الأساسي قبل التوزيع
- مثل width لكن أفضل

### flex (المختصر)
\`flex: grow shrink basis\`

### align-self
- محاذاة عنصر واحد مختلفة
- يتجاوز align-items

### order
- ترتيب العنصر
- أرقام سالبة أو موجبة
`,
    codeExample: `/* flex-grow: توزيع المساحة */
.sidebar {
    flex-grow: 0;
    width: 250px;
}

.main-content {
    flex-grow: 1; /* يأخذ المساحة المتبقية */
}

/* flex-shrink: التحكم بالتصغير */
.logo {
    flex-shrink: 0; /* لا يصغر أبداً */
}

/* flex-basis: الحجم الأساسي */
.column {
    flex-basis: 33.333%;
}

/* flex المختصر */
.flex-item {
    flex: 1;          /* grow:1, shrink:1, basis:0 */
}

.fixed-size {
    flex: 0 0 200px;  /* لا يكبر، لا يصغر، 200px */
}

.flexible {
    flex: 1 1 auto;   /* يكبر، يصغر، حجم تلقائي */
}

/* align-self: محاذاة فردية */
.special-item {
    align-self: flex-end; /* هذا العنصر فقط في الأسفل */
}

/* order: تغيير الترتيب */
.first {
    order: 1;
}

.second {
    order: 2;
}

.move-to-start {
    order: -1; /* قبل الكل */
}

/* مثال عملي: Holy Grail Layout */
.holy-grail {
    display: flex;
    min-height: 100vh;
}

.holy-grail nav {
    flex: 0 0 200px;
    order: -1; /* يظهر أولاً رغم أنه في HTML ثانياً */
}

.holy-grail main {
    flex: 1;
}

.holy-grail aside {
    flex: 0 0 200px;
}`,
    language: 'css',
    xpReward: 100,
    order: 9,
    quiz: {
      question: 'ما معنى flex: 1 1 200px؟',
      options: [
        'width: 200px',
        'grow:1, shrink:1, basis:200px',
        'margin: 1px 1px 200px',
        'order: 1',
      ],
      correctAnswer: 1,
      explanation:
        'flex المختصر: grow shrink basis. يعني يكبر، يصغر، بحجم أساسي 200px',
    },
  },
  {
    id: 'css-10',
    courseId: 'web-css-styling',
    title: 'CSS Grid الأساسيات',
    description: 'نظام التخطيط الشبكي',
    content: `
# CSS Grid

نظام تخطيط ثنائي الأبعاد قوي جداً.

## متى نستخدم Grid؟
- تخطيطات معقدة
- صفوف وأعمدة
- تصاميم غير منتظمة

## البدء مع Grid

\`\`\`css
.container {
    display: grid;
}
\`\`\`

## خصائص أساسية

### grid-template-columns
تحدد عدد وعرض الأعمدة

### grid-template-rows
تحدد عدد وارتفاع الصفوف

### gap
المسافة بين الخلايا

## وحدة fr
- Fractional Unit
- توزيع المساحة بالنسب

## repeat()
لتكرار القيم

## minmax()
تحديد الحد الأدنى والأقصى
`,
    codeExample: `/* تفعيل Grid */
.grid-container {
    display: grid;
}

/* أعمدة ثابتة */
.three-columns {
    display: grid;
    grid-template-columns: 200px 200px 200px;
    gap: 20px;
}

/* استخدام fr */
.equal-columns {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    /* أو */
    grid-template-columns: repeat(3, 1fr);
}

/* أعمدة مختلفة */
.sidebar-layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    /* sidebar ثابت، main يأخذ الباقي */
}

/* Grid متجاوب */
.auto-fit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

/* صفوف وأعمدة */
.complex-grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
}

/* gap منفصل */
.different-gaps {
    display: grid;
    column-gap: 20px;
    row-gap: 40px;
}

/* Grid areas */
.page-layout {
    display: grid;
    grid-template-areas:
        "header header header"
        "nav    main   aside"
        "footer footer footer";
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
}

.header { grid-area: header; }
.nav    { grid-area: nav; }
.main   { grid-area: main; }
.aside  { grid-area: aside; }
.footer { grid-area: footer; }`,
    language: 'css',
    xpReward: 100,
    order: 10,
    quiz: {
      question: 'ما الذي يفعله repeat(3, 1fr)؟',
      options: [
        'يكرر العنصر 3 مرات',
        'ينشئ 3 أعمدة متساوية',
        'يضيف margin 3fr',
        'يحدد 3 صفوف',
      ],
      correctAnswer: 1,
      explanation:
        'repeat(3, 1fr) ينشئ 3 أعمدة كل واحد يأخذ جزء متساوٍ من المساحة',
    },
  },
  {
    id: 'css-11',
    courseId: 'web-css-styling',
    title: 'Variables و Custom Properties',
    description: 'استخدام المتغيرات في CSS',
    content: `
# CSS Variables

المتغيرات تجعل كودك أسهل في الصيانة وإعادة الاستخدام.

## تعريف المتغيرات

\`\`\`css
/* تعريف في :root للوصول العام */
:root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --font-size-base: 16px;
    --spacing-unit: 8px;
    --border-radius: 8px;
    --shadow: 0 2px 10px rgba(0,0,0,0.1);
}
\`\`\`

## استخدام المتغيرات

\`\`\`css
.button {
    background-color: var(--primary-color);
    padding: var(--spacing-unit);
    border-radius: var(--border-radius);
    font-size: var(--font-size-base);
}

.card {
    box-shadow: var(--shadow);
    border-radius: var(--border-radius);
}
\`\`\`

## قيمة افتراضية

\`\`\`css
/* إذا لم يكن المتغير موجوداً، استخدم القيمة الافتراضية */
.element {
    color: var(--text-color, #333);
    padding: var(--padding, 20px);
}
\`\`\`

## تغيير المتغيرات في نطاقات مختلفة

\`\`\`css
:root {
    --theme-bg: #ffffff;
    --theme-text: #333333;
}

/* الوضع الداكن */
.dark-theme {
    --theme-bg: #1a1a1a;
    --theme-text: #ffffff;
}

body {
    background-color: var(--theme-bg);
    color: var(--theme-text);
}
\`\`\`
`,
    codeExample: `/* نظام تصميم بسيط باستخدام Variables */
:root {
    /* الألوان */
    --color-primary: #6366f1;
    --color-success: #22c55e;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
    
    /* المسافات */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    
    /* الخطوط */
    --font-small: 12px;
    --font-base: 16px;
    --font-large: 20px;
    --font-xl: 28px;
}

.btn-primary {
    background: var(--color-primary);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--space-xs);
}

.alert-success {
    background: var(--color-success);
    padding: var(--space-md);
}`,
    language: 'css',
    xpReward: 100,
    order: 11,
    quiz: {
      question: 'كيف نستخدم متغير CSS؟',
      options: ['$variable', '@variable', 'var(--variable)', 'variable()'],
      correctAnswer: 2,
      explanation: 'نستخدم var(--اسم-المتغير) لاستدعاء متغير CSS.',
    },
  },
  {
    id: 'css-12',
    courseId: 'web-css-styling',
    title: 'Media Queries للتصميم المتجاوب',
    description: 'تكييف التصميم لأحجام الشاشات المختلفة',
    content: `
# Media Queries

التصميم المتجاوب يجعل موقعك يعمل على جميع الأجهزة.

## الصيغة الأساسية

\`\`\`css
/* للشاشات الأصغر من 768px */
@media (max-width: 768px) {
    .container {
        width: 100%;
        padding: 10px;
    }
}

/* للشاشات الأكبر من 1024px */
@media (min-width: 1024px) {
    .container {
        width: 960px;
        margin: 0 auto;
    }
}
\`\`\`

## Breakpoints شائعة

\`\`\`css
/* الهواتف */
@media (max-width: 576px) { }

/* الأجهزة اللوحية */
@media (min-width: 577px) and (max-width: 992px) { }

/* الشاشات الكبيرة */
@media (min-width: 993px) { }
\`\`\`

## مثال عملي

\`\`\`css
.nav {
    display: flex;
    flex-direction: row;
}

/* على الهواتف: قائمة عمودية */
@media (max-width: 768px) {
    .nav {
        flex-direction: column;
    }
    
    .nav-item {
        width: 100%;
        text-align: center;
    }
}
\`\`\`
`,
    codeExample: `/* تصميم متجاوب لبطاقة */
.card-grid {
    display: grid;
    gap: 20px;
}

/* 4 أعمدة على الشاشات الكبيرة */
@media (min-width: 1200px) {
    .card-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* 3 أعمدة على الشاشات المتوسطة */
@media (min-width: 768px) and (max-width: 1199px) {
    .card-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* 2 أعمدة على الأجهزة اللوحية */
@media (min-width: 576px) and (max-width: 767px) {
    .card-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* عمود واحد على الهواتف */
@media (max-width: 575px) {
    .card-grid {
        grid-template-columns: 1fr;
    }
}`,
    language: 'css',
    xpReward: 100,
    order: 12,
    quiz: {
      question: 'ماذا يعني max-width: 768px في media query؟',
      options: [
        'للشاشات الأكبر من 768px',
        'للشاشات التي عرضها 768px أو أقل',
        'لتحديد عرض العنصر',
        'لا شيء مما سبق',
      ],
      correctAnswer: 1,
      explanation:
        'max-width: 768px تعني أن الأنماط تُطبق على الشاشات التي عرضها 768px أو أقل.',
    },
  },
  {
    id: 'css-13',
    courseId: 'web-css-styling',
    title: 'Pseudo-classes و Pseudo-elements',
    description: 'محددات CSS المتقدمة',
    content: `
# Pseudo-classes و Pseudo-elements

## Pseudo-classes (حالات العنصر)

\`\`\`css
/* حالة التمرير */
a:hover {
    color: red;
}

/* حالة الضغط */
button:active {
    transform: scale(0.95);
}

/* حالة التركيز */
input:focus {
    border-color: blue;
    outline: none;
}

/* العنصر الأول/الأخير */
li:first-child { color: green; }
li:last-child { color: red; }

/* عنصر محدد */
li:nth-child(2) { font-weight: bold; }
li:nth-child(odd) { background: #f0f0f0; }
li:nth-child(even) { background: white; }
\`\`\`

## Pseudo-elements (أجزاء وهمية)

\`\`\`css
/* قبل المحتوى */
.quote::before {
    content: '"';
    font-size: 2em;
}

/* بعد المحتوى */
.quote::after {
    content: '"';
    font-size: 2em;
}

/* أول حرف */
p::first-letter {
    font-size: 2em;
    font-weight: bold;
}

/* أول سطر */
p::first-line {
    color: gray;
}

/* النص المحدد */
::selection {
    background: yellow;
    color: black;
}
\`\`\`
`,
    codeExample: `/* بطاقة مع hover effect */
.card {
    padding: 20px;
    background: white;
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

/* زر مع pseudo-element */
.btn-fancy {
    position: relative;
    padding: 12px 24px;
    overflow: hidden;
}

.btn-fancy::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.5s;
}

.btn-fancy:hover::before {
    left: 100%;
}

/* قائمة مع أرقام مخصصة */
ol.custom-list {
    counter-reset: item;
    list-style: none;
}

ol.custom-list li::before {
    counter-increment: item;
    content: counter(item) ". ";
    color: #3498db;
    font-weight: bold;
}`,
    language: 'css',
    xpReward: 100,
    order: 13,
    quiz: {
      question: 'ما الفرق بين :hover و ::before؟',
      options: [
        'لا يوجد فرق',
        ':hover حالة و ::before عنصر وهمي',
        '::before للألوان فقط',
        ':hover للنصوص فقط',
      ],
      correctAnswer: 1,
      explanation:
        ':hover هو pseudo-class يمثل حالة (التمرير)، بينما ::before هو pseudo-element ينشئ محتوى وهمي.',
    },
  },
  {
    id: 'css-14',
    courseId: 'web-css-styling',
    title: 'Z-index و Stacking Context',
    description: 'التحكم في ترتيب الطبقات',
    content: `
# Z-index و ترتيب الطبقات

## كيف يعمل Z-index

\`\`\`css
/* z-index يعمل فقط مع positioned elements */
.box1 {
    position: relative;
    z-index: 1;
}

.box2 {
    position: relative;
    z-index: 2; /* يظهر فوق box1 */
}

.box3 {
    position: absolute;
    z-index: 10; /* يظهر فوق الجميع */
}
\`\`\`

## Stacking Context

\`\`\`css
/* عناصر تنشئ stacking context جديد */
.new-context {
    position: relative;
    z-index: 0; /* أي قيمة غير auto */
}

/* أو باستخدام */
.new-context-2 {
    opacity: 0.99;
}

.new-context-3 {
    transform: translateZ(0);
}
\`\`\`

## مثال عملي: Modal

\`\`\`css
/* خلفية Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 100;
}

/* محتوى Modal */
.modal-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 101;
    background: white;
    padding: 20px;
}
\`\`\`
`,
    codeExample: `/* نظام طبقات منظم */
:root {
    --z-dropdown: 100;
    --z-sticky: 200;
    --z-fixed: 300;
    --z-modal-backdrop: 400;
    --z-modal: 500;
    --z-popover: 600;
    --z-tooltip: 700;
}

.dropdown-menu {
    position: absolute;
    z-index: var(--z-dropdown);
}

.sticky-header {
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: var(--z-modal-backdrop);
}

.modal {
    position: fixed;
    z-index: var(--z-modal);
}

.tooltip {
    position: absolute;
    z-index: var(--z-tooltip);
}`,
    language: 'css',
    xpReward: 100,
    order: 14,
    quiz: {
      question: 'متى يعمل z-index؟',
      options: [
        'دائماً',
        'فقط مع العناصر positioned (relative, absolute, fixed, sticky)',
        'فقط مع display: block',
        'فقط مع flexbox',
      ],
      correctAnswer: 1,
      explanation: 'z-index يعمل فقط مع العناصر التي لها position غير static.',
    },
  },
  {
    id: 'css-15',
    courseId: 'web-css-styling',
    title: 'مشروع: صفحة هبوط متجاوبة',
    description: 'تطبيق كل ما تعلمته في مشروع عملي',
    content: `
# مشروع: صفحة هبوط متجاوبة

سنبني صفحة هبوط احترافية تجمع كل ما تعلمناه.

## الهيكل

\`\`\`html
<header class="hero">
    <nav class="navbar">...</nav>
    <div class="hero-content">...</div>
</header>
<section class="features">...</section>
<section class="testimonials">...</section>
<footer class="footer">...</footer>
\`\`\`

## المتغيرات

\`\`\`css
:root {
    --primary: #6366f1;
    --secondary: #ec4899;
    --dark: #1e1e2e;
    --light: #f8fafc;
    --radius: 12px;
    --shadow: 0 4px 20px rgba(0,0,0,0.1);
}
\`\`\`

## القسم الرئيسي (Hero)

\`\`\`css
.hero {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex;
    flex-direction: column;
}

.hero-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
}
\`\`\`

## الميزات (Features)

\`\`\`css
.features {
    padding: 80px 20px;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
}

.feature-card {
    padding: 30px;
    background: white;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    transition: transform 0.3s;
}

.feature-card:hover {
    transform: translateY(-10px);
}
\`\`\`
`,
    codeExample: `/* Landing Page كامل */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #6366f1;
    --dark: #1e1e2e;
    --light: #f8fafc;
}

/* Navigation */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 5%;
    position: fixed;
    width: 100%;
    z-index: 100;
}

.nav-links {
    display: flex;
    gap: 30px;
    list-style: none;
}

/* Hero Section */
.hero {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--primary), #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5%;
}

.hero h1 {
    font-size: clamp(2rem, 5vw, 4rem);
    color: white;
    margin-bottom: 20px;
}

/* Features */
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    padding: 80px 5%;
    max-width: 1200px;
    margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
    .nav-links { display: none; }
    .hero h1 { text-align: center; }
}`,
    language: 'css',
    xpReward: 150,
    order: 15,
    quiz: {
      question: 'ماذا تعلمت في هذه الدورة؟',
      options: [
        'CSS سهل جداً',
        'الأساسيات + Flexbox + Grid + Variables + Responsive',
        'فقط الألوان',
        'لا شيء مفيد',
      ],
      correctAnswer: 1,
      explanation:
        'تعلمت الأساسيات، Box Model، المحددات، Flexbox، Grid، المتغيرات، Media Queries، وPseudo-classes/elements. أنت جاهز لـ CSS المتقدم!',
    },
  },
];

// ===== دروس CSS المتقدمة =====
export const CSS_LESSONS_ADVANCED: Lesson[] = [
  {
    id: 'css-adv-1',
    courseId: 'web-css-advanced',
    title: 'التحويلات (Transforms)',
    description: 'تحريك وتدوير العناصر',
    content: `
# CSS Transforms

تحويل شكل وموقع العناصر بدون تأثير على التخطيط.

## أنواع التحويلات

### translate (النقل)
- translateX(value)
- translateY(value)
- translate(x, y)

### rotate (الدوران)
- rotate(angle) بالدرجات deg
- rotateX, rotateY للـ 3D

### scale (التكبير/التصغير)
- scale(value)
- scaleX, scaleY

### skew (الإمالة)
- skewX(angle)
- skewY(angle)

## transform-origin
نقطة مركز التحويل
`,
    codeExample: `/* النقل */
.move-right {
    transform: translateX(100px);
}

.move-diagonal {
    transform: translate(50px, 30px);
}

/* الدوران */
.rotate-45 {
    transform: rotate(45deg);
}

.rotate-hover:hover {
    transform: rotate(360deg);
    transition: transform 0.5s;
}

/* التكبير */
.scale-up {
    transform: scale(1.5);
}

.scale-hover:hover {
    transform: scale(1.1);
    transition: transform 0.3s;
}

/* الإمالة */
.skew-box {
    transform: skewX(-10deg);
}

/* تحويلات متعددة */
.complex-transform {
    transform: translateY(-50%) rotate(45deg) scale(1.2);
}

/* نقطة المركز */
.rotate-corner {
    transform-origin: top left;
    transform: rotate(15deg);
}

/* Card Flip */
.card {
    perspective: 1000px;
}

.card-inner {
    transform-style: preserve-3d;
    transition: transform 0.6s;
}

.card:hover .card-inner {
    transform: rotateY(180deg);
}

.card-front, .card-back {
    backface-visibility: hidden;
}

.card-back {
    transform: rotateY(180deg);
}`,
    language: 'css',
    xpReward: 120,
    order: 1,
    quiz: {
      question: 'ما الذي يفعله transform: scale(2)؟',
      options: [
        'ينقل العنصر 2px',
        'يكبر العنصر مرتين',
        'يدور 2 درجات',
        'يميل 2 درجات',
      ],
      correctAnswer: 1,
      explanation: 'scale(2) يكبر العنصر إلى ضعف حجمه الأصلي',
    },
  },
  {
    id: 'css-adv-2',
    courseId: 'web-css-advanced',
    title: 'الانتقالات (Transitions)',
    description: 'حركات سلسة بين الحالات',
    content: `
# CSS Transitions

تحريك التغييرات في الخصائص بشكل سلس.

## الخصائص

### transition-property
الخاصية المراد تحريكها

### transition-duration
مدة الانتقال

### transition-timing-function
سرعة/بطء الحركة:
- ease (افتراضي)
- linear
- ease-in
- ease-out
- ease-in-out
- cubic-bezier()

### transition-delay
تأخير قبل البدء

## المختصر
\`transition: property duration timing delay\`

## نصائح
- لا تحرك كل شيء (all) للأداء
- استخدم transform و opacity (أسرع)
`,
    codeExample: `/* انتقال أساسي */
.button {
    background: #3498db;
    transition: background 0.3s ease;
}

.button:hover {
    background: #2980b9;
}

/* انتقالات متعددة */
.card {
    background: white;
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transition: 
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

/* timing functions مختلفة */
.linear-move {
    transition: all 0.5s linear;
}

.ease-in-move {
    transition: all 0.5s ease-in; /* بطيء ثم سريع */
}

.ease-out-move {
    transition: all 0.5s ease-out; /* سريع ثم بطيء */
}

/* cubic-bezier مخصص */
.bounce {
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* تأخير */
.delayed {
    transition: opacity 0.3s ease 0.5s; /* يبدأ بعد 0.5s */
}

/* Menu Animation */
.nav-link {
    position: relative;
    color: #333;
    transition: color 0.3s;
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: #3498db;
    transition: width 0.3s ease;
}

.nav-link:hover {
    color: #3498db;
}

.nav-link:hover::after {
    width: 100%;
}`,
    language: 'css',
    xpReward: 120,
    order: 2,
    quiz: {
      question:
        'ما الـ timing function الذي يجعل الحركة تبدأ بطيئة وتنتهي سريعة؟',
      options: ['ease-out', 'ease-in', 'linear', 'ease-in-out'],
      correctAnswer: 1,
      explanation: 'ease-in يبدأ ببطء ويتسارع، عكس ease-out',
    },
  },
  {
    id: 'css-adv-3',
    courseId: 'web-css-advanced',
    title: 'الحركات (Animations)',
    description: 'حركات معقدة مع Keyframes',
    content: `
# CSS Animations

حركات أكثر تعقيداً وتحكماً من transitions.

## @keyframes
تحدد مراحل الحركة

## خصائص Animation

### animation-name
اسم الـ keyframes

### animation-duration
مدة دورة واحدة

### animation-timing-function
سرعة الحركة

### animation-iteration-count
عدد التكرارات (أو infinite)

### animation-direction
- normal
- reverse
- alternate
- alternate-reverse

### animation-fill-mode
حالة العنصر قبل/بعد
- forwards: يحتفظ بالحالة النهائية
- backwards: يبدأ من الحالة الأولى

### animation-play-state
- running
- paused
`,
    codeExample: `/* حركة أساسية */
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.fade-in {
    animation: fadeIn 1s ease forwards;
}

/* حركة متعددة المراحل */
@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-30px);
    }
}

.bouncing {
    animation: bounce 0.5s ease infinite;
}

/* حركة دوران */
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.spinner {
    animation: spin 1s linear infinite;
}

/* حركة نبض */
@keyframes pulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4);
    }
    70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 20px rgba(52, 152, 219, 0);
    }
    100% {
        transform: scale(1);
    }
}

.pulse-button {
    animation: pulse 2s infinite;
}

/* حركة كتابة */
@keyframes typing {
    from {
        width: 0;
    }
    to {
        width: 100%;
    }
}

.typing-effect {
    overflow: hidden;
    white-space: nowrap;
    animation: typing 3s steps(30) forwards;
}

/* حركة تحميل */
@keyframes loading {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(400%);
    }
}

.loading-bar {
    position: relative;
    overflow: hidden;
}

.loading-bar::after {
    content: '';
    position: absolute;
    width: 25%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: loading 1.5s infinite;
}`,
    language: 'css',
    xpReward: 120,
    order: 3,
    quiz: {
      question: 'ما الذي يجعل الحركة تستمر للأبد؟',
      options: [
        'animation-duration: forever',
        'animation-iteration-count: infinite',
        'animation-loop: true',
        'animation-repeat: always',
      ],
      correctAnswer: 1,
      explanation:
        'animation-iteration-count: infinite يجعل الحركة تتكرر بلا نهاية',
    },
  },
  {
    id: 'css-adv-4',
    courseId: 'web-css-advanced',
    title: 'التصميم المتجاوب',
    description: 'Media Queries والتجاوبية',
    content: `
# التصميم المتجاوب

جعل الموقع يعمل على جميع الشاشات.

## Mobile First
ابدأ بالتصميم للهواتف ثم وسّع.

## Media Queries

\`\`\`css
@media (condition) {
    /* styles */
}
\`\`\`

## Breakpoints الشائعة
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## وحدات متجاوبة
- %: نسبة من الأب
- vw/vh: نسبة من الشاشة
- rem/em: نسبة من الخط
- clamp(): حد أدنى وأقصى

## صور متجاوبة
\`\`\`css
img {
    max-width: 100%;
    height: auto;
}
\`\`\`
`,
    codeExample: `/* Mobile First Approach */

/* الأساس للهواتف */
.container {
    width: 100%;
    padding: 15px;
}

.grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        width: 750px;
        margin: 0 auto;
    }
    
    .grid {
        flex-direction: row;
        flex-wrap: wrap;
    }
    
    .grid > * {
        flex: 1 1 calc(50% - 20px);
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        width: 1000px;
    }
    
    .grid > * {
        flex: 1 1 calc(33.333% - 20px);
    }
}

/* Large Desktop */
@media (min-width: 1200px) {
    .container {
        width: 1170px;
    }
}

/* خط متجاوب */
h1 {
    font-size: clamp(1.5rem, 4vw, 3rem);
    /* min: 1.5rem, مفضل: 4vw, max: 3rem */
}

/* صور متجاوبة */
img {
    max-width: 100%;
    height: auto;
    display: block;
}

/* إخفاء على الهواتف */
.desktop-only {
    display: none;
}

@media (min-width: 768px) {
    .desktop-only {
        display: block;
    }
    
    .mobile-only {
        display: none;
    }
}

/* تغيير الاتجاه */
@media (orientation: landscape) {
    .hero {
        height: 100vh;
    }
}`,
    language: 'css',
    xpReward: 120,
    order: 4,
    quiz: {
      question: 'ما معنى @media (min-width: 768px)؟',
      options: [
        'شاشات أصغر من 768px',
        'شاشات 768px فقط',
        'شاشات 768px أو أكبر',
        'شاشات أصغر من أو تساوي 768px',
      ],
      correctAnswer: 2,
      explanation: 'min-width: 768px يعني الأنماط تطبق على شاشات 768px أو أكبر',
    },
  },
  {
    id: 'css-adv-5',
    courseId: 'web-css-advanced',
    title: 'CSS Variables',
    description: 'المتغيرات المخصصة',
    content: `
# CSS Custom Properties (Variables)

متغيرات قابلة لإعادة الاستخدام في CSS.

## تعريف المتغيرات
\`\`\`css
:root {
    --variable-name: value;
}
\`\`\`

## استخدام المتغيرات
\`\`\`css
property: var(--variable-name);
\`\`\`

## مميزات
- قابلة للتغيير ديناميكياً
- تدعم الوراثة
- قابلة للتحديث بـ JavaScript

## حالات الاستخدام
- ألوان الثيم
- مقاسات متكررة
- Dark/Light mode

## قيم افتراضية
\`\`\`css
var(--color, #000)
\`\`\`
`,
    codeExample: `/* تعريف المتغيرات في :root */
:root {
    /* ألوان */
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --danger-color: #e74c3c;
    --text-color: #333;
    --bg-color: #fff;
    
    /* مقاسات */
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    
    /* خطوط */
    --font-main: 'Segoe UI', sans-serif;
    --font-size-base: 16px;
    
    /* حدود */
    --border-radius: 8px;
    --shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* استخدام المتغيرات */
.button {
    background: var(--primary-color);
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--border-radius);
    font-family: var(--font-main);
}

.button-danger {
    background: var(--danger-color);
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
    :root {
        --text-color: #fff;
        --bg-color: #1a1a2e;
        --primary-color: #5dade2;
    }
}

/* أو بـ class */
.dark-mode {
    --text-color: #fff;
    --bg-color: #1a1a2e;
}

body {
    background: var(--bg-color);
    color: var(--text-color);
}

/* متغيرات محلية */
.card {
    --card-padding: 20px;
    padding: var(--card-padding);
}

.card.compact {
    --card-padding: 10px;
}

/* قيمة افتراضية */
.element {
    color: var(--custom-color, #000);
    /* إذا لم تُعرف --custom-color، استخدم #000 */
}`,
    language: 'css',
    xpReward: 120,
    order: 5,
    quiz: {
      question: 'كيف نستخدم متغير CSS اسمه --main-color؟',
      options: [
        'color: --main-color',
        'color: $main-color',
        'color: var(--main-color)',
        'color: @main-color',
      ],
      correctAnswer: 2,
      explanation: 'نستخدم دالة var() مع اسم المتغير الكامل بما فيه --',
    },
  },
];

// ===== تحديات CSS المبتدئة =====
export const CSS_CHALLENGES_BEGINNER: Challenge[] = [
  {
    id: 'css-ch-beg-1',
    title: 'تنسيق النص',
    description: 'طبق تنسيقات نصية مختلفة',
    difficulty: 'easy',
    points: 10,
    language: 'CSS',
    icon: 'text-format',
    starterCode: `.title {
    /* نسق العنوان الرئيسي */
}

.paragraph {
    /* نسق الفقرة */
}

.highlight {
    /* نسق النص المميز */
}`,
    solution: `.title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.paragraph {
    font-size: 1rem;
    line-height: 1.8;
    color: #666;
    text-align: justify;
}

.highlight {
    background: linear-gradient(120deg, #ffd700 0%, #ffa500 100%);
    padding: 0 5px;
    border-radius: 3px;
}`,
    hints: [
      'استخدم font-size لحجم الخط',
      'line-height للمسافة بين الأسطر',
      'text-transform لتحويل الحروف',
    ],
    testCases: [
      { input: '', expectedOutput: 'styled text', description: 'نص منسق' },
      {
        input: '',
        expectedOutput: 'centered title',
        description: 'عنوان في المنتصف مع letter-spacing',
      },
    ],
    isLocked: false,
    category: 'typography',
  },
  {
    id: 'css-ch-beg-2',
    title: 'تنسيق القوائم',
    description: 'أنشئ قوائم منسقة',
    difficulty: 'easy',
    points: 15,
    language: 'CSS',
    icon: 'format-list-bulleted',
    starterCode: `.custom-list {
    /* تنسيق القائمة */
}

.custom-list li {
    /* تنسيق عناصر القائمة */
}`,
    solution: `.custom-list {
    list-style: none;
    padding: 0;
}

.custom-list li {
    position: relative;
    padding: 10px 0 10px 30px;
    border-bottom: 1px solid #eee;
}

.custom-list li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #4CAF50;
    font-weight: bold;
}`,
    hints: [
      'استخدم list-style: none لإزالة النقاط',
      '::before لإضافة رمز مخصص',
    ],
    testCases: [
      {
        input: '',
        expectedOutput: 'custom bullets',
        description: 'قائمة برموز مخصصة',
      },
      {
        input: '',
        expectedOutput: 'no default bullets',
        description: 'بدون نقاط افتراضية',
      },
    ],
    isLocked: false,
    category: 'lists',
  },
  {
    id: 'css-ch-beg-3',
    title: 'الظلال والحدود',
    description: 'تعلم استخدام الظلال',
    difficulty: 'easy',
    points: 15,
    language: 'CSS',
    icon: 'blur-on',
    starterCode: `.box-shadow {
    /* أضف ظل للصندوق */
}

.text-shadow {
    /* أضف ظل للنص */
}

.bordered {
    /* أضف حدود متعددة */
}`,
    solution: `.box-shadow {
    width: 200px;
    height: 100px;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1),
                0 10px 20px rgba(0, 0, 0, 0.05);
}

.text-shadow {
    font-size: 2rem;
    color: #333;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.bordered {
    border: 3px solid #3498db;
    border-radius: 10px;
    padding: 20px;
    outline: 3px dashed #e74c3c;
    outline-offset: 5px;
}`,
    hints: ['box-shadow: x y blur spread color', 'يمكن إضافة عدة ظلال بفاصلة'],
    testCases: [
      {
        input: '',
        expectedOutput: 'shadows applied',
        description: 'ظلال مطبقة',
      },
      {
        input: '',
        expectedOutput: 'text shadow visible',
        description: 'ظل النص مرئي',
      },
    ],
    isLocked: false,
    category: 'effects',
  },
];

// ===== تحديات CSS المتوسطة =====
export const CSS_CHALLENGES_INTERMEDIATE: Challenge[] = [
  {
    id: 'css-ch-int-1',
    title: 'Flexbox Layout',
    description: 'أنشئ تخطيط باستخدام Flexbox',
    difficulty: 'medium',
    points: 25,
    language: 'CSS',
    icon: 'view-column',
    starterCode: `.container {
    /* استخدم Flexbox */
}

.item {
    /* نسق العناصر */
}`,
    solution: `.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 20px;
    flex-wrap: wrap;
}

.item {
    flex: 1 1 200px;
    min-width: 150px;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    text-align: center;
    color: white;
}`,
    hints: [
      'display: flex لتفعيل Flexbox',
      'justify-content للتوزيع الأفقي',
      'align-items للمحاذاة العمودية',
    ],
    testCases: [
      { input: '', expectedOutput: 'flex layout', description: 'تخطيط مرن' },
      {
        input: '',
        expectedOutput: 'items centered',
        description: 'عناصر متمركزة عمودياً',
      },
    ],
    isLocked: false,
    category: 'layout',
  },
  {
    id: 'css-ch-int-2',
    title: 'CSS Grid',
    description: 'أنشئ شبكة باستخدام Grid',
    difficulty: 'medium',
    points: 30,
    language: 'CSS',
    icon: 'grid-on',
    starterCode: `.grid-container {
    /* استخدم CSS Grid */
}

.grid-item {
    /* نسق العناصر */
}`,
    solution: `.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px;
}

.grid-item {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
}

.grid-item:hover {
    transform: scale(1.02);
}

/* عنصر يأخذ مساحة أكبر */
.grid-item.featured {
    grid-column: span 2;
}`,
    hints: [
      'display: grid لتفعيل Grid',
      'grid-template-columns لتحديد الأعمدة',
      'auto-fit مع minmax للاستجابة',
    ],
    testCases: [
      { input: '', expectedOutput: 'grid layout', description: 'تخطيط شبكي' },
      {
        input: '',
        expectedOutput: 'hover scale effect',
        description: 'تأثير تكبير عند المرور',
      },
    ],
    isLocked: false,
    category: 'layout',
  },
  {
    id: 'css-ch-int-3',
    title: 'Responsive Design',
    description: 'اجعل التصميم متجاوب',
    difficulty: 'medium',
    points: 35,
    language: 'CSS',
    icon: 'devices',
    starterCode: `.card {
    /* تنسيق البطاقة */
}

@media (max-width: 768px) {
    /* تنسيقات للموبايل */
}`,
    solution: `.card {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 30px;
    padding: 30px;
    background: white;
    border-radius: 16px;
}

.card-image {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: 12px;
}

.card-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

@media (max-width: 768px) {
    .card {
        grid-template-columns: 1fr;
        padding: 20px;
    }
    
    .card-image {
        height: 200px;
    }
    
    .card-content {
        text-align: center;
    }
}

@media (max-width: 480px) {
    .card {
        padding: 15px;
    }
    
    .card-image {
        height: 150px;
    }
}`,
    hints: [
      'استخدم @media للتصميم المتجاوب',
      'max-width للشاشات الصغيرة',
      'min-width للشاشات الكبيرة',
    ],
    testCases: [
      { input: '', expectedOutput: 'responsive', description: 'تصميم متجاوب' },
      {
        input: '',
        expectedOutput: 'mobile layout',
        description: 'تخطيط مناسب للموبايل',
      },
    ],
    isLocked: false,
    category: 'responsive',
  },
  {
    id: 'css-ch-int-4',
    title: 'Input Styling',
    description: 'صمم حقول إدخال جميلة',
    difficulty: 'medium',
    points: 30,
    language: 'CSS',
    icon: 'text-fields',
    starterCode: `.form-group {
    /* تنسيق مجموعة الحقل */
}

.input-field {
    /* نسق حقل الإدخال */
}

.input-field:focus {
    /* تنسيق عند التركيز */
}

.input-label {
    /* تنسيق التسمية */
}

.input-field:focus + .input-label,
.input-field:not(:placeholder-shown) + .input-label {
    /* تنسيق التسمية عند التركيز */
}`,
    solution: `.form-group {
    position: relative;
    margin-bottom: 25px;
}

.input-field {
    width: 100%;
    padding: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    background: transparent;
    transition: border-color 0.3s, box-shadow 0.3s;
}

.input-field:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.input-label {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    pointer-events: none;
    transition: all 0.3s;
}

.input-field:focus + .input-label,
.input-field:not(:placeholder-shown) + .input-label {
    top: 0;
    font-size: 12px;
    background: white;
    padding: 0 5px;
    color: #667eea;
}`,
    hints: [
      'استخدم :focus للتنسيق عند التركيز',
      'أضف transition للحركة السلسة',
      'استخدم position absolute للـ label',
    ],
    testCases: [
      { input: '', expectedOutput: 'styled input', description: 'حقل منسق' },
      {
        input: '',
        expectedOutput: 'focus glow effect',
        description: 'تأثير توهج عند التركيز',
      },
    ],
    isLocked: false,
    category: 'forms',
  },
];

// ===== تحديات CSS المتقدمة =====
export const CSS_CHALLENGES: Challenge[] = [
  {
    id: 'css-ch-1',
    title: 'زر جذاب',
    description: 'أنشئ زر بتأثير hover جميل',
    difficulty: 'easy',
    points: 15,
    language: 'CSS',
    icon: 'touch-app',
    starterCode: `.button {
    /* أضف تنسيقاتك هنا */
    
}

.button:hover {
    /* تأثير عند المرور */
    
}`,
    solution: `.button {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    padding: 15px 30px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
}

.button:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}`,
    hints: [
      'استخدم linear-gradient للخلفية',
      'أضف transition للحركة السلسة',
      'استخدم transform: translateY للرفع',
    ],
    testCases: [
      {
        input: '',
        expectedOutput: 'hover effect',
        description: 'يجب أن يكون للزر تأثير عند المرور',
      },
      {
        input: '',
        expectedOutput: 'gradient background',
        description: 'خلفية متدرجة للزر',
      },
    ],
    isLocked: false,
    category: 'buttons',
  },
  {
    id: 'css-ch-2',
    title: 'بطاقة منتج',
    description: 'صمم بطاقة منتج احترافية',
    difficulty: 'medium',
    points: 30,
    language: 'CSS',
    icon: 'credit-card',
    starterCode: `.product-card {
    /* تنسيق البطاقة */
}

.product-image {
    /* تنسيق الصورة */
}

.product-info {
    /* تنسيق المعلومات */
}`,
    solution: `.product-card {
    width: 300px;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.product-info {
    padding: 20px;
}

.product-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 10px;
}

.product-price {
    color: #3498db;
    font-size: 1.5rem;
    font-weight: bold;
}`,
    hints: [
      'استخدم overflow: hidden للزوايا المدورة',
      'object-fit: cover للصور',
      'أضف ظل وتحريك عند hover',
    ],
    testCases: [
      {
        input: '',
        expectedOutput: 'card layout',
        description: 'يجب أن تكون البطاقة منظمة',
      },
      {
        input: '',
        expectedOutput: 'hover animation',
        description: 'حركة رفع عند المرور',
      },
    ],
    isLocked: false,
    category: 'cards',
  },
  {
    id: 'css-ch-3',
    title: 'قائمة متحركة',
    description: 'أنشئ قائمة navigation بحركات',
    difficulty: 'medium',
    points: 35,
    language: 'CSS',
    icon: 'menu',
    starterCode: `.nav {
    /* تنسيق القائمة الرئيسية */
}

.nav-link {
    /* تنسيق الروابط */
}

.nav-link:hover {
    /* تأثير المرور */
}`,
    solution: `.nav {
    display: flex;
    justify-content: center;
    gap: 30px;
    padding: 20px;
    background: #1a1a2e;
}

.nav-link {
    position: relative;
    color: #fff;
    text-decoration: none;
    font-size: 16px;
    padding: 10px 0;
    transition: color 0.3s;
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    transition: width 0.3s ease;
}

.nav-link:hover {
    color: #667eea;
}

.nav-link:hover::after {
    width: 100%;
}`,
    hints: [
      'استخدم ::after للخط تحت الرابط',
      'حرك width من 0 إلى 100%',
      'استخدم position: relative للرابط و absolute للخط',
    ],
    testCases: [
      {
        input: '',
        expectedOutput: 'animated underline',
        description: 'يجب أن يكون للروابط خط متحرك',
      },
      {
        input: '',
        expectedOutput: 'flex navigation',
        description: 'تخطيط مرن للقائمة',
      },
    ],
    isLocked: false,
    category: 'navigation',
  },
  {
    id: 'css-ch-4',
    title: 'Loading Spinner',
    description: 'أنشئ مؤشر تحميل متحرك',
    difficulty: 'hard',
    points: 50,
    language: 'CSS',
    icon: 'refresh',
    starterCode: `.spinner {
    /* تنسيق المؤشر */
}

@keyframes spin {
    /* حركة الدوران */
}`,
    solution: `.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(102, 126, 234, 0.2);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* نسخة متقدمة */
.spinner-advanced {
    width: 50px;
    height: 50px;
    position: relative;
}

.spinner-advanced::before,
.spinner-advanced::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
}

.spinner-advanced::before {
    width: 100%;
    height: 100%;
    background: rgba(102, 126, 234, 0.3);
}

.spinner-advanced::after {
    width: 70%;
    height: 70%;
    top: 15%;
    left: 15%;
    background: #667eea;
    animation-delay: -1s;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.3);
        opacity: 0.5;
    }
}`,
    hints: [
      'استخدم border-radius: 50% لجعله دائري',
      'لون حد واحد فقط (border-top-color)',
      '@keyframes للدوران من 0 إلى 360 درجة',
    ],
    testCases: [
      {
        input: '',
        expectedOutput: 'rotating animation',
        description: 'يجب أن يدور المؤشر',
      },
      {
        input: '',
        expectedOutput: 'infinite loop',
        description: 'حركة دوران مستمرة',
      },
    ],
    isLocked: true,
    category: 'animations',
  },
  {
    id: 'css-ch-5',
    title: 'Dark Mode Toggle',
    description: 'زر تبديل الوضع المظلم',
    difficulty: 'hard',
    points: 60,
    language: 'CSS',
    icon: 'brightness-4',
    starterCode: `:root {
    /* متغيرات الوضع الفاتح */
}

.dark-mode {
    /* متغيرات الوضع المظلم */
}

.toggle-switch {
    /* تنسيق زر التبديل */
}`,
    solution: `:root {
    --bg-color: #ffffff;
    --text-color: #1a1a2e;
    --card-bg: #f5f5f5;
    --primary: #667eea;
}

.dark-mode {
    --bg-color: #1a1a2e;
    --text-color: #ffffff;
    --card-bg: #2a2a4e;
}

body {
    background: var(--bg-color);
    color: var(--text-color);
    transition: background 0.3s, color 0.3s;
}

.toggle-switch {
    width: 60px;
    height: 30px;
    background: var(--card-bg);
    border-radius: 15px;
    position: relative;
    cursor: pointer;
    transition: background 0.3s;
}

.toggle-switch::before {
    content: '☀️';
    position: absolute;
    width: 26px;
    height: 26px;
    background: var(--primary);
    border-radius: 50%;
    top: 2px;
    left: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: transform 0.3s, content 0.3s;
}

.dark-mode .toggle-switch::before {
    content: '🌙';
    transform: translateX(30px);
}`,
    hints: [
      'استخدم CSS Variables للألوان',
      'بدّل المتغيرات بإضافة class للـ body',
      'حرك الدائرة بـ transform: translateX',
    ],
    testCases: [
      {
        input: '',
        expectedOutput: 'theme switch',
        description: 'يجب أن يغير الألوان',
      },
      {
        input: '',
        expectedOutput: 'css variables used',
        description: 'استخدام متغيرات CSS للألوان',
      },
    ],
    isLocked: true,
    category: 'themes',
  },
];

// تصدير الكل
export const ALL_CSS_LESSONS = [
  ...CSS_LESSONS_BEGINNER,
  ...CSS_LESSONS_ADVANCED,
];
export const ALL_CSS_CHALLENGES = [
  ...CSS_CHALLENGES_BEGINNER,
  ...CSS_CHALLENGES_INTERMEDIATE,
  ...CSS_CHALLENGES,
];

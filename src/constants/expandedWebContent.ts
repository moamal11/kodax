/**
 * محتوى موسّع لتطوير الويب - Expanded Web Development Content
 * دروس وتحديات إضافية شاملة (تم تنظيفها من التكرارات)
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس HTML المتقدمة (تم إزالة المكرر) =====
// ملاحظة: الدروس التالية تم دمجها في courseData.ts:
// - html-forms-001 (مكرر مع html-6, html-7)
// - html-semantic-001 (مكرر مع html-8)
// - html-tables-001 (مكرر مع html-5)
export const EXPANDED_HTML_LESSONS: Lesson[] = [
  {
    id: 'html-forms-001',
    courseId: 'web-html-basics',
    title: 'النماذج - Forms',
    description: 'تعلم إنشاء نماذج تفاعلية للمستخدمين',
    content: `
# النماذج في HTML

## ما هي النماذج؟
النماذج تسمح للمستخدمين بإدخال بيانات وإرسالها للخادم.

## العناصر الأساسية

### عنصر form
\`\`\`html
<form action="/submit" method="POST">
  <!-- محتوى النموذج -->
</form>
\`\`\`

### أنواع الحقول
- \`text\` - نص عادي
- \`email\` - بريد إلكتروني
- \`password\` - كلمة مرور
- \`number\` - أرقام
- \`tel\` - رقم هاتف
- \`date\` - تاريخ
- \`checkbox\` - مربع اختيار
- \`radio\` - زر اختيار
- \`file\` - رفع ملفات

## التحقق من البيانات (Validation)
HTML5 يوفر تحقق مدمج:
- \`required\` - حقل مطلوب
- \`minlength\` / \`maxlength\` - طول النص
- \`min\` / \`max\` - للأرقام
- \`pattern\` - نمط regex
`,
    codeExample: `<!-- نموذج تسجيل دخول -->
<form action="/login" method="POST">
  <div>
    <label for="email">البريد الإلكتروني:</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      required 
      placeholder="example@email.com"
    >
  </div>
  
  <div>
    <label for="password">كلمة المرور:</label>
    <input 
      type="password" 
      id="password" 
      name="password" 
      required 
      minlength="8"
    >
  </div>
  
  <div>
    <input type="checkbox" id="remember" name="remember">
    <label for="remember">تذكرني</label>
  </div>
  
  <button type="submit">تسجيل الدخول</button>
</form>

<!-- نموذج تسجيل كامل -->
<form action="/register" method="POST" enctype="multipart/form-data">
  <fieldset>
    <legend>المعلومات الشخصية</legend>
    
    <input type="text" name="fullname" placeholder="الاسم الكامل" required>
    <input type="email" name="email" placeholder="البريد" required>
    <input type="tel" name="phone" placeholder="رقم الهاتف" pattern="[0-9]{11}">
    <input type="date" name="birthdate">
    
    <select name="country">
      <option value="">اختر الدولة</option>
      <option value="iq">العراق</option>
      <option value="eg">مصر</option>
      <option value="sa">السعودية</option>
    </select>
    
    <textarea name="bio" placeholder="نبذة عنك" rows="4"></textarea>
    
    <input type="file" name="avatar" accept="image/*">
  </fieldset>
  
  <button type="submit">إنشاء حساب</button>
</form>`,
    language: 'html',
    xpReward: 120,
    order: 5,
    quiz: {
      question: 'أي خاصية تجعل الحقل مطلوباً؟',
      options: ['important', 'required', 'mandatory', 'needed'],
      correctAnswer: 1,
      explanation: 'خاصية required تجعل الحقل إلزامياً للتعبئة',
    },
  },
  {
    id: 'html-semantic-001',
    courseId: 'web-html-basics',
    title: 'العناصر الدلالية - Semantic HTML',
    description: 'اجعل صفحاتك أكثر وضوحاً ومفهومة',
    content: `
# العناصر الدلالية في HTML5

## لماذا الـ Semantic HTML؟
- أفضل لـ SEO (محركات البحث)
- أفضل للوصولية (قارئات الشاشة)
- كود أوضح وأسهل للصيانة

## العناصر الدلالية الرئيسية

### هيكل الصفحة
- \`<header>\` - رأس الصفحة
- \`<nav>\` - قائمة التنقل
- \`<main>\` - المحتوى الرئيسي
- \`<article>\` - مقال مستقل
- \`<section>\` - قسم من المحتوى
- \`<aside>\` - محتوى جانبي
- \`<footer>\` - تذييل الصفحة

### عناصر إضافية
- \`<figure>\` + \`<figcaption>\` - صورة مع وصف
- \`<time>\` - تاريخ/وقت
- \`<mark>\` - نص محدد
- \`<details>\` + \`<summary>\` - محتوى قابل للطي
`,
    codeExample: `<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
  <meta charset="UTF-8">
  <title>موقع دلالي</title>
</head>
<body>

  <!-- رأس الصفحة -->
  <header>
    <h1>موقعي</h1>
    <nav>
      <ul>
        <li><a href="/">الرئيسية</a></li>
        <li><a href="/about">من نحن</a></li>
        <li><a href="/contact">اتصل بنا</a></li>
      </ul>
    </nav>
  </header>

  <!-- المحتوى الرئيسي -->
  <main>
    <article>
      <header>
        <h2>عنوان المقال</h2>
        <p>بواسطة <strong>أحمد</strong> في <time datetime="2024-01-15">15 يناير 2024</time></p>
      </header>
      
      <section>
        <h3>المقدمة</h3>
        <p>هذا هو محتوى المقدمة...</p>
      </section>
      
      <section>
        <h3>التفاصيل</h3>
        <p>هذا هو محتوى التفاصيل...</p>
        
        <figure>
          <img src="diagram.png" alt="رسم توضيحي">
          <figcaption>شكل 1: رسم توضيحي للمفهوم</figcaption>
        </figure>
      </section>
      
      <footer>
        <p>التصنيفات: <mark>تقنية</mark>, <mark>برمجة</mark></p>
      </footer>
    </article>

    <!-- الشريط الجانبي -->
    <aside>
      <h3>مقالات ذات صلة</h3>
      <ul>
        <li><a href="#">مقال 1</a></li>
        <li><a href="#">مقال 2</a></li>
      </ul>
    </aside>
  </main>

  <!-- تذييل الصفحة -->
  <footer>
    <p>&copy; 2024 جميع الحقوق محفوظة</p>
  </footer>

</body>
</html>`,
    language: 'html',
    xpReward: 100,
    order: 6,
    quiz: {
      question: 'أي عنصر يُستخدم للمحتوى الرئيسي للصفحة؟',
      options: ['<content>', '<main>', '<body>', '<primary>'],
      correctAnswer: 1,
      explanation: 'عنصر <main> يحدد المحتوى الرئيسي والفريد للصفحة',
    },
  },
  {
    id: 'html-tables-001',
    courseId: 'web-html-basics',
    title: 'الجداول - Tables',
    description: 'عرض البيانات بشكل منظم',
    content: `
# الجداول في HTML

## متى نستخدم الجداول؟
- عرض بيانات جدولية (إحصائيات، أسعار، جداول زمنية)
- **ليس للتخطيط!** استخدم CSS Grid أو Flexbox

## عناصر الجدول

### الأساسية
- \`<table>\` - الجدول
- \`<tr>\` - صف (table row)
- \`<td>\` - خلية بيانات (table data)
- \`<th>\` - خلية عنوان (table header)

### البنية
- \`<thead>\` - رأس الجدول
- \`<tbody>\` - جسم الجدول
- \`<tfoot>\` - تذييل الجدول
- \`<caption>\` - عنوان الجدول

### الخصائص المهمة
- \`colspan\` - دمج أعمدة
- \`rowspan\` - دمج صفوف
- \`scope\` - نطاق العنوان (للوصولية)
`,
    codeExample: `<!-- جدول منتجات -->
<table>
  <caption>قائمة أسعار المنتجات</caption>
  
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">المنتج</th>
      <th scope="col">الكمية</th>
      <th scope="col">السعر</th>
    </tr>
  </thead>
  
  <tbody>
    <tr>
      <td>1</td>
      <td>لابتوب</td>
      <td>2</td>
      <td>1,500,000 د.ع</td>
    </tr>
    <tr>
      <td>2</td>
      <td>ماوس</td>
      <td>5</td>
      <td>25,000 د.ع</td>
    </tr>
    <tr>
      <td>3</td>
      <td>كيبورد</td>
      <td>3</td>
      <td>50,000 د.ع</td>
    </tr>
  </tbody>
  
  <tfoot>
    <tr>
      <th colspan="3" scope="row">المجموع</th>
      <td>3,175,000 د.ع</td>
    </tr>
  </tfoot>
</table>

<!-- جدول مع دمج خلايا -->
<table>
  <tr>
    <th rowspan="2">الاسم</th>
    <th colspan="2">الدرجات</th>
  </tr>
  <tr>
    <th>النظري</th>
    <th>العملي</th>
  </tr>
  <tr>
    <td>أحمد</td>
    <td>85</td>
    <td>90</td>
  </tr>
  <tr>
    <td>سارة</td>
    <td>92</td>
    <td>88</td>
  </tr>
</table>`,
    language: 'html',
    xpReward: 100,
    order: 7,
    quiz: {
      question: 'ما هو الفرق بين <td> و <th>؟',
      options: [
        'لا فرق بينهما',
        '<th> للعناوين و <td> للبيانات',
        '<td> للعناوين و <th> للبيانات',
        '<th> للصفوف و <td> للأعمدة',
      ],
      correctAnswer: 1,
      explanation: '<th> تُستخدم لخلايا العناوين بينما <td> للبيانات العادية',
    },
  },
];

// ===== تحديات HTML المتقدمة =====
export const EXPANDED_HTML_CHALLENGES: Challenge[] = [
  {
    id: 'html-ch-form-001',
    title: 'نموذج التسجيل المتكامل',
    description: 'أنشئ نموذج تسجيل مستخدم مع جميع أنواع الحقول والتحقق',
    difficulty: 'medium',
    points: 60,
    language: 'HTML',
    icon: 'document-text',
    category: 'web',
    starterCode: `<!-- أنشئ نموذج تسجيل يحتوي على:
- الاسم الكامل (مطلوب)
- البريد الإلكتروني (مطلوب)
- كلمة المرور (8 أحرف على الأقل)
- تأكيد كلمة المرور
- رقم الهاتف (11 رقم)
- تاريخ الميلاد
- الجنس (ذكر/أنثى)
- الموافقة على الشروط
-->

<form>
  <!-- اكتب كودك هنا -->
</form>`,
    solution: `<form action="/register" method="POST">
  <label>الاسم الكامل:
    <input type="text" name="fullname" required minlength="3">
  </label>
  
  <label>البريد الإلكتروني:
    <input type="email" name="email" required>
  </label>
  
  <label>كلمة المرور:
    <input type="password" name="password" required minlength="8">
  </label>
  
  <label>تأكيد كلمة المرور:
    <input type="password" name="confirm_password" required minlength="8">
  </label>
  
  <label>رقم الهاتف:
    <input type="tel" name="phone" pattern="[0-9]{11}">
  </label>
  
  <label>تاريخ الميلاد:
    <input type="date" name="birthdate">
  </label>
  
  <fieldset>
    <legend>الجنس:</legend>
    <label><input type="radio" name="gender" value="male" required> ذكر</label>
    <label><input type="radio" name="gender" value="female"> أنثى</label>
  </fieldset>
  
  <label>
    <input type="checkbox" name="terms" required>
    أوافق على الشروط والأحكام
  </label>
  
  <button type="submit">تسجيل</button>
</form>`,
    hints: [
      'استخدم type="email" للبريد الإلكتروني',
      'استخدم minlength="8" لكلمة المرور',
      'استخدم pattern للهاتف',
      'استخدم radio للجنس',
    ],
    testCases: [
      {
        input: 'form validation',
        expectedOutput: 'valid',
        description: 'النموذج يتحقق من البيانات',
      },
      {
        input: 'input types',
        expectedOutput: 'email, password, tel, date, radio, checkbox',
        description: 'أنواع الحقول المطلوبة موجودة',
      },
    ],
    isLocked: false,
  },
  {
    id: 'html-ch-semantic-001',
    title: 'صفحة مدونة دلالية',
    description: 'حول صفحة تستخدم div فقط إلى صفحة دلالية',
    difficulty: 'easy',
    points: 40,
    language: 'HTML',
    icon: 'code-slash',
    category: 'web',
    starterCode: `<!-- حول هذه الصفحة لتستخدم عناصر HTML5 الدلالية -->
<div class="header">
  <div class="logo">مدونتي</div>
  <div class="nav">
    <a href="/">الرئيسية</a>
    <a href="/about">من نحن</a>
  </div>
</div>

<div class="main">
  <div class="article">
    <div class="article-header">
      <h1>عنوان المقال</h1>
      <span>15 يناير 2024</span>
    </div>
    <div class="article-content">
      <p>محتوى المقال...</p>
    </div>
  </div>
  
  <div class="sidebar">
    <h2>مقالات أخرى</h2>
  </div>
</div>

<div class="footer">
  <p>حقوق النشر 2024</p>
</div>`,
    solution: `<header>
  <h1>مدونتي</h1>
  <nav>
    <a href="/">الرئيسية</a>
    <a href="/about">من نحن</a>
  </nav>
</header>

<main>
  <article>
    <header>
      <h2>عنوان المقال</h2>
      <time datetime="2024-01-15">15 يناير 2024</time>
    </header>
    <p>محتوى المقال...</p>
  </article>
  
  <aside>
    <h3>مقالات أخرى</h3>
  </aside>
</main>

<footer>
  <p>حقوق النشر 2024</p>
</footer>`,
    hints: [
      'استبدل div.header بـ <header>',
      'استبدل div.nav بـ <nav>',
      'استخدم <main> للمحتوى الرئيسي',
      'استخدم <time> للتاريخ',
    ],
    testCases: [
      {
        input: 'semantic elements',
        expectedOutput: 'present',
        description: 'العناصر الدلالية موجودة',
      },
      {
        input: 'no div wrappers',
        expectedOutput: 'header, nav, main, article, aside, footer',
        description: 'جميع عناصر div تم استبدالها بعناصر دلالية',
      },
    ],
    isLocked: false,
  },
  {
    id: 'html-ch-table-001',
    title: 'جدول الدرجات',
    description: 'أنشئ جدول HTML لعرض درجات الطلاب مع رأس وتذييل',
    difficulty: 'easy',
    points: 30,
    language: 'HTML',
    icon: 'grid-outline',
    category: 'web',
    starterCode: `<!-- أنشئ جدول درجات يحتوي على:
- رأس الجدول (thead) مع أعمدة: الاسم، الرياضيات، العلوم، المعدل
- 3 طلاب على الأقل (tbody)
- تذييل (tfoot) يعرض المعدل العام
- استخدم colspan عند الحاجة
-->

<table>
  <!-- اكتب كودك هنا -->
</table>`,
    solution: `<table border="1">
  <thead>
    <tr>
      <th>الاسم</th>
      <th>الرياضيات</th>
      <th>العلوم</th>
      <th>المعدل</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>أحمد</td>
      <td>85</td>
      <td>90</td>
      <td>87.5</td>
    </tr>
    <tr>
      <td>سارة</td>
      <td>92</td>
      <td>88</td>
      <td>90</td>
    </tr>
    <tr>
      <td>محمد</td>
      <td>78</td>
      <td>82</td>
      <td>80</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="3">المعدل العام</td>
      <td>85.8</td>
    </tr>
  </tfoot>
</table>`,
    hints: [
      'استخدم <thead> لرأس الجدول و <tbody> للبيانات',
      'استخدم <th> للعناوين و <td> للبيانات',
      'استخدم colspan لدمج الخلايا في التذييل',
    ],
    testCases: [
      {
        input: 'table structure',
        expectedOutput: 'thead, tbody, tfoot',
        description: 'هيكل الجدول صحيح',
      },
      {
        input: 'average calculation',
        expectedOutput: '85.8',
        description: 'المعدل العام محسوب بشكل صحيح',
      },
    ],
    isLocked: false,
  },
  {
    id: 'html-ch-media-001',
    title: 'صفحة الوسائط المتعددة',
    description: 'أنشئ صفحة تحتوي على فيديو وصوت وصور مع عناصر HTML5',
    difficulty: 'easy',
    points: 35,
    language: 'HTML',
    icon: 'videocam-outline',
    category: 'web',
    starterCode: `<!-- أنشئ صفحة وسائط تحتوي على:
1. فيديو مع عناصر التحكم وposter
2. ملف صوتي مع عناصر التحكم
3. صورة مع figure و figcaption
4. استخدم source لدعم صيغ متعددة
-->

<div>
  <!-- اكتب كودك هنا -->
</div>`,
    solution: `<section>
  <h2>معرض الوسائط</h2>
  
  <figure>
    <video controls poster="thumb.jpg" width="640">
      <source src="video.mp4" type="video/mp4">
      <source src="video.webm" type="video/webm">
      متصفحك لا يدعم الفيديو
    </video>
    <figcaption>فيديو تعليمي</figcaption>
  </figure>

  <figure>
    <audio controls>
      <source src="audio.mp3" type="audio/mpeg">
      <source src="audio.ogg" type="audio/ogg">
      متصفحك لا يدعم الصوت
    </audio>
    <figcaption>بودكاست تعليمي</figcaption>
  </figure>

  <figure>
    <img src="photo.jpg" alt="وصف الصورة" width="400" loading="lazy">
    <figcaption>صورة توضيحية</figcaption>
  </figure>
</section>`,
    hints: [
      'استخدم <video> مع controls و poster',
      'استخدم <source> لتوفير صيغ بديلة',
      'استخدم <figure> و <figcaption> لتوصيف الوسائط',
      'أضف نص بديل في حالة عدم دعم المتصفح',
    ],
    testCases: [
      {
        input: 'media elements',
        expectedOutput: 'video, audio, figure',
        description: 'عناصر الوسائط موجودة',
      },
      {
        input: 'fallback text',
        expectedOutput: 'present for video and audio',
        description: 'نصوص بديلة موجودة في حالة عدم دعم المتصفح',
      },
    ],
    isLocked: false,
  },
  {
    id: 'html-ch-nav-001',
    title: 'شريط تنقل متجاوب',
    description: 'أنشئ شريط تنقل مع قائمة منسدلة باستخدام HTML و CSS',
    difficulty: 'medium',
    points: 55,
    language: 'HTML',
    icon: 'menu-outline',
    category: 'web',
    starterCode: `<!-- أنشئ شريط تنقل يحتوي على:
1. شعار الموقع
2. روابط رئيسية (الرئيسية، الدورات، المقالات، اتصل بنا)
3. قائمة منسدلة تحت "الدورات" (HTML, CSS, JS)
4. استخدم العناصر الدلالية المناسبة
-->

<nav>
  <!-- اكتب كودك هنا -->
</nav>`,
    solution: `<nav>
  <div class="logo">
    <a href="/">Kodax</a>
  </div>
  <ul class="nav-links">
    <li><a href="/">الرئيسية</a></li>
    <li class="dropdown">
      <a href="/courses">الدورات ▼</a>
      <ul class="dropdown-menu">
        <li><a href="/html">HTML</a></li>
        <li><a href="/css">CSS</a></li>
        <li><a href="/js">JavaScript</a></li>
      </ul>
    </li>
    <li><a href="/articles">المقالات</a></li>
    <li><a href="/contact">اتصل بنا</a></li>
  </ul>
</nav>

<style>
  nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #1a1a3e; }
  .nav-links { display: flex; list-style: none; gap: 1.5rem; }
  .nav-links a { color: white; text-decoration: none; }
  .dropdown { position: relative; }
  .dropdown-menu { display: none; position: absolute; background: #252550; list-style: none; padding: 0.5rem 0; min-width: 150px; }
  .dropdown:hover .dropdown-menu { display: block; }
  .dropdown-menu li a { display: block; padding: 0.5rem 1rem; }
</style>`,
    hints: [
      'استخدم <nav> و <ul> للقائمة',
      'استخدم position: relative/absolute للقائمة المنسدلة',
      'استخدم :hover لإظهار القائمة المنسدلة',
    ],
    testCases: [
      {
        input: 'nav structure',
        expectedOutput: 'nav with dropdown',
        description: 'شريط التنقل مع قائمة منسدلة',
      },
      {
        input: 'link count',
        expectedOutput: '4 main links + 3 dropdown items',
        description: 'عدد الروابط الرئيسية والفرعية صحيح',
      },
    ],
    isLocked: false,
  },
  {
    id: 'html-ch-faq-001',
    title: 'صفحة أسئلة شائعة تفاعلية',
    description: 'أنشئ صفحة FAQ تفاعلية باستخدام details و summary',
    difficulty: 'medium',
    points: 45,
    language: 'HTML',
    icon: 'help-circle-outline',
    category: 'web',
    starterCode: `<!-- أنشئ صفحة أسئلة شائعة تحتوي على:
1. عنوان رئيسي
2. 5 أسئلة على الأقل باستخدام <details> و <summary>
3. أحد الأسئلة مفتوح افتراضياً (open)
4. أضف تنسيق CSS مناسب
-->

<section>
  <h1>الأسئلة الشائعة</h1>
  <!-- اكتب كودك هنا -->
</section>`,
    solution: `<section class="faq">
  <h1>الأسئلة الشائعة</h1>
  
  <details open>
    <summary>ما هو Kodax؟</summary>
    <p>Kodax هو تطبيق تعليمي لتعلم البرمجة باللغة العربية.</p>
  </details>

  <details>
    <summary>هل التطبيق مجاني؟</summary>
    <p>نعم، الميزات الأساسية مجانية مع خيارات اشتراك للمحتوى المتقدم.</p>
  </details>

  <details>
    <summary>ما اللغات المتاحة؟</summary>
    <p>نوفر دورات في HTML, CSS, JavaScript, Python, C++ والمزيد.</p>
  </details>

  <details>
    <summary>كيف أحصل على XP؟</summary>
    <p>تحصل على XP عند إكمال الدروس وحل التحديات لأول مرة.</p>
  </details>

  <details>
    <summary>كيف أتواصل مع الدعم؟</summary>
    <p>يمكنك التواصل عبر البريد الإلكتروني أو صفحة التواصل.</p>
  </details>
</section>

<style>
  .faq { max-width: 700px; margin: 0 auto; }
  details { margin: 1rem 0; padding: 1rem; background: #1a1a3e; border-radius: 8px; }
  summary { cursor: pointer; font-weight: bold; color: #3b82f6; }
  details p { margin-top: 0.5rem; color: #9ca3af; }
</style>`,
    hints: [
      'استخدم <details> و <summary> لكل سؤال',
      'أضف open للسؤال المفتوح افتراضياً',
      'استخدم CSS لتنسيق الأسئلة',
    ],
    testCases: [
      {
        input: 'details elements',
        expectedOutput: '5 or more',
        description: 'عدد الأسئلة كافي',
      },
      {
        input: 'open attribute',
        expectedOutput: 'one details has open',
        description: 'سؤال واحد على الأقل مفتوح افتراضياً',
      },
    ],
    isLocked: false,
  },
];

// ===== درس الروابط والصور =====
export const HTML_LINKS_IMAGES_LESSON: Lesson = {
  id: 'html-links-images-001',
  courseId: 'web-html-basics',
  title: 'الروابط والصور',
  description: 'ربط الصفحات وإضافة الصور',
  content: `
# الروابط والصور في HTML

## الروابط (Links)

### الرابط الأساسي
\`\`\`html
<a href="https://example.com">نص الرابط</a>
\`\`\`

### أنواع الروابط
- **رابط خارجي**: لموقع آخر
- **رابط داخلي**: لصفحة في موقعك
- **رابط تنزيل**: لتحميل ملف
- **رابط البريد**: لفتح برنامج البريد

### خاصية target
- \`_self\` - نفس الصفحة (افتراضي)
- \`_blank\` - صفحة جديدة

## الصور (Images)

### عنصر الصورة
\`\`\`html
<img src="image.jpg" alt="وصف الصورة">
\`\`\`

### خصائص مهمة
- \`src\` - مسار الصورة (مطلوب)
- \`alt\` - نص بديل (مطلوب للوصولية)
- \`width\` و \`height\` - الأبعاد
- \`loading="lazy"\` - تحميل كسول

## صورة كرابط
\`\`\`html
<a href="page.html">
  <img src="logo.png" alt="الشعار">
</a>
\`\`\`
`,
  codeExample: `<!-- رابط خارجي -->
<a href="https://google.com" target="_blank">
  زيارة جوجل
</a>

<!-- رابط داخلي -->
<a href="about.html">من نحن</a>
<a href="contact.html">اتصل بنا</a>

<!-- رابط لقسم في الصفحة -->
<a href="#section1">اذهب للقسم الأول</a>
<section id="section1">
  <h2>القسم الأول</h2>
</section>

<!-- رابط تحميل -->
<a href="file.pdf" download>تحميل الملف</a>

<!-- رابط بريد -->
<a href="mailto:info@example.com">راسلنا</a>

<!-- رابط هاتف -->
<a href="tel:+9647700000000">اتصل بنا</a>

<!-- صورة أساسية -->
<img src="photo.jpg" alt="صورة المنظر">

<!-- صورة مع أبعاد -->
<img 
  src="profile.png" 
  alt="صورة الملف الشخصي"
  width="200" 
  height="200"
>

<!-- صورة مع تحميل كسول -->
<img 
  src="large-image.jpg" 
  alt="صورة كبيرة"
  loading="lazy"
>

<!-- صورة كرابط -->
<a href="gallery.html">
  <img src="thumbnail.jpg" alt="معرض الصور">
</a>

<!-- صورة من مجلد -->
<img src="images/logo.png" alt="شعار الموقع">
<img src="../images/banner.jpg" alt="بانر">`,
  language: 'html',
  xpReward: 100,
  order: 4,
  quiz: {
    question: 'ما الخاصية المطلوبة في عنصر الصورة للوصولية؟',
    options: ['src', 'width', 'alt', 'title'],
    correctAnswer: 2,
    explanation: 'alt توفر نصاً بديلاً للصورة يقرأه قارئات الشاشة للمكفوفين',
  },
};

// ===== درس Git الأساسي للنشر =====
export const GIT_BASICS_LESSON: Lesson = {
  id: 'deploy-git-basics',
  courseId: 'web-deployment',
  title: 'أساسيات Git و GitHub',
  description: 'تعلم Git قبل نشر موقعك',
  content: `
# أساسيات Git و GitHub

## لماذا Git مهم؟
- **مطلوب** لـ Vercel, Netlify, GitHub Pages
- تتبع التغييرات في كودك
- التعاون مع فريق
- نسخ احتياطية

## المفاهيم الأساسية

### Repository (Repo)
مجلد مشروعك مع تاريخ التغييرات

### Commit
حفظ التغييرات مع رسالة تصف ما فعلت

### Branch
نسخة من الكود للعمل عليها

### Push
رفع الكود لـ GitHub

### Pull
جلب التحديثات من GitHub

## الأوامر الأساسية

### إنشاء مشروع جديد
\`\`\`bash
git init
\`\`\`

### إضافة الملفات
\`\`\`bash
git add .
\`\`\`

### حفظ التغييرات
\`\`\`bash
git commit -m "وصف التغييرات"
\`\`\`

### ربط بـ GitHub
\`\`\`bash
git remote add origin https://github.com/user/repo.git
\`\`\`

### رفع الكود
\`\`\`bash
git push -u origin main
\`\`\`

## سير العمل المعتاد

1. عدّل الملفات
2. \`git add .\` - أضف التغييرات
3. \`git commit -m "message"\` - احفظ
4. \`git push\` - ارفع لـ GitHub
`,
  codeExample: `# ===== إنشاء مشروع جديد =====

# 1. افتح المجلد في Terminal
cd my-project

# 2. ابدأ Git
git init

# 3. أضف كل الملفات
git add .

# 4. أول commit
git commit -m "Initial commit - بداية المشروع"

# 5. أنشئ Repository على GitHub
# اذهب لـ github.com → New Repository

# 6. اربط المشروع
git remote add origin https://github.com/username/my-project.git

# 7. ارفع الكود
git push -u origin main


# ===== العمل اليومي =====

# بعد تعديل الملفات
git add .
git commit -m "أضفت صفحة التواصل"
git push

# رؤية حالة الملفات
git status

# رؤية التاريخ
git log --oneline


# ===== ملف .gitignore =====
# أنشئ ملف .gitignore لتجاهل ملفات معينة

# محتوى .gitignore:
node_modules/
.env
.DS_Store
*.log
dist/`,
  language: 'bash',
  xpReward: 120,
  order: 0,
  quiz: {
    question: 'ما الأمر الذي يرفع الكود إلى GitHub؟',
    options: ['git add', 'git commit', 'git push', 'git init'],
    correctAnswer: 2,
    explanation: 'git push يرفع commits المحلية إلى GitHub',
  },
};

// ===== درس JSON في JavaScript =====
export const JS_JSON_LESSON: Lesson = {
  id: 'js-json-basics',
  courseId: 'web-js-basics',
  title: 'JSON - تنسيق البيانات',
  description: 'تحويل البيانات بين JavaScript والنص',
  content: `
# JSON في JavaScript

## ما هو JSON؟
**J**ava**S**cript **O**bject **N**otation
تنسيق نصي لتبادل البيانات.

## لماذا JSON مهم؟
- تبادل البيانات مع الخوادم (APIs)
- حفظ البيانات في localStorage
- ملفات الإعدادات (package.json)

## صيغة JSON

\`\`\`json
{
  "name": "أحمد",
  "age": 25,
  "isStudent": true,
  "hobbies": ["قراءة", "برمجة"],
  "address": {
    "city": "بغداد"
  }
}
\`\`\`

## القواعد المهمة
- المفاتيح **يجب** أن تكون بين علامات تنصيص
- النصوص بين علامات تنصيص مزدوجة فقط
- لا تعليقات
- لا فاصلة بعد آخر عنصر

## التحويل في JavaScript

### من Object إلى JSON (Stringify)
\`\`\`javascript
const obj = { name: "أحمد", age: 25 };
const json = JSON.stringify(obj);
// '{"name":"أحمد","age":25}'
\`\`\`

### من JSON إلى Object (Parse)
\`\`\`javascript
const json = '{"name":"أحمد","age":25}';
const obj = JSON.parse(json);
// { name: "أحمد", age: 25 }
\`\`\`

## استخدام مع localStorage
\`\`\`javascript
// حفظ
const user = { name: "أحمد" };
localStorage.setItem("user", JSON.stringify(user));

// قراءة
const saved = JSON.parse(localStorage.getItem("user"));
\`\`\`
`,
  codeExample: `// ===== JSON.stringify - تحويل لنص =====
const user = {
  name: "أحمد",
  age: 25,
  skills: ["JavaScript", "React"],
  isActive: true
};

const jsonString = JSON.stringify(user);
console.log(jsonString);
// {"name":"أحمد","age":25,"skills":["JavaScript","React"],"isActive":true}

// مع تنسيق (للقراءة)
const formatted = JSON.stringify(user, null, 2);
console.log(formatted);
/*
{
  "name": "أحمد",
  "age": 25,
  "skills": [
    "JavaScript",
    "React"
  ],
  "isActive": true
}
*/


// ===== JSON.parse - تحويل لـ Object =====
const jsonData = '{"name":"سارة","age":22,"city":"بغداد"}';
const person = JSON.parse(jsonData);

console.log(person.name);  // سارة
console.log(person.age);   // 22


// ===== استخدام عملي: localStorage =====
// حفظ سلة التسوق
const cart = [
  { id: 1, name: "هاتف", price: 500 },
  { id: 2, name: "سماعات", price: 50 }
];

localStorage.setItem("cart", JSON.stringify(cart));

// استرجاع السلة
const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
console.log(savedCart);


// ===== معالجة الأخطاء =====
function safeParseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON غير صالح:", error.message);
    return null;
  }
}

// اختبار
safeParseJSON('{"valid": true}');  // ✅ يعمل
safeParseJSON('{invalid}');         // ❌ خطأ - يرجع null


// ===== نسخ كائن (Deep Copy) =====
const original = { a: 1, b: { c: 2 } };
const copy = JSON.parse(JSON.stringify(original));

copy.b.c = 99;
console.log(original.b.c); // 2 (لم يتغير)`,
  language: 'javascript',
  xpReward: 120,
  order: 8.5,
  quiz: {
    question: 'ما الدالة التي تحول Object إلى نص JSON؟',
    options: [
      'JSON.parse()',
      'JSON.stringify()',
      'JSON.convert()',
      'JSON.toString()',
    ],
    correctAnswer: 1,
    explanation: 'JSON.stringify() تحول Object/Array إلى نص JSON',
  },
};

// تصدير كل المحتوى الموسّع
// ملاحظة: تم إزالة الدروس المكررة (EXPANDED_HTML_LESSONS و HTML_LINKS_IMAGES_LESSON)
// لأنها موجودة بالفعل في courseData.ts
export const ALL_EXPANDED_WEB_LESSONS: Lesson[] = [
  // EXPANDED_HTML_LESSONS - تم إزالتها (مكررة مع html-5, html-6, html-7, html-8)
  // HTML_LINKS_IMAGES_LESSON - تم إزالتها (مكررة مع html-3)
  GIT_BASICS_LESSON,
  JS_JSON_LESSON,
];

// ===== تحديات إضافية =====
export const EXPANDED_GIT_CHALLENGES: Challenge[] = [
  {
    id: 'git-ch-basics-001',
    title: 'أول Commit',
    description: 'رتب أوامر Git الصحيحة لرفع مشروع جديد',
    difficulty: 'easy',
    points: 25,
    language: 'HTML',
    icon: 'git-branch',
    category: 'deployment',
    starterCode: `# رتب الأوامر بالترتيب الصحيح لرفع مشروع:
# A: git push -u origin main
# B: git add .
# C: git init
# D: git commit -m "first commit"
# E: git remote add origin URL

# الترتيب الصحيح:
# 1. ?
# 2. ?
# 3. ?
# 4. ?
# 5. ?`,
    solution: `# الترتيب الصحيح:
# 1. C - git init
# 2. B - git add .
# 3. D - git commit -m "first commit"
# 4. E - git remote add origin URL
# 5. A - git push -u origin main

# الأوامر كاملة:
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/user/repo.git
git push -u origin main`,
    hints: [
      'ابدأ بـ git init لإنشاء repository',
      'أضف الملفات قبل commit',
      'اربط remote قبل push',
    ],
    testCases: [
      {
        input: 'order',
        expectedOutput: 'C, B, D, E, A',
        description: 'الترتيب الصحيح للأوامر',
      },
      {
        input: 'first step',
        expectedOutput: 'git init',
        description: 'الخطوة الأولى هي تهيئة المستودع',
      },
    ],
    isLocked: false,
  },
  {
    id: 'json-ch-001',
    title: 'تحويل البيانات',
    description: 'استخدم JSON.stringify و JSON.parse',
    difficulty: 'easy',
    points: 20,
    language: 'JavaScript',
    icon: 'code-slash',
    category: 'web',
    starterCode: `// المطلوب: اكتب دالة تأخذ كائن JavaScript وتُرجع:
// 1. تحويله لـ JSON string
// 2. ثم إعادة تحويله لـ Object
// 3. إرجاع قيمة name من الكائن الناتج

function processJSON(obj) {
  // اكتب الكود هنا
}`,
    solution: `function processJSON(obj) {
  const jsonString = JSON.stringify(obj);
  const parsed = JSON.parse(jsonString);
  return parsed.name;
}`,
    hints: [
      'استخدم JSON.stringify() للتحويل لنص',
      'استخدم JSON.parse() للتحويل لـ Object',
      'أرجع خاصية name من الكائن الناتج',
    ],
    testCases: [
      {
        input: '{"name": "سارة", "age": 22}',
        expectedOutput: 'سارة',
        description: 'استرجاع البيانات بنجاح',
      },
      {
        input: '{"name": "أحمد", "skills": ["JS"]}',
        expectedOutput: 'أحمد',
        description: 'استرجاع اسم من كائن مختلف',
      },
    ],
    isLocked: false,
  },
];

// ===== تحديات JavaScript للويب =====
export const EXPANDED_WEB_JS_CHALLENGES: Challenge[] = [
  {
    id: 'web-ch-slugify-001',
    title: 'تحويل نص إلى Slug',
    description: 'اكتب دالة تحوّل عنوان إلى slug مناسب لعنوان URL',
    difficulty: 'easy',
    points: 15,
    language: 'JavaScript',
    icon: 'link',
    starterCode: `function slugify(text) {
  // حوّل النص إلى slug
  // مثال: "Hello World" → "hello-world"
}`,
    solution: `function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');
}`,
    hints: [
      'حوّل للأحرف الصغيرة أولاً',
      'استبدل المسافات بـ -',
      'أزل الأحرف الخاصة',
    ],
    testCases: [
      {
        input: '"Hello World"',
        expectedOutput: 'hello-world',
        description: 'نص بسيط',
      },
      {
        input: '"  Learn JavaScript!  "',
        expectedOutput: 'learn-javascript',
        description: 'مسافات وعلامات',
      },
      {
        input: '"API Design 101"',
        expectedOutput: 'api-design-101',
        description: 'نص مع أرقام',
      },
    ],
    isLocked: false,
    category: 'web',
  },
  {
    id: 'web-ch-querystring-001',
    title: 'تحليل Query String',
    description: 'اكتب دالة تحلل query string من URL وتُرجع كائن',
    difficulty: 'medium',
    points: 30,
    language: 'JavaScript',
    icon: 'search',
    starterCode: `function parseQueryString(query) {
  // حلّل query string مثل "name=ali&age=25"
  // أرجع object { name: "ali", age: "25" }
}`,
    solution: `function parseQueryString(query) {
  if (!query || query === '') return {};
  return query.split('&').reduce((obj, pair) => {
    const [key, value] = pair.split('=');
    obj[decodeURIComponent(key)] = decodeURIComponent(value || '');
    return obj;
  }, {});
}`,
    hints: [
      'قسّم بـ & ثم كل جزء بـ =',
      'استخدم decodeURIComponent لفك الترميز',
      'استخدم reduce لبناء الكائن',
    ],
    testCases: [
      {
        input: '"name=ali&age=25"',
        expectedOutput: '{"name":"ali","age":"25"}',
        description: 'معاملين',
      },
      {
        input: '"key=value"',
        expectedOutput: '{"key":"value"}',
        description: 'معامل واحد',
      },
    ],
    isLocked: false,
    category: 'web',
  },
  {
    id: 'web-ch-truncate-001',
    title: 'اقتطاع النص',
    description: 'اكتب دالة تقتطع نصاً طويلاً وتضيف ... في النهاية',
    difficulty: 'easy',
    points: 15,
    language: 'JavaScript',
    icon: 'cut',
    starterCode: `function truncate(text, maxLength) {
  // اقتطع النص إذا تجاوز maxLength
  // أضف "..." في النهاية
}`,
    solution: `function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}`,
    hints: [
      'تحقق أولاً إذا النص أقصر من الحد',
      'استخدم slice لقطع النص',
      'اطرح 3 من maxLength لإضافة ...',
    ],
    testCases: [
      {
        input: '"Hello World", 8',
        expectedOutput: 'Hello...',
        description: 'اقتطاع نص طويل',
      },
      {
        input: '"Hi", 10',
        expectedOutput: 'Hi',
        description: 'نص أقصر من الحد',
      },
    ],
    isLocked: false,
    category: 'web',
  },
  {
    id: 'web-ch-camelcase-001',
    title: 'التحويل إلى camelCase',
    description: 'اكتب دالة تحوّل نصاً إلى صيغة camelCase',
    difficulty: 'easy',
    points: 20,
    language: 'JavaScript',
    icon: 'text',
    starterCode: `function toCamelCase(str) {
  // حوّل "hello-world" أو "hello_world" إلى "helloWorld"
}`,
    solution: `function toCamelCase(str) {
  return str.replace(/[-_](\\w)/g, (_, c) => c.toUpperCase());
}`,
    hints: [
      'ابحث عن - أو _ متبوع بحرف',
      'استبدل بالحرف كبير',
      'استخدم regex مع replace callback',
    ],
    testCases: [
      {
        input: '"hello-world"',
        expectedOutput: 'helloWorld',
        description: 'dash-case',
      },
      {
        input: '"background_color"',
        expectedOutput: 'backgroundColor',
        description: 'snake_case',
      },
      {
        input: '"simple"',
        expectedOutput: 'simple',
        description: 'كلمة واحدة',
      },
    ],
    isLocked: false,
    category: 'web',
  },
  {
    id: 'web-ch-flatten-obj-001',
    title: 'تسطيح كائن متداخل',
    description:
      'اكتب دالة تسطّح كائن متداخل إلى كائن بمستوى واحد مع مفاتيح بنقطة',
    difficulty: 'medium',
    points: 35,
    language: 'JavaScript',
    icon: 'layers',
    starterCode: `function flattenObject(obj) {
  // سطّح {a: {b: 1}} إلى {"a.b": 1}
}`,
    solution: `function flattenObject(obj, prefix = '') {
  const result = {};
  for (const key in obj) {
    const newKey = prefix ? prefix + '.' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObject(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
}`,
    hints: [
      'استخدم Recursion للكائنات المتداخلة',
      'ابنِ المفتاح بإضافة نقطة',
      'تحقق من typeof === "object" للتداخل',
    ],
    testCases: [
      {
        input: '{"a": {"b": 1}}',
        expectedOutput: '{"a.b":1}',
        description: 'مستوى واحد',
      },
      {
        input: '{"x": 1, "y": 2}',
        expectedOutput: '{"x":1,"y":2}',
        description: 'بدون تداخل',
      },
    ],
    isLocked: false,
    category: 'web',
  },
  {
    id: 'web-ch-htmlentity-001',
    title: 'ترميز HTML Entities',
    description: 'اكتب دالة تحوّل الأحرف الخاصة إلى HTML entities',
    difficulty: 'easy',
    points: 15,
    language: 'JavaScript',
    icon: 'code-slash',
    starterCode: `function encodeHTML(str) {
  // حوّل < > & " ' إلى HTML entities
}`,
    solution: `function encodeHTML(str) {
  const entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, c => entities[c]);
}`,
    hints: [
      '& → &amp;  < → &lt;  > → &gt;',
      'استخدم regex مع replace callback',
      'الترتيب مهم: بدّل & أولاً',
    ],
    testCases: [
      {
        input: '"<h1>Hello</h1>"',
        expectedOutput: '&lt;h1&gt;Hello&lt;/h1&gt;',
        description: 'ترميز وسوم HTML',
      },
      { input: '"a & b"', expectedOutput: 'a &amp; b', description: 'ترميز &' },
    ],
    isLocked: false,
    category: 'web',
  },
  {
    id: 'web-ch-debounce-impl-001',
    title: 'تنفيذ Debounce بسيط',
    description:
      'اكتب دالة debounce تؤخّر تنفيذ دالة حتى يتوقف المستخدم عن الاستدعاء',
    difficulty: 'medium',
    points: 35,
    language: 'JavaScript',
    icon: 'timer',
    starterCode: `function debounce(fn, delay) {
  // أرجع دالة جديدة تؤخّر التنفيذ
  // إذا استُدعيت مرة أخرى قبل انتهاء التأخير، ألغِ السابقة
}`,
    solution: `function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}`,
    hints: [
      'خزّن timeout ID في closure',
      'استخدم clearTimeout لإلغاء التأخير السابق',
      'setTimeout يُنشئ تأخيراً جديداً',
    ],
    testCases: [
      {
        input: '(() => "test"), 500',
        expectedOutput: 'function',
        description: 'يرجع دالة جديدة',
      },
      {
        input: '((x) => x * 2), 100',
        expectedOutput: 'function',
        description: 'يرجع دالة حتى مع معاملات',
      },
    ],
    isLocked: false,
    category: 'web',
  },
];

export const ALL_EXPANDED_WEB_CHALLENGES: Challenge[] = [
  ...EXPANDED_HTML_CHALLENGES,
  ...EXPANDED_GIT_CHALLENGES,
  ...EXPANDED_WEB_JS_CHALLENGES,
];

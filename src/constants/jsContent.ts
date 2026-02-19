/**
 * محتوى JavaScript الشامل - Kodax
 * دورة كاملة من الصفر إلى الاحتراف
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس JavaScript المبتدئة =====
export const JS_BEGINNER_LESSONS: Lesson[] = [
  {
    id: 'js-1',
    courseId: 'web-js-basics',
    title: 'مقدمة في JavaScript',
    description: 'تعرف على لغة الويب الأساسية',
    content: `
# مقدمة في JavaScript

JavaScript هي **لغة البرمجة الأساسية للويب** وأكثر لغة استخداماً في العالم.

## لماذا JavaScript؟

### 1. الانتشار الواسع
- تعمل في **كل المتصفحات** بدون تثبيت إضافي
- تستخدم في **الخوادم** (Node.js)
- تستخدم في **تطبيقات الموبايل** (React Native)
- تستخدم في **تطبيقات سطح المكتب** (Electron)

### 2. سهولة التعلم
- بناء جملة بسيط ومرن
- لا تحتاج إعدادات معقدة
- نتائج فورية في المتصفح

### 3. سوق العمل
- الطلب العالي جداً
- رواتب مرتفعة
- فرص عمل متنوعة

## تاريخ JavaScript

| السنة | الحدث |
|-------|------|
| 1995 | إنشاء JavaScript بواسطة Brendan Eich في 10 أيام |
| 1997 | ECMAScript 1 - المعيار الرسمي |
| 2009 | Node.js - JavaScript على الخادم |
| 2015 | ES6 - التحديث الثوري |
| 2024 | أكثر لغة استخداماً عالمياً |

## أين نكتب JavaScript؟

### 1. في ملف HTML مباشرة
\`\`\`html
<script>
  alert("مرحباً بالعالم!");
</script>
\`\`\`

### 2. في ملف منفصل
\`\`\`html
<script src="script.js"></script>
\`\`\`

### 3. في Console المتصفح
اضغط F12 ثم اذهب إلى Console

## أول برنامج

\`\`\`javascript
// طباعة رسالة
console.log("مرحباً بك في JavaScript!");

// عرض نافذة تنبيه
alert("أهلاً وسهلاً!");

// طرح سؤال
let name = prompt("ما اسمك؟");
console.log("مرحباً " + name);
\`\`\`
`,
    codeExample: `// أول برنامج JavaScript
console.log("مرحباً بالعالم!");

// يمكنك تجربة:
// alert("مرحباً!");
// let x = 5;
// console.log(x * 2);`,
    language: 'javascript',
    xpReward: 100,
    order: 1,
    quiz: {
      question: 'متى تم إنشاء JavaScript؟',
      options: ['1990', '1995', '2000', '2005'],
      correctAnswer: 1,
      explanation:
        'تم إنشاء JavaScript عام 1995 بواسطة Brendan Eich في شركة Netscape خلال 10 أيام فقط!',
    },
  },
  {
    id: 'js-2',
    courseId: 'web-js-basics',
    title: 'المتغيرات وأنواع البيانات',
    description: 'تخزين البيانات والتعامل معها',
    content: `
# المتغيرات وأنواع البيانات

المتغيرات هي **صناديق لتخزين البيانات** في الذاكرة.

## طرق تعريف المتغيرات

### 1. let (الطريقة الحديثة)
\`\`\`javascript
let age = 25;        // يمكن تغيير قيمته
age = 26;            // ✅ مسموح
let age = 30;        // ❌ خطأ - لا يمكن إعادة التعريف
\`\`\`

### 2. const (الثوابت)
\`\`\`javascript
const PI = 3.14159;  // قيمة ثابتة
PI = 3.14;           // ❌ خطأ - لا يمكن التغيير

const user = { name: "أحمد" };
user.name = "محمد";  // ✅ مسموح - تغيير المحتوى
user = {};           // ❌ خطأ - لا يمكن تغيير المرجع
\`\`\`

### 3. var (الطريقة القديمة)
\`\`\`javascript
var x = 10;          // تجنب استخدامها
var x = 20;          // ⚠️ مسموح لكن خطير
\`\`\`

## أنواع البيانات الأساسية

### 1. الأرقام (Number)
\`\`\`javascript
let integer = 42;           // عدد صحيح
let decimal = 3.14;         // عدد عشري
let negative = -100;        // سالب
let scientific = 2.5e6;     // 2.5 × 10⁶ = 2,500,000
let infinity = Infinity;    // اللانهاية
let notNumber = NaN;        // ليس رقم

// العمليات
console.log(10 + 5);    // 15 - جمع
console.log(10 - 5);    // 5 - طرح
console.log(10 * 5);    // 50 - ضرب
console.log(10 / 5);    // 2 - قسمة
console.log(10 % 3);    // 1 - باقي القسمة
console.log(10 ** 2);   // 100 - الأس
\`\`\`

### 2. النصوص (String)
\`\`\`javascript
let single = 'مرحباً';
let double = "أهلاً";
let backtick = \`مرحباً يا \${name}\`;  // Template Literal

// خصائص النص
let text = "JavaScript";
console.log(text.length);        // 10
console.log(text[0]);            // J
console.log(text.toUpperCase()); // JAVASCRIPT
console.log(text.toLowerCase()); // javascript
console.log(text.includes("Script")); // true
console.log(text.slice(0, 4));   // Java
console.log(text.split(""));     // ["J","a","v","a","S","c","r","i","p","t"]
\`\`\`

### 3. القيم المنطقية (Boolean)
\`\`\`javascript
let isActive = true;
let isDeleted = false;

// القيم التي تعتبر false:
// false, 0, "", null, undefined, NaN

// كل شيء آخر يعتبر true
\`\`\`

### 4. القيم الفارغة
\`\`\`javascript
let nothing = null;       // فارغ عمداً
let notDefined;           // undefined - لم يُعرَّف
console.log(notDefined);  // undefined
\`\`\`

### 5. الرموز (Symbol) - ES6
\`\`\`javascript
const id = Symbol("id");
const id2 = Symbol("id");
console.log(id === id2);  // false - كل symbol فريد
\`\`\`

## فحص نوع البيانات

\`\`\`javascript
console.log(typeof 42);           // "number"
console.log(typeof "مرحباً");     // "string"
console.log(typeof true);         // "boolean"
console.log(typeof undefined);    // "undefined"
console.log(typeof null);         // "object" (خطأ تاريخي!)
console.log(typeof {});           // "object"
console.log(typeof []);           // "object"
console.log(typeof function(){}); // "function"
\`\`\`

## تحويل الأنواع

\`\`\`javascript
// إلى String
String(123);      // "123"
(123).toString(); // "123"
123 + "";         // "123"

// إلى Number
Number("123");    // 123
parseInt("123");  // 123
parseFloat("3.14"); // 3.14
+"123";           // 123

// إلى Boolean
Boolean(1);       // true
Boolean(0);       // false
!!1;              // true
\`\`\`
`,
    codeExample: `// تجربة المتغيرات
let name = "أحمد";
const age = 25;

console.log(\`الاسم: \${name}\`);
console.log(\`العمر: \${age}\`);

// تجربة أنواع البيانات
let number = 42;
let text = "مرحباً";
let isStudent = true;

console.log(typeof number);  // number
console.log(typeof text);    // string
console.log(typeof isStudent); // boolean`,
    language: 'javascript',
    xpReward: 120,
    order: 2,
    quiz: {
      question: 'ما الفرق بين let و const؟',
      options: [
        'لا فرق بينهما',
        'let للأرقام و const للنصوص',
        'let يمكن تغيير قيمته و const ثابت',
        'const أسرع من let',
      ],
      correctAnswer: 2,
      explanation:
        'let يُستخدم للقيم التي قد تتغير، بينما const للقيم الثابتة التي لن تتغير.',
    },
  },
  {
    id: 'js-3',
    courseId: 'web-js-basics',
    title: 'العمليات والمقارنات',
    description: 'العمليات الحسابية والمنطقية',
    content: `
# العمليات والمقارنات

## العمليات الحسابية

\`\`\`javascript
let a = 10, b = 3;

console.log(a + b);   // 13 - جمع
console.log(a - b);   // 7 - طرح
console.log(a * b);   // 30 - ضرب
console.log(a / b);   // 3.333... - قسمة
console.log(a % b);   // 1 - باقي القسمة
console.log(a ** b);  // 1000 - الأس (10³)
\`\`\`

## عمليات الإسناد

\`\`\`javascript
let x = 10;
x += 5;   // x = x + 5  → 15
x -= 3;   // x = x - 3  → 12
x *= 2;   // x = x * 2  → 24
x /= 4;   // x = x / 4  → 6
x %= 4;   // x = x % 4  → 2
x **= 3;  // x = x ** 3 → 8
\`\`\`

## الزيادة والنقصان

\`\`\`javascript
let i = 5;

// Prefix (قبل)
console.log(++i); // 6 - يزيد أولاً ثم يُرجع
console.log(--i); // 5 - ينقص أولاً ثم يُرجع

// Postfix (بعد)
console.log(i++); // 5 - يُرجع ثم يزيد
console.log(i);   // 6
\`\`\`

## عمليات المقارنة

\`\`\`javascript
let x = 5;

// المقارنة البسيطة (تتجاهل النوع)
console.log(5 == "5");   // true
console.log(5 == 5);     // true

// المقارنة الصارمة (تفحص النوع) ⭐ استخدم هذه
console.log(5 === "5");  // false
console.log(5 === 5);    // true

// عدم المساواة
console.log(5 != "5");   // false
console.log(5 !== "5");  // true

// المقارنات الأخرى
console.log(5 > 3);      // true
console.log(5 < 3);      // false
console.log(5 >= 5);     // true
console.log(5 <= 4);     // false
\`\`\`

## العمليات المنطقية

\`\`\`javascript
// AND - && (كلاهما صحيح)
console.log(true && true);   // true
console.log(true && false);  // false
console.log(5 > 3 && 10 > 5); // true

// OR - || (أحدهما صحيح)
console.log(true || false);  // true
console.log(false || false); // false
console.log(5 > 10 || 3 > 1); // true

// NOT - ! (عكس القيمة)
console.log(!true);   // false
console.log(!false);  // true
console.log(!!1);     // true (تحويل لـ boolean)
\`\`\`

## Nullish Coalescing (??) - ES2020

\`\`\`javascript
let name = null;
let defaultName = "زائر";

// الطريقة القديمة
let result1 = name || defaultName;

// الطريقة الجديدة (أفضل)
let result2 = name ?? defaultName;

// الفرق:
console.log(0 || "default");  // "default" (0 = falsy)
console.log(0 ?? "default");  // 0 (فقط null/undefined)
console.log("" || "default"); // "default"
console.log("" ?? "default"); // ""
\`\`\`

## Optional Chaining (?.) - ES2020

\`\`\`javascript
const user = {
  name: "أحمد",
  address: {
    city: "بغداد"
  }
};

// الطريقة القديمة
let city1 = user && user.address && user.address.city;

// الطريقة الجديدة
let city2 = user?.address?.city; // "بغداد"
let country = user?.address?.country; // undefined (لا خطأ)

// مع الدوال
user.greet?.(); // لا يُنفذ إذا greet غير موجودة
\`\`\`

## Ternary Operator (العامل الثلاثي)

\`\`\`javascript
let age = 20;

// بدلاً من if-else
let status = age >= 18 ? "بالغ" : "قاصر";
console.log(status); // "بالغ"

// يمكن تداخلها (لكن تجنب ذلك للقراءة)
let grade = 85;
let result = grade >= 90 ? "ممتاز" 
           : grade >= 80 ? "جيد جداً"
           : grade >= 70 ? "جيد"
           : "مقبول";
\`\`\`
`,
    codeExample: `// تجربة العمليات
let a = 10, b = 3;

console.log("الجمع:", a + b);
console.log("القسمة:", a / b);
console.log("باقي القسمة:", a % b);

// المقارنات
console.log("5 == '5':", 5 == "5");   // true
console.log("5 === '5':", 5 === "5"); // false

// العامل الثلاثي
let age = 20;
let status = age >= 18 ? "بالغ" : "قاصر";
console.log(status);`,
    language: 'javascript',
    xpReward: 100,
    order: 3,
    quiz: {
      question: 'ما نتيجة: 5 === "5"؟',
      options: ['true', 'false', 'undefined', 'خطأ'],
      correctAnswer: 1,
      explanation:
        '=== تقارن القيمة والنوع. 5 رقم و "5" نص، لذا النتيجة false.',
    },
  },
  {
    id: 'js-4',
    courseId: 'web-js-basics',
    title: 'الجمل الشرطية',
    description: 'اتخاذ القرارات في البرمجة',
    content: `
# الجمل الشرطية

الجمل الشرطية تسمح للبرنامج باتخاذ **قرارات مختلفة** بناءً على شروط معينة.

## if الأساسية

\`\`\`javascript
let age = 20;

if (age >= 18) {
  console.log("أنت بالغ");
}
\`\`\`

## if...else

\`\`\`javascript
let temperature = 35;

if (temperature > 30) {
  console.log("الجو حار 🔥");
} else {
  console.log("الجو معتدل 🌤️");
}
\`\`\`

## if...else if...else

\`\`\`javascript
let grade = 85;

if (grade >= 90) {
  console.log("ممتاز 🏆");
} else if (grade >= 80) {
  console.log("جيد جداً ⭐");
} else if (grade >= 70) {
  console.log("جيد 👍");
} else if (grade >= 60) {
  console.log("مقبول ✓");
} else {
  console.log("راسب ❌");
}
\`\`\`

## الشروط المتداخلة

\`\`\`javascript
let age = 25;
let hasLicense = true;

if (age >= 18) {
  if (hasLicense) {
    console.log("يمكنك القيادة 🚗");
  } else {
    console.log("تحتاج رخصة قيادة");
  }
} else {
  console.log("أنت صغير على القيادة");
}

// طريقة أفضل باستخدام &&
if (age >= 18 && hasLicense) {
  console.log("يمكنك القيادة 🚗");
}
\`\`\`

## switch

\`\`\`javascript
let day = new Date().getDay();

switch (day) {
  case 0:
    console.log("الأحد");
    break;
  case 1:
    console.log("الاثنين");
    break;
  case 2:
    console.log("الثلاثاء");
    break;
  case 3:
    console.log("الأربعاء");
    break;
  case 4:
    console.log("الخميس");
    break;
  case 5:
    console.log("الجمعة 🕌");
    break;
  case 6:
    console.log("السبت");
    break;
  default:
    console.log("يوم غير معروف");
}
\`\`\`

## switch مع حالات متعددة

\`\`\`javascript
let fruit = "تفاح";

switch (fruit) {
  case "تفاح":
  case "موز":
  case "برتقال":
    console.log("هذه فاكهة 🍎");
    break;
  case "جزر":
  case "خيار":
    console.log("هذا خضار 🥕");
    break;
  default:
    console.log("غير معروف");
}
\`\`\`

## Truthy و Falsy

\`\`\`javascript
// قيم Falsy (تُعامل كـ false)
if (false) { }
if (0) { }
if (-0) { }
if ("") { }
if (null) { }
if (undefined) { }
if (NaN) { }

// كل شيء آخر Truthy
if ("مرحباً") { console.log("✅"); }  // يُنفذ
if (42) { console.log("✅"); }         // يُنفذ
if ([]) { console.log("✅"); }         // يُنفذ (مصفوفة فارغة!)
if ({}) { console.log("✅"); }         // يُنفذ (كائن فارغ!)
\`\`\`

## أنماط شائعة

\`\`\`javascript
// فحص وجود قيمة
let username = getUserInput();
if (username) {
  console.log(\`مرحباً \${username}\`);
} else {
  console.log("الرجاء إدخال اسم");
}

// قيمة افتراضية
let name = inputName || "زائر";

// فحص المصفوفة
let items = [];
if (items.length > 0) {
  console.log("توجد عناصر");
} else {
  console.log("المصفوفة فارغة");
}

// فحص الكائن
let user = null;
if (user?.name) {
  console.log(user.name);
}
\`\`\`
`,
    codeExample: `// تجربة الشروط
let score = 75;

if (score >= 90) {
  console.log("ممتاز!");
} else if (score >= 70) {
  console.log("جيد!");
} else {
  console.log("يحتاج تحسين");
}

// switch
let day = 5;
switch (day) {
  case 5:
    console.log("يوم الجمعة!");
    break;
  default:
    console.log("يوم عادي");
}`,
    language: 'javascript',
    xpReward: 120,
    order: 4,
    quiz: {
      question: 'ماذا يحدث إذا نسيت break في switch؟',
      options: [
        'خطأ في الكود',
        'يتوقف البرنامج',
        'ينفذ الحالات التالية أيضاً (fall-through)',
        'لا شيء',
      ],
      correctAnswer: 2,
      explanation:
        'بدون break، سيستمر التنفيذ في الحالات التالية. يسمى هذا "fall-through".',
    },
  },
  {
    id: 'js-5',
    courseId: 'web-js-basics',
    title: 'الحلقات التكرارية',
    description: 'تكرار الكود بكفاءة',
    content: `
# الحلقات التكرارية

الحلقات تسمح بتنفيذ كود معين **عدة مرات** بدون تكراره يدوياً.

## حلقة for

\`\`\`javascript
// الهيكل: for (البداية; الشرط; التحديث)
for (let i = 0; i < 5; i++) {
  console.log(\`العدد: \${i}\`);
}
// 0, 1, 2, 3, 4

// العد التنازلي
for (let i = 10; i > 0; i--) {
  console.log(i);
}
console.log("انطلق! 🚀");

// القفز
for (let i = 0; i < 20; i += 5) {
  console.log(i); // 0, 5, 10, 15
}
\`\`\`

## حلقة while

\`\`\`javascript
let count = 0;

while (count < 5) {
  console.log(\`العدد: \${count}\`);
  count++;
}

// مثال: لعبة تخمين
let secretNumber = 7;
let guess = 0;

while (guess !== secretNumber) {
  guess = parseInt(prompt("خمن الرقم (1-10):"));
  if (guess < secretNumber) {
    console.log("أكبر!");
  } else if (guess > secretNumber) {
    console.log("أصغر!");
  }
}
console.log("صحيح! 🎉");
\`\`\`

## حلقة do...while

\`\`\`javascript
// تُنفذ مرة واحدة على الأقل
let input;
do {
  input = prompt("أدخل رقماً موجباً:");
} while (input <= 0);

console.log(\`أدخلت: \${input}\`);
\`\`\`

## for...of (للمصفوفات)

\`\`\`javascript
let fruits = ["تفاح", "موز", "برتقال"];

for (let fruit of fruits) {
  console.log(fruit);
}
// تفاح
// موز
// برتقال

// مع النصوص
let text = "مرحباً";
for (let char of text) {
  console.log(char);
}
\`\`\`

## for...in (للكائنات)

\`\`\`javascript
let person = {
  name: "أحمد",
  age: 25,
  city: "بغداد"
};

for (let key in person) {
  console.log(\`\${key}: \${person[key]}\`);
}
// name: أحمد
// age: 25
// city: بغداد
\`\`\`

## التحكم في الحلقات

### break - إيقاف الحلقة
\`\`\`javascript
for (let i = 0; i < 10; i++) {
  if (i === 5) {
    break; // توقف عند 5
  }
  console.log(i);
}
// 0, 1, 2, 3, 4
\`\`\`

### continue - تخطي دورة
\`\`\`javascript
for (let i = 0; i < 5; i++) {
  if (i === 2) {
    continue; // تخطى 2
  }
  console.log(i);
}
// 0, 1, 3, 4
\`\`\`

## الحلقات المتداخلة

\`\`\`javascript
// جدول الضرب
for (let i = 1; i <= 3; i++) {
  for (let j = 1; j <= 3; j++) {
    console.log(\`\${i} × \${j} = \${i * j}\`);
  }
  console.log("---");
}

// رسم مثلث
for (let i = 1; i <= 5; i++) {
  let stars = "";
  for (let j = 0; j < i; j++) {
    stars += "⭐";
  }
  console.log(stars);
}
// ⭐
// ⭐⭐
// ⭐⭐⭐
// ⭐⭐⭐⭐
// ⭐⭐⭐⭐⭐
\`\`\`

## أمثلة عملية

\`\`\`javascript
// مجموع الأرقام من 1 إلى 100
let sum = 0;
for (let i = 1; i <= 100; i++) {
  sum += i;
}
console.log(\`المجموع: \${sum}\`); // 5050

// البحث في مصفوفة
let numbers = [10, 25, 30, 45, 50];
let target = 30;

for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] === target) {
    console.log(\`وجدت \${target} في الموقع \${i}\`);
    break;
  }
}

// فلترة الأرقام الزوجية
let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let evens = [];

for (let num of nums) {
  if (num % 2 === 0) {
    evens.push(num);
  }
}
console.log(evens); // [2, 4, 6, 8, 10]
\`\`\`
`,
    codeExample: `// حلقة for أساسية
for (let i = 1; i <= 5; i++) {
  console.log(\`الرقم: \${i}\`);
}

// for...of مع مصفوفة
let colors = ["أحمر", "أخضر", "أزرق"];
for (let color of colors) {
  console.log(color);
}

// مثال: مجموع مصفوفة
let numbers = [10, 20, 30, 40];
let total = 0;
for (let num of numbers) {
  total += num;
}
console.log("المجموع:", total);`,
    language: 'javascript',
    xpReward: 130,
    order: 5,
    quiz: {
      question: 'ما الفرق بين for...of و for...in؟',
      options: [
        'لا فرق',
        'for...of للقيم، for...in للمفاتيح',
        'for...in للمصفوفات فقط',
        'for...of أبطأ',
      ],
      correctAnswer: 1,
      explanation:
        'for...of يُعطي القيم مباشرة، بينما for...in يُعطي المفاتيح/الفهارس.',
    },
  },
  {
    id: 'js-6',
    courseId: 'web-js-basics',
    title: 'الدوال (Functions)',
    description: 'تنظيم الكود وإعادة استخدامه',
    content: `
# الدوال (Functions)

الدوال هي **كتل من الكود القابلة لإعادة الاستخدام** تؤدي مهمة محددة.

## لماذا نستخدم الدوال؟

1. **إعادة الاستخدام** - اكتب مرة، استخدم مرات
2. **التنظيم** - قسم الكود لأجزاء منطقية
3. **سهولة الصيانة** - عدل في مكان واحد
4. **القراءة** - أسماء واضحة للعمليات

## طرق تعريف الدوال

### 1. Function Declaration
\`\`\`javascript
function greet(name) {
  return \`مرحباً \${name}!\`;
}

console.log(greet("أحمد")); // مرحباً أحمد!
\`\`\`

### 2. Function Expression
\`\`\`javascript
const greet = function(name) {
  return \`مرحباً \${name}!\`;
};

console.log(greet("محمد")); // مرحباً محمد!
\`\`\`

### 3. Arrow Function (ES6) ⭐
\`\`\`javascript
// الشكل الكامل
const greet = (name) => {
  return \`مرحباً \${name}!\`;
};

// اختصار (بدون أقواس للمعامل الواحد)
const greet = name => \`مرحباً \${name}!\`;

// بدون معاملات
const sayHello = () => "مرحباً!";

// معاملات متعددة (تحتاج أقواس)
const add = (a, b) => a + b;
\`\`\`

## المعاملات (Parameters)

### المعاملات الأساسية
\`\`\`javascript
function add(a, b) {
  return a + b;
}

console.log(add(5, 3)); // 8
\`\`\`

### القيم الافتراضية
\`\`\`javascript
function greet(name = "زائر", greeting = "مرحباً") {
  return \`\${greeting} \${name}!\`;
}

console.log(greet());           // مرحباً زائر!
console.log(greet("أحمد"));     // مرحباً أحمد!
console.log(greet("علي", "أهلاً")); // أهلاً علي!
\`\`\`

### Rest Parameters (...)
\`\`\`javascript
function sum(...numbers) {
  let total = 0;
  for (let num of numbers) {
    total += num;
  }
  return total;
}

console.log(sum(1, 2, 3));       // 6
console.log(sum(1, 2, 3, 4, 5)); // 15
\`\`\`

## القيمة المُرجعة (Return)

\`\`\`javascript
// دالة تُرجع قيمة
function square(x) {
  return x * x;
}

// دالة تُرجع كائن
function createUser(name, age) {
  return {
    name: name,
    age: age,
    isAdult: age >= 18
  };
}

// دالة بدون return (ترجع undefined)
function logMessage(msg) {
  console.log(msg);
}
\`\`\`

## النطاق (Scope)

\`\`\`javascript
let globalVar = "متغير عام";

function myFunction() {
  let localVar = "متغير محلي";
  console.log(globalVar);  // ✅ يمكن الوصول
  console.log(localVar);   // ✅ يمكن الوصول
}

console.log(globalVar);  // ✅ يمكن الوصول
console.log(localVar);   // ❌ خطأ - غير معرف
\`\`\`

## Closure (الإغلاق)

\`\`\`javascript
function createCounter() {
  let count = 0;  // متغير خاص
  
  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

// لا يمكن الوصول لـ count مباشرة!
\`\`\`

## Callback Functions

\`\`\`javascript
function processData(data, callback) {
  // معالجة البيانات
  let result = data.toUpperCase();
  // استدعاء الدالة الممررة
  callback(result);
}

processData("مرحباً", function(result) {
  console.log(result); // مرحباً
});

// باستخدام Arrow Function
processData("أهلاً", result => console.log(result));
\`\`\`

## Higher-Order Functions

\`\`\`javascript
// دالة تُرجع دالة
function multiply(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = multiply(2);
const triple = multiply(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
\`\`\`

## IIFE (Immediately Invoked Function Expression)

\`\`\`javascript
(function() {
  let secret = "كلمة سرية";
  console.log("تُنفذ فوراً!");
})();

// مع معاملات
(function(name) {
  console.log(\`مرحباً \${name}\`);
})("أحمد");
\`\`\`
`,
    codeExample: `// دالة بسيطة
function greet(name) {
  return \`مرحباً \${name}!\`;
}
console.log(greet("أحمد"));

// Arrow Function
const add = (a, b) => a + b;
console.log("5 + 3 =", add(5, 3));

// دالة مع قيمة افتراضية
const multiply = (a, b = 1) => a * b;
console.log("5 * 3 =", multiply(5, 3));
console.log("5 * 1 =", multiply(5));

// Rest Parameters
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
console.log("مجموع:", sum(1, 2, 3, 4, 5));`,
    language: 'javascript',
    xpReward: 150,
    order: 6,
    quiz: {
      question: 'ما الفرق بين function declaration و arrow function؟',
      options: [
        'لا فرق',
        'Arrow function لا تملك this خاص بها',
        'Arrow function أبطأ',
        'Function declaration لا يمكنها return',
      ],
      correctAnswer: 1,
      explanation:
        'Arrow function ترث this من النطاق المحيط، بينما function declaration لها this خاص.',
    },
  },
  {
    id: 'js-7',
    courseId: 'web-js-basics',
    title: 'المصفوفات (Arrays)',
    description: 'تخزين مجموعات من البيانات',
    content: `
# المصفوفات (Arrays)

المصفوفات هي **قوائم مرتبة** من البيانات يمكنها تخزين أي نوع.

## إنشاء المصفوفات

\`\`\`javascript
// طريقة الأقواس المربعة (الأفضل)
let fruits = ["تفاح", "موز", "برتقال"];

// مصفوفة فارغة
let empty = [];

// مصفوفة مختلطة
let mixed = [1, "نص", true, null, { name: "أحمد" }];

// باستخدام new Array
let numbers = new Array(1, 2, 3);
let sized = new Array(5); // مصفوفة بـ 5 عناصر فارغة
\`\`\`

## الوصول للعناصر

\`\`\`javascript
let colors = ["أحمر", "أخضر", "أزرق"];

console.log(colors[0]);    // أحمر (الأول)
console.log(colors[1]);    // أخضر
console.log(colors[2]);    // أزرق (الأخير)
console.log(colors[-1]);   // undefined (خطأ شائع)
console.log(colors.at(-1)); // أزرق (ES2022)
console.log(colors.length); // 3

// تعديل عنصر
colors[1] = "أصفر";
console.log(colors); // ["أحمر", "أصفر", "أزرق"]
\`\`\`

## دوال المصفوفات الأساسية

### إضافة وحذف العناصر
\`\`\`javascript
let arr = [1, 2, 3];

// الإضافة
arr.push(4);        // [1, 2, 3, 4] - في النهاية
arr.unshift(0);     // [0, 1, 2, 3, 4] - في البداية

// الحذف
arr.pop();          // [0, 1, 2, 3] - من النهاية، يُرجع 4
arr.shift();        // [1, 2, 3] - من البداية، يُرجع 0

// splice - حذف/إضافة في أي موقع
arr.splice(1, 1);        // [1, 3] - حذف عنصر واحد من الموقع 1
arr.splice(1, 0, 2);     // [1, 2, 3] - إضافة 2 في الموقع 1
arr.splice(1, 1, 10, 20); // [1, 10, 20, 3] - استبدال
\`\`\`

### البحث
\`\`\`javascript
let fruits = ["تفاح", "موز", "برتقال", "موز"];

fruits.indexOf("موز");     // 1 (أول ظهور)
fruits.lastIndexOf("موز"); // 3 (آخر ظهور)
fruits.includes("تفاح");   // true
fruits.includes("عنب");    // false

// find - البحث بشرط
let numbers = [1, 5, 10, 15, 20];
let found = numbers.find(n => n > 8);
console.log(found); // 10

// findIndex - موقع العنصر
let index = numbers.findIndex(n => n > 8);
console.log(index); // 2
\`\`\`

### التحويل
\`\`\`javascript
let arr = [1, 2, 3];

// نسخ سطحية
let copy = arr.slice();
let partial = arr.slice(1, 2); // [2]

// الدمج
let arr2 = [4, 5];
let combined = arr.concat(arr2); // [1, 2, 3, 4, 5]

// Spread Operator (أفضل)
let combined2 = [...arr, ...arr2]; // [1, 2, 3, 4, 5]

// join - تحويل لنص
let text = arr.join("-"); // "1-2-3"

// split - نص لمصفوفة
let words = "مرحباً بالعالم".split(" "); // ["مرحباً", "بالعالم"]
\`\`\`

## دوال المصفوفات المتقدمة ⭐

### forEach - التكرار
\`\`\`javascript
let fruits = ["تفاح", "موز", "برتقال"];

fruits.forEach((fruit, index) => {
  console.log(\`\${index + 1}. \${fruit}\`);
});
// 1. تفاح
// 2. موز
// 3. برتقال
\`\`\`

### map - التحويل
\`\`\`javascript
let numbers = [1, 2, 3, 4, 5];
let doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

let names = ["أحمد", "محمد", "علي"];
let greetings = names.map(name => \`مرحباً \${name}\`);
\`\`\`

### filter - الفلترة
\`\`\`javascript
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let evens = numbers.filter(n => n % 2 === 0);
console.log(evens); // [2, 4, 6, 8, 10]

let bigNumbers = numbers.filter(n => n > 5);
console.log(bigNumbers); // [6, 7, 8, 9, 10]
\`\`\`

### reduce - التجميع
\`\`\`javascript
let numbers = [1, 2, 3, 4, 5];

// المجموع
let sum = numbers.reduce((acc, curr) => acc + curr, 0);
console.log(sum); // 15

// أكبر عدد
let max = numbers.reduce((max, n) => n > max ? n : max, numbers[0]);

// تحويل لكائن
let fruits = ["تفاح", "موز", "تفاح", "برتقال", "موز", "موز"];
let count = fruits.reduce((obj, fruit) => {
  obj[fruit] = (obj[fruit] || 0) + 1;
  return obj;
}, {});
console.log(count); // { تفاح: 2, موز: 3, برتقال: 1 }
\`\`\`

### sort - الترتيب
\`\`\`javascript
let numbers = [3, 1, 4, 1, 5, 9, 2, 6];

// ترتيب تصاعدي
numbers.sort((a, b) => a - b);
console.log(numbers); // [1, 1, 2, 3, 4, 5, 6, 9]

// ترتيب تنازلي
numbers.sort((a, b) => b - a);

// ترتيب النصوص
let names = ["علي", "أحمد", "محمد"];
names.sort(); // ترتيب أبجدي
\`\`\`

### السلسلة (Chaining)
\`\`\`javascript
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let result = numbers
  .filter(n => n % 2 === 0)  // الأرقام الزوجية
  .map(n => n * 2)            // ضرب في 2
  .reduce((sum, n) => sum + n, 0); // المجموع

console.log(result); // 60 (4 + 8 + 12 + 16 + 20)
\`\`\`
`,
    codeExample: `// إنشاء مصفوفة
let fruits = ["تفاح", "موز", "برتقال"];
console.log("الفواكه:", fruits);

// إضافة وحذف
fruits.push("عنب");
console.log("بعد الإضافة:", fruits);

// map - تحويل
let numbers = [1, 2, 3, 4, 5];
let squared = numbers.map(n => n ** 2);
console.log("المربعات:", squared);

// filter - فلترة
let evens = numbers.filter(n => n % 2 === 0);
console.log("الأزواج:", evens);

// reduce - تجميع
let sum = numbers.reduce((a, b) => a + b, 0);
console.log("المجموع:", sum);`,
    language: 'javascript',
    xpReward: 150,
    order: 7,
    quiz: {
      question: 'ما الفرق بين map و forEach؟',
      options: [
        'لا فرق',
        'map تُرجع مصفوفة جديدة، forEach لا',
        'forEach أسرع',
        'map للأرقام فقط',
      ],
      correctAnswer: 1,
      explanation:
        'map تُنشئ وتُرجع مصفوفة جديدة، بينما forEach تُنفذ الكود فقط دون إرجاع شيء.',
    },
  },
  {
    id: 'js-8',
    courseId: 'web-js-basics',
    title: 'الكائنات (Objects)',
    description: 'تخزين البيانات المعقدة',
    content: `
# الكائنات (Objects)

الكائنات هي **حاويات للخصائص والدوال** المرتبطة معاً.

## إنشاء الكائنات

\`\`\`javascript
// Object Literal (الأكثر استخداماً)
const person = {
  name: "أحمد",
  age: 25,
  city: "بغداد",
  isStudent: true
};

// كائن فارغ
const empty = {};

// Object Constructor
const obj = new Object();
obj.name = "محمد";
\`\`\`

## الوصول للخصائص

\`\`\`javascript
const user = {
  name: "أحمد",
  age: 25,
  "full name": "أحمد محمد"
};

// Dot Notation
console.log(user.name);    // أحمد
console.log(user.age);     // 25

// Bracket Notation (للأسماء الخاصة)
console.log(user["name"]); // أحمد
console.log(user["full name"]); // أحمد محمد

// باستخدام متغير
let key = "age";
console.log(user[key]); // 25

// خاصية غير موجودة
console.log(user.email); // undefined
\`\`\`

## تعديل الكائنات

\`\`\`javascript
let car = {
  brand: "تويوتا",
  year: 2020
};

// إضافة خاصية
car.color = "أبيض";
car["model"] = "كامري";

// تعديل خاصية
car.year = 2021;

// حذف خاصية
delete car.color;

console.log(car);
// { brand: "تويوتا", year: 2021, model: "كامري" }
\`\`\`

## الدوال داخل الكائنات (Methods)

\`\`\`javascript
const calculator = {
  add: function(a, b) {
    return a + b;
  },
  
  // اختصار (ES6)
  subtract(a, b) {
    return a - b;
  },
  
  // Arrow function
  multiply: (a, b) => a * b
};

console.log(calculator.add(5, 3));      // 8
console.log(calculator.subtract(5, 3)); // 2
console.log(calculator.multiply(5, 3)); // 15
\`\`\`

## this

\`\`\`javascript
const person = {
  name: "أحمد",
  age: 25,
  
  // this تشير للكائن نفسه
  introduce() {
    return \`أنا \${this.name} وعمري \${this.age}\`;
  },
  
  // ⚠️ Arrow function لا تعمل مع this
  wrongIntro: () => {
    return \`أنا \${this.name}\`; // this غير صحيح!
  }
};

console.log(person.introduce()); // أنا أحمد وعمري 25
\`\`\`

## فحص الخصائص

\`\`\`javascript
const user = {
  name: "أحمد",
  age: 25
};

// فحص وجود خاصية
console.log("name" in user);          // true
console.log("email" in user);         // false
console.log(user.hasOwnProperty("name")); // true

// الحصول على المفاتيح والقيم
console.log(Object.keys(user));   // ["name", "age"]
console.log(Object.values(user)); // ["أحمد", 25]
console.log(Object.entries(user)); // [["name", "أحمد"], ["age", 25]]
\`\`\`

## Destructuring

\`\`\`javascript
const person = {
  name: "أحمد",
  age: 25,
  city: "بغداد"
};

// استخراج الخصائص
const { name, age } = person;
console.log(name); // أحمد
console.log(age);  // 25

// مع إعادة تسمية
const { name: userName, age: userAge } = person;

// مع قيم افتراضية
const { email = "لا يوجد" } = person;

// داخل الدوال
function greet({ name, age }) {
  console.log(\`مرحباً \${name}، عمرك \${age}\`);
}
greet(person);
\`\`\`

## Spread و Rest

\`\`\`javascript
const defaults = {
  theme: "dark",
  language: "ar"
};

const userSettings = {
  language: "en",
  fontSize: 16
};

// دمج الكائنات (Spread)
const settings = { ...defaults, ...userSettings };
console.log(settings);
// { theme: "dark", language: "en", fontSize: 16 }

// نسخ كائن
const copy = { ...defaults };

// Rest في Destructuring
const { theme, ...rest } = settings;
console.log(rest); // { language: "en", fontSize: 16 }
\`\`\`

## الكائنات المتداخلة

\`\`\`javascript
const company = {
  name: "شركة التقنية",
  address: {
    city: "بغداد",
    street: "شارع الرشيد"
  },
  employees: [
    { name: "أحمد", role: "مطور" },
    { name: "محمد", role: "مصمم" }
  ]
};

// الوصول للبيانات المتداخلة
console.log(company.address.city);
console.log(company.employees[0].name);

// Optional Chaining
console.log(company.address?.country); // undefined (لا خطأ)
console.log(company.departments?.[0]); // undefined
\`\`\`

## Object Methods

\`\`\`javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };

// دمج
const merged = Object.assign({}, obj1, obj2);
// { a: 1, b: 3, c: 4 }

// تجميد (لا يمكن التعديل)
Object.freeze(obj1);
obj1.a = 10; // لا يحدث شيء

// منع الإضافة
Object.seal(obj2);
obj2.d = 5;  // لا يحدث شيء
obj2.b = 10; // يعمل (التعديل مسموح)

// التكرار
for (let [key, value] of Object.entries(obj1)) {
  console.log(\`\${key}: \${value}\`);
}
\`\`\`
`,
    codeExample: `// إنشاء كائن
const person = {
  name: "أحمد",
  age: 25,
  city: "بغداد",
  
  introduce() {
    return \`أنا \${this.name} من \${this.city}\`;
  }
};

console.log(person.introduce());

// Destructuring
const { name, age } = person;
console.log(\`الاسم: \${name}, العمر: \${age}\`);

// Spread - نسخ ودمج
const updated = { ...person, job: "مبرمج" };
console.log(updated);

// Object.keys/values
console.log("المفاتيح:", Object.keys(person));
console.log("القيم:", Object.values(person));`,
    language: 'javascript',
    xpReward: 150,
    order: 8,
    quiz: {
      question: 'كيف نصل لخاصية اسمها "full name" (مع مسافة)؟',
      options: ['obj.full name', 'obj.fullName', 'obj["full name"]', 'لا يمكن'],
      correctAnswer: 2,
      explanation:
        'الأسماء التي تحتوي مسافات أو رموز خاصة تحتاج Bracket Notation.',
    },
  },
  {
    id: 'js-9',
    courseId: 'web-js-basics',
    title: 'التعامل مع DOM',
    description: 'التحكم في صفحة الويب',
    content: `
# التعامل مع DOM

DOM (Document Object Model) هو **تمثيل برمجي لصفحة الويب** يسمح لـ JavaScript بالتفاعل معها.

## اختيار العناصر

\`\`\`javascript
// بالـ ID (الأسرع)
const element = document.getElementById("myId");

// بالـ Class
const elements = document.getElementsByClassName("myClass");
// يُرجع HTMLCollection (مصفوفة-شبيهة)

// بالوسم
const divs = document.getElementsByTagName("div");

// بـ CSS Selector (الأفضل والأكثر مرونة) ⭐
const one = document.querySelector(".myClass"); // أول عنصر
const all = document.querySelectorAll(".myClass"); // كل العناصر
// يُرجع NodeList

// أمثلة على Selectors
document.querySelector("#header");        // ID
document.querySelector(".card");          // Class
document.querySelector("div");            // Tag
document.querySelector("div.card");       // Tag + Class
document.querySelector("nav a");          // نسل
document.querySelector("nav > a");        // ابن مباشر
document.querySelector("[data-id]");      // Attribute
document.querySelector("input[type='text']");
\`\`\`

## تعديل المحتوى

\`\`\`javascript
const element = document.querySelector("#myDiv");

// النص
element.textContent = "نص جديد";     // نص فقط
element.innerText = "نص جديد";       // نص مرئي
element.innerHTML = "<strong>HTML</strong>"; // مع HTML

// ⚠️ تجنب innerHTML مع بيانات المستخدم (XSS)!
\`\`\`

## تعديل الأنماط (CSS)

\`\`\`javascript
const box = document.querySelector(".box");

// تعديل مباشر
box.style.color = "red";
box.style.backgroundColor = "blue"; // camelCase!
box.style.fontSize = "20px";
box.style.cssText = "color: red; background: blue;";

// Classes (الأفضل) ⭐
box.classList.add("active");
box.classList.remove("hidden");
box.classList.toggle("dark-mode");
box.classList.contains("active"); // true/false
box.classList.replace("old", "new");
\`\`\`

## تعديل السمات (Attributes)

\`\`\`javascript
const link = document.querySelector("a");

// قراءة
console.log(link.getAttribute("href"));
console.log(link.href); // خاصية مباشرة

// كتابة
link.setAttribute("href", "https://google.com");
link.href = "https://google.com";

// حذف
link.removeAttribute("target");

// فحص
link.hasAttribute("href"); // true

// Data Attributes
const card = document.querySelector("[data-user-id]");
console.log(card.dataset.userId); // قراءة data-user-id
card.dataset.role = "admin";      // إضافة data-role
\`\`\`

## إنشاء العناصر

\`\`\`javascript
// إنشاء عنصر
const div = document.createElement("div");
div.textContent = "عنصر جديد";
div.className = "card";
div.id = "myCard";

// إضافة للصفحة
document.body.appendChild(div);

// إضافة في موقع محدد
const container = document.querySelector(".container");
container.appendChild(div);              // في النهاية
container.prepend(div);                  // في البداية
container.insertBefore(div, reference); // قبل عنصر
container.insertAdjacentElement("afterbegin", div);

// إنشاء من HTML
container.innerHTML += '<div class="new">جديد</div>';

// insertAdjacentHTML (أفضل للأداء)
container.insertAdjacentHTML("beforeend", '<div>جديد</div>');
// beforebegin, afterbegin, beforeend, afterend
\`\`\`

## حذف العناصر

\`\`\`javascript
const element = document.querySelector(".toDelete");

// الحذف
element.remove(); // الطريقة الحديثة
element.parentNode.removeChild(element); // الطريقة القديمة

// إفراغ المحتوى
element.innerHTML = "";
element.textContent = "";
\`\`\`

## التنقل في DOM

\`\`\`javascript
const element = document.querySelector(".item");

// الأب
element.parentElement;
element.parentNode;

// الأبناء
element.children;           // HTMLCollection
element.childNodes;         // NodeList (يشمل النصوص)
element.firstElementChild;
element.lastElementChild;

// الإخوة
element.nextElementSibling;
element.previousElementSibling;

// أقرب أب بشرط
element.closest(".container"); // أقرب أب له class container
\`\`\`

## الأحداث (Events)

\`\`\`javascript
const button = document.querySelector("button");

// إضافة حدث
button.addEventListener("click", function(event) {
  console.log("تم النقر!");
  console.log(event.target); // العنصر المنقور
});

// مع Arrow Function
button.addEventListener("click", (e) => {
  e.preventDefault(); // منع السلوك الافتراضي
  console.log("نقرة!");
});

// أحداث شائعة
element.addEventListener("click", handler);
element.addEventListener("dblclick", handler);
element.addEventListener("mouseenter", handler);
element.addEventListener("mouseleave", handler);
element.addEventListener("keydown", handler);
element.addEventListener("keyup", handler);
element.addEventListener("input", handler);
element.addEventListener("change", handler);
element.addEventListener("submit", handler);
element.addEventListener("load", handler);
element.addEventListener("scroll", handler);

// إزالة حدث
button.removeEventListener("click", handler);
\`\`\`

## Event Delegation

\`\`\`javascript
// بدلاً من إضافة حدث لكل عنصر...
const list = document.querySelector("ul");

list.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    console.log(\`نقرت على: \${e.target.textContent}\`);
  }
});

// يعمل حتى مع العناصر المضافة لاحقاً!
\`\`\`
`,
    codeExample: `// اختيار عناصر
const title = document.querySelector("h1");
const buttons = document.querySelectorAll("button");

// تعديل المحتوى
if (title) {
  title.textContent = "مرحباً بك!";
  title.style.color = "blue";
}

// إنشاء عنصر جديد
const newDiv = document.createElement("div");
newDiv.textContent = "عنصر جديد من JavaScript!";
newDiv.classList.add("highlight");

// إضافة للصفحة
document.body.appendChild(newDiv);

// إضافة حدث
newDiv.addEventListener("click", () => {
  alert("تم النقر على العنصر!");
});`,
    language: 'javascript',
    xpReward: 180,
    order: 9,
    quiz: {
      question: 'ما الفرق بين querySelector و querySelectorAll؟',
      options: [
        'لا فرق',
        'querySelector للـ ID فقط',
        'querySelector يُرجع عنصر واحد، querySelectorAll يُرجع كل المطابقين',
        'querySelectorAll أسرع',
      ],
      correctAnswer: 2,
      explanation:
        'querySelector يُرجع أول عنصر مطابق فقط، بينما querySelectorAll يُرجع كل العناصر المطابقة كـ NodeList.',
    },
  },
  {
    id: 'js-10',
    courseId: 'web-js-basics',
    title: 'البرمجة غير المتزامنة',
    description: 'Callbacks, Promises, Async/Await',
    content: `
# البرمجة غير المتزامنة

JavaScript تعمل بخيط واحد (Single Thread)، لذا نحتاج **البرمجة غير المتزامنة** للعمليات الطويلة.

## لماذا نحتاجها؟

- طلبات الشبكة (API calls)
- قراءة الملفات
- Timers
- أحداث المستخدم

## Callbacks (الطريقة القديمة)

\`\`\`javascript
// setTimeout - تأخير التنفيذ
setTimeout(() => {
  console.log("بعد ثانيتين");
}, 2000);

// setInterval - تكرار
const intervalId = setInterval(() => {
  console.log("كل ثانية");
}, 1000);

// إيقاف التكرار
clearInterval(intervalId);

// Callback Hell 😱
getData(function(a) {
  processA(a, function(b) {
    processB(b, function(c) {
      processC(c, function(d) {
        // 🔥 Pyramid of Doom!
      });
    });
  });
});
\`\`\`

## Promises (الحل الأفضل)

\`\`\`javascript
// إنشاء Promise
const myPromise = new Promise((resolve, reject) => {
  // عملية غير متزامنة
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve("نجحت العملية! ✅");
    } else {
      reject("فشلت العملية ❌");
    }
  }, 1000);
});

// استخدام Promise
myPromise
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    console.log("انتهت العملية");
  });
\`\`\`

## Promise Chaining

\`\`\`javascript
fetch("/api/user")
  .then(response => response.json())
  .then(user => {
    console.log(user);
    return fetch(\`/api/posts/\${user.id}\`);
  })
  .then(response => response.json())
  .then(posts => {
    console.log(posts);
  })
  .catch(error => {
    console.error("خطأ:", error);
  });
\`\`\`

## Promise Methods

\`\`\`javascript
const promise1 = fetch("/api/users");
const promise2 = fetch("/api/posts");
const promise3 = fetch("/api/comments");

// Promise.all - انتظار الكل (تفشل إذا فشل واحد)
Promise.all([promise1, promise2, promise3])
  .then(([users, posts, comments]) => {
    console.log("كل البيانات:", users, posts, comments);
  })
  .catch(error => {
    console.error("فشل أحدها:", error);
  });

// Promise.allSettled - انتظار الكل (حتى لو فشل بعضها)
Promise.allSettled([promise1, promise2, promise3])
  .then(results => {
    results.forEach(result => {
      if (result.status === "fulfilled") {
        console.log("نجح:", result.value);
      } else {
        console.log("فشل:", result.reason);
      }
    });
  });

// Promise.race - أول واحد ينتهي
Promise.race([promise1, promise2])
  .then(firstResult => {
    console.log("الأول:", firstResult);
  });

// Promise.any - أول واحد ينجح
Promise.any([promise1, promise2])
  .then(firstSuccess => {
    console.log("أول نجاح:", firstSuccess);
  });
\`\`\`

## Async/Await (الأفضل) ⭐

\`\`\`javascript
// دالة async
async function fetchUserData() {
  try {
    const response = await fetch("/api/user");
    const user = await response.json();
    
    const postsResponse = await fetch(\`/api/posts/\${user.id}\`);
    const posts = await postsResponse.json();
    
    return { user, posts };
  } catch (error) {
    console.error("خطأ:", error);
    throw error;
  }
}

// استخدام
fetchUserData()
  .then(data => console.log(data))
  .catch(error => console.error(error));

// أو
async function main() {
  const data = await fetchUserData();
  console.log(data);
}
main();
\`\`\`

## Async/Await المتوازي

\`\`\`javascript
async function fetchAll() {
  // ❌ تسلسلي (بطيء)
  const users = await fetch("/api/users");
  const posts = await fetch("/api/posts");
  const comments = await fetch("/api/comments");
  
  // ✅ متوازي (أسرع)
  const [usersRes, postsRes, commentsRes] = await Promise.all([
    fetch("/api/users"),
    fetch("/api/posts"),
    fetch("/api/comments")
  ]);
  
  const users = await usersRes.json();
  const posts = await postsRes.json();
  const comments = await commentsRes.json();
  
  return { users, posts, comments };
}
\`\`\`

## Fetch API

\`\`\`javascript
// GET Request
async function getUsers() {
  const response = await fetch("https://api.example.com/users");
  const data = await response.json();
  return data;
}

// POST Request
async function createUser(userData) {
  const response = await fetch("https://api.example.com/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  return await response.json();
}

// مع Error Handling كامل
async function fetchWithErrorHandling(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}\`);
    }
    
    const data = await response.json();
    return { data, error: null };
    
  } catch (error) {
    return { data: null, error: error.message };
  }
}
\`\`\`

## مثال عملي: تطبيق أخبار

\`\`\`javascript
class NewsApp {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://newsapi.org/v2";
  }
  
  async getTopHeadlines(country = "us") {
    try {
      const url = \`\${this.baseUrl}/top-headlines?country=\${country}&apiKey=\${this.apiKey}\`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === "error") {
        throw new Error(data.message);
      }
      
      return data.articles;
    } catch (error) {
      console.error("فشل جلب الأخبار:", error);
      return [];
    }
  }
  
  async searchNews(query) {
    const url = \`\${this.baseUrl}/everything?q=\${encodeURIComponent(query)}&apiKey=\${this.apiKey}\`;
    const response = await fetch(url);
    return await response.json();
  }
}

// استخدام
const app = new NewsApp("YOUR_API_KEY");
const headlines = await app.getTopHeadlines("ae");
console.log(headlines);
\`\`\`
`,
    codeExample: `// Promise بسيط
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Async/Await
async function demo() {
  console.log("بداية...");
  
  await delay(1000);
  console.log("بعد ثانية");
  
  await delay(1000);
  console.log("بعد ثانيتين");
  
  console.log("انتهى!");
}

demo();

// Fetch مثال
async function getUser(id) {
  try {
    const response = await fetch(
      \`https://jsonplaceholder.typicode.com/users/\${id}\`
    );
    const user = await response.json();
    console.log("المستخدم:", user.name);
    return user;
  } catch (error) {
    console.error("خطأ:", error);
  }
}

getUser(1);`,
    language: 'javascript',
    xpReward: 200,
    order: 10,
    quiz: {
      question: 'ما الفرق بين Promise.all و Promise.allSettled؟',
      options: [
        'لا فرق',
        'Promise.all تفشل إذا فشل أي واحد، allSettled تُرجع كل النتائج',
        'Promise.all أسرع',
        'allSettled للأرقام فقط',
      ],
      correctAnswer: 1,
      explanation:
        'Promise.all ترفض فوراً إذا فشل أي promise، بينما Promise.allSettled تنتظر الكل وتُرجع حالة كل واحد.',
    },
  },
  {
    id: 'js-11',
    courseId: 'web-js-basics',
    title: 'Local Storage و Session Storage',
    description: 'تخزين البيانات في المتصفح',
    content: `
# Web Storage API

## Local Storage

البيانات تبقى حتى بعد إغلاق المتصفح.

\`\`\`javascript
// حفظ بيانات
localStorage.setItem('username', 'أحمد');
localStorage.setItem('theme', 'dark');

// قراءة بيانات
const username = localStorage.getItem('username');
console.log(username); // "أحمد"

// حذف بيانات
localStorage.removeItem('username');

// حذف الكل
localStorage.clear();
\`\`\`

## حفظ Objects و Arrays

\`\`\`javascript
// يجب تحويلها لـ JSON
const user = { name: 'سارة', age: 25 };
localStorage.setItem('user', JSON.stringify(user));

// قراءة
const savedUser = JSON.parse(localStorage.getItem('user'));
console.log(savedUser.name); // "سارة"

// مصفوفة
const todos = ['مهمة 1', 'مهمة 2'];
localStorage.setItem('todos', JSON.stringify(todos));
\`\`\`

## Session Storage

البيانات تُحذف عند إغلاق التبويب.

\`\`\`javascript
// نفس الـ API
sessionStorage.setItem('tempData', 'قيمة مؤقتة');
const temp = sessionStorage.getItem('tempData');
sessionStorage.removeItem('tempData');
\`\`\`

## مثال عملي: حفظ الإعدادات

\`\`\`javascript
const settings = {
  theme: 'dark',
  language: 'ar',
  fontSize: 16
};

function saveSettings(settings) {
  localStorage.setItem('appSettings', JSON.stringify(settings));
}

function loadSettings() {
  const saved = localStorage.getItem('appSettings');
  return saved ? JSON.parse(saved) : defaultSettings;
}
\`\`\`
`,
    codeExample: `// نظام إدارة سلة التسوق
const CartManager = {
  key: 'shopping-cart',
  
  // الحصول على السلة
  getCart() {
    const cart = localStorage.getItem(this.key);
    return cart ? JSON.parse(cart) : [];
  },
  
  // إضافة منتج
  addItem(product) {
    const cart = this.getCart();
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem(this.key, JSON.stringify(cart));
    return cart;
  },
  
  // حذف منتج
  removeItem(productId) {
    const cart = this.getCart().filter(item => item.id !== productId);
    localStorage.setItem(this.key, JSON.stringify(cart));
    return cart;
  },
  
  // إفراغ السلة
  clear() {
    localStorage.removeItem(this.key);
  },
  
  // حساب المجموع
  getTotal() {
    return this.getCart().reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );
  }
};

// الاستخدام
CartManager.addItem({ id: 1, name: 'هاتف', price: 999 });
console.log(CartManager.getTotal());`,
    language: 'javascript',
    xpReward: 150,
    order: 11,
    quiz: {
      question: 'ما الفرق بين localStorage و sessionStorage؟',
      options: [
        'لا فرق',
        'localStorage يبقى بعد إغلاق المتصفح، sessionStorage يُحذف',
        'sessionStorage أكبر',
        'localStorage للأرقام فقط',
      ],
      correctAnswer: 1,
      explanation:
        'localStorage تبقى بياناته حتى تُحذف يدوياً، بينما sessionStorage تُحذف عند إغلاق التبويب.',
    },
  },
  {
    id: 'js-12',
    courseId: 'web-js-basics',
    title: 'مشروع عملي: تطبيق مهام',
    description: 'تطبيق كل ما تعلمته',
    content: `
# مشروع: تطبيق مهام (Todo App)

## المميزات
- إضافة/حذف/تعديل المهام
- حفظ في localStorage
- تصفية حسب الحالة
- تصميم متجاوب

## الهيكل

\`\`\`javascript
class TodoApp {
  constructor() {
    this.todos = this.loadTodos();
    this.filter = 'all';
    this.init();
  }
  
  init() {
    this.cacheDom();
    this.bindEvents();
    this.render();
  }
  
  cacheDom() {
    this.form = document.getElementById('todo-form');
    this.input = document.getElementById('todo-input');
    this.list = document.getElementById('todo-list');
    this.filters = document.querySelectorAll('[data-filter]');
  }
  
  bindEvents() {
    this.form.addEventListener('submit', e => this.handleSubmit(e));
    this.list.addEventListener('click', e => this.handleClick(e));
    this.filters.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filter = btn.dataset.filter;
        this.render();
      });
    });
  }
}
\`\`\`

## إضافة مهمة

\`\`\`javascript
addTodo(text) {
  const todo = {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  this.todos.push(todo);
  this.saveTodos();
  this.render();
}
\`\`\`

## حذف وتبديل

\`\`\`javascript
deleteTodo(id) {
  this.todos = this.todos.filter(t => t.id !== id);
  this.saveTodos();
  this.render();
}

toggleTodo(id) {
  const todo = this.todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    this.saveTodos();
    this.render();
  }
}
\`\`\`
`,
    codeExample: `// Todo App كامل
class TodoApp {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    this.filter = 'all';
  }
  
  addTodo(text) {
    if (!text.trim()) return;
    this.todos.push({
      id: Date.now(),
      text: text.trim(),
      completed: false
    });
    this.save();
  }
  
  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.save();
  }
  
  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) todo.completed = !todo.completed;
    this.save();
  }
  
  editTodo(id, newText) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) todo.text = newText;
    this.save();
  }
  
  getFiltered() {
    switch(this.filter) {
      case 'active': return this.todos.filter(t => !t.completed);
      case 'completed': return this.todos.filter(t => t.completed);
      default: return this.todos;
    }
  }
  
  save() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }
  
  clearCompleted() {
    this.todos = this.todos.filter(t => !t.completed);
    this.save();
  }
}

// الاستخدام
const app = new TodoApp();
app.addTodo('تعلم JavaScript');
app.addTodo('بناء مشروع');
app.toggleTodo(app.todos[0].id);
console.log(app.getFiltered());`,
    language: 'javascript',
    xpReward: 200,
    order: 12,
    quiz: {
      question: 'ماذا تعلمت في هذه الدورة؟',
      options: [
        'JavaScript صعب جداً',
        'المتغيرات، الدوال، DOM، Events، Async/Await، Storage',
        'فقط console.log',
        'لا شيء مفيد',
      ],
      correctAnswer: 1,
      explanation:
        'تعلمت أساسيات JavaScript: المتغيرات، الدوال، المصفوفات، الكائنات، DOM، Events، Async/Await، وStorage. أنت جاهز لتعلم React!',
    },
  },
];

// ===== دروس JavaScript المتقدمة =====
export const JS_ADVANCED_LESSONS: Lesson[] = [
  {
    id: 'js-adv-1',
    courseId: 'web-js-advanced',
    title: 'ES6+ الميزات الحديثة',
    description: 'أحدث ميزات JavaScript',
    content: `
# ES6+ الميزات الحديثة

## Destructuring المتقدم

\`\`\`javascript
// مصفوفة متداخلة
const [a, [b, c]] = [1, [2, 3]];

// تبديل القيم
let x = 1, y = 2;
[x, y] = [y, x];

// تجاهل عناصر
const [first, , third] = [1, 2, 3];

// كائن متداخل
const { user: { name, address: { city } } } = response;

// مع إعادة تسمية وقيمة افتراضية
const { name: userName = "زائر" } = user;
\`\`\`

## Template Literals المتقدم

\`\`\`javascript
// Tagged Templates
function highlight(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    return acc + str + (values[i] ? \`<mark>\${values[i]}</mark>\` : '');
  }, '');
}

const name = "أحمد";
const result = highlight\`مرحباً \${name}!\`;
// مرحباً <mark>أحمد</mark>!

// SQL Query Builder
function sql(strings, ...values) {
  return {
    query: strings.join('?'),
    params: values
  };
}

const id = 5;
const query = sql\`SELECT * FROM users WHERE id = \${id}\`;
\`\`\`

## Symbols

\`\`\`javascript
// إنشاء Symbol
const id = Symbol('id');
const id2 = Symbol('id');
console.log(id === id2); // false

// استخدام كمفتاح
const user = {
  name: "أحمد",
  [id]: 123
};

console.log(user[id]); // 123
console.log(Object.keys(user)); // ["name"] - Symbol مخفي

// Well-Known Symbols
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array;
  }
}

// Symbol.iterator
const range = {
  start: 1,
  end: 5,
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}
\`\`\`

## Generators

\`\`\`javascript
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = numberGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// Generator لانهائي
function* infiniteCounter() {
  let i = 0;
  while (true) {
    yield i++;
  }
}

// Generator مع async
async function* asyncGenerator() {
  yield await fetch('/api/1');
  yield await fetch('/api/2');
}
\`\`\`

## Proxy و Reflect

\`\`\`javascript
const handler = {
  get(target, prop) {
    console.log(\`Reading \${prop}\`);
    return Reflect.get(target, prop);
  },
  set(target, prop, value) {
    console.log(\`Setting \${prop} = \${value}\`);
    return Reflect.set(target, prop, value);
  }
};

const user = new Proxy({ name: "أحمد" }, handler);
console.log(user.name); // Reading name, أحمد
user.age = 25;          // Setting age = 25

// Validation Proxy
const validator = {
  set(target, prop, value) {
    if (prop === 'age' && typeof value !== 'number') {
      throw new TypeError('Age must be a number');
    }
    return Reflect.set(target, prop, value);
  }
};
\`\`\`

## Map و Set

\`\`\`javascript
// Map - مفاتيح من أي نوع
const map = new Map();
map.set('name', 'أحمد');
map.set(1, 'رقم');
map.set({ id: 1 }, 'كائن');

console.log(map.get('name')); // أحمد
console.log(map.size);        // 3
map.has('name');              // true
map.delete('name');
map.clear();

// Set - قيم فريدة فقط
const set = new Set([1, 2, 2, 3, 3, 3]);
console.log([...set]); // [1, 2, 3]

set.add(4);
set.has(1);    // true
set.delete(1);
set.size;      // 3

// WeakMap و WeakSet
const weakMap = new WeakMap(); // مفاتيح كائنات فقط، garbage collected
const weakSet = new WeakSet(); // قيم كائنات فقط
\`\`\`

## Optional Chaining و Nullish Coalescing

\`\`\`javascript
// Optional Chaining
const user = {
  profile: {
    address: {
      city: "بغداد"
    }
  }
};

console.log(user?.profile?.address?.city);    // بغداد
console.log(user?.profile?.phone?.number);    // undefined
console.log(user?.getAddress?.());            // undefined

// Nullish Coalescing
const value = null ?? "default";    // "default"
const value2 = 0 ?? "default";      // 0
const value3 = "" ?? "default";     // ""
const value4 = undefined ?? "default"; // "default"

// مع Optional Chaining
const city = user?.profile?.address?.city ?? "غير محدد";
\`\`\`
`,
    codeExample: `// Destructuring متقدم
const user = {
  name: "أحمد",
  address: { city: "بغداد", country: "العراق" }
};

const { name, address: { city } } = user;
console.log(\`\${name} من \${city}\`);

// Map
const scores = new Map();
scores.set("أحمد", 95);
scores.set("محمد", 88);

for (const [name, score] of scores) {
  console.log(\`\${name}: \${score}\`);
}

// Set - إزالة التكرار
const numbers = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(numbers)];
console.log("فريدة:", unique);

// Generator
function* countdown(n) {
  while (n > 0) {
    yield n--;
  }
}

for (const num of countdown(5)) {
  console.log(num);
}`,
    language: 'javascript',
    xpReward: 180,
    order: 1,
    quiz: {
      question: 'ما نتيجة: 0 ?? "default"؟',
      options: ['"default"', '0', 'null', 'undefined'],
      correctAnswer: 1,
      explanation:
        'Nullish Coalescing (??) يُرجع الطرف الأيمن فقط إذا كان الأيسر null أو undefined، وليس 0 أو "".',
    },
  },
  {
    id: 'js-adv-2',
    courseId: 'web-js-advanced',
    title: 'البرمجة الكائنية (OOP)',
    description: 'Classes و Inheritance و Patterns',
    content: `
# البرمجة الكائنية في JavaScript

## Classes

\`\`\`javascript
class Person {
  // خصائص خاصة (ES2022)
  #id;
  
  // Constructor
  constructor(name, age) {
    this.name = name;
    this.age = age;
    this.#id = Math.random();
  }
  
  // Method
  introduce() {
    return \`أنا \${this.name} وعمري \${this.age}\`;
  }
  
  // Getter
  get info() {
    return \`\${this.name} (\${this.age})\`;
  }
  
  // Setter
  set info(value) {
    [this.name, this.age] = value.split(',');
  }
  
  // Static Method
  static create(name, age) {
    return new Person(name, age);
  }
  
  // Private Method
  #generateId() {
    return Math.random().toString(36);
  }
}

const person = new Person("أحمد", 25);
console.log(person.introduce());
console.log(person.info);
\`\`\`

## الوراثة (Inheritance)

\`\`\`javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(\`\${this.name} يصدر صوتاً\`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // استدعاء constructor الأب
    this.breed = breed;
  }
  
  speak() {
    console.log(\`\${this.name} ينبح: هاو هاو!\`);
  }
  
  fetch() {
    console.log(\`\${this.name} يجلب الكرة\`);
  }
}

class Cat extends Animal {
  speak() {
    super.speak(); // استدعاء method الأب
    console.log(\`\${this.name} يموء: مياو!\`);
  }
}

const dog = new Dog("ريكس", "جيرمان شيبرد");
dog.speak(); // ريكس ينبح: هاو هاو!
\`\`\`

## Mixins (التركيب)

\`\`\`javascript
// Mixin للقدرات المشتركة
const Flyable = {
  fly() {
    console.log(\`\${this.name} يطير!\`);
  }
};

const Swimmable = {
  swim() {
    console.log(\`\${this.name} يسبح!\`);
  }
};

class Duck extends Animal {
  constructor(name) {
    super(name);
    Object.assign(this, Flyable, Swimmable);
  }
}

const duck = new Duck("دونالد");
duck.fly();  // دونالد يطير!
duck.swim(); // دونالد يسبح!
\`\`\`

## Design Patterns

### Singleton
\`\`\`javascript
class Database {
  static #instance;
  
  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }
    Database.#instance = this;
    this.connection = "connected";
  }
  
  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }
}

const db1 = Database.getInstance();
const db2 = Database.getInstance();
console.log(db1 === db2); // true
\`\`\`

### Factory
\`\`\`javascript
class UserFactory {
  static create(type, data) {
    switch (type) {
      case 'admin':
        return new Admin(data);
      case 'editor':
        return new Editor(data);
      default:
        return new User(data);
    }
  }
}

const admin = UserFactory.create('admin', { name: 'أحمد' });
\`\`\`

### Observer
\`\`\`javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event]
        .filter(cb => cb !== callback);
    }
  }
}

const emitter = new EventEmitter();
emitter.on('message', data => console.log('استلمت:', data));
emitter.emit('message', 'مرحباً!');
\`\`\`

### Module Pattern
\`\`\`javascript
const Counter = (function() {
  let count = 0; // private
  
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
})();

Counter.increment();
Counter.increment();
console.log(Counter.getCount()); // 2
console.log(Counter.count);      // undefined
\`\`\`
`,
    codeExample: `// Class مع وراثة
class Vehicle {
  constructor(brand, model) {
    this.brand = brand;
    this.model = model;
  }
  
  getInfo() {
    return \`\${this.brand} \${this.model}\`;
  }
}

class Car extends Vehicle {
  constructor(brand, model, doors) {
    super(brand, model);
    this.doors = doors;
  }
  
  getInfo() {
    return \`\${super.getInfo()} - \${this.doors} أبواب\`;
  }
}

const car = new Car("تويوتا", "كامري", 4);
console.log(car.getInfo());

// Observer Pattern
class Subject {
  constructor() {
    this.observers = [];
  }
  
  subscribe(fn) {
    this.observers.push(fn);
  }
  
  notify(data) {
    this.observers.forEach(fn => fn(data));
  }
}

const news = new Subject();
news.subscribe(article => console.log("خبر جديد:", article));
news.notify("تحديث مهم!");`,
    language: 'javascript',
    xpReward: 200,
    order: 2,
    quiz: {
      question: 'ما الغرض من super() في constructor؟',
      options: [
        'إنشاء نسخة جديدة',
        'استدعاء constructor الأب',
        'إضافة method جديد',
        'حذف الوراثة',
      ],
      correctAnswer: 1,
      explanation:
        'super() يستدعي constructor الـ class الأب لتهيئة الخصائص الموروثة.',
    },
  },
];

// ===== تحديات JavaScript المبتدئة =====
export const JS_CHALLENGES_BEGINNER: Challenge[] = [
  {
    id: 'js-ch-beg-1',
    title: 'الآلة الحاسبة',
    description: 'أنشئ آلة حاسبة بسيطة',
    difficulty: 'easy',
    points: 15,
    language: 'JavaScript',
    icon: 'calculator',
    starterCode: `function calculator(a, b, operator) {
  // العمليات: '+', '-', '*', '/'
  // أرجع النتيجة
}

console.log(calculator(10, 5, '+')); // 15`,
    solution: `function calculator(a, b, operator) {
  switch(operator) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : 'Error';
    default: return 'Invalid operator';
  }
}`,
    hints: ['استخدم switch أو if/else', 'تأكد من عدم القسمة على صفر'],
    testCases: [
      { input: '10, 5, "+"', expectedOutput: '15', description: 'جمع' },
      { input: '10, 5, "-"', expectedOutput: '5', description: 'طرح' },
      { input: '10, 5, "*"', expectedOutput: '50', description: 'ضرب' },
      { input: '10, 5, "/"', expectedOutput: '2', description: 'قسمة' },
    ],
    isLocked: false,
    category: 'basics',
  },
  {
    id: 'js-ch-beg-2',
    title: 'أكبر عدد في المصفوفة',
    description: 'أوجد أكبر عدد',
    difficulty: 'easy',
    points: 15,
    language: 'JavaScript',
    icon: 'arrow-up',
    starterCode: `function findMax(arr) {
  // أرجع أكبر عدد في المصفوفة
}

console.log(findMax([1, 5, 3, 9, 2])); // 9`,
    solution: `function findMax(arr) {
  if (arr.length === 0) return undefined;
  return Math.max(...arr);
}

// أو يدوياً:
function findMaxManual(arr) {
  let max = arr[0];
  for (let num of arr) {
    if (num > max) max = num;
  }
  return max;
}`,
    hints: ['استخدم Math.max() مع spread operator', 'أو استخدم حلقة للمقارنة'],
    testCases: [
      {
        input: '[1, 5, 3, 9, 2]',
        expectedOutput: '9',
        description: 'أرقام موجبة',
      },
      {
        input: '[-5, -2, -8]',
        expectedOutput: '-2',
        description: 'أرقام سالبة',
      },
    ],
    isLocked: false,
    category: 'arrays',
  },
  {
    id: 'js-ch-beg-3',
    title: 'عد الأحرف',
    description: 'عد تكرار حرف معين في نص',
    difficulty: 'easy',
    points: 15,
    language: 'JavaScript',
    icon: 'text',
    starterCode: `function countChar(str, char) {
  // أرجع عدد مرات ظهور char في str
}

console.log(countChar("hello", "l")); // 2`,
    solution: `function countChar(str, char) {
  return str.split(char).length - 1;
}

// أو:
function countCharLoop(str, char) {
  let count = 0;
  for (let c of str) {
    if (c === char) count++;
  }
  return count;
}`,
    hints: ['استخدم split() وعد الأجزاء', 'أو استخدم حلقة for'],
    testCases: [
      { input: '"hello", "l"', expectedOutput: '2', description: 'حرف متكرر' },
      {
        input: '"hello", "z"',
        expectedOutput: '0',
        description: 'حرف غير موجود',
      },
    ],
    isLocked: false,
    category: 'strings',
  },
  {
    id: 'js-ch-beg-4',
    title: 'تحويل درجة الحرارة',
    description: 'حول بين سلسيوس وفهرنهايت',
    difficulty: 'easy',
    points: 10,
    language: 'JavaScript',
    icon: 'thermometer',
    starterCode: `function celsiusToFahrenheit(celsius) {
  // C to F: (C × 9/5) + 32
}

function fahrenheitToCelsius(fahrenheit) {
  // F to C: (F - 32) × 5/9
}`,
    solution: `function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5/9;
}`,
    hints: ['اتبع المعادلة الرياضية', 'F = C × 9/5 + 32'],
    testCases: [
      {
        input: 'celsiusToFahrenheit(0)',
        expectedOutput: '32',
        description: 'تجمد الماء',
      },
      {
        input: 'celsiusToFahrenheit(100)',
        expectedOutput: '212',
        description: 'غليان الماء',
      },
      {
        input: 'fahrenheitToCelsius(32)',
        expectedOutput: '0',
        description: 'فهرنهايت إلى سلسيوس',
      },
    ],
    isLocked: false,
    category: 'math',
  },
  {
    id: 'js-ch-beg-5',
    title: 'التحقق من السن',
    description: 'تحقق إذا كان الشخص بالغاً',
    difficulty: 'easy',
    points: 10,
    language: 'JavaScript',
    icon: 'how-to-reg',
    starterCode: `function isAdult(age) {
  // أرجع true إذا كان العمر 18 أو أكبر
}

function canVote(age, country) {
  // السن القانوني للتصويت:
  // "USA": 18, "Brazil": 16, "Austria": 16
}`,
    solution: `function isAdult(age) {
  return age >= 18;
}

function canVote(age, country) {
  const votingAge = {
    "USA": 18,
    "Brazil": 16,
    "Austria": 16
  };
  return age >= (votingAge[country] || 18);
}`,
    hints: ['استخدم عامل المقارنة >=', 'استخدم object للسن القانوني لكل دولة'],
    testCases: [
      { input: 'isAdult(20)', expectedOutput: 'true', description: 'بالغ' },
      { input: 'isAdult(15)', expectedOutput: 'false', description: 'قاصر' },
      {
        input: 'canVote(18, "USA")',
        expectedOutput: 'true',
        description: 'تصويت في أمريكا',
      },
      {
        input: 'canVote(16, "Brazil")',
        expectedOutput: 'true',
        description: 'تصويت في البرازيل',
      },
    ],
    isLocked: false,
    category: 'logic',
  },
];

// ===== تحديات JavaScript المتوسطة =====
export const JS_CHALLENGES_INTERMEDIATE: Challenge[] = [
  {
    id: 'js-ch-int-1',
    title: 'إزالة المكررات',
    description: 'أزل العناصر المكررة من المصفوفة',
    difficulty: 'medium',
    points: 25,
    language: 'JavaScript',
    icon: 'filter-list',
    starterCode: `function removeDuplicates(arr) {
  // أرجع مصفوفة بدون تكرارات
}

console.log(removeDuplicates([1, 2, 2, 3, 3, 3])); // [1, 2, 3]`,
    solution: `function removeDuplicates(arr) {
  return [...new Set(arr)];
}

// أو يدوياً:
function removeDuplicatesManual(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}`,
    hints: ['استخدم Set للحصول على قيم فريدة', 'أو استخدم filter مع indexOf'],
    testCases: [
      {
        input: '[1, 2, 2, 3]',
        expectedOutput: '[1, 2, 3]',
        description: 'أرقام مكررة',
      },
      {
        input: '["a", "b", "a"]',
        expectedOutput: '["a", "b"]',
        description: 'نصوص مكررة',
      },
    ],
    isLocked: false,
    category: 'arrays',
  },
  {
    id: 'js-ch-int-2',
    title: 'تسطيح المصفوفة',
    description: 'حول المصفوفة متعددة الأبعاد لمصفوفة واحدة',
    difficulty: 'medium',
    points: 30,
    language: 'JavaScript',
    icon: 'layers',
    starterCode: `function flatten(arr) {
  // سطّح المصفوفة بأي عمق
}

console.log(flatten([1, [2, [3, [4]]]])); // [1, 2, 3, 4]`,
    solution: `function flatten(arr) {
  return arr.flat(Infinity);
}

// أو باستخدام التكرار:
function flattenRecursive(arr) {
  return arr.reduce((flat, item) => 
    flat.concat(Array.isArray(item) ? flattenRecursive(item) : item), []);
}`,
    hints: [
      'استخدم flat(Infinity) للتسطيح الكامل',
      'أو استخدم reduce مع recursion',
    ],
    testCases: [
      {
        input: '[1, [2, 3]]',
        expectedOutput: '[1, 2, 3]',
        description: 'مستوى واحد',
      },
      {
        input: '[1, [2, [3]]]',
        expectedOutput: '[1, 2, 3]',
        description: 'مستويات متعددة',
      },
    ],
    isLocked: false,
    category: 'arrays',
  },
  {
    id: 'js-ch-int-3',
    title: 'تجميع العناصر',
    description: 'جمّع عناصر المصفوفة حسب خاصية معينة',
    difficulty: 'medium',
    points: 35,
    language: 'JavaScript',
    icon: 'group',
    starterCode: `function groupBy(arr, key) {
  // جمّع العناصر حسب قيمة key
}

const people = [
  { name: 'Ali', age: 25 },
  { name: 'Sara', age: 25 },
  { name: 'Omar', age: 30 }
];
console.log(groupBy(people, 'age'));
// { 25: [{...}, {...}], 30: [{...}] }`,
    solution: `function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const value = item[key];
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
}`,
    hints: ['استخدم reduce لبناء الكائن', 'أنشئ مصفوفة جديدة لكل قيمة مفتاح'],
    testCases: [
      {
        input: '[{name: "Ali", age: 25}, {name: "Sara", age: 30}], "age"',
        expectedOutput:
          '{"25": [{"name": "Ali", "age": 25}], "30": [{"name": "Sara", "age": 30}]}',
        description: 'تجميع حسب العمر',
      },
      {
        input:
          '[{name: "Ali", city: "Baghdad"}, {name: "Sara", city: "Baghdad"}], "city"',
        expectedOutput:
          '{"Baghdad": [{"name": "Ali", "city": "Baghdad"}, {"name": "Sara", "city": "Baghdad"}]}',
        description: 'تجميع مدينة واحدة',
      },
    ],
    isLocked: false,
    category: 'objects',
  },
  {
    id: 'js-ch-int-4',
    title: 'Throttle Function',
    description: 'نفذ دالة throttle',
    difficulty: 'medium',
    points: 40,
    language: 'JavaScript',
    icon: 'timer',
    starterCode: `function throttle(func, limit) {
  // نفذ الدالة مرة واحدة كل limit مللي ثانية
}

const log = throttle(() => console.log('Hello'), 1000);`,
    solution: `function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}`,
    hints: [
      'استخدم flag للتحقق من الحالة',
      'استخدم setTimeout لإعادة تعيين الـ flag',
    ],
    testCases: [
      {
        input: '(() => "test"), 1000',
        expectedOutput: 'function',
        description: 'يرجع دالة جديدة',
      },
      {
        input: '((x) => x * 2), 500',
        expectedOutput: 'function',
        description: 'يرجع دالة مع معاملات',
      },
    ],
    isLocked: false,
    category: 'functions',
  },
  {
    id: 'js-ch-int-5',
    title: 'Deep Clone',
    description: 'انسخ كائن بشكل عميق',
    difficulty: 'medium',
    points: 35,
    language: 'JavaScript',
    icon: 'content-copy',
    starterCode: `function deepClone(obj) {
  // انسخ الكائن بكل مستوياته
}

const original = { a: 1, b: { c: 2 } };
const copy = deepClone(original);`,
    solution: `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const clone = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
}

// أو ببساطة:
const deepCloneSimple = obj => JSON.parse(JSON.stringify(obj));`,
    hints: ['استخدم التكرار للكائنات المتداخلة', 'تحقق من نوع كل قيمة'],
    testCases: [
      {
        input: '{"a": {"b": 1}}',
        expectedOutput: '{"a":{"b":1}}',
        description: 'نسخ عميق لكائن متداخل',
      },
      {
        input: '[1, [2, 3], {"a": 4}]',
        expectedOutput: '[1,[2,3],{"a":4}]',
        description: 'نسخ عميق لمصفوفة مختلطة',
      },
      {
        input: '{"x": null}',
        expectedOutput: '{"x":null}',
        description: 'نسخ كائن يحتوي null',
      },
    ],
    isLocked: false,
    category: 'objects',
  },
];

// ===== تحديات JavaScript المتقدمة =====
export const JS_CHALLENGES: Challenge[] = [
  {
    id: 'js-challenge-1',
    title: 'عكس النص',
    description: 'اكتب دالة تعكس نص معطى',
    difficulty: 'easy',
    points: 15,
    language: 'JavaScript',
    icon: 'code',
    starterCode: `function reverseString(str) {
  // اكتب الحل هنا
  
}

// اختبر الدالة
console.log(reverseString("مرحباً")); // ًابحرم
console.log(reverseString("hello")); // olleh`,
    solution: `function reverseString(str) {
  return str.split('').reverse().join('');
}`,
    hints: [
      'استخدم split() لتحويل النص لمصفوفة',
      'استخدم reverse() لعكس المصفوفة',
      'استخدم join() لإعادة التحويل لنص',
    ],
    testCases: [
      {
        input: '"hello"',
        expectedOutput: '"olleh"',
        description: 'نص إنجليزي',
      },
      { input: '"مرحباً"', expectedOutput: '"ًابحرم"', description: 'نص عربي' },
      { input: '""', expectedOutput: '""', description: 'نص فارغ' },
    ],
    isLocked: false,
    category: 'strings',
  },
  {
    id: 'js-challenge-2',
    title: 'FizzBuzz',
    description:
      'اطبع الأرقام من 1 إلى n، لكن: Fizz للمضاعفات 3، Buzz للمضاعفات 5، FizzBuzz لكليهما',
    difficulty: 'easy',
    points: 20,
    language: 'JavaScript',
    icon: 'code',
    starterCode: `function fizzBuzz(n) {
  const result = [];
  // اكتب الحل هنا
  
  return result;
}

console.log(fizzBuzz(15));`,
    solution: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      result.push("FizzBuzz");
    } else if (i % 3 === 0) {
      result.push("Fizz");
    } else if (i % 5 === 0) {
      result.push("Buzz");
    } else {
      result.push(i);
    }
  }
  return result;
}`,
    hints: [
      'استخدم حلقة من 1 إلى n',
      'افحص قابلية القسمة على 15 أولاً (3 و 5)',
      'ثم افحص 3 ثم 5 منفصلين',
    ],
    testCases: [
      {
        input: '5',
        expectedOutput: '[1, 2, "Fizz", 4, "Buzz"]',
        description: 'أول 5 أرقام',
      },
      {
        input: '15',
        expectedOutput:
          '[1,2,"Fizz",4,"Buzz","Fizz",7,8,"Fizz","Buzz",11,"Fizz",13,14,"FizzBuzz"]',
        description: 'يشمل 15',
      },
    ],
    isLocked: false,
    category: 'logic',
  },
  {
    id: 'js-challenge-3',
    title: 'Palindrome Checker',
    description:
      'تحقق إذا كان النص متماثل (يُقرأ من اليسار واليمين بنفس الطريقة)',
    difficulty: 'medium',
    points: 30,
    language: 'JavaScript',
    icon: 'code',
    starterCode: `function isPalindrome(str) {
  // اكتب الحل هنا
  
}

console.log(isPalindrome("A man a plan a canal Panama")); // true
console.log(isPalindrome("hello")); // false`,
    solution: `function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
    hints: [
      'حوّل النص لحروف صغيرة',
      'أزل المسافات والرموز',
      'قارن النص الأصلي بالمعكوس',
    ],
    testCases: [
      {
        input: '"racecar"',
        expectedOutput: 'true',
        description: 'كلمة متماثلة',
      },
      {
        input: '"hello"',
        expectedOutput: 'false',
        description: 'كلمة غير متماثلة',
      },
      {
        input: '"A man a plan a canal Panama"',
        expectedOutput: 'true',
        description: 'جملة متماثلة مع مسافات',
      },
    ],
    isLocked: false,
    category: 'strings',
  },
  {
    id: 'js-challenge-4',
    title: 'Two Sum',
    description: 'أوجد فهارس رقمين مجموعهما يساوي target',
    difficulty: 'medium',
    points: 35,
    language: 'JavaScript',
    icon: 'code',
    starterCode: `function twoSum(nums, target) {
  // اكتب الحل هنا
  
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6)); // [1, 2]`,
    solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    hints: [
      'استخدم Hash Map لتخزين الأرقام وفهارسها',
      'لكل رقم، احسب المكمل (target - num)',
      'تحقق إذا المكمل موجود في الـ Map',
    ],
    testCases: [
      {
        input: '[2, 7, 11, 15], 9',
        expectedOutput: '[0, 1]',
        description: '2 + 7 = 9',
      },
      {
        input: '[3, 3], 6',
        expectedOutput: '[0, 1]',
        description: 'أرقام متشابهة',
      },
    ],
    isLocked: false,
    category: 'arrays',
  },
  {
    id: 'js-challenge-5',
    title: 'Debounce Function',
    description: 'نفذ دالة debounce التي تؤخر تنفيذ الدالة حتى توقف المستخدم',
    difficulty: 'hard',
    points: 50,
    language: 'JavaScript',
    icon: 'code',
    starterCode: `function debounce(func, delay) {
  // اكتب الحل هنا
  
}

// مثال الاستخدام:
const search = debounce((query) => {
  console.log("Searching:", query);
}, 300);

search("a");
search("ab");
search("abc"); // فقط هذه تُنفذ بعد 300ms`,
    solution: `function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}`,
    hints: [
      'استخدم setTimeout و clearTimeout',
      'خزّن الـ timeout ID في closure',
      'امسح الـ timeout السابق عند كل استدعاء',
    ],
    testCases: [
      {
        input: '() => {}, 500',
        expectedOutput: 'function',
        description: 'يرجع دالة جديدة',
      },
    ],
    isLocked: true,
    category: 'functions',
  },
];

// ===== التصدير =====
export const ALL_JS_LESSONS: Lesson[] = [
  ...JS_BEGINNER_LESSONS,
  ...JS_ADVANCED_LESSONS,
];
export const ALL_JS_CHALLENGES: Challenge[] = [
  ...JS_CHALLENGES_BEGINNER,
  ...JS_CHALLENGES_INTERMEDIATE,
  ...JS_CHALLENGES,
];

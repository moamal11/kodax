/**
 * منهج cpp-basics — أساسيات C++ للمبتدئ.
 *
 * كان: 10 دروس بشرح من سطر واحد؛ النصوص (std::string) و std::vector غير مشروحة رغم
 * استخدامها في الأمثلة؛ درس 10 يشرح المؤشرات و new/delete قبل دورة المؤشرات كاملة
 * (تكرار وقفزة صعوبة)؛ مثال while يحتوي قائمة تفاعلية تعلق إلى الأبد بدون إدخال؛
 * استخدام string بدون #include <string>؛ لا قراءة لأخطاء المترجم ولا مشروع.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';

export const CPP_BASICS_PLAN: CoursePlan = {
  courseId: 'cpp-basics',
  course: {
    description:
      'تعلّم C++ من الصفر: بنية البرنامج والترجمة، المتغيرات والأنواع، الإدخال والإخراج، القرارات والحلقات، النصوص std::string، المصفوفات و std::vector، الدوال والمراجع، وقراءة أخطاء المترجم — مع مشروع عملي.',
  },
  sections: [
    { title: 'البداية', lessons: ['cpp-1', 'cpp-2', 'cpp-3', 'cpp-4'] },
    { title: 'القرارات والتكرار', lessons: ['cpp-5', 'cpp-6', 'cpp-7'] },
    { title: 'النصوص والمجموعات', lessons: ['cpp-basics-strings', 'cpp-8', 'cpp-basics-vector'] },
    { title: 'الدوال', lessons: ['cpp-9', 'cpp-10'] },
    { title: 'التطبيق', lessons: ['cpp-basics-errors', 'cpp-basics-project'] },
  ],
  codeFixes: {
    'cpp-5': [['#include <iostream>\n', '#include <iostream>\n#include <string>\n']],
    'cpp-6': [['#include <vector>\n', '#include <vector>\n#include <string>\n']],
    'cpp-9': [['#include <iostream>\n', '#include <iostream>\n#include <string>\n']],
  },
  patches: {
    'cpp-1': {
      content: md`
# مرحباً بك في C++

C++ لغة **مترجمة (compiled)** سريعة جداً، تُستخدم حيث يهم الأداء: محركات الألعاب، المتصفحات، أنظمة التشغيل، قواعد البيانات، والأنظمة المدمجة. تعلمها يعطيك فهماً عميقاً لكيفية عمل الحاسوب.

## الترجمة: الفرق عن Python
في Python يقرأ المفسّر الكود وينفذه سطراً سطراً. في C++ تمر بخطوتين:
1. **المترجم (compiler)** يحوّل ملف الكود \`main.cpp\` كاملاً إلى برنامج تنفيذي بلغة الآلة.
2. **تشغيل** البرنامج الناتج.
إذا كان في الكود خطأ صياغة واحد، لا يُنتَج البرنامج أصلاً. هذا يكتشف كثيراً من الأخطاء قبل التشغيل.

## هيكل أصغر برنامج
\`\`\`cpp
#include <iostream>

int main() {
    std::cout << "مرحباً بالعالم!" << std::endl;
    return 0;
}
\`\`\`
| الجزء | المعنى |
|---|---|
| \`#include <iostream>\` | يضيف مكتبة الإدخال والإخراج |
| \`int main()\` | الدالة الرئيسية: التنفيذ يبدأ منها دائماً |
| \`{ ... }\` | كتلة الكود |
| \`std::cout << ...\` | الإخراج إلى الشاشة |
| \`;\` | نهاية كل أمر |
| \`return 0;\` | البرنامج انتهى بنجاح |

## std:: و using namespace std
\`cout\` و \`endl\` موجودان داخل "مساحة أسماء" المكتبة القياسية \`std\`. يمكنك كتابة \`std::cout\` في كل مرة، أو كتابة \`using namespace std;\` مرة واحدة أعلى الملف لاختصارها. الأمثلة في Kodax تستخدم \`using namespace std;\` للتبسيط، وهي مقبولة في البرامج الصغيرة؛ في المشاريع الكبيرة يفضّل المبرمجون \`std::\` لتجنب تصادم الأسماء.

## الإخراج
\`\`\`cpp
cout << "العمر: " << 25 << endl;   // سلسلة << لدمج عدة قيم
cout << "سطر" << "\n";             // "\n" سطر جديد أيضاً
\`\`\`
\`endl\` تضيف سطراً جديداً **وتفرغ** المخزن المؤقت للإخراج؛ \`"\n"\` تضيف السطر فقط وهي أسرع. كلاهما صحيح للمبتدئ.

## التعليقات
\`// سطر واحد\` و \`/* عدة أسطر */\`.

## أخطاء شائعة
- نسيان \`;\`: المترجم يشير غالباً إلى السطر **التالي**.
- كتابة \`Main\` بدل \`main\`: C++ حساسة لحالة الأحرف.
- نسيان \`#include <iostream>\` ← \`'cout' was not declared\`.

## تمرين
اكتب برنامجاً يطبع اسمك في سطر، وعمرك في سطر، ثم سطراً واحداً فيه ناتج \`7 * 6\`.
`,
    },
    'cpp-2': {
      content: md`
# المتغيرات وأنواع البيانات

المتغير **مكان في الذاكرة له اسم ونوع**. على عكس Python، في C++ يجب أن تعلن عن **نوع** المتغير عند إنشائه، والنوع لا يتغير بعد ذلك (كتابة ثابتة static typing). المترجم يستخدم النوع ليعرف حجم الذاكرة والعمليات المسموحة، ويرفض الكود الذي يخلط الأنواع بشكل خاطئ قبل تشغيله.

\`\`\`cpp
int age = 25;          // تصريح وتهيئة
double price = 9.99;
age = 26;              // تغيير القيمة مسموح
age = "ستة وعشرون";    // خطأ ترجمة: النوع int لا يقبل نصاً
\`\`\`

## الأنواع الأساسية
| النوع | يخزن | الحجم المعتاد |
|---|---|---|
| \`int\` | عدد صحيح | 4 بايت (±2.1 مليار تقريباً) |
| \`long long\` | عدد صحيح كبير | 8 بايت |
| \`double\` | عدد عشري (15-16 رقماً دقيقاً) | 8 بايت |
| \`float\` | عدد عشري أقل دقة | 4 بايت |
| \`char\` | حرف واحد بين علامتي تنصيص مفردتين \`'A'\` | 1 بايت |
| \`bool\` | \`true\` أو \`false\` | 1 بايت |
| \`std::string\` | نص بين علامتي تنصيص مزدوجتين (يحتاج \`#include <string>\`) | متغير |
الأحجام "المعتادة" وليست مضمونة على كل الأنظمة؛ \`sizeof(type)\` يخبرك بالحجم الفعلي. استخدم \`double\` افتراضياً للأعداد العشرية.

## ⚠️ المتغير غير المهيأ
\`\`\`cpp
int count;              // قيمته عشوائية (ما كان في الذاكرة سابقاً)!
cout << count;          // سلوك غير معرّف
int total = 0;          // ✅ هيّئ دائماً
\`\`\`
هذا من أكثر أخطاء المبتدئين شيوعاً في C++، ولا يحدث في Python.

## const للثوابت
\`\`\`cpp
const double TAX_RATE = 0.15;
TAX_RATE = 0.2;   // خطأ ترجمة
\`\`\`

## auto
\`auto x = 3.5;\` يجعل المترجم يستنتج النوع (\`double\` هنا). مفيد مع الأنواع الطويلة، لكن للمبتدئ كتابة النوع صراحة أوضح.

## التحويل بين الأنواع
\`\`\`cpp
int a = 7, b = 2;
double result = static_cast<double>(a) / b;   // 3.5
int truncated = static_cast<int>(3.9);         // 3 (يحذف الكسر)
\`\`\`
\`static_cast\` هي الطريقة الحديثة والواضحة؛ ستجد في الكود القديم الصيغة \`(double)a\`.

## قواعد التسمية
حرف أو \`_\` في البداية، بدون مسافات أو كلمات محجوزة (\`int\`، \`class\`...). الأسلوب الشائع: \`totalPrice\` أو \`total_price\`، المهم الثبات على أسلوب واحد.

## تمرين
عرّف متغيرات لاسم منتج (string)، وسعره (double)، وكميته (int)، وهل هو متوفر (bool)، واطبعها مع إجمالي السعر، واطبع \`sizeof\` لكل من int و double.
`,
    },
    'cpp-3': {
      content: md`
# الإدخال والإخراج: cin و cout

\`cout\` تكتب إلى الشاشة، و \`cin\` تقرأ من لوحة المفاتيح. كلاهما في \`<iostream>\`.

## cin تقرأ حسب النوع
\`\`\`cpp
int age;
cin >> age;          // يقرأ رقماً صحيحاً
int x, y;
cin >> x >> y;       // قيمتان مفصولتان بمسافة أو سطر
\`\`\`
على عكس \`input()\` في Python، \`cin\` **تحوّل تلقائياً** إلى نوع المتغير.

## ماذا لو أدخل المستخدم نصاً بدل رقم؟
تفشل القراءة: يبقى المتغير بقيمة 0 (منذ C++11)، وتدخل \`cin\` **حالة فشل** تتجاهل كل قراءة لاحقة. افحص النجاح دائماً:
\`\`\`cpp
int age;
if (cin >> age) {
    cout << "عمرك " << age << endl;
} else {
    cout << "إدخال غير صالح" << endl;
}
\`\`\`
\`cin >> age\` نفسها تُستخدم كشرط: صحيحة إذا نجحت القراءة.

## النصوص: cin مقابل getline
\`\`\`cpp
string word;
cin >> word;              // يقرأ كلمة واحدة فقط (يتوقف عند المسافة)
string line;
getline(cin, line);       // يقرأ السطر كاملاً بالمسافات
\`\`\`

## فخ cin ثم getline
بعد \`cin >> age\` يبقى رمز السطر الجديد (Enter) في المخزن، فتقرأه \`getline\` فوراً وترجع نصاً فارغاً. الحل:
\`\`\`cpp
int age;
string fullName;
cin >> age;
cin.ignore(numeric_limits<streamsize>::max(), '\n');  // تجاهل بقية السطر (يحتاج <limits>)
getline(cin, fullName);
\`\`\`

## تنسيق الإخراج (<iomanip>)
\`\`\`cpp
cout << fixed << setprecision(2) << 3.14159;   // 3.14
cout << setw(10) << "Name" << setw(5) << 25;   // عرض ثابت للأعمدة
\`\`\`
\`fixed\` و \`setprecision\` تبقيان مفعّلتين لكل ما يُطبع بعدها.

## ملاحظة عن المحرر في Kodax
إذا شغّلت برنامجاً يقرأ بـ \`cin\` بدون إدخال، تفشل القراءة فوراً. لذلك تفحص الأمثلة نجاح القراءة وتستخدم قيمة افتراضية.

## تمرين
اكتب برنامجاً يقرأ عدد الطلاب ثم درجاتهم واحدة واحدة، ويطبع المتوسط بمنزلتين عشريتين، ويتعامل مع الإدخال غير الرقمي.
`,
    },
    'cpp-4': {
      content: md`
# العمليات الحسابية

## العمليات الأساسية
\`+\` \`-\` \`*\` \`/\` و \`%\` (باقي القسمة، للأعداد الصحيحة فقط).

## ⚠️ القسمة الصحيحة
\`\`\`cpp
cout << 7 / 2;      // 3  (وليس 3.5!)
cout << 7.0 / 2;    // 3.5
\`\`\`
إذا كان **الطرفان** صحيحين، تكون القسمة صحيحة ويُحذف الكسر. هذا يفاجئ القادمين من Python. الحل أن يكون أحد الطرفين عشرياً: \`static_cast<double>(sum) / count\`.

## الزيادة والنقصان
\`\`\`cpp
int i = 5;
i++;        // i = 6
int a = i++;   // a = 6 ثم i = 7  (لاحقة: استخدم ثم زِد)
int b = ++i;   // i = 8 ثم b = 8  (سابقة: زِد ثم استخدم)
\`\`\`
لا تكتب أكثر من \`++\` على نفس المتغير في تعبير واحد مثل \`i++ + i++\`: النتيجة غير مضمونة.

## الإسناد المركب
\`+=\` \`-=\` \`*=\` \`/=\` \`%=\`.

## أولوية العمليات
الأقواس، ثم \`*\` \`/\` \`%\`، ثم \`+\` \`-\`. عند الشك استخدم الأقواس.

## الفيضان (Overflow)
\`int\` له حد أقصى (حوالي 2.1 مليار). تجاوزه **لا يعطي خطأ** بل نتيجة خاطئة:
\`\`\`cpp
int big = 2000000000;
int doubled = big * 2;             // ❌ فيضان: سلوك غير معرّف
long long safe = 2LL * big;        // ✅ 4000000000
\`\`\`
استخدم \`long long\` للأعداد الكبيرة (مثل المضروب أو المبالغ بالفلس).

## دوال <cmath>
| الدالة | المثال |
|---|---|
| \`pow(x, y)\` | \`pow(2, 10)\` ← 1024 |
| \`sqrt(x)\` | الجذر التربيعي |
| \`abs(x)\` | القيمة المطلقة |
| \`ceil\` / \`floor\` / \`round\` | التقريب لأعلى، لأسفل، لأقرب |
\`pow\` ترجع \`double\`؛ لا تستخدمها للقوى الصحيحة الصغيرة داخل حلقات (\`x * x\` أدق وأسرع).

## تمرين
اقرأ عدد ثوانٍ، واطبعه بصيغة ساعات:دقائق:ثوانٍ باستخدام \`/\` و \`%\`، ثم احسب متوسط ثلاث درجات صحيحة بشكل صحيح (عشري).
`,
    },
    'cpp-5': {
      content: md`
# الشروط: if و else و switch

## if و else if و else
\`\`\`cpp
int score = 75;
if (score >= 90) {
    cout << "ممتاز";
} else if (score >= 60) {
    cout << "ناجح";
} else {
    cout << "راسب";
}
\`\`\`
- الشرط بين **قوسين** دائماً.
- الأقواس المعقوفة \`{}\` تحدد الكتلة. بدونها يتبع الشرط **سطراً واحداً فقط**، وهذا مصدر أخطاء شهير؛ استخدمها دائماً.
- تُفحص الشروط بالترتيب، ويُنفَّذ أول شرط صحيح فقط.

## المقارنة والمنطق
\`==\` \`!=\` \`<\` \`>\` \`<=\` \`>=\`، و \`&&\` (و)، \`||\` (أو)، \`!\` (ليس).
\`\`\`cpp
int age = 20, day = 5;
bool hasLicense = true;
if (age >= 18 && hasLicense) { cout << "يمكنك القيادة"; }
if (day == 5 || day == 6) { cout << "عطلة نهاية الأسبوع"; }
\`\`\`
&& و || "تقصّران": إذا كان الطرف الأول من && خاطئاً لا يُفحص الثاني. مفيد لتجنب الأخطاء: \`if (count != 0 && total / count > 50)\`.

## ⚠️ = مقابل ==
\`\`\`cpp
int x = 0;
if (x = 5) { cout << "يُنفَّذ دائماً"; }   // خطأ منطقي: يُسند 5 لـ x والشرط دائماً صحيح!
\`\`\`
C++ تسمح بهذا (بعكس Python)؛ المترجم يعطي تحذيراً فقط. انتبه لها دائماً.

## العامل الثلاثي
\`string status = (age >= 18) ? "بالغ" : "قاصر";\`

## switch
لاختيار مسار حسب قيمة **عدد صحيح أو حرف**:
\`\`\`cpp
int choice = 2;
switch (choice) {
    case 1:
        cout << "إضافة";
        break;
    case 2:
        cout << "حذف";
        break;
    default:
        cout << "خيار غير معروف";
}
\`\`\`
- **break** ضرورية: بدونها يكمل التنفيذ إلى الحالة التالية (fall-through).
- لا يعمل switch مع النصوص (string) أو المدى (\`case > 50\` غير ممكن).
- \`default\` تُنفَّذ إذا لم تطابق أي حالة.

## تمرين
اكتب برنامج آلة حاسبة: يقرأ رقمين وعاملاً (\`char\`: + - * /)، ويستخدم switch، ويرفض القسمة على صفر برسالة واضحة.
`,
    },
    'cpp-6': {
      content: md`
# حلقة for

## البنية
\`\`\`cpp
for (int i = 0; i < 5; i++) {
    cout << i << " ";
}
\`\`\`
ثلاثة أجزاء مفصولة بـ \`;\`:
1. **البداية**: تُنفَّذ مرة واحدة (\`int i = 0\`).
2. **الشرط**: يُفحص قبل كل دورة؛ إذا كان خاطئاً تنتهي الحلقة.
3. **التحديث**: يُنفَّذ بعد كل دورة (\`i++\`).

المتغير \`i\` المعرّف داخل for موجود داخل الحلقة فقط.

## أنماط شائعة
\`\`\`cpp
int n = 3;
for (int i = 10; i > 0; i--) cout << i << ' ';       // تنازلي
for (int i = 0; i <= 100; i += 5) cout << i << ' ';  // بخطوة
for (int i = 0; i < n; i++) cout << i << ' ';        // n مرة بالضبط (0 إلى n-1)
\`\`\`

## خطأ "الواحد الزائد" (off-by-one)
\`i <= n\` بدل \`i < n\` يعطي دورة إضافية، ومع المصفوفات يصل لعنصر غير موجود. اسأل نفسك دائماً: هل أبدأ من 0 أم 1؟ وهل النهاية مشمولة؟

## for المبنية على المدى (range-based)
للمرور على كل عناصر مجموعة دون فهرس:
\`\`\`cpp
int numbers[] = {4, 8, 15};
for (int n : numbers) {
    cout << n;
}
\`\`\`
مع النصوص والكائنات الكبيرة استخدم \`const auto&\` لتجنب نسخ كل عنصر: \`for (const string& name : names)\`. ولتعديل العناصر داخل الحلقة: \`for (int& n : numbers) n *= 2;\`.

## الحلقات المتداخلة
الحلقة الداخلية تكتمل في كل دورة من الخارجية: مناسبة للجداول والمصفوفات ثنائية الأبعاد.

## break و continue
\`break\` تخرج من الحلقة، و \`continue\` تنتقل للدورة التالية، تماماً كما في Python.

## تمرين
اطبع الأعداد الأولية من 2 إلى 50 باستخدام حلقتين متداخلتين و break، ثم اطبع مثلث أرقام:
\`1\` ثم \`1 2\` ثم \`1 2 3\` حتى 5.
`,
    },
    'cpp-7': {
      content: md`
# حلقتا while و do-while

## while
تكرر **طالما** الشرط صحيح، وتفحصه **قبل** كل دورة (قد لا تُنفَّذ أبداً):
\`\`\`cpp
int balance = 1000, years = 0;
while (balance < 2000) {
    balance = balance * 107 / 100;
    years++;
}
\`\`\`
استخدمها عندما لا تعرف عدد التكرارات مسبقاً.

## do-while
تنفذ الكتلة **مرة واحدة على الأقل**، ثم تفحص الشرط:
\`\`\`cpp
int choice;
do {
    cout << "1) تشغيل  0) خروج: ";
    if (!(cin >> choice)) break;   // إدخال فاشل: اخرج
    // ...
} while (choice != 0);
\`\`\`
مناسبة للقوائم وطلب الإدخال حتى يكون صحيحاً. لاحظ الفاصلة المنقوطة بعد \`while (...)\`.

## ⚠️ القوائم التفاعلية والإدخال الفاشل
إذا فشلت \`cin\` (المستخدم كتب حرفاً أو لا يوجد إدخال)، تبقى في حالة فشل، والحلقة التي تنتظر قيمة معينة **تدور للأبد**. لهذا يجب أن تفحص نجاح القراءة داخل أي حلقة إدخال، كما في المثال أعلاه.

## الحلقة اللانهائية المقصودة
\`while (true) { ... if (done) break; }\` شائعة ومقبولة، بشرط وجود \`break\` يمكن الوصول إليه.

## for أم while؟
| for | while |
|---|---|
| عدد مرات معروف أو المرور على مجموعة | التكرار حتى يتحقق شرط |
| العدّاد جزء من الحلقة | الحالة تتغير داخل الجسم بطرق مختلفة |

## تمرين
اكتب برنامجاً يقرأ أرقاماً حتى يُدخل المستخدم 0 أو يفشل الإدخال، ثم يطبع مجموعها وأكبرها. ثم اكتب حلقة تحسب عدد خانات رقم صحيح (بالقسمة على 10 حتى يصبح 0).
`,
      codeExample: md`
#include <iostream>
using namespace std;

int main() {
    // while: عدد التكرارات غير معروف مسبقاً
    int balance = 1000;
    int years = 0;
    while (balance < 2000) {
        balance = balance * 107 / 100;   // فائدة 7% سنوياً
        years++;
    }
    cout << "يتضاعف المبلغ بعد " << years << " سنة" << endl;

    // عدد خانات رقم
    int number = 90817;
    int digits = 0;
    do {
        number /= 10;
        digits++;
    } while (number != 0);
    cout << "عدد الخانات: " << digits << endl;

    // قراءة أرقام حتى 0 أو فشل الإدخال (آمنة بدون إدخال)
    int value;
    int sum = 0;
    int count = 0;
    cout << "أدخل أرقاماً (0 للإنهاء): ";
    while (cin >> value && value != 0) {
        sum += value;
        count++;
    }
    cout << "\nقرأت " << count << " أرقام، مجموعها " << sum << endl;

    // قائمة تفاعلية تتوقف عند فشل الإدخال
    int choice = 0;
    do {
        cout << "1) تحية  2) وقت  0) خروج: ";
        if (!(cin >> choice)) {
            cout << "\nلا يوجد إدخال صالح، إنهاء القائمة" << endl;
            break;
        }
        switch (choice) {
            case 1: cout << "مرحباً!" << endl; break;
            case 2: cout << "حان وقت البرمجة" << endl; break;
            case 0: cout << "إلى اللقاء" << endl; break;
            default: cout << "خيار غير معروف" << endl;
        }
    } while (choice != 0);

    return 0;
}
`,
    },
    'cpp-8': {
      content: md`
# المصفوفات (Arrays)

المصفوفة تخزن **عدداً ثابتاً** من العناصر من **نفس النوع** متجاورة في الذاكرة.

\`\`\`cpp
int scores[5] = {90, 75, 88, 62, 95};
int zeros[100] = {};          // كل العناصر 0
int auto_size[] = {1, 2, 3};  // الحجم 3 تلقائياً
\`\`\`

## الفهرسة
الفهرس من \`0\` إلى \`الحجم - 1\`:
\`\`\`cpp
scores[0] = 100;
cout << scores[4];
\`\`\`

## ⚠️ لا يوجد فحص للحدود
\`\`\`cpp
cout << scores[5];    // خارج المصفوفة: سلوك غير معرّف!
\`\`\`
Python ترمي IndexError. أما C++ فتقرأ (أو تكتب!) ما يوجد في الذاكرة بعد المصفوفة: قد يعطي قيمة عشوائية، أو يفسد متغيرات أخرى، أو يوقف البرنامج. هذا من أخطر أخطاء C++، ومصدر ثغرات أمنية حقيقية (buffer overflow).

## الحجم ثابت
يجب أن يُعرف الحجم وقت الترجمة، ولا يمكن تكبير المصفوفة بعد إنشائها. لهذا ستستخدم في أغلب البرامج \`std::vector\` (الدرس التالي).

## المرور على العناصر
\`\`\`cpp
for (int i = 0; i < 5; i++) cout << scores[i];
for (int s : scores) cout << s;
\`\`\`
احفظ الحجم في ثابت واحد (\`const int SIZE = 5;\`) واستخدمه في كل مكان بدل تكرار الرقم.

## المصفوفة ثنائية الأبعاد
\`\`\`cpp
int grid[2][3] = {{1, 2, 3}, {4, 5, 6}};
cout << grid[1][2];   // 6
\`\`\`

## تمرير المصفوفة لدالة
المصفوفة لا تعرف حجمها عند تمريرها؛ مرّر الحجم معها: \`double average(const int arr[], int size)\`.

## std::array: البديل الحديث للحجم الثابت
\`\`\`cpp
#include <array>
array<int, 3> a = {1, 2, 3};
a.size();      // 3 (تعرف حجمها)
a.at(5);       // ترمي استثناء بدل السلوك غير المعرّف
\`\`\`

## تمرين
خزّن درجات 7 أيام في مصفوفة، واطبع أعلى درجة ويومها، وعدد الأيام فوق المتوسط.
`,
    },
    'cpp-9': {
      content: md`
# الدوال (Functions)

الدالة كتلة كود لها اسم، تقسّم البرنامج إلى أجزاء صغيرة واضحة يمكن إعادة استخدامها واختبارها.

## البنية
\`\`\`cpp
double average(int a, int b) {     // نوع القيمة المرجعة، الاسم، المعاملات
    return (a + b) / 2.0;
}
\`\`\`
- **نوع القيمة المرجعة** إلزامي؛ \`void\` تعني لا ترجع شيئاً.
- لكل معامل نوع.
- دالة غير void يجب أن ترجع قيمة في كل المسارات، وإلا فالنتيجة غير معرّفة.

## يجب أن تُعرف الدالة قبل استدعائها
المترجم يقرأ الملف من الأعلى. إذا استدعيت دالة معرّفة أسفل \`main\`، اكتب **تصريحها (prototype)** أولاً:
\`\`\`cpp
#include <iostream>
using namespace std;

int add(int a, int b);     // تصريح

int main() {
    cout << add(2, 3);
}

int add(int a, int b) {    // تعريف
    return a + b;
}
\`\`\`
في المشاريع الكبيرة توضع التصريحات في ملفات \`.h\` والتعريفات في \`.cpp\`.

## التمرير بالقيمة (الافتراضي)
\`\`\`cpp
void tryChange(int x) {
    x = 100;          // يعدّل نسخة فقط
}
\`\`\`
الدالة تستلم **نسخة**؛ المتغير الأصلي لا يتغير. (التمرير بالمرجع لتعديل الأصل هو موضوع الدرس التالي.)

## القيم الافتراضية
\`void greet(string name = "ضيف")\` — توضع القيم الافتراضية في **التصريح** إن وُجد، ومن اليمين إلى اليسار.

## التحميل الزائد (Overloading)
عدة دوال بنفس الاسم ومعاملات مختلفة:
\`\`\`cpp
int multiply(int a, int b);
double multiply(double a, double b);
\`\`\`
المترجم يختار الدالة حسب أنواع الوسائط.

## النطاق
المتغيرات داخل الدالة محلية لها. تجنب المتغيرات العامة القابلة للتعديل؛ مرّر ما تحتاجه كمعاملات وأرجع النتيجة.

## تمرين
اكتب دوال: \`isPrime(int n)\` ترجع bool، و \`maxOf(int a, int b, int c)\`، و \`printLine(char ch = '-', int length = 20)\`، واستخدمها من main مع تصريحات قبلها.
`,
    },
    'cpp-10': {
      title: 'المراجع وتمرير المعاملات (References)',
      description: 'التمرير بالمرجع لتعديل الأصل، و const& لتجنب النسخ',
      content: md`
# المراجع (References) وتمرير المعاملات

في الدرس السابق رأيت أن الدالة تستلم **نسخة** من المعامل. أحياناً نريد عكس ذلك: أن تعدّل الدالة المتغير الأصلي، أو أن نتجنب نسخ بيانات كبيرة. الأداة لذلك في C++ هي **المرجع**.

## ما هو المرجع؟
المرجع **اسم آخر لنفس المتغير** (alias):
\`\`\`cpp
int score = 80;
int& ref = score;   // ref اسم آخر لـ score
ref = 95;
cout << score;      // 95
\`\`\`
- يُعلن بـ \`&\` بعد النوع.
- يجب أن يُربط بمتغير **عند إنشائه**، ولا يمكن إعادة ربطه بمتغير آخر لاحقاً.

## التمرير بالمرجع: تعديل الأصل
\`\`\`cpp
void addBonus(int& score, int bonus) {
    score += bonus;          // يعدّل متغير المستدعي
}

int s = 70;
addBonus(s, 10);             // s = 80
\`\`\`
مثال كلاسيكي: تبديل قيمتين \`void swapValues(int& a, int& b)\`. (المكتبة فيها \`std::swap\` جاهزة.)

## const&: قراءة بدون نسخ
نسخ نص طويل أو vector فيها مليون عنصر عند كل استدعاء مكلف. التمرير بـ \`const&\` يعطي الدالة وصولاً للأصل **للقراءة فقط**:
\`\`\`cpp
double average(const vector<int>& numbers) {
    // numbers.push_back(1);  // خطأ ترجمة: const
    if (numbers.empty()) return 0;
    double sum = 0;
    for (int n : numbers) sum += n;
    return sum / numbers.size();
}
\`\`\`

## القاعدة العملية
| الحالة | الطريقة |
|---|---|
| أنواع صغيرة (int، double، char، bool) للقراءة | بالقيمة: \`int x\` |
| أنواع كبيرة (string، vector، كائنات) للقراءة | \`const T&\` |
| الدالة يجب أن تعدّل الأصل | \`T&\` |

## إرجاع عدة نتائج
بدلاً من المعاملات المرجعية "للإخراج"، الأوضح غالباً إرجاع قيمة مركبة، مثل \`std::pair\` أو struct (ستتعلمها لاحقاً). استخدم المراجع للإخراج عند الحاجة فقط.

## ⚠️ لا ترجع مرجعاً لمتغير محلي
\`\`\`cpp
int& bad() {
    int local = 5;
    return local;   // local يُدمَّر عند انتهاء الدالة ← مرجع معلّق
}
\`\`\`

## وماذا عن المؤشرات؟
المؤشرات (\`int*\`) أداة أخرى تخزن **عنوان** المتغير، ويمكن أن تكون فارغة أو تتغير. ستتعلمها بالتفصيل في دورة "المؤشرات وإدارة الذاكرة". في الكود الحديث، المراجع هي الخيار الأول لتمرير المعاملات.

## تمرين
اكتب \`void normalize(vector<double>& values)\` تقسم كل عنصر على أكبر قيمة، و \`int countAbove(const vector<int>& v, int limit)\` دون نسخ.
`,
      codeExample: md`
#include <iostream>
#include <string>
#include <vector>
using namespace std;

void tryChange(int x) {          // بالقيمة: نسخة
    x = 100;
}

void addBonus(int& score, int bonus) {   // بالمرجع: يعدّل الأصل
    score += bonus;
}

void swapValues(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

// const& : قراءة بدون نسخ
double average(const vector<int>& numbers) {
    if (numbers.empty()) return 0;
    int sum = 0;
    for (int n : numbers) sum += n;
    return static_cast<double>(sum) / numbers.size();
}

void shout(const string& text) {
    cout << text << "!" << endl;
}

int main() {
    int score = 70;
    tryChange(score);
    cout << "بعد tryChange: " << score << endl;   // 70

    addBonus(score, 10);
    cout << "بعد addBonus: " << score << endl;    // 80

    int a = 1, b = 2;
    swapValues(a, b);
    cout << "a=" << a << " b=" << b << endl;      // a=2 b=1

    int& alias = score;    // اسم آخر لنفس المتغير
    alias = 95;
    cout << "score الآن: " << score << endl;       // 95

    vector<int> grades = {90, 75, 88};
    cout << "المتوسط: " << average(grades) << endl;
    shout("C++ ممتعة");
    return 0;
}
`,
      quiz: {
        question: 'ما الطريقة الأنسب لتمرير vector كبيرة لدالة تقرأها فقط؟',
        options: ['vector<int> v', 'vector<int>& v', 'const vector<int>& v', 'int v[]'],
        correctAnswer: 2,
        explanation: 'const& تتجنب نسخ البيانات وتمنع الدالة من تعديلها.',
      },
    },
  },
  newLessons: [
    {
      id: 'cpp-basics-strings',
      title: 'النصوص: std::string',
      description: 'إنشاء النصوص ودمجها والوصول لأحرفها والبحث فيها وتحويل الأرقام',
      xpReward: 100,
      language: 'cpp',
      content: md`
# النصوص: std::string

\`std::string\` من المكتبة القياسية (\`#include <string>\`) هي الطريقة الحديثة للتعامل مع النصوص في C++: تدير ذاكرتها تلقائياً وتكبر حسب الحاجة.

\`\`\`cpp
#include <string>
string name = "Ahmed";
string empty;              // نص فارغ ""
\`\`\`

## الطول والأحرف
\`\`\`cpp
name.size();        // 5 (أو name.length())
name[0];            // 'A' (بدون فحص الحدود)
name.at(0);         // 'A' مع فحص الحدود: يرمي استثناء إذا تجاوزت
name[0] = 'a';      // النصوص في C++ قابلة للتعديل (بعكس Python)
\`\`\`

## الدمج والمقارنة
\`\`\`cpp
string first = "Ahmed", last = "Ali", name = "Ahmed";
string a = "apple", b = "banana";
string full = first + " " + last;
full += "!";
if (name == "Ahmed") { cout << "متطابقان"; }     // مقارنة المحتوى
if (a < b) { cout << a << " قبل " << b; }        // مقارنة أبجدية
\`\`\`
\`"Hello" + " World"\` بين نصين حرفيين لا يعمل، لأن النصوص الحرفية ليست \`std::string\`؛ يجب أن يكون أحد الطرفين \`string\`.

## دوال مفيدة
| الدالة | الوظيفة |
|---|---|
| \`find("x")\` | موقع أول ظهور، أو \`string::npos\` إذا لم يوجد |
| \`substr(pos, len)\` | جزء من النص |
| \`replace(pos, len, "new")\` | استبدال جزء |
| \`insert(pos, "x")\` / \`erase(pos, len)\` | إدراج وحذف |
| \`empty()\` | هل النص فارغ؟ |
| \`push_back(c)\` | إضافة حرف |

\`\`\`cpp
string email = "user@site.com";
size_t at = email.find('@');
if (at != string::npos) {
    string user = email.substr(0, at);
}
\`\`\`

## التحويل بين النصوص والأرقام
\`\`\`cpp
int n = stoi("42");          // نص ← int
double d = stod("3.5");      // نص ← double
string s = to_string(99);    // رقم ← نص
\`\`\`
\`stoi("abc")\` ترمي استثناء \`invalid_argument\`.

## المرور على الأحرف
\`\`\`cpp
string word = "Kodax";
for (char c : word) { cout << c << ' '; }
\`\`\`
دوال الأحرف في \`<cctype>\`: \`toupper\`، \`tolower\`، \`isdigit\`، \`isalpha\`، \`isspace\`.

## ⚠️ النصوص العربية
\`std::string\` تخزن **بايتات** وليس أحرفاً. الحرف العربي في ترميز UTF-8 يأخذ بايتين، لذلك \`string("سلام").size()\` تساوي 8 وليس 4، و \`word[0]\` نصف حرف. الدوال \`size\` و \`[]\` و \`substr\` آمنة بالكامل مع النصوص الإنجليزية؛ مع العربية اكتفِ بالطباعة والدمج والمقارنة والبحث عن نص كامل.

## تمرين
اكتب برنامجاً يأخذ جملة إنجليزية ويطبع: عدد الكلمات، والجملة بأحرف كبيرة، وهل هي palindrome (تُقرأ نفسها معكوسة) بعد تجاهل المسافات.
`,
      codeExample: md`
#include <algorithm>
#include <cctype>
#include <iostream>
#include <string>
using namespace std;

int main() {
    string first = "Ada";
    string last = "Lovelace";
    string full = first + " " + last;
    cout << full << " (" << full.size() << " chars)" << endl;

    // الوصول والتعديل
    full[0] = 'a';
    cout << full << " | first char: " << full.at(0) << endl;

    // البحث والتقطيع
    string email = "student@kodax.app";
    size_t at = email.find('@');
    if (at != string::npos) {
        cout << "user: " << email.substr(0, at) << endl;
        cout << "domain: " << email.substr(at + 1) << endl;
    }
    if (email.find("gmail") == string::npos) {
        cout << "not gmail" << endl;
    }

    // التحويل
    int age = stoi("21");
    double price = stod("4.75");
    string label = "Total: " + to_string(age * price);
    cout << label << endl;

    // تحويل لأحرف كبيرة
    string shout = "hello c++";
    for (char& c : shout) c = toupper(static_cast<unsigned char>(c));
    cout << shout << endl;

    // palindrome
    string word = "racecar";
    string reversed(word.rbegin(), word.rend());
    cout << word << (word == reversed ? " is" : " is not") << " a palindrome" << endl;

    // تنبيه: النص العربي بايتات
    string arabic = "سلام";
    cout << "bytes in Arabic word: " << arabic.size() << endl;   // 8
    return 0;
}
`,
      quiz: {
        question: 'ماذا ترجع find() إذا لم يوجد النص المطلوب؟',
        options: ['-1', '0', 'string::npos', 'خطأ ترجمة'],
        correctAnswer: 2,
        explanation: 'find ترجع القيمة الخاصة string::npos عند عدم العثور على النص.',
      },
    },
    {
      id: 'cpp-basics-vector',
      title: 'المصفوفات الديناميكية: std::vector',
      description: 'vector بدل المصفوفات الثابتة: الإضافة والحذف والحجم والترتيب',
      xpReward: 110,
      language: 'cpp',
      content: md`
# المصفوفات الديناميكية: std::vector

المصفوفة العادية حجمها ثابت ولا تعرف طولها. \`std::vector\` (\`#include <vector>\`) مصفوفة **تكبر وتصغر تلقائياً** وتعرف حجمها، وهي الخيار الافتراضي لتخزين مجموعة عناصر في C++ الحديثة.

\`\`\`cpp
#include <vector>
vector<int> scores = {90, 75, 88};
vector<string> names;              // فارغة
vector<int> zeros(10, 0);          // 10 عناصر قيمتها 0
\`\`\`
ما بين \`< >\` هو **نوع العناصر**.

## العمليات الأساسية
| العملية | الكتابة |
|---|---|
| إضافة للنهاية | \`v.push_back(x)\` |
| حذف الأخير | \`v.pop_back()\` |
| الحجم | \`v.size()\` |
| هل فارغة | \`v.empty()\` |
| الوصول | \`v[i]\` (بدون فحص) أو \`v.at(i)\` (مع فحص) |
| أول/آخر عنصر | \`v.front()\` / \`v.back()\` |
| مسح الكل | \`v.clear()\` |

## المرور على العناصر
\`\`\`cpp
vector<int> scores = {70, 85, 90};
for (int s : scores) cout << s << ' ';                // قراءة
for (int& s : scores) s += 5;                         // تعديل
for (size_t i = 0; i < scores.size(); i++) {          // بالفهرس
    cout << i << ": " << scores[i] << '\n';
}
\`\`\`
\`size()\` ترجع نوعاً بدون إشارة (\`size_t\`)، لذلك استخدمه للعداد لتجنب تحذيرات المقارنة.

## الحذف من المنتصف
\`\`\`cpp
scores.erase(scores.begin() + 1);   // حذف العنصر الثاني
\`\`\`
\`begin()\` "مكرّر" يشير لأول عنصر؛ ستتعلم المكرّرات بالتفصيل في دورة C++ المتقدمة.

## خوارزميات جاهزة (<algorithm>)
\`\`\`cpp
sort(scores.begin(), scores.end());                       // تصاعدي
sort(scores.begin(), scores.end(), greater<int>());       // تنازلي
auto it = max_element(scores.begin(), scores.end());       // أكبر عنصر
int total = accumulate(scores.begin(), scores.end(), 0);   // المجموع (<numeric>)
\`\`\`

## vector داخل vector
\`vector<vector<int>> grid(3, vector<int>(4, 0));\` جدول 3×4.

## التمرير للدوال
تذكّر من درس المراجع: \`const vector<int>&\` للقراءة، و \`vector<int>&\` للتعديل. التمرير بالقيمة ينسخ كل العناصر.

## ⚠️ v[i] خارج الحدود
مثل المصفوفات العادية: سلوك غير معرّف. استخدم \`at()\` عندما يكون الفهرس قادماً من المستخدم، أو افحص \`i < v.size()\`.

## تمرين
اقرأ درجات حتى إدخال -1 في vector، ثم اطبعها مرتبة تنازلياً، واحذف الدرجات الأقل من 50، واطبع العدد المتبقي والمتوسط.
`,
      codeExample: md`
#include <algorithm>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>
using namespace std;

void printAll(const vector<int>& v) {
    for (int x : v) cout << x << " ";
    cout << "(size " << v.size() << ")" << endl;
}

int main() {
    vector<int> scores = {72, 95, 40, 88};
    scores.push_back(61);
    scores.push_back(33);
    printAll(scores);

    cout << "first: " << scores.front() << ", last: " << scores.back() << endl;

    // ترتيب تنازلي
    sort(scores.begin(), scores.end(), greater<int>());
    printAll(scores);

    // أكبر عنصر والمجموع
    int best = *max_element(scores.begin(), scores.end());
    int total = accumulate(scores.begin(), scores.end(), 0);
    cout << "best: " << best << ", average: " << static_cast<double>(total) / scores.size() << endl;

    // حذف الدرجات الأقل من 50
    scores.erase(remove_if(scores.begin(), scores.end(), [](int s) { return s < 50; }), scores.end());
    printAll(scores);

    // التعديل بالمرجع
    for (int& s : scores) s = min(100, s + 5);
    printAll(scores);

    // at() تفحص الحدود
    try {
        cout << scores.at(100) << endl;
    } catch (const out_of_range&) {
        cout << "index out of range" << endl;
    }

    vector<string> names;
    names.push_back("Mona");
    names.push_back("Ali");
    cout << names.size() << " names, empty? " << boolalpha << names.empty() << endl;
    return 0;
}
`,
      quiz: {
        question: 'ما الفرق بين v[i] و v.at(i)؟',
        options: ['لا فرق', 'at() تفحص الحدود وترمي استثناء', '[] أبطأ', 'at() تعدّل العنصر'],
        correctAnswer: 1,
        explanation: 'at() تتحقق من أن الفهرس داخل الحدود وترمي out_of_range؛ [] لا تفحص وخارج الحدود سلوك غير معرّف.',
      },
    },
    {
      id: 'cpp-basics-errors',
      title: 'قراءة أخطاء المترجم والتصحيح',
      description: 'فهم رسائل الأخطاء والتحذيرات، والأخطاء التي لا يكتشفها المترجم',
      xpReward: 100,
      language: 'cpp',
      content: md`
# قراءة أخطاء المترجم والتصحيح

رسائل مترجم C++ مخيفة في البداية: طويلة ومليئة بالمصطلحات. لكنها تتبع نمطاً ثابتاً، ومعرفة قراءتها توفر عليك ساعات.

## شكل الرسالة
\`\`\`text
main.cpp:7:5: error: 'cout' was not declared in this scope
\`\`\`
| الجزء | المعنى |
|---|---|
| \`main.cpp\` | الملف |
| \`7:5\` | السطر 7، العمود 5 |
| \`error\` | خطأ يمنع الترجمة (\`warning\` تحذير فقط) |
| بقية السطر | وصف المشكلة |

**ابدأ دائماً بأول خطأ**: خطأ واحد (مثل \`;\` ناقصة) قد يولّد عشرات الأخطاء التالية. أصلح الأول وأعد الترجمة.

## أشهر الأخطاء وأسبابها
| الرسالة | السبب المعتاد |
|---|---|
| \`expected ';' before ...\` | \`;\` ناقصة في السطر **السابق** |
| \`'x' was not declared in this scope\` | خطأ إملائي، أو متغير خارج نطاقه، أو \`#include\` / \`std::\` ناقصة |
| \`expected '}' at end of input\` | قوس معقوف لم يُغلق |
| \`no match for 'operator<<'\` | محاولة طباعة نوع لا تعرف cout طباعته |
| \`invalid conversion from ...\` | أنواع غير متوافقة |
| \`too few arguments to function\` | عدد وسائط خاطئ |
| \`undefined reference to ...\` | خطأ **ربط**: دالة مُصرَّح بها لكن لم تُعرَّف |

## التحذيرات مهمة
التحذير لا يمنع الترجمة لكنه غالباً **خطأ منطقي**: \`if (x = 5)\`، متغير غير مهيأ، مقارنة int مع size_t. فعّل التحذيرات (\`-Wall -Wextra\` مع g++) وعاملها كأخطاء.

## أخطاء لا يراها المترجم
البرنامج يترجم وينفّذ لكنه يتصرف بشكل خاطئ أو يتوقف:
- **قسمة صحيحة** غير مقصودة: \`sum / count\`.
- **فيضان** int.
- **متغير غير مهيأ**: قيمة عشوائية.
- **فهرس خارج المصفوفة**: قيم غريبة أو توقف (Segmentation fault).
- **حلقة لا نهائية** بسبب شرط لا يصبح خاطئاً أبداً.
هذه من النوع "السلوك غير المعرّف" (undefined behavior): قد يبدو البرنامج سليماً على جهازك ويفشل على جهاز آخر.

## أدوات التصحيح
1. **الطباعة**: اطبع قيم المتغيرات في النقاط المشكوك فيها.
2. **المصحح (debugger)**: في VS Code أو CLion ضع نقطة توقف ونفّذ سطراً سطراً.
3. **أدوات الفحص**: \`-fsanitize=address,undefined\` مع g++/clang تكتشف تجاوز الحدود والسلوك غير المعرّف عند التشغيل.

## تمرين
البرنامج في المثال يترجم ويعمل، لكنه يحتوي على ثلاثة أخطاء منطقية مشروحة في التعليقات. شغّله، وتوقع الناتج الصحيح، ثم أصلح الأخطاء الثلاثة.
`,
      codeExample: md`
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> scores = {90, 85, 77};

    // خطأ منطقي 1: قسمة صحيحة — النتيجة 84 بدل 84.0
    int sum = 0;
    for (int s : scores) sum += s;
    double average = sum / scores.size();          // الإصلاح: static_cast<double>(sum) / scores.size()
    cout << "average: " << average << endl;

    // خطأ منطقي 2: فيضان int — النتيجة سالبة أو غريبة
    int population = 2000000000;
    long long doubled = population * 2;            // الإصلاح: 2LL * population
    cout << "doubled: " << doubled << endl;

    // خطأ منطقي 3: off-by-one — يحسب عنصراً أقل
    int count = 0;
    for (size_t i = 1; i < scores.size(); i++) {   // الإصلاح: يبدأ من 0
        if (scores[i] >= 80) count++;
    }
    cout << "scores >= 80: " << count << " (الصحيح 2)" << endl;
    return 0;
}
`,
      quiz: {
        question: 'ظهرت 25 رسالة خطأ عند الترجمة. من أين تبدأ؟',
        options: ['من آخر خطأ', 'من أول خطأ', 'من أطول رسالة', 'أعد كتابة البرنامج'],
        correctAnswer: 1,
        explanation: 'الخطأ الأول غالباً يسبب الأخطاء التالية؛ أصلحه وأعد الترجمة.',
      },
    },
    {
      id: 'cpp-basics-project',
      title: 'مشروع: نظام درجات الطلاب',
      description: 'برنامج كامل بـ struct و vector و string والدوال والمراجع والتحقق من الإدخال',
      xpReward: 150,
      language: 'cpp',
      content: md`
# مشروع: نظام درجات الطلاب

برنامج يجمع كل ما تعلمته في الدورة: المتغيرات، النصوص، الشروط، الحلقات، vector، الدوال، والمراجع.

## المتطلبات
- تخزين طلاب لكل منهم اسم ودرجة.
- إضافة طالب، وعرض الجميع بجدول منسق، وإحصائيات (متوسط، أعلى، أقل، عدد الناجحين).
- عرض الطلاب مرتبين حسب الدرجة.
- عدم التوقف أو الدوران للأبد عند إدخال خاطئ.

## struct: تجميع بيانات الطالب
\`\`\`cpp
struct Student {
    string name;
    int score;
};
vector<Student> students;
students.push_back({"Mona", 95});
cout << students[0].name;
\`\`\`
\`struct\` تجمع عدة متغيرات مرتبطة في نوع واحد. (في دورة البرمجة الكائنية ستتعلم \`class\` التي تضيف التغليف والدوال.)

## تقسيم البرنامج
| الدالة | التمرير |
|---|---|
| \`string letterGrade(int score)\` | بالقيمة (int صغير) |
| \`void printTable(const vector<Student>&)\` | const& (قراءة فقط) |
| \`void printStats(const vector<Student>&)\` | const& |
| \`bool readStudent(Student&)\` | مرجع: تملأ بيانات المستدعي وترجع نجاح القراءة |

## الترتيب حسب حقل
\`\`\`cpp
struct Student { string name; int score; };
vector<Student> sorted = {{"سارة", 91}, {"عمر", 78}, {"ليلى", 85}};
sort(sorted.begin(), sorted.end(), [](const Student& a, const Student& b) {
    return a.score > b.score;
});
\`\`\`
التعبير \`[](...) { ... }\` دالة صغيرة بلا اسم (lambda) تحدد طريقة المقارنة. ستتعمق فيها في دورة C++ المتقدمة.

## الإدخال الآمن
\`readStudent\` تتحقق من نجاح \`cin\`، ومن أن الدرجة بين 0 و 100. إذا فشل الإدخال، يتوقف البرنامج عن طلب المزيد بدل الدوران.

## حالات يجب اختبارها
- قائمة فارغة (لا قسمة على صفر في المتوسط).
- درجة خارج المدى.
- إدخال حروف بدل الدرجة.

## أفكار للتوسعة
- عدة مواد لكل طالب (\`vector<int> scores\` داخل struct).
- البحث عن طالب بالاسم.
- حفظ البيانات في ملف (ستتعلم \`fstream\` في الدورة المتقدمة).

## بعد هذه الدورة
الدورة التالية "المؤشرات وإدارة الذاكرة" تشرح كيف تعمل الذاكرة فعلاً، وهي المهارة التي تميّز C++ عن معظم اللغات.
`,
      codeExample: md`
#include <algorithm>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Student {
    string name;
    int score;
};

string letterGrade(int score) {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Very good";
    if (score >= 50) return "Pass";
    return "Fail";
}

void printTable(const vector<Student>& students) {
    cout << left << setw(10) << "Name" << setw(7) << "Score" << "Grade" << endl;
    for (const Student& s : students) {
        cout << left << setw(10) << s.name << setw(7) << s.score << letterGrade(s.score) << endl;
    }
}

void printStats(const vector<Student>& students) {
    if (students.empty()) {
        cout << "No students yet" << endl;
        return;
    }
    int total = 0, passed = 0;
    int best = students[0].score, worst = students[0].score;
    for (const Student& s : students) {
        total += s.score;
        if (s.score >= 50) passed++;
        best = max(best, s.score);
        worst = min(worst, s.score);
    }
    cout << fixed << setprecision(1)
         << "Average: " << static_cast<double>(total) / students.size()
         << " | Best: " << best << " | Worst: " << worst
         << " | Passed: " << passed << "/" << students.size() << endl;
}

// تملأ student وترجع false إذا فشل الإدخال
bool readStudent(Student& student) {
    cout << "Name and score (e.g. Sara 82): ";
    if (!(cin >> student.name >> student.score)) return false;
    if (student.score < 0 || student.score > 100) {
        cout << "Score must be 0-100, skipped" << endl;
        student.score = -1;
    }
    return true;
}

int main() {
    vector<Student> students = {{"Mona", 95}, {"Ali", 47}, {"Zaid", 81}};

    Student s;
    for (int i = 0; i < 2 && readStudent(s); i++) {
        if (s.score >= 0) students.push_back(s);
    }

    printTable(students);
    printStats(students);

    vector<Student> ranked = students;
    sort(ranked.begin(), ranked.end(), [](const Student& a, const Student& b) {
        return a.score > b.score;
    });
    cout << "\nRanking:" << endl;
    for (size_t i = 0; i < ranked.size(); i++) {
        cout << i + 1 << ". " << ranked[i].name << " (" << ranked[i].score << ")" << endl;
    }
    return 0;
}
`,
      quiz: {
        question: 'لماذا تأخذ readStudent معاملها كمرجع Student& ؟',
        options: [
          'لأن struct لا يمكن تمريرها بالقيمة',
          'لكي تملأ بيانات المتغير الذي يملكه المستدعي',
          'لأن المراجع أسرع دائماً',
          'لكي تمنع تعديله',
        ],
        correctAnswer: 1,
        explanation: 'الدالة تكتب الاسم والدرجة في متغير المستدعي، وترجع bool لنجاح القراءة.',
      },
    },
  ],
};

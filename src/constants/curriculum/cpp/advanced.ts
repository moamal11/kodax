/**
 * منهج cpp-advanced — C++ المتقدم (Modern C++).
 *
 * كان: 10 دروس بشرح من 5–8 أسطر؛ STL Algorithms قبل Lambda رغم أن أمثلته تعتمد عليها؛
 * درس Type Traits و SFINAE بأسلوب ما قبل C++20 دون ذكر Concepts؛ لا درس لـ optional/variant/
 * structured bindings؛ مثال الاستثناءات ينقصه #include <vector> (لا يُترجم)؛ مثال الخيوط يجمع
 * 1..500000 في int فيفيض (سلوك غير معرّف ونتيجة خاطئة)؛ تعليق "Perfect Forwarding" على كود
 * ليس كذلك؛ قائمة المشروع التفاعلية لا تتحقق من فشل الإدخال ولا من صحة الأولوية.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';

export const CPP_ADVANCED_PLAN: CoursePlan = {
  courseId: 'cpp-advanced',
  course: {
    description:
      'C++ الحديثة: القوالب و Concepts، حاويات وخوارزميات STL مع Lambda، الاستثناءات وضمانات الأمان، دلالات النقل، optional و variant، الملفات، والخيوط والتزامن — مع مشروع متكامل.',
  },
  sections: [
    { title: 'البرمجة العامة', lessons: ['cpp-adv-13', 'cpp-adv-19'] },
    { title: 'مكتبة STL', lessons: ['cpp-advanced-stl-containers', 'cpp-adv-16', 'cpp-adv-15'] },
    { title: 'الأخطاء والموارد', lessons: ['cpp-adv-17', 'cpp-adv-18', 'cpp-advanced-modern'] },
    { title: 'الملفات والتزامن', lessons: ['cpp-adv-21', 'cpp-adv-20'] },
    { title: 'المشروع الختامي', lessons: ['cpp-adv-22'] },
  ],
  codeFixes: {
    'cpp-adv-17': [['#include <stdexcept>\n', '#include <stdexcept>\n#include <vector>\n']],
    'cpp-adv-18': [
      ['#include <utility>\n', '#include <utility>\n#include <algorithm>\n'],
      ['return MyVector(n);  // سيستخدم Move', 'return MyVector(n);  // C++17: حذف نسخ مضمون — يُبنى في مكانه'],
      ['MyVector v4 = createVector(500);  // Move أو RVO', 'MyVector v4 = createVector(500);  // لا نسخ ولا نقل (حذف النسخ المضمون)'],
      ['// ===== Perfect Forwarding =====', '// ===== التمرير بالقيمة ثم النقل (sink parameter) ====='],
    ],
    'cpp-adv-20': [
      ['int computeSum(int start, int end) {\n    int sum = 0;', 'long long computeSum(int start, int end) {\n    long long sum = 0;  // int يفيض: مجموع 1..500000 أكبر من 2^31'],
      ['unsafeCounter++;  // Race Condition!', 'unsafeCounter++;  // Race Condition! (سلوك غير معرّف — للعرض فقط)'],
    ],
    'cpp-adv-22': [
      ['        cin >> choice;\n        cin.ignore();', '        if (!(cin >> choice)) break;  // نهاية الإدخال أو إدخال غير رقمي\n        cin.ignore();'],
      [
        '                manager.addTask(title, desc, static_cast<Priority>(pri));',
        '                if (pri < 0 || pri > 3) { cout << "أولوية غير صالحة\\n"; break; }\n                manager.addTask(title, desc, static_cast<Priority>(pri));',
      ],
    ],
  },
  patches: {
    'cpp-adv-13': {
      description: 'اكتب كوداً واحداً يعمل مع أنواع كثيرة: قوالب الدوال والأصناف، استنتاج الأنواع، المعاملات غير النوعية، والتخصيص',
      content: md`
# القوالب (Templates)

كتبت \`maxInt\` و \`maxDouble\` و \`maxString\` بنفس المنطق؟ القالب يكتب المنطق **مرة واحدة**، والمترجم يولّد نسخة لكل نوع تستخدمه. هذا هو أساس STL كلها: \`vector<int>\` و \`vector<string>\` نسختان من قالب واحد.

## قالب دالة
\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

template <typename T>
T maximum(T a, T b) {
    return (a > b) ? a : b;
}

int main() {
    cout << maximum(3, 7) << '\n';                        // T = int (استنتاج)
    cout << maximum(2.5, 1.5) << '\n';                    // T = double
    cout << maximum(string("كود"), string("برمجة")) << '\n';
    cout << maximum<double>(3, 4.5) << '\n';              // T محدد صراحةً
}
\`\`\`
- \`typename\` و \`class\` داخل \`template<>\` متطابقتان.
- **الاستنتاج**: المترجم يستنتج T من المعاملات. \`maximum(3, 4.5)\` تفشل لأن T لا يمكن أن يكون int و double معاً — حددها صراحةً أو استخدم نوعين.

## نوعان ونوع إرجاع مستنتج
\`\`\`cpp
template <typename T, typename U>
auto add(T a, U b) {          // C++14: نوع الإرجاع يُستنتج من return
    return a + b;
}
// add(3, 2.5) → 5.5 (double)
\`\`\`
ستجد في الكود القديم الصيغة \`auto add(T a, U b) -> decltype(a + b)\` — نفس الفكرة قبل C++14.

## قالب صنف
\`\`\`cpp
#include <stdexcept>
#include <vector>
using namespace std;

template <typename T>
class Stack {
    vector<T> items;
public:
    void push(const T& item) { items.push_back(item); }
    T pop() {
        if (items.empty()) throw runtime_error("المكدس فارغ");   // الاستثناءات بالتفصيل لاحقاً
        T top = items.back();
        items.pop_back();
        return top;
    }
    bool empty() const { return items.empty(); }
};
// Stack<int> s; s.push(1);   Stack<string> names;
\`\`\`
منذ C++17 يستطيع المترجم أحياناً استنتاج معاملات قالب الصنف من المُنشئ (CTAD): \`vector v = {1, 2, 3};\` تعني \`vector<int>\`.

## معاملات غير نوعية
القالب يقبل **قيماً** ثابتة وقت الترجمة أيضاً:
\`\`\`cpp
#include <cstddef>

template <typename T, std::size_t N>
class FixedArray {
    T data[N] {};
public:
    constexpr std::size_t size() const { return N; }
    T& operator[](std::size_t i) { return data[i]; }
};
// FixedArray<int, 5> a;  — هكذا يعمل std::array<int, 5>
\`\`\`

## التخصيص (Specialization)
نسخة خاصة لنوع معين عندما يختلف السلوك:
\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

template <typename T>
void describe(const T& v) { cout << "قيمة: " << v << '\n'; }

template <>
void describe<bool>(const bool& v) { cout << "منطقي: " << (v ? "نعم" : "لا") << '\n'; }

int main() {
    describe(42);      // قيمة: 42
    describe(true);    // منطقي: نعم
}
\`\`\`

## أين يُكتب كود القالب؟
المترجم يحتاج **تعريف** القالب كاملاً عند كل استخدام ليولّد النسخة. لذلك تُكتب القوالب كاملة في ملفات الرأس (\`.h\`)، لا في \`.cpp\`. فصلها يعطي خطأ ربط \`undefined reference\`.

## رسائل الأخطاء
إذا استخدمت القالب مع نوع لا يدعم العملية (مثلاً \`maximum\` مع صنف بلا \`>\`)، يظهر الخطأ **داخل** القالب برسالة طويلة. الدرس التالي (Concepts) يحل هذه المشكلة بوضع شروط واضحة على T.

## تمرين
اكتب \`template <typename T> T sumAll(const vector<T>& v)\` يجمع العناصر، وجرّبه مع \`int\` و \`double\` و \`string\`. ماذا يحدث مع vector فارغ من string؟ (تلميح: ابدأ الجمع بـ \`T{}\`).
`,
      quiz: {
        question: 'لماذا تُكتب تعريفات القوالب عادةً كاملة في ملفات الرأس (.h)؟',
        options: [
          'لأن ملفات .cpp لا تدعم القوالب',
          'لأن المترجم يحتاج التعريف الكامل عند كل استخدام ليولّد نسخة للنوع المطلوب',
          'لتسريع التنفيذ',
          'لأنها أقصر',
        ],
        correctAnswer: 1,
        explanation: 'القالب ليس كوداً جاهزاً بل وصفة؛ المترجم يولّد النسخة عند الاستخدام، فيحتاج رؤية التعريف.',
      },
    },
    'cpp-adv-19': {
      title: 'Concepts و Type Traits',
      description: 'ضع شروطاً واضحة على معاملات القوالب (C++20 Concepts)، واسأل عن الأنواع وقت الترجمة بـ type traits و if constexpr',
      content: md`
# Concepts و Type Traits

القالب \`template <typename T>\` يقبل **أي** نوع، حتى الأنواع التي لا تعمل معه — والخطأ يظهر عميقاً داخل القالب برسالة من عشرات الأسطر. هذا الدرس يعلّمك كيف تسأل عن الأنواع وتضع لها شروطاً.

## Type Traits: أسئلة عن الأنواع وقت الترجمة
في \`<type_traits>\` قوالب تجيب عن أسئلة مثل "هل T عدد صحيح؟":
| السؤال | الأداة |
|---|---|
| عدد صحيح؟ | \`is_integral_v<T>\` |
| عدد عشري؟ | \`is_floating_point_v<T>\` |
| رقمي؟ | \`is_arithmetic_v<T>\` |
| مؤشر؟ | \`is_pointer_v<T>\` |
| نفس النوع؟ | \`is_same_v<T, U>\` |
| إزالة const و & | \`remove_cvref_t<T>\` (C++20) أو \`decay_t<T>\` |

\`\`\`cpp
#include <type_traits>
#include <string>

static_assert(std::is_integral_v<int>);
static_assert(!std::is_integral_v<double>);
static_assert(std::is_same_v<std::remove_cvref_t<const std::string&>, std::string>);
// static_assert تفحص وقت الترجمة: إن فشلت لا يُترجم البرنامج
\`\`\`

## if constexpr: فرع حسب النوع (C++17)
\`if\` العادية تترجم الفرعين. \`if constexpr\` تترجم الفرع المطابق **فقط**، فيمكن كتابة كود لا يصح إلا لأنواع معينة:
\`\`\`cpp
#include <iostream>
#include <string>
#include <type_traits>
using namespace std;

template <typename T>
string toText(const T& v) {
    if constexpr (is_same_v<T, string>) return "\"" + v + "\"";
    else if constexpr (is_arithmetic_v<T>) return to_string(v);
    else return "<?>";
}

int main() {
    cout << toText(string("Kodax")) << ' ' << toText(42) << '\n';   // "Kodax" 42
}
\`\`\`
بدون constexpr سيحاول المترجم ترجمة \`to_string(v)\` مع string ويفشل.

## Concepts (C++20): شروط بأسماء
**concept** شرط على نوع، يُكتب بدل \`typename\`:
\`\`\`cpp
#include <concepts>

template <std::integral T>          // T يجب أن يكون عدداً صحيحاً
T gcdOf(T a, T b) {
    while (b != 0) { T t = a % b; a = b; b = t; }
    return a;
}
// gcdOf(12, 18) → 6
// gcdOf(2.5, 1.0) → خطأ واضح: the constraint 'integral<double>' is not satisfied
\`\`\`
concepts قياسية مفيدة: \`integral\`، \`floating_point\`، \`same_as\`، \`convertible_to\`، \`derived_from\`، \`invocable\`، \`totally_ordered\`.

## كتابة concept بنفسك
\`requires\` تصف ما يجب أن يدعمه النوع:
\`\`\`cpp
#include <concepts>
#include <cstddef>

template <typename T>
concept HasSize = requires(const T& c) {
    { c.size() } -> std::convertible_to<std::size_t>;   // يجب أن تكون عنده size() تعيد رقماً
};

template <HasSize C>
std::size_t countOf(const C& c) { return c.size(); }
// countOf(std::vector<int>{1,2}) ✅    countOf(5) ❌ رسالة واضحة: int لا يحقق HasSize
\`\`\`

## أربع صيغ متكافئة
\`\`\`cpp
#include <concepts>

template <std::integral T> T twice1(T x) { return x * 2; }
template <typename T> requires std::integral<T> T twice2(T x) { return x * 2; }
template <typename T> T twice3(T x) requires std::integral<T> { return x * 2; }
auto twice4(std::integral auto x) { return x * 2; }      // الصيغة المختصرة
\`\`\`

## Concepts مقابل الوراثة
concept مثل "واجهة" لكن **وقت الترجمة**: أي نوع فيه \`area()\` يحقق \`Shape\` دون أن يرث من شيء، ولا تكلفة vtable. أما الوراثة الافتراضية فتسمح بخلط أنواع مختلفة في حاوية واحدة وقت التشغيل. لكل منهما مكانه.

## وماذا عن SFINAE و enable_if؟
قبل C++20 كانت الشروط تُكتب بحيلة تسمى SFINAE مع \`enable_if\` — صعبة القراءة. ستراها في مكتبات قديمة؛ لفهمها يكفي أن تعرف أنها تؤدي ما تؤديه concepts اليوم بشكل أوضح.

## تمرين
اكتب concept باسم \`Printable\` يتطلب أن يعمل \`std::cout << x\`، ثم دالة \`printAll(const vector<T>&)\` مقيدة به. جرّبها مع \`vector<int>\` ثم مع vector من صنف لا يدعم \`<<\` واقرأ الرسالة.
`,
      codeExample: `#include <iostream>
#include <string>
#include <vector>
#include <list>
#include <concepts>
#include <type_traits>
using namespace std;

// ===== 1) Type traits: أسئلة عن الأنواع وقت الترجمة =====
template <typename T>
void describe(const string& name) {
    cout << name << ": ";
    if constexpr (is_integral_v<T>) cout << "عدد صحيح";
    else if constexpr (is_floating_point_v<T>) cout << "عدد عشري";
    else if constexpr (is_pointer_v<T>) cout << "مؤشر";
    else cout << "نوع آخر";
    cout << " (sizeof = " << sizeof(T) << ")\\n";
}

// ===== 2) if constexpr: كود مختلف لكل نوع =====
template <typename T>
string toText(const T& value) {
    if constexpr (is_same_v<T, string>) return "\\"" + value + "\\"";
    else if constexpr (is_same_v<T, bool>) return value ? "true" : "false";
    else if constexpr (is_arithmetic_v<T>) return to_string(value);
    else return "<غير مدعوم>";
}

// ===== 3) concept قياسي =====
template <integral T>
T gcdOf(T a, T b) {
    while (b != 0) {
        T t = a % b;
        a = b;
        b = t;
    }
    return a;
}

// ===== 4) concepts مخصصة =====
template <typename T>
concept HasSize = requires(const T& c) {
    { c.size() } -> convertible_to<size_t>;
};

template <HasSize C>
void printSize(const C& c, const string& name) {
    cout << name << " يحتوي " << c.size() << " عناصر\\n";
}

template <typename T>
concept Shape = requires(const T& s) {
    { s.area() } -> convertible_to<double>;
    { s.name() } -> convertible_to<string>;
};

// لا وراثة: أي نوع يملك area() و name() يحقق Shape
struct Square {
    double side;
    double area() const { return side * side; }
    string name() const { return "مربع"; }
};

struct Circle {
    double r;
    double area() const { return 3.14159 * r * r; }
    string name() const { return "دائرة"; }
};

void report(const Shape auto& s) {   // الصيغة المختصرة
    cout << s.name() << ": " << s.area() << "\\n";
}

int main() {
    cout << "=== Type traits ===\\n";
    describe<int>("int");
    describe<double>("double");
    describe<const char*>("const char*");
    describe<string>("string");

    cout << "\\n=== if constexpr ===\\n";
    cout << toText(string("Kodax")) << " | " << toText(42) << " | " << toText(true) << "\\n";

    cout << "\\n=== concepts ===\\n";
    cout << "gcd(84, 36) = " << gcdOf(84, 36) << "\\n";
    cout << "gcd(10L, 4L) = " << gcdOf(10L, 4L) << "\\n";
    // gcdOf(2.5, 1.0);   // خطأ ترجمة: double لا يحقق integral

    printSize(vector<int>{1, 2, 3}, "vector");
    printSize(string("مرحبا"), "string (بايتات UTF-8)");
    printSize(list<double>{1.5, 2.5}, "list");
    // printSize(42, "int");   // خطأ ترجمة: int لا يحقق HasSize

    report(Square{3});
    report(Circle{1});

    static_assert(Shape<Square>);
    static_assert(!Shape<int>);
    cout << "\\nكل الشروط تحققت وقت الترجمة ✅\\n";
    return 0;
}`,
      quiz: {
        question: 'ما الميزة الأساسية لـ Concepts في C++20 مقارنة بالقوالب غير المقيدة؟',
        options: [
          'تجعل البرنامج أسرع وقت التشغيل',
          'تحدد شروطاً واضحة على الأنواع فتظهر رسالة خطأ مفهومة عند الاستدعاء بنوع غير مناسب',
          'تسمح بالوراثة المتعددة',
          'تلغي الحاجة إلى القوالب',
        ],
        correctAnswer: 1,
        explanation: 'المترجم يفحص الشرط عند الاستدعاء ويذكر أي شرط لم يتحقق، بدل خطأ عميق داخل القالب.',
      },
    },
    'cpp-advanced-stl-containers': {
      description: 'اختر الحاوية المناسبة: vector و deque و list و set و map و unordered_map و priority_queue — مع تكلفة كل عملية',
      content: md`
# حاويات STL

اختيار الحاوية الصحيحة قرار يؤثر في سرعة البرنامج ووضوحه. القاعدة الأولى: **ابدأ بـ vector** ما لم يكن لديك سبب واضح لغيرها.

## الحاويات التسلسلية
| الحاوية | الوصول بالفهرس | إضافة/حذف في النهاية | في البداية | في المنتصف |
|---|---|---|---|---|
| \`vector\` | O(1) | O(1) غالباً | O(n) | O(n) |
| \`deque\` | O(1) | O(1) | O(1) | O(n) |
| \`list\` | لا يوجد | O(1) | O(1) | O(1) إذا كان معك مكرِّر |
| \`array<T, N>\` | O(1) | حجم ثابت | — | — |

\`vector\` يخزن العناصر **متجاورة** في الذاكرة، والمعالج يحب ذلك (cache)؛ لذلك يتفوق عملياً على \`list\` حتى في حالات تبدو نظرياً لصالح list.

\`\`\`cpp
#include <deque>
#include <vector>
using namespace std;

vector<int> v = {1, 2, 3};
v.reserve(1000);          // احجز مسبقاً إن كنت تعرف الحجم: يمنع إعادة التخصيص المتكررة
v.push_back(4);
v.emplace_back(5);        // يبني العنصر في مكانه مباشرة

deque<int> d = {2, 3};
d.push_front(1);          // سريع في البداية والنهاية
\`\`\`

## الحاويات الترابطية (مرتبة)
\`set\` (قيم فريدة مرتبة) و \`map\` (مفتاح ← قيمة، مرتبة بالمفتاح). مبنية على شجرة متوازنة: البحث والإضافة والحذف O(log n).

## الحاويات غير المرتبة (Hash)
\`unordered_set\` و \`unordered_map\`: جدول تجزئة، العمليات O(1) في المتوسط، لكن بلا ترتيب.

| تحتاج | استخدم |
|---|---|
| عناصر بالترتيب + بحث | \`set\` / \`map\` |
| بحث أسرع ولا يهم الترتيب | \`unordered_set\` / \`unordered_map\` |
| أكبر/أصغر عنصر باستمرار | \`priority_queue\` |
| مكدس / طابور | \`stack\` / \`queue\` (محوّلات فوق deque) |

## فخ map::operator[]
\`\`\`cpp
#include <map>
#include <string>
using namespace std;

map<string, int> stock = {{"قلم", 10}};
int a = stock["دفتر"];            // ⚠️ يُنشئ "دفتر" بقيمة 0 إذا لم يوجد!
bool has = stock.contains("قلم"); // C++20: فحص بلا إنشاء
auto it = stock.find("ممحاة");    // find لا تُنشئ شيئاً
bool found = (it != stock.end());
\`\`\`
- \`[]\` للكتابة أو عندما تريد القيمة الافتراضية فعلاً.
- \`find\` أو \`contains\` للبحث فقط، و \`at\` ترمي استثناء إذا لم يوجد المفتاح.

## المرور على map بأسماء واضحة
\`\`\`cpp
#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> ages = {{"سارة", 21}, {"عمر", 25}};
    for (const auto& [name, age] : ages)          // structured bindings (C++17)
        cout << name << ": " << age << '\n';
}
\`\`\`

## المكرِّرات (Iterators)
المكرِّر "مؤشر معمَّم" يمر على أي حاوية بنفس الطريقة: \`begin()\` أول عنصر، و \`end()\` **بعد** آخر عنصر. لهذا تعمل خوارزميات STL مع كل الحاويات.

⚠️ **إبطال المكرِّرات**: إضافة عنصر إلى vector قد تنقل كل العناصر لمكان جديد، فتصبح المكرِّرات والمؤشرات والمراجع القديمة **معلّقة**. لا تحتفظ بمكرِّر بعد تعديل الـ vector.

## تمرين
اقرأ نصاً واحسب تكرار كل كلمة بـ \`unordered_map<string,int>\`، ثم انقل النتائج إلى vector من الأزواج ورتبها تنازلياً حسب العدد واطبع أكثر 3 كلمات.
`,
      codeExample: `#include <iostream>
#include <vector>
#include <deque>
#include <set>
#include <map>
#include <unordered_map>
#include <queue>
#include <sstream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    // ===== vector: الخيار الافتراضي =====
    vector<int> scores;
    scores.reserve(5);                 // حجز مسبق
    for (int s : {72, 95, 88, 60, 95}) scores.push_back(s);
    cout << "vector: الحجم " << scores.size() << "، السعة " << scores.capacity() << "\\n";

    // ===== deque: إضافة سريعة من الطرفين =====
    deque<string> line = {"سارة", "عمر"};
    line.push_front("مستعجل");
    line.push_back("ليلى");
    cout << "deque: أول " << line.front() << "، آخر " << line.back() << "\\n";

    // ===== set: فريد ومرتب =====
    set<int> unique(scores.begin(), scores.end());
    cout << "set: ";
    for (int s : unique) cout << s << ' ';            // 60 72 88 95
    cout << "\\n";

    // ===== map: مرتب بالمفتاح =====
    map<string, int> stock = {{"قلم", 10}, {"دفتر", 4}};
    stock["ممحاة"] += 3;                              // [] يُنشئ بقيمة 0 ثم يضيف
    if (auto it = stock.find("مسطرة"); it == stock.end())
        cout << "map: لا توجد مسطرة (find لم تُنشئ شيئاً)\\n";
    for (const auto& [item, qty] : stock) cout << "  " << item << " = " << qty << "\\n";

    // ===== unordered_map: عدّ الكلمات =====
    string text = "c++ سريعة و c++ قوية و c++ ممتعة";
    unordered_map<string, int> freq;
    istringstream in(text);
    for (string w; in >> w;) ++freq[w];

    vector<pair<string, int>> ranked(freq.begin(), freq.end());
    sort(ranked.begin(), ranked.end(), [](const auto& a, const auto& b) {
        return a.second != b.second ? a.second > b.second : a.first < b.first;
    });
    cout << "الأكثر تكراراً: " << ranked[0].first << " (" << ranked[0].second << ")\\n";

    // ===== priority_queue: الأكبر أولاً =====
    priority_queue<pair<int, string>> tasks;
    tasks.push({2, "مراجعة"});
    tasks.push({5, "إصلاح عاجل"});
    tasks.push({1, "توثيق"});
    cout << "ترتيب المهام: ";
    while (!tasks.empty()) {
        cout << tasks.top().second << " ← ";
        tasks.pop();
    }
    cout << "انتهى\\n";
    return 0;
}`,
      quiz: {
        question: 'ماذا يحدث عند قراءة stock["دفتر"] من map لا تحتوي المفتاح "دفتر"؟',
        options: ['يرمي استثناء', 'يُضاف المفتاح بقيمة افتراضية (0) ويُعاد', 'يعيد -1', 'خطأ ترجمة'],
        correctAnswer: 1,
        explanation: 'operator[] يُنشئ العنصر إن لم يوجد؛ للبحث فقط استخدم find أو contains، و at ترمي استثناء.',
      },
    },
    'cpp-adv-16': {
      description: 'الدوال المجهولة (lambda): الصيغة، الالتقاط بالقيمة والمرجع، mutable، lambda العامة، وتخزينها في std::function',
      content: md`
# تعبيرات Lambda

lambda دالة صغيرة **بلا اسم** تكتبها في مكان استخدامها. أكثر استخدام لها: تمرير سلوك إلى خوارزميات STL (الدرس التالي).

## الصيغة
\`\`\`text
[الالتقاط](المعاملات) -> نوع_الإرجاع { الجسم }
\`\`\`
نوع الإرجاع اختياري ويُستنتج غالباً.

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    auto square = [](int x) { return x * x; };
    cout << square(5) << '\n';            // 25

    auto greet = [] { cout << "مرحباً\n"; };   // بلا معاملات: الأقواس اختيارية
    greet();
}
\`\`\`

## الالتقاط (Capture)
الـ lambda لا ترى المتغيرات المحلية المحيطة بها إلا إذا **التقطتها**:
| الصيغة | المعنى |
|---|---|
| \`[]\` | لا شيء |
| \`[x]\` | x بالقيمة (نسخة وقت إنشاء الـ lambda) |
| \`[&x]\` | x بالمرجع (الأصل) |
| \`[=]\` | كل ما يُستخدم بالقيمة |
| \`[&]\` | كل ما يُستخدم بالمرجع |
| \`[this]\` | أعضاء الكائن الحالي |
| \`[y = x * 2]\` | متغير جديد مهيأ (C++14) |

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int bonus = 10;
    auto byValue = [bonus](int s) { return s + bonus; };
    auto byRef   = [&bonus](int s) { return s + bonus; };
    bonus = 50;
    cout << byValue(70) << '\n';   // 80  — النسخة التُقطت عندما كانت 10
    cout << byRef(70) << '\n';     // 120 — ترى القيمة الحالية
}
\`\`\`

### mutable
النسخ الملتقطة بالقيمة للقراءة فقط افتراضياً. \`mutable\` تسمح بتعديل **النسخة** (لا الأصل):
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int counter = 0;
    auto next = [counter]() mutable { return ++counter; };
    cout << next() << next() << next() << '\n';   // 123
    cout << counter << '\n';                       // 0 — الأصل لم يتغير
}
\`\`\`

## ⚠️ خطر: مرجع معلّق
الالتقاط بالمرجع لا يطيل عمر المتغير. إذا عاشت الـ lambda أطول منه (أُعيدت من دالة، أو خُزّنت، أو أُرسلت لخيط)، فالمرجع يشير إلى ذاكرة ميتة:
\`\`\`cpp
#include <functional>

std::function<int()> makeCounter() {
    int count = 0;
    // return [&count] { return ++count; };   // ❌ count يموت عند نهاية الدالة
    return [count]() mutable { return ++count; };   // ✅ نسخة تملكها الـ lambda
}
\`\`\`
القاعدة: \`[&]\` للاستخدام الفوري (مع خوارزمية مثلاً)، والقيمة لما يُخزَّن.

## lambda عامة
\`auto\` في المعاملات تجعلها تعمل مع أي نوع (مثل القالب):
\`\`\`cpp
auto add = [](auto a, auto b) { return a + b; };
// add(1, 2) → 3     add(1.5, 2.0) → 3.5
\`\`\`

## تخزين lambda
- \`auto f = [...]{...};\` — الأسرع؛ لكل lambda نوع فريد لا اسم له.
- \`std::function<int(int)>\` — حاوية لأي شيء قابل للاستدعاء بنفس التوقيع؛ مفيدة لتخزين lambdas مختلفة في vector أو كعضو في صنف، مع تكلفة بسيطة.

\`\`\`cpp
#include <functional>
#include <map>
#include <string>
using namespace std;

map<string, function<double(double, double)>> ops = {
    {"+", [](double a, double b) { return a + b; }},
    {"*", [](double a, double b) { return a * b; }},
};
// ops["*"](3, 4) → 12
\`\`\`

## تمرين
اكتب دالة \`makeMultiplier(int k)\` تعيد lambda تضرب أي عدد في k. أنشئ \`twice\` و \`triple\` وجرّبهما. لماذا يجب الالتقاط بالقيمة هنا؟
`,
      quiz: {
        question: 'int bonus = 10; auto f = [bonus](int s){ return s + bonus; }; bonus = 50; ماذا تعيد f(70)؟',
        options: ['120', '80', '70', 'خطأ ترجمة'],
        correctAnswer: 1,
        explanation: 'الالتقاط بالقيمة يأخذ نسخة لحظة إنشاء الـ lambda (10)، فلا يتأثر بتغيير bonus لاحقاً.',
      },
    },
    'cpp-adv-15': {
      description: 'استبدل الحلقات اليدوية بخوارزميات مسمّاة: البحث والعد والترتيب والتحويل والحذف (erase-remove) — ونسخ ranges في C++20',
      content: md`
# خوارزميات STL

بدلاً من كتابة حلقة لكل مهمة، توفر \`<algorithm>\` و \`<numeric>\` أكثر من 100 خوارزمية مختبرة ومسمّاة. الكود يصبح يصف **ماذا** تريد:
\`\`\`cpp
vector<int> v = {40, 85, 62, 97};
// حلقة يدوية: عليك قراءتها لتفهم أنها تعدّ
int c = 0; for (int x : v) if (x > 50) c++;
// خوارزمية: الاسم يقول كل شيء
auto c2 = count_if(v.begin(), v.end(), [](int x) { return x > 50; });
\`\`\`

## الفكرة: نطاق [begin, end)
كل خوارزمية تعمل على نطاق من مكرِّرين: الأول مشمول والثاني **غير مشمول**. لذلك تعمل مع vector و deque و array و list وحتى المصفوفات العادية.

## أهم الخوارزميات
| المهمة | الخوارزمية |
|---|---|
| بحث عن قيمة / شرط | \`find\` / \`find_if\` |
| هل يوجد/الكل/لا أحد | \`any_of\` / \`all_of\` / \`none_of\` |
| عدّ | \`count\` / \`count_if\` |
| ترتيب | \`sort\`، \`stable_sort\`، \`partial_sort\` |
| بحث ثنائي (في مرتّب) | \`binary_search\`، \`lower_bound\` |
| أكبر/أصغر | \`max_element\`، \`min_element\`، \`minmax_element\` |
| تحويل | \`transform\` |
| جمع/طي | \`accumulate\` (في \`<numeric>\`) |
| عكس / إزالة المكرر المتجاور | \`reverse\` / \`unique\` |

\`\`\`cpp
#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {40, 85, 62, 97, 55, 30};

    sort(v.begin(), v.end());                                    // 30 40 55 62 85 97
    bool anyFail = any_of(v.begin(), v.end(), [](int x) { return x < 50; });
    int total = accumulate(v.begin(), v.end(), 0);               // ابدأ بـ 0 (int)
    auto it = find_if(v.begin(), v.end(), [](int x) { return x > 60; });

    vector<int> curved(v.size());
    transform(v.begin(), v.end(), curved.begin(), [](int x) { return min(x + 5, 100); });

    cout << boolalpha << anyFail << ' ' << total << ' ' << *it << ' ' << curved.back() << '\n';
    // true 369 62 100
}
\`\`\`
⚠️ \`accumulate(v.begin(), v.end(), 0)\` مع أعداد عشرية يعطي ناتجاً **صحيحاً مقطوعاً** لأن النوع يُؤخذ من القيمة الابتدائية. استخدم \`0.0\`.

## الحذف: erase-remove
\`remove_if\` **لا تحذف** فعلاً؛ تنقل العناصر المحتفظ بها للأمام وتعيد مكرِّراً لبداية "البقايا". الحذف الحقيقي بـ \`erase\`:
\`\`\`cpp
#include <algorithm>
#include <vector>
using namespace std;

vector<int> nums = {1, 2, 3, 4, 5, 6};
// الطريقة الكلاسيكية:
// nums.erase(remove_if(nums.begin(), nums.end(), [](int x){ return x % 2 == 0; }), nums.end());
// C++20 — أبسط بكثير:
auto removed = erase_if(nums, [](int x) { return x % 2 == 0; });   // nums = {1, 3, 5}
\`\`\`

## الترتيب بمعيار مخصص
\`\`\`cpp
#include <algorithm>
#include <string>
#include <vector>
using namespace std;

struct Student { string name; int score; };
vector<Student> st = {{"سارة", 91}, {"عمر", 78}, {"ليلى", 91}};
// الأعلى درجة أولاً، وعند التساوي أبجدياً
// sort(st.begin(), st.end(), [](const Student& a, const Student& b) {
//     return a.score != b.score ? a.score > b.score : a.name < b.name;
// });
\`\`\`
المقارنة يجب أن تكون "أصغر تماماً" (strict): استخدام \`>=\` بدل \`>\` يكسر \`sort\` (سلوك غير معرّف).

## C++20 Ranges
نسخ أبسط تأخذ الحاوية مباشرة، وتدعم التركيب بـ \`|\`:
\`\`\`cpp
#include <algorithm>
#include <iostream>
#include <ranges>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {5, 3, 8, 1, 9, 2};
    ranges::sort(v);                                         // بدون begin/end
    for (int x : v | views::filter([](int x) { return x % 2 == 1; })
                   | views::transform([](int x) { return x * x; }))
        cout << x << ' ';                                    // 1 9 25 81
    cout << '\n';
}
\`\`\`
الـ views **كسولة**: لا تنشئ vector وسيطاً، بل تحسب كل عنصر عند الطلب.

## تمرين
لديك \`vector<int>\` لدرجات: احذف الدرجات غير الصالحة (خارج 0–100) بـ \`erase_if\`، ثم احسب المتوسط بـ \`accumulate\` و نسبة الناجحين (≥ 50) بـ \`count_if\`، واطبع أعلى 3 درجات بـ \`partial_sort\`.
`,
      quiz: {
        question: 'ماذا تفعل remove_if وحدها بالـ vector؟',
        options: [
          'تحذف العناصر المطابقة وتقلل الحجم',
          'تنقل العناصر المحتفظ بها للأمام وتعيد مكرِّراً لبداية البقايا دون تغيير الحجم — الحذف الفعلي بـ erase',
          'ترتب العناصر',
          'ترمي استثناء إذا لم تجد شيئاً',
        ],
        correctAnswer: 1,
        explanation: 'الخوارزميات لا تملك الحاوية فلا تستطيع تغيير حجمها؛ لذلك نستخدم erase-remove أو erase_if في C++20.',
      },
    },
    'cpp-adv-17': {
      description: 'الاستثناءات: throw و try و catch، التسلسل القياسي، الاستثناءات المخصصة، ضمانات الأمان، و noexcept',
      content: md`
# معالجة الاستثناءات (Exceptions)

الدالة التي تكتشف خطأ لا تستطيع إصلاحه (ملف غير موجود، مدخل غير صالح، ذاكرة نفدت) تحتاج طريقة لإبلاغ من يستطيع. الاستثناء **يقفز** من مكان الخطأ إلى أقرب \`catch\` مناسب، ويدمّر في الطريق كل الكائنات المحلية (هنا تظهر قيمة RAII).

## الأساسيات
\`\`\`cpp
#include <iostream>
#include <stdexcept>
using namespace std;

double divide(double a, double b) {
    if (b == 0) throw invalid_argument("القسمة على صفر");
    return a / b;
}

int main() {
    try {
        cout << divide(10, 2) << '\n';    // 5
        cout << divide(1, 0) << '\n';     // يرمي — هذا السطر لا يكمل
        cout << "لن يُطبع\n";
    } catch (const invalid_argument& e) {
        cout << "خطأ: " << e.what() << '\n';
    }
    cout << "البرنامج مستمر\n";
}
\`\`\`
**التقط دائماً بـ \`const&\`**: الالتقاط بالقيمة ينسخ ويقطّع (slicing) الاستثناءات المشتقة.

## التسلسل القياسي
\`\`\`text
exception
 ├── logic_error        (خطأ في منطق البرنامج — كان يمكن تجنبه)
 │    ├── invalid_argument
 │    ├── out_of_range      ← vector::at و string::at
 │    └── length_error
 ├── runtime_error      (خطأ لا يُعرف إلا وقت التشغيل)
 │    └── overflow_error ...
 └── bad_alloc          ← فشل new
\`\`\`
ترتيب \`catch\` مهم: من **الأخص** إلى **الأعم**. إذا وضعت \`catch (const exception&)\` أولاً فستلتقط كل شيء ولن تصل للأخص.

## استثناء مخصص
اشتق من نوع قياسي مناسب وأضف معلومات:
\`\`\`cpp
#include <stdexcept>
#include <string>
using namespace std;

class InsufficientFunds : public runtime_error {
public:
    double needed;
    explicit InsufficientFunds(double n)
        : runtime_error("رصيد غير كافٍ، ينقص " + to_string(n)), needed(n) {}
};
// throw InsufficientFunds(25.5);
\`\`\`

## إعادة الرمي و catch(...)
\`\`\`cpp
#include <iostream>
#include <stdexcept>
using namespace std;

void step() { throw runtime_error("فشل الاتصال"); }

int main() {
    try {
        try {
            step();
        } catch (const exception& e) {
            cout << "تسجيل: " << e.what() << '\n';
            throw;                       // يعيد رمي نفس الكائن الأصلي (لا تكتب throw e;)
        }
    } catch (...) {                      // يلتقط أي شيء — للمستوى الأعلى فقط
        cout << "خطأ عام\n";
    }
}
\`\`\`

## ضمانات الأمان (Exception Safety)
عند كتابة دالة اسأل: إذا رُمي استثناء في منتصفها، في أي حالة يبقى الكائن؟
| الضمان | المعنى |
|---|---|
| **لا رمي** (nothrow) | لا ترمي أبداً — المدمّرات، swap، دوال النقل |
| **قوي** (strong) | إما تنجح كلياً أو لا يتغير شيء (مثل copy-and-swap) |
| **أساسي** (basic) | لا تسرب، والكائن صالح لكن قد تغيرت قيمته |

RAII يمنحك الضمان الأساسي تقريباً مجاناً: لا \`new\` و \`delete\` يدويين = لا تسرب عند القفز.

## noexcept
\`void f() noexcept\` وعد بأن الدالة لا ترمي. إذا رمت رغم ذلك يُستدعى \`std::terminate\` وينتهي البرنامج. أهم استخدام: **مُنشئ النقل** — \`vector\` لا ينقل العناصر عند التوسّع إلا إذا كان النقل noexcept، وإلا ينسخها ليحافظ على الضمان القوي.

## متى لا تستخدم الاستثناءات؟
- للحالات **المتوقعة** في التدفق الطبيعي (المستخدم لم يجد نتيجة بحث): أعد \`optional\` أو \`bool\` (درس أدوات C++ الحديثة).
- **لا ترمِ من المدمّر** أبداً.
- الاستثناءات للأخطاء **الاستثنائية** التي لا تستطيع الدالة الحالية التعامل معها.

## تمرين
اكتب \`int parsePositive(const string& s)\` تستخدم \`stoi\` (التي ترمي \`invalid_argument\` و \`out_of_range\`) وترمي \`invalid_argument\` خاصاً بك إذا كان العدد ≤ 0. في main التقط كل نوع برسالة مختلفة، وجرّب: "42"، "abc"، "-5"، "99999999999".
`,
      quiz: {
        question: 'لماذا نلتقط الاستثناءات بـ const& وليس بالقيمة؟',
        options: [
          'لأن الالتقاط بالقيمة غير مسموح',
          'لتجنب النسخ والتقطيع (slicing) الذي يفقد معلومات الاستثناء المشتق',
          'لأن const& أسرع في الرمي',
          'لا فرق بينهما',
        ],
        correctAnswer: 1,
        explanation: 'catch (exception e) ينسخ جزء الأب فقط؛ what() المُعاد تعريفها في الابن قد تضيع.',
      },
    },
    'cpp-adv-18': {
      description: 'دلالات النقل: lvalue و rvalue، المراجع &&، std::move، متى يحدث النقل، حذف النسخ، ومعاملات "خذ بالقيمة ثم انقل"',
      content: md`
# دلالات النقل (Move Semantics)

تعلمت في دورة OOP قاعدة الخمسة. الآن نفهم **لماذا** وُجد النقل وكيف تستفيد منه دون كتابة دوال نقل بنفسك غالباً.

## المشكلة
\`\`\`cpp
#include <string>
#include <vector>
using namespace std;

vector<string> loadNames() { return vector<string>(1000000, "اسم"); }   // مليون نص
vector<string> names = loadNames();  // قبل C++11: كان هذا قد ينسخ مليون نص!
\`\`\`
الكائن المؤقت العائد سيموت فوراً بعد السطر، فنسخه هدر. الأذكى: **سرقة** ذاكرته الداخلية (نقل مؤشر واحد).

## lvalue و rvalue (مبسّطاً)
- **lvalue**: شيء له اسم وعنوان ويعيش بعد التعبير: \`x\`، \`names\`، \`v[0]\`.
- **rvalue**: قيمة مؤقتة بلا اسم ستختفي: \`42\`، \`x + 1\`، \`loadNames()\`.

المرجع \`T&&\` يرتبط بالـ rvalues فقط. لذلك يختار المترجم:
\`\`\`cpp
#include <string>
using std::string;

void take(const string& s);   // للـ lvalues: انسخ إن احتجت
void take(string&& s);        // للمؤقتات: يمكنك سرقة محتواها
\`\`\`

## std::move لا تنقل شيئاً!
\`std::move(x)\` مجرد **تحويل نوع**: "عامل x كأنه مؤقت، أنا لن أحتاجه". النقل الفعلي يحدث عندما يستقبله مُنشئ نقل أو إسناد نقل.
\`\`\`cpp
#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;

int main() {
    string a = "نص طويل جداً لا نريد نسخه";
    string b = move(a);           // نقل: b أخذت الذاكرة
    cout << "b = " << b << '\n';
    cout << "a بعد النقل: '" << a << "'\n";   // صالح لكن غير محدد القيمة (عملياً فارغ)

    vector<string> list;
    string item = "عنصر";
    list.push_back(move(item));   // ينقل بدلاً من النسخ
}
\`\`\`
**بعد النقل** الكائن المصدر في حالة "صالحة لكن غير محددة": يمكنك تدميره أو إسناد قيمة جديدة له، **لا** تعتمد على محتواه.

## متى يحدث النقل تلقائياً؟
1. من الكائنات المؤقتة: \`v.push_back(string("x"))\`.
2. عند \`return\` لمتغير محلي (إن لم يحدث حذف النسخ).
3. بعد \`std::move\` صريحة.

## حذف النسخ (Copy Elision)
\`\`\`cpp
#include <vector>

std::vector<int> make() {
    return std::vector<int>(1000);   // C++17: مضمون — يُبنى مباشرة في مكان المستقبل
}
std::vector<int> make2() {
    std::vector<int> v(1000);
    return v;                        // NRVO غالباً، وإلا نقل تلقائي
    // return std::move(v);          ← ❌ لا تفعل: يمنع NRVO
}
\`\`\`
أعد الكائنات **بالقيمة** بلا خوف؛ لا تكتب \`return std::move(local)\`.

## معاملات "خذ بالقيمة ثم انقل"
عندما تريد الدالة **الاحتفاظ** بنسخة من المعامل (مثل مُنشئ يخزنه):
\`\`\`cpp
#include <string>
#include <utility>
using namespace std;

class User {
    string name;
public:
    explicit User(string n) : name(move(n)) {}   // نسخة واحدة للـ lvalue، صفر نسخ للمؤقت
};
// string s = "سارة"; User a(s);         ← نسخة واحدة (s تبقى سليمة)
// User b(string("عمر"));                ← لا نسخ أبداً: نقلتان رخيصتان
\`\`\`

## noexcept مهم هنا
دوال النقل يجب أن تكون \`noexcept\`. عند توسّع vector، إن كان مُنشئ النقل قد يرمي، يفضّل vector **النسخ** للحفاظ على الضمان القوي — فتخسر الفائدة كلها.

## ملخص عملي
- استخدم أنواع المكتبة القياسية (Rule of Zero) — كلها تدعم النقل.
- \`std::move\` عند تمرير شيء لن تستخدمه بعد الآن.
- أعد بالقيمة.
- اكتب دوال النقل بنفسك فقط في الأصناف منخفضة المستوى التي تدير موارد، واجعلها \`noexcept\`.

## تمرين
شغّل المثال الكامل وعدّ كم مرة طُبع "Copy" وكم مرة "Move". ثم أزل \`noexcept\` من مُنشئ النقل في MyVector وأضف \`vector<MyVector> all; for (int i = 0; i < 4; i++) all.emplace_back(10);\` — ماذا تغيّر في الرسائل أثناء توسّع الـ vector؟
`,
      quiz: {
        question: 'ماذا تفعل std::move(x) بالضبط؟',
        options: [
          'تنقل محتوى x إلى مكان جديد في الذاكرة',
          'تحوّل x إلى rvalue فقط، فيصبح مؤهلاً لأن يستقبله مُنشئ/إسناد نقل',
          'تحذف x',
          'تنسخ x بسرعة',
        ],
        correctAnswer: 1,
        explanation: 'std::move مجرد تحويل نوع (cast)؛ النقل الفعلي يحدث في مُنشئ النقل أو إسناد النقل.',
      },
    },
    'cpp-adv-21': {
      description: 'قراءة الملفات وكتابتها: ifstream و ofstream، أوضاع الفتح، القراءة الصحيحة سطراً بسطر، تحليل CSV، والملفات الثنائية',
      content: md`
# الملفات (File I/O)

الملفات في C++ **تدفقات (streams)** مثل \`cin\` و \`cout\` تماماً: نفس \`<<\` و \`>>\` و \`getline\`. وهي تطبق RAII: الملف يُغلق تلقائياً عند خروج الكائن من النطاق.

| الصنف | الاستخدام |
|---|---|
| \`ofstream\` | كتابة |
| \`ifstream\` | قراءة |
| \`fstream\` | قراءة وكتابة |
| \`stringstream\` | تدفق داخل نص (مفيد للتحليل) |

## الكتابة
\`\`\`cpp
#include <fstream>
#include <iostream>
using namespace std;

int main() {
    ofstream out("notes.txt");            // يُنشئ الملف أو يفرّغه
    if (!out) {                           // افحص دائماً
        cerr << "تعذر فتح الملف\n";
        return 1;
    }
    out << "السطر الأول\n";
    out << "الدرجة: " << 95 << '\n';
}                                         // يُغلق تلقائياً هنا
\`\`\`

## أوضاع الفتح
| الوضع | المعنى |
|---|---|
| \`ios::out\` | كتابة (الافتراضي لـ ofstream) — **يفرّغ** الملف |
| \`ios::app\` | إضافة إلى النهاية دون حذف |
| \`ios::in\` | قراءة |
| \`ios::binary\` | ثنائي: بلا تحويل لرموز نهاية السطر |
| \`ios::trunc\` | تفريغ صريح |

\`ofstream log("app.log", ios::app);\` — لملفات السجل.

## القراءة الصحيحة
\`\`\`cpp
#include <fstream>
#include <iostream>
#include <string>
using namespace std;

int main() {
    { ofstream("notes.txt") << "السطر الأول\nالسطر الثاني\n"; }   // ملف تجريبي للقراءة
    ifstream in("notes.txt");
    if (!in) { cerr << "الملف غير موجود\n"; return 1; }
    string line;
    int n = 0;
    while (getline(in, line)) {           // ✅ الشرط هو نجاح القراءة نفسها
        cout << ++n << ": " << line << '\n';
    }
}
\`\`\`
⚠️ **لا تكتب** \`while (!in.eof())\`: \`eof\` لا تصبح true إلا **بعد** فشل محاولة قراءة، فتعالج السطر الأخير مرتين أو سطراً فارغاً. اجعل القراءة هي الشرط دائماً.

## تحليل CSV بـ stringstream
\`\`\`cpp
#include <sstream>
#include <string>
#include <vector>
using namespace std;

struct Row { string name; int score; };

bool parseRow(const string& line, Row& out) {
    stringstream ss(line);
    string scoreText;
    if (!getline(ss, out.name, ',') || !getline(ss, scoreText)) return false;
    try { out.score = stoi(scoreText); } catch (...) { return false; }
    return true;
}
// parseRow("سارة,91", r) → true, r.name == "سارة", r.score == 91
\`\`\`
\`getline(ss, field, ',')\` تقرأ حتى الفاصلة. (CSV الحقيقي قد يحتوي فواصل داخل علامات تنصيص — للمشاريع الجادة استخدم مكتبة.)

## الملفات الثنائية
تكتب البايتات كما هي في الذاكرة: أسرع وأصغر، لكنها غير مقروءة للإنسان وغير محمولة بين الأنظمة المختلفة (حجم الأنواع وترتيب البايتات). مناسبة لأنواع بسيطة مثل مصفوفات الأعداد:
\`\`\`cpp
#include <fstream>
#include <vector>
using namespace std;

void saveInts(const vector<int>& v) {
    ofstream out("data.bin", ios::binary);
    out.write(reinterpret_cast<const char*>(v.data()), v.size() * sizeof(int));
}
\`\`\`
لا تكتب صنفاً فيه \`string\` أو مؤشرات بهذه الطريقة — ستكتب **عناوين** لا المحتوى.

## std::filesystem (C++17)
للتعامل مع الملفات نفسها لا محتواها:
\`\`\`cpp
#include <filesystem>
#include <iostream>
namespace fs = std::filesystem;

void info(const fs::path& p) {
    if (fs::exists(p)) std::cout << p << " الحجم: " << fs::file_size(p) << " بايت\n";
    // أيضاً: fs::create_directories، fs::remove، fs::directory_iterator
}
\`\`\`

## تمرين
اكتب برنامج "دفتر درجات": يقرأ \`grades.csv\` (اسم,درجة)، يتجاهل الأسطر غير الصالحة مع طباعة رقمها، ويكتب \`report.txt\` فيه المتوسط وأعلى طالب. أضف سطراً في \`log.txt\` بوضع الإضافة عند كل تشغيل.
`,
      quiz: {
        question: 'لماذا يُعدّ while (!file.eof()) أسلوب قراءة خاطئاً؟',
        options: [
          'لأنه بطيء',
          'لأن eof لا تصبح true إلا بعد فشل قراءة، فيُعالَج آخر سطر مرتين أو سطر فارغ',
          'لأن eof غير موجودة في C++',
          'لأنه يحذف محتوى الملف',
        ],
        correctAnswer: 1,
        explanation: 'الصحيح أن تكون عملية القراءة نفسها هي الشرط: while (getline(file, line)).',
      },
    },
    'cpp-adv-20': {
      description: 'الخيوط والتزامن: std::thread و jthread، سباق البيانات، mutex و lock_guard، atomic، async و future',
      content: md`
# الخيوط والتزامن (Multithreading)

المعالجات الحديثة فيها عدة أنوية. **الخيط (thread)** مسار تنفيذ مستقل داخل البرنامج؛ عدة خيوط تعمل معاً تستغل الأنوية. لكن الخيوط **تتشارك الذاكرة**، وهذا مصدر أصعب الأخطاء في البرمجة.

## إنشاء خيط
\`\`\`cpp
#include <iostream>
#include <thread>
using namespace std;

void work(int id) { cout << "خيط " << id << '\n'; }

int main() {
    thread t1(work, 1);
    thread t2([] { cout << "خيط lambda\n"; });
    t1.join();            // انتظر انتهاءه
    t2.join();
}
\`\`\`
- **يجب** استدعاء \`join()\` (انتظار) أو \`detach()\` (فصل) قبل تدمير كائن thread، وإلا يُستدعى \`std::terminate\`.
- ترتيب الطباعة بين الخيوط **غير محدد**: قد يتغير كل تشغيل.

### jthread (C++20) — RAII للخيوط
\`std::jthread\` يستدعي \`join()\` تلقائياً في مدمّره، فلا تنسى:
\`\`\`cpp
#include <thread>
#include <vector>

void runAll() {
    std::vector<std::jthread> workers;
    for (int i = 0; i < 4; i++)
        workers.emplace_back([i] { /* عمل */ });
}   // كل الخيوط تُنتظر هنا تلقائياً
\`\`\`

## سباق البيانات (Data Race)
خيطان يعدّلان نفس المتغير بلا تزامن = **سلوك غير معرّف**. \`counter++\` ليست عملية واحدة بل ثلاث (قراءة، زيادة، كتابة)، فتضيع زيادات:
\`\`\`text
الخيط A: يقرأ 5         الخيط B: يقرأ 5
الخيط A: يكتب 6         الخيط B: يكتب 6     ← زيادتان، والنتيجة 6!
\`\`\`
المثال الكامل يعرض هذا للتعليم فقط؛ في كود حقيقي هو خطأ وليس "نتيجة تقريبية".

## الحل 1: mutex
\`\`\`cpp
#include <mutex>

std::mutex m;
int counter = 0;

void safeAdd(int times) {
    for (int i = 0; i < times; i++) {
        std::lock_guard<std::mutex> lock(m);   // يقفل هنا (RAII)
        ++counter;
    }                                          // يفتح تلقائياً عند نهاية كل دورة
}
\`\`\`
لا تستدعِ \`m.lock()\` و \`m.unlock()\` يدوياً: استثناء في المنتصف يترك القفل مغلقاً للأبد. استخدم \`lock_guard\` أو \`scoped_lock\` (يقفل عدة mutex معاً دون جمود).

## الحل 2: atomic
للعدادات والأعلام البسيطة، \`std::atomic\` أسرع من mutex:
\`\`\`cpp
#include <atomic>

std::atomic<int> hits{0};
void hit() { hits++; }        // عملية واحدة غير قابلة للتجزئة
\`\`\`

## الجمود (Deadlock)
خيط A يقفل m1 وينتظر m2، وخيط B يقفل m2 وينتظر m1 ← كلاهما ينتظر للأبد. الوقاية: اقفل دائماً بنفس الترتيب، أو استخدم \`scoped_lock lock(m1, m2);\`.

## async و future: نتائج من خيوط
عندما تريد **قيمة** من حساب متوازٍ، \`async\` أبسط من thread:
\`\`\`cpp
#include <future>
#include <iostream>
using namespace std;

long long sumRange(long long a, long long b) {
    long long s = 0;
    for (long long i = a; i <= b; i++) s += i;
    return s;
}

int main() {
    auto first = async(launch::async, sumRange, 1, 500000);
    auto second = async(launch::async, sumRange, 500001, 1000000);
    cout << first.get() + second.get() << '\n';   // 500000500000
}
\`\`\`
\`get()\` تنتظر النتيجة، وإن رمى الخيط استثناء فإن \`get()\` تعيد رميه في الخيط المستدعي. لاحظ \`long long\`: المجموع أكبر من حد int.

## نصائح
- أقل مشاركة = أقل مشاكل: أعطِ كل خيط بياناته الخاصة واجمع النتائج في النهاية.
- لا تُنشئ خيطاً لكل مهمة صغيرة؛ إنشاء الخيط مكلف. عدد الأنوية: \`thread::hardware_concurrency()\`.
- أدوات اكتشاف السباقات: \`-fsanitize=thread\` مع g++/clang.

## تمرين
قسّم vector من 10 ملايين عدد على 4 أجزاء، واحسب مجموع كل جزء بـ \`async\`، ثم اجمع النتائج. قارن الزمن مع الحساب في خيط واحد باستخدام \`chrono::steady_clock\`.
`,
      quiz: {
        question: 'لماذا تعطي العملية counter++ من عدة خيوط بلا حماية نتيجة خاطئة؟',
        options: [
          'لأن الخيوط أبطأ',
          'لأنها قراءة ثم زيادة ثم كتابة؛ تتداخل الخيوط فتضيع زيادات، وهذا سباق بيانات (سلوك غير معرّف)',
          'لأن int لا يعمل مع الخيوط',
          'لأن join لم تُستدعَ',
        ],
        correctAnswer: 1,
        explanation: 'الحل: mutex مع lock_guard، أو std::atomic للعدادات البسيطة.',
      },
    },
    'cpp-adv-22': {
      description: 'مشروع ختامي: مدير مهام يجمع enum class و الأصناف و unique_ptr و الخوارزميات و lambda والملفات',
      content: md`
# مشروع: نظام إدارة المهام

مشروع يجمع أدوات الدورة في برنامج سطر أوامر متكامل. اقرأ الكود الكامل في قسم المثال، ثم استخدم هذا الشرح كدليل.

## المتطلبات
- إضافة المهام وحذفها وتحديث حالتها.
- البحث بكلمة، والعرض حسب الحالة.
- إحصائيات.
- حفظ المهام في ملف وتحميلها عند التشغيل.

## أين استُخدم كل درس؟
| الجزء | المفهوم |
|---|---|
| \`enum class Priority/Status\` | أنواع آمنة بدل الأرقام السحرية |
| \`Task\` و \`TaskManager\` | التغليف: المدير وحده يعدّل القائمة |
| \`vector<unique_ptr<Task>>\` | الملكية الواضحة و RAII — لا delete يدوي |
| \`find_if\`، \`count_if\`، \`sort\` | خوارزميات STL بدل الحلقات |
| lambdas | معايير البحث والترتيب |
| \`ofstream\` / \`ifstream\` + \`stringstream\` | الحفظ والتحميل وتحليل الأسطر |

## الإدخال الآمن في القائمة
حلقة القائمة تتوقف إذا فشلت قراءة الرقم (\`if (!(cin >> choice)) break;\`)، وتُرفض الأولوية خارج 0–3 قبل تحويلها بـ \`static_cast\`. بدون هذا الفحص، إدخال نص بدل رقم أو أولوية مثل 7 ينتج قيمة enum غير صالحة.

## تصميم صيغة الملف
كل مهمة سطر واحد بحقول مفصولة بفاصل. اسأل نفسك: ماذا لو احتوى العنوان على الفاصل نفسه؟ (حلول: اختيار فاصل نادر مثل \`|\`، أو "هروب" الفاصل، أو صيغة JSON مع مكتبة).

## مراجعة ذاتية
- لماذا \`unique_ptr\` وليس \`shared_ptr\`؟ (من يملك المهمة؟)
- أي دالة في TaskManager يجب أن تكون \`const\`؟ تحقق من الكود.
- ماذا يحدث للمهام في الذاكرة عند الخروج من البرنامج؟ ولماذا لا تحتاج مدمّراً مكتوباً؟

## تحسينات مقترحة (تمارين)
1. **تواريخ الاستحقاق**: أضف تاريخاً لكل مهمة (\`std::chrono::year_month_day\` في C++20) واعرض المتأخرة.
2. **الاستثناءات**: اجعل \`updateStatus\` ترمي \`out_of_range\` لمعرف غير موجود والتقطها في القائمة.
3. **optional**: اجعل دالة \`findTask(int id)\` تعيد \`Task*\` أو \`optional\` وناقش الفرق.
4. **التصنيفات**: \`map<string, vector<int>>\` من التصنيف إلى معرفات المهام.
5. **حفظ تلقائي في خيط**: احفظ كل دقيقة في خيط خلفي مع \`mutex\` يحمي القائمة — وفكّر بكل نقطة يمكن أن يحدث فيها سباق.

بإكمال هذه الدورة تكون قد غطيت C++ الحديثة الأساسية. الخطوة التالية: بناء مشروع حقيقي بنظام بناء (CMake)، وكتابة اختبارات (GoogleTest أو Catch2)، والتعرّف على أدوات مثل \`-fsanitize=address\`.
`,
    },
  },
  newLessons: [
    {
      id: 'cpp-advanced-modern',
      title: 'أدوات C++ الحديثة: optional و variant و string_view',
      description: 'قيم قد تكون غائبة (optional)، قيمة من عدة أنواع (variant و visit)، structured bindings، و string_view للنصوص بلا نسخ',
      language: 'cpp',
      xpReward: 70,
      content: md`
# أدوات C++ الحديثة

أضافت C++17 أنواعاً صغيرة تحل مشاكل يومية كانت تُحل بحيل مثل "أعد -1 عند الفشل" أو \`union\` خطيرة. هذا الدرس يعرض أهمها.

## std::optional: قيمة قد لا توجد
كيف تعيد دالة البحث "لم أجد"؟ إرجاع \`-1\` يخلط القيمة بالخطأ (ماذا لو كانت -1 قيمة صالحة؟)، ورمي استثناء مبالغة لحالة متوقعة. \`optional<T>\` إما يحمل T أو **لا شيء**:
\`\`\`cpp
#include <iostream>
#include <optional>
#include <string>
#include <vector>
using namespace std;

optional<int> findIndex(const vector<string>& v, const string& target) {
    for (size_t i = 0; i < v.size(); i++)
        if (v[i] == target) return static_cast<int>(i);
    return nullopt;                         // "لا شيء"
}

int main() {
    vector<string> names = {"سارة", "عمر"};
    if (auto idx = findIndex(names, "عمر"))  // optional يُقيَّم كـ bool
        cout << "وُجد في " << *idx << '\n';
    cout << findIndex(names, "زيد").value_or(-1) << '\n';   // -1
}
\`\`\`
| العملية | المعنى |
|---|---|
| \`if (opt)\` / \`opt.has_value()\` | هل توجد قيمة؟ |
| \`*opt\` | القيمة (سلوك غير معرّف إن كانت فارغة) |
| \`opt.value()\` | القيمة أو يرمي \`bad_optional_access\` |
| \`opt.value_or(x)\` | القيمة أو x |

## structured bindings: تفكيك بأسماء
\`\`\`cpp
#include <map>
#include <string>
#include <tuple>
using namespace std;

tuple<int, int, double> stats() { return {3, 97, 81.5}; }

void demo() {
    auto [count, best, avg] = stats();               // ثلاثة أسماء دفعة واحدة
    map<string, int> m = {{"أ", 1}};
    for (const auto& [key, value] : m) { /* ... */ }
    if (auto [it, inserted] = m.insert({"ب", 2}); inserted) { /* أُضيف */ }
}
\`\`\`
لاحظ \`if (init; condition)\` — تعريف متغير يعيش داخل الشرط فقط (C++17).

## std::variant: واحد من عدة أنواع
\`variant<int, string>\` يحمل **إما** int **أو** string، ويعرف أيهما — بديل آمن لـ union:
\`\`\`cpp
#include <iostream>
#include <string>
#include <variant>
using namespace std;

int main() {
    variant<int, string> v = 42;
    cout << get<int>(v) << '\n';
    v = string("نص");
    cout << boolalpha << holds_alternative<string>(v) << '\n';   // true
    if (auto p = get_if<int>(&v)) cout << *p;                     // لا يُطبع: ليست int الآن
    // get<int>(v) هنا يرمي bad_variant_access
}
\`\`\`

### visit: التعامل مع كل الاحتمالات
\`std::visit\` تستدعي دالة بالنوع الموجود فعلاً. مع lambda عامة و \`if constexpr\`:
\`\`\`cpp
#include <type_traits>
#include <variant>

struct Circle { double r; };
struct Rect { double w, h; };
using Shape = std::variant<Circle, Rect>;

double area(const Shape& s) {
    return std::visit([](const auto& sh) -> double {
        using T = std::decay_t<decltype(sh)>;
        if constexpr (std::is_same_v<T, Circle>) return 3.14159 * sh.r * sh.r;
        else return sh.w * sh.h;
    }, s);
}
\`\`\`
**variant مقابل الوراثة**: variant مناسب عندما تكون الأنواع **معروفة ومغلقة** (لا يضيف أحد أنواعاً جديدة) — بلا مؤشرات ولا heap ولا virtual. الوراثة مناسبة عندما تريد أن يضيف الآخرون أنواعاً جديدة.

## std::string_view: نص بلا نسخ
\`const string&\` تجبر المستدعي على امتلاك \`std::string\`؛ تمرير \`"نص حرفي"\` يُنشئ string مؤقتاً. \`string_view\` "نافذة" على نص موجود (مؤشر + طول) تقبل أي نوع نص بلا نسخ:
\`\`\`cpp
#include <string_view>

std::size_t countSpaces(std::string_view text) {
    std::size_t n = 0;
    for (char c : text) if (c == ' ') ++n;
    return n;
}
// countSpaces("a b c")، countSpaces(myString)، countSpaces(myString.substr(2)) — كلها تعمل
\`\`\`
⚠️ string_view **لا تملك** النص. لا تُعِدها من دالة تشير إلى string محلي، ولا تخزنها بعد موت النص الأصلي:
\`\`\`cpp
#include <string>
#include <string_view>

std::string_view bad() {
    std::string local = "مؤقت";
    return local;          // ❌ مرجع معلّق: local يموت هنا
}
\`\`\`
استخدمها **للمعاملات** للقراءة فقط، وخزّن \`std::string\` في الأعضاء.

## ملخص
| تحتاج | استخدم |
|---|---|
| قيمة قد تغيب | \`optional<T>\` |
| قيمة من مجموعة أنواع ثابتة | \`variant<A, B, C>\` + \`visit\` |
| إرجاع عدة قيم بأسماء | struct أو \`tuple\` + structured bindings |
| معامل نصي للقراءة فقط | \`string_view\` |

## تمرين
اكتب \`optional<int> parseAge(string_view text)\` تعيد العمر إذا كان النص أرقاماً بين 0 و 150 فقط. ثم عرّف \`using Token = variant<int, string>;\` وقسّم جملة إلى tokens (أرقام ونصوص) واطبع كل token بنوعه باستخدام \`visit\`.
`,
      codeExample: `#include <iostream>
#include <map>
#include <optional>
#include <string>
#include <string_view>
#include <type_traits>
#include <variant>
#include <vector>
using namespace std;

// ===== optional: نتيجة قد تغيب =====
optional<int> parseAge(string_view text) {
    if (text.empty() || text.size() > 3) return nullopt;
    int value = 0;
    for (char c : text) {
        if (c < '0' || c > '9') return nullopt;
        value = value * 10 + (c - '0');
    }
    if (value > 150) return nullopt;
    return value;
}

// ===== variant: قيمة من أنواع محددة =====
struct Circle { double r; };
struct Rect { double w, h; };
struct Triangle { double base, height; };
using Shape = variant<Circle, Rect, Triangle>;

double area(const Shape& s) {
    return visit([](const auto& sh) -> double {
        using T = decay_t<decltype(sh)>;
        if constexpr (is_same_v<T, Circle>) return 3.14159 * sh.r * sh.r;
        else if constexpr (is_same_v<T, Rect>) return sh.w * sh.h;
        else return 0.5 * sh.base * sh.height;
    }, s);
}

string shapeName(const Shape& s) {
    switch (s.index()) {          // رقم النوع الحالي حسب ترتيبه في variant
        case 0: return "دائرة";
        case 1: return "مستطيل";
        default: return "مثلث";
    }
}

// ===== string_view: قراءة نص بلا نسخ =====
size_t countWords(string_view text) {
    size_t words = 0;
    bool inWord = false;
    for (char c : text) {
        if (c == ' ') inWord = false;
        else if (!inWord) { inWord = true; ++words; }
    }
    return words;
}

int main() {
    cout << "=== optional ===\\n";
    for (string_view input : {"25", "abc", "200", "7"}) {
        auto age = parseAge(input);
        cout << input << " → " << (age ? to_string(*age) : string("غير صالح")) << "\\n";
    }
    cout << "القيمة الافتراضية: " << parseAge("x").value_or(-1) << "\\n";

    cout << "\\n=== variant + visit ===\\n";
    vector<Shape> shapes = {Circle{1}, Rect{2, 3}, Triangle{4, 5}};
    for (const auto& s : shapes) cout << shapeName(s) << ": " << area(s) << "\\n";

    cout << "\\n=== structured bindings ===\\n";
    map<string, int> scores = {{"سارة", 91}, {"عمر", 78}};
    for (const auto& [name, score] : scores) cout << name << " = " << score << "\\n";
    if (auto [it, inserted] = scores.insert({"ليلى", 85}); inserted)
        cout << "أُضيفت " << it->first << "\\n";

    cout << "\\n=== string_view ===\\n";
    string sentence = "تعلم لغة C++ الحديثة خطوة خطوة";
    cout << "عدد الكلمات: " << countWords(sentence) << "\\n";
    cout << "من نص حرفي: " << countWords("بدون نسخ أي شيء") << "\\n";
    return 0;
}`,
      quiz: {
        question: 'ما أفضل نوع إرجاع لدالة بحث قد لا تجد نتيجة (حالة متوقعة وليست خطأ)؟',
        options: ['int مع -1 عند الفشل', 'std::optional<T>', 'رمي استثناء دائماً', 'void'],
        correctAnswer: 1,
        explanation: 'optional يعبّر صراحةً عن "قد لا توجد قيمة" دون خلطها بقيمة صالحة ودون كلفة الاستثناء.',
      },
    },
  ],
};

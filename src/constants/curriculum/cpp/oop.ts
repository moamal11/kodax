/**
 * منهج cpp-oop — البرمجة الكائنية في C++.
 *
 * كان: 12 درساً بشرح من 5–8 أسطر لكل درس (قوائم نقطية بلا أمثلة داخل الشرح)؛ سؤال درس الوراثة
 * يسأل عن الدوال الافتراضية الخالصة (موضوع درس التجريد)؛ لا شرح لدورة حياة الكائن ولا RAII
 * رغم أنها أساس C++؛ Rule of Three يأتي قبل شرح سبب الحاجة إليه؛ مثال Static Members ينسخ
 * الكائنات بلا حماية فيفسد العداد ويستخدم new/delete يدوياً؛ مثال التجريد ينقصه #include <cmath>
 * ومثال friend ينقصه #include <vector> (لا يُترجمان)؛ تعليق خاطئ "سيستخدم Move" حيث يضمن C++17
 * حذف النسخ.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';

export const CPP_OOP_PLAN: CoursePlan = {
  courseId: 'cpp-oop',
  course: {
    description:
      'البرمجة الكائنية في C++ بعمق: الأصناف والتغليف، دورة حياة الكائن و RAII، العوامل والنسخ (Rule of 3/5/0)، الوراثة وتعدد الأشكال والتجريد، الوراثة المتعددة، friend والأصناف المتداخلة — مع مشروع مكتبة متكامل.',
  },
  sections: [
    { title: 'الأصناف والكائنات', lessons: ['cpp-adv-1', 'cpp-adv-3', 'cpp-adv-8', 'cpp-oop-lifetime'] },
    { title: 'العوامل والنسخ', lessons: ['cpp-adv-6', 'cpp-adv-7'] },
    { title: 'الوراثة وتعدد الأشكال', lessons: ['cpp-adv-2', 'cpp-adv-4', 'cpp-adv-5', 'cpp-adv-10'] },
    { title: 'تنظيم الأصناف', lessons: ['cpp-adv-9', 'cpp-adv-11'] },
    { title: 'المشروع الختامي', lessons: ['cpp-adv-12'] },
  ],
  codeFixes: {
    'cpp-adv-5': [['#include <memory>\n', '#include <memory>\n#include <cmath>\n']],
    'cpp-adv-9': [
      ['#include <string>\n', '#include <string>\n#include <vector>\n'],
      // main ليست صديقة للصنف: الوصول المباشر إلى balance الخاص كان خطأ ترجمة
      ['cout << "\\nالرصيد النهائي: $" << account.balance << endl;', 'cout << "\\nالحالة النهائية:\\n" << account << endl;  // main ليست صديقة: نستخدم operator<<'],
    ],
    'cpp-adv-7': [
      [
        'return MyString(str);  // سيستخدم Move',
        'return MyString(str);  // C++17: حذف نسخ مضمون — يُبنى الكائن مباشرة في مكانه دون نسخ أو نقل',
      ],
      ['s5 = createString("عالم");  // Move Assignment', 's5 = createString("عالم");  // Move Assignment: الطرف الأيمن كائن مؤقت'],
    ],
  },
  patches: {
    'cpp-adv-1': {
      description: 'عرّف أصنافك الخاصة: الأعضاء، المُنشئات وقائمة التهيئة، الدوال const، والفصل بين التصريح والتعريف',
      content: md`
# الأصناف والكائنات (Classes & Objects)

في دورة الأساسيات كانت البيانات والدوال منفصلة: متغيرات هنا، ودوال تستقبلها هناك. **الصنف (class)** يجمع البيانات والسلوك الذي يعمل عليها في وحدة واحدة، ويضمن أن البيانات تبقى صحيحة دائماً.

- **الصنف**: المخطط (مثل مخطط بيت).
- **الكائن (object)**: نسخة حقيقية من الصنف في الذاكرة (البيت المبني).

## أول صنف
\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

class Student {
public:
    string name;
    int grade = 0;            // قيمة افتراضية للعضو

    void print() const {      // دالة عضو
        cout << name << ": " << grade << '\n';
    }
};                            // لا تنسَ الفاصلة المنقوطة!

int main() {
    Student s;                // كائن
    s.name = "سارة";
    s.grade = 95;
    s.print();                // سارة: 95
}
\`\`\`

## class مقابل struct
الفرق الوحيد: الوصول الافتراضي.
| | الوصول الافتراضي للأعضاء | الوراثة الافتراضية |
|---|---|---|
| \`class\` | private | private |
| \`struct\` | public | public |

العرف الشائع: \`struct\` لتجميع بيانات بسيطة بلا قواعد (مثل نقطة x,y)، و \`class\` عندما توجد قواعد يجب حمايتها.

## المُنشئ (Constructor)
دالة بنفس اسم الصنف، بلا نوع إرجاع، تُستدعى تلقائياً عند إنشاء الكائن لتهيئته.

\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

class Point {
    double x, y;
public:
    Point() : x(0), y(0) {}                     // مُنشئ افتراضي
    Point(double x, double y) : x(x), y(y) {}   // قائمة التهيئة
    void print() const { cout << "(" << x << ", " << y << ")\n"; }
};

int main() {
    Point a;           // (0, 0)
    Point b(3, 4);     // (3, 4)
    Point c{1.5, 2};   // التهيئة بالأقواس المعقوصة تعمل أيضاً
    a.print(); b.print(); c.print();
}
\`\`\`

### لماذا قائمة التهيئة \`: x(x), y(y)\`؟
- الأعضاء تُهيَّأ **قبل** دخول جسم المُنشئ. الإسناد داخل الجسم يعني تهيئة ثم إسناداً (عمل مضاعف).
- الأعضاء من نوع \`const\` أو المراجع **لا يمكن** إسنادها، فقط تهيئتها في القائمة.
- تُهيَّأ الأعضاء بترتيب **تصريحها في الصنف**، لا بترتيب كتابتها في القائمة. اكتبها بنفس الترتيب لتجنب المفاجآت.

### explicit
مُنشئ بمعامل واحد يسمح بتحويل ضمني: \`Meters m = 5;\`. أضف \`explicit\` لمنع التحويلات غير المقصودة:
\`\`\`cpp
class Meters {
    double value;
public:
    explicit Meters(double v) : value(v) {}
    double get() const { return value; }
};
// Meters m = 5;   ← لا يُترجم بسبب explicit
// Meters m(5);    ← صحيح
\`\`\`

## المدمّر (Destructor)
\`~Student()\` يُستدعى تلقائياً عند انتهاء عمر الكائن. نادراً ما تحتاج كتابته إلا إذا كان الصنف يملك مورداً (ذاكرة، ملف…) — موضوع درس "دورة حياة الكائن".

## الدوال const
\`void print() const\` وعد بأن الدالة **لا تعدّل** الكائن. على كائن \`const\` (أو مرجع \`const Student&\`) لا يمكن استدعاء إلا الدوال const. اجعل كل دالة لا تعدّل شيئاً const — المترجم سيحميك.

## المؤشر this
داخل الدالة العضو، \`this\` مؤشر إلى الكائن الحالي. تحتاجه عند تشابه الأسماء أو لإرجاع الكائن نفسه:
\`\`\`cpp
class Counter {
    int value = 0;
public:
    Counter& add(int n) { value += n; return *this; }   // يسمح بالسلسلة
    int get() const { return value; }
};
// Counter c; c.add(2).add(3);  → c.get() == 5
\`\`\`

## فصل التصريح عن التعريف
في المشاريع الحقيقية يوضع الصنف في ملف رأس \`Point.h\` والتعريفات في \`Point.cpp\`:
\`\`\`cpp
// Point.h
class Circle {
    double r;
public:
    explicit Circle(double r);
    double area() const;
};

// Point.cpp
Circle::Circle(double r) : r(r) {}
double Circle::area() const { return 3.14159 * r * r; }
\`\`\`
العامل \`::\` يقول: "هذه الدالة تابعة للصنف Circle".

## أخطاء شائعة
- نسيان \`;\` بعد \`}\` الصنف ← أخطاء مترجم غريبة في السطر التالي.
- \`Point p();\` لا تنشئ كائناً! يفهمها المترجم تصريحاً عن **دالة** تعيد Point. استخدم \`Point p;\` أو \`Point p{};\`.
- نسيان \`const\` على دوال القراءة ثم العجز عن استدعائها عبر \`const&\`.

## تمرين
اكتب صنف \`Rectangle\` بعرض وارتفاع (private)، مُنشئ بقائمة تهيئة، ودوال \`area() const\` و \`perimeter() const\` و \`scale(double f)\`. أنشئ مستطيلين واطبع مساحتيهما.
`,
      quiz: {
        question: 'ما الفرق الوحيد بين class و struct في C++؟',
        options: ['struct لا تدعم الدوال', 'الوصول الافتراضي (private في class و public في struct)', 'class أسرع', 'struct لا تدعم المُنشئات'],
        correctAnswer: 1,
        explanation: 'كلاهما يدعم كل شيء؛ الفرق فقط أن أعضاء class و وراثتها private افتراضياً، و public في struct.',
      },
    },
    'cpp-adv-3': {
      description: 'احمِ بيانات الصنف بقواعد ثابتة (invariants): private، واجهة عامة صغيرة، التحقق من المدخلات، و const',
      content: md`
# التغليف (Encapsulation)

التغليف ليس "اجعل كل شيء private واكتب get/set لكل حقل". الهدف الحقيقي: **الصنف مسؤول عن صحة بياناته**. هناك قواعد (تسمى **invariants**) يجب أن تبقى صحيحة دائماً، والطريقة الوحيدة لتغيير البيانات هي عبر دوال تحترم هذه القواعد.

## مثال: لماذا public خطر؟
\`\`\`cpp
struct Account {
    double balance;     // أي كود يستطيع كتابة balance = -1000000
};
\`\`\`
القاعدة "الرصيد لا يصبح سالباً" لا يحميها أحد.

## الحل
\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

class Account {
    string owner;
    double balance = 0;          // private افتراضياً في class
public:
    explicit Account(string name) : owner(name) {}

    bool deposit(double amount) {
        if (amount <= 0) return false;
        balance += amount;
        return true;
    }
    bool withdraw(double amount) {
        if (amount <= 0 || amount > balance) return false;   // القاعدة محمية هنا
        balance -= amount;
        return true;
    }
    double getBalance() const { return balance; }
};

int main() {
    Account acc("ليلى");
    acc.deposit(100);
    cout << boolalpha << acc.withdraw(500) << '\n';   // false — رُفضت العملية
    cout << acc.getBalance() << '\n';                  // 100
}
\`\`\`
لا يوجد \`setBalance\`! تغيير الرصيد له معنى تجاري (إيداع/سحب)، فنكشف هذه العمليات فقط.

## مستويات الوصول
| | داخل الصنف | الأصناف المشتقة | خارج الصنف |
|---|---|---|---|
| \`public\` | ✅ | ✅ | ✅ |
| \`protected\` | ✅ | ✅ | ❌ |
| \`private\` | ✅ | ❌ | ❌ |

ملاحظة: \`private\` تحمي على مستوى **الصنف** لا الكائن؛ دالة في Account تستطيع قراءة \`other.balance\` لكائن Account آخر.

## متى نكتب getter و setter؟
- **getter**: عندما يحتاج المستخدم القيمة فعلاً. أرجع بالقيمة للأنواع الصغيرة، و \`const string&\` للكبيرة.
- **setter**: فقط إذا كان التغيير الحر منطقياً، ومع التحقق دائماً. إذا وجدت نفسك تكتب set لكل حقل دون تحقق، فالحقل عملياً public.

## التحقق في المُنشئ
القاعدة يجب أن تصح منذ لحظة الإنشاء:
\`\`\`cpp
class Temperature {
    double celsius;
public:
    explicit Temperature(double c) : celsius(c < -273.15 ? -273.15 : c) {}  // لا أقل من الصفر المطلق
    double get() const { return celsius; }
};
\`\`\`
في دورة C++ المتقدم ستتعلم رمي **استثناء** (exception) عند مدخلات غير صالحة بدلاً من التصحيح الصامت.

## صحة const (const-correctness)
- دوال القراءة \`const\`.
- مرّر الكائنات للدوال بـ \`const T&\` عندما لا تعدّلها.
- لا تُرجع مرجعاً غير const إلى عضو private — فهذا يفتح الباب للتعديل من الخارج:
\`\`\`cpp
#include <vector>
using namespace std;

class Team {
    vector<int> scores;
public:
    vector<int>& raw() { return scores; }               // ❌ يكسر التغليف: أي أحد يعدّل
    const vector<int>& view() const { return scores; }  // ✅ قراءة فقط
    void addScore(int s) { if (s >= 0) scores.push_back(s); }
};
\`\`\`

## فوائد التغليف
1. **صحة البيانات**: كل التغييرات تمر بنقطة تحقق واحدة.
2. **حرية التغيير**: يمكنك تغيير التمثيل الداخلي (مثلاً تخزين الرصيد بالقروش كـ long long) دون كسر كود من يستخدم الصنف.
3. **سهولة التتبع**: إذا فسدت القيمة، تعرف أين تبحث.

## تمرين
اكتب صنف \`Clock\` يخزن الساعة (0–23) والدقيقة (0–59). وفر \`tick()\` تضيف دقيقة (مع الانتقال الصحيح من 23:59 إلى 00:00)، و \`print() const\`. تأكد أن المُنشئ يرفض/يصحح القيم الخارجة عن المدى.
`,
      quiz: {
        question: 'لماذا لا يحتوي صنف الحساب البنكي على setBalance؟',
        options: [
          'لأن C++ لا تسمح بذلك',
          'لأن تغيير الرصيد يجب أن يمر بعمليات لها قواعد (إيداع/سحب) تحمي صحة البيانات',
          'لتسريع البرنامج',
          'لأن balance من نوع double',
        ],
        correctAnswer: 1,
        explanation: 'التغليف يعني أن الصنف يحمي قواعده؛ setBalance حر سيسمح بأرصدة سالبة أو غير منطقية.',
      },
    },
    'cpp-adv-8': {
      description: 'الأعضاء الثابتة static: بيانات ودوال مشتركة بين كل كائنات الصنف، inline static، ومتغيرات static المحلية',
      content: md`
# الأعضاء الثابتة (Static Members)

العضو العادي له نسخة **في كل كائن**. العضو \`static\` له نسخة **واحدة للصنف كله** يشترك فيها الجميع، وموجود حتى لو لم يُنشأ أي كائن.

## بيانات static
\`\`\`cpp
#include <iostream>
using namespace std;

class Ticket {
    inline static int nextNumber = 1;   // C++17: تعريف وتهيئة داخل الصنف
    int number;
public:
    Ticket() : number(nextNumber++) {}
    int get() const { return number; }
};

int main() {
    Ticket a, b, c;
    cout << a.get() << b.get() << c.get() << '\n';   // 123
}
\`\`\`

### قبل C++17
كان يجب التصريح داخل الصنف ثم التعريف **مرة واحدة** في ملف .cpp:
\`\`\`cpp
class Config {
    static int maxUsers;          // تصريح فقط
public:
    static int getMax() { return maxUsers; }
};
int Config::maxUsers = 100;       // التعريف (وإلا: خطأ ربط undefined reference)
\`\`\`
ستراه كثيراً في الكود القديم. في الكود الجديد استخدم \`inline static\`. الثوابت تُكتب \`static constexpr int MAX = 100;\` مباشرة.

## دوال static
- تُستدعى عبر اسم الصنف: \`Ticket::count()\`.
- **لا تملك this**، لذلك لا تصل إلى الأعضاء العادية إلا عبر كائن تمرره لها.
- استخدامات شائعة: عدادات، دوال مصنع (factory)، دوال مساعدة مرتبطة بالصنف.

\`\`\`cpp
#include <string>
using namespace std;

class Color {
    int r, g, b;
    Color(int r, int g, int b) : r(r), g(g), b(b) {}   // مُنشئ private
public:
    static Color red()   { return Color(255, 0, 0); }   // دوال مصنع بأسماء واضحة
    static Color fromGray(int v) { return Color(v, v, v); }
    string hex() const;
};
\`\`\`

## فخ: عدّاد الكائنات والنسخ
إذا عددت الكائنات بزيادة العداد في المُنشئ وإنقاصه في المدمّر، فإن **النسخ** يستدعي مُنشئ النسخ الافتراضي الذي لا يزيد العداد — فيصبح العدد خاطئاً (وقد يصبح سالباً). الحل: عرّف مُنشئ النسخ بنفسك، أو امنع النسخ بـ \`= delete\` (المثال الكامل يفعل ذلك).

## متغيرات static المحلية
متغير \`static\` داخل دالة يُهيأ **مرة واحدة** عند أول استدعاء ويحتفظ بقيمته بين الاستدعاءات (والتهيئة آمنة مع الخيوط منذ C++11):
\`\`\`cpp
#include <iostream>
using namespace std;

int nextId() {
    static int id = 0;    // يُهيأ مرة واحدة فقط
    return ++id;
}

int main() {
    cout << nextId() << nextId() << nextId() << '\n';   // 123
}
\`\`\`

## متى تتجنب static؟
البيانات static المتغيرة هي عملياً **متغيرات عامة** مخفية داخل صنف: تجعل الاختبار أصعب وتسبب مشاكل مع الخيوط. استخدمها للعدادات والثوابت والمصانع، لا لتخزين حالة البرنامج كلها.

## تمرين
أضف إلى صنف \`Ticket\` دالة \`static int issued()\` تعيد عدد التذاكر الصادرة، وامنع نسخ التذاكر (\`Ticket(const Ticket&) = delete;\`). جرّب نسخ تذكرة وشاهد رسالة المترجم.
`,
      codeExample: `#include <iostream>
#include <string>
#include <vector>
#include <memory>
using namespace std;

class Employee {
    // C++17: inline static تسمح بالتهيئة داخل الصنف
    inline static int nextId = 1;
    inline static int activeCount = 0;
    inline static double totalSalary = 0;

    int id;
    string name;
    double salary;

public:
    static constexpr double MIN_SALARY = 500;   // ثابت مشترك

    Employee(string n, double s) : id(nextId++), name(move(n)), salary(s < MIN_SALARY ? MIN_SALARY : s) {
        ++activeCount;
        totalSalary += salary;
        cout << "✅ إنشاء: " << name << " (ID " << id << ")\\n";
    }

    ~Employee() {
        --activeCount;
        totalSalary -= salary;
        cout << "❌ مغادرة: " << name << "\\n";
    }

    // النسخ ممنوع: نسخة صامتة كانت ستُفسد activeCount و totalSalary
    Employee(const Employee&) = delete;
    Employee& operator=(const Employee&) = delete;

    void setSalary(double s) {
        if (s < MIN_SALARY) return;
        totalSalary += s - salary;
        salary = s;
    }

    const string& getName() const { return name; }

    // دوال static: لا this، تُستدعى عبر اسم الصنف
    static int count() { return activeCount; }
    static double averageSalary() { return activeCount ? totalSalary / activeCount : 0; }

    // دوال مصنع تعيد unique_ptr: الذاكرة تُحرر تلقائياً
    static unique_ptr<Employee> manager(const string& n) { return make_unique<Employee>(n, 10000); }
    static unique_ptr<Employee> developer(const string& n) { return make_unique<Employee>(n, 7000); }
    static unique_ptr<Employee> intern(const string& n) { return make_unique<Employee>(n, 300); }
};

int main() {
    cout << "الموظفون الآن: " << Employee::count() << "\\n\\n";

    vector<unique_ptr<Employee>> staff;
    staff.push_back(Employee::manager("أحمد"));
    staff.push_back(Employee::developer("محمد"));
    staff.push_back(Employee::developer("سارة"));
    staff.push_back(Employee::intern("علي"));   // الراتب يُرفع إلى الحد الأدنى 500

    cout << "\\nالعدد: " << Employee::count() << "\\n";
    cout << "المتوسط: " << Employee::averageSalary() << "\\n";

    staff[1]->setSalary(8000);
    cout << "المتوسط بعد ترقية محمد: " << Employee::averageSalary() << "\\n\\n";

    staff.pop_back();   // يُحذف آخر موظف تلقائياً
    cout << "العدد بعد مغادرة المتدرب: " << Employee::count() << "\\n\\n";

    // Employee copy = *staff[0];   // خطأ ترجمة: النسخ محذوف
    cout << "نهاية main — يُحذف الباقون تلقائياً:\\n";
    return 0;
}`,
      quiz: {
        question: 'لماذا لا تستطيع دالة static الوصول مباشرة إلى عضو عادي (غير static)؟',
        options: ['لأنها private دائماً', 'لأنها لا تملك المؤشر this — فهي لا تتبع كائناً محدداً', 'لأنها أبطأ', 'لأن المترجم لا يدعم ذلك قبل C++20'],
        correctAnswer: 1,
        explanation: 'الدالة static تتبع الصنف لا الكائن، فلا يوجد this يحدد أي كائن نقصد.',
      },
    },
    'cpp-adv-6': {
      description: 'اجعل أصنافك تتصرف كالأنواع المدمجة: + و += و == و << و [] — متى تكون عضواً ومتى دالة حرة',
      content: md`
# تحميل العوامل (Operator Overloading)

تحميل العوامل يجعل الكود الذي يستخدم أصنافك طبيعياً: \`a + b\` بدلاً من \`a.add(b)\`. لكنه مجرد **دالة باسم خاص**: \`a + b\` تعني \`operator+(a, b)\` أو \`a.operator+(b)\`.

## القاعدة الذهبية
حمّل العامل فقط إذا كان معناه **بديهياً** ومتوقعاً. \`+\` لمتجهين واضح؛ \`+\` لإضافة موظف إلى قسم غير واضح — استخدم دالة باسم.

## مثال متكامل: Vec2
\`\`\`cpp
#include <iostream>
using namespace std;

class Vec2 {
public:
    double x = 0, y = 0;
    Vec2() = default;
    Vec2(double x, double y) : x(x), y(y) {}

    // العوامل المركبة تعدّل الكائن ← عضو، وتُرجع مرجعاً
    Vec2& operator+=(const Vec2& o) { x += o.x; y += o.y; return *this; }
    Vec2& operator*=(double k) { x *= k; y *= k; return *this; }

    Vec2 operator-() const { return {-x, -y}; }          // سالب أحادي

    bool operator==(const Vec2&) const = default;        // C++20: يولّد == و != تلقائياً
};

// العوامل الثنائية المتماثلة ← دوال حرة مبنية على المركبة
Vec2 operator+(Vec2 a, const Vec2& b) { a += b; return a; }
Vec2 operator*(Vec2 v, double k) { v *= k; return v; }
Vec2 operator*(double k, Vec2 v) { v *= k; return v; }   // ليعمل 2 * v أيضاً

// << يجب أن تكون حرة: الطرف الأيسر ostream وليس Vec2
ostream& operator<<(ostream& os, const Vec2& v) {
    return os << "(" << v.x << ", " << v.y << ")";
}

int main() {
    Vec2 a(1, 2), b(3, 4);
    cout << a + b << '\n';        // (4, 6)
    cout << 2 * a << '\n';        // (2, 4)
    cout << -b << '\n';           // (-3, -4)
    a += b;
    cout << boolalpha << (a == Vec2(4, 6)) << '\n';   // true
}
\`\`\`

## عضو أم دالة حرة؟
| العامل | الشكل المفضل | السبب |
|---|---|---|
| \`= [] () ->\` | عضو (إجباري) | قاعدة اللغة |
| \`+= -= *=\` | عضو | يعدّل الكائن الأيسر |
| \`+ - * /\` | حرة | ليعمل التحويل على الطرفين (\`2 * v\`) |
| \`<< >>\` للتدفقات | حرة | الطرف الأيسر ostream/istream |
| \`== <=>\` | عضو \`= default\` أو حرة | C++20 يولّد الباقي |

بناء \`+\` على \`+=\` يمنع تكرار المنطق.

## المقارنة في C++20
\`auto operator<=>(const T&) const = default;\` يولّد \`< <= > >=\` بمقارنة الأعضاء بالترتيب، و \`= default\` على \`==\` يولّد \`==\` و \`!=\`. قبل C++20 كان يلزم كتابة ستة عوامل.
\`\`\`cpp
#include <compare>
#include <string>
using namespace std;

struct Version {
    int major, minor, patch;
    auto operator<=>(const Version&) const = default;
};
// Version{1,2,0} < Version{1,10,0}  → true
\`\`\`

## عامل الفهرسة []
وفّر نسختين: واحدة للكائنات العادية تُرجع مرجعاً قابلاً للتعديل، وواحدة const:
\`\`\`cpp
#include <cstddef>

class Row {
    int cells[4] = {};
public:
    int& operator[](std::size_t i) { return cells[i]; }
    const int& operator[](std::size_t i) const { return cells[i]; }
};
\`\`\`

## قيود
- لا يمكن تحميل: \`::\` \`.\` \`.*\` \`?:\` \`sizeof\`.
- لا يمكن تغيير **الأولوية** ولا عدد المعاملات ولا اختراع عوامل جديدة.
- لا تحمّل \`&&\` و \`||\`: النسخة المحمّلة تفقد التقييم المختصر (short-circuit).

## تمرين
اكتب صنف \`Fraction\` (بسط ومقام) مع \`+\` و \`*\` و \`==\` و \`<<\`. اختصر الكسر في المُنشئ باستخدام \`std::gcd\` من \`<numeric>\`، وتأكد أن \`Fraction(1,2) == Fraction(2,4)\`.
`,
      quiz: {
        question: 'لماذا يجب أن يكون operator<< لطباعة كائن دالة حرة وليس عضواً في الصنف؟',
        options: ['لأنه أسرع', 'لأن الطرف الأيسر في cout << obj هو ostream وليس كائن الصنف', 'لأن الدوال الأعضاء لا تستطيع الطباعة', 'لأن << عامل لا يمكن تحميله'],
        correctAnswer: 1,
        explanation: 'العامل العضو يجعل كائن الصنف هو الطرف الأيسر دائماً؛ في cout << obj الطرف الأيسر هو cout.',
      },
    },
    'cpp-adv-7': {
      title: 'النسخ والنقل: Rule of 3/5/0',
      description: 'لماذا يكسر النسخ الافتراضي الأصناف التي تملك موارد، وكيف تكتب مُنشئ النسخ والإسناد والنقل — أو تتجنب كتابتها أصلاً',
      content: md`
# النسخ والنقل: قاعدة 3/5/0

## النسخ الافتراضي
إذا لم تكتب شيئاً، يولّد المترجم مُنشئ نسخ وعامل إسناد **ينسخان كل عضو** بدوره. هذا ممتاز لأعضاء مثل \`int\` و \`string\` و \`vector\`، وكارثي للمؤشرات التي **تملك** ذاكرة:

\`\`\`cpp
#include <cstring>

class BadString {
    char* data;
public:
    BadString(const char* s) : data(new char[std::strlen(s) + 1]) { std::strcpy(data, s); }
    ~BadString() { delete[] data; }
    // لا مُنشئ نسخ ← النسخ الافتراضي ينسخ المؤشر فقط
};
// BadString a("hi");
// BadString b = a;   // b.data == a.data (نسخ سطحي)
// عند نهاية النطاق: delete[] لنفس الذاكرة مرتين ← سلوك غير معرّف (غالباً انهيار)
\`\`\`

## متى يُستدعى كل شيء؟
\`\`\`cpp
#include <string>
using std::string;

string a = "x";
string b = a;              // مُنشئ النسخ: كائن جديد من موجود
string c(a);               // مُنشئ النسخ أيضاً
// b = c;                  // عامل الإسناد: كائن موجود يأخذ قيمة آخر
// void f(string s); f(a); // مُنشئ النسخ عند التمرير بالقيمة
\`\`\`
القاعدة: إذا كان الكائن **يُنشأ الآن** فهو مُنشئ؛ إذا كان **موجوداً مسبقاً** فهو إسناد.

## قاعدة الثلاثة (Rule of Three)
إذا احتاج صنفك أحد هذه، فهو غالباً يحتاج الثلاثة:
1. المدمّر \`~T()\`
2. مُنشئ النسخ \`T(const T&)\`
3. عامل إسناد النسخ \`T& operator=(const T&)\`

السبب: الحاجة لمدمّر تعني أن الصنف يملك مورداً، والمورد يحتاج نسخاً عميقاً (deep copy).

## الإسناد الآمن: copy-and-swap
الطريقة الساذجة (delete ثم new) تترك الكائن مكسوراً إذا فشل \`new\`. الحل المعتمد:
\`\`\`cpp
#include <cstring>
#include <utility>

class Text {
    char* data;
public:
    Text(const char* s = "") : data(new char[std::strlen(s) + 1]) { std::strcpy(data, s); }
    ~Text() { delete[] data; }
    Text(const Text& o) : Text(o.data) {}                 // نسخ عميق (تفويض للمُنشئ)
    Text& operator=(Text other) {                         // لاحظ: بالقيمة ← النسخ يحدث هنا
        std::swap(data, other.data);                      // نبادل، والقديم يُحرَّر مع other
        return *this;
    }
    const char* c_str() const { return data; }
};
\`\`\`
إذا فشل النسخ يرمي قبل أن نلمس الكائن، والإسناد الذاتي \`t = t\` يعمل تلقائياً.

## قاعدة الخمسة (Rule of Five) — C++11
النسخ العميق مكلف. إذا كان المصدر **مؤقتاً** سيموت قريباً، لماذا لا "نسرق" مورده؟ هذا هو **النقل**:
4. مُنشئ النقل \`T(T&&) noexcept\`
5. عامل إسناد النقل \`T& operator=(T&&) noexcept\`

النقل ينقل المؤشر ويترك المصدر فارغاً لكن صالحاً (يمكن تدميره أو الإسناد له). اكتبه \`noexcept\` — وإلا لن يستخدمه \`vector\` عند التوسّع وسيلجأ للنسخ. ستتعمق في النقل في دورة C++ المتقدم.

## قاعدة الصفر (Rule of Zero) — الأفضل
أفضل صنف هو الذي **لا يحتاج** أياً من الخمسة: اجعل الأعضاء أنواعاً تدير نفسها (\`string\`، \`vector\`، \`unique_ptr\`)، والمترجم سيولّد النسخ والنقل والتدمير الصحيحة:
\`\`\`cpp
#include <string>
#include <vector>
using namespace std;

class Playlist {          // لا مدمّر، لا نسخ يدوي — وكل شيء صحيح
    string name;
    vector<string> songs;
public:
    explicit Playlist(string n) : name(move(n)) {}
    void add(string s) { songs.push_back(move(s)); }
};
\`\`\`
اكتب الخمسة فقط عندما تبني بنفسك صنفاً منخفض المستوى يدير مورداً.

## default و delete
\`\`\`cpp
class Socket {
public:
    Socket() = default;
    Socket(const Socket&) = delete;             // غير قابل للنسخ
    Socket& operator=(const Socket&) = delete;
    Socket(Socket&&) = default;                 // لكن قابل للنقل
    Socket& operator=(Socket&&) = default;
};
\`\`\`
\`= delete\` يحوّل خطأ وقت التشغيل (نسخ مورد لا يُنسخ) إلى خطأ ترجمة واضح.

## تمرين
شغّل المثال الكامل وتتبّع كل سطر مطبوع: أي عملية استدعت أي دالة؟ ثم احذف مُنشئ النسخ من MyString، وتوقّع ما سيحدث عند \`MyString s2(s1);\` ولماذا.
`,
      quiz: {
        question: 'ما المقصود بـ Rule of Zero؟',
        options: [
          'لا تكتب أي صنف بدون مُنشئ',
          'صمّم الصنف بأعضاء تدير مواردها بنفسها (string, vector, unique_ptr) فلا تحتاج كتابة المدمّر والنسخ والنقل',
          'اجعل كل الأعضاء صفراً في المُنشئ',
          'امنع النسخ في كل الأصناف',
        ],
        correctAnswer: 1,
        explanation: 'عندما تدير الأعضاء مواردها، يولّد المترجم عمليات النسخ والنقل والتدمير الصحيحة تلقائياً.',
      },
    },
    'cpp-adv-2': {
      description: 'الوراثة العامة (is-a): استدعاء مُنشئ الأب، protected، ترتيب البناء والهدم، إخفاء الأسماء، و final',
      content: md`
# الوراثة (Inheritance)

الوراثة تعني أن صنفاً **مشتقاً** (derived) يأخذ أعضاء صنف **أساسي** (base) ويضيف إليها. استخدمها عندما تصح جملة **"هو نوع من" (is-a)**: الكلب نوع من الحيوانات، الحساب الادخاري نوع من الحسابات.

## الصيغة
\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

class Animal {
protected:                       // متاح للأصناف المشتقة، مخفي عن الخارج
    string name;
public:
    explicit Animal(string n) : name(n) { cout << "Animal(" << name << ")\n"; }
    ~Animal() { cout << "~Animal\n"; }
    void eat() const { cout << name << " يأكل\n"; }
};

class Dog : public Animal {
    string breed;
public:
    Dog(string n, string b) : Animal(n), breed(b) {   // استدعاء مُنشئ الأب أولاً
        cout << "Dog(" << breed << ")\n";
    }
    ~Dog() { cout << "~Dog\n"; }
    void bark() const { cout << name << " ينبح\n"; }   // يصل إلى name لأنها protected
};

int main() {
    Dog d("ريكس", "جيرمن شيبرد");
    d.eat();     // موروثة
    d.bark();    // خاصة بـ Dog
}
// الناتج: Animal(ريكس) ← Dog(...) ← ... ← ~Dog ← ~Animal
\`\`\`

## ترتيب البناء والهدم
- **البناء**: الأب أولاً، ثم أعضاء الابن، ثم جسم مُنشئ الابن (الأساس قبل البناء فوقه).
- **الهدم**: بالعكس تماماً: الابن أولاً ثم الأب.
- إذا لم تستدعِ مُنشئ الأب صراحةً في قائمة التهيئة، يُستدعى مُنشئه **الافتراضي** — وإن لم يوجد، خطأ ترجمة.

## أنواع الوراثة
| الصيغة | public في الأب يصبح | الاستخدام |
|---|---|---|
| \`: public Base\` | public | الوراثة الطبيعية (is-a) — استخدمها في 99% من الحالات |
| \`: protected Base\` | protected | نادر |
| \`: private Base\` | private | "مُنفَّذ باستخدام" — التركيب غالباً أوضح |

انتبه: \`class D : Base\` بدون كلمة تعني **private** (لأنها class)!

## protected: بحذر
\`protected\` يجعل الأصناف المشتقة تعتمد على تفاصيل الأب الداخلية. القاعدة العملية: البيانات private، وإن احتاجها الأبناء فوفّر لهم دوال protected.

## استدعاء نسخة الأب وإخفاء الأسماء
إذا عرّف الابن دالة بنفس اسم دالة في الأب، فهي **تخفي** كل نسخ الأب بذلك الاسم:
\`\`\`cpp
#include <iostream>
using namespace std;

class Base {
public:
    void show() const { cout << "Base\n"; }
    void show(int n) const { cout << "Base " << n << '\n'; }
};

class Derived : public Base {
public:
    using Base::show;                 // بدونها: d.show(5) خطأ ترجمة (مخفية)
    void show() const {
        Base::show();                 // استدعاء نسخة الأب صراحة
        cout << "Derived\n";
    }
};
\`\`\`

## وراثة المُنشئات
\`using Base::Base;\` داخل الابن يجعله يرث مُنشئات الأب كما هي — مفيد عندما لا يضيف الابن أعضاء تحتاج تهيئة.

## final
\`class Circle final : public Shape\` تمنع أي وراثة من Circle. ويمكن وضع \`final\` على دالة افتراضية لمنع إعادة تعريفها.

## الوراثة ليست دائماً الحل
الوراثة أقوى رابط بين صنفين. إذا كانت العلاقة **"يملك" (has-a)** — السيارة تملك محركاً — فاستخدم **التركيب**: اجعل المحرك عضواً داخل السيارة. ورِث فقط عندما تريد أن يُستخدم الابن **في مكان** الأب — وهذا ما يفتحه الدرس التالي: تعدد الأشكال.

## تمرين
اكتب \`Account\` (رصيد، deposit، withdraw) ثم \`SavingsAccount : public Account\` يضيف نسبة فائدة و \`addInterest()\`. اطبع رسائل في المُنشئات والمدمّرات وتأكد من الترتيب.
`,
      quiz: {
        question: 'بأي ترتيب تُستدعى المُنشئات والمدمّرات عند إنشاء ثم تدمير كائن Dog المشتق من Animal؟',
        options: [
          'Dog ثم Animal، ثم ~Dog ثم ~Animal',
          'Animal ثم Dog، ثم ~Dog ثم ~Animal',
          'Animal ثم Dog، ثم ~Animal ثم ~Dog',
          'الترتيب غير محدد',
        ],
        correctAnswer: 1,
        explanation: 'البناء من الأساس إلى المشتق، والهدم بالترتيب العكسي تماماً.',
      },
    },
    'cpp-adv-4': {
      description: 'الدوال الافتراضية و override، التعامل عبر مؤشر/مرجع الأب، التقطيع (slicing)، والمدمّر الافتراضي',
      content: md`
# تعدد الأشكال (Polymorphism)

تعدد الأشكال يعني: **كود واحد يتعامل مع أنواع مختلفة**، وكل نوع يتصرف بطريقته. في C++ نوعان:

| النوع | وقت التحديد | الأدوات |
|---|---|---|
| ساكن (compile-time) | وقت الترجمة | تحميل الدوال، القوالب (templates) |
| ديناميكي (runtime) | وقت التشغيل | الدوال الافتراضية \`virtual\` |

هذا الدرس عن الديناميكي.

## المشكلة بدون virtual
\`\`\`cpp
#include <iostream>
using namespace std;

class Shape {
public:
    double area() const { return 0; }          // ليست virtual
};
class Square : public Shape {
    double s;
public:
    explicit Square(double s) : s(s) {}
    double area() const { return s * s; }
};

int main() {
    Square sq(3);
    const Shape& ref = sq;
    cout << ref.area() << '\n';   // 0 !  — المترجم اختار حسب نوع المرجع (Shape)
}
\`\`\`

## الحل: virtual و override
\`\`\`cpp
#include <iostream>
#include <memory>
#include <vector>
using namespace std;

class Shape {
public:
    virtual double area() const { return 0; }
    virtual ~Shape() = default;                // ضروري! انظر أدناه
};
class Square : public Shape {
    double s;
public:
    explicit Square(double s) : s(s) {}
    double area() const override { return s * s; }
};
class Circle : public Shape {
    double r;
public:
    explicit Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
};

int main() {
    vector<unique_ptr<Shape>> shapes;
    shapes.push_back(make_unique<Square>(3));
    shapes.push_back(make_unique<Circle>(1));
    for (const auto& s : shapes)
        cout << s->area() << '\n';   // 9 ثم 3.14159 — كل شكل بطريقته
}
\`\`\`
تعدد الأشكال يعمل **فقط عبر مؤشر أو مرجع** للأب.

## لماذا override؟
\`override\` تطلب من المترجم التأكد أنك فعلاً تعيد تعريف دالة افتراضية. بدونها، خطأ صغير في التوقيع (نسيان \`const\` مثلاً) يُنشئ دالة **جديدة** بصمت، ويبقى الاستدعاء يذهب لنسخة الأب. اكتب \`override\` دائماً.

## المدمّر الافتراضي — قاعدة إلزامية
إذا كان الصنف سيُحذف عبر مؤشر للأب (\`unique_ptr<Shape>\` أو \`delete basePtr\`)، يجب أن يكون مدمّر الأب \`virtual\`. بدونه يُستدعى مدمّر الأب فقط ← سلوك غير معرّف، وموارد الابن لا تُحرر.
**القاعدة**: أي صنف فيه دالة virtual ← مدمّره \`virtual\`.

## التقطيع (Object Slicing)
\`\`\`cpp
#include <iostream>
using namespace std;

class Animal { public: virtual const char* sound() const { return "..."; } virtual ~Animal() = default; };
class Cat : public Animal { public: const char* sound() const override { return "مياو"; } };

void byValue(Animal a)      { cout << a.sound() << '\n'; }  // ❌ نسخة من جزء Animal فقط
void byRef(const Animal& a) { cout << a.sound() << '\n'; }  // ✅

int main() {
    Cat c;
    byValue(c);   // ...    (قُطع جزء Cat)
    byRef(c);     // مياو
}
\`\`\`
مرّر الكائنات متعددة الأشكال **بالمرجع أو المؤشر**، وخزّنها في الحاويات كـ \`unique_ptr<Base>\` لا \`Base\`.

## كيف يعمل من الداخل؟ (للفهم)
كل صنف فيه دوال virtual له جدول **vtable** بعناوين نسخه من الدوال، وكل كائن يحمل مؤشراً مخفياً إلى جدول صنفه. الاستدعاء الافتراضي = قفزة عبر الجدول. التكلفة صغيرة جداً، لكنها تمنع بعض التحسينات (inlining).

## فخ: استدعاء virtual داخل المُنشئ
أثناء بناء جزء الأب، جزء الابن **لم يُبنَ بعد**، فالاستدعاء الافتراضي داخل مُنشئ الأب يذهب لنسخة الأب. لا تعتمد على virtual في المُنشئات والمدمّرات.

## تمرين
شغّل المثال الكامل (أنظمة الدفع). أضف طريقة دفع جديدة \`Crypto\` دون تعديل \`PaymentProcessor\` — هذه هي قوة تعدد الأشكال: كود جديد يعمل مع كود قديم بلا تغيير.
`,
      quiz: {
        question: 'ماذا يحدث إذا حُذف كائن مشتق عبر مؤشر للأب ومدمّر الأب ليس virtual؟',
        options: ['يعمل بشكل طبيعي', 'سلوك غير معرّف — غالباً يُستدعى مدمّر الأب فقط وتتسرب موارد الابن', 'خطأ ترجمة', 'يُستدعى مدمّر الابن فقط'],
        correctAnswer: 1,
        explanation: 'لهذا القاعدة: أي صنف أساسي متعدد الأشكال يجب أن يكون مدمّره virtual.',
      },
    },
    'cpp-adv-5': {
      description: 'الأصناف المجردة والدوال الافتراضية الخالصة (= 0)، الواجهات، والبرمجة نحو الواجهة لا التنفيذ',
      content: md`
# التجريد (Abstraction)

التجريد يعني إظهار **ماذا** يفعل الشيء وإخفاء **كيف**. في الدرس السابق كانت \`Shape::area()\` تعيد 0 — قيمة لا معنى لها. الأصح أن نقول: "كل شكل **يجب** أن يحدد مساحته، ولا يوجد شكل عام".

## الدالة الافتراضية الخالصة
\`\`\`cpp
class Shape {
public:
    virtual double area() const = 0;     // = 0 ← خالصة: بلا تنفيذ هنا
    virtual ~Shape() = default;
};
\`\`\`
- الصنف الذي فيه دالة خالصة واحدة على الأقل يصبح **مجرداً (abstract)**: لا يمكن إنشاء كائن منه.
- كل صنف مشتق **يجب** أن ينفذ الدوال الخالصة، وإلا يبقى مجرداً هو أيضاً.

\`\`\`cpp
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};
int main() {
    Shape s;   // خطأ: cannot declare variable 's' to be of abstract type
}
\`\`\`

## الواجهة (Interface)
C++ لا تملك كلمة \`interface\`. الواجهة = صنف مجرد فيه **دوال خالصة فقط** ومدمّر افتراضي، بلا بيانات. تصف **قدرة**:
\`\`\`cpp
#include <iostream>
#include <memory>
#include <string>
#include <vector>
using namespace std;

class Notifier {                                   // واجهة
public:
    virtual void send(const string& to, const string& msg) = 0;
    virtual ~Notifier() = default;
};

class EmailNotifier : public Notifier {
public:
    void send(const string& to, const string& msg) override { cout << "📧 " << to << ": " << msg << '\n'; }
};
class SmsNotifier : public Notifier {
public:
    void send(const string& to, const string& msg) override { cout << "📱 " << to << ": " << msg << '\n'; }
};

// هذه الدالة لا تعرف ولا تهتم بنوع الإشعار
void remindAll(Notifier& n, const vector<string>& users) {
    for (const auto& u : users) n.send(u, "موعد الاختبار غداً");
}

int main() {
    EmailNotifier email;
    SmsNotifier sms;
    remindAll(email, {"sara@x.com", "omar@x.com"});
    remindAll(sms, {"0770000000"});
}
\`\`\`

## البرمجة نحو الواجهة
\`remindAll\` تعتمد على **الواجهة** Notifier لا على صنف محدد. النتائج:
- إضافة \`WhatsAppNotifier\` لا تحتاج تعديل \`remindAll\`.
- في الاختبارات يمكن تمرير \`FakeNotifier\` يسجّل الرسائل بدل إرسالها فعلاً.

هذا جوهر مبدأ **عكس الاعتماد (Dependency Inversion)**: الكود عالي المستوى يعتمد على تجريدات، لا تفاصيل.

## صنف مجرد مع تنفيذ جزئي
الصنف المجرد يمكن أن يحتوي بيانات ودوالاً عادية أيضاً — مفيد لمشاركة الكود المشترك:
\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

class Report {
public:
    void print() const {                      // خطوات ثابتة
        cout << "=== " << title() << " ===\n";
        body();
        cout << "-- نهاية --\n";
    }
    virtual ~Report() = default;
protected:
    virtual string title() const = 0;         // خطوات يحددها كل ابن
    virtual void body() const = 0;
};
\`\`\`
هذا نمط **Template Method**: الأب يحدد الهيكل والأبناء يملؤون الفراغات.

## مقارنة سريعة
| | صنف عادي | صنف مجرد | واجهة |
|---|---|---|---|
| إنشاء كائن مباشرة | ✅ | ❌ | ❌ |
| دوال خالصة | لا | واحدة على الأقل | كلها |
| بيانات | ✅ | ✅ | لا (عرفاً) |

## تمرين
في المثال الكامل، أضف شكلاً جديداً \`Square\` ينفذ \`IDrawable\` و \`IResizable\`. ماذا يحدث إذا نسيت تنفيذ \`resize\`؟ اقرأ رسالة المترجم.
`,
      quiz: {
        question: 'ماذا يحدث إذا لم ينفّذ صنف مشتق كل الدوال الافتراضية الخالصة في الأب؟',
        options: ['تُستدعى نسخة فارغة تلقائياً', 'يبقى الصنف المشتق مجرداً ولا يمكن إنشاء كائن منه', 'خطأ وقت التشغيل', 'تُحذف الدوال من الأب'],
        correctAnswer: 1,
        explanation: 'الدالة الخالصة غير المنفذة تجعل الصنف مجرداً؛ محاولة إنشاء كائن منه خطأ ترجمة.',
      },
    },
    'cpp-adv-10': {
      description: 'الوراثة من أكثر من صنف: دمج الواجهات، مشكلة الماسة (Diamond)، الوراثة الافتراضية، وحل الغموض',
      content: md`
# الوراثة المتعددة (Multiple Inheritance)

C++ تسمح للصنف بالوراثة من أكثر من صنف أساسي:
\`\`\`cpp
class Parent1 { };
class Parent2 { };
class Child : public Parent1, public Parent2 { };
\`\`\`

## الاستخدام الآمن: دمج الواجهات
الاستخدام الأكثر شيوعاً وأماناً: صنف ينفذ عدة **قدرات** مستقلة:
\`\`\`cpp
#include <iostream>
using namespace std;

class Printable { public: virtual void print() const = 0; virtual ~Printable() = default; };
class Savable   { public: virtual bool save() const = 0;  virtual ~Savable() = default; };

class Invoice : public Printable, public Savable {
    int number;
public:
    explicit Invoice(int n) : number(n) {}
    void print() const override { cout << "فاتورة #" << number << '\n'; }
    bool save() const override { cout << "حفظ الفاتورة\n"; return true; }
};

void printIt(const Printable& p) { p.print(); }

int main() {
    Invoice inv(42);
    printIt(inv);      // تُعامل كـ Printable
    inv.save();
}
\`\`\`

## الغموض (Ambiguity)
إذا ورث الصنف دالتين بنفس الاسم من أبوين، فالاستدعاء غامض:
\`\`\`cpp
#include <string>
using std::string;

struct Camera { string id() const { return "CAM"; } };
struct Phone  { string id() const { return "PHN"; } };
struct Smart : Camera, Phone {
    string id() const { return Camera::id() + "+" + Phone::id(); }   // نحسم صراحة
};
// بدون تعريف id في Smart: s.id() خطأ ترجمة (request for member 'id' is ambiguous)
\`\`\`

## مشكلة الماسة (Diamond Problem)
\`\`\`text
        Device
       /      \
    Phone    Camera
       \      /
      Smartphone
\`\`\`
بالوراثة العادية، Smartphone يحتوي **نسختين** من Device (واحدة عبر Phone وواحدة عبر Camera): بيانات مكررة، و \`smartphone.powerOn()\` غامضة.

## الحل: الوراثة الافتراضية
\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

class Device {
protected:
    string brand;
public:
    explicit Device(string b) : brand(b) { cout << "Device(" << brand << ")\n"; }
    virtual ~Device() = default;
};
class Phone  : virtual public Device { public: Phone()  : Device("?") {} };
class Camera : virtual public Device { public: Camera() : Device("?") {} };

class Smartphone : public Phone, public Camera {
public:
    // الصنف الأخير في السلسلة هو من يبني Device الافتراضي مباشرة
    Smartphone() : Device("Kodax"), Phone(), Camera() {}
    void show() const { cout << brand << '\n'; }   // لا غموض: نسخة واحدة من Device
};

int main() {
    Smartphone s;   // Device(Kodax) — مرة واحدة فقط
    s.show();
}
\`\`\`
نقاط مهمة:
- \`virtual\` تُكتب عند الوراثة من القاعدة المشتركة (في Phone و Camera)، لا في Smartphone.
- **الصنف الأكثر اشتقاقاً** هو من يستدعي مُنشئ القاعدة الافتراضية؛ استدعاءات Phone و Camera لـ Device تُتجاهل.
- للوراثة الافتراضية تكلفة بسيطة في الحجم والسرعة.

## نصيحة عملية
- ورِث من واجهات متعددة بحرية.
- تجنب وراثة **عدة أصناف تحمل بيانات وتنفيذاً**؛ إن ظهرت الماسة فكّر أولاً هل التركيب أنسب، ثم استخدم الوراثة الافتراضية إن لزم.

## تمرين
في المثال الكامل احذف \`virtual\` من وراثة Phone و Camera. كم مرة يُطبع مُنشئ Device الآن؟ وما الخطأ الذي يظهر عند الوصول إلى \`brand\`؟
`,
      quiz: {
        question: 'في الوراثة الافتراضية، من يستدعي مُنشئ الصنف الأساسي المشترك (القاعدة الافتراضية)؟',
        options: ['أول صنف وسيط', 'كل صنف وسيط مرة', 'الصنف الأكثر اشتقاقاً (الأخير في السلسلة)', 'لا يُستدعى أبداً'],
        correctAnswer: 2,
        explanation: 'لضمان نسخة واحدة، الصنف الأكثر اشتقاقاً يبني القاعدة الافتراضية مباشرة، وتُتجاهل استدعاءات الأصناف الوسيطة.',
      },
    },
    'cpp-adv-9': {
      description: 'منح دالة أو صنف حق الوصول إلى الأعضاء الخاصة: friend، الـ hidden friend للعوامل، وحدود الصداقة',
      content: md`
# الدوال والأصناف الصديقة (friend)

أحياناً تحتاج دالة ليست عضواً في الصنف إلى الوصول إلى أعضائه الخاصة. المثال الأشهر: \`operator<<\` (يجب أن يكون دالة حرة كما تعلمت). \`friend\` تمنح هذا الحق **صراحةً ومن داخل الصنف**.

## دالة صديقة
\`\`\`cpp
#include <iostream>
using namespace std;

class Money {
    long long cents;
public:
    explicit Money(long long c) : cents(c) {}

    // hidden friend: معرّفة داخل الصنف، تُوجد فقط عند استخدام Money
    friend ostream& operator<<(ostream& os, const Money& m) {
        return os << m.cents / 100 << "." << (m.cents % 100 < 10 ? "0" : "") << m.cents % 100;
    }
    friend Money operator+(const Money& a, const Money& b) { return Money(a.cents + b.cents); }
};

int main() {
    Money a(1050), b(205);
    cout << a + b << '\n';   // 12.55
}
\`\`\`
تعريف الدالة الصديقة **داخل** الصنف (hidden friend) هو الأسلوب الحديث المفضل للعوامل: لا تلوث النطاق العام، ويجدها المترجم عند الحاجة فقط.

## صنف صديق
\`\`\`cpp
class Engine {
    int rpm = 0;
    friend class Mechanic;       // Mechanic يصل إلى rpm
};

class Mechanic {
public:
    void tune(Engine& e) { e.rpm = 800; }
    int read(const Engine& e) const { return e.rpm; }
};
\`\`\`

## حدود الصداقة
- **ليست متبادلة**: إذا كان A صديقاً لـ B، فـ B ليس صديقاً لـ A تلقائياً.
- **ليست متعدية**: صديق صديقك ليس صديقك.
- **لا تُورث**: الأصناف المشتقة من Mechanic لا ترث صداقته.
- **لا تتأثر بـ public/private**: مكان كتابة \`friend\` داخل الصنف لا يهم.

## هل friend تكسر التغليف؟
ليس إذا استُخدمت بحكمة: الصنف هو من يقرر من يثق به، والقائمة مكتوبة داخله. الدالة الصديقة جزء من **واجهة** الصنف مثل الدوال الأعضاء تماماً. لكن إذا احتجت \`friend\` كثيراً بين صنفين، فربما يجب دمجهما أو إعادة تقسيم المسؤوليات.

## الاستخدامات المعقولة
1. عوامل التدفق \`<<\` و \`>>\`.
2. العوامل الثنائية المتماثلة التي تحتاج البيانات الخاصة.
3. صنفان مترابطان بشدة (مثل حاوية ومُكرِّرها iterator).
4. الاختبارات أحياناً.

## تمرين
في المثال الكامل (المدقق Auditor والحساب البنكي)، حوّل دالة \`emergencyWithdraw\` إلى دالة عضو عامة في BankAccount مع شرط تحقق. أيهما أوضح في رأيك، ولماذا؟
`,
      quiz: {
        question: 'إذا أعلن الصنف A أن الصنف B صديق له، فأي العبارات صحيحة؟',
        options: ['A يصبح صديقاً لـ B أيضاً', 'B يصل إلى أعضاء A الخاصة، والأصناف المشتقة من B لا ترث ذلك', 'كل أصدقاء B يصبحون أصدقاء لـ A', 'B يرث من A'],
        correctAnswer: 1,
        explanation: 'الصداقة ليست متبادلة ولا متعدية ولا تورث.',
      },
    },
    'cpp-adv-11': {
      description: 'أصناف داخل أصناف لإخفاء التفاصيل (مثل Node داخل LinkedList)، الأنواع المتداخلة، والأصناف المحلية مقابل lambda',
      content: md`
# الأصناف المتداخلة والمحلية

## الصنف المتداخل (Nested Class)
صنف معرّف **داخل** صنف آخر. الاستخدام الأهم: إخفاء تفاصيل التنفيذ. عقدة القائمة المرتبطة لا معنى لها خارج القائمة:
\`\`\`cpp
#include <iostream>
#include <memory>
using namespace std;

class IntList {
    struct Node {                        // private: لا أحد خارج IntList يراه
        int value;
        unique_ptr<Node> next;
        explicit Node(int v) : value(v) {}
    };
    unique_ptr<Node> head;
    size_t count = 0;
public:
    void pushFront(int v) {
        auto n = make_unique<Node>(v);
        n->next = move(head);
        head = move(n);
        ++count;
    }
    void print() const {
        for (const Node* p = head.get(); p; p = p->next.get()) cout << p->value << ' ';
        cout << '\n';
    }
    size_t size() const { return count; }
};

int main() {
    IntList list;
    list.pushFront(3); list.pushFront(2); list.pushFront(1);
    list.print();                  // 1 2 3
    // IntList::Node n(5);         ← خطأ: Node خاص
}
\`\`\`

## قواعد الوصول
- الصنف المتداخل **عضو** في الصنف الخارجي، فيصل إلى أعضائه الخاصة (منذ C++11) — لكنه يحتاج **كائناً** منه، لأنه لا يملك this خاصاً بالخارجي.
- الصنف الخارجي **لا** يصل إلى الأعضاء الخاصة للمتداخل (لذلك جعلنا Node بنية struct بأعضاء public؛ فهي مخفية أصلاً لأنها private داخل IntList).
- إذا كان المتداخل public، يُستخدم من الخارج بالاسم الكامل: \`Outer::Inner\`.

## أنواع متداخلة عامة
مكتبة STL تستخدم هذا كثيراً: \`vector<int>::iterator\`، \`map<K,V>::value_type\`. يمكنك فعل المثل:
\`\`\`cpp
class Order {
public:
    enum class Status { Pending, Paid, Shipped };    // نوع متداخل عام
    void setStatus(Status s) { status = s; }
    Status getStatus() const { return status; }
private:
    Status status = Status::Pending;
};
// Order o; o.setStatus(Order::Status::Paid);
\`\`\`

## الصنف المحلي (Local Class)
صنف معرّف داخل دالة، مرئي فيها فقط. قيوده: لا أعضاء static بيانات، ولا يمكن أن يكون قالباً. كان يُستخدم لكائنات دالة صغيرة، أما اليوم فالـ **lambda** تؤدي الغرض بشكل أوضح:
\`\`\`cpp
#include <algorithm>
#include <vector>
using namespace std;

void sortDesc(vector<int>& v) {
    struct Greater { bool operator()(int a, int b) const { return a > b; } };   // صنف محلي (أسلوب قديم)
    sort(v.begin(), v.end(), Greater{});
    sort(v.begin(), v.end(), [](int a, int b) { return a > b; });              // نفس الشيء بـ lambda
}
\`\`\`

## متى تستخدم ماذا؟
| الحالة | الأداة |
|---|---|
| تفصيل تنفيذ يخص صنفاً واحداً (Node، Iterator) | صنف متداخل private |
| نوع مرتبط بالصنف يحتاجه المستخدم (Status) | نوع متداخل public |
| منطق صغير داخل دالة | lambda |

## تمرين
أضف إلى \`IntList\` صنفاً متداخلاً عاماً \`Stats\` (min, max, sum) ودالة \`Stats stats() const\` تحسبها في مرور واحد.
`,
      quiz: {
        question: 'لماذا نجعل Node صنفاً متداخلاً private داخل LinkedList؟',
        options: ['لأنه أسرع في التنفيذ', 'لإخفاء تفصيل تنفيذ لا معنى له خارج القائمة ومنع الاعتماد عليه', 'لأن C++ تمنع تعريفه خارجها', 'لتوفير الذاكرة'],
        correctAnswer: 1,
        explanation: 'المستخدم يتعامل مع واجهة القائمة فقط؛ إخفاء Node يسمح بتغيير التنفيذ لاحقاً دون كسر كود أحد.',
      },
    },
    'cpp-adv-12': {
      description: 'مشروع ختامي: نظام مكتبة يجمع الأصناف والتغليف والوراثة وتعدد الأشكال والمؤشرات الذكية',
      content: md`
# مشروع: نظام إدارة مكتبة

حان وقت جمع كل ما تعلمته في برنامج واحد. اقرأ الكود الكامل في قسم المثال، ثم ارجع إلى هذا الشرح لتفهم **قرارات التصميم**.

## المتطلبات
- إدارة الكتب والأعضاء.
- استعارة الكتب وإرجاعها مع منع استعارة كتاب مُعار.
- البحث والتقارير.

## خريطة الأصناف
\`\`\`text
Person (مجرد)          Book
  ├── Member             (العنوان، المؤلف، متاح؟)
  └── Librarian
Library: تملك الكتب والأعضاء (vector<unique_ptr<...>>)
\`\`\`

## قرارات التصميم ولماذا
| القرار | الدرس | السبب |
|---|---|---|
| \`Person\` بدالة افتراضية خالصة | التجريد | لا يوجد "شخص عام" في المكتبة؛ كل شخص إما عضو أو موظف |
| مدمّر \`Person\` افتراضي | تعدد الأشكال | الأشخاص يُحذفون عبر مؤشر للأب |
| بيانات Book خاصة + دوال \`borrow/returnBook\` | التغليف | القاعدة "لا يُعار كتاب مُعار" محمية داخل Book |
| \`Library\` تملك الكائنات بـ \`unique_ptr\` | إدارة الموارد / Rule of Zero | لا delete يدوي ولا تسرب، ولا حاجة لمدمّر مكتوب |
| \`Member\` يخزن معرفات/مؤشرات غير مالكة للكتب | الملكية | المكتبة هي المالك الوحيد؛ العضو "يشير" فقط |

## خطوات العمل التي ننصح بها في مشاريعك
1. اكتب **قائمة الأسماء** في المتطلبات: الأسماء المرشحة لتكون أصنافاً (كتاب، عضو، مكتبة).
2. اكتب **الأفعال**: دوال مرشحة (استعارة، إرجاع، بحث).
3. حدد **من يملك من**: الملكية الواضحة تمنع معظم أخطاء الذاكرة.
4. حدد **القواعد** لكل صنف واحمها بالتغليف.
5. ابنِ خطوة خطوة وشغّل بعد كل خطوة.

## مراجعة ذاتية
قبل التحسينات، أجب دون النظر للكود:
- لماذا لا يمكن كتابة \`Person p("x");\`؟
- ماذا سيحدث لو كان مدمّر Person غير افتراضي؟
- لماذا لا يحتاج Library مُنشئ نسخ مكتوباً؟ وهل يمكن نسخ Library أصلاً؟ (تلميح: \`unique_ptr\` غير قابل للنسخ)

## تحسينات مقترحة (تمارين)
1. **حد الاستعارة**: العضو يستعير 3 كتب كحد أقصى؛ احمِ القاعدة داخل Member.
2. **تواريخ الإرجاع**: أضف عدد أيام الاستعارة واحسب الغرامة عند التأخير.
3. **أنواع مواد**: اجعل \`Item\` صنفاً مجرداً يرث منه \`Book\` و \`Magazine\` (المجلات لا تُعار) — وطبّق تعدد الأشكال في \`canBorrow()\`.
4. **عامل الطباعة**: أضف \`operator<<\` لـ Book و Member.
5. **البحث**: ابحث بجزء من العنوان مع تجاهل حالة الأحرف.

بعد هذا المشروع أنت جاهز لدورة **C++ المتقدم**: القوالب و STL والنقل والاستثناءات والتزامن.
`,
    },
  },
  newLessons: [
    {
      id: 'cpp-oop-lifetime',
      title: 'دورة حياة الكائن و RAII',
      description: 'متى يُبنى الكائن ومتى يُهدم، ترتيب الأعضاء، والنمط الأهم في C++: ربط الموارد بعمر الكائن (RAII)',
      language: 'cpp',
      xpReward: 60,
      content: md`
# دورة حياة الكائن و RAII

أهم فكرة تميّز C++ عن لغات مثل Python و Java: **المدمّر يُستدعى في لحظة محددة ومعروفة** — عند انتهاء عمر الكائن. لا يوجد جامع قمامة ينتظر. هذا يتيح النمط الأقوى في اللغة: **RAII**.

## متى ينتهي عمر الكائن؟
| نوع الكائن | يُبنى | يُهدم |
|---|---|---|
| محلي (على الـ Stack) | عند تعريفه | عند نهاية الكتلة \`}\` التي عُرّف فيها |
| عضو في كائن آخر | قبل جسم مُنشئ الحاوي | بعد جسم مدمّر الحاوي |
| عنصر في vector | عند الإضافة | عند الحذف أو تدمير الـ vector |
| على الـ Heap (\`new\`) | عند \`new\` | عند \`delete\` فقط (أو عبر مؤشر ذكي) |
| عام أو static | قبل main (أو عند أول استخدام) | بعد انتهاء main |

## ترتيب الهدم عكس ترتيب البناء
\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

struct Noisy {
    string n;
    explicit Noisy(string s) : n(s) { cout << "بناء " << n << '\n'; }
    ~Noisy() { cout << "هدم " << n << '\n'; }
};

int main() {
    Noisy a("a");
    {
        Noisy b("b");
        Noisy c("c");
    }                         // هدم c ثم هدم b
    Noisy d("d");
}                             // هدم d ثم هدم a
\`\`\`
كالأطباق المكدسة: آخر ما وُضع أول ما يُرفع. هذا منطقي: \`c\` قد يعتمد على \`b\`، فيجب أن يُهدم قبله.

## ترتيب بناء الأعضاء
الأعضاء تُبنى بترتيب **تصريحها في الصنف** دائماً — وليس بترتيب قائمة التهيئة:
\`\`\`cpp
class Buffer {
    int size;
    int* data;        // مُصرَّح بعد size ← يُبنى بعده
public:
    explicit Buffer(int n) : size(n), data(new int[n]) {}   // آمن: size جاهز قبل data
    ~Buffer() { delete[] data; }
    Buffer(const Buffer&) = delete;
    Buffer& operator=(const Buffer&) = delete;
};
\`\`\`
لو صُرّح عن \`data\` قبل \`size\` واستخدمت \`size\` لتهيئة \`data\`، لقرأت قيمة غير مهيأة. المترجم ينبّهك مع \`-Wall\` (تحذير \`-Wreorder\`).

## RAII: Resource Acquisition Is Initialization
الاسم غريب لكن الفكرة بسيطة:
> اربط كل **مورد** (ذاكرة، ملف، قفل، اتصال) بـ**كائن**: احصل عليه في المُنشئ وحرّره في المدمّر.

النتيجة: المورد يُحرر **تلقائياً ودائماً** عند خروج الكائن من النطاق — سواء انتهت الدالة طبيعياً، أو بـ \`return\` مبكر، أو برمي استثناء.

### بدون RAII
\`\`\`cpp
#include <cstdio>

bool saveReport(bool fail) {
    std::FILE* f = std::fopen("report.txt", "w");
    if (!f) return false;
    if (fail) return false;          // ❌ نسينا fclose ← تسرب
    std::fputs("ok", f);
    std::fclose(f);
    return true;
}
\`\`\`
كل مسار خروج يجب أن يتذكر التحرير. مع عشرة مسارات وثلاثة موارد يصبح هذا مستحيلاً.

### مع RAII
\`\`\`cpp
#include <fstream>

bool saveReport2(bool fail) {
    std::ofstream f("report.txt");   // المُنشئ يفتح الملف
    if (!f) return false;
    if (fail) return false;          // ✅ المدمّر يغلق الملف
    f << "ok";
    return true;
}                                    // ✅ وهنا أيضاً
\`\`\`

## RAII في كل مكان في المكتبة القياسية
| المورد | الصنف |
|---|---|
| ذاكرة ديناميكية | \`unique_ptr\`، \`shared_ptr\`، \`vector\`، \`string\` |
| ملفات | \`ifstream\`، \`ofstream\` |
| أقفال الخيوط | \`lock_guard\`، \`unique_lock\` |
| الخيوط (C++20) | \`jthread\` (ينتظر الخيط تلقائياً) |

لهذا نادراً ما تكتب \`delete\` في C++ الحديثة: تختار صنفاً يطبق RAII.

## قواعد عند كتابة صنف RAII
1. احصل على المورد في المُنشئ؛ إن فشل، لا تُنشئ كائناً نصف جاهز (ارمِ استثناء — في دورة المتقدم).
2. حرّر في المدمّر، و**لا ترمِ استثناءات من المدمّر**.
3. امنع النسخ (\`= delete\`) أو عرّفه بشكل صحيح — موضوع الدرس القادم "النسخ والنقل".

## تمرين
اكتب صنف \`ScopedTimer\` يسجّل الوقت في مُنشئه (\`std::chrono::steady_clock::now()\`) ويطبع المدة المنقضية في مدمّره. ضعه في أول دالة بطيئة وشاهد كيف يقيس زمنها مهما كانت طريقة خروجها.
`,
      codeExample: `#include <iostream>
#include <string>
using namespace std;

// يطبع عند البناء والهدم لنرى دورة الحياة
class Tracer {
    string name;
public:
    explicit Tracer(string n) : name(move(n)) { cout << "  + " << name << "\\n"; }
    ~Tracer() { cout << "  - " << name << "\\n"; }
};

class Car {
    Tracer engine{"المحرك"};   // يُبنى أولاً (ترتيب التصريح)
    Tracer wheels{"العجلات"};  // ثم هذا
public:
    Car() { cout << "  السيارة جاهزة\\n"; }
    ~Car() { cout << "  تفكيك السيارة\\n"; }   // جسم المدمّر قبل هدم الأعضاء
};

// RAII: الكائن يحصل على المورد في المُنشئ ويحرره في المدمّر
class Connection {
    string server;
public:
    explicit Connection(string s) : server(move(s)) { cout << "فتح الاتصال بـ " << server << "\\n"; }
    ~Connection() { cout << "إغلاق الاتصال بـ " << server << "\\n"; }
    Connection(const Connection&) = delete;             // مورد لا يُنسخ
    Connection& operator=(const Connection&) = delete;
    void send(const string& msg) const { cout << "إرسال: " << msg << "\\n"; }
};

bool process(int value) {
    Connection conn("db.local");
    if (value < 0) {
        cout << "قيمة سالبة: خروج مبكر\\n";
        return false;          // المدمّر يُستدعى هنا...
    }
    conn.send(to_string(value));
    return true;
}                              // ...وهنا

int main() {
    cout << "1) ترتيب البناء والهدم:\\n";
    {
        Car c;
    }

    cout << "\\n2) نطاقات متداخلة:\\n";
    Tracer a("a");
    {
        Tracer b("b");
        Tracer c("c");
    }                          // - c ثم - b

    cout << "\\n3) RAII مع الخروج المبكر:\\n";
    process(5);
    process(-1);

    cout << "\\nنهاية main\\n";
    return 0;
}                              // - a`,
      quiz: {
        question: 'ما الفائدة الأساسية لنمط RAII؟',
        options: [
          'تسريع البرنامج',
          'تحرير المورد تلقائياً عند انتهاء عمر الكائن مهما كانت طريقة الخروج (return مبكر أو استثناء)',
          'منع الوراثة',
          'تقليل حجم الملف التنفيذي',
        ],
        correctAnswer: 1,
        explanation: 'ربط المورد بعمر كائن يجعل المدمّر يحرره دائماً، فلا تعتمد على تذكّر التحرير في كل مسار.',
      },
    },
  ],
};

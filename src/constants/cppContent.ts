/**
 * دروس C++ الموسعة - من الصفر إلى الاحتراف
 * Kodax C++ Curriculum
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس C++ للمبتدئين =====
export const CPP_LESSONS_BEGINNER: Lesson[] = [
  {
    id: 'cpp-1',
    courseId: 'cpp-basics',
    title: 'مرحباً C++!',
    description: 'أول برنامج في عالم C++',
    content: `
# مرحباً بك في C++!

C++ لغة برمجة قوية وسريعة جداً.

## لماذا C++؟
- 🚀 سرعة عالية جداً
- 🎮 مستخدمة في الألعاب
- 💻 أنظمة التشغيل
- 🤖 الذكاء الاصطناعي

## هيكل البرنامج
\`\`\`cpp
#include <iostream>  // مكتبة الإدخال/الإخراج

int main() {        // الدالة الرئيسية
    // الكود هنا
    return 0;       // انتهى بنجاح
}
\`\`\`

## قواعد أساسية
- كل أمر ينتهي بـ ;
- الأقواس {} للكتل
- حساسة لحالة الأحرف
`,
    codeExample: `#include <iostream>
using namespace std;

int main() {
    // طباعة نص
    cout << "مرحباً بالعالم!" << endl;
    cout << "Hello, World!" << endl;
    
    // طباعة أرقام
    cout << 2024 << endl;
    cout << 3.14 << endl;
    
    // طباعة عدة قيم
    cout << "السنة: " << 2024 << endl;
    
    // طباعة بدون سطر جديد
    cout << "أول ";
    cout << "ثاني" << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 100,
    order: 1,
    quiz: {
      question: 'ما الدالة الرئيسية في برنامج C++؟',
      options: ['start()', 'main()', 'begin()', 'run()'],
      correctAnswer: 1,
      explanation: 'main() هي نقطة بداية كل برنامج C++',
    },
  },
  {
    id: 'cpp-2',
    courseId: 'cpp-basics',
    title: 'المتغيرات والأنواع',
    description: 'تخزين البيانات في C++',
    content: `
# المتغيرات في C++

المتغير = مكان في الذاكرة لتخزين البيانات.

## أنواع البيانات الأساسية

| النوع | الحجم | المدى |
|-------|-------|-------|
| int | 4 bytes | ±2 مليار |
| float | 4 bytes | 6-7 أرقام دقة |
| double | 8 bytes | 15-16 أرقام دقة |
| char | 1 byte | حرف واحد |
| bool | 1 byte | true/false |
| string | متغير | نص |

## التصريح والتهيئة
\`\`\`cpp
int x;        // تصريح
x = 10;       // تهيئة
int y = 20;   // تصريح وتهيئة معاً
\`\`\`

## const
للثوابت التي لا تتغير
`,
    codeExample: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // الأعداد الصحيحة
    int age = 25;
    int year = 2024;
    
    // الأعداد العشرية
    float price = 99.99f;
    double pi = 3.14159265359;
    
    // الأحرف
    char grade = 'A';
    char letter = 65;  // 'A' بـ ASCII
    
    // المنطقي
    bool isStudent = true;
    bool isPassed = false;
    
    // النصوص
    string name = "أحمد";
    string message = "مرحباً بك في C++";
    
    // الثوابت
    const double TAX_RATE = 0.15;
    const int MAX_USERS = 100;
    
    // طباعة
    cout << "الاسم: " << name << endl;
    cout << "العمر: " << age << endl;
    cout << "السعر: " << price << endl;
    
    // حجم الأنواع
    cout << "حجم int: " << sizeof(int) << " bytes" << endl;
    cout << "حجم double: " << sizeof(double) << " bytes" << endl;
    
    // تحويل الأنواع
    int num = 10;
    double d = static_cast<double>(num);
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 100,
    order: 2,
    quiz: {
      question: 'ما النوع المناسب لتخزين رقم عشري بدقة عالية؟',
      options: ['int', 'float', 'double', 'char'],
      correctAnswer: 2,
      explanation: 'double يوفر دقة 15-16 رقم، أكثر من float',
    },
  },
  {
    id: 'cpp-3',
    courseId: 'cpp-basics',
    title: 'الإدخال والإخراج',
    description: 'cin و cout',
    content: `
# الإدخال والإخراج في C++

## cout للإخراج
\`\`\`cpp
cout << "نص" << endl;
\`\`\`

## cin للإدخال
\`\`\`cpp
cin >> variable;
\`\`\`

## getline للنصوص
\`\`\`cpp
getline(cin, stringVar);
\`\`\`

## ملاحظات
- cin تتوقف عند المسافة
- getline تقرأ السطر كاملاً
- endl أو "\\n" للسطر الجديد

## Stream Manipulators
- fixed, setprecision للأرقام
- setw للعرض
`,
    codeExample: `#include <iostream>
#include <string>
#include <iomanip>  // للتنسيق
using namespace std;

int main() {
    // إدخال رقم
    int age;
    cout << "أدخل عمرك: ";
    cin >> age;
    cout << "عمرك: " << age << endl;
    
    // إدخال عدة قيم
    int x, y;
    cout << "أدخل رقمين: ";
    cin >> x >> y;
    cout << "المجموع: " << x + y << endl;
    
    // إدخال نص (كلمة واحدة)
    string firstName;
    cout << "أدخل اسمك الأول: ";
    cin >> firstName;
    
    // تنظيف buffer قبل getline
    cin.ignore();
    
    // إدخال نص كامل (مع مسافات)
    string fullName;
    cout << "أدخل اسمك الكامل: ";
    getline(cin, fullName);
    cout << "مرحباً " << fullName << endl;
    
    // تنسيق الأرقام
    double pi = 3.14159265359;
    cout << fixed << setprecision(2);
    cout << "Pi = " << pi << endl;  // 3.14
    
    // تنسيق العرض
    cout << setw(10) << "Name" << setw(5) << "Age" << endl;
    cout << setw(10) << "Ahmed" << setw(5) << 25 << endl;
    cout << setw(10) << "Mohammad" << setw(5) << 30 << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 100,
    order: 3,
    quiz: {
      question: 'ما الدالة المستخدمة لقراءة نص كامل مع مسافات؟',
      options: ['cin >>', 'getline()', 'scanf()', 'read()'],
      correctAnswer: 1,
      explanation: 'getline() تقرأ السطر كاملاً بما فيه المسافات',
    },
  },
  {
    id: 'cpp-4',
    courseId: 'cpp-basics',
    title: 'العمليات الحسابية',
    description: 'الجمع والطرح والمزيد',
    content: `
# العمليات في C++

## العمليات الحسابية
| العملية | الرمز |
|---------|-------|
| جمع | + |
| طرح | - |
| ضرب | * |
| قسمة | / |
| باقي القسمة | % |

## عمليات الإسناد المركبة
\`+=\`, \`-=\`, \`*=\`, \`/=\`, \`%=\`

## الزيادة والنقصان
- \`++i\` أو \`i++\`: زيادة 1
- \`--i\` أو \`i--\`: نقصان 1

## قسمة الأعداد الصحيحة
تنتج عدد صحيح (يحذف الكسر)
`,
    codeExample: `#include <iostream>
#include <cmath>  // للدوال الرياضية
using namespace std;

int main() {
    int a = 10, b = 3;
    
    // العمليات الأساسية
    cout << "a + b = " << (a + b) << endl;  // 13
    cout << "a - b = " << (a - b) << endl;  // 7
    cout << "a * b = " << (a * b) << endl;  // 30
    cout << "a / b = " << (a / b) << endl;  // 3 (قسمة صحيحة!)
    cout << "a % b = " << (a % b) << endl;  // 1
    
    // قسمة عشرية
    double x = 10.0, y = 3.0;
    cout << "x / y = " << (x / y) << endl;  // 3.333...
    
    // عمليات الإسناد
    int num = 10;
    num += 5;   // num = num + 5 = 15
    num -= 3;   // num = 12
    num *= 2;   // num = 24
    num /= 4;   // num = 6
    
    // الزيادة والنقصان
    int i = 5;
    cout << i++ << endl;  // 5 (يطبع ثم يزيد)
    cout << i << endl;    // 6
    cout << ++i << endl;  // 7 (يزيد ثم يطبع)
    
    // الدوال الرياضية
    cout << "pow(2, 3) = " << pow(2, 3) << endl;    // 8
    cout << "sqrt(16) = " << sqrt(16) << endl;      // 4
    cout << "abs(-5) = " << abs(-5) << endl;        // 5
    cout << "ceil(3.2) = " << ceil(3.2) << endl;    // 4
    cout << "floor(3.8) = " << floor(3.8) << endl;  // 3
    cout << "round(3.5) = " << round(3.5) << endl;  // 4
    
    // أمثلة عملية
    double price = 100;
    double discount = 20;
    double finalPrice = price - (price * discount / 100);
    cout << "السعر النهائي: " << finalPrice << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 100,
    order: 4,
    quiz: {
      question: 'ما نتيجة 10 / 3 في C++ (كلاهما int)؟',
      options: ['3.333', '3', '4', '3.0'],
      correctAnswer: 1,
      explanation: 'قسمة عددين صحيحين تنتج عدد صحيح، يُحذف الكسر',
    },
  },
  {
    id: 'cpp-5',
    courseId: 'cpp-basics',
    title: 'الشروط if/else',
    description: 'اتخاذ القرارات',
    content: `
# الجمل الشرطية في C++

## if الأساسية
\`\`\`cpp
if (condition) {
    // كود
}
\`\`\`

## if-else
\`\`\`cpp
if (condition) {
    // إذا صحيح
} else {
    // إذا خاطئ
}
\`\`\`

## عوامل المقارنة
\`==\`, \`!=\`, \`>\`, \`<\`, \`>=\`, \`<=\`

## العوامل المنطقية
- \`&&\`: و (AND)
- \`||\`: أو (OR)
- \`!\`: نفي (NOT)

## switch
للاختيار من قيم متعددة
`,
    codeExample: `#include <iostream>
using namespace std;

int main() {
    // if بسيطة
    int age = 20;
    if (age >= 18) {
        cout << "أنت بالغ" << endl;
    }
    
    // if-else
    int score = 75;
    if (score >= 60) {
        cout << "ناجح ✅" << endl;
    } else {
        cout << "راسب ❌" << endl;
    }
    
    // if-else if-else
    if (score >= 90) {
        cout << "ممتاز" << endl;
    } else if (score >= 80) {
        cout << "جيد جداً" << endl;
    } else if (score >= 70) {
        cout << "جيد" << endl;
    } else if (score >= 60) {
        cout << "مقبول" << endl;
    } else {
        cout << "راسب" << endl;
    }
    
    // العوامل المنطقية
    bool hasLicense = true;
    if (age >= 18 && hasLicense) {
        cout << "يمكنك القيادة 🚗" << endl;
    }
    
    // Ternary operator
    string status = (age >= 18) ? "بالغ" : "قاصر";
    cout << status << endl;
    
    // switch
    int day = 3;
    switch (day) {
        case 1:
            cout << "السبت" << endl;
            break;
        case 2:
            cout << "الأحد" << endl;
            break;
        case 3:
            cout << "الإثنين" << endl;
            break;
        default:
            cout << "يوم غير معروف" << endl;
    }
    
    // switch مع char
    char grade = 'A';
    switch (grade) {
        case 'A':
            cout << "ممتاز!" << endl;
            break;
        case 'B':
            cout << "جيد جداً" << endl;
            break;
        case 'C':
            cout << "جيد" << endl;
            break;
        default:
            cout << "تحتاج تحسين" << endl;
    }
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 100,
    order: 5,
    quiz: {
      question: 'ما العامل المنطقي الذي يتطلب صحة كلا الشرطين؟',
      options: ['||', '&&', '!', '=='],
      correctAnswer: 1,
      explanation: '&& (AND) يرجع true فقط إذا كان كلا الشرطين صحيحين',
    },
  },
  {
    id: 'cpp-6',
    courseId: 'cpp-basics',
    title: 'حلقة for',
    description: 'تكرار الكود عدد محدد',
    content: `
# حلقة for في C++

## الصيغة
\`\`\`cpp
for (init; condition; update) {
    // كود
}
\`\`\`

## الأجزاء الثلاثة
1. **init**: تهيئة (تنفذ مرة واحدة)
2. **condition**: الشرط (يُفحص قبل كل تكرار)
3. **update**: التحديث (بعد كل تكرار)

## Range-based for (C++11)
\`\`\`cpp
for (type var : container) {
    // كود
}
\`\`\`

## break و continue
- break: الخروج من الحلقة
- continue: تخطي التكرار الحالي
`,
    codeExample: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // for بسيطة
    for (int i = 0; i < 5; i++) {
        cout << i << " ";
    }
    cout << endl;  // 0 1 2 3 4
    
    // العد التنازلي
    for (int i = 5; i > 0; i--) {
        cout << i << " ";
    }
    cout << endl;  // 5 4 3 2 1
    
    // خطوة مختلفة
    for (int i = 0; i <= 10; i += 2) {
        cout << i << " ";
    }
    cout << endl;  // 0 2 4 6 8 10
    
    // جدول الضرب
    int num = 5;
    for (int i = 1; i <= 10; i++) {
        cout << num << " × " << i << " = " << num * i << endl;
    }
    
    // حلقات متداخلة
    for (int i = 1; i <= 3; i++) {
        for (int j = 1; j <= 3; j++) {
            cout << "(" << i << "," << j << ") ";
        }
        cout << endl;
    }
    
    // Range-based for
    int numbers[] = {1, 2, 3, 4, 5};
    for (int n : numbers) {
        cout << n << " ";
    }
    cout << endl;
    
    // مع vector
    vector<string> names = {"أحمد", "محمد", "علي"};
    for (const string& name : names) {
        cout << name << endl;
    }
    
    // break
    for (int i = 0; i < 10; i++) {
        if (i == 5) break;
        cout << i << " ";
    }
    cout << endl;  // 0 1 2 3 4
    
    // continue
    for (int i = 0; i < 10; i++) {
        if (i % 2 == 0) continue;  // تخطي الزوجية
        cout << i << " ";
    }
    cout << endl;  // 1 3 5 7 9
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 100,
    order: 6,
    quiz: {
      question: 'كم مرة تتكرر for (int i = 0; i < 5; i++)؟',
      options: ['4', '5', '6', 'لانهائي'],
      correctAnswer: 1,
      explanation: 'تتكرر 5 مرات: i = 0, 1, 2, 3, 4 (تتوقف عند i = 5)',
    },
  },
  {
    id: 'cpp-7',
    courseId: 'cpp-basics',
    title: 'حلقة while',
    description: 'التكرار بشرط',
    content: `
# حلقة while في C++

## while
\`\`\`cpp
while (condition) {
    // كود
}
\`\`\`
يفحص الشرط أولاً، قد لا تنفذ أبداً.

## do-while
\`\`\`cpp
do {
    // كود
} while (condition);
\`\`\`
تنفذ مرة واحدة على الأقل.

## متى نستخدم while؟
- عدد التكرارات غير معروف
- التكرار حتى شرط
- قراءة بيانات حتى نهاية الملف
`,
    codeExample: `#include <iostream>
using namespace std;

int main() {
    // while بسيطة
    int count = 0;
    while (count < 5) {
        cout << count << " ";
        count++;
    }
    cout << endl;  // 0 1 2 3 4
    
    // العد التنازلي
    int countdown = 5;
    while (countdown > 0) {
        cout << countdown << " ";
        countdown--;
    }
    cout << "انطلق! 🚀" << endl;
    
    // حساب المجموع
    int sum = 0;
    int num = 1;
    while (num <= 100) {
        sum += num;
        num++;
    }
    cout << "مجموع 1 إلى 100 = " << sum << endl;
    
    // do-while
    int choice;
    do {
        cout << "\\n1. خيار أ" << endl;
        cout << "2. خيار ب" << endl;
        cout << "0. خروج" << endl;
        cout << "اختيارك: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "اخترت خيار أ" << endl;
                break;
            case 2:
                cout << "اخترت خيار ب" << endl;
                break;
        }
    } while (choice != 0);
    
    // التحقق من الإدخال
    int age;
    do {
        cout << "أدخل عمرك (1-120): ";
        cin >> age;
    } while (age < 1 || age > 120);
    cout << "عمرك: " << age << endl;
    
    // إيجاد رقم في سلسلة
    int target = 7;
    int current = 0;
    while (current != target) {
        current++;
        cout << current << " ";
    }
    cout << "\\nوجدته!" << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 100,
    order: 7,
    quiz: {
      question: 'ما الفرق بين while و do-while؟',
      options: [
        'لا فرق',
        'do-while أسرع',
        'do-while تنفذ مرة على الأقل',
        'while تنفذ مرة على الأقل',
      ],
      correctAnswer: 2,
      explanation: 'do-while تفحص الشرط بعد التنفيذ، فتنفذ مرة واحدة على الأقل',
    },
  },
  {
    id: 'cpp-8',
    courseId: 'cpp-basics',
    title: 'المصفوفات Arrays',
    description: 'تخزين مجموعة من القيم',
    content: `
# المصفوفات في C++

المصفوفة = مجموعة عناصر من نفس النوع.

## التصريح والتهيئة
\`\`\`cpp
int arr[5];                    // غير مهيأة
int arr[5] = {1, 2, 3, 4, 5};  // مهيأة
int arr[] = {1, 2, 3};         // الحجم تلقائي
\`\`\`

## الوصول للعناصر
- الفهرس يبدأ من 0
- \`arr[0]\` العنصر الأول
- \`arr[size-1]\` العنصر الأخير

## ملاحظات هامة
- الحجم ثابت بعد التصريح
- لا تحقق من الحدود تلقائياً!
`,
    codeExample: `#include <iostream>
using namespace std;

int main() {
    // تصريح وتهيئة
    int numbers[5] = {10, 20, 30, 40, 50};
    
    // الوصول للعناصر
    cout << "الأول: " << numbers[0] << endl;   // 10
    cout << "الثالث: " << numbers[2] << endl;  // 30
    
    // تعديل عنصر
    numbers[0] = 100;
    cout << "الأول الجديد: " << numbers[0] << endl;
    
    // المرور على المصفوفة
    cout << "كل العناصر: ";
    for (int i = 0; i < 5; i++) {
        cout << numbers[i] << " ";
    }
    cout << endl;
    
    // Range-based for
    for (int n : numbers) {
        cout << n << " ";
    }
    cout << endl;
    
    // حساب المجموع والمتوسط
    int sum = 0;
    for (int n : numbers) {
        sum += n;
    }
    double average = (double)sum / 5;
    cout << "المجموع: " << sum << endl;
    cout << "المتوسط: " << average << endl;
    
    // إيجاد أكبر عنصر
    int maxVal = numbers[0];
    for (int n : numbers) {
        if (n > maxVal) {
            maxVal = n;
        }
    }
    cout << "الأكبر: " << maxVal << endl;
    
    // مصفوفة ثنائية الأبعاد
    int matrix[3][3] = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };
    
    cout << "\\nالمصفوفة:" << endl;
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            cout << matrix[i][j] << " ";
        }
        cout << endl;
    }
    
    // sizeof للمصفوفات
    int arr[] = {1, 2, 3, 4, 5};
    int size = sizeof(arr) / sizeof(arr[0]);
    cout << "\\nحجم المصفوفة: " << size << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 100,
    order: 8,
    quiz: {
      question: 'ما فهرس العنصر الأخير في مصفوفة حجمها 5؟',
      options: ['5', '4', '6', '-1'],
      correctAnswer: 1,
      explanation: 'الفهرس يبدأ من 0، فآخر عنصر في مصفوفة حجمها 5 هو 4',
    },
  },
  {
    id: 'cpp-9',
    courseId: 'cpp-basics',
    title: 'الدوال Functions',
    description: 'إنشاء واستخدام الدوال',
    content: `
# الدوال في C++

الدالة = كتلة كود تنفذ مهمة محددة.

## بنية الدالة
\`\`\`cpp
return_type name(parameters) {
    // كود
    return value;
}
\`\`\`

## أنواع الدوال
- void: لا ترجع قيمة
- int, double, etc: ترجع قيمة

## تمرير المعاملات
- By Value: نسخة من القيمة
- By Reference: المتغير نفسه

## Function Prototypes
التصريح قبل main
`,
    codeExample: `#include <iostream>
using namespace std;

// Function prototypes
void greet();
int add(int a, int b);
void modifyByRef(int& x);
double average(int arr[], int size);

int main() {
    // استدعاء دالة بدون معاملات
    greet();
    
    // دالة بمعاملات وقيمة مرجعة
    int result = add(5, 3);
    cout << "5 + 3 = " << result << endl;
    
    // By Reference
    int num = 10;
    cout << "قبل: " << num << endl;
    modifyByRef(num);
    cout << "بعد: " << num << endl;
    
    // دالة مع مصفوفة
    int numbers[] = {10, 20, 30, 40, 50};
    cout << "المتوسط: " << average(numbers, 5) << endl;
    
    return 0;
}

// تعريف الدوال

void greet() {
    cout << "مرحباً!" << endl;
}

int add(int a, int b) {
    return a + b;
}

void modifyByRef(int& x) {
    x *= 2;  // يعدل المتغير الأصلي
}

double average(int arr[], int size) {
    int sum = 0;
    for (int i = 0; i < size; i++) {
        sum += arr[i];
    }
    return (double)sum / size;
}

// دالة بقيمة افتراضية
void greetPerson(string name = "ضيف") {
    cout << "مرحباً " << name << "!" << endl;
}

// Function Overloading
int multiply(int a, int b) {
    return a * b;
}

double multiply(double a, double b) {
    return a * b;
}

// Inline function (للدوال القصيرة)
inline int square(int x) {
    return x * x;
}`,
    language: 'cpp',
    xpReward: 100,
    order: 9,
    quiz: {
      question: 'ما الفرق بين By Value و By Reference؟',
      options: [
        'لا فرق',
        'By Value يعدل الأصل',
        'By Reference يعدل الأصل',
        'By Reference أبطأ',
      ],
      correctAnswer: 2,
      explanation: 'By Reference يمرر المتغير نفسه فتعديله يؤثر على الأصل',
    },
  },
  {
    id: 'cpp-10',
    courseId: 'cpp-basics',
    title: 'المؤشرات Pointers',
    description: 'فهم المؤشرات والعناوين',
    content: `
# المؤشرات في C++

المؤشر = متغير يخزن عنوان متغير آخر.

## العوامل الأساسية
- \`&\`: عامل العنوان
- \`*\`: عامل الإشارة (dereferencing)

## التصريح
\`\`\`cpp
int* ptr;      // مؤشر لـ int
double* dPtr;  // مؤشر لـ double
\`\`\`

## nullptr
قيمة مؤشر فارغ (C++11)

## لماذا المؤشرات؟
- إدارة الذاكرة
- تمرير بيانات كبيرة
- هياكل البيانات
`,
    codeExample: `#include <iostream>
using namespace std;

int main() {
    // الأساسيات
    int num = 10;
    int* ptr = &num;  // ptr يشير لـ num
    
    cout << "قيمة num: " << num << endl;       // 10
    cout << "عنوان num: " << &num << endl;     // عنوان
    cout << "قيمة ptr: " << ptr << endl;       // نفس العنوان
    cout << "قيمة *ptr: " << *ptr << endl;     // 10
    
    // التعديل عبر المؤشر
    *ptr = 20;
    cout << "num بعد التعديل: " << num << endl;  // 20
    
    // nullptr
    int* nullPtr = nullptr;
    if (nullPtr == nullptr) {
        cout << "المؤشر فارغ" << endl;
    }
    
    // المؤشرات والمصفوفات
    int arr[] = {10, 20, 30, 40, 50};
    int* arrPtr = arr;  // يشير للعنصر الأول
    
    cout << "\\nالمصفوفة:" << endl;
    for (int i = 0; i < 5; i++) {
        cout << "arr[" << i << "] = " << *(arrPtr + i) << endl;
    }
    
    // Pointer Arithmetic
    cout << "\\nPointer Arithmetic:" << endl;
    cout << "*arrPtr = " << *arrPtr << endl;      // 10
    cout << "*(arrPtr+1) = " << *(arrPtr+1) << endl;  // 20
    
    arrPtr++;  // يتحرك للعنصر التالي
    cout << "*arrPtr after ++ = " << *arrPtr << endl;  // 20
    
    // const pointer
    const int* ptrToConst = &num;   // لا يمكن تغيير القيمة
    int* const constPtr = &num;     // لا يمكن تغيير العنوان
    
    // Dynamic allocation
    int* dynamicNum = new int(100);
    cout << "\\nDynamic: " << *dynamicNum << endl;
    delete dynamicNum;  // تحرير الذاكرة!
    
    // Dynamic array
    int* dynamicArr = new int[5]{1, 2, 3, 4, 5};
    for (int i = 0; i < 5; i++) {
        cout << dynamicArr[i] << " ";
    }
    cout << endl;
    delete[] dynamicArr;  // تحرير المصفوفة
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 120,
    order: 10,
    quiz: {
      question: 'ماذا يُرجع العامل & قبل اسم متغير؟',
      options: ['قيمة المتغير', 'عنوان المتغير', 'نوع المتغير', 'حجم المتغير'],
      correctAnswer: 1,
      explanation: 'العامل & (address-of) يُرجع عنوان المتغير في الذاكرة',
    },
  },
];

// ===== دروس المؤشرات والذاكرة =====
export const CPP_LESSONS_POINTERS: Lesson[] = [
  {
    id: 'cpp-ptr-1',
    courseId: 'cpp-pointers',
    title: 'مقدمة في المؤشرات',
    description: 'فهم المؤشرات والعناوين',
    content: `
# المؤشرات في C++

المؤشر = متغير يخزن عنوان متغير آخر في الذاكرة.

## لماذا المؤشرات مهمة؟
- 🎯 التحكم المباشر بالذاكرة
- 🚀 أداء أفضل (تمرير بالمرجع)
- 📦 هياكل البيانات الديناميكية
- 🔗 التعامل مع المصفوفات

## العوامل الأساسية
| العامل | الاسم | الوظيفة |
|--------|-------|---------|
| \`&\` | Address-of | يُرجع عنوان المتغير |
| \`*\` | Dereference | يصل للقيمة عبر العنوان |

## التصريح عن مؤشر
\`\`\`cpp
int* ptr;      // مؤشر لعدد صحيح
double* dPtr;  // مؤشر لعدد عشري
char* cPtr;    // مؤشر لحرف
\`\`\`
`,
    codeExample: `#include <iostream>
using namespace std;

int main() {
    // متغير عادي
    int num = 42;
    
    // الحصول على العنوان
    cout << "قيمة num: " << num << endl;
    cout << "عنوان num: " << &num << endl;
    
    // تصريح مؤشر وتهيئته
    int* ptr = &num;  // ptr يشير لـ num
    
    cout << "\\n=== معلومات المؤشر ===" << endl;
    cout << "قيمة ptr (العنوان): " << ptr << endl;
    cout << "قيمة *ptr (القيمة): " << *ptr << endl;
    cout << "عنوان ptr نفسه: " << &ptr << endl;
    
    // تعديل القيمة عبر المؤشر
    *ptr = 100;
    cout << "\\nبعد *ptr = 100:" << endl;
    cout << "num = " << num << endl;  // 100!
    
    // تغيير المؤشر ليشير لمتغير آخر
    int other = 200;
    ptr = &other;
    cout << "\\nبعد تغيير ptr:" << endl;
    cout << "*ptr = " << *ptr << endl;  // 200
    cout << "num = " << num << endl;    // 100 (لم يتغير)
    
    // حجم المؤشر
    cout << "\\nحجم المؤشر: " << sizeof(ptr) << " bytes" << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 120,
    order: 1,
    quiz: {
      question: 'ماذا يُخزن المؤشر؟',
      options: ['قيمة المتغير', 'اسم المتغير', 'عنوان المتغير', 'نوع المتغير'],
      correctAnswer: 2,
      explanation: 'المؤشر يخزن عنوان (موقع) متغير في الذاكرة',
    },
  },
  {
    id: 'cpp-ptr-2',
    courseId: 'cpp-pointers',
    title: 'المؤشرات والدوال',
    description: 'تمرير بالمرجع عبر المؤشرات',
    content: `
# المؤشرات مع الدوال

## طرق تمرير المعاملات
1. **By Value**: نسخة (الأصل لا يتغير)
2. **By Pointer**: عنوان (يمكن تغيير الأصل)
3. **By Reference**: مرجع (أسهل من المؤشر)

## متى نستخدم المؤشرات؟
- تعديل أكثر من قيمة
- تمرير بيانات كبيرة
- التعامل مع المصفوفات
- إرجاع عدة قيم

## إرجاع مؤشر من دالة
⚠️ لا تُرجع مؤشر لمتغير محلي!
`,
    codeExample: `#include <iostream>
using namespace std;

// By Value - لا يغير الأصل
void incrementByValue(int x) {
    x++;
    cout << "داخل الدالة: " << x << endl;
}

// By Pointer - يغير الأصل
void incrementByPointer(int* ptr) {
    (*ptr)++;
    cout << "داخل الدالة: " << *ptr << endl;
}

// By Reference - الأسهل
void incrementByReference(int& ref) {
    ref++;
    cout << "داخل الدالة: " << ref << endl;
}

// تبديل قيمتين باستخدام مؤشرات
void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// إرجاع عدة قيم
void divideWithRemainder(int dividend, int divisor, 
                         int* quotient, int* remainder) {
    *quotient = dividend / divisor;
    *remainder = dividend % divisor;
}

// إرجاع أكبر عنصر (مؤشر)
int* findMax(int* arr, int size) {
    int* maxPtr = arr;
    for (int i = 1; i < size; i++) {
        if (arr[i] > *maxPtr) {
            maxPtr = &arr[i];
        }
    }
    return maxPtr;
}

int main() {
    int num = 10;
    
    cout << "=== By Value ===" << endl;
    incrementByValue(num);
    cout << "بعد الدالة: " << num << endl;  // 10
    
    cout << "\\n=== By Pointer ===" << endl;
    incrementByPointer(&num);
    cout << "بعد الدالة: " << num << endl;  // 11
    
    cout << "\\n=== By Reference ===" << endl;
    incrementByReference(num);
    cout << "بعد الدالة: " << num << endl;  // 12
    
    cout << "\\n=== Swap ===" << endl;
    int a = 5, b = 10;
    cout << "قبل: a=" << a << ", b=" << b << endl;
    swap(&a, &b);
    cout << "بعد: a=" << a << ", b=" << b << endl;
    
    cout << "\\n=== إرجاع عدة قيم ===" << endl;
    int q, r;
    divideWithRemainder(17, 5, &q, &r);
    cout << "17 ÷ 5 = " << q << " والباقي " << r << endl;
    
    cout << "\\n=== إرجاع مؤشر ===" << endl;
    int arr[] = {3, 7, 2, 9, 5};
    int* maxPtr = findMax(arr, 5);
    cout << "أكبر عنصر: " << *maxPtr << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 120,
    order: 2,
    quiz: {
      question: 'كيف نمرر متغير ليتم تعديله داخل دالة؟',
      options: ['By Value', 'By Name', 'By Pointer أو Reference', 'By Copy'],
      correctAnswer: 2,
      explanation: 'By Pointer أو Reference يسمحان بتعديل المتغير الأصلي',
    },
  },
  {
    id: 'cpp-ptr-3',
    courseId: 'cpp-pointers',
    title: 'المؤشرات والمصفوفات',
    description: 'العلاقة بين المؤشرات والمصفوفات',
    content: `
# المؤشرات والمصفوفات

## العلاقة الأساسية
اسم المصفوفة = مؤشر للعنصر الأول

\`\`\`cpp
int arr[5];
int* ptr = arr;  // مثل &arr[0]
\`\`\`

## Pointer Arithmetic
- \`ptr + 1\`: العنصر التالي
- \`ptr - 1\`: العنصر السابق
- \`ptr[i]\`: مثل \`*(ptr + i)\`

## الفرق بين المؤشر والمصفوفة
- المصفوفة: حجم ثابت، لا يمكن إعادة توجيهها
- المؤشر: يمكن تغييره ليشير لأي مكان
`,
    codeExample: `#include <iostream>
using namespace std;

// دالة تستقبل مصفوفة (تتحول لمؤشر)
void printArray(int* arr, int size) {
    for (int i = 0; i < size; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
}

// المرور باستخدام مؤشر
void printWithPointer(int* start, int* end) {
    while (start != end) {
        cout << *start << " ";
        start++;
    }
    cout << endl;
}

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int size = 5;
    
    // اسم المصفوفة = مؤشر للعنصر الأول
    cout << "arr = " << arr << endl;
    cout << "&arr[0] = " << &arr[0] << endl;
    cout << "نفس العنوان! ✓" << endl;
    
    // الوصول بعدة طرق
    cout << "\\n=== طرق الوصول ===" << endl;
    cout << "arr[0] = " << arr[0] << endl;
    cout << "*arr = " << *arr << endl;
    cout << "*(arr+0) = " << *(arr+0) << endl;
    
    cout << "arr[2] = " << arr[2] << endl;
    cout << "*(arr+2) = " << *(arr+2) << endl;
    
    // Pointer Arithmetic
    cout << "\\n=== Pointer Arithmetic ===" << endl;
    int* ptr = arr;
    
    cout << "*ptr = " << *ptr << endl;        // 10
    cout << "*(ptr+1) = " << *(ptr+1) << endl; // 20
    cout << "*(ptr+2) = " << *(ptr+2) << endl; // 30
    
    ptr++;  // يتحرك بحجم int (4 bytes)
    cout << "بعد ptr++: *ptr = " << *ptr << endl;  // 20
    
    ptr += 2;
    cout << "بعد ptr+=2: *ptr = " << *ptr << endl; // 40
    
    // المسافة بين مؤشرين
    int* start = arr;
    int* end = arr + 4;
    cout << "\\nالمسافة: " << (end - start) << " عناصر" << endl;
    
    // المرور على المصفوفة
    cout << "\\n=== المرور ===" << endl;
    
    cout << "بالفهرس: ";
    for (int i = 0; i < size; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    
    cout << "بالمؤشر: ";
    for (int* p = arr; p < arr + size; p++) {
        cout << *p << " ";
    }
    cout << endl;
    
    // استخدام الدوال
    cout << "\\nباستخدام دالة: ";
    printArray(arr, size);
    
    cout << "بمؤشري البداية والنهاية: ";
    printWithPointer(arr, arr + size);
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 130,
    order: 3,
    quiz: {
      question: 'ما قيمة *(arr + 2) إذا كانت arr = {10, 20, 30, 40}؟',
      options: ['10', '20', '30', '40'],
      correctAnswer: 2,
      explanation: 'arr + 2 يشير للعنصر الثالث (الفهرس 2) وهو 30',
    },
  },
  {
    id: 'cpp-ptr-4',
    courseId: 'cpp-pointers',
    title: 'الذاكرة الديناميكية - new و delete',
    description: 'حجز وتحرير الذاكرة يدوياً',
    content: `
# الذاكرة الديناميكية

## أنواع الذاكرة
1. **Stack**: تلقائية، سريعة، محدودة
2. **Heap**: يدوية، كبيرة، تحتاج إدارة

## new و delete
\`\`\`cpp
int* ptr = new int;      // حجز
delete ptr;              // تحرير

int* arr = new int[10];  // مصفوفة
delete[] arr;            // تحرير مصفوفة
\`\`\`

## قواعد ذهبية
1. كل new يحتاج delete
2. لا تستخدم بعد delete
3. لا تحرر نفس الذاكرة مرتين
4. اجعل المؤشر nullptr بعد delete
`,
    codeExample: `#include <iostream>
using namespace std;

int main() {
    // ===== حجز متغير واحد =====
    int* numPtr = new int;      // حجز بدون تهيئة
    *numPtr = 42;
    cout << "القيمة: " << *numPtr << endl;
    delete numPtr;              // تحرير!
    numPtr = nullptr;           // أمان إضافي
    
    // حجز مع تهيئة
    int* numPtr2 = new int(100);
    cout << "القيمة المهيأة: " << *numPtr2 << endl;
    delete numPtr2;
    
    // ===== حجز مصفوفة =====
    int size;
    cout << "\\nأدخل حجم المصفوفة: ";
    cin >> size;
    
    int* arr = new int[size];  // مصفوفة ديناميكية!
    
    // ملء المصفوفة
    for (int i = 0; i < size; i++) {
        arr[i] = (i + 1) * 10;
    }
    
    // طباعة
    cout << "المصفوفة: ";
    for (int i = 0; i < size; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    
    delete[] arr;  // لا تنس []!
    arr = nullptr;
    
    // ===== مصفوفة ثنائية ديناميكية =====
    int rows = 3, cols = 4;
    
    // حجز
    int** matrix = new int*[rows];
    for (int i = 0; i < rows; i++) {
        matrix[i] = new int[cols];
    }
    
    // ملء
    int value = 1;
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            matrix[i][j] = value++;
        }
    }
    
    // طباعة
    cout << "\\nالمصفوفة الثنائية:" << endl;
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            cout << matrix[i][j] << "\\t";
        }
        cout << endl;
    }
    
    // تحرير (بالعكس!)
    for (int i = 0; i < rows; i++) {
        delete[] matrix[i];
    }
    delete[] matrix;
    
    // ===== التحقق من الحجز =====
    try {
        int* huge = new int[1000000000000];  // قد يفشل!
        delete[] huge;
    } catch (bad_alloc& e) {
        cout << "\\nفشل الحجز: " << e.what() << endl;
    }
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 140,
    order: 4,
    quiz: {
      question: 'ماذا نستخدم لتحرير مصفوفة ديناميكية؟',
      options: ['delete ptr', 'delete[] ptr', 'free(ptr)', 'remove ptr'],
      correctAnswer: 1,
      explanation: 'delete[] يُستخدم لتحرير المصفوفات المحجوزة بـ new[]',
    },
  },
  {
    id: 'cpp-ptr-5',
    courseId: 'cpp-pointers',
    title: 'nullptr و Dangling Pointers',
    description: 'الأمان مع المؤشرات',
    content: `
# أمان المؤشرات

## المشاكل الشائعة

### 1. Wild Pointer
مؤشر غير مهيأ
\`\`\`cpp
int* ptr;       // قيمة عشوائية!
int* ptr = nullptr;  // آمن ✓
\`\`\`

### 2. Dangling Pointer
يشير لذاكرة محررة
\`\`\`cpp
delete ptr;
*ptr = 10;  // خطأ!
\`\`\`

### 3. Memory Leak
ذاكرة محجوزة بدون تحرير

## الحلول
1. هيّئ دائماً بـ nullptr
2. اجعله nullptr بعد delete
3. تحقق قبل الاستخدام
`,
    codeExample: `#include <iostream>
using namespace std;

// دالة آمنة تتحقق من المؤشر
void safeDelete(int*& ptr) {
    if (ptr != nullptr) {
        delete ptr;
        ptr = nullptr;
        cout << "تم التحرير بأمان" << endl;
    } else {
        cout << "المؤشر فارغ أصلاً" << endl;
    }
}

void processData(int* data) {
    if (data == nullptr) {
        cout << "خطأ: المؤشر فارغ!" << endl;
        return;
    }
    cout << "القيمة: " << *data << endl;
}

int main() {
    // ===== Wild Pointer (تجنب!) =====
    // int* wild;  // خطير! قيمة عشوائية
    // cout << *wild;  // سلوك غير محدد!
    
    // الطريقة الصحيحة
    int* safe = nullptr;  // آمن ✓
    
    // ===== التحقق من nullptr =====
    if (safe == nullptr) {
        cout << "المؤشر فارغ - تهيئة..." << endl;
        safe = new int(42);
    }
    
    cout << "القيمة: " << *safe << endl;
    
    // ===== Dangling Pointer =====
    int* ptr = new int(100);
    cout << "\\nقبل delete: " << *ptr << endl;
    
    delete ptr;
    // cout << *ptr;  // خطير! Dangling pointer!
    
    ptr = nullptr;  // الحل!
    
    // ===== التحقق قبل الاستخدام =====
    if (ptr != nullptr) {
        cout << *ptr << endl;
    } else {
        cout << "المؤشر فارغ (آمن)" << endl;
    }
    
    // ===== استخدام دالة آمنة =====
    int* num = new int(200);
    safeDelete(num);  // يحرر ويجعله nullptr
    safeDelete(num);  // آمن - يطبع رسالة
    
    // ===== Memory Leak (تجنب!) =====
    // int* leak = new int(50);
    // leak = new int(60);  // فقدنا الأولى!
    
    // الطريقة الصحيحة
    int* noLeak = new int(50);
    delete noLeak;           // حرر الأولى
    noLeak = new int(60);    // ثم اعطه الجديدة
    delete noLeak;
    
    // ===== دالة مع تحقق =====
    int value = 300;
    processData(&value);    // يعمل
    processData(nullptr);   // يطبع رسالة خطأ
    
    // ===== تنظيف نهائي =====
    safeDelete(safe);
    
    cout << "\\n✓ البرنامج انتهى بدون تسريب!" << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 130,
    order: 5,
    quiz: {
      question: 'ما هو Dangling Pointer؟',
      options: [
        'مؤشر يشير لـ nullptr',
        'مؤشر يشير لذاكرة محررة',
        'مؤشر غير مهيأ',
        'مؤشر لمصفوفة',
      ],
      correctAnswer: 1,
      explanation: 'Dangling Pointer يشير لذاكرة تم تحريرها، استخدامه خطير',
    },
  },
  {
    id: 'cpp-ptr-6',
    courseId: 'cpp-pointers',
    title: 'const مع المؤشرات',
    description: 'أنواع الثبات مع المؤشرات',
    content: `
# const والمؤشرات

## أربعة أنواع

### 1. Pointer to const
\`\`\`cpp
const int* ptr;  // لا يمكن تغيير القيمة
\`\`\`

### 2. Const pointer
\`\`\`cpp
int* const ptr;  // لا يمكن تغيير العنوان
\`\`\`

### 3. Const pointer to const
\`\`\`cpp
const int* const ptr;  // لا شيء يتغير
\`\`\`

### 4. Pointer عادي
\`\`\`cpp
int* ptr;  // كل شيء يتغير
\`\`\`

## قاعدة القراءة
اقرأ من اليمين لليسار!
`,
    codeExample: `#include <iostream>
using namespace std;

void printValue(const int* ptr) {
    // *ptr = 10;  // خطأ! لا يمكن التعديل
    cout << "القيمة: " << *ptr << endl;
}

int main() {
    int x = 10;
    int y = 20;
    
    // ===== 1. Pointer to const =====
    // القيمة ثابتة، العنوان يتغير
    const int* ptr1 = &x;
    cout << "ptr1 يشير لـ: " << *ptr1 << endl;
    
    // *ptr1 = 50;  // خطأ! لا يمكن تغيير القيمة
    ptr1 = &y;      // يعمل! تغيير العنوان
    cout << "ptr1 الآن يشير لـ: " << *ptr1 << endl;
    
    // ===== 2. Const pointer =====
    // العنوان ثابت، القيمة تتغير
    int* const ptr2 = &x;
    cout << "\\nptr2 يشير لـ: " << *ptr2 << endl;
    
    *ptr2 = 100;    // يعمل! تغيير القيمة
    // ptr2 = &y;   // خطأ! لا يمكن تغيير العنوان
    cout << "x بعد التعديل: " << x << endl;
    
    // ===== 3. Const pointer to const =====
    // لا شيء يتغير
    const int* const ptr3 = &x;
    cout << "\\nptr3 يشير لـ: " << *ptr3 << endl;
    
    // *ptr3 = 50;  // خطأ!
    // ptr3 = &y;   // خطأ!
    
    // ===== استخدام عملي =====
    int arr[] = {1, 2, 3, 4, 5};
    int size = 5;
    
    // دالة تقرأ فقط - تستخدم const
    cout << "\\nالمصفوفة: ";
    for (const int* p = arr; p < arr + size; p++) {
        cout << *p << " ";
        // *p = 0;  // ممنوع!
    }
    cout << endl;
    
    // دالة تعدل - بدون const
    cout << "بعد المضاعفة: ";
    for (int* p = arr; p < arr + size; p++) {
        *p *= 2;  // مسموح
        cout << *p << " ";
    }
    cout << endl;
    
    // ===== مع الدوال =====
    int num = 42;
    printValue(&num);  // الدالة لن تعدل القيمة
    
    // ===== ملخص =====
    cout << "\\n=== ملخص ===" << endl;
    cout << "const int* ptr   → القيمة ثابتة" << endl;
    cout << "int* const ptr   → العنوان ثابت" << endl;
    cout << "const int* const → كلاهما ثابت" << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 130,
    order: 6,
    quiz: {
      question: 'ماذا يعني const int* ptr؟',
      options: [
        'المؤشر ثابت',
        'القيمة المشار إليها ثابتة',
        'كلاهما ثابت',
        'لا شيء ثابت',
      ],
      correctAnswer: 1,
      explanation:
        'const int* ptr يعني أن القيمة التي يشير لها لا يمكن تغييرها عبر هذا المؤشر',
    },
  },
  {
    id: 'cpp-ptr-7',
    courseId: 'cpp-pointers',
    title: 'Smart Pointers',
    description: 'المؤشرات الذكية في C++ الحديثة',
    content: `
# Smart Pointers (C++11)

تدير الذاكرة تلقائياً - لا حاجة لـ delete!

## الأنواع الثلاثة

### 1. unique_ptr
- ملكية حصرية
- لا يمكن نسخه
- الأكثر كفاءة

### 2. shared_ptr
- ملكية مشتركة
- عداد مراجع
- يُحرر عند وصول العداد لصفر

### 3. weak_ptr
- لا يملك
- يراقب shared_ptr
- يحل مشكلة الدورات

## لماذا Smart Pointers؟
- لا Memory Leaks
- Exception Safe
- كود أنظف
`,
    codeExample: `#include <iostream>
#include <memory>
using namespace std;

class Resource {
    string name;
public:
    Resource(string n) : name(n) {
        cout << "📦 إنشاء: " << name << endl;
    }
    ~Resource() {
        cout << "🗑️ تدمير: " << name << endl;
    }
    void use() { cout << "استخدام: " << name << endl; }
};

int main() {
    // ===== unique_ptr =====
    cout << "=== unique_ptr ===" << endl;
    {
        unique_ptr<Resource> uptr = make_unique<Resource>("Unique");
        uptr->use();
        
        // unique_ptr<Resource> copy = uptr;  // خطأ! لا يمكن النسخ
        unique_ptr<Resource> moved = move(uptr);  // نقل الملكية
        
        if (uptr == nullptr) {
            cout << "uptr أصبح فارغاً بعد النقل" << endl;
        }
        moved->use();
    }  // يُحرر تلقائياً هنا!
    
    cout << endl;
    
    // ===== shared_ptr =====
    cout << "=== shared_ptr ===" << endl;
    shared_ptr<Resource> sptr1;
    {
        shared_ptr<Resource> sptr2 = make_shared<Resource>("Shared");
        cout << "العداد: " << sptr2.use_count() << endl;  // 1
        
        sptr1 = sptr2;  // مشاركة!
        cout << "العداد بعد المشاركة: " << sptr1.use_count() << endl;  // 2
        
        sptr2->use();
    }  // sptr2 يخرج من النطاق، لكن المورد باقي!
    
    cout << "العداد بعد خروج sptr2: " << sptr1.use_count() << endl;  // 1
    sptr1->use();
    
    sptr1.reset();  // تحرير يدوي
    cout << endl;
    
    // ===== unique_ptr مع مصفوفة =====
    cout << "=== unique_ptr مع مصفوفة ===" << endl;
    unique_ptr<int[]> arr = make_unique<int[]>(5);
    for (int i = 0; i < 5; i++) {
        arr[i] = (i + 1) * 10;
    }
    
    cout << "المصفوفة: ";
    for (int i = 0; i < 5; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    
    // ===== مقارنة =====
    cout << "\\n=== مقارنة ===" << endl;
    cout << "unique_ptr: ملكية واحدة، الأكفأ" << endl;
    cout << "shared_ptr: ملكية مشتركة، مرونة" << endl;
    cout << "weak_ptr: مراقبة بدون ملكية" << endl;
    
    cout << "\\n✓ لا حاجة لـ delete!" << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 150,
    order: 7,
    quiz: {
      question: 'ما الفرق الأساسي بين unique_ptr و shared_ptr؟',
      options: [
        'unique_ptr أسرع',
        'unique_ptr ملكية حصرية، shared_ptr ملكية مشتركة',
        'shared_ptr أحدث',
        'لا فرق',
      ],
      correctAnswer: 1,
      explanation:
        'unique_ptr يسمح بمالك واحد فقط، shared_ptr يسمح بعدة مالكين',
    },
  },
  {
    id: 'cpp-ptr-8',
    courseId: 'cpp-pointers',
    title: 'مشروع عملي - إدارة الذاكرة',
    description: 'تطبيق شامل على المؤشرات',
    content: `
# مشروع: نظام إدارة المخزون

## المتطلبات
- إضافة منتجات ديناميكياً
- البحث عن منتج
- تحديث الكمية
- عرض جميع المنتجات
- تحرير الذاكرة بشكل صحيح

## المفاهيم المستخدمة
- Dynamic Arrays
- Pointers
- Smart Pointers
- Memory Management
`,
    codeExample: `#include <iostream>
#include <string>
#include <memory>
#include <vector>
using namespace std;

struct Product {
    int id;
    string name;
    double price;
    int quantity;
    
    void display() const {
        cout << "ID: " << id 
             << " | " << name 
             << " | $" << price 
             << " | الكمية: " << quantity << endl;
    }
};

class Inventory {
private:
    vector<unique_ptr<Product>> products;
    int nextId = 1;

public:
    // إضافة منتج
    void addProduct(const string& name, double price, int qty) {
        auto product = make_unique<Product>();
        product->id = nextId++;
        product->name = name;
        product->price = price;
        product->quantity = qty;
        
        products.push_back(move(product));
        cout << "✓ تمت إضافة: " << name << endl;
    }
    
    // البحث عن منتج
    Product* findProduct(int id) {
        for (auto& p : products) {
            if (p->id == id) {
                return p.get();
            }
        }
        return nullptr;
    }
    
    // تحديث الكمية
    bool updateQuantity(int id, int newQty) {
        Product* product = findProduct(id);
        if (product) {
            product->quantity = newQty;
            cout << "✓ تم التحديث" << endl;
            return true;
        }
        cout << "✗ المنتج غير موجود" << endl;
        return false;
    }
    
    // حذف منتج
    bool removeProduct(int id) {
        for (auto it = products.begin(); it != products.end(); ++it) {
            if ((*it)->id == id) {
                cout << "✓ تم حذف: " << (*it)->name << endl;
                products.erase(it);
                return true;
            }
        }
        cout << "✗ المنتج غير موجود" << endl;
        return false;
    }
    
    // عرض الكل
    void displayAll() const {
        if (products.empty()) {
            cout << "المخزون فارغ!" << endl;
            return;
        }
        
        cout << "\\n=== المخزون ===" << endl;
        cout << string(50, '-') << endl;
        for (const auto& p : products) {
            p->display();
        }
        cout << string(50, '-') << endl;
        cout << "إجمالي المنتجات: " << products.size() << endl;
    }
    
    // حساب قيمة المخزون
    double totalValue() const {
        double total = 0;
        for (const auto& p : products) {
            total += p->price * p->quantity;
        }
        return total;
    }
    
    ~Inventory() {
        cout << "\\n🗑️ تنظيف المخزون..." << endl;
        // unique_ptr يحرر تلقائياً!
    }
};

int main() {
    Inventory inventory;
    
    // إضافة منتجات
    inventory.addProduct("لابتوب", 999.99, 10);
    inventory.addProduct("ماوس", 29.99, 50);
    inventory.addProduct("لوحة مفاتيح", 79.99, 30);
    inventory.addProduct("شاشة", 299.99, 15);
    
    // عرض الكل
    inventory.displayAll();
    
    // البحث والتحديث
    cout << "\\n=== البحث والتحديث ===" << endl;
    Product* found = inventory.findProduct(2);
    if (found) {
        cout << "وجدنا: ";
        found->display();
    }
    
    inventory.updateQuantity(2, 100);
    
    // الحذف
    cout << "\\n=== الحذف ===" << endl;
    inventory.removeProduct(3);
    
    // العرض النهائي
    inventory.displayAll();
    
    cout << "\\n💰 قيمة المخزون: $" << inventory.totalValue() << endl;
    
    // ✓ لا حاجة للتحرير اليدوي!
    // unique_ptr يعتني بكل شيء
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 200,
    order: 8,
    quiz: {
      question: 'لماذا استخدمنا unique_ptr في هذا المشروع؟',
      options: [
        'لأنه أسرع',
        'لأنه يحرر الذاكرة تلقائياً',
        'لأنه مطلوب',
        'لا سبب محدد',
      ],
      correctAnswer: 1,
      explanation: 'unique_ptr يدير الذاكرة تلقائياً ويمنع Memory Leaks',
    },
  },
];

// ===== دروس C++ المتقدمة =====
export const CPP_LESSONS_ADVANCED: Lesson[] = [
  {
    id: 'cpp-adv-1',
    courseId: 'cpp-oop',
    title: 'Classes و Objects',
    description: 'البرمجة الكائنية في C++',
    content: `
# البرمجة الكائنية في C++

## Class vs Struct
- class: private افتراضياً
- struct: public افتراضياً

## مكونات الـ Class
- **Attributes**: المتغيرات
- **Methods**: الدوال
- **Constructor**: لتهيئة الكائن
- **Destructor**: للتنظيف

## Access Modifiers
- public: متاح للجميع
- private: داخل الـ class فقط
- protected: للوراثة
`,
    codeExample: `#include <iostream>
#include <string>
using namespace std;

class Person {
private:
    string name;
    int age;

public:
    // Constructor
    Person(string n, int a) : name(n), age(a) {
        cout << "Person created: " << name << endl;
    }
    
    // Default constructor
    Person() : name("Unknown"), age(0) {}
    
    // Destructor
    ~Person() {
        cout << "Person destroyed: " << name << endl;
    }
    
    // Getter methods
    string getName() const { return name; }
    int getAge() const { return age; }
    
    // Setter methods
    void setName(string n) { name = n; }
    void setAge(int a) {
        if (a >= 0) age = a;
    }
    
    // Method
    void introduce() const {
        cout << "مرحباً، أنا " << name << " وعمري " << age << endl;
    }
};

class Rectangle {
private:
    double width, height;

public:
    Rectangle(double w, double h) : width(w), height(h) {}
    
    double area() const {
        return width * height;
    }
    
    double perimeter() const {
        return 2 * (width + height);
    }
    
    // Static member
    static int count;
    
    // Friend function
    friend void printDimensions(const Rectangle& r);
};

int Rectangle::count = 0;

void printDimensions(const Rectangle& r) {
    cout << "Width: " << r.width << ", Height: " << r.height << endl;
}

int main() {
    Person p1("أحمد", 25);
    p1.introduce();
    
    Person p2;
    p2.setName("محمد");
    p2.setAge(30);
    p2.introduce();
    
    Rectangle rect(10, 5);
    cout << "Area: " << rect.area() << endl;
    cout << "Perimeter: " << rect.perimeter() << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 150,
    order: 1,
    quiz: {
      question: 'ما الفرق الأساسي بين class و struct؟',
      options: [
        'struct أسرع',
        'class تدعم الدوال',
        'الوصول الافتراضي مختلف',
        'لا فرق',
      ],
      correctAnswer: 2,
      explanation: 'class افتراضياً private بينما struct افتراضياً public',
    },
  },
  {
    id: 'cpp-adv-2',
    courseId: 'cpp-oop',
    title: 'الوراثة Inheritance',
    description: 'إنشاء تسلسل هرمي للأصناف',
    content: `
# الوراثة في C++

## أنواع الوراثة
- public: الأعضاء تحافظ على مستواها
- protected: public تصبح protected
- private: الكل يصبح private

## virtual و Override
- virtual: للدوال القابلة للتعديل
- override: لتأكيد التعديل

## Pure Virtual
دالة بدون تنفيذ = abstract class
\`\`\`cpp
virtual void func() = 0;
\`\`\`
`,
    codeExample: `#include <iostream>
#include <string>
using namespace std;

// Base class
class Animal {
protected:
    string name;
    int age;

public:
    Animal(string n, int a) : name(n), age(a) {}
    
    virtual void speak() const {
        cout << "صوت ما..." << endl;
    }
    
    void info() const {
        cout << name << " عمره " << age << endl;
    }
    
    virtual ~Animal() {}  // Virtual destructor
};

// Derived class
class Dog : public Animal {
private:
    string breed;

public:
    Dog(string n, int a, string b) 
        : Animal(n, a), breed(b) {}
    
    void speak() const override {
        cout << "هاو هاو! 🐕" << endl;
    }
    
    void fetch() const {
        cout << name << " يجلب الكرة!" << endl;
    }
};

class Cat : public Animal {
public:
    Cat(string n, int a) : Animal(n, a) {}
    
    void speak() const override {
        cout << "مياو! 🐱" << endl;
    }
};

// Abstract class
class Shape {
public:
    virtual double area() const = 0;  // Pure virtual
    virtual double perimeter() const = 0;
    virtual void draw() const = 0;
    virtual ~Shape() {}
};

class Circle : public Shape {
private:
    double radius;

public:
    Circle(double r) : radius(r) {}
    
    double area() const override {
        return 3.14159 * radius * radius;
    }
    
    double perimeter() const override {
        return 2 * 3.14159 * radius;
    }
    
    void draw() const override {
        cout << "رسم دائرة نصف قطرها " << radius << endl;
    }
};

int main() {
    Dog dog("بادي", 3, "جولدن");
    Cat cat("ميمي", 2);
    
    dog.info();
    dog.speak();
    dog.fetch();
    
    cat.info();
    cat.speak();
    
    // Polymorphism
    Animal* animals[] = {&dog, &cat};
    for (Animal* a : animals) {
        a->speak();  // يستدعي النسخة الصحيحة
    }
    
    Circle circle(5);
    cout << "\\nمساحة الدائرة: " << circle.area() << endl;
    circle.draw();
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 150,
    order: 2,
    quiz: {
      question: 'ما الدالة التي تجعل الـ class abstract؟',
      options: [
        'virtual function',
        'pure virtual function',
        'static function',
        'inline function',
      ],
      correctAnswer: 1,
      explanation:
        'Pure virtual function (= 0) تجعل الـ class غير قابل للإنشاء مباشرة',
    },
  },
  {
    id: 'cpp-adv-3',
    courseId: 'cpp-oop',
    title: 'التغليف Encapsulation',
    description: 'حماية البيانات وإخفاء التفاصيل',
    content: `
# التغليف (Encapsulation)

## ما هو التغليف؟
إخفاء التفاصيل الداخلية وتوفير واجهة آمنة للتعامل.

## لماذا التغليف مهم؟
- 🔒 حماية البيانات من التعديل الخاطئ
- 🎯 التحكم في كيفية الوصول
- 🔧 سهولة الصيانة والتعديل
- ✅ التحقق من صحة البيانات

## القاعدة الذهبية
- البيانات: private
- الوصول: عبر getters/setters

## الفوائد
- Data Validation
- Read-Only Properties
- Computed Properties
`,
    codeExample: `#include <iostream>
#include <string>
using namespace std;

class BankAccount {
private:
    string accountNumber;
    string ownerName;
    double balance;
    string pin;
    
    // دالة خاصة للتحقق
    bool isValidAmount(double amount) const {
        return amount > 0;
    }

public:
    // Constructor
    BankAccount(string accNum, string name, string pinCode, double initial = 0)
        : accountNumber(accNum), ownerName(name), pin(pinCode), balance(initial) {}
    
    // Getters
    string getAccountNumber() const { 
        // إخفاء جزء من الرقم
        return "****" + accountNumber.substr(accountNumber.length() - 4);
    }
    
    string getOwnerName() const { return ownerName; }
    
    double getBalance() const { return balance; }
    
    // Setters مع تحقق
    bool setOwnerName(const string& name) {
        if (name.empty()) {
            cout << "❌ الاسم لا يمكن أن يكون فارغاً" << endl;
            return false;
        }
        ownerName = name;
        return true;
    }
    
    // العمليات المحمية
    bool deposit(double amount) {
        if (!isValidAmount(amount)) {
            cout << "❌ المبلغ غير صالح" << endl;
            return false;
        }
        balance += amount;
        cout << "✅ تم إيداع $" << amount << endl;
        return true;
    }
    
    bool withdraw(double amount, const string& inputPin) {
        // التحقق من PIN
        if (inputPin != pin) {
            cout << "❌ رمز PIN خاطئ" << endl;
            return false;
        }
        
        if (!isValidAmount(amount)) {
            cout << "❌ المبلغ غير صالح" << endl;
            return false;
        }
        
        if (amount > balance) {
            cout << "❌ رصيد غير كافٍ" << endl;
            return false;
        }
        
        balance -= amount;
        cout << "✅ تم سحب $" << amount << endl;
        return true;
    }
    
    bool changePin(const string& oldPin, const string& newPin) {
        if (oldPin != pin) {
            cout << "❌ رمز PIN القديم خاطئ" << endl;
            return false;
        }
        if (newPin.length() != 4) {
            cout << "❌ PIN يجب أن يكون 4 أرقام" << endl;
            return false;
        }
        pin = newPin;
        cout << "✅ تم تغيير PIN بنجاح" << endl;
        return true;
    }
    
    void displayInfo() const {
        cout << "\\n=== معلومات الحساب ===" << endl;
        cout << "رقم الحساب: " << getAccountNumber() << endl;
        cout << "صاحب الحساب: " << ownerName << endl;
        cout << "الرصيد: $" << balance << endl;
    }
};

int main() {
    BankAccount account("1234567890", "أحمد محمد", "1234", 1000);
    
    account.displayInfo();
    
    // محاولات آمنة
    account.deposit(500);
    account.withdraw(200, "1234");  // PIN صحيح
    account.withdraw(100, "0000");  // PIN خاطئ
    account.withdraw(5000, "1234"); // رصيد غير كافٍ
    
    // تغيير PIN
    account.changePin("1234", "5678");
    
    account.displayInfo();
    
    // لا يمكن الوصول للـ private مباشرة:
    // account.balance = 1000000;  // خطأ!
    // account.pin = "0000";       // خطأ!
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 140,
    order: 3,
    quiz: {
      question: 'ما الهدف الرئيسي من التغليف؟',
      options: [
        'تسريع البرنامج',
        'حماية البيانات والتحكم بالوصول',
        'تقليل حجم الكود',
        'إضافة المزيد من الدوال',
      ],
      correctAnswer: 1,
      explanation: 'التغليف يحمي البيانات ويوفر واجهة آمنة للوصول إليها',
    },
  },
  {
    id: 'cpp-adv-4',
    courseId: 'cpp-oop',
    title: 'تعدد الأشكال Polymorphism',
    description: 'استخدام واجهة واحدة لأنواع مختلفة',
    content: `
# تعدد الأشكال (Polymorphism)

## أنواع Polymorphism

### 1. Compile-time (Static)
- Function Overloading
- Operator Overloading

### 2. Runtime (Dynamic)
- Virtual Functions
- تحديد الدالة وقت التشغيل

## Virtual Functions
\`\`\`cpp
virtual void func();  // قابلة للتعديل
\`\`\`

## override (C++11)
للتأكد من التعديل الصحيح

## final
لمنع التعديل أو الوراثة
`,
    codeExample: `#include <iostream>
#include <vector>
#include <memory>
using namespace std;

// ===== Compile-time Polymorphism =====

// Function Overloading
class Calculator {
public:
    int add(int a, int b) {
        return a + b;
    }
    
    double add(double a, double b) {
        return a + b;
    }
    
    int add(int a, int b, int c) {
        return a + b + c;
    }
    
    string add(const string& a, const string& b) {
        return a + b;
    }
};

// ===== Runtime Polymorphism =====

class PaymentMethod {
public:
    virtual void pay(double amount) = 0;
    virtual string getName() const = 0;
    virtual ~PaymentMethod() = default;
};

class CreditCard : public PaymentMethod {
private:
    string cardNumber;
public:
    CreditCard(const string& num) : cardNumber(num) {}
    
    void pay(double amount) override {
        cout << "💳 دفع $" << amount << " ببطاقة " 
             << cardNumber.substr(cardNumber.length()-4) << endl;
    }
    
    string getName() const override { return "بطاقة ائتمان"; }
};

class PayPal : public PaymentMethod {
private:
    string email;
public:
    PayPal(const string& e) : email(e) {}
    
    void pay(double amount) override {
        cout << "📧 دفع $" << amount << " عبر PayPal: " << email << endl;
    }
    
    string getName() const override { return "PayPal"; }
};

class Cash : public PaymentMethod {
public:
    void pay(double amount) override {
        cout << "💵 دفع $" << amount << " نقداً" << endl;
    }
    
    string getName() const override { return "نقدي"; }
};

// final - لمنع التعديل
class SecurePayment : public PaymentMethod {
public:
    void pay(double amount) final override {
        cout << "🔒 دفع آمن: $" << amount << endl;
    }
    
    string getName() const override { return "دفع آمن"; }
};

// معالج الدفع - يستخدم Polymorphism
class PaymentProcessor {
public:
    void processPayment(PaymentMethod* method, double amount) {
        cout << "معالجة الدفع عبر: " << method->getName() << endl;
        method->pay(amount);  // يستدعي النسخة الصحيحة!
        cout << "✅ تمت العملية بنجاح\\n" << endl;
    }
};

int main() {
    // Compile-time Polymorphism
    cout << "=== Function Overloading ===" << endl;
    Calculator calc;
    cout << "add(5, 3) = " << calc.add(5, 3) << endl;
    cout << "add(2.5, 3.7) = " << calc.add(2.5, 3.7) << endl;
    cout << "add(1, 2, 3) = " << calc.add(1, 2, 3) << endl;
    cout << "add(مرحبا, عالم) = " << calc.add("مرحبا ", "عالم") << endl;
    
    // Runtime Polymorphism
    cout << "\\n=== Runtime Polymorphism ===" << endl;
    
    vector<unique_ptr<PaymentMethod>> methods;
    methods.push_back(make_unique<CreditCard>("1234567890123456"));
    methods.push_back(make_unique<PayPal>("user@email.com"));
    methods.push_back(make_unique<Cash>());
    
    PaymentProcessor processor;
    
    for (auto& method : methods) {
        processor.processPayment(method.get(), 99.99);
    }
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 150,
    order: 4,
    quiz: {
      question: 'ما الفرق بين Compile-time و Runtime Polymorphism؟',
      options: [
        'لا فرق',
        'Compile-time أسرع دائماً',
        'Runtime يحدد الدالة وقت التشغيل',
        'Compile-time يستخدم virtual',
      ],
      correctAnswer: 2,
      explanation:
        'Runtime Polymorphism يحدد الدالة المناسبة أثناء تشغيل البرنامج عبر Virtual Functions',
    },
  },
  {
    id: 'cpp-adv-5',
    courseId: 'cpp-oop',
    title: 'التجريد Abstraction',
    description: 'Abstract Classes و Interfaces',
    content: `
# التجريد (Abstraction)

## ما هو التجريد؟
إخفاء التفاصيل المعقدة وإظهار الواجهة البسيطة فقط.

## Abstract Class
- تحتوي على pure virtual function واحدة على الأقل
- لا يمكن إنشاء كائن منها مباشرة
- تُستخدم كـ base class

## Pure Virtual Function
\`\`\`cpp
virtual void func() = 0;
\`\`\`

## Interface في C++
class يحتوي فقط على pure virtual functions
`,
    codeExample: `#include <iostream>
#include <string>
#include <vector>
#include <memory>
using namespace std;

// ===== Interface =====
class IDrawable {
public:
    virtual void draw() const = 0;
    virtual ~IDrawable() = default;
};

class IResizable {
public:
    virtual void resize(double factor) = 0;
    virtual ~IResizable() = default;
};

// ===== Abstract Class =====
class Shape : public IDrawable, public IResizable {
protected:
    string color;
    double x, y;  // الموقع

public:
    Shape(const string& c, double px, double py) 
        : color(c), x(px), y(py) {}
    
    // دوال محققة
    void setColor(const string& c) { color = c; }
    string getColor() const { return color; }
    
    void move(double dx, double dy) {
        x += dx;
        y += dy;
    }
    
    // دوال مجردة (يجب تحقيقها)
    virtual double area() const = 0;
    virtual double perimeter() const = 0;
    
    // معلومات الشكل
    virtual void info() const {
        cout << "اللون: " << color << ", الموقع: (" << x << ", " << y << ")" << endl;
    }
    
    virtual ~Shape() = default;
};

// ===== Concrete Classes =====
class Circle : public Shape {
private:
    double radius;

public:
    Circle(const string& c, double px, double py, double r)
        : Shape(c, px, py), radius(r) {}
    
    double area() const override {
        return 3.14159 * radius * radius;
    }
    
    double perimeter() const override {
        return 2 * 3.14159 * radius;
    }
    
    void draw() const override {
        cout << "🔵 رسم دائرة " << color << " بنصف قطر " << radius << endl;
    }
    
    void resize(double factor) override {
        radius *= factor;
        cout << "تم تغيير حجم الدائرة، النصف الجديد: " << radius << endl;
    }
    
    void info() const override {
        Shape::info();
        cout << "نصف القطر: " << radius << ", المساحة: " << area() << endl;
    }
};

class Rectangle : public Shape {
private:
    double width, height;

public:
    Rectangle(const string& c, double px, double py, double w, double h)
        : Shape(c, px, py), width(w), height(h) {}
    
    double area() const override {
        return width * height;
    }
    
    double perimeter() const override {
        return 2 * (width + height);
    }
    
    void draw() const override {
        cout << "🟦 رسم مستطيل " << color << " (" << width << "x" << height << ")" << endl;
    }
    
    void resize(double factor) override {
        width *= factor;
        height *= factor;
        cout << "تم تغيير الحجم: " << width << "x" << height << endl;
    }
};

class Triangle : public Shape {
private:
    double base, height;

public:
    Triangle(const string& c, double px, double py, double b, double h)
        : Shape(c, px, py), base(b), height(h) {}
    
    double area() const override {
        return 0.5 * base * height;
    }
    
    double perimeter() const override {
        // تقريب لمثلث متساوي الساقين
        double side = sqrt(height*height + (base/2)*(base/2));
        return base + 2 * side;
    }
    
    void draw() const override {
        cout << "🔺 رسم مثلث " << color << endl;
    }
    
    void resize(double factor) override {
        base *= factor;
        height *= factor;
    }
};

int main() {
    // لا يمكن إنشاء Shape مباشرة:
    // Shape s("red", 0, 0);  // خطأ!
    
    // مصفوفة من أشكال مختلفة
    vector<unique_ptr<Shape>> shapes;
    shapes.push_back(make_unique<Circle>("أحمر", 0, 0, 5));
    shapes.push_back(make_unique<Rectangle>("أزرق", 10, 10, 4, 6));
    shapes.push_back(make_unique<Triangle>("أخضر", 5, 5, 3, 4));
    
    cout << "=== جميع الأشكال ===" << endl;
    for (const auto& shape : shapes) {
        shape->draw();
        shape->info();
        cout << endl;
    }
    
    // تغيير الحجم
    cout << "=== بعد تغيير الحجم ===" << endl;
    for (auto& shape : shapes) {
        shape->resize(2);
    }
    
    // حساب المساحة الكلية
    double totalArea = 0;
    for (const auto& shape : shapes) {
        totalArea += shape->area();
    }
    cout << "\\nالمساحة الكلية: " << totalArea << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 150,
    order: 5,
    quiz: {
      question: 'لماذا لا يمكن إنشاء كائن من Abstract Class؟',
      options: [
        'لأنها بطيئة',
        'لأنها تحتوي دوال غير محققة',
        'لأنها كبيرة',
        'لأنها قديمة',
      ],
      correctAnswer: 1,
      explanation:
        'Abstract Class تحتوي على pure virtual functions لم يتم تحقيقها',
    },
  },
  {
    id: 'cpp-adv-6',
    courseId: 'cpp-oop',
    title: 'Operator Overloading',
    description: 'إعادة تعريف العوامل',
    content: `
# إعادة تعريف العوامل

## ما هو Operator Overloading؟
تخصيص سلوك العوامل (+, -, *, ==, etc) للـ Classes الخاصة بك.

## الصيغة
\`\`\`cpp
ReturnType operator@(parameters);
\`\`\`

## عوامل يمكن تعريفها
- الحسابية: +, -, *, /, %
- المقارنة: ==, !=, <, >, <=, >=
- الإسناد: =, +=, -=
- الفهرسة: []
- الاستدعاء: ()
- الإدخال/الإخراج: <<, >>

## عوامل لا يمكن تعريفها
\`.\`, \`::\`, \`?:\`, \`sizeof\`
`,
    codeExample: `#include <iostream>
#include <cmath>
using namespace std;

class Vector2D {
private:
    double x, y;

public:
    Vector2D(double x = 0, double y = 0) : x(x), y(y) {}
    
    // Getters
    double getX() const { return x; }
    double getY() const { return y; }
    
    // الجمع
    Vector2D operator+(const Vector2D& other) const {
        return Vector2D(x + other.x, y + other.y);
    }
    
    // الطرح
    Vector2D operator-(const Vector2D& other) const {
        return Vector2D(x - other.x, y - other.y);
    }
    
    // الضرب في عدد
    Vector2D operator*(double scalar) const {
        return Vector2D(x * scalar, y * scalar);
    }
    
    // القسمة على عدد
    Vector2D operator/(double scalar) const {
        if (scalar == 0) throw runtime_error("قسمة على صفر!");
        return Vector2D(x / scalar, y / scalar);
    }
    
    // المساواة
    bool operator==(const Vector2D& other) const {
        return x == other.x && y == other.y;
    }
    
    bool operator!=(const Vector2D& other) const {
        return !(*this == other);
    }
    
    // +=
    Vector2D& operator+=(const Vector2D& other) {
        x += other.x;
        y += other.y;
        return *this;
    }
    
    // السالب
    Vector2D operator-() const {
        return Vector2D(-x, -y);
    }
    
    // الفهرسة
    double operator[](int index) const {
        if (index == 0) return x;
        if (index == 1) return y;
        throw out_of_range("فهرس غير صالح!");
    }
    
    // الطول
    double magnitude() const {
        return sqrt(x*x + y*y);
    }
    
    // Friend للطباعة
    friend ostream& operator<<(ostream& os, const Vector2D& v);
    friend istream& operator>>(istream& is, Vector2D& v);
};

// عامل الطباعة
ostream& operator<<(ostream& os, const Vector2D& v) {
    os << "(" << v.x << ", " << v.y << ")";
    return os;
}

// عامل الإدخال
istream& operator>>(istream& is, Vector2D& v) {
    is >> v.x >> v.y;
    return is;
}

// ضرب عدد في Vector
Vector2D operator*(double scalar, const Vector2D& v) {
    return v * scalar;
}

int main() {
    Vector2D v1(3, 4);
    Vector2D v2(1, 2);
    
    cout << "v1 = " << v1 << endl;
    cout << "v2 = " << v2 << endl;
    
    // العمليات الحسابية
    cout << "\\n=== العمليات ===" << endl;
    cout << "v1 + v2 = " << (v1 + v2) << endl;
    cout << "v1 - v2 = " << (v1 - v2) << endl;
    cout << "v1 * 2 = " << (v1 * 2) << endl;
    cout << "3 * v2 = " << (3 * v2) << endl;
    cout << "v1 / 2 = " << (v1 / 2) << endl;
    cout << "-v1 = " << (-v1) << endl;
    
    // المقارنة
    cout << "\\n=== المقارنة ===" << endl;
    cout << "v1 == v2: " << (v1 == v2 ? "نعم" : "لا") << endl;
    cout << "v1 != v2: " << (v1 != v2 ? "نعم" : "لا") << endl;
    
    // الفهرسة
    cout << "\\n=== الفهرسة ===" << endl;
    cout << "v1[0] = " << v1[0] << endl;
    cout << "v1[1] = " << v1[1] << endl;
    
    // +=
    cout << "\\n=== += ===" << endl;
    v1 += v2;
    cout << "v1 بعد += v2: " << v1 << endl;
    
    // الطول
    cout << "\\n=== الطول ===" << endl;
    Vector2D v3(3, 4);
    cout << "|" << v3 << "| = " << v3.magnitude() << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 160,
    order: 6,
    quiz: {
      question: 'ما هو الـ operator الذي يُستخدم لطباعة كائن باستخدام cout؟',
      options: ['operator+', 'operator<<', 'operator>>', 'operator()'],
      correctAnswer: 1,
      explanation: 'operator<< يُستخدم مع cout للطباعة (output stream)',
    },
  },
  {
    id: 'cpp-adv-7',
    courseId: 'cpp-oop',
    title: 'Copy Constructor و Assignment',
    description: 'نسخ الكائنات بشكل صحيح',
    content: `
# Copy Constructor و Assignment Operator

## Rule of Three
إذا عرّفت أياً من:
1. Destructor
2. Copy Constructor
3. Copy Assignment Operator

يجب تعريف الثلاثة!

## Rule of Five (C++11)
أضف:
4. Move Constructor
5. Move Assignment Operator

## متى يُستدعى كل منها؟
- Copy Constructor: إنشاء من كائن آخر
- Assignment: إسناد بين كائنين موجودين
`,
    codeExample: `#include <iostream>
#include <cstring>
using namespace std;

class MyString {
private:
    char* data;
    size_t length;

public:
    // Constructor
    MyString(const char* str = "") {
        length = strlen(str);
        data = new char[length + 1];
        strcpy(data, str);
        cout << "📦 Constructor: " << data << endl;
    }
    
    // Destructor
    ~MyString() {
        cout << "🗑️ Destructor: " << (data ? data : "null") << endl;
        delete[] data;
    }
    
    // Copy Constructor
    MyString(const MyString& other) {
        length = other.length;
        data = new char[length + 1];
        strcpy(data, other.data);
        cout << "📋 Copy Constructor: " << data << endl;
    }
    
    // Copy Assignment Operator
    MyString& operator=(const MyString& other) {
        cout << "📝 Copy Assignment" << endl;
        
        if (this == &other) return *this;  // self-assignment check
        
        delete[] data;  // تحرير القديم
        
        length = other.length;
        data = new char[length + 1];
        strcpy(data, other.data);
        
        return *this;
    }
    
    // Move Constructor (C++11)
    MyString(MyString&& other) noexcept {
        data = other.data;
        length = other.length;
        
        other.data = nullptr;
        other.length = 0;
        
        cout << "🚀 Move Constructor: " << data << endl;
    }
    
    // Move Assignment Operator (C++11)
    MyString& operator=(MyString&& other) noexcept {
        cout << "🚀 Move Assignment" << endl;
        
        if (this == &other) return *this;
        
        delete[] data;
        
        data = other.data;
        length = other.length;
        
        other.data = nullptr;
        other.length = 0;
        
        return *this;
    }
    
    // Getters
    const char* c_str() const { return data; }
    size_t size() const { return length; }
    
    // طباعة
    friend ostream& operator<<(ostream& os, const MyString& s) {
        return os << s.data;
    }
};

MyString createString(const char* str) {
    return MyString(str);  // سيستخدم Move
}

int main() {
    cout << "=== إنشاء s1 ===" << endl;
    MyString s1("مرحبا");
    
    cout << "\\n=== Copy Constructor ===" << endl;
    MyString s2(s1);  // Copy Constructor
    
    cout << "\\n=== Copy Assignment ===" << endl;
    MyString s3;
    s3 = s1;  // Copy Assignment
    
    cout << "\\n=== Move Constructor ===" << endl;
    MyString s4(move(s1));  // Move Constructor
    
    cout << "\\n=== Move Assignment ===" << endl;
    MyString s5;
    s5 = createString("عالم");  // Move Assignment
    
    cout << "\\n=== القيم ===" << endl;
    cout << "s2: " << s2 << endl;
    cout << "s3: " << s3 << endl;
    cout << "s4: " << s4 << endl;
    cout << "s5: " << s5 << endl;
    
    cout << "\\n=== انتهاء البرنامج ===" << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 170,
    order: 7,
    quiz: {
      question: 'متى يُستدعى Copy Constructor؟',
      options: [
        'عند حذف كائن',
        'عند إنشاء كائن من كائن آخر',
        'عند تعديل كائن',
        'عند طباعة كائن',
      ],
      correctAnswer: 1,
      explanation: 'Copy Constructor يُستدعى عند إنشاء كائن جديد من كائن موجود',
    },
  },
  {
    id: 'cpp-adv-8',
    courseId: 'cpp-oop',
    title: 'Static Members',
    description: 'المتغيرات والدوال الثابتة',
    content: `
# Static Members

## Static Variables
- تنتمي للـ class وليس للكائن
- نسخة واحدة لجميع الكائنات
- تُعرّف خارج الـ class

## Static Functions
- يمكن استدعاؤها بدون كائن
- لا يمكنها الوصول لـ non-static members
- لا يمكنها استخدام this

## استخدامات شائعة
- عداد الكائنات
- Factory Methods
- Singleton Pattern
`,
    codeExample: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Employee {
private:
    int id;
    string name;
    double salary;
    
    // Static members
    static int nextId;
    static int employeeCount;
    static double totalSalary;
    static vector<Employee*> allEmployees;

public:
    Employee(const string& n, double s) 
        : id(nextId++), name(n), salary(s) {
        employeeCount++;
        totalSalary += salary;
        allEmployees.push_back(this);
        cout << "✅ إنشاء موظف: " << name << " (ID: " << id << ")" << endl;
    }
    
    ~Employee() {
        employeeCount--;
        totalSalary -= salary;
        // إزالة من القائمة
        for (auto it = allEmployees.begin(); it != allEmployees.end(); ++it) {
            if (*it == this) {
                allEmployees.erase(it);
                break;
            }
        }
        cout << "❌ حذف موظف: " << name << endl;
    }
    
    // Getters
    int getId() const { return id; }
    string getName() const { return name; }
    double getSalary() const { return salary; }
    
    void setSalary(double s) {
        totalSalary -= salary;
        salary = s;
        totalSalary += salary;
    }
    
    // Static functions
    static int getEmployeeCount() {
        return employeeCount;
    }
    
    static double getTotalSalary() {
        return totalSalary;
    }
    
    static double getAverageSalary() {
        if (employeeCount == 0) return 0;
        return totalSalary / employeeCount;
    }
    
    static void listAllEmployees() {
        cout << "\\n=== قائمة الموظفين ===" << endl;
        for (const Employee* emp : allEmployees) {
            cout << "ID: " << emp->id 
                 << ", الاسم: " << emp->name 
                 << ", الراتب: $" << emp->salary << endl;
        }
        cout << "الإجمالي: " << employeeCount << " موظف" << endl;
    }
    
    // Factory method
    static Employee* createManager(const string& name) {
        return new Employee(name, 10000);
    }
    
    static Employee* createDeveloper(const string& name) {
        return new Employee(name, 7000);
    }
    
    static Employee* createIntern(const string& name) {
        return new Employee(name, 2000);
    }
};

// تهيئة Static members (مهم!)
int Employee::nextId = 1;
int Employee::employeeCount = 0;
double Employee::totalSalary = 0;
vector<Employee*> Employee::allEmployees;

int main() {
    cout << "عدد الموظفين: " << Employee::getEmployeeCount() << endl;
    
    // إنشاء موظفين
    Employee* mgr = Employee::createManager("أحمد");
    Employee* dev1 = Employee::createDeveloper("محمد");
    Employee* dev2 = Employee::createDeveloper("سارة");
    Employee* intern = Employee::createIntern("علي");
    
    // إحصائيات
    Employee::listAllEmployees();
    
    cout << "\\n=== الإحصائيات ===" << endl;
    cout << "إجمالي الرواتب: $" << Employee::getTotalSalary() << endl;
    cout << "متوسط الرواتب: $" << Employee::getAverageSalary() << endl;
    
    // حذف موظف
    cout << "\\n=== حذف المتدرب ===" << endl;
    delete intern;
    
    cout << "\\nبعد الحذف:" << endl;
    cout << "عدد الموظفين: " << Employee::getEmployeeCount() << endl;
    cout << "متوسط الرواتب: $" << Employee::getAverageSalary() << endl;
    
    // تنظيف
    delete mgr;
    delete dev1;
    delete dev2;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 150,
    order: 8,
    quiz: {
      question: 'ما الفرق بين static member و non-static member؟',
      options: [
        'static أسرع',
        'static مشترك بين جميع الكائنات',
        'non-static لا يمكن تعديله',
        'لا فرق',
      ],
      correctAnswer: 1,
      explanation: 'static member نسخة واحدة مشتركة بين جميع كائنات الـ class',
    },
  },
  {
    id: 'cpp-adv-9',
    courseId: 'cpp-oop',
    title: 'Friend Classes و Functions',
    description: 'منح صلاحيات خاصة',
    content: `
# Friend في C++

## Friend Function
دالة خارجية تستطيع الوصول لـ private members

## Friend Class
class آخر يستطيع الوصول لـ private members

## متى نستخدم friend؟
- Operator Overloading (مثل <<)
- التكامل بين classes مترابطة
- Testing

## ملاحظات مهمة
- friend ليست متبادلة
- friend ليست موروثة
- استخدمها بحذر!
`,
    codeExample: `#include <iostream>
#include <string>
using namespace std;

// Forward declaration
class BankAccount;

// Friend class للتدقيق
class Auditor {
public:
    void audit(const BankAccount& account);
    void fullReport(const BankAccount& account);
};

class BankAccount {
private:
    string accountNumber;
    string ownerName;
    double balance;
    string pin;
    
    // سجل المعاملات (خاص)
    struct Transaction {
        string type;
        double amount;
        string date;
    };
    vector<Transaction> transactions;

public:
    BankAccount(const string& num, const string& name, const string& p, double b)
        : accountNumber(num), ownerName(name), pin(p), balance(b) {}
    
    void deposit(double amount) {
        balance += amount;
        transactions.push_back({"إيداع", amount, "2024-01-15"});
    }
    
    void withdraw(double amount, const string& inputPin) {
        if (inputPin != pin) {
            cout << "PIN خاطئ!" << endl;
            return;
        }
        if (amount > balance) {
            cout << "رصيد غير كافٍ!" << endl;
            return;
        }
        balance -= amount;
        transactions.push_back({"سحب", amount, "2024-01-15"});
    }
    
    // Friend function للطباعة
    friend ostream& operator<<(ostream& os, const BankAccount& acc);
    
    // Friend class
    friend class Auditor;
    
    // Friend function منفردة
    friend void emergencyWithdraw(BankAccount& acc, double amount);
};

// تحقيق Friend function
ostream& operator<<(ostream& os, const BankAccount& acc) {
    os << "الحساب: " << acc.accountNumber << endl;
    os << "المالك: " << acc.ownerName << endl;
    os << "الرصيد: $" << acc.balance;
    return os;
}

// تحقيق Friend class methods
void Auditor::audit(const BankAccount& account) {
    cout << "\\n🔍 تدقيق الحساب: " << account.accountNumber << endl;
    cout << "الرصيد الحالي: $" << account.balance << endl;
    cout << "عدد المعاملات: " << account.transactions.size() << endl;
    
    // يمكن الوصول لـ PIN (للتدقيق فقط!)
    cout << "PIN مُعيّن: " << (account.pin.empty() ? "لا" : "نعم") << endl;
}

void Auditor::fullReport(const BankAccount& account) {
    cout << "\\n📊 تقرير تفصيلي" << endl;
    cout << "================" << endl;
    cout << "رقم الحساب: " << account.accountNumber << endl;
    cout << "صاحب الحساب: " << account.ownerName << endl;
    cout << "الرصيد: $" << account.balance << endl;
    
    cout << "\\nسجل المعاملات:" << endl;
    for (const auto& t : account.transactions) {
        cout << "  - " << t.type << ": $" << t.amount << " (" << t.date << ")" << endl;
    }
}

// Friend function للطوارئ
void emergencyWithdraw(BankAccount& acc, double amount) {
    cout << "\\n⚠️ سحب طوارئ: $" << amount << endl;
    acc.balance -= amount;  // بدون PIN!
    acc.transactions.push_back({"سحب طوارئ", amount, "2024-01-15"});
}

int main() {
    BankAccount account("123456", "أحمد محمد", "1234", 5000);
    
    // عمليات عادية
    account.deposit(1000);
    account.withdraw(500, "1234");
    
    // طباعة باستخدام friend operator
    cout << account << endl;
    
    // تدقيق
    Auditor auditor;
    auditor.audit(account);
    auditor.fullReport(account);
    
    // سحب طوارئ
    emergencyWithdraw(account, 1000);
    
    cout << "\\nالرصيد النهائي: $" << account.balance << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 140,
    order: 9,
    quiz: {
      question: 'ما فائدة friend function؟',
      options: [
        'تسريع الكود',
        'الوصول لـ private members من خارج الـ class',
        'إنشاء كائنات جديدة',
        'منع الوراثة',
      ],
      correctAnswer: 1,
      explanation:
        'friend function تستطيع الوصول لـ private و protected members',
    },
  },
  {
    id: 'cpp-adv-10',
    courseId: 'cpp-oop',
    title: 'الوراثة المتعددة',
    description: 'Multiple Inheritance و Diamond Problem',
    content: `
# الوراثة المتعددة

## Multiple Inheritance
class يرث من أكثر من class واحد

\`\`\`cpp
class Child : public Parent1, public Parent2 { };
\`\`\`

## Diamond Problem
عندما يرث class من classين يرثان من نفس الـ base

## الحل: Virtual Inheritance
\`\`\`cpp
class Middle : virtual public Base { };
\`\`\`

## متى نستخدم الوراثة المتعددة؟
- تطبيق interfaces متعددة
- Mixin classes
- بحذر شديد!
`,
    codeExample: `#include <iostream>
#include <string>
using namespace std;

// ===== مثال 1: Interfaces متعددة =====
class ISwimmable {
public:
    virtual void swim() = 0;
    virtual ~ISwimmable() = default;
};

class IFlyable {
public:
    virtual void fly() = 0;
    virtual ~IFlyable() = default;
};

class IWalkable {
public:
    virtual void walk() = 0;
    virtual ~IWalkable() = default;
};

class Duck : public ISwimmable, public IFlyable, public IWalkable {
private:
    string name;
public:
    Duck(const string& n) : name(n) {}
    
    void swim() override {
        cout << "🦆 " << name << " يسبح في البحيرة" << endl;
    }
    
    void fly() override {
        cout << "🦆 " << name << " يطير في السماء" << endl;
    }
    
    void walk() override {
        cout << "🦆 " << name << " يمشي على الأرض" << endl;
    }
};

// ===== مثال 2: Diamond Problem =====
class Device {
protected:
    string brand;
    bool isOn;
public:
    Device(const string& b) : brand(b), isOn(false) {
        cout << "📱 Device Constructor: " << brand << endl;
    }
    
    virtual void turnOn() {
        isOn = true;
        cout << brand << " تم التشغيل" << endl;
    }
    
    virtual void turnOff() {
        isOn = false;
        cout << brand << " تم الإيقاف" << endl;
    }
};

// Virtual inheritance لحل Diamond Problem
class Phone : virtual public Device {
protected:
    string phoneNumber;
public:
    Phone(const string& b, const string& num) 
        : Device(b), phoneNumber(num) {
        cout << "📞 Phone Constructor" << endl;
    }
    
    void call(const string& number) {
        cout << "📞 اتصال بـ " << number << endl;
    }
};

class Camera : virtual public Device {
protected:
    int megapixels;
public:
    Camera(const string& b, int mp) 
        : Device(b), megapixels(mp) {
        cout << "📷 Camera Constructor" << endl;
    }
    
    void takePhoto() {
        cout << "📷 التقاط صورة بـ " << megapixels << " ميجابكسل" << endl;
    }
};

// Smartphone يرث من Phone و Camera (Diamond!)
class Smartphone : public Phone, public Camera {
public:
    Smartphone(const string& b, const string& num, int mp)
        : Device(b),  // يجب استدعاء Device مباشرة!
          Phone(b, num), 
          Camera(b, mp) {
        cout << "📱 Smartphone Constructor" << endl;
    }
    
    void turnOn() override {
        Device::turnOn();
        cout << "🔓 جاري فتح القفل..." << endl;
    }
    
    void showInfo() {
        cout << "\\n=== " << brand << " ===" << endl;
        cout << "رقم الهاتف: " << phoneNumber << endl;
        cout << "الكاميرا: " << megapixels << " MP" << endl;
    }
};

int main() {
    // مثال 1: Interfaces
    cout << "=== البطة ===" << endl;
    Duck duck("دونالد");
    duck.swim();
    duck.fly();
    duck.walk();
    
    // مثال 2: Smartphone
    cout << "\\n=== الهاتف الذكي ===" << endl;
    Smartphone phone("iPhone", "0512345678", 48);
    
    phone.showInfo();
    phone.turnOn();
    phone.call("0509876543");
    phone.takePhoto();
    phone.turnOff();
    
    // Polymorphism مع interfaces
    cout << "\\n=== Polymorphism ===" << endl;
    ISwimmable* swimmer = &duck;
    swimmer->swim();
    
    IFlyable* flyer = &duck;
    flyer->fly();
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 170,
    order: 10,
    quiz: {
      question: 'كيف نحل Diamond Problem؟',
      options: [
        'بتجنب الوراثة',
        'باستخدام virtual inheritance',
        'باستخدام private inheritance',
        'لا يمكن حلها',
      ],
      correctAnswer: 1,
      explanation:
        'virtual inheritance يضمن نسخة واحدة من الـ base class المشترك',
    },
  },
  {
    id: 'cpp-adv-11',
    courseId: 'cpp-oop',
    title: 'Nested و Local Classes',
    description: 'Classes داخل Classes',
    content: `
# Nested Classes

## ما هي Nested Class؟
class معرّفة داخل class أخرى

## الفوائد
- تنظيم أفضل
- إخفاء التفاصيل
- علاقة قوية بين الـ classes

## أنواع
- public nested: يمكن الوصول لها من الخارج
- private nested: فقط من الـ outer class

## Local Classes
class معرّفة داخل دالة (نادرة الاستخدام)
`,
    codeExample: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class LinkedList {
private:
    // Nested class - Node
    class Node {
    public:
        int data;
        Node* next;
        
        Node(int d) : data(d), next(nullptr) {}
    };
    
    Node* head;
    int size;

public:
    // Public nested class - Iterator
    class Iterator {
    private:
        Node* current;
    public:
        Iterator(Node* node) : current(node) {}
        
        int& operator*() { return current->data; }
        
        Iterator& operator++() {
            if (current) current = current->next;
            return *this;
        }
        
        bool operator!=(const Iterator& other) const {
            return current != other.current;
        }
    };
    
    LinkedList() : head(nullptr), size(0) {}
    
    ~LinkedList() {
        while (head) {
            Node* temp = head;
            head = head->next;
            delete temp;
        }
    }
    
    void push_front(int data) {
        Node* newNode = new Node(data);
        newNode->next = head;
        head = newNode;
        size++;
    }
    
    void push_back(int data) {
        Node* newNode = new Node(data);
        if (!head) {
            head = newNode;
        } else {
            Node* current = head;
            while (current->next) {
                current = current->next;
            }
            current->next = newNode;
        }
        size++;
    }
    
    int getSize() const { return size; }
    
    Iterator begin() { return Iterator(head); }
    Iterator end() { return Iterator(nullptr); }
};

// مثال آخر: Menu System
class Restaurant {
public:
    // Public nested class
    class MenuItem {
    private:
        string name;
        double price;
        string category;
    public:
        MenuItem(const string& n, double p, const string& c)
            : name(n), price(p), category(c) {}
        
        string getName() const { return name; }
        double getPrice() const { return price; }
        string getCategory() const { return category; }
        
        void display() const {
            cout << "  • " << name << " - $" << price << endl;
        }
    };

private:
    string name;
    vector<MenuItem> menu;

public:
    Restaurant(const string& n) : name(n) {}
    
    void addItem(const string& itemName, double price, const string& category) {
        menu.push_back(MenuItem(itemName, price, category));
    }
    
    void displayMenu() const {
        cout << "\\n🍽️ قائمة " << name << endl;
        cout << string(30, '=') << endl;
        
        string currentCategory = "";
        for (const auto& item : menu) {
            if (item.getCategory() != currentCategory) {
                currentCategory = item.getCategory();
                cout << "\\n" << currentCategory << ":" << endl;
            }
            item.display();
        }
    }
    
    double calculateTotal(const vector<int>& itemIndexes) const {
        double total = 0;
        for (int idx : itemIndexes) {
            if (idx >= 0 && idx < menu.size()) {
                total += menu[idx].getPrice();
            }
        }
        return total;
    }
};

int main() {
    // استخدام LinkedList مع Iterator
    cout << "=== LinkedList ===" << endl;
    LinkedList list;
    list.push_back(10);
    list.push_back(20);
    list.push_back(30);
    list.push_front(5);
    
    cout << "العناصر: ";
    for (LinkedList::Iterator it = list.begin(); it != list.end(); ++it) {
        cout << *it << " ";
    }
    cout << endl;
    
    // Range-based for (يعمل مع begin/end)
    cout << "باستخدام range-for: ";
    for (int x : list) {
        cout << x << " ";
    }
    cout << endl;
    
    // استخدام Restaurant
    cout << "\\n=== Restaurant ===" << endl;
    Restaurant restaurant("البيت العربي");
    
    restaurant.addItem("حمص", 5.99, "المقبلات");
    restaurant.addItem("فتوش", 6.99, "المقبلات");
    restaurant.addItem("شاورما", 12.99, "الأطباق الرئيسية");
    restaurant.addItem("كباب", 15.99, "الأطباق الرئيسية");
    restaurant.addItem("كنافة", 7.99, "الحلويات");
    
    restaurant.displayMenu();
    
    // إنشاء MenuItem من الخارج
    Restaurant::MenuItem customItem("طبق خاص", 20.00, "خاص");
    cout << "\\nطبق مخصص: " << customItem.getName() << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 150,
    order: 11,
    quiz: {
      question: 'لماذا نستخدم Nested Classes؟',
      options: [
        'لتسريع الكود',
        'لتنظيم الكود وإخفاء التفاصيل',
        'لتوفير الذاكرة',
        'لمنع الوراثة',
      ],
      correctAnswer: 1,
      explanation:
        'Nested Classes تساعد في تنظيم الكود وإخفاء التفاصيل التي تخص الـ outer class فقط',
    },
  },
  {
    id: 'cpp-adv-12',
    courseId: 'cpp-oop',
    title: 'مشروع OOP متكامل',
    description: 'تطبيق جميع مفاهيم OOP',
    content: `
# مشروع: نظام إدارة مكتبة

## المتطلبات
- إدارة الكتب والأعضاء
- نظام الاستعارة والإرجاع
- البحث والتقارير
- حفظ البيانات

## المفاهيم المستخدمة
- Classes و Inheritance
- Polymorphism
- Encapsulation
- Static Members
- Operator Overloading
`,
    codeExample: `#include <iostream>
#include <vector>
#include <memory>
#include <algorithm>
using namespace std;

// ===== Base Classes =====
class Person {
protected:
    int id;
    string name;
    string phone;
    static int nextId;

public:
    Person(const string& n, const string& p) 
        : id(nextId++), name(n), phone(p) {}
    
    virtual void display() const = 0;
    virtual ~Person() = default;
    
    int getId() const { return id; }
    string getName() const { return name; }
};

int Person::nextId = 1;

// ===== Book Class =====
class Book {
private:
    string isbn;
    string title;
    string author;
    bool available;
    int borrowerId;

public:
    Book(const string& i, const string& t, const string& a)
        : isbn(i), title(t), author(a), available(true), borrowerId(0) {}
    
    // Getters
    string getISBN() const { return isbn; }
    string getTitle() const { return title; }
    string getAuthor() const { return author; }
    bool isAvailable() const { return available; }
    int getBorrowerId() const { return borrowerId; }
    
    // Operations
    void borrow(int memberId) {
        available = false;
        borrowerId = memberId;
    }
    
    void returnBook() {
        available = true;
        borrowerId = 0;
    }
    
    // Operator overloading
    friend ostream& operator<<(ostream& os, const Book& b) {
        os << "📖 " << b.title << " - " << b.author;
        os << " [" << (b.available ? "متاح ✅" : "مُعار ❌") << "]";
        return os;
    }
};

// ===== Member Classes =====
class Member : public Person {
private:
    vector<string> borrowedBooks;  // ISBNs
    static const int MAX_BOOKS = 3;

public:
    Member(const string& n, const string& p) : Person(n, p) {}
    
    bool canBorrow() const {
        return borrowedBooks.size() < MAX_BOOKS;
    }
    
    void addBook(const string& isbn) {
        borrowedBooks.push_back(isbn);
    }
    
    void removeBook(const string& isbn) {
        auto it = find(borrowedBooks.begin(), borrowedBooks.end(), isbn);
        if (it != borrowedBooks.end()) {
            borrowedBooks.erase(it);
        }
    }
    
    int getBorrowedCount() const { return borrowedBooks.size(); }
    
    void display() const override {
        cout << "👤 عضو #" << id << ": " << name << endl;
        cout << "   الهاتف: " << phone << endl;
        cout << "   الكتب المستعارة: " << borrowedBooks.size() << "/" << MAX_BOOKS << endl;
    }
};

class Librarian : public Person {
private:
    string employeeId;

public:
    Librarian(const string& n, const string& p, const string& empId)
        : Person(n, p), employeeId(empId) {}
    
    void display() const override {
        cout << "📚 أمين مكتبة #" << id << ": " << name << endl;
        cout << "   رقم الموظف: " << employeeId << endl;
    }
};

// ===== Library System =====
class Library {
private:
    string name;
    vector<unique_ptr<Book>> books;
    vector<unique_ptr<Member>> members;
    vector<unique_ptr<Librarian>> staff;

public:
    Library(const string& n) : name(n) {}
    
    // إضافة كتاب
    void addBook(const string& isbn, const string& title, const string& author) {
        books.push_back(make_unique<Book>(isbn, title, author));
        cout << "✅ تمت إضافة: " << title << endl;
    }
    
    // إضافة عضو
    int addMember(const string& name, const string& phone) {
        auto member = make_unique<Member>(name, phone);
        int id = member->getId();
        members.push_back(move(member));
        cout << "✅ تسجيل عضو جديد: " << name << " (ID: " << id << ")" << endl;
        return id;
    }
    
    // البحث عن كتاب
    Book* findBook(const string& isbn) {
        for (auto& book : books) {
            if (book->getISBN() == isbn) {
                return book.get();
            }
        }
        return nullptr;
    }
    
    // البحث عن عضو
    Member* findMember(int id) {
        for (auto& member : members) {
            if (member->getId() == id) {
                return member.get();
            }
        }
        return nullptr;
    }
    
    // استعارة كتاب
    bool borrowBook(int memberId, const string& isbn) {
        Member* member = findMember(memberId);
        Book* book = findBook(isbn);
        
        if (!member) {
            cout << "❌ العضو غير موجود" << endl;
            return false;
        }
        if (!book) {
            cout << "❌ الكتاب غير موجود" << endl;
            return false;
        }
        if (!book->isAvailable()) {
            cout << "❌ الكتاب غير متاح" << endl;
            return false;
        }
        if (!member->canBorrow()) {
            cout << "❌ وصلت للحد الأقصى من الاستعارة" << endl;
            return false;
        }
        
        book->borrow(memberId);
        member->addBook(isbn);
        cout << "✅ تم استعارة: " << book->getTitle() << endl;
        return true;
    }
    
    // إرجاع كتاب
    bool returnBook(int memberId, const string& isbn) {
        Member* member = findMember(memberId);
        Book* book = findBook(isbn);
        
        if (!member || !book) {
            cout << "❌ بيانات غير صحيحة" << endl;
            return false;
        }
        
        book->returnBook();
        member->removeBook(isbn);
        cout << "✅ تم الإرجاع: " << book->getTitle() << endl;
        return true;
    }
    
    // عرض جميع الكتب
    void displayBooks() const {
        cout << "\\n📚 كتب " << name << endl;
        cout << string(40, '=') << endl;
        for (const auto& book : books) {
            cout << *book << endl;
        }
    }
    
    // عرض الأعضاء
    void displayMembers() const {
        cout << "\\n👥 أعضاء المكتبة" << endl;
        cout << string(40, '=') << endl;
        for (const auto& member : members) {
            member->display();
            cout << endl;
        }
    }
    
    // إحصائيات
    void showStats() const {
        int available = count_if(books.begin(), books.end(),
            [](const auto& b) { return b->isAvailable(); });
        
        cout << "\\n📊 إحصائيات" << endl;
        cout << "إجمالي الكتب: " << books.size() << endl;
        cout << "الكتب المتاحة: " << available << endl;
        cout << "الكتب المُعارة: " << (books.size() - available) << endl;
        cout << "عدد الأعضاء: " << members.size() << endl;
    }
};

int main() {
    Library library("مكتبة المعرفة");
    
    // إضافة كتب
    cout << "=== إضافة كتب ===" << endl;
    library.addBook("978-1", "تعلم C++", "أحمد محمد");
    library.addBook("978-2", "هياكل البيانات", "سارة علي");
    library.addBook("978-3", "الخوارزميات", "محمد خالد");
    
    // إضافة أعضاء
    cout << "\\n=== تسجيل أعضاء ===" << endl;
    int member1 = library.addMember("علي", "0501234567");
    int member2 = library.addMember("فاطمة", "0509876543");
    
    // عرض الكتب
    library.displayBooks();
    
    // استعارة
    cout << "\\n=== الاستعارة ===" << endl;
    library.borrowBook(member1, "978-1");
    library.borrowBook(member1, "978-2");
    library.borrowBook(member2, "978-3");
    
    // عرض بعد الاستعارة
    library.displayBooks();
    library.displayMembers();
    
    // إرجاع
    cout << "=== الإرجاع ===" << endl;
    library.returnBook(member1, "978-1");
    
    // الإحصائيات
    library.showStats();
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 250,
    order: 12,
    quiz: {
      question: 'ما أهم ميزة استخدمناها لإدارة الذاكرة في هذا المشروع؟',
      options: [
        'Raw pointers',
        'References',
        'Smart pointers (unique_ptr)',
        'Static allocation',
      ],
      correctAnswer: 2,
      explanation:
        'استخدمنا unique_ptr لإدارة الذاكرة تلقائياً ومنع Memory Leaks',
    },
  },
  {
    id: 'cpp-adv-13',
    courseId: 'cpp-advanced',
    title: 'Templates',
    description: 'البرمجة العامة (Generic)',
    content: `
# Templates في C++

Templates = كود يعمل مع أي نوع بيانات.

## Function Template
\`\`\`cpp
template <typename T>
T function(T param) { }
\`\`\`

## Class Template
\`\`\`cpp
template <typename T>
class MyClass { };
\`\`\`

## الفوائد
- كود واحد لأنواع متعددة
- Type Safety
- أداء عالي (compile-time)
`,
    codeExample: `#include <iostream>
#include <vector>
using namespace std;

// Function Template
template <typename T>
T maximum(T a, T b) {
    return (a > b) ? a : b;
}

// Template مع عدة أنواع
template <typename T, typename U>
auto add(T a, U b) -> decltype(a + b) {
    return a + b;
}

// Class Template
template <typename T>
class Stack {
private:
    vector<T> items;

public:
    void push(T item) {
        items.push_back(item);
    }
    
    T pop() {
        if (isEmpty()) throw runtime_error("Stack is empty");
        T item = items.back();
        items.pop_back();
        return item;
    }
    
    T top() const {
        if (isEmpty()) throw runtime_error("Stack is empty");
        return items.back();
    }
    
    bool isEmpty() const {
        return items.empty();
    }
    
    size_t size() const {
        return items.size();
    }
};

// Template مع قيمة افتراضية
template <typename T = int, int SIZE = 10>
class Array {
private:
    T data[SIZE];
public:
    T& operator[](int index) {
        return data[index];
    }
    int getSize() const { return SIZE; }
};

int main() {
    // Function Template
    cout << "max(3, 5) = " << maximum(3, 5) << endl;
    cout << "max(3.5, 2.1) = " << maximum(3.5, 2.1) << endl;
    cout << "max('a', 'z') = " << maximum('a', 'z') << endl;
    
    cout << "add(3, 2.5) = " << add(3, 2.5) << endl;
    
    // Class Template
    Stack<int> intStack;
    intStack.push(10);
    intStack.push(20);
    intStack.push(30);
    
    cout << "\\nStack:" << endl;
    while (!intStack.isEmpty()) {
        cout << intStack.pop() << " ";
    }
    cout << endl;
    
    Stack<string> strStack;
    strStack.push("مرحباً");
    strStack.push("عالم");
    cout << "Top: " << strStack.top() << endl;
    
    // Template مع قيم افتراضية
    Array<double, 5> arr;
    for (int i = 0; i < arr.getSize(); i++) {
        arr[i] = i * 1.5;
    }
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 180,
    order: 1,
    quiz: {
      question: 'ما فائدة Templates؟',
      options: [
        'تسريع البرنامج',
        'كتابة كود يعمل مع أنواع متعددة',
        'تقليل حجم البرنامج',
        'إضافة GUI',
      ],
      correctAnswer: 1,
      explanation: 'Templates تسمح بكتابة كود عام يعمل مع أي نوع بيانات',
    },
  },
  {
    // كان المعرّف 'cpp-adv-4' مكرراً مع درس Polymorphism في cpp-oop (إكمال أحدهما كان يُحسب للآخر)
    id: 'cpp-advanced-stl-containers',
    courseId: 'cpp-advanced',
    title: 'STL Containers',
    description: 'مكتبة القوالب القياسية',
    content: `
# STL - Standard Template Library

## أهم الحاويات

### Sequence Containers
- vector: مصفوفة ديناميكية
- list: قائمة مرتبطة
- deque: صف مزدوج الطرف

### Associative Containers
- set: مجموعة فريدة مرتبة
- map: قاموس (مفتاح-قيمة)

### Unordered
- unordered_set
- unordered_map (أسرع، غير مرتب)

## Iterators
للمرور على الحاويات
`,
    codeExample: `#include <iostream>
#include <vector>
#include <list>
#include <set>
#include <map>
#include <algorithm>
using namespace std;

int main() {
    // ===== vector =====
    vector<int> vec = {3, 1, 4, 1, 5, 9};
    
    vec.push_back(2);   // إضافة في النهاية
    vec.pop_back();     // حذف الأخير
    
    cout << "Vector: ";
    for (int n : vec) cout << n << " ";
    cout << endl;
    
    // الفرز
    sort(vec.begin(), vec.end());
    cout << "Sorted: ";
    for (int n : vec) cout << n << " ";
    cout << endl;
    
    // ===== list =====
    list<string> names = {"أحمد", "محمد", "علي"};
    names.push_front("سالم");  // إضافة في البداية
    
    cout << "\\nList: ";
    for (const string& n : names) cout << n << " ";
    cout << endl;
    
    // ===== set =====
    set<int> mySet = {3, 1, 4, 1, 5, 9};  // الـ 1 المكرر يُحذف
    
    cout << "\\nSet: ";
    for (int n : mySet) cout << n << " ";  // مرتب تلقائياً
    cout << endl;
    
    if (mySet.find(4) != mySet.end()) {
        cout << "4 موجود!" << endl;
    }
    
    // ===== map =====
    map<string, int> ages;
    ages["أحمد"] = 25;
    ages["محمد"] = 30;
    ages["علي"] = 28;
    
    cout << "\\nMap:" << endl;
    for (const auto& pair : ages) {
        cout << pair.first << ": " << pair.second << endl;
    }
    
    cout << "عمر أحمد: " << ages["أحمد"] << endl;
    
    // ===== Algorithms =====
    vector<int> nums = {5, 2, 8, 1, 9, 3};
    
    // الحد الأقصى والأدنى
    cout << "\\nMax: " << *max_element(nums.begin(), nums.end()) << endl;
    cout << "Min: " << *min_element(nums.begin(), nums.end()) << endl;
    
    // البحث
    auto it = find(nums.begin(), nums.end(), 8);
    if (it != nums.end()) {
        cout << "8 موجود في الفهرس: " << (it - nums.begin()) << endl;
    }
    
    // العد
    vector<int> data = {1, 2, 3, 2, 4, 2, 5};
    cout << "عدد مرات 2: " << count(data.begin(), data.end(), 2) << endl;
    
    // العكس
    reverse(nums.begin(), nums.end());
    cout << "Reversed: ";
    for (int n : nums) cout << n << " ";
    cout << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 180,
    order: 2,
    quiz: {
      question: 'ما الحاوية المناسبة لتخزين عناصر فريدة؟',
      options: ['vector', 'list', 'set', 'deque'],
      correctAnswer: 2,
      explanation: 'set يحذف التكرارات تلقائياً ويحافظ على الفرادة',
    },
  },
  {
    id: 'cpp-adv-15',
    courseId: 'cpp-advanced',
    title: 'STL Algorithms',
    description: 'خوارزميات المكتبة القياسية',
    content: `
# STL Algorithms

## فئات الخوارزميات

### Non-modifying
- find, count, search
- all_of, any_of, none_of

### Modifying
- copy, move, transform
- replace, fill, generate

### Sorting
- sort, stable_sort, partial_sort
- nth_element

### Numeric
- accumulate, inner_product
- partial_sum

## Lambda Expressions
دوال مجهولة للاستخدام السريع
`,
    codeExample: `#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
    vector<int> nums = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    // ===== Non-modifying =====
    cout << "=== Non-modifying ===" << endl;
    
    // find
    auto it = find(nums.begin(), nums.end(), 8);
    if (it != nums.end()) {
        cout << "وجدنا 8 في الموقع: " << (it - nums.begin()) << endl;
    }
    
    // count
    vector<int> data = {1, 2, 2, 3, 2, 4, 2};
    cout << "عدد مرات 2: " << count(data.begin(), data.end(), 2) << endl;
    
    // all_of, any_of, none_of
    bool allPositive = all_of(nums.begin(), nums.end(), [](int x) { return x > 0; });
    bool hasEven = any_of(nums.begin(), nums.end(), [](int x) { return x % 2 == 0; });
    bool noNegative = none_of(nums.begin(), nums.end(), [](int x) { return x < 0; });
    
    cout << "كلها موجبة: " << (allPositive ? "نعم" : "لا") << endl;
    cout << "يوجد زوجي: " << (hasEven ? "نعم" : "لا") << endl;
    
    // ===== Modifying =====
    cout << "\\n=== Modifying ===" << endl;
    
    // transform
    vector<int> squared(nums.size());
    transform(nums.begin(), nums.end(), squared.begin(), 
              [](int x) { return x * x; });
    
    cout << "مربعات: ";
    for (int n : squared) cout << n << " ";
    cout << endl;
    
    // replace
    vector<int> replaced = nums;
    replace(replaced.begin(), replaced.end(), 5, 50);
    cout << "بعد استبدال 5 بـ 50: ";
    for (int n : replaced) cout << n << " ";
    cout << endl;
    
    // fill
    vector<int> filled(5);
    fill(filled.begin(), filled.end(), 7);
    cout << "ملء بـ 7: ";
    for (int n : filled) cout << n << " ";
    cout << endl;
    
    // ===== Sorting =====
    cout << "\\n=== Sorting ===" << endl;
    
    vector<int> toSort = nums;
    sort(toSort.begin(), toSort.end());
    cout << "تصاعدي: ";
    for (int n : toSort) cout << n << " ";
    cout << endl;
    
    sort(toSort.begin(), toSort.end(), greater<int>());
    cout << "تنازلي: ";
    for (int n : toSort) cout << n << " ";
    cout << endl;
    
    // partial_sort (أصغر 3)
    vector<int> partial = nums;
    partial_sort(partial.begin(), partial.begin() + 3, partial.end());
    cout << "أصغر 3: ";
    for (int i = 0; i < 3; i++) cout << partial[i] << " ";
    cout << endl;
    
    // ===== Numeric =====
    cout << "\\n=== Numeric ===" << endl;
    
    int sum = accumulate(nums.begin(), nums.end(), 0);
    cout << "المجموع: " << sum << endl;
    
    int product = accumulate(nums.begin(), nums.end(), 1, multiplies<int>());
    cout << "الضرب: " << product << endl;
    
    // ===== Lambda المتقدمة =====
    cout << "\\n=== Lambda ===" << endl;
    
    // Lambda مع capture
    int threshold = 5;
    int countAbove = count_if(nums.begin(), nums.end(), 
                              [threshold](int x) { return x > threshold; });
    cout << "أكبر من " << threshold << ": " << countAbove << endl;
    
    // Lambda مع modify
    vector<int> modified = nums;
    int multiplier = 2;
    for_each(modified.begin(), modified.end(), 
             [multiplier](int& x) { x *= multiplier; });
    cout << "مضروب في 2: ";
    for (int n : modified) cout << n << " ";
    cout << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 180,
    order: 3,
    quiz: {
      question: 'ما الفرق بين find و find_if؟',
      options: [
        'لا فرق',
        'find تبحث عن قيمة، find_if تستخدم شرط',
        'find_if أسرع',
        'find تعمل على strings فقط',
      ],
      correctAnswer: 1,
      explanation:
        'find تبحث عن قيمة محددة، find_if تستخدم predicate/شرط للبحث',
    },
  },
  {
    id: 'cpp-adv-16',
    courseId: 'cpp-advanced',
    title: 'Lambda Expressions',
    description: 'الدوال المجهولة في C++ الحديثة',
    content: `
# Lambda Expressions (C++11)

## الصيغة
\`\`\`cpp
[capture](parameters) -> return_type {
    body
}
\`\`\`

## Capture
- \`[]\`: لا شيء
- \`[=]\`: كل شيء by value
- \`[&]\`: كل شيء by reference
- \`[x, &y]\`: x by value, y by reference

## استخدامات شائعة
- مع STL Algorithms
- Callbacks
- كود مختصر
`,
    codeExample: `#include <iostream>
#include <vector>
#include <algorithm>
#include <functional>
using namespace std;

int main() {
    // ===== أساسيات Lambda =====
    cout << "=== أساسيات ===" << endl;
    
    // Lambda بسيطة
    auto hello = []() { cout << "مرحباً!" << endl; };
    hello();
    
    // Lambda مع معاملات
    auto add = [](int a, int b) { return a + b; };
    cout << "5 + 3 = " << add(5, 3) << endl;
    
    // Lambda مع نوع الإرجاع صريح
    auto divide = [](double a, double b) -> double {
        if (b == 0) return 0;
        return a / b;
    };
    cout << "10 / 3 = " << divide(10, 3) << endl;
    
    // ===== Capture =====
    cout << "\\n=== Capture ===" << endl;
    
    int x = 10;
    int y = 20;
    
    // Capture by value
    auto byValue = [x, y]() {
        cout << "x = " << x << ", y = " << y << endl;
        // x = 50;  // خطأ! نسخة ثابتة
    };
    byValue();
    
    // Capture by reference
    auto byRef = [&x, &y]() {
        x *= 2;
        y *= 2;
    };
    byRef();
    cout << "بعد التعديل: x = " << x << ", y = " << y << endl;
    
    // Capture all by value
    auto allByValue = [=]() {
        return x + y;
    };
    cout << "المجموع: " << allByValue() << endl;
    
    // Capture all by reference
    int counter = 0;
    auto increment = [&]() { counter++; };
    increment();
    increment();
    increment();
    cout << "العداد: " << counter << endl;
    
    // مزيج
    int a = 5, b = 10;
    auto mixed = [a, &b]() {
        b += a;  // b بالمرجع، a بالقيمة
    };
    mixed();
    cout << "b = " << b << endl;
    
    // ===== مع STL =====
    cout << "\\n=== مع STL ===" << endl;
    
    vector<int> nums = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    // sort مخصص
    sort(nums.begin(), nums.end(), [](int a, int b) {
        return a > b;  // تنازلي
    });
    cout << "تنازلي: ";
    for (int n : nums) cout << n << " ";
    cout << endl;
    
    // filter (remove_if + erase)
    nums.erase(
        remove_if(nums.begin(), nums.end(), [](int x) { return x < 5; }),
        nums.end()
    );
    cout << "أكبر من 5: ";
    for (int n : nums) cout << n << " ";
    cout << endl;
    
    // for_each
    cout << "المربعات: ";
    for_each(nums.begin(), nums.end(), [](int x) {
        cout << x * x << " ";
    });
    cout << endl;
    
    // ===== Lambda متقدمة =====
    cout << "\\n=== متقدم ===" << endl;
    
    // Mutable lambda
    int count = 0;
    auto mutableLambda = [count]() mutable {
        count++;  // يعمل لأن mutable
        return count;
    };
    cout << mutableLambda() << " ";  // 1
    cout << mutableLambda() << " ";  // 2
    cout << mutableLambda() << endl; // 3
    cout << "الأصلي: " << count << endl;  // 0 (لم يتغير)
    
    // Generic lambda (C++14)
    auto genericAdd = [](auto a, auto b) { return a + b; };
    cout << genericAdd(5, 3) << endl;      // int
    cout << genericAdd(2.5, 1.5) << endl;  // double
    cout << genericAdd(string("Hello "), string("World")) << endl;
    
    // Lambda كـ callback
    function<void(int)> callback = [](int result) {
        cout << "النتيجة: " << result << endl;
    };
    
    auto compute = [](int x, function<void(int)> cb) {
        cb(x * x);
    };
    compute(5, callback);
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 170,
    order: 4,
    quiz: {
      question: 'ماذا يعني [&] في Lambda؟',
      options: [
        'لا capture',
        'capture الكل by value',
        'capture الكل by reference',
        'خطأ نحوي',
      ],
      correctAnswer: 2,
      explanation: '[&] يعني capture جميع المتغيرات المحيطة by reference',
    },
  },
  {
    id: 'cpp-adv-17',
    courseId: 'cpp-advanced',
    title: 'Exception Handling',
    description: 'التعامل مع الأخطاء والاستثناءات',
    content: `
# Exception Handling

## الهيكل الأساسي
\`\`\`cpp
try {
    // كود قد يسبب خطأ
} catch (ExceptionType& e) {
    // معالجة الخطأ
}
\`\`\`

## رمي استثناء
\`\`\`cpp
throw exception_object;
\`\`\`

## استثناءات قياسية
- std::exception (الأساسي)
- std::runtime_error
- std::logic_error
- std::out_of_range
- std::invalid_argument

## noexcept
للدوال التي لا ترمي استثناءات
`,
    codeExample: `#include <iostream>
#include <stdexcept>
#include <string>
using namespace std;

// استثناء مخصص
class InsufficientFundsException : public exception {
private:
    double amount;
    double balance;
    string message;

public:
    InsufficientFundsException(double amt, double bal)
        : amount(amt), balance(bal) {
        message = "رصيد غير كافٍ! المطلوب: " + to_string(amt) 
                + ", المتاح: " + to_string(bal);
    }
    
    const char* what() const noexcept override {
        return message.c_str();
    }
    
    double getShortfall() const { return amount - balance; }
};

class BankAccount {
private:
    double balance;

public:
    BankAccount(double initial) : balance(initial) {
        if (initial < 0) {
            throw invalid_argument("الرصيد لا يمكن أن يكون سالباً");
        }
    }
    
    void deposit(double amount) {
        if (amount <= 0) {
            throw invalid_argument("مبلغ الإيداع يجب أن يكون موجباً");
        }
        balance += amount;
    }
    
    void withdraw(double amount) {
        if (amount <= 0) {
            throw invalid_argument("مبلغ السحب يجب أن يكون موجباً");
        }
        if (amount > balance) {
            throw InsufficientFundsException(amount, balance);
        }
        balance -= amount;
    }
    
    double getBalance() const noexcept { return balance; }
};

// دالة مع عدة استثناءات
double divide(double a, double b) {
    if (b == 0) {
        throw runtime_error("قسمة على صفر!");
    }
    return a / b;
}

int getElement(const vector<int>& vec, int index) {
    if (index < 0 || index >= vec.size()) {
        throw out_of_range("فهرس خارج النطاق: " + to_string(index));
    }
    return vec[index];
}

int main() {
    // ===== try-catch أساسي =====
    cout << "=== try-catch أساسي ===" << endl;
    
    try {
        double result = divide(10, 0);
        cout << "النتيجة: " << result << endl;
    } catch (const runtime_error& e) {
        cout << "❌ خطأ: " << e.what() << endl;
    }
    
    // ===== عدة catch blocks =====
    cout << "\\n=== عدة catch ===" << endl;
    
    vector<int> nums = {1, 2, 3, 4, 5};
    
    try {
        cout << getElement(nums, 10) << endl;
    } catch (const out_of_range& e) {
        cout << "❌ خطأ في النطاق: " << e.what() << endl;
    } catch (const exception& e) {
        cout << "❌ خطأ عام: " << e.what() << endl;
    }
    
    // ===== استثناء مخصص =====
    cout << "\\n=== استثناء مخصص ===" << endl;
    
    try {
        BankAccount account(1000);
        account.withdraw(1500);
    } catch (const InsufficientFundsException& e) {
        cout << "❌ " << e.what() << endl;
        cout << "   ينقصك: $" << e.getShortfall() << endl;
    } catch (const invalid_argument& e) {
        cout << "❌ خطأ في الإدخال: " << e.what() << endl;
    }
    
    // ===== catch all =====
    cout << "\\n=== catch all ===" << endl;
    
    try {
        throw 42;  // رمي أي شيء
    } catch (...) {
        cout << "❌ حدث خطأ غير معروف!" << endl;
    }
    
    // ===== إعادة الرمي =====
    cout << "\\n=== إعادة الرمي ===" << endl;
    
    try {
        try {
            throw runtime_error("خطأ داخلي");
        } catch (const exception& e) {
            cout << "معالجة أولية: " << e.what() << endl;
            throw;  // إعادة الرمي
        }
    } catch (const exception& e) {
        cout << "معالجة نهائية: " << e.what() << endl;
    }
    
    // ===== noexcept =====
    cout << "\\n=== noexcept ===" << endl;
    
    BankAccount account(500);
    cout << "الرصيد: " << account.getBalance() << endl;  // آمن دائماً
    
    cout << "\\n✓ البرنامج استمر بنجاح!" << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 160,
    order: 5,
    quiz: {
      question: 'ما فائدة noexcept؟',
      options: [
        'تمنع الأخطاء',
        'تعلن أن الدالة لن ترمي استثناءات',
        'تلتقط جميع الاستثناءات',
        'ترمي استثناء',
      ],
      correctAnswer: 1,
      explanation:
        'noexcept تعلن أن الدالة لن ترمي أي استثناء، مما يساعد في التحسين',
    },
  },
  {
    id: 'cpp-adv-18',
    courseId: 'cpp-advanced',
    title: 'Move Semantics',
    description: 'تحسين الأداء بنقل الموارد',
    content: `
# Move Semantics (C++11)

## المشكلة
النسخ مكلف للكائنات الكبيرة

## الحل
نقل الموارد بدلاً من نسخها

## Rvalue Reference
\`\`\`cpp
Type&&  // مرجع للقيم المؤقتة
\`\`\`

## std::move
تحويل lvalue إلى rvalue للتمكين من النقل

## متى يُستدعى Move؟
- الكائنات المؤقتة
- بعد std::move
- return من دالة
`,
    codeExample: `#include <iostream>
#include <string>
#include <vector>
#include <utility>
using namespace std;

class MyVector {
private:
    int* data;
    size_t size;
    
    void log(const string& msg) const {
        cout << msg << " (size=" << size << ")" << endl;
    }

public:
    // Constructor
    MyVector(size_t n = 0) : size(n) {
        data = n > 0 ? new int[n]() : nullptr;
        log("📦 Constructor");
    }
    
    // Destructor
    ~MyVector() {
        log("🗑️ Destructor");
        delete[] data;
    }
    
    // Copy Constructor
    MyVector(const MyVector& other) : size(other.size) {
        data = new int[size];
        copy(other.data, other.data + size, data);
        log("📋 Copy Constructor");
    }
    
    // Copy Assignment
    MyVector& operator=(const MyVector& other) {
        log("📋 Copy Assignment");
        if (this != &other) {
            delete[] data;
            size = other.size;
            data = new int[size];
            copy(other.data, other.data + size, data);
        }
        return *this;
    }
    
    // Move Constructor
    MyVector(MyVector&& other) noexcept : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
        log("🚀 Move Constructor");
    }
    
    // Move Assignment
    MyVector& operator=(MyVector&& other) noexcept {
        log("🚀 Move Assignment");
        if (this != &other) {
            delete[] data;
            data = other.data;
            size = other.size;
            other.data = nullptr;
            other.size = 0;
        }
        return *this;
    }
    
    size_t getSize() const { return size; }
};

MyVector createVector(size_t n) {
    return MyVector(n);  // سيستخدم Move
}

class Widget {
    string name;
    vector<int> data;

public:
    // Constructor يستقبل by value وينقل
    Widget(string n, vector<int> d) 
        : name(move(n)), data(move(d)) {
        cout << "Widget created: " << name << endl;
    }
};

int main() {
    cout << "=== Copy vs Move ===" << endl;
    
    MyVector v1(1000);
    
    cout << "\\n--- Copy ---" << endl;
    MyVector v2 = v1;  // Copy Constructor
    
    cout << "\\n--- Move ---" << endl;
    MyVector v3 = move(v1);  // Move Constructor
    cout << "v1 size after move: " << v1.getSize() << endl;  // 0
    
    cout << "\\n--- Function Return ---" << endl;
    MyVector v4 = createVector(500);  // Move أو RVO
    
    cout << "\\n--- Assignment ---" << endl;
    MyVector v5(100);
    v5 = move(v4);  // Move Assignment
    
    // ===== std::move مع STL =====
    cout << "\\n=== std::move مع STL ===" << endl;
    
    vector<string> source = {"أ", "ب", "ج", "د"};
    vector<string> dest;
    
    // نقل عنصر
    dest.push_back(move(source[0]));
    cout << "source[0] بعد النقل: '" << source[0] << "'" << endl;  // فارغ
    
    // نقل كامل
    vector<string> source2 = {"1", "2", "3"};
    vector<string> dest2 = move(source2);
    cout << "source2 size بعد النقل: " << source2.size() << endl;
    
    // ===== Perfect Forwarding =====
    cout << "\\n=== Widget ===" << endl;
    
    string name = "Widget1";
    vector<int> data = {1, 2, 3, 4, 5};
    
    Widget w1(name, data);  // copies (name, data موجودين)
    cout << "name بعد w1: " << name << endl;  // لا يزال موجود
    
    Widget w2(move(name), move(data));  // moves
    cout << "name بعد w2: '" << name << "'" << endl;  // فارغ
    
    cout << "\\n=== النهاية ===" << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 180,
    order: 6,
    quiz: {
      question: 'ما فائدة Move Semantics؟',
      options: [
        'زيادة الأمان',
        'تقليل النسخ وتحسين الأداء',
        'إدارة الذاكرة تلقائياً',
        'دعم الوراثة المتعددة',
      ],
      correctAnswer: 1,
      explanation:
        'Move Semantics تنقل الموارد بدلاً من نسخها، مما يحسن الأداء كثيراً',
    },
  },
  {
    id: 'cpp-adv-19',
    courseId: 'cpp-advanced',
    title: 'Type Traits و SFINAE',
    description: 'البرمجة الوصفية في القوالب',
    content: `
# Type Traits و SFINAE

## Type Traits
معلومات عن الأنواع وقت الترجمة

## أمثلة
- is_integral
- is_floating_point
- is_pointer
- is_same

## SFINAE
Substitution Failure Is Not An Error

## استخدامات
- تخصيص الكود حسب النوع
- تمكين/تعطيل دوال
- Compile-time checks
`,
    codeExample: `#include <iostream>
#include <type_traits>
#include <vector>
using namespace std;

// ===== Type Traits الأساسية =====
template <typename T>
void printTypeInfo() {
    cout << "integral: " << is_integral<T>::value << endl;
    cout << "floating: " << is_floating_point<T>::value << endl;
    cout << "pointer: " << is_pointer<T>::value << endl;
    cout << "const: " << is_const<T>::value << endl;
    cout << "reference: " << is_reference<T>::value << endl;
}

// ===== enable_if =====
// نسخة للأعداد الصحيحة
template <typename T>
typename enable_if<is_integral<T>::value, T>::type
doubleValue(T x) {
    cout << "[int version] ";
    return x * 2;
}

// نسخة للأعداد العشرية
template <typename T>
typename enable_if<is_floating_point<T>::value, T>::type
doubleValue(T x) {
    cout << "[float version] ";
    return x * 2.0;
}

// ===== if constexpr (C++17) =====
template <typename T>
auto process(T value) {
    if constexpr (is_integral_v<T>) {
        return value * 2;
    } else if constexpr (is_floating_point_v<T>) {
        return value * 2.5;
    } else {
        return value;
    }
}

// ===== is_same =====
template <typename T, typename U>
void compareTypes() {
    if constexpr (is_same_v<T, U>) {
        cout << "نفس النوع!" << endl;
    } else {
        cout << "أنواع مختلفة" << endl;
    }
}

// ===== Remove qualifiers =====
template <typename T>
void showCleanType() {
    using CleanT = remove_cv_t<remove_reference_t<T>>;
    cout << "النوع الأصلي بعد التنظيف" << endl;
}

// ===== Type trait مخصص =====
template <typename T>
struct is_string : false_type {};

template <>
struct is_string<string> : true_type {};

template <>
struct is_string<const char*> : true_type {};

template <typename T>
void printValue(const T& value) {
    if constexpr (is_string<T>::value) {
        cout << "نص: \\"" << value << "\\"" << endl;
    } else if constexpr (is_arithmetic_v<T>) {
        cout << "رقم: " << value << endl;
    } else {
        cout << "نوع آخر" << endl;
    }
}

// ===== Concept-like constraint (C++11/14) =====
template <typename Container,
          typename = typename Container::value_type>
void printContainer(const Container& c) {
    cout << "[ ";
    for (const auto& item : c) {
        cout << item << " ";
    }
    cout << "]" << endl;
}

int main() {
    // Type Traits
    cout << "=== Type Traits ===" << endl;
    cout << "int:" << endl;
    printTypeInfo<int>();
    
    cout << "\\ndouble:" << endl;
    printTypeInfo<double>();
    
    // enable_if
    cout << "\\n=== enable_if ===" << endl;
    cout << doubleValue(5) << endl;      // int version
    cout << doubleValue(3.14) << endl;   // float version
    
    // if constexpr
    cout << "\\n=== if constexpr ===" << endl;
    cout << "process(10): " << process(10) << endl;
    cout << "process(3.0): " << process(3.0) << endl;
    
    // is_same
    cout << "\\n=== is_same ===" << endl;
    compareTypes<int, int>();
    compareTypes<int, double>();
    
    // Custom type trait
    cout << "\\n=== Custom Type Trait ===" << endl;
    printValue("مرحباً");
    printValue(42);
    printValue(3.14);
    
    // Container
    cout << "\\n=== Container ===" << endl;
    vector<int> nums = {1, 2, 3, 4, 5};
    printContainer(nums);
    
    // static_assert
    static_assert(is_integral_v<int>, "int must be integral");
    static_assert(sizeof(int) >= 4, "int must be at least 4 bytes");
    
    cout << "\\n✓ تم التحقق وقت الترجمة!" << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 200,
    order: 7,
    quiz: {
      question: 'ما فائدة enable_if؟',
      options: [
        'تسريع التنفيذ',
        'تفعيل/تعطيل دوال حسب النوع',
        'إدارة الذاكرة',
        'معالجة الأخطاء',
      ],
      correctAnswer: 1,
      explanation: 'enable_if تسمح بتفعيل template فقط إذا تحقق شرط على النوع',
    },
  },
  {
    id: 'cpp-adv-20',
    courseId: 'cpp-advanced',
    title: 'Multithreading',
    description: 'البرمجة المتوازية في C++',
    content: `
# Multithreading (C++11)

## المكونات الأساسية
- std::thread
- std::mutex
- std::lock_guard
- std::condition_variable
- std::future/promise
- std::async

## إنشاء Thread
\`\`\`cpp
std::thread t(function, args...);
t.join();  // انتظار الانتهاء
\`\`\`

## المخاطر
- Race Conditions
- Deadlocks
- Data Races
`,
    codeExample: `#include <iostream>
#include <thread>
#include <mutex>
#include <vector>
#include <future>
#include <chrono>
#include <atomic>
using namespace std;

mutex mtx;
atomic<int> atomicCounter(0);

// ===== Thread أساسي =====
void sayHello(int id) {
    lock_guard<mutex> lock(mtx);
    cout << "مرحباً من Thread " << id << endl;
}

void printNumbers(int start, int end) {
    for (int i = start; i <= end; i++) {
        lock_guard<mutex> lock(mtx);
        cout << this_thread::get_id() << ": " << i << endl;
        this_thread::sleep_for(chrono::milliseconds(100));
    }
}

// ===== مع Lambda =====
void lambdaExample() {
    int x = 10;
    
    thread t([&x]() {
        x *= 2;
        cout << "Thread: x = " << x << endl;
    });
    
    t.join();
    cout << "Main: x = " << x << endl;
}

// ===== Race Condition =====
int unsafeCounter = 0;
int safeCounter = 0;

void unsafeIncrement(int iterations) {
    for (int i = 0; i < iterations; i++) {
        unsafeCounter++;  // Race Condition!
    }
}

void safeIncrement(int iterations) {
    for (int i = 0; i < iterations; i++) {
        lock_guard<mutex> lock(mtx);
        safeCounter++;
    }
}

void atomicIncrement(int iterations) {
    for (int i = 0; i < iterations; i++) {
        atomicCounter++;  // Thread-safe!
    }
}

// ===== async و future =====
int computeSum(int start, int end) {
    int sum = 0;
    for (int i = start; i <= end; i++) {
        sum += i;
    }
    return sum;
}

long long fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "=== Threads الأساسية ===" << endl;
    
    vector<thread> threads;
    for (int i = 0; i < 5; i++) {
        threads.push_back(thread(sayHello, i));
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    // ===== Lambda =====
    cout << "\\n=== Lambda Thread ===" << endl;
    lambdaExample();
    
    // ===== Race Condition Demo =====
    cout << "\\n=== Race Condition ===" << endl;
    
    vector<thread> workers;
    
    // Unsafe
    for (int i = 0; i < 4; i++) {
        workers.push_back(thread(unsafeIncrement, 10000));
    }
    for (auto& w : workers) w.join();
    cout << "Unsafe counter: " << unsafeCounter << " (expected: 40000)" << endl;
    
    workers.clear();
    
    // Safe with mutex
    for (int i = 0; i < 4; i++) {
        workers.push_back(thread(safeIncrement, 10000));
    }
    for (auto& w : workers) w.join();
    cout << "Safe counter: " << safeCounter << endl;
    
    workers.clear();
    
    // Atomic
    for (int i = 0; i < 4; i++) {
        workers.push_back(thread(atomicIncrement, 10000));
    }
    for (auto& w : workers) w.join();
    cout << "Atomic counter: " << atomicCounter << endl;
    
    // ===== async =====
    cout << "\\n=== async ===" << endl;
    
    auto start = chrono::high_resolution_clock::now();
    
    // Parallel computation
    auto f1 = async(launch::async, computeSum, 1, 500000);
    auto f2 = async(launch::async, computeSum, 500001, 1000000);
    
    long long result = f1.get() + f2.get();
    
    auto end = chrono::high_resolution_clock::now();
    auto duration = chrono::duration_cast<chrono::milliseconds>(end - start);
    
    cout << "المجموع: " << result << endl;
    cout << "الوقت: " << duration.count() << " ms" << endl;
    
    // ===== Parallel Fibonacci =====
    cout << "\\n=== Parallel Fibonacci ===" << endl;
    
    start = chrono::high_resolution_clock::now();
    
    auto fib30 = async(launch::async, fibonacci, 30);
    auto fib35 = async(launch::async, fibonacci, 35);
    
    cout << "fib(30) = " << fib30.get() << endl;
    cout << "fib(35) = " << fib35.get() << endl;
    
    end = chrono::high_resolution_clock::now();
    duration = chrono::duration_cast<chrono::milliseconds>(end - start);
    cout << "الوقت: " << duration.count() << " ms" << endl;
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 200,
    order: 8,
    quiz: {
      question: 'كيف نحمي البيانات المشتركة من Race Conditions؟',
      options: [
        'باستخدام المزيد من Threads',
        'باستخدام mutex أو atomic',
        'بتجنب المتغيرات',
        'بإعادة تشغيل البرنامج',
      ],
      correctAnswer: 1,
      explanation:
        'mutex و atomic يحميان البيانات من الوصول المتزامن غير الآمن',
    },
  },
  {
    id: 'cpp-adv-21',
    courseId: 'cpp-advanced',
    title: 'File I/O والتعامل مع الملفات',
    description: 'قراءة وكتابة الملفات',
    content: `
# File I/O في C++

## Streams
- ifstream: للقراءة
- ofstream: للكتابة
- fstream: للقراءة والكتابة

## أوضاع الفتح
- ios::in: قراءة
- ios::out: كتابة
- ios::app: إضافة
- ios::binary: ثنائي
- ios::trunc: حذف المحتوى

## دوال مهمة
- open(), close()
- is_open(), good(), eof()
- getline(), read(), write()
`,
    codeExample: `#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <iomanip>
using namespace std;

struct Student {
    int id;
    string name;
    double gpa;
    
    string toString() const {
        return to_string(id) + "," + name + "," + to_string(gpa);
    }
    
    static Student fromString(const string& line) {
        Student s;
        stringstream ss(line);
        string token;
        
        getline(ss, token, ',');
        s.id = stoi(token);
        
        getline(ss, s.name, ',');
        
        getline(ss, token, ',');
        s.gpa = stod(token);
        
        return s;
    }
};

int main() {
    // ===== كتابة نص =====
    cout << "=== كتابة نص ===" << endl;
    {
        ofstream file("output.txt");
        if (!file.is_open()) {
            cerr << "فشل فتح الملف!" << endl;
            return 1;
        }
        
        file << "مرحباً بالعالم!" << endl;
        file << "سطر ثاني" << endl;
        file << "عدد: " << 42 << endl;
        
        file.close();
        cout << "✅ تم إنشاء output.txt" << endl;
    }
    
    // ===== قراءة نص =====
    cout << "\\n=== قراءة نص ===" << endl;
    {
        ifstream file("output.txt");
        if (file.is_open()) {
            string line;
            while (getline(file, line)) {
                cout << "> " << line << endl;
            }
            file.close();
        }
    }
    
    // ===== إضافة للملف =====
    cout << "\\n=== إضافة ===" << endl;
    {
        ofstream file("output.txt", ios::app);
        file << "سطر جديد مضاف!" << endl;
        file.close();
        cout << "✅ تم الإضافة" << endl;
    }
    
    // ===== CSV =====
    cout << "\\n=== كتابة CSV ===" << endl;
    {
        ofstream file("students.csv");
        file << "ID,Name,GPA" << endl;
        
        vector<Student> students = {
            {1, "أحمد", 3.8},
            {2, "سارة", 3.9},
            {3, "محمد", 3.5},
            {4, "فاطمة", 4.0}
        };
        
        for (const auto& s : students) {
            file << s.toString() << endl;
        }
        
        file.close();
        cout << "✅ تم إنشاء students.csv" << endl;
    }
    
    // ===== قراءة CSV =====
    cout << "\\n=== قراءة CSV ===" << endl;
    {
        ifstream file("students.csv");
        string line;
        
        getline(file, line);  // تخطي العنوان
        
        vector<Student> loaded;
        while (getline(file, line)) {
            loaded.push_back(Student::fromString(line));
        }
        
        cout << left << setw(5) << "ID" 
             << setw(15) << "Name" 
             << setw(5) << "GPA" << endl;
        cout << string(25, '-') << endl;
        
        for (const auto& s : loaded) {
            cout << left << setw(5) << s.id 
                 << setw(15) << s.name 
                 << setw(5) << fixed << setprecision(1) << s.gpa << endl;
        }
        
        file.close();
    }
    
    // ===== ملف ثنائي =====
    cout << "\\n=== ملف ثنائي ===" << endl;
    {
        // كتابة
        ofstream out("data.bin", ios::binary);
        vector<int> numbers = {10, 20, 30, 40, 50};
        out.write(reinterpret_cast<char*>(numbers.data()), 
                  numbers.size() * sizeof(int));
        out.close();
        cout << "✅ تم كتابة " << numbers.size() << " أرقام" << endl;
        
        // قراءة
        ifstream in("data.bin", ios::binary);
        vector<int> loaded(5);
        in.read(reinterpret_cast<char*>(loaded.data()), 
                loaded.size() * sizeof(int));
        in.close();
        
        cout << "الأرقام المقروءة: ";
        for (int n : loaded) cout << n << " ";
        cout << endl;
    }
    
    // ===== التحقق من وجود ملف =====
    cout << "\\n=== التحقق ===" << endl;
    {
        ifstream test("nonexistent.txt");
        if (test.is_open()) {
            cout << "الملف موجود" << endl;
            test.close();
        } else {
            cout << "الملف غير موجود" << endl;
        }
    }
    
    // ===== stringstream =====
    cout << "\\n=== stringstream ===" << endl;
    {
        stringstream ss;
        ss << "مرحباً " << 42 << " " << 3.14;
        
        string word;
        int num;
        double pi;
        
        ss >> word >> num >> pi;
        cout << "word: " << word << endl;
        cout << "num: " << num << endl;
        cout << "pi: " << pi << endl;
    }
    
    return 0;
}`,
    language: 'cpp',
    xpReward: 160,
    order: 9,
    quiz: {
      question: 'ما الفرق بين ios::out و ios::app؟',
      options: [
        'لا فرق',
        'out يحذف المحتوى، app يضيف للنهاية',
        'app أسرع',
        'out للقراءة فقط',
      ],
      correctAnswer: 1,
      explanation:
        'ios::out يحذف المحتوى الموجود، ios::app يضيف للنهاية بدون حذف',
    },
  },
  {
    id: 'cpp-adv-22',
    courseId: 'cpp-advanced',
    title: 'مشروع C++ متكامل',
    description: 'تطبيق شامل على Modern C++',
    content: `
# مشروع: نظام إدارة المهام

## المتطلبات
- إضافة وحذف المهام
- تحديث الحالة
- حفظ وتحميل من ملف
- البحث والفلترة
- إحصائيات

## المفاهيم المستخدمة
- OOP و Inheritance
- Templates
- Smart Pointers
- STL Algorithms
- Lambda
- File I/O
`,
    codeExample: `#include <iostream>
#include <vector>
#include <memory>
#include <algorithm>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <chrono>
#include <functional>
using namespace std;

// ===== Enums =====
enum class Priority { LOW, MEDIUM, HIGH, URGENT };
enum class Status { TODO, IN_PROGRESS, DONE, CANCELLED };

string priorityToString(Priority p) {
    switch (p) {
        case Priority::LOW: return "منخفضة";
        case Priority::MEDIUM: return "متوسطة";
        case Priority::HIGH: return "عالية";
        case Priority::URGENT: return "عاجلة";
    }
    return "غير محدد";
}

string statusToString(Status s) {
    switch (s) {
        case Status::TODO: return "للتنفيذ";
        case Status::IN_PROGRESS: return "قيد التنفيذ";
        case Status::DONE: return "مكتمل";
        case Status::CANCELLED: return "ملغي";
    }
    return "غير محدد";
}

// ===== Task Class =====
class Task {
private:
    int id;
    string title;
    string description;
    Priority priority;
    Status status;
    string createdAt;
    static int nextId;

public:
    Task(const string& t, const string& desc, Priority p = Priority::MEDIUM)
        : id(nextId++), title(t), description(desc), 
          priority(p), status(Status::TODO) {
        auto now = chrono::system_clock::now();
        auto time = chrono::system_clock::to_time_t(now);
        createdAt = ctime(&time);
        createdAt.pop_back();  // إزالة \\n
    }
    
    // Getters
    int getId() const { return id; }
    string getTitle() const { return title; }
    string getDescription() const { return description; }
    Priority getPriority() const { return priority; }
    Status getStatus() const { return status; }
    
    // Setters
    void setTitle(const string& t) { title = t; }
    void setDescription(const string& d) { description = d; }
    void setPriority(Priority p) { priority = p; }
    void setStatus(Status s) { status = s; }
    
    // Display
    void display() const {
        cout << "┌─────────────────────────────────" << endl;
        cout << "│ #" << id << " " << title << endl;
        cout << "│ " << description << endl;
        cout << "│ الأولوية: " << priorityToString(priority) 
             << " | الحالة: " << statusToString(status) << endl;
        cout << "│ تاريخ الإنشاء: " << createdAt << endl;
        cout << "└─────────────────────────────────" << endl;
    }
    
    // Serialization
    string serialize() const {
        stringstream ss;
        ss << id << "|" << title << "|" << description << "|"
           << static_cast<int>(priority) << "|" << static_cast<int>(status)
           << "|" << createdAt;
        return ss.str();
    }
    
    static unique_ptr<Task> deserialize(const string& line) {
        stringstream ss(line);
        string token;
        
        getline(ss, token, '|');
        int id = stoi(token);
        
        string title, desc, created;
        int pri, stat;
        
        getline(ss, title, '|');
        getline(ss, desc, '|');
        getline(ss, token, '|'); pri = stoi(token);
        getline(ss, token, '|'); stat = stoi(token);
        getline(ss, created, '|');
        
        auto task = make_unique<Task>(title, desc, static_cast<Priority>(pri));
        task->id = id;
        task->status = static_cast<Status>(stat);
        task->createdAt = created;
        
        if (id >= nextId) nextId = id + 1;
        
        return task;
    }
};

int Task::nextId = 1;

// ===== TaskManager Class =====
class TaskManager {
private:
    vector<unique_ptr<Task>> tasks;
    string filename;

public:
    TaskManager(const string& file = "tasks.txt") : filename(file) {
        load();
    }
    
    ~TaskManager() {
        save();
    }
    
    // CRUD Operations
    void addTask(const string& title, const string& desc, Priority p) {
        tasks.push_back(make_unique<Task>(title, desc, p));
        cout << "✅ تمت إضافة المهمة" << endl;
    }
    
    bool removeTask(int id) {
        auto it = find_if(tasks.begin(), tasks.end(),
            [id](const auto& t) { return t->getId() == id; });
        
        if (it != tasks.end()) {
            tasks.erase(it);
            cout << "✅ تم حذف المهمة" << endl;
            return true;
        }
        cout << "❌ المهمة غير موجودة" << endl;
        return false;
    }
    
    Task* findTask(int id) {
        auto it = find_if(tasks.begin(), tasks.end(),
            [id](const auto& t) { return t->getId() == id; });
        return it != tasks.end() ? it->get() : nullptr;
    }
    
    bool updateStatus(int id, Status newStatus) {
        if (Task* task = findTask(id)) {
            task->setStatus(newStatus);
            cout << "✅ تم تحديث الحالة" << endl;
            return true;
        }
        return false;
    }
    
    // Display
    void displayAll() const {
        if (tasks.empty()) {
            cout << "لا توجد مهام" << endl;
            return;
        }
        
        cout << "\\n📋 قائمة المهام (" << tasks.size() << ")" << endl;
        for (const auto& task : tasks) {
            task->display();
        }
    }
    
    void displayFiltered(function<bool(const Task&)> filter) const {
        int count = 0;
        for (const auto& task : tasks) {
            if (filter(*task)) {
                task->display();
                count++;
            }
        }
        cout << "عدد النتائج: " << count << endl;
    }
    
    // Filtering
    void showByStatus(Status status) const {
        cout << "\\n📋 المهام: " << statusToString(status) << endl;
        displayFiltered([status](const Task& t) {
            return t.getStatus() == status;
        });
    }
    
    void showByPriority(Priority priority) const {
        cout << "\\n📋 المهام ذات الأولوية: " << priorityToString(priority) << endl;
        displayFiltered([priority](const Task& t) {
            return t.getPriority() == priority;
        });
    }
    
    void search(const string& keyword) const {
        cout << "\\n🔍 نتائج البحث عن: " << keyword << endl;
        displayFiltered([&keyword](const Task& t) {
            return t.getTitle().find(keyword) != string::npos ||
                   t.getDescription().find(keyword) != string::npos;
        });
    }
    
    // Statistics
    void showStats() const {
        cout << "\\n📊 الإحصائيات" << endl;
        cout << string(30, '=') << endl;
        
        int todo = 0, inProgress = 0, done = 0, cancelled = 0;
        int low = 0, medium = 0, high = 0, urgent = 0;
        
        for (const auto& task : tasks) {
            switch (task->getStatus()) {
                case Status::TODO: todo++; break;
                case Status::IN_PROGRESS: inProgress++; break;
                case Status::DONE: done++; break;
                case Status::CANCELLED: cancelled++; break;
            }
            
            switch (task->getPriority()) {
                case Priority::LOW: low++; break;
                case Priority::MEDIUM: medium++; break;
                case Priority::HIGH: high++; break;
                case Priority::URGENT: urgent++; break;
            }
        }
        
        cout << "الإجمالي: " << tasks.size() << endl;
        cout << "\\nحسب الحالة:" << endl;
        cout << "  للتنفيذ: " << todo << endl;
        cout << "  قيد التنفيذ: " << inProgress << endl;
        cout << "  مكتمل: " << done << endl;
        cout << "  ملغي: " << cancelled << endl;
        
        cout << "\\nحسب الأولوية:" << endl;
        cout << "  منخفضة: " << low << endl;
        cout << "  متوسطة: " << medium << endl;
        cout << "  عالية: " << high << endl;
        cout << "  عاجلة: " << urgent << endl;
        
        if (!tasks.empty()) {
            double completion = (double)done / tasks.size() * 100;
            cout << "\\nنسبة الإنجاز: " << fixed << setprecision(1) 
                 << completion << "%" << endl;
        }
    }
    
    // File Operations
    void save() const {
        ofstream file(filename);
        for (const auto& task : tasks) {
            file << task->serialize() << endl;
        }
        cout << "💾 تم الحفظ" << endl;
    }
    
    void load() {
        ifstream file(filename);
        if (!file.is_open()) return;
        
        tasks.clear();
        string line;
        while (getline(file, line)) {
            if (!line.empty()) {
                tasks.push_back(Task::deserialize(line));
            }
        }
        cout << "📂 تم تحميل " << tasks.size() << " مهمة" << endl;
    }
};

// ===== Menu =====
void showMenu() {
    cout << "\\n═══════════════════════════════" << endl;
    cout << "       📋 إدارة المهام" << endl;
    cout << "═══════════════════════════════" << endl;
    cout << "1. إضافة مهمة" << endl;
    cout << "2. عرض جميع المهام" << endl;
    cout << "3. تحديث حالة مهمة" << endl;
    cout << "4. حذف مهمة" << endl;
    cout << "5. البحث" << endl;
    cout << "6. فلترة حسب الحالة" << endl;
    cout << "7. الإحصائيات" << endl;
    cout << "0. خروج" << endl;
    cout << "═══════════════════════════════" << endl;
    cout << "اختيارك: ";
}

int main() {
    TaskManager manager;
    
    // إضافة مهام تجريبية
    if (manager.findTask(1) == nullptr) {
        manager.addTask("تعلم C++", "إكمال كورس البرمجة", Priority::HIGH);
        manager.addTask("مشروع التخرج", "البدء في التصميم", Priority::URGENT);
        manager.addTask("قراءة كتاب", "Clean Code", Priority::MEDIUM);
    }
    
    int choice;
    do {
        showMenu();
        cin >> choice;
        cin.ignore();
        
        switch (choice) {
            case 1: {
                string title, desc;
                int pri;
                cout << "العنوان: "; getline(cin, title);
                cout << "الوصف: "; getline(cin, desc);
                cout << "الأولوية (0=منخفضة, 1=متوسطة, 2=عالية, 3=عاجلة): ";
                cin >> pri;
                manager.addTask(title, desc, static_cast<Priority>(pri));
                break;
            }
            case 2:
                manager.displayAll();
                break;
            case 3: {
                int id, stat;
                cout << "رقم المهمة: "; cin >> id;
                cout << "الحالة (0=للتنفيذ, 1=قيد التنفيذ, 2=مكتمل, 3=ملغي): ";
                cin >> stat;
                manager.updateStatus(id, static_cast<Status>(stat));
                break;
            }
            case 4: {
                int id;
                cout << "رقم المهمة للحذف: "; cin >> id;
                manager.removeTask(id);
                break;
            }
            case 5: {
                string keyword;
                cout << "كلمة البحث: "; getline(cin, keyword);
                manager.search(keyword);
                break;
            }
            case 6: {
                int stat;
                cout << "الحالة (0=للتنفيذ, 1=قيد التنفيذ, 2=مكتمل, 3=ملغي): ";
                cin >> stat;
                manager.showByStatus(static_cast<Status>(stat));
                break;
            }
            case 7:
                manager.showStats();
                break;
        }
    } while (choice != 0);
    
    cout << "👋 إلى اللقاء!" << endl;
    return 0;
}`,
    language: 'cpp',
    xpReward: 300,
    order: 10,
    quiz: {
      question: 'ما الميزة الرئيسية لاستخدام unique_ptr في هذا المشروع؟',
      options: [
        'يجعل الكود أقصر',
        'يدير الذاكرة تلقائياً ويمنع التسريب',
        'يسرع البرنامج',
        'يسمح بالوراثة المتعددة',
      ],
      correctAnswer: 1,
      explanation: 'unique_ptr يحرر الذاكرة تلقائياً عند خروج الكائن من النطاق',
    },
  },
];

// ===== تحديات C++ المبتدئة =====
export const CPP_CHALLENGES_BEGINNER: Challenge[] = [
  {
    id: 'cpp-ch-beg-1',
    title: 'مجموع الأرقام',
    description: 'احسب مجموع الأرقام من 1 إلى n',
    difficulty: 'easy',
    points: 15,
    language: 'C++',
    icon: 'calculator',
    starterCode: `#include <iostream>
using namespace std;

int sumToN(int n) {
    // احسب مجموع 1 + 2 + ... + n
}

int main() {
    cout << sumToN(5) << endl;   // 15
    cout << sumToN(10) << endl;  // 55
    return 0;
}`,
    solution: `int sumToN(int n) {
    return n * (n + 1) / 2;
}

// أو باستخدام حلقة:
int sumToNLoop(int n) {
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}`,
    hints: ['استخدم صيغة غاوس: n*(n+1)/2', 'أو استخدم حلقة for'],
    testCases: [
      { input: '5', expectedOutput: '15', description: 'مجموع 1 إلى 5' },
      { input: '10', expectedOutput: '55', description: 'مجموع 1 إلى 10' },
    ],
    isLocked: false,
    category: 'math',
  },
  {
    id: 'cpp-ch-beg-2',
    title: 'أكبر من ثلاثة',
    description: 'أوجد أكبر ثلاثة أرقام',
    difficulty: 'easy',
    points: 15,
    language: 'C++',
    icon: 'arrow-upward',
    starterCode: `#include <iostream>
using namespace std;

int maxOfThree(int a, int b, int c) {
    // أرجع أكبر رقم
}

int main() {
    cout << maxOfThree(5, 9, 3) << endl;  // 9
    return 0;
}`,
    solution: `int maxOfThree(int a, int b, int c) {
    int max = a;
    if (b > max) max = b;
    if (c > max) max = c;
    return max;
}

// أو باستخدام الدالة المدمجة:
#include <algorithm>
int maxOfThreeSTL(int a, int b, int c) {
    return max({a, b, c});
}`,
    hints: ['قارن كل رقم مع الأكبر الحالي', 'أو استخدم std::max'],
    testCases: [
      { input: '5, 9, 3', expectedOutput: '9', description: 'أرقام مختلفة' },
      { input: '7, 7, 7', expectedOutput: '7', description: 'أرقام متساوية' },
    ],
    isLocked: false,
    category: 'basics',
  },
  {
    id: 'cpp-ch-beg-3',
    title: 'جدول الضرب',
    description: 'اطبع جدول الضرب لرقم معين',
    difficulty: 'easy',
    points: 15,
    language: 'C++',
    icon: 'grid-view',
    starterCode: `#include <iostream>
using namespace std;

void printTable(int n) {
    // اطبع جدول الضرب لـ n
}

int main() {
    printTable(5);
    return 0;
}`,
    solution: `void printTable(int n) {
    for (int i = 1; i <= 10; i++) {
        cout << n << " x " << i << " = " << n * i << endl;
    }
}`,
    hints: ['استخدم حلقة من 1 إلى 10', 'اطبع النتيجة في كل تكرار'],
    testCases: [
      {
        input: '5',
        expectedOutput:
          '5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50',
        description: 'جدول 5',
      },
      {
        input: '3',
        expectedOutput:
          '3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30',
        description: 'جدول 3',
      },
    ],
    isLocked: false,
    category: 'loops',
  },
  {
    id: 'cpp-ch-beg-4',
    title: 'العدد الأولي',
    description: 'تحقق إذا كان العدد أولياً',
    difficulty: 'easy',
    points: 20,
    language: 'C++',
    icon: 'star',
    starterCode: `#include <iostream>
using namespace std;

bool isPrime(int n) {
    // أرجع true إذا كان n أولي
}

int main() {
    cout << isPrime(7) << endl;   // 1 (true)
    cout << isPrime(10) << endl;  // 0 (false)
    return 0;
}`,
    solution: `bool isPrime(int n) {
    if (n < 2) return false;
    if (n == 2) return true;
    if (n % 2 == 0) return false;
    
    for (int i = 3; i * i <= n; i += 2) {
        if (n % i == 0) return false;
    }
    return true;
}`,
    hints: ['الأعداد الأقل من 2 ليست أولية', 'تحقق حتى جذر العدد فقط'],
    testCases: [
      { input: '7', expectedOutput: '1', description: '7 أولي' },
      { input: '10', expectedOutput: '0', description: '10 ليس أولي' },
    ],
    isLocked: false,
    category: 'math',
  },
  {
    id: 'cpp-ch-beg-5',
    title: 'المضروب (Factorial)',
    description: 'احسب مضروب عدد',
    difficulty: 'easy',
    points: 15,
    language: 'C++',
    icon: 'functions',
    starterCode: `#include <iostream>
using namespace std;

long long factorial(int n) {
    // احسب n!
}

int main() {
    cout << factorial(5) << endl;   // 120
    cout << factorial(0) << endl;   // 1
    return 0;
}`,
    solution: `long long factorial(int n) {
    if (n <= 1) return 1;
    long long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// أو بالتكرار:
long long factorialRecursive(int n) {
    if (n <= 1) return 1;
    return n * factorialRecursive(n - 1);
}`,
    hints: ['0! = 1 و 1! = 1', 'n! = n × (n-1) × ... × 1'],
    testCases: [
      { input: '5', expectedOutput: '120', description: '5!' },
      { input: '0', expectedOutput: '1', description: '0!' },
    ],
    isLocked: false,
    category: 'math',
  },
];

// ===== تحديات C++ المتوسطة =====
export const CPP_CHALLENGES_INTERMEDIATE: Challenge[] = [
  {
    id: 'cpp-ch-int-1',
    title: 'Binary Search',
    description: 'نفذ البحث الثنائي',
    difficulty: 'medium',
    points: 35,
    language: 'C++',
    icon: 'search',
    starterCode: `int binarySearch(vector<int> arr, int target) {
    // أرجع فهرس target أو -1 إذا غير موجود
    return -1;
}`,
    solution: `int binarySearch(vector<int> arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}`,
    hints: [
      'ابدأ بـ left=0 و right=size-1',
      'قارن العنصر الأوسط مع الهدف',
      'اختصر نصف المصفوفة في كل مرة',
    ],
    testCases: [
      {
        input: 'vector<int>{1,3,5,7,9,11}, 7',
        expectedOutput: '3',
        description: 'موجود',
      },
      {
        input: 'vector<int>{1,3,5,7,9,11}, 4',
        expectedOutput: '-1',
        description: 'غير موجود',
      },
    ],
    isLocked: false,
    category: 'algorithms',
  },
  {
    id: 'cpp-ch-int-2',
    title: 'Bubble Sort',
    description: 'نفذ خوارزمية الفرز الفقاعي',
    difficulty: 'medium',
    points: 30,
    language: 'C++',
    icon: 'sort',
    starterCode: `string bubbleSort(vector<int> arr) {
    // رتب المصفوفة تصاعدياً وأرجع النتيجة كنص مفصول بمسافات
    return "";
}`,
    solution: `string bubbleSort(vector<int> arr) {
    int size = arr.size();
    for (int i = 0; i < size - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < size - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    string result;
    for (int i = 0; i < size; i++) {
        if (i > 0) result += " ";
        result += to_string(arr[i]);
    }
    return result;
}`,
    hints: [
      'قارن كل عنصرين متجاورين',
      'بدّل إذا كان الأول أكبر',
      'كرر حتى لا يحدث تبديل',
    ],
    testCases: [
      {
        input: 'vector<int>{64,34,25,12,22}',
        expectedOutput: '12 22 25 34 64',
        description: 'ترتيب 5 عناصر',
      },
      {
        input: 'vector<int>{5,1,4,2,8}',
        expectedOutput: '1 2 4 5 8',
        description: 'ترتيب مصفوفة أخرى',
      },
      {
        input: 'vector<int>{-3,10,-1,7,0}',
        expectedOutput: '-3 -1 0 7 10',
        description: 'ترتيب أرقام سالبة وموجبة',
      },
    ],
    isLocked: false,
    category: 'algorithms',
  },
  {
    id: 'cpp-ch-int-3',
    title: 'Linked List',
    description: 'نفذ القائمة المتصلة',
    difficulty: 'medium',
    points: 40,
    language: 'C++',
    icon: 'link',
    starterCode: `struct Node {
    int data;
    Node* next;
};

class LinkedList {
public:
    Node* head;
    
    LinkedList() : head(nullptr) {}
    
    void insert(int value) {
        // أضف في النهاية
    }
    
    string print() {
        // أرجع العناصر بشكل "1 -> 2 -> 3 -> NULL"
        return "";
    }
};

string solution(vector<int> vals) {
    LinkedList list;
    for (int v : vals) list.insert(v);
    return list.print();
}`,
    solution: `struct Node {
    int data;
    Node* next;
};

class LinkedList {
public:
    Node* head;
    
    LinkedList() : head(nullptr) {}
    
    void insert(int value) {
        Node* newNode = new Node();
        newNode->data = value;
        newNode->next = nullptr;
        
        if (head == nullptr) {
            head = newNode;
        } else {
            Node* temp = head;
            while (temp->next != nullptr) {
                temp = temp->next;
            }
            temp->next = newNode;
        }
    }
    
    string print() {
        string result;
        Node* temp = head;
        while (temp != nullptr) {
            result += to_string(temp->data) + " -> ";
            temp = temp->next;
        }
        result += "NULL";
        return result;
    }
};

string solution(vector<int> vals) {
    LinkedList list;
    for (int v : vals) list.insert(v);
    return list.print();
}`,
    hints: [
      'أنشئ Node جديدة',
      'إذا القائمة فارغة، اجعلها head',
      'وإلا اذهب للنهاية وأضف',
    ],
    testCases: [
      {
        input: 'vector<int>{1,2,3}',
        expectedOutput: '1 -> 2 -> 3 -> NULL',
        description: 'إضافة وطباعة',
      },
      {
        input: 'vector<int>{10,20}',
        expectedOutput: '10 -> 20 -> NULL',
        description: 'إضافة عنصرين',
      },
    ],
    isLocked: false,
    category: 'data-structures',
  },
  {
    id: 'cpp-ch-int-4',
    title: 'Stack باستخدام Array',
    description: 'نفذ Stack',
    difficulty: 'medium',
    points: 35,
    language: 'C++',
    icon: 'layers',
    starterCode: `class Stack {
private:
    int arr[100];
    int topIndex;
public:
    Stack() : topIndex(-1) {}
    
    void push(int value) { }
    int pop() { return -1; }
    int top() { return -1; }
    bool isEmpty() { return true; }
};

int solution(vector<int> vals) {
    Stack s;
    for (int v : vals) s.push(v);
    return s.pop();
}`,
    solution: `class Stack {
private:
    int arr[100];
    int topIndex;
public:
    Stack() : topIndex(-1) {}
    
    void push(int value) {
        if (topIndex >= 99) return;
        arr[++topIndex] = value;
    }
    
    int pop() {
        if (isEmpty()) return -1;
        return arr[topIndex--];
    }
    
    int top() {
        if (isEmpty()) return -1;
        return arr[topIndex];
    }
    
    bool isEmpty() {
        return topIndex == -1;
    }
};

int solution(vector<int> vals) {
    Stack s;
    for (int v : vals) s.push(v);
    return s.pop();
}`,
    hints: [
      'topIndex يبدأ من -1',
      'push يزيد topIndex ثم يضيف',
      'pop يرجع القيمة ثم ينقص topIndex',
    ],
    testCases: [
      { input: 'vector<int>{1,2,3}', expectedOutput: '3', description: 'LIFO' },
      {
        input: 'vector<int>{5,10}',
        expectedOutput: '10',
        description: 'عنصر القمة',
      },
    ],
    isLocked: false,
    category: 'data-structures',
  },
  {
    id: 'cpp-ch-int-5',
    title: 'Queue باستخدام Array',
    description: 'نفذ Queue',
    difficulty: 'medium',
    points: 35,
    language: 'C++',
    icon: 'queue',
    starterCode: `class Queue {
private:
    int arr[100];
    int front, rear, size;
public:
    Queue() : front(0), rear(-1), size(0) {}
    
    void enqueue(int value) { }
    int dequeue() { return -1; }
    bool isEmpty() { return true; }
};

int solution(vector<int> vals) {
    Queue q;
    for (int v : vals) q.enqueue(v);
    return q.dequeue();
}`,
    solution: `class Queue {
private:
    int arr[100];
    int front, rear, size;
public:
    Queue() : front(0), rear(-1), size(0) {}
    
    void enqueue(int value) {
        if (size >= 100) return;
        rear = (rear + 1) % 100;
        arr[rear] = value;
        size++;
    }
    
    int dequeue() {
        if (isEmpty()) return -1;
        int value = arr[front];
        front = (front + 1) % 100;
        size--;
        return value;
    }
    
    bool isEmpty() {
        return size == 0;
    }
};

int solution(vector<int> vals) {
    Queue q;
    for (int v : vals) q.enqueue(v);
    return q.dequeue();
}`,
    hints: [
      'enqueue يضيف في rear',
      'dequeue يزيل من front',
      'استخدم circular array للكفاءة',
    ],
    testCases: [
      {
        input: 'vector<int>{1,2,3}',
        expectedOutput: '1',
        description: 'FIFO',
      },
      {
        input: 'vector<int>{7,8}',
        expectedOutput: '7',
        description: 'أول عنصر',
      },
    ],
    isLocked: false,
    category: 'data-structures',
  },
];

// ===== تحديات C++ المتقدمة =====
export const CPP_CHALLENGES: Challenge[] = [
  {
    id: 'cpp-ch-1',
    title: 'عكس المصفوفة',
    description: 'اعكس عناصر المصفوفة بدون مصفوفة إضافية',
    difficulty: 'easy',
    points: 30,
    language: 'C++',
    icon: 'swap-horiz',
    starterCode: `string reverseArray(vector<int> arr) {
    // اعكس المصفوفة وأرجع النتيجة كنص مفصول بمسافات
    return "";
}`,
    solution: `string reverseArray(vector<int> arr) {
    int start = 0;
    int end = arr.size() - 1;
    
    while (start < end) {
        int temp = arr[start];
        arr[start] = arr[end];
        arr[end] = temp;
        start++;
        end--;
    }
    
    string result;
    for (int i = 0; i < (int)arr.size(); i++) {
        if (i > 0) result += " ";
        result += to_string(arr[i]);
    }
    return result;
}`,
    hints: [
      'استخدم مؤشرين: من البداية والنهاية',
      'بادل العناصر وحرك المؤشرين',
      'توقف عندما يلتقيان',
    ],
    testCases: [
      {
        input: 'vector<int>{1,2,3,4,5}',
        expectedOutput: '5 4 3 2 1',
        description: 'مصفوفة عادية',
      },
      {
        input: 'vector<int>{1}',
        expectedOutput: '1',
        description: 'عنصر واحد',
      },
    ],
    isLocked: false,
    category: 'arrays',
  },
  {
    id: 'cpp-ch-2',
    title: 'فحص الـ Palindrome',
    description: 'تحقق إذا كان النص يُقرأ من الاتجاهين',
    difficulty: 'medium',
    points: 50,
    language: 'C++',
    icon: 'text-fields',
    starterCode: `#include <iostream>
#include <string>
using namespace std;

bool isPalindrome(string text) {
    // اكتب الحل هنا
}

int main() {
    cout << isPalindrome("radar") << endl;     // 1
    cout << isPalindrome("hello") << endl;     // 0
    cout << isPalindrome("A man a plan a canal Panama") << endl;  // 1
    return 0;
}`,
    solution: `bool isPalindrome(string text) {
    string clean = "";
    for (char c : text) {
        if (isalnum(c)) {
            clean += tolower(c);
        }
    }
    
    int left = 0;
    int right = clean.length() - 1;
    
    while (left < right) {
        if (clean[left] != clean[right]) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
    hints: ['أزل المسافات والرموز', 'حول لحالة واحدة', 'قارن من الطرفين'],
    testCases: [
      {
        input: '"radar"',
        expectedOutput: '1',
        description: 'كلمة palindrome',
      },
      {
        input: '"hello"',
        expectedOutput: '0',
        description: 'ليس palindrome',
      },
      {
        input: '"Was it a car or a cat I saw"',
        expectedOutput: '1',
        description: 'جملة متماثلة',
      },
    ],
    isLocked: true,
    category: 'strings',
  },
  {
    id: 'cpp-ch-3',
    title: 'الأرقام الفيبوناتشي',
    description: 'احسب العدد n من متتالية فيبوناتشي',
    difficulty: 'medium',
    points: 50,
    language: 'C++',
    icon: 'functions',
    starterCode: `#include <iostream>
using namespace std;

// الحل التكراري (أفضل)
long long fibonacci(int n) {
    // اكتب الحل هنا
}

int main() {
    cout << fibonacci(10) << endl;  // 55
    cout << fibonacci(20) << endl;  // 6765
    return 0;
}`,
    solution: `long long fibonacci(int n) {
    if (n <= 1) return n;
    
    long long a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        long long temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}`,
    hints: [
      'F(0) = 0, F(1) = 1',
      'F(n) = F(n-1) + F(n-2)',
      'استخدم الحل التكراري لتجنب التكرار',
    ],
    testCases: [
      { input: '10', expectedOutput: '55', description: 'العدد العاشر' },
      { input: '20', expectedOutput: '6765', description: 'العدد العشرين' },
    ],
    isLocked: true,
    category: 'math',
  },
];

// تصدير الكل
export const ALL_CPP_LESSONS = [
  ...CPP_LESSONS_BEGINNER,
  ...CPP_LESSONS_POINTERS,
  ...CPP_LESSONS_ADVANCED,
];
export const ALL_CPP_CHALLENGES = [
  ...CPP_CHALLENGES_BEGINNER,
  ...CPP_CHALLENGES_INTERMEDIATE,
  ...CPP_CHALLENGES,
];

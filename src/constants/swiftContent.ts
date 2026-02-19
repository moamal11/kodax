/**
 * محتوى Swift - Kodax
 * دروس وتحديات شاملة للغة Swift
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس Swift للمبتدئين =====
export const SWIFT_LESSONS_BEGINNER: Lesson[] = [
  {
    id: 'swift-1',
    courseId: 'swift-basics',
    title: 'مرحباً Swift!',
    description: 'أول برنامج لك بلغة Swift',
    content: `
# مرحباً بك في Swift! 🍎

## ما هي Swift؟
Swift لغة برمجة:
- 🚀 سريعة وآمنة
- 📱 رسمية لتطوير iOS و macOS
- 🎯 سهلة التعلم والقراءة
- 💪 قوية ومعبّرة

## استخدامات Swift
- تطبيقات iPhone و iPad
- تطبيقات macOS
- تطبيقات watchOS و tvOS
- تطبيقات الخوادم

## أول برنامج
print() لطباعة النص
    `,
    codeExample: `// أول برنامج Swift!
print("مرحباً بالعالم!")

// طباعة عدة أسطر
print("اسمي أحمد")
print("أتعلم Swift")

// طباعة مع متغيرات
let name = "Swift"
print("أتعلم \\(name)")

// طباعة بدون سطر جديد
print("Hello ", terminator: "")
print("World!")`,
    language: 'swift',
    xpReward: 100,
    order: 1,
    quiz: {
      question: 'ما هي الدالة المستخدمة للطباعة في Swift؟',
      options: ['echo()', 'console.log()', 'print()', 'System.out.println()'],
      correctAnswer: 2,
      explanation: 'print() تُستخدم للطباعة في Swift',
    },
  },
  {
    id: 'swift-2',
    courseId: 'swift-basics',
    title: 'المتغيرات والثوابت',
    description: 'var و let وأنواع البيانات',
    content: `
# المتغيرات في Swift

## var vs let
- \`var\` - قيمة قابلة للتغيير
- \`let\` - ثابت (لا يتغير)

## Type Inference
Swift تستنتج النوع تلقائياً

## أنواع البيانات الأساسية
- \`Int\` - عدد صحيح
- \`Double\` - عدد عشري
- \`Float\` - عدد عشري (أقل دقة)
- \`Bool\` - صح/خطأ
- \`String\` - نص
- \`Character\` - حرف
    `,
    codeExample: `// متغيرات (قابلة للتغيير)
var age = 25
age = 26  // ✅ يعمل

// ثوابت (لا تتغير)
let name = "أحمد"
// name = "محمد"  // ❌ خطأ!

// تحديد النوع صراحة
let pi: Double = 3.14159
let isStudent: Bool = true
let grade: Character = "A"

// Type Inference
let score = 95        // Int
let average = 85.5    // Double
let message = "مرحباً" // String

// String Interpolation
let greeting = "مرحباً \\(name)، عمرك \\(age) سنة"
print(greeting)

// تحويل الأنواع
let intValue = 42
let doubleValue = Double(intValue)
let stringValue = String(intValue)`,
    language: 'swift',
    xpReward: 100,
    order: 2,
    quiz: {
      question: 'ما الفرق بين var و let في Swift؟',
      options: [
        'لا فرق',
        'var للنصوص و let للأرقام',
        'var قابل للتغيير و let ثابت',
        'var للدوال و let للمتغيرات',
      ],
      correctAnswer: 2,
      explanation: 'var للمتغيرات القابلة للتغيير، let للثوابت',
    },
  },
  {
    id: 'swift-3',
    courseId: 'swift-basics',
    title: 'العمليات والمعاملات',
    description: 'العمليات الحسابية والمنطقية',
    content: `
# المعاملات في Swift

## العمليات الحسابية
- \`+\` جمع
- \`-\` طرح
- \`*\` ضرب
- \`/\` قسمة
- \`%\` باقي القسمة

## معاملات المقارنة
- \`==\` يساوي
- \`!=\` لا يساوي
- \`>\` و \`<\` و \`>=\` و \`<=\`

## المعاملات المنطقية
- \`&&\` AND
- \`||\` OR
- \`!\` NOT

## Nil-Coalescing
\`??\` للقيم الافتراضية
    `,
    codeExample: `// العمليات الحسابية
let a = 10, b = 3
print("الجمع: \\(a + b)")      // 13
print("الطرح: \\(a - b)")      // 7
print("الضرب: \\(a * b)")      // 30
print("القسمة: \\(a / b)")     // 3
print("الباقي: \\(a % b)")     // 1

// العمليات المركبة
var count = 5
count += 3  // 8
count -= 2  // 6
count *= 2  // 12

// المقارنة
print(a > b)   // true
print(a == b)  // false

// العمليات المنطقية
let x = true, y = false
print(x && y)  // false
print(x || y)  // true
print(!x)      // false

// Ternary Operator
let result = a > b ? "أكبر" : "أصغر"

// Nil-Coalescing
let optionalName: String? = nil
let displayName = optionalName ?? "زائر"
print(displayName)  // زائر

// Range Operators
let range = 1...5   // 1, 2, 3, 4, 5
let halfOpen = 1..<5 // 1, 2, 3, 4`,
    language: 'swift',
    xpReward: 100,
    order: 3,
    quiz: {
      question: 'ما ناتج 10 % 3 في Swift؟',
      options: ['3', '1', '3.33', '0'],
      correctAnswer: 1,
      explanation: 'عامل % يُرجع باقي القسمة، 10 ÷ 3 = 3 والباقي 1',
    },
  },
  {
    id: 'swift-4',
    courseId: 'swift-basics',
    title: 'الجمل الشرطية',
    description: 'if, guard, switch',
    content: `
# الجمل الشرطية في Swift

## if Statement
تنفيذ كود إذا تحقق شرط

## guard Statement
للخروج المبكر إذا لم يتحقق الشرط

## switch
مطابقة الأنماط القوية

## الميزات
- لا حاجة للأقواس حول الشرط
- switch شامل (exhaustive)
- دعم المطابقة المتقدمة
    `,
    codeExample: `let score = 85

// if-else if-else
if score >= 90 {
    print("ممتاز! A")
} else if score >= 80 {
    print("جيد جداً! B")
} else if score >= 70 {
    print("جيد! C")
} else {
    print("يحتاج تحسين")
}

// guard للخروج المبكر
func greet(name: String?) {
    guard let unwrappedName = name else {
        print("لا يوجد اسم")
        return
    }
    print("مرحباً \\(unwrappedName)")
}

// switch قوي
let grade = "B"
switch grade {
case "A":
    print("ممتاز")
case "B", "C":
    print("جيد")
case "D":
    print("مقبول")
default:
    print("راسب")
}

// switch مع ranges
switch score {
case 90...100:
    print("A")
case 80..<90:
    print("B")
case 70..<80:
    print("C")
default:
    print("F")
}

// switch مع where
let point = (2, 3)
switch point {
case let (x, y) where x == y:
    print("على الخط القطري")
case let (x, y) where x > y:
    print("أسفل الخط")
default:
    print("فوق الخط")
}`,
    language: 'swift',
    xpReward: 100,
    order: 4,
    quiz: {
      question: 'ما الغرض من guard في Swift؟',
      options: [
        'إنشاء حلقة',
        'الخروج المبكر إذا فشل الشرط',
        'إنشاء switch',
        'تعريف دالة',
      ],
      correctAnswer: 1,
      explanation: 'guard للتحقق من شرط والخروج مبكراً إذا فشل',
    },
  },
  {
    id: 'swift-5',
    courseId: 'swift-basics',
    title: 'الحلقات التكرارية',
    description: 'for-in, while, repeat-while',
    content: `
# الحلقات في Swift

## for-in Loop
للتكرار على المجموعات والنطاقات

## while Loop
عندما لا نعرف عدد التكرارات

## repeat-while Loop
تنفيذ مرة واحدة على الأقل

## التحكم بالحلقات
- break للخروج
- continue لتخطي التكرار
    `,
    codeExample: `// for-in مع range
for i in 1...5 {
    print(i)
}

// for-in مع مصفوفة
let fruits = ["تفاح", "برتقال", "موز"]
for fruit in fruits {
    print(fruit)
}

// for-in مع index
for (index, fruit) in fruits.enumerated() {
    print("\\(index): \\(fruit)")
}

// تجاهل المتغير
for _ in 1...3 {
    print("مرحباً!")
}

// while loop
var count = 5
while count > 0 {
    print(count)
    count -= 1
}

// repeat-while (مثل do-while)
var num = 1
repeat {
    print(num)
    num += 1
} while num <= 3

// break و continue
for i in 1...10 {
    if i == 5 { continue }  // تخطي 5
    if i == 8 { break }     // إيقاف عند 8
    print(i)
}

// Labeled Statements
outer: for i in 1...3 {
    inner: for j in 1...3 {
        if j == 2 { continue outer }
        print("\\(i), \\(j)")
    }
}`,
    language: 'swift',
    xpReward: 100,
    order: 5,
    quiz: {
      question: 'ما الحلقة التي تُنفذ مرة واحدة على الأقل؟',
      options: ['for-in', 'while', 'repeat-while', 'forEach'],
      correctAnswer: 2,
      explanation: 'repeat-while تُنفذ الكود أولاً ثم تتحقق من الشرط',
    },
  },
  {
    id: 'swift-6',
    courseId: 'swift-basics',
    title: 'المجموعات (Collections)',
    description: 'Array, Set, Dictionary',
    content: `
# المجموعات في Swift

## Array
قائمة مرتبة من العناصر

## Set
مجموعة فريدة غير مرتبة

## Dictionary
أزواج مفتاح-قيمة

## الخصائص المشتركة
- count للحجم
- isEmpty للتحقق من الفراغ
- قابلة للتكرار
    `,
    codeExample: `// Array
var numbers = [1, 2, 3, 4, 5]
numbers.append(6)
numbers.insert(0, at: 0)
numbers.remove(at: 0)

print(numbers[0])      // أول عنصر
print(numbers.first!)  // أول عنصر
print(numbers.last!)   // آخر عنصر

// عمليات المصفوفات
let sorted = numbers.sorted()
let filtered = numbers.filter { $0 > 3 }
let mapped = numbers.map { $0 * 2 }
let sum = numbers.reduce(0, +)

// Set
var colors: Set = ["أحمر", "أخضر", "أزرق"]
colors.insert("أصفر")
colors.remove("أحمر")

// عمليات المجموعات
let set1: Set = [1, 2, 3]
let set2: Set = [3, 4, 5]
print(set1.union(set2))        // اتحاد
print(set1.intersection(set2)) // تقاطع

// Dictionary
var ages: [String: Int] = [
    "أحمد": 25,
    "محمد": 30
]

ages["علي"] = 28  // إضافة
ages["أحمد"] = 26 // تعديل

for (name, age) in ages {
    print("\\(name): \\(age)")
}

// القيم الافتراضية
let score = ages["سعيد", default: 0]`,
    language: 'swift',
    xpReward: 100,
    order: 6,
    quiz: {
      question: 'أي مجموعة لا تسمح بالعناصر المكررة في Swift؟',
      options: ['Array', 'Set', 'Dictionary', 'List'],
      correctAnswer: 1,
      explanation: 'Set لا يسمح بتكرار العناصر',
    },
  },
  {
    id: 'swift-7',
    courseId: 'swift-basics',
    title: 'الدوال (Functions)',
    description: 'إنشاء واستخدام الدوال',
    content: `
# الدوال في Swift

## مكونات الدالة
- func للتعريف
- المعاملات مع labels
- نوع الإرجاع
- جسم الدالة

## ميزات Swift
- Argument Labels
- Default Values
- Variadic Parameters
- inout Parameters
    `,
    codeExample: `// دالة بسيطة
func sayHello() {
    print("مرحباً!")
}

// دالة مع معاملات
func greet(name: String) {
    print("أهلاً \\(name)!")
}

// دالة مع إرجاع
func add(a: Int, b: Int) -> Int {
    return a + b
}

// Argument Labels
func greet(to person: String, from sender: String) {
    print("مرحباً \\(person) من \\(sender)")
}
greet(to: "أحمد", from: "محمد")

// بدون label خارجي
func multiply(_ a: Int, _ b: Int) -> Int {
    return a * b
}
let result = multiply(5, 3)

// قيم افتراضية
func power(base: Int, exponent: Int = 2) -> Int {
    var result = 1
    for _ in 0..<exponent {
        result *= base
    }
    return result
}
print(power(base: 3))      // 9
print(power(base: 2, exponent: 3))  // 8

// Variadic Parameters
func sum(_ numbers: Int...) -> Int {
    return numbers.reduce(0, +)
}
print(sum(1, 2, 3, 4, 5))

// inout Parameters
func swap(_ a: inout Int, _ b: inout Int) {
    let temp = a
    a = b
    b = temp
}
var x = 5, y = 10
swap(&x, &y)

// دالة تُرجع دالة
func makeIncrementer(by amount: Int) -> () -> Int {
    var total = 0
    return {
        total += amount
        return total
    }
}`,
    language: 'swift',
    xpReward: 100,
    order: 7,
    quiz: {
      question: 'ما الرمز المستخدم لتحديد نوع الإرجاع في Swift؟',
      options: [':', '=>', '->', '::'],
      correctAnswer: 2,
      explanation: 'السهم -> يُستخدم لتحديد نوع الإرجاع',
    },
  },
  {
    id: 'swift-8',
    courseId: 'swift-basics',
    title: 'Optionals',
    description: 'التعامل مع القيم الفارغة',
    content: `
# Optionals في Swift

## ما هو Optional؟
نوع قد يحتوي على قيمة أو nil

## لماذا Optionals؟
- أمان أكثر
- تجنب أخطاء null
- إجبار المطور على معالجة الحالات

## طرق فك Optional
- Optional Binding (if let, guard let)
- Force Unwrapping (!)
- Nil-Coalescing (??)
- Optional Chaining (?)
    `,
    codeExample: `// تعريف Optional
var name: String? = "أحمد"
var age: Int? = nil

// Optional Binding مع if let
if let unwrappedName = name {
    print("الاسم: \\(unwrappedName)")
} else {
    print("لا يوجد اسم")
}

// guard let
func greet(name: String?) {
    guard let name = name else {
        print("لا يوجد اسم")
        return
    }
    print("مرحباً \\(name)")
}

// Force Unwrapping (خطر!)
let forcedName = name!  // ⚠️ يسبب crash إذا كان nil

// Nil-Coalescing
let displayName = name ?? "زائر"

// Optional Chaining
struct Person {
    var address: Address?
}
struct Address {
    var city: String
}

let person: Person? = Person(address: Address(city: "بغداد"))
let city = person?.address?.city  // Optional<String>

// Implicitly Unwrapped Optional
var definitelyHasValue: String! = "موجود"
print(definitelyHasValue)  // لا يحتاج !

// Multiple Optional Binding
if let name = name, let age = age {
    print("\\(name) عمره \\(age)")
}

// Optional في الدوال
func findIndex(of value: Int, in array: [Int]) -> Int? {
    for (index, element) in array.enumerated() {
        if element == value {
            return index
        }
    }
    return nil
}`,
    language: 'swift',
    xpReward: 100,
    order: 8,
    quiz: {
      question: 'ما الطريقة الآمنة لفك Optional؟',
      options: [
        'Force Unwrapping (!)',
        'if let / guard let',
        'تجاهلها',
        'تحويلها لـ String',
      ],
      correctAnswer: 1,
      explanation: 'if let و guard let تفك Optional بأمان مع التحقق من nil',
    },
  },
  {
    id: 'swift-9',
    courseId: 'swift-basics',
    title: 'Classes و Structures',
    description: 'البرمجة الكائنية في Swift',
    content: `
# Classes و Structs في Swift

## الفرق الرئيسي
- Struct: Value Type (نسخ القيمة)
- Class: Reference Type (نسخ المرجع)

## متى تستخدم Struct؟
- بيانات بسيطة
- لا تحتاج وراثة
- تريد نسخ القيمة

## متى تستخدم Class؟
- تحتاج وراثة
- تحتاج deinitializers
- تريد مشاركة المرجع
    `,
    codeExample: `// Struct
struct Point {
    var x: Double
    var y: Double
    
    func distance(to other: Point) -> Double {
        let dx = x - other.x
        let dy = y - other.y
        return sqrt(dx*dx + dy*dy)
    }
    
    // mutating للتعديل
    mutating func move(by delta: Point) {
        x += delta.x
        y += delta.y
    }
}

var p1 = Point(x: 0, y: 0)
var p2 = p1  // نسخة جديدة
p2.x = 10
print(p1.x)  // 0 (لم يتغير)

// Class
class Person {
    var name: String
    var age: Int
    
    init(name: String, age: Int) {
        self.name = name
        self.age = age
    }
    
    func introduce() {
        print("أنا \\(name)، عمري \\(age)")
    }
    
    deinit {
        print("تم حذف \\(name)")
    }
}

let person1 = Person(name: "أحمد", age: 25)
let person2 = person1  // نفس المرجع
person2.age = 26
print(person1.age)  // 26 (تغير!)

// وراثة
class Student: Person {
    var grade: String
    
    init(name: String, age: Int, grade: String) {
        self.grade = grade
        super.init(name: name, age: age)
    }
    
    override func introduce() {
        super.introduce()
        print("صفي: \\(grade)")
    }
}`,
    language: 'swift',
    xpReward: 100,
    order: 9,
    quiz: {
      question: 'ما الفرق بين Struct و Class في Swift؟',
      options: [
        'لا فرق',
        'Struct للأرقام فقط',
        'Struct value type و Class reference type',
        'Class أسرع',
      ],
      correctAnswer: 2,
      explanation: 'Struct ينسخ القيمة، Class ينسخ المرجع',
    },
  },
  {
    id: 'swift-10',
    courseId: 'swift-basics',
    title: 'Closures',
    description: 'الدوال المجهولة والـ Closures',
    content: `
# Closures في Swift

## ما هو Closure؟
كتلة من الكود يمكن تمريرها وتنفيذها لاحقاً

## الصيغة
{ (parameters) -> ReturnType in
    statements
}

## Trailing Closure
إذا كان Closure آخر معامل، يمكن كتابته خارج الأقواس
    `,
    codeExample: `// Closure كامل
let greet = { (name: String) -> String in
    return "مرحباً \\(name)"
}
print(greet("أحمد"))

// اختصارات
let numbers = [3, 1, 4, 1, 5, 9, 2, 6]

// الصيغة الكاملة
let sorted1 = numbers.sorted(by: { (a: Int, b: Int) -> Bool in
    return a < b
})

// استنتاج الأنواع
let sorted2 = numbers.sorted(by: { a, b in
    return a < b
})

// Return ضمني
let sorted3 = numbers.sorted(by: { a, b in a < b })

// Shorthand Arguments
let sorted4 = numbers.sorted(by: { $0 < $1 })

// Operator Method
let sorted5 = numbers.sorted(by: <)

// Trailing Closure
let sorted6 = numbers.sorted { $0 < $1 }

// استخدام مع الدوال العليا
let doubled = numbers.map { $0 * 2 }
let evens = numbers.filter { $0 % 2 == 0 }
let sum = numbers.reduce(0) { $0 + $1 }

// Capturing Values
func makeCounter() -> () -> Int {
    var count = 0
    return {
        count += 1
        return count
    }
}

let counter = makeCounter()
print(counter())  // 1
print(counter())  // 2

// @escaping Closure
func doSomethingAsync(completion: @escaping () -> Void) {
    DispatchQueue.main.async {
        completion()
    }
}`,
    language: 'swift',
    xpReward: 100,
    order: 10,
    quiz: {
      question: 'ما معنى $0 و $1 في Closure؟',
      options: ['متغيرات عشوائية', 'المعامل الأول والثاني', 'أرقام', 'أخطاء'],
      correctAnswer: 1,
      explanation: '$0 هو المعامل الأول، $1 الثاني وهكذا',
    },
  },
  {
    id: 'swift-11',
    courseId: 'swift-basics',
    title: 'Tuples - المجموعات الثنائية',
    description: 'تجميع عدة قيم معاً',
    content: `
# Tuples في Swift

## ما هو Tuple؟
طريقة لتجميع عدة قيم معاً في قيمة واحدة

## لماذا Tuples؟
- إرجاع أكثر من قيمة من دالة
- تجميع بيانات مؤقتة
- لا تحتاج struct كامل

## أنواع Tuples
- Unnamed - بدون أسماء
- Named - مع أسماء
- Mixed - خليط

## الفرق بين Tuple و Struct
Tuple للبيانات المؤقتة البسيطة
Struct للبيانات الدائمة المعقدة
    `,
    codeExample: `// Tuple بسيط
let person = ("أحمد", 25)
print(person.0)  // أحمد
print(person.1)  // 25

// Tuple مع أسماء
let user = (name: "سارة", age: 22, city: "بغداد")
print(user.name)  // سارة
print(user.age)   // 22

// تفكيك Tuple (Decomposition)
let (userName, userAge) = person
print("الاسم: \\(userName), العمر: \\(userAge)")

// تجاهل قيمة
let (name, _) = person  // نتجاهل العمر
print(name)

// Tuple كإرجاع من دالة
func getCoordinates() -> (x: Int, y: Int) {
    return (10, 20)
}

let point = getCoordinates()
print("X: \\(point.x), Y: \\(point.y)")

// استخدام عملي
func divide(_ a: Int, by b: Int) -> (result: Int, remainder: Int) {
    return (a / b, a % b)
}

let division = divide(17, by: 5)
print("النتيجة: \\(division.result)")      // 3
print("الباقي: \\(division.remainder)")    // 2

// Tuple مع switch
let httpStatus = (code: 200, message: "OK")

switch httpStatus {
case (200, let message):
    print("نجح: \\(message)")
case (404, _):
    print("غير موجود")
case (500...599, let message):
    print("خطأ في الخادم: \\(message)")
default:
    print("كود غير معروف")
}

// مقارنة Tuples
let tuple1 = (1, "a")
let tuple2 = (1, "a")
print(tuple1 == tuple2)  // true`,
    language: 'swift',
    xpReward: 100,
    order: 11,
    quiz: {
      question: 'كيف نصل للعنصر الأول في Tuple بدون اسم؟',
      options: ['.first', '[0]', '.0', '.1'],
      correctAnswer: 2,
      explanation: 'نستخدم .0 للعنصر الأول، .1 للثاني، وهكذا',
    },
  },
  {
    id: 'swift-12',
    courseId: 'swift-basics',
    title: 'Enumerations - التعدادات',
    description: 'تعريف مجموعة من القيم المحددة',
    content: `
# Enumerations في Swift

## ما هو Enum؟
نوع يحدد مجموعة من القيم المرتبطة

## لماذا Enums؟
- تجنب الأخطاء الإملائية
- الأمان في الكود
- إكمال تلقائي في Xcode
- استخدام switch بأمان

## ميزات Swift Enums
- يمكن أن تحتوي على methods
- يمكن أن تحتوي على associated values
- يمكن أن تحتوي على raw values
    `,
    codeExample: `// Enum بسيط
enum Direction {
    case north
    case south
    case east
    case west
}

// أو في سطر واحد
enum CompassPoint {
    case north, south, east, west
}

var heading = Direction.north
heading = .south  // اختصار

// مع switch
switch heading {
case .north:
    print("اتجه شمالاً")
case .south:
    print("اتجه جنوباً")
case .east:
    print("اتجه شرقاً")
case .west:
    print("اتجه غرباً")
}

// Enum مع Raw Values
enum Grade: String {
    case excellent = "A"
    case veryGood = "B"
    case good = "C"
    case pass = "D"
    case fail = "F"
}

let myGrade = Grade.excellent
print(myGrade.rawValue)  // A

// إنشاء من Raw Value
if let grade = Grade(rawValue: "B") {
    print("حصلت على: \\(grade)")
}

// Enum مع Associated Values
enum Barcode {
    case upc(Int, Int, Int, Int)
    case qrCode(String)
}

var product = Barcode.upc(8, 85909, 51226, 3)
product = .qrCode("ABCDEFGH")

switch product {
case .upc(let numberSystem, let manufacturer, let product, let check):
    print("UPC: \\(numberSystem), \\(manufacturer), \\(product), \\(check)")
case .qrCode(let code):
    print("QR: \\(code)")
}

// Enum مع Methods
enum Weekday: Int {
    case sunday = 1, monday, tuesday, wednesday, thursday, friday, saturday
    
    func isWeekend() -> Bool {
        return self == .friday || self == .saturday
    }
    
    func arabicName() -> String {
        switch self {
        case .sunday: return "الأحد"
        case .monday: return "الاثنين"
        case .tuesday: return "الثلاثاء"
        case .wednesday: return "الأربعاء"
        case .thursday: return "الخميس"
        case .friday: return "الجمعة"
        case .saturday: return "السبت"
        }
    }
}

let today = Weekday.friday
print(today.arabicName())     // الجمعة
print(today.isWeekend())      // true`,
    language: 'swift',
    xpReward: 100,
    order: 12,
    quiz: {
      question: 'ما فائدة استخدام Enum بدلاً من String عادي؟',
      options: [
        'أسرع في التنفيذ',
        'يمنع الأخطاء الإملائية ويوفر أمان للكود',
        'يستخدم ذاكرة أقل',
        'لا فرق',
      ],
      correctAnswer: 1,
      explanation: 'Enum يضمن استخدام قيم صحيحة فقط ويمنع الأخطاء',
    },
  },
  {
    id: 'swift-13',
    courseId: 'swift-basics',
    title: 'Properties - الخصائص',
    description: 'Stored و Computed Properties',
    content: `
# Properties في Swift

## أنواع Properties

### Stored Properties
خصائص تُخزن قيمة

### Computed Properties
خصائص تُحسب قيمتها عند الطلب

## Property Observers
متابعة التغييرات في القيمة
- willSet - قبل التغيير
- didSet - بعد التغيير

## Lazy Properties
تُنشأ عند أول استخدام فقط
    `,
    codeExample: `// Stored Properties
struct Rectangle {
    var width: Double
    var height: Double
}

var rect = Rectangle(width: 10, height: 20)
print(rect.width)  // 10

// Computed Property
struct Circle {
    var radius: Double
    
    // خاصية محسوبة - القراءة والكتابة
    var diameter: Double {
        get {
            return radius * 2
        }
        set {
            radius = newValue / 2
        }
    }
    
    // خاصية محسوبة - القراءة فقط
    var area: Double {
        return Double.pi * radius * radius
    }
}

var circle = Circle(radius: 5)
print(circle.diameter)  // 10.0
print(circle.area)      // 78.54

circle.diameter = 20
print(circle.radius)    // 10.0

// Property Observers
struct Temperature {
    var celsius: Double {
        willSet {
            print("ستتغير الحرارة من \\(celsius) إلى \\(newValue)")
        }
        didSet {
            if celsius > oldValue {
                print("ارتفعت الحرارة!")
            } else {
                print("انخفضت الحرارة!")
            }
        }
    }
}

var temp = Temperature(celsius: 20)
temp.celsius = 25  // ستتغير... ارتفعت الحرارة!

// Lazy Property
class DataManager {
    lazy var dataArray = [Int]()  // لن تُنشأ إلا عند الاستخدام
    
    lazy var expensiveData: [String] = {
        print("جاري تحميل البيانات...")
        return ["item1", "item2", "item3"]
    }()
}

let manager = DataManager()
// لم يُطبع "جاري تحميل..." بعد
print(manager.expensiveData)  // الآن يُطبع ويُحمّل

// Type Properties (Static)
struct Math {
    static let pi = 3.14159
    static var multiplier = 1.0
    
    static func square(_ n: Double) -> Double {
        return n * n * multiplier
    }
}

print(Math.pi)  // 3.14159
Math.multiplier = 2.0
print(Math.square(5))  // 50.0`,
    language: 'swift',
    xpReward: 100,
    order: 13,
    quiz: {
      question: 'ما الفرق بين Stored و Computed Property؟',
      options: [
        'لا فرق بينهما',
        'Stored تُخزن قيمة، Computed تُحسبها',
        'Stored أسرع فقط',
        'Computed للأرقام فقط',
      ],
      correctAnswer: 1,
      explanation: 'Stored Property تخزن قيمة، Computed تحسبها كل مرة',
    },
  },
  {
    id: 'swift-14',
    courseId: 'swift-basics',
    title: 'Protocols - البروتوكولات',
    description: 'تعريف متطلبات للأنواع',
    content: `
# Protocols في Swift

## ما هو Protocol؟
عقد يحدد متطلبات يجب أن يلتزم بها النوع

## لماذا Protocols؟
- تحديد سلوك مشترك
- المرونة في التصميم
- Protocol-Oriented Programming
- استبدال الوراثة المتعددة

## الفرق عن الوراثة
- Protocol: يمكن تبني عدة protocols
- Class: وراثة واحدة فقط

## Delegation Pattern
نمط شائع في iOS
    `,
    codeExample: `// Protocol بسيط
protocol Drawable {
    func draw()
    var color: String { get set }
}

// تبني Protocol
struct Circle: Drawable {
    var color: String
    var radius: Double
    
    func draw() {
        print("رسم دائرة \\(color) بنصف قطر \\(radius)")
    }
}

struct Square: Drawable {
    var color: String
    var side: Double
    
    func draw() {
        print("رسم مربع \\(color) بضلع \\(side)")
    }
}

let circle = Circle(color: "أحمر", radius: 5)
let square = Square(color: "أزرق", side: 10)

circle.draw()
square.draw()

// Protocol مع Methods ومتطلبات
protocol Vehicle {
    var numberOfWheels: Int { get }
    var color: String { get set }
    
    func start()
    func stop()
    mutating func repaint(color: String)
}

struct Car: Vehicle {
    let numberOfWheels = 4
    var color: String
    
    func start() {
        print("السيارة تنطلق 🚗")
    }
    
    func stop() {
        print("السيارة تتوقف")
    }
    
    mutating func repaint(color: String) {
        self.color = color
        print("تم تغيير اللون إلى \\(color)")
    }
}

var myCar = Car(color: "أحمر")
myCar.start()
myCar.repaint(color: "أزرق")

// Protocol مع Extension
protocol Greetable {
    var name: String { get }
    func sayHello()
}

// إضافة تطبيق افتراضي
extension Greetable {
    func sayHello() {
        print("مرحباً، أنا \\(name)")
    }
    
    func sayGoodbye() {
        print("وداعاً من \\(name)")
    }
}

struct Person: Greetable {
    var name: String
}

let person = Person(name: "أحمد")
person.sayHello()    // مرحباً، أنا أحمد
person.sayGoodbye()  // وداعاً من أحمد

// تبني عدة Protocols
protocol Named {
    var name: String { get }
}

protocol Aged {
    var age: Int { get }
}

struct Student: Named, Aged {
    var name: String
    var age: Int
}

let student = Student(name: "سارة", age: 20)`,
    language: 'swift',
    xpReward: 100,
    order: 14,
    quiz: {
      question: 'كم protocol يمكن أن يتبنى النوع الواحد؟',
      options: ['واحد فقط', 'اثنين', 'عدد غير محدود', 'ثلاثة فقط'],
      correctAnswer: 2,
      explanation: 'يمكن تبني عدد غير محدود من الـ protocols',
    },
  },
  {
    id: 'swift-15',
    courseId: 'swift-basics',
    title: 'Error Handling - معالجة الأخطاء',
    description: 'التعامل مع الأخطاء بأمان',
    content: `
# Error Handling في Swift

## لماذا معالجة الأخطاء؟
- منع تعطل التطبيق
- التعامل مع الحالات غير المتوقعة
- إعطاء رسائل واضحة للمستخدم

## الكلمات المفتاحية
- \`throw\` - رمي خطأ
- \`throws\` - دالة قد ترمي خطأ
- \`try\` - محاولة تنفيذ كود قد يفشل
- \`catch\` - التقاط والتعامل مع الخطأ
- \`do\` - كتلة لتجربة الكود

## أنواع معالجة الأخطاء
- do-catch - المعالجة الكاملة
- try? - إرجاع optional
- try! - إجبار (خطر!)
    `,
    codeExample: `// تعريف أنواع الأخطاء
enum ValidationError: Error {
    case emptyName
    case tooYoung
    case invalidEmail
}

// دالة ترمي خطأ
func validateUser(name: String, age: Int) throws -> Bool {
    if name.isEmpty {
        throw ValidationError.emptyName
    }
    
    if age < 18 {
        throw ValidationError.tooYoung
    }
    
    return true
}

// معالجة الخطأ - do-catch
do {
    try validateUser(name: "أحمد", age: 25)
    print("المستخدم صالح ✅")
} catch ValidationError.emptyName {
    print("❌ الاسم فارغ")
} catch ValidationError.tooYoung {
    print("❌ العمر أقل من 18")
} catch {
    print("❌ خطأ غير متوقع: \\(error)")
}

// try? - إرجاع optional
let result = try? validateUser(name: "", age: 20)
if result == nil {
    print("فشل التحقق")
}

// try! - إجبار (استخدم بحذر!)
// let forced = try! validateUser(name: "سارة", age: 22)

// دالة ترمي خطأ وترجع قيمة
enum MathError: Error {
    case divisionByZero
    case negativeNumber
}

func divide(_ a: Int, by b: Int) throws -> Int {
    if b == 0 {
        throw MathError.divisionByZero
    }
    return a / b
}

func squareRoot(_ n: Double) throws -> Double {
    if n < 0 {
        throw MathError.negativeNumber
    }
    return sqrt(n)
}

// معالجة أخطاء متعددة
do {
    let division = try divide(10, by: 2)
    let root = try squareRoot(16)
    print("النتائج: \\(division), \\(root)")
} catch MathError.divisionByZero {
    print("لا يمكن القسمة على صفر")
} catch MathError.negativeNumber {
    print("لا يمكن حساب جذر عدد سالب")
} catch {
    print("خطأ: \\(error)")
}

// defer - تنفيذ عند الخروج
func processFile() throws {
    print("1. فتح الملف")
    defer {
        print("4. إغلاق الملف")  // يُنفذ دائماً
    }
    
    print("2. قراءة البيانات")
    // throw FileError.corrupted  // حتى لو حدث خطأ
    print("3. معالجة البيانات")
}

try? processFile()

// مثال عملي
enum NetworkError: Error {
    case noConnection
    case timeout
    case serverError(code: Int)
}

func fetchData(from url: String) throws -> String {
    // محاكاة طلب شبكة
    if url.isEmpty {
        throw NetworkError.noConnection
    }
    return "البيانات"
}

do {
    let data = try fetchData(from: "https://api.example.com")
    print("تم التحميل: \\(data)")
} catch NetworkError.noConnection {
    print("تحقق من الاتصال بالإنترنت")
} catch NetworkError.serverError(let code) {
    print("خطأ من الخادم: \\(code)")
} catch {
    print("خطأ غير معروف")
}`,
    language: 'swift',
    xpReward: 100,
    order: 15,
    quiz: {
      question: 'ما الفرق بين try? و try!؟',
      options: [
        'لا فرق',
        'try? يرجع optional و try! قد يسبب crash',
        'try! أسرع',
        'try? للأخطاء الكبيرة فقط',
      ],
      correctAnswer: 1,
      explanation: 'try? آمن ويرجع nil، try! خطر وقد يعطل التطبيق',
    },
  },
];

// ===== تحديات Swift =====
export const SWIFT_CHALLENGES: Challenge[] = [
  {
    id: 'swift-ch-1',
    title: 'مرحباً Swift',
    description: 'اكتب برنامج يطبع "Hello, World!"',
    difficulty: 'easy',
    points: 10,
    language: 'Swift',
    icon: 'logo-apple',
    starterCode: `// اكتب الكود هنا
`,
    solution: `print("Hello, World!")`,
    hints: ['استخدم print()'],
    testCases: [
      {
        input: '',
        expectedOutput: 'Hello, World!',
        description: 'يجب طباعة Hello, World!',
      },
    ],
    isLocked: false,
    category: 'basics',
  },
  {
    id: 'swift-ch-2',
    title: 'مجموع مصفوفة',
    description: 'احسب مجموع جميع عناصر المصفوفة',
    difficulty: 'easy',
    points: 15,
    language: 'Swift',
    icon: 'calculator',
    starterCode: `func sumArray(_ arr: [Int]) -> Int {
    // اكتب الكود هنا
    return 0
}`,
    solution: `func sumArray(_ arr: [Int]) -> Int {
    return arr.reduce(0, +)
}`,
    hints: ['استخدم reduce', 'أو حلقة for'],
    testCases: [
      {
        input: '[1, 2, 3, 4, 5]',
        expectedOutput: '15',
        description: 'مجموع 1-5',
      },
    ],
    isLocked: false,
    category: 'arrays',
  },
  {
    id: 'swift-ch-3',
    title: 'عكس نص',
    description: 'اكتب دالة تعكس النص المُدخل',
    difficulty: 'medium',
    points: 25,
    language: 'Swift',
    icon: 'swap-horizontal',
    starterCode: `func reverseString(_ s: String) -> String {
    // اكتب الكود هنا
    return ""
}`,
    solution: `func reverseString(_ s: String) -> String {
    return String(s.reversed())
}`,
    hints: ['استخدم reversed()', 'ثم String()'],
    testCases: [
      { input: '"hello"', expectedOutput: 'olleh', description: 'عكس hello' },
    ],
    isLocked: false,
    category: 'strings',
  },
  {
    id: 'swift-ch-4',
    title: 'Optionals بأمان',
    description: 'اكتب دالة تُرجع طول النص أو 0 إذا كان nil',
    difficulty: 'medium',
    points: 30,
    language: 'Swift',
    icon: 'shield-checkmark',
    starterCode: `func safeLength(_ s: String?) -> Int {
    // اكتب الكود هنا
    return 0
}`,
    solution: `func safeLength(_ s: String?) -> Int {
    return s?.count ?? 0
}`,
    hints: ['استخدم Optional Chaining', 'استخدم Nil-Coalescing ??'],
    testCases: [
      { input: '"Hello"', expectedOutput: '5', description: 'طول Hello' },
      { input: 'nil', expectedOutput: '0', description: 'nil يُرجع 0' },
    ],
    isLocked: false,
    category: 'optionals',
  },
  {
    id: 'swift-ch-5',
    title: 'فلترة الأعداد الزوجية',
    description: 'أرجع فقط الأعداد الزوجية من المصفوفة',
    difficulty: 'hard',
    points: 50,
    language: 'Swift',
    icon: 'filter',
    starterCode: `func filterEvens(_ numbers: [Int]) -> [Int] {
    // اكتب الكود هنا
    return []
}`,
    solution: `func filterEvens(_ numbers: [Int]) -> [Int] {
    return numbers.filter { $0 % 2 == 0 }
}`,
    hints: ['استخدم filter', 'تحقق من القابلية للقسمة على 2'],
    testCases: [
      {
        input: '[1,2,3,4,5,6]',
        expectedOutput: '[2,4,6]',
        description: 'فلترة الزوجية',
      },
    ],
    isLocked: true,
    category: 'functional',
  },
];

// ===== تحديات إضافية =====
export const SWIFT_CHALLENGES_EXTRA: Challenge[] = [
  {
    id: 'swift-ch-6',
    title: 'إرجاع Tuple',
    description: 'اكتب دالة تُرجع الحد الأدنى والأقصى من مصفوفة',
    difficulty: 'easy',
    points: 20,
    language: 'Swift',
    icon: 'stats-chart',
    starterCode: `func minMax(_ numbers: [Int]) -> (min: Int, max: Int)? {
    // اكتب الكود هنا
    return nil
}`,
    solution: `func minMax(_ numbers: [Int]) -> (min: Int, max: Int)? {
    guard !numbers.isEmpty else { return nil }
    var currentMin = numbers[0]
    var currentMax = numbers[0]
    
    for number in numbers {
        if number < currentMin {
            currentMin = number
        } else if number > currentMax {
            currentMax = number
        }
    }
    
    return (currentMin, currentMax)
}`,
    hints: [
      'تحقق من المصفوفة الفارغة',
      'استخدم متغيرين للتتبع',
      'أرجع tuple مع أسماء',
    ],
    testCases: [
      {
        input: '[1, 5, 3, 9, 2]',
        expectedOutput: '(min: 1, max: 9)',
        description: 'أصغر وأكبر قيمة',
      },
    ],
    isLocked: false,
    category: 'tuples',
  },
  {
    id: 'swift-ch-7',
    title: 'أيام الأسبوع',
    description: 'استخدم Enum لأيام الأسبوع مع دالة تحدد إذا كان عطلة',
    difficulty: 'medium',
    points: 30,
    language: 'Swift',
    icon: 'calendar',
    starterCode: `enum Weekday {
    // أضف الحالات هنا
    
    func isWeekend() -> Bool {
        // اكتب الكود هنا
        return false
    }
}`,
    solution: `enum Weekday {
    case sunday, monday, tuesday, wednesday, thursday, friday, saturday
    
    func isWeekend() -> Bool {
        return self == .friday || self == .saturday
    }
}`,
    hints: ['أضف 7 حالات', 'الجمعة والسبت عطلة في المنطقة العربية'],
    testCases: [
      {
        input: 'Weekday.friday.isWeekend()',
        expectedOutput: 'true',
        description: 'الجمعة عطلة',
      },
    ],
    isLocked: false,
    category: 'enums',
  },
  {
    id: 'swift-ch-8',
    title: 'معالجة أخطاء القسمة',
    description: 'اكتب دالة قسمة آمنة ترمي خطأ عند القسمة على صفر',
    difficulty: 'medium',
    points: 35,
    language: 'Swift',
    icon: 'warning',
    starterCode: `enum DivisionError: Error {
    case divisionByZero
}

func safeDivide(_ a: Int, by b: Int) throws -> Int {
    // اكتب الكود هنا
    return 0
}`,
    solution: `enum DivisionError: Error {
    case divisionByZero
}

func safeDivide(_ a: Int, by b: Int) throws -> Int {
    if b == 0 {
        throw DivisionError.divisionByZero
    }
    return a / b
}`,
    hints: ['تحقق إذا b يساوي صفر', 'استخدم throw', 'أرجع النتيجة العادية'],
    testCases: [
      { input: '10, 2', expectedOutput: '5', description: 'قسمة عادية' },
      { input: '10, 0', expectedOutput: 'Error', description: 'خطأ' },
    ],
    isLocked: false,
    category: 'error-handling',
  },
];

// ===== تصدير كل المحتوى =====
export const ALL_SWIFT_LESSONS = SWIFT_LESSONS_BEGINNER;
export const ALL_SWIFT_CHALLENGES = [
  ...SWIFT_CHALLENGES,
  ...SWIFT_CHALLENGES_EXTRA,
];

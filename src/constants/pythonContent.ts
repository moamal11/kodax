/**
 * دروس Python الموسعة - من الصفر إلى الاحتراف
 * Kodax Python Curriculum
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس Python المبتدئة الموسعة =====
export const PYTHON_LESSONS_BEGINNER: Lesson[] = [
  {
    id: 'py-1',
    courseId: 'py-basics',
    title: 'مرحباً بايثون!',
    description: 'أول برنامج لك في Python',
    content: `
# مرحباً بك في Python!

Python لغة برمجة قوية وسهلة التعلم.

## لماذا Python؟
- 🎯 سهلة القراءة والكتابة
- 🚀 مستخدمة في كل المجالات
- 💼 مطلوبة في سوق العمل
- 🤖 الأولى في AI و Data Science

## أول برنامج
دالة \`print()\` تطبع النص على الشاشة.

## قواعد أساسية
- Python حساسة لحالة الأحرف
- لا حاجة للفاصلة المنقوطة ;
- المسافات البادئة (Indentation) مهمة جداً!
`,
    codeExample: `# أول برنامج - Hello World!
print("مرحباً بالعالم!")
print("Hello, World!")

# طباعة أرقام
print(2024)
print(3.14)

# طباعة عدة قيم
print("السنة:", 2024)
print("اسمي", "أحمد", "عمري", 25)

# استخدام sep و end
print("أحمد", "محمد", "علي", sep=" - ")
print("السطر الأول", end=" ")
print("نفس السطر")`,
    language: 'python',
    xpReward: 100,
    order: 1,
    quiz: {
      question: 'ما الدالة التي تطبع النص في Python؟',
      options: ['echo()', 'print()', 'write()', 'show()'],
      correctAnswer: 1,
      explanation: 'دالة print() هي المستخدمة للطباعة في Python',
    },
  },
  {
    id: 'py-2',
    courseId: 'py-basics',
    title: 'المتغيرات والأنواع',
    description: 'تخزين البيانات في متغيرات',
    content: `
# المتغيرات في Python

المتغير = صندوق لتخزين البيانات.

## قواعد التسمية
- يبدأ بحرف أو _
- لا يبدأ برقم
- لا يحتوي مسافات
- حساس لحالة الأحرف

## أنواع البيانات الأساسية

### int - أعداد صحيحة
أرقام بدون فاصلة

### float - أعداد عشرية
أرقام بفاصلة

### str - نصوص
بين علامات اقتباس

### bool - منطقي
True أو False

## type()
لمعرفة نوع المتغير
`,
    codeExample: `# الأعداد الصحيحة (int)
age = 25
year = 2024
negative = -10
print(type(age))  # <class 'int'>

# الأعداد العشرية (float)
price = 99.99
pi = 3.14159
temperature = -5.5
print(type(price))  # <class 'float'>

# النصوص (str)
name = "أحمد"
message = 'مرحباً بك'
long_text = """
هذا نص
متعدد الأسطر
"""
print(type(name))  # <class 'str'>

# المنطقي (bool)
is_student = True
is_graduated = False
print(type(is_student))  # <class 'bool'>

# تحويل الأنواع
num_str = "100"
num_int = int(num_str)    # تحويل لـ int
num_float = float(num_str) # تحويل لـ float

age = 25
age_str = str(age)  # تحويل لـ str`,
    language: 'python',
    xpReward: 100,
    order: 2,
    quiz: {
      question: 'ما نوع المتغير x = 3.14؟',
      options: ['int', 'float', 'str', 'bool'],
      correctAnswer: 1,
      explanation: 'الأرقام بفاصلة عشرية هي من نوع float',
    },
  },
  {
    id: 'py-3',
    courseId: 'py-basics',
    title: 'العمليات الحسابية',
    description: 'الجمع والطرح والمزيد',
    content: `
# العمليات الحسابية

Python تدعم كل العمليات الرياضية.

## العمليات الأساسية
| العملية | الرمز | مثال |
|---------|-------|------|
| جمع | + | 5 + 3 |
| طرح | - | 5 - 3 |
| ضرب | * | 5 * 3 |
| قسمة | / | 5 / 3 |
| قسمة صحيحة | // | 5 // 3 |
| باقي القسمة | % | 5 % 3 |
| الأس | ** | 5 ** 3 |

## أولوية العمليات
1. الأقواس ()
2. الأس **
3. الضرب والقسمة
4. الجمع والطرح

## عمليات الإسناد المركبة
\`+=\` , \`-=\` , \`*=\` , \`/=\`
`,
    codeExample: `# العمليات الأساسية
a = 10
b = 3

print(a + b)   # 13 - جمع
print(a - b)   # 7  - طرح
print(a * b)   # 30 - ضرب
print(a / b)   # 3.333... - قسمة
print(a // b)  # 3  - قسمة صحيحة
print(a % b)   # 1  - باقي القسمة
print(a ** b)  # 1000 - الأس (10³)

# أولوية العمليات
result = 2 + 3 * 4    # 14 (الضرب أولاً)
result = (2 + 3) * 4  # 20 (الأقواس أولاً)

# عمليات الإسناد المركبة
x = 10
x += 5   # x = x + 5 = 15
x -= 3   # x = x - 3 = 12
x *= 2   # x = x * 2 = 24
x /= 4   # x = x / 4 = 6.0

# أمثلة عملية
price = 100
discount = 20
final_price = price - (price * discount / 100)
print(f"السعر النهائي: {final_price}")  # 80.0

# حساب المساحة
radius = 5
area = 3.14159 * radius ** 2
print(f"مساحة الدائرة: {area}")`,
    language: 'python',
    xpReward: 100,
    order: 3,
    quiz: {
      question: 'ما نتيجة 17 % 5؟',
      options: ['3', '2', '3.4', '12'],
      correctAnswer: 1,
      explanation: '17 ÷ 5 = 3 والباقي 2، لذا 17 % 5 = 2',
    },
  },
  {
    id: 'py-4',
    courseId: 'py-basics',
    title: 'الإدخال من المستخدم',
    description: 'استقبال بيانات من المستخدم',
    content: `
# دالة input()

لاستقبال إدخال من المستخدم.

## الصيغة الأساسية
\`\`\`python
variable = input("رسالة")
\`\`\`

## ملاحظة مهمة!
input() دائماً ترجع **نص (str)**
حتى لو أدخل المستخدم رقم!

## تحويل الإدخال
- للأعداد الصحيحة: \`int(input())\`
- للأعداد العشرية: \`float(input())\`

## نصائح
- اكتب رسالة واضحة للمستخدم
- تحقق من صحة الإدخال
- تعامل مع الأخطاء المحتملة
`,
    codeExample: `# إدخال نص
name = input("ما اسمك؟ ")
print(f"مرحباً {name}!")

# إدخال رقم (تحويل لـ int)
age = int(input("كم عمرك؟ "))
birth_year = 2024 - age
print(f"ولدت في سنة {birth_year}")

# إدخال رقم عشري
height = float(input("كم طولك بالمتر؟ "))
print(f"طولك {height} متر")

# حاسبة بسيطة
num1 = float(input("أدخل الرقم الأول: "))
num2 = float(input("أدخل الرقم الثاني: "))
print(f"المجموع: {num1 + num2}")
print(f"الفرق: {num1 - num2}")
print(f"الحاصل: {num1 * num2}")

# إدخال متعدد في سطر واحد
x, y = input("أدخل رقمين (مفصولين بمسافة): ").split()
x, y = int(x), int(y)
print(f"x = {x}, y = {y}")

# التعامل مع أخطاء الإدخال
try:
    number = int(input("أدخل رقماً: "))
    print(f"الرقم هو: {number}")
except ValueError:
    print("خطأ! يجب إدخال رقم صحيح")`,
    language: 'python',
    xpReward: 100,
    order: 4,
    quiz: {
      question: 'ما نوع القيمة المُرجعة من input()؟',
      options: ['int', 'float', 'str', 'يعتمد على الإدخال'],
      correctAnswer: 2,
      explanation: 'دالة input() دائماً ترجع نص (str) حتى لو أدخلت رقم',
    },
  },
  {
    id: 'py-5',
    courseId: 'py-basics',
    title: 'الشروط if/else',
    description: 'اتخاذ القرارات في البرنامج',
    content: `
# الجمل الشرطية

تسمح للبرنامج باتخاذ قرارات.

## if الأساسية
\`\`\`python
if condition:
    # كود ينفذ إذا الشرط صحيح
\`\`\`

## if-else
\`\`\`python
if condition:
    # إذا صحيح
else:
    # إذا خاطئ
\`\`\`

## if-elif-else
للشروط المتعددة

## عوامل المقارنة
| العامل | المعنى |
|--------|--------|
| == | يساوي |
| != | لا يساوي |
| > | أكبر من |
| < | أصغر من |
| >= | أكبر أو يساوي |
| <= | أصغر أو يساوي |

## العوامل المنطقية
- \`and\`: و (كلاهما صحيح)
- \`or\`: أو (أحدهما صحيح)
- \`not\`: نفي
`,
    codeExample: `# if بسيطة
age = 18
if age >= 18:
    print("أنت بالغ")

# if-else
temperature = 35
if temperature > 30:
    print("الجو حار 🌡️")
else:
    print("الجو معتدل 😊")

# if-elif-else
score = 85

if score >= 90:
    grade = "ممتاز"
elif score >= 80:
    grade = "جيد جداً"
elif score >= 70:
    grade = "جيد"
elif score >= 60:
    grade = "مقبول"
else:
    grade = "راسب"

print(f"التقدير: {grade}")

# العوامل المنطقية
age = 25
has_license = True

if age >= 18 and has_license:
    print("يمكنك القيادة 🚗")

# شرط مركب
username = "admin"
password = "1234"

if username == "admin" and password == "1234":
    print("تم تسجيل الدخول ✅")
else:
    print("خطأ في البيانات ❌")

# Ternary operator (شرط في سطر واحد)
age = 20
status = "بالغ" if age >= 18 else "قاصر"
print(status)

# التحقق من وجود قيمة في قائمة
fruits = ["تفاح", "موز", "برتقال"]
if "تفاح" in fruits:
    print("التفاح موجود!")`,
    language: 'python',
    xpReward: 100,
    order: 5,
    quiz: {
      question: 'متى ينفذ كود else؟',
      options: [
        'دائماً',
        'عندما يكون شرط if صحيح',
        'عندما يكون شرط if خاطئ',
        'أبداً',
      ],
      correctAnswer: 2,
      explanation: 'كود else ينفذ فقط عندما يكون شرط if خاطئاً (False)',
    },
  },
  {
    id: 'py-6',
    courseId: 'py-basics',
    title: 'حلقة for',
    description: 'تكرار الكود عدة مرات',
    content: `
# حلقة for

لتكرار كود عدد محدد من المرات.

## الصيغة الأساسية
\`\`\`python
for variable in sequence:
    # كود يتكرر
\`\`\`

## range()
لتوليد تسلسل أرقام:
- \`range(n)\`: من 0 إلى n-1
- \`range(start, end)\`: من start إلى end-1
- \`range(start, end, step)\`: مع خطوة

## المرور على:
- القوائم
- النصوص
- القواميس
- أي iterable

## break و continue
- \`break\`: الخروج من الحلقة
- \`continue\`: تخطي التكرار الحالي
`,
    codeExample: `# تكرار بسيط
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# تكرار من رقم لرقم
for i in range(1, 6):
    print(i)  # 1, 2, 3, 4, 5

# تكرار بخطوة
for i in range(0, 10, 2):
    print(i)  # 0, 2, 4, 6, 8

# المرور على قائمة
fruits = ["تفاح", "موز", "برتقال"]
for fruit in fruits:
    print(f"أحب {fruit}")

# المرور على نص
word = "Python"
for letter in word:
    print(letter)

# enumerate للحصول على الفهرس
students = ["أحمد", "محمد", "علي"]
for index, name in enumerate(students):
    print(f"{index + 1}. {name}")

# جدول الضرب
num = 5
for i in range(1, 11):
    print(f"{num} × {i} = {num * i}")

# break للخروج
for i in range(10):
    if i == 5:
        break
    print(i)  # 0, 1, 2, 3, 4

# continue للتخطي
for i in range(10):
    if i % 2 == 0:  # تخطي الأرقام الزوجية
        continue
    print(i)  # 1, 3, 5, 7, 9

# for-else
for n in range(2, 10):
    for x in range(2, n):
        if n % x == 0:
            break
    else:
        print(f"{n} رقم أولي")`,
    language: 'python',
    xpReward: 100,
    order: 6,
    quiz: {
      question: 'ما نتيجة range(2, 5)؟',
      options: [
        '[2, 3, 4, 5]',
        '[2, 3, 4]',
        '[1, 2, 3, 4, 5]',
        '[0, 1, 2, 3, 4]',
      ],
      correctAnswer: 1,
      explanation: 'range(2, 5) ينتج 2, 3, 4 (لا يشمل الرقم الأخير)',
    },
  },
  {
    id: 'py-7',
    courseId: 'py-basics',
    title: 'حلقة while',
    description: 'التكرار بشرط',
    content: `
# حلقة while

تكرار الكود طالما الشرط صحيح.

## الصيغة
\`\`\`python
while condition:
    # كود يتكرر
\`\`\`

## متى نستخدم while؟
- عندما لا نعرف عدد التكرارات مسبقاً
- حتى يتحقق شرط معين
- لإنشاء حلقات لا نهائية (بحذر!)

## تحذير ⚠️
تأكد من وجود طريقة للخروج من الحلقة
لتجنب الحلقة اللانهائية!

## while True
لحلقة لا نهائية (تخرج بـ break)
`,
    codeExample: `# while بسيطة
count = 0
while count < 5:
    print(count)
    count += 1  # مهم! لتجنب الحلقة اللانهائية

# العد التنازلي
countdown = 5
while countdown > 0:
    print(countdown)
    countdown -= 1
print("انطلق! 🚀")

# إدخال حتى قيمة صحيحة
while True:
    age = input("أدخل عمرك: ")
    if age.isdigit() and int(age) > 0:
        age = int(age)
        break
    print("أدخل رقماً صحيحاً موجباً!")

# لعبة التخمين
import random
secret = random.randint(1, 100)
attempts = 0

while True:
    guess = int(input("خمن الرقم (1-100): "))
    attempts += 1
    
    if guess < secret:
        print("أكبر! ⬆️")
    elif guess > secret:
        print("أصغر! ⬇️")
    else:
        print(f"صحيح! 🎉 في {attempts} محاولات")
        break

# while مع else
n = 5
while n > 0:
    print(n)
    n -= 1
else:
    print("انتهت الحلقة بشكل طبيعي")

# حساب المجموع
total = 0
while True:
    num = input("أدخل رقم (أو 'stop' للإنهاء): ")
    if num.lower() == 'stop':
        break
    total += float(num)
print(f"المجموع: {total}")`,
    language: 'python',
    xpReward: 100,
    order: 7,
    quiz: {
      question: 'متى تتوقف حلقة while؟',
      options: [
        'بعد تكرار واحد',
        'عندما يصبح الشرط False',
        'أبداً',
        'بعد 10 تكرارات',
      ],
      correctAnswer: 1,
      explanation: 'حلقة while تستمر طالما الشرط True وتتوقف عندما يصبح False',
    },
  },
  {
    id: 'py-8',
    courseId: 'py-basics',
    title: 'القوائم Lists',
    description: 'تخزين مجموعة من القيم',
    content: `
# القوائم (Lists)

القائمة = مجموعة مرتبة من العناصر.

## الخصائص
- مرتبة (لها فهرس)
- قابلة للتغيير (mutable)
- تقبل أي نوع من البيانات
- تقبل التكرار

## إنشاء قائمة
\`\`\`python
my_list = [1, 2, 3]
empty = []
mixed = [1, "نص", True, 3.14]
\`\`\`

## الوصول للعناصر
- الفهرس يبدأ من 0
- الفهرس السالب من النهاية

## العمليات الأساسية
- الإضافة: append, insert, extend
- الحذف: remove, pop, del, clear
- البحث: index, count, in
`,
    codeExample: `# إنشاء قوائم
numbers = [1, 2, 3, 4, 5]
names = ["أحمد", "محمد", "علي"]
mixed = [1, "نص", True, 3.14, [1, 2]]

# الوصول للعناصر
print(numbers[0])   # 1 (الأول)
print(numbers[-1])  # 5 (الأخير)
print(numbers[1:4]) # [2, 3, 4] (slicing)

# تعديل العناصر
numbers[0] = 10
print(numbers)  # [10, 2, 3, 4, 5]

# إضافة عناصر
numbers.append(6)      # في النهاية
numbers.insert(0, 0)   # في موقع محدد
numbers.extend([7, 8]) # إضافة قائمة

# حذف عناصر
numbers.remove(3)    # حذف قيمة معينة
popped = numbers.pop()  # حذف وإرجاع الأخير
del numbers[0]       # حذف بالفهرس
# numbers.clear()    # حذف الكل

# البحث
if 5 in numbers:
    print("موجود!")
    print(f"في الفهرس: {numbers.index(5)}")

# معلومات
print(len(numbers))    # الطول
print(numbers.count(2)) # عدد مرات ظهور 2

# الترتيب
numbers.sort()           # ترتيب تصاعدي
numbers.sort(reverse=True)  # ترتيب تنازلي
numbers.reverse()        # عكس الترتيب

# نسخ القائمة
copy1 = numbers.copy()
copy2 = numbers[:]
copy3 = list(numbers)

# List Comprehension
squares = [x**2 for x in range(1, 6)]
print(squares)  # [1, 4, 9, 16, 25]

evens = [x for x in range(20) if x % 2 == 0]
print(evens)  # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]`,
    language: 'python',
    xpReward: 100,
    order: 8,
    quiz: {
      question: 'ما نتيجة [1, 2, 3][-1]؟',
      options: ['1', '2', '3', 'خطأ'],
      correctAnswer: 2,
      explanation: 'الفهرس -1 يشير للعنصر الأخير في القائمة',
    },
  },
  {
    id: 'py-9',
    courseId: 'py-basics',
    title: 'الدوال Functions',
    description: 'إنشاء واستخدام الدوال',
    content: `
# الدوال (Functions)

الدالة = كود قابل لإعادة الاستخدام.

## لماذا الدوال؟
- تجنب التكرار (DRY)
- تنظيم الكود
- سهولة الصيانة
- إعادة الاستخدام

## تعريف دالة
\`\`\`python
def function_name(parameters):
    # كود
    return value
\`\`\`

## أنواع المعاملات
- مطلوبة: يجب تمريرها
- افتراضية: لها قيمة default
- *args: معاملات متعددة
- **kwargs: معاملات مسماة

## return
- ترجع قيمة من الدالة
- تنهي تنفيذ الدالة
`,
    codeExample: `# دالة بسيطة
def greet():
    print("مرحباً!")

greet()  # استدعاء

# دالة بمعامل
def greet_person(name):
    print(f"مرحباً {name}!")

greet_person("أحمد")

# دالة بـ return
def add(a, b):
    return a + b

result = add(5, 3)
print(result)  # 8

# قيم افتراضية
def greet_with_message(name, message="مرحباً"):
    return f"{message} {name}!"

print(greet_with_message("أحمد"))  # مرحباً أحمد!
print(greet_with_message("أحمد", "صباح الخير"))

# *args - عدد غير محدد من المعاملات
def sum_all(*numbers):
    return sum(numbers)

print(sum_all(1, 2, 3, 4, 5))  # 15

# **kwargs - معاملات مسماة
def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

print_info(name="أحمد", age=25, city="بغداد")

# إرجاع قيم متعددة
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers) / len(numbers)

minimum, maximum, average = get_stats([1, 2, 3, 4, 5])
print(f"Min: {minimum}, Max: {maximum}, Avg: {average}")

# Lambda functions
square = lambda x: x ** 2
print(square(5))  # 25

# Lambda مع map
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
print(squared)  # [1, 4, 9, 16, 25]`,
    language: 'python',
    xpReward: 100,
    order: 9,
    quiz: {
      question: 'ما الكلمة المفتاحية لتعريف دالة؟',
      options: ['function', 'def', 'func', 'fn'],
      correctAnswer: 1,
      explanation: 'نستخدم def لتعريف دالة في Python',
    },
  },
  {
    id: 'py-10',
    courseId: 'py-basics',
    title: 'القواميس Dictionaries',
    description: 'تخزين البيانات بمفتاح وقيمة',
    content: `
# القواميس (Dictionaries)

القاموس = مجموعة من أزواج مفتاح:قيمة.

## الخصائص
- غير مرتب (من Python 3.7 مرتب)
- قابل للتغيير
- المفاتيح فريدة
- سريع في البحث

## إنشاء قاموس
\`\`\`python
my_dict = {"key": "value"}
empty = {}
\`\`\`

## الوصول للقيم
- \`dict[key]\` - يرمي خطأ إذا غير موجود
- \`dict.get(key)\` - يرجع None إذا غير موجود

## العمليات
- إضافة/تعديل: \`dict[key] = value\`
- حذف: del, pop, clear
- البحث: in, keys, values, items
`,
    codeExample: `# إنشاء قاموس
person = {
    "name": "أحمد",
    "age": 25,
    "city": "بغداد",
    "skills": ["Python", "JavaScript"]
}

# الوصول للقيم
print(person["name"])      # أحمد
print(person.get("job"))   # None (بدون خطأ)
print(person.get("job", "غير محدد"))  # قيمة افتراضية

# إضافة/تعديل
person["job"] = "مبرمج"
person["age"] = 26
print(person)

# حذف
del person["city"]
job = person.pop("job")
print(job)  # مبرمج

# البحث
if "name" in person:
    print("الاسم موجود")

# المرور على القاموس
for key in person:
    print(f"{key}: {person[key]}")

for key, value in person.items():
    print(f"{key} = {value}")

print(person.keys())   # المفاتيح
print(person.values()) # القيم

# قاموس متداخل
users = {
    "user1": {"name": "أحمد", "age": 25},
    "user2": {"name": "محمد", "age": 30}
}
print(users["user1"]["name"])  # أحمد

# Dictionary Comprehension
squares = {x: x**2 for x in range(1, 6)}
print(squares)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# دمج قواميس
dict1 = {"a": 1, "b": 2}
dict2 = {"c": 3, "d": 4}
merged = {**dict1, **dict2}  # Python 3.5+
# أو
dict1.update(dict2)

# setdefault
counter = {}
for char in "hello":
    counter[char] = counter.get(char, 0) + 1
print(counter)  # {'h': 1, 'e': 1, 'l': 2, 'o': 1}`,
    language: 'python',
    xpReward: 100,
    order: 10,
    quiz: {
      question: 'كيف نحصل على قيمة مفتاح غير موجود بدون خطأ؟',
      options: [
        'dict[key]',
        'dict.get(key)',
        'dict.find(key)',
        'dict.fetch(key)',
      ],
      correctAnswer: 1,
      explanation:
        'dict.get(key) يرجع None إذا المفتاح غير موجود بدلاً من رمي خطأ',
    },
  },
];

// ===== دروس هياكل البيانات =====
export const PYTHON_LESSONS_DATA_STRUCTURES: Lesson[] = [
  {
    id: 'py-ds-1',
    courseId: 'py-data-structures',
    title: 'Tuples (الصفوف)',
    description: 'البيانات الثابتة غير القابلة للتغيير',
    content: `
# Tuples (الصفوف)

الصف = مجموعة مرتبة **غير قابلة للتغيير**.

## الفرق بين List و Tuple
| List | Tuple |
|------|-------|
| قابلة للتغيير | غير قابلة للتغيير |
| أبطأ قليلاً | أسرع |
| \`[]\` | \`()\` |

## متى نستخدم Tuple؟
- البيانات الثابتة (الإحداثيات، الألوان)
- كمفاتيح في القواميس
- إرجاع قيم متعددة من دالة
- حماية البيانات من التعديل

## إنشاء Tuple
\`\`\`python
t = (1, 2, 3)
t = 1, 2, 3  # بدون أقواس
t = (1,)     # tuple من عنصر واحد (الفاصلة مهمة!)
\`\`\`
`,
    codeExample: `# إنشاء tuple
coordinates = (10, 20)
colors = ("أحمر", "أخضر", "أزرق")
single = (42,)  # الفاصلة مهمة لعنصر واحد!

# الوصول للعناصر
print(coordinates[0])  # 10
print(colors[-1])      # أزرق

# Tuple unpacking
x, y = coordinates
print(f"x={x}, y={y}")

# Unpacking متقدم
first, *rest = (1, 2, 3, 4, 5)
print(first)  # 1
print(rest)   # [2, 3, 4, 5]

# Tuple في دالة
def get_min_max(numbers):
    return min(numbers), max(numbers)

minimum, maximum = get_min_max([5, 2, 8, 1, 9])
print(f"Min: {minimum}, Max: {maximum}")

# Tuple كمفتاح قاموس
locations = {
    (0, 0): "البداية",
    (10, 5): "الوسط",
    (20, 10): "النهاية"
}
print(locations[(10, 5)])  # الوسط

# العمليات على Tuples
t1 = (1, 2, 3)
t2 = (4, 5, 6)
print(t1 + t2)      # (1, 2, 3, 4, 5, 6)
print(t1 * 2)       # (1, 2, 3, 1, 2, 3)
print(len(t1))      # 3
print(2 in t1)      # True
print(t1.count(2))  # 1
print(t1.index(2))  # 1

# تحويل
list_data = [1, 2, 3]
tuple_data = tuple(list_data)
back_to_list = list(tuple_data)`,
    language: 'python',
    xpReward: 100,
    order: 1,
    quiz: {
      question: 'ما الفرق الرئيسي بين List و Tuple؟',
      options: [
        'List أسرع',
        'Tuple قابل للتغيير',
        'Tuple غير قابل للتغيير',
        'لا يوجد فرق',
      ],
      correctAnswer: 2,
      explanation: 'Tuple غير قابل للتغيير (immutable) بعكس List',
    },
  },
  {
    id: 'py-ds-2',
    courseId: 'py-data-structures',
    title: 'Sets (المجموعات)',
    description: 'مجموعة عناصر فريدة بدون ترتيب',
    content: `
# Sets (المجموعات)

المجموعة = عناصر **فريدة** بدون ترتيب.

## الخصائص
- لا تقبل التكرار
- غير مرتبة (لا فهرس)
- سريعة جداً في البحث O(1)
- قابلة للتغيير

## متى نستخدم Set؟
- إزالة التكرارات
- التحقق من وجود عنصر بسرعة
- عمليات المجموعات (اتحاد، تقاطع...)

## إنشاء Set
\`\`\`python
s = {1, 2, 3}
s = set([1, 2, 2, 3])  # {1, 2, 3}
s = set()  # مجموعة فارغة
\`\`\`
`,
    codeExample: `# إنشاء مجموعة
numbers = {1, 2, 3, 4, 5}
from_list = set([1, 2, 2, 3, 3, 3])
print(from_list)  # {1, 2, 3}

# إضافة وحذف
numbers.add(6)
numbers.remove(1)    # خطأ إذا غير موجود
numbers.discard(10)  # لا خطأ إذا غير موجود
popped = numbers.pop()  # حذف عشوائي

# البحث السريع
if 3 in numbers:
    print("موجود!")

# إزالة التكرارات من قائمة
names = ["أحمد", "محمد", "أحمد", "علي", "محمد"]
unique_names = list(set(names))
print(unique_names)

# عمليات المجموعات
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

# الاتحاد (Union)
print(a | b)  # {1, 2, 3, 4, 5, 6}
print(a.union(b))

# التقاطع (Intersection)
print(a & b)  # {3, 4}
print(a.intersection(b))

# الفرق (Difference)
print(a - b)  # {1, 2}
print(a.difference(b))

# الفرق المتماثل (ما ليس مشتركاً)
print(a ^ b)  # {1, 2, 5, 6}
print(a.symmetric_difference(b))

# التحقق من العلاقات
c = {1, 2}
print(c.issubset(a))     # True - هل c جزء من a؟
print(a.issuperset(c))   # True - هل a يحتوي c؟
print(a.isdisjoint({7, 8}))  # True - لا عناصر مشتركة

# frozenset - مجموعة ثابتة
fs = frozenset([1, 2, 3])
# fs.add(4)  # خطأ! غير قابلة للتغيير`,
    language: 'python',
    xpReward: 100,
    order: 2,
    quiz: {
      question: 'ما نتيجة set([1, 2, 2, 3, 3])؟',
      options: ['[1, 2, 2, 3, 3]', '{1, 2, 3}', '{1, 2, 2, 3, 3}', 'خطأ'],
      correctAnswer: 1,
      explanation: 'Set يزيل التكرارات تلقائياً',
    },
  },
  {
    id: 'py-ds-3',
    courseId: 'py-data-structures',
    title: 'النصوص المتقدمة',
    description: 'عمليات متقدمة على النصوص',
    content: `
# معالجة النصوص المتقدمة

النصوص في Python غنية بالدوال المفيدة.

## دوال التحويل
- \`upper()\` / \`lower()\`
- \`title()\` / \`capitalize()\`
- \`swapcase()\`

## دوال البحث
- \`find()\` / \`rfind()\`
- \`index()\` / \`rindex()\`
- \`count()\`

## دوال التحقق
- \`startswith()\` / \`endswith()\`
- \`isalpha()\` / \`isdigit()\` / \`isalnum()\`
- \`isspace()\` / \`isupper()\` / \`islower()\`

## دوال التعديل
- \`strip()\` / \`lstrip()\` / \`rstrip()\`
- \`replace()\`
- \`split()\` / \`join()\`
`,
    codeExample: `text = "  Hello, Python World!  "

# إزالة المسافات
print(text.strip())   # "Hello, Python World!"
print(text.lstrip())  # "Hello, Python World!  "
print(text.rstrip())  # "  Hello, Python World!"

# التحويل
print("hello".upper())      # HELLO
print("HELLO".lower())      # hello
print("hello world".title()) # Hello World
print("hELLO".swapcase())   # Hello

# البحث
sentence = "Python is awesome and Python is fun"
print(sentence.find("Python"))      # 0 (أول موقع)
print(sentence.rfind("Python"))     # 23 (آخر موقع)
print(sentence.count("Python"))     # 2
print(sentence.find("Java"))        # -1 (غير موجود)

# التحقق
print("Hello".startswith("He"))     # True
print("Hello".endswith("lo"))       # True
print("abc123".isalnum())           # True
print("123".isdigit())              # True
print("abc".isalpha())              # True

# التقسيم والدمج
words = "one,two,three".split(",")
print(words)  # ['one', 'two', 'three']

joined = " - ".join(["أحمد", "محمد", "علي"])
print(joined)  # أحمد - محمد - علي

# الاستبدال
text = "I love Java"
print(text.replace("Java", "Python"))

# تقسيم متقدم
data = "name:age:city"
name, age, city = data.split(":")

# F-strings المتقدمة
name = "أحمد"
score = 95.5
print(f"{name:>10}")        # محاذاة يمين
print(f"{name:<10}")        # محاذاة يسار
print(f"{name:^10}")        # توسيط
print(f"{score:.1f}")       # 95.5
print(f"{score:08.2f}")     # 00095.50
print(f"{1000000:,}")       # 1,000,000`,
    language: 'python',
    xpReward: 100,
    order: 3,
    quiz: {
      question: 'ماذا ترجع "hello".find("x")؟',
      options: ['0', 'None', '-1', 'خطأ'],
      correctAnswer: 2,
      explanation: 'find() ترجع -1 إذا لم يُوجد النص المطلوب',
    },
  },
  {
    id: 'py-ds-4',
    courseId: 'py-data-structures',
    title: 'Comprehensions',
    description: 'إنشاء البيانات بأسلوب مختصر',
    content: `
# Comprehensions

طريقة مختصرة وأنيقة لإنشاء البيانات.

## الأنواع
1. **List Comprehension**: \`[x for x in ...]\`
2. **Dict Comprehension**: \`{k: v for k, v in ...}\`
3. **Set Comprehension**: \`{x for x in ...}\`
4. **Generator Expression**: \`(x for x in ...)\`

## الصيغة العامة
\`\`\`python
[expression for item in iterable if condition]
\`\`\`

## الفوائد
- كود أقصر وأوضح
- أسرع من الحلقات العادية
- أكثر Pythonic
`,
    codeExample: `# List Comprehension الأساسية
squares = [x**2 for x in range(1, 6)]
print(squares)  # [1, 4, 9, 16, 25]

# مع شرط
evens = [x for x in range(10) if x % 2 == 0]
print(evens)  # [0, 2, 4, 6, 8]

# مع تحويل
names = ["ahmed", "mohammed", "ali"]
upper_names = [name.upper() for name in names]
print(upper_names)  # ['AHMED', 'MOHAMMED', 'ALI']

# Nested loops
matrix = [[1, 2], [3, 4], [5, 6]]
flat = [num for row in matrix for num in row]
print(flat)  # [1, 2, 3, 4, 5, 6]

# مع if-else
labels = ["زوجي" if x % 2 == 0 else "فردي" for x in range(5)]
print(labels)  # ['زوجي', 'فردي', 'زوجي', 'فردي', 'زوجي']

# Dict Comprehension
nums = [1, 2, 3, 4, 5]
squares_dict = {n: n**2 for n in nums}
print(squares_dict)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# عكس قاموس
original = {'a': 1, 'b': 2, 'c': 3}
flipped = {v: k for k, v in original.items()}
print(flipped)  # {1: 'a', 2: 'b', 3: 'c'}

# Set Comprehension
text = "hello world"
unique_letters = {char for char in text if char.isalpha()}
print(unique_letters)  # {'h', 'e', 'l', 'o', 'w', 'r', 'd'}

# Generator Expression (توفير الذاكرة)
sum_squares = sum(x**2 for x in range(1000000))

# مقارنة الذاكرة
import sys
list_comp = [x**2 for x in range(1000)]
gen_exp = (x**2 for x in range(1000))
print(f"List: {sys.getsizeof(list_comp)} bytes")
print(f"Generator: {sys.getsizeof(gen_exp)} bytes")

# تطبيق عملي: تصفية بيانات
students = [
    {"name": "أحمد", "score": 85},
    {"name": "محمد", "score": 45},
    {"name": "علي", "score": 92},
]
passed = [s["name"] for s in students if s["score"] >= 60]
print(passed)  # ['أحمد', 'علي']`,
    language: 'python',
    xpReward: 100,
    order: 4,
    quiz: {
      question: 'ما الفرق بين [] و () في comprehension؟',
      options: [
        'لا فرق',
        '[] تنشئ list و () تنشئ generator',
        '[] أبطأ',
        '() تنشئ tuple',
      ],
      correctAnswer: 1,
      explanation:
        '[] تنشئ list كاملة في الذاكرة، () تنشئ generator يولد القيم عند الطلب',
    },
  },
  {
    id: 'py-ds-5',
    courseId: 'py-data-structures',
    title: 'التعامل مع الملفات',
    description: 'قراءة وكتابة الملفات',
    content: `
# التعامل مع الملفات

Python يوفر طرق سهلة للتعامل مع الملفات.

## فتح ملف
\`\`\`python
file = open("filename", mode)
\`\`\`

## أوضاع الفتح
| الوضع | الوصف |
|-------|-------|
| 'r' | قراءة (الافتراضي) |
| 'w' | كتابة (يمسح المحتوى) |
| 'a' | إضافة |
| 'x' | إنشاء جديد |
| 'b' | binary |
| 't' | text (الافتراضي) |

## with statement
الطريقة الأفضل - تغلق الملف تلقائياً!
\`\`\`python
with open("file.txt") as f:
    content = f.read()
\`\`\`
`,
    codeExample: `# كتابة ملف جديد
with open("test.txt", "w", encoding="utf-8") as f:
    f.write("السطر الأول\\n")
    f.write("السطر الثاني\\n")

# كتابة قائمة
lines = ["سطر 1", "سطر 2", "سطر 3"]
with open("test.txt", "w", encoding="utf-8") as f:
    f.writelines(line + "\\n" for line in lines)

# قراءة كل المحتوى
with open("test.txt", "r", encoding="utf-8") as f:
    content = f.read()
    print(content)

# قراءة سطر سطر
with open("test.txt", "r", encoding="utf-8") as f:
    for line in f:
        print(line.strip())

# قراءة كل السطور في قائمة
with open("test.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()
    print(lines)

# الإضافة لملف موجود
with open("test.txt", "a", encoding="utf-8") as f:
    f.write("سطر جديد مُضاف\\n")

# قراءة وكتابة JSON
import json

data = {"name": "أحمد", "age": 25, "skills": ["Python", "JS"]}

# كتابة JSON
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# قراءة JSON
with open("data.json", "r", encoding="utf-8") as f:
    loaded = json.load(f)
    print(loaded)

# التحقق من وجود ملف
import os
if os.path.exists("test.txt"):
    print("الملف موجود")

# معلومات الملف
print(os.path.getsize("test.txt"))  # الحجم
print(os.path.isfile("test.txt"))   # هل ملف؟
print(os.path.isdir("test.txt"))    # هل مجلد؟

# حذف ملف
# os.remove("test.txt")`,
    language: 'python',
    xpReward: 100,
    order: 5,
    quiz: {
      question: 'ما فائدة with open() مقارنة بـ open()؟',
      options: ['أسرع', 'يغلق الملف تلقائياً', 'يقرأ أكثر', 'لا فرق'],
      correctAnswer: 1,
      explanation: 'with يضمن إغلاق الملف تلقائياً حتى لو حدث خطأ',
    },
  },
  {
    id: 'py-ds-6',
    courseId: 'py-data-structures',
    title: 'معالجة الأخطاء',
    description: 'التعامل مع الاستثناءات',
    content: `
# معالجة الأخطاء (Exceptions)

الاستثناءات = أخطاء تحدث أثناء التنفيذ.

## أنواع الأخطاء الشائعة
- \`SyntaxError\`: خطأ في الصياغة
- \`TypeError\`: نوع خاطئ
- \`ValueError\`: قيمة غير صالحة
- \`IndexError\`: فهرس خارج النطاق
- \`KeyError\`: مفتاح غير موجود
- \`ZeroDivisionError\`: قسمة على صفر
- \`FileNotFoundError\`: ملف غير موجود

## try-except
\`\`\`python
try:
    # كود قد يسبب خطأ
except ErrorType:
    # التعامل مع الخطأ
\`\`\`

## else و finally
- \`else\`: ينفذ إذا لم يحدث خطأ
- \`finally\`: ينفذ دائماً
`,
    codeExample: `# معالجة أساسية
try:
    x = int(input("أدخل رقم: "))
    print(f"الرقم هو: {x}")
except ValueError:
    print("خطأ! أدخل رقماً صحيحاً")

# معالجة أخطاء متعددة
try:
    num = int(input("أدخل رقم: "))
    result = 10 / num
    print(result)
except ValueError:
    print("ليس رقماً صحيحاً!")
except ZeroDivisionError:
    print("لا يمكن القسمة على صفر!")

# التقاط أي خطأ
try:
    # كود خطير
    risky_operation()
except Exception as e:
    print(f"حدث خطأ: {e}")

# else و finally
try:
    file = open("data.txt", "r")
    content = file.read()
except FileNotFoundError:
    print("الملف غير موجود!")
else:
    print("تمت القراءة بنجاح")
    print(content)
finally:
    print("انتهت المحاولة")
    # تنظيف الموارد

# رفع استثناء
def validate_age(age):
    if age < 0:
        raise ValueError("العمر لا يمكن أن يكون سالباً!")
    if age > 150:
        raise ValueError("عمر غير واقعي!")
    return True

try:
    validate_age(-5)
except ValueError as e:
    print(f"خطأ: {e}")

# إنشاء استثناء مخصص
class InvalidEmailError(Exception):
    def __init__(self, email):
        self.email = email
        super().__init__(f"بريد غير صالح: {email}")

def validate_email(email):
    if "@" not in email:
        raise InvalidEmailError(email)
    return True

try:
    validate_email("invalid-email")
except InvalidEmailError as e:
    print(e)

# استخدام assert للتحقق
def divide(a, b):
    assert b != 0, "المقسوم عليه لا يمكن أن يكون صفر"
    return a / b`,
    language: 'python',
    xpReward: 100,
    order: 6,
    quiz: {
      question: 'متى ينفذ كود finally؟',
      options: ['فقط عند حدوث خطأ', 'فقط عند عدم حدوث خطأ', 'دائماً', 'أبداً'],
      correctAnswer: 2,
      explanation: 'finally ينفذ دائماً سواء حدث خطأ أم لا',
    },
  },
  {
    id: 'py-ds-7',
    courseId: 'py-data-structures',
    title: 'الوحدات والحزم',
    description: 'تنظيم الكود في ملفات',
    content: `
# Modules & Packages

## Module (وحدة)
ملف Python واحد (.py)

## Package (حزمة)
مجلد يحتوي على عدة modules

## import الطرق
\`\`\`python
import module
from module import function
from module import *
import module as alias
\`\`\`

## الوحدات المدمجة المهمة
- \`math\`: العمليات الرياضية
- \`random\`: الأرقام العشوائية
- \`datetime\`: التاريخ والوقت
- \`os\`: نظام التشغيل
- \`json\`: التعامل مع JSON
- \`re\`: التعبيرات النمطية
`,
    codeExample: `# استيراد وحدة كاملة
import math
print(math.pi)        # 3.14159...
print(math.sqrt(16))  # 4.0
print(math.ceil(4.2)) # 5
print(math.floor(4.8)) # 4

# استيراد دوال محددة
from math import sqrt, pow
print(sqrt(25))  # 5.0
print(pow(2, 3)) # 8.0

# استيراد مع اسم مستعار
import datetime as dt
now = dt.datetime.now()
print(now.strftime("%Y-%m-%d %H:%M"))

# random
import random
print(random.randint(1, 10))      # رقم عشوائي 1-10
print(random.choice(["أ", "ب", "ج"]))  # اختيار عشوائي
print(random.random())            # عدد عشري 0-1

names = ["أحمد", "محمد", "علي"]
random.shuffle(names)  # خلط القائمة
print(names)

# os
import os
print(os.getcwd())        # المجلد الحالي
print(os.listdir("."))    # محتويات المجلد
# os.mkdir("new_folder")  # إنشاء مجلد

# إنشاء وحدة خاصة (my_module.py)
'''
# my_module.py
def greet(name):
    return f"مرحباً {name}"

PI = 3.14159
'''

# استخدامها
# from my_module import greet, PI
# print(greet("أحمد"))

# __name__ و __main__
'''
# في my_module.py
def main():
    print("تشغيل مباشر")

if __name__ == "__main__":
    main()
'''

# التحقق من وجود وحدة
try:
    import numpy
    print("numpy موجودة")
except ImportError:
    print("numpy غير مثبتة")`,
    language: 'python',
    xpReward: 100,
    order: 7,
    quiz: {
      question: 'ما الفرق بين import x و from x import y؟',
      options: [
        'لا فرق',
        'الأولى تستورد كل شيء',
        'الثانية تستورد فقط y',
        'الأولى أسرع',
      ],
      correctAnswer: 2,
      explanation: 'from x import y تستورد فقط y من الوحدة x',
    },
  },
  {
    id: 'py-ds-8',
    courseId: 'py-data-structures',
    title: 'Collections المتقدمة',
    description: 'هياكل بيانات متخصصة',
    content: `
# وحدة Collections

هياكل بيانات متخصصة وقوية.

## الأنواع المهمة
- \`Counter\`: عداد للعناصر
- \`defaultdict\`: قاموس بقيمة افتراضية
- \`OrderedDict\`: قاموس مرتب
- \`namedtuple\`: tuple بأسماء
- \`deque\`: قائمة ثنائية الطرف

## متى نستخدمها؟
- \`Counter\`: إحصاء التكرارات
- \`defaultdict\`: تجنب KeyError
- \`deque\`: إضافة/حذف من الطرفين
- \`namedtuple\`: بديل خفيف للـ class
`,
    codeExample: `from collections import Counter, defaultdict, namedtuple, deque

# Counter - عداد
text = "hello world"
letter_count = Counter(text)
print(letter_count)  # Counter({'l': 3, 'o': 2, ...})
print(letter_count.most_common(3))  # أكثر 3 تكراراً

words = ["تفاح", "موز", "تفاح", "برتقال", "موز", "تفاح"]
word_count = Counter(words)
print(word_count["تفاح"])  # 3

# defaultdict - قاموس بقيمة افتراضية
normal_dict = {}
# normal_dict["key"] += 1  # KeyError!

dd = defaultdict(int)  # القيمة الافتراضية 0
dd["key"] += 1
print(dd["key"])  # 1
print(dd["nonexistent"])  # 0

# تجميع حسب فئة
students = [("أحمد", "A"), ("محمد", "B"), ("علي", "A")]
grades = defaultdict(list)
for name, grade in students:
    grades[grade].append(name)
print(dict(grades))  # {'A': ['أحمد', 'علي'], 'B': ['محمد']}

# namedtuple - tuple بأسماء
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p.x, p.y)  # 10 20
print(p[0], p[1])  # يعمل كـ tuple عادي

Person = namedtuple('Person', 'name age city')
person = Person("أحمد", 25, "بغداد")
print(person.name)  # أحمد

# deque - قائمة ثنائية الطرف
d = deque([1, 2, 3])
d.append(4)       # إضافة يمين
d.appendleft(0)   # إضافة يسار
print(d)  # deque([0, 1, 2, 3, 4])

d.pop()           # حذف من اليمين
d.popleft()       # حذف من اليسار
print(d)  # deque([1, 2, 3])

# deque بحجم محدد (للتاريخ مثلاً)
history = deque(maxlen=5)
for i in range(10):
    history.append(i)
print(history)  # deque([5, 6, 7, 8, 9])

# تدوير
d = deque([1, 2, 3, 4, 5])
d.rotate(2)   # تدوير يمين
print(d)  # deque([4, 5, 1, 2, 3])
d.rotate(-2)  # تدوير يسار
print(d)  # deque([1, 2, 3, 4, 5])`,
    language: 'python',
    xpReward: 100,
    order: 8,
    quiz: {
      question: 'ما فائدة defaultdict مقارنة بـ dict العادي؟',
      options: [
        'أسرع',
        'يعطي قيمة افتراضية للمفاتيح الجديدة',
        'يمنع التكرار',
        'مرتب',
      ],
      correctAnswer: 1,
      explanation:
        'defaultdict يُرجع قيمة افتراضية بدلاً من KeyError للمفاتيح غير الموجودة',
    },
  },
];

// ===== دروس Python المتقدمة =====
export const PYTHON_LESSONS_ADVANCED: Lesson[] = [
  {
    id: 'py-adv-1',
    courseId: 'py-oop',
    title: 'مقدمة في OOP',
    description: 'البرمجة الكائنية التوجه',
    content: `
# البرمجة الكائنية (OOP)

نموذج برمجي يعتمد على الكائنات.

## المفاهيم الأساسية

### Class (الصنف)
قالب أو مخطط لإنشاء الكائنات.

### Object (الكائن)
نسخة من الصنف.

### Attributes (الخصائص)
المتغيرات داخل الصنف.

### Methods (الدوال)
الدوال داخل الصنف.

## لماذا OOP؟
- تنظيم أفضل للكود
- إعادة الاستخدام
- نمذجة العالم الحقيقي
- سهولة الصيانة
`,
    codeExample: `# تعريف صنف
class Person:
    # Constructor - يُستدعى عند إنشاء كائن
    def __init__(self, name, age):
        self.name = name  # خاصية
        self.age = age
    
    # Method - دالة
    def greet(self):
        return f"مرحباً، أنا {self.name}"
    
    def have_birthday(self):
        self.age += 1
        return f"عيد ميلاد سعيد! عمري الآن {self.age}"

# إنشاء كائنات
person1 = Person("أحمد", 25)
person2 = Person("محمد", 30)

print(person1.name)     # أحمد
print(person1.greet())  # مرحباً، أنا أحمد
print(person1.have_birthday())

# صنف مع قيم افتراضية
class Car:
    # Class attribute (مشترك بين كل الكائنات)
    wheels = 4
    
    def __init__(self, brand, model, year=2024):
        # Instance attributes
        self.brand = brand
        self.model = model
        self.year = year
        self.speed = 0
    
    def accelerate(self, amount):
        self.speed += amount
        return f"السرعة الآن: {self.speed} كم/س"
    
    def brake(self):
        self.speed = max(0, self.speed - 10)
        return f"السرعة الآن: {self.speed} كم/س"
    
    def __str__(self):
        return f"{self.year} {self.brand} {self.model}"

car = Car("تويوتا", "كامري")
print(car)  # 2024 تويوتا كامري
print(car.accelerate(50))
print(Car.wheels)  # 4`,
    language: 'python',
    xpReward: 120,
    order: 1,
    quiz: {
      question: 'ما الدالة التي تُستدعى تلقائياً عند إنشاء كائن؟',
      options: ['__main__', '__init__', '__start__', '__new__'],
      correctAnswer: 1,
      explanation:
        '__init__ هي الـ constructor وتُستدعى تلقائياً عند إنشاء كائن جديد',
    },
  },
  {
    id: 'py-adv-2',
    courseId: 'py-oop',
    title: 'الوراثة (Inheritance)',
    description: 'إنشاء أصناف من أصناف أخرى',
    content: `
# الوراثة (Inheritance)

إنشاء صنف جديد يرث من صنف موجود.

## المفاهيم
- **Parent/Base Class**: الصنف الأب
- **Child/Derived Class**: الصنف الابن
- **super()**: للوصول للصنف الأب

## أنواع الوراثة
- Single: صنف واحد
- Multiple: من عدة أصناف
- Multilevel: سلسلة وراثة

## فوائد الوراثة
- إعادة استخدام الكود
- التخصيص
- التسلسل الهرمي
`,
    codeExample: `# الصنف الأب
class Animal:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def speak(self):
        return "صوت ما..."
    
    def info(self):
        return f"{self.name}, عمره {self.age} سنة"

# الصنف الابن
class Dog(Animal):
    def __init__(self, name, age, breed):
        super().__init__(name, age)  # استدعاء constructor الأب
        self.breed = breed
    
    # Override - إعادة تعريف
    def speak(self):
        return "هاو هاو! 🐕"
    
    def fetch(self):
        return f"{self.name} يجلب الكرة!"

class Cat(Animal):
    def speak(self):
        return "مياو! 🐱"
    
    def scratch(self):
        return f"{self.name} يخدش!"

# استخدام
dog = Dog("بادي", 3, "جولدن")
cat = Cat("ميمي", 2)

print(dog.speak())   # هاو هاو!
print(cat.speak())   # مياو!
print(dog.info())    # بادي, عمره 3 سنة
print(dog.fetch())

# التحقق من النوع
print(isinstance(dog, Dog))     # True
print(isinstance(dog, Animal))  # True
print(issubclass(Dog, Animal))  # True

# Multiple Inheritance
class Flyable:
    def fly(self):
        return "أطير! ✈️"

class Swimmable:
    def swim(self):
        return "أسبح! 🏊"

class Duck(Animal, Flyable, Swimmable):
    def speak(self):
        return "كواك كواك! 🦆"

duck = Duck("دونالد", 1)
print(duck.speak())
print(duck.fly())
print(duck.swim())`,
    language: 'python',
    xpReward: 120,
    order: 2,
    quiz: {
      question: 'كيف نستدعي دالة من الصنف الأب؟',
      options: ['parent()', 'base()', 'super()', 'this()'],
      correctAnswer: 2,
      explanation: 'super() يُستخدم للوصول لدوال وخصائص الصنف الأب',
    },
  },
  {
    id: 'py-oop-3',
    courseId: 'py-oop',
    title: 'التغليف (Encapsulation)',
    description: 'حماية البيانات وإخفاء التفاصيل',
    content: `
# التغليف (Encapsulation)

إخفاء التفاصيل الداخلية وحماية البيانات.

## مستويات الوصول
- **Public**: عادي (متاح للجميع)
- **Protected**: \`_name\` (اصطلاح، لا يُستخدم خارجياً)
- **Private**: \`__name\` (مخفي حقاً)

## الفوائد
- حماية البيانات من التعديل المباشر
- التحكم في الوصول
- إخفاء التعقيد

## Getters & Setters
- \`@property\`: للقراءة
- \`@name.setter\`: للكتابة
`,
    codeExample: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner           # Public
        self._account_type = "عادي"  # Protected (اصطلاح)
        self.__balance = balance     # Private
    
    # Getter
    @property
    def balance(self):
        return self.__balance
    
    # Setter مع تحقق
    @balance.setter
    def balance(self, value):
        if value < 0:
            raise ValueError("الرصيد لا يمكن أن يكون سالباً!")
        self.__balance = value
    
    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount
            return f"تم إيداع {amount}. الرصيد: {self.__balance}"
        return "مبلغ غير صالح"
    
    def withdraw(self, amount):
        if 0 < amount <= self.__balance:
            self.__balance -= amount
            return f"تم سحب {amount}. الرصيد: {self.__balance}"
        return "رصيد غير كافٍ أو مبلغ غير صالح"

# استخدام
account = BankAccount("أحمد", 1000)

# الوصول للـ public
print(account.owner)  # أحمد

# الوصول عبر property
print(account.balance)  # 1000

# محاولة تعديل private مباشرة - لا تعمل!
# print(account.__balance)  # AttributeError!

# الطريقة الصحيحة
account.deposit(500)
print(account.balance)  # 1500

# Setter مع تحقق
try:
    account.balance = -100  # ValueError!
except ValueError as e:
    print(e)

# مثال آخر: شخص
class Person:
    def __init__(self, name, age):
        self._name = name
        self.__age = age
    
    @property
    def age(self):
        return self.__age
    
    @age.setter
    def age(self, value):
        if 0 < value < 150:
            self.__age = value
        else:
            raise ValueError("عمر غير صالح")
    
    # Property للقراءة فقط
    @property
    def is_adult(self):
        return self.__age >= 18

person = Person("محمد", 25)
print(person.is_adult)  # True
# person.is_adult = False  # Error! قراءة فقط`,
    language: 'python',
    xpReward: 120,
    order: 3,
    quiz: {
      question: 'كيف نجعل خاصية private في Python؟',
      options: ['private name', '_name', '__name', '#name'],
      correctAnswer: 2,
      explanation: '__name (شرطتان سفليتان) تجعل الخاصية private',
    },
  },
  {
    id: 'py-oop-4',
    courseId: 'py-oop',
    title: 'تعدد الأشكال (Polymorphism)',
    description: 'نفس الواجهة، سلوكيات مختلفة',
    content: `
# تعدد الأشكال (Polymorphism)

نفس الاسم، سلوكيات مختلفة حسب النوع.

## الأنواع
1. **Method Overriding**: إعادة تعريف دالة الأب
2. **Duck Typing**: "إذا مشى كالبطة..."
3. **Operator Overloading**: تعديل سلوك العمليات

## الفكرة
\`\`\`python
for animal in animals:
    animal.speak()  # كل حيوان يتكلم بطريقته
\`\`\`

## الفائدة
- كود مرن وقابل للتوسع
- التعامل مع أنواع مختلفة بنفس الطريقة
`,
    codeExample: `# Method Overriding
class Shape:
    def area(self):
        pass
    
    def describe(self):
        return f"مساحتي: {self.area()}"

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    
    def area(self):
        return 3.14159 * self.radius ** 2

# Polymorphism في العمل
shapes = [Rectangle(4, 5), Circle(3), Rectangle(2, 8)]
for shape in shapes:
    print(shape.describe())

# Duck Typing
class Dog:
    def speak(self):
        return "هاو هاو!"

class Cat:
    def speak(self):
        return "مياو!"

class Robot:
    def speak(self):
        return "beep boop"

# لا يهم النوع، المهم أن لديه speak()
def make_speak(thing):
    print(thing.speak())

make_speak(Dog())
make_speak(Cat())
make_speak(Robot())

# Operator Overloading
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    
    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)
    
    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)
    
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    
    def __str__(self):
        return f"Vector({self.x}, {self.y})"
    
    def __repr__(self):
        return self.__str__()

v1 = Vector(2, 3)
v2 = Vector(1, 4)
print(v1 + v2)  # Vector(3, 7)
print(v1 - v2)  # Vector(1, -1)
print(v1 * 3)   # Vector(6, 9)
print(v1 == v2) # False`,
    language: 'python',
    xpReward: 120,
    order: 4,
    quiz: {
      question: 'ما معنى Duck Typing؟',
      options: [
        'البرمجة للبط فقط',
        'إذا تصرف كالنوع المطلوب، يُعامل كذلك',
        'نوع بيانات خاص',
        'طريقة لإنشاء classes',
      ],
      correctAnswer: 1,
      explanation:
        'Duck Typing: إذا مشى كالبطة وصوّت كالبطة، فهو بطة - المهم السلوك لا النوع',
    },
  },
  {
    id: 'py-oop-5',
    courseId: 'py-oop',
    title: 'الدوال السحرية (Magic Methods)',
    description: 'الدوال الخاصة __name__',
    content: `
# Magic Methods (Dunder Methods)

دوال خاصة تبدأ وتنتهي بـ __

## الأهم
| الدالة | الاستخدام |
|--------|-----------|
| \`__init__\` | Constructor |
| \`__str__\` | print() |
| \`__repr__\` | تمثيل للمطورين |
| \`__len__\` | len() |
| \`__getitem__\` | obj[key] |
| \`__setitem__\` | obj[key] = val |
| \`__iter__\` | for loop |
| \`__eq__\` | == |
| \`__lt__\` | < |
| \`__add__\` | + |

## الفائدة
تجعل الـ class يتصرف كالأنواع المدمجة
`,
    codeExample: `class Book:
    def __init__(self, title, author, pages):
        self.title = title
        self.author = author
        self.pages = pages
    
    # للطباعة العادية
    def __str__(self):
        return f"{self.title} - {self.author}"
    
    # للتمثيل التقني
    def __repr__(self):
        return f"Book('{self.title}', '{self.author}', {self.pages})"
    
    # len()
    def __len__(self):
        return self.pages
    
    # المقارنة
    def __eq__(self, other):
        return self.title == other.title and self.author == other.author
    
    def __lt__(self, other):
        return self.pages < other.pages
    
    # الجمع (دمج كتابين)
    def __add__(self, other):
        return Book(
            f"{self.title} & {other.title}",
            f"{self.author}, {other.author}",
            self.pages + other.pages
        )

book1 = Book("Python 101", "أحمد", 200)
book2 = Book("Python 201", "محمد", 300)

print(book1)           # Python 101 - أحمد
print(repr(book1))     # Book('Python 101', 'أحمد', 200)
print(len(book1))      # 200
print(book1 < book2)   # True
print(book1 + book2)   # Python 101 & Python 201

# class يتصرف كـ list
class Playlist:
    def __init__(self, name):
        self.name = name
        self._songs = []
    
    def __len__(self):
        return len(self._songs)
    
    def __getitem__(self, index):
        return self._songs[index]
    
    def __setitem__(self, index, value):
        self._songs[index] = value
    
    def __iter__(self):
        return iter(self._songs)
    
    def __contains__(self, song):
        return song in self._songs
    
    def add(self, song):
        self._songs.append(song)

playlist = Playlist("مفضلتي")
playlist.add("أغنية 1")
playlist.add("أغنية 2")
playlist.add("أغنية 3")

print(len(playlist))      # 3
print(playlist[0])        # أغنية 1
print("أغنية 2" in playlist)  # True

for song in playlist:
    print(song)`,
    language: 'python',
    xpReward: 120,
    order: 5,
    quiz: {
      question: 'أي دالة تُستدعى عند استخدام print()؟',
      options: ['__repr__', '__str__', '__print__', '__show__'],
      correctAnswer: 1,
      explanation: '__str__ تُرجع النص المقروء للمستخدم عند print()',
    },
  },
  {
    id: 'py-oop-6',
    courseId: 'py-oop',
    title: 'Abstract Classes',
    description: 'الأصناف المجردة والواجهات',
    content: `
# Abstract Classes

صنف لا يمكن إنشاء كائن منه مباشرة.

## الغرض
- تعريف واجهة مشتركة
- إجبار الأصناف الفرعية على التنفيذ
- تنظيم الكود

## abc Module
\`\`\`python
from abc import ABC, abstractmethod

class MyAbstract(ABC):
    @abstractmethod
    def must_implement(self):
        pass
\`\`\`

## القواعد
- لا يمكن إنشاء instance من abstract class
- يجب تنفيذ كل الـ abstract methods
`,
    codeExample: `from abc import ABC, abstractmethod

# Abstract Class
class Animal(ABC):
    def __init__(self, name):
        self.name = name
    
    @abstractmethod
    def speak(self):
        """يجب أن ينفذها كل حيوان"""
        pass
    
    @abstractmethod
    def move(self):
        """يجب أن ينفذها كل حيوان"""
        pass
    
    # دالة عادية (غير مجردة)
    def info(self):
        return f"أنا {self.name}"

# لا يمكن إنشاء Animal مباشرة
# animal = Animal("x")  # TypeError!

class Dog(Animal):
    def speak(self):
        return "هاو هاو!"
    
    def move(self):
        return "يمشي على 4 أرجل"

class Bird(Animal):
    def speak(self):
        return "تغريد!"
    
    def move(self):
        return "يطير بجناحيه"

# الآن يمكن الإنشاء
dog = Dog("بادي")
bird = Bird("تويتي")

print(dog.speak())    # هاو هاو!
print(bird.move())    # يطير بجناحيه
print(dog.info())     # أنا بادي

# واجهة للأشكال
class Shape(ABC):
    @abstractmethod
    def area(self):
        pass
    
    @abstractmethod
    def perimeter(self):
        pass
    
    @property
    @abstractmethod
    def name(self):
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self._width = width
        self._height = height
    
    @property
    def name(self):
        return "مستطيل"
    
    def area(self):
        return self._width * self._height
    
    def perimeter(self):
        return 2 * (self._width + self._height)

rect = Rectangle(4, 5)
print(f"{rect.name}: المساحة={rect.area()}, المحيط={rect.perimeter()}")

# التحقق
print(isinstance(rect, Shape))  # True
print(isinstance(rect, Rectangle))  # True`,
    language: 'python',
    xpReward: 120,
    order: 6,
    quiz: {
      question: 'ماذا يحدث لو لم ننفذ abstract method؟',
      options: [
        'يعمل بشكل عادي',
        'TypeError عند إنشاء الكائن',
        'تحذير فقط',
        'لا شيء',
      ],
      correctAnswer: 1,
      explanation:
        'إذا لم تنفذ كل الـ abstract methods، لا يمكن إنشاء كائن من الصنف',
    },
  },
  {
    id: 'py-oop-7',
    courseId: 'py-oop',
    title: 'Class Methods & Static Methods',
    description: 'دوال الصنف والدوال الثابتة',
    content: `
# Class Methods & Static Methods

## أنواع الدوال في Class

### Instance Method (العادية)
- أول parameter: \`self\`
- تعمل على الـ instance

### Class Method
- تزين بـ \`@classmethod\`
- أول parameter: \`cls\`
- تعمل على الـ class نفسه

### Static Method
- تزين بـ \`@staticmethod\`
- لا self ولا cls
- مثل دالة عادية داخل class

## متى نستخدم؟
- \`classmethod\`: Factory methods، تعديل class attributes
- \`staticmethod\`: utility functions مرتبطة بالـ class
`,
    codeExample: `class Pizza:
    # Class attribute
    total_pizzas = 0
    
    def __init__(self, size, toppings):
        self.size = size
        self.toppings = toppings
        Pizza.total_pizzas += 1
    
    # Instance method
    def describe(self):
        return f"بيتزا {self.size} مع {', '.join(self.toppings)}"
    
    # Class method - Factory
    @classmethod
    def margherita(cls, size):
        """إنشاء مارغريتا جاهزة"""
        return cls(size, ["جبن", "طماطم", "ريحان"])
    
    @classmethod
    def pepperoni(cls, size):
        """إنشاء بيبروني جاهزة"""
        return cls(size, ["جبن", "بيبروني"])
    
    @classmethod
    def get_total(cls):
        """عدد البيتزا المصنوعة"""
        return cls.total_pizzas
    
    # Static method - Utility
    @staticmethod
    def is_valid_size(size):
        """تحقق من صحة الحجم"""
        return size in ["صغير", "وسط", "كبير"]
    
    @staticmethod
    def calculate_price(size, num_toppings):
        """حساب السعر"""
        base = {"صغير": 5, "وسط": 8, "كبير": 12}
        return base.get(size, 0) + num_toppings * 1.5

# استخدام Instance method
p1 = Pizza("كبير", ["جبن", "فطر", "زيتون"])
print(p1.describe())

# استخدام Class method - Factory
p2 = Pizza.margherita("وسط")
p3 = Pizza.pepperoni("صغير")
print(p2.describe())  # بيتزا وسط مع جبن, طماطم, ريحان

# عدد البيتزا
print(f"عدد البيتزا: {Pizza.get_total()}")  # 3

# استخدام Static method
print(Pizza.is_valid_size("كبير"))  # True
print(Pizza.is_valid_size("ضخم"))   # False
print(Pizza.calculate_price("وسط", 3))  # 12.5

# مثال: Date class
class Date:
    def __init__(self, day, month, year):
        self.day = day
        self.month = month
        self.year = year
    
    @classmethod
    def from_string(cls, date_string):
        """إنشاء من نص: '25-12-2024'"""
        day, month, year = map(int, date_string.split('-'))
        return cls(day, month, year)
    
    @classmethod
    def today(cls):
        """تاريخ اليوم"""
        from datetime import date
        t = date.today()
        return cls(t.day, t.month, t.year)
    
    @staticmethod
    def is_leap_year(year):
        return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

d1 = Date.from_string("25-12-2024")
d2 = Date.today()
print(Date.is_leap_year(2024))  # True`,
    language: 'python',
    xpReward: 120,
    order: 7,
    quiz: {
      question: 'ما الفرق بين @classmethod و @staticmethod؟',
      options: [
        'لا فرق',
        'classmethod تأخذ cls، staticmethod لا تأخذ شيئاً',
        'staticmethod أسرع',
        'classmethod للقراءة فقط',
      ],
      correctAnswer: 1,
      explanation:
        '@classmethod تأخذ cls للوصول للـ class، @staticmethod مستقلة تماماً',
    },
  },
  {
    id: 'py-oop-8',
    courseId: 'py-oop',
    title: 'Dataclasses',
    description: 'طريقة سهلة لإنشاء classes للبيانات',
    content: `
# Dataclasses (Python 3.7+)

طريقة مختصرة لإنشاء classes تخزن بيانات.

## الفوائد
- كود أقل
- \`__init__\` تلقائي
- \`__repr__\` تلقائي
- \`__eq__\` تلقائي
- دعم للترتيب والثبات

## الاستخدام
\`\`\`python
from dataclasses import dataclass

@dataclass
class MyClass:
    field1: type
    field2: type = default
\`\`\`
`,
    codeExample: `from dataclasses import dataclass, field
from typing import List

# بدون dataclass (الطريقة القديمة)
class PersonOld:
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email
    
    def __repr__(self):
        return f"Person(name='{self.name}', age={self.age})"
    
    def __eq__(self, other):
        return (self.name == other.name and 
                self.age == other.age and 
                self.email == other.email)

# مع dataclass (الطريقة الجديدة)
@dataclass
class Person:
    name: str
    age: int
    email: str = "غير محدد"  # قيمة افتراضية

# الاستخدام
p1 = Person("أحمد", 25)
p2 = Person("أحمد", 25)
print(p1)           # Person(name='أحمد', age=25, email='غير محدد')
print(p1 == p2)     # True

# مع قائمة (استخدم field)
@dataclass
class Student:
    name: str
    grade: int
    subjects: List[str] = field(default_factory=list)
    
    def add_subject(self, subject):
        self.subjects.append(subject)

student = Student("محمد", 10)
student.add_subject("رياضيات")
student.add_subject("علوم")
print(student)

# Frozen (غير قابل للتغيير)
@dataclass(frozen=True)
class Point:
    x: float
    y: float

p = Point(3.0, 4.0)
# p.x = 5  # FrozenInstanceError!

# مع الترتيب
@dataclass(order=True)
class Product:
    name: str = field(compare=False)  # لا يُستخدم في المقارنة
    price: float

products = [
    Product("قلم", 2.5),
    Product("دفتر", 5.0),
    Product("ممحاة", 1.0)
]
products.sort()
for p in products:
    print(p)

# Post-init للمعالجة بعد الإنشاء
@dataclass
class Rectangle:
    width: float
    height: float
    area: float = field(init=False)  # لا يُمرر في __init__
    
    def __post_init__(self):
        self.area = self.width * self.height

rect = Rectangle(4, 5)
print(rect.area)  # 20.0`,
    language: 'python',
    xpReward: 120,
    order: 8,
    quiz: {
      question: 'ما الذي يوفره @dataclass تلقائياً؟',
      options: [
        '__init__ فقط',
        '__init__ و __repr__',
        '__init__ و __repr__ و __eq__',
        'لا شيء تلقائي',
      ],
      correctAnswer: 2,
      explanation: '@dataclass يولد __init__ و __repr__ و __eq__ تلقائياً',
    },
  },
  {
    id: 'py-oop-9',
    courseId: 'py-oop',
    title: 'Abstract Classes',
    description: 'الأصناف المجردة والواجهات',
    content: `
# الأصناف المجردة (Abstract Classes)

صنف لا يمكن إنشاء كائنات منه مباشرة، يُستخدم كقالب.

## ABC Module
\`\`\`python
from abc import ABC, abstractmethod
\`\`\`

## لماذا نستخدمها؟
- فرض تطبيق methods معينة
- تحديد واجهة مشتركة
- منع إنشاء الصنف الأب مباشرة

## القواعد
- الصنف المجرد يرث من ABC
- الـ abstract methods يجب تطبيقها في الأبناء
`,
    codeExample: `from abc import ABC, abstractmethod
from typing import List

# صنف مجرد
class Shape(ABC):
    def __init__(self, color: str):
        self.color = color
    
    @abstractmethod
    def area(self) -> float:
        """حساب المساحة - يجب تطبيقه"""
        pass
    
    @abstractmethod
    def perimeter(self) -> float:
        """حساب المحيط - يجب تطبيقه"""
        pass
    
    # method عادي (غير مجرد)
    def describe(self) -> str:
        return f"شكل {self.color}"

# لا يمكن إنشاء Shape مباشرة
# shape = Shape("أحمر")  # TypeError!

# صنف ابن يطبق الـ abstract methods
class Rectangle(Shape):
    def __init__(self, color: str, width: float, height: float):
        super().__init__(color)
        self.width = width
        self.height = height
    
    def area(self) -> float:
        return self.width * self.height
    
    def perimeter(self) -> float:
        return 2 * (self.width + self.height)

class Circle(Shape):
    def __init__(self, color: str, radius: float):
        super().__init__(color)
        self.radius = radius
    
    def area(self) -> float:
        import math
        return math.pi * self.radius ** 2
    
    def perimeter(self) -> float:
        import math
        return 2 * math.pi * self.radius

# استخدام
rect = Rectangle("أزرق", 4, 5)
circle = Circle("أحمر", 3)

print(f"المستطيل: {rect.area()}")  # 20
print(f"الدائرة: {circle.area():.2f}")  # 28.27

# Polymorphism مع Abstract Classes
shapes: List[Shape] = [rect, circle]
for shape in shapes:
    print(f"{shape.describe()}: مساحة = {shape.area():.2f}")

# Abstract Property
class Database(ABC):
    @property
    @abstractmethod
    def connection_string(self) -> str:
        pass
    
    @abstractmethod
    def connect(self) -> bool:
        pass

class MySQL(Database):
    @property
    def connection_string(self) -> str:
        return "mysql://localhost:3306"
    
    def connect(self) -> bool:
        print(f"الاتصال بـ {self.connection_string}")
        return True

db = MySQL()
db.connect()`,
    language: 'python',
    xpReward: 130,
    order: 9,
    quiz: {
      question: 'ماذا يحدث إذا لم نطبق abstract method في الصنف الابن؟',
      options: [
        'لا شيء',
        'تحذير فقط',
        'TypeError عند إنشاء كائن',
        'يستخدم القيمة الافتراضية',
      ],
      correctAnswer: 2,
      explanation:
        'Python يرفع TypeError إذا حاولت إنشاء كائن من صنف لم يطبق كل الـ abstract methods',
    },
  },
  {
    id: 'py-oop-10',
    courseId: 'py-oop',
    title: 'Design Patterns الأساسية',
    description: 'أنماط التصميم الشائعة في OOP',
    content: `
# أنماط التصميم (Design Patterns)

حلول مجربة لمشاكل برمجية شائعة.

## أهم الأنماط

### 1. Singleton
كائن واحد فقط من الصنف.

### 2. Factory
إنشاء كائنات بدون تحديد الصنف.

### 3. Observer
الإشعار عند تغيير الحالة.

### 4. Strategy
تغيير السلوك ديناميكياً.

## لماذا نستخدمها؟
- حلول مجربة
- كود قابل للصيانة
- تواصل أفضل بين المبرمجين
`,
    codeExample: `# 1. Singleton Pattern
class DatabaseConnection:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.connected = False
        return cls._instance
    
    def connect(self):
        if not self.connected:
            print("جاري الاتصال...")
            self.connected = True
        return self

# نفس الكائن دائماً
db1 = DatabaseConnection()
db2 = DatabaseConnection()
print(db1 is db2)  # True

# 2. Factory Pattern
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def speak(self): pass

class Dog(Animal):
    def speak(self): return "هاو هاو!"

class Cat(Animal):
    def speak(self): return "مياو!"

class Bird(Animal):
    def speak(self): return "تغريد!"

class AnimalFactory:
    @staticmethod
    def create(animal_type: str) -> Animal:
        animals = {
            "dog": Dog,
            "cat": Cat,
            "bird": Bird
        }
        if animal_type.lower() in animals:
            return animals[animal_type.lower()]()
        raise ValueError(f"نوع غير معروف: {animal_type}")

# استخدام Factory
animal = AnimalFactory.create("dog")
print(animal.speak())  # هاو هاو!

# 3. Observer Pattern
class Subject:
    def __init__(self):
        self._observers = []
        self._state = None
    
    def attach(self, observer):
        self._observers.append(observer)
    
    def detach(self, observer):
        self._observers.remove(observer)
    
    def notify(self):
        for observer in self._observers:
            observer.update(self._state)
    
    def set_state(self, state):
        self._state = state
        self.notify()

class Observer:
    def __init__(self, name):
        self.name = name
    
    def update(self, state):
        print(f"{self.name} استلم: {state}")

# استخدام Observer
subject = Subject()
obs1 = Observer("المراقب 1")
obs2 = Observer("المراقب 2")

subject.attach(obs1)
subject.attach(obs2)
subject.set_state("حالة جديدة!")

# 4. Strategy Pattern
class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amount): pass

class CreditCard(PaymentStrategy):
    def pay(self, amount):
        return f"دفع {amount} بالبطاقة"

class PayPal(PaymentStrategy):
    def pay(self, amount):
        return f"دفع {amount} بـ PayPal"

class Cash(PaymentStrategy):
    def pay(self, amount):
        return f"دفع {amount} نقداً"

class ShoppingCart:
    def __init__(self, strategy: PaymentStrategy):
        self.strategy = strategy
    
    def checkout(self, amount):
        return self.strategy.pay(amount)

# تغيير الاستراتيجية
cart = ShoppingCart(CreditCard())
print(cart.checkout(100))

cart.strategy = PayPal()
print(cart.checkout(100))`,
    language: 'python',
    xpReward: 150,
    order: 10,
    quiz: {
      question: 'ما فائدة Singleton Pattern؟',
      options: [
        'إنشاء عدة كائنات',
        'ضمان وجود كائن واحد فقط',
        'إخفاء التنفيذ',
        'تسريع الأداء',
      ],
      correctAnswer: 1,
      explanation: 'Singleton يضمن وجود نسخة واحدة فقط من الصنف في كل التطبيق',
    },
  },
  {
    id: 'py-adv-3',
    courseId: 'py-advanced',
    title: 'Decorators',
    description: 'تعديل سلوك الدوال',
    content: `
# Decorators

دالة تعدل سلوك دالة أخرى.

## الفكرة
Decorator = wrapper function
تأخذ دالة وترجع دالة معدلة.

## الصيغة
\`\`\`python
@decorator
def function():
    pass
\`\`\`

## الاستخدامات
- Logging
- Timing
- Authentication
- Caching

## Decorators مدمجة
- @property
- @classmethod
- @staticmethod
`,
    codeExample: `# Decorator بسيط
def my_decorator(func):
    def wrapper():
        print("قبل الدالة")
        func()
        print("بعد الدالة")
    return wrapper

@my_decorator
def say_hello():
    print("مرحباً!")

say_hello()
# قبل الدالة
# مرحباً!
# بعد الدالة

# Decorator مع معاملات
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"مرحباً {name}!")

greet("أحمد")

# Timer Decorator
import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} استغرق {end - start:.4f} ثانية")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "انتهى!"

print(slow_function())

# @property - جعل method تبدو كـ attribute
class Circle:
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        return self._radius
    
    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("لا يمكن أن يكون نصف القطر سالباً")
        self._radius = value
    
    @property
    def area(self):
        return 3.14159 * self._radius ** 2

circle = Circle(5)
print(circle.radius)  # 5
print(circle.area)    # 78.53975
circle.radius = 10
print(circle.area)    # 314.159`,
    language: 'python',
    xpReward: 150,
    order: 1,
    quiz: {
      question: 'ما الذي يفعله Decorator؟',
      options: [
        'يحذف الدالة',
        'يعدل سلوك الدالة',
        'ينشئ متغير جديد',
        'يوقف البرنامج',
      ],
      correctAnswer: 1,
      explanation: 'Decorator يعدل أو يضيف سلوك جديد لدالة موجودة',
    },
  },
  {
    id: 'py-adv-4',
    courseId: 'py-advanced',
    title: 'Generators',
    description: 'توليد القيم عند الطلب',
    content: `
# Generators

دوال ترجع قيم واحدة تلو الأخرى.

## الفرق عن الدوال العادية
- تستخدم \`yield\` بدلاً من \`return\`
- لا تحفظ كل القيم في الذاكرة
- تتوقف وتستمر من حيث توقفت

## لماذا Generators؟
- توفير الذاكرة
- التعامل مع بيانات كبيرة
- البيانات اللانهائية

## Generator Expression
\`\`\`python
(x for x in range(10))
\`\`\`
`,
    codeExample: `# Generator بسيط
def count_up_to(n):
    i = 1
    while i <= n:
        yield i
        i += 1

# استخدام
for num in count_up_to(5):
    print(num)  # 1, 2, 3, 4, 5

# أو
counter = count_up_to(5)
print(next(counter))  # 1
print(next(counter))  # 2

# فيبوناتشي لانهائي
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
for _ in range(10):
    print(next(fib), end=" ")
# 0 1 1 2 3 5 8 13 21 34

# Generator Expression
squares = (x**2 for x in range(1, 6))
print(list(squares))  # [1, 4, 9, 16, 25]

# مقارنة الذاكرة
import sys

list_comp = [x**2 for x in range(10000)]
gen_exp = (x**2 for x in range(10000))

print(f"List: {sys.getsizeof(list_comp)} bytes")  # ~87000
print(f"Generator: {sys.getsizeof(gen_exp)} bytes")  # ~200

# قراءة ملف كبير
def read_large_file(file_path):
    with open(file_path, 'r') as file:
        for line in file:
            yield line.strip()

# Pipeline مع generators
def read_numbers(filename):
    for line in read_large_file(filename):
        yield int(line)

def filter_even(numbers):
    for num in numbers:
        if num % 2 == 0:
            yield num

def square(numbers):
    for num in numbers:
        yield num ** 2

# استخدام
# result = square(filter_even(read_numbers("numbers.txt")))`,
    language: 'python',
    xpReward: 150,
    order: 2,
    quiz: {
      question: 'ما الكلمة المفتاحية المستخدمة في Generator؟',
      options: ['return', 'yield', 'generate', 'next'],
      correctAnswer: 1,
      explanation:
        'yield ترجع قيمة وتوقف الدالة مؤقتاً، وتستمر من حيث توقفت عند الاستدعاء التالي',
    },
  },
  {
    id: 'py-adv-5',
    courseId: 'py-advanced',
    title: 'Context Managers',
    description: 'إدارة الموارد تلقائياً',
    content: `
# Context Managers

إدارة الموارد (فتح/إغلاق) تلقائياً.

## with Statement
\`\`\`python
with open("file.txt") as f:
    content = f.read()
# الملف يُغلق تلقائياً
\`\`\`

## إنشاء Context Manager
1. **Class-based**: \`__enter__\` و \`__exit__\`
2. **Generator-based**: \`@contextmanager\`

## الفوائد
- إغلاق تلقائي للموارد
- التعامل مع الأخطاء
- كود أنظف
`,
    codeExample: `# استخدام with المدمج
with open("test.txt", "w") as f:
    f.write("مرحباً!")
# الملف مغلق تلقائياً هنا

# إنشاء Context Manager بالـ class
class Timer:
    def __enter__(self):
        import time
        self.start = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        self.end = time.time()
        print(f"الوقت: {self.end - self.start:.4f} ثانية")
        return False  # لا نبتلع الأخطاء

with Timer():
    # كود نريد قياس وقته
    sum(range(1000000))

# Context Manager مع معالجة الأخطاء
class DatabaseConnection:
    def __init__(self, host):
        self.host = host
        self.connection = None
    
    def __enter__(self):
        print(f"الاتصال بـ {self.host}...")
        self.connection = {"connected": True}
        return self.connection
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("إغلاق الاتصال...")
        self.connection = None
        if exc_type is not None:
            print(f"حدث خطأ: {exc_val}")
        return False

with DatabaseConnection("localhost") as db:
    print("استعلام قاعدة البيانات...")

# باستخدام contextmanager decorator
from contextlib import contextmanager

@contextmanager
def temp_directory():
    import tempfile
    import shutil
    import os
    
    dirpath = tempfile.mkdtemp()
    print(f"إنشاء مجلد مؤقت: {dirpath}")
    try:
        yield dirpath
    finally:
        shutil.rmtree(dirpath)
        print("حذف المجلد المؤقت")

with temp_directory() as tmpdir:
    print(f"العمل في: {tmpdir}")

# Context Managers متعددة
with open("in.txt") as fin, open("out.txt", "w") as fout:
    fout.write(fin.read().upper())

# suppress لتجاهل أخطاء محددة
from contextlib import suppress

with suppress(FileNotFoundError):
    with open("nonexistent.txt") as f:
        print(f.read())
# لا خطأ حتى لو الملف غير موجود`,
    language: 'python',
    xpReward: 150,
    order: 3,
    quiz: {
      question: 'أي دالة تُستدعى عند الخروج من with؟',
      options: ['__enter__', '__exit__', '__close__', '__end__'],
      correctAnswer: 1,
      explanation: '__exit__ تُستدعى عند الخروج من كتلة with (حتى لو حدث خطأ)',
    },
  },
  {
    id: 'py-adv-6',
    courseId: 'py-advanced',
    title: 'Iterators',
    description: 'فهم آلية التكرار',
    content: `
# Iterators

كائن يمكن المرور عليه عنصراً عنصراً.

## البروتوكول
- \`__iter__\`: ترجع الـ iterator نفسه
- \`__next__\`: ترجع العنصر التالي

## الفرق
- **Iterable**: يمكن تحويله لـ iterator
- **Iterator**: له \`__next__\`

## كل Iterator هو Iterable
لكن ليس كل Iterable هو Iterator!
- List: Iterable (ليس Iterator)
- iter(List): Iterator
`,
    codeExample: `# فهم الـ iteration
my_list = [1, 2, 3]
my_iter = iter(my_list)  # تحويل لـ iterator

print(next(my_iter))  # 1
print(next(my_iter))  # 2
print(next(my_iter))  # 3
# print(next(my_iter))  # StopIteration!

# إنشاء Iterator خاص
class CountDown:
    def __init__(self, start):
        self.current = start
    
    def __iter__(self):
        return self
    
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1

for num in CountDown(5):
    print(num)  # 5, 4, 3, 2, 1

# Iterator لانهائي
class InfiniteCounter:
    def __init__(self, start=0, step=1):
        self.current = start
        self.step = step
    
    def __iter__(self):
        return self
    
    def __next__(self):
        value = self.current
        self.current += self.step
        return value

counter = InfiniteCounter(start=10, step=5)
for _ in range(5):
    print(next(counter))  # 10, 15, 20, 25, 30

# Iterator على class مخصص
class Sentence:
    def __init__(self, text):
        self.words = text.split()
    
    def __iter__(self):
        return SentenceIterator(self.words)

class SentenceIterator:
    def __init__(self, words):
        self.words = words
        self.index = 0
    
    def __iter__(self):
        return self
    
    def __next__(self):
        if self.index >= len(self.words):
            raise StopIteration
        word = self.words[self.index]
        self.index += 1
        return word

sentence = Sentence("مرحباً بك في Python")
for word in sentence:
    print(word)

# أدوات itertools
from itertools import count, cycle, repeat, chain, islice

# count: عداد لانهائي
for i in islice(count(10), 5):
    print(i)  # 10, 11, 12, 13, 14

# cycle: تكرار لانهائي
colors = cycle(['أحمر', 'أخضر', 'أزرق'])
for _ in range(5):
    print(next(colors))

# chain: دمج iterables
for x in chain([1, 2], [3, 4], [5]):
    print(x)  # 1, 2, 3, 4, 5`,
    language: 'python',
    xpReward: 150,
    order: 4,
    quiz: {
      question: 'ما الاستثناء الذي يُرفع عند انتهاء Iterator؟',
      options: [
        'EndIteration',
        'StopIteration',
        'IterationError',
        'NoMoreItems',
      ],
      correctAnswer: 1,
      explanation: 'StopIteration يُرفع عندما لا توجد عناصر أخرى للإرجاع',
    },
  },
  {
    id: 'py-adv-7',
    courseId: 'py-advanced',
    title: 'Lambda و Higher-Order Functions',
    description: 'الدوال المجهولة والدوال العليا',
    content: `
# Lambda & Higher-Order Functions

## Lambda
دالة مجهولة في سطر واحد.
\`\`\`python
lambda args: expression
\`\`\`

## Higher-Order Functions
دوال تأخذ أو ترجع دوال أخرى.

## الدوال المدمجة المهمة
- \`map(func, iterable)\`: تطبيق دالة على كل عنصر
- \`filter(func, iterable)\`: تصفية العناصر
- \`reduce(func, iterable)\`: تجميع لقيمة واحدة
- \`sorted(iterable, key=func)\`: ترتيب بمعيار
`,
    codeExample: `# Lambda بسيطة
square = lambda x: x ** 2
print(square(5))  # 25

add = lambda x, y: x + y
print(add(3, 4))  # 7

# map - تطبيق دالة على كل عنصر
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
print(squared)  # [1, 4, 9, 16, 25]

# مع دالة عادية
def double(x):
    return x * 2

doubled = list(map(double, numbers))
print(doubled)  # [2, 4, 6, 8, 10]

# filter - تصفية العناصر
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4]

# تصفية الأسماء الطويلة
names = ["أحمد", "محمد علي", "سارة", "عبدالرحمن"]
long_names = list(filter(lambda n: len(n) > 4, names))
print(long_names)

# reduce - تجميع
from functools import reduce

total = reduce(lambda x, y: x + y, numbers)
print(total)  # 15

# إيجاد الأكبر
maximum = reduce(lambda x, y: x if x > y else y, numbers)
print(maximum)  # 5

# sorted مع key
students = [
    {"name": "أحمد", "score": 85},
    {"name": "محمد", "score": 92},
    {"name": "علي", "score": 78}
]

# ترتيب حسب الدرجة
by_score = sorted(students, key=lambda s: s["score"], reverse=True)
for s in by_score:
    print(f"{s['name']}: {s['score']}")

# ترتيب نصوص حسب الطول
words = ["programming", "is", "fun", "and", "challenging"]
by_length = sorted(words, key=len)
print(by_length)

# دمج map و filter
result = list(map(
    lambda x: x ** 2,
    filter(lambda x: x % 2 == 0, range(10))
))
print(result)  # [0, 4, 16, 36, 64]

# دالة ترجع دالة
def multiplier(n):
    return lambda x: x * n

double = multiplier(2)
triple = multiplier(3)

print(double(5))  # 10
print(triple(5))  # 15`,
    language: 'python',
    xpReward: 150,
    order: 5,
    quiz: {
      question: 'ماذا يفعل filter()؟',
      options: [
        'يغير العناصر',
        'يحذف كل العناصر',
        'يُبقي العناصر التي تحقق الشرط',
        'يرتب العناصر',
      ],
      correctAnswer: 2,
      explanation: 'filter() يُرجع فقط العناصر التي تُرجع الدالة لها True',
    },
  },
  {
    id: 'py-adv-8',
    courseId: 'py-advanced',
    title: 'Regular Expressions',
    description: 'التعبيرات النمطية للبحث في النصوص',
    content: `
# Regular Expressions (Regex)

نمط للبحث في النصوص.

## وحدة re
\`\`\`python
import re
\`\`\`

## الدوال الأساسية
- \`re.search()\`: أول تطابق
- \`re.match()\`: تطابق من البداية
- \`re.findall()\`: كل التطابقات
- \`re.sub()\`: استبدال

## الرموز الأساسية
| الرمز | المعنى |
|-------|--------|
| \`.\` | أي حرف |
| \`\\d\` | رقم |
| \`\\w\` | حرف أو رقم |
| \`\\s\` | مسافة |
| \`*\` | 0 أو أكثر |
| \`+\` | 1 أو أكثر |
| \`?\` | 0 أو 1 |
| \`[abc]\` | أي من a,b,c |
| \`^\` | بداية |
| \`$\` | نهاية |
`,
    codeExample: `import re

text = "بريدي هو test@email.com ورقمي 0501234567"

# search - أول تطابق
match = re.search(r'\\d+', text)
if match:
    print(match.group())  # 0501234567

# findall - كل التطابقات
numbers = re.findall(r'\\d+', text)
print(numbers)  # ['0501234567']

# match - من البداية فقط
if re.match(r'بريدي', text):
    print("يبدأ بـ 'بريدي'")

# استخراج البريد الإلكتروني
email_pattern = r'[\\w.-]+@[\\w.-]+\\.\\w+'
emails = re.findall(email_pattern, text)
print(emails)  # ['test@email.com']

# استخراج أرقام الهاتف
phone_pattern = r'05\\d{8}'
phones = re.findall(phone_pattern, text)
print(phones)  # ['0501234567']

# الاستبدال
censored = re.sub(r'\\d', '*', text)
print(censored)  # بريدي هو test@email.com ورقمي **********

# Groups - مجموعات
date = "2024-12-25"
pattern = r'(\\d{4})-(\\d{2})-(\\d{2})'
match = re.search(pattern, date)
if match:
    year, month, day = match.groups()
    print(f"السنة: {year}, الشهر: {month}, اليوم: {day}")

# Named groups
pattern = r'(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})'
match = re.search(pattern, date)
if match:
    print(match.group('year'))   # 2024
    print(match.group('month'))  # 12

# التحقق من الصحة
def is_valid_email(email):
    pattern = r'^[\\w.-]+@[\\w.-]+\\.\\w+$'
    return bool(re.match(pattern, email))

print(is_valid_email("test@example.com"))  # True
print(is_valid_email("invalid-email"))     # False

# تقسيم النص
text = "one, two; three four"
parts = re.split(r'[,;\\s]+', text)
print(parts)  # ['one', 'two', 'three', 'four']

# Compile لإعادة الاستخدام
email_regex = re.compile(r'[\\w.-]+@[\\w.-]+\\.\\w+')
emails = email_regex.findall("a@b.com and c@d.org")
print(emails)`,
    language: 'python',
    xpReward: 150,
    order: 6,
    quiz: {
      question: 'ماذا يعني \\d في regex؟',
      options: ['أي حرف', 'أي رقم', 'أي مسافة', 'نهاية السطر'],
      correctAnswer: 1,
      explanation: '\\d يطابق أي رقم (0-9)',
    },
  },
  {
    id: 'py-adv-9',
    courseId: 'py-advanced',
    title: 'Async/Await',
    description: 'البرمجة غير المتزامنة',
    content: `
# Async Programming

تنفيذ عمليات متعددة دون انتظار.

## المفاهيم
- **Coroutine**: دالة async
- **await**: انتظار نتيجة
- **asyncio**: المكتبة الأساسية

## متى نستخدم؟
- عمليات I/O (شبكة، ملفات)
- انتظار استجابات
- عمليات متعددة متزامنة

## الصيغة
\`\`\`python
async def my_func():
    result = await some_async_operation()
    return result
\`\`\`
`,
    codeExample: `import asyncio

# Coroutine بسيطة
async def say_hello():
    print("مرحباً!")
    await asyncio.sleep(1)  # انتظار غير متزامن
    print("وداعاً!")

# تشغيل
asyncio.run(say_hello())

# عمليات متوازية
async def fetch_data(name, delay):
    print(f"بدء جلب {name}...")
    await asyncio.sleep(delay)
    print(f"انتهى جلب {name}")
    return f"بيانات {name}"

async def main():
    # تنفيذ متتالي (بطيء)
    # result1 = await fetch_data("A", 2)
    # result2 = await fetch_data("B", 1)
    
    # تنفيذ متوازي (سريع)
    results = await asyncio.gather(
        fetch_data("A", 2),
        fetch_data("B", 1),
        fetch_data("C", 3)
    )
    print(results)

asyncio.run(main())

# مع timeout
async def slow_operation():
    await asyncio.sleep(10)
    return "انتهى"

async def with_timeout():
    try:
        result = await asyncio.wait_for(
            slow_operation(),
            timeout=2.0
        )
    except asyncio.TimeoutError:
        print("انتهى الوقت!")

asyncio.run(with_timeout())

# Tasks للتحكم أكثر
async def background_task():
    while True:
        print("عمل في الخلفية...")
        await asyncio.sleep(1)

async def main_with_task():
    task = asyncio.create_task(background_task())
    
    await asyncio.sleep(3)
    task.cancel()  # إلغاء المهمة
    
    try:
        await task
    except asyncio.CancelledError:
        print("تم إلغاء المهمة")

asyncio.run(main_with_task())

# Async Context Manager
class AsyncResource:
    async def __aenter__(self):
        print("فتح المورد")
        await asyncio.sleep(0.5)
        return self
    
    async def __aexit__(self, *args):
        print("إغلاق المورد")
        await asyncio.sleep(0.5)
    
    async def do_something(self):
        print("استخدام المورد")

async def use_resource():
    async with AsyncResource() as resource:
        await resource.do_something()

asyncio.run(use_resource())`,
    language: 'python',
    xpReward: 150,
    order: 7,
    quiz: {
      question: 'ما فائدة asyncio.gather()؟',
      options: [
        'تجميع البيانات',
        'تشغيل عدة coroutines بشكل متوازي',
        'إلغاء المهام',
        'إنشاء coroutine',
      ],
      correctAnswer: 1,
      explanation:
        'gather() يشغل عدة coroutines بشكل متوازي وينتظر انتهاءها جميعاً',
    },
  },
  {
    id: 'py-adv-10',
    courseId: 'py-advanced',
    title: 'Type Hints',
    description: 'التلميحات النوعية لكود أوضح',
    content: `
# Type Hints (Python 3.5+)

تحديد أنواع البيانات المتوقعة.

## الفوائد
- كود أوضح وموثق
- اكتشاف الأخطاء مبكراً
- دعم أفضل من IDE
- أدوات مثل mypy

## الصيغة
\`\`\`python
def func(param: Type) -> ReturnType:
    pass
\`\`\`

## الأنواع الشائعة
- الأساسية: int, str, float, bool
- Collections: List, Dict, Set, Tuple
- Optional: قد تكون None
- Union: أحد عدة أنواع
`,
    codeExample: `from typing import List, Dict, Optional, Union, Tuple, Callable

# أنواع أساسية
def greet(name: str) -> str:
    return f"مرحباً {name}"

def add(a: int, b: int) -> int:
    return a + b

# القوائم والقواميس
def process_numbers(numbers: List[int]) -> int:
    return sum(numbers)

def get_scores() -> Dict[str, int]:
    return {"أحمد": 95, "محمد": 88}

# Optional - قد تكون None
def find_user(user_id: int) -> Optional[str]:
    users = {1: "أحمد", 2: "محمد"}
    return users.get(user_id)

result = find_user(3)  # قد تكون None

# Union - أحد عدة أنواع
def process(data: Union[str, int]) -> str:
    return str(data)

# Python 3.10+: استخدم |
def process_new(data: str | int) -> str:
    return str(data)

# Tuple بأنواع محددة
def get_point() -> Tuple[int, int]:
    return (10, 20)

# Callable - دالة كمعامل
def apply_func(
    func: Callable[[int], int],
    value: int
) -> int:
    return func(value)

result = apply_func(lambda x: x * 2, 5)  # 10

# Type aliases
UserId = int
UserName = str
UserDict = Dict[UserId, UserName]

def get_users() -> UserDict:
    return {1: "أحمد", 2: "محمد"}

# Class مع type hints
class Person:
    def __init__(self, name: str, age: int) -> None:
        self.name = name
        self.age = age
    
    def greet(self) -> str:
        return f"أنا {self.name}"

# Generic types
from typing import TypeVar, Generic

T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: List[T] = []
    
    def push(self, item: T) -> None:
        self._items.append(item)
    
    def pop(self) -> T:
        return self._items.pop()

int_stack: Stack[int] = Stack()
int_stack.push(1)
int_stack.push(2)

# Literal types
from typing import Literal

def set_status(status: Literal["active", "inactive"]) -> None:
    print(f"الحالة: {status}")

set_status("active")  # OK
# set_status("unknown")  # Type checker error`,
    language: 'python',
    xpReward: 150,
    order: 8,
    quiz: {
      question: 'ماذا يعني Optional[str]؟',
      options: ['نص اختياري كمعامل', 'str أو None', 'قائمة نصوص', 'نص فارغ'],
      correctAnswer: 1,
      explanation: 'Optional[str] يعني أن القيمة قد تكون str أو None',
    },
  },
  {
    id: 'py-adv-11',
    courseId: 'py-advanced',
    title: 'Testing في Python',
    description: 'اختبار الكود باستخدام pytest و unittest',
    content: `
# Testing في Python

اختبار الكود لضمان صحته.

## لماذا الاختبار؟
- اكتشاف الأخطاء مبكراً
- توثيق السلوك المتوقع
- الثقة في التعديلات
- Refactoring آمن

## أنواع الاختبارات
1. **Unit Tests**: اختبار دوال منفردة
2. **Integration Tests**: اختبار التكامل
3. **E2E Tests**: اختبار من البداية للنهاية

## الأدوات
- unittest (مدمج)
- pytest (الأشهر)
- coverage (تغطية الكود)
`,
    codeExample: `# ===== unittest =====
import unittest

def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("لا يمكن القسمة على صفر")
    return a / b

class TestMath(unittest.TestCase):
    def test_add_positive(self):
        self.assertEqual(add(2, 3), 5)
    
    def test_add_negative(self):
        self.assertEqual(add(-1, 1), 0)
    
    def test_divide(self):
        self.assertEqual(divide(10, 2), 5)
    
    def test_divide_by_zero(self):
        with self.assertRaises(ValueError):
            divide(10, 0)

# تشغيل: python -m unittest test_file.py

# ===== pytest (أبسط وأقوى) =====
# pip install pytest

def test_add_positive():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, 1) == 0

def test_divide():
    assert divide(10, 2) == 5.0

def test_divide_by_zero():
    import pytest
    with pytest.raises(ValueError):
        divide(10, 0)

# تشغيل: pytest test_file.py -v

# ===== Fixtures =====
import pytest

@pytest.fixture
def sample_user():
    return {"name": "أحمد", "age": 25}

def test_user_name(sample_user):
    assert sample_user["name"] == "أحمد"

def test_user_age(sample_user):
    assert sample_user["age"] == 25

# ===== Parametrized Tests =====
@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add_parametrized(a, b, expected):
    assert add(a, b) == expected

# ===== Mock =====
from unittest.mock import Mock, patch

def get_user_from_api(user_id):
    # تخيل أنها تتصل بـ API
    pass

def test_with_mock():
    mock_response = Mock()
    mock_response.json.return_value = {"name": "أحمد"}
    
    with patch('requests.get', return_value=mock_response):
        # الاختبار هنا
        pass

# ===== Coverage =====
# pip install pytest-cov
# pytest --cov=my_module tests/`,
    language: 'python',
    xpReward: 140,
    order: 9,
    quiz: {
      question: 'ما فائدة @pytest.fixture؟',
      options: [
        'تشغيل الاختبار',
        'إعداد بيانات مشتركة للاختبارات',
        'تجاهل الاختبار',
        'قياس الأداء',
      ],
      correctAnswer: 1,
      explanation:
        'Fixtures توفر بيانات أو حالة مشتركة يمكن استخدامها في عدة اختبارات',
    },
  },
  {
    id: 'py-adv-12',
    courseId: 'py-advanced',
    title: 'Logging وتتبع الأخطاء',
    description: 'تسجيل الأحداث والأخطاء بشكل احترافي',
    content: `
# Logging في Python

تسجيل الأحداث بدلاً من print.

## لماذا Logging؟
- التحكم بمستوى التفصيل
- حفظ في ملفات
- تنسيق موحد
- سهولة التصفية

## مستويات السجل
- DEBUG: تفاصيل للتطوير
- INFO: معلومات عامة
- WARNING: تحذيرات
- ERROR: أخطاء
- CRITICAL: أخطاء حرجة
`,
    codeExample: `import logging
from logging.handlers import RotatingFileHandler
import traceback

# ===== إعداد بسيط =====
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

logger.debug("هذه رسالة debug")
logger.info("معلومات عامة")
logger.warning("تحذير!")
logger.error("خطأ حدث")
logger.critical("خطأ حرج!")

# ===== Logger مخصص =====
def setup_logger(name, log_file):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    # Handler للملف
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=5*1024*1024,  # 5MB
        backupCount=3
    )
    file_handler.setLevel(logging.DEBUG)
    
    # Handler للـ Console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # التنسيق
    formatter = logging.Formatter(
        '%(asctime)s | %(name)s | %(levelname)s | %(message)s'
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# استخدام
app_logger = setup_logger('myapp', 'app.log')

def process_data(data):
    app_logger.info(f"بدء معالجة البيانات: {len(data)} عنصر")
    try:
        # المعالجة...
        result = [x * 2 for x in data]
        app_logger.info("تمت المعالجة بنجاح")
        return result
    except Exception as e:
        app_logger.error(f"خطأ في المعالجة: {e}")
        app_logger.debug(traceback.format_exc())
        raise

# ===== Contextual Logging =====
class RequestLogger:
    def __init__(self, request_id):
        self.request_id = request_id
        self.logger = logging.getLogger('request')
    
    def log(self, level, message):
        self.logger.log(level, f"[{self.request_id}] {message}")

def handle_request(request):
    req_logger = RequestLogger(request['id'])
    req_logger.log(logging.INFO, "بدأ الطلب")
    # ...
    req_logger.log(logging.INFO, "انتهى الطلب")

# ===== تسجيل الاستثناءات =====
def risky_operation():
    try:
        result = 10 / 0
    except ZeroDivisionError:
        logger.exception("خطأ في العملية الحسابية")
        # يسجل الـ traceback كاملاً

# ===== JSON Logging =====
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module
        }
        return json.dumps(log_data, ensure_ascii=False)`,
    language: 'python',
    xpReward: 130,
    order: 10,
    quiz: {
      question: 'ما الفرق بين logger.error() و logger.exception()؟',
      options: [
        'لا فرق',
        'exception يسجل الـ traceback تلقائياً',
        'error أسرع',
        'exception للتحذيرات فقط',
      ],
      correctAnswer: 1,
      explanation:
        'logger.exception() يسجل رسالة الخطأ مع traceback الاستثناء الحالي',
    },
  },
  {
    id: 'py-adv-13',
    courseId: 'py-advanced',
    title: 'File I/O المتقدم',
    description: 'التعامل مع الملفات بشكل احترافي',
    content: `
# File I/O المتقدم

قراءة وكتابة الملفات بكفاءة.

## أنواع الملفات
- النصية (text)
- الثنائية (binary)
- JSON, CSV, XML

## Context Manager
\`\`\`python
with open(file) as f:
    # الملف يُغلق تلقائياً
\`\`\`

## المواضيع
- القراءة الكفوءة
- معالجة الملفات الكبيرة
- التعامل مع الترميز
- الملفات المؤقتة
`,
    codeExample: `import os
import json
import csv
from pathlib import Path
import tempfile

# ===== الأساسيات مع with =====
# كتابة
with open('file.txt', 'w', encoding='utf-8') as f:
    f.write('مرحباً\\n')
    f.writelines(['سطر 1\\n', 'سطر 2\\n'])

# قراءة
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()
    # أو سطر سطر
    # for line in f:
    #     print(line.strip())

# ===== Path (الطريقة الحديثة) =====
path = Path('data/output')
path.mkdir(parents=True, exist_ok=True)

file_path = path / 'results.txt'
file_path.write_text('بيانات', encoding='utf-8')
content = file_path.read_text(encoding='utf-8')

# معلومات الملف
print(file_path.exists())
print(file_path.is_file())
print(file_path.suffix)  # .txt
print(file_path.stem)    # results

# قائمة الملفات
for f in Path('.').glob('*.py'):
    print(f.name)

# ===== JSON =====
data = {'name': 'أحمد', 'age': 25, 'scores': [90, 85, 92]}

# كتابة
with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# قراءة
with open('data.json', 'r', encoding='utf-8') as f:
    loaded = json.load(f)

# ===== CSV =====
# كتابة
with open('data.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['name', 'age'])
    writer.writeheader()
    writer.writerow({'name': 'أحمد', 'age': 25})
    writer.writerow({'name': 'محمد', 'age': 30})

# قراءة
with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row['name'], row['age'])

# ===== الملفات الكبيرة =====
def process_large_file(filepath):
    """معالجة ملف كبير سطر سطر"""
    with open(filepath, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            # معالجة كل سطر
            if line_num % 100000 == 0:
                print(f"تم معالجة {line_num} سطر")

# قراءة بكتل
def read_in_chunks(file_path, chunk_size=1024*1024):
    with open(file_path, 'rb') as f:
        while chunk := f.read(chunk_size):
            yield chunk

# ===== الملفات المؤقتة =====
with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
    f.write('بيانات مؤقتة')
    temp_path = f.name
    
print(f"الملف المؤقت: {temp_path}")
os.unlink(temp_path)  # حذف`,
    language: 'python',
    xpReward: 130,
    order: 11,
    quiz: {
      question: 'لماذا نستخدم with عند التعامل مع الملفات؟',
      options: [
        'لأنه أسرع',
        'لإغلاق الملف تلقائياً حتى عند الأخطاء',
        'لأنه مطلوب',
        'للقراءة فقط',
      ],
      correctAnswer: 1,
      explanation:
        'with يضمن إغلاق الملف تلقائياً حتى لو حدث استثناء داخل الكتلة',
    },
  },
  {
    id: 'py-adv-14',
    courseId: 'py-advanced',
    title: 'Virtual Environments والحزم',
    description: 'إدارة البيئات والتبعيات',
    content: `
# Virtual Environments

بيئات معزولة لكل مشروع.

## لماذا Virtual Environments؟
- عزل التبعيات
- تجنب التعارضات
- إعادة إنتاج البيئة
- تنظيم المشاريع

## الأدوات
- venv (مدمج)
- virtualenv
- conda
- poetry

## إدارة الحزم
- pip
- requirements.txt
- pyproject.toml
`,
    codeExample: `# ===== إنشاء بيئة افتراضية =====
# في Terminal:
# python -m venv myenv

# تفعيل (Windows)
# myenv\\Scripts\\activate

# تفعيل (Linux/Mac)
# source myenv/bin/activate

# إلغاء التفعيل
# deactivate

# ===== إدارة الحزم =====
# تثبيت حزمة
# pip install requests

# تثبيت إصدار محدد
# pip install requests==2.28.0

# تثبيت من ملف
# pip install -r requirements.txt

# حفظ الحزم المثبتة
# pip freeze > requirements.txt

# ===== requirements.txt =====
"""
requests==2.28.0
pandas>=1.5.0
numpy~=1.24.0
python-dotenv
"""

# ===== Script للإعداد =====
import subprocess
import sys

def setup_project():
    """إعداد المشروع"""
    # تثبيت التبعيات
    subprocess.check_call([
        sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'
    ])

# ===== pyproject.toml (الطريقة الحديثة) =====
"""
[project]
name = "myproject"
version = "1.0.0"
description = "وصف المشروع"
requires-python = ">=3.9"
dependencies = [
    "requests>=2.28.0",
    "pandas>=1.5.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "black",
    "flake8",
]
"""

# ===== التحقق من البيئة =====
import sys
import pkg_resources

def check_environment():
    print(f"Python: {sys.version}")
    print(f"Path: {sys.executable}")
    print("\\nالحزم المثبتة:")
    for pkg in pkg_resources.working_set:
        print(f"  {pkg.key}: {pkg.version}")

# ===== إدارة الإعدادات =====
from dotenv import load_dotenv
import os

# تحميل من .env
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///default.db')
API_KEY = os.getenv('API_KEY')
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# .env file:
# DATABASE_URL=postgresql://user:pass@localhost/db
# API_KEY=secret_key
# DEBUG=True

# ===== Poetry (الأفضل للمشاريع الكبيرة) =====
# تثبيت: pip install poetry
# إنشاء مشروع: poetry new myproject
# إضافة حزمة: poetry add requests
# تثبيت: poetry install
# تشغيل: poetry run python script.py`,
    language: 'python',
    xpReward: 120,
    order: 12,
    quiz: {
      question: 'ما فائدة Virtual Environment؟',
      options: [
        'تسريع Python',
        'عزل تبعيات كل مشروع',
        'حماية الكود',
        'ضغط الملفات',
      ],
      correctAnswer: 1,
      explanation:
        'Virtual Environment يعزل حزم كل مشروع عن الآخر لتجنب تعارض الإصدارات',
    },
  },
];

// ===== تحديات Python للمبتدئين =====
export const PYTHON_CHALLENGES_BEGINNER: Challenge[] = [
  {
    id: 'py-ch-beg-1',
    title: 'الآلة الحاسبة البسيطة',
    description: 'أنشئ آلة حاسبة للعمليات الأساسية',
    difficulty: 'easy',
    points: 15,
    language: 'Python',
    icon: 'calculator',
    starterCode: `def calculator(a, b, operation):
    """
    احسب النتيجة بناءً على العملية
    العمليات: '+', '-', '*', '/'
    """
    pass

# أمثلة:
# calculator(10, 5, '+') -> 15
# calculator(10, 5, '-') -> 5`,
    solution: `def calculator(a, b, operation):
    if operation == '+':
        return a + b
    elif operation == '-':
        return a - b
    elif operation == '*':
        return a * b
    elif operation == '/':
        if b != 0:
            return a / b
        return "لا يمكن القسمة على صفر"
    return "عملية غير صالحة"`,
    hints: ['استخدم if/elif للتحقق من العملية', 'تأكد من عدم القسمة على صفر'],
    testCases: [
      { input: '10, 5, "+"', expectedOutput: '15', description: 'جمع' },
      { input: '10, 5, "-"', expectedOutput: '5', description: 'طرح' },
      { input: '10, 5, "*"', expectedOutput: '50', description: 'ضرب' },
      { input: '10, 2, "/"', expectedOutput: '5.0', description: 'قسمة' },
      {
        input: '10, 0, "/"',
        expectedOutput: 'لا يمكن القسمة على صفر',
        description: 'القسمة على صفر',
      },
    ],
    isLocked: false,
    category: 'basics',
  },
  {
    id: 'py-ch-beg-2',
    title: 'عكس النص',
    description: 'اكتب دالة لعكس نص',
    difficulty: 'easy',
    points: 15,
    language: 'Python',
    icon: 'swap-horiz',
    starterCode: `def reverse_string(text):
    """
    اعكس النص المُدخل
    """
    pass

# أمثلة:
# reverse_string("hello") -> "olleh"
# reverse_string("Python") -> "nohtyP"`,
    solution: `def reverse_string(text):
    return text[::-1]

# أو بطريقة أخرى:
def reverse_string_loop(text):
    result = ""
    for char in text:
        result = char + result
    return result`,
    hints: ['يمكنك استخدام slicing [::-1]', 'أو استخدم حلقة for'],
    testCases: [
      { input: '"hello"', expectedOutput: '"olleh"', description: 'عكس كلمة' },
      { input: '"Python"', expectedOutput: '"nohtyP"', description: 'عكس اسم' },
      { input: '""', expectedOutput: '""', description: 'نص فارغ' },
    ],
    isLocked: false,
    category: 'strings',
  },
  {
    id: 'py-ch-beg-3',
    title: 'العدد الزوجي والفردي',
    description: 'تحقق إذا كان العدد زوجياً أم فردياً',
    difficulty: 'easy',
    points: 10,
    language: 'Python',
    icon: 'pricetag',
    starterCode: `def even_or_odd(number):
    """
    أرجع "زوجي" إذا كان العدد زوجياً
    أرجع "فردي" إذا كان العدد فردياً
    """
    pass`,
    solution: `def even_or_odd(number):
    if number % 2 == 0:
        return "زوجي"
    return "فردي"`,
    hints: [
      'استخدم عامل باقي القسمة %',
      'العدد الزوجي يقبل القسمة على 2 بدون باقي',
    ],
    testCases: [
      { input: '4', expectedOutput: '"زوجي"', description: '4 زوجي' },
      { input: '7', expectedOutput: '"فردي"', description: '7 فردي' },
      { input: '0', expectedOutput: '"زوجي"', description: '0 زوجي' },
    ],
    isLocked: false,
    category: 'basics',
  },
  {
    id: 'py-ch-beg-4',
    title: 'حساب المتوسط',
    description: 'احسب متوسط قائمة أرقام',
    difficulty: 'easy',
    points: 15,
    language: 'Python',
    icon: 'analytics',
    starterCode: `def calculate_average(numbers):
    """
    احسب متوسط الأرقام في القائمة
    أرجع 0 إذا كانت القائمة فارغة
    """
    pass

# مثال:
# calculate_average([10, 20, 30]) -> 20.0`,
    solution: `def calculate_average(numbers):
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)`,
    hints: [
      'استخدم sum() للجمع و len() للعدد',
      'تحقق من القائمة الفارغة أولاً',
    ],
    testCases: [
      {
        input: '[10, 20, 30]',
        expectedOutput: '20.0',
        description: 'متوسط ثلاثة أرقام',
      },
      { input: '[5]', expectedOutput: '5.0', description: 'رقم واحد' },
      { input: '[]', expectedOutput: '0', description: 'قائمة فارغة' },
    ],
    isLocked: false,
    category: 'lists',
  },
  {
    id: 'py-ch-beg-5',
    title: 'عد الكلمات',
    description: 'احسب عدد الكلمات في نص',
    difficulty: 'easy',
    points: 15,
    language: 'Python',
    icon: 'format-list-numbered',
    starterCode: `def count_words(text):
    """
    احسب عدد الكلمات في النص
    """
    pass

# مثال:
# count_words("مرحباً بك في Python") -> 4`,
    solution: `def count_words(text):
    if not text.strip():
        return 0
    return len(text.split())`,
    hints: ['استخدم split() لتقسيم النص', 'strip() يزيل المسافات الزائدة'],
    testCases: [
      { input: '"مرحباً بك"', expectedOutput: '2', description: 'كلمتان' },
      {
        input: '"Hello World"',
        expectedOutput: '2',
        description: 'كلمتان بالإنجليزي',
      },
      { input: '""', expectedOutput: '0', description: 'نص فارغ' },
    ],
    isLocked: false,
    category: 'strings',
  },
];

// ===== تحديات Python المتوسطة =====
export const PYTHON_CHALLENGES_INTERMEDIATE: Challenge[] = [
  {
    id: 'py-ch-int-1',
    title: 'FizzBuzz الكلاسيكي',
    description: 'حل مشكلة FizzBuzz الشهيرة',
    difficulty: 'medium',
    points: 25,
    language: 'Python',
    icon: 'extension-puzzle',
    starterCode: `def fizzbuzz(n):
    """
    أرجع قائمة من 1 إلى n حيث:
    - "Fizz" للأرقام التي تقبل القسمة على 3
    - "Buzz" للأرقام التي تقبل القسمة على 5
    - "FizzBuzz" للأرقام التي تقبل القسمة على كليهما
    - الرقم نفسه لباقي الحالات
    """
    pass`,
    solution: `def fizzbuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 3 == 0 and i % 5 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result`,
    hints: [
      'تحقق من القسمة على 15 أولاً (3 و 5)',
      'استخدم elif للتحقق المتسلسل',
    ],
    testCases: [
      {
        input: '5',
        expectedOutput: '["1", "2", "Fizz", "4", "Buzz"]',
        description: 'أول 5',
      },
      {
        input: '15',
        expectedOutput:
          '["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]',
        description: 'يشمل 15',
      },
    ],
    isLocked: false,
    category: 'logic',
  },
  {
    id: 'py-ch-int-2',
    title: 'الأعداد الأولية',
    description: 'اكتشف الأعداد الأولية',
    difficulty: 'medium',
    points: 30,
    language: 'Python',
    icon: 'star',
    starterCode: `def is_prime(n):
    """
    تحقق إذا كان العدد أولياً
    العدد الأولي يقبل القسمة على 1 وعلى نفسه فقط
    """
    pass

def primes_up_to(limit):
    """
    أرجع قائمة بالأعداد الأولية حتى limit
    """
    pass`,
    solution: `def is_prime(n):
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(n**0.5) + 1, 2):
        if n % i == 0:
            return False
    return True

def primes_up_to(limit):
    return [n for n in range(2, limit + 1) if is_prime(n)]`,
    hints: ['تحقق حتى جذر العدد فقط', 'الأعداد الزوجية (عدا 2) ليست أولية'],
    testCases: [
      { input: 'is_prime(7)', expectedOutput: 'True', description: '7 أولي' },
      {
        input: 'is_prime(10)',
        expectedOutput: 'False',
        description: '10 ليس أولي',
      },
      {
        input: 'primes_up_to(10)',
        expectedOutput: '[2, 3, 5, 7]',
        description: 'أولية حتى 10',
      },
    ],
    isLocked: false,
    category: 'math',
  },
  {
    id: 'py-ch-int-3',
    title: 'فرز الفقاعات',
    description: 'نفذ خوارزمية Bubble Sort',
    difficulty: 'medium',
    points: 35,
    language: 'Python',
    icon: 'sort',
    starterCode: `def bubble_sort(arr):
    """
    رتب القائمة باستخدام Bubble Sort
    أرجع قائمة جديدة مرتبة
    """
    pass`,
    solution: `def bubble_sort(arr):
    arr = arr.copy()
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
    hints: [
      'قارن كل عنصرين متجاورين',
      'بدّل إذا كان الأول أكبر',
      'كرر حتى لا يحدث تبديل',
    ],
    testCases: [
      {
        input: '[64, 34, 25, 12]',
        expectedOutput: '[12, 25, 34, 64]',
        description: 'ترتيب أرقام',
      },
      {
        input: '[1, 2, 3]',
        expectedOutput: '[1, 2, 3]',
        description: 'مرتبة مسبقاً',
      },
      { input: '[]', expectedOutput: '[]', description: 'قائمة فارغة' },
      {
        input: '[-3, 1, -5, 2]',
        expectedOutput: '[-5, -3, 1, 2]',
        description: 'أرقام سالبة',
      },
    ],
    isLocked: false,
    category: 'algorithms',
  },
  {
    id: 'py-ch-int-4',
    title: 'قاموس الترددات',
    description: 'احسب تكرار كل عنصر',
    difficulty: 'medium',
    points: 25,
    language: 'Python',
    icon: 'book',
    starterCode: `def count_frequency(items):
    """
    أرجع قاموساً بعدد تكرار كل عنصر
    """
    pass

# مثال:
# count_frequency(['a', 'b', 'a', 'c', 'a', 'b'])
# -> {'a': 3, 'b': 2, 'c': 1}`,
    solution: `def count_frequency(items):
    freq = {}
    for item in items:
        freq[item] = freq.get(item, 0) + 1
    return freq

# أو باستخدام Counter:
from collections import Counter
def count_frequency_v2(items):
    return dict(Counter(items))`,
    hints: [
      'استخدم قاموساً لتخزين التكرارات',
      'get(key, 0) ترجع 0 إذا لم يوجد المفتاح',
    ],
    testCases: [
      {
        input: "['a', 'b', 'a']",
        expectedOutput: "{'a': 2, 'b': 1}",
        description: 'تكرار حروف',
      },
      {
        input: '[1, 1, 2, 2, 2]',
        expectedOutput: '{1: 2, 2: 3}',
        description: 'تكرار أرقام',
      },
    ],
    isLocked: false,
    category: 'dictionaries',
  },
  {
    id: 'py-ch-int-5',
    title: 'متتالية فيبوناتشي',
    description: 'احسب متتالية فيبوناتشي',
    difficulty: 'medium',
    points: 30,
    language: 'Python',
    icon: 'infinite',
    starterCode: `def fibonacci(n):
    """
    أرجع أول n أرقام من متتالية فيبوناتشي
    """
    pass

def fibonacci_recursive(n):
    """
    أرجع الرقم n من متتالية فيبوناتشي (باستخدام التكرار)
    """
    pass`,
    solution: `def fibonacci(n):
    if n <= 0:
        return []
    if n == 1:
        return [0]
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib

def fibonacci_recursive(n):
    if n <= 1:
        return n
    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)`,
    hints: ['كل رقم = مجموع الرقمين السابقين', 'ابدأ بـ 0 و 1'],
    testCases: [
      {
        input: 'fibonacci(5)',
        expectedOutput: '[0, 1, 1, 2, 3]',
        description: 'أول 5',
      },
      {
        input: 'fibonacci_recursive(10)',
        expectedOutput: '55',
        description: 'الرقم العاشر',
      },
    ],
    isLocked: false,
    category: 'math',
  },
];

// ===== تحديات Python المتقدمة =====
export const PYTHON_CHALLENGES_ADVANCED: Challenge[] = [
  {
    id: 'py-ch-adv-1',
    title: 'مدقق الأقواس المتقدم',
    description: 'تحقق من توازن جميع أنواع الأقواس',
    difficulty: 'hard',
    points: 80,
    language: 'Python',
    icon: 'check-box',
    starterCode: `def is_balanced(expression):
    """
    تحقق من توازن الأقواس في التعبير
    الأقواس المدعومة: () [] {} <>
    """
    pass

# أمثلة:
# is_balanced("([{}])") -> True
# is_balanced("([)]") -> False
# is_balanced("<div>{text}</div>") -> True`,
    solution: `def is_balanced(expression):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{', '>': '<'}
    opening = set(pairs.values())
    closing = set(pairs.keys())
    
    for char in expression:
        if char in opening:
            stack.append(char)
        elif char in closing:
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
    
    return len(stack) == 0`,
    hints: [
      'استخدم Stack (قائمة)',
      'أضف الأقواس الفاتحة للـ Stack',
      'عند قوس غالق، تحقق من المطابقة مع آخر عنصر',
    ],
    testCases: [
      {
        input: '"([{}])"',
        expectedOutput: 'True',
        description: 'أقواس متوازنة',
      },
      {
        input: '"([)]"',
        expectedOutput: 'False',
        description: 'أقواس غير متوازنة',
      },
      { input: '""', expectedOutput: 'True', description: 'نص فارغ' },
    ],
    isLocked: true,
    category: 'data-structures',
  },
  {
    id: 'py-ch-adv-2',
    title: 'ضغط النص (Run-Length Encoding)',
    description: 'اضغط النص باستخدام خوارزمية RLE',
    difficulty: 'hard',
    points: 50,
    language: 'Python',
    icon: 'contract-outline',
    starterCode: `def compress(text):
    """
    ضغط النص باستخدام Run-Length Encoding
    مثال: "AAABBC" -> "A3B2C1"
    """
    pass

def decompress(compressed):
    """
    فك ضغط النص
    مثال: "A3B2C1" -> "AAABBC"
    """
    pass`,
    solution: `def compress(text):
    if not text:
        return ""
    result = []
    count = 1
    for i in range(1, len(text)):
        if text[i] == text[i-1]:
            count += 1
        else:
            result.append(f"{text[i-1]}{count}")
            count = 1
    result.append(f"{text[-1]}{count}")
    return "".join(result)

def decompress(compressed):
    result = []
    i = 0
    while i < len(compressed):
        char = compressed[i]
        num = ""
        i += 1
        while i < len(compressed) and compressed[i].isdigit():
            num += compressed[i]
            i += 1
        result.append(char * int(num))
    return "".join(result)`,
    hints: [
      'عد الأحرف المتتالية المتشابهة',
      'استخدم قائمة لتجميع النتيجة',
      'للفك: استخرج الحرف والرقم',
    ],
    testCases: [
      { input: '"AAABBC"', expectedOutput: '"A3B2C1"', description: 'ضغط نص' },
      {
        input: '"AABBCCCC"',
        expectedOutput: '"A2B2C4"',
        description: 'ضغط حروف متفاوتة',
      },
      {
        input: 'decompress("A3B2C1")',
        expectedOutput: 'AAABBC',
        description: 'فك ضغط النص',
      },
      { input: '""', expectedOutput: '""', description: 'نص فارغ' },
    ],
    isLocked: true,
    category: 'strings',
  },
  {
    id: 'py-ch-adv-3',
    title: 'شجرة البحث الثنائية',
    description: 'نفذ عمليات BST الأساسية',
    difficulty: 'hard',
    points: 100,
    language: 'Python',
    icon: 'account-tree',
    starterCode: `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None
    
    def insert(self, value):
        """إضافة قيمة للشجرة"""
        pass
    
    def search(self, value):
        """البحث عن قيمة، ترجع True/False"""
        pass
    
    def inorder(self):
        """إرجاع القيم مرتبة"""
        pass`,
    solution: `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None
    
    def insert(self, value):
        if not self.root:
            self.root = Node(value)
        else:
            self._insert_recursive(self.root, value)
    
    def _insert_recursive(self, node, value):
        if value < node.value:
            if node.left is None:
                node.left = Node(value)
            else:
                self._insert_recursive(node.left, value)
        else:
            if node.right is None:
                node.right = Node(value)
            else:
                self._insert_recursive(node.right, value)
    
    def search(self, value):
        return self._search_recursive(self.root, value)
    
    def _search_recursive(self, node, value):
        if node is None:
            return False
        if value == node.value:
            return True
        elif value < node.value:
            return self._search_recursive(node.left, value)
        else:
            return self._search_recursive(node.right, value)
    
    def inorder(self):
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node, result):
        if node:
            self._inorder_recursive(node.left, result)
            result.append(node.value)
            self._inorder_recursive(node.right, result)`,
    hints: [
      'القيم الأصغر تذهب يساراً، الأكبر يميناً',
      'استخدم Recursion للإضافة والبحث',
      'Inorder: يسار، جذر، يمين',
    ],
    testCases: [
      {
        input: '[5, 3, 7]',
        expectedOutput: '[3, 5, 7]',
        description: 'إضافة 5,3,7 ثم inorder',
      },
      {
        input: '[5, 3, 7, 1, 4]',
        expectedOutput: '[1, 3, 4, 5, 7]',
        description: 'إضافة 5 عناصر ثم inorder',
      },
      {
        input: '[10, 5, 15, 3, 7]',
        expectedOutput: '[3, 5, 7, 10, 15]',
        description: 'إضافة 5 عناصر مختلفة ثم inorder',
      },
    ],
    isLocked: true,
    category: 'data-structures',
  },
];

// تصدير الكل
export const ALL_PYTHON_LESSONS = [
  ...PYTHON_LESSONS_BEGINNER,
  ...PYTHON_LESSONS_DATA_STRUCTURES,
  ...PYTHON_LESSONS_ADVANCED,
];
export const ALL_PYTHON_CHALLENGES = [
  ...PYTHON_CHALLENGES_BEGINNER,
  ...PYTHON_CHALLENGES_INTERMEDIATE,
  ...PYTHON_CHALLENGES_ADVANCED,
];

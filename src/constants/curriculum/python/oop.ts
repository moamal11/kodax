/**
 * منهج py-oop — البرمجة الكائنية في Python.
 *
 * كان: 10 دروس بشرح من سطر واحد؛ درسان مكرران بعنوان "Abstract Classes" (6 و 9)؛
 * ادعاء خاطئ أن __name "مخفي حقاً"؛ الترتيب يقدّم الوراثة قبل التغليف والخصائص؛
 * لا يوجد درس عن التركيب (composition) ولا مشروع.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';

export const PY_OOP_PLAN: CoursePlan = {
  courseId: 'py-oop',
  course: {
    description:
      'البرمجة الكائنية في Python خطوة بخطوة: الأصناف والكائنات، التغليف والخصائص، الوراثة وتعدد الأشكال، الأصناف المجردة، الدوال السحرية، dataclasses، التركيب مقابل الوراثة، وأنماط التصميم — مع مشروع نظام مكتبة.',
  },
  sections: [
    { title: 'الأصناف والكائنات', lessons: ['py-adv-1', 'py-oop-3', 'py-oop-7'] },
    { title: 'الوراثة وتعدد الأشكال', lessons: ['py-adv-2', 'py-oop-4', 'py-oop-6'] },
    { title: 'Python الكائنية', lessons: ['py-oop-5', 'py-oop-8'] },
    { title: 'التصميم والمشروع', lessons: ['py-oop-9', 'py-oop-10', 'py-oop-project'] },
  ],
  patches: {
    'py-adv-1': {
      content: md`
# مقدمة في البرمجة الكائنية (OOP)

حتى الآن نظمت برامجك بالدوال، والبيانات منفصلة عنها في قوائم وقواميس. هذا يعمل جيداً للبرامج الصغيرة. لكن عندما يكبر البرنامج تظهر مشكلة: دالة \`withdraw(account, amount)\` يمكن أن تُستدعى على أي قاموس، وأي جزء من الكود يمكنه تغيير \`account["balance"]\` مباشرة إلى قيمة خاطئة.

البرمجة الكائنية **تجمع البيانات والدوال التي تعمل عليها في وحدة واحدة** تسمى كائناً.

## الصنف والكائن
- **الصنف (class)**: المخطط أو القالب. مثل تصميم سيارة.
- **الكائن (object / instance)**: نسخة حقيقية من الصنف. مثل سيارة محددة لها لون ورقم.

\`\`\`python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        return f"{self.name} ينبح!"

rex = Dog("ريكس", 3)     # إنشاء كائن
print(rex.name)          # خاصية
print(rex.bark())        # دالة (method)
\`\`\`

## __init__ و self
- \`__init__\` تُستدعى **تلقائياً** عند إنشاء الكائن، ومهمتها تهيئة خصائصه.
- \`self\` تشير إلى **الكائن نفسه** الذي تعمل عليه الدالة. عندما تكتب \`rex.bark()\` فإن Python تنفذ فعلياً \`Dog.bark(rex)\`، فيصبح \`self\` هو \`rex\`.
- كل دالة داخل الصنف تأخذ \`self\` كمعامل أول.

## خصائص الكائن وخصائص الصنف
\`\`\`python
class Car:
    wheels = 4                 # خاصية صنف: مشتركة بين كل الكائنات
    def __init__(self, brand):
        self.brand = brand     # خاصية كائن: لكل سيارة قيمتها
\`\`\`

## __str__ للطباعة
بدون \`__str__\`، طباعة الكائن تعرض شيئاً مثل \`<__main__.Car object at 0x...>\`. عرّفها لتمثيل مقروء:
\`\`\`python
def __str__(self):
    return f"سيارة {self.brand}"
\`\`\`

## متى تستخدم الأصناف؟
عندما يكون لديك "شيء" له **حالة** (بيانات تتغير) و**سلوك** (عمليات عليها): حساب بنكي، لاعب في لعبة، طلب شراء. للعمليات البسيطة بلا حالة، الدوال العادية أبسط وأفضل.

## خطأ شائع
نسيان \`self\` في تعريف الدالة: \`def bark():\` ثم \`rex.bark()\` ← \`TypeError: takes 0 positional arguments but 1 was given\`، لأن Python تمرر الكائن تلقائياً.

## تمرين
أنشئ صنف \`Rectangle\` بخاصيتي العرض والارتفاع، ودوال \`area()\` و \`perimeter()\` و \`__str__\`، وأنشئ منه كائنين واطبعهما.
`,
    },
    'py-adv-2': {
      content: md`
# الوراثة (Inheritance)

الوراثة تسمح بإنشاء صنف جديد **يبني على صنف موجود**: يأخذ كل خصائصه ودواله، ثم يضيف أو يغيّر ما يحتاجه.

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "..."

class Cat(Animal):          # Cat يرث من Animal
    def speak(self):        # إعادة تعريف (override)
        return "مياو"
\`\`\`
\`Cat("ميمي").name\` تعمل رغم أن \`Cat\` لم يعرّف \`__init__\`، لأنه ورثها.

## العلاقة "هو نوع من" (is-a)
استخدم الوراثة عندما يكون الصنف الجديد **نوعاً من** الأب فعلاً: القطة حيوان، الحساب التوفيري حساب بنكي. إذا لم تصح الجملة، فالوراثة اختيار خاطئ (سنرى البديل في درس التركيب).

## super(): استدعاء دالة الأب
عندما يحتاج الابن خصائص إضافية، يعرّف \`__init__\` خاصة به ويستدعي \`__init__\` الأب أولاً:
\`\`\`python
class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)   # يهيئ name
        self.breed = breed
\`\`\`
إذا نسيت \`super().__init__\`، لن تُنشأ الخاصية \`name\` وستحصل على \`AttributeError\` لاحقاً.

يمكنك أيضاً **توسيع** دالة الأب بدل استبدالها:
\`\`\`python
def describe(self):
    return super().describe() + f" من سلالة {self.breed}"
\`\`\`

## فحص الأنواع
\`\`\`python
rex = Dog("ريكس", "هاسكي")
isinstance(rex, Dog)       # True
isinstance(rex, Animal)    # True: الكلب حيوان أيضاً
issubclass(Dog, Animal)    # True
\`\`\`

## الوراثة المتعددة
Python تسمح بالوراثة من أكثر من صنف: \`class Duck(Animal, Swimmer)\`. ترتيب البحث عن الدوال يسمى MRO ويمكن رؤيته بـ \`Duck.__mro__\`. استخدمها بحذر؛ الاستخدام الشائع والآمن هو أصناف صغيرة تضيف قدرة واحدة (تسمى mixins).

## متى تكون الوراثة مشكلة؟
سلاسل وراثة عميقة (أ ← ب ← ج ← د) تجعل فهم مصدر كل سلوك صعباً. اجعل الهرم ضحلاً.

## تمرين
أنشئ صنف \`Employee\` (الاسم، الراتب، \`annual_salary()\`)، ثم \`Manager\` يرث منه ويضيف \`bonus\` ويعيد تعريف \`annual_salary()\` مستخدماً \`super()\`.
`,
    },
    'py-oop-3': {
      content: md`
# التغليف (Encapsulation) والخصائص

التغليف يعني أن الكائن **يتحكم في بياناته**: بقية البرنامج تتعامل معه عبر دوال واضحة، بدلاً من تعديل خصائصه الداخلية مباشرة إلى قيم غير صالحة.

## المشكلة
\`\`\`python
class Account:
    def __init__(self):
        self.balance = 0

account = Account()
account.balance = -5000   # لا شيء يمنع هذا!
\`\`\`

## مستويات الوصول في Python
Python لا تملك \`private\` حقيقية مثل Java، بل **اصطلاحات**:
| الكتابة | المعنى |
|---|---|
| \`balance\` | عام: جزء من واجهة الصنف |
| \`_balance\` | داخلي بالاتفاق: "لا تستخدمه من الخارج" لكنه متاح |
| \`__balance\` | تشويه الاسم (name mangling): يصبح \`_Account__balance\` |

\`__balance\` **ليست مخفية فعلاً**: Python تغيّر اسمها داخلياً إلى \`_Account__balance\` لتجنب التصادم مع أسماء في الأصناف الوارثة، ويمكن الوصول إليها بهذا الاسم. الاصطلاح الشائع في Python هو \`_\` واحدة.

## @property: خاصية بقواعد
\`property\` تجعل دالة تُستخدم كأنها خاصية، فتستطيع التحقق عند القراءة والكتابة دون تغيير طريقة الاستخدام:
\`\`\`python
class Account:
    def __init__(self, balance=0):
        self._balance = balance

    @property
    def balance(self):           # القراءة: account.balance
        return self._balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("المبلغ يجب أن يكون موجباً")
        self._balance += amount
\`\`\`
بدون setter، تصبح \`balance\` **للقراءة فقط**: \`account.balance = 10\` ترمي \`AttributeError\`. الرصيد يتغير فقط عبر \`deposit\` و \`withdraw\` اللتين تطبقان القواعد.

## setter عند الحاجة
\`\`\`python
@property
def age(self):
    return self._age

@age.setter
def age(self, value):
    if value < 0:
        raise ValueError("عمر غير صالح")
    self._age = value
\`\`\`
استدعِ الـ setter داخل \`__init__\` أيضاً (\`self.age = age\`) حتى يُطبَّق التحقق من البداية.

## خصائص محسوبة
\`\`\`python
@property
def full_name(self):
    return f"{self.first} {self.last}"
\`\`\`
لا تُخزَّن، بل تُحسب عند كل قراءة، فتبقى صحيحة دائماً.

## لماذا لا نكتب get_balance() و set_balance()؟
في Python ابدأ بخاصية عامة بسيطة؛ إذا احتجت لاحقاً قواعد، حوّلها إلى \`@property\` **دون أن يتغير أي كود يستخدمها**. هذا أحد أجمل جوانب Python.

## تمرين
أنشئ صنف \`Temperature\` يخزن الحرارة بالمئوية في \`_celsius\` مع setter يرفض القيم الأقل من -273.15، وخاصية محسوبة \`fahrenheit\`.
`,
    },
    'py-oop-4': {
      content: md`
# تعدد الأشكال (Polymorphism)

تعدد الأشكال يعني أن **نفس الاستدعاء يعمل مع أنواع مختلفة**، وكل نوع يستجيب بطريقته. هذا يسمح بكتابة كود عام لا يحتاج أن يعرف النوع الدقيق للكائن.

\`\`\`python
class Circle:
    def __init__(self, r):
        self.r = r
    def area(self):
        return 3.14159 * self.r ** 2

class Rectangle:
    def __init__(self, w, h):
        self.w, self.h = w, h
    def area(self):
        return self.w * self.h

shapes = [Circle(2), Rectangle(3, 4)]
for shape in shapes:
    print(shape.area())   # كل شكل يحسب مساحته بطريقته
\`\`\`

## بدون تعدد الأشكال
\`\`\`python
for shape in shapes:
    if isinstance(shape, Circle):
        area = 3.14 * shape.r ** 2
    elif isinstance(shape, Rectangle):
        area = shape.w * shape.h
    # ... وكلما أضفت شكلاً عدّلت هذا الكود
\`\`\`
مع تعدد الأشكال، إضافة شكل جديد تعني **صنفاً جديداً فقط** دون لمس الكود الذي يستخدم الأشكال.

## عن طريق الوراثة
الصنف الأب يحدد الدالة، وكل ابن يعيد تعريفها:
\`\`\`python
class Shape:
    def area(self):
        raise NotImplementedError

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    def area(self):
        return 3.14159 * self.r ** 2
\`\`\`

## Duck Typing: أسلوب Python
"إذا كان يمشي كالبطة ويصدر صوت البطة، فهو بطة". Python لا تتحقق من النوع، بل من **وجود الدالة** عند استدعائها:
\`\`\`python
class Dog:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "هاو"

class Robot:
    def speak(self):
        return "بيب بوب"

for thing in [Dog("ريكس"), Robot()]:
    print(thing.speak())   # لا علاقة وراثة بينهما، ويعمل
\`\`\`
أمثلة من Python نفسها: \`len()\` تعمل مع أي كائن فيه \`__len__\`، و \`for\` تعمل مع أي كائن قابل للتكرار.

## تعدد الأشكال في العمليات
\`+\` تجمع الأرقام وتدمج النصوص والقوائم: نفس العامل، سلوك مختلف حسب النوع. ستتعلم في درس الدوال السحرية كيف تجعل أصنافك تدعم \`+\` و \`==\`.

## نقطة مهمة
لكي يعمل تعدد الأشكال، يجب أن تتفق الأصناف على **نفس اسم الدالة ونفس المعاملات ونفس معنى الناتج**. إذا كانت \`area()\` ترجع رقماً في صنف ونصاً في آخر، سينكسر الكود العام.

## تمرين
أنشئ أصناف دفع \`CashPayment\` و \`CardPayment\` و \`WalletPayment\`، لكل منها دالة \`pay(amount)\` ترجع رسالة مختلفة، ودالة واحدة \`checkout(payment, amount)\` تعمل مع أي منها.
`,
    },
    'py-oop-5': {
      content: md`
# الدوال السحرية (Magic / Dunder Methods)

الدوال التي يبدأ اسمها وينتهي بشرطتين سفليتين (\`__init__\`, \`__str__\`) تسمى **dunder methods**. لا تستدعيها بنفسك عادة؛ Python تستدعيها **تلقائياً** عند استخدام العمليات المدمجة. بتعريفها تجعل أصنافك تتصرف مثل الأنواع المدمجة.

## التمثيل النصي
| الدالة | متى تُستدعى | لمن |
|---|---|---|
| \`__str__\` | \`print(obj)\`، \`str(obj)\` | للمستخدم: نص مقروء |
| \`__repr__\` | في الطرفية، داخل القوائم، \`repr(obj)\` | للمبرمج: يوضح كيف أُنشئ الكائن |

\`\`\`python
def __repr__(self):
    return f"Money({self.amount!r}, {self.currency!r})"
\`\`\`
إذا عرّفت واحدة فقط، فعرّف \`__repr__\`: Python تستخدمها بديلاً عن \`__str__\`.

## المقارنة
\`\`\`python
def __eq__(self, other):
    if not isinstance(other, Money):
        return NotImplemented
    return (self.amount, self.currency) == (other.amount, other.currency)
\`\`\`
بدون \`__eq__\`، تقارن \`==\` **هوية** الكائنين (هل هما نفس الكائن في الذاكرة) وليس محتواهما. إرجاع \`NotImplemented\` يخبر Python أن هذه المقارنة غير مدعومة لهذا النوع.

\`__lt__\` (أصغر من) تجعل \`sorted()\` و \`min()\` تعمل مع كائناتك.

## العمليات الحسابية
\`\`\`python
def __add__(self, other):
    return Money(self.amount + other.amount, self.currency)
\`\`\`
الآن \`price + tax\` تعمل. يجب أن ترجع **كائناً جديداً** لا أن تعدّل self.

## سلوك الحاويات
| الدالة | تُفعّل |
|---|---|
| \`__len__\` | \`len(obj)\` |
| \`__getitem__\` | \`obj[i]\` وأيضاً التكرار بـ for |
| \`__contains__\` | \`x in obj\` |
| \`__iter__\` | \`for x in obj\` |

## __bool__
تحدد إن كان الكائن "صحيحاً" في الشروط: \`if cart:\`.

## قاعدة مهمة
عرّف الدوال السحرية التي **يتوقعها المستخدم منطقياً** فقط. جمع نقطتين منطقي، أما جمع موظفين فغالباً ليس كذلك.

## تمرين
أنشئ صنف \`Vector\` (x, y) مع \`__repr__\` و \`__add__\` و \`__eq__\` و \`__abs__\` (الطول)، وصنف \`Playlist\` يدعم \`len()\` و \`in\` والتكرار.
`,
    },
    'py-oop-6': {
      content: md`
# الأصناف المجردة (Abstract Classes)

أحياناً تريد صنفاً أباً يحدد **ما يجب** أن يفعله كل ابن، دون أن يكون له معنى إنشاؤه وحده. "شكل" عام ليس له مساحة؛ الدائرة والمربع لهما. الصنف المجرد هو **عقد**: كل صنف يرث منه ملزم بتنفيذ دوال معينة.

## abc و @abstractmethod
\`\`\`python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        ...

    def describe(self):              # دالة عادية مشتركة
        return f"المساحة: {self.area():.2f}"
\`\`\`

## ماذا تضيف فعلياً؟
1. **لا يمكن إنشاء الصنف المجرد**: \`Shape()\` ترمي \`TypeError\`.
2. **لا يمكن إنشاء ابن لم ينفذ كل الدوال المجردة**:
\`\`\`python
class Circle(Shape):
    pass

Circle()   # TypeError: Can't instantiate abstract class Circle ...
\`\`\`
الخطأ يظهر **عند الإنشاء** وليس لاحقاً عند استدعاء الدالة الناقصة، فتكتشف النسيان مبكراً.

## مقارنة مع raise NotImplementedError
في درس تعدد الأشكال كتبنا \`raise NotImplementedError\` في دالة الأب. هذا يعمل، لكن الخطأ يظهر فقط عند استدعاء الدالة، وقد يكون ذلك بعد ساعات من التشغيل. \`ABC\` تكتشفه فوراً.

## الدوال العادية في الصنف المجرد
الصنف المجرد يمكن أن يحتوي دوالاً كاملة تعتمد على المجردة (مثل \`describe\` أعلاه): الأب يحدد **الخطوات العامة**، والأبناء يملؤون التفاصيل.

## متى تستخدمه؟
- عندما تكتب إطاراً أو مكتبة وتريد إجبار المستخدمين على تنفيذ دوال معينة.
- عندما يكون لديك عدة تنفيذات لنفس المفهوم (مصادر بيانات: ملف، قاعدة بيانات، API).

## Duck typing أم ABC؟
في Python كثيراً ما تكفي duck typing. استخدم ABC عندما يكون **وجود العقد بوضوح** مهماً، أو عندما تكون الأخطاء الناتجة عن دالة ناقصة مكلفة.

## تمرين
أنشئ صنفاً مجرداً \`Notifier\` بدالة مجردة \`send(message)\` ودالة عادية \`notify_all(users, message)\`، ثم \`EmailNotifier\` و \`SmsNotifier\`. جرّب إنشاء صنف ابن لا ينفذ \`send\` ولاحظ الخطأ.
`,
    },
    'py-oop-7': {
      content: md`
# دوال الصنف والدوال الساكنة

الدوال العادية في الصنف (instance methods) تعمل على **كائن محدد** عبر \`self\`. لكن بعض الدوال تخص **الصنف كله**، أو لا تحتاج أياً منهما.

## 1) دالة الكائن (الافتراضية)
\`\`\`python
def describe(self):
    return f"بيتزا {self.size}"
\`\`\`
تحتاج كائناً، وتصل لخصائصه.

## 2) @classmethod: تعمل على الصنف
تستقبل \`cls\` (الصنف نفسه) بدل \`self\`. أشهر استخدام: **طرق إنشاء بديلة** (factory methods):
\`\`\`python
class Date:
    def __init__(self, year, month, day):
        self.year, self.month, self.day = year, month, day

    @classmethod
    def from_string(cls, text):        # "2026-03-15"
        y, m, d = map(int, text.split("-"))
        return cls(y, m, d)

d = Date.from_string("2026-03-15")
\`\`\`
لماذا \`cls(...)\` وليس \`Date(...)\`؟ لأن صنفاً يرث من \`Date\` سيحصل على كائن من **نوعه هو** عند استدعاء \`from_string\`.

استخدام آخر: الوصول لخصائص الصنف المشتركة (مثل عدّاد الكائنات المنشأة).

## 3) @staticmethod: دالة عادية داخل الصنف
لا تستقبل \`self\` ولا \`cls\`. نضعها في الصنف لأنها **مرتبطة به منطقياً**:
\`\`\`python
class Date:
    @staticmethod
    def is_leap(year):
        return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
\`\`\`

## كيف تختار؟
| تحتاج | استخدم |
|---|---|
| بيانات كائن محدد | دالة عادية (self) |
| إنشاء كائن بطريقة أخرى، أو بيانات الصنف | @classmethod (cls) |
| لا تحتاج أياً منهما لكنها تخص الصنف | @staticmethod |

إذا لم تكن الدالة مرتبطة بالصنف أصلاً، فالأفضل أن تكون دالة عادية في الوحدة خارج الصنف.

## خصائص الصنف بحذر
\`\`\`python
class Pizza:
    count = 0
    def __init__(self):
        Pizza.count += 1     # عدّل عبر الصنف
\`\`\`
\`self.count += 1\` لا تعدّل خاصية الصنف، بل **تنشئ خاصية جديدة على الكائن** تخفي خاصية الصنف. خطأ شائع جداً.

## تمرين
أنشئ صنف \`User\` بـ classmethod \`from_dict(data)\`، و staticmethod \`is_valid_email(email)\`، وخاصية صنف تعدّ المستخدمين المنشأين.
`,
    },
    'py-oop-8': {
      content: md`
# Dataclasses

كثير من الأصناف هدفها الأساسي **حمل البيانات**: منتج، نقطة، طلب. كتابة \`__init__\` و \`__repr__\` و \`__eq__\` لكل منها مملّ ومعرّض للأخطاء. \`@dataclass\` تولّدها تلقائياً من تعريف الحقول.

\`\`\`python
from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float
    quantity: int = 0
\`\`\`
يولّد تلقائياً:
- \`__init__(self, name, price, quantity=0)\`
- \`__repr__\`: \`Product(name='قلم', price=1.5, quantity=0)\`
- \`__eq__\`: مقارنة الحقول.

أنواع الحقول (\`: str\`) مطلوبة لكي تتعرف dataclass على الحقل، لكن Python **لا تتحقق منها** عند التشغيل؛ هي توثيق وأداة لمحررات الكود.

## القيم الافتراضية القابلة للتعديل
\`\`\`python
from dataclasses import field

@dataclass
class Order:
    items: list = []                           # ❌ ValueError
    items: list = field(default_factory=list)  # ✅ قائمة جديدة لكل كائن
\`\`\`
لو سُمح بـ \`[]\` لتشاركت كل الطلبات نفس القائمة. dataclass تمنع هذا الخطأ صراحة.

## خيارات مفيدة
| الخيار | التأثير |
|---|---|
| \`@dataclass(frozen=True)\` | الكائن غير قابل للتعديل، ويصلح مفتاحاً في قاموس |
| \`@dataclass(order=True)\` | يولّد \`<\` و \`>\` للمقارنة والترتيب حسب الحقول بالترتيب |
| \`field(repr=False)\` | إخفاء حقل من التمثيل النصي (مثل كلمة مرور) |

## __post_init__ للتحقق
\`\`\`python
def __post_init__(self):
    if self.price < 0:
        raise ValueError("السعر لا يمكن أن يكون سالباً")
\`\`\`
تُستدعى بعد \`__init__\` المولّد مباشرة.

## إضافة دوال
dataclass صنف عادي، يمكنك إضافة دوال وخصائص:
\`\`\`python
@property
def total(self):
    return self.price * self.quantity
\`\`\`

## dataclass أم namedtuple أم dict؟
| الأداة | متى |
|---|---|
| dict | بيانات مؤقتة بسيطة أو قادمة من JSON |
| namedtuple | سجل صغير ثابت خفيف |
| dataclass | بنية بيانات حقيقية في برنامجك، مع دوال أو تحقق |

## تمرين
أنشئ dataclass باسم \`Book\` (العنوان، المؤلف، السنة، تقييمات كقائمة) مع خاصية محسوبة للتقييم المتوسط، وتحقق في \`__post_init__\` أن السنة منطقية، ورتّب قائمة كتب حسب السنة.
`,
    },
    'py-oop-9': {
      title: 'التركيب مقابل الوراثة (Composition)',
      description: 'بناء الكائنات من كائنات أخرى، ومتى تختار التركيب بدل الوراثة',
      content: md`
# التركيب مقابل الوراثة

الوراثة علاقة "**هو نوع من**" (is-a): الكلب حيوان. لكن كثيراً من العلاقات من نوع "**يحتوي على**" (has-a): السيارة **تحتوي** محركاً، والطلب **يحتوي** منتجات. هذه علاقة **تركيب (composition)**: الكائن يحمل كائنات أخرى كخصائص ويستخدمها.

\`\`\`python
class Engine:
    def start(self):
        return "المحرك يعمل"

class Car:
    def __init__(self):
        self.engine = Engine()     # السيارة تحتوي محركاً

    def start(self):
        return self.engine.start()  # تفويض العمل للمحرك
\`\`\`

## لماذا لا نجعل Car ترث من Engine؟
لأن السيارة **ليست** محركاً. لو ورثت منه لأصبح لها كل دوال المحرك كأنها دوالها (\`car.change_oil_filter_gasket()\`)، ولتعذر استبدال المحرك بنوع آخر.

## مشكلة شائعة مع الوراثة
لنفترض أصناف \`Bird\` و \`Fish\`، ثم احتجت \`FlyingFish\` و \`Penguin\` (طائر لا يطير). شجرة الوراثة تبدأ بالانهيار. مع التركيب تبني الكائن من **قدرات**:
\`\`\`python
class Walk: ...
class Swim: ...

class Animal:
    def __init__(self, name, movements):
        self.name = name
        self.movements = movements   # قائمة كائنات

penguin = Animal("بطريق", [Walk(), Swim()])
\`\`\`
القدرات قطع منفصلة تُركّب حسب الحاجة.

## ميزة الاستبدال
\`\`\`python
class PdfExporter:
    def export(self, data): return "PDF"

class CsvExporter:
    def export(self, data): return "CSV"

class Report:
    def __init__(self, exporter):
        self.exporter = exporter      # أي كائن فيه export()

Report(PdfExporter())
Report(CsvExporter())
\`\`\`
يمكنك تغيير السلوك عند الإنشاء أو حتى أثناء التشغيل، ويسهل الاختبار بتمرير كائن تجريبي بسيط بدل كائن حقيقي يرسل بريداً أو يتصل بقاعدة بيانات. هذا الأسلوب يسمى **حقن الاعتماديات** (dependency injection).

## القاعدة العملية
"**فضّل التركيب على الوراثة**" عندما:
- تكون العلاقة "يحتوي" أو "يستخدم".
- تريد تغيير جزء من السلوك بسهولة.
- تجد نفسك تنشئ أصنافاً وراثية لكل تركيبة ممكنة.

واستخدم الوراثة عندما تكون العلاقة "نوع من" حقيقية ومستقرة، وتريد تعدد الأشكال عبر واجهة مشتركة.

## تمرين
صمم \`Order\` يحتوي قائمة \`OrderItem\` (منتج وكمية)، وكائن \`DiscountPolicy\` قابلاً للتبديل (بدون خصم، نسبة مئوية، مبلغ ثابت). احسب الإجمالي بعد الخصم دون أي وراثة بين \`Order\` وبقية الأصناف.
`,
      codeExample: md`
from dataclasses import dataclass, field

@dataclass
class Product:
    name: str
    price: float

@dataclass
class OrderItem:
    product: Product
    quantity: int

    @property
    def subtotal(self):
        return self.product.price * self.quantity

# سياسات خصم قابلة للتبديل (duck typing: كلها فيها apply)
class NoDiscount:
    def apply(self, total):
        return total

class PercentDiscount:
    def __init__(self, percent):
        self.percent = percent
    def apply(self, total):
        return total * (1 - self.percent / 100)

class FixedDiscount:
    def __init__(self, amount):
        self.amount = amount
    def apply(self, total):
        return max(0, total - self.amount)

@dataclass
class Order:
    items: list = field(default_factory=list)       # Order يحتوي عناصر
    discount: object = field(default_factory=NoDiscount)  # ويحتوي سياسة خصم

    def add(self, product, quantity=1):
        self.items.append(OrderItem(product, quantity))

    def total(self):
        raw = sum(item.subtotal for item in self.items)
        return round(self.discount.apply(raw), 2)

coffee = Product("قهوة", 4.5)
cake = Product("كعكة", 6.0)

order = Order()
order.add(coffee, 2)
order.add(cake)
print("بدون خصم:", order.total())          # 15.0

order.discount = PercentDiscount(10)       # تبديل السلوك أثناء التشغيل
print("خصم 10%:", order.total())           # 13.5

order.discount = FixedDiscount(5)
print("خصم 5:", order.total())             # 10.0
`,
      quiz: {
        question: 'أي علاقة تناسب التركيب (composition) أكثر من الوراثة؟',
        options: ['القطة حيوان', 'السيارة تحتوي محركاً', 'المدير موظف', 'المربع شكل'],
        correctAnswer: 1,
        explanation: 'السيارة ليست نوعاً من المحرك بل تحتوي محركاً؛ هذه علاقة has-a تناسب التركيب.',
      },
    },
    'py-oop-10': {
      content: md`
# أنماط التصميم الأساسية (Design Patterns)

نمط التصميم هو **حل مجرب لمشكلة تتكرر** في تصميم البرامج. ليس كوداً جاهزاً تنسخه، بل فكرة لها اسم يفهمه المبرمجون: عندما تقول "استخدمت Strategy هنا" يفهم زميلك البنية فوراً.

> تحذير: الأنماط أدوات وليست أهدافاً. لا تضف نمطاً لأن اسمه جميل؛ أضفه عندما تشعر بالمشكلة التي يحلها.

## 1) Factory: إخفاء طريقة الإنشاء
دالة أو صنف مسؤول عن **إنشاء الكائن المناسب** حسب مدخل:
\`\`\`python
def create_notifier(kind):
    notifiers = {"email": EmailNotifier, "sms": SmsNotifier}
    return notifiers[kind]()
\`\`\`
بقية الكود لا يحتاج أن يعرف كل الأصناف الموجودة.

## 2) Strategy: خوارزمية قابلة للتبديل
رأيته في درس التركيب (سياسات الخصم). في Python، لأن الدوال كائنات، كثيراً ما تكون الاستراتيجية **مجرد دالة** تُمرَّر:
\`\`\`python
from collections import namedtuple
Product = namedtuple("Product", "name price")
products = [Product("قلم", 2.0), Product("دفتر", 1.5)]
sorted(products, key=lambda p: p.price)   # key استراتيجية ترتيب
\`\`\`

## 3) Observer: إشعار المهتمين
كائن يحتفظ بقائمة مستمعين ويخطرهم عند حدوث شيء (مثل نظام الأحداث في الواجهات):
\`\`\`python
class EventBus:
    def __init__(self):
        self.listeners = []
    def subscribe(self, fn):
        self.listeners.append(fn)
    def publish(self, event):
        for fn in self.listeners:
            fn(event)
\`\`\`
المرسل لا يعرف من يستمع، فيمكن إضافة مستمعين جدد دون تعديله.

## 4) Singleton: نسخة واحدة فقط
يضمن وجود كائن واحد من الصنف (مثل اتصال إعدادات). في Python **الوحدة (module) نفسها singleton طبيعي**: تُحمَّل مرة واحدة مهما استوردتها. لذلك غالباً يكفي متغير على مستوى الوحدة بدل صنف معقد. Singleton بالأصناف يصعّب الاختبار لأنه حالة عامة مخفية، فاستخدمه نادراً.

## 5) Decorator (النمط)
تغليف كائن بكائن آخر يضيف سلوكاً بنفس الواجهة. لا تخلطه مع ميزة \`@decorator\` في Python (ستتعلمها في الدورة المتقدمة)؛ الفكرة متشابهة لكنها على مستوى الدوال.

## ملخص
| النمط | يحل مشكلة |
|---|---|
| Factory | منطق إنشاء متكرر أو معقد |
| Strategy | سلوك يتغير حسب الحالة |
| Observer | إخطار عدة أجزاء بحدث دون ربطها ببعض |
| Singleton | مورد واحد مشترك (استخدمه بحذر) |

## تمرين
ابنِ نظام إشعارات: Factory ينشئ نوع الإشعار حسب تفضيل المستخدم، و EventBus يرسل حدث "طلب جديد" إلى مستمعين (تسجيل في سجل، إشعار للمستخدم، تحديث المخزون).
`,
    },
  },
  newLessons: [
    {
      id: 'py-oop-project',
      title: 'مشروع: نظام إدارة مكتبة',
      description: 'تصميم أصناف متعاونة بالتغليف والتركيب والأخطاء المخصصة و dataclasses',
      xpReward: 160,
      language: 'python',
      content: md`
# مشروع: نظام إدارة مكتبة

في هذا المشروع تصمم برنامجاً من عدة أصناف تتعاون، وهو الجزء الأصعب والأهم في البرمجة الكائنية: **تحديد مسؤولية كل صنف**.

## المتطلبات
- إضافة كتب (عنوان، مؤلف، رقم ISBN) وعدة نسخ من الكتاب.
- تسجيل أعضاء.
- استعارة نسخة وإرجاعها، مع حد أقصى 3 كتب لكل عضو.
- منع استعارة كتاب لا توجد منه نسخة متاحة.
- عرض الكتب المتأخرة.

## تحديد الأصناف
اكتب الأسماء في المتطلبات وفكّر: أيها "أشياء" لها بيانات وسلوك؟
| الصنف | البيانات | المسؤولية |
|---|---|---|
| \`Book\` | العنوان، المؤلف، ISBN | وصف الكتاب فقط (dataclass) |
| \`Member\` | الاسم، الكتب المستعارة | معرفة هل يستطيع الاستعارة |
| \`Loan\` | الكتاب، العضو، تاريخ الإرجاع | هل الإعارة متأخرة؟ |
| \`Library\` | المخزون، الأعضاء، الإعارات | تنسيق العمليات وتطبيق القواعد |

لاحظ التركيب: \`Library\` **تحتوي** كتباً وأعضاء وإعارات، ولا ترث من أي منها.

## أخطاء مخصصة
\`\`\`python
class LibraryError(Exception): ...
class NotAvailableError(LibraryError): ...
class LimitReachedError(LibraryError): ...
\`\`\`
وراثة الأخطاء من صنف أب واحد تسمح بالتقاطها كلها معاً \`except LibraryError\` أو كلٌّ على حدة.

## قرارات تصميم في الكود
- المخزون قاموس \`{isbn: عدد النسخ المتاحة}\`: البحث بالـ ISBN مباشر.
- التاريخ يُمرَّر إلى \`borrow\` و \`overdue\` بدل استدعاء \`date.today()\` داخلها: هذا يجعل الاختبار ممكناً بتواريخ ثابتة.
- \`Member.can_borrow\` خاصية محسوبة، فالقاعدة في مكان واحد.
- \`Library\` هي الوحيدة التي تعدّل المخزون؛ لا أحد يغيّر \`_stock\` من الخارج (تغليف).

## اختبر تصميمك بالأسئلة
- لو أضفنا "حجز كتاب"، أي صنف يتغير؟
- لو تغير الحد الأقصى للاستعارة للأعضاء المميزين؟ (فكر: خاصية في Member، أو صنف PremiumMember يرث منه.)

## أفكار للتوسعة
- غرامة تأخير لكل يوم.
- حفظ البيانات في JSON (من دورة هياكل البيانات).
- البحث عن الكتب بالمؤلف.

## ما الذي أتقنته؟
تحويل متطلبات مكتوبة إلى أصناف بمسؤوليات واضحة، واستخدام التغليف والتركيب والأخطاء المخصصة و dataclasses معاً. الدورة التالية "Python المتقدم" تكمل بالـ decorators والمولّدات والاختبارات والبرمجة غير المتزامنة.
`,
      codeExample: md`
from dataclasses import dataclass, field
from datetime import date, timedelta

class LibraryError(Exception):
    pass

class NotAvailableError(LibraryError):
    pass

class LimitReachedError(LibraryError):
    pass

@dataclass(frozen=True)
class Book:
    isbn: str
    title: str
    author: str

@dataclass
class Member:
    name: str
    max_books: int = 3
    loans: list = field(default_factory=list)

    @property
    def can_borrow(self):
        return len(self.loans) < self.max_books

@dataclass
class Loan:
    book: Book
    member: Member
    due: date

    def is_overdue(self, today):
        return today > self.due

class Library:
    LOAN_DAYS = 14

    def __init__(self):
        self._books = {}
        self._stock = {}
        self._loans = []

    def add_book(self, book, copies=1):
        self._books[book.isbn] = book
        self._stock[book.isbn] = self._stock.get(book.isbn, 0) + copies

    def available(self, isbn):
        return self._stock.get(isbn, 0)

    def borrow(self, member, isbn, today):
        if not member.can_borrow:
            raise LimitReachedError(f"{member.name} وصل للحد الأقصى")
        if self.available(isbn) == 0:
            raise NotAvailableError("لا توجد نسخة متاحة")
        loan = Loan(self._books[isbn], member, today + timedelta(days=self.LOAN_DAYS))
        self._stock[isbn] -= 1
        member.loans.append(loan)
        self._loans.append(loan)
        return loan

    def give_back(self, loan):
        loan.member.loans.remove(loan)
        self._loans.remove(loan)
        self._stock[loan.book.isbn] += 1

    def overdue(self, today):
        return [loan for loan in self._loans if loan.is_overdue(today)]

library = Library()
library.add_book(Book("111", "مقدمة ابن خلدون", "ابن خلدون"), copies=1)
library.add_book(Book("222", "تعلم Python", "منى"), copies=2)

sara = Member("سارة")
start = date(2026, 3, 1)

first = library.borrow(sara, "111", start)
print("استعارت:", first.book.title, "حتى", first.due)

try:
    library.borrow(Member("علي"), "111", start)
except LibraryError as error:
    print("مرفوض:", error)

print("متأخرة بعد 20 يوماً:", [l.book.title for l in library.overdue(start + timedelta(days=20))])
library.give_back(first)
print("النسخ المتاحة الآن:", library.available("111"))
`,
      quiz: {
        question: 'لماذا نمرر تاريخ اليوم إلى borrow و overdue بدلاً من استدعاء date.today() داخلها؟',
        options: [
          'لأن date.today() غير موجودة',
          'لكي يمكن اختبار الدوال بتواريخ ثابتة ومعروفة',
          'لأنه أسرع',
          'لأن dataclass تمنع ذلك',
        ],
        correctAnswer: 1,
        explanation: 'الدالة التي تعتمد على قيمة تُمرَّر لها يمكن اختبارها بأي تاريخ، أما date.today() فتتغير كل يوم.',
      },
    },
  ],
};

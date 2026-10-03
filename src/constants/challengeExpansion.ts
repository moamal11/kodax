/**
 * تحديات التوسعة — لسد فجوات التحديات في الدورات التي كانت بلا تحديات أو بتحديات قليلة.
 *
 * قواعد:
 *  - كل تحدٍ مرتبط بدرس محدد (afterLessonId) ويطبّق ما شُرح فيه.
 *  - XP حسب الصعوبة: سهل 15–30، متوسط 30–60، صعب 60–120 (لا تتغير قيم التحديات القديمة).
 *  - التحقق على السيرفر (verify-challenge) بنفس الاختبارات، منها اختبارات مخفية.
 *  - الحل النموذجي لا يُشحن داخل التطبيق (babel-plugin-strip-challenge-solutions) ويُعرض من السيرفر فقط.
 *  - الوصول يتبع دورة التحدي: المبتدئة مفتوحة، والباقي يُفتح بالتقدم في المسار.
 */
import type { Challenge } from './courseData';

type Spec = Omit<Challenge, 'icon' | 'isLocked' | 'category'> & {
  icon?: string;
  category?: string;
  courseId: string;
  afterLessonId: string;
};

const X = (c: Spec): Challenge => ({
  icon: 'code-slash',
  isLocked: false,
  category: c.courseId,
  ...c,
});

// ============================================================================
// Python: البرمجة الكائنية (py-oop)
// ============================================================================
const PY_OOP: Challenge[] = [
  X({
    id: 'pyoop-ch-001',
    courseId: 'py-oop',
    afterLessonId: 'py-oop-3',
    title: 'حساب بنكي مغلّف',
    description:
      'أنشئ صنف BankAccount يخزن الرصيد في خاصية خاصة __balance. الدالة deposit(amount) تضيف مبلغاً موجباً فقط، وwithdraw(amount) تسحب إذا كان الرصيد يكفي وتُرجع True، وإلا تُرجع False بدون تغيير. الخاصية balance (property) تُرجع الرصيد للقراءة فقط.',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    starterCode: `class BankAccount:
    def __init__(self, owner, balance=0):
        # خزّن الرصيد في self.__balance
        pass

    def deposit(self, amount):
        pass

    def withdraw(self, amount):
        pass

    @property
    def balance(self):
        pass`,
    solution: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.__balance = balance

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount

    def withdraw(self, amount):
        if 0 < amount <= self.__balance:
            self.__balance -= amount
            return True
        return False

    @property
    def balance(self):
        return self.__balance`,
    hints: [
      'الاسم الذي يبدأ بشرطتين __balance يصبح "خاصاً" داخل الصنف',
      'تحقق من amount > 0 في deposit، ومن amount <= الرصيد في withdraw',
      '@property تجعل balance تُقرأ مثل خاصية: a.balance بدون أقواس',
    ],
    testCases: [
      { input: 'a = BankAccount("Ali", 100)\na.deposit(50)\na.balance', expectedOutput: '150', description: 'إيداع 50' },
      { input: 'a = BankAccount("Ali", 100)\na.withdraw(30)', expectedOutput: 'True', description: 'سحب ممكن' },
      { input: 'a = BankAccount("Ali", 100)\na.withdraw(500)\na.balance', expectedOutput: '100', description: 'سحب أكبر من الرصيد لا يغيّر شيئاً' },
      { input: 'a = BankAccount("Sara")\na.deposit(-20)\na.balance', expectedOutput: '0', description: 'إيداع سالب يُرفض', hidden: true },
      { input: 'a = BankAccount("Sara", 10)\nhasattr(a, "_BankAccount__balance") and not hasattr(a, "balance_value")', expectedOutput: 'True', description: 'الرصيد مخزّن كخاصية خاصة', hidden: true },
    ],
  }),
  X({
    id: 'pyoop-ch-002',
    courseId: 'py-oop',
    afterLessonId: 'py-oop-7',
    title: 'تحويل درجات الحرارة بدوال الصنف',
    description:
      'أنشئ صنف Temperature يحمل celsius. أضف classmethod اسمها from_fahrenheit(f) تُنشئ كائناً من فهرنهايت، وstaticmethod اسمها is_freezing(c) تُرجع True إذا كانت الحرارة ≤ 0. الدالة to_fahrenheit() تُرجع القيمة مقربة لرقم عشري واحد.',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    starterCode: `class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    # أضف from_fahrenheit (classmethod)

    # أضف is_freezing (staticmethod)

    def to_fahrenheit(self):
        pass`,
    solution: `class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, f):
        return cls(round((f - 32) * 5 / 9, 1))

    @staticmethod
    def is_freezing(c):
        return c <= 0

    def to_fahrenheit(self):
        return round(self.celsius * 9 / 5 + 32, 1)`,
    hints: [
      'classmethod تستقبل cls وتُرجع cls(...) لإنشاء كائن جديد',
      'staticmethod لا تستقبل self ولا cls',
      'F = C × 9/5 + 32 و C = (F − 32) × 5/9',
    ],
    testCases: [
      { input: 'Temperature(100).to_fahrenheit()', expectedOutput: '212.0', description: '100°C' },
      { input: 'Temperature.from_fahrenheit(212).celsius', expectedOutput: '100.0', description: 'من فهرنهايت' },
      { input: 'Temperature.is_freezing(-3)', expectedOutput: 'True', description: 'تحت الصفر' },
      { input: 'isinstance(Temperature.from_fahrenheit(50), Temperature) and Temperature.from_fahrenheit(50).celsius', expectedOutput: '10.0', description: 'classmethod تُرجع كائناً', hidden: true },
      { input: 'Temperature.is_freezing(0.5)', expectedOutput: 'False', description: 'فوق الصفر', hidden: true },
      { input: 'Temperature(0).to_fahrenheit()', expectedOutput: '32.0', description: 'نقطة التجمد', hidden: true },
      { input: 'isinstance(Temperature.from_fahrenheit(50), str)', expectedOutput: 'False', description: 'النوع ليس نصاً', hidden: true },
      { input: 'Temperature(-40).to_fahrenheit()', expectedOutput: '-40.0', description: 'نقطة التساوي', hidden: true },
    ],
  }),
  X({
    id: 'pyoop-ch-003',
    courseId: 'py-oop',
    afterLessonId: 'py-oop-4',
    title: 'مساحات الأشكال بتعدد الأشكال',
    description:
      'لديك صنف أساسي Shape فيه area(). أنشئ Rectangle(w, h) وCircle(r) يرثان منه ويعيدان تعريف area(). ثم اكتب total_area(shapes) تُرجع مجموع المساحات مقرباً لرقمين عشريين (استخدم 3.14159 لقيمة π).',
    difficulty: 'medium',
    points: 35,
    language: 'Python',
    starterCode: `class Shape:
    def area(self):
        raise NotImplementedError


class Rectangle(Shape):
    pass


class Circle(Shape):
    pass


def total_area(shapes):
    pass`,
    solution: `class Shape:
    def area(self):
        raise NotImplementedError


class Rectangle(Shape):
    def __init__(self, w, h):
        self.w = w
        self.h = h

    def area(self):
        return self.w * self.h


class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):
        return 3.14159 * self.r ** 2


def total_area(shapes):
    return round(sum(s.area() for s in shapes), 2)`,
    hints: [
      'كل صنف فرعي يعرّف area() بطريقته',
      'total_area لا تحتاج معرفة نوع الشكل: تستدعي s.area() فقط',
      'round(x, 2) للتقريب',
    ],
    testCases: [
      { input: 'total_area([Rectangle(2, 3)])', expectedOutput: '6', description: 'مستطيل' },
      { input: 'total_area([Circle(1)])', expectedOutput: '3.14', description: 'دائرة' },
      { input: 'total_area([Rectangle(2, 3), Circle(2), Rectangle(1, 1)])', expectedOutput: '19.57', description: 'أشكال مختلطة' },
      { input: 'total_area([])', expectedOutput: '0', description: 'قائمة فارغة', hidden: true },
      { input: 'isinstance(Circle(1), Shape) and isinstance(Rectangle(1, 1), Shape)', expectedOutput: 'True', description: 'الوراثة من Shape', hidden: true },
      { input: 'isinstance(Rectangle(1, 1), Circle)', expectedOutput: 'False', description: 'أنواع مستقلة', hidden: true },
    ],
  }),
  X({
    id: 'pyoop-ch-004',
    courseId: 'py-oop',
    afterLessonId: 'py-oop-5',
    title: 'متجه بالدوال السحرية',
    description:
      'أنشئ صنف Vector(x, y) يدعم: الجمع v1 + v2 (__add__)، الضرب بعدد v * 3 (__mul__)، المساواة (__eq__)، الطول len-like عبر abs(v) يُرجع الطول مقرباً لرقمين، و__repr__ بالشكل Vector(x, y).',
    difficulty: 'medium',
    points: 40,
    language: 'Python',
    starterCode: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    # __add__, __mul__, __eq__, __abs__, __repr__`,
    solution: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, k):
        return Vector(self.x * k, self.y * k)

    def __eq__(self, other):
        return isinstance(other, Vector) and self.x == other.x and self.y == other.y

    def __abs__(self):
        return round((self.x ** 2 + self.y ** 2) ** 0.5, 2)

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"`,
    hints: [
      '__add__ تستقبل other وتُرجع Vector جديداً',
      '__repr__ يحدد ما يُطبع عند print(v)',
      'abs(v) يستدعي __abs__',
    ],
    testCases: [
      { input: 'Vector(1, 2) + Vector(3, 4)', expectedOutput: 'Vector(4, 6)', description: 'الجمع' },
      { input: 'Vector(1, -2) * 3', expectedOutput: 'Vector(3, -6)', description: 'الضرب بعدد' },
      { input: 'abs(Vector(3, 4))', expectedOutput: '5.0', description: 'الطول' },
      { input: 'abs(Vector(1, 1))', expectedOutput: '1.41', description: 'طول مقرب', hidden: true },
      { input: 'Vector(2, 2) == Vector(2, 2)', expectedOutput: 'True', description: 'المساواة', hidden: true },
      { input: 'Vector(2, 2) == Vector(2, 3)', expectedOutput: 'False', description: 'عدم المساواة', hidden: true },
    ],
  }),
  X({
    id: 'pyoop-ch-005',
    courseId: 'py-oop',
    afterLessonId: 'py-oop-9',
    title: 'سيارة بالتركيب (Composition)',
    description:
      'بدل الوراثة استخدم التركيب: صنف Engine(hp) فيه start() تُرجع "Engine {hp}hp started". صنف Car(model, engine) يحتوي محركاً (has-a) ودالة start() تُرجع "{model}: " متبوعة برسالة المحرك. أضف upgrade_engine(engine) لاستبدال المحرك.',
    difficulty: 'medium',
    points: 35,
    language: 'Python',
    starterCode: `class Engine:
    def __init__(self, hp):
        self.hp = hp

    def start(self):
        pass


class Car:
    def __init__(self, model, engine):
        pass

    def start(self):
        pass

    def upgrade_engine(self, engine):
        pass`,
    solution: `class Engine:
    def __init__(self, hp):
        self.hp = hp

    def start(self):
        return f"Engine {self.hp}hp started"


class Car:
    def __init__(self, model, engine):
        self.model = model
        self.engine = engine

    def start(self):
        return f"{self.model}: {self.engine.start()}"

    def upgrade_engine(self, engine):
        self.engine = engine`,
    hints: [
      'Car تحتفظ بكائن Engine في self.engine',
      'Car.start() تفوّض العمل إلى self.engine.start()',
      'التركيب يسمح باستبدال المحرك أثناء التشغيل',
    ],
    testCases: [
      { input: 'Car("Camry", Engine(200)).start()', expectedOutput: 'Camry: Engine 200hp started', description: 'تشغيل' },
      { input: 'c = Car("Golf", Engine(110))\nc.upgrade_engine(Engine(150))\nc.start()', expectedOutput: 'Golf: Engine 150hp started', description: 'استبدال المحرك' },
      { input: 'c = Car("Kia", Engine(90))\n(issubclass(Car, Engine), isinstance(c.engine, Engine))', expectedOutput: '(False, True)', description: 'Car تحتوي محركاً ولا ترث منه', hidden: true },
      { input: 'Car("Niro", Engine(140)).start()', expectedOutput: 'Niro: Engine 140hp started', description: 'سيارة أخرى', hidden: true },
    ],
  }),
  X({
    id: 'pyoop-ch-006',
    courseId: 'py-oop',
    afterLessonId: 'py-oop-project',
    title: 'نظام إعارة مكتبة',
    description:
      'أنشئ صنف Library: add_book(title, copies)، borrow(member, title) تُرجع True إذا توفرت نسخة ولم يستعر العضو نفس الكتاب، وreturn_book(member, title) تُرجع True إذا كان العضو مستعيراً له. available(title) تُرجع عدد النسخ المتاحة، وborrowed_by(member) تُرجع قائمة كتبه مرتبة أبجدياً. الكتاب غير الموجود: borrow تُرجع False وavailable تُرجع 0.',
    difficulty: 'hard',
    points: 80,
    language: 'Python',
    starterCode: `class Library:
    def __init__(self):
        pass

    def add_book(self, title, copies=1):
        pass

    def borrow(self, member, title):
        pass

    def return_book(self, member, title):
        pass

    def available(self, title):
        pass

    def borrowed_by(self, member):
        pass`,
    solution: `class Library:
    def __init__(self):
        self.copies = {}
        self.loans = {}

    def add_book(self, title, copies=1):
        self.copies[title] = self.copies.get(title, 0) + copies

    def borrow(self, member, title):
        books = self.loans.setdefault(member, set())
        if self.copies.get(title, 0) <= 0 or title in books:
            return False
        self.copies[title] -= 1
        books.add(title)
        return True

    def return_book(self, member, title):
        books = self.loans.get(member, set())
        if title not in books:
            return False
        books.remove(title)
        self.copies[title] += 1
        return True

    def available(self, title):
        return self.copies.get(title, 0)

    def borrowed_by(self, member):
        return sorted(self.loans.get(member, set()))`,
    hints: [
      'قاموس للنسخ المتاحة {عنوان: عدد} وقاموس للإعارات {عضو: مجموعة كتب}',
      'تحقق من الحالات: كتاب غير موجود، لا نسخ، العضو استعاره مسبقاً',
      'sorted() تُرجع قائمة مرتبة من المجموعة',
    ],
    testCases: [
      { input: 'lib = Library()\nlib.add_book("Python", 2)\nlib.borrow("ali", "Python")', expectedOutput: 'True', description: 'إعارة متاحة' },
      { input: 'lib = Library()\nlib.add_book("Python", 1)\nlib.borrow("ali", "Python")\nlib.borrow("sara", "Python")', expectedOutput: 'False', description: 'لا نسخ متبقية' },
      { input: 'lib = Library()\nlib.add_book("A", 3)\nlib.borrow("ali", "A")\nlib.borrow("ali", "A")', expectedOutput: 'False', description: 'لا يستعير نفس الكتاب مرتين' },
      { input: 'lib = Library()\nlib.add_book("B", 1)\nlib.add_book("A", 1)\nlib.borrow("ali", "B")\nlib.borrow("ali", "A")\nlib.borrowed_by("ali")', expectedOutput: '["A", "B"]', description: 'كتب العضو مرتبة', hidden: true },
      { input: 'lib = Library()\nlib.add_book("A", 1)\nlib.borrow("ali", "A")\nlib.return_book("ali", "A")\nlib.available("A")', expectedOutput: '1', description: 'الإرجاع يعيد النسخة', hidden: true },
      { input: 'lib = Library()\n(lib.borrow("ali", "X"), lib.return_book("ali", "X"), lib.available("X"))', expectedOutput: '(False, False, 0)', description: 'كتاب غير موجود', hidden: true },
    ],
  }),
];

// ============================================================================
// Python المتقدم (py-advanced)
// ============================================================================
const PY_ADV: Challenge[] = [
  X({
    id: 'pyadv-ch-001',
    courseId: 'py-advanced',
    afterLessonId: 'py-adv-7',
    title: 'تركيب الدوال (compose)',
    description:
      'اكتب compose(*funcs) تُرجع دالة جديدة تطبّق الدوال من اليمين إلى اليسار: compose(f, g)(x) = f(g(x)). بدون دوال تُرجع دالة الهوية.',
    difficulty: 'easy',
    points: 25,
    language: 'Python',
    starterCode: `def compose(*funcs):
    pass`,
    solution: `def compose(*funcs):
    def composed(x):
        for f in reversed(funcs):
            x = f(x)
        return x
    return composed`,
    hints: ['الدالة الداخلية "تغلق" على funcs (closure)', 'طبّق الدوال بترتيب reversed(funcs)'],
    testCases: [
      { input: 'compose(lambda x: x + 1, lambda x: x * 2)(5)', expectedOutput: '11', description: '(5×2)+1' },
      { input: 'compose(str.upper, str.strip)("  hi ")', expectedOutput: 'HI', description: 'دوال نصية' },
      { input: 'compose()(42)', expectedOutput: '42', description: 'بدون دوال', hidden: true },
    ],
  }),
  X({
    id: 'pyadv-ch-002',
    courseId: 'py-advanced',
    afterLessonId: 'py-adv-3',
    title: 'Decorator لعدّ الاستدعاءات',
    description:
      'اكتب decorator اسمه count_calls يضيف للدالة خاصية calls تبدأ من 0 وتزيد مع كل استدعاء، ويحافظ على اسم الدالة الأصلي (functools.wraps).',
    difficulty: 'medium',
    points: 40,
    language: 'Python',
    starterCode: `import functools


def count_calls(func):
    pass`,
    solution: `import functools


def count_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper`,
    hints: ['wrapper.calls = 0 قبل الإرجاع', 'زِد wrapper.calls داخل wrapper ثم استدعِ func', '@functools.wraps(func) يحافظ على __name__'],
    testCases: [
      { input: '@count_calls\ndef add(a, b):\n    return a + b\nadd(1, 2)\nadd(3, 4)\nadd.calls', expectedOutput: '2', description: 'استدعاءان' },
      { input: '@count_calls\ndef add(a, b):\n    return a + b\nadd(10, 5)', expectedOutput: '15', description: 'النتيجة لا تتغير' },
      { input: '@count_calls\ndef greet():\n    return "hi"\ngreet.__name__', expectedOutput: 'greet', description: 'الاسم محفوظ', hidden: true },
      { input: '@count_calls\ndef f(x=1):\n    return x\nf(x=3)\nf.calls', expectedOutput: '1', description: 'وسائط بالاسم', hidden: true },
    ],
  }),
  X({
    id: 'pyadv-ch-003',
    courseId: 'py-advanced',
    afterLessonId: 'py-adv-4',
    title: 'مولّد الدفعات (batches)',
    description: 'اكتب generator اسمه batched(items, size) يُخرج قوائم بطول size من العناصر بالترتيب، والدفعة الأخيرة قد تكون أقصر.',
    difficulty: 'easy',
    points: 25,
    language: 'Python',
    starterCode: `def batched(items, size):
    pass`,
    solution: `def batched(items, size):
    batch = []
    for item in items:
        batch.append(item)
        if len(batch) == size:
            yield batch
            batch = []
    if batch:
        yield batch`,
    hints: ['استخدم yield بدل return', 'اجمع العناصر في قائمة مؤقتة وأخرجها عند امتلائها', 'لا تنسَ الدفعة الأخيرة'],
    testCases: [
      { input: 'list(batched([1, 2, 3, 4, 5], 2))', expectedOutput: '[[1, 2], [3, 4], [5]]', description: 'دفعات من 2' },
      { input: 'list(batched("abcdef", 3))', expectedOutput: '[["a", "b", "c"], ["d", "e", "f"]]', description: 'نص' },
      { input: 'list(batched([], 4))', expectedOutput: '[]', description: 'فارغة', hidden: true },
      { input: 'import types\nisinstance(batched([1], 1), types.GeneratorType)', expectedOutput: 'True', description: 'generator فعلاً', hidden: true },
      { input: 'b = batched([1, 2, 3], 3)\nnext(b)', expectedOutput: '[1, 2, 3]', description: 'دفعة واحدة كاملة', hidden: true },
    ],
  }),
  X({
    id: 'pyadv-ch-004',
    courseId: 'py-advanced',
    afterLessonId: 'py-adv-5',
    title: 'Context Manager لقياس الوقت',
    description:
      'اكتب صنف Timer يُستخدم مع with: يسجّل في self.entered = True عند الدخول، وعند الخروج يحفظ self.elapsed (رقم ≥ 0) ويضيف اسم الاستثناء (إن حدث) إلى self.error دون أن يكتمه.',
    difficulty: 'medium',
    points: 40,
    language: 'Python',
    starterCode: `import time


class Timer:
    def __enter__(self):
        pass

    def __exit__(self, exc_type, exc, tb):
        pass`,
    solution: `import time


class Timer:
    def __init__(self):
        self.entered = False
        self.elapsed = None
        self.error = None

    def __enter__(self):
        self.entered = True
        self._start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self._start
        if exc_type is not None:
            self.error = exc_type.__name__
        return False`,
    hints: ['__enter__ يُرجع self لتستخدمه مع as', '__exit__ تستقبل نوع الاستثناء إن حدث', 'إرجاع False من __exit__ يعني: لا تكتم الاستثناء'],
    testCases: [
      { input: 'with Timer() as t:\n    pass\n(t.entered, t.elapsed >= 0, t.error)', expectedOutput: '(True, True, None)', description: 'بدون خطأ' },
      { input: 't = Timer()\ntry:\n    with t:\n        1 / 0\nexcept ZeroDivisionError:\n    pass\nt.error', expectedOutput: 'ZeroDivisionError', description: 'الخطأ مسجّل ولم يُكتم' },
      { input: 't = Timer()\ncaught = False\ntry:\n    with t:\n        raise ValueError("x")\nexcept ValueError:\n    caught = True\ncaught', expectedOutput: 'True', description: 'الاستثناء يصل للخارج', hidden: true },
    ],
  }),
  X({
    id: 'pyadv-ch-005',
    courseId: 'py-advanced',
    afterLessonId: 'py-adv-8',
    title: 'استخراج التواريخ بالتعابير النمطية',
    description: 'اكتب extract_dates(text) تُرجع قائمة بالتواريخ بصيغة YYYY-MM-DD الموجودة في النص، بشرط أن يكون الشهر 01–12 واليوم 01–31.',
    difficulty: 'medium',
    points: 35,
    language: 'Python',
    starterCode: `import re


def extract_dates(text):
    pass`,
    solution: `import re


def extract_dates(text):
    pattern = r"\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b"
    return ["-".join(m) for m in re.findall(pattern, text)]`,
    hints: ['\\d{4} لأربعة أرقام', 'الشهر: (0[1-9]|1[0-2])', 're.findall مع مجموعات تُرجع tuples'],
    testCases: [
      { input: 'extract_dates("start 2024-03-15 end 2024-12-01")', expectedOutput: '["2024-03-15", "2024-12-01"]', description: 'تاريخان' },
      { input: 'extract_dates("bad 2024-13-01 and 2024-02-30x")', expectedOutput: '[]', description: 'شهر غير صالح' },
      { input: 'extract_dates("لا توجد تواريخ")', expectedOutput: '[]', description: 'بدون تواريخ', hidden: true },
      { input: 'extract_dates("2023-01-31,2023-10-09")', expectedOutput: '["2023-01-31", "2023-10-09"]', description: 'مفصولة بفاصلة', hidden: true },
    ],
  }),
  X({
    id: 'pyadv-ch-006',
    courseId: 'py-advanced',
    afterLessonId: 'py-adv-6',
    title: 'Iterator للعد التنازلي',
    description: 'اكتب صنف Countdown(start) يمكن المرور عليه بـ for ليُخرج start ثم start-1 حتى 1. كل مرور جديد (iter) يبدأ من البداية.',
    difficulty: 'easy',
    points: 25,
    language: 'Python',
    starterCode: `class Countdown:
    def __init__(self, start):
        self.start = start

    def __iter__(self):
        pass`,
    solution: `class Countdown:
    def __init__(self, start):
        self.start = start

    def __iter__(self):
        current = self.start
        while current > 0:
            yield current
            current -= 1`,
    hints: ['__iter__ يمكن أن تكون generator باستخدام yield', 'ابدأ من self.start في كل مرة'],
    testCases: [
      { input: 'list(Countdown(3))', expectedOutput: '[3, 2, 1]', description: 'من 3' },
      { input: 'list(Countdown(0))', expectedOutput: '[]', description: 'صفر' },
      { input: 'c = Countdown(2)\n(list(c), list(c))', expectedOutput: '([2, 1], [2, 1])', description: 'يعاد من البداية', hidden: true },
      { input: 'c = Countdown(1)\nlist(c)', expectedOutput: '[1]', description: 'عنصر واحد', hidden: true },
    ],
  }),
  X({
    id: 'pyadv-ch-007',
    courseId: 'py-advanced',
    afterLessonId: 'py-adv-project',
    title: 'محلل سجلات الخادم',
    description:
      'اكتب summarize_logs(lines) لأسطر بالشكل "LEVEL message" (LEVEL من INFO/WARNING/ERROR). أرجع قاموساً فيه counts (عدد كل مستوى موجود)، وtop_error (رسالة الخطأ الأكثر تكراراً، وعند التعادل الأصغر أبجدياً، أو None). تجاهل الأسطر الفارغة أو غير الصالحة.',
    difficulty: 'hard',
    points: 75,
    language: 'Python',
    starterCode: `def summarize_logs(lines):
    pass`,
    solution: `from collections import Counter


def summarize_logs(lines):
    counts = Counter()
    errors = Counter()
    for line in lines:
        parts = line.strip().split(" ", 1)
        if len(parts) != 2 or parts[0] not in ("INFO", "WARNING", "ERROR"):
            continue
        level, message = parts
        counts[level] += 1
        if level == "ERROR":
            errors[message.strip()] += 1
    top = None
    if errors:
        top = sorted(errors.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
    return {"counts": dict(sorted(counts.items())), "top_error": top}`,
    hints: ['split(" ", 1) يفصل المستوى عن بقية الرسالة', 'Counter يسهّل العد', 'رتّب الأخطاء حسب (-العدد، الرسالة)'],
    testCases: [
      { input: 'summarize_logs(["INFO start", "ERROR db down", "ERROR db down", "WARNING slow"])', expectedOutput: '{"counts": {"ERROR": 2, "INFO": 1, "WARNING": 1}, "top_error": "db down"}', description: 'سجل عادي' },
      { input: 'summarize_logs(["INFO ok", "", "garbage"])', expectedOutput: '{"counts": {"INFO": 1}, "top_error": None}', description: 'أسطر غير صالحة' },
      { input: 'summarize_logs(["ERROR b", "ERROR a"])', expectedOutput: '{"counts": {"ERROR": 2}, "top_error": "a"}', description: 'تعادل → أبجدياً', hidden: true },
      { input: 'summarize_logs([])', expectedOutput: '{"counts": {}, "top_error": None}', description: 'فارغ', hidden: true },
    ],
  }),
];

// ============================================================================
// أساسيات الذكاء الاصطناعي (ai-basics) وتعلم الآلة (ai-ml-basics)
// ============================================================================
const AI_BASICS: Challenge[] = [
  X({
    id: 'aib-ch-001',
    courseId: 'ai-basics',
    afterLessonId: 'ai-3',
    title: 'تقطيع النص إلى كلمات',
    description: 'اكتب tokenize(text) تحوّل النص لحروف صغيرة وتُرجع قائمة الكلمات (حروف وأرقام فقط) بعد حذف علامات الترقيم.',
    difficulty: 'easy',
    points: 15,
    language: 'Python',
    starterCode: `import re


def tokenize(text):
    pass`,
    solution: `import re


def tokenize(text):
    return re.findall(r"\\w+", text.lower())`,
    hints: ['text.lower() للحروف الصغيرة', 're.findall(r"\\w+", ...) يلتقط الكلمات'],
    testCases: [
      { input: 'tokenize("Hello, World!")', expectedOutput: '["hello", "world"]', description: 'علامات ترقيم' },
      { input: 'tokenize("AI is fun. AI 2024")', expectedOutput: '["ai", "is", "fun", "ai", "2024"]', description: 'أرقام' },
      { input: 'tokenize("...")', expectedOutput: '[]', description: 'لا كلمات', hidden: true },
    ],
  }),
  X({
    id: 'aib-ch-002',
    courseId: 'ai-basics',
    afterLessonId: 'ai-3',
    title: 'حقيبة الكلمات (Bag of Words)',
    description: 'اكتب bag_of_words(sentence, vocab) تُرجع قائمة بطول vocab فيها عدد مرات ظهور كل كلمة من vocab في الجملة (بعد تحويلها لحروف صغيرة وتقسيمها بالمسافات).',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    starterCode: `def bag_of_words(sentence, vocab):
    pass`,
    solution: `def bag_of_words(sentence, vocab):
    words = sentence.lower().split()
    return [words.count(w) for w in vocab]`,
    hints: ['قسّم الجملة بـ split()', 'لكل كلمة في vocab احسب words.count(w)'],
    testCases: [
      { input: 'bag_of_words("the cat sat on the mat", ["the", "cat", "dog"])', expectedOutput: '[2, 1, 0]', description: 'تكرار' },
      { input: 'bag_of_words("AI ai Ai", ["ai"])', expectedOutput: '[3]', description: 'حالة الأحرف' },
      { input: 'bag_of_words("", ["x"])', expectedOutput: '[0]', description: 'فارغة', hidden: true },
    ],
  }),
  X({
    id: 'aib-ch-003',
    courseId: 'ai-basics',
    afterLessonId: 'ai-2',
    title: 'تطبيع الخصائص (Min-Max)',
    description: 'اكتب min_max_scale(values) تُرجع القيم بعد تحويلها للمدى 0–1 مقربة لثلاثة أرقام. إذا كانت كل القيم متساوية أرجع أصفاراً.',
    difficulty: 'medium',
    points: 30,
    language: 'Python',
    starterCode: `def min_max_scale(values):
    pass`,
    solution: `def min_max_scale(values):
    lo, hi = min(values), max(values)
    if hi == lo:
        return [0.0 for _ in values]
    return [round((v - lo) / (hi - lo), 3) for v in values]`,
    hints: ['(v − min) / (max − min)', 'انتبه للقسمة على صفر عند تساوي القيم'],
    testCases: [
      { input: 'min_max_scale([10, 20, 30])', expectedOutput: '[0.0, 0.5, 1.0]', description: 'ثلاث قيم' },
      { input: 'min_max_scale([5, 5, 5])', expectedOutput: '[0.0, 0.0, 0.0]', description: 'قيم متساوية' },
      { input: 'min_max_scale([3, 1, 2, 7])', expectedOutput: '[0.333, 0.0, 0.167, 1.0]', description: 'غير مرتبة', hidden: true },
    ],
  }),
  X({
    id: 'aib-ch-004',
    courseId: 'ai-basics',
    afterLessonId: 'ai-5',
    title: 'مصفوفة الالتباس',
    description: 'اكتب confusion_counts(actual, predicted) لتصنيف ثنائي (1 و0) تُرجع قاموساً {"tp", "fp", "tn", "fn"} بالأعداد.',
    difficulty: 'medium',
    points: 30,
    language: 'Python',
    starterCode: `def confusion_counts(actual, predicted):
    pass`,
    solution: `def confusion_counts(actual, predicted):
    c = {"tp": 0, "fp": 0, "tn": 0, "fn": 0}
    for a, p in zip(actual, predicted):
        if a == 1 and p == 1:
            c["tp"] += 1
        elif a == 0 and p == 1:
            c["fp"] += 1
        elif a == 0 and p == 0:
            c["tn"] += 1
        else:
            c["fn"] += 1
    return c`,
    hints: ['zip(actual, predicted) يمر على الأزواج', 'tp: الحقيقي 1 والتوقع 1، fp: الحقيقي 0 والتوقع 1'],
    testCases: [
      { input: 'confusion_counts([1, 0, 1, 0], [1, 1, 0, 0])', expectedOutput: '{"tp": 1, "fp": 1, "tn": 1, "fn": 1}', description: 'حالة لكل نوع' },
      { input: 'confusion_counts([1, 1], [1, 1])', expectedOutput: '{"tp": 2, "fp": 0, "tn": 0, "fn": 0}', description: 'كلها صحيحة' },
      { input: 'confusion_counts([], [])', expectedOutput: '{"tp": 0, "fp": 0, "tn": 0, "fn": 0}', description: 'فارغة', hidden: true },
    ],
  }),
];

const AI_ML: Challenge[] = [
  X({
    id: 'ml-ch-001',
    courseId: 'ai-ml-basics',
    afterLessonId: 'ml-3',
    title: 'الانحدار الخطي بالمربعات الصغرى',
    description: 'اكتب fit_line(xs, ys) تُرجع (slope, intercept) للخط الأفضل بالمربعات الصغرى، كل منهما مقرب لثلاثة أرقام.',
    difficulty: 'medium',
    points: 45,
    language: 'Python',
    starterCode: `def fit_line(xs, ys):
    pass`,
    solution: `def fit_line(xs, ys):
    n = len(xs)
    mx = sum(xs) / n
    my = sum(ys) / n
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    den = sum((x - mx) ** 2 for x in xs)
    slope = num / den
    return (round(slope, 3), round(my - slope * mx, 3))`,
    hints: ['الميل = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)²', 'القاطع = ȳ − الميل × x̄'],
    testCases: [
      { input: 'fit_line([1, 2, 3], [2, 4, 6])', expectedOutput: '(2.0, 0.0)', description: 'خط مثالي' },
      { input: 'fit_line([0, 1, 2, 3], [1, 3, 5, 7])', expectedOutput: '(2.0, 1.0)', description: 'مع قاطع' },
      { input: 'fit_line([1, 2, 3, 4], [2, 3, 5, 4])', expectedOutput: '(0.8, 1.5)', description: 'بيانات مشوشة', hidden: true },
    ],
  }),
  X({
    id: 'ml-ch-002',
    courseId: 'ai-ml-basics',
    afterLessonId: 'ml-4',
    title: 'توقع الانحدار اللوجستي',
    description: 'اكتب predict_proba(weights, bias, x) تحسب sigmoid(w·x + b) مقربة لثلاثة أرقام، وpredict(weights, bias, x) تُرجع 1 إذا كان الاحتمال ≥ 0.5 وإلا 0.',
    difficulty: 'medium',
    points: 35,
    language: 'Python',
    starterCode: `import math


def predict_proba(weights, bias, x):
    pass


def predict(weights, bias, x):
    pass`,
    solution: `import math


def predict_proba(weights, bias, x):
    z = sum(w * v for w, v in zip(weights, x)) + bias
    return round(1 / (1 + math.exp(-z)), 3)


def predict(weights, bias, x):
    return 1 if predict_proba(weights, bias, x) >= 0.5 else 0`,
    hints: ['sigmoid(z) = 1 / (1 + e^−z)', 'z = مجموع (الوزن × القيمة) + bias'],
    testCases: [
      { input: 'predict_proba([0, 0], 0, [5, 5])', expectedOutput: '0.5', description: 'z = 0' },
      { input: 'predict_proba([1, 2], -1, [1, 1])', expectedOutput: '0.881', description: 'z = 2' },
      { input: 'predict([1, 1], -5, [1, 1])', expectedOutput: '0', description: 'تصنيف سلبي', hidden: true },
      { input: 'predict([2], 0, [3])', expectedOutput: '1', description: 'تصنيف إيجابي', hidden: true },
    ],
  }),
  X({
    id: 'ml-ch-003',
    courseId: 'ai-ml-basics',
    afterLessonId: 'ml-7',
    title: 'تصنيف K-Nearest Neighbors',
    description: 'اكتب knn_predict(points, labels, query, k) تُرجع التصنيف الأكثر تكراراً بين أقرب k نقاط (مسافة إقليدية). عند التعادل اختر التصنيف الأصغر أبجدياً.',
    difficulty: 'medium',
    points: 50,
    language: 'Python',
    starterCode: `def knn_predict(points, labels, query, k):
    pass`,
    solution: `from collections import Counter


def knn_predict(points, labels, query, k):
    dist = sorted(
        (sum((a - b) ** 2 for a, b in zip(p, query)), lbl)
        for p, lbl in zip(points, labels)
    )
    votes = Counter(lbl for _, lbl in dist[:k])
    best = max(votes.values())
    return min(lbl for lbl, v in votes.items() if v == best)`,
    hints: ['المسافة الإقليدية لا تحتاج الجذر للمقارنة', 'رتّب حسب المسافة وخذ أول k', 'Counter للتصويت'],
    testCases: [
      { input: 'knn_predict([[0, 0], [1, 1], [5, 5]], ["a", "a", "b"], [0, 1], 1)', expectedOutput: 'a', description: 'أقرب جار' },
      { input: 'knn_predict([[0, 0], [1, 1], [5, 5], [6, 6]], ["a", "a", "b", "b"], [5, 6], 3)', expectedOutput: 'b', description: 'k=3' },
      { input: 'knn_predict([[0, 0], [2, 0]], ["z", "y"], [1, 0], 2)', expectedOutput: 'y', description: 'تعادل → أبجدياً', hidden: true },
    ],
  }),
  X({
    id: 'ml-ch-004',
    courseId: 'ai-ml-basics',
    afterLessonId: 'ml-5',
    title: 'نقاوة جيني لشجرة القرار',
    description: 'اكتب gini(labels) تُرجع نقاوة جيني 1 − Σp² مقربة لثلاثة أرقام، وbest_split(values, labels) تجرب كل قيمة فريدة كعتبة (≤ يسار) وتُرجع العتبة ذات أقل جيني موزون (عند التعادل الأصغر).',
    difficulty: 'hard',
    points: 80,
    language: 'Python',
    starterCode: `def gini(labels):
    pass


def best_split(values, labels):
    pass`,
    solution: `from collections import Counter


def gini(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    return round(1 - sum((c / n) ** 2 for c in Counter(labels).values()), 3)


def best_split(values, labels):
    best = None
    n = len(values)
    for t in sorted(set(values)):
        left = [l for v, l in zip(values, labels) if v <= t]
        right = [l for v, l in zip(values, labels) if v > t]
        score = (len(left) * gini(left) + len(right) * gini(right)) / n
        if best is None or score < best[0] - 1e-12:
            best = (score, t)
    return best[1]`,
    hints: ['p = عدد كل تصنيف ÷ العدد الكلي', 'الجيني الموزون = (n_left×gini_left + n_right×gini_right) / n', 'جرّب العتبات بترتيب تصاعدي'],
    testCases: [
      { input: 'gini(["a", "a", "b", "b"])', expectedOutput: '0.5', description: 'نصف ونصف' },
      { input: 'gini(["a", "a"])', expectedOutput: '0.0', description: 'نقي' },
      { input: 'best_split([1, 2, 3, 4], ["x", "x", "y", "y"])', expectedOutput: '2', description: 'فصل مثالي' },
      { input: 'best_split([5, 1, 9, 3], ["n", "y", "n", "y"])', expectedOutput: '3', description: 'قيم غير مرتبة', hidden: true },
    ],
  }),
];

// ============================================================================
// التعلم العميق (ai-deep-learning)
// ============================================================================
const AI_DL: Challenge[] = [
  X({
    id: 'dl-ch-001',
    courseId: 'ai-deep-learning',
    afterLessonId: 'dl-3',
    title: 'دوال التنشيط',
    description: 'اكتب relu(x) وsigmoid(x) (مقربة لأربعة أرقام) وsoftmax(values) تُرجع قائمة احتمالات مقربة لأربعة أرقام (اطرح القيمة العظمى أولاً للثبات العددي).',
    difficulty: 'easy',
    points: 25,
    language: 'Python',
    starterCode: `import math


def relu(x):
    pass


def sigmoid(x):
    pass


def softmax(values):
    pass`,
    solution: `import math


def relu(x):
    return max(0, x)


def sigmoid(x):
    return round(1 / (1 + math.exp(-x)), 4)


def softmax(values):
    m = max(values)
    exps = [math.exp(v - m) for v in values]
    total = sum(exps)
    return [round(e / total, 4) for e in exps]`,
    hints: ['relu = max(0, x)', 'softmax: e^(v−max) ÷ المجموع'],
    testCases: [
      { input: 'list(map(relu, [-3, 2]))', expectedOutput: '[0, 2]', description: 'ReLU' },
      { input: 'relu(7)', expectedOutput: '7', description: 'ReLU موجب', hidden: true },
      { input: 'relu(-0.5)', expectedOutput: '0', description: 'ReLU سالب', hidden: true },
      { input: 'list(map(relu, [0, -1.5, 4]))', expectedOutput: '[0, 0, 4]', description: 'ReLU على قائمة', hidden: true },
      { input: 'sigmoid(0)', expectedOutput: '0.5', description: 'Sigmoid' },
      { input: 'sigmoid(2)', expectedOutput: '0.8808', description: 'Sigmoid موجب', hidden: true },
      { input: 'softmax([1, 2, 3])', expectedOutput: '[0.09, 0.2447, 0.6652]', description: 'Softmax' },
      { input: 'softmax([1000, 1000])', expectedOutput: '[0.5, 0.5]', description: 'ثبات عددي', hidden: true },
    ],
  }),
  X({
    id: 'dl-ch-002',
    courseId: 'ai-deep-learning',
    afterLessonId: 'dl-4',
    title: 'دوال الخسارة',
    description: 'اكتب mse(y_true, y_pred) وbinary_cross_entropy(y_true, y_pred) (مع قص الاحتمال إلى [1e-7, 1−1e-7])، كلاهما مقرب لأربعة أرقام.',
    difficulty: 'medium',
    points: 35,
    language: 'Python',
    starterCode: `import math


def mse(y_true, y_pred):
    pass


def binary_cross_entropy(y_true, y_pred):
    pass`,
    solution: `import math


def mse(y_true, y_pred):
    return round(sum((t - p) ** 2 for t, p in zip(y_true, y_pred)) / len(y_true), 4)


def binary_cross_entropy(y_true, y_pred):
    eps = 1e-7
    total = 0.0
    for t, p in zip(y_true, y_pred):
        p = min(max(p, eps), 1 - eps)
        total += -(t * math.log(p) + (1 - t) * math.log(1 - p))
    return round(total / len(y_true), 4)`,
    hints: ['MSE = متوسط مربعات الفروق', 'BCE = −متوسط [t·log(p) + (1−t)·log(1−p)]', 'قص p يمنع log(0)'],
    testCases: [
      { input: 'mse([1, 2, 3], [1, 2, 5])', expectedOutput: '1.3333', description: 'MSE' },
      { input: 'mse([0, 0], [1, 1])', expectedOutput: '1.0', description: 'MSE بسيط', hidden: true },
      { input: 'binary_cross_entropy([1, 0], [0.9, 0.1])', expectedOutput: '0.1054', description: 'BCE' },
      { input: 'binary_cross_entropy([1], [0.0]) > 10', expectedOutput: 'True', description: 'قص الاحتمال يمنع الانهيار', hidden: true },
    ],
  }),
  X({
    id: 'dl-ch-003',
    courseId: 'ai-deep-learning',
    afterLessonId: 'dl-2',
    title: 'تمرير أمامي لطبقة كثيفة',
    description: 'اكتب dense_forward(x, W, b) لطبقة كثيفة مع ReLU: لكل عصبون j الناتج = relu(Σ x[i]·W[i][j] + b[j]). W مصفوفة بأبعاد (عدد المدخلات × عدد العصبونات).',
    difficulty: 'medium',
    points: 40,
    language: 'Python',
    starterCode: `def dense_forward(x, W, b):
    pass`,
    solution: `def dense_forward(x, W, b):
    out = []
    for j in range(len(b)):
        z = sum(x[i] * W[i][j] for i in range(len(x))) + b[j]
        out.append(max(0, z))
    return out`,
    hints: ['كل عمود في W يخص عصبوناً', 'طبّق ReLU على كل ناتج'],
    testCases: [
      { input: 'dense_forward([1, 2], [[1, 0], [0, 1]], [0, 0])', expectedOutput: '[1, 2]', description: 'مصفوفة الوحدة' },
      { input: 'dense_forward([1, 1], [[1, -2], [1, -2]], [0, 1])', expectedOutput: '[2, 0]', description: 'ReLU يقص السالب' },
      { input: 'dense_forward([2], [[0.5, 1.5, -1]], [1, 0, 1])', expectedOutput: '[2.0, 3.0, 0]', description: 'ثلاثة عصبونات', hidden: true },
    ],
  }),
  X({
    id: 'dl-ch-004',
    courseId: 'ai-deep-learning',
    afterLessonId: 'dl-5',
    title: 'نزول التدرج لدالة واحدة',
    description: 'اكتب gradient_descent(lr, steps, start) لإيجاد أصغر قيمة للدالة f(x) = (x − 3)² بالتدرج f\'(x) = 2(x − 3). أرجع x بعد عدد الخطوات مقرباً لأربعة أرقام.',
    difficulty: 'easy',
    points: 25,
    language: 'Python',
    starterCode: `def gradient_descent(lr, steps, start):
    pass`,
    solution: `def gradient_descent(lr, steps, start):
    x = start
    for _ in range(steps):
        x -= lr * 2 * (x - 3)
    return round(x, 4)`,
    hints: ['في كل خطوة: x = x − lr × التدرج', 'التدرج هنا 2(x − 3)'],
    testCases: [
      { input: 'gradient_descent(0.5, 1, 0)', expectedOutput: '3.0', description: 'خطوة واحدة مثالية' },
      { input: 'gradient_descent(0.1, 50, 0)', expectedOutput: '3.0', description: 'تقارب' },
      { input: 'gradient_descent(0.1, 2, 0)', expectedOutput: '1.08', description: 'خطوتان', hidden: true },
    ],
  }),
  X({
    id: 'dl-ch-005',
    courseId: 'ai-deep-learning',
    afterLessonId: 'dl-8',
    title: 'التفاف وتجميع (Conv + MaxPool)',
    description: 'اكتب conv2d(image, kernel) (بدون حشو، خطوة 1) وmax_pool(matrix, size) (نوافذ غير متداخلة بحجم size×size، تجاهل الأطراف الزائدة).',
    difficulty: 'hard',
    points: 75,
    language: 'Python',
    starterCode: `def conv2d(image, kernel):
    pass


def max_pool(matrix, size):
    pass`,
    solution: `def conv2d(image, kernel):
    kh, kw = len(kernel), len(kernel[0])
    out = []
    for i in range(len(image) - kh + 1):
        row = []
        for j in range(len(image[0]) - kw + 1):
            row.append(sum(image[i + a][j + b] * kernel[a][b] for a in range(kh) for b in range(kw)))
        out.append(row)
    return out


def max_pool(matrix, size):
    out = []
    for i in range(0, len(matrix) - size + 1, size):
        row = []
        for j in range(0, len(matrix[0]) - size + 1, size):
            row.append(max(matrix[i + a][j + b] for a in range(size) for b in range(size)))
        out.append(row)
    return out`,
    hints: ['حجم ناتج الالتفاف: (H − kh + 1) × (W − kw + 1)', 'في التجميع تتحرك النافذة بمقدار size'],
    testCases: [
      { input: 'conv2d([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, -1]])', expectedOutput: '[[-4, -4], [-4, -4]]', description: 'التفاف 2×2' },
      { input: 'max_pool([[1, 3, 2, 4], [5, 6, 1, 0], [7, 2, 9, 8], [1, 1, 3, 4]], 2)', expectedOutput: '[[6, 4], [7, 9]]', description: 'تجميع' },
      { input: 'max_pool([[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2)', expectedOutput: '[[5]]', description: 'تجاهل الأطراف', hidden: true },
      { input: 'conv2d([[1, 1], [1, 1]], [[2]])', expectedOutput: '[[2, 2], [2, 2]]', description: 'نواة 1×1', hidden: true },
    ],
  }),
  X({
    id: 'dl-ch-006',
    courseId: 'ai-deep-learning',
    afterLessonId: 'dl-13',
    title: 'تطبيع الدفعة (Batch Norm)',
    description: 'اكتب batch_norm(values, eps=1e-5) تُرجع (v − المتوسط) / √(التباين + eps) لكل قيمة، مقربة لثلاثة أرقام (التباين السكاني).',
    difficulty: 'medium',
    points: 40,
    language: 'Python',
    starterCode: `def batch_norm(values, eps=1e-5):
    pass`,
    solution: `def batch_norm(values, eps=1e-5):
    n = len(values)
    mean = sum(values) / n
    var = sum((v - mean) ** 2 for v in values) / n
    return [round((v - mean) / (var + eps) ** 0.5, 3) for v in values]`,
    hints: ['المتوسط ثم التباين = متوسط مربعات الانحراف', 'أضف eps قبل الجذر'],
    testCases: [
      { input: 'batch_norm([1, 2, 3])', expectedOutput: '[-1.225, 0.0, 1.225]', description: 'ثلاث قيم' },
      { input: 'batch_norm([5, 5])', expectedOutput: '[0.0, 0.0]', description: 'قيم متساوية' },
      { input: 'batch_norm([0, 10])', expectedOutput: '[-1.0, 1.0]', description: 'قيمتان', hidden: true },
    ],
  }),
  X({
    id: 'dl-ch-007',
    courseId: 'ai-deep-learning',
    afterLessonId: 'dl-14',
    title: 'الإيقاف المبكر (Early Stopping)',
    description: 'اكتب early_stop_epoch(val_losses, patience) تُرجع رقم الحقبة (يبدأ من 0) التي يتوقف عندها التدريب: عندما لا تتحسن الخسارة (أقل من أفضل قيمة سابقة) لعدد patience حقبات متتالية. إذا لم يتوقف أرجع آخر رقم.',
    difficulty: 'medium',
    points: 40,
    language: 'Python',
    starterCode: `def early_stop_epoch(val_losses, patience):
    pass`,
    solution: `def early_stop_epoch(val_losses, patience):
    best = float("inf")
    wait = 0
    for epoch, loss in enumerate(val_losses):
        if loss < best:
            best = loss
            wait = 0
        else:
            wait += 1
            if wait >= patience:
                return epoch
    return len(val_losses) - 1`,
    hints: ['احفظ أفضل خسارة وعداد الانتظار', 'صفّر العداد عند كل تحسن'],
    testCases: [
      { input: 'early_stop_epoch([0.9, 0.7, 0.71, 0.72, 0.73], 2)', expectedOutput: '3', description: 'توقف بعد حقبتين بلا تحسن' },
      { input: 'early_stop_epoch([0.9, 0.8, 0.7], 2)', expectedOutput: '2', description: 'لم يتوقف' },
      { input: 'early_stop_epoch([0.5, 0.6, 0.4, 0.45, 0.5, 0.55], 3)', expectedOutput: '5', description: 'تحسن متأخر يصفّر العداد', hidden: true },
    ],
  }),
  X({
    id: 'dl-ch-008',
    courseId: 'ai-deep-learning',
    afterLessonId: 'dl-transformers',
    title: 'أوزان الانتباه',
    description: 'اكتب attention_weights(query, keys) تحسب حاصل الضرب النقطي بين query وكل key مقسوماً على √(طول المتجه)، ثم softmax، وتُرجع الأوزان مقربة لثلاثة أرقام.',
    difficulty: 'hard',
    points: 70,
    language: 'Python',
    starterCode: `import math


def attention_weights(query, keys):
    pass`,
    solution: `import math


def attention_weights(query, keys):
    d = len(query)
    scores = [sum(q * k for q, k in zip(query, key)) / math.sqrt(d) for key in keys]
    m = max(scores)
    exps = [math.exp(s - m) for s in scores]
    total = sum(exps)
    return [round(e / total, 3) for e in exps]`,
    hints: ['الدرجة = (q · k) / √d', 'softmax على الدرجات', 'اطرح القيمة العظمى قبل exp'],
    testCases: [
      { input: 'attention_weights([1, 0], [[1, 0], [0, 1]])', expectedOutput: '[0.67, 0.33]', description: 'مفتاحان' },
      { input: 'attention_weights([0, 0], [[1, 2], [3, 4], [5, 6]])', expectedOutput: '[0.333, 0.333, 0.333]', description: 'استعلام صفري' },
      { input: 'attention_weights([2, 1], [[1, 1], [2, 0], [0, 3]])', expectedOutput: '[0.248, 0.503, 0.248]', description: 'ثلاثة مفاتيح', hidden: true },
      { input: 'attention_weights([1, 1], [[1, 1], [1, 1]])', expectedOutput: '[0.5, 0.5]', description: 'مفاتيح متطابقة', hidden: true },
    ],
  }),
];

// ============================================================================
// الأمن السيبراني — تحديات دفاعية (cyber-basics, cyber-advanced)
// ============================================================================
const CYBER_DEF: Challenge[] = [
  X({
    id: 'cybd-ch-001',
    courseId: 'cyber-basics',
    afterLessonId: 'cyber-cookies-sessions',
    title: 'تدقيق إعدادات الكوكي',
    description: 'اكتب cookie_issues(header) لنص Set-Cookie وتُرجع قائمة مرتبة بالإعدادات الأمنية الناقصة من: "HttpOnly"، "Secure"، "SameSite" (حالة الأحرف لا تهم).',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    starterCode: `def cookie_issues(header):
    pass`,
    solution: `def cookie_issues(header):
    parts = [p.strip().split("=")[0].lower() for p in header.split(";")]
    required = {"httponly": "HttpOnly", "secure": "Secure", "samesite": "SameSite"}
    return sorted(name for key, name in required.items() if key not in parts)`,
    hints: ['قسّم النص بـ ";"', 'قارن بحروف صغيرة', 'SameSite=Lax يُحتسب موجوداً'],
    testCases: [
      { input: 'cookie_issues("session=abc; Path=/")', expectedOutput: '["HttpOnly", "SameSite", "Secure"]', description: 'كلها ناقصة' },
      { input: 'cookie_issues("id=1; HttpOnly; Secure; SameSite=Lax")', expectedOutput: '[]', description: 'آمنة' },
      { input: 'cookie_issues("id=1; secure; httponly")', expectedOutput: '["SameSite"]', description: 'حروف صغيرة', hidden: true },
    ],
  }),
  X({
    id: 'cybd-ch-002',
    courseId: 'cyber-basics',
    afterLessonId: 'cyber-3',
    title: 'مؤشرات روابط التصيد',
    description:
      'اكتب phishing_flags(url) تُرجع قائمة مرتبة بالمؤشرات: "ip_host" إذا كان المضيف عنوان IP، "at_sign" إذا احتوى الرابط @، "no_https" إذا لم يبدأ بـ https://، "many_subdomains" إذا كان في المضيف أكثر من 3 نقاط.',
    difficulty: 'medium',
    points: 30,
    language: 'Python',
    starterCode: `import re


def phishing_flags(url):
    pass`,
    solution: `import re


def phishing_flags(url):
    flags = []
    if "@" in url:
        flags.append("at_sign")
    if not url.lower().startswith("https://"):
        flags.append("no_https")
    host = re.sub(r"^[a-zA-Z]+://", "", url).split("/")[0].split("@")[-1].split(":")[0]
    if re.fullmatch(r"\\d{1,3}(\\.\\d{1,3}){3}", host):
        flags.append("ip_host")
    if host.count(".") > 3:
        flags.append("many_subdomains")
    return sorted(flags)`,
    hints: ['استخرج المضيف: احذف البروتوكول، ثم ما بعد "/"، وما بعد "@"', 'عنوان IP: أربع مجموعات أرقام مفصولة بنقاط'],
    testCases: [
      { input: 'phishing_flags("https://kodax.app/learn")', expectedOutput: '[]', description: 'رابط سليم' },
      { input: 'phishing_flags("http://192.168.1.5/login")', expectedOutput: '["ip_host", "no_https"]', description: 'IP بدون https' },
      { input: 'phishing_flags("https://secure.login.bank.example.com@evil.io")', expectedOutput: '["at_sign"]', description: 'علامة @', hidden: true },
      { input: 'phishing_flags("https://a.b.c.d.example.com")', expectedOutput: '["many_subdomains"]', description: 'نطاقات فرعية كثيرة', hidden: true },
    ],
  }),
  X({
    id: 'cybd-ch-003',
    courseId: 'cyber-basics',
    afterLessonId: 'cyber-6',
    title: 'التحقق من سلامة الملفات بالهاش',
    description: 'اكتب verify_integrity(content, expected_hex) تحسب SHA-256 للنص (UTF-8) وتقارنه بالقيمة المتوقعة مقارنة آمنة زمنياً (hmac.compare_digest)، وتُرجع True/False.',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    starterCode: `import hashlib
import hmac


def verify_integrity(content, expected_hex):
    pass`,
    solution: `import hashlib
import hmac


def verify_integrity(content, expected_hex):
    actual = hashlib.sha256(content.encode("utf-8")).hexdigest()
    return hmac.compare_digest(actual, expected_hex.lower())`,
    hints: ['hashlib.sha256(...).hexdigest()', 'hmac.compare_digest تمنع تسريب المعلومات عبر زمن المقارنة'],
    testCases: [
      { input: 'verify_integrity("hello", "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")', expectedOutput: 'True', description: 'سليم' },
      { input: 'verify_integrity("hello!", "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")', expectedOutput: 'False', description: 'معدّل' },
      { input: 'verify_integrity("hello", "2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824")', expectedOutput: 'True', description: 'حروف كبيرة', hidden: true },
    ],
  }),
  X({
    id: 'cybd-ch-004',
    courseId: 'cyber-advanced',
    afterLessonId: 'cyber-sql-001',
    title: 'بناء استعلام معامَلي آمن',
    description:
      'اكتب build_select(table, filters) تُرجع (sql, params) حيث الأعمدة والجدول من قائمة مسموحة فقط (ALLOWED)، والقيم كمعاملات ? وليست داخل النص. الشروط مرتبة أبجدياً حسب اسم العمود ومربوطة بـ AND. اسم غير مسموح يُطلق ValueError.',
    difficulty: 'medium',
    points: 45,
    language: 'Python',
    starterCode: `ALLOWED = {"users": {"id", "name", "email", "role"}}


def build_select(table, filters):
    pass`,
    solution: `ALLOWED = {"users": {"id", "name", "email", "role"}}


def build_select(table, filters):
    if table not in ALLOWED:
        raise ValueError("table not allowed")
    cols = sorted(filters)
    for c in cols:
        if c not in ALLOWED[table]:
            raise ValueError("column not allowed")
    sql = f"SELECT * FROM {table}"
    if cols:
        sql += " WHERE " + " AND ".join(f"{c} = ?" for c in cols)
    return (sql, [filters[c] for c in cols])`,
    hints: ['لا تضع القيم داخل نص الاستعلام أبداً', 'الأسماء (جدول/عمود) لا تُمرر كمعاملات: تحقق منها بقائمة مسموحة', 'sorted(filters) يرتب المفاتيح'],
    testCases: [
      { input: 'build_select("users", {"name": "Ali"})', expectedOutput: '("SELECT * FROM users WHERE name = ?", ["Ali"])', description: 'شرط واحد' },
      { input: 'build_select("users", {"role": "admin", "id": 5})', expectedOutput: '("SELECT * FROM users WHERE id = ? AND role = ?", [5, "admin"])', description: 'شرطان مرتبان' },
      { input: 'build_select("users", {"name": "x\' OR \'1\'=\'1"})[0]', expectedOutput: 'SELECT * FROM users WHERE name = ?', description: 'القيمة الخبيثة لا تدخل النص', hidden: true },
      { input: 'try:\n    build_select("users; DROP TABLE users", {})\n    r = "no error"\nexcept ValueError:\n    r = "rejected"\nr', expectedOutput: 'rejected', description: 'جدول غير مسموح', hidden: true },
      { input: 'sql, params = build_select("users", {})\n(sql, params)', expectedOutput: '("SELECT * FROM users", [])', description: 'بدون شروط', hidden: true },
    ],
  }),
  X({
    id: 'cybd-ch-005',
    courseId: 'cyber-advanced',
    afterLessonId: 'cyber-xss-001',
    title: 'ترميز المخرجات حسب السياق',
    description: 'اكتب escape_html(text) تستبدل & < > " \' بكيانات HTML (&amp; &lt; &gt; &quot; &#x27;) بالترتيب الصحيح حتى لا يُرمَّز & مرتين.',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    starterCode: `def escape_html(text):
    pass`,
    solution: `def escape_html(text):
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#x27;")
    )`,
    hints: ['ابدأ بـ & قبل غيره', 'خمسة رموز فقط'],
    testCases: [
      { input: 'escape_html("<b>hi</b>")', expectedOutput: '&lt;b&gt;hi&lt;/b&gt;', description: 'وسوم' },
      { input: 'escape_html("a & b")', expectedOutput: 'a &amp; b', description: 'علامة &' },
      { input: 'escape_html("&lt;")', expectedOutput: '&amp;lt;', description: 'لا ترميز مزدوج خاطئ', hidden: true },
    ],
  }),
  X({
    id: 'cybd-ch-006',
    courseId: 'cyber-advanced',
    afterLessonId: 'cyber-adv-3',
    title: 'ترتيب نتائج الفحص الأمني',
    description:
      'اكتب prioritize(findings) لقائمة قواميس {"id", "cvss"} وتُرجع قائمة id مرتبة من الأخطر: حسب cvss تنازلياً ثم id تصاعدياً، مع تصنيف: severity(cvss) تُرجع "critical" (≥9) أو "high" (≥7) أو "medium" (≥4) أو "low".',
    difficulty: 'medium',
    points: 35,
    language: 'Python',
    starterCode: `def severity(cvss):
    pass


def prioritize(findings):
    pass`,
    solution: `def severity(cvss):
    if cvss >= 9:
        return "critical"
    if cvss >= 7:
        return "high"
    if cvss >= 4:
        return "medium"
    return "low"


def prioritize(findings):
    return [f["id"] for f in sorted(findings, key=lambda f: (-f["cvss"], f["id"]))]`,
    hints: ['sorted مع key=(-cvss, id)', 'severity بسلسلة if من الأعلى'],
    testCases: [
      { input: 'severity(9.8)', expectedOutput: 'critical', description: 'حرجة' },
      { input: 'severity(5.5)', expectedOutput: 'medium', description: 'متوسطة', hidden: true },
      { input: 'prioritize([{"id": "B", "cvss": 5.0}, {"id": "A", "cvss": 9.1}, {"id": "C", "cvss": 5.0}])', expectedOutput: '["A", "B", "C"]', description: 'ترتيب' },
      { input: 'list(map(severity, [7.0, 4.0, 3.9]))', expectedOutput: '["high", "medium", "low"]', description: 'الحدود', hidden: true },
      { input: 'prioritize([])', expectedOutput: '[]', description: 'لا نتائج', hidden: true },
      { input: 'list(map(severity, [9.0, 0]))', expectedOutput: '["critical", "low"]', description: 'الطرفان', hidden: true },
    ],
  }),
];

// ============================================================================
// C++: البرمجة الكائنية (cpp-oop)
// ============================================================================
const CPP_OOP: Challenge[] = [
  X({
    id: 'cppoop-ch-001',
    courseId: 'cpp-oop',
    afterLessonId: 'cpp-adv-1',
    title: 'صنف المستطيل',
    description: 'أنشئ صنف Rectangle له مُنشئ (width, height) ودالتان area() وperimeter() تُرجعان int.',
    difficulty: 'easy',
    points: 15,
    language: 'C++',
    starterCode: `class Rectangle {
public:
    Rectangle(int w, int h) {
        // خزّن العرض والارتفاع
    }
    int area() { return 0; }
    int perimeter() { return 0; }
};`,
    solution: `class Rectangle {
    int w, h;
public:
    Rectangle(int w, int h) : w(w), h(h) {}
    int area() { return w * h; }
    int perimeter() { return 2 * (w + h); }
};`,
    hints: ['خزّن القيم في أعضاء خاصة', 'قائمة التهيئة : w(w), h(h)'],
    testCases: [
      { input: 'Rectangle r(3, 4); r.area()', expectedOutput: '12', description: 'المساحة' },
      { input: 'Rectangle r(3, 4); r.perimeter()', expectedOutput: '14', description: 'المحيط' },
      { input: 'Rectangle r(10, 1); r.area()', expectedOutput: '10', description: 'مستطيل طويل', hidden: true },
      { input: 'Rectangle r(5, 5); r.perimeter()', expectedOutput: '20', description: 'مربع', hidden: true },
    ],
  }),
  X({
    id: 'cppoop-ch-002',
    courseId: 'cpp-oop',
    afterLessonId: 'cpp-adv-3',
    title: 'حساب بنكي مغلّف',
    description: 'أنشئ صنف Account برصيد خاص. deposit(int) يقبل المبالغ الموجبة فقط، وwithdraw(int) تُرجع true إذا كان الرصيد يكفي (وتخصم)، وbalance() تُرجع الرصيد.',
    difficulty: 'easy',
    points: 20,
    language: 'C++',
    starterCode: `class Account {
public:
    Account(int initial) {}
    void deposit(int amount) {}
    bool withdraw(int amount) { return false; }
    int balance() { return 0; }
};`,
    solution: `class Account {
    int bal;
public:
    Account(int initial) : bal(initial) {}
    void deposit(int amount) { if (amount > 0) bal += amount; }
    bool withdraw(int amount) {
        if (amount <= 0 || amount > bal) return false;
        bal -= amount;
        return true;
    }
    int balance() { return bal; }
};`,
    hints: ['اجعل الرصيد private', 'تحقق من المبلغ قبل الخصم'],
    testCases: [
      { input: 'Account a(100); a.deposit(50); a.balance()', expectedOutput: '150', description: 'إيداع' },
      { input: 'Account a(100); a.withdraw(30)', expectedOutput: '1', description: 'سحب ممكن' },
      { input: 'Account a(100); a.withdraw(500); a.balance()', expectedOutput: '100', description: 'سحب مرفوض', hidden: true },
      { input: 'Account a(10); a.deposit(-5); a.balance()', expectedOutput: '10', description: 'إيداع سالب', hidden: true },
    ],
  }),
  X({
    id: 'cppoop-ch-003',
    courseId: 'cpp-oop',
    afterLessonId: 'cpp-adv-8',
    title: 'عدّاد الكائنات (Static Members)',
    description: 'أنشئ صنف Ticket يعطي كل تذكرة رقماً تسلسلياً يبدأ من 1 (id())، ودالة ثابتة total() تُرجع عدد التذاكر المُنشأة.',
    difficulty: 'easy',
    points: 25,
    language: 'C++',
    starterCode: `class Ticket {
public:
    Ticket() {}
    int id() { return 0; }
    static int total() { return 0; }
};`,
    solution: `class Ticket {
    static inline int counter = 0;
    int number;
public:
    Ticket() : number(++counter) {}
    int id() { return number; }
    static int total() { return counter; }
};`,
    hints: ['عضو static مشترك بين كل الكائنات', 'static inline int counter = 0; (C++17)', 'زِد العداد في المُنشئ'],
    testCases: [
      { input: 'Ticket a; Ticket b; int t = Ticket::total(); t', expectedOutput: '2', description: 'تذكرتان' },
      { input: 'Ticket a; Ticket b; Ticket c; c.id()', expectedOutput: '3', description: 'الرقم التسلسلي' },
      { input: 'int t = Ticket::total(); t', expectedOutput: '0', description: 'بلا تذاكر', hidden: true },
      { input: 'Ticket a; a.id()', expectedOutput: '1', description: 'أول تذكرة', hidden: true },
    ],
  }),
  X({
    id: 'cppoop-ch-004',
    courseId: 'cpp-oop',
    afterLessonId: 'cpp-adv-6',
    title: 'الكسور وتحميل المعاملات',
    description: 'أنشئ صنف Fraction(num, den) يُبسَّط تلقائياً، مع operator+ وoperator== ودالة str() تُرجع "num/den" (والإشارة في البسط فقط).',
    difficulty: 'medium',
    points: 45,
    language: 'C++',
    starterCode: `class Fraction {
public:
    Fraction(int n, int d) {}
    std::string str() { return ""; }
};`,
    solution: `class Fraction {
    int n, d;
    void simplify() {
        if (d < 0) { n = -n; d = -d; }
        int g = std::gcd(std::abs(n), d);
        if (g > 1) { n /= g; d /= g; }
    }
public:
    Fraction(int n, int d) : n(n), d(d) { simplify(); }
    Fraction operator+(const Fraction& o) const { return Fraction(n * o.d + o.n * d, d * o.d); }
    bool operator==(const Fraction& o) const { return n == o.n && d == o.d; }
    std::string str() const { return std::to_string(n) + "/" + std::to_string(d); }
};`,
    hints: ['البسط والمقام بعد القسمة على القاسم المشترك الأكبر std::gcd', 'a/b + c/d = (ad + cb) / bd', 'انقل الإشارة السالبة للبسط'],
    testCases: [
      { input: 'Fraction a(1, 2); Fraction b(1, 3); (a + b).str()', expectedOutput: '5/6', description: 'الجمع' },
      { input: 'Fraction a(2, 4); a.str()', expectedOutput: '1/2', description: 'التبسيط' },
      { input: 'Fraction a(1, -2); a.str()', expectedOutput: '-1/2', description: 'الإشارة', hidden: true },
      { input: 'Fraction a(1, 2); Fraction b(3, 6); a == b', expectedOutput: '1', description: 'المساواة بعد التبسيط', hidden: true },
      { input: 'Fraction a(1, 4); Fraction b(3, 4); (a + b).str()', expectedOutput: '1/1', description: 'ناتج صحيح', hidden: true },
    ],
  }),
  X({
    id: 'cppoop-ch-005',
    courseId: 'cpp-oop',
    afterLessonId: 'cpp-adv-4',
    title: 'مساحات بتعدد الأشكال',
    description: 'صنف أساسي Shape بدالة افتراضية خالصة area(). أنشئ Square(side) وCircle(r) (π = 3.14159)، والدالة totalArea(const std::vector<Shape*>&) تُرجع المجموع double.',
    difficulty: 'medium',
    points: 40,
    language: 'C++',
    starterCode: `class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() {}
};

// Square, Circle

double totalArea(const std::vector<Shape*>& shapes) {
    return 0;
}`,
    solution: `class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() {}
};

class Square : public Shape {
    double s;
public:
    Square(double s) : s(s) {}
    double area() const override { return s * s; }
};

class Circle : public Shape {
    double r;
public:
    Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
};

double totalArea(const std::vector<Shape*>& shapes) {
    double sum = 0;
    for (const Shape* s : shapes) sum += s->area();
    return sum;
}`,
    hints: ['استخدم public inheritance و override', 'totalArea تستدعي area() عبر المؤشر (ربط ديناميكي)'],
    testCases: [
      { input: 'Square s(2); Circle c(1); std::vector<Shape*> v = {&s, &c}; totalArea(v)', expectedOutput: '7.14159', description: 'مربع ودائرة' },
      { input: 'Square s(3); std::vector<Shape*> v = {&s}; totalArea(v)', expectedOutput: '9', description: 'مربع' },
      { input: 'std::vector<Shape*> v; totalArea(v)', expectedOutput: '0', description: 'فارغة', hidden: true },
      { input: 'Circle a(2); Circle b(1); std::vector<Shape*> v = {&a, &b}; totalArea(v)', expectedOutput: '15.708', description: 'دائرتان', hidden: true },
    ],
  }),
  X({
    id: 'cppoop-ch-006',
    courseId: 'cpp-oop',
    afterLessonId: 'cpp-adv-7',
    title: 'نسخ عميق (Rule of Three)',
    description: 'صنف Buffer يحجز مصفوفة int بحجم n على الـ heap. نفّذ المُنشئ والهادم ومُنشئ النسخ وعامل الإسناد بنسخ عميق، مع set(i, v) وget(i) وsize().',
    difficulty: 'medium',
    points: 55,
    language: 'C++',
    starterCode: `class Buffer {
    int* data;
    int n;
public:
    Buffer(int n) : data(new int[n]()), n(n) {}
    ~Buffer() { delete[] data; }
    // مُنشئ النسخ + عامل الإسناد
    void set(int i, int v) { data[i] = v; }
    int get(int i) const { return data[i]; }
    int size() const { return n; }
};`,
    solution: `class Buffer {
    int* data;
    int n;
public:
    Buffer(int n) : data(new int[n]()), n(n) {}
    ~Buffer() { delete[] data; }
    Buffer(const Buffer& o) : data(new int[o.n]), n(o.n) {
        std::copy(o.data, o.data + n, data);
    }
    Buffer& operator=(const Buffer& o) {
        if (this != &o) {
            int* fresh = new int[o.n];
            std::copy(o.data, o.data + o.n, fresh);
            delete[] data;
            data = fresh;
            n = o.n;
        }
        return *this;
    }
    void set(int i, int v) { data[i] = v; }
    int get(int i) const { return data[i]; }
    int size() const { return n; }
};`,
    hints: ['النسخ السطحي ينسخ المؤشر فقط: الكائنان يشتركان بنفس الذاكرة', 'في مُنشئ النسخ احجز ذاكرة جديدة وانسخ القيم', 'في الإسناد تحقق من الإسناد للذات وحرّر القديم'],
    testCases: [
      { input: 'Buffer a(3); a.set(0, 5); Buffer b = a; b.set(0, 9); a.get(0)', expectedOutput: '5', description: 'النسخة مستقلة' },
      { input: 'Buffer a(2); a.set(1, 7); Buffer b(5); b = a; b.size()', expectedOutput: '2', description: 'الإسناد' },
      { input: 'Buffer a(2); a.set(1, 7); Buffer b(1); b = a; a.set(1, 0); b.get(1)', expectedOutput: '7', description: 'الإسناد نسخ عميق', hidden: true },
      { input: 'Buffer a(2); a.set(0, 4); a = a; a.get(0)', expectedOutput: '4', description: 'الإسناد للذات', hidden: true },
    ],
  }),
  X({
    id: 'cppoop-ch-007',
    courseId: 'cpp-oop',
    afterLessonId: 'cpp-adv-12',
    title: 'نظام رواتب بالتجريد',
    description:
      'صنف مجرد Employee(name) بدالة افتراضية خالصة salary(). Engineer(name, base) راتبه base، وManager(name, base, reports) راتبه base + 100 لكل موظف تحت إدارته. اكتب payroll(const std::vector<Employee*>&) تُرجع الأسماء مرتبة حسب الراتب تنازلياً (والتعادل أبجدياً) مفصولة بفواصل، وtotalPayroll تُرجع المجموع.',
    difficulty: 'hard',
    points: 85,
    language: 'C++',
    starterCode: `class Employee {
public:
    std::string name;
    Employee(std::string n) : name(n) {}
    virtual int salary() const = 0;
    virtual ~Employee() {}
};

// Engineer, Manager

std::string payroll(const std::vector<Employee*>& staff) {
    return "";
}

int totalPayroll(const std::vector<Employee*>& staff) {
    return 0;
}`,
    solution: `class Employee {
public:
    std::string name;
    Employee(std::string n) : name(n) {}
    virtual int salary() const = 0;
    virtual ~Employee() {}
};

class Engineer : public Employee {
    int base;
public:
    Engineer(std::string n, int b) : Employee(n), base(b) {}
    int salary() const override { return base; }
};

class Manager : public Employee {
    int base, reports;
public:
    Manager(std::string n, int b, int r) : Employee(n), base(b), reports(r) {}
    int salary() const override { return base + 100 * reports; }
};

std::string payroll(const std::vector<Employee*>& staff) {
    std::vector<Employee*> v(staff);
    std::sort(v.begin(), v.end(), [](const Employee* a, const Employee* b) {
        if (a->salary() != b->salary()) return a->salary() > b->salary();
        return a->name < b->name;
    });
    std::string out;
    for (size_t i = 0; i < v.size(); i++) {
        if (i) out += ",";
        out += v[i]->name;
    }
    return out;
}

int totalPayroll(const std::vector<Employee*>& staff) {
    int sum = 0;
    for (const Employee* e : staff) sum += e->salary();
    return sum;
}`,
    hints: ['Manager تستدعي مُنشئ Employee في قائمة التهيئة', 'std::sort مع lambda للمقارنة', 'انسخ الـ vector قبل الترتيب'],
    testCases: [
      { input: 'Engineer a("Ali", 1000); Manager m("Sara", 900, 3); std::vector<Employee*> v = {&a, &m}; payroll(v)', expectedOutput: 'Sara,Ali', description: 'الترتيب' },
      { input: 'Engineer a("Ali", 1000); Manager m("Sara", 900, 3); std::vector<Employee*> v = {&a, &m}; totalPayroll(v)', expectedOutput: '2200', description: 'المجموع' },
      { input: 'Engineer a("Zaid", 500); Engineer b("Huda", 500); std::vector<Employee*> v = {&a, &b}; payroll(v)', expectedOutput: 'Huda,Zaid', description: 'تعادل → أبجدياً', hidden: true },
      { input: 'std::vector<Employee*> v; totalPayroll(v)', expectedOutput: '0', description: 'بلا موظفين', hidden: true },
    ],
  }),
];

// ============================================================================
// C++ المتقدم (cpp-advanced)
// ============================================================================
const CPP_ADV: Challenge[] = [
  X({
    id: 'cppadv-ch-001',
    courseId: 'cpp-advanced',
    afterLessonId: 'cpp-adv-13',
    title: 'قالب لإيجاد الأكبر',
    description: 'اكتب قالب دالة maxOf(const std::vector<T>&) يعمل مع أي نوع يدعم <، ويُرجع أكبر عنصر.',
    difficulty: 'easy',
    points: 20,
    language: 'C++',
    starterCode: `template <typename T>
T maxOf(const std::vector<T>& items) {
    return items[0];
}`,
    solution: `template <typename T>
T maxOf(const std::vector<T>& items) {
    T best = items[0];
    for (const T& x : items) if (best < x) best = x;
    return best;
}`,
    hints: ['ابدأ بأول عنصر وقارن بالباقي', 'نفس الكود يعمل مع int وstring'],
    testCases: [
      { input: 'maxOf(std::vector<int>{3, 9, 2})', expectedOutput: '9', description: 'أرقام' },
      { input: 'maxOf(std::vector<std::string>{"b", "z", "a"})', expectedOutput: 'z', description: 'نصوص' },
      { input: 'maxOf(std::vector<double>{-1.5, -0.5})', expectedOutput: '-0.5', description: 'سالبة', hidden: true },
      { input: 'maxOf(std::vector<int>{7})', expectedOutput: '7', description: 'عنصر واحد', hidden: true },
    ],
  }),
  X({
    id: 'cppadv-ch-002',
    courseId: 'cpp-advanced',
    afterLessonId: 'cpp-advanced-stl-containers',
    title: 'الكلمة الأكثر تكراراً',
    description: 'اكتب topWord(const std::string&) تُرجع الكلمة الأكثر تكراراً (الكلمات مفصولة بمسافات). عند التعادل الأصغر أبجدياً. استخدم std::map.',
    difficulty: 'medium',
    points: 35,
    language: 'C++',
    starterCode: `std::string topWord(const std::string& text) {
    return "";
}`,
    solution: `std::string topWord(const std::string& text) {
    std::map<std::string, int> freq;
    std::istringstream in(text);
    std::string w;
    while (in >> w) freq[w]++;
    std::string best;
    int count = 0;
    for (const auto& [word, c] : freq) {
        if (c > count) { best = word; count = c; }
    }
    return best;
}`,
    hints: ['std::istringstream يقطّع بالمسافات', 'std::map مرتب أبجدياً: أول أكبر قيمة = الأصغر أبجدياً عند التعادل'],
    testCases: [
      { input: 'topWord("a b a c b a")', expectedOutput: 'a', description: 'تكرار واضح' },
      { input: 'topWord("dog cat cat dog")', expectedOutput: 'cat', description: 'تعادل' },
      { input: 'topWord("one")', expectedOutput: 'one', description: 'كلمة واحدة', hidden: true },
      { input: 'topWord("x  y   y")', expectedOutput: 'y', description: 'مسافات متعددة', hidden: true },
    ],
  }),
  X({
    id: 'cppadv-ch-003',
    courseId: 'cpp-advanced',
    afterLessonId: 'cpp-adv-15',
    title: 'خوارزميات STL مع Lambda',
    description: 'اكتب evenSquaresDesc(std::vector<int>) تأخذ الأرقام الزوجية فقط، تربّعها، وتُرجعها مرتبة تنازلياً — باستخدام خوارزميات STL وlambda.',
    difficulty: 'medium',
    points: 35,
    language: 'C++',
    starterCode: `std::vector<int> evenSquaresDesc(std::vector<int> v) {
    return {};
}`,
    solution: `std::vector<int> evenSquaresDesc(std::vector<int> v) {
    std::vector<int> out;
    std::copy_if(v.begin(), v.end(), std::back_inserter(out), [](int x) { return x % 2 == 0; });
    std::transform(out.begin(), out.end(), out.begin(), [](int x) { return x * x; });
    std::sort(out.begin(), out.end(), std::greater<int>());
    return out;
}`,
    hints: ['std::copy_if للتصفية', 'std::transform للتربيع', 'std::sort مع std::greater للتنازلي'],
    testCases: [
      { input: 'evenSquaresDesc({1, 2, 3, 4})', expectedOutput: '[16, 4]', description: 'أرقام مختلطة' },
      { input: 'evenSquaresDesc({1, 3, 5})', expectedOutput: '[]', description: 'لا زوجية' },
      { input: 'evenSquaresDesc({-2, 6, 0})', expectedOutput: '[36, 4, 0]', description: 'سالب وصفر', hidden: true },
    ],
  }),
  X({
    id: 'cppadv-ch-004',
    courseId: 'cpp-advanced',
    afterLessonId: 'cpp-adv-17',
    title: 'معالجة الاستثناءات',
    description: 'اكتب safeDivide(int a, int b) تطلق std::invalid_argument("division by zero") عند b == 0، وtryDivide(int a, int b) تلتقطه وتُرجع "ok:<الناتج>" أو "error:<الرسالة>".',
    difficulty: 'medium',
    points: 30,
    language: 'C++',
    starterCode: `int safeDivide(int a, int b) {
    return a / b;
}

std::string tryDivide(int a, int b) {
    return "";
}`,
    solution: `int safeDivide(int a, int b) {
    if (b == 0) throw std::invalid_argument("division by zero");
    return a / b;
}

std::string tryDivide(int a, int b) {
    try {
        return "ok:" + std::to_string(safeDivide(a, b));
    } catch (const std::invalid_argument& e) {
        return std::string("error:") + e.what();
    }
}`,
    hints: ['throw std::invalid_argument("...")', 'try { ... } catch (const std::invalid_argument& e) { e.what() }'],
    testCases: [
      { input: 'tryDivide(10, 2)', expectedOutput: 'ok:5', description: 'قسمة عادية' },
      { input: 'tryDivide(1, 0)', expectedOutput: 'error:division by zero', description: 'قسمة على صفر' },
      { input: 'tryDivide(-9, 3)', expectedOutput: 'ok:-3', description: 'سالب', hidden: true },
      { input: 'safeDivide(8, 4)', expectedOutput: '2', description: 'safeDivide مباشرة', hidden: true },
      { input: 'safeDivide(9, 2)', expectedOutput: '4', description: 'قسمة صحيحة', hidden: true },
    ],
  }),
  X({
    id: 'cppadv-ch-005',
    courseId: 'cpp-advanced',
    afterLessonId: 'cpp-advanced-modern',
    title: 'البحث بـ std::optional',
    description: 'اكتب findIndex(const std::vector<int>&, int) تُرجع std::optional<int> بموقع أول ظهور، أو std::nullopt. ثم describe(...) تُرجع "found at N" أو "not found".',
    difficulty: 'medium',
    points: 35,
    language: 'C++',
    starterCode: `std::optional<int> findIndex(const std::vector<int>& v, int target) {
    return std::nullopt;
}

std::string describe(const std::vector<int>& v, int target) {
    return "";
}`,
    solution: `std::optional<int> findIndex(const std::vector<int>& v, int target) {
    for (size_t i = 0; i < v.size(); i++)
        if (v[i] == target) return static_cast<int>(i);
    return std::nullopt;
}

std::string describe(const std::vector<int>& v, int target) {
    auto idx = findIndex(v, target);
    return idx ? "found at " + std::to_string(*idx) : "not found";
}`,
    hints: ['return std::nullopt عند عدم الوجود', 'if (idx) يفحص وجود قيمة، و*idx يقرأها'],
    testCases: [
      { input: 'describe({5, 7, 9}, 7)', expectedOutput: 'found at 1', description: 'موجود' },
      { input: 'describe({5, 7, 9}, 4)', expectedOutput: 'not found', description: 'غير موجود' },
      { input: 'findIndex({3, 3}, 3).value()', expectedOutput: '0', description: 'أول ظهور', hidden: true },
      { input: 'int r = findIndex({}, 1).has_value(); r', expectedOutput: '0', description: 'فارغة', hidden: true },
      { input: 'int r = findIndex({2}, 2).has_value(); r', expectedOutput: '1', description: 'has_value عند الوجود', hidden: true },
      { input: 'findIndex({4, 8, 8}, 8).value()', expectedOutput: '1', description: 'موقع غير صفري', hidden: true },
    ],
  }),
  X({
    id: 'cppadv-ch-006',
    courseId: 'cpp-advanced',
    afterLessonId: 'cpp-adv-22',
    title: 'دمج الفترات المتداخلة',
    description: 'اكتب mergeIntervals(std::vector<std::pair<int,int>>) تدمج الفترات المتداخلة أو المتلاصقة (end ≥ start التالي) وتُرجع النتيجة مسطحة: [s1, e1, s2, e2, ...] مرتبة.',
    difficulty: 'hard',
    points: 70,
    language: 'C++',
    starterCode: `std::vector<int> mergeIntervals(std::vector<std::pair<int, int>> intervals) {
    return {};
}`,
    solution: `std::vector<int> mergeIntervals(std::vector<std::pair<int, int>> intervals) {
    std::sort(intervals.begin(), intervals.end());
    std::vector<std::pair<int, int>> merged;
    for (const auto& iv : intervals) {
        if (!merged.empty() && iv.first <= merged.back().second)
            merged.back().second = std::max(merged.back().second, iv.second);
        else
            merged.push_back(iv);
    }
    std::vector<int> out;
    for (const auto& m : merged) { out.push_back(m.first); out.push_back(m.second); }
    return out;
}`,
    hints: ['رتّب الفترات حسب البداية', 'إذا بدأت الفترة قبل نهاية الأخيرة: وسّع النهاية', 'std::max للنهاية الجديدة'],
    testCases: [
      { input: 'mergeIntervals({{1, 3}, {2, 6}, {8, 10}})', expectedOutput: '[1, 6, 8, 10]', description: 'تداخل' },
      { input: 'mergeIntervals({{5, 7}, {1, 2}})', expectedOutput: '[1, 2, 5, 7]', description: 'غير مرتبة' },
      { input: 'mergeIntervals({{1, 4}, {4, 5}})', expectedOutput: '[1, 5]', description: 'متلاصقة', hidden: true },
      { input: 'mergeIntervals({{1, 10}, {2, 3}, {4, 5}})', expectedOutput: '[1, 10]', description: 'فترات داخلية', hidden: true },
      { input: 'mergeIntervals({})', expectedOutput: '[]', description: 'فارغة', hidden: true },
    ],
  }),
];

// ============================================================================
// SQL الأساسيات (backend-sql)
// ============================================================================
const SHOP_SCHEMA =
  "CREATE TABLE products(id INTEGER, name TEXT, category TEXT, price REAL);\n" +
  "INSERT INTO products VALUES (1,'Laptop','tech',900),(2,'Mouse','tech',25),(3,'Desk','home',150),(4,'Lamp','home',40),(5,'Phone','tech',600),(6,'Chair','home',120);";

const SQL_BASICS: Challenge[] = [
  X({
    id: 'sql-ch-001',
    courseId: 'backend-sql',
    afterLessonId: 'sql-2',
    title: 'المنتجات الأغلى من 100',
    description: 'اكتب استعلاماً يُرجع اسم وسعر المنتجات التي سعرها أكبر من 100 من جدول products، مرتبة حسب السعر تنازلياً.',
    difficulty: 'easy',
    points: 15,
    language: 'SQL',
    starterCode: `-- الجدول: products(id, name, category, price)
-- اكتب الاستعلام هنا
SELECT name FROM products;`,
    solution: `SELECT name, price FROM products WHERE price > 100 ORDER BY price DESC;`,
    hints: ['WHERE price > 100', 'ORDER BY price DESC'],
    testCases: [
      { input: SHOP_SCHEMA, expectedOutput: 'Laptop|900.0\nPhone|600.0\nDesk|150.0\nChair|120.0', description: 'منتجات المتجر' },
      { input: "CREATE TABLE products(id INTEGER, name TEXT, category TEXT, price REAL);\nINSERT INTO products VALUES (1,'A','x',100),(2,'B','x',101);", expectedOutput: 'B|101.0', description: '100 بالضبط لا تُحتسب', hidden: true },
    ],
  }),
  X({
    id: 'sql-ch-002',
    courseId: 'backend-sql',
    afterLessonId: 'sql-3',
    title: 'الطلبات مع أسماء العملاء',
    description: 'لديك customers(id, name) وorders(id, customer_id, total). أرجع رقم الطلب واسم العميل والمبلغ لكل طلب، مرتبة حسب رقم الطلب.',
    difficulty: 'easy',
    points: 25,
    language: 'SQL',
    starterCode: `-- customers(id, name), orders(id, customer_id, total)
SELECT id FROM orders;`,
    solution: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;`,
    hints: ['JOIN customers ON customers.id = orders.customer_id', 'استخدم أسماء مستعارة o و c'],
    testCases: [
      {
        input: "CREATE TABLE customers(id INTEGER, name TEXT); CREATE TABLE orders(id INTEGER, customer_id INTEGER, total INTEGER);\nINSERT INTO customers VALUES (1,'Ali'),(2,'Sara');\nINSERT INTO orders VALUES (10,2,50),(11,1,70),(12,2,20);",
        expectedOutput: '10|Sara|50\n11|Ali|70\n12|Sara|20',
        description: 'ثلاثة طلبات',
      },
      {
        input: "CREATE TABLE customers(id INTEGER, name TEXT); CREATE TABLE orders(id INTEGER, customer_id INTEGER, total INTEGER);\nINSERT INTO customers VALUES (1,'Omar'),(2,'Mona');\nINSERT INTO orders VALUES (3,1,15);",
        expectedOutput: '3|Omar|15',
        description: 'عميل بلا طلبات لا يظهر',
        hidden: true,
      },
    ],
  }),
  X({
    id: 'sql-ch-003',
    courseId: 'backend-sql',
    afterLessonId: 'sql-4',
    title: 'إحصائيات الفئات',
    description: 'من جدول products أرجع لكل فئة فيها منتجان أو أكثر: اسم الفئة، عدد المنتجات، ومتوسط السعر مقرباً لرقمين، مرتبة حسب الفئة.',
    difficulty: 'medium',
    points: 35,
    language: 'SQL',
    starterCode: `-- products(id, name, category, price)
SELECT category FROM products;`,
    solution: `SELECT category, COUNT(*), ROUND(AVG(price), 2)
FROM products
GROUP BY category
HAVING COUNT(*) >= 2
ORDER BY category;`,
    hints: ['GROUP BY category', 'HAVING يصفّي بعد التجميع', 'ROUND(AVG(price), 2)'],
    testCases: [
      { input: SHOP_SCHEMA, expectedOutput: 'home|3|103.33\ntech|3|508.33', description: 'فئتان' },
      { input: "CREATE TABLE products(id INTEGER, name TEXT, category TEXT, price REAL);\nINSERT INTO products VALUES (1,'A','solo',10),(2,'B','pair',10),(3,'C','pair',21);", expectedOutput: 'pair|2|15.5', description: 'فئة بمنتج واحد تُستبعد', hidden: true },
    ],
  }),
  X({
    id: 'sql-ch-004',
    courseId: 'backend-sql',
    afterLessonId: 'sql-6',
    title: 'رواتب أعلى من متوسط القسم',
    description: 'لديك employees(name, dept, salary). أرجع أسماء الموظفين الذين رواتبهم أعلى من متوسط رواتب قسمهم، مرتبة أبجدياً.',
    difficulty: 'medium',
    points: 45,
    language: 'SQL',
    starterCode: `-- employees(name, dept, salary)
SELECT name FROM employees;`,
    solution: `SELECT e.name
FROM employees e
WHERE e.salary > (SELECT AVG(x.salary) FROM employees x WHERE x.dept = e.dept)
ORDER BY e.name;`,
    hints: ['استعلام فرعي مترابط يحسب متوسط نفس القسم', 'WHERE x.dept = e.dept'],
    testCases: [
      {
        input: "CREATE TABLE employees(name TEXT, dept TEXT, salary INTEGER);\nINSERT INTO employees VALUES ('Ali','it',900),('Sara','it',1500),('Omar','hr',700),('Mona','hr',500),('Zaid','it',1300);",
        expectedOutput: 'Omar\nSara\nZaid',
        description: 'قسمان',
      },
      {
        input: "CREATE TABLE employees(name TEXT, dept TEXT, salary INTEGER);\nINSERT INTO employees VALUES ('A','x',100),('B','x',100);",
        expectedOutput: '',
        description: 'رواتب متساوية: لا أحد أعلى',
        hidden: true,
      },
    ],
  }),
  X({
    id: 'sql-ch-005',
    courseId: 'backend-sql',
    afterLessonId: 'sql-project',
    title: 'أفضل عميل في كل مدينة',
    description: 'لديك customers(id, name, city) وorders(customer_id, total). أرجع لكل مدينة: المدينة واسم العميل الأعلى إنفاقاً ومجموع إنفاقه (عند التعادل الاسم الأصغر أبجدياً)، مرتبة حسب المدينة. العملاء بلا طلبات لا يُحتسبون.',
    difficulty: 'hard',
    points: 75,
    language: 'SQL',
    starterCode: `-- customers(id, name, city), orders(customer_id, total)
SELECT city FROM customers;`,
    solution: `WITH spend AS (
  SELECT c.city, c.name, SUM(o.total) AS total
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id, c.city, c.name
),
ranked AS (
  SELECT city, name, total,
         ROW_NUMBER() OVER (PARTITION BY city ORDER BY total DESC, name) AS rn
  FROM spend
)
SELECT city, name, total FROM ranked WHERE rn = 1 ORDER BY city;`,
    hints: ['اجمع الإنفاق لكل عميل أولاً (CTE)', 'ROW_NUMBER() OVER (PARTITION BY city ORDER BY total DESC, name)', 'خذ الصف رقم 1 من كل مدينة'],
    testCases: [
      {
        input: "CREATE TABLE customers(id INTEGER, name TEXT, city TEXT); CREATE TABLE orders(customer_id INTEGER, total INTEGER);\nINSERT INTO customers VALUES (1,'Ali','Baghdad'),(2,'Sara','Baghdad'),(3,'Omar','Basra'),(4,'Mona','Basra');\nINSERT INTO orders VALUES (1,100),(1,50),(2,120),(3,80),(4,30),(4,20);",
        expectedOutput: 'Baghdad|Ali|150\nBasra|Omar|80',
        description: 'مدينتان',
      },
      {
        input: "CREATE TABLE customers(id INTEGER, name TEXT, city TEXT); CREATE TABLE orders(customer_id INTEGER, total INTEGER);\nINSERT INTO customers VALUES (1,'Zaid','Erbil'),(2,'Huda','Erbil'),(3,'Noor','Mosul');\nINSERT INTO orders VALUES (1,60),(2,60);",
        expectedOutput: 'Erbil|Huda|60',
        description: 'تعادل + مدينة بلا طلبات',
        hidden: true,
      },
    ],
  }),
];

// ============================================================================
// المصادقة والأمان (backend-auth) — Node.js
// ============================================================================
const AUTH: Challenge[] = [
  X({
    id: 'auth-ch-001',
    courseId: 'backend-auth',
    afterLessonId: 'auth-1',
    title: 'سياسة كلمة المرور',
    description: 'اكتب passwordProblems(pw) تُرجع مصفوفة مرتبة بالشروط غير المحققة من: "length" (8 أحرف على الأقل)، "upper" (حرف كبير)، "lower" (حرف صغير)، "digit" (رقم).',
    difficulty: 'easy',
    points: 20,
    language: 'JavaScript',
    starterCode: `function passwordProblems(pw) {
  return [];
}`,
    solution: `function passwordProblems(pw) {
  const problems = [];
  if (pw.length < 8) problems.push('length');
  if (!/[A-Z]/.test(pw)) problems.push('upper');
  if (!/[a-z]/.test(pw)) problems.push('lower');
  if (!/[0-9]/.test(pw)) problems.push('digit');
  return problems.sort();
}`,
    hints: ['استخدم تعابير نمطية مثل /[A-Z]/', 'رتّب الناتج بـ sort()'],
    testCases: [
      { input: 'passwordProblems("abc")', expectedOutput: '["digit","length","upper"]', description: 'قصيرة وضعيفة' },
      { input: 'passwordProblems("Secure123")', expectedOutput: '[]', description: 'قوية' },
      { input: 'passwordProblems("ALLUPPER99")', expectedOutput: '["lower"]', description: 'بلا حروف صغيرة', hidden: true },
      { input: 'passwordProblems("lowercase1")', expectedOutput: '["upper"]', description: 'بلا حروف كبيرة', hidden: true },
    ],
  }),
  X({
    id: 'auth-ch-002',
    courseId: 'backend-auth',
    afterLessonId: 'auth-2',
    title: 'فحص صلاحية JWT',
    description: 'اكتب jwtStatus(token, nowSeconds) تفك الجزء الأوسط (base64url → JSON) وتُرجع "expired" إذا كان exp ≤ now، أو "valid:<sub>"، أو "invalid" إذا كان التوكن لا يتكون من 3 أجزاء أو لا يمكن قراءته. (هذا فحص للقراءة فقط — التحقق من التوقيع يتم على السيرفر بالمفتاح السري).',
    difficulty: 'medium',
    points: 40,
    language: 'JavaScript',
    starterCode: `function jwtStatus(token, nowSeconds) {
  return 'invalid';
}`,
    solution: `function jwtStatus(token, nowSeconds) {
  const parts = String(token).split('.');
  if (parts.length !== 3) return 'invalid';
  try {
    const json = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const payload = JSON.parse(json);
    if (typeof payload.exp !== 'number') return 'invalid';
    return payload.exp <= nowSeconds ? 'expired' : 'valid:' + payload.sub;
  } catch (e) {
    return 'invalid';
  }
}`,
    hints: ['token.split(".") يجب أن يعطي 3 أجزاء', 'Buffer.from(part, "base64") بعد تحويل - و _ إلى + و /', 'JSON.parse داخل try'],
    testCases: [
      { input: 'jwtStatus("h." + Buffer.from(JSON.stringify({ sub: "u1", exp: 2000 })).toString("base64url") + ".s", 1000)', expectedOutput: 'valid:u1', description: 'صالح' },
      { input: 'jwtStatus("h." + Buffer.from(JSON.stringify({ sub: "u1", exp: 500 })).toString("base64url") + ".s", 1000)', expectedOutput: 'expired', description: 'منتهي' },
      { input: 'jwtStatus("not-a-token", 1)', expectedOutput: 'invalid', description: 'شكل خاطئ', hidden: true },
      { input: 'jwtStatus("a.%%%.c", 1)', expectedOutput: 'invalid', description: 'محتوى غير قابل للقراءة', hidden: true },
    ],
  }),
  X({
    id: 'auth-ch-003',
    courseId: 'backend-auth',
    afterLessonId: 'auth-5',
    title: 'تدوير Refresh Tokens مع كشف إعادة الاستخدام',
    description:
      'أنشئ صنف TokenStore: issue(userId) يُرجع توكن جديداً بالشكل "rt-<n>" (n يبدأ من 1). rotate(token) يُبطل التوكن ويُرجع توكناً جديداً لنفس المستخدم. إذا استُخدم توكن مُبطل (إعادة استخدام) تُبطَل كل توكنات المستخدم ويُرجع null. activeCount(userId) يُرجع عدد التوكنات الصالحة.',
    difficulty: 'medium',
    points: 55,
    language: 'JavaScript',
    starterCode: `class TokenStore {
  issue(userId) {}
  rotate(token) {}
  activeCount(userId) {}
}`,
    solution: `class TokenStore {
  constructor() {
    this.n = 0;
    this.tokens = new Map();
  }
  issue(userId) {
    const t = 'rt-' + ++this.n;
    this.tokens.set(t, { userId, active: true });
    return t;
  }
  rotate(token) {
    const rec = this.tokens.get(token);
    if (!rec) return null;
    if (!rec.active) {
      for (const r of this.tokens.values()) if (r.userId === rec.userId) r.active = false;
      return null;
    }
    rec.active = false;
    return this.issue(rec.userId);
  }
  activeCount(userId) {
    let c = 0;
    for (const r of this.tokens.values()) if (r.userId === userId && r.active) c++;
    return c;
  }
}`,
    hints: ['خزّن لكل توكن: المستخدم وهل هو صالح', 'إعادة استخدام توكن مُبطل علامة سرقة: أبطل الكل', 'Map مناسبة للتخزين'],
    testCases: [
      { input: 'const s = new TokenStore(); const a = s.issue("u1"); s.rotate(a)', expectedOutput: 'rt-2', description: 'تدوير' },
      { input: 'const s = new TokenStore(); const a = s.issue("u1"); s.rotate(a); s.activeCount("u1")', expectedOutput: '1', description: 'القديم أُبطل' },
      { input: 'const s = new TokenStore(); const a = s.issue("u1"); s.rotate(a); s.rotate(a)', expectedOutput: 'null', description: 'إعادة الاستخدام مرفوضة', hidden: true },
      { input: 'const s = new TokenStore(); const a = s.issue("u1"); s.issue("u1"); s.rotate(a); s.rotate(a); s.activeCount("u1")', expectedOutput: '0', description: 'إبطال كل التوكنات', hidden: true },
    ],
  }),
  X({
    id: 'auth-ch-004',
    courseId: 'backend-auth',
    afterLessonId: 'auth-rate-limit-mfa',
    title: 'رمز التحقق الثنائي TOTP',
    description: 'اكتب totp(secretHex, timeSeconds, digits) حسب RFC 6238: العداد = floor(time / 30) كـ 8 بايت، HMAC-SHA1 بالسر، ثم الاقتطاع الديناميكي، وأرجع الرمز كنص بطول digits مع أصفار بادئة.',
    difficulty: 'hard',
    points: 90,
    language: 'JavaScript',
    starterCode: `const crypto = require('crypto');

function totp(secretHex, timeSeconds, digits = 6) {
  return '';
}`,
    solution: `const crypto = require('crypto');

function totp(secretHex, timeSeconds, digits = 6) {
  const counter = Math.floor(timeSeconds / 30);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', Buffer.from(secretHex, 'hex')).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  return String(code % 10 ** digits).padStart(digits, '0');
}`,
    hints: ['Buffer.alloc(8) ثم writeBigUInt64BE للعداد', 'offset = آخر بايت & 0x0f', 'خذ 4 بايتات من offset، احذف البت الأعلى، ثم باقي القسمة على 10^digits'],
    testCases: [
      { input: 'totp("3132333435363738393031323334353637383930", 59, 8)', expectedOutput: '94287082', description: 'متجه RFC 6238 (59)' },
      { input: 'totp("3132333435363738393031323334353637383930", 1111111109, 8)', expectedOutput: '07081804', description: 'أصفار بادئة' },
      { input: 'totp("3132333435363738393031323334353637383930", 59, 6)', expectedOutput: '287082', description: '6 أرقام', hidden: true },
      { input: 'totp("3132333435363738393031323334353637383930", 1234567890, 8)', expectedOutput: '89005924', description: 'متجه RFC آخر', hidden: true },
    ],
  }),
];

// ============================================================================
// Supabase (backend-supabase)
// ============================================================================
const SUPA: Challenge[] = [
  X({
    id: 'supa-ch-001',
    courseId: 'backend-supabase',
    afterLessonId: 'supa-6',
    title: 'بناء فلاتر PostgREST',
    description: 'اكتب toPostgrest(filters) تحوّل كائناً مثل { age: ["gt", 18], name: ["eq", "Ali"] } إلى "age=gt.18&name=eq.Ali" (المفاتيح مرتبة أبجدياً، والقيم مرمّزة بـ encodeURIComponent). العمليات المسموحة: eq, neq, gt, gte, lt, lte، وغيرها يطلق Error.',
    difficulty: 'easy',
    points: 25,
    language: 'JavaScript',
    starterCode: `function toPostgrest(filters) {
  return '';
}`,
    solution: `function toPostgrest(filters) {
  const ops = new Set(['eq', 'neq', 'gt', 'gte', 'lt', 'lte']);
  return Object.keys(filters)
    .sort()
    .map((k) => {
      const [op, value] = filters[k];
      if (!ops.has(op)) throw new Error('bad operator');
      return k + '=' + op + '.' + encodeURIComponent(value);
    })
    .join('&');
}`,
    hints: ['Object.keys(filters).sort()', 'encodeURIComponent للقيمة', 'join("&")'],
    testCases: [
      { input: 'toPostgrest({ age: ["gt", 18], name: ["eq", "Ali"] })', expectedOutput: 'age=gt.18&name=eq.Ali', description: 'فلتران' },
      { input: 'toPostgrest({ title: ["eq", "a b&c"] })', expectedOutput: 'title=eq.a%20b%26c', description: 'ترميز القيم' },
      { input: 'toPostgrest({})', expectedOutput: '', description: 'بلا فلاتر', hidden: true },
      { input: 'const rejected = (f) => { try { f(); return "no"; } catch (e) { return "rejected"; } }; rejected(() => toPostgrest({ x: ["drop", 1] }))', expectedOutput: 'rejected', description: 'عملية غير مسموحة', hidden: true },
      { input: 'const q = toPostgrest({ b: ["lte", 2], a: ["neq", 1] }); q', expectedOutput: 'a=neq.1&b=lte.2', description: 'ترتيب المفاتيح', hidden: true },
    ],
  }),
  X({
    id: 'supa-ch-002',
    courseId: 'backend-supabase',
    afterLessonId: 'supa-2',
    title: 'محاكاة سياسة RLS',
    description: 'اكتب visibleNoteIds(notes, userId, teamIds) تُرجع معرفات الملاحظات التي يراها المستخدم حسب سياسة: المالك owner_id = userId، أو الملاحظة عامة is_public، أو تخص فريقاً من teamIds. الناتج مرتب تصاعدياً. بدون مستخدم (userId = null) تظهر العامة فقط.',
    difficulty: 'medium',
    points: 35,
    language: 'JavaScript',
    starterCode: `function visibleNoteIds(notes, userId, teamIds) {
  return [];
}`,
    solution: `function visibleNoteIds(notes, userId, teamIds) {
  const teams = new Set(userId ? teamIds : []);
  return notes
    .filter((n) => n.is_public || (userId && n.owner_id === userId) || (n.team_id && teams.has(n.team_id)))
    .map((n) => n.id)
    .sort((a, b) => a - b);
}`,
    hints: ['ثلاثة شروط مربوطة بـ OR', 'المستخدم غير المسجل لا يملك فرقاً', 'رتّب الأرقام بدالة مقارنة'],
    testCases: [
      { input: 'visibleNoteIds([{ id: 2, owner_id: "u1" }, { id: 1, owner_id: "u2", is_public: true }, { id: 3, owner_id: "u2" }], "u1", [])', expectedOutput: '[1,2]', description: 'المالك + العامة' },
      { input: 'visibleNoteIds([{ id: 5, owner_id: "u9", team_id: "t1" }, { id: 6, owner_id: "u9", team_id: "t2" }], "u1", ["t1"])', expectedOutput: '[5]', description: 'ملاحظات الفريق' },
      { input: 'visibleNoteIds([{ id: 1, owner_id: "u1" }, { id: 2, is_public: true, team_id: "t1" }, { id: 3, team_id: "t1" }], null, ["t1"])', expectedOutput: '[2]', description: 'زائر', hidden: true },
    ],
  }),
  X({
    id: 'supa-ch-003',
    courseId: 'backend-supabase',
    afterLessonId: 'supa-3',
    title: 'تطبيق أحداث Realtime',
    description: 'اكتب applyChanges(rows, events) حيث كل حدث { type: "INSERT" | "UPDATE" | "DELETE", record }. طبّق الأحداث بالترتيب على نسخة من الصفوف (حسب id) وأرجع الصفوف مرتبة حسب id. UPDATE لصف غير موجود يُتجاهل.',
    difficulty: 'medium',
    points: 40,
    language: 'JavaScript',
    starterCode: `function applyChanges(rows, events) {
  return rows;
}`,
    solution: `function applyChanges(rows, events) {
  const byId = new Map(rows.map((r) => [r.id, { ...r }]));
  for (const e of events) {
    const r = e.record;
    if (e.type === 'INSERT') byId.set(r.id, { ...r });
    else if (e.type === 'UPDATE' && byId.has(r.id)) byId.set(r.id, { ...byId.get(r.id), ...r });
    else if (e.type === 'DELETE') byId.delete(r.id);
  }
  return [...byId.values()].sort((a, b) => a.id - b.id);
}`,
    hints: ['Map حسب id يسهّل التحديث والحذف', 'لا تعدّل المصفوفة الأصلية', 'UPDATE يدمج الحقول الجديدة'],
    testCases: [
      { input: 'applyChanges([{ id: 1, t: "a" }], [{ type: "INSERT", record: { id: 2, t: "b" } }])', expectedOutput: '[{"id":1,"t":"a"},{"id":2,"t":"b"}]', description: 'إضافة' },
      { input: 'applyChanges([{ id: 1, t: "a" }, { id: 2, t: "b" }], [{ type: "UPDATE", record: { id: 1, t: "z" } }, { type: "DELETE", record: { id: 2 } }])', expectedOutput: '[{"id":1,"t":"z"}]', description: 'تعديل وحذف' },
      { input: 'applyChanges([], [{ type: "UPDATE", record: { id: 9, t: "x" } }])', expectedOutput: '[]', description: 'تعديل صف غير موجود', hidden: true },
      { input: 'const base = [{ id: 1, t: "a" }]; applyChanges(base, [{ type: "UPDATE", record: { id: 1, t: "b" } }]); base[0].t', expectedOutput: 'a', description: 'الأصل لا يتغير', hidden: true },
      { input: 'const base = [{ id: 2, t: "q" }]; applyChanges(base, [{ type: "INSERT", record: { id: 3 } }]).length', expectedOutput: '2', description: 'عدد الصفوف', hidden: true },
    ],
  }),
  X({
    id: 'supa-ch-004',
    courseId: 'backend-supabase',
    afterLessonId: 'supa-4',
    title: 'مسار تخزين آمن',
    description: 'اكتب safeStoragePath(userId, filename) تُرجع "<userId>/<filename>" فقط إذا كان الاسم بدون / أو \\ أو ..، والامتداد من png, jpg, jpeg, pdf (حالة الأحرف لا تهم)، وإلا تُرجع null. هكذا يبقى كل مستخدم داخل مجلده.',
    difficulty: 'easy',
    points: 25,
    language: 'JavaScript',
    starterCode: `function safeStoragePath(userId, filename) {
  return null;
}`,
    solution: `function safeStoragePath(userId, filename) {
  if (!filename || /[\\\\/]/.test(filename) || filename.includes('..')) return null;
  const m = filename.match(/\\.([A-Za-z0-9]+)$/);
  if (!m || !['png', 'jpg', 'jpeg', 'pdf'].includes(m[1].toLowerCase())) return null;
  return userId + '/' + filename;
}`,
    hints: ['ارفض أي فاصل مسار ".." أو "/"', 'استخرج الامتداد بتعبير نمطي ثم toLowerCase()'],
    testCases: [
      { input: 'safeStoragePath("u1", "avatar.PNG")', expectedOutput: 'u1/avatar.PNG', description: 'ملف صالح' },
      { input: 'safeStoragePath("u1", "../u2/secret.pdf")', expectedOutput: 'null', description: 'محاولة الخروج من المجلد' },
      { input: 'safeStoragePath("u1", "script.js")', expectedOutput: 'null', description: 'امتداد غير مسموح', hidden: true },
      { input: 'safeStoragePath("u7", "cv.pdf")', expectedOutput: 'u7/cv.pdf', description: 'PDF', hidden: true },
    ],
  }),
];

// ============================================================================
// Firebase (backend-firebase)
// ============================================================================
const FIRE: Challenge[] = [
  X({
    id: 'fire-ch-001',
    courseId: 'backend-firebase',
    afterLessonId: 'firebase-2',
    title: 'مسارات Firestore',
    description: 'اكتب pathKind(path) تُرجع "document" إذا كان المسار بعدد زوجي من الأجزاء (users/u1)، و"collection" إذا كان فردياً (users أو users/u1/posts)، و"invalid" إذا كان فارغاً أو فيه جزء فارغ (مثل users//u1).',
    difficulty: 'easy',
    points: 20,
    language: 'JavaScript',
    starterCode: `function pathKind(path) {
  return 'invalid';
}`,
    solution: `function pathKind(path) {
  if (!path) return 'invalid';
  const parts = path.split('/');
  if (parts.some((p) => p === '')) return 'invalid';
  return parts.length % 2 === 0 ? 'document' : 'collection';
}`,
    hints: ['path.split("/")', 'عدد زوجي = مستند، فردي = مجموعة'],
    testCases: [
      { input: 'pathKind("users/u1")', expectedOutput: 'document', description: 'مستند' },
      { input: 'pathKind("users/u1/posts")', expectedOutput: 'collection', description: 'مجموعة فرعية' },
      { input: 'pathKind("users//u1")', expectedOutput: 'invalid', description: 'جزء فارغ', hidden: true },
      { input: 'pathKind("rooms")', expectedOutput: 'collection', description: 'مجموعة جذر', hidden: true },
    ],
  }),
  X({
    id: 'fire-ch-002',
    courseId: 'backend-firebase',
    afterLessonId: 'firebase-5',
    title: 'تقييم قاعدة أمان',
    description:
      'اكتب canUpdatePost(request, resource) تحاكي قاعدة: مسموح فقط إذا كان المستخدم مسجلاً (request.auth)، وهو مالك المستند (request.auth.uid === resource.ownerId)، ولا يغيّر ownerId (request.data.ownerId === resource.ownerId)، وطول title بين 1 و100.',
    difficulty: 'medium',
    points: 40,
    language: 'JavaScript',
    starterCode: `function canUpdatePost(request, resource) {
  return false;
}`,
    solution: `function canUpdatePost(request, resource) {
  if (!request.auth) return false;
  const d = request.data || {};
  const title = typeof d.title === 'string' ? d.title : '';
  return (
    request.auth.uid === resource.ownerId &&
    d.ownerId === resource.ownerId &&
    title.length >= 1 &&
    title.length <= 100
  );
}`,
    hints: ['كل الشروط يجب أن تتحقق (AND)', 'ارفض فوراً إذا لم يكن هناك auth', 'لا تثق بـ ownerId القادم من العميل: قارنه بالقيمة المخزنة'],
    testCases: [
      { input: 'canUpdatePost({ auth: { uid: "a" }, data: { ownerId: "a", title: "Hi" } }, { ownerId: "a" })', expectedOutput: 'true', description: 'المالك يعدّل' },
      { input: 'canUpdatePost({ auth: { uid: "b" }, data: { ownerId: "a", title: "Hi" } }, { ownerId: "a" })', expectedOutput: 'false', description: 'مستخدم آخر' },
      { input: 'canUpdatePost({ auth: { uid: "a" }, data: { ownerId: "b", title: "Hi" } }, { ownerId: "a" })', expectedOutput: 'false', description: 'محاولة نقل الملكية', hidden: true },
      { input: 'canUpdatePost({ auth: null, data: {} }, { ownerId: "a" })', expectedOutput: 'false', description: 'غير مسجل', hidden: true },
      { input: 'canUpdatePost({ auth: { uid: "a" }, data: { ownerId: "a", title: "" } }, { ownerId: "a" })', expectedOutput: 'false', description: 'عنوان فارغ', hidden: true },
    ],
  }),
  X({
    id: 'fire-ch-003',
    courseId: 'backend-firebase',
    afterLessonId: 'firebase-project',
    title: 'ترقيم رسائل الدردشة',
    description: 'اكتب nextPage(messages, pageSize, afterTs) تُرجع { items, nextCursor }: الرسائل ذات ts أكبر من afterTs (أو كلها إذا كان afterTs = null) مرتبة تصاعدياً حسب ts، بحد pageSize، وnextCursor = ts لآخر عنصر إن وُجدت رسائل بعده، وإلا null. items تحتوي النصوص text فقط.',
    difficulty: 'medium',
    points: 45,
    language: 'JavaScript',
    starterCode: `function nextPage(messages, pageSize, afterTs) {
  return { items: [], nextCursor: null };
}`,
    solution: `function nextPage(messages, pageSize, afterTs) {
  const sorted = messages
    .filter((m) => afterTs === null || m.ts > afterTs)
    .sort((a, b) => a.ts - b.ts);
  const page = sorted.slice(0, pageSize);
  const hasMore = sorted.length > pageSize;
  return { items: page.map((m) => m.text), nextCursor: hasMore ? page[page.length - 1].ts : null };
}`,
    hints: ['صفِّ ثم رتّب ثم اقطع slice(0, pageSize)', 'nextCursor فقط إذا بقيت رسائل بعد الصفحة'],
    testCases: [
      { input: 'nextPage([{ ts: 3, text: "c" }, { ts: 1, text: "a" }, { ts: 2, text: "b" }], 2, null)', expectedOutput: '{"items":["a","b"],"nextCursor":2}', description: 'الصفحة الأولى' },
      { input: 'nextPage([{ ts: 3, text: "c" }, { ts: 1, text: "a" }, { ts: 2, text: "b" }], 2, 2)', expectedOutput: '{"items":["c"],"nextCursor":null}', description: 'الصفحة الأخيرة' },
      { input: 'nextPage([], 5, null)', expectedOutput: '{"items":[],"nextCursor":null}', description: 'بلا رسائل', hidden: true },
    ],
  }),
  X({
    id: 'fire-ch-004',
    courseId: 'backend-firebase',
    afterLessonId: 'firebase-4',
    title: 'تصفية رفع الملفات',
    description: 'اكتب allowedUploads(files, maxMB) تُرجع أسماء الملفات المسموح رفعها: نوعها يبدأ بـ "image/" وحجمها (bytes) لا يتجاوز maxMB ميغابايت (1MB = 1024×1024)، بنفس ترتيبها.',
    difficulty: 'easy',
    points: 20,
    language: 'JavaScript',
    starterCode: `function allowedUploads(files, maxMB) {
  return [];
}`,
    solution: `function allowedUploads(files, maxMB) {
  const limit = maxMB * 1024 * 1024;
  return files.filter((f) => String(f.type).startsWith('image/') && f.size <= limit).map((f) => f.name);
}`,
    hints: ['startsWith("image/")', 'حوّل الميغابايت إلى bytes'],
    testCases: [
      { input: 'allowedUploads([{ name: "a.png", type: "image/png", size: 1000 }, { name: "b.exe", type: "application/x-msdownload", size: 10 }], 1)', expectedOutput: '["a.png"]', description: 'صورة فقط' },
      { input: 'allowedUploads([{ name: "big.jpg", type: "image/jpeg", size: 3 * 1024 * 1024 }], 2)', expectedOutput: '[]', description: 'حجم كبير' },
      { input: 'allowedUploads([{ name: "x.gif", type: "image/gif", size: 2 * 1024 * 1024 }], 2)', expectedOutput: '["x.gif"]', description: 'على الحد بالضبط', hidden: true },
    ],
  }),
];

// ============================================================================
// MongoDB (backend-mongodb)
// ============================================================================
const MONGO: Challenge[] = [
  X({
    id: 'mongo-ch-001',
    courseId: 'backend-mongodb',
    afterLessonId: 'mongo-3',
    title: 'مطابقة استعلامات find',
    description: 'اكتب findIds(docs, query) تُرجع _id للمستندات المطابقة. الاستعلام يدعم المساواة المباشرة { role: "admin" } والمعاملات { age: { $gt: 18, $lte: 30 } } ($gt, $gte, $lt, $lte, $ne). كل الشروط مطلوبة.',
    difficulty: 'medium',
    points: 40,
    language: 'JavaScript',
    starterCode: `function findIds(docs, query) {
  return [];
}`,
    solution: `function findIds(docs, query) {
  const ops = {
    $gt: (a, b) => a > b,
    $gte: (a, b) => a >= b,
    $lt: (a, b) => a < b,
    $lte: (a, b) => a <= b,
    $ne: (a, b) => a !== b,
  };
  const match = (doc) =>
    Object.entries(query).every(([field, cond]) => {
      if (cond !== null && typeof cond === 'object') {
        return Object.entries(cond).every(([op, v]) => ops[op] && ops[op](doc[field], v));
      }
      return doc[field] === cond;
    });
  return docs.filter(match).map((d) => d._id);
}`,
    hints: ['كل حقل في الاستعلام: قيمة مباشرة أو كائن معاملات', 'every للشروط المتعددة', 'خريطة من اسم المعامل إلى دالة مقارنة'],
    testCases: [
      { input: 'findIds([{ _id: 1, role: "admin" }, { _id: 2, role: "user" }], { role: "admin" })', expectedOutput: '[1]', description: 'مساواة' },
      { input: 'findIds([{ _id: 1, age: 17 }, { _id: 2, age: 25 }, { _id: 3, age: 40 }], { age: { $gt: 18, $lte: 30 } })', expectedOutput: '[2]', description: 'مدى' },
      { input: 'findIds([{ _id: 1, s: "a" }, { _id: 2, s: "b" }], { s: { $ne: "a" } })', expectedOutput: '[2]', description: '$ne', hidden: true },
      { input: 'findIds([{ _id: 1, a: 1, b: 2 }, { _id: 2, a: 1, b: 3 }], { a: 1, b: { $gte: 3 } })', expectedOutput: '[2]', description: 'شروط مركبة', hidden: true },
    ],
  }),
  X({
    id: 'mongo-ch-002',
    courseId: 'backend-mongodb',
    afterLessonId: 'mongo-5',
    title: 'تجميع $group مع $sum',
    description: 'اكتب groupSum(docs, key, field) تحاكي { $group: { _id: "$key", total: { $sum: "$field" } } } وتُرجع مصفوفة { _id, total } مرتبة حسب total تنازلياً ثم _id تصاعدياً.',
    difficulty: 'medium',
    points: 35,
    language: 'JavaScript',
    starterCode: `function groupSum(docs, key, field) {
  return [];
}`,
    solution: `function groupSum(docs, key, field) {
  const totals = new Map();
  for (const d of docs) totals.set(d[key], (totals.get(d[key]) || 0) + (d[field] || 0));
  return [...totals.entries()]
    .map(([_id, total]) => ({ _id, total }))
    .sort((a, b) => b.total - a.total || String(a._id).localeCompare(String(b._id)));
}`,
    hints: ['Map من المفتاح إلى المجموع', 'رتّب بمقارنتين'],
    testCases: [
      { input: 'groupSum([{ c: "x", v: 2 }, { c: "y", v: 5 }, { c: "x", v: 4 }], "c", "v")', expectedOutput: '[{"_id":"x","total":6},{"_id":"y","total":5}]', description: 'فئتان' },
      { input: 'groupSum([{ c: "b", v: 1 }, { c: "a", v: 1 }], "c", "v")', expectedOutput: '[{"_id":"a","total":1},{"_id":"b","total":1}]', description: 'تعادل', hidden: true },
      { input: 'groupSum([], "c", "v")', expectedOutput: '[]', description: 'فارغة', hidden: true },
    ],
  }),
  X({
    id: 'mongo-ch-003',
    courseId: 'backend-mongodb',
    afterLessonId: 'mongo-4',
    title: 'محاكاة populate',
    description: 'اكتب populate(posts, users) تُرجع نسخة من المنشورات يُستبدل فيها author (معرّف) بكائن { _id, name } للمستخدم، أو null إذا لم يوجد. لا تعدّل المدخلات.',
    difficulty: 'easy',
    points: 25,
    language: 'JavaScript',
    starterCode: `function populate(posts, users) {
  return posts;
}`,
    solution: `function populate(posts, users) {
  const byId = new Map(users.map((u) => [u._id, { _id: u._id, name: u.name }]));
  return posts.map((p) => ({ ...p, author: byId.get(p.author) || null }));
}`,
    hints: ['Map من _id إلى المستخدم', 'map مع نسخ المنشور { ...p }'],
    testCases: [
      { input: 'populate([{ _id: "p1", author: "u1" }], [{ _id: "u1", name: "Ali", password: "x" }])', expectedOutput: '[{"_id":"p1","author":{"_id":"u1","name":"Ali"}}]', description: 'مؤلف موجود (بلا حقول حساسة)' },
      { input: 'populate([{ _id: "p2", author: "u9" }], [])', expectedOutput: '[{"_id":"p2","author":null}]', description: 'مؤلف محذوف' },
      { input: 'const posts = [{ _id: "p1", author: "u1" }]; populate(posts, [{ _id: "u1", name: "A" }]); posts[0].author', expectedOutput: 'u1', description: 'المدخلات لا تتغير', hidden: true },
      { input: 'const out = populate([{ _id: "p", author: "u" }], [{ _id: "u", name: "Noor" }]); out[0].author.name', expectedOutput: 'Noor', description: 'اسم المؤلف', hidden: true },
    ],
  }),
  X({
    id: 'mongo-ch-004',
    courseId: 'backend-mongodb',
    afterLessonId: 'mongo-project',
    title: 'منفّذ Aggregation Pipeline',
    description:
      'اكتب runPipeline(docs, stages) يدعم المراحل: { $match: {field: value} } (مساواة)، { $sort: {field: 1 | -1} }، { $limit: n }، { $project: {field: 1, ...} } (يُبقي الحقول المذكورة فقط). طبّق المراحل بالترتيب على نسخة من المستندات.',
    difficulty: 'hard',
    points: 80,
    language: 'JavaScript',
    starterCode: `function runPipeline(docs, stages) {
  return docs;
}`,
    solution: `function runPipeline(docs, stages) {
  let out = docs.map((d) => ({ ...d }));
  for (const stage of stages) {
    const [op, arg] = Object.entries(stage)[0];
    if (op === '$match') {
      out = out.filter((d) => Object.entries(arg).every(([k, v]) => d[k] === v));
    } else if (op === '$sort') {
      const [k, dir] = Object.entries(arg)[0];
      out = [...out].sort((a, b) => (a[k] > b[k] ? dir : a[k] < b[k] ? -dir : 0));
    } else if (op === '$limit') {
      out = out.slice(0, arg);
    } else if (op === '$project') {
      const keep = Object.keys(arg).filter((k) => arg[k]);
      out = out.map((d) => Object.fromEntries(keep.filter((k) => k in d).map((k) => [k, d[k]])));
    } else {
      throw new Error('unsupported stage ' + op);
    }
  }
  return out;
}`,
    hints: ['كل مرحلة كائن بمفتاح واحد: Object.entries(stage)[0]', '$sort: dir = 1 تصاعدي و -1 تنازلي', '$project: Object.fromEntries'],
    testCases: [
      {
        input: 'runPipeline([{ n: "a", age: 30, city: "B" }, { n: "b", age: 20, city: "B" }, { n: "c", age: 40, city: "M" }], [{ $match: { city: "B" } }, { $sort: { age: 1 } }, { $project: { n: 1 } }])',
        expectedOutput: '[{"n":"b"},{"n":"a"}]',
        description: 'match + sort + project',
      },
      {
        input: 'runPipeline([{ v: 1 }, { v: 3 }, { v: 2 }], [{ $sort: { v: -1 } }, { $limit: 2 }])',
        expectedOutput: '[{"v":3},{"v":2}]',
        description: 'sort تنازلي + limit',
      },
      { input: 'runPipeline([{ a: 1, b: 2 }], [])', expectedOutput: '[{"a":1,"b":2}]', description: 'بلا مراحل', hidden: true },
      { input: 'const rejected = (f) => { try { f(); return "no"; } catch (e) { return "rejected"; } }; rejected(() => runPipeline([], [{ $out: "x" }]))', expectedOutput: 'rejected', description: 'مرحلة غير مدعومة', hidden: true },
      { input: 'const r = runPipeline([{ x: 1 }, { x: 2 }], [{ $match: { x: 2 } }]); r.length', expectedOutput: '1', description: 'match وحده', hidden: true },
    ],
  }),
];

// ============================================================================
// CSS (web-css-styling) — تحقق بنيوي بالمتطلبات
// ============================================================================
const CSS_T = [{ input: '', expectedOutput: 'structure', description: 'المتطلبات البنيوية' }];
const CSS_CH: Challenge[] = [
  X({
    id: 'cssx-ch-001',
    courseId: 'web-css-styling',
    afterLessonId: 'css-8',
    title: 'توسيط بـ Flexbox',
    description: 'اجعل .center حاوية Flex تضع محتواها في المنتصف أفقياً وعمودياً، وبارتفاع 100vh.',
    difficulty: 'easy',
    points: 15,
    language: 'CSS',
    starterCode: `.center {
  /* اكتب التنسيق هنا */
}`,
    solution: `.center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}`,
    hints: ['display: flex', 'justify-content للمحور الرئيسي وalign-items للمحور العرضي'],
    testCases: CSS_T,
    checks: [
      { pattern: '\\.center\\s*\\{[^}]*display\\s*:\\s*flex', message: '.center يستخدم display: flex' },
      { pattern: '\\.center\\s*\\{[^}]*justify-content\\s*:\\s*center', message: 'توسيط أفقي بـ justify-content: center' },
      { pattern: '\\.center\\s*\\{[^}]*align-items\\s*:\\s*center', message: 'توسيط عمودي بـ align-items: center' },
      { pattern: '\\.center\\s*\\{[^}]*height\\s*:\\s*100vh', message: 'الارتفاع 100vh' },
    ],
  }),
  X({
    id: 'cssx-ch-002',
    courseId: 'web-css-styling',
    afterLessonId: 'css-10',
    title: 'شبكة بطاقات بـ Grid',
    description: 'اجعل .cards شبكة Grid بثلاثة أعمدة متساوية (repeat(3, 1fr)) وفجوة 16px.',
    difficulty: 'easy',
    points: 20,
    language: 'CSS',
    starterCode: `.cards {
  /* اكتب التنسيق هنا */
}`,
    solution: `.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}`,
    hints: ['display: grid', 'grid-template-columns: repeat(3, 1fr)'],
    testCases: CSS_T,
    checks: [
      { pattern: '\\.cards\\s*\\{[^}]*display\\s*:\\s*grid', message: '.cards يستخدم display: grid' },
      { pattern: 'grid-template-columns\\s*:\\s*repeat\\(\\s*3\\s*,\\s*1fr\\s*\\)', message: 'ثلاثة أعمدة متساوية repeat(3, 1fr)' },
      { pattern: '(?:^|[;{\\s])gap\\s*:\\s*16px', message: 'فجوة 16px' },
    ],
  }),
  X({
    id: 'cssx-ch-003',
    courseId: 'web-css-styling',
    afterLessonId: 'css-12',
    title: 'تصميم متجاوب بـ Media Query',
    description: 'الشبكة .cards بثلاثة أعمدة افتراضياً. أضف @media (max-width: 600px) يجعلها عموداً واحداً (grid-template-columns: 1fr).',
    difficulty: 'medium',
    points: 30,
    language: 'CSS',
    starterCode: `.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

/* أضف media query للشاشات الصغيرة */`,
    solution: `.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 600px) {
  .cards {
    grid-template-columns: 1fr;
  }
}`,
    hints: ['@media (max-width: 600px) { ... }', 'داخلها أعد تعريف .cards'],
    testCases: CSS_T,
    checks: [
      { pattern: '@media\\s*\\(\\s*max-width\\s*:\\s*600px\\s*\\)', message: 'media query بـ max-width: 600px' },
      { pattern: '@media[^{]*\\{\\s*\\.cards\\s*\\{[^}]*grid-template-columns\\s*:\\s*1fr', message: 'عمود واحد داخل media query' },
      { pattern: 'repeat\\(\\s*3\\s*,\\s*1fr\\s*\\)', message: 'الثلاثة أعمدة الافتراضية باقية' },
    ],
  }),
  X({
    id: 'cssx-ch-004',
    courseId: 'web-css-styling',
    afterLessonId: 'css-11',
    title: 'سمة ألوان بالمتغيرات',
    description: 'عرّف في :root المتغيرين --primary و--bg، ثم استخدمهما في .btn (background: var(--primary)) وbody (background: var(--bg)). أضف .dark يعيد تعريف --bg.',
    difficulty: 'medium',
    points: 30,
    language: 'CSS',
    starterCode: `:root {
  /* عرّف المتغيرات */
}

body {
}

.btn {
}`,
    solution: `:root {
  --primary: #6d28d9;
  --bg: #ffffff;
}

body {
  background: var(--bg);
}

.btn {
  background: var(--primary);
}

.dark {
  --bg: #0f0f1e;
}`,
    hints: ['المتغيرات تبدأ بـ --', 'var(--اسم) لاستخدامها', 'إعادة تعريف المتغير في .dark تغيّر كل من يستخدمه'],
    testCases: CSS_T,
    checks: [
      { pattern: ':root\\s*\\{[^}]*--primary\\s*:', message: 'تعريف --primary في :root' },
      { pattern: ':root\\s*\\{[^}]*--bg\\s*:', message: 'تعريف --bg في :root' },
      { pattern: '\\.btn\\s*\\{[^}]*background(?:-color)?\\s*:\\s*var\\(\\s*--primary\\s*\\)', message: '.btn يستخدم var(--primary)' },
      { pattern: 'body\\s*\\{[^}]*background(?:-color)?\\s*:\\s*var\\(\\s*--bg\\s*\\)', message: 'body يستخدم var(--bg)' },
      { pattern: '\\.dark\\s*\\{[^}]*--bg\\s*:', message: '.dark يعيد تعريف --bg' },
    ],
  }),
];

export const EXPANSION_CHALLENGES: Challenge[] = [
  ...PY_OOP,
  ...PY_ADV,
  ...AI_BASICS,
  ...AI_ML,
  ...AI_DL,
  ...CYBER_DEF,
  ...CPP_OOP,
  ...CPP_ADV,
  ...SQL_BASICS,
  ...AUTH,
  ...SUPA,
  ...FIRE,
  ...MONGO,
  ...CSS_CH,
];

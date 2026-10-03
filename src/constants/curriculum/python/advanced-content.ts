/**
 * شرح دروس py-advanced (يُدمج مع إصلاحات الأمثلة في advanced.ts).
 */
import type { Lesson } from '../../courseData';
import type { NewLesson } from '../types';
import { md } from '../md';

export const PY_ADVANCED_CONTENT: Record<string, Partial<Lesson>> = {
  'py-adv-7': {
    title: 'الدوال كقيم: Lambda والدوال العليا والإغلاقات',
    content: md`
# الدوال كقيم: Lambda والدوال العليا والإغلاقات

في Python **الدالة كائن مثل أي قيمة**: يمكن وضعها في متغير، وتمريرها لدالة أخرى، وإرجاعها من دالة. هذه الفكرة أساس كل ما في هذه الدورة تقريباً (decorators، مفاتيح الترتيب، callbacks).

\`\`\`python
def shout(text):
    return text.upper() + "!"

speak = shout          # بدون أقواس: لا نستدعي الدالة، بل نشير إليها
print(speak("مرحبا"))
\`\`\`

## الدوال العليا (Higher-Order Functions)
دالة تأخذ دالة كمعامل أو ترجع دالة:
\`\`\`python
def apply_twice(func, value):
    return func(func(value))

print(apply_twice(lambda x: x * 3, 2))   # 18
\`\`\`

## lambda
دالة صغيرة بلا اسم من **تعبير واحد**: \`lambda المعاملات: التعبير\`. مناسبة للاستخدام لمرة واحدة كمعامل (\`key=lambda p: p.price\`). إذا احتجت أكثر من تعبير أو اسماً واضحاً، اكتب \`def\`.

## map و filter و reduce
\`\`\`python
nums = [1, 2, 3, 4, 5]
list(map(lambda n: n * 2, nums))        # [2, 4, 6, 8, 10]
list(filter(lambda n: n % 2, nums))     # [1, 3, 5]
from functools import reduce
reduce(lambda acc, n: acc + n, nums)    # 15
\`\`\`
في Python الحديثة غالباً تكون comprehensions أوضح من map و filter: \`[n * 2 for n in nums]\`. أما reduce فاستخدم بدلها دوالاً جاهزة مثل \`sum\` و \`max\` و \`math.prod\` كلما أمكن.

## الإغلاق (Closure)
دالة داخلية **تتذكر المتغيرات** من الدالة التي أنشأتها حتى بعد انتهائها:
\`\`\`python
def make_multiplier(factor):
    def multiply(x):
        return x * factor      # factor من النطاق الخارجي
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5), triple(5))    # 10 15
\`\`\`
كل استدعاء لـ \`make_multiplier\` ينشئ دالة جديدة تحمل قيمة \`factor\` الخاصة بها. هذا بالضبط ما تقوم عليه الـ decorators في الدرس التالي.

## nonlocal
لتعديل (وليس فقط قراءة) متغير من النطاق الخارجي داخل الإغلاق:
\`\`\`python
def counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

c = counter()
print(c(), c(), c())   # 1 2 3
\`\`\`

## functools.partial
تثبيت بعض معاملات دالة لإنشاء دالة أبسط: \`partial(pow, exp=2)\`.

## فخ شائع: الإغلاق داخل حلقة
\`\`\`python
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])        # [2, 2, 2] وليس [0, 1, 2]
funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])        # [0, 1, 2]
\`\`\`
الإغلاق يتذكر **المتغير** لا قيمته لحظة الإنشاء؛ القيمة الافتراضية \`i=i\` تثبّت القيمة.

## تمرين
اكتب \`make_validator(min_len)\` ترجع دالة تتحقق من طول كلمة مرور، و \`make_counter()\` ترجع دالتين: زيادة وإعادة تعيين، تتشاركان نفس العدّاد.
`,
  },
  'py-adv-3': {
    content: md`
# المزخرفات (Decorators)

المزخرف دالة **تأخذ دالة وترجع نسخة معدّلة منها**. تستخدمها لإضافة سلوك مشترك (قياس الوقت، التسجيل، التحقق من الصلاحيات، التخزين المؤقت) لعدة دوال دون تكرار الكود داخل كل منها. يعتمد على ما تعلمته: الدوال كقيم والإغلاقات.

## الفكرة بدون صيغة @
\`\`\`python
def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"استدعاء {func.__name__} بـ {args}")
        return func(*args, **kwargs)
    return wrapper

def add(a, b):
    return a + b

add = log_calls(add)   # استبدلنا add بالنسخة المغلّفة
add(2, 3)
\`\`\`

## صيغة @ هي اختصار لنفس السطر
\`\`\`python
@log_calls
def add(a, b):
    return a + b
\`\`\`
تعني حرفياً: \`add = log_calls(add)\`.

## لماذا *args و **kwargs؟
لكي يعمل الـ wrapper مع **أي** دالة مهما كانت معاملاتها: \`*args\` تجمع المعاملات الموضعية في tuple، و \`**kwargs\` تجمع المعاملات بالاسم في قاموس، ثم نمررها كما هي للدالة الأصلية. ولا تنسَ \`return\` نتيجة الدالة الأصلية وإلا سترجع الدالة المزخرفة \`None\`.

## functools.wraps
بدونها تفقد الدالة اسمها وتوثيقها (\`add.__name__\` يصبح \`"wrapper"\`)، مما يربك رسائل الأخطاء وأدوات الاختبار:
\`\`\`python
from functools import wraps

def log_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        ...
    return wrapper
\`\`\`
اجعلها عادة في كل مزخرف.

## مزخرف بمعاملات
مستوى إضافي من الدوال: دالة تأخذ الإعدادات وترجع المزخرف:
\`\`\`python
def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def hello():
    print("مرحباً")
\`\`\`

## مزخرفات جاهزة مفيدة
| المزخرف | الوظيفة |
|---|---|
| \`@functools.lru_cache\` | يحفظ نتائج الاستدعاءات السابقة (ممتاز للدوال البطيئة النقية) |
| \`@property\`، \`@classmethod\`، \`@staticmethod\` | رأيتها في دورة OOP |
| \`@dataclass\` | يولّد دوال الصنف |

## ترتيب عدة مزخرفات
\`\`\`python
def a(func):
    print("a تُطبَّق ثانياً")
    return func

def b(func):
    print("b تُطبَّق أولاً")
    return func

@a
@b
def f(): ...
\`\`\`
تساوي \`f = a(b(f))\`: الأقرب للدالة يُطبَّق أولاً.

## تمرين
اكتب مزخرف \`@timer\` يطبع زمن تنفيذ الدالة، ومزخرف \`@retry(times)\` يعيد المحاولة إذا رمت الدالة استثناءً.
`,
  },
  'py-adv-6': {
    content: md`
# المكرّرات (Iterators)

حلقة \`for\` تعمل مع القوائم والنصوص والقواميس والملفات... كيف تعرف Python المرور على كل هذه الأنواع المختلفة؟ الجواب: **بروتوكول التكرار**.

## مصطلحان
- **iterable (قابل للتكرار)**: كائن يمكن المرور عليه: قائمة، نص، قاموس، ملف. فيه الدالة \`__iter__\`.
- **iterator (مكرّر)**: كائن يعطي العنصر التالي عند كل طلب، ويتذكر موقعه. فيه \`__next__\`.

\`\`\`python
nums = [10, 20, 30]      # iterable
it = iter(nums)          # نحصل على iterator
print(next(it))          # 10
print(next(it))          # 20
print(next(it))          # 30
next(it)                 # StopIteration: انتهت العناصر
\`\`\`

## ما تفعله for فعلياً
\`\`\`python
nums = [10, 20, 30]
it = iter(nums)
while True:
    try:
        item = next(it)
    except StopIteration:
        break
    print(item)
\`\`\`

## المكرّر يُستهلك مرة واحدة
\`\`\`python
it = iter([1, 2, 3])
print(list(it))   # [1, 2, 3]
print(list(it))   # [] انتهى
\`\`\`
القائمة يمكن المرور عليها مراراً لأن كل \`for\` تطلب مكرّراً جديداً منها، أما المكرّر نفسه فلا يعود للبداية.

## صنع مكرّر خاص
\`\`\`python
class Countdown:
    def __init__(self, start):
        self.current = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value
\`\`\`

## لماذا هذا مهم؟
المكرّر **لا يحتاج كل العناصر في الذاكرة**: يحسب العنصر التالي عند الطلب فقط. يمكنك المرور على ملف حجمه 10 جيجابايت سطراً سطراً، أو على تسلسل لا نهائي. هذا ما يسمى **التقييم الكسول (lazy evaluation)**.

## أدوات جاهزة: itertools
| الدالة | الوظيفة |
|---|---|
| \`count(start)\` | أرقام لا نهائية |
| \`islice(it, n)\` | أول n عناصر من أي مكرّر |
| \`chain(a, b)\` | المرور على عدة مصادر كأنها واحد |
| \`groupby(it, key)\` | تجميع العناصر المتتالية المتشابهة |
| \`zip\`، \`enumerate\`، \`map\`، \`filter\` | كلها ترجع مكرّرات كسولة |

## تمرين
اكتب صنف \`EvenNumbers(limit)\` يعطي الأعداد الزوجية حتى limit، ثم استخدم \`itertools.islice\` و \`itertools.count\` لطباعة أول 5 مضاعفات للرقم 7.
`,
  },
  'py-adv-4': {
    content: md`
# المولّدات (Generators)

كتابة مكرّر بصنف (كما في الدرس السابق) تحتاج \`__iter__\` و \`__next__\` وحفظ الحالة يدوياً. المولّد يعطيك نفس النتيجة بدالة عادية فيها \`yield\`.

\`\`\`python
def countdown(start):
    while start > 0:
        yield start
        start -= 1

for n in countdown(3):
    print(n)   # 3 2 1
\`\`\`

## كيف يعمل yield؟
- استدعاء دالة المولّد **لا ينفذ جسمها**؛ يرجع كائن مولّد (وهو iterator).
- عند كل \`next()\` يُنفَّذ الجسم حتى أول \`yield\`، فترجع القيمة و**يتجمد** المولّد محتفظاً بكل متغيراته.
- الطلب التالي يكمل من حيث توقف.
- عند انتهاء الدالة تُرمى \`StopIteration\` تلقائياً.

\`\`\`python
gen = countdown(2)
print(next(gen))   # 2
print(next(gen))   # 1
\`\`\`

## return مقابل yield
\`return\` تُنهي الدالة وترجع قيمة واحدة. \`yield\` ترجع قيمة **وتستمر لاحقاً**، فتنتج سلسلة قيم.

## توفير الذاكرة
\`\`\`python
def read_lines(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            yield line.rstrip("\n")
\`\`\`
مهما كان حجم الملف، في الذاكرة سطر واحد فقط في كل لحظة.

## خطوط المعالجة (Pipelines)
مولّدات صغيرة تُركّب كسلسلة، وكل منها يمرر القيم للتالي واحدة واحدة:
\`\`\`python
lines = read_lines("log.txt")
errors = (l for l in lines if "ERROR" in l)
messages = (l.split(":", 1)[1].strip() for l in errors)
\`\`\`
لا يُقرأ أي سطر حتى تبدأ بالمرور على \`messages\`.

## تعابير المولّد
\`(x * x for x in range(10))\` بأقواس عادية: مولّد بسطر واحد، مثالي داخل \`sum()\` و \`any()\`.

## yield from
لتمرير كل قيم مولّد آخر:
\`\`\`python
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item
\`\`\`

## تسلسلات لا نهائية
\`\`\`python
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b
\`\`\`
آمنة لأن القيم تُحسب عند الطلب فقط؛ خذ ما تحتاجه بـ \`itertools.islice\`.

## متى تستخدم مولّداً؟
عندما تمر على البيانات **مرة واحدة** بالترتيب، أو البيانات كبيرة أو لا نهائية. إن احتجت الوصول بالفهرس أو المرور عدة مرات، استخدم قائمة.

## تمرين
اكتب مولّداً \`chunks(items, size)\` يقسم قائمة إلى أجزاء بحجم size، ومولّداً \`primes()\` لا نهائياً، واطبع أول 10 أعداد أولية.
`,
  },
  'py-adv-5': {
    content: md`
# مدراء السياق (Context Managers)

تعرف \`with open(...)\` منذ دورة هياكل البيانات. \`with\` ليست خاصة بالملفات: إنها طريقة عامة **لضمان تنفيذ خطوة التنظيف** (إغلاق، تحرير، استعادة) مهما حدث، حتى لو رُمي خطأ في المنتصف.

## المشكلة التي يحلها
\`\`\`python
f = open("data.txt", encoding="utf-8")
process(f)        # لو رمت خطأ...
f.close()         # ...لن يُنفَّذ هذا السطر
\`\`\`
الحل اليدوي \`try/finally\` يعمل لكنه مطوّل ومتكرر؛ \`with\` تغلفه.

## البروتوكول
أي كائن فيه:
- \`__enter__(self)\`: يُنفَّذ عند الدخول، وما يرجعه يُسند للمتغير بعد \`as\`.
- \`__exit__(self, exc_type, exc_val, exc_tb)\`: يُنفَّذ عند الخروج **دائماً**. إذا حدث خطأ تصله تفاصيله، وإلا تكون المعاملات الثلاثة \`None\`.

إرجاع \`True\` من \`__exit__\` **يبتلع الخطأ**؛ ارجع \`False\` (أو لا شيء) إلا إذا كنت متأكداً أنك تريد إخفاءه.

## الطريقة الأسهل: @contextmanager
\`\`\`python
from contextlib import contextmanager

@contextmanager
def opened_db(name):
    conn = connect(name)        # قبل yield = __enter__
    try:
        yield conn               # القيمة بعد as
    finally:
        conn.close()             # بعد yield = __exit__
\`\`\`
\`try/finally\` حول \`yield\` ضرورية، وإلا لن يُنفَّذ التنظيف عند حدوث خطأ.

## أدوات جاهزة في contextlib
| الأداة | الاستخدام |
|---|---|
| \`suppress(ErrorType)\` | تجاهل خطأ محدد متوقع |
| \`redirect_stdout(f)\` | توجيه print إلى ملف أو StringIO |
| \`ExitStack\` | عدد متغير من مدراء السياق |
| \`tempfile.TemporaryDirectory()\` | مجلد مؤقت يُحذف تلقائياً |

## أمثلة استخدام شائعة
- الملفات والاتصالات بقواعد البيانات والشبكة.
- الأقفال في البرمجة المتوازية: \`with lock:\`.
- قياس زمن جزء من الكود.
- تغيير إعداد مؤقتاً ثم استعادته.

## عدة مدراء معاً
\`\`\`python
with open("a.txt", encoding="utf-8") as src, open("b.txt", "w", encoding="utf-8") as dst:
    dst.write(src.read())
\`\`\`

## تمرين
اكتب مدير سياق \`timer(label)\` بـ \`@contextmanager\` يطبع زمن الكتلة، ومدير سياق \`working_directory(path)\` يغيّر المجلد الحالي مؤقتاً ثم يعيده (\`os.chdir\`) حتى لو حدث خطأ.
`,
  },
  'py-adv-8': {
    content: md`
# التعابير النمطية (Regular Expressions)

دوال النصوص (\`find\`، \`split\`، \`replace\`) تبحث عن نص **ثابت**. التعبير النمطي يبحث عن **نمط**: "رقم هاتف من 11 خانة"، "أي بريد إلكتروني"، "تاريخ بصيغة سنة-شهر-يوم".

## الدوال الأساسية في re
| الدالة | ماذا ترجع |
|---|---|
| \`re.search(p, s)\` | أول تطابق في أي مكان، أو None |
| \`re.match(p, s)\` | تطابق من **بداية** النص فقط |
| \`re.fullmatch(p, s)\` | هل النص كله يطابق النمط (للتحقق من المدخلات) |
| \`re.findall(p, s)\` | قائمة بكل التطابقات |
| \`re.sub(p, new, s)\` | استبدال كل التطابقات |
| \`re.split(p, s)\` | تقسيم حسب النمط |

## لماذا r"..."؟
الأنماط مليئة بـ \`\\\`. النص الخام \`r"\d+"\` يمنع Python من تفسير الشرطة المائلة، فيصل النمط إلى re كما كتبته. اجعلها عادة دائماً.

## اللبنات الأساسية
| الرمز | المعنى |
|---|---|
| \`.\` | أي حرف عدا السطر الجديد |
| \`\d\` | رقم، \`\w\` حرف أو رقم أو _، \`\s\` مسافة |
| \`[abc]\` | أحد هذه الأحرف، \`[^abc]\` أي حرف عداها، \`[0-9]\` مجال |
| \`*\` | صفر مرة أو أكثر، \`+\` مرة أو أكثر، \`?\` اختياري |
| \`{3}\` | 3 مرات بالضبط، \`{2,4}\` من 2 إلى 4 |
| \`^\` و \`$\` | بداية النص ونهايته |
| \`(...)\` | مجموعة تلتقط جزءاً من التطابق |
| \`a|b\` | هذا أو ذاك |

ملاحظة: في Python 3 تطابق \`\d\` و \`\w\` الأرقام والأحرف العربية أيضاً (Unicode). إذا أردت أرقاماً إنجليزية فقط استخدم \`[0-9]\`.

## المجموعات لاستخراج الأجزاء
\`\`\`python
import re
m = re.search(r"(\d{4})-(\d{2})-(\d{2})", "التاريخ 2026-03-15")
year, month, day = m.groups()
m = re.search(r"(?P<year>\d{4})-(?P<month>\d{2})", "2026-03")
m["year"]   # مجموعة مسماة
\`\`\`

## الجشع (greedy)
\`.*\` تأخذ **أكبر** تطابق ممكن: \`re.findall(r"<.*>", "<a><b>")\` ترجع \`['<a><b>']\`. أضف \`?\` لتصبح غير جشعة: \`r"<.*?>"\` ترجع \`['<a>', '<b>']\`.

## الأعلام
\`re.IGNORECASE\` لتجاهل حالة الأحرف، و \`re.MULTILINE\` لجعل \`^\` و \`$\` لكل سطر. ولنمط يُستخدم كثيراً: \`pattern = re.compile(r"...")\` ثم \`pattern.findall(text)\`.

## تحذير
لا تحاول التحقق من كل شيء بتعبير نمطي ضخم (مثل البريد الإلكتروني بكل قواعده الرسمية، أو تحليل HTML). استخدم نمطاً معقولاً، أو مكتبة متخصصة. والتعبير الذي لا تستطيع قراءته بعد أسبوع مشكلة.

## تمرين
من نص سجل، استخرج كل عناوين IP، وكل التواريخ بصيغة YYYY-MM-DD، واستبدل أرقام الهواتف (11 رقماً) بـ \`***\`. ثم اكتب دالة تتحقق بـ \`fullmatch\` أن اسم المستخدم من 3 إلى 16 حرفاً إنجليزياً أو رقماً أو _.
`,
  },
  'py-adv-10': {
    content: md`
# تلميحات الأنواع (Type Hints)

Python لغة ديناميكية: المتغير يمكن أن يحمل أي نوع. هذا مريح في البرامج الصغيرة، لكن في المشاريع الكبيرة تكثر أسئلة مثل: "هل هذه الدالة ترجع قائمة أم None؟". تلميحات الأنواع **توثّق** الأنواع المتوقعة داخل الكود نفسه.

\`\`\`python
def average(scores: list[float]) -> float:
    return sum(scores) / len(scores)
\`\`\`

## أهم حقيقة
**Python لا تتحقق من التلميحات أثناء التشغيل.** \`average("abc")\` ستُنفَّذ وتفشل كالعادة. الفائدة تأتي من:
- **المحرر** (VS Code / PyCharm): إكمال تلقائي وتحذيرات قبل التشغيل.
- **أدوات الفحص** مثل \`mypy\` أو \`pyright\` التي تقرأ الكود وتكتشف التعارضات.
- **القراءة**: من يقرأ الدالة يعرف ما تتوقعه دون فتح جسمها.

## الصيغة الحديثة (Python 3.9 و 3.10+)
| الحاجة | الحديث | القديم (من typing) |
|---|---|---|
| قائمة أرقام | \`list[int]\` | \`List[int]\` |
| قاموس | \`dict[str, int]\` | \`Dict[str, int]\` |
| tuple ثابتة | \`tuple[int, int]\` | \`Tuple[int, int]\` |
| قيمة أو None | \`str | None\` | \`Optional[str]\` |
| أحد نوعين | \`int | str\` | \`Union[int, str]\` |
ستجد الصيغة القديمة في كود كثير؛ معناها نفسه. استخدم الحديثة في الكود الجديد.

## None صراحة
\`\`\`python
def find_user(user_id: int) -> str | None:
    ...
\`\`\`
هذا يذكّر كل من يستدعي الدالة بفحص \`None\` قبل الاستخدام، وهو مصدر شائع للأخطاء.

## الدوال كمعاملات
\`\`\`python
from collections.abc import Callable
def apply(func: Callable[[int], int], value: int) -> int:
    return func(value)
\`\`\`

## أنواع مفيدة أخرى
- \`Literal["asc", "desc"]\`: قيم محددة فقط.
- \`TypedDict\`: شكل قاموس بمفاتيح معروفة (مفيد لبيانات JSON).
- الأسماء المستعارة: \`type UserId = int\` (Python 3.12+) أو \`UserId = int\`.
- الأنواع العامة (Generics): \`class Stack[T]:\` في Python 3.12+، أو \`TypeVar\` في الإصدارات الأقدم.

## مع الأصناف و dataclasses
dataclass تعتمد على التلميحات لتعريف الحقول، والمحررات تفهمها جيداً.

## كم تكتب؟
ابدأ بالدوال العامة (المعاملات والقيم المرجعة). لا داعي لتلميح كل متغير محلي؛ أدوات الفحص تستنتج أنواعها.

## تمرين
أضف تلميحات أنواع كاملة لدوال مشروع دفتر الدرجات، وشغّل \`mypy\` عليه إن استطعت تثبيته (\`pip install mypy\`)، ولاحظ ما يكتشفه.
`,
    codeExample: md`
from collections.abc import Callable, Iterable
from dataclasses import dataclass
from typing import Literal, TypedDict

def average(scores: list[float]) -> float:
    return sum(scores) / len(scores)

def find_user(user_id: int, users: dict[int, str]) -> str | None:
    return users.get(user_id)

def apply(func: Callable[[int], int], value: int) -> int:
    return func(value)

def sort_names(names: Iterable[str], order: Literal["asc", "desc"] = "asc") -> list[str]:
    return sorted(names, reverse=(order == "desc"))

class UserJSON(TypedDict):
    id: int
    name: str
    active: bool

@dataclass
class Point:
    x: float
    y: float

    def distance_to(self, other: "Point") -> float:
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5

users = {1: "أحمد", 2: "منى"}
print(average([90.0, 80.5]))
name = find_user(3, users)
print(name if name is not None else "غير موجود")   # افحص None دائماً
print(apply(lambda n: n * 2, 21))
print(sort_names(["منى", "أحمد", "زيد"], "desc"))

data: UserJSON = {"id": 1, "name": "منى", "active": True}
print(data["name"], Point(0, 0).distance_to(Point(3, 4)))

# التلميحات لا تُفرض أثناء التشغيل:
print(average([1, 2, 3]))   # يعمل رغم أن التلميح يقول float
`,
  },
  'py-adv-11': {
    content: md`
# الاختبار في Python

كيف تعرف أن الكود يعمل؟ تشغيله يدوياً وتجربة بعض القيم لا يكفي: عندما تعدّل شيئاً بعد شهر، لن تعيد تجربة كل الحالات. **الاختبارات الآلية** كود صغير يتحقق من أن الكود يعطي النتائج المتوقعة، وتشغّلها بأمر واحد بعد كل تعديل.

## اختبار الوحدة (Unit Test)
يختبر جزءاً صغيراً (دالة أو صنفاً) بمعزل عن البقية:
\`\`\`python
import unittest

def apply_discount(price, percent):
    if not 0 <= percent <= 100:
        raise ValueError("نسبة غير صالحة")
    return round(price * (1 - percent / 100), 2)

class TestDiscount(unittest.TestCase):
    def test_normal(self):
        self.assertEqual(apply_discount(100, 20), 80)

    def test_invalid_percent(self):
        with self.assertRaises(ValueError):
            apply_discount(100, 150)
\`\`\`
التشغيل: \`python -m unittest\` يبحث عن الملفات التي تبدأ بـ \`test\` وينفذ كل دالة تبدأ بـ \`test_\`.

## ماذا تختبر؟
- **الحالة العادية**: مدخلات نموذجية.
- **الحالات الحدية**: صفر، قائمة فارغة، أكبر/أصغر قيمة مسموحة (هنا 0 و 100).
- **المدخلات الخاطئة**: هل يُرمى الخطأ المناسب؟
- **أخطاء سابقة**: عند إصلاح bug اكتب اختباراً يمنع عودته.

## pytest: الأداة الأكثر استخداماً
مكتبة خارجية (\`pip install pytest\`) تجعل الاختبارات دوالاً عادية مع \`assert\`:
\`\`\`python
def test_normal():
    assert apply_discount(100, 20) == 80
\`\`\`
ثم \`pytest -v\`. ميزاتها الأهم:
- \`@pytest.mark.parametrize\`: نفس الاختبار بعدة مجموعات مدخلات.
- **fixtures**: إعداد بيانات مشتركة بين الاختبارات.
- \`pytest.raises(ValueError)\` لاختبار الأخطاء.
- رسائل فشل تعرض القيم الفعلية والمتوقعة.

## Mock: عزل ما لا تريد تشغيله
إذا كانت الدالة ترسل بريداً أو تتصل بـ API، لا تريد ذلك في الاختبار. \`unittest.mock\` يستبدل الجزء الخارجي بكائن وهمي تتحكم في نتيجته، وتتحقق من أنه استُدعي بالمعاملات الصحيحة.

## كود قابل للاختبار
أصعب جزء في الاختبار هو كود صُمم بلا اختبار: دوال تقرأ \`input()\` وتطبع وتحسب معاً، أو تستدعي \`date.today()\` في داخلها. افصل **الحساب** عن **الإدخال والإخراج**، ومرّر الاعتماديات كمعاملات (رأيت ذلك في مشروع المكتبة).

## الاختبار أولاً (TDD)
أسلوب يكتب فيه المبرمج الاختبار قبل الكود: يفشل الاختبار، ثم تكتب أبسط كود يجعله ينجح، ثم تحسّن الكود والاختبار يحميك. جرّبه في التمرين.

## تمرين
اكتب اختبارات (unittest أو pytest) لدالة \`is_strong_password(p)\`: طولها 8 على الأقل وفيها رقم وحرف كبير. غطِّ: كلمة قوية، قصيرة، بلا رقم، بلا حرف كبير، ونصاً فارغاً.
`,
    codeExample: md`
import unittest
from unittest.mock import Mock

def apply_discount(price: float, percent: float) -> float:
    if not 0 <= percent <= 100:
        raise ValueError("نسبة غير صالحة")
    return round(price * (1 - percent / 100), 2)

def notify_if_expensive(price: float, sender) -> bool:
    """ترسل إشعاراً عبر sender (يُمرَّر من الخارج ليسهل اختباره)."""
    if price > 1000:
        sender.send(f"سعر مرتفع: {price}")
        return True
    return False

class TestDiscount(unittest.TestCase):
    def test_normal(self):
        self.assertEqual(apply_discount(100, 20), 80)

    def test_edges(self):
        self.assertEqual(apply_discount(100, 0), 100)
        self.assertEqual(apply_discount(100, 100), 0)

    def test_many_cases(self):
        for price, percent, expected in [(50, 10, 45), (19.99, 50, 10.0), (0, 30, 0)]:
            with self.subTest(price=price, percent=percent):
                self.assertEqual(apply_discount(price, percent), expected)

    def test_invalid_percent(self):
        with self.assertRaises(ValueError):
            apply_discount(100, 150)

class TestNotify(unittest.TestCase):
    def test_sends_for_expensive(self):
        sender = Mock()
        self.assertTrue(notify_if_expensive(1500, sender))
        sender.send.assert_called_once_with("سعر مرتفع: 1500")

    def test_silent_for_cheap(self):
        sender = Mock()
        self.assertFalse(notify_if_expensive(20, sender))
        sender.send.assert_not_called()

if __name__ == "__main__":
    # exit=False حتى لا يُغلق البرنامج بعد الاختبارات (مفيد داخل المحرر)
    unittest.main(argv=["tests"], exit=False, verbosity=2)
`,
  },
  'py-adv-12': {
    content: md`
# التسجيل (Logging) وتتبع الأخطاء

\`print\` مناسبة أثناء التعلم، لكنها لا تكفي في برنامج حقيقي: لا تعرف وقت الرسالة، ولا مستوى أهميتها، ولا يمكنك إيقاف رسائل التصحيح في الإنتاج دون حذفها يدوياً. وحدة \`logging\` تحل كل ذلك.

## المستويات
| المستوى | الاستخدام |
|---|---|
| \`DEBUG\` | تفاصيل للتشخيص أثناء التطوير |
| \`INFO\` | أحداث عادية: بدأ الخادم، تمت معالجة طلب |
| \`WARNING\` | شيء غير متوقع لكن البرنامج مستمر (الافتراضي الأدنى المعروض) |
| \`ERROR\` | فشلت عملية |
| \`CRITICAL\` | البرنامج قد لا يستطيع الاستمرار |
تحدد في الإعداد المستوى الأدنى المعروض، فتظهر رسائل DEBUG أثناء التطوير وتختفي في الإنتاج دون تعديل الكود.

## الإعداد الأساسي
\`\`\`python
import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)
logger.info("بدأ التشغيل")
\`\`\`
- استدعِ \`basicConfig\` **مرة واحدة** في بداية البرنامج الرئيسي، لا في كل وحدة.
- في كل وحدة: \`logger = logging.getLogger(__name__)\`، فتعرف من اسم المسجّل أي وحدة كتبت الرسالة.

## تسجيل الاستثناءات
\`\`\`python
import logging
logger = logging.getLogger(__name__)
order_id, order = 7, {"qty": -1}

def process(order):
    raise ValueError("كمية سالبة")

try:
    process(order)
except ValueError:
    logger.exception("فشلت معالجة الطلب %s", order_id)
\`\`\`
\`logger.exception\` تسجل بمستوى ERROR **مع Traceback كاملاً**، وهو أهم ما تحتاجه لاحقاً لمعرفة سبب المشكلة.

## %s بدل f-string في الرسائل
\`logger.debug("المستخدم %s", user)\` أفضل من f-string لأن النص لا يُبنى إذا كان المستوى معطلاً، وأدوات تجميع السجلات تستطيع تجميع الرسائل المتشابهة.

## المعالجات (Handlers)
السجلات يمكن أن تذهب لأكثر من مكان: الشاشة، ملف، ملف يتجدد عند حجم معين (\`RotatingFileHandler\`)، أو خدمة خارجية. لكل معالج مستواه وتنسيقه.

## لا تسجل أسراراً
لا تكتب كلمات المرور أو التوكنات أو أرقام البطاقات في السجلات أبداً؛ ملفات السجلات تُقرأ وتُنسخ أكثر مما تتوقع.

## أدوات تتبع أخرى
- \`breakpoint()\`: يوقف البرنامج في هذا السطر ويفتح مصحح \`pdb\` لتفحص المتغيرات خطوة بخطوة.
- \`traceback.format_exc()\`: نص الخطأ الحالي.
- مصحح المحرر (VS Code): نقاط توقف بالضغط بجانب السطر، وهو الأسهل للمبتدئين.

## تمرين
أضف logging إلى مشروع تحليل المبيعات: INFO عند بدء ونهاية التحليل، WARNING لكل صف معطوب مع رقمه، و ERROR مع Traceback إذا لم يوجد الملف.
`,
  },
  'py-adv-13': {
    content: md`
# الملفات المتقدمة: pathlib والملفات الكبيرة والمؤقتة

تعلمت الأساسيات في دورة هياكل البيانات (\`open\` و \`with\` و JSON و CSV). هنا نركز على ما تحتاجه في الأدوات والسكربتات الحقيقية.

## pathlib بدل نصوص المسارات
\`\`\`python
from pathlib import Path
base = Path("data")
report = base / "2026" / "report.txt"   # / تجمع المسارات بشكل صحيح على كل الأنظمة
report.parent.mkdir(parents=True, exist_ok=True)
\`\`\`
| العملية | pathlib |
|---|---|
| قراءة/كتابة نص | \`read_text(encoding=...)\` / \`write_text(...)\` |
| وجود | \`exists()\`، \`is_file()\`، \`is_dir()\` |
| أجزاء الاسم | \`name\`، \`stem\`، \`suffix\`، \`parent\` |
| البحث | \`glob("*.csv")\`، \`rglob("*.py")\` (يشمل المجلدات الفرعية) |
| حذف | \`unlink()\` للملف، \`rmdir()\` لمجلد فارغ |

لا تجمع المسارات بـ \`+\` مثل \`"data" + "/" + name\`: الفاصل يختلف بين Windows (\`\\\`) وبقية الأنظمة.

## الترميز دائماً
حدّد \`encoding="utf-8"\` في كل قراءة وكتابة نصية؛ الترميز الافتراضي يختلف بين الأجهزة، وفي Windows قد يفشل حفظ النص العربي.

## الملفات الكبيرة
- **نصية**: المرور سطراً سطراً \`for line in f\` يقرأ سطراً واحداً في الذاكرة.
- **ثنائية**: القراءة بكتل ثابتة مع المولّدات:
\`\`\`python
def read_in_chunks(path, size=1024 * 1024):
    with open(path, "rb") as f:
        while chunk := f.read(size):
            yield chunk
\`\`\`
\`:=\` (عامل الإسناد في التعبير) يقرأ الكتلة ويختبرها في نفس السطر، والحلقة تتوقف عند نهاية الملف (كتلة فارغة).

## الملفات والمجلدات المؤقتة
\`tempfile.TemporaryDirectory()\` و \`NamedTemporaryFile()\` تنشئ أسماء فريدة في مجلد النظام المؤقت. مع \`with\` تُحذف تلقائياً. مفيدة للاختبارات والمعالجة الوسيطة.

## الكتابة الآمنة
إذا انقطع البرنامج أثناء كتابة ملف مهم، قد يبقى نصف مكتوب. الأسلوب الآمن: اكتب في ملف مؤقت بجانبه ثم استبدل الأصلي دفعة واحدة بـ \`Path.replace()\`.

## shutil للعمليات الكبيرة
\`shutil.copy\`، \`shutil.move\`، \`shutil.rmtree\` (حذف مجلد كامل: احذر!)، \`shutil.make_archive\` لإنشاء ملف zip.

## تمرين
اكتب سكربت يمر على كل ملفات \`.txt\` في مجلد ومجلداته الفرعية (\`rglob\`)، ويطبع عدد أسطر كل ملف وحجمه، ويحفظ النتيجة في \`summary.csv\` بكتابة آمنة.
`,
  },
  'py-adv-14': {
    content: md`
# البيئات الافتراضية وإدارة الحزم

عندما تستخدم مكتبات خارجية (\`requests\`، \`pandas\`، \`django\`) تظهر مشكلة: مشروع يحتاج \`requests 2.31\` وآخر قديم يحتاج \`2.20\`. لو ثبّتّ كل شيء على Python الخاصة بالنظام، ستتعارض المشاريع. **البيئة الافتراضية** مجلد فيه نسخة معزولة من Python وحزمها لكل مشروع.

## إنشاء وتفعيل (في الطرفية، ليس داخل Python)
\`\`\`text
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# Windows (cmd)
.venv\Scripts\activate.bat
# macOS / Linux
source .venv/bin/activate

deactivate
\`\`\`
بعد التفعيل يظهر اسم البيئة في سطر الأوامر، وأي \`pip install\` يثبّت داخلها فقط.

## pip
\`\`\`text
pip install requests            # أحدث إصدار
pip install "requests==2.31.0"  # إصدار محدد
pip install --upgrade requests
pip uninstall requests
pip list                        # الحزم المثبتة
\`\`\`
استخدم \`python -m pip\` بدل \`pip\` إذا كان لديك أكثر من نسخة Python، لتضمن أنك تثبّت للنسخة الصحيحة.

## تسجيل الاعتماديات
\`\`\`text
pip freeze > requirements.txt
pip install -r requirements.txt
\`\`\`
\`requirements.txt\` يسمح لأي شخص (أو لخادم النشر) بإعادة إنشاء نفس البيئة. أضفه إلى git، أما مجلد \`.venv\` نفسه فأضفه إلى \`.gitignore\`: لا يُرفع أبداً.

## pyproject.toml
المشاريع الحديثة تصف اسمها وإصدارها واعتمادياتها في ملف \`pyproject.toml\` (المعيار الحالي لحزم Python). أدوات مثل \`uv\` و \`poetry\` تدير البيئة والاعتماديات وملف قفل للإصدارات الدقيقة تلقائياً. فهمك لـ venv و pip هو الأساس الذي تقوم عليه كلها.

## الأمان
- ثبّت الحزم من PyPI بأسمائها الصحيحة بدقة؛ توجد حزم خبيثة بأسماء قريبة من المشهورة (typosquatting).
- لا تستخدم \`sudo pip install\` على Linux/macOS.
- راجع الحزم قبل إضافتها: هل هي مستخدمة ومصانة؟

## مشكلات شائعة
| المشكلة | السبب المعتاد |
|---|---|
| ModuleNotFoundError بعد التثبيت | البيئة غير مفعلة، أو ثبّتّ لنسخة Python أخرى |
| المحرر لا يرى الحزمة | اختر مفسّر \`.venv\` في إعدادات المحرر |
| PowerShell يرفض التفعيل | سياسة التنفيذ: \`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned\` |

## تمرين
أنشئ مجلد مشروع جديداً، وبيئة افتراضية، وثبّت فيها \`requests\`، واكتب سكربتاً يطبع إصدارها (\`requests.__version__\`)، ثم أنشئ \`requirements.txt\` و \`.gitignore\` مناسباً.
`,
  },
  'py-adv-9': {
    content: md`
# البرمجة غير المتزامنة: async و await

كثير من البرامج تقضي معظم وقتها **منتظرة**: رد من الشبكة، قراءة من قاعدة بيانات. البرنامج العادي ينتظر كل عملية حتى تنتهي قبل أن يبدأ التالية. البرمجة غير المتزامنة تسمح ببدء عدة عمليات انتظار **معاً**، والانتقال بينها أثناء الانتظار، باستخدام خيط واحد.

## المفهوم بمثال المطبخ
طاهٍ واحد يحضّر 3 أطباق: يضع الماء على النار، **وبدل أن يقف ينتظر الغليان** يقطّع الخضار للطبق الثاني. طاهٍ واحد (خيط واحد) لكن الوقت الكلي أقل بكثير. هذا لا يفيد إذا كان العمل كله تقطيعاً متواصلاً (حسابات): هناك لا يوجد انتظار لاستغلاله.

## الصيغة
\`\`\`python
import asyncio

async def fetch(name, seconds):
    print(f"بدء {name}")
    await asyncio.sleep(seconds)   # انتظار لا يوقف البرنامج كله
    return f"{name} جاهز"

async def main():
    results = await asyncio.gather(fetch("أ", 2), fetch("ب", 1))
    print(results)

asyncio.run(main())   # يستغرق ~2 ثانية وليس 3
\`\`\`
- \`async def\` تعرّف **coroutine**: استدعاؤها لا ينفذها بل ينشئ كائناً قابلاً للانتظار.
- \`await\` داخل دالة async: "انتظر هذا، واسمح لغيري بالعمل خلال الانتظار".
- \`asyncio.run(main())\` يشغّل حلقة الأحداث (event loop) من الكود العادي، مرة واحدة في بداية البرنامج.

## gather و create_task
- \`asyncio.gather(*coros)\`: تشغيل عدة عمليات معاً وانتظار نتائجها كلها (بنفس الترتيب).
- \`asyncio.create_task(coro)\`: بدء عملية في الخلفية والمتابعة، ثم \`await task\` لاحقاً.
- \`asyncio.wait_for(coro, timeout=3)\`: مهلة قصوى.
- \`asyncio.TaskGroup\` (Python 3.11+): إدارة مجموعة مهام مع إلغاء البقية عند فشل إحداها.

## أخطاء شائعة
1. **نسيان await**: \`fetch("أ", 1)\` بدون await لا تنفذ شيئاً (وتظهر تحذير "coroutine was never awaited").
2. **استدعاء دالة متزامنة بطيئة** داخل async مثل \`time.sleep(2)\` أو \`requests.get\`: توقف حلقة الأحداث كلها. استخدم \`asyncio.sleep\` ومكتبات async مثل \`httpx\` أو \`aiohttp\`، أو \`await asyncio.to_thread(func)\` للدوال المتزامنة.
3. **استخدام async للحسابات الثقيلة**: لن تتسرع؛ الدرس التالي يشرح البديل.

## أين يُستخدم؟
خوادم الويب الحديثة (FastAPI)، عملاء الشبكة الذين يرسلون مئات الطلبات، روبوتات الدردشة، وأي تطبيق يتعامل مع اتصالات كثيرة متزامنة.

## تمرين
اكتب دالة async تحاكي تحميل 5 ملفات بأزمنة مختلفة (asyncio.sleep)، وشغّلها مرة بالتتابع ومرة بـ gather، وقِس الفرق في الوقت بـ \`time.perf_counter()\`. ثم أضف مهلة ثانيتين لكل تحميل.
`,
  },
};

export const PY_ADVANCED_NEW: NewLesson[] = [
  {
    id: 'py-adv-concurrency',
    title: 'التوازي والتزامن: threads و processes و asyncio',
    description: 'متى تستخدم كل طريقة، وقيد GIL، و concurrent.futures',
    xpReward: 130,
    language: 'python',
    content: md`
# التوازي والتزامن: أيّها تختار؟

تعلمت async/await. لكن Python توفر ثلاث طرق لتنفيذ أكثر من شيء في نفس الوقت، ولكل منها مجال يناسبه. الاختيار الخاطئ يعطي برنامجاً أعقد دون أي تسريع.

## نوعان من العمل
| النوع | المعنى | أمثلة |
|---|---|---|
| **مقيد بالانتظار (I/O-bound)** | معظم الوقت انتظار لشيء خارجي | طلبات شبكة، قراءة ملفات، قواعد بيانات |
| **مقيد بالمعالج (CPU-bound)** | المعالج يعمل باستمرار | معالجة صور، حسابات رياضية، ضغط بيانات |

## الخيارات الثلاثة
| الطريقة | آلية العمل | الأنسب لـ |
|---|---|---|
| \`asyncio\` | خيط واحد يتنقل بين المهام عند كل await | آلاف عمليات I/O المتزامنة بكفاءة |
| \`threading\` | عدة خيوط في نفس العملية | I/O مع مكتبات متزامنة (requests مثلاً) |
| \`multiprocessing\` | عدة عمليات منفصلة، لكل منها مفسر وذاكرة | العمل الحسابي الثقيل (CPU-bound) |

## GIL: لماذا لا تسرّع الخيوط الحسابات؟
في Python القياسية (CPython) يوجد **قفل المفسر العام (GIL)**: خيط واحد فقط ينفذ كود Python في كل لحظة. أثناء انتظار I/O يُحرَّر القفل فتستفيد الخيوط، أما في الحسابات الصافية فتتناوب الخيوط على القفل دون تسريع حقيقي. لذلك للحسابات الثقيلة نستخدم **العمليات**، لأن لكل عملية مفسرها وقفلها.

ملاحظة: Python 3.13+ تقدم بناءً تجريبياً بدون GIL (free-threaded)، لكنه ليس الافتراضي بعد.

## concurrent.futures: واجهة موحدة وبسيطة
\`\`\`python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import time

def download(url):            # انتظار شبكة (محاكاة)
    time.sleep(0.1)
    return url

def heavy_compute(n):         # حساب
    return sum(i * i for i in range(n))

urls = [f"https://example.com/{i}" for i in range(8)]
numbers = [200_000] * 4


if __name__ == "__main__":          # ضروري مع العمليات (Windows و macOS)
    with ThreadPoolExecutor(max_workers=8) as pool:      # للانتظار
        pages = list(pool.map(download, urls))

    with ProcessPoolExecutor() as pool:                   # للحساب
        results = list(pool.map(heavy_compute, numbers))
    print(len(pages), len(results))
\`\`\`
نفس الشكل للطريقتين، فيسهل التبديل والقياس. \`map\` ترجع النتائج بترتيب المدخلات.

## تحذيرات مهمة
- **مع العمليات**: ضع كود التشغيل تحت \`if __name__ == "__main__":\`، وإلا ستعيد كل عملية فرعية تنفيذ الملف (مطلوب في Windows و macOS). الدوال والبيانات المرسلة للعمليات يجب أن تكون قابلة للتسلسل (pickle)، فلا تصلح دوال lambda.
- **مع الخيوط**: البيانات المشتركة التي تُعدَّل من عدة خيوط تحتاج قفلاً (\`threading.Lock\`) وإلا تحدث حالات تسابق (race conditions) تعطي نتائج خاطئة أحياناً فقط، وهي أصعب الأخطاء اكتشافاً.
- إنشاء عملية أبطأ بكثير من إنشاء خيط؛ للمهام الصغيرة جداً قد تكون الطريقة المتتابعة أسرع.

## القاعدة العملية
1. اكتب الحل المتتابع البسيط أولاً، و**قِس** الوقت.
2. إن كان البطء من الانتظار ← \`asyncio\` (أو الخيوط إن كانت مكتباتك متزامنة).
3. إن كان من الحساب ← \`ProcessPoolExecutor\`.
4. قِس مرة أخرى: هل تحسّن فعلاً؟

## تمرين
شغّل المثال وقارن الأزمنة الثلاثة للعمل الحسابي. ثم غيّر الدالة لتكون انتظاراً (\`time.sleep(0.2)\`) وأعد المقارنة، ولاحظ أن الخيوط أصبحت الأسرع.
`,
    codeExample: md`
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

def cpu_task(n: int) -> int:
    """عمل حسابي صافٍ"""
    total = 0
    for i in range(n):
        total += i * i % 7
    return total

def io_task(seconds: float) -> float:
    """محاكاة انتظار شبكة"""
    time.sleep(seconds)
    return seconds

def measure(label, func):
    start = time.perf_counter()
    func()
    print(f"{label:<28} {time.perf_counter() - start:.2f} ث")

if __name__ == "__main__":   # ضروري مع العمليات
    jobs = [600_000] * 4
    measure("حساب: متتابع", lambda: [cpu_task(n) for n in jobs])
    with ThreadPoolExecutor(4) as pool:
        measure("حساب: خيوط (GIL)", lambda: list(pool.map(cpu_task, jobs)))
    with ProcessPoolExecutor(4) as pool:
        measure("حساب: عمليات", lambda: list(pool.map(cpu_task, jobs)))

    waits = [0.3] * 4
    measure("انتظار: متتابع", lambda: [io_task(s) for s in waits])
    with ThreadPoolExecutor(4) as pool:
        measure("انتظار: خيوط", lambda: list(pool.map(io_task, waits)))
`,
    quiz: {
      question: 'برنامج يعالج آلاف الصور بحسابات ثقيلة. ما الخيار الأنسب لتسريعه في CPython؟',
      options: ['asyncio', 'threading', 'multiprocessing / ProcessPoolExecutor', 'لا يمكن تسريعه'],
      correctAnswer: 2,
      explanation: 'العمل مقيد بالمعالج، والـ GIL يمنع الخيوط من التسريع؛ العمليات المنفصلة تعمل على عدة أنوية فعلاً.',
    },
  },
  {
    id: 'py-adv-project',
    title: 'مشروع ختامي: أداة سطر أوامر لتحليل السجلات',
    description: 'argparse ومولّدات وتعابير نمطية و dataclass و logging واختبارات في أداة واحدة',
    xpReward: 180,
    language: 'python',
    content: md`
# مشروع ختامي: أداة سطر أوامر لتحليل السجلات

ستبني أداة يستخدمها المبرمجون فعلاً: تقرأ ملف سجلات خادم، وتستخرج منه إحصائيات، ويُتحكم بها من سطر الأوامر. المشروع يجمع أهم مفاهيم هذه الدورة.

## الاستخدام المطلوب
\`\`\`text
python logtool.py server.log --level ERROR --top 5
\`\`\`
- عدد الرسائل لكل مستوى (INFO، WARNING، ERROR).
- أكثر N رسائل خطأ تكراراً.
- الساعة الأكثر نشاطاً.
- تجاهل الأسطر التي لا تطابق الصيغة مع تسجيل تحذير.

## صيغة السطر
\`\`\`text
2026-03-15 14:02:11 ERROR [db] connection timeout
\`\`\`

## خريطة المفاهيم
| الجزء | المفهوم من الدورة |
|---|---|
| \`parse_line\` | تعبير نمطي بمجموعات مسماة، يرجع dataclass أو None |
| \`read_entries\` | مولّد: يقرأ الملف سطراً سطراً (يعمل مع ملفات ضخمة) |
| \`filter_level\` | تعبير مولّد في خط معالجة |
| \`summarize\` | Counter و dataclass للنتيجة، وتلميحات أنواع |
| الأسطر المعطوبة | logging بمستوى WARNING |
| واجهة الأوامر | \`argparse\` |
| الثقة بالنتائج | اختبارات unittest للدوال النقية |

## argparse باختصار
\`\`\`python
import argparse
parser = argparse.ArgumentParser(description="تحليل السجلات")
parser.add_argument("path")
parser.add_argument("--level", default=None)
parser.add_argument("--top", type=int, default=3)
args = parser.parse_args(["server.log", "--top", "5"])   # في الأداة الحقيقية: parse_args() تقرأ سطر الأوامر
print(args.path, args.level, args.top)
\`\`\`
تولّد تلقائياً رسالة \`--help\` ورسائل خطأ عند المدخلات الخاطئة.

## تصميم قابل للاختبار
الدوال التي تحلل وتحسب **لا تقرأ ملفات ولا تطبع**: تأخذ أسطراً (أي iterable) وترجع بيانات. لذلك يمكن اختبارها بقائمة نصوص صغيرة، ويمكن تمرير ملف حقيقي أو \`sys.stdin\` لها دون تعديل. \`main(argv)\` تأخذ قائمة المعاملات بدل قراءة \`sys.argv\` مباشرة، فيمكن استدعاؤها من الاختبارات أيضاً.

## في المثال
لكي يعمل المثال داخل المحرر دون ملف خارجي، يكتب ملف سجل تجريبياً، ويشغّل \`main\` بمعاملات ثابتة، ثم يشغّل الاختبارات.

## أفكار للتوسعة
- \`--since\` و \`--until\` لتحديد فترة زمنية (datetime).
- إخراج JSON بخيار \`--json\`.
- معالجة عدة ملفات بالتوازي بـ ProcessPoolExecutor.
- قراءة ملفات مضغوطة \`.gz\` بـ gzip.open.

## ما بعد الدورة
أتممت مسار Python: من أول print إلى أداة حقيقية مختبرة. خيارات التخصص بعدها: تطوير الويب (Django / FastAPI)، تحليل البيانات (pandas)، أو تعلم الآلة (مسار الذكاء الاصطناعي في Kodax).
`,
    codeExample: md`
import argparse
import logging
import re
import unittest
from collections import Counter
from collections.abc import Iterable, Iterator
from dataclasses import dataclass, field
from pathlib import Path

logger = logging.getLogger("logtool")

LINE = re.compile(
    r"^(?P<date>\d{4}-\d{2}-\d{2}) (?P<hour>\d{2}):\d{2}:\d{2} "
    r"(?P<level>[A-Z]+) \[(?P<source>[\w-]+)\] (?P<message>.+)$"
)

@dataclass(frozen=True)
class Entry:
    hour: int
    level: str
    source: str
    message: str

@dataclass
class Summary:
    by_level: Counter = field(default_factory=Counter)
    top_errors: list = field(default_factory=list)
    busiest_hour: int | None = None
    skipped: int = 0

def parse_line(line: str) -> Entry | None:
    m = LINE.match(line.strip())
    if not m:
        return None
    return Entry(int(m["hour"]), m["level"], m["source"], m["message"])

def read_entries(lines: Iterable[str], stats: Summary) -> Iterator[Entry]:
    for number, line in enumerate(lines, start=1):
        entry = parse_line(line)
        if entry is None:
            stats.skipped += 1
            logger.warning("سطر %d غير مطابق للصيغة", number)
            continue
        yield entry

def summarize(lines: Iterable[str], level: str | None = None, top: int = 3) -> Summary:
    stats = Summary()
    hours = Counter()
    errors = Counter()
    for e in read_entries(lines, stats):
        if level and e.level != level:
            continue
        stats.by_level[e.level] += 1
        hours[e.hour] += 1
        if e.level == "ERROR":
            errors[e.message] += 1
    stats.top_errors = errors.most_common(top)
    stats.busiest_hour = hours.most_common(1)[0][0] if hours else None
    return stats

def main(argv: list[str]) -> Summary:
    parser = argparse.ArgumentParser(description="تحليل ملفات السجلات")
    parser.add_argument("path")
    parser.add_argument("--level")
    parser.add_argument("--top", type=int, default=3)
    args = parser.parse_args(argv)
    with open(args.path, encoding="utf-8") as f:
        result = summarize(f, args.level, args.top)
    print("حسب المستوى:", dict(result.by_level))
    print("أكثر الأخطاء:", result.top_errors)
    print("أنشط ساعة:", result.busiest_hour, "| أسطر متجاهلة:", result.skipped)
    return result

class TestLogTool(unittest.TestCase):
    SAMPLE = [
        "2026-03-15 14:02:11 ERROR [db] connection timeout",
        "2026-03-15 14:05:00 INFO [api] request ok",
        "سطر معطوب",
        "2026-03-15 15:00:01 ERROR [db] connection timeout",
    ]

    def test_parse_valid_and_invalid(self):
        self.assertEqual(parse_line(self.SAMPLE[0]).source, "db")
        self.assertIsNone(parse_line("hello"))

    def test_summary(self):
        s = summarize(self.SAMPLE)
        self.assertEqual(s.by_level["ERROR"], 2)
        self.assertEqual(s.top_errors[0], ("connection timeout", 2))
        self.assertEqual(s.skipped, 1)
        self.assertEqual(s.busiest_hour, 14)

if __name__ == "__main__":
    logging.basicConfig(level=logging.WARNING, format="%(levelname)s: %(message)s")
    demo = Path("demo.log")
    demo.write_text("\n".join(TestLogTool.SAMPLE) + "\n", encoding="utf-8")
    main([str(demo), "--top", "2"])
    demo.unlink()
    unittest.main(argv=["tests"], exit=False)
`,
    quiz: {
      question: 'لماذا تأخذ summarize أسطراً (iterable) بدلاً من مسار ملف؟',
      options: [
        'لأن argparse يتطلب ذلك',
        'لكي يمكن اختبارها بقائمة نصوص صغيرة واستخدامها مع أي مصدر أسطر',
        'لأن قراءة الملفات غير ممكنة داخل الدوال',
        'لأنها أسرع دائماً',
      ],
      correctAnswer: 1,
      explanation: 'فصل الحساب عن مصدر البيانات يجعل الدالة قابلة للاختبار وإعادة الاستخدام (ملف، stdin، قائمة).',
    },
  },
];

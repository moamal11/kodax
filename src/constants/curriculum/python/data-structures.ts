/**
 * منهج py-data-structures — هياكل البيانات والملفات والأخطاء في Python.
 *
 * كان: 8 دروس بشرح من سطر واحد لكل مفهوم؛ معالجة الأخطاء بعد الملفات رغم أن
 * التعامل مع الملفات يحتاجها؛ لا يوجد درس للترتيب بمفتاح (key) ولا لـ zip؛
 * JSON مذكور في سطرين داخل درس الملفات و CSV غير موجود؛ لا مشروع تطبيقي.
 * مثال معالجة الأخطاء كان يستدعي دالة غير معرّفة risky_operation().
 */
import type { CoursePlan } from '../types';
import { md } from '../md';

export const PY_DS_PLAN: CoursePlan = {
  courseId: 'py-data-structures',
  course: {
    description:
      'تعمّق في هياكل بيانات Python (tuples، المجموعات، الترتيب، comprehensions، collections)، والنصوص المتقدمة، ومعالجة الأخطاء، والملفات و JSON و CSV، وتنظيم الكود في وحدات — مع مشروع لتحليل البيانات.',
  },
  sections: [
    { title: 'هياكل البيانات المدمجة', lessons: ['py-ds-1', 'py-ds-2', 'py-ds-sorting', 'py-ds-4', 'py-ds-8'] },
    { title: 'النصوص', lessons: ['py-ds-3'] },
    { title: 'الأخطاء والملفات', lessons: ['py-ds-6', 'py-ds-5', 'py-ds-json-csv'] },
    { title: 'تنظيم الكود', lessons: ['py-ds-7'] },
    { title: 'مشروع تطبيقي', lessons: ['py-ds-project'] },
  ],
  patches: {
    'py-ds-1': {
      content: md`
# الصفوف (Tuples)

الـ tuple مثل القائمة: **مجموعة مرتبة** يمكن الوصول لعناصرها بالفهرس. الفرق الجوهري أنها **غير قابلة للتعديل** بعد إنشائها.

\`\`\`python
point = (3, 5)
point[0]        # 3
point[0] = 10   # TypeError: 'tuple' object does not support item assignment
\`\`\`

## لماذا نريد شيئاً لا يتغير؟
- **التعبير عن النية**: إحداثيات نقطة أو تاريخ (سنة، شهر، يوم) قيمة واحدة مركبة لا يجب أن يتغير جزء منها بالخطأ.
- **مفاتيح القواميس**: المفتاح يجب أن يكون غير قابل للتعديل، لذلك يمكن استخدام tuple مفتاحاً ولا يمكن استخدام list.
- **إرجاع عدة قيم من دالة**: \`return a, b\` ترجع tuple.

## الإنشاء
\`\`\`python
t = (1, 2, 3)
t = 1, 2, 3       # الأقواس اختيارية، الفاصلة هي ما يصنع الـ tuple
single = (5,)     # عنصر واحد: الفاصلة ضرورية
not_tuple = (5)   # هذا مجرد الرقم 5
empty = ()
\`\`\`

## التفكيك (Unpacking)
من أكثر الميزات استخداماً في Python:
\`\`\`python
x, y = (3, 5)
a, b = 1, 2
name, age, city = ("منى", 21, "البصرة")
a, b = b, a            # تبديل قيمتين في سطر واحد
first, *rest = [1, 2, 3, 4]   # first=1, rest=[2, 3, 4]
\`\`\`
عدد المتغيرات يجب أن يساوي عدد العناصر (إلا مع \`*\`)، وإلا تحصل على \`ValueError\`.

## العمليات المتاحة
الفهرسة، التقطيع، \`len\`، \`in\`، الدمج \`+\`، التكرار \`*\`، و \`count()\` و \`index()\`. أما \`append\` و \`remove\` فغير موجودة لأنها تعدّل.

## List أم Tuple؟
| استخدم list | استخدم tuple |
|---|---|
| مجموعة عناصر متشابهة يتغير عددها (قائمة طلاب) | قيمة مركبة ثابتة البنية (نقطة، لون RGB) |
| تحتاج إضافة وحذف | تحتاج مفتاح قاموس أو حماية من التعديل |

## ملاحظة دقيقة
الـ tuple نفسها لا تتغير، لكن إذا احتوت قائمة، فالقائمة الداخلية يمكن تعديلها: \`t = ([1], 2)\` ثم \`t[0].append(9)\` مسموح.

## تمرين
اكتب دالة \`stats(numbers)\` ترجع tuple فيها (الأصغر، الأكبر، المتوسط)، وفكّكها في ثلاثة متغيرات. ثم أنشئ قاموساً مفاتيحه إحداثيات (x, y) وقيمه أسماء أماكن.
`,
    },
    'py-ds-2': {
      content: md`
# المجموعات (Sets)

المجموعة تحتوي **عناصر فريدة بدون ترتيب**. إضافة عنصر موجود لا تفعل شيئاً.

\`\`\`python
tags = {"python", "web", "python"}
print(tags)          # {'python', 'web'}
\`\`\`

## متى تستخدمها؟
1. **إزالة التكرار**: \`set(["أ", "ب", "أ"])\` ← \`{"أ", "ب"}\`.
2. **فحص الانتماء بسرعة كبيرة**: \`x in my_set\` سريع جداً حتى مع ملايين العناصر، بينما \`x in my_list\` يفحص العناصر واحداً واحداً.
3. **مقارنة مجموعتين**: من حضر الدرسين؟ من حضر الأول فقط؟

## الإنشاء
\`\`\`python
s = {1, 2, 3}
s = set([1, 2, 2, 3])   # من قائمة
empty = set()           # ⚠️ {} تنشئ قاموساً فارغاً وليس مجموعة
\`\`\`

## لا فهرسة
المجموعة غير مرتبة، لذلك \`s[0]\` خطأ. للمرور عليها استخدم \`for\`، وإن احتجت ترتيباً استخدم \`sorted(s)\`.

## التعديل
\`\`\`python
s.add(4)
s.remove(10)    # KeyError إذا لم يوجد
s.discard(10)   # بدون خطأ
\`\`\`

## عمليات المجموعات
| العملية | الرمز | المعنى |
|---|---|---|
| الاتحاد | \`a | b\` | كل العناصر من الاثنتين |
| التقاطع | \`a & b\` | المشترك فقط |
| الفرق | \`a - b\` | في a وليس في b |
| الفرق المتماثل | \`a ^ b\` | في إحداهما فقط |

\`\`\`python
lesson1 = {"أحمد", "منى", "علي"}
lesson2 = {"منى", "زيد"}
print(lesson1 & lesson2)   # {'منى'}: حضرت الدرسين
print(lesson1 - lesson2)   # حضروا الأول فقط
\`\`\`

## قيود العناصر
عناصر المجموعة يجب أن تكون **غير قابلة للتعديل** (أرقام، نصوص، tuples). لا يمكن وضع قائمة داخل مجموعة.

## خطأ شائع
\`list(set(items))\` يزيل التكرار لكنه **يفقد الترتيب الأصلي**. إن احتجت الترتيب استخدم \`list(dict.fromkeys(items))\`.

## تمرين
لديك قائمتا بريد إلكتروني لمشتركين في نشرتين. اطبع: عدد المشتركين المختلفين إجمالاً، ومن اشترك في الاثنتين، ومن اشترك في الأولى فقط.
`,
    },
    'py-ds-3': {
      content: md`
# النصوص المتقدمة

تعلمت في دورة الأساسيات الفهرسة والتقطيع والدوال الأساسية. هنا نتعمق في **معالجة النصوص الحقيقية**: تنظيف إدخال المستخدم، وتحليل البيانات النصية، وتنسيق المخرجات.

## مجموعات الدوال
| الهدف | الدوال |
|---|---|
| تغيير الحالة | \`upper\`, \`lower\`, \`title\`, \`capitalize\`, \`swapcase\` |
| التنظيف | \`strip\`, \`lstrip\`, \`rstrip\` (تقبل أحرفاً محددة: \`strip(".,")\`) |
| البحث | \`find\` (ترجع -1)، \`index\` (ترمي خطأ)، \`count\`، \`startswith\`، \`endswith\` |
| الفحص | \`isdigit\`, \`isalpha\`, \`isalnum\`, \`isspace\`, \`isupper\` |
| التقسيم والدمج | \`split\`, \`rsplit\`, \`splitlines\`, \`join\` |
| الاستبدال | \`replace(old, new, count)\` |

## join: عكس split
\`join\` تُستدعى على **الفاصل** وتأخذ قائمة نصوص:
\`\`\`python
words = ["تعلم", "Python", "اليوم"]
" ".join(words)    # 'تعلم Python اليوم'
", ".join(["أ", "ب"])
\`\`\`
\`join\` أسرع وأوضح بكثير من جمع النصوص بـ \`+\` داخل حلقة. العناصر يجب أن تكون نصوصاً: \`", ".join(map(str, [1, 2]))\`.

## split بذكاء
\`\`\`python
"a  b   c".split()        # ['a', 'b', 'c'] بدون وسيط: يقسم على أي مسافات
"a,b,,c".split(",")       # ['a', 'b', '', 'c']
"key=value=x".split("=", 1)  # ['key', 'value=x'] تقسيم مرة واحدة فقط
\`\`\`

## تنسيق متقدم بـ f-strings
| الصيغة | الناتج |
|---|---|
| \`f"{3.14159:.2f}"\` | \`3.14\` |
| \`f"{1234567:,}"\` | \`1,234,567\` |
| \`f"{0.256:.1%}"\` | \`25.6%\` |
| \`f"{'x':>5}"\` | محاذاة لليمين في عرض 5 |
| \`f"{7:03d}"\` | \`007\` |

هذا مفيد لطباعة جداول منتظمة.

## النصوص غير قابلة للتعديل
كل دالة ترجع **نصاً جديداً**. بناء نص كبير بإضافة أجزاء في حلقة \`s += part\` بطيء مع البيانات الكبيرة؛ اجمع الأجزاء في قائمة ثم \`"".join(parts)\`.

## مثال عملي: تنظيف إدخال
\`\`\`python
raw = "   Ahmed.ALI@Example.COM  "
email = raw.strip().lower()
user, domain = email.split("@")
\`\`\`

## تمرين
اكتب دالة تأخذ جملة وترجع قاموساً بعدد مرات ظهور كل كلمة، بعد تحويلها لأحرف صغيرة وحذف علامات الترقيم من أطراف الكلمات (\`strip(".,!?")\`).
`,
    },
    'py-ds-4': {
      content: md`
# Comprehensions

كثيراً ما نكتب حلقة هدفها الوحيد **بناء قائمة جديدة** من قائمة موجودة:
\`\`\`python
squares = []
for x in range(1, 6):
    squares.append(x ** 2)
\`\`\`
الـ comprehension تكتب نفس الفكرة في سطر واحد مقروء:
\`\`\`python
squares = [x ** 2 for x in range(1, 6)]
\`\`\`

## البنية
\`[ التعبير  for العنصر in المصدر  if الشرط ]\`

اقرأها هكذا: "أعطني التعبير لكل عنصر في المصدر يحقق الشرط".

\`\`\`python
evens = [n for n in range(20) if n % 2 == 0]
names = [s.title() for s in ["sara", "ali"]]
\`\`\`

## if في المكانين
\`\`\`python
nums = [4, -2, 7, -1]
[x for x in nums if x > 0]                 # تصفية: if في النهاية
["موجب" if x > 0 else "سالب" for x in nums]  # اختيار قيمة: if-else في البداية
\`\`\`
التصفية تحذف عناصر، أما if-else في البداية فتنتج عنصراً لكل عنصر.

## أنواع أخرى
\`\`\`python
words = ["Python", "code", "python"]
{n: n ** 2 for n in range(5)}          # قاموس
{w.lower() for w in words}             # مجموعة
sum(x ** 2 for x in range(1000))       # تعبير مولّد (generator)
\`\`\`
تعبير المولّد بين أقواس عادية **لا ينشئ القائمة في الذاكرة**، بل ينتج القيم واحدة واحدة، لذلك هو الأنسب مع \`sum\` و \`max\` و \`any\` على بيانات كبيرة.

## الحلقات المتداخلة
\`\`\`python
matrix = [[1, 2], [3, 4]]
pairs = [(x, y) for x in range(3) for y in range(3) if x != y]
flat = [n for row in matrix for n in row]
\`\`\`
الترتيب مثل الحلقات العادية: الأولى هي الخارجية.

## متى لا تستخدمها؟
- إذا احتجت أكثر من شرط وتحويل معقد، الحلقة العادية أوضح.
- إذا كان الهدف **تنفيذ فعل** (طباعة، حفظ) وليس بناء قائمة، استخدم حلقة: \`[print(x) for x in items]\` أسلوب سيئ.

## تمرين
من قائمة قواميس طلاب \`{"name", "score"}\`: أنشئ قائمة بأسماء الناجحين (≥ 50)، وقاموساً {الاسم: التقدير}، ومجموعة بالدرجات المختلفة.
`,
    },
    'py-ds-5': {
      content: md`
# التعامل مع الملفات

البيانات في المتغيرات تختفي عند انتهاء البرنامج. الملفات تتيح **حفظ البيانات** وقراءتها لاحقاً، والتعامل مع بيانات من مصادر أخرى (سجلات، تقارير، إعدادات).

## فتح الملف بـ with
\`\`\`python
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("السطر الأول\n")
\`\`\`
- \`with\` **تغلق الملف تلقائياً** عند انتهاء الكتلة، حتى لو حدث خطأ. لا تستخدم \`open\` بدونها في الحالات العادية.
- \`encoding="utf-8"\` **ضرورية مع النصوص العربية**: بدونها يستخدم نظام التشغيل ترميزه الافتراضي (في Windows قد يفشل الحفظ بـ UnicodeEncodeError أو تظهر الأحرف مشوهة).

## أوضاع الفتح
| الوضع | المعنى | إذا كان الملف موجوداً | إذا لم يكن موجوداً |
|---|---|---|---|
| \`"r"\` | قراءة (الافتراضي) | يقرأ | FileNotFoundError |
| \`"w"\` | كتابة | **يمسح المحتوى** | ينشئه |
| \`"a"\` | إضافة للنهاية | يضيف | ينشئه |
| \`"x"\` | إنشاء فقط | FileExistsError | ينشئه |
أضف \`b\` للملفات الثنائية (صور): \`"rb"\`.

## طرق القراءة
\`\`\`python
with open("notes.txt", encoding="utf-8") as f:
    text = f.read()          # كل المحتوى كنص واحد

with open("notes.txt", encoding="utf-8") as f:
    for line in f:           # سطراً سطراً (الأفضل للملفات الكبيرة)
        print(line.rstrip("\n"))
\`\`\`
كل سطر يُقرأ ومعه \`\n\` في نهايته؛ استخدم \`rstrip("\n")\` أو \`strip()\`.

## الكتابة
\`write\` لا تضيف سطراً جديداً تلقائياً؛ أضف \`\n\` بنفسك. و \`print(..., file=f)\` بديل مريح.

## المسارات مع pathlib
\`\`\`python
from pathlib import Path
p = Path("data") / "report.txt"   # يعمل على كل أنظمة التشغيل
p.parent.mkdir(exist_ok=True)
p.write_text("مرحباً", encoding="utf-8")
print(p.read_text(encoding="utf-8"), p.exists(), p.suffix)
\`\`\`

## الأخطاء المتوقعة
قراءة ملف غير موجود ترمي \`FileNotFoundError\`؛ تعامل معها بـ \`try/except\` كما تعلمت في الدرس السابق.

## تمرين
اكتب برنامجاً يضيف ملاحظة يكتبها المستخدم إلى ملف \`notes.txt\` (وضع الإضافة)، ثم يقرأ الملف ويطبع كل الملاحظات مرقمة.
`,
      codeExample: md`
from pathlib import Path

path = Path("notes.txt")

# كتابة (تمسح المحتوى السابق)
with open(path, "w", encoding="utf-8") as f:
    f.write("شراء الخبز\n")
    f.write("مراجعة درس Python\n")

# إضافة إلى النهاية
with open(path, "a", encoding="utf-8") as f:
    print("الاتصال بأحمد", file=f)

# القراءة سطراً سطراً مع الترقيم
with open(path, encoding="utf-8") as f:
    for number, line in enumerate(f, start=1):
        print(f"{number}. {line.rstrip()}")

# قراءة الكل دفعة واحدة
text = path.read_text(encoding="utf-8")
print("عدد الأسطر:", len(text.splitlines()))

# ملف غير موجود
try:
    with open("missing.txt", encoding="utf-8") as f:
        f.read()
except FileNotFoundError:
    print("الملف غير موجود")

# مجلدات ومسارات بشكل آمن على كل الأنظمة
report = Path("output") / "summary.txt"
report.parent.mkdir(exist_ok=True)
report.write_text("التقرير جاهز", encoding="utf-8")
print(report.exists(), report.suffix, report.name)

# تنظيف ملفات المثال
path.unlink()
report.unlink()
report.parent.rmdir()
`,
    },
    'py-ds-6': {
      content: md`
# معالجة الأخطاء (Exceptions)

بعض الأخطاء ليست أخطاء في كودك بل **ظروف متوقعة**: المستخدم أدخل نصاً بدل رقم، الملف غير موجود، الاتصال انقطع. بدلاً من أن يتوقف البرنامج، نلتقط الخطأ ونتعامل معه.

## try و except
\`\`\`python
try:
    age = int(input("العمر: "))
except ValueError:
    print("أدخل رقماً صحيحاً")
\`\`\`
إذا حدث \`ValueError\` داخل \`try\`، ينتقل التنفيذ فوراً إلى \`except\` ولا يُكمل بقية \`try\`.

## التقط أخطاء محددة
\`\`\`python
text = "0"
try:
    result = 10 / int(text)
except ValueError:
    print("ليس رقماً")
except ZeroDivisionError:
    print("لا يمكن القسمة على صفر")
\`\`\`
**تجنب** \`except:\` الفارغة أو \`except Exception\` لكل شيء: ستخفي أخطاء حقيقية في الكود (مثل خطأ إملائي في اسم متغير) وتجعل اكتشافها صعباً جداً. التقط فقط ما تتوقعه وتعرف كيف تتعامل معه.

## الوصول لتفاصيل الخطأ
\`\`\`python
except ValueError as error:
    print("التفاصيل:", error)
\`\`\`

## else و finally
\`\`\`python
text = "25"
try:
    value = int(text)
except ValueError:
    print("خطأ")
else:
    print("نجح التحويل:", value)   # فقط إذا لم يحدث خطأ
finally:
    print("يُنفَّذ دائماً")         # للتنظيف: إغلاق اتصال، حذف ملف مؤقت
\`\`\`
ضع في \`try\` أقل كود ممكن (الجزء الذي قد يفشل فقط)، وضع ما يعتمد على نجاحه في \`else\`.

## رفع الأخطاء بنفسك: raise
عندما تستقبل دالتك قيمة غير صالحة، أوقفها برسالة واضحة بدل إرجاع نتيجة خاطئة:
\`\`\`python
def set_age(age):
    if age < 0:
        raise ValueError("العمر لا يمكن أن يكون سالباً")
    return age
\`\`\`

## أخطاء مخصصة
\`\`\`python
class InsufficientFundsError(Exception):
    pass
\`\`\`
تسمية الخطأ تجعل الكود الذي يستدعي دالتك يلتقطه بدقة.

## LBYL أم EAFP؟
أسلوب Python المفضل غالباً: "جرّب ثم عالج الخطأ" (EAFP) بدل "افحص كل شيء قبل المحاولة". مثلاً \`try: d[key]\` بدل \`if key in d\` عندما يكون الغياب حالة نادرة.

## تمرين
اكتب دالة \`safe_divide(a, b)\` ترجع الناتج، أو ترمي \`ValueError\` برسالة واضحة إذا كان b صفراً. ثم اكتب برنامجاً يطلب رقمين ويستخدمها ويتعامل مع كل الأخطاء الممكنة.
`,
      codeExample: md`
def to_int(text):
    """تحويل آمن مع رسالة واضحة"""
    try:
        return int(text)
    except ValueError as error:
        print(f"تعذر التحويل: {error}")
        return None

print(to_int("42"), to_int("abc"))

# أخطاء متعددة محددة
def divide(a_text, b_text):
    try:
        a, b = int(a_text), int(b_text)
        result = a / b
    except ValueError:
        return "أدخل أرقاماً صحيحة"
    except ZeroDivisionError:
        return "لا يمكن القسمة على صفر"
    else:
        return f"الناتج: {result:.2f}"
    finally:
        print(f"[محاولة قسمة {a_text} على {b_text}]")

print(divide("10", "4"))
print(divide("10", "0"))
print(divide("x", "2"))

# raise للتحقق من المدخلات
def set_age(age):
    if not isinstance(age, int):
        raise TypeError("العمر يجب أن يكون رقماً صحيحاً")
    if age < 0:
        raise ValueError("العمر لا يمكن أن يكون سالباً")
    return age

for value in [25, -3, "عشرون"]:
    try:
        print("عمر صالح:", set_age(value))
    except (ValueError, TypeError) as error:
        print("مرفوض:", error)

# خطأ مخصص
class InsufficientFundsError(Exception):
    pass

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(f"الرصيد {balance} لا يكفي لسحب {amount}")
    return balance - amount

try:
    withdraw(100, 250)
except InsufficientFundsError as error:
    print(error)
`,
    },
    'py-ds-7': {
      content: md`
# الوحدات والحزم (Modules & Packages)

عندما يكبر البرنامج، وضع كل شيء في ملف واحد يجعله صعب القراءة والتعديل. الحل: **تقسيم الكود إلى ملفات**، كل ملف مسؤول عن جانب واحد.

## الوحدة (Module)
أي ملف \`.py\` هو وحدة. إذا كان لديك \`geometry.py\`:
\`\`\`python
# geometry.py
PI = 3.14159

def circle_area(r):
    return PI * r ** 2
\`\`\`
يمكنك استخدامه من ملف آخر في نفس المجلد:
\`\`\`python
# main.py
import geometry
print(geometry.circle_area(2))

from geometry import circle_area
print(circle_area(2))
\`\`\`

## طرق الاستيراد
| الصيغة | متى |
|---|---|
| \`import module\` | الأوضح: تعرف دائماً مصدر الدالة (\`math.sqrt\`) |
| \`from module import name\` | عندما تستخدم اسماً بكثرة |
| \`import module as alias\` | أسماء طويلة أو أعراف شائعة |
| \`from module import *\` | **تجنبها**: تجلب أسماء غير معروفة وقد تستبدل أسماءك |

## if __name__ == "__main__"
عند استيراد وحدة، **يُنفَّذ كل الكود الموجود في مستواها الأعلى**. لكي تكتب كود تجربة لا يعمل إلا عند تشغيل الملف مباشرة:
\`\`\`python
def main():
    print(circle_area(3))

if __name__ == "__main__":
    main()
\`\`\`
المتغير \`__name__\` يساوي \`"__main__"\` عند تشغيل الملف مباشرة، ويساوي اسم الوحدة عند استيرادها.

## الحزمة (Package)
مجلد يجمع عدة وحدات:
\`\`\`text
shop/
    __init__.py
    products.py
    cart.py
main.py
\`\`\`
ثم: \`from shop.cart import add_item\`. ملف \`__init__.py\` يحدد أن المجلد حزمة ويمكن أن يكون فارغاً.

## المكتبة القياسية
Python تأتي بمئات الوحدات الجاهزة: \`math\`, \`random\`, \`datetime\`, \`json\`, \`csv\`, \`pathlib\`, \`collections\`, \`statistics\`, \`re\`... قبل أن تكتب شيئاً بنفسك، ابحث إن كان موجوداً.

## المكتبات الخارجية
مكتبات من مطورين آخرين تُثبَّت بأداة \`pip\` (مثل \`requests\` و \`pandas\`). ستتعلم إدارتها مع البيئات الافتراضية في دورة Python المتقدمة.

## أخطاء شائعة
- تسمية ملفك \`random.py\` أو \`json.py\`: يستورد Python ملفك بدل الوحدة الأصلية.
- الاستيراد الدائري: \`a.py\` يستورد \`b.py\` و \`b.py\` يستورد \`a.py\`.

## تمرين
قسّم مشروع دفتر الدرجات من دورة الأساسيات إلى وحدتين: \`grades.py\` للدوال الحسابية، و \`main.py\` لقائمة الأوامر، واستخدم \`if __name__ == "__main__"\`.
`,
      codeExample: md`
import math
import statistics
import random
from datetime import date, timedelta
from collections import Counter
import json as js   # اسم مستعار (للتوضيح فقط)

# math
print(math.sqrt(16), math.ceil(4.2), math.floor(4.8))

# statistics بدل كتابة الدوال بأنفسنا
scores = [88, 92, 75, 92, 60]
print(statistics.mean(scores), statistics.median(scores), statistics.mode(scores))

# random مع seed للحصول على نتائج قابلة للتكرار
random.seed(7)
print(random.randint(1, 10), random.choice(["أ", "ب", "ج"]))

# datetime
today = date(2026, 1, 15)
print(today + timedelta(days=30))

# Counter
print(Counter("mississippi").most_common(2))

# json عبر الاسم المستعار
print(js.dumps({"lang": "Python"}))

# __name__ يساوي "__main__" لأننا نشغّل الملف مباشرة
def main():
    print("تشغيل مباشر للوحدة")

if __name__ == "__main__":
    main()
`,
    },
    'py-ds-8': {
      content: md`
# وحدة collections

القوائم والقواميس تكفي لمعظم المهام، لكن بعض الأنماط تتكرر كثيراً لدرجة أن Python وفّرت لها أنواعاً جاهزة في وحدة \`collections\`. استخدامها يجعل الكود أقصر وأوضح وأقل أخطاءً.

## Counter: العدّ
بدلاً من نمط \`counts[x] = counts.get(x, 0) + 1\`:
\`\`\`python
from collections import Counter
votes = Counter(["أ", "ب", "أ", "ج", "أ"])
votes["أ"]              # 3
votes.most_common(2)    # [('أ', 3), ('ب', 1)]
votes["د"]              # 0 (لا خطأ للعناصر غير الموجودة)
\`\`\`

## defaultdict: قيمة افتراضية تلقائية
\`\`\`python
from collections import defaultdict
groups = defaultdict(list)
for name, city in [("أحمد", "بغداد"), ("منى", "البصرة"), ("علي", "بغداد")]:
    groups[city].append(name)
\`\`\`
عند الوصول لمفتاح غير موجود يُنشأ تلقائياً بقيمة \`list()\` (أي \`[]\`). مع \`int\` تكون القيمة 0، ومع \`set\` مجموعة فارغة.

## namedtuple: tuple بأسماء حقول
\`\`\`python
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
p.x, p.y      # أوضح من p[0], p[1]
\`\`\`
خفيفة وغير قابلة للتعديل. للبنى الأكبر ستتعلم \`dataclass\` في دورة OOP.

## deque: إضافة وحذف سريع من الطرفين
\`list.pop(0)\` و \`list.insert(0, x)\` بطيئتان مع القوائم الكبيرة لأن كل العناصر تتحرك. \`deque\` سريعة من الطرفين:
\`\`\`python
from collections import deque
queue = deque()
queue.append("طلب 1")      # دخول الطابور
first = queue.popleft()     # الخروج من المقدمة
recent = deque(maxlen=3)    # يحتفظ بآخر 3 عناصر فقط
\`\`\`
مثالية للطوابير (FIFO) وسجل "آخر N عمليات".

## OrderedDict
منذ Python 3.7 القاموس العادي يحفظ الترتيب، لذلك نادراً ما تحتاج \`OrderedDict\` اليوم إلا لميزات خاصة مثل \`move_to_end\`.

## متى تستخدم ماذا؟
| تحتاج | استخدم |
|---|---|
| عدّ التكرارات | Counter |
| تجميع عناصر حسب مفتاح | defaultdict(list) |
| سجل خفيف بأسماء حقول | namedtuple |
| طابور أو آخر N عناصر | deque |

## تمرين
من نص طويل: اطبع أكثر 5 كلمات تكراراً (Counter)، وجمّع الكلمات حسب حرفها الأول (defaultdict)، واحتفظ بآخر 3 كلمات قرأتها (deque).
`,
    },
  },
  newLessons: [
    {
      id: 'py-ds-sorting',
      title: 'الترتيب والبحث: sorted و key و zip و enumerate',
      description: 'ترتيب البيانات حسب أي معيار، والمرور على قائمتين معاً، ودوال any و all',
      xpReward: 100,
      language: 'python',
      content: md`
# الترتيب والبحث في البيانات

البيانات الحقيقية نادراً ما تكون أرقاماً بسيطة: قائمة طلاب بدرجاتهم، منتجات بأسعارها. نحتاج أن نرتبها **حسب معيار نختاره**، ونمر على أكثر من قائمة معاً.

## sort مقابل sorted
\`\`\`python
nums = [5, 2, 9]
nums.sort()             # تعدّل القائمة نفسها وترجع None
new = sorted(nums)      # ترجع قائمة جديدة وتترك الأصل
\`\`\`
\`sorted\` تعمل مع أي مصدر (tuple، مجموعة، مفاتيح قاموس) وترجع دائماً قائمة. ولكليهما \`reverse=True\`.

## الترتيب بمفتاح: key
\`key\` دالة تُطبَّق على كل عنصر، ويُرتَّب حسب ناتجها:
\`\`\`python
words = ["قلم", "كتاب", "ممحاة"]
sorted(words, key=len)          # حسب الطول

students = [("منى", 95), ("علي", 72), ("زيد", 88)]
def by_score(student):
    return student[1]
sorted(students, key=by_score, reverse=True)
\`\`\`

## lambda: دالة صغيرة في مكانها
بدلاً من تعريف \`by_score\` لاستخدام واحد:
\`\`\`python
sorted(students, key=lambda s: s[1], reverse=True)
\`\`\`
\`lambda s: s[1]\` تعني دالة تأخذ s وترجع s[1]. استخدمها للتعابير القصيرة فقط.

## الترتيب بأكثر من معيار
أرجع tuple من key: يُرتب بالأول ثم بالثاني عند التساوي.
\`\`\`python
people = [{"name": "منى", "city": "بغداد"}, {"name": "علي", "city": "البصرة"}]
students = [("منى", 95), ("علي", 72)]
sorted(people, key=lambda p: (p["city"], p["name"]))
sorted(students, key=lambda s: (-s[1], s[0]))  # الدرجة تنازلياً ثم الاسم أبجدياً
\`\`\`

## min و max بمفتاح
\`\`\`python
best = max(students, key=lambda s: s[1])   # الطالب صاحب أعلى درجة كاملاً
\`\`\`

## enumerate و zip
\`\`\`python
sorted_students = [("منى", 95), ("زيد", 88)]
for rank, (name, score) in enumerate(sorted_students, start=1):
    print(rank, name, score)

names = ["منى", "علي"]
scores = [95, 72]
for name, score in zip(names, scores):
    print(name, score)
grades = dict(zip(names, scores))   # {'منى': 95, 'علي': 72}
\`\`\`
\`zip\` تتوقف عند أقصر قائمة.

## any و all
\`\`\`python
scores = [95, 72, 88]
any(s >= 90 for s in scores)   # هل يوجد طالب ممتاز؟
all(s >= 50 for s in scores)   # هل نجح الجميع؟
\`\`\`

## ترتيب قاموس
\`\`\`python
prices = {"قهوة": 3, "شاي": 1, "عصير": 4}
sorted(prices.items(), key=lambda item: item[1])
\`\`\`

## تمرين
لديك قائمة منتجات (اسم، سعر، كمية). اطبعها مرتبة حسب القيمة الإجمالية (السعر × الكمية) تنازلياً مع ترقيم، واطبع أرخص منتج، وتحقق إن كانت كل الكميات أكبر من صفر.
`,
      codeExample: md`
students = [("منى", 95), ("علي", 72), ("زيد", 88), ("سارة", 95)]

# sorted ترجع قائمة جديدة
print(sorted([5, 2, 9, 1]))
print(sorted(["قلم", "كتاب", "ممحاة"], key=len))

# الترتيب بالدرجة تنازلياً، ثم بالاسم عند التساوي
ranked = sorted(students, key=lambda s: (-s[1], s[0]))
for rank, (name, score) in enumerate(ranked, start=1):
    print(f"{rank}. {name:<6} {score}")

# min/max بمفتاح ترجع العنصر كاملاً
print("الأعلى:", max(students, key=lambda s: s[1]))
print("الأقل:", min(students, key=lambda s: s[1]))

# zip لدمج قائمتين
names = ["قهوة", "شاي", "عصير"]
prices = [3.5, 1.25, 4.0]
menu = dict(zip(names, prices))
print(menu)

# ترتيب قاموس حسب القيم
for item, price in sorted(menu.items(), key=lambda kv: kv[1]):
    print(f"{item}: {price}")

# any / all
scores = [s for _, s in students]
print("يوجد ممتاز:", any(s >= 90 for s in scores))
print("نجح الجميع:", all(s >= 50 for s in scores))

# sort تعدّل القائمة وترجع None
values = [3, 1, 2]
result = values.sort()
print(values, result)   # [1, 2, 3] None
`,
      quiz: {
        question: 'ماذا ترجع nums.sort()؟',
        options: ['القائمة مرتبة', 'نسخة مرتبة', 'None', 'True'],
        correctAnswer: 2,
        explanation: 'sort() ترتب القائمة في مكانها وترجع None؛ لإرجاع قائمة جديدة استخدم sorted().',
      },
    },
    {
      id: 'py-ds-json-csv',
      title: 'JSON و CSV: تبادل البيانات',
      description: 'قراءة وكتابة JSON و CSV بالمكتبة القياسية والتعامل مع النصوص العربية',
      xpReward: 110,
      language: 'python',
      content: md`
# JSON و CSV: تبادل البيانات

الملف النصي العادي مناسب للملاحظات، لكن البيانات المنظمة تحتاج **تنسيقاً متفقاً عليه** حتى تقرأها برامج أخرى. أشهر تنسيقين: **JSON** للبيانات المتداخلة (تطبيقات الويب والإعدادات)، و **CSV** للجداول (Excel وجداول البيانات).

## JSON
يشبه قواميس وقوائم Python:
\`\`\`json
{"name": "منى", "age": 21, "skills": ["Python", "SQL"], "active": true}
\`\`\`
| Python | JSON |
|---|---|
| dict | object \`{}\` |
| list, tuple | array \`[]\` |
| str | string (بعلامات تنصيص مزدوجة فقط) |
| True / False / None | true / false / null |

## أربع دوال فقط
| الدالة | الوظيفة |
|---|---|
| \`json.dumps(obj)\` | كائن Python ← نص JSON |
| \`json.loads(text)\` | نص JSON ← كائن Python |
| \`json.dump(obj, f)\` | كتابة إلى ملف |
| \`json.load(f)\` | قراءة من ملف |
حرف **s** في النهاية يعني string.

\`\`\`python
import json
user = {"name": "منى", "skills": ["Python"]}
with open("user.json", "w", encoding="utf-8") as f:
    json.dump(user, f, ensure_ascii=False, indent=2)
\`\`\`
- \`ensure_ascii=False\` ليُحفظ النص العربي مقروءاً بدل \`منى\`.
- \`indent=2\` لتنسيق مريح للقراءة.

مفاتيح JSON نصوص دائماً: القاموس \`{1: "a"}\` يعود بعد الحفظ والقراءة \`{"1": "a"}\`.

## CSV
كل سطر صف، والقيم مفصولة بفواصل:
\`\`\`text
name,city,score
منى,البصرة,95
\`\`\`
استخدم وحدة \`csv\` ولا تقسّم بـ \`split(",")\` يدوياً: القيمة قد تحتوي فاصلة داخل علامات تنصيص.

\`\`\`python
import csv
with open("students.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):     # كل صف قاموس بأسماء الأعمدة
        print(row["name"], int(row["score"]))
\`\`\`
- **كل القيم تُقرأ كنصوص**؛ حوّل الأرقام بنفسك.
- \`newline=""\` مطلوبة عند فتح ملفات CSV حتى لا تظهر أسطر فارغة إضافية في Windows.

للكتابة: \`csv.DictWriter(f, fieldnames=[...])\` ثم \`writeheader()\` و \`writerow(dict)\`.

## Excel والعربية
لكي يفتح Excel ملف CSV عربي بشكل صحيح، احفظه بترميز \`"utf-8-sig"\`.

## JSON أم CSV؟
| JSON | CSV |
|---|---|
| بيانات متداخلة (قوائم داخل كائنات) | جدول بسيط بأعمدة ثابتة |
| واجهات الويب (APIs) | التصدير إلى Excel |

## تمرين
اقرأ ملف CSV للمنتجات (الاسم، الفئة، السعر)، واحسب متوسط السعر لكل فئة، واحفظ النتيجة في ملف JSON بنص عربي مقروء.
`,
      codeExample: md`
import csv
import json
from pathlib import Path

# ===== JSON =====
user = {"name": "منى", "age": 21, "skills": ["Python", "SQL"], "active": True, "manager": None}

text = json.dumps(user, ensure_ascii=False)
print(text)
back = json.loads(text)
print(back["skills"][0], back["active"])

Path("user.json").write_text(json.dumps(user, ensure_ascii=False, indent=2), encoding="utf-8")
with open("user.json", encoding="utf-8") as f:
    loaded = json.load(f)
print(loaded == user)                       # True

# مفاتيح JSON نصوص دائماً
print(json.loads(json.dumps({1: "a"})))     # {'1': 'a'}

# ===== CSV: كتابة =====
rows = [
    {"name": "منى", "city": "البصرة", "score": 95},
    {"name": "علي", "city": "بغداد", "score": 72},
    {"name": "زيد", "city": "بغداد", "score": 88},
]
with open("students.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "city", "score"])
    writer.writeheader()
    writer.writerows(rows)

# ===== CSV: قراءة (كل القيم نصوص) =====
by_city = {}
with open("students.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        score = int(row["score"])
        by_city.setdefault(row["city"], []).append(score)

averages = {city: sum(s) / len(s) for city, s in by_city.items()}
print(averages)

# تنظيف ملفات المثال
Path("user.json").unlink()
Path("students.csv").unlink()
`,
      quiz: {
        question: 'لماذا نستخدم ensure_ascii=False عند حفظ JSON يحتوي نصاً عربياً؟',
        options: [
          'لتسريع الحفظ',
          'لكي يُحفظ النص العربي مقروءاً بدلاً من رموز \\u',
          'لأن JSON لا يدعم العربية بدونها',
          'لضغط الملف',
        ],
        correctAnswer: 1,
        explanation: 'بدونها تحوّل json الأحرف غير الإنجليزية إلى رموز \\uXXXX؛ البيانات صحيحة لكنها غير مقروءة.',
      },
    },
    {
      id: 'py-ds-project',
      title: 'مشروع: تحليل ملف مبيعات',
      description: 'قراءة CSV وتنظيف البيانات وتجميعها وترتيبها وكتابة تقرير JSON مع معالجة الأخطاء',
      xpReward: 150,
      language: 'python',
      content: md`
# مشروع: تحليل ملف مبيعات

مشروع يحاكي مهمة حقيقية يقوم بها المبرمجون يومياً: لديك ملف بيانات خام فيه أخطاء، والمطلوب تقرير واضح منه.

## البيانات
ملف \`sales.csv\` بالأعمدة: \`date, product, category, quantity, price\`. بعض الصفوف معطوبة: كمية نصية، سعر فارغ، مسافات زائدة في أسماء المنتجات.

## المطلوب
1. قراءة الملف بـ \`csv.DictReader\`.
2. **تنظيف** كل صف: حذف المسافات، تحويل الكمية لـ int والسعر لـ float.
3. **تجاهل الصفوف المعطوبة** دون إيقاف البرنامج، مع عدّها.
4. حساب: إجمالي المبيعات، المبيعات لكل فئة، أكثر 3 منتجات مبيعاً بالكمية.
5. كتابة التقرير في \`report.json\`.

## المفاهيم المستخدمة
| الخطوة | المفهوم |
|---|---|
| القراءة | الملفات، csv، with |
| التنظيف | strip، التحويل، try/except ValueError |
| التجميع | defaultdict، Counter |
| الترتيب | sorted مع key، most_common |
| الإخراج | json.dump مع ensure_ascii=False |
| التنظيم | دوال صغيرة، if __name__ == "__main__" |

## التصميم
- \`parse_row(row)\`: ترجع قاموساً نظيفاً أو ترمي \`ValueError\`.
- \`load_sales(path)\`: ترجع (الصفوف الصالحة، عدد المعطوبة).
- \`summarize(sales)\`: ترجع قاموس التقرير.
- \`main()\`: تربط كل شيء.

لماذا ترمي \`parse_row\` خطأً بدلاً من طباعة رسالة؟ لأنها لا تعرف ماذا يريد مستدعيها: ربما يريد تجاهل الصف، أو إيقاف البرنامج، أو تسجيله. **الدالة التي تكتشف المشكلة ليست دائماً التي تقرر كيف تتعامل معها.**

## نقطة تصميم: لا تثق بالبيانات
افترض دائماً أن البيانات القادمة من ملف أو مستخدم قد تكون خاطئة. التحقق في مكان واحد (\`parse_row\`) يجعل بقية الكود بسيطاً لأنه يتعامل مع بيانات نظيفة مضمونة.

## أفكار للتوسعة
- المبيعات حسب الشهر (من عمود التاريخ).
- قراءة اسم الملف من سطر الأوامر.
- حفظ الصفوف المعطوبة في ملف منفصل للمراجعة.

## ما الذي تتقنه بعد هذا المشروع؟
تحويل بيانات غير مضمونة إلى نتائج موثوقة، وهي مهارة أساسية في تحليل البيانات وتطوير الخلفيات. الخطوة التالية: دورة البرمجة الكائنية لتنظيم البرامج الأكبر.
`,
      codeExample: md`
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

SAMPLE = """date,product,category,quantity,price
2026-01-03, قهوة ,مشروبات,3,4.5
2026-01-03,شاي,مشروبات,5,1.25
2026-01-04,كرواسون,مخبوزات,2,2.0
2026-01-04,قهوة,مشروبات,abc,4.5
2026-01-05,كعكة,مخبوزات,1,
2026-01-05,شاي,مشروبات,4,1.25
2026-01-06,كرواسون,مخبوزات,6,2.0
"""

def parse_row(row):
    """ترجع صفاً نظيفاً أو ترمي ValueError إذا كان معطوباً."""
    product = row["product"].strip()
    if not product:
        raise ValueError("اسم منتج فارغ")
    return {
        "product": product,
        "category": row["category"].strip(),
        "quantity": int(row["quantity"]),
        "price": float(row["price"]),
    }

def load_sales(path):
    valid, broken = [], 0
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            try:
                valid.append(parse_row(row))
            except (ValueError, KeyError):
                broken += 1
    return valid, broken

def summarize(sales):
    total = 0.0
    by_category = defaultdict(float)
    quantities = Counter()
    for s in sales:
        amount = s["quantity"] * s["price"]
        total += amount
        by_category[s["category"]] += amount
        quantities[s["product"]] += s["quantity"]
    return {
        "total": round(total, 2),
        "by_category": {k: round(v, 2) for k, v in sorted(by_category.items(), key=lambda kv: -kv[1])},
        "top_products": quantities.most_common(3),
    }

def main():
    path = Path("sales.csv")
    path.write_text(SAMPLE, encoding="utf-8")
    sales, broken = load_sales(path)
    report = summarize(sales)
    report["broken_rows"] = broken
    Path("report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    path.unlink()
    Path("report.json").unlink()

if __name__ == "__main__":
    main()
`,
      quiz: {
        question: 'لماذا ترمي parse_row خطأ ValueError بدلاً من طباعة رسالة مباشرة؟',
        options: [
          'لأن الطباعة غير مسموحة داخل الدوال',
          'لكي يقرر من يستدعيها كيف يتعامل مع الصف المعطوب',
          'لأن ValueError أسرع',
          'لكي يتوقف البرنامج دائماً',
        ],
        correctAnswer: 1,
        explanation: 'الدالة تكتشف المشكلة، والمستدعي (load_sales) يقرر: هنا يتجاهل الصف ويعدّه.',
      },
    },
  ],
};

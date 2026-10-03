/**
 * قاموس مفاهيم برمجية قصير للرد الفوري على أسئلة "شنو هو X؟" بدون Gemini.
 * كل مصطلح يُربط تلقائياً بدرس Kodax الذي يشرحه (يحسبه scripts/build-ai-knowledge.ts من المنهج).
 * الإضافة: سطر جديد هنا ثم إعادة توليد المعرفة.
 */
export interface GlossaryEntry {
  id: string;
  /** أسماء المصطلح (تُطبّع وتُطابق كاملة) */
  terms: string[];
  answer: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  // ---- أساسيات ----
  { id: 'programming', terms: ['البرمجه', 'برمجه', 'programming', 'coding'], answer: 'البرمجة هي كتابة تعليمات بلغة يفهمها الحاسوب حتى ينفّذ مهمة: حسابات، مواقع، تطبيقات، ألعاب.' },
  { id: 'algorithm', terms: ['خوارزميه', 'الخوارزميه', 'algorithm', 'الخوارزميات'], answer: 'الخوارزمية خطوات مرتبة وواضحة لحل مشكلة، مثل وصفة طبخ. الكود هو كتابة الخوارزمية بلغة برمجة.' },
  { id: 'variable', terms: ['variable', 'المتغير', 'متغير'], answer: 'المتغير اسم يخزن قيمة بالذاكرة حتى تستخدمها وتغيّرها لاحقاً.\n```python\nage = 20\nage = age + 1  # صار 21\n```' },
  { id: 'constant', terms: ['ثابت', 'الثابت', 'constant', 'const'], answer: 'الثابت قيمة ما تتغير بعد تعريفها. بـ JavaScript نستخدم `const`، وبـ Python العرف كتابة الاسم بحروف كبيرة مثل `PI = 3.14`.' },
  { id: 'data-types', terms: ['انواع البيانات', 'نوع البيانات', 'data types', 'data type'], answer: 'نوع البيانات يحدد شكل القيمة: نص (string)، عدد صحيح (int)، عدد عشري (float)، منطقي (boolean: True/False)، وقوائم وقواميس وغيرها.' },
  { id: 'string', terms: ['string', 'سترنج', 'النص البرمجي', 'السلسله النصيه'], answer: 'الـ string نص محاط بعلامات تنصيص مثل `"مرحبا"`. تكدر تدمجه وتقطّعه وتبحث بيه.' },
  { id: 'integer', terms: ['integer', 'int', 'العدد الصحيح'], answer: 'الـ integer عدد صحيح بدون فاصلة مثل `5` أو `-12`.' },
  { id: 'float', terms: ['float', 'العدد العشري', 'double'], answer: 'الـ float عدد بيه فاصلة عشرية مثل `3.14`. انتبه: الحسابات العشرية أحياناً تعطي تقريب صغير مثل `0.1 + 0.2 = 0.30000000000000004`.' },
  { id: 'boolean', terms: ['boolean', 'bool', 'القيمه المنطقيه', 'بوليان'], answer: 'الـ boolean قيمة منطقية: صح أو غلط (`True/False` بـ Python، `true/false` بـ JavaScript)، وتُستخدم بالشروط.' },
  { id: 'null', terms: ['null', 'none', 'undefined', 'nil'], answer: '`null` (أو `None` بـ Python) تعني "ماكو قيمة". بـ JavaScript أكو أيضاً `undefined` يعني المتغير معرّف بس ما انطته قيمة.' },
  { id: 'operator', terms: ['العوامل', 'operators', 'operator', 'المعاملات الحسابيه'], answer: 'العوامل رموز تسوي عمليات: حسابية (`+ - * / %`)، مقارنة (`== != > <`)، ومنطقية (`and or not` أو `&& || !`).' },
  { id: 'condition', terms: ['if', 'الشرط', 'الجمله الشرطيه', 'if else', 'conditional', 'الشروط'], answer: 'الجملة الشرطية تنفّذ كود حسب شرط:\n```python\nif age >= 18:\n    print("بالغ")\nelse:\n    print("قاصر")\n```' },
  { id: 'loop', terms: ['loop', 'الحلقه', 'الحلقات', 'التكرار'], answer: 'الحلقة تكرر كود عدة مرات. `for` لما تعرف عدد التكرار أو تمر على عناصر، و`while` تتكرر طالما الشرط صحيح.\n```python\nfor i in range(3):\n    print(i)  # 0 1 2\n```' },
  { id: 'for-vs-while', terms: ['الفرق بين for و while', 'for vs while', 'for و while'], answer: '`for` للمرور على عناصر أو عدد معروف من المرات، و`while` للتكرار طالما شرط معين صحيح (عدد المرات مو معروف مسبقاً). انتبه بـ while لا تنسى تغيّر الشرط حتى ما تصير حلقة لا نهائية.' },
  { id: 'function', terms: ['function', 'الداله', 'الدوال', 'functions'], answer: 'الدالة مجموعة أوامر لها اسم، تستدعيها وقت ما تحتاج بدل تكرار الكود. تاخذ مدخلات (parameters) وترجع نتيجة (return).\n```python\ndef add(a, b):\n    return a + b\n```' },
  { id: 'parameter', terms: ['parameter', 'parameters', 'argument', 'arguments', 'المعامل', 'الوسيط', 'البارامتر'], answer: 'الـ parameter هو اسم المدخل بتعريف الدالة (`def greet(name)`)، والـ argument هي القيمة الفعلية اللي ترسلها وقت الاستدعاء (`greet("علي")`).' },
  { id: 'return', terms: ['return', 'الارجاع', 'ريتيرن'], answer: '`return` ترجّع قيمة من الدالة للمكان اللي استدعاها وتنهي تنفيذ الدالة. بدونها الدالة ترجّع `None` بـ Python أو `undefined` بـ JavaScript.' },
  { id: 'scope', terms: ['scope', 'النطاق', 'نطاق المتغير'], answer: 'النطاق (scope) يحدد وين يكدر المتغير ينشاف: متغير معرّف داخل دالة ما ينشاف براها (local)، والمعرّف برا كل الدوال global.' },
  { id: 'recursion', terms: ['recursion', 'الاستدعاء الذاتي', 'العوديه', 'التعاود'], answer: 'الاستدعاء الذاتي (recursion) لما الدالة تستدعي نفسها لحل نسخة أصغر من المشكلة، ولازم يكون إلها شرط توقف.\n```python\ndef fact(n):\n    return 1 if n <= 1 else n * fact(n - 1)\n```' },
  { id: 'comment', terms: ['comment', 'التعليقات', 'التعليق بالكود', 'comments'], answer: 'التعليق نص داخل الكود للشرح وما ينفّذ: `#` بـ Python، و`//` أو `/* */` بـ JavaScript وC++.' },
  { id: 'syntax-error', terms: ['syntax error', 'خطا نحوي', 'خطا بالصياغه', 'syntaxerror'], answer: 'الـ syntax error خطأ بكتابة الكود نفسه (قوس ناقص، نقطتين منسية، مسافة بادئة غلط)، فالبرنامج ما يشتغل أصلاً. الرسالة عادة تحدد رقم السطر.' },
  { id: 'logic-error', terms: ['logic error', 'خطا منطقي'], answer: 'الخطأ المنطقي لما الكود يشتغل بدون رسالة خطأ بس النتيجة غلط. تكتشفه بطباعة القيم وتتبّع التنفيذ خطوة بخطوة.' },
  { id: 'exception', terms: ['exception', 'try except', 'try catch', 'الاستثناء', 'معالجه الاخطاء', 'exceptions'], answer: 'الاستثناء خطأ يصير وقت التشغيل. تتعامل وياه بـ `try/except` بـ Python أو `try/catch` بـ JavaScript حتى ما يتوقف البرنامج.\n```python\ntry:\n    x = int("abc")\nexcept ValueError:\n    print("مو رقم")\n```' },
  { id: 'debugging', terms: ['debugging', 'debug', 'تصحيح الاخطاء', 'الديبك'], answer: 'الـ debugging هو إيجاد الأخطاء وتصحيحها: اقرأ رسالة الخطأ، اطبع القيم المهمة، وتتبّع الكود خطوة بخطوة حتى تلاكي وين اختلف عن المتوقع.' },
  { id: 'compiler', terms: ['compiler', 'المترجم', 'الكومبايلر'], answer: 'المترجم (compiler) يحوّل الكود كله لكود آلة قبل التشغيل (مثل C++). أما المفسّر (interpreter) فينفّذ الكود سطر بسطر (مثل Python).' },
  { id: 'interpreter', terms: ['interpreter', 'المفسر'], answer: 'المفسّر ينفّذ الكود مباشرة سطر بسطر بدون ملف تنفيذي منفصل، مثل Python وJavaScript. أسهل للتجربة بس عادة أبطأ من الكود المترجم.' },
  { id: 'ide', terms: ['ide', 'محرر الاكواد', 'vs code', 'vscode'], answer: 'الـ IDE أو محرر الأكواد برنامج تكتب بيه الكود مع تلوين وإكمال تلقائي وتشغيل وتصحيح، مثل VS Code.' },

  // ---- هياكل البيانات ----
  { id: 'array', terms: ['array', 'المصفوفه', 'المصفوفات'], answer: 'المصفوفة (array) مجموعة عناصر مرتبة تتوصل لها برقم (index) يبدأ من 0.\n```javascript\nconst nums = [10, 20, 30];\nconsole.log(nums[0]); // 10\n```' },
  { id: 'list', terms: ['list', 'القائمه', 'القوائم'], answer: 'الـ list بـ Python مجموعة عناصر مرتبة وقابلة للتعديل: `nums = [1, 2, 3]`، تضيف بـ `append` وتحذف بـ `remove` أو `pop`.' },
  { id: 'tuple', terms: ['tuple', 'التبل', 'الصف tuple'], answer: 'الـ tuple مثل الـ list بس ما يتعدل بعد إنشائه: `point = (3, 4)`. مفيد للبيانات الثابتة.' },
  { id: 'list-vs-tuple', terms: ['الفرق بين list و tuple', 'list vs tuple', 'list و tuple'], answer: 'الـ list قابلة للتعديل `[1, 2]`، والـ tuple ثابت `(1, 2)`. استخدم tuple للبيانات اللي ما لازم تتغير، وهو أسرع شوية ويكدر يكون مفتاح بقاموس.' },
  { id: 'dict', terms: ['dict', 'القاموس', 'القواميس', 'dictionaries'], answer: 'القاموس (dict) يخزن أزواج مفتاح: قيمة.\n```python\nuser = {"name": "علي", "age": 20}\nprint(user["name"])\n```' },
  { id: 'set', terms: ['set', 'المجموعه set', 'sets'], answer: 'الـ set مجموعة عناصر بدون تكرار وبدون ترتيب: `{1, 2, 3}`. مفيدة لحذف التكرار وللفحص السريع إذا العنصر موجود.' },
  { id: 'stack', terms: ['stack', 'المكدس', 'ستاك'], answer: 'المكدس (stack) هيكل "آخر داخل أول طالع" (LIFO) مثل كومة صحون: تضيف بالأعلى (push) وتشيل من الأعلى (pop).' },
  { id: 'queue', terms: ['queue', 'الطابور', 'الطابور queue'], answer: 'الطابور (queue) هيكل "أول داخل أول طالع" (FIFO) مثل طابور الناس: تضيف بالنهاية وتشيل من البداية.' },
  { id: 'linked-list', terms: ['linked list', 'القائمه المترابطه', 'القائمه المتصله'], answer: 'القائمة المترابطة سلسلة عُقد، كل عقدة بيها قيمة ومؤشر للعقدة اللي بعدها. الإضافة والحذف سريعة بس الوصول لعنصر بالمنتصف يحتاج مرور.' },
  { id: 'tree', terms: ['tree', 'الشجره', 'binary tree', 'الشجره الثنائيه'], answer: 'الشجرة هيكل هرمي: عقدة جذر ولها أبناء. بالشجرة الثنائية كل عقدة إلها ابنين بالأكثر، وبشجرة البحث الثنائية الأصغر يسار والأكبر يمين.' },
  { id: 'graph', terms: ['graph', 'الرسم البياني graph', 'الغراف', 'المخطط graph'], answer: 'الـ graph مجموعة عُقد مرتبطة بحواف، مثل خريطة مدن وطرق. نمر عليه بخوارزميات مثل BFS وDFS.' },
  { id: 'hash-table', terms: ['hash table', 'hash map', 'جدول التجزئه', 'hashmap'], answer: 'جدول التجزئة يخزن مفتاح وقيمة ويحوّل المفتاح لموقع بدالة hash، فالبحث يكون سريع جداً بالمتوسط O(1). القاموس بـ Python مبني على هذه الفكرة.' },
  { id: 'big-o', terms: ['big o', 'التعقيد الزمني', 'تعقيد الخوارزميه', 'time complexity'], answer: 'Big O يوصف كيف يكبر وقت الخوارزمية مع حجم المدخلات: O(1) ثابت، O(log n) مثل البحث الثنائي، O(n) مرور واحد، O(n²) حلقتين متداخلتين.' },
  { id: 'binary-search', terms: ['binary search', 'البحث الثنائي'], answer: 'البحث الثنائي يدور بقائمة **مرتبة** بتقسيمها نصين كل مرة، فيلاكي العنصر بـ O(log n) بدل المرور على كل العناصر.' },
  { id: 'sorting', terms: ['sorting', 'الترتيب', 'خوارزميات الترتيب', 'sort'], answer: 'خوارزميات الترتيب ترتب العناصر: البسيطة مثل Bubble Sort بـ O(n²)، والأسرع مثل Merge Sort وQuick Sort بـ O(n log n). عملياً استخدم دالة اللغة الجاهزة مثل `sorted()`.' },

  // ---- OOP ----
  { id: 'oop', terms: ['oop', 'البرمجه الكائنيه', 'البرمجه الشيئيه', 'object oriented programming'], answer: 'البرمجة الكائنية تنظّم الكود على شكل كائنات تجمع البيانات والسلوك. ركائزها: التغليف، الوراثة، تعدد الأشكال، والتجريد.' },
  { id: 'class', terms: ['class', 'الكلاس', 'الصنف', 'classes'], answer: 'الكلاس قالب لإنشاء كائنات: يحدد خصائصها ودوالها.\n```python\nclass Dog:\n    def __init__(self, name):\n        self.name = name\n    def bark(self):\n        return f"{self.name}: هاو!"\n```' },
  { id: 'object', terms: ['object', 'الكائن', 'الكائنات'], answer: 'الكائن نسخة حقيقية من كلاس بيها قيم خاصة بيها: `d = Dog("ريكس")`. بـ JavaScript الكلمة object تعني أيضاً بنية مفتاح-قيمة `{name: "علي"}`.' },
  { id: 'constructor', terms: ['constructor', 'الباني', 'المنشئ', '__init__'], answer: 'الـ constructor دالة تشتغل تلقائياً لما تنشئ كائن جديد وتجهّز خصائصه: `__init__` بـ Python و`constructor` بـ JavaScript.' },
  { id: 'method', terms: ['method', 'methods', 'الميثود', 'الطريقه method'], answer: 'الـ method دالة تابعة لكلاس أو كائن، تستدعيها بالنقطة: `dog.bark()`.' },
  { id: 'inheritance', terms: ['inheritance', 'الوراثه'], answer: 'الوراثة تخلي كلاس جديد ياخذ خصائص ودوال كلاس موجود ويضيف عليها: `class Cat(Animal):`. تقلل تكرار الكود.' },
  { id: 'polymorphism', terms: ['polymorphism', 'تعدد الاشكال', 'تعدد الاوجه'], answer: 'تعدد الأشكال يعني نفس اسم الدالة يتصرف بشكل مختلف حسب نوع الكائن، مثل `speak()` ترجع "هاو" للكلب و"مياو" للقطة.' },
  { id: 'encapsulation', terms: ['encapsulation', 'التغليف'], answer: 'التغليف إخفاء تفاصيل الكائن الداخلية والسماح بالتعامل وياه عبر دوال محددة، حتى ما تنعدل البيانات بشكل غلط.' },
  { id: 'abstraction', terms: ['abstraction', 'التجريد'], answer: 'التجريد يعني تعرض للمستخدم شنو يسوي الشي بدون تفاصيل شلون يسويه، مثل زر تشغيل السيارة بدون ما تعرف تفاصيل المحرك.' },
  { id: 'interface', terms: ['interface', 'الواجهه interface', 'abstract class'], answer: 'الـ interface أو الكلاس المجرد يحدد دوال لازم الكلاسات اللي تنفّذه تكتبها، بدون ما يكتب تفاصيلها هو.' },

  // ---- الويب ----
  { id: 'html', terms: ['html'], answer: 'HTML لغة بناء هيكل صفحة الويب ومحتواها: عناوين، فقرات، صور، روابط، باستخدام وسوم مثل `<h1>` و`<p>`.' },
  { id: 'css', terms: ['css'], answer: 'CSS لغة تنسيق شكل الصفحة: ألوان، خطوط، مسافات، وتخطيط مثل Flexbox وGrid.' },
  { id: 'javascript', terms: ['javascript', 'js'], answer: 'JavaScript لغة تضيف التفاعل لصفحات الويب (أزرار، نماذج، تحديث المحتوى)، وتشتغل أيضاً على السيرفر عبر Node.js.' },
  { id: 'typescript', terms: ['typescript', 'ts'], answer: 'TypeScript هي JavaScript مع أنواع بيانات ثابتة، فتكتشف كثير من الأخطاء قبل التشغيل. تتحول لـ JavaScript عادية.' },
  { id: 'dom', terms: ['dom', 'شجره المستند'], answer: 'الـ DOM تمثيل الصفحة كشجرة كائنات تكدر JavaScript تقراها وتعدلها: `document.querySelector("h1").textContent = "مرحبا"`.' },
  { id: 'flexbox', terms: ['flexbox', 'flex'], answer: 'Flexbox نظام تخطيط بـ CSS لترتيب العناصر بصف أو عمود وتوزيع المسافات ومحاذاتها بسهولة: `display: flex; justify-content: center;`.' },
  { id: 'css-grid', terms: ['css grid', 'grid'], answer: 'CSS Grid نظام تخطيط بصفوف وأعمدة معاً، مثالي لتخطيط الصفحة الكامل: `display: grid; grid-template-columns: 1fr 1fr;`.' },
  { id: 'responsive', terms: ['responsive', 'التصميم المتجاوب', 'responsive design'], answer: 'التصميم المتجاوب يخلي الصفحة تتكيف مع حجم الشاشة (هاتف، تابلت، كمبيوتر) باستخدام وحدات نسبية وMedia Queries.' },
  { id: 'media-query', terms: ['media query', 'media queries'], answer: 'الـ Media Query قاعدة CSS تطبق تنسيق حسب حجم الشاشة: `@media (max-width: 600px) { ... }`.' },
  { id: 'react', terms: ['react'], answer: 'React مكتبة JavaScript لبناء واجهات من مكونات (components) قابلة لإعادة الاستخدام، وتحدّث الواجهة تلقائياً لما تتغير البيانات.' },
  { id: 'component', terms: ['component', 'components', 'المكون', 'المكونات'], answer: 'المكون (component) قطعة واجهة مستقلة بـ React، عادة دالة ترجع JSX، وتكدر تستخدمها بأماكن متعددة.' },
  { id: 'props', terms: ['props', 'البروبس'], answer: 'الـ props بيانات يرسلها المكوّن الأب للابن، وهي للقراءة فقط داخل الابن: `<Card title="درس" />`.' },
  { id: 'state', terms: ['state', 'الحاله state', 'usestate'], answer: 'الـ state بيانات داخل المكوّن تتغير مع الوقت، ولما تتغير React تعيد رسم الواجهة: `const [count, setCount] = useState(0);`.' },
  { id: 'hooks', terms: ['hooks', 'الهوكس', 'react hooks', 'useeffect'], answer: 'الـ hooks دوال تبدأ بـ `use` تضيف ميزات للمكوّنات الدالية: `useState` للحالة و`useEffect` للتأثيرات الجانبية مثل جلب البيانات.' },
  { id: 'jsx', terms: ['jsx'], answer: 'JSX صيغة تكتب بيها شكل الواجهة داخل JavaScript بشكل يشبه HTML، وتتحول لاستدعاءات React.' },
  { id: 'event', terms: ['event', 'events', 'الحدث', 'الاحداث'], answer: 'الحدث (event) شي يصير بالصفحة مثل ضغطة زر أو كتابة، وتستجيب له بدالة: `button.addEventListener("click", handler)`.' },
  { id: 'promise', terms: ['promise', 'الوعد promise', 'promises'], answer: 'الـ Promise يمثل نتيجة عملية غير متزامنة راح تخلص بالمستقبل (نجاح أو فشل)، وتتعامل وياه بـ `.then()` أو `await`.' },
  { id: 'async-await', terms: ['async await', 'async', 'await'], answer: '`async/await` طريقة مريحة لكتابة كود غير متزامن كأنه متسلسل:\n```javascript\nasync function load() {\n  const res = await fetch(url);\n  const data = await res.json();\n}\n```' },
  { id: 'callback', terms: ['callback', 'الكول باك', 'داله رد النداء'], answer: 'الـ callback دالة ترسلها لدالة ثانية حتى تستدعيها لاحقاً، مثل الدالة اللي ترسلها لـ `setTimeout` أو `addEventListener`.' },
  { id: 'closure', terms: ['closure', 'الاغلاق closure'], answer: 'الـ closure دالة تتذكر المتغيرات من النطاق اللي انخلقت بيه حتى بعد ما ينتهي، وتُستخدم لحفظ حالة خاصة.' },
  { id: 'let-const-var', terms: ['الفرق بين let و const', 'let vs const', 'var let const', 'الفرق بين var و let'], answer: '`const` لقيمة ما تنعاد تعيينها، `let` لمتغير تتغير قيمته، وكلاهما نطاقه الكتلة `{}`. `var` قديم ونطاقه الدالة، فالأفضل تتجنبه.' },
  { id: 'json', terms: ['json'], answer: 'JSON صيغة نصية لتبادل البيانات بشكل مفتاح وقيمة: `{"name": "علي", "age": 20}`، تُستخدم كثيراً بين التطبيق والسيرفر.' },
  { id: 'api', terms: ['api', 'الواجهه البرمجيه'], answer: 'الـ API طريقة متفق عليها يتواصل بيها برنامج ويه برنامج ثاني، مثل تطبيق يطلب بيانات من سيرفر ويستلم الرد بصيغة JSON.' },
  { id: 'rest', terms: ['rest', 'rest api', 'restful'], answer: 'REST أسلوب لتصميم الـ APIs على HTTP: كل مورد إله رابط، والعمليات بـ GET (قراءة) وPOST (إنشاء) وPUT/PATCH (تعديل) وDELETE (حذف).' },
  { id: 'http', terms: ['http', 'https', 'بروتوكول http'], answer: 'HTTP بروتوكول تواصل المتصفح ويه السيرفر (طلب ورد). HTTPS نفسه بس مشفّر، فالبيانات ما تنقري بالطريق.' },
  { id: 'status-codes', terms: ['status code', 'status codes', 'اكواد الحاله', '404', '500'], answer: 'أكواد حالة HTTP: 200 نجاح، 201 أُنشئ، 400 طلب غلط، 401 غير مسجل، 403 ممنوع، 404 غير موجود، 500 خطأ بالسيرفر.' },
  { id: 'frontend', terms: ['frontend', 'front end', 'الواجهه الاماميه', 'فرونت اند'], answer: 'الـ Frontend هو الجزء اللي يشوفه المستخدم ويتفاعل وياه (HTML وCSS وJavaScript وReact).' },
  { id: 'backend', terms: ['backend', 'back end', 'الواجهه الخلفيه', 'باك اند'], answer: 'الـ Backend هو السيرفر وقاعدة البيانات والمنطق اللي ما ينشاف: يستقبل الطلبات ويخزن البيانات ويرجع النتائج (مثل Node.js).' },
  { id: 'fullstack', terms: ['full stack', 'fullstack', 'فول ستاك'], answer: 'مطوّر Full Stack يشتغل على الواجهة الأمامية والخلفية معاً.' },
  { id: 'framework', terms: ['framework', 'الاطار البرمجي', 'فريم ورك'], answer: 'الـ framework هيكل جاهز يفرض طريقة تنظيم الكود ويوفر أدوات كثيرة (مثل Express أو Flutter)، بينما الـ library أدوات تستدعيها أنت حسب حاجتك.' },
  { id: 'library', terms: ['library', 'المكتبه البرمجيه', 'مكتبه'], answer: 'المكتبة كود جاهز كتبه غيرك تستدعيه حتى توفر وقت، مثل `requests` بـ Python أو `lodash` بـ JavaScript.' },
  { id: 'package-manager', terms: ['npm', 'pip', 'package manager', 'مدير الحزم'], answer: 'مدير الحزم ينزل المكتبات ويديرها: `npm install` لـ JavaScript و`pip install` لـ Python.' },
  { id: 'git', terms: ['git'], answer: 'Git نظام لحفظ نسخ الكود وتتبع تغييراته والرجوع لأي نسخة، والعمل كفريق بالفروع (branches).' },
  { id: 'github', terms: ['github', 'جيت هب'], answer: 'GitHub موقع يستضيف مستودعات Git أونلاين، للنسخ الاحتياطي والتعاون ونشر المشاريع.' },
  { id: 'deployment', terms: ['deployment', 'النشر', 'نشر الموقع', 'deploy'], answer: 'النشر يعني رفع موقعك أو تطبيقك على سيرفر حتى يكون متاح للناس على الإنترنت، مثل Vercel أو Netlify للمواقع.' },
  { id: 'hosting', terms: ['hosting', 'الاستضافه'], answer: 'الاستضافة خدمة تشغّل موقعك على سيرفر متصل بالإنترنت دائماً.' },
  { id: 'domain', terms: ['domain', 'الدومين', 'اسم النطاق'], answer: 'الدومين اسم موقعك مثل `kodax.app`، وتشتريه من مسجّل نطاقات وتربطه بالاستضافة عبر DNS.' },
  { id: 'dns', terms: ['dns'], answer: 'الـ DNS مثل دليل هاتف للإنترنت: يحوّل اسم الموقع لعنوان IP حتى يوصل المتصفح للسيرفر.' },

  // ---- قواعد البيانات ----
  { id: 'database', terms: ['database'], answer: 'قاعدة البيانات مكان منظم لتخزين البيانات واسترجاعها بسرعة، مثل حسابات المستخدمين وتقدمهم.' },
  { id: 'sql', terms: ['sql'], answer: 'SQL لغة التعامل مع قواعد البيانات العلائقية: `SELECT name FROM users WHERE age > 18;`.' },
  { id: 'primary-key', terms: ['primary key', 'المفتاح الاساسي', 'المفتاح الرئيسي'], answer: 'المفتاح الأساسي عمود قيمته فريدة لكل صف (مثل `id`) ويحدد الصف بدون تكرار.' },
  { id: 'foreign-key', terms: ['foreign key', 'المفتاح الاجنبي'], answer: 'المفتاح الأجنبي عمود يشير للمفتاح الأساسي بجدول ثاني، حتى يربط الجداول (مثل `orders.user_id` يشير لـ `users.id`).' },
  { id: 'index-db', terms: ['index بقاعده البيانات', 'database index', 'الفهرس بقاعده البيانات'], answer: 'الفهرس (index) بقاعدة البيانات يسرّع البحث بعمود معيّن مثل فهرس الكتاب، مقابل مساحة إضافية وبطء بسيط بالإضافة.' },
  { id: 'nosql', terms: ['nosql', 'mongodb'], answer: 'قواعد NoSQL مثل MongoDB تخزن البيانات كمستندات JSON مرنة بدل جداول ثابتة، ومناسبة للبيانات المتغيرة الشكل.' },
  { id: 'join', terms: ['join', 'الربط join'], answer: '`JOIN` بـ SQL يدمج صفوف من جدولين حسب عمود مشترك، مثل جلب الطلبات مع أسماء أصحابها.' },

  // ---- السيرفر والأمان ----
  { id: 'node', terms: ['node'], answer: 'Node.js بيئة تشغّل JavaScript على السيرفر، فتكدر تبني APIs وخوادم بنفس اللغة اللي تستخدمها بالمتصفح.' },
  { id: 'express', terms: ['express', 'express js'], answer: 'Express إطار بسيط لـ Node.js لبناء الخوادم والـ APIs بتعريف المسارات: `app.get("/users", handler)`.' },
  { id: 'auth', terms: ['authentication', 'المصادقه', 'authorization', 'التفويض'], answer: 'المصادقة (authentication) تتحقق منو أنت (تسجيل الدخول)، والتفويض (authorization) يحدد شنو مسموح لك تسوي بعد الدخول.' },
  { id: 'jwt', terms: ['jwt', 'json web token'], answer: 'الـ JWT رمز موقّع يحمل معلومات المستخدم، يرسله التطبيق مع كل طلب حتى يثبت إنه مسجل دخول بدون إرسال كلمة السر كل مرة.' },
  { id: 'hashing', terms: ['hashing', 'hash', 'التجزئه', 'تشفير كلمات السر'], answer: 'الـ hashing يحوّل النص لبصمة ثابتة باتجاه واحد ما ترجع. كلمات السر تنخزن كـ hash (مع salt وبخوارزمية مثل bcrypt) مو كنص عادي.' },
  { id: 'encryption', terms: ['encryption', 'التشفير'], answer: 'التشفير يحوّل البيانات لشكل غير مقروء ويرجعها بالمفتاح الصحيح، على عكس الـ hashing اللي ما يرجع.' },
  { id: 'xss', terms: ['xss', 'cross site scripting'], answer: 'XSS ثغرة يحقن بيها المهاجم كود JavaScript بصفحة ينفّذ عند مستخدمين آخرين. الحماية: تهريب (escape) أي مدخل قبل عرضه.' },
  { id: 'sql-injection', terms: ['sql injection', 'حقن sql'], answer: 'حقن SQL ثغرة لما مدخل المستخدم يدخل مباشرة بجملة SQL فيغير معناها. الحماية: الاستعلامات المهيأة (parameterized queries) وعدم دمج النص مباشرة.' },

  // ---- C++ ----
  { id: 'cpp', terms: ['cpp'], answer: 'C++ لغة قوية وسريعة تُستخدم بالألعاب والأنظمة والبرامج اللي تحتاج أداء عالي، وتعطيك تحكم مباشر بالذاكرة.' },
  { id: 'pointer', terms: ['pointer'], answer: 'المؤشر بـ C++ متغير يخزن عنوان متغير ثاني بالذاكرة.\n```cpp\nint x = 5;\nint* p = &x;   // عنوان x\ncout << *p;    // 5\n```' },
  { id: 'reference', terms: ['reference', 'المرجع', 'المراجع بـ c++'], answer: 'المرجع (reference) بـ C++ اسم بديل لمتغير موجود: `int& r = x;` أي تعديل على `r` يعدل `x`.' },
  { id: 'stack-heap', terms: ['stack و heap', 'heap', 'الفرق بين stack و heap', 'الذاكره الديناميكيه'], answer: 'الـ stack للمتغيرات المحلية وتنمسح تلقائياً، والـ heap للذاكرة اللي تحجزها بنفسك (`new`) ولازم تحررها (`delete`) أو تستخدم smart pointers.' },

  // ---- Python ----
  { id: 'python', terms: ['python'], answer: 'Python لغة سهلة القراءة ومتعددة الاستخدام: تطوير ويب، تحليل بيانات، ذكاء اصطناعي، وأتمتة. بداية ممتازة للمبتدئين.' },
  { id: 'list-comprehension', terms: ['list comprehension', 'comprehension'], answer: 'الـ list comprehension طريقة مختصرة لبناء قائمة:\n```python\nsquares = [x * x for x in range(5)]  # [0, 1, 4, 9, 16]\n```' },
  { id: 'lambda', terms: ['lambda', 'الداله المجهوله', 'arrow function'], answer: 'الـ lambda دالة صغيرة بدون اسم: `lambda x: x * 2` بـ Python، وبـ JavaScript الـ arrow function: `x => x * 2`.' },
  { id: 'module', terms: ['module', 'import', 'الوحده module', 'modules'], answer: 'الـ module ملف كود تكدر تستورده وتستخدم دواله: `import math` ثم `math.sqrt(16)`.' },

  // ---- الموبايل ----
  { id: 'flutter', terms: ['flutter'], answer: 'Flutter إطار من Google لبناء تطبيقات Android وiOS والويب من كود واحد بلغة Dart.' },
  { id: 'dart', terms: ['dart'], answer: 'Dart لغة Google اللي يُكتب بيها Flutter، شبيهة بـ JavaScript وJava وبيها أنواع ثابتة.' },
  { id: 'widget', terms: ['widget', 'widgets', 'الويدجت'], answer: 'بـ Flutter كل شي widget: النص والزر والتخطيط. الـ StatelessWidget ثابت، والـ StatefulWidget يتغير مع الحالة.' },
  { id: 'react-native', terms: ['reactnative'], answer: 'React Native يخليك تبني تطبيقات موبايل حقيقية لـ Android وiOS باستخدام React وJavaScript.' },

  // ---- الذكاء الاصطناعي ----
  { id: 'ai', terms: ['ai'], answer: 'الذكاء الاصطناعي مجال يخلي الحاسوب يسوي مهام تحتاج "ذكاء" مثل فهم اللغة والتعرف على الصور واتخاذ القرارات.' },
  { id: 'ml', terms: ['ml'], answer: 'تعلّم الآلة فرع من الذكاء الاصطناعي: بدل ما تكتب القواعد بنفسك، النموذج يتعلم الأنماط من البيانات.' },
  { id: 'neural-network', terms: ['neural network', 'الشبكه العصبيه', 'الشبكات العصبيه'], answer: 'الشبكة العصبية نموذج من طبقات عُقد مترابطة، كل اتصال إله وزن يتعدل أثناء التدريب حتى تقل الأخطاء.' },
  { id: 'deep-learning', terms: ['deep learning', 'التعلم العميق'], answer: 'التعلّم العميق تعلّم آلة بشبكات عصبية بيها طبقات كثيرة، ويُستخدم بالصور والصوت واللغة.' },
  { id: 'overfitting', terms: ['overfitting', 'الافراط بالتعلم', 'فرط التعلم'], answer: 'الـ overfitting لما النموذج يحفظ بيانات التدريب بدل ما يتعلم النمط العام، فيكون ممتاز عليها وضعيف ببيانات جديدة.' },
  { id: 'dataset', terms: ['dataset', 'مجموعه البيانات'], answer: 'الـ dataset مجموعة البيانات اللي يتدرب ويُختبر عليها النموذج، وعادة تنقسم تدريب واختبار.' },

  // ---- أدوات ----
  { id: 'regex', terms: ['regex', 'regular expression', 'التعابير النمطيه'], answer: 'الـ regex نمط للبحث بالنصوص والتحقق منها، مثل `^\\d{4}$` يطابق نص من 4 أرقام بالضبط.' },
  { id: 'terminal', terms: ['terminal', 'cmd', 'سطر الاوامر', 'الطرفيه'], answer: 'سطر الأوامر (terminal) واجهة نصية تكتب بيها أوامر للنظام مثل تشغيل البرامج وتنزيل الحزم.' },
];

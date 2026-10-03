/**
 * تصحيحات التحديات — نتائج التدقيق الشامل (scripts/challenge-audit)
 *
 * كل تحدٍ يُعرَّف في ملف محتواه الأصلي، وهذا الملف يطبّق عليه التصحيحات
 * التي أثبتها التدقيق الآلي واليدوي: أوصاف غامضة أو مخالفة للحل، اختبارات
 * ضعيفة (تقبل حلاً ثابتاً)، اختبارات لا تستدعي كود المستخدم، حلول نموذجية
 * خاطئة، ومتطلبات بنيوية للغات التي لا تُشغَّل داخل التطبيق.
 *
 * التحقق: npx tsx scripts/challenge-audit/audit.ts
 * (يجب أن يجتاز كل حل نموذجي كل الاختبارات، وأن يُرفض الكود الابتدائي)
 */

import type { Challenge } from './courseData';
import { t, h, type ChallengeFix } from './challengeFixHelpers';
import { AI_CHALLENGE_FIXES } from './challengeFixesAI';
import { STRUCTURAL_CHALLENGE_FIXES } from './challengeFixesStructural';
import { NODE_CHALLENGE_FIXES } from './challengeFixesNode';

export type { ChallengeFix } from './challengeFixHelpers';

const table = (n: number) =>
  Array.from({ length: 10 }, (_, i) => `${n} x ${i + 1} = ${n * (i + 1)}`).join('\n');

const SLEEP = (ms: number) => `await new Promise((r) => setTimeout(r, ${ms}))`;

const EXECUTABLE_FIXES: Record<string, ChallengeFix> = {
  // ================= Python: الأساسيات =================
  'ch-1': {
    description: 'اكتب برنامجاً يطبع العبارة Hello, World! بالضبط (مع الفاصلة وعلامة التعجب).',
  },
  'ch-2': {
    description: 'اكتب الدالة add(a, b) التي ترجع مجموع الرقمين a و b.',
    addTests: [h('100, 250', '350', 'أعداد كبيرة'), h('-7, -3', '-10', 'عددان سالبان'), h('2.5, 0.5', '3', 'أعداد عشرية')],
  },
  'ch-3': {
    description: 'اكتب الدالة reverse_string(text) التي ترجع النص معكوساً.',
    addTests: [h('"a"', 'a', 'حرف واحد'), h('""', '', 'نص فارغ'), h('"abc def"', 'fed cba', 'نص فيه مسافة')],
  },
  'ch-4': {
    description:
      'اكتب الدالة is_prime(n) التي ترجع True إذا كان n عدداً أولياً و False خلاف ذلك. الأعداد الأقل من 2 (مثل 0 و 1 والسالبة) ليست أولية.',
    addTests: [h('2', 'True', 'أصغر عدد أولي'), h('0', 'False', 'صفر'), h('25', 'False', 'مربع عدد أولي'), h('97', 'True', 'عدد أولي كبير'), h('-5', 'False', 'عدد سالب')],
  },
  'ch-5': {
    description: 'اكتب الدالة fibonacci(n) التي ترجع العدد رقم n في متتالية فيبوناتشي، حيث F(0)=0 و F(1)=1 و F(n)=F(n-1)+F(n-2).',
    addTests: [h('2', '1', 'F(2)'), h('20', '6765', 'F(20)'), h('30', '832040', 'F(30) — يحتاج حلاً غير بطيء')],
  },
  'ch-6': {
    description: 'نفّذ خوارزمية Bubble Sort: اكتب الدالة bubble_sort(arr) التي ترجع القائمة مرتبة تصاعدياً.',
    addTests: [h('[]', '[]', 'قائمة فارغة'), h('[5, 5, 1]', '[1, 5, 5]', 'قيم مكررة'), h('[2, 1]', '[1, 2]', 'عنصران')],
  },
  'ch-7': {
    difficulty: 'medium',
    description:
      'نفّذ البحث الثنائي: اكتب الدالة binary_search(arr, target) التي تبحث في قائمة مرتبة تصاعدياً وترجع موقع target، أو -1 إذا لم يوجد.',
    addTests: [h('[], 3', '-1', 'قائمة فارغة'), h('[7], 7', '0', 'عنصر واحد'), h('[1, 3, 5, 7, 9, 11, 13], 13', '6', 'آخر عنصر')],
  },
  'ch-8': {
    difficulty: 'medium',
    description:
      'اكتب الدالة is_balanced(s) التي ترجع True إذا كانت الأقواس () و [] و {} في النص متوازنة ومغلقة بالترتيب الصحيح. تجاهل أي أحرف أخرى.',
    addTests: [h('"("', 'False', 'قوس غير مغلق'), h('")("', 'False', 'إغلاق قبل الفتح'), h('"a(b[c]{d}e)f"', 'True', 'أقواس بين أحرف'), h('"{[}]"', 'False', 'ترتيب خاطئ')],
  },
  'ch-9': {
    description:
      'اكتب الدالة spiral_order(matrix) التي ترجع عناصر المصفوفة بترتيب حلزوني باتجاه عقارب الساعة بدءاً من الزاوية العلوية اليسرى.',
    addTests: [
      h('[]', '[]', 'مصفوفة فارغة'),
      h('[[1, 2, 3]]', '[1, 2, 3]', 'صف واحد'),
      h('[[1], [2], [3]]', '[1, 2, 3]', 'عمود واحد'),
      h('[[1,2,3,4],[5,6,7,8],[9,10,11,12]]', '[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]', 'مصفوفة غير مربعة'),
    ],
  },
  'py-ch-beg-1': {
    description:
      'اكتب الدالة calculator(a, b, operation) حيث operation إحدى "+" أو "-" أو "*" أو "/". عند القسمة على صفر أرجع "لا يمكن القسمة على صفر"، ولأي عملية أخرى أرجع "عملية غير صالحة".',
    addTests: [h('7, 2, "-"', '5', 'طرح'), h('3, 4, "%"', 'عملية غير صالحة', 'عملية غير مدعومة'), h('9, 3, "/"', '3', 'قسمة')],
  },
  'py-ch-beg-2': {
    description: 'اكتب الدالة reverse_string(text) التي ترجع النص معكوساً.',
    addTests: [h('"a b"', 'b a', 'نص فيه مسافة'), h('"x"', 'x', 'حرف واحد')],
  },
  'py-ch-beg-3': {
    description: 'اكتب الدالة even_or_odd(number) التي ترجع "زوجي" إذا كان العدد زوجياً و "فردي" إذا كان فردياً.',
    addTests: [h('-3', 'فردي', 'عدد سالب فردي'), h('-4', 'زوجي', 'عدد سالب زوجي'), h('101', 'فردي', 'عدد كبير')],
  },
  'py-ch-beg-4': {
    description: 'اكتب الدالة calculate_average(numbers) التي ترجع متوسط الأرقام في القائمة، و 0 إذا كانت القائمة فارغة.',
    addTests: [h('[1, 2]', '1.5', 'متوسط عشري'), h('[-5, 5]', '0', 'أعداد سالبة وموجبة')],
  },
  'py-ch-beg-5': {
    description: 'اكتب الدالة count_words(text) التي ترجع عدد الكلمات في النص (الكلمات مفصولة بمسافة أو أكثر). النص الفارغ يعطي 0.',
    addTests: [h('"  many   spaces here "', '3', 'مسافات متعددة'), h('"one"', '1', 'كلمة واحدة')],
  },
  'py-ch-int-1': {
    description:
      'اكتب الدالة fizzbuzz(n) التي ترجع قائمة نصوص للأرقام من 1 إلى n: "Fizz" لمضاعفات 3، و"Buzz" لمضاعفات 5، و"FizzBuzz" لمضاعفات الاثنين، والرقم نفسه كنص في غير ذلك.',
    addTests: [h('1', "['1']", 'n = 1'), h('0', '[]', 'n = 0')],
  },
  'py-ch-int-2': {
    description:
      'اكتب الدالتين: is_prime(n) ترجع True إذا كان n أولياً، و primes_up_to(limit) ترجع قائمة كل الأعداد الأولية من 2 حتى limit (ضمناً).',
    addTests: [h('is_prime(2)', 'True', 'العدد 2'), h('primes_up_to(1)', '[]', 'لا توجد أعداد أولية'), h('primes_up_to(20)', '[2, 3, 5, 7, 11, 13, 17, 19]', 'حتى 20')],
  },
  'py-ch-int-3': {
    description: 'نفّذ Bubble Sort: اكتب الدالة bubble_sort(arr) التي ترجع نسخة مرتبة تصاعدياً دون تعديل القائمة الأصلية.',
    addTests: [h('[5, 1, 5, 1]', '[1, 1, 5, 5]', 'قيم مكررة')],
  },
  'py-ch-int-4': {
    description: 'اكتب الدالة count_frequency(items) التي ترجع قاموساً بعدد تكرار كل عنصر، بترتيب أول ظهور.',
    addTests: [h('[]', '{}', 'قائمة فارغة'), h('["x"]', "{'x': 1}", 'عنصر واحد')],
  },
  'py-ch-int-5': {
    description:
      'اكتب الدالتين: fibonacci(n) ترجع قائمة أول n أعداد من متتالية فيبوناتشي (تبدأ بـ 0، 1)، و fibonacci_recursive(n) ترجع العدد رقم n باستخدام الاستدعاء الذاتي.',
    addTests: [h('fibonacci(0)', '[]', 'n = 0'), h('fibonacci(1)', '[0]', 'n = 1'), h('fibonacci_recursive(0)', '0', 'F(0)'), h('fibonacci_recursive(15)', '610', 'F(15)')],
  },
  'py-ch-adv-1': {
    description:
      'اكتب الدالة is_balanced(expression) التي تتحقق من توازن أربعة أنواع من الأقواس: () و [] و {} و <>. تجاهل الأحرف الأخرى.',
    addTests: [t('"<[()]>"', 'True', 'أقواس زاوية متوازنة'), h('"<(>)"', 'False', 'تداخل خاطئ'), h('"(("', 'False', 'أقواس غير مغلقة')],
  },
  'py-ch-adv-2': {
    description:
      'نفّذ ضغط RLE: الدالة compress(text) تستبدل كل تتابع لحرف بالحرف متبوعاً بعدد تكراره ("AAAB" ← "A3B1")، والدالة decompress(compressed) تعكس العملية.',
    addTests: [h('"A"', 'A1', 'حرف واحد'), h('"ABAB"', 'A1B1A1B1', 'أحرف متناوبة'), h('decompress("X1Y3")', 'XYYY', 'فك الضغط'), h('decompress("")', '', 'فك نص فارغ')],
  },
  'py-ch-adv-3': {
    description:
      'أكمل الصنف BST: insert(value) يضيف قيمة (الأصغر يساراً والأكبر يميناً)، search(value) يرجع True/False، و inorder() يرجع قائمة القيم مرتبة.',
    testCases: [
      t('tree = BST()\nfor v in [5, 3, 7]:\n    tree.insert(v)\ntree.inorder()', '[3, 5, 7]', 'إضافة 5، 3، 7 ثم inorder'),
      t('tree = BST()\nfor v in [5, 3, 7, 1, 4]:\n    tree.insert(v)\ntree.inorder()', '[1, 3, 4, 5, 7]', 'إضافة 5 عناصر'),
      t('tree = BST()\nfor v in [10, 5, 15]:\n    tree.insert(v)\ntree.search(15)', 'True', 'البحث عن قيمة موجودة'),
      h('tree = BST()\nfor v in [10, 5, 15]:\n    tree.insert(v)\ntree.search(7)', 'False', 'البحث عن قيمة غير موجودة'),
      h('tree = BST()\ntree.inorder()', '[]', 'شجرة فارغة'),
      h('tree = BST()\nfor v in [3, 2, 1]:\n    tree.insert(v)\ntree.inorder()', '[1, 2, 3]', 'إدخال بترتيب تنازلي'),
    ],
  },

  // ================= Python: الأمن السيبراني =================
  'cyber-ch-1': {
    description:
      'اكتب الدالة caesar_decrypt(ciphertext, shift) التي تفك تشفير قيصر بإزاحة الأحرف shift خطوة للخلف، مع الحفاظ على حالة الحرف وترك غير الأحرف كما هي.',
    addTests: [h('"Wklv lv d whvw!", 3', 'This is a test!', 'جملة مع علامات ترقيم'), h('"abc", 0', 'abc', 'إزاحة صفر'), h('"bcd", 27', 'abc', 'إزاحة أكبر من 26')],
  },
  'cyber-ch-2': {
    description:
      'اكتب الدالة detect_sqli(input_string) التي ترجع True إذا احتوى النص على نمط SQL Injection شائع (مثل \' OR \'1\'=\'1، أو -- ، أو ; DROP/SELECT...، أو UNION SELECT) و False للنص العادي.',
    addTests: [h('"admin\'--"', 'True', 'تعليق SQL بعد اسم المستخدم'), h('"john.doe@mail.com"', 'False', 'بريد إلكتروني عادي'), h('"UNION SELECT password FROM users"', 'True', 'UNION SELECT')],
  },
  'cyber-ch-3': {
    description:
      'اكتب الدالة analyze_password(password) التي ترجع قاموساً فيه: score (0-100)، و strength ("weak" أو "medium" أو "strong")، و tips (قائمة نصائح للتحسين).',
    addTests: [h('analyze_password("")["strength"]', 'weak', 'كلمة فارغة'), h('len(analyze_password("abc")["tips"]) > 0', 'True', 'نصائح لكلمة ضعيفة')],
  },
  'cyber-ch-http-001': {
    description:
      'اكتب الدالة parse_http_request(request_text) التي تحلل نص طلب HTTP وترجع قاموساً فيه method و path و version و headers (قاموس رؤوس الطلب).',
    // الحل الأصلي كان يرجع host و user_agent فقط، ولا يطابق الوصف
    starterCode: `def parse_http_request(request_text):
    """
    حلل HTTP request وأرجع قاموساً فيه:
    - method  (GET, POST, ...)
    - path    (/index.html)
    - version (HTTP/1.1)
    - headers (قاموس: اسم الرأس ← قيمته)
    """
    # اكتب كودك هنا
    pass

# تجربة
request = """GET /index.html HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
"""

info = parse_http_request(request)
print(info)`,
    solution: `def parse_http_request(request_text):
    lines = request_text.strip().split('\\n')

    # السطر الأول: Method Path Version
    method, path, version = lines[0].split()

    # باقي الأسطر: Header: Value
    headers = {}
    for line in lines[1:]:
        if ':' in line:
            key, value = line.split(':', 1)
            headers[key.strip()] = value.strip()

    return {
        'method': method,
        'path': path,
        'version': version,
        'headers': headers,
    }`,
    addTests: [
      h('parse_http_request("GET / HTTP/2")["version"]', 'HTTP/2', 'استخراج الإصدار'),
      t('parse_http_request("GET /index.html HTTP/1.1")["path"]', '/index.html', 'استخراج المسار'),
      h('parse_http_request("GET /a HTTP/1.1\\nHost: kodax.app")["headers"]["Host"]', 'kodax.app', 'قراءة Header'),
      h('parse_http_request("DELETE /api/1 HTTP/2")["method"]', 'DELETE', 'طريقة أخرى'),
    ],
  },
  'cyber-ch-hash-001': {
    description:
      'اكتب الدالة crack_md5(target_hash, wordlist) التي تجرّب كل كلمة في القائمة (هجوم القاموس) وترجع الكلمة التي يطابق هاش MD5 الخاص بها target_hash، أو None إذا لم توجد.',
    addTests: [h('"21232f297a57a5a743894a0e4a801fc3", ["root", "admin"]', 'admin', 'كلمة في آخر القائمة'), h('"21232f297a57a5a743894a0e4a801fc3", []', 'None', 'قائمة فارغة')],
  },
  'cyber-ch-xss-001': {
    description:
      'اكتب الدالة sanitize_input(user_input) التي تحوّل الأحرف الخاصة إلى HTML entities: & ← &amp; و < ← &lt; و > ← &gt; و " ← &quot; و \' ← &#x27; و / ← &#x2F;.',
    addTests: [h('""', '', 'نص فارغ'), h('"a/b"', 'a&#x2F;b', 'شرطة مائلة'), h('"Tom & Jerry"', 'Tom &amp; Jerry', 'علامة &')],
  },
  'cyber-ch-base64-001': {
    difficulty: 'medium',
    description:
      'اكتب الدالة base64_encode(text) التي تشفّر النص إلى Base64 يدوياً دون استخدام مكتبة base64: حوّل النص إلى bytes، وقسّم البتات إلى مجموعات من 6، واستخدم أبجدية Base64، وأضف = للحشو.',
    hints: [
      'حوّل النص إلى bytes باستخدام text.encode()',
      'كل 3 bytes (24 بت) تتحول إلى 4 أحرف (كل حرف 6 بتات)',
      'الأبجدية: A-Z ثم a-z ثم 0-9 ثم + و /',
      'إذا بقي byte أو اثنان في النهاية، أكمل بـ = حتى يصبح الطول مضاعفاً لـ 4',
    ],
    solution: `def base64_encode(text):
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    data = text.encode()
    result = ""
    for i in range(0, len(data), 3):
        chunk = data[i:i + 3]
        n = int.from_bytes(chunk + b"\\x00" * (3 - len(chunk)), "big")
        chars = [alphabet[(n >> shift) & 63] for shift in (18, 12, 6, 0)]
        result += "".join(chars[:len(chunk) + 1]) + "=" * (3 - len(chunk))
    return result`,
    addTests: [h('""', '', 'نص فارغ'), h('"a"', 'YQ==', 'حرف واحد (حشو ==)'), h('"Man"', 'TWFu', 'ثلاثة أحرف بدون حشو'), h('"مرحبا"', '2YXYsdit2KjYpw==', 'نص عربي (UTF-8)')],
    checks: [{ pattern: String.raw`\bimport\s+base64|\bfrom\s+base64\b|b64encode`, message: 'نفّذ الترميز يدوياً دون استخدام مكتبة base64', forbid: true }],
  },
  'cyber-ch-vigenere-001': {
    description:
      'اكتب الدالة vigenere_encrypt(plaintext, key) التي تشفّر النص بشفرة فيجنير: حوّل الأحرف إلى كبيرة، وأزح كل حرف بمقدار حرف المفتاح المقابل (A=0)، واترك غير الأحرف كما هي دون أن تستهلك حرفاً من المفتاح.',
    addTests: [h('"ATTACK AT DAWN", "LEMON"', 'LXFOPV EF RNHR', 'المثال الكلاسيكي مع مسافات'), h('"hello", "key"', 'RIJVS', 'أحرف صغيرة')],
  },
  'cyber-ch-ipvalidator-001': {
    description:
      'اكتب الدالة is_valid_ipv4(ip) التي ترجع True إذا كان النص عنوان IPv4 صالحاً: أربعة أجزاء مفصولة بنقاط، كل جزء رقم من 0 إلى 255 وبدون أصفار في البداية.',
    addTests: [h('"0.0.0.0"', 'True', 'كل الأجزاء صفر'), h('"255.255.255.255"', 'True', 'القيمة القصوى'), h('"1.2.3.4.5"', 'False', 'خمسة أجزاء'), h('"a.b.c.d"', 'False', 'أحرف'), h('""', 'False', 'نص فارغ')],
  },
  'cyber-ch-urlparse-001': {
    description: 'اكتب الدالة parse_url(url) التي ترجع قاموساً فيه protocol و domain و path (المسار "/" إذا لم يوجد مسار).',
    addTests: [t('parse_url("https://example.com/page")["domain"]', 'example.com', 'استخراج النطاق'), h('parse_url("http://test.org")["path"]', '/', 'مسار افتراضي'), h('parse_url("https://kodax.app/a/b")["path"]', '/a/b', 'مسار متعدد')],
  },
  'cyber-ch-emailval-001': {
    description: 'اكتب الدالة is_valid_email(email) التي ترجع True إذا كان البريد بصيغة صحيحة: اسم@نطاق.امتداد (امتداد من حرفين على الأقل وبدون مسافات).',
    addTests: [h('"a@b.co"', 'True', 'أقصر بريد صالح'), h('"a@b"', 'False', 'بدون امتداد'), h('"a b@c.com"', 'False', 'مسافة')],
  },
  'cyber-ch-hash-compare-001': {
    description:
      'اكتب الدالتين: hash_password(password) ترجع هاش SHA-256 بصيغة hex، و verify_password(password, hash_value) ترجع True إذا طابقت كلمة المرور الهاش — باستخدام hmac.compare_digest للمقارنة الآمنة ضد هجمات التوقيت.',
    solution: `import hashlib
import hmac

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hash_value):
    return hmac.compare_digest(hash_password(password), hash_value)`,
    addTests: [
      t('verify_password("hello", hash_password("hello"))', 'True', 'كلمة صحيحة'),
      h('verify_password("hello", hash_password("Hello"))', 'False', 'حالة الأحرف مختلفة'),
      h('verify_password("", hash_password(""))', 'True', 'كلمة فارغة'),
    ],
  },
  'cyber-ch-jwt-decode-001': {
    description:
      'اكتب الدالة decode_jwt(token) التي تفك الجزء الأوسط (payload) من JWT بترميز Base64URL وترجعه كقاموس، أو None إذا لم يكن التوكن مكوناً من 3 أجزاء. (لا نتحقق من التوقيع هنا.)',
  },
  'cyber-ch-bruteforce-001': {
    difficulty: 'easy',
    description:
      'اكتب الدالة brute_force_count(charset, length) التي ترجع عدد كل كلمات المرور الممكنة بطول length من الحروف المتاحة في charset — لتفهم لماذا يزيد الطول صعوبة هجوم القوة الغاشمة.',
    addTests: [h('"0123456789", 6', '1000000', 'رمز PIN من 6 أرقام'), h('"abc", 0', '1', 'طول صفر'), h('"ab", 10', '1024', 'نمو أسي')],
  },
  'cyber-ch-port-001': {
    description:
      'اكتب الدالة identify_port(port) التي ترجع اسم الخدمة الشائعة للمنفذ (مثل 80 ← "HTTP" و 22 ← "SSH")، و "Unknown" للمنافذ غير المعروفة.',
    addTests: [h('3306', 'MySQL', 'قاعدة بيانات'), h('0', 'Unknown', 'منفذ غير معروف')],
  },
  'cyber-ch-xor-001': {
    description:
      'اكتب الدالة xor_encrypt(text, key) التي تطبّق XOR بين كل حرف والحرف المقابل من المفتاح (مع تكرار المفتاح). تطبيقها مرتين بنفس المفتاح يعيد النص الأصلي.',
    addTests: [h('xor_encrypt(xor_encrypt("Secret", "k"), "k")', 'Secret', 'التشفير ثم فك التشفير')],
  },

  // ================= Python: الخوارزميات وهياكل البيانات =================
  'algo-ch-linear-001': { addTests: [h('[], 1', '-1', 'قائمة فارغة'), h('[5, 5, 5], 5', '0', 'أول ظهور')] },
  'algo-ch-binary-001': {
    description: 'اكتب الدالة binary_search(arr, target) التي تبحث في قائمة مرتبة تصاعدياً بتقسيمها للنصف في كل خطوة، وترجع الموقع أو -1.',
    addTests: [h('[], 1', '-1', 'قائمة فارغة'), h('[1, 2, 3, 4, 5, 6, 7, 8], 1', '0', 'أول عنصر'), h('[1, 2, 3, 4, 5, 6, 7, 8], 8', '7', 'آخر عنصر')],
  },
  'algo-ch-selection-001': { addTests: [h('[]', '[]', 'قائمة فارغة'), h('[2, 2, 1]', '[1, 2, 2]', 'قيم مكررة'), h('[-1, -5, 0]', '[-5, -1, 0]', 'أعداد سالبة')] },
  'algo-ch-insertion-001': { addTests: [h('[]', '[]', 'قائمة فارغة'), h('[3, 3, -1]', '[-1, 3, 3]', 'قيم مكررة وسالبة'), h('[9, 8, 7, 6]', '[6, 7, 8, 9]', 'ترتيب عكسي')] },
  'algo-ch-max-001': {
    description: 'اكتب الدالة find_min_max(arr) التي ترجع (أصغر قيمة، أكبر قيمة) كـ tuple، و None إذا كانت القائمة فارغة.',
    addTests: [h('[]', 'None', 'قائمة فارغة'), h('[2, 2]', '(2, 2)', 'قيم متساوية')],
  },
  'algo-ch-merge-001': { addTests: [h('[]', '[]', 'قائمة فارغة'), h('[1]', '[1]', 'عنصر واحد'), h('[3, 1, 2, 3]', '[1, 2, 3, 3]', 'قيم مكررة')] },
  'algo-ch-quick-001': { addTests: [h('[]', '[]', 'قائمة فارغة'), h('[9, -2, 5, -2]', '[-2, -2, 5, 9]', 'قيم سالبة مكررة')] },
  'algo-ch-kadane-001': {
    description: 'اكتب الدالة max_subarray_sum(arr) التي ترجع أكبر مجموع لمصفوفة فرعية متصلة (غير فارغة)، و 0 للقائمة الفارغة.',
    addTests: [h('[5]', '5', 'عنصر واحد'), h('[2, -1, 2, 3, -9, 4]', '6', 'المجموع الأكبر في البداية'), h('[]', '0', 'قائمة فارغة')],
  },
  'algo-ch-anagram-001': {
    description: 'اكتب الدالة is_anagram(s1, s2) التي ترجع True إذا كانت الكلمتان تتكونان من نفس الأحرف بنفس العدد، مع تجاهل حالة الأحرف والمسافات.',
    addTests: [h('"a", "a"', 'True', 'حرف واحد'), h('"ab", "a"', 'False', 'طول مختلف'), h('"Dormitory", "Dirty room"', 'True', 'مع مسافات')],
  },
  'algo-ch-twopointer-001': {
    description:
      'اكتب الدالة two_sum_sorted(arr, target) لقائمة مرتبة تصاعدياً: استخدم مؤشرين من الطرفين وأرجع (i, j) لأول زوج تجده مجموعه target، أو (-1, -1) إذا لم يوجد.',
    addTests: [h('[1, 2, 3, 4, 5], 9', '(3, 4)', 'آخر عنصرين'), h('[], 1', '(-1, -1)', 'قائمة فارغة'), h('[1, 1], 2', '(0, 1)', 'عنصران متساويان')],
  },
  'algo-ch-lcs-001': { addTests: [h('"", "ABC"', '0', 'نص فارغ'), h('"AGGTAB", "GXTXAYB"', '4', 'مثال كلاسيكي')] },
  'algo-ch-knapsack-001': {
    description:
      'اكتب الدالة knapsack(weights, values, capacity) التي ترجع أكبر قيمة إجمالية يمكن حملها دون تجاوز السعة، بحيث يُؤخذ كل عنصر مرة واحدة على الأكثر (0/1).',
    addTests: [h('[5], [10], 4', '0', 'لا يتسع أي عنصر'), h('[], [], 10', '0', 'لا توجد عناصر'), h('[1, 3, 4, 5], [1, 4, 5, 7], 7', '9', 'اختيار أفضل تركيبة')],
  },
  'algo-ch-dijkstra-001': {
    description:
      'اكتب الدالة dijkstra(graph, start) حيث graph قاموس: كل عقدة ← قائمة (جار، وزن). أرجع قاموس أقصر مسافة من start إلى كل عقدة.',
    addTests: [h('{"A": []}, "A"', "{'A': 0}", 'عقدة واحدة')],
  },
  'algo-ch-dp-coins-001': {
    description: 'اكتب الدالة coin_change(coins, amount) التي ترجع أقل عدد من العملات لتكوين amount (كل عملة متاحة بكمية غير محدودة)، أو -1 إذا كان مستحيلاً.',
    addTests: [h('[1], 0', '0', 'مبلغ صفر'), h('[2, 5], 3', '-1', 'مستحيل'), h('[3, 7], 14', '2', 'عملتان من 7')],
  },
  'ds-ch-stack-001': {
    description:
      'اكتب الدالة stack_operations(operations) التي تنفّذ عمليات Stack على قائمة فارغة: ("push", x) و ("pop",) و ("peek",) و ("is_empty",). أرجع قائمة بنتائج pop و peek و is_empty بالترتيب، وأرجع -1 عند pop أو peek على Stack فارغ.',
    addTests: [h('[("pop",), ("peek",), ("is_empty",)]', '[-1, -1, True]', 'عمليات على Stack فارغ'), h('[("push", 1), ("is_empty",)]', '[False]', 'is_empty بعد push')],
  },
  'ds-ch-queue-001': {
    description:
      'اكتب الدالة queue_operations(operations) التي تنفّذ ("enqueue", x) و ("dequeue",) و ("peek",) على Queue فارغة (أول داخل أول خارج)، وترجع قائمة نتائج dequeue و peek، مع -1 إذا كانت فارغة.',
    addTests: [h('[("dequeue",)]', '[-1]', 'dequeue من Queue فارغة'), h('[("enqueue", 1), ("enqueue", 2), ("dequeue",), ("dequeue",), ("peek",)]', '[1, 2, -1]', 'تفريغ كامل')],
  },
  'ds-ch-hashtable-001': {
    description:
      'اكتب الدالة hashtable_operations(operations) التي تنفّذ ("set", key, value) و ("get", key) و ("delete", key). أرجع قائمة نتائج get (None إذا غير موجود) و delete (True إذا حُذف، False إذا غير موجود).',
    addTests: [h('[("get", "nope"), ("delete", "nope")]', '[None, False]', 'مفتاح غير موجود'), h('[("set", "k", 1), ("set", "k", 2), ("get", "k")]', '[2]', 'تحديث قيمة')],
  },
  'ds-ch-set-001': {
    description: 'اكتب الدوال set_union و set_intersection و set_difference التي تستقبل قائمتين وترجع النتيجة كقائمة مرتبة تصاعدياً وبدون تكرار.',
    addTests: [h('set_difference([1, 2], [1, 2])', '[]', 'فرق فارغ'), h('set_union([], [])', '[]', 'قائمتان فارغتان'), h('set_union([3, 3, 1], [1])', '[1, 3]', 'إزالة التكرار')],
  },
  'ds-ch-linkedlist-001': { difficulty: 'easy', addTests: [h('[]', '[]', 'قائمة فارغة')] },
  'ds-ch-minheap-001': {
    description: 'اكتب الدالة k_smallest(arr, k) التي ترجع أصغر k عناصر مرتبة تصاعدياً (يمكنك استخدام heapq).',
    addTests: [h('[5, 1, 4], 0', '[]', 'k = 0'), h('[3, 1, 2], 3', '[1, 2, 3]', 'k يساوي الطول'), h('[4, 4, 1], 2', '[1, 4]', 'قيم مكررة')],
  },
  'ds-ch-treetraversal-001': {
    description:
      'الشجرة ممثلة كقائمة [قيمة، شجرة_يسار، شجرة_يمين] والشجرة الفارغة []. اكتب inorder_traversal(tree) التي ترجع القيم بترتيب: يسار ثم جذر ثم يمين.',
    addTests: [h('[]', '[]', 'شجرة فارغة'), h('[1, [], [2, [], []]]', '[1, 2]', 'فرع أيمن فقط')],
  },
  'ds-ch-bfs-001': {
    description: 'اكتب الدالة bfs(graph, start) التي ترجع ترتيب زيارة العقد بالبحث بالعرض، مع زيارة الجيران بترتيب أبجدي.',
    addTests: [h('{"A": []}, "A"', "['A']", 'عقدة واحدة'), h('{"A": ["B"], "B": [], "C": []}, "A"', "['A', 'B']", 'عقدة غير متصلة لا تُزار')],
  },
  'ds-ch-dfs-001': {
    description: 'اكتب الدالة dfs(graph, start) التي ترجع ترتيب زيارة العقد بالبحث بالعمق، مع زيارة الجيران بترتيب أبجدي.',
    addTests: [h('{"A": []}, "A"', "['A']", 'عقدة واحدة'), h('{"A": ["B"], "B": ["A"]}, "A"', "['A', 'B']", 'دورة لا تسبب تكراراً')],
  },
  'ds-ch-trie-001': {
    difficulty: 'medium',
    description:
      'اكتب الدالة find_words_with_prefix(words, prefix) التي ترجع الكلمات التي تبدأ بـ prefix مرتبة أبجدياً (المقارنة حساسة لحالة الأحرف). يمكنك استخدام شجرة Trie أو أي طريقة أخرى.',
    addTests: [h('["Apple", "apple"], "a"', "['apple']", 'حساسية حالة الأحرف'), h('[], "a"', '[]', 'قائمة فارغة')],
  },
  'ds-ch-lru-001': {
    description:
      'اكتب الدالة lru_cache_operations(capacity, operations) التي تحاكي LRU Cache: ("put", key, value) و ("get", key). عند امتلاء السعة احذف الأقدم استخداماً. أرجع قائمة نتائج get (-1 إذا غير موجود).',
    addTests: [h('2, [("put", 1, 1), ("put", 1, 5), ("get", 1)]', '[5]', 'تحديث قيمة موجودة'), h('2, [("get", 1)]', '[-1]', 'Cache فارغ')],
  },
  'ds-ch-graph-cycle-001': {
    addTests: [h('{}', 'False', 'رسم فارغ'), h('{"A": ["A"]}', 'True', 'حلقة ذاتية'), h('{"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}', 'False', 'شكل معيّن بدون دورة')],
  },

  // ================= JavaScript =================
  'js-ch-beg-1': {
    description:
      'اكتب الدالة calculator(a, b, operator) التي تدعم "+" و "-" و "*" و "/". عند القسمة على صفر أرجع "Error"، ولأي عملية أخرى أرجع "Invalid operator".',
    addTests: [h('7, 2, "/"', '3.5', 'قسمة عشرية'), h('1, 0, "/"', 'Error', 'قسمة على صفر'), h('1, 1, "^"', 'Invalid operator', 'عملية غير مدعومة')],
  },
  'js-ch-beg-2': {
    description: 'اكتب الدالة findMax(arr) التي ترجع أكبر عدد في المصفوفة، و undefined إذا كانت فارغة.',
    addTests: [h('[7]', '7', 'عنصر واحد'), h('[]', 'undefined', 'مصفوفة فارغة'), h('[0, -1, 0]', '0', 'أصفار')],
  },
  'js-ch-beg-3': {
    description: 'اكتب الدالة countChar(str, char) التي ترجع عدد مرات ظهور الحرف char في النص (حساسة لحالة الأحرف).',
    addTests: [h('"banana", "a"', '3', 'تكرار متعدد'), h('"", "a"', '0', 'نص فارغ'), h('"Aa", "a"', '1', 'حساسية الحالة')],
  },
  'js-ch-beg-4': {
    description: 'اكتب الدالتين celsiusToFahrenheit(c) و fahrenheitToCelsius(f) للتحويل بين الدرجتين: F = C × 9/5 + 32.',
    addTests: [h('celsiusToFahrenheit(-40)', '-40', 'نقطة التساوي'), h('fahrenheitToCelsius(212)', '100', 'درجة الغليان'), h('celsiusToFahrenheit(37)', '98.6', 'حرارة الجسم')],
  },
  'js-ch-beg-5': {
    description:
      'اكتب isAdult(age) التي ترجع true إذا كان العمر 18 أو أكثر، و canVote(age, country) حيث سن التصويت 16 في Brazil و Austria و 18 في USA وأي دولة أخرى.',
    addTests: [h('isAdult(18)', 'true', 'بالضبط 18'), h('canVote(15, "Brazil")', 'false', 'أقل من 16 في البرازيل'), h('canVote(17, "Iraq")', 'false', 'دولة أخرى (18)')],
  },
  'js-ch-int-1': {
    description: 'اكتب الدالة removeDuplicates(arr) التي ترجع مصفوفة جديدة بدون تكرار مع الحفاظ على ترتيب أول ظهور.',
    addTests: [h('[]', '[]', 'مصفوفة فارغة'), h('[1, "1", 1]', '[1, "1"]', 'رقم ونص مختلفان')],
  },
  'js-ch-int-2': {
    description: 'اكتب الدالة flatten(arr) التي تحوّل مصفوفة متداخلة بأي عمق إلى مصفوفة بمستوى واحد.',
    addTests: [h('[]', '[]', 'مصفوفة فارغة'), h('[[[[1]]], 2]', '[1, 2]', 'تداخل عميق')],
  },
  'js-ch-int-3': {
    description: 'اكتب الدالة groupBy(arr, key) التي ترجع كائناً يجمع عناصر المصفوفة حسب قيمة الخاصية key.',
    addTests: [h('[], "x"', '{}', 'مصفوفة فارغة')],
  },
  'js-ch-int-4': {
    description:
      'اكتب الدالة throttle(func, limit) التي ترجع دالة جديدة تنفّذ func فوراً عند أول استدعاء، ثم تتجاهل أي استدعاءات خلال limit مللي ثانية.',
    testCases: [
      t('const calls = []; const f = throttle((x) => calls.push(x), 100); f(1); f(2); f(3); calls', '[1]', 'ثلاث استدعاءات متتالية تنفّذ الأول فقط'),
      t(`const calls = []; const f = throttle((x) => calls.push(x), 50); f(1); ${SLEEP(90)}; f(2); calls`, '[1, 2]', 'بعد انتهاء المدة يُقبل استدعاء جديد'),
      h(`let n = 0; const f = throttle(() => n++, 80); f(); f(); ${SLEEP(20)}; f(); n`, '1', 'استدعاء داخل المدة يُتجاهل'),
    ],
  },
  'js-ch-int-5': {
    description:
      'اكتب الدالة deepClone(obj) التي تنسخ الكائنات والمصفوفات نسخاً عميقاً: تعديل النسخة يجب ألا يغيّر الأصل في أي مستوى.',
    testCases: [
      t('deepClone({"a": {"b": 1}})', '{"a": {"b": 1}}', 'نسخ كائن متداخل'),
      t('const o = {a: {b: 1}, list: [1, [2]]}; const c = deepClone(o); c.a.b = 99; c.list[1][0] = 5; o.a.b + "," + o.list[1][0]', '1,2', 'تعديل النسخة لا يغيّر الأصل'),
      t('const o = {x: [1, 2]}; const c = deepClone(o); c !== o && c.x !== o.x', 'true', 'النسخة كائنات جديدة'),
      h('deepClone(null)', 'null', 'قيمة null'),
      h('deepClone([1, {"a": [2]}])', '[1, {"a": [2]}]', 'مصفوفة فيها كائنات'),
    ],
  },
  'js-challenge-1': {
    description: 'اكتب الدالة reverseString(str) التي ترجع النص معكوساً.',
    addTests: [h('"a"', 'a', 'حرف واحد'), h('"ab c"', 'c ba', 'مع مسافة')],
  },
  'js-challenge-2': {
    description:
      'اكتب الدالة fizzBuzz(n) التي ترجع مصفوفة للأرقام من 1 إلى n: "Fizz" لمضاعفات 3، و"Buzz" لمضاعفات 5، و"FizzBuzz" لمضاعفات الاثنين، والرقم نفسه في غير ذلك.',
    addTests: [h('1', '[1]', 'n = 1'), h('0', '[]', 'n = 0')],
  },
  'js-challenge-3': {
    description: 'اكتب الدالة isPalindrome(str) التي ترجع true إذا كان النص يُقرأ بنفس الطريقة من الاتجاهين، مع تجاهل حالة الأحرف والمسافات وعلامات الترقيم.',
    addTests: [h('""', 'true', 'نص فارغ'), h('"No \'x\' in Nixon"', 'true', 'علامات ترقيم'), h('"ab"', 'false', 'حرفان مختلفان')],
  },
  'js-challenge-4': {
    description: 'اكتب الدالة twoSum(nums, target) التي ترجع [i, j] لأول رقمين (i < j) مجموعهما target، أو [] إذا لم يوجد.',
    addTests: [h('[1, 5, 3, 7], 10', '[2, 3]', 'الزوج في النهاية'), h('[0, 4, 3, 0], 0', '[0, 3]', 'أصفار'), h('[1, 2], 7', '[]', 'لا يوجد حل')],
  },
  'js-challenge-5': {
    description:
      'اكتب الدالة debounce(func, delay) التي ترجع دالة جديدة تؤجل تنفيذ func حتى يمر delay مللي ثانية بدون أي استدعاء جديد، وتنفذها مرة واحدة بآخر مُعاملات.',
    testCases: [
      t(`const calls = []; const d = debounce((x) => calls.push(x), 50); d(1); d(2); d(3); ${SLEEP(150)}; calls`, '[3]', 'استدعاءات متتالية تنفّذ الأخير فقط'),
      t(`const calls = []; const d = debounce((x) => calls.push(x), 30); d(1); ${SLEEP(90)}; d(2); ${SLEEP(90)}; calls`, '[1, 2]', 'استدعاءات متباعدة تُنفذ كلها'),
      h('const calls = []; const d = debounce(() => calls.push(1), 50); d(); calls.length', '0', 'لا يُنفذ فوراً'),
    ],
  },
  'web-ch-debounce-impl-001': {
    description:
      'اكتب الدالة debounce(fn, delay) التي تؤخّر تنفيذ fn حتى يتوقف الاستدعاء لمدة delay مللي ثانية، ثم تنفذها مرة واحدة بآخر مُعاملات.',
    testCases: [
      t(`const calls = []; const d = debounce((x) => calls.push(x), 40); d("a"); d("b"); ${SLEEP(120)}; calls`, '["b"]', 'آخر استدعاء فقط'),
      h('let n = 0; const d = debounce(() => n++, 40); d(); n', '0', 'لا يُنفذ فوراً'),
      h(`let n = 0; const d = debounce(() => n++, 20); d(); ${SLEEP(60)}; d(); ${SLEEP(60)}; n`, '2', 'استدعاءات متباعدة'),
    ],
  },
  'deploy-challenge-2': {
    description:
      'عرّف الكائن packageJson الذي يمثل ملف package.json لمشروع Node.js، ويحتوي على name ("my-app") و version وسكريبتات start ("node index.js") و dev ("nodemon index.js") و test.',
    addTests: [h('packageJson.scripts.start', 'node index.js', 'سكريبت التشغيل'), h('Object.keys(packageJson.scripts).includes("test")', 'true', 'سكريبت الاختبار موجود')],
  },
  'deploy-challenge-3': {
    description:
      'اكتب الدالة loadConfig() التي تقرأ متغيرات البيئة وترجع كائن إعدادات: port (رقم، افتراضياً 3000)، و nodeEnv (افتراضياً "development")، و isDev و isProd.',
    testCases: [
      t('loadConfig().port', '3000', 'المنفذ الافتراضي'),
      t('loadConfig().isDev', 'true', 'وضع التطوير افتراضياً'),
      h('process.env.PORT = "8080"; loadConfig().port', '8080', 'قراءة PORT كرقم'),
      h('process.env.NODE_ENV = "production"; loadConfig().isProd', 'true', 'وضع الإنتاج'),
    ],
  },
  'rn-challenge-002': {
    // الوصف الأصلي ("عداد مع أزرار") لم يذكر الدوال التي تختبرها الاختبارات
    description:
      'منطق عداد: createCounter(initial) ترجع كائناً فيه getValue() و increment() و decrement() و reset() (تعيد القيمة الأولية)؛ و safeDecrement(value) تنقص 1 دون النزول تحت 0؛ و formatCounter(value) تضيف + قبل الأرقام الموجبة فقط.',
    addTests: [
      h('safeDecrement(3)', '2', 'إنقاص عادي'),
      h('const c = createCounter(10); c.decrement(); c.reset()', '10', 'إعادة التعيين للقيمة الأولية'),
      h('const c = createCounter(3); c.decrement(); c.decrement(); c.getValue()', '1', 'إنقاص مرتين'),
      h('formatCounter(-3)', '-3', 'رقم سالب بدون +'),
      h('formatCounter(0)', '0', 'الصفر بدون +'),
      h('createCounter(7).getValue()', '7', 'قيمة أولية أخرى'),
    ],
  },
  'rn-challenge-003': {
    description:
      'اكتب createTodoList() التي ترجع كائناً فيه addTask(text) و toggleTask(id) و removeTask(id) و getTasks() و completedCount() (عدد المنجزة) و getActiveTasks() (غير المنجزة)، حيث كل مهمة { id, text, done } والمعرّفات تبدأ من 1.',
    addTests: [
      h('const todo = createTodoList(); todo.addTask("a"); todo.addTask("b"); todo.addTask("c"); todo.getTasks().length', '3', 'ثلاث مهام'),
      h('const todo = createTodoList(); todo.addTask("a"); todo.addTask("b"); todo.getTasks()[1].id', '2', 'المعرّف الثاني = 2'),
      h('const todo = createTodoList(); todo.addTask("a"); todo.toggleTask(1); todo.toggleTask(1); todo.completedCount()', '0', 'التبديل مرتين يلغي الإنجاز'),
      h('const todo = createTodoList(); todo.getTasks().length', '0', 'قائمة فارغة'),
    ],
  },
  'rn-challenge-004': {
    description:
      'اكتب createStore() التي ترجع كائناً فيه getProducts() و addToCart(productId) (إضافة نفس المنتج تزيد الكمية) و removeFromCart(productId) و getTotal() و getCartCount().',
  },
  'rn-challenge-005': {
    description:
      'منطق تطبيق طقس: اكتب kelvinToCelsius و kelvinToFahrenheit (مقربة لرقمين عشريين)، و parseWeatherData(apiResponse) ترجع { city, temp (مئوية), description, humidity } من استجابة OpenWeather، و getWeatherAdvice(celsius): أقل من 0 ← "بارد جداً، ارتدِ ملابس ثقيلة"، أقل من 15 ← "بارد، ارتدِ معطفاً"، أقل من 30 ← "طقس معتدل"، غير ذلك ← "حار، اشرب ماءً كثيراً".',
    addTests: [
      h('kelvinToCelsius(300)', '26.85', 'تحويل مع كسور'),
      h('kelvinToFahrenheit(300)', '80.33', 'فهرنهايت مع تقريب'),
      h('getWeatherAdvice(20)', 'طقس معتدل', 'طقس معتدل'),
      h('getWeatherAdvice(10)', 'بارد، ارتدِ معطفاً', 'طقس بارد'),
      h('parseWeatherData({ name: "Baghdad", main: { temp: 313.15, humidity: 20 }, weather: [{ description: "clear" }] }).temp', '40', 'قراءة الحرارة من الاستجابة'),
      h('parseWeatherData({ name: "Erbil", main: { temp: 280, humidity: 55 }, weather: [{ description: "rain" }] }).city', 'Erbil', 'قراءة اسم المدينة'),
    ],
  },
  'json-ch-001': {
    description: 'اكتب الدالة processJSON(obj) التي تحوّل الكائن إلى نص JSON ثم تعيد تحليله وترجع قيمة name من النتيجة.',
    addTests: [h('{"name": ""}', '', 'اسم فارغ')],
  },
  'web-ch-slugify-001': {
    description:
      'اكتب الدالة slugify(text) التي تحوّل العنوان إلى slug: أحرف صغيرة، حذف المسافات من الطرفين، حذف أي حرف غير a-z أو 0-9 أو مسافة أو -، واستبدال المسافات بـ -.',
    addTests: [h('"Hello   World"', 'hello-world', 'مسافات متعددة'), h('"C++ & Python"', 'c-python', 'رموز تُحذف')],
  },
  'web-ch-querystring-001': {
    description: 'اكتب الدالة parseQueryString(query) التي تحوّل "a=1&b=2" إلى كائن { a: "1", b: "2" } مع فك الترميز (decodeURIComponent). النص الفارغ يعطي {}.',
    addTests: [h('""', '{}', 'نص فارغ'), h('"q=hello%20world"', '{"q": "hello world"}', 'فك الترميز')],
  },
  'web-ch-truncate-001': {
    description: 'اكتب الدالة truncate(text, maxLength): إذا كان النص أطول من maxLength أرجع أول (maxLength - 3) أحرف متبوعة بـ "..." بحيث لا يتجاوز الطول maxLength، وإلا أرجع النص كما هو.',
    addTests: [h('"abcdef", 6', 'abcdef', 'بالضبط الحد'), h('"abcdefg", 6', 'abc...', 'أطول بحرف')],
  },
  'web-ch-camelcase-001': {
    description: 'اكتب الدالة toCamelCase(str) التي تحوّل النص المفصول بـ - أو _ إلى camelCase (الكلمة الأولى كما هي وكل كلمة بعدها تبدأ بحرف كبير).',
    addTests: [h('"my-long_variable-name"', 'myLongVariableName', 'فواصل مختلطة'), h('"a-b"', 'aB', 'كلمتان قصيرتان')],
  },
  'web-ch-flatten-obj-001': {
    addTests: [h('{"a": {"b": {"c": 1}}, "d": [1, 2]}', '{"a.b.c": 1, "d": [1, 2]}', 'تداخل ثلاثي ومصفوفة'), h('{}', '{}', 'كائن فارغ')],
  },
  'web-ch-htmlentity-001': {
    description: 'اكتب الدالة encodeHTML(str) التي تحوّل & و < و > و " و \' إلى &amp; و &lt; و &gt; و &quot; و &#39;.',
    addTests: [h(`"'"`, '&#39;', 'علامة اقتباس مفردة'), h('"plain"', 'plain', 'نص بدون رموز')],
  },

  // ================= C++ (تُشغَّل فعلياً على خادم التشغيل) =================
  'cpp-ch-beg-1': {
    description: 'اكتب الدالة sumToN(n) التي ترجع مجموع الأعداد من 1 إلى n (و 0 إذا كان n صفراً).',
    addTests: [h('1', '1', 'n = 1'), h('100', '5050', 'n = 100'), h('0', '0', 'n = 0')],
  },
  'cpp-ch-beg-2': {
    description: 'اكتب الدالة maxOfThree(a, b, c) التي ترجع أكبر رقم من بين الأرقام الثلاثة.',
    addTests: [h('-5, -2, -9', '-2', 'أعداد سالبة'), h('10, 3, 2', '10', 'الأكبر أولاً'), h('1, 2, 3', '3', 'الأكبر أخيراً')],
  },
  'cpp-ch-beg-3': {
    description: 'اكتب الدالة printTable(n) التي تطبع جدول ضرب n من 1 إلى 10، كل سطر بالصيغة: n x i = النتيجة',
    addTests: [h('7', table(7), 'جدول 7'), h('1', table(1), 'جدول 1')],
  },
  'cpp-ch-beg-4': {
    description: 'اكتب الدالة isPrime(n) التي ترجع true إذا كان n عدداً أولياً. الأعداد الأقل من 2 ليست أولية. (cout يطبع true كـ 1 و false كـ 0)',
    addTests: [h('1', '0', 'العدد 1'), h('2', '1', 'العدد 2'), h('9', '0', 'مربع عدد أولي'), h('97', '1', 'عدد أولي كبير')],
  },
  'cpp-ch-beg-5': {
    description: 'اكتب الدالة factorial(n) التي ترجع n! (حاصل ضرب الأعداد من 1 إلى n) من نوع long long، حيث 0! = 1.',
    addTests: [h('1', '1', '1!'), h('10', '3628800', '10!'), h('20', '2432902008176640000', '20! — يحتاج long long')],
  },
  'cpp-ch-int-1': {
    description: 'اكتب الدالة binarySearch(arr, target) التي تبحث في vector مرتب تصاعدياً وترجع موقع target أو -1.',
    addTests: [h('vector<int>{1,3,5,7,9,11}, 1', '0', 'أول عنصر'), h('vector<int>{1,3,5,7,9,11}, 11', '5', 'آخر عنصر'), h('vector<int>{}, 5', '-1', 'vector فارغ')],
  },
  'cpp-ch-int-2': {
    description: 'اكتب الدالة bubbleSort(arr) التي ترتب الـ vector تصاعدياً بخوارزمية الفقاعات وترجع النتيجة كنص تفصل بين أرقامه مسافة واحدة.',
    addTests: [h('vector<int>{1,2,3}', '1 2 3', 'مرتبة مسبقاً'), h('vector<int>{3,3,1}', '1 3 3', 'قيم مكررة'), h('vector<int>{42}', '42', 'عنصر واحد')],
  },
  'cpp-ch-int-3': {
    description: 'أكمل LinkedList: insert(value) يضيف في نهاية القائمة، و print() يرجع العناصر بالشكل "1 -> 2 -> 3 -> NULL" (أو "NULL" للقائمة الفارغة).',
    addTests: [h('vector<int>{7}', '7 -> NULL', 'عنصر واحد'), h('vector<int>{}', 'NULL', 'قائمة فارغة')],
  },
  'cpp-ch-int-4': {
    description: 'أكمل Stack باستخدام مصفوفة: push و pop (يرجع -1 إذا كان فارغاً) و top و isEmpty.',
    addTests: [h('vector<int>{42}', '42', 'عنصر واحد'), h('vector<int>{}', '-1', 'pop من Stack فارغ')],
  },
  'cpp-ch-int-5': {
    description: 'أكمل Queue باستخدام مصفوفة دائرية: enqueue و dequeue (يرجع -1 إذا كانت فارغة) و isEmpty — أول داخل أول خارج.',
    addTests: [h('vector<int>{9}', '9', 'عنصر واحد'), h('vector<int>{}', '-1', 'dequeue من Queue فارغة')],
  },
  'cpp-ch-1': {
    description: 'اكتب الدالة reverseArray(arr) التي تعكس الـ vector في مكانه (بدون مصفوفة إضافية) وترجعه كنص تفصل بين أرقامه مسافة.',
    addTests: [h('vector<int>{1,2}', '2 1', 'عنصران'), h('vector<int>{}', '', 'vector فارغ')],
  },
  'cpp-ch-2': {
    description: 'اكتب الدالة isPalindrome(text) التي ترجع true إذا كان النص متماثلاً بعد تجاهل المسافات والرموز وحالة الأحرف.',
    addTests: [h('""', '1', 'نص فارغ'), h('"ab"', '0', 'حرفان مختلفان'), h('"No lemon, no melon"', '1', 'جملة مع فاصلة')],
  },
  'cpp-ch-3': {
    description: 'اكتب الدالة fibonacci(n) التي ترجع العدد رقم n في متتالية فيبوناتشي (F(0)=0، F(1)=1) باستخدام حل تكراري من نوع long long.',
    addTests: [h('0', '0', 'F(0)'), h('1', '1', 'F(1)'), h('2', '1', 'F(2)'), h('50', '12586269025', 'F(50) — يحتاج long long وحلاً سريعاً')],
  },

  // ================= SQL (SQLite) =================
  'backend-ch-2': {
    difficulty: 'medium',
    description:
      'لديك جداول users(id, name) و posts(id, user_id) و comments(id, post_id). اكتب استعلاماً يرجع لكل مستخدم: الاسم، وعدد منشوراته، وعدد التعليقات على منشوراته — مرتباً حسب عدد المنشورات تنازلياً. المستخدم بدون منشورات يظهر بصفر.',
    testCases: [
      t(
        "CREATE TABLE users(id INTEGER, name TEXT); CREATE TABLE posts(id INTEGER, user_id INTEGER); CREATE TABLE comments(id INTEGER, post_id INTEGER);\nINSERT INTO users VALUES (1,'Ali'),(2,'Sara'),(3,'Omar');\nINSERT INTO posts VALUES (1,1),(2,1),(3,2);\nINSERT INTO comments VALUES (1,1),(2,2),(3,3);",
        'Ali|2|2\nSara|1|1\nOmar|0|0',
        'ثلاثة مستخدمين (أحدهم بدون منشورات)'
      ),
      h(
        "CREATE TABLE users(id INTEGER, name TEXT); CREATE TABLE posts(id INTEGER, user_id INTEGER); CREATE TABLE comments(id INTEGER, post_id INTEGER);\nINSERT INTO users VALUES (1,'Ali'),(2,'Mona');\nINSERT INTO posts VALUES (1,2),(2,2),(3,1);\nINSERT INTO comments VALUES (1,1),(2,1),(3,1);",
        'Mona|2|3\nAli|1|0',
        'منشور بدون تعليقات لا يُحسب تعليقاً'
      ),
    ],
  },
};

const ALL_FIXES: Record<string, ChallengeFix> = {
  ...EXECUTABLE_FIXES,
  ...AI_CHALLENGE_FIXES,
  ...STRUCTURAL_CHALLENGE_FIXES,
  // تُشغَّل فعلياً (تستبدل الفحص البنيوي لنفس التحديات)
  ...NODE_CHALLENGE_FIXES,
};

export function applyChallengeFixes(list: Challenge[]): Challenge[] {
  return list.map((c) => {
    const fix = ALL_FIXES[c.id];
    if (!fix) return c;
    const { addTests, transform, ...rest } = fix;
    const merged: Challenge = { ...c, ...rest } as Challenge;
    if (addTests?.length) {
      merged.testCases = [...(rest.testCases ?? c.testCases), ...addTests];
    }
    return transform ? ({ ...merged, ...transform(merged) } as Challenge) : merged;
  });
}

/** معرفات التحديات التي عُدّلت (للتقرير) */
export const FIXED_CHALLENGE_IDS = Object.keys(ALL_FIXES);

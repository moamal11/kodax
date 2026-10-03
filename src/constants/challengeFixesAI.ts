/**
 * إعادة بناء تحديات الذكاء الاصطناعي
 *
 * المشكلة التي كشفها التدقيق: الحلول النموذجية كانت برامج sklearn/numpy/
 * PyTorch/spaCy (غير متوفرة في بيئة التشغيل)، والاختبارات كانت سكربتات
 * مستقلة لا تستدعي كود المستخدم أصلاً — فأي كود يعمل كان يُقبل.
 *
 * الحل: كل تحدٍ يحافظ على موضوعه، لكن المطلوب تنفيذ الفكرة الأساسية بلغة
 * Python الخالصة (بدون مكتبات)، والاختبارات تستدعي دوال المستخدم فعلاً.
 */

import { t, h, type ChallengeFix } from './challengeFixHelpers';

export const AI_CHALLENGE_FIXES: Record<string, ChallengeFix> = {
  'ai-challenge-1': {
    title: 'تقييم نموذج تصنيف الأزهار',
    description:
      'نموذج صنّف أزهار Iris، والمطلوب تقييم نتائجه بدون مكتبات: اكتب accuracy(y_true, y_pred) التي ترجع نسبة التوقعات الصحيحة مقرّبة لرقمين (0.0 للقوائم الفارغة)، و majority_class(labels) التي ترجع الفئة الأكثر تكراراً (عند التعادل الأصغر قيمة) — وهي أبسط نموذج مرجعي (baseline).',
    starterCode: `def accuracy(y_true, y_pred):
    # نسبة التوقعات الصحيحة مقربة لرقمين
    pass


def majority_class(labels):
    # الفئة الأكثر تكراراً (عند التعادل: الأصغر)
    pass`,
    solution: `def accuracy(y_true, y_pred):
    if not y_true:
        return 0.0
    correct = sum(1 for a, b in zip(y_true, y_pred) if a == b)
    return round(correct / len(y_true), 2)


def majority_class(labels):
    counts = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    return min(counts, key=lambda k: (-counts[k], k))`,
    hints: [
      'الدقة = عدد التوقعات الصحيحة ÷ العدد الكلي',
      'zip(y_true, y_pred) يمشي على القائمتين معاً',
      'لإيجاد الأكثر تكراراً احسب عدد كل فئة في قاموس',
    ],
    entryFunction: 'accuracy',
    testCases: [
      t('accuracy([0, 1, 1, 0, 1], [0, 1, 0, 0, 1])', '0.8', 'أربع توقعات صحيحة من خمس'),
      t('majority_class([0, 0, 0, 1, 1, 2, 2, 2, 2])', '2', 'الفئة الأكثر تكراراً'),
      h('accuracy([2, 2, 2], [2, 2, 2])', '1.0', 'دقة كاملة'),
      h('accuracy([], [])', '0.0', 'قوائم فارغة'),
      h('accuracy([0, 1, 2], [2, 1, 0])', '0.33', 'التقريب لرقمين'),
      h('majority_class([1, 0, 1, 0])', '0', 'تعادل ← الأصغر'),
    ],
  },
  'ai-challenge-2': {
    description:
      'حلّل مشاعر نص بقاموس كلمات: اكتب sentiment(text, positive_words, negative_words) التي تحوّل النص لأحرف صغيرة، وتقسمه لكلمات (وتزيل علامات الترقيم . , ! ? من أطراف الكلمات)، ثم ترجع "إيجابي" إذا كانت الكلمات الإيجابية أكثر، و "سلبي" إذا كانت السلبية أكثر، و "محايد" عند التساوي.',
    starterCode: `def sentiment(text, positive_words, negative_words):
    # أرجع "إيجابي" أو "سلبي" أو "محايد"
    pass`,
    solution: `def sentiment(text, positive_words, negative_words):
    words = [w.strip(".,!?؟،") for w in text.lower().split()]
    pos = sum(1 for w in words if w in positive_words)
    neg = sum(1 for w in words if w in negative_words)
    if pos > neg:
        return "إيجابي"
    if neg > pos:
        return "سلبي"
    return "محايد"`,
    hints: ['text.lower().split() يعطيك الكلمات', 'w.strip(".,!?") يزيل علامات الترقيم من الأطراف', 'عدّ الكلمات الإيجابية والسلبية ثم قارن'],
    testCases: [
      t('sentiment("great product, amazing quality", {"great", "amazing"}, {"bad"})', 'إيجابي', 'كلمتان إيجابيتان'),
      t('sentiment("bad service, terrible", {"good"}, {"bad", "terrible"})', 'سلبي', 'كلمتان سلبيتان'),
      h('sentiment("it is ok", {"good"}, {"bad"})', 'محايد', 'لا كلمات معروفة'),
      h('sentiment("Good but bad", {"good"}, {"bad"})', 'محايد', 'تعادل'),
      h('sentiment("GOOD good bad!", {"good"}, {"bad"})', 'إيجابي', 'حالة الأحرف وعلامات الترقيم'),
    ],
  },
  'ai-challenge-3': {
    description:
      'أساسيات الانحدار الخطي بدون مكتبات: predict_price(size, m, b) ترجع m × size + b، و mse(actual, predicted) ترجع متوسط مربع الخطأ مقرباً لرقمين، و r2_score(actual, predicted) ترجع معامل التحديد R² مقرباً لثلاثة أرقام.',
    starterCode: `def predict_price(size, m, b):
    pass


def mse(actual, predicted):
    # متوسط مربع الخطأ مقرب لرقمين
    pass


def r2_score(actual, predicted):
    # 1 - (مجموع مربعات الخطأ / مجموع مربعات الانحراف عن المتوسط) مقرب لثلاثة أرقام
    pass`,
    solution: `def predict_price(size, m, b):
    return m * size + b


def mse(actual, predicted):
    errors = [(a - p) ** 2 for a, p in zip(actual, predicted)]
    return round(sum(errors) / len(errors), 2)


def r2_score(actual, predicted):
    mean = sum(actual) / len(actual)
    ss_res = sum((a - p) ** 2 for a, p in zip(actual, predicted))
    ss_tot = sum((a - mean) ** 2 for a in actual)
    if ss_tot == 0:
        return 1.0 if ss_res == 0 else 0.0
    return round(1 - ss_res / ss_tot, 3)`,
    hints: ['MSE = متوسط (الفعلي - المتوقع)²', 'R² = 1 - SS_res / SS_tot', 'SS_tot = مجموع (الفعلي - المتوسط)²'],
    entryFunction: 'predict_price',
    testCases: [
      t('predict_price(150, 2500, 50000)', '425000', 'التنبؤ الخطي'),
      t('mse([3, 5, 7], [2.5, 5.0, 7.5])', '0.17', 'متوسط مربع الخطأ'),
      t('r2_score([100, 200, 300], [110, 190, 310])', '0.985', 'معامل التحديد'),
      h('mse([1, 2], [1, 2])', '0.0', 'تنبؤ مثالي'),
      h('predict_price(0, 3, 7)', '7', 'قيمة b عند الصفر'),
      h('r2_score([1, 2, 3], [1, 2, 3])', '1.0', 'R² مثالي'),
    ],
  },
  'ai-challenge-4': {
    description:
      'خطوات K-Means الأساسية بدون مكتبات: euclidean(a, b) ترجع المسافة الإقليدية مقربة لرقمين، و nearest_centroid(point, centroids) ترجع رقم أقرب مركز، و min_max_normalize(values) ترجع القيم مطبّعة بين 0 و 1 مقربة لرقمين (كلها 0.0 إذا كانت القيم متساوية).',
    starterCode: `def euclidean(a, b):
    pass


def nearest_centroid(point, centroids):
    # أرجع رقم (index) أقرب مركز
    pass


def min_max_normalize(values):
    pass`,
    solution: `import math


def euclidean(a, b):
    return round(math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b))), 2)


def nearest_centroid(point, centroids):
    distances = [euclidean(point, c) for c in centroids]
    return distances.index(min(distances))


def min_max_normalize(values):
    lo, hi = min(values), max(values)
    if hi == lo:
        return [0.0 for _ in values]
    return [round((v - lo) / (hi - lo), 2) for v in values]`,
    hints: ['المسافة = الجذر التربيعي لمجموع (الفرق)²', 'احسب المسافة لكل مركز واختر الأصغر', 'التطبيع = (القيمة - الأصغر) ÷ (الأكبر - الأصغر)'],
    entryFunction: 'euclidean',
    testCases: [
      t('euclidean([1, 2], [4, 6])', '5.0', 'مسافة 3-4-5'),
      t('nearest_centroid([9, 11], [[0, 0], [10, 10], [20, 20]])', '1', 'أقرب مركز'),
      t('min_max_normalize([10, 20, 30, 40, 50])', '[0.0, 0.25, 0.5, 0.75, 1.0]', 'تطبيع Min-Max'),
      h('euclidean([0, 0], [0, 0])', '0.0', 'نفس النقطة'),
      h('nearest_centroid([19, 19], [[0, 0], [10, 10], [20, 20]])', '2', 'آخر مركز'),
      h('min_max_normalize([5, 5])', '[0.0, 0.0]', 'قيم متساوية'),
    ],
  },
  'ai-challenge-5': {
    description:
      'خلية عصبية واحدة بدون مكتبات: sigmoid(x) ترجع 1/(1+e^-x) مقربة لأربعة أرقام، و relu(x) ترجع max(0, x)، و neuron_output(inputs, weights, bias) ترجع sigmoid(مجموع inputs×weights + bias) مقربة لأربعة أرقام.',
    starterCode: `import math


def sigmoid(x):
    pass


def relu(x):
    pass


def neuron_output(inputs, weights, bias):
    pass`,
    solution: `import math


def sigmoid(x):
    return round(1 / (1 + math.exp(-x)), 4)


def relu(x):
    return max(0, x)


def neuron_output(inputs, weights, bias):
    total = sum(i * w for i, w in zip(inputs, weights)) + bias
    return sigmoid(total)`,
    hints: ['math.exp(-x) تحسب e^-x', 'الناتج قبل التفعيل = مجموع (مدخل × وزن) + bias', 'طبّق sigmoid على المجموع'],
    entryFunction: 'sigmoid',
    testCases: [
      t('sigmoid(0)', '0.5', 'Sigmoid عند الصفر'),
      t('relu(-3)', '0', 'ReLU لقيمة سالبة'),
      t('neuron_output([1, 2, 3], [0.5, -0.5, 0.2], 0.1)', '0.5498', 'التمرير الأمامي'),
      h('sigmoid(2)', '0.8808', 'Sigmoid لقيمة موجبة'),
      h('relu(5)', '5', 'ReLU لقيمة موجبة'),
      h('neuron_output([0, 0], [1, 1], 0)', '0.5', 'مدخلات صفرية'),
    ],
  },
  'ai-challenge-6': {
    title: 'عمليات CNN الأساسية',
    description:
      'العمليات التي تقوم عليها الشبكات الالتفافية، بدون مكتبات: conv2d(image, kernel) تطبّق الالتفاف (بدون حشو وبخطوة 1) وترجع مصفوفة النتيجة، و max_pool2d(matrix) تطبّق Max Pooling بنافذة 2×2 وخطوة 2.',
    starterCode: `def conv2d(image, kernel):
    # التفاف بدون حشو، خطوة 1
    pass


def max_pool2d(matrix):
    # نافذة 2x2 وخطوة 2
    pass`,
    solution: `def conv2d(image, kernel):
    kh, kw = len(kernel), len(kernel[0])
    rows = len(image) - kh + 1
    cols = len(image[0]) - kw + 1
    result = []
    for i in range(rows):
        row = []
        for j in range(cols):
            total = 0
            for a in range(kh):
                for b in range(kw):
                    total += image[i + a][j + b] * kernel[a][b]
            row.append(total)
        result.append(row)
    return result


def max_pool2d(matrix):
    result = []
    for i in range(0, len(matrix) - 1, 2):
        row = []
        for j in range(0, len(matrix[0]) - 1, 2):
            row.append(max(matrix[i][j], matrix[i][j + 1], matrix[i + 1][j], matrix[i + 1][j + 1]))
        result.append(row)
    return result`,
    hints: ['حجم النتيجة = (الارتفاع - ارتفاع الفلتر + 1) × (العرض - عرض الفلتر + 1)', 'في كل موضع: اضرب الفلتر بالجزء المقابل من الصورة واجمع', 'في Max Pooling خذ أكبر قيمة من كل مربع 2×2'],
    entryFunction: 'conv2d',
    testCases: [
      t('conv2d([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, 1]])', '[[6, 8], [12, 14]]', 'التفاف ثنائي الأبعاد'),
      t('max_pool2d([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]])', '[[6, 8], [14, 16]]', 'Max Pooling 2×2'),
      h('conv2d([[1, 1], [1, 1]], [[1, 1], [1, 1]])', '[[4]]', 'فلتر بحجم الصورة'),
      h('conv2d([[0, 1, 2], [3, 4, 5]], [[1, -1]])', '[[-1, -1], [-1, -1]]', 'فلتر غير مربع'),
      h('max_pool2d([[1, 2], [3, 4]])', '[[4]]', 'مربع واحد'),
    ],
  },
  'ai-challenge-7': {
    description:
      'أساس أنظمة التوصية بدون مكتبات: cosine_similarity(a, b) ترجع تشابه جيب التمام بين متجهين مقرباً لرقمين (0.0 إذا كان أحدهما صفرياً)، و unrated_items(ratings) ترجع مواقع العناصر التي تقييمها 0 (لم يقيّمها المستخدم بعد).',
    starterCode: `import math


def cosine_similarity(a, b):
    pass


def unrated_items(ratings):
    pass`,
    solution: `import math


def cosine_similarity(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return round(dot / (norm_a * norm_b), 2)


def unrated_items(ratings):
    return [i for i, r in enumerate(ratings) if r == 0]`,
    hints: ['التشابه = حاصل الضرب النقطي ÷ (طول a × طول b)', 'طول المتجه = الجذر التربيعي لمجموع مربعات عناصره', 'enumerate يعطيك الموقع والقيمة معاً'],
    entryFunction: 'cosine_similarity',
    testCases: [
      t('cosine_similarity([1, 2, 3], [2, 4, 6])', '1.0', 'متجهان متناسبان'),
      t('cosine_similarity([1, 0, 0], [0, 1, 0])', '0.0', 'متجهان متعامدان'),
      t('unrated_items([5, 3, 0, 1])', '[2]', 'عنصر غير مقيّم'),
      h('cosine_similarity([0, 0], [1, 1])', '0.0', 'متجه صفري'),
      h('cosine_similarity([1, 1], [1, 0])', '0.71', 'زاوية 45 درجة'),
      h('unrated_items([0, 0, 4])', '[0, 1]', 'عدة عناصر'),
    ],
  },
  'ai-challenge-8': {
    description:
      'أساسيات معالجة اللغة بدون مكتبات خارجية: tokenize(text) ترجع الكلمات بأحرف صغيرة (أحرف وأرقام فقط)، و top_words(text, n) ترجع أكثر n كلمات تكراراً كقائمة (كلمة، عدد) مرتبة بالعدد تنازلياً ثم أبجدياً، و find_phone_numbers(text) ترجع كل الأرقام بصيغة 123-456-7890.',
    starterCode: `import re


def tokenize(text):
    pass


def top_words(text, n):
    pass


def find_phone_numbers(text):
    pass`,
    solution: String.raw`import re


def tokenize(text):
    return re.findall(r"[a-z0-9]+", text.lower())


def top_words(text, n):
    counts = {}
    for word in tokenize(text):
        counts[word] = counts.get(word, 0) + 1
    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return ranked[:n]


def find_phone_numbers(text):
    return re.findall(r"\b\d{3}-\d{3}-\d{4}\b", text)`,
    hints: ['re.findall تعيد كل التطابقات', 'رتّب بمفتاح (-العدد، الكلمة)', String.raw`النمط \d{3}-\d{3}-\d{4} يطابق صيغة رقم الهاتف`],
    entryFunction: 'tokenize',
    testCases: [
      t('top_words("the cat sat on the mat the cat", 2)', "[('the', 3), ('cat', 2)]", 'أكثر الكلمات تكراراً'),
      t('find_phone_numbers("Call 123-456-7890 or 555-000-1111")', "['123-456-7890', '555-000-1111']", 'استخراج أرقام الهاتف'),
      t('tokenize("Hello, World! 2024")', "['hello', 'world', '2024']", 'تقسيم النص'),
      h('top_words("B a b A c", 2)', "[('a', 2), ('b', 2)]", 'تعادل ← ترتيب أبجدي'),
      h('find_phone_numbers("no numbers here")', '[]', 'لا توجد أرقام'),
      h('top_words("", 3)', '[]', 'نص فارغ'),
      h('tokenize("  Python3 is FUN!!  ")', "['python3', 'is', 'fun']", 'رموز ومسافات زائدة'),
    ],
  },
};

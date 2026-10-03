/**
 * اختبار المُحقِّق بحلول خاطئة عمداً (يجب رفضها) وحلول صحيحة بديلة (يجب قبولها).
 * الهدف: التأكد أن التحقق يقيس صحة السلوك فعلاً، وليس تطابق النص مع الحل النموذجي،
 * وأن نوع الخطأ (syntax / runtime / timeout / wrong_output / structure) صحيح.
 *
 * التشغيل: npx tsx scripts/challenge-audit/mutants.ts
 */
import { ALL_CHALLENGES } from '../../src/constants/courseData';
import { validateChallenge } from '../../src/services/challengeValidator';
import { localExecute } from './localExecutor';

type Case = {
  id: string;
  why: string;
  code: string | ((c: any) => string);
  /** true = يجب أن يُقبل (حل صحيح بديل) */
  accept?: boolean;
  /** نوع النتيجة المتوقع لأول اختبار فاشل */
  kind?: string;
};

const CASES: Case[] = [
  // ---------- حلول ثابتة (hardcoded) ----------
  {
    id: 'web-ch-camelcase-001',
    why: 'يرجع إجابات الاختبارات الظاهرة فقط',
    code: `function toCamelCase(s) {
  if (s === "hello-world") return "helloWorld";
  if (s === "background_color") return "backgroundColor";
  return s;
}`,
  },
  {
    id: 'cpp-ch-beg-1',
    why: 'C++ يرجع قيم الاختبارات الظاهرة فقط',
    code: `int sumToN(int n) {
    if (n == 5) return 15;
    return 55;
}`,
  },
  {
    id: 'rn-challenge-005',
    why: 'جدول قيم ثابت للاختبارات الظاهرة',
    code: `function kelvinToCelsius(k) { return 0; }
function kelvinToFahrenheit(k) { return 32; }
function parseWeatherData(r) { return {}; }
function getWeatherAdvice(c) { return c > 0 ? 'حار، اشرب ماءً كثيراً' : 'بارد جداً، ارتدِ ملابس ثقيلة'; }`,
  },
  {
    id: 'cyber-ch-xss-001',
    why: 'يطبع الإجابة المتوقعة خارج الدالة ويرجع None',
    code: `print("&lt;script&gt;")
print("Hello &quot;World&quot;")
def sanitize_input(user_input):
    return None`,
  },

  // ---------- منطق خاطئ جزئياً ----------
  { id: 'web-ch-camelcase-001', why: 'يدعم - فقط وليس _', code: `function toCamelCase(s) { return s.replace(/-(\\w)/g, (_, c) => c.toUpperCase()); }` },
  { id: 'js-ch-int-5', why: 'deepClone يرجع نفس الكائن', code: `function deepClone(obj) { return obj; }` },
  { id: 'js-ch-int-5', why: 'deepClone نسخ سطحي', code: `function deepClone(obj) { return Array.isArray(obj) ? [...obj] : obj && typeof obj === 'object' ? { ...obj } : obj; }` },
  { id: 'js-challenge-5', why: 'debounce ينفذ فوراً', code: `function debounce(func, delay) { return (...a) => func(...a); }` },
  { id: 'js-ch-int-4', why: 'throttle لا يتجاهل الاستدعاءات', code: `function throttle(func, limit) { return (...a) => func(...a); }` },
  {
    id: 'algo-ch-binary-001',
    why: 'بحث ثنائي بخطأ حدود (lo < hi) يفوّت آخر عنصر',
    code: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
  },
  {
    id: 'ds-ch-lru-001',
    why: 'FIFO بدل LRU (لا يحدّث الاستخدام عند get)',
    code: `def lru_cache_operations(capacity, operations):
    cache = {}
    out = []
    for op in operations:
        if op[0] == "put":
            if op[1] not in cache and len(cache) >= capacity:
                del cache[next(iter(cache))]
            cache[op[1]] = op[2]
        else:
            out.append(cache.get(op[1], -1))
    return out`,
  },
  { id: 'cpp-ch-beg-1', why: 'C++ حلقة تتوقف قبل n', code: `int sumToN(int n) {\n    int s = 0;\n    for (int i = 1; i < n; i++) s += i;\n    return s;\n}` },
  {
    id: 'backend-ch-2',
    why: 'SQL بـ INNER JOIN يُسقط المستخدم بلا منشورات',
    code: `SELECT u.name, COUNT(DISTINCT p.id) AS posts_count, COUNT(c.id) AS comments_count
FROM users u JOIN posts p ON u.id = p.user_id LEFT JOIN comments c ON p.id = c.post_id
GROUP BY u.id, u.name ORDER BY posts_count DESC;`,
  },
  {
    id: 'backend-ch-2',
    why: 'SQL بدون DISTINCT يضاعف عدد المنشورات',
    code: `SELECT u.name, COUNT(p.id) AS posts_count, COUNT(c.id) AS comments_count
FROM users u LEFT JOIN posts p ON u.id = p.user_id LEFT JOIN comments c ON p.id = c.post_id
GROUP BY u.id, u.name ORDER BY posts_count DESC;`,
  },
  { id: 'cyber-ch-hash-compare-001', why: 'MD5 بدل SHA-256', code: `import hashlib, hmac\ndef hash_password(p):\n    return hashlib.md5(p.encode()).hexdigest()\ndef verify_password(p, h):\n    return hmac.compare_digest(hash_password(p), h)` },
  { id: 'cyber-ch-base64-001', why: 'يستخدم مكتبة base64 الممنوعة في الوصف', code: `import base64\ndef base64_encode(text):\n    return base64.b64encode(text.encode()).decode()` },

  // ---------- أنواع الأخطاء ----------
  { id: 'py-ch-beg-1', why: 'قسمة على صفر بدون معالجة ← خطأ تشغيل', kind: 'runtime_error', code: `def calculator(a, b, operation):\n    if operation == "+": return a + b\n    if operation == "-": return a - b\n    if operation == "*": return a * b\n    return a / b` },
  { id: 'algo-ch-binary-001', why: 'حلقة لا نهائية ← انتهاء الوقت', kind: 'timeout', code: `def binary_search(arr, target):\n    while True:\n        pass` },
  { id: 'algo-ch-binary-001', why: 'خطأ كتابة ← syntax', kind: 'syntax_error', code: `def binary_search(arr, target)\n    return -1` },
  { id: 'web-ch-camelcase-001', why: 'JS خطأ كتابة', kind: 'syntax_error', code: `function toCamelCase(s) { return s.replace( }` },
  { id: 'cpp-ch-beg-1', why: 'C++ خطأ ترجمة', kind: 'syntax_error', code: `int sumToN(int n) { return n * (n + 1) / 2 }` },

  // ---------- تحديات بنيوية ----------
  {
    id: 'react-challenge-1',
    why: 'الكود المطلوب موجود في تعليقات فقط',
    code: (c) => `${c.starterCode}\n// useState(0) onClick={} onClick={} onClick={} +1 -1 setCount(0) العداد: {count}`,
  },
  { id: 'css-ch-4', why: 'CSS بلا keyframes', code: `.spinner { border-radius: 50%; border-top: 3px solid blue; }` },
  {
    id: 'html-ch-semantic-001',
    why: 'يُبقي div.header بجانب الوسوم الدلالية',
    code: `<div class="header">x</div><header></header><nav></nav><main><article><time>1</time></article></main><aside></aside><footer></footer>`,
  },

  // ---------- تحديات بنيوية: بدائل صحيحة بأسلوب مختلف (يجب قبولها) ----------
  {
    id: 'react-ch-int-1',
    accept: true,
    why: 'بحث بدون حساسية للأحرف عبر RegExp بعلم i بدل toLowerCase',
    code: (c) =>
      c.solution.replace(
        /item\.toLowerCase\(\)\.includes\(search\.toLowerCase\(\)\)/,
        "new RegExp(search.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'i').test(item)"
      ),
  },
  {
    id: 'react-challenge-2',
    accept: true,
    why: 'حذف بـ splice على نسخة، وتجاهل الفارغ بفحص الطول',
    code: (c) =>
      c.solution
        .replace('if (!input.trim()) return;', 'if (input.length === 0) return;')
        .replace('setTodos(todos.filter(t => t.id !== id));', 'const copy = [...todos]; copy.splice(copy.findIndex(t => t.id === id), 1); setTodos(copy);'),
  },
  {
    id: 'flutter-challenge-003',
    accept: true,
    why: 'فهرنهايت بأقواس وترتيب مختلف ((c * 9 / 5) + 32)',
    code: (c) => c.solution.replace('return (kelvin - 273.15) * 9 / 5 + 32;', 'final c = kelvin - 273.15;\n  return (c * 9 / 5) + 32;'),
  },
  {
    id: 'flutter-challenge-004',
    accept: true,
    why: 'المجموع بحلقة for بدل fold',
    code: (c) =>
      c.solution
        .replace('return items.fold(0.0, (sum, item) => sum + (item.price * item.quantity));', 'double total = 0;\n    for (final item in items) { total += item.price * item.quantity; }\n    return total;')
        .replace('return items.fold(0, (sum, item) => sum + item.quantity);', 'int count = 0;\n    for (final item in items) { count += item.quantity; }\n    return count;'),
  },
  // ---------- تحديات بنيوية: حلول ناقصة (يجب رفضها) ----------
  {
    id: 'react-challenge-2',
    why: 'بدون حذف المهمة',
    code: (c) => c.solution.replace('setTodos(todos.filter(t => t.id !== id));', '/* TODO */'),
  },
  {
    id: 'flutter-challenge-003',
    why: 'فهرنهايت بمعادلة خاطئة (بدون 9/5)',
    code: (c) => c.solution.replace('return (kelvin - 273.15) * 9 / 5 + 32;', 'return kelvin + 32;'),
  },

  // ---------- حلول صحيحة بديلة (يجب قبولها) ----------
  { id: 'web-ch-camelcase-001', accept: true, why: 'حل صحيح بـ split/map', code: `function toCamelCase(str) {\n  return str.split(/[-_]/).map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');\n}` },
  { id: 'cpp-ch-beg-1', accept: true, why: 'C++ بالمعادلة بدل الحلقة', code: `int sumToN(int n) {\n    return n * (n + 1) / 2;\n}` },
  {
    id: 'algo-ch-binary-001',
    accept: true,
    why: 'بحث ثنائي تعاودي',
    code: `def binary_search(arr, target, lo=0, hi=None):\n    if hi is None:\n        hi = len(arr) - 1\n    if lo > hi:\n        return -1\n    mid = (lo + hi) // 2\n    if arr[mid] == target:\n        return mid\n    if arr[mid] < target:\n        return binary_search(arr, target, mid + 1, hi)\n    return binary_search(arr, target, lo, mid - 1)`,
  },
  {
    id: 'ds-ch-lru-001',
    accept: true,
    why: 'LRU بـ OrderedDict',
    code: `from collections import OrderedDict\n\ndef lru_cache_operations(capacity, operations):\n    cache = OrderedDict()\n    result = []\n    for op in operations:\n        if op[0] == "get":\n            if op[1] in cache:\n                cache.move_to_end(op[1])\n                result.append(cache[op[1]])\n            else:\n                result.append(-1)\n        else:\n            cache[op[1]] = op[2]\n            cache.move_to_end(op[1])\n            if len(cache) > capacity:\n                cache.popitem(last=False)\n    return result`,
  },
  {
    id: 'cyber-ch-xss-001',
    accept: true,
    why: 'حل صحيح مع print للتجربة (لا يجب أن يُفسد النتيجة)',
    code: `def sanitize_input(user_input):\n    out = user_input.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")\n    out = out.replace('"', "&quot;").replace("'", "&#x27;").replace("/", "&#x2F;")\n    return out\n\nprint(sanitize_input('<b>"hi"</b>'))`,
  },
  {
    id: 'backend-ch-2',
    accept: true,
    why: 'SQL صحيح بصياغة مختلفة (استعلامات فرعية)',
    code: `SELECT name,
  (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) AS posts_count,
  (SELECT COUNT(*) FROM comments c JOIN posts p ON c.post_id = p.id WHERE p.user_id = u.id) AS comments_count
FROM users u
ORDER BY posts_count DESC;`,
  },
  {
    id: 'py-ch-beg-1',
    accept: true,
    why: 'حاسبة بقاموس عمليات',
    code: `def calculator(a, b, operation):\n    if operation == "/" and b == 0:\n        return "لا يمكن القسمة على صفر"\n    ops = {"+": lambda: a + b, "-": lambda: a - b, "*": lambda: a * b, "/": lambda: a / b}\n    return ops[operation]() if operation in ops else "عملية غير صالحة"`,
  },
];

(async () => {
  let ok = 0;
  const bad: string[] = [];
  for (const cs of CASES) {
    const c: any = (ALL_CHALLENGES as any[]).find((x) => x.id === cs.id);
    if (!c) {
      bad.push(`${cs.id}: غير موجود`);
      continue;
    }
    const code = typeof cs.code === 'function' ? cs.code(c) : cs.code;
    const r = await validateChallenge(code, c.starterCode, c.language, c.testCases, {
      execute: localExecute,
      checks: c.checks,
      entryFunction: c.entryFunction,
      validation: c.validation,
      prelude: c.prelude,
    });
    const firstFail = r.results.find((x) => !x.passed);
    const accepted = r.allPassed;
    let pass = cs.accept ? accepted : !accepted;
    if (pass && cs.kind && firstFail?.kind !== cs.kind) pass = false;
    const tag = pass ? 'OK  ' : 'FAIL';
    const detail = cs.accept
      ? `${r.passedTests}/${r.totalTests}${firstFail ? ` ← ${firstFail.message}` : ''}`
      : `${r.passedTests}/${r.totalTests} kind=${firstFail?.kind ?? '-'} "${(firstFail?.message ?? '').slice(0, 90)}"`;
    console.log(`${tag} ${cs.accept ? 'قبول' : 'رفض '} ${cs.id} — ${cs.why} → ${detail}`);
    if (pass) ok++;
    else bad.push(`${cs.id} — ${cs.why}`);
  }
  console.log(`\n${ok}/${CASES.length} passed`);
  if (bad.length) {
    console.log('FAILED:\n  ' + bad.join('\n  '));
    process.exitCode = 1;
  }
})();

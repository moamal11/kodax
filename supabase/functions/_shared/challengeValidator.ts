// ⚠️ ملف مولّد بواسطة scripts/build-verify-function.ts — لا تعدّله يدوياً
/**
 * Challenge Validator — التحقق من حلول التحديات
 *
 * المبادئ:
 * 1. الحكم على الحل بالتشغيل الفعلي مقابل حالات اختبار (مرئية + مخفية).
 * 2. المقارنة تتسامح مع التنسيق غير المؤثر (مسافات، أسطر فارغة، علامات
 *    الاقتباس، True/true) لكنها لا تتسامح مع اختلاف القيمة أو حالة الأحرف.
 * 3. اللغات التي لا يمكن تشغيلها داخل التطبيق (HTML/CSS/React/Dart/Dockerfile/
 *    Express) تُفحص بمتطلبات بنيوية صريحة معرّفة في كل تحدٍ (checks).
 * 4. رسائل واضحة تفرّق بين: خطأ كتابة، خطأ تشغيل، نتيجة خاطئة، انتهاء الوقت،
 *    ومشكلة في خادم التشغيل (ليست خطأ المستخدم).
 * 5. لا تُكشف مدخلات أو مخرجات الاختبارات المخفية.
 *
 * التدقيق الآلي لكل التحديات: npx tsx scripts/challenge-audit/audit.ts
 */

import { executeCode } from './codeExecution.ts';
import type {
  CodeExecutionRequest,
  CodeExecutionResult,
} from './codeExecution.ts';

/** المنفّذ قابل للاستبدال (للاختبارات الآلية في scripts/challenge-audit) */
export type CodeExecutor = (
  request: CodeExecutionRequest
) => Promise<CodeExecutionResult>;

export interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
  /** اختبار مخفي: يُشغَّل ولا تُعرض مدخلاته أو نتيجته المتوقعة للمستخدم */
  hidden?: boolean;
}

/** متطلب بنيوي (للغات التي لا تُشغَّل داخل التطبيق) */
export interface ChallengeCheck {
  /** تعبير نمطي (بدون /.../) يُطبَّق على الكود بعد حذف التعليقات */
  pattern: string;
  flags?: string;
  /** رسالة تشرح المتطلب للمستخدم */
  message: string;
  /** أقل عدد مرات للظهور (افتراضياً 1) */
  min?: number;
  /** true = يجب ألا يظهر هذا النمط */
  forbid?: boolean;
}

export type ResultKind =
  | 'pass'
  | 'wrong_output'
  | 'runtime_error'
  | 'syntax_error'
  | 'timeout'
  | 'service_error'
  | 'structure'
  | 'no_code';

export interface ValidationResult {
  passed: boolean;
  message: string;
  kind?: ResultKind;
  hidden?: boolean;
  description?: string;
  input?: string;
  actualOutput?: string;
  expectedOutput?: string;
  error?: string;
}

export interface ChallengeValidationResult {
  allPassed: boolean;
  results: ValidationResult[];
  totalTests: number;
  passedTests: number;
  /** تعذّر التحقق بسبب خادم التشغيل — ليس حكماً على كود المستخدم */
  serviceError?: boolean;
  /** نوع التحقق المستخدم */
  mode?: 'execution' | 'structural';
}

export interface ValidateOptions {
  execute?: CodeExecutor;
  checks?: ChallengeCheck[];
  /** اسم الدالة التي تُستدعى بمدخلات الاختبار (افتراضياً: أول دالة في الكود الابتدائي) */
  entryFunction?: string;
  /** 'structural' = تحقق بالمتطلبات فقط حتى لو كانت اللغة قابلة للتشغيل (مثل Express) */
  validation?: 'execution' | 'structural';
  /**
   * كود تهيئة يُحقن قبل كود المستخدم على نفس السطر الأول (فلا تتغيّر أرقام الأسطر)،
   * مثل بدائل وهمية لمكتبات غير متوفرة على خادم التشغيل (express، jsonwebtoken).
   */
  prelude?: string;
}

// ====================================================================
// =================== اللغات ========================================
// ====================================================================

export function normalizeLanguage(language: string): string {
  const l = (language || '').trim().toLowerCase();
  if (['node.js', 'nodejs', 'node', 'js', 'javascript'].includes(l))
    return 'javascript';
  if (['ts', 'typescript'].includes(l)) return 'typescript';
  if (['c++', 'cpp'].includes(l)) return 'cpp';
  if (['py', 'python'].includes(l)) return 'python';
  if (['jsx', 'react'].includes(l)) return 'react';
  return l;
}

/** لغات يمكن تشغيلها فعلياً عبر خادم التشغيل */
const EXECUTABLE = new Set(['python', 'javascript', 'cpp', 'java', 'sql']);

export function isExecutableLanguage(language: string): boolean {
  return EXECUTABLE.has(normalizeLanguage(language));
}

// ====================================================================
// =================== تنظيف الكود ====================================
// ====================================================================

/** حذف التعليقات حسب اللغة مع احترام النصوص بين علامات الاقتباس */
function stripComments(code: string, language: string): string {
  const lang = normalizeLanguage(language);
  if (lang === 'html')
    return code.replace(/<!--[\s\S]*?-->/g, '');
  if (lang === 'css') return code.replace(/\/\*[\s\S]*?\*\//g, '');
  if (lang === 'sql')
    return code.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  if (['python', 'dockerfile', 'git', 'bash', 'shell'].includes(lang)) {
    let out = '';
    let quote: string | null = null;
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      if (quote) {
        out += ch;
        if (ch === '\\') {
          out += code[++i] ?? '';
        } else if (code.startsWith(quote, i)) {
          if (quote.length === 3) {
            out += code.slice(i + 1, i + 3);
            i += 2;
          }
          quote = null;
        }
        continue;
      }
      if (lang === 'python' && (code.startsWith('"""', i) || code.startsWith("'''", i))) {
        quote = code.slice(i, i + 3);
        out += quote;
        i += 2;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        out += ch;
        continue;
      }
      if (ch === '#') {
        while (i < code.length && code[i] !== '\n') i++;
        out += '\n';
        continue;
      }
      out += ch;
    }
    // docstrings/strings المستقلة في سطر كامل تُعامل كتعليقات
    return out.replace(/^\s*("""[\s\S]*?"""|'''[\s\S]*?''')\s*$/gm, '');
  }
  // C-like: JS/TS/React/C++/Java/Dart — تعليقات JSX {/* ... */} أولاً
  code = code.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
  let out = '';
  let quote: string | null = null;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (quote) {
      out += ch;
      if (ch === '\\') out += code[++i] ?? '';
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      out += ch;
      continue;
    }
    if (ch === '/' && code[i + 1] === '/') {
      while (i < code.length && code[i] !== '\n') i++;
      out += '\n';
      continue;
    }
    if (ch === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      i = end === -1 ? code.length : end + 1;
      continue;
    }
    out += ch;
  }
  return out;
}

function extractExecutableCode(code: string, language: string): string {
  const lang = normalizeLanguage(language);
  let cleaned = stripComments(code, language);
  cleaned = cleaned
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)
    .join('\n');
  if (lang === 'python') cleaned = cleaned.replace(/^\s*pass\s*$/gm, '');
  return cleaned.trim();
}

/** هل غيّر المستخدم الكود فعلاً (بعيداً عن التعليقات والمسافات)؟ */
function hasMeaningfulChange(
  userCode: string,
  starterCode: string,
  language: string
): boolean {
  const norm = (c: string) =>
    extractExecutableCode(c, language).replace(/\s+/g, ' ').trim();
  const u = norm(userCode);
  return u.length > 0 && u !== norm(starterCode);
}

// ====================================================================
// =================== مدخلات الاختبار ================================
// ====================================================================

/** تقسيم الكود لعبارات على المستوى الأعلى (خارج الأقواس والنصوص) */
function splitTopLevel(code: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = '';
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (quote) {
      cur += ch;
      if (ch === '\\') cur += code[++i] ?? '';
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      cur += ch;
      continue;
    }
    if ('([{'.includes(ch)) depth++;
    if (')]}'.includes(ch)) depth--;
    if ((ch === ';' || ch === '\n') && depth === 0) {
      if (cur.trim()) parts.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

const PY_STATEMENT =
  /^(print\s*\(|for\s|while\s|if\s|elif\s|else\b|def\s|class\s|import\s|from\s|return\b|del\s|pass\b|raise\b|with\s|try\b|except\b|finally\b|assert\s|global\s|nonlocal\s|@)/;
const JS_STATEMENT =
  /^(const\s|let\s|var\s|function\b|class\s|if\s*\(|for\s*\(|while\s*\(|return\b|console\.|import\s|export\s|throw\s|try\b|switch\s*\(|do\b|async\s+function)/;
const CPP_STATEMENT =
  /^(?:(?:(?:unsigned|const|static)\s+)*(?:int|long|short|double|float|bool|char|string|auto|size_t|void)(?:\s+long)?\s*[*&]*\s+\w+\s*(?:=|;|\(|\{|\[|,|$)|(?:vector|map|set|unordered_map|unordered_set|pair|queue|stack|deque)\s*<.*>\s*[*&]*\s+\w+|[A-Z]\w*\s+\w+\s*(?:=|;|\(|\{|$)|for\s*\(|while\s*\(|if\s*\(|return\b|cout\b|std::)/;
// تعيين يبدأ باسم متغير (وليس نصاً مثل "name=ali")
const ASSIGNMENT =
  /^[A-Za-z_$][\w$.[\]'"\s,]*?\s*(\+|-|\*|\/|%|\/\/|\*\*)?=(?![=>])/;

function isStatement(stmt: string, lang: string): boolean {
  const s = stmt.trim();
  if (lang === 'python') return PY_STATEMENT.test(s) || ASSIGNMENT.test(s);
  if (lang === 'cpp') return CPP_STATEMENT.test(s) || ASSIGNMENT.test(s);
  return JS_STATEMENT.test(s) || ASSIGNMENT.test(s);
}

type InputKind = 'program' | 'script' | 'call' | 'args';

function classifyInput(input: string, lang: string): InputKind {
  const s = input.trim();
  if (!s) return 'program';
  const parts = splitTopLevel(s);
  if (parts.length > 1) return 'script';
  if (isStatement(parts[0], lang)) return 'script';
  // تعبير يبدأ باستدعاء دالة: f(1) أو f(x)["key"] أو len(f(x)) — يُطبع كما هو
  if (/^[A-Za-z_][\w.]*\s*\(/.test(s)) return 'call';
  // وصول لخاصية: packageJson.name أو config["port"]
  if (/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\]]+\])+$/.test(s)) return 'call';
  return 'args';
}

/** اسم الدالة الرئيسية (من الكود الابتدائي أولاً، ثم من كود المستخدم) */
function findEntryFunction(code: string, lang: string): string | null {
  let m: RegExpMatchArray | null = null;
  if (lang === 'python') {
    const all = [...code.matchAll(/^def\s+([A-Za-z]\w*)\s*\(/gm)];
    m = all.length ? all[0] : null;
  } else if (lang === 'javascript' || lang === 'typescript') {
    m =
      code.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/m) ||
      code.match(
        /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_]\w*\s*=>)/m
      );
  } else if (lang === 'cpp' || lang === 'java') {
    const re =
      /^(?:static\s+|inline\s+|public\s+|private\s+)*(?:const\s+)?(?:[\w:<>,]+[\s*&]+)+(\w+)\s*\([^;{)]*\)\s*(?:const\s*)?\{/gm;
    for (const x of code.matchAll(re)) {
      if (!['main', 'if', 'for', 'while', 'switch'].includes(x[1])) return x[1];
    }
  }
  return m ? m[1] : null;
}

// ====================================================================
// =================== مقارنة المخرجات ================================
// ====================================================================

function normalizeOutput(output: string): string {
  let n = (output ?? '').replace(/\r\n?/g, '\n');
  n = n
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
  n = n.replace(/[ \t]+/g, ' ');
  n = n.replace(/\[\s+/g, '[').replace(/\s+\]/g, ']');
  n = n.replace(/\{\s+/g, '{').replace(/\s+\}/g, '}');
  n = n.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  n = n.replace(/\s*,\s*/g, ', ').replace(/\s*:\s*/g, ': ');
  n = n.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
  n = n.replace(/\bNone\b/g, 'null').replace(/\bundefined\b/g, 'null');
  // 2.0 == 2 داخل القوائم والنتائج
  n = n.replace(/(\d)\.0+\b(?!\d)/g, '$1');
  n = n.replace(/'/g, '"');
  return n;
}

/** إزالة علامات اقتباس تحيط بالقيمة كلها: "abc" == abc */
function unquote(s: string): string {
  const m = s.match(/^"(.*)"$/s);
  return m ? m[1] : s;
}

function isNumber(s: string): boolean {
  return /^-?\d+(\.\d+)?(e[+-]?\d+)?$/i.test(s);
}

export function compareOutputs(actual: string, expected: string): boolean {
  const a = normalizeOutput(actual);
  const e = normalizeOutput(expected);
  if (a === e) return true;
  if (unquote(a) === unquote(e)) return true;
  if (isNumber(a) && isNumber(e)) {
    const na = parseFloat(a);
    const ne = parseFloat(e);
    return Math.abs(na - ne) <= 1e-6 * Math.max(1, Math.abs(ne));
  }
  // مخرجات إضافية (طباعة للتجربة) قبل النتيجة: نقارن آخر أسطر بعدد أسطر المتوقع
  const aLines = a.split('\n');
  const eLines = e.split('\n');
  if (aLines.length > eLines.length) {
    const tail = aLines.slice(-eLines.length).join('\n');
    if (tail === e || unquote(tail) === unquote(e)) return true;
    if (eLines.length === 1 && isNumber(tail) && isNumber(e))
      return Math.abs(parseFloat(tail) - parseFloat(e)) <= 1e-6 * Math.max(1, Math.abs(parseFloat(e)));
  }
  return false;
}

// ====================================================================
// =================== بناء كود الاختبار ==============================
// ====================================================================

/**
 * علامة تُطبع قبل مخرجات الاختبار نفسه: ما يطبعه كود المستخدم أثناء التجربة
 * (print في آخر الملف مثلاً) لا يُحسب ضمن النتيجة، وتصبح النتيجة الفارغة قابلة للقياس.
 */
const RESULT_MARK = '__KODAX_RESULT__';

/** المخرجات بعد آخر علامة (أو كل المخرجات إن لم تظهر العلامة) */
function resultOutput(out: string): string {
  const i = out.lastIndexOf(RESULT_MARK);
  if (i < 0) return out;
  return out.slice(i + RESULT_MARK.length).replace(/^\n/, '');
}

function pyWrapper(userCode: string, input: string, entry: string | null): string {
  const kind = classifyInput(input, 'python');
  if (kind === 'program') return userCode;

  // نمط شجرة البحث الثنائية القديم (insert + inorder) مع مدخل قائمة
  if (kind === 'args' && /def\s+insert\s*\(/.test(userCode) && /def\s+inorder\s*\(/.test(userCode)) {
    // الصنف الذي يحتوي insert = آخر صنف مُعرّف قبل def insert
    const insertAt = userCode.search(/def\s+insert\s*\(/);
    const before = [...userCode.matchAll(/class\s+(\w+)/g)].filter(
      (x) => (x.index ?? 0) < insertAt
    );
    const name = before.length ? before[before.length - 1][1] : 'BST';
    return `${userCode}\n\n_tree = ${name}()\nfor _val in ${input}:\n    _tree.insert(_val)\nprint("${RESULT_MARK}")\nprint(_tree.inorder())`;
  }

  if (kind === 'script') {
    const lines = input.replace(/\r\n?/g, '\n').split('\n');
    let lastIdx = lines.length - 1;
    while (lastIdx >= 0 && !lines[lastIdx].trim()) lastIdx--;
    const last = lines[lastIdx] ?? '';
    if (last && !/^\s/.test(last) && !isStatement(last, 'python')) {
      lines[lastIdx] = `print(${last.trim()})`;
    }
    return `${userCode}\n\nprint("${RESULT_MARK}")\n${lines.join('\n')}`;
  }
  const expr = kind === 'call' ? input : `${entry ?? 'solution'}(${input})`;
  // نحسب القيمة أولاً: ما تطبعه الدالة نفسها لا يختلط بالنتيجة
  return `${userCode}\n\n__kx_result = ${expr}\nprint("${RESULT_MARK}")\nprint(__kx_result)`;
}

const JS_FORMAT = `function __kxFormat(v) {
  if (typeof v === 'string') return v;
  if (v === undefined) return 'undefined';
  if (typeof v === 'function') return 'function';
  if (v instanceof Map) return JSON.stringify(Object.fromEntries(v));
  if (v instanceof Set) return JSON.stringify([...v]);
  if (typeof v === 'object' && v !== null) return JSON.stringify(v);
  return String(v);
}`;

function jsWrapper(userCode: string, input: string, entry: string | null): string {
  const kind = classifyInput(input, 'javascript');
  if (kind === 'program') return userCode;
  let body: string;
  if (kind === 'script') {
    const parts = splitTopLevel(input);
    const last = parts.pop() ?? '';
    const lastLine = isStatement(last, 'javascript')
      ? `${last};`
      : `console.log(__kxFormat(${last}));`;
    body = `console.log('${RESULT_MARK}');\n${parts.map((p) => `${p};`).join('\n')}\n${lastLine}`;
  } else {
    const expr = kind === 'call' ? input : `${entry ?? 'solution'}(${input})`;
    body = `const __kxResult = ${expr};\nconsole.log('${RESULT_MARK}');\nconsole.log(__kxFormat(__kxResult));`;
  }
  // الكود داخل async IIFE لدعم await في مدخلات الاختبار، مع طباعة الأخطاء غير المعالجة
  return `${userCode}\n\n${JS_FORMAT}\n;(async () => {\n${body}\n})().catch((e) => { console.error((e && e.name ? e.name + ': ' : '') + (e && e.message ? e.message : e)); process.exitCode = 1; });`;
}

/** حذف دالة main (مع محتواها) من كود C++/Java حتى نضيف main الخاص بالاختبار */
function removeMain(code: string): string {
  const m = code.match(/(?:int|void)\s+main\s*\([^)]*\)\s*\{/);
  if (!m || m.index === undefined) return code;
  let depth = 0;
  let i = m.index + m[0].length - 1;
  for (; i < code.length; i++) {
    if (code[i] === '{') depth++;
    if (code[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  return code.slice(0, m.index) + code.slice(i + 1);
}

const CPP_HEADERS = `#include <bits/stdc++.h>
using namespace std;
`;
const CPP_PRINT = `
template<typename T> void __kx_print(const T& v) { cout << v; }
inline void __kx_print(const string& v) { cout << v; }
inline void __kx_print(const char* v) { cout << v; }
template<typename T> void __kx_print(const vector<T>& v) {
  cout << "[";
  for (size_t i = 0; i < v.size(); i++) { if (i) cout << ", "; __kx_print(v[i]); }
  cout << "]";
}
`;
/** عدد أسطر الترويسة التي نضيفها قبل كود المستخدم (لتصحيح أرقام الأسطر في الأخطاء) */
const CPP_PREFIX_LINES = CPP_HEADERS.split('\n').length - 1;

function cppWrapper(userCode: string, input: string, entry: string | null): string {
  const kind = classifyInput(input, 'cpp');
  if (kind === 'program') return `${CPP_HEADERS}${userCode}`;
  const code = removeMain(userCode);
  let body: string;
  if (kind === 'script') {
    const parts = splitTopLevel(input);
    const last = parts.pop() ?? '';
    const lastLine = isStatement(last, 'cpp')
      ? `${last};`
      : `__kx_print(${last}); cout << endl;`;
    body = `${parts.map((p) => `${p};`).join('\n    ')}\n    ${lastLine}`;
  } else {
    const expr = kind === 'call' ? input : `${entry ?? 'solution'}(${input})`;
    const fn = kind === 'call' ? input.match(/^(\w+)/)?.[1] : entry;
    const isVoid = fn ? new RegExp(`void\\s+${fn}\\s*\\(`).test(code) : false;
    body = isVoid ? `${expr};` : `__kx_print(${expr}); cout << endl;`;
  }
  return `${CPP_HEADERS}${code}\n${CPP_PRINT}\nint main() {\n    ${body}\n    return 0;\n}\n`;
}

function javaWrapper(userCode: string, input: string, entry: string | null): string {
  const classMatch = userCode.match(/class\s+\w+\s*\{([\s\S]*)\}/);
  const members = removeMain(classMatch ? classMatch[1] : userCode);
  const kind = classifyInput(input, 'java');
  if (kind === 'program') return userCode.replace(/public\s+class\s+\w+/, 'public class Main');
  const expr = kind === 'call' ? input : `${entry ?? 'solution'}(${input})`;
  return `import java.util.*;\npublic class Main {\n${members}\n    public static void main(String[] args) {\n        System.out.println(${expr});\n    }\n}\n`;
}

function buildTestProgram(
  lang: string,
  userCode: string,
  input: string,
  entry: string | null
): string {
  switch (lang) {
    case 'python':
      return pyWrapper(userCode, input, entry);
    case 'javascript':
      return jsWrapper(userCode, input, entry);
    case 'cpp':
      return cppWrapper(userCode, input, entry);
    case 'java':
      return javaWrapper(userCode, input, entry);
    case 'sql':
      // مدخل الاختبار = إنشاء الجداول والبيانات، ثم استعلام المستخدم
      return `${input}\n\n${userCode}`;
    default:
      return userCode;
  }
}

// ====================================================================
// =================== تفسير الأخطاء ==================================
// ====================================================================

function describeError(
  lang: string,
  errorText: string,
  userLineCount = Infinity
): { kind: ResultKind; message: string } {
  const err = errorText.replace(/\r\n?/g, '\n');
  if (/timed? ?out|Timeout|Killed|time limit|SIGKILL|signal 9/i.test(err)) {
    return {
      kind: 'timeout',
      message: 'انتهى وقت التشغيل — تحقق من عدم وجود حلقة لا نهائية أو حل بطيء جداً',
    };
  }
  const lineNo = (() => {
    if (lang === 'python') {
      // Traceback يبدأ بسطر كود الاختبار؛ أعمق إطار داخل كود المستخدم هو مكان الخطأ
      const nums = [...err.matchAll(/line (\d+)/g)]
        .map((x) => parseInt(x[1], 10))
        .filter((n) => n <= userLineCount);
      return nums.length ? nums[nums.length - 1] : null;
    }
    const m =
      err.match(/line (\d+)/i) ||
      err.match(/prog\.\w+:(\d+)/) ||
      err.match(/main\.\w+:(\d+)/);
    if (!m) return null;
    let n = parseInt(m[1], 10);
    if (lang === 'cpp') n -= CPP_PREFIX_LINES;
    return n > 0 ? n : null;
  })();
  const lines = err.split('\n').map((l) => l.trim()).filter(Boolean);
  const isSyntax =
    (lang === 'python' && /SyntaxError|IndentationError|TabError/.test(err)) ||
    (lang === 'javascript' && /SyntaxError/.test(err)) ||
    ((lang === 'cpp' || lang === 'java') && /error:/.test(err)) ||
    (lang === 'sql' && /syntax error|parse error/i.test(err));
  const key =
    (isSyntax
      ? lines.find((l) => /Error|error:/.test(l))
      : [...lines].reverse().find((l) => /Error|Exception|error/.test(l))) ||
    lines[lines.length - 1] ||
    '';
  const clean = key
    .replace(/^.*?(prog|main)\.\w+:\d+:(\d+:)?\s*/, '')
    .replace(/^File .*$/, '')
    .slice(0, 180);
  const where = lineNo ? ` (السطر ${lineNo})` : '';
  return isSyntax
    ? { kind: 'syntax_error', message: `خطأ في كتابة الكود${where}: ${clean}` }
    : { kind: 'runtime_error', message: `خطأ أثناء التشغيل${where}: ${clean}` };
}

// ====================================================================
// =================== تشغيل اختبار واحد ==============================
// ====================================================================

async function runTestCase(
  lang: string,
  userCode: string,
  testCase: TestCase,
  entry: string | null,
  execute: CodeExecutor,
  prelude?: string
): Promise<ValidationResult> {
  const base = {
    hidden: !!testCase.hidden,
    description: testCase.description,
    input: testCase.hidden ? undefined : testCase.input,
    expectedOutput: testCase.hidden ? undefined : testCase.expectedOutput,
  };
  // سطر واحد قبل كود المستخدم ← أرقام أسطر الأخطاء تبقى صحيحة
  const code = prelude ? `${prelude.replace(/\s*\n\s*/g, ' ')};${userCode}` : userCode;
  const program = buildTestProgram(lang, code, testCase.input ?? '', entry);
  let result: CodeExecutionResult;
  try {
    result = await execute({ language: lang, code: program });
  } catch (e) {
    return {
      ...base,
      passed: false,
      kind: 'service_error',
      message: 'تعذّر تشغيل الكود الآن — تحقق من الإنترنت وحاول مرة أخرى',
    };
  }
  if (result.serviceError) {
    return {
      ...base,
      passed: false,
      kind: result.timedOut ? 'service_error' : 'service_error',
      message: 'تعذّر الوصول لخادم التشغيل — تحقق من الإنترنت وحاول مرة أخرى',
      error: result.error,
    };
  }
  const out = resultOutput((result.output ?? '').replace(/\r\n?/g, '\n'));
  const err = (result.error ?? '').trim();

  // خطأ حقيقي: البرنامج فشل (رمز خروج غير صفري) أو خطأ بدون أي مخرجات
  if (!result.success && err) {
    const d = describeError(lang, err, userCode.split('\n').length);
    // نص الخطأ الكامل قد يقتبس سطر الاختبار — لا يُكشف للاختبارات المخفية
    return { ...base, passed: false, kind: d.kind, message: d.message, error: testCase.hidden ? undefined : err.slice(0, 600) };
  }

  const expected = testCase.expectedOutput ?? '';
  if (compareOutputs(out, expected)) {
    return { ...base, passed: true, kind: 'pass', message: 'نجح', actualOutput: testCase.hidden ? undefined : out.trim() };
  }
  return {
    ...base,
    passed: false,
    kind: 'wrong_output',
    message: out.trim() ? 'النتيجة غير صحيحة' : 'لم يطبع الكود أي نتيجة — هل نسيت return أو print؟',
    actualOutput: testCase.hidden ? undefined : out.trim().slice(0, 500) || '(لا يوجد مخرجات)',
  };
}

// ====================================================================
// =================== المتطلبات البنيوية =============================
// ====================================================================

function runChecks(
  userCode: string,
  language: string,
  checks: ChallengeCheck[]
): ValidationResult[] {
  const code = stripComments(userCode, language);
  return checks.map((c) => {
    let count = 0;
    try {
      const flags = (c.flags ?? 'i').replace('g', '') + 'g';
      count = (code.match(new RegExp(c.pattern, flags)) || []).length;
    } catch {
      count = 0;
    }
    const ok = c.forbid ? count === 0 : count >= (c.min ?? 1);
    return {
      passed: ok,
      kind: ok ? 'pass' : 'structure',
      message: c.message,
      description: c.message,
    } as ValidationResult;
  });
}

// ====================================================================
// =================== CSS / REACT / HTML VALIDATION ==================
// ====================================================================

function countMatches(text: string, regex: RegExp): number {
  return (text.match(regex) || []).length;
}

interface StructuralReq {
  check: (code: string) => boolean;
  message: string;
}

function getHTMLRequirements(starterCode: string): StructuralReq[] {
  const s = starterCode.toLowerCase();
  const reqs: StructuralReq[] = [];

  // FORM
  if (
    s.includes('<form') &&
    (s.includes('email') ||
      s.includes('password') ||
      s.includes('البريد') ||
      s.includes('كلمة المرور'))
  ) {
    reqs.push({
      check: (c) => /<form[^>]*>/i.test(c),
      message: 'أضف عنصر <form>',
    });
    reqs.push({
      check: (c) => /<input[^>]*type\s*=\s*["']email["'][^>]*>/i.test(c),
      message: 'أضف حقل <input type="email">',
    });
    reqs.push({
      check: (c) => /<input[^>]*type\s*=\s*["']password["'][^>]*>/i.test(c),
      message: 'أضف حقل <input type="password">',
    });
    reqs.push({
      check: (c) =>
        /<button[^>]*type\s*=\s*["']submit["']/i.test(c) ||
        /<input[^>]*type\s*=\s*["']submit["']/i.test(c),
      message: 'أضف زر إرسال submit',
    });
    reqs.push({
      check: (c) => /required/i.test(c),
      message: 'أضف خاصية required للحقول المطلوبة',
    });
    return reqs;
  }

  // SEMANTIC
  if (
    (s.includes('class="header"') ||
      s.includes('class="nav"') ||
      s.includes('class="footer"')) &&
    (s.includes('دلالية') || s.includes('semantic'))
  ) {
    reqs.push({
      check: (c) => /<header[^>]*>/i.test(c),
      message: 'استبدل div بعنصر <header>',
    });
    reqs.push({
      check: (c) => /<nav[^>]*>/i.test(c),
      message: 'استبدل div بعنصر <nav>',
    });
    reqs.push({
      check: (c) => /<main[^>]*>/i.test(c),
      message: 'استبدل div بعنصر <main>',
    });
    reqs.push({
      check: (c) => /<footer[^>]*>/i.test(c),
      message: 'أضف عنصر <footer>',
    });
    return reqs;
  }

  // TABLE
  if (
    s.includes('<table') &&
    (s.includes('thead') || s.includes('رأس الجدول'))
  ) {
    reqs.push({
      check: (c) => /<thead[^>]*>/i.test(c),
      message: 'أضف <thead>',
    });
    reqs.push({
      check: (c) => /<tbody[^>]*>/i.test(c),
      message: 'أضف <tbody>',
    });
    reqs.push({
      check: (c) => /<tfoot[^>]*>/i.test(c),
      message: 'أضف <tfoot>',
    });
    reqs.push({
      check: (c) => countMatches(c, /<th[^>]*>/gi) >= 3,
      message: 'أضف 3 عناوين أعمدة <th>',
    });
    reqs.push({
      check: (c) => countMatches(c, /<td[^>]*>/gi) >= 9,
      message: 'أضف بيانات 3 طلاب على الأقل',
    });
    return reqs;
  }

  // MEDIA
  if (
    s.includes('فيديو') ||
    s.includes('صوت') ||
    s.includes('وسائط') ||
    (s.includes('video') && s.includes('audio'))
  ) {
    reqs.push({
      check: (c) => /<video[^>]*>/i.test(c),
      message: 'أضف عنصر <video>',
    });
    reqs.push({
      check: (c) => /controls/i.test(c),
      message: 'أضف خاصية controls',
    });
    reqs.push({
      check: (c) => /<audio[^>]*>/i.test(c),
      message: 'أضف عنصر <audio>',
    });
    reqs.push({
      check: (c) => countMatches(c, /<source[^>]*>/gi) >= 2,
      message: 'أضف عناصر <source>',
    });
    return reqs;
  }

  // NAV/DROPDOWN
  if (s.includes('<nav') && (s.includes('منسدلة') || s.includes('dropdown'))) {
    reqs.push({ check: (c) => /<nav[^>]*>/i.test(c), message: 'أضف <nav>' });
    reqs.push({
      check: (c) => countMatches(c, /<ul[^>]*>/gi) >= 2,
      message: 'أضف قائمتين <ul>',
    });
    reqs.push({
      check: (c) => countMatches(c, /<a[^>]*href/gi) >= 3,
      message: 'أضف 3 روابط على الأقل',
    });
    return reqs;
  }

  // FAQ/DETAILS
  if (
    s.includes('details') ||
    s.includes('summary') ||
    s.includes('أسئلة شائعة') ||
    s.includes('faq')
  ) {
    reqs.push({
      check: (c) => countMatches(c, /<details[^>]*>/gi) >= 3,
      message: 'أضف 3 عناصر <details>',
    });
    reqs.push({
      check: (c) => countMatches(c, /<summary[^>]*>/gi) >= 3,
      message: 'أضف 3 عناصر <summary>',
    });
    reqs.push({
      check: (c) => /<details[^>]*\bopen\b[^>]*>/i.test(c),
      message: 'اجعل سؤالا مفتوحا بخاصية open',
    });
    return reqs;
  }

  // GENERIC: require adding meaningful content
  reqs.push({
    check: (c) => {
      const added =
        countMatches(c, /<\w+[^>]*>/g) -
        countMatches(starterCode, /<\w+[^>]*>/g);
      return added >= 3;
    },
    message: 'أضف 3 عناصر HTML جديدة على الأقل',
  });
  return reqs;
}

function validateHTMLChallenge(
  userCode: string,
  starterCode: string,
  testCases: TestCase[]
): ChallengeValidationResult {
  const results: ValidationResult[] = [];
  const userExec = extractExecutableCode(userCode, 'html');
  const requirements = getHTMLRequirements(starterCode);

  let passedReqs = 0;
  const failedMsgs: string[] = [];
  for (const req of requirements) {
    if (req.check(userExec)) passedReqs++;
    else failedMsgs.push(`❌ ${req.message}`);
  }

  if (failedMsgs.length > 0) {
    for (const msg of failedMsgs) results.push({ passed: false, message: msg });
    if (passedReqs > 0)
      results.push({
        passed: true,
        message: `✅ ${passedReqs}/${requirements.length} متطلبات محققة`,
      });
    return {
      allPassed: false,
      results,
      totalTests: requirements.length,
      passedTests: passedReqs,
    };
  }

  for (const tc of testCases)
    results.push({
      passed: true,
      message: `✅ ${tc.description}: نجح`,
      expectedOutput: tc.expectedOutput,
    });
  return {
    allPassed: true,
    results,
    totalTests: testCases.length,
    passedTests: testCases.length,
  };
}

function validateCSSChallenge(
  userCode: string,
  starterCode: string,
  testCases: TestCase[]
): ChallengeValidationResult {
  const results: ValidationResult[] = [];
  const userExec = extractExecutableCode(userCode, 'css');
  const starterExec = extractExecutableCode(starterCode, 'css');

  const userDecls = userExec.match(/[\w-]+\s*:\s*[^;{}]+;/g) || [];
  const starterDecls = starterExec.match(/[\w-]+\s*:\s*[^;{}]+;/g) || [];
  const added = userDecls.length - starterDecls.length;

  if (added < 2) {
    for (const tc of testCases)
      results.push({
        passed: false,
        message: `❌ ${tc.description}: أضف المزيد من خصائص CSS (أضفت ${Math.max(0, added)} فقط)`,
        expectedOutput: tc.expectedOutput,
      });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  const openB = (userExec.match(/{/g) || []).length;
  const closeB = (userExec.match(/}/g) || []).length;
  if (openB !== closeB) {
    for (const tc of testCases)
      results.push({
        passed: false,
        message: `❌ ${tc.description}: خطأ في بناء الكود - تأكد من إغلاق {}`,
        expectedOutput: tc.expectedOutput,
      });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  const sLower = starterCode.toLowerCase();
  const errors: string[] = [];
  if (
    (sLower.includes('flex') || sLower.includes('flexbox')) &&
    !/display\s*:\s*flex/i.test(userExec)
  )
    errors.push('❌ استخدم display: flex');
  if (sLower.includes('grid') && !/display\s*:\s*grid/i.test(userExec))
    errors.push('❌ استخدم display: grid');
  if (sLower.includes('@media') && !/@media/i.test(userExec))
    errors.push('❌ استخدم @media للتصميم المتجاوب');
  if (
    (sLower.includes('animation') || sLower.includes('@keyframes')) &&
    !/animation|@keyframes|transition/i.test(userExec)
  )
    errors.push('❌ أضف animations أو transitions');

  if (errors.length > 0) {
    for (const e of errors) results.push({ passed: false, message: e });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  for (const tc of testCases)
    results.push({
      passed: true,
      message: `✅ ${tc.description}: نجح`,
      expectedOutput: tc.expectedOutput,
    });
  return {
    allPassed: true,
    results,
    totalTests: testCases.length,
    passedTests: testCases.length,
  };
}

function validateReactChallenge(
  userCode: string,
  starterCode: string,
  testCases: TestCase[]
): ChallengeValidationResult {
  const results: ValidationResult[] = [];
  const userExec = extractExecutableCode(userCode, 'react');
  const starterExec = extractExecutableCode(starterCode, 'react');

  if (userExec.length - starterExec.length < 10) {
    for (const tc of testCases)
      results.push({
        passed: false,
        message: `❌ ${tc.description}: أضف المزيد من الكود`,
        expectedOutput: tc.expectedOutput,
      });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  if (!/<\w+/.test(userExec)) {
    for (const tc of testCases)
      results.push({
        passed: false,
        message: `❌ ${tc.description}: يجب أن يحتوي على عناصر JSX`,
        expectedOutput: tc.expectedOutput,
      });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  if (!/return\s*\(/.test(userExec) && !/return\s*</.test(userExec)) {
    for (const tc of testCases)
      results.push({
        passed: false,
        message: `❌ ${tc.description}: يجب أن يرجع JSX (return)`,
        expectedOutput: tc.expectedOutput,
      });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  const errors: string[] = [];
  if (/useState/i.test(starterCode) && !/useState/.test(userExec))
    errors.push('❌ استخدم useState لإدارة الحالة');
  if (/useEffect/i.test(starterCode) && !/useEffect/.test(userExec))
    errors.push('❌ استخدم useEffect');
  if (
    /onClick|onChange|onSubmit/i.test(starterCode) &&
    !/onClick|onChange|onSubmit/.test(userExec)
  )
    errors.push('❌ أضف معالج أحداث');

  if (errors.length > 0) {
    for (const e of errors) results.push({ passed: false, message: e });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  for (const tc of testCases)
    results.push({
      passed: true,
      message: `✅ ${tc.description}: نجح`,
      expectedOutput: tc.expectedOutput,
    });
  return {
    allPassed: true,
    results,
    totalTests: testCases.length,
    passedTests: testCases.length,
  };
}


// ====================================================================
// =================== نقطة الدخول الرئيسية ===========================
// ====================================================================

export async function validateChallenge(
  userCode: string,
  starterCode: string,
  language: string,
  testCases: TestCase[],
  optionsOrExecutor?: ValidateOptions | CodeExecutor
): Promise<ChallengeValidationResult> {
  const options: ValidateOptions =
    typeof optionsOrExecutor === 'function'
      ? { execute: optionsOrExecutor }
      : optionsOrExecutor ?? {};
  const execute = options.execute ?? executeCode;
  const lang = normalizeLanguage(language);

  // 1. هل كتب المستخدم شيئاً فعلاً؟
  if (!hasMeaningfulChange(userCode, starterCode, language)) {
    return {
      allPassed: false,
      results: [
        {
          passed: false,
          kind: 'no_code',
          message: 'اكتب حلك أولاً — الكود مطابق للكود الابتدائي أو يحتوي على تعليقات فقط',
        },
      ],
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  // 2. تحقق بنيوي بمتطلبات صريحة (للغات التي لا تُشغَّل، أو عند تعريف checks)
  if (
    options.checks?.length &&
    (options.validation === 'structural' || !EXECUTABLE.has(lang))
  ) {
    const results = runChecks(userCode, language, options.checks);
    const passed = results.filter((r) => r.passed).length;
    return {
      allPassed: passed === results.length,
      results,
      totalTests: results.length,
      passedTests: passed,
      mode: 'structural',
    };
  }

  // 3. لغات بنيوية بدون متطلبات معرّفة — فحوصات عامة (احتياطية)
  if (lang === 'css')
    return { ...validateCSSChallenge(userCode, starterCode, testCases), mode: 'structural' };
  if (lang === 'html')
    return { ...validateHTMLChallenge(userCode, starterCode, testCases), mode: 'structural' };
  if (lang === 'react')
    return { ...validateReactChallenge(userCode, starterCode, testCases), mode: 'structural' };
  if (!EXECUTABLE.has(lang)) {
    return {
      allPassed: false,
      results: [
        {
          passed: false,
          kind: 'service_error',
          message: `لا يمكن التحقق من حلول ${language} داخل التطبيق حالياً`,
        },
      ],
      totalTests: testCases.length,
      passedTests: 0,
      serviceError: true,
    };
  }

  // 4. التشغيل الفعلي
  const entry =
    options.entryFunction ||
    findEntryFunction(starterCode, lang) ||
    findEntryFunction(userCode, lang);

  const results: ValidationResult[] = [];
  for (const tc of testCases) {
    const r = await runTestCase(lang, userCode, tc, entry, execute, options.prelude);
    results.push(r);
    // خطأ في كتابة الكود أو مشكلة في الخادم: كل الاختبارات ستفشل بنفس السبب
    if (r.kind === 'syntax_error' || r.kind === 'service_error') {
      const passedTests = results.filter((x) => x.passed).length;
      return {
        allPassed: false,
        results: [r],
        totalTests: testCases.length,
        passedTests,
        serviceError: r.kind === 'service_error',
        mode: 'execution',
      };
    }
  }

  // متطلبات إضافية للغات القابلة للتشغيل (مثلاً: بدون استخدام مكتبة معينة)
  if (options.checks?.length) {
    results.push(...runChecks(userCode, language, options.checks));
  }

  const passedTests = results.filter((r) => r.passed).length;
  return {
    allPassed: passedTests === results.length,
    results,
    totalTests: results.length,
    passedTests,
    mode: 'execution',
  };
}

export function quickValidate(
  userCode: string,
  starterCode: string,
  language: string
): { valid: boolean; message: string } {
  if (!hasMeaningfulChange(userCode, starterCode, language)) {
    return {
      valid: false,
      message: 'اكتب حلك أولاً — الكود مطابق للكود الابتدائي أو يحتوي على تعليقات فقط',
    };
  }
  return { valid: true, message: 'الكود جاهز للتشغيل' };
}

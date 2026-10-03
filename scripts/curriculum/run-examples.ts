/**
 * تشغيل أمثلة الكود في الدروس فعلياً.
 *  - Python: محلياً (مع مدخلات تجريبية لـ input())
 *  - JavaScript نقي (بدون DOM/React/مكتبات خارجية): محلياً بـ node
 *  - C++ (برنامج كامل فيه main): على Wandbox
 *  - SQL مكتفٍ بذاته (فيه CREATE TABLE): على SQLite عبر Python
 *  - HTML: تدقيق بـ html-validate، و CSS: تحليل نحوي بـ css-tree
 *    (الأداتان مثبتتان خارج المشروع: KX_TOOLS أو %TEMP%/kxtools — npm i html-validate@9 css-tree@3)
 * أي شيء آخر يُسجَّل "غير قابل للتشغيل" ولا يُحسب ناجحاً.
 *
 *   npx tsx scripts/curriculum/run-examples.ts [courseId...] [--json out.json]
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { ALL_LESSONS } from '../../src/constants/courseData';

type Status = 'pass' | 'compiled' | 'expected' | 'fail' | 'skip';
type Result = { lesson: string; course: string; source: string; lang: string; status: Status; reason?: string; output?: string };

const CACHE = join(__dirname, '.cache');
if (!existsSync(CACHE)) mkdirSync(CACHE, { recursive: true });

function norm(lang?: string): string {
  const l = (lang || '').toLowerCase();
  if (['py', 'python', 'python3'].includes(l)) return 'python';
  if (['js', 'javascript', 'node', 'nodejs'].includes(l)) return 'javascript';
  if (['cpp', 'c++', 'cc'].includes(l)) return 'cpp';
  if (['sql', 'sqlite', 'postgresql', 'postgres', 'mysql'].includes(l)) return 'sql';
  return l || 'unknown';
}

function blocks(content: string): { lang: string; code: string }[] {
  const out: { lang: string; code: string }[] = [];
  // مثل محلّل LessonContent: السطر الذي يبدأ بـ ``` (اللغة في نفس السطر فقط)
  const re = /```[ \t]*([\w+#.-]*)[ \t]*\r?\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) out.push({ lang: m[1], code: m[2] });
  return out;
}

/** رأس الرسالة (سطر الخطأ في node) وذيلها (آخر traceback في Python) */
const clip = (t: string) => (t.length > 2400 ? t.slice(0, 1200) + '\n…\n' + t.slice(-1200) : t);

function run(cmd: string, args: string[], input = '', cwd?: string) {
  const r = spawnSync(cmd, args, { input, cwd, timeout: cmd === 'python' ? 90000 : 15000, encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', MPLBACKEND: 'Agg' } });
  // حلقة لا نهائية تطبع بلا توقف تملأ الذاكرة المؤقتة (ENOBUFS) قبل انتهاء المهلة
  const timedOut = ['ETIMEDOUT', 'ENOBUFS'].includes((r.error as any)?.code);
  return { ok: r.status === 0 && !timedOut, out: (r.stdout || '').slice(0, 400), err: timedOut ? 'TIMEOUT' : clip(r.stderr || '') };
}

/** مدخلات واقعية للأمثلة التي تستخدم input() (الافتراضي أدناه لغيرها) */
const STDIN: Record<string, string> = {
  'py-4': 'Ahmed\n25\n1.75\n5\n3\n4 9\n12\n',
  'py-4:block3': '4 9\n', // هذه الكتلة تقرأ رقمين في سطر واحد
  'py-7': 'abc\n30\n5\n-2\nx\n10\n0\n',
  'py-basics-project-guess': '50\n25\nabc\n12\n18\n6\n3\n1\n9\nلا\n',
  'py-basics-final-project': '2\n4\n3\nمنى\n3\nزيد\n1\nسارة\n150\n77\n2\n9\n5\n',
};
const DEFAULT_STDIN = '5\n3\nAhmed\n10\n2\n7\n1\nq\n';
let currentLesson = '';
/** الكتلة الحالية: مدخلات خاصة بكتلة واحدة عبر STDIN['lesson:blockN'] */
let currentSource = '';

const PY_THIRD_PARTY = /^\s*(import|from)\s+(tensorflow|keras|torch|requests|flask|django|fastapi|scapy|nmap|cv2|PIL|seaborn|scipy|transformers|nltk|spacy|bs4|selenium|aiohttp|pytest|paramiko|cryptography|jwt|bcrypt|pymongo|sqlalchemy|redis|boto3)\b/m;
/** هل فشل السطر عمداً؟ (السطر الفاشل نفسه فيه تعليق يذكر الخطأ المتوقع) */
function expectedFailure(code: string, err: string, file: string): boolean {
  const re = new RegExp(file.replace('.', '\\.') + '"?(?:, line |:)(\\d+)', 'g');
  let m: RegExpExecArray | null;
  const lines = code.split('\n');
  // أي سطر تذكره رسالة الخطأ (الخطأ نفسه أو الملاحظات/الاستدعاءات المرافقة) عليه تعليق يوثّق الخطأ
  while ((m = re.exec(err))) {
    const line = lines[Number(m[1]) - 1] ?? '';
    if (/(#|\/\/|<!--|\/\*).*(Error|خطأ|❌|Exception|StopIteration|لا يمكن)/.test(line)) return true;
  }
  return false;
}

function runPython(code: string): Pick<Result, 'status' | 'reason' | 'output'> {
  if (PY_THIRD_PARTY.test(code)) {
    // مكتبة غير مثبتة هنا (TensorFlow...): فحص الصياغة فقط — لا يُحسب "نجاحاً"
    const d = mkdtempSync(join(tmpdir(), 'kx-py-'));
    try {
      writeFileSync(join(d, 'main.py'), code);
      const r = run('python', ['-m', 'py_compile', 'main.py'], '', d);
      return r.ok ? { status: 'compiled', reason: 'third-party library — syntax OK (not executed)' } : { status: 'fail', reason: 'SYNTAX: ' + r.err.trim().split('\n').slice(-2).join(' | ') };
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  }
  if (/^\s*(\$|pip |python -m|>>>)/m.test(code)) return { status: 'skip', reason: 'shell/REPL snippet' };
  const dir = mkdtempSync(join(tmpdir(), 'kx-py-'));
  try {
    writeFileSync(join(dir, 'main.py'), code);
    const r = run('python', ['main.py'], STDIN[`${currentLesson}:${currentSource}`] ?? STDIN[currentLesson] ?? DEFAULT_STDIN, dir);
    if (r.ok) return { status: 'pass', output: r.out };
    if (/ModuleNotFoundError/.test(r.err)) return { status: 'skip', reason: 'missing module: ' + (r.err.match(/No module named '([^']+)'/)?.[1] ?? '?') };
    if (/FileNotFoundError/.test(r.err) && /open\(/.test(code)) return { status: 'skip', reason: 'needs external file' };
    if (expectedFailure(code, r.err, 'main.py')) return { status: 'expected', reason: r.err.trim().split('\n').slice(-1)[0] };
    if (r.err === 'TIMEOUT' && /(لا نهائية|infinite)/i.test(code)) return { status: 'expected', reason: 'documented infinite loop' };
    return { status: 'fail', reason: r.err.trim().split('\n').slice(-2).join(' | ') };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const JS_NOT_PURE = /\b(import\.meta|document|window|localStorage|sessionStorage|navigator|alert\s*\(|prompt\s*\(|confirm\s*\(|fetch\s*\(|React|useState|useEffect|JSX|<\w+[^>]*\/?>|express\(|app\.listen|mongoose|supabase|firebase|axios|process\.env|import\s.+from\s+['"][^.]|require\(['"](?!node:|fs|path|os|events|util|crypto|https?|stream|readline|zlib|assert|url)['"]?)/;
function runJs(code: string): Pick<Result, 'status' | 'reason' | 'output'> {
  // JSX (React / React Native): فحص صياغة فقط
  if (/<[A-Z][\w.]*[\s>/]|<\/[A-Za-z][\w.]*>|<>/.test(code)) return checkSyntaxEsbuild(code, 'jsx');
  // وحدات ESM (import/export نسبية بين ملفات): فحص صياغة كوحدة فقط
  if (/^\s*(import\s[\s\S]*?from\s|import\s+['"]|import\s*\(|export\s)/m.test(code) && !/<\w+[^>]*>/.test(code)) {
    const dir = mkdtempSync(join(tmpdir(), 'kx-js-'));
    try {
      writeFileSync(join(dir, 'main.mjs'), code);
      const r = run('node', ['--check', 'main.mjs'], '', dir);
      return r.ok ? { status: 'skip', reason: 'ES module across files — syntax OK' } : { status: 'fail', reason: 'SYNTAX: ' + r.err.trim().split('\n').slice(0, 5).join(' | ') };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  if (JS_NOT_PURE.test(code)) {
    // فحص صياغة فقط للكود غير النقي إن كان JS عادياً (بدون JSX/import)
    if (/<\w+[^>]*>|^\s*import\s/m.test(code)) return checkSyntaxEsbuild(code, 'jsx');
    const dir = mkdtempSync(join(tmpdir(), 'kx-js-'));
    try {
      writeFileSync(join(dir, 'main.js'), code);
      const r = run('node', ['--check', 'main.js'], '', dir);
      return r.ok ? { status: 'skip', reason: 'browser/framework code — syntax OK' } : { status: 'fail', reason: 'SYNTAX: ' + r.err.trim().split('\n').slice(0, 5).join(' | ') };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  const dir = mkdtempSync(join(tmpdir(), 'kx-js-'));
  try {
    writeFileSync(join(dir, 'main.js'), code);
    const r = run('node', ['main.js'], '', dir);
    if (r.ok) return { status: 'pass', output: r.out };
    if (expectedFailure(code, r.err, 'main.js')) return { status: 'expected', reason: r.err.trim().split('\n').find((x) => /Error/.test(x)) };
    return { status: 'fail', reason: r.err.trim().split('\n').slice(0, 5).join(' | ') };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function wandbox(compiler: string, code: string, stdin = '') {
  const key = createHash('sha1').update(compiler + '\0' + code + '\0' + stdin).digest('hex');
  const f = join(CACHE, key + '.json');
  if (existsSync(f)) return JSON.parse(readFileSync(f, 'utf8'));
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compiler, code, stdin, save: false, 'compiler-option-raw': '-std=c++20\n-pthread' }),
      });
      if (res.ok) {
        const d = await res.json();
        // أعطال بنية Wandbox نفسها ليست نتيجة للكود: أعد المحاولة ولا تخزّنها
        if (/OCI runtime|Resource temporarily unavailable/.test(`${d.program_error ?? ''}${d.compiler_error ?? ''}`)) {
          await new Promise((r) => setTimeout(r, 2500));
          continue;
        }
        writeFileSync(f, JSON.stringify(d));
        return d;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
}

const CPP_HEADER = '#include <bits/stdc++.h>\nusing namespace std;\n';

/** سياق مقتطفات C++ في نفس الدرس: تعريفات على مستوى الملف، وجمل داخل main */
const cppCtx = { globals: [] as string[], stmts: [] as string[] };

/** مقتطف بدون main: يُترجم داخل main أو على مستوى الملف مع ما سبقه من مقتطفات (فحص ترجمة فقط) */
/** يفصل مقتطفاً مختلطاً: تعريفات (دوال/أصناف/include) على مستوى الملف، والباقي جمل داخل main */
function splitCppMixed(code: string): { defs: string; stmts: string } | null {
  const header = /^\s*((template\s*<.*>\s*)?(struct|class|enum)\b|#include|using\s|(?!(if|for|while|switch|return|else)\b)[\w:<>,*&\s]+\s+[\w:~]+\s*\([^;]*\)\s*(const)?\s*(noexcept)?\s*(override)?\s*\{?\s*(\/\/.*)?$)/;
  const defs: string[] = [];
  const stmts: string[] = [];
  let depth = 0;
  let inDef = false;
  for (const line of code.split('\n')) {
    if (depth === 0 && !inDef && header.test(line)) inDef = true;
    (inDef ? defs : stmts).push(line);
    for (const ch of line.replace(/\/\/.*$/, '').replace(/"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/g, '')) {
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }
    if (inDef && depth === 0 && (/[;}]\s*(\/\/.*)?$/.test(line) || /^\s*(#include|using\s)/.test(line))) inDef = false;
  }
  if (!defs.length || !stmts.some((s) => s.trim())) return null;
  return { defs: defs.join('\n'), stmts: stmts.join('\n') };
}

async function compileCppSnippet(code: string): Promise<Pick<Result, 'status' | 'reason' | 'output'>> {
  const mixed = splitCppMixed(code);
  type Form = { kind: 'stmt' | 'global' | 'mixed'; alone: boolean; src: string };
  const build = (globals: string, stmts: string): Form[] => {
    const out: Form[] = [
      { kind: 'stmt', alone: false, src: `${CPP_HEADER}${globals}\nint main() {\n${stmts}\n${code}\nreturn 0;\n}\n` },
      { kind: 'global', alone: false, src: `${CPP_HEADER}${globals}\n${code}\nint main() {}\n` },
    ];
    if (mixed) out.push({ kind: 'mixed', alone: false, src: `${CPP_HEADER}${globals}\n${mixed.defs}\nint main() {\n${stmts}\n${mixed.stmts}\nreturn 0;\n}\n` });
    return out;
  };
  const withCtx = build(cppCtx.globals.join('\n'), cppCtx.stmts.join('\n'));
  // ثم بدون سياق: المقتطف مستقل بذاته (قد يعيد تعريف متغير من مقتطف سابق)
  const forms: Form[] = cppCtx.globals.length || cppCtx.stmts.length ? [...withCtx, ...build('', '').map((f) => ({ ...f, alone: true }))] : withCtx;
  let firstErr = '';
  for (const f of forms) {
    const d = await wandbox('gcc-head', f.src);
    if (!d) return { status: 'skip', reason: 'wandbox unreachable' };
    const err = d.compiler_error || '';
    if (!err.includes('error:')) {
      if (!f.alone) {
        if (f.kind === 'stmt') cppCtx.stmts.push(code);
        else if (f.kind === 'global') cppCtx.globals.push(code);
        else if (mixed) { cppCtx.globals.push(mixed.defs); cppCtx.stmts.push(mixed.stmts); }
      }
      return { status: 'compiled', reason: `snippet compiles as ${f.kind}${f.alone ? ' (standalone)' : ''} (not executed)` };
    }
    if (expectedFailure(f.src, err, 'prog.cc')) return { status: 'expected', reason: 'documented compile error' };
    if (!firstErr) firstErr = err;
  }
  return { status: 'fail', reason: 'SNIPPET: ' + firstErr.split('\n').filter((l: string) => /error:/.test(l)).slice(0, 2).join(' | ') };
}

async function runCpp(code: string): Promise<Pick<Result, 'status' | 'reason' | 'output'>> {
  if (!/\bint\s+main\s*\(/.test(code)) return compileCppSnippet(code);
  const d = await wandbox('gcc-head', code, '5\n3\nAhmed\n10\n');
  if (!d) return { status: 'skip', reason: 'wandbox unreachable' };
  if (d.status === '0') return { status: 'pass', output: (d.program_output || '').slice(0, 300) };
  if (expectedFailure(code, (d.compiler_error || '') + (d.program_error || ''), 'prog.cc')) return { status: 'expected', reason: 'documented error' };
  return { status: 'fail', reason: ((d.compiler_error || '') + (d.program_error || '')).split('\n').filter((l: string) => /error|Error|terminate/.test(l)).slice(0, 3).join(' | ') || `exit ${d.status}` };
}

function runSql(code: string): Pick<Result, 'status' | 'reason' | 'output'> {
  if (!/CREATE\s+TABLE/i.test(code)) return { status: 'skip', reason: 'not self-contained (no CREATE TABLE)' };
  if (/\b(AUTO_INCREMENT|ENGINE=)/i.test(code)) return { status: 'skip', reason: 'MySQL-specific syntax' };
  const dir = mkdtempSync(join(tmpdir(), 'kx-sql-'));
  // صيغة PostgreSQL ← تشغيل فعلي على PGlite (PostgreSQL مُترجم إلى WASM)
  if (/\b(SERIAL|BIGSERIAL|NOW\(\)|ILIKE|RETURNING|JSONB|UUID|gen_random_uuid|GENERATED\s+ALWAYS|TIMESTAMPTZ|CREATE\s+(OR\s+REPLACE\s+)?FUNCTION|LANGUAGE\s+plpgsql|ON\s+CONFLICT)\b|::/i.test(code)) {
    try {
      // SQL خاص بـ Supabase: مخطط auth بديل مبسّط (الأدوار و auth.uid و auth.users) ليُنفَّذ على PostgreSQL حقيقي
      const supabaseStub = /auth\.(uid|users|jwt)|\bTO\s+(authenticated|anon)\b/i.test(code)
        ? "CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth; GRANT USAGE ON SCHEMA auth TO anon, authenticated;\nCREATE TABLE auth.users (id uuid PRIMARY KEY, email text);\nCREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $$;\n"
        : '';
      writeFileSync(join(dir, 'q.sql'), supabaseStub + code);
      const pgrun = join(TOOLS, 'pgrun.mjs');
      if (!existsSync(pgrun)) return { status: 'skip', reason: 'PGlite runner not installed' };
      const r = run('node', [pgrun, join(dir, 'q.sql')], '', dir);
      return r.ok ? { status: 'pass', reason: 'PostgreSQL (PGlite)' } : { status: 'fail', reason: r.err.trim().split('\n').find((l) => l.includes('PG ERROR')) ?? r.err.trim().split('\n').slice(-1)[0] };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  try {
    writeFileSync(join(dir, 'q.sql'), code);
    writeFileSync(join(dir, 'run.py'), "import sqlite3,sys\nc=sqlite3.connect(':memory:')\nc.executescript(open('q.sql',encoding='utf-8').read())\nprint('ok')\n");
    const r = run('python', ['run.py'], '', dir);
    return r.ok ? { status: 'pass' } : { status: 'fail', reason: r.err.trim().split('\n').slice(-1)[0] };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}


// ===== HTML و CSS =====
const TOOLS = process.env.KX_TOOLS || join(tmpdir(), 'kxtools');
const toolRequire = createRequire(join(TOOLS, 'package.json'));
let htmlValidator: any = null;
function getHtmlValidator() {
  if (htmlValidator !== null) return htmlValidator;
  try {
    const { HtmlValidate } = toolRequire('html-validate');
    htmlValidator = new HtmlValidate({
      extends: ['html-validate:recommended'],
      rules: {
        'no-trailing-whitespace': 'off',
        'no-inline-style': 'off',
        'require-sri': 'off',
        'long-title': 'off',
        'attribute-boolean-style': 'off',
        'no-redundant-role': 'off',
        'heading-level': 'off',
        'void-style': 'off',
        'doctype-style': 'off',
        'no-raw-characters': 'off',
        'tel-non-breaking': 'off',
        // مربعات الاختيار بنفس الاسم صحيحة في HTML
        'form-dup-name': ['error', { shared: ['radio', 'checkbox', 'button', 'reset', 'submit'] }],
      },
    });
  } catch {
    htmlValidator = false;
  }
  return htmlValidator;
}

async function runHtml(code: string): Promise<Pick<Result, 'status' | 'reason' | 'output'>> {
  const hv = getHtmlValidator();
  if (!hv) return { status: 'skip', reason: 'html-validate not installed' };
  if (code.trim().split('\n').length === 1 && /^\s*<html[\s>]/i.test(code)) return { status: 'skip', reason: 'single-tag illustration' };
  const full = /<!DOCTYPE|<html[\s>]/i.test(code);
  const head = '<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="UTF-8">\n<title>t</title>\n';
  let doc = code;
  if (!full) {
    if (/<body[\s>]/i.test(code)) doc = `${head}</head>\n${code}\n</html>\n`; // مقتطف يبدأ بـ body
    else if (/^\s*<(meta|link|title|script|base)\b/i.test(code)) doc = `${head}${code}\n</head>\n<body>\n</body>\n</html>\n`; // عناصر head
    else doc = `${head}</head>\n<body>\n${code}\n</body>\n</html>\n`;
  }
  const report = await hv.validateString(doc);
  const errors = report.results.flatMap((r: any) => r.messages).filter((m: any) => m.severity === 2);
  if (!errors.length) return { status: 'pass', reason: full ? 'valid document' : 'valid fragment' };
  if (errors.every((m: any) => expectedFailure(doc, `prog.cc:${m.line}:1: error:`, 'prog.cc'))) return { status: 'expected', reason: 'documented invalid markup' };
  return { status: 'fail', reason: errors.slice(0, 3).map((m: any) => `L${m.line} ${m.ruleId}: ${m.message}`).join(' | ') };
}

/** فحص صياغة JSX/TypeScript بـ esbuild (بلا تنفيذ: الكود يحتاج متصفحاً أو React) */
function checkSyntaxEsbuild(code: string, loader: 'jsx' | 'tsx'): Pick<Result, 'status' | 'reason' | 'output'> {
  let esbuild: any;
  try {
    esbuild = toolRequire('esbuild');
  } catch {
    return { status: 'skip', reason: 'esbuild not installed' };
  }
  try {
    esbuild.transformSync(code, { loader, jsx: 'automatic', format: 'esm', logLevel: 'silent' });
    return { status: 'compiled', reason: `${loader} syntax OK (not executed)` };
  } catch (e: any) {
    const errs = (e.errors || []).slice(0, 2).map((x: any) => `L${x.location?.line}: ${x.text}`);
    const lines = code.split('\n');
    if ((e.errors || []).some((x: any) => /(\/\/|\/\*).*(Error|خطأ|❌)/.test(lines[(x.location?.line ?? 0) - 1] ?? ''))) return { status: 'expected', reason: 'documented syntax error' };
    return { status: 'fail', reason: 'SYNTAX: ' + errs.join(' | ') };
  }
}

function runCss(code: string): Pick<Result, 'status' | 'reason' | 'output'> {
  let csstree: any;
  try {
    csstree = toolRequire('css-tree');
  } catch {
    return { status: 'skip', reason: 'css-tree not installed' };
  }
  const errs: string[] = [];
  // مقتطف بلا محددات (خصائص فقط) يُغلَّف داخل قاعدة
  const src = /\{/.test(code) ? code : `x {\n${code}\n}`;
  csstree.parse(src, { positions: true, onParseError: (e: any) => errs.push(`L${e.line}: ${e.message}`) });
  return errs.length ? { status: 'fail', reason: 'CSS: ' + errs.slice(0, 3).join(' | ') } : { status: 'pass', reason: 'parses' };
}

(async () => {
  const args = process.argv.slice(2);
  const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
  const only = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--json');
  const lessons = ALL_LESSONS.filter((l) => !only.length || only.includes(l.courseId) || only.includes(l.id));
  const results: Result[] = [];
  for (const l of lessons) {
    const items: { source: string; lang: string; code: string }[] = [];
    if (l.codeExample?.trim()) items.push({ source: 'codeExample', lang: norm(l.language), code: l.codeExample });
    blocks(l.content || '').forEach((b, i) => items.push({ source: `block${i + 1}`, lang: norm(b.lang || l.language), code: b.code }));
    currentLesson = l.id;
    cppCtx.globals = [];
    cppCtx.stmts = [];
    // كتل المحتوى تبني على ما قبلها في نفس الدرس: كل كتلة تُشغَّل مع الكتل السابقة الناجحة
    const context: Record<string, string[]> = {};
    for (const it of items) {
      let r: Pick<Result, 'status' | 'reason' | 'output'>;
      const isBlock = it.source !== 'codeExample';
      currentSource = it.source;
      const prior = isBlock ? (context[it.lang] ?? []).join('\n') : '';
      const code = prior ? `${prior}\n${it.code}` : it.code;
      if (it.lang === 'python') r = runPython(code);
      else if (it.lang === 'javascript') r = runJs(code);
      else if (it.lang === 'cpp') r = await runCpp(it.code);
      else if (it.lang === 'sql') r = runSql(it.code);
      else if (it.lang === 'html') r = await runHtml(it.code);
      else if (it.lang === 'css') r = runCss(it.code);
      else if (['jsx', 'tsx', 'typescript', 'ts'].includes(it.lang)) r = checkSyntaxEsbuild(it.code, it.lang === 'jsx' ? 'jsx' : 'tsx');
      else r = { status: 'skip', reason: `language ${it.lang} not runnable here` };
      // فشل مع السياق؟ جرّب الكتلة وحدها (قد تعيد تعريف متغير من كتلة سابقة عمداً)
      if (prior && (it.lang === 'python' || it.lang === 'javascript') && r.status === 'fail') {
        const alone = it.lang === 'python' ? runPython(it.code) : runJs(it.code);
        if (alone.status !== 'fail') r = { ...alone, reason: [alone.reason, 'standalone'].filter(Boolean).join(' — ') };
        if (alone.status === 'pass') { results.push({ lesson: l.id, course: l.courseId, source: it.source, lang: it.lang, ...r }); continue; }
      }
      if (isBlock && (r.status === 'pass' || (it.lang === 'python' && r.status === 'compiled'))) (context[it.lang] ??= []).push(it.code);
      results.push({ lesson: l.id, course: l.courseId, source: it.source, lang: it.lang, ...r });
    }
  }
  const by = (s: Status) => results.filter((r) => r.status === s).length;
  const courses = [...new Set(results.map((r) => r.course))];
  for (const c of courses) {
    const rs = results.filter((r) => r.course === c);
    console.log(`${c.padEnd(26)} examples=${String(rs.length).padStart(3)} pass=${String(rs.filter((r) => r.status === 'pass').length).padStart(3)} compiled=${rs.filter((r) => r.status === 'compiled').length} fail=${String(rs.filter((r) => r.status === 'fail').length).padStart(3)} skip=${rs.filter((r) => r.status === 'skip').length}`);
  }
  console.log(`\nTOTAL examples=${results.length} pass=${by('pass')} compiledOnly=${by('compiled')} expectedError=${by('expected')} fail=${by('fail')} skip=${by('skip')}`);
  for (const r of results.filter((x) => x.status === 'fail')) console.log(`FAIL ${r.lesson} [${r.lang} ${r.source}] ${r.reason}`);
  if (jsonOut) writeFileSync(jsonOut, JSON.stringify(results, null, 1));
})();

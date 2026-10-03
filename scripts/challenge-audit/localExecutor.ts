/**
 * منفّذ محلي للاختبارات الآلية للتحديات — يحاكي executeCode في التطبيق.
 * - يقبل نفس مفاتيح اللغات التي يقبلها التطبيق (python / javascript / js /
 *   typescript / java / cpp / c / dart / sql). أي لغة أخرى تُرفض بنفس رسالة التطبيق،
 *   حتى يعكس التدقيق سلوك التطبيق الحقيقي.
 * - Python / JavaScript / Java تُشغَّل محلياً. C++ / Dart / SQL / TypeScript تُرسل
 *   إلى Wandbox (نفس خادم التطبيق) مع كاش على القرص.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CodeExecutionRequest, CodeExecutionResult } from '../../src/services/codeExecution';

const WANDBOX: Record<string, string> = {
  cpp: 'gcc-head',
  c: 'gcc-head-c',
  dart: 'dart-3.5.4',
  sql: 'sqlite-3.46.1',
  typescript: 'typescript-5.6.2',
};
const SUPPORTED = new Set(['python', 'javascript', 'js', 'java', ...Object.keys(WANDBOX)]);
const CACHE_DIR = join(__dirname, '.cache');
if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

function run(cmd: string, args: string[], cwd?: string, timeoutMs = 10000) {
  const r = spawnSync(cmd, args, { cwd, timeout: timeoutMs, encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  const timedOut = r.error && (r.error as any).code === 'ETIMEDOUT';
  return { out: r.stdout || '', err: timedOut ? 'Timeout: execution exceeded limit' : r.stderr || '', status: r.status ?? 1 };
}

async function wandbox(compiler: string, code: string): Promise<CodeExecutionResult> {
  const key = createHash('sha1').update(compiler + '\0' + code).digest('hex');
  const file = join(CACHE_DIR, key + '.json');
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  let data: any = null;
  for (let attempt = 0; attempt < 3 && !data; attempt++) {
    try {
      const res = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compiler, code, save: false }),
      });
      if (res.ok) data = await res.json();
      else await new Promise((r) => setTimeout(r, 1500));
    } catch {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  if (!data) return { success: false, error: 'wandbox unreachable' };
  const output = data.program_output || data.compiler_output || '';
  const error = data.program_error || data.compiler_error || '';
  const result: CodeExecutionResult = {
    success: !(data.status !== '0' || (error.length > 0 && !output.trim())),
    output: output || undefined,
    error: error || undefined,
  };
  writeFileSync(file, JSON.stringify(result));
  return result;
}

export async function localExecute(req: CodeExecutionRequest): Promise<CodeExecutionResult> {
  const lang = req.language;
  if (!SUPPORTED.has(lang)) {
    return { success: false, error: `⚠️ التشغيل المباشر لـ ${lang} غير متوفر حالياً.` };
  }
  if (WANDBOX[lang]) return wandbox(WANDBOX[lang], req.code);

  const dir = mkdtempSync(join(tmpdir(), 'kodax-ch-'));
  try {
    let r;
    if (lang === 'python') {
      writeFileSync(join(dir, 'main.py'), req.code);
      r = run('python', ['main.py'], dir);
    } else if (lang === 'javascript' || lang === 'js') {
      writeFileSync(join(dir, 'main.js'), req.code);
      r = run('node', ['main.js'], dir);
    } else {
      // java — Wandbox runs the public class Main
      writeFileSync(join(dir, 'Main.java'), req.code);
      const c = run('javac', ['Main.java'], dir, 30000);
      r = c.status !== 0 ? c : run('java', ['Main'], dir);
    }
    const success = !(r.status !== 0 || (r.err.length > 0 && !r.out.trim()));
    return { success, output: r.out || undefined, error: r.err || undefined };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

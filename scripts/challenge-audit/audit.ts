/**
 * تدقيق آلي لكل التحديات عبر نفس منطق التحقق المستخدم في التطبيق
 * (src/services/challengeValidator.ts) مع منفّذ محلي.
 *
 *   npx tsx scripts/challenge-audit/audit.ts            # كل التحديات
 *   npx tsx scripts/challenge-audit/audit.ts py-ch-3    # تحديات محددة
 *
 * لكل تحدٍ:
 *  - solution: هل الحل النموذجي يجتاز كل الاختبارات؟
 *  - starter:  هل الكود الابتدائي (بدون حل) يُرفض؟
 *  - constant: هل يمكن لإجابة ثابتة (hard-coded) أن تجتاز الاختبارات؟
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_CHALLENGES } from '../../src/constants/courseData';
import { validateChallenge } from '../../src/services/challengeValidator';
import { localExecute } from './localExecutor';

type Row = {
  id: string;
  lang: string;
  difficulty: string;
  title: string;
  tests: number;
  solutionPassed: string;
  solutionOk: boolean;
  starterRejected: boolean;
  constantVulnerable: boolean;
  failures: string[];
  mode?: string;
};

import { isExecutableLanguage } from '../../src/services/challengeValidator';

const TRANSPARENT = new Set(['len', 'str', 'sorted', 'list', 'print', 'round', 'set', 'tuple', 'JSON']);

function calledFunction(input: string): string | null {
  let s = input.trim();
  for (;;) {
    const m = s.match(/^([A-Za-z_]\w*)\s*\(/);
    if (!m) return null;
    if (!TRANSPARENT.has(m[1])) return m[1];
    s = s.slice(m[0].length);
  }
}

function entryName(c: any): string {
  if (c.entryFunction) return c.entryFunction;
  const m = (c.starterCode || '').match(/(?:^|\n)\s*(?:def|function)\s+([A-Za-z_]\w*)/);
  return m ? m[1] : '__main__';
}

/** إجابة ثابتة تجتاز الاختبارات إذا كانت كل دالة تُختبر بمخرج واحد فقط */
function isConstantVulnerable(c: any): boolean {
  const groups = new Map<string, Set<string>>();
  const entry = entryName(c);
  for (const t of c.testCases) {
    const input = (t.input || '').trim();
    // برنامج بلا مدخلات مخرجه ثابت بطبيعته (مثل Hello World)
    if (!input) continue;
    // مدخل وسائط فقط ("abc", 2) ← يُمرّر إلى الدالة الرئيسية
    const noStrings = input.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
    const fn = calledFunction(input) || (!/[;=\n]/.test(noStrings) ? entry : '__main__');
    if (!groups.has(fn)) groups.set(fn, new Set());
    groups.get(fn)!.add(String(t.expectedOutput).trim());
  }
  return [...groups.values()].some((s) => s.size < 2);
}

async function main() {
  const only = process.argv.slice(2);
  const list = (ALL_CHALLENGES as any[]).filter((c) => !only.length || only.includes(c.id));
  const rows: Row[] = [];
  let i = 0;
  for (const c of list) {
    i++;
    const tests = c.testCases;
    const opts = { execute: localExecute, checks: c.checks, entryFunction: c.entryFunction, validation: c.validation, prelude: c.prelude };
    const sol = await validateChallenge(c.solution, c.starterCode, c.language, tests, opts);
    const st = await validateChallenge(c.starterCode, c.starterCode, c.language, tests, opts);
    const failures = sol.results
      .filter((r) => !r.passed)
      .map((r) => `${r.description ? r.description + ': ' : ''}${r.message}${r.expectedOutput !== undefined ? ` | expected=${JSON.stringify(r.expectedOutput).slice(0, 80)}` : ''}${r.actualOutput ? ` | got=${JSON.stringify(r.actualOutput).slice(0, 120)}` : ''}${r.error ? ` | err=${JSON.stringify(r.error).slice(0, 160)}` : ''}`);
    const row: Row = {
      id: c.id,
      lang: c.language,
      difficulty: c.difficulty,
      title: c.title,
      tests: tests.length,
      solutionPassed: `${sol.passedTests}/${sol.totalTests}`,
      solutionOk: sol.allPassed,
      starterRejected: !st.allPassed,
      constantVulnerable: isExecutableLanguage(c.language) && !c.checks?.length && isConstantVulnerable(c),
      mode: sol.mode ?? '-',
      failures,
    };
    rows.push(row);
    process.stdout.write(`\r${i}/${list.length} ${c.id}                 `);
  }
  process.stdout.write('\n');
  const out = join(__dirname, only.length ? 'report-partial.json' : 'report.json');
  writeFileSync(out, JSON.stringify(rows, null, 2));

  const by = (f: (r: Row) => boolean) => rows.filter(f);
  const langs = [...new Set(rows.map((r) => r.lang))];
  console.log('\nlang            total  solutionOK  starterRejected  constantVulnerable');
  for (const l of langs) {
    const r = by((x) => x.lang === l);
    console.log(
      l.padEnd(15),
      String(r.length).padStart(5),
      String(r.filter((x) => x.solutionOk).length).padStart(11),
      String(r.filter((x) => x.starterRejected).length).padStart(16),
      String(r.filter((x) => x.constantVulnerable).length).padStart(19)
    );
  }
  const bad = by((r) => !r.solutionOk || !r.starterRejected);
  console.log(`\nsolution failing: ${by((r) => !r.solutionOk).length}, starter accepted: ${by((r) => !r.starterRejected).length}, constant-vulnerable: ${by((r) => r.constantVulnerable).length}`);
  if (only.length) for (const r of bad) console.log(`- ${r.id} [${r.lang}] ${r.solutionPassed} starterRejected=${r.starterRejected}\n    ${r.failures.join('\n    ')}`);
  console.log('report →', out);
}
main();

/**
 * يولّد ملفات دالة verify-challenge من كود التطبيق نفسه، حتى يشغّل السيرفر
 * نفس المُحقِّق ونفس الاختبارات (بما فيها المخفية) التي يشغّلها التطبيق:
 *
 *   supabase/functions/_shared/codeExecution.ts     ← نسخة من src/services/codeExecution.ts
 *   supabase/functions/_shared/challengeValidator.ts ← نسخة من src/services/challengeValidator.ts
 *   supabase/functions/verify-challenge/challenges.generated.ts ← مواصفات التحديات الـ169
 *
 * شغّله بعد أي تعديل على التحديات أو المُحقِّق، ثم أعد نشر الدالة:
 *   npx tsx scripts/build-verify-function.ts
 *   npx tsx scripts/build-verify-function.ts --check   (يفشل إذا كانت النسخ قديمة)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_CHALLENGES } from '../src/constants/courseData';

const root = join(__dirname, '..');
const shared = join(root, 'supabase/functions/_shared');
const fnDir = join(root, 'supabase/functions/verify-challenge');
const HEADER = '// ⚠️ ملف مولّد بواسطة scripts/build-verify-function.ts — لا تعدّله يدوياً\n';

function copyForDeno(src: string): string {
  // Deno يتطلب امتداد الملف في الاستيراد النسبي
  return (
    HEADER +
    readFileSync(join(root, src), 'utf8').replace(
      /(from\s+['"])(\.\/[\w.-]+)(['"])/g,
      (_m, a, p, b) => `${a}${p.endsWith('.ts') ? p : `${p}.ts`}${b}`
    )
  );
}

const specs = ALL_CHALLENGES.map((c) => ({
  id: c.id,
  language: c.language,
  difficulty: c.difficulty,
  points: c.points,
  starterCode: c.starterCode,
  testCases: c.testCases,
  checks: c.checks,
  entryFunction: c.entryFunction,
  validation: c.validation,
  prelude: c.prelude,
}));

const outputs: Record<string, string> = {
  [join(shared, 'codeExecution.ts')]: copyForDeno('src/services/codeExecution.ts'),
  [join(shared, 'challengeValidator.ts')]: copyForDeno('src/services/challengeValidator.ts'),
  [join(fnDir, 'challenges.generated.ts')]:
    HEADER +
    `import type { ChallengeSpec } from './core.ts';\n\n` +
    `export const CHALLENGE_SPECS: Record<string, ChallengeSpec> = ${JSON.stringify(
      Object.fromEntries(specs.map((s) => [s.id, s])),
      null,
      1
    )};\n`,
};

const check = process.argv.includes('--check');
let stale = 0;
for (const [file, content] of Object.entries(outputs)) {
  const current = existsSync(file) ? readFileSync(file, 'utf8') : '';
  if (current === content) continue;
  stale++;
  if (check) {
    console.error(`قديم: ${file}`);
  } else {
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, content, 'utf8');
    console.log(`كُتب: ${file}`);
  }
}
if (check && stale) process.exit(1);
console.log(`${specs.length} تحدياً${stale ? '' : ' — كل الملفات محدّثة'}`);

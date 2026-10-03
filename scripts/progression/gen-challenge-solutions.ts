/**
 * يولّد migration تحفظ الحلول النموذجية للتحديات على السيرفر فقط (challenge_solutions):
 *   npx tsx scripts/progression/gen-challenge-solutions.ts
 * الناتج: supabase/migrations/20261003020000_challenge_solutions.sql
 *
 * الحلول تبقى في ملفات المحتوى (src/constants) لأن أدوات التدقيق تتحقق أن كل حل نموذجي يجتاز
 * الاختبارات، لكنها تُحذف من حزمة التطبيق عند البناء (babel-plugin-strip-challenge-solutions)
 * وتُعرض للمستخدم فقط عبر challenge_reveal_solution بعد إعلان معتمد أو بعد حلّه للتحدي.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_CHALLENGES } from '../../src/constants/courseData';

function dollar(s: string): string {
  let tag = 'sol';
  for (let i = 0; s.includes(`$${tag}$`); i++) tag = `sol${i}`;
  return `$${tag}$${s}$${tag}$`;
}

const rows = [...ALL_CHALLENGES]
  .filter((c) => c.solution?.trim())
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((c) => `  ('${c.id.replace(/'/g, "''")}', ${dollar(c.solution)})`);

const sql = `-- ============================================================================
-- الحلول النموذجية للتحديات على السيرفر (لا قراءة مباشرة من التطبيق — RLS بلا سياسات)
-- مولَّد تلقائياً بـ scripts/progression/gen-challenge-solutions.ts — لا تعدّله يدوياً
-- عدد الحلول: ${rows.length}
-- يعتمد على: 20261003010000_progression_economy (جدول challenge_solutions). قابل للتكرار.
-- ============================================================================
BEGIN;

INSERT INTO challenge_solutions (challenge_id, solution) VALUES
${rows.join(',\n')}
ON CONFLICT (challenge_id) DO UPDATE SET solution = EXCLUDED.solution, updated_at = NOW();

COMMIT;
`;
const out = join(__dirname, '../../supabase/migrations/20261003020000_challenge_solutions.sql');
writeFileSync(out, sql);
console.log(`wrote ${out}: ${rows.length} solutions`);

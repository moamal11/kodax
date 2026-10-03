/**
 * لكل تحدٍ فيه متطلبات بنيوية: هل الكلمات المفتاحية التي يفحصها النمط مذكورة في الوصف؟
 * (المتطلب الذي لا يذكره الوصف = متطلب مخترع يجب إصلاحه)
 * التشغيل: npx tsx scripts/challenge-audit/checks-vs-description.ts
 */
import { ALL_CHALLENGES } from '../../src/constants/courseData';

const STOP = new Set(['s', 'd', 'w', 'b', 'n', 'i', 'g', 'm', 'x', 'r', 'e', 't', 'min', 'max']);
let issues = 0;
for (const c of ALL_CHALLENGES as any[]) {
  if (!c.checks?.length) continue;
  const desc = `${c.description}`.toLowerCase();
  for (const chk of c.checks) {
    // البدائل المفصولة بـ | : يكفي أن يُذكر أحدها
    const alternatives = String(chk.pattern).split('|');
    const tokensPerAlt = alternatives.map((alt) =>
      (alt.replace(/\\[sdwbSDWB]/g, ' ').replace(/\[[^\]]*\]/g, ' ').match(/[A-Za-z_][A-Za-z0-9_-]{2,}|\d{2,}|[؀-ۿ]{3,}/g) || [])
        .map((x) => x.toLowerCase())
        .filter((x) => !STOP.has(x))
    );
    const mentioned = tokensPerAlt.some((toks) => toks.length === 0 || toks.some((tk) => desc.includes(tk)));
    if (!mentioned) {
      issues++;
      console.log(`- ${c.id} [${c.language}] check "${chk.message}" → tokens ${JSON.stringify(tokensPerAlt.flat().slice(0, 6))} not in description`);
    }
  }
}
console.log(`\n${issues} checks whose key terms are not mentioned in the description`);

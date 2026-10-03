/**
 * يقيس جودة Smart Response على مجموعة الأسئلة (smart-eval-set.ts) ويطبع:
 *   - الاسترجاع: كم سؤالاً مشروعاً أُجيب محلياً وبالرد الصحيح.
 *   - الدقة: كم سؤالاً يجب أن يذهب إلى Gemini أُجيب خطأً محلياً (يجب أن يكون صفراً).
 *   - منحنى العتبة (للمطابق الجديد): أثر تغيير العتبة على الاسترجاع والأخطاء، لتبرير القيمة المختارة.
 * التشغيل:
 *   npx tsx scripts/challenge-audit/smart-eval.ts            ← المطابق الحالي
 *   BASELINE=1 npx tsx scripts/challenge-audit/smart-eval.ts ← النسخة القديمة (قبل طبقة الفهم)
 *   VERBOSE=1 ...                                           ← يطبع كل الإخفاقات
 */
import { getKnowledge } from '../../supabase/functions/ai-chat/core';
import { DEFAULT_LIVE_CONFIG } from '../../supabase/functions/ai-chat/kodax-facts';
import { DEV_POS, DEV_NEG, HOLDOUT_POS, HOLDOUT_NEG, type PosCase, type NegCase } from './smart-eval-set';
import { BLIND_POS, BLIND_NEG } from './smart-eval-blind';

async function main() {
  const baseline = !!process.env.BASELINE;
  const mod = baseline
    ? await import('./baseline/smart-baseline')
    : await import('../../supabase/functions/ai-chat/smart');
  const smart = new mod.SmartResponder(getKnowledge());
  const live = DEFAULT_LIVE_CONFIG;
  const verbose = !!process.env.VERBOSE;

  const ask = (q: string, history = false) => smart.match(q, { mode: 'general', hasHistory: history, hasContext: false, live });
  const expects = (c: PosCase) => (Array.isArray(c.expect) ? c.expect : [c.expect]);
  const keyOf = (m: { kind: string; id: string }) => `${m.kind}:${m.id}`;

  function evalPos(name: string, cases: PosCase[]) {
    let local = 0;
    let right = 0;
    const wrong: string[] = [];
    const missed: string[] = [];
    for (const c of cases) {
      const m = ask(c.q, c.history);
      if (!m) {
        missed.push(c.q);
        continue;
      }
      local++;
      const ok = expects(c).some((e) => keyOf(m).startsWith(e)) && (!c.must || !!m.reply?.includes(c.must));
      if (ok) right++;
      else wrong.push(`${c.q}  → ${keyOf(m)}  (expected ${expects(c).join('|')}${c.must ? ` + "${c.must}"` : ''})`);
    }
    const pct = (n: number) => `${((100 * n) / cases.length).toFixed(1)}%`;
    console.log(`${name.padEnd(14)} positives=${cases.length}  answered-locally=${local} (${pct(local)})  correct=${right} (${pct(right)})  wrong-answer=${wrong.length}  to-Gemini=${missed.length}`);
    if (verbose || wrong.length) for (const w of wrong) console.log('   WRONG  ', w);
    if (verbose) for (const q of missed) console.log('   →Gemini', q);
    return { total: cases.length, local, right, wrong: wrong.length };
  }

  function evalNeg(name: string, cases: NegCase[]) {
    const leaked: string[] = [];
    for (const c of cases) {
      const m = ask(c.q, c.history);
      if (m) leaked.push(`${c.q}  → ${keyOf(m)}  [${c.why}]`);
    }
    console.log(`${name.padEnd(14)} negatives=${cases.length}  correctly-sent-to-Gemini=${cases.length - leaked.length}  WRONGLY-answered-locally=${leaked.length}`);
    for (const l of leaked) console.log('   LEAK   ', l);
    return { total: cases.length, leaked: leaked.length };
  }

  console.log(`\n=== Smart Response evaluation (${baseline ? 'BASELINE: old matcher' : 'current matcher'}) ===`);
  const d = evalPos('DEV', DEV_POS);
  const dn = evalNeg('DEV', DEV_NEG);
  const h = evalPos('HOLDOUT', HOLDOUT_POS);
  const hn = evalNeg('HOLDOUT', HOLDOUT_NEG);
  const b = evalPos('BLIND', BLIND_POS);
  const bn = evalNeg('BLIND', BLIND_NEG);
  const all = {
    total: d.total + h.total + b.total,
    local: d.local + h.local + b.local,
    right: d.right + h.right + b.right,
    wrong: d.wrong + h.wrong + b.wrong,
  };
  const leakedAll = dn.leaked + hn.leaked + bn.leaked;
  console.log(
    `\nTOTAL positives=${all.total}: correct-local=${all.right} (${((100 * all.right) / all.total).toFixed(1)}%), wrong-local=${all.wrong}, to-Gemini=${all.total - all.local}`
  );
  console.log(`TOTAL negatives=${dn.total + hn.total + bn.total}: wrongly-answered=${leakedAll}`);

  // منحنى العتبة (المطابق الجديد فقط)
  if (!baseline && typeof (smart as any).setThreshold === 'function') {
    console.log('\nthreshold sweep (FAQ F-score threshold) — correct / wrong / negatives-leaked');
    const orig = (smart as any).getThreshold();
    for (const t of [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.78, 0.8, 0.85, 0.9]) {
      (smart as any).setThreshold(t);
      let right = 0;
      let wrong = 0;
      let leaked = 0;
      for (const c of [...DEV_POS, ...HOLDOUT_POS, ...BLIND_POS]) {
        const m = ask(c.q, c.history);
        if (!m) continue;
        if (expects(c).some((e) => keyOf(m).startsWith(e)) && (!c.must || !!m.reply?.includes(c.must))) right++;
        else wrong++;
      }
      for (const c of [...DEV_NEG, ...HOLDOUT_NEG, ...BLIND_NEG]) if (ask(c.q, c.history)) leaked++;
      console.log(`  T=${t.toFixed(2)}  correct=${right}  wrong=${wrong}  leaked=${leaked}${t === orig ? '   ← selected' : ''}`);
    }
    (smart as any).setThreshold(orig);
  }
  if (!baseline && (all.wrong > 0 || leakedAll > 0)) process.exitCode = 1;
}
main();

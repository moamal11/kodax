/**
 * اختبار ما يُرسل لمزود الـAI (Gemini) من مساعد التحدي (بدون استدعاء Gemini).
 * التشغيل: npx tsx scripts/challenge-audit/assistant-prompt.test.ts
 */
import { ALL_CHALLENGES } from '../../src/constants/courseData';
import {
  assistantCacheKey,
  buildAssistantPrompt,
  extractCode,
  type AssistantContext,
  type HelpLevel,
} from '../../src/components/ai/challengeAssistantPrompt';

const LEVELS: HelpLevel[] = ['hint', 'explain', 'debug', 'fix', 'solve'];
let pass = 0;
let fail = 0;
const failures: string[] = [];
function check(name: string, cond: boolean) {
  if (cond) pass++;
  else {
    fail++;
    failures.push(name);
  }
}

let checkedHidden = 0;
for (const c of ALL_CHALLENGES) {
  const hidden = c.testCases.filter((t) => t.hidden);
  const userCode = `${c.starterCode}\n// student attempt ${c.id}`;
  // نتيجة تشغيل "ملوّثة" عمداً ببيانات الاختبارات المخفية
  const lastRun = {
    allPassed: false,
    passedTests: 0,
    totalTests: c.testCases.length,
    results: c.testCases.map((t) => ({
      passed: false,
      kind: 'wrong_output' as const,
      hidden: !!t.hidden,
      description: t.description,
      message: 'النتيجة غير صحيحة',
      input: t.input,
      expectedOutput: t.expectedOutput,
      actualOutput: '__ACTUAL__',
      error: t.hidden ? `Traceback: ${t.input}` : undefined,
    })),
  };
  const ctx: AssistantContext = {
    isChallenge: true,
    title: c.title,
    description: c.description,
    language: c.language,
    starterCode: c.starterCode,
    userCode,
    testCases: c.testCases,
    hints: c.hints,
    requirements: c.checks?.map((x) => x.message),
    lastRun,
  };
  // نصوص مشروعة قد تتكرر فيها قيمة الاختبار المخفي (فلا نعدّها تسريباً)
  const visible = c.testCases.filter((t) => !t.hidden);
  const legit = [c.description, c.starterCode, userCode, ...(c.hints ?? []), ...visible.map((t) => `${t.input}\n${t.expectedOutput}\n${t.description}`), ...(c.checks ?? []).map((x) => x.message)].join('\n');

  for (const lv of LEVELS) {
    const p = buildAssistantPrompt(lv, ctx);
    check(`${c.id}/${lv}: includes student code`, p.includes('student attempt'));
    check(`${c.id}/${lv}: includes last-run results`, p.includes('نتائج آخر تشغيل حقيقي'));
    for (const t of hidden) {
      for (const [what, value] of [
        ['input', t.input],
        ['expected', t.expectedOutput],
        ['description', t.description],
      ] as const) {
        const v = (value ?? '').trim();
        if (v.length < 4 || legit.includes(v)) continue; // قيمة عامة جداً أو موجودة أصلاً في نص ظاهر
        checkedHidden++;
        check(`${c.id}/${lv}: hidden ${what} not leaked (${v.slice(0, 30)})`, !p.includes(v));
      }
    }
  }

  // بلا نتيجة تشغيل (الكود تغيّر بعد آخر تشغيل) ← لا نتائج قديمة في الطلب
  const noRun = buildAssistantPrompt('debug', { ...ctx, lastRun: null });
  check(`${c.id}: no stale run results when lastRun=null`, !noRun.includes('نتائج آخر تشغيل'));
}

// مفتاح الكاش يتغيّر مع الكود ومع النتائج، ويثبت إذا لم يتغيّر شيء
const c0 = ALL_CHALLENGES[0];
const base: AssistantContext = { isChallenge: true, title: 't', description: 'd', language: 'Python', starterCode: 's', userCode: 'a = 1' };
check('cache key stable for same code', assistantCacheKey(c0.id, 'fix', base) === assistantCacheKey(c0.id, 'fix', { ...base }));
check('cache key changes when code changes', assistantCacheKey(c0.id, 'fix', base) !== assistantCacheKey(c0.id, 'fix', { ...base, userCode: 'a = 2' }));
check(
  'cache key changes when run results change',
  assistantCacheKey(c0.id, 'fix', base) !==
    assistantCacheKey(c0.id, 'fix', { ...base, lastRun: { allPassed: false, passedTests: 0, totalTests: 1, results: [{ passed: false, message: 'x', kind: 'wrong_output' }] } })
);

// استخراج الكود المقترح: الكتلة الكاملة وليس المقتطف
const reply = 'الخطأ هنا:\n```python\nreturn a\n```\nالحل الكامل:\n```python\ndef f(a):\n    return a + 1\n```';
check('extractCode picks the full solution block', extractCode(reply) === 'def f(a):\n    return a + 1');
check('extractCode returns null without code', extractCode('لا يوجد كود') === null);

console.log(`hidden values checked: ${checkedHidden}`);
console.log(`${pass}/${pass + fail} passed`);
if (fail) {
  console.log('FAILED:\n  ' + failures.slice(0, 20).join('\n  '));
  process.exitCode = 1;
}

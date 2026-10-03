/**
 * اختبار منطق verify-challenge (core.ts) بالمُحقِّق الحقيقي وخادم التشغيل الحقيقي (Wandbox)،
 * مع قاعدة بيانات وهمية في الذاكرة. التشغيل: npx tsx scripts/challenge-audit/verify-core.test.ts
 */
import { handleVerify, type VerifyDeps, RATE_LIMIT } from '../../supabase/functions/verify-challenge/core';
import { CHALLENGE_SPECS } from '../../supabase/functions/verify-challenge/challenges.generated';
import { ALL_CHALLENGES } from '../../src/constants/courseData';

type Sub = { userId: string; challengeId: string; allPassed: boolean; at: number };
function makeDeps(opts: { validUser?: string; lockedIds?: string[] } = {}) {
  const subs: Sub[] = [];
  const completed = new Set<string>();
  const rewarded = new Set<string>();
  const deps: VerifyDeps = {
    specs: CHALLENGE_SPECS,
    getUserId: async (t) => (t === 'good-token' ? opts.validUser ?? 'user-a' : null),
    checkAccess: async (_u, id) =>
      opts.lockedIds?.includes(id) ? { allowed: false, required_course_id: 'py-data-structures' } : { allowed: true, required_course_id: null },
    countRecentSubmissions: async (u, since) => subs.filter((s) => s.userId === u && s.at >= Date.parse(since)).length,
    recordSubmission: async (a) => {
      subs.push({ userId: a.userId, challengeId: a.challengeId, allPassed: a.allPassed, at: Date.now() });
      if (!a.allPassed) return { recorded: false, first_time: false, xp_awarded: 0 };
      const key = `${a.userId}:${a.challengeId}`;
      const first = !completed.has(key);
      completed.add(key);
      return { recorded: true, first_time: first, xp_awarded: first ? CHALLENGE_SPECS[a.challengeId].points : 0 };
    },
    rewardCoins: async (_t, id) => {
      const dup = rewarded.has(id);
      rewarded.add(id);
      return { success: true, reward: 5, duplicate: dup };
    },
  };
  return { deps, subs, completed };
}

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

(async () => {
  const sol = (id: string) => ALL_CHALLENGES.find((c) => c.id === id)!.solution;

  // المواصفات المولّدة مطابقة للتطبيق
  check('specs cover all 169 challenges', Object.keys(CHALLENGE_SPECS).length === ALL_CHALLENGES.length);
  check('hidden tests present in server specs', Object.values(CHALLENGE_SPECS).some((s) => s.testCases.some((t) => t.hidden)));

  {
    const { deps } = makeDeps();
    let r = await handleVerify(deps, '', { challengeId: 'py-ch-beg-1', code: 'x' });
    check('no token → 401', r.status === 401);
    r = await handleVerify(deps, 'forged-token', { challengeId: 'py-ch-beg-1', code: 'x' });
    check('invalid token → 401', r.status === 401);
    r = await handleVerify(deps, 'good-token', { challengeId: 'nope', code: 'x' });
    check('unknown challenge → 404', r.status === 404);
    r = await handleVerify(deps, 'good-token', { challengeId: 'py-ch-beg-1', code: 'x'.repeat(20001) });
    check('oversized code → 413', r.status === 413);
    r = await handleVerify(deps, 'good-token', { challengeId: 'py-ch-beg-1' });
    check('missing code → 400', r.status === 400);
    r = await handleVerify(deps, 'good-token', { challengeId: 'py-ch-beg-1', code: 'x', passed: true, allPassed: true });
    check('client-claimed "passed" is ignored', r.status === 200 && r.body.verified === false);
  }

  // حل خاطئ (Python على Wandbox الحقيقي)
  {
    const { deps, completed } = makeDeps();
    const wrong = 'def calculator(a, b, operation):\n    return a + b';
    const r = await handleVerify(deps, 'good-token', { challengeId: 'py-ch-beg-1', code: wrong });
    const b = r.body as any;
    check('wrong Python solution → not verified', r.status === 200 && b.verified === false, `${b.passedTests}/${b.totalTests}`);
    check('wrong solution not recorded as complete', completed.size === 0 && b.completion.recorded === false);
    check('no coins for wrong solution', b.coins === null);
    const hidden = b.results.filter((x: any) => x.hidden);
    check(
      'hidden tests expose no input/expected/actual/error',
      hidden.length > 0 && hidden.every((x: any) => !('input' in x) && !('expectedOutput' in x) && !('actualOutput' in x) && !('error' in x))
    );
  }

  // الحل الصحيح: إكمال + XP + كوينات مرة واحدة
  {
    const { deps } = makeDeps();
    let r = await handleVerify(deps, 'good-token', { challengeId: 'py-ch-beg-1', code: sol('py-ch-beg-1') });
    let b = r.body as any;
    check('correct Python solution → verified', b.verified === true, `${b.passedTests}/${b.totalTests}`);
    check('first completion recorded + XP', b.completion.firstTime === true && b.completion.xpAwarded === CHALLENGE_SPECS['py-ch-beg-1'].points);
    check('coins granted once', b.coins?.reward === 5 && !b.coins?.duplicate);
    r = await handleVerify(deps, 'good-token', { challengeId: 'py-ch-beg-1', code: sol('py-ch-beg-1') });
    b = r.body as any;
    check('second pass: no XP, no coin call', b.completion.firstTime === false && b.completion.xpAwarded === 0 && b.coins === null);
  }

  // لغات أخرى عبر نفس المسار
  for (const id of ['web-ch-camelcase-001', 'cpp-ch-beg-1', 'backend-ch-2', 'css-ch-4', 'backend-ch-3']) {
    const { deps } = makeDeps();
    const r = await handleVerify(deps, 'good-token', { challengeId: id, code: sol(id) });
    const b = r.body as any;
    check(`model solution verified on server path: ${id}`, b.verified === true, `${b.passedTests}/${b.totalTests} mode=${b.mode}`);
    const s = await handleVerify(deps, 'good-token', { challengeId: id, code: CHALLENGE_SPECS[id].starterCode });
    check(`starter code rejected: ${id}`, (s.body as any).verified === false);
  }

  // تحدٍ مقفول على المستخدم: 403 قبل أي تشغيل — لا تسجيل ولا XP ولا كوينات
  {
    const { deps, subs, completed } = makeDeps({ lockedIds: ['py-ch-beg-1'] });
    let ran = false;
    deps.validate = async () => { ran = true; return { allPassed: true, results: [], totalTests: 1, passedTests: 1 }; };
    const r = await handleVerify(deps, 'good-token', { challengeId: 'py-ch-beg-1', code: sol('py-ch-beg-1') });
    check('locked challenge → 403 challenge_locked', r.status === 403 && r.body.error === 'challenge_locked');
    check('locked challenge: code not run, nothing recorded', !ran && subs.length === 0 && completed.size === 0);
  }

  // السيرفر يرفض التسجيل (تغيّر الوصول بين الفحص والتسجيل): 403 بلا كوينات
  {
    const { deps } = makeDeps();
    let coinCalls = 0;
    deps.validate = async () => ({ allPassed: true, results: [], totalTests: 1, passedTests: 1 });
    deps.recordSubmission = async () => ({ recorded: false, first_time: false, xp_awarded: 0, locked: true });
    deps.rewardCoins = async () => { coinCalls++; return { success: true, reward: 5 }; };
    const r = await handleVerify(deps, 'good-token', { challengeId: 'py-ch-beg-1', code: 'x' });
    check('DB-side lock → 403, no coin call', r.status === 403 && coinCalls === 0);
  }

  // تعطل خادم التشغيل: لا إكمال، ورسالة واضحة
  {
    const { deps, completed } = makeDeps();
    deps.validate = async () => ({ allPassed: false, results: [], totalTests: 1, passedTests: 0, serviceError: true });
    const r = await handleVerify(deps, 'good-token', { challengeId: 'py-ch-beg-1', code: sol('py-ch-beg-1') });
    check('execution service down → 503, nothing recorded', r.status === 503 && completed.size === 0);
  }

  // حد المحاولات
  {
    const { deps } = makeDeps();
    deps.validate = async () => ({ allPassed: false, results: [], totalTests: 1, passedTests: 0 });
    let last = 200;
    for (let i = 0; i <= RATE_LIMIT.max; i++) last = (await handleVerify(deps, 'good-token', { challengeId: 'py-ch-beg-1', code: 'x' })).status;
    check(`rate limit after ${RATE_LIMIT.max} attempts / ${RATE_LIMIT.windowMinutes} min → 429`, last === 429);
  }

  console.log(`\n${pass}/${pass + fail} passed`);
  if (fail) process.exitCode = 1;
})();

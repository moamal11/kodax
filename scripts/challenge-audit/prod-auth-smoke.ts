/**
 * اختبار أمني بحساب تجريبي حقيقي على مشروع Supabase المنشور (تشغّله أنت بحسابك التجريبي).
 * بيانات الدخول تُقرأ من متغيرات البيئة فقط ولا تُطبع:
 *
 *   KODAX_TEST_EMAIL=... KODAX_TEST_PASSWORD=... npx tsx scripts/challenge-audit/prod-auth-smoke.ts
 *
 * ما يفعله (على هذا الحساب فقط):
 *  1. يحاول كتابة إكمال تحدٍ مباشرة (يجب أن يُرفض).
 *  2. يحاول XP كبيراً ولحساب آخر (يجب أن يُرفض).
 *  3. يطلب مكافأة بدون حل (not_completed).
 *  4. يرسل حلاً خاطئاً لـ verify-challenge (لا إكمال).
 *  5. يرسل الحل الصحيح (إكمال + XP + كوينات مرة واحدة) ثم يكرر (بدون مكافأة ثانية).
 * ملاحظة: الخطوة 5 تسجّل إكمال تحدي py-ch-beg-1 لهذا الحساب وتمنحه الكوينات فعلاً.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { ALL_CHALLENGES } from '../../src/constants/courseData';

function env(name: string): string {
  if (process.env[name]) return process.env[name]!;
  const m = readFileSync(join(__dirname, '../../.env'), 'utf8').match(new RegExp(`^${name}=(.*)$`, 'm'));
  if (!m) throw new Error(`missing ${name}`);
  return m[1].trim();
}

const CH = 'py-ch-beg-1';
let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail = '') {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

(async () => {
  const email = process.env.KODAX_TEST_EMAIL;
  const password = process.env.KODAX_TEST_PASSWORD;
  if (!email || !password) {
    console.log('ضع KODAX_TEST_EMAIL و KODAX_TEST_PASSWORD لحساب تجريبي.');
    process.exit(2);
  }
  const sb = createClient(env('EXPO_PUBLIC_SUPABASE_URL'), env('EXPO_PUBLIC_SUPABASE_ANON_KEY'), { auth: { persistSession: false } });
  const { data: auth, error: authErr } = await sb.auth.signInWithPassword({ email, password });
  if (authErr || !auth.user) {
    console.log('تعذّر تسجيل الدخول:', authErr?.message);
    process.exit(2);
  }
  const uid = auth.user.id;

  // 1) تزوير الإكمال مباشرة
  const forged = await sb.from('user_lesson_progress').insert({ user_id: uid, lesson_id: 'algo-ch-binary-001', course_id: 'challenges', completed: true });
  check('direct challenge completion insert is rejected', !!forged.error, forged.error?.code ?? 'INSERTED');
  const disguised = await sb.from('user_lesson_progress').insert({ user_id: uid, lesson_id: 'algo-ch-binary-001', course_id: 'python-basics', completed: true });
  check('challenge id disguised as a lesson is rejected', !!disguised.error, disguised.error?.code ?? 'INSERTED');

  // 2) XP
  const bigXp = await sb.rpc('update_user_xp', { user_id: uid, xp_amount: 100000 });
  check('huge XP amount is rejected', !!bigXp.error, bigXp.error?.message ?? 'ACCEPTED');
  const otherXp = await sb.rpc('update_user_xp', { user_id: '00000000-0000-4000-8000-000000000000', xp_amount: 10 });
  check("XP for another user is rejected", !!otherXp.error, otherXp.error?.message ?? 'ACCEPTED');

  // 3) مكافأة بدون حل
  const early = await sb.rpc('coins_reward_challenge', { p_challenge_id: 'algo-ch-binary-001', p_difficulty: 'hard' });
  check('reward without verified completion is refused', early.data?.code === 'not_completed' || early.data?.success === false, JSON.stringify(early.data ?? early.error?.message));

  // 4) حل خاطئ
  const wrong = await sb.functions.invoke('verify-challenge', { body: { challengeId: CH, code: 'def calculator(a, b, operation):\n    return a + b' } });
  check('wrong solution is not verified', wrong.data?.verified === false && wrong.data?.completion?.recorded === false, JSON.stringify({ v: wrong.data?.verified, p: wrong.data?.passedTests, t: wrong.data?.totalTests }));

  // 5) الحل الصحيح مرتين
  const solution = ALL_CHALLENGES.find((c) => c.id === CH)!.solution;
  const first = await sb.functions.invoke('verify-challenge', { body: { challengeId: CH, code: solution } });
  check('correct solution is verified on the server', first.data?.verified === true, JSON.stringify({ p: first.data?.passedTests, t: first.data?.totalTests, completion: first.data?.completion, coins: first.data?.coins }));
  const second = await sb.functions.invoke('verify-challenge', { body: { challengeId: CH, code: solution } });
  check('second submission gives no extra XP/coins', second.data?.completion?.firstTime === false && second.data?.completion?.xpAwarded === 0 && second.data?.coins === null, JSON.stringify(second.data?.completion));
  const again = await sb.rpc('coins_reward_challenge', { p_challenge_id: CH, p_difficulty: 'hard' });
  check('direct reward call after completion is a duplicate', again.data?.duplicate === true || again.data?.success === false, JSON.stringify(again.data));

  const { data: rows } = await sb.from('challenge_submissions').select('challenge_id, all_passed').eq('challenge_id', CH);
  check('submissions are logged for this user', (rows?.length ?? 0) >= 3, `rows=${rows?.length}`);

  await sb.auth.signOut();
  console.log(`\n${pass}/${pass + fail} passed`);
  if (fail) process.exitCode = 1;
})();

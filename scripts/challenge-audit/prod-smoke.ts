/**
 * فحص أمني سريع لمشروع Supabase المنشور — بمفتاح anon العام فقط (نفس الموجود في التطبيق).
 * - قراءة فقط: لا يكتب أي بيانات ولا يقرأ محتوى أي صف (أعداد وأخطاء صلاحيات فقط).
 * - يُشغَّل بعد نشر migration 20261001010000 ودالتي verify-challenge و ai-chat.
 *
 *   npx tsx scripts/challenge-audit/prod-smoke.ts
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

function env(name: string): string {
  if (process.env[name]) return process.env[name]!;
  const file = readFileSync(join(__dirname, '../../.env'), 'utf8');
  const m = file.match(new RegExp(`^${name}=(.*)$`, 'm'));
  if (!m) throw new Error(`missing ${name}`);
  return m[1].trim();
}

const URL = env('EXPO_PUBLIC_SUPABASE_URL');
const ANON = env('EXPO_PUBLIC_SUPABASE_ANON_KEY');
const anon = createClient(URL, ANON, { auth: { persistSession: false } });

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail: string) {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name} — ${detail}`);
}

(async () => {
  console.log(`project: ${new globalThis.URL(URL).host}\n`);

  // 1) قراءة تقدم المستخدمين بدون تسجيل دخول (عدد فقط، بدون محتوى)
  {
    const { count, error } = await anon.from('user_lesson_progress').select('id', { count: 'exact', head: true });
    check('anon cannot read user_lesson_progress', !!error || count === 0, error ? `denied (${error.code ?? error.message})` : `count=${count}`);
  }
  // 2) سجل محاولات التحقق
  {
    const { count, error } = await anon.from('challenge_submissions').select('id', { count: 'exact', head: true });
    check('anon cannot read challenge_submissions', !!error || count === 0, error ? `denied (${error.code ?? error.message})` : `count=${count}`);
  }
  // 3) دوال محمية — نستخدم معرّف مستخدم عشوائي غير موجود، فلا أثر حتى لو قُبل الاستدعاء
  {
    const fake = '00000000-0000-4000-8000-000000000000';
    const xp = await anon.rpc('update_user_xp', { user_id: fake, xp_amount: 1 });
    check('anon cannot call update_user_xp', !!xp.error, xp.error ? `denied (${xp.error.code ?? xp.error.message})` : 'CALL ACCEPTED');
    const rec = await anon.rpc('record_challenge_submission', {
      p_user_id: fake, p_challenge_id: 'py-ch-beg-1', p_passed_tests: 1, p_total_tests: 1, p_all_passed: true, p_code_sha256: null,
    });
    check('anon cannot call record_challenge_submission', !!rec.error, rec.error ? `denied (${rec.error.code ?? rec.error.message})` : 'CALL ACCEPTED');
  }
  // 4) الكتالوج مقروء وكامل
  {
    const { count, error } = await anon.from('challenge_catalog').select('id', { count: 'exact', head: true });
    check('challenge_catalog readable with all challenges', !error && (count ?? 0) >= 169, error ? error.message : `count=${count}`);
  }
  // 5) الدوال ترفض الطلب بدون جلسة مستخدم
  for (const fn of ['verify-challenge', 'ai-chat']) {
    const res = await fetch(`${URL}/functions/v1/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
      body: JSON.stringify(fn === 'ai-chat' ? { message: 'hi', mode: 'challenge-hint' } : { challengeId: 'py-ch-beg-1', code: 'x' }),
    });
    check(`${fn} rejects calls without a user session`, res.status === 401, `HTTP ${res.status}`);
  }

  console.log(`\n${pass}/${pass + fail} passed`);
  if (fail) process.exitCode = 1;
})();

/**
 * verify-challenge — التحقق من حل تحدٍ وتسجيل إكماله على السيرفر.
 *
 * POST { challengeId, code }  مع  Authorization: Bearer <access token>
 * - يرفض التحدي المقفول على المستخدم (403) قبل أي تشغيل أو تسجيل (challenge_access_check).
 * - يشغّل كود المستخدم على كل اختبارات التحدي (المخفية أيضاً) بنفس مُحقِّق التطبيق.
 * - عند النجاح فقط: يسجّل الإكمال + XP (record_challenge_submission — مسموح لـ service_role فقط)
 *   ثم يمنح الكوينات عبر coins_reward_challenge باسم المستخدم (مرة واحدة لكل تحدٍ).
 * - العميل لا يستطيع كتابة إكمال التحديات مباشرة (RLS).
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleVerify, type VerifyDeps } from './core.ts';
import { CHALLENGE_SPECS } from './challenges.generated.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const deps: VerifyDeps = {
  specs: CHALLENGE_SPECS,
  async getUserId(token) {
    const { data, error } = await admin.auth.getUser(token);
    return error ? null : data.user?.id ?? null;
  },
  async checkAccess(userId, challengeId) {
    const { data, error } = await admin.rpc('challenge_access_check', {
      p_user_id: userId,
      p_challenge_id: challengeId,
    });
    if (error) throw error;
    return { allowed: data?.allowed === true, required_course_id: data?.required_course_id ?? null };
  },
  async countRecentSubmissions(userId, sinceIso) {
    const { count, error } = await admin
      .from('challenge_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', sinceIso);
    if (error) throw error;
    return count ?? 0;
  },
  async recordSubmission(a) {
    const { data, error } = await admin.rpc('record_challenge_submission', {
      p_user_id: a.userId,
      p_challenge_id: a.challengeId,
      p_passed_tests: a.passedTests,
      p_total_tests: a.totalTests,
      p_all_passed: a.allPassed,
      p_code_sha256: a.codeSha256,
    });
    if (error) throw error;
    return data;
  },
  async rewardCoins(token, challengeId, difficulty) {
    // باسم المستخدم: coins_reward_challenge تعتمد على auth.uid() ومفتاح عدم التكرار
    const asUser = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await asUser.rpc('coins_reward_challenge', {
      p_challenge_id: challengeId,
      p_difficulty: difficulty,
    });
    if (error) return { success: false, code: 'reward_failed' };
    return data;
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }

  try {
    const r = await handleVerify(deps, token, body);
    return json(r.body, r.status);
  } catch (e) {
    console.error('verify-challenge failed:', e instanceof Error ? e.message : e);
    return json({ error: 'server_error' }, 500);
  }
});

// ========================================
// Supabase Edge Function: AI Chat
// Runtime: Deno — المنطق في core.ts (قابل للاختبار محلياً)
// - المستخدم من JWT فقط. بياناته وإعدادات التطبيق تُقرأ بصلاحياته هو (RLS).
// - مفتاح الخدمة يُستخدم فقط لحجز/إرجاع حصة Gemini والـcache العام (دوال service_role فقط).
// - مفتاح Gemini في Secrets فقط (GEMINI_API_KEY).
// - أخطاء Gemini تُعاد بحالة غير 200 حتى لا يعرضها التطبيق كإجابة أو يخزّنها.
// ========================================

// @ts-ignore: Deno runtime
import { corsHeaders } from '../_shared/cors.ts';
// @ts-ignore: Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleChat, CACHE_TTL_HOURS } from './core.ts';
import { mergeLiveConfig, type LiveConfig } from './kodax-facts.ts';
import type { QuotaState, UserSnapshot } from './smart.ts';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// @ts-ignore: Deno runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
// @ts-ignore: Deno runtime
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
// @ts-ignore: Deno runtime
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// الإعدادات الحية تتغير نادراً: تُحفظ في ذاكرة النسخة 5 دقائق
let liveCache: { at: number; value: LiveConfig } | null = null;

// deno-lint-ignore no-explicit-any
async function loadLiveConfig(client: any): Promise<LiveConfig> {
  if (liveCache && Date.now() - liveCache.at < 5 * 60_000) return liveCache.value;
  const [{ data: cfg }, { data: catalog }] = await Promise.all([
    client.from('coin_config').select('key, value'),
    client.from('course_coin_catalog').select('course_id, unlock_cost').eq('is_active', true),
  ]);
  const raw: Record<string, unknown> = {};
  for (const row of cfg ?? []) raw[row.key] = row.value;
  const prices: Record<string, number> = {};
  for (const row of catalog ?? []) prices[row.course_id] = row.unlock_cost;
  const value = mergeLiveConfig({ ...raw, prices });
  liveCache = { at: Date.now(), value };
  return value;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // عميل باسم المستخدم: كل قراءات بياناته تمر عبر RLS
  const authHeader = req.headers.get('Authorization') || '';
  const supabase = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid body' }, 400);
  }

  try {
    const r = await handleChat(
      {
        getUser: async () => {
          const { data } = await supabase.auth.getUser();
          return data.user ? { id: data.user.id } : null;
        },
        reserveQuota: async (userId) => {
          const { data, error } = await admin.rpc('ai_quota_reserve', { p_user: userId });
          if (error) throw error;
          return { allowed: data?.allowed === true, code: data?.code, quota: data?.quota ?? null };
        },
        releaseQuota: async (userId) => {
          const { data } = await admin.rpc('ai_quota_release', { p_user: userId });
          return (data as QuotaState) ?? null;
        },
        getQuota: async () => {
          const { data } = await supabase.rpc('ai_get_quota');
          return data?.success ? (data as QuotaState) : null;
        },
        getLiveConfig: () => loadLiveConfig(supabase),
        isSolutionUnlocked: async (userId, challengeId) => {
          const { data, error } = await admin.rpc('challenge_solution_unlocked', {
            p_user_id: userId,
            p_challenge_id: challengeId,
          });
          return !error && data === true;
        },
        getUserSnapshot: async (userId): Promise<UserSnapshot | null> => {
          const [profile, points, unlocked, lessons, challenges, quota] = await Promise.all([
            supabase.from('profiles').select('xp, level, streak_days').eq('id', userId).maybeSingle(),
            supabase.from('user_points').select('total_points').eq('user_id', userId).maybeSingle(),
            supabase.from('user_unlocked_courses').select('course_id').eq('user_id', userId),
            supabase.from('user_lesson_progress').select('id', { count: 'exact', head: true })
              .eq('user_id', userId).eq('completed', true).neq('course_id', 'challenges'),
            supabase.from('user_lesson_progress').select('id', { count: 'exact', head: true })
              .eq('user_id', userId).eq('completed', true).eq('course_id', 'challenges'),
            supabase.rpc('ai_get_quota'),
          ]);
          if (profile.error) return null;
          const xp = profile.data?.xp ?? 0;
          return {
            xp,
            // نفس معادلة السيرفر (kodax_level) والتطبيق: max(1, floor(sqrt(xp/100)))
            level: Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 100))),
            streak: profile.data?.streak_days ?? 0,
            coins: points.data?.total_points ?? 0,
            unlockedCourses: (unlocked.data ?? []).map((r: { course_id: string }) => r.course_id),
            completedLessons: lessons.count ?? 0,
            completedChallenges: challenges.count ?? 0,
            quota: quota.data?.success ? (quota.data as QuotaState) : null,
          };
        },
        cacheGet: async (key) => {
          const { data } = await admin.rpc('ai_cache_get', { p_key: key });
          return typeof data === 'string' ? data : null;
        },
        cachePut: async (key, reply, model, version) => {
          await admin.rpc('ai_cache_put', { p_key: key, p_reply: reply, p_model: model, p_version: version, p_ttl_hours: CACHE_TTL_HOURS });
        },
        // @ts-ignore: Deno runtime
        apiKey: Deno.env.get('GEMINI_API_KEY'),
        models: {
          // @ts-ignore: Deno runtime
          model: Deno.env.get('GEMINI_MODEL') || undefined,
          // @ts-ignore: Deno runtime
          lite: Deno.env.get('GEMINI_MODEL_LITE') || undefined,
        },
      },
      body
    );
    return jsonResponse(r.body, r.status);
  } catch (e) {
    console.error('[ai-chat] failed:', e instanceof Error ? e.message : e);
    return jsonResponse({ error: 'ai_unavailable', message: 'حدث خطأ في السيرفر. أعد المحاولة بعد قليل.' }, 500);
  }
});

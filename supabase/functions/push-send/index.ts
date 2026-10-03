/**
 * push-send — يرسل الإشعارات المستحقة من notification_outbox عبر Expo Push، ويحدّث الإيصالات.
 *
 * يُستدعى من pg_cron كل دقيقة (رأس x-cron-secret = PUSH_CRON_SECRET من Supabase Secrets)،
 * أو من مشرف (Authorization: Bearer <admin access token>) لتشغيل فوري من لوحة الإدارة.
 * EXPO_ACCESS_TOKEN اختياري (إن فُعّل "Enhanced Push Security" في Expo).
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { processBatch, processReceipts, type PushDeps } from './core.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CRON_SECRET = Deno.env.get('PUSH_CRON_SECRET') ?? '';
const EXPO_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN') ?? '';
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const expoHeaders: Record<string, string> = {
  Accept: 'application/json',
  'Accept-Encoding': 'gzip, deflate',
  'Content-Type': 'application/json',
  ...(EXPO_TOKEN ? { Authorization: `Bearer ${EXPO_TOKEN}` } : {}),
};

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await admin.rpc(fn, args);
  if (error) throw new Error(`${fn}: ${error.message}`);
  return data as T;
}

const deps: PushDeps = {
  claim: (limit) => rpc('push_claim_batch', { p_limit: limit }),
  recordResults: async (results) => { await rpc('push_record_results', { p_results: results }); },
  receiptsDue: (limit) => rpc('push_receipts_due', { p_limit: limit }),
  recordReceipts: async (results) => { await rpc('push_record_receipts', { p_results: results }); },
  async expoSend(messages) {
    const res = await fetch('https://exp.host/--/api/v2/push/send', { method: 'POST', headers: expoHeaders, body: JSON.stringify(messages) });
    if (!res.ok) throw new Error(`expo_http_${res.status}`);
    const body = await res.json();
    return body.data ?? [];
  },
  async expoReceipts(ids) {
    const res = await fetch('https://exp.host/--/api/v2/push/getReceipts', { method: 'POST', headers: expoHeaders, body: JSON.stringify({ ids }) });
    if (!res.ok) throw new Error(`expo_http_${res.status}`);
    const body = await res.json();
    return body.data ?? {};
  },
};

/** مقارنة ثابتة الزمن للسر */
function safeEqual(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function authorized(req: Request): Promise<boolean> {
  if (safeEqual(req.headers.get('x-cron-secret') ?? '', CRON_SECRET)) return true;
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return false;
  const { data: role } = await admin.from('user_roles').select('role').eq('user_id', data.user.id).eq('role', 'admin').maybeSingle();
  return !!role;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!(await authorized(req))) return json({ error: 'forbidden' }, 403);

  const started = Date.now();
  const totals = { claimed: 0, sent: 0, failed: 0, skipped: 0, receipts_checked: 0, delivered: 0 };
  try {
    // حتى 5 دفعات أو 40 ثانية
    for (let i = 0; i < 5 && Date.now() - started < 40_000; i++) {
      const r = await processBatch(deps, 200);
      totals.claimed += r.claimed; totals.sent += r.sent; totals.failed += r.failed; totals.skipped += r.skipped;
      if (r.claimed < 200) break;
    }
    const rc = await processReceipts(deps, 300);
    totals.receipts_checked = rc.checked;
    totals.delivered = rc.delivered;
    return json({ success: true, ...totals, ms: Date.now() - started });
  } catch (e) {
    console.error('push-send failed:', e instanceof Error ? e.message : e);
    return json({ success: false, error: 'server_error', ...totals }, 500);
  }
});

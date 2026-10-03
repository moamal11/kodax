/**
 * delete-account — حذف الحساب النهائي (ذاتي أو بواسطة مشرف).
 *
 * POST { confirm: 'DELETE' }                               ← المستخدم يحذف حسابه
 * POST { confirm: 'DELETE', target_user_id, reason }       ← مشرف يحذف حساب مستخدم
 * مع Authorization: Bearer <access token>. الهوية من Supabase Auth (لا يُقبل معرّف من العميل كهوية).
 * مفتاح service_role يبقى هنا فقط (Supabase Secrets)، لا يصل للتطبيق.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleDeleteAccount, type DeleteDeps } from './core.ts';

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
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const deps: DeleteDeps = {
  async getUserId(token) {
    const { data, error } = await admin.auth.getUser(token);
    return error ? null : data.user?.id ?? null;
  },
  async isAdmin(userId) {
    const { data } = await admin.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    return !!data;
  },
  async prepare(userId, actorId, reason) {
    const { data, error } = await admin.rpc('account_delete_prepare', { p_user: userId, p_actor: actorId, p_reason: reason });
    if (error) throw error;
    return data;
  },
  async removeObjects(bucket, names) {
    const { error } = await admin.storage.from(bucket).remove(names);
    if (error) throw error;
  },
  async deleteAuthUser(userId) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw error;
  },
  async finish(logId, ok, error) {
    await admin.rpc('account_delete_finish', { p_log: logId, p_ok: ok, p_error: error ?? null });
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
    const r = await handleDeleteAccount(deps, token, body);
    return json(r.body, r.status);
  } catch (e) {
    console.error('delete-account failed:', e instanceof Error ? e.message : e);
    return json({ error: 'server_error' }, 500);
  }
});

// ========================================
// Supabase Edge Function: AdMob Rewarded Ads — Server-Side Verification
// Runtime: Deno
//
// AdMob يستدعي هذا الرابط بعد اكتمال الإعلان المكافئ (وليس عند الضغط عليه).
// نتحقق من توقيع Google (ECDSA P-256 / SHA-256) ثم نعتمد جلسة الإعلان
// عبر coins_credit_ad_ssv (service role). التطبيق يرسل رقم الجلسة كـ custom_data.
//
// الإعداد:
//   1. انشر الدالة بدون التحقق من JWT (AdMob لا يرسل توكن):
//        supabase functions deploy admob-ssv --no-verify-jwt
//   2. في AdMob → وحدة الإعلان المكافئ → Server-side verification، ضع:
//        https://<project-ref>.supabase.co/functions/v1/admob-ssv
//   3. بعد التأكد أنها تعمل، عطّل الاعتماد من التطبيق:
//        update coin_config set value = jsonb_set(value, '{client_claim_enabled}', 'false')
//        where key = 'ads';
// ========================================

// @ts-ignore: Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const KEYS_URL = 'https://www.gstatic.com/admob/reward/verifier-keys.json';
const KEY_CACHE_MS = 12 * 60 * 60 * 1000;

let cachedKeys: { at: number; keys: Map<string, CryptoKey> } | null = null;

function base64ToBytes(b64: string): Uint8Array {
  const normalized = b64.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function getKeys(forceRefresh = false): Promise<Map<string, CryptoKey>> {
  if (
    !forceRefresh &&
    cachedKeys &&
    Date.now() - cachedKeys.at < KEY_CACHE_MS
  ) {
    return cachedKeys.keys;
  }
  const res = await fetch(KEYS_URL);
  if (!res.ok) throw new Error(`key fetch failed: ${res.status}`);
  const json = await res.json();
  const keys = new Map<string, CryptoKey>();
  for (const k of json.keys ?? []) {
    const key = await crypto.subtle.importKey(
      'spki',
      base64ToBytes(k.base64) as BufferSource,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );
    keys.set(String(k.keyId), key);
  }
  cachedKeys = { at: Date.now(), keys };
  return keys;
}

/** يحوّل توقيع DER (كما يرسله AdMob) إلى صيغة r||s التي يتوقعها WebCrypto */
function derToRaw(der: Uint8Array): Uint8Array {
  let offset = 0;
  if (der[offset++] !== 0x30) throw new Error('bad DER');
  let len = der[offset++];
  if (len & 0x80) offset += len & 0x7f;
  const readInt = (): Uint8Array => {
    if (der[offset++] !== 0x02) throw new Error('bad DER int');
    const l = der[offset++];
    let v = der.slice(offset, offset + l);
    offset += l;
    while (v.length > 32 && v[0] === 0) v = v.slice(1);
    const out = new Uint8Array(32);
    out.set(v, 32 - v.length);
    return out;
  };
  const r = readInt();
  const s = readInt();
  const raw = new Uint8Array(64);
  raw.set(r, 0);
  raw.set(s, 32);
  return raw;
}

async function verify(query: string): Promise<URLSearchParams | null> {
  const sigIndex = query.indexOf('&signature=');
  if (sigIndex < 0) return null;
  const signedContent = query.slice(0, sigIndex);
  const params = new URLSearchParams(query);
  const signature = params.get('signature');
  const keyId = params.get('key_id');
  if (!signature || !keyId) return null;

  let keys = await getKeys();
  if (!keys.has(keyId)) keys = await getKeys(true);
  const key = keys.get(keyId);
  if (!key) return null;

  const ok = await crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    derToRaw(base64ToBytes(signature)) as BufferSource,
    new TextEncoder().encode(signedContent) as BufferSource
  );
  return ok ? params : null;
}

// @ts-ignore: Deno runtime
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const query = url.search.startsWith('?') ? url.search.slice(1) : url.search;

  // AdMob يرسل طلب تحقق فارغ عند حفظ الإعدادات
  if (!query) return new Response('ok', { status: 200 });

  let params: URLSearchParams | null = null;
  try {
    params = await verify(query);
  } catch (e) {
    console.error('[admob-ssv] verification error', e);
    return new Response('verification error', { status: 500 }); // AdMob سيعيد المحاولة
  }
  if (!params) {
    console.warn('[admob-ssv] invalid signature');
    return new Response('invalid signature', { status: 403 });
  }

  const sessionId = params.get('custom_data');
  const userId = params.get('user_id');
  const transactionId = params.get('transaction_id');
  if (!sessionId || !userId || !transactionId) {
    // إعلان موقّع لكن بدون جلسة Kodax (مثلاً طلب اختبار من لوحة AdMob)
    return new Response('ok', { status: 200 });
  }

  const admin = createClient(
    // @ts-ignore: Deno runtime
    Deno.env.get('SUPABASE_URL') ?? '',
    // @ts-ignore: Deno runtime
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  const { data, error } = await admin.rpc('coins_credit_ad_ssv', {
    p_session_id: sessionId,
    p_user_id: userId,
    p_transaction_id: transactionId,
  });
  if (error) {
    console.error('[admob-ssv] credit failed', error.message);
    return new Response('credit failed', { status: 500 });
  }
  console.log('[admob-ssv] result', JSON.stringify(data));
  // نرد بـ 200 حتى لو رُفضت الجلسة (حد يومي/مكررة) لتجنب إعادة المحاولة بلا فائدة
  return new Response('ok', { status: 200 });
});

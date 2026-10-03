/**
 * اختبار حصة Gemini وزيادتها بالإعلانات والـcache على PostgreSQL حقيقي محلياً (PGlite):
 *   مخطط الإنتاج (بنية فقط من النسخة الاحتياطية) + الـmigrations غير المطبّقة بالترتيب
 *   + مسار ai-chat الحقيقي (core.ts) موصولاً بهذه القاعدة مع Gemini وهمي.
 * لا يتصل بأي Supabase ولا Gemini. التشغيل:
 *   npx tsx scripts/challenge-audit/ai-quota-db.test.ts
 * يحتاج @electric-sql/pglite في PGLITE_DIR (الافتراضي %TEMP%/kxtools) ومسار المخطط في KODAX_PROD_SCHEMA.
 */
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { handleChat, clearMemoryCache, type ChatDeps } from '../../supabase/functions/ai-chat/core';

const ROOT = join(__dirname, '../..');
const PGLITE_DIR = process.env.PGLITE_DIR ?? join(tmpdir(), 'kxtools');
const SCHEMA = process.env.KODAX_PROD_SCHEMA ?? join(ROOT, '../kodax-backups/prod-20261001-004734/public_schema.sql');
const MIG = (n: string) => join(ROOT, 'supabase/migrations', n + '.sql');
const read = (p: string) => readFileSync(p, 'utf8').replace(/^﻿/, '');

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const U = '11111111-1111-1111-1111-111111111111';
const V = '22222222-2222-2222-2222-222222222222';
const W = '33333333-3333-3333-3333-333333333333';
const E = '44444444-4444-4444-4444-444444444444'; // مسار ai-chat الكامل

(async () => {
  const { PGlite } = await import(pathToFileURL(join(PGLITE_DIR, 'node_modules/@electric-sql/pglite/dist/index.js')).href);
  const { uuid_ossp } = await import(pathToFileURL(join(PGLITE_DIR, 'node_modules/@electric-sql/pglite/dist/contrib/uuid_ossp.js')).href);
  const db: any = new PGlite({ extensions: { uuid_ossp } });

  await db.exec(`
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE ROLE supabase_admin NOLOGIN; CREATE ROLE authenticator NOLOGIN; CREATE ROLE dashboard_user NOLOGIN;
    CREATE ROLE supabase_auth_admin NOLOGIN; CREATE ROLE pgbouncer NOLOGIN;
    CREATE SCHEMA extensions; CREATE EXTENSION "uuid-ossp" SCHEMA extensions;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb, created_at timestamptz DEFAULT now());
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT current_setting('request.jwt.claim.role', true) $$;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{}'::jsonb $$;
    GRANT USAGE ON SCHEMA auth, extensions, public TO anon, authenticated, service_role;
  `);
  await db.exec(
    read(SCHEMA)
      .replace(/^\\(un)?restrict .*$/gm, '')
      .replace(/^SET transaction_timeout = 0;$/m, '')
      .replace(/^CREATE SCHEMA public;$/m, '')
      .replace(/^COMMENT ON SCHEMA public .*$/m, '')
      .replace(/^SELECT pg_catalog\.set_config\('search_path', '', false\);$/m, 'SET search_path = public, extensions;')
  );
  await db.exec(`SET search_path = public, extensions; SET row_security = on;`);
  const coins = read(MIG('20260930000000_free_coins_system'));
  await db.exec(coins.match(/INSERT INTO coin_config[\s\S]*?;\n/)![0]); // يتضمن ai_quota القديم (الحصص الخمس)
  for (const id of [U, V, W, E]) {
    await db.query(`INSERT INTO auth.users (id) VALUES ($1)`, [id]);
    await db.query(`INSERT INTO profiles (id, username, xp, level) VALUES ($1, $2, 0, 1)`, [id, 'u' + id.slice(0, 4)]);
  }
  for (const m of [
    '20261001010000_server_verified_challenges',
    '20261001020000_curriculum_lesson_catalog',
    '20261002000000_protect_profile_columns',
    '20261002010000_server_side_xp',
    '20261002020000_challenge_access',
    '20261002030000_ai_assistant',
  ]) await db.exec(read(MIG(m)));
  await db.exec(read(MIG('20261002030000_ai_assistant'))); // قابلة للتكرار
  // migrations التقدم والاقتصاد (تعيد تعريف _ai_quota_state و ai_quota_reserve مع حزمة الكوينات والتحليلات)
  for (const m of ['20261003000000_progression_catalog', '20261003010000_progression_economy', '20261003020000_challenge_solutions', '20261003030000_challenge_expansion']) {
    await db.exec(read(MIG(m)));
  }
  console.log('— production schema + pending migrations applied (AI migration twice)\n');

  async function as(role: 'authenticated' | 'service_role', uid: string | null, fn: () => Promise<any>): Promise<any> {
    await db.exec('RESET ROLE');
    await db.query(`SELECT set_config('request.jwt.claim.sub', $1, false)`, [uid ?? '']);
    await db.exec(`SET ROLE ${role}`);
    try {
      return await fn();
    } finally {
      await db.exec('RESET ROLE');
    }
  }
  const rpcAs = async (role: 'authenticated' | 'service_role', uid: string | null, sql: string, p: unknown[] = []) =>
    (await as(role, uid, () => db.query(sql, p))).rows[0]?.r;
  const fails = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      return false;
    } catch {
      return true;
    }
  };
  const quota = (uid: string) => rpcAs('authenticated', uid, `SELECT ai_get_quota() r`);
  const reserve = (uid: string) => rpcAs('service_role', null, `SELECT ai_quota_reserve($1) r`, [uid]);
  const release = (uid: string) => rpcAs('service_role', null, `SELECT ai_quota_release($1) r`, [uid]);
  const balance = async (uid: string) => (await db.query(`SELECT COALESCE((SELECT total_points FROM user_points WHERE user_id = $1), 0) b`, [uid])).rows[0].b;
  // تقديم الوقت للجلسة: كأن الإعلان استغرق 10 ثوانٍ، وكأن الإعلان السابق قبل دقيقة (فاصل 30 ثانية)
  const age = async (uid: string) => {
    await db.query(`UPDATE ad_reward_sessions SET created_at = created_at - interval '10 seconds' WHERE user_id = $1 AND status = 'pending'`, [uid]);
    await db.query(`UPDATE ad_reward_sessions SET rewarded_at = rewarded_at - interval '60 seconds' WHERE user_id = $1 AND status = 'rewarded'`, [uid]);
  };
  const watchAiAd = async (uid: string) => {
    const s = await rpcAs('authenticated', uid, `SELECT ai_start_ad_session() r`);
    if (!s.success) return { start: s };
    await age(uid);
    const c = await rpcAs('authenticated', uid, `SELECT coins_claim_ad_reward($1) r`, [s.session_id]);
    await age(uid);
    return { start: s, claim: c };
  };

  // ===== الإعدادات =====
  console.log('== Config');
  const cfg = (await db.query(`SELECT value FROM coin_config WHERE key = 'ai_quota'`)).rows[0].value;
  check('ai_quota config migrated to one place (old per-bucket keys removed)', cfg.daily_limit === 10 && cfg.ad_bonus === 3 && cfg.ads_per_bonus === 2 && cfg.max_ad_bonuses_per_day === 2 && !('chat' in cfg), JSON.stringify(cfg));

  // ===== الحصة =====
  console.log('\n== Quota');
  let q = await quota(U);
  check('ai_get_quota shape: used 0 / limit 10', q.success && q.used === 0 && q.limit === 10 && q.remaining === 10 && q.ads.can_watch === true && q.ads.progress === 0, JSON.stringify(q));
  let allowed = 0;
  for (let i = 0; i < 12; i++) if ((await reserve(U)).allowed) allowed++;
  q = await quota(U);
  check('per-user daily limit enforced (10 allowed of 12)', allowed === 10 && q.used === 10 && q.remaining === 0);
  check('reserve over limit → quota_exceeded with quota', (await reserve(U)).code === 'quota_exceeded');
  await release(U);
  check('release returns one request (Gemini failure not counted)', (await quota(U)).used === 9);
  check('after release, one more request allowed', (await reserve(U)).allowed === true);
  await release(V);
  check('release never goes below zero', (await quota(V)).used === 0);

  // السقف العام للمشروع
  await db.query(`UPDATE coin_config SET value = value || '{"global_daily_limit": 11}' WHERE key = 'ai_quota'`);
  const g1 = await reserve(V);
  const g2 = await reserve(V);
  check('project-wide daily limit enforced across users', g1.allowed === true && g2.allowed === false && g2.code === 'global_limit', JSON.stringify(g2));
  await release(V);
  await db.query(`UPDATE coin_config SET value = value || '{"global_daily_limit": 200}' WHERE key = 'ai_quota'`);

  // توافق الدالة القديمة: كل الأنواع تستهلك نفس الحصة
  const c1 = await rpcAs('authenticated', V, `SELECT ai_consume_quota('hint') r`);
  const c2 = await rpcAs('authenticated', V, `SELECT ai_consume_quota('solve') r`);
  check('old ai_consume_quota(bucket) uses the unified counter', c1.allowed && c2.allowed && (await quota(V)).used === 2);
  await release(V);
  await release(V);

  // ===== أمان =====
  console.log('\n== Security');
  check('clients cannot call ai_quota_reserve', await fails(() => as('authenticated', U, () => db.query(`SELECT ai_quota_reserve($1)`, [U]))));
  check('clients cannot call ai_quota_release (no self-refund)', await fails(() => as('authenticated', U, () => db.query(`SELECT ai_quota_release($1)`, [U]))));
  check('clients cannot write ai_daily_usage', await fails(() => as('authenticated', U, () => db.query(`UPDATE ai_daily_usage SET used = 0 WHERE user_id = $1`, [U]).then((r: any) => { if (!r.affectedRows) throw new Error('no rows'); }))));
  check('clients cannot read/write the response cache', await fails(() => as('authenticated', U, () => db.query(`SELECT * FROM ai_response_cache`))));
  check('clients cannot call cache functions', await fails(() => as('authenticated', U, () => db.query(`SELECT ai_cache_put('k','v','m','x',1)`))));
  check('clients cannot read global usage', await fails(() => as('authenticated', U, () => db.query(`SELECT * FROM ai_global_usage`))));
  check('clients cannot create ad sessions directly', await fails(() => as('authenticated', V, () => db.query(`INSERT INTO ad_reward_sessions (user_id, ad_date, purpose, status) VALUES ($1, CURRENT_DATE, 'ai_quota', 'rewarded')`, [V]))));
  check('anon cannot read quota', await fails(() => as('anon' as any, null, () => db.query(`SELECT ai_get_quota()`))));

  // ===== الإعلانات =====
  console.log('\n== Rewarded ads → AI quota');
  {
    const s = await rpcAs('authenticated', V, `SELECT ai_start_ad_session() r`);
    check('AI ad session created (existing ad system, purpose ai_quota)', s.success && s.purpose === 'ai_quota' && !!s.session_id);
    const early = await rpcAs('authenticated', V, `SELECT coins_claim_ad_reward($1) r`, [s.session_id]);
    check('claim before the ad could finish → too_fast (no credit)', early.success === false && early.code === 'too_fast');
    check('another user cannot claim this session', (await rpcAs('authenticated', U, `SELECT coins_claim_ad_reward($1) r`, [s.session_id])).code === 'invalid_session');
    await age(V);
    const c = await rpcAs('authenticated', V, `SELECT coins_claim_ad_reward($1) r`, [s.session_id]);
    check('1st ad: counted, no bonus yet (needs 2), no coins', c.success && c.purpose === 'ai_quota' && c.quota.limit === 10 && c.quota.ads.progress === 1 && (await balance(V)) === 0);
    const dup = await rpcAs('authenticated', V, `SELECT coins_claim_ad_reward($1) r`, [s.session_id]);
    check('re-claiming the same ad → duplicate, nothing added', dup.duplicate === true && (await quota(V)).ads.watched === 1);
    const tooSoon = await rpcAs('authenticated', V, `SELECT ai_start_ad_session() r`);
    check('next ad right away → cooldown (shared ad gap)', tooSoon.success === false && tooSoon.code === 'cooldown');
    await age(V);
    const second = await watchAiAd(V);
    check('2nd ad → +3 (limit 13), bonus_unlocked', second.claim?.success && second.claim.quota.limit === 13 && second.claim.bonus_unlocked === true, JSON.stringify(second.claim?.quota));
    await watchAiAd(V);
    const fourth = await watchAiAd(V);
    check('4 ads → +6 max (limit 16)', fourth.claim?.quota.limit === 16 && fourth.claim.quota.ads.can_watch === false);
    const fifth = await rpcAs('authenticated', V, `SELECT ai_start_ad_session() r`);
    check('5th AI ad refused (ai_ad_limit) — bonus capped per day', fifth.success === false && fifth.code === 'ai_ad_limit');
    check('AI ads never gave coins', (await balance(V)) === 0);
    // إعلانات الكوينات منفصلة
    const cs = await rpcAs('authenticated', V, `SELECT coins_start_ad_session() r`);
    await age(V);
    const cc = await rpcAs('authenticated', V, `SELECT coins_claim_ad_reward($1) r`, [cs.session_id]);
    const state = await rpcAs('authenticated', V, `SELECT coins_get_state() r`);
    check('coin ads unaffected: AI ads not counted in coin ad limit', cs.success && cc.success && cc.purpose === 'coins' && (await balance(V)) === 15 && state.ads.watched_today === 1, JSON.stringify(state.ads));
    check('coin ad did not change AI quota', (await quota(V)).limit === 16);
  }
  {
    // مسار AdMob SSV (السيرفر يعتمد الإعلان بعد التحقق من توقيع Google)
    const s = await rpcAs('authenticated', W, `SELECT ai_start_ad_session() r`);
    const v1 = await rpcAs('service_role', null, `SELECT coins_credit_ad_ssv($1, $2, 'txn-ai-1') r`, [s.session_id, W]);
    const v2 = await rpcAs('service_role', null, `SELECT coins_credit_ad_ssv($1, $2, 'txn-ai-1') r`, [s.session_id, W]);
    check('SSV credits AI ad once (same transaction → duplicate)', v1.success && v1.purpose === 'ai_quota' && v2.duplicate === true && (await quota(W)).ads.watched === 1);
    const wrongUser = await rpcAs('service_role', null, `SELECT coins_credit_ad_ssv($1, $2, 'txn-ai-2') r`, [s.session_id, U]);
    check('SSV with wrong user rejected', wrongUser.success === false && wrongUser.code === 'invalid_session');
  }

  // ===== Cache =====
  console.log('\n== Cache');
  await rpcAs('service_role', null, `SELECT ai_cache_put('key-1', 'رد عام', 'gemini-x', 'v1', 24) r`);
  const hit1 = await rpcAs('service_role', null, `SELECT ai_cache_get('key-1') r`);
  const hit2 = await rpcAs('service_role', null, `SELECT ai_cache_get('key-1') r`);
  const hits = (await db.query(`SELECT hits FROM ai_response_cache WHERE cache_key = 'key-1'`)).rows[0].hits;
  check('cache put/get works and counts hits', hit1 === 'رد عام' && hit2 === 'رد عام' && hits === 2);
  await db.query(`UPDATE ai_response_cache SET expires_at = now() - interval '1 minute' WHERE cache_key = 'key-1'`);
  check('expired cache entry is not served', (await rpcAs('service_role', null, `SELECT ai_cache_get('key-1') r`)) === null);

  // ===== مسار ai-chat الكامل على القاعدة =====
  console.log('\n== ai-chat pipeline on the database');
  clearMemoryCache();
  let geminiCalls = 0;
  let geminiFails = false;
  const fakeFetch = (async () => {
    geminiCalls++;
    if (geminiFails) return new Response('{}', { status: 500 });
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'شرح عام مفيد عن البرمجة.' }] } }], usageMetadata: { totalTokenCount: 30 } }), { status: 200 });
  }) as unknown as typeof fetch;
  const deps: ChatDeps = {
    getUser: async () => ({ id: E }),
    reserveQuota: async (uid) => {
      const r = await reserve(uid);
      return { allowed: r.allowed, code: r.code, quota: r.quota };
    },
    releaseQuota: async (uid) => release(uid),
    cacheGet: async (k) => rpcAs('service_role', null, `SELECT ai_cache_get($1) r`, [k]),
    cachePut: async (k, v, m, ver) => {
      await rpcAs('service_role', null, `SELECT ai_cache_put($1, $2, $3, $4, 168) r`, [k, v, m, ver]);
    },
    apiKey: 'test-key-not-real',
    fetchImpl: fakeFetch,
  };
  const used = async () => (await quota(E)).used;
  let r = await handleChat(deps, { message: 'كيف اجمع كوينات؟' });
  check('smart reply: quota unchanged (0)', r.body.source === 'smart' && (await used()) === 0 && geminiCalls === 0);
  r = await handleChat(deps, { message: 'ما هي أفضل عادات كتابة الكود النظيف؟' });
  check('Gemini reply: counted (1) and response shows used / limit', r.body.source === 'gemini' && (await used()) === 1 && (r.body.quota as any)?.used === 1 && (r.body.quota as any)?.limit === 10);
  clearMemoryCache();
  r = await handleChat(deps, { message: 'ما هي أفضل عادات كتابة الكود النظيف؟' });
  check('same general question → DB cache, not counted', r.body.source === 'cache' && (await used()) === 1 && geminiCalls === 1);
  geminiFails = true;
  r = await handleChat(deps, { message: 'اشرح لي الـ closure بمثال' });
  check('Gemini error: released, still 1', r.status === 502 && (await used()) === 1);
  geminiFails = false;
  for (let i = 0; i < 9; i++) await handleChat(deps, { message: `اشرح لي مفهوم رقم ${i} بالبرمجة بالتفصيل` });
  r = await handleChat(deps, { message: 'اشرح لي الـ generators بمثال' });
  check('after 10 Gemini requests → 429 quota_exceeded', r.status === 429 && (await used()) === 10);
  r = await handleChat(deps, { message: 'شنو هي الكوينات؟' });
  check('smart replies still work after the limit', r.status === 200 && r.body.source === 'smart');

  console.log(`\n${pass}/${pass + fail} passed`);
  if (fail) process.exitCode = 1;
})().catch((e) => {
  console.error('FAIL setup/run error:', e?.message ?? e);
  process.exitCode = 1;
});

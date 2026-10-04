/**
 * اختبار الإشعارات الفورية (20261004040000_push_notifications + push-send/core.ts) على PGlite.
 * التشغيل: npx tsx scripts/challenge-audit/push-db.test.ts
 */
import { createEnv, makeChecker, migration } from './_pglite-env';
import { processBatch, processReceipts, type PushDeps, type ExpoMessage } from '../../supabase/functions/push-send/core';

const ADMIN = 'ffffffff-0000-0000-0000-000000000001';
const U = 'ffffffff-0000-0000-0000-000000000002';
const V = 'ffffffff-0000-0000-0000-000000000003';
const W = 'ffffffff-0000-0000-0000-000000000004'; // بلا جهاز
const X = 'ffffffff-0000-0000-0000-000000000005';
const Y = 'ffffffff-0000-0000-0000-000000000006'; // مستخدم جديد: يتحقق من الافتراضي
const tok = (n: string) => `ExponentPushToken[${n}]`;
const { check, done } = makeChecker();

(async () => {
  const env = await createEnv();
  const { q, one, userQ, userOne, anonQ, denied, errorOf, as } = env;
  await q(`CREATE SCHEMA IF NOT EXISTS storage`);
  await env.db.exec(`CREATE TABLE storage.objects (id uuid DEFAULT gen_random_uuid(), bucket_id text, name text, owner uuid);
    CREATE TABLE storage.buckets (id text PRIMARY KEY, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;`);
  for (const [id, admin] of [[ADMIN, true], [U, false], [V, false], [W, false], [X, false], [Y, false]] as const) await env.addUser(id, { admin, username: 'n' + id.slice(-1) });
  await env.applyUpTo('20261004030000_admin_backend');
  await env.db.exec(migration('20261004040000_push_notifications'));
  await env.db.exec(migration('20261004040000_push_notifications'));
  await env.db.exec(migration('20261004060000_push_quiet_hours_scope'));
  await env.db.exec(migration('20261004070000_push_quiet_hours_fixes'));
  await env.db.exec(migration('20261004080000_quiet_hours_off_by_default'));
  console.log('— push migration applied twice (+ quiet hours scope)\n');
  // ساعات هدوء لا تعترض الاختبار افتراضياً
  const svc = (sql: string, p: unknown[] = []) => as('service_role', null, () => one(sql, p));
  const outbox = async (user: string, kind?: string) =>
    (await one(`SELECT count(*)::int n FROM notification_outbox WHERE user_id = $1 ${kind ? `AND kind = '${kind}'` : ''}`, [user])).n as number;

  // ---------------- الأجهزة ----------------
  check('anon cannot register token', await denied(() => anonQ(`SELECT push_register_token($1, 'android')`, [tok('a')])));
  check('invalid token format rejected', (await userOne(U, `SELECT push_register_token('not-a-token', 'android') r`)).r.code === 'invalid_token');
  check('register token works', (await userOne(U, `SELECT push_register_token($1, 'android', 'dev-1', '1.2.0') r`, [tok('u1')])).r.success === true);
  await userQ(V, `SELECT push_register_token($1, 'android')`, [tok('v1')]);
  await userQ(X, `SELECT push_register_token($1, 'ios')`, [tok('x1')]);
  await userQ(ADMIN, `SELECT push_register_token($1, 'android')`, [tok('a1')]);
  check('user sees only own tokens', (await userQ(U, `SELECT token FROM push_tokens`)).rows.length === 1);
  check('client cannot insert tokens directly', await denied(() => userQ(U, `INSERT INTO push_tokens (user_id, token, platform) VALUES ($1, $2, 'android')`, [V, tok('evil')])));
  await userQ(W, `SELECT push_unregister_token($1)`, [tok('u1')]);
  check("user cannot unregister someone else's token", (await one(`SELECT count(*)::int n FROM push_tokens WHERE token = $1`, [tok('u1')])).n === 1);
  // نفس الجهاز يسجّل دخول حساب آخر: الرمز ينتقل
  await userQ(W, `SELECT push_register_token($1, 'android')`, [tok('shared')]);
  await userQ(X, `SELECT push_register_token($1, 'android')`, [tok('shared')]);
  check('same device token moves to the new account', (await one(`SELECT user_id FROM push_tokens WHERE token = $1`, [tok('shared')])).user_id === X);
  check('W now has no device', (await one(`SELECT count(*)::int n FROM push_tokens WHERE user_id = $1`, [W])).n === 0);

  // ---------------- التفضيلات ----------------
  const pg = (await userOne(U, `SELECT notification_prefs_get() r`)).r;
  check('prefs default on', pg.success && pg.prefs.likes === true && pg.devices === 1);
  // ساعات الهدوء مطفأة افتراضياً: إشعار اجتماعي لمستخدم جديد يُرسَل فوراً في أي ساعة
  await userQ(Y, `SELECT push_register_token($1, 'android')`, [tok('y1')]);
  const pgY = (await userOne(Y, `SELECT notification_prefs_get() r`)).r;
  check('quiet hours off by default for a new user', pgY.prefs.quiet_start === 0 && pgY.prefs.quiet_end === 0,
    `quiet=${pgY.prefs.quiet_start}-${pgY.prefs.quiet_end}`);
  const snipY = (await userOne(Y, `INSERT INTO code_snippets (user_id, title, code, language, is_public) VALUES ($1, 'Y', 'x', 'python', true) RETURNING id`, [Y])).id;
  await userQ(V, `INSERT INTO code_likes (user_id, snippet_id) VALUES ($1, $2)`, [V, snipY]);
  const dueY = await one(`SELECT scheduled_at <= now() due FROM notification_outbox WHERE user_id = $1 AND kind = 'like'`, [Y]);
  check('social notification is due immediately by default', dueY?.due === true);
  const ps = (await userOne(U, `SELECT notification_prefs_set('{"follows": false, "quiet_start": 0, "quiet_end": 0}'::jsonb) r`)).r;
  check('prefs update (follows off, quiet hours disabled via 0-0)', ps.prefs.follows === false && ps.prefs.quiet_start === 0);
  await userQ(V, `SELECT notification_prefs_set('{"quiet_start": 0, "quiet_end": 0}'::jsonb)`);
  await userQ(X, `SELECT notification_prefs_set('{"quiet_start": 0, "quiet_end": 0}'::jsonb)`);
  await userQ(ADMIN, `SELECT notification_prefs_set('{"quiet_start": 0, "quiet_end": 0}'::jsonb)`);
  check('client cannot write prefs table directly', await denied(() => userQ(U, `UPDATE notification_preferences SET likes = false WHERE user_id = $1 RETURNING 1`, [U]).then((r: any) => { if (!r.rows.length) throw new Error('noop'); })));

  // ---------------- مصادر الإشعارات ----------------
  const snip = (await userOne(U, `INSERT INTO code_snippets (user_id, title, code, language, is_public) VALUES ($1, 'S', 'x', 'python', true) RETURNING id`, [U])).id;
  await userQ(V, `INSERT INTO code_likes (user_id, snippet_id) VALUES ($1, $2)`, [V, snip]);
  check('like → push queued for owner (with deep link)', (await outbox(U, 'like')) === 1 &&
    (await one(`SELECT data->>'url' u FROM notification_outbox WHERE user_id = $1 AND kind = 'like'`, [U])).u === `/code/${snip}`);
  await userQ(V, `INSERT INTO code_comments (user_id, snippet_id, content) VALUES ($1, $2, 'nice')`, [V, snip]);
  check('comment → push queued', (await outbox(U, 'comment')) === 1);
  await userQ(V, `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`, [V, U]);
  check('follow → no push when user disabled follows', (await outbox(U, 'follow')) === 0);
  await userQ(U, `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`, [U, V]);
  await userQ(U, `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`, [U, V]);
  await userQ(U, `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`, [U, V]);
  check('follow/unfollow/refollow → single push (dedup)', (await outbox(V, 'follow')) === 1);
  await userQ(U, `INSERT INTO app_notifications (user_id, type, title, message) VALUES ($1, 'like', 'fake', 'fake')`, [U]);
  check('client-inserted own notification never produces push', (await outbox(U, 'like')) === 1);
  const snipW = (await userOne(W, `INSERT INTO code_snippets (user_id, title, code, language, is_public) VALUES ($1, 'W', 'x', 'python', true) RETURNING id`, [W])).id;
  await userQ(V, `INSERT INTO code_likes (user_id, snippet_id) VALUES ($1, $2)`, [V, snipW]);
  check('user without device: in-app notification only, no push row', (await outbox(W)) === 0 &&
    (await one(`SELECT count(*)::int n FROM app_notifications WHERE user_id = $1 AND type = 'like'`, [W])).n === 1);

  const conv = (await userOne(V, `SELECT get_or_create_conversation($1, $2) id`, [V, U])).id;
  await userQ(V, `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, 'hello 1')`, [conv, V]);
  await userQ(V, `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, 'hello 2')`, [conv, V]);
  check('DM burst → one push for recipient (2-minute collapse), none for sender', (await outbox(U, 'message')) === 1 && (await outbox(V, 'message')) === 0);
  check('DM push deep-links to the conversation', (await one(`SELECT data->>'url' u FROM notification_outbox WHERE user_id = $1 AND kind = 'message'`, [U])).u === `/message/${conv}`);
  await q(`UPDATE notification_outbox SET dedup_key = dedup_key || ':old' WHERE kind = 'message'`); // نافذة جديدة
  await userQ(U, `INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)`, [U, X]);
  const convX = (await one(`INSERT INTO conversations DEFAULT VALUES RETURNING id`)).id;
  await q(`INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)`, [convX, U, X]);
  await q(`INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, 'blocked msg')`, [convX, X]); // تجاوز RLS لمحاكاة رسالة قديمة
  check('no DM push across a block', (await one(`SELECT count(*)::int n FROM notification_outbox WHERE user_id = $1 AND kind = 'message' AND data->>'conversation_id' = $2`, [U, convX])).n === 0);

  const ticket = (await userOne(U, `INSERT INTO support_tickets (user_id, subject) VALUES ($1, 'help') RETURNING id`, [U])).id;
  await userQ(ADMIN, `INSERT INTO support_messages (ticket_id, sender_type, sender_id, message) VALUES ($1, 'admin', $2, 'hi')`, [ticket, ADMIN]);
  check('admin support reply → push to user', (await outbox(U, 'support')) === 1);

  // حد المعدل
  await q(`UPDATE coin_config SET value = jsonb_set(value, '{social_per_hour}', '3') WHERE key = 'push'`);
  for (let i = 0; i < 5; i++) {
    const s = (await userOne(U, `INSERT INTO code_snippets (user_id, title, code, language, is_public) VALUES ($1, $2, 'x', 'python', true) RETURNING id`, [U, 'R' + i])).id;
    await userQ(V, `INSERT INTO code_likes (user_id, snippet_id) VALUES ($1, $2)`, [V, s]);
  }
  check('social rate limit caps pushes per hour', (await one(`SELECT count(*)::int n FROM notification_outbox WHERE user_id = $1 AND kind IN ('like','comment','follow')`, [U])).n === 3);
  await q(`UPDATE coin_config SET value = jsonb_set(value, '{social_per_hour}', '10') WHERE key = 'push'`);

  // ساعات الهدوء: نافذة تغطي الساعة الحالية → مؤجَّل للمستقبل
  const nowH = (await one(`SELECT EXTRACT(HOUR FROM now() AT TIME ZONE 'Asia/Baghdad')::int h`)).h;
  await userQ(V, `SELECT notification_prefs_set($1::jsonb)`, [JSON.stringify({ quiet_start: nowH, quiet_end: (nowH + 1) % 24 })]);
  const sV = (await userOne(V, `INSERT INTO code_snippets (user_id, title, code, language, is_public) VALUES ($1, 'Q', 'x', 'python', true) RETURNING id`, [V])).id;
  await userQ(X, `INSERT INTO code_likes (user_id, snippet_id) VALUES ($1, $2)`, [X, sV]);
  const qrow = await one(`SELECT scheduled_at > now() + interval '1 minute' later FROM notification_outbox WHERE user_id = $1 AND kind = 'like'`, [V]);
  check('quiet hours defer delivery', qrow?.later === true);
  const convQ = (await userOne(X, `SELECT get_or_create_conversation($1, $2) id`, [X, V])).id;
  await userQ(X, `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, 'night msg')`, [convQ, X]);
  const dmQ = await one(`SELECT scheduled_at <= now() now_ FROM notification_outbox WHERE user_id = $1 AND kind = 'message'`, [V]);
  check('quiet hours do not delay direct messages', dmQ?.now_ === true);
  await q(`DELETE FROM notification_outbox WHERE user_id = $1 AND kind = 'message'`, [V]);

  // حملة بموعد صريح داخل ساعات الهدوء: يُحترم الموعد ولا يُنقل لنهاية الهدوء
  const explicitAt = (await one(`SELECT (now() + interval '5 minutes') t`)).t;
  const campExp = (await userOne(ADMIN, `SELECT admin_create_campaign('Timed', 'Body', 'user', $1::jsonb, NULL, NULL, $2::timestamptz) r`,
    [JSON.stringify({ user_id: V }), explicitAt])).r;
  const expRow = await one(`SELECT scheduled_at FROM notification_outbox WHERE campaign_id = $1`, [campExp.campaign_id]);
  check('explicit campaign schedule is not moved by quiet hours',
    campExp.success === true && new Date(expRow.scheduled_at).getTime() === new Date(explicitAt).getTime(),
    `scheduled=${expRow?.scheduled_at} requested=${explicitAt}`);

  // "أرسل الآن" داخل ساعات الهدوء مع صلاحية قصيرة: لا يؤجَّل لما بعد انتهائها (وإلا لا يصل أبداً)
  const campExpiry = (await userOne(ADMIN, `SELECT admin_create_campaign('Expiring', 'Body', 'user', $1::jsonb, NULL, NULL, NULL, now() + interval '10 minutes') r`,
    [JSON.stringify({ user_id: V })])).r;
  const expiryRow = await one(`SELECT scheduled_at < expires_at ok, scheduled_at <= now() + interval '1 minute' soon FROM notification_outbox WHERE campaign_id = $1`, [campExpiry.campaign_id]);
  check('quiet hours never defer a notification past its expiry', expiryRow?.ok === true && expiryRow?.soon === true,
    JSON.stringify(expiryRow));
  await q(`DELETE FROM notification_outbox WHERE campaign_id IN ($1, $2)`, [campExp.campaign_id, campExpiry.campaign_id]);
  await q(`DELETE FROM notification_campaigns WHERE id IN ($1, $2)`, [campExp.campaign_id, campExpiry.campaign_id]);
  await q(`DELETE FROM admin_audit_log WHERE action = 'create_campaign'`);
  await userQ(V, `SELECT notification_prefs_set('{"quiet_start": 0, "quiet_end": 0}'::jsonb)`);

  // ---------------- التذكيرات ----------------
  const hour = (await one(`SELECT EXTRACT(HOUR FROM now() AT TIME ZONE 'Asia/Baghdad')::int h`)).h;
  await userQ(X, `SELECT notification_prefs_set($1::jsonb)`, [JSON.stringify({ reminder_hour: hour })]);
  await q(`INSERT INTO user_activity_days (user_id, day, lessons) VALUES ($1, _coin_today() - 1, 1)`, [X]);
  await q(`INSERT INTO user_streaks (user_id, current_streak, best_streak, last_active_day) VALUES ($1, 4, 4, _coin_today() - 1)
           ON CONFLICT (user_id) DO UPDATE SET current_streak = 4, last_active_day = _coin_today() - 1`, [X]);
  await q(`UPDATE coin_config SET value = jsonb_set(value, '{streak_warning_hour}', to_jsonb($1::int)) WHERE key = 'push'`, [hour]);
  check('reminders not callable by clients', await denied(() => userQ(X, `SELECT push_schedule_reminders()`)));
  const rem = (await svc(`SELECT push_schedule_reminders() r`)).r;
  check('daily goal reminder + streak warning queued', rem.daily_goal >= 1 && rem.streak >= 1 && (await outbox(X, 'daily_goal')) === 1 && (await outbox(X, 'streak')) === 1, JSON.stringify(rem));
  await svc(`SELECT push_schedule_reminders() r`);
  check('reminders not duplicated on rerun the same day', (await outbox(X, 'daily_goal')) === 1 && (await outbox(X, 'streak')) === 1);

  // ---------------- الإرسال (push-send core موصول بالقاعدة) ----------------
  await q(`UPDATE notification_outbox SET scheduled_at = now() - interval '1 second' WHERE status = 'queued' AND user_id <> $1`, [V]);
  const sentMessages: ExpoMessage[] = [];
  let receiptsAsked: string[] = [];
  const deps: PushDeps = {
    claim: async (limit) => (await svc(`SELECT push_claim_batch($1) r`, [limit])).r,
    recordResults: async (r) => { await svc(`SELECT push_record_results($1::jsonb) r`, [JSON.stringify(r)]); },
    receiptsDue: async (limit) => (await svc(`SELECT push_receipts_due($1) r`, [limit])).r,
    recordReceipts: async (r) => { await svc(`SELECT push_record_receipts($1::jsonb) r`, [JSON.stringify(r)]); },
    expoSend: async (msgs) => {
      sentMessages.push(...msgs);
      return msgs.map((m, i) => (m.to === tok('x1') ? { status: 'error' as const, message: 'gone', details: { error: 'DeviceNotRegistered' } } : { status: 'ok' as const, id: `t-${sentMessages.length}-${i}` }));
    },
    expoReceipts: async (ids) => { receiptsAsked = ids; return Object.fromEntries(ids.map((id) => [id, { status: 'ok' as const }])); },
  };
  check('claim not callable by clients', await denied(() => userQ(U, `SELECT push_claim_batch(10)`)));
  const queuedBefore = (await one(`SELECT count(*)::int n FROM notification_outbox WHERE status = 'queued' AND scheduled_at <= now()`)).n;
  const res = await processBatch(deps, 200);
  check('batch claims all due messages', res.claimed === queuedBefore && queuedBefore > 0, JSON.stringify(res));
  check('Android channel and deep link data included', sentMessages.every((m) => m.channelId && typeof m.data.url === 'string'));
  check('invalid device token disabled (DeviceNotRegistered)', (await one(`SELECT enabled, disabled_reason FROM push_tokens WHERE token = $1`, [tok('x1')])).enabled === false);
  check('messages to working devices marked sent', (await one(`SELECT count(*)::int n FROM notification_outbox WHERE status = 'sent'`)).n === res.sent && res.sent > 0);
  check('nothing claimed twice (second run empty)', (await processBatch(deps, 200)).claimed === 0);
  // فشل مؤقت من Expo → إعادة محاولة ثم failed بعد الحد
  await userQ(U, `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, 'retry me')`, [conv, U]);
  await q(`UPDATE notification_outbox SET scheduled_at = now() - interval '1 second' WHERE status = 'queued'`);
  const failing: PushDeps = { ...deps, expoSend: async () => { throw new Error('expo_http_503'); } };
  await processBatch(failing, 10);
  const retry = await one(`SELECT status, attempts, scheduled_at > now() later FROM notification_outbox WHERE user_id = $1 AND kind = 'message' ORDER BY id DESC LIMIT 1`, [V]);
  check('temporary failure re-queued with backoff', retry.status === 'queued' && retry.attempts === 1 && retry.later === true);
  for (let i = 0; i < 3; i++) {
    await q(`UPDATE notification_outbox SET scheduled_at = now() - interval '1 second' WHERE status = 'queued'`);
    await processBatch(failing, 10);
  }
  check('marked failed after max attempts', (await one(`SELECT status FROM notification_outbox WHERE user_id = $1 AND kind = 'message' ORDER BY id DESC LIMIT 1`, [V])).status === 'failed');
  // الإيصالات
  await q(`UPDATE notification_outbox SET sent_at = now() - interval '20 minutes' WHERE status = 'sent'`);
  const rc = await processReceipts(deps, 300);
  check('receipts fetched and messages marked delivered', rc.checked > 0 && rc.delivered === rc.checked && receiptsAsked.length > 0 &&
    (await one(`SELECT count(*)::int n FROM notification_outbox WHERE status = 'delivered'`)).n === rc.delivered);

  // ---------------- الحملات ----------------
  check('non-admin cannot preview/create campaigns', (await denied(() => userQ(U, `SELECT admin_campaign_preview('all', '{}'::jsonb)`))) &&
    (await denied(() => userQ(U, `SELECT admin_create_campaign('t', 'b', 'all', '{}'::jsonb)`))));
  const prev = (await userOne(ADMIN, `SELECT admin_campaign_preview('all', '{}'::jsonb) r`)).r;
  check('preview counts users with devices (excludes users without device)', prev.recipients === 5, JSON.stringify(prev));
  await userQ(V, `SELECT notification_prefs_set('{"admin": false}'::jsonb)`);
  const prev2 = (await userOne(ADMIN, `SELECT admin_campaign_preview('all', '{}'::jsonb) r`)).r;
  check('users who turned off admin messages excluded', prev2.recipients === 4);
  const noConfirm = (await userOne(ADMIN, `SELECT admin_create_campaign('Hello', 'Body', 'all', '{}'::jsonb) r`)).r;
  check('all-users campaign requires confirming the recipient count', noConfirm.code === 'confirmation_required' && noConfirm.recipients === 4);
  check('wrong confirmation count rejected', (await userOne(ADMIN, `SELECT admin_create_campaign('Hello', 'Body', 'all', '{}'::jsonb, NULL, NULL, NULL, NULL, 99) r`)).r.code === 'confirmation_required');
  check('invalid deep link rejected', (await userOne(ADMIN, `SELECT admin_create_campaign('Hello', 'Body', 'user', $1::jsonb, 'javascript:alert(1)') r`, [JSON.stringify({ user_id: U })])).r.code === 'invalid_deep_link');
  const camp = (await userOne(ADMIN, `SELECT admin_create_campaign('New course!', 'Check it out', 'all', '{}'::jsonb, '/learn', 'https://kodax.app/img.png', NULL, now() + interval '2 days', 4) r`)).r;
  check('campaign created and queued per recipient', camp.success && camp.recipients === 4 &&
    (await one(`SELECT count(*)::int n FROM notification_outbox WHERE campaign_id = $1`, [camp.campaign_id])).n === camp.queued);
  check('campaign records the real admin as creator', (await one(`SELECT created_by FROM notification_campaigns WHERE id = $1`, [camp.campaign_id])).created_by === ADMIN);
  const single = (await userOne(ADMIN, `SELECT admin_create_campaign('Hi you', 'Personal', 'user', $1::jsonb, '/profile') r`, [JSON.stringify({ user_id: U })])).r;
  check('single-user campaign without confirmation', single.success && single.recipients === 1);
  const seg = (await userOne(ADMIN, `SELECT admin_campaign_preview('segment', '{"segment": "streak_active"}'::jsonb) r`)).r;
  check('segment preview (streak_active)', seg.recipients >= 0);
  const cancel = (await userOne(ADMIN, `SELECT admin_cancel_campaign($1) r`, [camp.campaign_id])).r;
  check('cancel campaign cancels queued messages', cancel.success && cancel.cancelled >= 1 &&
    (await one(`SELECT count(*)::int n FROM notification_outbox WHERE campaign_id = $1 AND status = 'queued'`, [camp.campaign_id])).n === 0);
  const hist = (await userOne(ADMIN, `SELECT admin_campaigns(20) r`)).r;
  check('campaign history with creator and counts', hist.campaigns.length === 2 && hist.campaigns.every((c: any) => c.creator === 'n1') && 'devices' in hist.system);
  check('campaign actions audited', (await one(`SELECT count(*)::int n FROM admin_audit_log WHERE action IN ('create_campaign','cancel_campaign')`)).n === 3);

  // الحذف يزيل الأجهزة والطابور
  await q(`DELETE FROM auth.users WHERE id = $1`, [U]);
  check('account deletion cascades push data', (await one(`SELECT (SELECT count(*) FROM push_tokens WHERE user_id = $1) + (SELECT count(*) FROM notification_outbox WHERE user_id = $1) + (SELECT count(*) FROM notification_preferences WHERE user_id = $1) n`, [U])).n === 0);
  check('no client EXECUTE on internal push functions', (await denied(() => userQ(V, `SELECT _push_enqueue($1, 'admin', 't', 'b', '{}'::jsonb, 'k')`, [V]))));
  done();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

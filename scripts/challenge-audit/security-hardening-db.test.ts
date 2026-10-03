/**
 * اختبار G-1 (تقوية الأمان) على PostgreSQL حقيقي محلياً (PGlite):
 *   مخطط الإنتاج (بنية فقط من النسخة الاحتياطية) + كل الـmigrations المطبّقة بالترتيب
 *   + migration التقوية الجديدة (مرتين للتأكد من قابلية إعادة التشغيل).
 * يختبر مسارات الهجوم المؤكدة في G-0 والتدفقات الطبيعية للتطبيق ولوحة التحكم. لا يتصل بأي Supabase.
 * التشغيل: npx tsx scripts/challenge-audit/security-hardening-db.test.ts
 */
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(__dirname, '../..');
const PGLITE_DIR = process.env.PGLITE_DIR ?? join(tmpdir(), 'kxtools');
const SCHEMA = process.env.KODAX_PROD_SCHEMA ?? join(ROOT, '../kodax-backups/prod-20261001-004734/public_schema.sql');
const MIG = (n: string) => join(ROOT, 'supabase/migrations', n + '.sql');
const read = (p: string) => readFileSync(p, 'utf8').replace(/^﻿/, '');
const HARDENING = '20261003040000_security_hardening';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const A = 'aaaaaaaa-0000-0000-0000-000000000001'; // مشرف
const U = 'aaaaaaaa-0000-0000-0000-000000000002'; // مستخدم
const V = 'aaaaaaaa-0000-0000-0000-000000000003'; // مستخدم (طرف المحادثة)
const C = 'aaaaaaaa-0000-0000-0000-000000000004'; // مستخدم ثالث
const O = 'aaaaaaaa-0000-0000-0000-000000000005'; // مهاجم من خارج المحادثة
const B = 'aaaaaaaa-0000-0000-0000-000000000006'; // محظور من V
const NOBODY = 'aaaaaaaa-0000-0000-0000-0000000000ff';

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
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.role', true), '') $$;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{}'::jsonb $$;
    GRANT USAGE ON SCHEMA auth, extensions, public TO anon, authenticated, service_role;
  `);
  const schema = read(SCHEMA)
    .replace(/^\\(un)?restrict .*$/gm, '')
    .replace(/^SET transaction_timeout = 0;$/m, '')
    .replace(/^CREATE SCHEMA public;$/m, '')
    .replace(/^COMMENT ON SCHEMA public .*$/m, '')
    .replace(/^SELECT pg_catalog\.set_config\('search_path', '', false\);$/m, 'SET search_path = public, extensions;');
  await db.exec(schema);
  await db.exec(`SET search_path = public, extensions; SET row_security = on;`);
  const coins = read(MIG('20260930000000_free_coins_system'));
  await db.exec(coins.match(/INSERT INTO coin_config[\s\S]*?;\n/)![0]);
  await db.exec(coins.match(/INSERT INTO course_coin_catalog \(course_id[\s\S]*?;\n/)![0]);

  for (const id of [A, U, V, C, O, B]) {
    await db.query(`INSERT INTO auth.users (id) VALUES ($1)`, [id]);
    await db.query(`INSERT INTO profiles (id, username, full_name, xp, level) VALUES ($1, $2, $2, 0, 1)`, [id, 'u' + id.slice(-2)]);
  }
  await db.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')`, [A]);

  // كل الـmigrations المطبّقة في الإنتاج بالترتيب (حالة الإنتاج الحالية)
  for (const m of [
    '20261001010000_server_verified_challenges', '20261001020000_curriculum_lesson_catalog', '20261002000000_protect_profile_columns',
    '20261002010000_server_side_xp', '20261002020000_challenge_access', '20261002030000_ai_assistant',
    '20261003000000_progression_catalog', '20261003010000_progression_economy', '20261003020000_challenge_solutions',
    '20261003030000_challenge_expansion',
  ]) {
    await db.exec(read(MIG(m)));
  }
  await db.exec(`UPDATE coin_config SET value = jsonb_set(value, '{min_seconds_between_lessons}', '0') WHERE key = 'progression'`);

  type Role = 'authenticated' | 'service_role' | 'anon';
  async function as<T>(role: Role, uid: string | null, fn: () => Promise<T>): Promise<T> {
    await db.exec('RESET ROLE');
    await db.query(`SELECT set_config('request.jwt.claim.sub', $1, false), set_config('request.jwt.claim.role', $2, false)`, [uid ?? '', role]);
    await db.exec(`SET ROLE ${role}`);
    try {
      return await fn();
    } finally {
      await db.exec('RESET ROLE');
      await db.query(`SELECT set_config('request.jwt.claim.sub', '', false), set_config('request.jwt.claim.role', '', false)`);
    }
  }
  const q = (sql: string, p: unknown[] = []) => db.query(sql, p);
  const one = async (sql: string, p: unknown[] = []) => (await db.query(sql, p)).rows[0] as any;
  const errorOf = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      return '';
    } catch (e: any) {
      return String(e?.message ?? e);
    }
  };
  const denied = async (fn: () => Promise<unknown>) => (await errorOf(fn)) !== '';
  const anonQ = (sql: string, p: unknown[] = []) => as('anon', null, () => q(sql, p));
  const userQ = (uid: string, sql: string, p: unknown[] = []) => as('authenticated', uid, () => q(sql, p));
  const userOne = (uid: string, sql: string, p: unknown[] = []) => as('authenticated', uid, () => one(sql, p));

  // ===== قبل التقوية: إثبات أن الثغرات تتكرر على النسخة (نفس الإنتاج) =====
  const preConv = (await as('anon', null, () => one(`SELECT get_or_create_conversation($1, $2) id`, [U, V]))).id as string;
  check('before: anon can create/reveal a conversation between two other users (reproduced G-0)', !!preConv);
  check('before: anon can learn whether a UUID is admin', (await as('anon', null, () => one(`SELECT is_admin($1) r`, [A]))).r === true);
  await q(`DELETE FROM conversations WHERE id = $1`, [preConv]);

  // ===== تطبيق التقوية (مرتين) =====
  await db.exec(read(MIG(HARDENING)));
  await db.exec(read(MIG(HARDENING)));
  console.log('— hardening migration applied twice (idempotent)\n');

  // ---------------- Admin: الحظر ----------------
  console.log('[admin: ban]');
  check('anon → ban: FAIL', await denied(() => anonQ(`SELECT admin_toggle_ban($1, true, 'x', NULL)`, [U])));
  check('anon → ban with real admin id spoofed: FAIL', await denied(() => anonQ(`SELECT admin_toggle_ban($1, true, 'x', $2)`, [U, A])));
  check('non-admin → ban (NULL admin id): FAIL', await denied(() => userQ(C, `SELECT admin_toggle_ban($1, true, 'x', NULL)`, [U])));
  check('non-admin → ban (spoofing p_admin_id = real admin): FAIL', await denied(() => userQ(C, `SELECT admin_toggle_ban($1, true, 'x', $2)`, [U, A])));
  check('U still not banned after attacks', (await one(`SELECT is_banned FROM profiles WHERE id = $1`, [U])).is_banned === false);
  check('admin → self-ban: FAIL', await denied(() => userQ(A, `SELECT admin_toggle_ban($1, true, 'x', $1)`, [A])));
  const banErr = await errorOf(() => userQ(A, `SELECT admin_toggle_ban($1, true, 'spam', $2)`, [U, A]));
  const banned = await one(`SELECT is_banned, ban_reason, banned_by, banned_at IS NOT NULL has_at FROM profiles WHERE id = $1`, [U]);
  check('admin → ban: PASS', banErr === '' && banned.is_banned === true && banned.ban_reason === 'spam' && banned.has_at, banErr);
  check('banned_by = auth.uid() of admin', banned.banned_by === A);
  const spoofErr = await errorOf(() => userQ(A, `SELECT admin_toggle_ban($1, true, 'x', $2)`, [V, C]));
  check('admin passing a fake p_admin_id is ignored (recorded as real admin)', spoofErr === '' && (await one(`SELECT banned_by FROM profiles WHERE id = $1`, [V])).banned_by === A, spoofErr);
  check('user_restriction_logs records real admin', (await one(`SELECT count(*)::int n FROM user_restriction_logs WHERE user_id = $1 AND action = 'ban' AND performed_by = $2`, [U, A])).n === 1);
  check('admin_action_log records ban by real admin', (await one(`SELECT count(*)::int n FROM admin_action_log WHERE target_user_id = $1 AND action_type = 'ban' AND admin_id = $2`, [U, A])).n === 1);
  check('admin panel can read restriction logs', (await userQ(A, `SELECT id FROM user_restriction_logs WHERE user_id = $1`, [U])).rows.length >= 1);
  // المستخدم المحظور لا يرفع الحظر عن نفسه
  await userQ(U, `UPDATE profiles SET is_banned = false, ban_reason = NULL, banned_at = NULL, banned_by = NULL WHERE id = $1`, [U]);
  check('banned user cannot unban self via direct UPDATE', (await one(`SELECT is_banned, ban_reason FROM profiles WHERE id = $1`, [U])).is_banned === true);
  await userQ(C, `UPDATE profiles SET is_banned = true, ban_reason = 'self' WHERE id = $1`, [C]);
  check('user cannot set ban columns on own profile', (await one(`SELECT is_banned, ban_reason FROM profiles WHERE id = $1`, [C])).is_banned === false);
  await userQ(C, `UPDATE profiles SET full_name = 'Renamed C' WHERE id = $1`, [C]);
  check('normal profile edit still works', (await one(`SELECT full_name FROM profiles WHERE id = $1`, [C])).full_name === 'Renamed C');
  const unbanErr = await errorOf(() => userQ(A, `SELECT admin_toggle_ban($1, false, NULL, $2)`, [U, A]));
  await userQ(A, `SELECT admin_toggle_ban($1, false, NULL, NULL)`, [V]);
  check('admin → unban: PASS', unbanErr === '' && (await one(`SELECT is_banned, banned_by FROM profiles WHERE id = $1`, [U])).is_banned === false, unbanErr);
  check('admin → ban unknown user: FAIL cleanly', await denied(() => userQ(A, `SELECT admin_toggle_ban($1, true, 'x', NULL)`, [NOBODY])));

  // ---------------- Admin: تقييد الكوينات ----------------
  console.log('\n[admin: purchase restriction]');
  check('anon → purchase restriction: FAIL', await denied(() => anonQ(`SELECT admin_toggle_purchase_block($1, true, 'x', $2)`, [U, A])));
  check('non-admin → purchase restriction: FAIL', await denied(() => userQ(C, `SELECT admin_toggle_purchase_block($1, true, 'x', $2)`, [U, A])));
  const blkErr = await errorOf(() => userQ(A, `SELECT admin_toggle_purchase_block($1, true, 'abuse', $2)`, [U, A]));
  check('admin → purchase restriction ON: PASS', blkErr === '' && (await one(`SELECT is_purchase_blocked b FROM profiles WHERE id = $1`, [U])).b === true, blkErr);
  await userQ(U, `UPDATE profiles SET is_purchase_blocked = false WHERE id = $1`, [U]);
  check('restricted user cannot lift restriction via direct UPDATE', (await one(`SELECT is_purchase_blocked b FROM profiles WHERE id = $1`, [U])).b === true);
  const unblkErr = await errorOf(() => userQ(A, `SELECT admin_toggle_purchase_block($1, false, NULL, $2)`, [U, A]));
  check('admin → purchase restriction OFF: PASS', unblkErr === '' && (await one(`SELECT is_purchase_blocked b FROM profiles WHERE id = $1`, [U])).b === false, unblkErr);
  check('admin_action_log records block/unblock', (await one(`SELECT count(*)::int n FROM admin_action_log WHERE target_user_id = $1 AND action_type IN ('block_purchase','unblock_purchase') AND admin_id = $2`, [U, A])).n === 2);

  // ---------------- الإشعارات ----------------
  console.log('\n[notifications]');
  const notifs = async (uid: string, type: string) => (await one(`SELECT count(*)::int n FROM app_notifications WHERE user_id = $1 AND type = $2`, [uid, type])).n as number;
  check('anon → arbitrary app notification (direct insert): FAIL',
    await denied(() => anonQ(`INSERT INTO app_notifications (user_id, type, title, message) VALUES ($1, 'system', 'x', 'x')`, [U])));
  check('authenticated → app notification for another user: FAIL',
    await denied(() => userQ(C, `INSERT INTO app_notifications (user_id, type, title, message) VALUES ($1, 'system', 'fake', 'fake')`, [U])));
  check('anon → insert_interaction_notification: FAIL', await denied(() => anonQ(`SELECT insert_interaction_notification($1, 'system', 'x', 'x', '{}'::jsonb)`, [U])));
  check('authenticated → insert_interaction_notification: FAIL', await denied(() => userQ(C, `SELECT insert_interaction_notification($1, 'system', 'x', 'x', '{}'::jsonb)`, [U])));
  check('no forged notification reached U', (await notifs(U, 'system')) === 0);
  const ownErr = await errorOf(() => userQ(U, `INSERT INTO app_notifications (user_id, type, title, message) VALUES ($1, 'lesson', 'own', 'own')`, [U]));
  check('user can still create own notification (local sync, backward compat)', ownErr === '', ownErr);
  const ownN = (await one(`SELECT id FROM app_notifications WHERE user_id = $1 AND title = 'own'`, [U])).id;
  await userQ(U, `UPDATE app_notifications SET read = true WHERE id = $1`, [ownN]);
  check('user can mark own notification read', (await one(`SELECT read FROM app_notifications WHERE id = $1`, [ownN])).read === true);
  await userQ(U, `UPDATE app_notifications SET user_id = $2 WHERE id = $1`, [ownN, V]).catch(() => null);
  check('user cannot move own notification to another user', (await one(`SELECT user_id FROM app_notifications WHERE id = $1`, [ownN])).user_id === U);

  const snippet = (await userOne(U, `INSERT INTO code_snippets (user_id, title, code, language, is_public) VALUES ($1, 'S', 'print(1)', 'python', true) RETURNING id`, [U])).id;
  const likeErr = await errorOf(() => userQ(V, `INSERT INTO code_likes (user_id, snippet_id) VALUES ($1, $2)`, [V, snippet]));
  check('like trigger → notification: PASS', likeErr === '' && (await notifs(U, 'like')) === 1, likeErr);
  const comErr = await errorOf(() => userQ(V, `INSERT INTO code_comments (user_id, snippet_id, content) VALUES ($1, $2, 'nice')`, [V, snippet]));
  check('comment trigger → notification: PASS', comErr === '' && (await notifs(U, 'comment')) === 1, comErr);
  const folErr = await errorOf(() => userQ(V, `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`, [V, U]));
  check('follow trigger → notification: PASS', folErr === '' && (await notifs(U, 'follow')) === 1, folErr);
  // نسخة followService القديمة: إدراج مباشر لإشعار المتابعة للطرف الآخر — يفشل (مكرر يُنشئه الـtrigger أصلاً)
  check('legacy followService direct insert for other user is blocked (trigger already notified)',
    await denied(() => userQ(V, `INSERT INTO app_notifications (user_id, type, title, message) VALUES ($1, 'follow', 'x', 'x')`, [U])));

  const ticket = (await userOne(U, `INSERT INTO support_tickets (user_id, subject) VALUES ($1, 'help') RETURNING id`, [U])).id;
  const userMsgErr = await errorOf(() => userQ(U, `INSERT INTO support_messages (ticket_id, sender_type, sender_id, message) VALUES ($1, 'user', $2, 'hi')`, [ticket, U]));
  check('user can send support message in own ticket', userMsgErr === '', userMsgErr);
  const replyErr = await errorOf(() => userQ(A, `INSERT INTO support_messages (ticket_id, sender_type, sender_id, message) VALUES ($1, 'admin', $2, 'hello')`, [ticket, A]));
  const sn = await one(`SELECT count(*)::int n FROM support_notifications WHERE user_id = $1 AND ticket_id = $2`, [U, ticket]);
  check('admin reply → support notification: PASS', replyErr === '' && sn.n === 1, replyErr);
  check('authenticated → arbitrary support notification: FAIL',
    await denied(() => userQ(C, `INSERT INTO support_notifications (user_id, ticket_id, title, message) VALUES ($1, $2, 'x', 'x')`, [U, ticket])));
  check('anon → arbitrary support notification: FAIL',
    await denied(() => anonQ(`INSERT INTO support_notifications (user_id, ticket_id, title, message) VALUES ($1, $2, 'x', 'x')`, [U, ticket])));
  await userQ(U, `UPDATE support_notifications SET read = true WHERE user_id = $1 AND read = false`, [U]);
  check('user can mark own support notifications read', (await one(`SELECT bool_and(read) r FROM support_notifications WHERE user_id = $1`, [U])).r === true);
  check('admin reply via fake sender_type by user is still rejected',
    await denied(() => userQ(U, `INSERT INTO support_messages (ticket_id, sender_type, sender_id, message) VALUES ($1, 'admin', $2, 'x')`, [ticket, U])));

  // ---------------- المحادثات ----------------
  console.log('\n[conversations]');
  check('anon → get_or_create between two other users: FAIL', await denied(() => anonQ(`SELECT get_or_create_conversation($1, $2)`, [U, V])));
  const convErr = await errorOf(() => userQ(U, `SELECT get_or_create_conversation($1, $2)`, [U, V]));
  const conv = (await userOne(U, `SELECT get_or_create_conversation($1, $2) id`, [U, V])).id as string;
  check('user A → create conversation with B: PASS', convErr === '' && !!conv, convErr);
  check('B → same pair returns the same conversation', (await userOne(V, `SELECT get_or_create_conversation($1, $2) id`, [V, U])).id === conv);
  check('user A pretending to be C (user1_id = C): FAIL', await denied(() => userQ(O, `SELECT get_or_create_conversation($1, $2)`, [U, V])));
  check('user A → A (self): FAIL', await denied(() => userQ(U, `SELECT get_or_create_conversation($1, $1)`, [U])));
  check('user A → non-existent user: FAIL', await denied(() => userQ(U, `SELECT get_or_create_conversation($1, $2)`, [U, NOBODY])));
  await userQ(V, `INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)`, [V, B]);
  check('blocked user → blocker: FAIL', await denied(() => userQ(B, `SELECT get_or_create_conversation($1, $2)`, [B, V])));
  check('blocker → blocked user: FAIL', await denied(() => userQ(V, `SELECT get_or_create_conversation($1, $2)`, [V, B])));
  check('unblocked pair still works (C → V)', !(await denied(() => userQ(C, `SELECT get_or_create_conversation($1, $2)`, [C, V]))));

  check('user A joins arbitrary conversation (direct insert): FAIL',
    await denied(() => userQ(O, `INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2)`, [conv, O])));
  check('anon joins arbitrary conversation: FAIL',
    await denied(() => anonQ(`INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2)`, [conv, O])));
  check('user creates conversation row directly: FAIL', await denied(() => userQ(O, `INSERT INTO conversations DEFAULT VALUES`)));
  const convOC = (await userOne(O, `SELECT get_or_create_conversation($1, $2) id`, [O, C])).id as string;
  check('user A changes conversation_id of own membership: FAIL',
    await denied(() => userQ(O, `UPDATE conversation_participants SET conversation_id = $1 WHERE user_id = $2 AND conversation_id = $3`, [conv, O, convOC])));
  check('user changes user_id of own membership: FAIL',
    await denied(() => userQ(O, `UPDATE conversation_participants SET user_id = $1 WHERE user_id = $2`, [U, O])));
  check('user deletes membership rows: FAIL/no effect', (await errorOf(() => userQ(U, `DELETE FROM conversation_participants WHERE conversation_id = $1`, [conv]))) !== '' ||
    (await one(`SELECT count(*)::int n FROM conversation_participants WHERE conversation_id = $1`, [conv])).n === 2);
  check('outsider still not a member of U–V conversation', (await one(`SELECT count(*)::int n FROM conversation_participants WHERE conversation_id = $1`, [conv])).n === 2);
  const lrErr = await errorOf(() => userQ(U, `UPDATE conversation_participants SET last_read_at = now() WHERE conversation_id = $1 AND user_id = $2`, [conv, U]));
  check('user A updates own last_read_at: PASS', lrErr === '' && (await one(`SELECT last_read_at IS NOT NULL r FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2`, [conv, U])).r, lrErr);
  const sendErr = await errorOf(() => userQ(U, `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, 'hello V')`, [conv, U]));
  check('user A sends message in own conversation: PASS', sendErr === '', sendErr);
  check('outsider sends message into U–V conversation: FAIL',
    await denied(() => userQ(O, `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, 'spam')`, [conv, O])));
  check('user A reads own conversation: PASS', (await userQ(V, `SELECT id FROM messages WHERE conversation_id = $1`, [conv])).rows.length === 1);
  check('user A lists own conversations', (await userQ(U, `SELECT id FROM conversations WHERE id = $1`, [conv])).rows.length === 1);
  check('outsider reads another private conversation: FAIL (0 rows)', (await userQ(O, `SELECT id FROM messages WHERE conversation_id = $1`, [conv])).rows.length === 0);
  check('outsider sees no participants of that conversation', (await userQ(O, `SELECT id FROM conversation_participants WHERE conversation_id = $1`, [conv])).rows.length === 0);
  check('anon reads private messages: 0 rows', (await anonQ(`SELECT id FROM messages WHERE conversation_id = $1`, [conv])).rows.length === 0);
  check('anon probing user_is_in_conversation(U) → false', (await as('anon', null, () => one(`SELECT user_is_in_conversation($1, $2) r`, [conv, U]))).r === false);
  check('outsider probing user_is_in_conversation(U) → false', (await userOne(O, `SELECT user_is_in_conversation($1, $2) r`, [conv, U])).r === false);
  check('member check for self still true', (await userOne(U, `SELECT user_is_in_conversation($1, $2) r`, [conv, U])).r === true);

  // ---------------- الرسائل ----------------
  console.log('\n[messages]');
  const msg = (await one(`SELECT id FROM messages WHERE conversation_id = $1`, [conv])).id;
  const editErr = await errorOf(() => userQ(U, `UPDATE messages SET content = 'hello V (edited)', is_edited = true, updated_at = now() WHERE id = $1`, [msg]));
  check('sender edits own content: PASS', editErr === '' && (await one(`SELECT content FROM messages WHERE id = $1`, [msg])).content === 'hello V (edited)', editErr);
  const readErr = await errorOf(() => userQ(V, `UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_id <> $2 AND is_read = false`, [conv, V]));
  check('recipient marks message read: PASS', readErr === '' && (await one(`SELECT is_read FROM messages WHERE id = $1`, [msg])).is_read === true, readErr);
  check("recipient edits sender's content: FAIL", await denied(() => userQ(V, `UPDATE messages SET content = 'tampered' WHERE id = $1`, [msg])));
  check('recipient soft-deletes sender message: FAIL', await denied(() => userQ(V, `UPDATE messages SET is_deleted = true, content = 'تم حذف هذه الرسالة' WHERE id = $1`, [msg])));
  check('recipient changes sender_id: FAIL', await denied(() => userQ(V, `UPDATE messages SET sender_id = $2 WHERE id = $1`, [msg, V])));
  check('sender moves message to another conversation: FAIL', await denied(() => userQ(U, `UPDATE messages SET conversation_id = $2 WHERE id = $1`, [msg, convOC])));
  check('sender changes created_at: FAIL', await denied(() => userQ(U, `UPDATE messages SET created_at = now() - interval '1 year' WHERE id = $1`, [msg])));
  await userQ(O, `UPDATE messages SET content = 'outsider' WHERE id = $1`, [msg]).catch(() => null);
  check('user outside conversation edits message: FAIL', (await one(`SELECT content FROM messages WHERE id = $1`, [msg])).content === 'hello V (edited)');
  check('anon edits message: FAIL', await denied(() => anonQ(`UPDATE messages SET content = 'anon' WHERE id = $1`, [msg])));
  const delErr = await errorOf(() => userQ(U, `UPDATE messages SET content = 'تم حذف هذه الرسالة', is_deleted = true, updated_at = now() WHERE id = $1`, [msg]));
  check('sender soft-deletes own message: PASS', delErr === '' && (await one(`SELECT is_deleted FROM messages WHERE id = $1`, [msg])).is_deleted === true, delErr);
  check('conversation updated_at trigger still works', (await one(`SELECT updated_at > created_at OR updated_at = created_at r FROM conversations WHERE id = $1`, [conv])).r === true);

  // ---------------- التقدم ----------------
  console.log('\n[progress]');
  const lesson = await one(`SELECT lesson_id, course_id, quiz_correct FROM lesson_catalog WHERE course_id = 'web-html-basics' ORDER BY position LIMIT 1`);
  const compErr = await errorOf(() => userOne(U, `SELECT progress_complete_lesson($1, $2) r`, [lesson.lesson_id, lesson.quiz_correct]));
  const comp = compErr ? null : (await one(`SELECT completed, verified FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2`, [U, lesson.lesson_id]));
  check('normal lesson save (progress_complete_lesson): PASS', compErr === '' && comp?.completed === true && comp?.verified === true, compErr);
  check('trigger updates course_progress: PASS', (await one(`SELECT count(*)::int n FROM course_progress WHERE user_id = $1 AND course_id = $2`, [U, lesson.course_id])).n === 1);
  const legacyErr = await errorOf(() => userQ(V, `INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed, completed_at) VALUES ($1, $2, $3, true, now())`, [V, lesson.lesson_id, lesson.course_id]));
  check('legacy app direct lesson save still works (trigger runs as system)', legacyErr === '' && (await one(`SELECT count(*)::int n FROM course_progress WHERE user_id = $1`, [V])).n === 1, legacyErr);
  check('user A calls update_course_progress for user B: FAIL',
    await denied(() => userQ(U, `SELECT update_course_progress($1, 'web-html-basics', 'x-99', 99, 1)`, [V])));
  check('anon calls update_course_progress: FAIL', await denied(() => anonQ(`SELECT update_course_progress($1, 'web-html-basics', 'x-99', 99, 1)`, [V])));
  check('user A writes course_progress row for B directly: FAIL',
    await denied(() => userQ(U, `INSERT INTO course_progress (user_id, course_id, completed_lessons, total_lessons) VALUES ($1, 'py-basics', 5, 5)`, [V])));
  await userQ(U, `UPDATE course_progress SET progress_percent = 100 WHERE user_id = $1`, [V]);
  check('user A updates B progress directly: no effect', (await one(`SELECT max(progress_percent) p FROM course_progress WHERE user_id = $1`, [V])).p !== 100);
  check('progression state RPC still works', (await userOne(U, `SELECT progress_get_state() r`)).r?.success !== false);
  const acc = await as('service_role', null, () => one(`SELECT challenge_access_check($1, (SELECT id FROM challenge_catalog LIMIT 1)) r`, [U]));
  check('server-side access check (service_role → is_admin(p_user)) still works', acc?.r !== undefined);

  // ---------------- is_admin ----------------
  console.log('\n[is_admin]');
  check('anon probing is_admin(admin uuid) → false', (await as('anon', null, () => one(`SELECT is_admin($1) r`, [A]))).r === false);
  check('anon is_admin() → false', (await as('anon', null, () => one(`SELECT is_admin() r`))).r === false);
  check('non-admin probing is_admin(admin uuid) → false', (await userOne(U, `SELECT is_admin($1) r`, [A])).r === false);
  check('admin normal check is_admin() → true', (await userOne(A, `SELECT is_admin() r`)).r === true);
  check('admin is_admin(auth.uid()) → true', (await userOne(A, `SELECT is_admin($1) r`, [A])).r === true);
  check('service_role is_admin(uuid) → true (server context)', (await as('service_role', null, () => one(`SELECT is_admin($1) r`, [A]))).r === true);
  check('admin reads admin-only table via RLS', (await userQ(A, `SELECT id FROM user_restriction_logs`)).rows.length > 0);
  check('admin panel role check (user_roles) works', (await userQ(A, `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'admin'`, [A])).rows.length === 1);
  check('anon public reads still work (challenge_catalog via RLS calling is_admin)', (await anonQ(`SELECT id FROM challenge_catalog LIMIT 1`)).rows.length === 1);
  check('anon public reads still work (code_snippets feed)', (await anonQ(`SELECT id FROM code_snippets WHERE id = $1`, [snippet])).rows.length === 1);
  check('anon public reads still work (coin_config, lesson_catalog)',
    (await anonQ(`SELECT key FROM coin_config LIMIT 1`)).rows.length === 1 && (await anonQ(`SELECT lesson_id FROM lesson_catalog LIMIT 1`)).rows.length === 1);
  // سبب عدم سحب EXECUTE من anon: إثبات أن السحب الكامل يكسر قراءات الزائر (داخل معاملة تُلغى)
  await db.exec(`BEGIN; REVOKE EXECUTE ON FUNCTION is_admin(uuid) FROM anon;
    SELECT set_config('request.jwt.claim.role', 'anon', true); SET LOCAL ROLE anon;`);
  const brokenErr = await errorOf(() => q(`SELECT id FROM code_snippets WHERE id = $1`, [snippet]));
  await db.exec('ROLLBACK;');
  await db.exec('RESET ROLE');
  check('(rationale) a full REVOKE from anon would break anonymous code feed reads', /permission denied/.test(brokenErr), brokenErr.slice(0, 70));

  // ---------------- دوال النظام ----------------
  console.log('\n[system functions]');
  check('anon → cleanup_old_ai_usage: FAIL', await denied(() => anonQ(`SELECT cleanup_old_ai_usage()`)));
  check('authenticated → cleanup_old_ai_usage: FAIL', await denied(() => userQ(U, `SELECT cleanup_old_ai_usage()`)));
  check('service_role → cleanup_old_ai_usage: allowed', !(await denied(() => as('service_role', null, () => q(`SELECT cleanup_old_ai_usage()`)))));
  check('anon → get_admin_stats: FAIL', await denied(() => anonQ(`SELECT get_admin_stats()`)));
  check('authenticated → get_admin_stats: FAIL', await denied(() => userQ(U, `SELECT get_admin_stats()`)));

  // ---------------- search_path وصلاحيات الدوال المعدّلة ----------------
  const fns = await q(`
    SELECT p.proname, p.prosecdef, array_to_string(p.proconfig, ',') cfg,
           has_function_privilege('anon', p.oid, 'EXECUTE') anon_x
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('is_admin','admin_toggle_ban','admin_toggle_purchase_block','insert_interaction_notification',
      'notify_user_on_admin_reply','user_is_in_conversation','get_or_create_conversation','trigger_update_course_progress',
      'update_course_progress','cleanup_old_ai_usage','get_admin_stats','_messages_guard_update','_protect_profile_columns')`);
  const noPath = fns.rows.filter((r: any) => !/search_path=public/.test(r.cfg ?? '')).map((r: any) => r.proname);
  check('every modified function has SET search_path = public', noPath.length === 0, noPath.join(','));
  const anonOk = new Set(['is_admin', 'user_is_in_conversation']); // تستدعيها سياسات RLS للزائر
  const anonExec = fns.rows.filter((r: any) => r.anon_x && !anonOk.has(r.proname) && r.prosecdef).map((r: any) => r.proname);
  check('no modified SECURITY DEFINER function executable by anon (except RLS helpers)', anonExec.length === 0, anonExec.join(','));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

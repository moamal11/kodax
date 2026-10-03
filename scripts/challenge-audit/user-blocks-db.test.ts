/**
 * اختبار حظر المستخدمين (user_blocks) على PostgreSQL حقيقي محلياً (PGlite):
 *   مخطط الإنتاج (بنية فقط) + كل الـmigrations المطبّقة + migration الحظر الجديدة (مرتين).
 * يغطي: الحظر/الإلغاء، عزل RLS، الرسائل أثناء الحظر وبعده، والحفاظ على الصفوف الموجودة.
 * التشغيل: npx tsx scripts/challenge-audit/user-blocks-db.test.ts
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
const BLOCKS = '20261003050000_user_blocks_messaging';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const ADMIN = 'bbbbbbbb-0000-0000-0000-000000000001';
const A = 'bbbbbbbb-0000-0000-0000-000000000002';
const B = 'bbbbbbbb-0000-0000-0000-000000000003';
const C = 'bbbbbbbb-0000-0000-0000-000000000004';
const D = 'bbbbbbbb-0000-0000-0000-000000000005';

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

  for (const id of [ADMIN, A, B, C, D]) {
    await db.query(`INSERT INTO auth.users (id) VALUES ($1)`, [id]);
    await db.query(`INSERT INTO profiles (id, username, full_name) VALUES ($1, $2, $3)`, [id, 'user_' + id.slice(-1), 'Name ' + id.slice(-1)]);
  }
  await db.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')`, [ADMIN]);

  for (const m of [
    '20261001010000_server_verified_challenges', '20261001020000_curriculum_lesson_catalog', '20261002000000_protect_profile_columns',
    '20261002010000_server_side_xp', '20261002020000_challenge_access', '20261002030000_ai_assistant',
    '20261003000000_progression_catalog', '20261003010000_progression_economy', '20261003020000_challenge_solutions',
    '20261003030000_challenge_expansion', '20261003040000_security_hardening',
  ]) {
    await db.exec(read(MIG(m)));
  }

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
  const userQ = (uid: string, sql: string, p: unknown[] = []) => as('authenticated', uid, () => q(sql, p));
  const userOne = (uid: string, sql: string, p: unknown[] = []) => as('authenticated', uid, () => one(sql, p));
  const anonQ = (sql: string, p: unknown[] = []) => as('anon', null, () => q(sql, p));
  // نفس استعلامات التطبيق (codeFeedService)
  const appBlock = (uid: string, target: string) =>
    userQ(uid, `INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)
                ON CONFLICT (blocker_id, blocked_id) DO UPDATE SET blocker_id = EXCLUDED.blocker_id`, [uid, target]);
  const appUnblock = (uid: string, target: string) => userQ(uid, `DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2`, [uid, target]);
  const appList = async (uid: string) =>
    (await userQ(uid, `SELECT b.blocked_id, p.username, p.full_name, p.avatar_url FROM user_blocks b
                       JOIN profiles p ON p.id = b.blocked_id WHERE b.blocker_id = $1 ORDER BY b.created_at DESC`, [uid])).rows as any[];
  const send = (uid: string, conv: string, text: string) =>
    userQ(uid, `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3)`, [conv, uid, text]);

  // بيانات حظر قائمة قبل الـmigration (يجب ألا تتغير)
  await q(`INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2), ($3, $4)`, [C, D, D, C]);
  // محادثة A–B قائمة قبل الحظر
  const conv = (await userOne(A, `SELECT get_or_create_conversation($1, $2) id`, [A, B])).id as string;
  await send(A, conv, 'hello B');
  await send(B, conv, 'hello A');
  const rowsBefore = (await one(`SELECT count(*)::int n, string_agg(blocker_id || '>' || blocked_id, ',' ORDER BY blocker_id) s FROM user_blocks`)) as any;

  // حالة الإنتاج قبل الـmigration: المحظور يستطيع الكتابة في محادثة قائمة
  await appBlock(A, B);
  check('before migration: blocked user CAN still send into existing conversation (gap confirmed)', (await errorOf(() => send(B, conv, 'pre-fix'))) === '');
  await appUnblock(A, B);
  await q(`DELETE FROM messages WHERE content = 'pre-fix'`);

  await db.exec(read(MIG(BLOCKS)));
  await db.exec(read(MIG(BLOCKS)));
  console.log('— blocks migration applied twice (idempotent)\n');

  // ---------------- البيانات الموجودة ----------------
  const rowsAfter = (await one(`SELECT count(*)::int n, string_agg(blocker_id || '>' || blocked_id, ',' ORDER BY blocker_id) s FROM user_blocks`)) as any;
  check('existing blocks preserved (same rows before/after migration)', rowsAfter.n === rowsBefore.n && rowsAfter.s === rowsBefore.s, `${rowsBefore.n} → ${rowsAfter.n}`);

  // ---------------- A: حظر/قائمة/إلغاء ----------------
  console.log('[user A flow]');
  check('A blocks B: PASS', (await errorOf(() => appBlock(A, B))) === '');
  check('A blocks B again (idempotent upsert): PASS', (await errorOf(() => appBlock(A, B))) === '');
  const listed = await appList(A);
  check('B appears in A blocked list (with username/name/avatar fields): PASS',
    listed.length === 1 && listed[0].blocked_id === B && listed[0].username === 'user_3' && listed[0].full_name === 'Name 3' && 'avatar_url' in listed[0]);

  // ---------------- RLS ----------------
  console.log('\n[security / RLS]');
  check("A cannot see B's blocks (0 rows)", (await userQ(A, `SELECT * FROM user_blocks WHERE blocker_id = $1`, [C])).rows.length === 0);
  check('B cannot see that A blocked them (0 rows)', (await userQ(B, `SELECT * FROM user_blocks WHERE blocked_id = $1`, [B])).rows.length === 0);
  check('A sees only own blocks overall', (await userQ(A, `SELECT blocker_id FROM user_blocks`)).rows.every((r: any) => r.blocker_id === A));
  await userQ(A, `DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2`, [C, D]).catch(() => null);
  check('A cannot delete a block created by another user (row intact)', (await one(`SELECT count(*)::int n FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2`, [C, D])).n === 1);
  check('A cannot create a block on behalf of C: FAIL', await denied(() => userQ(A, `INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)`, [C, B])));
  check('A cannot block self: FAIL', await denied(() => userQ(A, `INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $1)`, [A])));
  check('A cannot re-assign own block to another blocker: FAIL', await denied(() => userQ(A, `UPDATE user_blocks SET blocker_id = $2 WHERE blocker_id = $1`, [A, C])));
  check('B cannot remove the block A placed on them (row intact)',
    (await errorOf(() => userQ(B, `DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2`, [A, B]))) !== 'x' &&
    (await one(`SELECT count(*)::int n FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2`, [A, B])).n === 1);
  check('anon cannot read blocks (0 rows)', (await anonQ(`SELECT * FROM user_blocks`)).rows.length === 0);
  check('anon cannot insert blocks: FAIL', await denied(() => anonQ(`INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)`, [A, C])));
  check('admin can read all blocks (moderation)', (await userQ(ADMIN, `SELECT * FROM user_blocks`)).rows.length === rowsBefore.n + 1);
  check('admin cannot delete user blocks (read-only)',
    (await errorOf(() => userQ(ADMIN, `DELETE FROM user_blocks WHERE blocker_id = $1`, [C]))) !== 'x' &&
    (await one(`SELECT count(*)::int n FROM user_blocks WHERE blocker_id = $1`, [C])).n === 1);
  check('service_role (server) can read blocks', (await as('service_role', null, () => q(`SELECT * FROM user_blocks`))).rows.length === rowsBefore.n + 1);
  check('dm_is_blocked not executable by anon', await denied(() => anonQ(`SELECT dm_is_blocked($1)`, [conv])));
  check('outsider calling dm_is_blocked on A–B conversation learns nothing (false)', (await userOne(C, `SELECT dm_is_blocked($1) r`, [conv])).r === false);

  // ---------------- الرسائل أثناء الحظر ----------------
  console.log('\n[messaging while blocked]');
  check('A blocks B → B cannot send new DM to A (existing conversation): FAIL', await denied(() => send(B, conv, 'are you there?')));
  check('A (blocker) cannot send into the conversation while blocking: FAIL', await denied(() => send(A, conv, 'hi')));
  check('B cannot start/reopen a conversation with A: FAIL', await denied(() => userQ(B, `SELECT get_or_create_conversation($1, $2)`, [B, A])));
  check('A cannot start a conversation with B while blocking: FAIL', await denied(() => userQ(A, `SELECT get_or_create_conversation($1, $2)`, [A, B])));
  check('previous messages stay readable by the two participants only (A)', (await userQ(A, `SELECT id FROM messages WHERE conversation_id = $1`, [conv])).rows.length === 2);
  check('previous messages stay readable by the two participants only (B)', (await userQ(B, `SELECT id FROM messages WHERE conversation_id = $1`, [conv])).rows.length === 2);
  check('block does not expose the conversation to others (C sees 0)', (await userQ(C, `SELECT id FROM messages WHERE conversation_id = $1`, [conv])).rows.length === 0);
  check('block does not add/remove membership', (await one(`SELECT count(*)::int n FROM conversation_participants WHERE conversation_id = $1`, [conv])).n === 2);
  const mB = (await one(`SELECT id FROM messages WHERE conversation_id = $1 AND sender_id = $2`, [conv, B])).id;
  check('A can still mark old messages read during block', (await errorOf(() => userQ(A, `UPDATE messages SET is_read = true WHERE id = $1`, [mB]))) === '');
  const convAC = (await userOne(A, `SELECT get_or_create_conversation($1, $2) id`, [A, C])).id as string;
  check('blocking B does not affect A messaging others (A→C): PASS', (await errorOf(() => send(A, convAC, 'hi C'))) === '');

  // ---------------- إلغاء الحظر ----------------
  console.log('\n[unblock]');
  check('A unblocks B: PASS', (await errorOf(() => appUnblock(A, B))) === '');
  check('B disappears from A blocked list: PASS', (await appList(A)).length === 0);
  check('after unblock: B can send to A again: PASS', (await errorOf(() => send(B, conv, 'back'))) === '');
  check('after unblock: A can send to B again: PASS', (await errorOf(() => send(A, conv, 'welcome back'))) === '');
  check('after unblock: same conversation is reused (no exposure/duplication)', (await userOne(B, `SELECT get_or_create_conversation($1, $2) id`, [B, A])).id === conv);
  check('reverse direction: B blocks A → A cannot send: FAIL', await (async () => {
    await appBlock(B, A);
    const blocked = await denied(() => send(A, conv, 'x'));
    await appUnblock(B, A);
    return blocked;
  })());
  check('other users blocks untouched at the end', (await one(`SELECT count(*)::int n FROM user_blocks`)).n === rowsBefore.n);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

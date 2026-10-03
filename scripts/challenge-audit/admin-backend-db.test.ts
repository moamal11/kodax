/**
 * اختبار خلفية الإدارة (20261004030000_admin_backend) على PGlite:
 * صلاحيات المشرف، التوثيق، تعديل الكوينات، نموذج البلاغات، المحتوى، المستخدمون، الإحصاءات، السجل.
 * التشغيل: npx tsx scripts/challenge-audit/admin-backend-db.test.ts
 */
import { createEnv, makeChecker, migration } from './_pglite-env';

const ADMIN = 'eeeeeeee-0000-0000-0000-000000000001';
const U = 'eeeeeeee-0000-0000-0000-000000000002'; // مستخدم عادي (صاحب المحتوى)
const R1 = 'eeeeeeee-0000-0000-0000-000000000003';
const R2 = 'eeeeeeee-0000-0000-0000-000000000004';
const R3 = 'eeeeeeee-0000-0000-0000-000000000005';
const NEWBIE = 'eeeeeeee-0000-0000-0000-000000000006'; // حساب جديد
const { check, done } = makeChecker();

(async () => {
  const env = await createEnv();
  const { q, one, userQ, userOne, anonQ, denied, errorOf } = env;
  await q(`CREATE SCHEMA IF NOT EXISTS storage`);
  await env.db.exec(`CREATE TABLE storage.objects (id uuid DEFAULT gen_random_uuid(), bucket_id text, name text, owner uuid);
    CREATE TABLE storage.buckets (id text PRIMARY KEY, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;`);
  for (const [id, admin] of [[ADMIN, true], [U, false], [R1, false], [R2, false], [R3, false], [NEWBIE, false]] as const) {
    await env.addUser(id, { admin, username: 'user_' + id.slice(-1) });
  }
  await env.applyUpTo('20261004020000_account_deletion_fk_fix');
  // المبلّغون قدامى (مؤهلون) والحساب الجديد عمره ساعة
  await q(`UPDATE profiles SET created_at = now() - interval '30 days' WHERE id <> $1`, [NEWBIE]);
  await q(`UPDATE profiles SET created_at = now() - interval '1 hour' WHERE id = $1`, [NEWBIE]);

  await env.db.exec(migration('20261004030000_admin_backend'));
  await env.db.exec(migration('20261004030000_admin_backend'));
  console.log('— admin backend migration applied twice\n');

  // ---------------- صلاحيات ----------------
  const adminCalls = [
    `admin_set_verified('${U}', true, 'x')`, `admin_adjust_coins('${U}', 10, 'test reason', gen_random_uuid())`,
    `admin_resolve_report(gen_random_uuid(), 'dismissed', 'x')`, `admin_moderation_queue('open')`, `admin_content_overview()`,
    `admin_course_lessons('web-html-basics')`, `admin_set_course_prereq('web-css-styling', NULL, NULL, 'x')`,
    `admin_get_challenge_solution('html-ch-001', 'reason')`, `admin_list_users(NULL, 'all', 'created', 10, 0)`,
    `admin_user_detail('${U}')`, `admin_audit_feed(10, 0, NULL)`, `admin_dashboard_stats(30)`,
  ];
  let allDenied = true;
  for (const c of adminCalls) {
    const a = await denied(() => anonQ(`SELECT ${c}`));
    const u = await denied(() => userQ(U, `SELECT ${c}`));
    if (!a || !u) { allDenied = false; console.log('   not denied:', c, { anon: a, user: u }); }
  }
  check('every admin function denied for anon and non-admin users', allDenied);
  check('internal helpers not callable by clients', (await denied(() => userQ(U, `SELECT _admin_audit('x','y','z','r','{}')`))) && (await denied(() => userQ(U, `SELECT _require_admin()`))));

  // ---------------- التوثيق ----------------
  await userQ(U, `UPDATE profiles SET is_verified = true, verified_at = now() WHERE id = $1`, [U]);
  check('user cannot self-verify', (await one(`SELECT is_verified FROM profiles WHERE id = $1`, [U])).is_verified === false);
  const ver = (await userOne(ADMIN, `SELECT admin_set_verified($1, true, 'trusted teacher') r`, [U])).r;
  const pv = await one(`SELECT is_verified, verified_by FROM profiles WHERE id = $1`, [U]);
  check('admin grants verification', ver.success && pv.is_verified === true && pv.verified_by === ADMIN);
  await userQ(U, `UPDATE profiles SET is_verified = false WHERE id = $1`, [U]);
  check('user cannot remove own verification either', (await one(`SELECT is_verified FROM profiles WHERE id = $1`, [U])).is_verified === true);
  await userOne(ADMIN, `SELECT admin_set_verified($1, false, 'revoked') r`, [U]);
  check('admin revokes verification', (await one(`SELECT is_verified, verified_by FROM profiles WHERE id = $1`, [U])).is_verified === false);
  check('verification changes are audited with real actor', (await one(`SELECT count(*)::int n FROM admin_audit_log WHERE action IN ('verify_user','unverify_user') AND actor_id = $1 AND target_id = $2`, [ADMIN, U])).n === 2);
  check('public can read is_verified (badge)', (await anonQ(`SELECT is_verified FROM profiles WHERE id = $1`, [U])).rows.length === 1);

  // ---------------- الكوينات ----------------
  const reqId = '11111111-2222-3333-4444-555555555555';
  check('reason required for coin adjustment', (await userOne(ADMIN, `SELECT admin_adjust_coins($1, 50, '', $2) r`, [U, reqId])).r.code === 'reason_required');
  check('zero/huge amount rejected', (await userOne(ADMIN, `SELECT admin_adjust_coins($1, 0, 'reason', $2) r`, [U, reqId])).r.code === 'invalid_amount' &&
    (await userOne(ADMIN, `SELECT admin_adjust_coins($1, 1000000, 'reason', $2) r`, [U, reqId])).r.code === 'invalid_amount');
  const add = (await userOne(ADMIN, `SELECT admin_adjust_coins($1, 50, 'compensation for outage', $2) r`, [U, reqId])).r;
  check('admin adds coins', add.success === true && add.balance === 50, JSON.stringify(add));
  const again = (await userOne(ADMIN, `SELECT admin_adjust_coins($1, 50, 'compensation for outage', $2) r`, [U, reqId])).r;
  check('same request id is idempotent (no double credit)', again.duplicate === true && (await one(`SELECT total_points FROM user_points WHERE user_id = $1`, [U])).total_points === 50);
  const remove = (await userOne(ADMIN, `SELECT admin_adjust_coins($1, -20, 'abuse correction', gen_random_uuid()) r`, [U])).r;
  check('admin removes coins', remove.success === true && remove.balance === 30);
  check('cannot remove more than balance', (await userOne(ADMIN, `SELECT admin_adjust_coins($1, -999, 'too much', gen_random_uuid()) r`, [U])).r.code === 'insufficient');
  check('ledger records admin_adjust with admin as ref', (await one(`SELECT count(*)::int n FROM point_transactions WHERE user_id = $1 AND source = 'admin_adjust' AND ref_id = $2`, [U, ADMIN])).n === 2);
  check('coin adjustments audited exactly once each', (await one(`SELECT count(*)::int n FROM admin_audit_log WHERE action = 'adjust_coins' AND target_id = $1`, [U])).n === 2);
  check('user still cannot write own balance', await denied(() => userQ(U, `UPDATE user_points SET total_points = 99999 WHERE user_id = $1 RETURNING 1`, [U]).then((r: any) => { if (r.rows.length) throw new Error('updated'); throw new Error('noop'); })));
  check('user balance unchanged by direct write attempt', (await one(`SELECT total_points FROM user_points WHERE user_id = $1`, [U])).total_points === 30);

  // ---------------- البلاغات ----------------
  const snip = (await userOne(U, `INSERT INTO code_snippets (user_id, title, code, language, is_public) VALUES ($1, 'S', 'x', 'python', true) RETURNING id`, [U])).id;
  const hidden = async () => (await one(`SELECT is_hidden, report_count FROM code_snippets WHERE id = $1`, [snip]));
  await userQ(R1, `SELECT report_snippet($1, 'phishing', 'looks bad')`, [snip]);
  check('1 report (even phishing) does NOT hide content', (await hidden()).is_hidden === false && (await hidden()).report_count === 1);
  const dup = (await userOne(R1, `SELECT report_snippet($1, 'spam') r`, [snip])).r;
  check('same user cannot report twice (duplicate ignored)', dup.duplicate === true && (await hidden()).report_count === 1);
  await userQ(NEWBIE, `SELECT report_snippet($1, 'spam')`, [snip]);
  await userQ(R2, `SELECT report_snippet($1, 'spam')`, [snip]);
  check('2 qualified + 1 new-account report: still visible (new accounts do not count)', (await hidden()).is_hidden === false && (await hidden()).report_count === 3);
  check('owner cannot report own content', (await userOne(U, `SELECT report_snippet($1, 'spam') r`, [snip])).r.code === 'own_content');
  await userQ(R3, `SELECT report_snippet($1, 'malicious')`, [snip]);
  check('3 qualified distinct reporters: hidden temporarily for review', (await hidden()).is_hidden === true);
  const queue = (await userOne(ADMIN, `SELECT admin_moderation_queue('open') r`)).r;
  const qs = queue.snippets.find((s: any) => s.id === snip);
  check('moderation queue shows the snippet with history and qualified count', !!qs && qs.reports === 4 && qs.qualified_reporters === 3 && qs.history.length === 4);
  const rest = (await userOne(ADMIN, `SELECT admin_moderate_snippet($1, 'restore', 'false reports') r`, [snip])).r;
  check('admin restores content after false reports', rest.success && (await hidden()).is_hidden === false && (await hidden()).report_count === 0);
  check('restored reports marked dismissed with reviewer', (await one(`SELECT count(*)::int n FROM content_reports WHERE snippet_id = $1 AND status = 'dismissed' AND reviewed_by = $2`, [snip, ADMIN])).n === 4);
  check('reporters cannot re-report the same content to re-trigger', (await userOne(R1, `SELECT report_snippet($1, 'spam') r`, [snip])).r.duplicate === true && (await hidden()).is_hidden === false);
  check('moderation actions audited', (await one(`SELECT count(*)::int n FROM admin_audit_log WHERE action = 'restore_snippet' AND target_id = $1`, [snip])).n === 1);
  check('report history kept after restore', (await userOne(ADMIN, `SELECT admin_moderation_queue('all') r`)).r.snippets.find((s: any) => s.id === snip)?.history.length === 4);
  check('non-admin cannot moderate', (await userOne(U, `SELECT admin_moderate_snippet($1, 'delete') r`, [snip])).r.code === 'forbidden');

  // بلاغ مستخدم/رسالة
  const conv = (await userOne(R1, `SELECT get_or_create_conversation($1, $2) id`, [R1, U])).id;
  const msg = (await userOne(U, `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, 'rude message') RETURNING id`, [conv, U])).id;
  const ru = (await userOne(R1, `SELECT report_user($1, 'harassment', 'see message', $2) r`, [U, msg])).r;
  check('participant can report a DM with excerpt', ru.success === true && (await one(`SELECT message_excerpt FROM content_reports WHERE message_id = $1`, [msg])).message_excerpt === 'rude message');
  check('outsider cannot report a DM they are not part of', (await userOne(R2, `SELECT report_user($1, 'harassment', NULL, $2) r`, [U, msg])).r.code === 'invalid_message');
  check('cannot report self / invalid reason', (await userOne(R1, `SELECT report_user($1, 'spam') r`, [R1])).r.code === 'invalid_target' &&
    (await userOne(R1, `SELECT report_user($1, 'nonsense') r`, [U])).r.code === 'invalid_reason');
  await userQ(R2, `SELECT report_user($1, 'spam')`, [U]);
  check('duplicate user report ignored', (await userOne(R2, `SELECT report_user($1, 'spam') r`, [U])).r.duplicate === true);
  check('reporters cannot read others reports (RLS)', (await userQ(R2, `SELECT * FROM content_reports WHERE reporter_id = $1`, [R1])).rows.length === 0);
  const uq = (await userOne(ADMIN, `SELECT admin_moderation_queue('open') r`)).r.users;
  check('user/message reports in queue', uq.length === 2);
  const rid = uq[0].id;
  check('admin resolves user report', (await userOne(ADMIN, `SELECT admin_resolve_report($1, 'dismissed', 'not abusive') r`, [rid])).r.success === true);

  // ---------------- المحتوى ----------------
  const ov = (await userOne(ADMIN, `SELECT admin_content_overview() r`)).r;
  check('content overview: 32 courses, 344 lessons, 242 challenges',
    ov.courses.length === 32 && ov.courses.reduce((a: number, c: any) => a + Number(c.lessons), 0) === 344 && ov.challenges.length === 242,
    `${ov.courses.length}/${ov.courses.reduce((a: number, c: any) => a + Number(c.lessons), 0)}/${ov.challenges.length}`);
  check('lesson positions validated (no gaps/duplicates)', ov.courses.every((c: any) => Number(c.position_gaps) === 0 && Number(c.position_duplicates) === 0));
  check('course lessons listing', (await userOne(ADMIN, `SELECT admin_course_lessons('web-html-basics') r`)).r.length > 5);
  const pre = await one(`SELECT course_id, requires_course_id FROM course_prereqs LIMIT 1`);
  check('prereq: self reference rejected', (await userOne(ADMIN, `SELECT admin_set_course_prereq($1, $1, NULL, 'x') r`, [pre.course_id])).r.code === 'self_reference');
  check('prereq: cycle rejected', (await userOne(ADMIN, `SELECT admin_set_course_prereq($1, $2, NULL, 'x') r`, [pre.requires_course_id, pre.course_id])).r.code === 'cycle');
  check('prereq: invalid ratio rejected', (await userOne(ADMIN, `SELECT admin_set_course_prereq($1, $2, 1.5, 'x') r`, [pre.course_id, pre.requires_course_id])).r.code === 'invalid_ratio');
  check('prereq: unknown course rejected', (await userOne(ADMIN, `SELECT admin_set_course_prereq('nope', $1, NULL, 'x') r`, [pre.course_id])).r.code === 'course_not_found');
  check('prereq: valid update works and audited', (await userOne(ADMIN, `SELECT admin_set_course_prereq($1, $2, 0.6, 'tune') r`, [pre.course_id, pre.requires_course_id])).r.success === true &&
    (await one(`SELECT min_ratio FROM course_prereqs WHERE course_id = $1`, [pre.course_id])).min_ratio === '0.60' &&
    (await one(`SELECT count(*)::int n FROM admin_audit_log WHERE action = 'set_prereq'`)).n === 1);
  const solCh = (await one(`SELECT challenge_id FROM challenge_solutions LIMIT 1`)).challenge_id;
  check('solution view requires reason', (await userOne(ADMIN, `SELECT admin_get_challenge_solution($1, '') r`, [solCh])).r.code === 'reason_required');
  const sol = (await userOne(ADMIN, `SELECT admin_get_challenge_solution($1, 'review report') r`, [solCh])).r;
  check('admin can view solution, and it is audited', sol.success && sol.solution.length > 0 && (await one(`SELECT count(*)::int n FROM admin_audit_log WHERE action = 'view_solution' AND target_id = $1`, [solCh])).n === 1);
  check('solutions still not readable directly by anyone', await denied(() => userQ(ADMIN, `SELECT * FROM challenge_solutions LIMIT 1`)));

  // ---------------- المستخدمون ----------------
  const list = (await userOne(ADMIN, `SELECT admin_list_users(NULL, 'all', 'created', 50, 0) r`)).r;
  check('list users returns all with email/coins/level', list.total === 6 && list.rows.every((r: any) => 'email' in r && 'coins' in r && 'level' in r));
  check('search by username', (await userOne(ADMIN, `SELECT admin_list_users('user_2', 'all', 'created', 10, 0) r`)).r.total === 1);
  check('filter reported users', (await userOne(ADMIN, `SELECT admin_list_users(NULL, 'reported', 'reports', 10, 0) r`)).r.rows[0]?.id === U);
  check('sort by coins', (await userOne(ADMIN, `SELECT admin_list_users(NULL, 'all', 'coins', 10, 0) r`)).r.rows[0]?.id === U);
  check('filter admins', (await userOne(ADMIN, `SELECT admin_list_users(NULL, 'admins', 'created', 10, 0) r`)).r.rows.map((r: any) => r.id).join() === ADMIN);
  const det = (await userOne(ADMIN, `SELECT admin_user_detail($1) r`, [U])).r;
  check('user detail: coins, reports, history, social', det.success && det.coins.balance === 30 && det.reports_received.length >= 3 && det.history.length >= 4 && det.social.snippets === 1,
    JSON.stringify({ c: det.coins?.balance, r: det.reports_received?.length, h: det.history?.length }));
  check('user detail hides internal legacy columns', det.profile && !('store_credits' in det.profile) && 'is_verified' in det.profile);

  // ---------------- الإحصاءات والسجل ----------------
  const st = (await userOne(ADMIN, `SELECT admin_dashboard_stats(30) r`)).r;
  check('dashboard stats sections present', ['users', 'learning', 'economy', 'ai', 'social', 'support', 'unavailable'].every((k) => k in st));
  check('dashboard totals consistent', st.users.total === 6 && st.social.snippets === 1 && st.social.reports_total >= 6 && st.economy.admin_adjustments === 2,
    JSON.stringify({ t: st.users.total, s: st.social.snippets, r: st.social.reports_total, a: st.economy.admin_adjustments }));
  check('daily series cover the period', st.users.new_by_day.length === 30 && st.ai.by_day.length === 30);
  check('unavailable metrics declared explicitly', st.ai.errors === null && typeof st.unavailable['ai.errors'] === 'string');
  check('stats callable twice in same session (no temp-table leftovers)', (await errorOf(() => userOne(ADMIN, `SELECT admin_dashboard_stats(7) r`))) === '');
  const feed = (await userOne(ADMIN, `SELECT admin_audit_feed(100, 0, NULL) r`)).r;
  check('audit feed merges actions with actor names', feed.length >= 8 && feed.some((f: any) => f.action === 'adjust_coins' && f.actor === 'user_1'));
  check('audit feed filter by action', (await userOne(ADMIN, `SELECT admin_audit_feed(100, 0, 'view_solution') r`)).r.length === 1);
  check('non-admin cannot read audit log table', (await userQ(U, `SELECT * FROM admin_audit_log`)).rows.length === 0);

  // عدم كسر مسارات المستخدم
  check('progress RPC still works', (await userOne(U, `SELECT progress_get_state() r`)).r?.success !== false);
  check('profile edit still works', (await errorOf(() => userQ(U, `UPDATE profiles SET full_name = 'New' WHERE id = $1`, [U]))) === '');
  done();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

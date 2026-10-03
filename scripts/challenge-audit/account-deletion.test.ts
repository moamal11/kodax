/**
 * اختبار حذف الحساب: migration 20261004010000 + منطق delete-account/core.ts الحقيقي موصولاً بـ PGlite.
 * يزرع بيانات للمستخدم في كل الجداول المرتبطة ثم يحذف ويتحقق أنه لم يبقَ أي صف يشير إليه
 * (فحص عام لكل أعمدة uuid في public)، وأن بيانات المستخدمين الآخرين سليمة.
 * التشغيل: npx tsx scripts/challenge-audit/account-deletion.test.ts
 */
import { createEnv, makeChecker, migration } from './_pglite-env';
import { handleDeleteAccount, type DeleteDeps } from '../../supabase/functions/delete-account/core';

const ADMIN = 'dddddddd-0000-0000-0000-000000000001';
const VICTIM = 'dddddddd-0000-0000-0000-000000000002'; // الحساب الذي يُحذف
const OTHER = 'dddddddd-0000-0000-0000-000000000003';
const THIRD = 'dddddddd-0000-0000-0000-000000000004';
const { check, done } = makeChecker();

(async () => {
  const env = await createEnv();
  const { q, one, userQ, errorOf } = env;
  // مخطط storage مصغّر (غير موجود في نسخة البنية)
  await q(`CREATE SCHEMA IF NOT EXISTS storage`);
  await env.db.exec(`
    CREATE TABLE storage.buckets (id text PRIMARY KEY, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    CREATE TABLE storage.objects (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, bucket_id text, name text, owner uuid, metadata jsonb, created_at timestamptz DEFAULT now());
    CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
    INSERT INTO storage.buckets (id, public) VALUES ('avatars', true), ('payment-receipts', false), ('broadcast-images', true);
  `);
  for (const [id, admin] of [[ADMIN, true], [VICTIM, false], [OTHER, false], [THIRD, false]] as const) await env.addUser(id, { admin });
  await env.applyUpTo('20261004000000_security_phase_a');

  // ---------------- زرع بيانات الضحية في كل مكان ----------------
  const seeded: string[] = [];
  const failed: string[] = [];
  const seed = async (label: string, sql: string, p: unknown[] = []) => {
    const e = await errorOf(() => q(sql, p));
    (e ? failed : seeded).push(e ? `${label}: ${e.slice(0, 80)}` : label);
  };
  const V = VICTIM;
  await seed('user_lesson_progress', `INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed, verified) VALUES ($1, 'html-1', 'web-html-basics', true, true)`, [V]);
  await seed('xp_awards', `INSERT INTO xp_awards (user_id, source, ref_id, amount) VALUES ($1, 'lesson', 'html-1', 10) ON CONFLICT DO NOTHING`, [V]);
  await seed('user_streaks', `INSERT INTO user_streaks (user_id, current_streak, best_streak) VALUES ($1, 3, 5) ON CONFLICT (user_id) DO UPDATE SET best_streak = 5`, [V]);
  await seed('user_activity_days', `INSERT INTO user_activity_days (user_id, day, lessons) VALUES ($1, CURRENT_DATE, 1)`, [V]);
  await seed('user_goals', `INSERT INTO user_goals (user_id, daily_target) VALUES ($1, 3)`, [V]);
  await seed('achievements_awarded', `INSERT INTO achievements_awarded (user_id, achievement_id) VALUES ($1, 'first_lesson')`, [V]);
  await seed('challenge_submissions', `INSERT INTO challenge_submissions (user_id, challenge_id, passed_tests, total_tests, all_passed) VALUES ($1, 'html-ch-001', 3, 3, true)`, [V]);
  await seed('challenge_attempt_log', `INSERT INTO challenge_attempt_log (user_id, challenge_id) VALUES ($1, 'html-ch-001')`, [V]);
  await seed('user_points', `INSERT INTO user_points (user_id, total_points) VALUES ($1, 50)`, [V]);
  await seed('point_transactions', `INSERT INTO point_transactions (user_id, type, amount, source) VALUES ($1, 'earned', 50, 'daily_ladder')`, [V]);
  await seed('ad_reward_sessions', `INSERT INTO ad_reward_sessions (user_id, ad_date, status) VALUES ($1, CURRENT_DATE, 'pending')`, [V]);
  await seed('ai_daily_usage', `INSERT INTO ai_daily_usage (user_id, usage_date, bucket, used) VALUES ($1, CURRENT_DATE, 'free', 2)`, [V]);
  const aiConv = (await one(`INSERT INTO ai_conversations (user_id, title) VALUES ($1, 'my chat') RETURNING id`, [V])).id;
  await seed('ai_chat_history', `INSERT INTO ai_chat_history (user_id, role, content, conversation_id) VALUES ($1, 'user', 'secret question', $2)`, [V, aiConv]);
  await seed('analytics_events', `INSERT INTO analytics_events (user_id, event, day) VALUES ($1, 'app_open', CURRENT_DATE)`, [V]);
  await seed('app_notifications', `INSERT INTO app_notifications (user_id, type, title, message) VALUES ($1, 'system', 't', 'm')`, [V]);
  const ticket = (await one(`INSERT INTO support_tickets (user_id, subject, user_email) VALUES ($1, 'help', 'victim@mail') RETURNING id`, [V])).id;
  await seed('support_messages', `INSERT INTO support_messages (ticket_id, sender_type, sender_id, message) VALUES ($1, 'user', $2, 'my phone is 0770...')`, [ticket, V]);
  await seed('support_notifications', `INSERT INTO support_notifications (user_id, ticket_id, title, message) VALUES ($1, $2, 't', 'm')`, [V, ticket]);
  const vSnippet = (await one(`INSERT INTO code_snippets (user_id, title, code, language, is_public) VALUES ($1, 'mine', 'x', 'python', true) RETURNING id`, [V])).id;
  const oSnippet = (await one(`INSERT INTO code_snippets (user_id, title, code, language, is_public) VALUES ($1, 'theirs', 'y', 'python', true) RETURNING id`, [OTHER])).id;
  await seed('code_comments (victim on other)', `INSERT INTO code_comments (user_id, snippet_id, content) VALUES ($1, $2, 'nice')`, [V, oSnippet]);
  await seed('code_comments (other on victim)', `INSERT INTO code_comments (user_id, snippet_id, content) VALUES ($1, $2, 'cool')`, [OTHER, vSnippet]);
  await seed('code_likes', `INSERT INTO code_likes (user_id, snippet_id) VALUES ($1, $2)`, [V, oSnippet]);
  await seed('snippet_likes', `INSERT INTO snippet_likes (user_id, snippet_id) VALUES ($1, $2)`, [V, oSnippet]);
  await seed('content_reports (by victim)', `INSERT INTO content_reports (reporter_id, snippet_id, reason) VALUES ($1, $2, 'spam')`, [V, oSnippet]);
  await seed('content_reports (on victim snippet)', `INSERT INTO content_reports (reporter_id, snippet_id, reason) VALUES ($1, $2, 'spam')`, [OTHER, vSnippet]);
  await seed('follows', `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2), ($2, $1)`, [V, OTHER]);
  await seed('user_blocks', `INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2), ($2, $1)`, [V, THIRD]);
  const conv = (await userQ(V, `SELECT get_or_create_conversation($1, $2) id`, [V, OTHER])).rows[0].id;
  await seed('messages (victim)', `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, 'private hello')`, [conv, V]);
  await seed('messages (other)', `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, 'hello back')`, [conv, OTHER]);
  await seed('certificates', `INSERT INTO certificates (user_id, course_id, course_title, level, security_hash, user_full_name) VALUES ($1, 'web-dev', 'Web', 'silver', 'h', 'Victim')`, [V]);
  await seed('certificate_audit_log', `INSERT INTO certificate_audit_log (certificate_id, action, actor_id) SELECT id, 'issued', $1 FROM certificates WHERE user_id = $1`, [V]);
  await seed('admin_action_log (target)', `INSERT INTO admin_action_log (admin_id, action_type, target_user_id) VALUES ($1, 'ban', $2)`, [ADMIN, V]);
  await seed('user_restriction_logs', `INSERT INTO user_restriction_logs (user_id, action, performed_by) VALUES ($1, 'ban', $2)`, [V, ADMIN]);
  await seed('payment_orders', `INSERT INTO payment_orders (user_id, payment_method, payment_details, package_id, points_requested, price_amount, reviewed_by) VALUES ($1, 'zain', 'x', 'p1', 10, 1000, $2)`, [V, ADMIN]);
  await seed('admin_action_log (order of victim)', `INSERT INTO admin_action_log (admin_id, action_type, target_user_id, order_id)
    SELECT $1, 'approve_order', $2, id FROM payment_orders WHERE user_id = $2`, [ADMIN, V]);
  await seed('payment_notifications', `INSERT INTO payment_notifications (user_id, order_id, type, title, message)
    SELECT $1, id, 'order_approved', 't', 'm' FROM payment_orders WHERE user_id = $1`, [V]);
  await seed('certificate upgrade chain', `INSERT INTO certificates (user_id, course_id, course_title, level, security_hash, user_full_name, upgraded_from)
    SELECT $1, 'web-dev', 'Web', 'gold', 'h2', 'Victim', id FROM certificates WHERE user_id = $1 AND level = 'silver'`, [V]);
  const bm = (await one(`INSERT INTO broadcast_messages (type, title, created_by) VALUES ('toast', 't', $1) RETURNING id`, [ADMIN])).id;
  await seed('broadcast_message_reads', `INSERT INTO broadcast_message_reads (message_id, user_id) VALUES ($1, $2)`, [bm, V]);
  await seed('storage avatar', `INSERT INTO storage.objects (bucket_id, name, owner) VALUES ('avatars', $1 || '/avatar_1.jpg', $1::uuid)`, [V]);
  await seed('storage receipt', `INSERT INTO storage.objects (bucket_id, name, owner) VALUES ('payment-receipts', 'receipts/' || $1 || '/r.jpg', NULL)`, [V]);
  await seed('storage other user', `INSERT INTO storage.objects (bucket_id, name, owner) VALUES ('avatars', $1 || '/avatar.jpg', $1::uuid)`, [OTHER]);
  await seed('banned_by reference', `UPDATE profiles SET banned_by = $1 WHERE id = $2`, [V, THIRD]);
  console.log(`— seeded ${seeded.length} datasets${failed.length ? `; not seeded: ${failed.join(' | ')}` : ''}`);
  check('all victim datasets seeded', failed.length === 0, failed.join(' | '));

  // قبل الـmigration: الحذف ممنوع بسبب مراجع NO ACTION
  await q('BEGIN');
  const blocked = await errorOf(() => q(`DELETE FROM auth.users WHERE id = $1`, [V]));
  await q('ROLLBACK');
  check('before migration: deleting the user fails (NO ACTION references)', /foreign key|violates/.test(blocked), blocked.slice(0, 80));

  await env.db.exec(migration('20261004010000_account_deletion'));
  await env.db.exec(migration('20261004010000_account_deletion'));
  await env.db.exec(migration('20261004020000_account_deletion_fk_fix'));
  await env.db.exec(migration('20261004020000_account_deletion_fk_fix'));
  console.log('— account deletion migration applied twice\n');

  // ---------------- منطق Edge Function موصول بالقاعدة ----------------
  const removed: string[] = [];
  const deps: DeleteDeps = {
    getUserId: async (t) => ({ 'tok-victim': VICTIM, 'tok-other': OTHER, 'tok-admin': ADMIN, 'tok-third': THIRD } as Record<string, string>)[t] ?? null,
    isAdmin: async (u) => (await one(`SELECT count(*)::int n FROM user_roles WHERE user_id = $1 AND role = 'admin'`, [u])).n > 0,
    prepare: async (u, a, r) => (await env.as('service_role', null, () => one(`SELECT account_delete_prepare($1, $2, $3) r`, [u, a, r]))).r,
    removeObjects: async (bucket, names) => {
      for (const n of names) {
        await q(`DELETE FROM storage.objects WHERE bucket_id = $1 AND name = $2`, [bucket, n]);
        removed.push(`${bucket}/${n}`);
      }
    },
    deleteAuthUser: async (u) => { await q(`DELETE FROM auth.users WHERE id = $1`, [u]); },
    finish: async (l, ok, err) => { await env.as('service_role', null, () => q(`SELECT account_delete_finish($1, $2, $3)`, [l, ok, err ?? null])); },
  };

  check('no token → 401', (await handleDeleteAccount(deps, '', { confirm: 'DELETE' })).status === 401);
  check('invalid token → 401', (await handleDeleteAccount(deps, 'forged', { confirm: 'DELETE' })).status === 401);
  check('missing confirmation → 400', (await handleDeleteAccount(deps, 'tok-victim', {})).status === 400);
  check('non-admin deleting another user → 403', (await handleDeleteAccount(deps, 'tok-other', { confirm: 'DELETE', target_user_id: VICTIM, reason: 'x x x' })).status === 403);
  check('admin delete without reason → 400', (await handleDeleteAccount(deps, 'tok-admin', { confirm: 'DELETE', target_user_id: VICTIM })).status === 400);
  check('admin account cannot be deleted (self-delete) → 409', (await handleDeleteAccount(deps, 'tok-admin', { confirm: 'DELETE' })).status === 409);
  check('anon/authenticated cannot call account_delete_prepare directly',
    (await env.denied(() => env.anonQ(`SELECT account_delete_prepare($1)`, [VICTIM]))) && (await env.denied(() => userQ(OTHER, `SELECT account_delete_prepare($1)`, [VICTIM]))));
  check('victim still exists after rejected attempts', (await one(`SELECT count(*)::int n FROM auth.users WHERE id = $1`, [VICTIM])).n === 1);

  const otherBefore = await one(`SELECT
      (SELECT count(*) FROM code_snippets WHERE user_id = $1)::int snippets,
      (SELECT count(*) FROM messages WHERE sender_id = $1)::int msgs,
      (SELECT count(*) FROM storage.objects WHERE owner = $1)::int files`, [OTHER]);

  const res = await handleDeleteAccount(deps, 'tok-victim', { confirm: 'DELETE' });
  check('self-delete succeeds → 200', res.status === 200 && res.body.success === true, JSON.stringify(res.body));
  check('auth user gone', (await one(`SELECT count(*)::int n FROM auth.users WHERE id = $1`, [VICTIM])).n === 0);
  check('profile gone', (await one(`SELECT count(*)::int n FROM profiles WHERE id = $1`, [VICTIM])).n === 0);
  check('personal storage files removed (avatar + legacy receipt)', removed.length === 2 && removed.some((r) => r.startsWith('avatars/')) && removed.some((r) => r.startsWith('payment-receipts/')), removed.join(','));

  // فحص عام: لا يوجد أي عمود uuid في public يشير للضحية
  const cols = await q(`SELECT c.table_name t, c.column_name col FROM information_schema.columns c
                        JOIN information_schema.tables tb ON tb.table_name = c.table_name AND tb.table_schema = c.table_schema AND tb.table_type = 'BASE TABLE'
                        WHERE c.table_schema = 'public' AND c.data_type = 'uuid'`);
  const leftovers: string[] = [];
  for (const r of cols.rows as any[]) {
    const n = (await one(`SELECT count(*)::int n FROM public.${r.t} WHERE ${r.col} = $1`, [VICTIM])).n;
    if (n > 0) leftovers.push(`${r.t}.${r.col}=${n}`);
  }
  const logRows = (await one(`SELECT count(*)::int n FROM account_deletions WHERE user_id = $1`, [VICTIM])).n;
  check('no row anywhere still references the deleted user (except the deletion log)',
    leftovers.length === 1 && leftovers[0].startsWith('account_deletions.user_id'), leftovers.join(', '));
  check('deletion log completed, no personal data', logRows === 1 && (await one(`SELECT status, storage_objects FROM account_deletions WHERE user_id = $1`, [VICTIM])).status === 'completed');
  check('storage: no object left owned by / under the deleted user', (await one(`SELECT count(*)::int n FROM storage.objects WHERE owner = $1 OR name LIKE '%' || $1 || '%'`, [VICTIM])).n === 0);
  check('audit records kept but unlinked (admin_action_log/restriction logs set NULL → cascade by user_id)',
    (await one(`SELECT count(*)::int n FROM admin_action_log WHERE target_user_id IS NULL AND action_type = 'ban'`)).n === 1);
  check('analytics events kept anonymized', (await one(`SELECT count(*)::int n FROM analytics_events WHERE user_id IS NULL AND event = 'app_open'`)).n === 1);
  check("other user's data intact (snippets, own messages, files)",
    JSON.stringify(await one(`SELECT
      (SELECT count(*) FROM code_snippets WHERE user_id = $1)::int snippets,
      (SELECT count(*) FROM messages WHERE sender_id = $1)::int msgs,
      (SELECT count(*) FROM storage.objects WHERE owner = $1)::int files`, [OTHER])) === JSON.stringify(otherBefore));
  check('victim private messages deleted; other side keeps own messages', (await one(`SELECT count(*)::int n FROM messages WHERE content = 'private hello'`)).n === 0 &&
    (await one(`SELECT count(*)::int n FROM messages WHERE content = 'hello back'`)).n === 1);
  check('AI conversations and support tickets of the user deleted',
    (await one(`SELECT (SELECT count(*) FROM ai_chat_history WHERE content = 'secret question') + (SELECT count(*) FROM support_messages WHERE message LIKE 'my phone%') n`)).n === 0);
  check('follower counts of the other user adjusted by trigger', (await one(`SELECT followers_count, following_count FROM profiles WHERE id = $1`, [OTHER])).followers_count === 0);
  check('admin accounts unaffected', (await one(`SELECT count(*)::int n FROM user_roles WHERE user_id = $1`, [ADMIN])).n === 1);

  // حذف بواسطة مشرف
  const adminDel = await handleDeleteAccount(deps, 'tok-admin', { confirm: 'DELETE', target_user_id: THIRD, reason: 'spam account' });
  check('admin can delete another user with reason → 200', adminDel.status === 200 && adminDel.body.self === false);
  check('admin deletion logged with actor and reason', (await one(`SELECT initiated_by, reason FROM account_deletions WHERE user_id = $1`, [THIRD])).initiated_by === ADMIN);
  check('deleting an already-deleted user → 404', (await handleDeleteAccount(deps, 'tok-admin', { confirm: 'DELETE', target_user_id: THIRD, reason: 'again' })).status === 404);
  done();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * اختبار Phase A (20261004000000_security_phase_a) على PGlite.
 * التشغيل: npx tsx scripts/challenge-audit/security-phase-a-db.test.ts
 */
import { createEnv, makeChecker, migration } from './_pglite-env';

const ADMIN = 'cccccccc-0000-0000-0000-000000000001';
const A = 'cccccccc-0000-0000-0000-000000000002';
const B = 'cccccccc-0000-0000-0000-000000000003';
const C = 'cccccccc-0000-0000-0000-000000000004';
const { check, done } = makeChecker();

(async () => {
  const env = await createEnv();
  const { q, one, userQ, userOne, anonQ, svcQ, denied, errorOf } = env;
  for (const [id, admin] of [[ADMIN, true], [A, false], [B, false], [C, false]] as const) await env.addUser(id, { admin });

  await env.applyUpTo('20261003050000_user_blocks_messaging');
  // عتبات الشهادات كما في الإنتاج قبل الـmigration (البيانات غير موجودة في نسخة البنية)
  await q(`INSERT INTO certificate_requirements (course_id, level, min_lessons_percent, min_challenges_percent, min_exam_score, max_challenge_errors)
           VALUES ('__default__', 'silver', 60, 50, 60, NULL), ('__default__', 'gold', 100, 80, 80, NULL), ('__default__', 'platinum', 100, 100, 95, 0)`);
  // حالة سابقة: B محظور سابقاً + رسالة عامة
  await q(`UPDATE profiles SET is_banned = true, ban_reason = 'private reason' WHERE id = $1`, [B]);
  const msg = (await one(`INSERT INTO broadcast_messages (type, title, body, scheduled_at, is_active) VALUES ('toast', 't', 'b', now() - interval '1 minute', true) RETURNING id`)).id;
  // قبل: الثغرات قابلة للتكرار
  check('before: anyone reads another user ban reason', (await userOne(A, `SELECT check_user_restrictions($1) r`, [B])).r.ban_reason === 'private reason');
  check('before: user marks broadcast read for another user', (await errorOf(() => userQ(A, `SELECT mark_broadcast_message_read($1, $2)`, [msg, C]))) === '');
  await q(`DELETE FROM broadcast_message_reads`);

  await env.db.exec(migration('20261004000000_security_phase_a'));
  await env.db.exec(migration('20261004000000_security_phase_a'));
  console.log('— phase A migration applied twice\n');

  // search_path
  const noPath = await q(`SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
                          WHERE n.nspname = 'public' AND p.prosecdef AND NOT COALESCE(array_to_string(p.proconfig, ',') LIKE '%search_path%', false)`);
  check('every SECURITY DEFINER function in public has search_path', noPath.rows.length === 0, noPath.rows.map((r: any) => r.proname).join(','));

  // حالة الحظر
  check('user cannot read another user ban reason', (await userOne(A, `SELECT check_user_restrictions($1) r`, [B])).r.ban_reason === null);
  check('banned user still sees own ban (app sign-out flow)', (await userOne(B, `SELECT check_user_restrictions($1) r`, [B])).r.is_banned === true);
  check('admin can read any user restriction', (await userOne(ADMIN, `SELECT check_user_restrictions($1) r`, [B])).r.ban_reason === 'private reason');
  check('anon cannot call check_user_restrictions', await denied(() => anonQ(`SELECT check_user_restrictions($1)`, [B])));

  // الرسائل العامة
  check('user sees own unread broadcasts', (await userQ(A, `SELECT * FROM get_unread_broadcast_messages($1)`, [A])).rows.length === 1);
  check("user gets nothing when asking for another user's broadcasts", (await userQ(A, `SELECT * FROM get_unread_broadcast_messages($1)`, [C])).rows.length === 0);
  check('user cannot mark broadcast read for another user', await denied(() => userQ(A, `SELECT mark_broadcast_message_read($1, $2)`, [msg, C])));
  check('user can mark own broadcast read', (await errorOf(() => userQ(A, `SELECT mark_broadcast_message_read($1, $2)`, [msg, A]))) === '');
  check('after marking, own list is empty', (await userQ(A, `SELECT * FROM get_unread_broadcast_messages($1)`, [A])).rows.length === 0);
  check('anon cannot call broadcast functions', await denied(() => anonQ(`SELECT * FROM get_unread_broadcast_messages($1)`, [A])));

  // الدوال القديمة
  for (const call of [`use_ai_free_attempt('${B}', 'solve')`, `get_ai_free_uses('${B}')`, `check_user_ai_limit('${B}', 10)`,
    `get_last_completed_lesson('${B}', 'web-html-basics')`, `get_user_certificates_summary('${B}')`,
    `get_user_ai_cost('${B}', now() - interval '1 day', now())`]) {
    const fn = call.split('(')[0];
    check(`${fn}: anon/authenticated denied`, (await denied(() => anonQ(`SELECT ${call}`))) && (await denied(() => userQ(A, `SELECT ${call}`))));
  }
  check('service_role can still call get_user_certificates_summary (certificate function)', (await errorOf(() => svcQ(`SELECT get_user_certificates_summary($1)`, [B]))) === '');
  check('verify_certificate stays public (certificate verification page)', (await errorOf(() => anonQ(`SELECT verify_certificate(gen_random_uuid())`))) === '');

  // عدّادات profiles
  await userQ(A, `UPDATE profiles SET followers_count = 99999, following_count = 5, store_credits = 1000, xp_points = 500, ai_solve_uses_remaining = 999 WHERE id = $1`, [A]);
  const pa = await one(`SELECT followers_count, following_count, store_credits, xp_points, ai_solve_uses_remaining FROM profiles WHERE id = $1`, [A]);
  check('user cannot inflate own followers/following/credits/ai uses', pa.followers_count === 0 && pa.following_count === 0 && pa.store_credits === 0 && pa.xp_points === 0 && pa.ai_solve_uses_remaining === 3, JSON.stringify(pa));
  await userQ(A, `UPDATE profiles SET full_name = 'Renamed' WHERE id = $1`, [A]);
  check('normal profile edits still work', (await one(`SELECT full_name FROM profiles WHERE id = $1`, [A])).full_name === 'Renamed');

  // المتابعة والحظر
  check('follow works normally (trigger updates counts)', (await errorOf(() => userQ(A, `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`, [A, C]))) === '' &&
    (await one(`SELECT followers_count FROM profiles WHERE id = $1`, [C])).followers_count === 1);
  check('follow notification created for normal follow', (await one(`SELECT count(*)::int n FROM app_notifications WHERE user_id = $1 AND type = 'follow'`, [C])).n === 1);
  check('cannot follow self', await denied(() => userQ(A, `INSERT INTO follows (follower_id, following_id) VALUES ($1, $1)`, [A])));
  await userQ(C, `INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)`, [C, B]);
  check('blocked user cannot follow the blocker', await denied(() => userQ(B, `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`, [B, C])));
  check('blocker cannot follow the blocked user', await denied(() => userQ(C, `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`, [C, B])));
  const snippet = (await userOne(C, `INSERT INTO code_snippets (user_id, title, code, language, is_public) VALUES ($1, 'S', 'x', 'python', true) RETURNING id`, [C])).id;
  await userQ(B, `INSERT INTO code_likes (user_id, snippet_id) VALUES ($1, $2)`, [B, snippet]);
  await userQ(B, `INSERT INTO code_comments (user_id, snippet_id, content) VALUES ($1, $2, 'hi')`, [B, snippet]);
  check('likes/comments from a blocked user do not notify the blocker', (await one(`SELECT count(*)::int n FROM app_notifications WHERE user_id = $1 AND type IN ('like','comment')`, [C])).n === 0);
  await userQ(A, `INSERT INTO code_likes (user_id, snippet_id) VALUES ($1, $2)`, [A, snippet]);
  check('likes from non-blocked users still notify', (await one(`SELECT count(*)::int n FROM app_notifications WHERE user_id = $1 AND type = 'like'`, [C])).n === 1);
  check('is_blocked_with only answers for the caller (outsider A sees false for B)', (await userOne(A, `SELECT is_blocked_with($1) r`, [B])).r === false);
  check('anon cannot call is_blocked_with', await denied(() => anonQ(`SELECT is_blocked_with($1)`, [B])));
  check('insert_interaction_notification still closed to clients', await denied(() => userQ(A, `SELECT insert_interaction_notification($1, 'system', 'x', 'x', '{}'::jsonb)`, [C])));

  // عتبات الشهادات
  const reqs = await q(`SELECT level, min_lessons_percent l, min_challenges_percent c FROM certificate_requirements WHERE course_id = '__default__' ORDER BY min_lessons_percent`);
  check('certificate thresholds match the app (50/25, 75/60, 100/100)',
    JSON.stringify(reqs.rows.map((r: any) => [r.level, r.l, r.c])) === JSON.stringify([['silver', 50, 25], ['gold', 75, 60], ['platinum', 100, 100]]), JSON.stringify(reqs.rows));

  // عدم كسر مسارات سابقة
  check('progress RPCs still work', (await userOne(A, `SELECT progress_get_state() r`)).r?.success !== false);
  check('coins state still works', (await userOne(A, `SELECT coins_get_state() r`)).r?.success === true);
  done();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

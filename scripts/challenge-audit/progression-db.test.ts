/**
 * اختبار نظام التقدم والاقتصاد والإعلانات على PostgreSQL حقيقي محلياً (PGlite):
 *   مخطط الإنتاج (النسخة الاحتياطية) + كل الـmigrations السابقة + حالة الإنتاج الفعلية المكتشفة
 *   (lesson_catalog بلا عمود xp) + migrations التقدم الجديدة (مرتين: قابلة للتكرار).
 * لا يتصل بأي Supabase. التشغيل:
 *   npx tsx scripts/challenge-audit/progression-db.test.ts
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

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const U = '11111111-1111-1111-1111-111111111111'; // مستخدم جديد
const V = '22222222-2222-2222-2222-222222222222'; // مستخدم قديم لديه تقدم ورصيد وسلسلة
const A = '33333333-3333-3333-3333-333333333333'; // مشرف
const X = '44444444-4444-4444-4444-444444444444'; // يحاول الاستغلال
const S = '55555555-5555-5555-5555-555555555555'; // اختبار السلسلة والأهداف
const L = '66666666-6666-6666-6666-666666666666'; // مستخدم قديم XP < 100 (المستوى 0 على السيرفر)

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
  await db.exec(coins.match(/UPDATE course_coin_catalog\r?\nSET suggested_cost[\s\S]*?difficulty <> 'beginner';/)![0]);

  for (const id of [U, V, A, X, S, L]) {
    await db.query(`INSERT INTO auth.users (id) VALUES ($1)`, [id]);
    await db.query(`INSERT INTO profiles (id, username, xp, level) VALUES ($1, $2, 0, 1)`, [id, 'u' + id.slice(0, 4)]);
  }
  await db.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')`, [A]);

  async function as(role: 'authenticated' | 'service_role' | 'anon', uid: string | null, fn: () => Promise<any>): Promise<any> {
    await db.exec('RESET ROLE');
    await db.query(`SELECT set_config('request.jwt.claim.sub', $1, false)`, [uid ?? '']);
    await db.exec(`SET ROLE ${role}`);
    try {
      return await fn();
    } finally {
      await db.exec('RESET ROLE');
    }
  }
  const one = async (sql: string, p: unknown[] = []) => (await db.query(sql, p)).rows[0] as any;
  const rpc = (uid: string, sql: string, p: unknown[] = []) => as('authenticated', uid, async () => (await one(sql, p)).r);
  const svc = (sql: string, p: unknown[] = []) => as('service_role', null, async () => (await one(sql, p)).r);
  const fails = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      return false;
    } catch {
      return true;
    }
  };
  const errorOf = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      return '';
    } catch (e: any) {
      return String(e?.message ?? e);
    }
  };
  const xpOf = async (id: string) => (await one(`SELECT xp, level, streak_days FROM profiles WHERE id = $1`, [id])) as { xp: number; level: number; streak_days: number };
  const balance = async (id: string) => (await one(`SELECT COALESCE((SELECT total_points FROM user_points WHERE user_id = $1), 0) b`, [id])).b as number;
  const txCount = async (id: string) => (await one(`SELECT count(*)::int n FROM point_transactions WHERE user_id = $1`, [id])).n as number;
  const oldAppSave = (uid: string, lessonId: string, courseId: string) =>
    as('authenticated', uid, () =>
      db.query(
        `INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed, xp_earned, completed_at, updated_at)
         VALUES ($1, $2, $3, true, 9999, now(), now())
         ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = true, xp_earned = 9999, completed_at = now(), updated_at = now()`,
        [uid, lessonId, courseId]
      )
    );

  // ===== الـmigrations السابقة بالترتيب + تقدم قديم =====
  for (const m of ['20261001010000_server_verified_challenges', '20261001020000_curriculum_lesson_catalog', '20261002000000_protect_profile_columns']) {
    await db.exec(read(MIG(m)));
  }
  // V: مستخدم قديم — 3 دروس HTML، دورة مدفوعة سابقاً، رصيد، سلسلة 5 أيام، مطالبة سلّم أمس
  for (const [i, at] of [
    ['html-1', '2026-09-28 10:00:00+00'],
    ['html-document', '2026-09-29 10:00:00+00'],
    ['html-2', '2026-09-30 22:30:00+00'], // = 01:30 فجراً بتوقيت بغداد يوم 2026-10-01
  ]) {
    await db.query(
      `INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed, xp_earned, completed_at) VALUES ($1, $2, 'web-html-basics', true, 100, $3)`,
      [V, i, at]
    );
  }
  await db.query(`UPDATE profiles SET xp = 500, level = 2, streak_days = 5 WHERE id = $1`, [V]);
  await db.query(`UPDATE profiles SET xp = 50, level = 0 WHERE id = $1`, [L]);
  await db.query(`INSERT INTO user_points (user_id, total_points, earned_points) VALUES ($1, 300, 300)`, [V]);
  await db.query(`INSERT INTO user_unlocked_courses (user_id, course_id) VALUES ($1, 'py-data-structures')`, [V]);
  for (const m of ['20261002010000_server_side_xp', '20261002020000_challenge_access', '20261002030000_ai_assistant']) {
    await db.exec(read(MIG(m)));
  }
  await db.exec(`INSERT INTO user_stats (user_id, streak_days, last_active_date) VALUES ('${V}', 5, CURRENT_DATE - 1) ON CONFLICT DO NOTHING`).catch(() => null);

  // ===== حالة الإنتاج الفعلية: lesson_catalog بلا xp =====
  await db.exec(`ALTER TABLE lesson_catalog DROP COLUMN xp`);
  const prodErr = await errorOf(() => oldAppSave(U, 'html-1', 'web-html-basics'));
  check('reproduced production state: lesson completion fails (lesson_catalog.xp missing)', /xp/.test(prodErr), prodErr.slice(0, 90));

  const before = {
    vXp: (await xpOf(V)).xp,
    vBal: await balance(V),
    vTx: await txCount(V),
    xpAwards: (await one(`SELECT count(*)::int n FROM xp_awards`)).n,
  };

  // ===== الـmigrations الجديدة (مرتين) =====
  for (const m of ['20261003000000_progression_catalog', '20261003010000_progression_economy', '20261003020000_challenge_solutions', '20261003030000_challenge_expansion']) {
    await db.exec(read(MIG(m)));
    await db.exec(read(MIG(m)));
  }
  console.log('— new migrations applied twice\n');
  await db.exec(`UPDATE coin_config SET value = jsonb_set(value, '{min_seconds_between_lessons}', '0') WHERE key = 'progression'`);
  const quiz = async (lesson: string) => (await one(`SELECT quiz_correct q FROM lesson_catalog WHERE lesson_id = $1`, [lesson])).q as number | null;
  const lessonsOf = async (course: string) => (await db.query(`SELECT lesson_id FROM lesson_catalog WHERE course_id = $1 ORDER BY position`, [course])).rows.map((r: any) => r.lesson_id) as string[];
  const complete = (uid: string, lesson: string, answer?: number | null) =>
    rpc(uid, `SELECT progress_complete_lesson($1, $2) r`, [lesson, answer === undefined ? null : answer]);
  const completeOk = async (uid: string, lesson: string) => complete(uid, lesson, await quiz(lesson));

  // ===== المستخدم القديم والإصلاح =====
  console.log('== legacy users / migration safety');
  check('lesson_catalog.xp restored with catalog values', (await one(`SELECT count(*)::int n FROM lesson_catalog WHERE xp > 0`)).n === 344);
  check('legacy user: XP unchanged', (await xpOf(V)).xp === before.vXp, String((await xpOf(V)).xp));
  check('legacy user: balance unchanged', (await balance(V)) === before.vBal);
  check('legacy user: no coin transactions created by migration', (await txCount(V)) === before.vTx);
  check('no XP awarded by migration', (await one(`SELECT count(*)::int n FROM xp_awards`)).n === before.xpAwards);
  const vRows = (await db.query(`SELECT lesson_id, verified, verified_source FROM user_lesson_progress WHERE user_id = $1`, [V])).rows as any[];
  check('legacy completions kept and verified as legacy', vRows.length === 3 && vRows.every((r) => r.verified && r.verified_source === 'legacy'));
  check('legacy streak preserved', (await one(`SELECT current_streak FROM user_streaks WHERE user_id = $1`, [V])).current_streak === 5);
  check('legacy activity day mapped to Baghdad date (22:30 UTC → next day)',
    !!(await one(`SELECT 1 x FROM user_activity_days WHERE user_id = $1 AND day = '2026-10-01'`, [V])));
  check('legacy achievements recorded without coins',
    (await one(`SELECT count(*)::int n, COALESCE(sum(coins),0)::int c FROM achievements_awarded WHERE user_id = $1`, [V])).c === 0 &&
    (await one(`SELECT count(*)::int n FROM achievements_awarded WHERE user_id = $1 AND legacy`, [V])).n >= 1);
  check('previously purchased course stays accessible', (await one(`SELECT _course_accessible($1, 'py-data-structures') r`, [V])).r === true);
  check('level unified: server level 0 → 1 (XP unchanged)', (await xpOf(L)).level === 1 && (await xpOf(L)).xp === 50);
  check('kodax_level matches app formula', (await one(`SELECT kodax_level(0) a, kodax_level(99) b, kodax_level(400) c, kodax_level(899) d, kodax_level(900) e`)).e === 3 &&
    (await one(`SELECT kodax_level(0) a`)).a === 1 && (await one(`SELECT kodax_level(899) d`)).d === 2);

  // ===== 1، 3: إكمال درس صحيح مرة واحدة =====
  console.log('\n== lesson completion (server-authoritative)');
  const html = await lessonsOf('web-html-basics');
  const xp0 = (await xpOf(U)).xp;
  const r1 = await completeOk(U, html[0]);
  const lxp = (await one(`SELECT xp FROM lesson_catalog WHERE lesson_id = $1`, [html[0]])).xp;
  check('1) correct lesson completion → verified + catalog XP', r1.success && r1.xp_awarded === lxp && (await xpOf(U)).xp === xp0 + lxp, JSON.stringify(r1).slice(0, 120));
  check('1) progress row verified by server', !!(await one(`SELECT 1 x FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2 AND verified AND verified_source = 'server'`, [U, html[0]])));
  const r1b = await completeOk(U, html[0]);
  check('3) same completion again → no second reward', r1b.success && r1b.already_completed && (await xpOf(U)).xp === xp0 + lxp);
  check('activity + streak started from verified completion', (await one(`SELECT current_streak FROM user_streaks WHERE user_id = $1`, [U])).current_streak === 1);
  const q2 = (await quiz(html[1]))!;
  check('wrong quiz answer → rejected, no penalty', (await complete(U, html[1], (q2 + 1) % 4)).code === 'wrong_answer');
  check('missing quiz answer → quiz_required', (await complete(U, html[1], null)).code === 'quiz_required');
  check('skip a lesson → previous_required', (await completeOk(U, html[2])).code === 'previous_required');
  check('unknown lesson → rejected', (await complete(U, 'no-such-lesson', 0)).code === 'unknown_lesson');
  await db.exec(`UPDATE coin_config SET value = jsonb_set(value, '{min_seconds_between_lessons}', '20') WHERE key = 'progression'`);
  check('too fast between lessons → too_fast', (await completeOk(U, html[1])).code === 'too_fast');
  await db.exec(`UPDATE coin_config SET value = jsonb_set(value, '{min_seconds_between_lessons}', '0') WHERE key = 'progression'`);
  check('next lesson after gap → success', (await completeOk(U, html[1])).success === true);

  // ===== 2: تزوير الإكمال من العميل =====
  console.log('\n== client forgery');
  const xpBeforeForge = (await xpOf(X)).xp;
  const forge = await errorOf(() => oldAppSave(X, html[5], 'web-html-basics'));
  check('old app upsert still works (no error, progress saved)', forge === '', forge);
  const fr = await one(`SELECT verified, completed FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2`, [X, html[5]]);
  check('2) client completed=true is stored UNVERIFIED', fr.completed === true && fr.verified === false);
  check('2) client completion gives no XP', (await xpOf(X)).xp === xpBeforeForge);
  await as('authenticated', X, () => db.query(`UPDATE user_lesson_progress SET verified = true, verified_source = 'server' WHERE user_id = $1`, [X]));
  check('client cannot set verified=true', (await one(`SELECT verified FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2`, [X, html[5]])).verified === false);
  await as('authenticated', X, () => db.query(`INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed, verified, verified_source) VALUES ($1, $2, 'web-html-basics', true, true, 'server')`, [X, html[6]]));
  check('client insert with verified=true is forced unverified', (await one(`SELECT verified FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2`, [X, html[6]])).verified === false);
  const ts0 = (await one(`SELECT completed_at FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2`, [U, html[0]])).completed_at;
  await as('authenticated', U, () => db.query(`UPDATE user_lesson_progress SET completed_at = now() + interval '1 day', verified = false WHERE user_id = $1 AND lesson_id = $2`, [U, html[0]]));
  const after = await one(`SELECT completed_at, verified FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2`, [U, html[0]]);
  check('client cannot change completed_at / verified of a verified row', String(after.completed_at) === String(ts0) && after.verified === true);
  await as('authenticated', U, () => db.query(`DELETE FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2`, [U, html[0]]));
  check('client cannot delete a verified row', !!(await one(`SELECT 1 x FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2`, [U, html[0]])));
  check('client cannot write a challenge completion', await fails(() => as('authenticated', X, () => db.query(`INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed) VALUES ($1, 'ch-1', 'challenges', true)`, [X]))));
  check('unverified completion does not count as daily activity', (await one(`SELECT _coins_has_activity($1, _coin_today()) r`, [X])).r === false);
  check('daily reward refuses fake activity', (await rpc(X, `SELECT coins_claim_daily_reward() r`)).code === 'activity_required');

  // ===== XP / الكوينات من العميل =====
  check('14) client cannot change own xp', (await as('authenticated', X, () => db.query(`UPDATE profiles SET xp = 99999, level = 99, streak_days = 999 WHERE id = $1`, [X])), (await xpOf(X)).xp === xpBeforeForge && (await xpOf(X)).streak_days === 0));
  check('14) client cannot write user_points', await fails(() => as('authenticated', X, () => db.query(`UPDATE user_points SET total_points = 99999 WHERE user_id = $1`, [X]))) ||
    (await balance(X)) === 0);
  check('14) client cannot insert point_transactions', await fails(() => as('authenticated', X, () => db.query(`INSERT INTO point_transactions (user_id, type, amount) VALUES ($1, 'earned', 9999)`, [X]))));
  check('14) client cannot call _coins_apply', await fails(() => as('authenticated', X, () => db.query(`SELECT _coins_apply($1, 9999, 'x', 'x', NULL, NULL)`, [X]))));
  check('client cannot call _xp_award', await fails(() => as('authenticated', X, () => db.query(`SELECT _xp_award($1, 'lesson', 'zz', 999)`, [X]))));
  check('client cannot call _activity_touch', await fails(() => as('authenticated', X, () => db.query(`SELECT _activity_touch($1, 'lesson')`, [X]))));

  // ===== التقدم بين الدورات =====
  console.log('\n== course progression (learning, not coins)');
  check('intermediate course locked before prerequisite', (await one(`SELECT _course_accessible($1, 'web-js-basics') r`, [U])).r === false);
  const js = await lessonsOf('web-js-basics');
  check('preview (first) lesson of a locked course is still allowed', (await completeOk(U, js[0])).success === true);
  check('completing the preview does not open the course', (await one(`SELECT _course_accessible($1, 'web-js-basics') r`, [U])).r === false);
  check('lesson 2 of locked course → course_locked with requirement', (await completeOk(U, js[1])).code === 'course_locked');
  const need = Math.ceil(html.length * 0.7);
  for (let i = 2; i < need; i++) await completeOk(U, html[i]);
  check(`after ${need}/${html.length} HTML lessons (70%) → JS course opens free`, (await one(`SELECT _course_accessible($1, 'web-js-basics') r`, [U])).r === true);
  check('no coins were spent to progress', (await one(`SELECT count(*)::int n FROM point_transactions WHERE user_id = $1 AND type = 'spent'`, [U])).n === 0);
  check('several paths open at once (all beginner courses accessible)', (await one(`SELECT bool_and(_course_accessible($1, course_id)) r FROM course_coin_catalog WHERE difficulty = 'beginner'`, [U])).r === true);
  const st = await rpc(U, `SELECT progress_get_state() r`);
  const jsState = st.courses.find((c: any) => c.course_id === 'web-js-basics');
  check('progress_get_state reports access + reason', jsState.accessible === true && jsState.requires_course_id === 'web-html-basics' && st.completed_lessons.length >= need);
  check('coins_get_state lists progression-open courses as unlocked (old app compatible)',
    (await rpc(U, `SELECT coins_get_state() r`)).unlocked_courses.includes('web-js-basics'));
  const accFree = await rpc(U, `SELECT coins_unlock_course('web-js-basics') r`);
  check('unlock on an already-accessible course costs 0', accFree.success && accFree.cost === 0);

  // ===== الكوينات كاختصار =====
  console.log('\n== coins as optional shortcut');
  const noMoney = await rpc(U, `SELECT coins_unlock_course('cpp-pointers') r`);
  check('early access without coins → insufficient (learning path still free)', noMoney.code === 'insufficient');
  await db.query(`INSERT INTO user_points (user_id, total_points, earned_points) VALUES ($1, 500, 500) ON CONFLICT (user_id) DO UPDATE SET total_points = 500`, [U]);
  const early = await rpc(U, `SELECT coins_unlock_course('cpp-pointers') r`);
  check('early access charged once', early.success && early.cost > 0 && (await balance(U)) === 500 - early.cost);
  check('second unlock → already_unlocked, no charge', (await rpc(U, `SELECT coins_unlock_course('cpp-pointers') r`)).already_unlocked === true && (await balance(U)) === 500 - early.cost);

  // ===== التحديات + الحل بإعلان =====
  console.log('\n== challenges, attempts, rewarded solution');
  const ch = 'ch-1'; // تحدٍ مجاني سهل
  const submit = (uid: string, id: string, passed: boolean, passedTests = passed ? 3 : 1) =>
    svc(`SELECT record_challenge_submission($1, $2, $3, 3, $4, 'sha') r`, [uid, id, passedTests, passed]);
  check('6) solution without ad and without attempts → try_first', (await rpc(U, `SELECT challenge_solution_start($1) r`, [ch])).code === 'try_first');
  check('6) reveal without ad → ad_required, no solution text', (await rpc(U, `SELECT challenge_reveal_solution($1) r`, [ch])).solution === undefined);
  check('solutions table not readable by client', await fails(() => as('authenticated', U, () => db.query(`SELECT * FROM challenge_solutions LIMIT 1`))));
  const a1 = await submit(U, ch, false);
  check('attempt 1 → feedback (hint level 0)', a1.attempts.hint_level === 1 || a1.attempts.hint_level === 0);
  await submit(U, ch, false);
  const a3 = await submit(U, ch, false);
  check('attempts 2,3 → hint level 2, can reveal after 3 failed', a3.attempts.hint_level === 2 && a3.attempts.can_reveal === true);
  await db.exec(`UPDATE coin_config SET value = jsonb_set(value, '{client_claim_enabled}', 'false') WHERE key = 'ads'`);
  const sess = await rpc(U, `SELECT challenge_solution_start($1) r`, [ch]);
  check('solution ad session created', sess.success && !!sess.session_id && sess.purpose === 'solution');
  await db.query(`UPDATE ad_reward_sessions SET created_at = now() - interval '1 minute' WHERE id = $1`, [sess.session_id]);
  const fakeClaim = await rpc(U, `SELECT coins_claim_ad_reward($1) r`, [sess.session_id]);
  check('client claim refused when SSV required (no fake reveal)', fakeClaim.code === 'pending_verification' &&
    (await rpc(U, `SELECT challenge_reveal_solution($1) r`, [ch])).code === 'ad_required');
  const ssv = await svc(`SELECT coins_credit_ad_ssv($1, $2, 'txn-sol-1') r`, [sess.session_id, U]);
  check('7) SSV-verified ad → solution unlocked', ssv.success && ssv.purpose === 'solution');
  const sol = await rpc(U, `SELECT challenge_reveal_solution($1) r`, [ch]);
  check('7) solution text returned after verified ad', sol.success && typeof sol.solution === 'string' && sol.solution.length > 5);
  check('11) SSV replay (same transaction) → duplicate', (await svc(`SELECT coins_credit_ad_ssv($1, $2, 'txn-sol-1') r`, [sess.session_id, U])).duplicate === true);
  check('watching the solution ad gives no coins', (await balance(U)) === 500 - early.cost);
  const xpBeforeSolve = (await xpOf(U)).xp;
  const solved = await submit(U, ch, true);
  const pts = (await one(`SELECT points FROM challenge_catalog WHERE id = $1`, [ch])).points;
  check('after reveal: first solve gives reduced XP (50%)', solved.first_time && solved.xp_awarded === Math.max(1, Math.round(pts * 0.5)) && (await xpOf(U)).xp === xpBeforeSolve + solved.xp_awarded, JSON.stringify(solved).slice(0, 100));
  check('after reveal: no first-solve coins', (await rpc(U, `SELECT coins_reward_challenge($1, 'hard') r`, [ch])).code === 'solution_revealed');

  // محاولات محلية فاشلة (التطبيق يشغّل الاختبارات قبل الإرسال) تُحتسب لأهلية إظهار الحل
  {
    const ch3 = 'ch-3';
    check('local attempts: unknown challenge rejected', (await rpc(X, `SELECT challenge_record_attempt('nope', 0, 3) r`)).code === 'unknown_challenge');
    let st3: any;
    for (let i = 0; i < 3; i++) st3 = await rpc(X, `SELECT challenge_record_attempt($1, 1, 3) r`, [ch3]);
    check('3 failed local runs → hint level 2 + can reveal (ad still required)', st3.success && st3.hint_level === 2 && st3.can_reveal === true && st3.reveal_needs_ad === true);
    check('local attempts give no XP, coins or completion', (await xpOf(X)).xp === xpBeforeForge && (await balance(X)) === 0 &&
      !(await one(`SELECT 1 x FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2`, [X, ch3])));
    check('attempt log not readable/writable by clients', await fails(() => as('authenticated', X, () => db.query(`INSERT INTO challenge_attempt_log (user_id, challenge_id) VALUES ($1, 'ch-3')`, [X]))));
  }

  // 4، 5: تحدٍ بلا كشف حل
  const ch2 = 'ch-2';
  const xpB = (await xpOf(U)).xp;
  const balB = await balance(U);
  const s2 = await submit(U, ch2, true);
  check('4) challenge solved → full XP once', s2.first_time && s2.xp_awarded === (await one(`SELECT points FROM challenge_catalog WHERE id = $1`, [ch2])).points);
  const c2 = await rpc(U, `SELECT coins_reward_challenge($1, 'hard') r`, [ch2]);
  const easyReward = (await one(`SELECT (value->>'easy')::int r FROM coin_config WHERE key = 'challenge_rewards'`)).r;
  check('5) forged difficulty "hard" ignored → easy reward from catalog', c2.success && c2.reward === easyReward && (await balance(U)) === balB + easyReward);
  check('4) second reward for same challenge → none', (await rpc(U, `SELECT coins_reward_challenge($1, 'easy') r`, [ch2])).duplicate === true && (await balance(U)) === balB + easyReward);
  check('4) solving again → no second XP', (await submit(U, ch2, true)).xp_awarded === 0 && (await xpOf(U)).xp === xpB + s2.xp_awarded);
  check('solved challenge → reference solution free (no ad)', (await rpc(U, `SELECT challenge_reveal_solution($1) r`, [ch2])).success === true);
  check('locked challenge (course not reached) → not recorded', (await svc(`SELECT record_challenge_submission($1, 'ai-challenge-7', 3, 3, true, 'x') r`, [X])).locked === true);

  // ===== 8-10: حصة الذكاء =====
  console.log('\n== AI quota + rewarded ads');
  const res: any[] = [];
  for (let i = 0; i < 11; i++) res.push(await svc(`SELECT ai_quota_reserve($1) r`, [S]));
  check('8) 10 AI requests allowed', res.slice(0, 10).every((r) => r.allowed));
  check('9) request 11 → quota_exceeded with ad option', res[10].allowed === false && res[10].code === 'quota_exceeded' && res[10].quota.ads.can_watch === true);
  for (const t of ['ai-1', 'ai-2']) {
    await db.query(`UPDATE ad_reward_sessions SET rewarded_at = now() - interval '1 hour' WHERE user_id = $1 AND status = 'rewarded'`, [S]);
    const s = await rpc(S, `SELECT ai_start_ad_session() r`);
    await db.query(`UPDATE ad_reward_sessions SET created_at = now() - interval '1 minute' WHERE id = $1`, [s.session_id]);
    await svc(`SELECT coins_credit_ad_ssv($1, $2, $3) r`, [s.session_id, S, t]);
  }
  const q = await rpc(S, `SELECT ai_get_quota() r`);
  check('10) two verified ads → +3 AI requests', q.limit === 13 && q.remaining === 3, JSON.stringify(q).slice(0, 80));
  check('AI ads give no coins', (await balance(S)) === 0);
  await db.query(`INSERT INTO user_points (user_id, total_points, earned_points) VALUES ($1, 100, 100) ON CONFLICT (user_id) DO UPDATE SET total_points = 100`, [S]);
  const pack = await rpc(S, `SELECT ai_buy_pack() r`);
  check('optional AI pack with coins → +3 (charged once)', pack.success && pack.quota.limit === 16 && (await balance(S)) === 100 - pack.cost);
  check('AI pack daily limit', (await rpc(S, `SELECT ai_buy_pack() r`)).code === 'pack_limit' && (await balance(S)) === 100 - pack.cost);

  // ===== 11: إعادة استخدام جلسة الإعلان =====
  console.log('\n== ad session replay / fake claims');
  await db.exec(`UPDATE coin_config SET value = jsonb_set(value, '{client_claim_enabled}', 'true') WHERE key = 'ads'`);
  const cs = await rpc(V, `SELECT coins_start_ad_session() r`);
  check('client claim within 5s → too_fast', (await rpc(V, `SELECT coins_claim_ad_reward($1) r`, [cs.session_id])).code === 'too_fast');
  await db.query(`UPDATE ad_reward_sessions SET created_at = now() - interval '1 minute' WHERE id = $1`, [cs.session_id]);
  const vb = await balance(V);
  await rpc(V, `SELECT coins_claim_ad_reward($1) r`, [cs.session_id]);
  const replay = await rpc(V, `SELECT coins_claim_ad_reward($1) r`, [cs.session_id]);
  check('11) same session claimed twice → one reward', replay.duplicate === true && (await balance(V)) === vb + 15);
  check('ad session of another user cannot be claimed', (await rpc(X, `SELECT coins_claim_ad_reward($1) r`, [cs.session_id])).code === 'invalid_session');
  await db.exec(`UPDATE coin_config SET value = jsonb_set(value, '{client_claim_enabled}', 'false') WHERE key = 'ads'`);
  const cs2 = await rpc(V, `SELECT coins_start_ad_session() r`);
  if (cs2.session_id) await db.query(`UPDATE ad_reward_sessions SET created_at = now() - interval '1 minute' WHERE id = $1`, [cs2.session_id]);
  const vb2 = await balance(V);
  const blocked = cs2.session_id ? await rpc(V, `SELECT coins_claim_ad_reward($1) r`, [cs2.session_id]) : { code: cs2.code };
  check('client_claim_enabled=false → start→wait→claim gives nothing', (blocked.code === 'pending_verification' || blocked.code === 'cooldown') && (await balance(V)) === vb2, blocked.code);
  check('ad_session_status visible to owner only', (await rpc(V, `SELECT ad_session_status($1) r`, [cs.session_id])).status === 'rewarded' &&
    (await rpc(X, `SELECT ad_session_status($1) r`, [cs.session_id])).code === 'invalid_session');

  // ===== 12: السلسلة =====
  console.log('\n== streak (unified, server-side)');
  check('12) update_user_streak for another user → denied', await fails(() => rpc(X, `SELECT update_user_streak($1) r`, [V])));
  check('12) anon cannot call update_user_streak', await fails(() => as('anon', null, () => db.query(`SELECT update_user_streak($1)`, [V]))));
  check('record_daily_progress for another user → denied', await fails(() => rpc(X, `SELECT record_daily_progress($1, 99, 99, 9999) r`, [V])));
  check('anon cannot call record_daily_progress', await fails(() => as('anon', null, () => db.query(`SELECT record_daily_progress($1, 1, 1, 1)`, [V]))));
  const dp = await rpc(X, `SELECT record_daily_progress($1, 99, 99, 9999) r`, [X]);
  check('record_daily_progress ignores client numbers', dp.lessons_completed === 0 && dp.xp_earned === 0);

  // أهداف التقدم اليومي: نفس الأهداف القديمة حسب المستوى (التطبيق يقسم عليها — لا أصفار)
  {
    // نفس حساب التطبيق: progressService.getDailyProgressPercentage
    const appPct = (d: any) =>
      Math.round(
        ((Math.min(d.lessons_completed / d.goal_lessons, 1) +
          Math.min(d.challenges_completed / d.goal_challenges, 1) +
          Math.min(d.xp_earned / d.goal_xp, 1)) /
          3) *
          100
      );
    const tiers: Array<[number, number, number, number]> = [
      [50, 2, 1, 200], // المستوى 1
      [2500, 3, 1, 300], // المستوى 5
      [10000, 4, 2, 400], // المستوى 10
      [22500, 5, 2, 500], // المستوى 15
      [40000, 6, 3, 600], // المستوى 20
    ];
    for (const [xp, gl, gc, gx] of tiers) {
      await db.query(`UPDATE profiles SET xp = $2 WHERE id = $1`, [L, xp]);
      const d = await rpc(L, `SELECT record_daily_progress($1, 0, 0, 0) r`, [L]);
      check(`daily goals for ${xp} XP (level ${Math.max(1, Math.floor(Math.sqrt(xp / 100)))}) = ${gl}/${gc}/${gx}`,
        d.goal_lessons === gl && d.goal_challenges === gc && d.goal_xp === gx, JSON.stringify(d));
      check(`daily percentage finite for ${xp} XP (no NaN)`, Number.isFinite(appPct(d)) && appPct(d) === 0, String(appPct(d)));
    }
    await db.query(`UPDATE profiles SET xp = 50, level = 1 WHERE id = $1`, [L]);
    const g = await rpc(L, `SELECT get_daily_progress($1) r`, [L]);
    check('get_daily_progress: same non-zero goals', g.goal_lessons === 2 && g.goal_challenges === 1 && g.goal_xp === 200);
    check('get_daily_progress for another user → denied', await fails(() => rpc(X, `SELECT get_daily_progress($1) r`, [L])));
    // نشاط موثّق يظهر في النسبة
    const quizL = (await one(`SELECT quiz_correct q FROM lesson_catalog WHERE lesson_id = 'html-1'`)).q;
    await rpc(L, `SELECT progress_complete_lesson('html-1', $1) r`, [quizL]);
    const after = await rpc(L, `SELECT record_daily_progress($1, 0, 0, 0) r`, [L]);
    check('verified lesson reflected in daily progress (lessons + xp)', after.lessons_completed === 1 && after.xp_earned > 0 &&
      appPct(after) > 0 && appPct(after) <= 100, `${JSON.stringify(after)} pct=${appPct(after)}`);
  }
  await rpc(X, `SELECT update_user_streak($1) r`, [X]);
  check('update_user_streak adds no activity', (await one(`SELECT current_streak FROM user_streaks WHERE user_id = $1`, [X])).current_streak === 0);
  // S: سلسلة 4 أيام انتهت قبل يومين، تجميد واحد → محفوظة
  await db.query(`UPDATE user_streaks SET current_streak = 4, best_streak = 4, last_active_day = _coin_today() - 2, freezes = 1, free_freeze_week = _iso_week(_coin_today()) WHERE user_id = $1`, [S]);
  const html1 = (await lessonsOf('web-html-basics'))[0];
  await completeOk(S, html1);
  const sAfter = await one(`SELECT current_streak, freezes, freezes_used FROM user_streaks WHERE user_id = $1`, [S]);
  check('missed day covered by free freeze → streak continues (4→5)', sAfter.current_streak === 5 && sAfter.freezes === 0 && sAfter.freezes_used === 1, JSON.stringify(sAfter));
  check('frozen day recorded (not counted as activity)', !!(await one(`SELECT 1 x FROM user_activity_days WHERE user_id = $1 AND day = _coin_today() - 1 AND frozen`, [S])));
  await db.query(`UPDATE user_streaks SET current_streak = 9, last_active_day = _coin_today() - 4, freezes = 1 WHERE user_id = $1`, [X]);
  await rpc(X, `SELECT update_user_streak($1) r`, [X]);
  check('3 missed days with 1 freeze → streak resets (no other penalty)', (await one(`SELECT current_streak, freezes FROM user_streaks WHERE user_id = $1`, [X])).current_streak === 0 &&
    (await one(`SELECT freezes FROM user_streaks WHERE user_id = $1`, [X])).freezes === 1);
  const sb = await balance(S);
  const fz = await rpc(S, `SELECT streak_freeze_buy() r`);
  check('buy a streak freeze with coins', fz.success && fz.freezes === 1 && (await balance(S)) === sb - fz.cost);
  await rpc(S, `SELECT streak_freeze_buy() r`);
  check('freeze max respected', (await rpc(S, `SELECT streak_freeze_buy() r`)).code === 'max_freezes');

  // ===== الأهداف =====
  console.log('\n== goals');
  check('invalid goal target rejected', (await rpc(S, `SELECT goals_set(7) r`)).code === 'invalid_target');
  await rpc(S, `SELECT goals_set(2) r`);
  const b0 = await balance(S);
  const r2 = await completeOk(S, (await lessonsOf('web-html-basics'))[1]);
  check('daily goal (2 units) reached → reward once', r2.activity.goals.daily_done === true && r2.activity.goals.awarded_daily === 8 && (await balance(S)) >= b0 + 8);
  const b1 = await balance(S);
  await completeOk(S, (await lessonsOf('web-html-basics'))[2]);
  check('third unit same day → no second daily reward', (await one(`SELECT count(*)::int n FROM point_transactions WHERE user_id = $1 AND source = 'goal_daily'`, [S])).n === 1 &&
    (await balance(S)) - b1 < 8);
  // 4 أيام نشطة سابقة في نفس الأسبوع (إن وُجدت) + اليوم = 5
  await db.query(`INSERT INTO user_activity_days (user_id, day, lessons) SELECT $1, d::date, 1 FROM generate_series(date_trunc('week', _coin_today()), _coin_today() - 1, interval '1 day') d ON CONFLICT (user_id, day) DO UPDATE SET lessons = 1, frozen = false`, [S]);
  const wkDays = (await one(`SELECT (_goals_state($1)->>'week_active_days')::int n`, [S])).n;
  await completeOk(S, (await lessonsOf('web-html-basics'))[3]);
  const weekly = (await one(`SELECT count(*)::int n FROM point_transactions WHERE user_id = $1 AND source = 'goal_weekly'`, [S])).n;
  check(`weekly goal (5/7 days) → reward iff reached (active days ${wkDays})`, wkDays >= 5 ? weekly === 1 : weekly === 0);

  // ===== السلّم اليومي بنفس القيم =====
  const ladder = await rpc(S, `SELECT coins_claim_daily_reward() r`);
  check('daily ladder works with verified activity (values unchanged)', ladder.success && [5, 10, 15, 20, 25, 30, 50].includes(ladder.reward));
  check('daily ladder once per day', (await rpc(S, `SELECT coins_claim_daily_reward() r`)).code === 'already_claimed');
  check('ladder config unchanged (155/week)', (await one(`SELECT value->'rewards' r FROM coin_config WHERE key = 'daily_ladder'`)).r.reduce((a: number, b: number) => a + b, 0) === 155);

  // ===== الإنجازات =====
  const achv = (await db.query(`SELECT achievement_id, coins, legacy FROM achievements_awarded WHERE user_id = $1`, [U])).rows as any[];
  check('achievements awarded server-side once (first_lesson)', achv.some((a) => a.achievement_id === 'first_lesson' && a.coins > 0 && !a.legacy) &&
    (await one(`SELECT count(*)::int n FROM point_transactions WHERE user_id = $1 AND idempotency_key = 'achv:first_lesson'`, [U])).n === 1);
  check('client cannot insert achievements', await fails(() => as('authenticated', X, () => db.query(`INSERT INTO achievements_awarded (user_id, achievement_id, coins) VALUES ($1, 'lessons_100', 40)`, [X]))));

  // ===== مكافأة إكمال الدورة =====
  console.log('\n== course completion');
  const cyb = await lessonsOf('cyber-basics');
  let last: any;
  for (const l of cyb) last = await completeOk(V, l);
  check('course completion reward from verified lessons, once', last.course_completion?.success === true && last.course_completion?.reward === 30);
  check('course completion reward not repeatable', (await rpc(V, `SELECT coins_reward_course_completion('cyber-basics') r`)).duplicate === true);
  check('course reward refuses unverified completions', (await rpc(X, `SELECT coins_reward_course_completion('web-html-basics') r`)).code === 'not_completed');

  // ===== التحليلات =====
  console.log('\n== analytics');
  check('unknown client event rejected', (await rpc(U, `SELECT track_event('give_me_coins', '{}') r`)).code === 'unknown_event');
  await rpc(U, `SELECT track_event('app_open', '{}') r`);
  check('app_open counted once per day', (await rpc(U, `SELECT track_event('app_open', '{}') r`)).duplicate === true);
  check('analytics not readable by users', await fails(() => as('authenticated', U, () => db.query(`SELECT * FROM analytics_events`))) ||
    (await as('authenticated', U, async () => (await db.query(`SELECT count(*)::int n FROM analytics_events`)).rows[0].n)) === 0);
  check('admin summary forbidden for users', (await rpc(U, `SELECT admin_analytics_summary(30) r`)).code === 'forbidden');
  const sum = await rpc(A, `SELECT admin_analytics_summary(30) r`);
  check('admin summary: learning + retention + ads + AI + coins', sum.success && sum.learning.lesson_completions > 0 && sum.ai.requests >= 10 &&
    sum.ads.rewarded_by_purpose.solution === 1 && typeof sum.coins.balance_distribution === 'object' && Array.isArray(sum.dau), JSON.stringify(sum.learning));

  // ===== صلاحيات الدوال =====
  console.log('\n== grants');
  for (const f of ['progress_complete_lesson(text, integer)', 'challenge_reveal_solution(text)', 'ai_buy_pack()', 'streak_freeze_buy()']) {
    check(`anon cannot execute ${f}`, (await one(`SELECT has_function_privilege('anon', 'public.${f}', 'EXECUTE') r`)).r === false);
  }
  for (const f of ['record_challenge_submission(uuid, text, integer, integer, boolean, text)', 'coins_credit_ad_ssv(uuid, uuid, text)', 'challenge_solution_unlocked(uuid, text)', 'ai_quota_reserve(uuid)']) {
    check(`authenticated cannot execute ${f.split('(')[0]}`, (await one(`SELECT has_function_privilege('authenticated', 'public.${f}', 'EXECUTE') r`)).r === false);
  }

  console.log(`\n${pass}/${pass + fail} passed`);
  if (fail) process.exitCode = 1;
})().catch((e) => {
  console.error('FAIL setup/run error:', e?.message ?? e);
  process.exitCode = 1;
});

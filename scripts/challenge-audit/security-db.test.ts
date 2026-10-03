/**
 * اختبار أمان XP وقفل التحديات على قاعدة PostgreSQL حقيقية محلياً (PGlite):
 *   مخطط الإنتاج (بنية فقط من النسخة الاحتياطية، بلا بيانات مستخدمين)
 *   + الـmigrations غير المطبّقة بالترتيب نفسه الذي سيطبّقه `supabase db push`
 *   + منطق verify-challenge الحقيقي (core.ts) موصولاً بهذه القاعدة.
 * لا يتصل بأي Supabase. التشغيل:
 *   npx tsx scripts/challenge-audit/security-db.test.ts
 * يحتاج @electric-sql/pglite مثبتاً في PGLITE_DIR (الافتراضي: %TEMP%/kxtools)،
 * ومسار المخطط في KODAX_PROD_SCHEMA (الافتراضي: النسخة الاحتياطية في kodax-backups).
 */
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { handleVerify, type VerifyDeps } from '../../supabase/functions/verify-challenge/core';
import { CHALLENGE_SPECS } from '../../supabase/functions/verify-challenge/challenges.generated';
import { ALL_CHALLENGES, getChallengeAccessType, getChallengeRequiredCourseId } from '../../src/constants/courseData';

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

const U = '11111111-1111-1111-1111-111111111111'; // مستخدم عادي
const V = '22222222-2222-2222-2222-222222222222'; // مستخدم لديه تقدم قديم قبل الـmigration
const A = '33333333-3333-3333-3333-333333333333'; // مشرف
const W = '44444444-4444-4444-4444-444444444444'; // مستخدم جديد بلا ملف شخصي
const D = '55555555-5555-5555-5555-555555555555'; // اختبار الحد اليومي

(async () => {
  const { PGlite } = await import(pathToFileURL(join(PGLITE_DIR, 'node_modules/@electric-sql/pglite/dist/index.js')).href);
  const { uuid_ossp } = await import(pathToFileURL(join(PGLITE_DIR, 'node_modules/@electric-sql/pglite/dist/contrib/uuid_ossp.js')).href);
  const db: any = new PGlite({ extensions: { uuid_ossp } });

  // ---- بيئة Supabase المصغّرة ----
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

  // بيانات الإعداد نفسها التي أدخلتها migration الكوينات في الإنتاج (أسعار الدورات وإعدادات المكافآت)
  const coins = read(MIG('20260930000000_free_coins_system'));
  await db.exec(coins.match(/INSERT INTO coin_config[\s\S]*?;\n/)![0]);
  await db.exec(coins.match(/INSERT INTO course_coin_catalog \(course_id[\s\S]*?;\n/)![0]);
  await db.exec(coins.match(/UPDATE course_coin_catalog\r?\nSET suggested_cost[\s\S]*?difficulty <> 'beginner';/)![0]);
  const priced = (await db.query(`SELECT count(*) FILTER (WHERE unlock_cost > 0)::int paid, count(*)::int n FROM course_coin_catalog`)).rows[0] as any;
  console.log(`— course prices seeded: ${priced.paid}/${priced.n} paid`);

  // مستخدمون
  for (const id of [U, V, A, D]) {
    await db.query(`INSERT INTO auth.users (id) VALUES ($1)`, [id]);
    await db.query(`INSERT INTO profiles (id, username, xp, level) VALUES ($1, $2, 0, 1)`, [id, 'u' + id.slice(0, 4)]);
  }
  await db.query(`INSERT INTO auth.users (id) VALUES ($1)`, [W]);
  await db.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')`, [A]);

  // الـmigrations الأولى، ثم تقدم قديم (كتبه التطبيق القديم) قبل migration الـXP
  for (const m of ['20261001010000_server_verified_challenges', '20261001020000_curriculum_lesson_catalog', '20261002000000_protect_profile_columns']) {
    await db.exec(read(MIG(m)));
  }
  await db.query(`UPDATE profiles SET xp = 500 WHERE id = $1`, [V]); // XP حصل عليه سابقاً
  await db.query(`INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed, xp_earned) VALUES ($1, 'html-1', 'web-html-basics', true, 100)`, [V]);
  for (const m of ['20261002010000_server_side_xp', '20261002020000_challenge_access', '20261002030000_ai_assistant',
                   '20261003000000_progression_catalog', '20261003010000_progression_economy', '20261003020000_challenge_solutions', '20261003030000_challenge_expansion']) {
    await db.exec(read(MIG(m)));
    await db.exec(read(MIG(m))); // قابلة للتكرار
  }
  console.log('— production schema + 5 pending migrations applied (twice for the new ones)\n');

  // ---- أدوات ----
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
  const one = async (sql: string, p: unknown[] = []) => (await db.query(sql, p)).rows[0] as any;
  const xpOf = async (id: string) => (await one(`SELECT xp, level FROM profiles WHERE id = $1`, [id])) as { xp: number; level: number };
  const balance = async (id: string) => (await one(`SELECT COALESCE((SELECT total_points FROM user_points WHERE user_id = $1), 0) b`, [id])).b as number;
  const lessonXp = async (id: string) => (await one(`SELECT xp FROM lesson_catalog WHERE lesson_id = $1`, [id])).xp as number;
  const fails = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      return false;
    } catch {
      return true;
    }
  };
  // نفس طلب التطبيق عند إكمال درس (hybridSyncService.saveLessonComplete)
  const saveLesson = (uid: string, lessonId: string, courseId: string, clientXp = 9999) =>
    as('authenticated', uid, () =>
      db.query(
        `INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed, xp_earned, completed_at, updated_at)
         VALUES ($1, $2, $3, true, $4, now(), now())
         ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = EXCLUDED.completed, course_id = EXCLUDED.course_id,
           xp_earned = EXCLUDED.xp_earned, completed_at = EXCLUDED.completed_at, updated_at = EXCLUDED.updated_at`,
        [uid, lessonId, courseId, clientXp]
      )
    );

  // =====================================================================
  // 1) XP
  // =====================================================================
  console.log('== XP');
  // XP للإكمال الموثّق فقط (progress_complete_lesson). ما يكتبه العميل يُحفظ غير موثّق بلا XP.
  await db.exec(`UPDATE coin_config SET value = jsonb_set(value, '{min_seconds_between_lessons}', '0') WHERE key = 'progression'`);
  const quizOf = async (l: string) => (await one(`SELECT quiz_correct q FROM lesson_catalog WHERE lesson_id = $1`, [l])).q;
  const serverComplete = async (uid: string, l: string) => {
    const answer = await quizOf(l);
    return as('authenticated', uid, async () => ((await db.query(`SELECT progress_complete_lesson($1, $2) r`, [l, answer])).rows[0] as any).r);
  };
  const html1 = await lessonXp('html-1');
  await saveLesson(U, 'html-1', 'web-html-basics');
  check('client-written completion grants no XP (unverified)', (await xpOf(U)).xp === 0, `xp=${(await xpOf(U)).xp}`);
  await serverComplete(U, 'html-1');
  check('verified completion grants catalog XP (client-sent 9999 ignored)', (await xpOf(U)).xp === html1, `xp=${(await xpOf(U)).xp} catalog=${html1}`);

  await saveLesson(U, 'html-1', 'web-html-basics');
  await serverComplete(U, 'html-1');
  check('re-sending the same lesson completion grants nothing', (await xpOf(U)).xp === html1);

  await as('authenticated', U, () => db.query(`DELETE FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = 'html-1'`, [U]));
  await serverComplete(U, 'html-1');
  check('delete (blocked for verified rows) + re-complete grants nothing', (await xpOf(U)).xp === html1);

  await as('authenticated', U, () => db.query(`UPDATE user_lesson_progress SET completed = false WHERE user_id = $1 AND lesson_id = 'html-1'`, [U]));
  await as('authenticated', U, () => db.query(`UPDATE user_lesson_progress SET completed = true WHERE user_id = $1 AND lesson_id = 'html-1'`, [U]));
  check('toggling completed off/on grants nothing', (await xpOf(U)).xp === html1);

  for (let i = 0; i < 50; i++) await as('authenticated', U, () => db.query(`SELECT update_user_xp($1, 350)`, [U]));
  check('update_user_xp x50 (350 each) changes nothing', (await xpOf(U)).xp === html1);
  check('update_user_xp for another user is rejected', await fails(() => as('authenticated', U, () => db.query(`SELECT update_user_xp($1, 10)`, [V]))));

  await as('authenticated', U, () => db.query(`UPDATE profiles SET xp = 999999, level = 99, username = 'renamed' WHERE id = $1`, [U]));
  const afterDirect = await xpOf(U);
  check('direct profiles.xp/level update ignored', afterDirect.xp === html1 && afterDirect.level !== 99);
  check('normal profile edits still work', (await one(`SELECT username FROM profiles WHERE id = $1`, [U])).username === 'renamed');

  await as('authenticated', W, () => db.query(`INSERT INTO profiles (id, username, xp, level) VALUES ($1, 'w', 1000000, 50)`, [W]));
  const w = await xpOf(W);
  check('signup profile insert cannot set xp/level', w.xp === 0 && w.level === 1, JSON.stringify(w));

  check('award_xp not callable by clients', await fails(() => as('authenticated', U, () => db.query(`SELECT award_xp($1, 1000)`, [U]))));
  check('_xp_award not callable by clients', await fails(() => as('authenticated', U, () => db.query(`SELECT _xp_award($1, 'lesson', 'x', 1000)`, [U]))));
  check('xp_awards not writable by clients', await fails(() => as('authenticated', U, () => db.query(`INSERT INTO xp_awards (user_id, source, ref_id, amount) VALUES ($1, 'lesson', 'zz', 1)`, [U]))));

  const before = (await xpOf(U)).xp;
  await saveLesson(U, 'made-up-lesson', 'web-html-basics');
  check('unknown lesson id: progress saved, no XP', (await xpOf(U)).xp === before);

  // دورة مدفوعة مقفولة: الدرس الأول معاينة مجانية (كما في التطبيق)، والباقي بلا XP حتى الفتح
  const pyds = (await db.query(`SELECT lesson_id, xp FROM lesson_catalog WHERE course_id = 'py-data-structures' ORDER BY position`)).rows as any[];
  // دورة لم يصلها المستخدم بالتعلم: الدرس الأول معاينة، والباقي مقفول حتى المتطلب (أو الفتح المبكر بالكوينات)
  let x0 = (await xpOf(U)).xp;
  await serverComplete(U, pyds[0].lesson_id);
  check('locked course preview lesson grants XP', (await xpOf(U)).xp === x0 + pyds[0].xp);
  x0 = (await xpOf(U)).xp;
  const lockedTry = await serverComplete(U, pyds[1].lesson_id);
  check('locked course lesson: course_locked, no XP', lockedTry.code === 'course_locked' && (await xpOf(U)).xp === x0);
  await db.query(`INSERT INTO user_unlocked_courses (user_id, course_id) VALUES ($1, 'py-data-structures')`, [U]);
  await serverComplete(U, pyds[1].lesson_id);
  check('after early unlock: lesson XP granted', (await xpOf(U)).xp === x0 + pyds[1].xp);

  await saveLesson(V, 'html-1', 'web-html-basics');
  await serverComplete(V, 'html-1');
  check('legacy completion (before migration) does not grant XP again', (await xpOf(V)).xp === 500);
  const htmlLessons = (await db.query(`SELECT lesson_id FROM lesson_catalog WHERE course_id = 'web-html-basics' ORDER BY position`)).rows.map((r: any) => r.lesson_id);
  await serverComplete(V, htmlLessons[1]);
  check('legacy user: next lesson grants XP normally', (await xpOf(V)).xp === 500 + (await lessonXp(htmlLessons[1])));

  // مكافأة إكمال الدورة (كوينات) لا تزال تعمل — تُمنح تلقائياً عند آخر درس موثّق
  for (const l of htmlLessons) await serverComplete(U, l);
  const sumHtml = (await one(`SELECT SUM(xp)::int s FROM lesson_catalog WHERE course_id = 'web-html-basics'`)).s;
  const htmlAwarded = (await one(`SELECT SUM(amount)::int s FROM xp_awards a JOIN lesson_catalog lc ON lc.lesson_id = a.ref_id WHERE a.user_id = $1 AND lc.course_id = 'web-html-basics'`, [U])).s;
  check('full course: XP equals the catalog total, once', htmlAwarded === sumHtml, `${htmlAwarded}/${sumHtml}`);
  const b0 = await balance(U);
  const r1 = (await as('authenticated', U, () => db.query(`SELECT coins_reward_course_completion('web-html-basics') r`))).rows[0] as any;
  const r2 = (await as('authenticated', U, () => db.query(`SELECT coins_reward_course_completion('web-html-basics') r`))).rows[0] as any;
  check('course completion reward still works (granted once on the last verified lesson)',
    r1.r.success === true && (await one(`SELECT count(*)::int n FROM point_transactions WHERE user_id = $1 AND source = 'course_complete'`, [U])).n === 1 && (await balance(U)) >= b0,
    JSON.stringify(r1.r));
  check('course completion reward not granted twice', r2.r.duplicate === true || r2.r.delta === 0 || (await balance(U)) === b0 + r1.r.reward);

  // =====================================================================
  // 2) قفل التحديات على السيرفر (verify-challenge الحقيقي + القاعدة)
  // =====================================================================
  console.log('\n== Challenge access');
  const catalog = new Map(((await db.query(`SELECT id, required_course_id FROM challenge_catalog`)).rows as any[]).map((r) => [r.id, r.required_course_id]));
  const mismatches = ALL_CHALLENGES.filter((c) => {
    const expected = getChallengeAccessType(c) === 'course-required' ? getChallengeRequiredCourseId(c) ?? null : null;
    return catalog.get(c.id) !== expected;
  });
  check('server lock map matches the app for all challenges', catalog.size === ALL_CHALLENGES.length && mismatches.length === 0, `${catalog.size} challenges, ${mismatches.length} mismatches`);

  const tokenToUser = (t: string) => (t.startsWith('tok:') ? t.slice(4) : null);
  const deps: VerifyDeps = {
    specs: CHALLENGE_SPECS,
    getUserId: async (t) => tokenToUser(t),
    checkAccess: async (uid, id) =>
      (await as('service_role', null, () => db.query(`SELECT challenge_access_check($1, $2) r`, [uid, id]))).rows[0].r as any,
    countRecentSubmissions: async (uid, since) =>
      (await as('service_role', null, () => db.query(`SELECT count(*)::int n FROM challenge_submissions WHERE user_id = $1 AND created_at >= $2`, [uid, since]))).rows[0].n as number,
    recordSubmission: async (a) =>
      (await as('service_role', null, () =>
        db.query(`SELECT record_challenge_submission($1, $2, $3, $4, $5, $6) r`, [a.userId, a.challengeId, a.passedTests, a.totalTests, a.allPassed, a.codeSha256])
      )).rows[0].r as any,
    rewardCoins: async (t, id, diff) =>
      (await as('authenticated', tokenToUser(t), () => db.query(`SELECT coins_reward_challenge($1, $2) r`, [id, diff]))).rows[0].r as any,
  };
  const passAll = async () => ({ allPassed: true, results: [], totalTests: 1, passedTests: 1 });
  const sol = (id: string) => ALL_CHALLENGES.find((c) => c.id === id)!.solution as string;
  const free = ALL_CHALLENGES.filter((c) => catalog.get(c.id) === null).map((c) => c.id);
  const lockedPy = ALL_CHALLENGES.find((c) => catalog.get(c.id) === 'py-data-structures' && c.language?.toLowerCase() === 'python')!.id;
  const lockedOther = ALL_CHALLENGES.find((c) => catalog.get(c.id) === 'cyber-network')!.id;
  const counts = async (uid: string, id: string) => ({
    subs: (await one(`SELECT count(*)::int n FROM challenge_submissions WHERE user_id = $1 AND challenge_id = $2`, [uid, id])).n,
    done: (await one(`SELECT count(*)::int n FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2 AND completed`, [uid, id])).n,
  });

  // مستخدم لم يفتح cyber-network: حل صحيح مباشرة عبر الدالة
  {
    const x = (await xpOf(V)).xp;
    const b = await balance(V);
    const r = await handleVerify({ ...deps, validate: passAll }, 'tok:' + V, { challengeId: lockedOther, code: 'x' });
    const c = await counts(V, lockedOther);
    check(`locked challenge via verify-challenge → 403 (${lockedOther})`, r.status === 403 && r.body.error === 'challenge_locked');
    check('locked: no submission, no completion, no XP, no coins', c.subs === 0 && c.done === 0 && (await xpOf(V)).xp === x && (await balance(V)) === b);
  }
  // تجاوز الدالة واستدعاء دوال القاعدة مباشرة
  {
    const r = (await as('service_role', null, () => db.query(`SELECT record_challenge_submission($1, $2, 1, 1, true, 'h') r`, [V, lockedOther]))).rows[0].r as any;
    check('record_challenge_submission refuses a locked challenge', r.locked === true && r.recorded === false && (await counts(V, lockedOther)).done === 0);
    check('clients cannot call record_challenge_submission', await fails(() => as('authenticated', V, () => db.query(`SELECT record_challenge_submission($1, $2, 1, 1, true, 'h')`, [V, lockedOther]))));
    check('clients cannot call challenge_access_check', await fails(() => as('authenticated', V, () => db.query(`SELECT challenge_access_check($1, $2)`, [V, lockedOther]))));
    check('clients cannot write challenge completion rows (RLS)', await fails(() => as('authenticated', V, () => db.query(`INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed) VALUES ($1, $2, 'challenges', true)`, [V, lockedOther]))));
    // صف إكمال قديم مزوّر (من قبل RLS) لتحدٍ مقفول: لا كوينات
    await db.query(`INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed) VALUES ($1, $2, 'challenges', true)`, [V, lockedOther]);
    const c = (await as('authenticated', V, () => db.query(`SELECT coins_reward_challenge($1, 'easy') r`, [lockedOther]))).rows[0].r as any;
    check('coins_reward_challenge refuses a locked challenge (even with a legacy completion row)', c.success === false && c.code === 'locked');
  }
  // مستخدم فتح الدورة: حل حقيقي (يُشغَّل الكود فعلاً) ينجح بشكل طبيعي
  {
    const x = (await xpOf(U)).xp;
    const b = await balance(U);
    const r = await handleVerify(deps, 'tok:' + U, { challengeId: lockedPy, code: sol(lockedPy) });
    const body = r.body as any;
    check(`unlocked user solves ${lockedPy} (real execution)`, r.status === 200 && body.verified === true, `${body.passedTests}/${body.totalTests} ${body.error ?? ''}`);
    const pts = CHALLENGE_SPECS[lockedPy].points;
    check('first completion: XP = challenge points, coins granted', body.completion?.xpAwarded === pts && (await xpOf(U)).xp === x + pts && body.coins?.success === true && (await balance(U)) > b);
    const b1 = await balance(U);
    const again = (await handleVerify(deps, 'tok:' + U, { challengeId: lockedPy, code: sol(lockedPy) })).body as any;
    check('re-submitting the same solution: no XP, no coins', again.completion.xpAwarded === 0 && again.coins === null && (await xpOf(U)).xp === x + pts && (await balance(U)) === b1);
    const direct = (await as('authenticated', U, () => db.query(`SELECT coins_reward_challenge($1, 'hard') r`, [lockedPy]))).rows[0].r as any;
    check('calling coins_reward_challenge again directly: no extra coins', (await balance(U)) === b1, JSON.stringify(direct));
  }
  // التحديات المجانية: بلا فتح أي دورة (حل حقيقي)
  {
    const id = free.find((c) => c === 'py-ch-beg-1') ?? free[0];
    const r = await handleVerify(deps, 'tok:' + V, { challengeId: id, code: sol(id) });
    check(`free challenge works without unlocking (${id}, real execution)`, r.status === 200 && (r.body as any).verified === true && (r.body as any).completion.firstTime === true);
  }
  // المشرف، ودورة صار سعرها 0
  {
    const r = await handleVerify({ ...deps, validate: passAll }, 'tok:' + A, { challengeId: lockedOther, code: 'x' });
    check('admin can submit a locked challenge', r.status === 200 && (r.body as any).verified === true);
    const flutterLocked = ALL_CHALLENGES.find((c) => catalog.get(c.id) === 'flutter-advanced')!.id;
    let s = (await handleVerify({ ...deps, validate: passAll }, 'tok:' + D, { challengeId: flutterLocked, code: 'x' })).status;
    check('paid course challenge locked for a new user', s === 403);
    // التحديات تُفتح بالتقدم في الدورة (المتطلب)، لا بالسعر
    await db.query(`UPDATE course_coin_catalog SET unlock_cost = 0 WHERE course_id = 'flutter-advanced'`);
    s = (await handleVerify({ ...deps, validate: passAll }, 'tok:' + D, { challengeId: flutterLocked, code: 'x' })).status;
    check('price alone does not open a course (progression does)', s === 403);
    await db.exec(`UPDATE coin_config SET value = jsonb_set(value, '{prereq_ratio}', '0') WHERE key = 'progression'`);
    s = (await handleVerify({ ...deps, validate: passAll }, 'tok:' + D, { challengeId: flutterLocked, code: 'x' })).status;
    check('progression requirement met → its challenges open', s === 200);
    await db.exec(`UPDATE coin_config SET value = jsonb_set(value, '{prereq_ratio}', '0.7') WHERE key = 'progression'`);
    await db.query(`DELETE FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2`, [D, flutterLocked]);
    await db.query(`DELETE FROM point_transactions WHERE user_id = $1`, [D]);
    await db.query(`UPDATE user_points SET total_points = 0, earned_points = 0 WHERE user_id = $1`, [D]);
  }
  // الحد اليومي لكوينات التحديات (60) ما زال يعمل
  {
    const cap = 60;
    let earned = 0;
    let capped: any = null;
    let solved = 0;
    for (const id of free) {
      const r = (await handleVerify({ ...deps, validate: passAll }, 'tok:' + D, { challengeId: id, code: 'x' })).body as any;
      if (r.completion?.firstTime) solved++;
      if (r.coins?.success) earned += r.coins.reward;
      else if (r.coins?.code === 'daily_cap') {
        capped = r;
        break;
      }
    }
    check('daily cap: coins stop at 60 per day', earned === cap && capped?.coins?.code === 'daily_cap', `earned=${earned} after ${solved} challenges`);
    check('daily cap: XP still granted for the capped challenge', capped?.completion?.xpAwarded > 0);
  }

  console.log(`\n${pass}/${pass + fail} passed`);
  if (fail) process.exitCode = 1;
})().catch((e) => {
  console.error('FAIL setup/run error:', e?.message ?? e);
  process.exitCode = 1;
});

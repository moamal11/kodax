// اختبار migration كتالوج الدروس على PostgreSQL (PGlite) مع مخطط وهمي مبسّط.
// يحتاج @electric-sql/pglite: انسخ الملف إلى %TEMP%/kxtools (حيث ثُبّتت الحزمة) وشغّله هناك:
// node test-migration.mjs <مسار ملف الـ migration>
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
const db = new PGlite();
const U1 = '11111111-1111-1111-1111-111111111111', U2 = '22222222-2222-2222-2222-222222222222', U3 = '33333333-3333-3333-3333-333333333333';
const fails = [];
const check = (ok, msg) => { console.log((ok ? 'OK   ' : 'FAIL ') + msg); if (!ok) fails.push(msg); };
await db.exec(`
CREATE ROLE anon; CREATE ROLE authenticated;
CREATE SCHEMA auth; CREATE TABLE auth.cur (uid uuid);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT uid FROM auth.cur LIMIT 1 $$;
CREATE FUNCTION is_admin() RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
CREATE FUNCTION _coins_restricted(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
CREATE FUNCTION _coin_cfg(text) RETURNS jsonb LANGUAGE sql AS $$ SELECT '{"beginner":30}'::jsonb $$;
CREATE FUNCTION _coins_apply(uuid,int,text,text,text,text) RETURNS jsonb LANGUAGE sql AS $$ SELECT jsonb_build_object('success',true) $$;
CREATE TABLE user_unlocked_courses (user_id uuid, course_id text);
CREATE TABLE course_coin_catalog (course_id text primary key, field_id text, title text, difficulty text, total_lessons int, has_project boolean default false, demand_factor numeric default 1, unlock_cost int default 0, suggested_cost int, is_active boolean default true);
CREATE FUNCTION coins_suggest_price(text,int,boolean,numeric) RETURNS int LANGUAGE sql AS $$ SELECT 0 $$;
CREATE TABLE user_lesson_progress (id uuid default gen_random_uuid() primary key, user_id uuid, lesson_id text not null, course_id text not null, completed boolean default false, updated_at timestamptz default now(), unique(user_id, lesson_id));
INSERT INTO course_coin_catalog (course_id, field_id, title, difficulty, total_lessons) VALUES
 ('cpp-oop','cpp','OOP','beginner',12),('cpp-advanced','cpp','adv','beginner',10),('web-js-basics','web','js','beginner',13),('web-html-basics','web','html','beginner',12);
INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed) VALUES
 ('${U1}','cpp-adv-4','cpp-advanced',true),
 ('${U2}','cpp-adv-4','cpp-oop',true),
 ('${U1}','js-adv-1','web-js-advanced',true),
 ('${U1}','fake-lesson-1','web-html-basics',true),
 ('${U1}','ch-1','challenges',true),
 ('${U3}','cpp-adv-4','cpp-advanced',true),
 ('${U3}','cpp-advanced-stl-containers','cpp-advanced',false);
UPDATE course_coin_catalog SET unlock_cost = 77;
`);
const before = (await db.query(`SELECT count(*)::int n FROM user_lesson_progress`)).rows[0].n;
const sql = readFileSync(process.argv[2], 'utf8');
await db.exec(sql);
await db.exec(sql); // idempotent
const p = await db.query(`SELECT user_id::text, lesson_id, course_id FROM user_lesson_progress ORDER BY lesson_id`);
console.log(p.rows);
const row = (u, l) => p.rows.find(r => r.user_id === u && r.lesson_id === l);
check(p.rows.length === before, `no progress rows lost (${before} -> ${p.rows.length})`);
check(row(U1,'cpp-advanced-stl-containers')?.course_id === 'cpp-advanced' && !row(U1,'cpp-adv-4'), 'U1 cpp-adv-4 remapped to cpp-advanced-stl-containers');
check(row(U2,'cpp-adv-4')?.course_id === 'cpp-oop', 'U2 cpp-adv-4 (cpp-oop) untouched');
check(row(U3,'cpp-adv-4')?.course_id === 'cpp-advanced', 'U3 conflict: old cpp-adv-4 row kept in cpp-advanced (no false cpp-oop credit)');
check(row(U3,'cpp-advanced-stl-containers')?.course_id === 'cpp-advanced', 'U3 existing new-lesson row untouched');
check(row(U1,'js-adv-1')?.course_id === 'web-js-basics', 'moved lesson course_id realigned');
check(row(U1,'ch-1')?.course_id === 'challenges', 'challenge progress untouched');
check(row(U1,'fake-lesson-1')?.course_id === 'web-html-basics', 'unknown lesson row kept (not deleted)');
const c = await db.query(`SELECT course_id, total_lessons FROM course_coin_catalog ORDER BY 1`);
console.log(c.rows);
check((await db.query(`SELECT count(*)::int n FROM course_coin_catalog WHERE unlock_cost <> 77`)).rows[0].n === 0, 'unlock_cost (prices) unchanged');
check((await db.query(`SELECT count(*)::int n FROM lesson_catalog`)).rows[0].n === 344, 'lesson_catalog has 344 rows');
// complete all html lessons for U1 except one, then test reward
await db.exec(`INSERT INTO auth.cur VALUES ('${U1}'); INSERT INTO user_unlocked_courses VALUES ('${U1}','web-html-basics');`);
const html = (await db.query(`SELECT lesson_id FROM lesson_catalog WHERE course_id='web-html-basics' ORDER BY position`)).rows.map(r=>r.lesson_id);
for (const id of html.slice(0,-1)) await db.query(`INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed) VALUES ($1,$2,'web-html-basics',true)`, [U1, id]);
const r1 = (await db.query(`SELECT coins_reward_course_completion('web-html-basics') r`)).rows[0].r;
console.log('11/12 + fake:', r1);
check(r1?.success !== true, '11/12 real + 1 fake lesson -> no reward');
await db.query(`INSERT INTO user_lesson_progress (user_id, lesson_id, course_id, completed) VALUES ($1,$2,'web-html-basics',true)`, [U1, html.at(-1)]);
const r2 = (await db.query(`SELECT coins_reward_course_completion('web-html-basics') r`)).rows[0].r;
console.log('12/12:', r2);
check(r2?.success === true, '12/12 real lessons -> reward');
console.log(fails.length ? `${fails.length} FAILED` : 'ALL CHECKS PASSED');
process.exit(fails.length ? 1 : 0);

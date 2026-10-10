/**
 * بيانات تجريبية خيالية للـbackend المحلي (scripts/dev/local-backend.ts). لا علاقة لها بمستخدمين حقيقيين.
 * التقدم والـXP والكوينات تُنشأ عبر دوال السيرفر الحقيقية (progress_complete_lesson،
 * record_challenge_submission، coins_reward_challenge...) حتى تطابق قواعد الإنتاج.
 *
 * الحسابات (كلمة المرور نفسها للجميع، محلية فقط):
 *   qa@kodax.local     — مستخدم متوسط التقدم (الحساب الأساسي للفحص)
 *   long@kodax.local   — اسم طويل جداً + XP كبير (اختبار القص)
 *   new@kodax.local    — حساب جديد بلا أي نشاط (الحالات الفارغة)
 *   + 4 أعضاء مجتمع بأكواد وتعليقات ومتابعات
 */
import type { TestEnv } from '../challenge-audit/_pglite-env';

export const SEED_PASSWORD = 'kodax-local-123';

type Acc = { id: string; email: string; meta: Record<string, unknown> };
const U = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const PEOPLE = [
  { n: 1, email: 'qa@kodax.local', username: 'sara_k', full: 'سارة الكبيسي', province: 'بغداد', gender: 'female' },
  { n: 2, email: 'long@kodax.local', username: 'abdulrahman_alhusseini_baghdadi', full: 'عبد الرحمن بن محمد الحسيني البغدادي الكرخي', province: 'نينوى', gender: 'male' },
  { n: 3, email: 'new@kodax.local', username: 'new_learner', full: 'متعلم جديد', province: 'البصرة', gender: 'male' },
  { n: 4, email: 'laith@kodax.local', username: 'laith_dev', full: 'ليث العبيدي', province: 'بغداد', gender: 'male' },
  { n: 5, email: 'noor@kodax.local', username: 'noor_codes', full: 'نور الهدى', province: 'أربيل', gender: 'female' },
  { n: 6, email: 'ahmed@kodax.local', username: 'ahmed_k', full: 'Ahmed Karim', province: 'النجف', gender: 'male' },
  { n: 7, email: 'zainab@kodax.local', username: 'zainab_ali', full: 'زينب علي', province: 'كربلاء', gender: 'female' },
  // قريب من حد المستوى 2 (400 XP): الدرس التالي يعبر المستوى — لاختبار احتفال المستوى
  { n: 8, email: 'levelup@kodax.local', username: 'hasan_m', full: 'حسن مهدي', province: 'ديالى', gender: 'male' },
];

export async function seed(env: TestEnv, _sign: (p: Record<string, unknown>) => string): Promise<Acc[]> {
  const { q, as } = env;
  const one = async (sql: string, p: unknown[] = []) => (await q(sql, p)).rows[0];
  const asUser = <T>(uid: string, sql: string, p: unknown[] = []) => as('authenticated', uid, async () => (await q(sql, p)).rows[0] as T);
  const asSvc = <T>(sql: string, p: unknown[] = []) => as('service_role', null, async () => (await q(sql, p)).rows[0] as T);

  // ---------- الحسابات ----------
  for (const p of PEOPLE) {
    const id = U(p.n);
    await q(`INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, email_confirmed_at) VALUES ($1, $2, $3, now() - interval '40 days', now())`, [
      id,
      p.email,
      JSON.stringify({ full_name: p.full, username: p.username }),
    ]);
    await q(
      `INSERT INTO profiles (id, username, full_name, province, gender, created_at, last_login) VALUES ($1, $2, $3, $4, $5, now() - interval '40 days', now())
       ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, full_name = EXCLUDED.full_name, province = EXCLUDED.province, gender = EXCLUDED.gender`,
      [id, p.username, p.full, p.province, p.gender]
    );
  }
  await q(`UPDATE profiles SET is_verified = true, verified_at = now() WHERE id = $1`, [U(4)]);

  // ---------- التقدم عبر دوال السيرفر ----------
  // الفاصل الأدنى بين الدروس يُلغى أثناء التهيئة فقط ثم يُعاد كما هو
  const cfg = await one(`SELECT value FROM coin_config WHERE key = 'progression'`);
  await q(`UPDATE coin_config SET value = jsonb_set(value, '{min_seconds_between_lessons}', '0') WHERE key = 'progression'`);
  const lessons = async (course: string, n: number) =>
    (await q(`SELECT lesson_id, quiz_correct FROM lesson_catalog WHERE course_id = $1 ORDER BY position LIMIT $2`, [course, n])).rows as { lesson_id: string; quiz_correct: number | null }[];
  const complete = async (uid: string, course: string, n: number) => {
    for (const l of await lessons(course, n)) {
      const r: any = await asUser(uid, `SELECT progress_complete_lesson($1, $2) r`, [l.lesson_id, l.quiz_correct]);
      if (!r.r?.success) console.warn('[seed] lesson', l.lesson_id, r.r?.code);
    }
  };
  const py = 'py-basics';

  await complete(U(1), py, 6);
  // الاسم الطويل: تقدم كبير (دورة كاملة + دروس من دورات أخرى)
  await complete(U(2), py, 40);
  await complete(U(2), 'py-data-structures', 11);
  await complete(U(2), 'web-html-basics', 12);
  await complete(U(2), 'web-js-basics', 9);
  await complete(U(4), py, 14);
  await complete(U(5), py, 9);
  await complete(U(6), py, 3);
  await complete(U(7), py, 11);
  // حسن: يتوقف قبل أن يعبر 400 XP مباشرة
  for (const l of await lessons(py, 20)) {
    const xp = (await one(`SELECT xp FROM profiles WHERE id = $1`, [U(8)])).xp as number;
    const next = (await one(`SELECT xp FROM lesson_catalog WHERE lesson_id = $1`, [l.lesson_id])).xp as number;
    if (xp + next >= 400) break;
    await asUser(U(8), `SELECT progress_complete_lesson($1, $2) r`, [l.lesson_id, l.quiz_correct]);
  }
  await q(`UPDATE coin_config SET value = $1 WHERE key = 'progression'`, [cfg.value]);

  // تحديات محلولة (تسجيل السيرفر + مكافأة الكوينات كما في verify-challenge)
  const challenges = (await q(`SELECT id AS challenge_id, difficulty FROM challenge_catalog WHERE required_course_id IS NULL ORDER BY id LIMIT 6`)).rows as any[];
  const solve = async (uid: string, k: number) => {
    for (const c of challenges.slice(0, k)) {
      await asSvc(`SELECT record_challenge_submission($1, $2, 3, 3, true, 'seed') r`, [uid, c.challenge_id]).catch((e) => console.warn('[seed] challenge', e.message));
      await asUser(uid, `SELECT coins_reward_challenge($1, $2) r`, [c.challenge_id, c.difficulty ?? 'easy']).catch(() => undefined);
    }
  };
  await solve(U(1), 3);
  await solve(U(2), 6);
  await solve(U(4), 4);

  // سلسلة أيام سابقة (النشاط اليوم سُجّل من الدوال أعلاه)
  for (const [uid, days] of [[U(1), 4], [U(2), 23], [U(4), 9]] as const) {
    for (let d = 1; d < days; d++) await q(`INSERT INTO user_activity_days (user_id, day, lessons, challenges_solved) VALUES ($1, (now() AT TIME ZONE 'Asia/Baghdad')::date - $2::int, 1, 0) ON CONFLICT DO NOTHING`, [uid, d]).catch((e) => console.warn('[seed] activity', e.message));
    await q(`UPDATE user_streaks SET current_streak = $2, best_streak = GREATEST(best_streak, $2), last_active_day = (now() AT TIME ZONE 'Asia/Baghdad')::date WHERE user_id = $1`, [uid, days]).catch((e) => console.warn('[seed] streak', e.message));
    await q(`UPDATE profiles SET streak_days = $2 WHERE id = $1`, [uid, days]);
  }
  await asUser(U(1), `SELECT coins_claim_daily_reward() r`).catch(() => undefined);

  // Explicit certificate fixtures for UI review only (not earned by these seed accounts).
  await q(`INSERT INTO certificates (id, user_id, course_id, level, status, security_hash, user_full_name, course_title, course_title_ar, achievement_snapshot)
    VALUES ('00000000-0000-4000-8000-000000000101', $1, 'python', 'silver', 'valid', 'local-fixture-not-a-production-certificate', 'سارة الكبيسي', 'Python', 'مسار بايثون',
      '{"lessons_percent":50,"challenges_percent":25,"total_lessons":80,"completed_lessons":40,"total_challenges":40,"completed_challenges":10}'::jsonb),
      ('00000000-0000-4000-8000-000000000102', $1, 'web-dev', 'silver', 'revoked', 'local-revoked-fixture', 'سارة الكبيسي', 'Web development', 'تطوير الويب', '{}'::jsonb)`, [U(1)]);

  // ---------- المجتمع ----------
  const snip = async (uid: string, title: string, desc: string, language: string, code: string, daysAgo: number) =>
    (await one(`INSERT INTO code_snippets (user_id, title, description, code, language, is_public, created_at) VALUES ($1, $2, $3, $4, $5, true, now() - make_interval(days => $6)) RETURNING id`, [uid, title, desc, code, language, daysAgo])).id as string;
  const s1 = await snip(U(4), 'حاسبة المعدل الفصلي', 'تحسب معدل الطالب من درجات المواد وتطبع التقدير.', 'python',
    `def grade(avg):\n    if avg >= 90:\n        return "امتياز"\n    if avg >= 80:\n        return "جيد جداً"\n    if avg >= 70:\n        return "جيد"\n    return "مقبول"\n\nmarks = [88, 92, 79, 95]\navg = sum(marks) / len(marks)\nprint(f"المعدل: {avg:.1f} — {grade(avg)}")`, 1);
  const s2 = await snip(U(5), 'بطاقة تعريف بسيطة', 'أول مشروع ويب لي: بطاقة فيها اسمي وزر يغيّر اللون.', 'html',
    `<!-- HTML -->\n<div class="card">\n  <h1>نور الهدى</h1>\n  <p>أتعلم البرمجة على Kodax</p>\n  <button id="b">غيّر اللون</button>\n</div>\n\n<style>\n.card { font-family: sans-serif; padding: 24px; border-radius: 12px; background: #1e1b4b; color: white; text-align: center; }\nbutton { padding: 8px 16px; border: 0; border-radius: 8px; }\n</style>\n\n<script>\ndocument.getElementById('b').onclick = () => {\n  document.querySelector('.card').style.background = '#065f46';\n};\n</script>`, 2);
  const s3 = await snip(U(6), 'FizzBuzz in JavaScript', 'Classic warm-up, printed for 1..15.', 'javascript',
    `for (let i = 1; i <= 15; i++) {\n  const out = (i % 3 === 0 ? 'Fizz' : '') + (i % 5 === 0 ? 'Buzz' : '');\n  console.log(out || i);\n}`, 3);
  const s4 = await snip(U(2), 'برنامج يحسب أيام الدوام المتبقية حتى نهاية الفصل الدراسي مع استثناء العطل الرسمية والجمع', 'عنوان طويل عمداً لاختبار القص في البطاقات.', 'python',
    `from datetime import date, timedelta\n\nend = date(2026, 12, 31)\nholidays = {date(2026, 10, 3), date(2026, 12, 25)}\nd, n = date.today(), 0\nwhile d <= end:\n    if d.weekday() not in (4, 5) and d not in holidays:\n        n += 1\n    d += timedelta(days=1)\nprint("أيام الدوام المتبقية:", n)`, 5);
  const s5 = await snip(U(7), 'قائمة مهام صغيرة', 'إضافة وحذف عناصر من قائمة في بايثون.', 'python',
    `tasks = []\ntasks.append("مراجعة درس الحلقات")\ntasks.append("حل تحدي اليوم")\nfor i, t in enumerate(tasks, 1):\n    print(i, t)`, 6);
  await snip(U(1), 'أول برنامج لي', 'طباعة ترحيب.', 'python', `name = "سارة"\nprint("مرحبا", name)`, 2);
  await q(`INSERT INTO code_snippets (user_id, title, description, code, language, is_public) VALUES ($1, 'مسودة: تجربة الدوال', 'غير منشورة', 'def f():\n    pass', 'python', false)`, [U(1)]);

  const comment = (uid: string, s: string, text: string) => asUser(uid, `INSERT INTO code_comments (user_id, snippet_id, content) VALUES ($1, $2, $3) RETURNING id`, [uid, s, text]);
  const like = (uid: string, s: string) => asUser(uid, `INSERT INTO code_likes (user_id, snippet_id) VALUES ($1, $2) RETURNING id`, [uid, s]).catch(() => undefined);
  await comment(U(1), s1, 'فكرة حلوة! ممكن تضيف تقدير "راسب" إذا المعدل أقل من 50؟');
  await comment(U(5), s1, 'استخدمتها لدرجاتي 😄');
  await comment(U(4), s2, 'التصميم مرتب، جرّبي transition على الخلفية.');
  await comment(U(2), s3, 'Nice and short.');
  for (const [u, s] of [[U(1), s1], [U(5), s1], [U(6), s1], [U(7), s1], [U(1), s2], [U(4), s2], [U(1), s3], [U(4), s4], [U(5), s5]] as const) await like(u, s);
  for (let i = 0; i < 37; i++) await q(`INSERT INTO code_views (user_id, snippet_id) VALUES (NULL, $1)`, [s1]).catch(() => undefined);

  const follow = (a: string, b: string) => asUser(a, `SELECT set_follow($1, true)`, [b]).catch((e) => console.warn('[seed] follow', e.message));
  for (const [a, b] of [[U(1), U(4)], [U(1), U(5)], [U(4), U(1)], [U(5), U(1)], [U(6), U(1)], [U(2), U(4)], [U(7), U(4)]] as const) await follow(a, b);

  // رسائل خاصة: محادثة فيها رسالة طويلة ورابط + غير مقروء
  const conv = await asUser<any>(U(1), `SELECT get_or_create_conversation($1, $2) r`, [U(1), U(4)]).catch((e) => console.warn('[seed] conversation', e.message));
  const convId = conv?.r;
  if (convId && typeof convId === 'string') {
    const msg = (from: string, text: string, mins: number) =>
      q(`INSERT INTO messages (conversation_id, sender_id, content, created_at, is_read) VALUES ($1, $2, $3, now() - make_interval(mins => $4), $5)`, [convId, from, text, mins, from === U(1)]);
    await msg(U(1), 'السلام عليكم ليث، شفت كود حاسبة المعدل مالتك. سؤال: ليش استخدمت len(marks) بدل رقم ثابت؟', 180);
    await msg(U(4), 'وعليكم السلام! حتى إذا زادت المواد أو نقصت يبقى الحساب صحيح بدون ما تغيرين الكود. هذا أهم شي بالدوال: تشتغل على أي قائمة.', 170);
    await msg(U(1), 'منطقي 👍 وهل أكدر أستخدم round بدل :.1f؟', 165);
    await msg(U(4), 'تكدرين: round(avg, 1). بس f-string أوضح للطباعة. هذا رابط الدرس اللي يشرحها: https://www.kodax.app/lesson/py-12 — وراجعي تحدي "المعدل" بعده مباشرة لأن يستخدم نفس الفكرة بالضبط مع شرط إضافي للدرجات الناقصة.', 12);
  }

  // إشعارات داخل التطبيق
  for (const [type, title, message, mins] of [
    ['like', 'إعجاب جديد', 'أعجب ليث العبيدي بكودك «أول برنامج لي»', 30],
    ['follow', 'متابع جديد', 'بدأ Ahmed Karim بمتابعتك', 120],
    ['comment', 'تعليق جديد', 'علّقت نور الهدى على «حاسبة المعدل الفصلي»', 300],
  ] as const)
    await q(`INSERT INTO app_notifications (user_id, type, title, message, read, created_at) VALUES ($1, $2, $3, $4, false, now() - make_interval(mins => $5))`, [U(1), type, title, message, mins]).catch(() => undefined);

  await q(`REFRESH MATERIALIZED VIEW leaderboard`).catch(() => undefined);
  const sum = (await q(`SELECT full_name, xp, level FROM profiles WHERE id = ANY($1::uuid[]) ORDER BY xp DESC`, [PEOPLE.map((p) => U(p.n))])).rows;
  console.log('[seed]', sum.map((r: any) => `${r.full_name.slice(0, 14)}: ${r.xp}xp L${r.level}`).join(' | '));

  return PEOPLE.map((p) => ({ id: U(p.n), email: p.email, meta: { full_name: p.full, username: p.username } }));
}

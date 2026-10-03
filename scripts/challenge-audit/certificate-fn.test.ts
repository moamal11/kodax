/**
 * اختبار دالة الشهادات (supabase/functions/certificate/index.ts) محلياً بلا Deno وبلا Supabase:
 * يُنسخ الملف الحقيقي مع استبدال استيراد supabase-js بعميل وهمي في الذاكرة، ثم يُستدعى المعالج.
 * يتحقق من: رفض التوكن غير الموثّق، تجاهل أرقام العميل، الحساب من التقدم الموثّق فقط،
 * أسماء المجالات من السيرفر، وإصدار الشهادة عند الأهلية الحقيقية فقط.
 * التشغيل: npx tsx scripts/challenge-audit/certificate-fn.test.ts
 */
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(__dirname, '../..');
const FN = join(ROOT, 'supabase/functions/certificate');
const WORK = join(tmpdir(), 'kodax-cert-fn-test');

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

// ---------------- قاعدة بيانات وهمية ----------------
type Row = Record<string, any>;
const db: Record<string, Row[]> = {
  profiles: [],
  user_lesson_progress: [],
  challenge_submissions: [],
  challenge_attempts: [],
  course_final_exams: [],
  certificates: [],
  certificate_audit_log: [],
  certificate_requirements: [
    { course_id: '__default__', level: 'silver', min_lessons_percent: 50, min_challenges_percent: 25, max_challenge_errors: null, min_exam_score: 0, requires_project: false, max_completion_days: null },
    { course_id: '__default__', level: 'gold', min_lessons_percent: 75, min_challenges_percent: 60, max_challenge_errors: null, min_exam_score: 0, requires_project: false, max_completion_days: null },
    { course_id: '__default__', level: 'platinum', min_lessons_percent: 100, min_challenges_percent: 100, max_challenge_errors: 0, min_exam_score: 0, requires_project: false, max_completion_days: null },
  ],
};
const TOKENS: Record<string, string> = { 'valid-token-u1': 'u1', 'valid-token-u2': 'u2' };

class Query {
  private filters: ((r: Row) => boolean)[] = [];
  private op: 'select' | 'insert' | 'update' = 'select';
  private payload: any = null;
  private orderBy: { col: string; asc: boolean } | null = null;
  private lim: number | null = null;
  constructor(private table: string) {}
  select() { return this; }
  insert(p: any) { this.op = 'insert'; this.payload = p; return this; }
  update(p: any) { this.op = 'update'; this.payload = p; return this; }
  eq(c: string, v: any) { this.filters.push((r) => r[c] === v); return this; }
  neq(c: string, v: any) { this.filters.push((r) => r[c] !== v); return this; }
  in(c: string, vs: any[]) { this.filters.push((r) => vs.includes(r[c])); return this; }
  order(col: string, o?: { ascending?: boolean }) { this.orderBy = { col, asc: o?.ascending !== false }; return this; }
  limit(n: number) { this.lim = n; return this; }
  private run(): { data: any; error: any } {
    const rows = db[this.table] ?? (db[this.table] = []);
    if (this.op === 'insert') {
      const items = (Array.isArray(this.payload) ? this.payload : [this.payload]).map((r: Row) => ({ id: r.id ?? `id-${Math.random().toString(36).slice(2)}`, ...r }));
      rows.push(...items);
      return { data: items, error: null };
    }
    let out = rows.filter((r) => this.filters.every((f) => f(r)));
    if (this.op === 'update') {
      out.forEach((r) => Object.assign(r, this.payload));
      return { data: out, error: null };
    }
    if (this.orderBy) {
      const { col, asc } = this.orderBy;
      out = [...out].sort((a, b) => (a[col] > b[col] ? 1 : -1) * (asc ? 1 : -1));
    }
    if (this.lim !== null) out = out.slice(0, this.lim);
    return { data: out, error: null };
  }
  single() {
    const r = this.run();
    const one = Array.isArray(r.data) ? r.data[0] : r.data;
    return Promise.resolve(one ? { data: one, error: null } : { data: null, error: { code: 'PGRST116', message: 'no rows' } });
  }
  maybeSingle() { const r = this.run(); return Promise.resolve({ data: (r.data || [])[0] ?? null, error: null }); }
  then(res: any, rej: any) { return Promise.resolve(this.run()).then(res, rej); }
}
const mockClient = {
  auth: {
    async getUser(token: string) {
      const id = TOKENS[token];
      return id ? { data: { user: { id } }, error: null } : { data: { user: null }, error: { message: 'invalid JWT' } };
    },
  },
  from: (t: string) => new Query(t),
  rpc: async () => ({ data: null, error: null }),
};

(async () => {
  // ---------------- تجهيز نسخة قابلة للتشغيل من الدالة ----------------
  mkdirSync(WORK, { recursive: true });
  const src = readFileSync(join(FN, 'index.ts'), 'utf8')
    .replace("import { corsHeaders } from '../_shared/cors.ts';", "import { corsHeaders } from './cors.ts';")
    .replace("import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';", "const createClient = (..._a: any[]) => (globalThis as any).__mockClient;");
  writeFileSync(join(WORK, 'index.ts'), src);
  copyFileSync(join(FN, 'fields.generated.ts'), join(WORK, 'fields.generated.ts'));
  copyFileSync(join(ROOT, 'supabase/functions/_shared/cors.ts'), join(WORK, 'cors.ts'));
  (globalThis as any).__mockClient = mockClient;
  let handler: (req: Request) => Promise<Response> = async () => new Response('');
  (globalThis as any).Deno = {
    serve: (h: any) => { handler = h; },
    env: { get: (k: string) => ({ SUPABASE_URL: 'http://mock', SUPABASE_SERVICE_ROLE_KEY: 'mock-service', CERTIFICATE_SECRET: 'mock-secret', CERTIFICATE_HMAC_SECRET: 'mock-secret' } as any)[k] },
  };
  await import(pathToFileURL(join(WORK, 'index.ts')).href);
  const { CERTIFICATE_FIELDS } = await import(pathToFileURL(join(WORK, 'fields.generated.ts')).href);

  const call = async (token: string | null, body: any) => {
    const res = await handler(new Request('http://mock/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    }));
    let json: any = null;
    try { json = await res.json(); } catch { /* */ }
    return { status: res.status, json };
  };

  db.profiles.push({ id: 'u1' }, { id: 'u2' });
  const web = CERTIFICATE_FIELDS['web-dev'];
  check('field map loaded (web-dev has lessons and challenges)', web.lessons.length > 50 && web.challenges.length > 20, `${web.lessons.length}/${web.challenges.length}`);

  // ---------------- المصادقة ----------------
  const b64 = (o: any) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const forged = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'u1', role: 'authenticated' })}.`;
  check('no Authorization header → 401', (await call(null, { action: 'check_eligibility', course_id: 'web-dev', level: 'silver' })).status === 401);
  check('forged unsigned JWT with sub=u1 → 401 (was accepted before)', (await call(forged, { action: 'issue', course_id: 'web-dev', level: 'silver' })).status === 401);

  // ---------------- أرقام العميل تُتجاهل ----------------
  const cheat = await call('valid-token-u2', {
    action: 'issue', course_id: 'web-dev', level: 'platinum',
    completed_lessons: 999, total_lessons: 1, completed_challenges: 999, total_challenges: 1,
    min_lessons_percent: 0, min_challenges_percent: 0, course_title: 'Harvard CS Degree',
  });
  check('user with zero progress sending fake counts/thresholds cannot issue platinum', cheat.json?.success !== true && db.certificates.length === 0, JSON.stringify(cheat.json).slice(0, 120));
  const elig0 = await call('valid-token-u2', { action: 'check_eligibility', course_id: 'web-dev', level: 'silver', completed_lessons: 999, total_lessons: 1 });
  check('eligibility ignores client counts (server totals used)', elig0.json?.eligible === false && elig0.json?.progress?.lessons_total === web.lessons.length && elig0.json?.progress?.lessons_completed === 0, JSON.stringify(elig0.json?.progress));

  // ---------------- غير الموثّق لا يُحسب ----------------
  const half = Math.ceil(web.lessons.length * 0.6);
  web.lessons.slice(0, half).forEach((lid: string, i: number) => {
    db.user_lesson_progress.push({ user_id: 'u1', lesson_id: lid, course_id: web.courses[0], completed: true, verified: false, completed_at: `2026-09-${String(10 + (i % 15)).padStart(2, '0')}T10:00:00Z` });
  });
  db.challenge_attempts.push(...web.challenges.map((c: string) => ({ user_id: 'u1', challenge_id: c, passed: true }))); // جدول يكتبه العميل
  const unverified = await call('valid-token-u1', { action: 'check_eligibility', course_id: 'web-dev', level: 'silver' });
  check('unverified (client-written) lessons and challenge_attempts do not count', unverified.json?.progress?.lessons_completed === 0 && unverified.json?.progress?.challenges_completed === 0, JSON.stringify(unverified.json?.progress));

  // ---------------- الموثّق يُحسب ----------------
  // الدروس: نفس الصفوف لكن موثّقة وفي دوراتها الحقيقية
  db.user_lesson_progress = db.user_lesson_progress.filter((r) => r.user_id !== 'u1');
  const lessonCourse = new Map<string, string>();
  for (const cid of web.courses) for (const lid of web.lessons) if (!lessonCourse.has(lid)) lessonCourse.set(lid, cid);
  // نوزّع الدروس على دوراتها بحسب بادئة المعرّف غير المعروفة هنا، لذا نكتب صفاً لكل دورة (الاستعلام يقبل أي دورة من المجال)
  web.lessons.slice(0, half).forEach((lid: string) => {
    db.user_lesson_progress.push({ user_id: 'u1', lesson_id: lid, course_id: web.courses[0], completed: true, verified: true, completed_at: '2026-09-10T10:00:00Z' });
  });
  // دروس من مجال آخر لا تُحسب لهذا المجال
  const py = CERTIFICATE_FIELDS['python'];
  py.lessons.slice(0, 20).forEach((lid: string) => db.user_lesson_progress.push({ user_id: 'u1', lesson_id: lid, course_id: py.courses[0], completed: true, verified: true }));
  const chNeeded = Math.ceil(web.challenges.length * 0.3);
  web.challenges.slice(0, chNeeded - 1).forEach((c: string) => db.user_lesson_progress.push({ user_id: 'u1', lesson_id: c, course_id: 'challenges', completed: true, verified: false }));
  db.challenge_submissions.push({ user_id: 'u1', challenge_id: web.challenges[chNeeded - 1], all_passed: true });
  db.challenge_submissions.push({ user_id: 'u1', challenge_id: web.challenges[chNeeded], all_passed: false });
  const verified = await call('valid-token-u1', { action: 'check_eligibility', course_id: 'web-dev', level: 'silver' });
  check('verified lessons counted (only this field)', verified.json?.progress?.lessons_completed === half, `${verified.json?.progress?.lessons_completed} vs ${half}`);
  check('server challenge rows + passing submissions counted, failing ignored', verified.json?.progress?.challenges_completed === chNeeded, `${verified.json?.progress?.challenges_completed} vs ${chNeeded}`);
  check('silver eligible with real verified progress (60%/~30%)', verified.json?.eligible === true, JSON.stringify(verified.json?.reasons));
  const goldCheck = await call('valid-token-u1', { action: 'check_eligibility', course_id: 'web-dev', level: 'gold', min_lessons_percent: 0, min_challenges_percent: 0 });
  check('gold not eligible (client threshold override ignored)', goldCheck.json?.eligible === false);

  // ---------------- الإصدار ----------------
  const issued = await call('valid-token-u1', { action: 'issue', course_id: 'web-dev', level: 'silver', course_title: 'Fake University', course_title_ar: 'جامعة وهمية' });
  const cert = db.certificates.find((c) => c.user_id === 'u1');
  check('silver issued for eligible user', issued.json?.success === true && !!cert, JSON.stringify(issued.json).slice(0, 160));
  check('certificate title comes from server field map, not client text', !!cert && cert.course_title === web.name && !JSON.stringify(cert).includes('Fake University'), cert ? `${cert.course_title} / ${cert.course_title_ar}` : '');
  check('certificate snapshot uses server counts', cert?.achievement_snapshot?.total_lessons === web.lessons.length && cert?.achievement_snapshot?.completed_lessons === half);
  const unknown = await call('valid-token-u1', { action: 'issue', course_id: 'not-a-field', level: 'silver' });
  check('unknown field cannot be issued', unknown.json?.success !== true && !db.certificates.some((c) => c.course_id === 'not-a-field'));

  // ---------------- الإلغاء ----------------
  const revokeOther = await call('valid-token-u2', { action: 'revoke', certificate_id: cert?.id });
  check("user cannot revoke someone else's certificate", revokeOther.status === 403 && cert?.status !== 'revoked');
  const revokeForged = await call(forged, { action: 'revoke', certificate_id: cert?.id });
  check('forged token cannot revoke', revokeForged.status === 401 && cert?.status !== 'revoked');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * يولّد معرفة مساعد Kodax من المنهج المعتمد في التطبيق:
 *   supabase/functions/ai-chat/knowledge.generated.ts
 *
 * المصدر: ALL_COURSES / ALL_LESSONS / ALL_CHALLENGES (نفس ما يعرضه التطبيق، بعد تطبيق طبقة المنهج)،
 * وقاعدة قفل التحديات نفسها (getChallengeAccessType / getChallengeRequiredCourseId).
 * لا يُرسل للمساعد: حلول التحديات ولا اختباراتها (المخفية خصوصاً) ولا إجابات الاختبارات القصيرة.
 *
 * بعد إضافة أو تعديل درس/دورة/تحدٍ:
 *   npx tsx scripts/build-ai-knowledge.ts            ← يعيد التوليد
 *   npx tsx scripts/build-ai-knowledge.ts --check    ← يفشل إذا كانت المعرفة قديمة (للاختبارات)
 * ثم انشر دالة ai-chat.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  ALL_COURSES,
  ALL_LESSONS,
  ALL_CHALLENGES,
  getChallengeAccessType,
  getChallengeRequiredCourseId,
} from '../src/constants/courseData';
import { SearchIndex, type KChunk, type KnowledgeData } from '../supabase/functions/ai-chat/knowledge';
import { GLOSSARY } from '../supabase/functions/ai-chat/smart-glossary';
import { fingerprint } from '../supabase/functions/ai-chat/text';

const OUT = join(__dirname, '../supabase/functions/ai-chat/knowledge.generated.ts');
const MAX_SECTION = 1400;
const MAX_CODE = 2400;

const clean = (s: string | undefined) => (s ?? '').replace(/\r/g, '').trim();

/** تقسيم محتوى الدرس إلى أقسام حسب العناوين، ثم حسب الفقرات إذا طال القسم */
function splitSections(md: string): Array<{ heading: string; body: string }> {
  const out: Array<{ heading: string; body: string }> = [];
  let heading = '';
  let buf: string[] = [];
  let inFence = false;
  const flush = () => {
    const body = buf.join('\n').trim();
    if (body) out.push({ heading, body });
    buf = [];
  };
  for (const line of md.split('\n')) {
    if (/^```/.test(line.trim())) inFence = !inFence;
    const h = !inFence && line.match(/^#{1,3}\s+(.+)/);
    if (h) {
      flush();
      heading = h[1].trim();
    } else buf.push(line);
  }
  flush();
  // تقسيم الأقسام الطويلة على حدود الفقرات (بدون كسر كتل الكود)
  const final: Array<{ heading: string; body: string }> = [];
  for (const s of out) {
    if (s.body.length <= MAX_SECTION) {
      final.push(s);
      continue;
    }
    const paras = s.body.split(/\n{2,}/);
    let cur = '';
    let fenceOpen = false;
    for (const p of paras) {
      const fences = (p.match(/```/g) ?? []).length;
      if (cur && cur.length + p.length > MAX_SECTION && !fenceOpen) {
        final.push({ heading: s.heading, body: cur.trim() });
        cur = '';
      }
      cur += (cur ? '\n\n' : '') + p;
      if (fences % 2 === 1) fenceOpen = !fenceOpen;
    }
    if (cur.trim()) final.push({ heading: s.heading, body: cur.trim() });
  }
  return final;
}

const courseIds = new Set(ALL_COURSES.map((c) => c.id));
const lessons = ALL_LESSONS.filter((l) => courseIds.has(l.courseId)).sort(
  (a, b) => a.courseId.localeCompare(b.courseId) || a.order - b.order
);
const courses = [...ALL_COURSES].sort((a, b) => a.order - b.order);

const data: Omit<KnowledgeData, 'version'> = {
  courses: courses.map((c) => {
    const ls = lessons.filter((l) => l.courseId === c.id);
    return {
      id: c.id,
      title: c.title,
      description: clean(c.description),
      fieldId: c.fieldId,
      fieldName: (c as any).fieldNameAr || (c as any).fieldName || c.fieldId,
      difficulty: c.difficulty,
      order: c.order,
      pointsCost: c.pointsCost,
      lessonIds: ls.map((l) => l.id),
      previewLessonId: ls[0]?.id ?? null,
    };
  }),
  lessons: lessons.map((l) => ({
    id: l.id,
    courseId: l.courseId,
    title: l.title,
    description: clean(l.description),
    order: l.order,
    section: (l as any).section ?? null,
    language: l.language ?? '',
    xp: l.xpReward,
  })),
  challenges: ALL_CHALLENGES.map((c) => ({
    id: c.id,
    title: c.title,
    description: clean(c.description).slice(0, 1500),
    difficulty: c.difficulty,
    points: c.points,
    language: c.language,
    category: (c as any).category ?? null,
    requiredCourseId: getChallengeAccessType(c) === 'course-required' ? getChallengeRequiredCourseId(c) ?? null : null,
  })),
  chunks: [],
  glossaryLessons: {},
};

const difficultyAr: Record<string, string> = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم', easy: 'سهل', medium: 'متوسط', hard: 'صعب' };
const courseTitle = (id: string | null) => (id ? data.courses.find((c) => c.id === id)?.title ?? id : '');

const chunks: KChunk[] = [];
for (const c of data.courses) {
  const ls = data.lessons.filter((l) => l.courseId === c.id);
  chunks.push({
    id: `course:${c.id}`,
    kind: 'course',
    ref: c.id,
    title: c.title,
    text: [
      c.description,
      `المجال: ${c.fieldName} — المستوى: ${difficultyAr[c.difficulty] ?? c.difficulty} — عدد الدروس: ${ls.length}`,
      `الدروس: ${ls.map((l, i) => `${i + 1}. ${l.title}`).join('، ')}`,
    ].join('\n'),
  });
}
for (const l of lessons) {
  const sections = splitSections(clean(l.content));
  sections.forEach((s, i) => {
    chunks.push({
      id: `lesson:${l.id}:${i}`,
      kind: 'lesson',
      ref: l.id,
      title: `${l.title}${s.heading && s.heading !== l.title ? ` — ${s.heading}` : ''}`,
      text: i === 0 && l.description ? `${clean(l.description)}\n\n${s.body}` : s.body,
    });
  });
  const code = clean(l.codeExample);
  if (code) {
    chunks.push({
      id: `code:${l.id}`,
      kind: 'code',
      ref: l.id,
      title: `${l.title} — مثال`,
      text: '```' + (l.language || '') + '\n' + code.slice(0, MAX_CODE) + '\n```',
    });
  }
}
for (const ch of data.challenges) {
  chunks.push({
    id: `challenge:${ch.id}`,
    kind: 'challenge',
    ref: ch.id,
    title: ch.title,
    text: [
      ch.description,
      `الصعوبة: ${difficultyAr[ch.difficulty] ?? ch.difficulty} — النقاط: ${ch.points} — اللغة: ${ch.language}${ch.category ? ` — التصنيف: ${ch.category}` : ''}`,
      ch.requiredCourseId ? `الوصول: يحتاج فتح دورة "${courseTitle(ch.requiredCourseId)}"` : 'الوصول: مجاني',
    ].join('\n'),
  });
}
data.chunks = chunks;

// ربط كل مصطلح في القاموس بأقرب درس يشرحه
const lessonIndex = new SearchIndex(chunks.filter((c) => c.kind === 'lesson'));
for (const g of GLOSSARY) {
  const hit = lessonIndex.search(g.terms.join(' '), { limit: 1 })[0];
  if (hit && hit.score >= 4) data.glossaryLessons[g.id] = hit.chunk.ref;
}

const body = JSON.stringify(data);
const knowledge: KnowledgeData = { version: fingerprint(body).slice(0, 12), ...data };
const json = JSON.stringify(knowledge);
const file =
  `// مولَّد تلقائياً بـ scripts/build-ai-knowledge.ts من منهج التطبيق — لا تعدّله يدوياً.\n` +
  `// الإصدار: ${knowledge.version} — دورات: ${knowledge.courses.length}، دروس: ${knowledge.lessons.length}، ` +
  `تحديات: ${knowledge.challenges.length}، مقاطع بحث: ${knowledge.chunks.length}\n` +
  `export const KNOWLEDGE_JSON = ${JSON.stringify(json)};\n`;

if (process.argv.includes('--check')) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== file) {
    console.error('معرفة المساعد قديمة: شغّل npx tsx scripts/build-ai-knowledge.ts');
    process.exit(1);
  }
  console.log(`معرفة المساعد محدّثة (${knowledge.version})`);
} else {
  writeFileSync(OUT, file, 'utf8');
  console.log(
    `كُتب ${OUT}\nالإصدار ${knowledge.version}: ${knowledge.courses.length} دورة، ${knowledge.lessons.length} درس، ` +
      `${knowledge.challenges.length} تحدٍ، ${knowledge.chunks.length} مقطع، ${Object.keys(data.glossaryLessons).length}/${GLOSSARY.length} مصطلح مربوط بدرس — ${(file.length / 1024 / 1024).toFixed(2)} MB`
  );
}

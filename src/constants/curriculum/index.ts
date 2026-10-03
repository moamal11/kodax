/**
 * تطبيق خطط المناهج على المحتوى الأصلي.
 *
 * المحتوى الأصلي (pythonContent.ts ...) يبقى كما هو؛ هذه الطبقة:
 *  - تعدّل دروساً موجودة بمعرّفها (المعرّف لا يتغيّر ← تقدم المستخدمين محفوظ)
 *  - تضيف دروساً جديدة بمعرّفات جديدة
 *  - تحدد الترتيب والأقسام لكل دورة
 *  - تحسب totalLessons و totalXP من الدروس الفعلية
 *
 * التحقق: npx tsx scripts/curriculum/validate.ts
 */
import type { Course, Lesson } from '../courseData';
import type { CoursePlan } from './types';
import { CURRICULUM_PLANS } from './plans';

export type { CoursePlan } from './types';

/** يغيّر لغة كتل الكود حسب ترتيبها (نفس قواعد محلّل LessonContent: سطر يبدأ بـ ```) */
export function retagFences(content: string, langs: Record<number, string>): string {
  let n = 0;
  let open = false;
  return content
    .split('\n')
    .map((line) => {
      const m = /^(\s*)```\s*([\w+#.-]*)\s*$/.exec(line);
      if (!m) return line;
      if (open) {
        if (!m[2]) open = false;
        return line;
      }
      open = true;
      n++;
      return langs[n] ? `${m[1]}\`\`\`${langs[n]}` : line;
    })
    .join('\n');
}

export function applyCurriculum(courses: Course[], lessons: Lesson[]): { courses: Course[]; lessons: Lesson[] } {
  const plans = new Map<string, CoursePlan>(CURRICULUM_PLANS.map((p) => [p.courseId, p]));
  const byId = new Map<string, Lesson>();
  for (const l of lessons) if (!byId.has(l.id)) byId.set(l.id, l);

  for (const plan of plans.values()) {
    for (const id of plan.adopt ?? []) {
      const l = byId.get(id);
      if (l) byId.set(id, { ...l, courseId: plan.courseId });
    }
    for (const [id, fixes] of Object.entries(plan.codeFixes ?? {})) {
      const l = byId.get(id);
      if (!l?.codeExample) continue;
      let code = l.codeExample;
      for (const [from, to] of fixes) code = code.replace(from, to);
      byId.set(id, { ...l, codeExample: code });
    }
    for (const [id, fixes] of Object.entries(plan.contentFixes ?? {})) {
      const l = byId.get(id);
      if (!l?.content) continue;
      let content = l.content;
      for (const [from, to] of fixes) content = content.replace(from, to);
      byId.set(id, { ...l, content });
    }
    for (const [id, langs] of Object.entries(plan.fenceLangs ?? {})) {
      const l = byId.get(id);
      if (l?.content) byId.set(id, { ...l, content: retagFences(l.content, langs) });
    }
    for (const [id, patch] of Object.entries(plan.patches ?? {})) {
      const l = byId.get(id);
      if (l) byId.set(id, { ...l, ...patch });
    }
    for (const nl of plan.newLessons ?? []) {
      byId.set(nl.id, { order: 0, ...nl, courseId: plan.courseId } as Lesson);
    }
    // الترتيب والأقسام
    let order = 1;
    for (const section of plan.sections) {
      for (const id of section.lessons) {
        const l = byId.get(id);
        if (l) byId.set(id, { ...l, courseId: plan.courseId, order: order++, section: section.title });
      }
    }
  }

  const outLessons = [...byId.values()];
  const outCourses = courses.map((c) => {
    const plan = plans.get(c.id);
    const own = outLessons.filter((l) => l.courseId === c.id);
    return {
      ...c,
      ...(plan?.course ?? {}),
      totalLessons: own.length || c.totalLessons,
      totalXP: own.length ? own.reduce((a, l) => a + (l.xpReward || 0), 0) : c.totalXP,
    };
  });
  return { courses: outCourses, lessons: outLessons };
}

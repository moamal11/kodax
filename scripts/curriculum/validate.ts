/**
 * التحقق من سلامة خطط المناهج.
 * التشغيل: npx tsx scripts/curriculum/validate.ts
 */
import { ALL_COURSES, ALL_LESSONS } from '../../src/constants/courseData';
import { CURRICULUM_PLANS } from '../../src/constants/curriculum/plans';

let errors = 0;
const err = (m: string) => {
  errors++;
  console.log('ERROR', m);
};

const ids = new Map<string, number>();
for (const l of ALL_LESSONS) ids.set(l.id, (ids.get(l.id) ?? 0) + 1);
for (const [id, n] of ids) if (n > 1) err(`duplicate lesson id ${id}`);

for (const plan of CURRICULUM_PLANS) {
  if (!ALL_COURSES.some((c) => c.id === plan.courseId)) err(`${plan.courseId}: course does not exist`);
  const listed = plan.sections.flatMap((s) => s.lessons);
  const own = ALL_LESSONS.filter((l) => l.courseId === plan.courseId).map((l) => l.id);
  for (const id of listed) if (!ALL_LESSONS.some((l) => l.id === id)) err(`${plan.courseId}: section lists unknown lesson ${id}`);
  for (const id of own) if (!listed.includes(id)) err(`${plan.courseId}: lesson ${id} not placed in any section`);
  const dupl = listed.filter((x, i) => listed.indexOf(x) !== i);
  if (dupl.length) err(`${plan.courseId}: listed twice ${dupl.join(', ')}`);
  for (const s of plan.sections) if (!s.lessons.length) err(`${plan.courseId}: empty section "${s.title}"`);
  for (const [id, fixes] of Object.entries(plan.codeFixes ?? {})) {
    const l = ALL_LESSONS.find((x) => x.id === id);
    if (!l) err(`${plan.courseId}: codeFixes for unknown lesson ${id}`);
    for (const [, to] of fixes) if (l && !l.codeExample?.includes(to)) err(`${id}: codeFix did not apply (${to.slice(0, 40)})`);
  }
  for (const [id, fixes] of Object.entries(plan.contentFixes ?? {})) {
    const l = ALL_LESSONS.find((x) => x.id === id);
    if (!l) err(`${plan.courseId}: contentFixes for unknown lesson ${id}`);
    for (const [, to] of fixes) if (l && !l.content.includes(to)) err(`${id}: contentFix did not apply (${to.slice(0, 40)})`);
  }
  for (const [id, langs] of Object.entries(plan.fenceLangs ?? {})) {
    const l = ALL_LESSONS.find((x) => x.id === id);
    if (!l) err(`${plan.courseId}: fenceLangs for unknown lesson ${id}`);
    const opened = (l?.content.split('\n').filter((x) => /^\s*```/.test(x)).length ?? 0) / 2;
    for (const [n, lang] of Object.entries(langs)) {
      if (Number(n) > opened) err(`${id}: fenceLangs block ${n} does not exist (${opened} blocks)`);
      const re = new RegExp('^\\s*```' + lang.replace(/[+#.]/g, '\\$&') + '\\s*$', 'm');
      if (l && !re.test(l.content)) err(`${id}: fenceLangs ${n} → ${lang} not applied`);
    }
  }
  for (const nl of plan.newLessons ?? []) {
    if (!nl.title || !nl.description) err(`${nl.id}: missing title/description`);
    if ((nl.content || '').length < 1200) err(`${nl.id}: content too short (${(nl.content || '').length})`);
    if (!nl.xpReward) err(`${nl.id}: missing xpReward`);
  }
}
for (const l of ALL_LESSONS) {
  if (l.quiz) {
    const q = l.quiz;
    if (!(q.options?.length >= 2) || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) err(`${l.id}: invalid quiz`);
    if (new Set(q.options).size !== q.options.length) err(`${l.id}: duplicate quiz options`);
  }
  const orders = ALL_LESSONS.filter((x) => x.courseId === l.courseId && x.order === l.order);
  if (orders.length > 1 && orders[0].id === l.id) err(`${l.courseId}: duplicate order ${l.order} (${orders.map((x) => x.id).join(', ')})`);
}
const orphans = ALL_LESSONS.filter((l) => !ALL_COURSES.some((c) => c.id === l.courseId));
for (const o of orphans) err(`orphan lesson ${o.id} (course ${o.courseId})`);
console.log(`\n${CURRICULUM_PLANS.length} course plans, ${ALL_LESSONS.length} lessons, ${errors} errors`);
if (errors) process.exitCode = 1;

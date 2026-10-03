import { ALL_LESSONS } from '../../src/constants/courseData';
for (const id of process.argv.slice(2)) {
  const l: any = ALL_LESSONS.find((x) => x.id === id);
  if (!l) { console.log('missing', id); continue; }
  console.log(`===== ${l.id} [${l.courseId} #${l.order}] ${l.title} | ${l.language} | ${l.type} | ${l.estimatedMinutes}m | xp ${l.xpReward}`);
  console.log('DESC:', l.description);
  console.log('CONTENT:\n' + l.content);
  console.log('CODE:\n' + l.codeExample);
  if (l.quiz) console.log('QUIZ:', JSON.stringify(l.quiz));
}

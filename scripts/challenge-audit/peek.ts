import { ALL_CHALLENGES } from '../../src/constants/courseData';
const pick = (lang: string, n = 2) => (ALL_CHALLENGES as any[]).filter(c => c.language === lang).slice(0, n);
for (const l of ['Python','JavaScript','C++','Node.js','Dart','React','CSS','HTML','Dockerfile','SQL','TypeScript']) {
  for (const c of pick(l, l==='Python'?2:1)) {
    console.log('=====', c.id, c.language, c.difficulty, '|', c.title);
    console.log('DESC:', c.description.slice(0, 200));
    console.log('STARTER:\n' + c.starterCode.slice(0, 300));
    console.log('SOLUTION:\n' + c.solution.slice(0, 300));
    console.log('TESTS:', JSON.stringify(c.testCases).slice(0, 400));
  }
}

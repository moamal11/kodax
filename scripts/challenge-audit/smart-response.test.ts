/**
 * اختبار Smart Response ومعرفة المساعد المولّدة.
 * التشغيل: npx tsx scripts/challenge-audit/smart-response.test.ts
 */
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { ALL_COURSES, ALL_LESSONS, ALL_CHALLENGES } from '../../src/constants/courseData';
import { getKnowledge } from '../../supabase/functions/ai-chat/core';
import { SmartResponder } from '../../supabase/functions/ai-chat/smart';
import { FAQ, FACTS, DEFAULT_LIVE_CONFIG, mergeLiveConfig } from '../../supabase/functions/ai-chat/kodax-facts';
import { GLOSSARY } from '../../supabase/functions/ai-chat/smart-glossary';
import { KNOWLEDGE_JSON } from '../../supabase/functions/ai-chat/knowledge.generated';

let pass = 0;
let fail = 0;
const failures: string[] = [];
function check(name: string, cond: boolean, detail = '') {
  if (cond) pass++;
  else {
    fail++;
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const k = getKnowledge();
const smart = new SmartResponder(k);
const live = DEFAULT_LIVE_CONFIG;
const ask = (q: string, hasHistory = false, mode = 'general') => smart.match(q, { mode, hasHistory, hasContext: false, live });

// ===== حجم قاعدة الردود =====
const stats = smart.stats();
console.log('Smart Response entries:', JSON.stringify(stats));
check('at least 500 ready responses', stats.total >= 500, `${stats.total}`);

// ===== يجب أن تُجاب محلياً =====
const POSITIVE: Array<[string, string]> = [
  ['هلو', 'smalltalk:greet'], ['السلام عليكم', 'smalltalk:greet'], ['شكرا', 'smalltalk:thanks'], ['تسلم', 'smalltalk:thanks'],
  ['شلونك', 'smalltalk:how-are-you'], ['منو انت', 'smalltalk:who-are-you'], ['شنو تكدر تسوي', 'smalltalk:what-can-you-do'],
  ['منو سوى التطبيق', 'smalltalk:developer'], ['شنو هو kodax', 'faq:what-is-kodax'], ['كيف استخدم التطبيق', 'faq:how-to-use'],
  ['هل التطبيق مجاني', 'faq:is-free'], ['كيف افتح كورس', 'faq:unlock-course'], ['الكورس مقفول', 'faq:unlock-course'],
  ['ليش الدرس مقفول', 'faq:lesson-locked'], ['شنو هو XP', 'faq:what-is-xp'], ['كيف ازيد xp', 'faq:earn-xp'],
  ['كيف ينحسب المستوى', 'faq:levels'], ['شنو هي الكوينات', 'faq:what-are-coins'], ['كيف اجمع كوينات', 'faq:earn-coins'],
  ['المكافاة اليومية', 'faq:daily-reward'], ['اكدر اشتري كوينات', 'faq:buy-coins'], ['كيف اشوف اعلان', 'faq:watch-ad'],
  ['كيف افتح تحدي', 'faq:unlock-challenge'], ['ليش حلي ما انقبل', 'faq:challenge-check'], ['شنو الستريك', 'faq:streak'],
  ['كيف احصل شهادة', 'faq:certificates'], ['شنو الشارات', 'faq:badges'], ['شنو لوحة الصدارة', 'faq:leaderboard'],
  ['كيف اغير اسمي', 'faq:edit-profile'], ['كيف اتواصل وياكم', 'faq:support'], ['شكد حد الذكاء', 'faq:ai-limit'],
  ['كيف ازيد حصة الذكاء', 'faq:ai-increase'], ['شلون يشتغل المساعد', 'faq:ai-how'], ['محادثة جديدة', 'faq:new-chat'],
  ['شنو هو المتغير', 'glossary:variable'], ['ما هي الدالة', 'glossary:function'], ['شنو يعني array', 'glossary:array'],
  ['شنو هو API', 'glossary:api'], ['ما هو JSON', 'glossary:json'], ['شنو هي الوراثة', 'glossary:inheritance'],
  ['شنو الفرق بين let و const', 'glossary:let-const-var'], ['شنو هو recursion', 'glossary:recursion'], ['ما هو git', 'glossary:git'],
  ['what is a pointer', 'glossary:pointer'], ['شنو هو SQL', 'glossary:sql'], ['شنو هو Flutter', 'glossary:flutter'],
  ['كم XP عندي', 'personal:personal:xp'], ['شكد رصيدي', 'personal:personal:coins'], ['شكد عندي كوينات', 'personal:personal:coins'],
  ['شنو مستواي', 'personal:personal:level'], ['كم باقي لي من الذكاء', 'personal:personal:quota'], ['كم درس خلصت', 'personal:personal:progress'],
  ['سلسلتي', 'personal:personal:streak'],
  ['شنو كورس CSS المتقدم', 'course:web-css-advanced:about'], ['كم درس بكورس أساسيات Python', 'course:py-basics:count'],
  ['سعر كورس مقدمة React', 'course:web-react-intro:price'], ['شنو دروس كورس أساسيات HTML', 'course:web-html-basics:lessons'],
];
for (const [q, expected] of POSITIVE) {
  const m = ask(q);
  check(`smart: "${q}" → ${expected}`, !!m && `${m.kind}:${m.id}` === expected, m ? `${m.kind}:${m.id}` : 'null');
}

// كل تحدٍ وكل دورة يمكن السؤال عنها باسمها
let challengeHits = 0;
for (const ch of ALL_CHALLENGES) {
  const m = ask(`تحدي ${ch.title}`);
  // عنوان مكرر في أكثر من مجال ("عكس النص") ← قائمة بالتحديات التي تحمل الاسم وهذا صحيح
  const dup = ALL_CHALLENGES.filter((x) => x.title === ch.title).length > 1;
  if (m?.kind === 'challenge' && (m.id === ch.id || (dup && m.id.startsWith('list:') && !!m.reply?.includes(ch.title)))) challengeHits++;
}
check('challenges answerable by title (≥ 90%)', challengeHits / ALL_CHALLENGES.length >= 0.9, `${challengeHits}/${ALL_CHALLENGES.length}`);
let courseHits = 0;
for (const c of ALL_COURSES) {
  const m = ask(`شنو كورس ${c.title}`);
  if (m?.kind === 'course' && m.id.startsWith(c.id + ':')) courseHits++;
}
check('every course answerable by title', courseHits === ALL_COURSES.length, `${courseHits}/${ALL_COURSES.length}`);

// ===== يجب أن تذهب إلى Gemini =====
const NEGATIVE = [
  'اشرح لي المتغيرات بالتفصيل',
  'اكتب لي دالة تجمع رقمين',
  'ليش الكود مالتي ما يشتغل',
  'def add(a, b): return a + b شنو الخطأ',
  'const x = 5; console.log(x) ليش يطلع undefined',
  'شنو أفضل لغة للذكاء الاصطناعي ولماذا',
  'كيف أسوي حلقة for ببايثون',
  'قارن بين React و Flutter من ناحية الأداء',
  'اعطني مثال على الوراثة في بايثون',
  'شلون اسوي API بـ Node واربطها بقاعدة بيانات وارجع JSON للتطبيق مع التحقق من المستخدم',
  'ممكن تصحح هذا: for i in range(10) print(i)',
  'شنو رأيك بمشروعي',
];
for (const q of NEGATIVE) {
  const m = ask(q);
  check(`→ Gemini: "${q}"`, m === null, m ? `${m.kind}:${m.id}` : '');
}
// متابعة محادثة قصيرة تحتاج السياق
for (const q of ['وهذا شنو يعني؟', 'ليش؟', 'وضح أكثر', 'كمل', 'طيب وبعدين']) {
  check(`follow-up with history → Gemini: "${q}"`, ask(q, true) === null);
}
// أوضاع التحديات والدروس لا تُجاب محلياً أبداً
for (const mode of ['challenge-hint', 'challenge-solve', 'lesson-explain', 'explain', 'fix']) {
  check(`mode ${mode} → never smart`, ask('شنو هو المتغير', false, mode) === null);
}

// ===== جودة وأمان الردود الجاهزة =====
for (const f of FAQ) {
  const a = f.answer(live);
  check(`FAQ ${f.id}: renders without undefined/NaN`, !!a && !/undefined|NaN|\[object/.test(a));
}
for (const f of FACTS) {
  const t = f.text(live);
  check(`fact ${f.id}: renders without undefined/NaN`, !!t && !/undefined|NaN|\[object/.test(t));
}
{
  const custom = mergeLiveConfig({ ads: { reward_per_ad: 99 }, prices: { 'web-react-intro': 777 } });
  const ad = FAQ.find((f) => f.id === 'watch-ad')!.answer(custom);
  check('FAQ numbers follow live config (admin changes need no code change)', ad.includes('99') && custom.ads.daily_limit === 4);
  const m = smart.match('سعر كورس مقدمة React', { mode: 'general', hasHistory: false, hasContext: false, live: custom });
  check('course price answer uses live DB price', !!m?.reply?.includes('777'));
}
for (const g of GLOSSARY) {
  const lessonId = k.data.glossaryLessons[g.id];
  if (lessonId) check(`glossary ${g.id}: linked lesson exists`, k.lessonById.has(lessonId), lessonId);
}

// لا حلول ولا اختبارات مخفية في معرفة التحديات (خصائص CSS العامة مثل justify-content قد تظهر في الدروس نفسها — هذا شرح وليس تسريباً)
{
  const challengeText = new Map(k.data.chunks.filter((c) => c.kind === 'challenge').map((c) => [c.ref, c.text]));
  const solutionsLeaked = ALL_CHALLENGES.filter((c) => {
    const text = challengeText.get(c.id) ?? '';
    const lines = String(c.solution ?? '').split('\n').map((l) => l.trim()).filter((l) => l.length > 25);
    return lines.some((l) => text.includes(l) && !c.description.includes(l));
  });
  check('no challenge solution lines inside challenge knowledge', solutionsLeaked.length === 0, solutionsLeaked.slice(0, 3).map((c) => c.id).join(','));
  const hiddenLeaked = ALL_CHALLENGES.filter((c) =>
    c.testCases.some(
      (t: any) =>
        t.hidden &&
        typeof t.expectedOutput === 'string' &&
        t.expectedOutput.length > 8 &&
        !c.description.includes(t.expectedOutput) &&
        (challengeText.get(c.id) ?? '').includes(t.expectedOutput)
    )
  );
  check('no hidden test expectations (beyond the public description) inside challenge knowledge', hiddenLeaked.length === 0, hiddenLeaked.slice(0, 3).map((c) => c.id).join(','));
  check('challenge knowledge never includes testCases/solution fields', !/"(solution|testCases|hidden)"\s*:/.test(KNOWLEDGE_JSON));
}

// ===== المعرفة المولّدة =====
const courseIds = new Set(ALL_COURSES.map((c) => c.id));
check('knowledge covers every course', k.data.courses.length === ALL_COURSES.length);
check('knowledge covers every lesson', k.data.lessons.length === ALL_LESSONS.filter((l) => courseIds.has(l.courseId)).length, `${k.data.lessons.length}`);
check('knowledge covers every challenge', k.data.challenges.length === ALL_CHALLENGES.length);
check('every lesson has searchable chunks', k.data.lessons.every((l) => k.data.chunks.some((c) => c.ref === l.id)));
try {
  execSync('npx tsx scripts/build-ai-knowledge.ts --check', { cwd: join(__dirname, '../..'), stdio: 'pipe' });
  check('knowledge.generated.ts is up to date with the curriculum', true);
} catch (e: any) {
  check('knowledge.generated.ts is up to date with the curriculum', false, String(e.stderr || e.message).slice(0, 200));
}
// البحث يجد الدرس المناسب
{
  const top = k.search('حلقة for في بايثون', { limit: 3, kinds: ['lesson', 'code'] }).map((h) => k.lessonById.get(h.chunk.ref)?.courseId);
  check('retrieval: Python loop question → Python lesson', top.some((c) => c?.startsWith('py-')), top.join(','));
  const css = k.search('flexbox justify-content محاذاة العناصر', { limit: 3 }).map((h) => h.chunk.ref);
  check('retrieval: flexbox question → CSS content', css.some((r) => (k.lessonById.get(r)?.courseId ?? '').startsWith('web-css')), css.join(','));
  const ctx = k.buildContext('كيف اجمع كوينات من الاعلانات', live);
  check('retrieval: coins/ads question → app facts with live numbers', ctx.usedLive && ctx.text.includes(String(live.ads.reward_per_ad)));
}

for (const f of failures) console.log('FAIL', f);
console.log(`\n${pass}/${pass + fail} passed`);
if (fail) process.exitCode = 1;

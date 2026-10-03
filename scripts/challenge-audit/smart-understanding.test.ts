/**
 * اختبار طبقة فهم السؤال (understand.ts + smart.ts) عبر مسار ai-chat الكامل (handleChat) مع Gemini وحصة وهميين.
 * لكل سؤال مشروع يتأكد من:
 *   1) اختيار Smart Response (source = 'smart')
 *   2) عدم استدعاء Gemini
 *   3) عدم حجز أي طلب من حصة الذكاء (reserveQuota)
 *   4) الرد المتوقع (smartKind:smartId) ومناسبته للسؤال (نص يدل على الموضوع)
 * ولكل سؤال يحتاج شرحاً/استدلالاً/كوداً: يذهب إلى Gemini (ويُحجز من الحصة).
 * ويتأكد أن المنهج الجديد (دورة/دروس/تحدي جديدة) يُجاب بدون أي تعديل على الكود أو القاموس.
 * التشغيل: npx tsx scripts/challenge-audit/smart-understanding.test.ts
 */
import { handleChat, getKnowledge, type ChatDeps } from '../../supabase/functions/ai-chat/core';
import { Knowledge, type KnowledgeData } from '../../supabase/functions/ai-chat/knowledge';
import { SmartResponder, DEFAULT_FAQ_THRESHOLD, type QuotaState } from '../../supabase/functions/ai-chat/smart';
import { LEXICON_CONFLICTS } from '../../supabase/functions/ai-chat/understand';
import { DEFAULT_LIVE_CONFIG } from '../../supabase/functions/ai-chat/kodax-facts';
import { DEV_POS, DEV_NEG, HOLDOUT_POS, HOLDOUT_NEG, type PosCase, type NegCase } from './smart-eval-set';
import { BLIND_POS, BLIND_NEG } from './smart-eval-blind';

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

const QUOTA = (used: number, limit = 10): QuotaState => ({
  used,
  limit,
  remaining: Math.max(0, limit - used),
  ads: { watched: 0, per_bonus: 2, bonus_amount: 3, bonuses_earned: 0, max_bonuses: 2, progress: 0, can_watch: true },
});

function deps(knowledge?: Knowledge) {
  const calls = { gemini: 0, reserve: 0, release: 0 };
  const d: ChatDeps = {
    getUser: async () => ({ id: 'user-1' }),
    reserveQuota: async () => {
      calls.reserve++;
      return { allowed: true, quota: QUOTA(calls.reserve) };
    },
    releaseQuota: async () => {
      calls.release++;
      return QUOTA(0);
    },
    getUserSnapshot: async () => ({
      xp: 450,
      level: 2,
      streak: 3,
      coins: 120,
      unlockedCourses: ['py-data-structures'],
      completedLessons: 7,
      completedChallenges: 2,
      quota: QUOTA(4),
    }),
    apiKey: 'test-key-not-real',
    fetchImpl: (async () => {
      calls.gemini++;
      return new Response(
        JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'رد Gemini تجريبي' }] }, finishReason: 'STOP' }], usageMetadata: { totalTokenCount: 10 } }),
        { status: 200 }
      );
    }) as unknown as typeof fetch,
    knowledge,
  };
  return { d, calls };
}

const HISTORY = [
  { role: 'user', content: 'شنو هي الكوينات؟' },
  { role: 'assistant', content: 'الكوينات عملة داخل Kodax تفتح بيها الدورات.' },
];

// مناسبة الرد للسؤال: كلمة تدل على الموضوع حسب الرد المتوقع
const RELEVANCE: Array<[RegExp, RegExp]> = [
  [/personal:xp/, /450/],
  [/personal:coins/, /120/],
  [/personal:level/, /2/],
  [/:lessons$/, /درس|دروس/],
  [/which-course-first/, /ابدأ|دور|كورس/],
  [/coins-disappeared/, /رصيد|كوين/],
  [/xp-vs-coins/, /XP[\s\S]*كوين|كوين[\s\S]*XP/],
  [/xp|level/, /XP|مستو/],
  [/coin|buy-coins|daily-reward/, /كوين|عمل/],
  [/ads?\b|watch-ad|ad-not-counted|what-are-ads/, /إعلان|اعلان/],
  [/^course:|course|which-course|free-courses|unlock-course|field-bundle/, /دور|كورس/],
  [/^lesson:|lesson/, /درس|دروس/],
  [/^challenge:|challenge/, /تحد/],
  [/^catalog:/, /\d/],
  [/certificate/, /شهاد/],
  [/streak/, /سلسل|Streak/i],
  [/leaderboard/, /صدار/],
  [/ai-limit|ai-increase/, /طلب|حص|يوم/],
];
function relevant(key: string, reply: string): boolean {
  for (const [k, r] of RELEVANCE) if (k.test(key)) return r.test(reply);
  return reply.trim().length > 0;
}

async function runPositive(set: string, c: PosCase) {
  const { d, calls } = deps();
  const r = await handleChat(d, { message: c.q, mode: 'general', history: c.history ? HISTORY : [] });
  const key = `${r.body.smartKind}:${r.body.smartId}`;
  const reply = String(r.body.reply ?? '');
  const expects = Array.isArray(c.expect) ? c.expect : [c.expect];
  const tag = `[${set}] "${c.q}"`;
  check(`${tag} → Smart Response`, r.status === 200 && r.body.source === 'smart', `source=${r.body.source}`);
  check(`${tag} → Gemini not called`, calls.gemini === 0, `calls=${calls.gemini}`);
  check(`${tag} → no AI quota consumed`, calls.reserve === 0 && r.body.quota === null && r.body.tokensUsed === 0, `reserve=${calls.reserve}`);
  check(`${tag} → expected answer`, expects.some((e) => key.startsWith(e)), `${key} (expected ${expects.join('|')})`);
  check(`${tag} → relevant reply`, (!c.must || reply.includes(c.must)) && relevant(key, reply), reply.slice(0, 80));
  return r.body.source === 'smart';
}

async function runNegative(set: string, c: NegCase) {
  const { d, calls } = deps();
  const r = await handleChat(d, { message: c.q, mode: 'general', history: c.history ? HISTORY : [] });
  const tag = `[${set}] "${c.q}" (${c.why})`;
  check(`${tag} → Gemini`, r.body.source !== 'smart' && calls.gemini === 1, `source=${r.body.source} ${r.body.smartKind ?? ''}:${r.body.smartId ?? ''}`);
  check(`${tag} → quota reserved once`, calls.reserve === 1);
}

(async () => {
  // ===== 0) سلامة القاموس والأنماط =====
  const smart = new SmartResponder(getKnowledge());
  check('lexicon: no phrase maps to two different meanings', LEXICON_CONFLICTS.length === 0, LEXICON_CONFLICTS.join('; '));
  check('FAQ patterns: no two intents share an identical frame', smart.patternConflicts().length === 0, smart.patternConflicts().join('; '));
  check('existing ready replies kept (≥ 802)', smart.stats().total >= 802, String(smart.stats().total));
  check('FAQ threshold unchanged at calibrated value 0.78', DEFAULT_FAQ_THRESHOLD === 0.78 && smart.getThreshold() === 0.78);

  // ===== 1) أسئلة مشروعة بصياغات مختلفة: يجب أن تُجاب محلياً =====
  // الأسئلة التي لم تُجب محلياً في القياس (تذهب إلى Gemini بأمان) مذكورة في smart-eval.ts؛ هنا نختبر فقط ما يجب أن يُجاب
  // محلياً، ونتأكد أن عدده لا ينخفض.
  const groups: Array<[string, PosCase[]]> = [
    ['DEV', DEV_POS],
    ['HOLDOUT', HOLDOUT_POS],
    ['BLIND', BLIND_POS],
  ];
  const local: Record<string, number> = {};
  for (const [name, cases] of groups) {
    local[name] = 0;
    for (const c of cases) {
      // نسخة خفيفة: نشغل المطابق أولاً لنعرف إن كان سيذهب إلى Gemini (غير مُجاب) — تلك لا تُفحص هنا كفشل
      const m = smart.match(c.q, { mode: 'general', hasHistory: !!c.history, hasContext: false, live: DEFAULT_LIVE_CONFIG });
      if (!m) continue;
      if (await runPositive(name, c)) local[name]++;
    }
  }
  const MIN_LOCAL = { DEV: 220, HOLDOUT: 82, BLIND: 63 };
  for (const [name, cases] of groups) {
    const min = MIN_LOCAL[name as keyof typeof MIN_LOCAL];
    check(`[${name}] answered locally ≥ ${min}/${cases.length}`, local[name] >= min, `${local[name]}/${cases.length}`);
  }

  // ===== 2) يجب أن تذهب إلى Gemini (شرح، استدلال، كود، رأي، متابعة) =====
  for (const c of DEV_NEG) await runNegative('DEV', c);
  for (const c of HOLDOUT_NEG) await runNegative('HOLDOUT', c);
  for (const c of BLIND_NEG) await runNegative('BLIND', c);

  // ===== 3) قابلية التوسع: دورة/دروس/تحدي جديدة بدون أي تعديل على الكود أو القاموس =====
  {
    const base = getKnowledge().data;
    const data: KnowledgeData = JSON.parse(JSON.stringify(base));
    data.version = 'test-rust';
    data.courses.push({
      id: 'rust-basics',
      title: 'أساسيات Rust',
      description: 'مقدمة في لغة Rust: الملكية والاستعارة والأنماط.',
      fieldId: 'rust',
      fieldName: 'Rust',
      difficulty: 'beginner',
      order: 1,
      pointsCost: 0,
      lessonIds: ['rust-1', 'rust-2', 'rust-3'],
      previewLessonId: 'rust-1',
    });
    data.courses.push({
      id: 'rust-advanced',
      title: 'Rust المتقدم',
      description: 'البرمجة المتزامنة والـ traits في Rust.',
      fieldId: 'rust',
      fieldName: 'Rust',
      difficulty: 'advanced',
      order: 2,
      pointsCost: 900,
      lessonIds: ['rust-adv-1'],
      previewLessonId: null,
    });
    data.lessons.push(
      { id: 'rust-1', courseId: 'rust-basics', title: 'الملكية Ownership', description: 'قواعد الملكية في Rust.', order: 1, section: null, language: 'rust', xp: 20 },
      { id: 'rust-2', courseId: 'rust-basics', title: 'الاستعارة Borrowing', description: 'المراجع والاستعارة.', order: 2, section: null, language: 'rust', xp: 20 },
      { id: 'rust-3', courseId: 'rust-basics', title: 'مطابقة الأنماط Pattern Matching', description: 'match في Rust.', order: 3, section: null, language: 'rust', xp: 25 },
      { id: 'rust-adv-1', courseId: 'rust-advanced', title: 'الـ Traits', description: 'تعريف السلوك المشترك.', order: 1, section: null, language: 'rust', xp: 30 }
    );
    data.challenges.push({
      id: 'rust-ch-1',
      title: 'مدقق الأقواس المتوازنة',
      description: 'اكتب دالة تتحقق أن الأقواس في النص متوازنة.',
      difficulty: 'medium',
      points: 40,
      language: 'rust',
      category: null,
      requiredCourseId: 'rust-basics',
    });
    const k = new Knowledge(data);
    const cases: Array<[string, string, string?]> = [
      ['شنو كورس أساسيات Rust', 'course:rust-basics:', 'Rust'],
      ['كم درس بكورس أساسيات Rust', 'course:rust-basics:count', '3'],
      ['سعر كورس Rust المتقدم', 'course:rust-advanced:price', '900'],
      ['هل كورس أساسيات Rust مجاني', 'course:rust-basics:price', 'مجاني'],
      ['كورسات Rust', 'course:list', 'Rust المتقدم'],
      ['دروس كورس أساسيات Rust', 'course:rust-basics:lessons', 'Ownership'],
      ['درس الملكية Ownership', 'lesson:rust-1', 'Ownership'],
      ['كم XP يعطي درس الاستعارة', 'lesson:rust-2', '20'],
      ['تحدي مدقق الأقواس المتوازنة', 'challenge:rust-ch-1', 'الأقواس'],
    ];
    for (const [q, expect, must] of cases) {
      const { d, calls } = deps(k);
      const r = await handleChat(d, { message: q, mode: 'general' });
      const key = `${r.body.smartKind}:${r.body.smartId}`;
      const reply = String(r.body.reply ?? '');
      check(
        `[NEW CONTENT] "${q}" → ${expect}`,
        r.body.source === 'smart' && key.startsWith(expect) && (!must || reply.includes(must)) && calls.gemini === 0 && calls.reserve === 0,
        `${r.body.source} ${key} ${reply.slice(0, 60)}`
      );
    }
    // "رست" بالعربي تُكتب مثل REST (نفس الهيكل الصوتي rst) ← غامضة: لا يخمّن بين Rust و REST APIs
    {
      const { d } = deps(k);
      const r = await handleChat(d, { message: 'هل كورس رست مجاني', mode: 'general' });
      check('[NEW CONTENT] ambiguous Arabic "رست" (Rust/REST) is not guessed', !(r.body.source === 'smart' && /^course:(rust|backend-rest)/.test(`${r.body.smartKind}:${r.body.smartId}`) && !String(r.body.smartId).startsWith('list')));
    }
    // ولا يزال يرفض ما يحتاج شرحاً عن المحتوى الجديد
    for (const q of ['اشرح لي الملكية في Rust بالتفصيل', 'ساعدني احل تحدي مدقق الأقواس المتوازنة', 'قارن بين Rust و C++']) {
      const { d, calls } = deps(k);
      const r = await handleChat(d, { message: q, mode: 'general' });
      check(`[NEW CONTENT] "${q}" → Gemini`, r.body.source !== 'smart' && calls.gemini === 1);
    }
    // الكورس الجديد غير موجود في المعرفة الأصلية (تأكيد أن النجاح من البيانات لا من الكود)
    const { d } = deps();
    const r = await handleChat(d, { message: 'سعر كورس Rust المتقدم', mode: 'general' });
    check('[NEW CONTENT] unknown course in production knowledge is not invented', !(r.body.source === 'smart' && String(r.body.smartId).startsWith('rust')));
  }

  // ===== 3ب) أسئلة الكورسات: القائمة الكاملة من البيانات، التحقق من وجود كورس، وعدم اختراع أسماء =====
  {
    const courses = getKnowledge().data.courses;
    const titles = new Set(courses.map((c) => c.title));
    const ask = async (q: string, k?: Knowledge) => {
      const { d, calls } = deps(k);
      const r = await handleChat(d, { message: q, mode: 'general' });
      return { r, calls, key: `${r.body.smartKind}:${r.body.smartId}`, reply: String(r.body.reply ?? '') };
    };
    /** كل اسم دورة يظهر في الرد (عناصر القائمة أو **عريض**) يجب أن يكون دورة حقيقية */
    const namedCourses = (reply: string) => {
      const names: string[] = [];
      for (const line of reply.split('\n')) {
        const m = line.match(/^- \*\*[^*]+\*\* \(\d+\): (.+)$/);
        if (m) names.push(...m[1].split('، ').map((s) => s.trim()));
      }
      for (const m of reply.matchAll(/\*\*([^*]+)\*\*/g)) if (!reply.includes(`- **${m[1]}** (`)) names.push(m[1]);
      return names;
    };

    // القائمة الكاملة: كل الدورات الفعلية، بالعدد الصحيح، بدون أسماء مخترعة، محلياً
    const FULL_LIST = [
      'شنو الكورسات الموجودة؟',
      'شنو الكورسات الموجودة بالتطبيق؟',
      'اذكرلي كل الدورات',
      'شنو أگدر أتعلم في Kodax؟',
      'شنو الكورسات المتوفرة',
      'اعرض كل الكورسات',
      'قائمة الدورات',
      'شنو الدورات اللي عندكم',
      'اكو كورسات بالتطبيق؟',
      'شنو الكورسات',
      'شنو المجالات',
      'what courses are available',
      'list all courses',
      'شنو اكدر اتعلم بالتطبيق',
    ];
    for (const q of FULL_LIST) {
      const { r, calls, key, reply } = await ask(q);
      const listed = namedCourses(reply);
      check(
        `[COURSES] "${q}" → full course list from data`,
        r.body.source === 'smart' && key === 'catalog:fields' && calls.gemini === 0 && calls.reserve === 0,
        `${r.body.source} ${key}`
      );
      check(`[COURSES] "${q}" → lists all ${courses.length} courses`, listed.length === courses.length && courses.every((c) => listed.includes(c.title)), `${listed.length}`);
      check(`[COURSES] "${q}" → no invented names`, listed.every((n) => titles.has(n)), listed.filter((n) => !titles.has(n)).join('، '));
      check(`[COURSES] "${q}" → states real total`, reply.includes(`${courses.length} دورة`));
    }

    // كورس/مجال محدد موجود: يتحقق من وجوده ويعطي معلوماته الصحيحة
    const SPECIFIC: Array<[string, string, string[]]> = [
      ['عندكم كورس بايثون؟', 'course:list', courses.filter((c) => c.fieldId === 'python' || /python/i.test(c.title)).map((c) => c.title)],
      ['هل توجد دورة لأمن الشبكات؟', 'course:cyber-network:', ['أمن الشبكات']],
      ['عندكم دورة امن شبكات', 'course:cyber-network:', ['أمن الشبكات']],
      ['اكو كورس فلاتر', 'course:list', ['أساسيات Flutter', 'Flutter المتقدم']],
      ['هل يوجد كورس MongoDB', 'course:backend-mongodb:', ['MongoDB']],
      ['عندكم كورس React Native', 'course:', ['React Native']],
    ];
    for (const [q, expect, must] of SPECIFIC) {
      const { r, calls, key, reply } = await ask(q);
      check(
        `[COURSES] "${q}" → ${expect}`,
        r.body.source === 'smart' && key.startsWith(expect) && calls.gemini === 0 && calls.reserve === 0 && must.every((m) => reply.includes(m)),
        `${r.body.source} ${key} ${reply.slice(0, 80)}`
      );
      check(`[COURSES] "${q}" → no invented names`, namedCourses(reply).every((n) => titles.has(n)), namedCourses(reply).filter((n) => !titles.has(n)).join('، '));
    }
    // تفاصيل كورس محدد من البيانات (عدد الدروس الحقيقي)
    for (const c of courses.slice(0, 32)) {
      const { key, reply } = await ask(`كم درس بكورس ${c.title}`);
      check(`[COURSES] lesson count of "${c.title}" matches data`, key === `course:${c.id}:count` && reply.includes(String(c.lessonIds.length)), `${key}`);
    }

    // كورس غير موجود: لا يُخترع؛ الجواب من البيانات (أين يُذكر، أو قائمة المتوفر)
    {
      const { r, key, reply, calls } = await ask('هل يوجد كورس Swift');
      check('[COURSES] "هل يوجد كورس Swift" → says not available + real list', key === 'catalog:not-found:swift' && /ما بـ Kodax دورة/.test(reply) && courses.every((c) => reply.includes(c.title)) && calls.gemini === 0 && r.body.source === 'smart');
      const j = await ask('اكو كورس جافا');
      const jNames = namedCourses(j.reply);
      check('[COURSES] "اكو كورس جافا" → no dedicated course, real courses mentioning it', j.key === 'catalog:not-found:java' && /مخصصة لـ Java/.test(j.reply) && jNames.length > 0 && jNames.every((n) => titles.has(n)), j.reply.slice(0, 100));
      // اسم موجود كعنوان درس (hooks) أو كلمة عربية غير معروفة: لا نقول "ماكو" — Gemini يقرر مع المعرفة
      for (const q of ['اكو كورس hooks', 'عندكم كورس الطبخ']) {
        const x = await ask(q);
        check(`[COURSES] "${q}" → not claimed missing locally`, !(x.r.body.source === 'smart' && x.key.startsWith('catalog:not-found')), x.key);
      }
    }

    // أسئلة شرح/مقارنة/حل تذكر الكورسات: لا تُجاب من القائمة
    for (const q of [
      'اشرح لي كورس بايثون بالتفصيل',
      'قارن بين كورس بايثون و C++',
      'ساعدني احل تحدي البحث الثنائي',
      'شنو افضل كورس للوظائف برأيك',
      'اشرحلي شنو اتعلم بكورس React',
      'ليش كورس بايثون صعب',
      'شلون اتعلم البرمجة بسرعة',
      'شنو الفرق بين كورس CSS وكورس CSS المتقدم بالتفصيل',
    ]) {
      const { r, calls, key } = await ask(q);
      check(`[COURSES] "${q}" → not answered from the course list`, !(r.body.source === 'smart' && key.startsWith('catalog:')) && (r.body.source !== 'smart' ? calls.gemini === 1 : true), `${r.body.source} ${key}`);
    }

    // كورس جديد يظهر تلقائياً في القائمة بعد توليد المعرفة (بدون تعديل كود)
    {
      const data: KnowledgeData = JSON.parse(JSON.stringify(getKnowledge().data));
      data.version = 'test-go';
      data.courses.push({
        id: 'go-basics',
        title: 'أساسيات Go',
        description: 'مقدمة في لغة Go.',
        fieldId: 'go',
        fieldName: 'لغة Go',
        difficulty: 'beginner',
        order: 1,
        pointsCost: 0,
        lessonIds: ['go-1'],
        previewLessonId: 'go-1',
      });
      data.lessons.push({ id: 'go-1', courseId: 'go-basics', title: 'المتغيرات في Go', description: '', order: 1, section: null, language: 'go', xp: 20 });
      const k = new Knowledge(data);
      const all = await ask('شنو الكورسات الموجودة؟', k);
      check('[COURSES/NEW] new course appears in the full list automatically', all.reply.includes('أساسيات Go') && all.reply.includes(`${courses.length + 1} دورة`) && all.reply.includes('**لغة Go** (1)'));
      const one = await ask('عندكم كورس Go', k);
      check('[COURSES/NEW] "عندكم كورس Go" → the new course (not "not found")', one.r.body.source === 'smart' && one.key.startsWith('course:go-basics:'), one.key);
      const before = await ask('عندكم كورس Go');
      check('[COURSES/NEW] without the new data → not invented', !before.key.startsWith('course:go-basics'), before.key);
    }
  }

  // ===== 4) أوضاع التحدي/الدرس والسياق لا تُجاب محلياً =====
  for (const mode of ['challenge-hint', 'challenge-explain', 'explain-lesson', 'code-review']) {
    const { d, calls } = deps();
    const r = await handleChat(d, { message: 'كيف اجمع كوينات', mode });
    check(`mode ${mode} never uses Smart Response`, r.body.source !== 'smart' && calls.gemini === 1);
  }

  for (const f of failures) console.log('FAIL', f);
  console.log(`\nlocal answers: DEV ${local.DEV}/${DEV_POS.length}, HOLDOUT ${local.HOLDOUT}/${HOLDOUT_POS.length}, BLIND ${local.BLIND}/${BLIND_POS.length}`);
  console.log(`negatives sent to Gemini: ${DEV_NEG.length + HOLDOUT_NEG.length + BLIND_NEG.length}`);
  console.log(`\n${pass}/${pass + fail} passed`);
  if (fail) process.exitCode = 1;
})();

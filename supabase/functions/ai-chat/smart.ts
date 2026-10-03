/**
 * Smart Response: طبقة قبل Gemini تجيب محلياً عندما تكون واثقة فقط.
 *
 * كل سؤال يمر أولاً بطبقة الفهم (understand.ts) فيتحول إلى إطار قانوني (نوع السؤال + الفعل + مفاهيم Kodax
 * + الكلمات غير المعروفة)، ثم:
 *   personal   بيانات المستخدم الحية (XP، الرصيد، الحصة...) — لا تُخزَّن أبداً في الـcache
 *   faq        الأسئلة الشائعة: مطابقة الإطار مع أطر أنماط كل رد (F-score موزون بـ IDF + قيود صارمة)
 *   smalltalk  تحيات وشكر وتعريف بالمساعد
 *   glossary   "شنو هو X؟" لمفاهيم البرمجة + رابط الدرس الذي يشرحها
 *   catalog    عدد الكورسات/الدروس/التحديات وقائمة المجالات (من المنهج)
 *   course / lesson / challenge  الكيان المقصود يُكتشف تلقائياً من المنهج (العناوين، المجالات، مستوى الدورة،
 *              والتحويل بين الأبجديتين مثل بايثون↔python) — بدون aliases يدوية لكل كورس.
 *
 * القاعدة: الرد المحلي فقط بثقة عالية (فوق العتبة، وبفارق واضح عن ثاني أفضل رد، وكل ما قاله السائل مُفسَّر).
 * ثقة متوسطة/منخفضة، أو سؤال يطلب شرحاً/كوداً/رأياً، أو متابعة لكلام سابق → null، فيذهب إلى Gemini.
 */
import { normalize, tokenize, looksLikeCode, WORD_SPLIT, canonWord } from './text.ts';
import { FAQ, type LiveConfig } from './kodax-facts.ts';
import { GLOSSARY } from './smart-glossary.ts';
import { understand, skeleton, variants, type Frame } from './understand.ts';
import type { Knowledge, KCourse, KLesson, KChallenge } from './knowledge.ts';

export type SmartKind = 'faq' | 'smalltalk' | 'glossary' | 'catalog' | 'course' | 'lesson' | 'challenge' | 'personal';

export interface SmartMatch {
  kind: SmartKind;
  id: string;
  confidence: number;
  /** نص الرد (للأنواع غير الشخصية) */
  reply?: string;
  /** للنوع personal: أي بيانات يحتاج */
  personalTopic?: PersonalTopic;
}

/** قرار Smart Response مع سببه (للاختبارات والتشخيص) */
export interface SmartDecision {
  match: SmartMatch | null;
  reason: string;
  confidence: number;
  runnerUp?: { id: string; score: number };
  frame?: Frame;
}

export type PersonalTopic = 'xp' | 'level' | 'coins' | 'quota' | 'unlocked' | 'progress' | 'streak';

export interface QuotaState {
  used: number;
  limit: number;
  remaining: number;
  base_limit?: number;
  bonus?: number;
  ads?: {
    watched: number;
    per_bonus: number;
    bonus_amount: number;
    bonuses_earned: number;
    max_bonuses: number;
    progress: number;
    can_watch: boolean;
  };
}

export interface UserSnapshot {
  xp: number;
  level: number;
  streak: number;
  coins: number;
  unlockedCourses: string[];
  completedLessons: number;
  completedChallenges: number;
  quota: QuotaState | null;
}

const DIFF_AR: Record<string, string> = { beginner: 'مبتدئة', intermediate: 'متوسطة', advanced: 'متقدمة', easy: 'سهل', medium: 'متوسط', hard: 'صعب' };

// ============================================================================
// معايير القرار (مُعايرة على مجموعة التقييم: scripts/challenge-audit/smart-eval.ts يطبع منحنى العتبة)
// ============================================================================
/** أقل F-score لقبول رد جاهز */
export const DEFAULT_FAQ_THRESHOLD = 0.78;
/** أقل فارق بين أفضل رد وثاني أفضل رد مختلف (وإلا: غامض → Gemini) */
const FAQ_MARGIN = 0.08;
/** أقل نسبة مُفسَّرة مما قاله السائل */
const MIN_QUERY_COVERAGE = 0.72;
/** أوزان أنواع الرموز: المفهوم أهم من الفعل، والفعل أهم من صيغة السؤال */
const BASE_WEIGHT: Record<string, number> = { c: 1.0, v: 0.9, a: 0.55, s: 1.0, w: 1.0 };
/** مفاهيم مساندة يجوز وجودها في السؤال دون أن تكون في النمط ("شلون افتح كورس بالكوينز") */
const SUPPORT_CONCEPTS = new Set(['app', 'coins', 'free']);

// أسئلة متابعة تعتمد على المحادثة السابقة
const FOLLOW_UP = /^(و|طيب |بس |يعني |اي |ايوه |لا )?(هذا|هاي|هذي|هذول|ذاك|هو|هي|ليش|ليه|وضح|اكثر|كمل|استمر|ثاني|الثاني|غيره|بعد|وبعدين|شلون يعني|يعني شنو|مثل شنو|تقصد)\b|الكود (اللي )?(فوق|السابق)|كلامك|قلت/;

// ============================================================================
// كيانات المنهج: مستوى الدورة يُوحَّد (أساسيات/مبتدئ/basics ← basic، متقدم/advanced ← advanced)
// ============================================================================
const LEVEL_CANON: Record<string, string> = {
  اساسيات: 'basic', اساسي: 'basic', مبتدي: 'basic', مبتدئ: 'basic', مبتدئين: 'basic', basics: 'basic', basic: 'basic', beginner: 'basic', beginners: 'basic',
  متقدم: 'advanced', متقدمه: 'advanced', advanced: 'advanced', pro: 'advanced', احترافي: 'advanced',
};
const entityWord = (w: string) => LEVEL_CANON[w] ?? w;
/** كلمات نوع الكيان (تُحذف من السؤال عند مقارنة العنوان حرفياً) */
const KIND_WORDS = new Set(['challenge', 'course', 'lesson', 'مسار', 'path', 'تحدي', 'كورس', 'دوره', 'درس']);
/** مفتاح العنوان الحرفي: كلمات قانونية مرتبة بدون كلمات التوقف (ومع dropKind: بدون "تحدي/كورس/درس") */
function surfaceKey(text: string, dropKind = false): string {
  const ws = tokenize(text).filter((w) => !ENTITY_IGNORE.has(w) && !(dropKind && KIND_WORDS.has(w)));
  return [...new Set(ws)].sort().join(' ');
}
/** كلمات لا تحدد كياناً (تُتجاهل عند مطابقة الأسماء) */
/** مفاهيم كلماتها قد تكون جزءاً من اسم دورة/درس ("مقدمة في الذكاء الاصطناعي"، "تطوير الويب")؛ تبقى كلماتها في rawWords ويجب أن تطابق العنوان */
const ENTITY_CONCEPTS = ['ai', 'platform'];
const ENTITY_IGNORE = new Set(['عندكم', 'بالتطبيق', 'تطبيق', 'kodax', 'موجود', 'موجوده', 'كامل']);

interface PatternFrame {
  intent: (typeof FAQ)[number];
  pattern: string;
  frame: Frame;
}

interface EntityDoc<T> {
  item: T;
  /** كلمات العنوان (للترتيب) */
  title: Set<string>;
  /** كل الكلمات التي تفسّر هذا الكيان (العنوان + المجال/الدورة) */
  vocab: Set<string>;
  /** كلمات العنوان الحرفية (بدون تحويلها لمفاهيم القاموس): "قائمة مهام"، "شاشة تسجيل دخول" */
  surface: string;
  /** أفعال القاموس الموجودة في العنوان نفسه ("تسجيل دخول" ← login) */
  titleVerbs: Set<string>;
}

const typeOf = (t: string) => t.slice(0, 1);
const isSubset = <T>(a: Iterable<T>, b: Set<T>) => [...a].every((x) => b.has(x));

export class SmartResponder {
  private faq: PatternFrame[] = [];
  private idf = new Map<string, number>();
  private idfDefault = 1;
  private threshold = DEFAULT_FAQ_THRESHOLD;
  private knownWords = new Set<string>();
  private glossaryByKey = new Map<string, (typeof GLOSSARY)[number]>();
  private courses: EntityDoc<KCourse>[] = [];
  private lessons: EntityDoc<KLesson>[] = [];
  private challenges: EntityDoc<KChallenge>[] = [];
  private latinVocab = new Map<string, string>(); // skeleton → كلمة لاتينية من المنهج
  private lessonSections = new Map<string, string[]>();

  constructor(private knowledge: Knowledge) {
    // 1) الكلمات الصحيحة المعروفة (لا تُصحَّح كأخطاء إملائية): كلمات الأنماط والمنهج والقاموس
    const addKnown = (text: string) => {
      for (const raw of normalize(text).split(WORD_SPLIT)) {
        const c = canonWord(raw);
        if (c) this.knownWords.add(c);
        if (raw) this.knownWords.add(raw);
      }
    };
    for (const f of FAQ) f.patterns.forEach(addKnown);
    for (const g of GLOSSARY) g.terms.forEach(addKnown);
    for (const c of knowledge.data.courses) addKnown(`${c.title} ${c.fieldName}`);
    for (const l of knowledge.data.lessons) addKnown(l.title);
    for (const ch of knowledge.data.challenges) addKnown(ch.title);
    const opts = { knownWords: this.knownWords };

    // 2) أطر الأنماط + IDF
    const df = new Map<string, number>();
    for (const intent of FAQ) {
      for (const pattern of intent.patterns) {
        const frame = understand(pattern, opts);
        if (!frame.tokens.length) continue;
        this.faq.push({ intent, pattern, frame });
        for (const t of frame.tokens) df.set(t, (df.get(t) ?? 0) + 1);
      }
    }
    const n = this.faq.length;
    for (const [t, d] of df) this.idf.set(t, Math.log(1 + n / d));
    this.idfDefault = Math.log(1 + n);

    // 3) القاموس البرمجي: نفس الإطار بدون "define"
    for (const g of GLOSSARY) for (const term of g.terms) {
      const key = this.glossaryKey(understand(term, opts));
      if (key) this.glossaryByKey.set(key, g);
    }

    // 4) كيانات المنهج (تُبنى تلقائياً من البيانات)
    const wordsOf = (text: string) => new Set(understand(text, { ...opts, implicitDefine: false }).rawWords.map(entityWord));
    const surfaceOf = (text: string) => surfaceKey(text);
    const verbsOf = (text: string) => understand(text, { ...opts, implicitDefine: false }).verbs;
    const fieldWords = new Map<string, Set<string>>();
    for (const c of knowledge.data.courses) {
      const title = wordsOf(c.title);
      const field = wordsOf(`${c.fieldName} ${c.fieldId.replace(/-/g, ' ')}`);
      fieldWords.set(c.id, field);
      this.courses.push({ item: c, title, vocab: new Set([...title, ...field]), surface: surfaceOf(c.title), titleVerbs: verbsOf(c.title) });
    }
    for (const l of knowledge.data.lessons) {
      const title = wordsOf(l.title);
      const course = this.courses.find((c) => c.item.id === l.courseId);
      this.lessons.push({ item: l, title, vocab: new Set([...title, ...(course?.vocab ?? [])]), surface: surfaceOf(l.title), titleVerbs: verbsOf(l.title) });
    }
    for (const ch of knowledge.data.challenges) {
      const title = wordsOf(ch.title);
      this.challenges.push({ item: ch, title, vocab: new Set(title), surface: surfaceOf(ch.title), titleVerbs: verbsOf(ch.title) });
    }
    const skelCount = new Map<string, Set<string>>();
    for (const d of [...this.courses, ...this.lessons]) {
      for (const w of d.vocab) {
        if (!/^[a-z][a-z0-9+#]*$/.test(w)) continue;
        const s = skeleton(w);
        if (s.length < 3) continue;
        (skelCount.get(s) ?? skelCount.set(s, new Set()).get(s)!).add(w);
      }
    }
    for (const [s, ws] of skelCount) if (ws.size === 1) this.latinVocab.set(s, [...ws][0]);

    for (const chunk of knowledge.data.chunks) {
      if (chunk.kind !== 'lesson') continue;
      const heading = chunk.title.split(' — ')[1];
      if (!heading) continue;
      const arr = this.lessonSections.get(chunk.ref) ?? [];
      if (!arr.includes(heading)) arr.push(heading);
      this.lessonSections.set(chunk.ref, arr);
    }
  }

  // ==========================================================================
  // واجهات مساعدة (اختبارات/تقييم)
  // ==========================================================================
  setThreshold(t: number) {
    this.threshold = t;
  }
  getThreshold() {
    return this.threshold;
  }
  understand(text: string): Frame {
    return understand(text, { knownWords: this.knownWords });
  }

  /** أنماط من ردود مختلفة لها نفس الإطار تماماً (يجب أن تكون صفراً) */
  patternConflicts(): string[] {
    const seen = new Map<string, string>();
    const out: string[] = [];
    for (const p of this.faq) {
      const k = p.frame.tokens.join(' ');
      const prev = seen.get(k);
      if (prev && prev !== p.intent.id) out.push(`${k}: ${prev} / ${p.intent.id} ("${p.pattern}")`);
      else seen.set(k, p.intent.id);
    }
    return out;
  }

  /** عدد الردود الجاهزة المتاحة حسب النوع */
  stats() {
    const faq = FAQ.filter((f) => !f.smallTalk).length;
    const smalltalk = FAQ.length - faq;
    const catalog = 4;
    const course = this.courses.length * 4;
    const total = FAQ.length + GLOSSARY.length + course + this.lessons.length + this.challenges.length + 7 + catalog;
    return {
      faq,
      smalltalk,
      faqPatterns: this.faq.length,
      glossary: GLOSSARY.length,
      course,
      lesson: this.lessons.length,
      challenge: this.challenges.length,
      personal: 7,
      catalog,
      total,
    };
  }

  // ==========================================================================
  // القرار
  // ==========================================================================
  match(message: string, opts: { mode?: string; hasHistory: boolean; hasContext: boolean; live: LiveConfig }): SmartMatch | null {
    return this.decide(message, opts).match;
  }

  decide(message: string, opts: { mode?: string; hasHistory: boolean; hasContext: boolean; live: LiveConfig }): SmartDecision {
    const no = (reason: string, extra: Partial<SmartDecision> = {}): SmartDecision => ({ match: null, reason, confidence: 0, ...extra });
    const mode = opts.mode ?? 'general';
    if (mode !== 'general' || opts.hasContext) return no('mode');
    const text = message.trim();
    if (!text) return no('empty');
    if (text.length > 300) return no('too_long');
    if (looksLikeCode(text)) return no('code');

    const f = this.understand(text);
    if (f.wordCount > 14) return no('too_long', { frame: f });
    const norm = f.norm.replace(/\s+/g, ' ');
    if (opts.hasHistory && f.wordCount <= 8 && FOLLOW_UP.test(norm)) return no('follow_up', { frame: f });
    // في محادثة مستمرة، كلمة/مفهوم وحيد بلا سؤال ("XP") غالباً متابعة → Gemini
    if (opts.hasHistory && f.implicitDefine && f.wordCount <= 2) return no('follow_up', { frame: f });
    if (f.depth) return no('needs_explanation', { frame: f });

    // 1) بيانات المستخدم الحية
    const personal = this.personal(f);
    if (personal) return { match: personal, reason: 'personal', confidence: 1, frame: f };

    // 2) قوائم المنهج ("شنو الكورسات المتوفرة"، "شنو المجالات")
    const listing = this.catalogList(f);
    if (listing) return { match: listing, reason: 'catalog', confidence: 0.9, frame: f };

    // 3) الأسئلة الشائعة والتحيات
    const faq = this.bestFaq(f);
    if (faq.match) {
      faq.match.reply = this.faqReply(faq.match.id, opts.live);
      return { ...faq, frame: f };
    }

    // 4) تعريف مفهوم برمجي
    const g = this.glossary(f);
    if (g) return { match: g, reason: 'glossary', confidence: 0.9, frame: f };

    // 5) كيانات المنهج: عدد، كورس، درس، تحدي
    const ent = this.entities(f, opts.live) ?? this.exactTitle(f, text, opts.live);
    if (ent) return { match: ent, reason: ent.kind, confidence: ent.confidence, frame: f };

    return no(faq.reason, { confidence: faq.confidence, runnerUp: faq.runnerUp, frame: f });
  }

  // ==========================================================================
  // الأسئلة الشائعة
  // ==========================================================================
  private weight(t: string): number {
    return (BASE_WEIGHT[typeOf(t)] ?? 1) * (this.idf.get(t) ?? this.idfDefault);
  }

  private bestFaq(q: Frame): SmartDecision {
    if (!q.tokens.length) return { match: null, reason: 'no_tokens', confidence: 0 };
    const qSet = new Set(q.tokens);
    const qSumAll = q.tokens.reduce((s, t) => s + this.weight(t), 0);
    const bestBy = new Map<string, { score: number; coverage: number; p: PatternFrame }>();

    for (const p of this.faq) {
      const pf = p.frame;
      // تحيات: تتطابق مع تحيات من نفس النوع فقط
      if (q.soft.size || pf.soft.size) {
        if (q.soft.size !== pf.soft.size || ![...q.soft].every((s) => pf.soft.has(s))) continue;
      }
      // أفعال متعارضة ("كيف افتح كورس" ≠ "كيف اشوف كورس")
      if (q.verbs.size && pf.verbs.size && ![...q.verbs].some((v) => pf.verbs.has(v))) continue;
      // كل مفاهيم النمط يجب أن تكون في السؤال، والسؤال لا يذكر مفهوماً آخر (إلا مساند)
      if (!isSubset(pf.concepts, q.concepts)) continue;
      if ([...q.concepts].some((c) => !pf.concepts.has(c) && !SUPPORT_CONCEPTS.has(c))) continue;

      // "بالتطبيق" / "in kodax" سياق لا يغيّر السؤال: لا يُحسب كلاماً غير مُفسَّر إذا غاب عن النمط
      const qSum = !pf.concepts.has('app') && q.concepts.has('app') ? qSumAll - this.weight('c:app') : qSumAll;
      let inter = 0;
      let pSum = 0;
      for (const t of pf.tokens) {
        const w = this.weight(t);
        pSum += w;
        if (qSet.has(t)) inter += w;
      }
      if (!inter) continue;
      const precision = inter / qSum; // كم مما قاله السائل مُفسَّر
      const recall = inter / pSum; // كم من معنى النمط موجود
      const score = (2 * precision * recall) / (precision + recall);
      const prev = bestBy.get(p.intent.id);
      if (!prev || score > prev.score) bestBy.set(p.intent.id, { score, coverage: precision, p });
    }

    const ranked = [...bestBy.values()].sort((a, b) => b.score - a.score);
    if (!ranked.length) return { match: null, reason: 'no_match', confidence: 0 };
    const top = ranked[0];
    const second = ranked[1];
    const runnerUp = second ? { id: second.p.intent.id, score: second.score } : undefined;
    if (top.score < this.threshold) return { match: null, reason: 'low_confidence', confidence: top.score, runnerUp };
    if (top.coverage < MIN_QUERY_COVERAGE) return { match: null, reason: 'unexplained_words', confidence: top.score, runnerUp };
    if (second && top.score < 0.97 && top.score - second.score < FAQ_MARGIN) return { match: null, reason: 'ambiguous', confidence: top.score, runnerUp };
    const intent = top.p.intent;
    return {
      match: { kind: intent.smallTalk ? 'smalltalk' : 'faq', id: intent.id, confidence: top.score, reply: undefined },
      reason: 'faq',
      confidence: top.score,
      runnerUp,
    };
  }

  // ==========================================================================
  // بيانات المستخدم (إطار + ملكية: "كم XP عندي" نعم، "شلون ازيد رصيدي" لا)
  // ==========================================================================
  private personal(f: Frame): SmartMatch | null {
    const acts = [...f.acts];
    if (acts.some((a) => a !== 'qty' && a !== 'define' && a !== 'can')) return null;
    const onlyConcepts = (allowed: string[]) => [...f.concepts].every((c) => allowed.includes(c) || c === 'app');
    const words = new Set(f.words);
    const quotaWords = ['باقي', 'متبقي', 'طلب', 'طلبات', 'سؤال', 'اسئله', 'remaining', 'left', 'استخدمت'];
    const noWords = words.size === 0;
    const pick = (topic: PersonalTopic): SmartMatch => ({ kind: 'personal', id: `personal:${topic}`, confidence: 1, personalTopic: topic });

    // الحصة: "كم باقي لي من الذكاء"، "كم طلب ذكاء باقي لي"، "حصتي"
    if ((f.concepts.has('quota') || f.concepts.has('ai') || f.concepts.has('assistant')) && onlyConcepts(['quota', 'ai', 'assistant']) && !f.verbs.size) {
      const hasQuotaWord = [...words].some((w) => quotaWords.includes(w));
      if ([...words].every((w) => quotaWords.includes(w)) && (f.own || hasQuotaWord) && (hasQuotaWord || f.concepts.has('quota'))) return pick('quota');
    }
    // تقدمي: "كم درس خلصت"، "تقدمي"
    if (f.concepts.has('progress') && f.own && onlyConcepts(['progress']) && noWords && !f.verbs.size) return pick('progress');
    if ((f.concepts.has('lesson') || f.concepts.has('challenge')) && f.verbs.has('complete') && f.verbs.size === 1 && f.acts.has('qty') && noWords && onlyConcepts(['lesson', 'challenge'])) return pick('progress');
    // الدورات المفتوحة: "شنو الكورسات اللي فتحتها"
    if (f.concepts.has('course') && f.verbs.has('unlock') && f.verbs.size === 1 && f.own && noWords && onlyConcepts(['course'])) return pick('unlocked');

    if (!f.own || f.verbs.size || !noWords) return null;
    const single: Array<[string, PersonalTopic]> = [
      ['xp', 'xp'],
      ['coins', 'coins'],
      ['level', 'level'],
      ['streak', 'streak'],
    ];
    for (const [concept, topic] of single) if (f.concepts.has(concept) && onlyConcepts([concept])) return pick(topic);
    return null;
  }

  // ==========================================================================
  // القاموس البرمجي
  // ==========================================================================
  private glossaryKey(f: Frame): string {
    return f.tokens.filter((t) => t !== 'a:define').join(' ');
  }

  private glossary(f: Frame): SmartMatch | null {
    if (f.explain || f.verbs.size || f.soft.size || f.own || f.wordCount > 8) return null;
    if ([...f.acts].some((a) => a !== 'define' && a !== 'diff')) return null;
    const key = this.glossaryKey(f);
    const g = key ? this.glossaryByKey.get(key) : undefined;
    if (!g) return null;
    const lessonId = this.knowledge.data.glossaryLessons[g.id];
    const link = lessonId ? `\n\n📘 تعلّمه بالتفصيل في ${this.knowledge.lessonLabel(lessonId)}.` : '';
    return { kind: 'glossary', id: g.id, confidence: 0.9, reply: g.answer + link };
  }

  // ==========================================================================
  // المنهج: قوائم وأعداد وكيانات
  // ==========================================================================
  private hasOnly(f: Frame, concepts: string[]) {
    return [...f.concepts].every((c) => concepts.includes(c) || c === 'app');
  }

  /** "شنو الكورسات المتوفرة"، "شنو المجالات"، "شنو الكورسات اللي عندكم" */
  private catalogList(f: Frame): SmartMatch | null {
    if (f.explain || f.words.length || f.own || f.soft.size) return null;
    // "شنو اكدر اتعلم بـ Kodax": الفعل الوحيد المسموح "اتعلم" مع "اكدر/هل/اذكر" (بدون "اول" وغيرها؛ "شلون اتعلم" ليس طلب قائمة)
    const learnOnly = f.verbs.size === 1 && f.verbs.has('learn');
    if (f.verbs.size && !learnOnly) return null;
    if (learnOnly) {
      if (!(f.acts.has('can') || f.acts.has('list')) || !this.hasOnly(f, ['course', 'path'])) return null;
      if ([...f.acts].some((a) => !['define', 'how', 'can', 'list'].includes(a))) return null;
      return { kind: 'catalog', id: 'fields', confidence: 0.9, reply: this.fieldsReply() };
    }
    if ([...f.acts].some((a) => a !== 'define' && a !== 'can' && a !== 'list')) return null;
    const subject = f.concepts.has('course') || f.concepts.has('path');
    if (!subject) return null;
    // "قائمة الدورات" (قائمة = nav في القاموس) تُقبل مع الدورات فقط
    if (!this.hasOnly(f, ['course', 'path', 'nav'])) return null;
    const listSignal = f.acts.has('can') || f.acts.has('list') || (f.plural && f.acts.has('define')) || (f.concepts.has('path') && f.plural) || f.concepts.has('nav');
    if (!listSignal) return null;
    return { kind: 'catalog', id: 'fields', confidence: 0.9, reply: this.fieldsReply() };
  }

  /**
   * أين يُذكر اسم (ليس عنوان دورة) في المنهج: الدورات التي يرد في وصفها أو دروسها، مرتبة حسب عدد المرات.
   * يُستخدم لجواب "عندكم كورس X؟" عندما لا توجد دورة بهذا الاسم — من البيانات فقط.
   */
  private coursesMentioning(w: string): KCourse[] {
    const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`);
    const count = new Map<string, number>();
    const add = (courseId: string | undefined) => courseId && count.set(courseId, (count.get(courseId) ?? 0) + 1);
    for (const c of this.knowledge.data.courses) if (re.test(normalize(c.description))) add(c.id);
    for (const ch of this.knowledge.data.chunks) {
      if (ch.kind !== 'lesson' && ch.kind !== 'code') continue;
      if (re.test(normalize(`${ch.title} ${ch.text}`))) add(this.knowledge.lessonById.get(ch.ref)?.courseId);
    }
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => this.knowledge.courseById.get(id))
      .filter((c): c is KCourse => !!c);
  }

  private notFoundReply(raw: string): string {
    const word = raw.charAt(0).toUpperCase() + raw.slice(1);
    const mentioned = this.coursesMentioning(raw).slice(0, 4);
    if (mentioned.length) {
      const names = mentioned.map((c) => `**${c.title}**`).join('، ');
      return `ما بـ Kodax دورة مخصصة لـ ${word}، بس ينذكر ضمن دروس: ${names}.\n\nاسألني عن أي دورة منها حتى أعطيك تفاصيلها، أو اكتب "شنو الكورسات" حتى أعرض لك كل الدورات.`;
    }
    return `حالياً ما بـ Kodax دورة عن ${word}. هذي الدورات المتوفرة:\n${this.fieldLines().join('\n')}\n\nإذا تحب، اسألني عن أي وحدة منها.`;
  }

  private fieldLines(): string[] {
    const byField = new Map<string, KCourse[]>();
    for (const c of this.knowledge.data.courses) (byField.get(c.fieldName) ?? byField.set(c.fieldName, []).get(c.fieldName)!).push(c);
    return [...byField.entries()].map(([field, cs]) => `- **${field}** (${cs.length}): ${cs.map((c) => c.title).join('، ')}`);
  }

  private fieldsReply(): string {
    const lines = this.fieldLines();
    return `بـ Kodax ${this.knowledge.data.courses.length} دورة في ${lines.length} مجالات:\n${lines.join('\n')}\n\nاسألني عن أي دورة حتى أعطيك عدد دروسها وسعرها.`;
  }

  private entities(f: Frame, live: LiveConfig): SmartMatch | null {
    if (f.explain || f.soft.size) return null;
    // طلب حل/مساعدة/كتابة → ليس وصف كيان
    const allowedVerbs = new Set(['unlock', 'give', 'earn', 'buy']);
    if ([...f.verbs].some((v) => !allowedVerbs.has(v))) return null;
    if (f.acts.has('why') || f.acts.has('where') || f.acts.has('diff')) return null;

    const entityWords = f.rawWords.map(entityWord).filter((w) => !ENTITY_IGNORE.has(w));
    const isQty = f.acts.has('qty');

    // أعداد عامة: "كم كورس عندكم"، "كم درس بالتطبيق"، "كم تحدي"
    if (!entityWords.length && isQty && !f.verbs.size) {
      if (this.hasOnly(f, ['course', 'path']) && (f.concepts.has('course') || f.concepts.has('path'))) {
        const fields = new Set(this.knowledge.data.courses.map((c) => c.fieldId)).size;
        return { kind: 'catalog', id: 'courses-count', confidence: 0.9, reply: `بـ Kodax ${this.knowledge.data.courses.length} دورة في ${fields} مجالات. تحب أعرض لك المجالات ودوراتها؟` };
      }
      if (this.hasOnly(f, ['lesson']) && f.concepts.has('lesson')) {
        return { kind: 'catalog', id: 'lessons-count', confidence: 0.9, reply: `بـ Kodax ${this.knowledge.data.lessons.length} درس موزعة على ${this.knowledge.data.courses.length} دورة.` };
      }
      if (this.hasOnly(f, ['challenge']) && f.concepts.has('challenge')) {
        const by: Record<string, number> = {};
        for (const ch of this.knowledge.data.challenges) by[ch.difficulty] = (by[ch.difficulty] ?? 0) + 1;
        return {
          kind: 'catalog',
          id: 'challenges-count',
          confidence: 0.9,
          reply: `بـ Kodax ${this.knowledge.data.challenges.length} تحدي: ${by.easy ?? 0} سهل، ${by.medium ?? 0} متوسط، ${by.hard ?? 0} صعب.`,
        };
      }
      return null;
    }
    if (!entityWords.length) return null;

    // تحويل كلمة عربية لاسم تقنية لاتيني من المنهج عند الحاجة (بايثون↔python، رياكت↔react)
    const resolveWords = (vocab: Set<string>) =>
      entityWords.map((w) => {
        if (vocab.has(w) || /^[a-z0-9+#]+$/.test(w)) return w;
        // حرف جر ملتصق: "لأمن الشبكات"، "بالشبكات" ← امن، شبكات
        const bare = variants(w).find((v) => vocab.has(v));
        if (bare) return bare;
        const s = skeleton(w);
        return s.length >= 3 ? this.latinVocab.get(s) ?? w : w;
      });
    const allVocab = new Set<string>();
    for (const d of [...this.courses, ...this.lessons, ...this.challenges]) d.vocab.forEach((w) => allVocab.add(w));
    const qWords = resolveWords(allVocab);

    if (f.concepts.has('challenge') && this.hasOnly(f, ['challenge', 'coins', 'xp', ...ENTITY_CONCEPTS])) {
      const r = this.pickEntity(this.challenges, qWords);
      if (r === 'none') return null;
      if (Array.isArray(r)) return this.listReply('challenge', r.map((d) => d.item.title), qWords);
      return { kind: 'challenge', id: r.item.id, confidence: 0.85, reply: this.challengeReply(r.item, live) };
    }
    // "دروس كورس X" = دروس الكورس (لا درس بعينه)
    if (f.concepts.has('lesson') && !f.concepts.has('course') && this.hasOnly(f, ['lesson', 'xp', ...ENTITY_CONCEPTS])) {
      const r = this.pickEntity(this.lessons, qWords);
      if (r !== 'none') {
        if (Array.isArray(r)) return this.listReply('lesson', r.map((d) => this.knowledge.lessonLabel(d.item.id)), qWords);
        return { kind: 'lesson', id: r.item.id, confidence: 0.85, reply: this.lessonReply(r.item) };
      }
    }
    if ((f.concepts.has('course') || f.concepts.has('path') || f.acts.has('price')) && this.hasOnly(f, ['course', 'path', 'lesson', 'coins', 'free', ...ENTITY_CONCEPTS])) {
      // "دورات الأمن السيبراني" (جمع بدون ذكر الدروس) = كل دورات المجال، لا أقربها عنواناً
      const r = this.pickEntity(this.courses, qWords, f.plural && !f.concepts.has('lesson'));
      if (r === 'none') {
        // "عندكم كورس Java؟": اسم تقنية غير موجود إطلاقاً في المنهج (لا عنوان ولا محتوى) ← نقول ذلك من البيانات ونعرض المتوفر
        if (
          !f.concepts.has('lesson') &&
          f.acts.has('can') &&
          !f.verbs.size &&
          qWords.length === 1 &&
          /^[a-z][a-z0-9+#.]*$/.test(qWords[0]) &&
          qWords[0].length >= 2 &&
          !allVocab.has(qWords[0])
        ) {
          return { kind: 'catalog', id: `not-found:${qWords[0]}`, confidence: 0.85, reply: this.notFoundReply(qWords[0]) };
        }
        // "درس المتغيرات بكورس بايثون": درس ضمن كورس
        if (!f.concepts.has('lesson')) return null;
        const l = this.pickEntity(this.lessons, qWords);
        if (l === 'none' || Array.isArray(l)) return null;
        return { kind: 'lesson', id: l.item.id, confidence: 0.85, reply: this.lessonReply(l.item) };
      }
      if (Array.isArray(r)) {
        const cs = r.map((d) => d.item);
        const lines = cs.map((c) => {
          const p = this.knowledge.priceOf(c.id, live);
          return `- **${c.title}** — ${c.lessonIds.length} درس، ${p > 0 ? `${p} كوين` : 'مجانية'}`;
        });
        return {
          kind: 'course',
          id: `list:${qWords.join('+')}`,
          confidence: 0.85,
          reply: `${f.acts.has('can') ? `إي، عندنا ${cs.length} دورات متعلقة:` : `الدورات المتعلقة (${cs.length}):`}\n${lines.join('\n')}\n\nاسأل عن وحدة منها بالاسم حتى أعطيك تفاصيلها.`,
        };
      }
      const one = this.courseReply(r.item, f, live);
      // "هل توجد دورة لأمن الشبكات؟" ← تأكيد الوجود قبل التفاصيل (لأسئلة الوصف فقط، لا السعر/العدد)
      if (f.acts.has('can') && one.id.endsWith(':about') && one.reply) one.reply = `إي، موجودة. ${one.reply}`;
      return one;
    }
    return null;
  }

  /**
   * احتياط للعناوين التي تحتوي كلمات من القاموس ("قائمة مهام"، "بناء شاشة تسجيل دخول"، "مقدمة في الذكاء الاصطناعي"):
   * السؤال = نوع الكيان (تحدي/كورس/درس) + العنوان حرفياً، بدون أي كلمة أخرى.
   * لا يجيب إذا طلب السائل شيئاً (فعل غير موجود في العنوان، لماذا/كيف/وين، شرح، ملكية).
   */
  private exactTitle(f: Frame, text: string, live: LiveConfig): SmartMatch | null {
    if (f.explain || f.soft.size || f.own) return null;
    if ([...f.acts].some((a) => a !== 'define')) return null;
    const kinds: Array<['challenge' | 'course' | 'lesson', EntityDoc<any>[]]> = [];
    if (f.concepts.has('challenge')) kinds.push(['challenge', this.challenges]);
    if (f.concepts.has('course') || f.concepts.has('path')) kinds.push(['course', this.courses]);
    if (f.concepts.has('lesson')) kinds.push(['lesson', this.lessons]);
    if (kinds.length !== 1) return null;
    const [kind, docs] = kinds[0];
    const key = surfaceKey(text, true);
    if (!key) return null;
    const hits = docs.filter((d) => d.surface === key);
    if (!hits.length || [...f.verbs].some((v) => !hits[0].titleVerbs.has(v))) return null;
    // عناوين مكررة (نفس الاسم في أكثر من مجال) ← قائمة
    if (hits.length > 1) {
      if (kind === 'course') return null;
      const labels = hits.map((d) => (kind === 'lesson' ? this.knowledge.lessonLabel(d.item.id) : d.item.title));
      return this.listReply(kind, labels, key.split(' '));
    }
    const d = hits[0];
    if (kind === 'challenge') return { kind, id: d.item.id, confidence: 0.85, reply: this.challengeReply(d.item, live) };
    if (kind === 'lesson') return { kind, id: d.item.id, confidence: 0.85, reply: this.lessonReply(d.item) };
    return this.courseReply(d.item, f, live);
  }

  /**
   * اختيار الكيان: كل كلمات السؤال الموضوعية يجب أن تُفسَّر بمفردات الكيان.
   * كيان واحد ← هو؛ عدة كيانات ← الأكثر تغطية لعنوانه إن تميّز بوضوح، وإلا قائمة (≤ 6)؛ غير ذلك ← none.
   */
  private pickEntity<T>(docs: EntityDoc<T>[], words: string[], preferList = false): EntityDoc<T> | EntityDoc<T>[] | 'none' {
    if (!words.length) return 'none';
    const cands = docs.filter((d) => words.every((w) => d.vocab.has(w)));
    if (!cands.length) return 'none';
    if (cands.length === 1) return cands[0];
    if (preferList && cands.length <= 6) return cands;
    const cov = (d: EntityDoc<T>) => {
      const hit = [...d.title].filter((w) => words.includes(w)).length;
      return d.title.size ? hit / d.title.size : 0;
    };
    const ranked = cands.map((d) => ({ d, c: cov(d) })).sort((a, b) => b.c - a.c);
    if (ranked[0].c >= 0.99 && ranked[1].c < 0.99) return ranked[0].d;
    if (ranked[0].c >= 0.5 && ranked[0].c - ranked[1].c >= 0.34) return ranked[0].d;
    return cands.length <= 6 ? cands : 'none';
  }

  private listReply(kind: 'lesson' | 'challenge', labels: string[], words: string[]): SmartMatch {
    const what = kind === 'lesson' ? 'درس' : 'تحدي';
    return {
      kind,
      id: `list:${words.join('+')}`,
      confidence: 0.8,
      reply: `أكو أكثر من ${what} مطابق:\n${labels.map((l) => `- ${l}`).join('\n')}\n\nحدد الاسم الكامل حتى أعطيك التفاصيل.`,
    };
  }

  private courseReply(c: KCourse, f: Frame, live: LiveConfig): SmartMatch {
    const price = this.knowledge.priceOf(c.id, live);
    const count = c.lessonIds.length;
    const priceLine = price > 0 ? `تنفتح بـ ${price} كوين (الدرس الأول معاينة مجانية).` : 'هذه الدورة مجانية.';
    if (f.acts.has('price') || f.concepts.has('free') || f.concepts.has('coins') || f.verbs.has('unlock') || f.verbs.has('buy')) {
      return { kind: 'course', id: `${c.id}:price`, confidence: 0.85, reply: `دورة **${c.title}**: ${priceLine}${price > 0 ? ' تفتحها من صفحة الدورة بزر الفتح.' : ''}` };
    }
    if (f.acts.has('qty') && f.concepts.has('lesson')) {
      return { kind: 'course', id: `${c.id}:count`, confidence: 0.85, reply: `دورة **${c.title}** بيها ${count} درس.` };
    }
    if (f.concepts.has('lesson')) {
      const titles = c.lessonIds.map((id, i) => `${i + 1}. ${this.knowledge.lessonById.get(id)?.title ?? id}`).join('\n');
      return { kind: 'course', id: `${c.id}:lessons`, confidence: 0.8, reply: `دروس **${c.title}** (${count}):\n${titles}` };
    }
    return {
      kind: 'course',
      id: `${c.id}:about`,
      confidence: 0.8,
      reply: `**${c.title}** — دورة ${DIFF_AR[c.difficulty] ?? c.difficulty} في مجال ${c.fieldName}، بيها ${count} درس.\n${c.description}\n\n${priceLine}`,
    };
  }

  private lessonReply(l: KLesson): string {
    const c = this.knowledge.courseById.get(l.courseId);
    const sections = (this.lessonSections.get(l.id) ?? []).slice(0, 6);
    const pos = c ? c.lessonIds.indexOf(l.id) + 1 : 0;
    return [
      `**${l.title}**${c ? ` — الدرس ${pos} من دورة ${c.title}` : ''}`,
      l.description,
      sections.length ? `يغطي: ${sections.join('، ')}.` : '',
      `يعطيك ${l.xp} نقطة XP عند أول إكمال.`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  private challengeReply(ch: KChallenge, live: LiveConfig): string {
    const req = ch.requiredCourseId ? this.knowledge.courseById.get(ch.requiredCourseId) : null;
    const coins = live.challenge_rewards[ch.difficulty as 'easy' | 'medium' | 'hard'];
    const desc = ch.description.length > 450 ? ch.description.slice(0, 450).trimEnd() + '…' : ch.description;
    return [
      `**${ch.title}** — تحدي ${DIFF_AR[ch.difficulty] ?? ch.difficulty} بلغة ${ch.language}`,
      desc,
      req ? `🔒 يحتاج فتح دورة **${req.title}**.` : '✅ تحدي مجاني.',
      `أول حل صحيح: ${ch.points} نقطة XP${typeof coins === 'number' ? ` و${coins} كوين` : ''}.`,
      'إذا تحتاج مساعدة، افتح التحدي واستخدم "تلميح" بمساعد التحدي.',
    ].join('\n');
  }

  /** نص رد الأسئلة الشائعة (يُبنى بالإعدادات الحية) */
  faqReply(id: string, live: LiveConfig): string | undefined {
    return FAQ.find((f) => f.id === id)?.answer(live);
  }

  /** رد بيانات المستخدم الحية */
  personalReply(topic: PersonalTopic, s: UserSnapshot, live: LiveConfig): string {
    void live;
    switch (topic) {
      case 'xp': {
        const next = Math.pow(s.level + 1, 2) * 100;
        return `عندك **${s.xp}** نقطة XP، ومستواك ${s.level}. المستوى ${s.level + 1} يحتاج ${next} نقطة XP.`;
      }
      case 'level': {
        const next = Math.pow(s.level + 1, 2) * 100;
        return `مستواك **${s.level}**، وعندك ${s.xp} نقطة XP. باقي لك ${Math.max(0, next - s.xp)} نقطة للمستوى ${s.level + 1}.`;
      }
      case 'coins':
        return `رصيدك **${s.coins} كوين**.`;
      case 'quota': {
        const q = s.quota;
        if (!q) return 'ما كدرت أجيب حصتك هسه، شوفها أعلى صفحة المساعد.';
        const more = q.ads?.can_watch ? ` وتكدر تزيدها +${q.ads.bonus_amount} بمشاهدة ${q.ads.per_bonus} إعلانات.` : '';
        return `استخدمت **${q.used} / ${q.limit}** من طلبات الذكاء اليوم (باقي ${q.remaining}).${more} الردود الفورية مثل هذا ما تنحسب.`;
      }
      case 'unlocked': {
        const names = s.unlockedCourses.map((id) => this.knowledge.courseById.get(id)?.title ?? id);
        return names.length
          ? `الدورات اللي فتحتها بالكوينات (${names.length}):\n${names.map((n) => `- ${n}`).join('\n')}\n\nوالدورات المبتدئة مجانية ومفتوحة للكل.`
          : 'ما فتحت أي دورة بالكوينات لحد هسه. الدورات المبتدئة مجانية، والباقي تفتحها من صفحة الدورة.';
      }
      case 'progress':
        return `أكملت **${s.completedLessons} درس** و**${s.completedChallenges} تحدي**. كمّل 💪`;
      case 'streak':
        return s.streak > 0 ? `سلسلتك **${s.streak} يوم** متتالي 🔥 لا تقطعها!` : 'ما عندك سلسلة حالياً. كمّل درس اليوم حتى تبدأ سلسلة جديدة 🔥';
    }
  }
}

// للتوافق: tokenize كان يُستورد من هنا في بعض الأدوات
export { tokenize };

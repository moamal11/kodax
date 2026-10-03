/** نسخة المطابق القديم (قبل طبقة الفهم) للمقارنة في smart-eval.ts فقط — لا تُنشر مع الدالة. */
/**
 * Smart Response: طبقة قبل Gemini تجيب محلياً عندما تكون واثقة.
 *
 * أنواع الردود الجاهزة:
 *   faq        أسئلة شائعة عن Kodax والمساعد (kodax-facts.ts) — أرقامها من الإعدادات الحية
 *   smalltalk  تحيات وشكر وتعريف بالمساعد
 *   glossary   "شنو هو X؟" لمفاهيم البرمجة (smart-glossary.ts) + رابط الدرس الذي يشرحها
 *   course     وصف/عدد دروس/سعر وفتح/قائمة دروس كل دورة (من المنهج + السعر الحي)
 *   lesson     عن شنو درس معيّن (من المنهج)
 *   challenge  المطلوب في تحدٍ معيّن وشروط فتحه (بدون الحل)
 *   personal   بيانات المستخدم الحية (XP، الرصيد، الحصة...) — لا تُخزَّن أبداً في الـcache
 *
 * القاعدة: إذا لم يكن الرد واضحاً بثقة عالية، أو كان السؤال يحتاج شرحاً/تحليل كود/سياق محادثة
 * → null، والطلب يذهب إلى Gemini.
 */
import { normalize, tokenize, looksLikeCode, wordCount } from './text-baseline';
import { FAQ, type LiveConfig } from '../../../supabase/functions/ai-chat/kodax-facts';
import { GLOSSARY } from '../../../supabase/functions/ai-chat/smart-glossary';
import type { Knowledge, KCourse, KLesson, KChallenge } from '../../../supabase/functions/ai-chat/knowledge';

export type SmartKind = 'faq' | 'smalltalk' | 'glossary' | 'course' | 'lesson' | 'challenge' | 'personal';

export interface SmartMatch {
  kind: SmartKind;
  id: string;
  confidence: number;
  /** نص الرد (للأنواع غير الشخصية) */
  reply?: string;
  /** للنوع personal: أي بيانات يحتاج */
  personalTopic?: PersonalTopic;
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

// أسئلة تحتاج شرحاً أو كتابة/تحليل كود → Gemini
const REASONING = /(اشرح|اشرحلي|وضح|وضحلي|فسر|بالتفصيل|تفصيل|مثال|امثله|اكتب|اكتبلي|سويلي|سوي لي|صحح|حلل|قارن|explain|example|write|debug|why|compare|implement)/;
// أسئلة متابعة تعتمد على المحادثة السابقة
const FOLLOW_UP = /^(و|طيب |بس |يعني |اي |ايوه |لا )?(هذا|هاي|هذي|هذول|ذاك|هو|هي|ليش|ليه|وضح|اكثر|كمل|استمر|ثاني|غيره|بعد|وبعدين|شلون يعني|يعني شنو|مثل شنو)\b|الكود (اللي )?(فوق|السابق)|كلامك|قلت/;
// كلمات سؤال التعريف (تُحذف قبل مطابقة المصطلح)
const DEFINE_WORDS = new Set(['شنو', 'شو', 'ما', 'ماذا', 'هو', 'هي', 'يعني', 'معني', 'معنى', 'تعريف', 'عرف', 'عرفلي', 'شنو هو', 'what', 'is', 'are', 'define', 'meaning', 'of', 'the', 'a', 'an', 'مفهوم', 'المقصود', 'بـ', 'ب', 'شنهو', 'شنوه', 'اشنو']);

// ملكية: "عندي/مالي/لدي" قريبة من الموضوع (بأي ترتيب)
const own = (topic: string) =>
  new RegExp(`((عندي|لدي|مالي|مالتي|الي)\\s+(\\S+\\s+){0,2}(${topic})|(${topic})\\S*\\s+(\\S+\\s+){0,2}(عندي|لدي|مالي|مالتي))`);

const PERSONAL_RULES: Array<{ topic: PersonalTopic; re: RegExp }> = [
  { topic: 'quota', re: /(حصتي|باقي لي|باقيلي|كم طلب باقي|شكد باقي|كم سؤال باقي|my (ai )?(quota|limit))/ },
  { topic: 'coins', re: new RegExp(`(رصيدي|كويناتي|coins مالتي|my (coins|balance)|${own('كوين|coins|رصيد').source})`) },
  { topic: 'level', re: new RegExp(`(مستواي|ليفلي|my level|${own('level|ليفل|مستوي').source})`) },
  { topic: 'xp', re: new RegExp(`(نقاطي|خبرتي|my xp|${own('xp').source})`) },
  { topic: 'unlocked', re: /(الكورسات (اللي )?(فتحتها|المفتوحه عندي)|شنو فاتح|course (اللي )?فتحته|الدورات المفتوحه عندي|my unlocked)/ },
  { topic: 'progress', re: /(كم درس (خلصت|كملت|اكملت|انهيت)|تقدمي|كم تحدي (حليت|خلصت)|my progress)/ },
  { topic: 'streak', re: /(سلسلتي|الستريك مالي|كم ستريك|streak مالي|كم يوم متتالي|my streak)/ },
];

const setOf = (tokens: string[]) => new Set(tokens);
const isSubset = (a: Set<string>, b: Set<string>) => [...a].every((x) => b.has(x));

interface FaqPattern {
  intent: (typeof FAQ)[number];
  norm: string;
  tokens: Set<string>;
}

export class SmartResponder {
  private faqPatterns: FaqPattern[] = [];
  private faqIdf = new Map<string, number>();
  private glossaryByKey = new Map<string, (typeof GLOSSARY)[number]>();
  private courseAliases: Array<{ course: KCourse; tokens: Set<string> }> = [];
  private lessonTitles: Array<{ lesson: KLesson; tokens: Set<string> }> = [];
  private challengeTitles: Array<{ challenge: KChallenge; tokens: Set<string> }> = [];
  private lessonSections = new Map<string, string[]>();

  constructor(private knowledge: Knowledge) {
    const df = new Map<string, number>();
    for (const intent of FAQ) {
      for (const p of intent.patterns) {
        const tokens = setOf(tokenize(p));
        this.faqPatterns.push({ intent, norm: normalize(p), tokens });
        for (const t of tokens) df.set(t, (df.get(t) ?? 0) + 1);
      }
    }
    const n = this.faqPatterns.length;
    for (const [t, d] of df) this.faqIdf.set(t, Math.log(1 + n / d));

    for (const g of GLOSSARY) for (const term of g.terms) this.glossaryByKey.set(this.termKey(term), g);

    for (const c of knowledge.data.courses) {
      this.courseAliases.push({ course: c, tokens: setOf(tokenize(c.title)) });
    }
    for (const l of knowledge.data.lessons) {
      const tokens = setOf(tokenize(l.title));
      if (tokens.size >= 2) this.lessonTitles.push({ lesson: l, tokens });
    }
    for (const ch of knowledge.data.challenges) {
      const tokens = setOf(tokenize(ch.title));
      if (tokens.size >= 2) this.challengeTitles.push({ challenge: ch, tokens });
    }
    for (const chunk of knowledge.data.chunks) {
      if (chunk.kind !== 'lesson') continue;
      const heading = chunk.title.split(' — ')[1];
      if (!heading) continue;
      const arr = this.lessonSections.get(chunk.ref) ?? [];
      if (!arr.includes(heading)) arr.push(heading);
      this.lessonSections.set(chunk.ref, arr);
    }
  }

  /** عدد الردود الجاهزة المتاحة حسب النوع (للتقرير والاختبارات) */
  stats() {
    const faq = FAQ.filter((f) => !f.smallTalk).length;
    const smalltalk = FAQ.length - faq;
    return {
      faq,
      smalltalk,
      faqPatterns: this.faqPatterns.length,
      glossary: GLOSSARY.length,
      course: this.knowledge.data.courses.length * 4,
      lesson: this.lessonTitles.length,
      challenge: this.challengeTitles.length,
      personal: PERSONAL_RULES.length,
      total:
        FAQ.length + GLOSSARY.length + this.knowledge.data.courses.length * 4 + this.lessonTitles.length + this.challengeTitles.length + PERSONAL_RULES.length,
    };
  }

  private termKey(text: string): string {
    return [...new Set(tokenize(text).filter((t) => !DEFINE_WORDS.has(t)))].sort().join(' ');
  }

  private faqScore(q: Set<string>, p: FaqPattern): number {
    let inter = 0;
    let union = 0;
    const all = new Set([...q, ...p.tokens]);
    for (const t of all) {
      const w = this.faqIdf.get(t) ?? Math.log(1 + this.faqPatterns.length);
      if (q.has(t) && p.tokens.has(t)) inter += w;
      union += w;
    }
    return union ? inter / union : 0;
  }

  /**
   * يحاول الإجابة محلياً. null = اذهب إلى Gemini.
   * mode: أوضاع التحديات والدروس تحتاج تحليلاً دائماً، فلا تُجاب محلياً.
   */
  match(message: string, opts: { mode?: string; hasHistory: boolean; hasContext: boolean; live: LiveConfig }): SmartMatch | null {
    const mode = opts.mode ?? 'general';
    if (mode !== 'general' || opts.hasContext) return null;
    const text = message.trim();
    if (!text || text.length > 300 || looksLikeCode(text)) return null;
    const norm = normalize(text).replace(/[؟?!.,،]+/g, ' ').replace(/\s+/g, ' ').trim();
    const words = wordCount(norm);
    if (words > 14) return null;
    if (opts.hasHistory && words <= 8 && FOLLOW_UP.test(norm)) return null;

    // 1) بيانات المستخدم الحية
    for (const r of PERSONAL_RULES) {
      if (r.re.test(norm)) return { kind: 'personal', id: `personal:${r.topic}`, confidence: 1, personalTopic: r.topic };
    }

    const qTokens = setOf(tokenize(norm));
    const reasoning = REASONING.test(norm);

    // 2) الأسئلة الشائعة والتحيات
    const best = new Map<string, number>();
    for (const p of this.faqPatterns) {
      const s = p.norm === norm ? 1 : qTokens.size ? this.faqScore(qTokens, p) : 0;
      if (s > (best.get(p.intent.id) ?? 0)) best.set(p.intent.id, s);
    }
    const ranked = [...best.entries()].sort((a, b) => b[1] - a[1]);
    if (ranked.length) {
      const [topId, topScore] = ranked[0];
      const second = ranked[1]?.[1] ?? 0;
      if (topScore >= 0.72 && (topScore >= 0.95 || topScore - second >= 0.1)) {
        const intent = FAQ.find((f) => f.id === topId)!;
        return { kind: intent.smallTalk ? 'smalltalk' : 'faq', id: intent.id, confidence: topScore, reply: intent.answer(opts.live) };
      }
    }

    if (reasoning) return null;

    // 3) تعريف مفهوم برمجي
    const key = this.termKey(norm);
    const g = key ? this.glossaryByKey.get(key) : undefined;
    if (g && words <= 8) {
      const lessonId = this.knowledge.data.glossaryLessons[g.id];
      const link = lessonId ? `\n\n📘 تعلّمه بالتفصيل في ${this.knowledge.lessonLabel(lessonId)}.` : '';
      return { kind: 'glossary', id: g.id, confidence: 0.9, reply: g.answer + link };
    }

    // 4) تحدٍ معيّن
    if (qTokens.has('challenge')) {
      const ch = this.bestTitle(this.challengeTitles, qTokens, (x) => x.challenge);
      if (ch) return { kind: 'challenge', id: ch.id, confidence: 0.85, reply: this.challengeReply(ch, opts.live) };
    }

    // 5) دورة معيّنة
    const course = this.bestTitle(this.courseAliases, qTokens, (x) => x.course);
    if (course && (qTokens.has('course') || qTokens.has('lesson') || /(سعر|كوين|coins|افتح|مقفول|مجاني|كم|شكد|دروس)/.test(norm))) {
      return this.courseReply(course, norm, qTokens, opts.live);
    }

    // 6) درس معيّن
    if (qTokens.has('lesson') || words <= 6) {
      const candidates = this.lessonTitles.filter((x) => isSubset(x.tokens, qTokens));
      if (candidates.length) {
        const maxSize = Math.max(...candidates.map((c) => c.tokens.size));
        const top = candidates.filter((c) => c.tokens.size === maxSize).map((c) => c.lesson);
        const narrowed = course ? top.filter((l) => l.courseId === course.id) : top;
        const pick = narrowed.length ? narrowed : top;
        if (pick.length === 1 && (qTokens.has('lesson') || maxSize >= 3)) {
          return { kind: 'lesson', id: pick[0].id, confidence: 0.85, reply: this.lessonReply(pick[0]) };
        }
        if (pick.length > 1 && pick.length <= 5 && qTokens.has('lesson')) {
          const list = pick.map((l) => `- ${this.knowledge.lessonLabel(l.id)}`).join('\n');
          return { kind: 'lesson', id: pick.map((l) => l.id).join(','), confidence: 0.75, reply: `أكو أكثر من درس بهذا الاسم:\n${list}\n\nحدد الدورة حتى أعطيك تفاصيل الدرس.` };
        }
      }
    }
    return null;
  }

  private bestTitle<T, R>(items: Array<T & { tokens: Set<string> }>, q: Set<string>, get: (x: T) => R): R | null {
    let best: (T & { tokens: Set<string> }) | null = null;
    let tie = false;
    for (const it of items) {
      if (!it.tokens.size || !isSubset(it.tokens, q)) continue;
      if (!best || it.tokens.size > best.tokens.size) {
        best = it;
        tie = false;
      } else if (it.tokens.size === best.tokens.size) tie = true;
    }
    return best && !tie ? get(best) : null;
  }

  private courseReply(c: KCourse, norm: string, q: Set<string>, live: LiveConfig): SmartMatch {
    const price = this.knowledge.priceOf(c.id, live);
    const count = c.lessonIds.length;
    const priceLine = price > 0 ? `تنفتح بـ ${price} كوين (الدرس الأول معاينة مجانية).` : 'هذه الدورة مجانية.';
    if (/(سعر|كوين|coins|افتح|افتحه|مقفول|مجاني|اشتري)/.test(norm)) {
      return { kind: 'course', id: `${c.id}:price`, confidence: 0.85, reply: `دورة **${c.title}**: ${priceLine}${price > 0 ? ' تفتحها من صفحة الدورة بزر الفتح.' : ''}` };
    }
    if (/(كم|شكد|عدد)/.test(norm) && q.has('lesson')) {
      return { kind: 'course', id: `${c.id}:count`, confidence: 0.85, reply: `دورة **${c.title}** بيها ${count} درس.` };
    }
    if (/دروس/.test(norm) || /(شنو|ما) (الدروس|دروس)/.test(norm)) {
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

  /** رد بيانات المستخدم الحية */
  personalReply(topic: PersonalTopic, s: UserSnapshot, live: LiveConfig): string {
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

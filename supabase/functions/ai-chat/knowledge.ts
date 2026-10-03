/**
 * معرفة Kodax للمساعد: تحميل المعرفة المولَّدة من المنهج + بحث BM25 محلي.
 * يُرسل لـ Gemini فقط الجزء المرتبط بالسؤال (Retrieval)، لا كل المحتوى.
 *
 * مصدر الكورسات والدروس والتحديات: knowledge.generated.ts، يولّده
 *   npx tsx scripts/build-ai-knowledge.ts
 * من نفس بيانات التطبيق (ALL_COURSES / ALL_LESSONS / ALL_CHALLENGES). إضافة درس للمنهج ثم إعادة
 * التوليد = يصبح متاحاً للمساعد. لا يوجد نسخ يدوي للمحتوى.
 */
import { tokenize } from './text.ts';
import { FACTS, type LiveConfig } from './kodax-facts.ts';

export interface KCourse {
  id: string;
  title: string;
  description: string;
  fieldId: string;
  fieldName: string;
  difficulty: string;
  order: number;
  /** السعر الأولي في المنهج (السعر الفعلي الحالي من LiveConfig.prices) */
  pointsCost: number;
  lessonIds: string[];
  previewLessonId: string | null;
}

export interface KLesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  section: string | null;
  language: string;
  xp: number;
}

export interface KChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  language: string;
  category: string | null;
  /** null = تحدٍ مجاني؛ غير ذلك الدورة المطلوبة (نفس قاعدة التطبيق والسيرفر) */
  requiredCourseId: string | null;
}

export interface KChunk {
  id: string;
  kind: 'course' | 'lesson' | 'code' | 'challenge' | 'fact';
  /** معرّف الدرس أو التحدي أو الدورة أو الحقيقة */
  ref: string;
  title: string;
  text: string;
}

export interface KnowledgeData {
  version: string;
  courses: KCourse[];
  lessons: KLesson[];
  challenges: KChallenge[];
  chunks: KChunk[];
  /** ربط مصطلحات القاموس بالدرس الذي يشرحها */
  glossaryLessons: Record<string, string>;
}

// ============================================================================
// BM25
// ============================================================================
interface Doc {
  chunk: KChunk;
  tf: Map<string, number>;
  len: number;
}

export class SearchIndex {
  private docs: Doc[] = [];
  private df = new Map<string, number>();
  private avgLen = 1;

  constructor(chunks: KChunk[]) {
    let total = 0;
    for (const chunk of chunks) {
      // العنوان يُكرر ليرفع وزنه
      const tokens = tokenize(`${chunk.title} ${chunk.title} ${chunk.text}`);
      const tf = new Map<string, number>();
      for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
      for (const t of tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
      this.docs.push({ chunk, tf, len: tokens.length });
      total += tokens.length;
    }
    this.avgLen = Math.max(1, total / Math.max(1, this.docs.length));
  }

  idf(term: string): number {
    const n = this.docs.length;
    const df = this.df.get(term) ?? 0;
    return Math.log(1 + (n - df + 0.5) / (df + 0.5));
  }

  search(
    query: string,
    opts: { limit?: number; kinds?: KChunk['kind'][]; boostRefs?: Set<string> } = {}
  ): Array<{ chunk: KChunk; score: number }> {
    const terms = [...new Set(tokenize(query))];
    if (!terms.length) return [];
    const k1 = 1.2;
    const b = 0.75;
    const out: Array<{ chunk: KChunk; score: number }> = [];
    for (const d of this.docs) {
      if (opts.kinds && !opts.kinds.includes(d.chunk.kind)) continue;
      let s = 0;
      for (const t of terms) {
        const f = d.tf.get(t);
        if (!f) continue;
        s += this.idf(t) * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / this.avgLen)));
      }
      if (s > 0 && opts.boostRefs?.has(d.chunk.ref)) s *= 1.5;
      if (s > 0) out.push({ chunk: d.chunk, score: s });
    }
    out.sort((a, b2) => b2.score - a.score);
    return out.slice(0, opts.limit ?? 8);
  }
}

// ============================================================================
// Knowledge
// ============================================================================
export class Knowledge {
  readonly data: KnowledgeData;
  readonly courseById = new Map<string, KCourse>();
  readonly lessonById = new Map<string, KLesson>();
  readonly challengeById = new Map<string, KChallenge>();
  private index: SearchIndex;

  constructor(data: KnowledgeData) {
    this.data = data;
    for (const c of data.courses) this.courseById.set(c.id, c);
    for (const l of data.lessons) this.lessonById.set(l.id, l);
    for (const ch of data.challenges) this.challengeById.set(ch.id, ch);
    const factChunks: KChunk[] = FACTS.map((f) => ({
      id: `fact:${f.id}`,
      kind: 'fact',
      ref: f.id,
      title: f.title,
      // نص البحث = الكلمات المفتاحية (النص الفعلي يُبنى من LiveConfig وقت الإرسال)
      text: f.keywords,
    }));
    this.index = new SearchIndex([...data.chunks, ...factChunks]);
  }

  get version(): string {
    return this.data.version;
  }

  search(query: string, opts?: Parameters<SearchIndex['search']>[1]) {
    return this.index.search(query, opts);
  }

  /** وصف قصير لموقع الدرس: "درس X — دورة Y" */
  lessonLabel(lessonId: string): string {
    const l = this.lessonById.get(lessonId);
    if (!l) return lessonId;
    const c = this.courseById.get(l.courseId);
    return `درس "${l.title}"${c ? ` — دورة ${c.title}` : ''}`;
  }

  priceOf(courseId: string, live: LiveConfig): number {
    const p = live.prices[courseId];
    return typeof p === 'number' ? p : this.courseById.get(courseId)?.pointsCost ?? 0;
  }

  /**
   * سياق مختصر مرتبط بالسؤال لإرساله إلى Gemini.
   * يرجع النص + هل استُخدمت بيانات حية (أسعار/إعدادات) — هذه لا تُخزَّن في الـcache.
   */
  buildContext(
    query: string,
    live: LiveConfig,
    opts: { maxChars?: number; boostRefs?: Set<string> } = {}
  ): { text: string; usedLive: boolean; refs: string[] } {
    const maxChars = opts.maxChars ?? 6000;
    const hits = this.search(query, { limit: 10, boostRefs: opts.boostRefs });
    if (!hits.length) return { text: '', usedLive: false, refs: [] };
    const top = hits[0].score;
    const parts: string[] = [];
    const refs: string[] = [];
    let used = 0;
    let usedLive = false;
    const seen = new Set<string>();
    for (const h of hits) {
      // نتائج ضعيفة مقارنة بالأفضل لا تُرسل (توفير tokens وتقليل التشويش)
      if (h.score < top * 0.45 || h.score < 1.5) break;
      if (seen.has(h.chunk.id)) continue;
      seen.add(h.chunk.id);
      let block: string;
      if (h.chunk.kind === 'fact') {
        const fact = FACTS.find((f) => f.id === h.chunk.ref);
        if (!fact) continue;
        block = `[معلومة عن Kodax: ${fact.title}]\n${fact.text(live)}`;
        usedLive = true;
      } else if (h.chunk.kind === 'course') {
        const c = this.courseById.get(h.chunk.ref);
        const price = c ? this.priceOf(c.id, live) : 0;
        block = `[دورة: ${h.chunk.title}]\n${h.chunk.text}\nالسعر الحالي: ${price > 0 ? `${price} كوين` : 'مجانية'}`;
        usedLive = true;
      } else if (h.chunk.kind === 'challenge') {
        block = `[تحدي: ${h.chunk.title}]\n${h.chunk.text}`;
      } else {
        block = `[${h.chunk.kind === 'code' ? 'مثال كود من ' : ''}${this.lessonLabel(h.chunk.ref)}]\n${h.chunk.text}`;
      }
      if (used + block.length > maxChars) {
        if (!parts.length) parts.push(block.slice(0, maxChars));
        break;
      }
      parts.push(block);
      refs.push(h.chunk.ref);
      used += block.length;
    }
    return { text: parts.join('\n\n'), usedLive, refs };
  }
}

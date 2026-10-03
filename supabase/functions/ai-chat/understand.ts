/**
 * طبقة فهم السؤال المحلية (بدون Gemini): تحوّل أي صياغة إلى "إطار" من رموز قانونية.
 *
 *   understand("شنو المقصود بـ XP؟")  →  { tokens: ['a:define','c:xp'], ... }
 *   understand("what does xp mean")    →  { tokens: ['a:define','c:xp'], ... }
 *   understand("ما معنى نقاط الخبرة")  →  { tokens: ['a:define','c:xp'], ... }
 *
 * المراحل: تطبيع (عربي/عراقي/لاتيني) ← مطابقة عبارات من القاموس (الأطول أولاً، مع قص البادئات واللواحق العربية)
 *          ← كلمات غير معروفة: إصلاح أخطاء إملائية صوتياً ← إطار مرتب بأنواع الرموز.
 * الإطار يُستخدم لمطابقة الردود الجاهزة (smart.ts) ولتحديد الكورس/الدرس/التحدي المقصود.
 */
import { normalize, canonWord, WORD_SPLIT } from './text.ts';
import { LEXICON, DEPTH_WORDS, DEPTH_PHRASES, type Kind } from './lexicon.ts';

export interface Frame {
  /** رموز مرتبة وفريدة: c:xp، v:earn، a:how، s:greet، w:كلمة */
  tokens: string[];
  concepts: Set<string>;
  verbs: Set<string>;
  acts: Set<string>;
  soft: Set<string>;
  /** كلمات غير موجودة في القاموس (بشكلها القانوني) */
  words: string[];
  /** كل كلمات السؤال الموضوعية (بما فيها المفاهيم ذات entity) لمطابقة أسماء الكورسات والدروس */
  rawWords: string[];
  explain: boolean;
  depth: boolean;
  plural: boolean;
  own: boolean;
  /** صُحّح خطأ إملائي واحد على الأقل */
  typo: boolean;
  /** هل أُضيف نوع السؤال "define" ضمنياً (كلمة/مفهوم وحيد) */
  implicitDefine: boolean;
  wordCount: number;
  norm: string;
}

interface Hit {
  kind: Kind;
  id: string;
  own?: boolean;
  entity?: boolean;
}

// ============================================================================
// فهرس القاموس
// ============================================================================
const words = (text: string): string[] => normalize(text).split(WORD_SPLIT).filter(Boolean);

const PHRASES = new Map<string, Hit>();
export const LEXICON_CONFLICTS: string[] = [];
let MAX_N = 1;
for (const e of LEXICON) {
  const add = (form: string, own: boolean) => {
    const ws = words(form);
    if (!ws.length) return;
    const key = ws.join(' ');
    const prev = PHRASES.get(key);
    if (prev && (prev.kind !== e.kind || prev.id !== e.id)) LEXICON_CONFLICTS.push(`"${key}": ${prev.kind}:${prev.id} / ${e.kind}:${e.id}`);
    PHRASES.set(key, { kind: e.kind, id: e.id, own: own || undefined, entity: e.entity });
    if (ws.length > MAX_N) MAX_N = ws.length;
  };
  for (const f of e.forms) add(f, false);
  for (const f of e.own ?? []) add(f, true);
}

const DEPTH_SET = new Set([...DEPTH_WORDS].map((w) => words(w).join(' ')));
const DEPTH_PHR = DEPTH_PHRASES.map((p) => words(p).join(' '));
const DANGLING = new Set(['ال', 'وال', 'بال', 'لل', 'كال', 'فال']);
const PLURAL_SET = new Set(
  ['دروس', 'كورسات', 'دورات', 'تحديات', 'مجالات', 'مسارات', 'lessons', 'courses', 'challenges', 'paths', 'fields', 'مناهج'].map((w) => words(w).join(' '))
);

// ============================================================================
// أشكال الكلمة العربية (قص البادئات واللواحق) للبحث في القاموس
// ============================================================================
const PREFIXES = ['وال', 'بال', 'كال', 'فال', 'لل', 'ال', 'و', 'ب', 'ل', 'ف', 'ك'];
const SUFFIXES = ['ات', 'ين', 'ون', 'ان', 'ها', 'هم', 'كم', 'نا', 'ي', 'ك', 'ه'];

export function variants(w: string): string[] {
  const out: string[] = [w];
  const seen = new Set(out);
  const push = (x: string) => {
    if (x.length >= 2 && !seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  };
  const bases = [w];
  for (const p of PREFIXES) {
    if (w.startsWith(p) && w.length - p.length >= 3) {
      push(w.slice(p.length));
      bases.push(w.slice(p.length));
    }
  }
  // و + ال (والكوينز) ، ب + ال ...
  if (w.startsWith('و') && w.length > 4) {
    const r = w.slice(1);
    if (r.startsWith('ال') && r.length - 2 >= 3) push(r.slice(2));
  }
  for (const b of bases) {
    for (const s of SUFFIXES) {
      if (b.endsWith(s) && b.length - s.length >= 3 && b.length >= 5) {
        const base = b.slice(0, b.length - s.length);
        push(base);
        // التاء المربوطة تصير تاءً مع الضمير: صورتي ← صوره
        if (base.endsWith('ت') && base.length >= 3) push(base.slice(0, -1) + 'ه');
      }
    }
  }
  return out;
}

/** بحث كلمة واحدة في القاموس (الشكل الحرفي أولاً ثم الأشكال المقصوصة) */
function lookupWord(w: string): Hit | undefined {
  for (const v of variants(w)) {
    const h = PHRASES.get(v);
    if (h) return h;
  }
  return undefined;
}

// ============================================================================
// إصلاح الأخطاء الإملائية (صوتياً) + مطابقة عبر الأبجديتين (بايثون ↔ python)
// ============================================================================
const FOLD: Record<string, string> = {
  س: 's', ص: 's', ز: 's', ث: 't', ت: 't', ط: 't', د: 'd', ض: 'd', ذ: 'z', ظ: 'z', ك: 'k', ق: 'k', ا: 'a', أ: 'a', ع: 'a', ء: 'a',
};
const fold = (w: string) => [...w].map((c) => FOLD[c] ?? c).join('');

function lev(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

const FUZZY: Array<{ form: string; folded: string; hit: Hit }> = [];
for (const [key, hit] of PHRASES) {
  if (!key.includes(' ') && key.length >= 5 && hit.kind !== 's' && hit.kind !== 'f') FUZZY.push({ form: key, folded: fold(key), hit });
}

function fuzzyHit(w: string): Hit | undefined {
  if (w.length < 5 || /^[0-9]+$/.test(w)) return undefined;
  const fw = fold(w);
  const max = w.length >= 9 ? 2 : 1;
  let best: Hit | undefined;
  let bestD = max + 1;
  let tie = false;
  for (const f of FUZZY) {
    const d = lev(fw, f.folded, max);
    if (d > max) continue;
    if (d < bestD) {
      best = f.hit;
      bestD = d;
      tie = false;
    } else if (d === bestD && best && (best.kind !== f.hit.kind || best.id !== f.hit.id)) tie = true;
  }
  return best && !tie ? best : undefined;
}

/** هيكل صوتي (حروف ساكنة فقط، موحّدة) لمقارنة كلمة عربية بكلمة لاتينية: بايثون ↔ python، رياكت ↔ react */
const AR_SKEL: Record<string, string> = {
  ب: 'b', ت: 't', ث: 't', ج: 'j', ح: 'h', خ: 'x', د: 'd', ذ: 'd', ر: 'r', ز: 's', س: 's', ش: 'x', ص: 's', ض: 'd', ط: 't', ظ: 'd', ع: '', غ: 'g', ف: 'f', ق: 'k', ك: 'k',
  ل: 'l', م: 'm', ن: 'n', ه: 'h', ا: '', و: '', ي: '', ء: '',
};
export function skeleton(w: string): string {
  let s = '';
  if (/^[a-z0-9+#]+$/.test(w)) {
    s = w
      .replace(/th/g, 't')
      .replace(/sh/g, 'x')
      .replace(/kh/g, 'x')
      .replace(/ph/g, 'f')
      .replace(/ck/g, 'k')
      .replace(/[aeiouyw]/g, '')
      .replace(/p/g, 'b')
      .replace(/v/g, 'f')
      .replace(/[cqg]/g, 'k')
      .replace(/z/g, 's');
  } else {
    for (const c of w) s += AR_SKEL[c] ?? '';
  }
  return s.replace(/(.)\1+/g, '$1');
}

// ============================================================================
// الفهم
// ============================================================================
export interface UnderstandOptions {
  /** كلمات صحيحة معروفة (من الأنماط/المنهج): لا تُعدّل كأخطاء إملائية */
  knownWords?: Set<string>;
  /** أضف نوع السؤال define ضمنياً للكلمة/المفهوم الوحيد (افتراضي true) */
  implicitDefine?: boolean;
}

const SOFT_PRIORITY = ['hru', 'thanks', 'bye', 'ok', 'greet'];

export function understand(text: string, opts: UnderstandOptions = {}): Frame {
  const norm = normalize(text);
  const ws = norm.split(WORD_SPLIT).filter(Boolean);
  const concepts = new Set<string>();
  const verbs = new Set<string>();
  const acts = new Set<string>();
  const soft = new Set<string>();
  const literal: string[] = [];
  const rawWords: string[] = [];
  let own = false;
  let typo = false;
  let plural = false;

  const take = (h: Hit) => {
    if (h.own) own = true;
    switch (h.kind) {
      case 'c':
        concepts.add(h.id);
        break;
      case 'v':
        verbs.add(h.id);
        break;
      case 'a':
        acts.add(h.id);
        break;
      case 's':
        soft.add(h.id);
        break;
      case 'o':
        own = true;
        break;
      default:
        break; // 'f' حشو
    }
  };

  let i = 0;
  while (i < ws.length) {
    let consumed = 0;
    // عبارات متعددة الكلمات (الأطول أولاً)
    for (let n = Math.min(MAX_N, ws.length - i); n >= 2; n--) {
      const hit = PHRASES.get(ws.slice(i, i + n).join(' '));
      if (hit) {
        take(hit);
        if (hit.entity) for (let k = i; k < i + n; k++) rawWords.push(canonWord(ws[k]) || ws[k]);
        consumed = n;
        break;
      }
    }
    if (consumed) {
      i += consumed;
      continue;
    }
    const w = ws[i];
    // بقايا أدوات تعريف/جر منفصلة (مثل "ال" بعد تحويل "الاكس بي" إلى xp)
    if (DANGLING.has(w)) {
      i++;
      continue;
    }
    if (PLURAL_SET.has(w) || PLURAL_SET.has(variants(w)[1] ?? '')) plural = true;
    const hit = lookupWord(w);
    if (hit) {
      take(hit);
      if (hit.entity) rawWords.push(canonWord(w) || w);
    } else {
      const c = canonWord(w);
      if (c) {
        // كلمة غير معروفة: قد تكون خطأ إملائياً لمصطلح من القاموس
        let fixed: Hit | undefined;
        if (!opts.knownWords?.has(c) && !opts.knownWords?.has(w)) fixed = fuzzyHit(w);
        if (fixed) {
          typo = true;
          take(fixed);
          if (fixed.entity) rawWords.push(c);
        } else {
          literal.push(c);
          rawWords.push(c);
        }
      }
    }
    i++;
  }

  // الفعل العام "اسوي" يُحذف بجانب فعل محدد
  if (verbs.has('make') && verbs.size > 1) verbs.delete('make');

  // تحيات: تُحذف إذا وُجد سؤال حقيقي؛ وعند اجتماع أكثر من نوع يبقى الأعلى أولوية
  const hasSubstance = concepts.size + verbs.size + acts.size + literal.length > 0;
  if (hasSubstance) soft.clear();
  else if (soft.size > 1) {
    const keep = SOFT_PRIORITY.find((s) => soft.has(s));
    soft.clear();
    if (keep) soft.add(keep);
  }

  // شرح (اشرح/وضح): يُعامل كسؤال تعريف في الردود الجاهزة، لكنه يُعلَّم حتى لا يجيب القاموس/الكيانات
  const explain = acts.has('explain');
  if (explain) {
    acts.delete('explain');
    acts.add('define');
  }
  // "where do i get coins" / "وين اجمع كوينات" = كيف اجمع
  if (acts.has('where') && verbs.has('earn')) {
    acts.delete('where');
    acts.add('how');
  }
  // "شنو اسوي حتى اجمع كوينات" = "كيف اجمع كوينات"
  if (verbs.size && acts.has('define') && !explain) {
    acts.delete('define');
    acts.add('how');
  }
  if (verbs.size && explain && acts.has('define')) {
    acts.delete('define');
    acts.add('how');
  }

  // عمق: يطلب تفصيلاً/كتابة/حساباً/رأياً
  let depth = ws.some((w) => DEPTH_SET.has(w) || DEPTH_SET.has(variants(w)[1] ?? ''));
  if (!depth) {
    const padded = ` ${ws.join(' ')} `;
    depth = DEPTH_PHR.some((p) => padded.includes(` ${p} `));
  }

  // نوع السؤال الضمني: مفهوم وحيد بلا كلمات أخرى ("الكوينز؟") = ما هو؟
  let implicitDefine = false;
  if ((opts.implicitDefine ?? true) && !acts.size && !verbs.size && !soft.size && !literal.length && concepts.size >= 1 && concepts.size <= 2) {
    acts.add('define');
    implicitDefine = true;
  }

  const tokens = [
    ...[...concepts].map((c) => `c:${c}`),
    ...[...verbs].map((v) => `v:${v}`),
    ...[...acts].map((a) => `a:${a}`),
    ...[...soft].map((s) => `s:${s}`),
    ...literal.map((w) => `w:${w}`),
  ];
  const unique = [...new Set(tokens)].sort();

  return {
    tokens: unique,
    concepts,
    verbs,
    acts,
    soft,
    words: [...new Set(literal)],
    rawWords: [...new Set(rawWords)],
    explain,
    depth,
    plural,
    own,
    typo,
    implicitDefine,
    wordCount: ws.length,
    norm,
  };
}

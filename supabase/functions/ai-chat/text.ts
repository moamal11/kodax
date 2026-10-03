/**
 * تطبيع النص العربي/الإنجليزي وتقطيعه — مشترك بين البحث في المعرفة (knowledge.ts)
 * والردود الذكية (smart.ts) ومولّد المعرفة (scripts/build-ai-knowledge.ts).
 * بدون أي اعتماد على Deno أو Node.
 */

// عبارات متعددة الكلمات تُوحَّد قبل التقطيع
const PHRASES: Array<[RegExp, string]> = [
  [/جافا ?سكربت|جافا ?سكريبت|java ?script/g, ' javascript '],
  [/تايب ?سكربت|تايب ?سكريبت|type ?script/g, ' typescript '],
  [/سي ?بلس ?بلس|c\+\+|سي\+\+/g, ' cpp '],
  [/رياكت ?نيتف|react ?native/g, ' reactnative '],
  [/نود ?جي ?اس|node\.?js|نود/g, ' node '],
  [/اكس ?بي|إكس ?بي|\bx\.?p\b/g, ' xp '],
  [/الذكاء الاصطناعي|ذكاء اصطناعي|\bai\b/g, ' ai '],
  [/تعلم الاله|تعلم الآلة|machine learning/g, ' ml '],
  [/الامن السيبراني|الأمن السيبراني|امن سيبراني|cyber ?security/g, ' cyber '],
  [/قاعده بيانات|قاعدة بيانات|قواعد البيانات|قواعد بيانات|data ?base/g, ' database '],
  [/لوحه الصداره|لوحة الصدارة|leader ?board/g, ' leaderboard '],
];

// مرادفات كلمة واحدة → شكل موحّد (عربي/عامية/إنجليزي)
const SYNONYMS: Record<string, string> = {
  بايثون: 'python', بيثون: 'python',
  جافا: 'java',
  رياكت: 'react',
  فلاتر: 'flutter', دارت: 'dart',
  'html': 'html', اتش: 'html', 'css': 'css',
  'sql': 'sql', سيكول: 'sql',
  مونجو: 'mongodb', 'mongo': 'mongodb',
  سوبابيس: 'supabase', فايربيس: 'firebase',
  كوين: 'coins', كوينز: 'coins', كوينات: 'coins', عمله: 'coins', عملات: 'coins', coin: 'coins',
  مستوي: 'level', ليفل: 'level', level: 'level',
  اعلان: 'ad', اعلانات: 'ad', ads: 'ad',
  تحدي: 'challenge', تحديات: 'challenge', challenges: 'challenge', چالنج: 'challenge',
  كورس: 'course', كورسات: 'course', دوره: 'course', دورات: 'course', courses: 'course',
  درس: 'lesson', دروس: 'lesson', lessons: 'lesson',
  شهاده: 'certificate', شهادات: 'certificate', certificates: 'certificate',
  شاره: 'badge', شارات: 'badge', badges: 'badge',
  ستريك: 'streak', سلسله: 'streak',
  دالة: 'function', داله: 'function', دوال: 'function', فنكشن: 'function', functions: 'function',
  متغير: 'variable', متغيرات: 'variable', variables: 'variable',
  حلقه: 'loop', حلقات: 'loop', لوب: 'loop', loops: 'loop',
  مصفوفه: 'array', مصفوفات: 'array', اري: 'array', arrays: 'array',
  قائمه: 'list', ليست: 'list', lists: 'list',
  قاموس: 'dict', dictionary: 'dict',
  كلاس: 'class', صنف: 'class', classes: 'class',
  كائن: 'object', كائنات: 'object', اوبجكت: 'object', objects: 'object',
  مؤشر: 'pointer', مؤشرات: 'pointer', pointers: 'pointer',
  خطا: 'error', اخطاء: 'error', ايرور: 'error', errors: 'error',
  مشرف: 'admin',
};

// كلمات شائعة لا تفيد في البحث (بعد التطبيع)
const STOPWORDS = new Set([
  'في', 'من', 'على', 'عن', 'الى', 'او', 'ثم', 'هو', 'هي', 'هم', 'انا', 'انت', 'نحن', 'هذا', 'هذه', 'هذي', 'هاي',
  'ذلك', 'تلك', 'التي', 'الذي', 'اللي', 'ما', 'ماذا', 'لماذا', 'كيف', 'متى', 'اين', 'هل', 'لا', 'نعم', 'مع', 'كل',
  'شنو', 'شو', 'شلون', 'شكد', 'وين', 'ليش', 'اكو', 'ماكو', 'جدا', 'كلش', 'هواي', 'يعني', 'بس', 'لو', 'اذا', 'قد',
  'كان', 'يكون', 'تكون', 'ان', 'انه', 'انها', 'به', 'بها', 'له', 'لها', 'لي', 'عندي', 'عند', 'بين', 'حتى', 'اي',
  'ايش', 'شي', 'شيء', 'كم', 'مثل', 'لكن', 'بعد', 'قبل', 'غير', 'كذا', 'هنا', 'هناك', 'يا', 'و', 'ف', 'ب', 'ل',
  'the', 'a', 'an', 'is', 'are', 'what', 'how', 'why', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'do', 'does',
  'i', 'me', 'my', 'you', 'it', 'this', 'that', 'can', 'with',
  // كلمات طلب (ليست محتوى): لا تفيد البحث عن الدرس المناسب
  'اشرح', 'اشرحلي', 'وضح', 'وضحلي', 'فسر', 'مثال', 'بمثال', 'امثله', 'ممكن', 'اريد', 'ابي', 'اعطني', 'عطني',
  'علمني', 'ساعدني', 'بالتفصيل', 'بسيط', 'explain', 'example', 'please', 'show',
]);

/** تطبيع: حذف التشكيل والتطويل، توحيد الألف والياء والتاء المربوطة، أرقام عربية → لاتينية */
export function normalize(text: string): string {
  let s = text
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
    // حروف اللهجة العراقية/الفارسية: گ←ك، چ←ج، پ←ب، ڤ←ف
    .replace(/گ/g, 'ك')
    .replace(/چ/g, 'ج')
    .replace(/پ/g, 'ب')
    .replace(/ڤ/g, 'ف')
    // إطالة الحروف: هلووو، شنووو، التحديااات ← حرف واحد (و/ي/ا)، وأي حرف لاتيني مكرر 3 مرات فأكثر
    .replace(/([ويا])\1+/g, '$1')
    .replace(/([a-z])\1{2,}/g, '$1');
  for (const [re, rep] of PHRASES) s = s.replace(re, rep);
  return s.replace(/\s+/g, ' ').trim();
}

export function stem(token: string): string {
  if (/^[a-z0-9+#]+$/.test(token)) return token;
  let t = token;
  // البادئات: وال، بال، كال، فال، لل، ال
  for (const p of ['وال', 'بال', 'كال', 'فال', 'لل', 'ال']) {
    if (t.startsWith(p) && t.length - p.length >= 2) {
      t = t.slice(p.length);
      break;
    }
  }
  if (t.length >= 4 && t.startsWith('و')) t = t.slice(1);
  return t;
}

/** حروف الكلمة: لاتيني/أرقام/حروف عربية (بدون علامات الترقيم العربية ؟ ، ؛ التي تقع داخل النطاق العربي) */
export const WORD_SPLIT = /[^a-z0-9ء-يٮ-ۓ+#]+/;

/** الشكل القانوني لكلمة (جذع خفيف + مرادفات) أو '' إذا كانت كلمة توقف/قصيرة */
export function canonWord(raw: string): string {
  if (!raw) return '';
  const s = stem(raw);
  const mapped = SYNONYMS[s] ?? SYNONYMS[raw] ?? s;
  if (mapped.length < 2 && !/^[0-9]$/.test(mapped)) return '';
  if (STOPWORDS.has(mapped) || STOPWORDS.has(raw)) return '';
  return mapped;
}

/** تقطيع + جذع خفيف + مرادفات، مع حذف كلمات التوقف */
export function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const raw of normalize(text).split(WORD_SPLIT)) {
    const c = canonWord(raw);
    if (c) out.push(c);
  }
  return out;
}

/** هل يحتوي النص على كود؟ (أسئلة الكود تحتاج تحليلاً من Gemini) */
export function looksLikeCode(text: string): boolean {
  return (
    /```/.test(text) ||
    /[{};]\s*$/m.test(text) ||
    /\b(def|function|class|const|let|var)\s+[A-Za-z_$][\w$]*\s*[=(:{<]/.test(text) ||
    /\b(import\s+[\w{*]|from\s+\S+\s+import|return\s+[\w(\[{"'`]|public\s+\w+|private\s+\w+)/.test(text) ||
    /(#include|console\.log\(|print\(|System\.out|cout\s*<<)/.test(text) ||
    /<\/?[a-z][a-z0-9]*[^>]*>/i.test(text) ||
    /=>|==|!=|\+\+|&&|\|\|/.test(text.replace(/\b[cC]\+\+/g, 'cpp'))
  );
}

/** عدد كلمات تقريبي */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** بصمة نصية ثابتة (FNV-1a 64 بت كنص hex) — للمفاتيح والإصدارات، ليست للأمان */
export function fingerprint(text: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x5bd1e995) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

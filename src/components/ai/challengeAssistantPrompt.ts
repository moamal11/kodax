/**
 * بناء طلبات مساعد التحدي الذكي (بدون React — قابل للاختبار).
 *
 * ما يُرسل: الوصف، الكود البدائي، كود الطالب، الاختبارات الظاهرة، المتطلبات،
 * ونتائج آخر تشغيل حقيقي لكود الطالب الحالي.
 * ما لا يُرسل أبداً: أي شيء من الاختبارات المخفية (لا مدخلات، لا نتائج متوقعة،
 * لا نص خطأ، ولا حتى وصفها) — فقط أن اختباراً مخفياً فشل ونوع الفشل.
 */
import type { ChallengeRunSummary } from '@/components/challenge/ChallengeResults';

export type HelpLevel = 'hint' | 'explain' | 'debug' | 'fix' | 'solve';

export interface AssistantTestCase {
  input: string;
  expectedOutput: string;
  description: string;
  hidden?: boolean;
}

export interface AssistantContext {
  isChallenge: boolean;
  title: string;
  description: string;
  language: string;
  starterCode?: string;
  userCode?: string;
  testCases?: AssistantTestCase[];
  hints?: string[];
  requirements?: string[];
  /** نتائج تشغيل كود الطالب الحالي فقط (null إذا تغيّر الكود بعد آخر تشغيل) */
  lastRun?: ChallengeRunSummary | null;
}

export const MAX_CODE_CHARS = 5000;

const clip = (s: string | undefined, n: number) =>
  !s ? '' : s.length > n ? `${s.slice(0, n)}…` : s;

/** بصمة بسيطة لتمييز الكاش حسب كود الطالب ونتائج تشغيله */
export function fingerprint(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** آخر/أطول كتلة كود في رد الذكاء (المفترض أنها الكود الكامل) */
export function extractCode(text: string): string | null {
  const blocks = [...text.matchAll(/```[\w+#.-]*\s*\n([\s\S]*?)```/g)]
    .map((m) => m[1].trim())
    .filter((b) => b.length > 0);
  if (!blocks.length) return null;
  return blocks.reduce((a, b) => (b.length >= a.length ? b : a));
}

export function hasUserCode(ctx: Pick<AssistantContext, 'userCode' | 'starterCode'>): boolean {
  return !!ctx.userCode && ctx.userCode.trim() !== (ctx.starterCode || '').trim();
}

export function hasFailedRun(ctx: Pick<AssistantContext, 'lastRun'>): boolean {
  return !!ctx.lastRun && !ctx.lastRun.allPassed && !ctx.lastRun.serviceError;
}

/** مفتاح الكاش: يتغيّر مع تغيّر كود الطالب أو نتائج تشغيله */
export function assistantCacheKey(challengeId: string, level: HelpLevel, ctx: AssistantContext): string {
  const run = ctx.lastRun
    ? ctx.lastRun.results.map((r) => `${r.passed ? 1 : 0}${r.kind ?? ''}`).join('')
    : '';
  return `${challengeId}:${level}:${fingerprint((hasUserCode(ctx) ? ctx.userCode ?? '' : '') + '|' + run)}`;
}

function buildContextBlock(ctx: AssistantContext): string {
  const withCode = hasUserCode(ctx);
  const visible = (ctx.testCases ?? []).filter((tc) => !tc.hidden);
  const hiddenCount = (ctx.testCases?.length ?? 0) - visible.length;

  let out = `🎯 **التحدي:** ${ctx.title}
📝 **الوصف:** ${ctx.description}
💻 **اللغة:** ${ctx.language}`;
  if (ctx.starterCode) {
    out += `\n\n🔧 **الكود البدائي:**\n\`\`\`${ctx.language}\n${ctx.starterCode}\n\`\`\``;
  }
  if (withCode) {
    out += `\n\n👤 **كود الطالب الحالي:**\n\`\`\`${ctx.language}\n${clip(ctx.userCode, MAX_CODE_CHARS)}\n\`\`\``;
  }
  if (visible.length > 0) {
    out += `\n\n🧪 **حالات الاختبار الظاهرة:**`;
    visible.forEach((tc, i) => {
      out += `\n${i + 1}. ${tc.description}`;
      if (tc.input) out += `\n   المدخل: \`${clip(tc.input, 400)}\``;
      out += `\n   المتوقع: \`${clip(tc.expectedOutput, 300)}\``;
    });
  }
  if (hiddenCount > 0) {
    out += `\n\n🔒 يوجد أيضاً ${hiddenCount} اختبارات مخفية تتحقق من حالات إضافية — لا تعرف مدخلاتها، فلا تخمّنها ولا تخترع متطلبات لها.`;
  }
  if (ctx.requirements?.length) {
    out += `\n\n📋 **المتطلبات التي يفحصها التطبيق في الكود:**\n${ctx.requirements.map((r) => `- ${r}`).join('\n')}`;
  }
  if (ctx.lastRun && withCode) {
    if (ctx.lastRun.serviceError) {
      out += `\n\n▶️ **آخر تشغيل:** تعذّر التشغيل بسبب مشكلة اتصال (ليست خطأ في كود الطالب).`;
    } else {
      out += `\n\n▶️ **نتائج آخر تشغيل حقيقي لكود الطالب الحالي:** ${ctx.lastRun.passedTests}/${ctx.lastRun.totalTests} ناجحة`;
      ctx.lastRun.results
        .filter((r) => !r.passed)
        .slice(0, 5)
        .forEach((r) => {
          if (r.hidden) {
            // لا وصف ولا مدخلات ولا نتائج للاختبار المخفي
            out += `\n- ❌ اختبار مخفي فشل (${r.kind === 'wrong_output' ? 'نتيجة غير صحيحة' : r.kind === 'timeout' ? 'انتهى الوقت' : r.kind === 'runtime_error' ? 'خطأ أثناء التشغيل' : 'فشل'})`;
            return;
          }
          out += `\n- ❌ ${r.description ?? ''}: ${r.message}`;
          if (r.input) out += `\n  المدخل: \`${clip(r.input, 300)}\``;
          if (r.expectedOutput !== undefined) out += `\n  المتوقع: \`${clip(r.expectedOutput, 300)}\``;
          if (r.actualOutput !== undefined) out += `\n  الناتج الفعلي: \`${clip(r.actualOutput, 300)}\``;
          if (r.error) out += `\n  رسالة الخطأ:\n\`\`\`\n${clip(r.error, 500)}\n\`\`\``;
        });
    }
  }
  return out;
}

export function buildAssistantPrompt(level: HelpLevel, ctx: AssistantContext): string {
  if (!ctx.isChallenge) {
    return `أنت مدرب برمجة خبير. اشرح الدرس التالي بالتفصيل باللغة العربية:

📚 **الدرس:** ${ctx.title}
📝 **المحتوى:** ${ctx.description}
💻 **اللغة:** ${ctx.language}
${ctx.starterCode ? `\n🔧 **مثال الكود:**\n\`\`\`${ctx.language}\n${ctx.starterCode}\n\`\`\`` : ''}

✨ **المطلوب:**
1. شرح مفصل للمفاهيم الأساسية
2. أمثلة عملية مع الكود الكامل والمنسق
3. نصائح وأفضل الممارسات
4. أخطاء شائعة يجب تجنبها`;
  }

  const block = buildContextBlock(ctx);
  const withCode = hasUserCode(ctx);

  switch (level) {
    case 'hint':
      return `أنت مدرس برمجة صبور. الطالب يحل هذا التحدي ويريد تلميحاً فقط.

${block}
${ctx.hints?.length ? `\n💡 تلميحات موجودة مسبقاً (لا تكررها حرفياً): ${ctx.hints.join(' | ')}` : ''}

✨ **المطلوب:**
- أعطِ تلميحاً واحداً قصيراً (جملتين أو ثلاث) يوجّه الطالب للخطوة التالية.
- ${withCode ? 'أشر إلى الجزء من كوده الذي يحتاج مراجعة بدون تصحيحه.' : 'اقترح من أين يبدأ بدون كتابة الكود.'}
- ⚠️ ممنوع كتابة الحل أو أي كود كامل.`;
    case 'explain':
      return `أنت مدرس برمجة. اشرح للطالب المشكلة بدون إعطائه الحل الكامل.

${block}

✨ **المطلوب:**
${
  withCode
    ? `1. اشرح لماذا لا يعمل كود الطالب أو لماذا قد يفشل في حالات الاختبار.
2. وضّح الأخطاء المنطقية أو أخطاء الصياغة بلغة بسيطة.
3. لا تكتب الكود المصحح كاملاً — اترك للطالب فرصة الإصلاح.`
    : `1. اشرح ما يطلبه التحدي بالضبط وفكرة الحل خطوة بخطوة.
2. لا تكتب الحل الكامل.`
}`;
    case 'debug':
      return `أنت مدرس برمجة يساعد الطالب على تتبّع خطأ في كوده.

${block}

✨ **المطلوب:**
1. اختر أول اختبار فاشل أو رسالة خطأ من نتائج التشغيل أعلاه.
2. تتبّع تنفيذ كود الطالب على ذلك المدخل خطوة بخطوة (قيم المتغيرات المهمة).
3. حدّد السطر أو الشرط المسؤول، واشرح لماذا يعطي الناتج الفعلي بدلاً من المتوقع.
4. اقترح ما يجب أن يفحصه الطالب — بدون كتابة الكود المصحح كاملاً.
5. إذا كان الفشل في اختبار مخفي، فكّر في الحالات الحدية المذكورة في الوصف فقط (بدون اختراع متطلبات جديدة).`;
    case 'fix':
      return `أنت مراجع كود محترف.

${block}

✨ **المطلوب:**
${
  withCode
    ? `1. أصلح كود الطالب بأقل تغييرات ممكنة (لا تعِد كتابته من الصفر)، معتمداً على نتائج التشغيل الحقيقية أعلاه.
2. اعرض الكود بعد الإصلاح كاملاً في كتلة كود واحدة فقط.
3. اشرح كل تغيير ولماذا كان ضرورياً.
4. لا تغيّر أسماء الدوال أو صيغة المخرجات المطلوبة. التطبيق سيشغّل كودك على الاختبارات ويعرض النتيجة، فلا تدّعِ أنه صحيح.`
    : `الطالب لم يكتب كوداً بعد. اكتب بداية مقترحة (هيكل الحل) مع تعليقات TODO، واشرح كيف يكملها.`
}`;
    case 'solve':
    default:
      return `أنت مبرمج محترف. ساعد الطالب في حل هذا التحدي:

${block}

✨ **المطلوب:**
1. شرح استراتيجية الحل خطوة بخطوة
2. كتابة الحل الكامل في كتلة كود واحدة فقط، جاهز للتشغيل، بنفس أسماء الدوال في الكود البدائي
3. شرح كل جزء من الكود
4. التزم بالوصف وحالات الاختبار حرفياً (صيغة المخرجات والحالات الحدية) — التطبيق سيشغّل الحل على الاختبارات ويعرض النتيجة، فلا تدّعِ أنه مُختبَر${withCode ? '\n5. وضّح الأخطاء في كود الطالب الحالي (إن وُجدت)' : ''}`;
  }
}

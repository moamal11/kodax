// ========================================
// Supabase Edge Function: AI Chat (Optimized Smart v2)
// Runtime: Deno
// ✨ التحديثات: نموذج ذكي + max_tokens كبيرة + دعم modes
// ========================================

// @ts-ignore: Deno runtime
import { corsHeaders } from '../_shared/cors.ts';

// ========================================
// تصنيف السؤال والمحتوى
// ========================================
function classifyQuestion(
  message: string,
  mode?: string
): 'simple' | 'advanced' | 'explanation' {
  const lowerMessage = message.toLowerCase();
  const wordCount = message.split(/\s+/).length;

  // إذا كان mode خاص بالشروحات، استخدم النموذج الأقوى مباشرة
  if (
    mode === 'challenge-explain' ||
    mode === 'lesson-explain' ||
    mode === 'explain' ||
    mode === 'fix'
  ) {
    return 'explanation';
  }

  // كشف الكود (أي شيء بين backticks أو يحتوي على أسطر متعددة من code-like syntax)
  const hasCode =
    /```[\s\S]*```/.test(message) ||
    /`[^`]+`/.test(message) ||
    /(function|def|class|const|let|var|import|from|public|private)\s+\w+/i.test(
      message
    );

  const advancedKeywords = [
    'معمارية',
    'architecture',
    'design pattern',
    'security',
    'أمن',
    'تصميم نظام',
    'microservices',
    'scale',
    'استراتيجية',
    'مراجعة شاملة',
    'منهج',
    'كورس',
    'اشرح',
    'explain',
    'شرح',
    'review',
    'راجع',
    'تحدي',
    'challenge',
    'debug',
    'خطأ',
    'error',
    'fix',
    'solution',
    'حل',
  ];

  // الأسئلة الطويلة أو التي تحتوي على كود = advanced
  if (wordCount > 80 || hasCode) return 'advanced';
  if (advancedKeywords.some((kw) => lowerMessage.includes(kw)))
    return 'advanced';

  return 'simple';
}

// ========================================
// اختيار النموذج والإعدادات (ذكي ومرن)
// ========================================
function getModelConfig(complexity: 'simple' | 'advanced' | 'explanation') {
  if (complexity === 'explanation') {
    // شروحات التحديات والدروس - نموذج قوي مع tokens كثيرة
    return { model: 'gpt-4o', maxTokens: 3500, temperature: 0.7 };
  } else if (complexity === 'advanced') {
    // أسئلة متقدمة، مراجعة كود، debugging - نموذج قوي
    return { model: 'gpt-4o', maxTokens: 2500, temperature: 0.8 };
  } else {
    // أسئلة بسيطة - نموذج اقتصادي
    return { model: 'gpt-4o-mini', maxTokens: 600, temperature: 0.7 };
  }
}

// ========================================
// System Prompt (ودّي، عملي، محترف)
// ========================================
function getSystemPrompt(
  complexity: 'simple' | 'advanced' | 'explanation',
  mode?: string
): string {
  let prompt = `أنت مساعد ذكاء اصطناعي في تطبيق Kodax التعليمي التقني.
مطور التطبيق: مؤمل من العراق

قواعد أساسية:
- تحدث اللهجة العراقية بطريقة ودية ومباشرة
- لا تذكر أي تفاصيل تقنية عن البنية التحتية أو APIs
- لا تقل "لا يمكنني" أو "خارج النطاق"
- استخدم الرموز التعبيرية بحكمة
- كن تعليمياً وعملياً وداعماً`;

  if (complexity === 'explanation') {
    prompt += `

**شرح تفصيلي مطلوب:**
- اشرح بعمق وبشكل كامل
- اكتب الكود كاملاً بدون اختصارات
- استخدم \`\`\`language للأكواد مع اسم اللغة
- نظم الشرح بعناوين وأقسام واضحة
- أعط أمثلة عملية كاملة
- وضّح كل سطر من الكود المهم
- لا تختصر الكود - اكتبه كاملاً!
- استخدم syntax highlighting بشكل صحيح`;
  } else if (complexity === 'advanced') {
    prompt += `

**سؤال متقدم:**
- قدم تحليلاً عميقاً ومنظماً
- استخدم عناوين فرعية وأمثلة متقدمة
- إذا كتبت كود، اكتبه كاملاً داخل \`\`\`language
- وضّح best practices والأخطاء الشائعة`;
  } else {
    prompt += '\n\n**سؤال بسيط:** أجب في 2-4 أسطر، مثال واحد إذا لزم الأمر.';
  }

  prompt +=
    '\n\nاستخدم لغة ودية جداً، وكأنك تتحدث إلى زميل مطور. تأكد من كتابة الكود كاملاً بدون اختصارات.';

  return prompt;
}

// ========================================
// استدعاء OpenAI API مع إدارة الأخطاء
// ========================================
async function callOpenAI(
  message: string,
  context: string | undefined,
  mode: string | undefined,
  apiKey: string
): Promise<string> {
  const complexity = classifyQuestion(message, mode);
  const config = getModelConfig(complexity);
  const systemPrompt = getSystemPrompt(complexity, mode);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(context ? [{ role: 'system', content: `Context: ${context}` }] : []),
    { role: 'user', content: message },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OpenAI Error]', {
        status: response.status,
        body: errorText,
      });

      if (response.status === 429)
        return '⚠️ تجاوز الحد المسموح من الذكاء الاصطناعي، يرجى المحاولة لاحقاً.';
      return `⚠️ حدث خطأ من مزود الذكاء الاصطناعي (${response.status})`;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return content || '⚠️ لم يصلنا رد من الذكاء الاصطناعي.';
  } catch (err) {
    console.error('[OpenAI Fetch Error]', err);
    return '⚠️ حدث خطأ في الاتصال بمزود الذكاء الاصطناعي.';
  }
}

// ========================================
// Edge Function Handler
// ========================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { message, userId, context, mode } = await req.json();
  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid message' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Service configuration error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const reply = await callOpenAI(message, context, mode, apiKey);
  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

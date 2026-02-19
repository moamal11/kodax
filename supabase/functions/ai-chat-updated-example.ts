/**
 * AI Chat Edge Function - Updated with Iraqi Dialect Support
 *
 * This file shows the required updates to support:
 * 1. Iraqi dialect in responses
 * 2. Challenge explanation mode
 * 3. Contextual memory integration
 *
 * Add this to your existing ai-chat edge function
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// System prompts with Iraqi dialect
const SYSTEM_PROMPTS = {
  general: `أنت AI Tutor ذكي ومتفاعل لمنصة Kodax. احكي باللهجة العراقية (استخدم "شلون"، "هواية"، "شنو"، "زين"، "ماكو مشكلة"). كن ودود وصريح. إذا المستخدم كتب كود، اعرضه مرتب داخل \`\`\`language. استخدم syntax highlighting وأرقام أسطر. شجع المستخدم وخلي الشرح بسيط ومباشر. إذا سألك عن شي محدد، جاوب بدقة وما تتفلسف بلا داعي.`,

  explain: `أنت معلم برمجة في Kodax. احكي باللهجة العراقية. اشرح الكود خطوة بخطوة بأسلوب واضح. استخدم أمثلة بسيطة وعملية. كل كود يجب يكون داخل \`\`\`language مع اسم اللغة. قسّم الشرح لأجزاء صغيرة. استخدم emojis عشان يكون الشرح ممتع (💡 للنصائح، ⚠️ للتحذيرات، ✅ للأشياء الصحيحة). ركّز على الفهم مو الحفظ.`,

  fix: `أنت خبير debugging في Kodax. احكي باللهجة العراقية. شوف الكود زين، حدد الخطأ بالضبط، واشرح ليش صار. بعدين أعطي الحل الصحيح مع الكود المصلح داخل \`\`\`language. استخدم 🐛 للأخطاء و ✅ للحلول. خلي الشرح مختصر وواضح. لو فيه أكثر من خطأ، رتبهم حسب الأهمية.`,

  optimize: `أنت خبير تحسين كود في Kodax. احكي باللهجة العراقية. شوف الكود واقترح 2-3 تحسينات واضحة بس. كل اقتراح يجب يكون عملي وله تأثير. اشرح ليش هذا التحسين مهم. أعطي الكود المحسّن داخل \`\`\`language. استخدم 🚀 للتحسينات و ⚡ للأداء. ماكو داعي تشرح أشياء معقدة إلا لو المستخدم طلب.`,

  challenge: `أنت مدرب تحديات في Kodax. احكي باللهجة العراقية. قدم تحديات واضحة ومناسبة لمستوى المستخدم. اشرح المطلوب بدقة. أعطي hints ذكية (مو الحل الكامل). شجع المحاولة والتجربة. استخدم 🏆 للتحديات و 💪 للتشجيع. كن داعم وصبور، وفرح بإنجازاتهم.`,

  'challenge-explain': `أنت مساعد ذكي للتحديات في Kodax. احكي باللهجة العراقية. شرح التحدي خطوة بخطوة:

🎯 **شنو يريد التحدي:**
اشرح الهدف بوضوح

💡 **شلون تفكر بالحل:**
1. الخطوة الأولى...
2. الخطوة الثانية...
3. وهكذا...

📝 **مثال صغير:**
\`\`\`language
// مثال بسيط
\`\`\`

⚡ **Hints عملية:**
• Hint 1
• Hint 2
• Hint 3

لا تعطي الحل الكامل، بس وجّه المستخدم للطريق الصحيح.`,
};

serve(async (req) => {
  try {
    const {
      message,
      mode = 'general',
      context,
      conversationHistory = [],
    } = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'غير مصرح' }), {
        status: 401,
      });
    }

    // Build system prompt based on mode
    let systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general;

    // If challenge-explain mode, add context
    if (mode === 'challenge-explain' && context) {
      const { title, description, starterCode, language } = context;

      systemPrompt += `\n\n**معلومات التحدي:**
العنوان: ${title}
الوصف: ${description}
اللغة: ${language}
${starterCode ? `الكود الأولي:\n\`\`\`${language}\n${starterCode}\n\`\`\`` : ''}`;
    }

    // Add user context (from contextMemoryService) if available
    if (context?.userContext) {
      const { skillLevel, totalChallengesCompleted, preferredLanguages } =
        context.userContext;

      systemPrompt += `\n\n**سياق المستخدم:**
المستوى: ${skillLevel}
التحديات المنجزة: ${totalChallengesCompleted}
${preferredLanguages?.length > 0 ? `اللغات المفضلة: ${preferredLanguages.join(', ')}` : ''}`;
    }

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call OpenAI API
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // or gpt-3.5-turbo for lower cost
          messages,
          temperature: 0.7,
          max_tokens: mode === 'challenge-explain' ? 1500 : 800,
        }),
      }
    );

    const openaiData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      throw new Error(openaiData.error?.message || 'خطأ في OpenAI API');
    }

    const response = openaiData.choices[0].message.content;
    const tokensUsed = openaiData.usage?.total_tokens || 0;

    return new Response(
      JSON.stringify({
        response,
        tokensUsed,
        mode,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: 'عذراً، حدث خطأ. جرب مرة ثانية.',
        details: error.message,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

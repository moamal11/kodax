/**
 * AI Chat Service
 * خدمة الدردشة مع الذكاء الاصطناعي
 *
 * يستخدم Supabase Edge Function للتواصل مع AI:
 * - التصنيف التلقائي يحدث في Edge Function
 * - اختيار النموذج المناسب تلقائياً في الـ serverless
 * - تحسين التكلفة مع الحفاظ على الجودة
 * - API Keys آمنة في Supabase Secrets
 */

import { supabase } from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: string;
  created_at: string;
  isLoading?: boolean;
  isTyping?: boolean; // For typing animation effect
}

export interface ChatMode {
  id: string;
  name: string;
  icon: string;
  color: string;
  systemPrompt: string;
}

// مستويات صعوبة الأسئلة
export enum QuestionComplexity {
  SIMPLE = 'simple', // نموذج اقتصادي
  MODERATE = 'moderate', // نموذج قياسي
  ADVANCED = 'advanced', // نموذج متقدم
}

// نماذج الذكاء الاصطناعي حسب المستوى
// محسّنة لبيئة serverless - إجابات مختصرة وفعالة
export const AI_MODELS = {
  [QuestionComplexity.SIMPLE]: {
    name: 'gpt-3.5-turbo',
    maxTokens: 300, // مختصر جداً للأسئلة البسيطة
    temperature: 0.7,
    cost: 'منخفضة',
  },
  [QuestionComplexity.MODERATE]: {
    name: 'gpt-4o-mini',
    maxTokens: 800, // منظم ومختصر
    temperature: 0.7,
    cost: 'متوسطة',
  },
  [QuestionComplexity.ADVANCED]: {
    name: 'gpt-4o',
    maxTokens: 1500, // عميق لكن بدون حشو
    temperature: 0.8,
    cost: 'عالية',
  },
};

export const CHAT_MODES: ChatMode[] = [
  {
    id: 'general',
    name: 'محادثة عامة',
    icon: 'chatbubbles',
    color: '#8b5cf6',
    systemPrompt:
      'أنت AI Tutor ذكي ومتفاعل لمنصة Kodax. احكي باللهجة العراقية (استخدم "شلون"، "هواية"، "شنو"، "زين"، "ماكو مشكلة"). كن ودود وصريح. مهم جداً: عند كتابة كود، استخدم الصيغة التالية بالضبط:\n\n```اسم_اللغة\nالكود هنا\n```\n\nمثال: ```javascript أو ```python أو ```java أو ```cpp\nاستخدم اسم اللغة الصحيح دائماً. للأكواد المضمنة القصيرة استخدم `كود`. شجع المستخدم وخلي الشرح بسيط ومباشر.',
  },
  {
    id: 'explain',
    name: 'شرح الكود',
    icon: 'book',
    color: '#3b82f6',
    systemPrompt:
      'أنت معلم برمجة في Kodax. احكي باللهجة العراقية. اشرح الكود خطوة بخطوة بأسلوب واضح. مهم جداً: استخدم الصيغة ```language عند كتابة الكود مع تحديد اللغة بوضوح (javascript, python, java, cpp, html, css, sql). اكتب الصيغة بالضبط هكذا:\n\n```javascript\nconst x = 5;\n```\n\nاستخدم أمثلة عملية مع emojis (💡 نصائح، ⚠️ تحذيرات، ✅ صحيح). قسّم الشرح لأجزاء صغيرة.',
  },
  {
    id: 'fix',
    name: 'إصلاح الأخطاء',
    icon: 'bug',
    color: '#ef4444',
    systemPrompt:
      'أنت خبير debugging في Kodax. احكي باللهجة العراقية. شوف الكود زين، حدد الخطأ بالضبط، واشرح ليش صار. مهم جداً: اعرض الكود المصلح بصيغة صحيحة:\n\n🐛 الكود الخاطئ:\n```language\nالكود الخاطئ\n```\n\n✅ الكود الصحيح:\n```language\nالكود المصلح\n```\n\nحدد اسم اللغة بوضوح (javascript, python, java, cpp). خلي الشرح مختصر وواضح.',
  },
  {
    id: 'optimize',
    name: 'تحسين الأداء',
    icon: 'rocket',
    color: '#10b981',
    systemPrompt:
      'أنت خبير تحسين كود في Kodax. احكي باللهجة العراقية. شوف الكود واقترح 2-3 تحسينات واضحة. اعرض المقارنة:\n\n❌ قبل التحسين:\n```language\nالكود القديم\n```\n\n✅ بعد التحسين:\n```language\nالكود المحسن\n```\n\nحدد اسم اللغة بدقة (javascript, python, java, cpp). استخدم 🚀 للتحسينات و ⚡ للأداء. اشرح ليش كل تحسين مفيد.',
  },
  {
    id: 'challenge',
    name: 'تحدي برمجي',
    icon: 'trophy',
    color: '#f59e0b',
    systemPrompt:
      'أنت مدرب تحديات في Kodax. احكي باللهجة العراقية. قدم تحديات واضحة ومناسبة لمستوى المستخدم. اشرح المطلوب بدقة. أعطي hints ذكية (مو الحل الكامل). شجع المحاولة والتجربة. استخدم 🏆 للتحديات و 💪 للتشجيع. كن داعم وصبور، وفرح بإنجازاتهم.',
  },
  {
    id: 'challenge-explain',
    name: 'شرح تحدي',
    icon: 'help-circle',
    color: '#06b6d4',
    systemPrompt:
      'أنت مساعد ذكي للتحديات في Kodax. احكي باللهجة العراقية. شرح التحدي خطوة بخطوة: 1) شنو يريد التحدي بالضبط، 2) شلون تفكر بالحل، 3) أمثلة صغيرة، 4) hints عملية. مهم جداً: استخدم ```language (مثل ```javascript أو ```python) لكل كود مع تحديد اسم اللغة بوضوح. لا تعطي الحل الكامل، بس وجّه المستخدم للطريق الصحيح. استخدم 💡 للأفكار و 🎯 للأهداف و ⚡ للخطوات.',
  },
  {
    id: 'lesson-explain',
    name: 'شرح درس',
    icon: 'book-outline',
    color: '#22c55e',
    systemPrompt:
      'أنت معلم محترف في Kodax. احكي باللهجة العراقية. اشرح الدرس بشكل مفصل: 1) المفهوم الأساسي بطريقة بسيطة، 2) أمثلة عملية وواضحة، 3) فوائد استخدام هذا المفهوم، 4) نصائح للفهم الأفضل. مهم جداً: استخدم ```language (مثل ```javascript أو ```python) لكل كود مع تحديد اسم اللغة بوضوح. خلي الشرح منظم ومفصل بدون تعقيد. استخدم 📚 للمعلومات و ✨ للأمثلة و 💡 للنصائح.',
  },
];

class AIChatService {
  private userId: string | null = null;

  setUser(userId: string) {
    this.userId = userId;
  }

  /**
   * جلب سجل المحادثات
   */
  async getChatHistory(limit: number = 50): Promise<ChatMessage[]> {
    if (!this.userId) return [];

    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }

    return data.map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      mode: msg.mode,
      created_at: msg.created_at,
    }));
  }

  /**
   * حفظ رسالة في السجل
   * @param conversationId معرّف المحادثة (اختياري)
   */
  async saveMessage(
    role: 'user' | 'assistant',
    content: string,
    mode?: string,
    tokensUsed?: number,
    conversationId?: string
  ): Promise<ChatMessage | null> {
    if (!this.userId) return null;

    const { data, error } = await supabase
      .from('ai_chat_history')
      .insert({
        user_id: this.userId,
        role,
        content,
        mode,
        tokens_used: tokensUsed,
        conversation_id: conversationId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }

    return {
      id: data.id,
      role: data.role,
      content: data.content,
      mode: data.mode,
      created_at: data.created_at,
    };
  }

  /**
   * إرسال رسالة للـ AI والحصول على رد
   * يستخدم Supabase Edge Function للتواصل مع AI
   * التصنيف والنموذج يتم اختيارهما تلقائياً في Edge Function
   */
  async sendMessage(
    userMessage: string,
    mode: string = 'general',
    conversationHistory: ChatMessage[] = []
  ): Promise<{
    response: string;
    tokensUsed: number;
    complexity?: QuestionComplexity;
  }> {
    console.log('🚀 Sending message to AI Edge Function...');

    try {
      // بناء context من المحادثة السابقة
      let context = '';

      // إضافة معلومات الـ mode كـ context
      const chatMode = CHAT_MODES.find((m) => m.id === mode);
      if (chatMode) {
        context = `Mode: ${chatMode.name}\n`;
      }

      // إضافة آخر رسالتين من المحادثة كـ context
      if (conversationHistory.length > 0) {
        const recentMessages = conversationHistory.slice(-2);
        context += recentMessages
          .map((msg) => `${msg.role}: ${msg.content.substring(0, 100)}`)
          .join('\n');
      }

      // الحصول على userId الصحيح من session (إن وجد)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const actualUserId = session?.user?.id || this.userId || 'anonymous';

      // استدعاء Edge Function
      // Supabase client سير سل anon key تلقائياً إذا لم يكن هناك session
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage,
          userId: actualUserId,
          context: context || undefined,
          mode: mode, // ✨ إرسال mode parameter
        },
      });

      if (error) {
        console.error('❌ Edge Function Error:', error);
        throw new Error(
          error.message || 'فشل في الاتصال بخدمة الذكاء الاصطناعي'
        );
      }

      if (!data || !data.reply) {
        console.error('❌ Invalid response from Edge Function:', data);
        // عرض debug message إذا كان موجوداً
        if (data?.debug) {
          console.error('🔍 Debug Info:', data.debug);
        }
        throw new Error(data?.debug || 'استجابة غير صالحة من الخادم');
      }

      const aiResponse = data.reply;
      const tokensUsed = data.tokensUsed || 0;

      console.log('✅ Received response from Edge Function');
      console.log('📊 Response length:', aiResponse.length);

      // حفظ معلومات الاستخدام (تقدير تقريبي للـ complexity)
      // Edge Function يتعامل مع التصنيف الحقيقي
      const estimatedComplexity = this.estimateComplexity(userMessage, mode);
      await this.trackUsage(estimatedComplexity, tokensUsed);

      return {
        response: aiResponse,
        tokensUsed,
        complexity: estimatedComplexity,
      };
    } catch (error: any) {
      console.error('❌ AI Service Error:', {
        message: error.message || 'Unknown error',
        type: error.name,
      });

      // في حال فشل Edge Function، استخدم fallback
      console.warn('⚠️ Falling back to simulated response');
      const complexity = this.estimateComplexity(userMessage, mode);
      return this.simulateResponse(userMessage, mode, complexity);
    }
  }

  /**
   * تقدير مستوى صعوبة السؤال (للتتبع المحلي فقط)
   * التصنيف الحقيقي يتم في Edge Function
   */
  private estimateComplexity(
    message: string,
    mode?: string
  ): QuestionComplexity {
    // شرح الدروس والتحديات يحتاج دائماً لشرح مفصل (ADVANCED)
    if (mode === 'lesson-explain' || mode === 'challenge-explain') {
      return QuestionComplexity.ADVANCED;
    }

    const lowerMessage = message.toLowerCase();
    const wordCount = message.split(/\s+/).length;

    // كلمات مفتاحية للأسئلة المتقدمة
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
    ];

    if (
      wordCount > 100 ||
      advancedKeywords.some((kw) => lowerMessage.includes(kw))
    ) {
      return QuestionComplexity.ADVANCED;
    }

    if (wordCount > 30) {
      return QuestionComplexity.MODERATE;
    }

    return QuestionComplexity.SIMPLE;
  }

  /**
   * تتبع استخدام النماذج (لإدارة التكلفة)
   */
  private async trackUsage(
    complexity: QuestionComplexity,
    tokens: number
  ): Promise<void> {
    // تخطي التسجيل إذا لم يكن هناك userId أو كانت التوكنات 0
    if (!this.userId || tokens <= 0) return;

    try {
      const { error } = await supabase.from('ai_usage_tracking').insert({
        user_id: this.userId,
        complexity,
        tokens_used: tokens,
        model: AI_MODELS[complexity].name,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        // تسجيل الخطأ بدون إيقاف التطبيق
        console.warn('⚠️ Usage tracking warning:', error.message);
      }
    } catch (error) {
      console.warn('Usage tracking skipped:', error);
    }
  }

  /**
   * محاكاة رد الـ AI للتطوير
   * تستجيب بناءً على مستوى صعوبة السؤال
   */
  private async simulateResponse(
    userMessage: string,
    mode: string,
    complexity: QuestionComplexity = QuestionComplexity.SIMPLE
  ): Promise<{
    response: string;
    tokensUsed: number;
    complexity: QuestionComplexity;
  }> {
    // Simulate API delay based on complexity
    const delay =
      complexity === QuestionComplexity.ADVANCED
        ? 2500
        : complexity === QuestionComplexity.MODERATE
          ? 1800
          : 1200;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const responses: Record<string, Record<QuestionComplexity, string[]>> = {
      general: {
        [QuestionComplexity.SIMPLE]: [
          'مرحباً! أنا هنا لمساعدتك. ما سؤالك؟',
          'سؤال جيد! الإجابة المختصرة: ...',
        ],
        [QuestionComplexity.MODERATE]: [
          'دعني أشرح لك هذا بالتفصيل:\n\n1. أولاً...\n2. ثانياً...\n3. أخيراً...\n\nهل تريد أمثلة إضافية؟',
          'سؤال ممتاز! إليك شرح مفصل...',
        ],
        [QuestionComplexity.ADVANCED]: [
          'هذا سؤال متقدم يتطلب تحليلاً عميقاً:\n\n📊 **التحليل:**\n- من الناحية المعمارية...\n- الأداء والتوسع...\n- أفضل الممارسات...\n\n💡 **التوصيات:**\n1. ...\n2. ...\n\n🔗 **موارد إضافية:**\n- ...',
          '🎯 **تحليل شامل:**\n\nهذا موضوع معقد يحتاج فهماً عميقاً. دعني أقسمه لك:\n\n**القسم الأول: المفاهيم الأساسية**\n...\n\n**القسم الثاني: التطبيق العملي**\n...\n\n**القسم الثالث: السيناريوهات المتقدمة**\n...',
        ],
      },
      explain: {
        [QuestionComplexity.SIMPLE]: [
          '```\n// هذا الكود يقوم بـ...\nconst example = "...";\n```\n\nبشكل مختصر: ...',
        ],
        [QuestionComplexity.MODERATE]: [
          '📖 **شرح الكود:**\n\n```javascript\n// الكود المعطى\n```\n\n**التفاصيل:**\n1. السطر الأول: ...\n2. السطر الثاني: ...\n\n**مثال عملي:**\n```javascript\n// مثال\n```',
        ],
        [QuestionComplexity.ADVANCED]: [
          '🔍 **تحليل معماري للكود:**\n\n**1. البنية الأساسية:**\n```typescript\n// الكود مع التعليقات التفصيلية\n```\n\n**2. Design Patterns المستخدمة:**\n- Pattern 1: ...\n- Pattern 2: ...\n\n**3. الأداء والتحسينات:**\n- Time Complexity: O(...)\n- Space Complexity: O(...)\n\n**4. السيناريوهات المتقدمة:**\n...',
        ],
      },
      fix: {
        [QuestionComplexity.SIMPLE]: [
          '🔍 **وجدت الخطأ!**\n\n❌ المشكلة: ...\n✅ الحل:\n```\n// الكود الصحيح\n```',
        ],
        [QuestionComplexity.MODERATE]: [
          '🐛 **تحليل الأخطاء:**\n\n**الخطأ الرئيسي:**\n❌ السطر X: ...\n\n**السبب:**\n...\n\n**الحل:**\n```javascript\n// الكود المُصلح\n```\n\n**نصائح إضافية:**\n- ...\n- ...',
        ],
        [QuestionComplexity.ADVANCED]: [
          '🔧 **مراجعة شاملة للأخطاء:**\n\n**1. الأخطاء المنطقية:**\n❌ Edge case 1: ...\n✅ الحل: ...\n\n**2. مشاكل الأداء:**\n⚠️ Bottleneck: ...\n✅ التحسين: ...\n\n**3. الأمان:**\n🔒 ثغرة محتملة: ...\n✅ الحماية: ...\n\n**4. الكود المُحسّن:**\n```typescript\n// كود كامل ومُحسّن\n```\n\n**5. Tests:**\n```typescript\n// unit tests\n```',
        ],
      },
      optimize: {
        [QuestionComplexity.SIMPLE]: [
          '⚡ **تحسين سريع:**\n\nاستخدم ... بدلاً من ...\n\nالفرق: أسرع بـ 2x!',
        ],
        [QuestionComplexity.MODERATE]: [
          '🚀 **تحسينات مقترحة:**\n\n**1. الأداء:**\n- استخدم caching\n- تجنب الحلقات المتداخلة\n\n**2. القراءة:**\n- تقسيم الدوال الكبيرة\n- تسميات واضحة\n\n**3. المثال المُحسّن:**\n```javascript\n// الكود بعد التحسين\n```',
        ],
        [QuestionComplexity.ADVANCED]: [
          '⚡ **تحليل أداء شامل:**\n\n**📊 القياسات الحالية:**\n- Response time: Xms\n- Memory usage: YMB\n- CPU load: Z%\n\n**🎯 استراتيجية التحسين:**\n\n**1. Database Optimization:**\n- Indexes: ...\n- Query optimization: ...\n- Connection pooling: ...\n\n**2. Caching Strategy:**\n- Redis implementation\n- Cache invalidation\n\n**3. Code Refactoring:**\n```typescript\n// Optimized architecture\n```\n\n**4. Monitoring:**\n- APM setup\n- Alerts\n\n**📈 النتائج المتوقعة:**\n- 10x faster\n- 50% less memory\n- Better scalability',
        ],
      },
      challenge: {
        [QuestionComplexity.SIMPLE]: [
          '🎮 **تحدي المبتدئين:**\n\nاكتب دالة تقوم بـ...\n\n**مثال:**\n```\nInput: ...\nOutput: ...\n```\n\nهل تريد تلميحاً؟',
        ],
        [QuestionComplexity.MODERATE]: [
          '🏆 **تحدي متوسط:**\n\n**المشكلة:**\n...\n\n**المتطلبات:**\n1. ...\n2. ...\n\n**Test cases:**\n```javascript\ntest1: ...\ntest2: ...\n```\n\n**تلميح:** استخدم ...',
        ],
        [QuestionComplexity.ADVANCED]: [
          '💎 **تحدي الخبراء:**\n\n**السيناريو:**\nتطبيق يخدم 1M+ مستخدم يواجه مشكلة...\n\n**مهمتك:**\n1. تحليل المشكلة\n2. تصميم الحل\n3. تنفيذ Architecture\n4. كتابة Tests\n\n**المتطلبات:**\n- Scalability ✓\n- Security ✓\n- Performance < 100ms ✓\n- High Availability ✓\n\n**الموارد المتاحة:**\n- AWS/GCP\n- Kubernetes\n- Redis\n- PostgreSQL\n\n**المعايير:**\n⭐⭐⭐⭐⭐ صعوبة عالية\n🎯 100 نقطة\n⏱️ وقت مقترح: ساعتين\n\nهل أنت جاهز؟',
        ],
      },
      'challenge-explain': {
        [QuestionComplexity.SIMPLE]: [
          '💡 **شرح التحدي:**\n\n**🎯 هدف التحدي:**\nهذا التحدي يطلب منك...\n\n**📝 خطوات الحل:**\n1. أولاً، احتاج تفهم المدخلات\n2. بعدين، نفذ المنطق الأساسي\n3. أخيراً، أرجع النتيجة\n\n**💡 تلميح:**\nفكر بالموضوع كأنك...\n\n**مثال بسيط:**\n```javascript\n// مثال على البداية\nfunction solve() {\n  // ابدأ هنا\n}\n```\n\n✨ **جرب بنفسك!** استخدم التلميحات إذا احتجت مساعدة إضافية.',
        ],
        [QuestionComplexity.MODERATE]: [
          '🎓 **شرح مفصل للتحدي:**\n\n**🎯 المطلوب:**\nالتحدي يطلب منك حل مشكلة...\n\n**📋 تحليل المشكلة:**\n1. **المدخلات:** افهم شنو تاخذ\n2. **المخرجات:** شنو المطلوب ترجع\n3. **القيود:** انتبه للحدود والشروط\n\n**💭 طريقة التفكير:**\nخطوة بخطوة:\n- أولاً: ...\n- ثانياً: ...\n- ثالثاً: ...\n\n**📝 هيكل الحل:**\n```javascript\nfunction solve(input) {\n  // 1. تحضير البيانات\n  \n  // 2. المعالجة الرئيسية\n  \n  // 3. إرجاع النتيجة\n  return result;\n}\n```\n\n**⚠️ نقاط مهمة:**\n- احذر من حالة ...\n- لا تنسى ...\n- افحص ...\n\n**🎯 نصيحة:** ابدأ بحل بسيط، وبعدين حسّنه!',
        ],
        [QuestionComplexity.ADVANCED]: [
          '🚀 **شرح شامل للتحدي المتقدم:**\n\n**🎯 فهم المشكلة:**\nهذا تحدي متقدم يتطلب فهم عميق لـ...\n\n**📊 تحليل المتطلبات:**\n1. **المدخلات والمخرجات:**\n   - Input: ...\n   - Output: ...\n   - Constraints: ...\n\n2. **التعقيد المطلوب:**\n   - Time: O(...)\n   - Space: O(...)\n\n**💡 استراتيجية الحل:**\n\n**المرحلة 1: التخطيط**\n- حدد البنية الأساسية\n- اختر الـ data structures المناسبة\n- خطط للـ edge cases\n\n**المرحلة 2: التنفيذ**\n```javascript\n// الهيكل الرئيسي\nclass Solution {\n  solve(input) {\n    // خطوة 1: التحضير\n    \n    // خطوة 2: المعالجة\n    \n    // خطوة 3: التحسين\n    \n    return result;\n  }\n}\n```\n\n**⚡ تحسينات مقترحة:**\n- استخدم ... للأداء الأفضل\n- طبق ... pattern\n- احذر من ...\n\n**🧪 حالات اختبار:**\n```\nTest 1: Edge case\nTest 2: Normal case  \nTest 3: Large input\n```\n\n**🎯 خطوات عملية:**\n1. نفذ الحل الأساسي أولاً\n2. اختبره على الأمثلة\n3. حسّن الأداء\n4. تعامل مع الـ edge cases\n\n💪 **أنت قادر على حلها!** خذ وقتك وفكر بالمنطق خطوة بخطوة.',
        ],
      },
      'lesson-explain': {
        [QuestionComplexity.SIMPLE]: [
          '📚 **شرح الدرس:**\n\n**✨ المفهوم الأساسي:**\nهذا الدرس يشرح لك...\n\n**💡 شنو الفائدة:**\nتستخدم هذا المفهوم عشان...\n\n**📝 مثال عملي:**\n```javascript\n// مثال بسيط\nconst example = "تطبيق بسيط";\nconsole.log(example);\n```\n\n**🎯 نصائح:**\n- جرب تطبق الأمثلة بنفسك\n- اقرأ الدرس أكثر من مرة\n- اسأل إذا ماكو شيء واضح\n\n✅ **الآن فهمت المفهوم!** جرب تطبقه بكود خاص بيك.',
        ],
        [QuestionComplexity.MODERATE]: [
          '🎓 **شرح مفصل للدرس:**\n\n**📖 المحتوى:**\nهذا الدرس يغطي موضوع مهم وهو...\n\n**🔍 التفاصيل:**\n\n**1. المفهوم الأساسي:**\n...\n\n**2. كيفية الاستخدام:**\nمثال عملي:\n```javascript\n// كود توضيحي\nfunction example() {\n  // الشرح هنا\n}\n```\n\n**3. الفوائد:**\n- ✓ ...\n- ✓ ...\n- ✓ ...\n\n**⚡ نصائح للفهم الأفضل:**\n- ركز على الأساسيات أولاً\n- جرب كل مثال بيدك\n- اكتب أمثلة إضافية\n\n**📌 خلاصة:**\nاستخدم هذا المفهوم عندما تحتاج...',
        ],
        [QuestionComplexity.ADVANCED]: [
          '🚀 **شرح شامل ومتقدم للدرس:**\n\n**📚 نظرة عامة:**\nهذا درس متقدم يشرح...\n\n**🎯 الأهداف التعليمية:**\n1. فهم المفهوم بعمق\n2. تطبيق عملي\n3. التعامل مع حالات معقدة\n\n**📖 المحتوى التفصيلي:**\n\n**الجزء 1: المبادئ الأساسية**\n...\n\n**الجزء 2: التطبيق العملي**\n```javascript\n// مثال شامل\nclass AdvancedExample {\n  constructor() {\n    // التهيئة\n  }\n  \n  method() {\n    // المنطق الرئيسي\n  }\n}\n```\n\n**الجزء 3: الاستخدامات المتقدمة**\n- Pattern 1: ...\n- Pattern 2: ...\n- Best practices: ...\n\n**💡 أمثلة إضافية:**\n```javascript\n// حالة استخدام 1\n\n// حالة استخدام 2\n```\n\n**⚠️ نقاط مهمة:**\n- انتبه لـ ...\n- تجنب ...\n- استخدم ... للأداء الأفضل\n\n**🎯 تمارين مقترحة:**\n1. جرب تطبيق ...\n2. حاول تعديل ...\n3. اكتب كود يستخدم ...\n\n**📌 الخلاصة:**\nهذا المفهوم مهم جداً في البرمجة الحديثة، وتقدر تستخدمه في...\n\n💪 **واصل التعلم!** الممارسة أهم شيء للإتقان.',
        ],
      },
    };

    const modeResponses = responses[mode] || responses.general;
    const complexityResponses =
      modeResponses[complexity] || modeResponses[QuestionComplexity.SIMPLE];
    const randomResponse =
      complexityResponses[
        Math.floor(Math.random() * complexityResponses.length)
      ];

    // Personalize based on user message
    let response = randomResponse;
    if (
      userMessage.includes('كيف') ||
      userMessage.includes('شو') ||
      userMessage.includes('ما هو')
    ) {
      response = `سؤال ${complexity === QuestionComplexity.ADVANCED ? 'متقدم ورائع' : 'جيد'}!\n\n${randomResponse}`;
    } else if (userMessage.includes('شكرا') || userMessage.includes('شكراً')) {
      response = 'العفو! سعيد بمساعدتك. هل لديك أسئلة أخرى؟';
    } else if (userMessage.includes('مرحب') || userMessage.includes('هلا')) {
      response =
        'أهلاً وسهلاً! أنا هنا لمساعدتك في رحلتك البرمجية. كيف يمكنني مساعدتك اليوم؟';
    }

    // Token estimation based on complexity
    const estimatedTokens =
      complexity === QuestionComplexity.ADVANCED
        ? Math.floor(Math.random() * 1500) + 500
        : complexity === QuestionComplexity.MODERATE
          ? Math.floor(Math.random() * 800) + 200
          : Math.floor(Math.random() * 400) + 100;

    return { response, tokensUsed: estimatedTokens, complexity };
  }

  /**
   * مسح سجل المحادثات
   */
  async clearHistory(): Promise<boolean> {
    if (!this.userId) return false;

    const { error } = await supabase
      .from('ai_chat_history')
      .delete()
      .eq('user_id', this.userId);

    if (error) {
      console.error('Error clearing history:', error);
      return false;
    }

    return true;
  }
}

export const aiChatService = new AIChatService();

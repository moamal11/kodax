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

/** حصة طلبات Gemini كما يعيدها السيرفر (نفس شكل coinService.AIQuota) */
export type { AIQuota } from './coinService';
import type { AIQuota } from './coinService';

/** مصدر الرد: smart = رد فوري محلي، cache = إجابة محفوظة، gemini = نموذج الذكاء (يُحسب من الحصة) */
export type AIReplySource = 'smart' | 'cache' | 'gemini';

/** خطأ مفهوم للمستخدم من خدمة الذكاء الاصطناعي */
export class AIServiceError extends Error {
  code: 'quota_exceeded' | 'auth' | 'unavailable' | 'busy' | 'solution_locked';
  remaining?: number;
  quota?: AIQuota | null;
  constructor(
    message: string,
    code: 'quota_exceeded' | 'auth' | 'unavailable' | 'busy' | 'solution_locked',
    remaining?: number,
    quota?: AIQuota | null
  ) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.remaining = remaining;
    this.quota = quota;
  }
}

/** آخر رسائل المحادثة التي تُرسل للسيرفر (حتى يكمل المساعد بدون ترحيب ومقدمات متكررة) */
const HISTORY_MESSAGES = 10;
const HISTORY_ITEM_CHARS = 2000;

export const AI_UNAVAILABLE_MESSAGE =
  'خدمة الذكاء الاصطناعي غير متاحة حالياً. تحقق من الإنترنت وحاول بعد قليل.';

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

// نماذج الذكاء الاصطناعي حسب المستوى (Google Gemini عبر Edge Function ai-chat)
// للعرض والتتبع فقط — السيرفر هو من يختار النموذج ويعيد اسمه في الرد
export const AI_MODELS = {
  [QuestionComplexity.SIMPLE]: {
    name: 'gemini-3.5-flash-lite',
    maxTokens: 300, // مختصر جداً للأسئلة البسيطة
    temperature: 0.7,
    cost: 'منخفضة',
  },
  [QuestionComplexity.MODERATE]: {
    name: 'gemini-3.8-flash',
    maxTokens: 800, // منظم ومختصر
    temperature: 0.7,
    cost: 'متوسطة',
  },
  [QuestionComplexity.ADVANCED]: {
    name: 'gemini-3.8-flash',
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
    conversationHistory: ChatMessage[] = [],
    options: { challengeId?: string } = {}
  ): Promise<{
    response: string;
    tokensUsed: number;
    complexity?: QuestionComplexity;
    source: AIReplySource;
    quota: AIQuota | null;
  }> {
    try {
      // آخر رسائل المحادثة الفعلية (بدون رسائل التحميل أو الأخطاء)
      const history = conversationHistory
        .filter((m) => !m.isLoading && m.content && (m.role === 'user' || m.role === 'assistant'))
        .slice(-HISTORY_MESSAGES)
        .map((m) => ({ role: m.role, content: m.content.slice(0, HISTORY_ITEM_CHARS) }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: userMessage, mode, history, ...(options.challengeId ? { challengeId: options.challengeId } : {}) },
      });

      if (error) {
        // قراءة سبب الرفض من الخادم (حد الاستخدام اليومي، تسجيل الدخول...)
        let body: any = null;
        try {
          body = await (error as any).context?.json?.();
        } catch {
          body = null;
        }
        if (body?.error === 'quota_exceeded') {
          throw new AIServiceError(
            body.message || 'خلصت طلبات الذكاء لليوم. تتجدد غداً.',
            'quota_exceeded',
            0,
            body.quota ?? null
          );
        }
        if (body?.error === 'ai_busy') {
          throw new AIServiceError(body.message, 'busy', undefined, body.quota ?? null);
        }
        if (
          (body?.error === 'ai_unavailable' || body?.error === 'message_too_long') &&
          typeof body.message === 'string'
        ) {
          // رسالة واضحة من السيرفر (تعطل مزود الـAI، مهلة، طلب طويل) — لا تُعرض كإجابة
          throw new AIServiceError(body.message, 'unavailable', undefined, body.quota ?? null);
        }
        if (body?.error === 'solution_locked' && typeof body.message === 'string') {
          // الحل الكامل = زر «إظهار الحل» (إعلان) — لا يُستهلك أي طلب من الحصة
          throw new AIServiceError(body.message, 'solution_locked');
        }
        if (body?.error === 'unauthorized') {
          throw new AIServiceError('سجّل الدخول لاستخدام مساعد الذكاء الاصطناعي.', 'auth');
        }
        throw new AIServiceError(AI_UNAVAILABLE_MESSAGE, 'unavailable');
      }

      if (!data || typeof data.reply !== 'string' || !data.reply) {
        throw new AIServiceError(AI_UNAVAILABLE_MESSAGE, 'unavailable');
      }

      const source: AIReplySource = data.source === 'smart' || data.source === 'cache' ? data.source : 'gemini';
      const tokensUsed = data.tokensUsed || 0;
      const estimatedComplexity = this.estimateComplexity(userMessage, mode);
      if (source === 'gemini') {
        await this.trackUsage(estimatedComplexity, tokensUsed, typeof data.model === 'string' ? data.model : undefined);
      }

      return {
        response: data.reply,
        tokensUsed,
        complexity: estimatedComplexity,
        source,
        quota: data.quota && typeof data.quota.limit === 'number' ? (data.quota as AIQuota) : null,
      };
    } catch (error: any) {
      if (error instanceof AIServiceError) throw error;
      console.error('AI Service Error:', error?.message || error);
      // لا نعرض ردوداً وهمية — نعرض رسالة واضحة بدلاً منها
      throw new AIServiceError(AI_UNAVAILABLE_MESSAGE, 'unavailable');
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
    tokens: number,
    model?: string
  ): Promise<void> {
    // تخطي التسجيل إذا لم يكن هناك userId أو كانت التوكنات 0
    if (!this.userId || tokens <= 0) return;

    try {
      const { error } = await supabase.from('ai_usage_tracking').insert({
        user_id: this.userId,
        complexity,
        tokens_used: tokens,
        model: model ?? AI_MODELS[complexity].name,
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

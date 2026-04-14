/**
 * contextMemoryService.ts
 *
 * خدمة الذاكرة السياقية للمستخدم
 * تتذكر تقدم المستخدم والأكواد السابقة والتحديات المحلولة
 */

import { supabase } from '@/lib/supabase';

export interface UserContext {
  userId: string;
  totalLessonsCompleted: number;
  totalChallengesCompleted: number;
  completedChallengeIds: string[];
  currentCourse?: string;
  currentLesson?: string;
  preferredLanguages: string[];
  recentCodes: Array<{
    code: string;
    language: string;
    timestamp: string;
  }>;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  lastActive: string;
}

export interface ConversationContext {
  userContext: UserContext;
  summary: string; // ملخص المحادثات السابقة
}

class ContextMemoryService {
  private userContext: UserContext | null = null;
  private userId: string | null = null;

  setUser(userId: string) {
    this.userId = userId;
    this.loadUserContext();
  }

  /**
   * تحميل سياق المستخدم الكامل من قاعدة البيانات
   */
  private async loadUserContext(): Promise<void> {
    if (!this.userId) return;

    try {
      // جلب تقدم المستخدم
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', this.userId);

      // جلب التحديات المنجزة
      const { data: challengesData } = await supabase
        .from('user_progress')
        .select('challenge_id, completed')
        .eq('user_id', this.userId)
        .eq('completed', true);

      // جلب آخر الأكواد (من المحادثات)
      const { data: recentCodesData } = await supabase
        .from('ai_messages')
        .select('content, created_at, mode')
        .eq('user_id', this.userId)
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(10);

      // حساب المستوى
      const completedCount = challengesData?.length || 0;
      let skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
      if (completedCount > 50) skillLevel = 'advanced';
      else if (completedCount > 20) skillLevel = 'intermediate';

      // استخراج الأكواد من المحادثات
      const recentCodes =
        recentCodesData
          ?.filter((msg) => this.containsCode(msg.content))
          .map((msg) => ({
            code: this.extractCode(msg.content),
            language: this.detectLanguage(msg.content),
            timestamp: msg.created_at,
          }))
          .slice(0, 5) || [];

      // بناء السياق
      this.userContext = {
        userId: this.userId,
        totalLessonsCompleted:
          progressData?.filter((p: any) => p.completed).length || 0,
        totalChallengesCompleted: completedCount,
        completedChallengeIds:
          challengesData?.map((c: any) => c.challenge_id) || [],
        preferredLanguages: this.extractPreferredLanguages(recentCodes),
        recentCodes,
        skillLevel,
        lastActive: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  }

  /**
   * الحصول على سياق المستخدم
   */
  async getUserContext(): Promise<UserContext | null> {
    if (!this.userContext && this.userId) {
      await this.loadUserContext();
    }
    return this.userContext;
  }

  /**
   * إنشاء prompt مخصص بناءً على سياق المستخدم
   */
  async getContextualPrompt(): Promise<string> {
    const context = await this.getUserContext();
    if (!context) {
      return 'أنت AI Tutor ذكي ومتفاعل لمنصة Kodax. احكي باللهجة العراقية بشكل ودود وواضح.';
    }

    const skillLevelText = {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
    };

    let prompt = `أنت AI Tutor ذكي ومتفاعل لمنصة Kodax. احكي باللهجة العراقية بشكل ودود وواضح.

معلومات المستخدم:
- المستوى: ${skillLevelText[context.skillLevel]}
- الدروس المنجزة: ${context.totalLessonsCompleted}
- التحديات المنجزة: ${context.totalChallengesCompleted}`;

    if (context.preferredLanguages.length > 0) {
      prompt += `\n- اللغات المفضلة: ${context.preferredLanguages.join(', ')}`;
    }

    if (context.recentCodes.length > 0) {
      prompt += `\n\nالمستخدم جالس يشتغل على أكواد مثل:\n`;
      context.recentCodes.slice(0, 2).forEach((code, i) => {
        prompt += `\n${i + 1}. ${code.language} - ${code.code.substring(0, 100)}...`;
      });
    }

    prompt += `\n\nتعليماتك:
1. احكي باللهجة العراقية (استخدم "شلون"، "هواية"، "شنو"، إلخ)
2. اشرح بأسلوب يناسب مستوى المستخدم
3. إذا المستخدم كتب كود، اعرضه بتنسيق حلو مع syntax highlighting
4. استخدم أمثلة من اللغات اللي المستخدم يفضلها
5. ذكّر المستخدم بإنجازاته لو يحتاج تشجيع
6. كن صريح وواضح، لا تتفلسف بلا داعي
7. كل كود يجب يكون داخل \`\`\`language block مع اسم اللغة`;

    return prompt;
  }

  /**
   * تحديث سياق المستخدم بعد إنجاز تحدي
   */
  async updateChallengeCompletion(challengeId: string): Promise<void> {
    if (this.userContext) {
      this.userContext.completedChallengeIds.push(challengeId);
      this.userContext.totalChallengesCompleted += 1;

      // إعادة حساب المستوى
      const count = this.userContext.totalChallengesCompleted;
      if (count > 50) this.userContext.skillLevel = 'advanced';
      else if (count > 20) this.userContext.skillLevel = 'intermediate';
    }
  }

  /**
   * إضافة كود جديد للتاريخ
   */
  async addRecentCode(code: string, language: string): Promise<void> {
    if (this.userContext) {
      this.userContext.recentCodes.unshift({
        code,
        language,
        timestamp: new Date().toISOString(),
      });

      // الاحتفاظ بآخر 5 أكواد فقط
      this.userContext.recentCodes = this.userContext.recentCodes.slice(0, 5);
    }
  }

  /**
   * التحقق من وجود كود في النص
   */
  private containsCode(text: string): boolean {
    return (
      /```[\s\S]*```|`[^`]+`/.test(text) ||
      /\b(function|const|let|var|def|class|public|private)\b/.test(text)
    );
  }

  /**
   * استخراج الكود من النص
   */
  private extractCode(text: string): string {
    const match = text.match(/```[\w]*\n([\s\S]*?)```/);
    if (match) return match[1];

    const inlineMatch = text.match(/`([^`]+)`/);
    if (inlineMatch) return inlineMatch[1];

    return text.substring(0, 200); // أول 200 حرف
  }

  /**
   * اكتشاف لغة البرمجة
   */
  private detectLanguage(text: string): string {
    if (/\b(const|let|var|function|=>)\b/.test(text)) return 'javascript';
    if (/\b(def|import|from|class)\b/.test(text)) return 'python';
    if (/\b(public|private|void|static)\b/.test(text)) return 'java';
    if (/#include|cout|cin/.test(text)) return 'cpp';
    return 'unknown';
  }

  /**
   * استخراج اللغات المفضلة
   */
  private extractPreferredLanguages(
    recentCodes: Array<{ language: string }>
  ): string[] {
    const langCount: { [key: string]: number } = {};

    recentCodes.forEach((code) => {
      if (code.language !== 'unknown') {
        langCount[code.language] = (langCount[code.language] || 0) + 1;
      }
    });

    return Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);
  }

  /**
   * الحصول على ملخص للمحادثة الحالية (للسياق)
   */
  async getConversationSummary(conversationId: string): Promise<string> {
    try {
      const { data } = await supabase
        .from('ai_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20);

      if (!data || data.length === 0) {
        return 'محادثة جديدة';
      }

      // إنشاء ملخص بسيط
      const topics: string[] = [];
      data.forEach((msg: any) => {
        if (msg.role === 'user') {
          const topic = msg.content.substring(0, 50);
          if (topic.length > 10) topics.push(topic);
        }
      });

      return topics.length > 0
        ? `المواضيع المذكورة: ${topics.slice(0, 3).join(' | ')}`
        : 'محادثة عامة';
    } catch (error) {
      console.error('Error getting conversation summary:', error);
      return '';
    }
  }

  /**
   * إعادة تحميل السياق (للتحديث الدوري)
   */
  async refresh(): Promise<void> {
    await this.loadUserContext();
  }
}

export const contextMemoryService = new ContextMemoryService();

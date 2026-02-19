/**
 * AI Conversations Service
 * خدمة إدارة المحادثات المتعددة مع AI
 */

import { supabase } from '@/lib/supabase';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  mode: string;
  total_messages: number;
  total_tokens: number;
  last_message_at: string;
  created_at: string;
  last_message_preview?: string;
}

export interface AIUsageStats {
  total_tokens_used: number;
  total_messages: number;
  conversations_count: number;
  daily_limit: number;
  tokens_used_today: number;
  usage_percentage: number; // النسبة المئوية للاستخدام
}

class ConversationsService {
  private userId: string | null = null;

  setUser(userId: string) {
    this.userId = userId;
  }

  /**
   * إنشاء محادثة جديدة
   */
  async createConversation(
    title: string,
    mode: string = 'general'
  ): Promise<Conversation | null> {
    if (!this.userId) return null;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: this.userId,
          title: title.substring(0, 100), // حد أقصى 100 حرف للعنوان
          mode,
        })
        .select()
        .single();

      if (error) throw error;

      return data as Conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  /**
   * جلب كل المحادثات للمستخدم
   */
  async getConversations(limit: number = 50): Promise<Conversation[]> {
    if (!this.userId) return [];

    try {
      const { data, error } = await supabase
        .from('ai_conversations_with_preview')
        .select('*')
        .eq('user_id', this.userId)
        .order('last_message_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data as Conversation[]) || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  /**
   * جلب محادثة معينة مع رسائلها
   */
  async getConversation(conversationId: string) {
    if (!this.userId) return null;

    try {
      const { data: conversation, error: convError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', this.userId)
        .single();

      if (convError) throw convError;

      const { data: messages, error: msgError } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      return {
        conversation: conversation as Conversation,
        messages: messages || [],
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  }

  /**
   * حذف محادثة
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', this.userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  /**
   * تحديث عنوان محادثة
   */
  async updateConversationTitle(
    conversationId: string,
    newTitle: string
  ): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ title: newTitle.substring(0, 100) })
        .eq('id', conversationId)
        .eq('user_id', this.userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating conversation title:', error);
      return false;
    }
  }

  /**
   * تحديث إحصائيات الاستخدام مباشرة (fallback إذا لم يكن هناك trigger)
   */
  async trackTokenUsage(tokensUsed: number): Promise<void> {
    if (!this.userId || tokensUsed <= 0) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // محاولة UPSERT مباشرة
      const { data: existing } = await supabase
        .from('ai_usage_stats')
        .select(
          'id, tokens_used_today, total_tokens_used, total_messages, conversations_count, last_reset_date'
        )
        .eq('user_id', this.userId)
        .single();

      if (existing) {
        // حساب عدد المحادثات الحقيقي
        const { count: convCount } = await supabase
          .from('ai_conversations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', this.userId);

        // تحديث: إعادة تعيين اليومي إذا تغير اليوم
        const resetDaily = existing.last_reset_date !== today;
        await supabase
          .from('ai_usage_stats')
          .update({
            total_tokens_used: (existing.total_tokens_used || 0) + tokensUsed,
            total_messages: (existing.total_messages || 0) + 1,
            conversations_count: convCount || 0,
            tokens_used_today: resetDaily
              ? tokensUsed
              : (existing.tokens_used_today || 0) + tokensUsed,
            last_reset_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // حساب عدد المحادثات
        const { count: convCount } = await supabase
          .from('ai_conversations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', this.userId);

        // إنشاء سجل جديد
        await supabase.from('ai_usage_stats').insert({
          user_id: this.userId,
          total_tokens_used: tokensUsed,
          total_messages: 1,
          conversations_count: convCount || 0,
          daily_limit: 300000,
          tokens_used_today: tokensUsed,
          last_reset_date: today,
        });
      }

      console.log(`📊 Tracked ${tokensUsed} tokens for user`);
    } catch (error) {
      // الجدول قد لا يكون موجوداً - سنحسب من ai_chat_history كـ fallback
      console.log(
        'Usage stats table not available, will calculate from history'
      );
    }
  }

  /**
   * جلب إحصائيات استخدام AI
   */
  async getUsageStats(): Promise<AIUsageStats | null> {
    if (!this.userId) return null;

    try {
      // أولاً: محاولة القراءة من ai_usage_stats
      const { data, error } = await supabase
        .from('ai_usage_stats')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // إذا الجدول غير موجود، استخدم fallback
        console.log(
          'ai_usage_stats not available, calculating from chat history...'
        );
        return this.getUsageStatsFromHistory();
      }

      // إذا لم يكن هناك سجل، إنشاء واحد جديد
      if (!data) {
        // حساب عدد المحادثات
        const { count: convCount } = await supabase
          .from('ai_conversations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', this.userId);

        const { data: newData, error: insertError } = await supabase
          .from('ai_usage_stats')
          .insert({
            user_id: this.userId,
            total_tokens_used: 0,
            total_messages: 0,
            conversations_count: convCount || 0,
            daily_limit: 300000,
            tokens_used_today: 0,
          })
          .select()
          .single();

        if (insertError) {
          console.log('Cannot create stats row, using fallback...');
          return this.getUsageStatsFromHistory();
        }

        return {
          ...(newData as any),
          usage_percentage: 0,
        };
      }

      // حساب النسبة المئوية
      const usagePercentage =
        data.daily_limit > 0
          ? Math.round((data.tokens_used_today / data.daily_limit) * 100)
          : 0;

      return {
        ...(data as any),
        usage_percentage: Math.min(usagePercentage, 100),
      };
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      // Fallback: حساب من chat_history
      return this.getUsageStatsFromHistory();
    }
  }

  /**
   * حساب إحصائيات الاستخدام من سجل الشات مباشرة (fallback)
   */
  private async getUsageStatsFromHistory(): Promise<AIUsageStats | null> {
    if (!this.userId) return null;

    try {
      // جلب كل الرسائل للمستخدم
      const { data: allMessages, error: allError } = await supabase
        .from('ai_chat_history')
        .select('tokens_used, created_at, role')
        .eq('user_id', this.userId);

      if (allError) {
        console.error('Error fetching chat history for stats:', allError);
        return null;
      }

      const messages = allMessages || [];
      const today = new Date().toISOString().split('T')[0];

      // حساب التوكنات الإجمالية
      const totalTokens = messages.reduce(
        (sum: number, m: any) => sum + (m.tokens_used || 0),
        0
      );
      const totalMessages = messages.filter(
        (m: any) => m.role === 'assistant'
      ).length;

      // حساب توكنات اليوم
      const todayTokens = messages
        .filter((m: any) => m.created_at && m.created_at.startsWith(today))
        .reduce((sum: number, m: any) => sum + (m.tokens_used || 0), 0);

      // حساب عدد المحادثات
      const { count: convCount } = await supabase
        .from('ai_conversations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', this.userId);

      const dailyLimit = 300000;
      const usagePercentage =
        dailyLimit > 0 ? Math.round((todayTokens / dailyLimit) * 100) : 0;

      return {
        total_tokens_used: totalTokens,
        total_messages: totalMessages,
        conversations_count: convCount || 0,
        daily_limit: dailyLimit,
        tokens_used_today: todayTokens,
        usage_percentage: Math.min(usagePercentage, 100),
      };
    } catch (error) {
      console.error('Error calculating stats from history:', error);
      return null;
    }
  }

  /**
   * إعادة تعيين الإحصائيات اليومية (يتم تلقائياً بواسطة trigger)
   */
  async resetDailyUsage(): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const { error } = await supabase
        .from('ai_usage_stats')
        .update({
          tokens_used_today: 0,
          last_reset_date: new Date().toISOString().split('T')[0],
        })
        .eq('user_id', this.userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error resetting daily usage:', error);
      return false;
    }
  }

  /**
   * التحقق من تجاوز الحد اليومي
   * @returns { canUse: boolean, percentage: number, remaining: number }
   */
  async checkUsageLimit(): Promise<{
    canUse: boolean;
    percentage: number;
    remaining: number;
    dailyLimit: number;
  }> {
    const stats = await this.getUsageStats();

    if (!stats) {
      // إذا لم نستطع الحصول على الإحصائيات، نسمح بالاستخدام
      return {
        canUse: true,
        percentage: 0,
        remaining: 300000,
        dailyLimit: 300000,
      };
    }

    const remaining = Math.max(0, stats.daily_limit - stats.tokens_used_today);
    const canUse = stats.usage_percentage < 100;

    return {
      canUse,
      percentage: stats.usage_percentage,
      remaining,
      dailyLimit: stats.daily_limit,
    };
  }
}

export const conversationsService = new ConversationsService();

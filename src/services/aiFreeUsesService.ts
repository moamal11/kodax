/**
 * aiFreeUsesService.ts
 *
 * خدمة تتبع الاستخدام المجاني للذكاء الاصطناعي
 * كل مستخدم يحصل على 3 محاولات حل + 3 محاولات شرح مجانية (مرة واحدة فقط)
 */

import { supabase } from '@/lib/supabase';

export interface AIFreeUses {
  solve: number;
  explain: number;
}

class AIFreeUsesService {
  /**
   * جلب عدد المحاولات المتبقية للمستخدم
   */
  async getFreeUses(userId: string): Promise<AIFreeUses> {
    try {
      const { data, error } = await supabase.rpc('get_ai_free_uses', {
        p_user_id: userId,
      });

      if (error) {
        return this._getFreeUsesDirect(userId);
      }

      return {
        solve: data?.solve ?? 3,
        explain: data?.explain ?? 3,
      };
    } catch (e) {
      return this._getFreeUsesDirect(userId);
    }
  }

  /**
   * استخدام محاولة حل/شرح مجانية
   * @returns remaining uses after decrement, or -1 if no uses left
   */
  async useAttempt(userId: string, type: 'solve' | 'explain'): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('use_ai_free_attempt', {
        p_user_id: userId,
        p_type: type,
      });

      if (error) {
        return this._useAttemptDirect(userId, type);
      }

      if (data?.success) {
        return data.remaining;
      }

      return -1; // no uses remaining
    } catch (e) {
      return this._useAttemptDirect(userId, type);
    }
  }

  /**
   * Fallback: direct query if RPC not available
   */
  private async _getFreeUsesDirect(userId: string): Promise<AIFreeUses> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('ai_solve_uses_remaining, ai_explain_uses_remaining')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return { solve: 3, explain: 3 };
      }

      return {
        solve: data.ai_solve_uses_remaining ?? 3,
        explain: data.ai_explain_uses_remaining ?? 3,
      };
    } catch {
      return { solve: 3, explain: 3 };
    }
  }

  /**
   * Fallback: direct update if RPC not available
   */
  private async _useAttemptDirect(
    userId: string,
    type: 'solve' | 'explain'
  ): Promise<number> {
    try {
      const col =
        type === 'solve'
          ? 'ai_solve_uses_remaining'
          : 'ai_explain_uses_remaining';

      // Read current value
      const { data: profile } = await supabase
        .from('profiles')
        .select(col)
        .eq('id', userId)
        .single();

      const current = (profile as any)?.[col] ?? 3;
      if (current <= 0) return -1;

      // Decrement
      await supabase
        .from('profiles')
        .update({ [col]: current - 1 })
        .eq('id', userId);

      return current - 1;
    } catch {
      return -1;
    }
  }
}

export const aiFreeUsesService = new AIFreeUsesService();

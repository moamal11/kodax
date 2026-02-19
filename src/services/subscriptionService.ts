/**
 * Subscription Service
 * Handles subscription management, feature access control, and payment processing
 */

import { supabase } from '@/lib/supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar: string;
  duration_months: number;
  price_iqd: number;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
  payment_method?: string;
  payment_reference?: string;
}

export interface FeatureAccess {
  canAccess: boolean;
  reason?: 'subscribed' | 'free_tier' | 'limit_reached' | 'no_access';
  remainingUses?: number;
  totalLimit?: number;
}

// Feature definitions
export const FEATURES = {
  CODE_EDITOR: 'code_editor', // Free
  AI_CODE_REVIEW: 'ai_code_review', // Paid only
  AI_CHAT: 'ai_chat', // Paid only
  CHALLENGES: 'challenges', // 3 free, rest paid
  ADVANCED_ANALYTICS: 'advanced_analytics', // Paid only
  PREMIUM_BADGES: 'premium_badges', // Paid only
  LEADERBOARD_ADVANCED: 'leaderboard_advanced', // Paid only
} as const;

// Free tier limits
const FREE_LIMITS = {
  [FEATURES.CHALLENGES]: 3,
  [FEATURES.AI_CODE_REVIEW]: 0,
  [FEATURES.AI_CHAT]: 0,
};

/**
 * Get all available subscription plans
 */
export async function getSubscriptionPlans(): Promise<{
  success: boolean;
  plans?: SubscriptionPlan[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_iqd', { ascending: true });

    if (error) throw error;

    return { success: true, plans: data };
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return { success: false, error: 'Failed to fetch subscription plans' };
  }
}

/**
 * Get user's active subscription
 */
export async function getUserSubscription(
  userId: string
): Promise<{
  success: boolean;
  subscription?: UserSubscription;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, subscription: data || undefined };
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return { success: false, error: 'Failed to fetch subscription' };
  }
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const { subscription } = await getUserSubscription(userId);
  return !!subscription;
}

/**
 * Check if user can access a feature
 */
export async function canAccessFeature(
  userId: string,
  featureName: string
): Promise<FeatureAccess> {
  try {
    // Check if user has active subscription
    const isSubscribed = await hasActiveSubscription(userId);

    if (isSubscribed) {
      return {
        canAccess: true,
        reason: 'subscribed',
      };
    }

    // Check if feature is free
    if (featureName === FEATURES.CODE_EDITOR) {
      return {
        canAccess: true,
        reason: 'free_tier',
      };
    }

    // Check free tier limits
    const limit = FREE_LIMITS[featureName as keyof typeof FREE_LIMITS];

    if (limit === undefined || limit === 0) {
      return {
        canAccess: false,
        reason: 'no_access',
      };
    }

    // Get user's usage
    const { data, error } = await supabase
      .from('free_feature_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .gte('reset_date', new Date().toISOString().split('T')[0])
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      // First time using feature
      return {
        canAccess: true,
        reason: 'free_tier',
        remainingUses: limit,
        totalLimit: limit,
      };
    }

    const remaining = limit - data.usage_count;

    return {
      canAccess: remaining > 0,
      reason: remaining > 0 ? 'free_tier' : 'limit_reached',
      remainingUses: Math.max(0, remaining),
      totalLimit: limit,
    };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return {
      canAccess: false,
      reason: 'no_access',
    };
  }
}

/**
 * Increment feature usage (for free tier)
 */
export async function incrementFeatureUsage(
  userId: string,
  featureName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('increment_feature_usage', {
      p_user_id: userId,
      p_feature_name: featureName,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error incrementing feature usage:', error);
    return { success: false, error: 'Failed to increment usage' };
  }
}

/**
 * Create a new subscription
 */
export async function createSubscription(
  userId: string,
  planId: string,
  paymentMethod: string,
  paymentReference: string
): Promise<{
  success: boolean;
  subscriptionId?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('create_subscription', {
      p_user_id: userId,
      p_plan_id: planId,
      p_payment_method: paymentMethod,
      p_payment_reference: paymentReference,
    });

    if (error) throw error;

    return { success: true, subscriptionId: data };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { success: false, error: 'Failed to create subscription' };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ status: 'cancelled', auto_renew: false })
      .eq('id', subscriptionId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { success: false, error: 'Failed to cancel subscription' };
  }
}

/**
 * Get subscription history for user
 */
export async function getSubscriptionHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('subscription_history')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, history: data };
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    return { success: false, error: 'Failed to fetch history' };
  }
}

/**
 * Get feature usage stats for user
 */
export async function getFeatureUsage(userId: string) {
  try {
    const { data, error } = await supabase
      .from('free_feature_limits')
      .select('*')
      .eq('user_id', userId)
      .gte('reset_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;

    return { success: true, usage: data };
  } catch (error) {
    console.error('Error fetching feature usage:', error);
    return { success: false, error: 'Failed to fetch usage' };
  }
}

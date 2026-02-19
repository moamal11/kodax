/**
 * Subscription Context
 * Provides subscription state and feature access control throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getUserSubscription,
  canAccessFeature,
  getSubscriptionPlans,
  UserSubscription,
  SubscriptionPlan,
  FeatureAccess,
} from '@/services/subscriptionService';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  isSubscribed: boolean;
  isLoading: boolean;
  checkFeatureAccess: (featureName: string) => Promise<FeatureAccess>;
  refreshSubscription: () => Promise<void>;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
  subscriptionModalVisible: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
  userId: string;
}

export function SubscriptionProvider({ children, userId }: SubscriptionProviderProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);

  const loadSubscription = async () => {
    setIsLoading(true);
    try {
      const [subResult, plansResult] = await Promise.all([
        getUserSubscription(userId),
        getSubscriptionPlans(),
      ]);

      if (subResult.success) {
        setSubscription(subResult.subscription || null);
      }

      if (plansResult.success && plansResult.plans) {
        setPlans(plansResult.plans);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadSubscription();
    }
  }, [userId]);

  const checkFeatureAccess = async (featureName: string): Promise<FeatureAccess> => {
    return await canAccessFeature(userId, featureName);
  };

  const refreshSubscription = async () => {
    await loadSubscription();
  };

  const openSubscriptionModal = () => {
    setSubscriptionModalVisible(true);
  };

  const closeSubscriptionModal = () => {
    setSubscriptionModalVisible(false);
  };

  const value: SubscriptionContextType = {
    subscription,
    plans,
    isSubscribed: !!subscription,
    isLoading,
    checkFeatureAccess,
    refreshSubscription,
    openSubscriptionModal,
    closeSubscriptionModal,
    subscriptionModalVisible,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

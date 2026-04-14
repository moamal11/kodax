/**
 * Points Context - نظام Hybrid
 * إدارة نظام النقاط والاشتراك المميز من Supabase
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { hybridSyncService } from '@/services/hybridSyncService';
import { supabase } from '@/lib/supabase';
import {
  PREMIUM_SUBSCRIPTION_COST,
  POINTS_REWARDS,
  CURRENCY_ICONS,
  CURRENCY_COLORS,
  POINTS_PACKAGES,
} from '@/services/pointsService';

interface PointsContextType {
  // النقاط (رصيد المتجر - للشراء)
  points: number;
  lifetimePoints: number;
  isLoading: boolean;

  // نظام العملات المزدوج
  xpPoints: number; // ⚡ نقاط الخبرة
  storeCredits: number; // 💎 رصيد المتجر

  // الاشتراك المميز
  isPremium: boolean;
  premiumDaysRemaining: number;
  premiumExpiryDate: Date | null;

  // الدورات والأقسام المفتوحة
  unlockedCourses: string[];
  unlockedSections: string[];
  isCourseUnlocked: (courseId: string) => boolean;
  isSectionUnlocked: (sectionId: string) => boolean;

  // العمليات
  addPoints: (amount: number, reason: string) => Promise<boolean>;
  addXP: (amount: number, reason: string) => Promise<boolean>;
  spendPoints: (
    amount: number,
    reason: string
  ) => Promise<{ success: boolean; error?: string }>;
  purchasePoints: (
    packageId: string
  ) => Promise<{ success: boolean; points?: number; error?: string }>;
  purchasePremium: () => Promise<{ success: boolean; error?: string }>;
  unlockCourse: (
    courseId: string,
    cost: number,
    courseName: string
  ) => Promise<{ success: boolean; error?: string }>;
  unlockSection: (
    sectionId: string,
    cost: number,
    sectionName: string
  ) => Promise<{ success: boolean; error?: string }>;
  unlockField: (
    fieldId: string,
    discountedCost: number,
    courseIds: string[]
  ) => Promise<{ success: boolean; error?: string }>;
  calculateFullCourseCost: (courseId: string, fullPrice: number) => number;

  // التحديث
  refreshPoints: () => Promise<void>;

  // الـ Modal
  pointsModalVisible: boolean;
  openPointsModal: () => void;
  closePointsModal: () => void;

  // ثوابت
  PREMIUM_COST: number;
  REWARDS: typeof POINTS_REWARDS;
  CURRENCY_ICONS: typeof CURRENCY_ICONS;
  CURRENCY_COLORS: typeof CURRENCY_COLORS;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

interface PointsProviderProps {
  children: ReactNode;
  userId?: string;
}

export function PointsProvider({ children, userId }: PointsProviderProps) {
  // ===== الحالة =====
  const [points, setPoints] = useState(0);
  const [lifetimePoints, setLifetimePoints] = useState(0);
  const [storeCredits, setStoreCredits] = useState(0);
  const [xpPoints, setXpPoints] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumDaysRemaining, setPremiumDaysRemaining] = useState(0);
  const [premiumExpiryDate, setPremiumExpiryDate] = useState<Date | null>(null);
  const [unlockedCourses, setUnlockedCourses] = useState<string[]>([]);
  const [unlockedSections, setUnlockedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pointsModalVisible, setPointsModalVisible] = useState(false);

  // ===== تحميل البيانات من Supabase =====
  const loadData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // تعيين المستخدم
      await hybridSyncService.setUser(userId);

      // جلب النقاط من Supabase
      const pointsData = await hybridSyncService.getFullPointsData();
      setPoints(pointsData.totalPoints);
      setLifetimePoints(pointsData.earnedPoints + pointsData.purchasedPoints);
      setStoreCredits(pointsData.storeCredits);

      // جلب XP من Supabase
      const userStats = await hybridSyncService.getUserXP();
      setXpPoints(userStats.xp);

      // جلب حالة الاشتراك من Supabase
      const premiumStatus = await hybridSyncService.getPremiumStatus();
      setIsPremium(premiumStatus.isPremium);
      setPremiumDaysRemaining(premiumStatus.daysRemaining);
      setPremiumExpiryDate(
        premiumStatus.expiresAt ? new Date(premiumStatus.expiresAt) : null
      );

      // جلب الكورسات المفتوحة من Supabase
      const courses = await hybridSyncService.getAllUnlockedCourses();
      setUnlockedCourses(courses);

      // جلب الأقسام المفتوحة من Supabase
      const sections = await hybridSyncService.getAllUnlockedSections();
      setUnlockedSections(sections);
    } catch (error) {
      console.error('Error loading points data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== إضافة نقاط =====
  const addPoints = async (
    amount: number,
    reason: string
  ): Promise<boolean> => {
    const result = await hybridSyncService.addPoints(amount, reason);
    if (result) {
      await loadData();
    }
    return result;
  };

  // ===== إضافة XP =====
  const addXP = async (amount: number, reason: string): Promise<boolean> => {
    // XP يُضاف تلقائياً عند إكمال الدروس
    return true;
  };

  // ===== خصم نقاط =====
  const spendPoints = async (amount: number, reason: string) => {
    const result = await hybridSyncService.deductPoints(amount, reason);
    if (result.success) {
      await loadData();
    }
    return result;
  };

  // ===== شراء نقاط =====
  const purchasePoints = async (packageId: string) => {
    const pkg = POINTS_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return { success: false, error: 'باقة غير موجودة' };
    }

    const totalPoints = pkg.points + pkg.bonus;
    const result = await hybridSyncService.purchasePoints(
      totalPoints,
      packageId
    );

    if (result.success) {
      await loadData();
      return { success: true, points: totalPoints };
    }
    return result;
  };

  // ===== التحقق من حظر الشراء =====
  const checkPurchaseBlock = async (): Promise<boolean> => {
    if (!userId) return false;
    try {
      const { data } = await supabase.rpc('check_user_restrictions', {
        p_user_id: userId,
      });
      return data?.is_purchase_blocked === true;
    } catch {
      return false; // إذا فشل التحقق، نسمح بالشراء
    }
  };

  // ===== شراء الاشتراك المميز =====
  const purchasePremium = async () => {
    // ⚡ التحقق من حظر الشراء
    if (await checkPurchaseBlock()) {
      return {
        success: false,
        error: 'تم تقييد عمليات الشراء على حسابك. تواصل مع الإدارة.',
      };
    }

    const result = await hybridSyncService.purchasePremium(
      PREMIUM_SUBSCRIPTION_COST
    );
    if (result.success) {
      await loadData();
    }
    return result;
  };

  // ===== فتح دورة =====
  const unlockCourse = async (
    courseId: string,
    cost: number,
    courseName: string
  ) => {
    // ⚡ التحقق من حظر الشراء (فقط عند وجود تكلفة)
    if (cost > 0 && (await checkPurchaseBlock())) {
      return {
        success: false,
        error: 'تم تقييد عمليات الشراء على حسابك. تواصل مع الإدارة.',
      };
    }

    const result = await hybridSyncService.unlockCourse(courseId, cost);
    if (result.success) {
      await loadData();
    }
    return result;
  };

  // ===== فتح قسم =====
  const unlockSection = async (
    sectionId: string,
    cost: number,
    sectionName: string
  ) => {
    return { success: false, error: 'غير متاح حالياً' };
  };

  // ===== فتح جميع كورسات المجال (خصم 15%) =====
  const unlockField = async (
    fieldId: string,
    discountedCost: number,
    courseIds: string[]
  ) => {
    // ⚡ التحقق من حظر الشراء
    if (await checkPurchaseBlock()) {
      return {
        success: false,
        error: 'تم تقييد عمليات الشراء على حسابك. تواصل مع الإدارة.',
      };
    }

    // فتح كل كورس مدفوع غير مفتوح بخصم التكلفة مرة واحدة
    const result = await hybridSyncService.unlockCourse(
      `field:${fieldId}`,
      discountedCost
    );
    if (result.success) {
      // فتح كل الكورسات المدفوعة في المجال
      for (const cid of courseIds) {
        if (!unlockedCourses.includes(cid)) {
          await hybridSyncService.unlockCourse(cid, 0); // بدون خصم إضافي
        }
      }
      await loadData();
    }
    return result;
  };

  // ===== حساب تكلفة الكورس الكامل =====
  const calculateFullCourseCost = (
    courseId: string,
    fullPrice: number
  ): number => {
    if (unlockedCourses.includes(courseId)) {
      return 0;
    }
    return fullPrice;
  };

  // ===== التحقق من فتح دورة =====
  const isCourseUnlocked = (courseId: string) => {
    return unlockedCourses.includes(courseId);
  };

  // ===== التحقق من فتح قسم =====
  const isSectionUnlocked = (sectionId: string) => {
    return unlockedSections.includes(sectionId);
  };

  // ===== التحديث =====
  const refreshPoints = async () => {
    await loadData();
  };

  const value: PointsContextType = {
    points,
    lifetimePoints,
    isLoading,
    xpPoints,
    storeCredits,
    isPremium,
    premiumDaysRemaining,
    premiumExpiryDate,
    unlockedCourses,
    unlockedSections,
    isCourseUnlocked,
    isSectionUnlocked,
    addPoints,
    addXP,
    spendPoints,
    purchasePoints,
    purchasePremium,
    unlockCourse,
    unlockSection,
    unlockField,
    calculateFullCourseCost,
    refreshPoints,
    pointsModalVisible,
    openPointsModal: () => setPointsModalVisible(true),
    closePointsModal: () => setPointsModalVisible(false),
    PREMIUM_COST: PREMIUM_SUBSCRIPTION_COST,
    REWARDS: POINTS_REWARDS,
    CURRENCY_ICONS,
    CURRENCY_COLORS,
  };

  return (
    <PointsContext.Provider value={value}>{children}</PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}

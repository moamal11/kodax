/**
 * خدمة النقاط - Kodax Points Service
 * نظام النقاط للشراء وفتح الميزات والدورات
 * النقاط منفصلة عن XP - النقاط للشراء فقط
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== ثوابت النظام =====
const STORAGE_KEY = '@kodax_points_data';

// تكلفة الاشتراك المميز بالنقاط (شهري)
export const PREMIUM_SUBSCRIPTION_COST = 2500;

// مدة الاشتراك المميز بالأيام
export const PREMIUM_DURATION_DAYS = 30;

// باقات شراء النقاط بالدينار العراقي
export interface PointsPackage {
  id: string;
  points: number;
  price: number;
  currency: string;
  label: string;
  popular: boolean;
  bonus: number;
  savings?: string; // نسبة التوفير
}

// الباقات الأربعة الجديدة بالدينار العراقي
export const POINTS_PACKAGES: PointsPackage[] = [
  {
    id: 'pack_550',
    points: 550,
    price: 5000,
    currency: 'IQD',
    label: '550',
    popular: false,
    bonus: 0,
    savings: '',
  },
  {
    id: 'pack_1200',
    points: 1200,
    price: 10000,
    currency: 'IQD',
    label: '1,200',
    popular: false,
    bonus: 100,
    savings: '10%',
  },
  {
    id: 'pack_1800',
    points: 1800,
    price: 15000,
    currency: 'IQD',
    label: '1,800',
    popular: true,
    bonus: 150,
    savings: '15%',
  },
  {
    id: 'pack_2500',
    points: 2500,
    price: 20000,
    currency: 'IQD',
    label: '2,500',
    popular: false,
    bonus: 250,
    savings: '20%',
  },
];

// أنواع العملات في التطبيق
export type CurrencyType = 'xp' | 'credits' | 'coins';

// أيقونات العملات (أسماء Ionicons)
export const CURRENCY_ICONS = {
  xp: 'flash', // نقاط الخبرة - تُكتسب من الدراسة (برق)
  credits: 'diamond', // رصيد المتجر (ماس)
  coins: 'cash', // للشراء والمعاملات (عملة)
  star: 'star', // للإنجازات
};

// ألوان العملات
export const CURRENCY_COLORS = {
  xp: '#fbbf24', // ذهبي لـ XP
  credits: '#a78bfa', // بنفسجي للـ Credits
  coins: '#f59e0b', // برتقالي للـ Coins
};

// مكافآت إكمال الأقسام (نقاط بسيطة عند إكمال قسم كامل)
export const SECTION_REWARDS = {
  COMPLETE_SECTION_EASY: 50,
  COMPLETE_SECTION_MEDIUM: 100,
  COMPLETE_SECTION_HARD: 150,
};

// للتوافق مع الكود القديم
export const POINTS_REWARDS = {
  COMPLETE_LESSON: 0, // لا نقاط للدرس الواحد
  COMPLETE_CHALLENGE_EASY: 0, // لا نقاط للتحدي
  COMPLETE_CHALLENGE_MEDIUM: 0,
  COMPLETE_CHALLENGE_HARD: 0,
  COMPLETE_COURSE: 100, // نقاط بسيطة عند إكمال دورة كاملة
  DAILY_LOGIN: 0, // لا نقاط يومية
  STREAK_BONUS_7: 50, // مكافأة بسيطة
  STREAK_BONUS_30: 100,
  QUIZ_PERFECT_SCORE: 0,
  FIRST_LESSON: 0,
  FIRST_CHALLENGE: 0,
};

// تكلفة فتح الدورات بالنقاط (حسب المستوى)
export const COURSE_UNLOCK_COSTS = {
  beginner: 0, // مجاني
  intermediate: 300, // متوسط
  advanced: 600, // متقدم
};

// ===== أنواع البيانات =====
export interface PointsData {
  totalPoints: number; // مجموع النقاط المتاحة للشراء (Credits فقط)
  purchasedPoints: number; // النقاط المشتراة (Credits)
  earnedPoints: number; // النقاط المكتسبة من الدراسة (لا تُستخدم للشراء)
  spentPoints: number; // النقاط المصروفة
  premiumExpiresAt: string | null;
  unlockedCourses: string[]; // الدورات المفتوحة
  unlockedSections: string[]; // الأقسام المفتوحة (للشراء المجزأ)
  purchaseHistory: PointsPurchase[];
  transactionHistory: PointsTransaction[];
  // نظام العملات المزدوج
  xpPoints: number; // ⚡ نقاط الخبرة (للعرض فقط - لا تُصرف)
  storeCredits: number; // 💎 رصيد المتجر (للشراء)
}

export interface PointsPurchase {
  id: string;
  packageId: string;
  points: number;
  price: number;
  timestamp: string;
}

export interface PointsTransaction {
  id: string;
  type: 'earned' | 'spent' | 'purchased';
  amount: number;
  reason: string;
  timestamp: string;
}

// ===== الحالة الافتراضية =====
const DEFAULT_POINTS_DATA: PointsData = {
  totalPoints: 0, // لا نقاط مجانية
  purchasedPoints: 0,
  earnedPoints: 0,
  spentPoints: 0,
  premiumExpiresAt: null,
  unlockedCourses: [],
  unlockedSections: [], // الأقسام المفتوحة
  purchaseHistory: [],
  transactionHistory: [],
  // نظام العملات المزدوج
  xpPoints: 0, // ⚡ نقاط الخبرة
  storeCredits: 0, // 💎 رصيد المتجر
};

// ===== خدمة النقاط =====
class PointsService {
  private data: PointsData = DEFAULT_POINTS_DATA;
  private initialized: boolean = false;

  // تهيئة الخدمة
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.data = { ...DEFAULT_POINTS_DATA, ...JSON.parse(stored) };
      }
      this.initialized = true;
      this.checkPremiumExpiry();
    } catch (error) {
      console.error('Error initializing points service:', error);
      this.data = DEFAULT_POINTS_DATA;
    }
  }

  // حفظ البيانات
  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving points data:', error);
    }
  }

  // إضافة معاملة
  private addTransaction(
    type: 'earned' | 'spent' | 'purchased',
    amount: number,
    reason: string
  ): void {
    this.data.transactionHistory.unshift({
      id: `txn_${Date.now()}`,
      type,
      amount,
      reason,
      timestamp: new Date().toISOString(),
    });
    // الاحتفاظ بآخر 100 معاملة فقط
    if (this.data.transactionHistory.length > 100) {
      this.data.transactionHistory = this.data.transactionHistory.slice(0, 100);
    }
  }

  // التحقق من انتهاء الاشتراك
  private checkPremiumExpiry(): void {
    if (this.data.premiumExpiresAt) {
      const expiry = new Date(this.data.premiumExpiresAt);
      if (expiry <= new Date()) {
        this.data.premiumExpiresAt = null;
      }
    }
  }

  // ===== شراء النقاط =====

  // شراء باقة نقاط (محاكاة - يتم التكامل مع بوابة الدفع لاحقاً)
  async purchasePoints(packageId: string): Promise<{
    success: boolean;
    points?: number;
    error?: string;
  }> {
    await this.initialize();

    const pkg = POINTS_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return { success: false, error: 'باقة غير موجودة' };
    }

    const totalPoints = pkg.points + pkg.bonus;

    // تحديث رصيد المتجر (Store Credits)
    this.data.totalPoints += totalPoints;
    this.data.storeCredits = (this.data.storeCredits || 0) + totalPoints;
    this.data.purchasedPoints += totalPoints;

    // حفظ سجل الشراء
    this.data.purchaseHistory.push({
      id: `purchase_${Date.now()}`,
      packageId: pkg.id,
      points: totalPoints,
      price: pkg.price,
      timestamp: new Date().toISOString(),
    });

    this.addTransaction(
      'purchased',
      totalPoints,
      `شراء ${pkg.label} كريدتس${pkg.bonus > 0 ? ` + ${pkg.bonus} مكافأة` : ''}`
    );

    await this.save();
    return { success: true, points: totalPoints };
  }

  // ===== النقاط =====

  // الحصول على النقاط الحالية
  getPoints(): number {
    return this.data.totalPoints;
  }

  // الحصول على بيانات النقاط الكاملة
  async getPointsData(): Promise<PointsData> {
    await this.initialize();
    return { ...this.data };
  }

  // إضافة نقاط مكتسبة (من إكمال قسم كامل فقط)
  async addPoints(
    amount: number,
    reason: string
  ): Promise<{ success: boolean; newTotal: number }> {
    await this.initialize();

    this.data.totalPoints += amount;
    this.data.earnedPoints += amount;
    this.addTransaction('earned', amount, reason);

    await this.save();

    return { success: true, newTotal: this.data.totalPoints };
  }

  // خصم نقاط
  async spendPoints(
    amount: number,
    reason: string
  ): Promise<{ success: boolean; newTotal: number; error?: string }> {
    await this.initialize();

    if (this.data.totalPoints < amount) {
      return {
        success: false,
        newTotal: this.data.totalPoints,
        error: 'نقاط غير كافية',
      };
    }

    this.data.totalPoints -= amount;
    this.data.spentPoints += amount;
    this.addTransaction('spent', amount, reason);

    await this.save();

    return { success: true, newTotal: this.data.totalPoints };
  }

  // ===== الاشتراك المميز =====

  // التحقق من الاشتراك المميز
  isPremium(): boolean {
    if (!this.data.premiumExpiresAt) return false;
    return new Date(this.data.premiumExpiresAt) > new Date();
  }

  // الحصول على تاريخ انتهاء الاشتراك
  getPremiumExpiryDate(): Date | null {
    if (!this.data.premiumExpiresAt) return null;
    return new Date(this.data.premiumExpiresAt);
  }

  // الأيام المتبقية للاشتراك
  getPremiumDaysRemaining(): number {
    if (!this.isPremium()) return 0;
    const expiry = new Date(this.data.premiumExpiresAt!);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // شراء الاشتراك المميز
  async purchasePremium(): Promise<{
    success: boolean;
    error?: string;
    expiresAt?: string;
  }> {
    await this.initialize();

    if (this.data.totalPoints < PREMIUM_SUBSCRIPTION_COST) {
      return {
        success: false,
        error: `تحتاج ${PREMIUM_SUBSCRIPTION_COST} نقطة. لديك ${this.data.totalPoints} نقطة فقط.`,
      };
    }

    // خصم النقاط
    const result = await this.spendPoints(
      PREMIUM_SUBSCRIPTION_COST,
      'الاشتراك المميز الشهري'
    );
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // تعيين تاريخ الانتهاء
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + PREMIUM_DURATION_DAYS);
    this.data.premiumExpiresAt = expiresAt.toISOString();

    await this.save();

    return { success: true, expiresAt: this.data.premiumExpiresAt };
  }

  // ===== فتح الدورات =====

  // التحقق من فتح دورة
  isCourseUnlocked(courseId: string): boolean {
    return this.data.unlockedCourses.includes(courseId);
  }

  // الحصول على الدورات المفتوحة
  getUnlockedCourses(): string[] {
    return [...this.data.unlockedCourses];
  }

  // فتح دورة بالنقاط
  async unlockCourse(
    courseId: string,
    cost: number,
    courseName: string
  ): Promise<{ success: boolean; error?: string }> {
    await this.initialize();

    // التحقق إذا كانت مفتوحة مسبقاً
    if (this.isCourseUnlocked(courseId)) {
      return { success: true }; // مفتوحة بالفعل
    }

    // الدورات المجانية
    if (cost === 0) {
      this.data.unlockedCourses.push(courseId);
      await this.save();
      return { success: true };
    }

    // استخدام رصيد المتجر للشراء
    const credits = this.data.storeCredits || this.data.totalPoints;
    if (credits < cost) {
      return {
        success: false,
        error: `تحتاج ${cost} كريدتس لفتح هذه الدورة. لديك ${credits} كريدتس فقط.`,
      };
    }

    // خصم النقاط
    const result = await this.spendPoints(cost, `فتح دورة: ${courseName}`);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // إضافة للدورات المفتوحة
    this.data.unlockedCourses.push(courseId);
    await this.save();

    return { success: true };
  }

  // ===== نظام الأقسام (الشراء المجزأ) =====

  // التحقق من فتح قسم
  isSectionUnlocked(sectionId: string): boolean {
    return this.data.unlockedSections?.includes(sectionId) || false;
  }

  // الحصول على الأقسام المفتوحة لدورة معينة
  getUnlockedSectionsForCourse(courseId: string): string[] {
    return (this.data.unlockedSections || []).filter((s) =>
      s.startsWith(courseId)
    );
  }

  // فتح قسم بالنقاط
  async unlockSection(
    sectionId: string,
    cost: number,
    sectionName: string
  ): Promise<{ success: boolean; error?: string }> {
    await this.initialize();

    // التحقق إذا كان مفتوحاً مسبقاً
    if (this.isSectionUnlocked(sectionId)) {
      return { success: true };
    }

    // التحقق من رصيد المتجر
    const credits = this.data.storeCredits || this.data.totalPoints;
    if (credits < cost) {
      return {
        success: false,
        error: `تحتاج ${cost} كريدتس لفتح هذا القسم. لديك ${credits} كريدتس فقط.`,
      };
    }

    // خصم النقاط
    const result = await this.spendPoints(cost, `فتح قسم: ${sectionName}`);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // إضافة للأقسام المفتوحة
    if (!this.data.unlockedSections) {
      this.data.unlockedSections = [];
    }
    this.data.unlockedSections.push(sectionId);
    await this.save();

    return { success: true };
  }

  // حساب تكلفة الكورس الكامل بعد خصم الأقسام المشتراة
  calculateFullCourseCost(courseId: string, fullPrice: number): number {
    const purchasedSections = this.getUnlockedSectionsForCourse(courseId);
    // كل قسم مشترى يخصم جزء من السعر الكامل
    // مثال: إذا كان الكورس 1000 نقطة و 5 أقسام، كل قسم يساوي 240 نقطة (1200/5)
    // والسعر الكامل 1000 يعني توفير 200
    // إذا اشترى المستخدم 2 قسم بـ 480، يدفع للباقي 1000 - 480 = 520
    const sectionsCount = purchasedSections.length;
    if (sectionsCount === 0) return fullPrice;

    // حساب ما دفعه المستخدم للأقسام (تقريبي)
    // نفترض أن سعر القسم = (fullPrice + 200) / total_sections
    // لكن بما أننا لا نعرف عدد الأقسام الكلي هنا، نستخدم نسبة
    const paidAmount = sectionsCount * Math.ceil(fullPrice / 5); // تقدير
    const remainingCost = Math.max(0, fullPrice - paidAmount);

    return remainingCost;
  }

  // ===== نقاط الخبرة XP =====

  // إضافة نقاط خبرة (من الدراسة)
  async addXP(
    amount: number,
    reason: string
  ): Promise<{ success: boolean; newTotal: number }> {
    await this.initialize();

    this.data.xpPoints = (this.data.xpPoints || 0) + amount;
    this.data.earnedPoints += amount;
    this.addTransaction('earned', amount, `${reason}`);

    await this.save();

    return { success: true, newTotal: this.data.xpPoints };
  }

  // الحصول على نقاط الخبرة
  getXPPoints(): number {
    return this.data.xpPoints || 0;
  }

  // الحصول على رصيد المتجر
  getStoreCredits(): number {
    return this.data.storeCredits || this.data.totalPoints;
  }

  // ===== سجل المعاملات =====

  // الحصول على سجل المعاملات
  getTransactionHistory(): PointsTransaction[] {
    return [...this.data.transactionHistory];
  }

  // الحصول على سجل المشتريات
  getPurchaseHistory(): PointsPurchase[] {
    return [...this.data.purchaseHistory];
  }

  // ===== إعادة التعيين =====

  // إعادة تعيين كل البيانات
  async reset(): Promise<void> {
    this.data = { ...DEFAULT_POINTS_DATA };
    await this.save();
  }
}

// تصدير instance واحد
export const pointsService = new PointsService();
export default pointsService;

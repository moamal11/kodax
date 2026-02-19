export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  province?: string;
  selected_fields: string[];
  xp: number;
  level: number;
  badges: Badge[];
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

// Badge مع حالة الكسب (يُستخدم في عرض الشارات)
export interface BadgeWithStatus {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedAt?: string;
  progress?: number;
}

export interface Lesson {
  id: string;
  field_id: string;
  title: string;
  description: string;
  content: string;
  xp_reward: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  field_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  type: 'daily' | 'weekly' | 'special';
  test_cases: TestCase[];
  starter_code?: string;
}

export interface TestCase {
  input: string;
  expected_output: string;
}

export interface CodeSnippet {
  id: string;
  user_id: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  likes: number;
  comments: Comment[];
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  xp: number;
  level: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserProgress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score?: number;
  completed_at?: string;
}

// ===== نظام التسعير للكورسات =====
export interface CoursePricing {
  courseId: string;
  fullPrice: number; // سعر الكورس كاملاً
  sectionPrice: number; // سعر كل قسم
  totalSections: number; // عدد الأقسام
  discount: number; // التوفير عند الشراء الكامل (مثلاً 200 نقطة)
}

export interface UserCoursePurchase {
  courseId: string;
  purchaseType: 'full' | 'section';
  purchasedSections: string[]; // معرفات الأقسام المشتراة
  totalSpent: number; // إجمالي المصروف
  purchasedAt: string;
}

// ===== نظام العملات المزدوج =====
export type CurrencyType = 'xp' | 'credits';

export interface DualCurrency {
  xp: number; // ⚡ نقاط الخبرة - تُكتسب من الدراسة
  credits: number; // 💎 رصيد المتجر - يُشترى بفلوس
}

// ===== أيقونات وألوان العملات =====
export const CURRENCY_CONFIG = {
  xp: {
    icon: '⚡',
    color: '#fbbf24',
    name: 'نقاط الخبرة',
    nameEn: 'XP Points',
  },
  credits: {
    icon: '💎',
    color: '#a78bfa',
    name: 'رصيد المتجر',
    nameEn: 'Store Credits',
  },
};

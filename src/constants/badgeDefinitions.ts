/**
 * badgeDefinitions.ts
 *
 * تعريف جميع الشارات في التطبيق
 * كل شارة تحتوي على: id, name, description, icon, rarity, conditionType, conditionValue
 */

import { MaterialIcons } from '@expo/vector-icons';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type BadgeConditionType =
  | 'challenges_completed'
  | 'hard_challenges_completed'
  | 'challenges_no_hints'
  | 'challenge_streak'
  | 'first_challenge'
  | 'lessons_completed'
  | 'courses_completed'
  | 'course_100_percent'
  | 'first_lesson'
  | 'level_reached'
  | 'rapid_level'
  | 'xp_earned'
  | 'first_xp'
  | 'streak_days'
  | 'comeback_streak'
  | 'first_coin_unlock'
  | 'coins_earned'
  | 'courses_unlocked';

export interface BadgeDefinition {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  rarity: BadgeRarity;
  conditionType: BadgeConditionType;
  conditionValue: number;
  xpReward: number;
}

// ===== شارات التحديات =====
const challengeBadges: BadgeDefinition[] = [
  {
    id: 'first_challenge',
    name: 'First Blood',
    nameAr: 'الضربة الأولى',
    description: 'Complete your first challenge',
    descriptionAr: 'أكمل أول تحدي',
    icon: 'play-arrow',
    rarity: 'common',
    conditionType: 'first_challenge',
    conditionValue: 1,
    xpReward: 10,
  },
  {
    id: 'challenge_5',
    name: 'Getting Started',
    nameAr: 'البداية',
    description: 'Complete 5 challenges',
    descriptionAr: 'أكمل 5 تحديات',
    icon: 'trending-up',
    rarity: 'common',
    conditionType: 'challenges_completed',
    conditionValue: 5,
    xpReward: 25,
  },
  {
    id: 'challenge_10',
    name: 'Challenge Seeker',
    nameAr: 'باحث التحديات',
    description: 'Complete 10 challenges',
    descriptionAr: 'أكمل 10 تحديات',
    icon: 'extension',
    rarity: 'common',
    conditionType: 'challenges_completed',
    conditionValue: 10,
    xpReward: 50,
  },
  {
    id: 'challenge_25',
    name: 'Challenge Warrior',
    nameAr: 'محارب التحديات',
    description: 'Complete 25 challenges',
    descriptionAr: 'أكمل 25 تحدي',
    icon: 'shield',
    rarity: 'rare',
    conditionType: 'challenges_completed',
    conditionValue: 25,
    xpReward: 100,
  },
  {
    id: 'challenge_50',
    name: 'Challenge Master',
    nameAr: 'أستاذ التحديات',
    description: 'Complete 50 challenges',
    descriptionAr: 'أكمل 50 تحدي',
    icon: 'military-tech',
    rarity: 'epic',
    conditionType: 'challenges_completed',
    conditionValue: 50,
    xpReward: 200,
  },
  {
    id: 'challenge_100',
    name: 'Challenge Legend',
    nameAr: 'أسطورة التحديات',
    description: 'Complete 100 challenges',
    descriptionAr: 'أكمل 100 تحدي',
    icon: 'emoji-events',
    rarity: 'legendary',
    conditionType: 'challenges_completed',
    conditionValue: 100,
    xpReward: 500,
  },
  {
    id: 'hard_challenge_1',
    name: 'Brave Coder',
    nameAr: 'المبرمج الشجاع',
    description: 'Complete your first hard challenge',
    descriptionAr: 'أكمل أول تحدي صعب',
    icon: 'whatshot',
    rarity: 'rare',
    conditionType: 'hard_challenges_completed',
    conditionValue: 1,
    xpReward: 50,
  },
  {
    id: 'hard_challenge_10',
    name: 'Fearless Coder',
    nameAr: 'المبرمج الجسور',
    description: 'Complete 10 hard challenges',
    descriptionAr: 'أكمل 10 تحديات صعبة',
    icon: 'local-fire-department',
    rarity: 'epic',
    conditionType: 'hard_challenges_completed',
    conditionValue: 10,
    xpReward: 200,
  },
  {
    id: 'hard_challenge_25',
    name: 'Iron Will',
    nameAr: 'إرادة حديدية',
    description: 'Complete 25 hard challenges',
    descriptionAr: 'أكمل 25 تحدي صعب',
    icon: 'diamond',
    rarity: 'legendary',
    conditionType: 'hard_challenges_completed',
    conditionValue: 25,
    xpReward: 500,
  },
  {
    id: 'no_hints_5',
    name: 'Independent Thinker',
    nameAr: 'مفكر مستقل',
    description: 'Complete 5 challenges without hints',
    descriptionAr: 'أكمل 5 تحديات بدون تلميحات',
    icon: 'lightbulb',
    rarity: 'rare',
    conditionType: 'challenges_no_hints',
    conditionValue: 5,
    xpReward: 75,
  },
  {
    id: 'no_hints_20',
    name: 'Self-Reliant',
    nameAr: 'مُعتمد على نفسه',
    description: 'Complete 20 challenges without hints',
    descriptionAr: 'أكمل 20 تحدي بدون تلميحات',
    icon: 'psychology',
    rarity: 'epic',
    conditionType: 'challenges_no_hints',
    conditionValue: 20,
    xpReward: 200,
  },
  {
    id: 'challenge_streak_5',
    name: 'Unstoppable',
    nameAr: 'لا يُوقف',
    description: 'Complete 5 challenges in a row without failing',
    descriptionAr: 'أكمل 5 تحديات متتالية بدون فشل',
    icon: 'bolt',
    rarity: 'rare',
    conditionType: 'challenge_streak',
    conditionValue: 5,
    xpReward: 100,
  },
  {
    id: 'challenge_streak_10',
    name: 'Perfect Streak',
    nameAr: 'سلسلة مثالية',
    description: 'Complete 10 challenges in a row without failing',
    descriptionAr: 'أكمل 10 تحديات متتالية بدون فشل',
    icon: 'stars',
    rarity: 'legendary',
    conditionType: 'challenge_streak',
    conditionValue: 10,
    xpReward: 300,
  },
];

// ===== شارات الدروس والدورات =====
const lessonBadges: BadgeDefinition[] = [
  {
    id: 'first_lesson',
    name: 'First Step',
    nameAr: 'الخطوة الأولى',
    description: 'Complete your first lesson',
    descriptionAr: 'أكمل أول درس',
    icon: 'school',
    rarity: 'common',
    conditionType: 'first_lesson',
    conditionValue: 1,
    xpReward: 10,
  },
  {
    id: 'lessons_10',
    name: 'Eager Learner',
    nameAr: 'متعلم متحمس',
    description: 'Complete 10 lessons',
    descriptionAr: 'أكمل 10 دروس',
    icon: 'menu-book',
    rarity: 'common',
    conditionType: 'lessons_completed',
    conditionValue: 10,
    xpReward: 50,
  },
  {
    id: 'lessons_25',
    name: 'Knowledge Seeker',
    nameAr: 'باحث عن المعرفة',
    description: 'Complete 25 lessons',
    descriptionAr: 'أكمل 25 درس',
    icon: 'auto-stories',
    rarity: 'rare',
    conditionType: 'lessons_completed',
    conditionValue: 25,
    xpReward: 100,
  },
  {
    id: 'lessons_50',
    name: 'Scholar',
    nameAr: 'عالِم',
    description: 'Complete 50 lessons',
    descriptionAr: 'أكمل 50 درس',
    icon: 'history-edu',
    rarity: 'epic',
    conditionType: 'lessons_completed',
    conditionValue: 50,
    xpReward: 200,
  },
  {
    id: 'lessons_100',
    name: 'Grand Scholar',
    nameAr: 'عالِم كبير',
    description: 'Complete 100 lessons',
    descriptionAr: 'أكمل 100 درس',
    icon: 'workspace-premium',
    rarity: 'legendary',
    conditionType: 'lessons_completed',
    conditionValue: 100,
    xpReward: 500,
  },
  {
    id: 'course_1',
    name: 'Course Graduate',
    nameAr: 'خريج الدورة',
    description: 'Complete your first course',
    descriptionAr: 'أكمل أول دورة',
    icon: 'verified',
    rarity: 'rare',
    conditionType: 'courses_completed',
    conditionValue: 1,
    xpReward: 100,
  },
  {
    id: 'course_3',
    name: 'Multi-Skilled',
    nameAr: 'متعدد المهارات',
    description: 'Complete 3 courses',
    descriptionAr: 'أكمل 3 دورات',
    icon: 'stars',
    rarity: 'epic',
    conditionType: 'courses_completed',
    conditionValue: 3,
    xpReward: 200,
  },
  {
    id: 'course_5',
    name: 'Polyglot Programmer',
    nameAr: 'مبرمج متعدد اللغات',
    description: 'Complete 5 courses',
    descriptionAr: 'أكمل 5 دورات',
    icon: 'language',
    rarity: 'epic',
    conditionType: 'courses_completed',
    conditionValue: 5,
    xpReward: 300,
  },
  {
    id: 'course_10',
    name: 'Master of All',
    nameAr: 'أستاذ الجميع',
    description: 'Complete 10 courses',
    descriptionAr: 'أكمل 10 دورات',
    icon: 'emoji-events',
    rarity: 'legendary',
    conditionType: 'courses_completed',
    conditionValue: 10,
    xpReward: 500,
  },
  {
    id: 'perfect_course',
    name: 'Perfectionist',
    nameAr: 'الكمال',
    description: 'Complete a course with 100% score',
    descriptionAr: 'أكمل دورة بنسبة 100%',
    icon: 'star',
    rarity: 'epic',
    conditionType: 'course_100_percent',
    conditionValue: 1,
    xpReward: 150,
  },
];

// ===== شارات المستويات =====
const levelBadges: BadgeDefinition[] = [
  {
    id: 'level_5',
    name: 'Rising Star',
    nameAr: 'نجم صاعد',
    description: 'Reach level 5',
    descriptionAr: 'وصل للمستوى 5',
    icon: 'grade',
    rarity: 'common',
    conditionType: 'level_reached',
    conditionValue: 5,
    xpReward: 50,
  },
  {
    id: 'level_10',
    name: 'Code Warrior',
    nameAr: 'محارب البرمجة',
    description: 'Reach level 10',
    descriptionAr: 'وصل للمستوى 10',
    icon: 'security',
    rarity: 'rare',
    conditionType: 'level_reached',
    conditionValue: 10,
    xpReward: 100,
  },
  {
    id: 'level_20',
    name: 'Code Knight',
    nameAr: 'فارس البرمجة',
    description: 'Reach level 20',
    descriptionAr: 'وصل للمستوى 20',
    icon: 'shield',
    rarity: 'epic',
    conditionType: 'level_reached',
    conditionValue: 20,
    xpReward: 200,
  },
  {
    id: 'level_30',
    name: 'Code Master',
    nameAr: 'أستاذ البرمجة',
    description: 'Reach level 30',
    descriptionAr: 'وصل للمستوى 30',
    icon: 'military-tech',
    rarity: 'epic',
    conditionType: 'level_reached',
    conditionValue: 30,
    xpReward: 300,
  },
  {
    id: 'level_50',
    name: 'Code Legend',
    nameAr: 'أسطورة البرمجة',
    description: 'Reach level 50',
    descriptionAr: 'وصل للمستوى 50',
    icon: 'auto-awesome',
    rarity: 'legendary',
    conditionType: 'level_reached',
    conditionValue: 50,
    xpReward: 500,
  },
];

// ===== شارات الـ XP =====
const xpBadges: BadgeDefinition[] = [
  {
    id: 'first_xp',
    name: 'First XP',
    nameAr: 'أول نقطة',
    description: 'Earn your first XP',
    descriptionAr: 'احصل على أول نقطة خبرة',
    icon: 'flash-on',
    rarity: 'common',
    conditionType: 'first_xp',
    conditionValue: 1,
    xpReward: 5,
  },
  {
    id: 'xp_100',
    name: 'XP Collector',
    nameAr: 'جامع الخبرة',
    description: 'Earn 100 XP',
    descriptionAr: 'احصل على 100 نقطة خبرة',
    icon: 'trending-up',
    rarity: 'common',
    conditionType: 'xp_earned',
    conditionValue: 100,
    xpReward: 10,
  },
  {
    id: 'xp_500',
    name: 'XP Hunter',
    nameAr: 'صياد الخبرة',
    description: 'Earn 500 XP',
    descriptionAr: 'احصل على 500 نقطة خبرة',
    icon: 'bolt',
    rarity: 'rare',
    conditionType: 'xp_earned',
    conditionValue: 500,
    xpReward: 25,
  },
  {
    id: 'xp_1000',
    name: 'XP Master',
    nameAr: 'أستاذ الخبرة',
    description: 'Earn 1,000 XP',
    descriptionAr: 'احصل على 1000 نقطة خبرة',
    icon: 'whatshot',
    rarity: 'rare',
    conditionType: 'xp_earned',
    conditionValue: 1000,
    xpReward: 50,
  },
  {
    id: 'xp_5000',
    name: 'XP Legend',
    nameAr: 'أسطورة الخبرة',
    description: 'Earn 5,000 XP',
    descriptionAr: 'احصل على 5000 نقطة خبرة',
    icon: 'local-fire-department',
    rarity: 'epic',
    conditionType: 'xp_earned',
    conditionValue: 5000,
    xpReward: 100,
  },
  {
    id: 'xp_10000',
    name: 'XP God',
    nameAr: 'إله الخبرة',
    description: 'Earn 10,000 XP',
    descriptionAr: 'احصل على 10000 نقطة خبرة',
    icon: 'auto-awesome',
    rarity: 'legendary',
    conditionType: 'xp_earned',
    conditionValue: 10000,
    xpReward: 250,
  },
];

// ===== شارات السلسلة (Streak) =====
const streakBadges: BadgeDefinition[] = [
  {
    id: 'streak_3',
    name: 'Three Day Run',
    nameAr: 'ثلاثة أيام متتالية',
    description: 'Maintain a 3-day streak',
    descriptionAr: 'حافظ على سلسلة 3 أيام',
    icon: 'local-fire-department',
    rarity: 'common',
    conditionType: 'streak_days',
    conditionValue: 3,
    xpReward: 25,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    nameAr: 'محارب الأسبوع',
    description: 'Maintain a 7-day streak',
    descriptionAr: 'حافظ على سلسلة 7 أيام',
    icon: 'whatshot',
    rarity: 'rare',
    conditionType: 'streak_days',
    conditionValue: 7,
    xpReward: 75,
  },
  {
    id: 'streak_14',
    name: 'Two Week Champion',
    nameAr: 'بطل أسبوعين',
    description: 'Maintain a 14-day streak',
    descriptionAr: 'حافظ على سلسلة 14 يوم',
    icon: 'military-tech',
    rarity: 'epic',
    conditionType: 'streak_days',
    conditionValue: 14,
    xpReward: 150,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    nameAr: 'أستاذ الشهر',
    description: 'Maintain a 30-day streak',
    descriptionAr: 'حافظ على سلسلة 30 يوم',
    icon: 'emoji-events',
    rarity: 'legendary',
    conditionType: 'streak_days',
    conditionValue: 30,
    xpReward: 300,
  },
  {
    id: 'streak_60',
    name: 'Dedication King',
    nameAr: 'ملك الإلتزام',
    description: 'Maintain a 60-day streak',
    descriptionAr: 'حافظ على سلسلة 60 يوم',
    icon: 'diamond',
    rarity: 'legendary',
    conditionType: 'streak_days',
    conditionValue: 60,
    xpReward: 500,
  },
  {
    id: 'comeback',
    name: 'Comeback Kid',
    nameAr: 'العودة القوية',
    description: 'Return after a break and start a new streak',
    descriptionAr: 'عُد بعد انقطاع وابدأ سلسلة جديدة',
    icon: 'replay',
    rarity: 'rare',
    conditionType: 'comeback_streak',
    conditionValue: 1,
    xpReward: 50,
  },
];

// ===== شارات الاقتصاد =====
const economyBadges: BadgeDefinition[] = [
  // ملاحظة: المعرّفات (id) محفوظة كما هي حتى لا يفقد المستخدمون شاراتهم المكتسبة سابقاً.
  {
    id: 'first_purchase',
    name: 'First Unlock',
    nameAr: 'أول فتح',
    description: 'Unlock your first course with earned coins',
    descriptionAr: 'افتح أول دورة بالكوينات التي جمعتها',
    icon: 'lock-open',
    rarity: 'common',
    conditionType: 'first_coin_unlock',
    conditionValue: 1,
    xpReward: 25,
  },
  {
    id: 'premium_member',
    name: 'Coin Collector',
    nameAr: 'جامع الكوينات',
    description: 'Earn 500 coins from learning',
    descriptionAr: 'اجمع 500 كوين من التعلم',
    icon: 'savings',
    rarity: 'epic',
    conditionType: 'coins_earned',
    conditionValue: 500,
    xpReward: 100,
  },
  {
    id: 'course_collector_3',
    name: 'Course Collector',
    nameAr: 'جامع الدورات',
    description: 'Unlock 3 courses',
    descriptionAr: 'افتح 3 دورات',
    icon: 'collections-bookmark',
    rarity: 'rare',
    conditionType: 'courses_unlocked',
    conditionValue: 3,
    xpReward: 50,
  },
  {
    id: 'course_collector_10',
    name: 'Ultimate Collector',
    nameAr: 'الجامع الأقصى',
    description: 'Unlock 10 courses',
    descriptionAr: 'افتح 10 دورات',
    icon: 'library-books',
    rarity: 'legendary',
    conditionType: 'courses_unlocked',
    conditionValue: 10,
    xpReward: 200,
  },
];

// ===== تجميع كل الشارات =====
export const ALL_BADGES: BadgeDefinition[] = [
  ...challengeBadges,
  ...lessonBadges,
  ...levelBadges,
  ...xpBadges,
  ...streakBadges,
  ...economyBadges,
];

// ===== الشارات مقسمة حسب الفئة (للعرض المجمّع) =====
export interface BadgeCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  badges: BadgeDefinition[];
}

export const BADGE_CATEGORIES: BadgeCategory[] = [
  {
    id: 'challenges',
    nameAr: 'التحديات',
    nameEn: 'Challenges',
    icon: 'trophy',
    color: '#f59e0b',
    badges: challengeBadges,
  },
  {
    id: 'lessons',
    nameAr: 'الدروس والدورات',
    nameEn: 'Lessons & Courses',
    icon: 'school',
    color: '#3b82f6',
    badges: lessonBadges,
  },
  {
    id: 'levels',
    nameAr: 'المستويات',
    nameEn: 'Levels',
    icon: 'shield',
    color: '#10b981',
    badges: levelBadges,
  },
  {
    id: 'xp',
    nameAr: 'نقاط الخبرة',
    nameEn: 'XP',
    icon: 'flash',
    color: '#ef4444',
    badges: xpBadges,
  },
  {
    id: 'streak',
    nameAr: 'السلاسل اليومية',
    nameEn: 'Streaks',
    icon: 'flame',
    color: '#f97316',
    badges: streakBadges,
  },
  {
    id: 'economy',
    nameAr: 'الاقتصاد',
    nameEn: 'Economy',
    icon: 'diamond',
    color: '#8b5cf6',
    badges: economyBadges,
  },
];

// ===== Helper functions =====

/** الحصول على شارة بالـ ID */
export function getBadgeById(id: string): BadgeDefinition | undefined {
  return ALL_BADGES.find((b) => b.id === id);
}

/** الحصول على شارات حسب الفئة */
export function getBadgesByConditionType(
  type: BadgeConditionType
): BadgeDefinition[] {
  return ALL_BADGES.filter((b) => b.conditionType === type);
}

/** الحصول على شارات حسب الندرة */
export function getBadgesByRarity(rarity: BadgeRarity): BadgeDefinition[] {
  return ALL_BADGES.filter((b) => b.rarity === rarity);
}

/** إجمالي عدد الشارات */
export const TOTAL_BADGES_COUNT = ALL_BADGES.length;

/** عدد الشارات حسب الفئة */
export const BADGE_COUNTS = {
  challenges: challengeBadges.length,
  lessons: lessonBadges.length,
  levels: levelBadges.length,
  xp: xpBadges.length,
  streak: streakBadges.length,
  economy: economyBadges.length,
};

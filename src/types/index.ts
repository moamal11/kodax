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

// ===== الكوينات =====
// الكوينات عملة مجانية تُكتسب من التعلم فقط (لا تُشترى بالمال).
// الأنواع الخاصة بها في src/services/coinService.ts


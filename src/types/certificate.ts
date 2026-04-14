/**
 * 🎓 Certificate System Types - Kodax
 * Professional Certificate System (Silver → Gold → Platinum)
 */

// ===== Certificate Levels =====
export type CertificateLevel = 'silver' | 'gold' | 'platinum';
export type CertificateStatus = 'valid' | 'revoked' | 'archived';

// ===== Certificate =====
export interface Certificate {
  id: string;
  user_id: string;
  field_id: string; // e.g., 'web-dev', 'python', 'cybersecurity'
  field_name: string;
  field_name_ar?: string;
  course_id?: string; // [DEPRECATED] kept for reference - last course completed
  level: CertificateLevel;
  status: CertificateStatus;
  security_hash: string;
  achievement_snapshot: FieldAchievementSnapshot;
  user_full_name: string;
  user_username?: string;
  course_title?: string; // [DEPRECATED] kept for backwards compatibility
  course_title_ar?: string; // [DEPRECATED]
  issued_at: string;
  revoked_at?: string;
  revocation_reason?: string;
  upgraded_from?: string;
}

// ===== Achievement Snapshot (Legacy - per course) =====
export interface AchievementSnapshot {
  lessons_completed: number;
  lessons_total: number;
  lessons_percent: number;
  challenges_completed: number;
  challenges_total: number;
  challenges_percent: number;
  exam_score: number | null;
  critical_errors: number;
  completion_days: number | null;
  project_completed?: boolean;
}

// ===== Field Achievement Snapshot (New - per field) =====
export interface FieldAchievementSnapshot {
  field_id: string;
  total_courses: number;
  completed_courses: number;
  total_lessons: number;
  completed_lessons: number;
  lessons_percent: number;
  total_challenges: number;
  completed_challenges: number;
  challenges_percent: number;
  avg_exam_score: number | null;
  critical_errors: number;
  completion_days: number | null;
  courses: Array<{
    id: string;
    title: string;
    title_ar?: string;
    completed: boolean;
    score?: number;
  }>;
}

// ===== Certificate Requirements =====
export interface CertificateRequirements {
  id: string;
  field_id: string; // Changed from course_id to field_id
  course_id?: string; // [DEPRECATED] kept for backwards compatibility
  level: CertificateLevel;
  min_lessons_percent: number;
  min_challenges_percent: number;
  max_challenge_errors: number | null;
  min_exam_score: number;
  requires_project: boolean;
  max_completion_days: number | null;
}

// ===== Eligibility Check Result =====
export interface EligibilityResult {
  eligible: boolean;
  level: CertificateLevel;
  reasons: string[];
  progress: CertificateProgress;
  next_level?: {
    level: CertificateLevel;
    requirements: string[];
  };
}

// ===== Certificate Progress =====
export interface CertificateProgress {
  lessons_completed: number;
  lessons_total: number;
  lessons_percent: number;
  challenges_completed: number;
  challenges_total: number;
  challenges_percent: number;
  exam_score: number | null;
  exam_passed: boolean;
  critical_errors: number;
  completion_days: number | null;
}

// ===== Issue Certificate Result =====
export interface IssueCertificateResult {
  success: boolean;
  error?: string;
  reasons?: string[];
  certificate?: Certificate;
  certificate_id?: string;
  next_level?: {
    level: CertificateLevel;
    requirements: string[];
  };
  progress?: CertificateProgress;
}

// ===== Verification Result =====
export interface VerificationResult {
  found: boolean;
  message?: string;
  certificate_id?: string;
  holder_name?: string;
  field_id?: string;
  field_name?: string;
  field_name_ar?: string;
  course_title?: string; // [DEPRECATED]
  course_title_ar?: string; // [DEPRECATED]
  level?: CertificateLevel;
  status?: CertificateStatus;
  issued_at?: string;
  revoked_at?: string;
  revocation_reason?: string;
  achievement_snapshot?: FieldAchievementSnapshot;
}

// ===== User Certificates Summary =====
export interface UserCertificatesSummary {
  total: number;
  silver: number;
  gold: number;
  platinum: number;
  certificates: CertificateSummaryItem[];
}

export interface CertificateSummaryItem {
  id: string;
  field_id: string;
  field_name: string;
  field_name_ar?: string;
  course_id?: string; // [DEPRECATED]
  course_title?: string; // [DEPRECATED]
  course_title_ar?: string; // [DEPRECATED]
  level: CertificateLevel;
  status: CertificateStatus;
  issued_at: string;
  achievement_snapshot: FieldAchievementSnapshot;
}

// ===== Final Exam =====
export interface FinalExamResult {
  id: string;
  user_id: string;
  course_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds?: number;
  answers: FinalExamAnswer[];
  passed: boolean;
  attempt_number: number;
  created_at: string;
}

export interface FinalExamAnswer {
  question_index: number;
  question: string;
  selected_answer: number;
  correct_answer: number;
  is_correct: boolean;
}

// ===== Certificate Level Config =====
export const CERTIFICATE_LEVEL_CONFIG = {
  silver: {
    label: 'Silver',
    labelAr: 'الفضية',
    emoji: '🥈',
    iconName: 'medal-outline' as const,
    icon: 'medal-outline' as const,
    color: '#C0C0C0',
    gradientColors: ['#C0C0C0', '#A8A8A8'] as [string, string],
    borderColor: 'rgba(192, 192, 192, 0.4)',
    glowColor: 'rgba(192, 192, 192, 0.2)',
    order: 1,
  },
  gold: {
    label: 'Gold',
    labelAr: 'الذهبية',
    emoji: '🥇',
    iconName: 'trophy' as const,
    icon: 'trophy-outline' as const,
    color: '#FFD700',
    gradientColors: ['#FFD700', '#FFA500'] as [string, string],
    borderColor: 'rgba(255, 215, 0, 0.4)',
    glowColor: 'rgba(255, 215, 0, 0.2)',
    order: 2,
  },
  platinum: {
    label: 'Platinum',
    labelAr: 'البلاتينية',
    emoji: '💎',
    iconName: 'diamond' as const,
    icon: 'diamond-outline' as const,
    color: '#E5E4E2',
    gradientColors: ['#E5E4E2', '#B8B8B8'] as [string, string],
    borderColor: 'rgba(229, 228, 226, 0.5)',
    glowColor: 'rgba(229, 228, 226, 0.3)',
    order: 3,
  },
};

// ===== Helper: Get level display info =====
export function getCertificateLevelInfo(level: CertificateLevel) {
  return CERTIFICATE_LEVEL_CONFIG[level];
}

// ===== Helper: Is level higher =====
export function isHigherLevel(
  current: CertificateLevel,
  compareTo: CertificateLevel
): boolean {
  const order = { silver: 1, gold: 2, platinum: 3 };
  return order[current] > order[compareTo];
}

// ===== Helper: Get next level =====
export function getNextLevel(
  current: CertificateLevel
): CertificateLevel | null {
  const levels: CertificateLevel[] = ['silver', 'gold', 'platinum'];
  const idx = levels.indexOf(current);
  return idx < levels.length - 1 ? levels[idx + 1] : null;
}

/**
 * بيانات الدورات والدروس الكاملة لـ Kodax
 * محتوى تعليمي شامل للبرمجة بالعربية
 */

import { PROGRAMMING_FIELDS } from './index';

// Helper function to get field name from fieldId
const getFieldNames = (fieldId: string) => {
  const field = PROGRAMMING_FIELDS.find((f) => f.id === fieldId);
  return {
    fieldName: field?.name || '',
    fieldNameAr: field?.nameAr || '',
  };
};

// استيراد المحتوى الموسع
import { ALL_CSS_LESSONS, ALL_CSS_CHALLENGES } from './cssContent';
import { ALL_PYTHON_LESSONS, ALL_PYTHON_CHALLENGES } from './pythonContent';
import { ALL_CPP_LESSONS, ALL_CPP_CHALLENGES } from './cppContent';
import { ALL_CYBER_LESSONS, ALL_CYBER_CHALLENGES } from './cyberContent';
import { ALL_JS_LESSONS, ALL_JS_CHALLENGES } from './jsContent';
import { ALL_REACT_LESSONS, ALL_REACT_CHALLENGES } from './reactContent';
import { ALL_AI_LESSONS, ALL_AI_CHALLENGES } from './aiContent';
import {
  ALL_DEPLOYMENT_LESSONS,
  ALL_DEPLOYMENT_CHALLENGES,
} from './deploymentContent';
// استيراد محتوى تطوير التطبيقات (React Native و Flutter)
import {
  ALL_REACT_NATIVE_LESSONS,
  REACT_NATIVE_CHALLENGES,
} from './reactNativeContent';
import { ALL_FLUTTER_LESSONS, FLUTTER_CHALLENGES } from './flutterContent';
// استيراد محتوى Backend وقواعد البيانات
import { ALL_BACKEND_LESSONS, ALL_BACKEND_CHALLENGES } from './backendContent';
// استيراد المحتوى الموسّع الإضافي
import {
  ALL_EXPANDED_WEB_LESSONS,
  ALL_EXPANDED_WEB_CHALLENGES,
} from './expandedWebContent';
import {
  ALL_EXPANDED_CYBER_LESSONS,
  ALL_EXPANDED_CYBER_CHALLENGES,
} from './expandedCyberContent';
import {
  ALL_EXPANDED_APP_DEV_LESSONS,
  ALL_EXPANDED_APP_DEV_CHALLENGES,
} from './expandedAppDevContent';
// استيراد الخوارزميات وهياكل البيانات
import {
  ALL_ALGORITHM_CHALLENGES,
  ALL_ALGORITHM_LESSONS,
} from './algorithmContent';
import { ALL_DS_CHALLENGES, ALL_DS_LESSONS } from './dataStructureContent';

import type { ChallengeCheck } from '../services/challengeValidator';
import { applyChallengeFixes } from './challengeFixes';
import { EXPANSION_CHALLENGES } from './challengeExpansion';
import { applyCurriculum } from './curriculum';

// ===== أنواع البيانات =====
export interface Course {
  id: string;
  fieldId: string;
  fieldName?: string; // Added by ALL_COURSES mapping
  fieldNameAr?: string; // Added by ALL_COURSES mapping
  title: string;
  description: string;
  icon: string;
  color: string;
  totalLessons: number;
  totalXP: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  isLocked: boolean;
  requiredCourseId?: string;
  pointsCost: number; // تكلفة فتح الدورة بالكوينات المكتسبة (0 = مجانية) — المصدر الرسمي: course_coin_catalog
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  codeExample?: string;
  language?: string;
  xpReward: number;
  order: number;
  quiz?: Quiz;
  type?: 'theory' | 'practice' | 'quiz';
  estimatedMinutes?: number;
  isLocked?: boolean;
  /** اسم القسم داخل الدورة (يُعرض كعنوان فوق أول درس فيه) */
  section?: string;
}

export interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  language: string;
  icon: string;
  starterCode: string;
  solution: string;
  hints: string[];
  testCases: TestCase[];
  isLocked: boolean;
  category: string;
  courseId?: string;
  xpReward?: number;
  timeLimit?: number;
  /** متطلبات بنيوية للغات التي لا تُشغَّل داخل التطبيق (HTML/CSS/React/Dart/...) */
  checks?: ChallengeCheck[];
  /** الدالة التي تُستدعى بمدخلات الاختبار (افتراضياً: أول دالة في الكود الابتدائي) */
  entryFunction?: string;
  /** 'structural' = تحقق بالمتطلبات (checks) فقط */
  validation?: 'execution' | 'structural';
  /** كود تهيئة يسبق كود المستخدم عند التشغيل (بدائل وهمية لمكتبات مثل express) */
  prelude?: string;
  /** تحديات التوسعة: الدرس الذي يبني عليه التحدي (الوصول يتبع دورته مباشرة) */
  afterLessonId?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
  /** اختبار مخفي: يُشغَّل للتحقق ولا تُعرض مدخلاته/نتيجته للمستخدم */
  hidden?: boolean;
}

// ===== دورات تطوير الويب =====
export const WEB_DEV_COURSES: Course[] = [
  {
    id: 'web-html-basics',
    fieldId: 'web-dev',
    title: 'أساسيات HTML',
    description: 'تعلم بناء صفحات الويب من الصفر',
    icon: 'document-text',
    color: '#e34c26',
    totalLessons: 12,
    totalXP: 800,
    difficulty: 'beginner',
    order: 1,
    isLocked: false,
    pointsCost: 0, // مجاني
  },
  {
    id: 'web-css-styling',
    fieldId: 'web-dev',
    title: 'تصميم CSS',
    description: 'أضف الجمال لصفحاتك',
    icon: 'color-palette',
    color: '#264de4',
    totalLessons: 15,
    totalXP: 1500,
    difficulty: 'beginner',
    order: 2,
    isLocked: false,
    pointsCost: 0, // مجاني
  },
  {
    id: 'web-css-advanced',
    fieldId: 'web-dev',
    title: 'CSS المتقدم',
    description: 'Animations و Flexbox و Grid',
    icon: 'sparkles',
    color: '#1572b6',
    totalLessons: 5,
    totalXP: 750,
    difficulty: 'intermediate',
    order: 2.5,
    isLocked: true,
    requiredCourseId: 'web-css-styling',
    pointsCost: 80, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'web-js-basics',
    fieldId: 'web-dev',
    title: 'JavaScript الأساسيات',
    description: 'اجعل صفحاتك تفاعلية',
    icon: 'logo-javascript',
    color: '#f7df1e',
    totalLessons: 13,
    totalXP: 1500,
    difficulty: 'intermediate',
    order: 3,
    isLocked: true,
    requiredCourseId: 'web-html-basics',
    pointsCost: 140, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'web-react-intro',
    fieldId: 'web-dev',
    title: 'مقدمة React',
    description: 'ابنِ تطبيقات ويب حديثة',
    icon: 'logo-react',
    color: '#61dafb',
    totalLessons: 15,
    totalXP: 1500,
    difficulty: 'advanced',
    order: 4,
    isLocked: true,
    requiredCourseId: 'web-js-basics',
    pointsCost: 230, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'web-deployment',
    fieldId: 'web-dev',
    title: 'نشر المواقع والدومينات',
    description: 'رفع موقعك على الإنترنت',
    icon: 'cloud-upload',
    color: '#00d4aa',
    totalLessons: 6,
    totalXP: 700,
    difficulty: 'intermediate',
    order: 5,
    isLocked: true,
    requiredCourseId: 'web-html-basics',
    pointsCost: 90, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
];

// ===== دورات Python =====
export const PYTHON_COURSES: Course[] = [
  {
    id: 'py-basics',
    fieldId: 'python',
    title: 'أساسيات Python',
    description: 'ابدأ رحلتك مع البايثون',
    icon: 'logo-python',
    color: '#3776ab',
    totalLessons: 10,
    totalXP: 1000,
    difficulty: 'beginner',
    order: 1,
    isLocked: false,
    pointsCost: 0, // مجاني
  },
  {
    id: 'py-data-structures',
    fieldId: 'python',
    title: 'هياكل البيانات',
    description: 'القوائم والقواميس والمجموعات',
    icon: 'grid',
    color: '#306998',
    totalLessons: 8,
    totalXP: 800,
    difficulty: 'intermediate',
    order: 2,
    isLocked: true,
    requiredCourseId: 'py-basics',
    pointsCost: 100, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'py-oop',
    fieldId: 'python',
    title: 'البرمجة الكائنية',
    description: 'Classes و Objects و Inheritance',
    icon: 'cube',
    color: '#ffd43b',
    totalLessons: 10,
    totalXP: 1200,
    difficulty: 'intermediate',
    order: 3,
    isLocked: true,
    requiredCourseId: 'py-data-structures',
    pointsCost: 120, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'py-advanced',
    fieldId: 'python',
    title: 'Python المتقدم',
    description: 'Decorators و Generators و Context Managers',
    icon: 'rocket',
    color: '#646464',
    totalLessons: 12,
    totalXP: 1800,
    difficulty: 'advanced',
    order: 4,
    isLocked: true,
    requiredCourseId: 'py-oop',
    pointsCost: 200, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
];

// ===== دورات C++ =====
export const CPP_COURSES: Course[] = [
  {
    id: 'cpp-basics',
    fieldId: 'cpp',
    title: 'أساسيات C++',
    description: 'ابدأ مع لغة الأداء العالي',
    icon: 'flash',
    color: '#00599c',
    totalLessons: 10,
    totalXP: 1000,
    difficulty: 'beginner',
    order: 1,
    isLocked: false,
    pointsCost: 0, // مجاني
  },
  {
    id: 'cpp-pointers',
    fieldId: 'cpp',
    title: 'المؤشرات والذاكرة',
    description: 'تحكم كامل بالذاكرة',
    icon: 'locate',
    color: '#004482',
    totalLessons: 8,
    totalXP: 1000,
    difficulty: 'intermediate',
    order: 2,
    isLocked: true,
    requiredCourseId: 'cpp-basics',
    pointsCost: 100, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'cpp-oop',
    fieldId: 'cpp',
    title: 'OOP في C++',
    description: 'البرمجة الكائنية والوراثة',
    icon: 'business',
    color: '#659ad2',
    totalLessons: 12,
    totalXP: 1500,
    difficulty: 'advanced',
    order: 3,
    isLocked: true,
    requiredCourseId: 'cpp-pointers',
    pointsCost: 200, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'cpp-advanced',
    fieldId: 'cpp',
    title: 'C++ المتقدم',
    description: 'Templates و STL و Modern C++',
    icon: 'flame',
    color: '#1e90ff',
    totalLessons: 10,
    totalXP: 1800,
    difficulty: 'advanced',
    order: 4,
    isLocked: true,
    requiredCourseId: 'cpp-oop',
    pointsCost: 180, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
];

// ===== دورات الأمن السيبراني =====
export const CYBER_COURSES: Course[] = [
  {
    id: 'cyber-basics',
    fieldId: 'cybersecurity',
    title: 'أساسيات الأمن السيبراني',
    description: 'مفاهيم الحماية الأساسية',
    icon: 'lock-closed',
    color: '#2ecc71',
    totalLessons: 8,
    totalXP: 720,
    difficulty: 'beginner',
    order: 1,
    isLocked: false,
    pointsCost: 0, // مجاني
  },
  {
    id: 'cyber-network',
    fieldId: 'cybersecurity',
    title: 'أمن الشبكات',
    description: 'حماية الشبكات من الاختراق',
    icon: 'globe',
    color: '#27ae60',
    totalLessons: 10,
    totalXP: 1200,
    difficulty: 'intermediate',
    order: 2,
    isLocked: true,
    requiredCourseId: 'cyber-basics',
    pointsCost: 120, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'cyber-advanced',
    fieldId: 'cybersecurity',
    title: 'الأمن المتقدم',
    description: 'SQL Injection و XSS و Pen Testing',
    icon: 'shield-checkmark',
    color: '#16a085',
    totalLessons: 6,
    totalXP: 960,
    difficulty: 'advanced',
    order: 3,
    isLocked: true,
    requiredCourseId: 'cyber-network',
    pointsCost: 140, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'cyber-ethical-hacking',
    fieldId: 'cybersecurity',
    title: 'الاختراق الأخلاقي',
    description: 'تعلم كيف يفكر المخترقون',
    icon: 'skull',
    color: '#1abc9c',
    totalLessons: 15,
    totalXP: 1500,
    difficulty: 'advanced',
    order: 4,
    isLocked: true,
    requiredCourseId: 'cyber-advanced',
    pointsCost: 230, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
];

// ===== دورات الذكاء الاصطناعي =====
export const AI_COURSES: Course[] = [
  {
    id: 'ai-basics',
    fieldId: 'ai-ml',
    title: 'مقدمة في الذكاء الاصطناعي',
    description: 'أساسيات AI و ML',
    icon: 'hardware-chip',
    color: '#9b59b6',
    totalLessons: 5,
    totalXP: 900,
    difficulty: 'beginner',
    order: 1,
    isLocked: false,
    pointsCost: 0, // مجاني
  },
  {
    id: 'ai-ml-basics',
    fieldId: 'ai-ml',
    title: 'تعلم الآلة',
    description: 'خوارزميات ML الأساسية',
    icon: 'analytics',
    color: '#8e44ad',
    totalLessons: 12,
    totalXP: 1200,
    difficulty: 'intermediate',
    order: 2,
    isLocked: true,
    requiredCourseId: 'ai-basics',
    pointsCost: 140, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'ai-deep-learning',
    fieldId: 'ai-ml',
    title: 'التعلم العميق',
    description: 'الشبكات العصبية',
    icon: 'git-network',
    color: '#7d3c98',
    totalLessons: 15,
    totalXP: 1500,
    difficulty: 'advanced',
    order: 3,
    isLocked: true,
    requiredCourseId: 'ai-ml-basics',
    pointsCost: 230, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
];

// ===== دورات React Native =====
export const REACT_NATIVE_COURSES: Course[] = [
  {
    id: 'rn-basics',
    fieldId: 'mobile-dev',
    title: 'أساسيات React Native',
    description: 'تعلم بناء تطبيقات موبايل بـ React Native',
    icon: 'logo-react',
    color: '#61dafb',
    totalLessons: 13,
    totalXP: 1200,
    difficulty: 'beginner',
    order: 1,
    isLocked: false,
    pointsCost: 0, // مجاني للمبتدئين
  },
  {
    id: 'rn-advanced',
    fieldId: 'mobile-dev',
    title: 'React Native المتقدم',
    description: 'Animations و Forms و State Management',
    icon: 'rocket-outline',
    color: '#20232a',
    totalLessons: 7,
    totalXP: 950,
    difficulty: 'intermediate',
    order: 2,
    isLocked: true,
    requiredCourseId: 'rn-basics',
    pointsCost: 100, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
];

// ===== دورات Flutter =====
export const FLUTTER_COURSES: Course[] = [
  {
    id: 'flutter-basics',
    fieldId: 'mobile-dev',
    title: 'أساسيات Flutter',
    description: 'تعلم Flutter و Dart من الصفر',
    icon: 'flash-outline',
    color: '#02569B',
    totalLessons: 14,
    totalXP: 1340,
    difficulty: 'beginner',
    order: 3,
    isLocked: false,
    pointsCost: 0, // مجاني للمبتدئين
  },
  {
    id: 'flutter-advanced',
    fieldId: 'mobile-dev',
    title: 'Flutter المتقدم',
    description: 'Riverpod و Animations و Testing',
    icon: 'layers-outline',
    color: '#54C5F8',
    totalLessons: 9,
    totalXP: 1120,
    difficulty: 'advanced',
    order: 4,
    isLocked: true,
    requiredCourseId: 'flutter-basics',
    pointsCost: 170, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
];

// ===== دورات Backend Development =====
export const BACKEND_COURSES: Course[] = [
  {
    id: 'backend-nodejs',
    fieldId: 'backend',
    title: 'Node.js و Express',
    description: 'بناء APIs و Backend بـ JavaScript',
    icon: 'logo-nodejs',
    color: '#339933',
    totalLessons: 5,
    totalXP: 690,
    difficulty: 'beginner',
    order: 1,
    isLocked: false,
    pointsCost: 0,
  },
  {
    id: 'backend-rest-api',
    fieldId: 'backend',
    title: 'REST APIs',
    description: 'تصميم وبناء APIs احترافية',
    icon: 'git-network-outline',
    color: '#00d4aa',
    totalLessons: 8,
    totalXP: 1000,
    difficulty: 'intermediate',
    order: 2,
    isLocked: true,
    requiredCourseId: 'backend-nodejs',
    pointsCost: 100, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'backend-auth',
    fieldId: 'backend',
    title: 'Authentication & Security',
    description: 'JWT و OAuth و حماية APIs',
    icon: 'lock-closed-outline',
    color: '#ff6b6b',
    totalLessons: 6,
    totalXP: 900,
    difficulty: 'intermediate',
    order: 3,
    isLocked: true,
    requiredCourseId: 'backend-rest-api',
    pointsCost: 90, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
];

// ===== دورات قواعد البيانات =====
export const DATABASE_COURSES: Course[] = [
  {
    id: 'backend-sql',
    fieldId: 'databases',
    title: 'SQL الأساسيات',
    description: 'قواعد البيانات العلائقية',
    icon: 'server-outline',
    color: '#336791',
    totalLessons: 7,
    totalXP: 1230,
    difficulty: 'beginner',
    order: 1,
    isLocked: false,
    pointsCost: 0,
  },
  {
    id: 'backend-supabase',
    fieldId: 'databases',
    title: 'Supabase',
    description: 'Firebase البديل مفتوح المصدر',
    icon: 'flash-outline',
    color: '#3ECF8E',
    totalLessons: 6,
    totalXP: 1120,
    difficulty: 'intermediate',
    order: 2,
    isLocked: false,
    pointsCost: 90, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'backend-firebase',
    fieldId: 'databases',
    title: 'Firebase',
    description: 'منصة Google للتطبيقات',
    icon: 'flame-outline',
    color: '#FFCA28',
    totalLessons: 5,
    totalXP: 940,
    difficulty: 'intermediate',
    order: 3,
    isLocked: false,
    pointsCost: 80, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
  {
    id: 'backend-mongodb',
    fieldId: 'databases',
    title: 'MongoDB',
    description: 'قواعد بيانات NoSQL',
    icon: 'leaf-outline',
    color: '#47A248',
    totalLessons: 5,
    totalXP: 600,
    difficulty: 'intermediate',
    order: 4,
    isLocked: true,
    requiredCourseId: 'backend-sql',
    pointsCost: 80, // كوينات (مُسعّر حسب المستوى وعدد الدروس)
  },
];

// ===== كل الدورات (with field names added automatically) =====
const rawCourses = [
  ...WEB_DEV_COURSES,
  ...PYTHON_COURSES,
  ...CPP_COURSES,
  ...CYBER_COURSES,
  ...AI_COURSES,
  ...REACT_NATIVE_COURSES,
  ...FLUTTER_COURSES,
  ...BACKEND_COURSES,
  ...DATABASE_COURSES,
];

// Add fieldName and fieldNameAr to all courses
const BASE_COURSES: Course[] = rawCourses.map((course) => {
  const { fieldName, fieldNameAr } = getFieldNames(course.fieldId);
  return {
    ...course,
    fieldName,
    fieldNameAr,
  };
});

// ===== نسبة الخصم عند فتح المسار كاملاً بالكوينات =====
export const FULL_FIELD_DISCOUNT = 0.15; // 15%

/**
 * حساب السعر الكامل لجميع كورسات المجال (بدون خصم)
 */
export function getFieldTotalPrice(fieldId: string): number {
  return ALL_COURSES.filter(
    (c) => c.fieldId === fieldId && c.pointsCost > 0
  ).reduce((sum, c) => sum + c.pointsCost, 0);
}

/**
 * حساب تكلفة فتح المسار كاملاً بالكوينات بعد خصم 15%
 */
export function getFieldDiscountedPrice(fieldId: string): number {
  const total = getFieldTotalPrice(fieldId);
  return Math.round(total * (1 - FULL_FIELD_DISCOUNT));
}

/**
 * حساب التكلفة المتبقية لفتح المسار كاملاً بعد خصم الدورات المفتوحة مسبقاً
 */
export function getFieldRemainingPrice(
  fieldId: string,
  unlockedCourses: string[]
): {
  originalTotal: number;
  alreadyPaid: number;
  remaining: number;
  discountedRemaining: number;
} {
  const courses = ALL_COURSES.filter(
    (c) => c.fieldId === fieldId && c.pointsCost > 0
  );
  const originalTotal = courses.reduce((sum, c) => sum + c.pointsCost, 0);
  const alreadyPaid = courses
    .filter((c) => unlockedCourses.includes(c.id))
    .reduce((sum, c) => sum + c.pointsCost, 0);
  const remaining = originalTotal - alreadyPaid;
  const discountedRemaining = Math.round(remaining * (1 - FULL_FIELD_DISCOUNT));
  return { originalTotal, alreadyPaid, remaining, discountedRemaining };
}

/**
 * الحصول على قائمة الدورات التي تُفتح بالكوينات ولم تُفتح بعد في مجال معيّن
 */
export function getLockedPaidCourses(
  fieldId: string,
  unlockedCourses: string[]
): Course[] {
  return ALL_COURSES.filter(
    (c) =>
      c.fieldId === fieldId &&
      c.pointsCost > 0 &&
      !unlockedCourses.includes(c.id)
  );
}

// ===== دروس HTML =====
export const HTML_LESSONS: Lesson[] = [
  {
    id: 'html-1',
    courseId: 'web-html-basics',
    title: 'ما هو HTML؟',
    description: 'تعرف على لغة بناء صفحات الويب',
    content: `
# ما هو HTML؟

HTML تعني **HyperText Markup Language** - لغة ترميز النص التشعبي.

## لماذا نتعلم HTML؟
- 🌐 أساس كل صفحات الويب
- 📱 تعمل على جميع الأجهزة
- 🚀 سهلة التعلم والبدء

## الهيكل الأساسي
كل صفحة HTML تتكون من:
1. وسم البداية \`<!DOCTYPE html>\`
2. عنصر \`<html>\` الرئيسي
3. قسم \`<head>\` للمعلومات
4. قسم \`<body>\` للمحتوى

## نصيحة مهمة 💡
HTML ليست لغة برمجة، بل لغة **ترميز** - تحدد هيكل الصفحة فقط!
    `,
    codeExample: `<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
    <title>صفحتي الأولى</title>
</head>
<body>
    <h1>مرحباً بالعالم!</h1>
    <p>هذه أول صفحة HTML لي 🎉</p>
</body>
</html>`,
    language: 'html',
    xpReward: 100,
    order: 1,
    quiz: {
      question: 'ماذا يعني HTML؟',
      options: [
        'High Tech Modern Language',
        'HyperText Markup Language',
        'Home Tool Markup Language',
        'HyperText Machine Language',
      ],
      correctAnswer: 1,
      explanation:
        'HTML هي اختصار لـ HyperText Markup Language - لغة ترميز النص التشعبي',
    },
  },
  {
    id: 'html-2',
    courseId: 'web-html-basics',
    title: 'العناوين والفقرات',
    description: 'تعلم كتابة النصوص بشكل منظم',
    content: `
# العناوين والفقرات

## العناوين (Headings)
HTML يوفر 6 مستويات من العناوين:
- \`<h1>\` - العنوان الرئيسي (الأكبر)
- \`<h2>\` - عنوان فرعي
- \`<h3>\` إلى \`<h6>\` - عناوين أصغر

## الفقرات (Paragraphs)
استخدم \`<p>\` لكتابة فقرات النص.

## نصائح مهمة 💡
- استخدم \`<h1>\` مرة واحدة فقط في الصفحة
- رتب العناوين بشكل تسلسلي
- لا تستخدم العناوين لتكبير الخط فقط!
    `,
    codeExample: `<h1>عنوان الصفحة الرئيسي</h1>

<h2>القسم الأول</h2>
<p>هذه فقرة تشرح القسم الأول.</p>

<h2>القسم الثاني</h2>
<p>وهذه فقرة أخرى للقسم الثاني.</p>

<h3>قسم فرعي</h3>
<p>تفاصيل إضافية هنا.</p>`,
    language: 'html',
    xpReward: 100,
    order: 2,
    quiz: {
      question: 'ما هو العنوان الأكبر في HTML؟',
      options: ['<h6>', '<h1>', '<title>', '<header>'],
      correctAnswer: 1,
      explanation: '<h1> هو أكبر عنوان ويستخدم للعنوان الرئيسي للصفحة',
    },
  },
  {
    id: 'html-3',
    courseId: 'web-html-basics',
    title: 'الروابط والصور',
    description: 'أضف روابط وصور لصفحتك',
    content: `
# الروابط والصور

## الروابط (Links)
استخدم \`<a>\` لإنشاء روابط:
- \`href\` - عنوان الرابط
- \`target="_blank"\` - فتح في نافذة جديدة

## الصور (Images)
استخدم \`<img>\` لإضافة صور:
- \`src\` - مصدر الصورة
- \`alt\` - نص بديل (مهم جداً!)
- \`width\` و \`height\` - الأبعاد

## أهمية alt 🎯
النص البديل مهم لـ:
- المكفوفين (قارئات الشاشة)
- محركات البحث (SEO)
- عند فشل تحميل الصورة
    `,
    codeExample: `<!-- رابط خارجي -->
<a href="https://google.com" target="_blank">
    زيارة جوجل
</a>

<!-- رابط داخلي -->
<a href="/about.html">صفحة من نحن</a>

<!-- صورة -->
<img src="photo.jpg" alt="وصف الصورة" width="300">

<!-- صورة مع رابط -->
<a href="https://example.com">
    <img src="logo.png" alt="الشعار">
</a>`,
    language: 'html',
    xpReward: 100,
    order: 3,
    quiz: {
      question: 'ما هي الخاصية المطلوبة في <img>؟',
      options: ['width', 'height', 'alt', 'title'],
      correctAnswer: 2,
      explanation: 'خاصية alt مطلوبة لأغراض الوصولية وSEO',
    },
  },
  {
    id: 'html-4',
    courseId: 'web-html-basics',
    title: 'القوائم',
    description: 'أنشئ قوائم مرتبة وغير مرتبة',
    content: `
# القوائم في HTML

## أنواع القوائم
1. **قائمة غير مرتبة** \`<ul>\` - نقاط
2. **قائمة مرتبة** \`<ol>\` - أرقام
3. **قائمة وصفية** \`<dl>\` - تعريفات

## عناصر القائمة
كل عنصر في القائمة يوضع داخل \`<li>\`

## القوائم المتداخلة
يمكنك وضع قائمة داخل قائمة أخرى!
    `,
    codeExample: `<!-- قائمة غير مرتبة -->
<ul>
    <li>عنصر أول</li>
    <li>عنصر ثاني</li>
    <li>عنصر ثالث</li>
</ul>

<!-- قائمة مرتبة -->
<ol>
    <li>الخطوة الأولى</li>
    <li>الخطوة الثانية</li>
    <li>الخطوة الثالثة</li>
</ol>

<!-- قائمة متداخلة -->
<ul>
    <li>فواكه
        <ul>
            <li>تفاح</li>
            <li>برتقال</li>
        </ul>
    </li>
    <li>خضار</li>
</ul>`,
    language: 'html',
    xpReward: 100,
    order: 4,
    quiz: {
      question: 'ما العنصر المستخدم لإنشاء قائمة مرتبة (مرقمة)؟',
      options: ['<ul>', '<ol>', '<li>', '<list>'],
      correctAnswer: 1,
      explanation:
        '<ol> تعني Ordered List وتُنشئ قائمة مرقمة، بينما <ul> لقائمة غير مرتبة',
    },
  },
  {
    id: 'html-5',
    courseId: 'web-html-basics',
    title: 'الجداول',
    description: 'عرض البيانات في جداول',
    content: `
# الجداول في HTML

## عناصر الجدول
- \`<table>\` - الجدول
- \`<tr>\` - صف (table row)
- \`<th>\` - خلية عنوان (table header)
- \`<td>\` - خلية بيانات (table data)

## أقسام الجدول
- \`<thead>\` - رأس الجدول
- \`<tbody>\` - جسم الجدول
- \`<tfoot>\` - ذيل الجدول

## خصائص مفيدة
- \`colspan\` - دمج أعمدة
- \`rowspan\` - دمج صفوف
    `,
    codeExample: `<table>
    <thead>
        <tr>
            <th>الاسم</th>
            <th>العمر</th>
            <th>المدينة</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>أحمد</td>
            <td>25</td>
            <td>بغداد</td>
        </tr>
        <tr>
            <td>سارة</td>
            <td>22</td>
            <td>البصرة</td>
        </tr>
    </tbody>
</table>`,
    language: 'html',
    xpReward: 100,
    order: 5,
  },
  {
    id: 'html-6',
    courseId: 'web-html-basics',
    title: 'النماذج - الجزء الأول',
    description: 'إنشاء نماذج إدخال البيانات',
    content: `
# النماذج (Forms)

## عنصر Form
\`<form>\` يحتوي على جميع عناصر الإدخال

## عناصر الإدخال الأساسية
- \`<input type="text">\` - نص
- \`<input type="email">\` - بريد إلكتروني
- \`<input type="password">\` - كلمة مرور
- \`<input type="number">\` - رقم
- \`<textarea>\` - نص طويل

## خصائص مهمة
- \`name\` - اسم الحقل
- \`placeholder\` - نص توضيحي
- \`required\` - حقل مطلوب
- \`value\` - القيمة الافتراضية
    `,
    codeExample: `<form action="/submit" method="POST">
    <label for="name">الاسم:</label>
    <input type="text" id="name" name="name" 
           placeholder="أدخل اسمك" required>
    
    <label for="email">البريد:</label>
    <input type="email" id="email" name="email" 
           placeholder="example@mail.com">
    
    <label for="password">كلمة المرور:</label>
    <input type="password" id="password" name="password" 
           minlength="8">
    
    <label for="message">رسالتك:</label>
    <textarea id="message" name="message" 
              rows="4" cols="50"></textarea>
    
    <button type="submit">إرسال</button>
</form>`,
    language: 'html',
    xpReward: 100,
    order: 6,
  },
  {
    id: 'html-7',
    courseId: 'web-html-basics',
    title: 'النماذج - الجزء الثاني',
    description: 'أنواع متقدمة من عناصر الإدخال',
    content: `
# عناصر إدخال متقدمة

## أنواع input إضافية
- \`checkbox\` - مربع اختيار
- \`radio\` - زر اختيار واحد
- \`date\` - تاريخ
- \`file\` - رفع ملف
- \`range\` - شريط تمرير
- \`color\` - اختيار لون

## القوائم المنسدلة
استخدم \`<select>\` مع \`<option>\`

## التسميات (Labels)
استخدم \`<label>\` مع \`for\` للوصولية
    `,
    codeExample: `<!-- خانات الاختيار -->
<label>
    <input type="checkbox" name="agree"> أوافق على الشروط
</label>

<!-- أزرار الراديو -->
<p>الجنس:</p>
<label><input type="radio" name="gender" value="male"> ذكر</label>
<label><input type="radio" name="gender" value="female"> أنثى</label>

<!-- قائمة منسدلة -->
<label for="city">المدينة:</label>
<select id="city" name="city">
    <option value="">اختر مدينة</option>
    <option value="baghdad">بغداد</option>
    <option value="basra">البصرة</option>
    <option value="erbil">أربيل</option>
</select>

<!-- تاريخ -->
<input type="date" name="birthday">

<!-- رفع ملف -->
<input type="file" name="photo" accept="image/*">`,
    language: 'html',
    xpReward: 100,
    order: 7,
  },
  {
    id: 'html-8',
    courseId: 'web-html-basics',
    title: 'العناصر الدلالية',
    description: 'HTML5 Semantic Elements',
    content: `
# العناصر الدلالية (Semantic HTML)

## لماذا العناصر الدلالية؟
- 📖 كود أسهل للقراءة
- 🔍 أفضل لمحركات البحث (SEO)
- ♿ أفضل للوصولية

## العناصر الرئيسية
- \`<header>\` - رأس الصفحة/القسم
- \`<nav>\` - قائمة التنقل
- \`<main>\` - المحتوى الرئيسي
- \`<article>\` - مقال مستقل
- \`<section>\` - قسم عام
- \`<aside>\` - محتوى جانبي
- \`<footer>\` - ذيل الصفحة

## نصيحة 💡
استخدم العناصر الدلالية بدلاً من \`<div>\` كلما أمكن!
    `,
    codeExample: `<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
    <title>موقعي</title>
</head>
<body>
    <header>
        <h1>شعار الموقع</h1>
        <nav>
            <a href="/">الرئيسية</a>
            <a href="/about">من نحن</a>
            <a href="/contact">اتصل بنا</a>
        </nav>
    </header>
    
    <main>
        <article>
            <h2>عنوان المقال</h2>
            <p>محتوى المقال هنا...</p>
        </article>
        
        <aside>
            <h3>مقالات مشابهة</h3>
            <ul>
                <li><a href="#">مقال 1</a></li>
                <li><a href="#">مقال 2</a></li>
            </ul>
        </aside>
    </main>
    
    <footer>
        <p>جميع الحقوق محفوظة © 2026</p>
    </footer>
</body>
</html>`,
    language: 'html',
    xpReward: 100,
    order: 8,
    quiz: {
      question: 'أي عنصر يستخدم للمحتوى الرئيسي؟',
      options: ['<div>', '<main>', '<section>', '<article>'],
      correctAnswer: 1,
      explanation: '<main> يستخدم لتحديد المحتوى الرئيسي الفريد للصفحة',
    },
  },
];

// ===== التحديات =====
export const CHALLENGES: Challenge[] = [
  // تحديات سهلة
  {
    id: 'ch-1',
    title: 'Hello World',
    description: 'اكتب برنامج يطبع "Hello, World!" على الشاشة',
    difficulty: 'easy',
    points: 10,
    language: 'Python',
    icon: 'code',
    starterCode: `# اكتب الكود هنا
`,
    solution: `print("Hello, World!")`,
    hints: ['استخدم دالة print()', 'لا تنسى علامات الاقتباس حول النص'],
    testCases: [
      {
        input: '',
        expectedOutput: 'Hello, World!',
        description: 'يجب أن يطبع Hello, World!',
      },
    ],
    isLocked: false,
    category: 'basics',
  },
  {
    id: 'ch-2',
    title: 'جمع رقمين',
    description: 'اكتب دالة تستقبل رقمين وترجع مجموعهما',
    difficulty: 'easy',
    points: 15,
    language: 'Python',
    icon: 'calculate',
    starterCode: `def add(a, b):
    # اكتب الكود هنا
    pass
`,
    solution: `def add(a, b):
    return a + b`,
    hints: ['استخدم كلمة return', 'العملية بسيطة: a + b'],
    testCases: [
      { input: '2, 3', expectedOutput: '5', description: '2 + 3 = 5' },
      { input: '0, 0', expectedOutput: '0', description: '0 + 0 = 0' },
      { input: '-1, 1', expectedOutput: '0', description: '-1 + 1 = 0' },
    ],
    isLocked: false,
    category: 'basics',
  },
  {
    id: 'ch-3',
    title: 'عكس النص',
    description: 'اكتب دالة تعكس النص المعطى',
    difficulty: 'easy',
    points: 20,
    language: 'Python',
    icon: 'swap-horiz',
    starterCode: `def reverse_string(text):
    # اكتب الكود هنا
    pass
`,
    solution: `def reverse_string(text):
    return text[::-1]`,
    hints: ['يمكنك استخدام slicing بخطوة سالبة', 'text[::-1] يعكس النص'],
    testCases: [
      { input: '"hello"', expectedOutput: 'olleh', description: 'عكس hello' },
      { input: '"مرحبا"', expectedOutput: 'ابحرم', description: 'عكس نص عربي' },
    ],
    isLocked: false,
    category: 'strings',
  },
  // تحديات متوسطة
  {
    id: 'ch-4',
    title: 'رقم أولي',
    description: 'اكتب دالة تتحقق إذا كان الرقم أولياً',
    difficulty: 'medium',
    points: 30,
    language: 'Python',
    icon: 'functions',
    starterCode: `def is_prime(n):
    # الرقم الأولي يقبل القسمة على 1 ونفسه فقط
    pass
`,
    solution: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True`,
    hints: [
      'الأرقام أقل من 2 ليست أولية',
      'تحقق من القسمة حتى جذر الرقم فقط',
      'استخدم % للتحقق من باقي القسمة',
    ],
    testCases: [
      { input: '7', expectedOutput: 'True', description: '7 رقم أولي' },
      { input: '4', expectedOutput: 'False', description: '4 ليس أولي' },
      { input: '1', expectedOutput: 'False', description: '1 ليس أولي' },
      { input: '17', expectedOutput: 'True', description: '17 رقم أولي' },
    ],
    isLocked: true,
    category: 'math',
  },
  {
    id: 'ch-5',
    title: 'فيبوناتشي',
    description: 'اكتب دالة ترجع العدد n من سلسلة فيبوناتشي',
    difficulty: 'medium',
    points: 40,
    language: 'Python',
    icon: 'timeline',
    starterCode: `def fibonacci(n):
    # سلسلة فيبوناتشي: 0, 1, 1, 2, 3, 5, 8, 13, ...
    pass
`,
    solution: `def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`,
    hints: [
      'الحالات الأساسية: fib(0)=0, fib(1)=1',
      'كل رقم = مجموع الرقمين السابقين',
    ],
    testCases: [
      { input: '0', expectedOutput: '0', description: 'fib(0) = 0' },
      { input: '1', expectedOutput: '1', description: 'fib(1) = 1' },
      { input: '10', expectedOutput: '55', description: 'fib(10) = 55' },
    ],
    isLocked: true,
    category: 'math',
  },
  {
    id: 'ch-6',
    title: 'ترتيب الفقاعات',
    description: 'نفذ خوارزمية Bubble Sort لترتيب قائمة',
    difficulty: 'medium',
    points: 50,
    language: 'Python',
    icon: 'sort',
    starterCode: `def bubble_sort(arr):
    # رتب القائمة بدون استخدام sort()
    pass
`,
    solution: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`,
    hints: [
      'قارن كل عنصرين متجاورين',
      'بدّل مكانهما إذا كان الأول أكبر',
      'كرر حتى لا يتبقى تبديلات',
    ],
    testCases: [
      {
        input: '[64, 34, 25, 12, 22]',
        expectedOutput: '[12, 22, 25, 34, 64]',
        description: 'ترتيب قائمة أرقام',
      },
      {
        input: '[1]',
        expectedOutput: '[1]',
        description: 'عنصر واحد',
      },
      {
        input: '[3, -1, 0, 5, -2]',
        expectedOutput: '[-2, -1, 0, 3, 5]',
        description: 'أرقام سالبة وموجبة',
      },
    ],
    isLocked: true,
    category: 'algorithms',
  },
  // تحديات صعبة
  {
    id: 'ch-7',
    title: 'البحث الثنائي',
    description: 'نفذ خوارزمية Binary Search',
    difficulty: 'hard',
    points: 70,
    language: 'Python',
    icon: 'search',
    starterCode: `def binary_search(arr, target):
    # ابحث عن target في القائمة المرتبة arr
    # أرجع الفهرس أو -1 إذا لم يوجد
    pass
`,
    solution: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    hints: [
      'ابدأ من المنتصف',
      'إذا كان الهدف أكبر، ابحث في النصف الأيمن',
      'إذا كان أصغر، ابحث في النصف الأيسر',
    ],
    testCases: [
      {
        input: '[1, 2, 3, 4, 5], 3',
        expectedOutput: '2',
        description: 'البحث عن 3 في الفهرس 2',
      },
      {
        input: '[1, 2, 3, 4, 5], 6',
        expectedOutput: '-1',
        description: '6 غير موجود يرجع -1',
      },
      {
        input: '[1, 2, 3, 4, 5], 1',
        expectedOutput: '0',
        description: 'أول عنصر في الفهرس 0',
      },
      {
        input: '[10, 20, 30, 40, 50], 50',
        expectedOutput: '4',
        description: 'آخر عنصر في الفهرس 4',
      },
    ],
    isLocked: true,
    category: 'algorithms',
  },
  {
    id: 'ch-8',
    title: 'الأقواس المتوازنة',
    description: 'تحقق إذا كانت الأقواس في النص متوازنة',
    difficulty: 'hard',
    points: 80,
    language: 'Python',
    icon: 'check-circle',
    starterCode: `def is_balanced(s):
    # تحقق من توازن الأقواس: (), [], {}
    pass
`,
    solution: `def is_balanced(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for char in s:
        if char in '([{':
            stack.append(char)
        elif char in ')]}':
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
    return len(stack) == 0`,
    hints: [
      'استخدم Stack (قائمة كـ stack)',
      'أضف الأقواس الفاتحة للـ stack',
      'عند قوس غالق، تحقق من المطابقة',
    ],
    testCases: [
      { input: '"([{}])"', expectedOutput: 'True', description: 'متوازن' },
      { input: '"([)]"', expectedOutput: 'False', description: 'غير متوازن' },
      { input: '""', expectedOutput: 'True', description: 'نص فارغ' },
    ],
    isLocked: true,
    category: 'data-structures',
  },
  {
    id: 'ch-9',
    title: 'مصفوفة حلزونية',
    description: 'اطبع عناصر مصفوفة بشكل حلزوني',
    difficulty: 'hard',
    points: 100,
    language: 'Python',
    icon: 'rotate-right',
    starterCode: `def spiral_order(matrix):
    # أرجع عناصر المصفوفة بترتيب حلزوني
    pass
`,
    solution: `def spiral_order(matrix):
    if not matrix:
        return []
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    
    while top <= bottom and left <= right:
        for i in range(left, right + 1):
            result.append(matrix[top][i])
        top += 1
        
        for i in range(top, bottom + 1):
            result.append(matrix[i][right])
        right -= 1
        
        if top <= bottom:
            for i in range(right, left - 1, -1):
                result.append(matrix[bottom][i])
            bottom -= 1
        
        if left <= right:
            for i in range(bottom, top - 1, -1):
                result.append(matrix[i][left])
            left += 1
    
    return result`,
    hints: [
      'استخدم 4 مؤشرات: top, bottom, left, right',
      'امشِ في 4 اتجاهات: يمين، أسفل، يسار، أعلى',
      'قلص الحدود بعد كل اتجاه',
    ],
    testCases: [
      {
        input: '[[1,2,3],[4,5,6],[7,8,9]]',
        expectedOutput: '[1, 2, 3, 6, 9, 8, 7, 4, 5]',
        description: 'مصفوفة 3×3',
      },
      {
        input: '[[1,2],[3,4]]',
        expectedOutput: '[1, 2, 4, 3]',
        description: 'مصفوفة 2×2',
      },
    ],
    isLocked: true,
    category: 'arrays',
  },
];

// ===== جميع الدروس =====
const RAW_LESSONS: Lesson[] = [
  ...HTML_LESSONS,
  ...ALL_CSS_LESSONS,
  ...ALL_PYTHON_LESSONS,
  ...ALL_CPP_LESSONS,
  ...ALL_CYBER_LESSONS,
  ...ALL_JS_LESSONS,
  ...ALL_REACT_LESSONS,
  ...ALL_AI_LESSONS,
  ...ALL_DEPLOYMENT_LESSONS,
  ...ALL_REACT_NATIVE_LESSONS,
  ...ALL_FLUTTER_LESSONS,
  ...ALL_BACKEND_LESSONS,
  // المحتوى الموسّع الإضافي
  ...ALL_EXPANDED_WEB_LESSONS,
  ...ALL_EXPANDED_CYBER_LESSONS,
  ...ALL_EXPANDED_APP_DEV_LESSONS,
];

// ===== المناهج: الترتيب والأقسام والدروس المضافة/المحسّنة (انظر curriculum/) =====
const CURRICULUM = applyCurriculum(BASE_COURSES, RAW_LESSONS);
export const ALL_COURSES: Course[] = CURRICULUM.courses;
export const ALL_LESSONS: Lesson[] = CURRICULUM.lessons;

// ===== جميع التحديات =====
// التصحيحات الناتجة عن تدقيق التحديات (انظر challengeFixes.ts)
const LEGACY_CHALLENGES: Challenge[] = applyChallengeFixes([
  ...CHALLENGES,
  ...ALL_CSS_CHALLENGES,
  ...ALL_PYTHON_CHALLENGES,
  ...ALL_CPP_CHALLENGES,
  ...ALL_CYBER_CHALLENGES,
  ...ALL_JS_CHALLENGES,
  ...ALL_REACT_CHALLENGES,
  ...ALL_AI_CHALLENGES,
  ...ALL_DEPLOYMENT_CHALLENGES,
  ...REACT_NATIVE_CHALLENGES,
  ...FLUTTER_CHALLENGES,
  ...ALL_BACKEND_CHALLENGES,
  // التحديات الموسّعة الإضافية
  ...ALL_EXPANDED_WEB_CHALLENGES,
  ...ALL_EXPANDED_CYBER_CHALLENGES,
  ...ALL_EXPANDED_APP_DEV_CHALLENGES,
  // الخوارزميات وهياكل البيانات
  ...ALL_ALGORITHM_CHALLENGES,
  ...ALL_DS_CHALLENGES,
]);

// تحديات التوسعة (مرتبطة بدروس محددة) تُضاف بعد القديمة ولا تغيّر ترتيب/وصول أي تحدٍ قديم
export const ALL_CHALLENGES: Challenge[] = [...LEGACY_CHALLENGES, ...EXPANSION_CHALLENGES];

// ===== دالة الحصول على الدورات حسب المجال =====
export function getCoursesByField(fieldId: string): Course[] {
  return ALL_COURSES.filter((course) => course.fieldId === fieldId);
}

// ===== دالة الحصول على الدروس حسب الدورة =====
export function getLessonsByCourse(courseId: string): Lesson[] {
  return ALL_LESSONS.filter((lesson) => lesson.courseId === courseId);
}

// ===== دالة الحصول على التحديات حسب الصعوبة =====
export function getChallengesByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard'
): Challenge[] {
  return CHALLENGES.filter((ch) => ch.difficulty === difficulty);
}

// ===== نظام الوصول للتحديات =====
// - أول 40% من تحديات كل لغة → مجانية للجميع
// - الباقي → تُفتح مع الدورة المرتبطة (تُفتح بالكوينات المكتسبة، بدون أي دفع)

// كاش لفهرس كل تحدي داخل مجموعة لغته (يُحسب مرة واحدة فقط)
const _challengeIndexCache = new Map<string, number>();
const _challengeCountCache = new Map<string, number>();

function _buildChallengeIndexCache() {
  if (_challengeIndexCache.size > 0) return; // already built

  // تجميع عدد التحديات حسب اللغة + ترتيبها
  const langCounters = new Map<string, number>();
  // قاعدة "أول 40% مجانية" للتحديات القديمة فقط: تحديات التوسعة لا تغيّر ترتيبها
  for (const ch of LEGACY_CHALLENGES) {
    const lang = (ch.language || '').toLowerCase();
    const idx = langCounters.get(lang) ?? 0;
    _challengeIndexCache.set(ch.id, idx);
    langCounters.set(lang, idx + 1);
  }
  for (const [lang, count] of langCounters) {
    _challengeCountCache.set(lang, count);
  }
}

export type ChallengeAccessType = 'free' | 'course-required';

/**
 * تحديد نوع الوصول للتحدي:
 * - أول 40% من تحديات كل لغة → مجاني للجميع
 * - الباقي → يتطلب فتح الدورة المرتبطة باللغة (بالكوينات)
 * - إذا لم توجد دورة قابلة للفتح في المجال → مجاني
 */
export function getChallengeAccessType(
  challenge: Challenge
): ChallengeAccessType {
  if (challenge.afterLessonId) {
    return getChallengeRequiredCourseId(challenge) ? 'course-required' : 'free';
  }
  _buildChallengeIndexCache();

  const lang = (challenge.language || '').toLowerCase();
  const idx = _challengeIndexCache.get(challenge.id) ?? 0;
  const total = _challengeCountCache.get(lang) ?? 1;
  const freeCount = Math.max(1, Math.ceil(total * 0.4));

  if (idx < freeCount) return 'free';
  return getChallengeRequiredCourseId(challenge) ? 'course-required' : 'free';
}

/**
 * إيجاد أول دورة تُفتح بالكوينات في نفس المجال
 */
function _findFirstPaidCourseInField(
  fieldId: string,
  trackId?: string
): string | undefined {
  const paidInField = ALL_COURSES.filter(
    (c) => c.fieldId === fieldId && c.pointsCost > 0
  );
  // نفس المسار أولاً (flutter-basics ← flutter-advanced وليس rn-advanced في مجال mobile-dev)
  const sameTrack = trackId
    ? paidInField.find((c) => c.id.split('-')[0] === trackId)
    : undefined;
  return (sameTrack ?? paidInField[0])?.id;
}

/**
 * ربط التحدي بالدورة الخام (بدون تصفية المجاني)
 * - تُستخدم داخلياً فقط
 */
function _getRawChallengeRequiredCourseId(
  challenge: Challenge
): string | undefined {
  // إذا كان التحدي مرتبطاً بدورة مسبقاً
  if (challenge.courseId) return challenge.courseId;

  const id = challenge.id?.toLowerCase() || '';
  const lang = challenge.language?.toLowerCase() || '';

  // ربط حسب بادئة المعرّف (أدق)
  if (id.startsWith('ai-')) return 'ai-basics';
  if (id.startsWith('cyber-')) return 'cyber-basics';
  if (id.startsWith('rn-')) return 'rn-basics';
  if (id.startsWith('flutter-')) return 'flutter-basics';
  if (id.startsWith('deploy-')) return 'web-deployment';
  if (id.startsWith('backend-')) return 'backend-nodejs';
  if (id.startsWith('html-')) return 'web-html-basics';
  if (id.startsWith('css-')) return 'web-css-styling';
  if (id.startsWith('react-')) return 'web-react-intro';
  if (id.startsWith('js-')) return 'web-js-basics';
  if (id.startsWith('py-')) return 'py-basics';
  if (id.startsWith('cpp-')) return 'cpp-basics';
  if (id.startsWith('json-')) return 'web-js-basics';
  if (id.startsWith('git-')) return 'web-deployment';

  // ربط حسب اللغة (احتياطي)
  if (lang === 'python') return 'py-basics';
  if (lang === 'javascript' || lang === 'js') return 'web-js-basics';
  if (lang === 'css') return 'web-css-styling';
  if (lang === 'html') return 'web-html-basics';
  if (lang === 'c++' || lang === 'cpp') return 'cpp-basics';
  if (lang === 'react') return 'web-react-intro';
  if (lang === 'dart') return 'flutter-basics';
  if (lang === 'node.js' || lang === 'nodejs') return 'backend-nodejs';
  if (lang === 'sql') return 'backend-sql';
  if (lang === 'typescript') return 'rn-basics';
  if (lang === 'bash' || lang === 'shell') return 'web-deployment';

  return undefined;
}

/**
 * ربط التحدي بالدورة المطلوبة حسب اللغة أو المعرّف
 * ⚡ إصلاح: إذا كانت الدورة مجانية (pointsCost === 0)
 *    يتم إعادة الربط تلقائياً بأول دورة تُفتح بالكوينات في نفس المجال
 */
export function getChallengeRequiredCourseId(
  challenge: Challenge
): string | undefined {
  // تحديات التوسعة: دورتها نفسها (المبتدئة مفتوحة دائماً → بلا قفل)
  if (challenge.afterLessonId) {
    const own = ALL_COURSES.find((c) => c.id === challenge.courseId);
    return own && own.difficulty !== 'beginner' ? own.id : undefined;
  }
  const rawCourseId = _getRawChallengeRequiredCourseId(challenge);
  if (!rawCourseId) return undefined;

  // التحقق: هل الدورة مجانية؟
  const course = ALL_COURSES.find((c) => c.id === rawCourseId);
  if (!course) return rawCourseId;

  if (course.pointsCost === 0) {
    // الدورة مجانية → ابحث عن أول دورة تُفتح بالكوينات في نفس المجال
    const paidCourseId = _findFirstPaidCourseInField(
      course.fieldId,
      course.id.split('-')[0]
    );
    return paidCourseId || undefined; // لا توجد دورة تُفتح بالكوينات → undefined (مجاني)
  }

  return rawCourseId;
}

/**
 * جلب اسم الدورة حسب المعرّف
 */
export function getCourseTitleById(courseId: string): string {
  const course = ALL_COURSES.find((c) => c.id === courseId);
  return course?.title || courseId;
}

/**
 * جلب التحديات المرتبطة بدورة معينة
 */
export function getChallengesByCourse(courseId: string): Challenge[] {
  const directMatches = ALL_CHALLENGES.filter((c) => c.courseId === courseId);
  const mappedMatches = ALL_CHALLENGES.filter(
    (c) => !c.courseId && getChallengeRequiredCourseId(c) === courseId
  );

  const allMatches = [...directMatches, ...mappedMatches];

  return allMatches;
}

/**
 * التحقق من إمكانية الوصول للدورة
 * ملاحظة: الدورة تُعتبر مفتوحة فقط إذا أكمل المستخدم دروساً منها
 * (لا يكفي أن تكون مجانية، يجب أن تكون في unlockedCourses)
 */
export function isCourseAccessible(
  courseId: string,
  unlockedCourses: string[]
): boolean {
  const course = ALL_COURSES.find((c) => c.id === courseId);
  if (!course) return false;
  // الدورة مفتوحة فقط إذا أكمل المستخدم دروساً منها (تجاهل الدرس المجاني الأول)
  return unlockedCourses.includes(courseId);
}

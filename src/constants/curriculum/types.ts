import type { Course, Lesson } from '../courseData';

/** درس جديد (courseId و order يُملآن تلقائياً من خطة الدورة) */
export type NewLesson = Omit<Lesson, 'courseId' | 'order'> & { courseId?: string; order?: number };

/**
 * خطة منهج دورة واحدة.
 * - معرّفات الدروس الموجودة لا تتغيّر أبداً (التقدم مرتبط بها).
 * - sections تحدد الترتيب النهائي والأقسام: كل درس في الدورة يجب أن يظهر مرة واحدة.
 */
export interface CoursePlan {
  courseId: string;
  /** تصحيح بيانات الدورة (الوصف، العنوان...) — totalLessons و totalXP تُحسب تلقائياً */
  course?: Partial<Pick<Course, 'title' | 'description' | 'difficulty' | 'requiredCourseId'>>;
  /** تعديل دروس موجودة بمعرّفها */
  patches?: Record<string, Partial<Omit<Lesson, 'id' | 'courseId'>>>;
  /**
   * إصلاحات صغيرة في codeExample لدروس موجودة: [النص القديم، النص الجديد]
   * (مثل إضافة #include ناقص) دون إعادة كتابة المثال كاملاً.
   * validate.ts يفشل إذا لم يُعثر على النص القديم.
   */
  codeFixes?: Record<string, [string, string][]>;
  /** مثل codeFixes لكن على نص الشرح (content) — لتصحيح كتلة كود أو جملة في درس جيد عموماً */
  contentFixes?: Record<string, [string, string][]>;
  /**
   * تصحيح لغة كتل الكود في الشرح: رقم الكتلة (من 1 بترتيب ظهورها) ← اللغة الصحيحة.
   * لكتل بلا لغة أو بلغة خاطئة (طلب HTTP موسوم Python، رسم ASCII...) — التلوين والفحص يعتمدان عليها.
   */
  fenceLangs?: Record<string, Record<number, string>>;
  /** دروس جديدة */
  newLessons?: NewLesson[];
  /** دروس موجودة في ملف آخر تُنقل لهذه الدورة (مثل دروس بلا دورة) */
  adopt?: string[];
  /** الترتيب النهائي مقسّماً إلى أقسام */
  sections: { title: string; lessons: string[] }[];
}

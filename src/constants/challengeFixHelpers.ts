import type { Challenge, TestCase } from './courseData';

export type ChallengeFix = Partial<Omit<Challenge, 'id'>> & {
  /** اختبارات تُضاف إلى الموجودة (غالباً مخفية لمنع الحلول الثابتة) */
  addTests?: TestCase[];
  /** تعديل مبني على القيمة الأصلية (مثلاً تصحيح جملة في الحل) */
  transform?: (c: Challenge) => Partial<Challenge>;
};

/** اختبار مرئي */
export const t = (input: string, expectedOutput: string, description: string): TestCase => ({
  input,
  expectedOutput,
  description,
});

/** اختبار مخفي (لا تُعرض مدخلاته ولا نتيجته المتوقعة للمستخدم) */
export const h = (input: string, expectedOutput: string, description: string): TestCase => ({
  input,
  expectedOutput,
  description,
  hidden: true,
});

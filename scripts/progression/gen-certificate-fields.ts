/**
 * يولّد خريطة المجالات لدالة الشهادات من المنهج الفعلي (لا تعدّل الناتج يدوياً):
 *   npx tsx scripts/progression/gen-certificate-fields.ts
 * الناتج: supabase/functions/certificate/fields.generated.ts
 *
 * السيرفر يحسب أهلية الشهادة بنفسه (الدروس والتحديات واسم المجال) بدل الأرقام القادمة من التطبيق.
 * نفس منطق useCertificate: دورات المجال ← دروسها + getChallengesByCourse لكل دورة.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_COURSES, getLessonsByCourse, getChallengesByCourse } from '../../src/constants/courseData';
import { PROGRAMMING_FIELDS } from '../../src/constants/index';

interface FieldSpec {
  name: string;
  nameAr: string;
  courses: string[];
  lessons: string[];
  challenges: string[];
}

const fields: Record<string, FieldSpec> = {};
for (const course of ALL_COURSES) {
  const fid = course.fieldId;
  if (!fid) continue;
  const meta = PROGRAMMING_FIELDS.find((f: any) => f.id === fid) as any;
  const spec = (fields[fid] ??= { name: meta?.name || fid, nameAr: meta?.nameAr || meta?.name || fid, courses: [], lessons: [], challenges: [] });
  spec.courses.push(course.id);
  spec.lessons.push(...getLessonsByCourse(course.id).map((l) => l.id));
  spec.challenges.push(...getChallengesByCourse(course.id).map((c) => c.id));
}
for (const spec of Object.values(fields)) {
  spec.lessons = [...new Set(spec.lessons)];
  spec.challenges = [...new Set(spec.challenges)];
}

const out = `// مولّد تلقائياً بواسطة scripts/progression/gen-certificate-fields.ts — لا تعدّله يدوياً.
// دورات ودروس وتحديات كل مجال كما يعرضها التطبيق، ليحسب السيرفر أهلية الشهادة بنفسه.
export interface CertificateField {
  name: string;
  nameAr: string;
  courses: string[];
  lessons: string[];
  challenges: string[];
}

export const CERTIFICATE_FIELDS: Record<string, CertificateField> = ${JSON.stringify(fields, null, 2)};
`;
writeFileSync(join(__dirname, '../../supabase/functions/certificate/fields.generated.ts'), out);
for (const [id, f] of Object.entries(fields)) {
  console.log(`${id.padEnd(14)} courses=${f.courses.length} lessons=${f.lessons.length} challenges=${f.challenges.length}`);
}

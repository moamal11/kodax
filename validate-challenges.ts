/**
 * سكريبت فحص التحديات
 * يتحقق من أن وصف كل تحدي يطابق الحل المتوقع
 */

import { ALL_CHALLENGES } from './src/constants/courseData';

interface ValidationResult {
  challengeId: string;
  title: string;
  valid: boolean;
  issues: string[];
}

function validateChallenge(challenge: any): ValidationResult {
  const issues: string[] = [];

  // 1. التحقق من وجود الحقول المطلوبة
  if (!challenge.id) issues.push('❌ ID مفقود');
  if (!challenge.title) issues.push('❌ العنوان مفقود');
  if (!challenge.description) issues.push('❌ الوصف مفقود');
  if (!challenge.solution) issues.push('❌ الحل مفقود');
  if (!challenge.testCases || challenge.testCases.length === 0) {
    issues.push('❌ حالات الاختبار مفقودة');
  }

  // 2. التحقق من أن starterCode لا يحتوي على الحل كاملاً
  if (challenge.starterCode && challenge.solution) {
    const starterClean = challenge.starterCode
      .replace(/\s+/g, '')
      .toLowerCase();
    const solutionClean = challenge.solution.replace(/\s+/g, '').toLowerCase();

    // إذا كان starter code يحتوي على 90% من solution، فهذه مشكلة
    if (
      starterClean.includes(
        solutionClean.slice(0, Math.floor(solutionClean.length * 0.8))
      )
    ) {
      issues.push('⚠️ الكود الابتدائي يحتوي على معظم الحل');
    }
  }

  // 3. التحقق من testCases
  if (challenge.testCases) {
    challenge.testCases.forEach((test: any, idx: number) => {
      if (!test.expectedOutput) {
        issues.push(`❌ Test ${idx + 1}: expectedOutput مفقود`);
      }
      if (!test.description) {
        issues.push(`⚠️ Test ${idx + 1}: الوصف مفقود`);
      }
    });
  }

  // 4. التحقق من صحة الحل (محاولة تشغيله)
  if (
    challenge.language === 'JavaScript' ||
    challenge.language === 'TypeScript'
  ) {
    try {
      // محاولة parse JavaScript code
      new Function(challenge.solution);
    } catch (e) {
      issues.push(`❌ الحل يحتوي على syntax error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // 5. التحقق من أن الوصف يذكر المطلوب بوضوح
  const descLower = challenge.description?.toLowerCase() || '';
  if (
    !descLower.includes('اكتب') &&
    !descLower.includes('أنشئ') &&
    !descLower.includes('نفذ')
  ) {
    issues.push('⚠️ الوصف لا يوضح المطلوب بشكل واضح (يجب أن يبدأ بفعل أمر)');
  }

  // 6. التحقق من difficulty
  if (!['easy', 'medium', 'hard'].includes(challenge.difficulty)) {
    issues.push(`❌ Difficulty غير صحيح: ${challenge.difficulty}`);
  }

  // 7. التحقق من points
  if (!challenge.points || challenge.points <= 0) {
    issues.push('❌ النقاط غير صحيحة');
  }

  return {
    challengeId: challenge.id,
    title: challenge.title,
    valid: issues.length === 0,
    issues,
  };
}

function runValidation() {
  console.log('🔍 بدء فحص التحديات...\n');
  console.log(`📊 إجمالي التحديات: ${ALL_CHALLENGES.length}\n`);

  const results: ValidationResult[] = ALL_CHALLENGES.map(validateChallenge);

  const validChallenges = results.filter((r) => r.valid);
  const invalidChallenges = results.filter((r) => !r.valid);

  console.log('✅ تحديات صحيحة:', validChallenges.length);
  console.log('❌ تحديات بها مشاكل:', invalidChallenges.length);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (invalidChallenges.length > 0) {
    console.log('📋 التحديات التي تحتاج إصلاح:\n');

    invalidChallenges.forEach((result, idx) => {
      console.log(`${idx + 1}. ${result.title} (${result.challengeId})`);
      result.issues.forEach((issue) => {
        console.log(`   ${issue}`);
      });
      console.log('');
    });
  } else {
    console.log('🎉 جميع التحديات صحيحة!');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ملخص حسب الصعوبة
  const byDifficulty = {
    easy: results.filter(
      (r) =>
        ALL_CHALLENGES.find((c) => c.id === r.challengeId)?.difficulty ===
        'easy'
    ),
    medium: results.filter(
      (r) =>
        ALL_CHALLENGES.find((c) => c.id === r.challengeId)?.difficulty ===
        'medium'
    ),
    hard: results.filter(
      (r) =>
        ALL_CHALLENGES.find((c) => c.id === r.challengeId)?.difficulty ===
        'hard'
    ),
  };

  console.log('📊 إحصائيات حسب الصعوبة:');
  console.log(`   سهل (Easy): ${byDifficulty.easy.length}`);
  console.log(`   متوسط (Medium): ${byDifficulty.medium.length}`);
  console.log(`   صعب (Hard): ${byDifficulty.hard.length}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ملخص حسب اللغة
  const languages = [...new Set(ALL_CHALLENGES.map((c) => c.language))];
  console.log('📊 إحصائيات حسب لغة البرمجة:');
  languages.forEach((lang) => {
    const count = results.filter(
      (r) =>
        ALL_CHALLENGES.find((c) => c.id === r.challengeId)?.language === lang
    ).length;
    console.log(`   ${lang}: ${count}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return {
    total: results.length,
    valid: validChallenges.length,
    invalid: invalidChallenges.length,
    results,
  };
}

// تشغيل الفحص
if (require.main === module) {
  try {
    const report = runValidation();

    // حفظ التقرير في ملف JSON
    const fs = require('fs');
    fs.writeFileSync(
      'challenge-validation-report.json',
      JSON.stringify(report, null, 2),
      'utf8'
    );
    console.log('💾 تم حفظ التقرير الكامل في challenge-validation-report.json');

    // إنهاء مع exit code مناسب
    process.exit(report.invalid > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ خطأ أثناء تشغيل الفحص:', error);
    process.exit(1);
  }
}

export { validateChallenge, runValidation };

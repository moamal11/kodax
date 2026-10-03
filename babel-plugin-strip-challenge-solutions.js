/**
 * يحذف الحلول النموذجية للتحديات من حزمة التطبيق عند البناء.
 *
 * الحلول تبقى في ملفات المحتوى (src/constants) لأن أدوات التدقيق تشغّلها عبر tsx (بدون Babel)
 * للتحقق أن كل حل نموذجي يجتاز اختبارات التحدي، ولتوليد جدول challenge_solutions على السيرفر.
 * التطبيق يعرض الحل فقط من السيرفر (challenge_reveal_solution) بعد إعلان معتمد أو بعد حل التحدي.
 *
 * ملاحظة صريحة: هذا يمنع وجود الحلول في الحزمة، لكنه لا يمنع مستخدماً من حل التحدي ثم مشاركة حله،
 * ولا يخفي الاختبارات (يحتاجها التطبيق للتشغيل المحلي).
 */
module.exports = function stripChallengeSolutions() {
  return {
    name: 'strip-challenge-solutions',
    visitor: {
      ObjectProperty(path, state) {
        const file = (state.filename || '').replace(/\\/g, '/');
        if (!file.includes('/src/constants/')) return;
        const key = path.node.key;
        const name = key.type === 'Identifier' ? key.name : key.type === 'StringLiteral' ? key.value : null;
        if (name !== 'solution') return;
        const v = path.node.value;
        if (v.type === 'StringLiteral' || v.type === 'TemplateLiteral') path.remove();
      },
    },
  };
};

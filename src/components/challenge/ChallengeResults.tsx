/**
 * عرض نتائج التحقق من حل التحدي.
 * - يميّز بين: خطأ كتابة، خطأ تشغيل، انتهاء الوقت، نتيجة خاطئة، متطلب ناقص، مشكلة اتصال.
 * - الاختبارات الظاهرة: يعرض المدخل والمتوقع ونتيجة المستخدم عند الفشل.
 * - الاختبارات المخفية: يعرض ناجح/فاشل ووصفاً عاماً فقط — لا مدخلات ولا نتائج متوقعة.
 */
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ChallengeCheck, ResultKind, ValidationResult } from '@/services/challengeValidator';

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const KIND_LABEL: Record<ResultKind, string> = {
  pass: 'نجح',
  wrong_output: 'نتيجة غير صحيحة',
  runtime_error: 'خطأ أثناء التشغيل',
  syntax_error: 'خطأ في كتابة الكود',
  timeout: 'انتهى الوقت',
  service_error: 'مشكلة اتصال',
  structure: 'متطلب ناقص',
  no_code: 'لا يوجد حل',
};

export interface ChallengeRunSummary {
  results: ValidationResult[];
  passedTests: number;
  totalTests: number;
  allPassed: boolean;
  serviceError?: boolean;
  mode?: 'execution' | 'structural';
}

export function ChallengeResults({ summary, stale = false }: { summary: ChallengeRunSummary; stale?: boolean }) {
  const { results, passedTests, totalTests, allPassed, serviceError, mode } = summary;
  const headline = serviceError
    ? 'تعذّر التحقق الآن بسبب مشكلة في الاتصال بخادم التشغيل — كودك محفوظ، حاول مرة أخرى.'
    : allPassed
      ? `نجحت جميع ${mode === 'structural' ? 'المتطلبات' : 'الاختبارات'} (${passedTests}/${totalTests})`
      : `${passedTests}/${totalTests} ${mode === 'structural' ? 'متطلبات مكتملة' : 'اختبارات ناجحة'}`;
  const headColor = serviceError ? '#f59e0b' : allPassed ? '#22c55e' : '#f87171';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>نتائج الاختبارات</Text>
      <Text style={[styles.headline, { color: headColor }]}>{headline}</Text>
      {stale && (
        <Text style={styles.stale}>عدّلت الكود بعد هذا التشغيل — النتائج أدناه للنسخة السابقة. شغّل الكود مجدداً.</Text>
      )}

      {results.map((r, i) => {
        const color = r.passed ? '#22c55e' : r.kind === 'service_error' ? '#f59e0b' : '#ef4444';
        const label = r.description && r.description !== r.message ? r.description : null;
        return (
          <View key={i} style={styles.item}>
            <View style={styles.row}>
              <Ionicons
                name={r.passed ? 'checkmark-circle' : r.kind === 'service_error' ? 'cloud-offline' : 'close-circle'}
                size={20}
                color={color}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color }]}>
                  {label ?? r.message}
                  {r.hidden ? '  (اختبار مخفي)' : ''}
                </Text>
                {!r.passed && r.kind && (
                  <Text style={styles.kind}>
                    {/* رسائل المُحقِّق تصف نوع المشكلة بنفسها */}
                    {label ? r.message : KIND_LABEL[r.kind]}
                  </Text>
                )}
              </View>
            </View>

            {/* تفاصيل الاختبار الظاهر فقط عند الفشل */}
            {!r.passed && !r.hidden && (r.input !== undefined || r.expectedOutput !== undefined) && r.kind === 'wrong_output' && (
              <View style={styles.details}>
                {!!r.input && (
                  <>
                    <Text style={styles.detailLabel}>المدخل:</Text>
                    <Text style={styles.code}>{r.input}</Text>
                  </>
                )}
                <Text style={styles.detailLabel}>المتوقع:</Text>
                <Text style={styles.code}>{r.expectedOutput || '(نص فارغ)'}</Text>
                <Text style={styles.detailLabel}>نتيجتك:</Text>
                <Text style={[styles.code, { color: '#fca5a5' }]}>{r.actualOutput || '(لا يوجد مخرجات)'}</Text>
              </View>
            )}
            {!r.passed && !r.hidden && !!r.error && (r.kind === 'runtime_error' || r.kind === 'syntax_error') && (
              <View style={styles.details}>
                <Text style={styles.detailLabel}>رسالة الخطأ:</Text>
                <Text style={[styles.code, { color: '#fca5a5' }]} numberOfLines={8}>
                  {r.error}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

/** قائمة المتطلبات للتحديات التي تُفحص بنيوياً (لا يمكن تشغيلها داخل التطبيق) */
export function ChallengeRequirements({ checks }: { checks: ChallengeCheck[] }) {
  if (!checks.length) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>المتطلبات التي سيتم فحصها</Text>
      {checks.map((c, i) => (
        <View key={i} style={[styles.row, { marginTop: 8 }]}>
          <Ionicons name={c.forbid ? 'remove-circle-outline' : 'ellipse-outline'} size={16} color="#9ca3af" />
          <Text style={styles.requirement}>{c.message}</Text>
        </View>
      ))}
      <Text style={styles.note}>هذا التحدي يُفحص بقراءة الكود (لا يمكن تشغيله داخل التطبيق)، والتعليقات لا تُحسب.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.4)',
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'right', marginBottom: 6 },
  headline: { fontSize: 14, fontWeight: '600', textAlign: 'right', marginBottom: 8 },
  stale: { color: '#fbbf24', fontSize: 13, textAlign: 'right', marginBottom: 8 },
  item: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(75, 85, 99, 0.3)' },
  row: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 8 },
  itemTitle: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  kind: { color: '#9ca3af', fontSize: 13, textAlign: 'right', marginTop: 2 },
  details: { marginTop: 8, backgroundColor: '#0b1020', borderRadius: 10, padding: 10 },
  detailLabel: { color: '#9ca3af', fontSize: 12, textAlign: 'right', marginTop: 4 },
  code: { color: '#e5e7eb', fontFamily: MONO, fontSize: 13, textAlign: 'left', marginTop: 2 },
  requirement: { color: '#d1d5db', fontSize: 14, textAlign: 'right', flex: 1 },
  note: { color: '#6b7280', fontSize: 12, textAlign: 'right', marginTop: 10 },
});

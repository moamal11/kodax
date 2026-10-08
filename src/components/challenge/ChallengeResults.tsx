/**
 * عرض نتائج التحقق من حل التحدي.
 * - يميّز بين: خطأ كتابة، خطأ تشغيل، انتهاء الوقت، نتيجة خاطئة، متطلب ناقص، مشكلة اتصال.
 * - الاختبارات الظاهرة: يعرض المدخل والمتوقع ونتيجة المستخدم عند الفشل.
 * - الاختبارات المخفية: يعرض ناجح/فاشل ووصفاً عاماً فقط — لا مدخلات ولا نتائج متوقعة.
 */
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ChallengeCheck, ResultKind, ValidationResult } from '@/services/challengeValidator';
import { Surface, Text, Row, useTheme } from '@/design';

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
  const t = useTheme();
  const { results, passedTests, totalTests, allPassed, serviceError, mode } = summary;
  const unit = mode === 'structural' ? 'المتطلبات' : 'الاختبارات';
  const headline = serviceError
    ? 'تعذّر التحقق الآن بسبب مشكلة اتصال بخادم التشغيل — كودك محفوظ، حاول مرة أخرى.'
    : allPassed
      ? `نجحت كل ${unit} (${passedTests} من ${totalTests})`
      : `نجح ${passedTests} من ${totalTests} ${mode === 'structural' ? 'متطلبات' : 'اختبارات'}`;
  const tone = serviceError ? 'warning' : allPassed ? 'success' : 'danger';
  const toneBg = tone === 'success' ? t.colors.successSoft : tone === 'warning' ? t.colors.warningSoft : t.colors.dangerSoft;
  const toneFg = tone === 'success' ? t.colors.successText : tone === 'warning' ? t.colors.warningText : t.colors.dangerText;
  return (
    <Surface padding={0} style={{ overflow: 'hidden' }} accessibilityLiveRegion="polite">
      <Row gap={10} style={{ padding: 14, backgroundColor: toneBg }}>
        <Ionicons name={serviceError ? 'cloud-offline-outline' : allPassed ? 'checkmark-circle' : 'close-circle'} size={22} color={toneFg} />
        <View style={{ flex: 1 }}>
          <Text variant="label" weight="semibold" tone={tone}>
            نتائج {unit}
          </Text>
          <Text variant="bodySm" tone="secondary">
            {headline}
          </Text>
        </View>
      </Row>
      {stale && (
        <Text variant="caption" tone="warning" style={{ paddingHorizontal: 14, paddingTop: 10 }}>
          عدّلت الكود بعد هذا التشغيل — النتائج للنسخة السابقة. شغّل الكود مجدداً.
        </Text>
      )}
      {results.map((r, i) => {
        const label = r.description && r.description !== r.message ? r.description : null;
        const bad = !r.passed;
        const ic = r.passed ? t.colors.successText : r.kind === 'service_error' ? t.colors.warningText : t.colors.dangerText;
        return (
          <View key={i} style={{ paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.colors.border, gap: 6 }}>
            <Row gap={8} align="flex-start">
              <Ionicons name={r.passed ? 'checkmark' : r.kind === 'service_error' ? 'cloud-offline-outline' : 'close'} size={18} color={ic} style={{ marginTop: 3 }} />
              <View style={{ flex: 1 }}>
                <Text variant="bodySm" weight="medium">
                  {label ?? r.message}
                  {r.hidden ? ' · اختبار مخفي' : ''}
                </Text>
                {bad && r.kind && (
                  <Text variant="caption" tone="muted">
                    {label ? r.message : KIND_LABEL[r.kind]}
                  </Text>
                )}
              </View>
            </Row>
            {bad && !r.hidden && (r.input !== undefined || r.expectedOutput !== undefined) && r.kind === 'wrong_output' && (
              <View style={{ backgroundColor: t.colors.codeBg, borderRadius: t.radius.sm, padding: 10, gap: 4, borderWidth: 1, borderColor: t.colors.codeBorder }}>
                {!!r.input && <IO label="المدخل" value={r.input} />}
                <IO label="المتوقع" value={r.expectedOutput || '(نص فارغ)'} />
                <IO label="نتيجتك" value={r.actualOutput || '(لا يوجد مخرجات)'} bad />
              </View>
            )}
            {bad && !r.hidden && !!r.error && (r.kind === 'runtime_error' || r.kind === 'syntax_error') && (
              <View style={{ backgroundColor: t.colors.codeBg, borderRadius: t.radius.sm, padding: 10, borderWidth: 1, borderColor: t.colors.codeBorder }}>
                <IO label="رسالة الخطأ" value={r.error} bad lines={8} />
              </View>
            )}
          </View>
        );
      })}
    </Surface>
  );
}

function IO({ label, value, bad, lines }: { label: string; value: string; bad?: boolean; lines?: number }) {
  const t = useTheme();
  return (
    <View>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text mono ltr variant="bodySm" numberOfLines={lines} style={{ color: bad ? t.colors.dangerText : t.colors.codeText }}>
        {value}
      </Text>
    </View>
  );
}

/** قائمة المتطلبات للتحديات التي تُفحص بنيوياً (لا يمكن تشغيلها داخل التطبيق) */
export function ChallengeRequirements({ checks }: { checks: ChallengeCheck[] }) {
  const t = useTheme();
  if (!checks.length) return null;
  return (
    <Surface padding={14}>
      <Text variant="label" weight="semibold">
        المتطلبات التي سيتم فحصها
      </Text>
      {checks.map((c, i) => (
        <Row key={i} gap={8} align="flex-start" style={{ marginTop: 8 }}>
          <Ionicons name={c.forbid ? 'remove-circle-outline' : 'ellipse-outline'} size={16} color={t.colors.textMuted} style={{ marginTop: 3 }} />
          <Text variant="bodySm" tone="secondary" style={{ flex: 1 }}>
            {c.message}
          </Text>
        </Row>
      ))}
      <Text variant="caption" tone="muted" style={{ marginTop: 10 }}>
        يُفحص هذا التحدي بقراءة الكود (لا يُشغَّل داخل التطبيق)، والتعليقات لا تُحسب.
      </Text>
    </Surface>
  );
}

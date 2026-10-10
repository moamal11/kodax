import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
/**
 * التحقق من شهادة إتمام برقمها: صالحة / ملغاة / غير موجودة، مع بيانات الشهادة.
 */
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { certificateService } from '@/services/certificateService';
import { CERTIFICATE_LEVEL_CONFIG, type VerificationResult } from '@/types/certificate';
import { Screen, AppBar, Text, Row, Col, Field, Button, Surface, Tag, useTheme } from '@/design';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString('ar-IQ-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Baghdad' }) : '';

export default function CertificateVerifyScreen() {
  const t = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { id: paramId } = useLocalSearchParams<{ id?: string }>();
  const request = useRef(0);
  const [value, setValue] = useState(paramId || '');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async (raw: string) => {
    const version = ++request.current;
    setResult(null);
    setLoading(false);
    const id = raw.trim();
    if (!id) return setError('اكتب رقم الشهادة');
    if (!UUID.test(id)) return setError('رقم الشهادة غير صالح. مثال: 3f2a…-…');
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const result = await certificateService.verifyCertificate(id);
      if (version === request.current) setResult(result);
    } catch (e: any) {
      if (version === request.current) setError(e?.message || 'تعذّر التحقق الآن. حاول مرة أخرى.');
    } finally {
      if (version === request.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (paramId && user) {
      setValue(paramId);
      verify(paramId);
    }
  }, [paramId, verify, user?.id]);

  useEffect(
    () => () => {
      request.current++;
    },
    []
  );

  const cfg = result?.level ? CERTIFICATE_LEVEL_CONFIG[result.level] : null;
  const valid = result?.found && result.status === 'valid';
  const snap: any = result?.achievement_snapshot;

  if (!user)
    return (
      <Screen width="reading" header={<AppBar title="التحقق من شهادة" fallback="/download" />}>
        <Col gap={18}>
          <Text variant="title">سجّل الدخول للتحقق من الشهادة</Text>
          <Text tone="secondary">التحقق يعرض اسم صاحب الشهادة والمسار وحالتها. هذه المعلومات متاحة حاليًا للمستخدمين المسجلين.</Text>
          <Button label="تسجيل الدخول" onPress={() => router.push('/(auth)/login')} />
        </Col>
      </Screen>
    );
  return (
    <Screen width="reading" header={<AppBar title="التحقق من شهادة" fallback="/certificate" />}>
      <Col gap={16}>
        <Text variant="body" tone="secondary">
          كل شهادة إتمام من Kodax لها رقم فريد. اكتبه هنا للتأكد أنها صادرة منا وما زالت صالحة.
        </Text>
        <Field
          label="رقم الشهادة"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={value}
          onChangeText={(v) => setValue(v)}
          ltr
          autoCapitalize="none"
          autoCorrect={false}
          error={error}
          onSubmitEditing={() => verify(value)}
          returnKeyType="search"
        />
        <Button label="تحقق" icon="shield-checkmark-outline" onPress={() => verify(value)} loading={loading} size="lg" />

        {result && !result.found && (
          <Surface variant="danger" padding={16} accessibilityLiveRegion="polite">
            <Row gap={10}>
              <Ionicons name="close-circle" size={22} color={t.colors.dangerText} />
              <View style={{ flex: 1 }}>
                <Text variant="heading" tone="danger">
                  لا توجد شهادة بهذا الرقم
                </Text>
                <Text variant="bodySm" tone="secondary">
                  {result.message || 'تأكد من الرقم وحاول مرة أخرى.'}
                </Text>
              </View>
            </Row>
          </Surface>
        )}

        {result?.found && (
          <Surface padding={0} style={{ overflow: 'hidden' }} accessibilityLiveRegion="polite">
            <Row gap={10} style={{ padding: 16, backgroundColor: valid ? t.colors.successSoft : t.colors.dangerSoft }}>
              <Ionicons name={valid ? 'shield-checkmark' : 'alert-circle'} size={24} color={valid ? t.colors.successText : t.colors.dangerText} />
              <View style={{ flex: 1 }}>
                <Text variant="heading" tone={valid ? 'success' : 'danger'}>
                  {valid ? 'شهادة صالحة صادرة من Kodax' : result.status === 'revoked' ? 'هذه الشهادة ملغاة' : 'شهادة مؤرشفة (رُقّيت لمستوى أعلى)'}
                </Text>
                {result.status === 'revoked' && (
                  <Text variant="bodySm" tone="secondary">
                    أُلغيت في {fmt(result.revoked_at)}
                    {result.revocation_reason ? ` · السبب: ${result.revocation_reason}` : ''}
                  </Text>
                )}
              </View>
            </Row>
            <Col gap={10} style={{ padding: 16 }}>
              {[
                ['صاحب الشهادة', result.holder_name],
                ['المسار', result.field_name_ar || result.course_title_ar || result.field_name || result.course_title],
                ['تاريخ الإصدار', fmt(result.issued_at)],
                ...(snap
                  ? [
                      ['الدروس المكتملة', `${snap.lessons_percent ?? 0}%`],
                      ['التحديات المحلولة', `${snap.challenges_percent ?? 0}%`],
                    ]
                  : []),
              ].map(([k, v]) => (
                <Row key={k as string} justify="space-between" gap={12}>
                  <Text variant="bodySm" tone="muted">
                    {k}
                  </Text>
                  <Text variant="body" weight="medium" style={{ flexShrink: 1 }} align="left">
                    {v || '—'}
                  </Text>
                </Row>
              ))}
              {cfg && (
                <Row justify="space-between">
                  <Text variant="bodySm" tone="muted">
                    المستوى
                  </Text>
                  <Tag label={cfg.labelAr} tone="xp" />
                </Row>
              )}
              <Text mono ltr variant="caption" tone="muted" selectable>
                {result.certificate_id}
              </Text>
            </Col>
          </Surface>
        )}
        <Text variant="caption" tone="muted">
          شهادات Kodax شهادات إتمام للمسارات داخل التطبيق، وليست شهادات أكاديمية معتمدة.
        </Text>
      </Col>
    </Screen>
  );
}

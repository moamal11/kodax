/**
 * قائمة إجراءات الكود/المشروع المنشور (محتوى من المستخدمين)
 * - للمالك: نشر / إلغاء النشر، حذف (مع تأكيد)
 * - لغير المالك: إبلاغ، حظر الناشر
 */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { blockUser, deleteSnippet, reportSnippet, setSnippetPublic, REPORT_REASONS, ReportReason } from '@/services/codeFeedService';
import { showToast } from '@/components/ui/Toast';
import { Sheet, ListGroup, ListRow, Button, Field, Text, Col, Row, useTheme } from '@/design';

interface Props {
  visible: boolean;
  onClose: () => void;
  snippetId: string;
  authorId: string;
  authorName: string;
  isOwner: boolean;
  isPublic: boolean;
  onDeleted: () => void;
  onVisibilityChanged: (isPublic: boolean) => void;
  onBlocked: () => void;
}

type Step = 'menu' | 'report' | 'confirmDelete' | 'confirmBlock';

/** قائمة أسباب كأزرار راديو */
export function ReasonList<T extends string>({ reasons, value, onChange }: { reasons: { id: T; label: string }[]; value: T | null; onChange: (v: T) => void }) {
  const t = useTheme();
  return (
    <Col gap={6} accessibilityRole="radiogroup">
      {reasons.map((r) => {
        const on = value === r.id;
        return (
          <Pressable
            key={r.id}
            onPress={() => onChange(r.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={r.label}
            style={(s: any) => ({
              flexDirection: 'row-reverse',
              alignItems: 'center',
              gap: 10,
              minHeight: 46,
              paddingHorizontal: 12,
              borderRadius: t.radius.md,
              borderWidth: 1,
              borderColor: on ? t.colors.brand : t.colors.border,
              backgroundColor: on ? t.colors.brandSoft : s.hovered ? t.colors.surfacePressed : t.colors.surface,
            })}
          >
            <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={18} color={on ? t.colors.brandText : t.colors.textMuted} />
            <Text variant="body" style={{ flex: 1 }}>
              {r.label}
            </Text>
          </Pressable>
        );
      })}
    </Col>
  );
}

export default function SnippetModerationSheet({ visible, onClose, snippetId, authorId, authorName, isOwner, isPublic, onDeleted, onVisibilityChanged, onBlocked }: Props) {
  const [step, setStep] = useState<Step>('menu');
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => {
    setStep('menu');
    setReason(null);
    setDetails('');
    onClose();
  };
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = () =>
    run(async () => {
      const res = await setSnippetPublic(snippetId, !isPublic);
      if (res.success) {
        onVisibilityChanged(!isPublic);
        showToast.success(isPublic ? 'تم إلغاء النشر — أصبح خاصاً بك' : 'تم النشر للعامة');
        close();
      } else showToast.error('تعذّر تحديث حالة النشر. حاول مرة أخرى.');
    });
  const doDelete = () =>
    run(async () => {
      const res = await deleteSnippet(snippetId);
      if (res.success) {
        showToast.success('تم الحذف');
        close();
        onDeleted();
      } else showToast.error('تعذّر الحذف. حاول مرة أخرى.');
    });
  const doReport = () =>
    run(async () => {
      if (!reason) return;
      const res = await reportSnippet(snippetId, reason, details.trim() || undefined);
      if (res.success) showToast.success(res.message);
      else showToast.error(res.message);
      close();
    });
  const doBlock = () =>
    run(async () => {
      const res = await blockUser(authorId);
      if (res.success) {
        showToast.success(`تم حظر ${authorName}. لن ترى محتواه بعد الآن.`);
        close();
        onBlocked();
      } else showToast.error('تعذّر الحظر. حاول مرة أخرى.');
    });

  const title = step === 'report' ? 'الإبلاغ عن المحتوى' : step === 'confirmDelete' ? 'حذف هذا الكود نهائياً؟' : step === 'confirmBlock' ? `حظر ${authorName}؟` : isOwner ? 'خيارات الكود' : 'خيارات';

  return (
    <Sheet visible={visible} onClose={close} title={title} maxWidth={440}>
      {step === 'menu' && (
        <ListGroup>
          {isOwner ? (
            <>
              <ListRow icon={isPublic ? 'eye-off-outline' : 'globe-outline'} title={isPublic ? 'إلغاء النشر' : 'نشر للعامة'} subtitle={isPublic ? 'يصبح الكود خاصاً بك' : 'يظهر في المجتمع'} onPress={togglePublish} chevron={false} />
              <ListRow icon="trash-outline" title="حذف نهائياً" danger onPress={() => setStep('confirmDelete')} chevron={false} last />
            </>
          ) : (
            <>
              <ListRow icon="flag-outline" title="الإبلاغ عن المحتوى" subtitle="يراجعه فريق الإشراف" onPress={() => setStep('report')} />
              <ListRow icon="ban-outline" title={`حظر ${authorName}`} subtitle="لن ترى أكواده ولن يراسلك" danger onPress={() => setStep('confirmBlock')} chevron={false} last />
            </>
          )}
        </ListGroup>
      )}

      {step === 'report' && (
        <Col gap={12}>
          <ReasonList reasons={REPORT_REASONS} value={reason} onChange={setReason} />
          <Field label="تفاصيل إضافية (اختياري)" value={details} onChangeText={setDetails} maxLength={500} multiline />
          <Row gap={8}>
            <Button label="أرسل البلاغ" onPress={doReport} disabled={!reason} loading={busy} style={{ flex: 1 }} />
            <Button label="رجوع" variant="ghost" onPress={() => setStep('menu')} />
          </Row>
        </Col>
      )}

      {(step === 'confirmDelete' || step === 'confirmBlock') && (
        <Col gap={14}>
          <Text variant="body" tone="secondary">
            {step === 'confirmDelete' ? 'سيُحذف الكود والتعليقات والإعجابات، ولا يمكن التراجع.' : 'لن تظهر لك أكواده ومشاريعه، ولن يستطيع مراسلتك. يمكنك إلغاء الحظر لاحقاً من الإعدادات.'}
          </Text>
          <Row gap={8}>
            <Button label={step === 'confirmDelete' ? 'حذف' : 'حظر'} variant="danger" onPress={step === 'confirmDelete' ? doDelete : doBlock} loading={busy} style={{ flex: 1 }} />
            <Button label="إلغاء" variant="secondary" onPress={() => setStep('menu')} style={{ flex: 1 }} />
          </Row>
        </Col>
      )}
      <View style={{ height: 4 }} />
    </Sheet>
  );
}

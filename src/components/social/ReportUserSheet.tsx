/**
 * الإبلاغ عن مستخدم أو رسالة خاصة منه، مع خيار الحظر بعد الإبلاغ.
 * البلاغ يذهب لقائمة مراجعة المشرف (لا إجراء تلقائي على الحساب).
 */
import React, { useState } from 'react';
import { Sheet, Surface, Button, Field, Text, Col, Row } from '@/design';
import { ReasonList } from '@/components/editor/SnippetModerationSheet';
import {
  blockUser,
  reportUser,
  USER_REPORT_REASONS,
  UserReportReason,
} from '@/services/codeFeedService';
import { showToast } from '@/components/ui/Toast';

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  /** عند الإبلاغ عن رسالة محددة */
  messageId?: string | null;
  messagePreview?: string | null;
  /** يُستدعى بعد الحظر من داخل النافذة */
  onBlocked?: () => void;
  /** إخفاء خيار الحظر (مثلاً إذا كان محظوراً بالفعل) */
  hideBlock?: boolean;
}

export default function ReportUserSheet({
  visible,
  onClose,
  userId,
  userName,
  messageId,
  messagePreview,
  onBlocked,
  hideBlock,
}: Props) {
  const [reason, setReason] = useState<UserReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const close = () => {
    setReason(null);
    setDetails('');
    setDone(false);
    onClose();
  };

  const submit = async () => {
    if (!reason || busy) return;
    setBusy(true);
    const res = await reportUser(userId, reason, details.trim() || undefined, messageId ?? undefined);
    setBusy(false);
    if (res.success) {
      showToast.success(res.message);
      if (hideBlock) close();
      else setDone(true);
    } else {
      showToast.error(res.message);
    }
  };

  const block = async () => {
    setBusy(true);
    const res = await blockUser(userId);
    setBusy(false);
    if (res.success) {
      showToast.success(`تم حظر ${userName}`);
      onBlocked?.();
      close();
    } else {
      showToast.error('تعذّر الحظر. حاول مرة أخرى.');
    }
  };

  return (
    <Sheet visible={visible} onClose={close} title={done ? 'شكراً، وصل البلاغ' : messageId ? 'الإبلاغ عن رسالة' : `الإبلاغ عن ${userName}`} maxWidth={440}>
      {done ? (
        <Col gap={14}>
          <Text variant="body" tone="secondary">
            سيراجعه فريق الإشراف. هل تريد أيضاً حظر {userName} حتى لا يتمكن من مراسلتك؟
          </Text>
          <Row gap={8}>
            <Button label={`حظر ${userName}`} variant="danger" onPress={block} loading={busy} style={{ flex: 1 }} />
            <Button label="لا، شكراً" variant="secondary" onPress={close} style={{ flex: 1 }} />
          </Row>
        </Col>
      ) : (
        <Col gap={12}>
          {!!messagePreview && (
            <Surface variant="sunken" padding={12}>
              <Text variant="bodySm" tone="secondary" numberOfLines={3}>
                {messagePreview}
              </Text>
            </Surface>
          )}
          <ReasonList reasons={USER_REPORT_REASONS} value={reason} onChange={setReason} />
          <Field label="تفاصيل إضافية (اختياري)" value={details} onChangeText={setDetails} maxLength={500} multiline />
          <Button label="أرسل البلاغ" onPress={submit} disabled={!reason} loading={busy} />
          <Text variant="caption" tone="muted">
            البلاغ يذهب لفريق الإشراف للمراجعة، ولا يُتخذ إجراء تلقائي على الحساب.
          </Text>
        </Col>
      )}
    </Sheet>
  );
}

/**
 * الإبلاغ عن مستخدم أو رسالة خاصة منه، مع خيار الحظر بعد الإبلاغ.
 * البلاغ يذهب لقائمة مراجعة المشرف (لا إجراء تلقائي على الحساب).
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close}>
        <Animated.View entering={FadeInUp.duration(200)} style={styles.sheet}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.handle} />
            {done ? (
              <>
                <Text style={styles.title}>شكراً، وصل البلاغ</Text>
                <Text style={styles.body}>
                  سيراجعه فريق الإشراف. هل تريد أيضاً حظر {userName} حتى لا يتمكن من مراسلتك؟
                </Text>
                <TouchableOpacity style={styles.danger} onPress={block} disabled={busy}>
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.dangerText}>حظر {userName}</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondary} onPress={close}>
                  <Text style={styles.secondaryText}>لا، شكراً</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>
                  {messageId ? 'الإبلاغ عن رسالة' : `الإبلاغ عن ${userName}`}
                </Text>
                {messagePreview ? (
                  <View style={styles.preview}>
                    <Text style={styles.previewText} numberOfLines={3}>
                      {messagePreview}
                    </Text>
                  </View>
                ) : null}
                {USER_REPORT_REASONS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.reason, reason === r.id && styles.reasonActive]}
                    onPress={() => setReason(r.id)}
                  >
                    <Ionicons
                      name={reason === r.id ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={reason === r.id ? '#fbbf24' : '#6b7280'}
                    />
                    <Text style={styles.reasonText}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
                <TextInput
                  style={styles.input}
                  placeholder="تفاصيل إضافية (اختياري)"
                  placeholderTextColor="#6b7280"
                  value={details}
                  onChangeText={setDetails}
                  maxLength={500}
                  multiline
                  textAlign="right"
                />
                <TouchableOpacity
                  style={[styles.primary, !reason && { opacity: 0.5 }]}
                  onPress={submit}
                  disabled={!reason || busy}
                >
                  {busy ? <ActivityIndicator color="#1f2937" /> : <Text style={styles.primaryText}>إرسال البلاغ</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondary} onPress={close}>
                  <Text style={styles.secondaryText}>إلغاء</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    paddingBottom: 28,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 10,
  },
  title: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'right', marginBottom: 10 },
  body: { color: '#9ca3af', fontSize: 14, textAlign: 'right', lineHeight: 21, marginBottom: 14 },
  preview: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRightWidth: 3,
    borderRightColor: '#fbbf24',
  },
  previewText: { color: '#d1d5db', fontSize: 13, textAlign: 'right', lineHeight: 20 },
  reason: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  reasonActive: { backgroundColor: 'rgba(251,191,36,0.08)' },
  reasonText: { color: '#e5e7eb', fontSize: 14, flex: 1, textAlign: 'right' },
  input: {
    marginTop: 10,
    minHeight: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    padding: 10,
    textAlignVertical: 'top',
  },
  primary: { marginTop: 14, backgroundColor: '#fbbf24', borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  primaryText: { color: '#1f2937', fontWeight: '800', fontSize: 15 },
  danger: { marginTop: 4, backgroundColor: '#dc2626', borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  dangerText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondary: { paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: '#9ca3af', fontWeight: '600' },
});

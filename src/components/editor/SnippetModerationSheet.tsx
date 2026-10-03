/**
 * قائمة إجراءات الكود/المشروع المنشور (محتوى من المستخدمين)
 * - للمالك: نشر / إلغاء النشر، حذف (مع تأكيد)
 * - لغير المالك: إبلاغ، حظر الناشر
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
  deleteSnippet,
  reportSnippet,
  setSnippetPublic,
  REPORT_REASONS,
  ReportReason,
} from '@/services/codeFeedService';
import { showToast } from '@/components/ui/Toast';

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

type View_ = 'menu' | 'report' | 'confirmDelete' | 'confirmBlock';

export default function SnippetModerationSheet({
  visible,
  onClose,
  snippetId,
  authorId,
  authorName,
  isOwner,
  isPublic,
  onDeleted,
  onVisibilityChanged,
  onBlocked,
}: Props) {
  const [view, setView] = useState<View_>('menu');
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => {
    setView('menu');
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
        showToast.success(
          isPublic ? 'تم إلغاء النشر — أصبح خاصاً بك' : 'تم النشر للعامة'
        );
        close();
      } else {
        showToast.error('تعذّر تحديث حالة النشر. حاول مرة أخرى.');
      }
    });

  const doDelete = () =>
    run(async () => {
      const res = await deleteSnippet(snippetId);
      if (res.success) {
        showToast.success('تم الحذف');
        close();
        onDeleted();
      } else {
        showToast.error('تعذّر الحذف. حاول مرة أخرى.');
      }
    });

  const doReport = () =>
    run(async () => {
      if (!reason) return;
      const res = await reportSnippet(
        snippetId,
        reason,
        details.trim() || undefined
      );
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
      } else {
        showToast.error('تعذّر الحظر. حاول مرة أخرى.');
      }
    });

  const Item = ({
    icon,
    label,
    color = '#e5e7eb',
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color?: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.item} onPress={onPress} disabled={busy}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.itemText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={close}
      >
        <Animated.View entering={FadeInUp.duration(200)} style={styles.sheet}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.handle} />

            {view === 'menu' && (
              <>
                {isOwner ? (
                  <>
                    <Item
                      icon={isPublic ? 'eye-off-outline' : 'globe-outline'}
                      label={
                        isPublic ? 'إلغاء النشر (جعله خاصاً)' : 'نشر للعامة'
                      }
                      onPress={togglePublish}
                    />
                    <Item
                      icon="trash-outline"
                      label="حذف نهائياً"
                      color="#f87171"
                      onPress={() => setView('confirmDelete')}
                    />
                  </>
                ) : (
                  <>
                    <Item
                      icon="flag-outline"
                      label="الإبلاغ عن المحتوى"
                      color="#fbbf24"
                      onPress={() => setView('report')}
                    />
                    <Item
                      icon="ban-outline"
                      label={`حظر ${authorName}`}
                      color="#f87171"
                      onPress={() => setView('confirmBlock')}
                    />
                  </>
                )}
                <Item
                  icon="close"
                  label="إلغاء"
                  color="#9ca3af"
                  onPress={close}
                />
              </>
            )}

            {view === 'report' && (
              <>
                <Text style={styles.title}>سبب البلاغ</Text>
                {REPORT_REASONS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.reason,
                      reason === r.id && styles.reasonActive,
                    ]}
                    onPress={() => setReason(r.id)}
                  >
                    <Ionicons
                      name={
                        reason === r.id ? 'radio-button-on' : 'radio-button-off'
                      }
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
                  onPress={doReport}
                  disabled={!reason || busy}
                >
                  {busy ? (
                    <ActivityIndicator color="#1f2937" />
                  ) : (
                    <Text style={styles.primaryText}>إرسال البلاغ</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {(view === 'confirmDelete' || view === 'confirmBlock') && (
              <>
                <Text style={styles.title}>
                  {view === 'confirmDelete'
                    ? 'حذف هذا الكود نهائياً؟'
                    : `حظر ${authorName}؟`}
                </Text>
                <Text style={styles.body}>
                  {view === 'confirmDelete'
                    ? 'سيُحذف الكود والتعليقات والإعجابات، ولا يمكن التراجع.'
                    : 'لن تظهر لك أكواده ومشاريعه في الفيد. يمكنك إلغاء الحظر لاحقاً.'}
                </Text>
                <TouchableOpacity
                  style={[styles.primary, { backgroundColor: '#ef4444' }]}
                  onPress={view === 'confirmDelete' ? doDelete : doBlock}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={[styles.primaryText, { color: '#fff' }]}>
                      {view === 'confirmDelete' ? 'حذف' : 'حظر'}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondary}
                  onPress={() => setView('menu')}
                >
                  <Text style={styles.secondaryText}>رجوع</Text>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
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
  item: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  itemText: { fontSize: 15, fontWeight: '600', textAlign: 'right', flex: 1 },
  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 10,
  },
  body: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'right',
    lineHeight: 21,
    marginBottom: 14,
  },
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
  primary: {
    marginTop: 14,
    backgroundColor: '#fbbf24',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryText: { color: '#1f2937', fontWeight: '800', fontSize: 15 },
  secondary: { paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: '#9ca3af', fontWeight: '600' },
});

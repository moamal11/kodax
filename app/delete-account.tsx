/**
 * صفحة حذف الحساب - Delete Account
 * حذف نهائي عبر السيرفر (delete-account) بعد شرح واضح + كتابة كلمة التأكيد + تأكيد أخير
 */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { deleteMyAccount } from '@/services/accountService';
import { showToast } from '@/components/ui/Toast';
import { Screen, AppBar, Text, Row, Col, Surface, Field, Button, Sheet, SectionHeader, useTheme } from '@/design';

const CONFIRM_WORD = 'حذف';
const DELETED_ITEMS = [
  'ملفك الشخصي وصورتك',
  'تقدمك في الدروس والتحديات، والـ XP والمستوى والسلسلة',
  'رصيد الكوينات والمكافآت والإنجازات والشهادات',
  'أكوادك المنشورة وتعليقاتك وإعجاباتك ومتابعاتك',
  'رسائلك الخاصة التي أرسلتها',
  'محادثاتك مع المساعد الذكي',
  'تذاكر الدعم والإشعارات وقائمة المحظورين',
];

export default function DeleteAccountScreen() {
  const t = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalStep, setFinalStep] = useState(false);
  const canDelete = confirmText.trim() === CONFIRM_WORD && !deleting && !!user?.id;

  const doDelete = async () => {
    setFinalStep(false);
    setDeleting(true);
    setError(null);
    const res = await deleteMyAccount();
    if (res.success) {
      showToast.success('تم حذف حسابك نهائياً');
      await signOut();
      router.replace('/(auth)/login' as any);
      return;
    }
    setDeleting(false);
    setError(
      res.error === 'admin_account'
        ? 'لا يمكن حذف حساب مشرف من التطبيق. أزل صلاحية المشرف أولاً.'
        : res.error === 'network'
          ? 'تعذّر الاتصال. تحقق من الإنترنت ثم حاول مرة أخرى.'
          : res.error === 'not_authenticated'
            ? 'انتهت الجلسة. سجّل الدخول مرة أخرى ثم أعد المحاولة.'
            : 'تعذّر حذف الحساب. لم يُحذف أي شيء، حاول مرة أخرى.'
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen width="reading" header={<AppBar title="حذف الحساب" fallback="/profile" />}>
        <Col gap={18}>
          <Surface variant="danger" padding={16}>
            <Row gap={10} align="flex-start">
              <Ionicons name="warning-outline" size={22} color={t.colors.dangerText} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="heading" tone="danger">
                  الحذف نهائي ولا يمكن التراجع عنه
                </Text>
                <Text variant="bodySm" tone="secondary">
                  بعد الحذف لن تتمكن من استعادة حسابك أو أي من بياناته، حتى لو سجّلت بنفس البريد لاحقاً.
                </Text>
              </View>
            </Row>
          </Surface>

          <View>
            <SectionHeader title="ما الذي سيُحذف؟" />
            <Surface padding={14}>
              <Col gap={10}>
                {DELETED_ITEMS.map((item) => (
                  <Row key={item} gap={10} align="flex-start">
                    <Ionicons name="close" size={16} color={t.colors.dangerText} style={{ marginTop: 4 }} />
                    <Text variant="body" style={{ flex: 1 }}>
                      {item}
                    </Text>
                  </Row>
                ))}
              </Col>
            </Surface>
            <Text variant="caption" tone="muted" style={{ marginTop: 8 }}>
              رسائل الطرف الآخر في محادثاتك تبقى عنده. قد نحتفظ بسجلات إشراف وإحصاءات مجهولة لا تُربط بك.
            </Text>
            <Button label="تفاصيل أكثر في سياسة الخصوصية" variant="ghost" size="sm" onPress={() => router.push('/privacy' as any)} style={{ alignSelf: 'flex-start' }} />
          </View>

          <Field label={`للتأكيد اكتب كلمة «${CONFIRM_WORD}»`} value={confirmText} onChangeText={setConfirmText} editable={!deleting} autoCorrect={false} autoCapitalize="none" error={error} />
          <Button label="حذف حسابي نهائياً" icon="trash-outline" variant="danger" size="lg" onPress={() => canDelete && setFinalStep(true)} disabled={!canDelete} loading={deleting} />
          <Button label="إلغاء والعودة" variant="secondary" onPress={() => router.back()} disabled={deleting} />
        </Col>
      </Screen>
      <Sheet visible={finalStep} onClose={() => setFinalStep(false)} title="تأكيد أخير" maxWidth={420}>
        <Col gap={14}>
          <Text variant="body" tone="secondary">
            سيُحذف حسابك وكل بياناته نهائياً ولا يمكن التراجع. هل تريد المتابعة؟
          </Text>
          <Row gap={8}>
            <Button label="حذف نهائي" variant="danger" onPress={doDelete} style={{ flex: 1 }} />
            <Button label="إلغاء" variant="secondary" onPress={() => setFinalStep(false)} style={{ flex: 1 }} />
          </Row>
        </Col>
      </Sheet>
    </KeyboardAvoidingView>
  );
}

/**
 * صفحة حذف الحساب - Delete Account
 * حذف نهائي عبر السيرفر (delete-account) بعد شرح واضح + كتابة كلمة التأكيد + تأكيد أخير
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { useAuth } from './_layout';
import { useResponsiveLayout } from '@/hooks';
import { deleteMyAccount } from '@/services/accountService';
import { showAlert } from '@/utils/crossPlatformAlert';
import { showToast } from '@/components/ui/Toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isLargeScreen } = useResponsiveLayout();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim() === CONFIRM_WORD && !deleting && !!user?.id;

  const doDelete = async () => {
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

  const handleDelete = () => {
    if (!canDelete) return;
    showAlert(
      'تأكيد أخير',
      'سيُحذف حسابك وكل بياناته نهائياً ولا يمكن التراجع. هل تريد المتابعة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف نهائي', style: 'destructive', onPress: doDelete },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, isLargeScreen && styles.containerWeb]}>
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              disabled={deleting}
            >
              <Ionicons name="arrow-back" size={24} color="#d1d5db" />
            </TouchableOpacity>
            <View style={styles.headerLeft}>
              <Ionicons name="trash" size={24} color="#ef4444" />
              <Text style={styles.headerTitle}>حذف الحساب</Text>
            </View>
          </Animated.View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={28} color="#f87171" />
              <Text style={styles.warningTitle}>الحذف نهائي ولا يمكن التراجع عنه</Text>
              <Text style={styles.warningText}>
                بعد الحذف لن تتمكن من استعادة حسابك أو أي من بياناته، حتى لو سجّلت بنفس البريد لاحقاً.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>ما الذي سيُحذف؟</Text>
            <View style={styles.listCard}>
              {DELETED_ITEMS.map((item) => (
                <View key={item} style={styles.listRow}>
                  <Ionicons name="close-circle" size={18} color="#f87171" />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.note}>
              رسائل الطرف الآخر في محادثاتك تبقى عنده. قد نحتفظ بسجلات إشراف وإحصاءات مجهولة لا تُربط بك.
            </Text>
            <TouchableOpacity onPress={() => router.push('/privacy' as any)} disabled={deleting}>
              <Text style={styles.policyLink}>تفاصيل أكثر في سياسة الخصوصية</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>
              للتأكيد اكتب كلمة «{CONFIRM_WORD}»
            </Text>
            <TextInput
              style={[
                styles.input,
                Platform.OS === 'web' && ({ outline: 'none' } as any),
              ]}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder={CONFIRM_WORD}
              placeholderTextColor="#4b5563"
              editable={!deleting}
              autoCorrect={false}
              autoCapitalize="none"
              textAlign="right"
            />

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#fca5a5" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.deleteBtn, !canDelete && styles.deleteBtnDisabled]}
              onPress={handleDelete}
              disabled={!canDelete}
              activeOpacity={0.8}
            >
              {deleting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="trash" size={18} color="#ffffff" />
                  <Text style={styles.deleteText}>حذف حسابي نهائياً</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.back()}
              disabled={deleting}
            >
              <Text style={styles.cancelText}>إلغاء والعودة</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f0f1e' },
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    paddingTop: Platform.OS === 'web' && SCREEN_WIDTH >= 768 ? 70 : 0,
  },
  containerWeb: { maxWidth: 720, width: '100%', alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },
  warningCard: {
    alignItems: 'center',
    gap: 8,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  warningTitle: { color: '#fca5a5', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  warningText: { color: '#d1d5db', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  sectionTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700', textAlign: 'right', marginTop: 4 },
  listCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#252550',
    gap: 10,
  },
  listRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  listText: { flex: 1, color: '#d1d5db', fontSize: 14, lineHeight: 21, textAlign: 'right' },
  note: { color: '#6b7280', fontSize: 12, lineHeight: 19, textAlign: 'right' },
  policyLink: { color: '#a78bfa', fontSize: 13, textAlign: 'right', textDecorationLine: 'underline' },
  input: {
    backgroundColor: '#1a1a3e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#252550',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  errorBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: { flex: 1, color: '#fca5a5', fontSize: 13, lineHeight: 20, textAlign: 'right' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    marginTop: 4,
  },
  deleteBtnDisabled: { backgroundColor: '#3f1d1d', opacity: 0.7 },
  deleteText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
});

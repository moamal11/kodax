/**
 * إعدادات الإشعارات — تفعيل الإشعارات على الجهاز + أنواعها + وقت التذكير + ساعات الهدوء
 * (التفضيلات محفوظة على السيرفر وتُحترم عند الإرسال)
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Platform,
  Dimensions,
  Linking,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useResponsiveLayout } from '@/hooks';
import {
  getNotificationPrefs,
  getPermissionInfo,
  isDeviceRegistered,
  isPushOptedOut,
  isPushSupported,
  NotificationPrefs,
  registerForPush,
  setDevicePushEnabled,
  setNotificationPrefs,
} from '@/services/pushService';
import { showToast } from '@/components/ui/Toast';
import { showAlert } from '@/utils/crossPlatformAlert';
import { useAuth } from '@/contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const KINDS: Array<{ key: keyof NotificationPrefs; label: string; hint: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'daily_goal', label: 'تذكير الهدف اليومي', hint: 'مرة في اليوم إذا لم تكمل هدفك', icon: 'flag' },
  { key: 'streak', label: 'تحذير السلسلة', hint: 'مساءً إذا كانت سلسلتك مهددة', icon: 'flame' },
  { key: 'messages', label: 'الرسائل الخاصة', hint: 'عند وصول رسالة جديدة', icon: 'chatbubble-ellipses' },
  { key: 'comments', label: 'التعليقات', hint: 'عندما يعلّق أحد على كودك', icon: 'chatbox' },
  { key: 'likes', label: 'الإعجابات', hint: 'عندما يعجب أحد بكودك', icon: 'heart' },
  { key: 'follows', label: 'المتابعون الجدد', hint: 'عندما يتابعك أحد', icon: 'person-add' },
  { key: 'system', label: 'الدعم والتنبيهات المهمة', hint: 'ردود الدعم وتنبيهات الحساب', icon: 'shield-checkmark' },
  { key: 'admin', label: 'رسائل Kodax', hint: 'أخبار ودورات جديدة (بلا إزعاج)', icon: 'megaphone' },
];

const HOURS = [8, 12, 16, 18, 19, 20, 21];
const fmtHour = (h: number) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? 'ص' : 'م'}`;

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { isLargeScreen } = useResponsiveLayout();
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [permission, setPermission] = useState<string>('undetermined');
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [deviceOn, setDeviceOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [enabling, setEnabling] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    const [p, perm] = await Promise.all([getNotificationPrefs(), getPermissionInfo()]);
    setPermission(perm.status);
    setCanAskAgain(perm.canAskAgain);
    // الإذن ممنوح ولم يوقفها المستخدم لكن الجهاز غير مسجّل (مثلاً فُعّل الإذن من إعدادات الجهاز) → سجّله
    let registered = await isDeviceRegistered();
    if (perm.status === 'granted' && !registered && userId && !(await isPushOptedOut(userId))) {
      registered = (await registerForPush(false)).ok;
    }
    setDeviceOn(perm.status === 'granted' && registered);
    if (!p.prefs) setError(true);
    setPrefs(p.prefs);
    setLoading(false);
  }, [userId]);

  // العودة من إعدادات الجهاز بعد تغيير الإذن
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') load();
    });
    return () => sub.remove();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openDeviceSettings = () =>
    showAlert('الإشعارات مرفوضة من الجهاز', 'لتفعيلها افتح إعدادات التطبيق ثم اسمح بالإشعارات.', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'فتح الإعدادات', onPress: () => Linking.openSettings() },
    ]);

  const toggleDevice = async (on: boolean) => {
    if (!userId) return;
    if (on && permission === 'denied' && !canAskAgain) {
      openDeviceSettings();
      return;
    }
    setEnabling(true);
    const res = await setDevicePushEnabled(userId, on);
    setEnabling(false);
    if (!on) {
      showToast.success('تم إيقاف الإشعارات على هذا الجهاز');
    } else if (res.ok) {
      showToast.success('تم تفعيل الإشعارات على هذا الجهاز');
    } else if (res.reason === 'permission') {
      const perm = await getPermissionInfo();
      setPermission(perm.status);
      setCanAskAgain(perm.canAskAgain);
      // لم يُمنح الإذن (رفض نهائي، أو إشعارات التطبيق مطفأة من إعدادات Android) → الحل من إعدادات الجهاز
      openDeviceSettings();
    } else {
      showToast.error('تعذّر تفعيل الإشعارات حالياً. حاول لاحقاً.');
    }
    load();
  };

  const update = async (patch: Partial<NotificationPrefs>) => {
    if (!prefs) return;
    const prev = prefs;
    setPrefs({ ...prefs, ...patch }); // تحديث متفائل
    const saved = await setNotificationPrefs(patch);
    if (saved) setPrefs(saved);
    else {
      setPrefs(prev);
      showToast.error('تعذّر حفظ الإعداد');
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, isLargeScreen && styles.containerWeb]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#d1d5db" />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <Ionicons name="notifications" size={24} color="#8b5cf6" />
            <Text style={styles.headerTitle}>الإشعارات</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : error || !prefs ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={64} color="#374151" />
            <Text style={styles.stateText}>تعذّر تحميل الإعدادات</Text>
            <TouchableOpacity style={styles.retry} onPress={() => { setLoading(true); load(); }}>
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {isPushSupported ? (
              <View style={[styles.card, deviceOn ? styles.cardOk : styles.cardWarn]}>
                <Ionicons
                  name={deviceOn ? 'checkmark-circle' : 'notifications-off'}
                  size={24}
                  color={deviceOn ? '#10b981' : '#fbbf24'}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {deviceOn ? 'الإشعارات مفعّلة على هذا الجهاز' : 'الإشعارات غير مفعّلة على هذا الجهاز'}
                  </Text>
                  <Text style={styles.cardHint}>
                    {permission === 'denied' && !canAskAgain
                      ? 'الإذن مرفوض من إعدادات الجهاز — اضغط للتفعيل من هناك.'
                      : deviceOn
                        ? 'ستصلك التنبيهات التي تختارها أدناه فقط.'
                        : 'فعّلها لتصلك الرسائل والتذكيرات المهمة.'}
                  </Text>
                </View>
                {enabling ? (
                  <ActivityIndicator color="#8b5cf6" size="small" />
                ) : permission === 'denied' && !canAskAgain ? (
                  <TouchableOpacity style={styles.enableBtn} onPress={() => Linking.openSettings()}>
                    <Text style={styles.enableText}>الإعدادات</Text>
                  </TouchableOpacity>
                ) : (
                  <Switch
                    value={deviceOn}
                    onValueChange={toggleDevice}
                    trackColor={{ false: '#374151', true: '#7c3aed' }}
                    thumbColor="#ffffff"
                  />
                )}
              </View>
            ) : (
              <View style={[styles.card, styles.cardWarn]}>
                <Ionicons name="information-circle" size={22} color="#fbbf24" />
                <Text style={[styles.cardHint, { flex: 1 }]}>
                  الإشعارات الفورية متاحة في تطبيق Android/iOS. تفضيلاتك هنا تُطبَّق على كل أجهزتك.
                </Text>
              </View>
            )}

            <Text style={styles.section}>ماذا تريد أن يصلك؟</Text>
            <View style={styles.list}>
              {KINDS.map((k) => (
                <View key={k.key} style={styles.row}>
                  <Ionicons name={k.icon} size={20} color="#a78bfa" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{k.label}</Text>
                    <Text style={styles.rowHint}>{k.hint}</Text>
                  </View>
                  <Switch
                    value={!!prefs[k.key]}
                    onValueChange={(v) => update({ [k.key]: v } as Partial<NotificationPrefs>)}
                    trackColor={{ false: '#374151', true: '#7c3aed' }}
                    thumbColor="#ffffff"
                  />
                </View>
              ))}
            </View>

            {prefs.daily_goal && (
              <>
                <Text style={styles.section}>وقت تذكير الهدف</Text>
                <View style={styles.chips}>
                  {HOURS.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.chip, prefs.reminder_hour === h && styles.chipActive]}
                      onPress={() => update({ reminder_hour: h })}
                    >
                      <Text style={[styles.chipText, prefs.reminder_hour === h && styles.chipTextActive]}>{fmtHour(h)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.section}>ساعات الهدوء</Text>
            <View style={styles.list}>
              <View style={styles.row}>
                <Ionicons name="moon" size={20} color="#a78bfa" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>عدم الإزعاج ليلاً</Text>
                  <Text style={styles.rowHint}>
                    {prefs.quiet_start === prefs.quiet_end
                      ? 'متوقف'
                      : `من ${fmtHour(prefs.quiet_start)} إلى ${fmtHour(prefs.quiet_end)} — تُؤجَّل الإشعارات للصباح`}
                  </Text>
                </View>
                <Switch
                  value={prefs.quiet_start !== prefs.quiet_end}
                  onValueChange={(v) => update(v ? { quiet_start: 23, quiet_end: 8 } : { quiet_start: 0, quiet_end: 0 })}
                  trackColor={{ false: '#374151', true: '#7c3aed' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f0f1e' },
  container: { flex: 1, backgroundColor: '#0f0f1e', paddingTop: Platform.OS === 'web' && SCREEN_WIDTH >= 768 ? 70 : 0 },
  containerWeb: { maxWidth: 720, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  stateText: { color: '#9ca3af', fontSize: 15, fontWeight: '700' },
  retry: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#252550', backgroundColor: '#1a1a3e' },
  retryText: { color: '#8b5cf6', fontWeight: '600' },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  card: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, borderWidth: 1 },
  cardOk: { backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)' },
  cardWarn: { backgroundColor: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.3)' },
  cardTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700', textAlign: 'right' },
  cardHint: { color: '#9ca3af', fontSize: 12, lineHeight: 19, textAlign: 'right', marginTop: 2 },
  enableBtn: { backgroundColor: '#7c3aed', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, minWidth: 70, alignItems: 'center' },
  enableText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  section: { color: '#ffffff', fontSize: 15, fontWeight: '800', textAlign: 'right', marginTop: 8 },
  list: { borderRadius: 18, backgroundColor: '#1a1a3e', borderWidth: 1, borderColor: '#252550', paddingHorizontal: 12 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rowLabel: { color: '#e5e7eb', fontSize: 14, fontWeight: '600', textAlign: 'right' },
  rowHint: { color: '#6b7280', fontSize: 12, textAlign: 'right', marginTop: 2 },
  chips: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: '#1a1a3e', borderWidth: 1, borderColor: '#252550' },
  chipActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  chipText: { color: '#9ca3af', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#ffffff' },
});

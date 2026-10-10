/**
 * إعدادات الإشعارات — تفعيل الإشعارات على الجهاز + أنواعها + وقت التذكير + ساعات الهدوء
 * (التفضيلات محفوظة على السيرفر وتُحترم عند الإرسال). كل مفتاح مربوط باسمه ووصفه (F11).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getNotificationPrefs, getPermissionInfo, isDeviceRegistered, isPushOptedOut, isPushSupported, NotificationPrefs, registerForPush, setDevicePushEnabled, setNotificationPrefs } from '@/services/pushService';
import { showToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { Screen, AppBar, Text, Row, Col, ListGroup, SwitchRow, Surface, Button, Chip, SectionHeader, ErrorState, ListSkeleton, type IconName } from '@/design';

const KINDS: Array<{ key: keyof NotificationPrefs; label: string; hint: string; icon: IconName }> = [
  { key: 'daily_goal', label: 'تذكير الهدف اليومي', hint: 'مرة في اليوم إذا لم تكمل هدفك', icon: 'flag-outline' },
  { key: 'streak', label: 'تحذير السلسلة', hint: 'مساءً إذا كانت سلسلتك مهددة', icon: 'flame-outline' },
  { key: 'messages', label: 'الرسائل الخاصة', hint: 'عند وصول رسالة جديدة', icon: 'chatbubble-ellipses-outline' },
  { key: 'comments', label: 'التعليقات والردود', hint: 'التعليق على كودك أو منشورك، والرد على تعليقك', icon: 'chatbox-outline' },
  { key: 'posts', label: 'منشورات الحسابات التي أتابعها', hint: 'عند نشر كود أو منشور جديد', icon: 'newspaper-outline' },
  { key: 'likes', label: 'الإعجابات', hint: 'عندما يعجب أحد بكودك أو منشورك', icon: 'heart-outline' },
  { key: 'follows', label: 'المتابعون الجدد', hint: 'عندما يتابعك أحد', icon: 'person-add-outline' },
  { key: 'system', label: 'الدعم والتنبيهات المهمة', hint: 'ردود الدعم وتنبيهات الحساب', icon: 'shield-checkmark-outline' },
  { key: 'admin', label: 'رسائل Kodax', hint: 'أخبار ودورات جديدة (قليلة)', icon: 'megaphone-outline' },
];
const HOURS = [8, 12, 16, 18, 19, 20, 21];
const fmtHour = (h: number) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? 'ص' : 'م'}`;

export default function NotificationSettingsScreen() {
  const { userId } = useAuth();
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
    if (perm.status === 'granted' && !registered && userId && !(await isPushOptedOut(userId))) registered = (await registerForPush(false)).ok;
    setDeviceOn(perm.status === 'granted' && registered);
    if (!p.prefs) setError(true);
    setPrefs(p.prefs);
    setLoading(false);
  }, [userId]);

  // العودة من إعدادات الجهاز بعد تغيير الإذن
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && load());
    return () => sub.remove();
  }, [load]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const blocked = permission === 'denied' && !canAskAgain;

  const toggleDevice = async (on: boolean) => {
    if (!userId) return;
    if (on && blocked) { if (Platform.OS !== 'web') return Linking.openSettings(); return; }
    setEnabling(true);
    const res = await setDevicePushEnabled(userId, on);
    setEnabling(false);
    if (!on) showToast.success('تم إيقاف الإشعارات على هذا الجهاز');
    else if (res.ok) showToast.success('تم تفعيل الإشعارات على هذا الجهاز');
    else if (res.reason === 'permission') {
      const perm = await getPermissionInfo();
      setPermission(perm.status);
      setCanAskAgain(perm.canAskAgain);
    } else showToast.error('تعذّر تفعيل الإشعارات حالياً. حاول لاحقاً.');
    load();
  };

  const update = async (patch: Partial<NotificationPrefs>) => {
    if (!prefs) return;
    const prev = prefs;
    setPrefs({ ...prefs, ...patch });
    const saved = await setNotificationPrefs(patch);
    if (saved) setPrefs(saved);
    else {
      setPrefs(prev);
      showToast.error('تعذّر حفظ الإعداد');
    }
  };

  const quietOn = !!prefs && prefs.quiet_start !== prefs.quiet_end;

  return (
    <Screen width="reading" header={<AppBar title="الإشعارات" fallback="/profile" />}>
      {loading ? (
        <ListSkeleton rows={3} />
      ) : error || !prefs ? (
        <ErrorState
          title="تعذّر تحميل الإعدادات"
          onRetry={() => {
            setLoading(true);
            load();
          }}
        />
      ) : (
        <Col gap={20}>
          {isPushSupported ? (
            blocked ? (
              <Surface variant="warning" padding={14}>
                <Text variant="label" tone="warning">
                  {Platform.OS === 'web' ? 'المتصفح منع الإشعارات' : 'الإشعارات مرفوضة من إعدادات الجهاز'}
                </Text>
                <Text variant="bodySm" tone="secondary" style={{ marginTop: 2 }}>
                  {Platform.OS === 'web' ? 'اسمح بالإشعارات من إعدادات هذا الموقع في المتصفح، ثم ارجع هنا.' : 'افتح إعدادات التطبيق واسمح بالإشعارات، ثم ارجع هنا.'}
                </Text>
                {Platform.OS !== 'web' && <Button label="فتح إعدادات الجهاز" variant="secondary" size="sm" onPress={() => Linking.openSettings()} style={{ alignSelf: 'flex-start', marginTop: 10 }} />}
              </Surface>
            ) : (
              <ListGroup>
                <SwitchRow
                  title={Platform.OS === 'web' ? 'إشعارات هذا المتصفح' : 'الإشعارات على هذا الجهاز'}
                  hint={deviceOn ? 'تصلك فقط الأنواع المفعّلة أدناه' : 'فعّلها حتى تصلك الرسائل والتذكيرات المهمة'}
                  icon={deviceOn ? 'notifications' : 'notifications-off-outline'}
                  value={deviceOn}
                  onValueChange={toggleDevice}
                  disabled={enabling}
                  last
                />
              </ListGroup>
            )
          ) : (
            <Surface variant="brand" padding={14}>
              <Text variant="bodySm" tone="secondary">
                {Platform.OS === 'web' ? 'إشعارات المتصفح تحتاج HTTPS ومتصفحًا يدعمها. على iPhone وiPad، أضف الموقع للشاشة الرئيسية أولًا. تفضيلاتك تُطبّق على أجهزتك.' : 'الإشعارات الفورية متاحة في تطبيق Android. تفضيلاتك هنا تُطبَّق على كل أجهزتك.'}
              </Text>
            </Surface>
          )}

          <View>
            <SectionHeader title="ماذا تريد أن يصلك؟" />
            <ListGroup>
              {KINDS.map((k, i) => (
                <SwitchRow key={k.key} title={k.label} hint={k.hint} icon={k.icon} value={!!prefs[k.key]} onValueChange={(v) => update({ [k.key]: v } as Partial<NotificationPrefs>)} last={i === KINDS.length - 1} />
              ))}
            </ListGroup>
          </View>

          {prefs.daily_goal && (
            <View>
              <SectionHeader title="وقت تذكير الهدف" subtitle="بتوقيت بغداد" />
              <Row gap={8} wrap style={{ justifyContent: 'flex-start' }}>
                {HOURS.map((h) => (
                  <Chip key={h} label={fmtHour(h)} selected={prefs.reminder_hour === h} onPress={() => update({ reminder_hour: h })} />
                ))}
              </Row>
            </View>
          )}

          <View>
            <SectionHeader title="ساعات الهدوء" />
            <ListGroup>
              <SwitchRow
                title="عدم الإزعاج ليلاً"
                hint={quietOn ? `من ${fmtHour(prefs.quiet_start)} إلى ${fmtHour(prefs.quiet_end)}: تُؤجَّل التذكيرات والإعجابات والتعليقات والمتابعات ورسائل Kodax للصباح. الرسائل الخاصة والدعم تصل فوراً.` : 'متوقف: كل الإشعارات تصل فوراً'}
                icon="moon-outline"
                value={quietOn}
                onValueChange={(v) => update(v ? { quiet_start: 23, quiet_end: 8 } : { quiet_start: 0, quiet_end: 0 })}
                last
              />
            </ListGroup>
          </View>
        </Col>
      )}
    </Screen>
  );
}

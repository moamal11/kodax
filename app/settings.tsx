import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { getProfile, updateProfile, updatePassword, type ProfileData } from '@/services/profileService';
import { Screen, AppBar, Col, Row, Text, Surface, SectionHeader, ListGroup, ListRow, SwitchRow, Button, Sheet, Field, ListSkeleton, ErrorState, useTheme, useThemePreference } from '@/design';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { ready: themeReady, setMode } = useThemePreference();
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeError, setThemeError] = useState('');
  const themeBusy = useRef(false);
  const changeTheme = async (light: boolean) => {
    if (!themeReady || themeBusy.current) return;
    themeBusy.current = true; setThemeSaving(true); setThemeError('');
    try { await setMode(light ? 'light' : 'dark'); }
    catch { setThemeError('تعذّر حفظ المظهر. حاول مرة أخرى.'); }
    finally { themeBusy.current = false; setThemeSaving(false); }
  };
  const { userId, signOut } = useAuth();
  const { refreshProfile } = useApp();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState<null | 'password' | 'logout'>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const busy = useRef(false);
  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true); setError('');
    const r = await getProfile(userId); setProfile(r.data); setError(r.error || ''); setLoading(false);
  }, [userId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const privacy = async (key: 'followers_visible' | 'following_visible', value: boolean) => {
    if (!userId || !profile || busy.current) return;
    busy.current = true; setSaving(true); setError(''); setSaved(false);
    try {
      const r = await updateProfile(userId, { [key]: value });
      if (!r.success) { setError('تعذّر حفظ الخصوصية. لم يتغير الإعداد؛ حاول مرة أخرى.'); return; }
      setProfile(p => p && { ...p, [key]: value }); setSaved(true); await refreshProfile();
    } finally { busy.current = false; setSaving(false); }
  };
  const passwordSave = async () => {
    if (busy.current) return;
    if (password.length < 6) return setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    if (password !== confirm) return setPasswordError('كلمتا المرور غير متطابقتين');
    busy.current = true; setSaving(true); setPasswordError('');
    try {
      const r = await updatePassword(password);
      if (!r.success) setPasswordError(r.error || 'تعذّر التحديث. حاول مرة أخرى.');
      else { setPassword(''); setConfirm(''); setModal(null); }
    } finally { busy.current = false; setSaving(false); }
  };
  return <Screen width="reading" header={<AppBar title="الإعدادات" fallback="/profile" />}>
    <Col gap={22}>
      <Col gap={10}>
        <SectionHeader title="المظهر" />
        <ListGroup>
          <SwitchRow title="الوضع النهاري" hint={themeSaving ? 'جارٍ الحفظ…' : theme.mode === 'light' ? 'مظهر فاتح' : 'الوضع الليلي مفعّل'} icon="sunny-outline" value={theme.mode === 'light'} disabled={!themeReady || themeSaving} onValueChange={changeTheme} last />
        </ListGroup>
        {!!themeError && <Text tone="danger" variant="bodySm" accessibilityLiveRegion="polite">{themeError}</Text>}
      </Col>
      <Col gap={10}>
        <SectionHeader title="خصوصية الملف" />
        <Text variant="bodySm" tone="secondary">إخفاء القائمة لا يخفي العدد. أنت تقدر تشوف قوائمك دائمًا. وقد تُخفى علاقات في القوائم العامة احترامًا لخصوصية الطرف الآخر.</Text>
        {loading ? <ListSkeleton rows={2} /> : profile ? <ListGroup>
          <SwitchRow title="إظهار قائمة المتابعين" hint={profile.followers_visible === false ? 'القائمة متاحة لك فقط' : 'يمكن للآخرين فتح القائمة'} icon="people-outline" value={profile.followers_visible !== false} disabled={saving} onValueChange={v => privacy('followers_visible', v)} />
          <SwitchRow title="إظهار قائمة الحسابات التي أتابعها" hint={profile.following_visible === false ? 'القائمة متاحة لك فقط' : 'يمكن للآخرين فتح القائمة'} icon="person-add-outline" value={profile.following_visible !== false} disabled={saving} onValueChange={v => privacy('following_visible', v)} last />
        </ListGroup> : <ErrorState body={error || 'سجّل الدخول لإدارة الخصوصية'} onRetry={load} />}
        {!!profile && !!error && <Text tone="danger" variant="bodySm" accessibilityLiveRegion="polite">{error}</Text>}
        {(saving || saved) && <Text tone={saved ? 'success' : 'secondary'} variant="caption" accessibilityLiveRegion="polite">{saving ? 'جارٍ الحفظ…' : 'حُفظت الخصوصية'}</Text>}
      </Col>
      <Col gap={10}><SectionHeader title="الحساب والإشعارات" /><ListGroup>
        <ListRow icon="notifications-outline" title="إعدادات الإشعارات" onPress={() => router.push('/notification-settings')} />
        <ListRow icon="key-outline" title="تغيير كلمة المرور" onPress={() => { setPasswordError(''); setPassword(''); setConfirm(''); setModal('password'); }} />
        <ListRow icon="ban-outline" title="المستخدمون المحظورون" onPress={() => router.push('/blocked-users')} last />
      </ListGroup></Col>
      <Col gap={10}><SectionHeader title="المساعدة وعن Kodax" /><ListGroup>
        <ListRow icon="help-buoy-outline" title="الدعم الفني" onPress={() => router.push('/support')} />
        <ListRow icon="information-circle-outline" title="حول التطبيق" onPress={() => router.push('/about')} />
        <ListRow icon="shield-checkmark-outline" title="سياسة الخصوصية" onPress={() => router.push('/privacy')} />
        <ListRow icon="document-text-outline" title="شروط الاستخدام" onPress={() => router.push('/terms')} last />
      </ListGroup></Col>
      <ListGroup><ListRow icon="log-out-outline" title="تسجيل الخروج" onPress={() => setModal('logout')} chevron={false} />
        <ListRow icon="trash-outline" title="حذف الحساب" danger onPress={() => router.push('/delete-account')} last /></ListGroup>
    </Col>
    <Sheet visible={modal === 'password'} dismissible={!saving} onClose={() => !saving && setModal(null)} title="تغيير كلمة المرور" footer={<Button label="حفظ كلمة المرور" loading={saving} onPress={passwordSave} full />}>
      <Col gap={16}><Field label="كلمة المرور الجديدة" value={password} onChangeText={setPassword} secure editable={!saving} autoComplete="new-password" />
        <Field label="تأكيد كلمة المرور" value={confirm} onChangeText={setConfirm} secure editable={!saving} autoComplete="new-password" />
        {!!passwordError && <Text tone="danger" accessibilityLiveRegion="polite">{passwordError}</Text>}</Col>
    </Sheet>
    <Sheet visible={modal === 'logout'} onClose={() => setModal(null)} title="تسجيل الخروج؟" maxWidth={400}>
      <Col gap={14}><Text tone="secondary">تقدمك محفوظ على حسابك.</Text><Row gap={8}>
        <Button label="خروج" variant="danger" onPress={() => { setModal(null); signOut(); }} style={{ flex: 1 }} />
        <Button label="إلغاء" variant="secondary" onPress={() => setModal(null)} style={{ flex: 1 }} /></Row></Col>
    </Sheet>
  </Screen>;
}

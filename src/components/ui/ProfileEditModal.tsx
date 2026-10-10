import React, { useEffect, useRef, useState } from 'react';
import { ProfileIdentityHero, ProfileIdentityName } from '@/features/community/ProfileHeader';
import { Sheet, Col, Row, Field, Button, Text, Surface } from '@/design';
import { type ProfileData, type ProfileImage, type ProfileUpdateData, saveProfileIdentity, canChangeUsername, isUsernameAvailable, pickProfileImage, BIO_LIMIT } from '@/services/profileService';
import { showToast } from './Toast';
export default function ProfileEditModal({ visible, profile, onClose, onSave }: {
  visible: boolean; profile: ProfileData | null; onClose: () => void; onSave: () => void;
}) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<ProfileImage | null>(null);
  const [cover, setCover] = useState<ProfileImage | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);
  const [phase, setPhase] = useState('');
  const [error, setError] = useState('');
  const [usernameRule, setUsernameRule] = useState({ canChange: false, daysRemaining: 0 });
  const busy = useRef(false);
  useEffect(() => {
    if (!profile || !visible) return;
    setName(profile.full_name || ''); setUsername(profile.username || ''); setBio(profile.bio || '');
    setAvatar(null); setCover(null); setRemoveCover(false); setError(''); setPhase('');
    let alive = true;
    setUsernameRule({ canChange: false, daysRemaining: 0 });
    canChangeUsername(profile.id).then(r => alive && setUsernameRule(r));
    return () => { alive = false; };
  }, [profile, visible]);
  const pick = async (kind: 'avatar' | 'cover') => {
    if (busy.current) return;
    busy.current = true; setPicking(true); setError('');
    try {
      const r = await pickProfileImage(kind);
      if (r.error) setError(r.error);
      if (r.image) {
        if (kind === 'avatar') setAvatar(r.image);
        else { setCover(r.image); setRemoveCover(false); }
      }
    } finally { busy.current = false; setPicking(false); }
  };
  const save = async () => {
    if (!profile || busy.current) return;
    busy.current = true; setSaving(true); setError('');
    try {
      if (name.trim().length < 3) throw new Error('الاسم يجب أن يكون 3 أحرف على الأقل');
      const updates: ProfileUpdateData = { full_name: name.trim(), bio: bio.trim() || null };
      if (username.trim() !== profile.username) {
        if (!usernameRule.canChange) throw new Error(`تقدر تغيّر اسم المستخدم بعد ${usernameRule.daysRemaining} أيام`);
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) throw new Error('اسم المستخدم: 3–30 حرفًا إنجليزيًا أو رقمًا أو _');
        if (!(await isUsernameAvailable(username.trim(), profile.id))) throw new Error('اسم المستخدم مستخدم بالفعل');
        updates.username = username.trim();
      }
      const r = await saveProfileIdentity(profile, updates, { avatar, cover, removeCover }, setPhase);
      if (!r.success) throw new Error([r.error, r.cleanupWarning].filter(Boolean).join(' · '));
      if (r.cleanupWarning) showToast.error(r.cleanupWarning);
      else showToast.success('تم حفظ الملف');
      onSave();
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذّر الحفظ. حاول مرة أخرى.'); }
    finally { busy.current = false; setSaving(false); setPhase(''); }
  };
  if (!profile) return null;
  const disabled = saving || picking;
  const coverUri = cover?.uri || (removeCover ? null : profile.cover_url);
  return <Sheet visible={visible} onClose={() => !disabled && onClose()} dismissible={!disabled} title="تعديل الملف الشخصي"
    footer={<Col gap={8}>
      {!!phase && <Text variant="bodySm" tone="secondary" accessibilityLiveRegion="polite">{phase}</Text>}
      <Row gap={8}><Button label={error ? 'إعادة محاولة الحفظ' : 'حفظ التغييرات'} onPress={save} loading={saving} disabled={picking} style={{ flex: 1 }} />
        <Button label="إلغاء" variant="secondary" disabled={disabled} onPress={onClose} /></Row>
    </Col>}>
    <Col gap={18}>
      <ProfileIdentityHero coverUrl={coverUri} name={name || username} compact>
        <ProfileIdentityName name={name || username} username={username} avatarUrl={avatar?.uri || profile.avatar_url} compact />
      </ProfileIdentityHero>
      <Row wrap gap={8}>
        <Button label={coverUri ? 'تغيير الغلاف' : 'اختيار غلاف'} icon="image-outline" variant="secondary" onPress={() => pick('cover')} disabled={disabled} />
        {!!coverUri && <Button label="إزالة الغلاف" icon="close-outline" variant="ghost" onPress={() => { setCover(null); setRemoveCover(true); }} disabled={disabled} />}
        <Button label="تغيير الصورة الشخصية" icon="camera-outline" variant="secondary" onPress={() => pick('avatar')} disabled={disabled} />
      </Row>
      <Text variant="caption" tone="secondary">PNG أو JPEG أو WebP · حتى 5 ميغابايت. الغلاف يُعرض بنسبة عريضة مع قص الأطراف حسب الشاشة.</Text>
      <Field label="الاسم الكامل" value={name} onChangeText={setName} editable={!disabled} maxLength={80} autoComplete="name" />
      <Field label="اسم المستخدم" value={username} onChangeText={setUsername} editable={!disabled && usernameRule.canChange} ltr autoCapitalize="none" autoCorrect={false}
        hint={usernameRule.canChange ? '3–30 حرفًا إنجليزيًا أو رقمًا أو _' : usernameRule.daysRemaining ? `تقدر تغيّره بعد ${usernameRule.daysRemaining} أيام.` : 'جارٍ التحقق…'} />
      <Row gap={8} justify="space-between">
        <Text variant="label" tone="secondary" style={{ flex: 1 }}>نبذة عنك (اختيارية)</Text>
        <Text variant="caption" tone="secondary" tabular ltr>{Array.from(bio).length} / {BIO_LIMIT}</Text>
      </Row>
      <Field label="نبذة عنك (اختيارية)" hideLabel hint={`حتى ${BIO_LIMIT} حرفًا`} placeholder="اهتماماتك أو ما تتعلّمه" value={bio} onChangeText={v => setBio(Array.from(v).slice(0, BIO_LIMIT).join(''))} multiline editable={!disabled} />
      {!!bio && <Button label="مسح النبذة" variant="ghost" onPress={() => setBio('')} disabled={disabled} size="sm" />}
      {!!error && <Surface variant="danger" padding={12}><Text tone="danger" variant="bodySm" accessibilityLiveRegion="polite">{error}</Text></Surface>}
    </Col>
  </Sheet>;
}

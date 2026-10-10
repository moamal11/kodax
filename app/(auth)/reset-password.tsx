import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Screen, AppBar, Col, Text, Field, Button, Surface } from '@/design';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setReady(!!data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setReady(!!session);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  const save = async () => {
    if (loading) return;
    if (password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
    if (password !== confirm) return setError('كلمتا المرور غير متطابقتين.');
    setLoading(true);
    setError(null);
    try {
      const { error: failure } = await supabase.auth.updateUser({ password });
      if (failure) throw failure;
      setDone(true);
      setPassword('');
      setConfirm('');
    } catch {
      setError('تعذّر تغيير كلمة المرور. اطلب رابطًا جديدًا إذا انتهت صلاحية الرابط.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Screen width="reading" header={<AppBar title="كلمة مرور جديدة" fallback="/(auth)/login" />} contentStyle={{ maxWidth: 480, paddingTop: 24 }}>
      <Col gap={20}>
        <Text variant="title">{done ? 'تم تغيير كلمة المرور' : 'أمّن حسابك بكلمة جديدة'}</Text>
        {done ? (
          <>
            <Surface variant="success" padding={16}>
              <Text tone="success">تقدر تستخدم كلمة المرور الجديدة عند تسجيل الدخول.</Text>
            </Surface>
            <Button label="متابعة إلى التطبيق" onPress={() => router.replace('/(tabs)')} />
          </>
        ) : ready ? (
          <>
            <Field
              label="كلمة المرور الجديدة"
              secure
              ltr
              value={password}
              onChangeText={setPassword}
              autoComplete="new-password"
              editable={!loading}
              hint="6 أحرف على الأقل."
            />
            <Field
              label="تأكيد كلمة المرور"
              secure
              ltr
              value={confirm}
              onChangeText={setConfirm}
              autoComplete="new-password"
              editable={!loading}
              error={error}
              onSubmitEditing={save}
            />
            <Button label="حفظ كلمة المرور" onPress={save} loading={loading} />
          </>
        ) : (
          <>
            <Text tone="secondary">افتح هذه الصفحة من رابط الاستعادة في بريدك. إذا انتهت صلاحيته، اطلب رابطًا جديدًا.</Text>
            <Button label="طلب رابط جديد" onPress={() => router.replace('/(auth)/forgot-password')} />
          </>
        )}
      </Col>
    </Screen>
  );
}

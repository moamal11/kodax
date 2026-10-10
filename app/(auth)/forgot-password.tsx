import React, { useState } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Screen, AppBar, Col, Text, Field, Button, Surface } from '@/design';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    if (loading) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('اكتب بريدًا إلكترونيًا صحيحًا.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const redirectTo = Platform.OS === 'web' ? `${window.location.origin}/reset-password` : 'kodax://reset-password';
      const { error: failure } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (failure) throw failure;
      setSent(true);
    } catch {
      setError('تعذّر إرسال الرابط. تحقق من الاتصال وحاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Screen width="reading" header={<AppBar title="استعادة كلمة المرور" fallback="/(auth)/login" />} contentStyle={{ maxWidth: 480, paddingTop: 24 }}>
      <Col gap={20}>
        <Text variant="title">{sent ? 'راجع بريدك الإلكتروني' : 'نساعدك ترجع لحسابك'}</Text>
        <Text tone="secondary">
          {sent
            ? 'إذا كان البريد مرتبطًا بحساب، سيصلك رابط لتعيين كلمة مرور جديدة. راجع الرسائل غير المرغوب فيها أيضًا.'
            : 'اكتب البريد المرتبط بحسابك وسنرسل لك رابط الاستعادة.'}
        </Text>
        {!sent ? (
          <>
            <Field
              label="البريد الإلكتروني"
              value={email}
              onChangeText={setEmail}
              ltr
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              editable={!loading}
              error={error}
              onSubmitEditing={submit}
            />
            <Button label="إرسال رابط الاستعادة" onPress={submit} loading={loading} />
          </>
        ) : (
          <Surface variant="success" padding={16}>
            <Text tone="success">تم استلام طلبك.</Text>
          </Surface>
        )}
        <Button label="العودة لتسجيل الدخول" variant="secondary" onPress={() => router.replace('/(auth)/login')} />
      </Col>
    </Screen>
  );
}

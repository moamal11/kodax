import { BrandMark } from '@/components/ui/BrandMark';
import { rememberWebReturn } from '@/services/webAccess';
import React, { useState, useEffect } from 'react';
import { Image, KeyboardAvoidingView, Platform, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { showAlert } from '@/utils/crossPlatformAlert';
import { Screen, AppBar, Col, Row, Text, Field, Button, Surface, Segmented, useTheme } from '@/design';
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const t = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; error?: string; returnTo?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(params.mode === 'signup');
  const { session, isAuthenticated } = useAuth();
  const verifyingSession = !!session?.user && !isAuthenticated;
  const busy = loading || verifyingSession;
  useEffect(() => { if (params.returnTo) rememberWebReturn(params.returnTo); }, [params.returnTo]);
  useEffect(() => {
    setIsSignUp(params.mode === 'signup');
  }, [params.mode]);
  useEffect(() => {
    if (params.error) showAlert('تعذّر تسجيل الدخول', params.error);
  }, [params.error]);
  const handleEmailAuth = async () => {
    setAuthError(null);
    const invalidEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    setEmailError(invalidEmail ? 'أدخل بريدًا إلكترونيًا صحيحًا.' : null);
    setPasswordError(!password ? 'أدخل كلمة المرور.' : isSignUp && password.length < 6 ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' : null);
    if (invalidEmail || !password || (isSignUp && password.length < 6)) return;
    if (!email || !password) {
      showAlert('خطأ', 'الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    if (isSignUp && password.length < 6) {
      showAlert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        console.log('[AUTH] signUp started');
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        console.log('[AUTH] signUp result:', {
          error: error?.message ?? null,
          hasUser: !!data?.user,
          hasSession: !!data?.session,
        });

        if (error) throw error;
        if (data.user && !data.session) {
          // Email confirmation required
          showAlert('تم إنشاء الحساب بنجاح', 'تم إرسال رابط التفعيل إلى بريدك الإلكتروني. الرجاء تفعيل حسابك ثم تسجيل الدخول.', [
            { text: 'حسناً', onPress: () => setIsSignUp(false) },
          ]);
        } else if (data.session) {
          // Auto-confirmed (for testing)
          // Navigation will happen automatically via auth listener
        }
      } else {
        console.log('[AUTH] signIn started');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        console.log('[AUTH] signIn result:', {
          error: error?.message ?? null,
          hasUser: !!data?.user,
          hasSession: !!data?.session,
        });

        if (error) throw error;

        if (data.session) {
          // Navigation will happen automatically via auth listener in _layout.tsx
        }
      }
    } catch (error: any) {
      console.warn('[AUTH] auth error:', error?.message);
      let errorMessage = 'حدث خطأ أثناء العملية';

      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'الرجاء تفعيل حسابك عبر البريد الإلكتروني أولاً';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'هذا البريد الإلكتروني مسجل بالفعل. جرب تسجيل الدخول';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'لا يوجد اتصال بالإنترنت. الرجاء التحقق من اتصالك';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Stable callback URL strategy:
      // - Mobile must NEVER use localhost callback (not reachable on physical device)
      // - Web can use current origin in dev
      // - Mobile always uses hosted callback that forwards to kodax:// deep link
      const isMobile = Platform.OS !== 'web';
      const hostedCallback = process.env.EXPO_PUBLIC_OAUTH_WEB_CALLBACK || 'https://kodax.app/auth/callback';
      const webCallback = Platform.OS === 'web' && __DEV__ && typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : hostedCallback;
      const redirectTo = isMobile ? `${hostedCallback}?fromApp=1` : webCallback;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: isMobile,
        },
      });

      if (error) throw error;

      // On mobile, open the OAuth URL in browser
      if (isMobile && data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, 'kodax://');

        if (result.type === 'success') {
          // Session setup is centralized in deep-link listener + AuthContext.
          // Do not add local auth listeners here to avoid race conditions.
          return;
        } else if (result.type === 'cancel') {
          throw new Error('تم إلغاء عملية تسجيل الدخول');
        } else {
          throw new Error('تعذر إكمال جلسة تسجيل الدخول');
        }
      }
      // On web, the redirect will happen automatically
    } catch (error: any) {
      let errorMessage = 'فشل تسجيل الدخول بجوجل';

      if (error.message?.includes('OAuth')) {
        errorMessage = 'يرجى إعداد Google OAuth في لوحة تحكم Supabase أولاً. راجع GOOGLE_OAUTH_SETUP.md';
      } else if (error.message?.includes('إلغاء')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined} style={{ flex: 1 }}>
      <Screen
        width="reading"
        header={<AppBar title={isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'} fallback="/download" />}
        contentStyle={{ maxWidth: 480, paddingTop: 16 }}
      >
        <Col gap={24}>
          <Col gap={16} align="center" style={{ paddingBottom: 4 }}>
            <BrandMark width={228} />
            <Text variant="title" align="center">
              {isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </Text>
            <Text tone="secondary" variant="bodySm" align="center">
              {isSignUp ? 'البريد وكلمة المرور لحفظ تقدمك.' : 'ادخل بيانات حسابك.'}
            </Text>
          </Col>
          <View style={{ paddingTop: 20 }}>
            <Col gap={18}>
              <Segmented
                value={isSignUp ? 'signup' : 'login'}
                onChange={(v) => {
                  if (!busy) {
                    setIsSignUp(v === 'signup');
                    setPassword('');
                    setEmailError(null);
                    setPasswordError(null);
                    setAuthError(null);
                  }
                }}
                options={[
                  { value: 'login', label: 'تسجيل الدخول' },
                  { value: 'signup', label: 'حساب جديد' },
                ]}
              />
              <Field
                label="البريد الإلكتروني"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setEmailError(null);
                  setAuthError(null);
                }}
                error={emailError}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
                ltr
                editable={!busy}
              />
              <Field
                label="كلمة المرور"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setPasswordError(null);
                  setAuthError(null);
                }}
                error={passwordError}
                secure
                ltr
                autoCapitalize="none"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                hint={isSignUp ? '6 أحرف على الأقل.' : undefined}
                editable={!busy}
                onSubmitEditing={() => {
                  if (!busy) handleEmailAuth();
                }}
                returnKeyType="go"
              />
              {!isSignUp && (
                <Button
                  variant="ghost"
                  label="نسيت كلمة المرور؟"
                  disabled={busy}
                  onPress={() => router.push('/(auth)/forgot-password')}
                  style={{ alignSelf: 'flex-start' }}
                />
              )}
              {authError && (
                <Text variant="bodySm" tone="danger" accessibilityRole="alert">
                  {authError}
                </Text>
              )}
              <Button
                label={verifyingSession ? 'جارٍ فتح حسابك…' : isSignUp ? 'إنشاء حساب مجاني' : 'تسجيل الدخول'}
                size="lg"
                loading={busy}
                disabled={!email.trim() || !password}
                onPress={handleEmailAuth}
              />
              <Row gap={12}>
                <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
                <Text variant="caption" tone="muted">
                  أو
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
              </Row>
              <Button label="المتابعة باستخدام Google" icon="logo-google" variant="secondary" disabled={busy} onPress={handleGoogleSignIn} />
            </Col>
          </View>
          <Text variant="caption" tone="muted" align="center">
            بإنشاء حساب، توافق على شروط الاستخدام وسياسة الخصوصية.
          </Text>
          <Row gap={8} justify="center" wrap>
            <Button label="شروط الاستخدام" variant="ghost" onPress={() => router.push('/terms')} />
            <Button label="الخصوصية" variant="ghost" onPress={() => router.push('/privacy')} />
          </Row>
        </Col>
      </Screen>
    </KeyboardAvoidingView>
  );
}

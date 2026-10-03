import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { showAlert } from '@/utils/crossPlatformAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useResponsiveLayout } from '@/hooks';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // بعد نجاح signIn/signUp تبقى الواجهة في حالة تحميل حتى يُكمل AuthContext
  // التحقق من الجلسة والملف الشخصي، ثم ينقل NavigationGuard المستخدم للتطبيق.
  const { session, isAuthenticated } = useAuth();
  const verifyingSession = !!session?.user && !isAuthenticated;
  const busy = loading || verifyingSession;
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { isWeb, isLargeScreen } = useResponsiveLayout();

  // Show error from OAuth callback if any
  useEffect(() => {
    if (params.error) {
      showAlert('خطأ', params.error as string);
    }
  }, [params.error]);

  // Animated glow effect for logo
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleEmailAuth = async () => {
    if (!email || !password) {
      showAlert('خطأ', 'الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    if (password.length < 6) {
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
          showAlert(
            'تم إنشاء الحساب بنجاح',
            'تم إرسال رابط التفعيل إلى بريدك الإلكتروني. الرجاء تفعيل حسابك ثم تسجيل الدخول.',
            [{ text: 'حسناً', onPress: () => setIsSignUp(false) }]
          );
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

      showAlert('خطأ', errorMessage);
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
      const hostedCallback =
        process.env.EXPO_PUBLIC_OAUTH_WEB_CALLBACK ||
        'https://kodax.app/auth/callback';
      const webCallback =
        Platform.OS === 'web' && __DEV__ && typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : hostedCallback;
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
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'kodax://'
        );

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
        errorMessage =
          'يرجى إعداد Google OAuth في لوحة تحكم Supabase أولاً. راجع GOOGLE_OAUTH_SETUP.md';
      } else if (error.message?.includes('إلغاء')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showAlert('خطأ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#0b0b1e', '#111132', '#0e0e28', '#0b0b1e']}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Decorative background orbs */}
      <View style={[styles.bgOrb, styles.bgOrb1]} />
      <View style={[styles.bgOrb, styles.bgOrb2]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 20) + 20,
              paddingBottom: Math.max(insets.bottom, 20) + 20,
            },
            isWeb &&
              isLargeScreen && {
                maxWidth: 440,
                alignSelf: 'center',
                width: '100%',
              },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Branding */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(1000).springify()}
            style={styles.brandingSection}
          >
            <View style={styles.logoContainer}>
              <Animated.View style={[styles.logoGlow, glowStyle]} />
              <Image
                source={require('../../assets/kodax-light-trans.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandTagline}>تعلّم البرمجة بأسلوب تفاعلي</Text>
          </Animated.View>

          {/* Auth Form Card */}
          <Animated.View entering={FadeInUp.delay(300).duration(600)}>
            <LinearGradient
              colors={['rgba(22, 22, 50, 0.95)', 'rgba(16, 16, 40, 0.98)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.formCard}
            >
              {/* Tab Switcher */}
              <View style={styles.tabSwitcher}>
                <TouchableOpacity
                  style={[styles.tab, !isSignUp && styles.tabActive]}
                  onPress={() => setIsSignUp(false)}
                  activeOpacity={0.7}
                >
                  {!isSignUp ? (
                    <LinearGradient
                      colors={['#6366f1', '#818cf8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.tabGradient}
                    >
                      <Text style={styles.tabTextActive}>تسجيل الدخول</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.tabText}>تسجيل الدخول</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, isSignUp && styles.tabActive]}
                  onPress={() => setIsSignUp(true)}
                  activeOpacity={0.7}
                >
                  {isSignUp ? (
                    <LinearGradient
                      colors={['#6366f1', '#818cf8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.tabGradient}
                    >
                      <Text style={styles.tabTextActive}>حساب جديد</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.tabText}>حساب جديد</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Welcome text */}
              <Text style={styles.formTitle}>
                {isSignUp ? 'ابدأ رحلتك في البرمجة' : 'مرحباً بعودتك'}
              </Text>

              {/* Email Input */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'email' && styles.inputWrapperFocused,
                ]}
              >
                <View style={styles.inputInner}>
                  <View
                    style={[
                      styles.inputIconBox,
                      focusedField === 'email' && styles.inputIconBoxFocused,
                    ]}
                  >
                    <Ionicons
                      name="mail"
                      size={18}
                      color={focusedField === 'email' ? '#a5b4fc' : '#4b5563'}
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      Platform.OS === 'web'
                        ? ({ outline: 'none' } as any)
                        : null,
                    ]}
                    placeholder="البريد الإلكتروني"
                    placeholderTextColor="#4b556380"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!busy}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'password' && styles.inputWrapperFocused,
                ]}
              >
                <View style={styles.inputInner}>
                  <View
                    style={[
                      styles.inputIconBox,
                      focusedField === 'password' && styles.inputIconBoxFocused,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed"
                      size={18}
                      color={
                        focusedField === 'password' ? '#a5b4fc' : '#4b5563'
                      }
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      Platform.OS === 'web'
                        ? ({ outline: 'none' } as any)
                        : null,
                    ]}
                    placeholder="كلمة المرور"
                    placeholderTextColor="#4b556380"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!busy}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={18}
                      color="#4b5563"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, busy && { opacity: 0.6 }]}
                onPress={handleEmailAuth}
                disabled={busy}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['rgb(129, 20, 237)', 'rgb(109, 40, 217)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitInner}
                >
                  {busy ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.submitText}>
                        {isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
                      </Text>
                      <Ionicons name="arrow-back" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>أو</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign In */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={busy}
                activeOpacity={0.7}
              >
                <View style={styles.googleInner}>
                  <View style={styles.googleIconBox}>
                    <Ionicons name="logo-google" size={18} color="#e2e8f0" />
                  </View>
                  <Text style={styles.googleText}>
                    {isSignUp ? 'إنشاء حساب' : 'الدخول'} بواسطة Google
                  </Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeIn.delay(600).duration(500)}
            style={styles.footer}
          >
            <Text style={styles.footerText}>بالمتابعة، أنت توافق على </Text>
            <TouchableOpacity onPress={() => router.push('/terms' as any)}>
              <Text style={styles.footerLink}>شروط الاستخدام</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}> و</Text>
            <TouchableOpacity onPress={() => router.push('/privacy' as any)}>
              <Text style={styles.footerLink}>سياسة الخصوصية</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: width < 375 ? 18 : 28,
  },

  // Background decorative orbs
  bgOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  bgOrb1: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    top: -80,
    right: -80,
  },
  bgOrb2: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    bottom: -50,
    left: -60,
  },

  // Branding
  brandingSection: {
    alignItems: 'center',
    marginBottom: height < 700 ? 24 : 36,
  },
  logoContainer: {
    width: width < 375 ? 100 : 140,
    height: width < 375 ? 100 : 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: width < 375 ? 120 : 160,
    height: width < 375 ? 120 : 160,
    borderRadius: 999,
    backgroundColor: 'rgba(99, 102, 241, 0)',
  },
  logoImage: {
    width: width < 375 ? 80 : 140,
    height: width < 375 ? 85 : 150,
    borderRadius: 22,
  },
  brandTagline: {
    fontSize: width < 375 ? 13 : 15,
    color: '#9ca3af',
    fontWeight: '500',
  },

  // Form Card
  formCard: {
    borderRadius: 24,
    padding: width < 375 ? 20 : 28,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },

  // Tab Switcher
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabActive: {},
  tabGradient: {
    width: '100%',
    paddingVertical: width < 375 ? 11 : 13,
    alignItems: 'center',
    borderRadius: 14,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    paddingVertical: width < 375 ? 11 : 13,
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  formTitle: {
    fontSize: width < 375 ? 17 : 20,
    fontWeight: '700',
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: width < 375 ? 20 : 28,
  },

  // Inputs
  inputWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  inputWrapperFocused: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width < 375 ? 14 : 16,
    paddingVertical: Platform.OS === 'ios' ? (width < 375 ? 14 : 16) : 6,
  },
  inputIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inputIconBoxFocused: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  input: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: width < 375 ? 14 : 15,
    fontWeight: '500',
    textAlign: 'right',
    paddingVertical: Platform.OS === 'web' ? 12 : 0,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 4,
  },

  // Submit Button
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: width < 375 ? 15 : 17,
    gap: 10,
    borderRadius: 16,
  },
  submitText: {
    color: '#fff',
    fontSize: width < 375 ? 15 : 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: width < 375 ? 20 : 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    color: '#4b5563',
    fontSize: 13,
    fontWeight: '500',
  },

  // Google Button
  googleButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  googleInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  googleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleText: {
    color: '#c7d2fe',
    fontSize: 15,
    fontWeight: '600',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: width < 375 ? 24 : 32,
    paddingHorizontal: 8,
  },
  footerText: {
    color: '#4b5563',
    fontSize: 12,
  },
  footerLink: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '600',
  },
});

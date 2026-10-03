/**
 * download.tsx
 *
 * صفحة تحميل التطبيق - للويب
 * تعرض زر تحميل للأندرويد + تعليمات إضافة للشاشة الرئيسية للآيفون
 * تكشف beforeinstallprompt للـ PWA على أندرويد
 * تصميم احترافي متوافق مع هوية KODAX
 *
 * زر Android يفتح صفحة Kodax على Google Play فقط (لا توجد روابط APK مباشرة).
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Kodax على Google Play — المصدر الوحيد لتحميل تطبيق Android
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.kodax.app';

// === Platform detection for web ===
function detectPlatform(): 'ios' | 'android' | 'desktop' {
  if (Platform.OS !== 'web') return Platform.OS === 'ios' ? 'ios' : 'android';
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return (
    /iP(hone|ad|od)/.test(ua) &&
    /WebKit/.test(ua) &&
    !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua)
  );
}

// المميزات
const FEATURES = [
  {
    icon: 'school' as const,
    title: 'دورات تعليمية',
    description: 'دورات برمجة شاملة بالعربية مع شهادات إنجاز',
    color: '#3b82f6',
  },
  {
    icon: 'trophy' as const,
    title: 'تحديات برمجية',
    description: 'حل تحديات بمستويات مختلفة واكسب نقاط XP',
    color: '#f59e0b',
  },
  {
    icon: 'code-slash' as const,
    title: 'محرر أكواد',
    description: 'اكتب وشغّل الأكواد مباشرة من التطبيق',
    color: '#10b981',
  },
  {
    icon: 'people' as const,
    title: 'مجتمع المبرمجين',
    description: 'شارك أكوادك وتابع مبرمجين آخرين',
    color: '#ec4899',
  },
  {
    icon: 'sparkles' as const,
    title: 'مساعد AI ذكي',
    description: 'مساعد ذكاء اصطناعي يساعدك في حل المشاكل',
    color: '#8b5cf6',
  },
  {
    icon: 'ribbon' as const,
    title: 'شارات وإنجازات',
    description: 'اجمع الشارات وتنافس في التصنيفات',
    color: '#ef4444',
  },
];

// خطوات إضافة للشاشة الرئيسية - آيفون
const IOS_STEPS = [
  {
    step: 1,
    icon: 'share-outline' as const,
    title: 'اضغط زر المشاركة',
    description: 'اضغط على أيقونة المشاركة ⬆ في شريط Safari السفلي',
  },
  {
    step: 2,
    icon: 'add-circle-outline' as const,
    title: 'أضف للشاشة الرئيسية',
    description: 'مرّر للأسفل واضغط على "إضافة إلى الشاشة الرئيسية"',
  },
  {
    step: 3,
    icon: 'checkmark-circle-outline' as const,
    title: 'تأكيد الإضافة',
    description: 'اضغط "إضافة" وسيظهر التطبيق على شاشتك الرئيسية',
  },
];

export default function DownloadPage() {
  const router = useRouter();
  const isWide = SCREEN_WIDTH > 768;
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>(
    'desktop'
  );
  const [isSafari, setIsSafari] = useState(false);
  const deferredPromptRef = useRef<any>(null);
  const [canInstallPWA, setCanInstallPWA] = useState(false);

  // ===== حماية: الموبايل لا يجب أن يرى هذه الصفحة =====
  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/(auth)/login');
      return;
    }
    setPlatform(detectPlatform());
    setIsSafari(isIOSSafari());

    // استمع لـ beforeinstallprompt (Chrome/Edge على Android)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handler = (e: any) => {
        e.preventDefault();
        deferredPromptRef.current = e;
        setCanInstallPWA(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handlePWAInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    deferredPromptRef.current = null;
    setCanInstallPWA(false);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ===== Hero ===== */}
      <LinearGradient
        colors={['#0f0f1e', '#1a1040', '#0f0f1e']}
        style={styles.heroSection}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.heroContent}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/kodax-light-trans.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.heroTitle}>KODAX</Text>
          <Text style={styles.heroSubtitle}>منصة تعليم برمجة عراقية</Text>
          <Text style={styles.heroDescription}>
            تعلّم البرمجة بالعربية من خلال دورات تفاعلية، تحديات برمجية، ومحرر
            أكواد متقدم.
            {'\n'}انضم لمجتمع المبرمجين العراقيين الآن!
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* ===== Download Section ===== */}
      <Animated.View entering={FadeInUp.delay(200).duration(600)}>
        <View style={styles.downloadSection}>
          {/* Android */}
          <View
            style={[
              styles.platformCard,
              isWide && styles.platformCardWide,
              (platform === 'android' || platform === 'desktop') &&
                styles.platformCardHighlight,
            ]}
          >
            <LinearGradient
              colors={['rgba(34,197,94,0.12)', 'rgba(34,197,94,0.03)']}
              style={styles.platformGradient}
            >
              <Ionicons name="logo-android" size={40} color="#22c55e" />
              <Text style={styles.platformTitle}>Android</Text>
              <Text style={styles.platformDesc}>
                حمّل Kodax مجاناً من Google Play واستمتع بتجربة أصلية كاملة
              </Text>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => Linking.openURL(PLAY_STORE_URL)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#22c55e', '#16a34a']}
                  style={styles.primaryBtnGradient}
                >
                  <Ionicons
                    name="logo-google-playstore"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.primaryBtnText}>
                    احصل عليه من Google Play
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {canInstallPWA && (
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={handlePWAInstall}
                  activeOpacity={0.8}
                >
                  <Ionicons name="download-outline" size={18} color="#22c55e" />
                  <Text style={styles.secondaryBtnText}>
                    تثبيت كتطبيق ويب (PWA)
                  </Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>

          {/* iPhone */}
          <View
            style={[
              styles.platformCard,
              isWide && styles.platformCardWide,
              platform === 'ios' && styles.platformCardHighlight,
            ]}
          >
            <LinearGradient
              colors={['rgba(124,58,237,0.12)', 'rgba(124,58,237,0.03)']}
              style={styles.platformGradient}
            >
              <Ionicons name="logo-apple" size={40} color="#a78bfa" />
              <Text style={styles.platformTitle}>iPhone / iPad</Text>
              <Text style={styles.platformDesc}>
                أضف التطبيق لشاشتك الرئيسية من Safari واستخدمه كتطبيق عادي
              </Text>

              {/* خطوات Add to Home Screen */}
              <View style={styles.stepsContainer}>
                {IOS_STEPS.map((s) => (
                  <View key={s.step} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>{s.step}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <View style={styles.stepHeader}>
                        <Ionicons name={s.icon} size={18} color="#a78bfa" />
                        <Text style={styles.stepTitle}>{s.title}</Text>
                      </View>
                      <Text style={styles.stepDesc}>{s.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {platform === 'ios' && !isSafari && (
                <View style={styles.safariHint}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color="#f59e0b"
                  />
                  <Text style={styles.safariHintText}>
                    افتح هذه الصفحة في Safari لإضافة التطبيق
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>
      </Animated.View>

      {/* ===== Web CTA Buttons ===== */}
      <Animated.View entering={FadeInUp.delay(300).duration(600)}>
        <View style={styles.webSection}>
          <Text style={styles.webSectionTitle}>هل لديك حساب بالفعل؟</Text>

          {/* زر تسجيل الدخول - الأبرز */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#7c3aed', '#6d28d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginBtnGradient}
            >
              <Ionicons name="log-in-outline" size={22} color="#fff" />
              <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* زر إنشاء حساب جديد */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={20} color="#a78bfa" />
            <Text style={styles.continueBtnText}>إنشاء حساب جديد</Text>
            <Ionicons name="arrow-back" size={18} color="#a78bfa" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ===== Features ===== */}
      <View
        style={[styles.featuresSection, isWide && styles.featuresSectionWide]}
      >
        <Animated.View entering={FadeInUp.delay(350).duration(600)}>
          <Text style={styles.sectionTitle}>مميزات المنصة</Text>
          <Text style={styles.sectionSubtitle}>
            كل ما تحتاجه لتعلم البرمجة في مكان واحد
          </Text>
        </Animated.View>

        <View style={[styles.featuresGrid, isWide && styles.featuresGridWide]}>
          {FEATURES.map((feature, index) => (
            <Animated.View
              key={feature.title}
              entering={FadeInUp.delay(400 + index * 80).duration(600)}
              style={[styles.featureCard, isWide && styles.featureCardWide]}
            >
              <LinearGradient
                colors={[feature.color + '20', feature.color + '08']}
                style={styles.featureGradient}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.color + '25' },
                  ]}
                >
                  <Ionicons
                    name={feature.icon as any}
                    size={28}
                    color={feature.color}
                  />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ===== Stats ===== */}
      <Animated.View entering={FadeInUp.delay(600).duration(600)}>
        <LinearGradient
          colors={['#1a1040', '#0f0f1e']}
          style={styles.statsSection}
        >
          <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>20+</Text>
              <Text style={styles.statLabel}>دورة تعليمية</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150+</Text>
              <Text style={styles.statLabel}>تحدي برمجي</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>6</Text>
              <Text style={styles.statLabel}>لغات برمجة</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>محرر أكواد</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ===== Footer ===== */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 KODAX</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1e' },
  scrollContent: { flexGrow: 1 },

  // Hero
  heroSection: {
    paddingVertical: 70,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroContent: { alignItems: 'center', maxWidth: 600 },
  logoContainer: { marginBottom: 24, alignItems: 'center' },
  logoImage: {
    width: 120,
    height: 60,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 8,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#a78bfa',
    fontWeight: '600',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
  },

  // Download
  downloadSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    gap: 20,
    ...(SCREEN_WIDTH > 768
      ? { flexDirection: 'row' as const, alignItems: 'flex-start' as const }
      : {}),
  },
  platformCard: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  platformCardWide: { width: '48%' },
  platformCardHighlight: {
    borderColor: 'rgba(124,58,237,0.3)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 30px rgba(124,58,237,0.15)' }
      : ({} as any)),
  },
  platformGradient: {
    padding: 28,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
  },
  platformTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
  },
  platformDesc: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34,197,94,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#22c55e',
  },
  releaseNotes: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
    marginTop: 4,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    backgroundColor: 'rgba(34,197,94,0.08)',
    width: '100%',
    marginTop: 4,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: '#22c55e' },

  // iOS Steps
  stepsContainer: { width: '100%', gap: 14, marginTop: 8 },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(124,58,237,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepBadgeText: { fontSize: 13, fontWeight: '800', color: '#a78bfa' },
  stepContent: { flex: 1 },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#e5e7eb' },
  stepDesc: { fontSize: 13, color: '#9ca3af', lineHeight: 20 },
  safariHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    width: '100%',
    marginTop: 4,
  },
  safariHintText: { fontSize: 12, color: '#f59e0b', flex: 1 },

  // Web CTA
  webSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 16,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  webSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 8,
  },
  // زر تسجيل الدخول الرئيسي
  loginBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 8px 32px rgba(124,58,237,0.35)' }
      : ({} as any)),
  },
  loginBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  loginBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  // زر الاستمرار الثانوي
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.4)',
    backgroundColor: 'rgba(124,58,237,0.08)',
    width: '100%',
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a78bfa',
    flex: 1,
    textAlign: 'center',
  },

  // Features
  featuresSection: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  featuresSectionWide: { paddingHorizontal: 60 },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 40,
  },
  featuresGrid: { width: '100%', maxWidth: 1200, gap: 16 },
  featuresGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureCard: { borderRadius: 20, overflow: 'hidden', width: '100%' },
  featureCardWide: { width: '30%', minWidth: 280 },
  featureGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Stats
  statsSection: { paddingVertical: 48, paddingHorizontal: 24 },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    gap: 24,
  },
  statsGridWide: { gap: 48 },
  statItem: { alignItems: 'center', minWidth: 120 },
  statNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#a78bfa',
    marginBottom: 4,
  },
  statLabel: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },

  // Footer
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  footerText: { fontSize: 13, color: '#6b7280' },
});

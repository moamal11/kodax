import { LessonDemo } from '@/features/learn/LessonDemo';
import { JourneyNode } from '@/features/rewards/JourneyVisuals';
import { BrandMark } from '@/components/ui/BrandMark';
import { AppGallery } from '@/features/download/AppGallery';
import { AndroidStoreIcon } from '@/features/download/AndroidStoreIcon';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Linking, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Button, Col, Row, Surface, useTheme, useThemePreference, useBreakpoint } from '@/design';
import { getCoursesByField, getLessonsByCourse } from '@/constants/courseData';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.kodax.app';
function detectPlatform(): 'ios' | 'android' | 'desktop' {
  if (Platform.OS !== 'web') return Platform.OS === 'ios' ? 'ios' : 'android';
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  return /android/.test(ua) ? 'android' : 'desktop';
}
function isIOSSafari() {
  return (
    typeof navigator !== 'undefined' &&
    /iP(hone|ad|od)/.test(navigator.userAgent) &&
    /WebKit/.test(navigator.userAgent) &&
    !/CriOS|FxiOS|OPiOS|EdgiOS/.test(navigator.userAgent)
  );
}
export default function DownloadPage() {
  const router = useRouter();
  const t = useTheme();
  const { ready: themeReady, setMode } = useThemePreference();
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeError, setThemeError] = useState('');
  const themeBusy = useRef(false);
  const toggleTheme = async () => {
    if (!themeReady || themeBusy.current) return;
    themeBusy.current = true; setThemeSaving(true); setThemeError('');
    try { await setMode(t.mode === 'dark' ? 'light' : 'dark'); }
    catch { setThemeError('تعذّر حفظ المظهر. حاول مرة ثانية.'); }
    finally { themeBusy.current = false; setThemeSaving(false); }
  };
  const { isDesktop, isPhone, width } = useBreakpoint();
  const stackActions = isDesktop || isPhone;
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
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

  const introduction = <Col gap={isDesktop ? 12 : 6}>
    <Text variant="display" style={{ fontSize: isDesktop ? 50 : 26, lineHeight: isDesktop ? 68 : 38 }}>
      {'أول منصة عراقية\nلتعلّم البرمجة'}
    </Text>
    <Text tone="secondary" style={{ fontSize: isDesktop ? 18 : 16, lineHeight: 28 }}>
      دروس بالعربية، محرر كود، وتحديات عملية في تطبيق واحد.
    </Text>
  </Col>;
  return (
    <Screen width="wide" contentStyle={{ paddingTop: 16 }}>
      <Col gap={isDesktop ? 48 : 28}>
        <Col gap={8}>
          <Row justify="space-between" gap={8} wrap style={{ paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: t.colors.border }}>
            <BrandMark width={isDesktop ? 156 : width < 360 ? 108 : 132} />
            <Row gap={4}>
              <Button label={t.mode === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'} variant="ghost" size="sm" disabled={!themeReady || themeSaving} loading={themeSaving} onPress={toggleTheme} />
              <Button label="تسجيل الدخول" variant="ghost" onPress={() => router.push('/(auth)/login')} />
            </Row>
          </Row>
          {!!themeError && <Text variant="bodySm" tone="danger" accessibilityLiveRegion="polite">{themeError}</Text>}
        </Col>
        <View
          style={{ flexDirection: isDesktop ? 'row-reverse' : 'column', gap: isDesktop ? 64 : 16, paddingVertical: isDesktop ? 24 : 0, alignItems: 'stretch' }}
        >
          {!isDesktop && <AppGallery compact />}
          <Col gap={isDesktop ? 18 : 12} style={{ flex: isDesktop ? 1 : undefined, minWidth: 0, justifyContent: 'center' }}>
            {isDesktop && introduction}
            <View
              style={{
                flexDirection: stackActions ? 'column' : 'row-reverse',
                gap: 8,
                alignSelf: isDesktop ? 'flex-end' : 'stretch',
                minWidth: isDesktop ? 280 : undefined,
                marginTop: 4,
              }}
            >
              <Button
                full={stackActions}
                leading={<AndroidStoreIcon />}
                label="تحميل من المتجر"
                accessibilityLabel="تحميل تطبيق Kodax من متجر Google Play"
                style={{ flex: stackActions ? undefined : 1 }}
                size="lg"
                onPress={() => Linking.openURL(PLAY_STORE_URL)}
              />
              <Button
                full={stackActions}
                icon="arrow-back"
                label="ابدأ من المتصفح"
                style={{ flex: stackActions ? undefined : 1 }}
                variant="secondary"
                size="lg"
                onPress={() => router.push({ pathname: '/(auth)/login', params: { mode: 'signup' } })}
              />
            </View>
            <Text variant="bodySm" tone="secondary">
              تقدمك محفوظ، على الموقع والتطبيق.
            </Text>
            {!isDesktop && <View style={{ marginTop: 12 }}>{introduction}</View>}
          </Col>
          {isDesktop && <View style={{ flex: 1.08, minWidth: 0 }}>
            <AppGallery />
          </View>}
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: isDesktop ? 40 : 28 }}>
          <Col gap={18} style={{ width: '100%', maxWidth: 720, alignSelf: 'center' }}>
            <Text variant="title" align="center">جرّب درسًا قبل ما تبدأ</Text>
            <LessonDemo />
          </Col>
        </View>
        <Col gap={20} style={{ borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: 28 }}>
          <Text variant="title">من أول فكرة إلى برنامج كامل</Text>
          <View style={{ flexDirection: isDesktop ? 'row-reverse' : 'column', gap: 24 }}>
            {getCoursesByField('python')
              .slice(0, 3)
              .map((c, i) => (
                <Row key={c.id} gap={14} align="flex-start" style={{ flex: isDesktop ? 1 : undefined }}>
                  <JourneyNode state="upcoming" number={i + 1} size={48} />
                  <Col flex={1} gap={4}>
                    <Text variant="heading">{c.title}</Text>
                    <Text variant="bodySm" tone="secondary">
                      {c.description}
                    </Text>
                    <Text variant="caption" tone="brand">
                      {getLessonsByCourse(c.id).length} درس
                    </Text>
                  </Col>
                </Row>
              ))}
          </View>
          <Text variant="bodySm" tone="secondary">
            هذا ترتيب دورات Python. داخل حسابك تتابع مرحلتك، وتجمع إنجازاتك من الدروس والتحديات.
          </Text>
        </Col>
        <Surface padding={isDesktop ? 28 : 20}>
          <Row gap={18} wrap justify="space-between">
            <Col gap={6} style={{ flex: 1, minWidth: 180 }}>
              <Text variant="heading">كمّل رحلتك من التطبيق</Text>
              <Text variant="bodySm" tone="secondary">تطبيق Android متاح للتحميل من المتجر.</Text>
            </Col>
            <Button label="تحميل من المتجر" leading={<AndroidStoreIcon />} size="lg" full={width < 600} onPress={() => Linking.openURL(PLAY_STORE_URL)} accessibilityLabel="تحميل تطبيق Kodax من متجر Google Play" />
          </Row>
        </Surface>
        {canInstallPWA && <Button label="إضافة اختصار للموقع" variant="ghost" onPress={handlePWAInstall} />}
        {platform === 'ios' && (
          <Surface padding={18}>
            <Col gap={8}>
              <Text variant="heading">على iPhone وiPad</Text>
              <Text tone="secondary">
                {isSafari
                  ? 'من زر المشاركة في Safari، اختر «إضافة إلى الشاشة الرئيسية»، ثم اضغط «إضافة».'
                  : 'افتح الموقع في Safari، ثم من المشاركة اختر «إضافة إلى الشاشة الرئيسية».'}
              </Text>
            </Col>
          </Surface>
        )}
        <Row gap={8} wrap style={{ borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: 16 }}>
          <Button label="الخصوصية" variant="ghost" onPress={() => router.push('/privacy')} />
          <Button label="شروط الاستخدام" variant="ghost" onPress={() => router.push('/terms')} />
          <Button label="معلومات حذف الحساب" variant="ghost" onPress={() => router.push('/account-deletion')} />
        </Row>
      </Col>
    </Screen>
  );
}

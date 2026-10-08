import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View, type RefreshControlProps, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { useTheme } from '../theme';
import { useBreakpoint } from '../hooks';
import { Text } from './Text';
import { IconButton } from './Button';
import { Row } from './Layout';

type Width = 'content' | 'reading' | 'wide' | 'full';

type ScreenProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  /** المحتوى يمرر (الافتراضي) أو ثابت (للمحادثات والمحررات) */
  scroll?: boolean;
  width?: Width;
  padded?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentStyle?: StyleProp<ViewStyle>;
  /** داخل التبويبات: الشريط السفلي يتولى المساحة السفلية */
  inTabs?: boolean;
  footer?: React.ReactNode;
  scrollProps?: ScrollViewProps;
  scrollRef?: React.Ref<ScrollView>;
};

export function Screen({ children, header, scroll = true, width = 'content', padded = true, refreshControl, contentStyle, inTabs, footer, scrollProps, scrollRef }: ScreenProps) {
  const t = useTheme();
  const { gutter } = useBreakpoint();
  const maxWidth = width === 'reading' ? t.layout.readingWidth : width === 'wide' ? 1280 : width === 'full' ? undefined : t.layout.maxContent;
  const inner: ViewStyle = { width: '100%', maxWidth, alignSelf: 'center', paddingHorizontal: padded ? gutter : 0 };
  return (
    <SafeAreaView edges={inTabs ? ['top'] : ['top', 'bottom']} style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {header}
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: inTabs ? 24 : 32 }}
          {...scrollProps}
        >
          <View style={[inner, { paddingTop: 8 }, contentStyle]}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, inner, contentStyle]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

type AppBarProps = {
  title?: string;
  subtitle?: string;
  /** يظهر زر رجوع؛ إن لم يوجد سجل تنقّل (رابط مباشر) يذهب إلى fallback */
  back?: boolean;
  fallback?: Href;
  actions?: React.ReactNode;
  /** عنصر بدل العنوان (مثل صورة واسم) */
  center?: React.ReactNode;
  large?: boolean;
  border?: boolean;
};

export function AppBar({ title, subtitle, back = true, fallback = '/', actions, center, large, border }: AppBarProps) {
  const t = useTheme();
  const router = useRouter();
  const { gutter } = useBreakpoint();
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
  };
  return (
    <View style={{ borderBottomWidth: border ? 1 : 0, borderBottomColor: t.colors.border, backgroundColor: t.colors.bg }}>
      <Row gap={8} style={{ width: '100%', maxWidth: t.layout.maxContent + gutter * 2, alignSelf: 'center', paddingHorizontal: gutter - 6, minHeight: 56, paddingVertical: 6 }}>
        {back && <IconButton icon="arrow-forward" label="رجوع" onPress={goBack} />}
        <View style={{ flex: 1, paddingHorizontal: back ? 0 : 6, gap: 0 }}>
          {center ?? (
            <>
              {!!title && (
                <Text variant={large ? 'title' : 'heading'} numberOfLines={1} accessibilityRole="header">
                  {title}
                </Text>
              )}
              {!!subtitle && (
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </>
          )}
        </View>
        {actions && <Row gap={2}>{actions}</Row>}
      </Row>
    </View>
  );
}

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** عرض النافذة على الشاشات الكبيرة */
  maxWidth?: number;
};

/** نافذة متجاوبة: ورقة من الأسفل على الهاتف، نافذة وسط على الشاشات الكبيرة */
export function Sheet({ visible, onClose, title, children, footer, maxWidth = 520 }: SheetProps) {
  const t = useTheme();
  const { isPhone } = useBreakpoint();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType={isPhone ? 'slide' : 'fade'} onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: isPhone ? 'flex-end' : 'center', alignItems: 'center', padding: isPhone ? 0 : 24 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="إغلاق" onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: t.colors.overlay }} />
          <View
            accessibilityViewIsModal
            style={{
              width: '100%',
              maxWidth: isPhone ? undefined : maxWidth,
              maxHeight: isPhone ? '88%' : '85%',
              backgroundColor: t.colors.surfaceRaised,
              borderTopLeftRadius: t.radius.lg,
              borderTopRightRadius: t.radius.lg,
              borderBottomLeftRadius: isPhone ? 0 : t.radius.lg,
              borderBottomRightRadius: isPhone ? 0 : t.radius.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              paddingBottom: isPhone ? Math.max(insets.bottom, 12) : 0,
              ...(Platform.OS === 'web' ? ({ boxShadow: '0 24px 64px rgba(0,0,0,0.35)' } as any) : { elevation: 12 }),
            }}
          >
            {isPhone && <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: t.colors.borderStrong, marginTop: 8 }} />}
            {!!title && (
              <Row gap={8} style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}>
                <Text variant="heading" style={{ flex: 1 }} accessibilityRole="header">
                  {title}
                </Text>
                <IconButton icon="close" label="إغلاق" onPress={onClose} />
              </Row>
            )}
            <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: title ? 4 : 16 }} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
            {footer && <View style={{ paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4 }}>{footer}</View>}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

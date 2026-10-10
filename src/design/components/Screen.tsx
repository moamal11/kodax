import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  DeviceEventEmitter,
  Dimensions,
  TextInput,
  useWindowDimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
  type RefreshControlProps,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { useTheme } from '../theme';
import { useBreakpoint, useReducedMotion } from '../hooks';
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

export function Screen({
  children,
  header,
  scroll = true,
  width = 'content',
  padded = true,
  refreshControl,
  contentStyle,
  inTabs,
  footer,
  scrollProps,
  scrollRef,
}: ScreenProps) {
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
      <Row
        gap={8}
        style={{
          width: '100%',
          maxWidth: t.layout.maxContent + gutter * 2,
          alignSelf: 'center',
          paddingHorizontal: gutter - 6,
          minHeight: 56,
          paddingVertical: 6,
        }}
      >
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
  dismissible?: boolean;
};

/** نافذة متجاوبة: ورقة من الأسفل على الهاتف، نافذة وسط على الشاشات الكبيرة */
export function Sheet({ visible, onClose, title, children, footer, maxWidth = 520, dismissible = true }: SheetProps) {
  const t = useTheme();
  const { isPhone } = useBreakpoint();
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const contentRef = useRef<ScrollView>(null);
  const { fontScale } = useWindowDimensions();
  const scrollOffset = useRef(0);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const keyboardTopRef = useRef<number | null>(null);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const [modalHeight, setModalHeight] = useState(Dimensions.get('screen').height);
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null);
  const keepFocusedInputVisible = React.useCallback(() => {
    if (!visible || Platform.OS !== 'android' || keyboardTopRef.current === null) return;
    clearTimeout(focusTimer.current);
    focusTimer.current = setTimeout(() => {
      const input = TextInput.State.currentlyFocusedInput();
      const viewport = contentRef.current?.getNativeScrollRef();
      if (!input || !viewport) return;
      viewport.measureInWindow((_x: number, top: number, _w: number, height: number) => {
        if (height <= 0) return;
        input.measureInWindow((_ix: number, inputTop: number, _iw: number, inputHeight: number) => {
          const bottomOverflow = inputTop + inputHeight + 8 - (top + height);
          const topOverflow = inputTop - 8 - top;
          const delta = bottomOverflow > 0 ? bottomOverflow : topOverflow < 0 ? topOverflow : 0;
          if (delta) contentRef.current?.scrollTo({ y: Math.max(0, scrollOffset.current + delta), animated: !reducedRef.current });
        });
      });
    }, 160);
  }, [visible]);
  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;
    const shown = Keyboard.addListener('keyboardDidShow', (event) => {
      keyboardTopRef.current = event.endCoordinates.screenY;
      setKeyboardTop(event.endCoordinates.screenY);
      keepFocusedInputVisible();
    });
    const hidden = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTopRef.current = null; setKeyboardTop(null); clearTimeout(focusTimer.current);
    });
    // Android may resize an already visible IME without another keyboardDidShow.
    const frame = DeviceEventEmitter.addListener('kodaxKeyboardFrame', (event: { screenY: number | null }) => {
      keyboardTopRef.current = event.screenY;
      setKeyboardTop(event.screenY);
      keepFocusedInputVisible();
    });
    return () => {
      shown.remove(); hidden.remove(); frame.remove(); clearTimeout(focusTimer.current);
      keyboardTopRef.current = null; scrollOffset.current = 0; setKeyboardTop(null);
    };
  }, [visible, keepFocusedInputVisible]);
  useEffect(() => { keepFocusedInputVisible(); }, [fontScale, keyboardTop, keepFocusedInputVisible]);
  // A transparent Android dialog may overlay the IME with edge-to-edge enabled.
  // Account only for the part still covered after the native window resizes.
  const keyboardInset = Platform.OS === 'android' && keyboardTop !== null ? Math.max(0, modalHeight - keyboardTop) : 0;
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduced ? 'none' : isPhone ? 'slide' : 'fade'}
      onRequestClose={() => {
        if (Platform.OS === 'android' && (keyboardTopRef.current !== null || Keyboard.isVisible())) {
          Keyboard.dismiss();
          return;
        }
        if (dismissible) onClose();
      }}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        onLayout={(event) => setModalHeight(event.nativeEvent.layout.height)}
        style={{ flex: 1, paddingBottom: keyboardInset }}
      >
        <View style={{ flex: 1, justifyContent: isPhone ? 'flex-end' : 'center', alignItems: 'center', padding: isPhone ? 0 : 24 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="إغلاق"
            disabled={!dismissible}
            onPress={onClose}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: t.colors.overlay }}
          />
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
              <Row gap={8} style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: t.colors.border }}>
                <Text variant="heading" style={{ flex: 1 }} accessibilityRole="header">
                  {title}
                </Text>
                {dismissible && <IconButton icon="close" label="إغلاق" onPress={onClose} />}
              </Row>
            )}
            <ScrollView
              ref={contentRef}
              onLayout={keepFocusedInputVisible}
              onContentSizeChange={keepFocusedInputVisible}
              onScroll={(event) => { scrollOffset.current = event.nativeEvent.contentOffset.y; }}
              scrollEventThrottle={16}
              style={{ flexGrow: 0, flexShrink: 1 }}
              contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 18, paddingTop: title ? 16 : 18 }}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
            {footer && <View style={{ paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4, flexShrink: 0 }}>{footer}</View>}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

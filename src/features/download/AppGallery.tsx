import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, View, type ImageSourcePropType } from 'react-native';
import { Col, Row, Text, IconButton, useTheme, useReducedMotion } from '@/design';

const slides = [
  { image: require('../../../assets/download-gallery/learn.png'), lightImage: require('../../../assets/download-gallery/light/learn.png'), title: 'مسارك، خطوة بخطوة', detail: 'مرحلتك الحالية والدرس التالي في مكان واحد.' },
  { image: require('../../../assets/download-gallery/lesson.png'), lightImage: require('../../../assets/download-gallery/light/lesson.png'), title: 'درس واضح بالعربية', detail: 'شرح وأمثلة تساعدك تفهم وتطبّق.' },
  { image: require('../../../assets/download-gallery/editor.png'), lightImage: require('../../../assets/download-gallery/light/editor.png'), title: 'اكتب كودك داخل Kodax', detail: 'محرر للكتابة والتجربة، بجانب رحلتك التعليمية.' },
  { image: require('../../../assets/download-gallery/challenges.png'), lightImage: require('../../../assets/download-gallery/light/challenges.png'), title: 'اختبر اللي تعلّمته', detail: 'تحديات برمجية تنقل الفهم إلى التطبيق.' },
  { image: require('../../../assets/download-gallery/rewards.png'), lightImage: require('../../../assets/download-gallery/light/rewards.png'), title: 'شوف إنجازاتك تتجمع', detail: 'مستويات وشارات ومكافآت تتابع بها تقدمك.' },
];
const relativePosition = (index: number, active: number) => ((index - active + 7) % 5) - 2;

function GalleryImage({ source, title, position, width, distance, reduced, onPress }: { source: ImageSourcePropType; title: string; position: number; width: number; distance: number; reduced: boolean; onPress: () => void }) {
  const t = useTheme();
  const value = useRef(new Animated.Value(position)).current;
  const previous = useRef(position);
  useEffect(() => {
    value.stopAnimation();
    if (reduced || Math.abs(previous.current - position) > 2) value.setValue(position);
    else Animated.timing(value, { toValue: position, duration: 420, useNativeDriver: true }).start();
    previous.current = position;
    return () => value.stopAnimation();
  }, [position, reduced, value]);
  return <Animated.View pointerEvents={Math.abs(position) <= 1 ? 'auto' : 'none'} style={{ position: 'absolute', top: 12, left: '50%', marginLeft: -width / 2, width, height: width * 844 / 390, zIndex: position === 0 ? 3 : Math.abs(position) === 1 ? 2 : 0,
    opacity: value.interpolate({ inputRange: [-2, -1, 0, 1, 2], outputRange: [0, 0.36, 1, 0.36, 0] }),
    transform: [{ translateX: value.interpolate({ inputRange: [-2, -1, 0, 1, 2], outputRange: [distance * 2, distance, 0, -distance, -distance * 2] }) }, { scale: value.interpolate({ inputRange: [-2, -1, 0, 1, 2], outputRange: [0.68, 0.82, 1, 0.82, 0.68] }) }],
  }}>
    <Pressable onPress={onPress} accessible={Math.abs(position) <= 1} accessibilityRole="button" accessibilityLabel={`عرض لقطة: ${title}`} style={{ flex: 1, overflow: 'hidden', borderRadius: 20, borderWidth: 1, borderColor: t.colors.borderStrong, backgroundColor: t.colors.bg }}>
      <Image source={source} resizeMode="contain" style={{ width: '100%', height: '100%' }} accessible={false} />
    </Pressable>
  </Animated.View>;
}

export function AppGallery({ compact = false }: { compact?: boolean }) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [width, setWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardWidth = Math.max(144, Math.min(compact ? 220 : 250, (width || 300) * 0.57));
  const distance = Math.min(300, (width || 300) * 0.32);
  const choose = (index: number) => { setPaused(true); setActive((index + slides.length) % slides.length); };
  useEffect(() => {
    if (paused || hovered || reduced) return;
    const interval = setInterval(() => setActive(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, [paused, hovered, reduced]);
  const current = slides[active];
  return <Col gap={compact ? 10 : 20}>
    {!compact && <Col gap={6} align="center">
      <Text variant="title" align="center" accessibilityRole="header">من داخل Kodax</Text>
      <Text tone="secondary" align="center">تعرّف على تجربة التطبيق</Text>
    </Col>}
    <View onLayout={e => setWidth(e.nativeEvent.layout.width)} {...({ onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) } as any)} style={{ width: '100%', height: cardWidth * 844 / 390 + 24, overflow: 'hidden' }}>
      {slides.map((slide, index) => <GalleryImage key={slide.title} source={t.mode === 'light' ? slide.lightImage : slide.image} title={slide.title} position={relativePosition(index, active)} width={cardWidth} distance={distance} reduced={reduced} onPress={() => choose(index)} />)}
    </View>
    <Col gap={6} align="center" style={{ minHeight: compact ? 56 : 80 }}>
      <Text variant="heading" align="center">{current.title}</Text>
      <Text variant="bodySm" tone="secondary" align="center">{current.detail}</Text>
    </Col>
    <Row justify="center" wrap gap={compact ? 2 : 8}>
      <IconButton icon="chevron-forward" label="الصورة السابقة" onPress={() => choose(active - 1)} />
      {slides.map((slide, i) => <Pressable key={slide.title} onPress={() => choose(i)} accessibilityRole="button" accessibilityLabel={`الصورة ${i + 1}: ${slide.title}`} accessibilityState={{ selected: i === active }} style={{ minWidth: compact ? 24 : 32, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: i === active ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i === active ? t.colors.brand : t.colors.borderStrong }} />
      </Pressable>)}
      <IconButton icon="chevron-back" label="الصورة التالية" onPress={() => choose(active + 1)} />
      {!reduced && <IconButton icon={paused ? 'play-outline' : 'pause-outline'} label={paused ? 'تشغيل العرض التلقائي' : 'إيقاف العرض التلقائي'} onPress={() => setPaused(p => !p)} />}
    </Row>
  </Col>;
}

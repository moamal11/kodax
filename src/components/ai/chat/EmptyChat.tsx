/** شاشة بداية المحادثة: تعريف قصير + اقتراحات أسئلة + مؤشر الكتابة */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, withSequence } from 'react-native-reanimated';
import { AssistantAvatar } from './MessageItem';
import { C, type Breakpoint } from './theme';

// اقتراحات حقيقية: بعضها يُجاب فوراً (معرفة Kodax) وبعضها يحتاج شرحاً من Gemini
export const SUGGESTIONS = [
  { icon: 'school-outline', text: 'شنو أول كورس أبدأ بيه؟' },
  { icon: 'logo-python', text: 'اشرح لي الحلقات في Python بمثال' },
  { icon: 'code-slash-outline', text: 'شنو الفرق بين let و const؟' },
  { icon: 'wallet-outline', text: 'كيف أجمع كوينات؟' },
  { icon: 'bug-outline', text: 'ليش يطلع عندي IndentationError؟' },
  { icon: 'ribbon-outline', text: 'كيف أحصل على شهادة؟' },
] as const;

export function EmptyChat({ onPick, bp }: { onPick: (t: string) => void; bp: Breakpoint }) {
  const cols = bp === 'desktop' ? 3 : 2;
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.wrap}>
      <AssistantAvatar size={bp === 'phone' ? 56 : 68} />
      <Text style={[styles.title, bp === 'phone' && { fontSize: 22 }]}>شنو نتعلم اليوم؟</Text>
      <Text style={styles.sub}>
        أعرف كل دورات ودروس وتحديات Kodax. اسألني عن البرمجة، الصق كودك حتى أصححه، أو اسأل عن التطبيق.
      </Text>
      <View style={[styles.grid, { maxWidth: cols === 3 ? 760 : 560 }]}>
        {SUGGESTIONS.map((s) => (
          <TouchableOpacity
            key={s.text}
            style={[styles.card, { width: cols === 3 ? '32%' : '48.5%' }]}
            onPress={() => onPick(s.text)}
            accessibilityRole="button"
          >
            <Ionicons name={s.icon as any} size={18} color={C.accent} />
            <Text style={styles.cardText}>{s.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.note}>
        <Ionicons name="flash" size={13} color={C.accent2} />
        <Text style={styles.noteText}>الأسئلة الشائعة عن Kodax والبرمجة تنجاوب فوراً وما تنحسب من حصتك.</Text>
      </View>
    </Animated.View>
  );
}

function Dot({ delay }: { delay: number }) {
  const o = useSharedValue(0.3);
  useEffect(() => {
    o.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 380 }), withTiming(0.3, { duration: 380 })), -1));
  }, [delay, o]);
  const st = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: (1 - o.value) * 2 }] }));
  return <Animated.View style={[styles.tDot, st]} />;
}

export function TypingIndicator({ label }: { label: string }) {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.typingRow}>
      <AssistantAvatar size={28} />
      <View style={styles.typingBubble}>
        <View style={styles.tDots}>
          <Dot delay={0} />
          <Dot delay={150} />
          <Dot delay={300} />
        </View>
        <Text style={styles.typingText}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 8, gap: 12 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 6 },
  sub: { color: C.muted, fontSize: 14.5, lineHeight: 23, textAlign: 'center', maxWidth: 520 },
  grid: { width: '100%', flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 10 },
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardText: { flex: 1, color: C.textSoft, fontSize: 13.5, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' },
  note: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 10 },
  noteText: { color: C.muted, fontSize: 12.5, textAlign: 'center', flexShrink: 1 },
  typingRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginVertical: 8 },
  typingBubble: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tDots: { flexDirection: 'row', gap: 4 },
  tDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent },
  typingText: { color: C.muted, fontSize: 13 },
});

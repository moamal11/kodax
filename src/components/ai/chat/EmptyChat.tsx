import { makeStyles } from '@/design/theme';
import { useReducedMotion } from '@/design/hooks';
/** شاشة بداية المحادثة: تعريف قصير + اقتراحات أسئلة + مؤشر الكتابة */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, withSequence, cancelAnimation } from 'react-native-reanimated';
import { AssistantAvatar } from './MessageItem';
import { useChatColors, chatColors, type Breakpoint } from './theme';

// اقتراحات حقيقية: بعضها يُجاب فوراً (معرفة Kodax) وبعضها يحتاج شرحاً من Gemini
export const SUGGESTIONS = [
  { icon: 'school-outline', text: 'شنو أول كورس أبدأ بيه؟' },
  { icon: 'logo-python', text: 'اشرح لي الحلقات في Python بمثال' },
  { icon: 'code-slash-outline', text: 'شنو الفرق بين let و const؟' },
  { icon: 'wallet-outline', text: 'كيف أجمع كوينات؟' },
  { icon: 'bug-outline', text: 'ليش يطلع عندي IndentationError؟' },
  { icon: 'ribbon-outline', text: 'كيف أحصل على شهادة؟' },
] as const;

export function EmptyChat({
  onPick,
  bp,
  lessonTitle,
  lastTitle,
  onResume,
}: {
  onPick: (t: string) => void;
  bp: Breakpoint;
  lessonTitle?: string;
  lastTitle?: string;
  onResume?: () => void;
}) {
  const C = useChatColors();
  const styles = useStyles();
  const reduced = useReducedMotion();
  const [more, setMore] = useState(false);
  const questions = lessonTitle
    ? [
        { icon: 'book-outline', text: `اشرح لي درس «${lessonTitle}» بمثال بسيط`, label: 'اشرح فكرة الدرس' },
        { icon: 'code-slash-outline', text: `اعطني تمرينًا على «${lessonTitle}» بدون الحل أولًا`, label: 'جرّبني بتمرين' },
        { icon: 'bug-outline', text: 'عندي كود ما يشتغل، شلون أحدد الخطأ؟', label: 'ساعدني أحدد الخطأ' },
      ]
    : [SUGGESTIONS[0], SUGGESTIONS[1], SUGGESTIONS[4]];
  return (
    <Animated.View
      entering={reduced ? undefined : FadeIn.duration(300)}
      style={[styles.wrap, { alignItems: 'stretch', maxWidth: 620, alignSelf: 'center', width: '100%' }]}
    >
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 14 }}>
        <AssistantAvatar size={48} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { textAlign: 'right', fontSize: bp === 'phone' ? 23 : 28 }]}>اسأل عن الكود</Text>
          <Text style={[styles.sub, { textAlign: 'right' }]}>شرح، مراجعة، أو تمرين.</Text>
        </View>
      </View>
      {lastTitle && onResume && (
        <TouchableOpacity
          onPress={onResume}
          accessibilityRole="button"
          accessibilityLabel="كمّل محادثتك الأخيرة"
          style={{ padding: 14, borderRadius: 12, backgroundColor: C.accentSoft, borderWidth: 1, borderColor: C.border, marginTop: 8 }}
        >
          <View style={{ flexDirection: 'row-reverse', gap: 10, alignItems: 'center' }}>
            <Ionicons name="chatbubble-outline" size={20} color={C.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardText, { fontFamily: 'Plex-600' }]}>كمّل محادثتك الأخيرة</Text>
              <Text numberOfLines={2} style={[styles.cardText, { color: C.muted }]}>
                {lastTitle}
              </Text>
            </View>
            <Ionicons name="arrow-back" size={18} color={C.accent} />
          </View>
        </TouchableOpacity>
      )}
      {lessonTitle && (
        <View style={{ padding: 14, borderWidth: 1, borderColor: C.border, borderRadius: 10, backgroundColor: C.surface, marginTop: 8 }}>
          <Text style={[styles.sub, { textAlign: 'right' }]}>سياق الدرس</Text>
          <Text style={[styles.cardText, { fontSize: 17, lineHeight: 27, flex: undefined, fontFamily: 'Plex-600' }]}>{lessonTitle}</Text>
        </View>
      )}
      <View style={{ gap: 0 }}>
        {questions.map((q, i) => (
          <TouchableOpacity
            key={q.text}
            accessibilityRole="button"
            accessibilityLabel={'label' in q ? q.label : q.text}
            onPress={() => onPick(q.text)}
            style={{
              flexDirection: 'row-reverse',
              gap: 12,
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
              minHeight: 52,
            }}
          >
            <Ionicons name={q.icon as any} size={20} color={C.accent} />
            <Text style={[styles.cardText, { fontSize: 15, lineHeight: 24 }]}>{'label' in q ? q.label : q.text}</Text>
            <Ionicons name="arrow-back" size={16} color={C.muted} />
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={() => setMore(!more)} style={{ minHeight: 44, justifyContent: 'center' }}>
        <Text style={[styles.cardText, { color: C.accent }]}>{more ? 'اقتراحات أقل' : 'مواضيع أخرى'}</Text>
      </TouchableOpacity>
      {more && (
        <View style={{ gap: 8 }}>
          {SUGGESTIONS.slice(2).map((q) => (
            <TouchableOpacity key={q.text} accessibilityRole="button" onPress={() => onPick(q.text)} style={[styles.card, { minHeight: 48 }]}>
              <Text style={styles.cardText}>{q.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <Text style={[styles.noteText, { textAlign: 'right', lineHeight: 21 }]}>الردود الفورية عن Kodax ما تنحسب من حصتك. راجع الكود قبل استخدامه.</Text>
    </Animated.View>
  );
}

function Dot({ delay }: { delay: number }) {
  const C = useChatColors();
  const styles = useStyles();

  const reduced = useReducedMotion();
  const o = useSharedValue(0.3);
  useEffect(() => {
    if (reduced) {
      cancelAnimation(o);
      o.value = 1;
      return;
    }
    o.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 380 }), withTiming(0.3, { duration: 380 })), -1));
    return () => cancelAnimation(o);
  }, [delay, o, reduced]);
  const st = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: (1 - o.value) * 2 }] }));
  return <Animated.View style={[styles.tDot, st]} />;
}

export function TypingIndicator({ label }: { label: string }) {
  const reduced = useReducedMotion();
  const C = useChatColors();
  const styles = useStyles();

  return (
    <Animated.View entering={reduced ? undefined : FadeIn.duration(200)} style={styles.typingRow}>
      <Ionicons name="ellipsis-horizontal" size={20} color={C.muted} />
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

const useStyles = makeStyles((t) => {
  const C = chatColors(t.colors);
  return {
    wrap: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 8, gap: 12 },
    title: { color: C.text, fontSize: 26, marginTop: 6, fontFamily: 'Plex-700' },
    sub: { color: C.muted, fontSize: 14.5, lineHeight: 23, textAlign: 'center', maxWidth: 520, fontFamily: 'Plex-400' },
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
    cardText: { flex: 1, color: C.textSoft, fontSize: 15, lineHeight: 24, textAlign: 'right', writingDirection: 'rtl', fontFamily: 'Plex-400' },
    note: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 10 },
    noteText: { color: C.muted, fontSize: 13, textAlign: 'center', flexShrink: 1, fontFamily: 'Plex-400' },
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
    typingText: { color: C.muted, fontSize: 13, fontFamily: 'Plex-400' },
  };
});

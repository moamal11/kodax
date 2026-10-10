import { makeStyles } from '@/design/theme';
/** حقل كتابة الرسالة + أوضاع المساعدة + زر الإرسال */
import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Text, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useChatColors, chatColors, isRtlText } from './theme';

export const COMPOSER_MODES = [
  { id: 'general', label: 'سؤال عام', short: 'عام', icon: 'chatbubble-ellipses-outline' },
  { id: 'explain', label: 'شرح كود', short: 'شرح', icon: 'book-outline' },
  { id: 'fix', label: 'إصلاح خطأ', short: 'إصلاح', icon: 'bug-outline' },
  { id: 'optimize', label: 'تحسين كود', short: 'تحسين', icon: 'rocket-outline' },
] as const;

interface Props {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  loading: boolean;
  mode: string;
  onModeChange: (m: string) => void;
  compact: boolean;
}

const MIN_H = 46;
const MAX_H = 150;

export function Composer({ value, onChange, onSend, loading, mode, onModeChange, compact }: Props) {
  const C = useChatColors();
  const styles = useStyles();

  const [height, setHeight] = useState(MIN_H);
  // بعد الإرسال: الحقل يرجع لارتفاعه الأصلي
  useEffect(() => {
    if (!value) setHeight(MIN_H);
  }, [value]);
  const canSend = value.trim().length > 0 && !loading;
  const rtl = !value || isRtlText(value);

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modes} style={styles.modesScroll}>
        {COMPOSER_MODES.map((m) => {
          const active = mode === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              disabled={loading}
              onPress={() => onModeChange(m.id)}
              style={[styles.modeChip, active && styles.modeChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: loading }}
            >
              <Ionicons name={m.icon as any} size={14} color={active ? C.text : C.muted} />
              <Text style={[styles.modeText, active && styles.modeTextActive]}>{compact ? m.short : m.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.box}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={mode === 'general' ? 'اسأل عن درس، كود، أو أي شي بـ Kodax…' : 'الصق الكود واكتب سؤالك…'}
          placeholderTextColor={C.muted}
          multiline
          style={[
            styles.input,
            { height: Math.min(MAX_H, Math.max(MIN_H, height)), textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' } as any,
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
          ]}
          onContentSizeChange={(e) => {
            // على الويب contentSize يشمل الحشوة أصلاً؛ إضافة أي قيمة تسبب حلقة تكبير لا نهائية
            const next = Math.min(MAX_H, Math.max(MIN_H, Math.round(e.nativeEvent.contentSize.height + (Platform.OS === 'web' ? 0 : 16))));
            setHeight((prev) => (Math.abs(prev - next) < 3 ? prev : next));
          }}
          onKeyPress={(e: any) => {
            // الويب: Enter يرسل، Shift+Enter سطر جديد
            if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
              e.preventDefault?.();
              if (canSend) onSend();
            }
          }}
          maxLength={8000}
          editable={!loading}
          accessibilityLabel="رسالة للمساعد"
        />
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onSend}
          disabled={!canSend}
          accessibilityLabel="إرسال"
          accessibilityState={{ disabled: !canSend }}
          style={styles.sendTouch}
        >
          <LinearGradient colors={canSend ? [C.userA, C.userB] : [C.surfaceStrong, C.surfaceStrong]} style={styles.send}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="arrow-up" size={22} color={canSend ? '#fff' : C.muted} />}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => {
  const C = chatColors(t.colors);
  return {
    wrap: { gap: 8 },
    modesScroll: { flexGrow: 0 },
    modes: { flexDirection: 'row-reverse', gap: 6, paddingHorizontal: 2 },
    modeChip: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 11,
      minHeight: 44,
      borderRadius: 16,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
    },
    modeChipActive: { backgroundColor: C.accentSoft, borderColor: C.borderStrong },
    modeText: { color: C.muted, fontSize: 14, fontFamily: 'Plex-400' },
    modeTextActive: { color: C.text, fontFamily: 'Plex-600' },
    box: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      backgroundColor: C.surfaceStrong,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: C.borderStrong,
      paddingLeft: 6,
      paddingRight: 14,
      paddingVertical: 6,
    },
    input: {
      flex: 1,
      color: C.text,
      fontSize: 15.5,
      lineHeight: 22,
      paddingTop: Platform.OS === 'web' ? 12 : 11,
      paddingBottom: Platform.OS === 'web' ? 10 : 11,
      fontFamily: 'Plex-400',
    },
    sendTouch: { marginBottom: 1 },
    send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    disclaimer: { color: C.muted, fontSize: 12, textAlign: 'center', fontFamily: 'Plex-400' },
  };
});

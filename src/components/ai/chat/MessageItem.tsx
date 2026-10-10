import { useReducedMotion } from '@/design/hooks';
import { AssistantIcon } from '../AssistantIcon';
import { makeStyles } from '@/design/theme';
/** رسالة واحدة في محادثة المساعد */
import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChatMarkdown } from './ChatMarkdown';
import { useChatColors, chatColors } from './theme';

export interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  /** مصدر رد المساعد (للرسائل الجديدة فقط) */
  source?: 'smart' | 'cache' | 'gemini';
  /** لرسائل الخطأ: هل انتهت الحصة */
  quotaExceeded?: boolean;
  /** لإعادة إرسال الرسالة بعد الخطأ */
  retryText?: string;
}

interface Props {
  message: UIMessage;
  compact: boolean;
  onRetry?: (text: string) => void;
  onWatchAd?: () => void;
  canWatchAd?: boolean;
}

export const AssistantAvatar = ({ size = 32 }: { size?: number }) => {
  const C = useChatColors();
  const styles = useStyles();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }]}>
      <AssistantIcon size={size * 0.56} color={C.accent} />
    </View>
  );
};

function MessageItemImpl({ message, compact, onRetry, onWatchAd, canWatchAd }: Props) {
  const C = useChatColors();
  const styles = useStyles();

  const reduced = useReducedMotion();
  const [copied, setCopied] = useState(false);

  if (message.role === 'user') {
    return (
      <Animated.View entering={reduced ? undefined : FadeInDown.duration(220)} style={styles.userRow}>
        <LinearGradient
          colors={[C.userA, C.userB]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.userBubble, { maxWidth: compact ? '88%' : '78%' }]}
        >
          <ChatMarkdown content={message.content} variant="user" compact />
        </LinearGradient>
      </Animated.View>
    );
  }

  if (message.role === 'error') {
    return (
      <Animated.View entering={reduced ? undefined : FadeInDown.duration(220)} style={styles.errorCard}>
        <View style={styles.errorHead}>
          <Ionicons
            name={message.quotaExceeded ? 'hourglass-outline' : 'alert-circle-outline'}
            size={18}
            color={message.quotaExceeded ? C.warning : C.danger}
          />
          <Text style={[styles.errorText, { color: message.quotaExceeded ? C.warning : C.danger }]}>{message.content}</Text>
        </View>
        <View style={styles.errorActions}>
          {message.quotaExceeded && canWatchAd && onWatchAd && (
            <TouchableOpacity accessibilityRole="button" style={[styles.errBtn, styles.errBtnAccent]} onPress={onWatchAd}>
              <Ionicons name="play-circle-outline" size={16} color="#fff" />
              <Text style={[styles.errBtnText, { color: '#fff' }]}>شاهد إعلانات لزيادة الحصة</Text>
            </TouchableOpacity>
          )}
          {!message.quotaExceeded && message.retryText && onRetry && (
            <TouchableOpacity accessibilityRole="button" style={styles.errBtn} accessibilityLabel="إعادة المحاولة" onPress={() => onRetry(message.retryText!)}>
              <Ionicons name="refresh" size={16} color={C.text} />
              <Text style={styles.errBtnText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  }

  const instant = message.source === 'smart' || message.source === 'cache';
  const copy = async () => {
    await Clipboard.setStringAsync(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Animated.View entering={reduced ? undefined : FadeInDown.duration(260)} style={styles.assistantRow}>
      <View style={styles.assistantBody}>
        <View style={[styles.assistantCard, compact && styles.assistantCardCompact]}>
          <ChatMarkdown content={message.content} compact={compact} />
        </View>
        <View style={styles.metaRow}>
          <TouchableOpacity accessibilityRole="button" onPress={copy} style={styles.metaBtn} accessibilityLabel="نسخ الرد">
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color={copied ? C.success : C.muted} />
            <Text style={[styles.metaText, copied && { color: C.success }]}>{copied ? 'تم النسخ' : 'نسخ'}</Text>
          </TouchableOpacity>
          {instant && (
            <View style={styles.instant}>
              <Ionicons name="flash" size={12} color={C.accent2} />
              <Text style={styles.instantText}>{message.source === 'cache' ? 'إجابة محفوظة' : 'رد فوري'} · لا يُحسب من الحصة</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export const MessageItem = memo(MessageItemImpl);

const useStyles = makeStyles((t) => {
  const C = chatColors(t.colors);
  return {
    userRow: { flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 6 },
    userBubble: {
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: 20,
      borderBottomRightRadius: 6,
      shadowColor: C.userA,
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    assistantRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10, marginVertical: 8 },
    avatar: { alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    assistantBody: { flex: 1, minWidth: 0 },
    assistantCard: {
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 18,
      borderTopRightRadius: 6,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    assistantCardCompact: { paddingHorizontal: 13, paddingVertical: 12 },
    metaRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginTop: 6, paddingHorizontal: 4, flexWrap: 'wrap' },
    metaBtn: { minHeight: 44, flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 2 },
    metaText: { color: C.muted, fontSize: 12, fontFamily: 'Plex-400' },
    instant: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
    instantText: { color: C.muted, fontSize: 11.5, fontFamily: 'Plex-400' },
    errorCard: {
      marginVertical: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(248,113,113,0.3)',
      backgroundColor: 'rgba(248,113,113,0.08)',
      padding: 14,
      gap: 10,
    },
    errorHead: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 8 },
    errorText: { flex: 1, fontSize: 14.5, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl', fontFamily: 'Plex-400' },
    errorActions: { flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' },
    errBtn: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: C.surfaceStrong,
      minHeight: 40,
    },
    errBtnAccent: { backgroundColor: C.userA },
    errBtnText: { color: C.text, fontSize: 13.5, fontFamily: 'Plex-600' },
  };
});

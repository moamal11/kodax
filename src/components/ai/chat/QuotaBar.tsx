import { makeStyles } from '@/design/theme';
/** مؤشر حصة Gemini اليومية + زر زيادة الحصة بالإعلانات المكافئة */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AIQuota } from '@/services/coinService';
import { useChatColors, chatColors } from './theme';

interface Props {
  quota: AIQuota | null;
  adsSupported: boolean;
  adLoading: boolean;
  onWatchAd: () => void;
  compact: boolean;
}

export function QuotaBar({ quota, adsSupported, adLoading, onWatchAd, compact }: Props) {
  const C = useChatColors();
  const styles = useStyles();

  if (!quota) return null;
  const ratio = quota.limit > 0 ? Math.min(1, quota.used / quota.limit) : 1;
  const low = quota.remaining <= 2;
  const barColor = quota.remaining === 0 ? C.danger : low ? C.warning : C.accent;
  const showAd = adsSupported && quota.ads.can_watch;

  return (
    <View style={styles.row}>
      <View style={styles.pill} accessible accessibilityLabel={`متبقي ${quota.remaining} طلبات اليوم؛ استخدمت ${quota.used} من ${quota.limit}`} >
        <View style={styles.pillTop}>
          <Ionicons name="chatbubble-outline" size={13} color={barColor} />
          <Text style={styles.pillText}>متبقي <Text style={styles.pillNum}>{quota.remaining}</Text> {compact?'سؤال':'سؤال اليوم'}</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: barColor }]} />
        </View>
      </View>
      {showAd && (
        <TouchableOpacity accessibilityRole="button" style={styles.adBtn} onPress={onWatchAd} disabled={adLoading} accessibilityLabel="شاهد إعلانات لزيادة حصة الذكاء">
          {adLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="play-circle" size={16} color="#fff" />
              <Text style={styles.adText}>+{quota.ads.bonus_amount}</Text>
              <View style={styles.dots}>
                {Array.from({ length: quota.ads.per_bonus }).map((_, i) => (
                  <View key={i} style={[styles.dot, i < quota.ads.progress && styles.dotOn]} />
                ))}
              </View>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => { const C = chatColors(t.colors); return {
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 78,
    gap: 5,
  },
  pillTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, justifyContent: 'center' },
  pillText: { color: C.textSoft, fontSize: 12.5, fontFamily: 'Plex-400' },
  pillNum: { color: C.text, fontFamily: 'Plex-700' },
  pillMuted: { color: C.muted },
  track: { height: 3, borderRadius: 2, backgroundColor: C.border, overflow: 'hidden' },
  fill: { height: 3, borderRadius: 2 },
  adBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: C.userA,
  },
  adText: { color: '#fff',  fontSize: 13, fontFamily: 'Plex-700' },
  dots: { flexDirection: 'row-reverse', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotOn: { backgroundColor: '#fff' },
}; });

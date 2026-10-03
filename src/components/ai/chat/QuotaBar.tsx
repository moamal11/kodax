/** مؤشر حصة Gemini اليومية + زر زيادة الحصة بالإعلانات المكافئة */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AIQuota } from '@/services/coinService';
import { C } from './theme';

interface Props {
  quota: AIQuota | null;
  adsSupported: boolean;
  adLoading: boolean;
  onWatchAd: () => void;
  compact: boolean;
}

export function QuotaBar({ quota, adsSupported, adLoading, onWatchAd, compact }: Props) {
  if (!quota) return null;
  const ratio = quota.limit > 0 ? Math.min(1, quota.used / quota.limit) : 1;
  const low = quota.remaining <= 2;
  const barColor = quota.remaining === 0 ? C.danger : low ? C.warning : C.accent;
  const showAd = adsSupported && quota.ads.can_watch;

  return (
    <View style={styles.row}>
      <View style={styles.pill} accessibilityLabel={`استخدمت ${quota.used} من ${quota.limit} طلبات ذكاء اليوم`}>
        <View style={styles.pillTop}>
          <Ionicons name="sparkles" size={13} color={barColor} />
          <Text style={styles.pillText}>
            {compact ? '' : 'استخدمت '}
            <Text style={styles.pillNum}>{quota.used}</Text>
            <Text style={styles.pillMuted}> / {quota.limit}</Text>
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: barColor }]} />
        </View>
      </View>
      {showAd && (
        <TouchableOpacity style={styles.adBtn} onPress={onWatchAd} disabled={adLoading} accessibilityLabel="شاهد إعلانات لزيادة حصة الذكاء">
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

const styles = StyleSheet.create({
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
  pillText: { color: C.textSoft, fontSize: 12.5 },
  pillNum: { color: '#fff', fontWeight: '700' },
  pillMuted: { color: C.muted },
  track: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  fill: { height: 3, borderRadius: 2 },
  adBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: C.userA,
  },
  adText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  dots: { flexDirection: 'row-reverse', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotOn: { backgroundColor: '#fff' },
});

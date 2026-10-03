/**
 * نافذة الفتح المبكر لدورة بالكوينات (اختصار اختياري — الدورة تُفتح مجاناً بالتقدم في المسار)
 *
 * - إذا كان الرصيد كافياً: زر "فتح مبكر".
 * - إذا لم يكن كافياً: لا إعلان ولا ضغط في هذه اللحظة — فقط تذكير بأن التعلم يفتحها مجاناً.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useCoins } from '@/contexts/CoinsContext';
import { coinMessage } from '@/services/coinService';
import { showToast } from '@/components/ui/Toast';
import { CoinIcon, COIN_COLORS } from './CoinIcon';

const { height } = Dimensions.get('window');

interface UnlockWithCoinsModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  /** السعر المحلي (احتياطي) — السعر الفعلي يأتي من السيرفر */
  cost: number;
  onUnlocked?: () => void;
}

export default function UnlockWithCoinsModal({
  visible,
  onClose,
  courseId,
  courseName,
  cost: fallbackCost,
  onUnlocked,
}: UnlockWithCoinsModalProps) {
  const router = useRouter();
  const {
    balance,
    state,
    getCourseCost,
    unlockCourse,
    watchAd,
    adsSupported,
    isCourseUnlocked,
  } = useCoins();

  const [busy, setBusy] = useState<'unlock' | 'ad' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const cost = getCourseCost(courseId, fallbackCost);
  const needed = Math.max(0, cost - balance);
  const canAfford = needed === 0;
  const alreadyUnlocked = isCourseUnlocked(courseId);
  const adReward = state?.ads.reward ?? 15;
  const adsLeft = state ? state.ads.limit - state.ads.watchedToday : 1;

  useEffect(() => {
    if (visible) {
      setError(null);
      setDone(false);
    }
  }, [visible]);

  const handleUnlock = async () => {
    setBusy('unlock');
    setError(null);
    const res = await unlockCourse(courseId);
    setBusy(null);
    if (res.success) {
      setDone(true);
      onUnlocked?.();
      setTimeout(() => {
        setDone(false);
        onClose();
      }, 1400);
    } else {
      setError(coinMessage(res.code, res));
    }
  };

  const handleWatchAd = async () => {
    setBusy('ad');
    setError(null);
    const res = await watchAd();
    setBusy(null);
    if (res.success) {
      const total = (res.reward ?? 0) + (res.bonus ?? 0);
      showToast.success(
        res.bonus
          ? `+${total} كوين (تضمنت مكافأة تحدي الإعلانات!)`
          : `+${total} كوين`
      );
    } else if (res.message) {
      setError(res.message);
    }
  };

  const goEarn = () => {
    onClose();
    router.push('/rewards' as any);
  };

  if (done) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.successBackdrop}>
          <Animated.View
            entering={FadeInUp.springify()}
            style={styles.successBox}
          >
            <View style={styles.successIcon}>
              <Ionicons name="lock-open" size={48} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>تم فتح الدورة!</Text>
            <Text style={styles.successText}>{courseName}</Text>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="إغلاق"
        />
        <Animated.View entering={FadeInUp.springify()} style={styles.sheet}>
          <LinearGradient
            colors={['#1A1A2E', '#16213E']}
            style={styles.gradient}
          >
            <View style={styles.handle} />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.header}>
              <LinearGradient
                colors={['#8B5CF6', '#3B82F6']}
                style={styles.headerIcon}
              >
                <Ionicons
                  name={alreadyUnlocked ? 'lock-open' : 'lock-closed'}
                  size={28}
                  color="#FFF"
                />
              </LinearGradient>
              <Text style={styles.title}>{courseName}</Text>
              <Text style={styles.subtitle}>
                فتح مبكر اختياري — الدورة تُفتح مجاناً بالتقدم في المسار
              </Text>
            </View>

            <ScrollView
              style={{ maxHeight: height * 0.5 }}
              showsVerticalScrollIndicator={false}
            >
              {/* الرصيد والتكلفة */}
              <View style={styles.row}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>رصيدك</Text>
                  <View style={styles.statValueRow}>
                    <CoinIcon size={20} />
                    <Text style={styles.statValue}>
                      {balance.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View
                  style={[styles.statCard, !canAfford && styles.statCardWarn]}
                >
                  <Text style={styles.statLabel}>تكلفة الفتح</Text>
                  <View style={styles.statValueRow}>
                    <CoinIcon size={20} />
                    <Text style={styles.statValue}>
                      {cost.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* ماذا ستحصل */}
              <View style={styles.benefits}>
                {[
                  { icon: 'play-circle', text: 'جميع دروس الدورة' },
                  { icon: 'code-slash', text: 'التحديات المرتبطة بها' },
                  { icon: 'flash', text: 'XP إضافي ومكافأة عند الإكمال' },
                  { icon: 'infinite', text: 'مفتوحة لك للأبد' },
                ].map((b, i) => (
                  <Animated.View
                    key={b.text}
                    entering={FadeInDown.delay(i * 60)}
                    style={styles.benefit}
                  >
                    <Ionicons name={b.icon as any} size={18} color="#10B981" />
                    <Text style={styles.benefitText}>{b.text}</Text>
                  </Animated.View>
                ))}
              </View>

              {/* رصيد غير كافٍ — طرق مجانية فقط */}
              {!canAfford && !alreadyUnlocked && (
                <View style={styles.needBox}>
                  <Text style={styles.needTitle}>
                    رصيدك لا يكفي للفتح المبكر (ينقصك {needed.toLocaleString()} كوين)
                  </Text>
                  <Text style={styles.needText}>
                    لا تحتاج الكوينات للتعلم: تابع الدورة السابقة في المسار وتُفتح
                    هذه الدورة تلقائياً ومجاناً.
                  </Text>
                </View>
              )}

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons
                    name="information-circle"
                    size={18}
                    color="#F87171"
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </ScrollView>

            {/* الأزرار */}
            {alreadyUnlocked ? (
              <TouchableOpacity onPress={onClose} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                  <Text style={styles.primaryText}>الدورة مفتوحة</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : canAfford ? (
              <TouchableOpacity
                onPress={handleUnlock}
                disabled={busy !== null}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#10B981', '#3B82F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  {busy === 'unlock' ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="lock-open" size={22} color="#FFF" />
                      <Text style={styles.primaryText}>
                        فتح مبكر ({cost.toLocaleString()} كوين)
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={{ gap: 10 }}>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.secondaryBtn}
                  activeOpacity={0.85}
                >
                  <Ionicons name="school" size={20} color="#A78BFA" />
                  <Text style={styles.secondaryText}>
                    حسناً، سأتابع التعلم
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: height * 0.9,
  },
  gradient: { padding: 20, paddingBottom: 32 },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
    zIndex: 10,
  },
  header: { alignItems: 'center', marginBottom: 18 },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: COIN_COLORS.bg,
    borderWidth: 1,
    borderColor: COIN_COLORS.border,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  statCardWarn: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  statLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 6 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  benefits: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitText: { color: '#E5E7EB', fontSize: 14, flex: 1, textAlign: 'right' },
  needBox: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderColor: 'rgba(139,92,246,0.3)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  needTitle: {
    color: '#C4B5FD',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  needText: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: '#FCA5A5', fontSize: 13, flex: 1, textAlign: 'right' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    minHeight: 54,
  },
  primaryText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.4)',
    backgroundColor: 'rgba(139,92,246,0.1)',
  },
  secondaryText: { color: '#C4B5FD', fontSize: 15, fontWeight: '700' },
  successBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBox: { alignItems: 'center' },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: { color: '#10B981', fontSize: 24, fontWeight: '800' },
  successText: { color: '#9CA3AF', fontSize: 15, marginTop: 6 },
});

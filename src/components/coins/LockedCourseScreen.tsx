/**
 * شاشة الدورة التي لم تُفتح بعد — تُستخدم في صفحة الدورة وصفحة الدرس
 *
 * التعلم مجاني: الدورة تُفتح تلقائياً عند التقدم في الدورة السابقة من نفس المسار
 * (السيرفر يحسب ذلك). الدرس الأول متاح كمعاينة. الكوينات = فتح مبكر اختياري فقط.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  ALL_COURSES,
  Course,
  FULL_FIELD_DISCOUNT,
  getFieldRemainingPrice,
  getLessonsByCourse,
  getLockedPaidCourses,
} from '@/constants/courseData';
import { useCoins } from '@/contexts/CoinsContext';
import { coinMessage, coinService, type CourseAccess } from '@/services/coinService';
import { showToast } from '@/components/ui/Toast';
import { CoinIcon, COIN_COLORS } from './CoinIcon';
import { CoinBalance } from './CoinBalance';
import UnlockWithCoinsModal from './UnlockWithCoinsModal';

const DIFFICULTY_LABEL: Record<Course['difficulty'], string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

interface LockedCourseScreenProps {
  course: Course;
  onBack: () => void;
  /** يظهر عندما يحاول المستخدم فتح درس مقفل مباشرة */
  lockedLessonTitle?: string;
}

/** معرّف درس المعاينة المجانية (أول درس في الدورة) */
export function getPreviewLessonId(courseId: string): string | undefined {
  const lessons = getLessonsByCourse(courseId);
  if (lessons.length === 0) return undefined;
  return [...lessons].sort((a, b) => a.order - b.order)[0].id;
}

export default function LockedCourseScreen({
  course,
  onBack,
  lockedLessonTitle,
}: LockedCourseScreenProps) {
  const router = useRouter();
  const { balance, unlockedCourses, getCourseCost, unlockField } = useCoins();
  const [showUnlock, setShowUnlock] = useState(false);
  const [bundleBusy, setBundleBusy] = useState(false);
  const [bundleError, setBundleError] = useState<string | null>(null);
  const [access, setAccess] = useState<CourseAccess | null>(null);

  // متطلب الدورة وتقدم المستخدم فيه (من السيرفر)
  useEffect(() => {
    let alive = true;
    coinService.getProgressState().then((s) => {
      if (alive) setAccess(s?.courses.find((c) => c.course_id === course.id) ?? null);
    });
    return () => {
      alive = false;
    };
  }, [course.id]);
  const prereqCourse = useMemo(
    () => ALL_COURSES.find((c) => c.id === access?.requires_course_id) ?? null,
    [access?.requires_course_id]
  );
  const requiredPct = Math.round((access?.required_ratio ?? 0.7) * 100);
  const prereqPct = Math.min(100, Math.round((access?.prereq_progress ?? 0) * 100));

  const lessons = useMemo(
    () => [...getLessonsByCourse(course.id)].sort((a, b) => a.order - b.order),
    [course.id]
  );
  const previewId = lessons[0]?.id;
  const cost = getCourseCost(course.id, course.pointsCost);

  const lockedInField = useMemo(
    () => getLockedPaidCourses(course.fieldId, unlockedCourses),
    [course.fieldId, unlockedCourses]
  );
  const fieldPricing = useMemo(
    () => getFieldRemainingPrice(course.fieldId, unlockedCourses),
    [course.fieldId, unlockedCourses]
  );
  const showBundle = lockedInField.length > 1 && fieldPricing.remaining > cost;
  const bundleNeeded = Math.max(0, fieldPricing.discountedRemaining - balance);

  const handleBundle = async () => {
    setBundleBusy(true);
    setBundleError(null);
    const res = await unlockField(course.fieldId);
    setBundleBusy(false);
    if (res.success) {
      showToast.success('تم فتح كل دورات المسار! 🎉');
    } else {
      setBundleError(coinMessage(res.code, res));
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            accessibilityLabel="رجوع"
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الخطوة التالية في المسار</Text>
          <CoinBalance size="small" />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            {/* معلومات الدورة */}
            <Animated.View
              entering={FadeInDown.duration(350)}
              style={styles.hero}
            >
              <View
                style={[
                  styles.courseIcon,
                  { backgroundColor: `${course.color}30` },
                ]}
              >
                <Ionicons
                  name={(course.icon || 'book') as any}
                  size={36}
                  color={course.color}
                />
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={12} color="#fff" />
                </View>
              </View>
              <Text style={styles.title}>{course.title}</Text>
              <Text style={styles.desc}>{course.description}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Ionicons name="book-outline" size={14} color="#9ca3af" />
                  <Text style={styles.metaText}>{lessons.length} درس</Text>
                </View>
                <View style={styles.metaChip}>
                  <Ionicons name="flash" size={14} color="#fbbf24" />
                  <Text style={styles.metaText}>{course.totalXP} XP</Text>
                </View>
                <View style={styles.metaChip}>
                  <Ionicons
                    name="speedometer-outline"
                    size={14}
                    color="#9ca3af"
                  />
                  <Text style={styles.metaText}>
                    {DIFFICULTY_LABEL[course.difficulty]}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {lockedLessonTitle && (
              <View style={styles.notice}>
                <Ionicons name="information-circle" size={18} color="#93C5FD" />
                <Text style={styles.noticeText}>
                  درس «{lockedLessonTitle}» جزء من هذه الدورة، وتُفتح مجاناً
                  بالتقدم في المسار.
                </Text>
              </View>
            )}

            {/* الطريق المجاني: التقدم في الدورة السابقة */}
            {prereqCourse && (
              <Animated.View entering={FadeInDown.delay(40).duration(350)} style={styles.pathCard}>
                <View style={styles.bundleHeader}>
                  <Ionicons name="school" size={20} color="#34D399" />
                  <Text style={styles.pathTitle}>تُفتح مجاناً بالتعلم</Text>
                </View>
                <Text style={styles.pathText}>
                  أكمل {requiredPct}% من «{prereqCourse.title}» وتُفتح هذه الدورة
                  تلقائياً. تقدّمك الآن: {prereqPct}%
                </Text>
                <View style={styles.pathBar}>
                  <View style={[styles.pathFill, { width: `${Math.min(100, (prereqPct / Math.max(1, requiredPct)) * 100)}%` }]} />
                </View>
                <TouchableOpacity
                  style={styles.bundleBtn}
                  onPress={() => router.push(`/course/${prereqCourse.id}` as any)}
                >
                  <Text style={styles.bundleBtnText}>تابع «{prereqCourse.title}»</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* اختصار اختياري: فتح مبكر بالكوينات */}
            <Animated.View entering={FadeInDown.delay(80).duration(350)}>
              <TouchableOpacity
                onPress={() => setShowUnlock(true)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#6D28D9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.unlockCard}
                >
                  <View style={styles.unlockIcon}>
                    <Ionicons name="lock-open" size={24} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.unlockTitle}>
                      فتح مبكر بالكوينات (اختياري)
                    </Text>
                    <View style={styles.unlockCostRow}>
                      <CoinIcon size={16} />
                      <Text style={styles.unlockCost}>
                        {cost.toLocaleString()} كوين
                      </Text>
                      {balance < cost && (
                        <Text style={styles.unlockNeed}>
                          (ينقصك {(cost - balance).toLocaleString()})
                        </Text>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-back" size={22} color="#ffffff90" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* فتح المسار كاملاً بخصم */}
            {showBundle && (
              <Animated.View
                entering={FadeInDown.delay(140).duration(350)}
                style={styles.bundle}
              >
                <View style={styles.bundleHeader}>
                  <Ionicons name="layers" size={20} color="#10B981" />
                  <Text style={styles.bundleTitle}>
                    فتح مبكر لكل دورات المسار ({lockedInField.length}) — وفّر{' '}
                    {Math.round(FULL_FIELD_DISCOUNT * 100)}%
                  </Text>
                </View>
                <View style={styles.bundlePriceRow}>
                  <Text style={styles.bundleOld}>
                    {fieldPricing.remaining.toLocaleString()}
                  </Text>
                  <CoinIcon size={16} />
                  <Text style={styles.bundlePrice}>
                    {fieldPricing.discountedRemaining.toLocaleString()} كوين
                  </Text>
                </View>
                {lockedInField.map((c) => (
                  <View key={c.id} style={styles.bundleItem}>
                    <Ionicons
                      name={(c.icon || 'book') as any}
                      size={16}
                      color={c.color}
                    />
                    <Text style={styles.bundleItemText}>{c.title}</Text>
                  </View>
                ))}
                {bundleError && (
                  <Text style={styles.errorText}>{bundleError}</Text>
                )}
                {bundleNeeded > 0 ? (
                  <View style={styles.bundleBtnMuted}>
                    <Text style={styles.bundleBtnMutedText}>
                      رصيدك لا يكفي للفتح المبكر — التعلم يفتح الدورات مجاناً
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.bundleBtn}
                    onPress={handleBundle}
                    disabled={bundleBusy}
                  >
                    {bundleBusy ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.bundleBtnText}>
                        افتح المسار كاملاً
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}

            {/* محتوى الدورة + معاينة مجانية */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(350)}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>محتوى الدورة</Text>
              {lessons.map((l, i) => {
                const isPreview = l.id === previewId;
                return (
                  <TouchableOpacity
                    key={l.id}
                    disabled={!isPreview}
                    onPress={() => router.push(`/lesson/${l.id}` as any)}
                    style={[
                      styles.lessonRow,
                      isPreview && styles.lessonRowPreview,
                    ]}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.lessonNum,
                        isPreview && styles.lessonNumPreview,
                      ]}
                    >
                      {isPreview ? (
                        <Ionicons name="play" size={12} color="#fff" />
                      ) : (
                        <Text style={styles.lessonNumText}>{i + 1}</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.lessonTitle,
                        !isPreview && styles.lessonTitleLocked,
                      ]}
                      numberOfLines={1}
                    >
                      {l.title}
                    </Text>
                    {isPreview ? (
                      <View style={styles.previewTag}>
                        <Text style={styles.previewTagText}>معاينة مجانية</Text>
                      </View>
                    ) : (
                      <Ionicons name="lock-closed" size={14} color="#4B5563" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </Animated.View>

            <View style={styles.freeNote}>
              <Ionicons
                name="gift-outline"
                size={18}
                color={COIN_COLORS.text}
              />
              <Text style={styles.freeNoteText}>
                التعلم في Kodax مجاني بالكامل. الكوينات اختصار اختياري فقط.
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      <UnlockWithCoinsModal
        visible={showUnlock}
        onClose={() => setShowUnlock(false)}
        courseId={course.id}
        courseName={course.title}
        cost={course.pointsCost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pathCard: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.35)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    gap: 10,
  },
  pathTitle: { color: '#A7F3D0', fontSize: 16, fontWeight: '700' },
  pathText: { color: '#D1FAE5', fontSize: 14, lineHeight: 22, textAlign: 'right' },
  pathBar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  pathFill: { height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  container: { flex: 1, backgroundColor: '#0f0f1e' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  inner: { width: '100%', maxWidth: 640, alignSelf: 'center', gap: 14 },
  hero: { alignItems: 'center', paddingVertical: 12 },
  courseIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  lockBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6D28D9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0f0f1e',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  desc: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  metaText: { color: '#D1D5DB', fontSize: 13 },
  notice: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  noticeText: { color: '#BFDBFE', fontSize: 13, flex: 1, textAlign: 'right' },
  unlockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
  },
  unlockIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  unlockCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  unlockCost: { color: '#FDE68A', fontSize: 15, fontWeight: '700' },
  unlockNeed: { color: '#DDD6FE', fontSize: 12 },
  bundle: {
    backgroundColor: 'rgba(16,185,129,0.07)',
    borderColor: 'rgba(16,185,129,0.25)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  bundleHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  bundleTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  bundlePriceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  bundleOld: {
    color: '#6B7280',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  bundlePrice: { color: '#6EE7B7', fontSize: 16, fontWeight: '800' },
  bundleItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  bundleItemText: { color: '#D1D5DB', fontSize: 13, textAlign: 'right' },
  bundleBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  bundleBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  bundleBtnMuted: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  bundleBtnMutedText: { color: '#A7F3D0', fontWeight: '600', fontSize: 13 },
  errorText: { color: '#FCA5A5', fontSize: 13, textAlign: 'right' },
  card: {
    backgroundColor: '#1a1a3e',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'right',
  },
  lessonRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  lessonRowPreview: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  lessonNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumPreview: { backgroundColor: '#10B981' },
  lessonNumText: { color: '#9CA3AF', fontSize: 12, fontWeight: '700' },
  lessonTitle: { color: '#E5E7EB', fontSize: 14, flex: 1, textAlign: 'right' },
  lessonTitleLocked: { color: '#6B7280' },
  previewTag: {
    backgroundColor: '#10B98125',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  previewTagText: { color: '#6EE7B7', fontSize: 11, fontWeight: '700' },
  freeNote: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  freeNoteText: {
    color: '#9CA3AF',
    fontSize: 12.5,
    textAlign: 'center',
    flexShrink: 1,
  },
});

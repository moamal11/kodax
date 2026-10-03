import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/ui/GlassCard';
import { XPBar } from '@/components/gamification/XPBar';
import { useAuth } from '../_layout';
import { calculateLevel } from '@/lib/utils';
import { useCoins } from '@/contexts/CoinsContext';

import DailyRewardCard from '@/components/coins/DailyRewardCard';
import { CoinIcon } from '@/components/coins/CoinIcon';
import { useResponsiveLayout } from '@/hooks';
import { useFocusEffect, useRouter } from 'expo-router';
// ===== نظام Hybrid: الإحصائيات من Supabase =====
import { useUserStats } from '@/hooks/useHybridProgress';
import { hybridSyncService } from '@/services/hybridSyncService';
import { useBadges } from '@/contexts/BadgeContext';
import {
  ALL_BADGES,
  BadgeRarity,
  BADGE_CATEGORIES,
} from '@/constants/badgeDefinitions';
import { ALL_LESSONS, ALL_CHALLENGES } from '@/constants/courseData';
import { showAlert } from '@/utils/crossPlatformAlert';
import { getProfile, ProfileData } from '@/services/profileService';
import { getFollowInfo } from '@/services/followService';
import ProfileEditModal from '@/components/ui/ProfileEditModal';
import { useApp } from '@/contexts/AppContext';

// Web-specific styles (typed separately to avoid StyleSheet inference issues)
const webStyles = {
  scrollContentWeb: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 40,
  } as ViewStyle,
  webContainer: {
    flexDirection: 'row',
    gap: 32,
  } as ViewStyle,
  webLeftColumn: {
    flex: 1,
    maxWidth: 380,
  } as ViewStyle,
  webRightColumn: {
    flex: 2,
  } as ViewStyle,
  profileCardWeb: {
    marginBottom: 24,
    overflow: 'hidden',
  } as ViewStyle,
  profileGradientWeb: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    position: 'relative',
  } as ViewStyle,
  avatarSectionWeb: {
    marginBottom: 20,
  } as ViewStyle,
  avatarWrapperWeb: {
    position: 'relative',
  } as ViewStyle,
  avatarRingWeb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  avatarWeb: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  avatarTextWeb: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
  } as TextStyle,
  levelBadgeWeb: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#0f0f1e',
  } as ViewStyle,
  levelBadgeGradientWeb: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  levelTextWeb: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  } as TextStyle,
  userInfoSectionWeb: {
    alignItems: 'center',
    marginBottom: 20,
  } as ViewStyle,
  nameWeb: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  } as TextStyle,
  xpContainerWeb: {
    width: '100%',
  } as ViewStyle,
  quickStatsWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  } as ViewStyle,
  quickStatCardWeb: {
    flex: 1,
    minWidth: 150,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  } as ViewStyle,
  quickStatIconWeb: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  quickStatValueWeb: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  } as TextStyle,
  quickStatLabelWeb: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  } as TextStyle,
  sectionHeaderWeb: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  } as ViewStyle,
  settingsCardWeb: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 36,
  } as ViewStyle,
  settingItemWeb: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 4,
  } as ViewStyle,
  pointsCardWeb: {
    marginBottom: 16,
    overflow: 'hidden',
  } as ViewStyle,
  pointsGradientWeb: {
    padding: 24,
    borderRadius: 20,
  } as ViewStyle,
  pointsHeaderWeb: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  pointsIconContainerWeb: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  pointsValueWeb: {
    color: '#a78bfa',
    fontSize: 32,
    fontWeight: 'bold',
  } as TextStyle,
  buyPointsButtonWeb: {
    borderRadius: 16,
    overflow: 'hidden',
  } as ViewStyle,
  buyPointsGradientWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  } as ViewStyle,
  buyPointsTextWeb: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  } as TextStyle,
  dailyRewardContainerWeb: {
    marginBottom: 20,
  } as ViewStyle,
  badgesGridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  } as ViewStyle,
  badgeCardWrapperWeb: {
    width: '30%',
    minWidth: 140,
  } as ViewStyle,
  badgeCardWeb: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  } as ViewStyle,
  badgeGradientWeb: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    minHeight: 130,
  } as ViewStyle,
  lockIconContainerWeb: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  badgeIconContainerWeb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  } as ViewStyle,
  badgeNameWeb: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  } as TextStyle,
  badgeDescWeb: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  } as TextStyle,
};

export default function ProfileScreen() {
  const {
    user,
    userId,
    fullName: authFullName,
    isLoading: authLoading,
    signOut,
  } = useAuth();
  const router = useRouter();
  const { balance: coins, unlockedCourses } = useCoins();
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const {
    isLargeScreen,
    isWeb,
    isTablet,
    isDesktop,
    contentPaddingTop,
    contentPaddingBottom,
  } = useResponsiveLayout();

  // AppContext — auto-refresh profile on login
  const {
    profile: appProfile,
    followersCount: appFollowers,
    followingCount: appFollowing,
    refreshProfile,
  } = useApp();
  const { authVersion } = useAuth();

  // ===== نظام Hybrid: إحصائيات من Supabase =====
  const {
    stats,
    isLoading: statsLoading,
    refresh: refreshStats,
  } = useUserStats(userId);

  // Safety timeout — don't let profile stay stuck in loading forever
  // Same pattern as home page (8 second max)
  const [statsLoadingTimedOut, setStatsLoadingTimedOut] = useState(false);
  useEffect(() => {
    if (!statsLoading) {
      setStatsLoadingTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setStatsLoadingTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [statsLoading]);

  const isLoading = authLoading || (statsLoading && !statsLoadingTimedOut);
  // استخدام المستوى من قاعدة البيانات مباشرة
  const level = stats.level || 1;
  // Badges - بيانات حقيقية من نظام الشارات
  const { earnedBadgeIds, earnedCount, totalCount, refreshBadges } =
    useBadges();

  // جلب بيانات الملف الشخصي والمتابعة
  const loadProfileData = useCallback(async () => {
    if (!userId) return;
    const { data } = await getProfile(userId);
    if (data) {
      setProfileData(data);
      setFollowersCount(data.followers_count || 0);
      setFollowingCount(data.following_count || 0);
    }
  }, [userId]);

  // ===== جلب التحديات المكتملة بنفس طريقة صفحة التحديات =====
  const loadChallengesProgress = useCallback(async () => {
    if (!userId) return;

    await hybridSyncService.setUser(userId);
    // جلب كل الدروس المكتملة (التحديات تُعامل كدروس)
    const completed = await hybridSyncService.fetchAllCompletedLessons();
    // تصفية التحديات فقط
    const completedChallengeIds = completed.filter((id) =>
      ALL_CHALLENGES.some((ch) => ch.id === id)
    );
    setCompletedChallenges(completedChallengeIds);
  }, [userId]);

  // تحميل التحديات المكتملة
  useEffect(() => {
    loadChallengesProgress();
  }, [loadChallengesProgress]);

  // تحديث الإحصائيات عند العودة لصفحة البروفايل
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        refreshStats();
        loadChallengesProgress();
        refreshBadges();
        loadProfileData();
      }
    }, [
      userId,
      refreshStats,
      loadChallengesProgress,
      refreshBadges,
      loadProfileData,
    ])
  );

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Sync from AppContext when authVersion changes (login event)
  useEffect(() => {
    if (appProfile) {
      setProfileData(appProfile);
      setFollowersCount(appFollowers);
      setFollowingCount(appFollowing);
    }
  }, [appProfile, appFollowers, appFollowing, authVersion]);

  // بيانات حقيقية من نظام الإحصائيات
  const completedLessonsCount = stats.completedLessons;
  const completedChallengesCount = completedChallenges.length;
  const totalLessonsCount = ALL_LESSONS.length;
  const totalChallengesCount = ALL_CHALLENGES.length;

  const rarityColors: Record<BadgeRarity, string> = {
    common: '#6b7280',
    rare: '#3b82f6',
    epic: '#7c3aed',
    legendary: '#f59e0b',
  };

  // خريطة أيقونات Ionicons البديلة لكل شارة (لتتوافق مع تصميم صفحة البروفايل)
  const iconMap: Record<string, { icon: string; fallback: string }> = {
    'play-arrow': { icon: 'play-circle', fallback: 'play-circle' },
    'trending-up': { icon: 'trending-up', fallback: 'trending-up' },
    extension: { icon: 'extension-puzzle', fallback: 'code-slash' },
    shield: { icon: 'shield', fallback: 'shield' },
    'military-tech': { icon: 'medal', fallback: 'medal' },
    'emoji-events': { icon: 'trophy', fallback: 'trophy' },
    whatshot: { icon: 'flame', fallback: 'flame' },
    'local-fire-department': { icon: 'flame', fallback: 'flame' },
    diamond: { icon: 'diamond', fallback: 'diamond' },
    lightbulb: { icon: 'bulb', fallback: 'bulb' },
    psychology: { icon: 'brain', fallback: 'hardware-chip' },
    bolt: { icon: 'flash', fallback: 'flash' },
    stars: { icon: 'star', fallback: 'star' },
    school: { icon: 'school', fallback: 'school' },
    'menu-book': { icon: 'book', fallback: 'book' },
    'auto-stories': { icon: 'library', fallback: 'library' },
    'history-edu': { icon: 'document-text', fallback: 'document-text' },
    'workspace-premium': { icon: 'ribbon', fallback: 'ribbon' },
    verified: { icon: 'checkmark-circle', fallback: 'checkmark-circle' },
    language: { icon: 'language', fallback: 'globe' },
    star: { icon: 'star', fallback: 'star' },
    grade: { icon: 'star', fallback: 'star' },
    security: { icon: 'shield-checkmark', fallback: 'shield' },
    'auto-awesome': { icon: 'sparkles', fallback: 'star' },
    'flash-on': { icon: 'flash', fallback: 'flash' },
    replay: { icon: 'refresh', fallback: 'refresh' },
    'shopping-cart': { icon: 'cart', fallback: 'cart' },
    'collections-bookmark': { icon: 'bookmarks', fallback: 'bookmarks' },
    'library-books': { icon: 'library', fallback: 'library' },
  };

  const badges = useMemo(
    () =>
      ALL_BADGES.map((b) => ({
        id: b.id,
        name: b.nameAr,
        icon: iconMap[b.icon]?.icon || 'star',
        color: rarityColors[b.rarity],
        earned: earnedBadgeIds.includes(b.id),
        description: b.descriptionAr,
      })),
    [earnedBadgeIds]
  );

  // شارات مجمّعة حسب الفئة
  const groupedBadges = useMemo(
    () =>
      BADGE_CATEGORIES.map((category) => ({
        ...category,
        badges: category.badges.map((b) => ({
          id: b.id,
          name: b.nameAr,
          icon: iconMap[b.icon]?.icon || 'star',
          color: rarityColors[b.rarity],
          earned: earnedBadgeIds.includes(b.id),
          description: b.descriptionAr,
        })),
        earnedCount: category.badges.filter((b) =>
          earnedBadgeIds.includes(b.id)
        ).length,
      })),
    [earnedBadgeIds]
  );

  const metadataName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.display_name ||
    '';
  const userName =
    profileData?.full_name ||
    profileData?.username ||
    authFullName ||
    metadataName ||
    user?.email?.split('@')[0] ||
    'مستخدم';
  const userEmail = user?.email || 'غير محدد';
  const fullName = profileData?.full_name || userName;
  const userAvatarUrl = profileData?.avatar_url || null;

  const handleSignOut = async () => {
    showAlert('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'خروج',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#9ca3af', marginTop: 12 }}>
          جاري تحميل البيانات...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={isLargeScreen && isWeb ? [] : ['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isLargeScreen && isWeb && webStyles.scrollContentWeb,
          {
            paddingTop: contentPaddingTop + (isLargeScreen && isWeb ? 40 : 20),
            paddingBottom: contentPaddingBottom,
          },
        ]}
      >
        {/* Web Layout - Two Columns */}
        {isLargeScreen && isWeb ? (
          <View
            style={[
              webStyles.webContainer,
              // Tablet: reverse column order so profile card appears on the right
              isTablet && { flexDirection: 'row-reverse' },
            ]}
          >
            {/* Profile Info Column - appears on RIGHT on tablet */}
            <View style={[webStyles.webLeftColumn, isTablet && { flex: 2 }]}>
              {/* Profile Header */}
              <Animated.View entering={FadeInDown.delay(100).springify()}>
                <GlassCard gradient style={webStyles.profileCardWeb}>
                  <LinearGradient
                    colors={[
                      'rgba(124, 58, 237, 0.25)',
                      'rgba(59, 130, 246, 0.15)',
                      'rgba(16, 185, 129, 0.1)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={webStyles.profileGradientWeb}
                  >
                    <View style={styles.decorativeCircle1} />
                    <View style={styles.decorativeCircle2} />

                    {/* Avatar */}
                    <View style={webStyles.avatarSectionWeb}>
                      <View style={webStyles.avatarWrapperWeb}>
                        <LinearGradient
                          colors={['#7c3aed', '#3b82f6', '#10b981']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={webStyles.avatarRingWeb}
                        >
                          {userAvatarUrl ? (
                            <Image
                              source={{ uri: userAvatarUrl }}
                              style={{
                                width: 110,
                                height: 110,
                                borderRadius: 55,
                              }}
                            />
                          ) : (
                            <View style={webStyles.avatarWeb}>
                              <Text style={webStyles.avatarTextWeb}>
                                {userName.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}
                        </LinearGradient>
                        <View style={webStyles.levelBadgeWeb}>
                          <LinearGradient
                            colors={['#f59e0b', '#f97316']}
                            style={webStyles.levelBadgeGradientWeb}
                          >
                            <Text style={webStyles.levelTextWeb}>{level}</Text>
                          </LinearGradient>
                        </View>
                      </View>
                    </View>

                    {/* User Info */}
                    <View style={webStyles.userInfoSectionWeb}>
                      <Text style={webStyles.nameWeb}>{fullName}</Text>
                      <View style={styles.emailContainer}>
                        <Ionicons
                          name="mail-outline"
                          size={14}
                          color="#9ca3af"
                        />
                        <Text style={styles.email}>{userEmail}</Text>
                      </View>
                    </View>

                    {/* Follow Stats + Edit Button - Web */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 24,
                        marginTop: 16,
                        marginBottom: 12,
                      }}
                    >
                      <View style={{ alignItems: 'center' }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 20,
                            fontWeight: '700',
                          }}
                        >
                          {followersCount}
                        </Text>
                        <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                          متابِع
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 1,
                          height: 30,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        }}
                      />
                      <View style={{ alignItems: 'center' }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 20,
                            fontWeight: '700',
                          }}
                        >
                          {followingCount}
                        </Text>
                        <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                          متابَع
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 1,
                          height: 30,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => setShowProfileEdit(true)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          backgroundColor: 'rgba(124, 58, 237, 0.15)',
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: 'rgba(124, 58, 237, 0.3)',
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="create-outline"
                          size={16}
                          color="#7c3aed"
                        />
                        <Text
                          style={{
                            color: '#7c3aed',
                            fontSize: 14,
                            fontWeight: '600',
                          }}
                        >
                          تعديل
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* XP Progress */}
                    <View style={webStyles.xpContainerWeb}>
                      <XPBar xp={stats.xp} />
                    </View>
                  </LinearGradient>
                </GlassCard>
              </Animated.View>

              {/* Quick Stats - Web (desktop only) */}
              {!isTablet && (
                <Animated.View entering={FadeInDown.delay(150).springify()}>
                  <View style={webStyles.quickStatsWeb}>
                    <GlassCard style={webStyles.quickStatCardWeb}>
                      <View
                        style={[
                          webStyles.quickStatIconWeb,
                          { backgroundColor: 'rgba(167, 139, 250, 0.2)' },
                        ]}
                      >
                        <Ionicons name="diamond" size={22} color="#a78bfa" />
                      </View>
                      <Text style={webStyles.quickStatValueWeb}>
                        {coins.toLocaleString()}
                      </Text>
                      <Text style={webStyles.quickStatLabelWeb}>كوين</Text>
                    </GlassCard>
                    <GlassCard style={webStyles.quickStatCardWeb}>
                      <View
                        style={[
                          webStyles.quickStatIconWeb,
                          { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
                        ]}
                      >
                        <MaterialIcons
                          name="local-fire-department"
                          size={22}
                          color="#f59e0b"
                        />
                      </View>
                      <Text style={webStyles.quickStatValueWeb}>
                        {stats.streak}
                      </Text>
                      <Text style={webStyles.quickStatLabelWeb}>
                        سلسلة يومية
                      </Text>
                    </GlassCard>
                    <GlassCard style={webStyles.quickStatCardWeb}>
                      <View
                        style={[
                          webStyles.quickStatIconWeb,
                          { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
                        ]}
                      >
                        <MaterialIcons
                          name="school"
                          size={22}
                          color="#3b82f6"
                        />
                      </View>
                      <Text style={webStyles.quickStatValueWeb}>
                        {completedLessonsCount}
                      </Text>
                      <Text style={webStyles.quickStatLabelWeb}>درس مكتمل</Text>
                    </GlassCard>
                    <GlassCard style={webStyles.quickStatCardWeb}>
                      <View
                        style={[
                          webStyles.quickStatIconWeb,
                          { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
                        ]}
                      >
                        <MaterialIcons
                          name="emoji-events"
                          size={22}
                          color="#10b981"
                        />
                      </View>
                      <Text style={webStyles.quickStatValueWeb}>
                        {completedChallengesCount}
                      </Text>
                      <Text style={webStyles.quickStatLabelWeb}>
                        تحدي مكتمل
                      </Text>
                    </GlassCard>
                  </View>
                </Animated.View>
              )}

              {/* Settings - Web (desktop only) */}
              {!isTablet && (
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                  <View style={webStyles.sectionHeaderWeb}>
                    <View style={styles.sectionTitleRow}>
                      <View
                        style={[
                          styles.sectionIconContainer,
                          { backgroundColor: 'rgba(156, 163, 175, 0.15)' },
                        ]}
                      >
                        <Ionicons name="settings" size={18} color="#9ca3af" />
                      </View>
                      <Text style={styles.sectionTitle}>الإعدادات</Text>
                    </View>
                  </View>
                  <GlassCard style={webStyles.settingsCardWeb}>
                    <TouchableOpacity
                      style={webStyles.settingItemWeb}
                      onPress={() => router.push('/certificate' as any)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.settingLeft}>
                        <View
                          style={[
                            styles.settingIconContainer,
                            { backgroundColor: 'rgba(234, 179, 8, 0.15)' },
                          ]}
                        >
                          <Ionicons name="ribbon" size={18} color="#eab308" />
                        </View>
                        <Text style={styles.settingText}>شهاداتي</Text>
                      </View>
                      <Ionicons name="chevron-back" size={18} color="#4b5563" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={webStyles.settingItemWeb}
                      activeOpacity={0.7}
                      onPress={() => router.push('/notification-settings' as any)}
                    >
                      <View style={styles.settingLeft}>
                        <View
                          style={[
                            styles.settingIconContainer,
                            { backgroundColor: 'rgba(167, 139, 250, 0.15)' },
                          ]}
                        >
                          <Ionicons
                            name="notifications"
                            size={18}
                            color="#a78bfa"
                          />
                        </View>
                        <Text style={styles.settingText}>الإشعارات</Text>
                      </View>
                      <Ionicons name="chevron-back" size={18} color="#4b5563" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={webStyles.settingItemWeb}
                      activeOpacity={0.7}
                      onPress={() => router.push('/blocked-users' as any)}
                    >
                      <View style={styles.settingLeft}>
                        <View
                          style={[
                            styles.settingIconContainer,
                            { backgroundColor: 'rgba(248, 113, 113, 0.15)' },
                          ]}
                        >
                          <Ionicons
                            name="ban"
                            size={18}
                            color="#f87171"
                          />
                        </View>
                        <Text style={styles.settingText}>المستخدمون المحظورون</Text>
                      </View>
                      <Ionicons name="chevron-back" size={18} color="#4b5563" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={webStyles.settingItemWeb}
                      activeOpacity={0.7}
                      onPress={() => router.push('/support' as any)}
                    >
                      <View style={styles.settingLeft}>
                        <View
                          style={[
                            styles.settingIconContainer,
                            { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
                          ]}
                        >
                          <Ionicons
                            name="help-circle"
                            size={18}
                            color="#3b82f6"
                          />
                        </View>
                        <Text style={styles.settingText}>المساعدة والدعم</Text>
                      </View>
                      <Ionicons name="chevron-back" size={18} color="#4b5563" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={webStyles.settingItemWeb}
                      activeOpacity={0.7}
                      onPress={() => router.push('/about' as any)}
                    >
                      <View style={styles.settingLeft}>
                        <View
                          style={[
                            styles.settingIconContainer,
                            { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                          ]}
                        >
                          <Ionicons
                            name="information-circle"
                            size={18}
                            color="#10b981"
                          />
                        </View>
                        <Text style={styles.settingText}>عن التطبيق</Text>
                      </View>
                      <Ionicons name="chevron-back" size={18} color="#4b5563" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={webStyles.settingItemWeb}
                      activeOpacity={0.7}
                      onPress={() => router.push('/privacy' as any)}
                    >
                      <View style={styles.settingLeft}>
                        <View
                          style={[
                            styles.settingIconContainer,
                            { backgroundColor: 'rgba(139, 92, 246, 0.15)' },
                          ]}
                        >
                          <Ionicons
                            name="shield-checkmark"
                            size={18}
                            color="#8b5cf6"
                          />
                        </View>
                        <Text style={styles.settingText}>سياسة الخصوصية</Text>
                      </View>
                      <Ionicons name="chevron-back" size={18} color="#4b5563" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={webStyles.settingItemWeb}
                      activeOpacity={0.7}
                      onPress={() => router.push('/terms' as any)}
                    >
                      <View style={styles.settingLeft}>
                        <View
                          style={[
                            styles.settingIconContainer,
                            { backgroundColor: 'rgba(6, 182, 212, 0.15)' },
                          ]}
                        >
                          <Ionicons
                            name="document-text"
                            size={18}
                            color="#06b6d4"
                          />
                        </View>
                        <Text style={styles.settingText}>شروط الاستخدام</Text>
                      </View>
                      <Ionicons name="chevron-back" size={18} color="#4b5563" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={webStyles.settingItemWeb}
                      activeOpacity={0.7}
                      onPress={() => router.push('/delete-account' as any)}
                    >
                      <View style={styles.settingLeft}>
                        <View
                          style={[
                            styles.settingIconContainer,
                            { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                          ]}
                        >
                          <Ionicons
                            name="trash"
                            size={18}
                            color="#ef4444"
                          />
                        </View>
                        <Text style={styles.settingText}>حذف الحساب</Text>
                      </View>
                      <Ionicons name="chevron-back" size={18} color="#4b5563" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        webStyles.settingItemWeb,
                        styles.settingItemDanger,
                      ]}
                      onPress={handleSignOut}
                      activeOpacity={0.7}
                    >
                      <View style={styles.settingLeft}>
                        <View
                          style={[
                            styles.settingIconContainer,
                            { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                          ]}
                        >
                          <Ionicons name="log-out" size={18} color="#ef4444" />
                        </View>
                        <Text
                          style={[styles.settingText, { color: '#ef4444' }]}
                        >
                          تسجيل الخروج
                        </Text>
                      </View>
                      <Ionicons name="chevron-back" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </GlassCard>
                </Animated.View>
              )}

              {/* Tablet: Points + Daily Reward + Badges in profile column (right side) */}
              {isTablet && (
                <>
                  <Animated.View entering={FadeInDown.delay(150).springify()}>
                    <View style={webStyles.sectionHeaderWeb}>
                      <View style={styles.sectionTitleRow}>
                        <View
                          style={[
                            styles.sectionIconContainer,
                            { backgroundColor: 'rgba(167, 139, 250, 0.15)' },
                          ]}
                        >
                          <Ionicons name="diamond" size={18} color="#a78bfa" />
                        </View>
                        <Text style={styles.sectionTitle}>الكوينات</Text>
                      </View>
                    </View>
                    <GlassCard style={webStyles.pointsCardWeb}>
                      <LinearGradient
                        colors={[
                          'rgba(167, 139, 250, 0.15)',
                          'rgba(139, 92, 246, 0.1)',
                        ]}
                        style={webStyles.pointsGradientWeb}
                      >
                        <View style={webStyles.pointsHeaderWeb}>
                          <View style={styles.pointsInfo}>
                            <View style={webStyles.pointsIconContainerWeb}>
                              <CoinIcon size={36} />
                            </View>
                            <View>
                              <Text style={styles.pointsLabel}>
                                رصيدك من الكوينات
                              </Text>
                              <Text style={webStyles.pointsValueWeb}>
                                {coins.toLocaleString()}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => router.push('/rewards' as any)}
                            style={webStyles.buyPointsButtonWeb}
                          >
                            <LinearGradient
                              colors={['#8b5cf6', '#6366f1']}
                              style={webStyles.buyPointsGradientWeb}
                            >
                              <Ionicons name="gift" size={18} color="#fff" />
                              <Text style={webStyles.buyPointsTextWeb}>
                                اجمع الكوينات
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </GlassCard>
                  </Animated.View>
                  <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <View style={webStyles.dailyRewardContainerWeb}>
                      <DailyRewardCard />
                    </View>
                  </Animated.View>
                  <Animated.View entering={FadeInDown.delay(250).springify()}>
                    <View style={webStyles.sectionHeaderWeb}>
                      <View style={styles.sectionTitleRow}>
                        <View style={styles.sectionIconContainer}>
                          <Ionicons name="medal" size={18} color="#f59e0b" />
                        </View>
                        <Text style={styles.sectionTitle}>الشارات</Text>
                      </View>
                      <View style={styles.badgeCountContainer}>
                        <Text style={styles.badgeCountText}>
                          {badges.filter((b) => b.earned).length}/
                          {badges.length}
                        </Text>
                      </View>
                    </View>
                    <GlassCard style={{ padding: 20, marginBottom: 20 }}>
                      {groupedBadges.map((category, idx) => (
                        <View
                          key={category.id}
                          style={[
                            styles.badgeSummaryRow,
                            idx < groupedBadges.length - 1 &&
                              styles.badgeSummaryRowBorder,
                          ]}
                        >
                          <View style={styles.badgeSummaryLeft}>
                            <View
                              style={[
                                styles.badgeCategoryIcon,
                                { backgroundColor: category.color + '20' },
                              ]}
                            >
                              <Ionicons
                                name={category.icon as any}
                                size={16}
                                color={category.color}
                              />
                            </View>
                            <Text style={styles.badgeSummaryLabel}>
                              {category.nameAr}
                            </Text>
                          </View>
                          <View style={styles.badgeSummaryRight}>
                            <Text
                              style={[
                                styles.badgeSummaryCount,
                                { color: category.color },
                              ]}
                            >
                              {category.earnedCount}/{category.badges.length}
                            </Text>
                            <View style={styles.badgeSummaryProgressBg}>
                              <View
                                style={[
                                  styles.badgeSummaryProgressFill,
                                  {
                                    width: `${category.badges.length > 0 ? (category.earnedCount / category.badges.length) * 100 : 0}%`,
                                    backgroundColor: category.color,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        </View>
                      ))}
                      <TouchableOpacity
                        style={styles.showAllBadgesButton}
                        onPress={() => setShowBadgeModal(true)}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={[
                            'rgba(245, 158, 11, 0.15)',
                            'rgba(245, 158, 11, 0.08)',
                          ]}
                          style={styles.showAllBadgesGradient}
                        >
                          <Ionicons name="grid" size={18} color="#f59e0b" />
                          <Text style={styles.showAllBadgesText}>
                            عرض جميع الشارات
                          </Text>
                          <Ionicons
                            name="chevron-back"
                            size={18}
                            color="#f59e0b"
                          />
                        </LinearGradient>
                      </TouchableOpacity>
                    </GlassCard>
                  </Animated.View>
                </>
              )}
            </View>

            {/* Right Column - Points+Badges on desktop / Quick Stats+Settings on tablet */}
            <View style={[webStyles.webRightColumn, isTablet && { flex: 1 }]}>
              {!isTablet && (
                <>
                  {/* Points Card - Web */}
                  <Animated.View entering={FadeInDown.delay(150).springify()}>
                    <View style={webStyles.sectionHeaderWeb}>
                      <View style={styles.sectionTitleRow}>
                        <View
                          style={[
                            styles.sectionIconContainer,
                            { backgroundColor: 'rgba(167, 139, 250, 0.15)' },
                          ]}
                        >
                          <Ionicons name="diamond" size={18} color="#a78bfa" />
                        </View>
                        <Text style={styles.sectionTitle}>الكوينات</Text>
                      </View>
                    </View>
                    <GlassCard style={webStyles.pointsCardWeb}>
                      <LinearGradient
                        colors={[
                          'rgba(167, 139, 250, 0.15)',
                          'rgba(139, 92, 246, 0.1)',
                        ]}
                        style={webStyles.pointsGradientWeb}
                      >
                        <View style={webStyles.pointsHeaderWeb}>
                          <View style={styles.pointsInfo}>
                            <View style={webStyles.pointsIconContainerWeb}>
                              <CoinIcon size={36} />
                            </View>
                            <View>
                              <Text style={styles.pointsLabel}>
                                رصيدك من الكوينات
                              </Text>
                              <Text style={webStyles.pointsValueWeb}>
                                {coins.toLocaleString()}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => router.push('/rewards' as any)}
                            style={webStyles.buyPointsButtonWeb}
                          >
                            <LinearGradient
                              colors={['#8b5cf6', '#6366f1']}
                              style={webStyles.buyPointsGradientWeb}
                            >
                              <Ionicons name="gift" size={18} color="#fff" />
                              <Text style={webStyles.buyPointsTextWeb}>
                                اجمع الكوينات
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </GlassCard>
                  </Animated.View>

                  {/* Daily Reward - Web */}
                  <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <View style={webStyles.dailyRewardContainerWeb}>
                      <DailyRewardCard />
                    </View>
                  </Animated.View>

                  {/* Badges - Web Summary with Modal */}
                  <Animated.View entering={FadeInDown.delay(250).springify()}>
                    <View style={webStyles.sectionHeaderWeb}>
                      <View style={styles.sectionTitleRow}>
                        <View style={styles.sectionIconContainer}>
                          <Ionicons name="medal" size={18} color="#f59e0b" />
                        </View>
                        <Text style={styles.sectionTitle}>الشارات</Text>
                      </View>
                      <View style={styles.badgeCountContainer}>
                        <Text style={styles.badgeCountText}>
                          {badges.filter((b) => b.earned).length}/
                          {badges.length}
                        </Text>
                      </View>
                    </View>

                    {/* Badge Category Summary Cards - Web */}
                    <GlassCard style={{ padding: 20, marginBottom: 20 }}>
                      {groupedBadges.map((category, idx) => (
                        <View
                          key={category.id}
                          style={[
                            styles.badgeSummaryRow,
                            idx < groupedBadges.length - 1 &&
                              styles.badgeSummaryRowBorder,
                          ]}
                        >
                          <View style={styles.badgeSummaryLeft}>
                            <View
                              style={[
                                styles.badgeCategoryIcon,
                                { backgroundColor: category.color + '20' },
                              ]}
                            >
                              <Ionicons
                                name={category.icon as any}
                                size={16}
                                color={category.color}
                              />
                            </View>
                            <Text style={styles.badgeSummaryLabel}>
                              {category.nameAr}
                            </Text>
                          </View>
                          <View style={styles.badgeSummaryRight}>
                            <Text
                              style={[
                                styles.badgeSummaryCount,
                                { color: category.color },
                              ]}
                            >
                              {category.earnedCount}/{category.badges.length}
                            </Text>
                            {/* Mini progress bar */}
                            <View style={styles.badgeSummaryProgressBg}>
                              <View
                                style={[
                                  styles.badgeSummaryProgressFill,
                                  {
                                    width: `${category.badges.length > 0 ? (category.earnedCount / category.badges.length) * 100 : 0}%`,
                                    backgroundColor: category.color,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        </View>
                      ))}

                      {/* Show All Badges Button - Web */}
                      <TouchableOpacity
                        style={styles.showAllBadgesButton}
                        onPress={() => setShowBadgeModal(true)}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={[
                            'rgba(245, 158, 11, 0.15)',
                            'rgba(245, 158, 11, 0.08)',
                          ]}
                          style={styles.showAllBadgesGradient}
                        >
                          <Ionicons name="grid" size={18} color="#f59e0b" />
                          <Text style={styles.showAllBadgesText}>
                            عرض جميع الشارات
                          </Text>
                          <Ionicons
                            name="chevron-back"
                            size={18}
                            color="#f59e0b"
                          />
                        </LinearGradient>
                      </TouchableOpacity>
                    </GlassCard>
                  </Animated.View>
                </>
              )}

              {/* Tablet: Quick Stats + Settings in content column (left side) */}
              {isTablet && (
                <>
                  <Animated.View entering={FadeInDown.delay(150).springify()}>
                    <View style={webStyles.quickStatsWeb}>
                      <GlassCard style={webStyles.quickStatCardWeb}>
                        <View
                          style={[
                            webStyles.quickStatIconWeb,
                            { backgroundColor: 'rgba(167, 139, 250, 0.2)' },
                          ]}
                        >
                          <Ionicons name="diamond" size={22} color="#a78bfa" />
                        </View>
                        <Text style={webStyles.quickStatValueWeb}>
                          {coins.toLocaleString()}
                        </Text>
                        <Text style={webStyles.quickStatLabelWeb}>كوين</Text>
                      </GlassCard>
                      <GlassCard style={webStyles.quickStatCardWeb}>
                        <View
                          style={[
                            webStyles.quickStatIconWeb,
                            { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
                          ]}
                        >
                          <MaterialIcons
                            name="local-fire-department"
                            size={22}
                            color="#f59e0b"
                          />
                        </View>
                        <Text style={webStyles.quickStatValueWeb}>
                          {stats.streak}
                        </Text>
                        <Text style={webStyles.quickStatLabelWeb}>
                          سلسلة يومية
                        </Text>
                      </GlassCard>
                      <GlassCard style={webStyles.quickStatCardWeb}>
                        <View
                          style={[
                            webStyles.quickStatIconWeb,
                            { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
                          ]}
                        >
                          <MaterialIcons
                            name="school"
                            size={22}
                            color="#3b82f6"
                          />
                        </View>
                        <Text style={webStyles.quickStatValueWeb}>
                          {completedLessonsCount}
                        </Text>
                        <Text style={webStyles.quickStatLabelWeb}>
                          درس مكتمل
                        </Text>
                      </GlassCard>
                      <GlassCard style={webStyles.quickStatCardWeb}>
                        <View
                          style={[
                            webStyles.quickStatIconWeb,
                            { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
                          ]}
                        >
                          <MaterialIcons
                            name="emoji-events"
                            size={22}
                            color="#10b981"
                          />
                        </View>
                        <Text style={webStyles.quickStatValueWeb}>
                          {completedChallengesCount}
                        </Text>
                        <Text style={webStyles.quickStatLabelWeb}>
                          تحدي مكتمل
                        </Text>
                      </GlassCard>
                    </View>
                  </Animated.View>
                  <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <View style={webStyles.sectionHeaderWeb}>
                      <View style={styles.sectionTitleRow}>
                        <View
                          style={[
                            styles.sectionIconContainer,
                            { backgroundColor: 'rgba(156, 163, 175, 0.15)' },
                          ]}
                        >
                          <Ionicons name="settings" size={18} color="#9ca3af" />
                        </View>
                        <Text style={styles.sectionTitle}>الإعدادات</Text>
                      </View>
                    </View>
                    <GlassCard style={webStyles.settingsCardWeb}>
                      <TouchableOpacity
                        style={webStyles.settingItemWeb}
                        onPress={() => router.push('/certificate' as any)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.settingLeft}>
                          <View
                            style={[
                              styles.settingIconContainer,
                              { backgroundColor: 'rgba(234, 179, 8, 0.15)' },
                            ]}
                          >
                            <Ionicons name="ribbon" size={18} color="#eab308" />
                          </View>
                          <Text style={styles.settingText}>شهاداتي</Text>
                        </View>
                        <Ionicons
                          name="chevron-back"
                          size={18}
                          color="#4b5563"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={webStyles.settingItemWeb}
                        activeOpacity={0.7}
                        onPress={() => router.push('/notification-settings' as any)}
                      >
                        <View style={styles.settingLeft}>
                          <View
                            style={[
                              styles.settingIconContainer,
                              { backgroundColor: 'rgba(167, 139, 250, 0.15)' },
                            ]}
                          >
                            <Ionicons
                              name="notifications"
                              size={18}
                              color="#a78bfa"
                            />
                          </View>
                          <Text style={styles.settingText}>
                            الإشعارات
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-back"
                          size={18}
                          color="#4b5563"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={webStyles.settingItemWeb}
                        activeOpacity={0.7}
                        onPress={() => router.push('/blocked-users' as any)}
                      >
                        <View style={styles.settingLeft}>
                          <View
                            style={[
                              styles.settingIconContainer,
                              { backgroundColor: 'rgba(248, 113, 113, 0.15)' },
                            ]}
                          >
                            <Ionicons
                              name="ban"
                              size={18}
                              color="#f87171"
                            />
                          </View>
                          <Text style={styles.settingText}>
                            المستخدمون المحظورون
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-back"
                          size={18}
                          color="#4b5563"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={webStyles.settingItemWeb}
                        activeOpacity={0.7}
                        onPress={() => router.push('/support' as any)}
                      >
                        <View style={styles.settingLeft}>
                          <View
                            style={[
                              styles.settingIconContainer,
                              { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
                            ]}
                          >
                            <Ionicons
                              name="help-circle"
                              size={18}
                              color="#3b82f6"
                            />
                          </View>
                          <Text style={styles.settingText}>
                            المساعدة والدعم
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-back"
                          size={18}
                          color="#4b5563"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={webStyles.settingItemWeb}
                        activeOpacity={0.7}
                        onPress={() => router.push('/about' as any)}
                      >
                        <View style={styles.settingLeft}>
                          <View
                            style={[
                              styles.settingIconContainer,
                              { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                            ]}
                          >
                            <Ionicons
                              name="information-circle"
                              size={18}
                              color="#10b981"
                            />
                          </View>
                          <Text style={styles.settingText}>عن التطبيق</Text>
                        </View>
                        <Ionicons
                          name="chevron-back"
                          size={18}
                          color="#4b5563"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={webStyles.settingItemWeb}
                        activeOpacity={0.7}
                        onPress={() => router.push('/privacy' as any)}
                      >
                        <View style={styles.settingLeft}>
                          <View
                            style={[
                              styles.settingIconContainer,
                              { backgroundColor: 'rgba(139, 92, 246, 0.15)' },
                            ]}
                          >
                            <Ionicons
                              name="shield-checkmark"
                              size={18}
                              color="#8b5cf6"
                            />
                          </View>
                          <Text style={styles.settingText}>سياسة الخصوصية</Text>
                        </View>
                        <Ionicons
                          name="chevron-back"
                          size={18}
                          color="#4b5563"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={webStyles.settingItemWeb}
                        activeOpacity={0.7}
                        onPress={() => router.push('/terms' as any)}
                      >
                        <View style={styles.settingLeft}>
                          <View
                            style={[
                              styles.settingIconContainer,
                              { backgroundColor: 'rgba(6, 182, 212, 0.15)' },
                            ]}
                          >
                            <Ionicons
                              name="document-text"
                              size={18}
                              color="#06b6d4"
                            />
                          </View>
                          <Text style={styles.settingText}>شروط الاستخدام</Text>
                        </View>
                        <Ionicons
                          name="chevron-back"
                          size={18}
                          color="#4b5563"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={webStyles.settingItemWeb}
                        activeOpacity={0.7}
                        onPress={() => router.push('/delete-account' as any)}
                      >
                        <View style={styles.settingLeft}>
                          <View
                            style={[
                              styles.settingIconContainer,
                              { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                            ]}
                          >
                            <Ionicons
                              name="trash"
                              size={18}
                              color="#ef4444"
                            />
                          </View>
                          <Text style={styles.settingText}>حذف الحساب</Text>
                        </View>
                        <Ionicons
                          name="chevron-back"
                          size={18}
                          color="#4b5563"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          webStyles.settingItemWeb,
                          styles.settingItemDanger,
                        ]}
                        onPress={handleSignOut}
                        activeOpacity={0.7}
                      >
                        <View style={styles.settingLeft}>
                          <View
                            style={[
                              styles.settingIconContainer,
                              { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                            ]}
                          >
                            <Ionicons
                              name="log-out"
                              size={18}
                              color="#ef4444"
                            />
                          </View>
                          <Text
                            style={[styles.settingText, { color: '#ef4444' }]}
                          >
                            تسجيل الخروج
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-back"
                          size={18}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    </GlassCard>
                  </Animated.View>
                </>
              )}
            </View>
          </View>
        ) : (
          /* Mobile Layout - Original */
          <>
            {/* Profile Header - Enhanced Design */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <GlassCard gradient style={styles.profileCard}>
                <LinearGradient
                  colors={[
                    'rgba(14, 9, 21, 1)',
                    'rgba(9, 10, 26, 1)',
                    'rgba(6, 15, 19, 1)',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.profileGradient}
                >
                  {/* Decorative Elements */}
                  <View style={styles.decorativeCircle1} />
                  <View style={styles.decorativeCircle2} />

                  {/* Avatar with Animated Ring */}
                  <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                      <LinearGradient
                        colors={['#7c3aed', '#3b82f6', '#10b981']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatarRing}
                      >
                        {userAvatarUrl ? (
                          <Image
                            source={{ uri: userAvatarUrl }}
                            style={{
                              width: 100,
                              height: 100,
                              borderRadius: 50,
                            }}
                          />
                        ) : (
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                              {userName.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </LinearGradient>
                      <View style={styles.levelBadge}>
                        <LinearGradient
                          colors={['#f59e0b', '#f97316']}
                          style={styles.levelBadgeGradient}
                        >
                          <Text style={styles.levelText}>{level}</Text>
                        </LinearGradient>
                      </View>
                    </View>
                  </View>

                  {/* User Info */}
                  <View style={styles.userInfoSection}>
                    <Text style={styles.name}>{fullName}</Text>
                    <View style={styles.emailContainer}>
                      <Ionicons name="mail-outline" size={14} color="#9ca3af" />
                      <Text style={styles.email}>{userEmail}</Text>
                    </View>
                  </View>

                  {/* Follow Stats + Edit Button */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      gap: 16,
                      marginTop: 12,
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      <View style={{ alignItems: 'center' }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 18,
                            fontWeight: '700',
                          }}
                        >
                          {followersCount}
                        </Text>
                        <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                          متابِع
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 1,
                          height: 28,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        }}
                      />
                      <View style={{ alignItems: 'center' }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 18,
                            fontWeight: '700',
                          }}
                        >
                          {followingCount}
                        </Text>
                        <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                          متابَع
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowProfileEdit(true)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: 'rgba(124, 58, 237, 0.15)',
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: 'rgba(124, 58, 237, 0.3)',
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="create-outline"
                        size={14}
                        color="#7c3aed"
                      />
                      <Text
                        style={{
                          color: '#7c3aed',
                          fontSize: 13,
                          fontWeight: '600',
                        }}
                      >
                        تعديل
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* XP Progress */}
                  <View style={styles.xpContainer}>
                    <XPBar xp={stats.xp} />
                  </View>

                  {/* Quick Stats Row - Enhanced */}
                  <View style={styles.quickStats}>
                    <TouchableOpacity
                      style={styles.quickStat}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.quickStatIcon,
                          { backgroundColor: 'rgba(167, 139, 250, 0.2)' },
                        ]}
                      >
                        <Ionicons name="diamond" size={18} color="#a78bfa" />
                      </View>
                      <Text style={styles.quickStatValue}>
                        {coins.toLocaleString()}
                      </Text>
                      <Text style={styles.quickStatLabel}>كوين</Text>
                    </TouchableOpacity>

                    <View style={styles.quickStatDivider} />

                    <TouchableOpacity
                      style={styles.quickStat}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.quickStatIcon,
                          { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
                        ]}
                      >
                        <MaterialIcons
                          name="local-fire-department"
                          size={18}
                          color="#f59e0b"
                        />
                      </View>
                      <Text style={styles.quickStatValue}>{stats.streak}</Text>
                      <Text style={styles.quickStatLabel}>سلسلة</Text>
                    </TouchableOpacity>

                    <View style={styles.quickStatDivider} />

                    <TouchableOpacity
                      style={styles.quickStat}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.quickStatIcon,
                          { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
                        ]}
                      >
                        <MaterialIcons
                          name="school"
                          size={18}
                          color="#3b82f6"
                        />
                      </View>
                      <Text style={styles.quickStatValue}>
                        {completedLessonsCount}
                      </Text>
                      <Text style={styles.quickStatLabel}>درس</Text>
                    </TouchableOpacity>

                    <View style={styles.quickStatDivider} />

                    <TouchableOpacity
                      style={styles.quickStat}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.quickStatIcon,
                          { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
                        ]}
                      >
                        <MaterialIcons
                          name="emoji-events"
                          size={18}
                          color="#10b981"
                        />
                      </View>
                      <Text style={styles.quickStatValue}>
                        {completedChallengesCount}
                      </Text>
                      <Text style={styles.quickStatLabel}>تحدي</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </GlassCard>
            </Animated.View>

            {/* Coins Section */}
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="diamond" size={22} color="#a78bfa" />
                  <Text style={styles.sectionTitle}>الكوينات</Text>
                </View>
              </View>

              {/* Points Card */}
              <GlassCard style={styles.pointsCard}>
                <LinearGradient
                  colors={[
                    'rgba(167, 139, 250, 0.15)',
                    'rgba(139, 92, 246, 0.1)',
                  ]}
                  style={styles.pointsGradient}
                >
                  <View style={styles.pointsHeader}>
                    <View style={styles.pointsInfo}>
                      <View style={styles.pointsIconContainer}>
                        <CoinIcon size={32} />
                      </View>
                      <View>
                        <Text style={styles.pointsLabel}>
                          رصيدك من الكوينات
                        </Text>
                        <Text style={styles.pointsValue}>
                          {coins.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push('/rewards' as any)}
                      style={styles.buyPointsButton}
                    >
                      <LinearGradient
                        colors={['#8b5cf6', '#6366f1']}
                        style={styles.buyPointsGradient}
                      >
                        <Ionicons name="gift" size={16} color="#fff" />
                        <Text style={styles.buyPointsText}>اجمع</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.pointsStats}>
                    <View style={styles.pointsStat}>
                      <Text style={styles.pointsStatLabel}>دورات مفتوحة</Text>
                      <Text style={styles.pointsStatValue}>
                        {unlockedCourses.length}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </GlassCard>

              {/* Daily Reward */}
              <View style={styles.dailyRewardContainer}>
                <DailyRewardCard />
              </View>
            </Animated.View>

            {/* Progress Overview */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="stats-chart" size={22} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>نظرة عامة</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <GlassCard style={styles.statCard}>
                  <Ionicons name="book" size={28} color="#3b82f6" />
                  <Text style={styles.statValue}>
                    {completedLessonsCount}/{totalLessonsCount}
                  </Text>
                  <Text style={styles.statLabel}>دروس مكتملة</Text>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${(completedLessonsCount / totalLessonsCount) * 100}%`,
                          backgroundColor: '#3b82f6',
                        },
                      ]}
                    />
                  </View>
                </GlassCard>

                <GlassCard style={styles.statCard}>
                  <Ionicons name="trophy" size={28} color="#f59e0b" />
                  <Text style={styles.statValue}>
                    {completedChallengesCount}/{totalChallengesCount}
                  </Text>
                  <Text style={styles.statLabel}>تحديات مكتملة</Text>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${(completedChallengesCount / totalChallengesCount) * 100}%`,
                          backgroundColor: '#f59e0b',
                        },
                      ]}
                    />
                  </View>
                </GlassCard>
              </View>
            </Animated.View>

            {/* Badges - Summary with Modal */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="medal" size={18} color="#f59e0b" />
                  </View>
                  <Text style={styles.sectionTitle}>الشارات</Text>
                </View>
                <View style={styles.badgeCountContainer}>
                  <Text style={styles.badgeCountText}>
                    {badges.filter((b) => b.earned).length}/{badges.length}
                  </Text>
                </View>
              </View>

              {/* Badge Category Summary Cards */}
              <GlassCard style={{ padding: 16, marginBottom: 16 }}>
                {groupedBadges.map((category, idx) => (
                  <View
                    key={category.id}
                    style={[
                      styles.badgeSummaryRow,
                      idx < groupedBadges.length - 1 &&
                        styles.badgeSummaryRowBorder,
                    ]}
                  >
                    <View style={styles.badgeSummaryLeft}>
                      <View
                        style={[
                          styles.badgeCategoryIcon,
                          { backgroundColor: category.color + '20' },
                        ]}
                      >
                        <Ionicons
                          name={category.icon as any}
                          size={14}
                          color={category.color}
                        />
                      </View>
                      <Text style={styles.badgeSummaryLabel}>
                        {category.nameAr}
                      </Text>
                    </View>
                    <View style={styles.badgeSummaryRight}>
                      <Text
                        style={[
                          styles.badgeSummaryCount,
                          { color: category.color },
                        ]}
                      >
                        {category.earnedCount}/{category.badges.length}
                      </Text>
                      {/* Mini progress bar */}
                      <View style={styles.badgeSummaryProgressBg}>
                        <View
                          style={[
                            styles.badgeSummaryProgressFill,
                            {
                              width: `${category.badges.length > 0 ? (category.earnedCount / category.badges.length) * 100 : 0}%`,
                              backgroundColor: category.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                ))}

                {/* Show All Badges Button */}
                <TouchableOpacity
                  style={styles.showAllBadgesButton}
                  onPress={() => setShowBadgeModal(true)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[
                      'rgba(245, 158, 11, 0.15)',
                      'rgba(245, 158, 11, 0.08)',
                    ]}
                    style={styles.showAllBadgesGradient}
                  >
                    <Ionicons name="grid" size={16} color="#f59e0b" />
                    <Text style={styles.showAllBadgesText}>
                      عرض جميع الشارات
                    </Text>
                    <Ionicons name="chevron-back" size={16} color="#f59e0b" />
                  </LinearGradient>
                </TouchableOpacity>
              </GlassCard>
            </Animated.View>

            {/* Settings - Enhanced */}
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View
                    style={[
                      styles.sectionIconContainer,
                      { backgroundColor: 'rgba(156, 163, 175, 0.15)' },
                    ]}
                  >
                    <Ionicons name="settings" size={18} color="#9ca3af" />
                  </View>
                  <Text style={styles.sectionTitle}>الإعدادات</Text>
                </View>
              </View>

              <GlassCard style={styles.settingsCard}>
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={() => router.push('/certificate' as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIconContainer,
                        { backgroundColor: 'rgba(234, 179, 8, 0.15)' },
                      ]}
                    >
                      <Ionicons name="ribbon" size={18} color="#eab308" />
                    </View>
                    <Text style={styles.settingText}>شهاداتي</Text>
                  </View>
                  <Ionicons name="chevron-back" size={18} color="#4b5563" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.settingItem}
                  activeOpacity={0.7}
                  onPress={() => router.push('/notification-settings' as any)}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIconContainer,
                        { backgroundColor: 'rgba(167, 139, 250, 0.15)' },
                      ]}
                    >
                      <Ionicons name="notifications" size={18} color="#a78bfa" />
                    </View>
                    <Text style={styles.settingText}>الإشعارات</Text>
                  </View>
                  <Ionicons name="chevron-back" size={18} color="#4b5563" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingItem}
                  activeOpacity={0.7}
                  onPress={() => router.push('/blocked-users' as any)}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIconContainer,
                        { backgroundColor: 'rgba(248, 113, 113, 0.15)' },
                      ]}
                    >
                      <Ionicons name="ban" size={18} color="#f87171" />
                    </View>
                    <Text style={styles.settingText}>المستخدمون المحظورون</Text>
                  </View>
                  <Ionicons name="chevron-back" size={18} color="#4b5563" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingItem}
                  activeOpacity={0.7}
                  onPress={() => router.push('/support' as any)}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIconContainer,
                        { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
                      ]}
                    >
                      <Ionicons name="help-circle" size={18} color="#3b82f6" />
                    </View>
                    <Text style={styles.settingText}>المساعدة والدعم</Text>
                  </View>
                  <Ionicons name="chevron-back" size={18} color="#4b5563" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.settingItem}
                  activeOpacity={0.7}
                  onPress={() => router.push('/about' as any)}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIconContainer,
                        { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                      ]}
                    >
                      <Ionicons
                        name="information-circle"
                        size={18}
                        color="#10b981"
                      />
                    </View>
                    <Text style={styles.settingText}>عن التطبيق</Text>
                  </View>
                  <Ionicons name="chevron-back" size={18} color="#4b5563" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingItem}
                  activeOpacity={0.7}
                  onPress={() => router.push('/privacy' as any)}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIconContainer,
                        { backgroundColor: 'rgba(139, 92, 246, 0.15)' },
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark"
                        size={18}
                        color="#8b5cf6"
                      />
                    </View>
                    <Text style={styles.settingText}>سياسة الخصوصية</Text>
                  </View>
                  <Ionicons name="chevron-back" size={18} color="#4b5563" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingItem}
                  activeOpacity={0.7}
                  onPress={() => router.push('/terms' as any)}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIconContainer,
                        { backgroundColor: 'rgba(6, 182, 212, 0.15)' },
                      ]}
                    >
                      <Ionicons
                        name="document-text"
                        size={18}
                        color="#06b6d4"
                      />
                    </View>
                    <Text style={styles.settingText}>شروط الاستخدام</Text>
                  </View>
                  <Ionicons name="chevron-back" size={18} color="#4b5563" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingItem}
                  activeOpacity={0.7}
                  onPress={() => router.push('/delete-account' as any)}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIconContainer,
                        { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                      ]}
                    >
                      <Ionicons
                        name="trash"
                        size={18}
                        color="#ef4444"
                      />
                    </View>
                    <Text style={styles.settingText}>حذف الحساب</Text>
                  </View>
                  <Ionicons name="chevron-back" size={18} color="#4b5563" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.settingItem, styles.settingItemDanger]}
                  onPress={handleSignOut}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIconContainer,
                        { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                      ]}
                    >
                      <Ionicons name="log-out" size={18} color="#ef4444" />
                    </View>
                    <Text style={[styles.settingText, { color: '#ef4444' }]}>
                      تسجيل الخروج
                    </Text>
                  </View>
                  <Ionicons name="chevron-back" size={18} color="#ef4444" />
                </TouchableOpacity>
              </GlassCard>
            </Animated.View>

            {/* App Info - Enhanced */}
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <View style={styles.appInfo}>
                <Image
                  source={require('../../assets/kodax-light-trans.png')}
                  style={styles.appLogoImage}
                  resizeMode="contain"
                />
                <Text style={styles.appVersion}>الإصدار 1.0.0</Text>
                <View style={styles.appCopyrightRow}>
                  <Text style={styles.appCopyright}>© 2026 KODAX</Text>
                </View>
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        visible={showProfileEdit}
        profile={profileData}
        onClose={() => setShowProfileEdit(false)}
        onSave={() => {
          setShowProfileEdit(false);
          loadProfileData();
        }}
      />

      {/* Badge Detail Modal */}
      <Modal
        visible={showBadgeModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowBadgeModal(false)}
      >
        <SafeAreaView
          style={styles.badgeModalContainer}
          edges={['top', 'bottom']}
        >
          {/* Modal Header */}
          <View style={styles.badgeModalHeader}>
            <TouchableOpacity
              onPress={() => setShowBadgeModal(false)}
              style={styles.badgeModalCloseBtn}
            >
              <Ionicons name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
            <Text style={styles.badgeModalTitle}>الشارات</Text>
            <View style={styles.badgeModalCountBadge}>
              <Text style={styles.badgeModalCountText}>
                {badges.filter((b) => b.earned).length}/{badges.length}
              </Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          >
            {groupedBadges.map((category) => (
              <View key={category.id} style={{ marginBottom: 24 }}>
                {/* Category Header */}
                <View style={styles.badgeCategoryHeader}>
                  <View style={styles.badgeCategoryLeft}>
                    <View
                      style={[
                        styles.badgeCategoryIcon,
                        { backgroundColor: category.color + '20' },
                      ]}
                    >
                      <Ionicons
                        name={category.icon as any}
                        size={14}
                        color={category.color}
                      />
                    </View>
                    <Text style={styles.badgeCategoryTitle}>
                      {category.nameAr}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.badgeCategoryCount,
                      { color: category.color },
                    ]}
                  >
                    {category.earnedCount}/{category.badges.length}
                  </Text>
                </View>

                {/* Category Progress Bar */}
                <View
                  style={[styles.progressBarContainer, { marginBottom: 12 }]}
                >
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${category.badges.length > 0 ? (category.earnedCount / category.badges.length) * 100 : 0}%`,
                        backgroundColor: category.color,
                      },
                    ]}
                  />
                </View>

                {/* Badges Grid - earned first */}
                <View style={styles.badgesGrid}>
                  {category.badges
                    .slice()
                    .sort((a, b) =>
                      a.earned === b.earned ? 0 : a.earned ? -1 : 1
                    )
                    .map((badge) => (
                      <TouchableOpacity
                        key={badge.id}
                        activeOpacity={0.7}
                        style={[
                          styles.badgeCard,
                          !badge.earned && styles.badgeCardLocked,
                        ]}
                      >
                        <LinearGradient
                          colors={
                            badge.earned
                              ? [badge.color + '25', badge.color + '10']
                              : [
                                  'rgba(55, 65, 81, 0.3)',
                                  'rgba(31, 41, 55, 0.2)',
                                ]
                          }
                          style={styles.badgeGradient}
                        >
                          {!badge.earned && (
                            <View style={styles.lockIconContainer}>
                              <Ionicons
                                name="lock-closed"
                                size={10}
                                color="#6b7280"
                              />
                            </View>
                          )}
                          <View
                            style={[
                              styles.badgeIconContainer,
                              {
                                backgroundColor: badge.earned
                                  ? badge.color + '30'
                                  : 'rgba(107, 114, 128, 0.2)',
                              },
                            ]}
                          >
                            <Ionicons
                              name={badge.icon as any}
                              size={22}
                              color={badge.earned ? badge.color : '#6b7280'}
                            />
                          </View>
                          <Text
                            style={[
                              styles.badgeName,
                              !badge.earned && styles.badgeNameLocked,
                            ]}
                            numberOfLines={2}
                          >
                            {badge.name}
                          </Text>
                          {badge.description && (
                            <Text
                              style={styles.badgeModalDesc}
                              numberOfLines={2}
                            >
                              {badge.description}
                            </Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  scrollContent: {
    padding: 20,
  },
  // Enhanced Profile Card Styles
  profileCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  avatarSection: {
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#0f0f1e',
  },
  levelBadgeGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  email: {
    fontSize: 14,
    color: '#9ca3af',
  },
  xpContainer: {
    width: '100%',
    marginBottom: 20,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  quickStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCountContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f59e0b',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  badgeCard: {
    width: '30%',
    minWidth: 100,
    borderRadius: 16,
    overflow: 'hidden',
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeGradient: {
    padding: 14,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    minHeight: 120,
    justifyContent: 'center',
  },
  lockIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  badgeNameLocked: {
    color: '#6b7280',
  },
  lockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  settingsCard: {
    padding: 8,
    marginBottom: 24,
    borderRadius: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 4,
  },
  settingItemDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  settingText: {
    fontSize: 15,
    color: '#e5e7eb',
    fontWeight: '500',
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  appInfo: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  appLogoImage: {
    width: 100,
    height: 50,
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  appCopyrightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  appCopyright: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Coins Styles
  pointsCard: {
    marginBottom: 16,
  },
  pointsGradient: {
    padding: 20,
    borderRadius: 16,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pointsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 4,
  },
  pointsValue: {
    color: '#a78bfa',
    fontSize: 28,
    fontWeight: 'bold',
  },
  buyPointsButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  buyPointsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  buyPointsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pointsStats: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
  },
  pointsStat: {
    flex: 1,
    alignItems: 'center',
  },
  pointsStatLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  pointsStatValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  pointsStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  dailyRewardContainer: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  badgeCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeCategoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCategoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
  },
  badgeCategoryCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Badge Summary styles
  badgeSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  badgeSummaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  badgeSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeSummaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
  },
  badgeSummaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeSummaryCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  badgeSummaryProgressBg: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  badgeSummaryProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  showAllBadgesButton: {
    marginTop: 14,
    borderRadius: 12,
    overflow: 'hidden',
  },
  showAllBadgesGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 12,
  },
  showAllBadgesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  // Badge Modal styles
  badgeModalContainer: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  badgeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeModalCloseBtn: {
    padding: 4,
  },
  badgeModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  badgeModalCountBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeModalCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f59e0b',
  },
  badgeModalDesc: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
});

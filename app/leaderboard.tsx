/**
 * صفحة التصنيفات (Leaderboard)
 * عرض ترتيب المستخدمين حسب الـ XP مع فلترة حسب المحافظة
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useRouter, Stack } from 'expo-router';
import { CosmicCard, LeaderboardCard } from '@/components';
import UserAvatar from '@/components/ui/UserAvatar';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from './_layout';
import { useResponsiveLayout } from '@/hooks';

import VerifiedBadge from '@/components/ui/VerifiedBadge';

const { width } = Dimensions.get('window');

// محافظات العراق - mapping بين ID والاسم العربي
const IRAQ_PROVINCES = [
  { id: 'all', name: 'كل العراق', arabicName: null, icon: 'flag' },
  { id: 'baghdad', name: 'بغداد', arabicName: 'بغداد', icon: 'location-city' },
  { id: 'basra', name: 'البصرة', arabicName: 'البصرة', icon: 'location-on' },
  { id: 'nineveh', name: 'نينوى', arabicName: 'نينوى', icon: 'location-on' },
  { id: 'erbil', name: 'أربيل', arabicName: 'أربيل', icon: 'location-on' },
  {
    id: 'sulaymaniyah',
    name: 'السليمانية',
    arabicName: 'السليمانية',
    icon: 'location-on',
  },
  { id: 'duhok', name: 'دهوك', arabicName: 'دهوك', icon: 'location-on' },
  { id: 'kirkuk', name: 'كركوك', arabicName: 'كركوك', icon: 'location-on' },
  { id: 'diyala', name: 'ديالى', arabicName: 'ديالى', icon: 'location-on' },
  { id: 'anbar', name: 'الأنبار', arabicName: 'الأنبار', icon: 'location-on' },
  { id: 'najaf', name: 'النجف', arabicName: 'النجف', icon: 'location-on' },
  { id: 'karbala', name: 'كربلاء', arabicName: 'كربلاء', icon: 'location-on' },
  { id: 'babel', name: 'بابل', arabicName: 'بابل', icon: 'location-on' },
  { id: 'wasit', name: 'واسط', arabicName: 'واسط', icon: 'location-on' },
  { id: 'maysan', name: 'ميسان', arabicName: 'ميسان', icon: 'location-on' },
  { id: 'dhi_qar', name: 'ذي قار', arabicName: 'ذي قار', icon: 'location-on' },
  { id: 'muthanna', name: 'المثنى', arabicName: 'المثنى', icon: 'location-on' },
  {
    id: 'qadisiyyah',
    name: 'القادسية',
    arabicName: 'القادسية',
    icon: 'location-on',
  },
  {
    id: 'saladin',
    name: 'صلاح الدين',
    arabicName: 'صلاح الدين',
    icon: 'location-on',
  },
];

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  province?: string;
  level?: number;
  verified?: boolean;
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isWeb, isLargeScreen, contentPaddingTop, contentPaddingBottom } =
    useResponsiveLayout();

  const [selectedProvince, setSelectedProvince] = useState('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await supabaseService.getLeaderboard(50);

      // تحويل البيانات إلى الشكل المطلوب
      const formattedData: LeaderboardUser[] = data.map((u: any) => ({
        id: u.id,
        name: u.full_name || u.username || 'مستخدم',
        avatar: u.avatar_url,
        xp: u.xp || 0,
        province: u.province,
        level: u.level,
        verified: !!u.is_verified,
      }));

      // ✅ فلترة حسب المحافظة باستخدام الاسم العربي أو ID
      const filteredData =
        selectedProvince === 'all'
          ? formattedData
          : formattedData.filter((u) => {
              if (!u.province) return false;

              // الحصول على بيانات المحافظة المختارة
              const selectedProvinceData = IRAQ_PROVINCES.find(
                (p) => p.id === selectedProvince
              );

              if (!selectedProvinceData) return false;

              const arabicName = selectedProvinceData.arabicName;
              const englishId = selectedProvinceData.id;

              // مقارنة بالاسم العربي OR الـ ID (case-insensitive)
              const userProvinceNormalized = u.province.toLowerCase().trim();
              const match =
                userProvinceNormalized === englishId.toLowerCase() ||
                u.province === arabicName;

              return match;
            });

      setLeaderboard(filteredData);

      // إيجاد ترتيب المستخدم الحالي
      if (user?.id) {
        const rank = formattedData.findIndex((u) => u.id === user.id) + 1;
        setUserRank(rank > 0 ? rank : null);
      }
    } catch (error) {
      // Error fetching leaderboard
    } finally {
      setIsLoading(false);
    }
  }, [selectedProvince, user?.id]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  }, [fetchLeaderboard]);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.titleContainer}>
        <MaterialIcons name="leaderboard" size={28} color="#f59e0b" />
        <Text style={styles.title}>التصنيفات</Text>
      </View>

      {/* Web refresh button / Placeholder for alignment */}
      {Platform.OS === 'web' ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={22} color="#9ca3af" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );

  const renderProvinceFilters = () => (
    <Animated.View entering={FadeInUp.delay(100).duration(500)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        {IRAQ_PROVINCES.map((province) => (
          <TouchableOpacity
            key={province.id}
            style={[
              styles.filterChip,
              selectedProvince === province.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedProvince(province.id)}
          >
            <MaterialIcons
              name={province.icon as any}
              size={16}
              color={selectedProvince === province.id ? '#fff' : '#9ca3af'}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedProvince === province.id && styles.filterChipTextActive,
              ]}
            >
              {province.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderTopThree = () => {
    // ✅ إذا كان عدد المستخدمين أقل من 3، لا نعرض podium
    if (leaderboard.length < 3) return null;

    const top3 = leaderboard.slice(0, 3);

    // حساب عرض العناصر بناءً على حجم الشاشة
    const itemWidth =
      isWeb && isLargeScreen
        ? 180 // Fixed width for web
        : (width - 80) / 3; // Dynamic for mobile

    return (
      <Animated.View
        entering={FadeInUp.delay(200).duration(600)}
        style={[
          styles.topThreeContainer,
          isWeb &&
            isLargeScreen && {
              maxWidth: 800,
              alignSelf: 'center',
              width: '100%',
            },
        ]}
      >
        {/* Second Place */}
        <View style={[styles.topThreeItem, { width: itemWidth }]}>
          <View style={[styles.topThreeBadge, styles.silverBadge]}>
            <MaterialIcons name="emoji-events" size={24} color="#9ca3af" />
          </View>
          {top3[1]?.id === user?.id && (
            <View style={styles.topThreeYouBadge}>
              <Text style={styles.topThreeYouText}>أنت</Text>
            </View>
          )}
          <UserAvatar
            userId={top3[1]?.id}
            avatarUrl={top3[1]?.avatar}
            name={top3[1]?.name}
            size="large"
            color={top3[1]?.id === user?.id ? '#7c3aed' : '#9ca3af'}
          />
          <Text
            style={[
              styles.topThreeName,
              top3[1]?.id === user?.id && styles.currentUserNameText,
            ]}
            numberOfLines={1}
          >
            {top3[1]?.name}
            <VerifiedBadge verified={top3[1]?.verified} size={12} />
          </Text>
          <Text style={styles.topThreeXP}>
            {top3[1]?.xp.toLocaleString()} XP
          </Text>
        </View>

        {/* First Place */}
        <View
          style={[
            styles.topThreeItem,
            styles.topThreeItemFirst,
            { width: itemWidth },
          ]}
        >
          <View style={[styles.topThreeBadge, styles.goldBadge]}>
            <MaterialIcons name="emoji-events" size={32} color="#f59e0b" />
          </View>
          {top3[0]?.id === user?.id && (
            <View style={styles.topThreeYouBadge}>
              <Text style={styles.topThreeYouText}>أنت</Text>
            </View>
          )}
          <UserAvatar
            userId={top3[0]?.id}
            avatarUrl={top3[0]?.avatar}
            name={top3[0]?.name}
            size="xlarge"
            color={top3[0]?.id === user?.id ? '#7c3aed' : '#f59e0b'}
          />
          <Text
            style={[
              styles.topThreeName,
              { fontSize: 16 },
              top3[0]?.id === user?.id && styles.currentUserNameText,
            ]}
            numberOfLines={1}
          >
            {top3[0]?.name}
            <VerifiedBadge verified={top3[0]?.verified} size={13} />
          </Text>
          <Text style={[styles.topThreeXP, { color: '#f59e0b' }]}>
            {top3[0]?.xp.toLocaleString()} XP
          </Text>
        </View>

        {/* Third Place */}
        <View style={[styles.topThreeItem, { width: itemWidth }]}>
          <View style={[styles.topThreeBadge, styles.bronzeBadge]}>
            <MaterialIcons name="emoji-events" size={24} color="#f97316" />
          </View>
          {top3[2]?.id === user?.id && (
            <View style={styles.topThreeYouBadge}>
              <Text style={styles.topThreeYouText}>أنت</Text>
            </View>
          )}
          <UserAvatar
            userId={top3[2]?.id}
            avatarUrl={top3[2]?.avatar}
            name={top3[2]?.name}
            size="large"
            color={top3[2]?.id === user?.id ? '#7c3aed' : '#f97316'}
          />
          <Text
            style={[
              styles.topThreeName,
              top3[2]?.id === user?.id && styles.currentUserNameText,
            ]}
            numberOfLines={1}
          >
            {top3[2]?.name}
            <VerifiedBadge verified={top3[2]?.verified} size={12} />
          </Text>
          <Text style={styles.topThreeXP}>
            {top3[2]?.xp.toLocaleString()} XP
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderUserRank = () => {
    if (!userRank) return null;

    return (
      <Animated.View entering={FadeInUp.delay(300).duration(500)}>
        <CosmicCard glowColor="#7c3aed" animated>
          <View style={styles.userRankContainer}>
            <View style={styles.userRankLeft}>
              <Text style={styles.userRankLabel}>ترتيبك</Text>
              <Text style={styles.userRankNumber}>#{userRank}</Text>
            </View>
            <View style={styles.userRankRight}>
              <MaterialIcons name="trending-up" size={24} color="#22c55e" />
              <Text style={styles.userRankHint}>استمر بالتعلم للصعود!</Text>
            </View>
          </View>
        </CosmicCard>
      </Animated.View>
    );
  };

  const renderLeaderboardList = () => {
    // ✅ إذا كان عدد المستخدمين أقل من 3، نعرضهم كلهم هنا
    const otherUsers =
      leaderboard.length < 3 ? leaderboard : leaderboard.slice(3);
    const startRank = leaderboard.length < 3 ? 1 : 4;

    // ✅ إذا لم يكن هناك أي مستخدم على الإطلاق، نعرض رسالة فارغة
    if (leaderboard.length === 0) {
      return (
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <View style={styles.listContainer}>
            <View style={styles.emptyState}>
              <MaterialIcons name="people-outline" size={64} color="#4b5563" />
              <Text style={styles.emptyText}>
                لا يوجد متسابقين في هذه المحافظة
              </Text>
              <Text style={[styles.emptyText, { fontSize: 12, marginTop: 8 }]}>
                جرب اختيار محافظة أخرى
              </Text>
            </View>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View entering={FadeInUp.delay(400).duration(500)}>
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>
            {leaderboard.length < 3 ? 'المتسابقين' : 'جميع المتسابقين'}
          </Text>
          {otherUsers.map((leaderUser, index) => {
            const isCurrentUser = leaderUser.id === user?.id;
            return (
              <View key={leaderUser.id}>
                {isCurrentUser ? (
                  <View style={styles.currentUserHighlight}>
                    <LinearGradient
                      colors={[
                        'rgba(124, 58, 237, 0.15)',
                        'rgba(59, 130, 246, 0.1)',
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.currentUserGradient}
                    >
                      <View style={styles.currentUserBadge}>
                        <Text style={styles.currentUserBadgeText}>أنت</Text>
                      </View>
                      <LeaderboardCard
                        user={leaderUser}
                        rank={startRank + index}
                        animated
                        delay={Math.min(index * 30, 300)}
                      />
                    </LinearGradient>
                  </View>
                ) : (
                  <LeaderboardCard
                    user={leaderUser}
                    rank={startRank + index}
                    animated
                    delay={Math.min(index * 30, 300)}
                  />
                )}
              </View>
            );
          })}

          {otherUsers.length === 0 && leaderboard.length >= 3 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="people" size={48} color="#4b5563" />
              <Text style={styles.emptyText}>لا يوجد متسابقين آخرين</Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>جاري تحميل التصنيفات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: contentPaddingBottom + 20 },
            isWeb &&
              isLargeScreen && {
                maxWidth: 900,
                alignSelf: 'center',
                width: '100%',
                paddingHorizontal: 40,
              },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7c3aed"
              colors={['#7c3aed']}
            />
          }
        >
          {/* Province Filters */}
          {renderProvinceFilters()}

          {/* Top 3 Podium */}
          {renderTopThree()}

          {/* User Rank Card */}
          {renderUserRank()}

          {/* Rest of Leaderboard */}
          {renderLeaderboardList()}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  filtersScroll: {
    marginBottom: 20,
  },
  filtersContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderColor: '#7c3aed',
  },
  filterChipText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  topThreeItem: {
    alignItems: 'center',
    // width removed - set dynamically in renderTopThree
  },
  topThreeItemFirst: {
    marginBottom: 20,
  },
  topThreeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  goldBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  silverBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  bronzeBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  topThreeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topThreeAvatarFirst: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: '#f59e0b',
    borderWidth: 3,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  topThreeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  topThreeXP: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  userRankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  userRankLeft: {
    alignItems: 'flex-start',
  },
  userRankLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  userRankNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#7c3aed',
  },
  userRankRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userRankHint: {
    fontSize: 13,
    color: '#22c55e',
    fontWeight: '500',
  },
  listContainer: {
    marginTop: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b7280',
    marginTop: 12,
    fontSize: 14,
  },
  // Current user highlight styles
  currentUserHighlight: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  currentUserGradient: {
    position: 'relative',
    borderRadius: 16,
  },
  currentUserBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 10,
  },
  currentUserBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  currentUserNameText: {
    color: '#a78bfa',
  },
  topThreeYouBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  topThreeYouText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

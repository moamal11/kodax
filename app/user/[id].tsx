/**
 * صفحة الملف الشخصي للمستخدم - Public User Profile
 * View another user's profile, follow stats, and published code snippets
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  Image,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, router } from 'expo-router';

import { useAuth } from '../_layout';
import { useResponsiveLayout } from '@/hooks';
import { getPublicProfile, ProfileData } from '@/services/profileService';
import { checkIsFollowing } from '@/services/followService';
import {
  getPublicSnippets,
  FeedSnippet,
  blockUser,
  unblockUser,
  isUserBlocked,
} from '@/services/codeFeedService';
import { showAlert } from '@/utils/crossPlatformAlert';
import ReportUserSheet from '@/components/social/ReportUserSheet';
import { showToast } from '@/components/ui/Toast';
import { getOrCreateConversation } from '@/services/messageService';
import FollowButton from '@/components/ui/FollowButton';

import VerifiedBadge from '@/components/ui/VerifiedBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== Helpers ====================

function formatTimestamp(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return `${Math.floor(days / 30)} شهر`;
  if (days > 0) return `${days} يوم`;
  if (hours > 0) return `${hours} ساعة`;
  if (minutes > 0) return `${minutes} دقيقة`;
  return 'الآن';
}

function formatJoinDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ==================== Main Screen ====================

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isLargeScreen } = useResponsiveLayout();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [snippets, setSnippets] = useState<FeedSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [snippetsLoading, setSnippetsLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const isOwnProfile = user?.id === id;

  // Load profile data
  useEffect(() => {
    if (!id) return;

    const loadProfile = async () => {
      setLoading(true);
      const { data } = await getPublicProfile(id);
      if (data) {
        setProfile(data);
        setFollowersCount(data.followers_count || 0);
        setFollowingCount(data.following_count || 0);
      }

      // Check follow status
      if (user?.id && user.id !== id) {
        const [following, blocked] = await Promise.all([
          checkIsFollowing(user.id, id),
          isUserBlocked(id),
        ]);
        setIsFollowing(following);
        setIsBlocked(blocked);
      }

      setLoading(false);
    };

    loadProfile();
  }, [id, user?.id]);

  // Load user's snippets with pagination
  const loadSnippets = useCallback(
    async (pageNum: number = 0, append: boolean = false) => {
      if (!id) return;

      if (!append) setSnippetsLoading(true);
      try {
        const { data } = await getPublicSnippets({
          limit: 10,
          page: pageNum,
          userId: id,
        });

        if (data) {
          if (append) {
            setSnippets((prev) => {
              const existingIds = new Set(prev.map((s) => s.id));
              const newItems = data.filter((s) => !existingIds.has(s.id));
              return [...prev, ...newItems];
            });
          } else {
            setSnippets(data);
          }
          setHasMore(data.length === 10);
        } else {
          setHasMore(false);
        }
      } catch (e) {
        console.error('Error loading user snippets:', e);
      }
      setSnippetsLoading(false);
      setLoadingMore(false);
    },
    [id]
  );

  useEffect(() => {
    loadSnippets(0, false);
  }, [loadSnippets]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || snippetsLoading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    loadSnippets(nextPage, true);
  }, [page, loadingMore, hasMore, snippetsLoading, loadSnippets]);

  // Handle message button
  const handleMessage = async () => {
    if (!user?.id || !id) return;

    setSendingMessage(true);
    const { data: conversationId, error } = await getOrCreateConversation(
      user.id,
      id
    );
    setSendingMessage(false);

    if (error) {
      // الحظر (بأي اتجاه) يمنع بدء المحادثة على السيرفر
      if (String(error?.message ?? '').includes('blocked')) {
        Alert.alert('غير متاح', 'لا يمكن مراسلة هذا المستخدم.');
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء فتح المحادثة');
      }
      return;
    }

    if (conversationId) {
      router.push(`/message/${conversationId}` as any);
    }
  };

  // حظر / إلغاء حظر (user_blocks)
  const blockName = profile?.full_name || profile?.username || 'المستخدم';
  const doToggleBlock = async () => {
    if (!id || blockBusy) return;
    setBlockBusy(true);
    const res = isBlocked ? await unblockUser(id) : await blockUser(id);
    setBlockBusy(false);
    if (!res.success) {
      showToast.error(
        isBlocked ? 'تعذّر إلغاء الحظر. حاول مرة أخرى.' : 'تعذّر الحظر. حاول مرة أخرى.'
      );
      return;
    }
    const nowBlocked = !isBlocked;
    setIsBlocked(nowBlocked);
    if (nowBlocked) {
      setSnippets([]); // لا يظهر محتواه بعد الحظر (مثل الفيد)
      showToast.success(`تم حظر ${blockName}`);
    } else {
      showToast.success(`تم إلغاء حظر ${blockName}`);
      loadSnippets(0, false);
    }
  };
  const handleBlockToggle = () => {
    showAlert(
      isBlocked ? `إلغاء حظر ${blockName}؟` : `حظر ${blockName}؟`,
      isBlocked
        ? 'سيتمكن من مراسلتك مجدداً وسترى محتواه.'
        : 'لن يستطيع مراسلتك، ولن ترى أكواده. يمكنك إلغاء الحظر لاحقاً من الإعدادات ← المستخدمون المحظورون.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: isBlocked ? 'إلغاء الحظر' : 'حظر',
          style: 'destructive',
          onPress: doToggleBlock,
        },
      ]
    );
  };

  // Handle share button
  const handleShare = async () => {
    if (!profile) return;

    const displayName = profile.full_name || profile.username || 'مستخدم';
    const profileUrl = `https://kodax.app/user/${id}`; // استبدل بالرابط الحقيقي للتطبيق

    try {
      await Share.share({
        message: `شاهد ملف ${displayName} في تطبيق Kodax: ${profileUrl}`,
        url: profileUrl, // للمشاركة كرابط على iOS
        title: `ملف ${displayName}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFollowToggle = useCallback((isNowFollowing: boolean) => {
    setIsFollowing(isNowFollowing);
    setFollowersCount((prev) =>
      isNowFollowing ? prev + 1 : Math.max(prev - 1, 0)
    );
  }, []);

  // ==================== Render ====================

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="account-off"
            size={64}
            color="#374151"
          />
          <Text style={styles.errorText}>المستخدم غير موجود</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = profile.full_name || profile.username || 'مستخدم';
  const initial = displayName.charAt(0).toUpperCase();

  const renderHeader = () => (
    <View>
      {/* Header Bar */}
      <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#d1d5db" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Profile Card */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={[
          styles.profileCard,
          isLargeScreen && {
            maxWidth: 700,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
      >
        <LinearGradient
          colors={['#1e1e4a', '#151530']}
          style={styles.profileGradient}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#7c3aed', '#a855f7']}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarInitial}>{initial}</Text>
              </LinearGradient>
            )}
          </View>

          {/* Name & Username */}
          <Text style={styles.displayName}>
            {displayName}
            <VerifiedBadge verified={profile.is_verified} size={20} />
          </Text>
          {profile.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}

          {/* Province & Gender & Join Date */}
          <View style={styles.metaRow}>
            {profile.province && (
              <View style={styles.metaItem}>
                <Ionicons name="location" size={14} color="#8b5cf6" />
                <Text style={styles.metaText}> {profile.province}</Text>
              </View>
            )}
            {profile.gender && (
              <View style={styles.metaItem}>
                <Ionicons
                  name={profile.gender === 'male' ? 'male' : 'female'}
                  size={14}
                  color="#8b5cf6"
                />
                <Text style={styles.metaText}>
                  {profile.gender === 'male' ? 'ذكر' : 'أنثى'}
                </Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color="#8b5cf6" />
              <Text style={styles.metaText}>
                {formatJoinDate(profile.created_at)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && user?.id && (
            <View style={styles.actionButtons}>
              <FollowButton
                currentUserId={user.id}
                targetUserId={id!}
                isFollowing={isFollowing}
                onToggle={handleFollowToggle}
              />

              {isBlocked ? (
                <TouchableOpacity
                  style={[styles.messageBtn, styles.unblockBtn]}
                  onPress={handleBlockToggle}
                  disabled={blockBusy}
                  activeOpacity={0.7}
                >
                  <View style={styles.messageBtnGradient}>
                    {blockBusy ? (
                      <ActivityIndicator size="small" color="#f87171" />
                    ) : (
                      <Ionicons name="ban" size={18} color="#f87171" />
                    )}
                    <Text style={styles.unblockBtnText}>إلغاء الحظر</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.messageBtn}
                  onPress={handleMessage}
                  disabled={sendingMessage}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#1a1a3e', '#151530']}
                    style={styles.messageBtnGradient}
                  >
                    {sendingMessage ? (
                      <ActivityIndicator size="small" color="#8b5cf6" />
                    ) : (
                      <Ionicons name="mail-outline" size={18} color="#8b5cf6" />
                    )}
                    <Text style={styles.messageBtnText}>مراسلة</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#1a1a3e', '#151530']}
                  style={styles.shareBtnGradient}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={18}
                    color="#8b5cf6"
                  />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => setReportOpen(true)}
                activeOpacity={0.7}
                accessibilityLabel="الإبلاغ عن المستخدم"
              >
                <LinearGradient
                  colors={['#1a1a3e', '#151530']}
                  style={styles.shareBtnGradient}
                >
                  <Ionicons name="flag-outline" size={18} color="#fbbf24" />
                </LinearGradient>
              </TouchableOpacity>

              {!isBlocked && (
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={handleBlockToggle}
                  disabled={blockBusy}
                  activeOpacity={0.7}
                  accessibilityLabel="حظر المستخدم"
                >
                  <LinearGradient
                    colors={['#1a1a3e', '#151530']}
                    style={styles.shareBtnGradient}
                  >
                    {blockBusy ? (
                      <ActivityIndicator size="small" color="#f87171" />
                    ) : (
                      <Ionicons name="ban-outline" size={18} color="#f87171" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}
          {!isOwnProfile && id ? (
            <ReportUserSheet
              visible={reportOpen}
              onClose={() => setReportOpen(false)}
              userId={id}
              userName={blockName}
              hideBlock={isBlocked}
              onBlocked={() => {
                setIsBlocked(true);
                setSnippets([]);
              }}
            />
          ) : null}
          {!isOwnProfile && isBlocked && (
            <View style={styles.blockedBanner}>
              <Ionicons name="ban" size={16} color="#f87171" />
              <Text style={styles.blockedBannerText}>
                لقد حظرت هذا المستخدم. لا يمكنكما تبادل الرسائل ولن ترى محتواه.
              </Text>
            </View>
          )}
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 16,

              marginBottom: 12,
            }}
          >
            {/* Streak Badge - Only show on own profile */}
            {isOwnProfile && (profile.streak_days || 0) > 0 && (
              <View style={styles.streakBadge}>
                <LinearGradient
                  colors={['#f59e0b', '#ea580c']}
                  style={styles.streakGradient}
                >
                  <Ionicons name="flame" size={18} color="#fff" />
                  <Text style={styles.streakText}>
                    {profile.streak_days} يوم متواصل
                  </Text>
                </LinearGradient>
              </View>
            )}
            {isOwnProfile && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push('/(tabs)/profile')}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={16} color="#7c3aed" />
                <Text style={styles.editBtnText}>تعديل الملف</Text>
              </TouchableOpacity>
            )}
            {/* Follow Stats */}
          </View>
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>متابِع</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
              <Text style={styles.statNumber}>{followingCount}</Text>
              <Text style={styles.statLabel}>متابَع</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.level || 1}</Text>
              <Text style={styles.statLabel}>المستوى</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.xp || 0}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Snippets Header */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(300)}
        style={[
          styles.sectionHeader,
          isLargeScreen && {
            maxWidth: 700,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
      >
        <MaterialCommunityIcons name="code-braces" size={20} color="#8b5cf6" />
        <Text style={styles.sectionTitle}>الأكواد المنشورة</Text>
        <Text style={styles.sectionCount}>{snippets.length}</Text>
      </Animated.View>
    </View>
  );

  const renderSnippetItem = ({
    item,
    index,
  }: {
    item: FeedSnippet;
    index: number;
  }) => {
    const langColors: Record<string, string> = {
      javascript: '#f7df1e',
      python: '#3776ab',
      typescript: '#3178c6',
      html: '#e34c26',
      css: '#1572b6',
      cpp: '#00599c',
      java: '#ed8b00',
      csharp: '#68217a',
      sql: '#336791',
      react: '#61dafb',
      go: '#00add8',
      rust: '#dea584',
      swift: '#fa7343',
      kotlin: '#7f52ff',
      dart: '#0175c2',
    };
    const langColor = langColors[item.language] || '#8b5cf6';

    return (
      <Animated.View
        entering={FadeInDown.delay(Math.min(index * 60, 300)).duration(400)}
      >
        <TouchableOpacity
          style={[
            styles.snippetCard,
            isLargeScreen && {
              maxWidth: 700,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
          onPress={() => router.push(`/code/${item.id}`)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#1a1a3e', '#151530']}
            style={styles.snippetGradient}
          >
            <View style={styles.snippetHeader}>
              <Text style={styles.snippetTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View
                style={[
                  styles.snippetLangBadge,
                  { backgroundColor: langColor + '25' },
                ]}
              >
                <View
                  style={[
                    styles.snippetLangDot,
                    { backgroundColor: langColor },
                  ]}
                />
                <Text style={[styles.snippetLangText, { color: langColor }]}>
                  {item.language}
                </Text>
              </View>
            </View>
            {item.description ? (
              <Text style={styles.snippetDesc} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.snippetStats}>
              <View style={styles.snippetStat}>
                <Ionicons name="heart" size={14} color="#ef4444" />
                <Text style={styles.snippetStatText}>
                  {item.likes_count || 0}
                </Text>
              </View>
              <View style={styles.snippetStat}>
                <Ionicons name="chatbubble" size={14} color="#6b7280" />
                <Text style={styles.snippetStatText}>
                  {item.comments_count || 0}
                </Text>
              </View>
              <View style={styles.snippetStat}>
                <Ionicons name="eye" size={14} color="#6b7280" />
                <Text style={styles.snippetStatText}>
                  {item.views_count || 0}
                </Text>
              </View>
              <Text style={styles.snippetTime}>
                {formatTimestamp(item.created_at)}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmpty = () => {
    if (snippetsLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color="#8b5cf6" />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="code-braces-box"
          size={56}
          color="#374151"
        />
        <Text style={styles.emptyText}>لا توجد أكواد منشورة بعد</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={snippets}
        renderItem={renderSnippetItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#8b5cf6" />
            </View>
          ) : null
        }
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== 'web'}
      />
    </SafeAreaView>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 8,
  },
  backBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  backBtnText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#f3f4f6',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },

  // Profile Card
  profileCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  profileGradient: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
    borderRadius: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  displayName: {
    color: '#f3f4f6',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  username: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#9ca3af',
    fontSize: 13,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Follow / Edit
  followContainer: {
    marginBottom: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  editBtnText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  messageBtn: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252550',
  },
  messageBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  messageBtnText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
  unblockBtn: {
    borderColor: 'rgba(248, 113, 113, 0.4)',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
  },
  unblockBtnText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '700',
  },
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    alignSelf: 'stretch',
  },
  blockedBannerText: {
    flex: 1,
    color: '#fca5a5',
    fontSize: 13,
    lineHeight: 20,
  },
  shareBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252550',
  },
  shareBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Streak
  streakBadge: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  streakText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#f3f4f6',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  sectionCount: {
    color: '#9ca3af',
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Snippet Cards
  snippetCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  snippetGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
  },
  snippetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  snippetTitle: {
    color: '#f3f4f6',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  snippetLangBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  snippetLangDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  snippetLangText: {
    fontSize: 12,
    fontWeight: '600',
  },
  snippetDesc: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  snippetStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  snippetStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  snippetStatText: {
    color: '#6b7280',
    fontSize: 13,
  },
  snippetTime: {
    color: '#4b5563',
    fontSize: 12,
    marginLeft: 'auto',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
  },
});

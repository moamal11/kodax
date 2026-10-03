/**
 * صفحة فيد الأكواد - Code Feed
 * Browse, search, and interact with published code snippets
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
  ViewStyle,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { useAuth } from '@/contexts/AuthContext';
import { useResponsiveLayout } from '@/hooks';
import { useApp } from '@/contexts/AppContext';
import {
  getPublicSnippets,
  FeedSnippet,
  getSnippetCounts,
} from '@/services/codeFeedService';
import { checkBatchFollowing, toggleFollow } from '@/services/followService';
import FollowButton from '@/components/ui/FollowButton';
import UserAvatar from '@/components/ui/UserAvatar';
import { FilterDropdown } from '@/components/ui/FilterDropdown';

import VerifiedBadge from '@/components/ui/VerifiedBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== Constants ====================

const LANGUAGE_FILTERS = [
  { id: 'all', label: 'الكل', icon: 'apps', color: '#8b5cf6' },
  { id: 'web', label: 'ويب', icon: 'globe', color: '#10b981' },
  { id: 'javascript', label: 'JS', icon: 'logo-javascript', color: '#f7df1e' },
  { id: 'python', label: 'Python', icon: 'logo-python', color: '#3776ab' },
  { id: 'typescript', label: 'TS', icon: 'code-slash', color: '#3178c6' },
  { id: 'html', label: 'HTML', icon: 'logo-html5', color: '#e34c26' },
  { id: 'css', label: 'CSS', icon: 'logo-css3', color: '#264de4' },
  { id: 'cpp', label: 'C++', icon: 'code-slash', color: '#00599c' },
  { id: 'java', label: 'Java', icon: 'cafe', color: '#ed8b00' },
  { id: 'csharp', label: 'C#', icon: 'code', color: '#68217a' },
  { id: 'sql', label: 'SQL', icon: 'server', color: '#336791' },
  { id: 'react', label: 'React', icon: 'logo-react', color: '#61dafb' },
  { id: 'go', label: 'Go', icon: 'code-working', color: '#00add8' },
  { id: 'rust', label: 'Rust', icon: 'hardware-chip', color: '#dea584' },
  { id: 'swift', label: 'Swift', icon: 'logo-apple', color: '#fa7343' },
  { id: 'kotlin', label: 'Kotlin', icon: 'logo-android', color: '#7f52ff' },
  { id: 'dart', label: 'Dart', icon: 'flash', color: '#0175c2' },
];

// Sort types for code feed
const SORT_FILTERS = [
  { id: 'recent', label: 'الأحدث', icon: 'time-outline' },
  { id: 'popular', label: 'الأكثر شعبية', icon: 'flame-outline' },
  { id: 'most_liked', label: 'الأكثر إعجاباً', icon: 'heart-outline' },
  { id: 'most_viewed', label: 'الأكثر مشاهدة', icon: 'eye-outline' },
  {
    id: 'most_commented',
    label: 'الأكثر تفاعلاً',
    icon: 'chatbubbles-outline',
  },
];

// Language categories for the selection modal
const LANGUAGE_CATEGORIES = [
  {
    title: 'شائعة',
    icon: 'star',
    ids: ['web', 'javascript', 'python', 'typescript', 'html'],
  },
  {
    title: 'أنظمة وأداء',
    icon: 'desktop-outline',
    ids: ['cpp', 'java', 'csharp', 'go', 'rust'],
  },
  {
    title: 'تطبيقات',
    icon: 'phone-portrait-outline',
    ids: ['react', 'swift', 'kotlin', 'dart'],
  },
  {
    title: 'بيانات',
    icon: 'server-outline',
    ids: ['sql'],
  },
];

// Search keywords mapping for better search results
const LANGUAGE_SEARCH_KEYWORDS: Record<string, string[]> = {
  web: ['ويب', 'موقع', 'html', 'css', 'مشروع', 'صفحة', 'webpage'],
  javascript: ['جافاسكريبت', 'js', 'جافا سكريبت', 'نود'],
  python: ['بايثون', 'بايتون', 'ذكاء اصطناعي', 'ai'],
  typescript: ['تايب سكريبت', 'ts', 'تايبسكريبت'],
  html: ['اتش تي ام ال', 'صفحة', 'واجهة', 'ويب'],
  css: ['سي اس اس', 'تنسيق', 'استايل', 'style'],
  cpp: ['سي بلس بلس', 'c++', 'سي++', 'بلس'],
  java: ['جافا', 'اندرويد'],
  csharp: ['سي شارب', 'c#', 'شارب', 'يونيتي', 'unity'],
  sql: ['اس كيو ال', 'قاعدة بيانات', 'بيانات', 'database'],
  react: ['رياكت', 'ريأكت', 'واجهة'],
  go: ['جو', 'غو', 'golang'],
  rust: ['رست', 'رَست'],
  swift: ['سويفت', 'ايفون', 'ios', 'آيفون'],
  kotlin: ['كوتلن', 'كوتلين', 'اندرويد', 'android'],
  dart: ['دارت', 'فلاتر', 'flutter'],
};

// ==================== Helpers ====================

function formatTimestamp(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `منذ ${weeks} أسبوع`;
  if (days > 0) return `منذ ${days} يوم`;
  if (hours > 0) return `منذ ${hours} ساعة`;
  if (minutes > 0) return `منذ ${minutes} دقيقة`;
  return 'الآن';
}

function getLanguageColor(lang: string): string {
  return LANGUAGE_FILTERS.find((f) => f.id === lang)?.color || '#8b5cf6';
}

function getLanguageLabel(lang: string): string {
  return LANGUAGE_FILTERS.find((f) => f.id === lang)?.label || lang;
}

// ==================== Code Info Badge ====================

const CodeInfoBadge = React.memo(
  ({ code, language }: { code: string; language: string }) => {
    const lines = code.split('\n');
    return (
      <View style={styles.codeInfoBox}>
        <MaterialCommunityIcons name="code-braces" size={16} color="#6b7280" />
        <Text style={styles.codeInfoText}>{lines.length} سطر</Text>
        <View style={styles.codeInfoDivider} />
        <Text style={styles.codeInfoText}>{code.length} حرف</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.codeInfoHint}>اضغط لعرض الكود</Text>
        <Ionicons name="chevron-back" size={14} color="#4b5563" />
      </View>
    );
  }
);

// ==================== Snippet Card ====================

const SnippetCard = React.memo(
  ({
    snippet,
    liked,
    onPress,
    onLike,
    onCopy,
    index,
    currentUserId,
    isFollowing,
    onFollowToggle,
    onAuthorPress,
    likeCount,
    viewCount,
    commentCount,
  }: {
    snippet: FeedSnippet;
    liked: boolean;
    onPress: () => void;
    onLike: () => void;
    onCopy: () => void;
    index: number;
    currentUserId?: string;
    isFollowing?: boolean;
    onFollowToggle?: (isNowFollowing: boolean) => void;
    onAuthorPress?: () => void;
    likeCount: number;
    viewCount: number;
    commentCount: number;
  }) => {
    const authorName =
      snippet.profiles?.full_name || snippet.profiles?.username || 'مجهول';
    const langColor = getLanguageColor(snippet.language);

    return (
      <Animated.View
        entering={FadeInDown.delay(Math.min(index * 60, 300)).duration(400)}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#1a1a3e', '#151530']}
            style={styles.cardGradient}
          >
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.authorRow}>
                <UserAvatar
                  userId={snippet.user_id}
                  avatarUrl={snippet.profiles?.avatar_url}
                  name={authorName}
                  size="large"
                  color={langColor}
                  onPress={() => onAuthorPress?.()}
                />
                <View style={{ flexDirection: 'column' }}>
                  <Text style={styles.authorName} numberOfLines={1}>
                    {authorName}
                    <VerifiedBadge verified={snippet.profiles?.is_verified} size={13} />
                  </Text>
                  <Text style={styles.timestamp}>
                    {formatTimestamp(snippet.created_at)}
                  </Text>
                </View>
              </View>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                {currentUserId &&
                  snippet.user_id !== currentUserId &&
                  onFollowToggle && (
                    <FollowButton
                      currentUserId={currentUserId}
                      targetUserId={snippet.user_id}
                      isFollowing={isFollowing || false}
                      onToggle={onFollowToggle}
                      compact
                    />
                  )}
                <View
                  style={[
                    styles.langBadge,
                    { backgroundColor: langColor + '25' },
                  ]}
                >
                  <View
                    style={[styles.langDot, { backgroundColor: langColor }]}
                  />
                  <Text style={[styles.langText, { color: langColor }]}>
                    {getLanguageLabel(snippet.language)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Title & Description */}
            <Text style={styles.cardTitle} numberOfLines={2}>
              {snippet.title}
            </Text>
            {snippet.description ? (
              <Text style={styles.cardDescription} numberOfLines={2}>
                {snippet.description}
              </Text>
            ) : null}

            {/* Code Info (no code shown) */}
            <CodeInfoBadge code={snippet.code} language={snippet.language} />

            {/* Actions Bar */}
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onLike();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons
                  name={liked ? 'favorite' : 'favorite-border'}
                  size={20}
                  color={liked ? '#ef4444' : '#6b7280'}
                />
                <Text
                  style={[styles.actionText, liked && { color: '#ef4444' }]}
                >
                  {likeCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={onPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={18}
                  color="#6b7280"
                />
                <Text style={styles.actionText}>{commentCount}</Text>
              </TouchableOpacity>

              <View style={styles.actionBtn}>
                <MaterialIcons name="visibility" size={18} color="#6b7280" />
                <Text style={styles.actionText}>{viewCount}</Text>
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, { marginLeft: 'auto' }]}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onCopy();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="content-copy" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// ==================== Empty State ====================

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="code-braces-box"
        size={72}
        color="#374151"
      />
      <Text style={styles.emptyTitle}>
        {hasFilter ? 'لا توجد أكواد بهذا الفلتر' : 'لا توجد أكواد منشورة بعد'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {hasFilter
          ? 'جرّب فلتر آخر أو ابحث بكلمة مختلفة'
          : 'كن أول من ينشر كود!\nاضغط + لإضافة كود جديد'}
      </Text>
    </View>
  );
}

// ==================== Main Screen ====================

export default function CodeFeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isLargeScreen, isWeb } = useResponsiveLayout();
  const {
    likedSnippets,
    snippetLikeCounts,
    snippetViewCounts,
    snippetCommentCounts,
    toggleLike: globalToggleLike,
    syncLikes,
    updateLikeCounts,
    getLikeCount,
    updateViewCounts,
    getViewCount,
    updateCommentCounts,
    getCommentCount,
  } = useApp();
  const { authVersion } = useAuth();

  // State
  const [snippets, setSnippets] = useState<FeedSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState<
    'recent' | 'popular' | 'most_liked' | 'most_viewed' | 'most_commented'
  >('recent');
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [langSearchQuery, setLangSearchQuery] = useState('');

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const langSearchRef = useRef<TextInput>(null);

  // Load snippets
  const loadSnippets = useCallback(
    async (pageNum = 0, append = false) => {
      if (pageNum === 0 && !append) setLoading(true);

      try {
        const { data, error } = await getPublicSnippets({
          language: selectedLanguage,
          sortBy: sortBy,
          search: searchQuery.trim() || undefined,
          page: pageNum,
          limit: 20,
        });

        if (!error) {
          if (append) {
            setSnippets((prev) => {
              const existingIds = new Set(prev.map((s) => s.id));
              const newItems = data.filter((s) => !existingIds.has(s.id));
              return [...prev, ...newItems];
            });
          } else {
            setSnippets(data);
          }
          setHasMore(data.length === 20);

          if (data.length > 0) {
            const ids = data.map((s) => s.id);

            // Always fetch accurate counts (public data — no auth needed)
            try {
              const { likeCounts, viewCounts, commentCounts } =
                await getSnippetCounts(ids);
              updateLikeCounts(likeCounts);
              updateViewCounts(viewCounts);
              updateCommentCounts(commentCounts);
            } catch (_e) {
              // Counts fetch failed — snippets still show with initial values
            }

            // Sync likes + follow status (only if logged in)
            if (user?.id) {
              syncLikes(ids);

              // Fetch initial follow status for all snippet authors
              try {
                const authorIds = [
                  ...new Set(
                    data.map((s) => s.user_id).filter((uid) => uid !== user?.id)
                  ),
                ];
                if (authorIds.length > 0) {
                  const followedSet = await checkBatchFollowing(
                    user.id,
                    authorIds
                  );
                  setFollowedUsers((prev) => {
                    const next = new Set(prev);
                    for (const uid of authorIds) {
                      followedSet.has(uid) ? next.add(uid) : next.delete(uid);
                    }
                    return next;
                  });
                }
              } catch (_e) {
                // Follow check failed — not critical
              }
            }
          }
        }
      } catch (err) {
        console.warn('[CodeFeed] Error loading snippets:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [
      selectedLanguage,
      searchQuery,
      sortBy,
      user?.id,
      updateLikeCounts,
      updateViewCounts,
      updateCommentCounts,
      syncLikes,
    ]
  );

  // Reload on filter change
  useEffect(() => {
    setPage(0);
    loadSnippets(0);
  }, [selectedLanguage, sortBy, loadSnippets]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(0);
      loadSnippets(0);
    }, 500);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery, loadSnippets]);

  // Reload data when auth changes (after login)
  useEffect(() => {
    if (authVersion > 0 && user?.id) {
      setPage(0);
      loadSnippets(0);
    }
  }, [authVersion, loadSnippets, user?.id]);

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    loadSnippets(0);
  }, [loadSnippets]);

  // Pagination
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    loadSnippets(nextPage, true);
  }, [page, loadingMore, hasMore, loading, loadSnippets]);

  // Like handler — يستخدم النظام المركزي من AppContext
  const handleLike = useCallback(
    async (snippetId: string) => {
      if (!user?.id) return;

      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
      }

      // AppContext يدير Optimistic Update + Rollback + Debounce
      await globalToggleLike(snippetId);
    },
    [user?.id, globalToggleLike]
  );

  // Copy code
  const handleCopy = useCallback(async (code: string) => {
    await Clipboard.setStringAsync(code);
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  }, []);

  // Navigation
  const handleSnippetPress = useCallback(
    (id: string) => router.push(`/code/${id}` as any),
    [router]
  );

  const handleAddPress = useCallback(() => {
    setShowLanguageModal(true);
    setLangSearchQuery('');
    // Reset scroll position after modal animation
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, 350);
  }, []);

  const handleLanguageSelect = useCallback(
    (langId: string) => {
      setShowLanguageModal(false);
      router.push(`/code/add?lang=${langId}` as any);
    },
    [router]
  );

  const handleFollowToggle = useCallback(
    (userId: string, isNowFollowing: boolean) => {
      setFollowedUsers((prev) => {
        const next = new Set(prev);
        isNowFollowing ? next.add(userId) : next.delete(userId);
        return next;
      });
    },
    []
  );

  // ==================== Render ====================

  const renderItem = useCallback(
    ({ item, index }: { item: FeedSnippet; index: number }) => (
      <SnippetCard
        snippet={item}
        liked={likedSnippets.has(item.id)}
        onPress={() => handleSnippetPress(item.id)}
        onLike={() => handleLike(item.id)}
        onCopy={() => handleCopy(item.code)}
        index={index}
        currentUserId={user?.id}
        isFollowing={followedUsers.has(item.user_id)}
        onFollowToggle={(isNowFollowing) =>
          handleFollowToggle(item.user_id, isNowFollowing)
        }
        onAuthorPress={() => router.push(`/user/${item.user_id}` as any)}
        likeCount={getLikeCount(item.id, item.likes_count)}
        viewCount={getViewCount(item.id, item.views_count)}
        commentCount={getCommentCount(item.id, item.comments_count)}
      />
    ),
    [
      likedSnippets,
      snippetLikeCounts,
      snippetViewCounts,
      snippetCommentCounts,
      followedUsers,
      handleSnippetPress,
      handleLike,
      handleCopy,
      handleFollowToggle,
      user?.id,
      getLikeCount,
      getViewCount,
      getCommentCount,
    ]
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8b5cf6" />
      </View>
    );
  }, [loadingMore]);

  const keyExtractor = useCallback((item: FeedSnippet) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, isLargeScreen && webStyles.containerWeb]}>
        {/* ===== Header ===== */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.header, isLargeScreen && webStyles.headerWeb]}
        >
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons
              name="code-braces"
              size={28}
              color="#8b5cf6"
            />
            <Text style={styles.headerTitle}>كود</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Web refresh button */}
            {Platform.OS === 'web' && (
              <TouchableOpacity
                style={[styles.headerBtn, { marginRight: 4 }]}
                onPress={handleRefresh}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.headerBtn} onPress={handleAddPress}>
              <MaterialIcons name="add" size={24} color="#8b5cf6" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ===== Search Bar ===== */}
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={[styles.searchContainer, isLargeScreen && webStyles.searchWeb]}
        >
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            style={[
              styles.searchInput,
              Platform.OS === 'web' && ({ outline: 'none' } as any),
            ]}
            placeholder="ابحث في الأكواد..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* ===== Language Filters ===== */}
        <View
          style={[styles.filtersRow, isLargeScreen && webStyles.filtersRowWeb]}
        >
          <FilterDropdown
            value={selectedLanguage}
            options={LANGUAGE_FILTERS.map((filter) => ({
              id: filter.id,
              label: filter.label,
              icon: filter.icon,
              color: filter.color,
            }))}
            onChange={setSelectedLanguage}
            placeholder="اللغة"
            icon="code-slash"
          />

          <FilterDropdown
            value={sortBy}
            options={SORT_FILTERS}
            onChange={(value) => setSortBy(value as typeof sortBy)}
            placeholder="الترتيب"
            icon="funnel"
          />
        </View>

        {/* ===== Content ===== */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>جاري تحميل الأكواد...</Text>
          </View>
        ) : (
          <FlatList
            data={snippets}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            extraData={{
              liked: likedSnippets,
              likes: snippetLikeCounts,
              views: snippetViewCounts,
              comments: snippetCommentCounts,
              followed: followedUsers,
            }}
            contentContainerStyle={[
              styles.feedList,
              isLargeScreen && webStyles.feedWeb,
              snippets.length === 0 && styles.emptyList,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#8b5cf6"
                colors={['#8b5cf6']}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <EmptyState
                hasFilter={selectedLanguage !== 'all' || searchQuery.length > 0}
              />
            }
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS !== 'web'}
          />
        )}
      </View>

      {/* ===== Language Selection Modal ===== */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={SlideInDown.duration(300)}
            style={styles.languageModal}
          >
            <LinearGradient
              colors={['#1a1a3e', '#151530']}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <MaterialCommunityIcons
                    name="code-tags"
                    size={24}
                    color="#8b5cf6"
                  />
                  <Text style={styles.modalTitle}>اختر لغة البرمجة</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowLanguageModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={24} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.langSearchContainer}>
                <View style={styles.langSearchBar}>
                  <Ionicons name="search" size={20} color="#6b7280" />
                  <TextInput
                    ref={langSearchRef}
                    style={[
                      styles.langSearchInput,
                      Platform.OS === 'web' && ({ outline: 'none' } as any),
                    ]}
                    placeholder="ابحث عن لغة..."
                    placeholderTextColor="#6b7280"
                    value={langSearchQuery}
                    onChangeText={setLangSearchQuery}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  {langSearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setLangSearchQuery('')}>
                      <Ionicons name="close-circle" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Language Grid with Categories */}
              <ScrollView
                ref={scrollViewRef}
                style={styles.languageGrid}
                showsVerticalScrollIndicator={false}
                contentOffset={{ x: 0, y: 0 }}
                keyboardShouldPersistTaps="handled"
              >
                {(() => {
                  const query = langSearchQuery.trim().toLowerCase();
                  const allLangs = LANGUAGE_FILTERS.filter(
                    (l) => l.id !== 'all'
                  );

                  // Filter languages by search query
                  const filteredLangs = query
                    ? allLangs.filter((lang) => {
                        const keywords =
                          LANGUAGE_SEARCH_KEYWORDS[lang.id] || [];
                        return (
                          lang.label.toLowerCase().includes(query) ||
                          lang.id.toLowerCase().includes(query) ||
                          keywords.some((kw) => kw.includes(query))
                        );
                      })
                    : allLangs;

                  // If searching, show flat grid
                  if (query) {
                    if (filteredLangs.length === 0) {
                      return (
                        <View style={styles.langSearchEmpty}>
                          <Ionicons
                            name="search-outline"
                            size={48}
                            color="#4b5563"
                          />
                          <Text style={styles.langSearchEmptyText}>
                            لا توجد نتائج لـ "{langSearchQuery}"
                          </Text>
                        </View>
                      );
                    }
                    return (
                      <View style={styles.languageGridInner}>
                        {filteredLangs.map((lang) => (
                          <TouchableOpacity
                            key={lang.id}
                            style={styles.languageCard}
                            onPress={() => handleLanguageSelect(lang.id)}
                            activeOpacity={0.7}
                          >
                            <LinearGradient
                              colors={[lang.color + '20', lang.color + '10']}
                              style={styles.languageCardGradient}
                            >
                              <View
                                style={[
                                  styles.languageIconBox,
                                  {
                                    backgroundColor: lang.color + '30',
                                  },
                                ]}
                              >
                                <Ionicons
                                  name={lang.icon as any}
                                  size={32}
                                  color={lang.color}
                                />
                              </View>
                              <Text style={styles.languageCardLabel}>
                                {lang.label}
                              </Text>
                              <View
                                style={[
                                  styles.languageDot,
                                  { backgroundColor: lang.color },
                                ]}
                              />
                            </LinearGradient>
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  }

                  // No search: show categorized view
                  return (
                    <View style={{ paddingBottom: 16 }}>
                      {LANGUAGE_CATEGORIES.map((cat, catIndex) => {
                        const catLangs = cat.ids
                          .map((id) => allLangs.find((l) => l.id === id))
                          .filter(Boolean) as typeof allLangs;
                        if (catLangs.length === 0) return null;
                        return (
                          <View
                            key={`cat-${catIndex}`}
                            style={styles.langCategory}
                          >
                            <View style={styles.langCategoryTitleWrap}>
                              <Ionicons
                                name={cat.icon as any}
                                size={16}
                                color="#a855f7"
                                style={{ marginLeft: 6 }}
                              />
                              <Text style={styles.langCategoryTitle}>
                                {cat.title}
                              </Text>
                            </View>
                            <View style={styles.languageGridInner}>
                              {catLangs.map((lang) => (
                                <TouchableOpacity
                                  key={lang.id}
                                  style={styles.languageCard}
                                  onPress={() => handleLanguageSelect(lang.id)}
                                  activeOpacity={0.7}
                                >
                                  <LinearGradient
                                    colors={[
                                      lang.color + '20',
                                      lang.color + '10',
                                    ]}
                                    style={styles.languageCardGradient}
                                  >
                                    <View
                                      style={[
                                        styles.languageIconBox,
                                        {
                                          backgroundColor: lang.color + '30',
                                        },
                                      ]}
                                    >
                                      <Ionicons
                                        name={lang.icon as any}
                                        size={32}
                                        color={lang.color}
                                      />
                                    </View>
                                    <Text style={styles.languageCardLabel}>
                                      {lang.label}
                                    </Text>
                                    <View
                                      style={[
                                        styles.languageDot,
                                        { backgroundColor: lang.color },
                                      ]}
                                    />
                                  </LinearGradient>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    paddingTop: Platform.OS === 'web' && SCREEN_WIDTH >= 768 ? 90 : 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a3e',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#1a1a3e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252550',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    padding: 0,
    textAlign: 'right',
  },

  // Filters Row
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // Language Filters
  filterList: {
    paddingHorizontal: 16,
    paddingBottom: 23,
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#252550',
    height: 30,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },

  // Feed List
  feedList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 14,
  },
  emptyList: {
    flexGrow: 1,
  },

  // Snippet Card
  card: {
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252550',
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'right',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
    flex: 1,
    textAlign: 'right',
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  langDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 10,
    lineHeight: 18,
  },

  // Code Info Badge
  codeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0d0d1a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e1e3a',
  },
  codeInfoText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeInfoDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#252550',
    marginHorizontal: 2,
  },
  codeInfoHint: {
    fontSize: 11,
    color: '#4b5563',
    fontStyle: 'italic',
  },

  // Card Actions
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9ca3af',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Footer
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    marginBottom: Platform.OS === 'web' ? 24 : 90,
    right: 20,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    zIndex: 999,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Language Selection Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  languageModal: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a3e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252550',
  },
  languageGrid: {
    maxHeight: SCREEN_HEIGHT * 0.65,
  },
  languageGridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  languageCard: {
    width: (SCREEN_WIDTH - 61) / 3,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  languageCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  languageIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  languageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  // Search bar in language modal
  langSearchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252550',
  },
  langSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0d1a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#252550',
  },
  langSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'right',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  } as any,
  langSearchEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  langSearchEmptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Category headers
  langCategory: {
    marginTop: 4,
  },
  langCategoryTitleWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  langCategoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9ca3af',
    textAlign: 'right',
  },
});

// Web-specific responsive overrides
const webStyles = {
  containerWeb: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  } as ViewStyle,
  headerWeb: {
    paddingHorizontal: 32,
  } as ViewStyle,
  searchWeb: {
    marginHorizontal: 32,
  } as ViewStyle,
  filtersRowWeb: {
    paddingHorizontal: 32,
  } as ViewStyle,
  filterWeb: {
    paddingHorizontal: 28,
  } as ViewStyle,
  feedWeb: {
    paddingHorizontal: 28,
  } as ViewStyle,
  fabWeb: {
    bottom: 32,
    right: 32,
  } as ViewStyle,
};

/**
 * صفحة المستخدمين المحظورين - Blocked Users
 * القائمة من user_blocks (RLS: حظر المستخدم الحالي فقط) مع إلغاء الحظر
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';

import { useAuth } from './_layout';
import { useResponsiveLayout } from '@/hooks';
import {
  getBlockedUsers,
  unblockUser,
  BlockedUser,
} from '@/services/codeFeedService';
import { showAlert } from '@/utils/crossPlatformAlert';
import { showToast } from '@/components/ui/Toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getDisplayName(user: BlockedUser): string {
  return user.full_name || user.username || 'مستخدم';
}

// ==================== Blocked User Card ====================

interface BlockedUserCardProps {
  user: BlockedUser;
  busy: boolean;
  onUnblock: () => void;
  onOpen: () => void;
}

const BlockedUserCard = React.memo(
  ({ user, busy, onUnblock, onOpen }: BlockedUserCardProps) => {
    const displayName = getDisplayName(user);

    return (
      <Animated.View entering={FadeInDown.duration(300)}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardMain}
            activeOpacity={0.75}
            onPress={onOpen}
          >
            {user.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#4b5563', '#374151']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            <View style={styles.content}>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
              {user.username ? (
                <Text style={styles.userHandle} numberOfLines={1}>
                  @{user.username}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.unblockBtn, busy && styles.unblockBtnBusy]}
            onPress={onUnblock}
            disabled={busy}
            activeOpacity={0.7}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#f87171" />
            ) : (
              <Text style={styles.unblockText}>إلغاء الحظر</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
);

// ==================== States ====================

const EmptyState = () => (
  <View style={styles.centerState}>
    <MaterialCommunityIcons name="account-cancel-outline" size={80} color="#374151" />
    <Text style={styles.stateTitle}>لا يوجد مستخدمون محظورون</Text>
    <Text style={styles.stateSubtitle}>
      عند حظر مستخدم لن يستطيع مراسلتك ولن ترى محتواه، وسيظهر هنا
    </Text>
  </View>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <View style={styles.centerState}>
    <Ionicons name="cloud-offline-outline" size={72} color="#374151" />
    <Text style={styles.stateTitle}>تعذّر تحميل القائمة</Text>
    <Text style={styles.stateSubtitle}>تحقق من اتصالك ثم حاول مرة أخرى</Text>
    <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.7}>
      <Ionicons name="refresh" size={16} color="#8b5cf6" />
      <Text style={styles.retryText}>إعادة المحاولة</Text>
    </TouchableOpacity>
  </View>
);

// ==================== Main Screen ====================

export default function BlockedUsersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { isLargeScreen } = useResponsiveLayout();

  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const { data, error: err } = await getBlockedUsers();
    setError(!!err);
    if (!err) setBlocked(data);
    setLoading(false);
  }, [user?.id]);

  // إعادة التحميل عند العودة للصفحة (مثلاً بعد إلغاء الحظر من ملف المستخدم)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleRetry = () => {
    setLoading(true);
    load();
  };

  const doUnblock = useCallback(async (target: BlockedUser) => {
    setBusyId(target.id);
    const res = await unblockUser(target.id);
    setBusyId(null);
    if (res.success) {
      setBlocked((prev) => prev.filter((u) => u.id !== target.id));
      showToast.success(`تم إلغاء حظر ${getDisplayName(target)}`);
    } else {
      showToast.error('تعذّر إلغاء الحظر. حاول مرة أخرى.');
    }
  }, []);

  const confirmUnblock = useCallback(
    (target: BlockedUser) => {
      showAlert(
        `إلغاء حظر ${getDisplayName(target)}؟`,
        'سيتمكن من مراسلتك مجدداً وسترى محتواه في الفيد.',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'إلغاء الحظر', style: 'destructive', onPress: () => doUnblock(target) },
        ]
      );
    },
    [doUnblock]
  );

  const renderItem = useCallback(
    ({ item }: { item: BlockedUser }) => (
      <BlockedUserCard
        user={item}
        busy={busyId === item.id}
        onUnblock={() => confirmUnblock(item)}
        onOpen={() => router.push(`/user/${item.id}` as any)}
      />
    ),
    [busyId, confirmUnblock, router]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, isLargeScreen && styles.containerWeb]}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#d1d5db" />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <Ionicons name="ban" size={26} color="#f87171" />
            <Text style={styles.headerTitle}>المستخدمون المحظورون</Text>
          </View>
        </Animated.View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          </View>
        ) : error && blocked.length === 0 ? (
          <ErrorState onRetry={handleRetry} />
        ) : (
          <FlatList
            data={blocked}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, blocked.length === 0 && styles.emptyList]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#8b5cf6"
                colors={['#8b5cf6']}
              />
            }
            ListEmptyComponent={<EmptyState />}
          />
        )}
      </View>
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
    paddingTop: Platform.OS === 'web' && SCREEN_WIDTH >= 768 ? 70 : 0,
  },
  containerWeb: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    flexShrink: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: '#1a1a3e',
    borderWidth: 1,
    borderColor: '#252550',
    gap: 12,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#252550',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'left', // الاسم العربي والمعرّف اللاتيني في نفس المحاذاة بجانب الصورة
  },
  userHandle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'left',
  },
  unblockBtn: {
    minWidth: 96,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.4)',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unblockBtnBusy: {
    opacity: 0.7,
  },
  unblockText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9ca3af',
    marginTop: 8,
  },
  stateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#252550',
    backgroundColor: '#1a1a3e',
  },
  retryText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
});

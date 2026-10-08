/**
 * الملف العام لعضو: الهوية والتقدم، متابعة/مراسلة (عرض كامل لكل زر)، وخيارات المشاركة والإبلاغ والحظر
 * في قائمة منفصلة، ثم أكواده المنشورة بنفس أرقام المجتمع (F20).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Share, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { getPublicProfile, type ProfileData } from '@/services/profileService';
import { checkIsFollowing } from '@/services/followService';
import { getPublicSnippets, getSnippetCounts, blockUser, unblockUser, isUserBlocked, type FeedSnippet } from '@/services/codeFeedService';
import { getOrCreateConversation } from '@/services/messageService';
import ReportUserSheet from '@/components/social/ReportUserSheet';
import FollowButton from '@/components/ui/FollowButton';
import { showToast } from '@/components/ui/Toast';
import { Screen, AppBar, Text, Row, Col, Button, IconButton, Sheet, ListGroup, ListRow, Surface, SectionHeader, EmptyState, ListSkeleton, useBreakpoint } from '@/design';
import { ProfileHeader } from '@/features/community/ProfileHeader';
import { SnippetCard } from '@/features/community/SnippetCard';

const PAGE = 10;

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isDesktop } = useBreakpoint();
  const { likedSnippets, toggleLike, syncLikes, updateLikeCounts, getLikeCount, updateViewCounts, getViewCount, updateCommentCounts, getCommentCount } = useApp();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [snippets, setSnippets] = useState<FeedSnippet[]>([]);
  const [snippetsLoading, setSnippetsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msgBusy, setMsgBusy] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [menu, setMenu] = useState<null | 'menu' | 'confirmBlock'>(null);
  const [report, setReport] = useState(false);

  const isOwn = user?.id === id;

  useEffect(() => {
    if (!id) return;
    if (isOwn) {
      router.replace('/profile');
      return;
    }
    (async () => {
      setLoading(true);
      const { data } = await getPublicProfile(id);
      if (data) {
        setProfile(data);
        setFollowers(data.followers_count || 0);
      }
      if (user?.id) {
        const [f, b] = await Promise.all([checkIsFollowing(user.id, id), isUserBlocked(id)]);
        setFollowing(f);
        setBlocked(b);
      }
      setLoading(false);
    })();
  }, [id, user?.id]);

  const loadSnippets = useCallback(
    async (p = 0, append = false) => {
      if (!id) return;
      if (!append) setSnippetsLoading(true);
      const { data } = await getPublicSnippets({ limit: PAGE, page: p, userId: id });
      const list = data ?? [];
      setSnippets((prev) => (append ? [...prev, ...list.filter((d) => !prev.some((x) => x.id === d.id))] : list));
      setHasMore(list.length === PAGE);
      if (list.length) {
        const ids = list.map((s) => s.id);
        // F20: نفس مصدر الأرقام في المجتمع وصفحة الكود
        getSnippetCounts(ids)
          .then(({ likeCounts, viewCounts, commentCounts }) => {
            updateLikeCounts(likeCounts);
            updateViewCounts(viewCounts);
            updateCommentCounts(commentCounts);
          })
          .catch(() => undefined);
        if (user?.id) syncLikes(ids);
      }
      setSnippetsLoading(false);
    },
    [id, user?.id]
  );
  useEffect(() => {
    if (!isOwn) loadSnippets(0);
  }, [loadSnippets, isOwn]);

  const name = profile?.full_name || profile?.username || 'عضو';

  const message = async () => {
    if (!user?.id || !id) return;
    setMsgBusy(true);
    setMsgError(null);
    const { data: conversationId, error } = await getOrCreateConversation(user.id, id);
    setMsgBusy(false);
    if (error) {
      setMsgError(String(error?.message ?? '').includes('blocked') ? 'لا يمكن مراسلة هذا العضو.' : 'تعذّر فتح المحادثة. حاول مرة أخرى.');
      return;
    }
    if (conversationId) router.push(`/message/${conversationId}` as any);
  };

  const toggleBlock = async () => {
    if (!id || busy) return;
    setBusy(true);
    const res = blocked ? await unblockUser(id) : await blockUser(id);
    setBusy(false);
    setMenu(null);
    if (!res.success) return showToast.error(blocked ? 'تعذّر إلغاء الحظر. حاول مرة أخرى.' : 'تعذّر الحظر. حاول مرة أخرى.');
    const now = !blocked;
    setBlocked(now);
    if (now) {
      setSnippets([]);
      showToast.success(`تم حظر ${name}`);
    } else {
      showToast.success(`تم إلغاء حظر ${name}`);
      loadSnippets(0);
    }
  };

  const share = async () => {
    setMenu(null);
    const url = `https://kodax.app/user/${id}`;
    try {
      await Share.share({ message: `شاهد ملف ${name} في Kodax: ${url}`, url, title: `ملف ${name}` });
    } catch {
      // ألغى المستخدم المشاركة
    }
  };

  if (loading) {
    return (
      <Screen header={<AppBar title="الملف" fallback="/code" />} width="reading">
        <ListSkeleton rows={2} />
      </Screen>
    );
  }
  if (!profile) {
    return (
      <Screen header={<AppBar title="الملف" fallback="/code" />} width="reading">
        <EmptyState icon="person-outline" title="الحساب غير موجود" body="ممكن الحساب محذوف أو الرابط قديم." action="المجتمع" onAction={() => router.replace('/code')} />
      </Screen>
    );
  }

  const actions = blocked ? (
    <Surface variant="danger" padding={12}>
      <Text variant="bodySm" style={{ marginBottom: 8 }}>
        حظرت {name}. لا يستطيع مراسلتك ولا ترى أكواده.
      </Text>
      <Button label="إلغاء الحظر" variant="secondary" onPress={toggleBlock} loading={busy} style={{ alignSelf: 'flex-start' }} />
    </Surface>
  ) : user?.id ? (
    <Col gap={8}>
      <Row gap={8}>
        <View style={{ flex: 1 }}>
          <FollowButton
            currentUserId={user.id}
            targetUserId={id!}
            isFollowing={following}
            full
            onToggle={(v) => {
              setFollowing(v);
              setFollowers((n) => Math.max(0, n + (v ? 1 : -1)));
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="مراسلة" icon="chatbubble-ellipses-outline" variant="secondary" onPress={message} loading={msgBusy} full />
        </View>
      </Row>
      {!!msgError && (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {msgError}
        </Text>
      )}
    </Col>
  ) : null;

  return (
    <Screen width="reading" header={<AppBar title={name} fallback="/code" actions={<IconButton icon="ellipsis-horizontal" label="خيارات: مشاركة، إبلاغ، حظر" onPress={() => setMenu('menu')} />} />}>
      <Col gap={20}>
        <ProfileHeader id={profile.id} name={name} username={profile.username} avatarUrl={profile.avatar_url} verified={profile.is_verified} province={profile.province} createdAt={profile.created_at} xp={profile.xp || 0} followers={followers} following={profile.following_count || 0} actions={actions} />

        {!blocked && (
          <View>
            <SectionHeader title="أكواده المنشورة" />
            {snippetsLoading ? (
              <ListSkeleton rows={2} />
            ) : snippets.length === 0 ? (
              <EmptyState icon="code-slash-outline" title="ما نشر أكواد بعد" compact />
            ) : (
              <Col gap={12}>
                {snippets.map((s) => (
                  <SnippetCard
                    key={s.id}
                    snippet={s}
                    hideAuthor
                    previewLines={isDesktop ? 6 : 5}
                    liked={likedSnippets.has(s.id)}
                    likes={getLikeCount(s.id, s.likes_count)}
                    comments={getCommentCount(s.id, s.comments_count)}
                    views={getViewCount(s.id, s.views_count)}
                    onLike={user?.id ? () => toggleLike(s.id) : undefined}
                    onPress={() => router.push(`/code/${s.id}` as any)}
                  />
                ))}
                {hasMore && (
                  <Button
                    label="عرض المزيد"
                    variant="secondary"
                    onPress={() => {
                      setPage(page + 1);
                      loadSnippets(page + 1, true);
                    }}
                  />
                )}
              </Col>
            )}
          </View>
        )}
      </Col>

      <Sheet visible={menu !== null} onClose={() => setMenu(null)} title={menu === 'confirmBlock' ? `حظر ${name}؟` : name} maxWidth={420}>
        {menu === 'confirmBlock' ? (
          <Col gap={14}>
            <Text variant="body" tone="secondary">
              لن يستطيع مراسلتك، ولن ترى أكواده. يمكنك إلغاء الحظر لاحقاً من حسابي ← المستخدمون المحظورون.
            </Text>
            <Row gap={8}>
              <Button label="حظر" variant="danger" onPress={toggleBlock} loading={busy} style={{ flex: 1 }} />
              <Button label="إلغاء" variant="secondary" onPress={() => setMenu('menu')} style={{ flex: 1 }} />
            </Row>
          </Col>
        ) : (
          <ListGroup>
            <ListRow icon="share-social-outline" title="مشاركة الملف" onPress={share} chevron={false} />
            <ListRow
              icon="flag-outline"
              title="إبلاغ"
              subtitle="يراجعه فريق الإشراف"
              onPress={() => {
                setMenu(null);
                setReport(true);
              }}
              chevron={false}
            />
            <ListRow icon="ban-outline" title={blocked ? 'إلغاء الحظر' : 'حظر'} danger={!blocked} onPress={() => (blocked ? toggleBlock() : setMenu('confirmBlock'))} chevron={false} last />
          </ListGroup>
        )}
      </Sheet>
      <ReportUserSheet visible={report} onClose={() => setReport(false)} userId={id!} userName={name} hideBlock={blocked} onBlocked={() => {
        setBlocked(true);
        setSnippets([]);
      }} />
    </Screen>
  );
}

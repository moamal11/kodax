/**
 * الملف العام لعضو: الهوية والتقدم، متابعة/مراسلة (عرض كامل لكل زر)، وخيارات المشاركة والإبلاغ والحظر
 * في قائمة منفصلة، ثم منشوراته بنفس أرقام المجتمع (F20).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Share, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { getPublicProfile, type ProfileData } from '@/services/profileService';
import { checkIsFollowing } from '@/services/followService';
import { getSnippetCounts, blockUser, unblockUser, isUserBlocked } from '@/services/codeFeedService';
import { getOrCreateConversation } from '@/services/messageService';
import ReportUserSheet from '@/components/social/ReportUserSheet';
import FollowButton from '@/components/ui/FollowButton';
import { showToast } from '@/components/ui/Toast';
import { Screen, AppBar, Text, Row, Col, Button, IconButton, Sheet, ListGroup, ListRow, Surface, SectionHeader, EmptyState, ListSkeleton, useBreakpoint } from '@/design';
import { ProfileHeader } from '@/features/community/ProfileHeader';
import { getProfilePublications, type CommunityItem, type FeedCursor } from '@/services/communityService';
import { DiscussionCard } from '@/features/community/DiscussionCard';
import { SnippetCard } from '@/features/community/SnippetCard';
import { profilePath } from '@/services/profileLinks';
import { requestSignIn } from '@/services/webAccess';



export default function UserProfileScreen() {
  const { id: identifier } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isDesktop } = useBreakpoint();
  const { likedSnippets, toggleLike, syncLikes, updateLikeCounts, getLikeCount, updateViewCounts, getViewCount, updateCommentCounts, getCommentCount } = useApp();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [snippets, setSnippets] = useState<CommunityItem[]>([]);
  const [snippetsLoading, setSnippetsLoading] = useState(true);
  const [cursor, setCursor] = useState<FeedCursor | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [publicationsError, setPublicationsError] = useState('');
  const [moreLoading, setMoreLoading] = useState(false);
  const publicationRequest = useRef(0);
  const publicationBusy = useRef(false);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msgBusy, setMsgBusy] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [menu, setMenu] = useState<null | 'menu' | 'confirmBlock'>(null);
  const [report, setReport] = useState(false);

  const id=profile?.id||'';
  const isOwn = !!id&&user?.id === id;

  useEffect(() => {
    if (!identifier) return;
    let active=true;setProfile(null);setSnippets([]);setFollowing(false);setBlocked(false);
    (async () => {
      setLoading(true);
      const { data } = await getPublicProfile(identifier);
      if(!active)return;
      if (data) {
        if(data.id===user?.id){router.replace('/profile');return;}
        if(data.username&&identifier!==data.username){router.replace(profilePath(data.id,data.username) as any);return;}
        setProfile(data);
        setFollowers(data.followers_count || 0);
      }
      if (user?.id&&data) {
        const [f, b] = await Promise.all([checkIsFollowing(user.id, data.id), isUserBlocked(data.id)]);
        if(!active)return;
        setFollowing(f);
        setBlocked(b);
      }
      setLoading(false);
    })();
    return()=>{active=false;};
  }, [identifier, user?.id]);

  const loadSnippets = useCallback(async (next: FeedCursor | null = null, snap: string | null = null) => {
    if (!id || publicationBusy.current) return;
    const request = ++publicationRequest.current;
    publicationBusy.current = true;
    if (next) setMoreLoading(true); else setSnippetsLoading(true);
    setPublicationsError('');
    try {
      const result = await getProfilePublications(id, next, snap);
      if (request !== publicationRequest.current) return;
      setSnippets(previous => next ? [...previous, ...result.items.filter(item => !previous.some(old => old.type === item.type && old.id === item.id))] : result.items);
      setCursor(result.next);
      setSnapshot(result.snapshot);
      const ids = result.items.filter(item => item.type === 'code').map(item => item.id);
      if (ids.length) {
        getSnippetCounts(ids).then(({ likeCounts, viewCounts, commentCounts }) => {
          if (request !== publicationRequest.current) return;
          updateLikeCounts(likeCounts); updateViewCounts(viewCounts); updateCommentCounts(commentCounts);
        }).catch(() => undefined);
        if (user?.id) syncLikes(ids);
      }
    } catch (error) {
      if (request === publicationRequest.current) setPublicationsError(error instanceof Error ? error.message : 'تعذّر تحميل المنشورات.');
    } finally {
      if (request === publicationRequest.current) {
        publicationBusy.current = false; setSnippetsLoading(false); setMoreLoading(false);
      }
    }
  }, [id, user?.id, syncLikes, updateLikeCounts, updateViewCounts, updateCommentCounts]);
  useEffect(() => {
    publicationRequest.current++;
    publicationBusy.current = false;
    setSnippets([]); setCursor(null); setSnapshot(null); setPublicationsError(''); setMoreLoading(false);
    if (!isOwn && !blocked) void loadSnippets();
    return () => { publicationRequest.current++; publicationBusy.current = false; };
  }, [loadSnippets, isOwn, blocked]);

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
      loadSnippets();
    }
  };

  const share = async () => {
    setMenu(null);
    const url = `https://kodax.app${profilePath(id!,profile?.username)}`;
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
        حظرت {name}. لا يستطيع مراسلتك ولا ترى منشوراته.
      </Text>
      <Button label="إلغاء الحظر" variant="secondary" onPress={toggleBlock} loading={busy} style={{ alignSelf: 'flex-start' }} />
    </Surface>
  ) : user?.id ? (
    <Col gap={8} style={{ alignSelf: 'stretch' }}>
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
  ) : <Row gap={8}><Button label="متابعة" icon="person-add-outline" onPress={() => requestSignIn()} /><Button label="مراسلة" icon="chatbubble-ellipses-outline" variant="secondary" onPress={() => requestSignIn()} /></Row>;

  return (
    <Screen width="reading" padded={false} contentStyle={{ paddingTop: 0 }} header={<AppBar title={name} fallback="/code" actions={<IconButton icon="ellipsis-horizontal" label="خيارات: مشاركة، إبلاغ، حظر" onPress={() => setMenu('menu')} />} />}>
      <Col gap={20}>
        <ProfileHeader id={profile.id} name={name} username={profile.username} avatarUrl={profile.avatar_url} coverUrl={profile.cover_url} bio={profile.bio} followersVisible={profile.followers_visible} followingVisible={profile.following_visible} verified={profile.is_verified} province={profile.province} createdAt={profile.created_at} xp={profile.xp || 0} followers={followers} following={profile.following_count || 0} actions={actions} />

        {!blocked && (
          <View style={{ paddingHorizontal: 16 }}>
            <SectionHeader title="منشوراته" />
            {snippetsLoading ? (
              <ListSkeleton rows={2} />
            ) : publicationsError && snippets.length === 0 ? (
              <EmptyState icon="cloud-offline-outline" title={publicationsError} action="إعادة المحاولة" onAction={() => loadSnippets()} compact />
            ) : snippets.length === 0 ? (
              <EmptyState icon="code-slash-outline" title="ما نشر بعد" compact />
            ) : (
              <Col gap={12}>
                {snippets.map((item) => {
                  if (item.type === 'discussion') return (
                  <DiscussionCard key={`discussion-${item.id}`} post={item.data} hideAuthor
                    onPress={() => router.push(`/discussion/${item.id}` as any)}
                    onAuthorPress={() => {}}
                    onImageRetry={() => loadSnippets()} />
                  );
                  const s = item.data;
                  return (
                  <SnippetCard
                    key={`code-${s.id}`}
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
                  );
                })}
                {!!publicationsError && <Text variant="caption" tone="danger">{publicationsError}</Text>}
                {cursor && (
                  <Button
                    label="عرض المزيد"
                    variant="secondary"
                    loading={moreLoading}
                    onPress={() => loadSnippets(cursor, snapshot)}
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
              لن يستطيع مراسلتك، ولن ترى منشوراته. يمكنك إلغاء الحظر لاحقاً من حسابي ← المستخدمون المحظورون.
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
                if (user?.id) setReport(true); else requestSignIn();
              }}
              chevron={false}
            />
            <ListRow icon="ban-outline" title={blocked ? 'إلغاء الحظر' : 'حظر'} danger={!blocked} onPress={() => { if (!user?.id) { setMenu(null); requestSignIn(); return; } blocked ? toggleBlock() : setMenu('confirmBlock'); }} chevron={false} last />
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

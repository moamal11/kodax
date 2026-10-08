/**
 * المجتمع: أكواد الأعضاء (معاينة كود حقيقي)، بحث وتصفية وترتيب، و«اكتب كوداً» مباشرة.
 * الأعداد (إعجاب/تعليق/مشاهدة) من النظام المركزي في AppContext.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, RefreshControl, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Text, Row, Col, Button, Field, Chip, ChipBar, Sheet, EmptyState, ErrorState, ListSkeleton, useTheme, useBreakpoint } from '@/design';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { getPublicSnippets, getSnippetCounts, type FeedSnippet } from '@/services/codeFeedService';
import { SnippetCard } from '@/features/community/SnippetCard';
import { MessagesButton } from '@/components/ui/MessagesButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'python', label: 'Python' },
  { id: 'web', label: 'ويب' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'csharp', label: 'C#' },
  { id: 'sql', label: 'SQL' },
  { id: 'react', label: 'React' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'swift', label: 'Swift' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'dart', label: 'Dart' },
];
type Sort = 'recent' | 'popular' | 'most_liked' | 'most_viewed' | 'most_commented';
const SORTS: { id: Sort; label: string }[] = [
  { id: 'recent', label: 'الأحدث' },
  { id: 'popular', label: 'الأكثر تفاعلاً' },
  { id: 'most_liked', label: 'الأكثر إعجاباً' },
  { id: 'most_viewed', label: 'الأكثر مشاهدة' },
];

/** لغات «اكتب كوداً»: مجموعات صغيرة بدل بطاقات ضخمة */
const NEW_CODE_GROUPS: { title: string; items: { id: string; label: string; hint: string }[] }[] = [
  {
    title: 'الأكثر استخداماً',
    items: [
      { id: 'python', label: 'Python', hint: 'برنامج بايثون يُشغَّل مباشرة' },
      { id: 'web', label: 'مشروع ويب', hint: 'HTML و CSS و JavaScript مع معاينة' },
      { id: 'javascript', label: 'JavaScript', hint: 'سكربت يُشغَّل ويطبع الناتج' },
    ],
  },
  {
    title: 'لغات أخرى',
    items: [
      { id: 'typescript', label: 'TypeScript', hint: '' },
      { id: 'cpp', label: 'C++', hint: '' },
      { id: 'java', label: 'Java', hint: '' },
      { id: 'csharp', label: 'C#', hint: '' },
      { id: 'go', label: 'Go', hint: '' },
      { id: 'rust', label: 'Rust', hint: '' },
      { id: 'sql', label: 'SQL', hint: '' },
      { id: 'kotlin', label: 'Kotlin', hint: '' },
      { id: 'swift', label: 'Swift', hint: '' },
      { id: 'dart', label: 'Dart', hint: '' },
    ],
  },
];

const PAGE = 20;

export default function CommunityScreen() {
  const t = useTheme();
  const router = useRouter();
  const { user, authVersion } = useAuth();
  const { isDesktop, gutter } = useBreakpoint();
  const { likedSnippets, toggleLike, syncLikes, updateLikeCounts, getLikeCount, updateViewCounts, getViewCount, updateCommentCounts, getCommentCount, snippetLikeCounts } = useApp();

  const [items, setItems] = useState<FeedSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [picker, setPicker] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (p = 0, append = false) => {
      if (p === 0 && !append) setLoading(true);
      const { data, error: err } = await getPublicSnippets({ language: lang, sortBy: sort, search: query.trim() || undefined, page: p, limit: PAGE });
      if (err) {
        // C02: الخطأ لا يُعرض كقائمة فارغة
        if (!append) setError(true);
      } else {
        setError(false);
        setItems((prev) => (append ? [...prev, ...data.filter((d) => !prev.some((x) => x.id === d.id))] : data));
        setHasMore(data.length === PAGE);
        if (data.length) {
          const ids = data.map((s) => s.id);
          getSnippetCounts(ids)
            .then(({ likeCounts, viewCounts, commentCounts }) => {
              updateLikeCounts(likeCounts);
              updateViewCounts(viewCounts);
              updateCommentCounts(commentCounts);
            })
            .catch(() => undefined);
          if (user?.id) syncLikes(ids);
        }
      }
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    },
    [lang, sort, query, user?.id, syncLikes, updateLikeCounts, updateViewCounts, updateCommentCounts]
  );

  useEffect(() => {
    setPage(0);
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, sort, authVersion]);
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setPage(0);
      load(0);
    }, 450);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const more = () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    setPage(page + 1);
    load(page + 1, true);
  };

  const like = async (id: string) => {
    if (!user?.id) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    await toggleLike(id);
  };

  const filtersActive = lang !== 'all' || !!query.trim();
  const cols = isDesktop ? 2 : 1;

  const header = (
    <Col gap={14} style={{ paddingBottom: 14 }}>
      <Row gap={8}>
        <View style={{ flex: 1 }}>
          <Text variant="title" accessibilityRole="header">
            المجتمع
          </Text>
          <Text variant="bodySm" tone="secondary">
            أكواد يكتبها المتعلمون — اقرأ، جرّب، وعلّق.
          </Text>
        </View>
        {user?.id && <MessagesButton userId={user.id} />}
        <Button label="اكتب كوداً" icon="add" onPress={() => setPicker(true)} />
      </Row>
      <Field label="ابحث في الأكواد" hideLabel placeholder="ابحث بعنوان أو وصف…" icon="search" value={query} onChangeText={setQuery} returnKeyType="search" />
      <ChipBar>
        {FILTERS.map((f) => (
          <Chip key={f.id} label={f.label} selected={lang === f.id} onPress={() => setLang(f.id)} />
        ))}
      </ChipBar>
      <Row gap={6} wrap style={{ justifyContent: 'flex-start' }} accessibilityRole="radiogroup" accessibilityLabel="الترتيب">
        {SORTS.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => setSort(s.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: sort === s.id }}
            hitSlop={6}
            style={{ paddingVertical: 4, paddingHorizontal: 6, borderBottomWidth: 2, borderBottomColor: sort === s.id ? t.colors.brand : 'transparent' }}
          >
            <Text variant="label" tone={sort === s.id ? 'default' : 'muted'}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </Row>
    </Col>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <FlatList
        key={cols}
        data={loading || error ? [] : items}
        numColumns={cols}
        keyExtractor={(s) => s.id}
        columnWrapperStyle={cols > 1 ? { gap: 14, flexDirection: 'row-reverse' } : undefined}
        contentContainerStyle={{ width: '100%', maxWidth: t.layout.maxContent + gutter * 2, alignSelf: 'center', paddingHorizontal: gutter, paddingTop: 10, paddingBottom: 32, gap: 14 }}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <SnippetCard
              snippet={item}
              liked={likedSnippets.has(item.id)}
              likes={getLikeCount(item.id, item.likes_count)}
              comments={getCommentCount(item.id, item.comments_count)}
              views={getViewCount(item.id, item.views_count)}
              onLike={user?.id ? () => like(item.id) : undefined}
              onPress={() => router.push(`/code/${item.id}` as any)}
              onAuthorPress={() => router.push(item.user_id === user?.id ? '/profile' : (`/user/${item.user_id}` as any))}
            />
          </View>
        )}
        extraData={[likedSnippets, snippetLikeCounts]}
        ListEmptyComponent={
          loading ? (
            <ListSkeleton rows={3} />
          ) : error ? (
            <ErrorState onRetry={() => load(0)} />
          ) : filtersActive ? (
            <EmptyState
              icon="search-outline"
              title="ماكو أكواد بهذا البحث"
              body="جرّب كلمة ثانية أو اختر «الكل»."
              action="امسح البحث"
              onAction={() => {
                setQuery('');
                setLang('all');
              }}
            />
          ) : (
            <EmptyState icon="code-slash-outline" title="المجتمع بانتظار أول كود" body="شارك أول برنامج كتبته — حتى لو صغير." action="اكتب كوداً" onAction={() => setPicker(true)} />
          )
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator color={t.colors.brand} style={{ marginVertical: 16 }} /> : hasMore && items.length >= PAGE ? <Button label="عرض المزيد" variant="secondary" onPress={more} style={{ marginTop: 4 }} /> : null}
        onEndReached={more}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setPage(0);
              load(0);
            }}
            tintColor={t.colors.brand}
          />
        }
      />

      <Sheet visible={picker} onClose={() => setPicker(false)} title="بأي لغة تكتب؟" maxWidth={460}>
        <Col gap={16}>
          {NEW_CODE_GROUPS.map((g) => (
            <View key={g.title} style={{ gap: 6 }}>
              <Text variant="caption" tone="muted" weight="semibold">
                {g.title}
              </Text>
              <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 }}>
                {g.items.map((it) => (
                  <Pressable
                    key={it.id}
                    onPress={() => {
                      setPicker(false);
                      router.push(`/code/add?lang=${it.id}` as any);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={it.hint ? `${it.label}، ${it.hint}` : it.label}
                    style={(s: any) => ({
                      flexBasis: it.hint ? '100%' : 96,
                      flexGrow: it.hint ? 0 : 1,
                      flexDirection: 'row-reverse',
                      alignItems: 'center',
                      gap: 10,
                      minHeight: 48,
                      paddingHorizontal: 12,
                      borderRadius: t.radius.md,
                      borderWidth: 1,
                      borderColor: t.colors.border,
                      backgroundColor: s.hovered || s.pressed ? t.colors.surfacePressed : t.colors.surface,
                    })}
                  >
                    <View style={{ flex: 1 }}>
                      <Text variant="label" weight="semibold" ltr={!it.hint && !/[؀-ۿ]/.test(it.label)} align={it.hint ? 'right' : 'center'}>
                        {it.label}
                      </Text>
                      {!!it.hint && (
                        <Text variant="caption" tone="muted">
                          {it.hint}
                        </Text>
                      )}
                    </View>
                    {!!it.hint && <Ionicons name="chevron-back" size={16} color={t.colors.textMuted} />}
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </Col>
      </Sheet>
    </SafeAreaView>
  );
}

/**
 * تصفح التحديات: فئة + صعوبة + بحث، الحالة (محلول/مقفل)، والمقفل يقود لدورته (F25).
 * يُستخدم في تبويب «تعلّم» وفي صفحة /challenges.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useTheme,
  Text,
  Row,
  Col,
  Chip,
  ChipBar,
  Segmented,
  Field,
  Tag,
  Button,
  Surface,
  EmptyState,
  Stat,
  ProgressBar,
  ListSkeleton,
  type IconName,
} from '@/design';
import {
  ALL_CHALLENGES,
  getChallengeAccessType,
  getChallengeRequiredCourseId,
  getCourseTitleById,
  isCourseAccessible,
  type Challenge,
} from '@/constants/courseData';
import { useAuth } from '@/contexts/AuthContext';
import { useCoins } from '@/contexts/CoinsContext';
import { hybridSyncService } from '@/services/hybridSyncService';
import { languageLabel } from '@/features/community/SnippetCard';
import { getChallengeDraftIds } from '@/services/challengeDraft';
import { JourneyNode } from '@/features/rewards/JourneyVisuals';

export const CHALLENGE_CATEGORIES: { id: string; label: string; icon: IconName }[] = [
  { id: 'all', label: 'الكل', icon: 'apps-outline' },
  { id: 'python', label: 'Python', icon: 'logo-python' },
  { id: 'javascript', label: 'JavaScript', icon: 'logo-javascript' },
  { id: 'web', label: 'HTML', icon: 'logo-html5' },
  { id: 'css', label: 'CSS', icon: 'color-palette-outline' },
  { id: 'react', label: 'React', icon: 'logo-react' },
  { id: 'algorithms', label: 'خوارزميات', icon: 'git-branch-outline' },
  { id: 'data-structures', label: 'هياكل البيانات', icon: 'git-network-outline' },
  { id: 'cyber', label: 'الأمن السيبراني', icon: 'shield-checkmark-outline' },
  { id: 'other', label: 'أخرى', icon: 'ellipsis-horizontal' },
];

export function challengeCategory(ch: Challenge): string {
  const lang = ch.language?.toLowerCase() || '';
  const cat = ch.category?.toLowerCase() || '';
  if (cat.includes('cyber') || cat.includes('security')) return 'cyber';
  if (cat.includes('algorithm')) return 'algorithms';
  if (cat.includes('data-structure') || cat.includes('array')) return 'data-structures';
  if (lang.includes('python')) return 'python';
  if (lang.includes('javascript') || lang === 'js') return 'javascript';
  if (lang.includes('css')) return 'css';
  if (lang.includes('html')) return 'web';
  if (lang.includes('react')) return 'react';
  if (cat.includes('web')) return 'web';
  return 'other';
}

const DIFF = {
  easy: { label: 'سهل', tone: 'success' as const },
  medium: { label: 'متوسط', tone: 'warning' as const },
  hard: { label: 'صعب', tone: 'danger' as const },
};
const PAGE = 20;

export function useChallengeLock() {
  const { userId } = useAuth();
  const { unlockedCourses } = useCoins();
  return useCallback(
    (ch: Challenge): { locked: boolean; courseId?: string } => {
      if (Platform.OS === 'web' && !userId) return { locked: false };
      if (getChallengeAccessType(ch) === 'free') return { locked: false };
      const courseId = getChallengeRequiredCourseId(ch);
      if (!courseId) return { locked: false };
      return { locked: !isCourseAccessible(courseId, unlockedCourses), courseId };
    },
    [unlockedCourses, userId]
  );
}

export function ChallengesBrowser() {
  const t = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const lockOf = useChallengeLock();
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [query, setQuery] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(PAGE);

  const load = useCallback(async () => {
    if (!user?.id) { setLoaded(true); return; }
    try {
      setLoadError(false);
      await hybridSyncService.setUser(user.id);
      const done = await hybridSyncService.fetchAllCompletedLessons();
      setDrafts(new Set(await getChallengeDraftIds(user.id)));
      setSolved(new Set(done.filter((id) => ALL_CHALLENGES.some((c) => c.id === id))));
      setLoaded(true);
    } catch {
      setLoadError(true);
    }
  }, [user?.id]);
  useEffect(() => {
    load();
  }, [load]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );
  useEffect(() => setVisible(PAGE), [category, difficulty, query]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: ALL_CHALLENGES.length };
    for (const ch of ALL_CHALLENGES) m[challengeCategory(ch)] = (m[challengeCategory(ch)] ?? 0) + 1;
    return m;
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_CHALLENGES.filter(
      (ch) =>
        (category === 'all' || challengeCategory(ch) === category) &&
        (difficulty === 'all' || ch.difficulty === difficulty) &&
        (!q || ch.title.toLowerCase().includes(q) || (ch.description ?? '').toLowerCase().includes(q))
    )
      .map((ch) => ({ ch, ...lockOf(ch), solved: solved.has(ch.id) }))
      .sort((a, b) => Number(a.locked) - Number(b.locked) || Number(a.solved) - Number(b.solved));
  }, [category, difficulty, query, lockOf, solved]);

  const nextChallenge = loaded ? list.find((item) => !item.locked && !item.solved)?.ch : undefined;
  const earnedXp = useMemo(() => ALL_CHALLENGES.filter((c) => solved.has(c.id)).reduce((s, c) => s + (c.points || 0), 0), [solved]);

  return (
    <Col gap={14}>
      {loadError && !loaded ? (
        <Surface padding={14}>
          <Col gap={8}>
            <Text tone="secondary">تعذّر تحميل تقدم التحديات.</Text>
            <Button label="إعادة المحاولة" variant="secondary" onPress={load} />
          </Col>
        </Surface>
      ) : !loaded ? (
        <ListSkeleton rows={1} />
      ) : (
        <Row gap={12} style={{ paddingVertical: 8 }}>
          <JourneyNode state={solved.size ? 'completed' : 'upcoming'} size={38} />
          <Col flex={1}>
            <Text variant="heading">اختبر اللي تعلّمته</Text>
            <Text variant="bodySm" tone="secondary">
              {solved.size} من {ALL_CHALLENGES.length} تحديًا مكتملًا
            </Text>
          </Col>
        </Row>
      )}
      {nextChallenge && (
        <Surface padding={16}>
          <Row gap={12} align="flex-start">
            <JourneyNode state="current" size={44} />
            <Col gap={10} flex={1}>
              <Row justify="space-between" gap={8}>
                <Text variant="label" tone="secondary">
                  التحدي التالي
                </Text>
                <Tag label={`+${nextChallenge.points} XP`} tone="xp" />
              </Row>
              <Text variant="heading">{nextChallenge.title}</Text>
              <Text variant="bodySm" tone="secondary" numberOfLines={2}>
                {nextChallenge.description}
              </Text>
              <Button label="حلّ التحدي" icon="code-slash-outline" full onPress={() => router.push(`/challenge/${nextChallenge.id}` as any)} />
            </Col>
          </Row>
        </Surface>
      )}
      <Field label="ابحث في التحديات" hideLabel placeholder="ابحث باسم التحدي…" icon="search" value={query} onChangeText={setQuery} returnKeyType="search" />
      <ChipBar>
        {CHALLENGE_CATEGORIES.filter((c) => counts[c.id]).map((c) => (
          <Chip key={c.id} label={c.label} icon={c.icon} selected={category === c.id} onPress={() => setCategory(c.id)} count={counts[c.id]} />
        ))}
      </ChipBar>
      <Segmented
        value={difficulty}
        onChange={setDifficulty}
        options={[
          { value: 'all', label: 'كل المستويات' },
          { value: 'easy', label: 'سهل' },
          { value: 'medium', label: 'متوسط' },
          { value: 'hard', label: 'صعب' },
        ]}
      />
      <Text variant="caption" tone="muted">
        {list.length} تحدٍّ
      </Text>
      {list.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="ماكو تحديات بهذه الفلاتر"
          body="جرّب فئة أو مستوى ثاني، أو امسح البحث."
          action="امسح الفلاتر"
          onAction={() => {
            setCategory('all');
            setDifficulty('all');
            setQuery('');
          }}
          compact
        />
      ) : (
        <View style={{ borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, overflow: 'hidden', backgroundColor: t.colors.surface }}>
          {list.slice(0, visible).map(({ ch, locked, courseId, solved: isSolved }, i) => (
            <ChallengeRow
              key={ch.id}
              ch={ch}
              locked={locked}
              courseId={courseId}
              solved={isSolved}
              attempting={drafts.has(ch.id)}
              last={i === Math.min(visible, list.length) - 1}
              onPress={() => (locked && courseId ? router.push(`/course/${courseId}` as any) : router.push(`/challenge/${ch.id}` as any))}
            />
          ))}
        </View>
      )}
      {visible < list.length && <Button label={`عرض المزيد (${list.length - visible})`} variant="secondary" onPress={() => setVisible((v) => v + PAGE)} />}
    </Col>
  );
}

function ChallengeRow({
  ch,
  locked,
  courseId,
  solved,
  attempting,
  onPress,
  last,
}: {
  ch: Challenge;
  locked: boolean;
  courseId?: string;
  solved: boolean;
  attempting: boolean;
  onPress: () => void;
  last: boolean;
}) {
  const t = useTheme();
  const d = DIFF[ch.difficulty] ?? DIFF.easy;
  const lockText = locked && courseId ? `افتح دورة «${getCourseTitleById(courseId)}» للوصول لهذا التحدي` : '';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${ch.title}، ${d.label}، ${ch.points} XP${solved ? '، محلول' : ''}${locked ? `، مقفل. ${lockText}` : ''}`}
      style={(s: any) => ({ backgroundColor: s.pressed || s.hovered ? t.colors.surfacePressed : 'transparent' })}
    >
      <Row
        gap={12}
        align="flex-start"
        style={{ paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: t.colors.border }}
      >
        <JourneyNode state={solved ? 'completed' : locked ? 'locked' : attempting ? 'current' : 'upcoming'} size={36} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="body" weight="semibold" numberOfLines={1} tone={locked ? 'secondary' : 'default'}>
            {ch.title}
          </Text>
          {locked ? (
            <Text variant="caption" tone="warning" numberOfLines={2}>
              {lockText}
            </Text>
          ) : (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {ch.description}
            </Text>
          )}
          <Row gap={6} style={{ justifyContent: 'flex-start', marginTop: 2 }} wrap>
            <Tag label={languageLabel(ch.language) || ch.language} />
            <Tag label={d.label} tone={d.tone} />
            <Tag
              label={solved ? 'مكتمل' : attempting ? 'قيد المحاولة · مسودة' : locked ? 'مقفل' : 'متاح'}
              tone={solved ? 'xp' : attempting ? 'brand' : 'muted'}
            />
            {!solved && (
              <Text variant="caption" tone="xp" ltr>
                +{ch.points} XP
              </Text>
            )}
          </Row>
        </View>
        <Ionicons name="chevron-back" size={18} color={t.colors.textMuted} style={{ marginTop: 10 }} />
      </Row>
    </Pressable>
  );
}

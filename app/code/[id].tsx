/**
 * صفحة كود من المجتمع: الكاتب، الكود (أو ملفات مشروع الويب مع معاينة)، التشغيل، التعليقات.
 * التعديل للمالك ونسخة خاصة لغيره عبر المحرر. الأعداد من النظام المركزي (AppContext).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { getSnippetById, getComments, addComment, incrementViews, getSnippetCounts, type FeedSnippet, type SnippetComment } from '@/services/codeFeedService';
import { checkIsFollowing } from '@/services/followService';
import { executeCode } from '@/services/codeExecution';
import FollowButton from '@/components/ui/FollowButton';
import SnippetModerationSheet from '@/components/editor/SnippetModerationSheet';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { timeAgo } from '@/components/editor/NotificationButton';
import { languageLabel } from '@/features/community/SnippetCard';
import { Screen, AppBar, Text, Row, Col, Avatar, Button, IconButton, CodeView, Field, Segmented, Surface, Tag, EmptyState, ListSkeleton, SectionHeader, useTheme, useBreakpoint } from '@/design';

interface ProjectFiles {
  html: string;
  css: string;
  js: string;
}
function parseProject(code: string): ProjectFiles | null {
  if (!code.includes('<!-- HTML -->') || !code.includes('<style>') || !code.includes('<script>')) return null;
  const html = code.match(/<!-- HTML -->\n([\s\S]*?)\n\n<style>/);
  const css = code.match(/<style>\n([\s\S]*?)\n<\/style>/);
  const js = code.match(/<script>\n([\s\S]*?)\n<\/script>/);
  return html && css && js ? { html: html[1], css: css[1], js: js[1] } : null;
}
function previewDoc(p: ProjectFiles): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${p.css}</style></head><body>${p.html
    .replace(/<link[^>]*href=["']style\.css["'][^>]*\/?>/gi, '')
    .replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi, '')}<script>${p.js}<\/script></body></html>`;
}

/** تشغيل JS داخل الصفحة بالتقاط console */
function runJs(code: string): string {
  const logs: string[] = [];
  const fmt = (a: any[]) => a.map((x) => (typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x))).join(' ');
  const c = { log: (...a: any[]) => logs.push(fmt(a)), error: (...a: any[]) => logs.push('خطأ: ' + fmt(a)), warn: (...a: any[]) => logs.push('تحذير: ' + fmt(a)), info: (...a: any[]) => logs.push(fmt(a)) };
  try {
    const r = new Function('__c', code.replace(/console\.(log|error|warn|info)/g, '__c.$1'))(c);
    if (r !== undefined && !logs.length) logs.push('→ ' + String(r));
  } catch (e: any) {
    logs.push('خطأ: ' + (e?.message || String(e)));
  }
  return logs.join('\n');
}

type Run = { state: 'running' } | { state: 'done'; ok: boolean; output: string };

export default function SnippetScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isDesktop } = useBreakpoint();
  const { likedSnippets, toggleLike, syncLikes, updateLikeCounts, getLikeCount, updateViewCounts, getViewCount, updateCommentCounts, getCommentCount } = useApp();

  const [snippet, setSnippet] = useState<FeedSnippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<SnippetComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState<keyof ProjectFiles>('html');
  const [preview, setPreview] = useState(false);
  const [moderation, setModeration] = useState(false);
  const [run, setRun] = useState<Run | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data, error } = await getSnippetById(id);
      if (!error && data) {
        setSnippet(data);
        syncLikes([id]);
        try {
          const { likeCounts, viewCounts, commentCounts } = await getSnippetCounts([id]);
          updateLikeCounts(likeCounts);
          updateViewCounts(viewCounts);
          updateCommentCounts(commentCounts);
        } catch {
          updateLikeCounts({ [id]: data.likes_count || 0 });
          updateViewCounts({ [id]: data.views_count || 0 });
          updateCommentCounts({ [id]: data.comments_count || 0 });
        }
        incrementViews(id, user?.id).then(() => updateViewCounts({ [id]: getViewCount(id, data.views_count || 0) + 1 }));
        if (user?.id && data.user_id !== user.id) setFollowing(await checkIsFollowing(user.id, data.user_id));
      }
      setLoading(false);
    })();
    (async () => {
      setLoadingComments(true);
      const { data } = await getComments(id);
      setComments(data);
      setLoadingComments(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const project = useMemo(() => (snippet ? parseProject(snippet.code) : null), [snippet?.code]);
  const previewHtml = useMemo(() => (project ? previewDoc(project) : snippet?.language === 'html' ? snippet.code : ''), [project, snippet?.code, snippet?.language]);

  const like = async () => {
    if (!user?.id || !id) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    await toggleLike(id);
  };
  const copy = async () => {
    if (!snippet) return;
    await Clipboard.setStringAsync(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const send = async () => {
    if (!user?.id || !id || !draft.trim()) return;
    setSending(true);
    setSendError(false);
    const { success } = await addComment(user.id, id, draft.trim());
    if (success) {
      setDraft('');
      const { data } = await getComments(id);
      setComments(data);
      updateCommentCounts({ [id]: data.length });
    } else setSendError(true);
    setSending(false);
  };
  const execute = useCallback(async () => {
    if (!snippet) return;
    if (project || snippet.language === 'html') return setPreview(true);
    if (['javascript', 'typescript', 'react'].includes(snippet.language)) {
      const out = runJs(snippet.code);
      return setRun({ state: 'done', ok: !out.startsWith('خطأ'), output: out || 'تم التنفيذ بنجاح (بلا مخرجات)' });
    }
    setRun({ state: 'running' });
    try {
      const r = await executeCode({ language: snippet.language, code: snippet.code });
      setRun({ state: 'done', ok: !!r.success, output: r.success ? r.output?.trim() || 'تم التنفيذ بنجاح (بلا مخرجات)' : r.error || 'خطأ غير معروف' });
    } catch (e: any) {
      setRun({ state: 'done', ok: false, output: `تعذّر الاتصال بخادم التشغيل: ${e?.message || 'تحقق من الإنترنت'}` });
    }
  }, [snippet, project]);
  const openEditor = () => {
    if (!snippet) return;
    router.push({ pathname: '/code/add', params: { editId: snippet.id, ownerId: snippet.user_id, code: snippet.code, editLang: snippet.language, editTitle: snippet.title || '', editDesc: snippet.description || '', lang: snippet.language } } as any);
  };

  if (loading) {
    return (
      <Screen header={<AppBar title="كود" fallback="/code" />}>
        <ListSkeleton rows={2} />
      </Screen>
    );
  }
  if (!snippet) {
    return (
      <Screen header={<AppBar title="كود" fallback="/code" />}>
        <EmptyState icon="document-outline" title="الكود غير موجود" body="ممكن صاحبه حذفه أو جعله خاصاً." action="المجتمع" onAction={() => router.replace('/code')} />
      </Screen>
    );
  }

  const isOwner = user?.id === snippet.user_id;
  const author = snippet.profiles;
  const authorName = author?.full_name || author?.username || 'عضو';
  const liked = likedSnippets.has(snippet.id);
  const likes = getLikeCount(snippet.id, snippet.likes_count);
  const views = getViewCount(snippet.id, snippet.views_count);
  const commentCount = getCommentCount(snippet.id, snippet.comments_count);
  const runnable = project || snippet.language === 'html';

  const codeArea = project ? (
    <Col gap={10}>
      <Segmented
        value={tab}
        onChange={(v) => setTab(v)}
        options={[
          { value: 'html', label: 'index.html' },
          { value: 'css', label: 'style.css' },
          { value: 'js', label: 'script.js' },
        ]}
      />
      <CodeView code={project[tab]} language={tab === 'js' ? 'javascript' : tab} />
    </Col>
  ) : (
    <CodeView
      code={snippet.code}
      language={snippet.language}
      title={languageLabel(snippet.language)}
      actions={<IconButton icon={copied ? 'checkmark' : 'copy-outline'} label={copied ? 'تم النسخ' : 'نسخ الكود'} size={18} onPress={copy} color={copied ? t.colors.successText : t.colors.codeMuted} />}
    />
  );

  const commentsBlock = (
    <View>
      <SectionHeader title={`التعليقات${commentCount ? ` (${commentCount})` : ''}`} />
      {user?.id ? (
        <Row gap={8} align="flex-end" style={{ marginBottom: 12 }}>
          <Field label="اكتب تعليقاً" hideLabel placeholder="سؤال، فكرة، أو تشجيع…" value={draft} onChangeText={setDraft} multiline minHeight={48} maxLength={1000} style={{ flex: 1 }} error={sendError ? 'لم يُرسل التعليق. حاول مرة أخرى.' : null} />
          <IconButton icon="send" label="إرسال التعليق" variant="brand" onPress={send} disabled={!draft.trim() || sending} style={{ marginBottom: sendError ? 26 : 2, transform: [{ scaleX: -1 }] }} />
        </Row>
      ) : null}
      {loadingComments ? (
        <ListSkeleton rows={2} />
      ) : comments.length === 0 ? (
        <Text variant="bodySm" tone="muted" style={{ paddingVertical: 8 }}>
          ماكو تعليقات بعد. كن أول من يعلّق.
        </Text>
      ) : (
        <Col gap={14}>
          {comments.map((c) => {
            const name = c.profiles?.full_name || c.profiles?.username || 'عضو';
            return (
              <Row key={c.id} gap={10} align="flex-start">
                <Pressable onPress={() => router.push(c.user_id === user?.id ? '/profile' : (`/user/${c.user_id}` as any))} accessibilityRole="link" accessibilityLabel={`ملف ${name}`}>
                  <Avatar uri={c.profiles?.avatar_url} name={name} size={32} />
                </Pressable>
                <View style={{ flex: 1, gap: 2 }}>
                  <Row gap={6} style={{ justifyContent: 'flex-start' }}>
                    <Text variant="label" weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
                      {name}
                    </Text>
                    <VerifiedBadge verified={c.profiles?.is_verified} size={13} />
                    <Text variant="caption" tone="muted">
                      {timeAgo(new Date(c.created_at))}
                    </Text>
                  </Row>
                  <Text variant="body" tone="secondary" selectable>
                    {c.content}
                  </Text>
                </View>
              </Row>
            );
          })}
        </Col>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <Screen
        width="reading"
        header={
          <AppBar
            title={snippet.title}
            subtitle={languageLabel(snippet.language)}
            fallback="/code"
            actions={<IconButton icon="ellipsis-horizontal" label={isOwner ? 'خيارات الكود' : 'إبلاغ أو حظر'} onPress={() => setModeration(true)} />}
          />
        }
      >
        <Col gap={18}>
          <Row gap={10}>
            <Pressable onPress={() => router.push(isOwner ? '/profile' : (`/user/${snippet.user_id}` as any))} accessibilityRole="link" accessibilityLabel={`ملف ${authorName}`} style={{ flex: 1 }}>
              <Row gap={10}>
                <Avatar uri={author?.avatar_url} name={authorName} size={40} />
                <View style={{ flex: 1 }}>
                  <Row gap={4} style={{ justifyContent: 'flex-start' }}>
                    <Text variant="label" weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
                      {authorName}
                    </Text>
                    <VerifiedBadge verified={author?.is_verified} size={14} />
                  </Row>
                  <Text variant="caption" tone="muted">
                    {timeAgo(new Date(snippet.created_at))}
                    {!snippet.is_public ? ' · خاص' : ''}
                  </Text>
                </View>
              </Row>
            </Pressable>
            {user?.id && !isOwner && <FollowButton currentUserId={user.id} targetUserId={snippet.user_id} isFollowing={following} onToggle={setFollowing} compact />}
          </Row>

          <View style={{ gap: 6 }}>
            <Text variant="title">{snippet.title}</Text>
            {!!snippet.description && (
              <Text variant="body" tone="secondary">
                {snippet.description}
              </Text>
            )}
          </View>

          {codeArea}

          <Row gap={8} wrap>
            <Button label={runnable ? 'معاينة' : 'شغّل'} icon={runnable ? 'eye-outline' : 'play'} variant="success" onPress={execute} loading={run?.state === 'running'} />
            <Button label={isOwner ? 'تعديل' : 'نسخة لي'} icon={isOwner ? 'create-outline' : 'git-branch-outline'} variant="secondary" onPress={openEditor} accessibilityHint={isOwner ? undefined : 'يفتح الكود في المحرر لتحفظ نسختك الخاصة'} />
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={like}
              disabled={!user?.id}
              accessibilityRole="button"
              accessibilityState={{ selected: liked }}
              accessibilityLabel={liked ? `إلغاء الإعجاب، ${likes}` : `إعجاب، ${likes}`}
              style={(s: any) => ({ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 10, borderRadius: t.radius.md, backgroundColor: s.hovered || s.pressed ? t.colors.surfacePressed : 'transparent' })}
            >
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? t.colors.dangerText : t.colors.textSecondary} />
              <Text variant="label" tabular>
                {likes}
              </Text>
            </Pressable>
            <Row gap={6} style={{ paddingHorizontal: 6 }} accessible accessibilityLabel={`${views} مشاهدة`}>
              <Ionicons name="eye-outline" size={18} color={t.colors.textMuted} />
              <Text variant="label" tone="muted" tabular>
                {views}
              </Text>
            </Row>
          </Row>

          {run && (
            <Surface padding={0} style={{ overflow: 'hidden' }} accessibilityLiveRegion="polite">
              <Row justify="space-between" style={{ paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: t.colors.border }}>
                <Row gap={6}>
                  {run.state === 'running' ? <ActivityIndicator size="small" color={t.colors.brand} /> : <Ionicons name={run.ok ? 'checkmark-circle' : 'alert-circle'} size={16} color={run.ok ? t.colors.successText : t.colors.dangerText} />}
                  <Text variant="label">{run.state === 'running' ? 'جارٍ التشغيل…' : 'الناتج'}</Text>
                </Row>
                <IconButton icon="close" label="إغلاق الناتج" size={18} onPress={() => setRun(null)} />
              </Row>
              {run.state === 'done' && (
                <Text mono ltr variant="bodySm" selectable style={{ padding: 12, color: run.ok ? t.colors.codeText : t.colors.dangerText, backgroundColor: t.colors.codeBg }}>
                  {run.output}
                </Text>
              )}
            </Surface>
          )}

          {commentsBlock}
        </Col>
      </Screen>

      <Modal visible={preview} animationType="slide" onRequestClose={() => setPreview(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }}>
          <AppBar title="معاينة" subtitle={snippet.title} back={false} actions={<IconButton icon="close" label="إغلاق المعاينة" onPress={() => setPreview(false)} />} border />
          <View style={{ flex: 1, margin: isDesktop ? 24 : 8, borderRadius: t.radius.md, overflow: 'hidden', backgroundColor: '#fff' }}>
            {Platform.OS === 'web' ? (
              // @ts-ignore — عنصر DOM على الويب فقط
              <iframe srcDoc={previewHtml} style={{ width: '100%', height: '100%', border: 'none' }} sandbox="allow-scripts allow-same-origin" title="معاينة المشروع" />
            ) : (
              <WebView originWhitelist={['*']} source={{ html: previewHtml }} style={{ flex: 1, backgroundColor: '#fff' }} javaScriptEnabled domStorageEnabled />
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <SnippetModerationSheet
        visible={moderation}
        onClose={() => setModeration(false)}
        snippetId={snippet.id}
        authorId={snippet.user_id}
        authorName={authorName}
        isOwner={isOwner}
        isPublic={snippet.is_public}
        onDeleted={() => router.back()}
        onVisibilityChanged={(pub) => setSnippet({ ...snippet, is_public: pub })}
        onBlocked={() => router.back()}
      />
    </KeyboardAvoidingView>
  );
}

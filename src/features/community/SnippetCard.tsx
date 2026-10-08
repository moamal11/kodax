/**
 * بطاقة كود من المجتمع: الكاتب، العنوان، معاينة الكود الحقيقي، والأرقام.
 * تُستخدم في المجتمع والرئيسية والملفات الشخصية.
 */
import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Text, Row, Avatar, CodeView, Tag, Surface } from '@/design';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { timeAgo } from '@/components/editor/NotificationButton';
import type { FeedSnippet } from '@/services/codeFeedService';

export const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  html: 'ويب',
  css: 'CSS',
  web: 'ويب',
  cpp: 'C++',
  c: 'C',
  java: 'Java',
  csharp: 'C#',
  php: 'PHP',
  sql: 'SQL',
  dart: 'Dart',
  kotlin: 'Kotlin',
  swift: 'Swift',
  go: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
};
export const languageLabel = (l?: string | null) => (l ? LANGUAGE_LABELS[l.toLowerCase()] ?? l : '');

/** مشروع ويب محفوظ ككتلة HTML/CSS/JS واحدة: نعاين جزء HTML فقط */
function previewCode(s: FeedSnippet): string {
  const code = s.code ?? '';
  if ((s.language === 'html' || s.language === 'web') && code.startsWith('<!-- HTML -->')) {
    return code.replace('<!-- HTML -->\n', '').split('\n\n<style>')[0];
  }
  return code;
}

type Props = {
  snippet: FeedSnippet;
  onPress: () => void;
  onAuthorPress?: () => void;
  likes?: number;
  comments?: number;
  views?: number;
  liked?: boolean;
  onLike?: () => void;
  /** يخفي سطر الكاتب (في صفحة ملف الكاتب نفسه) */
  hideAuthor?: boolean;
  previewLines?: number;
};

export function SnippetCard({ snippet, onPress, onAuthorPress, likes, comments, views, liked, onLike, hideAuthor, previewLines = 6 }: Props) {
  const t = useTheme();
  const c = t.colors;
  const author = snippet.profiles;
  const name = author?.full_name || author?.username || 'عضو';
  const likeN = likes ?? snippet.likes_count ?? 0;
  const commentN = comments ?? snippet.comments_count ?? 0;
  const viewN = views ?? snippet.views_count ?? 0;
  return (
    <Surface padding={0} style={{ overflow: 'hidden' }}>
      {!hideAuthor && (
        <Pressable onPress={onAuthorPress} disabled={!onAuthorPress} accessibilityRole="link" accessibilityLabel={`ملف ${name}`}>
          <Row gap={10} style={{ paddingHorizontal: 14, paddingTop: 12 }}>
            <Avatar uri={author?.avatar_url} name={name} size={32} />
            <View style={{ flex: 1 }}>
              <Row gap={4} style={{ justifyContent: 'flex-start' }}>
                <Text variant="label" weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {name}
                </Text>
                <VerifiedBadge verified={author?.is_verified} size={14} />
              </Row>
              <Text variant="caption" tone="muted">
                {timeAgo(new Date(snippet.created_at))}
              </Text>
            </View>
            <Tag label={languageLabel(snippet.language)} tone="brand" />
          </Row>
        </Pressable>
      )}
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${snippet.title}، ${languageLabel(snippet.language)}`} style={(s: any) => ({ backgroundColor: s.hovered ? c.surfacePressed : 'transparent' })}>
        <View style={{ paddingHorizontal: 14, paddingTop: 10, gap: 4 }}>
          {hideAuthor && <Tag label={languageLabel(snippet.language)} tone="brand" />}
          <Text variant="heading" numberOfLines={2}>
            {snippet.title}
          </Text>
          {!!snippet.description && (
            <Text variant="bodySm" tone="secondary" numberOfLines={2}>
              {snippet.description}
            </Text>
          )}
        </View>
        <View style={{ paddingHorizontal: 14, paddingTop: 10 }} pointerEvents="none">
          <CodeView code={previewCode(snippet)} language={snippet.language === 'web' ? 'html' : snippet.language} maxLines={previewLines} size="sm" />
        </View>
      </Pressable>
      <Row gap={4} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
        <Pressable
          onPress={onLike}
          disabled={!onLike}
          accessibilityRole="button"
          accessibilityLabel={liked ? `إلغاء الإعجاب، ${likeN} إعجاب` : `إعجاب، ${likeN}`}
          accessibilityState={{ selected: !!liked }}
          hitSlop={4}
          style={(s: any) => ({ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 8, borderRadius: t.radius.sm, backgroundColor: s.pressed || s.hovered ? c.surfacePressed : 'transparent' })}
        >
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? c.dangerText : c.textMuted} />
          <Text variant="label" tone="muted" tabular>
            {likeN}
          </Text>
        </Pressable>
        <Row gap={6} style={{ paddingHorizontal: 8 }} accessible accessibilityLabel={`${commentN} تعليق`}>
          <Ionicons name="chatbox-outline" size={17} color={c.textMuted} />
          <Text variant="label" tone="muted" tabular>
            {commentN}
          </Text>
        </Row>
        <Row gap={6} style={{ paddingHorizontal: 8 }} accessible accessibilityLabel={`${viewN} مشاهدة`}>
          <Ionicons name="eye-outline" size={17} color={c.textMuted} />
          <Text variant="label" tone="muted" tabular>
            {viewN}
          </Text>
        </Row>
      </Row>
    </Surface>
  );
}

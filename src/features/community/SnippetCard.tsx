import { requestSignIn } from '@/services/webAccess';
import { LanguageIcon } from '@/components/editor/LanguageIcon';
/**
 * بطاقة كود من المجتمع: الكاتب، العنوان، معاينة الكود الحقيقي، والأرقام.
 * تُستخدم في المجتمع والرئيسية والملفات الشخصية.
 */
import React,{useState,useRef} from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Text, Row, Avatar, Tag, Surface } from '@/design';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { timeAgo } from '@/components/editor/NotificationButton';
import type { FeedSnippet } from '@/services/codeFeedService';
import { CodeResultPreview } from './CodeResultPreview';
import { SocialActions } from './SocialActions';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

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
export const languageLabel = (l?: string | null) => (l ? (LANGUAGE_LABELS[l.toLowerCase()] ?? l) : '');

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
  hideStats?: boolean;
};

export function SnippetCard({ snippet, onPress, onAuthorPress, likes, comments, views, liked, onLike, hideAuthor, hideStats }: Props) {
  const t = useTheme();
  const c = t.colors;
  const app=useApp(),{userId}=useAuth();const [pending,setPending]=useState(false),busy=useRef(false);
  const author = snippet.profiles;
  const name = author?.full_name || author?.username || 'عضو';
  const likeN = likes ?? app.getLikeCount(snippet.id,snippet.likes_count??0);
  const commentN = comments ?? snippet.comments_count ?? 0;
  const viewN = views ?? snippet.views_count ?? 0;
  const isLiked=liked??app.likedSnippets.has(snippet.id);
  const like=async()=>{if(!userId){requestSignIn();return;}if(busy.current)return;busy.current=true;setPending(true);try{await(onLike?onLike():app.toggleLike(snippet.id));}finally{busy.current=false;setPending(false);}};
  return (
    <Surface padding={0} style={{ overflow: 'hidden' }}>
      {!hideAuthor && (
        <Pressable onPress={onAuthorPress} disabled={!onAuthorPress} accessibilityRole="link" accessibilityLabel={`ملف ${name}`}>
          <Row gap={10} style={{ paddingHorizontal: 14, paddingTop: 12 }}>
            <Avatar uri={author?.avatar_url} name={name} size={32} />
            <View style={{ flex: 1 }}>
              <Row gap={4} style={{ justifyContent: 'flex-start' }}>
                <Text variant="label" weight="semibold" numberOfLines={2} style={{ flexShrink: 1 }}>
                  {name}
                </Text>
                <VerifiedBadge verified={author?.is_verified} size={14} />
              </Row>
              <Text variant="caption" tone="muted">
                {timeAgo(new Date(snippet.created_at))}
              </Text>
            </View>
            <Row gap={6}>
              <LanguageIcon language={snippet.language} size={19} />
              <Tag label={`كود · ${languageLabel(snippet.language)}`} tone="brand" />
            </Row>
          </Row>
        </Pressable>
      )}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${snippet.title}، ${languageLabel(snippet.language)}`}
        style={(s: any) => ({ backgroundColor: s.hovered ? c.surfacePressed : 'transparent' })}
      >
        <View style={{ paddingHorizontal: 14, paddingTop: 10, gap: 4 }}>
          {hideAuthor && (
            <Row gap={6}>
              <LanguageIcon language={snippet.language} size={19} />
              <Tag label={`كود · ${languageLabel(snippet.language)}`} tone="brand" />
            </Row>
          )}
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
          <CodeResultPreview code={snippet.code} language={snippet.language} />
        </View>
      </Pressable>
      {!hideStats && <View style={{paddingHorizontal:8,paddingVertical:6}}><SocialActions item={{type:'code',id:snippet.id,title:snippet.title}} likes={likeN} comments={commentN} views={viewN} liked={isLiked} onLike={like} pending={pending} onComments={onPress}/></View>}
      {hideStats && <View style={{ height: 14 }} />}
    </Surface>
  );
}

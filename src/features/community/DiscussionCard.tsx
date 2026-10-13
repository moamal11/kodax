import VerifiedBadge from '@/components/ui/VerifiedBadge';
import React from 'react';
import { Pressable } from 'react-native';
import { Row,Col,Text,Surface,Avatar,Tag } from '@/design';
import { timeAgo } from '@/components/editor/NotificationButton';
import { POST_KIND_LABEL,type CommunityPost } from '@/services/communityService';
import { DiscussionImage } from './DiscussionImage';
import { LanguageIcon } from '@/components/editor/LanguageIcon';
import { SocialActions } from './SocialActions';
import { usePostLike } from './usePostLike';
export const DiscussionCard=React.memo(function DiscussionCard({post,onPress,onAuthorPress,onImageRetry}:{post:CommunityPost;onPress:()=>void;onAuthorPress:()=>void;onImageRetry:()=>void}){
  const name=post.profiles?.full_name||post.profiles?.username||'عضو';
  const interaction=usePostLike(post),title=post.title||post.body.slice(0,60)||'منشور مصوّر';
  return <Surface padding={14}><Col gap={12}>
    <Pressable accessibilityRole="link" accessibilityLabel={`ملف ${name}`} onPress={onAuthorPress}><Row gap={10}><Avatar uri={post.profiles?.avatar_url} name={name} size={32}/><Col flex={1} gap={2}><Row gap={3}><Text variant="label" weight="semibold" numberOfLines={2} style={{flexShrink:1}}>{name}</Text><VerifiedBadge verified={post.profiles?.is_verified} size={14}/></Row><Text variant="caption" tone="secondary">{timeAgo(new Date(post.created_at))}</Text></Col><Tag label={POST_KIND_LABEL[post.kind]}/></Row></Pressable>
    <Pressable accessibilityRole="link" accessibilityLabel={`فتح النقاش ${title}`} onPress={onPress}><Col gap={6}>{!!post.title&&<Text variant="heading" numberOfLines={2}>{post.title}</Text>}{!!post.body&&<Text variant={post.title?'bodySm':'body'} tone={post.title?'secondary':'default'} numberOfLines={4}>{post.body}</Text>}{!post.body&&!!post.code&&<Text variant="bodySm" tone="secondary" numberOfLines={2}>مقطع كود {post.language||''}</Text>}</Col></Pressable>
    {!!post.image_path&&<DiscussionImage uri={post.image_url} compact onRetry={onImageRetry}/>}
    {(post.kind==='question'||post.language||post.topic)&&<Row gap={8} wrap>{post.kind==='question'&&<Tag label={post.accepted_comment_id?'سؤال محلول':'سؤال مفتوح'} tone={post.accepted_comment_id?'success':'muted'}/>}{!!post.language&&<Row gap={4}><LanguageIcon language={post.language} size={16}/><Text variant="caption" tone="secondary">{post.language}</Text></Row>}{!!post.topic&&<Text variant="caption" tone="secondary" numberOfLines={1} style={{flexShrink:1}}>{post.topic}</Text>}</Row>}
    <SocialActions item={{type:'discussion',id:post.id,title}} likes={interaction.count} comments={post.comments_count} liked={interaction.liked} pending={interaction.pending} onLike={interaction.like} onComments={onPress}/>
  </Col></Surface>;
});

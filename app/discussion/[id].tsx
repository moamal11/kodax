import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { profilePath } from '@/services/profileLinks';
import { requestSignIn } from '@/services/webAccess';
import React,{useCallback,useEffect,useRef,useState} from 'react';
import { ScrollView,View,Pressable } from 'react-native';
import { router,useLocalSearchParams,useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { AppBar,Screen,Col,Row,Text,Avatar,Tag,CodeView,Button,IconButton,Sheet,EmptyState,ErrorState,ListSkeleton,useReducedMotion } from '@/design';
import { getCommunityPost,deleteCommunityPost,getDiscussionComments,addDiscussionComment,editDiscussionComment,deleteDiscussionComment,setDiscussionSolution,notifyCommunity,POST_KIND_LABEL,type CommunityPost } from '@/services/communityService';
import { SnippetComments,CommentContent,type CommentAdapter } from '@/features/community/SnippetComments';
import { DiscussionImage } from '@/features/community/DiscussionImage';
import { DiscussionReport } from '@/features/community/DiscussionReport';
import { LanguageIcon } from '@/components/editor/LanguageIcon';
import { timeAgo } from '@/components/editor/NotificationButton';
import { showToast } from '@/components/ui/Toast';
import { SocialActions } from '@/features/community/SocialActions';
import { usePostLike } from '@/features/community/usePostLike';
const adapter:CommentAdapter={get:getDiscussionComments,add:addDiscussionComment,edit:editDiscussionComment,remove:deleteDiscussionComment};
function PostActions({post,onComments}:{post:CommunityPost;onComments:()=>void}){const action=usePostLike(post);return <SocialActions item={{type:'discussion',id:post.id,title:post.title||post.body.slice(0,60)||'منشور من Kodax'}} likes={action.count} comments={post.comments_count} liked={action.liked} onLike={action.like} pending={action.pending} onComments={onComments}/>;}
export default function DiscussionDetail(){
 const {id}=useLocalSearchParams<{id:string}>();const {userId,isInitializing}=useAuth();const reduced=useReducedMotion();const [post,setPost]=useState<CommunityPost|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[remove,setRemove]=useState(false),[saving,setSaving]=useState(false),[actionError,setActionError]=useState(''),[report,setReport]=useState<{comment:string|null}|null>(null);
 const activeUser=useRef(userId);activeUser.current=userId;const [loadedFor,setLoadedFor]=useState<string|undefined>(undefined);
 const scroll=useRef<ScrollView>(null),commentsTop=useRef(0),busy=useRef(false);
 const load=useCallback(async()=>{const requestedUser=activeUser.current;setError('');try{const p=await getCommunityPost(id);if(requestedUser!==activeUser.current)return;setPost(p);}catch(e){if(requestedUser===activeUser.current)setError(e instanceof Error?e.message:'تعذّر تحميل المنشور.');}finally{if(requestedUser===activeUser.current){setLoadedFor(requestedUser);setLoading(false);}}},[id]);
 useFocusEffect(useCallback(()=>{load();},[load,userId]));
 const destroy=async()=>{if(!post||!userId||busy.current)return;busy.current=true;setSaving(true);setActionError('');try{const pending=await deleteCommunityPost(userId,post);if(pending)showToast.warning('حُذف المنشور، وستُعاد محاولة تنظيف الصورة.',6000);setRemove(false);if(router.canGoBack())router.back();else router.replace('/code');}catch(e){setActionError(e instanceof Error?e.message:'تعذّر الحذف');}finally{busy.current=false;setSaving(false);}};
 const name=post?.profiles?.full_name||post?.profiles?.username||'عضو';
 return <Screen width="reading" scrollRef={scroll} header={<AppBar title={post?.kind==='question'?'السؤال':'المنشور'} fallback="/code" actions={post&&post.user_id!==userId?<IconButton label="الإبلاغ عن المنشور" icon="flag-outline" onPress={()=>userId?setReport({comment:null}):requestSignIn()}/>:undefined}/> }>
 {loading||isInitializing||loadedFor!==userId?<ListSkeleton rows={3}/>:error?<ErrorState body={error} onRetry={load}/>:!post?<EmptyState icon="chatbox-outline" title="المنشور غير متاح" body="قد يكون محذوفًا أو غير مسموح بعرضه." action="المجتمع" onAction={()=>router.replace('/code')}/>:<>
  <Col gap={16} style={{paddingBottom:24}}><Pressable accessibilityRole="link" accessibilityLabel={`ملف ${name}`} onPress={()=>post.user_id&&router.push(post.user_id===userId?'/profile':profilePath(post.user_id,post.profiles?.username) as any)}><Row gap={10}><Avatar size={40} uri={post.profiles?.avatar_url} name={name}/><Col flex={1} gap={2}><Row gap={4}><Text variant="heading" style={{flexShrink:1}}>{name}</Text><VerifiedBadge verified={post.profiles?.is_verified} size={16}/></Row><Text variant="caption" tone="secondary">{timeAgo(new Date(post.created_at))}{post.edited_at?' · تم التعديل':''}</Text></Col></Row></Pressable>
  <Row gap={8} wrap><Tag label={POST_KIND_LABEL[post.kind]}/>{post.kind==='question'&&<Tag label={post.accepted_comment_id?'سؤال محلول':'سؤال مفتوح'} tone={post.accepted_comment_id?'success':'muted'}/>}{!!post.language&&<Row gap={4}><LanguageIcon language={post.language} size={18}/><Text variant="label">{post.language}</Text></Row>}{!!post.topic&&<Text variant="bodySm" tone="secondary">{post.topic}</Text>}</Row>
  {!!post.title&&<Text variant="title" accessibilityRole="header">{post.title}</Text>}{!!post.body&&<CommentContent content={post.body}/>}{!!post.image_path&&<DiscussionImage uri={post.image_url} onRetry={load}/>}{!!post.code&&<CodeView code={post.code} language={post.language||'text'} scrollHeight={280}/>}
  <PostActions post={post} onComments={()=>scroll.current?.scrollTo({y:commentsTop.current,animated:!reduced})}/>
  {post.user_id===userId&&<Row gap={8} wrap><Button label="تعديل المنشور" icon="create-outline" variant="secondary" onPress={()=>router.push(`/discussion/new?edit=${post.id}` as any)}/><Button label="حذف المنشور" icon="trash-outline" variant="ghost" onPress={()=>{setActionError('');setRemove(true);}}/></Row>}
  </Col>
  <View onLayout={e=>{commentsTop.current=e.nativeEvent.layout.y;}}><SnippetComments snippetId={post.id} count={post.comments_count} adapter={adapter} onCount={()=>{notifyCommunity(post.id);load();}} report={c=>userId?setReport({comment:c.id}):requestSignIn()} solution={post.kind==='question'?{id:post.accepted_comment_id,owner:post.user_id===userId,onChoose:async c=>{await setDiscussionSolution(post.id,c);await load();},onJump:y=>scroll.current?.scrollTo({y:commentsTop.current+y,animated:!reduced})}:undefined}/></View>
 </>}
 <Sheet visible={remove} title="حذف المنشور؟" onClose={()=>!saving&&setRemove(false)} dismissible={!saving}><Col gap={16}><Text tone="secondary">لن يظهر المنشور أو نقاشه للآخرين. لا يمكن التراجع عن الحذف.</Text>{!!actionError&&<Text tone="danger">{actionError}</Text>}<Row gap={8}><Button label="حذف المنشور" variant="danger" onPress={destroy} loading={saving}/><Button label="إلغاء" variant="secondary" disabled={saving} onPress={()=>setRemove(false)}/></Row></Col></Sheet>
 <DiscussionReport post={id} comment={report?.comment||null} visible={!!report} onClose={()=>setReport(null)}/>
 </Screen>;
}

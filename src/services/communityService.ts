import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { isWebVisitor, publicWebDocument } from './publicWebService';
import { generateUUID, type FeedSnippet, type SnippetComment } from './codeFeedService';
import { validatedImageBytes, type ProfileImage } from './profileService';
export type PostKind='question'|'discussion'|'experience';
export type FeedFilter='all'|'code'|'discussion';
export type FeedSort='recent'|'popular'|'most_liked'|'most_viewed';
export type CommunityPost={id:string;user_id:string|null;title:string;body:string;kind:PostKind;image_path:string|null;image_url?:string|null;code:string;language:string|null;topic:string|null;created_at:string;updated_at:string;edited_at:string|null;deleted_at:string|null;accepted_comment_id:string|null;comments_count:number;likes_count:number;liked_by_me:boolean;profiles:FeedSnippet['profiles']};
export type CommunityItem={type:'code';id:string;data:FeedSnippet}|{type:'discussion';id:string;data:CommunityPost};
export type FeedCursor={rank:number;created_at:string;type:string;id:string};
export type CommunityComment=SnippetComment & {post_id:string};
export const POST_KIND_LABEL:Record<PostKind,string>={question:'سؤال',discussion:'منشور',experience:'تجربة'};
const listeners=new Set<(id:string,deleted?:boolean)=>void>();
export function watchCommunity(fn:(id:string,deleted?:boolean)=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
export function notifyCommunity(id:string,deleted=false){listeners.forEach(fn=>fn(id,deleted));}
export async function signedPostImage(path:string|null){
  if(!path)return null;
  const r=await supabase.storage.from('community-images').createSignedUrl(path,300);
  return r.error?null:r.data.signedUrl;
}
export async function getCommunityFeed(o:{filter:FeedFilter;search:string;language:string;sort:FeedSort;cursor?:FeedCursor|null;snapshot?:string|null}){
  const r=await supabase.rpc(await isWebVisitor()?'public_web_feed':'community_feed',{p_filter:o.filter,p_search:o.search,p_language:o.language,p_sort:o.sort,p_cursor:o.cursor||null,p_snapshot:o.snapshot||null,p_limit:20});
  if(r.error)throw new Error('تعذّر تحميل المجتمع. حاول مرة أخرى.');
  const data=r.data as {items:CommunityItem[];next:FeedCursor|null;snapshot:string};
  await Promise.all(data.items.map(async i=>{if(i.type==='discussion')i.data.image_url=await signedPostImage(i.data.image_path);}));
  return data;
}
export async function getCommunityPost(id:string){
  if(await isWebVisitor()){const post=await publicWebDocument('discussion',id) as CommunityPost|null;if(post)post.image_url=await signedPostImage(post.image_path);return post;}
  const r=await supabase.from('community_posts').select('*,profiles:user_id(username,full_name,avatar_url,is_verified)').eq('id',id).maybeSingle();
  if(r.error)throw new Error('تعذّر تحميل المنشور. حاول مرة أخرى.');
  const post=r.data as CommunityPost|null;
  if(post){post.image_url=await signedPostImage(post.image_path);const own=await supabase.from('community_likes').select('post_id').eq('post_id',id).limit(1);if(own.error)throw new Error('تعذّر تحميل تفاعل المنشور.');post.liked_by_me=!!own.data?.length;}
  return post;
}
const cleanupKey=(uid:string)=>`community-image-cleanup:${uid}`;
export async function cleanCommunityImages(uid:string,paths:string[]=[]){
  let old:string[]=[];try{old=JSON.parse(await AsyncStorage.getItem(cleanupKey(uid))||'[]');}catch{}
  const pending=[...new Set([...old,...paths])].filter(p=>p.startsWith(uid+'/')&&!p.includes('..'));
  if(!pending.length)return false;
  await AsyncStorage.setItem(cleanupKey(uid),JSON.stringify(pending));
  const remain:string[]=[];
  for(const path of pending){
    // Storage RLS refuses deleting any referenced object, even from a hidden post.
    const r=await supabase.storage.from('community-images').remove([path]);
    if(r.error)remain.push(path);
    else{const listing=await supabase.storage.from('community-images').list(uid,{search:path.slice(uid.length+1),limit:10});if(listing.error||listing.data?.some(o=>uid+'/'+o.name===path))remain.push(path);}
  }
  if(remain.length)await AsyncStorage.setItem(cleanupKey(uid),JSON.stringify(remain));else await AsyncStorage.removeItem(cleanupKey(uid));
  return !!remain.length;
}
export type PostDraft={id:string;title:string;body:string;kind:PostKind;kindMode?:'post'|'question'|'auto';code:string;language:string;topic:string;image_path:string|null;image?:ProfileImage|null};
export function emptyPostDraft():PostDraft{return{id:generateUUID(),title:'',body:'',kind:'discussion',kindMode:'post',code:'',language:'',topic:'',image_path:null};}
export function suggestedPostKind(d:Pick<PostDraft,'title'|'body'|'code'|'language'|'topic'>):PostKind{
 const text=(d.title+' '+d.body).toLowerCase();
 const asks=/[?؟]|\b(how|why|help|error|problem)\b|كيف|شلون|ليش|لماذا|أحتاج مساعدة|احتاج مساعد|ما سبب|مشكلة|خطأ|خطا|هل\s/.test(text);
 const programming=!!d.code.trim()||!!d.language.trim()||/برمج|كود|لغة|درس|دورة|كورس|محرر|python|javascript|html|css|sql|java|typescript|function|exception/.test(text+' '+d.topic.toLowerCase());
 return asks&&programming?'question':'discussion';
}
export function resolvedPostDraft(d:PostDraft):PostDraft{return {...d,kind:d.kindMode==='auto'?suggestedPostKind(d):d.kindMode==='question'?'question':d.kindMode==='post'?'discussion':d.kind};}
export function validatePost(input:PostDraft){const d=resolvedPostDraft(input);return {title:d.kind==='question'&&d.title.trim().length<3?'أضف عنوانًا للسؤال من 3 أحرف على الأقل.':d.title.length>120?'الحد الأقصى 120 حرفًا.':'',body:!d.body.trim()&&!d.code.trim()&&!d.image&&!d.image_path?'أضف نصًا أو صورة أو مقطع كود.':d.body.length>5000?'الحد الأقصى 5000 حرف.':'',code:d.code.length>10000?'الحد الأقصى للكود 10000 حرف.':''};}
export async function saveCommunityPost(uid:string,d:PostDraft,previous:string|null,onPhase:(s:string)=>void){
  let uploaded:string|null=null,committed=false;
  try{
    await cleanCommunityImages(uid);
    let path=d.image_path;
    if(d.image){onPhase('رفع الصورة…');const v=await validatedImageBytes(d.image);uploaded=`${uid}/${d.id}-${generateUUID()}.${v.ext}`;
      const r=await supabase.storage.from('community-images').upload(uploaded,v.bytes.buffer,{contentType:v.contentType,upsert:false});if(r.error)throw new Error('تعذّر رفع الصورة. مسودتك محفوظة؛ أعد المحاولة.');path=uploaded;
    }
    onPhase('حفظ المنشور…');
    const payload={p_id:d.id,p_title:d.title.trim(),p_body:d.body.trim(),p_kind:d.kind,p_image_path:path,p_code:d.code,p_language:d.language.trim()||null,p_topic:d.topic.trim()||null};
    const r=await supabase.rpc('save_community_post',payload);
    if(r.error){
      // An ambiguous response must not remove an image committed by the server.
      const actual=await getCommunityPost(d.id);
      if(!actual||actual.user_id!==uid||actual.title!==payload.p_title||actual.body!==payload.p_body||actual.kind!==d.kind||actual.image_path!==path||actual.code!==d.code||actual.language!==payload.p_language||actual.topic!==payload.p_topic)throw new Error('تعذّر حفظ المنشور. مسودتك محفوظة؛ أعد المحاولة.');
    }
    committed=true;notifyCommunity(d.id);
    const warning=await cleanCommunityImages(uid,previous&&previous!==path?[previous]:[]);
    return{ok:true,error:'',warning:warning?'حُفظ المنشور؛ ستُعاد محاولة تنظيف الصورة السابقة.':''};
  }catch(e){
    // On unreadable responses retain the upload in a durable queue; storage rejects referenced deletion.
    if(uploaded)await cleanCommunityImages(uid,[uploaded]).catch(()=>undefined);
    return{ok:committed,error:committed?'':e instanceof Error?e.message:'تعذّر الحفظ',warning:committed?'حُفظ المنشور، وستُعاد محاولة تنظيف الصور.':''};
  }
}
export async function deleteCommunityPost(uid:string,p:CommunityPost){const r=await supabase.rpc('delete_community_post',{p_id:p.id});if(r.error)throw new Error('تعذّر حذف المنشور. أعد المحاولة.');notifyCommunity(p.id,true);return cleanCommunityImages(uid,p.image_path?[p.image_path]:[]);}
export async function getDiscussionComments(id:string):Promise<{data:CommunityComment[];error:string|null}>{
  if(await isWebVisitor()){const r=await supabase.rpc('public_web_comments',{p_kind:'discussion',p_id:id});return{data:r.data||[],error:r.error?.message||null};}
  const r=await supabase.from('community_comments').select('*,profiles:user_id(username,full_name,avatar_url,is_verified)').eq('post_id',id).order('created_at').order('id');
  const rows=(r.data||[]) as CommunityComment[];
  // A blocked parent is represented only as a neutral context stub for permitted replies.
  const missing=rows.filter(c=>c.parent_id&&!rows.some(p=>p.id===c.parent_id));
  for(const c of missing)if(!rows.some(p=>p.id===c.parent_id))rows.push({...c,id:c.parent_id!,user_id:null,parent_id:null,profiles:null,content:'',deleted_at:c.created_at,unavailable:true});
  return{data:rows,error:r.error?.message||null};
}
export async function addDiscussionComment(_uid:string,postId:string,content:string,parent:string|null=null,id:string=generateUUID()){const r=await supabase.rpc('save_community_comment',{p_id:id,p_post:postId,p_content:content,p_parent:parent});if(!r.error)notifyCommunity(postId);return{success:!r.error,error:r.error?'تعذّر الإرسال. أعد المحاولة.':null};}
export async function editDiscussionComment(id:string,content:string){const r=await supabase.rpc('edit_community_comment',{p_id:id,p_content:content});return{success:!r.error,error:r.error?'تعذّر تعديل التعليق.':null};}
export async function deleteDiscussionComment(id:string){const r=await supabase.rpc('delete_community_comment',{p_id:id});return{success:!r.error,error:r.error?'تعذّر حذف التعليق.':null};}
export async function setDiscussionSolution(post:string,comment:string|null){const r=await supabase.rpc('set_community_solution',{p_post:post,p_comment:comment});if(r.error)throw new Error('تعذّر تغيير الحل. أعد المحاولة.');notifyCommunity(post);}
export async function reportDiscussion(post:string,comment:string|null,reason:string,details:string){const r=await supabase.rpc('report_community',{p_post:post,p_comment:comment,p_reason:reason,p_details:details.trim()||null});if(r.error)throw new Error('تعذّر إرسال البلاغ. أعد المحاولة.');}
export async function setPostLike(post:string,liked:boolean){const r=await supabase.rpc('set_community_like',{p_post:post,p_liked:liked});if(r.error)throw new Error('تعذّر حفظ الإعجاب. أعد المحاولة.');notifyCommunity(post);return r.data as {liked:boolean;likes_count:number};}

import { requestSignIn } from '@/services/webAccess';
import React,{useEffect,useRef,useState} from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet,Col,Text,Button,Field,Avatar,ListRow,ErrorState,ListSkeleton } from '@/design';
import { showToast } from '@/components/ui/Toast';
import { getConversations } from '@/services/messageService';
import { generateUUID } from '@/services/codeFeedService';
import { copyContentLink,externalShare,searchShareRecipients,sendSharedContent,type SharedContent,type ShareRecipient } from '@/services/socialShareService';
export function ContentShareSheet({item,visible,onClose}:{item:SharedContent;visible:boolean;onClose:()=>void}){
 const {userId}=useAuth();const [direct,setDirect]=useState(false),[query,setQuery]=useState(''),[contacts,setContacts]=useState<ShareRecipient[]>([]),[selected,setSelected]=useState<ShareRecipient|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[sending,setSending]=useState(false),[reload,setReload]=useState(0);
 const request=useRef(generateUUID()),busy=useRef(false),owner=useRef(userId);owner.current=userId;
 useEffect(()=>{if(visible){setDirect(false);setSelected(null);setQuery('');setError('');request.current=generateUUID();}},[visible,item.id,item.type,userId]);
 useEffect(()=>{if(!visible||!direct||!userId)return;let active=true;setLoading(true);setError('');setContacts([]);const timer=setTimeout(async()=>{try{
  let results:ShareRecipient[]=[];if(query.trim().length>=2)results=await searchShareRecipients(query);else {const r=await getConversations(userId);if(r.error)throw new Error('تعذّر تحميل محادثاتك.');results=r.data?.map(c=>c.other_user)||[];}
  if(active)setContacts((results||[]).filter(c=>c.id&&c.id!==userId));
 }catch(e){if(active)setError(e instanceof Error?e.message:'تعذّر تحميل الحسابات.');}finally{if(active)setLoading(false);}},query?250:0);return()=>{active=false;clearTimeout(timer);};},[visible,direct,query,userId,reload]);
 const share=async()=>{if(!selected||!userId||busy.current)return;const uid=userId;busy.current=true;setSending(true);setError('');try{const conv=await sendSharedContent(uid,selected.id,item,request.current);if(owner.current!==uid)return;onClose();showToast.success('تمت المشاركة في الرسائل');router.push(`/message/${conv}` as any);}catch(e){if(owner.current===uid)setError(e instanceof Error?e.message:'تعذّرت المشاركة.');}finally{busy.current=false;setSending(false);}};
 const external=async()=>{try{const result=await externalShare(item);if(result==='copied')showToast.success('تم نسخ الرابط');onClose();}catch(e){if((e as any)?.name!=='AbortError')setError('تعذّرت المشاركة. جرّب نسخ الرابط.');}};
 const footer=direct?<Col gap={6}>{!!error&&!!selected&&<Text tone="danger" variant="bodySm" accessibilityLiveRegion="polite">{error}</Text>}<Button label={!selected?'اختر حسابًا للإرسال':error?'إعادة محاولة الإرسال':`إرسال إلى ${selected.full_name||selected.username||'العضو'}`} icon="send-outline" onPress={share} loading={sending} disabled={!selected||loading} full/><Button label="خيارات المشاركة" variant="ghost" size="sm" disabled={sending} onPress={()=>setDirect(false)}/></Col>:undefined;
 return <Sheet visible={visible} title="مشاركة" onClose={()=>!sending&&onClose()} dismissible={!sending} maxWidth={520} footer={footer}><Col gap={14}>
  <Text variant="label" numberOfLines={2}>{item.title||'منشور من Kodax'}</Text>
  {!direct?<><ListRow title="مشاركة خارج التطبيق" icon="share-social-outline" onPress={external}/><ListRow title="نسخ الرابط" icon="link-outline" onPress={async()=>{try{await copyContentLink(item);showToast.success('تم نسخ الرابط');onClose();}catch{setError('تعذّر نسخ الرابط.');}}}/><ListRow title="إرسال في الرسائل" icon="chatbubble-ellipses-outline" onPress={()=>userId?setDirect(true):(onClose(),requestSignIn())}/></>:<>
   <Field label="ابحث عن حساب للمشاركة" value={query} onChangeText={q=>{setQuery(q);setSelected(null);request.current=generateUUID();}} placeholder="اسم المستخدم أو الاسم" editable={!sending}/>
   {loading?<ListSkeleton rows={2}/>:error&&!selected?<ErrorState body={error} onRetry={()=>setReload(n=>n+1)}/>:<Col gap={4}>{contacts.slice(0,20).map(c=><ListRow key={c.id} title={c.full_name||c.username||'عضو'} subtitle={c.username?'@'+c.username:undefined} trailing={selected?.id===c.id?<Text tone="brand">محدد</Text>:<Avatar uri={c.avatar_url} name={c.full_name||c.username||'عضو'} size={32}/>} onPress={()=>{if(!sending){setSelected(c);request.current=generateUUID();setError('');}}}/>)}{!contacts.length&&<Text tone="secondary">{query.trim().length>=2?'ماكو حساب مطابق.':'ابحث عن حساب، أو اختر من محادثاتك.'}</Text>}</Col>}
  </>}
  {!!error&&!direct&&<Text tone="danger" accessibilityLiveRegion="polite">{error}</Text>}
 </Col></Sheet>;
}

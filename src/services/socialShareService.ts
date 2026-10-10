import { Platform,Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import { getOrCreateConversation } from './messageService';
export type SharedContent={type:'code'|'discussion';id:string;title:string};
export type ShareRecipient={id:string;full_name:string|null;username:string|null;avatar_url:string|null};
export const contentUrl=(item:SharedContent)=>`https://kodax.app/${item.type}/${encodeURIComponent(item.id)}`;
export async function copyContentLink(item:SharedContent){
 const url=contentUrl(item);
 if(Platform.OS==='web'){
  if(typeof navigator!=='undefined'&&navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);return;}
  const previous=document.activeElement as HTMLElement|null,field=document.createElement('textarea');field.value=url;field.setAttribute('readonly','');field.style.position='fixed';field.style.opacity='0';document.body.appendChild(field);
  try{field.select();if(!document.execCommand('copy'))throw new Error('تعذّر نسخ الرابط.');}finally{field.remove();previous?.focus?.({preventScroll:true});}
  return;
 }
 const copied=await Clipboard.setStringAsync(url);if(copied===false)throw new Error('تعذّر نسخ الرابط.');
}
export async function externalShare(item:SharedContent){
 const url=contentUrl(item);
 if(Platform.OS==='web'){
  if(typeof navigator!=='undefined'&&navigator.share){await navigator.share({title:item.title,url});return;}
  await copyContentLink(item);return 'copied';
 }
 await Share.share({title:item.title,message:`${item.title}\n${url}`,url});
}
export async function searchShareRecipients(query:string){const r=await supabase.rpc('share_recipient_search',{p_query:query.trim()});if(r.error)throw new Error('تعذّر البحث. حاول مرة أخرى.');return r.data as ShareRecipient[];}
export async function sendSharedContent(uid:string,to:string,item:SharedContent,messageId:string){
 const conv=await getOrCreateConversation(uid,to);if(conv.error||!conv.data)throw new Error('تعذّر فتح المحادثة. قد تكون المراسلة غير متاحة.');
 const r=await supabase.rpc('share_community_message',{p_message:messageId,p_conversation:conv.data,p_type:item.type,p_content:item.id});
 if(r.error){const actual=await supabase.from('messages').select('id,sender_id,conversation_id,shared_type,shared_id,is_deleted').eq('id',messageId).maybeSingle();if(actual.error||!actual.data||actual.data.sender_id!==uid||actual.data.conversation_id!==conv.data||actual.data.shared_type!==item.type||actual.data.shared_id!==item.id||actual.data.is_deleted)throw new Error('تعذّرت المشاركة. تأكد أن المنشور متاح للطرف الآخر، ثم أعد المحاولة.');}
 return conv.data;
}

import React,{useState,useRef} from 'react';
import { Sheet,Col,Text,Button,Field,Chip,Row } from '@/design';
import { REPORT_REASONS } from '@/services/codeFeedService';
import { reportDiscussion } from '@/services/communityService';
export function DiscussionReport({post,comment,visible,onClose}:{post:string;comment:string|null;visible:boolean;onClose:()=>void}){
  const [reason,setReason]=useState('offensive'),[details,setDetails]=useState(''),[error,setError]=useState(''),[done,setDone]=useState(false),[saving,setSaving]=useState(false);const busy=useRef(false);
  const send=async()=>{if(busy.current)return;busy.current=true;setSaving(true);setError('');try{await reportDiscussion(post,comment,reason,details);setDone(true);}catch(e){setError(e instanceof Error?e.message:'تعذّر الإبلاغ');}finally{busy.current=false;setSaving(false);}};
  return <Sheet visible={visible} title={comment?'الإبلاغ عن التعليق':'الإبلاغ عن المنشور'} onClose={()=>{setDone(false);setDetails('');setError('');onClose();}} dismissible={!saving}><Col gap={14}>{done?<><Text>وصل بلاغك إلى الإشراف.</Text><Button label="تم" onPress={()=>{setDone(false);onClose();}}/></>:<><Row gap={6} wrap>{REPORT_REASONS.map(r=><Chip key={r.id} label={r.label} selected={reason===r.id} onPress={()=>setReason(r.id)}/>)}</Row><Field label="تفاصيل اختيارية" multiline value={details} onChangeText={setDetails} maxLength={500} hint={`${details.length} / 500`} error={error}/><Button label={error?'إعادة إرسال البلاغ':'إرسال البلاغ'} onPress={send} loading={saving} full/></>}</Col></Sheet>;
}

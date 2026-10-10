import React,{useEffect,useState} from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Col,Row,Text,Button,useTheme } from '@/design';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
export function SharedMessageCard({type,id}:{type:'code'|'discussion';id:string}){
 const t=useTheme(),{userId}=useAuth();const [state,setState]=useState<{title:string;available:boolean;failed:boolean}|null>(null),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setState(null);(async()=>{try{const {data,error}=await supabase.from(type==='code'?'code_snippets':'community_posts').select(type==='code'?'title':'title,body').eq('id',id).maybeSingle();if(error)throw error;const item=data as {title?:string;body?:string}|null;const title=item?(item.title||item.body?.slice(0,90)||(type==='code'?'كود من Kodax':'منشور مصوّر')):'';if(active)setState({title,available:!!item,failed:false});}catch{if(active)setState({title:'',available:false,failed:true});}})();return()=>{active=false;};},[type,id,userId,retry]);
 return <Pressable testID={`shared-content-${type}-${id}`} accessibilityRole="link" accessibilityLabel={state?.available?`فتح ${state.title}`:'محتوى مشارك غير متاح'} disabled={!state?.available} onPress={()=>router.push(`/${type}/${id}` as any)} style={{marginVertical:8,padding:12,borderRadius:10,borderWidth:1,borderColor:t.colors.border,backgroundColor:t.colors.surface}}><Col gap={8}><Row gap={8}><Ionicons name={type==='code'?'code-slash-outline':'chatbox-outline'} size={18} color={t.colors.brandText}/><Text variant="label" tone="brand">{type==='code'?'كود مشارك':'منشور مشارك'}</Text></Row><Text variant="bodySm" numberOfLines={3}>{state?.available?state.title:!state?'جارٍ تحميل المحتوى…':state.failed?'تعذّر تحميل المحتوى.':'المحتوى محذوف أو غير متاح لك.'}</Text>{state?.failed&&<Button label="إعادة تحميل المشاركة" variant="ghost" size="sm" onPress={()=>setRetry(n=>n+1)}/>}</Col></Pressable>;
}

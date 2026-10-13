import React,{useEffect,useState} from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Col,Row,Text,Button,useTheme } from '@/design';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { languageLabel } from './SnippetCard';
export function SharedMessageCard({type,id}:{type:'code'|'discussion';id:string}){
 const t=useTheme(),{userId}=useAuth();const [state,setState]=useState<{title:string;language?:string;available:boolean;failed:boolean}|null>(null),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setState(null);(async()=>{try{const {data,error}=await supabase.from(type==='code'?'code_snippets':'community_posts').select(type==='code'?'title,language':'title,body').eq('id',id).maybeSingle();if(error)throw error;const item=data as {title?:string;body?:string;language?:string}|null;const title=item?(item.title||item.body?.slice(0,90)||(type==='code'?'كود من Kodax':'منشور مصوّر')):'';if(active)setState({title,language:item?.language,available:!!item,failed:false});}catch{if(active)setState({title:'',available:false,failed:true});}})();return()=>{active=false;};},[type,id,userId,retry]);
 return <Pressable testID={`shared-content-${type}-${id}`} accessibilityRole="link" accessibilityLabel={state?.available?`فتح ${state.title}`:'محتوى مشارك غير متاح'} disabled={!state?.available} onPress={()=>router.push(`/${type}/${id}` as any)} style={({pressed})=>({paddingVertical:2,opacity:pressed?0.75:1})}>
   <Col gap={14}>
     <Row gap={10}>
       <View style={{width:38,height:38,borderRadius:12,backgroundColor:t.colors.brandSoft,alignItems:'center',justifyContent:'center'}}><Ionicons name={type==='code'?'code-slash-outline':'chatbox-outline'} size={21} color={t.colors.brandText}/></View>
       <Col flex={1} gap={2}><Text variant="caption" tone="secondary">{type==='code'?'كود من المجتمع':'منشور من المجتمع'}</Text>{!!state?.language&&<Text variant="caption" tone="brand" weight="semibold">{languageLabel(state.language)}</Text>}</Col>
     </Row>
     <Text variant="body" weight="semibold" numberOfLines={3}>{state?.available?state.title:!state?'جارٍ تحميل المحتوى…':state.failed?'تعذّر تحميل المحتوى.':'المحتوى محذوف أو غير متاح لك.'}</Text>
     {state?.available&&<Row gap={6}><Text variant="caption" tone="brand" weight="semibold">{type==='code'?'عرض الكود':'عرض المنشور'}</Text><Ionicons name="arrow-back" size={15} color={t.colors.brandText}/></Row>}
     {state?.failed&&<Button label="إعادة تحميل المشاركة" variant="ghost" size="sm" onPress={()=>setRetry(n=>n+1)}/>}
   </Col>
 </Pressable>;
}

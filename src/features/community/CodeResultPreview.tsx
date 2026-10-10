import React,{useMemo,useState} from 'react';
import {Platform,View} from 'react-native';
import {WebView} from 'react-native-webview';
import {Col,Row,Text,useTheme} from '@/design';
import {Ionicons} from '@expo/vector-icons';
import {literalProgramOutput,webResultDocument} from './resultPreviewData';
export function CodeResultPreview({code,language}:{code:string;language:string}){
 const t=useTheme();const web=['web','html','react'].includes(language)&&/<[a-z!][\s\S]*>/i.test(code);const doc=useMemo(()=>web?webResultDocument(code):'', [code,web]);const output=useMemo(()=>web?null:literalProgramOutput(code,language),[code,language,web]);const [failed,setFailed]=useState(false);
 return <View style={{height:176,borderWidth:1,borderColor:t.colors.border,borderRadius:t.radius.md,overflow:'hidden',backgroundColor:t.colors.surfaceSunken}} accessibilityLabel={web?'معاينة واجهة الويب':output!==null?'معاينة نتيجة الطباعة':'تحتاج النتيجة إلى تشغيل'}>
  <Row gap={6} style={{paddingHorizontal:10,height:28,borderBottomWidth:1,borderBottomColor:t.colors.border}}><Ionicons name={web?'browsers-outline':'terminal-outline'} size={14} color={t.colors.textSecondary}/><Text variant="caption" tone="secondary">{web?'معاينة الواجهة':output!==null?'نتيجة الطباعة':'نتيجة التشغيل'}</Text></Row>
  {web&&!failed?<View style={{flex:1}} pointerEvents="none">{Platform.OS==='web'?React.createElement('iframe',{srcDoc:doc,title:'معاينة واجهة الويب',sandbox:'',referrerPolicy:'no-referrer',tabIndex:-1,style:{width:'100%',height:500,border:0,background:'white',pointerEvents:'none'}}):<WebView source={{html:doc}} javaScriptEnabled={false} domStorageEnabled={false} originWhitelist={['about:blank']} onShouldStartLoadWithRequest={r=>r.url==='about:blank'} onError={()=>setFailed(true)} scrollEnabled={false} nestedScrollEnabled={false} style={{height:500,flex:0,backgroundColor:'white'}}/>}</View>:output!==null?<View style={{padding:14,flex:1,overflow:'hidden',justifyContent:'center'}}><Text mono ltr variant="heading" numberOfLines={5}>{output||'سطر فارغ'}</Text></View>:<Col gap={8} align="center" justify="center" style={{flex:1,paddingHorizontal:16}}><Ionicons name="play-circle-outline" size={28} color={t.colors.brandText}/><Text variant="bodySm" tone="secondary" align="center">افتح الكود لعرض نتيجة تشغيله</Text></Col>}
 </View>;
}

import React,{useEffect,useRef,useState} from 'react';
import {Pressable,View,useWindowDimensions} from 'react-native';
import {router} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {AppBar,Avatar,Button,Col,EmptyState,ErrorState,Field,ListSkeleton,Row,Screen,Surface,Text,useBreakpoint,useTheme} from '@/design';
import {useAuth} from '@/contexts/AuthContext';
import {profilePath} from '@/services/profileLinks';
import {searchPeople,type PersonResult} from '@/services/peopleService';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

export default function PeopleScreen(){
 const t=useTheme(),{isDesktop,isTablet}=useBreakpoint(),{userId}=useAuth();
 const {fontScale}=useWindowDimensions();
 const nameHeight=t.type.body.line*2*Math.min(fontScale,1.6);
 const [query,setQuery]=useState(''),[items,setItems]=useState<PersonResult[]>([]),[loading,setLoading]=useState(true),[more,setMore]=useState(false),[error,setError]=useState(''),[moreError,setMoreError]=useState(''),[hasMore,setHasMore]=useState(false),[revision,setRevision]=useState(0);
 const version=useRef(0),page=useRef(0),busy=useRef(false);
 useEffect(()=>{const current=++version.current;busy.current=false;page.current=0;setItems([]);setLoading(true);setError('');setMoreError('');setMore(false);setHasMore(false);
  const timer=setTimeout(()=>{searchPeople(query).then(result=>{if(current!==version.current)return;setItems(result.items);setHasMore(result.has_more);}).catch(e=>{if(current===version.current)setError(e.message);}).finally(()=>{if(current===version.current)setLoading(false);});},query.trim()?300:0);
  return()=>{clearTimeout(timer);version.current++;};
 },[query,userId,revision]);
 const loadMore=async()=>{if(busy.current||!hasMore)return;const current=version.current;busy.current=true;setMore(true);setMoreError('');try{const result=await searchPeople(query,page.current+1);if(current!==version.current)return;page.current++;setItems(previous=>[...previous,...result.items.filter(p=>!previous.some(x=>x.id===p.id))]);setHasMore(result.has_more);}catch(e){if(current===version.current)setMoreError(e instanceof Error?e.message:'تعذّر التحميل.');}finally{if(current===version.current){busy.current=false;setMore(false);}}};
 const columns=isDesktop?3:isTablet?2:1;
 return <Screen width="wide" header={<AppBar title="الأشخاص" fallback="/code"/>}>
  <Col gap={isDesktop?28:18} style={{paddingTop:isDesktop?20:0}}>
   <Col gap={12} style={{width:'100%',maxWidth:isDesktop?680:undefined,alignSelf:'flex-end'}}>
    {isDesktop&&<Text variant="display" accessibilityRole="header">اكتشف أشخاص Kodax</Text>}
    <Field label="البحث عن أشخاص" hideLabel placeholder="اسم المستخدم أو الاسم…" icon="search" value={query} onChangeText={setQuery} maxLength={80} returnKeyType="search" autoCapitalize="none" autoCorrect={false}/>
   </Col>
   <Row justify="space-between" gap={12}><Text variant="heading" accessibilityRole="header">{query.trim()?'نتائج البحث':'اقتراحات للمتابعة'}</Text>{!!query&&<Button label="مسح البحث" variant="ghost" size="sm" onPress={()=>setQuery('')}/>}</Row>
   {loading?<ListSkeleton rows={4}/>:error?<ErrorState body={error} onRetry={()=>setRevision(n=>n+1)}/>:items.length===0?<EmptyState compact icon="people-outline" title={query.trim()?'ماكو نتائج بهذا الاسم':'ماكو اقتراحات حاليًا'} body={query.trim()?'جرّب الاسم أو اسم المستخدم.':undefined}/>:<Row wrap gap={16} align="flex-start">{items.map(person=>{
    const name=person.full_name||person.username,open=()=>router.push(profilePath(person.id,person.username) as any);
    return <View key={person.id} style={{width:columns===3?'31.8%':columns===2?'48.8%':'100%',minWidth:0}}><Pressable accessibilityRole="link" accessibilityLabel={`ملف ${name}، ${person.username}`} onPress={open} style={({pressed})=>({opacity:pressed ? 0.8 : 1})}><Surface padding={isDesktop?22:14}>
     <Col gap={isDesktop?16:10}><Row gap={12} align="flex-start"><Avatar uri={person.avatar_url} name={name} size={isDesktop?64:48}/><Col flex={1} gap={3}><Row gap={5} style={{minHeight:nameHeight}}><Text weight="semibold" numberOfLines={2} style={{flexShrink:1}}>{name}</Text><VerifiedBadge verified={person.is_verified} size={17}/></Row><Text variant="bodySm" tone="secondary" numberOfLines={1} ltr align="right">@{person.username}</Text></Col></Row>
      {isDesktop&&<Row justify="flex-end" gap={6}><Text variant="label" tone="brand">عرض الملف</Text><Ionicons name="arrow-back" size={16} color={t.colors.brandText}/></Row>}
     </Col>
    </Surface></Pressable></View>;
   })}</Row>}
   {!!moreError&&<ErrorState body={moreError} onRetry={loadMore}/>} {!loading&&!error&&hasMore&&!moreError&&<Button label="أشخاص أكثر" variant="secondary" onPress={loadMore} loading={more} style={{alignSelf:'center'}}/>}
  </Col>
 </Screen>;
}

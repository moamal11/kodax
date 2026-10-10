import { requestSignIn } from '@/services/webAccess';
import { profilePath } from '@/services/profileLinks';
import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Platform,RefreshControl,View,ActivityIndicator} from 'react-native';
import {useRouter,useFocusEffect} from 'expo-router';
import * as Haptics from 'expo-haptics';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text,Row,Col,Button,Field,Chip,ChipBar,Segmented,Sheet,ListRow,EmptyState,ErrorState,ListSkeleton,useTheme,useBreakpoint} from '@/design';
import {useAuth} from '@/contexts/AuthContext';
import {useApp} from '@/contexts/AppContext';
import {getSnippetCounts} from '@/services/codeFeedService';
import {getCommunityFeed,getCommunityPost,watchCommunity,type CommunityItem,type FeedFilter,type FeedSort,type FeedCursor} from '@/services/communityService';
import {LanguageIcon} from '@/components/editor/LanguageIcon';
import {LanguagePicker} from '@/components/editor/LanguagePicker';
import {SnippetCard,languageLabel} from '@/features/community/SnippetCard';
import {DiscussionCard} from '@/features/community/DiscussionCard';
import {CommunityList,type CommunityListHandle} from '@/features/community/CommunityList';
import {MessagesButton} from '@/components/ui/MessagesButton';
const LANGUAGES=['all','python','web','javascript','typescript','cpp','java','csharp','sql','react','go','rust','swift','kotlin','dart'];
const TYPES:{value:FeedFilter;label:string}[]=[{value:'all',label:'الكل'},{value:'code',label:'الأكواد'},{value:'discussion',label:'النقاشات'}];
const SORTS:{value:FeedSort;label:string}[]=[{value:'recent',label:'الأحدث'},{value:'popular',label:'الأكثر تفاعلاً'},{value:'most_liked',label:'الأكثر إعجاباً'},{value:'most_viewed',label:'الأكثر مشاهدة'}];
type Cache={uid:string;items:CommunityItem[];filter:FeedFilter;query:string;lang:string;sort:FeedSort;cursor:FeedCursor|null;snapshot:string|null;offset:number};
let cache:Cache|null=null;
export default function CommunityScreen(){
 const t=useTheme(),router=useRouter();const {userId,authVersion,isInitializing}=useAuth();const {isDesktop,gutter}=useBreakpoint();const app=useApp();
 const activeUser=useRef(userId);activeUser.current=userId;
 const initial=useRef(cache?.uid===userId?cache:null).current;
 const [dataOwner,setDataOwner]=useState(initial?.uid||userId);
 const [items,setItems]=useState<CommunityItem[]>(initial?.items||[]),[filter,setFilter]=useState<FeedFilter>(initial?.filter||'all'),[query,setQuery]=useState(initial?.query||''),[lang,setLang]=useState(initial?.lang||'all'),[sort,setSort]=useState<FeedSort>(initial?.sort||'recent');
 const [loading,setLoading]=useState(!initial),[error,setError]=useState(''),[moreError,setMoreError]=useState(''),[loadingMore,setLoadingMore]=useState(false),[refreshing,setRefreshing]=useState(false),[hasMore,setHasMore]=useState(!!initial?.cursor),[create,setCreate]=useState(false),[picker,setPicker]=useState(false);
 const list=useRef<CommunityListHandle>(null),cursor=useRef(initial?.cursor||null),snapshot=useRef(initial?.snapshot||null),generation=useRef(0),busy=useRef(false),offset=useRef(initial?.offset||0),skip=useRef(!!initial),itemsRef=useRef(items);itemsRef.current=items;
 const load=useCallback(async(append=false)=>{
  if(isInitializing||(!userId&&Platform.OS!=='web'))return;if(append&&(busy.current||!cursor.current))return;const token=append?generation.current:++generation.current;busy.current=true;
  if(append){setLoadingMore(true);setMoreError('');}else{setLoading(true);setError('');cursor.current=null;snapshot.current=null;offset.current=0;}
  try{const r=await getCommunityFeed({filter,search:query,language:filter==='code'?lang:'all',sort:filter==='code'?sort:'recent',cursor:append?cursor.current:null,snapshot:append?snapshot.current:null});if(token!==generation.current||userId!==activeUser.current)return;
   setDataOwner(userId);cursor.current=r.next;snapshot.current=r.snapshot;setHasMore(!!r.next);setItems(prev=>append?[...prev,...r.items.filter(i=>!prev.some(p=>p.type===i.type&&p.id===i.id))]:r.items);if(!append)list.current?.scrollToOffset({offset:0,animated:false});
   const ids=r.items.filter(i=>i.type==='code').map(i=>i.id);if(ids.length){getSnippetCounts(ids).then(c=>{app.updateLikeCounts(c.likeCounts);app.updateViewCounts(c.viewCounts);app.updateCommentCounts(c.commentCounts);}).catch(()=>undefined);if(userId)app.syncLikes(ids);}
  }catch(e){if(token!==generation.current||userId!==activeUser.current)return;const m=e instanceof Error?e.message:'تعذّر تحميل المجتمع.';append?setMoreError(m):setError(m);}
  finally{if(token===generation.current){busy.current=false;setLoading(false);setLoadingMore(false);setRefreshing(false);}}
 },[filter,query,lang,sort,userId,isInitializing]);
 useEffect(()=>{if(skip.current){skip.current=false;return;}const timer=setTimeout(()=>load(),query?350:0);return()=>clearTimeout(timer);},[load,authVersion]);
 useEffect(()=>{cache=dataOwner===userId?{uid:userId||'',items,filter,query,lang,sort,cursor:cursor.current,snapshot:snapshot.current,offset:offset.current}:null;},[items,filter,query,lang,sort,userId,dataOwner]);
 const refreshPost=useCallback(async(id:string,deleted=false)=>{if(deleted){setItems(prev=>prev.filter(i=>i.type!=='discussion'||i.id!==id));return;}try{const requestedUser=activeUser.current;const p=await getCommunityPost(id);if(requestedUser!==activeUser.current)return;setItems(prev=>{const updated=prev.map(i=>i.type==='discussion'&&i.id===id&&p?{type:'discussion' as const,id,data:p}:i).filter(i=>i.type!=='discussion'||i.id!==id||!!p);const term=query.trim().toLowerCase();const matches=p&&filter!=='code'&&(!term||[p.title,p.body,p.code,p.topic,p.language].some(v=>v?.toLowerCase().includes(term)));return matches&&!prev.some(i=>i.type==='discussion'&&i.id===id)?[{type:'discussion' as const,id,data:p!},...updated]:updated;});}catch{}},[filter,query]);
 useEffect(()=>watchCommunity(refreshPost),[refreshPost]);useFocusEffect(useCallback(()=>{itemsRef.current.filter(i=>i.type==='discussion').forEach(i=>refreshPost(i.id));},[refreshPost]));
 const like=async(id:string)=>{if(!userId){requestSignIn();return;}if(Platform.OS!=='web')Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>undefined);await app.toggleLike(id);};const cols=isDesktop?2:1;
 const header=<Col gap={12} style={{paddingBottom:14}}><Row gap={8}><Text variant="title" accessibilityRole="header" style={{flex:1}}>المجتمع</Text>{!!userId&&<MessagesButton userId={userId}/>}<Button label="إنشاء" icon="add" onPress={()=>userId?setCreate(true):requestSignIn()}/></Row><Segmented options={TYPES} value={filter} onChange={setFilter}/>
  <Row gap={8} align="center"><View style={{flex:1,minWidth:0}}><Field hideLabel label="ابحث في المجتمع" placeholder={filter==='code'?'ابحث في الأكواد…':filter==='discussion'?'ابحث في النقاشات…':'ابحث في الأكواد والنقاشات…'} icon="search" value={query} maxLength={120} onChangeText={setQuery} returnKeyType="search"/></View><Button label="الأشخاص" accessibilityLabel="بحث عن أشخاص" icon="people-outline" size="sm" variant="secondary" onPress={()=>router.push('/people' as any)}/></Row>
  {filter==='code'&&<><ChipBar>{LANGUAGES.map(id=><Chip key={id} leading={id!=='all'?<LanguageIcon language={id} size={18}/>:undefined} label={id==='all'?'كل اللغات':languageLabel(id)} selected={lang===id} onPress={()=>setLang(id)}/>)}</ChipBar><ChipBar>{SORTS.map(s=><Chip key={s.value} label={s.label} selected={sort===s.value} onPress={()=>setSort(s.value)}/>)}</ChipBar></>}
 </Col>;
 return <SafeAreaView edges={['top']} style={{flex:1,backgroundColor:t.colors.bg}}><CommunityList ref={list} columns={cols} items={loading||error||dataOwner!==userId?[]:items} gutter={gutter} maxWidth={t.layout.maxContent+gutter*2} header={header} initialOffset={initial?.offset}
 onOffset={y=>{offset.current=y;if(cache&&cache.uid===userId)cache.offset=y;}} onMore={()=>{if(!loading&&!moreError)load(true);}}
 renderItem={item=><View style={{flex:1,minWidth:0}}>{item.type==='code'?<SnippetCard snippet={item.data} liked={app.likedSnippets.has(item.id)} likes={app.getLikeCount(item.id,item.data.likes_count)} comments={app.getCommentCount(item.id,item.data.comments_count)} views={app.getViewCount(item.id,item.data.views_count)} onLike={userId?()=>like(item.id):undefined} onPress={()=>router.push(`/code/${item.id}` as any)} onAuthorPress={()=>router.push(item.data.user_id===userId?'/profile':profilePath(item.data.user_id!,item.data.profiles?.username) as any)}/>:<DiscussionCard post={item.data} onPress={()=>router.push(`/discussion/${item.id}` as any)} onAuthorPress={()=>item.data.user_id&&router.push(item.data.user_id===userId?'/profile':profilePath(item.data.user_id!,item.data.profiles?.username) as any)} onImageRetry={()=>refreshPost(item.id)}/>}</View>}
 empty={loading?<ListSkeleton rows={3}/>:error?<ErrorState body={error} onRetry={()=>load()}/>:<EmptyState icon="chatbubbles-outline" title={query?'ماكو نتائج بهذا البحث':'ماكو منشورات بعد'} body={query?'جرّب كلمة ثانية أو غيّر الفلتر.':'شارك كودًا أو افتح نقاشًا.'} action={query?'امسح البحث':'إنشاء'} onAction={()=>query?setQuery(''):setCreate(true)}/>}
 footer={loadingMore?<ActivityIndicator color={t.colors.brand} style={{marginVertical:16}}/>:moreError?<ErrorState body={moreError} onRetry={()=>load(true)}/>:hasMore?<Button label="عرض المزيد" variant="secondary" onPress={()=>load(true)}/>:null} refreshControl={<RefreshControl refreshing={refreshing} tintColor={t.colors.brand} onRefresh={()=>{setRefreshing(true);load();}}/>}/>

 <Sheet visible={create} title="إنشاء في المجتمع" onClose={()=>setCreate(false)}><Col gap={12}><ListRow title="مشاركة كود" subtitle="المحرر ومعاينة التشغيل" icon="code-slash-outline" onPress={()=>{setCreate(false);setPicker(true);}}/><ListRow title="كتابة منشور" subtitle="سؤال أو نقاش أو تجربة" icon="chatbox-outline" onPress={()=>{setCreate(false);router.push('/discussion/new');}}/></Col></Sheet>
 <LanguagePicker visible={picker} onClose={()=>setPicker(false)} onSelect={id=>{setPicker(false);router.push(`/code/add?lang=${id}` as any);}}/></SafeAreaView>;
}

import React,{useEffect,useState,useRef} from 'react';
import { Image,View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router,useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Screen,AppBar,Col,Row,Text,Field,Button,IconButton,Segmented,Surface,ErrorState,ListSkeleton,useTheme } from '@/design';
import { LanguagePicker } from '@/components/editor/LanguagePicker';
import { LanguageIcon } from '@/components/editor/LanguageIcon';
import { showToast } from '@/components/ui/Toast';
import { pickProfileImage } from '@/services/profileService';
import { emptyPostDraft,getCommunityPost,saveCommunityPost,validatePost,resolvedPostDraft,type PostDraft } from '@/services/communityService';
export default function NewDiscussion(){
 const {userId}=useAuth();const {edit}=useLocalSearchParams<{edit?:string}>();const t=useTheme();
 const [draft,setDraft]=useState<PostDraft>(emptyPostDraft),[ready,setReady]=useState(false),[error,setError]=useState(''),[invalid,setInvalid]=useState(false),[phase,setPhase]=useState(''),[saving,setSaving]=useState(false),[picker,setPicker]=useState(false),[codeOpen,setCodeOpen]=useState(false),[imageError,setImageError]=useState('');
 const previous=useRef<string|null>(null),busy=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);const key=`community-draft:${userId}:${edit||'new'}`;
 const initialize=async()=>{setReady(false);setError('');try{
   let initial=emptyPostDraft();if(edit){const p=await getCommunityPost(edit);if(!p||p.user_id!==userId)throw new Error('هذا المنشور غير متاح للتعديل.');initial={id:p.id,title:p.title,body:p.body,kind:p.kind,code:p.code,language:p.language||'',topic:p.topic||'',image_path:p.image_path};previous.current=p.image_path;}
   const stored=await AsyncStorage.getItem(key);if(stored){const d=JSON.parse(stored);if(d?.id&&typeof d.title==='string'&&d.savedFor===userId&&d.editId===(edit||null))initial=d;}
   setDraft(initial);setCodeOpen(!!initial.code);setReady(true);
 }catch(e){setError(e instanceof Error?e.message:'تعذّر فتح المسودة.');}};
 useEffect(()=>{if(userId)initialize();return()=>clearTimeout(timer.current);},[userId,edit]);
 useEffect(()=>{if(!ready||!userId)return;clearTimeout(timer.current);timer.current=setTimeout(()=>{AsyncStorage.setItem(key,JSON.stringify({...draft,savedFor:userId,editId:edit||null})).catch(()=>setImageError('تعذّر حفظ المسودة على الجهاز. تبقى الحقول متاحة لإعادة المحاولة.'));},250);return()=>clearTimeout(timer.current);},[draft,ready,key,userId]);
 const change=(data:Partial<PostDraft>)=>{setDraft(d=>({...d,...data}));setError('');};
 const pick=async()=>{setImageError('');const r=await pickProfileImage('attachment');if(r.error)setImageError(r.error);if(r.image)change({image:r.image,image_path:null});};
 const [oldImage,setOldImage]=useState<string|null>(null);
 useEffect(()=>{if(!draft.image_path){setOldImage(null);return;}let alive=true;getCommunityPost(draft.id).then(p=>{if(alive)setOldImage(p?.image_url||null);}).catch(()=>undefined);return()=>{alive=false;};},[draft.image_path,draft.id]);
 const publish=async()=>{if(!userId||busy.current)return;setInvalid(true);const v=validatePost(draft);if(Object.values(v).some(Boolean))return;busy.current=true;setSaving(true);setError('');try{
   const r=await saveCommunityPost(userId,resolvedPostDraft(draft),previous.current,setPhase);if(!r.ok){setError(r.error);return;}
   clearTimeout(timer.current);await AsyncStorage.removeItem(key);if(r.warning)showToast.warning(r.warning,6000);router.replace(`/discussion/${draft.id}` as any);
 }catch(e){setError(e instanceof Error?e.message:'تعذّر الحفظ. مسودتك محفوظة.');}finally{busy.current=false;setSaving(false);setPhase('');}};
 const v=invalid?validatePost(draft):{title:'',body:'',code:''};
 return <Screen width="reading" header={<AppBar title={edit?'تعديل المنشور':'منشور جديد'} fallback="/code"/>} footer={ready?<View style={{padding:12,backgroundColor:t.colors.bg,borderTopWidth:1,borderTopColor:t.colors.border}}><Col gap={8} style={{width:'100%',maxWidth:720,alignSelf:'center'}}>{!!error&&<Text variant="bodySm" tone="danger" accessibilityLiveRegion="polite">{error}</Text>}<Button label={saving?phase:error?'إعادة محاولة النشر':edit?'حفظ التعديل':'نشر المنشور'} icon="send-outline" onPress={publish} loading={saving} full/></Col></View>:undefined}>
 {!userId?<Text>سجّل دخولك لكتابة منشور.</Text>:!ready?error?<ErrorState body={error} onRetry={initialize}/>:<ListSkeleton rows={3}/>:<Col gap={18} style={{paddingBottom:20}}>
   <Segmented options={[{value:'post',label:'منشور'},{value:'question',label:'سؤال'},{value:'auto',label:'تلقائي'}]} value={draft.kindMode||(draft.kind==='question'?'question':'post')} onChange={kindMode=>!saving&&change({kindMode:kindMode as PostDraft['kindMode']})}/>
   <Text variant="bodySm" tone="secondary">{draft.kindMode==='auto'?`الاقتراح من النص: ${resolvedPostDraft(draft).kind==='question'?'سؤال، ويمكن اختيار حل له':'منشور عادي'}. تقدر تغيّره قبل النشر.`:resolvedPostDraft(draft).kind==='question'?'سؤال برمجي · تقدر تحدّد الحل من الردود.':'منشور عادي · نص، صورة، تجربة أو تحية.'}</Text>
   <Field label="عنوان المنشور" value={draft.title} onChangeText={title=>change({title})} maxLength={120} hint={`${draft.title.length} / 120 حرفًا${resolvedPostDraft(draft).kind==='question'?'':' · اختياري'}`} error={v.title} editable={!saving}/>
   <Field label="نص المنشور" value={draft.body} onChangeText={body=>change({body})} multiline minHeight={140} maxLength={5000} hint={`${draft.body.length} / 5000 حرف`} error={v.body} editable={!saving}/>
   <Surface padding={12}><Col gap={10}><Row gap={8} wrap><Text variant="label" style={{flex:1}}>صورة واحدة · اختياري</Text>{(draft.image||draft.image_path)&&<IconButton label="إزالة الصورة" icon="trash-outline" disabled={saving} onPress={()=>change({image:null,image_path:null})}/>}<Button label={draft.image||draft.image_path?'تغيير الصورة':'إضافة صورة'} icon="image-outline" variant="secondary" size="sm" disabled={saving} onPress={pick}/></Row>
   {(draft.image?.uri||oldImage)&&<Image source={{uri:draft.image?.uri||oldImage!}} resizeMode="contain" style={{height:184,width:'100%',backgroundColor:t.colors.surfaceSunken}} accessibilityLabel="معاينة صورة المنشور"/>}
   <Text variant="bodySm" tone="secondary">تأكد ما تظهر كلمات مرور أو مفاتيح أو بيانات خاصة</Text><Text variant="caption" tone="secondary">PNG أو JPEG أو WebP · حتى 5 ميغابايت</Text>{!!imageError&&<Text variant="bodySm" tone="danger">{imageError}</Text>}</Col></Surface>
   <Button label={codeOpen?'إخفاء حقل الكود':'إضافة مقطع كود'} icon="code-slash-outline" variant="secondary" disabled={saving} onPress={()=>setCodeOpen(x=>!x)}/>
   {codeOpen&&<Field label="مقطع كود اختياري" value={draft.code} onChangeText={code=>change({code})} ltr multiline minHeight={140} maxLength={10000} autoCorrect={false} autoCapitalize="none" hint={`${draft.code.length} / 10000 حرف`} error={v.code} editable={!saving}/>}
   <Row gap={8} wrap>{!!draft.language&&<LanguageIcon language={draft.language} size={24}/>}<Button label={draft.language||'لغة الكود · اختياري'} icon="chevron-down" variant="secondary" disabled={saving} onPress={()=>setPicker(true)}/>{!!draft.language&&<IconButton label="مسح اللغة" icon="close" onPress={()=>change({language:''})}/>}</Row>
   <Field label="الموضوع · اختياري" value={draft.topic} onChangeText={topic=>change({topic})} maxLength={60} hint={`${draft.topic.length} / 60 حرفًا`} editable={!saving}/>
 </Col>}
 <LanguagePicker visible={picker} onClose={()=>setPicker(false)} onSelect={id=>{change({language:id});setPicker(false);}}/>
 </Screen>;
}

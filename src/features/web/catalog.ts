import { ALL_COURSES, ALL_LESSONS, ALL_CHALLENGES, getChallengeRequiredCourseId, getCourseTitleById } from '@/constants/courseData';
import { PROGRAMMING_FIELDS } from '@/constants';
export type PublicDocument = { path: string; title: string; description: string; body?: string; code?: string; language?: string; type?: 'course'|'lesson'|'challenge'|'profile'|'post'; links?: {path:string;title:string}[]; breadcrumbs?:{path:string;title:string}[]; requirement?:string; image?:string|null; updated?:string; author?:string };
export const WEB_ORIGIN = 'https://www.kodax.app';
export function staticDocuments(): PublicDocument[] {
  const fields = PROGRAMMING_FIELDS.map(f => ({path:`/field/${f.id}`,title:f.nameAr,description:`تعلّم ${f.nameAr} بالعربية مع دورات ودروس Kodax.`,links:ALL_COURSES.filter(c=>c.fieldId===f.id).sort((a,b)=>a.order-b.order).map(c=>({path:`/course/${c.id}`,title:c.title}))}));
  const home = {path:'/',title:'Kodax — تعلّم البرمجة بالعربية',description:'منصة عراقية لتعلّم البرمجة بالعربية: دورات ودروس وتحديات ومجتمع للمبرمجين.',links:fields.map(f=>({path:f.path,title:f.title}))};
  return [home,{...home,path:'/learn',title:'مسارات تعلّم البرمجة'},...fields,
    ...ALL_COURSES.map(c=>({path:`/course/${c.id}`,type:'course' as const,title:c.title,description:c.description,body:c.description,breadcrumbs:[{path:`/field/${c.fieldId}`,title:PROGRAMMING_FIELDS.find(f=>f.id===c.fieldId)?.nameAr||c.fieldId}],requirement:c.requiredCourseId?`تقدّم في دورة «${getCourseTitleById(c.requiredCourseId)}» لفتح إكمال هذه المرحلة بحسابك.`:undefined,links:ALL_LESSONS.filter(l=>l.courseId===c.id).sort((a,b)=>a.order-b.order).map(l=>({path:`/lesson/${l.id}`,title:l.title}))})),
    ...ALL_LESSONS.map(l=>{const c=ALL_COURSES.find(c=>c.id===l.courseId);return {path:`/lesson/${l.id}`,type:'lesson' as const,title:`${l.title} — ${c?.title||l.language}`,description:l.description||`درس ${l.title} ضمن ${c?.title||'تعلّم البرمجة'} بالعربية.`,body:l.content,code:l.codeExample,language:l.language,breadcrumbs:[{path:`/course/${l.courseId}`,title:c?.title||'الدورة'}],links:ALL_LESSONS.filter(n=>n.courseId===l.courseId&&Math.abs(n.order-l.order)===1).map(n=>({path:`/lesson/${n.id}`,title:n.title}))};}),
    {path:'/challenges',title:'التحديات البرمجية',description:'تحديات عملية لتطبيق ما تتعلّمه في Python وJavaScript وتطوير الويب وبقية مسارات Kodax.',links:ALL_CHALLENGES.map(c=>({path:`/challenge/${c.id}`,title:c.title}))},
    ...ALL_CHALLENGES.map(c=>{const req=getChallengeRequiredCourseId(c);return {path:`/challenge/${c.id}`,type:'challenge' as const,title:`${c.title} — تحدي ${c.language}`,description:c.description.slice(0,160),body:c.description,code:c.starterCode,language:c.language,requirement:req?`حل هذا التحدي يرتبط بفتح دورة «${getCourseTitleById(req)}» بحسابك.`:undefined,breadcrumbs:[{path:'/challenges',title:'التحديات'}]};}),
    {path:'/code',title:'مجتمع Kodax',description:'أكواد وأسئلة وتجارب من مجتمع متعلمي البرمجة في Kodax.'},
    {path:'/people',title:'أشخاص مجتمع Kodax',description:'ابحث عن متعلمي البرمجة في مجتمع Kodax بالاسم أو اسم المستخدم، واستكشف ملفاتهم العامة.',links:[{path:'/code',title:'المجتمع'}]},
    {path:'/download',title:'تحميل Kodax',description:'تعلّم البرمجة بالعربية على جهازك. شاهد التطبيق وحمّله من المتجر أو ابدأ من المتصفح.'},
    {path:'/about',title:'حول Kodax',description:'Kodax منصة عراقية لتعلّم البرمجة بالعربية من خلال الدروس والتحديات ومشاركة الأكواد.'},
    {path:'/privacy',title:'سياسة الخصوصية',description:'سياسة الخصوصية وحماية البيانات في Kodax.'},
    {path:'/terms',title:'شروط الاستخدام',description:'شروط استخدام منصة Kodax.'},
    {path:'/delete-account',title:'حذف حساب Kodax',description:'طريقة طلب حذف حسابك وبياناتك من Kodax.'}
  ];
}
let documents: PublicDocument[] | undefined;
export function staticDocument(path:string): PublicDocument|undefined { return (documents ??= staticDocuments()).find(d=>d.path===path); }
export function dynamicDocument(kind:string,key:string,data:any): PublicDocument|null {
  if(!data)return null;
  if(kind==='user')return {path:`/user/${encodeURIComponent(data.username)}`,type:'profile',title:`${data.full_name||data.username} (@${data.username})`,description:data.bio||`الملف العام لـ${data.full_name||data.username} في مجتمع Kodax.`,body:data.bio||'',image:data.avatar_url,links:(data.snippets||[]).map((s:any)=>({path:`/code/${s.id}`,title:s.title}))};
  if(kind==='code'||kind==='discussion')return {path:`/${kind}/${key}`,type:'post',title:data.title||data.body?.slice(0,70)||'منشور من مجتمع Kodax',description:data.description||data.body?.slice(0,160)||`كود ${data.language||''} من مجتمع Kodax.`,body:data.description||data.body,code:data.code,language:data.language,updated:data.updated_at,author:data.profiles?.full_name||data.profiles?.username,breadcrumbs:[{path:'/code',title:'المجتمع'}],links:data.profiles?.username?[{path:`/user/${encodeURIComponent(data.profiles.username)}`,title:data.profiles.full_name||data.profiles.username}]:[]};
  return null;
}

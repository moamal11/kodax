import { useEffect } from 'react';
import { usePathname, useGlobalSearchParams } from 'expo-router';
import { staticDocument, dynamicDocument, WEB_ORIGIN, type PublicDocument } from './catalog';
import { publicWebDocument } from '@/services/publicWebService';
function metadata(name:string,value:string,property=false){const key=property?'property':'name';const matches=Array.from(document.head.querySelectorAll<HTMLMetaElement>(`meta[${key}="${name}"]`));const node=matches.shift()||document.createElement('meta');matches.forEach(n=>n.remove());node.setAttribute(key,name);node.content=value;if(!node.parentNode)document.head.append(node);}
function apply(doc:PublicDocument|undefined){
 document.title=doc?`${doc.title}${doc.title.startsWith('Kodax')?'':' | Kodax'}`:'Kodax';
 metadata('description',doc?.description||'Kodax — تعلّم البرمجة بالعربية');metadata('robots',doc?'index,follow':'noindex,follow');
 metadata('og:title',document.title,true);metadata('og:description',doc?.description||'',true);metadata('og:type',doc?.type==='post'?'article':'website',true);metadata('og:url',doc?WEB_ORIGIN+doc.path:'',true);metadata('og:image',doc?.image||WEB_ORIGIN+'/icon-512.png',true);
 metadata('twitter:title',document.title);metadata('twitter:description',doc?.description||'');metadata('twitter:image',doc?.image||WEB_ORIGIN+'/icon-512.png');
 document.querySelectorAll('link[rel="canonical"]').forEach(n=>n.remove());if(doc){const l=document.createElement('link');l.rel='canonical';l.href=WEB_ORIGIN+doc.path;document.head.append(l);}
 document.getElementById('kx-structured-data')?.remove();
 if(doc){const s=document.createElement('script');s.id='kx-structured-data';s.type='application/ld+json';s.textContent=JSON.stringify({'@context':'https://schema.org','@type':doc.type==='course'?'Course':doc.type==='post'?'CreativeWork':'WebPage',name:doc.title,description:doc.description,url:WEB_ORIGIN+doc.path,inLanguage:'ar',...(doc.type==='course'?{provider:{'@type':'Organization',name:'Kodax',url:WEB_ORIGIN}}:{})});document.head.append(s);}
}
export default function WebSEO(){const path=usePathname();const params=useGlobalSearchParams();useEffect(()=>{let active=true;const canonical=path.replace(/\/$/,'')||'/';const local=staticDocument(canonical==='/learn'&&params.tab==='challenges'?'/challenges':canonical);const m=canonical.match(/^\/(user|code|discussion)\/([^/]+)$/);if(m&&!['add','new'].includes(m[2]))publicWebDocument(m[1],decodeURIComponent(m[2])).then(data=>{if(active)apply(dynamicDocument(m[1],m[2],data)||undefined);}).catch(()=>{if(active)apply(undefined);});else apply(local);return()=>{active=false;};},[path,params.tab]);return null;}

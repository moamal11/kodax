const {decorate,urlset,esc,ORIGIN}=require('../web-server/render.cjs');
const documents=require('../web-server/generated/catalog.json');
const templates=require('../web-server/generated/templates.json');
// Anonymous key only. Never use a service role for publicly cacheable content.
const defaults=require('../web-server/public-config.cjs');
const url=process.env.EXPO_PUBLIC_SUPABASE_URL||defaults.url,key=process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY||defaults.key;
async function rpc(name,args={}){const response=await fetch(url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error('Public data unavailable');return response.json();}
function dynamic(kind,id,data){if(!data)return null;if(kind==='user')return {path:'/user/'+encodeURIComponent(data.username),type:'profile',title:`${data.full_name||data.username} (@${data.username})`,description:data.bio||`الملف العام لـ${data.full_name||data.username} في مجتمع Kodax.`,body:data.bio||'',image:data.avatar_url,links:(data.publications||[]).map(item=>({path:'/'+item.type+'/'+item.id,title:item.data.title||item.data.body?.slice(0,70)||'منشور'}))};return {path:'/'+kind+'/'+id,type:'post',title:data.title||data.body?.slice(0,70)||'منشور من مجتمع Kodax',description:data.description||data.body?.slice(0,160)||`كود ${data.language||''} من مجتمع Kodax.`,body:data.description||data.body,code:data.code,language:data.language,updated:data.updated_at,author:data.profiles?.full_name||data.profiles?.username,breadcrumbs:[{path:'/code',title:'المجتمع'}],links:data.profiles?.username?[{path:'/user/'+encodeURIComponent(data.profiles.username),title:data.profiles.full_name||data.profiles.username}]:[]};}
module.exports=async(req,res)=>{const kind=String(req.query?.kind||''),id=String(req.query?.key||'');
 try{
  if(kind==='sitemap'){
   res.setHeader('Content-Type','application/xml; charset=utf-8');res.setHeader('Cache-Control','public,max-age=0,s-maxage=60');
   if(id==='index'){const counts=await rpc('public_web_url_counts');const links=['/sitemap-static.xml'];for(const k of ['user','code','discussion'])for(let p=0;p<Math.ceil(Number(counts[k]||0)/1000);p++)links.push(`/sitemap-${k}-${p}.xml`);return res.end(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${links.map(l=>`<sitemap><loc>${esc(ORIGIN+l)}</loc></sitemap>`).join('')}</sitemapindex>`);}
   const m=id.match(/^(user|code|discussion)-(\d+)$/);if(!m||Number(m[2])>1000){res.statusCode=404;return res.end();}const rows=await rpc('public_web_urls',{p_kind:m[1],p_page:Number(m[2]),p_limit:1000});return res.end(urlset(rows));
  }
  if(!['user','code','discussion','field','course','lesson','challenge'].includes(kind)||!id||id.length>120||/[\\/\x00-\x1f]/.test(id)){res.statusCode=404;return res.end('Not found');}
  let doc;if(['user','code','discussion'].includes(kind)){const data=await rpc('public_web_document',{p_kind:kind,p_key:id});if(kind==='user'&&data){const feed=await rpc('profile_publications',{p_user:data.id,p_limit:30});data.publications=feed.items;}doc=dynamic(kind,id,data);res.setHeader('Cache-Control','no-store');}else{doc=documents.find(d=>d.path===`/${kind}/${id}`);res.setHeader('Cache-Control','public,max-age=0,s-maxage=3600');}
  if(!doc){res.statusCode=404;res.setHeader('X-Robots-Tag','noindex');return res.end('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>الصفحة غير موجودة | Kodax</title><h1>الصفحة غير موجودة</h1><a href="/learn">تعلّم</a></html>');}
  if(kind==='user'&&doc.path!==`/user/${id}`){res.statusCode=301;res.setHeader('Location',doc.path);return res.end();}
  res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(decorate(templates[kind],doc));
 }catch{res.statusCode=503;res.setHeader('Cache-Control','no-store');res.setHeader('Retry-After','60');res.setHeader('X-Robots-Tag','noindex');res.end('تعذّر تحميل الصفحة. حاول لاحقًا.');}
};
module.exports.rpc=rpc;

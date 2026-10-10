import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
const secret=Deno.env.get('PUSH_CRON_SECRET')||'';
const allowedEndpoint=(endpoint:string)=>{try{const u=new URL(endpoint);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(u.hostname==='fcm.googleapis.com'||u.hostname==='updates.push.services.mozilla.com'||u.hostname==='updates.push.services.mozilla.org'||u.hostname==='web.push.apple.com'||/^[a-z0-9-]+\.notify\.windows\.com$/.test(u.hostname));}catch{return false;}};
function equal(a:string,b:string){if(!a||a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}
async function rpc(fn:string,args:Record<string,unknown>={}){const r=await client.rpc(fn,args);if(r.error)throw new Error(fn);return r.data;}
Deno.serve(async req=>{
 if(req.method!=='POST')return new Response('',{status:405});
 if(!equal(req.headers.get('x-cron-secret')||'',secret))return Response.json({error:'forbidden'},{status:403});
 const pub=Deno.env.get('WEB_PUSH_VAPID_PUBLIC_KEY'),priv=Deno.env.get('WEB_PUSH_VAPID_PRIVATE_KEY');
 if(!pub||!priv)return Response.json({error:'web_push_not_configured'},{status:503});
 let sent=0,failed=0,skipped=0;
 try{const rows=await rpc('web_push_claim',{p_limit:100});await Promise.all(rows.map(async(m:any)=>{
  if(m.expired||!allowedEndpoint(m.endpoint)){await rpc('web_push_result',{p_id:m.id,p_status:'skipped',p_error:'unavailable'});skipped++;return;}
  try{await webpush.sendNotification({endpoint:m.endpoint,keys:m.keys},JSON.stringify({id:m.id,title:m.title,body:m.body,data:m.data}),{vapidDetails:{subject:'https://kodax.app',publicKey:pub,privateKey:priv},TTL:3600,timeout:10000});await rpc('web_push_result',{p_id:m.id,p_status:'sent'});sent++;}
  catch(e){const status=Number((e as any)?.statusCode||0);await rpc('web_push_result',{p_id:m.id,p_status:'failed',p_error:`web_push_http_${status||'network'}`,p_invalid:status===404||status===410});failed++;}
 }));return Response.json({success:true,sent,failed,skipped});}catch{return Response.json({error:'server_error'},{status:500});}
});

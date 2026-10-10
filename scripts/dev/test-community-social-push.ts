import {buildMessages,processBatch,type PushDeps} from '../../supabase/functions/push-send/core';
import {writeFileSync} from 'node:fs';
const checks:any[]=[],check=(name:string,ok:boolean)=>{checks.push({name,ok});console.log((ok?'PASS ':'FAIL ')+name);};
(async()=>{const post={id:1,kind:'new_post',title:'نشر شخص تتابعه',body:'منشور جديد',tokens:['local-only'],data:{url:'/discussion/example',actorId:'dedicated-test'}},reply={...post,id:2,kind:'comment',title:'رد على تعليقك'};
check('New posts use Android social channel',buildMessages(post)[0].channelId==='social');check('Replies carry target and social channel',buildMessages(reply)[0].channelId==='social'&&buildMessages(reply)[0].data.url===post.data.url);
let sent:any[]=[],results:any[]=[];const deps:PushDeps={claim:async()=>[post,reply,{...post,id:3,tokens:[]}],expoSend:async msgs=>{sent=msgs;return msgs.map((_,i)=>({status:'ok',id:'test-'+i}));},recordResults:async r=>{results=r;},receiptsDue:async()=>[],recordReceipts:async()=>{},expoReceipts:async()=>({})};
const r=await processBatch(deps);check('Each eligible event sent once through isolated adapter',sent.length===2&&r.sent===2);check('No device is safely skipped',r.skipped===1&&results.find(x=>x.id===3).error==='no_enabled_device');
deps.expoSend=async()=>{throw new Error('simulated network failure');};await processBatch(deps);check('Network failure recorded for retry',results.filter(x=>x.id<3).every(x=>!x.ok&&x.error==='simulated network failure'));
writeFileSync('reports/community-social-20261010/push-adapter-local.json',JSON.stringify({network:'No real Expo or FCM request; adapter-only regression',checks},null,2));if(checks.some(x=>!x.ok))process.exitCode=1;})();

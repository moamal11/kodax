const fs=require('node:fs'),crypto=require('node:crypto'),q=require('./live-profile-client.cjs');
(async()=>{const s=JSON.parse(fs.readFileSync(q.PRIVATE)),{client}=q.clients(),a=client(),b=client();await q.login(a,s.accounts[0]);await q.login(b,s.accounts[1]);const uid=s.accounts[0].id,checks=[];
 const add=(name,ok,detail)=>{checks.push({name,ok:!!ok,detail});console.log(ok?'PASS':'FAIL',name);};
 const list=async()=>{const r=await a.storage.from('profile-covers').list(uid);if(r.error)throw r.error;return r.data.map(o=>o.name);};
 const paths=[1,2].map(()=>uid+'/recheck-'+crypto.randomUUID()+'.png'),bytes=fs.readFileSync('assets/branding/kodax-full-white-on-purple.png');
 for(const p of paths){const r=await a.storage.from('profile-covers').upload(p,bytes,{contentType:'image/png'});if(r.error)throw r.error;}
 const url=a.storage.from('profile-covers').getPublicUrl(paths[0]).data.publicUrl;await fetch(url);await b.storage.from('profile-covers').remove([paths[0]]);add('Visitor delete preserves actual owner Storage object',(await list()).includes(paths[0].split('/')[1]));
 const deletion=await a.storage.from('profile-covers').remove([paths[0]]);const files=await list();add('Owner replacement removes old object; replacement remains',!deletion.error&&!files.includes(paths[0].split('/')[1])&&files.includes(paths[1].split('/')[1]));
 const removal=await a.storage.from('profile-covers').remove([paths[1]]);add('Owner removal leaves neither temporary image in Storage',!removal.error&&(await list()).every(n=>!paths.some(p=>p.endsWith('/'+n))));
 const uncached=await fetch(url+'?removed-check='+Date.now());add('Deleted object unavailable on fresh uncached public request',!uncached.ok,{status:uncached.status});
 fs.writeFileSync('reports/profile-live-20261010/storage-final-checks.json',JSON.stringify({project:q.REF,checks,note:'Initial public URL assertions hit an already cached CDN response. Final deletion checks use real Storage listing and uncached requests, not a cached URL.'},null,2));if(checks.some(c=>!c.ok))process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1});

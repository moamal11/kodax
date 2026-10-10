const fs=require('node:fs');const URL='http://127.0.0.1:54323',checks=[];
const check=(name,ok)=>{checks.push({name,ok:!!ok});console.log(ok?'PASS':'FAIL',name);};
async function login(email){return (await fetch(URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'kodax-local-123'})})).json();}
(async()=>{
 const a=await login('qa@kodax.local'),b=await login('laith@kodax.local');const key=a.user.id+'/http-policy-check.png';const image=fs.readFileSync('assets/branding/kodax-symbol-white-on-purple.png');
 const upload=(token,where,data=image,type='image/png')=>fetch(URL+'/storage/v1/object/profile-covers/'+where,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':type},body:data});
 const remove=(token,where)=>fetch(URL+'/storage/v1/object/profile-covers',{method:'DELETE',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({prefixes:[where]})});
 check('Anonymous image upload denied',(await upload('',key)).status===403);
 check('Other account upload into owner folder denied',(await upload(b.access_token,key)).status===403);
 check('Owner cover upload succeeds',(await upload(a.access_token,key)).status===200);
 check('Public image is available',(await fetch(URL+'/storage/v1/object/public/profile-covers/'+key)).status===200);
 check('Other account cannot remove cover',(await remove(b.access_token,key)).status===403);
 check('Owner object survives unauthorized removal',(await fetch(URL+'/storage/v1/object/public/profile-covers/'+key)).status===200);
 check('Non-image MIME type rejected',(await upload(a.access_token,a.user.id+'/bad.html',Buffer.from('<html>'),'text/html')).status===400);
 check('Spoofed image payload rejected by local Storage adapter',(await upload(a.access_token,a.user.id+'/spoof.png',Buffer.from('<html>'),'image/png')).status===400);
 const large=Buffer.alloc(5242881);image.copy(large,0,0,8);
 check('Images above 5 MiB rejected',(await upload(a.access_token,a.user.id+'/large.png',large)).status===400);
 check('Owner cover removal succeeds',(await remove(a.access_token,key)).status===200);
 check('Deleted cover no longer readable',(await fetch(URL+'/storage/v1/object/public/profile-covers/'+key)).status===404);
 fs.mkdirSync('reports/profile-identity-20261009',{recursive:true});fs.writeFileSync('reports/profile-identity-20261009/storage-http-checks.json',JSON.stringify({checks,scope:'Local Supabase-shaped Storage adapter + actual storage.objects RLS; no production request'},null,2));
 if(checks.some(c=>!c.ok))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});

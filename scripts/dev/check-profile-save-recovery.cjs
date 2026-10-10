const fs=require('node:fs'),path=require('node:path'),puppeteer=require(path.join(process.env.TEMP,'kxtools/node_modules/puppeteer-core'));
const WEB='http://localhost:8102',API='http://127.0.0.1:54323',OUT='reports/profile-identity-20261009/web',checks=[];
const sel=label=>'[role="button"][aria-label='+JSON.stringify(label)+']';
const wait=ms=>new Promise(r=>setTimeout(r,ms));const check=(name,ok)=>{checks.push({name,ok:!!ok});console.log(ok?'PASS':'FAIL',name);};
async function click(p,label){await p.waitForSelector(sel(label));await p.waitForFunction(s=>document.querySelector(s)?.getAttribute('aria-disabled')!=='true',{},sel(label));await p.click(sel(label));await wait(300);}
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),p=await b.newPage();p.setDefaultNavigationTimeout(180000);p.setDefaultTimeout(60000);
 try{
 const s=await(await fetch(API+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'noor@kodax.local',password:'kodax-local-123'})})).json();
 const headers={Authorization:'Bearer '+s.access_token,'Content-Type':'application/json',Prefer:'return=representation'};
 const current=async()=> (await(await fetch(API+'/rest/v1/profiles?id=eq.'+s.user.id+'&select=cover_url,bio',{headers})).json())[0];
 await p.setViewport({width:390,height:844});await p.goto(WEB+'/download',{waitUntil:'networkidle2'});await p.evaluate(s=>localStorage.setItem('sb-127-auth-token',JSON.stringify(s)),s);await p.goto(WEB+'/profile',{waitUntil:'networkidle2'});
 const setCover=async()=>{await click(p,'تعديل الملف');const choose=p.waitForFileChooser();await click(p,await p.$(sel('تغيير الغلاف'))?'تغيير الغلاف':'اختيار غلاف');await(await choose).accept([path.resolve('assets/branding/kodax-full-white-on-purple.png')]);await p.waitForSelector('[aria-label="معاينة الغلاف"]');};
 await p.setRequestInterception(true);let mode='lost',loss=false;const uploads=[];
 const intercept=async r=>{
  if(r.method()==='POST'&&r.url().includes('/storage/v1/object/profile-covers/'))uploads.push(r.url().replace('/object/','/object/public/'));
  if(mode==='lost'&&r.method()==='PATCH'&&r.url().includes('/rest/v1/profiles')){loss=true;await fetch(r.url(),{method:'PATCH',headers:r.headers(),body:r.postData()});return r.abort('failed');}
  if(mode==='fail'&&r.method()==='PATCH'&&r.url().includes('/rest/v1/profiles'))return r.respond({status:500,headers:{'access-control-allow-origin':'*'},contentType:'application/json',body:'{"message":"QA rejected save"}'});
  if(mode==='cleanup'&&r.method()==='DELETE'&&r.url().includes('/storage/v1/object/'))return r.respond({status:503,headers:{'access-control-allow-origin':'*'},contentType:'application/json',body:'{"message":"QA cleanup unavailable"}'});
  return r.continue();
 };p.on('request',intercept);
 await setCover();await click(p,'حفظ التغييرات');await p.waitForFunction(()=>!document.body.innerText.includes('حفظ التغييرات'));const first=(await current()).cover_url;check('Lost profile commit response recovered without deleting committed cover',loss&&!!first&&(await fetch(first)).status===200);
 mode='fail';await setCover();await click(p,'حفظ التغييرات');await p.waitForFunction(()=>document.body.innerText.includes('إعادة محاولة الحفظ'));check('Rejected save rolls back only unreferenced new upload',(await current()).cover_url===first&&(await fetch(uploads.at(-1))).status===404&&(await fetch(first)).status===200);await click(p,'إلغاء');
 mode='cleanup';await setCover();await click(p,'حفظ التغييرات');await p.waitForFunction(()=>!document.body.innerText.includes('حفظ التغييرات'));const second=(await current()).cover_url;check('Cleanup failure preserves saved cover and durable retry queue',second!==first&&(await fetch(second)).status===200&&(await fetch(first)).status===200&&await p.evaluate(()=>Object.keys(localStorage).some(k=>k.includes('profile-image-cleanup'))));
 mode='normal';await click(p,'تعديل الملف');await click(p,'إزالة الغلاف');await click(p,'حفظ التغييرات');await p.waitForFunction(()=>!document.body.innerText.includes('حفظ التغييرات'));check('Later save retries cleanup and removal persists',(await current()).cover_url===null&&(await fetch(first)).status===404&&(await fetch(second)).status===404);
 p.off('request',intercept);await p.setRequestInterception(false);
 }catch(e){checks.push({name:'Recovery test exception',ok:false,detail:e.stack});console.log(e.stack);}
 finally{fs.writeFileSync(OUT+'/save-recovery-checks.json',JSON.stringify({checks},null,2));await b.close();}
 if(checks.some(c=>!c.ok))process.exitCode=1;
})();

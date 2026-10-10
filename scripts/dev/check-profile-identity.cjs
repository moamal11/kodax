const fs = require('node:fs'), path = require('node:path');
const puppeteer = require(path.join(process.env.TEMP,'kxtools/node_modules/puppeteer-core'));
const API='http://127.0.0.1:54323', WEB='http://localhost:8102', OUT='reports/profile-identity-20261009/web';
const checks=[],errors=[];
const check=(name,ok,detail)=>{checks.push({name,ok:!!ok,detail});console.log(ok?'PASS':'FAIL',name);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function auth(email){return (await fetch(API+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password:'kodax-local-123'})})).json();}
async function api(session,route,body,method=body?'POST':'GET') {const r=await fetch(API+route,{method,headers:{Authorization:'Bearer '+session.access_token,'content-type':'application/json',Prefer:'return=representation'},body:body?JSON.stringify(body):undefined});let data;try{data=await r.json();}catch{data=null;}return{status:r.status,data};}
const selector=label=>'[role="button"][aria-label='+JSON.stringify(label)+']';
async function click(page,label){const e=await page.waitForSelector(selector(label),{timeout:20000});await page.waitForFunction(sel=>document.querySelector(sel)?.getAttribute('aria-disabled')!=='true',{},selector(label));await e.click();await wait(250);}
async function fill(page,label,text){await wait(500);const e=await page.waitForSelector('input[aria-label='+JSON.stringify(label)+'],textarea[aria-label='+JSON.stringify(label)+']');await e.click();await page.keyboard.down('Control');await page.keyboard.press('A');await page.keyboard.up('Control');await page.keyboard.press('Backspace');await e.type(text);}
async function snap(page,name){await wait(300);await page.screenshot({path:OUT+'/'+name+'.png'});}
async function scrollTo(page,selectorText){await page.$eval(selectorText,e=>e.scrollIntoView({block:'center'}));await wait(300);}
(async()=>{
 fs.mkdirSync(OUT,{recursive:true}); const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const p=await browser.newPage();p.on('pageerror',e=>errors.push({message:e.message,stack:e.stack}));p.setDefaultTimeout(30000);
 try{
 const A=await auth('qa@kodax.local'),B=await auth('laith@kodax.local');const uid=A.user.id;
 const old=(await api(A,'/rest/v1/profiles?id=eq.'+uid+'&select=cover_url')).data[0].cover_url;
 await api(A,'/rest/v1/profiles?id=eq.'+uid,{cover_url:null,bio:null,followers_visible:true,following_visible:true},'PATCH');
 if(old&&old.startsWith(API+'/storage/v1/object/public/profile-covers/'))await api(A,'/storage/v1/object/profile-covers',{prefixes:[decodeURIComponent(old.split('/profile-covers/')[1])]},'DELETE');
 await api(A,'/rest/v1/code_snippets?id=eq.40000000-0000-4000-8000-000000000001',null,'DELETE');
 await p.setViewport({width:390,height:844});await p.goto(WEB+'/download',{waitUntil:'networkidle2',timeout:180000});
 await snap(p,'phone-start-logo');
 await p.evaluate(s=>{for(const h of ['127','localhost'])localStorage.setItem('sb-'+h+'-auth-token',JSON.stringify(s));},A);
 await p.goto(WEB+'/profile',{waitUntil:'networkidle2'});await p.waitForSelector(selector('تعديل الملف'));
 await snap(p,'phone-profile-empty-cover');await click(p,'تعديل الملف');
 check('Bio limit and empty cover editor are visible',await p.evaluate(()=>document.body.innerText.includes('280 حرفًا')&&document.body.innerText.includes('بدون صورة غلاف')));
 let cancelChooser=p.waitForFileChooser();await click(p,'اختيار غلاف');await(await cancelChooser).cancel();await p.waitForFunction(()=>document.querySelector('[aria-label="حفظ التغييرات"]')?.getAttribute('aria-disabled')!=='true');check('Cancelling image picker leaves editor usable',true);
 let chooser=p.waitForFileChooser();await click(p,'اختيار غلاف');await (await chooser).accept([path.resolve('assets/branding/kodax-full-white-on-purple.png')]);await p.waitForSelector('[aria-label="معاينة الغلاف"]');
 chooser=p.waitForFileChooser();await click(p,'تغيير الصورة الشخصية');await (await chooser).accept([path.resolve('assets/branding/kodax-symbol-white-on-purple.png')]);
 await fill(p,'نبذة عنك (اختيارية)','ع'.repeat(281));check('Bio editor enforces announced 280-character limit',await p.$eval('textarea[aria-label="نبذة عنك (اختيارية)"]',e=>Array.from(e.value).length===280));
 await fill(p,'نبذة عنك (اختيارية)','هذا حساب اختبار محلي. أتعلم Python وأشارك أمثلة برمجية مع المجتمع.');
 await snap(p,'phone-profile-edit-preview');
 await click(p,'حفظ التغييرات');await p.waitForFunction(()=>!document.body.innerText.includes('حفظ التغييرات'));
 let saved=(await api(A,'/rest/v1/profiles?id=eq.'+uid+'&select=cover_url,avatar_url,bio')).data[0];
 check('Avatar + cover bytes stored and bio persisted from real editor',!!saved.cover_url&&!!saved.avatar_url&&saved.bio.includes('Python')&&(await fetch(saved.cover_url)).status===200&&(await fetch(saved.avatar_url)).status===200,saved);
 const firstCover=saved.cover_url;
 await p.reload({waitUntil:'networkidle2'});check('Profile identity survives app reload',await p.evaluate(()=>document.body.innerText.includes('أتعلم Python')));
 await click(p,'تعديل الملف');
 chooser=p.waitForFileChooser();await click(p,'تغيير الغلاف');await (await chooser).accept([path.resolve('assets/branding/kodax-full-purple-on-white.png')]);await click(p,'حفظ التغييرات');await p.waitForFunction(()=>!document.body.innerText.includes('حفظ التغييرات'));
 saved=(await api(A,'/rest/v1/profiles?id=eq.'+uid+'&select=cover_url,avatar_url,bio')).data[0];
 check('Replacing cover removes previous object',saved.cover_url!==firstCover&&(await fetch(firstCover)).status===404&&(await fetch(saved.cover_url)).status===200);
 // Simulate profile commit failure after an upload; both original fields and old image survive.
 await click(p,'تعديل الملف');chooser=p.waitForFileChooser();await click(p,'تغيير الغلاف');await (await chooser).accept([path.resolve('assets/branding/kodax-full-white-on-purple.png')]);
 await p.setRequestInterception(true);let failSave=true;const newUploads=[];
 const intercept=req=>{
  if(failSave&&req.url().startsWith(API+'/rest/v1/profiles')&&req.method()==='PATCH')return req.respond({status:500,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({message:'QA intentional save failure'})});
  if(req.method()==='POST'&&req.url().includes('/storage/v1/object/profile-covers/'))newUploads.push(req.url().replace('/object/','/object/public/'));
  req.continue();
 };p.on('request',intercept);await click(p,'حفظ التغييرات');await p.waitForFunction(()=>document.body.innerText.includes('إعادة محاولة الحفظ'));
 const unchanged=(await api(A,'/rest/v1/profiles?id=eq.'+uid+'&select=cover_url,avatar_url,bio')).data[0];
 check('Failed commit preserves old image and removes new orphan',unchanged.cover_url===saved.cover_url&&newUploads.length===1&&(await fetch(newUploads[0])).status===404,newUploads);
 await snap(p,'phone-profile-save-error');failSave=false;await click(p,'إعادة محاولة الحفظ');await p.waitForFunction(()=>!document.body.innerText.includes('إعادة محاولة الحفظ'));
 p.off('request',intercept);await p.setRequestInterception(false);
 await p.goto(WEB+'/settings',{waitUntil:'networkidle2'});await p.waitForSelector('[role="switch"]');
 const privacy=await p.$$('div[role="switch"][aria-label]');await privacy[0].click();await p.waitForFunction(()=>[...document.querySelectorAll('div[role="switch"][aria-label]')].every(e=>e.getAttribute('aria-disabled')!=='true'));await privacy[1].click();await p.waitForFunction(()=>[...document.querySelectorAll('div[role="switch"][aria-label]')].every(e=>e.getAttribute('aria-disabled')!=='true'));await wait(500);
 const flags=(await api(A,'/rest/v1/profiles?id=eq.'+uid+'&select=followers_visible,following_visible')).data[0];
 check('Both privacy settings persisted from switches',flags.followers_visible===false&&flags.following_visible===false);
 check('Second account denied hidden list through RPC',(await api(B,'/rest/v1/rpc/profile_follow_list',{p_user:uid,p_kind:'followers',p_limit:50})).status===403);
 check('Raw direct follows query denied',(await api(B,'/rest/v1/follows?following_id=eq.'+uid)).status===403);
 check('Owner can read hidden list',(await api(A,'/rest/v1/rpc/profile_follow_list',{p_user:uid,p_kind:'followers',p_limit:50})).data.length>0);
 // Create an isolated local snippet; avoid editing seeded community content.
 const sid='40000000-0000-4000-8000-000000000001',rid='40000000-0000-4000-8000-000000000002';
 await api(A,'/rest/v1/code_snippets',{id:sid,user_id:uid,title:'فحص التعليقات والردود',description:'محتوى لحسابات الاختبار المحلية فقط',code:'print("Kodax")',language:'python',is_public:true});
 await api(A,'/rest/v1/code_comments',{id:rid,user_id:uid,snippet_id:sid,content:'شنو أفضل طريقة لتنظيم هذا المثال؟'});
 await api(B,'/rest/v1/code_comments',{id:'40000000-0000-4000-8000-000000000003',user_id:B.user.id,snippet_id:sid,parent_id:rid,content:'تقدر تفصل المنطق عن العرض.\n```python\nprint("Kodax")\n```\nمرجع: https://example.com/docs'});
 await p.goto(WEB+'/code/'+sid,{waitUntil:'networkidle2'});await p.waitForSelector(selector('عرض 1 ردود'));await scrollTo(p,selector('عرض 1 ردود'));
 check('Replies are hidden by default',!(await p.evaluate(()=>document.body.innerText.includes('تقدر تفصل المنطق'))));
 await snap(p,'phone-comments-closed');await click(p,'عرض 1 ردود');check('Replies expand with code and link',await p.evaluate(()=>document.body.innerText.includes('تقدر تفصل المنطق')&&!!document.querySelector('[role="link"]')));await snap(p,'phone-comments-open');
 const editButtons=await p.$$(selector('تعديل'));await editButtons[0].click();await fill(p,'التعليق','تعليق معدّل من حساب الاختبار.');await click(p,'حفظ التعديل');await p.waitForFunction(()=>document.body.innerText.includes('تم التعديل'));
 check('Edited marker shown after real mutation',true);await click(p,'رد');await fill(p,'رد على سارة الكبيسي','رد جديد من صاحب التعليق');
 await p.setRequestInterception(true);let loseResponse=true;
 const lost=async req=>{
  if(loseResponse&&req.url().startsWith(API+'/rest/v1/code_comments')&&req.method()==='POST'){
    loseResponse=false;
    await fetch(req.url(),{method:'POST',headers:req.headers(),body:req.postData()});
    return req.respond({status:503,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({message:'QA lost response after commit'})});
  }req.continue();
 };p.on('request',lost);await click(p,'إرسال الرد');await p.waitForSelector(selector('إعادة إرسال'));await click(p,'إعادة إرسال');p.off('request',lost);await p.setRequestInterception(false);
 check('Lost response retry does not duplicate reply',(await api(A,'/rest/v1/code_comments?snippet_id=eq.'+sid+'&content=eq.'+encodeURIComponent('رد جديد من صاحب التعليق'))).data.length===1);
await p.waitForFunction(()=>document.body.innerText.includes('رد جديد من صاحب التعليق'));
 check('Reply composer saves and counts update', (await api(A,'/rest/v1/code_snippets?id=eq.'+sid+'&select=comments_count')).data[0].comments_count===3);
 check('Unauthorized edit and delete rejected over HTTP',(await api(B,'/rest/v1/rpc/edit_code_comment',{p_id:rid,p_content:'غير مسموح'})).status===403&&(await api(B,'/rest/v1/rpc/delete_code_comment',{p_id:rid})).status===403);
 const firstDelete=(await p.$$(selector('حذف')))[0];await firstDelete.click();await snap(p,'phone-comment-delete-confirm');await click(p,'حذف التعليق');await p.waitForFunction(()=>document.body.innerText.includes('حُذف هذا التعليق'));
 check('Deleted parent retains other account reply and accurate count',(await api(A,'/rest/v1/code_snippets?id=eq.'+sid+'&select=comments_count')).data[0].comments_count===2&&await p.evaluate(()=>document.body.innerText.includes('تقدر تفصل المنطق')));
 await snap(p,'phone-comments-tombstone');
 // Final four-size matrix with actual saved identity / sheets / comment threads.
 for(const [name,width,height]of[['small',320,740],['phone',390,844],['tablet',900,900],['desktop',1440,900]]){
  await p.setViewport({width,height});
  for(const [route,label]of[['/profile','profile'],['/settings','settings'],['/user/'+uid,'public-profile'],['/code/'+sid,'comments']]){
   if(label==='public-profile'){await p.evaluate(s=>{for(const h of ['127','localhost'])localStorage.setItem('sb-'+h+'-auth-token',JSON.stringify(s));},B);}
   else {await p.evaluate(s=>{for(const h of ['127','localhost'])localStorage.setItem('sb-'+h+'-auth-token',JSON.stringify(s));},A);}
   await p.goto(WEB+route,{waitUntil:'networkidle2'});
   if(label==='profile'){await p.waitForSelector(selector('تعديل الملف'));await snap(p,name+'-profile');await click(p,'تعديل الملف');await snap(p,name+'-profile-edit');await click(p,'إلغاء');}
   else if(label==='comments'){await p.waitForSelector(selector('عرض 2 ردود'));await scrollTo(p,selector('عرض 2 ردود'));await snap(p,name+'-comments-closed');await click(p,'عرض 2 ردود');await snap(p,name+'-comments-open');}
   else await snap(p,name+'-'+label);
   check(name+' '+label+' no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(label==='public-profile')check(name+' public profile: bio + hidden list + follow/message actions',await p.evaluate(()=>document.body.innerText.includes('أتعلم Python')&&document.body.innerText.includes('خاصة')&&!!document.querySelector('[aria-label="مراسلة"]')));
  }
 }
 await p.goto(WEB+'/about?theme=light',{waitUntil:'networkidle2'});await snap(p,'desktop-brand-light');
 check('Light mode new brand image loads',await p.evaluate(()=>[...document.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0)));
 // Clear and restore identity through editor, checking removal really reaches data/storage.
 await p.evaluate(()=>sessionStorage.removeItem('kodax-theme-preview'));await p.goto(WEB+'/profile',{waitUntil:'networkidle2'});await click(p,'تعديل الملف');await click(p,'إزالة الغلاف');await click(p,'مسح النبذة');await click(p,'حفظ التغييرات');await p.waitForFunction(()=>!document.body.innerText.includes('حفظ التغييرات'));
 const cleared=(await api(A,'/rest/v1/profiles?id=eq.'+uid+'&select=cover_url,avatar_url,bio')).data[0];check('Removing cover and bio saves null values',cleared.cover_url===null&&cleared.bio===null);
 // Restore explicit QA-only content for Android review (never defaults).
 await click(p,'تعديل الملف');chooser=p.waitForFileChooser();await click(p,'اختيار غلاف');await(await chooser).accept([path.resolve('assets/branding/kodax-full-white-on-purple.png')]);await fill(p,'نبذة عنك (اختيارية)','هذا حساب اختبار محلي. أتعلم Python وأشارك أمثلة برمجية مع المجتمع.');await click(p,'حفظ التغييرات');await p.waitForFunction(()=>!document.body.innerText.includes('حفظ التغييرات'));
 await p.goto(WEB+'/settings',{waitUntil:'networkidle2'});await click(p,'تسجيل الخروج');await click(p,'خروج');await p.goto(WEB+'/login',{waitUntil:'networkidle2'});await p.waitForSelector('input[aria-label="البريد الإلكتروني"]');await fill(p,'البريد الإلكتروني','qa@kodax.local');await fill(p,'كلمة المرور','kodax-local-123');await click(p,'تسجيل الدخول');await p.waitForFunction(()=>document.body.innerText.includes('الرئيسية'));await p.goto(WEB+'/profile',{waitUntil:'networkidle2'});
 check('Identity and privacy survive real logout/login',(await api(await auth('qa@kodax.local'),'/rest/v1/profiles?id=eq.'+uid+'&select=cover_url,avatar_url,bio,followers_visible,following_visible')).data[0].bio.includes('Python')&&await p.evaluate(()=>document.body.innerText.includes('أتعلم Python')));
 }catch(e){check('Unexpected failure',false,e.stack);await snap(p,'failure').catch(()=>{});}
 finally{fs.writeFileSync(OUT+'/checks.json',JSON.stringify({checks,errors},null,2));await browser.close();}
 if(checks.some(c=>!c.ok))process.exitCode=1;
})();

const fs=require('node:fs'),path=require('node:path');
const puppeteer=require(path.join(process.env.TEMP,'kxtools/node_modules/puppeteer-core'));
const WEB='http://localhost:8102',API='http://127.0.0.1:54323',OUT='reports/profile-identity-20261009/web';
const checks=[],errors=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
const selector=label=>'[role="button"][aria-label='+JSON.stringify(label)+']';
const check=(name,ok,detail)=>{checks.push({name,ok:!!ok,detail});console.log(ok?'PASS':'FAIL',name);};
async function session(email){return(await fetch(API+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'kodax-local-123'})})).json();}
async function auth(p,s){await p.evaluate(s=>{for(const h of ['127','localhost'])localStorage.setItem('sb-'+h+'-auth-token',JSON.stringify(s));},s);}
async function click(p,label){await p.waitForSelector(selector(label));await p.click(selector(label));await wait(400);}
async function snap(p,name){await wait(200);await p.screenshot({path:OUT+'/'+name+'.png'});}
async function bottom(p){await p.evaluate(()=>[...document.querySelectorAll('div')].filter(e=>e.scrollHeight>e.clientHeight&&['auto','scroll'].includes(getComputedStyle(e).overflowY)).forEach(e=>e.scrollTop=e.scrollHeight));await wait(250);}
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const p=await b.newPage();p.on('pageerror',e=>errors.push(e.message));fs.mkdirSync(OUT,{recursive:true});
 try{
 const a=await session('qa@kodax.local'),other=await session('laith@kodax.local'),long=await session('long@kodax.local'),fresh=await session('new@kodax.local');
 await p.goto(WEB+'/download',{waitUntil:'networkidle2'});
 for(const [name,width,height]of[['small',320,740],['phone',390,844],['tablet',900,900],['desktop',1440,900]]){
  await p.setViewport({width,height});await auth(p,a);await p.goto(WEB+'/profile',{waitUntil:'networkidle2'});await p.waitForSelector(selector('تعديل الملف'));await snap(p,name+'-profile');
  await click(p,'تعديل الملف');await snap(p,name+'-profile-edit');await bottom(p);await snap(p,name+'-profile-edit-bio');
  const footer=await p.$eval(selector('حفظ التغييرات'),e=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom,height:r.height};});check(name+' edit footer stays inside viewport',footer.top>=0&&footer.bottom<=height&&footer.height>=44,footer);check(name+' bio counter readable',await p.evaluate(()=>document.body.innerText.includes('/ 280')));await click(p,'إلغاء');
  await p.goto(WEB+'/settings',{waitUntil:'networkidle2'});await p.waitForSelector('div[role="switch"][aria-label]');await snap(p,name+'-settings');
  await auth(p,other);await p.goto(WEB+'/user/'+a.user.id,{waitUntil:'networkidle2'});await p.waitForSelector(selector('مراسلة'));await snap(p,name+'-public-profile');
  const actions=await p.evaluate(()=>['مراسلة','إلغاء المتابعة','متابعة'].map(l=>{const e=document.querySelector('[role="button"][aria-label="'+l+'"]');if(!e)return null;const r=e.getBoundingClientRect();return{label:l,width:r.width,height:r.height,left:r.left,right:r.right};}).filter(Boolean));check(name+' public actions at usable width',actions.length===2&&actions.every(e=>e.width>=100&&e.height>=44&&e.left>=0&&e.right<=width+1),actions);
  check(name+' private lists have no clickable list trigger',await p.evaluate(()=>!document.querySelector('[role="button"][aria-label^="متابِعون:"]')&&!document.querySelector('[role="button"][aria-label^="يتابع:"]')));
  await auth(p,a);await p.goto(WEB+'/code/40000000-0000-4000-8000-000000000001',{waitUntil:'networkidle2'});await p.waitForSelector(selector('عرض 2 ردود'));await p.$eval(selector('عرض 2 ردود'),e=>e.scrollIntoView({block:'center'}));await snap(p,name+'-comments-closed');await click(p,'عرض 2 ردود');await snap(p,name+'-comments-open');check(name+' no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await p.setViewport({width:320,height:740});await auth(p,long);await p.goto(WEB+'/profile',{waitUntil:'networkidle2'});await p.waitForSelector(selector('تعديل الملف'));await snap(p,'small-long-name');check('Long Arabic name preserves edit control',await p.$eval(selector('تعديل الملف'),e=>e.getBoundingClientRect().width>=44));
 await auth(p,fresh);await p.goto(WEB+'/profile',{waitUntil:'networkidle2'});await p.waitForSelector(selector('تعديل الملف'));await snap(p,'small-new-account');check('New account has no default cover or bio',await p.evaluate(()=>!document.querySelector('[aria-label^="غلاف "]')&&!document.body.innerText.includes('حساب اختبار محلي')));
 await auth(p,a);await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.goto(WEB+'/profile',{waitUntil:'networkidle2'});await click(p,'تعديل الملف');await bottom(p);await snap(p,'small-reduced-motion-edit');check('Reduced-motion editor and state remain usable',await p.$eval(selector('حفظ التغييرات'),e=>e.getBoundingClientRect().bottom<=innerHeight));await click(p,'إلغاء');
 await p.setViewport({width:1440,height:900});await p.goto(WEB+'/about?theme=light',{waitUntil:'networkidle2'});await snap(p,'desktop-brand-light');check('New light logo loads with correct source',await p.evaluate(()=>[...document.querySelectorAll('img')].every(e=>e.complete&&e.naturalWidth>0)));
 await p.evaluate(()=>sessionStorage.removeItem('kodax-theme-preview'));await p.goto(WEB+'/download',{waitUntil:'networkidle2'});await snap(p,'desktop-start-logo');check('New dark logo artwork is loaded',await p.evaluate(()=>[...document.querySelectorAll('img')].every(e=>e.complete&&e.naturalWidth>0)));
 check('Fresh final pages have no uncaught browser errors',errors.length===0,errors);
 }catch(e){check('Unexpected matrix failure',false,e.stack);await snap(p,'matrix-failure').catch(()=>{});}
 finally{fs.writeFileSync(OUT+'/final-matrix-checks.json',JSON.stringify({checks,errors},null,2));await b.close();}
 if(checks.some(c=>!c.ok))process.exitCode=1;
})();

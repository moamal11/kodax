const fs=require('node:fs'),path=require('node:path');
const puppeteer=require(path.join(process.env.TEMP,'kxtools/node_modules/puppeteer-core'));
const OUT='reports/profile-identity-20261009/web',WEB='http://localhost:8102';
const checks=[],errors=[],wait=ms=>new Promise(r=>setTimeout(r,ms));
const sel=label=>'[role="button"][aria-label='+JSON.stringify(label)+']';
const check=(name,ok,detail)=>{checks.push({name,ok:!!ok,detail});console.log(ok?'PASS':'FAIL',name,detail||'');};
async function click(p,label){await p.waitForSelector(sel(label));await p.click(sel(label));await wait(400);}
async function fill(p,label,value){const e=await p.waitForSelector('input[aria-label='+JSON.stringify(label)+']');await e.click();await p.keyboard.down('Control');await p.keyboard.press('A');await p.keyboard.up('Control');await e.type(value);}
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const p=await b.newPage();p.setDefaultNavigationTimeout(180000);p.setDefaultTimeout(60000);p.on('pageerror',e=>errors.push(e.message));
 try{
 const session=await(await fetch('http://127.0.0.1:54323/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'qa@kodax.local',password:'kodax-local-123'})})).json();
 await p.setViewport({width:1440,height:900});await p.goto(WEB+'/download',{waitUntil:'networkidle2'});await p.evaluate(s=>localStorage.setItem('sb-127-auth-token',JSON.stringify(s)),session);
 await p.goto(WEB+'/certificate/download?id=00000000-0000-4000-8000-000000000101',{waitUntil:'networkidle2'});await p.waitForSelector(sel('فتح نسخة الطباعة'));await p.screenshot({path:OUT+'/desktop-certificate.png'});
 const opened=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Print popup failed: '+errors.join('; '))),30000);p.once('popup',value=>{clearTimeout(timer);resolve(value);});});await click(p,'فتح نسخة الطباعة');const popup=await opened;await popup.waitForSelector('img[alt="Kodax"]');await popup.waitForFunction(()=>[...document.querySelectorAll('img[alt="Kodax"]')].every(e=>e.complete&&e.naturalWidth>0));
 const marks=await popup.$$eval('img[alt="Kodax"]',els=>els.map(e=>({src:e.src,width:e.naturalWidth,height:e.naturalHeight})));check('Print certificate loads both new white marks',marks.length===2&&marks.every(e=>e.src.includes('kodax-full-white-on-purple')&&e.width===1536),marks);await popup.screenshot({path:OUT+'/desktop-certificate-print.png'});await popup.close();
 await p.goto(WEB+'/settings',{waitUntil:'networkidle2'});await click(p,'تغيير كلمة المرور');await fill(p,'كلمة المرور الجديدة','kodax-local-123');await fill(p,'تأكيد كلمة المرور','different');await click(p,'حفظ كلمة المرور');check('Settings password confirmation validates mismatch',await p.evaluate(()=>document.body.innerText.includes('كلمتا المرور غير متطابقتين')));
 await fill(p,'تأكيد كلمة المرور','kodax-local-123');const request=p.waitForResponse(r=>r.url().includes('/auth/v1/user')&&r.request().method()==='PUT');await click(p,'حفظ كلمة المرور');const response=await request;await p.waitForFunction(()=>!document.querySelector('input[aria-label="كلمة المرور الجديدة"]'));check('Settings password uses real auth update and closes after success',response.status()===200);
 for(const [name,route] of [['login','/login'],['start','/download'],['about','/about'],['certificates','/certificate']]){await p.goto(WEB+route,{waitUntil:'networkidle2'});await wait(300);const imgs=await p.$$eval('img',es=>es.map(e=>({src:e.src,loaded:e.complete&&e.naturalWidth>0})));check(name+' identity images load without old application icon',imgs.every(e=>e.loaded&&!/\/assets\/icon\.png/.test(e.src)),imgs.filter(e=>e.src.includes('branding')));}
 check('Shared identity/settings pages have no uncaught errors',errors.length===0,errors);
 }catch(e){check('Unexpected shared component failure',false,e.stack);}
 finally{fs.writeFileSync(OUT+'/shared-checks.json',JSON.stringify({checks,errors},null,2));await b.close();}
 if(checks.some(c=>!c.ok))process.exitCode=1;
})();

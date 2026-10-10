/* Test the current development source, not an old static export. Local accounts only. */
const fs = require('node:fs'), path = require('node:path');
const puppeteer = require(path.join(process.env.TEMP, 'kxtools/node_modules/puppeteer-core'));
const OUT = 'reports/android-tablet-fixes-20261009/web';
const checks = [], errors = [];
const check = (name, ok, detail) => { checks.push({name,ok:!!ok,detail}); console.log(ok?'PASS':'FAIL',name); };
const wait = ms => new Promise(r=>setTimeout(r,ms));
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page = await browser.newPage();
 page.on('pageerror',e=>errors.push({message:e.message,stack:e.stack}));
 try {
 const session=await(await fetch('http://localhost:54321/auth/v1/token?grant_type=password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'qa@kodax.local',password:'kodax-local-123'})})).json();
 await page.goto('http://localhost:8102/download',{waitUntil:'networkidle2',timeout:180000});
 await page.evaluate(s=>{for(const host of ['localhost','127'])localStorage.setItem('sb-'+host+'-auth-token',JSON.stringify(s));},session);
 const profiles=await(await fetch('http://localhost:54321/rest/v1/profiles?username=eq.laith_dev&select=id',{headers:{Authorization:'Bearer '+session.access_token}})).json();
 const id=profiles[0].id;
 for(const [name,width,height] of [['tablet-900',900,900],['tablet-960',960,1440],['desktop-1280',1280,900],['phone-390',390,844],['phone-320',320,740]]){
   await page.setViewport({width,height});
   await page.goto('http://localhost:8102/',{waitUntil:'networkidle2'});
   await page.waitForFunction(()=>document.body.innerText.includes('آخر 7 أيام'));
   const cells=await page.evaluate(()=>[...document.querySelectorAll('[aria-label]')].filter(e=>/^(اليوم، )?.+: (تعلمت|مجمّد|بلا نشاط)$/.test(e.getAttribute('aria-label'))).map(e=>{const b=e.firstElementChild.getBoundingClientRect();return {label:e.getAttribute('aria-label'),width:b.width,height:b.height};}));
   check(name+' seven compact square day tiles',cells.length===7&&cells.every(c=>Math.abs(c.width-c.height)<1&&c.width<=40&&c.width>=20),cells);
   await page.screenshot({path:OUT+'/'+name+'-home.png',fullPage:false});
   await page.goto('http://localhost:8102/user/'+id,{waitUntil:'networkidle2'});
   await page.waitForFunction(()=>document.body.innerText.includes('أكواده المنشورة'));
   const buttons=await page.evaluate(()=>['متابعة','مراسلة'].map(label=>{const e=document.querySelector('[role="button"][aria-label="'+label+'"]')||(label==='متابعة'?document.querySelector('[role="button"][aria-label="إلغاء المتابعة"]'):null);if(!e)return{label,missing:true}; const r=e.getBoundingClientRect();return{label,width:r.width,height:r.height,right:r.right,left:r.left,text:e.textContent};}));
   check(name+' profile actions show text at usable width',buttons.every(b=>!b.missing&&b.width>=100&&b.height>=44&&b.left>=0&&b.right<=width&&(b.text.includes(b.label)||b.text.includes('تتابعه'))),buttons);
   check(name+' no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:OUT+'/'+name+'-profile.png'});
 }
 check('No browser runtime errors',errors.length===0,errors);
 }catch(e){check('Unexpected failure',false,e.stack);await page.screenshot({path:OUT+'/failure.png'}).catch(()=>{});}
 finally{fs.writeFileSync(OUT+'/checks.json',JSON.stringify(checks,null,2));await browser.close();}
 if(checks.some(c=>!c.ok)) process.exitCode=1;
})();

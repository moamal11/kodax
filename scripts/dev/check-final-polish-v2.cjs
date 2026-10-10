const fs=require('node:fs'),path=require('node:path');
const puppeteer=require(path.join(process.env.TEMP,'kxtools/node_modules/puppeteer-core'));
const WEB='http://localhost:8109',OUT='reports/visual-polish-v2-final/details',API='http://localhost:54321';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const checks=[];const check=(name,ok,detail)=>{checks.push({name,ok:!!ok,detail});console.log(ok?'PASS':'FAIL',name);};
async function rpc(s,fn){return(await fetch(API+'/rest/v1/rpc/'+fn,{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer '+s.access_token},body:'{}'})).json();}
async function profile(s){return(await fetch(API+'/rest/v1/profiles?select=xp&id=eq.'+s.user.id,{headers:{Authorization:'Bearer '+s.access_token}})).json();}
async function authenticate(page,url,email){const s=await(await fetch(API+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password:'kodax-local-123'})})).json();await page.goto(url+'/download',{waitUntil:'networkidle2'});await page.evaluate(s=>localStorage.setItem('sb-localhost-auth-token',JSON.stringify(s)),s);return s;}
async function visit(page,route){await page.goto(WEB+route,{waitUntil:'networkidle2'});await wait(1000);}
async function measured(page){return page.evaluate(()=>{
 const text=s=>[...document.querySelectorAll('div,span,h1,h2,h3,h4')].filter(e=>e.textContent.trim()===s).at(-1);
 const card=s=>{let e=text(s);while(e){const c=getComputedStyle(e);if(parseFloat(c.borderTopWidth)>=1&&parseFloat(c.paddingTop)>=14)return e;e=e.parentElement;}return null;};
 const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
 const goal=card('إنجازك القادم');
 const courseRow=s=>{let e=text(s);while(e){const c=getComputedStyle(e);if(c.flexDirection==='row-reverse'&&c.alignItems==='stretch')return e;e=e.parentElement;}return null;};
 const rows=['أساسيات Python','هياكل البيانات','البرمجة الكائنية','بايثون متقدم'].map(courseRow).filter(Boolean);
 const dayCells=[...document.querySelectorAll('[aria-label]')].filter(e=>/^اليوم \d+: \d+ كوين/.test(e.getAttribute('aria-label')));
 return {goal:goal?rect(goal):null,rows:rows.map(rect),days:dayCells.map(e=>({label:e.getAttribute('aria-label'),text:e.textContent,rect:rect(e)})),gallery:text('معرض الشارات')?rect(text('معرض الشارات')):null,daily:text('استلمت مكافأة اليوم')?rect(text('استلمت مكافأة اليوم')):null,overflow:document.documentElement.scrollWidth>innerWidth+1};
 });}
async function scrollDaily(page){await page.evaluate(()=>{const cell=[...document.querySelectorAll('[aria-label]')].find(e=>/^اليوم 1: \d+ كوين/.test(e.getAttribute('aria-label')));if(!cell)throw Error('Missing real daily cells');const daily=cell.parentElement.parentElement;daily.scrollIntoView({block:'center'});});await wait(300);}
async function click(page,label){await page.evaluate(label=>{const e=[...document.querySelectorAll('[role=button],[role=tab],[role=link]')].filter(e=>(e.getAttribute('aria-label')||e.textContent).trim()===label).at(-1);if(!e)throw Error('Missing '+label);e.scrollIntoView({block:'center'});e.click();},label);await wait(400);}
(async()=>{fs.mkdirSync(OUT,{recursive:true});const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push({url:page.url(),message:e.message}));
try{
 await page.setViewport({width:1440,height:900});await authenticate(page,'http://localhost:8108','qa@kodax.local');await page.goto('http://localhost:8108/rewards',{waitUntil:'networkidle2'});await page.waitForFunction(()=>document.body.innerText.includes('إنجازك القادم'));const beforeGoal=(await measured(page)).goal;
 await page.goto('http://localhost:8108/learn',{waitUntil:'networkidle2'});await wait(1200);const beforeRows=(await measured(page)).rows;
 const s=await authenticate(page,WEB,'qa@kodax.local'),beforeCoins=await rpc(s,'coins_get_state'),beforeXp=await profile(s);
 for(const [name,width,height] of [['small',320,740],['phone',390,844],['tablet',900,900],['desktop',1440,900]]){
  await page.setViewport({width,height});await visit(page,'/rewards');await page.waitForFunction(()=>document.body.innerText.includes('إنجازك القادم')&&document.body.innerText.includes('هدف الأسبوع'));
  const m=await measured(page);check(name+' badge exhibition precedes goal and daily rewards',m.gallery&&m.goal&&m.daily&&m.gallery.y<m.goal.y&&m.goal.y<m.daily.y,m);
  check(name+' seven daily cells expose actual days and amounts',m.days.length===7&&m.days.every((d,i)=>d.text.includes('اليوم '+(i+1))&&d.text.includes(beforeCoins.daily.rewards[i]+' كوين')&&d.label.includes(beforeCoins.daily.rewards[i]+' كوين')));
  check(name+' daily cells stay inside viewport',m.days.every(d=>d.rect.x>=0&&d.rect.x+d.rect.width<=width+1)&&!m.overflow);
  if(name==='desktop')check('Desktop achievement card is shorter than before',m.goal.height<beforeGoal.height,{before:beforeGoal,after:m.goal});
  await scrollDaily(page);await page.screenshot({path:OUT+'/'+name+'-daily-rewards.png'});
  await page.evaluate(()=>{const e=[...document.querySelectorAll('[role=button]')].find(e=>e.getAttribute('aria-label')?.startsWith('الشارات:'));e.scrollIntoView({block:'start'});});await click(page,'كل الشارات');
  check(name+' exhibition opens real badge conditions',await page.evaluate(()=>document.body.innerText.includes('أكمل أول تحدي')));await page.screenshot({path:OUT+'/'+name+'-badges-sheet.png'});await click(page,'إغلاق');
  await visit(page,'/learn');await page.waitForFunction(()=>document.body.innerText.includes('خطوتك التالية'));const l=await measured(page);
  if(name==='desktop')check('Course stages occupy less vertical space',l.rows.length===beforeRows.length&&l.rows.slice(0,-1).every((r,i)=>r.height<beforeRows[i].height),{before:beforeRows,after:l.rows});
  await click(page,'كمّل الدرس');check(name+' lesson action keeps actual next route',page.url().includes('/lesson/py-5'));
 }
 const afterCoins=await rpc(s,'coins_get_state'),afterXp=await profile(s);check('Polish interactions do not award coins or XP',beforeCoins.balance===afterCoins.balance&&beforeXp[0].xp===afterXp[0].xp);
 await authenticate(page,WEB,'new@kodax.local');await page.setViewport({width:320,height:740});await visit(page,'/rewards');await page.waitForFunction(()=>document.body.innerText.includes('تعلّم أولاً'));
 check('Activity-gated daily reward retains its real condition',await page.evaluate(()=>document.body.innerText.includes('أكمل درساً أو تحدياً أولاً')));await scrollDaily(page);await page.screenshot({path:OUT+'/small-daily-activity-required.png'});await click(page,'تعلّم أولاً');check('Daily activity action opens learning',page.url().includes('/learn'));
 await page.evaluate(()=>localStorage.clear());await visit(page,'/download');
 const actions=await page.evaluate(()=>{const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};};return ['إنشاء حساب مجاني','تنزيل التطبيق'].map(label=>{const e=document.querySelector('[aria-label="'+label+'"]');return {...rect(e),container:rect(e.parentElement)};});});
 check('320 start actions are stacked at full container width',actions.every(r=>Math.abs(r.w-r.container.w)<1)&&actions[1].y>=actions[0].y+actions[0].h,actions);
 await click(page,'إنشاء حساب مجاني');check('320 signup action opens existing signup route',page.url().includes('/login')&&page.url().includes('mode=signup'));
 await page.setUserAgent('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36');await visit(page,'/download');await page.waitForFunction(()=>document.body.innerText.includes('إنشاء حساب من المتصفح'));await page.screenshot({path:OUT+'/small-android-browser-start.png'});
 check('Android-browser start retains explicit download and browser signup',await page.evaluate(()=>!!document.querySelector('[aria-label="تنزيل التطبيق"]')&&!!document.querySelector('[aria-label="إنشاء حساب من المتصفح"]')));
 check('No browser runtime errors',!errors.length,errors);
}catch(e){check('Unexpected check failure',false,e.stack);await page.screenshot({path:OUT+'/failure.png'});}finally{fs.writeFileSync(OUT+'/checks.json',JSON.stringify(checks,null,2));await browser.close();}if(checks.some(c=>!c.ok))process.exitCode=1;
})();

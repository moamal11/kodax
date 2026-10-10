const fs = require('node:fs'), path = require('node:path');
const p = require(path.join(process.env.PUPPETEER_DIR || process.env.TEMP + '/kxtools', 'node_modules/puppeteer-core'));
const WEB = process.env.WEB_URL || 'http://localhost:8103', API='http://localhost:54321';
const OUT=process.env.REVIEW_OUT || 'reports/visual-implementation-v2/interactions';
if (!/^http:\/\/localhost:\d+$/.test(WEB)) throw Error('Local only');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const checks=[]; let page;
function check(name,ok,detail) {checks.push({name,ok:!!ok,detail});console.log(ok?'PASS':'FAIL',name);}
const text=()=>page.evaluate(()=>document.body.innerText);
async function visit(route){await page.goto(WEB+route,{waitUntil:'networkidle2'});await wait(1000);}
async function click(label,partial=false){await page.evaluate((label,partial)=>{let e=[...document.querySelectorAll('[role=button],[role=tab],[role=link]')].filter(e=>partial?(e.getAttribute('aria-label')||e.textContent).includes(label):(e.getAttribute('aria-label')||e.textContent).trim()===label).at(-1);if(!e)throw Error('Missing '+label);e.scrollIntoView({block:'center'});e.click();},label,partial);await wait(600);}
async function auth(email){const s=await(await fetch(API+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password:'kodax-local-123'})})).json();await visit('/download');await page.evaluate(s=>{localStorage.clear();localStorage.setItem('sb-localhost-auth-token',JSON.stringify(s));},s);return s;}
async function rpc(s,name){return(await fetch(API+'/rest/v1/rpc/'+name,{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer '+s.access_token},body:'{}'})).json();}
async function profile(s){return(await fetch(API+'/rest/v1/profiles?select=xp&id=eq.'+s.user.id,{headers:{Authorization:'Bearer '+s.access_token}})).json();}
async function shot(name){await page.screenshot({path:OUT+'/'+name+'.png'});}
(async()=>{fs.mkdirSync(OUT,{recursive:true});const browser=await p.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:390,height:844});
await visit('/download');await click('شغّل المثال');check('Condition >= produces ناجح', (await text()).includes('الشرط صحيح'));await click('8 أصغر من 5');check('Changing condition clears previous result',!(await text()).includes('الشرط صحيح'));await click('شغّل المثال');check('Condition < executes else', (await text()).includes('الشرط غير صحيح'));check('Public demonstration announces no XP', (await text()).includes('بدون XP أو شارة للحساب'));
const s=await auth('qa@kodax.local');const before=await profile(s),coins=await rpc(s,'coins_get_state'),progress=await rpc(s,'progress_get_state');
await visit('/learn');check('Learn exposes inline actual next lesson', (await text()).includes('خطوتك التالية')&&(await text()).includes('الشروط if/else'));check('Locked course exposes server ratio', (await text()).includes(Math.round(progress.courses.find(c=>c.course_id==='py-data-structures').required_ratio*100)+'%'));await click('كمّل الدرس');check('Current lesson opens correct route', page.url().includes('/lesson/py-5'));
await visit('/learn?field=web-dev');check('Field filter updates journey',!(await text()).includes('خطوتك التالية\nالشروط if/else'));
await visit('/rewards');await page.waitForFunction(()=>document.body.innerText.includes('كل الشارات'));await click('كل الشارات');check('Badges show actual acquisition criteria', (await text()).includes('أكمل أول تحدي'));await shot('badge-collection');await click('إغلاق');
await visit('/code');await click('اكتب كوداً');check('Language picker has Python', (await text()).includes('Python'));await shot('languages');await click('Python');check('Language selection opens editor',page.url().includes('/code/add'));await visit('/profile');await click('تعديل الملف');await shot('profile-edit');await click('إلغاء');await visit('/');await click('الإشعارات',true);await shot('notifications');await click('إغلاق');
await visit('/ai');check('AI has one named lesson context', (await text()).includes('سياق الدرس'));await click('اشرح فكرة الدرس');check('Short suggestion keeps actual lesson in prompt',await page.$eval('[aria-label="رسالة للمساعد"]',e=>e.value.includes('الشروط if/else')));await shot('ai-context');
await visit('/learn');const after=await profile(s),coinsAfter=await rpc(s,'coins_get_state');check('Browsing UI does not award XP or coins',before[0].xp===after[0].xp&&coins.balance===coinsAfter.balance,{before:before[0].xp,after:after[0].xp,coinsBefore:coins.balance,coinsAfter:coinsAfter.balance});
await auth('new@kodax.local');await visit('/learn');check('New learner starts first lesson', (await text()).includes('ابدأ الدرس')&&!(await text()).includes('· مكتمل'));await shot('new-learner');await visit('/rewards');check('New rewards have zero actual XP', (await text()).includes('0 XP'));await shot('new-rewards');
await auth('long@kodax.local');await visit('/profile');check('Long user name remains visible', (await text()).includes('عبد الرحمن بن محمد'));await shot('long-name');
await auth('qa@kodax.local');await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await visit('/learn');check('Reduced motion keeps stage state visible', (await text()).includes('مرحلتك الحالية'));await shot('reduced-learn');
check('No browser runtime errors',!errors.length,errors);
}catch(e){check('Unexpected failure',false,e.stack);await shot('failure');}finally{fs.writeFileSync(OUT+'/results.json',JSON.stringify(checks,null,2));await browser.close();}if(checks.some(c=>!c.ok))process.exitCode=1;
})();

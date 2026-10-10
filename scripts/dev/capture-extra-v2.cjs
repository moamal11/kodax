const fs=require('node:fs'),path=require('node:path');
const p=require(path.join(process.env.TEMP,'kxtools/node_modules/puppeteer-core'));
const WEB=process.env.WEB_URL || 'http://localhost:8105',OUT='reports/visual-implementation-v2/details';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{fs.mkdirSync(OUT,{recursive:true});const browser=await p.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const page=await browser.newPage();const shot=async(name)=>page.screenshot({path:OUT+'/'+name+'.png'});
for(const [name,w,h] of [['phone',390,844],['small',320,740],['desktop',1440,900]]){await page.setViewport({width:w,height:h});for(const [route,label] of [['/login','login'],['/forgot-password','recovery']]){await page.goto(WEB+route,{waitUntil:'networkidle2'});await sleep(700);await shot(name+'-'+label);}}
const s=await(await fetch('http://localhost:54321/auth/v1/token?grant_type=password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'qa@kodax.local',password:'kodax-local-123'})})).json();
await page.goto(WEB+'/download');await page.evaluate(s=>localStorage.setItem('sb-localhost-auth-token',JSON.stringify(s)),s);
for(const [name,w,h] of [['phone',390,844],['small',320,740],['desktop',1440,900]]){await page.setViewport({width:w,height:h});
await page.goto(WEB+'/rewards',{waitUntil:'networkidle2'});await page.waitForFunction(()=>document.body.innerText.includes('هدف الأسبوع')&&document.body.innerText.includes('كل الشارات'));await page.evaluate(()=>{const e=[...document.querySelectorAll('[role=button],[role=link]')].find(e=>(e.getAttribute('aria-label')||e.textContent).includes('كل الشارات'));if(!e)throw Error('Missing collection control');e.scrollIntoView({block:'center'});});await sleep(250);await shot(name+'-collection');
await page.goto(WEB+'/course/py-data-structures',{waitUntil:'networkidle2'});await sleep(1200);await shot(name+'-locked-course');
}
await page.setViewport({width:390,height:844});await page.goto(WEB+'/ai',{waitUntil:'networkidle2'});await page.waitForFunction(()=>document.body.innerText.includes('سياق الدرس'));await page.screenshot({path:OUT+'/phone-ai-quiet.png'});
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

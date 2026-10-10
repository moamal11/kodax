const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),q=require('./live-profile-client.cjs'),pup=require(path.join(process.env.TEMP,'kxtools/node_modules/puppeteer-core'));
const OUT='reports/kodax-live-final-20261010/web',WEB='http://localhost:8142',checks=[];
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const state=JSON.parse(fs.readFileSync(q.PRIVATE)),a=q.clients().client(),session=await q.login(a,state.accounts[0]);const browser=await pup.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const p=await browser.newPage();p.setDefaultNavigationTimeout(120000);p.setDefaultTimeout(45000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
try{await p.goto(WEB+'/download',{waitUntil:'networkidle2'});await p.evaluate(s=>localStorage.setItem('sb-krtulodnhmfuoxjqajwl-auth-token',JSON.stringify(s)),session);
for(const [name,width,height] of [['small',320,740],['phone',390,844],['tablet',900,900],['desktop',1440,900]]){
 await p.setViewport({width,height});
 for(const [route,target] of [['profile','[aria-label="تعديل الملف"]'],['user/'+state.accounts[1].id,'[aria-label="مراسلة"]'],['code','[data-testid^="community-feed-item-"]']]){
  await p.goto(WEB+'/'+route,{waitUntil:'networkidle2'});await p.waitForSelector(target);await new Promise(r=>setTimeout(r,500));const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);checks.push({name:name+' '+route+' final bundle reachable without horizontal overflow',ok:!overflow});
  await p.screenshot({path:OUT+'/'+name+'-'+(route.startsWith('user/')?'public':route)+'.png'});
 }
 checks.push({name:name+' AI chip action remains accessible',ok:!!await p.$('[aria-label="المساعد"]')&&!!await p.$('[data-testid="assistant-ai-chip-icon"]')});
}
checks.push({name:'No uncaught browser exceptions',ok:errors.length===0,errors});
}catch(e){checks.push({name:'Final artifact matrix',ok:false,error:e.stack});}finally{const dir='output/community-profile-web-20261010/_expo/static/js/web';fs.writeFileSync(OUT+'/checks.json',JSON.stringify({web:WEB,bundles:Object.fromEntries(fs.readdirSync(dir).filter(n=>n.endsWith('.js')).map(n=>[n,crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,n))).digest('hex')])),checks},null,2));await browser.close();}for(const c of checks)console.log((c.ok?'PASS ':'FAIL ')+c.name);if(checks.some(c=>!c.ok))process.exitCode=1;})();

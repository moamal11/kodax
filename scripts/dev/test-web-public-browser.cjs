const fs=require('node:fs'),path=require('node:path');
const puppeteer=require(path.join(process.env.TEMP,'kxtools/node_modules/puppeteer-core'));
const {createClient}=require('@supabase/supabase-js');
const config=require('../../web-server/public-config.cjs');
const docs=require('../../web-server/generated/catalog.json');
const OUT='reports/web-public-20261010',WEB='http://localhost:8143';
const wait=ms=>new Promise(r=>setTimeout(r,ms)),checks=[],errors=[];
function check(name,ok,details){checks.push({name,ok:!!ok,...(details?{details}:{})});console.log((ok?'PASS ':'FAIL ')+name);}
async function clickText(page,text){const handle=await page.evaluateHandle(text=>[...document.querySelectorAll('[role="button"],button,a')].find(n=>n.getAttribute('aria-label')===text||n.textContent.trim()===text||n.textContent.includes(text)),text);const element=handle.asElement();if(!element)throw Error('Button unavailable: '+text);await element.click();await handle.dispose();}
async function settle(page){await page.waitForFunction(()=>!document.getElementById('kx-public-content'),{timeout:45000});await wait(1200);}
(async()=>{
 fs.mkdirSync(OUT+'/shots',{recursive:true});
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--lang=ar']});
 const sessionClient=createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
  const htmlChecks=[];for(let i=0;i<docs.length;i+=12)htmlChecks.push(...await Promise.all(docs.slice(i,i+12).map(async d=>{const r=await fetch(WEB+d.path),html=await r.text();return {path:d.path,ok:r.status===200&&html.includes('rel="canonical"')&&html.includes('name="description"')&&html.includes('index,follow'),content:!['course','lesson','challenge'].includes(d.type)||html.includes('kx-public-content')&&html.includes('<h1>')};})));
  check(`All ${docs.length} public static URLs return HTML, metadata and canonical`,htmlChecks.every(x=>x.ok&&x.content),{count:htmlChecks.length,failed:htmlChecks.filter(x=>!x.ok||!x.content)});
  const sitemap=await (await fetch(WEB+'/sitemap.xml')).text();check('Dynamic sitemap index lists real profile/code/post sitemaps',sitemap.includes('sitemap-static.xml')&&sitemap.includes('sitemap-user-0.xml')&&sitemap.includes('sitemap-code-0.xml'));
  const usermap=await(await fetch(WEB+'/sitemap-user-0.xml')).text();check('Profile sitemap uses usernames, not UUID paths',usermap.includes('/user/social_qa_')&&!usermap.includes('/user/acf8ade4-'));
  const missing=await fetch(WEB+'/lesson/not-a-lesson');check('Unknown public URL returns 404/noindex',missing.status===404&&missing.headers.get('x-robots-tag')==='noindex');
  const loginhtml=await(await fetch(WEB+'/login')).text();check('Private/auth HTML is noindex',loginhtml.includes('content="noindex,follow"'));
  const alias=await fetch(WEB+'/user/acf8ade4-103c-41f7-9b0f-e40fc6355fd9',{redirect:'manual'});check('Legacy profile UUID redirects to username',alias.status===301&&alias.headers.get('location')==='/user/social_qa_3363cce1_0');
  const disabled=await browser.newPage();await disabled.setJavaScriptEnabled(false);await disabled.goto(WEB+'/lesson/py-2');check('Lesson explanation visible with JavaScript disabled',(await disabled.$eval('#kx-public-content',n=>n.innerText)).length>250);await disabled.close();
  const page=await browser.newPage();page.on('pageerror',e=>errors.push({message:e.message,stack:e.stack,url:page.url()}));
  const routes=[['home','/'],['course','/course/py-basics'],['lesson','/lesson/py-2'],['challenge','/challenge/ch-1'],['community','/code'],['profile','/user/social_qa_3363cce1_0']];
  for(const [width,height]of [[320,740],[390,844],[900,900],[1440,900]]){
   await page.setViewport({width,height,deviceScaleFactor:1});
   for(const [name,route]of routes){await page.goto(WEB+route,{waitUntil:'networkidle2',timeout:60000});await settle(page);const data=await page.evaluate(()=>({path:location.pathname,text:document.body.innerText,overflow:document.documentElement.scrollWidth>innerWidth+2}));check(`Guest ${name} ${width}×${height} stays readable without redirect`,data.path===route&&!data.overflow&&data.text.length>80,{path:data.path,overflow:data.overflow});if(['lesson','community'].includes(name)||width===390&&name==='profile')await page.screenshot({path:`${OUT}/shots/guest-${name}-${width}.png`});}
  }
  await page.setViewport({width:390,height:844,deviceScaleFactor:1});await page.goto(WEB+'/challenge/ch-1',{waitUntil:'networkidle2'});await settle(page);await clickText(page,'شغّل وتحقق');await page.waitForFunction(()=>location.pathname==='/login');check('Guest evaluation requests login and remembers challenge',await page.evaluate(()=>sessionStorage.getItem('kodax-web-return')==='/challenge/ch-1'));
  const qa=JSON.parse(fs.readFileSync('.env.community-social-qa.local','utf8')).accounts[0];
  await page.type('input[placeholder="name@example.com"]',qa.email);await page.type('input[type="password"]',qa.password);await clickText(page,'تسجيل الدخول');await page.waitForFunction(()=>location.pathname==='/challenge/ch-1',{timeout:60000});await wait(4000);check('Real QA login returns to original challenge',new URL(page.url()).pathname==='/challenge/ch-1');
  const prompt=await page.evaluate(()=>document.body.innerText.includes('تفعيل إشعارات المتصفح؟'));check('Web login shows notification invitation',prompt);check('Browser permission is untouched before enable',await page.evaluate(()=>Notification.permission==='default'));if(prompt){await page.screenshot({path:OUT+'/shots/push-invitation-390.png'});await clickText(page,'لاحقًا');}
  await page.reload({waitUntil:'networkidle2'});await wait(3500);check('Later choice suppresses repeated invitation',!await page.evaluate(()=>document.body.innerText.includes('تفعيل إشعارات المتصفح؟')));
  await page.goto(WEB+'/notification-settings',{waitUntil:'networkidle2'});await wait(2000);check('Browser notification settings display functional switch',(await page.evaluate(()=>document.body.innerText)).includes('إشعارات هذا المتصفح'));await page.screenshot({path:OUT+'/shots/web-notification-settings-390.png'});
  const sw=await page.evaluate(async()=>{const r=await navigator.serviceWorker.register('/kodax-push-sw.js',{scope:'/'});await navigator.serviceWorker.ready;return !!r.active;});check('Dedicated push worker registers on localhost',sw);
  const sr=await sessionClient.auth.signInWithPassword({email:qa.email,password:qa.password});if(sr.error)throw sr.error;await sessionClient.auth.signOut();
  check('No application runtime exceptions on tested public/login routes',errors.length===0,errors);
 }finally{await browser.close();fs.writeFileSync(OUT+'/browser.json',JSON.stringify({artifact:'output/web-public-final-20261010',source:WEB,checks,errors},null,2));}
 if(checks.some(c=>!c.ok))process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1;});

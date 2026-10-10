const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const puppeteer=require(path.join(process.env.TEMP,'kxtools/node_modules/puppeteer-core'));
const q=require('./live-profile-client.cjs');
const WEB='http://localhost:8143',OUT='reports/web-public-20261010',wait=ms=>new Promise(r=>setTimeout(r,ms)),checks=[];
function check(name,ok){checks.push({name,ok:!!ok});console.log((ok?'PASS ':'FAIL ')+name);}
function must(r){if(r.error)throw Error(r.error.message);return r.data;}
(async()=>{const {client,admin}=q.clients(),anon=client(),a=client(),b=client(),accounts=JSON.parse(fs.readFileSync('.env.community-social-qa.local')).accounts;
 const session=await q.login(a,accounts[0]);await q.login(b,accounts[1]);let browser,block=false;const ids=[];
 try{
  const found=must(await anon.rpc('people_search',{p_query:accounts[1].username}));check('Anonymous exact username finds public identity',found.items.some(p=>p.id===accounts[1].id));check('People projection excludes private attributes',found.items.every(p=>!['email','province','gender','followers','following'].some(k=>k in p)));
  check('Wildcard search is treated literally',must(await anon.rpc('people_search',{p_query:'%___%'})).items.length===0);
  check('Own account excluded from signed-in directory',!must(await a.rpc('people_search',{p_query:accounts[0].username})).items.some(p=>p.id===accounts[0].id));
  const original=must(await admin.from('user_blocks').select('blocker_id').eq('blocker_id',accounts[0].id).eq('blocked_id',accounts[2].id));if(!original.length){must(await a.from('user_blocks').insert({blocker_id:accounts[0].id,blocked_id:accounts[2].id}));block=true;}
  check('Blocked account excluded from search',must(await a.rpc('people_search',{p_query:accounts[2].username})).items.length===0);
  const n1=crypto.randomUUID(),n2=crypto.randomUUID(),n3=crypto.randomUUID();ids.push(n1,n2,n3);
  must(await admin.from('app_notifications').insert([{id:n1,user_id:accounts[0].id,type:'system',title:'QA قراءة تلقائية',message:'اختبار مخصص',read:false},{id:n2,user_id:accounts[0].id,type:'badge',title:'QA إنجاز محفوظ',message:'اختبار مخصص',read:false},{id:n3,user_id:accounts[1].id,type:'system',title:'QA ملكية',message:'اختبار مخصص',read:false}]));
  const attack=await a.from('app_notifications').update({read:true}).eq('id',n3).select('id');check('Account cannot mark another account notifications read',!!attack.error||attack.data.length===0);check('Other account unread state remains intact',!must(await b.from('app_notifications').select('read').eq('id',n3).single()).read);
  browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const [w,h]of [[320,740],[390,844],[900,900],[1440,900]]){
   await page.setViewport({width:w,height:h,deviceScaleFactor:1});await page.goto(WEB+'/people',{waitUntil:'networkidle2'});await page.waitForFunction(()=>!document.getElementById('kx-public-content'));await page.waitForSelector('[role="link"][aria-label^="ملف"]');
   check(`People suggestions render at ${w}×${h} without overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   check(`People cards have equal height at ${w}`,await page.evaluate(()=>{const heights=[...document.querySelectorAll('[role="link"][aria-label^="ملف"]')].map(el=>el.getBoundingClientRect().height);return heights.length>1&&Math.max(...heights)-Math.min(...heights)<2;}));
   check(`Verified account uses a serrated seal at ${w}`,await page.evaluate(()=>!!document.querySelector('[data-testid="verified-account-seal"] polygon')));
   await page.screenshot({path:`${OUT}/shots/people-${w}.png`});
   const input=await page.$('input[placeholder="اسم المستخدم أو الاسم…"]');await input.type(accounts[1].username);await page.waitForFunction(name=>document.body.innerText.includes('@'+name),{},accounts[1].username);await wait(500);check(`Username search shows intended account at ${w}`,await page.evaluate(name=>document.body.innerText.includes('@'+name),accounts[1].username));
   const link=await page.$('[role="link"][aria-label*="'+accounts[1].username+'"]');await link.click();await page.waitForFunction(name=>location.pathname==='/user/'+name,{},accounts[1].username);check(`Search result opens username URL at ${w}`,new URL(page.url()).pathname==='/user/'+accounts[1].username);
  }
  await page.goto(WEB+'/code',{waitUntil:'networkidle2'});await page.waitForSelector('[aria-label="بحث عن أشخاص"]');await page.click('[aria-label="بحث عن أشخاص"]');await page.waitForFunction(()=>location.pathname==='/people');check('Community button opens people page without a new navigation tab',true);
  await page.evaluate(session=>{localStorage.setItem('sb-krtulodnhmfuoxjqajwl-auth-token',JSON.stringify(session));localStorage.setItem('@kodax_web_push_prompt:'+session.user.id,'1');},session);
  await page.goto(WEB+'/',{waitUntil:'networkidle2'});await page.waitForSelector('[role="button"][aria-label^="الإشعارات"]',{timeout:45000});await wait(1500);await page.click('[role="button"][aria-label^="الإشعارات"]');
  let marked=false;for(let i=0;i<12;i++){await wait(500);const rows=must(await admin.from('app_notifications').select('id,read').in('id',[n1,n2]));if(rows.length===2&&rows.every(n=>n.read)){marked=true;break;}}
  check('Opening notifications marks server records read automatically',marked);check('Badge notification remains in history',must(await admin.from('app_notifications').select('id').eq('id',n2)).length===1);check('Manual mark-all button removed',!await page.evaluate(()=>document.body.innerText.includes('تعليم الكل كمقروء')));await page.screenshot({path:OUT+'/shots/notifications-auto-read-1440.png'});
  await page.reload({waitUntil:'networkidle2'});await wait(1500);check('Read state persists after reload',must(await a.from('app_notifications').select('read').in('id',[n1,n2])).every(n=>n.read));
  check('No runtime exceptions in people/notifications checks',errors.length===0);
 }finally{if(browser)await browser.close();if(block)must(await a.from('user_blocks').delete().eq('blocker_id',accounts[0].id).eq('blocked_id',accounts[2].id));if(ids.length)must(await admin.from('app_notifications').delete().in('id',ids));await a.auth.signOut({scope:'local'});await b.auth.signOut({scope:'local'});fs.writeFileSync(OUT+'/people-notifications.json',JSON.stringify({source:WEB,checks,scope:'Dedicated QA accounts only; temporary notifications and block removed.'},null,2));}
 if(checks.some(c=>!c.ok))process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1;});

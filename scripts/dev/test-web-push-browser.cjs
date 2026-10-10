// Real Chrome Push API attempt, isolated to a dedicated QA account and its endpoint.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const puppeteer=require(path.join(process.env.TEMP,'kxtools/node_modules/puppeteer-core'));
const q=require('./live-profile-client.cjs');
const WEB='http://localhost:8143',OUT='reports/web-public-20261010/push-browser.json',wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const {client,admin}=q.clients(),a=client(),qa=JSON.parse(fs.readFileSync('.env.community-social-qa.local','utf8')).accounts[1];const session=await q.login(a,qa),result={permission:'Chrome test permission granted through browser automation',subscription:false,delivery:false,worker:false,limitation:null};let endpoint,source,browser;
 try{
  browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const context=await browser.createBrowserContext();await context.overridePermissions(WEB,['notifications']);const page=await context.newPage();
  await page.evaluateOnNewDocument(session=>localStorage.setItem('sb-krtulodnhmfuoxjqajwl-auth-token',JSON.stringify(session)),session);
  await page.goto(WEB+'/notification-settings',{waitUntil:'networkidle2'});result.permission=await page.evaluate(()=>Notification.permission);await page.waitForSelector('[role="switch"]',{timeout:35000});
  await page.evaluate(async()=>{await navigator.serviceWorker.register('/kodax-push-sw.js',{scope:'/'});await navigator.serviceWorker.ready;});result.worker=true;
  const sw=await page.$('[role="switch"]');if(!sw)throw Error('Notification switch not found');await sw.click();
  try{await page.waitForFunction(()=>localStorage.getItem('@kodax_web_push_endpoint'),{timeout:25000});}catch{result.limitation='Real Chrome subscription did not complete within 25 seconds in this headless environment.';result.failureHandled=await page.evaluate(()=>!document.querySelector('[role="switch"][aria-disabled="true"]'));console.log(result.limitation);return;}
  endpoint=await page.evaluate(()=>localStorage.getItem('@kodax_web_push_endpoint'));
  const sub=await admin.from('web_push_subscriptions').select('id,user_id,enabled').eq('endpoint',endpoint).single();if(sub.error||sub.data?.user_id!==session.user.id||!sub.data.enabled)throw Error('Browser subscription not registered for QA identity');result.subscription=true;
  const tag='Kodax Web QA '+crypto.randomUUID();
  const inserted=await admin.from('notification_outbox').insert({user_id:session.user.id,kind:'system',title:tag,body:'Dedicated browser verification',dedup_key:'web-e2e:'+crypto.randomUUID(),scheduled_at:new Date().toISOString()}).select('id').single();if(inserted.error)throw Error(inserted.error.message);source=inserted.data.id;
  console.log('Real browser endpoint registered; waiting for the configured web cron.');
  for(let i=0;i<16;i++){await wait(5000);if(await page.evaluate(async title=>(await(await navigator.serviceWorker.getRegistration('/')).getNotifications()).some(n=>n.title===title),tag)){result.delivery=true;break;}}
  if(!result.delivery)result.limitation='No browser notification observed within 80 seconds; transport/cron needs verification on the deployed HTTPS domain.';
  console.log('Notification observed:',result.delivery);
  await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration('/');await(await r.pushManager.getSubscription())?.unsubscribe();for(const n of await r.getNotifications())n.close();});
 }catch(e){result.limitation=e.message;console.log('Browser push limitation:',e.message);}
 finally{if(source)await admin.from('notification_outbox').delete().eq('id',source);if(endpoint)await admin.from('web_push_subscriptions').delete().eq('endpoint',endpoint);if(browser)await browser.close();await a.auth.signOut({scope:'local'});fs.writeFileSync(OUT,JSON.stringify(result,null,2));}
})();

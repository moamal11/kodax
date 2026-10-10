/** Render and inspect isolated prototypes; no API or persistence calls. */
const fs = require('node:fs'), path = require('node:path');
const puppeteer = require(path.join(process.env.PUPPETEER_DIR, 'node_modules/puppeteer-core'));
const OUT = 'reports/visual-direction-v2';
const results=[],errors=[],requests=[];
function check(name, ok, detail=''){results.push({name,ok,detail});console.log(ok?'PASS':'FAIL',name,detail)}
(async()=>{
  const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page=await browser.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(!r.url().startsWith('http://localhost:8113/')&&!r.url().startsWith('data:')) requests.push(r.url())});
    for(const [size,width,height] of [['phone',390,844],['desktop',1440,900],['small',320,740],['tablet',900,900]]){
      await page.setViewport({width,height});
      for(const name of ['welcome','learn','rewards']){
        await page.goto(`http://localhost:8113/kodax-${name}-v2.html`,{waitUntil:'networkidle0'});
        await page.evaluate(()=>document.fonts.ready);
        const fits=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
        check(`${size} ${name} fits`,fits);
        if(!fits)console.log('Overflow elements',await page.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().left< -1||e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,60),left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).slice(-10)));
        check(`${size} ${name} embeds fonts and intact logo`,await page.evaluate(()=>document.fonts.check('15px Plex')&&[...document.images].every(i=>i.complete&&i.naturalWidth>0)));
        await page.screenshot({path:`${OUT}/${size}-${name}.png`});
        await page.screenshot({path:`${OUT}/${size}-${name}-full.png`,fullPage:true});
        if(name==='welcome'){
          await page.click('[data-op="<"]');await page.click('#run-demo');
          check(`${size} demo wrong comparison explains result`,await page.$eval('#demo-output',e=>e.textContent.includes('حاول مرة ثانية'))&&await page.$eval('#demo-earned',e=>!e.classList.contains('visible')));
          await page.click('[data-op=">="]');
          check(`${size} comparison change resets achievement`,await page.$eval('#demo-earned',e=>!e.classList.contains('visible')));
          await page.click('#run-demo');
          check(`${size} demo completes without XP claim`,await page.$eval('#demo-output',e=>e.textContent.includes('ناجح'))&&await page.$eval('#demo-earned',e=>e.classList.contains('visible')));
          await page.waitForFunction(()=>document.querySelector('#demo-earned').getBoundingClientRect().bottom<=innerHeight+1);
          await page.screenshot({path:`${OUT}/${size}-welcome-success.png`});
        }
        if(name==='learn'){
          check(`${size} course visible early`,await page.$eval('.chapter-header',e=>e.getBoundingClientRect().top<innerHeight*.5));
          check(`${size} lesson state beside its name`,await page.$eval('.lesson.done .lesson-line',e=>{const [a,b]=e.children;return Math.abs(a.getBoundingClientRect().left-b.getBoundingClientRect().right)<15}));
          await page.click('[data-lesson]');
          check(`${size} lesson modal fits`,await page.$eval('dialog',e=>{const r=e.getBoundingClientRect();return e.open&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}));
          await page.screenshot({path:`${OUT}/${size}-lesson-dialog.png`});
          await page.click('#close-dialog');
          await page.select('#learn-state','new');
          check(`${size} new account begins with no earned progress`,await page.$eval('.blank',e=>e.textContent.includes('0 من 17'))&&await page.$eval('.level-cut',e=>e.textContent==='1'));
          await page.screenshot({path:`${OUT}/${size}-learn-new.png`});
          await page.select('#learn-state','progress');
          await page.click('#challenges-tab');
          check(`${size} challenge states keep distinct shapes`,await page.evaluate(()=>document.querySelectorAll('.challenge-page .node.current,.challenge-page .node.done,.challenge-page .node.next').length>=3));
          await page.screenshot({path:`${OUT}/${size}-challenges.png`});
        }
        if(name==='rewards'){
          await page.click('[data-badge="البداية"]');
          check(`${size} pending badge keeps actual criterion`,await page.$eval('dialog',e=>e.textContent.includes('4 من 5 تحديات')&&e.textContent.includes('لم تُكتسب')));
          await page.screenshot({path:`${OUT}/${size}-badge-dialog.png`});
          await page.keyboard.press('Escape');
          await page.click('[data-badge="الخطوة الأولى"]');
          check(`${size} acquired badge visibly stamped`,await page.$eval('dialog .seal',e=>e.classList.contains('earned')));
          await page.keyboard.press('Escape');
        }
      }
    }
    await page.setViewport({width:390,height:844});
    await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
    await page.goto('http://localhost:8113/kodax-welcome-v2.html',{waitUntil:'networkidle0'});
    await page.click('#run-demo');
    check('Reduced motion keeps achievement without animation',await page.$eval('#demo-earned',e=>e.classList.contains('visible')&&getComputedStyle(e).animationName==='none'));
    await page.goto('http://localhost:8113/kodax-rewards-v2.html',{waitUntil:'networkidle0'});
    await page.evaluate(()=>{document.querySelectorAll('.identity').forEach(e=>e.textContent='عبد الرحمن بن محمد الحسيني البغدادي الكرخي')});
    check('Long Arabic identity fits',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:`OUT/long-identity.png`.replace('OUT',OUT)});
    check('No external service or XP calls',requests.length===0,requests);
    check('No browser exceptions',errors.length===0,errors);
  } finally {
    await browser.close();fs.writeFileSync(`${OUT}/prototype-checks.json`,JSON.stringify(results,null,2));
  }
  if(results.some(r=>!r.ok))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});

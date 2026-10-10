const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const p=require(path.join(process.env.TEMP,'kxtools/node_modules/puppeteer-core'));
(async()=>{const browser=await p.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const checks=[];const check=(name,ok)=>checks.push({name,ok});try{
 const page=await browser.newPage();await page.setViewport({width:320,height:740});await page.goto('http://localhost:8136',{waitUntil:'networkidle2'});
 check('Gallery fits 320',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 check('24 evidence images are embedded',await page.evaluate(()=>{const a=[...document.querySelectorAll('figure img')];return a.length===24&&a.every(e=>e.src.startsWith('data:image/png;base64,'));}));
 await page.evaluate(()=>filter('cases'));check('Both final account states are presented',await page.evaluate(()=>[...document.querySelectorAll('figure')].filter(e=>!e.hidden).length===2));
 await page.evaluate(()=>document.querySelector('figure img').click());check('Image opens in dialog',await page.evaluate(()=>document.querySelector('dialog').open));await page.keyboard.press('Escape');check('Escape closes image',await page.evaluate(()=>!document.querySelector('dialog').open));
 await page.evaluate(()=>filter('android'));check('Both native states at 100% and 160% have evidence',await page.evaluate(()=>[...document.querySelectorAll('figure')].filter(e=>!e.hidden).length===8));
 await page.goto(pathToFileURL(path.resolve('reports/visual-polish-v2-final/badge-validation/index.html')).href,{waitUntil:'load'});check('Standalone gallery opens offline',await page.evaluate(()=>document.querySelectorAll('figure img').length===24&&typeof filter==='function'));
 fs.writeFileSync('reports/visual-polish-v2-final/badge-validation/gallery-checks.json',JSON.stringify(checks,null,2));console.log(checks);if(checks.some(c=>!c.ok))process.exitCode=1;
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

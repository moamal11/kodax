import puppeteer from '../.npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--allow-file-access-from-files','--no-sandbox']});
const page=await browser.newPage();await page.setViewport({width:1920,height:1080,deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(pathToFileURL(resolve('index.html')).href,{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);
await mkdir('review-frames',{recursive:true});
const details=[];
for(const t of [.8,1.85,3.8,5.65,6.35,7.8,9.95,12.95]){
 await page.evaluate(t=>window.__timelines['kodax-mini'].seek(t,false),t);
 await page.screenshot({path:`review-frames/${String(t).replace('.','-')}.png`});
 details.push(await page.evaluate(t=>({time:t,rects:Object.fromEntries(['kodax-app','s1-cursor','publish-button','publish-cursor','editor-card','post','share-title'].map(id=>{const e=document.getElementById(id),r=e.getBoundingClientRect();return[id,{x:r.x,y:r.y,w:r.width,h:r.height,opacity:getComputedStyle(e).opacity}]}))}),t));
}
await writeFile('review-frames/geometry.json',JSON.stringify({errors,details},null,2));await browser.close();
console.log(JSON.stringify({errors,geometry:details.filter(x=>[1.85,6.35].includes(x.time))}));

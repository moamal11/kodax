import puppeteer from '../.npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-background-networking']});
try{
const p=await browser.newPage();await p.setViewport({width:1920,height:1080});
await p.goto(pathToFileURL(resolve('index.html')).href,{waitUntil:'load',timeout:30000});await p.evaluate(()=>document.fonts.ready);
for(const t of [1.5,5.52,9.4]){
const state=await p.evaluate(t=>{window.__timelines['kodax-mini'].seek(t);return ['#selected-app .app-icon','#cursor','#publish','#back-panel','#editor-card'].map(sel=>{const e=document.querySelector(sel);const r=e.getBoundingClientRect();return{sel,x:r.x,y:r.y,w:r.width,h:r.height,opacity:getComputedStyle(e).opacity,transform:getComputedStyle(e).transform};});},t);console.log(JSON.stringify({t,state}));
}
}finally{await browser.close();}

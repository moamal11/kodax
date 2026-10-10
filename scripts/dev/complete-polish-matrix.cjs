/** Fill only missing viewport captures/checks in the latest local matrix. */
const fs = require('node:fs'), path = require('node:path');
const puppeteer = require(path.join(process.env.PUPPETEER_DIR, 'node_modules/puppeteer-core'));
const WEB = process.env.WEB_URL || 'http://localhost:8103', OUT = 'reports/design-polish/latest-matrix';
if (!/^http:\/\/localhost:\d+$/.test(WEB)) throw Error('Local only');
const source = fs.readFileSync('scripts/dev/e2e-redesign.cjs', 'utf8');
const routesText = source.slice(source.indexOf('    const routes = [') + '    const routes = '.length, source.indexOf('    for (const [size, w, h]'));
const routes = Function('return ' + routesText)();
const results = JSON.parse(fs.readFileSync(OUT + '/ui-results.json'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const s = await (await fetch('http://localhost:54321/auth/v1/token?grant_type=password', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'qa@kodax.local',password:'kodax-local-123'})})).json();
  const b = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const page = await b.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  try {
    await page.goto(WEB + '/download'); await page.evaluate(s => {sessionStorage.clear();localStorage.setItem('sb-localhost-auth-token',JSON.stringify(s));},s);
    for (const [size,width,height] of [['small',320,740],['tablet',900,900]]) {
      await page.setViewport({width,height});
      for(const [name,route] of routes) {
        if(fs.existsSync(`${OUT}/${size}/${name}.png`))continue;
        await page.goto(WEB+route,{waitUntil:'networkidle2',timeout:90000});await sleep(650);
        await page.screenshot({path:`${OUT}/${size}/${name}.png`});
        const ok=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
        results.push({name:`${size}/${name}: no horizontal page overflow`,ok,detail:''});console.log(ok?'PASS':'FAIL',size,name);
      }
    }
    await page.evaluate(()=>{localStorage.removeItem('sb-localhost-auth-token');sessionStorage.clear();});
    for(const [size,width,height] of [['phone',390,844],['desktop',1440,900]]) {
      await page.setViewport({width,height});for(const [name,route] of [['download','/download'],['login','/login']]) {
        await page.goto(WEB+route,{waitUntil:'networkidle2'});await sleep(500);await page.screenshot({path:`${OUT}/${size}/guest-${name}.png`});
      }
    }
    if(errors.length)throw Error(errors.join('; '));
  } finally {await b.close();fs.writeFileSync(OUT+'/ui-results.json',JSON.stringify(results,null,2));}
  if(results.some(r=>!r.ok))process.exitCode=1;
})();

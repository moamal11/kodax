const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require(path.join(process.env.PUPPETEER_DIR || process.env.TEMP + '/kxtools', 'node_modules/puppeteer-core'));
const WEB = process.env.WEB_URL || 'http://localhost:8102';
const OUT = process.env.REVIEW_OUT || 'reports/visual-implementation-v2/web';
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(WEB)) throw Error('Local only');
const wait = ms => new Promise(r => setTimeout(r, ms));
async function click(page, label) {
  return page.evaluate(label => {
    const e = [...document.querySelectorAll('[role="button"],button,[role="tab"]')].filter(e => (e.getAttribute('aria-label') || e.textContent).trim() === label).at(-1);
    if (!e) throw Error('Missing button: ' + label);
    e.scrollIntoView({ block: 'center' }); e.click();
  }, label);
}
async function visit(page, route) {
  await page.goto(WEB + route, { waitUntil: 'networkidle2', timeout: 120000 });
  await wait(1200);
  if (route === '/rewards') {
    await page.waitForFunction(() => !!document.querySelector('[aria-label="خفيف · 1"]'), { timeout: 30000 });
    await wait(350);
  }
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push({ message: e.message, stack: e.stack, url: page.url() }));
    const results = [];
    const sizes = process.env.REVIEW_SIZES ? JSON.parse(process.env.REVIEW_SIZES) : [['phone',390,844],['small',320,740],['tablet',900,900],['desktop',1440,900]];
    for (const [size, width, height] of sizes) {
      await page.setViewport({ width, height }); await visit(page, '/download');
      await page.screenshot({ path: `${OUT}/${size}-welcome.png` });
      await click(page, 'شغّل المثال'); await wait(300);
      await page.screenshot({ path: `${OUT}/${size}-welcome-result.png` });
    }
    await visit(page, '/login');
    await page.type('input[aria-label="البريد الإلكتروني"]', 'qa@kodax.local');
    await page.type('input[aria-label="كلمة المرور"]', 'kodax-local-123');
    await click(page, 'تسجيل الدخول');
    try { await page.waitForFunction(() => location.pathname === '/' || location.pathname === '/(tabs)', { timeout: 30000 }); }
    catch (e) { console.log('LOGIN STATE',page.url(),await page.evaluate(() => document.body.innerText)); await page.screenshot({path:OUT+'/login-failure.png'}); throw e; }
    const allRoutes = [
      ['home','/'],['learn','/learn'],['rewards','/rewards'],['course','/course/py-basics'],['challenges','/learn?tab=challenges'],['lesson','/lesson/py-5'],['challenge','/challenge/py-ch-beg-5'],['profile','/profile'],['community','/code'],['editor','/code/add?lang=python'],['ai','/ai'],['messages','/messages'],['leaderboard','/leaderboard'],['certificates','/certificate'],['support','/support'],['settings','/notification-settings'],['about','/about'],['privacy','/privacy'],['blocked','/blocked-users']
    ];
    const coreRoutes = [['learn','/learn'],['rewards','/rewards'],['home','/'],['course','/course/py-basics'],['profile','/profile']];
    for (const [size, width, height] of sizes) {
      await page.setViewport({ width, height });
      const routes = process.env.FULL === '1' || (process.env.FULL_TABLET === '1' && size === 'tablet') ? allRoutes : coreRoutes;
      for (const [name, route] of routes) {
        await visit(page, route);
        const result = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1, text: document.body.innerText }));
        results.push({ size, width, height, name, ok: !result.overflow && !/Render Error|Server Error|undefined|NaN/.test(result.text), text: result.text });
        await page.screenshot({ path: `${OUT}/${size}-${name}.png` });
        console.log(result.overflow ? 'OVERFLOW' : 'CAPTURE', size, name);
      }
    }
    fs.writeFileSync(OUT + '/checks.json', JSON.stringify({ web: WEB, capturedAt: new Date().toISOString(), errors, results }, null, 2));
    if (errors.length || results.some(r => !r.ok)) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

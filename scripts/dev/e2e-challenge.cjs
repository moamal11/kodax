/**
 * اختبار رحلة التحدي على الويب المحلي: محاولة خاطئة → نتائج + تلميح، ثم الحل → تحقق السيرفر + XP مرة واحدة.
 *   PUPPETEER_DIR=... ANON_KEY=... node scripts/dev/e2e-challenge.cjs <outDir> <challengeId> <solutionFile> [email] [phone|desktop]
 */
const path = require('node:path');
const fs = require('node:fs');
const puppeteer = require(path.join(process.env.PUPPETEER_DIR || '', 'node_modules/puppeteer-core'));

const WEB = process.env.WEB_URL || 'http://localhost:8097';
const API = process.env.API_URL || 'http://localhost:54321';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ANON = process.env.ANON_KEY;
const [outDir, challengeId, solutionFile, email = 'qa@kodax.local', size = 'phone'] = process.argv.slice(2);
const solution = fs.readFileSync(solutionFile, 'utf8');
const VIEW = size === 'phone' ? { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true } : { width: 1440, height: 900, deviceScaleFactor: 1 };
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(p, opts = {}) {
  const r = await fetch(API + p, { ...opts, headers: { apikey: ANON, 'content-type': 'application/json', ...(opts.headers || {}) } });
  return r.json();
}
const bodyText = (page) => page.evaluate(() => document.body.innerText);
async function setEditor(page, code) {
  await page.waitForSelector('.cm-content', { timeout: 15000 });
  await page.evaluate((code) => {
    const el = document.querySelector('.cm-content');
    el.focus();
    document.execCommand('selectAll');
    document.execCommand('insertText', false, code);
  }, code);
  await sleep(400);
}
async function clickLabel(page, re) {
  return page.evaluate((src) => {
    const r = new RegExp(src);
    const el = [...document.querySelectorAll('[role="button"]')].find((e) => r.test(e.getAttribute('aria-label') || e.textContent || ''));
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.click();
    return true;
  }, re.source);
}
async function waitText(page, re, timeout = 60000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if (re.test(await bodyText(page))) return true;
    await sleep(500);
  }
  return false;
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const session = await api('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password: 'kodax-local-123' }) });
  const auth = { headers: { Authorization: `Bearer ${session.access_token}` } };
  const xpOf = async () => (await api(`/rest/v1/profiles?select=xp&id=eq.${session.user.id}`, auth))[0]?.xp;
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--lang=ar'] });
  const page = await browser.newPage();
  await page.setViewport(VIEW);
  // تشغيل Python في المتصفح عبر المشغّل المحلي (Wandbox يحد الطلبات المتكررة من نفس الجهاز)
  if (process.env.LOCAL_RUNNER !== 'wandbox') {
    await page.setRequestInterception(true);
    page.on('request', async (req) => {
      if (req.url() === 'https://wandbox.org/api/compile.json' && req.method() === 'POST' && /"compiler":"cpython/.test(req.postData() || '')) {
        const r = await fetch(API + '/dev/wandbox', { method: 'POST', headers: { 'content-type': 'application/json' }, body: req.postData() });
        return req.respond({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: await r.text() });
      }
      req.continue();
    });
  }
  await page.goto(WEB + '/download', { waitUntil: 'domcontentloaded' });
  await page.evaluate((v) => localStorage.setItem('sb-localhost-auth-token', v), JSON.stringify(session));
  await page.goto(`${WEB}/challenge/${challengeId}`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  check('Challenge page renders task + editor', /شغّل وتحقق/.test(await bodyText(page)) && !!(await page.$('.cm-content')));

  // محاولة خاطئة
  await setEditor(page, 'def wrong():\n    return None\n');
  await clickLabel(page, /شغّل وتحقق/);
  const failedShown = await waitText(page, /نتائج الاختبارات[\s\S]*نجح \d+ من \d+/, 60000);
  check('Wrong code shows failing results', failedShown);
  await sleep(1500);
  const hint = /تلميح آخر|^\s*1\s*$/m.test(await bodyText(page)) || !(await bodyText(page)).includes('تظهر التلميحات تدريجياً');
  check('A hint unlocks after a failed attempt', hint);
  await page.screenshot({ path: path.join(outDir, `${size}-failed.png`), fullPage: false });

  // الحل الصحيح + تسجيل
  const xpBefore = await xpOf();
  await setEditor(page, solution);
  const frames = [];
  const cdp = await page.createCDPSession();
  cdp.on('Page.screencastFrame', async (f) => {
    frames.push({ data: f.data, t: f.metadata.timestamp });
    await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => undefined);
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, everyNthFrame: 1 });
  await clickLabel(page, /شغّل وتحقق/);
  const solved = await waitText(page, /حللت التحدي!|حللته مجدداً/, 90000);
  check('Correct code is verified by the server', solved);
  await sleep(3800);
  await cdp.send('Page.stopScreencast');
  const xpAfter = await xpOf();
  const meter = await page.evaluate(() => [...document.querySelectorAll('[role="button"]')].map((e) => e.getAttribute('aria-label') || '').find((s) => s.startsWith('المستوى')) || '');
  const shown = Number((meter.match(/،\s*([\d,]+)\s*نقطة/) || [])[1]?.replace(/,/g, ''));
  check('Server granted XP', xpAfter > xpBefore, `${xpBefore} → ${xpAfter}`);
  check('XP meter shows the server total', shown === xpAfter, `meter=${shown} server=${xpAfter}`);
  check('Next actions visible', /التحدي التالي|كل التحديات/.test(await bodyText(page)));
  await page.screenshot({ path: path.join(outDir, `${size}-solved.png`) });

  // إعادة الحل: لا XP
  await page.goto(`${WEB}/challenge/${challengeId}`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  await setEditor(page, solution);
  await clickLabel(page, /شغّل وتحقق/);
  await waitText(page, /حللت التحدي!|حللته مجدداً/, 90000);
  await sleep(1500);
  check('Re-solving grants no XP', (await xpOf()) === xpAfter);
  check('Re-solve shows "solved again" state', /حللته مجدداً/.test(await bodyText(page)));

  const fdir = path.join(outDir, `${size}-frames`);
  fs.mkdirSync(fdir, { recursive: true });
  frames.forEach((f, i) => fs.writeFileSync(path.join(fdir, `${String(i).padStart(4, '0')}_${Math.round((f.t - frames[0].t) * 1000)}.jpg`), Buffer.from(f.data, 'base64')));
  await browser.close();
  const fail = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - fail} passed, ${fail} failed · frames: ${frames.length}`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

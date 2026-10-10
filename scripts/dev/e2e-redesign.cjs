/** Local UI regression checks and visual matrix; never points to production. */
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require(path.join(process.env.PUPPETEER_DIR || '', 'node_modules/puppeteer-core'));
const WEB = process.env.WEB_URL || 'http://localhost:8102';
const API = 'http://localhost:54321';
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(WEB)) throw new Error('Local web URL required');
const OUT = process.env.REVIEW_OUT || 'reports/redesign/continuation';
const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(ok ? 'PASS' : 'FAIL', name, detail);
}
async function api(route, body) {
  const r = await fetch(API + route, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return r.json();
}
async function click(page, label) {
  console.log('CLICK', label);
  await page.waitForFunction(
    (label) =>
      [...document.querySelectorAll('[role="button"],[role="tab"],button')].some((e) => (e.getAttribute('aria-label') || e.textContent).trim() === label),
    { timeout: 12000 },
    label
  );
  return page.evaluate((label) => {
    const e = [...document.querySelectorAll('[role="button"],[role="tab"],button')]
      .filter((e) => (e.getAttribute('aria-label') || e.textContent).trim() === label)
      .at(-1);
    e.scrollIntoView({ block: 'center' });
    e.click();
  }, label);
}
async function field(page, label, value) {
  const selector = `input[aria-label="${label}"]`;
  await page.waitForSelector(selector);
  await page.click(selector);
  await page.evaluate((s) => {
    const e = document.querySelector(s);
    e.focus();
    e.select();
  }, selector);
  await page.keyboard.type(value);
}
async function visit(page, route) {
  await page.goto(WEB + route, { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(800);
  const txt = await page.evaluate(() => document.body.innerText);
  if (/Unable to resolve module|SyntaxError:|Render Error|Server Error/.test(txt)) throw new Error('App error at ' + route + ': ' + txt.slice(0, 250));
  return txt;
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--lang=ar', '--force-color-profile=srgb'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await visit(page, '/download');
    await click(page, 'إنشاء حساب مجاني');
    await sleep(800);
    check(
      'Create account opens signup form',
      (await page.evaluate(() => document.body.innerText)).includes('إنشاء حساب مجاني') && page.url().includes('signup')
    );
    await page.screenshot({ path: OUT + '/signup.png' });
    await visit(page, '/forgot-password');
    await field(page, 'البريد الإلكتروني', 'qa@kodax.local');
    await click(page, 'إرسال رابط الاستعادة');
    await sleep(800);
    check('Recovery request shows neutral confirmation', (await page.evaluate(() => document.body.innerText)).includes('تم استلام طلبك'));
    await page.screenshot({ path: OUT + '/recovery.png' });
    await visit(page, '/reset-password');
    check('Expired recovery route offers new link', (await page.evaluate(() => document.body.innerText)).includes('طلب رابط جديد'));
    await visit(page, '/login');
    await field(page, 'البريد الإلكتروني', 'qa@kodax.local');
    await field(page, 'كلمة المرور', 'kodax-local-123');
    check('Password starts hidden', await page.$eval('input[aria-label="كلمة المرور"]', (e) => e.type === 'password'));
    await click(page, 'إظهار كلمة المرور');
    check('Password reveal works', await page.$eval('input[aria-label="كلمة المرور"]', (e) => e.type === 'text'));
    await click(page, 'تسجيل الدخول');
    await page.waitForFunction(() => location.pathname === '/' || location.pathname === '/(tabs)', { timeout: 20000 });
    check('Sign in reaches home', true);
    await visit(page, '/certificate');
    check('Certificate list loads actual local fixture', (await page.evaluate(() => document.body.innerText)).includes('مسار بايثون'));
    await visit(page, '/certificate/verify?id=00000000-0000-4000-8000-000000000101');
    check('Certificate verification loads holder', (await page.evaluate(() => document.body.innerText)).includes('سارة الكبيسي'));
    await field(page, 'رقم الشهادة', 'invalid');
    await click(page, 'تحقق');
    await sleep(250);
    const invalid = await page.evaluate(() => document.body.innerText);
    check('Invalid input clears previous verification', invalid.includes('رقم الشهادة غير صالح') && !invalid.includes('سارة الكبيسي'));
    await visit(page, '/certificate/verify?id=00000000-0000-4000-8000-000000000102');
    check('Revoked certificate is distinct', (await page.evaluate(() => document.body.innerText)).includes('هذه الشهادة ملغاة'));
    await visit(page, '/certificate/00000000-0000-4000-8000-000000000101');
    check('Certificate detail uses stored title and holder', (await page.evaluate(() => document.body.innerText)).includes('مسار بايثون'));
    await visit(page, '/certificate/download?id=00000000-0000-4000-8000-000000000101');
    const popupPromise = new Promise((resolve) => page.once('popup', resolve));
    await click(page, 'فتح نسخة الطباعة');
    const popup = await popupPromise;
    await sleep(800);
    check('Print document has no undefined fields', !(await popup.evaluate(() => document.body.innerText)).includes('undefined'));
    await popup.screenshot({ path: OUT + '/certificate-print.png' });
    await popup.close();
    await visit(page, '/profile');
    await click(page, 'تعديل الملف');
    await sleep(400);
    await page.screenshot({ path: OUT + '/profile-edit.png' });
    await click(page, 'إلغاء');
    await visit(page, '/privacy');
    await click(page, 'English');
    await sleep(250);
    check('Legal language switch works', (await page.evaluate(() => document.body.innerText)).includes('Last updated'));
    check('No browser runtime exceptions', errors.length === 0, errors.join('; '));
    const routes = [
      ['home', '/'],
      ['learn', '/learn'],
      ['course', '/course/py-basics'],
      ['lesson', '/lesson/py-7'],
      ['challenge', '/challenge/ch-4'],
      ['community', '/code'],
      ['editor', '/code/add?lang=python'],
      ['ai', '/ai'],
      ['profile', '/profile'],
      ['messages', '/messages'],
      ['rewards', '/rewards'],
      ['leaderboard', '/leaderboard'],
      ['certificates', '/certificate'],
      ['certificate-detail', '/certificate/00000000-0000-4000-8000-000000000101'],
      ['certificate-download', '/certificate/download?id=00000000-0000-4000-8000-000000000101'],
      ['verify', '/certificate/verify'],
      ['support', '/support'],
      ['blocked', '/blocked-users'],
      ['about', '/about'],
      ['privacy', '/privacy'],
      ['terms', '/terms'],
      ['account-deletion', '/account-deletion'],
      ['delete-account', '/delete-account'],
      ['notifications', '/notification-settings'],
    ];
    for (const [size, w, h] of [
      ['phone', 390, 844],
      ['desktop', 1440, 900],
      ['small', 320, 740],
      ['tablet', 900, 900],
    ]) {
      await page.setViewport({ width: w, height: h });
      fs.mkdirSync(OUT + '/' + size, { recursive: true });
      const subset =
        process.env.MATRIX_FULL === '1' || size === 'phone' || size === 'desktop'
          ? routes
          : routes.filter(([n]) => ['home', 'ai', 'editor', 'profile', 'certificates', 'certificate-detail', 'rewards', 'privacy'].includes(n));
      for (const [name, route] of subset) {
        await visit(page, route);
        await page.screenshot({ path: `${OUT}/${size}/${name}.png` });
        const fits = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
        check(`${size}/${name}: no horizontal page overflow`, fits);
      }
    }
    // Experimental light theme: representative screens, same data and layout.
    await page.setViewport({ width: 1440, height: 900 });
    fs.mkdirSync(OUT + '/light', { recursive: true });
    for (const [name, route] of routes.filter(([n]) => ['home', 'ai', 'profile', 'certificates', 'privacy'].includes(n))) {
      await visit(page, route + (route.includes('?') ? '&' : '?') + 'theme=light');
      await page.screenshot({ path: `${OUT}/light/${name}.png` });
    }
    await page.evaluate(() => {
      localStorage.removeItem('sb-localhost-auth-token');
      sessionStorage.removeItem('kodax-theme-preview');
    });
    for (const [size, width, height] of [
      ['small', 320, 740],
      ['desktop', 1440, 900],
    ]) {
      await page.setViewport({ width, height });
      for (const [n, r] of [
        ['login', '/login'],
        ['download', '/download'],
        ['recovery', '/forgot-password'],
      ]) {
        await visit(page, r);
        await page.screenshot({ path: `${OUT}/${size}/guest-${n}.png` });
      }
    }
  } finally {
    await browser.close();
    fs.writeFileSync(OUT + '/ui-results.json', JSON.stringify(results, null, 2));
  }
  if (results.some((r) => !r.ok)) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  fs.writeFileSync(OUT + '/ui-results.json', JSON.stringify({ results, error: e.message }, null, 2));
  process.exitCode = 1;
});

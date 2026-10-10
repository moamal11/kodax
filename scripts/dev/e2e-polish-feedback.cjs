/** User-requested modal refinements, using fictional local accounts only. */
const fs = require('node:fs'),
  path = require('node:path');
const p = require(path.join(process.env.PUPPETEER_DIR, 'node_modules/puppeteer-core'));
const WEB = process.env.WEB_URL || 'http://localhost:8108',
  OUT = 'reports/design-polish/revised';
if (!/^http:\/\/localhost:\d+$/.test(WEB)) throw Error('Local only');
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let page, browser;
const checks = [],
  errors = [];
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  console.log(ok ? 'PASS' : 'FAIL', name, detail);
}
async function visit(route) {
  await page.goto(WEB + route, { waitUntil: 'networkidle2', timeout: 90000 });
  await pause(650);
}
async function click(label, partial = false) {
  await page.waitForFunction(
    (label, partial) =>
      [...document.querySelectorAll('[role=button],[role=tab],[role=radio]')].some((e) => {
        const s = e.getAttribute('aria-label') || e.textContent;
        return partial ? s.includes(label) : s.trim() === label;
      }),
    { timeout: 12000 },
    label,
    partial
  );
  await page.evaluate(
    (label, partial) => {
      const e = [...document.querySelectorAll('[role=button],[role=tab],[role=radio]')]
        .filter((e) => {
          const s = e.getAttribute('aria-label') || e.textContent;
          return partial ? s.includes(label) : s.trim() === label;
        })
        .at(-1);
      e.scrollIntoView({ block: 'center' });
      e.click();
    },
    label,
    partial
  );
  await pause(400);
}
async function fill(label, value) {
  const sel = `input[aria-label="${label}"]`;
  await page.waitForSelector(sel);
  await page.$eval(sel, (e) => {
    e.scrollIntoView({ block: 'center' });
    e.focus();
    e.select();
  });
  await page.keyboard.type(value, { delay: 8 });
}
const text = () => page.evaluate(() => document.body.innerText);
async function shot(file) {
  await page.screenshot({ path: OUT + '/' + file + '.png' });
}
async function fits(name) {
  check(name, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
}
async function auth() {
  const s = await (
    await fetch('http://localhost:54321/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'qa@kodax.local', password: 'kodax-local-123' }),
    })
  ).json();
  await visit('/download');
  await page.evaluate((s) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('sb-localhost-auth-token', JSON.stringify(s));
  }, s);
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  browser = await p.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  page = await browser.newPage();
  page.on('pageerror', (e) => errors.push({ url: page.url(), message: e.message }));
  try {
    for (const [name, w, h] of [
      ['phone', 390, 844],
      ['desktop', 1440, 900],
      ['small', 320, 740],
      ['tablet', 900, 900],
    ]) {
      await page.setViewport({ width: w, height: h });
      await visit('/download');
      await shot(name + '-download');
      await fits(name + ' download width');
    }
    await page.setViewport({ width: 390, height: 844 });
    await visit('/download');
    await click('شغّل المثال');
    check('Public output follows selected example', (await text()).includes('Hello, Kodax!'));
    await click('اجمع رقمين');
    await click('شغّل المثال');
    check('Public sum output is 8', (await text()).includes('\n8\n'));
    await visit('/login?mode=signup');
    await fill('البريد الإلكتروني', `polish-${Date.now()}@kodax.local`);
    await fill('كلمة المرور', 'local-polish-123');
    await click('إنشاء حساب مجاني');
    await page.waitForFunction(() => document.body.innerText.includes('كمّل حسابك'));
    check('Incomplete profile save disabled', await page.$eval('[aria-label="حفظ ومتابعة"]', (e) => e.getAttribute('aria-disabled') === 'true'));
    await fill('الاسم الكامل', 'عبد الرحمن بن محمد الحسيني البغدادي');
    await click('اختر محافظتك');
    await fill('ابحث عن محافظة', 'كر');
    check('Province search narrows actual list', (await text()).includes('كربلاء') && !(await text()).includes('البصرة'));
    await click('كربلاء');
    await click('ذكر');
    for (const [name, w, h] of [
      ['phone', 390, 844],
      ['desktop', 1440, 900],
      ['small', 320, 740],
      ['tablet', 900, 900],
    ]) {
      await page.setViewport({ width: w, height: h });
      await pause(300);
      await shot(name + '-mandatory');
      await fits(name + ' mandatory width');
      check(
        name + ' mandatory save visible',
        await page.$eval('[aria-label="حفظ ومتابعة"]', (e) => {
          const r = e.getBoundingClientRect();
          return r.top >= 0 && r.bottom <= innerHeight;
        })
      );
    }
    await click('كربلاء');
    await fill('ابحث عن محافظة', 'zz-no-province');
    check('Province search empty can recover', (await text()).includes('ماكو محافظة'));
    await fill('ابحث عن محافظة', 'بغ');
    await click('بغداد');
    await click('حفظ ومتابعة');
    await page.waitForFunction(() => !document.body.innerText.includes('كمّل حسابك'));
    check('Mandatory data saves through local backend', true);
    await auth();
    for (const [name, w, h] of [
      ['phone', 390, 844],
      ['desktop', 1440, 900],
      ['small', 320, 740],
      ['tablet', 900, 900],
    ]) {
      await page.setViewport({ width: w, height: h });
      await visit('/code');
      await click('اكتب كوداً');
      await shot(name + '-languages');
      await fits(name + ' language chooser width');
      check(
        name + ' language options do not overlap',
        await page.evaluate(() => {
          const names = ['Python', 'مشروع ويب', 'JavaScript', 'TypeScript', 'C++', 'Java', 'C#', 'Go', 'Rust', 'SQL', 'Kotlin', 'Swift', 'Dart'];
          const r = [...document.querySelectorAll('[role=button]')]
            .filter((e) => names.includes(e.getAttribute('aria-label')))
            .map((e) => e.getBoundingClientRect());
          return (
            r.every((a) => a.height < 140) &&
            r.every((a, i) =>
              r.every(
                (b, j) => i === j || Math.min(a.right, b.right) - Math.max(a.left, b.left) < 1 || Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) < 1
              )
            )
          );
        })
      );
      await click('إغلاق');
      await visit('/');
      await click('الإشعارات', true);
      await shot(name + '-notifications');
      await fits(name + ' notifications width');
      await click('إغلاق');
    }
    await page.setViewport({ width: 390, height: 844 });
    await visit('/code');
    await click('اكتب كوداً');
    await fill('ابحث عن لغة', 'zz-no-language');
    check('Unknown language has honest empty state', (await text()).includes('ما لقينا هذه اللغة'));
    await click('عرض كل اللغات');
    await fill('ابحث عن لغة', 'Python');
    await click('Python');
    check('Community selection opens correct editor', page.url().includes('lang=python'));
    await click('Python');
    await click('مشروع ويب');
    check('Editor can choose web project', (await text()).includes('index.html') && (await text()).includes('style.css'));
    await click('مشروع ويب');
    await fill('ابحث عن لغة', 'JavaScript');
    await click('JavaScript');
    check('Editor returns to single language', (await text()).includes('JavaScript') && !(await text()).includes('style.css'));
    await visit('/');
    await click('الإشعارات', true);
    await click('غير المقروء', true);
    const hasMark = (await text()).includes('تعليم الكل كمقروء');
    if (hasMark) {
      await click('تعليم الكل كمقروء');
      check('Mark all read shows distinct confirmation state', (await text()).includes('ماكو إشعارات غير مقروءة'));
    }
    await click('إغلاق');
    for (const route of ['/download', '/ai', '/certificate', '/rewards']) {
      await visit(route + '?theme=light');
      await shot('light-' + route.slice(1));
      await fits('Light ' + route);
    }
    await visit('/code?theme=light');
    await click('اكتب كوداً');
    await shot('light-languages');
    await click('إغلاق');
    await visit('/?theme=light');
    await click('الإشعارات', true);
    await shot('light-notifications');
    await click('إغلاق');
    check('No hydration or browser render errors', errors.length === 0, JSON.stringify(errors));
  } catch (e) {
    check('Unexpected test failure', false, e.message);
    await shot('failure');
  } finally {
    fs.writeFileSync(OUT + '/feedback-results.json', JSON.stringify(checks, null, 2));
    await browser.close();
  }
  if (checks.some((c) => !c.ok)) process.exitCode = 1;
})();

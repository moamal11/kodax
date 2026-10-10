const fs = require('fs'),
  path = require('path');
const p = require(path.join(process.env.PUPPETEER_DIR, 'node_modules/puppeteer-core'));
const WEB = process.env.WEB_URL || 'http://localhost:8103';
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(WEB)) throw Error('Local URL required');
const OUT = process.env.REVIEW_OUT || 'reports/redesign/continuation';
(async () => {
  fs.mkdirSync(OUT+'/light',{recursive:true});
  const browser = await p.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage(),
    results = [];
  const check = (name, ok) => {
    results.push({ name, ok });
    console.log(ok ? 'PASS' : 'FAIL', name);
    if (!ok) throw Error(name);
  };
  const click = async (label) => {
    await page.waitForFunction(
      (label) => [...document.querySelectorAll('[role=button],[role=tab],[role=radio]')].some((e) => (e.getAttribute('aria-label') || e.textContent).trim() === label),
      {},
      label
    );
    await page.evaluate(
      (label) =>
        [...document.querySelectorAll('[role=button],[role=tab],[role=radio]')]
          .filter((e) => (e.getAttribute('aria-label') || e.textContent).trim() === label)
          .at(-1)
          .click(),
      label
    );
  };
  const fill = async (label, value) => {
    const s = `input[aria-label="${label}"]`;
    await page.waitForSelector(s, { visible: true });
    await page.evaluate((s) => {
      const e = document.querySelector(s);
      e.scrollIntoView({ block: 'center' });
      e.focus();
    }, s);
    await page.keyboard.type(value);
  };
  try {
    await page.setViewport({ width: 320, height: 740 });
    await page.goto(WEB + '/login?mode=signup', { waitUntil: 'networkidle2' });
    await fill('البريد الإلكتروني', `continuation-${Date.now()}@kodax.local`);
    await fill('كلمة المرور', 'local-qa-123');
    await click('إنشاء حساب مجاني');
    await page.waitForFunction(() => document.body.innerText.includes('كمّل حسابك'));
    await new Promise((r) => setTimeout(r, 1000));
    check('Signup reaches mandatory data', true);
    await fill('الاسم الكامل', 'متعلم اختبار');
    await click('اختر محافظتك');
    await click('بغداد');
    await click('ذكر');
    await page.screenshot({ path: OUT + '/mandatory-small.png' });
    const saveFits = await page.evaluate(() => {
      const e = [...document.querySelectorAll('[role=button]')].find((e) => e.getAttribute('aria-label') === 'حفظ ومتابعة');
      const r = e.getBoundingClientRect();
      return r.bottom <= innerHeight && r.top >= 0;
    });
    check('Mandatory save remains visible at 320px', saveFits);
    await click('حفظ ومتابعة');
    await page.waitForFunction(() => !document.body.innerText.includes('كمّل حسابك'));
    check('Mandatory data saves and closes', true);
    await page.goto(WEB + '/reset-password', { waitUntil: 'networkidle2' });
    await fill('كلمة المرور الجديدة', 'local-new-123');
    await fill('تأكيد كلمة المرور', 'local-new-123');
    await click('حفظ كلمة المرور');
    await page.waitForFunction(() => document.body.innerText.includes('تم تغيير كلمة المرور'));
    check('Authenticated password reset succeeds locally', true);
    await page.goto(WEB + '/ai?theme=light', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: OUT + '/light/ai.png' });
    const style = await page.$eval('textarea', (e) => ({ color: getComputedStyle(e).color, bg: getComputedStyle(e.parentElement).backgroundColor }));
    check('Light composer uses a light surface', !style.bg.includes('21, 21, 46'));
  } catch (e) {
    await page.screenshot({ path: OUT + '/followup-error.png' });
    throw e;
  } finally {
    fs.writeFileSync(OUT + '/followup-results.json', JSON.stringify(results, null, 2));
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

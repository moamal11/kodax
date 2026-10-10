/** Interactive polish checks, exclusively against local services and fictional users. */
const fs = require('node:fs'),
  path = require('node:path'),
  p = require(path.join(process.env.PUPPETEER_DIR, 'node_modules/puppeteer-core'));
const WEB = process.env.WEB_URL || 'http://localhost:8107';
if (!/^http:\/\/localhost:\d+$/.test(WEB)) throw Error('Local UI only');
const OUT = 'reports/design-polish/interactions';
fs.mkdirSync(OUT, { recursive: true });
const checks = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let page, browser;
const body = () => page.evaluate(() => document.body.innerText);
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  console.log(ok ? 'PASS' : 'FAIL', name, detail);
}
async function visit(route) {
  await page.goto(WEB + route, { waitUntil: 'networkidle2', timeout: 60000 });
  await wait(700);
}
async function click(label, part = false) {
  await page.waitForFunction(
    (label, part) =>
      [...document.querySelectorAll('[role=button],[role=link],[role=tab]')].some((e) => {
        const s = (e.getAttribute('aria-label') || e.textContent || '').trim();
        return part ? s.includes(label) : s === label;
      }),
    { timeout: 12000 },
    label,
    part
  );
  await page.evaluate(
    (label, part) => {
      let e = [...document.querySelectorAll('[role=button],[role=link],[role=tab]')]
        .filter((e) => {
          const s = (e.getAttribute('aria-label') || e.textContent || '').trim();
          return part ? s.includes(label) : s === label;
        })
        .at(-1);
      e.scrollIntoView({ block: 'center' });
      e.click();
    },
    label,
    part
  );
  await wait(550);
}
async function fill(label, text) {
  let sel = `input[aria-label="${label}"],textarea[aria-label="${label}"]`;
  await page.waitForSelector(sel);
  await page.$eval(sel, (e) => e.scrollIntoView({ block: 'center' }));
  await wait(150);
  await page.click(sel);
  await page.$eval(sel, (e) => {
    e.focus();
    e.select();
  });
  await page.keyboard.type(text, { delay: 8 });
  await wait(100);
  const value = await page.$eval(sel, (e) => e.value);
  if (value !== text) throw Error('Field input did not stick: ' + label + ' value=' + value);
}

async function auth(email) {
  let s = await (
    await fetch('http://localhost:54321/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'kodax-local-123' }),
    })
  ).json();
  if (!s.access_token) throw Error('Local auth failed');
  await visit('/download');
  await page.evaluate((s) => {
    localStorage.clear();
    localStorage.setItem('sb-localhost-auth-token', JSON.stringify(s));
    sessionStorage.clear();
  }, s);
  return s;
}
async function shot(name) {
  await page.screenshot({ path: OUT + '/' + name + '.png' });
}
(async () => {
  browser = await p.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await visit('/download');
    await click('شغّل المثال');
    check('Public preview prints the exact displayed program', (await body()).includes('Hello, Kodax!'));
    await click('اجمع رقمين');
    check('Switching examples clears prior output', !(await body()).includes('Hello, Kodax!'));
    await click('شغّل المثال');
    check('Addition preview displays 8', (await body()).includes('\n8\n'));
    await shot('public-preview');
    await click('إنشاء حساب مجاني');
    await fill('البريد الإلكتروني', 'bad-email');
    await fill('كلمة المرور', '123');
    await click('إنشاء حساب مجاني');
    check(
      'Signup validates email and password inline',
      (await body()).includes('أدخل بريدًا إلكترونيًا صحيحًا.') && (await body()).includes('6 أحرف'),
      (await body()).slice(-1200)
    );
    await visit('/login');
    await fill('البريد الإلكتروني', 'qa@kodax.local');
    await fill('كلمة المرور', 'wrong-local-password');
    await click('تسجيل الدخول');
    check('Authentication failure remains beside form', (await body()).includes('غير صحيحة'), (await body()).slice(-1200));
    await shot('auth-error');
    const session = await auth('qa@kodax.local');
    await visit('/');
    await click('كمّل الدرس');
    check('Natural home continue opens next lesson', page.url().includes('/lesson/'));
    await click('رجوع');
    check('Lesson back returns to home', new URL(page.url()).pathname === '/');
    await click('افتح المحرر');
    check('Home editor shortcut opens editor', page.url().includes('/code/add'));
    await click('رجوع');
    await click('جرّب تحديًا');
    check('Home challenge shortcut selects challenges', page.url().includes('challenges'));
    await visit('/code');
    await fill('ابحث في الأكواد', 'zz-no-result-923');
    await wait(1000);
    check(
      'Search displays a distinct empty state',
      (await body()).includes('ماكو أكواد') || (await body()).includes('ماكو نتائج') || (await body()).includes('ما لقينا')
    );
    await shot('community-empty');
    await fill('ابحث في الأكواد', 'حاسبة');
    await wait(1000);
    check('Search recovers real matching content', (await body()).includes('حاسبة المعدل الفصلي'));
    await visit('/certificate');
    check('Certificate list precedes collapsed explanation', (await body()).indexOf('عرض الشهادة') < (await body()).indexOf('كيف أحصل'));
    await click('كيف أحصل على شهادة؟');
    check('Certificate requirements expand on demand', (await body()).includes('50% دروس'));
    await click('ذهبية', true);
    check('Gold filter is honestly empty', (await body()).includes('لا توجد شهادات ذهبية'));
    await click('عرض كل الشهادات');
    await click('عرض الشهادة');
    check('Certificate preview navigates to detail', page.url().includes('000000000101'));
    check('Long identifier initially shortened', !(await body()).includes('00000000-0000-4000-8000-000000000101'));
    await click('إظهار الرقم الكامل');
    check('Complete identifier available for verification', (await body()).includes('00000000-0000-4000-8000-000000000101'));
    await visit('/ai');
    const prompts = await page.evaluate(
      () =>
        [...document.querySelectorAll('[role=button]')].filter(
          (e) => (e.textContent || '').includes('اشرح لي درس') && e.getAttribute('aria-label') !== 'كمّل محادثتك الأخيرة'
        ).length
    );
    check('AI offers a real next lesson', prompts === 1);
    await click('مواضيع أخرى');
    check('Additional AI topics are discoverable', (await body()).includes('كيف أحصل على شهادة؟'));
    await click('اقتراحات أقل');
    await click('اشرح لي درس', true);
    check('Suggestion prepares text without spending quota', (await page.$eval('[aria-label="رسالة للمساعد"]', (e) => e.value)).includes('اشرح لي درس'));
    let failAI = true;
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (failAI && req.url().includes('/functions/v1/ai-chat'))
        return req.respond({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'تعذّر الاتصال بالمساعد', code: 'upstream_error' }) });
      return req.continue();
    });
    await click('إرسال');
    await wait(1000);
    check('AI failure exposes retry without response actions', (await body()).includes('إعادة المحاولة') && !(await body()).includes('نسخ الرد'));
    await shot('ai-error');
    failAI = false;
    await click('إعادة المحاولة', true);
    await wait(2000);
    check('AI retry obtains an answer', !(await body()).includes('إعادة المحاولة') && (await body()).includes('نسخ'));
    await click('محادثة جديدة', true);
    await wait(1800);
    check('Real last conversation can be resumed', (await body()).includes('كمّل محادثتك الأخيرة'));
    await click('كمّل محادثتك الأخيرة');
    check('Resume restores actual user message', (await body()).includes('اشرح لي درس'));
    await visit('/support');
    let failSupport = true;
    page.removeAllListeners('request');
    page.on('request', (req) => {
      if (failSupport && req.url().includes('/rest/v1/support_tickets'))
        return req.respond({ status: 500, contentType: 'application/json', body: '{"message":"Local QA failure"}' });
      req.continue();
    });
    await visit('/support');
    await click('تذاكري', true);
    check('Support failure is not an empty list', (await body()).includes('تعذّر تحميل التذاكر'));
    failSupport = false;
    await click('حاول مرة أخرى');
    check('Support list retries successfully', !(await body()).includes('تعذّر تحميل التذاكر'));
    await click('رسالة جديدة');
    await fill('رسالتك', 'اختبار واجهة محلي فقط: وصف طويل للمشكلة في الدرس مع رابط https://example.com/very-long-code-reference'.repeat(3));
    await click('أرسل للدعم');
    check('Local support form records success', (await body()).includes('وصلت رسالتك'));
    await click('تذاكري', true);
    check('Created local ticket is listed', !(await body()).includes('ماكو تذاكر بعد'));
    page.removeAllListeners('request');
    await page.setRequestInterception(false);
    await visit('/rewards');
    check('Rewards uses explicit completed/target phrasing', (await body()).includes('أنجزت') && !(await body()).includes('10/2'));
    await shot('rewards-goals');
    await visit('/profile');
    await click('كل الشارات');
    check('Badge names and conditions displayed', (await body()).includes('الشارات'));
    await shot('badges');
    await click('إغلاق');
    await click('تعديل الملف');
    await shot('profile-edit');
    await click('إلغاء');
    for (const route of ['/download', '/ai', '/certificate', '/rewards', '/profile']) {
      await visit(route);
      await page.setViewport({ width: 1440, height: 900 });
      await wait(500);
      await page.setViewport({ width: 320, height: 740 });
      await wait(500);
      const live = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.body.innerText.slice(0, 50) }));
      await page.reload({ waitUntil: 'networkidle2' });
      const reloaded = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.body.innerText.slice(0, 50) }));
      check('Live resize and reload: ' + route, live.w <= 321 && reloaded.w <= 321, JSON.stringify({ live: live.w, reload: reloaded.w }));
    }
    await auth('new@kodax.local');
    await visit('/certificate');
    check('New account has no invented certificate', (await body()).includes('ما عندك شهادات بعد') && !(await body()).includes('مسار بايثون'));
    await visit('/ai');
    check('New account has no invented conversation', !(await body()).includes('كمّل محادثتك الأخيرة'));
    await visit('/messages');
    check('Empty messages offer community action', (await body()).includes('تصفّح المجتمع'));
    await shot('new-messages');
    await auth('long@kodax.local');
    await visit('/profile');
    check('Long Arabic identity remains readable', (await body()).includes('عبد الرحمن بن محمد الحسيني البغدادي الكرخي'));
    await shot('long-profile');
    await visit('/certificate');
    check('Empty certificates show real progress when present', (await body()).includes('تقدمك الحالي'));
    await shot('empty-cert-progress');
    for (const route of ['/ai', '/profile', '/rewards', '/certificate', '/course/py-basics']) {
      await visit(route + '?theme=light');
      await shot('light-' + route.replace(/\W/g, '-'));
      check('Light view fits ' + route, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }
    check('No browser render exceptions during interactive routes', errors.length === 0, errors.join(';'));
  } catch (e) {
    check('Unexpected harness or application failure', false, e.message);
    await shot('failure');
    console.error(e);
  } finally {
    fs.writeFileSync(OUT + '/results.json', JSON.stringify(checks, null, 2));
    await browser.close();
  }
  if (checks.some((c) => !c.ok)) process.exitCode = 1;
})();

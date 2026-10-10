/** Display/navigation checks only: no goal changes, reward claims or economy edits. */
const fs = require('node:fs'),
  path = require('node:path');
const p = require(path.join(process.env.PUPPETEER_DIR, 'node_modules/puppeteer-core'));
const WEB = process.env.WEB_URL || 'http://localhost:8103',
  OUT = 'reports/design-polish/gamification';
if (!/^http:\/\/localhost:\d+$/.test(WEB)) throw Error('Local only');
const checks = [],
  errors = [],
  wait = (ms) => new Promise((r) => setTimeout(r, ms));
let page, browser;
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  console.log(ok ? 'PASS' : 'FAIL', name, detail);
}
async function api(route, opts = {}) {
  const r = await fetch('http://localhost:54321' + route, {
    ...opts,
    headers: { apikey: process.env.ANON_KEY, 'content-type': 'application/json', ...opts.headers },
  });
  return r.json();
}
async function visit(route) {
  await page.goto(WEB + route, { waitUntil: 'networkidle2', timeout: 90000 });
  await wait(700);
}
async function click(label) {
  const found = await page.evaluate((label) => {
    const e = [...document.querySelectorAll('[role=button],[role=link],[role=tab]')]
      .filter((e) => (e.getAttribute('aria-label') || e.textContent).trim() === label)
      .at(-1);
    if (!e) return false;
    e.scrollIntoView({ block: 'center' });
    e.click();
    return true;
  }, label);
  if (!found) throw Error('Missing ' + label);
  await wait(500);
}
async function shot(name) {
  await page.screenshot({ path: OUT + '/' + name + '.png' });
}
const text = () => page.evaluate(() => document.body.innerText);
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const session = await api('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email: 'qa@kodax.local', password: 'kodax-local-123' }),
  });
  const headers = { Authorization: 'Bearer ' + session.access_token };
  const profile = () => api('/rest/v1/profiles?id=eq.' + session.user.id + '&select=xp', { headers });
  const before = await profile();
  const coinsBefore = await api('/rest/v1/rpc/coins_get_state', { method: 'POST', headers, body: '{}' });
  const progress = await api('/rest/v1/rpc/progress_get_state', { method: 'POST', headers, body: '{}' });
  const solved = await api('/rest/v1/user_lesson_progress?user_id=eq.' + session.user.id + '&course_id=eq.challenges&completed=eq.true&select=lesson_id', {
    headers,
  });
  browser = await p.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  page = await browser.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await visit('/download');
    await page.evaluate((s) => {
      sessionStorage.clear();
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(s));
    }, session);
    for (const [name, width, height] of [
      ['phone', 390, 844],
      ['small', 320, 740],
      ['tablet', 900, 900],
      ['desktop', 1440, 900],
    ]) {
      await page.setViewport({ width, height });
      await visit('/learn');
      let s = await text();
      check(
        name + ' learning exposes actual next lesson',
        s.includes('الشروط if/else') && s.includes('الدرس التالي') && s.includes('7') && s.includes('كمّل الدرس')
      );
      check(name + ' level and gap use existing thresholds', s.includes('باقي 440 XP للمستوى 4'));
      check(
        name + ' primary lesson action fits',
        await page.$eval('[aria-label="كمّل الدرس"]', (e) => {
          const r = e.getBoundingClientRect();
          return r.left >= 0 && r.right <= innerWidth && r.height >= 44;
        })
      );
      await shot(name + '-learn');
      await click('كمّل الدرس');
      check(name + ' next lesson action opens verified next lesson', page.url().includes('/lesson/py-5'));
      await visit('/learn?field=web-dev');
      check(name + ' next goal follows selected field', !(await text()).includes('الدرس التالي · أساسيات Python'));
      await shot(name + '-web-path');
      await visit('/learn?tab=challenges');
      check(name + ' next challenge and completion progress visible', (await text()).includes('التحدي التالي') && (await text()).includes('تحديات محلولة'));
      await shot(name + '-challenges');
      await click('حلّ التحدي');
      const challengeId = new URL(page.url()).pathname.split('/').at(-1);
      check(name + ' recommended challenge has not been solved', !solved.some((c) => c.lesson_id === challengeId), challengeId);
      await visit('/rewards');
      s = await text();
      check(
        name + ' rewards expose level, next badge and collected badges',
        s.includes('باقي 440 XP للمستوى 4') && s.includes('الشارة القادمة') && s.includes('كل الشارات')
      );
      check(
        name + ' actual daily and weekly goals retained',
        s.includes('هدف اليوم') && s.includes('هدف الأسبوع') && s.includes('المطلوب ' + progress.goals.weekly_target_days)
      );
      check(name + ' no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await shot(name + '-rewards');
      await page.evaluate(() => {
        const e = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent === 'الشارة القادمة');
        e.scrollIntoView({ block: 'center' });
      });
      await shot(name + '-badge-goal');
      check(name + ' next badge reflects four completed challenges', (await text()).includes('4 من 5'));
      await click('كل الشارات');
      check(name + ' badge sheet opens', (await text()).includes('الدروس والدورات'));
      await shot(name + '-badges');
      await click('إغلاق');
    }
    await page.setViewport({ width: 390, height: 844 });
    for (const [name, route] of [
      ['learn', '/learn'],
      ['rewards', '/rewards'],
    ]) {
      await visit(route + '?theme=light');
      await shot('light-' + name);
    }
    const after = await profile();
    const coinsAfter = await api('/rest/v1/rpc/coins_get_state', { method: 'POST', headers, body: '{}' });
    check('Navigation and presentation do not award XP or change coins', before[0].xp === after[0].xp && coinsBefore.balance === coinsAfter.balance, {
      before: before[0],
      after: after[0],
      coinsBefore: coinsBefore.balance,
      coinsAfter: coinsAfter.balance,
    });
    check('No browser errors', errors.length === 0, errors);
  } catch (e) {
    check('Unexpected test failure', false, e.stack);
    await shot('failure');
  } finally {
    fs.writeFileSync(OUT + '/results.json', JSON.stringify(checks, null, 2));
    await browser.close();
  }
  if (checks.some((c) => !c.ok)) process.exitCode = 1;
})();

/** Latest feedback: local fictional accounts, real 400-line source and actual scroll bounds. */
const fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto');
const p = require(path.join(process.env.PUPPETEER_DIR, 'node_modules/puppeteer-core'));
const WEB = process.env.WEB_URL || 'http://localhost:8103';
if (!/^http:\/\/localhost:\d+$/.test(WEB)) throw Error('Local only');
const OUT = process.env.REVIEW_OUT || 'reports/design-polish/latest';
const checks = [],
  errors = [],
  pause = (ms) => new Promise((r) => setTimeout(r, ms));
let page, browser;
function check(name, ok, detail) {
  checks.push({ name, ok, detail });
  console.log(ok ? 'PASS' : 'FAIL', name, detail || '');
}
async function api(route, opts = {}) {
  const r = await fetch('http://localhost:54321' + route, {
    ...opts,
    headers: { apikey: process.env.ANON_KEY, 'content-type': 'application/json', ...opts.headers },
  });
  const raw = await r.text();
  const value = raw ? JSON.parse(raw) : null;
  if (!r.ok) throw Error(JSON.stringify(value));
  return value;
}
async function visit(route) {
  await page.goto(WEB + route, { waitUntil: 'networkidle2', timeout: 90000 });
  await pause(650);
}
async function click(label, partial = false) {
  const ok = await page.evaluate(
    (label, partial) => {
      const e = [...document.querySelectorAll('[role=button],[role=link],[role=tab]')]
        .filter((e) => {
          const s = (e.getAttribute('aria-label') || e.textContent).trim();
          return partial ? s.includes(label) : s === label;
        })
        .at(-1);
      if (!e) return false;
      e.scrollIntoView({ block: 'center' });
      e.click();
      return true;
    },
    label,
    partial
  );
  if (!ok) throw Error('Missing ' + label);
  await pause(450);
}
async function shot(name) {
  await page.screenshot({ path: OUT + '/' + name + '.png' });
}
async function fits(name) {
  check(name + ' width', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
}
function languageIcons() {
  return [
    ...new Map(
      [...document.querySelectorAll('[role=button]')]
        .filter((e) =>
          [
            'Python',
            'مشروع ويب',
            'JavaScript',
            'TypeScript',
            'C++',
            'Java',
            'C#',
            'Go',
            'Rust',
            'SQL',
            'Kotlin',
            'Swift',
            'Dart',
            'HTML',
            'React JSX',
            'PHP',
          ].includes(e.getAttribute('aria-label'))
        )
        .map((e) => ({
          name: e.getAttribute('aria-label'),
          icon: [...e.querySelectorAll('*')].some((n) => /material-community|MaterialCommunityIcons|FontAwesome6/.test(getComputedStyle(n).fontFamily)),
        }))
        .map((i) => [i.name, i])
    ).values(),
  ];
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const login = (email) => api('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password: 'kodax-local-123' }) });
  const qa = await login('qa@kodax.local'),
    peer = await login('laith@kodax.local');
  const code = Array.from({ length: 400 }, (_, i) => `// source line ${i + 1}`).join('\n') + '\nconsole.log("complete-source-401");';
  const id = crypto.randomUUID();
  await api('/rest/v1/code_snippets', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + peer.access_token },
    body: JSON.stringify({
      id,
      user_id: peer.user.id,
      title: 'مراجعة كود طويل',
      description: 'مثال محلي لاختبار تمرير المصدر كاملًا.',
      language: 'javascript',
      code,
      is_public: true,
    }),
  });
  browser = await p.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  page = await browser.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await browser.defaultBrowserContext().overridePermissions(WEB, ['clipboard-read', 'clipboard-write']);
  try {
    await visit('/download');
    await page.evaluate((s) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(s));
    }, qa);
    for (const [name, w, h] of [
      ['phone', 390, 844],
      ['small', 320, 740],
      ['tablet', 900, 900],
      ['desktop', 1440, 900],
    ]) {
      await page.setViewport({ width: w, height: h });
      await visit('/');
      check(name + ' actual identity without greeting', !(await page.evaluate(() => document.body.innerText)).match(/صباح الخير|مساء الخير|مساء النور/));
      check(
        name + ' profile link has avatar',
        await page.$eval('[aria-label="ملفي الشخصي"]', (e) => e.querySelector('img') !== null || e.innerText.includes('س'))
      );
      await fits(name + ' home');
      await shot(name + '-home');
      await visit('/profile');
      await fits(name + ' profile');
      await shot(name + '-profile');
      await page.evaluate(() => {
        const e = [...document.querySelectorAll('[role=button]')].find((e) => /^الشارات:/.test(e.getAttribute('aria-label') || ''));
        e.scrollIntoView({ block: 'center' });
      });
      check(
        name + ' badge grid has complete rows',
        await page.evaluate(() => {
          const e = [...document.querySelectorAll('[role=button]')].find((e) => /^الشارات:/.test(e.getAttribute('aria-label') || ''));
          const cells = [...e.firstElementChild.children];
          const rows = new Map();
          cells.forEach((c) => {
            const top = Math.round(c.getBoundingClientRect().top);
            rows.set(top, (rows.get(top) || 0) + 1);
          });
          return cells.length === 6 && [...rows.values()].every((n) => n === 3 || n === 6);
        })
      );
      await shot(name + '-badges');
      await visit('/code');
      await click('اكتب كوداً');
      await page.evaluate(() => document.fonts.ready);
      const icons = await page.evaluate(languageIcons);
      check(name + ' all chooser languages have icons', icons.length === 13 && icons.every((i) => i.icon), icons);
      await shot(name + '-languages');
      await click('إغلاق');
      await visit('/code/add?lang=python');
      await click('Python');
      await page.evaluate(() => document.fonts.ready);
      const editorIcons = await page.evaluate(languageIcons);
      check(name + ' all editor languages have icons', editorIcons.length === 16 && editorIcons.every((i) => i.icon));
      await shot(name + '-editor-languages');
      await click('Dart');
      check(name + ' Dart selection retained', await page.evaluate(() => document.body.innerText.includes('Dart')));
      await visit('/code/' + id);
      await fits(name + ' code detail');
      const bound = await page.$eval('[aria-label="تمرير الكود"]', (e) => ({ height: e.clientHeight, sourceHeight: e.scrollHeight }));
      check(name + ' code has bounded independent scroll', bound.height <= 421 && bound.height >= 170 && bound.sourceHeight > 8000, bound);
      check(
        name + ' actions visible without scrolling source',
        await page.evaluate(() =>
          ['شغّل', 'نسخة لي'].every((label) => {
            const e = document.querySelector(`[role=button][aria-label="${label}"]`);
            const r = e.getBoundingClientRect();
            return r.top >= 0 && r.bottom <= innerHeight && r.height >= 44;
          })
        )
      );
      await shot(name + '-long-code');
      await page.$eval('[aria-label="تمرير الكود"]', (e) => (e.scrollTop = e.scrollHeight));
      await pause(100);
      check(
        name + ' last source line reachable inside viewport',
        await page.$eval('[aria-label="تمرير الكود"]', (e) => e.innerText.includes('complete-source-401') && e.scrollTop > 8000)
      );
      await shot(name + '-code-bottom');
      await page.click('[aria-label="نسخ الكود"]');
      await pause(400);
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      check(name + ' full source copied unchanged', copied.replace(/\r\n/g, '\n') === code, { length: copied.length, expected: code.length });
      await click('شغّل');
      await pause(300);
      check(
        name + ' whole source executes',
        await page.evaluate(() => document.body.innerText.includes('الناتج') && (document.body.innerText.match(/complete-source-401/g) || []).length === 2)
      );
      check(
        name + ' scrollbar themed',
        await page.$eval('[aria-label="تمرير الكود"]', (e) => getComputedStyle(e).scrollbarWidth === 'thin' && getComputedStyle(e).scrollbarColor !== 'auto')
      );
      await click('نسخة لي');
      check(
        name + ' full source opens in editor',
        await page.waitForFunction(() => document.body.innerText.includes('401 سطر'), { timeout: 10000 }).then(() => true)
      );
    }
    await page.setViewport({ width: 390, height: 844 });
    await visit('/user/00000000-0000-4000-8000-000000000002');
    await fits('Long identity');
    await shot('phone-long-identity');
    for (const [name, route] of [
      ['profile', '/profile'],
      ['home', '/'],
      ['long-code', '/code/' + id],
    ]) {
      await visit(route + '?theme=light');
      await fits('Light ' + name);
      await shot('light-' + name);
    }
    check('No browser errors', errors.length === 0, errors);
  } catch (e) {
    check('Unexpected test failure', false, e.stack);
    await shot('failure');
  } finally {
    fs.writeFileSync(OUT + '/results.json', JSON.stringify({ web: WEB, snippet: id, checks }, null, 2));
    await browser.close();
  }
  if (checks.some((c) => !c.ok)) process.exitCode = 1;
})();

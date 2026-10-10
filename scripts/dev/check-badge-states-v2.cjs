const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require(path.join(process.env.TEMP, 'kxtools/node_modules/puppeteer-core'));
const API = 'http://localhost:54321';
const WEB = process.env.BADGE_WEB_URL || 'http://localhost:8109';
const OUT = process.env.BADGE_OUT || 'reports/visual-polish-v2-final/badge-validation/before';
const beforeOnly = process.env.BADGE_BEFORE === '1';
if (!/^http:\/\/localhost:\d+$/.test(WEB)) throw Error('Local only');
const definitions = fs.readFileSync('src/constants/badgeDefinitions.ts', 'utf8');
const knownIds = [...definitions.matchAll(/id: '([^']+)'/g)].map(m => m[1]);
const wait = ms => new Promise(r => setTimeout(r, ms));
const checks = [];
function check(name, ok, detail) { checks.push({ name, ok: !!ok, detail }); console.log(ok ? 'PASS' : 'FAIL', name); }
async function session(email) {
  const response = await fetch(API + '/auth/v1/token?grant_type=password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'kodax-local-123' }) });
  if (!response.ok) throw Error('Local auth failed');
  return response.json();
}
async function storedBadges(s) {
  const r = await fetch(API + '/rest/v1/user_badges?select=badge_id,earned_at&user_id=eq.' + s.user.id, { headers: { Authorization: 'Bearer ' + s.access_token } });
  if (!r.ok) throw Error('Badge data failed');
  return r.json();
}
async function balances(s) {
  const headers = { Authorization: 'Bearer ' + s.access_token, 'content-type': 'application/json' };
  const [profile, coins] = await Promise.all([
    fetch(API + '/rest/v1/profiles?select=xp&id=eq.' + s.user.id, { headers }).then(r => r.json()),
    fetch(API + '/rest/v1/rpc/coins_get_state', { method: 'POST', headers, body: '{}' }).then(r => r.json()),
  ]);
  return { xp: profile[0].xp, coins: coins.balance };
}
async function visit(page, route) { await page.goto(WEB + route, { waitUntil: 'networkidle2' }); await wait(800); }
async function click(page, label) {
  await page.evaluate(label => {
    const element = [...document.querySelectorAll('[role=button],[role=link]')].filter(e => (e.getAttribute('aria-label') || e.textContent).trim() === label).at(-1);
    if (!element) throw Error('Missing ' + label);
    element.scrollIntoView({ block: 'center' }); element.click();
  }, label);
  await wait(400);
}
async function gallery(page) {
  return page.evaluate(() => {
    const exhibition = [...document.querySelectorAll('[role=button]')].find(e => e.getAttribute('aria-label')?.startsWith('الشارات:'));
    if (!exhibition) throw Error('Missing exhibition');
    const tiles = [...exhibition.querySelectorAll('[aria-label]')].filter(e => /، (مكتسبة|لم تُكتسب بعد:)/.test(e.getAttribute('aria-label')));
    const gold = '#f5b83d';
    return {
      label: exhibition.getAttribute('aria-label'),
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      tiles: tiles.map(e => ({
        label: e.getAttribute('aria-label'), text: e.textContent,
        outer: { fill: e.querySelector('polygon')?.getAttribute('fill'), stroke: e.querySelector('polygon')?.getAttribute('stroke'), dash: e.querySelector('polygon')?.getAttribute('stroke-dasharray') },
        hasGold: [...e.querySelectorAll('[stroke],[fill]')].some(n => [n.getAttribute('stroke'), n.getAttribute('fill')].some(v => v?.toLowerCase() === gold)),
        hasStamp: e.querySelector('polygon')?.getAttribute('fill')?.toLowerCase() === gold,
      })),
    };
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const errors = [];
  const evidence = [];
  try {
    for (const [account, email, expected] of [['new', 'new@kodax.local', 0], ['earned', 'levelup@kodax.local', 4]]) {
      const s = await session(email), records = await storedBadges(s), moneyBefore = await balances(s);
      const ids = new Set(records.filter(r => knownIds.includes(r.badge_id)).map(r => r.badge_id));
      check(account + ' database has expected valid unique badges', ids.size === expected, { records, count: ids.size });
      const page = await browser.newPage();
      page.on('pageerror', e => errors.push(e.message));
      await page.setViewport({ width: 390, height: 844 });
      await visit(page, '/download');
      await page.evaluate(s => { localStorage.clear(); localStorage.setItem('sb-localhost-auth-token', JSON.stringify(s)); }, s);
      const sizes = beforeOnly ? [['phone', 390, 844]] : [['small', 320, 740], ['phone', 390, 844], ['tablet', 900, 900], ['desktop', 1440, 900]];
      for (const [size, width, height] of sizes) {
        await page.setViewport({ width, height }); await visit(page, '/rewards');
        await page.waitForFunction(count => [...document.querySelectorAll('[role=button]')].some(e => e.getAttribute('aria-label') === `الشارات: ${count} من 44. عرض الكل`), {}, ids.size);
        const state = await gallery(page); evidence.push({ account, size, width, height, state });
        check(account + ' ' + size + ' count matches stored badges', state.label === `الشارات: ${ids.size} من 44. عرض الكل` && state.tiles.filter(t => t.label.includes('، مكتسبة')).length === Math.min(6, ids.size), state);
        if (!beforeOnly) {
          check(account + ' ' + size + ' upcoming seals are hollow and uncoloured', state.tiles.filter(t => !t.label.includes('، مكتسبة')).every(t => !t.hasGold && t.outer.fill === 'none' && t.outer.dash && t.text.includes('قادمة')));
          check(account + ' ' + size + ' earned seals have a solid gold stamp and explicit state', state.tiles.filter(t => t.label.includes('، مكتسبة')).every(t => t.hasStamp && !t.outer.dash && t.text.includes('مكتسبة')));
          check(account + ' ' + size + ' fits viewport', !state.overflow);
        }
        await page.screenshot({ path: path.join(OUT, account + '-' + size + '-rewards.png') });
        await click(page, 'كل الشارات');
        if (!beforeOnly) {
          const modal = await page.evaluate(() => {
            const e = document.querySelector('[role=dialog]');
            return { text: e?.textContent || '', states: e ? [...e.querySelectorAll('[aria-label]')].filter(n => /، (مكتسبة|لم تُكتسب بعد:)/.test(n.getAttribute('aria-label'))).map(n => ({ label: n.getAttribute('aria-label'), text: n.textContent })) : [], overflow: document.documentElement.scrollWidth > innerWidth + 1 };
          });
          check(account + ' ' + size + ' complete exhibition states match all stored badges', modal.states.length === 44 && modal.states.filter(t => t.label.includes('، مكتسبة')).length === ids.size && modal.states.every(t => t.text.includes(t.label.includes('، مكتسبة') ? 'مكتسبة' : 'قادمة')), modal);
          check(account + ' ' + size + ' sheet preserves actual conditions and fits', modal.text.includes('أكمل أول تحدي') && !modal.overflow);
        }
        if (size === 'phone' || size === 'desktop') await page.screenshot({ path: path.join(OUT, account + '-' + size + '-sheet.png') });
        await click(page, 'إغلاق');
      }
      if (!beforeOnly) {
        await page.setViewport({ width: 390, height: 844 }); await visit(page, '/profile');
        const profileState = await gallery(page);
        check(account + ' profile uses same actual badge count and styles', profileState.label === `الشارات: ${ids.size} من 44. عرض الكل` && profileState.tiles.every(t => t.label.includes('، مكتسبة') ? t.hasStamp : !t.hasGold));
        const recordsAfter = await storedBadges(s), moneyAfter = await balances(s);
        check(account + ' browsing leaves badge records XP and coins unchanged', JSON.stringify(recordsAfter) === JSON.stringify(records) && JSON.stringify(moneyAfter) === JSON.stringify(moneyBefore));
      }
      await page.close();
    }
    check('No browser runtime errors', errors.length === 0, errors);
  } catch (e) { check('Unexpected failure', false, e.stack); }
  finally { fs.writeFileSync(path.join(OUT, 'checks.json'), JSON.stringify({ web: WEB, checks, evidence }, null, 2)); await browser.close(); }
  if (checks.some(c => !c.ok)) process.exitCode = 1;
})();

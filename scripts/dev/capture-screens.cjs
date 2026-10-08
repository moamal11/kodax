/**
 * لقطات شاشة منهجية لنسخة الويب على الـbackend المحلي (Chrome بلا واجهة).
 *   PUPPETEER_DIR=<مجلد فيه puppeteer-core> node scripts/dev/capture-screens.cjs <outDir> [phone|desktop|both] [route-filter]
 * يدخل بحساب تجريبي محلي (scripts/dev/local-seed.ts) عبر جلسة من الـbackend المحلي ثم يزور كل الصفحات.
 */
const path = require('node:path');
const fs = require('node:fs');
const puppeteer = require(path.join(process.env.PUPPETEER_DIR || '', 'node_modules/puppeteer-core'));

const WEB = process.env.WEB_URL || 'http://localhost:8095';
const API = process.env.API_URL || 'http://localhost:54321';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ANON = process.env.ANON_KEY;
const EMAIL = process.env.SEED_EMAIL || 'qa@kodax.local';
const PASSWORD = process.env.SEED_PASSWORD || 'kodax-local-123';

const [outDir = 'reports/redesign/shots', which = 'both', filter = ''] = process.argv.slice(2);
const SIZES = { phone: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, desktop: { width: 1440, height: 900, deviceScaleFactor: 1 } };

async function api(p, opts = {}) {
  const r = await fetch(API + p, { ...opts, headers: { apikey: ANON, 'content-type': 'application/json', ...(opts.headers || {}) } });
  return r.json();
}

(async () => {
  const session = await api('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  if (!session.access_token) throw new Error('login failed: ' + JSON.stringify(session));
  const auth = { Authorization: `Bearer ${session.access_token}` };
  const snippets = await api('/rest/v1/code_snippets?select=id,title,user_id&is_public=eq.true&order=created_at.desc', { headers: auth });
  const peer = '00000000-0000-4000-8000-000000000004';
  const conv = await api('/rest/v1/rpc/get_or_create_conversation', { method: 'POST', headers: auth, body: JSON.stringify({ user1_id: session.user.id, user2_id: peer }) }).catch(() => null);
  const convId = typeof conv === 'string' ? conv : conv?.conversation_id ?? conv?.id;
  const grades = snippets.find((s) => s.title.includes('المعدل'));

  const routes = [
    ['home', '/'],
    ['learn', '/learn'],
    ['course', '/course/py-basics'],
    ['course-locked', '/course/py-advanced'],
    ['lesson', '/lesson/py-7'],
    ['challenges', '/challenges'],
    ['challenge', '/challenge/ch-4'],
    ['code-feed', '/code'],
    ['code-post', grades ? `/code/${grades.id}` : '/code'],
    ['code-add', '/code/add?lang=python'],
    ['code-add-web', '/code/add?lang=web'],
    ['ai', '/ai'],
    ['profile', '/profile'],
    ['user', `/user/${peer}`],
    ['user-long', '/user/00000000-0000-4000-8000-000000000002'],
    ['messages', '/messages'],
    ['dm', convId ? `/message/${convId}` : '/messages'],
    ['rewards', '/rewards'],
    ['leaderboard', '/leaderboard'],
    ['certificates', '/certificate'],
    ['verify', '/certificate/verify'],
    ['support', '/support'],
    ['blocked', '/blocked-users'],
    ['notif-settings', '/notification-settings'],
    ['about', '/about'],
    ['privacy', '/privacy'],
    ['terms', '/terms'],
    ['delete-account', '/delete-account'],
    ['not-found', '/this-page-does-not-exist'],
  ].filter(([n]) => !filter || filter.split(',').includes(n));

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--lang=ar', '--force-color-profile=srgb'] });
  const storageKey = 'sb-localhost-auth-token';
  for (const size of which === 'both' ? ['phone', 'desktop'] : [which]) {
    const dir = path.join(outDir, size);
    fs.mkdirSync(dir, { recursive: true });
    const page = await browser.newPage();
    await page.setViewport(SIZES[size]);
    await page.goto(WEB + '/download', { waitUntil: 'domcontentloaded' });
    await page.evaluate((k, v) => localStorage.setItem(k, v), storageKey, JSON.stringify(session));
    for (const [name, route] of routes) {
      try {
        await page.goto(WEB + route, { waitUntil: 'networkidle2', timeout: 60000 });
      } catch {}
      await new Promise((r) => setTimeout(r, Number(process.env.SETTLE_MS || 2500)));
      await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: process.env.FULL === '1' });
      process.stdout.write(`${size}/${name} `);
    }
    // صفحات الزائر
    if (!filter || filter.includes('guest')) {
      await page.evaluate((k) => localStorage.removeItem(k), storageKey);
      for (const [name, route] of [['guest-login', '/login'], ['guest-download', '/download'], ['guest-verify', '/certificate/verify']]) {
        try {
          await page.goto(WEB + route, { waitUntil: 'networkidle2', timeout: 60000 });
        } catch {}
        await new Promise((r) => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(dir, `${name}.png`) });
        process.stdout.write(`${size}/${name} `);
      }
    }
    await page.close();
  }
  await browser.close();
  console.log('\ndone →', outDir);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

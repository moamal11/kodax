/**
 * فحوص المجتمع والرسائل على الويب المحلي (يطابق ملاحظات تقرير التدقيق):
 *  F01 فقاعات DM داخل الشاشة (حتى الرسائل الطويلة والروابط)
 *  F02 زرّا متابعة/مراسلة بعرض لمس كافٍ
 *  F09 الأرقام تفتح قائمة المتابِعين
 *  F13 عدد غير المقروء يتحدث بعد قراءة المحادثة والرجوع
 *  F21 رابط محادثة مباشر: الرجوع يذهب لقائمة الرسائل
 *  F23 اختيار «ويب» في المحرر يفتح مشروعاً بثلاثة ملفات
 *   PUPPETEER_DIR=... ANON_KEY=... node scripts/dev/e2e-community.cjs <outDir> [phone|desktop]
 */
const path = require('node:path');
const fs = require('node:fs');
const puppeteer = require(path.join(process.env.PUPPETEER_DIR || '', 'node_modules/puppeteer-core'));

const WEB = process.env.WEB_URL || 'http://localhost:8097';
const API = process.env.API_URL || 'http://localhost:54321';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ANON = process.env.ANON_KEY;
const [outDir = 'reports/redesign/e2e', size = 'phone'] = process.argv.slice(2);
const VIEW = size === 'phone' ? { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true } : { width: 1440, height: 900, deviceScaleFactor: 1 };
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(p, opts = {}) {
  const r = await fetch(API + p, { ...opts, headers: { apikey: ANON, 'content-type': 'application/json', ...(opts.headers || {}) } });
  const txt = await r.text();
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}
const login = (email) => api('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password: 'kodax-local-123' }) });
const bodyText = (page) => page.evaluate(() => document.body.innerText);
async function clickLabel(page, re) {
  return page.evaluate((src) => {
    const r = new RegExp(src);
    const el = [...document.querySelectorAll('[role="button"],[role="link"],[role="tab"]')].find((e) => r.test(e.getAttribute('aria-label') || e.textContent || ''));
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.click();
    return true;
  }, re.source);
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const qa = await login('qa@kodax.local');
  const laith = await login('laith@kodax.local');
  const A = (s) => ({ Authorization: `Bearer ${s.access_token}` });
  const conv = await api('/rest/v1/rpc/get_or_create_conversation', { method: 'POST', headers: A(qa), body: JSON.stringify({ user1_id: qa.user.id, user2_id: laith.user.id }) });

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--lang=ar'] });
  const page = await browser.newPage();
  await page.setViewport(VIEW);
  await page.goto(WEB + '/download', { waitUntil: 'domcontentloaded' });
  await page.evaluate((v) => localStorage.setItem('sb-localhost-auth-token', v), JSON.stringify(qa));

  // F21: فتح المحادثة مباشرة (بلا سجل) ثم رجوع
  await page.goto(`${WEB}/message/${conv}`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  // F01: رسالة طويلة جداً برابط بلا مسافات
  const long = 'رسالة اختبار طويلة لفحص الالتفاف: ' + 'https://www.kodax.app/' + 'a'.repeat(160) + ' ونص عربي بعد الرابط حتى يتأكد الالتفاف داخل الفقاعة على الهاتف.';
  await page.focus('textarea');
  await page.keyboard.type(long, { delay: 0 });
  await clickLabel(page, /^إرسال$/);
  await sleep(1500);
  const overflow = await page.evaluate(() => {
    const vw = window.innerWidth;
    const bubbles = [...document.querySelectorAll('[aria-label]')].filter((e) => /، \d{1,2}:\d{2}/.test(e.getAttribute('aria-label') || ''));
    const bad = bubbles.map((b) => b.getBoundingClientRect()).filter((r) => r.left < -1 || r.right > vw + 1);
    return { count: bubbles.length, bad: bad.length };
  });
  check('F01 DM bubbles stay inside the viewport (incl. long link)', overflow.count > 0 && overflow.bad === 0, JSON.stringify(overflow));
  await page.screenshot({ path: path.join(outDir, `${size}-dm.png`) });
  await clickLabel(page, /^رجوع$/);
  await sleep(1500);
  check('F21 back from a direct DM link goes to the messages list', (await page.evaluate(() => location.pathname)) === '/messages');

  // F13: ليث يرسل رسالة → غير مقروء 1 → فتح ثم رجوع → 0
  await api('/rest/v1/messages', { method: 'POST', headers: { ...A(laith), Prefer: 'return=minimal' }, body: JSON.stringify({ conversation_id: conv, sender_id: laith.user.id, content: 'رسالة جديدة للاختبار' }) });
  await page.goto(`${WEB}/messages`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  const unreadBefore = await page.evaluate(() => [...document.querySelectorAll('[role="button"]')].map((e) => e.getAttribute('aria-label') || '').find((s) => /غير مقروءة/.test(s)) || '');
  check('Unread count shown in list', /غير مقروء/.test(unreadBefore), unreadBefore.slice(0, 60));
  await clickLabel(page, /ليث العبيدي/);
  await sleep(2000);
  await clickLabel(page, /^رجوع$/);
  await sleep(2000);
  const unreadAfter = await page.evaluate(() => [...document.querySelectorAll('[role="button"]')].map((e) => e.getAttribute('aria-label') || '').find((s) => /ليث العبيدي/.test(s)) || '');
  check('F13 unread clears after reading and going back (no reload)', !/غير مقروءة/.test(unreadAfter), unreadAfter.slice(0, 60));

  // F02 + F09: الملف العام
  await page.goto(`${WEB}/user/${laith.user.id}`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  const widths = await page.evaluate(() =>
    [...document.querySelectorAll('[role="button"]')]
      .filter((e) => /^(متابعة|إلغاء المتابعة|مراسلة)$/.test(e.getAttribute('aria-label') || ''))
      .map((e) => Math.round(e.getBoundingClientRect().width))
  );
  check('F02 follow + message buttons are both wide touch targets', widths.length === 2 && widths.every((w) => w >= 120), JSON.stringify(widths));
  await clickLabel(page, /^متابِعون/);
  await sleep(1500);
  const sheet = await bodyText(page);
  check('F09 followers count opens a real list', /المتابعات/.test(sheet) && /(سارة الكبيسي|ماكو متابِعين)/.test(sheet));
  await page.screenshot({ path: path.join(outDir, `${size}-followers.png`) });

  // F23: «ويب» في المحرر المباشر
  await page.goto(`${WEB}/code/add`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  await clickLabel(page, /^JavaScript$/);
  await sleep(500);
  await clickLabel(page, /^مشروع ويب$/);
  await sleep(800);
  const proj = await bodyText(page);
  check('F23 choosing «ويب» opens an HTML/CSS/JS project', /index\.html/.test(proj) && /style\.css/.test(proj) && /script\.js/.test(proj));

  // C02: الخطأ ليس قائمة فارغة (نقطع الطلب)
  await page.setRequestInterception(true);
  page.on('request', (r) => (r.url().includes('/rest/v1/code_snippets') ? r.abort() : r.continue()));
  await page.goto(`${WEB}/code`, { waitUntil: 'domcontentloaded' });
  await sleep(4000);
  const feedErr = await bodyText(page);
  check('C02 feed load error shows retry, not an empty feed', /تعذّر التحميل/.test(feedErr) && /حاول مرة أخرى/.test(feedErr));

  fs.writeFileSync(path.join(outDir, `${size}-results.json`), JSON.stringify(results,null,2));
  await browser.close();
  const fail = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - fail} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

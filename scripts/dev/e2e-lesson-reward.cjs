/**
 * اختبار رحلة الدرس والمكافأة على الويب المحلي (Chrome بلا واجهة) + تسجيل الحركة.
 *   PUPPETEER_DIR=... ANON_KEY=... node scripts/dev/e2e-lesson-reward.cjs <outDir> [email] [phone|desktop] [reduced]
 *
 * يتحقق من:
 *  1. «تابع» في الرئيسية يفتح الدرس التالي الفعلي
 *  2. الإجابة الخاطئة تعرض «حاول مرة أخرى» (لا «أكمل الدرس») — F17
 *  3. بعد الإكمال: بطاقة النتيجة + زر المتابعة متاح فوراً + XP المعروض = XP السيرفر
 *  4. إعادة فتح نفس الدرس لا تمنح ولا تحرك XP مرة ثانية
 */
const path = require('node:path');
const fs = require('node:fs');
const puppeteer = require(path.join(process.env.PUPPETEER_DIR || '', 'node_modules/puppeteer-core'));

const WEB = process.env.WEB_URL || 'http://localhost:8097';
const API = process.env.API_URL || 'http://localhost:54321';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ANON = process.env.ANON_KEY;
const [outDir = 'reports/redesign/e2e', email = 'qa@kodax.local', size = 'phone', reducedArg] = process.argv.slice(2);
const reduced = reducedArg === 'reduced';
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
async function serverXp(token, uid) {
  const r = await api(`/rest/v1/profiles?select=xp&id=eq.${uid}`, { headers: { Authorization: `Bearer ${token}` } });
  return r[0]?.xp;
}
async function clickText(page, text, { exact = false, timeout = 8000 } = {}) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const ok = await page.evaluate(
      (text, exact) => {
        const els = [...document.querySelectorAll('[role="button"],[role="radio"],[role="tab"],[role="link"],button,a')];
        const el = els.find((e) => {
          const s = (e.getAttribute('aria-label') || e.textContent || '').trim();
          return exact ? s === text : s.includes(text);
        });
        if (!el || el.getAttribute('aria-disabled') === 'true') return false;
        el.scrollIntoView({ block: 'center' });
        el.click();
        return true;
      },
      text,
      exact
    );
    if (ok) return true;
    await sleep(250);
  }
  return false;
}
const bodyText = (page) => page.evaluate(() => document.body.innerText);

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const session = await api('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password: process.env.SEED_PASSWORD || 'kodax-local-123' }) });
  const token = session.access_token;
  const uid = session.user.id;
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--lang=ar'] });
  const page = await browser.newPage();
  await page.setViewport(VIEW);
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(WEB + '/download', { waitUntil: 'domcontentloaded' });
  await page.evaluate((v) => localStorage.setItem('sb-localhost-auth-token', v), JSON.stringify(session));

  // 1) الرئيسية → تابع
  await page.goto(WEB + '/', { waitUntil: 'networkidle2' });
  await sleep(2500);
  const homeText = await bodyText(page);
  const lessonTitle = (homeText.match(/(?:تابع من حيث توقفت|ابدأ من هنا)[\s\S]*?\n(.+)\n(.+)\n/) || [])[2];
  const started = await clickText(page, 'كمّل الدرس') || (await clickText(page, 'ابدأ الدرس'));
  check('Home continue button opens a lesson', started && (await page.waitForFunction(() => location.pathname.startsWith('/lesson/'), { timeout: 8000 }).then(() => true).catch(() => false)));
  const lessonId = await page.evaluate(() => location.pathname.split('/').pop());
  await sleep(1500);
  const xpBefore = await serverXp(token, uid);

  // تسجيل الشاشة
  const frames = [];
  const cdp = await page.createCDPSession();
  cdp.on('Page.screencastFrame', async (f) => {
    frames.push({ data: f.data, t: f.metadata.timestamp });
    await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => undefined);
  });

  // 2) الاختبار: جرّب الخيارات حتى الصحيح
  let hasQuiz = (await bodyText(page)).includes('اختبر فهمك');
  let sawRetry = false;
  let sawCompleteAfterWrong = false;
  if (hasQuiz) {
    const options = await page.evaluate(() => [...document.querySelectorAll('[role="radio"]')].map((e) => e.getAttribute('aria-label')));
    for (const opt of options) {
      await clickText(page, opt, { exact: true });
      await sleep(150);
      await clickText(page, 'تحقق من الإجابة');
      await sleep(400);
      const txt = await bodyText(page);
      if (txt.includes('صحيح!')) break;
      if (txt.includes('حاول مرة أخرى')) sawRetry = true;
      if (txt.includes('مو هذا الجواب') && txt.includes('أكمل الدرس')) sawCompleteAfterWrong = true;
      await clickText(page, 'حاول مرة أخرى');
      await sleep(200);
    }
    check('Wrong answer shows "try again", never "complete" (F17)', !sawCompleteAfterWrong, sawRetry ? 'retry seen' : 'first option was correct');
  }
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('[role="button"]')].find((e) => (e.getAttribute('aria-label') || '').includes('أكمل الدرس'));
    el && el.scrollIntoView({ block: 'center' });
  });
  await sleep(300);
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, everyNthFrame: 1 });
  const t0 = Date.now();
  await clickText(page, 'أكمل الدرس');
  // 3) زر المتابعة متاح فوراً (قبل انتهاء الحركة)
  const continueReady = await page
    .waitForFunction(() => [...document.querySelectorAll('[role="button"]')].some((e) => /الدرس التالي|الدورة التالية|العودة للدورة/.test(e.getAttribute('aria-label') || '')), { timeout: 8000 })
    .then(() => Date.now() - t0)
    .catch(() => -1);
  check('Result + continue button visible without waiting for the animation', continueReady >= 0 && continueReady < 3000, `${continueReady}ms`);
  await sleep(3800);
  await cdp.send('Page.stopScreencast');
  const xpAfter = await serverXp(token, uid);
  const meter = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[role="button"]')].find((e) => (e.getAttribute('aria-label') || '').startsWith('المستوى'));
    return el ? el.getAttribute('aria-label') : null;
  });
  const shown = meter ? Number((meter.match(/،\s*([\d,]+)\s*نقطة/) || [])[1]?.replace(/,/g, '')) : NaN;
  check('Server granted XP once', xpAfter > xpBefore, `${xpBefore} → ${xpAfter}`);
  check('XP meter shows the server total', shown === xpAfter, `meter=${shown} server=${xpAfter}`);
  await page.screenshot({ path: path.join(outDir, `${size}-after-complete.png`) });

  // 4) إعادة فتح نفس الدرس: لا XP ولا حركة
  await page.goto(WEB + '/lesson/' + lessonId, { waitUntil: 'networkidle2' });
  await sleep(2000);
  if (hasQuiz) {
    const options = await page.evaluate(() => [...document.querySelectorAll('[role="radio"]')].map((e) => e.getAttribute('aria-label')));
    for (const opt of options) {
      await clickText(page, opt, { exact: true });
      await clickText(page, 'تحقق من الإجابة');
      await sleep(300);
      if ((await bodyText(page)).includes('صحيح!')) break;
      await clickText(page, 'حاول مرة أخرى');
    }
  }
  await clickText(page, 'أكمل الدرس');
  await sleep(2500);
  const xpAgain = await serverXp(token, uid);
  const reviewTxt = await bodyText(page);
  check('Re-completing the same lesson grants no XP', xpAgain === xpAfter, `${xpAfter} → ${xpAgain}`);
  check('Re-completion shows review state (no +XP card)', reviewTxt.includes('راجعت هذا الدرس') && !/\+\d+ XP\n/.test(reviewTxt.split('راجعت هذا الدرس')[1] || ''));

  // حفظ الإطارات
  const fdir = path.join(outDir, `${size}${reduced ? '-reduced' : ''}-frames`);
  fs.mkdirSync(fdir, { recursive: true });
  frames.forEach((f, i) => fs.writeFileSync(path.join(fdir, `${String(i).padStart(4, '0')}_${Math.round((f.t - frames[0].t) * 1000)}.jpg`), Buffer.from(f.data, 'base64')));
  fs.writeFileSync(path.join(outDir, `${size}${reduced ? '-reduced' : ''}-results.json`), JSON.stringify({ email, lessonId, lessonTitle, xpBefore, xpAfter, frames: frames.length, results }, null, 2));
  await browser.close();
  const fail = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - fail} passed, ${fail} failed · frames: ${frames.length}`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

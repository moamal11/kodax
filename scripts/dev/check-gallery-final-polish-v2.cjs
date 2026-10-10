const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require(path.join(process.env.TEMP, 'kxtools/node_modules/puppeteer-core'));

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const checks = [];
  const check = (name, ok) => checks.push({ name, ok });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 740 });
    await page.goto('http://localhost:8135', { waitUntil: 'networkidle2' });
    check('Gallery fits 320px', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check('69 final evidence images are embedded', await page.evaluate(() => {
      const images = [...document.querySelectorAll('figure img')];
      return images.length === 69 && images.every(i => i.src.startsWith('data:image/png;base64,'));
    }));
    await page.evaluate(() => filter('before'));
    check('Four before and after pairs', await page.evaluate(() => [...document.querySelectorAll('figure')].filter(f => !f.hidden).length === 8));
    await page.evaluate(() => document.querySelector('figure img').click());
    check('Image opens in a dialog', await page.evaluate(() => document.querySelector('dialog').open));
    await page.keyboard.press('Escape');
    check('Escape closes the image dialog', await page.evaluate(() => !document.querySelector('dialog').open));
    await page.evaluate(() => filter('tablet'));
    check('19 pages and two welcome states at 900x900', await page.evaluate(() => [...document.querySelectorAll('figure')].filter(f => !f.hidden).length === 21));
    await page.evaluate(() => filter('android'));
    check('Nine native Android captures', await page.evaluate(() => [...document.querySelectorAll('figure')].filter(f => !f.hidden).length === 9));
    await page.setViewport({ width: 1440, height: 900 });
    check('Gallery fits desktop', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.goto(pathToFileURL(path.resolve('reports/visual-polish-v2-final/gallery/index.html')).href, { waitUntil: 'load' });
    check('Standalone gallery opens offline', await page.evaluate(() => document.querySelectorAll('figure img').length === 69 && typeof filter === 'function'));
    fs.writeFileSync('reports/visual-polish-v2-final/gallery-checks.json', JSON.stringify(checks, null, 2));
    console.log(JSON.stringify(checks, null, 2));
    if (checks.some(c => !c.ok)) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

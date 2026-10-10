const path = require('node:path');
const p = require(path.join(process.env.PUPPETEER_DIR, 'node_modules/puppeteer-core'));
(async () => {
  const b = await p.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await b.newPage();
    for (const [name, width, height] of [['phone',390,844],['small',320,740],['tablet',900,900],['desktop',1440,900]]) {
      await page.setViewport({width,height});
      await page.goto('http://localhost:8103/download', {waitUntil:'networkidle2'});
      await page.waitForFunction(() => document.body.innerText.includes('جرّب') && document.body.innerText.includes('Python'));
      await page.screenshot({path:`reports/design-polish/latest-matrix/${name}/guest-download.png`});
      console.log('Captured download', name);
    }
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exitCode=1; });

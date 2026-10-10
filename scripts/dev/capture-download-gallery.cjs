// Capture the locally served app using only the dedicated QA account; no content is published.
const fs = require('node:fs'), path = require('node:path');
const puppeteer = require(path.join(process.env.TEMP, 'kxtools/node_modules/puppeteer-core'));
const { createClient } = require('@supabase/supabase-js');
const WEB = process.env.GALLERY_WEB_URL || 'http://localhost:8142';
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(WEB)) throw Error('Local app only');
const light = process.env.GALLERY_THEME === 'light';
const OUT = light ? 'assets/download-gallery/light' : 'assets/download-gallery';
const wait = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(['.env', '.env.local'].flatMap(f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split(/\r?\n/).flatMap(line => {
  const m = line.match(/^([A-Z_]+)=(.*)$/); return m ? [[m[1], m[2].trim().replace(/^['"]|['"]$/g, '')]] : [];
}) : []));
(async () => {
  if (new URL(env.EXPO_PUBLIC_SUPABASE_URL).hostname !== 'krtulodnhmfuoxjqajwl.supabase.co') throw Error('Wrong project');
  const qa = JSON.parse(fs.readFileSync('.env.community-social-qa.local', 'utf8')).accounts[0];
  const client = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const login = await client.auth.signInWithPassword({ email: qa.email, password: qa.password });
  if (login.error) throw login.error;
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
    await page.goto(WEB + '/download', { waitUntil: 'networkidle2' });
    await page.evaluate(({session, light}) => {
      localStorage.setItem('sb-krtulodnhmfuoxjqajwl-auth-token', JSON.stringify(session));
      localStorage.setItem('kodax-theme-mode', light ? 'light' : 'dark');
    }, { session: login.data.session, light });
    for (const [name, route] of [['learn', '/learn?field=python'], ['lesson', '/lesson/py-2'], ['editor', '/code/add?lang=python'], ['challenges', '/learn?tab=challenges'], ['rewards', '/rewards']]) {
      if (process.env.GALLERY_ONLY && process.env.GALLERY_ONLY !== name) continue;
      await page.goto(WEB + route, { waitUntil: 'networkidle2', timeout: 60000 });
      await wait(2000);
      await page.evaluate(() => document.fonts.ready);
      if (name === 'editor') {
        const editor = await page.$('.cm-content[contenteditable="true"]');
        if (editor) {
          await editor.click(); await page.keyboard.down('Control'); await page.keyboard.press('A'); await page.keyboard.up('Control');
          await page.keyboard.type('name = "Kodax"\nscore = 8\n\nif score >= 5:\n    print("أحسنت، " + name)\nelse:\n    print("حاول مرة ثانية")');
          await page.evaluate(() => document.activeElement?.blur());
        }
      }
      await wait(300);
      await page.screenshot({ path: `${OUT}/${name}.png` });
      console.log('Captured ' + name + ' (1170×2532)');
    }
    if (!process.env.GALLERY_ONLY) fs.writeFileSync(`${OUT}/source.json`, JSON.stringify({ capturedAt: new Date().toISOString(), source: WEB, mode: light ? 'light' : 'dark', viewport: [390, 844], pixels: [1170, 2532], account: 'Dedicated QA', editedOnlyLocalDraft: true }, null, 2));
  } finally { await browser.close(); await client.auth.signOut(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });

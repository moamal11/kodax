// Deterministic resource sizing with Expo's own image compiler. No artwork generation.
const fs = require('node:fs');
const path = require('node:path');
const { generateImageAsync } = require('@expo/image-utils');
const root = path.resolve(__dirname, '../..');
async function write(src, dest, size) {
  const { source } = await generateImageAsync({ projectRoot: root, cacheType: 'kodax-identity-v1' }, {
    src: path.join(root, src), width: size, height: size, resizeMode: 'contain',
  });
  fs.mkdirSync(path.dirname(path.join(root, dest)), { recursive: true });
  fs.writeFileSync(path.join(root, dest), source);
}
(async () => {
  const from = 'output/branding/logo-pack-v1';
  for (const n of fs.readdirSync(path.join(root, from)).filter(n => n.endsWith('.png'))) {
    fs.mkdirSync(path.join(root,'assets/branding'), { recursive:true });
    fs.copyFileSync(path.join(root,from,n), path.join(root,'assets/branding',n));
  }
  const symbol = 'assets/branding/kodax-symbol-white-on-purple.png';
  for (const [dest,size] of [['assets/icon.png',1024],['assets/favicon.png',64],['assets/splash.png',1024],['public/icon-192.png',192],['public/icon-512.png',512],['public/apple-touch-icon.png',180]]) await write(symbol,dest,size);
  for (const [density,scale] of [['mdpi',1],['hdpi',1.5],['xhdpi',2],['xxhdpi',3],['xxxhdpi',4]]) {
    for (const [name,base] of [['ic_launcher',48],['ic_launcher_round',48],['ic_launcher_foreground',108]]) {
      const target = `android/app/src/main/res/mipmap-${density}/${name}`;
      await write(symbol, target+'.png',base*scale);
      if (fs.existsSync(path.join(root,target+'.webp'))) fs.unlinkSync(path.join(root,target+'.webp'));
    }
    await write(symbol,`android/app/src/main/res/drawable-${density}/splashscreen_logo.png`,240*scale);
  }
  const colorPath = path.join(root,'android/app/src/main/res/values/colors.xml');
  const colors = fs.readFileSync(colorPath,'utf8').replace(/(<color name="(?:iconBackground|splashscreen_background)">)[^<]+/g,'$1#311e42');
  fs.writeFileSync(colorPath,colors);
  console.log('Copied six original images; compiled app, PWA and Android icon/splash resources.');
})().catch(e => { console.error(e); process.exit(1); });

/** Local original-package release APK. No EAS build/upload/version mutation. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const signing = JSON.parse(fs.readFileSync(path.join(root, '.env.android-signing.local'), 'utf8'));
const env = { ...process.env, KODAX_ANDROID_REVIEW: '0', KODAX_ANDROID_LOCAL: '0',
  KODAX_ANDROID_STANDALONE_APK: '1', KODAX_ANDROID_APK_VERSION_CODE: String(signing.versionCode),
  EXPO_NO_DOTENV: '1', NODE_ENV: 'production', CI: '1', NODE_OPTIONS: '--max-old-space-size=6144' };
for (const file of ['.env', '.env.local']) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^(EXPO_PUBLIC_[A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
  }
}
env.EXPO_PUBLIC_ADMOB_USE_TEST_ADS = 'false';
delete env.EXPO_PUBLIC_THEME_PREVIEW;
delete env.__EXPO_EAGER_BUNDLE_OPTIONS;
for (const key of ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_AI_API_ENDPOINT']) {
  if (new URL(env[key]).protocol !== 'https:' || /localhost|127\.0\.0\.1/.test(env[key])) throw new Error('Original APK requires live HTTPS endpoints');
}
if (new URL(env.EXPO_PUBLIC_SUPABASE_URL).host !== 'krtulodnhmfuoxjqajwl.supabase.co') throw new Error('Unexpected Supabase project');
const firebasePath = env.GOOGLE_SERVICES_JSON || path.join(root, 'google-services.json');
const firebase = JSON.parse(fs.readFileSync(firebasePath, 'utf8'));
if (!firebase.client.some(c => c.client_info.android_client_info.package_name === 'com.kodax.app')) throw new Error('Firebase Android registration is missing');
function execute(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit', shell: process.platform === 'win32' && command.endsWith('.bat') });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
execute(process.execPath, [path.join(root, 'node_modules/expo/bin/cli'), 'prebuild', '--platform', 'android', '--no-install']);
execute('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'scripts/dev/normalize-android-icons.ps1')]);
const cache = path.join(root, 'android/build/generated/autolinking');
let cachedPackage;
try { cachedPackage = JSON.parse(fs.readFileSync(path.join(cache, 'autolinking.json'), 'utf8')).project?.android?.packageName; } catch {}
if (cachedPackage !== 'com.kodax.app') {
  if (!cache.startsWith(root + path.sep)) throw new Error('Unexpected generated path');
  fs.rmSync(cache, { recursive: true, force: true });
}
const gradlePath = path.join(root, 'android/app/build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
const releaseMarker = '// Kodax original APK: existing EAS signing';
if (!gradle.includes(releaseMarker)) gradle += `\n${releaseMarker}\nif (System.getenv('KODAX_ANDROID_STANDALONE_APK') == '1') {
    android.signingConfigs.create('originalRelease') {
        storeFile file(System.getenv('KODAX_SIGNING_STORE_FILE'))
        storePassword System.getenv('KODAX_SIGNING_STORE_PASSWORD')
        keyAlias System.getenv('KODAX_SIGNING_KEY_ALIAS')
        keyPassword System.getenv('KODAX_SIGNING_KEY_PASSWORD')
    }
    android.buildTypes.release.signingConfig = android.signingConfigs.originalRelease
    tasks.configureEach { if (name == 'createBundleReleaseJsAndAssets') { outputs.upToDateWhen { false } } }
    react { extraPackagerArgs = ['--reset-cache'] }
}\n`;
fs.writeFileSync(gradlePath, gradle);
env.KODAX_SIGNING_STORE_FILE = signing.keystorePath;
env.KODAX_SIGNING_STORE_PASSWORD = signing.storePassword;
env.KODAX_SIGNING_KEY_ALIAS = signing.keyAlias;
env.KODAX_SIGNING_KEY_PASSWORD = signing.keyPassword;
delete env.CI; // Expo embed ignores reset-cache under CI.
execute(path.join(root, 'android/gradlew.bat'), [':app:assembleRelease', '-PreactNativeArchitectures=arm64-v8a,x86_64', '--no-daemon', '--max-workers=2', '--console=plain'], path.join(root, 'android'));
const bundle = fs.readFileSync(path.join(root, 'android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle'));
if (!bundle.includes(Buffer.from(new URL(env.EXPO_PUBLIC_SUPABASE_URL).host)) || bundle.includes(Buffer.from('http://127.0.0.1:54321'))) throw new Error('Incorrect embedded backend');
const output = path.join(root, 'output/android-release');
fs.mkdirSync(output, { recursive: true });
const apk = path.join(output, `Kodax-${signing.version}-build${signing.versionCode}-20261010.apk`);
const builtApk = path.join(root, 'android/app/build/outputs/apk/release/app-release.apk');
const quote = s => `'${s.replace(/'/g, "''")}'`;
execute('powershell.exe', ['-NoProfile', '-Command', `Copy-Item -LiteralPath ${quote(builtApk)} -Destination ${quote(apk)} -Force`]);
const metadata = { apk: path.basename(apk), createdAt: new Date().toISOString(), package: 'com.kodax.app', name: 'Kodax',
  version: signing.version, versionCode: signing.versionCode, sha256: crypto.createHash('sha256').update(fs.readFileSync(apk)).digest('hex'),
  bytes: fs.statSync(apk).size, architectures: ['arm64-v8a', 'x86_64'], buildType: 'release', signing: signing.source,
  certificateSha256: signing.certificateSha256, firebase: true, otaEnabled: false, ads: 'production', backendHost: new URL(env.EXPO_PUBLIC_SUPABASE_URL).host };
fs.writeFileSync(path.join(output, 'original-build.json'), JSON.stringify(metadata, null, 2));
console.log(JSON.stringify(metadata, null, 2));

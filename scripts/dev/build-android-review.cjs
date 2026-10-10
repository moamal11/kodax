/** Local release-mode APKs; no EAS upload, OTA, store submission or version increment. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const mode = process.argv[2];
if (!['local', 'phone'].includes(mode)) throw new Error('Use: node scripts/dev/build-android-review.cjs local|phone');
const output = path.join(root, 'output/android-release');
fs.mkdirSync(output, { recursive: true });
const env = { ...process.env, KODAX_ANDROID_REVIEW: '1', KODAX_ANDROID_LOCAL: mode === 'local' ? '1' : '0', EXPO_NO_DOTENV: '1', EXPO_PUBLIC_ADMOB_USE_TEST_ADS: 'true', NODE_ENV: 'production', CI: '1', NODE_OPTIONS: '--max-old-space-size=6144' };
// Public bundle values only; never copy private environment variables into an artifact.
for (const file of ['.env', '.env.local']) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^(EXPO_PUBLIC_[A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
}
env.EXPO_PUBLIC_ADMOB_USE_TEST_ADS = 'true';
delete env.EXPO_PUBLIC_THEME_PREVIEW;
delete env.__EXPO_EAGER_BUNDLE_OPTIONS;
if (mode === 'local') {
  const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const base = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ iss: 'kodax-local', role: 'anon', iat: 1700000000, exp: 2100000000 })}`;
  env.EXPO_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY = `${base}.${crypto.createHmac('sha256', 'kodax-local-dev-only-secret').update(base).digest('base64url')}`;
  env.EXPO_PUBLIC_AI_API_ENDPOINT = 'http://127.0.0.1:54321/functions/v1/ai-chat';
} else {
  for (const key of ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_AI_API_ENDPOINT']) {
    if (new URL(env[key]).protocol !== 'https:' || /localhost|127\.0\.0\.1/.test(env[key])) throw new Error(`Invalid phone endpoint: ${key}`);
  }
}
function execute(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit', shell: process.platform === 'win32' && command.endsWith('.bat') });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
execute(process.execPath, [path.join(root, 'node_modules/expo/bin/cli'), 'prebuild', '--platform', 'android', '--no-install']);
if (process.platform === 'win32') execute('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'scripts/dev/normalize-android-icons.ps1')]);
// Refresh the cached package name after prebuild. Stale autolinking metadata can refer
// to com.kodax.app.BuildConfig after changing the preview package.
const autolinking = path.join(root, 'android/build/generated/autolinking');
if (!autolinking.startsWith(root + path.sep)) throw new Error('Unexpected generated path');
let cachedPackage;
try { cachedPackage = JSON.parse(fs.readFileSync(path.join(autolinking, 'autolinking.json'), 'utf8')).project?.android?.packageName; } catch {}
if (cachedPackage !== 'com.kodax.app.preview') fs.rmSync(autolinking, { recursive: true, force: true });
// Gradle doesn't fingerprint environment variables. Rebundle only JS every time,
// preserving expensive native compilation caches when switching endpoints.
const gradle = path.join(root, 'android/app/build.gradle');
const freshBundleMarker = '// Kodax local review: fresh embedded bundle';
if (!fs.readFileSync(gradle, 'utf8').includes(freshBundleMarker)) fs.appendFileSync(gradle, `\n${freshBundleMarker}\nif (System.getenv('KODAX_ANDROID_REVIEW') == '1') {\n    tasks.configureEach { if (name == 'createBundleReleaseJsAndAssets') { outputs.upToDateWhen { false } } }\n}\n`);
const resetCacheMarker = '// Kodax review: do not reuse inlined endpoint values';
if (!fs.readFileSync(gradle, 'utf8').includes(resetCacheMarker)) fs.appendFileSync(gradle, `\n${resetCacheMarker}\nreact {\n    if (System.getenv('KODAX_ANDROID_REVIEW') == '1') { extraPackagerArgs = ['--reset-cache'] }\n}\n`);
// Expo 54 export:embed explicitly ignores --reset-cache in CI. This local build
// must re-inline endpoint values when switching between local and phone bundles.
delete env.CI;
execute(path.join(root, 'android/gradlew.bat'), [':app:assembleRelease', '-PreactNativeArchitectures=arm64-v8a,x86_64', '--no-daemon', '--max-workers=2', '--console=plain', '--stacktrace'], path.join(root, 'android'));
const embeddedBundle = fs.readFileSync(path.join(root, 'android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle'));
if (mode === 'phone' && (embeddedBundle.includes(Buffer.from('http://127.0.0.1:54321')) || !embeddedBundle.includes(Buffer.from(new URL(env.EXPO_PUBLIC_SUPABASE_URL).host)))) {
  throw new Error('Phone bundle has stale or incorrect backend values');
}
const tag = process.argv[3] || process.env.KODAX_REVIEW_TAG || '';
if (tag && !/^[a-zA-Z0-9-]+$/.test(tag)) throw new Error('Invalid review filename tag');
const apk = path.join(output, mode === 'phone' ? `Kodax-1.2.0-preview${tag ? '-' + tag : ''}.apk` : 'Kodax-1.2.0-local-test.apk');
const builtApk = path.join(root, 'android/app/build/outputs/apk/release/app-release.apk');
// Native Copy-Item avoids intermittent Node replacement errors on Windows.
if (process.platform === 'win32') {
  const literal = value => `'${value.replace(/'/g, "''")}'`;
  execute('powershell.exe', ['-NoProfile', '-Command', `Copy-Item -LiteralPath ${literal(builtApk)} -Destination ${literal(apk)} -Force`]);
} else {
  fs.copyFileSync(builtApk, apk);
}
const sha256 = crypto.createHash('sha256').update(fs.readFileSync(apk)).digest('hex');
fs.writeFileSync(path.join(output, `${mode}-build.json`), JSON.stringify({ mode, createdAt: new Date().toISOString(), apk: path.basename(apk), sha256, bytes: fs.statSync(apk).size, version: '1.2.0', package: 'com.kodax.app.preview', architectures: ['arm64-v8a', 'x86_64'], buildType: 'release', signing: 'local Android debug certificate (not Play signing)', otaEnabled: false, ads: 'test', backendHost: new URL(env.EXPO_PUBLIC_SUPABASE_URL).host }, null, 2));
console.log(`APK ready: ${apk}\nSHA-256: ${sha256}`);

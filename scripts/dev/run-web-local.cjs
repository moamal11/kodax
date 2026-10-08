/**
 * يشغّل نسخة الويب على الـbackend المحلي (scripts/dev/local-backend.ts) بدل Supabase الإنتاجي.
 *   node scripts/dev/run-web-local.cjs   (المنفذ 8081)
 * المفتاح المحلي يُشتق من سرّ التطوير المحلي نفسه في local-backend.ts — ليس مفتاحاً حقيقياً.
 */
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');

const SECRET = 'kodax-local-dev-only-secret';
const b64u = (s) => Buffer.from(s).toString('base64url');
const h = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const p = b64u(JSON.stringify({ iss: 'kodax-local', role: 'anon', iat: 1700000000, exp: 2100000000 }));
const sig = crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url');

const port = process.env.PORT || '8095';
// node scripts/dev/run-web-local.cjs --export <dir>  → نسخة ثابتة (expo export) على الـbackend المحلي
const exp = process.argv.indexOf('--export');
const args = exp >= 0 ? ['expo', 'export', '-p', 'web', '--output-dir', process.argv[exp + 1] || 'dist-local'] : ['expo', 'start', '--web', '--port', port];
const child = spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    EXPO_PUBLIC_SUPABASE_URL: process.env.LOCAL_BACKEND_URL || 'http://localhost:54321',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: `${h}.${p}.${sig}`,
    EXPO_PUBLIC_AI_API_ENDPOINT: (process.env.LOCAL_BACKEND_URL || 'http://localhost:54321') + '/functions/v1/ai-chat',
    NODE_OPTIONS: '--max-old-space-size=8192',
    BROWSER: 'none',
    CI: '1',
  },
});
child.on('exit', (c) => process.exit(c ?? 0));

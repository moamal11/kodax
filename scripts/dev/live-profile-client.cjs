/** Scoped QA against the linked Kodax project. Never prints or persists project API keys. */
const fs = require('node:fs'), path = require('node:path'), { spawnSync } = require('node:child_process');
const { createClient } = require('@supabase/supabase-js');
const ROOT = path.resolve(__dirname, '../..'), REF = 'krtulodnhmfuoxjqajwl', URL = `https://${REF}.supabase.co`;
const PRIVATE = path.join(ROOT, '.env.profile-qa.local');
const CLI = 'C:/Users/moamal/AppData/Local/npm-cache/_npx/b96a6bd565c470ce/node_modules/supabase/bin/supabase.exe';
function projectKeys() {
  const linked = fs.readFileSync(path.join(ROOT, 'supabase/.temp/project-ref'), 'utf8').trim();
  if (linked !== REF) throw new Error('Wrong linked project');
  for (const file of ['.env', '.env.local']) {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const url = text.match(/^EXPO_PUBLIC_SUPABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '');
    if (url && new globalThis.URL(url).hostname !== `${REF}.supabase.co`) throw new Error('App backend differs from linked project');
  }
  const r = spawnSync(CLI, ['projects', 'api-keys', '--project-ref', REF, '-o', 'json'], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
  if (r.status) throw new Error('Cannot read authorized project keys');
  const keys = JSON.parse(r.stdout);
  const anon = keys.find(k => k.name === 'anon')?.api_key, service = keys.find(k => k.name === 'service_role')?.api_key;
  if (!anon || !service) throw new Error('Required key types unavailable');
  return { anon, service };
}
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
function clients() { const keys = projectKeys(); return { keys, admin: createClient(URL, keys.service, options), client: () => createClient(URL, keys.anon, options) }; }
async function login(client, account) { const r = await client.auth.signInWithPassword({ email: account.email, password: account.password }); if (r.error) throw new Error(r.error.message); return r.data.session; }
module.exports = { ROOT, REF, URL, PRIVATE, clients, login };

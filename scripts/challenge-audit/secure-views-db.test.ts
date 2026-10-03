/**
 * اختبار 20261004050000_secure_views: الـviews لا تتجاوز RLS بعد الآن.
 * التشغيل: npx tsx scripts/challenge-audit/secure-views-db.test.ts
 */
import { createEnv, makeChecker, migration } from './_pglite-env';

const A = '99999999-0000-0000-0000-000000000001';
const B = '99999999-0000-0000-0000-000000000002';
const ADMIN = '99999999-0000-0000-0000-000000000003';
const { check, done } = makeChecker();

(async () => {
  const env = await createEnv();
  const { q, one, userQ, anonQ, denied } = env;
  await q(`CREATE SCHEMA IF NOT EXISTS storage`);
  await env.db.exec(`CREATE TABLE storage.objects (id uuid DEFAULT gen_random_uuid(), bucket_id text, name text, owner uuid);
    CREATE TABLE storage.buckets (id text PRIMARY KEY, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;`);
  for (const [id, admin] of [[A, false], [B, false], [ADMIN, true]] as const) await env.addUser(id, { admin });
  await env.applyUpTo('20261004040000_push_notifications');
  for (const [u, t] of [[A, 'A secret plan'], [B, 'B private chat']]) {
    const c = (await one(`INSERT INTO ai_conversations (user_id, title) VALUES ($1, $2) RETURNING id`, [u, t])).id;
    await q(`INSERT INTO ai_chat_history (user_id, role, content, conversation_id) VALUES ($1, 'user', $2, $3)`, [u, t + ' — message', c]);
  }
  check('before: anon reads all AI conversations via view (leak reproduced)', (await anonQ(`SELECT id FROM ai_conversations_with_preview`)).rows.length === 2);
  check('before: user A reads B conversations via view', (await userQ(A, `SELECT id FROM ai_conversations_with_preview WHERE user_id = $1`, [B])).rows.length === 1);

  await env.db.exec(migration('20261004050000_secure_views'));
  await env.db.exec(migration('20261004050000_secure_views'));

  check('anon cannot read AI conversations view', await denied(() => anonQ(`SELECT id FROM ai_conversations_with_preview`)));
  check('user A sees only own conversations with preview (app query works)', (await userQ(A, `SELECT title, last_message_preview FROM ai_conversations_with_preview WHERE user_id = $1`, [A])).rows[0]?.last_message_preview === 'A secret plan — message');
  check("user A cannot see B's conversations", (await userQ(A, `SELECT id FROM ai_conversations_with_preview WHERE user_id = $1`, [B])).rows.length === 0);
  check('user A total visible = own only', (await userQ(A, `SELECT id FROM ai_conversations_with_preview`)).rows.length === 1);
  check('anon cannot read admin_users', await denied(() => anonQ(`SELECT * FROM admin_users`)));
  check('normal user sees no admin ids via admin_users', (await userQ(A, `SELECT * FROM admin_users`)).rows.length === 0);
  check('admin still sees admin_users', (await userQ(ADMIN, `SELECT * FROM admin_users`)).rows.length === 1);
  const inv = await q(`SELECT c.relname, coalesce((SELECT option_value FROM pg_options_to_table(c.reloptions) WHERE option_name = 'security_invoker'), 'false') inv
                       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'v'`);
  check('every public view is security_invoker', inv.rows.every((r: any) => r.inv === 'true'), inv.rows.filter((r: any) => r.inv !== 'true').map((r: any) => r.relname).join(','));
  done();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

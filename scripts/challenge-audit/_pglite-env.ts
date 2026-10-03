/**
 * بيئة PGlite مشتركة لاختبارات قاعدة البيانات: مخطط الإنتاج (بنية فقط من النسخة الاحتياطية)
 * + كل الـmigrations المطبّقة بالترتيب + أدوات تبديل الدور (anon/authenticated/service_role).
 * لا تتصل بأي Supabase.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(__dirname, '../..');
const PGLITE_DIR = process.env.PGLITE_DIR ?? join(tmpdir(), 'kxtools');
const SCHEMA = process.env.KODAX_PROD_SCHEMA ?? join(ROOT, '../kodax-backups/prod-20261001-004734/public_schema.sql');
const MIG_DIR = join(ROOT, 'supabase/migrations');
export const read = (p: string) => readFileSync(p, 'utf8').replace(/^﻿/, '');
export const migration = (name: string) => read(join(MIG_DIR, name + '.sql'));

/** الـmigrations الموجودة في النسخة الاحتياطية (2026-10-01) — لا تُعاد */
const IN_BACKUP = new Set(['20260930000000_free_coins_system', '20260930000100_ugc_moderation', '20261001000000_challenge_catalog']);

export type Role = 'authenticated' | 'service_role' | 'anon';

export interface TestEnv {
  db: any;
  as<T>(role: Role, uid: string | null, fn: () => Promise<T>): Promise<T>;
  q(sql: string, p?: unknown[]): Promise<any>;
  one(sql: string, p?: unknown[]): Promise<any>;
  userQ(uid: string, sql: string, p?: unknown[]): Promise<any>;
  userOne(uid: string, sql: string, p?: unknown[]): Promise<any>;
  anonQ(sql: string, p?: unknown[]): Promise<any>;
  svcQ(sql: string, p?: unknown[]): Promise<any>;
  errorOf(fn: () => Promise<unknown>): Promise<string>;
  denied(fn: () => Promise<unknown>): Promise<boolean>;
  addUser(id: string, opts?: { admin?: boolean; username?: string; fullName?: string }): Promise<void>;
  applyUpTo(lastInclusive?: string): Promise<string[]>;
}

/**
 * ينشئ قاعدة بالمخطط الإنتاجي. applyUpTo(name) يطبّق الـmigrations حتى name (شاملة)؛
 * بدون اسم: كل الـmigrations في المجلد.
 */
export async function createEnv(): Promise<TestEnv> {
  const { PGlite } = await import(pathToFileURL(join(PGLITE_DIR, 'node_modules/@electric-sql/pglite/dist/index.js')).href);
  const { uuid_ossp } = await import(pathToFileURL(join(PGLITE_DIR, 'node_modules/@electric-sql/pglite/dist/contrib/uuid_ossp.js')).href);
  const db: any = new PGlite({ extensions: { uuid_ossp } });
  await db.exec(`
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE ROLE supabase_admin NOLOGIN; CREATE ROLE authenticator NOLOGIN; CREATE ROLE dashboard_user NOLOGIN;
    CREATE ROLE supabase_auth_admin NOLOGIN; CREATE ROLE pgbouncer NOLOGIN;
    CREATE SCHEMA extensions; CREATE EXTENSION "uuid-ossp" SCHEMA extensions;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb, raw_app_meta_data jsonb, created_at timestamptz DEFAULT now(), last_sign_in_at timestamptz, email_confirmed_at timestamptz);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.role', true), '') $$;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{}'::jsonb $$;
    GRANT USAGE ON SCHEMA auth, extensions, public TO anon, authenticated, service_role;
  `);
  const schema = read(SCHEMA)
    .replace(/^\\(un)?restrict .*$/gm, '')
    .replace(/^SET transaction_timeout = 0;$/m, '')
    .replace(/^CREATE SCHEMA public;$/m, '')
    .replace(/^COMMENT ON SCHEMA public .*$/m, '')
    .replace(/^SELECT pg_catalog\.set_config\('search_path', '', false\);$/m, 'SET search_path = public, extensions;');
  await db.exec(schema);
  await db.exec(`SET search_path = public, extensions; SET row_security = on;`);
  const coins = migration('20260930000000_free_coins_system');
  await db.exec(coins.match(/INSERT INTO coin_config[\s\S]*?;\n/)![0]);
  await db.exec(coins.match(/INSERT INTO course_coin_catalog \(course_id[\s\S]*?;\n/)![0]);

  async function as<T>(role: Role, uid: string | null, fn: () => Promise<T>): Promise<T> {
    await db.exec('RESET ROLE');
    await db.query(`SELECT set_config('request.jwt.claim.sub', $1, false), set_config('request.jwt.claim.role', $2, false)`, [uid ?? '', role]);
    await db.exec(`SET ROLE ${role}`);
    try {
      return await fn();
    } finally {
      await db.exec('RESET ROLE');
      await db.query(`SELECT set_config('request.jwt.claim.sub', '', false), set_config('request.jwt.claim.role', '', false)`);
    }
  }
  const q = (sql: string, p: unknown[] = []) => db.query(sql, p);
  const one = async (sql: string, p: unknown[] = []) => (await db.query(sql, p)).rows[0] as any;
  const errorOf = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      return '';
    } catch (e: any) {
      return String(e?.message ?? e);
    }
  };
  const env: TestEnv = {
    db,
    as,
    q,
    one,
    userQ: (uid, sql, p = []) => as('authenticated', uid, () => q(sql, p)),
    userOne: (uid, sql, p = []) => as('authenticated', uid, () => one(sql, p)),
    anonQ: (sql, p = []) => as('anon', null, () => q(sql, p)),
    svcQ: (sql, p = []) => as('service_role', null, () => q(sql, p)),
    errorOf,
    denied: async (fn) => (await errorOf(fn)) !== '',
    async addUser(id, opts = {}) {
      await db.query(`INSERT INTO auth.users (id, email, created_at) VALUES ($1, $2, now())`, [id, `${id.slice(-6)}@test.local`]);
      await db.query(`INSERT INTO profiles (id, username, full_name) VALUES ($1, $2, $3)`, [id, opts.username ?? 'u_' + id.slice(-6), opts.fullName ?? 'User ' + id.slice(-4)]);
      if (opts.admin) await db.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')`, [id]);
    },
    async applyUpTo(lastInclusive) {
      const names = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).map((f) => f.replace(/\.sql$/, '')).sort();
      const applied: string[] = [];
      for (const n of names) {
        if (IN_BACKUP.has(n)) continue;
        await db.exec(migration(n));
        applied.push(n);
        if (lastInclusive && n === lastInclusive) break;
      }
      return applied;
    },
  };
  return env;
}

export function makeChecker() {
  let pass = 0;
  let fail = 0;
  return {
    check(name: string, cond: boolean, detail = '') {
      if (cond) pass++;
      else fail++;
      console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
    },
    done() {
      console.log(`\n${pass} passed, ${fail} failed`);
      process.exit(fail ? 1 : 0);
    },
  };
}

/**
 * Supabase محلي للتطوير والفحص البصري فقط — لا يتصل بـ Production إطلاقاً.
 *   npx tsx scripts/dev/local-backend.ts            (المنفذ 54321)
 *
 * - قاعدة PGlite بمخطط الإنتاج (بنية فقط) + كل الـmigrations + بيانات تجريبية خيالية (scripts/dev/local-seed.ts)
 * - طبقة REST بصيغة PostgREST (الجزء الذي يستخدمه التطبيق: select مع embeds، الفلاتر، order/limit/range،
 *   insert/upsert/update/delete، rpc، count) مع RLS حقيقي عبر أدوار anon/authenticated
 * - Auth مبسّط (تسجيل/دخول بكلمة مرور/تجديد/مستخدم/خروج) يصدر JWT محلياً
 * - Storage في الذاكرة، و functions/v1 تُمرَّر إلى scripts/dev/local-functions.ts (54322) إن كان يعمل
 *
 * تشغيل التطبيق عليه:
 *   EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321 EXPO_PUBLIC_SUPABASE_ANON_KEY=<LOCAL_ANON_KEY المطبوع> npx expo start --web
 */
import http from 'node:http';
import crypto from 'node:crypto';
import { createEnv } from '../challenge-audit/_pglite-env';
import { seed, SEED_PASSWORD } from './local-seed';
import { handleVerify } from '../../supabase/functions/verify-challenge/core';
import { CHALLENGE_SPECS } from '../../supabase/functions/verify-challenge/challenges.generated';

const PORT = Number(process.env.LOCAL_BACKEND_PORT ?? 54321);
const FUNCTIONS_URL = process.env.LOCAL_FUNCTIONS_URL ?? 'http://localhost:54322';
const SECRET = 'kodax-local-dev-only-secret';

// ======================= JWT =======================
const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64url');
export function signJwt(payload: Record<string, unknown>): string {
  const h = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64u(JSON.stringify(payload));
  const s = crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${s}`;
}
function verifyJwt(t: string): any | null {
  const [h, p, s] = t.split('.');
  if (!h || !p || !s) return null;
  const exp = crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url');
  if (exp !== s) return null;
  const payload = JSON.parse(Buffer.from(p, 'base64url').toString());
  if (payload.exp && payload.exp < Date.now() / 1000) return null;
  return payload;
}
export const LOCAL_ANON_KEY = signJwt({ iss: 'kodax-local', role: 'anon', iat: 1700000000, exp: 2100000000 });

// ======================= DB =======================
type Claims = { role: 'anon' | 'authenticated' | 'service_role'; sub: string | null };
let env: Awaited<ReturnType<typeof createEnv>>;
let queue: Promise<unknown> = Promise.resolve();
/** PGlite اتصال واحد: كل الطلبات متسلسلة، وكل طلب في transaction بدوره و claims */
function withTx<T>(claims: Claims, fn: (q: (sql: string, p?: unknown[]) => Promise<any>) => Promise<T>): Promise<T> {
  const run = async () => {
    const db = env.db;
    await db.exec('BEGIN');
    try {
      await db.query(
        `SELECT set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claim.role', $2, true),
                set_config('request.jwt.claims', $3, true)`,
        [claims.sub ?? '', claims.role, JSON.stringify({ sub: claims.sub, role: claims.role })]
      );
      await db.exec(`SET LOCAL ROLE ${claims.role}`);
      const res = await fn((sql, p = []) => db.query(sql, p));
      await db.exec('COMMIT');
      return res;
    } catch (e) {
      await db.exec('ROLLBACK').catch(() => undefined);
      throw e;
    }
  };
  const p = queue.then(run, run);
  queue = p.catch(() => undefined);
  return p;
}

// ======================= Schema introspection =======================
type FK = { name: string; table: string; cols: string[]; ftable: string; fcols: string[] };
let FKS: FK[] = [];
const COLS = new Map<string, Map<string, string>>(); // table → col → type
const PKS = new Map<string, string[]>();
type Fn = { name: string; args: string[]; types: string[]; retset: boolean; rettype: string; composite: boolean; defaults: number };
const FNS = new Map<string, Fn[]>();

async function introspect() {
  const q = (s: string) => env.db.query(s);
  FKS = (
    await q(`SELECT c.conname AS name, cl.relname AS table, fc.relname AS ftable,
        (SELECT array_agg(a.attname ORDER BY k.ord) FROM unnest(c.conkey) WITH ORDINALITY k(n, ord) JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.n) AS cols,
        (SELECT array_agg(a.attname ORDER BY k.ord) FROM unnest(c.confkey) WITH ORDINALITY k(n, ord) JOIN pg_attribute a ON a.attrelid = c.confrelid AND a.attnum = k.n) AS fcols
      FROM pg_constraint c JOIN pg_class cl ON cl.oid = c.conrelid JOIN pg_class fc ON fc.oid = c.confrelid
      JOIN pg_namespace n ON n.oid = cl.relnamespace JOIN pg_namespace fn ON fn.oid = fc.relnamespace
      WHERE c.contype = 'f' AND n.nspname = 'public' AND fn.nspname = 'public'`)
  ).rows;
  for (const r of (
    await q(`SELECT c.relname t, a.attname col, format_type(a.atttypid, a.atttypmod) typ FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r','v','m','p') AND a.attnum > 0 AND NOT a.attisdropped`)
  ).rows) {
    if (!COLS.has(r.t)) COLS.set(r.t, new Map());
    COLS.get(r.t)!.set(r.col, r.typ);
  }
  for (const r of (
    await q(`SELECT cl.relname t, array_agg(a.attname ORDER BY a.attnum) cols FROM pg_constraint c JOIN pg_class cl ON cl.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = cl.relnamespace JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      WHERE c.contype = 'p' AND n.nspname = 'public' GROUP BY cl.relname`)
  ).rows)
    PKS.set(r.t, r.cols);
  for (const r of (
    await q(`SELECT p.proname name, coalesce(p.proargnames, '{}') args, p.proretset retset, p.pronargdefaults defaults, p.pronargs nargs,
        (SELECT array_agg(format_type(t, NULL) ORDER BY o) FROM unnest(p.proargtypes) WITH ORDINALITY x(t, o)) types,
        format_type(p.prorettype, NULL) rettype, (SELECT typtype FROM pg_type WHERE oid = p.prorettype) typtype,
        p.proargmodes modes
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public'`)
  ).rows) {
    const nargs = r.nargs as number;
    const fn: Fn = {
      name: r.name,
      args: (r.args as string[]).slice(0, nargs),
      types: (r.types ?? []) as string[],
      retset: r.retset,
      rettype: r.rettype,
      composite: r.typtype === 'c' || (r.modes ?? []).some((m: string) => m === 't' || m === 'o'),
      defaults: r.defaults,
    };
    if (!FNS.has(fn.name)) FNS.set(fn.name, []);
    FNS.get(fn.name)!.push(fn);
  }
}

// ======================= PostgREST subset =======================
const qi = (s: string) => '"' + s.replace(/"/g, '""') + '"';
class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details: string | null = null, public hint: string | null = null) {
    super(message);
  }
}

/** يقسم على الفاصلة في المستوى الأعلى (خارج الأقواس والاقتباس) */
function splitTop(s: string, sep = ','): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote = false;
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '"' && s[i - 1] !== '\\') quote = !quote;
    if (!quote) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === sep && depth === 0) {
        out.push(cur);
        cur = '';
        continue;
      }
    }
    cur += ch;
  }
  if (cur.length) out.push(cur);
  return out.map((x) => x.trim()).filter((x) => x.length);
}

type SelItem =
  | { kind: 'col'; alias: string; col: string; cast?: string; json?: string }
  | { kind: 'star' }
  | { kind: 'count'; alias: string }
  | { kind: 'embed'; alias: string; rel: string; hint?: string; inner: boolean; spread: boolean; items: SelItem[] };

function parseSelect(s: string | null): SelItem[] {
  if (!s || s.trim() === '') return [{ kind: 'star' }];
  return splitTop(s.replace(/\s+/g, '')).map((raw) => {
    let item = raw;
    let spread = false;
    if (item.startsWith('...')) {
      spread = true;
      item = item.slice(3);
    }
    const paren = item.indexOf('(');
    if (paren >= 0 && item.endsWith(')')) {
      const head = item.slice(0, paren);
      const body = item.slice(paren + 1, -1);
      let alias = '';
      let rest = head;
      const ci = head.indexOf(':');
      if (ci >= 0) {
        alias = head.slice(0, ci);
        rest = head.slice(ci + 1);
      }
      const parts = rest.split('!');
      const rel = parts[0];
      let hint: string | undefined;
      let inner = false;
      for (const p of parts.slice(1)) {
        if (p === 'inner') inner = true;
        else if (p === 'left') inner = false;
        else hint = p;
      }
      if (rel === 'count' && !body) return { kind: 'count', alias: alias || 'count' };
      return { kind: 'embed', alias: alias || rel, rel, hint, inner, spread, items: parseSelect(body) };
    }
    if (item === '*') return { kind: 'star' };
    let alias = '';
    let col = item;
    const ci = item.indexOf(':');
    if (ci >= 0 && item[ci + 1] !== ':') {
      alias = item.slice(0, ci);
      col = item.slice(ci + 1);
    }
    let cast: string | undefined;
    const cc = col.indexOf('::');
    if (cc >= 0) {
      cast = col.slice(cc + 2);
      col = col.slice(0, cc);
    }
    if (col === 'count()' || col === 'count') return { kind: 'count', alias: alias || 'count' };
    let json: string | undefined;
    const arrow = col.search(/->/);
    if (arrow >= 0) {
      json = col.slice(arrow);
      col = col.slice(0, arrow);
      if (!alias) alias = json.replace(/^.*->>?/, '');
    }
    return { kind: 'col', alias: alias || col, col, cast, json };
  });
}

function findRel(table: string, rel: string, hint?: string): { fk: FK; toOne: boolean; target: string } {
  const cands: { fk: FK; toOne: boolean; target: string }[] = [];
  for (const fk of FKS) {
    // الجدول الحالي يملك FK إلى rel (to-one)
    if (fk.table === table && (fk.ftable === rel || (fk.cols.length === 1 && fk.cols[0] === rel) || fk.name === rel)) cands.push({ fk, toOne: true, target: fk.ftable });
    // rel يملك FK إلى الجدول الحالي (to-many)
    if (fk.ftable === table && fk.table === rel) cands.push({ fk, toOne: false, target: fk.table });
  }
  let list = cands;
  if (hint) list = cands.filter((c) => c.fk.name === hint || (c.fk.cols.length === 1 && c.fk.cols[0] === hint) || c.target === hint);
  if (list.length === 0) throw new ApiError(400, 'PGRST200', `Could not find a relationship between '${table}' and '${rel}' in the schema cache`);
  if (list.length > 1) {
    const exact = list.filter((c) => c.target === rel);
    if (exact.length === 1) return exact[0];
    throw new ApiError(300, 'PGRST201', `Could not embed because more than one relationship was found for '${table}' and '${rel}'`);
  }
  return list[0];
}

type Filter = { path: string[]; sql: (alias: string, P: Params, table?: string) => string };
class Params {
  vals: unknown[] = [];
  add(v: unknown) {
    this.vals.push(v);
    return '$' + this.vals.length;
  }
}

function unquote(v: string) {
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1).replace(/\\"/g, '"');
  return v;
}

function colExpr(alias: string, col: string) {
  const arrow = col.search(/->/);
  if (arrow < 0) return `${alias}.${qi(col)}`;
  const base = col.slice(0, arrow);
  const path = col.slice(arrow).match(/->>?[^-]+/g) ?? [];
  return `${alias}.${qi(base)}` + path.map((seg) => (seg.startsWith('->>') ? `->>'${seg.slice(3)}'` : `->'${seg.slice(2)}'`)).join('');
}

/** يبني شرطاً من col=op.value */
/** نوع العمود لتحويل قيمة الفلتر النصية (PGlite لا يحوّل النص تلقائياً لبعض الأنواع) */
function typed(table: string | undefined, col: string, P: Params, v: unknown): string {
  const t = col.includes('->') ? (col.includes('->>') ? 'text' : 'jsonb') : table ? COLS.get(table)?.get(col) : undefined;
  return t ? `${P.add(v)}::text::${t}` : P.add(v);
}

function condition(col: string, opval: string): (alias: string, P: Params, table?: string) => string {
  let negate = false;
  let rest = opval;
  if (rest.startsWith('not.')) {
    negate = true;
    rest = rest.slice(4);
  }
  const dot = rest.indexOf('.');
  const op = rest.slice(0, dot);
  const raw = rest.slice(dot + 1);
  return (alias, P, table) => {
    const c = colExpr(alias, col);
    const V = (v: unknown) => typed(table, col, P, v);
    let s: string;
    switch (op) {
      case 'eq':
        s = `${c} = ${V(unquote(raw))}`;
        break;
      case 'neq':
        s = `${c} <> ${V(unquote(raw))}`;
        break;
      case 'gt':
        s = `${c} > ${V(unquote(raw))}`;
        break;
      case 'gte':
        s = `${c} >= ${V(unquote(raw))}`;
        break;
      case 'lt':
        s = `${c} < ${V(unquote(raw))}`;
        break;
      case 'lte':
        s = `${c} <= ${V(unquote(raw))}`;
        break;
      case 'like':
        s = `${c}::text LIKE ${P.add(unquote(raw).replace(/\*/g, '%'))}`;
        break;
      case 'ilike':
        s = `${c}::text ILIKE ${P.add(unquote(raw).replace(/\*/g, '%'))}`;
        break;
      case 'is': {
        const v = raw.toLowerCase();
        s = `${c} IS ${v === 'null' ? 'NULL' : v === 'true' ? 'TRUE' : v === 'false' ? 'FALSE' : 'UNKNOWN'}`;
        break;
      }
      case 'in': {
        const inner = raw.replace(/^\(/, '').replace(/\)$/, '');
        const items = splitTop(inner).map(unquote);
        s = items.length ? `${c}::text = ANY(${P.add(items)}::text[])` : 'FALSE';
        break;
      }
      case 'cs':
        s = `${c} @> ${V(raw)}`;
        break;
      case 'cd':
        s = `${c} <@ ${V(raw)}`;
        break;
      case 'ov':
        s = `${c} && ${V(raw.replace(/^\(/, '{').replace(/\)$/, '}'))}`;
        break;
      case 'fts':
      case 'plfts':
      case 'wfts':
        s = `to_tsvector(${c}::text) @@ plainto_tsquery(${P.add(unquote(raw))})`;
        break;
      default:
        throw new ApiError(400, 'PGRST100', `unknown operator ${op}`);
    }
    return negate ? `NOT (${s})` : s;
  };
}

/** or=(a.eq.1,and(b.gt.2,c.is.null)) */
function logicTree(expr: string, joiner: 'OR' | 'AND'): Filter[] {
  const inner = expr.replace(/^\(/, '').replace(/\)$/, '');
  const parts = splitTop(inner);
  const conds = parts.map((p) => {
    const m = p.match(/^(not\.)?(and|or)\((.*)\)$/);
    if (m) {
      const sub = logicTree('(' + m[3] + ')', m[2].toUpperCase() as 'OR' | 'AND');
      return { neg: !!m[1], sub };
    }
    const dot = p.indexOf('.');
    return { neg: false, cond: condition(p.slice(0, dot), p.slice(dot + 1)), path: p.slice(0, dot).split('.').slice(0, -1) };
  });
  return [
    {
      path: [],
      sql: (alias, P, table) =>
        '(' +
        conds
          .map((c: any) => {
            if (c.sub) {
              const s = c.sub.map((f: Filter) => f.sql(alias, P, table)).join(' AND ');
              return c.neg ? `NOT ${s}` : s;
            }
            return c.cond(alias, P, table);
          })
          .join(` ${joiner} `) +
        ')',
    },
  ];
}

type Query = {
  filters: Filter[];
  order: Map<string, string>; // path(joined '.') → order spec
  limit: Map<string, number>;
  offset: Map<string, number>;
  select: string | null;
  onConflict: string | null;
  columns: string | null;
};

const RESERVED = new Set(['select', 'order', 'limit', 'offset', 'on_conflict', 'columns']);
function parseQuery(sp: URLSearchParams): Query {
  const Q: Query = { filters: [], order: new Map(), limit: new Map(), offset: new Map(), select: sp.get('select'), onConflict: sp.get('on_conflict'), columns: sp.get('columns') };
  for (const [k, v] of sp) {
    const segs = k.split('.');
    const last = segs[segs.length - 1];
    const path = segs.slice(0, -1);
    if (RESERVED.has(k)) {
      if (k === 'order') Q.order.set('', v);
      if (k === 'limit') Q.limit.set('', Number(v));
      if (k === 'offset') Q.offset.set('', Number(v));
      continue;
    }
    if (last === 'order' && path.length) {
      Q.order.set(path.join('.'), v);
      continue;
    }
    if (last === 'limit' && path.length) {
      Q.limit.set(path.join('.'), Number(v));
      continue;
    }
    if (last === 'offset' && path.length) {
      Q.offset.set(path.join('.'), Number(v));
      continue;
    }
    if (last === 'or' || last === 'and') {
      for (const f of logicTree(v, last.toUpperCase() as 'OR' | 'AND')) Q.filters.push({ ...f, path });
      continue;
    }
    if (last === 'not.or' || k.endsWith('not.or')) continue;
    // col filter; json path arrow in key allowed (data->>x)
    const isJson = k.includes('->');
    const embedPath = isJson ? [] : segs.slice(0, -1);
    const col = isJson ? k : last;
    Q.filters.push({ path: embedPath, sql: condition(col, v) });
  }
  return Q;
}

function orderSql(spec: string | undefined, alias: string): string {
  if (!spec) return '';
  const parts = splitTop(spec).map((p) => {
    const segs = p.split('.');
    let col = segs[0];
    let dir = '';
    let nulls = '';
    for (const s of segs.slice(1)) {
      if (s === 'asc' || s === 'desc') dir = s.toUpperCase();
      if (s === 'nullsfirst') nulls = 'NULLS FIRST';
      if (s === 'nullslast') nulls = 'NULLS LAST';
    }
    // order=rel(col).desc للترتيب حسب عمود في جدول مرتبط (to-one) — غير مدعوم: تجاهل
    if (col.includes('(')) return '';
    return `${colExpr(alias, col)} ${dir} ${nulls}`.trim();
  });
  const list = parts.filter(Boolean);
  return list.length ? ' ORDER BY ' + list.join(', ') : '';
}

let aliasN = 0;
/** يبني SELECT لجدول مع embeds كـ JSON. يرجع نص SQL لصف واحد كـ json object مبني */
function buildSelect(table: string, items: SelItem[], Q: Query, P: Params, path: string[], where: string[], alias: string): { cols: string; joins: string[] } {
  const cols: string[] = [];
  const extraWhere: string[] = [];
  const pkey = path.join('.');
  for (const it of items) {
    if (it.kind === 'star') cols.push(`${alias}.*`);
    else if (it.kind === 'col') {
      let e = it.json ? colExpr(alias, it.col + it.json) : `${alias}.${qi(it.col)}`;
      if (it.cast) e = `(${e})::${it.cast}`;
      cols.push(`${e} AS ${qi(it.alias)}`);
    } else if (it.kind === 'count') {
      cols.push(`count(*) OVER () AS ${qi(it.alias)}`);
    } else if (it.kind === 'embed') {
      const { fk, toOne, target } = findRel(table, it.rel, it.hint);
      const a = 't' + ++aliasN;
      const subPath = [...path, it.alias];
      const subKey = subPath.join('.');
      // شروط الربط
      const join = toOne
        ? fk.cols.map((c, i) => `${a}.${qi(fk.fcols[i])} = ${alias}.${qi(c)}`).join(' AND ')
        : fk.cols.map((c, i) => `${a}.${qi(c)} = ${alias}.${qi(fk.fcols[i])}`).join(' AND ');
      const subWhere = [join];
      for (const f of Q.filters) if (f.path.join('.') === subKey || (f.path.length && f.path.join('.') === it.rel && path.length === 0)) subWhere.push(f.sql(a, P, target));
      const inner = buildSelect(target, it.items, Q, P, subPath, subWhere, a);
      const ord = orderSql(Q.order.get(subKey) ?? Q.order.get(it.rel), a);
      const lim = Q.limit.get(subKey) ?? Q.limit.get(it.rel);
      const rowSql = `SELECT ${inner.cols} FROM public.${qi(target)} ${a} WHERE ${subWhere.join(' AND ')}${ord}${lim != null ? ' LIMIT ' + lim : ''}`;
      const x = 'j' + aliasN;
      if (toOne) {
        const e = `(SELECT to_jsonb(${x}) FROM (${rowSql} LIMIT 1) ${x})`;
        if (it.spread) {
          // ...rel(cols) — ننشر الأعمدة مباشرة
          for (const sub of it.items) if (sub.kind === 'col') cols.push(`(${e})->>${`'${sub.alias}'`} AS ${qi(sub.alias)}`);
        } else cols.push(`${e} AS ${qi(it.alias)}`);
        if (it.inner) extraWhere.push(`EXISTS (${rowSql})`);
      } else {
        cols.push(`(SELECT coalesce(jsonb_agg(to_jsonb(${x})), '[]'::jsonb) FROM (${rowSql}) ${x}) AS ${qi(it.alias)}`);
        if (it.inner) extraWhere.push(`EXISTS (${rowSql})`);
      }
    }
  }
  where.push(...extraWhere);
  return { cols: cols.join(', ') || `${alias}.*`, joins: [] };
}

async function handleRead(claims: Claims, table: string, sp: URLSearchParams, headers: http.IncomingHttpHeaders, head: boolean) {
  if (!COLS.has(table)) throw new ApiError(404, '42P01', `relation "public.${table}" does not exist`);
  const Q = parseQuery(sp);
  const P = new Params();
  const items = parseSelect(Q.select);
  const where: string[] = [];
  for (const f of Q.filters) if (f.path.length === 0) where.push(f.sql('t0', P, table));
  const sel = buildSelect(table, items, Q, P, [], where, 't0');
  let limit = Q.limit.get('');
  let offset = Q.offset.get('') ?? 0;
  const range = headers['range'] as string | undefined;
  if (range && /^\d+-\d*$/.test(range)) {
    const [a, b] = range.split('-');
    offset = Number(a);
    if (b) limit = Number(b) - Number(a) + 1;
  }
  const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';
  const sql = `SELECT ${sel.cols} FROM public.${qi(table)} t0${whereSql}${orderSql(Q.order.get(''), 't0')}${limit != null ? ' LIMIT ' + limit : ''}${offset ? ' OFFSET ' + offset : ''}`;
  const prefer = String(headers['prefer'] ?? '');
  const wantCount = /count=(exact|planned|estimated)/.test(prefer);
  return withTx(claims, async (q) => {
    const rows = head ? [] : (await q(sql, P.vals)).rows;
    let total: number | null = null;
    if (wantCount) {
      const cp = new Params();
      const cw: string[] = [];
      for (const f of Q.filters) if (f.path.length === 0) cw.push(f.sql('t0', cp, table));
      // inner embeds affect count
      const tmp = buildSelect(table, items.filter((i) => i.kind === 'embed' && (i as any).inner), Q, cp, [], cw, 't0');
      void tmp;
      total = (await q(`SELECT count(*)::int n FROM public.${qi(table)} t0${cw.length ? ' WHERE ' + cw.join(' AND ') : ''}`, cp.vals)).rows[0].n;
    }
    return { rows, total, offset };
  });
}

function returningCols(table: string, sp: URLSearchParams, P: Params): string {
  const Q = parseQuery(new URLSearchParams(sp.get('select') ? { select: sp.get('select')! } : {}));
  const items = parseSelect(Q.select);
  if (items.some((i) => i.kind === 'embed')) return '*'; // embeds بعد الكتابة: نعيد قراءة الصفوف لاحقاً
  return buildSelect(table, items, Q, P, [], [], 'r').cols.replace(/\br\./g, '');
}

async function handleWrite(claims: Claims, method: string, table: string, sp: URLSearchParams, headers: http.IncomingHttpHeaders, body: any) {
  if (!COLS.has(table)) throw new ApiError(404, '42P01', `relation "public.${table}" does not exist`);
  const prefer = String(headers['prefer'] ?? '');
  const wantRep = prefer.includes('return=representation');
  const cols = COLS.get(table)!;
  const Q = parseQuery(sp);
  return withTx(claims, async (q) => {
    const P = new Params();
    let sql: string;
    if (method === 'POST') {
      const rows = Array.isArray(body) ? body : [body];
      if (!rows.length) return { rows: [], total: null, offset: 0 };
      const keys = Q.columns ? Q.columns.split(',').map((s) => s.replace(/"/g, '')) : [...new Set(rows.flatMap((r) => Object.keys(r)))].filter((k) => cols.has(k));
      const unknown = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter((k) => !cols.has(k));
      if (unknown.length) throw new ApiError(400, 'PGRST204', `Could not find the '${unknown[0]}' column of '${table}' in the schema cache`);
      const values = rows
        .map((r) => '(' + keys.map((k) => (k in r ? `${P.add(r[k] !== null && typeof r[k] === 'object' ? JSON.stringify(r[k]) : r[k])}::${cols.get(k)}` : 'DEFAULT')).join(', ') + ')')
        .join(', ');
      sql = `INSERT INTO public.${qi(table)} (${keys.map(qi).join(', ')}) VALUES ${values}`;
      const upsert = /resolution=(merge|ignore)-duplicates/.exec(prefer);
      if (upsert) {
        const target = (Q.onConflict ?? (PKS.get(table) ?? []).join(',')).split(',').map((s) => qi(s.trim()));
        if (upsert[1] === 'ignore') sql += ` ON CONFLICT (${target.join(', ')}) DO NOTHING`;
        else {
          const upd = keys.filter((k) => !target.includes(qi(k)));
          sql += ` ON CONFLICT (${target.join(', ')}) DO ${upd.length ? 'UPDATE SET ' + upd.map((k) => `${qi(k)} = EXCLUDED.${qi(k)}`).join(', ') : 'NOTHING'}`;
        }
      }
    } else if (method === 'PATCH') {
      const keys = Object.keys(body ?? {});
      const unknown = keys.filter((k) => !cols.has(k));
      if (unknown.length) throw new ApiError(400, 'PGRST204', `Could not find the '${unknown[0]}' column of '${table}' in the schema cache`);
      const sets = keys.map((k) => `${qi(k)} = ${P.add(body[k] !== null && typeof body[k] === 'object' ? JSON.stringify(body[k]) : body[k])}::${cols.get(k)}`);
      const where = Q.filters.filter((f) => !f.path.length).map((f) => f.sql(`public.${qi(table)}`, P, table));
      sql = `UPDATE public.${qi(table)} SET ${sets.join(', ')}${where.length ? ' WHERE ' + where.join(' AND ') : ''}`;
    } else {
      const where = Q.filters.filter((f) => !f.path.length).map((f) => f.sql(`public.${qi(table)}`, P, table));
      sql = `DELETE FROM public.${qi(table)}${where.length ? ' WHERE ' + where.join(' AND ') : ''}`;
    }
    sql += ` RETURNING ${wantRep ? returningCols(table, sp, P) : '1 AS _'}`;
    const res = await q(sql, P.vals);
    let rows = wantRep ? res.rows : [];
    // embeds بعد الكتابة: إعادة القراءة بالمفتاح الأساسي
    if (wantRep && sp.get('select') && parseSelect(sp.get('select')).some((i) => i.kind === 'embed') && rows.length) {
      const pk = PKS.get(table) ?? ['id'];
      const RP = new Params();
      const items = parseSelect(sp.get('select'));
      const where = [`(${pk.map((c) => `t0.${qi(c)}`).join(', ')})::text = ANY(${RP.add(rows.map((r: any) => '(' + pk.map((c) => r[c]).join(',') + ')'))}::text[])`];
      const sel = buildSelect(table, items, parseQuery(new URLSearchParams()), RP, [], where, 't0');
      rows = (await q(`SELECT ${sel.cols} FROM public.${qi(table)} t0 WHERE ${where.join(' AND ')}`, RP.vals)).rows;
    }
    return { rows, total: res.rows.length, offset: 0 };
  });
}

async function handleRpc(claims: Claims, name: string, args: Record<string, unknown>, sp: URLSearchParams) {
  const overloads = FNS.get(name);
  if (!overloads) throw new ApiError(404, 'PGRST202', `Could not find the function public.${name} in the schema cache`);
  const keys = Object.keys(args);
  const fn = overloads.find((f) => keys.every((k) => f.args.includes(k)) && f.args.length - f.defaults <= keys.length) ?? overloads.find((f) => keys.every((k) => f.args.includes(k)));
  if (!fn) throw new ApiError(404, 'PGRST202', `Could not find the function public.${name}(${keys.join(', ')}) in the schema cache`);
  const P = new Params();
  const call = `public.${qi(name)}(${keys
    .map((k) => {
      const t = fn.types[fn.args.indexOf(k)];
      const v = args[k];
      return `${qi(k)} => ${P.add(v !== null && typeof v === 'object' ? JSON.stringify(v) : v)}::${t}`;
    })
    .join(', ')})`;
  return withTx(claims, async (q) => {
    if (fn.retset || fn.composite) {
      const Q = parseQuery(sp);
      const where = Q.filters.filter((f) => !f.path.length).map((f) => f.sql('r', P));
      const rows = (await q(`SELECT r.* FROM ${call} r${where.length ? ' WHERE ' + where.join(' AND ') : ''}${orderSql(Q.order.get(''), 'r')}${Q.limit.get('') != null ? ' LIMIT ' + Q.limit.get('') : ''}`, P.vals)).rows;
      return fn.retset ? rows : rows[0] ?? null;
    }
    if (fn.rettype === 'void') {
      await q(`SELECT ${call}`, P.vals);
      return null;
    }
    return (await q(`SELECT ${call} AS v`, P.vals)).rows[0]?.v ?? null;
  });
}

// ======================= Auth =======================
type AuthUser = { id: string; email: string; password: string; meta: Record<string, unknown>; created_at: string };
const USERS = new Map<string, AuthUser>(); // email → user
const REFRESH = new Map<string, string>(); // refresh token → user id
function userJson(u: AuthUser) {
  return {
    id: u.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: u.email,
    email_confirmed_at: u.created_at,
    phone: '',
    confirmed_at: u.created_at,
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: u.meta,
    identities: [],
    created_at: u.created_at,
    updated_at: new Date().toISOString(),
    is_anonymous: false,
  };
}
function session(u: AuthUser) {
  const now = Math.floor(Date.now() / 1000);
  const access = signJwt({ sub: u.id, role: 'authenticated', aud: 'authenticated', email: u.email, iat: now, exp: now + 3600, user_metadata: u.meta });
  const refresh = crypto.randomBytes(16).toString('hex');
  REFRESH.set(refresh, u.id);
  return { access_token: access, token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, refresh_token: refresh, user: userJson(u) };
}
const byId = (id: string) => [...USERS.values()].find((u) => u.id === id);

async function handleAuth(path: string, method: string, sp: URLSearchParams, body: any, claims: Claims): Promise<[number, unknown]> {
  if (path === 'token') {
    const grant = sp.get('grant_type');
    if (grant === 'password') {
      const u = USERS.get(String(body.email ?? '').toLowerCase());
      if (!u || u.password !== body.password) return [400, { error: 'invalid_grant', error_description: 'Invalid login credentials', code: 'invalid_credentials', msg: 'Invalid login credentials' }];
      return [200, session(u)];
    }
    if (grant === 'refresh_token') {
      const id = REFRESH.get(body.refresh_token);
      const u = id && byId(id);
      if (!u) return [400, { error: 'invalid_grant', error_description: 'Invalid Refresh Token', code: 'refresh_token_not_found' }];
      return [200, session(u)];
    }
  }
  if (path === 'signup') {
    const email = String(body.email ?? '').toLowerCase();
    if (USERS.has(email)) return [422, { code: 'user_already_exists', msg: 'User already registered', error_code: 'user_already_exists' }];
    if (String(body.password ?? '').length < 6) return [422, { code: 'weak_password', msg: 'Password should be at least 6 characters.', error_code: 'weak_password' }];
    const u: AuthUser = { id: crypto.randomUUID(), email, password: body.password, meta: body.data ?? {}, created_at: new Date().toISOString() };
    await withTx({ role: 'service_role', sub: null }, async (q) => {
      await q(`RESET ROLE`);
      await q(`INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, email_confirmed_at) VALUES ($1, $2, $3, now(), now())`, [u.id, email, JSON.stringify(u.meta)]);
      const exists = (await q(`SELECT 1 FROM public.profiles WHERE id = $1`, [u.id])).rows.length;
      if (!exists) await q(`INSERT INTO public.profiles (id, username, full_name) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [u.id, (u.meta.username as string) ?? null, (u.meta.full_name as string) ?? null]);
    });
    USERS.set(email, u);
    return [200, session(u)];
  }
  if (path === 'user') {
    const u = claims.sub ? byId(claims.sub) : undefined;
    if (!u) return [401, { code: 'no_authorization', msg: 'This endpoint requires a valid Bearer token' }];
    if (method === 'PUT') {
      if (body.password) u.password = body.password;
      if (body.data) u.meta = { ...u.meta, ...body.data };
      if (body.email) u.email = body.email;
    }
    return [200, userJson(u)];
  }
  if (path === 'logout') return [204, null];
  if (path === 'recover') return [200, {}];
  if (path === 'settings') return [200, { external: { email: true, google: false }, disable_signup: false, mailer_autoconfirm: true }];
  return [404, { msg: 'not found' }];
}

// ======================= Storage =======================
const OBJECTS = new Map<string, { type: string; data: Buffer }>();

// ======================= HTTP =======================
function claimsOf(req: http.IncomingMessage): Claims {
  const auth = String(req.headers['authorization'] ?? '').replace(/^Bearer\s+/i, '');
  const p = auth ? verifyJwt(auth) : null;
  if (p?.role === 'authenticated' && p.sub) return { role: 'authenticated', sub: p.sub };
  return { role: 'anon', sub: null };
}

function send(res: http.ServerResponse, status: number, body: unknown, extra: Record<string, string> = {}) {
  const h: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS,HEAD',
    'Access-Control-Expose-Headers': 'Content-Range, Content-Location',
    ...extra,
  };
  if (body === null || body === undefined || status === 204) {
    res.writeHead(status, h);
    res.end();
    return;
  }
  if (Buffer.isBuffer(body)) {
    res.writeHead(status, h);
    res.end(body);
    return;
  }
  h['Content-Type'] = 'application/json; charset=utf-8';
  res.writeHead(status, h);
  res.end(JSON.stringify(body));
}

function pgError(e: any): ApiError {
  if (e instanceof ApiError) return e;
  const code = e?.code ?? 'XX000';
  const status = code === '42501' ? 403 : code === '23505' ? 409 : code === '23503' ? 409 : code.startsWith('22') || code.startsWith('23') ? 400 : code === 'P0001' ? 400 : code === '42883' ? 404 : 400;
  return new ApiError(status, code, e?.message ?? String(e), e?.detail ?? null, e?.hint ?? null);
}

const readBody = (req: http.IncomingMessage) =>
  new Promise<Buffer>((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, null);
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const parts = url.pathname.split('/').filter(Boolean);
  const raw = await readBody(req);
  let body: any = null;
  const ctype = String(req.headers['content-type'] ?? '');
  if (raw.length && ctype.includes('json')) {
    try {
      body = JSON.parse(raw.toString('utf8'));
    } catch {
      body = null;
    }
  }
  const claims = claimsOf(req);
  try {
    // ---- auth ----
    if (parts[0] === 'auth' && parts[1] === 'v1') {
      const [status, out] = await handleAuth(parts.slice(2).join('/'), req.method!, url.searchParams, body ?? {}, claims);
      return send(res, status, out);
    }
    // ---- rest ----
    if (parts[0] === 'rest' && parts[1] === 'v1') {
      if (parts[2] === 'rpc') {
        const args = req.method === 'GET' ? Object.fromEntries([...url.searchParams].filter(([k]) => !RESERVED.has(k))) : body ?? {};
        const out = await handleRpc(claims, parts[3], args, req.method === 'GET' ? new URLSearchParams() : url.searchParams);
        return send(res, 200, out);
      }
      const table = parts[2];
      const accept = String(req.headers['accept'] ?? '');
      const single = accept.includes('vnd.pgrst.object');
      if (req.method === 'GET' || req.method === 'HEAD') {
        const { rows, total, offset } = await handleRead(claims, table, url.searchParams, req.headers, req.method === 'HEAD');
        const extra: Record<string, string> = { 'Content-Range': `${rows.length ? `${offset}-${offset + rows.length - 1}` : '*'}/${total ?? '*'}` };
        if (single) {
          if (rows.length !== 1) return send(res, 406, { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: `The result contains ${rows.length} rows`, hint: null });
          return send(res, 200, rows[0], extra);
        }
        return send(res, 200, req.method === 'HEAD' ? null : rows, extra);
      }
      const { rows } = await handleWrite(claims, req.method!, table, url.searchParams, req.headers, body);
      const prefer = String(req.headers['prefer'] ?? '');
      if (!prefer.includes('return=representation')) return send(res, req.method === 'POST' ? 201 : 204, null);
      if (single) {
        if (rows.length !== 1) return send(res, 406, { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: `The result contains ${rows.length} rows`, hint: null });
        return send(res, req.method === 'POST' ? 201 : 200, rows[0]);
      }
      return send(res, req.method === 'POST' ? 201 : 200, rows);
    }
    // ---- storage ----
    if (parts[0] === 'storage' && parts[1] === 'v1') {
      const rest = parts.slice(2);
      if (rest[0] === 'object' && rest[1] === 'public') {
        const key = rest.slice(2).join('/');
        const o = OBJECTS.get(decodeURIComponent(key));
        if (!o) return send(res, 404, { error: 'not_found' });
        return send(res, 200, o.data, { 'Content-Type': o.type });
      }
      if (rest[0] === 'object' && (req.method === 'POST' || req.method === 'PUT')) {
        const key = decodeURIComponent(rest.slice(1).join('/'));
        OBJECTS.set(key, { type: ctype || 'application/octet-stream', data: raw });
        return send(res, 200, { Key: key, Id: crypto.randomUUID() });
      }
      if (rest[0] === 'object' && req.method === 'DELETE') return send(res, 200, []);
      return send(res, 200, []);
    }
    // ---- verify-challenge: المنطق الحقيقي (core.ts) على قاعدة PGlite ----
    if (parts[0] === 'functions' && parts[1] === 'v1' && parts[2] === 'verify-challenge') {
      const token = String(req.headers['authorization'] ?? '').replace(/^Bearer\s+/i, '');
      const svc = { role: 'service_role' as const, sub: null };
      const r = await handleVerify(
        {
          specs: CHALLENGE_SPECS,
          getUserId: async () => claims.sub,
          checkAccess: async (u, c) => {
            const d = await handleRpc(svc, 'challenge_access_check', { p_user_id: u, p_challenge_id: c }, new URLSearchParams());
            return { allowed: d?.allowed === true, required_course_id: d?.required_course_id ?? null };
          },
          countRecentSubmissions: (u, since) =>
            withTx(svc, async (q) => (await q(`SELECT count(*)::int n FROM challenge_submissions WHERE user_id = $1 AND created_at >= $2`, [u, since])).rows[0].n),
          recordSubmission: (a) =>
            handleRpc(svc, 'record_challenge_submission', {
              p_user_id: a.userId,
              p_challenge_id: a.challengeId,
              p_passed_tests: a.passedTests,
              p_total_tests: a.totalTests,
              p_all_passed: a.allPassed,
              p_code_sha256: a.codeSha256,
            }, new URLSearchParams()),
          rewardCoins: async (_t, challengeId, difficulty) => {
            try {
              return await handleRpc(claims, 'coins_reward_challenge', { p_challenge_id: challengeId, p_difficulty: difficulty }, new URLSearchParams());
            } catch {
              return { success: false, code: 'reward_failed' };
            }
          },
        },
        token,
        body
      );
      return send(res, r.status, r.body);
    }
    // ---- بقية الدوال → local-functions (ai-chat بـ Gemini وهمي) ----
    if (parts[0] === 'functions' && parts[1] === 'v1') {
      try {
        const r = await fetch(`${FUNCTIONS_URL}/${parts.slice(2).join('/')}${url.search}`, {
          method: req.method,
          headers: { 'content-type': ctype || 'application/json', authorization: String(req.headers['authorization'] ?? '') },
          body: req.method === 'GET' ? undefined : new Uint8Array(raw),
        });
        const buf = Buffer.from(await r.arrayBuffer());
        return send(res, r.status, buf, { 'Content-Type': r.headers.get('content-type') ?? 'application/json' });
      } catch {
        return send(res, 503, { error: 'local functions server not running' });
      }
    }
    if (parts[0] === 'health') return send(res, 200, { ok: true });
    return send(res, 404, { error: 'not found' });
  } catch (e) {
    const err = pgError(e);
    if (process.env.LOCAL_BACKEND_DEBUG) console.warn(`[${req.method} ${url.pathname}${url.search}]`, err.code, err.message);
    return send(res, err.status, { code: err.code, message: err.message, details: err.details, hint: err.hint });
  }
});

(async () => {
  env = await createEnv();
  await env.db.exec(`CREATE SCHEMA IF NOT EXISTS storage;
    CREATE TABLE IF NOT EXISTS storage.objects (id uuid DEFAULT gen_random_uuid(), bucket_id text, name text, owner uuid);
    CREATE TABLE IF NOT EXISTS storage.buckets (id text PRIMARY KEY, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    CREATE OR REPLACE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;`);
  const applied = await env.applyUpTo();
  await introspect();
  const accounts = await seed(env, signJwt);
  for (const a of accounts) USERS.set(a.email, { ...a, password: SEED_PASSWORD, created_at: new Date().toISOString() });
  server.listen(PORT, () => {
    console.log(`local backend on http://localhost:${PORT} — ${applied.length} migrations, ${COLS.size} relations, ${FNS.size} functions`);
    console.log(`LOCAL_ANON_KEY=${LOCAL_ANON_KEY}`);
    console.log(`seed accounts (password in scripts/dev/local-seed.ts): ${accounts.map((a) => a.email).join(', ')}`);
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

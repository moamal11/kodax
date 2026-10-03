import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
const db = new PGlite();
const U = '11111111-1111-1111-1111-111111111111', A = '22222222-2222-2222-2222-222222222222';
await db.exec(`
CREATE ROLE anon; CREATE ROLE authenticated;
CREATE SCHEMA auth; CREATE TABLE auth.cur (uid uuid); GRANT USAGE ON SCHEMA auth TO authenticated, anon; GRANT SELECT ON auth.cur TO authenticated, anon;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT uid FROM auth.cur LIMIT 1 $$;
CREATE TABLE user_roles (user_id uuid, role text);
CREATE FUNCTION is_admin(check_user_id uuid DEFAULT NULL) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = COALESCE(check_user_id, auth.uid()) AND role='admin') $$;
CREATE TABLE profiles (id uuid primary key, username text, xp int default 0, level int default 0, is_purchase_blocked boolean default false, updated_at timestamptz);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY sel ON profiles FOR SELECT USING (true);
CREATE POLICY upd ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY adm ON profiles FOR UPDATE USING (is_admin());
GRANT SELECT, UPDATE ON profiles TO authenticated;
INSERT INTO profiles (id, username, xp, is_purchase_blocked) VALUES ('${U}','u',100,true),('${A}','admin',0,false);
INSERT INTO user_roles VALUES ('${A}','admin');
CREATE FUNCTION update_user_xp(user_id uuid, xp_amount int) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> update_user_xp.user_id THEN RAISE EXCEPTION 'not allowed'; END IF;
  UPDATE profiles SET xp = COALESCE(xp,0)+xp_amount, level = FLOOR(SQRT((COALESCE(xp,0)+xp_amount)/100)), updated_at = now() WHERE id = update_user_xp.user_id;
END $$;
GRANT EXECUTE ON FUNCTION update_user_xp(uuid,int) TO authenticated;
`);
const sql = readFileSync(process.argv[2], 'utf8');
await db.exec(sql); await db.exec(sql); // idempotent
const fails = []; const check = (ok, m) => { console.log((ok?'OK   ':'FAIL ')+m); if(!ok) fails.push(m); };
const get = async (id) => (await db.query(`SELECT username, xp, level, is_purchase_blocked b FROM profiles WHERE id=$1`, [id])).rows[0];
await db.exec(`INSERT INTO auth.cur VALUES ('${U}'); SET ROLE authenticated;`);
await db.exec(`UPDATE profiles SET xp = 999999, level = 99, is_purchase_blocked = false, username = 'renamed' WHERE id = '${U}'`);
let p = await get(U);
check(p.xp === 100 && p.level === 0, 'user cannot set own xp/level directly');
check(p.b === true, 'user cannot clear is_purchase_blocked');
check(p.username === 'renamed', 'normal profile fields still editable');
await db.exec(`SELECT update_user_xp('${U}', 50)`);
p = await get(U);
check(p.xp === 150 && p.level === 1, 'update_user_xp (SECURITY DEFINER) still adds XP');
await db.exec(`RESET ROLE; UPDATE auth.cur SET uid = '${A}'; SET ROLE authenticated;`);
await db.exec(`UPDATE profiles SET is_purchase_blocked = false, xp = 10 WHERE id = '${U}'`);
p = await get(U);
check(p.b === false && p.xp === 10, 'admin can still change protected columns');
await db.exec(`RESET ROLE; UPDATE profiles SET xp = 77 WHERE id = '${U}'`);
check((await get(U)).xp === 77, 'service/owner role unaffected');
console.log(fails.length ? `${fails.length} FAILED` : 'ALL CHECKS PASSED'); process.exit(fails.length ? 1 : 0);

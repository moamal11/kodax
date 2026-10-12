import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { ALL_CHALLENGES } from '../../src/constants/courseData';
const qa = createRequire(import.meta.url)('../dev/live-profile-client.cjs');

async function main() {
  const { client } = qa.clients();
  const api = client();
  const account = JSON.parse(readFileSync('.env.community-social-qa.local','utf8')).accounts[0];
  const session = await qa.login(api, account);
  assert.equal(session.user.id,account.id,'Must use isolated QA identity');
  const rows: unknown[] = [];
  for (const [id, wrong] of [['js-ch-beg-1',false],['js-ch-int-1',false],['cpp-ch-beg-1',false],['cpp-ch-int-1',false],['js-ch-beg-1',true],['cpp-ch-beg-1',true]] as const) {
    const c = ALL_CHALLENGES.find(c=>c.id===id)!;
    const code = wrong ? (c.language==='JavaScript' ? 'function sum(a,b){return -999;}' : 'int sum(int a,int b){return -999;}') : c.solution;
    const start = Date.now();
    // Same request contract as existing Android builds; no new client fields.
    const {data,error} = await api.functions.invoke('verify-challenge',{body:{challengeId:id,code}});
    const failure = error?.context ? await error.context.clone().json().catch(()=>null) : null;
    const row = {id,wrong,status:error?.context?.status??200,verified:data?.verified,passed:data?.passedTests,total:data?.totalTests,ms:Date.now()-start,failure};
    rows.push(row); console.log(JSON.stringify(row));
    if (error || data?.verified !== !wrong) throw new Error(JSON.stringify(row));
    await new Promise(resolve=>setTimeout(resolve,3000));
  }
  const dir = 'reports/challenge-batch-20261012';
  mkdirSync(dir,{recursive:true}); writeFileSync(`${dir}/production.json`,JSON.stringify(rows,null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});

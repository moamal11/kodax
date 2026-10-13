import assert from 'node:assert/strict';
import { executeSnippet } from '../../src/services/snippetExecution';

async function main() {
  let r = await executeSnippet('javascript', 'console.log(Number(prompt("a"))+Number(prompt("b")));', '19\n23\n');
  assert.equal(r.success,true); assert.equal(r.output,'42');
  r = await executeSnippet('javascript','const prompt=()=>"custom"; console.log(prompt());','ignored');
  assert.equal(r.output,'custom');
  r = await executeSnippet('javascript','console.log("before"); throw new Error("failure");','');
  assert.equal(r.success,false); assert.equal(r.output,'before'); assert.equal(r.error,'failure');
  const original=globalThis.fetch;
  const requests:any[]=[];
  try {
    globalThis.fetch=(async (_url,init)=>{
      requests.push(JSON.parse(String(init?.body)));
      return Response.json({status:'0',program_output:'42\n'});
    }) as typeof fetch;
    await executeSnippet('python','print(input()); print(input()); print(input())','مؤمل\n\n42\n');
    assert.equal(requests.at(-1).stdin,'مؤمل\n\n42\n');
    await executeSnippet('javascript',"const fs=require('fs'); console.log(fs.readFileSync(0,'utf8'));",'42\n');
    assert.equal(requests.at(-1).compiler,'nodejs-20.17.0'); assert.equal(requests.at(-1).stdin,'42\n');
    await executeSnippet('typescript','const n: number=Number(prompt("n")); console.log(n);','42\n');
    assert.equal(requests.at(-1).compiler,'typescript-5.6.2');
    assert(requests.at(-1).code.startsWith('export {};')); assert.equal(requests.at(-1).stdin,'42\n');
  } finally {globalThis.fetch=original;}
  console.log('Published runner: JS prompt, preserved custom prompt, error after output, Python multiline/blank/Unicode stdin, Node stdin and typed TypeScript passed');
}
main().catch(e=>{console.error(e);process.exitCode=1;});

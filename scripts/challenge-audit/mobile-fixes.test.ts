import assert from 'node:assert/strict';
import { leaderboardPreview } from '../../src/utils/leaderboardPreview';
import { keyboardOverlapForFrame } from '../../src/utils/keyboardGeometry';
import { needsEditorInput, needsNodeInputRuntime, promptFromInput, codeWithPromptInput } from '../../src/services/editorInput';
import { executeCode } from '../../src/services/codeExecution';
async function main() {
  const users=Array.from({length:50},(_,i)=>({id:String(i+1),xp:1000-i}));
  for (const n of [1,4,5,6,49,50,51]) {
    const me={id:String(n),xp:1000-n};
    const rows=leaderboardPreview(users,me);
    assert.equal(rows.length,5);
    assert.equal(rows.filter(r=>r.id===me.id).length,1);
    assert.equal(rows.find(r=>r.id===me.id)!.previewRank,n<=50?n:null);
    if(n>5) assert.deepEqual(rows.slice(0,4).map(r=>r.id),['1','2','3','4']);
  }
  assert.deepEqual(leaderboardPreview([],users[0]),[],'A failed/empty ranking must not label the viewer unranked');
  assert.equal(leaderboardPreview(users).length,5);
  assert.equal(keyboardOverlapForFrame(0,800,500),300,'Edge-to-edge window needs keyboard compensation');
  assert.equal(keyboardOverlapForFrame(0,500,500),0,'Already resized windows must not receive double compensation');
  assert.equal(keyboardOverlapForFrame(40,760,500),300);
  assert.equal(keyboardOverlapForFrame(0,800,NaN),0);
  for (const code of ['name=input("name")','std::cin >> x;','scanf("%d", &x);','scanner.nextInt();','const n=prompt("name");',"require('fs').readFileSync(0,'utf8')"]) assert.equal(needsEditorInput(code),true,code);
  assert.equal(needsNodeInputRuntime("require('fs').readFileSync(0,'utf8')"),true);
  assert.equal(needsNodeInputRuntime('console.log(prompt("name"));'),false);
  const prompt=promptFromInput('أحمد\r\n\r\n25\r\n');
  assert.equal(prompt(),'أحمد');assert.equal(prompt(),'');assert.equal(prompt(),'25');assert.equal(prompt(),null);
  assert.equal(promptFromInput('')(),null);
  assert.equal(promptFromInput('\n')(),'');
  assert.equal(new Function(codeWithPromptInput('return Number(prompt("number"))+1;', '41\n'))(),42);
  assert.equal(codeWithPromptInput('const prompt=()=>"custom";', 'input'),'const prompt=()=>"custom";');
  let observed:any;
  const original=globalThis.fetch;
  try {
    globalThis.fetch=async (_url,options)=>{observed=JSON.parse(String(options?.body));return new Response(JSON.stringify({status:'0',program_output:'ok\n'}),{status:200});};
    await executeCode({language:'python',code:'print(input())',input:'أحمد\n25\n'});
    assert.equal(observed.stdin,'أحمد\n25\n');
    await executeCode({language:'java',code:'public class Main { public static void main(String[] a) {} }',input:'42\n'});
    assert.equal(observed.stdin,'42\n');assert.match(observed.code,/^class Main/);
  } finally {globalThis.fetch=original;}
  console.log('PASS: actual ranking positions, unknown rank, keyboard overlap, multiline/blank/Unicode/EOF inputs and provider payload');
  if (process.argv.includes('--live')) {
    const cases=[
      {language:'python',code:'name=input()\nn=int(input())\nprint(name, n+1)',input:'Kodax\n41\n',expected:'Kodax 42'},
      {language:'cpp',code:'#include <iostream>\nint main(){int a,b;std::cin>>a>>b;std::cout<<a+b;}',input:'19 23\n',expected:'42'},
      {language:'java',code:'import java.util.*;\npublic class Main {public static void main(String[] args){Scanner s=new Scanner(System.in);System.out.println(s.nextInt()+s.nextInt());}}',input:'19\n23\n',expected:'42'},
      {language:'javascript',code:"const fs=require('fs'); const values=fs.readFileSync(0,'utf8').trim().split(/\\s+/).map(Number); console.log(values[0]+values[1]);",input:'19\n23\n',expected:'42'},
      {language:'typescript',code:codeWithPromptInput('const n: number=Number(prompt("number")); console.log(n+1);','41\n','typescript'),input:'41\n',expected:'42'},
    ];
    for (const c of cases) {const r=await executeCode(c);console.log(JSON.stringify({language:c.language,success:r.success,output:r.output,error:r.error}));assert.equal(r.success,true);assert.equal(r.output?.trim(),c.expected);}
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});

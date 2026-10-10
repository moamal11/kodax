const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const roots=['src/features/community','app/discussion','app/message'];
const files=roots.flatMap(d=>fs.readdirSync(d).filter(x=>x.endsWith('.tsx')).map(x=>path.join(d,x))),hits=[];
for(const file of files){let source=fs.readFileSync(file,'utf8'),changes=[];const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function walk(n){if(ts.isJsxText(n)){const text=source.slice(n.pos,n.end);if(/^[ \t]+$/.test(text)){const parent=n.parent,tag=ts.isJsxElement(parent)?parent.openingElement.tagName.getText(sf):'';if(tag!=='Text'){changes.push([n.pos,n.end]);hits.push({file,line:sf.getLineAndCharacterOfPosition(n.pos).line+1,tag});}}}ts.forEachChild(n,walk);}walk(sf);
 if(process.argv.includes('--fix')){for(const [start,end]of changes.sort((a,b)=>b[0]-a[0]))source=source.slice(0,start)+source.slice(end);if(changes.length)fs.writeFileSync(file,source);}
}console.log(JSON.stringify(hits,null,2));if(hits.length&&!process.argv.includes('--fix'))process.exitCode=1;

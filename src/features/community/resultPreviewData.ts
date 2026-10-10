/** Passive previews never evaluate member code or invent a result for dynamic programs. */
export function webResultDocument(code:string){
  const policy="default-src 'none'; script-src 'none'; style-src 'unsafe-inline' https:; img-src https: data:; font-src https: data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
  const cleaned=code.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'').replace(/<meta\b[^>]*http-equiv\s*=\s*["']?refresh[^>]*>/gi,'').replace(/<base\b[^>]*>/gi,'');
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html{background:white;color:#111}body{margin:0}*{box-sizing:border-box}</style></head><body>${cleaned}</body></html>`;
}
type Value=string|number|boolean|null;
export function literalProgramOutput(code:string,language:string):string|null{
  if(code.length>20000)return null;
  const py=language==='python',js=['javascript','typescript'].includes(language);if(!py&&!js)return null;
  if(py&&code.split('\n').some(line=>/^[ \t]+\S/.test(line)&&!/^[ \t]*#/.test(line)))return null;
  const vars=new Map<string,Value>(),output:string[]=[];
  const tokens:string[]=[];let i=0;
  // Recognize a deliberately small straight-line grammar. Unknown syntax rejects the whole preview.
  while(i<code.length){const s=code.slice(i);const ws=s.match(/^[ \t\r]+/);if(ws){i+=ws[0].length;continue;}
    if((py&&s.startsWith('#'))||(!py&&s.startsWith('//'))){const end=s.indexOf('\n');i+=end<0?s.length:end;continue;}
    const token=s.match(/^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\d+(?:\.\d+)?|[A-Za-z_]\w*|[\n;(),.=+\-*/%])/);if(!token)return null;tokens.push(token[0]);i+=token[0].length;if(tokens.length>2000)return null;}
  let pos=0;const next=()=>tokens[pos++],peek=()=>tokens[pos];
  const need=(s:string)=>{if(next()!==s)throw Error('unsupported');};
  const stringify=(v:Value)=>{if(py&&typeof v==='number'&&!Number.isSafeInteger(v))throw Error('unsupported');return v===null?(py?'None':'null'):typeof v==='boolean'?(py?v?'True':'False':String(v)):String(v);};
  function atom():Value{const t=next();if(!t)throw Error('unsupported');if(t==='('){const v=expr();need(')');return v;}if(t==='-'||t==='+'){const v=atom();if(typeof v!=='number')throw Error('unsupported');return t==='-'?-v:v;}if(/^\d/.test(t)){const n=Number(t);if(/^0\d/.test(t)||(py&&(t.includes('.')||!Number.isSafeInteger(n))))throw Error('unsupported');return n;}if(t[0]==='"'){if(py&&t.includes('\\/'))throw Error('unsupported');return JSON.parse(t);}if(t[0]==="'"){if(/[\r\n]/.test(t)||/\\(?![\\'"nrt])/.test(t))throw Error('unsupported');return t.slice(1,-1).replace(/\\([\\'"nrt])/g,(_,c)=>(({n:'\n',r:'\r',t:'\t'} as Record<string,string>)[c]||c));}if(t===(py?'True':'true'))return true;if(t===(py?'False':'false'))return false;if(t===(py?'None':'null'))return null;if(vars.has(t))return vars.get(t)!;throw Error('unsupported');}
  function mul():Value{let a=atom();while(['*','/','%'].includes(peek())){const op=next(),b=atom();if(typeof a!=='number'||typeof b!=='number'||(b===0&&op!=='*')||(py&&(op==='/'||(op==='%'&&(a<0||b<0)))))throw Error('unsupported');a=op==='*'?a*b:op==='/'?a/b:a%b;}return a;}
  function expr():Value{let a=mul();while(['+','-'].includes(peek())){const op=next(),b=mul();if(op==='+'&&typeof a==='string'&&typeof b==='string')a+=b;else if(typeof a==='number'&&typeof b==='number')a=op==='+'?a+b:a-b;else throw Error('unsupported');}return a;}
  try{while(pos<tokens.length){if(['\n',';'].includes(peek())){next();continue;}const declared=!py&&['const','let','var'].includes(peek());if(declared)next();const name=next();if(declared&&name==='console')throw Error('unsupported');if((py&&name==='print')||(js&&name==='console')){if(js){need('.');need('log');}need('(');const args:Value[]=[];if(peek()!==')'){args.push(expr());while(peek()===','){next();args.push(expr());}}need(')');if(output.length<20)output.push(args.map(stringify).join(' '));}else{if((js&&!declared)||!/^[A-Za-z_]\w*$/.test(name)||['console','print','undefined','NaN','Infinity','class','return','if','else','def','for','while','import','from','pass','break','continue','True','False','None','true','false','null','await','yield','const','let','var','function','try','catch','finally','throw','new','delete','in','is','and','or','not','as','with','raise','assert','global','nonlocal','lambda','del','except','async','__debug__','elif','do','switch','case','default','export','extends','super','enum','this','instanceof','typeof','void','implements','interface','package','private','protected','public','static','arguments','eval'].includes(name)||vars.has(name))throw Error('unsupported');need('=');vars.set(name,expr());}if(pos<tokens.length&&!['\n',';'].includes(peek()))throw Error('unsupported');}
    if(py&&[...vars.values()].some(v=>typeof v==='number'&&!Number.isSafeInteger(v)))return null;return output.length?output.join('\n').slice(0,1200):null;
  }catch{return null;}
}

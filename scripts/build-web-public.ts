import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {staticDocuments} from '../src/features/web/catalog';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from '../src/constants';
const require=createRequire(path.resolve('scripts/build-web-public.ts')),{decorateHead,decorate,urlset,ORIGIN}=require('../web-server/render.cjs');
const out=path.resolve(process.env.KODAX_WEB_OUT||'dist');
// Avoid a static sitemap shadowing Vercel's dynamic sitemap index.
for(const name of ['sitemap.xml','sitemap-0.xml']){
 const file=path.join(out,name);if(fs.existsSync(file))fs.unlinkSync(file);
}
// Clean-URL destinations reserve creation screens before dynamic public records.
for(const [from,to] of [['code/add.html','code-create.html'],['discussion/new.html','discussion-create.html']]){
 const source=path.join(out,from);if(fs.existsSync(source))fs.copyFileSync(source,path.join(out,to));
}
const docs=staticDocuments();
const generated=path.resolve('web-server/generated');fs.mkdirSync(generated,{recursive:true});
// Only shared, public build artefacts are placed in the function bundle.
const templates:Record<string,string>={};
for(const kind of ['user','code','discussion','field','course','lesson','challenge']){
 const candidates=[path.join(out,kind,'[id].html'),path.join(out,kind,'[id]','index.html'),path.join(out,'index.html')];
 const file=candidates.find(f=>fs.existsSync(f));if(!file)throw new Error('Missing Expo HTML template for '+kind);
 templates[kind]=fs.readFileSync(file,'utf8');
}
fs.writeFileSync(path.join(generated,'catalog.json'),JSON.stringify(docs));
fs.writeFileSync(path.join(generated,'templates.json'),JSON.stringify(templates));
fs.writeFileSync(path.resolve('web-server/public-config.cjs'),'module.exports='+JSON.stringify({url:SUPABASE_URL,key:SUPABASE_ANON_KEY})+';\n');
for(const doc of docs){if(!/^\/(field|course|lesson|challenge)\//.test(doc.path))continue;const kind=doc.path.split('/')[1];const file=path.join(out,doc.path.slice(1)+'.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,decorate(templates[kind],doc));}
for(const doc of docs.filter(d=>['/','/learn','/challenges','/code','/people','/download','/about'].includes(d.path))){const file=path.join(out,doc.path==='/'?'index.html':doc.path.slice(1)+'.html');if(fs.existsSync(file))fs.writeFileSync(file,decorate(fs.readFileSync(file,'utf8'),doc));}
for(const doc of docs.filter(d=>['/privacy','/terms','/delete-account'].includes(d.path))){
 for(const file of [path.join(out,doc.path.slice(1)+'.html'),path.join(out,doc.path.slice(1),'index.html')])if(fs.existsSync(file))fs.writeFileSync(file,decorateHead(fs.readFileSync(file,'utf8'),doc));
}
// Private HTML is never an indexable login shell.
function visit(dir:string){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())visit(file);else if(entry.name.endsWith('.html')){const rel='/'+path.relative(out,file).replace(/\\/g,'/').replace(/(?:\/index)?\.html$/,'');const isPublic=docs.some(d=>d.path===rel||rel==='/index'&&d.path==='/')||/^\/(user|code|discussion)\/\[id\]$/.test(rel)||rel==='/certificate/verify'||rel.startsWith('/privacy/')||rel.startsWith('/terms/');if(!isPublic){let text=fs.readFileSync(file,'utf8');text=text.replace(/<meta name="robots"[^>]*>/g,'<meta name="robots" content="noindex,follow">');fs.writeFileSync(file,text);}}}}
visit(out);
fs.writeFileSync(path.join(out,'sitemap-static.xml'),urlset(docs));
fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);
fs.writeFileSync(path.join(generated,'build.json'),JSON.stringify({generatedAt:new Date().toISOString(),publicPages:docs.length,counts:docs.reduce((r:any,d)=>{const kind=d.path.split('/')[1]||'home';r[kind]=(r[kind]||0)+1;return r;},{})},null,2));
console.log('Public web pages prepared:',docs.length);

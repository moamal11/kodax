/** Public review gateway: serves only the QA export/screenshots, with the local mock API on the same origin. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve('reports/redesign/continuation/web-build');
const shots = path.resolve('reports/redesign/continuation');
const originFile = process.argv[2];
const port = Number(process.argv[3] || 8104);
const galleryOnly = process.argv.includes('--gallery-only');
if (!originFile) throw Error('Pass a file containing the public HTTPS origin');
const mime = {'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.woff2':'font/woff2','.json':'application/json','.svg':'image/svg+xml','.ico':'image/x-icon'};
const escape = s => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function gallery(){
 const sections = ['phone','desktop','light'].map(size=>{
  const names=fs.readdirSync(path.join(shots,size)).filter(n=>/^[a-z-]+\.png$/.test(n)&&!n.startsWith('review-'));
  return `<h2>${size}</h2><div class="grid">`+names.map(n=>`<figure><a href="/review-images/${size}/${n}"><img loading="lazy" src="/review-images/${size}/${n}" alt="Kodax ${size} ${escape(n.slice(0,-4))}"></a><figcaption>${escape(n.slice(0,-4))} · <a href="/review-images/${size}/${n}">Full image</a></figcaption></figure>`).join('')+'</div>';
 }).join('');
 return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kodax UI review</title><style>body{background:#0e0e16;color:#eee;font:16px system-ui;margin:24px}a{color:#bc9bff}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}figure{margin:0;padding:12px;background:#181822;border-radius:12px}img{width:100%;max-height:650px;object-fit:contain;object-position:top}figcaption{padding-top:12px}h1{font-size:28px}code{background:#242432;padding:3px}</style><h1>Kodax website and app UI review</h1><p>This page provides real screenshots of the current build for reviewers and AI tools that cannot execute JavaScript. All displayed accounts and certificates are fictional QA fixtures.</p>${galleryOnly ? '<p>This public preview is a static screenshot gallery.</p>' : '<p><a href="/download">Open interactive website</a> · <a href="/login">Sign in</a></p><p>Demo login: <code>qa@kodax.local</code> · Password: <code>kodax-local-123</code>. Learning, community and certificates use the local QA backend; AI answers are mocked.</p>'}${sections}</html>`;
}
http.createServer((req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost'), pathname=decodeURIComponent(url.pathname);
  if (galleryOnly && pathname !== '/review' && pathname !== '/review/' && !pathname.startsWith('/review-images/')) { res.writeHead(404); res.end('This public preview contains design screenshots only. Open /review.'); return; }
  if (/^\/(auth|rest|functions|storage)\/v1(?:\/|$)/.test(pathname)) {
   const headers={...req.headers,host:'localhost:54321'};
   const proxy=http.request({hostname:'127.0.0.1',port:54321,path:req.url,method:req.method,headers},up=>{res.writeHead(up.statusCode,up.headers);up.pipe(res)});
   proxy.on('error',()=>{res.writeHead(502,{'content-type':'application/json'});res.end('{"error":"QA backend unavailable"}')});req.pipe(proxy);return;
  }
  if (pathname==='/review'||pathname==='/review/') {res.writeHead(200,{'content-type':mime['.html'],'cache-control':'no-store'});res.end(gallery());return;}
  let file;
  if (pathname.startsWith('/review-images/')) {
   const m=pathname.match(/^\/review-images\/(phone|desktop|light)\/([a-z-]+\.png)$/);
   if(!m){res.writeHead(404);res.end();return;}file=path.join(shots,m[1],m[2]);
  } else {
   const resolved=path.resolve(root,'.'+pathname);
   if(resolved!==root&&!resolved.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
   file=[resolved,resolved+'.html',path.join(resolved,'index.html')].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile())||path.join(root,'index.html');
  }
  if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  const ext=path.extname(file);res.setHeader('content-type',mime[ext]||'application/octet-stream');res.setHeader('cache-control','no-store');
  if(ext==='.js'){
   const origin=fs.existsSync(originFile)?fs.readFileSync(originFile,'utf8').trim():'';
   if(!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(origin)){res.writeHead(503);res.end('Public origin not ready');return;}
   const body = fs.readFileSync(file,'utf8').replaceAll('http://localhost:54321',origin);
   res.setHeader('vary','Accept-Encoding');
   if (/gzip/.test(req.headers['accept-encoding'] || '')) { res.setHeader('content-encoding','gzip'); res.end(zlib.gzipSync(body)); } else res.end(body);
  } else fs.createReadStream(file).pipe(res);
 }catch(e){res.writeHead(500);res.end('Preview error');console.error(e.message);}
}).listen(port,'127.0.0.1',()=>console.log(`Review gateway ready on http://127.0.0.1:${port}`));

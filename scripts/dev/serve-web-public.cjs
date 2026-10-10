const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),api=require('../../api/public-page.js');
const root=path.resolve(process.argv[2]||'output/web-public-20261010'),port=Number(process.argv[3]||8143);
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.xml':'application/xml','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ttf':'font/ttf','.ico':'image/x-icon'};
http.createServer(async(req,res)=>{let url;try{url=new URL(req.url,'http://localhost');}catch{res.writeHead(400).end();return;}
 if(url.pathname==='/sitemap.xml'){req.query={kind:'sitemap',key:'index'};return api(req,res);}
 const sitemap=url.pathname.match(/^\/sitemap-(user|code|discussion)-(\d+)\.xml$/);if(sitemap){req.query={kind:'sitemap',key:sitemap[1]+'-'+sitemap[2]};return api(req,res);}
 const m=url.pathname.match(/^\/(user|code|discussion|field|course|lesson|challenge)\/([^/]+)$/);if(m&&!['add','new'].includes(m[2])){req.query={kind:m[1],key:decodeURIComponent(m[2])};return api(req,res);}
 const key=decodeURIComponent(url.pathname);const file=path.resolve(root,'.'+key);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 const found=[file,file+'.html',path.join(file,'index.html')].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile());if(!found){res.writeHead(404,{'X-Robots-Tag':'noindex'}).end('Not found');return;}
 res.writeHead(200,{'Content-Type':types[path.extname(found)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(found).pipe(res);
}).listen(port,()=>console.log('Public Web review: http://localhost:'+port));

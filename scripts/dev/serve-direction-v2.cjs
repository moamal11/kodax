const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve('reports/visual-direction-v2');
http.createServer((req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{return res.writeHead(400).end()}
  if(pathname==='/')pathname='/kodax-welcome-v2.html';
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  if(!fs.existsSync(file)||!fs.statSync(file).isFile())return res.writeHead(404).end();
  const type={'.html':'text/html; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.md':'text/plain; charset=utf-8'}[path.extname(file)]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);
}).listen(8113,'127.0.0.1',()=>console.log('Local direction preview http://localhost:8113'));

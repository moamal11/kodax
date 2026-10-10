/**
 * خادم ملفات ثابتة لنسخة الويب المصدّرة (expo export) مع رجوع SPA إلى index.html.
 *   node scripts/dev/serve-static.cjs <dir> [port]
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const port = Number(process.argv[3] || process.env.PORT || 8096);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.webp': 'image/webp', '.map': 'application/json' };

http
  .createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    let file = path.join(root, url);
    if (!file.startsWith(root)) return res.writeHead(403).end();
    const candidates = [file, file + '.html', path.join(file, 'index.html')];
    let found = candidates.find((f) => fs.existsSync(f) && fs.statSync(f).isFile());
    if (!found) found = path.join(root, 'index.html');
    if (!fs.existsSync(found)) return res.writeHead(503, { 'Retry-After': '2' }).end('Preview build is being prepared');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(found)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    const stream = fs.createReadStream(found);
    stream.on('error', () => { if (!res.headersSent) res.writeHead(404); res.end(); });
    stream.pipe(res);
  })
  .listen(port, () => console.log(`static ${root} on http://localhost:${port}`));

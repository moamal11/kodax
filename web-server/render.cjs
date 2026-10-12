const {landingBody,landingCSS}=require('./landing.cjs');
const ORIGIN='https://www.kodax.app';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=x=>JSON.stringify(x).replace(/</g,'\\u003c');
function markdown(text){
 let fence=false,out='',code=[];
 for(const line of String(text||'').split(/\r?\n/)){
  if(/^\s*```/.test(line)){if(fence){out+=`<pre dir="ltr"><code>${esc(code.join('\n'))}</code></pre>`;code=[];}fence=!fence;continue;}
  if(fence){code.push(line);continue;}
  const h=line.match(/^(#{1,4})\s+(.+)/);if(h){const n=Math.min(4,h[1].length+1);out+=`<h${n}>${esc(h[2])}</h${n}>`;continue;}
  if(!line.trim())continue;
  const s=esc(line).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code dir="ltr">$1</code>');
  out+=`<p>${s}</p>`;
 }
 if(code.length)out+=`<pre dir="ltr"><code>${esc(code.join('\n'))}</code></pre>`;
 return out;
}
function meta(doc){
 const title=doc.title.startsWith('Kodax')?doc.title:doc.title+' | Kodax',url=ORIGIN+doc.path,image=doc.image&&/^https:\/\//.test(doc.image)?doc.image:ORIGIN+'/icon-512.png';
 const schema={'@context':'https://schema.org','@type':doc.type==='course'?'Course':doc.type==='post'?'CreativeWork':'WebPage',name:doc.title,description:doc.description,url,inLanguage:'ar',...(doc.type==='course'?{provider:{'@type':'Organization',name:'Kodax',url:ORIGIN}}:{})};
 const crumbs=doc.breadcrumbs?.length?{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{path:'/',title:'Kodax'},...doc.breadcrumbs,{path:doc.path,title:doc.title}].map((l,i)=>({'@type':'ListItem',position:i+1,name:l.title,item:ORIGIN+l.path}))}:null;
 return `<title>${esc(title)}</title><meta name="description" content="${esc(doc.description.slice(0,170))}"><meta name="robots" content="index,follow"><link rel="canonical" href="${esc(url)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(doc.description.slice(0,170))}"><meta property="og:type" content="${doc.type==='post'?'article':'website'}"><meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(doc.description.slice(0,170))}"><meta name="twitter:image" content="${esc(image)}"><script id="kx-structured-data" type="application/ld+json">${json(crumbs?[schema,crumbs]:schema)}</script>`;
}
function body(doc){if(doc.path==='/')return landingBody(doc);return `<main id="kx-public-content" dir="rtl"><header><a class="brand" href="/">Kodax</a><nav><a href="/learn">تعلّم</a><a href="/challenges">التحديات</a><a href="/code">المجتمع</a><a href="/login">تسجيل الدخول</a></nav></header><article>${doc.breadcrumbs?.length?`<nav class="breadcrumbs">${doc.breadcrumbs.map(l=>`<a href="${esc(l.path)}">${esc(l.title)}</a>`).join(' · ')}</nav>`:''}<h1>${esc(doc.title)}</h1>${doc.author?`<p>${esc(doc.author)}</p>`:''}${doc.image&&/^https:\/\//.test(doc.image)?`<img alt="" class="avatar" src="${esc(doc.image)}">`:''}${markdown(doc.body||doc.description)}${doc.code?`<pre dir="ltr"><code>${esc(doc.code)}</code></pre>`:''}${doc.requirement?`<p class="requirement">${esc(doc.requirement)}</p>`:''}${doc.links?.length?`<nav class="content-links">${doc.links.map(l=>`<a href="${esc(l.path)}">${esc(l.title)}</a>`).join('')}</nav>`:''}${doc.type==='lesson'||doc.type==='challenge'?`<a class="primary" href="/login?returnTo=${encodeURIComponent(doc.path)}">${doc.type==='lesson'?'اختبر فهمك':'ابدأ الحل'}</a>`:''}</article></main>`;}
const css=`#kx-public-content{position:fixed;inset:0;z-index:9999;overflow:auto;background:#0e0e15;color:#f0eff5;font:16px/1.85 'IBMPlexSansArabic_400Regular',Tahoma,sans-serif;padding:0 20px}#kx-public-content header{max-width:1120px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:18px 0;border-bottom:1px solid #303040}#kx-public-content a{color:#c4aff4;text-decoration:none}#kx-public-content header nav{display:flex;gap:18px;flex-wrap:wrap}#kx-public-content .brand{font-weight:bold;font-size:28px;color:#fff}#kx-public-content article{max-width:820px;margin:30px auto 70px}#kx-public-content h1{font-size:32px;line-height:1.5}#kx-public-content h2{font-size:25px}#kx-public-content p{white-space:pre-wrap;overflow-wrap:anywhere}#kx-public-content pre{background:#171720;color:#eee;border:1px solid #303040;padding:18px;overflow:auto;border-radius:12px;text-align:left;font-size:14px;line-height:1.7}#kx-public-content .content-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin:24px 0}#kx-public-content .content-links a{padding:12px 16px;border:1px solid #353044;border-radius:10px}#kx-public-content .primary{display:inline-block;background:#7c3aed;color:white;padding:10px 24px;border-radius:12px}#kx-public-content .avatar{width:88px;height:88px;border-radius:50%;object-fit:cover}#kx-public-content .requirement{border-right:3px solid #a68952;padding:8px 14px;color:#d0c5ad}@media(max-width:420px){#kx-public-content h1{font-size:26px}#kx-public-content header nav{gap:12px;font-size:14px}}`;
function decorateHead(template,doc){
 let html=template.replace(/<script id="kx-structured-data"[^>]*>[\s\S]*?<\/script>/g,'').replace(/<title>[\s\S]*?<\/title>/gi,'').replace(/<meta\b[^>]*(?:name=["'](?:description|robots|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi,'').replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
 return html.replace('</head>',meta(doc)+'</head>');
}
function decorate(template,doc){
 template=template.replace(/<main id="kx-public-content"[\s\S]*?<\/main>/g,'').replace(/<style>#kx-public-content[\s\S]*?<\/style>/g,'').replace(/<script(?: id="kx-public-session-check")?>\(function\(\)\{try\{var s=JSON.parse\(localStorage.getItem\('sb-krtulodnhmfuoxjqajwl-auth-token'[\s\S]*?<\/script>/g,'');
 let html=decorateHead(template,doc).replace('</head>',`<style>${css}${doc.path==='/'?landingCSS:''}</style></head>`);
 const preference=`<script id="kx-public-session-check">(function(){try{var s=JSON.parse(localStorage.getItem('sb-krtulodnhmfuoxjqajwl-auth-token')||'null');if(s&&s.user&&s.expires_at>Date.now()/1000)document.getElementById('kx-public-content').remove();}catch(e){}})();</script>`;
 return html.replace(/<body([^>]*)>/i,(_,attrs)=>`<body${attrs}>${body(doc)}${preference}`);
}
function urlset(entries){return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(e=>`<url><loc>${esc(ORIGIN+e.path)}</loc>${e.updated?`<lastmod>${esc(new Date(e.updated).toISOString())}</lastmod>`:''}</url>`).join('')}</urlset>`;}
module.exports={esc,markdown,meta,body,decorateHead,decorate,urlset,ORIGIN};

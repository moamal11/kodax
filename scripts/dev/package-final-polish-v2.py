from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json,base64,datetime,subprocess,os,html,zipfile,shutil
root=Path.cwd();out=root/'reports/visual-polish-v2-final';gallery=out/'gallery';gallery.mkdir(exist_ok=True)
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads((out/p).read_text(encoding='utf-8'))
web=read('web/checks.json');details=read('details/checks.json');native=read('android/checks.json')
assert len(web['results'])==34 and all(x['ok'] for x in web['results']) and not web['errors']
tablet=[r for r in web['results'] if r['size']=='tablet'];assert len(tablet)==19 and all((r['width'],r['height'])==(900,900) for r in tablet)
assert len(details)==29 and all(c['ok'] for c in details) and all(c['ok'] for c in native)
(out/'tablet-900').mkdir(exist_ok=True)
(out/'tablet-900/checks.json').write_text(json.dumps({**web,'results':tablet},ensure_ascii=False,indent=2),encoding='utf-8')
for p in (out/'web').glob('tablet-*.png'):shutil.copy2(p,out/'tablet-900'/p.name)
files=sorted([p for directory in ['app','src'] for p in (root/directory).rglob('*') if p.suffix in ['.ts','.tsx','.js','.json']]+[root/'app.json',root/'package.json',root/'index.ts'])
source={str(p.relative_to(root)).replace('\\','/'):digest(p) for p in files};build=out/'verified-web-build';bundle={str(p.relative_to(build)).replace('\\','/'):digest(p) for p in (build/'_expo/static/js/web').glob('*.js')}
version={'reviewId':'KODAX-UI-V2-POLISH-20261009','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'configVersion':'1.2.0','gitHead':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'uncommitted':True,'sourceDigest':hashlib.sha256(json.dumps(source,sort_keys=True).encode()).hexdigest(),'web':{'url':'http://localhost:8109','build':'reports/visual-polish-v2-final/verified-web-build','sizes':[[320,740],[390,844],[900,900],[1440,900]],'bundleSha256':bundle},'android':{'container':'Expo Development Client','installedVersion':'1.1.0 / code 1','package':'com.kodax.app','device':'emulator-5554','android':'17 / API 37','pixels':[1080,1920],'densityDpi':420,'fontScales':[1,1.6],'preparedMetroBundleSha256':digest(Path(os.environ['TEMP'])/'kx/android-polish-v2-final.bundle')},'sourcesSha256':source,'localBackend':True,'noCommitPublishOTA':True}
(out/'version.json').write_text(json.dumps(version,ensure_ascii=False,indent=2),encoding='utf-8')
names={'welcome':'البداية','welcome-result':'الكود والنتيجة','home':'الرئيسية','learn':'مسار التعلم','rewards':'المكافآت ومعرض الشارات','course':'الدورة','profile':'الحساب','challenges':'التحديات','lesson':'الدرس','challenge':'التحدي','community':'المجتمع','editor':'المحرر','ai':'المساعد','messages':'الرسائل','leaderboard':'الصدارة','certificates':'الشهادات','support':'الدعم','settings':'الإعدادات','about':'عن Kodax','privacy':'الخصوصية','blocked':'المحظورون'}
sizes={'small':'320×740','phone':'390×844','tablet':'900×900','desktop':'1440×900'}
def figure(p,title,group):return '<figure data-group="'+group+'"><figcaption>'+html.escape(title)+'</figcaption><img loading="lazy" onclick="showImage(this)" alt="'+html.escape(title)+'" src="data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode()+'"></figure>'
body=['<header><p>KODAX · V2 · FINAL POLISH · 09 / 10 / 2026</p><h1>لقطات الصقل النهائي</h1><p>معرض الشارات أولًا، بطاقة إنجاز موزّعة على الكمبيوتر، إجراءات بداية واضحة على 320، مسار أقرب، وأيام مكافآت بأسمائها ومبالغها.</p><p>صور من التطبيق الفعلي ببيانات اختبار محلية، جاهزة للمراجعة قبل الاعتماد. أُكمل فحص 19 صفحة عند 900×900. اضغط أي صورة لعرضها كاملة.</p></header><nav>']
for g,label in [('all','الكل'),('before','قبل / بعد'),('small','320'),('phone','390'),('tablet','900×900'),('desktop','1440'),('detail','النوافذ والمكافآت'),('android','Android')]:body.append('<button onclick="filter(\''+g+'\')">'+label+'</button>')
body.append('</nav><main>')
for before,after,title in [('small-welcome.png','small-welcome.png','البداية على 320'),('desktop-rewards.png','desktop-rewards.png','معرض الشارات والإنجاز على الكمبيوتر'),('phone-learn.png','phone-learn.png','مسار التعلم على الهاتف'),('phone-collection.png','phone-rewards.png','تقديم معرض الشارات على الهاتف')]:
 body.append(figure(out/'before'/before,title+' · قبل','before'));body.append(figure(out/'web'/after,title+' · بعد','before'))
for size in sizes:
 for name in names:
  p=out/'web'/(size+'-'+name+'.png')
  if p.exists():body.append(figure(p,names[name]+' · '+sizes[size],size))
for p in sorted((out/'details').glob('*.png')):
 if p.stem!='failure':body.append(figure(p,p.stem+' · Web','detail'))
nativeNames={'learn':'التعلم','rewards':'معرض الشارات','badges-sheet':'نافذة الشارات','daily-rewards':'الأيام والمبالغ','font160-learn':'التعلم — خط 160%','font160-learn-scroll':'المسار — خط 160%','font160-rewards':'المعرض — خط 160%','font160-daily-rewards':'أيام المكافآت — خط 160%','font160-daily-rewards-scroll':'اليوم السابع — خط 160%'}
for name,label in nativeNames.items():body.append(figure(out/'android'/(name+'.png'),label+' · Android','android'))
body.append('</main><footer>الحزمة المختبرة: KODAX-UI-V2-POLISH-20261009 · إعداد المشروع 1.2.0 · Web: localhost:8109.<br>Android: محاكي API 37 عبر Dev Client المثبت 1.1.0 / code 1 وحزمة المصدر الحالية، خط 100% و160%.<br>المقارنة من التنفيذ المعتمد في الجولة السابقة إلى الصقل الحالي؛ حسابات محلية خيالية. دون Commit أو نشر أو OTA.<br>هوية المصدر: '+version['sourceDigest'][:16]+'</footer><dialog><button onclick="this.parentElement.close()">إغلاق</button><img alt="لقطة كاملة"></dialog>')
css='body{margin:0;background:#0e0e15;color:#eeeef6;font:16px/1.8 Tahoma,Arial,sans-serif}header,footer{max-width:1120px;margin:auto;padding:28px 20px}h1{font-size:30px}header p,footer{color:#bbb8cc}nav{position:sticky;top:0;z-index:2;padding:10px;background:#171720;display:flex;gap:8px;justify-content:center;flex-wrap:wrap}button{font:inherit;border:1px solid #454258;border-radius:8px;background:#211d31;color:#eeeef6;padding:7px 13px;cursor:pointer}button:focus-visible{outline:2px solid #c0aaff}main{max-width:1480px;margin:20px auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;padding:12px}figure{margin:0;border:1px solid #35313f;border-radius:12px;background:#15151f;overflow:hidden}figure[hidden]{display:none}figcaption{padding:12px}figure img{display:block;width:100%;max-height:620px;object-fit:contain;object-position:top;cursor:zoom-in}dialog{max-width:94vw;max-height:95vh;padding:12px;background:#12121b;border:1px solid #665481;overflow:auto}dialog::backdrop{background:#000d}dialog img{max-width:88vw;height:auto;display:block}dialog button{position:sticky;top:0;display:block;margin-bottom:8px}footer{overflow-wrap:anywhere;font-size:14px}'
(gallery/'index.html').write_text('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kodax — الصقل النهائي V2</title><style>'+css+'</style>'+''.join(body)+'<script>function filter(g){document.querySelectorAll("figure").forEach(f=>f.hidden=g!=="all"&&f.dataset.group!==g)}function showImage(i){const d=document.querySelector("dialog");d.querySelector("img").src=i.src;d.showModal()}document.querySelector("dialog").addEventListener("click",e=>{if(e.target.tagName==="DIALOG")e.target.close()})</script></html>',encoding='utf-8')
f=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',20)
canvas=Image.new('RGB',(1456,500),'#0e0e15');d=ImageDraw.Draw(canvas)
for x,p,label in [(8,out/'before/desktop-rewards.png','BEFORE'),(736,out/'web/desktop-rewards.png','FINAL POLISH')]:
 im=Image.open(p).convert('RGB');im.thumbnail((712,445));canvas.paste(im,(x,46));d.text((x+4,12),label,font=f,fill='#c2acd9')
canvas.save(out/'desktop-before-after.jpg',quality=94)
canvas=Image.new('RGB',(1528,896),'#0e0e15');d=ImageDraw.Draw(canvas)
for k,(p,label) in enumerate([(out/'web/small-welcome.png','320 / START'),(out/'web/phone-rewards.png','390 / BADGES'),(out/'web/phone-learn.png','390 / LEARN'),(out/'details/small-daily-rewards.png','320 / DAILY')]):
 im=Image.open(p).convert('RGB');im.thumbnail((370,844));x=8+k*380;canvas.paste(im,(x,44));d.text((x+4,10),label,font=f,fill='#c2acd9')
canvas.save(out/'final-phone-overview.jpg',quality=94)
report=root/'KODAX-FINAL-POLISH-V2.md';shutil.copy2(report,out/report.name)
included=[gallery/'index.html',out/'version.json',report,out/'desktop-before-after.jpg',out/'final-phone-overview.jpg']
for folder in ['before','web','details']:
 included += [p for p in (out/folder).glob('*.png') if p.stem!='failure']
included += [out/'android'/(n+'.png') for n in nativeNames]
included += [out/p for p in ['web/checks.json','tablet-900/checks.json','details/checks.json','android/checks.json']]
if (out/'gallery-checks.json').exists():included.append(out/'gallery-checks.json')
dest=out/'KODAX-UI-V2-FINAL-POLISH.zip'
with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in included:z.write(p,p.name if p==report else str(p.relative_to(out)))
with zipfile.ZipFile(dest) as z:assert z.testzip() is None
print('Source',version['sourceDigest'][:16],'ZIP MB',round(dest.stat().st_size/1e6,2),'Gallery figures',len([b for b in body if b.startswith('<figure')]),flush=True)

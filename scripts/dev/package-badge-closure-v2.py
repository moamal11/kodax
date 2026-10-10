from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, hashlib, datetime, subprocess, os, base64, html, zipfile

root=Path.cwd();out=root/'reports/visual-polish-v2-final/badge-validation'
web=json.loads((out/'web/checks.json').read_text(encoding='utf-8'))
native=json.loads((out/'android/checks.json').read_text(encoding='utf-8'))
assert all(c['ok'] for c in web['checks']) and all(c['ok'] for c in native)
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
sourceFiles=sorted([p for d in ['app','src'] for p in (root/d).rglob('*') if p.suffix in ['.ts','.tsx','.js','.json']]+[root/'app.json',root/'package.json',root/'index.ts'])
source={str(p.relative_to(root)).replace('\\','/'):digest(p) for p in sourceFiles}
version={'reviewId':'KODAX-UI-V2-CLOSED-BADGES-20261009','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'gitHead':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'sourceDigest':hashlib.sha256(json.dumps(source,sort_keys=True).encode()).hexdigest(),'sourcesSha256':source,'configVersion':'1.2.0','web':{'url':'http://localhost:8116','build':'reports/visual-polish-v2-final/badge-validation/web-build','bundleSha256':{p.name:digest(p) for p in (out/'web-build/_expo/static/js/web').glob('*.js')},'sizes':[[320,740],[390,844],[900,900],[1440,900]]},'android':{'container':'Expo Development Client','installedVersion':'1.1.0 / code 1','device':'emulator-5554','android':'17 / API 37','fontScales':[1,1.6],'preparedMetroBundleSha256':digest(Path(os.environ['TEMP'])/'kx/android-badge-validation.bundle')},'accounts':{'new':{'storedEarnedBadges':0},'earned':{'storedEarnedBadges':4}},'scope':'Badge status distinction and real stored counts; prior polish verification remains documented separately.','productionIntegrationApproval':False,'storeReleaseApproval':False,'noCommitPublishOTA':True}
(out/'version.json').write_text(json.dumps(version,ensure_ascii=False,indent=2),encoding='utf-8')
version['android']['fontScaleTestMode']='Font set before a fresh launch; rewards opened using the app button.'
version['android']['activeSessionFontChangeValidated']=False
version['android']['devClientReconfigurationWarningObserved']=True
(out/'version.json').write_text(json.dumps(version,ensure_ascii=False,indent=2),encoding='utf-8')
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',19)
canvas=Image.new('RGB',(812,895),'#0e0e14');draw=ImageDraw.Draw(canvas)
for x,p,label in [(8,out/'web/new-phone-rewards.png','NEW ACCOUNT / 0 OF 44'),(414,out/'web/earned-phone-rewards.png','EARNED BADGES / 4 OF 44')]:
 im=Image.open(p).convert('RGB');canvas.paste(im,(x,42));draw.text((x+3,10),label,font=font,fill='#c4b5fd')
canvas.save(out/'badge-states.jpg',quality=95)
def figure(p,title,group):
 return '<figure data-group="'+group+'"><figcaption>'+html.escape(title)+'</figcaption><img loading="lazy" onclick="showImage(this)" alt="'+html.escape(title)+'" src="data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode()+'"></figure>'
figures=[]
for account,label in [('new','حساب جديد · 0 من 44'),('earned','شارات مكتسبة · 4 من 44')]:
 figures.append(figure(out/'web'/(account+'-phone-rewards.png'),label+' · النهائي','cases'))
for account,label in [('new','الحساب الجديد'),('earned','الحساب المكتسب')]:
 for size,name in [('small','320×740'),('phone','390×844'),('tablet','900×900'),('desktop','1440×900')]:
  if size!='phone':figures.append(figure(out/'web'/(account+'-'+size+'-rewards.png'),label+' · '+name,'web'))
 for size,name in [('phone','390×844'),('desktop','1440×900')]:
  figures.append(figure(out/'web'/(account+'-'+size+'-sheet.png'),label+' · نافذة الشارات · '+name,'sheet'))
 for suffix,scale in [('', '100%'),('-font160','160%')]:
  for route,title in [('rewards','المعرض'),('sheet','نافذة الشارات')]:
   figures.append(figure(out/'android'/(account+suffix+'-'+route+'.png'),label+' · '+title+' · Android · '+scale,'android'))
 figures.append(figure(out/'before'/(account+'-phone-rewards.png'),label+' · قبل توضيح الحالة','before'))
 figures.append(figure(out/'web'/(account+'-phone-rewards.png'),label+' · بعد توضيح الحالة','before'))
css='body{margin:0;background:#0e0e14;color:#ededf4;font:16px/1.8 Tahoma,Arial,sans-serif}header,footer{max-width:1080px;margin:auto;padding:24px 18px}header p,footer{color:#b6b6c8}h1{font-size:28px}nav{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:12px;background:#16161f;position:sticky;top:0;z-index:2}button{font:inherit;color:#ededf4;background:#211d31;border:1px solid #454258;border-radius:8px;padding:7px 13px;cursor:pointer}button:focus-visible{outline:2px solid #c4b5fd}main{max-width:1450px;margin:18px auto;padding:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}figure{margin:0;border:1px solid #36364c;border-radius:12px;background:#16161f;overflow:hidden}figure[hidden]{display:none}figcaption{padding:12px}figure img{display:block;width:100%;max-height:740px;object-fit:contain;object-position:top;cursor:zoom-in}dialog{max-width:94vw;max-height:94vh;background:#16161f;border:1px solid #454258;overflow:auto;padding:10px}dialog::backdrop{background:#000d}dialog img{max-width:88vw;height:auto;display:block}dialog button{position:sticky;top:0;margin-bottom:8px}footer{overflow-wrap:anywhere}'
head='<header><p>KODAX · V2 · إغلاق جولة الصقل</p><h1>المكتسبة والقادمة بحالتين واضحتين</h1><p>الحساب الجديد: 0 من 44. الحساب الآخر: 4 من 44. الأعداد من سجلات الشارات في قاعدة الاختبار المحلية، وليست مستنتجة من XP أو التقدم.</p><p>المكتسبة: إطار ذهبي ممتلئ وختم وحالة مكتوبة. القادمة: إطار مجوف متقطع وحالة «قادمة»، مع شروط الحصول الفعلية في النافذة.</p><p>اعتماد التصميم لا يشمل تكاملات الإنتاج أو إصدار المتجر. دون Commit أو نشر أو OTA.</p></header>'
nav='<nav>'+''.join('<button onclick="filter(\''+g+'\')">'+label+'</button>' for g,label in [('all','الكل'),('cases','الحالتان النهائيتان'),('web','المقاسات الأربعة'),('sheet','النوافذ'),('android','Android والخط المكبّر'),('before','قبل / بعد')])+'</nav>'
footer='<footer>الحزمة: '+version['reviewId']+' · هوية المصدر: '+version['sourceDigest'][:16]+'.<br>Web: localhost:8116 · Android: محاكي API 37 عبر Dev Client المثبت 1.1.0 / code 1، بخط 100% و160%.<br>هذه الجولة تختبر تمييز الشارات والعداد؛ أدلة الصقل السابق وحدوده محفوظة في التقرير. لا هاتف مادي أو APK إصدار جديد.</footer>'
js='<script>function filter(g){document.querySelectorAll("figure").forEach(f=>f.hidden=g!=="all"&&f.dataset.group!==g)}function showImage(i){const d=document.querySelector("dialog");d.querySelector("img").src=i.src;d.showModal()}document.querySelector("dialog").addEventListener("click",e=>{if(e.target.tagName==="DIALOG")e.target.close()})</script>'
(out/'index.html').write_text('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kodax — إغلاق الصقل والشارات</title><style>'+css+'</style>'+head+nav+'<main>'+''.join(figures)+'</main>'+footer+'<dialog><button onclick="this.parentElement.close()">إغلاق</button><img alt="لقطة كاملة"></dialog>'+js+'</html>',encoding='utf-8')
# Keep previous source/build evidence intact; mark its gallery as preceding this narrow follow-up.
previous=root/'reports/visual-polish-v2-final/gallery/index.html'
old=previous.read_text(encoding='utf-8')
marker='<!-- badge-closure -->'
if marker not in old:
 old=old.replace('<header>',marker+'<header><p>تحديث إغلاق الجولة: أُوضح تمييز الشارات بعد هذه اللقطات. <a style="color:#c4b5fd" href="http://localhost:8136">الحالتان النهائيتان ولقطات التحقق</a>. اللقطات أدناه توثق حزمة الصقل السابقة، وحدود اختبارها محفوظة.</p>',1)
 previous.write_text(old,encoding='utf-8')
included=[out/'index.html',out/'version.json',out/'badge-states.jpg',root/'KODAX-V2-CLOSURE.md',root/'KODAX-FINAL-POLISH-V2.md']
included += [p for p in (out/'web').glob('*.png')]
included += [out/'web/checks.json',out/'before/checks.json',out/'android/checks.json']
included += [out/'android/validation-note.json',out/'android/restoration.json']
for account in ['new','earned']:
 for suffix in ['', '-font160']:
  for route in ['rewards','sheet']:included.append(out/'android'/(account+suffix+'-'+route+'.png'))
included += [out/'before'/(a+'-phone-rewards.png') for a in ['new','earned']]
if (out/'gallery-checks.json').exists():included.append(out/'gallery-checks.json')
dest=out/'KODAX-UI-V2-CLOSED.zip'
with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in included:z.write(p,p.name if p.parent==root else str(p.relative_to(out)))
with zipfile.ZipFile(dest) as z:assert z.testzip() is None
print(version['reviewId'],version['sourceDigest'][:16],'Figures',len(figures),'ZIP MB',round(dest.stat().st_size/1e6,2),flush=True)

"""Package actual app captures; never exports credentials, bundles, or demo progress into production."""
from pathlib import Path
from PIL import Image
import json, hashlib, subprocess, datetime, html, base64, zipfile, os
root=Path.cwd(); out=root/'reports/visual-implementation-v2'
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return json.loads((out/p).read_text(encoding='utf-8'))
files=sorted([p for directory in ['app','src'] for p in (root/directory).rglob('*') if p.suffix in ['.ts','.tsx','.js','.json']]+[root/'app.json',root/'package.json',root/'index.ts'])
source={str(p.relative_to(root)).replace('\\','/'):digest(p) for p in files}
build=out/os.environ.get('VERIFIED_BUILD','release-review-web-build')
bundles={str(p.relative_to(build)).replace('\\','/'):digest(p) for p in (build/'_expo/static/js/web').glob('*.js')}
native=Path(os.environ['TEMP'])/'kx/android-v2-final.bundle'
version={'reviewId':'KODAX-UI-V2-20261009','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'workspaceConfigVersion':json.loads((root/'app.json').read_text())['expo']['version'],'gitHead':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'uncommitted':True,'sourceDigest':hashlib.sha256(json.dumps(source,sort_keys=True).encode()).hexdigest(),'web':{'url':os.environ.get('WEB_URL','http://localhost:8107'),'build':str(build.relative_to(root)),'bundlesSha256':bundles},'android':{'package':'com.kodax.app','container':'Expo Development Client','installedVersionName':'1.1.0','installedVersionCode':1,'device':'Pixel emulator-5554','androidRelease':'17','api':37,'pixels':'1080×1920','densityDpi':420,'fontScaleTested':[1,1.6],'nativeBundleSha256':digest(native)},'backend':'Local PGlite schema/migrations + fictional accounts; AI responses mocked; realtime WS unavailable','sourcesSha256':source}
(out/'version.json').write_text(json.dumps(version,ensure_ascii=False,indent=2),encoding='utf-8')
names={'welcome':'البداية','welcome-result':'الشرط والنتيجة','home':'الرئيسية','learn':'مسار التعلم','rewards':'المكافآت','course':'الدورة','challenges':'التحديات','lesson':'الدرس','challenge':'تفاصيل التحدي','profile':'الحساب','community':'المجتمع','editor':'المحرر','ai':'المساعد','messages':'المحادثات','leaderboard':'الصدارة','certificates':'الشهادات','support':'الدعم','settings':'الإشعارات والإعدادات','about':'عن Kodax','privacy':'الخصوصية','blocked':'المحظورون'}
def encoded(p): return 'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode()
def figure(p,title,tag): return f'<figure data-group="{tag}"><figcaption>{html.escape(title)}</figcaption><img loading="lazy" src="{encoded(p)}" alt="{html.escape(title)}" onclick="showImage(this)"></figure>'
gallery=out/'gallery';gallery.mkdir(exist_ok=True)
body=['<header><p>KODAX · UI V2 · 09 / 10 / 2026</p><h1>التنفيذ داخل التطبيق</h1><p>لقطات Web وAndroid فعلية ببيانات اختبار محلية. اضغط الصورة لعرضها كاملة.</p><p>التكوين: أقواس للمرحلة الحالية، ختم للمكتمل، عقدة مجوفة للقادم، وشارات بمعانيها.</p></header><nav><button onclick="filter(\'all\')">الكل</button><button onclick="filter(\'before\')">قبل / بعد</button><button onclick="filter(\'phone\')">390</button><button onclick="filter(\'small\')">320</button><button onclick="filter(\'tablet\')">900</button><button onclick="filter(\'desktop\')">1440</button><button onclick="filter(\'android\')">Android</button><button onclick="filter(\'detail\')">النوافذ والحالات</button></nav><main>']
for size in ['phone','desktop']:
 for name in ['welcome','learn','rewards']:
  for phase,folder in [('قبل','before'),('بعد','web')]: body.append(figure(out/folder/(size+'-'+name+'.png'),names[name]+' · '+size+' · '+phase,'before'))
for size in ['phone','small','tablet','desktop']:
 for name in names:
  p=out/'web'/(size+'-'+name+'.png')
  if p.exists():body.append(figure(p,names[name]+' · '+size,size))
for folder in ['complete-interactions','details']:
 for p in sorted((out/folder).glob('*.png')):
  if p.stem=='failure':continue
  body.append(figure(p,p.stem+' · Web','detail'))
native_names=['learn','course','rewards','profile','ai','community','support','settings','profile-edit','profile-edit-keyboard','languages','language-keyboard','editor','ai-keyboard','font160-learn','font160-learn-scroll','font160-profile','font160-rewards','font160-rewards-scroll','badges','xp-normal-final','xp-reduced-result','xp-reduced-review','xp-flight-result','xp-flight-effect']
for name in native_names:
 p=out/'android'/(name+'.png')
 if p.exists():body.append(figure(p,name+' · Android','android'))
clip=out/'android/xp-flight-clip.mp4'
if clip.exists():
 body.append('<figure data-group="android"><figcaption>حركة XP من نتيجة الدرس إلى العداد · تسجيل Android فعلي · 700 إلى 800 XP</figcaption><video controls preload="none" style="display:block;width:100%;max-height:700px" src="data:video/mp4;base64,'+base64.b64encode(clip.read_bytes()).decode()+'"></video></figure>')
body.append('</main><footer>Web: '+html.escape(version['web']['url'])+' · إعداد المشروع 1.2.0 · Android Dev Client 1.1.0 / 1 مع حزمة المصدر الحالية.<br>هوية المصدر: '+version['sourceDigest'][:16]+'<br>قبل: لقطات حقيقية من الجولة السابقة، وقد تختلف بيانات الحساب التجريبي. لا تمثل الصور تقدمًا شخصيًا للزائر.</footer><dialog><button onclick="this.parentElement.close()">إغلاق</button><img alt="لقطة كاملة"></dialog>')
css='body{margin:0;background:#0e0e15;color:#eeeef6;font:16px/1.8 Tahoma,Arial,sans-serif}header,footer{max-width:1100px;margin:auto;padding:32px 24px}h1{font-size:32px}header p,footer{color:#b8b6cd}nav{position:sticky;top:0;background:#15151fcc;backdrop-filter:blur(12px);padding:12px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;z-index:2}button{font:inherit;padding:8px 14px;border:1px solid #454258;border-radius:8px;background:#211d31;color:#eeeef6;cursor:pointer}button:focus-visible{outline:2px solid #bba2ff}main{max-width:1450px;margin:24px auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;padding:16px}figure{margin:0;background:#15151f;border:1px solid #343040;border-radius:12px;overflow:hidden}figcaption{padding:14px}figure img{width:100%;max-height:640px;object-fit:contain;object-position:top;display:block;cursor:zoom-in}figure[hidden]{display:none}dialog{max-width:94vw;max-height:95vh;overflow:auto;background:#12121b;border:1px solid #665481;padding:12px}dialog::backdrop{background:#000d}dialog img{display:block;max-width:88vw;height:auto}dialog button{position:sticky;top:0;display:block;margin:0 0 8px auto}footer{overflow-wrap:anywhere;font-size:14px}'
document='<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kodax — التنفيذ الفعلي V2</title><style>'+css+'</style>'+''.join(body)+'<script>function filter(g){document.querySelectorAll("figure").forEach(f=>f.hidden=g!=="all"&&f.dataset.group!==g)}function showImage(i){const d=document.querySelector("dialog");d.querySelector("img").src=i.src;d.showModal()}document.querySelector("dialog").addEventListener("click",e=>{if(e.target.tagName==="DIALOG")e.target.close()})</script></html>'
(gallery/'index.html').write_text(document,encoding='utf-8')
shots=[Image.open(out/'web'/('phone-'+n+'.png')).convert('RGB') for n in ['welcome','learn','rewards','home']]
canvas=Image.new('RGB',(sum(i.width for i in shots)+24*(len(shots)+1),max(i.height for i in shots)+48),'#0e0e15');x=24
for im in shots:canvas.paste(im,(x,24));x+=im.width+24
canvas.save(out/'phone-overview.jpg',quality=94)
print('Generated version, self-contained gallery and actual screenshot overview',flush=True)

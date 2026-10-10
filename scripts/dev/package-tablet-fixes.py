"""Package source-level layout evidence; never build or distribute an APK."""
import hashlib, html, json, subprocess, re, xml.etree.ElementTree as E
from pathlib import Path
root = Path.cwd()
out = root / 'reports/android-tablet-fixes-20261009'
native_raw = json.loads((out / 'native-checks.json').read_text(encoding='utf-8'))
native = list({c['name']: c for c in native_raw}.values())
web = json.loads((out / 'web/checks.json').read_text(encoding='utf-8'))
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
sources = {p: digest(root / p) for p in ['app/(tabs)/index.tsx', 'app/user/[id].tsx']}
apk = root / 'output/android-release/Kodax-1.2.0-preview.apk'
unchanged = digest(apk) == 'be7aac5d1d484805a8291c1116564f62c2bff1889bc07988f06b0ec04b5f608f'
assert unchanged, 'Prior delivered APK changed unexpectedly'
assert len(native) == 22 and all(c['ok'] for c in native), 'Native layout matrix incomplete'
assert all(c['ok'] for c in web if c['name'] != 'No browser runtime errors'), 'Web layout checks failed'
small = E.parse(out / 'after-phone-320-font160-home.xml').getroot()
rect = lambda n: list(map(int,re.findall(r'\d+',n.get('bounds',''))))
days = [n for n in small.iter('node') if any(n.get('content-desc','').endswith(': '+s) for s in ['تعلمت','مجمّد','بلا نشاط'])]
rows = len({rect(n)[1] for n in days})
assert len(days)==7 and rows==2, 'Large-font days must form two readable rows'
title = next(n for n in small.iter('node') if n.get('text')=='آخر 7 أيام')
counter = next(n for n in small.iter('node') if n.get('text','').startswith('هذا الأسبوع'))
a,b = rect(title),rect(counter)
overlap = max(0,min(a[2],b[2])-max(a[0],b[0])) * max(0,min(a[3],b[3])-max(a[1],b[1]))
assert overlap==0, 'Week title and count overlap'
small_font_meta={'dayRows':rows,'weekTitleBounds':a,'weekCountBounds':b,'overlapArea':overlap}
metadata = {'sourceSha256': sources, 'nativeChecks': native, 'webChecks': web, 'smallFont160':small_font_meta, 'previousApkUnchanged':unchanged,
 'head': subprocess.check_output(['git','rev-parse','HEAD']).decode().strip(),
 'android':{'mode':'existing development APK 1.1.0, current source via Metro; not a new release build', 'platform':'Android 16 / API 36 / x86_64 emulator'},
 'limits':['No physical tablet or new Release APK tested', 'Existing development APK predates native density/viewport refresh; cold-started for final wide/phone sizes', 'Metro web Ionicons hashed-font request failed (NetworkError); layout assertions passed', 'Local backend does not validate production push/realtime integrations']}
(out / 'verification.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
link = lambda p: (root / p).as_posix()
report = f'''# إصلاح تخطيط التابلت — 9 أكتوبر 2026

تم إصلاح اختفاء أزرار المتابعة والمراسلة، وتمدد خانات أيام «هدف اليوم»، مع إبقاء اتجاه التصميم والملاحة والبيانات كما هي.

- الملف العام: يتمدد صف الإجراءات ضمن عرض الملف، وتبقى النصوص والأيقونات ظاهرة. زر تعديل حسابك يحتفظ بتخطيطه السابق.
- هدف اليوم: عرض وارتفاع متساويان للخانات، بحد أقصى 40، مع تصغيرها بحسب العرض المتاح في الهاتف. لا تعتمد الخانات على نسبة عرض ثم حد أقصى يترك الارتفاع أكبر من العرض في Yoga. عند الخط المكبّر والعرض الضيق، تظهر الأيام 4+3 في صفّين حتى تقرأ أسماءها، ويلتف عنوان الأسبوع وعداده. سطر السلسلة وXP في الرأس يلتف أيضًا مع الخط الكبير بدل ضغط النص في عمود ضيق.

## الاختبار الفعلي

| البيئة | المقاسات المنطقية | الخط |
|---|---|---|
| Android 16، محاكي x86_64 | 960×1440، 1280×960، 390×780 | 100% |
| Android 16، محاكي x86_64 | 960×1440، 320×740 | 160% |
| Chrome، مصدر التطوير الحالي | 900×900، 960×1440، 1280×900، 390×844، 320×740 | عادي |

ظهرت الأزرار بنصوصها ومساحات ضغط صالحة، وبقيت خانات الأيام مضغوطة. اختبرت تغيير حالة المتابعة وإعادتها، وفتح المحادثة عبر زر مراسلة على حساب محلي تجريبي؛ لم تُرسل رسالة. تم فحص اللقطات بصريًا وفحص TypeScript دون أخطاء.

النسخة المختبرة: حزمة تطوير Android **موجودة مسبقًا، 1.1.0**، مع كود Kodax الحالي عبر Metro. لقطات «قبل» من APK Release المحلي السابق، ولقطات «بعد» من التطبيق الحقيقي في التطوير. لا يُعد هذا اختبارًا لحزمة Release جديدة.

## حدود الاختبار

لم أختبر جهاز التابلت الفعلي. حزمة التطوير الموجودة تسبق تعديل تحديث الأبعاد الأصلي في نسخة الإصدار؛ لذلك شُغّل التطبيق من جديد للمقاسات النهائية الواسعة والهاتف لضمان قياس النافذة الصحيح. ظهر في Web التطوير خطأ تحميل ملف Ionicons باسم يحوي hash، بينما نجحت فحوص التخطيط الخمسة عشر؛ فحص غياب أخطاء المتصفح لم ينجح. كذلك ظهرت تحذيرات push/realtime في البيئة المحلية، ولا يثبت هذا تكاملات الإنتاج.

لم يُبنَ APK جديد، ولم يُجرَ Commit أو نشر أو OTA. بقي APK الذي سبق تسليمه دون تغيير، وبصمة SHA-256 له: `{digest(apk)}`.

[اللقطات والمقارنة]({link('reports/android-tablet-fixes-20261009/index.html')}) · [نتائج الفحص والنسخة]({link('reports/android-tablet-fixes-20261009/verification.json')})
'''
(root / 'KODAX-TABLET-LAYOUT-FIXES.md').write_text(report,encoding='utf-8')
pairs = [('الملف العام — Android 960×1440','before-tablet-profile.png','after-tablet-960-profile.png'), ('هدف اليوم — Android 960×1440','before-tablet-home.png','after-tablet-960-home.png')]
sections=[]
for title,before,after in pairs:
    figures=''.join(f'<figure><figcaption>{label}</figcaption><a href="{file}"><img src="{file}" alt="{html.escape(title)} — {label}"></a></figure>' for label,file in [('قبل',before),('بعد',after)])
    sections.append(f'<section><h2>{title}</h2><div class="pair">{figures}</div></section>')
for name,label in [('tablet-1280','Android 1280×960'),('tablet-font160','Android 960×1440، خط 160%'),('phone-390','Android 390×780'),('phone-320-font160','Android 320×740، خط 160%')]:
    figures=''.join(f'<figure><figcaption>{label} — {screen}</figcaption><a href="after-{name}-{slug}.png"><img src="after-{name}-{slug}.png" alt="{screen}"></a></figure>' for slug,screen in [('profile','الملف'),('home','هدف اليوم')])
    sections.append(f'<section><h2>{label}</h2><div class="pair">{figures}</div></section>')
(out / 'index.html').write_text('''<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kodax — إصلاح التابلت</title><style>body{margin:auto;padding:24px;max-width:1200px;background:#0e0e15;color:#eee;font:17px/1.8 system-ui}h1{font-size:26px}h2{font-size:20px}p{color:#bbc0d0}section{padding-block:16px;border-top:1px solid #30303c}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0}img{width:100%;height:600px;object-fit:contain;object-position:top;background:#090910}a{color:#cbbcff}figcaption{padding-bottom:10px}@media(max-width:650px){.pair{grid-template-columns:1fr}img{height:520px}}</style><h1>Kodax — إصلاح تخطيط التابلت</h1><p>لقطات فعلية من Android: صف الأزرار وخانات أيام الهدف. المصدر الحالي عبر حزمة تطوير موجودة؛ لم يُبنَ APK جديد. اضغط الصورة لعرضها بالحجم الكامل.</p>''' + ''.join(sections) + '<p><a href="verification.json">تفاصيل الاختبار وحدوده</a></p></html>',encoding='utf-8')
print('Evidence packaged; previous APK unchanged')

from pathlib import Path
import hashlib, json, re, shutil, zipfile
from PIL import Image, ImageDraw

root=Path(__file__).resolve().parents[2]
out=root/'reports/visual-direction-v2'
checks=json.loads((out/'prototype-checks.json').read_text(encoding='utf-8'))
assert checks and all(c['ok'] for c in checks)
(out/'before').mkdir(exist_ok=True)
(out/'comparisons').mkdir(exist_ok=True)
names=[('welcome','ما قبل التسجيل','download'),('learn','مسار التعلّم','learn'),('rewards','المكافآت والشارات','rewards')]
for size in ['phone','desktop']:
    for name,label,before_name in names:
        source=root/f'reports/design-polish/latest-matrix/{size}/{"guest-download" if before_name=="download" else before_name}.png'
        target=out/f'before/{size}-{name}.png'
        shutil.copy2(source,target)
        a=Image.open(target).convert('RGB');b=Image.open(out/f'{size}-{name}.png').convert('RGB')
        canvas=Image.new('RGB',(a.width+b.width+36,max(a.height,b.height)+50),'#0e0e14')
        canvas.paste(a,(12,38));canvas.paste(b,(a.width+24,38))
        draw=ImageDraw.Draw(canvas);draw.text((12,12),'BEFORE / 08 OCT',fill='white');draw.text((a.width+24,12),'DIRECTION 02 / PREVIEW',fill='white')
        canvas.save(out/f'comparisons/{size}-{name}.jpg',quality=92)

manifest={'version':'Kodax visual direction 02, review iteration 3','date':'2026-10-09','kind':'isolated HTML prototypes; app source unchanged in this phase','data':'local QA snapshot and explicitly labelled illustrative states','viewport_sizes':[[390,844],[1440,900],[320,740],[900,900]],'files':{f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in out.glob('kodax-*-v2.html')},'checks_file':'prototype-checks.json'}
(out/'version.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')

report='''# Kodax — اتجاه بصري 02: معاينات للمراجعة

9 تشرين الأول 2026. النسخة: Direction 02 / review iteration 3. هذه مرحلة المعاينات الثلاث المطلوبة قبل التعميم. لم تُستبدل صفحات التطبيق بهذه الملفات، ولم يُنفّذ Commit أو نشر أو OTA.

## ما تغيّر بصريًا

اللغة الجديدة مشتقة من بيئة البرمجة: الأقواس المفتوحة تميّز النقطة الحالية؛ العلامة المختومة ذات الزاوية المقطوعة تميّز المكتمل؛ والعقدة المجوّفة أو المقفلة تميّز القادم. الحالة تُفهم من الشكل وعلامة التحقق والقفل والموضع، بالإضافة إلى النص واللون. البنفسجي #8B5CF6 للحالة الحالية، والذهبي #F5B83D للإنجاز، والخلفية #0E0E14. الشعار الأصلي وخطا IBM Plex Sans Arabic وJetBrains Mono مضمنان داخل الملفات؛ لا تعتمد المعاينات على خدمة خطوط أو صور خارجية.

صفحة البداية تجمع درس شرط صغيرًا، مقارنة قابلة للتغيير، الكود والناتج، ثم علامة إنجاز توضيحية. استخدام المقارنة الخاطئة يعطي نتيجة مختلفة وشرحًا؛ تصحيحها يُظهر الإنجاز. عند تغيير المقارنة تُمسح النتيجة السابقة. لا تُمنح نقاط فعلية، ويُذكر ذلك بجانب المثال. المسار أسفل المشهد متصل ومأخوذ من دورات Python الموجودة، دون تقدم شخصي للزائر. الإجراءات الأصلية ستبقى عند التنفيذ؛ أزرار التسجيل والمتجر هنا تشرح وظيفتها في المعاينة فقط.

التعلّم يبدأ بعنوان ومسار مختصر، ثم يظهر أول فصل مبكرًا. الدرس التالي جزء من هذا الفصل، بين المكتمل والقادم. العقدة الحالية أكبر ولها أقواس؛ الإكمال ختم؛ والدورات المقفلة تحمل علاقة المتطلب. حالات الدرس بجانب أسمائه. على الكمبيوتر عرض المتابعة محدود وتجاوره مساحة للهدف القريب، بدل تمديد بطاقة الهاتف. عرض المستوى مرة واحدة في المحتوى؛ الشريط الجانبي هنا لا يكرر XP. نمط التحديات يشرح المتاح والمحاولة والمكتمل بأشكال مختلفة، وحالاته توضيحية مع أسماء من التحديات الحالية؛ ليس سجل محاولات حيًا.

المكافآت تضع الشارة الأقرب في مساحة عرض تشبه قطعة تستحق الجمع. التقدم إلى شارة البداية أربع علامات من خمس، بدل شريط إضافي. المجموعة تعرض نماذج من الشارات المكتسبة والقادمة بوجه مختوم أو مجوّف. بطاقة المستوى مستقلة، والمكافأة اليومية تسلسل أيام، والأهداف حالات تحقق، والرصيد معلومات استعمال. شريط المستوى يستخدم المجال الحالي 900–1600 XP؛ قيمة الاختبار 1160، والمتبقي 440. أسماء الشارات والشروط والمبالغ من الأنظمة الموجودة؛ لا عتبات أو اقتصاد جديد.

## ما تراجعه الآن

1. هل هيئة العقدة الحالية والختم والشارة تمنح Kodax شخصية واضحة؟
2. هل ظهور الدرس داخل المسار أقرب إلى رحلة، مع بقاء الوصول سهلًا؟
3. هل مشهد البداية والتفاعل القصير يشرح التجربة دون فقرات تسويق كثيرة؟
4. هل كثافة التفاصيل وتوزيع الكمبيوتر والهاتف مناسبان، أم تريد حيوية أكبر؟

التقييم البصري من المقارنات ومراجعتك. نجاح البناء أو عدد الفحوص ليس دليلًا على جودة التصميم.

## التحقق وحدوده

فُتحت الملفات وصُورت فعليًا في Chrome على 1440×900 و900×900 و390×844 و320×740. جرى إصلاح خروج مسارات التعلّم بمقدار 4px في عرض 320. فُحص تبديل المقارنة والناتج وإعادة ضبط الإنجاز، فتح/إغلاق الدرس والشارة، المكتسبة مقابل القادمة، حالة الحساب الجديد، والاسم العربي الطويل. مع reduced motion تظهر حالة النجاح دون دخول متحرك. لا حركة مستمرة. سجل requests لا يحتوي أي نداء إلى API أو خدمة منح مكافآت.

هذه فحوص للمعاينات؛ ليست اختبار React Native أو إصدار Android جديدًا. لا تقرأ الملفات تقدمًا حيًا ولا تحفظ تغييرًا. بيانات المستوى والتقدم مأخوذة من لقطة الحساب المحلي السابق، وحالات البداية والتحديات معلنة كأمثلة. الخط العلوي الذي يحمل «معاينة اتجاه 02» أداة تنقل للمراجعة، ولا يدخل في واجهة التطبيق النهائية. قبل/بعد يقارن نسخة 8 تشرين الأول المختبرة سابقًا بهذه المعاينات، على المقاس نفسه.

النسخة المختبرة وبصمات الملفات في version.json، واللقطات والحالات ونتائج الفحص في المجلد نفسه.

## نطاق التعميم بعد مراجعة الاتجاه

| المجال | تطبيق اللغة البصرية | ما يبقى أساس الوظيفة |
|---|---|---|
| الرئيسية | محطة المتابعة، الهدف القريب، وختم آخر إنجاز فعلي؛ تكوين واحد بدل لوحة أرقام | الدرس الصحيح وآخر إنجاز من بيانات المستخدم |
| التعلّم وتفاصيل الدورات | مسار وفصول وعقد دروس متصلة، تفاصيل المتطلب عند القفل | ترتيب المنهج وإتاحة السيرفر وشروط الفتح |
| التحديات | المتاح/المحاولة/المكتمل من المسودة أو سجل المحاولة الموجود فعلًا | المحرر واختبارات الحل والتحقق |
| الدروس والنتائج | قراءة وكود هادئان؛ هيئة إكمال واضحة عند النتيجة | الأسئلة والإكمال الحقيقي وXP مرة واحدة |
| المكافآت والشارات | قطعة إنجاز قادمة، مجموعة الشارات، والأيام والأهداف بأشكال مناسبة | الشروط والأسعار والمواعيد والخدمات الحالية |
| الحساب وأعضاء المجتمع | هوية المتعلم مع مستوى مختصر وصورة متوازنة | المتابعة والأكواد والبيانات الشخصية |
| الشهادات | ختم الإنجاز ومعاينة الوثيقة دون ادعاء إصدار | بيانات الشهادة واستحقاقها الحقيقي |
| المحرر ونشر/عرض الكود | عنوان ملف ولغة وأدوات واضحة؛ لغة الأقواس بتفاصيل هادئة | التشغيل والنسخ والحفظ والتمرير المحدود |
| AI | عنصر واحد لسياق الدرس، اختصار النص المتكرر وتكوين محادثة أوضح | المحتوى والحصة والمحاولات وسجل الحوار |
| المجتمع والرسائل | هوية الكاتب وتكوين المحتوى والملفات؛ حضور بصري خفيف | القراءة والتفاعل والمحادثة |
| الدخول والإعدادات والدعم والقانونيات | المقاييس والخطوط والأزرار والنوافذ المشتركة، دون فرض عناصر لعب | المصادقة والنماذج والرسائل والوظائف السابقة |

ثم يُعاد التحقق على التطبيق الحقيقي في المقاسات الأربعة وAndroid، مع الحالات والكيبورد والأسماء الطويلة وRTL، ويحفظ تأثير XP الحالي مع ربطه بموضع الإنجاز واحترام reduced motion. هذه الخطوة تنتظر مراجعتك للاتجاه حسب طلبك.
'''
(root/'KODAX-VISUAL-DIRECTION-V2.md').write_text(report,encoding='utf-8')
shutil.copy2(root/'KODAX-VISUAL-DIRECTION-V2.md',out/'KODAX-VISUAL-DIRECTION-V2.md')

style='''*{box-sizing:border-box}body{margin:0;background:#0e0e14;color:#eee;font:16px/1.8 "Segoe UI",Arial,sans-serif}main{max-width:1280px;margin:auto;padding:28px 20px}h1{font-size:28px}h2{margin:40px 0 15px}h3{font-size:20px}p{color:#b6b6c8}a{color:#c4b5fd}nav{display:flex;gap:20px;flex-wrap:wrap}img{display:block;max-width:100%;height:auto;border-radius:9px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}.pair img{max-height:844px;object-fit:contain;object-position:top}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}figure{margin:0}figcaption{margin-bottom:10px;color:#b6b6c8}article{padding:16px 0 28px;border-bottom:1px solid #323242}summary{cursor:pointer;color:#c4b5fd}@media(max-width:700px){.pair,.grid{grid-template-columns:1fr}}'''
html='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kodax — اتجاه 02 قبل وبعد</title><style>'+style+'</style></head><body><main><h1>Kodax — مراجعة الاتجاه البصري 02</h1><p>ثلاث معاينات مترابطة قبل تعميم الاتجاه. بيانات اختبار وحالات توضيحية؛ لا حفظ أو XP فعلي. النسخة المختبرة: review iteration 3، 9 تشرين الأول 2026.</p><nav>'
for name,label,_ in names:html+=f'<a href="kodax-{name}-v2.html">جرّب {label}</a>'
html+='<a href="KODAX-VISUAL-DIRECTION-V2.md">شرح الاتجاه ونطاق التعميم</a></nav><h2>الهاتف: قبل وبعد</h2>'
for name,label,_ in names:
    html+=f'<article><h3>{label}</h3><div class="pair"><figure><figcaption>قبل — النسخة السابقة</figcaption><a href="before/phone-{name}.png"><img loading="lazy" src="before/phone-{name}.png" alt="قبل {label}"></a></figure><figure><figcaption>اتجاه 02 — معاينة</figcaption><a href="phone-{name}.png"><img loading="lazy" src="phone-{name}.png" alt="معاينة {label}"></a></figure></div><p><a href="phone-{name}-full.png">الصفحة كاملة</a> · <a href="small-{name}.png">320px</a> · <a href="tablet-{name}.png">900px</a></p></article>'
html+='<h2>الكمبيوتر: قبل وبعد</h2>'
for name,label,_ in names:
    html+=f'<article><h3>{label}</h3><a href="comparisons/desktop-{name}.jpg"><img loading="lazy" src="comparisons/desktop-{name}.jpg" alt="مقارنة الكمبيوتر {label}"></a><p><a href="desktop-{name}-full.png">المعاينة كاملة</a></p></article>'
html+='<h2>التفاعل والحالات</h2><div class="grid">'
for file,label in [('phone-welcome-success','نتيجة المثال والإنجاز التوضيحي'),('phone-learn-new','بداية المسار دون تقدم مفترض'),('phone-lesson-dialog','معاينة تركيز الدرس'),('phone-badge-dialog','الشارة القادمة وشرطها'),('phone-challenges','حالات التحدي التوضيحية'),('phone-rewards-full','الشارات والأيام والأهداف')]:
    html+=f'<figure><figcaption>{label}</figcaption><a href="{file}.png"><img loading="lazy" src="{file}.png" alt="{label}"></a></figure>'
html+='</div><p>التعميم على بقية الصفحات هو المرحلة التالية بعد مراجعتك؛ المقارنات تصف الاتجاه ولا تدّعي اكتمال تنفيذه في التطبيق.</p></main></body></html>'
(out/'kodax-direction-review-v2.html').write_text(html,encoding='utf-8')
for ref in set(re.findall(r'(?:src|href)="([^"]+)"',html)):
    assert (out/ref).is_file(),ref
with zipfile.ZipFile(root/'KODAX-VISUAL-DIRECTION-V2.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(out.rglob('*')):
        if file.is_file():archive.write(file,file.relative_to(root))
print('Review gallery, report, exact version manifest, six before/after comparisons and ZIP saved.')

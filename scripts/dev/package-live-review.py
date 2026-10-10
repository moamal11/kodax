"""Curated actual captures; no private QA credentials or project keys are packaged."""
import json,hashlib,html,shutil,subprocess,datetime
from pathlib import Path
root=Path.cwd().resolve();out=root/'reports/kodax-live-final-20261010';out.mkdir(parents=True,exist_ok=True)
groups=[]
def group(title,folder,names):
 cards=[]
 for name,label in names:
  source=root/folder/name
  if not source.exists():continue
  target=out/'images'/source.parent.name/name
  # Keep separate evidence folders when basenames overlap.
  target=out/'images'/folder.replace('/','-')/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
  cards.append({'label':label,'path':target.relative_to(out).as_posix(),'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
 if cards:groups.append({'title':title,'cards':cards})
before=out/'images/before';before.mkdir(parents=True,exist_ok=True)
for src,name in [('C:/Users/moamal/AppData/Local/Temp/codex-clipboard-96246d40-847c-4cd9-a348-c8a3db55201f.png','community-before.png'),('C:/Users/moamal/AppData/Local/Temp/codex-clipboard-07ad568b-45f8-4131-a92e-8fda347bbadc.png','profile-before.png'),('C:/Users/moamal/AppData/Local/Temp/codex-clipboard-e7c18aaa-f7b8-4ccc-894a-4b66b0ecf599.png','login-before.png')]:
 if Path(src).exists():shutil.copyfile(src,before/name)
group('قبل — الصور المرجعية التي أرسلها المستخدم','reports/kodax-live-final-20261010/images/before',[(p.name,p.stem) for p in before.glob('*.png')])
group('المجتمع — التنفيذ النهائي Web','reports/community-discussions-20261010/web',[
 ('desktop-final-results-masonry.png','1440×900 · التوزيع ومعاينة النتيجة'),('phone-codes.png','390×844 · الأكواد'),('small-mixed-feed.png','320×740 · الموجز المختلط'),('tablet-mixed-feed.png','900×900 · الموجز'),('small-feed-text160.png','320 · تكبير النص'),('phone-composer.png','إنشاء منشور'),('desktop-composer.png','إنشاء منشور على الكمبيوتر'),('phone-created.png','منشور محفوظ فعليًا'),('phone-upload-error.png','فشل الرفع مع بقاء المسودة'),('phone-replies-closed.png','ردود مغلقة'),('phone-replies-open.png','ردود مفتوحة'),('desktop-replies-open.png','الردود على الكمبيوتر'),('phone-solution.png','الحل المختار'),('phone-image-viewer.png','عرض الصورة'),('phone-empty-search.png','حالة بحث فارغ')])
group('الحذف الجديد وأيقونة المساعد — Web','reports/community-discussions-20261010/web',[
 ('desktop-discussion-cascade-before.png','سلسلة نقاش قبل الحذف'),('small-discussion-cascade-confirm.png','تأكيد حذف الأصل وجميع الردود'),('phone-discussion-cascade-after.png','النقاش بعد الحذف'),('desktop-code-cascade-before.png','تعليقات كود قبل الحذف'),('small-code-cascade-confirm.png','تأكيد حذف سلسلة الكود'),('phone-code-cascade-after.png','الكود بعد الحذف'),('phone-assistant-icon.png','رمز المساعد في الشريط'),('desktop-ai-chip-header.png','رمز المساعد في المحادثة')])
group('الملف والخصوصية — Web','reports/profile-live-20261010/web',[
 ('phone-profile.png','390×844 · الملف الخاص'),('phone-public-profile.png','390×844 · الملف العام'),('desktop-profile.png','1440×900 · الملف الخاص'),('desktop-public-profile.png','1440×900 · الملف العام'),('tablet-profile.png','900×900 · الملف'),('small-profile.png','320×740 · الملف'),('phone-edit-preview.png','معاينة التعديل'),('desktop-edit-preview.png','التعديل على الكمبيوتر'),('phone-edit-bio.png','حقول التعديل'),('phone-settings.png','الخصوصية والإعدادات'),('desktop-settings.png','الإعدادات على الكمبيوتر'),('small-long-name-bio.png','اسم عربي وBio طويلان'),('small-text160-edit.png','نص مكبّر في التعديل'),('small-no-cover-bio.png','حساب بلا غلاف أو Bio'),('phone-save-error-draft.png','خطأ الحفظ مع المسودة'),('desktop-after-real-login.png','بعد تسجيل دخول فعلي')])
group('الشعار الشفاف — Web والطباعة','reports/profile-live-20261010/web',[(f'desktop-logo-{n}.png',l) for n,l in [('login','تسجيل الدخول'),('about','حول التطبيق'),('sidebar','القائمة الجانبية'),('start','البداية والتنزيل'),('light','سطح فاتح')]]+[('print-brand-transparent.png','مثال طباعة معلن — أبيض وبنفسجي')])
group('Android — APK الإصدار المثبّت','reports/profile-live-20261010/android',[(n+'.png',l) for n,l in [('phone-profile-live','الملف بعد الدخول'),('phone-edit-keyboard100','التعديل والكيبورد'),('phone-edit-keyboard160','تغيير الخط أثناء الجلسة'),('native-photo-picker','منتقي الصور النظامي'),('native-cover-crop','قص الغلاف'),('native-after-restart','بعد إعادة تشغيل التطبيق'),('tablet-profile','ملف 900×900'),('tablet-settings','إعدادات التابلت'),('native-comments-open','الردود'),('native-public-profile','الملف العام'),('native-after-logout-login','بعد الخروج والدخول')]])
group('Android — المجتمع والنتائج','reports/community-discussions-20261010/android',[(n+'.png',l) for n,l in [('phone-mixed-feed','الموجز المختلط'),('phone-code-result-web','معاينة Web'),('phone-replies-closed','ردود مغلقة'),('phone-replies-open','ردود مفتوحة'),('phone-keyboard160','خط مكبّر أثناء الكتابة'),('phone-system-picker','منتقي صورة المنشور'),('phone-published-live','منشور محفوظ'),('phone-image-viewer','الصورة'),('tablet900x900-feed','900×900 · المجتمع'),('tablet900x900-composer','900×900 · الإنشاء'),('phone-native-cascade-confirm','تأكيد حذف السلسلة'),('phone-native-cascade-after','بعد حذف السلسلة'),('xp-normal-result','إنجاز درس حقيقي'),('xp-reduced-result','إنجاز مع تقليل الحركة')]])
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
sources={}
for folder in ['app','src','assets','plugins','supabase/migrations']:
 for p in (root/folder).rglob('*'):
  if p.is_file():sources[p.relative_to(root).as_posix()]=digest(p)
for name in ['app.json','app.config.js','metro.config.js','package.json','package-lock.json','tsconfig.app.json']:
 p=root/name
 if p.exists():sources[name]=digest(p)
version={'reviewId':'KODAX-LIVE-PROFILE-COMMUNITY-20261010','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'gitHead':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'uncommitted':True,'sourceDigest':hashlib.sha256(json.dumps(sources,sort_keys=True).encode()).hexdigest(),'sources':sources,'web':{'artifact':'output/community-profile-web-20261010','sizes':[[320,740],[390,844],[900,900],[1440,900]],'bundles':{p.name:digest(p) for p in (root/'output/community-profile-web-20261010/_expo/static/js/web').glob('*.js')}},'backend':'Kodax krtulodnhmfuoxjqajwl; dedicated live QA accounts','captures':groups,'noCommitPlayOTA':True}
apk=root/'output/android-release/Kodax-1.2.0-preview-profile-discussions-20261010.apk'
if apk.exists():version['apk']={'path':apk.relative_to(root).as_posix(),'version':'1.2.0 / code 1','package':'com.kodax.app.preview','sha256':digest(apk),'bytes':apk.stat().st_size,'signing':'local Android debug certificate','ota':False,'ads':'test','physicalDeviceTested':False}
(out/'verification.json').write_text(json.dumps(version,ensure_ascii=False,indent=2),encoding='utf8')
parts=['<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kodax — التنفيذ الفعلي</title><style>body{margin:0;background:#0e0d14;color:#eee;font:16px/1.8 Arial}main{max-width:1400px;margin:auto;padding:24px}h1{font-size:26px}section{margin:32px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}figure{margin:0;padding:12px;border:1px solid #393246;border-radius:12px;background:#191723}img{width:100%;height:430px;object-fit:contain;background:#09080d}figcaption{padding:10px 0}a{color:#c3a8ff}</style><main><h1>Kodax — لقطات التنفيذ الفعلي</h1><p>10 أكتوبر 2026 · Web بأربعة مقاسات · حسابات اختبار مخصصة على Supabase. أمثلة QA معلنة؛ ليست بيانات افتراضية للمستخدمين. صور «قبل» من المراجع المرسلة. حدود Android والحزمة موثّقة في التقرير.</p><p><a href="verification.json">النسخة والبصمات</a></p>']
for g in groups:
 parts.append('<section><h2>'+html.escape(g['title'])+'</h2><div class="grid">')
 for c in g['cards']:parts.append('<figure><a href="'+html.escape(c['path'])+'" target="_blank"><img loading="lazy" src="'+html.escape(c['path'])+'" alt="'+html.escape(c['label'])+'"></a><figcaption>'+html.escape(c['label'])+'</figcaption></figure>')
 parts.append('</div></section>')
parts.append('</main></html>');(out/'index.html').write_text(''.join(parts),encoding='utf8');print(str(out/'index.html'));print('Captures:',sum(len(g['cards']) for g in groups))

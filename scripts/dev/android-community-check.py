"""UI testing on the embedded release bundle and dedicated real Supabase QA account."""
import importlib.util,json,time,sys,subprocess
from pathlib import Path
spec=importlib.util.spec_from_file_location('h','scripts/dev/android-release-check.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
h.OUT=Path('reports/community-discussions-20261010/android');h.OUT.mkdir(parents=True,exist_ok=True);h.CHECKS=h.OUT/'checks.json'
state=json.loads(Path('.env.profile-qa.local').read_text(encoding='utf8'));mode=sys.argv[1]
def seek(label,partial=False):
 for _ in range(18):
  r=h.tree();n=h.find(label,r,partial)
  if n is not None:
   _,y,_,bottom=h.bounds(n);height=int([x for x in h.run('shell','wm','size').splitlines() if 'size:' in x][-1].split(':')[-1].strip().split('x')[1])
   if y>=0 and bottom<=height:return r
  h.swipe(root=r)
 raise RuntimeError('Unreachable '+label)
def community():
 h.home();h.tap('المجتمع');return h.wait(lambda r:h.has('إنشاء',r))
def to_top():
 for _ in range(5):
  r=h.tree()
  if h.has('إنشاء',r):return r
  h.swipe(up=False,root=r)
 return h.tree()
if mode=='feed':
 r=community();h.cap('phone-mixed-feed',r);h.check('Android mixed filter controls and create visible',all(h.has(x,r) for x in ['الكل','الأكواد','النقاشات','إنشاء']))
 h.tap('الأكواد',r);r=h.wait(lambda r:h.has('كل اللغات',r));h.cap('phone-codes-filter',r);h.check('Code language filters visible only in code feed',h.has('كل اللغات',r))
 r=seek('معاينة واجهة الويب');h.cap('phone-code-result-web',r);h.check('Release APK renders passive Web result preview',h.has('معاينة واجهة الويب',r))
 r=to_top();h.tap('النقاشات',r);r=h.wait(lambda r:h.has('إنشاء',r));h.cap('phone-discussions-filter',r);h.check('Discussion feed does not retain code language chips',not h.has('كل اللغات',r))
 h.tap('اختبار مخصص · شرط Python',seek('اختبار مخصص · شرط Python',True),True);r=seek('انتقل إلى الحل');h.cap('phone-discussion-solution',r);h.tap('انتقل إلى الحل',r);r=seek('الحل المختار',True);h.cap('phone-solution-anchor',r);h.check('Accepted solution opens actual comment location',any('الحل المختار' in x for x in h.labels(r)))
 r=seek('عرض 1 ردود');h.cap('phone-replies-closed',r);h.tap('عرض 1 ردود',r);r=seek('إخفاء الردود');h.cap('phone-replies-open',r);h.check('Native nested replies expand',h.has('إخفاء الردود',r));h.back()
elif mode=='compose':
 r=community();h.tap('إنشاء',r);r=h.wait(lambda r:h.has('كتابة منشور، سؤال أو نقاش أو تجربة',r));h.cap('phone-create-menu',r);h.tap('كتابة منشور، سؤال أو نقاش أو تجربة',r);r=h.wait(lambda r:h.has('عنوان المنشور',r));h.cap('phone-composer',r)
 h.fill('عنوان المنشور','Android_QA_discussion_'+str(int(time.time())));h.back();h.fill('نص المنشور','Android_keyboard_draft');r=h.tree();h.cap('phone-keyboard100',r);expected='Android_keyboard_draft';draft=lambda r:any(n.get('text')==expected and 'EditText' in n.get('class','') for n in r.iter('node'))
 h.run('shell','settings','put','system','font_scale','1.6');r=h.wait(draft);h.cap('phone-keyboard160',r);h.check('Live OS font change retains discussion draft and composer',draft(r) and h.has('نشر المنشور',r));h.run('shell','input','text','_continued');expected+='_continued';r=h.wait(draft);h.check('Native discussion typing continues after live font change',draft(r));h.back();r=h.wait(draft);h.check('First Back hides keyboard and retains draft',draft(r));h.run('shell','settings','put','system','font_scale','1.0');h.wait(draft)
 h.tap('إضافة صورة',seek('إضافة صورة'));r=h.wait(lambda r:any('تم التقاط صورة' in x for x in h.labels(r)),limit=30);h.cap('phone-system-picker',r);h.tap('تم التقاط صورة',r,partial=True);r=h.wait(lambda r:h.has('تم',r));h.tap('تم',r);r=h.wait(lambda r:h.has('معاينة صورة المنشور',r));h.cap('phone-image-draft',r);h.check('Android system picker returns uncropped post image',h.has('معاينة صورة المنشور',r) and not h.has('قُصّ',r))
 h.tap('نشر المنشور',seek('نشر المنشور'));r=h.wait(lambda r:h.has('تعديل المنشور',r),limit=35);h.cap('phone-published-live',r);h.check('Native post/image saved through real backend',h.has('تعديل المنشور',r));h.tap('فتح الصورة المرفقة',seek('فتح الصورة المرفقة'));r=h.wait(lambda r:h.has('إغلاق الصورة',r));h.cap('phone-image-viewer',r)
 h.run('shell','input','tap','500','800');h.run('shell','input','tap','500','800');time.sleep(1);h.cap('phone-image-doubletap');h.back();r=h.wait(lambda r:h.has('تعديل المنشور',r));h.check('Back closes image modal without leaving detail',h.has('تعديل المنشور',r));h.back();r=h.wait(lambda r:h.has('إنشاء',r));h.cap('phone-back-to-feed',r)
elif mode=='tablet':
 h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','wm','size','1800x1800');h.run('shell','wm','density','320');h.run('shell','settings','put','system','font_scale','1.0');h.run('shell','am','start','-n',h.PACKAGE+'/.MainActivity');r=community();h.cap('tablet900x900-feed',r);h.check('Native 900x900 feed and controls reachable',h.has('إنشاء',r));h.tap('إنشاء',r);h.tap('كتابة منشور، سؤال أو نقاش أو تجربة',h.wait(lambda r:h.has('كتابة منشور، سؤال أو نقاش أو تجربة',r)));r=h.wait(lambda r:h.has('عنوان المنشور',r));h.cap('tablet900x900-composer',r);h.check('Native 900x900 composer footer reachable',h.has('نشر المنشور',r));h.back();h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','wm','size','reset');h.run('shell','wm','density','reset');h.run('shell','am','start','-n',h.PACKAGE+'/.MainActivity')
else:raise SystemExit('Unknown mode')

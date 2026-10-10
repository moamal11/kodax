"""Actual phone-endpoint preview APK, dedicated live QA accounts, no development server."""
import importlib.util, json, time, sys, subprocess
from pathlib import Path
spec=importlib.util.spec_from_file_location('h','scripts/dev/android-release-check.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
h.OUT=Path('reports/profile-live-20261010/android');h.OUT.mkdir(parents=True,exist_ok=True);h.CHECKS=h.OUT/'checks.json'
state=json.loads(Path('.env.profile-qa.local').read_text(encoding='utf-8'));A=state['accounts'][0]
mode=sys.argv[1]
orig_wait=h.wait
def wait(predicate,limit=25):
 def ready(r):
  if h.has('عدم السماح',r) and any('إشعارات' in x for x in h.labels(r)):h.tap('عدم السماح',r);return False
  return predicate(r)
 return orig_wait(ready,limit)
h.wait=wait
def seek(label,partial=False):
 for _ in range(14):
  r=h.tree();n=h.find(label,r,partial)
  if n is not None:
   _,top,_,bottom=h.bounds(n)
   size=h.run('shell','wm','size');physical=[x for x in size.splitlines() if 'size:' in x][-1].split(':')[-1].strip();height=int(physical.split('x')[1])
   if top>=0 and bottom<=height:return r
  h.swipe(root=r)
 raise RuntimeError('Unreachable '+label)
def profile():
 r=h.wait(lambda r:h.has('حسابي',r),limit=30);h.home();h.tap('حسابي');return h.wait(lambda r:h.has('تعديل الملف',r))
def login():
 r=h.wait(lambda r:h.has('البريد الإلكتروني',r) or h.has('تسجيل الدخول',r) or h.has('حسابي',r),limit=30)
 if h.has('حسابي',r):return
 if not h.has('البريد الإلكتروني',r):h.tap('تسجيل الدخول',r)
 h.wait(lambda r:any(n.get('content-desc')=='البريد الإلكتروني' and 'EditText' in n.get('class','') for n in r.iter('node')))
 h.fill('البريد الإلكتروني',A['email']);h.back();h.fill('كلمة المرور',A['password']);h.back();h.tap('تسجيل الدخول',seek('تسجيل الدخول'))
 h.wait(lambda r:h.has('حسابي',r),limit=30)
def save_ready():return h.wait(lambda r:any(n.get('content-desc')=='حفظ التغييرات' and n.get('enabled')=='true' and n.get('clickable')=='true' for n in r.iter('node')))
def verify():
 code="const q=require('./scripts/dev/live-profile-client.cjs'),fs=require('fs');const s=JSON.parse(fs.readFileSync(q.PRIVATE));const {client}=q.clients();(async()=>{let c=client();await q.login(c,s.accounts[0]);let r=await c.from('profiles').select('cover_url,bio,avatar_url').eq('id',s.accounts[0].id).single();if(r.error)throw r.error;console.log(JSON.stringify(r.data))})()"
 return json.loads(subprocess.check_output(['node','-e',code]).decode('utf-8'))
if mode=='login':
 h.run('shell','logcat','-c');h.run('shell','am','start','-n',h.PACKAGE+'/.MainActivity');login();r=profile();h.cap('phone-profile-live',r);h.check('Release APK authenticates dedicated live account',h.has('تعديل الملف',r) and h.has('غلاف سارة الكبيسي',r))
elif mode=='keyboard':
 r=profile();h.tap('تعديل الملف',r);r=seek('نبذة عنك (اختيارية)');h.fill('نبذة عنك (اختيارية)','Android_live_profile_draft');r=h.tree();h.cap('phone-edit-keyboard100',r)
 expected='Android_live_profile_draft'
 draft=lambda r:any(n.get('text')==expected and 'EditText' in n.get('class','') for n in r.iter('node'))
 h.check('Native bio field accepts keyboard draft',draft(r));h.run('shell','settings','put','system','font_scale','1.6');r=h.wait(draft);h.cap('phone-edit-keyboard160',r);h.check('Live font change retains profile editor and unsent draft',draft(r) and h.has('حفظ التغييرات',r))
 h.run('shell','input','text','_continued');expected+='_continued';r=h.wait(draft);h.check('Native profile typing continues after live font change',draft(r));h.cap('phone-edit-font160-continued',r)
 h.back();r=h.wait(draft);h.cap('phone-first-back-draft',r);h.check('First Back hides IME without losing draft',draft(r) and h.has('حفظ التغييرات',r))
 h.back();r=h.wait(lambda r:h.has('تعديل الملف',r));h.check('Second Back closes profile sheet',h.has('تعديل الملف',r) and not h.has('حفظ التغييرات',r));h.cap('phone-profile160',r)
 h.run('shell','settings','put','system','font_scale','1.0');h.wait(lambda r:h.has('تعديل الملف',r))
elif mode=='images':
 old=verify();r=profile();h.tap('تعديل الملف',r);h.tap('تغيير الغلاف' if h.has('تغيير الغلاف',h.tree()) else 'اختيار غلاف');r=h.wait(lambda r:any('تم التقاط صورة' in x for x in h.labels(r)),limit=25);h.cap('native-photo-picker',r);h.tap('تم التقاط صورة',r,partial=True);r=h.wait(lambda r:h.has('تم',r));h.tap('تم',r);r=h.wait(lambda r:h.has('قُصّ',r));h.cap('native-cover-crop',r);h.tap('قُصّ',r);r=save_ready();h.tap('حفظ التغييرات',r);r=h.wait(lambda r:h.has('تعديل الملف',r),limit=30);h.cap('native-cover-saved',r);saved=verify();h.check('Android picker/crop saves new cover in real Supabase',bool(saved['cover_url']) and saved['cover_url']!=old['cover_url'])
 h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','am','start','-n',h.PACKAGE+'/.MainActivity');r=profile();h.cap('native-after-restart',r);h.check('Native cover/Bio survive force-stop and reopen',h.has('غلاف سارة الكبيسي',r) and bool(verify()['bio']))
elif mode=='screens':
 for n,size,density,font in [('small','840x1942','420','1.0'),('small160','840x1942','420','1.6'),('phone','1170x2532','480','1.0'),('tablet','1800x1800','320','1.0')]:
  h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','wm','size',size);h.run('shell','wm','density',density);h.run('shell','settings','put','system','font_scale',font);h.run('shell','am','start','-n',h.PACKAGE+'/.MainActivity');r=profile();h.cap(n+'-profile',r);h.check(n+' release profile action accessible',h.has('تعديل الملف',r));h.tap('تعديل الملف',r);r=seek('نبذة عنك (اختيارية)');h.cap(n+'-edit-bio',r);h.check(n+' editor save and bio reachable',h.has('حفظ التغييرات',r));h.back()
  h.tap('الإعدادات',seek('الإعدادات'));r=h.wait(lambda r:h.has('إظهار قائمة المتابعين',r));h.cap(n+'-settings',r);h.check(n+' privacy controls survive new header layout',h.has('إظهار قائمة المتابعين',r));h.back()
 h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','wm','size','reset');h.run('shell','wm','density','reset');h.run('shell','settings','put','system','font_scale','1.0');h.run('shell','am','start','-n',h.PACKAGE+'/.MainActivity')
elif mode=='comments':
 r=profile();h.tap('اختبار مخصص · تعليقات Kodax',seek('اختبار مخصص · تعليقات Kodax'));r=seek('عرض 2 ردود');h.cap('native-comments-closed',r);h.tap('عرض 2 ردود',r);r=seek('إخفاء الردود');h.cap('native-comments-open',r);h.check('Native live replies expand while preserving deleted parent',h.has('إخفاء الردود',r));h.tap('ملف ليث · حساب اختبار',seek('ملف ليث · حساب اختبار'));r=h.wait(lambda r:h.has('مراسلة',r));h.cap('native-public-profile',r);h.check('Visitor follow/message accessible in public profile',h.has('مراسلة',r));h.back();h.back()
elif mode=='logout':
 r=profile();h.tap('الإعدادات',seek('الإعدادات'));h.tap('تسجيل الخروج',seek('تسجيل الخروج'));h.tap('خروج');login();r=profile();h.cap('native-after-logout-login',r);h.check('Actual native logout/login reloads cover/Bio',h.has('غلاف سارة الكبيسي',r) and bool(verify()['bio']));h.tap('الإعدادات',seek('الإعدادات'));r=h.wait(lambda r:h.has('إظهار قائمة المتابعين',r));h.cap('native-privacy-after-login',r);h.check('Native privacy remains private after login',sum('القائمة متاحة لك فقط' in x for x in h.labels(r))>=2);h.back()
else:raise SystemExit('Unknown case')

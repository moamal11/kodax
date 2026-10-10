"""Actual installed signed original release APK, dedicated QA accounts, no Metro."""
import importlib.util,json,time,sys,subprocess
from pathlib import Path
spec=importlib.util.spec_from_file_location('h','scripts/dev/android-release-check.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
h.PACKAGE='com.kodax.app';h.OUT=Path('reports/android-original-20261010/device');h.OUT.mkdir(parents=True,exist_ok=True);h.CHECKS=h.OUT/'checks.json'
state=json.loads(Path('.env.community-social-qa.local').read_text(encoding='utf8'));A=state['accounts'][0]
original_wait=h.wait
def wait(pred,limit=25):
 def ready(r):
  if h.has('عدم السماح',r) and any('إشعارات' in x for x in h.labels(r)):h.tap('عدم السماح',r);return False
  return pred(r)
 return original_wait(ready,limit)
h.wait=wait
def seek(label,partial=False):
 for _ in range(18):
  r=h.tree();n=h.find(label,r,partial)
  height=int([x for x in h.run('shell','wm','size').splitlines() if 'size:' in x][-1].split(':')[-1].strip().split('x')[1])
  if n is not None and 25<=h.bounds(n)[1]<h.bounds(n)[3]<=height-30:return r
  h.swipe(root=r)
 raise RuntimeError('Unreachable '+label)
def login():
 r=h.wait(lambda r:h.has('البريد الإلكتروني',r) or h.has('تسجيل الدخول',r) or h.has('الرئيسية',r),limit=35)
 if h.has('الرئيسية',r):return
 if not h.has('البريد الإلكتروني',r):h.tap('تسجيل الدخول',r)
 h.fill('البريد الإلكتروني',A['email']);h.back();h.fill('كلمة المرور',A['password']);h.back();h.tap('تسجيل الدخول',seek('تسجيل الدخول'))
 h.wait(lambda r:h.has('الرئيسية',r),limit=35)
def seek_field(label):
 # A label can be visible while its input is behind the pinned footer.
 # Scroll the actual editable field fully into the sheet body before tapping.
 for _ in range(18):
  r=h.tree();n=next((n for n in r.iter('node') if n.get('content-desc')==label and 'EditText' in n.get('class','')),None)
  areas=[h.bounds(a) for a in r.iter('node') if a.get('scrollable')=='true' and 'Horizontal' not in a.get('class','') and len(h.bounds(a))==4]
  if n is not None and areas:
   b=h.bounds(n);a=max(areas,key=lambda x:x[3]-x[1])
   if a[1]+10<=b[1]<b[3]<=a[3]-10:return r
  h.swipe(root=r)
 raise RuntimeError('Input not fully in sheet scroll body: '+label)
def text_height(label,r):
 n=h.find(label,r);return h.bounds(n)[3]-h.bounds(n)[1] if n is not None else 0
def link(route):
 h.run('shell','am','start','-W','-a','android.intent.action.VIEW','-d','kodax://'+route,h.PACKAGE)
def profile():
 # Cold start restores the auth session before ordinary UI navigation is usable.
 # Avoid sending a second synthetic intent during that startup transition.
 time.sleep(1)
 r=h.tree()
 if h.has('حسابي',r):
  h.tap('حسابي',r)
  return h.wait(lambda r:h.has('تعديل الملف',r))
 link('profile');return h.wait(lambda r:h.has('تعديل الملف',r))
def post():
 link('discussion/'+state['question']);return h.wait(lambda r:h.has('السؤال',r) and h.has('مشاركة',r))
def stored_profile():
 code="const q=require('./scripts/dev/live-profile-client.cjs'),fs=require('fs');const s=JSON.parse(fs.readFileSync('.env.community-social-qa.local'));const {client}=q.clients();(async()=>{let c=client();await q.login(c,s.accounts[0]);let r=await c.from('profiles').select('cover_url,bio,avatar_url').eq('id',s.accounts[0].id).single();if(r.error)throw new Error('QA profile read failed');console.log(JSON.stringify(r.data))})()"
 return json.loads(subprocess.check_output(['node','-e',code]).decode('utf8'))
mode=sys.argv[1] if len(sys.argv)>1 else 'share'
try:
 if mode=='login':
  h.run('shell','logcat','-c');h.run('shell','am','start','-n',h.PACKAGE+'/.MainActivity');login();r=profile();h.cap('release-profile',r)
  h.check('Original signed standalone APK authenticates live isolated QA',h.has('تعديل الملف',r) and any('اختبار مستقل' in l for l in h.labels(r)))
 elif mode=='share':
  h.run('shell','settings','put','system','font_scale','1.0');r=post();h.cap('release-question',r)
  h.tap('مشاركة',r);h.tap('إرسال في الرسائل',h.wait(lambda r:h.has('إرسال في الرسائل',r)));r=h.wait(lambda r:h.has('ابحث عن حساب للمشاركة',r))
  h.tap('ليث · اختبار مستقل',seek('ليث · اختبار مستقل',True),True);label='إرسال إلى ليث · اختبار مستقل';r=h.wait(lambda r:h.has(label,r));h.cap('release-share-fixed',r)
  height=int([x for x in h.run('shell','wm','size').splitlines() if 'size:' in x][-1].split(':')[-1].strip().split('x')[1])
  h.check('Send action is visible without scrolling recipients',h.bounds(h.find(label,r))[3]<=height)
  h.tap('ابحث عن حساب للمشاركة',r);h.run('shell','input','text','social_qa');r=h.tree();h.cap('release-share-keyboard100',r)
  def draft(r):return any(n.get('text')=='social_qa' and 'EditText' in n.get('class','') for n in r.iter('node'))
  h.check('Native share typing and footer coexist',draft(r) and (h.has(label,r) or h.has('اختر حسابًا للإرسال',r)))
  before=text_height('مشاركة',r);h.run('shell','settings','put','system','font_scale','1.6');r=h.wait(lambda r:draft(r) and text_height('مشاركة',r)>=before*1.4);h.cap('release-share-keyboard160-live',r)
  h.check('Share heading actually grows during session',text_height('مشاركة',r)>=before*1.4,{'beforePx':before,'afterPx':text_height('مشاركة',r)})
  h.check('Changing font during session preserves modal and typed search',draft(r) and h.has('ابحث عن حساب للمشاركة',r) and (h.has(label,r) or h.has('اختر حسابًا للإرسال',r)))
  h.run('shell','input','text','_');r=h.tree();h.check('Typing continues after live font change',any(n.get('text')=='social_qa_' and 'EditText' in n.get('class','') for n in r.iter('node')))
  h.back();r=h.wait(lambda r:h.has('ابحث عن حساب للمشاركة',r));h.check('First Back hides keyboard and retains share',h.has('ابحث عن حساب للمشاركة',r))
  h.back();r=h.wait(lambda r:h.has('السؤال',r));h.check('Second Back closes share to original question',h.has('السؤال',r));h.cap('release-question160',r)
 elif mode=='profile-keyboard':
  h.run('shell','settings','put','system','font_scale','1.0');r=profile();h.tap('تعديل الملف',r);r=seek_field('نبذة عنك (اختيارية)');h.fill('نبذة عنك (اختيارية)','Kodax_original_draft');expected='Kodax_original_draft'
  def draft(r):return any(n.get('text')==expected and 'EditText' in n.get('class','') for n in r.iter('node'))
  r=h.wait(draft);h.cap('release-profile-edit-keyboard100',r);h.check('Profile draft accepts native keyboard',draft(r))
  before=text_height('تعديل الملف الشخصي',r);h.run('shell','settings','put','system','font_scale','1.6');r=h.wait(lambda r:draft(r) and text_height('تعديل الملف الشخصي',r)>=before*1.4);h.cap('release-profile-edit-keyboard160-live',r)
  h.check('Profile heading actually grows during session',text_height('تعديل الملف الشخصي',r)>=before*1.4,{'beforePx':before,'afterPx':text_height('تعديل الملف الشخصي',r)})
  h.check('Profile editor survives live font increase with unsaved Bio',draft(r) and h.has('حفظ التغييرات',r))
  h.run('shell','input','text','_continued');expected+='_continued';r=h.wait(draft);h.check('Bio typing continues after live font scaling',draft(r))
  h.back();r=h.wait(draft);h.check('First Back retains Bio draft after keyboard dismiss',draft(r));h.back();r=h.wait(lambda r:h.has('تعديل الملف',r));h.check('Second Back dismisses edit without saving draft',not h.has('حفظ التغييرات',r));h.cap('release-profile160',r)
 elif mode=='images':
  old=stored_profile();r=profile();h.tap('تعديل الملف',r);r=seek('تغيير الغلاف' if old['cover_url'] else 'اختيار غلاف');h.tap('تغيير الغلاف' if old['cover_url'] else 'اختيار غلاف',r)
  r=h.wait(lambda r:any('تم التقاط صورة' in x for x in h.labels(r)),limit=30);h.cap('release-photo-picker',r);h.tap('تم التقاط صورة',r,True);r=h.wait(lambda r:h.has('تم',r));h.tap('تم',r);r=h.wait(lambda r:h.has('قُصّ',r));h.cap('release-cover-crop',r);h.tap('قُصّ',r)
  r=h.wait(lambda r:any(n.get('content-desc')=='حفظ التغييرات' and n.get('enabled')=='true' and n.get('clickable')=='true' for n in r.iter('node')));h.tap('حفظ التغييرات',r)
  r=h.wait(lambda r:h.has('تعديل الملف',r),limit=35);h.cap('release-cover-saved',r);saved=stored_profile();h.check('Native original APK picker/crop uploads cover to real Supabase',bool(saved['cover_url']) and saved['cover_url']!=old['cover_url'])
  h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','am','start','-n',h.PACKAGE+'/.MainActivity');h.wait(lambda r:h.has('حسابي',r));r=profile();h.cap('release-cover-after-restart',r)
  current=stored_profile();h.check('Cover/Bio survive native force-stop and reopen',current['cover_url']==saved['cover_url'] and current['bio']==saved['bio'] and bool(current['bio']))
 elif mode=='screens':
  for name,size,density,font in [('320','840x1942','420','1.0'),('390','1170x2532','480','1.0'),('tablet900','1800x1800','320','1.0')]:
   h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','wm','size',size);h.run('shell','wm','density',density);h.run('shell','settings','put','system','font_scale',font);h.run('shell','am','start','-n',h.PACKAGE+'/.MainActivity')
   h.wait(lambda r:h.has('حسابي',r));r=profile();h.cap(name+'-profile',r);h.check(name+' profile pencil is accessible',h.has('تعديل الملف',r));h.tap('تعديل الملف',r);r=seek_field('نبذة عنك (اختيارية)');h.cap(name+'-edit',r);h.check(name+' edit Bio/save remain reachable',h.has('حفظ التغييرات',r));h.back()
   h.tap('الإعدادات',seek('الإعدادات'));r=h.wait(lambda r:h.has('إظهار قائمة المتابعين',r));h.cap(name+'-settings',r);h.check(name+' privacy settings reachable',h.has('إظهار قائمة المتابعين',r));h.back()
 elif mode=='public':
  for name,size,density in [('phone','1080x1920','420'),('tablet900','1800x1800','320')]:
   h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','wm','size',size);h.run('shell','wm','density',density);h.run('shell','am','start','-n',h.PACKAGE+'/.MainActivity');h.wait(lambda r:h.has('حسابي',r))
   link('user/social_qa_3363cce1_1');r=h.wait(lambda r:h.has('مراسلة',r));h.cap(name+'-public-username',r)
   h.check(name+' original Android username profile opens correct visitor identity',any('ليث · اختبار مستقل' in l for l in h.labels(r)) and h.has('مراسلة',r))
   h.check(name+' visitor follow/message actions remain visible',h.has('متابعة',r) and h.has('مراسلة',r))
 else:raise RuntimeError('Unknown native case')
except Exception as e:
 h.cap('failure-'+mode,h.tree());h.check('Native case '+mode,False,str(e));raise
finally:
 h.run('shell','settings','put','system','font_scale','1.0');h.run('shell','wm','size','reset');h.run('shell','wm','density','reset')

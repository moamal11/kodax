"""Current JavaScript on existing Expo Android development client, not a new release APK."""
import importlib.util,json,time,sys
from pathlib import Path
spec=importlib.util.spec_from_file_location('h','scripts/dev/android-release-check.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
h.PACKAGE='com.kodax.app';h.OUT=Path('reports/community-social-20261010/android-dev');h.OUT.mkdir(parents=True,exist_ok=True);h.CHECKS=h.OUT/'checks.json'
state=json.loads(Path('.env.community-social-qa.local').read_text(encoding='utf8'));stable='--stable' in sys.argv;large='--font160' in sys.argv
if stable:
 h.OUT=h.OUT/('font160' if large else 'font100');h.OUT.mkdir(parents=True,exist_ok=True);h.CHECKS=h.OUT/'checks.json'
 h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','settings','put','system','font_scale','1.6' if large else '1.0')
 h.run('shell','am','start','-a','android.intent.action.VIEW','-d','exp+kodax://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8084',h.PACKAGE)
 time.sleep(4)
def login():
 time.sleep(8) # Let the persisted session finish hydration before touching auth inputs.
 r=h.wait(lambda r:h.has('البريد الإلكتروني',r) or h.has('الرئيسية',r),limit=20)
 if h.has('الرئيسية',r):return
 h.fill('البريد الإلكتروني',state['accounts'][0]['email']);h.back();r=h.tree()
 if not any(n.get('content-desc')=='كلمة المرور' and 'EditText' in n.get('class','') for n in r.iter('node')):return
 h.fill('كلمة المرور',state['accounts'][0]['password']);h.back();h.tap('تسجيل الدخول',h.seek('تسجيل الدخول'))
 r=h.wait(lambda r:h.has('الرئيسية',r) or h.has('عدم السماح',r),limit=25)
 if h.has('عدم السماح',r):h.tap('عدم السماح',r)
 h.wait(lambda r:h.has('الرئيسية',r),limit=25)
def open_post():
 h.run('shell','am','start','-a','android.intent.action.VIEW','-d','kodax://discussion/'+state['question'],h.PACKAGE)
 return h.wait(lambda r:h.has('السؤال',r) and h.has('مشاركة',r),limit=20)
def open_share():
 r=open_post();h.tap('مشاركة',r);h.tap('إرسال في الرسائل',h.wait(lambda r:h.has('إرسال في الرسائل',r)))
 return h.wait(lambda r:h.has('ابحث عن حساب للمشاركة',r))
try:
 login();r=open_share();h.cap('phone-share-contacts',r)
 h.tap('ليث · اختبار مستقل',h.seek('ليث · اختبار مستقل',partial=True),partial=True)
 label='إرسال إلى ليث · اختبار مستقل'
 r=h.wait(lambda r:h.has(label,r));height=int(h.run('shell','wm','size').splitlines()[-1].split(':')[-1].strip().split('x')[1])
 def visible(r):
  n=h.find(label,r);return n is not None and h.bounds(n)[3]<=height
 h.check('Native send action visible without contact scrolling',visible(r));h.cap('phone-send-fixed',r)
 h.tap('ابحث عن حساب للمشاركة',r);r=h.tree();h.cap('phone-share-keyboard100',r)
 h.check('Native keyboard keeps footer visible',h.has('اختر حسابًا للإرسال',r) or h.has(label,r))
 if not stable:
  h.run('shell','settings','put','system','font_scale','1.6');time.sleep(1);r=h.tree();h.cap('phone-share-keyboard160',r)
  h.check('Live font scaling retains share and search field',h.has('ابحث عن حساب للمشاركة',r) and (h.has('اختر حسابًا للإرسال',r) or h.has(label,r)))
 h.run('shell','input','text','social_qa');r=h.tree();h.cap('phone-share-typed',r);h.check('Search typing remains functional',any('social_qa' in (n.get('text') or '') and 'EditText' in n.get('class','') for n in r.iter('node')))
 h.back();r=h.wait(lambda r:h.has('ابحث عن حساب للمشاركة',r));h.check('First Back keeps share after hiding keyboard',h.has('ابحث عن حساب للمشاركة',r));h.back();r=h.wait(lambda r:h.has('السؤال',r));h.check('Second Back dismisses share to actual post',h.has('السؤال',r))
finally:
 h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','settings','put','system','font_scale','1.0');h.run('shell','wm','size','reset');h.run('shell','wm','density','reset')

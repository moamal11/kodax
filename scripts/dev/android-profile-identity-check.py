"""Current JS in existing Android development client. Local fictional accounts only; no APK build."""
import importlib.util, json, time, sys, urllib.request
from pathlib import Path
spec=importlib.util.spec_from_file_location('h','scripts/dev/android-release-check.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
h.PACKAGE='com.kodax.app';h.OUT=Path('reports/profile-identity-20261009/android');h.OUT.mkdir(exist_ok=True);h.CHECKS=h.OUT/'checks.json'
original_wait=h.wait
def resilient_wait(predicate,limit=15):
    attempts=[0]
    def ready(r):
        if h.has('عدم السماح',r) and any('إشعارات' in x for x in h.labels(r)):
            h.tap('عدم السماح',r);return False
        if h.has('Continue',r) and any('This is the developer menu' in x for x in h.labels(r)):
            h.tap('Continue',r);return False
        if h.has('Close',r) and any('Runtime version' in x for x in h.labels(r)):
            h.tap('Close',r);return False
        if h.has('Reload',r) and attempts[0]<2:
            attempts[0]+=1;h.tap('Reload',r);time.sleep(8);return False
        return predicate(r)
    return original_wait(ready,limit)
h.wait=resilient_wait
def scroll(up=True):
    r=h.tree();areas=[h.bounds(n) for n in r.iter('node') if n.get('scrollable')=='true' and n.get('package')==h.PACKAGE and 'Horizontal' not in n.get('class','')]
    if not areas: return
    l,t,r,b=max(areas,key=lambda x:x[3]-x[1]);x=int(l+(r-l)*.2);a=int(t+(b-t)*.8);z=int(t+(b-t)*.2)
    h.run('shell','input','swipe',str(x),str(a if up else z),str(x),str(z if up else a),'420');time.sleep(.5)
def seek(label):
    for _ in range(12):
        r=h.tree()
        if h.has(label,r): return r
        scroll()
    raise RuntimeError('Unreachable '+label)
def profile():
    h.wait(lambda r:h.has('حسابي',r),limit=30);h.home();h.tap('حسابي');return h.wait(lambda r:h.has('تعديل الملف',r))
def save_ready():
    return h.wait(lambda r:any(n.get('content-desc')=='حفظ التغييرات' and n.get('enabled')=='true' and n.get('clickable')=='true' for n in r.iter('node')))
def api(email,route,body=None):
    req=urllib.request.Request('http://127.0.0.1:54323/auth/v1/token?grant_type=password',data=json.dumps({'email':email,'password':'kodax-local-123'}).encode(),headers={'Content-Type':'application/json'})
    session=json.load(urllib.request.urlopen(req))
    req=urllib.request.Request('http://127.0.0.1:54323'+route,data=None if body is None else json.dumps(body).encode(),headers={'Authorization':'Bearer '+session['access_token'],'Content-Type':'application/json'})
    return json.load(urllib.request.urlopen(req))
mode=sys.argv[1]
if mode=='keyboard':
    r=profile();h.tap('تعديل الملف',r);r=seek('نبذة عنك (اختيارية)');h.fill('نبذة عنك (اختيارية)','Android_draft_test');r=h.tree();h.cap('bio-keyboard',r)
    h.check('Bio field reachable with Android IME',any(n.get('text')=='Android_draft_test' for n in r.iter('node')))
    h.back();r=h.tree();h.check('First Back hides keyboard, retains profile editor draft',h.has('تعديل الملف الشخصي',r) and any(n.get('text')=='Android_draft_test' for n in r.iter('node')));h.cap('bio-keyboard-hidden',r)
    h.back();r=h.tree();h.check('Second Back closes editor',h.has('تعديل الملف',r) and not h.has('تعديل الملف الشخصي',r))
elif mode=='screens':
    for name,size,density,font in [('phone-font160','1170x2532','480','1.6'),('tablet-900','1800x1800','320','1.0')]:
        if len(sys.argv)>2 and sys.argv[2]!=name: continue
        h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','wm','size',size);h.run('shell','wm','density',density);h.run('shell','settings','put','system','font_scale',font)
        h.run('shell','am','start','-a','android.intent.action.VIEW','-d','kodax://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8102',h.PACKAGE)
        time.sleep(8)
        h.wait(lambda r:h.has('حسابي',r),limit=30);r=profile();h.cap(name+'-profile',r);h.check(name+' profile and edit action readable',h.has('تعديل الملف',r));h.tap('تعديل الملف',r);r=seek('نبذة عنك (اختيارية)');h.cap(name+'-edit-bio',r);h.check(name+' bio/counter and footer reachable',h.has('حفظ التغييرات',r));h.back()
        r=seek('الإعدادات');h.tap('الإعدادات',r);r=h.wait(lambda r:h.has('إظهار قائمة المتابعين',r));h.cap(name+'-settings',r);h.check(name+' settings switches visible',h.has('إظهار قائمة المتابعين',r));h.back()
    h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','wm','size','reset');h.run('shell','wm','density','reset');h.run('shell','settings','put','system','font_scale','1.0')
elif mode=='images':
    r=profile();h.tap('تعديل الملف',r);h.tap('تغيير الغلاف' if h.has('تغيير الغلاف',h.tree()) else 'اختيار غلاف');r=h.wait(lambda r:any('تم التقاط صورة' in x for x in h.labels(r)),limit=20);h.cap('final-photo-picker',r);h.tap('تم التقاط صورة',r,partial=True);r=h.wait(lambda r:h.has('تم',r));h.tap('تم',r);r=h.wait(lambda r:h.has('قُصّ',r));h.cap('final-cover-crop',r);h.tap('قُصّ',r);r=save_ready();h.tap('حفظ التغييرات',r);r=h.wait(lambda r:h.has('تعديل الملف',r));h.cap('final-native-cover-saved',r)
    saved=api('qa@kodax.local','/rest/v1/profiles?id=eq.00000000-0000-4000-8000-000000000001&select=cover_url,bio')
    h.check('Final Android picker/crop/upload and database persistence',bool(saved[0]['cover_url']) and bool(saved[0]['bio']))
    h.run('shell','am','force-stop',h.PACKAGE);h.run('shell','am','start','-a','android.intent.action.VIEW','-d','kodax://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8102',h.PACKAGE);h.wait(lambda r:h.has('حسابي',r),limit=30);r=profile();h.cap('final-native-after-restart',r);h.check('Native identity survives force-stop/reopen',h.has('غلاف سارة الكبيسي',r) and any('أتعلم Python' in x for x in h.labels(r)))
elif mode=='comments':
    # Enter own code through actual profile code list; no test-only native navigation.
    r=profile();h.tap('فحص التعليقات والردود',seek('فحص التعليقات والردود'));r=seek('عرض 2 ردود');h.cap('comments-closed',r);h.check('Native replies hidden initially',not any('تقدر تفصل المنطق' in x for x in h.labels(r)));h.tap('عرض 2 ردود',r);r=seek('إخفاء الردود');h.cap('comments-open',r);h.check('Native reply thread expands',h.has('إخفاء الردود',r));r=seek('اكتب تعليقًا');h.fill('اكتب تعليقًا','Android_reply_test');h.back();h.tap('إرسال التعليق',seek('إرسال التعليق'));r=seek('Android_reply_test');h.cap('comment-native-saved',r);h.check('Android comment composer persists and remains scrollable',h.has('Android_reply_test',r));h.back()
elif mode in ['logout','login']:
    if mode=='logout':
        r=profile();h.tap('الإعدادات',seek('الإعدادات'));h.tap('تسجيل الخروج',seek('تسجيل الخروج'));h.tap('خروج')
    r=h.wait(lambda r:h.has('البريد الإلكتروني',r) or h.has('تسجيل الدخول',r))
    if not h.has('البريد الإلكتروني',r):h.tap('تسجيل الدخول',r)
    h.wait(lambda r:any(n.get('content-desc')=='البريد الإلكتروني' and 'EditText' in n.get('class','') for n in r.iter('node')))
    h.fill('البريد الإلكتروني','qa@kodax.local');h.back();h.fill('كلمة المرور','kodax-local-123');h.back();h.tap('تسجيل الدخول',seek('تسجيل الدخول'));h.wait(lambda r:h.has('حسابي',r));r=profile();h.cap('native-after-relogin' if mode=='logout' else 'native-after-reinstall-login',r);h.check('Native identity persists after actual logout/login' if mode=='logout' else 'Native saved identity fetched after existing client reinstall/login',h.has('غلاف سارة الكبيسي',r) and any('أتعلم Python' in x for x in h.labels(r)))
    if mode=='logout':
        h.tap('الإعدادات',seek('الإعدادات'));r=h.wait(lambda r:h.has('إظهار قائمة المتابعين',r));h.cap('native-settings-after-relogin',r);h.check('Native privacy switches persist after actual logout/login',sum('القائمة متاحة لك فقط' in x for x in h.labels(r))>=2);h.back()

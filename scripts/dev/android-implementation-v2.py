import os, subprocess, time, re, json, sys, xml.etree.ElementTree as E
from pathlib import Path
adb=str(Path(os.environ['LOCALAPPDATA'])/'Android/Sdk/platform-tools/adb.exe')
out=Path('reports/visual-implementation-v2/android'); out.mkdir(parents=True,exist_ok=True)
def run(*args): return subprocess.check_output([adb,'-s','emulator-5554',*args],timeout=30)
def relaunch():
 run('shell','am','force-stop','com.kodax.app')
 run('shell','am','start','-a','android.intent.action.VIEW','-d','kodax://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8102','com.kodax.app');time.sleep(10)
def tree():
 for _ in range(3):
  if b'dumped' in run('shell','uiautomator','dump','/sdcard/kodax-v2.xml'):
   return E.fromstring(run('shell','cat','/sdcard/kodax-v2.xml'))
  time.sleep(1)
 raise RuntimeError('No fresh UI tree')
def cap(name,r=None):
 (out/(name+'.png')).write_bytes(run('exec-out','screencap','-p'))
 if 'keyboard' in name: return print('CAPTURE',name,flush=True)
 if r is None: r=tree()
 (out/(name+'.xml')).write_bytes(E.tostring(r,encoding='utf-8')); print('CAPTURE',name,flush=True)
def tap(label):
 r=tree(); ns=[n for n in r.iter('node') if n.get('text')==label or n.get('content-desc')==label]
 if not ns: raise RuntimeError('Missing UI: '+label)
 n=next((n for n in reversed(ns) if n.get('clickable')=='true'),ns[-1]); x1,y1,x2,y2=map(int,re.findall(r'\d+',n.get('bounds')))
 if y2<=y1: raise RuntimeError('Offscreen UI: '+label)
 run('shell','input','tap',str((x1+x2)//2),str((y1+y2)//2)); time.sleep(2)
def open_route(route,marker,name):
 tabs={'learn':'تعلّم','profile':'حسابي','code':'المجتمع','ai':'المساعد'}
 if route in tabs:
  for _ in range(20):
   r=tree()
   denial=next((n.get('text') for n in r.iter('node') if n.get('text') in ["Don’t allow", "Don't allow"]),None)
   if denial: tap(denial);continue
   if any(n.get('content-desc')==tabs[route] for n in r.iter('node')): break
   time.sleep(2)
  tap(tabs[route])
 else: run('shell','am','start','-a','android.intent.action.VIEW','-d','kodax:///'+route.lstrip('/'),'com.kodax.app')
 time.sleep(4)
 for _ in range(6):
  r=tree()
  if any(marker in (n.get('text','')+' '+n.get('content-desc','')) for n in r.iter('node')): cap(name,r); return
  if route not in tabs: run('shell','am','start','-a','android.intent.action.VIEW','-d','kodax:///'+route.lstrip('/'),'com.kodax.app')
  time.sleep(2)
 raise RuntimeError('Route did not show '+marker)
def fill(label,value):
 r=tree(); n=next(n for n in r.iter('node') if n.get('content-desc')==label and 'EditText' in n.get('class',''))
 x1,y1,x2,y2=map(int,re.findall(r'\d+',n.get('bounds')));run('shell','input','tap',str((x1+x2)//2),str((y1+y2)//2));time.sleep(1)
 run('shell','input','keycombination','113','29')
 run('shell','input','keyevent','67')
 run('shell','input','text',value);time.sleep(2)
def swipe(): run('shell','input','swipe','510','1600','510','430','380');time.sleep(1)
mode=sys.argv[1]
if mode=='overview':
 for route,marker,name in [('learn','خطوتك التالية','learn'),('course/py-basics','تقدمك','course'),('rewards','إنجازك القادم','rewards'),('profile','تعديل الملف','profile'),('ai','سياق الدرس','ai'),('code','اكتب كوداً','community'),('support','أرسل للدعم','support'),('notification-settings','الإشعارات','settings')]: open_route(route,marker,name)
elif mode=='modals':
 open_route('profile','تعديل الملف','profile');tap('تعديل الملف');cap('profile-edit');fill('الاسم الكامل','keyboard-test');cap('profile-edit-keyboard');run('shell','input','keyevent','4');tap('إلغاء')
 open_route('code','اكتب كوداً','community');tap('اكتب كوداً');cap('languages');fill('ابحث عن لغة','Python');cap('language-keyboard');run('shell','input','keyevent','4');tap('Python');time.sleep(5);cap('editor');run('shell','input','keyevent','4');time.sleep(2)
 open_route('ai','سياق الدرس','ai');fill('رسالة للمساعد','Explain%sthis%scode');cap('ai-keyboard');run('shell','input','keyevent','4')
elif mode=='font':
 run('shell','settings','put','system','font_scale','1.6')
 try:
  relaunch()
  for route,marker,name in [('learn','الدورات','font160-learn'),('profile','حسابي','font160-profile'),('rewards','المكافآت والمستويات','font160-rewards')]:
   open_route(route,marker,name);swipe();cap(name+'-scroll')
 finally:
  run('shell','settings','put','system','font_scale','1.0');relaunch()
elif mode=='badges':
 open_route('rewards','إنجازك القادم','rewards')
 for _ in range(6):
  r=tree()
  if any(n.get('text')=='كل الشارات' for n in r.iter('node')): break
  swipe()
 tap('كل الشارات');cap('badges')
elif mode=='capture': cap(sys.argv[2])

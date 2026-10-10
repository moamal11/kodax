"""Read-only badge validation through the actual Android UI and local database."""
import urllib.request
from pathlib import Path
exec(Path('scripts/dev/android-implementation-v2.py').read_text(encoding='utf-8').split('mode=sys.argv[1]')[0])
out=Path('reports/visual-polish-v2-final/badge-validation/android');out.mkdir(parents=True,exist_ok=True)
checks=[]

def tree():
 # API 37's UI automation bridge can restart after app or keyboard changes.
 # Retry fresh dumps; never accept the previous account's saved UI tree.
 for _ in range(6):
  try:
   result=subprocess.run([adb,'-s','emulator-5554','shell','uiautomator','dump','--compressed','/sdcard/kodax-badge-validation.xml'],capture_output=True,timeout=30)
   if result.returncode==0 and b'dumped' in result.stdout:
    return E.fromstring(run('shell','cat','/sdcard/kodax-badge-validation.xml'))
  except (subprocess.SubprocessError,E.ParseError):pass
  time.sleep(1)
 raise RuntimeError('No fresh badge validation UI tree')

def check(name,ok,detail=None):
 checks.append({'name':name,'ok':bool(ok),'detail':detail})
 (out/'checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
 print('PASS' if ok else 'FAIL',name,flush=True)

def visible(n):
 b=list(map(int,re.findall(r'\d+',n.get('bounds',''))))
 return len(b)==4 and b[3]>b[1] and b[1]>70 and (b[1]+b[3])//2<1850

def seek(label,limit=24):
 for _ in range(limit):
  r=tree()
  if any((n.get('text')==label or n.get('content-desc')==label) and visible(n) for n in r.iter('node')):return r
  swipe()
 raise RuntimeError('Unreachable UI '+label)

def wait_ready(predicate,limit=24):
 for _ in range(limit):
  r=tree()
  if predicate(r):return r
  time.sleep(1)
 raise RuntimeError('Native UI did not become ready')

def has_tabs(r):return any(n.get('content-desc')=='حسابي' for n in r.iter('node'))

def boot():
 run('shell','am','force-stop','com.kodax.app')
 run('shell','am','start','-a','android.intent.action.VIEW','-d','kodax://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8102','com.kodax.app')
 time.sleep(12)
 wait_ready(lambda r:has_tabs(r) or any(n.get('content-desc')=='البريد الإلكتروني' or n.get('text')=='إنشاء حساب مجاني' for n in r.iter('node')))

def go_home():
 for _ in range(8):
  r=tree()
  if has_tabs(r):tap('الرئيسية');return
  run('shell','input','keyevent','4');time.sleep(1)
 raise RuntimeError('Main navigation unavailable')

def open_rewards(name):
 go_home();time.sleep(2)
 r=wait_ready(lambda r:any(n.get('clickable')=='true' and n.get('content-desc','').startswith('المستوى ') for n in r.iter('node')))
 label=next(n.get('content-desc') for n in r.iter('node') if n.get('clickable')=='true' and n.get('content-desc','').startswith('المستوى '))
 tap(label)
 r=wait_ready(lambda r:any(n.get('text')=='معرض الشارات' for n in r.iter('node')))
 check(name+' has no visible developer error',not any('Looks like you have configured' in n.get('text','')+n.get('content-desc','') for n in r.iter('node')))
 cap(name,r)

def login(email):
 r=tree()
 if has_tabs(r) or not any(n.get('content-desc')=='البريد الإلكتروني' or n.get('text')=='إنشاء حساب مجاني' for n in r.iter('node')):
  go_home();tap('حسابي')
  seek('تسجيل الخروج',16);tap('تسجيل الخروج');tap('خروج');time.sleep(3)
 r=tree()
 if not any(n.get('content-desc')=='البريد الإلكتروني' for n in r.iter('node')):tap('تسجيل الدخول')
 wait_ready(lambda r:any(n.get('content-desc')=='البريد الإلكتروني' for n in r.iter('node')))
 fill('البريد الإلكتروني',email);run('shell','input','keyevent','4')
 fill('كلمة المرور','kodax-local-123');run('shell','input','keyevent','4')
 seek('تسجيل الدخول',4);tap('تسجيل الدخول');wait_ready(has_tabs)

def data(email):
 q=urllib.request.Request('http://localhost:54321/auth/v1/token?grant_type=password',data=json.dumps({'email':email,'password':'kodax-local-123'}).encode(),headers={'Content-Type':'application/json'})
 s=json.load(urllib.request.urlopen(q));headers={'Authorization':'Bearer '+s['access_token'],'Content-Type':'application/json'}
 def get(path):return json.load(urllib.request.urlopen(urllib.request.Request('http://localhost:54321'+path,headers=headers)))
 records=get('/rest/v1/user_badges?select=badge_id,earned_at&user_id=eq.'+s['user']['id'])
 xp=get('/rest/v1/profiles?select=xp&id=eq.'+s['user']['id'])[0]['xp']
 coins=json.load(urllib.request.urlopen(urllib.request.Request('http://localhost:54321/rest/v1/rpc/coins_get_state',data=b'{}',headers=headers)))['balance']
 return {'badges':records,'xp':xp,'coins':coins}

old=run('shell','settings','get','system','font_scale').decode().strip()
try:
 run('shell','settings','put','system','font_scale','1.0');boot()
 for account,email,count in [('new','new@kodax.local',0),('earned','levelup@kodax.local',4)]:
  before=data(email);check(account+' database badge count',len(set(b['badge_id'] for b in before['badges']))==count,before['badges'])
  login(email)
  for scale in [1.0,1.6]:
   run('shell','settings','put','system','font_scale',str(scale));boot()
   suffix=account+('-font160' if scale==1.6 else '')
   open_rewards(suffix+'-rewards')
   label=f'الشارات: {count} من 44. عرض الكل';r=tree()
   check(suffix+' gallery count matches actual database',any(n.get('content-desc')==label for n in r.iter('node')))
   check(suffix+' all badges action remains readable',any(n.get('text')=='كل الشارات' and visible(n) for n in r.iter('node')))
   tap('كل الشارات')
   if account=='earned':r=seek('الخطوة الأولى، مكتسبة')
   else:r=tree()
   cap(suffix+'-sheet',r)
   labels=[n.get('content-desc','') for n in r.iter('node') if '، مكتسبة' in n.get('content-desc','') or '، لم تُكتسب بعد:' in n.get('content-desc','')]
   check(suffix+' badge sheet exposes acquisition states and conditions',any('لم تُكتسب بعد: أكمل' in s for s in labels) and (account=='new' or any(s=='الخطوة الأولى، مكتسبة' for s in labels)),labels)
   tap('إغلاق')
  check(account+' viewing leaves records XP and coins unchanged',data(email)==before)
  run('shell','settings','put','system','font_scale','1.0');boot()
finally:
 run('shell','settings','put','system','font_scale',old);boot()
 login('qa@kodax.local')
 (out/'checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps(checks,ensure_ascii=False),flush=True)
if any(not c['ok'] for c in checks):raise SystemExit(1)

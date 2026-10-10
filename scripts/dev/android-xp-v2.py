"""Actual native UI actions against fictional LOCAL fixtures; read-only API assertions."""
import urllib.request, os, json, subprocess, time, re, sys
from pathlib import Path
exec(Path('scripts/dev/android-implementation-v2.py').read_text(encoding='utf-8').split('mode=sys.argv[1]')[0])
def visible(n):
 b=list(map(int,re.findall(r'\d+',n.get('bounds',''))))
 return len(b)==4 and b[3]>b[1] and b[1]>70 and (b[1]+b[3])//2<1850
def seek(label,limit=40):
 for _ in range(limit):
  r=tree()
  if any((n.get('text')==label or n.get('content-desc')==label) and visible(n) for n in r.iter('node')): return
  swipe()
 raise RuntimeError('Unreachable UI '+label)
def login(email):
 open_route('profile','حسابي','xp-profile-before')
 seek('تسجيل الخروج',12);tap('تسجيل الخروج');tap('خروج');time.sleep(4)
 open_route('login','البريد الإلكتروني','xp-login')
 fill('البريد الإلكتروني',email);run('shell','input','keyevent','4')
 fill('كلمة المرور','kodax-local-123');run('shell','input','keyevent','4')
 seek('تسجيل الدخول',4);tap('تسجيل الدخول');time.sleep(8)
def session():
 q=urllib.request.Request('http://localhost:54321/auth/v1/token?grant_type=password',data=json.dumps({'email':'levelup@kodax.local','password':'kodax-local-123'}).encode(),headers={'Content-Type':'application/json'})
 return json.load(urllib.request.urlopen(q))
def xp(s):
 q=urllib.request.Request('http://localhost:54321/rest/v1/profiles?select=xp&id=eq.'+s['user']['id'],headers={'Authorization':'Bearer '+s['access_token']})
 return json.load(urllib.request.urlopen(q))[0]['xp']
mode=sys.argv[1]
if mode=='prepare':
 login('levelup@kodax.local');open_route('learn','الدورات','xp-learn');tap('كمّل الدرس');time.sleep(4);cap('xp-lesson-start')
elif mode=='normal' or mode=='reduced':
 reduced=mode=='reduced';s=session();before=xp(s)
 old=run('shell','settings','get','global','transition_animation_scale').decode().strip()
 try:
  if reduced: run('shell','settings','put','global','transition_animation_scale','0')
  route='py-5' if reduced else 'py-basics-booleans'
  title='الشروط if/else' if reduced else 'القيم المنطقية والمقارنات'
  answer='عندما يكون شرط if خاطئ' if reduced else 'False'
  if reduced:
   cap('xp-reduced-start')
  else:
   open_route('lesson/'+route,title,'xp-'+mode+'-start')
  seek(answer);tap(answer);seek('تحقق من الإجابة');tap('تحقق من الإجابة');seek('أكمل الدرس');cap('xp-'+mode+'-ready')
  remote='/sdcard/kodax-v2-xp-'+mode+'.mp4'
  recording=subprocess.Popen([adb,'-s','emulator-5554','shell','screenrecord','--time-limit','25',remote],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  tap('أكمل الدرس');seek('أحسنت! أكملت الدرس',15);cap('xp-'+mode+'-result')
  after=xp(s);recording.wait(timeout=30);run('pull',remote,str(out/('xp-'+mode+'.mp4')))
  tap('الدورة');seek(title);tap(title);time.sleep(3)
  seek(answer);tap(answer);seek('تحقق من الإجابة');tap('تحقق من الإجابة');seek('أكمل الدرس');tap('أكمل الدرس');seek('راجعت هذا الدرس');cap('xp-'+mode+'-review')
  repeated=xp(s)
  result={'mode':mode,'lesson':route,'xpBefore':before,'xpAfter':after,'xpAfterReopen':repeated,'checks':[{'name':'Native completion awards exactly 100 real XP','ok':after==before+100},{'name':'Reopening does not repeat XP','ok':repeated==after}]}
  (out/('xp-'+mode+'-results.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(result,ensure_ascii=False),flush=True)
 finally:
  if reduced: run('shell','settings','put','global','transition_animation_scale',old)
elif mode=='restore': login('qa@kodax.local')
elif mode=='normal-review':
 s=session();run('shell','input','keyevent','4');time.sleep(2)
 open_route('lesson/py-basics-booleans','أساسيات Python','xp-normal-reopen-top');seek('راجعت هذا الدرس');cap('xp-normal-review')
 after=xp(s);result={'mode':'normal','lesson':'py-basics-booleans','xpBefore':500,'xpAfter':600,'xpAfterReopen':after,'checks':[{'name':'Actual first native completion awards 100 XP','ok':after==600},{'name':'Reopening shows review without a second award','ok':after==600}]}
 (out/'xp-normal-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(result,ensure_ascii=False),flush=True)

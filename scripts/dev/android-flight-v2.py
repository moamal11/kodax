"""Record an actual award after locating the native action, without recording UI-tree waits."""
from pathlib import Path
exec(Path('scripts/dev/android-xp-v2.py').read_text(encoding='utf-8').rsplit('mode=sys.argv[1]',1)[0])
login('levelup@kodax.local')
open_route('learn','الدورات','flight-learn');tap('كمّل الدرس');time.sleep(3)
seek('[2, 3, 4]');tap('[2, 3, 4]');seek('تحقق من الإجابة');tap('تحقق من الإجابة');seek('أكمل الدرس')
r=tree();n=next(n for n in r.iter('node') if n.get('content-desc')=='أكمل الدرس' and n.get('clickable')=='true')
x1,y1,x2,y2=map(int,re.findall(r'\d+',n.get('bounds')))
s=session();before=xp(s);cap('xp-flight-ready',r)
remote='/sdcard/kodax-v2-flight.mp4'
p=subprocess.Popen([adb,'-s','emulator-5554','shell','screenrecord','--size','540x960','--bit-rate','1000000','--time-limit','60',remote],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(1);run('shell','input','tap',str((x1+x2)//2),str((y1+y2)//2))
seek('أحسنت! أكملت الدرس',20);cap('xp-flight-result');after=xp(s)
p.wait(timeout=65);run('pull',remote,str(out/'xp-flight.mp4'))
(out/'xp-flight-results.json').write_text(json.dumps({'lesson':'py-6','xpBefore':before,'xpAfter':after,'ok':after==before+100,'motionSetting':run('shell','settings','get','global','transition_animation_scale').decode().strip()},indent=2),encoding='utf-8')
print('Native recorded award',before,after,flush=True)

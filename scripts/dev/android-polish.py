import os,subprocess,xml.etree.ElementTree as E,sys,time,re,json
from pathlib import Path
adb=str(Path(os.environ['LOCALAPPDATA'])/'Android/Sdk/platform-tools/adb.exe')
out=Path(os.environ.get('ANDROID_REVIEW_OUT','reports/design-polish/android'));out.mkdir(parents=True,exist_ok=True)
def run(*args): return subprocess.check_output([adb,*args],timeout=25)
def tree():
 for attempt in range(3):
  result=run('shell','uiautomator','dump','/sdcard/kodax-polish.xml')
  if b'dumped' in result:
   x=run('shell','cat','/sdcard/kodax-polish.xml');return E.fromstring(x)
  time.sleep(1)
 raise RuntimeError('No fresh Android UI tree: '+result.decode(errors='replace'))

args=sys.argv[1:]
if args and args[0]=='tap':
 label=args[1];r=tree();nodes=[n for n in r.iter('node') if (n.get('text')==label or n.get('content-desc')==label)]
 if not nodes: raise Exception('UI label absent: '+label)
 n=next((n for n in reversed(nodes) if n.get('clickable')=='true'),nodes[-1]);nums=list(map(int,re.findall(r'\d+',n.get('bounds'))));print('tap',label,nums);run('shell','input','tap',str((nums[0]+nums[2])//2),str((nums[1]+nums[3])//2));time.sleep(5)
elif args and args[0]=='open':
 run('shell','am','start','-a','android.intent.action.VIEW','-d','kodax://'+args[1],'com.kodax.app');time.sleep(12)
name=args[2] if len(args)>2 else 'current';r=tree()
for n in r.iter('node'):
 s=n.get('text') or n.get('content-desc')
 if s: print(s[:100],n.get('bounds'))
(out/(name+'.xml')).write_bytes(E.tostring(r,encoding='utf-8'));(out/(name+'.png')).write_bytes(run('exec-out','screencap','-p'))

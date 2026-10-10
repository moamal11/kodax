"""Sequential interaction with one emulator; each flow keeps its own evidence log."""
import subprocess,sys,time,json
from pathlib import Path
flows=[
 ('scripts/dev/android-live-profile-check.py','screens','reports/profile-live-20261010/android-screens.log'),
 ('scripts/dev/android-live-profile-check.py','comments','reports/profile-live-20261010/android-comments.log'),
 ('scripts/dev/android-live-profile-check.py','logout','reports/profile-live-20261010/android-logout.log'),
 ('scripts/dev/android-community-check.py','feed','reports/community-discussions-20261010/android-feed.log'),
 ('scripts/dev/android-community-check.py','compose','reports/community-discussions-20261010/android-compose.log'),
 ('scripts/dev/android-community-check.py','tablet','reports/community-discussions-20261010/android-tablet.log'),
 ('scripts/dev/android-native-cascade-check.py',None,'reports/community-discussions-20261010/android-native-cascade.log'),
 ('scripts/dev/android-live-xp-check.py','normal','reports/community-discussions-20261010/android-xp-normal.log'),
 ('scripts/dev/android-live-xp-check.py','reduced','reports/community-discussions-20261010/android-xp-reduced.log'),
]
start=int(sys.argv[1]) if len(sys.argv)>1 else 0
results=[]
for script,mode,log in flows[start:]:
 if Path('reports/community-discussions-20261010/android-tests-deferred.flag').exists():
  print('DEFERRED: user extended community functionality; resume after updated bundle',flush=True);break
 print('START',script,mode,flush=True)
 with open(log,'w',encoding='utf8') as f:r=subprocess.run([sys.executable,'-u',script]+([mode] if mode else []),stdout=f,stderr=subprocess.STDOUT)
 results.append({'script':script,'mode':mode,'exit':r.returncode,'at':time.strftime('%Y-%m-%dT%H:%M:%S'),'log':log})
 Path('reports/community-discussions-20261010/android-run.json').write_text(json.dumps(results,indent=2),encoding='utf8')
 print('END',mode or script,'exit',r.returncode,flush=True)
 if r.returncode:
  print(Path(log).read_text(encoding='utf8')[-2400:],flush=True);sys.exit(r.returncode)

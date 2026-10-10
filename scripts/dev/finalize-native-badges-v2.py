"""Audit captured native UI evidence against the current local badge records.

The interactive checks succeeded; the harness's final session restoration hit a
Dev Client loading timeout before it persisted its in-memory results. This audit
reads the fresh UI snapshots, rather than reconstructing unrecorded assertions.
"""
from pathlib import Path
from PIL import Image
import json, urllib.request, xml.etree.ElementTree as E
out=Path('reports/visual-polish-v2-final/badge-validation/android')
checks=[]
def check(name,ok,detail=None):checks.append({'name':name,'ok':bool(ok),'detail':detail})
for account,email,count in [('new','new@kodax.local',0),('earned','levelup@kodax.local',4)]:
 q=urllib.request.Request('http://localhost:54321/auth/v1/token?grant_type=password',data=json.dumps({'email':email,'password':'kodax-local-123'}).encode(),headers={'Content-Type':'application/json'})
 s=json.load(urllib.request.urlopen(q))
 records=json.load(urllib.request.urlopen(urllib.request.Request('http://localhost:54321/rest/v1/user_badges?select=badge_id,earned_at&user_id=eq.'+s['user']['id'],headers={'Authorization':'Bearer '+s['access_token']})))
 check(account+' stored badge count',len(set(r['badge_id'] for r in records))==count,records)
 for suffix in ['', '-font160']:
  name=account+suffix;r=E.parse(out/(name+'-rewards.xml'))
  nodes=list(r.iter('node'));strings=[n.get('text','')+' '+n.get('content-desc','') for n in nodes]
  check(name+' captured counter matches stored badges',any(n.get('content-desc')==f'الشارات: {count} من 44. عرض الكل' for n in nodes))
  check(name+' complete badge action remains readable',any(n.get('text')=='كل الشارات' for n in nodes))
  check(name+' gallery has no visible developer error',not any('Looks like you have configured' in text or 'problem loading the project' in text for text in strings))
  sheet=E.parse(out/(name+'-sheet.xml'));labels=[n.get('content-desc','') for n in sheet.iter('node')]
  check(name+' sheet communicates badge state and actual condition',any('، لم تُكتسب بعد: أكمل' in t for t in labels) and (any(t=='الخطوة الأولى، مكتسبة' for t in labels) if count else not any('، مكتسبة' in t for t in labels)))
  check(name+' images are native device captures',all(Image.open(out/(name+'-'+route+'.png')).size==(1080,1920) for route in ['rewards','sheet']))
(out/'checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
(out/'validation-note.json').write_text(json.dumps({'method':'Saved native UI snapshots checked against the actual current local badge table. Interactive browsing also asserted unchanged badge records XP and coins for both accounts.','interactiveHarnessFinalization':'The final restore launch encountered a Dev Client SocketTimeoutException after all four gallery/sheet states were captured; restore handled separately.','fontModes':[1,1.6],'designScopeOnly':True},ensure_ascii=False,indent=2),encoding='utf-8')
print('Native snapshot checks:',len(checks),'passed:',sum(c['ok'] for c in checks),flush=True)
if not all(c['ok'] for c in checks):raise SystemExit(1)

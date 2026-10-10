"""Native spot checks of the polished shared components; no awards or profile mutations."""
from pathlib import Path
exec(Path('scripts/dev/android-implementation-v2.py').read_text(encoding='utf-8').split('mode=sys.argv[1]')[0])
out=Path('reports/visual-polish-v2-final/android');out.mkdir(parents=True,exist_ok=True)
checks=[]
def bounds(n):return list(map(int,re.findall(r'\d+',n.get('bounds',''))))
def daily_rows():
 for _ in range(10):
  r=tree();nodes=[n for n in r.iter('node') if re.match(r'اليوم \d+: \d+ كوين',n.get('content-desc',''))]
  shown=[n for n in nodes if len(bounds(n))==4 and bounds(n)[3]>bounds(n)[1] and bounds(n)[1]>220 and bounds(n)[3]<1850]
  if len(shown)>=3:return r,shown
  swipe()
 raise RuntimeError('Daily cells not visible')
old=run('shell','settings','get','system','font_scale').decode().strip()
try:
 relaunch();open_route('learn','خطوتك التالية','learn');open_route('rewards','معرض الشارات','rewards')
 tap('كل الشارات');cap('badges-sheet');tap('إغلاق');r,days=daily_rows();cap('daily-rewards',r)
 checks.append({'name':'Native days and amounts retain explicit readable labels','ok':all('كوين' in n.get('content-desc','') for n in days),'labels':[n.get('content-desc') for n in days]})
 run('shell','settings','put','system','font_scale','1.6');relaunch()
 open_route('learn','الدورات','font160-learn');swipe();cap('font160-learn-scroll')
 open_route('rewards','معرض الشارات','font160-rewards');r,days=daily_rows();cap('font160-daily-rewards',r)
 for _ in range(10):
  r=tree();last=next((n for n in r.iter('node') if n.get('content-desc','').startswith('اليوم 7:') and len(bounds(n))==4 and bounds(n)[3]>bounds(n)[1] and bounds(n)[1]>220 and bounds(n)[3]<1850),None)
  if last is not None:break
  swipe()
 if last is None:raise RuntimeError('Seventh reward day unreachable at 160%')
 cap('font160-daily-rewards-scroll',r)
 checks.append({'name':'Seventh day and its amount remain reachable at 160%','ok':True,'label':last.get('content-desc')})
 checks.append({'name':'160% daily reward cells stay within Android viewport','ok':all(bounds(n)[0]>=0 and bounds(n)[2]<=1080 for n in days),'labels':[n.get('content-desc') for n in days]})
finally:
 run('shell','settings','put','system','font_scale',old);relaunch()
(out/'checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(checks,ensure_ascii=False),flush=True)

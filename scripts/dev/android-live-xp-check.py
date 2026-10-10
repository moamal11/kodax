"""Normal lesson completion by dedicated live QA account; no direct XP writes."""
import importlib.util,json,time,sys,subprocess
from pathlib import Path
spec=importlib.util.spec_from_file_location('h','scripts/dev/android-release-check.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
h.OUT=Path('reports/community-discussions-20261010/android');h.OUT.mkdir(parents=True,exist_ok=True);h.CHECKS=h.OUT/'checks.json'
mode=sys.argv[1];reduced=mode=='reduced';lesson='py-2' if reduced else 'py-1';answer='float' if reduced else 'print()'
def xp():
 code="const q=require('./scripts/dev/live-profile-client.cjs'),fs=require('fs');let s=JSON.parse(fs.readFileSync(q.PRIVATE));(async()=>{let c=q.clients().client();await q.login(c,s.accounts[0]);let r=await c.from('profiles').select('xp').eq('id',s.accounts[0].id).single();if(r.error)throw r.error;console.log(r.data.xp)})()"
 return int(subprocess.check_output(['node','-e',code]).decode().strip())
def seek(label,clickable=False):
 for _ in range(25):
  r=h.tree();n=h.find(label,r)
  if n is not None and (not clickable or n.get('clickable')=='true'):
   _,top,_,bottom=h.bounds(n);height=int([x for x in h.run('shell','wm','size').splitlines() if 'size:' in x][-1].split(':')[-1].strip().split('x')[1])
   if top>=30 and bottom<height:return r
  h.swipe(root=r)
 raise RuntimeError('Unreachable '+label)
old=h.run('shell','settings','get','global','transition_animation_scale').strip();before=xp()
try:
 h.run('shell','settings','put','global','transition_animation_scale','0' if reduced else '1');time.sleep(1)
 h.run('shell','am','start','-W','-a','android.intent.action.VIEW','-d','kodax-preview://lesson/'+lesson,h.PACKAGE);time.sleep(3)
 h.tap(answer,seek(answer,True));h.tap('تحقق من الإجابة',seek('تحقق من الإجابة',True));r=seek('أكمل الدرس',True);h.cap('xp-'+mode+'-ready',r)
 remote='/sdcard/kodax-live-xp-'+mode+'.mp4';recording=subprocess.Popen([h.ADB,'-s',h.SERIAL,'shell','screenrecord','--time-limit','18',remote],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 time.sleep(1);h.tap('أكمل الدرس',r);r=seek('أحسنت! أكملت الدرس');h.cap('xp-'+mode+'-result',r);after=xp();h.check('Live native '+mode+' lesson awards expected 100 XP',after==before+100,{'before':before,'after':after,'lesson':lesson});recording.wait(timeout=25);h.run('pull',remote,str(h.OUT/('xp-'+mode+'.mp4')))
 h.run('shell','am','start','-W','-a','android.intent.action.VIEW','-d','kodax-preview://lesson/'+lesson,h.PACKAGE);time.sleep(3)
 h.tap(answer,seek(answer,True));h.tap('تحقق من الإجابة',seek('تحقق من الإجابة',True));h.tap('أكمل الدرس',seek('أكمل الدرس',True));r=seek('راجعت هذا الدرس');h.cap('xp-'+mode+'-review',r);repeated=xp();h.check('Native '+mode+' repeat completion does not duplicate XP',repeated==after)
 (h.OUT/('xp-'+mode+'-results.json')).write_text(json.dumps({'lesson':lesson,'before':before,'after':after,'repeated':repeated,'reduceMotionSystemValue':'0' if reduced else '1','route':'installed app normal deep link, no development harness'},ensure_ascii=False,indent=2),encoding='utf8')
finally:h.run('shell','settings','put','global','transition_animation_scale',old)

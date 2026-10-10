import importlib.util,json,subprocess,time
from pathlib import Path
spec=importlib.util.spec_from_file_location('h','scripts/dev/android-release-check.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
h.OUT=Path('reports/community-discussions-20261010/android');h.OUT.mkdir(parents=True,exist_ok=True);h.CHECKS=h.OUT/'checks.json'
def node(code):return json.loads(subprocess.check_output(['node','-e',code]).decode('utf8'))
prefix="const q=require('./scripts/dev/live-profile-client.cjs'),fs=require('fs'),crypto=require('crypto'),s=JSON.parse(fs.readFileSync(q.PRIVATE)),{client}=q.clients(),a=client(),b=client();const must=r=>{if(r.error)throw r.error;return r.data;};"
fixtures=node(prefix+"(async()=>{await q.login(a,s.accounts[0]);await q.login(b,s.accounts[1]);let post=crypto.randomUUID(),snippet=crypto.randomUUID(),items=[];must(await a.rpc('save_community_post',{p_id:post,p_title:'اختبار Android · حذف الردود',p_body:'حسابات اختبار مخصصة',p_kind:'question'}));must(await a.from('code_snippets').insert({id:snippet,user_id:s.accounts[0].id,title:'اختبار Android · تعليقات الكود',code:'print(1)',language:'python',is_public:true}));for(let type of ['discussion','code']){let root=crypto.randomUUID(),reply=crypto.randomUUID();if(type==='discussion'){must(await a.rpc('save_community_comment',{p_id:root,p_post:post,p_content:'أصل اختبار Android'}));must(await b.rpc('save_community_comment',{p_id:reply,p_post:post,p_content:'رد الحساب الثاني',p_parent:root}));}else{must(await a.from('code_comments').insert({id:root,user_id:s.accounts[0].id,snippet_id:snippet,content:'أصل اختبار Android'}));must(await b.from('code_comments').insert({id:reply,user_id:s.accounts[1].id,snippet_id:snippet,parent_id:root,content:'رد الحساب الثاني'}));}items.push({type,id:type==='code'?snippet:post,root,reply});}console.log(JSON.stringify(items));})()")
def seek(label):
 for _ in range(20):
  r=h.tree();n=h.find(label,r)
  if n is not None:
   _,top,_,bottom=h.bounds(n);height=int([x for x in h.run('shell','wm','size').splitlines() if 'size:' in x][-1].split(':')[-1].strip().split('x')[1])
   if top>=0 and bottom<=height:return r
  h.swipe(root=r)
 raise RuntimeError('Unreachable '+label)
try:
 for f in fixtures:
  h.run('shell','am','start','-W','-a','android.intent.action.VIEW','-d','kodax-preview://'+f['type']+'/'+f['id'],h.PACKAGE);time.sleep(3)
  h.tap('عرض 1 ردود',seek('عرض 1 ردود'));h.cap('phone-native-'+f['type']+'-cascade-before',h.tree());h.tap('حذف',seek('حذف'));r=h.wait(lambda r:h.has('حذف التعليق',r));h.cap('phone-native-cascade-confirm' if f['type']=='discussion' else 'phone-native-code-cascade-confirm',r);h.check('Native '+f['type']+' confirmation describes foreign reply deletion',any('بما فيها ردود الآخرين' in x for x in h.labels(r)))
  h.tap('إلغاء',r);r=seek('حذف');h.tap('حذف',r);h.tap('حذف التعليق',h.wait(lambda r:h.has('حذف التعليق',r)));r=h.wait(lambda r:h.has('ماكو تعليقات بعد.',r),limit=25);h.cap('phone-native-cascade-after' if f['type']=='discussion' else 'phone-native-code-cascade-after',r)
  result=node(prefix+"(async()=>{await q.login(a,s.accounts[0]);let r=must(await a.from("+json.dumps('code_comments' if f['type']=='code' else 'community_comments')+").select('content,deleted_at').in('id',"+json.dumps([f['root'],f['reply']])+"));console.log(JSON.stringify(r.length===2&&r.every(c=>c.deleted_at&&c.content==='')));})()")
  h.check('Native '+f['type']+' deletion persists entire thread removal',result)
finally:
 node(prefix+"(async()=>{await q.login(a,s.accounts[0]);await a.from('code_snippets').update({is_public:false}).eq('id',"+json.dumps(fixtures[1]['id'])+");await a.rpc('delete_community_post',{p_id:"+json.dumps(fixtures[0]['id'])+"});console.log('{}');})()")

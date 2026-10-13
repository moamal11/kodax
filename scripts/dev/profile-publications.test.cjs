const assert = require('node:assert/strict');
const fs = require('node:fs');
const { clients, login } = require('./live-profile-client.cjs');
(async () => {
 const { admin, client } = clients();
 const [codes, posts, profiles] = await Promise.all([
  admin.from('code_snippets').select('id,user_id,is_public,is_hidden,created_at'),
  admin.from('community_posts').select('id,user_id,is_hidden,deleted_at,created_at'),
  admin.from('profiles').select('id,is_banned,username')
 ]);
 for(const r of [codes,posts,profiles]) assert.ifError(r.error);
 const allowed = new Set(profiles.data.filter(p => !p.is_banned).map(p => p.id));
 const expected = [
  ...codes.data.filter(p=>p.is_public&&!p.is_hidden&&allowed.has(p.user_id)).map(p=>({...p,type:'code'})),
  ...posts.data.filter(p=>!p.is_hidden&&!p.deleted_at&&allowed.has(p.user_id)).map(p=>({...p,type:'discussion'}))
 ];
 const users = [...new Set(expected.map(p=>p.user_id))];
 const mixed = users.find(id=>expected.some(p=>p.user_id===id&&p.type==='code')&&expected.some(p=>p.user_id===id&&p.type==='discussion'));
 assert.ok(mixed,'Need existing mixed author');
 const visitor=client();
 const accounts=JSON.parse(fs.readFileSync('.env.community-social-qa.local','utf8')).accounts;
 const authenticated=client(); const session=await login(authenticated,accounts[0]);
 let checked=0;
 for(const uid of users){
  const rows=expected.filter(p=>p.user_id===uid).sort((a,b)=> Date.parse(b.created_at)-Date.parse(a.created_at)||b.type.localeCompare(a.type)||b.id.localeCompare(a.id));
  let cursor=null,snapshot=null,result=[];
  do {
   const r=await visitor.rpc('profile_publications',{p_user:uid,p_limit:2,p_cursor:cursor,p_snapshot:snapshot});assert.ifError(r.error);
   for(const item of r.data.items){assert.equal(item.data.user_id,uid);assert.equal(item.data.liked_by_me??false,false);}
   result.push(...r.data.items.map(p=>p.type+':'+p.id));cursor=r.data.next;snapshot=r.data.snapshot;
  } while(cursor);
  assert.deepEqual(result,rows.map(p=>p.type+':'+p.id));checked++;
 }
 const authResult=await authenticated.rpc('profile_publications',{p_user:mixed});assert.ifError(authResult.error);
 const blocks=await admin.from('user_blocks').select('*');assert.ifError(blocks.error);
 const targetBlocked=blocks.data.some(b=>(b.blocker_id===session.user.id&&b.blocked_id===mixed)||(b.blocked_id===session.user.id&&b.blocker_id===mixed));
 if(!targetBlocked) {
  const likes=await admin.from('community_likes').select('post_id').eq('user_id',session.user.id);assert.ifError(likes.error);
  for(const item of authResult.data.items.filter(p=>p.type==='discussion')) assert.equal(item.data.liked_by_me,likes.data.some(l=>l.post_id===item.id));
 }
 const invalid=await visitor.rpc('profile_publications',{p_user:null});assert.ifError(invalid.error);assert.equal(invalid.data.items.length,0);
 console.log(JSON.stringify({authorsChecked:checked,publicationsChecked:expected.length,mixedAuthor:profiles.data.find(p=>p.id===mixed)?.username,pagination:'passed',privateHiddenDeletedExcluded:'passed',authenticatedLikes:'passed',nullAuthor:'passed'}));
})().catch(e=>{console.error(e.message);process.exitCode=1});

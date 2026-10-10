// Only the fictional QA account in the in-memory local backend. Never a production URL.
const fs=require('node:fs');
const API='http://127.0.0.1:54323';
(async()=>{
 const session=await(await fetch(API+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'qa@kodax.local',password:'kodax-local-123'})})).json();
 const uid='00000000-0000-4000-8000-000000000001';if(session.user?.id!==uid)throw new Error('Local fixture identity mismatch');
 const headers={Authorization:'Bearer '+session.access_token};
 const upload=async(bucket,file)=>{const path=uid+'/qa-resumed-'+Date.now()+'.png';const r=await fetch(API+'/storage/v1/object/'+bucket+'/'+path,{method:'POST',headers:{...headers,'Content-Type':'image/png'},body:fs.readFileSync(file)});if(!r.ok)throw new Error('Fixture upload '+r.status);return API+'/storage/v1/object/public/'+bucket+'/'+path;};
 const avatar_url=await upload('avatars','assets/branding/kodax-symbol-white-on-purple.png');const cover_url=await upload('profile-covers','assets/branding/kodax-full-white-on-purple.png');
 const r=await fetch(API+'/rest/v1/profiles?id=eq.'+uid,{method:'PATCH',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({avatar_url,cover_url,bio:'هذا حساب اختبار محلي. أتعلم Python وأشارك أمثلة برمجية مع المجتمع.',followers_visible:false,following_visible:false})});if(!r.ok)throw new Error('Fixture save '+r.status);
 console.log('Restored only local QA identity fixture after test server restart.');
})();

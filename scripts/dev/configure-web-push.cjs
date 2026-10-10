const fs=require('node:fs'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const {clients,ROOT,REF}=require('./live-profile-client.cjs');
const file=ROOT+'/.env.web-push.local';
const CLI='C:/Users/moamal/AppData/Local/npm-cache/_npx/b96a6bd565c470ce/node_modules/supabase/bin/supabase.exe';
(async()=>{let keys;if(fs.existsSync(file)){const text=fs.readFileSync(file,'utf8');keys={publicKey:text.match(/^WEB_PUSH_VAPID_PUBLIC_KEY=(.*)$/m)?.[1],privateKey:text.match(/^WEB_PUSH_VAPID_PRIVATE_KEY=(.*)$/m)?.[1]};if(!keys.publicKey||!keys.privateKey)throw new Error('Invalid existing VAPID file');}else{const e=crypto.createECDH('prime256v1');e.generateKeys();keys={publicKey:e.getPublicKey().toString('base64url'),privateKey:e.getPrivateKey().toString('base64url')};fs.writeFileSync(file,`WEB_PUSH_VAPID_PUBLIC_KEY=${keys.publicKey}\nWEB_PUSH_VAPID_PRIVATE_KEY=${keys.privateKey}\n`,{mode:0o600});}
 const {admin}=clients();const current=await admin.from('web_push_config').select('public_key').eq('id',true).maybeSingle();if(current.error)throw new Error('Cannot inspect web push config');if(current.data&&current.data.public_key!==keys.publicKey)throw new Error('Existing VAPID key differs; rotation requires review');
 const upload=spawnSync(CLI,['secrets','set','--project-ref',REF,'--env-file',file],{encoding:'utf8',windowsHide:true});if(upload.status)throw new Error('Secrets upload failed');
 const r=await admin.from('web_push_config').upsert({id:true,public_key:keys.publicKey});if(r.error)throw new Error('Public key save failed');console.log('VAPID configured on verified Kodax project; private key was not printed.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});

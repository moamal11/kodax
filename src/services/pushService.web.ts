import AsyncStorage from '@/lib/platformStorage';
import { supabase } from '@/lib/supabase';
export interface NotificationPrefs {daily_goal:boolean;streak:boolean;likes:boolean;comments:boolean;posts:boolean;follows:boolean;messages:boolean;system:boolean;admin:boolean;quiet_start:number;quiet_end:number;reminder_hour:number;}
export const isPushSupported=typeof window!=='undefined'&&window.isSecureContext&&'Notification' in window&&'serviceWorker' in navigator&&'PushManager' in window;
const TOKEN_KEY='@kodax_web_push_endpoint';
const OWNER_KEY='@kodax_web_push_owner';
const optOutKey=(uid:string)=>`@kodax_web_push_off:${uid}`;
export const webPromptKey=(uid:string)=>`@kodax_web_push_prompt:${uid}`;
export function configureNotificationHandler(){}
function bounded<T>(job:Promise<T>,ms=20000):Promise<T>{return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('web_push_timeout')),ms);job.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});}
export async function getPermissionStatus():Promise<'granted'|'denied'|'undetermined'|'unsupported'>{return !isPushSupported?'unsupported':Notification.permission==='default'?'undetermined':Notification.permission;}
export async function getPermissionInfo(){const status=await getPermissionStatus();return{status,canAskAgain:status==='undetermined'};}
export async function isPushOptedOut(uid:string){return(await AsyncStorage.getItem(optOutKey(uid)))==='1';}
async function worker(){const reg=await bounded(navigator.serviceWorker.register('/kodax-push-sw.js',{scope:'/',updateViaCache:'none'}));if(!reg.active)await bounded(navigator.serviceWorker.ready);return reg;}
export async function isDeviceRegistered(){if(!isPushSupported||Notification.permission!=='granted')return false;const uid=(await supabase.auth.getSession()).data.session?.user.id;if(!uid||await AsyncStorage.getItem(OWNER_KEY)!==uid)return false;const reg=await navigator.serviceWorker.getRegistration('/');const sub=await reg?.pushManager.getSubscription();return !!sub&&sub.endpoint===await AsyncStorage.getItem(TOKEN_KEY);}
let pending:Promise<{ok:boolean;reason?:string}>|null=null;
export function registerForPush(ask:boolean):Promise<{ok:boolean;reason?:string}>{
 if(pending)return pending;
 pending=(async()=>{
  if(!isPushSupported)return{ok:false,reason:'unsupported'};
  // Invoke the permission request synchronously from the user's button gesture.
  const permission=Notification.permission==='default'&&ask?await Notification.requestPermission():Notification.permission;
  if(permission!=='granted')return{ok:false,reason:'permission'};
  const uid=(await supabase.auth.getSession()).data.session?.user.id;if(!uid)return{ok:false,reason:'auth'};
  const cfg=await bounded(Promise.resolve(supabase.rpc('web_push_public_key')));if(cfg.error||!cfg.data)return{ok:false,reason:'configuration'};
  const key=Uint8Array.from(atob(String(cfg.data).replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
  const reg=await worker();let sub=await reg.pushManager.getSubscription();
  if(sub?.options.applicationServerKey){const old=new Uint8Array(sub.options.applicationServerKey);if(old.length!==key.length||old.some((x,i)=>x!==key[i])){await sub.unsubscribe();sub=null;}}
  sub??=await bounded(reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key}));
  const data=sub.toJSON();const r=await bounded(Promise.resolve(supabase.rpc('web_push_register',{p_endpoint:data.endpoint,p_p256dh:data.keys?.p256dh,p_auth:data.keys?.auth})));
  if(r.error||!r.data?.success)return{ok:false,reason:'server'};
  await AsyncStorage.setItem(TOKEN_KEY,sub.endpoint);await AsyncStorage.setItem(OWNER_KEY,uid);return{ok:true};
 })().catch(()=>({ok:false,reason:'error'})).finally(()=>{pending=null;});return pending;
}
export async function initPushForUser(uid:string){if(!isPushSupported||await isPushOptedOut(uid))return;if(Notification.permission==='granted')await registerForPush(false);}
export async function setDevicePushEnabled(uid:string,on:boolean){
 if(!on){await AsyncStorage.setItem(optOutKey(uid),'1');await unregisterPush();return{ok:true};}
 // Keep the browser's user activation: ask before asynchronous storage work.
 const registration=registerForPush(true);const r=await registration;if(r.ok)await AsyncStorage.removeItem(optOutKey(uid));return r;
}
export async function unregisterPush(){
 if(!isPushSupported)return;
 const endpoint=await AsyncStorage.getItem(TOKEN_KEY);
 let failed=false;
 try{if(endpoint){const r=await supabase.rpc('web_push_unregister',{p_endpoint:endpoint});failed=!!r.error;}}catch{failed=true;}
 try{const reg=await navigator.serviceWorker.getRegistration('/');const sub=await reg?.pushManager.getSubscription();if(sub)await sub.unsubscribe();
  // Remove displayed notifications so a signed-out browser doesn't retain message previews.
  for(const n of await reg?.getNotifications()||[])n.close();
 }catch{failed=true;}
 finally{await AsyncStorage.removeItem(TOKEN_KEY);await AsyncStorage.removeItem(OWNER_KEY);}
 if(failed)console.warn('[web-push] some unregistration steps could not finish');
}
export async function getNotificationPrefs():Promise<{prefs:NotificationPrefs|null;devices:number}>{const r=await supabase.rpc('notification_prefs_get');return{prefs:r.error?null:r.data?.prefs||null,devices:r.data?.devices||0};}
export async function setNotificationPrefs(patch:Partial<NotificationPrefs>):Promise<NotificationPrefs|null>{const r=await supabase.rpc('notification_prefs_set',{p_prefs:patch});return r.error?null:r.data?.prefs||null;}
export function notificationUrl(data:unknown):string|null{const u=(data as any)?.url;return typeof u==='string'&&u.startsWith('/')&&!u.startsWith('//')&&!/[\\\r\n]/.test(u)?u:null;}

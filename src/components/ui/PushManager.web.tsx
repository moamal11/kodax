import React,{useEffect,useState} from 'react';
import AsyncStorage from '@/lib/platformStorage';
import {Button,Col,Row,Sheet,Text} from '@/design';
import {initPushForUser,isPushSupported,isPushOptedOut,getPermissionStatus,setDevicePushEnabled,webPromptKey} from '@/services/pushService';
export default function PushManager({userId}:{userId:string}){
 const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let alive=true;setVisible(false);const timer=setTimeout(async()=>{if(!isPushSupported)return;await initPushForUser(userId);if(!alive)return;if(await getPermissionStatus()!=='undetermined'||await isPushOptedOut(userId)||await AsyncStorage.getItem(webPromptKey(userId)))return;if(alive)setVisible(true);},1800);
 const focus=()=>initPushForUser(userId);window.addEventListener('focus',focus);return()=>{alive=false;clearTimeout(timer);window.removeEventListener('focus',focus);};},[userId]);
 const dismiss=async()=>{if(busy)return;await AsyncStorage.setItem(webPromptKey(userId),'1');setVisible(false);};
 const enable=async()=>{const job=setDevicePushEnabled(userId,true);setBusy(true);setError('');const r=await job;setBusy(false);await AsyncStorage.setItem(webPromptKey(userId),'1');if(r.ok||r.reason==='permission')setVisible(false);else setError('تعذّر التفعيل. يمكنك المحاولة من إعدادات الإشعارات.');};
 return <Sheet visible={visible} title="تفعيل إشعارات المتصفح؟" onClose={dismiss} dismissible={!busy} maxWidth={430}><Col gap={14}><Text tone="secondary">تصلك الرسائل والردود والتحديثات التي تختارها، حتى خارج الموقع.</Text>{!!error&&<Text tone="danger">{error}</Text>}<Row gap={8} wrap><Button label="تفعيل الإشعارات" icon="notifications-outline" onPress={enable} loading={busy}/><Button label="لاحقًا" variant="ghost" onPress={dismiss} disabled={busy}/></Row></Col></Sheet>;
}

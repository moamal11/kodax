import React,{useState} from 'react';
import { Image,Modal,View,Pressable,useWindowDimensions,Platform,ScrollView } from 'react-native';
import { Gesture,GestureDetector,GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated,{useSharedValue,useAnimatedStyle} from 'react-native-reanimated';
import { Col,Text,IconButton,Row,useTheme,useReducedMotion } from '@/design';
function ZoomImage({uri}:{uri:string}){
  const scale=useSharedValue(1),start=useSharedValue(1),x=useSharedValue(0),y=useSharedValue(0),sx=useSharedValue(0),sy=useSharedValue(0);
  const pinch=Gesture.Pinch().onBegin(()=>{start.value=scale.value;}).onUpdate(e=>{scale.value=Math.max(1,Math.min(5,start.value*e.scale));});
  const pan=Gesture.Pan().onBegin(()=>{sx.value=x.value;sy.value=y.value;}).onUpdate(e=>{if(scale.value>1){x.value=sx.value+e.translationX;y.value=sy.value+e.translationY;}});
  const double=Gesture.Tap().numberOfTaps(2).onEnd(()=>{scale.value=scale.value===1?2:1;x.value=0;y.value=0;});
  const style=useAnimatedStyle(()=>({transform:[{translateX:x.value},{translateY:y.value},{scale:scale.value}]}));
  return <GestureDetector gesture={Gesture.Simultaneous(pinch,pan,double)}><Animated.View style={[{flex:1,width:'100%'},style]}><Image source={{uri}} resizeMode="contain" style={{width:'100%',height:'100%'}} accessibilityLabel="الصورة المرفقة، قرّب بإصبعين" /></Animated.View></GestureDetector>;
}
export function DiscussionImage({uri,onRetry,compact=false}:{uri?:string|null;onRetry?:()=>void;compact?:boolean}){
  const [open,setOpen]=useState(false),[failed,setFailed]=useState(false),[zoom,setZoom]=useState(1);const t=useTheme();const reduced=useReducedMotion();const {height}=useWindowDimensions();
  if(!uri)return onRetry?<Col gap={6}><Text variant="bodySm" tone="secondary">تعذّر تحميل الصورة.</Text><IconButton label="إعادة تحميل الصورة" icon="refresh" onPress={onRetry}/></Col>:null;
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="فتح الصورة المرفقة" onPress={()=>{setZoom(1);setOpen(true);}} style={{height:compact?156:Math.min(320,height*.4),backgroundColor:t.colors.surfaceSunken,borderRadius:t.radius.md,overflow:'hidden'}}>
      <Image source={{uri}} onError={()=>setFailed(true)} onLoad={()=>setFailed(false)} resizeMode="contain" style={{width:'100%',height:'100%'}} />
      {failed&&<View style={{position:'absolute',inset:0,alignItems:'center',justifyContent:'center',backgroundColor:t.colors.surface}}><Text>تعذّر تحميل الصورة</Text>{onRetry&&<IconButton label="إعادة تحميل الصورة" icon="refresh" onPress={onRetry}/>}</View>}
    </Pressable>
    <Modal visible={open} onRequestClose={()=>setOpen(false)} animationType={reduced?'none':'fade'}>
      <GestureHandlerRootView style={{flex:1,backgroundColor:t.colors.bg,paddingTop:40,paddingBottom:24}} accessibilityViewIsModal>
        <Row gap={8} style={{paddingHorizontal:16}}><Text style={{flex:1}} variant="heading">الصورة المرفقة</Text>{Platform.OS==='web'&&<><IconButton label="تكبير الصورة" icon="add" onPress={()=>setZoom(z=>Math.min(5,z+.5))}/><IconButton label="تصغير الصورة" icon="remove" onPress={()=>setZoom(z=>Math.max(1,z-.5))}/></>}<IconButton label="إغلاق الصورة" icon="close" onPress={()=>setOpen(false)}/></Row>
        {Platform.OS==='web'?<ScrollView style={{flex:1}} contentContainerStyle={{minHeight:'100%',alignItems:'center',justifyContent:'center'}} horizontal={zoom>1}><Image source={{uri}} resizeMode="contain" style={{width: `${100*zoom}%` as any,height:(height-130)*zoom,minWidth:280*zoom}} accessibilityLabel="الصورة المرفقة" /></ScrollView>:<ZoomImage uri={uri}/>}
      </GestureHandlerRootView>
    </Modal>
  </>;
}

import React,{forwardRef,useImperativeHandle,useMemo,useRef,useState,useEffect} from 'react';
import {ScrollView,View,type ScrollViewProps,useWindowDimensions} from 'react-native';
import type {CommunityItem} from '@/services/communityService';
export type CommunityListHandle={scrollToOffset:(o:{offset:number;animated?:boolean})=>void};
type Props={items:CommunityItem[];columns:number;gutter:number;maxWidth:number;header:React.ReactNode;footer:React.ReactNode;empty:React.ReactNode;renderItem:(item:CommunityItem)=>React.ReactNode;onOffset:(n:number)=>void;onMore:()=>void;refreshControl:ScrollViewProps['refreshControl'];initialOffset?:number};
/** Windowed masonry in chronological DOM order. Measured surfaces pack without artificial row gaps. */
export const CommunityList=forwardRef<CommunityListHandle,Props>(function CommunityList(p,ref){
 const scroll=useRef<ScrollView>(null);const {height:windowHeight,fontScale}=useWindowDimensions();const [width,setWidth]=useState(0),[viewport,setViewport]=useState(windowHeight),[headerHeight,setHeaderHeight]=useState(240),[offset,setOffset]=useState(0),[heights,setHeights]=useState<Record<string,number>>({});
 useImperativeHandle(ref,()=>({scrollToOffset:({offset,animated=false})=>scroll.current?.scrollTo({y:offset,animated})}));
 const restored=useRef(false);useEffect(()=>{if(width>0&&p.items.length&&!restored.current){restored.current=true;const timer=setTimeout(()=>{if(p.initialOffset)scroll.current?.scrollTo({y:p.initialOffset,animated:false});},180);return()=>clearTimeout(timer);}},[width,p.items.length,p.initialOffset]);
 useEffect(()=>{setHeights({});},[fontScale]);
 const colWidth=Math.max(0,(width-p.gutter*2-(p.columns-1)*14)/p.columns);
 const layout=useMemo(()=>{const bottom=Array(p.columns).fill(0);const placements=p.items.map(item=>{const key=item.type+':'+item.id;const column=bottom.indexOf(Math.min(...bottom));const estimate=item.type==='code'?352*fontScale:item.data.image_path?370*fontScale:220*fontScale;const h=heights[key]||estimate;const y=bottom[column];bottom[column]+=h+14;return{item,key,column,y,h};});return{placements,height:Math.max(0,...bottom)};},[p.items,p.columns,heights,fontScale]);
 const previousWidth=useRef(0);const measureWidth=(w:number)=>{if(w!==previousWidth.current){previousWidth.current=w;setHeights({});setWidth(w);}};
 return <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" refreshControl={p.refreshControl} scrollEventThrottle={80} onLayout={e=>setViewport(e.nativeEvent.layout.height)} onScroll={e=>{const y=e.nativeEvent.contentOffset.y;setOffset(y);p.onOffset(y);if(y+viewport>=headerHeight+layout.height-500)p.onMore();}} contentContainerStyle={{paddingBottom:24}}>
  <View style={{width:'100%',maxWidth:p.maxWidth,alignSelf:'center',paddingHorizontal:p.gutter,paddingTop:10}} onLayout={e=>measureWidth(e.nativeEvent.layout.width)}>
   <View onLayout={e=>{setHeaderHeight(e.nativeEvent.layout.height);}}>{p.header}</View>
   {!p.items.length?p.empty:<View style={{height:layout.height}}>{width>0&&layout.placements.filter(x=>x.y+x.h>offset-headerHeight-viewport&&x.y<offset-headerHeight+viewport*3).map(x=><View key={x.key} testID={`community-feed-item-${x.key}`} style={{position:'absolute',top:x.y,right:x.column*(colWidth+14),width:colWidth}} onLayout={e=>{const h=Math.round(e.nativeEvent.layout.height);if(h>0&&heights[x.key]!==h)setHeights(old=>({...old,[x.key]:h}));}}>{p.renderItem(x.item)}</View>)}</View>}
   {p.footer}
  </View>
 </ScrollView>;
});

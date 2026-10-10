import React,{useState} from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Row,Text,IconButton,useTheme } from '@/design';
import { ContentShareSheet } from './ContentShareSheet';
import type { SharedContent } from '@/services/socialShareService';
export function SocialActions({item,likes,comments,liked,onLike,onComments,pending=false,views}:{item:SharedContent;likes:number;comments:number;liked:boolean;onLike:()=>void;onComments:()=>void;pending?:boolean;views?:number}){
 const t=useTheme();const [share,setShare]=useState(false);
 const action=(icon:any,label:string,count:number,onPress:()=>void,selected=false)=><Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{selected,disabled:pending}} disabled={pending} onPress={onPress} style={({pressed})=>({minHeight:44,minWidth:44,paddingHorizontal:8,borderRadius:8,flexDirection:'row-reverse',alignItems:'center',gap:6,backgroundColor:pressed?t.colors.surfacePressed:'transparent'})}><Ionicons name={icon} size={18} color={selected?t.colors.dangerText:t.colors.textSecondary}/><Text variant="label" tone="secondary" tabular>{count}</Text></Pressable>;
 return <><Row gap={2} wrap>{action(liked?'heart':'heart-outline',liked?`إلغاء الإعجاب، ${likes} إعجاب`:`إعجاب، ${likes}`,likes,onLike,liked)}{action('chatbox-outline',`${comments} تعليق`,comments,onComments)}<IconButton label="مشاركة" icon="share-social-outline" onPress={()=>setShare(true)}/>{views!==undefined&&<Row gap={5} accessible accessibilityLabel={`${views} مشاهدة`} style={{paddingHorizontal:8}}><Ionicons name="eye-outline" size={17} color={t.colors.textMuted}/><Text variant="label" tone="muted" tabular>{views}</Text></Row>}</Row><ContentShareSheet visible={share} onClose={()=>setShare(false)} item={item}/></>;
}

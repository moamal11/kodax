import { useEffect,useRef,useState } from 'react';
import { router } from 'expo-router';
import { requestSignIn } from '@/services/webAccess';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/components/ui/Toast';
import { setPostLike,type CommunityPost } from '@/services/communityService';
export function usePostLike(post:CommunityPost){
 const {userId}=useAuth();const [liked,setLiked]=useState(!!post.liked_by_me),[count,setCount]=useState(post.likes_count||0),[pending,setPending]=useState(false);const busy=useRef(false),owner=useRef(userId);owner.current=userId;
 useEffect(()=>{setLiked(!!post.liked_by_me);setCount(post.likes_count||0);},[post.id,post.liked_by_me,post.likes_count,userId]);
 const like=async()=>{if(!userId){requestSignIn();return;}if(busy.current)return;busy.current=true;setPending(true);const uid=userId,old=liked;setLiked(!old);setCount(n=>Math.max(0,n+(old?-1:1)));try{const r=await setPostLike(post.id,!old);if(owner.current===uid){setLiked(r.liked);setCount(r.likes_count);}}catch(e){if(owner.current===uid){setLiked(old);setCount(post.likes_count||0);showToast.error(e instanceof Error?e.message:'تعذّر حفظ الإعجاب.');}}finally{busy.current=false;setPending(false);}};
 return{liked,count,pending,like};
}

import { router } from 'expo-router';
import { getPublicProfile } from './profileService';
import { showToast } from '@/components/ui/Toast';
export const profilePath=(id:string,username?:string|null)=>`/user/${encodeURIComponent(username?.trim()||id)}`;
export async function openUserProfile(id:string,username?:string|null){
 if(username){router.push(profilePath(id,username) as any);return;}
 const {data}=await getPublicProfile(id);if(data)router.push(profilePath(data.id,data.username) as any);else showToast.error('تعذّر فتح الملف الشخصي.');
}

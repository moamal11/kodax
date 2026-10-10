import { supabase } from '@/lib/supabase';
export type PersonResult={id:string;username:string;full_name:string|null;avatar_url:string|null;bio:string|null;is_verified:boolean|null};
export async function searchPeople(query:string,page=0):Promise<{items:PersonResult[];has_more:boolean}>{
 const r=await supabase.rpc('people_search',{p_query:query.trim().slice(0,80),p_page:page,p_limit:12});
 if(r.error)throw new Error('تعذّر تحميل الأشخاص. حاول مرة أخرى.');
 return r.data;
}

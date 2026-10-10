import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
export async function isWebVisitor(){return Platform.OS==='web'&&!(await supabase.auth.getSession()).data.session?.user;}
export async function publicWebDocument(kind:string,key:string){const r=await supabase.rpc('public_web_document',{p_kind:kind,p_key:key});if(r.error)throw new Error('تعذّر تحميل المحتوى العام.');return r.data;}

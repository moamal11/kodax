/**
 * خدمة الحساب — الحذف النهائي عبر Edge Function `delete-account` (صلاحيات السيرفر فقط).
 */
import { supabase } from '@/lib/supabase';

export type DeleteAccountError =
  | 'not_authenticated'
  | 'admin_account'
  | 'network'
  | 'failed';

export async function deleteMyAccount(): Promise<{ success: boolean; error?: DeleteAccountError }> {
  try {
    const { data, error } = await supabase.functions.invoke('delete-account', {
      body: { confirm: 'DELETE' },
    });
    if (error) {
      const status = (error as any)?.context?.status as number | undefined;
      let code: string | undefined;
      try {
        code = (await (error as any)?.context?.json?.())?.error;
      } catch {
        code = undefined;
      }
      if (status === 401) return { success: false, error: 'not_authenticated' };
      if (code === 'admin_account') return { success: false, error: 'admin_account' };
      if (!status) return { success: false, error: 'network' };
      return { success: false, error: 'failed' };
    }
    return { success: !!data?.success, error: data?.success ? undefined : 'failed' };
  } catch {
    return { success: false, error: 'network' };
  }
}

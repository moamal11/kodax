/**
 * منطق حذف الحساب (بلا Deno/Supabase مباشرة — قابل للاختبار محلياً).
 *
 * حذف ذاتي:  { confirm: 'DELETE' }
 * حذف مشرف: { confirm: 'DELETE', target_user_id, reason }  (المستدعي مشرف، والهدف ليس مشرفاً)
 *
 * الترتيب: التحقق من الهوية ← account_delete_prepare (تنظيف + قائمة الملفات + سجل) ←
 * حذف ملفات Storage الشخصية ← auth.admin.deleteUser (يحذف profiles وكل الجداول المرتبطة CASCADE).
 * أي فشل قبل حذف المستخدم يترك الحساب كما هو (يمكن إعادة المحاولة).
 */

export interface StorageObjectRef {
  bucket: string;
  name: string;
}

export interface DeleteDeps {
  getUserId: (token: string) => Promise<string | null>;
  isAdmin: (userId: string) => Promise<boolean>;
  prepare: (
    userId: string,
    actorId: string,
    reason: string | null
  ) => Promise<{ success: boolean; code?: string; log_id?: number; storage_objects?: StorageObjectRef[] }>;
  removeObjects: (bucket: string, names: string[]) => Promise<void>;
  deleteAuthUser: (userId: string) => Promise<void>;
  finish: (logId: number, ok: boolean, error?: string) => Promise<void>;
}

export interface DeleteResult {
  status: number;
  body: Record<string, unknown>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function handleDeleteAccount(deps: DeleteDeps, token: string, body: unknown): Promise<DeleteResult> {
  if (!token) return { status: 401, body: { error: 'not_authenticated' } };
  const callerId = await deps.getUserId(token);
  if (!callerId) return { status: 401, body: { error: 'not_authenticated' } };

  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  if (b.confirm !== 'DELETE') return { status: 400, body: { error: 'confirmation_required' } };

  let targetId = callerId;
  let reason: string | null = null;
  const requestedTarget = typeof b.target_user_id === 'string' ? b.target_user_id : null;
  if (requestedTarget && requestedTarget !== callerId) {
    if (!UUID_RE.test(requestedTarget)) return { status: 400, body: { error: 'invalid_target' } };
    if (!(await deps.isAdmin(callerId))) return { status: 403, body: { error: 'forbidden' } };
    reason = typeof b.reason === 'string' ? b.reason.trim().slice(0, 500) : '';
    if (reason.length < 3) return { status: 400, body: { error: 'reason_required' } };
    targetId = requestedTarget;
  } else if (typeof b.reason === 'string') {
    reason = b.reason.trim().slice(0, 500) || null;
  }

  const prep = await deps.prepare(targetId, callerId, reason);
  if (!prep.success) {
    if (prep.code === 'user_not_found') return { status: 404, body: { error: 'user_not_found' } };
    if (prep.code === 'admin_account') return { status: 409, body: { error: 'admin_account' } };
    return { status: 500, body: { error: 'prepare_failed' } };
  }
  const logId = prep.log_id ?? 0;

  try {
    const byBucket = new Map<string, string[]>();
    for (const o of prep.storage_objects ?? []) {
      if (!o?.bucket || !o?.name) continue;
      const list = byBucket.get(o.bucket) ?? [];
      list.push(o.name);
      byBucket.set(o.bucket, list);
    }
    for (const [bucket, names] of byBucket) {
      for (let i = 0; i < names.length; i += 100) {
        await deps.removeObjects(bucket, names.slice(i, i + 100));
      }
    }
    await deps.deleteAuthUser(targetId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await deps.finish(logId, false, msg).catch(() => undefined);
    return { status: 500, body: { error: 'delete_failed' } };
  }

  await deps.finish(logId, true).catch(() => undefined);
  return { status: 200, body: { success: true, deleted_user_id: targetId, self: targetId === callerId } };
}

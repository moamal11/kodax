'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Search,
  Calendar,
  MapPin,
  Shield,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Ban,
  ShieldOff,
  ShoppingCart,
  ShieldCheck,
  X,
  AlertTriangle,
} from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  province: string | null;
  xp: number;
  level: number;
  streak_days: number;
  created_at: string;
  is_admin?: boolean;
  is_banned?: boolean;
  is_purchase_blocked?: boolean;
  ban_reason?: string | null;
  banned_at?: string | null;
}

interface RestrictionLog {
  id: string;
  action: string;
  reason: string | null;
  created_at: string;
  performed_by: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'xp' | 'level'>(
    'created_at'
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  // حالة النوافذ المنبثقة
  const [banModalUser, setBanModalUser] = useState<UserProfile | null>(null);
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [logsModal, setLogsModal] = useState<{
    user: UserProfile;
    logs: RestrictionLog[];
  } | null>(null);
  const [filterRestricted, setFilterRestricted] = useState(false);

  // الحصول على معرف الأدمن الحالي
  const [adminId, setAdminId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setAdminId(data.user.id);
    });
  }, []);

  useEffect(() => {
    loadUsers();
  }, [sortBy, sortDir, page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, username, full_name, avatar_url, province, xp, level, streak_days, created_at, is_banned, is_purchase_blocked, ban_reason, banned_at'
        )
        .order(sortBy, { ascending: sortDir === 'asc' })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      // جلب أدوار المسؤولين
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      const adminIds = new Set((adminRoles || []).map((r: any) => r.user_id));

      const enrichedUsers = (data || []).map((u: any) => ({
        ...u,
        is_admin: adminIds.has(u.id),
      }));

      setUsers(enrichedUsers);
      setHasMore((data || []).length === PAGE_SIZE);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field: 'created_at' | 'xp' | 'level') => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(0);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  // ===== حظر / إلغاء حظر مستخدم =====
  const handleToggleBan = async (user: UserProfile, ban: boolean) => {
    if (ban) {
      setBanModalUser(user);
      setBanReason('');
      return;
    }

    setActionLoading(user.id);
    try {
      const { error } = await supabase.rpc('admin_toggle_ban', {
        p_user_id: user.id,
        p_ban: false,
        p_reason: null,
        p_admin_id: adminId,
      });
      if (error) throw error;
      await loadUsers();
    } catch (err) {
      console.error('Error toggling ban:', err);
      alert('حدث خطأ أثناء تنفيذ العملية');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmBan = async () => {
    if (!banModalUser) return;

    setActionLoading(banModalUser.id);
    try {
      const { error } = await supabase.rpc('admin_toggle_ban', {
        p_user_id: banModalUser.id,
        p_ban: true,
        p_reason: banReason || 'مخالفة سياسة الاستخدام',
        p_admin_id: adminId,
      });
      if (error) throw error;
      setBanModalUser(null);
      setBanReason('');
      await loadUsers();
    } catch (err) {
      console.error('Error banning user:', err);
      alert('حدث خطأ أثناء حظر المستخدم');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== منع / السماح بالشراء =====
  const handleTogglePurchaseBlock = async (
    user: UserProfile,
    block: boolean
  ) => {
    setActionLoading(user.id);
    try {
      const { error } = await supabase.rpc('admin_toggle_purchase_block', {
        p_user_id: user.id,
        p_block: block,
        p_reason: block ? 'تم منع الشراء من قبل الإدارة' : null,
        p_admin_id: adminId,
      });
      if (error) throw error;
      await loadUsers();
    } catch (err) {
      console.error('Error toggling purchase block:', err);
      alert('حدث خطأ أثناء تنفيذ العملية');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== عرض سجل التقييدات =====
  const showRestrictionLogs = async (user: UserProfile) => {
    try {
      const { data, error } = await supabase
        .from('user_restriction_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogsModal({ user, logs: data || [] });
    } catch (err) {
      console.error('Error loading logs:', err);
    }
  };

  // تصفية المستخدمين
  const filteredUsers = users.filter((u) => {
    if (filterRestricted && !u.is_banned && !u.is_purchase_blocked)
      return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.province?.toLowerCase().includes(q)
    );
  });

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'ban':
        return 'حظر';
      case 'unban':
        return 'إلغاء حظر';
      case 'block_purchase':
        return 'منع شراء';
      case 'unblock_purchase':
        return 'إلغاء منع شراء';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ban':
      case 'block_purchase':
        return 'text-red-400';
      case 'unban':
      case 'unblock_purchase':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-purple-400" />
            المستخدمين
          </h1>
          <p className="text-gray-400 mt-1">{users.length} مستخدم</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterRestricted(!filterRestricted)}
            className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm transition-colors ${
              filterRestricted
                ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Ban className="w-4 h-4" />
            {filterRestricted ? 'المقيّدون فقط' : 'الكل'}
          </button>
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="بحث بالاسم أو المحافظة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Users Table */}
      <div className="bg-kodax-medium/30 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <svg
              className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-3"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                    المستخدم
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                    الحالة
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                    المحافظة
                  </th>
                  <th
                    className="text-right px-6 py-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => toggleSort('xp')}
                  >
                    <span className="flex items-center gap-1">
                      XP <SortIcon field="xp" />
                    </span>
                  </th>
                  <th
                    className="text-right px-6 py-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => toggleSort('level')}
                  >
                    <span className="flex items-center gap-1">
                      المستوى <SortIcon field="level" />
                    </span>
                  </th>
                  <th
                    className="text-right px-6 py-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => toggleSort('created_at')}
                  >
                    <span className="flex items-center gap-1">
                      التسجيل <SortIcon field="created_at" />
                    </span>
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      user.is_banned
                        ? 'bg-red-500/5'
                        : user.is_purchase_blocked
                          ? 'bg-yellow-500/5'
                          : ''
                    }`}
                  >
                    {/* المستخدم */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center overflow-hidden relative">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-purple-400 text-sm font-bold">
                              {(user.full_name || 'U')[0].toUpperCase()}
                            </span>
                          )}
                          {user.is_banned && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center rounded-full">
                              <Ban className="w-5 h-5 text-red-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">
                            {user.full_name || 'بدون اسم'}
                            {user.is_admin && (
                              <Shield className="w-3.5 h-3.5 text-purple-400 inline-block mr-1" />
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            @{user.username || '---'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* الحالة */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {user.is_banned && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20 w-fit">
                            <Ban className="w-3 h-3" /> محظور
                          </span>
                        )}
                        {user.is_purchase_blocked && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium border border-yellow-500/20 w-fit">
                            <ShoppingCart className="w-3 h-3" /> ممنوع شراء
                          </span>
                        )}
                        {!user.is_banned && !user.is_purchase_blocked && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20 w-fit">
                            <ShieldCheck className="w-3 h-3" /> نشط
                          </span>
                        )}
                      </div>
                    </td>

                    {/* المحافظة */}
                    <td className="px-6 py-4">
                      {user.province ? (
                        <span className="flex items-center gap-1 text-sm text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />{' '}
                          {user.province}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-amber-400 font-medium">
                        {(user.xp || 0).toLocaleString('ar-IQ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white">
                        {user.level || 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400" dir="ltr">
                      {new Date(user.created_at).toLocaleDateString('ar-IQ', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* الإجراءات */}
                    <td className="px-6 py-4">
                      {user.is_admin ? (
                        <span className="text-gray-500 text-xs">مسؤول</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleToggleBan(user, !user.is_banned)
                            }
                            disabled={actionLoading === user.id}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                              user.is_banned
                                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                            }`}
                          >
                            {user.is_banned ? (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" /> إلغاء
                                حظر
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" /> حظر
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              handleTogglePurchaseBlock(
                                user,
                                !user.is_purchase_blocked
                              )
                            }
                            disabled={actionLoading === user.id}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                              user.is_purchase_blocked
                                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20'
                            }`}
                          >
                            {user.is_purchase_blocked ? (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" /> سماح
                                شراء
                              </>
                            ) : (
                              <>
                                <ShieldOff className="w-3.5 h-3.5" /> منع شراء
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => showRestrictionLogs(user)}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                            title="سجل التقييدات"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                لا يوجد مستخدمين
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          السابق
        </button>
        <span className="text-sm text-gray-400">صفحة {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={!hasMore}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          التالي
        </button>
      </div>

      {/* ===== نافذة الحظر ===== */}
      {banModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1a1a3e] border border-white/10 rounded-2xl w-full max-w-md p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                حظر المستخدم
              </h3>
              <button
                onClick={() => setBanModalUser(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-white/5 rounded-xl">
              <p className="text-sm text-gray-300">
                <span className="text-white font-medium">
                  {banModalUser.full_name}
                </span>{' '}
                (@{banModalUser.username || '---'})
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                سبب الحظر
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="اكتب سبب الحظر (اختياري)..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none h-24"
                dir="rtl"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBanModalUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmBan}
                disabled={actionLoading === banModalUser.id}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === banModalUser.id ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <>
                    <Ban className="w-4 h-4" /> تأكيد الحظر
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== نافذة سجل التقييدات ===== */}
      {logsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1a1a3e] border border-white/10 rounded-2xl w-full max-w-lg p-6 animate-fadeIn max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                سجل التقييدات - {logsModal.user.full_name}
              </h3>
              <button
                onClick={() => setLogsModal(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {logsModal.logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  لا توجد سجلات تقييد لهذا المستخدم
                </p>
              ) : (
                logsModal.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white/5 rounded-xl border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium ${getActionColor(log.action)}`}
                      >
                        {getActionLabel(log.action)}
                      </span>
                      <span className="text-xs text-gray-500" dir="ltr">
                        {new Date(log.created_at).toLocaleString('ar-IQ', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {log.reason && (
                      <p className="text-xs text-gray-400 mt-1">
                        السبب: {log.reason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setLogsModal(null)}
              className="mt-4 w-full py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

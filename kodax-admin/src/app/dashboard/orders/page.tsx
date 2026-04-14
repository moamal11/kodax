'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import {
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  Diamond,
  Phone,
  CreditCard,
  Wallet,
  Edit3,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  ImageIcon,
  MessageSquare,
} from 'lucide-react';

interface PaymentOrder {
  id: string;
  user_id: string;
  payment_method: string;
  payment_details: string;
  package_id: string;
  points_requested: number;
  points_approved: number | null;
  price_amount: number;
  price_currency: string;
  receipt_image_url: string | null;
  status: string;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: { username: string; full_name: string; avatar_url: string } | null;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function OrdersPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [editPoints, setEditPoints] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState<
    'approve' | 'reject' | null
  >(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('payment_orders')
        .select('*, profiles(username, full_name, avatar_url)')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders((data as any) || []);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('orders-management')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'payment_orders' },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  const handleApprove = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const pointsToApprove =
        editPoints !== null ? editPoints : selectedOrder.points_requested;

      const { data, error } = await supabase.rpc('approve_payment_order', {
        p_order_id: selectedOrder.id,
        p_admin_id: user.id,
        p_points_approved: pointsToApprove,
        p_admin_note: adminNote || null,
      });

      if (error) {
        alert('خطأ: ' + error.message);
      } else if (data && !(data as any).success) {
        alert('خطأ: ' + (data as any).error);
      } else {
        closeModal();
        loadOrders();
      }
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    } finally {
      setActionLoading(false);
      setShowConfirmDialog(null);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('reject_payment_order', {
        p_order_id: selectedOrder.id,
        p_admin_id: user.id,
        p_admin_note: adminNote || null,
      });

      if (error) {
        alert('خطأ: ' + error.message);
      } else if (data && !(data as any).success) {
        alert('خطأ: ' + (data as any).error);
      } else {
        closeModal();
        loadOrders();
      }
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    } finally {
      setActionLoading(false);
      setShowConfirmDialog(null);
    }
  };

  const openOrderDetails = (order: PaymentOrder) => {
    setSelectedOrder(order);
    setEditPoints(null);
    setAdminNote(order.admin_note || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setEditPoints(null);
    setAdminNote('');
    setShowConfirmDialog(null);
  };

  const openImageViewer = (url: string) => {
    setImageUrl(url);
    setShowImageModal(true);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'asiacell':
      case 'zain':
        return <Phone className="w-4 h-4" />;
      case 'mastercard':
        return <CreditCard className="w-4 h-4" />;
      case 'zain_cash':
        return <Wallet className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getMethodName = (method: string) => {
    const methods: Record<string, string> = {
      asiacell: 'آسياسيل',
      zain: 'زين',
      mastercard: 'ماستركارد',
      zain_cash: 'زين كاش',
    };
    return methods[method] || method;
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      asiacell: 'text-red-400',
      zain: 'text-purple-400',
      mastercard: 'text-amber-400',
      zain_cash: 'text-emerald-400',
    };
    return colors[method] || 'text-gray-400';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
            <Clock className="w-3 h-3" /> معلق
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> مقبول
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
            <XCircle className="w-3 h-3" /> مرفوض
          </span>
        );
      default:
        return <span className="text-gray-400 text-xs">{status}</span>;
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (order.profiles as any)?.full_name?.toLowerCase().includes(query) ||
      (order.profiles as any)?.username?.toLowerCase().includes(query) ||
      order.payment_details.toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query)
    );
  });

  const filterButtons: {
    label: string;
    value: FilterStatus;
    count: number;
    color: string;
  }[] = [
    { label: 'الكل', value: 'all', count: orders.length, color: 'text-white' },
    {
      label: 'معلق',
      value: 'pending',
      count: orders.filter((o) => o.status === 'pending').length,
      color: 'text-amber-400',
    },
    {
      label: 'مقبول',
      value: 'approved',
      count: orders.filter((o) => o.status === 'approved').length,
      color: 'text-emerald-400',
    },
    {
      label: 'مرفوض',
      value: 'rejected',
      count: orders.filter((o) => o.status === 'rejected').length,
      color: 'text-red-400',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-purple-400" />
            إدارة الطلبات
          </h1>
          <p className="text-gray-400 mt-1">مراجعة وإدارة طلبات الدفع</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === btn.value
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              {btn.label}
              <span className={`text-xs ${btn.color}`}>({btn.count})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الرقم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Orders Table */}
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
            <p className="text-gray-400">جاري التحميل...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">لا توجد طلبات</p>
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
                    طريقة الدفع
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                    التفاصيل
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                    النقاط
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                    المبلغ
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                    الإثبات
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                    الحالة
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                    التاريخ
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                    إجراء
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center">
                          <span className="text-purple-400 text-xs font-bold">
                            {((order.profiles as any)?.full_name ||
                              'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">
                            {(order.profiles as any)?.full_name || 'مجهول'}
                          </p>
                          <p className="text-xs text-gray-500">
                            @{(order.profiles as any)?.username || '---'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-2 ${getMethodColor(order.payment_method)}`}
                      >
                        {getMethodIcon(order.payment_method)}
                        <span className="text-sm">
                          {getMethodName(order.payment_method)}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-300 font-mono"
                      dir="ltr"
                    >
                      {order.payment_details}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-purple-400 font-medium flex items-center gap-1">
                        <Diamond className="w-3.5 h-3.5" />
                        {(
                          order.points_approved || order.points_requested
                        ).toLocaleString('ar-IQ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {order.price_amount.toLocaleString('ar-IQ')} د.ع
                    </td>
                    <td className="px-6 py-4">
                      {order.receipt_image_url ? (
                        <button
                          onClick={() =>
                            openImageViewer(order.receipt_image_url!)
                          }
                          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          عرض
                        </button>
                      ) : (
                        <span className="text-gray-500 text-sm">لا يوجد</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400" dir="ltr">
                      {new Date(order.created_at).toLocaleDateString('ar-IQ', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 text-sm bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        تفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-kodax-medium border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-400" />
                تفاصيل الطلب
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                <div className="w-12 h-12 rounded-full bg-purple-600/30 flex items-center justify-center">
                  <span className="text-purple-400 text-lg font-bold">
                    {((selectedOrder.profiles as any)?.full_name ||
                      'U')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {(selectedOrder.profiles as any)?.full_name || 'مجهول'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    @{(selectedOrder.profiles as any)?.username || '---'}
                  </p>
                </div>
                <div className="mr-auto">
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">طريقة الدفع</p>
                  <div
                    className={`flex items-center gap-2 ${getMethodColor(selectedOrder.payment_method)}`}
                  >
                    {getMethodIcon(selectedOrder.payment_method)}
                    <span className="font-medium">
                      {getMethodName(selectedOrder.payment_method)}
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">تفاصيل الدفع</p>
                  <p className="text-white font-mono" dir="ltr">
                    {selectedOrder.payment_details}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">النقاط المطلوبة</p>
                  <p className="text-purple-400 font-bold text-lg flex items-center gap-1">
                    <Diamond className="w-4 h-4" />
                    {selectedOrder.points_requested.toLocaleString('ar-IQ')}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">المبلغ المدفوع</p>
                  <p className="text-white font-bold text-lg">
                    {selectedOrder.price_amount.toLocaleString('ar-IQ')}{' '}
                    {selectedOrder.price_currency}
                  </p>
                </div>
              </div>

              {/* Receipt Image */}
              {selectedOrder.receipt_image_url && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">صورة التحويل</p>
                  <div
                    className="relative cursor-pointer rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/30 transition-colors"
                    onClick={() =>
                      openImageViewer(selectedOrder.receipt_image_url!)
                    }
                  >
                    <img
                      src={selectedOrder.receipt_image_url}
                      alt="Receipt"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Date Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">تاريخ الطلب</p>
                <p className="text-white">
                  {new Date(selectedOrder.created_at).toLocaleDateString(
                    'ar-IQ',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
                {selectedOrder.reviewed_at && (
                  <p className="text-gray-400 text-sm mt-2">
                    تمت المراجعة:{' '}
                    {new Date(selectedOrder.reviewed_at).toLocaleDateString(
                      'ar-IQ',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                )}
              </div>

              {/* Admin Actions (Only for pending orders) */}
              {selectedOrder.status === 'pending' && (
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-purple-400" />
                    إجراءات المسؤول
                  </h3>

                  {/* Edit Points */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      تعديل عدد النقاط (اختياري)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={editPoints ?? selectedOrder.points_requested}
                        onChange={(e) =>
                          setEditPoints(parseInt(e.target.value) || 0)
                        }
                        className="bg-kodax-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white w-40 focus:outline-none focus:border-purple-500 transition-colors"
                        min={1}
                        dir="ltr"
                      />
                      <span className="text-gray-400 text-sm">
                        الأصلي:{' '}
                        {selectedOrder.points_requested.toLocaleString('ar-IQ')}
                      </span>
                    </div>
                  </div>

                  {/* Admin Note */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      ملاحظة للمستخدم (اختياري)
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="w-full bg-kodax-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      rows={3}
                      placeholder="أضف ملاحظة..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmDialog('approve')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      موافقة
                    </button>
                    <button
                      onClick={() => setShowConfirmDialog('reject')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                      رفض
                    </button>
                  </div>
                </div>
              )}

              {/* Already reviewed info */}
              {selectedOrder.status !== 'pending' &&
                selectedOrder.admin_note && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      ملاحظة المسؤول
                    </p>
                    <p className="text-white">{selectedOrder.admin_note}</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-kodax-medium border border-white/10 rounded-2xl w-full max-w-md p-6 animate-fadeIn shadow-2xl">
            <div className="text-center mb-6">
              {showConfirmDialog === 'approve' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    تأكيد الموافقة
                  </h3>
                  <p className="text-gray-400">
                    هل تريد الموافقة على هذا الطلب وإضافة{' '}
                    <span className="text-purple-400 font-bold">
                      {(
                        editPoints ?? selectedOrder.points_requested
                      ).toLocaleString('ar-IQ')}
                    </span>{' '}
                    نقطة لحساب{' '}
                    <span className="text-white font-medium">
                      {(selectedOrder.profiles as any)?.full_name || 'المستخدم'}
                    </span>
                    ؟
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    تأكيد الرفض
                  </h3>
                  <p className="text-gray-400">
                    هل تريد رفض طلب{' '}
                    <span className="text-white font-medium">
                      {(selectedOrder.profiles as any)?.full_name || 'المستخدم'}
                    </span>
                    ؟ سيتم إعلامه بالرفض.
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(null)}
                disabled={actionLoading}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-3 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={
                  showConfirmDialog === 'approve' ? handleApprove : handleReject
                }
                disabled={actionLoading}
                className={`flex-1 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  showConfirmDialog === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {actionLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                ) : showConfirmDialog === 'approve' ? (
                  'تأكيد الموافقة'
                ) : (
                  'تأكيد الرفض'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl w-full animate-fadeIn">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 left-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={imageUrl}
              alt="Receipt"
              className="w-full rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

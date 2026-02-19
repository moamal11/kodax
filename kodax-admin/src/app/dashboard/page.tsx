'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Diamond,
  Code2,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

interface Stats {
  total_users: number;
  total_points_sent: number;
  total_codes: number;
  orders_total: number;
  orders_pending: number;
  orders_approved: number;
  orders_rejected: number;
}

interface RecentOrder {
  id: string;
  created_at: string;
  status: string;
  points_requested: number;
  payment_method: string;
  price_amount: number;
  profiles: { username: string; full_name: string } | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadRecentOrders();
  }, []);

  const loadStats = async () => {
    try {
      // جلب الإحصائيات من الدالة المخصصة
      const { data, error } = await supabase.rpc('get_admin_stats');

      if (error) {
        // احتياط: جلب يدوي
        const [usersRes, ordersRes, codesRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('payment_orders').select('*'),
          supabase
            .from('code_snippets')
            .select('*', { count: 'exact', head: true }),
        ]);

        const orders = ordersRes.data || [];
        const approvedOrders = orders.filter(
          (o: any) => o.status === 'approved'
        );
        const totalPointsSent = approvedOrders.reduce(
          (sum: number, o: any) =>
            sum + (o.points_approved || o.points_requested || 0),
          0
        );

        setStats({
          total_users: usersRes.count || 0,
          total_points_sent: totalPointsSent,
          total_codes: codesRes.count || 0,
          orders_total: orders.length,
          orders_pending: orders.filter((o: any) => o.status === 'pending')
            .length,
          orders_approved: approvedOrders.length,
          orders_rejected: orders.filter((o: any) => o.status === 'rejected')
            .length,
        });
      } else {
        setStats(data as Stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    const { data } = await supabase
      .from('payment_orders')
      .select(
        'id, created_at, status, points_requested, payment_method, price_amount, profiles(username, full_name)'
      )
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setRecentOrders(data as any);
  };

  const statCards = stats
    ? [
        {
          label: 'إجمالي المستخدمين',
          value: stats.total_users.toLocaleString('ar-IQ'),
          icon: Users,
          color: 'from-blue-600 to-blue-700',
          iconColor: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
        },
        {
          label: 'النقاط المرسلة',
          value: stats.total_points_sent.toLocaleString('ar-IQ'),
          icon: Diamond,
          color: 'from-purple-600 to-purple-700',
          iconColor: 'text-purple-400',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/20',
        },
        {
          label: 'الأكواد المنشورة',
          value: stats.total_codes.toLocaleString('ar-IQ'),
          icon: Code2,
          color: 'from-emerald-600 to-emerald-700',
          iconColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
        },
        {
          label: 'إجمالي الطلبات',
          value: stats.orders_total.toLocaleString('ar-IQ'),
          icon: ShoppingCart,
          color: 'from-amber-600 to-amber-700',
          iconColor: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
        },
      ]
    : [];

  const orderStatCards = stats
    ? [
        {
          label: 'معلق',
          value: stats.orders_pending,
          icon: Clock,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
        },
        {
          label: 'مقبول',
          value: stats.orders_approved,
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
        },
        {
          label: 'مرفوض',
          value: stats.orders_rejected,
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
        },
      ]
    : [];

  const getMethodName = (method: string) => {
    const methods: Record<string, string> = {
      asiacell: 'آسياسيل',
      zain: 'زين',
      mastercard: 'ماستركارد',
      zain_cash: 'زين كاش',
    };
    return methods[method] || method;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
            معلق
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
            مقبول
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
            مرفوض
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg
          className="animate-spin h-8 w-8 text-purple-500"
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
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-purple-400" />
          لوحة الإحصائيات
        </h1>
        <p className="text-gray-400 mt-1">نظرة عامة على أداء المنصة</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`${card.bgColor} border ${card.borderColor} rounded-2xl p-5 animate-fadeIn`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className={`w-4 h-4 ${card.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-sm text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Order Stats */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-purple-400" />
          حالة الطلبات
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {orderStatCards.map((card, i) => (
            <div
              key={i}
              className={`${card.bg} border ${card.border} rounded-2xl p-5 text-center`}
            >
              <card.icon className={`w-8 h-8 ${card.color} mx-auto mb-3`} />
              <p className={`text-3xl font-bold ${card.color} mb-1`}>
                {card.value}
              </p>
              <p className="text-sm text-gray-400">{card.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          آخر الطلبات
        </h2>
        <div className="bg-kodax-medium/30 border border-white/5 rounded-2xl overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">لا توجد طلبات بعد</p>
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
                      النقاط
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                      المبلغ
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                      الحالة
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">
                      التاريخ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-white">
                        {(order.profiles as any)?.full_name ||
                          (order.profiles as any)?.username ||
                          'مجهول'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {getMethodName(order.payment_method)}
                      </td>
                      <td className="px-6 py-4 text-sm text-purple-400 font-medium">
                        {order.points_requested.toLocaleString('ar-IQ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {order.price_amount.toLocaleString('ar-IQ')} د.ع
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400" dir="ltr">
                        {new Date(order.created_at).toLocaleDateString(
                          'ar-IQ',
                          {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

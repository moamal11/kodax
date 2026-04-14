'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  Bell,
  MessageSquare,
  Rocket,
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [openTicketCount, setOpenTicketCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
    loadPendingCount();
    loadOpenTicketCount();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/');
        return;
      }

      // التحقق من صلاحية المسؤول
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        await supabase.auth.signOut();
        router.push('/');
        return;
      }

      setUser({ id: authUser.id, email: authUser.email || '' });
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCount = async () => {
    const { count } = await supabase
      .from('payment_orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    setPendingCount(count || 0);
  };

  const loadOpenTicketCount = async () => {
    const { count } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress']);
    setOpenTicketCount(count || 0);
  };

  // الاشتراك في تحديثات الطلبات الجديدة
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'payment_orders' },
        () => {
          loadPendingCount();
        }
      )
      .subscribe();

    const supportChannel = supabase
      .channel('admin-support')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => {
          loadOpenTicketCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(supportChannel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    {
      href: '/dashboard',
      label: 'الإحصائيات',
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/orders',
      label: 'إدارة الطلبات',
      icon: ShoppingCart,
      badge: pendingCount,
    },
    {
      href: '/dashboard/users',
      label: 'المستخدمين',
      icon: Users,
    },
    {
      href: '/dashboard/support',
      label: 'الدعم الفني',
      icon: MessageSquare,
      badge: openTicketCount,
    },
    {
      href: '/dashboard/messages',
      label: 'رسائل التطبيق',
      icon: Bell,
    },
    {
      href: '/dashboard/updates',
      label: 'التحديثات',
      icon: Rocket,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kodax-dark">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-purple-500 mx-auto mb-4"
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kodax-dark flex">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 w-72 bg-kodax-medium/50 backdrop-blur-xl border-l border-white/5 z-50 transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Kodax Admin</h1>
                <p className="text-xs text-gray-400">لوحة التحكم</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'group-hover:text-white'}`}
                  />
                  <span className="font-medium">{item.label}</span>
                  {item.badge ? (
                    <span className="mr-auto bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-purple-600/30 flex items-center justify-center">
                <span className="text-purple-400 text-sm font-bold">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{user?.email}</p>
                <p className="text-xs text-gray-500">مسؤول</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-kodax-dark/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              {pendingCount > 0 && (
                <Link
                  href="/dashboard/orders"
                  className="relative flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 text-amber-400 text-sm hover:bg-amber-500/20 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  <span>{pendingCount} طلب معلق</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

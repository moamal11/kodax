'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Code2,
  Coins,
  Flag,
  PlayCircle,
  Unlock,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

interface Stats {
  users: number;
  codes: number;
  openReports: number;
  coinsEarnedToday: number;
  adsToday: number;
  unlocksToday: number;
}

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const since = startOfTodayISO();
      const [users, codes, reports, earned, ads, unlocks] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('code_snippets').select('*', { count: 'exact', head: true }),
        supabase
          .from('content_reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open'),
        supabase
          .from('point_transactions')
          .select('amount')
          .eq('type', 'earned')
          .gte('created_at', since)
          .limit(5000),
        supabase
          .from('ad_reward_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'rewarded')
          .gte('rewarded_at', since),
        supabase
          .from('point_transactions')
          .select('*', { count: 'exact', head: true })
          .in('source', ['unlock_course', 'unlock_field'])
          .gte('created_at', since),
      ]);
      setStats({
        users: users.count || 0,
        codes: codes.count || 0,
        openReports: reports.count || 0,
        coinsEarnedToday: (earned.data || []).reduce(
          (sum: number, r: any) => sum + (r.amount || 0),
          0
        ),
        adsToday: ads.count || 0,
        unlocksToday: unlocks.count || 0,
      });
    } catch (e) {
      console.error(e);
      setError('تعذّر تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = stats
    ? [
        { label: 'إجمالي المستخدمين', value: stats.users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'الأكواد المنشورة', value: stats.codes, icon: Code2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { label: 'بلاغات مفتوحة', value: stats.openReports, icon: Flag, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', href: '/dashboard/reports' },
        { label: 'كوينات مكتسبة اليوم', value: stats.coinsEarnedToday, icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { label: 'إعلانات مكافأة اليوم', value: stats.adsToday, icon: PlayCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
        { label: 'دورات فُتحت اليوم', value: stats.unlocksToday, icon: Unlock, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">الإحصائيات</h1>
          <p className="text-gray-400 mt-1">
            Kodax مجاني بالكامل — الكوينات تُكتسب من التعلم والإعلانات الاختيارية فقط.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            const body = (
              <div className={`rounded-2xl border ${c.border} ${c.bg} p-5 h-full`}>
                <div className="flex items-center justify-between">
                  <Icon className={`w-6 h-6 ${c.color}`} />
                  {c.href && <ArrowUpRight className="w-4 h-4 text-gray-500" />}
                </div>
                <p className="text-3xl font-bold text-white mt-4">
                  {c.value.toLocaleString('ar-IQ')}
                </p>
                <p className="text-gray-400 text-sm mt-1">{c.label}</p>
              </div>
            );
            return c.href ? (
              <Link key={c.label} href={c.href}>
                {body}
              </Link>
            ) : (
              <div key={c.label}>{body}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}

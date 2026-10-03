'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Flag, EyeOff, RotateCcw, Trash2, RefreshCw, ExternalLink } from 'lucide-react';

interface ReportRow {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  snippet_id: string;
  reporter: { username: string | null; full_name: string | null } | null;
  snippet: {
    id: string;
    title: string;
    language: string;
    is_hidden: boolean;
    is_public: boolean;
    report_count: number;
    user_id: string;
  } | null;
}

const REASONS: Record<string, string> = {
  phishing: 'احتيال / سرقة بيانات',
  malicious: 'كود ضار',
  offensive: 'محتوى مسيء',
  spam: 'سبام',
  copyright: 'انتهاك حقوق',
  other: 'أخرى',
};

type Filter = 'open' | 'reviewed' | 'dismissed';

export default function ReportsPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [filter, setFilter] = useState<Filter>('open');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('content_reports')
      .select(
        'id, reason, details, status, created_at, snippet_id, reporter:reporter_id (username, full_name), snippet:snippet_id (id, title, language, is_hidden, is_public, report_count, user_id)'
      )
      .eq('status', filter)
      .order('created_at', { ascending: false })
      .limit(200);
    if (err) setError('تعذّر تحميل البلاغات. تأكد من تطبيق migration الإشراف.');
    setRows((data as any) || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const moderate = async (snippetId: string, action: 'hide' | 'restore' | 'delete') => {
    if (action === 'delete' && !confirm('حذف هذا المحتوى نهائياً؟')) return;
    setBusy(snippetId + action);
    const { data, error: err } = await supabase.rpc('admin_moderate_snippet', {
      p_snippet_id: snippetId,
      p_action: action,
    });
    setBusy(null);
    if (err || !data?.success) {
      alert('فشل تنفيذ الإجراء');
      return;
    }
    load();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Flag className="w-7 h-7 text-red-400" />
            البلاغات والمحتوى
          </h1>
          <p className="text-gray-400 mt-1">
            المحتوى المنشور من المستخدمين. يُخفى تلقائياً بعد 3 بلاغات أو بلاغ احتيال/كود ضار.
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

      <div className="flex gap-2">
        {(['open', 'reviewed', 'dismissed'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
              filter === f
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'open' ? 'مفتوحة' : f === 'reviewed' ? 'تمت المراجعة' : 'مرفوضة'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && rows.length === 0 && !error && (
        <div className="text-center text-gray-500 py-16 border border-dashed border-white/10 rounded-2xl">
          لا توجد بلاغات هنا 🎉
        </div>
      )}

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg bg-red-500/15 text-red-300 text-xs">
                    {REASONS[r.reason] || r.reason}
                  </span>
                  {r.snippet?.is_hidden && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 text-xs">
                      مخفي
                    </span>
                  )}
                  <span className="text-gray-500 text-xs">
                    {new Date(r.created_at).toLocaleString('ar-IQ')}
                  </span>
                </div>
                <p className="text-white font-medium">
                  {r.snippet?.title || 'محتوى محذوف'}{' '}
                  <span className="text-gray-500 text-sm">({r.snippet?.language})</span>
                </p>
                <p className="text-gray-400 text-sm">
                  المُبلِّغ: {r.reporter?.full_name || r.reporter?.username || '—'} · عدد البلاغات:{' '}
                  {r.snippet?.report_count ?? 0}
                </p>
                {r.details && <p className="text-gray-300 text-sm">«{r.details}»</p>}
              </div>
              {r.snippet && (
                <div className="flex items-center gap-2">
                  <a
                    href={`https://kodax.app/code/${r.snippet.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white"
                    title="فتح"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {r.snippet.is_hidden ? (
                    <button
                      onClick={() => moderate(r.snippet!.id, 'restore')}
                      disabled={!!busy}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 text-sm hover:bg-emerald-500/25"
                    >
                      <RotateCcw className="w-4 h-4" /> استعادة
                    </button>
                  ) : (
                    <button
                      onClick={() => moderate(r.snippet!.id, 'hide')}
                      disabled={!!busy}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-300 text-sm hover:bg-amber-500/25"
                    >
                      <EyeOff className="w-4 h-4" /> إخفاء
                    </button>
                  )}
                  <button
                    onClick={() => moderate(r.snippet!.id, 'delete')}
                    disabled={!!busy}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/15 text-red-300 text-sm hover:bg-red-500/25"
                  >
                    <Trash2 className="w-4 h-4" /> حذف
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

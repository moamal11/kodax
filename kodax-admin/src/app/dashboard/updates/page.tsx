'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Download,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Rocket,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Smartphone,
  Globe,
  Monitor,
  X,
} from 'lucide-react';

interface AppUpdate {
  id: string;
  version: string;
  build_number: number;
  platform: string;
  release_notes: string | null;
  force_update: boolean;
  is_active: boolean;
  min_supported_version: string | null;
  download_url: string | null;
  eas_update_id: string | null;
  channel: string;
  published_by: string | null;
  created_at: string;
  updated_at: string;
}

const EMPTY_UPDATE: Partial<AppUpdate> = {
  version: '',
  build_number: 1,
  platform: 'all',
  release_notes: '',
  force_update: false,
  is_active: true,
  min_supported_version: '',
  download_url: '',
  eas_update_id: '',
  channel: 'production',
};

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<AppUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<AppUpdate | null>(null);
  const [formData, setFormData] = useState<Partial<AppUpdate>>(EMPTY_UPDATE);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadUpdates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_updates')
      .select('*')
      .order('build_number', { ascending: false });

    if (!error) {
      setUpdates(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.version || !formData.build_number) return;

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const payload = {
        version: formData.version,
        build_number: formData.build_number,
        platform: formData.platform || 'all',
        release_notes: formData.release_notes || null,
        force_update: formData.force_update || false,
        is_active: formData.is_active !== false,
        min_supported_version: formData.min_supported_version || null,
        download_url: formData.download_url || null,
        eas_update_id: formData.eas_update_id || null,
        channel: formData.channel || 'production',
        published_by: user?.id || null,
      };

      if (editingUpdate) {
        await supabase
          .from('app_updates')
          .update(payload)
          .eq('id', editingUpdate.id);
      } else {
        await supabase.from('app_updates').insert(payload);
      }

      setShowForm(false);
      setEditingUpdate(null);
      setFormData(EMPTY_UPDATE);
      loadUpdates();
    } catch (error) {
      console.error('Error saving update:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التحديث؟')) return;
    setDeleting(id);
    await supabase.from('app_updates').delete().eq('id', id);
    setDeleting(null);
    loadUpdates();
  };

  const handleEdit = (update: AppUpdate) => {
    setEditingUpdate(update);
    setFormData({
      version: update.version,
      build_number: update.build_number,
      platform: update.platform,
      release_notes: update.release_notes || '',
      force_update: update.force_update,
      is_active: update.is_active,
      min_supported_version: update.min_supported_version || '',
      download_url: update.download_url || '',
      eas_update_id: update.eas_update_id || '',
      channel: update.channel,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (update: AppUpdate) => {
    await supabase
      .from('app_updates')
      .update({ is_active: !update.is_active })
      .eq('id', update.id);
    loadUpdates();
  };

  const handleToggleForce = async (update: AppUpdate) => {
    await supabase
      .from('app_updates')
      .update({ force_update: !update.force_update })
      .eq('id', update.id);
    loadUpdates();
  };

  const platformIcon = (platform: string) => {
    switch (platform) {
      case 'android':
        return <Smartphone className="w-4 h-4" />;
      case 'ios':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const platformLabel = (platform: string) => {
    switch (platform) {
      case 'android':
        return 'أندرويد';
      case 'ios':
        return 'آيفون';
      default:
        return 'الكل';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Rocket className="w-7 h-7 text-purple-400" />
            إدارة التحديثات
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            إدارة تحديثات التطبيق OTA والتحديثات الإجبارية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadUpdates}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2.5 rounded-xl transition-colors border border-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          <button
            onClick={() => {
              setEditingUpdate(null);
              setFormData(EMPTY_UPDATE);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            تحديث جديد
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-kodax-medium/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">إجمالي التحديثات</span>
          </div>
          <p className="text-2xl font-bold text-white">{updates.length}</p>
        </div>
        <div className="bg-kodax-medium/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-gray-400 text-sm">تحديثات فعّالة</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {updates.filter((u) => u.is_active).length}
          </p>
        </div>
        <div className="bg-kodax-medium/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-gray-400 text-sm">تحديثات إجبارية</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {updates.filter((u) => u.force_update && u.is_active).length}
          </p>
        </div>
        <div className="bg-kodax-medium/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">آخر إصدار</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {updates[0]?.version || '-'}
          </p>
        </div>
      </div>

      {/* Updates List */}
      <div className="bg-kodax-medium/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">سجل التحديثات</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">جاري التحميل...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="p-12 text-center">
            <Rocket className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">لا توجد تحديثات بعد</p>
            <p className="text-gray-500 text-sm mt-1">أضف أول تحديث للتطبيق</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {updates.map((update) => (
              <div
                key={update.id}
                className={`p-5 hover:bg-white/[0.02] transition-colors ${
                  !update.is_active ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Version */}
                      <span className="text-lg font-bold text-white">
                        v{update.version}
                      </span>
                      <span className="text-xs text-gray-500">
                        Build #{update.build_number}
                      </span>

                      {/* Platform badge */}
                      <span className="flex items-center gap-1 text-xs bg-white/5 text-gray-400 px-2 py-1 rounded-lg">
                        {platformIcon(update.platform)}
                        {platformLabel(update.platform)}
                      </span>

                      {/* Channel badge */}
                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-lg">
                        {update.channel}
                      </span>

                      {/* Status badges */}
                      {update.is_active ? (
                        <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-lg">
                          <CheckCircle2 className="w-3 h-3" />
                          فعّال
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-gray-500/10 text-gray-500 px-2 py-1 rounded-lg">
                          <XCircle className="w-3 h-3" />
                          معطّل
                        </span>
                      )}

                      {update.force_update && (
                        <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-lg">
                          <AlertTriangle className="w-3 h-3" />
                          إجباري
                        </span>
                      )}
                    </div>

                    {/* Release notes */}
                    {update.release_notes && (
                      <p className="text-sm text-gray-400 mb-2 whitespace-pre-wrap leading-relaxed">
                        {update.release_notes}
                      </p>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {new Date(update.created_at).toLocaleDateString(
                          'ar-IQ',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                      {update.min_supported_version && (
                        <span>
                          الحد الأدنى: v{update.min_supported_version}
                        </span>
                      )}
                      {update.download_url && (
                        <a
                          href={update.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          رابط التحميل
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(update)}
                      title={update.is_active ? 'تعطيل' : 'تفعيل'}
                      className={`p-2.5 rounded-xl transition-colors ${
                        update.is_active
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                      }`}
                    >
                      {update.is_active ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleForce(update)}
                      title={
                        update.force_update ? 'إلغاء الإجباري' : 'جعله إجبارياً'
                      }
                      className={`p-2.5 rounded-xl transition-colors ${
                        update.force_update
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'bg-white/5 text-gray-500 hover:bg-white/10'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(update)}
                      className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(update.id)}
                      disabled={deleting === update.id}
                      className="p-2.5 rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-kodax-medium border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-400" />
                {editingUpdate ? 'تعديل التحديث' : 'تحديث جديد'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingUpdate(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Version + Build Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    رقم الإصدار *
                  </label>
                  <input
                    type="text"
                    placeholder="1.2.0"
                    value={formData.version || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, version: e.target.value })
                    }
                    required
                    className="w-full bg-kodax-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    رقم البناء *
                  </label>
                  <input
                    type="number"
                    placeholder="15"
                    value={formData.build_number || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        build_number: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    min={1}
                    className="w-full bg-kodax-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Platform + Channel */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    المنصة
                  </label>
                  <select
                    value={formData.platform || 'all'}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value })
                    }
                    className="w-full bg-kodax-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="all">الكل</option>
                    <option value="android">أندرويد</option>
                    <option value="ios">آيفون</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    القناة
                  </label>
                  <select
                    value={formData.channel || 'production'}
                    onChange={(e) =>
                      setFormData({ ...formData, channel: e.target.value })
                    }
                    className="w-full bg-kodax-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="production">production</option>
                    <option value="preview">preview</option>
                    <option value="development">development</option>
                  </select>
                </div>
              </div>

              {/* Release Notes */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  ملاحظات الإصدار
                </label>
                <textarea
                  placeholder="ما الجديد في هذا التحديث..."
                  value={formData.release_notes || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      release_notes: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full bg-kodax-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Min Version + Download URL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    الحد الأدنى للإصدار
                  </label>
                  <input
                    type="text"
                    placeholder="1.0.0"
                    value={formData.min_supported_version || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_supported_version: e.target.value,
                      })
                    }
                    className="w-full bg-kodax-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    الإصدارات أقل من هذا ستُجبر على التحديث
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    رابط التحميل (APK/IPA)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.download_url || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        download_url: e.target.value,
                      })
                    }
                    className="w-full bg-kodax-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* EAS Update ID */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  معرف تحديث EAS (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="eas-update-id..."
                  value={formData.eas_update_id || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eas_update_id: e.target.value,
                    })
                  }
                  className="w-full bg-kodax-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                  dir="ltr"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.force_update || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        force_update: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded bg-kodax-dark border-white/20 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-white text-sm font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      تحديث إجباري
                    </span>
                    <p className="text-xs text-gray-500">
                      لن يتمكن المستخدم من تجاهل هذا التحديث
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active !== false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded bg-kodax-dark border-white/20 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-white text-sm font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      فعّال
                    </span>
                    <p className="text-xs text-gray-500">
                      إظهار هذا التحديث للمستخدمين
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUpdate(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.version}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4" />
                  )}
                  {editingUpdate ? 'حفظ التعديلات' : 'نشر التحديث'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  MessageCircle,
  Bell,
  X,
  Upload,
  Eye,
  EyeOff,
  Clock,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  CalendarX,
  UserCheck,
} from 'lucide-react';

// ===== Types =====
interface BroadcastMessage {
  id: string;
  type: 'toast' | 'modal';
  title: string;
  body: string | null;
  image_url: string | null;
  display_mode: 'once' | 'until_dismissed';
  scheduled_at: string;
  is_active: boolean;
  target_audience: 'all' | 'premium' | 'free';
  expires_at: string | null;
  only_existing_users: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  read_count?: number;
}

interface FormData {
  type: 'toast' | 'modal';
  title: string;
  body: string;
  image_url: string | null;
  display_mode: 'once' | 'until_dismissed';
  scheduled_at: string;
  is_active: boolean;
  target_audience: 'all' | 'premium' | 'free';
  expires_at: string;
  only_existing_users: boolean;
}

const EMPTY_FORM: FormData = {
  type: 'toast',
  title: '',
  body: '',
  image_url: null,
  display_mode: 'once',
  scheduled_at: new Date().toISOString().slice(0, 16),
  is_active: true,
  target_audience: 'all',
  expires_at: '',
  only_existing_users: false,
};

function compressImage(
  file: File,
  maxWidth = 800,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = (h * maxWidth) / w;
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context failed'));
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Blob failed'))),
        'image/webp',
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState<BroadcastMessage | null>(
    null
  );
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('broadcast_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const messagesWithCounts = await Promise.all(
        (data || []).map(async (msg: BroadcastMessage) => {
          const { count } = await supabase
            .from('broadcast_message_reads')
            .select('*', { count: 'exact', head: true })
            .eq('message_id', msg.id);
          return { ...msg, read_count: count || 0 };
        })
      );

      setMessages(messagesWithCounts);
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
      const filePath = `messages/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('broadcast-images')
        .upload(filePath, compressed, {
          contentType: 'image/webp',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('broadcast-images')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      setImagePreview(urlData.publicUrl);
    } catch {
      alert('حدث خطأ أثناء رفع الصورة');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = async () => {
    if (!formData.image_url) return;
    try {
      const match = formData.image_url.match(/broadcast-images\/(.+)$/);
      if (match) {
        await supabase.storage.from('broadcast-images').remove([match[1]]);
      }
    } catch {
      // silent
    }
    setFormData((prev) => ({ ...prev, image_url: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const payload: Record<string, unknown> = {
        type: formData.type,
        title: formData.title.trim(),
        body: formData.body.trim() || null,
        image_url: formData.image_url || null,
        display_mode:
          formData.type === 'toast' ? 'once' : formData.display_mode,
        scheduled_at: formData.scheduled_at || new Date().toISOString(),
        is_active: formData.is_active,
        target_audience: formData.target_audience,
        expires_at: formData.expires_at || null,
        only_existing_users: formData.only_existing_users,
        created_by: user?.id || null,
      };

      if (editingMessage) {
        const { error } = await supabase
          .from('broadcast_messages')
          .update(payload)
          .eq('id', editingMessage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('broadcast_messages')
          .insert(payload);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingMessage(null);
      setFormData(EMPTY_FORM);
      setImagePreview(null);
      await loadMessages();
    } catch {
      alert('حدث خطأ أثناء الحفظ');
    }
    setSaving(false);
  };

  const handleEdit = (msg: BroadcastMessage) => {
    setEditingMessage(msg);
    setFormData({
      type: msg.type,
      title: msg.title,
      body: msg.body || '',
      image_url: msg.image_url,
      display_mode: msg.display_mode,
      scheduled_at: msg.scheduled_at?.slice(0, 16) || '',
      is_active: msg.is_active,
      target_audience: msg.target_audience,
      expires_at: msg.expires_at?.slice(0, 16) || '',
      only_existing_users: msg.only_existing_users || false,
    });
    setImagePreview(msg.image_url);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    setDeleting(id);
    try {
      const msg = messages.find((m) => m.id === id);
      if (msg?.image_url) {
        const match = msg.image_url.match(/broadcast-images\/(.+)$/);
        if (match) {
          await supabase.storage.from('broadcast-images').remove([match[1]]);
        }
      }
      const { error } = await supabase
        .from('broadcast_messages')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadMessages();
    } catch {
      alert('حدث خطأ أثناء الحذف');
    }
    setDeleting(null);
  };

  const handleToggleActive = async (msg: BroadcastMessage) => {
    try {
      const { error } = await supabase
        .from('broadcast_messages')
        .update({ is_active: !msg.is_active })
        .eq('id', msg.id);
      if (error) throw error;
      await loadMessages();
    } catch {
      // silent
    }
  };

  const openNew = () => {
    setEditingMessage(null);
    setFormData({
      ...EMPTY_FORM,
      scheduled_at: new Date().toISOString().slice(0, 16),
    });
    setImagePreview(null);
    setShowForm(true);
  };

  const isExpired = (msg: BroadcastMessage) =>
    msg.expires_at && new Date(msg.expires_at) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageCircle className="w-7 h-7 text-purple-400" />
            رسائل التطبيق
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            إرسال إشعارات ورسائل — يدعم {'{{name}}'} كمتغير ديناميكي
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadMessages}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white hover:from-purple-500 hover:to-purple-600 transition-all text-sm font-medium shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            رسالة جديدة
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{messages.length}</p>
              <p className="text-xs text-gray-400">إجمالي الرسائل</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {messages.filter((m) => m.is_active && !isExpired(m)).length}
              </p>
              <p className="text-xs text-gray-400">رسائل نشطة</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {messages.filter((m) => m.type === 'toast').length}
              </p>
              <p className="text-xs text-gray-400">رسائل Toast</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {messages.filter((m) => m.type === 'modal').length}
              </p>
              <p className="text-xs text-gray-400">رسائل منبثقة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">جاري تحميل الرسائل...</p>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
          <MessageCircle className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">
            لا توجد رسائل
          </h3>
          <p className="text-gray-500 mb-6">
            قم بإنشاء أول رسالة لإرسالها للمستخدمين
          </p>
          <button
            onClick={openNew}
            className="px-6 py-3 bg-purple-600 rounded-xl text-white hover:bg-purple-500 transition-colors font-medium"
          >
            إنشاء رسالة
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white/5 border rounded-xl p-5 transition-all hover:bg-white/[0.07] ${
                !msg.is_active || isExpired(msg)
                  ? 'border-red-500/20 opacity-60'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        msg.type === 'toast'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {msg.type === 'toast' ? '🔔 Toast' : '💬 منبثقة'}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        msg.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {msg.is_active ? 'نشطة' : 'معطلة'}
                    </span>
                    {isExpired(msg) && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400">
                        ⏰ منتهية
                      </span>
                    )}
                    {msg.type === 'modal' && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-400">
                        {msg.display_mode === 'once'
                          ? 'مرة واحدة'
                          : 'حتى الإغلاق'}
                      </span>
                    )}
                    {msg.target_audience !== 'all' && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-400">
                        {msg.target_audience === 'premium'
                          ? '💎 بريميوم'
                          : '🆓 مجاني'}
                      </span>
                    )}
                    {msg.only_existing_users && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-500/20 text-orange-400">
                        👥 مسجلين فقط
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 truncate">
                    {msg.title}
                  </h3>
                  {msg.body && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                      {msg.body}
                    </p>
                  )}
                  {msg.image_url && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>صورة مرفقة</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(msg.scheduled_at).toLocaleDateString('ar-IQ', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {msg.expires_at && (
                      <span className="flex items-center gap-1.5">
                        <CalendarX className="w-3.5 h-3.5" />
                        ينتهي:{' '}
                        {new Date(msg.expires_at).toLocaleDateString('ar-IQ', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {msg.read_count || 0} قرأها
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(msg)}
                    className={`p-2 rounded-lg transition-colors ${msg.is_active ? 'hover:bg-yellow-500/10 text-yellow-400' : 'hover:bg-green-500/10 text-green-400'}`}
                    title={msg.is_active ? 'تعطيل' : 'تفعيل'}
                  >
                    {msg.is_active ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(msg)}
                    className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-colors"
                    title="تعديل"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    disabled={deleting === msg.id}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors disabled:opacity-50"
                    title="حذف"
                  >
                    {deleting === msg.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Create/Edit Modal ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a3e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#1a1a3e] z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editingMessage ? (
                  <>
                    <Edit3 className="w-5 h-5 text-blue-400" /> تعديل الرسالة
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-purple-400" /> رسالة جديدة
                  </>
                )}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingMessage(null);
                  setImagePreview(null);
                }}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Message Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  نوع الرسالة *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['toast', 'modal'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          type: t,
                          display_mode:
                            t === 'toast' ? 'once' : prev.display_mode,
                        }))
                      }
                      className={`p-4 rounded-xl border-2 transition-all text-right ${
                        formData.type === t
                          ? t === 'toast'
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      {t === 'toast' ? (
                        <Bell
                          className={`w-6 h-6 mb-2 ${formData.type === 'toast' ? 'text-amber-400' : 'text-gray-500'}`}
                        />
                      ) : (
                        <AlertCircle
                          className={`w-6 h-6 mb-2 ${formData.type === 'modal' ? 'text-blue-400' : 'text-gray-500'}`}
                        />
                      )}
                      <p
                        className={`font-bold ${formData.type === t ? (t === 'toast' ? 'text-amber-400' : 'text-blue-400') : 'text-gray-400'}`}
                      >
                        {t === 'toast' ? 'Toast مؤقت' : 'رسالة منبثقة'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t === 'toast'
                          ? 'إشعار بسيط يظهر مرة واحدة ثم يختفي'
                          : 'نافذة في منتصف الشاشة مع زر إغلاق'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  العنوان *{' '}
                  <span className="text-gray-500 text-xs mr-2">
                    {'يدعم {{name}}'}
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                  placeholder={'مرحبا {{name}} 👋'}
                  required
                  dir="rtl"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  المحتوى{' '}
                  <span className="text-gray-500 text-xs mr-2">
                    {'يدعم {{name}}'}
                  </span>
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, body: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="محتوى الرسالة..."
                  dir="rtl"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  صورة{' '}
                  <span className="text-gray-500">
                    (اختياري — يتم ضغطها تلقائياً)
                  </span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={imagePreview}
                      alt="معاينة"
                      className="w-full max-h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
                        title="تغيير"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2 rounded-lg bg-red-500/60 text-white hover:bg-red-500/80 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full p-6 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:border-purple-500/30 hover:text-purple-400 transition-all text-center disabled:opacity-50"
                  >
                    {uploading ? (
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                    )}
                    <p className="text-sm font-medium">
                      {uploading ? 'جاري الرفع...' : 'اضغط لاختيار صورة'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WebP — حد أقصى 5MB
                    </p>
                  </button>
                )}
              </div>

              {/* Display Mode (Modal only) */}
              {formData.type === 'modal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    سلوك العرض
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['once', 'until_dismissed'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            display_mode: mode,
                          }))
                        }
                        className={`p-3 rounded-xl border transition-all text-right ${
                          formData.display_mode === mode
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <p
                          className={`font-medium text-sm ${formData.display_mode === mode ? 'text-purple-400' : 'text-gray-400'}`}
                        >
                          {mode === 'once' ? 'مرة واحدة' : 'حتى الإغلاق'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {mode === 'once'
                            ? 'تظهر مرة واحدة فقط لكل مستخدم'
                            : 'تظهر كل مرة حتى يغلقها المستخدم'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  تاريخ الإرسال
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduled_at: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all [color-scheme:dark]"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  اتركه كما هو للإرسال الفوري
                </p>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  تاريخ الانتهاء{' '}
                  <span className="text-gray-500">(اختياري)</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expires_at: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all [color-scheme:dark]"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  بعد هذا التاريخ لن تظهر الرسالة لأي مستخدم
                </p>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الجمهور المستهدف
                </label>
                <select
                  value={formData.target_audience}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      target_audience: e.target.value as
                        | 'all'
                        | 'premium'
                        | 'free',
                    }))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500/50 outline-none transition-all [color-scheme:dark]"
                >
                  <option value="all">جميع المستخدمين</option>
                  <option value="premium">مشتركين بريميوم فقط</option>
                  <option value="free">المستخدمين المجانيين فقط</option>
                </select>
              </div>

              {/* Only Existing Users */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <p className="text-sm font-medium text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-orange-400" />
                    المسجلين قبل الإرسال فقط
                  </p>
                  <p className="text-xs text-gray-500">
                    المستخدمين الجدد بعد إرسال الرسالة لن يستلموها
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      only_existing_users: !prev.only_existing_users,
                    }))
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.only_existing_users ? 'bg-orange-500' : 'bg-gray-600'}`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.only_existing_users ? 'left-0.5' : 'left-[26px]'}`}
                  />
                </button>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <p className="text-sm font-medium text-white">
                    تفعيل الرسالة
                  </p>
                  <p className="text-xs text-gray-500">
                    الرسائل المعطلة لن تظهر للمستخدمين
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: !prev.is_active,
                    }))
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.is_active ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.is_active ? 'left-0.5' : 'left-[26px]'}`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMessage(null);
                    setImagePreview(null);
                  }}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.title.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white hover:from-purple-500 hover:to-purple-600 transition-all font-medium disabled:opacity-50 shadow-lg shadow-purple-500/20"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {editingMessage ? 'تحديث الرسالة' : 'إرسال الرسالة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

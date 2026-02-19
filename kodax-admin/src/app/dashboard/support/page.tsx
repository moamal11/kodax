'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  User,
  Mail,
  Shield,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'admin';
  sender_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

type FilterStatus = 'all' | 'open' | 'in_progress' | 'resolved' | 'closed';

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    setTickets(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // الاشتراك في تذاكر جديدة
  useEffect(() => {
    const channel = supabase
      .channel('admin-support-tickets')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => {
          loadTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTickets]);

  const loadMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setLoadingMessages(false);

    // تعليم كمقروء
    await supabase
      .from('support_messages')
      .update({ read: true })
      .eq('ticket_id', ticketId)
      .eq('sender_type', 'user')
      .eq('read', false);
  };

  const openTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    loadMessages(ticket.id);

    // الاشتراك في الرسائل الجديدة
    const channel = supabase
      .channel(`support-chat-${ticket.id}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${ticket.id}`,
        },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as SupportMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    setSendingReply(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from('support_messages').insert({
      ticket_id: selectedTicket.id,
      sender_type: 'admin',
      sender_id: user?.id,
      message: replyText.trim(),
    });

    // تحديث حالة التذكرة لقيد المعالجة
    if (selectedTicket.status === 'open') {
      await supabase
        .from('support_tickets')
        .update({ status: 'in_progress' })
        .eq('id', selectedTicket.id);
      setSelectedTicket({ ...selectedTicket, status: 'in_progress' });
    }

    setReplyText('');
    setSendingReply(false);
    loadMessages(selectedTicket.id);
  };

  const updateTicketStatus = async (status: SupportTicket['status']) => {
    if (!selectedTicket) return;
    await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', selectedTicket.id);
    setSelectedTicket({ ...selectedTicket, status });
    loadTickets();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.user_name?.toLowerCase().includes(q) ||
      t.user_email?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q)
    );
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { label: 'مفتوحة', color: 'amber', icon: Clock };
      case 'in_progress':
        return { label: 'قيد المعالجة', color: 'blue', icon: AlertCircle };
      case 'resolved':
        return { label: 'تم الحل', color: 'green', icon: CheckCircle2 };
      case 'closed':
        return { label: 'مغلقة', color: 'gray', icon: XCircle };
      default:
        return { label: status, color: 'gray', icon: Clock };
    }
  };

  const statusFilters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'open', label: 'مفتوحة' },
    { key: 'in_progress', label: 'قيد المعالجة' },
    { key: 'resolved', label: 'تم الحل' },
    { key: 'closed', label: 'مغلقة' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">الدعم الفني</h1>
            <p className="text-sm text-gray-400">
              إدارة رسائل وتذاكر الدعم الفني
            </p>
          </div>
        </div>
        <button
          onClick={loadTickets}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((sf) => (
            <button
              key={sf.key}
              onClick={() => setFilter(sf.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === sf.key
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-280px)]">
        {/* Tickets List */}
        <div
          className={`${
            selectedTicket ? 'hidden lg:block lg:w-96' : 'w-full'
          } space-y-2 overflow-y-auto pr-1`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">لا توجد تذاكر</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const config = getStatusConfig(ticket.status);
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <button
                  key={ticket.id}
                  onClick={() => openTicket(ticket)}
                  className={`w-full text-right p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-purple-600/10 border-purple-500/30'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-lg bg-${config.color}-500/10 text-${config.color}-400`}
                    >
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.updated_at).toLocaleString('ar-IQ', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    {ticket.subject}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <User className="w-3 h-3" />
                    <span>{ticket.user_name || 'مستخدم'}</span>
                    <span className="text-gray-600">|</span>
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{ticket.user_email}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Chat Panel */}
        {selectedTicket && (
          <div className="flex-1 flex flex-col bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-4">
              <button
                onClick={() => setSelectedTicket(null)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">
                  {selectedTicket.subject}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {selectedTicket.user_name || 'مستخدم'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {selectedTicket.user_email}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedTicket.status !== 'resolved' && (
                  <button
                    onClick={() => updateTicketStatus('resolved')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تم الحل
                  </button>
                )}
                {selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => updateTicketStatus('closed')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-500/10 text-gray-400 text-xs font-medium hover:bg-gray-500/20 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    إغلاق
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_type === 'admin'
                        ? 'justify-start'
                        : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl ${
                        msg.sender_type === 'admin'
                          ? 'bg-purple-600/15 border border-purple-500/20 rounded-bl-sm'
                          : 'bg-white/5 border border-white/10 rounded-br-sm'
                      }`}
                    >
                      {msg.sender_type === 'admin' && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Shield className="w-3 h-3 text-purple-400" />
                          <span className="text-[10px] text-purple-400 font-semibold">
                            الأدمن
                          </span>
                        </div>
                      )}
                      {msg.sender_type === 'user' && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {selectedTicket.user_name || 'مستخدم'}
                          </span>
                        </div>
                      )}
                      <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1 text-left">
                        {new Date(msg.created_at).toLocaleString('ar-IQ', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            {selectedTicket.status !== 'closed' && (
              <div className="p-4 border-t border-white/5 flex gap-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب الرد..."
                  rows={2}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || sendingReply}
                  className="self-end px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 rounded-xl text-white text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  إرسال
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

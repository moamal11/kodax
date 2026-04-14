/**
 * خدمة الدعم الفني - Kodax Support Service
 * إدارة تذاكر الدعم والرسائل والإشعارات
 */

import { supabase } from '@/lib/supabase';

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_avatar: string | null;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'admin';
  sender_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface SupportNotification {
  id: string;
  user_id: string;
  ticket_id: string | null;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

class SupportService {
  /**
   * إنشاء تذكرة دعم جديدة مع أول رسالة
   */
  async createTicket(params: {
    message: string;
    subject?: string;
  }): Promise<{ success: boolean; ticketId?: string; error?: string }> {
    try {
      // جلب بيانات المستخدم الحالي
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'يجب تسجيل الدخول أولاً' };

      // جلب ملف المستخدم
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', user.id)
        .single();

      // إنشاء التذكرة
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          user_name: profile?.full_name || profile?.username || 'مستخدم',
          user_email: user.email || null,
          user_avatar: profile?.avatar_url || null,
          subject: params.subject || 'دعم فني',
        })
        .select('id')
        .single();

      if (ticketError || !ticket) {
        return { success: false, error: 'فشل في إنشاء التذكرة' };
      }

      // إضافة الرسالة الأولى
      const { error: msgError } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticket.id,
          sender_type: 'user',
          sender_id: user.id,
          message: params.message,
        });

      if (msgError) {
        return { success: false, error: 'فشل في إرسال الرسالة' };
      }

      return { success: true, ticketId: ticket.id };
    } catch (error) {
      return { success: false, error: 'حدث خطأ غير متوقع' };
    }
  }

  /**
   * إرسال رسالة في تذكرة موجودة
   */
  async sendMessage(ticketId: string, message: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from('support_messages').insert({
        ticket_id: ticketId,
        sender_type: 'user',
        sender_id: user.id,
        message,
      });

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * جلب تذاكر المستخدم الحالي
   */
  async getUserTickets(): Promise<SupportTicket[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        return [];
      }

      return data || [];
    } catch {
      return [];
    }
  }

  /**
   * جلب رسائل التذكرة
   */
  async getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        return [];
      }

      return data || [];
    } catch {
      return [];
    }
  }

  /**
   * جلب إشعارات الدعم غير المقروءة
   */
  async getUnreadNotifications(): Promise<SupportNotification[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('support_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }

  /**
   * تعليم الإشعارات كمقروءة
   */
  async markNotificationsRead(ticketId?: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('support_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (ticketId) {
        query = query.eq('ticket_id', ticketId);
      }

      await query;
    } catch {}
  }

  /**
   * الاشتراك في رسائل تذكرة معينة (realtime)
   */
  subscribeToTicketMessages(
    ticketId: string,
    onNewMessage: (message: SupportMessage) => void
  ) {
    const channel = supabase
      .channel(`support-ticket-${ticketId}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload: any) => {
          onNewMessage(payload.new as SupportMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * الاشتراك في إشعارات الدعم الجديدة (realtime)
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: SupportNotification) => void
  ) {
    const channel = supabase
      .channel(`support-notifications-${userId}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          onNotification(payload.new as SupportNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const supportService = new SupportService();
export default supportService;

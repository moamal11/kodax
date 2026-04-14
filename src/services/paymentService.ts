/**
 * خدمة الدفع - Kodax Payment Service
 * إدارة طلبات الدفع وتحويل النقاط
 */

import { supabase } from '@/lib/supabase';
import {
  PaymentOrder,
  CreatePaymentOrderData,
  PaymentNotification,
  PaymentResult,
  PaymentOrderStatus,
} from '@/types/payment';
import { Platform } from 'react-native';

class PaymentService {
  /**
   * رفع صورة التحويل إلى Supabase Storage
   */
  async uploadReceiptImage(
    userId: string,
    imageUri: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileName = `receipt_${userId}_${Date.now()}.jpg`;
      const filePath = `receipts/${userId}/${fileName}`;

      // قراءة الملف
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // رفع إلى Supabase Storage
      const { data, error } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading receipt:', error);
        return { success: false, error: 'فشل في رفع صورة التحويل' };
      }

      // الحصول على الرابط العام
      const { data: urlData } = supabase.storage
        .from('payment-receipts')
        .getPublicUrl(filePath);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('Error uploading receipt image:', error);
      return { success: false, error: 'حدث خطأ أثناء رفع الصورة' };
    }
  }

  /**
   * إنشاء طلب دفع جديد
   */
  async createPaymentOrder(
    userId: string,
    orderData: CreatePaymentOrderData
  ): Promise<PaymentResult> {
    try {
      const { data, error } = await supabase
        .from('payment_orders')
        .insert({
          user_id: userId,
          payment_method: orderData.payment_method,
          payment_details: orderData.payment_details,
          package_id: orderData.package_id,
          points_requested: orderData.points_requested,
          price_amount: orderData.price_amount,
          price_currency: orderData.price_currency,
          receipt_image_url: orderData.receipt_image_url || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating payment order:', error);
        return { success: false, error: 'فشل في إنشاء طلب الدفع' };
      }

      // إنشاء إشعار محلي
      await this.createPaymentNotification(
        userId,
        data.id,
        'order_submitted',
        'تم إرسال طلبك!',
        `تم إرسال طلب شراء ${orderData.points_requested} نقطة. سيتم مراجعته خلال 1-2 ساعة.`
      );

      return { success: true, order: data as PaymentOrder };
    } catch (error) {
      console.error('Error creating payment order:', error);
      return { success: false, error: 'حدث خطأ غير متوقع' };
    }
  }

  /**
   * جلب طلبات الدفع الخاصة بالمستخدم
   */
  async getUserOrders(userId: string): Promise<PaymentOrder[]> {
    try {
      const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        return [];
      }

      return (data || []) as PaymentOrder[];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  /**
   * جلب طلب دفع محدد
   */
  async getOrder(orderId: string): Promise<PaymentOrder | null> {
    try {
      const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) return null;
      return data as PaymentOrder;
    } catch {
      return null;
    }
  }

  /**
   * إنشاء إشعار دفع
   */
  async createPaymentNotification(
    userId: string,
    orderId: string | null,
    type: PaymentNotification['type'],
    title: string,
    message: string
  ): Promise<void> {
    try {
      await supabase.from('payment_notifications').insert({
        user_id: userId,
        order_id: orderId,
        type,
        title,
        message,
      });
    } catch (error) {
      console.error('Error creating payment notification:', error);
    }
  }

  /**
   * جلب إشعارات الدفع
   */
  async getPaymentNotifications(
    userId: string
  ): Promise<PaymentNotification[]> {
    try {
      const { data, error } = await supabase
        .from('payment_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) return [];
      return (data || []) as PaymentNotification[];
    } catch {
      return [];
    }
  }

  /**
   * تحديد إشعار كمقروء
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('payment_notifications')
        .update({ read: true })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * عدد الإشعارات غير المقروءة
   */
  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('payment_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * التحقق مما إذا كان المستخدم مسؤولاً
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * الاشتراك في تحديثات طلبات الدفع (Realtime)
   */
  subscribeToOrderUpdates(
    userId: string,
    callback: (order: PaymentOrder) => void
  ) {
    const channel = supabase
      .channel(`payment-orders-${userId}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          callback(payload.new as PaymentOrder);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;

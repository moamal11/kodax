/**
 * شاشة طلبات الدفع - Kodax Payment Orders
 * عرض طلبات المستخدم مع حالاتها
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { paymentService } from '@/services/paymentService';
import { PaymentOrder, PAYMENT_METHODS } from '@/types/payment';
import { supabase } from '@/lib/supabase';

export default function PaymentOrdersScreen() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        loadOrders(data.user.id);
      }
    };
    getUser();
  }, []);

  // الاشتراك في تحديثات الطلبات
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = paymentService.subscribeToOrderUpdates(
      userId,
      (updatedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
        );
      }
    );
    return unsubscribe;
  }, [userId]);

  const loadOrders = async (uid: string) => {
    setLoading(true);
    const userOrders = await paymentService.getUserOrders(uid);
    setOrders(userOrders);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    await loadOrders(userId);
    setRefreshing(false);
  }, [userId]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'معلق',
          color: '#f59e0b',
          icon: 'time' as const,
          bg: 'rgba(245, 158, 11, 0.1)',
        };
      case 'approved':
        return {
          label: 'تمت الموافقة',
          color: '#10b981',
          icon: 'checkmark-circle' as const,
          bg: 'rgba(16, 185, 129, 0.1)',
        };
      case 'rejected':
        return {
          label: 'مرفوض',
          color: '#ef4444',
          icon: 'close-circle' as const,
          bg: 'rgba(239, 68, 68, 0.1)',
        };
      default:
        return {
          label: status,
          color: '#6b7280',
          icon: 'help-circle' as const,
          bg: 'rgba(107, 114, 128, 0.1)',
        };
    }
  };

  const getMethodInfo = (method: string) => {
    return PAYMENT_METHODS.find((m) => m.id === method);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrder = (order: PaymentOrder, index: number) => {
    const status = getStatusInfo(order.status);
    const method = getMethodInfo(order.payment_method);

    return (
      <Animated.View
        key={order.id}
        entering={FadeInDown.delay(index * 80).duration(300)}
      >
        <View style={styles.orderCard}>
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon} size={16} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
            <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
          </View>

          {/* Body */}
          <View style={styles.orderBody}>
            <View style={styles.orderRow}>
              <View style={styles.orderDetail}>
                <Ionicons name="diamond" size={18} color="#a78bfa" />
                <Text style={styles.orderDetailText}>
                  {order.points_approved || order.points_requested} نقطة
                </Text>
              </View>
              <View style={styles.orderDetail}>
                <Ionicons
                  name={(method?.icon as any) || 'card'}
                  size={18}
                  color={method?.color || '#fff'}
                />
                <Text style={styles.orderDetailText}>{method?.nameAr}</Text>
              </View>
            </View>

            <View style={styles.orderRow}>
              <Text style={styles.orderPaymentDetails}>
                {order.payment_details}
              </Text>
              <Text style={styles.orderPrice}>
                {order.price_amount.toLocaleString('ar-IQ')} د.ع
              </Text>
            </View>

            {/* Receipt thumbnail */}
            {order.receipt_image_url && (
              <View style={styles.receiptThumbnail}>
                <Image
                  source={{ uri: order.receipt_image_url }}
                  style={styles.receiptThumb}
                />
                <Text style={styles.receiptLabel}>صورة التحويل مرفقة</Text>
              </View>
            )}

            {/* Admin Note */}
            {order.admin_note && (
              <View style={styles.adminNote}>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={16}
                  color="#60a5fa"
                />
                <Text style={styles.adminNoteText}>{order.admin_note}</Text>
              </View>
            )}

            {/* Points approved different from requested */}
            {order.status === 'approved' &&
              order.points_approved &&
              order.points_approved !== order.points_requested && (
                <View style={styles.modifiedPoints}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color="#f59e0b"
                  />
                  <Text style={styles.modifiedPointsText}>
                    تم تعديل النقاط: طلبت {order.points_requested} وحصلت على{' '}
                    {order.points_approved}
                  </Text>
                </View>
              )}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>طلباتي</Text>
          <TouchableOpacity
            onPress={() => router.push('/payment' as any)}
            style={styles.newOrderBtn}
          >
            <Ionicons name="add" size={24} color="#a78bfa" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#4b5563" />
            <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
            <Text style={styles.emptyMessage}>لم تقم بأي عملية شراء بعد</Text>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => router.push('/payment' as any)}
            >
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.buyButtonGradient}
              >
                <Ionicons name="diamond" size={20} color="#fff" />
                <Text style={styles.buyButtonText}>شراء نقاط</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#8b5cf6"
              />
            }
          >
            {/* Stats Summary */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statCard,
                  { borderColor: 'rgba(245, 158, 11, 0.3)' },
                ]}
              >
                <Text style={[styles.statNumber, { color: '#f59e0b' }]}>
                  {orders.filter((o) => o.status === 'pending').length}
                </Text>
                <Text style={styles.statLabel}>معلق</Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  { borderColor: 'rgba(16, 185, 129, 0.3)' },
                ]}
              >
                <Text style={[styles.statNumber, { color: '#10b981' }]}>
                  {orders.filter((o) => o.status === 'approved').length}
                </Text>
                <Text style={styles.statLabel}>مقبول</Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  { borderColor: 'rgba(239, 68, 68, 0.3)' },
                ]}
              >
                <Text style={[styles.statNumber, { color: '#ef4444' }]}>
                  {orders.filter((o) => o.status === 'rejected').length}
                </Text>
                <Text style={styles.statLabel}>مرفوض</Text>
              </View>
            </View>

            {orders.map((order, index) => renderOrder(order, index))}
          </ScrollView>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  newOrderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  buyButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 12,
  },
  buyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 50, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  // Order Card
  orderCard: {
    backgroundColor: 'rgba(30, 30, 50, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  orderBody: {
    padding: 16,
    gap: 12,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#d1d5db',
    fontWeight: '500',
  },
  orderPaymentDetails: {
    fontSize: 13,
    color: '#9ca3af',
  },
  orderPrice: {
    fontSize: 14,
    color: '#a78bfa',
    fontWeight: '600',
  },
  receiptThumbnail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    borderRadius: 10,
    padding: 8,
  },
  receiptThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  receiptLabel: {
    fontSize: 12,
    color: '#a78bfa',
  },
  adminNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    borderRadius: 10,
    padding: 12,
  },
  adminNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#60a5fa',
    textAlign: 'right',
  },
  modifiedPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 10,
    padding: 10,
  },
  modifiedPointsText: {
    flex: 1,
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'right',
  },
});

/**
 * أنواع نظام الدفع - Kodax Payment System Types
 */

// طرق الدفع المتاحة
export type PaymentMethod = 'asiacell' | 'zain' | 'mastercard' | 'zain_cash';

// معلومات طريقة الدفع
export interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  nameAr: string;
  icon: string; // Ionicons name
  color: string;
  placeholder: string;
  inputLabel: string;
  inputType: 'phone' | 'card';
  description: string;
}

// طرق الدفع المتاحة
export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    id: 'asiacell',
    name: 'Asiacell',
    nameAr: 'آسياسيل',
    icon: 'phone-portrait',
    color: '#e74c3c',
    placeholder: '07748974754',
    inputLabel: 'رقم هاتف آسياسيل',
    inputType: 'phone',
    description: 'ادفع عبر رصيد آسياسيل',
  },
  {
    id: 'zain',
    name: 'Zain',
    nameAr: 'زين',
    icon: 'phone-portrait',
    color: '#8e44ad',
    placeholder: '07824190961',
    inputLabel: 'رقم هاتف زين',
    inputType: 'phone',
    description: 'ادفع عبر رصيد زين',
  },
  {
    id: 'mastercard',
    name: 'MasterCard',
    nameAr: 'ماستركارد',
    icon: 'card',
    color: '#f39c12',
    placeholder: '88882962759',
    inputLabel: 'رقم البطاقة',
    inputType: 'card',
    description: 'ادفع عبر بطاقة ماستركارد',
  },
  {
    id: 'zain_cash',
    name: 'Zain Cash',
    nameAr: 'زين كاش',
    icon: 'wallet',
    color: '#2ecc71',
    placeholder: '07748974754',
    inputLabel: 'رقم زين كاش',
    inputType: 'phone',
    description: 'ادفع عبر محفظة زين كاش',
  },
];

// حالة طلب الدفع
export type PaymentOrderStatus = 'pending' | 'approved' | 'rejected';

// طلب الدفع
export interface PaymentOrder {
  id: string;
  user_id: string;
  payment_method: PaymentMethod;
  payment_details: string;
  package_id: string;
  points_requested: number;
  points_approved: number | null;
  price_amount: number;
  price_currency: string;
  receipt_image_url: string | null;
  status: PaymentOrderStatus;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// بيانات إنشاء طلب دفع جديد
export interface CreatePaymentOrderData {
  payment_method: PaymentMethod;
  payment_details: string;
  package_id: string;
  points_requested: number;
  price_amount: number;
  price_currency: string;
  receipt_image_url?: string;
}

// إشعار الدفع
export interface PaymentNotification {
  id: string;
  user_id: string;
  order_id: string | null;
  type:
    | 'order_submitted'
    | 'order_approved'
    | 'order_rejected'
    | 'points_added';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// نتيجة عملية
export interface PaymentResult {
  success: boolean;
  error?: string;
  order?: PaymentOrder;
}

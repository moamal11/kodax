/**
 * بيانات حسابات الدفع - قم بتحديث هذه البيانات بمعلوماتك الحقيقية
 * Payment Account Configuration - Update with your real account details
 */

export interface PaymentAccountConfig {
  /** اسم صاحب الحساب */
  holderName: string;
  /** رقم الهاتف أو الحساب */
  phoneNumber?: string;
  /** رقم البطاقة (ماستركارد) */
  cardNumber?: string;
  /** رابط QR للدفع (اختياري) */
  qrImageUri?: string;
  /** وصف إضافي */
  description?: string;
}

/**
 * بيانات الحسابات - حدّث القيم أدناه بمعلوماتك الحقيقية
 * Account Details - Update the values below with your real info
 */
export const PAYMENT_ACCOUNTS: Record<string, PaymentAccountConfig> = {
  zain_cash: {
    holderName: ' مؤمل ناظم ', // ← حدّث هذا
    phoneNumber: '07748974754', // ← حدّث هذا
    // ضع مسار صورة QR هنا أو رابط URL
    // qrImageUri: require('../../assets/qr-zain-cash.png'),
    qrImageUri:
      'https://krtulodnhmfuoxjqajwl.supabase.co/storage/v1/object/public/avatars/IMG_5630.jpeg',
    description: 'قم بالتحويل إلى الرقم التالي عبر تطبيق زين كاش',
  },
  mastercard: {
    holderName: ' MUAMMAL N. OBAID ', // ← حدّث هذا
    cardNumber: '88829962759', // ← حدّث هذا برقم بطاقتك الحقيقي
    // ضع مسار صورة QR هنا أو رابط URL
    // qrImageUri: require('../../assets/qr-mastercard.png'),
    qrImageUri:
      'https://krtulodnhmfuoxjqajwl.supabase.co/storage/v1/object/public/avatars/IMG_5629.jpeg',
    description: 'قم بالدفع عبر مسح رمز QR التالي',
  },
  zain: {
    holderName: ' مؤمل ناظم ', // ← حدّث هذا
    phoneNumber: '07824190961', // ← حدّث هذا
    description: 'قم بتحويل الرصيد إلى الرقم التالي',
  },
  asiacell: {
    holderName: ' مؤمل ناظم ', // ← حدّث هذا
    phoneNumber: '07748974754', // ← حدّث هذا
    description: 'قم بتحويل الرصيد إلى الرقم التالي',
  },
};

/**
 * شاشة الدفع الذكي - Kodax Smart Payment Screen
 * واجهة شراء النقاط مع طرق الدفع المتعددة
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
  Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { POINTS_PACKAGES, type PointsPackage } from '@/services/pointsService';
import {
  PAYMENT_METHODS,
  type PaymentMethod,
  type PaymentMethodInfo,
} from '@/types/payment';
import { paymentService } from '@/services/paymentService';
import { usePoints } from '@/contexts/PointsContext';
import { useBadges } from '@/contexts/BadgeContext';
import { supabase } from '@/lib/supabase';
import { THEME_COLORS, BORDER_RADIUS, SHADOWS } from '@/styles/theme';
import { useResponsiveLayout } from '@/hooks';
import { PAYMENT_ACCOUNTS } from '@/config/paymentAccounts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type PaymentStep =
  | 'package'
  | 'method'
  | 'transfer'
  | 'info'
  | 'confirm'
  | 'success';

export default function PaymentScreen() {
  const { points, refreshPoints } = usePoints();
  const { checkBadges } = useBadges();
  const { isWeb, isLargeScreen } = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<PaymentStep>('package');
  const [selectedPackage, setSelectedPackage] = useState<PointsPackage | null>(
    null
  );
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodInfo | null>(null);
  const [senderName, setSenderName] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [validationError, setValidationError] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [senderPhone, setSenderPhone] = useState('');
  const [balancePaymentType, setBalancePaymentType] = useState<
    'phone_transfer' | 'balance_card'
  >('phone_transfer');
  const [balanceCardNumber, setBalanceCardNumber] = useState('');
  const [isPurchaseBlocked, setIsPurchaseBlocked] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        // ===== التحقق من حظر الشراء =====
        try {
          const { data: restrictions } = await supabase.rpc(
            'check_user_restrictions',
            { p_user_id: data.user.id }
          );
          if (restrictions?.is_purchase_blocked) {
            setIsPurchaseBlocked(true);
          }
        } catch {
          // silent
        }
      }
    };
    getUser();
  }, []);

  // نسخ النص إلى الحافظة
  const copyToClipboard = (text: string, field: string) => {
    try {
      Clipboard.setString(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {
      // Copy failed
    }
  };

  // اختيار صورة التحويل
  const pickReceiptImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'تنبيه',
          'يجب السماح بالوصول إلى المعرض لاختيار صورة التحويل'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      // Error picking image
    }
  };

  // التقاط صورة بالكاميرا
  const takeReceiptPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('تنبيه', 'يجب السماح بالوصول إلى الكاميرا');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      // Error taking photo
    }
  };

  /**
   * التحقق من صحة بيانات الدفع (أرقام عراقية + ماستركارد)
   * آسياسيل: 077X (0770-0774)
   * زين:     078X/079X (0780-0784, 0790-0794)
   * زين كاش: نفس أرقام زين
   * ماستركارد: 16 رقم تبدأ بـ 5
   */
  const validatePaymentDetails = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!selectedMethod) return '';

    if (selectedMethod.inputType === 'phone') {
      if (digits.length === 0) return '';
      if (digits.length !== 11) return 'يجب أن يكون الرقم 11 خانة';
      if (!digits.startsWith('07')) return 'يجب أن يبدأ الرقم بـ 07';

      if (selectedMethod.id === 'asiacell') {
        const prefix = digits.substring(0, 4);
        const validPrefixes = ['0770', '0771', '0772', '0773', '0774'];
        if (!validPrefixes.includes(prefix)) {
          return 'رقم آسياسيل يجب أن يبدأ بـ 0770-0774';
        }
      } else if (
        selectedMethod.id === 'zain' ||
        selectedMethod.id === 'zain_cash'
      ) {
        const prefix = digits.substring(0, 4);
        const validPrefixes = [
          '0780',
          '0781',
          '0782',
          '0783',
          '0784',
          '0790',
          '0791',
          '0792',
          '0793',
          '0794',
        ];
        if (!validPrefixes.includes(prefix)) {
          return `رقم ${selectedMethod.nameAr} يجب أن يبدأ بـ 078X أو 079X`;
        }
      }
    } else if (selectedMethod.inputType === 'card') {
      if (digits.length === 0) return '';
      if (digits.length !== 16) return 'يجب أن يكون رقم البطاقة 16 خانة';
      if (!digits.startsWith('5'))
        return 'بطاقة ماستركارد يجب أن تبدأ بالرقم 5';
    }
    return '';
  };

  const handlePaymentDetailsChange = (text: string) => {
    setPaymentDetails(text);
    const err = validatePaymentDetails(text);
    setValidationError(err);
  };

  const isPaymentValid =
    paymentDetails.trim().length > 0 &&
    !validatePaymentDetails(paymentDetails.trim());

  // إرسال طلب الدفع
  const submitPaymentOrder = async () => {
    const isBalanceTransfer =
      selectedMethod?.id === 'zain' || selectedMethod?.id === 'asiacell';

    // التحقق من البيانات المطلوبة
    const needsName =
      selectedMethod?.id === 'zain_cash' || selectedMethod?.id === 'mastercard';
    if (!selectedPackage || !selectedMethod || !userId) {
      Alert.alert('خطأ', 'يرجى إكمال جميع البيانات المطلوبة');
      return;
    }
    if (needsName && !senderName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الاسم');
      return;
    }

    // تحديد تفاصيل الدفع مع اسم المحوِّل
    const accountConfig = PAYMENT_ACCOUNTS[selectedMethod.id];
    let autoDetails = '';

    if (selectedMethod.id === 'zain_cash') {
      autoDetails = `زين كاش - ${accountConfig?.phoneNumber || 'غير محدد'} | المحوِّل: ${senderName.trim()} | الرقم: ${senderPhone}`;
    } else if (selectedMethod.id === 'mastercard') {
      autoDetails = `ماستركارد / سوبر كي - ${accountConfig?.holderName || 'غير محدد'} | المحوِّل: ${senderName.trim()}`;
    } else if (isBalanceTransfer) {
      if (balancePaymentType === 'balance_card') {
        autoDetails = `بطاقة رصيد ${selectedMethod.nameAr} - رقم البطاقة: ${balanceCardNumber.trim()}`;
      } else {
        autoDetails = `تحويل رصيد ${selectedMethod.nameAr} - ${accountConfig?.phoneNumber || 'غير محدد'} | الرقم: ${senderPhone}`;
      }
    } else {
      autoDetails = `${selectedMethod.nameAr} - ${accountConfig?.phoneNumber || accountConfig?.holderName || 'غير محدد'}`;
    }

    setLoading(true);

    try {
      // رفع صورة التحويل إن وجدت
      let receiptUrl: string | undefined;
      if (receiptImage) {
        const uploadResult = await paymentService.uploadReceiptImage(
          userId,
          receiptImage
        );
        if (uploadResult.success) {
          receiptUrl = uploadResult.url;
        }
      }

      const totalPoints = selectedPackage.points + selectedPackage.bonus;

      // إنشاء طلب الدفع
      const result = await paymentService.createPaymentOrder(userId, {
        payment_method: selectedMethod.id,
        payment_details: autoDetails,
        package_id: selectedPackage.id,
        points_requested: totalPoints,
        price_amount: selectedPackage.price,
        price_currency: selectedPackage.currency,
        receipt_image_url: receiptUrl,
      });

      if (result.success) {
        setStep('success');
        // فحص شارات الاقتصاد بعد الشراء
        try {
          await checkBadges({ hasPurchased: true });
        } catch {}
      } else {
        Alert.alert('خطأ', result.error || 'فشل في إرسال الطلب');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ar-IQ') + ' د.ع';
  };

  const goBack = () => {
    switch (step) {
      case 'method':
        setStep('package');
        break;
      case 'info':
        setStep('method');
        break;
      case 'transfer':
        setStep('info');
        break;
      case 'confirm':
        setStep('transfer');
        break;
      default:
        router.back();
    }
  };

  // ============= RENDER STEPS =============

  // الخطوة 1: اختيار الباقة
  const renderPackageStep = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>اختر باقة النقاط</Text>
      <Text style={styles.stepSubtitle}>اختر الباقة المناسبة لك</Text>

      <View style={styles.currentBalanceCard}>
        <Ionicons name="diamond" size={24} color="#a78bfa" />
        <View>
          <Text style={styles.balanceLabel}>رصيدك الحالي</Text>
          <Text style={styles.balanceValue}>
            {points.toLocaleString('ar-IQ')} نقطة
          </Text>
        </View>
      </View>

      {POINTS_PACKAGES.map((pkg, index) => (
        <Animated.View
          key={pkg.id}
          entering={FadeInDown.delay(index * 80).duration(300)}
        >
          <TouchableOpacity
            style={[
              styles.packageCard,
              selectedPackage?.id === pkg.id && styles.packageCardSelected,
              pkg.popular && styles.packageCardPopular,
            ]}
            onPress={() => setSelectedPackage(pkg)}
            activeOpacity={0.8}
          >
            {pkg.popular && (
              <View style={styles.popularBadge}>
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={styles.popularText}>الأفضل قيمة</Text>
              </View>
            )}

            <View style={styles.packageRow}>
              <View style={styles.packageLeft}>
                <View style={styles.packagePointsRow}>
                  <Ionicons
                    name="diamond"
                    size={22}
                    color={selectedPackage?.id === pkg.id ? '#fff' : '#a78bfa'}
                  />
                  <Text
                    style={[
                      styles.packagePoints,
                      selectedPackage?.id === pkg.id && { color: '#fff' },
                    ]}
                  >
                    {(pkg.points + pkg.bonus).toLocaleString('ar-IQ')}
                  </Text>
                </View>
                {pkg.bonus > 0 && (
                  <View style={styles.bonusBadge}>
                    <Ionicons name="gift" size={12} color="#10b981" />
                    <Text style={styles.bonusText}>+{pkg.bonus} مكافأة</Text>
                  </View>
                )}
              </View>

              <View style={styles.packageRight}>
                <Text
                  style={[
                    styles.packagePrice,
                    selectedPackage?.id === pkg.id && { color: '#fff' },
                  ]}
                >
                  {formatPrice(pkg.price)}
                </Text>
                {pkg.savings && (
                  <Text style={styles.savingsText}>وفر {pkg.savings}</Text>
                )}
              </View>

              {selectedPackage?.id === pkg.id && (
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}

      <TouchableOpacity
        style={[styles.nextButton, !selectedPackage && styles.buttonDisabled]}
        onPress={() => selectedPackage && setStep('method')}
        disabled={!selectedPackage}
      >
        <LinearGradient
          colors={
            selectedPackage ? ['#6366f1', '#8b5cf6'] : ['#3f3f46', '#27272a']
          }
          style={styles.nextButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.nextButtonText}>التالي</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  // الخطوة 2: اختيار طريقة الدفع
  const renderMethodStep = () => (
    <Animated.View
      entering={SlideInRight.duration(300)}
      style={styles.stepContainer}
    >
      <Text style={styles.stepTitle}>اختر طريقة الدفع</Text>
      <Text style={styles.stepSubtitle}>اختر الطريقة المفضلة لديك</Text>

      {PAYMENT_METHODS.map((method, index) => (
        <Animated.View
          key={method.id}
          entering={FadeInDown.delay(index * 80).duration(300)}
        >
          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod?.id === method.id && styles.methodCardSelected,
            ]}
            onPress={() => {
              setSelectedMethod(method);
              setStep('info');
            }}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.methodIcon,
                { backgroundColor: method.color + '20' },
              ]}
            >
              <Ionicons
                name={method.icon as any}
                size={28}
                color={method.color}
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.nameAr}</Text>
              <Text style={styles.methodDesc}>{method.description}</Text>
            </View>
            {selectedMethod?.id === method.id && (
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}
    </Animated.View>
  );

  // الخطوة 4: إدخال بيانات المحوِّل + صورة التحويل
  const renderTransferStep = () => {
    const isBalanceTransfer =
      selectedMethod?.id === 'zain' || selectedMethod?.id === 'asiacell';
    const isZainCash = selectedMethod?.id === 'zain_cash';
    const isMasterCard = selectedMethod?.id === 'mastercard';

    // زين وآسياسيل: رقم الهاتف فقط (إذا اختار تحويل للرقم)
    // زين كاش: الاسم + رقم الهاتف
    // ماستركارد: الاسم فقط
    const requiresName = isZainCash || isMasterCard;
    const requiresPhone =
      (isBalanceTransfer && balancePaymentType === 'phone_transfer') ||
      isZainCash;

    // التحقق من صحة رقم الهاتف العراقي
    const isPhoneValid = () => {
      const digits = senderPhone.replace(/\D/g, '');
      if (digits.length !== 11) return false;
      if (!digits.startsWith('07')) return false;

      if (selectedMethod?.id === 'asiacell') {
        const prefix = digits.substring(0, 4);
        return ['0770', '0771', '0772', '0773', '0774'].includes(prefix);
      }
      if (selectedMethod?.id === 'zain' || selectedMethod?.id === 'zain_cash') {
        const prefix = digits.substring(0, 4);
        return [
          '0780',
          '0781',
          '0782',
          '0783',
          '0784',
          '0790',
          '0791',
          '0792',
          '0793',
          '0794',
        ].includes(prefix);
      }
      return true;
    };

    // التحقق من جاهزية النموذج
    const isFormValid = () => {
      if (requiresName && !senderName.trim()) return false;
      if (requiresPhone && !isPhoneValid()) return false;
      return true;
    };

    return (
      <Animated.View
        entering={SlideInRight.duration(300)}
        style={styles.stepContainer}
      >
        <Text style={styles.stepTitle}>بيانات التحويل</Text>
        <Text style={styles.stepSubtitle}>
          أدخل بياناتك لإتمام عملية الشراء
        </Text>

        {/* ملخص الباقة المختارة */}
        <View style={styles.selectedPackageSummary}>
          <View style={styles.summaryValueRow}>
            <Ionicons name="diamond" size={18} color="#a78bfa" />
            <Text style={styles.summaryPackageText}>
              {selectedPackage
                ? (
                    selectedPackage.points + selectedPackage.bonus
                  ).toLocaleString('ar-IQ')
                : 0}{' '}
              نقطة
            </Text>
          </View>
          <Text style={styles.summaryPriceText}>
            {formatPrice(selectedPackage?.price || 0)}
          </Text>
        </View>

        {/* حقل اسم المحوِّل - يظهر فقط لزين كاش */}
        {requiresName && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>اسم الشخص الذي قام بالتحويل *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person" size={20} color="#a78bfa" />
              <TextInput
                style={[
                  styles.textInput,
                  Platform.OS === 'web' && ({ outline: 'none' } as any),
                ]}
                placeholder="أدخل اسمك الكامل"
                placeholderTextColor="#6b7280"
                value={senderName}
                onChangeText={setSenderName}
                textAlign="right"
              />
            </View>
          </View>
        )}

        {/* حقل رقم الهاتف - يظهر لزين وآسياسيل وزين كاش */}
        {requiresPhone && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              رقم الهاتف الذي تم التحويل منه *
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call" size={20} color="#a78bfa" />
              <TextInput
                style={[
                  styles.textInput,
                  Platform.OS === 'web' && ({ outline: 'none' } as any),
                ]}
                placeholder={
                  selectedMethod?.id === 'asiacell'
                    ? '07700000000'
                    : '07800000000'
                }
                placeholderTextColor="#6b7280"
                value={senderPhone}
                onChangeText={setSenderPhone}
                textAlign="right"
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
            {senderPhone.length > 0 && !isPhoneValid() && (
              <Text style={styles.inputError}>
                {selectedMethod?.id === 'asiacell'
                  ? 'رقم آسياسيل يجب أن يبدأ بـ 0770-0774'
                  : 'رقم زين يجب أن يبدأ بـ 078X أو 079X'}
              </Text>
            )}
          </View>
        )}

        {/* صورة التحويل (اختياري) */}
        <View style={styles.receiptSection}>
          <Text style={styles.inputLabel}>صورة التحويل (اختياري)</Text>
          <Text style={styles.receiptHint}>
            أرفق صورة التحويل لتسريع عملية المراجعة
          </Text>

          {receiptImage ? (
            <View style={styles.receiptPreview}>
              <Image
                source={{ uri: receiptImage }}
                style={styles.receiptImage}
              />
              <TouchableOpacity
                style={styles.removeReceiptBtn}
                onPress={() => setReceiptImage(null)}
              >
                <Ionicons name="close-circle" size={28} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.receiptButtons}>
              <TouchableOpacity
                style={styles.receiptBtn}
                onPress={pickReceiptImage}
              >
                <Ionicons name="image" size={24} color="#a78bfa" />
                <Text style={styles.receiptBtnText}>من المعرض</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.receiptBtn}
                onPress={takeReceiptPhoto}
              >
                <Ionicons name="camera" size={24} color="#a78bfa" />
                <Text style={styles.receiptBtnText}>التقاط صورة</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* زر المتابعة */}
        <TouchableOpacity
          style={[styles.nextButton, !isFormValid() && styles.buttonDisabled]}
          onPress={() => isFormValid() && setStep('confirm')}
          disabled={!isFormValid()}
        >
          <LinearGradient
            colors={
              isFormValid() ? ['#6366f1', '#8b5cf6'] : ['#3f3f46', '#27272a']
            }
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>التالي</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // الخطوة 3: عرض معلومات التحويل (عرض فقط - بدون إدخال)
  const renderInfoStep = () => {
    const accountConfig = selectedMethod
      ? PAYMENT_ACCOUNTS[selectedMethod.id]
      : null;
    const isBalanceTransfer =
      selectedMethod?.id === 'zain' || selectedMethod?.id === 'asiacell';
    const isZainCash = selectedMethod?.id === 'zain_cash';
    const isMasterCard = selectedMethod?.id === 'mastercard';

    // التحقق من جاهزية النموذج لخطوة المعلومات
    const isInfoStepValid = () => {
      if (isBalanceTransfer && balancePaymentType === 'balance_card') {
        // يجب إدخال رقم بطاقة الرصيد
        return balanceCardNumber.trim().length >= 10;
      }
      return true;
    };

    return (
      <Animated.View
        entering={SlideInRight.duration(300)}
        style={styles.stepContainer}
      >
        <Text style={styles.stepTitle}>معلومات التحويل</Text>
        <Text style={styles.stepSubtitle}>قم بالتحويل إلى الحساب التالي</Text>

        {/* ملخص الباقة المختارة */}
        <View style={styles.selectedPackageSummary}>
          <View style={styles.summaryValueRow}>
            <Ionicons name="diamond" size={18} color="#a78bfa" />
            <Text style={styles.summaryPackageText}>
              {selectedPackage
                ? (
                    selectedPackage.points + selectedPackage.bonus
                  ).toLocaleString('ar-IQ')
                : 0}{' '}
              نقطة
            </Text>
          </View>
          <Text style={styles.summaryPriceText}>
            {formatPrice(selectedPackage?.price || 0)}
          </Text>
        </View>

        {/* ===== ماستركارد: الاسم + رقم البطاقة + QR ===== */}
        {isMasterCard && (
          <View style={styles.transferInfoCard}>
            <View
              style={[
                styles.transferMethodBadge,
                {
                  backgroundColor: (selectedMethod?.color || '#6366f1') + '20',
                },
              ]}
            >
              <Ionicons
                name={(selectedMethod?.icon as any) || 'wallet'}
                size={28}
                color={selectedMethod?.color || '#6366f1'}
              />
              <Text
                style={[
                  styles.transferMethodName,
                  { color: selectedMethod?.color },
                ]}
              >
                {selectedMethod?.nameAr}
              </Text>
            </View>

            {/* اسم صاحب الحساب */}
            {accountConfig?.holderName && (
              <View style={styles.transferInfoRow}>
                <Text style={styles.transferInfoLabel}>اسم صاحب الحساب</Text>
                <TouchableOpacity
                  style={styles.transferInfoValueRow}
                  onPress={() =>
                    copyToClipboard(accountConfig.holderName, 'name')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.transferInfoValue}>
                    {accountConfig.holderName}
                  </Text>
                  <Ionicons
                    name={
                      copiedField === 'name'
                        ? 'checkmark-circle'
                        : 'copy-outline'
                    }
                    size={18}
                    color={copiedField === 'name' ? '#10b981' : '#a78bfa'}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* رقم البطاقة */}
            {accountConfig?.cardNumber && (
              <View style={styles.transferInfoRow}>
                <Text style={styles.transferInfoLabel}>رقم البطاقة</Text>
                <TouchableOpacity
                  style={styles.transferInfoValueRow}
                  onPress={() =>
                    copyToClipboard(accountConfig.cardNumber!, 'card')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.transferInfoValueLarge}>
                    {accountConfig.cardNumber}
                  </Text>
                  <Ionicons
                    name={
                      copiedField === 'card'
                        ? 'checkmark-circle'
                        : 'copy-outline'
                    }
                    size={20}
                    color={copiedField === 'card' ? '#10b981' : '#a78bfa'}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* رمز QR للدفع */}
            <View style={styles.qrSection}>
              <Text style={styles.transferInfoLabel}>رمز QR للدفع</Text>
              {accountConfig?.qrImageUri ? (
                <View style={styles.qrImageContainer}>
                  <Image
                    source={
                      typeof accountConfig.qrImageUri === 'string'
                        ? { uri: accountConfig.qrImageUri }
                        : accountConfig.qrImageUri
                    }
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={styles.qrPlaceholder}>
                  <Ionicons name="qr-code-outline" size={60} color="#4b5563" />
                  <Text style={styles.qrPlaceholderText}>
                    سيتم إضافة رمز QR قريباً
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ===== زين كاش: الاسم + الرقم + QR ===== */}
        {isZainCash && (
          <View style={styles.transferInfoCard}>
            <View
              style={[
                styles.transferMethodBadge,
                {
                  backgroundColor: (selectedMethod?.color || '#6366f1') + '20',
                },
              ]}
            >
              <Ionicons
                name={(selectedMethod?.icon as any) || 'wallet'}
                size={28}
                color={selectedMethod?.color || '#6366f1'}
              />
              <Text
                style={[
                  styles.transferMethodName,
                  { color: selectedMethod?.color },
                ]}
              >
                {selectedMethod?.nameAr}
              </Text>
            </View>

            {/* اسم صاحب الحساب */}
            {accountConfig?.holderName && (
              <View style={styles.transferInfoRow}>
                <Text style={styles.transferInfoLabel}>اسم صاحب الحساب</Text>
                <TouchableOpacity
                  style={styles.transferInfoValueRow}
                  onPress={() =>
                    copyToClipboard(accountConfig.holderName, 'name')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.transferInfoValue}>
                    {accountConfig.holderName}
                  </Text>
                  <Ionicons
                    name={
                      copiedField === 'name'
                        ? 'checkmark-circle'
                        : 'copy-outline'
                    }
                    size={18}
                    color={copiedField === 'name' ? '#10b981' : '#a78bfa'}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* رقم زين كاش */}
            {accountConfig?.phoneNumber && (
              <View style={styles.transferInfoRow}>
                <Text style={styles.transferInfoLabel}>رقم زين كاش</Text>
                <TouchableOpacity
                  style={styles.transferInfoValueRow}
                  onPress={() =>
                    copyToClipboard(accountConfig.phoneNumber!, 'phone')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.transferInfoValueLarge}>
                    {accountConfig.phoneNumber}
                  </Text>
                  <Ionicons
                    name={
                      copiedField === 'phone'
                        ? 'checkmark-circle'
                        : 'copy-outline'
                    }
                    size={20}
                    color={copiedField === 'phone' ? '#10b981' : '#a78bfa'}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* رمز QR للدفع */}
            <View style={styles.qrSection}>
              <Text style={styles.transferInfoLabel}>رمز QR للدفع</Text>
              {accountConfig?.qrImageUri ? (
                <View style={styles.qrImageContainer}>
                  <Image
                    source={
                      typeof accountConfig.qrImageUri === 'string'
                        ? { uri: accountConfig.qrImageUri }
                        : accountConfig.qrImageUri
                    }
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={styles.qrPlaceholder}>
                  <Ionicons name="qr-code-outline" size={60} color="#4b5563" />
                  <Text style={styles.qrPlaceholderText}>
                    سيتم إضافة رمز QR قريباً
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ===== رصيد (زين / آسياسيل): خيارين منفصلين ===== */}
        {isBalanceTransfer && (
          <View style={styles.transferInfoCard}>
            <View
              style={[
                styles.transferMethodBadge,
                {
                  backgroundColor: (selectedMethod?.color || '#6366f1') + '20',
                },
              ]}
            >
              <Ionicons
                name={(selectedMethod?.icon as any) || 'wallet'}
                size={28}
                color={selectedMethod?.color || '#6366f1'}
              />
              <Text
                style={[
                  styles.transferMethodName,
                  { color: selectedMethod?.color },
                ]}
              >
                {selectedMethod?.nameAr}
              </Text>
            </View>

            <Text
              style={[
                styles.transferInfoLabel,
                { marginBottom: 12, marginTop: 8, fontSize: 15 },
              ]}
            >
              اختر طريقة الدفع بالرصيد
            </Text>

            {/* الخيار الأول: التحويل إلى رقم الهاتف */}
            <TouchableOpacity
              style={[
                styles.balanceOptionCard,
                balancePaymentType === 'phone_transfer' &&
                  styles.balanceOptionCardSelected,
              ]}
              onPress={() => setBalancePaymentType('phone_transfer')}
              activeOpacity={0.8}
            >
              <View style={styles.balanceOptionHeader}>
                <View
                  style={[
                    styles.radioButton,
                    balancePaymentType === 'phone_transfer' &&
                      styles.radioButtonSelected,
                  ]}
                >
                  {balancePaymentType === 'phone_transfer' && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.balanceOptionTitle,
                      balancePaymentType === 'phone_transfer' &&
                        styles.balanceOptionTitleSelected,
                    ]}
                  >
                    تحويل إلى رقم الهاتف
                  </Text>
                  <Text style={styles.balanceOptionDesc}>
                    قم بتحويل الرصيد إلى الرقم التالي
                  </Text>
                </View>
                <Ionicons
                  name="call"
                  size={24}
                  color={
                    balancePaymentType === 'phone_transfer'
                      ? '#a78bfa'
                      : '#6b7280'
                  }
                />
              </View>

              {/* معلومات الرقم تظهر فقط عند اختيار هذا الخيار */}
              {balancePaymentType === 'phone_transfer' &&
                accountConfig?.phoneNumber && (
                  <View style={styles.balanceOptionContent}>
                    <View style={styles.transferInfoRow}>
                      <Text style={styles.transferInfoLabel}>
                        اسم صاحب الحساب
                      </Text>
                      <TouchableOpacity
                        style={styles.transferInfoValueRow}
                        onPress={() =>
                          copyToClipboard(accountConfig.holderName, 'name')
                        }
                        activeOpacity={0.7}
                      >
                        <Text style={styles.transferInfoValue}>
                          {accountConfig.holderName}
                        </Text>
                        <Ionicons
                          name={
                            copiedField === 'name'
                              ? 'checkmark-circle'
                              : 'copy-outline'
                          }
                          size={18}
                          color={copiedField === 'name' ? '#10b981' : '#a78bfa'}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.transferInfoRow}>
                      <Text style={styles.transferInfoLabel}>رقم التحويل</Text>
                      <TouchableOpacity
                        style={styles.transferInfoValueRow}
                        onPress={() =>
                          copyToClipboard(accountConfig.phoneNumber!, 'phone')
                        }
                        activeOpacity={0.7}
                      >
                        <Text style={styles.transferInfoValueLarge}>
                          {accountConfig.phoneNumber}
                        </Text>
                        <Ionicons
                          name={
                            copiedField === 'phone'
                              ? 'checkmark-circle'
                              : 'copy-outline'
                          }
                          size={20}
                          color={
                            copiedField === 'phone' ? '#10b981' : '#a78bfa'
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
            </TouchableOpacity>

            {/* الخيار الثاني: إدخال رقم بطاقة الرصيد */}
            <TouchableOpacity
              style={[
                styles.balanceOptionCard,
                balancePaymentType === 'balance_card' &&
                  styles.balanceOptionCardSelected,
                { marginTop: 12 },
              ]}
              onPress={() => setBalancePaymentType('balance_card')}
              activeOpacity={0.8}
            >
              <View style={styles.balanceOptionHeader}>
                <View
                  style={[
                    styles.radioButton,
                    balancePaymentType === 'balance_card' &&
                      styles.radioButtonSelected,
                  ]}
                >
                  {balancePaymentType === 'balance_card' && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.balanceOptionTitle,
                      balancePaymentType === 'balance_card' &&
                        styles.balanceOptionTitleSelected,
                    ]}
                  >
                    إدخال رقم بطاقة الرصيد
                  </Text>
                  <Text style={styles.balanceOptionDesc}>
                    أدخل رقم بطاقة الشحن
                  </Text>
                </View>
                <Ionicons
                  name="card"
                  size={24}
                  color={
                    balancePaymentType === 'balance_card'
                      ? '#a78bfa'
                      : '#6b7280'
                  }
                />
              </View>

              {/* حقل إدخال رقم البطاقة يظهر فقط عند اختيار هذا الخيار */}
              {balancePaymentType === 'balance_card' && (
                <View style={styles.balanceOptionContent}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="card-outline" size={20} color="#a78bfa" />
                    <TextInput
                      style={[
                        styles.textInput,
                        Platform.OS === 'web' && ({ outline: 'none' } as any),
                      ]}
                      placeholder="أدخل رقم بطاقة الرصيد"
                      placeholderTextColor="#6b7280"
                      value={balanceCardNumber}
                      onChangeText={setBalanceCardNumber}
                      textAlign="right"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* تعليمات التحويل */}
        <View style={styles.transferInstructions}>
          <Ionicons name="information-circle" size={22} color="#60a5fa" />
          <Text style={styles.transferInstructionsText}>
            {isBalanceTransfer
              ? balancePaymentType === 'phone_transfer'
                ? `قم بتحويل مبلغ ${formatPrice(selectedPackage?.price || 0)} إلى الرقم أعلاه ثم اضغط المتابعة.`
                : `أدخل رقم بطاقة الرصيد (بطاقة الشحن) ثم اضغط المتابعة.`
              : isZainCash
                ? `قم بالتحويل عبر تطبيق زين كاش إلى الرقم أعلاه أو امسح رمز QR ثم اضغط المتابعة.`
                : `قم بالدفع عبر مسح رمز QR أعلاه أو إرسال المبلغ إلى رقم البطاقة ثم اضغط المتابعة.`}
          </Text>
        </View>

        {/* زر المتابعة لإدخال البيانات */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            !isInfoStepValid() && styles.buttonDisabled,
          ]}
          onPress={() => isInfoStepValid() && setStep('transfer')}
          disabled={!isInfoStepValid()}
        >
          <LinearGradient
            colors={
              isInfoStepValid()
                ? ['#6366f1', '#8b5cf6']
                : ['#3f3f46', '#27272a']
            }
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>إدخال بيانات التحويل</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // الخطوة 5: التأكيد النهائي
  const renderConfirmStep = () => {
    const totalPoints = selectedPackage
      ? selectedPackage.points + selectedPackage.bonus
      : 0;

    const isBalanceTransfer =
      selectedMethod?.id === 'zain' || selectedMethod?.id === 'asiacell';
    const isZainCash = selectedMethod?.id === 'zain_cash';
    const showName = isZainCash || selectedMethod?.id === 'mastercard';
    const showPhone = isBalanceTransfer || isZainCash;

    return (
      <Animated.View
        entering={SlideInRight.duration(300)}
        style={styles.stepContainer}
      >
        <Text style={styles.stepTitle}>مراجعة الطلب</Text>
        <Text style={styles.stepSubtitle}>
          تأكد من صحة البيانات قبل إرسال الطلب
        </Text>

        {/* ملخص الطلب */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>الباقة</Text>
            <View style={styles.summaryValueRow}>
              <Ionicons name="diamond" size={18} color="#a78bfa" />
              <Text style={styles.summaryValue}>
                {totalPoints.toLocaleString('ar-IQ')} نقطة
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>المبلغ</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(selectedPackage?.price || 0)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>طريقة الدفع</Text>
            <View style={styles.summaryValueRow}>
              <Ionicons
                name={(selectedMethod?.icon as any) || 'card'}
                size={18}
                color={selectedMethod?.color}
              />
              <Text style={styles.summaryValue}>{selectedMethod?.nameAr}</Text>
            </View>
          </View>

          {/* اسم المحوِّل - يظهر فقط لزين كاش وماستركارد */}
          {showName && senderName && (
            <>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>اسم المحوِّل</Text>
                <Text style={styles.summaryValue}>{senderName}</Text>
              </View>
            </>
          )}

          {/* رقم الهاتف - يظهر لزين وآسياسيل وزين كاش */}
          {showPhone && senderPhone && (
            <>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>رقم المحوِّل</Text>
                <Text style={styles.summaryValue}>{senderPhone}</Text>
              </View>
            </>
          )}

          {receiptImage && (
            <>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>صورة التحويل</Text>
                <View style={styles.summaryValueRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                  <Text style={[styles.summaryValue, { color: '#10b981' }]}>
                    مرفقة
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* تنبيه المعالجة */}
        <View style={styles.processingNotice}>
          <Ionicons name="time" size={24} color="#f59e0b" />
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>مدة المعالجة</Text>
            <Text style={styles.noticeText}>
              سيتم مراجعة طلبك خلال 1 إلى 2 ساعة. ستتلقى إشعاراً عند الموافقة
              على طلبك وإضافة النقاط إلى رصيدك.
            </Text>
          </View>
        </View>

        {/* زر تأكيد وإرسال */}
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.buttonDisabled]}
          onPress={submitPaymentOrder}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#3f3f46', '#27272a'] : ['#10b981', '#059669']}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color="#fff" />
                <Text style={styles.nextButtonText}>تأكيد وإرسال الطلب</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // الخطوة 5: تم بنجاح
  const renderSuccessStep = () => {
    const isBalanceTransfer =
      selectedMethod?.id === 'zain' || selectedMethod?.id === 'asiacell';
    const isZainCash = selectedMethod?.id === 'zain_cash';
    const displayInfo = isZainCash
      ? `${senderName} • ${senderPhone}`
      : isBalanceTransfer
        ? senderPhone
        : senderName;

    return (
      <Animated.View
        entering={FadeIn.duration(500)}
        style={styles.successContainer}
      >
        <View style={styles.successIconWrapper}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.successIconBg}
          >
            <Ionicons name="checkmark" size={64} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.successTitle}>تم إرسال طلبك بنجاح!</Text>
        <Text style={styles.successMessage}>
          سيتم مراجعة طلبك خلال 1-2 ساعة.{'\n'}
          ستتلقى إشعاراً عند الموافقة وإضافة النقاط.
        </Text>

        <View style={styles.successDetails}>
          <View style={styles.successDetailRow}>
            <Ionicons name="diamond" size={20} color="#a78bfa" />
            <Text style={styles.successDetailText}>
              {selectedPackage
                ? (
                    selectedPackage.points + selectedPackage.bonus
                  ).toLocaleString('ar-IQ')
                : 0}{' '}
              نقطة
            </Text>
          </View>
          <View style={styles.successDetailRow}>
            <Ionicons
              name={(selectedMethod?.icon as any) || 'card'}
              size={20}
              color={selectedMethod?.color}
            />
            <Text style={styles.successDetailText}>
              {selectedMethod?.nameAr} • {displayInfo}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => router.back()}
        >
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>العودة للرئيسية</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewOrdersBtn}
          onPress={() => router.push('/payment/orders' as any)}
        >
          <Text style={styles.viewOrdersText}>عرض طلباتي</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // شريط التقدم
  const renderProgressBar = () => {
    const steps: PaymentStep[] = [
      'package',
      'method',
      'info',
      'transfer',
      'confirm',
    ];
    const currentIndex = steps.indexOf(step);

    if (step === 'success') return null;

    return (
      <View style={styles.progressBar}>
        {steps.map((s, i) => (
          <View key={s} style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                i <= currentIndex && styles.progressDotActive,
                i < currentIndex && styles.progressDotDone,
              ]}
            >
              {i < currentIndex ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.progressDotText,
                    i <= currentIndex && { color: '#fff' },
                  ]}
                >
                  {i + 1}
                </Text>
              )}
            </View>
            {i < steps.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  i < currentIndex && styles.progressLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  // ===== شاشة حظر الشراء =====
  if (isPurchaseBlocked) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
          style={styles.background}
        >
          <View
            style={[
              styles.header,
              { paddingTop: Math.max(44, insets.top + 10) },
            ]}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>شراء النقاط</Text>
            <View style={{ width: 40 }} />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 32,
            }}
          >
            <Ionicons name="ban" size={64} color="#ef4444" />
            <Text
              style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: '700',
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              عمليات الشراء مقيّدة
            </Text>
            <Text
              style={{
                color: '#9ca3af',
                fontSize: 14,
                marginTop: 8,
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              تم تقييد عمليات الشراء على حسابك.{'\n'}يرجى التواصل مع الإدارة
              للمزيد من المعلومات.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: '#7c3aed',
                paddingHorizontal: 32,
                paddingVertical: 12,
                borderRadius: 12,
                marginTop: 24,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                رجوع
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <LinearGradient
        colors={['#0f0f1e', '#1a1a3e', '#0f0f1e']}
        style={styles.background}
      >
        {/* Header */}
        <View
          style={[styles.header, { paddingTop: Math.max(44, insets.top + 10) }]}
        >
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'success' ? 'تم بنجاح' : 'شراء النقاط'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {renderProgressBar()}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(40, insets.bottom + 20) },
              isWeb &&
                isLargeScreen && {
                  maxWidth: 900,
                  alignSelf: 'center',
                  width: '100%',
                  paddingHorizontal: 60,
                },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {step === 'package' && renderPackageStep()}
            {step === 'method' && renderMethodStep()}
            {step === 'transfer' && renderTransferStep()}
            {step === 'info' && renderInfoStep()}
            {step === 'confirm' && renderConfirmStep()}
            {step === 'success' && renderSuccessStep()}
          </ScrollView>
        </KeyboardAvoidingView>
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
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  progressDotActive: {
    backgroundColor: '#6366f1',
    borderColor: '#8b5cf6',
  },
  progressDotDone: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  progressDotText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: '#10b981',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  stepContainer: {
    gap: 12,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'right',
    marginBottom: 12,
  },
  currentBalanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#a78bfa',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a78bfa',
  },
  // Package Cards
  packageCard: {
    backgroundColor: 'rgba(30, 30, 50, 0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  packageCardSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  packageCardPopular: {
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  packageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packageLeft: {
    gap: 4,
  },
  packagePointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  packagePoints: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bonusText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  packageRight: {
    alignItems: 'flex-end',
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d1d5db',
  },
  savingsText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  // Method Cards
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 50, 0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 14,
  },
  methodCardSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  methodIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
  },
  methodDesc: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 2,
  },
  // Input
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 50, 0.8)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  inputError: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'right',
    marginTop: 4,
  },
  // Transfer Info
  selectedPackageSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryPackageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a78bfa',
  },
  summaryPriceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f59e0b',
  },
  transferInfoCard: {
    backgroundColor: 'rgba(30, 30, 50, 0.9)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    gap: 16,
  },
  transferMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  transferMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transferInfoRow: {
    gap: 6,
  },
  transferInfoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
  },
  transferInfoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  transferInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    textAlign: 'right',
  },
  transferInfoValueLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  qrSection: {
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  qrImageContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 25,
    overflow: 'hidden',
    maxHeight: 200,
    maxWidth: 200,
  },
  qrImage: {
    width: 150,
    height: 150,
    transform: [{ scale: 1.15 }],
    borderRadius: 14,
  },
  qrPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  qrPlaceholderText: {
    fontSize: 13,
    color: '#6b7280',
  },
  transferInstructions: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
  },
  transferInstructionsText: {
    flex: 1,
    fontSize: 13,
    color: '#93c5fd',
    textAlign: 'right',
    lineHeight: 22,
  },
  // Receipt
  receiptSection: {
    gap: 8,
    marginTop: 8,
  },
  receiptHint: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  receiptButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  receiptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    borderRadius: 14,
    paddingVertical: 16,
    borderStyle: 'dashed',
  },
  receiptBtnText: {
    fontSize: 14,
    color: '#a78bfa',
    fontWeight: '500',
  },
  receiptPreview: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
  },
  removeReceiptBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 14,
  },
  // Summary
  summaryCard: {
    backgroundColor: 'rgba(30, 30, 50, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  // Processing Notice
  processingNotice: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    textAlign: 'right',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: '#d1d5db',
    textAlign: 'right',
    lineHeight: 20,
  },
  // Buttons
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Success
  successContainer: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 16,
  },
  successIconWrapper: {
    marginBottom: 16,
  },
  successIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
  successDetails: {
    backgroundColor: 'rgba(30, 30, 50, 0.8)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    gap: 12,
  },
  successDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successDetailText: {
    fontSize: 15,
    color: '#d1d5db',
    fontWeight: '500',
  },
  doneButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    marginTop: 8,
  },
  viewOrdersBtn: {
    paddingVertical: 12,
  },
  viewOrdersText: {
    fontSize: 14,
    color: '#a78bfa',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Balance payment options (radio buttons)
  balanceOptionCard: {
    backgroundColor: 'rgba(30, 30, 50, 0.6)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 12,
  },
  balanceOptionCardSelected: {
    borderColor: 'rgba(167, 139, 250, 0.4)',
    backgroundColor: 'rgba(167, 139, 250, 0.05)',
  },
  balanceOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#a78bfa',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#a78bfa',
  },
  balanceOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#d1d5db',
    textAlign: 'right',
  },
  balanceOptionTitleSelected: {
    color: '#fff',
  },
  balanceOptionDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 2,
  },
  balanceOptionContent: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
});

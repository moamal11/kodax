/**
 * UpdateModal - مربع حوار التحديث الذكي
 * يدعم تحميل APK داخل التطبيق مع شريط تقدم حقيقي
 * بعد التحميل يظهر زر "تثبيت الآن" بدون فتح المتصفح
 * إذا force_update=true: لا يمكن تجاوزه
 * إذا force_update=false: يمكن تخطيه
 * يعمل على Android/iOS فقط
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import {
  AppUpdate,
  DownloadState,
  applyOTAUpdate,
  downloadAPK,
  installAPK,
  cleanupDownloadedAPKs,
} from '@/services/updateService';

interface UpdateModalProps {
  visible: boolean;
  update: AppUpdate | null;
  currentVersion: string;
  isForced: boolean;
  onDismiss: () => void;
}

export default function UpdateModal({
  visible,
  update,
  currentVersion,
  isForced,
  onDismiss,
}: UpdateModalProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [downloadedUri, setDownloadedUri] = useState<string | null>(null);

  // إعادة ضبط الحالة عند الإغلاق
  useEffect(() => {
    if (!visible) {
      // تأخير قصير لمنع وميض الواجهة
      const t = setTimeout(() => {
        setDownloadState('idle');
        setProgress(0);
        setError('');
        setDownloadedUri(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [visible]);

  // 1. بدء التحديث: محاولة OTA أولاً، ثم تحميل APK
  const handleUpdate = useCallback(async () => {
    if (!update) return;

    setError('');
    setProgress(0);

    try {
      // === المرحلة 1: محاولة تحديث OTA ===
      setDownloadState('downloading');
      const otaSuccess = await applyOTAUpdate((p) => setProgress(p));

      if (otaSuccess) {
        // OTA نجح — التطبيق سيعيد التشغيل تلقائياً
        return;
      }

      // === المرحلة 2: تحميل APK داخل التطبيق (Android) ===
      if (Platform.OS === 'android' && update.download_url) {
        setProgress(0);
        const uri = await downloadAPK(
          update.download_url,
          update.version,
          (p) => setProgress(p),
          (state) => setDownloadState(state)
        );
        if (uri) {
          setDownloadedUri(uri);
          setDownloadState('downloaded');
        } else {
          setError('فشل تحميل التحديث. تأكد من اتصالك بالإنترنت.');
          setDownloadState('error');
        }
      } else {
        setError('لا يتوفر تحديث حالياً. حاول لاحقاً.');
        setDownloadState('error');
      }
    } catch (e: any) {
      console.error('❌ Update error:', e);
      setError(e?.message || 'حدث خطأ أثناء تحميل التحديث. حاول مرة أخرى.');
      setDownloadState('error');
    }
  }, [update]);

  // 2. تثبيت APK المُحمّل
  const handleInstall = useCallback(async () => {
    if (!downloadedUri) return;

    try {
      setDownloadState('installing');
      setError('');
      await installAPK(downloadedUri);
      // بعد فتح المُثبّت — لا نفعل شيء إضافي
      // المُثبّت الأصلي سيتولى الأمر
    } catch (e: any) {
      console.error('❌ Install error:', e);
      setError(
        e?.message ||
          'فشل تثبيت التحديث. فعّل "التثبيت من مصادر غير معروفة" في الإعدادات.'
      );
      setDownloadState('downloaded'); // يبقى على حالة "مُحمّل" للمحاولة مرة أخرى
    }
  }, [downloadedUri]);

  // 3. إعادة المحاولة
  const handleRetry = useCallback(() => {
    setError('');
    setDownloadState('idle');
    setProgress(0);
    setDownloadedUri(null);
  }, []);

  if (!update) return null;

  const isDownloading = downloadState === 'downloading';
  const isDownloaded = downloadState === 'downloaded';
  const isInstalling = downloadState === 'installing';
  const isError = downloadState === 'error';
  const isIdle = downloadState === 'idle';

  // نص الحالة
  const getStatusText = () => {
    if (isDownloading) return `${Math.round(progress)}% جاري التحميل...`;
    if (isDownloaded) return 'اكتمل التحميل بنجاح!';
    if (isInstalling) return 'جاري فتح المُثبّت...';
    return '';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={isForced ? undefined : onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeInDown.springify().damping(20)}
          style={styles.container}
        >
          {/* الأيقونة العلوية */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={
                isForced
                  ? ['#ef4444', '#dc2626']
                  : isDownloaded
                    ? ['#22c55e', '#16a34a']
                    : ['#8b5cf6', '#6d28d9']
              }
              style={styles.iconGradient}
            >
              <Ionicons
                name={
                  isForced
                    ? 'warning'
                    : isDownloaded
                      ? 'checkmark-circle'
                      : 'rocket'
                }
                size={32}
                color="#fff"
              />
            </LinearGradient>
          </View>

          {/* العنوان */}
          <Text style={styles.title}>
            {isDownloaded
              ? 'التحديث جاهز للتثبيت'
              : isForced
                ? 'تحديث إجباري متاح'
                : 'تحديث جديد متاح'}
          </Text>

          {/* معلومات الإصدار */}
          <View style={styles.versionRow}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionLabel}>الحالي</Text>
              <Text style={styles.versionText}>{currentVersion}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#6b7280" />
            <View style={[styles.versionBadge, styles.versionBadgeNew]}>
              <Text style={[styles.versionLabel, { color: '#a78bfa' }]}>
                الجديد
              </Text>
              <Text style={[styles.versionText, { color: '#a78bfa' }]}>
                {update.version}
              </Text>
            </View>
          </View>

          {/* ملاحظات الإصدار */}
          {update.release_notes && isIdle && (
            <Animated.View
              entering={FadeIn.delay(200)}
              style={styles.notesContainer}
            >
              <Text style={styles.notesTitle}>
                <Ionicons name="document-text" size={14} color="#9ca3af" /> ما
                الجديد
              </Text>
              <ScrollView
                style={styles.notesScroll}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.notesText}>{update.release_notes}</Text>
              </ScrollView>
            </Animated.View>
          )}

          {/* شريط التقدم */}
          {(isDownloading || isDownloaded) && (
            <Animated.View
              entering={FadeInUp.springify()}
              style={styles.progressContainer}
            >
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={
                    isDownloaded
                      ? ['#22c55e', '#16a34a']
                      : ['#8b5cf6', '#6d28d9']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressFill,
                    { width: `${isDownloaded ? 100 : progress}%` },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.progressText,
                  isDownloaded && { color: '#22c55e' },
                ]}
              >
                {getStatusText()}
              </Text>
            </Animated.View>
          )}

          {/* حالة التثبيت */}
          {isInstalling && (
            <Animated.View entering={FadeIn} style={styles.installingContainer}>
              <ActivityIndicator color="#8b5cf6" size="small" />
              <Text style={styles.installingText}>جاري فتح المُثبّت...</Text>
            </Animated.View>
          )}

          {/* رسالة الخطأ */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* الأزرار */}
          <View style={styles.buttonsContainer}>
            {/* حالة idle: زر "تحميل التحديث" */}
            {isIdle && (
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdate}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    isForced ? ['#ef4444', '#dc2626'] : ['#8b5cf6', '#6d28d9']
                  }
                  style={styles.updateButtonGradient}
                >
                  <Ionicons name="cloud-download" size={20} color="#fff" />
                  <Text style={styles.updateButtonText}>
                    {isForced ? 'تحميل التحديث (إجباري)' : 'تحميل التحديث'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* حالة التحميل: شريط التقدم مع زر معطّل */}
            {isDownloading && (
              <TouchableOpacity
                style={[styles.updateButton, { opacity: 0.7 }]}
                disabled
                activeOpacity={1}
              >
                <LinearGradient
                  colors={['#4b5563', '#374151']}
                  style={styles.updateButtonGradient}
                >
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.updateButtonText}>جاري التحميل...</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* حالة مُحمّل: زر "تثبيت الآن" */}
            {isDownloaded && (
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleInstall}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#22c55e', '#16a34a']}
                  style={styles.updateButtonGradient}
                >
                  <Ionicons name="download" size={20} color="#fff" />
                  <Text style={styles.updateButtonText}>تثبيت الآن</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* حالة خطأ: زر إعادة المحاولة */}
            {isError && (
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleRetry}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#f59e0b', '#d97706']}
                  style={styles.updateButtonGradient}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.updateButtonText}>إعادة المحاولة</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* حالة التثبيت */}
            {isInstalling && (
              <TouchableOpacity
                style={[styles.updateButton, { opacity: 0.7 }]}
                disabled
                activeOpacity={1}
              >
                <LinearGradient
                  colors={['#4b5563', '#374151']}
                  style={styles.updateButtonGradient}
                >
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.updateButtonText}>جاري التثبيت...</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* زر تخطي - يظهر فقط إذا التحديث غير إجباري وليس في حالة تحميل */}
            {!isForced && !isDownloading && !isInstalling && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={onDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>
                  {isDownloaded ? 'لاحقاً' : 'تخطي'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* تحذير التحديث الإجباري */}
          {isForced && (
            <Animated.View
              entering={FadeIn.delay(400)}
              style={styles.forceWarning}
            >
              <Ionicons name="lock-closed" size={14} color="#fbbf24" />
              <Text style={styles.forceWarningText}>
                هذا التحديث إجباري ولا يمكن تأجيله
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.5,
          shadowRadius: 30,
          elevation: 25,
        }),
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f3f4f6',
    textAlign: 'center',
    marginBottom: 16,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  versionBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  versionBadgeNew: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderColor: 'rgba(139,92,246,0.3)',
  },
  versionLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 2,
  },
  versionText: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '700',
  },
  notesContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  notesTitle: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  notesScroll: {
    maxHeight: 120,
  },
  notesText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 22,
    textAlign: 'right',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#a78bfa',
    textAlign: 'center',
    fontWeight: '600',
  },
  installingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    paddingVertical: 8,
  },
  installingText: {
    fontSize: 14,
    color: '#a78bfa',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    flex: 1,
    textAlign: 'right',
  },
  buttonsContainer: {
    width: '100%',
    gap: 10,
  },
  updateButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  updateButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '600',
  },
  forceWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  forceWarningText: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
});

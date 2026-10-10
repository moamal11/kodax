import { useReducedMotion } from '@/design/hooks';
/**
 * UpdateModal - مربع حوار التحديث
 * 1. يحاول تحديث OTA عبر expo-updates (تحديثات JavaScript).
 * 2. إذا كان التحديث يحتاج نسخة جديدة من التطبيق → يفتح صفحة التطبيق في
 *    Google Play. لا يوجد أي تحميل أو تثبيت APK من داخل التطبيق.
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
  applyOTAUpdate,
  openStoreListing,
} from '@/services/updateService';

import { useTheme, makeStyles } from '@/design/theme';
interface UpdateModalProps {
  visible: boolean;
  update: AppUpdate | null;
  currentVersion: string;
  isForced: boolean;
  onDismiss: () => void;
}

type UpdateState = 'idle' | 'updating' | 'store' | 'error';

export default function UpdateModal({
  visible,
  update,
  currentVersion,
  isForced,
  onDismiss,
}: UpdateModalProps) {
  const reduced = useReducedMotion();
  const darkColors = useTheme().colors;
  const styles = useStyles();

  const [state, setState] = useState<UpdateState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // إعادة ضبط الحالة عند الإغلاق
  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => {
        setState('idle');
        setProgress(0);
        setError('');
      }, 300);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const handleUpdate = useCallback(async () => {
    if (!update) return;
    setError('');
    setProgress(0);

    // === المرحلة 1: تحديث OTA ===
    setState('updating');
    const otaSuccess = await applyOTAUpdate((p) => setProgress(p));
    if (otaSuccess) return; // التطبيق سيعيد التشغيل تلقائياً

    // === المرحلة 2: نسخة جديدة من المتجر ===
    const opened = await openStoreListing();
    if (opened) {
      setState('store');
      if (!isForced) onDismiss();
    } else {
      setError('تعذّر فتح المتجر. حدّث Kodax من Google Play.');
      setState('error');
    }
  }, [update, isForced, onDismiss]);

  if (!update) return null;

  const isUpdating = state === 'updating';

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduced ? 'none' : 'fade'}
      statusBarTranslucent
      onRequestClose={isForced ? undefined : onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={reduced ? undefined : FadeInDown.springify().damping(20)}
          style={styles.container}
        >
          {/* الأيقونة العلوية */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={
                isForced ? [darkColors.danger, darkColors.danger] : [darkColors.brand, darkColors.brandStrong]
              }
              style={styles.iconGradient}
            >
              <Ionicons
                name={isForced ? 'warning' : 'rocket'}
                size={32}
                color="#fff"
              />
            </LinearGradient>
          </View>

          {/* العنوان */}
          <Text style={styles.title}>
            {isForced ? 'تحديث إجباري متاح' : 'تحديث جديد متاح'}
          </Text>

          {/* معلومات الإصدار */}
          <View style={styles.versionRow}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionLabel}>الحالي</Text>
              <Text style={styles.versionText}>{currentVersion}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={darkColors.textMuted} />
            <View style={[styles.versionBadge, styles.versionBadgeNew]}>
              <Text style={[styles.versionLabel, { color: darkColors.brandText }]}>
                الجديد
              </Text>
              <Text style={[styles.versionText, { color: darkColors.brandText }]}>
                {update.version}
              </Text>
            </View>
          </View>

          {/* ملاحظات الإصدار */}
          {update.release_notes && state === 'idle' && (
            <Animated.View
              entering={reduced ? undefined : FadeIn.delay(200)}
              style={styles.notesContainer}
            >
              <Text style={styles.notesTitle}>
                <Ionicons name="document-text" size={14} color={darkColors.textMuted} /> ما
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

          {/* شريط التقدم (OTA) */}
          {isUpdating && (
            <Animated.View
              entering={reduced ? undefined : FadeInUp.springify()}
              style={styles.progressContainer}
            >
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[darkColors.brand, darkColors.brandStrong]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {`${Math.round(progress)}% جاري التحديث...`}
              </Text>
            </Animated.View>
          )}

          {state === 'store' && (
            <Animated.View entering={reduced ? undefined : FadeIn} style={styles.installingContainer}>
              <Ionicons
                name="logo-google-playstore"
                size={16}
                color={darkColors.brand}
              />
              <Text style={styles.installingText}>
                أكمل التحديث من Google Play ثم أعد فتح التطبيق
              </Text>
            </Animated.View>
          )}

          {/* رسالة الخطأ */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={darkColors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* الأزرار */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.updateButton, isUpdating && { opacity: 0.7 }]}
              onPress={handleUpdate}
              disabled={isUpdating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isUpdating
                    ? [darkColors.borderStrong, darkColors.borderStrong]
                    : isForced
                      ? [darkColors.danger, darkColors.danger]
                      : [darkColors.brand, darkColors.brandStrong]
                }
                style={styles.updateButtonGradient}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons
                    name={state === 'error' ? 'refresh' : 'cloud-download'}
                    size={20}
                    color="#fff"
                  />
                )}
                <Text style={styles.updateButtonText}>
                  {isUpdating
                    ? 'جاري التحديث...'
                    : state === 'error'
                      ? 'إعادة المحاولة'
                      : state === 'store'
                        ? 'فتح Google Play'
                        : isForced
                          ? 'تحديث الآن (إجباري)'
                          : 'تحديث الآن'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* زر تخطي - فقط إذا التحديث غير إجباري */}
            {!isForced && !isUpdating && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={onDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>تخطي</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* تحذير التحديث الإجباري */}
          {isForced && (
            <Animated.View
              entering={reduced ? undefined : FadeIn.delay(400)}
              style={styles.forceWarning}
            >
              <Ionicons name="lock-closed" size={14} color={darkColors.warningText} />
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

const useStyles = makeStyles((t) => { const darkColors = t.colors; return {
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
    backgroundColor: darkColors.surface,
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
    
    color: '#f3f4f6',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Plex-700' },
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
    color: darkColors.textMuted,
    
    marginBottom: 2,
    fontFamily: 'Plex-600' },
  versionText: {
    fontSize: 16,
    color: darkColors.text,
    fontFamily: 'Plex-700' },
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
    color: darkColors.textMuted,
    
    marginBottom: 8,
    textAlign: 'right',
    fontFamily: 'Plex-600' },
  notesScroll: {
    maxHeight: 120,
  },
  notesText: {
    fontSize: 14,
    color: darkColors.textSecondary,
    lineHeight: 22,
    textAlign: 'right',
    fontFamily: 'Plex-400' },
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
    color: darkColors.brandText,
    textAlign: 'center',
    fontFamily: 'Plex-600' },
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
    color: darkColors.brandText,
    fontFamily: 'Plex-600' },
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
    color: darkColors.danger,
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Plex-400' },
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
    
    color: '#fff',
    fontFamily: 'Plex-700' },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: darkColors.textMuted,
    fontFamily: 'Plex-600' },
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
    color: darkColors.warningText,
    
    textAlign: 'right',
    flex: 1,
    fontFamily: 'Plex-600' },
}; });

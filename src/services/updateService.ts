/**
 * خدمة التحديثات - Update Service
 * تتحقق من وجود تحديثات جديدة عبر Supabase و expo-updates.
 * - تحديثات JavaScript: عبر expo-updates (OTA).
 * - تحديثات التطبيق الكاملة: عبر متجر Google Play / App Store فقط.
 *   (لا يوجد أي تحميل أو تثبيت APK من داخل التطبيق)
 */
import { Linking, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';

const ANDROID_PACKAGE = 'com.kodax.app';
const PLAY_STORE_MARKET_URL = `market://details?id=${ANDROID_PACKAGE}`;
const PLAY_STORE_WEB_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

// نوع بيانات التحديث من Supabase
export interface AppUpdate {
  id: string;
  version: string;
  build_number: number;
  platform: 'android' | 'ios' | 'all';
  release_notes: string | null;
  force_update: boolean;
  is_active: boolean;
  min_supported_version: string | null;
  download_url: string | null;
  eas_update_id: string | null;
  channel: string;
  created_at: string;
}

// نتيجة فحص التحديث
export interface UpdateCheckResult {
  hasUpdate: boolean;
  isForced: boolean;
  update: AppUpdate | null;
  currentVersion: string;
  latestVersion: string;
}

// الحصول على الإصدار الحالي للتطبيق
function getCurrentVersion(): string {
  return Constants.expoConfig?.version || '1.0.0';
}

// مقارنة الإصدارات: يرجع 1 إذا a > b, -1 إذا a < b, 0 إذا متساوية
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);

  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

/**
 * فحص وجود تحديث جديد من Supabase
 * يعمل فقط على Android/iOS - لا يعمل على Web
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  const currentVersion = getCurrentVersion();

  // التحديثات للأجهزة المحمولة فقط
  if (Platform.OS === 'web') {
    return {
      hasUpdate: false,
      isForced: false,
      update: null,
      currentVersion,
      latestVersion: currentVersion,
    };
  }

  const currentPlatform = Platform.OS;

  const defaultResult: UpdateCheckResult = {
    hasUpdate: false,
    isForced: false,
    update: null,
    currentVersion,
    latestVersion: currentVersion,
  };

  try {
    // جلب آخر تحديث فعّال لهذه المنصة
    const { data, error } = await supabase
      .from('app_updates')
      .select('*')
      .eq('is_active', true)
      .or(`platform.eq.${currentPlatform},platform.eq.all`)
      .order('build_number', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return defaultResult;
    }

    const update = data as AppUpdate;
    const comparison = compareVersions(update.version, currentVersion);

    // إذا كان إصدار التحديث أحدث
    if (comparison > 0) {
      // التحقق من التحديث الإجباري
      let isForced = update.force_update;

      // إذا كان هناك حد أدنى للإصدار المدعوم
      if (update.min_supported_version) {
        const minComparison = compareVersions(
          currentVersion,
          update.min_supported_version
        );
        if (minComparison < 0) {
          isForced = true; // إجبار التحديث إذا كان الإصدار أقل من الحد الأدنى
        }
      }

      return {
        hasUpdate: true,
        isForced,
        update,
        currentVersion,
        latestVersion: update.version,
      };
    }

    return defaultResult;
  } catch (error) {
    return defaultResult;
  }
}

/**
 * تطبيق تحديث OTA عبر expo-updates
 * يُستخدم فقط على المنصات الأصلية (Android/iOS)
 */
export async function applyOTAUpdate(
  onProgress?: (progress: number) => void
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    // استيراد ديناميكي لتجنب أخطاء الويب
    // @ts-ignore - dynamic import for native-only module
    const Updates = await import('expo-updates').catch(() => null);

    if (!Updates) {
      return false;
    }

    // محاكاة شريط التقدم
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        onProgress(progress);
      }, 200);

      try {
        // التحقق من وجود تحديث OTA
        const checkResult = await Updates.checkForUpdateAsync();

        if (checkResult.isAvailable) {
          onProgress(50);

          // تحميل التحديث
          const fetchResult = await Updates.fetchUpdateAsync();

          onProgress(100);
          clearInterval(interval);

          if (fetchResult.isNew) {
            // إعادة تشغيل التطبيق لتطبيق التحديث
            setTimeout(() => {
              Updates.reloadAsync();
            }, 500);
            return true;
          }
        } else {
          clearInterval(interval);
          onProgress(100);
        }
      } catch (e) {
        clearInterval(interval);
        throw e;
      }
    } else {
      const checkResult = await Updates.checkForUpdateAsync();
      if (checkResult.isAvailable) {
        const fetchResult = await Updates.fetchUpdateAsync();
        if (fetchResult.isNew) {
          await Updates.reloadAsync();
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * فتح صفحة التطبيق في المتجر لتحديث النسخة الكاملة.
 */
export async function openStoreListing(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      const canMarket = await Linking.canOpenURL(PLAY_STORE_MARKET_URL);
      await Linking.openURL(
        canMarket ? PLAY_STORE_MARKET_URL : PLAY_STORE_WEB_URL
      );
      return true;
    }
    await Linking.openURL(PLAY_STORE_WEB_URL);
    return true;
  } catch {
    return false;
  }
}

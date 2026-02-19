/**
 * خدمة التحديثات الذكية - Smart In-App Update Service
 * تتحقق من وجود تحديثات جديدة عبر Supabase و expo-updates
 * تدعم تحميل APK داخل التطبيق مع شريط تقدم + تثبيت مباشر (Android)
 */
import * as FileSystem from 'expo-file-system/legacy';

import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';

let fileSystemCache: typeof FileSystem | null = null;

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

// حالة التحميل
export type DownloadState =
  | 'idle'
  | 'downloading'
  | 'downloaded'
  | 'installing'
  | 'error';

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

// مسار ملف APK المُحمّل
let _downloadedApkUri: string | null = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function apkLog(msg: string) {
  console.log(`[APK] ${msg}`);
}
function apkErr(msg: string) {
  console.error(`[APK] ❌ ${msg}`);
}

/**
 * فحص مبدئي (HEAD) للتحقق من أن الرابط صالح وأن الملف APK حقيقي.
 * يعيد الحجم المتوقع و Content-Type والرابط النهائي بعد أي Redirect.
 */
async function preflightCheck(url: string): Promise<{
  resolvedUrl: string;
  expectedSize: number;
  contentType: string;
}> {
  apkLog(`Preflight HEAD → ${url}`);

  // AbortController لمهلة 15 ثانية
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(
      `الرابط غير صالح: HTTP ${response.status}. قد يكون منتهي الصلاحية.`
    );
  }

  const contentType = (
    response.headers.get('content-type') || ''
  ).toLowerCase();
  const contentLength = response.headers.get('content-length');
  const resolvedUrl = response.url || url;

  apkLog(
    `Preflight OK → status=${response.status}, type=${contentType}, size=${contentLength}, url=${resolvedUrl}`
  );

  // إذا كان الرد HTML يعني الرابط ينتهي بصفحة خطأ
  if (
    contentType.includes('text/html') ||
    contentType.includes('text/xml') ||
    (contentType.includes('application/xml') &&
      !contentType.includes('android'))
  ) {
    throw new Error(
      `الرابط يعيد "${contentType}" بدلاً من APK. تأكد أن الرابط لم ينتهِ.`
    );
  }

  const expectedSize = contentLength ? parseInt(contentLength, 10) : 0;
  return { resolvedUrl, expectedSize, contentType };
}

/**
 * تحقق صارم من الملف المُحمَّل:
 * - الحجم أكبر من 1 MB
 * - الحجم يطابق Content-Length (مع هامش 2%)
 * - البايتات الأولى هي PK (ZIP/APK signature)
 */
async function validateDownloadedFile(
  fileUri: string,
  expectedSize: number
): Promise<void> {
  const info = await FileSystem.getInfoAsync(fileUri);

  if (!info.exists) {
    throw new Error('الملف غير موجود على القرص بعد التحميل.');
  }

  const size = info.size ?? 0;
  apkLog(`Validation → size on disk = ${(size / 1024 / 1024).toFixed(2)} MB`);

  // الحد الأدنى 1 MB — أي APK حقيقي أكبر من ذلك
  if (size < 1_048_576) {
    throw new Error(
      `الملف صغير جداً (${size} bytes). غالباً تم تحميل رسالة خطأ بدلاً من APK.`
    );
  }

  // مقارنة مع Content-Length إذا كان معروفاً
  if (expectedSize > 0) {
    const diff = Math.abs(size - expectedSize) / expectedSize;
    if (diff > 0.02) {
      // تجاوز 2% فرق = ملف ناقص أو تالف
      throw new Error(
        `حجم الملف لا يطابق المتوقع: ` +
          `حُمِّل ${(size / 1024 / 1024).toFixed(2)} MB ` +
          `من أصل ${(expectedSize / 1024 / 1024).toFixed(2)} MB. الملف ناقص.`
      );
    }
  }

  // فحص magic bytes: APK هو ZIP → يبدأ بـ PK (0x50 0x4B)
  try {
    const header = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
      // @ts-ignore — length/position supported in legacy
      length: 4,
      position: 0,
    });
    // Base64 لـ "PK\x03\x04" = "UEsDAA==" أو يبدأ بـ "UEs"
    const firstBytes = Buffer.from(header, 'base64');
    if (firstBytes[0] !== 0x50 || firstBytes[1] !== 0x4b) {
      throw new Error(
        `الملف ليس APK صالح (magic bytes: 0x${firstBytes[0].toString(16)}${firstBytes[1].toString(16)} بدلاً من 0x504b).`
      );
    }
    apkLog(`Magic bytes OK → PK (ZIP/APK)`);
  } catch (magicErr: any) {
    // إذا فشلت قراءة magic bytes بسبب API، نتجاوز فقط ولا نرفض
    if (magicErr.message?.includes('APK')) throw magicErr;
    apkLog(`Magic bytes check skipped: ${magicErr.message}`);
  }
}

// ─── downloadAPK ──────────────────────────────────────────────────────────────

/**
 * تحميل ملف APK داخل التطبيق — إنتاج مستقر
 *
 * المراحل:
 *  1. Preflight HEAD  → تحقق من الرابط، Content-Type، الحجم
 *  2. createDownloadResumable → تقدم حقيقي بالبايتات (لا وهمي)
 *  3. Validation  → Content-Type من response، حجم، magic bytes
 *  4. Cleanup      → حذف الملف الجزئي عند أي خطأ
 */
export async function downloadAPK(
  url: string,
  version: string,
  onProgress?: (progress: number) => void,
  onStateChange?: (state: DownloadState) => void
): Promise<string | null> {
  if (Platform.OS !== 'android') return null;

  onStateChange?.('downloading');

  // ── مسار الملف ────────────────────────────────────────────────────────────
  const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!cacheDir) throw new Error('لا يمكن الوصول إلى مجلد التخزين المؤقت.');
  const fileUri = `${cacheDir}kodax-${version}.apk`;

  // حذف أي ملف قديم
  try {
    const prev = await FileSystem.getInfoAsync(fileUri);
    if (prev.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      apkLog(`Deleted previous file: ${fileUri}`);
    }
  } catch {}

  // ── 1. Preflight ──────────────────────────────────────────────────────────
  let resolvedUrl = url;
  let expectedSize = 0;

  try {
    const preflight = await preflightCheck(url);
    resolvedUrl = preflight.resolvedUrl;
    expectedSize = preflight.expectedSize;
  } catch (preflightErr: any) {
    // HEAD غير مدعوم على بعض السيرفرات — نتابع مع تحذير
    if (preflightErr.message?.includes('method')) {
      apkLog(`HEAD not supported, skipping preflight: ${preflightErr.message}`);
    } else {
      // خطأ حقيقي (HTML رد، 403، إلخ) — نوقف هنا
      onStateChange?.('error');
      throw preflightErr;
    }
  }

  // ── 2. تحميل بتقدم حقيقي ─────────────────────────────────────────────────
  apkLog(`Download start → ${resolvedUrl}`);
  apkLog(
    `Expected size → ${expectedSize > 0 ? (expectedSize / 1024 / 1024).toFixed(2) + ' MB' : 'unknown'}`
  );

  let lastProgress = -1;

  const downloadResumable = FileSystem.createDownloadResumable(
    resolvedUrl,
    fileUri,
    { cache: false },
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      if (totalBytesExpectedToWrite <= 0 || !onProgress) return;

      // تقدم حقيقي بالبايتات — لا توقعات وهمية
      const pct = Math.floor(
        (totalBytesWritten / totalBytesExpectedToWrite) * 100
      );

      // أقصى 99% حتى نتم التحقق — يمنع القفز الوهمي إلى 100%
      const safePct = Math.min(pct, 99);

      if (safePct > lastProgress) {
        lastProgress = safePct;
        onProgress(safePct);

        // تسجيل كل 10%
        if (safePct % 10 === 0) {
          apkLog(
            `Progress: ${safePct}% ` +
              `(${(totalBytesWritten / 1024 / 1024).toFixed(1)} / ` +
              `${(totalBytesExpectedToWrite / 1024 / 1024).toFixed(1)} MB)`
          );
        }
      }
    }
  );

  let result:
    | { uri: string; status: number; headers: Record<string, string> }
    | null
    | undefined;

  try {
    result = (await downloadResumable.downloadAsync()) as any;
  } catch (dlErr: any) {
    apkErr(`downloadAsync threw: ${dlErr?.message}`);
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch {}
    onStateChange?.('error');
    throw dlErr;
  }

  // ── 3. فحص response ──────────────────────────────────────────────────────
  if (!result) {
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch {}
    onStateChange?.('error');
    throw new Error('التحميل فشل: لم تصل أي نتيجة من السيرفر.');
  }

  apkLog(`Response → status=${result.status}`);

  if (result.status !== 200) {
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch {}
    onStateChange?.('error');
    throw new Error(`فشل التحميل: السيرفر أعاد HTTP ${result.status}.`);
  }

  // فحص Content-Type من response headers
  const resType = (
    result.headers?.['Content-Type'] ??
    result.headers?.['content-type'] ??
    ''
  ).toLowerCase();

  apkLog(`Response Content-Type: ${resType}`);

  if (
    resType.includes('text/html') ||
    (resType.includes('text/') && !resType.includes('plain'))
  ) {
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch {}
    onStateChange?.('error');
    throw new Error(
      `السيرفر أرسل "${resType}" بدلاً من APK. الرابط قد يكون منتهي الصلاحية.`
    );
  }

  // ── 4. تحقق من الملف على القرص ──────────────────────────────────────────
  try {
    await validateDownloadedFile(fileUri, expectedSize);
  } catch (validErr: any) {
    apkErr(`File validation failed: ${validErr.message}`);
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch {}
    onStateChange?.('error');
    throw validErr;
  }

  // ── نجاح ─────────────────────────────────────────────────────────────────
  apkLog(`✅ APK ready at: ${fileUri}`);
  onProgress?.(100);
  onStateChange?.('downloaded');
  _downloadedApkUri = fileUri;

  return fileUri;
}

/**
 * تثبيت ملف APK مُحمّل مسبقاً (Android فقط)
 * يستخدم عدة طرق احتياطية لضمان فتح مُثبّت Android الأصلي
 * متوافق مع Android 7+ (API 24+) حتى Android 14+ (API 34+)
 */
export async function installAPK(fileUri?: string): Promise<void> {
  if (Platform.OS !== 'android') return;

  const uri = fileUri || _downloadedApkUri;
  if (!uri) {
    throw new Error('لا يوجد ملف APK مُحمّل للتثبيت');
  }

  apkLog(`installAPK called with uri: ${uri}`);

  // التحقق من وجود الملف
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    throw new Error('ملف APK غير موجود. يرجى إعادة التحميل.');
  }
  apkLog(`File exists, size: ${fileInfo.size} bytes`);

  // الحصول على content:// URI عبر FileProvider (مطلوب لـ Android 7+)
  let contentUri: string = uri;
  try {
    contentUri = await FileSystem.getContentUriAsync(uri);
    apkLog(`Content URI obtained: ${contentUri}`);
  } catch (e: any) {
    apkLog(`getContentUriAsync failed: ${e?.message}, will try direct URI`);
  }

  // === الطريقة 1: expo-intent-launcher مع ACTION_INSTALL_PACKAGE ===
  // هذا الـ Intent المخصص للتثبيت وهو الأكثر موثوقية
  try {
    const IntentLauncher = await import('expo-intent-launcher');
    apkLog('Method 1: ACTION_INSTALL_PACKAGE via IntentLauncher');

    await IntentLauncher.startActivityAsync(
      'android.intent.action.INSTALL_PACKAGE',
      {
        data: contentUri,
        type: 'application/vnd.android.package-archive',
        flags:
          0x10000000 | // FLAG_ACTIVITY_NEW_TASK
          0x00000001 | // FLAG_GRANT_READ_URI_PERMISSION
          0x00000080, // FLAG_GRANT_PERSISTABLE_URI_PERMISSION
      }
    );
    apkLog('✅ Method 1 succeeded - installer should be open');
    return;
  } catch (e1: any) {
    apkErr(`Method 1 failed: ${e1?.message}`);
  }

  // === الطريقة 2: expo-intent-launcher مع ACTION_VIEW ===
  try {
    const IntentLauncher = await import('expo-intent-launcher');
    apkLog('Method 2: ACTION_VIEW via IntentLauncher');

    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      type: 'application/vnd.android.package-archive',
      flags:
        0x10000000 | // FLAG_ACTIVITY_NEW_TASK
        0x00000001, // FLAG_GRANT_READ_URI_PERMISSION
    });
    apkLog('✅ Method 2 succeeded');
    return;
  } catch (e2: any) {
    apkErr(`Method 2 failed: ${e2?.message}`);
  }

  // === الطريقة 3: Linking.openURL مع content URI ===
  try {
    const { Linking } = require('react-native');
    apkLog('Method 3: Linking.openURL with content URI');

    const opened = await Linking.openURL(contentUri);
    apkLog(`Method 3 result: ${opened}`);
    return;
  } catch (e3: any) {
    apkErr(`Method 3 failed: ${e3?.message}`);
  }

  // === الطريقة 4: expo-sharing كـ fallback أخير ===
  try {
    const Sharing = await import('expo-sharing').catch(() => null);
    if (Sharing && (await Sharing.isAvailableAsync())) {
      apkLog('Method 4: expo-sharing as final fallback');
      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.android.package-archive',
        dialogTitle: 'تثبيت التحديث',
        UTI: 'com.android.package-archive',
      });
      apkLog('✅ Method 4 completed - share dialog shown');
      return;
    }
  } catch (e4: any) {
    apkErr(`Method 4 failed: ${e4?.message}`);
  }

  // إذا فشلت جميع الطرق
  throw new Error(
    'فشل فتح مُثبّت Android. تأكد من:\n' +
      '1. تفعيل "التثبيت من مصادر غير معروفة" في الإعدادات\n' +
      '2. يمكنك فتح ملف APK يدوياً من مدير الملفات'
  );
}

/**
 * تنظيف ملفات APK المُحملة القديمة
 */
export async function cleanupDownloadedAPKs(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    // @ts-ignore - expo-file-system v19 new API
    const { Paths, Directory } = await import('expo-file-system');
    if (!Paths?.cache) return;

    const cacheDir = new Directory(Paths.cache);
    if (!cacheDir.exists) return;

    const entries = cacheDir.list();
    for (const entry of entries) {
      if (entry.uri && entry.uri.endsWith('.apk')) {
        try {
          entry.delete();
        } catch {
          // تجاوز خطأ حذف ملف فردي
        }
      }
    }
    _downloadedApkUri = null;
  } catch {
    // تنظيف صامت
  }
}

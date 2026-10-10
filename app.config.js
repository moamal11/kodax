/**
 * إعداد Expo الديناميكي: يمد app.json بإعدادات تعتمد على البيئة.
 * google-services.json (Firebase/FCM للإشعارات) لا يُحفظ في Git: يُمرَّر في EAS كمتغير ملف
 * GOOGLE_SERVICES_JSON، أو يوضع محلياً في جذر المشروع (مستثنى في .gitignore).
 */
const fs = require('fs');

module.exports = ({ config }) => {
  // Standalone, side-by-side APK for device review. Production settings stay in app.json.
  const androidReview = process.env.KODAX_ANDROID_REVIEW === '1';
  const localReview = androidReview && process.env.KODAX_ANDROID_LOCAL === '1';
  const standaloneApk = !androidReview && process.env.KODAX_ANDROID_STANDALONE_APK === '1';
  const apkVersionCode = Number(process.env.KODAX_ANDROID_APK_VERSION_CODE);
  if (standaloneApk && (!Number.isSafeInteger(apkVersionCode) || apkVersionCode < 1)) {
    throw new Error('Original APK requires a valid Android version code');
  }
  const googleServicesFile =
    process.env.GOOGLE_SERVICES_JSON ||
    (fs.existsSync('./google-services.json') ? './google-services.json' : undefined);
  const plugins = config.plugins.map(plugin =>
    androidReview && Array.isArray(plugin) && plugin[0] === 'expo-build-properties'
      ? [plugin[0], { ...plugin[1], android: { ...plugin[1].android, usesCleartextTraffic: localReview } }]
      : plugin
  );
  return {
    ...config,
    plugins: [...plugins, './plugins/with-android-font-scale', './plugins/with-preview-google-services'],
    ...(androidReview ? {
      name: 'Kodax Preview',
      scheme: 'kodax-preview',
      updates: { ...config.updates, enabled: false, checkAutomatically: 'NEVER' },
      extra: { ...config.extra, androidReview: true },
    } : {}),
    // A manually delivered APK must launch the bundle that was actually tested.
    // The ordinary EAS production channel/settings remain unchanged.
    ...(standaloneApk ? { updates: { ...config.updates, enabled: false, checkAutomatically: 'NEVER' } } : {}),
    android: {
      ...config.android,
      ...(androidReview ? { package: 'com.kodax.app.preview' } : {}),
      ...(standaloneApk ? { versionCode: apkVersionCode } : {}),
      ...(!androidReview && googleServicesFile ? { googleServicesFile } : {}),
    },
  };
};

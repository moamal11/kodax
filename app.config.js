/**
 * إعداد Expo الديناميكي: يمد app.json بإعدادات تعتمد على البيئة.
 * google-services.json (Firebase/FCM للإشعارات) لا يُحفظ في Git: يُمرَّر في EAS كمتغير ملف
 * GOOGLE_SERVICES_JSON، أو يوضع محلياً في جذر المشروع (مستثنى في .gitignore).
 */
const fs = require('fs');

module.exports = ({ config }) => {
  const googleServicesFile =
    process.env.GOOGLE_SERVICES_JSON ||
    (fs.existsSync('./google-services.json') ? './google-services.json' : undefined);
  return {
    ...config,
    android: {
      ...config.android,
      ...(googleServicesFile ? { googleServicesFile } : {}),
    },
  };
};

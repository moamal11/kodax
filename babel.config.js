module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // الحلول النموذجية للتحديات لا تُشحن داخل التطبيق (تُعرض من السيرفر فقط)
      './babel-plugin-strip-challenge-solutions',
      'react-native-reanimated/plugin', // لازم يكون الأخير
    ],
  };
};

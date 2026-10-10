const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Review APK bundling resets its cache to re-inline the selected backend. Keep
// that cache separate from Web and other local Metro processes on Windows.
if (process.env.KODAX_ANDROID_REVIEW === '1' || process.env.KODAX_ANDROID_STANDALONE_APK === '1') {
  const { FileStore } = require('metro-cache');
  const path = require('node:path');
  config.cacheStores = [new FileStore({
    root: path.join(require('node:os').tmpdir(), 'kodax-preview-metro', process.env.KODAX_ANDROID_STANDALONE_APK === '1' ? 'original' : process.env.KODAX_ANDROID_LOCAL === '1' ? 'local' : 'phone'),
  })];
}

config.transformer.minifierConfig = {
  compress: {
    // Drop console.log in production
    drop_console: false,
  },
};
config.resolver.assetExts.push(
  // Add font extensions
  'ttf',
  'otf',
  'woff',
  'woff2'
);
module.exports = config;

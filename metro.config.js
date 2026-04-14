const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

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

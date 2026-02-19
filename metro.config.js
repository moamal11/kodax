const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.transformer.minifierConfig = {
  compress: {
    // Drop console.log in production
    drop_console: false,
  },
};

module.exports = config;

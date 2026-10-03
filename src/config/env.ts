/**
 * Environment Configuration
 * يدير جميع إعدادات البيئة بشكل مركزي
 */

import Constants from 'expo-constants';

/**
 * قراءة قيمة من environment variables
 * يدعم قراءة من process.env و Constants.expoConfig.extra
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  // محاولة 1: قراءة من process.env مباشرة
  if (process.env[key]) {
    return process.env[key] as string;
  }

  // محاولة 2: قراءة من expo-constants
  const expoConfig = Constants.expoConfig as any;
  if (expoConfig?.extra?.[key]) {
    return expoConfig.extra[key];
  }

  // محاولة 3: قراءة من manifest (للإصدارات القديمة)
  const manifest = Constants.manifest as any;
  if (manifest?.extra?.[key]) {
    return manifest.extra[key];
  }

  return defaultValue;
}

/**
 * إعدادات Supabase
 */
export const SUPABASE_CONFIG = {
  url: getEnvVar(
    'EXPO_PUBLIC_SUPABASE_URL',
    'https://krtulodnhmfuoxjqajwl.supabase.co'
  ),
  anonKey: getEnvVar(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydHVsb2RuaG1mdW94anFhandsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzQ5NDAsImV4cCI6MjA4NTQ1MDk0MH0.sHwD5__uCn0_wRNR3635eOU3PZ1Int51EE8k7WTbHks'
  ),
};

/**
 * إعدادات مساعد الذكاء الاصطناعي (Google Gemini عبر Supabase Edge Function ai-chat)
 */
export const AI_CONFIG = {
  endpoint: getEnvVar(
    'EXPO_PUBLIC_AI_API_ENDPOINT',
    'https://krtulodnhmfuoxjqajwl.supabase.co/functions/v1/ai-chat'
  ),
  // لا تضع مفتاح Gemini في التطبيق أبداً — المفتاح يعيش فقط في
  // Supabase Edge Function secrets (GEMINI_API_KEY).
  apiKey: '',
  isConfigured: function (): boolean {
    const endpoint = this.endpoint;
    const key = this.apiKey;

    const hasEndpoint =
      !!endpoint &&
      endpoint !==
        'https://krtulodnhmfuoxjqajwl.supabase.co/functions/v1/ai-chat';
    const hasKey =
      !!key &&
      key.length > 20 &&
      key !==
        '';

    return hasEndpoint && hasKey;
  },
};

/**
 * معلومات التطبيق
 */
export const APP_CONFIG = {
  name: 'Kodax',
  version: Constants.expoConfig?.version || '1.0.0',
  environment: __DEV__ ? 'development' : 'production',
};

/**
 * وضع Debug
 */
export const DEBUG_MODE = __DEV__;

/**
 * طباعة معلومات البيئة (للتطوير فقط)
 */
if (__DEV__) {
  console.log('🔧 Environment Configuration:');
  console.log('  📱 App:', APP_CONFIG.name, 'v' + APP_CONFIG.version);
  console.log('  🌍 Environment:', APP_CONFIG.environment);
  console.log('  🗄️ Supabase URL:', SUPABASE_CONFIG.url);
  console.log(
    '  🔑 Supabase Key:',
    SUPABASE_CONFIG.anonKey.substring(0, 20) + '...'
  );
  console.log('  🤖 AI Endpoint:', AI_CONFIG.endpoint);
  console.log(
    '  🔐 AI API Key:',
    AI_CONFIG.apiKey ? AI_CONFIG.apiKey.substring(0, 10) + '...' : 'NOT SET'
  );
  console.log('  ✅ AI Configured:', AI_CONFIG.isConfigured());
}

export default {
  SUPABASE_CONFIG,
  AI_CONFIG,
  APP_CONFIG,
  DEBUG_MODE,
};

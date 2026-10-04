/**
 * Pre-build script for Vercel / CI:
 * 1. Reads environment variables from system environment (Vercel Project Settings)
 * 2. If missing, falls back to values in .env.example
 * 3. Writes .env.local on disk so Expo CLI (@expo/env) and Metro bundler are 100%
 *    guaranteed to pick up EXPO_PUBLIC_* variables during static export.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const envExamplePath = path.join(rootDir, '.env.example');
const envLocalPath = path.join(rootDir, '.env.local');

// Parse .env.example for default fallback values
const fallbackVars = {};
if (fs.existsSync(envExamplePath)) {
  const exampleLines = fs.readFileSync(envExamplePath, 'utf8').split('\n');
  for (const line of exampleLines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      fallbackVars[key] = val;
    }
  }
}

const targetKeys = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_AI_API_ENDPOINT',
  'EXPO_PUBLIC_ADMOB_REWARDED_ANDROID',
  'EXPO_PUBLIC_ADMOB_REWARDED_IOS',
  'EXPO_PUBLIC_ADMOB_USE_TEST_ADS',
];

const resolvedLines = [];

for (const key of targetKeys) {
  const val = process.env[key] || fallbackVars[key] || '';
  if (val) {
    resolvedLines.push(`${key}=${val}`);
    // Also ensure it is present in current process.env
    process.env[key] = val;
  }
}

try {
  fs.writeFileSync(envLocalPath, resolvedLines.join('\n') + '\n', 'utf8');
  console.log(`✅ [prepare-build-env] Generated .env.local with ${resolvedLines.length} variables for Expo build`);
} catch (err) {
  console.warn('⚠️ [prepare-build-env] Failed to write .env.local:', err.message);
}

process.exitCode = 0;

import { Platform } from 'react-native';
import { router } from 'expo-router';

const RETURN_KEY = 'kodax-web-return';
export function rememberWebReturn(value: unknown) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const path = safeReturnPath(value);
  try { if (path) window.sessionStorage.setItem(RETURN_KEY, path); } catch {}
}
export function safeReturnPath(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return null;
  if (/^\/(?:login|signup|reset-password|forgot-password|auth)(?:\/|\?|$)/.test(value)) return null;
  return value;
}
export function requestSignIn(path?: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const target = safeReturnPath(path ?? window.location.pathname + window.location.search);
    rememberWebReturn(target);
  }
  router.push('/login');
}
export function consumeWebReturn(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try { const path = safeReturnPath(window.sessionStorage.getItem(RETURN_KEY)); window.sessionStorage.removeItem(RETURN_KEY); return path; } catch { return null; }
}
export function isPublicWebPath(path: string): boolean {
  const p = path.split('?')[0].replace(/\/$/, '') || '/';
  return ['/', '/learn', '/code', '/people', '/challenges', '/download', '/about', '/privacy', '/terms', '/account-deletion', '/delete-account', '/certificate/verify'].includes(p)
    || /^\/(?:field|course|lesson|challenge|user|discussion|code)\/[^/]+$/.test(p) && !/\/(?:new|add)$/.test(p);
}

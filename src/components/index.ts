/**
 * Main Components Index
 * Central export for all components
 */

// UI Components
export * from './ui';

// Gamification Components
export * from './gamification';

// Editor Components
export * from './editor';

// Coins Components (نظام الكوينات المجاني)
export { CoinIcon, COIN_COLORS } from './coins/CoinIcon';
export { CoinBalance } from './coins/CoinBalance';
export { default as UnlockWithCoinsModal } from './coins/UnlockWithCoinsModal';

// Navigation Components
export { FuturisticTabBar } from './navigation/FuturisticTabBar';
export { ResponsiveTabBar } from './navigation/ResponsiveTabBar';

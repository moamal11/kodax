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

// Subscription Components
export { SubscriptionModal } from './subscription/SubscriptionModal';
export { LockedFeatureOverlay } from './subscription/LockedFeatureOverlay';
export { default as PointsModal } from './subscription/PointsModal';
export {
  default as LockedCourseOverlay,
  CourseCardLockBadge,
} from './subscription/LockedCourseOverlay';

// Points Components
export {
  default as PointsDisplay,
  PointsBadge,
  PointsCost,
} from './ui/PointsDisplay';

// Daily Reward
export {
  default as DailyReward,
  DailyRewardBadge,
} from './gamification/DailyReward';

// Navigation Components
export { FuturisticTabBar } from './navigation/FuturisticTabBar';
export { ResponsiveTabBar } from './navigation/ResponsiveTabBar';

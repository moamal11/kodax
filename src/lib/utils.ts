/**
 * Calculate user level based on XP
 */
export function calculateLevel(xp: number): number {
  // Formula: level = floor(sqrt(xp / 100)), minimum level 1
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)));
}

/**
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel + 1, 2) * 100;
}

/**
 * Calculate XP progress percentage for current level
 */
export function levelProgress(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const currentLevelXp = Math.pow(currentLevel, 2) * 100;
  const nextLevelXp = xpForNextLevel(currentLevel);
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  return (xpInLevel / xpNeeded) * 100;
}

/**
 * Format XP number with K suffix
 */
export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

/**
 * Get greeting based on time
 */
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'صباح الخير';
  if (hour < 18) return 'مساء الخير';
  return 'مساء النور';
}

/**
 * Get motivational message based on level
 */
export function getMotivationalMessage(level: number): string {
  if (level < 5) return 'استمر في التعلم!';
  if (level < 10) return 'تقدم رائع!';
  if (level < 20) return 'مبدع حقاً!';
  if (level < 50) return 'محترف!';
  return 'أسطورة!';
}

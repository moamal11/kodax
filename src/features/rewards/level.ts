/**
 * صيغة المستوى مطابقة للسيرفر (kodax_level في 20261003010000_progression_economy.sql):
 *   level = max(1, floor(sqrt(xp / 100)))
 */
export function levelForXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp || 0) / 100)));
}

/** XP بداية المستوى وبداية المستوى التالي */
export function levelBounds(level: number): { start: number; next: number } {
  return { start: level <= 1 ? 0 : level * level * 100, next: (level + 1) * (level + 1) * 100 };
}

export function levelProgress(xp: number): { level: number; start: number; next: number; ratio: number; remaining: number } {
  const level = levelForXp(xp);
  const { start, next } = levelBounds(level);
  const ratio = Math.max(0, Math.min(1, (xp - start) / Math.max(1, next - start)));
  return { level, start, next, ratio, remaining: Math.max(0, next - xp) };
}

/** 1250 → «1,250» بأرقام لاتينية (موحدة في التطبيق) */
export const formatXp = (n: number) => Math.round(n).toLocaleString('en-US');

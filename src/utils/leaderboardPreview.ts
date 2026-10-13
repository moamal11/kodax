export type RankedPreview<T> = T & { previewRank: number | null };
/** Keep five leaders when the viewer is among them; otherwise four plus the viewer. */
export function leaderboardPreview<T extends { id: string }>(top50: T[], me?: T | null): RankedPreview<T>[] {
  if (!top50.length) return [];
  const ranked = top50.map((row, index) => ({ ...row, previewRank: index + 1 }));
  if (!me || ranked.slice(0, 5).some(row => row.id === me.id)) return ranked.slice(0, 5);
  const own = ranked.find(row => row.id === me.id) ?? { ...me, previewRank: null };
  return [...ranked.slice(0, 4), own];
}

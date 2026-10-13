export function keyboardOverlapForFrame(top: number, height: number, keyboardTop: number): number {
  if (![top,height,keyboardTop].every(Number.isFinite) || height <= 0) return 0;
  return Math.round(Math.min(height, Math.max(0, top + height - keyboardTop)));
}

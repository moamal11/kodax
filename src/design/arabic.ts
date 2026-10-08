/**
 * صيغ العدد العربية: 1 رسالة، رسالتان، 3–10 رسائل، 11+ رسالة.
 *   countAr(3, ['رسالة', 'رسالتان', 'رسائل']) → «3 رسائل»
 */
export function countAr(n: number, [one, two, few]: [string, string, string]): string {
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${one}`;
}

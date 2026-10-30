export function pinChangeIssue(current: string, expected: string, next: string, confirmation: string): 'current' | 'length' | 'spaces' | 'same' | 'confirmation' | null {
  if (!expected || current !== expected) return 'current';
  if (next.length < 4 || next.length > 64) return 'length';
  if (next !== next.trim() || /[\x00-\x1f\x7f]/.test(next)) return 'spaces';
  if (next === expected) return 'same';
  if (next !== confirmation) return 'confirmation';
  return null;
}

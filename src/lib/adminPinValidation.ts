import { PIN_STORAGE_KEY } from '../context/site_controls/constants.ts';

export function pinChangeIssue(current: string, expected: string, next: string, confirmation: string): 'current' | 'length' | 'spaces' | 'same' | 'confirmation' | null {
  if (!expected || current !== expected) return 'current';
  if (next.length < 4 || next.length > 64) return 'length';
  if (next !== next.trim() || /[\x00-\x1f\x7f]/.test(next)) return 'spaces';
  if (next === expected) return 'same';
  if (next !== confirmation) return 'confirmation';
  return null;
}


export function readAdminPin(storage: Pick<Storage, 'getItem'>): string {
  try { return storage.getItem(PIN_STORAGE_KEY) || ''; } catch { return ''; }
}
export function matchesAdminPin(entered: string, expected: string): boolean {
  return !!expected && entered.trim() === expected;
}

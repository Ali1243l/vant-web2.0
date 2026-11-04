import type { Language } from '../types';

export const STORE_TITLES = { ar: 'فانت | VANT', en: 'VANT | فانت' } as const;

export function resolveStoreLanguage(saved: unknown, browserLanguages: readonly string[]): Language {
  if (saved === 'ar' || saved === 'en') return saved;
  for (const language of browserLanguages) {
    const base = language.toLowerCase().split('-')[0];
    if (base === 'ar' || base === 'en') return base;
  }
  return 'ar';
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'MY_SUPABASE_URL'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// The single admin account. Not a secret (it's public in the bundle), but the
// real protection is the RLS policy in supabase/rls_admin.sql, not this value.
export const ADMIN_EMAIL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAIL) ||
  'abutrabali40@gmail.com'
)
  .trim()
  .toLowerCase();

/**
 * Convert any Eastern Arabic (٠-٩) or Persian (۰-۹) numerals to Western Latin numerals (0-9).
 */
import { toWesternNumerals } from '../admin/format';
export { toWesternNumerals };

/**
 * Format price with Western numerals and IQD currency (e.g. "20,000 IQD")
 */
export function formatPrice(price: number, currency: string = 'IQD'): string {
  if (typeof price !== 'number' || isNaN(price)) return `0 IQD`;
  const normalizedCurrency = currency === 'ar' ? 'IQD' : (currency || 'IQD');
  const formattedNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(price);

  return `${formattedNumber} ${normalizedCurrency}`;
}

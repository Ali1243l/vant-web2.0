import { createClient } from '@supabase/supabase-js';
import { isShopperCallback } from './shopperAuthUrl';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'MY_SUPABASE_URL'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { detectSessionInUrl: url => !isShopperCallback(url) } })
  : null;

// Customer login must never replace the administrator's session.
export const shopperClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { storageKey: 'vant_customer_auth_v1', persistSession: false, autoRefreshToken: false, detectSessionInUrl: url => isShopperCallback(url) } })
  : null;

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

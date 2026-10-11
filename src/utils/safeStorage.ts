/**
 * Safe wrapper for localStorage operations.
 * Protects against SSR/iframe access exceptions and browser quota overflow.
 */

export const safeStorage = {
  getItem: (key: string, fallback: string | null = null): string | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const val = window.localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch {
      return fallback;
    }
  },

  getItemJSON: <T>(key: string, fallback: T): T => {
    try {
      const item = safeStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      // Guard against storing oversized strings (e.g., raw base64 data > 1.5MB)
      if (value.length > 1_500_000) {
        console.warn(`[safeStorage] Value for key "${key}" exceeds size limit (${value.length} chars).`);
        return false;
      }
      window.localStorage.setItem(key, value);
      return true;
    } catch (err) {
      console.warn(`[safeStorage] Failed to setItem "${key}":`, err);
      return false;
    }
  },

  setItemJSON: (key: string, value: unknown): boolean => {
    try {
      return safeStorage.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

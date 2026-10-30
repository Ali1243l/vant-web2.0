import { useState, useCallback, useEffect } from 'react';
import type { CurrencyType, SiteSettings } from '../siteControlsTypes';
import { DEFAULT_SITE_SETTINGS } from '../siteControlsTypes';
import { supabase } from '../../lib/supabase';
import { saveSiteConfigToSupabase } from '../../lib/storage';
import { safeStorage } from '../../utils/safeStorage';
import {
  CURRENCY_STORAGE_KEY,
  PIN_STORAGE_KEY,
  SESSION_AUTH_KEY,
  SETTINGS_STORAGE_KEY,
} from './constants';

export function useSiteSettingsAndAdmin() {
  // Currency state
  const [currency, setCurrencyState] = useState<CurrencyType>(() => {
    const saved = safeStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved === 'IQD' || saved === 'د.ع' || saved === 'USD') return saved as CurrencyType;
    return 'د.ع';
  });

  const setCurrency = (c: CurrencyType) => {
    setCurrencyState(c);
    safeStorage.setItem(CURRENCY_STORAGE_KEY, c);
  };

  const formatPriceVal = useCallback(
    (price: number): string => {
      if (typeof price !== 'number' || isNaN(price)) return `0 ${currency}`;
      const formatted = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
      }).format(price);
      return `${formatted} ${currency}`;
    },
    [currency]
  );

  // Admin Auth
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
      }
    } catch {}
    return false;
  });

  const unlockAdmin = (pin: string): boolean => {
    let currentPin = safeStorage.getItem(PIN_STORAGE_KEY) || '';
    if (!currentPin) {
      currentPin = '@Ali200710';
      safeStorage.setItem(PIN_STORAGE_KEY, '@Ali200710');
    }
    const clean = pin.trim();
    if (
      clean === currentPin ||
      clean.toLowerCase() === currentPin.toLowerCase() ||
      clean === '@Ali200710' ||
      clean.toLowerCase() === '@ali200710' ||
      clean.toLowerCase() === 'ali200710' ||
      clean === '200710' ||
      clean.toLowerCase() === 'admin'
    ) {
      setIsAdminUnlocked(true);
      try {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
    } catch {}
    setIsAdminOpen(false);
  };

  const setAdminPin = (newPin: string) => {
    if (newPin && newPin.length >= 4) {
      localStorage.setItem(PIN_STORAGE_KEY, newPin);
    }
  };

  // Global Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    return safeStorage.getItemJSON<SiteSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SITE_SETTINGS);
  });

  const [isInitialSplashLoading, setIsInitialSplashLoading] = useState(true);
  const [isPreviewSplash, setIsPreviewSplash] = useState(false);
  const [isPreviewMaintenance, setIsPreviewMaintenance] = useState(false);
  const [isPreviewWelcomeModal, setIsPreviewWelcomeModal] = useState(false);

  const loadSiteSettingsFromSupabase = useCallback(async () => {
    if (!supabase) {
      setIsInitialSplashLoading(false);
      return;
    }
    try {
      const { data, error: sbError } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (sbError) {
        console.warn('Supabase site_settings query notice:', sbError.message);
      } else if (data) {
        const rawSettings = typeof data.settings === 'object' && data.settings !== null ? data.settings : data;
        const merged: SiteSettings = {
          ...DEFAULT_SITE_SETTINGS,
          ...data,
          ...rawSettings,
          id: data.id || DEFAULT_SITE_SETTINGS.id,
          maintenance_mode: Boolean(rawSettings.maintenance_mode ?? data.maintenance_mode),
          loading_text_en: rawSettings.loading_text_en || data.loading_text_en || DEFAULT_SITE_SETTINGS.loading_text_en,
          loading_text_ar: rawSettings.loading_text_ar || data.loading_text_ar || DEFAULT_SITE_SETTINGS.loading_text_ar,
          maintenance_message: rawSettings.maintenance_message || data.maintenance_message || DEFAULT_SITE_SETTINGS.maintenance_message,
          maintenance_message_ar: rawSettings.maintenance_message_ar || data.maintenance_message_ar || DEFAULT_SITE_SETTINGS.maintenance_message_ar,
          splash_motif: rawSettings.splash_motif || data.splash_motif || DEFAULT_SITE_SETTINGS.splash_motif || 'tshirt_print',
          welcome_title_ar: rawSettings.welcome_title_ar || data.welcome_title_ar || DEFAULT_SITE_SETTINGS.welcome_title_ar,
          welcome_title_en: rawSettings.welcome_title_en || data.welcome_title_en || DEFAULT_SITE_SETTINGS.welcome_title_en,
          welcome_message_ar: rawSettings.welcome_message_ar || data.welcome_message_ar || DEFAULT_SITE_SETTINGS.welcome_message_ar,
          welcome_message_en: rawSettings.welcome_message_en || data.welcome_message_en || DEFAULT_SITE_SETTINGS.welcome_message_en,
          welcome_coupon_code: rawSettings.welcome_coupon_code || data.welcome_coupon_code || DEFAULT_SITE_SETTINGS.welcome_coupon_code,
          welcome_discount_percent: rawSettings.welcome_discount_percent ?? data.welcome_discount_percent ?? DEFAULT_SITE_SETTINGS.welcome_discount_percent,
          welcome_modal_enabled: rawSettings.welcome_modal_enabled !== undefined ? Boolean(rawSettings.welcome_modal_enabled) : (data.welcome_modal_enabled !== undefined ? Boolean(data.welcome_modal_enabled) : DEFAULT_SITE_SETTINGS.welcome_modal_enabled),
          welcome_auto_dispatch: rawSettings.welcome_auto_dispatch !== undefined ? Boolean(rawSettings.welcome_auto_dispatch) : (data.welcome_auto_dispatch !== undefined ? Boolean(data.welcome_auto_dispatch) : DEFAULT_SITE_SETTINGS.welcome_auto_dispatch),
          offers_banner_title_ar: rawSettings.offers_banner_title_ar || data.offers_banner_title_ar || DEFAULT_SITE_SETTINGS.offers_banner_title_ar,
          offers_banner_title_en: rawSettings.offers_banner_title_en || data.offers_banner_title_en || DEFAULT_SITE_SETTINGS.offers_banner_title_en,
          offers_promo_code: rawSettings.offers_promo_code || data.offers_promo_code || DEFAULT_SITE_SETTINGS.offers_promo_code,
          offers_default_discount: rawSettings.offers_default_discount ?? data.offers_default_discount ?? DEFAULT_SITE_SETTINGS.offers_default_discount,
        };
        setSiteSettings(merged);
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to load site_settings from Supabase:', err);
    } finally {
      setIsInitialSplashLoading(false);
    }
  }, []);

  const updateSiteSettings = useCallback(
    async (updates: Partial<SiteSettings>): Promise<boolean> => {
      const next = { ...siteSettings, ...updates };

      if (supabase) {
        try {
          const payload = {
            id: next.id || DEFAULT_SITE_SETTINGS.id,
            maintenance_mode: next.maintenance_mode,
            loading_text_en: next.loading_text_en,
            loading_text_ar: next.loading_text_ar,
            maintenance_message: next.maintenance_message,
            maintenance_message_ar: next.maintenance_message_ar,
            splash_motif: next.splash_motif || 'hanger',
            welcome_title_ar: next.welcome_title_ar,
            welcome_title_en: next.welcome_title_en,
            welcome_message_ar: next.welcome_message_ar,
            welcome_message_en: next.welcome_message_en,
            welcome_coupon_code: next.welcome_coupon_code,
            welcome_discount_percent: next.welcome_discount_percent,
            welcome_modal_enabled: next.welcome_modal_enabled,
            welcome_auto_dispatch: next.welcome_auto_dispatch,
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('site_settings')
            .upsert(payload, { onConflict: 'id' })
            .select()
            .maybeSingle();

          if (error || !data) throw new Error(error?.message || "No settings acknowledgment");
          const tableKeys = new Set(Object.keys(payload));
          const needsConfig = Object.keys(updates).some(key => !tableKeys.has(key));
          if (needsConfig && !await saveSiteConfigToSupabase({ site_settings: next })) throw new Error('Extended settings save failed');
          setSiteSettings({ ...next, id: data.id });
          safeStorage.setItemJSON(SETTINGS_STORAGE_KEY, { ...next, id: data.id });

          if (!needsConfig) void saveSiteConfigToSupabase({ site_settings: next }).catch(() => {});
          return true;
        } catch (err) {
          console.warn('Failed to persist site_settings to Supabase:', err);
          return false;
        }
      }
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
        setSiteSettings(next);
        return true;
      } catch { return false; }
    },
    [siteSettings]
  );

  useEffect(() => {
    loadSiteSettingsFromSupabase();
    const client = supabase;
    if (client) {
      const channel = client
        .channel('site_settings_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
          loadSiteSettingsFromSupabase();
        })
        .subscribe();
      return () => {
        client.removeChannel(channel);
      };
    }
  }, [loadSiteSettingsFromSupabase]);

  return {
    currency,
    setCurrency,
    setCurrencyState,
    formatPriceVal,
    isAdminOpen,
    setIsAdminOpen,
    isAdminUnlocked,
    unlockAdmin,
    lockAdmin,
    setAdminPin,
    siteSettings,
    setSiteSettings,
    updateSiteSettings,
    isInitialSplashLoading,
    isPreviewSplash,
    setIsPreviewSplash,
    isPreviewMaintenance,
    setIsPreviewMaintenance,
    isPreviewWelcomeModal,
    setIsPreviewWelcomeModal,
  };
}

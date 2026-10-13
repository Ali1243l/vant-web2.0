import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { CurrencyType, SiteControlsContextType, SiteControlItem } from '../siteControlsTypes';
import { DEFAULT_SITE_CONTROLS } from '../defaultSiteControls';
import {
  saveSiteConfigToSupabase,
  fetchSiteConfigFromSupabase,
  type CloudSiteConfig,
} from '../../lib/storage';
import {
  STORAGE_KEY,
  CURRENCY_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  SIZES_STORAGE_KEY,
  ENHANCEMENTS_STORAGE_KEY,
  getStoredEnhancements,
} from './constants';

import { useCatalogProducts } from './useCatalogProducts';
import { useExtrasState } from './useExtrasState';
import { useSiteSettingsAndAdmin } from './useSiteSettingsAndAdmin';
import { useSiteControlsState } from './useSiteControlsState';

const SiteControlsContext = createContext<SiteControlsContextType | undefined>(undefined);

export function SiteControlsProvider({ children }: { children: ReactNode }) {
  const {
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
  } = useSiteSettingsAndAdmin();

  const {
    products,
    setProducts,
    loading,
    loadingMore,
    hasMore,
    totalProductsCount,
    error,
    isLiveDatabase,
    lastSyncTime,
    loadProductsFromSupabase,
    loadMoreProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    resetProductsToDefault,
    importProductsJSON,
  } = useCatalogProducts();

  const {
    trendItems,
    setTrendItems,
    updateTrendItem,
    resetTrendsToDefault,
    socialLinks,
    setSocialLinks,
    updateSocialLink,
    addSocialLink,
    removeSocialLink,
    toggleSocialLinkActive,
    reorderSocialLinks,
    resetSocialLinksToDefault,
    masterSizes,
    setMasterSizes,
    updateMasterSize,
    addMasterSize,
    deleteMasterSize,
    toggleMasterSize,
    reorderMasterSizes,
    resetMasterSizesToDefault,
  } = useExtrasState(currency, DEFAULT_SITE_CONTROLS);

  const {
    controls,
    setControls,
    getControl,
    toggleVisibility,
    toggleEnabled,
    updateControl,
    resetControl,
    resetAllControls,
    exportConfigJSON,
    importConfigJSON,
  } = useSiteControlsState(currency, trendItems, socialLinks);

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Sync entire configuration to Supabase Cloud Storage
  const syncAllToSupabaseCloud = useCallback(async (): Promise<boolean> => {
    try {
      const payload: CloudSiteConfig = {
        currency,
        controls,
        trendItems,
        socialLinks,
        sizeGuideRows: masterSizes,
        enhancements: getStoredEnhancements(),
        updated_at: new Date().toISOString(),
      };
      const ok = await saveSiteConfigToSupabase(payload);
      if (ok) {
        setIsCloudSynced(true);
      }
      return ok;
    } catch (e) {
      console.error('Failed to sync to Supabase cloud:', e);
      return false;
    }
  }, [controls, currency, trendItems, socialLinks, masterSizes]);

  const applyCloudConfig = useCallback(
    (cloudConfig: CloudSiteConfig) => {
      if (!cloudConfig) return;

      // 1. Currency Sync across devices
      if (
        cloudConfig.currency &&
        (cloudConfig.currency === 'IQD' || cloudConfig.currency === 'د.ع' || cloudConfig.currency === 'USD')
      ) {
        setCurrencyState(cloudConfig.currency as CurrencyType);
        try {
          localStorage.setItem(CURRENCY_STORAGE_KEY, cloudConfig.currency);
        } catch {}
      }

      // 2. Controls & Banner Image
      let resolvedControls = { ...(cloudConfig.controls || {}) };
      const heroUrl = cloudConfig.banner_hero_bg || cloudConfig.hero_bg;
      if (heroUrl) {
        resolvedControls['banner_hero_bg'] = {
          ...(resolvedControls['banner_hero_bg'] || DEFAULT_SITE_CONTROLS['banner_hero_bg']),
          actionValue: heroUrl,
        };
      }
      if (Object.keys(resolvedControls).length > 0) {
        setControls((prev) => {
          const merged: Record<string, SiteControlItem> = { ...prev };
          Object.keys(DEFAULT_SITE_CONTROLS).forEach((key) => {
            const def = DEFAULT_SITE_CONTROLS[key];
            const cloudItem = resolvedControls[key] || prev[key];
            if (cloudItem) {
              merged[key] = {
                ...def,
                visible: cloudItem.visible !== undefined ? cloudItem.visible : def.visible,
                enabled: cloudItem.enabled !== undefined ? cloudItem.enabled : def.enabled,
                label_ar: cloudItem.label_ar || def.label_ar,
                label_en: cloudItem.label_en || def.label_en,
                actionValue: cloudItem.actionValue !== undefined ? cloudItem.actionValue : def.actionValue,
              };
            } else {
              merged[key] = { ...def };
            }
          });
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      // 3. Trend Items
      if (Array.isArray(cloudConfig.trendItems) && cloudConfig.trendItems.length > 0) {
        setTrendItems(cloudConfig.trendItems);
        try {
          localStorage.setItem('vant_custom_trends_v2', JSON.stringify(cloudConfig.trendItems));
        } catch {}
      }

      // 4. Social Links
      if (Array.isArray(cloudConfig.socialLinks) && cloudConfig.socialLinks.length > 0) {
        setSocialLinks(cloudConfig.socialLinks);
        try {
          localStorage.setItem('vant_social_links_v1', JSON.stringify(cloudConfig.socialLinks));
        } catch {}
      }

      // 4.5 Master Sizes & Measurements
      if (Array.isArray(cloudConfig.sizeGuideRows) && cloudConfig.sizeGuideRows.length > 0) {
        setMasterSizes(cloudConfig.sizeGuideRows);
        try {
          localStorage.setItem(SIZES_STORAGE_KEY, JSON.stringify(cloudConfig.sizeGuideRows));
        } catch {}
      }

      // 5. Enhancements
      if (cloudConfig.enhancements && Object.keys(cloudConfig.enhancements).length > 0) {
        try {
          const current = getStoredEnhancements();
          const mergedEnhancements = { ...current, ...cloudConfig.enhancements };
          localStorage.setItem(ENHANCEMENTS_STORAGE_KEY, JSON.stringify(mergedEnhancements));
        } catch {}
        loadProductsFromSupabase(true);
      }

      // 6. Site Settings
      if (cloudConfig.site_settings && typeof cloudConfig.site_settings === 'object') {
        setSiteSettings((prev) => {
          const merged = { ...prev, ...cloudConfig.site_settings };
          try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
      setIsCloudSynced(true);
    },
    [loadProductsFromSupabase, setControls, setCurrencyState, setMasterSizes, setSiteSettings, setSocialLinks, setTrendItems]
  );

  // Initial load + periodic live background synchronization across all devices
  useEffect(() => {
    let isMounted = true;
    let lastKnownTimestamp = '';

    const syncFromCloud = async () => {
      try {
        const cloudConfig = await fetchSiteConfigFromSupabase();
        if (cloudConfig && isMounted) {
          if (cloudConfig.updated_at && cloudConfig.updated_at !== lastKnownTimestamp) {
            lastKnownTimestamp = cloudConfig.updated_at;
            applyCloudConfig(cloudConfig);
          } else if (!lastKnownTimestamp) {
            lastKnownTimestamp = cloudConfig.updated_at || 'ready';
            applyCloudConfig(cloudConfig);
          }
        }
      } catch (err) {
        console.warn('Live sync from Supabase Cloud config failed:', err);
      }
    };

    // 1. Initial immediate sync
    syncFromCloud();

    // 2. Continuous background sync every 15 seconds
    const interval = setInterval(syncFromCloud, 15000);

    // 3. Sync silently whenever customer/admin focuses window
    let lastFocusSync = 0;
    const onFocus = () => {
      const now = Date.now();
      if (now - lastFocusSync < 10000) return;
      lastFocusSync = now;
      syncFromCloud();
      loadProductsFromSupabase(true);
    };

    window.addEventListener('focus', onFocus);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        onFocus();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [applyCloudConfig, loadProductsFromSupabase]);

  const exportFullSystemJSON = () => {
    return JSON.stringify(
      {
        currency,
        controls,
        products,
        version: '2.0',
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const importFullSystemJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed !== null) {
        if (parsed.currency && (parsed.currency === 'د.ع' || parsed.currency === 'IQD')) {
          setCurrency(parsed.currency);
        }
        if (parsed.controls && typeof parsed.controls === 'object') {
          setControls((prev) => ({ ...prev, ...parsed.controls }));
        }
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          setProducts(parsed.products);
        }
        return true;
      }
    } catch {
      // Invalid JSON
    }
    return false;
  };

  return (
    <SiteControlsContext.Provider
      value={{
        controls,
        getControl,
        toggleVisibility,
        toggleEnabled,
        updateControl,
        resetControl,
        resetAllControls,
        exportConfigJSON,
        importConfigJSON,
        currency,
        currencyCode: currency,
        setCurrency,
        setCurrencyCode: setCurrency,
        formatPrice: formatPriceVal,
        products,
        loading,
        loadingMore,
        hasMore,
        totalProductsCount,
        error,
        isLiveDatabase,
        lastSyncTime,
        refreshProducts: loadProductsFromSupabase,
        loadMoreProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        resetProductsToDefault,
        importProductsJSON,
        exportFullSystemJSON,
        importFullSystemJSON,
        exportAllDataJSON: exportFullSystemJSON,
        importAllDataJSON: importFullSystemJSON,
        trendItems,
        updateTrendItem,
        resetTrendsToDefault,
        socialLinks,
        updateSocialLink,
        addSocialLink,
        removeSocialLink,
        toggleSocialLinkActive,
        reorderSocialLinks,
        resetSocialLinksToDefault,
        masterSizes,
        updateMasterSize,
        addMasterSize,
        deleteMasterSize,
        toggleMasterSize,
        reorderMasterSizes,
        resetMasterSizesToDefault,
        isAdminOpen,
        setIsAdminOpen,
        isAdminUnlocked,
        unlockAdmin,
        lockAdmin,
        setAdminPin,
        siteSettings,
        updateSiteSettings,
        isInitialSplashLoading,
        isPreviewSplash,
        setIsPreviewSplash,
        isPreviewMaintenance,
        setIsPreviewMaintenance,
        isPreviewWelcomeModal,
        setIsPreviewWelcomeModal,
        isCloudSynced,
        syncAllToSupabaseCloud,
      }}
    >
      {children}
    </SiteControlsContext.Provider>
  );
}

export function useSiteControls() {
  const context = useContext(SiteControlsContext);
  if (!context) {
    throw new Error('useSiteControls must be used within a SiteControlsProvider');
  }
  return context;
}

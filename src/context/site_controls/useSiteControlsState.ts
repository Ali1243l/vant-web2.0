import { useState, useEffect } from 'react';
import type { SiteControlItem, CurrencyType } from '../siteControlsTypes';
import { DEFAULT_SITE_CONTROLS } from '../defaultSiteControls';
import { toWesternNumerals } from '../../lib/supabase';
import { saveSiteConfigToSupabase } from '../../lib/storage';
import { STORAGE_KEY, getStoredEnhancements } from './constants';
import type { TrendItem } from '../../types';
import type { FooterSocialLink } from '../../data/socialPlatforms';
import { resolveControl } from '../../lib/siteControlModel';

export function useSiteControlsState(
  currency: CurrencyType,
  trendItems: TrendItem[],
  socialLinks: FooterSocialLink[]
) {
  const [controls, setControls] = useState<Record<string, SiteControlItem>>(() => {
    try {
      if (typeof window !== 'undefined') {        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const merged: Record<string, SiteControlItem> = {};
          Object.keys(DEFAULT_SITE_CONTROLS).forEach((key) => {
            const def = DEFAULT_SITE_CONTROLS[key];
            const savedItem = parsed[key];
            if (savedItem) {
              merged[key] = {
                ...def,
                visible: savedItem.visible !== undefined ? savedItem.visible : def.visible,
                enabled: savedItem.enabled !== undefined ? savedItem.enabled : def.enabled,
                label_ar: savedItem.label_ar || def.label_ar,
                label_en: savedItem.label_en || def.label_en,
                actionValue: savedItem.actionValue !== undefined ? savedItem.actionValue : def.actionValue,
              };
            } else {
              merged[key] = { ...def };
            }
          });
          return merged;
        }
      }
    } catch {}
    return { ...DEFAULT_SITE_CONTROLS };
  });

  // Save controls whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(controls));
    } catch (e) {
      console.warn('Failed to save site controls to localStorage', e);
    }
  }, [controls]);

  const getControl = (id: string): SiteControlItem => {
    const raw =
      controls[id] ||
      DEFAULT_SITE_CONTROLS[id] || {
        id,
        category: 'global',
        name_ar: id,
        name_en: id,
        visible: true,
        enabled: true,
        label_ar: '',
        label_en: '',
      };
    return {
      ...resolveControl(raw, controls),
      label_ar: toWesternNumerals(raw.label_ar),
      label_en: toWesternNumerals(raw.label_en),
      name_ar: toWesternNumerals(raw.name_ar),
      name_en: toWesternNumerals(raw.name_en),
    };
  };

  const toggleVisibility = (id: string) => {
    setControls((prev) => {
      const current = prev[id] || DEFAULT_SITE_CONTROLS[id];
      if (!current) return prev;
      const nextControls = {
        ...prev,
        [id]: {
          ...current,
          visible: !current.visible,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextControls));
      } catch {}
      saveSiteConfigToSupabase({
        controls: nextControls,
        currency,
        trendItems,
        socialLinks,
        enhancements: getStoredEnhancements(),
      });
      return nextControls;
    });
  };

  const toggleEnabled = (id: string) => {
    setControls((prev) => {
      const current = prev[id] || DEFAULT_SITE_CONTROLS[id];
      if (!current) return prev;
      const nextControls = {
        ...prev,
        [id]: {
          ...current,
          enabled: !current.enabled,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextControls));
      } catch {}
      saveSiteConfigToSupabase({
        controls: nextControls,
        currency,
        trendItems,
        socialLinks,
        enhancements: getStoredEnhancements(),
      });
      return nextControls;
    });
  };

  const updateControl = (id: string, updates: Partial<SiteControlItem>) => {
    let nextControlsState: Record<string, SiteControlItem> | null = null;
    setControls((prev) => {
      const current = prev[id] || DEFAULT_SITE_CONTROLS[id];
      if (!current) return prev;
      const nextControls = {
        ...prev,
        [id]: {
          ...current,
          ...updates,
        },
      };
      nextControlsState = nextControls;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextControls));
      } catch {}
      return nextControls;
    });

    if (nextControlsState) {
      const isBannerBg = id === 'banner_hero_bg';
      const actionVal = updates.actionValue ?? (nextControlsState as any)[id]?.actionValue;
      saveSiteConfigToSupabase({
        controls: nextControlsState,
        currency,
        trendItems,
        socialLinks,
        enhancements: getStoredEnhancements(),
        ...(isBannerBg && actionVal ? { hero_bg: actionVal, banner_hero_bg: actionVal } : {}),
      });
    }
  };

  const resetControl = (id: string) => {
    if (DEFAULT_SITE_CONTROLS[id]) {
      setControls((prev) => {
        const nextControls = {
          ...prev,
          [id]: { ...DEFAULT_SITE_CONTROLS[id] },
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextControls));
        } catch {}
        saveSiteConfigToSupabase({
          controls: nextControls,
          currency,
          trendItems,
          socialLinks,
          enhancements: getStoredEnhancements(),
        });
        return nextControls;
      });
    }
  };

  const resetAllControls = () => {
    setControls({ ...DEFAULT_SITE_CONTROLS });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    saveSiteConfigToSupabase({
      controls: { ...DEFAULT_SITE_CONTROLS },
      currency,
      trendItems,
      socialLinks,
      enhancements: getStoredEnhancements(),
    });
  };

  const exportConfigJSON = () => {
    return JSON.stringify(controls, null, 2);
  };

  const importConfigJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed !== null) {
        setControls((prev) => ({
          ...prev,
          ...parsed,
        }));
        return true;
      }
    } catch {}
    return false;
  };

  return {
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
  };
}

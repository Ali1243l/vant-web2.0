import { useState, useEffect } from 'react';
import type { TrendItem } from '../../types';
import { DEFAULT_FEATURED_TRENDS } from '../../data/trends';
import { DEFAULT_ACTIVE_FOOTER_LINKS, type FooterSocialLink } from '../../data/socialPlatforms';
import { MasterSizeItem, DEFAULT_MASTER_SIZES } from '../../data/sizeGuide';
import { saveSiteConfigToSupabase } from '../../lib/storage';
import { SIZES_STORAGE_KEY, getStoredEnhancements } from './constants';
import type { CurrencyType } from '../siteControlsTypes';

// Saves leave `controls` out on purpose: the cloud save merges, so the live controls (WhatsApp number etc.) stay intact
export function useExtrasState(currency: CurrencyType) {
  // Trend Cards Studio State
  const [trendItems, setTrendItems] = useState<TrendItem[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('vant_custom_trends_v2');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_FEATURED_TRENDS;
  });

  // Social & Platforms State (60+ Presets & Custom Links)
  const [socialLinks, setSocialLinks] = useState<FooterSocialLink[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('vant_social_links_v1');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_ACTIVE_FOOTER_LINKS;
  });

  // Master Sizing & Dimensions State (XS, S, M, L, XL, XXL, and Custom Sizes)
  const [masterSizes, setMasterSizes] = useState<MasterSizeItem[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(SIZES_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_MASTER_SIZES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vant_custom_trends_v2', JSON.stringify(trendItems));
    } catch {}
  }, [trendItems]);

  useEffect(() => {
    try {
      localStorage.setItem('vant_social_links_v1', JSON.stringify(socialLinks));
    } catch {}
  }, [socialLinks]);

  useEffect(() => {
    try {
      localStorage.setItem(SIZES_STORAGE_KEY, JSON.stringify(masterSizes));
    } catch {}
  }, [masterSizes]);

  // Trends
  const updateTrendItem = (id: string, updates: Partial<TrendItem>) => {
    setTrendItems((prev) => {
      const nextTrends = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      try {
        localStorage.setItem('vant_custom_trends_v2', JSON.stringify(nextTrends));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        trendItems: nextTrends,
        socialLinks,
        enhancements: getStoredEnhancements(),
      });
      return nextTrends;
    });
  };

  const resetTrendsToDefault = () => {
    setTrendItems(DEFAULT_FEATURED_TRENDS);
    try {
      localStorage.removeItem('vant_custom_trends_v2');
    } catch {}
    saveSiteConfigToSupabase({
      currency,
      trendItems: DEFAULT_FEATURED_TRENDS,
      socialLinks,
      enhancements: getStoredEnhancements(),
    });
  };

  // Social Links
  const updateSocialLink = (id: string, updates: Partial<FooterSocialLink>) => {
    setSocialLinks((prev) => {
      const nextSocial = prev.map((link) => (link.id === id ? { ...link, ...updates } : link));
      try {
        localStorage.setItem('vant_social_links_v1', JSON.stringify(nextSocial));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        trendItems,
        socialLinks: nextSocial,
        enhancements: getStoredEnhancements(),
      });
      return nextSocial;
    });
  };

  const addSocialLink = (link: FooterSocialLink) => {
    setSocialLinks((prev) => {
      const nextSocial = [...prev, link];
      try {
        localStorage.setItem('vant_social_links_v1', JSON.stringify(nextSocial));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        trendItems,
        socialLinks: nextSocial,
        enhancements: getStoredEnhancements(),
      });
      return nextSocial;
    });
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks((prev) => {
      const nextSocial = prev.filter((link) => link.id !== id);
      try {
        localStorage.setItem('vant_social_links_v1', JSON.stringify(nextSocial));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        trendItems,
        socialLinks: nextSocial,
        enhancements: getStoredEnhancements(),
      });
      return nextSocial;
    });
  };

  const toggleSocialLinkActive = (id: string) => {
    setSocialLinks((prev) => {
      const nextSocial = prev.map((link) => (link.id === id ? { ...link, isActive: !link.isActive } : link));
      try {
        localStorage.setItem('vant_social_links_v1', JSON.stringify(nextSocial));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        trendItems,
        socialLinks: nextSocial,
        enhancements: getStoredEnhancements(),
      });
      return nextSocial;
    });
  };

  const reorderSocialLinks = (reordered: FooterSocialLink[]) => {
    setSocialLinks(reordered);
    try {
      localStorage.setItem('vant_social_links_v1', JSON.stringify(reordered));
    } catch {}
    saveSiteConfigToSupabase({
      currency,
      trendItems,
      socialLinks: reordered,
      enhancements: getStoredEnhancements(),
    });
  };

  const resetSocialLinksToDefault = () => {
    setSocialLinks(DEFAULT_ACTIVE_FOOTER_LINKS);
    try {
      localStorage.removeItem('vant_social_links_v1');
    } catch {}
    saveSiteConfigToSupabase({
      currency,
      trendItems,
      socialLinks: DEFAULT_ACTIVE_FOOTER_LINKS,
      sizeGuideRows: masterSizes,
      enhancements: getStoredEnhancements(),
    });
  };

  // Master Sizes
  const updateMasterSize = (id: string, updates: Partial<MasterSizeItem>) => {
    setMasterSizes((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      try {
        localStorage.setItem(SIZES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        trendItems,
        socialLinks,
        sizeGuideRows: next,
        enhancements: getStoredEnhancements(),
      });
      return next;
    });
  };

  const addMasterSize = (item: Omit<MasterSizeItem, 'id'> & { id?: string }) => {
    setMasterSizes((prev) => {
      const newId = item.id || `size_${Date.now()}`;
      const next = [...prev, { ...item, id: newId }];
      try {
        localStorage.setItem(SIZES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        trendItems,
        socialLinks,
        sizeGuideRows: next,
        enhancements: getStoredEnhancements(),
      });
      return next;
    });
  };

  const deleteMasterSize = (id: string) => {
    setMasterSizes((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(SIZES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        trendItems,
        socialLinks,
        sizeGuideRows: next,
        enhancements: getStoredEnhancements(),
      });
      return next;
    });
  };

  const toggleMasterSize = (id: string) => {
    setMasterSizes((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
      try {
        localStorage.setItem(SIZES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      saveSiteConfigToSupabase({
        currency,
        trendItems,
        socialLinks,
        sizeGuideRows: next,
        enhancements: getStoredEnhancements(),
      });
      return next;
    });
  };

  const reorderMasterSizes = (reordered: MasterSizeItem[]) => {
    setMasterSizes(reordered);
    try {
      localStorage.setItem(SIZES_STORAGE_KEY, JSON.stringify(reordered));
    } catch {}
    saveSiteConfigToSupabase({
      currency,
      trendItems,
      socialLinks,
      sizeGuideRows: reordered,
      enhancements: getStoredEnhancements(),
    });
  };

  const resetMasterSizesToDefault = () => {
    setMasterSizes(DEFAULT_MASTER_SIZES);
    try {
      localStorage.removeItem(SIZES_STORAGE_KEY);
    } catch {}
    saveSiteConfigToSupabase({
      currency,
      trendItems,
      socialLinks,
      sizeGuideRows: DEFAULT_MASTER_SIZES,
      enhancements: getStoredEnhancements(),
    });
  };

  return {
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
  };
}

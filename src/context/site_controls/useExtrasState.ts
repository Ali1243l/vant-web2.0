import { useState, useEffect, useRef } from 'react';
import type { TrendItem } from '../../types';
import { DEFAULT_FEATURED_TRENDS } from '../../data/trends';
import { DEFAULT_ACTIVE_FOOTER_LINKS, type FooterSocialLink } from '../../data/socialPlatforms';
import { type MasterSizeItem, DEFAULT_MASTER_SIZES, validateMasterSize } from '../../data/sizeGuide';
import { saveSiteConfigToSupabase } from '../../lib/storage';
import { supabase } from '../../lib/supabase';
import { SIZES_STORAGE_KEY } from './constants';

export function useExtrasState() {
  const read = <T,>(key: string, fallback: T): T => {
    try { const saved = JSON.parse(localStorage.getItem(key) || 'null'); return Array.isArray(saved) ? saved as T : fallback; } catch { return fallback; }
  };
  const [trendItems, setTrendItems] = useState<TrendItem[]>(() => read('vant_custom_trends_v2', DEFAULT_FEATURED_TRENDS));
  const [socialLinks, setSocialLinks] = useState<FooterSocialLink[]>(() => read('vant_social_links_v1', DEFAULT_ACTIVE_FOOTER_LINKS));
  const [masterSizes, setMasterSizes] = useState<MasterSizeItem[]>(() => read(SIZES_STORAGE_KEY, DEFAULT_MASTER_SIZES));
  const current = useRef({ trendItems, socialLinks, masterSizes });
  current.current = { trendItems, socialLinks, masterSizes };
  const queue = useRef(Promise.resolve(true));
  const setters = { trendItems: setTrendItems, socialLinks: setSocialLinks, masterSizes: setMasterSizes };
  const keys = { trendItems: 'vant_custom_trends_v2', socialLinks: 'vant_social_links_v1', masterSizes: SIZES_STORAGE_KEY };
  type Extras = typeof current.current;
  const commit = <K extends keyof Extras>(key: K, transform: (rows: Extras[K]) => Extras[K]): Promise<boolean> => {
    const operation = queue.current.then(async () => {
      try {
        const next = transform(current.current[key]);
        if (key === 'masterSizes' && (next as MasterSizeItem[]).some(row => validateMasterSize(row, next as MasterSizeItem[]))) throw new Error('invalid sizes');
        if (key === 'socialLinks') for (const link of next as FooterSocialLink[]) {
          const url = new URL(link.href);
          if (!['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) || url.username || url.password || !link.name.trim()) throw new Error('invalid link');
        }
        if (supabase && !await saveSiteConfigToSupabase({ [key === 'masterSizes' ? 'sizeGuideRows' : key]: next }, true)) throw new Error('save');
        if (!supabase) localStorage.setItem(keys[key], JSON.stringify(next));
        current.current = { ...current.current, [key]: next };
        (setters[key] as (rows: Extras[K]) => void)(next);
        return true;
      } catch {
        return false;
      }
    });
    queue.current = operation;
    return operation;
  };
  useEffect(() => { try { localStorage.setItem(keys.trendItems, JSON.stringify(trendItems)); } catch {} }, [trendItems]);
  useEffect(() => { try { localStorage.setItem(keys.socialLinks, JSON.stringify(socialLinks)); } catch {} }, [socialLinks]);
  useEffect(() => { try { localStorage.setItem(keys.masterSizes, JSON.stringify(masterSizes)); } catch {} }, [masterSizes]);
  return {
    trendItems, setTrendItems,
    updateTrendItem: (id: string, patch: Partial<TrendItem>) => commit('trendItems', rows => rows.map(row => row.id === id ? { ...row, ...patch } : row)),
    resetTrendsToDefault: () => commit('trendItems', () => DEFAULT_FEATURED_TRENDS),
    socialLinks, setSocialLinks,
    updateSocialLink: (id: string, patch: Partial<FooterSocialLink>) => commit('socialLinks', rows => rows.map(row => row.id === id ? { ...row, ...patch } : row)),
    addSocialLink: (row: FooterSocialLink) => commit('socialLinks', rows => [...rows, row]),
    removeSocialLink: (id: string) => commit('socialLinks', rows => rows.filter(row => row.id !== id)),
    toggleSocialLinkActive: (id: string) => commit('socialLinks', rows => rows.map(row => row.id === id ? { ...row, isActive: !row.isActive } : row)),
    reorderSocialLinks: (rows: FooterSocialLink[]) => commit('socialLinks', () => rows),
    resetSocialLinksToDefault: () => commit('socialLinks', () => DEFAULT_ACTIVE_FOOTER_LINKS),
    masterSizes, setMasterSizes,
    updateMasterSize: (id: string, patch: Partial<MasterSizeItem>) => commit('masterSizes', rows => rows.map(row => row.id === id ? { ...row, ...patch } : row)),
    addMasterSize: (row: Omit<MasterSizeItem, 'id'> & { id?: string }) => commit('masterSizes', rows => [...rows, { ...row, id: row.id || 'size_' + Date.now() }]),
    deleteMasterSize: (id: string) => commit('masterSizes', rows => rows.filter(row => row.id !== id)),
    toggleMasterSize: (id: string) => commit('masterSizes', rows => rows.map(row => row.id === id ? { ...row, enabled: !row.enabled } : row)),
    reorderMasterSizes: (rows: MasterSizeItem[]) => commit('masterSizes', () => rows),
    resetMasterSizesToDefault: () => commit('masterSizes', () => DEFAULT_MASTER_SIZES),
  };
}

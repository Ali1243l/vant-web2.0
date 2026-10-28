import { useSiteControls } from '../context/SiteControlsContext';
import type { Product } from '../types';
import { DEMO_COLOR_PRODUCT } from '../data/demoColorProduct';
import { isSupabaseConfigured } from '../lib/supabase';

export function useProducts(): {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalProductsCount: number;
  error: string | null;
  isLiveDatabase: boolean;
  lastSyncTime: Date | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
} {
  const {
    products,
    loading,
    loadingMore,
    hasMore,
    totalProductsCount,
    error,
    isLiveDatabase,
    lastSyncTime,
    refreshProducts,
    loadMoreProducts,
  } = useSiteControls();

  const showDemo = import.meta.env.DEV && !isSupabaseConfigured && !isLiveDatabase;

  return {
    products: showDemo ? [DEMO_COLOR_PRODUCT, ...products] : products,
    loading,
    loadingMore,
    hasMore,
    totalProductsCount: totalProductsCount + (showDemo ? 1 : 0),
    error,
    isLiveDatabase,
    lastSyncTime,
    refresh: refreshProducts,
    loadMore: loadMoreProducts,
  };
}

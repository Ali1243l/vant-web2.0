import { useMemo } from 'react';
import { useSiteControls } from '../context/SiteControlsContext';
import type { Product } from '../types';
import { DEMO_PRODUCTS } from '../data/demoProducts';

// Test-only: ?demo in the URL appends the demo catalogue for this visit
const IS_DEMO = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo');

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
  const withDemo = useMemo(() => (IS_DEMO ? [...products, ...DEMO_PRODUCTS] : products), [products]);

  return {
    products: withDemo,
    loading,
    loadingMore,
    hasMore,
    totalProductsCount: totalProductsCount + (IS_DEMO ? DEMO_PRODUCTS.length : 0),
    error,
    isLiveDatabase,
    lastSyncTime,
    refresh: refreshProducts,
    loadMore: loadMoreProducts,
  };
}

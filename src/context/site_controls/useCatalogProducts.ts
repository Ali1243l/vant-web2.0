import { mapCatalogProducts as mapSupabaseProducts } from '../../lib/mapCatalogProducts';
import { mergeProducts } from '../../lib/catalogIndex';
import { trackSystemError } from '../../lib/analytics/tracker';
import { saveCatalogProduct } from '../../lib/saveCatalogProduct';
import { fetchCatalogPage } from '../../lib/catalogFetch';
import { useState, useCallback, useRef, useEffect } from 'react';
import type { Product, ProductAvailability } from '../../types';
import { supabase } from '../../lib/supabase';
import { resolveStoredImages } from '../../lib/storage';
import {
  PRODUCTS_STORAGE_KEY,
  getStoredEnhancements,
  saveProductEnhancement,
  removeProductEnhancement,
} from './constants';
import { FALLBACK_CATALOG_PRODUCTS } from './fallbackProducts';

export function useCatalogProducts() {
  const localPreview = import.meta.env.DEV && !supabase;
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (error) { trackSystemError('Catalog cache read failed', '', { kind: 'save', operation: 'catalog-cache' }); }
    return localPreview ? FALLBACK_CATALOG_PRODUCTS : [];
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(() => {
    return products.length;
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isLiveDatabase, setIsLiveDatabase] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const PAGE_SIZE = 12;
  const productsRef = useRef(products); productsRef.current = products;
  const pageBusy = useRef(false);
  const cursor = useRef<{ created_at: string; id: string } | null>(null);
  const generation = useRef(0);
  const recordError = (error: unknown, operation: string) => trackSystemError(error instanceof Error ? error.message : 'Catalog request failed', '', { kind: 'save', operation });

  const loadProductsFromSupabase = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent && !hasLoadedOnceRef.current && productsRef.current.length === 0) {
        setLoading(true);
      }
      setError(null);

      const requestGeneration = ++generation.current;
      const result = await fetchCatalogPage(fetch, supabase, PAGE_SIZE);
      if (requestGeneration !== generation.current) return;
      const fetchedData = result?.data;
      const fetchedCount = result?.count;

      if (fetchedData && (fetchedData.length > 0 || !localPreview)) {
        const mapped = mapSupabaseProducts(fetchedData);
        setProducts(mergeProducts([], mapped));
        const last = fetchedData[fetchedData.length - 1];
        cursor.current = last ? { created_at: last.created_at, id: String(last.id) } : null;
        setTotalProductsCount(fetchedCount || mapped.length);
        setCurrentPage(1);
        setHasMore((fetchedCount ?? mapped.length) > mapped.length);
        setIsLiveDatabase(true);
        setLastSyncTime(new Date());
        hasLoadedOnceRef.current = true;
      } else {
        if (!localPreview) setError('catalog_unavailable');
        // Preserve cached content on failure; demo data belongs to local mode only.
        setHasMore(false);
        setIsLiveDatabase(false);
        setProducts((prev) => (prev.length > 0 ? prev : localPreview ? FALLBACK_CATALOG_PRODUCTS : []));
        setTotalProductsCount((prev) => (prev > 0 ? prev : localPreview ? FALLBACK_CATALOG_PRODUCTS.length : 0));
        hasLoadedOnceRef.current = true;
      }
    } catch (error) {
      recordError(error, 'catalog-refresh');
      if (!localPreview) setError('catalog_unavailable');
      // Keep a cached catalog available when the network fails.
      setHasMore(false);
      setIsLiveDatabase(false);
      setProducts((prev) => (prev.length > 0 ? prev : localPreview ? FALLBACK_CATALOG_PRODUCTS : []));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreProducts = useCallback(async () => {
    if (!supabase || pageBusy.current || !hasMore || !cursor.current) return;
    const after = cursor.current;
    if (!/^[0-9TZ:.+ -]+$/.test(after.created_at) || !/^[a-zA-Z0-9-]{1,80}$/.test(after.id)) { setError('catalog_unavailable'); return; }
    pageBusy.current = true; setLoadingMore(true);
    const requestGeneration = generation.current;
    try {
      const { data, count, error } = await supabase.from('products').select('*, product_media(*)', { count: 'exact' })
        .order('created_at', { ascending: false }).order('id', { ascending: false })
        .or(`created_at.lt.${after.created_at},and(created_at.eq.${after.created_at},id.lt.${after.id})`).limit(PAGE_SIZE);
      if (error) throw error;
      if (requestGeneration !== generation.current) return;
      const mapped = mapSupabaseProducts(data || []);
      setProducts(previous => mergeProducts(previous, mapped));
      const last = data?.[data.length - 1];
      if (last) cursor.current = { created_at: last.created_at, id: String(last.id) };
      setHasMore((count ?? mapped.length) > mapped.length);
      setCurrentPage(previous => previous + 1); setError(null);
    } catch (error) { setError('catalog_unavailable'); recordError(error, 'catalog-page'); }
    finally { pageBusy.current = false; setLoadingMore(false); }
  }, [hasMore]);

  // Realtime refreshes the changed record, rather than resetting the loaded pages.
  useEffect(() => {
    void loadProductsFromSupabase();
    const client = supabase;
    if (!client) return;
    let active = true;
    const update = async (event: any, media = false) => {
      const id = media ? event.new?.product_id || event.old?.product_id : event.new?.id || event.old?.id;
      if (!id) return;
      if (!media && event.eventType === 'DELETE') { setProducts(previous => previous.filter(row => String(row.id) !== String(id))); return; }
      try {
        const { data, error } = await client.from('products').select('*, product_media(*)').eq('id', id).maybeSingle();
        if (error) throw error;
        if (active && data) setProducts(previous => event.eventType === 'INSERT' && !media ? mergeProducts(mapSupabaseProducts([data]), previous.filter(row => String(row.id) !== String(id))) : previous.some(row => String(row.id) === String(id)) ? mergeProducts(previous, mapSupabaseProducts([data])) : previous);
      } catch (error) { recordError(error, 'catalog-realtime'); }
    };
    const channel = client.channel('site_controls_products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, event => { void update(event); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_media' }, event => { void update(event, true); }).subscribe();
    return () => { active = false; void client.removeChannel(channel); };
  }, [loadProductsFromSupabase]);

  // Save products whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      recordError(e, 'catalog-cache');
      console.warn('Failed to save products to localStorage', e);
    }
  }, [products]);

  // CRUD
  const addProduct = async (prodData: Omit<Product, 'id'> & { id?: string | number }): Promise<Product | null> => {
    try {
      let product: Product;
      if (supabase) {
        const saved = await saveCatalogProduct(supabase, null, prodData);
        product = mapSupabaseProducts([saved])[0];
      } else {
        product = { ...prodData, id: prodData.id || crypto.randomUUID(), created_at: new Date().toISOString() };
        saveProductEnhancement(product.id, prodData);
      }
      setProducts(prev => [product, ...prev.filter(item => String(item.id) !== String(product.id))]);
      return product;
    } catch (error) {
      recordError(error, 'product-save');
      console.warn('Product save failed:', error instanceof Error ? error.message : 'save');
      return null;
    }
  };

  const updateProduct = async (id: string | number, updates: Partial<Product>): Promise<boolean> => {
    try {
      if (supabase) {
        const saved = await saveCatalogProduct(supabase, id, updates);
        const product = mapSupabaseProducts([saved])[0];
        setProducts(prev => prev.map(item => String(item.id) === String(id) ? product : item));
      } else {
        saveProductEnhancement(id, updates);
        setProducts(prev => prev.map(item => String(item.id) === String(id) ? { ...item, ...updates } : item));
      }
      return true;
    } catch (error) {
      console.warn('Product update failed:', error instanceof Error ? error.message : 'save');
      return false;
    }
  };

  const deleteProduct = (id: string | number) => {
    removeProductEnhancement(id);
    setProducts((prev) => prev.filter((item) => String(item.id) !== String(id)));

    if (supabase) {
      (async () => {
        try {
          await supabase.from('product_media').delete().eq('product_id', id);
          await supabase.from('products').delete().eq('id', id);
          await loadProductsFromSupabase(true);
        } catch (e) {
          console.error('Failed to delete product from Supabase:', e);
        }
      })();
    }
  };

  const toggleProductAvailability = (id: string | number, status?: ProductAvailability) => {
    if (status) {
      updateProduct(id, { availability: status });
    } else {
      const current = products.find((p) => String(p.id) === String(id));
      if (!current) return;
      const nextStatus: ProductAvailability =
        current.availability === 'in_stock'
          ? 'limited'
          : current.availability === 'limited'
          ? 'coming_soon'
          : current.availability === 'coming_soon'
          ? 'sold_out'
          : 'in_stock';
      updateProduct(id, { availability: nextStatus });
    }
  };

  const resetProductsToDefault = () => {
    loadProductsFromSupabase();
  };

  const importProductsJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setProducts(parsed);
        return true;
      }
    } catch (error) { recordError(error, 'catalog-import'); }
    return false;
  };

  return {
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
  };
}

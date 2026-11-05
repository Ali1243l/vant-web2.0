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
    } catch {}
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

  const mapSupabaseProducts = (data: any[]): Product[] => {
    const enhancements = resolveStoredImages(getStoredEnhancements());
    return resolveStoredImages(data || []).map((p) => {
      const pIdStr = String(p.id);
      const enh = { ...(enhancements[pIdStr] || {}), ...(p.admin_metadata || {}) };
      const statusStr = String(p.status || '').toUpperCase();
      let availability: ProductAvailability = 'in_stock';
      if (statusStr === 'SOLD_OUT' || statusStr === 'OUT_OF_STOCK') {
        availability = 'sold_out';
      } else if (statusStr === 'COMING_SOON') {
        availability = 'coming_soon';
      } else if (statusStr === 'LIMITED') {
        availability = 'limited';
      }

      const rawMedia = p.product_media || [];
      const sortedMedia = Array.isArray(rawMedia)
        ? [...rawMedia].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        : [];
      const mediaUrls = sortedMedia.map((m: any) => m.media_url).filter(Boolean);

      const defaultImg =
        enh.image_url ||
        mediaUrls[0] ||
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80';
      const imagesList = enh.images && enh.images.length > 0 ? enh.images : mediaUrls.length > 0 ? mediaUrls : [defaultImg];

      return {
        id: p.id,
        title: p.title || enh.title_ar || 'قطعة فاخرة',
        title_ar: enh.title_ar || p.title || 'قطعة فاخرة',
        price: typeof p.price === 'number' ? p.price : parseFloat(p.price || 0),
        original_price: typeof enh.original_price === 'number' ? enh.original_price : undefined,
        is_offer: enh.is_offer ?? Boolean(p.is_exclusive_drop),
        offer_badge_ar: enh.offer_badge_ar || undefined,
        offer_badge_en: enh.offer_badge_en || undefined,
        category: p.category || 'Tailoring',
        category_ar: enh.category_ar || p.category || 'الأزياء الرسمية',
        description: p.description || '',
        description_ar: enh.description_ar ?? p.description ?? '',
        material: p.material || '',
        fit_details: p.fit_details || 'قصة إيطالية سليم فيت محددة بدقة',
        availability,
        sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'],
        catalog_image: enh.catalog_image ?? p.catalog_image,
        image_url: defaultImg,
        images: imagesList,
        colors: enh.colors ?? p.colors,
        variants: enh.variants ?? p.variants,
        sku: enh.sku ?? p.sku,
        stock: enh.stock ?? p.stock,
        created_at: p.created_at,
        tags: enh.tags || [],
      };
    });
  };

  const loadProductsFromSupabase = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent && !hasLoadedOnceRef.current && products.length === 0) {
        setLoading(true);
      }
      setError(null);

      const result = await fetchCatalogPage(fetch, supabase, PAGE_SIZE);
      const fetchedData = result?.data;
      const fetchedCount = result?.count;

      if (fetchedData && (fetchedData.length > 0 || !localPreview)) {
        const mapped = mapSupabaseProducts(fetchedData);
        setProducts(mapped);
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
    } catch {
      if (!localPreview) setError('catalog_unavailable');
      // Keep a cached catalog available when the network fails.
      setHasMore(false);
      setIsLiveDatabase(false);
      setProducts((prev) => (prev.length > 0 ? prev : localPreview ? FALLBACK_CATALOG_PRODUCTS : []));
    } finally {
      setLoading(false);
    }
  }, [products.length]);

  const loadMoreProducts = useCallback(async () => {
    if (!supabase || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const start = currentPage * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data, count, error: sbError } = await supabase
        .from('products')
        .select('*, product_media(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (sbError) {
        if (!sbError.message.includes('Failed to fetch')) {
          console.warn('Supabase pagination fetch info:', sbError.message);
        }
      } else {
        const mapped = mapSupabaseProducts(data || []);
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => String(p.id)));
          const uniqueNew = mapped.filter((p) => !existingIds.has(String(p.id)));
          return [...prev, ...uniqueNew];
        });
        setCurrentPage((prev) => prev + 1);
        setHasMore(start + mapped.length < (count || 0));
      }
    } catch (err: any) {
      if (!err?.message?.includes('Failed to fetch')) {
        console.warn('Pagination fetch fallback:', err?.message);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore]);

  // Realtime subscription setup
  useEffect(() => {
    loadProductsFromSupabase();
    const client = supabase;
    if (client) {
      const channel = client
        .channel('site_controls_products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          loadProductsFromSupabase(true);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'product_media' }, () => {
          loadProductsFromSupabase(true);
        })
        .subscribe();
      return () => {        client.removeChannel(channel);
      };
    }
  }, [loadProductsFromSupabase]);

  // Save products whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
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
    } catch {}
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

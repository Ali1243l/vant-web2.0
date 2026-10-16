import { useState, useCallback, useRef, useEffect } from 'react';
import type { Product, ProductAvailability } from '../../types';
import { supabase } from '../../lib/supabase';
import { uploadDataUrlToSupabase } from '../../lib/storage';
import {
  PRODUCTS_STORAGE_KEY,
  getStoredEnhancements,
  saveProductEnhancement,
  removeProductEnhancement,
} from './constants';

export function useCatalogProducts() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => products.length === 0 && !!supabase);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
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
    const enhancements = getStoredEnhancements();
    return (data || []).map((p) => {
      const pIdStr = String(p.id);
      const enh = enhancements[pIdStr] || {};
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
        title: enh.title_ar || p.title || 'قطعة فاخرة',
        title_ar: enh.title_ar || p.title || 'قطعة فاخرة',
        price: typeof p.price === 'number' ? p.price : parseFloat(p.price || 0),
        original_price: enh.original_price,
        is_offer: enh.is_offer ?? Boolean(p.is_exclusive_drop),
        offer_badge_ar: enh.offer_badge_ar,
        offer_badge_en: enh.offer_badge_en,
        category: p.category || 'Tailoring',
        category_ar: enh.category_ar || p.category || 'الأزياء الرسمية',
        description: p.description || '',
        description_ar: p.description || '',
        material: p.material || 'صوف كشمير إيطالي',
        fit_details: p.fit_details || 'قصة إيطالية سليم فيت محددة بدقة',
        availability,
        sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'],
        image_url: defaultImg,
        images: imagesList,
        created_at: p.created_at,
        tags: enh.tags || [],
      };
    });
  };

  // Refetch keeps every page the customer already loaded, so a background sync never snaps the list back to page 1
  const loadedCountRef = useRef(products.length);
  loadedCountRef.current = products.length;

  const loadProductsFromSupabase = useCallback(async (isSilent = false) => {
    if (!supabase) {
      hasLoadedOnceRef.current = true;
      setHasMore(false);
      return;
    }
    try {
      if (!isSilent && !hasLoadedOnceRef.current && loadedCountRef.current === 0) {
        setLoading(true);
      }
      setError(null);

      const pages = Math.max(1, Math.ceil(loadedCountRef.current / PAGE_SIZE));
      const { data, count, error: sbError } = await supabase
        .from('products')
        .select('*, product_media(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, pages * PAGE_SIZE - 1);

      if (sbError) {
        // Network or policy failure: keep whatever is cached instead of blanking the shop
        if (!sbError.message.includes('Failed to fetch')) {
          console.warn('Supabase catalog response info:', sbError.message);
        }
        setHasMore(false);
        return;
      }

      const mapped = mapSupabaseProducts(data || []);
      const total = count ?? mapped.length;
      setProducts(mapped);
      setTotalProductsCount(total);
      setCurrentPage(pages);
      setHasMore(total > mapped.length);
      setIsLiveDatabase(true);
      setLastSyncTime(new Date());
    } catch (clientErr: any) {
      if (!clientErr?.message?.includes('Failed to fetch')) {
        console.warn('Direct Supabase fetch fallback to local cache:', clientErr?.message);
      }
      setHasMore(false);
    } finally {
      hasLoadedOnceRef.current = true;
      setLoading(false);
    }
  }, []);

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
        setHasMore(false); // stop auto-loading from retrying in a loop; the next sync turns it back on
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
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore]);

  // For shared ?item= links to products beyond the first page
  const fetchProductById = useCallback(async (id: string): Promise<Product | null> => {
    if (!supabase) return null;
    const { data, error: sbError } = await supabase
      .from('products')
      .select('*, product_media(*)')
      .eq('id', id)
      .maybeSingle();
    return !sbError && data ? mapSupabaseProducts([data])[0] : null;
  }, []);

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
  const addProduct = (prodData: Omit<Product, 'id'> & { id?: string | number }): Product => {
    const tempId = prodData.id || `temp-${Date.now()}`;
    const newProduct: Product = {
      ...prodData,
      id: tempId,
      availability: prodData.availability || 'in_stock',
      sizes: prodData.sizes && prodData.sizes.length > 0 ? prodData.sizes : ['S', 'M', 'L', 'XL'],
      created_at: prodData.created_at || new Date().toISOString(),
    };

    saveProductEnhancement(tempId, {
      title_ar: prodData.title_ar,
      category_ar: prodData.category_ar,
      is_offer: prodData.is_offer,
      original_price: prodData.original_price,
      offer_badge_ar: prodData.offer_badge_ar,
      offer_badge_en: prodData.offer_badge_en,
      tags: prodData.tags,
      image_url: prodData.image_url,
      images: prodData.images,
    });

    setProducts((prev) => [newProduct, ...prev]);

    if (supabase) {
      (async () => {
        try {
          const status =
            prodData.availability === 'sold_out'
              ? 'SOLD_OUT'
              : prodData.availability === 'coming_soon'
              ? 'COMING_SOON'
              : prodData.availability === 'limited'
              ? 'LIMITED'
              : 'AVAILABLE';

          const { data: inserted, error: insErr } = await supabase
            .from('products')
            .insert({
              title: prodData.title_ar || prodData.title,
              price: prodData.price,
              category: prodData.category || 'Tailoring',
              description: prodData.description_ar || prodData.description || '',
              material: prodData.material || '',
              fit_details: prodData.fit_details || '',
              sizes: prodData.sizes || ['S', 'M', 'L', 'XL'],
              status,
              is_exclusive_drop: Boolean(prodData.is_offer),
            })
            .select('id')
            .single();

          if (insErr) {
            console.error('Error inserting product to Supabase:', insErr.message);
          } else if (inserted) {
            saveProductEnhancement(inserted.id, {
              title_ar: prodData.title_ar,
              category_ar: prodData.category_ar,
              is_offer: prodData.is_offer,
              original_price: prodData.original_price,
              offer_badge_ar: prodData.offer_badge_ar,
              offer_badge_en: prodData.offer_badge_en,
              tags: prodData.tags,
              image_url: prodData.image_url,
              images: prodData.images,
            });

            const imagesList =
              Array.isArray(prodData.images) && prodData.images.length > 0
                ? prodData.images.filter(Boolean)
                : prodData.image_url
                ? [prodData.image_url]
                : [];

            if (imagesList.length > 0) {
              const safeMediaUrls: string[] = [];
              for (const u of imagesList) {
                if (typeof u === 'string' && u.startsWith('data:')) {
                  const uploaded = await uploadDataUrlToSupabase(u, 'catalog', 'media');
                  safeMediaUrls.push(uploaded);
                } else if (typeof u === 'string' && u.trim()) {
                  safeMediaUrls.push(u.trim());
                }
              }

              const mediaRows = safeMediaUrls.map((url, idx) => ({
                product_id: inserted.id,
                media_url: url,
                display_order: idx + 1,
              }));

              const { error: mediaErr } = await supabase.from('product_media').insert(mediaRows);
              if (mediaErr) {
                console.error('Error inserting media rows to Supabase:', mediaErr.message);
              }
            }
            await loadProductsFromSupabase(true);
          }
        } catch (e) {
          console.error('Failed to save product to Supabase:', e);
        }
      })();
    }

    return newProduct;
  };

  const updateProduct = (id: string | number, updates: Partial<Product>) => {
    // Only fields this update names: a partial update (e.g. availability) must not wipe the saved title or photos
    const enhancementKeys = ['title_ar', 'category_ar', 'is_offer', 'original_price', 'offer_badge_ar', 'offer_badge_en', 'tags', 'image_url', 'images'] as const;
    saveProductEnhancement(
      id,
      Object.fromEntries(enhancementKeys.filter((k) => k in updates).map((k) => [k, updates[k]]))
    );

    setProducts((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, ...updates } : item))
    );

    if (supabase) {
      (async () => {
        try {
          const dbUpdates: Record<string, any> = {};
          if (updates.title !== undefined) dbUpdates.title = updates.title;
          if (updates.price !== undefined) dbUpdates.price = updates.price;
          if (updates.category !== undefined) dbUpdates.category = updates.category;
          if (updates.description !== undefined) dbUpdates.description = updates.description;
          if (updates.material !== undefined) dbUpdates.material = updates.material;
          if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes;
          if (updates.is_offer !== undefined) dbUpdates.is_exclusive_drop = updates.is_offer;
          if (updates.availability !== undefined) {
            dbUpdates.status =
              updates.availability === 'sold_out'
                ? 'SOLD_OUT'
                : updates.availability === 'coming_soon'
                ? 'COMING_SOON'
                : updates.availability === 'limited'
                ? 'LIMITED'
                : 'AVAILABLE';
          }

          if (Object.keys(dbUpdates).length > 0) {
            await supabase.from('products').update(dbUpdates).eq('id', id);
          }

          const updatedImages =
            Array.isArray(updates.images) && updates.images.length > 0
              ? updates.images.filter(Boolean)
              : updates.image_url
              ? [updates.image_url]
              : null;

          if (updatedImages && updatedImages.length > 0) {
            await supabase.from('product_media').delete().eq('product_id', id);
            const safeMediaUrls: string[] = [];
            for (const u of updatedImages) {
              if (typeof u === 'string' && u.startsWith('data:')) {
                const uploaded = await uploadDataUrlToSupabase(u, 'catalog', 'media');
                safeMediaUrls.push(uploaded);
              } else if (typeof u === 'string' && u.trim()) {
                safeMediaUrls.push(u.trim());
              }
            }

            const mediaRows = safeMediaUrls.map((url, idx) => ({
              product_id: id,
              media_url: url,
              display_order: idx + 1,
            }));

            await supabase.from('product_media').insert(mediaRows);
          } else if (updates.image_url) {
            const { data: media } = await supabase
              .from('product_media')
              .select('id')
              .eq('product_id', id)
              .order('display_order', { ascending: true })
              .limit(1);

            if (media && media.length > 0) {
              await supabase
                .from('product_media')
                .update({ media_url: updates.image_url })
                .eq('id', media[0].id);
            } else {
              await supabase.from('product_media').insert({
                product_id: id,
                media_url: updates.image_url,
                display_order: 1,
              });
            }
          }
          loadProductsFromSupabase(true);
        } catch (e) {
          console.error('Failed to update product in Supabase:', e);
        }
      })();
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
    fetchProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    resetProductsToDefault,
    importProductsJSON,
  };
}

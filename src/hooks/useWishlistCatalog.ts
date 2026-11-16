import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { mapCatalogProducts } from '../lib/mapCatalogProducts';
import { mergeProducts } from '../lib/catalogIndex';
import { trackSystemError } from '../lib/analytics/tracker';
import type { Product } from '../types';

export function useWishlistCatalog(ids: string[], active: boolean, cached: Product[]) {
  const [products, setProducts] = useState<Product[]>([]), [error, setError] = useState(false);
  const key = JSON.stringify(ids);
  useEffect(() => {
    if (!active || !supabase || !ids.length) return;
    let current = true;
    void (async () => {
      try {
        let rows: Product[] = [];
        for (let offset = 0; offset < ids.length; offset += 100) {
          const result = await supabase!.from('products').select('*,product_media(*)').in('id', ids.slice(offset, offset + 100));
          if (result.error) throw result.error;
          rows = mergeProducts(rows, mapCatalogProducts(result.data || []));
        }
        if (current) { setProducts(rows); setError(false); }
      } catch (reason) { if (current) setError(true); trackSystemError(reason instanceof Error ? reason.message : 'Wishlist refresh failed', '', { kind: 'save', operation: 'wishlist-catalog' }); }
    })();
    return () => { current = false; };
  }, [active, key]);
  const selected = useMemo(() => { const index = new Set(ids); return (error || !supabase ? cached : products).filter(row => index.has(String(row.id))); }, [ids, cached, products, error]);
  return { products: selected, error };
}

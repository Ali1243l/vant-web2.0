import { useCallback, useMemo } from 'react';
import { useShopper } from './useShopper';
export function useWishlist() {
  const { wishlist: ids, store } = useShopper();
  const wishlist = useMemo(() => [...ids], [ids]);
  const isWishlisted = useCallback((id: string | number) => ids.has(String(id)), [ids]);
  const toggleWishlist = useCallback((id: string | number) => store.toggleWishlist(String(id)), [store]);
  return { wishlist, wishlistCount: ids.size, isWishlisted, toggleWishlist };
}

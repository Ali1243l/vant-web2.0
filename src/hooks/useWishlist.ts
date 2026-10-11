import { useState, useEffect, useCallback } from 'react';
import { safeStorage } from '../utils/safeStorage';

const STORAGE_KEY = 'vant_wishlist';
const EVENT_NAME = 'vant-wishlist-update';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(() => 
    safeStorage.getItemJSON<string[]>(STORAGE_KEY, [])
  );

  useEffect(() => {
    const handleSync = () => {
      setWishlist(safeStorage.getItemJSON<string[]>(STORAGE_KEY, []));
    };

    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const isWishlisted = useCallback(
    (id: string | number) => wishlist.includes(String(id)),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (id: string | number) => {
      const idStr = String(id);
      setWishlist((prev) => {
        const next = prev.includes(idStr) ? prev.filter((item) => item !== idStr) : [...prev, idStr];
        safeStorage.setItemJSON(STORAGE_KEY, next);
        window.dispatchEvent(new Event(EVENT_NAME));
        return next;
      });
    },
    []
  );

  return {
    wishlist,
    wishlistCount: wishlist.length,
    isWishlisted,
    toggleWishlist,
  };
}

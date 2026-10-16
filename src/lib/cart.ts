import { useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  /** One cart line per product + size + color */
  key: string;
  productId?: string | number;
  title: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

const ITEMS_KEY = 'vant_cart_items';
const COUNT_KEY = 'vant_cart_count';

export const cartLineKey = (productId: string | number, size?: string | null, color?: string) =>
  `${productId}|${size || ''}|${color || ''}`;

export function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    const items: CartItem[] = raw ? JSON.parse(raw) : [];
    // Lines saved before the key/price fix have no trustworthy price: drop them rather than charge a guessed amount
    return items.filter((i) => i && i.key && typeof i.price === 'number' && i.quantity > 0);
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    localStorage.setItem(COUNT_KEY, count.toString());
  } catch {}
  window.dispatchEvent(new CustomEvent('vant-cart-update', { detail: { count, items } }));
}

export const cartTotal = (items: CartItem[]) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export function useCartCount() {
  const [count, setCount] = useState(() => readCart().reduce((sum, i) => sum + i.quantity, 0));
  useEffect(() => {
    const onUpdate = () => setCount(readCart().reduce((sum, i) => sum + i.quantity, 0));
    window.addEventListener('vant-cart-update', onUpdate);
    return () => window.removeEventListener('vant-cart-update', onUpdate);
  }, []);
  return count;
}

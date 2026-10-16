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

/** Adds one unit, merging into the existing line for the same product + size + color */
export function addToCart(line: Omit<CartItem, 'id' | 'key' | 'quantity'>) {
  const key = cartLineKey(line.productId ?? line.title, line.size, line.color);
  const items = readCart();
  const existing = items.find((i) => i.key === key);
  if (existing) existing.quantity += 1;
  else items.push({ ...line, id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, key, quantity: 1 });
  writeCart(items);
  window.dispatchEvent(new CustomEvent('vant-cart-bounce'));
}

export interface PastOrder {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
}

const ORDERS_KEY = 'vant_past_orders';

/** Orders sent from this device, newest first (kept locally; the shop's record is the WhatsApp chat) */
export function readOrders(): PastOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const orders: PastOrder[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(orders) ? orders.filter((o) => o && Array.isArray(o.items)) : [];
  } catch {
    return [];
  }
}

export function saveOrder(items: CartItem[]) {
  const order: PastOrder = { id: `VNT-${Date.now().toString(36).toUpperCase()}`, date: new Date().toISOString(), items, total: cartTotal(items) };
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...readOrders()].slice(0, 20)));
  } catch {}
  return order;
}

/** Puts a past order's lines back in the cart, merging with what is already there */
export function reorder(order: PastOrder) {
  const items = readCart();
  for (const line of order.items) {
    const existing = items.find((i) => i.key === line.key);
    if (existing) existing.quantity += line.quantity;
    else items.push({ ...line });
  }
  writeCart(items);
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

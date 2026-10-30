export interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export function cartItemId(productId: string | number, size = '', color = ''): string {
  return JSON.stringify([String(productId), size, color]);
}

export function changeCartQuantity(items: CartItem[], item: CartItem, delta: number): CartItem[] {
  const existing = items.find((entry) => entry.id === item.id);
  const quantity = (existing?.quantity ?? 0) + delta;
  if (!Number.isSafeInteger(quantity) || quantity > 99) throw new Error('quantity');
  const remaining = items.filter((entry) => entry.id !== item.id);
  return quantity > 0 ? [...remaining, { ...item, quantity }] : remaining;
}

export function readCart(): CartItem[] {
  try {
    const value = JSON.parse(localStorage.getItem('vant_cart_items') || '[]');
    return Array.isArray(value) ? value.filter((item) => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.image === 'string' && Number.isFinite(item.price) && item.price >= 0 && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[], storage: Pick<Storage, 'setItem'> = localStorage): number {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  storage.setItem('vant_cart_items', JSON.stringify(items));
  // The item list is authoritative; the count is a compatibility cache.
  try { storage.setItem('vant_cart_count', String(count)); } catch {}
  return count;
}

export function resolveWhatsAppPhone(configured: string | undefined, fallback: string): string {
  return configured?.replace(/\D/g, '') || fallback.replace(/\D/g, '');
}

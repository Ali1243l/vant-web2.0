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
  const remaining = items.filter((entry) => entry.id !== item.id);
  return quantity > 0 ? [...remaining, { ...item, quantity }] : remaining;
}

export function readCart(): CartItem[] {
  try {
    const value = JSON.parse(localStorage.getItem('vant_cart_items') || '[]');
    return Array.isArray(value) ? value.filter((item) => item && typeof item.id === 'string' && Number.isFinite(item.price) && item.price >= 0 && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function resolveWhatsAppPhone(configured: string | undefined, fallback: string): string {
  return configured?.replace(/\D/g, '') || fallback.replace(/\D/g, '');
}

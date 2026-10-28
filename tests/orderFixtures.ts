import type { Order } from '../src/admin/useAdminBridge';

// In-memory fixtures only: never passed to the order provider or persistence layer.
export function createDemoOrders(): Order[] {
  return Array.from({ length: 12 }, (_, index) => ({
    id: `DEMO-${String(index + 1).padStart(3, '0')}`,
    customerName: `عميل تجريبي ${index + 1}`, customerPhone: '', customerEmail: '', shippingAddress: 'عنوان وهمي للتجربة فقط',
    orderDate: new Date(Date.now() - index * 86400000).toISOString(),
    totalPrice: 25000 + index * 5000,
    status: (['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'] as const)[index % 5],
    type: index % 3 === 0 ? 'bespoke' : 'ready_to_wear',
    items: [{ productId: 'demo-shirt', name: 'تيشيرت فانت التجريبي', nameEn: 'VANT demo shirt', imageUrl: '', price: 25000 + index * 5000, quantity: 1, selectedSize: index % 2 ? 'L' : 'M' }],
    timeline: [], paymentMethod: 'تجريبي — لا يوجد دفع',
    ...(index % 3 === 0 ? { bespokeDetails: { artisanNotes: 'ملاحظة تجريبية قابلة للتعديل' } } : {}),
  }));
}

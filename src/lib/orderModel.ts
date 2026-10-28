import type { Order, OrderStatus } from '../admin/useAdminBridge';

export const orderStatuses: OrderStatus[] = ['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'];
export const orderStatusLabels: Record<OrderStatus, { ar: string; en: string }> = {
  pending_payment: { ar: 'بانتظار التأكيد', en: 'Pending confirmation' },
  processing: { ar: 'قيد التجهيز', en: 'Processing' },
  shipped: { ar: 'تم الشحن', en: 'Shipped' },
  delivered: { ar: 'تم التسليم', en: 'Delivered' },
  cancelled: { ar: 'ملغي', en: 'Cancelled' },
};

const array = (value: unknown): any[] => {
  try { const parsed = typeof value === 'string' ? JSON.parse(value) : value; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
};

export function normalizeOrders(value: unknown): Order[] {
  const rows = new Map<string, Order>();
  for (const raw of array(value)) {
    if (!raw || typeof raw !== 'object') continue;
    const id = String(raw.id ?? raw.order_id ?? raw.code ?? '').trim();
    const totalPrice = Number(raw.totalPrice ?? raw.total_price ?? raw.total ?? raw.amount);
    const status = raw.status;
    if (!id || !orderStatuses.includes(status) || !Number.isFinite(totalPrice) || totalPrice < 0) continue;
    const date = String(raw.orderDate ?? raw.created_at ?? raw.order_date ?? '');
    const details = raw.bespokeDetails ?? raw.bespoke_details;
    rows.set(id, {
      id, totalPrice, status, orderDate: Number.isFinite(Date.parse(date)) ? date : '',
      customerName: String(raw.customerName ?? raw.customer_name ?? raw.name ?? ''),
      customerPhone: String(raw.customerPhone ?? raw.customer_phone ?? raw.phone ?? ''),
      customerEmail: String(raw.customerEmail ?? raw.customer_email ?? raw.email ?? ''),
      shippingAddress: String(raw.shippingAddress ?? raw.shipping_address ?? raw.address ?? ''),
      type: raw.type === 'bespoke' ? 'bespoke' : 'ready_to_wear',
      isVip: raw.isVip === true || raw.is_vip === true,
      paymentMethod: String(raw.paymentMethod ?? raw.payment_method ?? ''),
      trackingNumber: String(raw.trackingNumber ?? raw.tracking_number ?? ''),
      bespokeDetails: details && typeof details === 'object' && !Array.isArray(details) ? {
        artisanNotes: String(details.artisanNotes ?? ''), fabricSelection: String(details.fabricSelection ?? ''),
        fittingDate: String(details.fittingDate ?? ''), atelierMaster: String(details.atelierMaster ?? ''),
        ...(details.clientMeasurements && typeof details.clientMeasurements === 'object' && !Array.isArray(details.clientMeasurements)
          ? { clientMeasurements: Object.fromEntries(Object.entries(details.clientMeasurements).map(([key, value]) => [key, String(value ?? '')])) } : {}),
      } : undefined,
      timeline: array(raw.timeline).filter(event => event && orderStatuses.includes(event.status) && Number.isFinite(Date.parse(event.timestamp))).map(event => ({ ...event, title: String(event.title || ''), titleEn: String(event.titleEn || ''), note: String(event.note || '') })),
      items: array(raw.items).filter(item => item && Number.isInteger(Number(item.quantity ?? item.qty)) && Number(item.quantity ?? item.qty) > 0 && Number.isFinite(Number(item.price)) && Number(item.price) >= 0).map(item => ({
        productId: String(item.productId ?? item.product_id ?? ''), name: String(item.name ?? item.title_ar ?? item.title ?? ''), nameEn: String(item.nameEn ?? item.title_en ?? item.name ?? ''),
        imageUrl: String(item.imageUrl ?? item.image_url ?? ''), price: Number(item.price), quantity: Number(item.quantity ?? item.qty), selectedSize: String(item.selectedSize ?? item.size ?? ''), fabricOption: String(item.fabricOption ?? ''),
      })),
    });
  }
  return [...rows.values()];
}

export function filterOrders(orders: Order[], filters: { query: string; type: string; status: string; from?: Date; to?: Date; sort: string }): Order[] {
  const query = filters.query.trim().toLowerCase().replace(/[٠-٩۰-۹]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.includes(digit) ? '٠١٢٣٤٥٦٧٨٩'.indexOf(digit) : '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
  return orders.filter(order => {
    if (filters.type !== 'all' && order.type !== filters.type) return false;
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.from) {
      const time = Date.parse(order.orderDate);
      const from = new Date(filters.from); from.setHours(0, 0, 0, 0);
      const to = new Date(filters.to || filters.from); to.setHours(24, 0, 0, 0);
      if (!Number.isFinite(time) || time < +from || time >= +to) return false;
    }
    const text = [order.id, order.customerName, order.customerPhone, ...order.items.flatMap(item => [item.name, item.nameEn])].join(' ').toLowerCase();
    return !query || text.includes(query);
  }).sort((a, b) => filters.sort === 'value' ? b.totalPrice - a.totalPrice : filters.sort === 'oldest' ? (Date.parse(a.orderDate) || 0) - (Date.parse(b.orderDate) || 0) : (Date.parse(b.orderDate) || 0) - (Date.parse(a.orderDate) || 0));
}

export function orderMetrics(orders: Order[]) {
  return { total: orders.length, pending: orders.filter(order => order.status === 'pending_payment').length, processing: orders.filter(order => order.status === 'processing').length, delivered: orders.filter(order => order.status === 'delivered').length, cancelled: orders.filter(order => order.status === 'cancelled').length, revenue: orders.filter(order => order.status === 'delivered').reduce((sum, order) => sum + order.totalPrice, 0) };
}

export function allowedOrderStatuses(status: OrderStatus): OrderStatus[] {
  if (status === 'delivered' || status === 'cancelled') return [];
  return [({ pending_payment: 'processing', processing: 'shipped', shipped: 'delivered' } as const)[status], 'cancelled'];
}

export function transitionOrder(order: Order, status: OrderStatus, note = '', now = new Date().toISOString()): Order {
  if (!allowedOrderStatuses(order.status).includes(status)) throw new Error('Invalid order transition');
  if (status === 'cancelled' && !note.trim()) throw new Error('Cancellation reason required');
  return { ...order, status, timeline: [...order.timeline, { status, title: orderStatusLabels[status].ar, titleEn: orderStatusLabels[status].en, timestamp: now, note: note.trim() }] };
}

export const escapeOrderText = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

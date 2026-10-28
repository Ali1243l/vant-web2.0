import type { Product, Order } from '../useAdminBridge';
import type { DatasetPeriod, CategoryShareItem, RecentOrderItem, TimeRange } from './types';

export const DAY_MS = 86_400_000;
export const orderTime = (order: any) => Date.parse(order.orderDate || order.createdAt || order.created_at || '');
export const orderAmount = (order: any) => Number(order.totalPrice ?? order.total_price);
export interface AnalyticsWindow { startTime: number; endTime: number }

export function validAnalyticsOrders(orders: any[], now = Date.now()) {
  const unique = new Map<string, any>();
  for (const order of orders || []) {
    if (!order?.id || order.is_demo || order.isSimulation || order.status === 'cancelled') continue;
    if (!['pending_payment', 'processing', 'shipped', 'delivered'].includes(order.status)) continue;
    if (!Number.isFinite(orderTime(order)) || orderTime(order) > now || !Number.isFinite(orderAmount(order)) || orderAmount(order) < 0) continue;
    unique.set(String(order.id), order);
  }
  return [...unique.values()];
}

export function periodBounds(period: TimeRange, from = '', to = '', now = Date.now()): AnalyticsWindow {
  const end = new Date(now); end.setHours(24, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - ({ '7d': 7, '30d': 30, '90d': 90, year: 365, custom: 30 }[period]));
  if (period === 'custom') {
    if (from) start.setTime(Date.parse(`${from}T00:00:00`));
    if (to) { end.setTime(Date.parse(`${to}T00:00:00`)); end.setDate(end.getDate() + 1); }
  }
  if (!Number.isFinite(+start) || !Number.isFinite(+end) || +start >= +end) return { startTime: 0, endTime: 0 };
  return { startTime: +start, endTime: +end };
}

export function ordersInWindow(orders: any[], window: AnalyticsWindow, now = Date.now()) {
  return validAnalyticsOrders(orders, now).filter(order => orderTime(order) >= window.startTime && orderTime(order) < window.endTime);
}

export function computeDatasets(orders: Order[], isAr: boolean, from: string, to: string): Record<string, DatasetPeriod> {
  const now = Date.now();
  const valid = validAnalyticsOrders(orders, now);
  const summarize = (rows: any[]) => {
    const delivered = rows.filter(order => order.status === 'delivered');
    const revenue = delivered.reduce((sum, order) => sum + orderAmount(order), 0);
    return { revenue, count: rows.length, delivered: delivered.length, aov: delivered.length ? Math.round(revenue / delivered.length) : 0 };
  };
  return Object.fromEntries((['7d', '30d', '90d', 'year', 'custom'] as TimeRange[]).map(period => {
    const bounds = periodBounds(period, from, to, now);
    const span = bounds.endTime - bounds.startTime;
    const current = ordersInWindow(valid, bounds, now);
    const previous = ordersInWindow(valid, { startTime: bounds.startTime - span, endTime: bounds.startTime }, now);
    const stats = summarize(current), prev = summarize(previous);
    const growthVal = prev.revenue > 0 ? Math.round((stats.revenue - prev.revenue) / prev.revenue * 100) : stats.revenue === 0 ? 0 : null;
    const count = period === '7d' ? 7 : period === 'year' ? 12 : period === 'custom' ? Math.max(1, Math.min(12, Math.ceil(span / DAY_MS))) : 6;
    const dateLabel = (time: number, locale: string) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', numberingSystem: 'latn' }).format(time);
    const points = Array.from({ length: count }, (_, index) => {
      const start = bounds.startTime + Math.floor(span * index / count);
      const end = bounds.startTime + Math.floor(span * (index + 1) / count);
      const bucket = summarize(current.filter(order => orderTime(order) >= start && orderTime(order) < end));
      return { labelAr: dateLabel(start, 'ar-IQ'), labelEn: dateLabel(start, 'en-GB'), sales: bucket.revenue, orders: bucket.count };
    });
    return [period, {
      ...bounds, deliveredOrders: stats.delivered,
      titleAr: 'إيراد الطلبات المسلّمة', titleEn: 'Delivered order revenue',
      subAr: 'الإيراد للطلبات المسلّمة فقط؛ عدد الطلبات يستبعد الملغي. أعمدة الرسم تطابق الفترة المختارة.',
      subEn: 'Revenue counts delivered orders; order counts exclude cancellations. Buckets match the selected period.',
      peakAr: `${stats.delivered} طلب مسلّم خلال الفترة`, peakEn: `${stats.delivered} delivered orders in this period`,
      growth: growthVal === null ? (isAr ? 'لا توجد فترة سابقة للمقارنة' : 'No prior revenue to compare') : `${growthVal > 0 ? '+' : ''}${growthVal}%`,
      growthVal, points, totalRevenue: stats.revenue, totalOrders: stats.count, avgAov: stats.aov,
      prevRevenue: prev.revenue, prevOrders: prev.count, prevAov: prev.aov,
    }];
  }));
}

export function computeCategoriesShare(products: Product[], orders: Order[], isAr: boolean, window?: AnalyticsWindow): CategoryShareItem[] {
  const rows = window ? ordersInWindow(orders, window) : validAnalyticsOrders(orders);
  const totals = new Map<string, number>();
  for (const order of rows.filter(order => order.status === 'delivered')) {
    for (const item of Array.isArray(order.items) ? order.items : []) {
      const product = products.find(p => String(p.id) === String(item.productId ?? item.product_id));
      const category = item.category || product?.category || (isAr ? 'أخرى' : 'Other');
      const price = Number(item.price), quantity = Number(item.quantity ?? item.qty ?? 1);
      if (!Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity <= 0) continue;
      const amount = price * quantity;
      if (Number.isFinite(amount) && amount > 0) totals.set(category, (totals.get(category) || 0) + amount);
    }
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  const palette = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  return [...totals].sort((a, b) => b[1] - a[1]).map(([name, sales], i) => ({ nameAr: name, nameEn: name, sales, percentage: sum ? Math.round(sales / sum * 100) : 0, color: palette[i % palette.length] }));
}

export function computeRecentOrders(orders: Order[], isAr: boolean, window?: AnalyticsWindow): RecentOrderItem[] {
  const rows = window ? ordersInWindow(orders, window) : validAnalyticsOrders(orders);
  return [...rows].sort((a, b) => orderTime(b) - orderTime(a)).slice(0, 5).map(order => ({
    id: `#${order.id}`, customer: order.customerName || (isAr ? 'عميل' : 'Customer'),
    date: new Date(orderTime(order)).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB'),
    items: (Array.isArray(order.items) ? order.items : []).reduce((sum: number, item: any) => sum + (Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 0), 0),
    total: orderAmount(order), status: order.status === 'delivered' ? 'success' : order.status === 'pending_payment' ? 'draft' : 'warning',
    statusLabelAr: ({ delivered: 'تم التسليم', pending_payment: 'بانتظار التأكيد', processing: 'قيد التجهيز', shipped: 'تم الشحن' } as Record<string, string>)[order.status],
    statusLabelEn: order.status,
  }));
}

export function computeTopProducts(products: Product[], orders: Order[], window: AnalyticsWindow): Product[] {
  const quantities = new Map<string, number>();
  for (const order of ordersInWindow(orders, window).filter(order => order.status === 'delivered')) {
    for (const item of Array.isArray(order.items) ? order.items : []) {
      const id = String(item.productId ?? item.product_id ?? '');
      const quantity = Number(item.quantity ?? item.qty ?? 1);
      if (id && Number.isInteger(quantity) && quantity > 0) quantities.set(id, (quantities.get(id) || 0) + quantity);
    }
  }
  return products.map(product => ({ ...product, salesCount: quantities.get(String(product.id)) || 0 })).filter(product => product.salesCount > 0).sort((a, b) => b.salesCount - a.salesCount);
}

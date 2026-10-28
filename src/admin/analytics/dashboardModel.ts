import type { AnalyticsEvent } from '../../lib/analytics/types';
import type { AggregatedAnalytics, CustomerSession, HesitationIncident, SizeDemandItem } from '../lib/analytics';
import { DAY_MS, orderTime, orderAmount, ordersInWindow, type AnalyticsWindow } from './analyticsCalculations.ts';

export interface RFMCustomer {
  id: string; name: string; recencyDays: number; frequency: number; monetary: number; score: number;
}

export function computeRFM(orders: any[], window: AnalyticsWindow, now = Date.now()): RFMCustomer[] {
  const customers = new Map<string, { name: string; last: number; frequency: number; monetary: number }>();
  for (const order of ordersInWindow(orders, window, now).filter(order => order.status === 'delivered')) {
    const phone = String(order.customerPhone || '').replace(/\D/g, '');
    const email = String(order.customerEmail || '').trim().toLowerCase();
    const id = order.customerId ? `id:${order.customerId}` : phone.length >= 7 ? `phone:${phone}` : email.includes('@') ? `email:${email}` : '';
    if (!id) continue;
    const current = customers.get(id) || { name: order.customerName || '—', last: 0, frequency: 0, monetary: 0 };
    current.last = Math.max(current.last, orderTime(order)); current.frequency++; current.monetary += orderAmount(order);
    customers.set(id, current);
  }
  const asOf = Math.min(now, window.endTime - 1);
  const rows = [...customers].map(([id, row]) => ({ id, name: row.name, recencyDays: Math.max(0, Math.floor((asOf - row.last) / DAY_MS)), frequency: row.frequency, monetary: row.monetary, score: 0 }));
  const ranks = (values: number[], reverse = false) => {
    const sorted = [...values].sort((a, b) => reverse ? b - a : a - b);
    const result = new Map<number, number>();
    sorted.forEach((value, index) => { if (!result.has(value)) result.set(value, sorted[0] === sorted[sorted.length - 1] ? 3 : 1 + Math.floor(index / Math.max(1, sorted.length - 1) * 4)); });
    return result;
  };
  const recencyRanks = ranks(rows.map(row => row.recencyDays), true), frequencyRanks = ranks(rows.map(row => row.frequency)), monetaryRanks = ranks(rows.map(row => row.monetary));
  return rows.map(row => ({ ...row, score: Math.round((recencyRanks.get(row.recencyDays)! + frequencyRanks.get(row.frequency)! + monetaryRanks.get(row.monetary)! - 3) / 12 * 100) })).sort((a, b) => b.score - a.score);
}

export function computeDashboardAnalytics(products: any[], orders: any[], source: AnalyticsEvent[], window: AnalyticsWindow, now = Date.now()): AggregatedAnalytics {
  const unique = new Map<string, AnalyticsEvent>();
  for (const event of Array.isArray(source) ? source : []) {
    if (typeof event?.id !== 'string' || typeof event.sessionId !== 'string' || !event.id || !event.sessionId || !Number.isFinite(event.timestamp) || event.timestamp > now || event.timestamp < window.startTime || event.timestamp >= window.endTime) continue;
    if (event.data?.isSimulation || event.data?.isDev || event.data?.isDemo || String(event.data?.productId || '').startsWith('demo-') || event.data?.productId === 'local-color-check') continue;
    unique.set(event.id, event);
  }
  const events = [...unique.values()].sort((a, b) => a.timestamp - b.timestamp);
  const sessions = new Map<string, AnalyticsEvent[]>();
  events.filter(event => event.type !== 'system_error').forEach(event => sessions.set(event.sessionId, [...(sessions.get(event.sessionId) || []), event]));
  const recordedOrders = ordersInWindow(orders, window, now);
  const delivered = recordedOrders.filter(order => order.status === 'delivered');
  const revenue = delivered.reduce((sum, order) => sum + orderAmount(order), 0);
  const customerSessions: CustomerSession[] = [];
  const hesitationIncidents: HesitationIncident[] = [];
  const visitSessions = new Set(events.filter(event => event.type === 'page_view').map(event => event.sessionId));
  const visitors = new Set(events.map(event => event.data?.visitorId).filter(Boolean));
  const linkedConversions = new Set(delivered.map(order => order.sessionId).filter(id => visitSessions.has(id)));
  for (const [id, rows] of sessions) {
    const views = rows.filter(event => event.type === 'product_view');
    const carts = rows.filter(event => event.type === 'whatsapp_order' && event.data?.action === 'add_to_cart');
    const inquiries = rows.filter(event => event.type === 'whatsapp_order' && event.data?.action !== 'add_to_cart');
    const sizes = rows.filter(event => event.type === 'size_select');
    const wishes = rows.filter(event => event.type === 'wishlist_toggle' && event.data?.isAdded !== false);
    const guides = rows.filter(event => event.type === 'size_guide_open' || event.type === 'fit_calculator');
    const coupon = rows.some(event => event.type === 'coupon_copied');
    const score = Math.min(100, Math.min(20, views.length * 5) + Math.min(20, sizes.length * 10) + Math.min(30, carts.length * 15) + (inquiries.length ? 15 : 0) + (wishes.length ? 10 : 0) + (guides.length ? 5 : 0));
    const first = rows[0].timestamp, last = rows[rows.length - 1].timestamp;
    const dwell = Math.round((last - first) / 1000);
    const idleMinutes = Math.floor((now - last) / 60000);
    const linked = delivered.filter(order => order.sessionId === id);
    const hesitant = idleMinutes >= 5 && dwell >= 30 && inquiries.length === 0 && linked.length === 0 && (carts.length > 0 || sizes.length > 0 || guides.length > 1);
    customerSessions.push({
      id, customerName: `جلسة #${id.slice(-6)}`, email: '—', phone: '—',
      persona: linked.length >= 2 ? 'VIP' : coupon ? 'Deal Hunter' : hesitant ? 'Hesitant Buyer' : 'Window Shopper',
      engagementScore: score,
      viewCount: views.length, cartCount: carts.length,
      lastActive: idleMinutes < 1 ? 'نشط الآن' : `منذ ${idleMinutes} دقيقة`,
      totalSpentIQD: linked.reduce((sum, order) => sum + orderAmount(order), 0),
      preferredCategory: rows.find(event => event.type === 'category_filter')?.data?.category || '—',
    });
    if (hesitant) {
      const target = [...rows].reverse().find(event => event.data?.productId);
      const title = target?.data?.productTitle || target?.data?.title || products.find(p => String(p.id) === String(target?.data?.productId))?.name || '—';
      hesitationIncidents.push({ id: `hes:${id}`, customerName: `جلسة #${id.slice(-6)}`, phone: '', productTitle: title,
        stage: carts.length ? 'cart' : sizes.length ? 'checkout' : 'sizing', dwellSeconds: dwell, intentScore: score,
        recoveryMessage: 'مرحباً من فانت، هل تحتاج مساعدة في اختيار اللون أو المقاس؟', timestamp: `منذ ${idleMinutes} دقيقة` });
    }
  }
  const demand = new Map<string, { productId: string; size: string; quantity: number }>();
  for (const order of recordedOrders) for (const item of Array.isArray(order.items) ? order.items : []) {
    const id = String(item.productId ?? item.product_id ?? '');
    const size = String(item.selectedSize ?? item.size ?? '').trim().toUpperCase();
    const quantity = Number(item.quantity ?? item.qty ?? 1);
    if (!id || !size || !Number.isInteger(quantity) || quantity <= 0) continue;
    const key = JSON.stringify([id, size]);
    demand.set(key, { productId: id, size, quantity: (demand.get(key)?.quantity || 0) + quantity });
  }
  const sizeDemandMatrix: SizeDemandItem[] = [...demand].map(([id, item]) => {
    const product = products.find(p => String(p.id) === item.productId);
    // A product-wide or color-wide stock count is not a stock count for every size.
    const exact = product?.sizeStock?.[item.size];
    const variants = Array.isArray(product?.variants) ? product.variants.filter((variant: any) => Array.isArray(variant?.sizes) && variant.sizes.some((size: string) => String(size).toUpperCase() === item.size)) : [];
    const variantStock = variants.length && variants.every((variant: any) => variant.sizes.length === 1 && Number.isInteger(variant.stock) && variant.stock >= 0) ? variants.reduce((sum: number, variant: any) => sum + variant.stock, 0) : null;
    const stock = typeof exact === 'number' && Number.isInteger(exact) && exact >= 0 ? exact : variantStock ?? (product?.availabilityStatus === 'sold_out' ? 0 : null);
    return { id, productName: product?.name || product?.title_ar || product?.title || item.productId, size: item.size,
      requestedVelocity: item.quantity, stockLevel: stock,
      status: stock === null ? 'unknown' : stock < item.quantity ? 'stockout_risk' : stock > item.quantity * 3 ? 'surplus' : 'balanced', conversionDropRate: null };
  });
  const searches = new Map<string, number>();
  for (const event of events) if (event.type === 'search_query' && event.data?.resultsCount === 0) {
    const query = String(event.data.query || '').trim().toLowerCase();
    if (query) searches.set(query, (searches.get(query) || 0) + 1);
  }
  return {
    overview: { totalRevenueIQD: revenue, totalOrders: recordedOrders.length, averageOrderValueIQD: delivered.length ? Math.round(revenue / delivered.length) : 0,
      conversionRate: visitSessions.size && (linkedConversions.size > 0 || delivered.length === 0) ? Math.round(linkedConversions.size / visitSessions.size * 1000) / 10 : null,
      hesitationCount: hesitationIncidents.length, unmetSearchLossIQD: null, uniqueVisitors: visitors.size, uniquePersistentVisitors: visitors.size, totalVisits: visitSessions.size },
    totalVisits: visitSessions.size, uniquePersistentVisitors: visitors.size,
    hesitationIncidents, customerSessions, sizeDemandMatrix,
    rfmCustomers: computeRFM(orders, window, now),
    unmetSearches: [...searches].sort((a, b) => b[1] - a[1]).map(([query, searchVolume]) => ({ id: query, query, searchVolume, category: '—', estimatedLostRevenueIQD: null, growthTrend: null })),
  };
}

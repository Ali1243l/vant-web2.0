import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeDatasets, computeTopProducts, computeCategoriesShare, periodBounds, DAY_MS } from '../src/admin/analytics/analyticsCalculations.ts';
import { computeDashboardAnalytics, computeRFM } from '../src/admin/analytics/dashboardModel.ts';

test('dashboard uses matching calendar windows, ignores bad dates and only recognizes delivered revenue', (t) => {
  t.mock.method(Date, 'now', () => new Date('2026-10-28T12:00:00').getTime());
  const orders = [
    { id: 'today', status: 'delivered', totalPrice: 100, orderDate: '2026-10-28T10:00:00' },
    { id: 'pending', status: 'pending_payment', totalPrice: 500, orderDate: '2026-10-28T10:00:00' },
    { id: 'outside', status: 'delivered', totalPrice: 200, orderDate: '2026-10-21T12:00:00' },
    { id: 'invalid', status: 'delivered', totalPrice: 900, orderDate: 'invalid' },
    { id: 'cancelled', status: 'cancelled', totalPrice: 700, orderDate: '2026-10-28T10:00:00' },
  ] as any;
  const dataset = computeDatasets(orders, true, '', '')['7d'];
  assert.equal(dataset.totalRevenue, 100);
  assert.equal(dataset.totalOrders, 2);
  assert.equal(dataset.points.reduce((sum, point) => sum + point.sales, 0), dataset.totalRevenue);
  assert.equal(dataset.points.reduce((sum, point) => sum + point.orders, 0), dataset.totalOrders);
});

const now = new Date('2026-10-28T12:00:00').getTime();
const window = periodBounds('30d', '', '', now);
const event = (id: string, type: string, data: any = {}, ageMinutes = 10, sessionId = 'visitor-a') => ({ id, type, data, timestamp: now - ageMinutes * 60000, device: 'desktop', sessionId } as any);
const order = (id: string, overrides: any = {}) => ({ id, status: 'delivered', totalPrice: 100, orderDate: new Date(now - DAY_MS).toISOString(), customerPhone: '9647000000001', customerName: 'Test customer', items: [], ...overrides });

test('behavior counts actual views and cart additions, preserves a zero score and never invents conversion linkage', () => {
  const events = [event('page', 'page_view', { visitorId: 'v1' }), event('view', 'product_view', { productId: 'p1' }), event('cart', 'whatsapp_order', { action: 'add_to_cart', productId: 'p1' })];
  const result = computeDashboardAnalytics([], [order('one')], [...events, events[1], event('dev', 'page_view', { isDev: true }), event('old', 'page_view', {}, 60000)], window, now);
  assert.equal(result.totalVisits, 1);
  assert.equal(result.customerSessions[0].viewCount, 1);
  assert.equal(result.customerSessions[0].cartCount, 1);
  assert.notEqual(result.customerSessions[0].persona, 'VIP');
  assert.equal(result.overview.conversionRate, null);
  assert.equal(result.overview.totalOrders, 1);
  assert.equal(computeDashboardAnalytics([], [], [events[0]], window, now).customerSessions[0].engagementScore, 0);
  const linked = computeDashboardAnalytics([], [order('a', { sessionId: 'visitor-a' }), order('b', { sessionId: 'visitor-a' })], events, window, now);
  assert.equal(linked.overview.conversionRate, 100);
});

test('RFM uses delivered purchase recency, frequency and amount, deduplicates orders and handles ties', () => {
  const first = order('one');
  const rows = computeRFM([first, first, order('two', { totalPrice: 200 }), order('old', { customerPhone: '9647000000002', orderDate: new Date(now - DAY_MS * 20).toISOString(), totalPrice: 50 }), order('cancelled', { status: 'cancelled' }), order('pending', { status: 'pending_payment' })], window, now);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].frequency, 2);
  assert.equal(rows[0].monetary, 300);
  assert.equal(rows[0].recencyDays, 1);
  assert.ok(rows[0].score > rows[1].score);
  assert.equal(computeRFM([first], window, now)[0].score, 50);
  assert.deepEqual(computeRFM([order('anonymous', { customerPhone: '', customerEmail: '' })], window, now), []);
});

test('size demand does not allocate product stock to every size or assume a missing size is M', () => {
  const items = [{ productId: 'p_1', selectedSize: 'L', quantity: 3 }, { productId: 'p_1', quantity: 9 }, { productId: 'p_1', selectedSize: 'M', quantity: 0 }];
  const result = computeDashboardAnalytics([{ id: 'p_1', name: 'Test shirt', stock: 20 }], [order('size', { items })], [], window, now);
  assert.equal(result.sizeDemandMatrix.length, 1);
  assert.equal(result.sizeDemandMatrix[0].requestedVelocity, 3);
  assert.equal(result.sizeDemandMatrix[0].stockLevel, null);
  assert.equal(result.sizeDemandMatrix[0].status, 'unknown');
  const exact = computeDashboardAnalytics([{ id: 'p_1', name: 'Test shirt', variants: [{ sizes: ['L'], stock: 2 }] }], [order('size', { items })], [], window, now);
  assert.equal(exact.sizeDemandMatrix[0].stockLevel, 2);
  assert.equal(exact.sizeDemandMatrix[0].status, 'stockout_risk');
});

test('best sellers and category shares use delivered quantities in the selected period only', t => {
  t.mock.method(Date, 'now', () => now);
  const products = [{ id: 'p1', name: 'One', category: 'Tees' }, { id: 'p2', name: 'Two', category: 'Coats' }] as any;
  const orders = [order('sold', { items: [{ productId: 'p2', price: 50, quantity: 2 }] }), order('pending', { status: 'pending_payment', items: [{ productId: 'p1', price: 200, quantity: 10 }] }), order('bad-line', { items: [{ productId: 'p1', price: -5, quantity: -2 }] })] as any;
  assert.equal(computeTopProducts(products, orders, window)[0].id, 'p2');
  assert.equal(computeTopProducts(products, orders, window)[0].salesCount, 2);
  assert.deepEqual(computeCategoriesShare(products, orders, true, window).map(row => row.sales), [100]);
});

test('hesitation requires elapsed idle time and observed intent, not just opening a product', () => {
  const intent = [event('view', 'product_view', { productId: 'p1' }, 12), event('size', 'size_select', { productId: 'p1', size: 'M' }, 10)];
  assert.equal(computeDashboardAnalytics([], [], intent, window, now).hesitationIncidents.length, 1);
  assert.equal(computeDashboardAnalytics([], [], intent, window, now).hesitationIncidents[0].phone, '');
  assert.equal(computeDashboardAnalytics([], [], [event('active', 'size_select', { size: 'M' }, 0)], window, now).hesitationIncidents.length, 0);
  assert.equal(computeDashboardAnalytics([], [], [...intent, event('inquiry', 'whatsapp_order', {}, 9)], window, now).hesitationIncidents.length, 0);
});

test('unmet search counts recorded zero results only and does not fabricate monetary loss', () => {
  const result = computeDashboardAnalytics([], [], [event('zero', 'search_query', { query: 'jacket', resultsCount: 0 }), event('legacy', 'search_query', { query: 'unknown' }), event('found', 'search_query', { query: 'shirt', resultsCount: 2 })], window, now);
  assert.equal(result.unmetSearches.length, 1);
  assert.equal(result.unmetSearches[0].query, 'jacket');
  assert.equal(result.unmetSearches[0].estimatedLostRevenueIQD, null);
});

test('all date buckets partition their periods exactly and growth without a baseline is unavailable', t => {
  t.mock.method(Date, 'now', () => now);
  const orders = Array.from({ length: 370 }, (_, day) => order(String(day + 1), { orderDate: new Date(now - day * DAY_MS).toISOString() }));
  const datasets = computeDatasets(orders as any, true, '2026-10-12', '2026-10-27');
  for (const dataset of Object.values(datasets)) {
    assert.equal(dataset.points.reduce((sum, point) => sum + point.sales, 0), dataset.totalRevenue);
    assert.equal(dataset.points.reduce((sum, point) => sum + point.orders, 0), dataset.totalOrders);
  }
  assert.equal(computeDatasets([order('new')] as any, true, '', '')['7d'].growthVal, null);
  assert.equal(computeDatasets(orders as any, true, '2026-10-28', '2026-10-12').custom.totalOrders, 0);
});

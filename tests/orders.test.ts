import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeOrders, filterOrders, orderMetrics, transitionOrder, allowedOrderStatuses, escapeOrderText } from '../src/lib/orderModel.ts';
import { createDemoOrders } from './orderFixtures.ts';

const record = (id: string, extra = {}) => ({ id, status: 'pending_payment', total_price: 25000, created_at: '2026-10-28T10:00:00', customer_name: 'Test customer', items: [{ product_id: 'shirt', name: 'تيشيرت', nameEn: 'Shirt', quantity: 2, price: 12500, size: 'M' }], ...extra });

test('normalizes source aliases without fabricating an order ID, date or missing status', () => {
  const orders = normalizeOrders([record('A'), record('A'), record('bad-date', { created_at: 'invalid' }), record('', {}), record('negative', { total_price: -1 }), record('bad-status', { status: 'invented' }), record('missing-status', { status: undefined })]);
  assert.equal(orders.length, 2);
  assert.equal(orders[0].items[0].productId, 'shirt');
  assert.equal(orders[1].orderDate, '');
  assert.deepEqual(normalizeOrders('{}'), []);
  assert.deepEqual(normalizeOrders([record('bad-items', { items: '{invalid', timeline: 'null' })])[0].items, []);
});

test('date filters include the complete end day, exclude invalid dates and combine status/type/search', () => {
  const rows = normalizeOrders([record('A'), record('B', { type: 'bespoke', status: 'cancelled', created_at: '2026-10-28T23:59:59.999' }), record('C', { created_at: '2026-10-29T00:00:00' }), record('D', { created_at: '' })]);
  const filters = { query: '', status: 'all', type: 'all', sort: 'newest', from: new Date('2026-10-28T00:00:00'), to: new Date('2026-10-28T00:00:00') };
  assert.deepEqual(filterOrders(rows, filters).map(order => order.id), ['B', 'A']);
  assert.deepEqual(filterOrders(rows, { ...filters, type: 'bespoke', status: 'cancelled', query: 'TEST' }).map(order => order.id), ['B']);
  assert.equal(filterOrders(rows, { ...filters, query: 'تيشيرت' }).length, 2);
  assert.equal(filterOrders(rows, { ...filters, query: 'no match' }).length, 0);
});

test('metrics count delivered revenue only, including cancelled in total but not revenue', () => {
  const rows = normalizeOrders([record('pending'), record('processing', { status: 'processing' }), record('delivered', { status: 'delivered', total_price: 40000 }), record('cancelled', { status: 'cancelled' })]);
  assert.equal(orderMetrics(rows).revenue, 40000);
  assert.equal(orderMetrics(rows).total, 4);
  assert.equal(orderMetrics(rows).cancelled, 1);
  assert.equal(orderMetrics(filterOrders(rows, { query: '', status: 'pending_payment', type: 'all', sort: 'newest' })).revenue, 0);
});

test('transitions preserve original data, append actual history and reject backwards/duplicate moves', () => {
  const original = normalizeOrders([record('A')])[0];
  const changed = transitionOrder(original, 'processing', 'Ready', '2026-10-28T12:00:00Z');
  assert.equal(original.status, 'pending_payment');
  assert.equal(original.timeline.length, 0);
  assert.equal(changed.timeline[0].timestamp, '2026-10-28T12:00:00Z');
  assert.throws(() => transitionOrder(changed, 'pending_payment'));
  assert.throws(() => transitionOrder(changed, 'processing'));
  assert.throws(() => transitionOrder(changed, 'cancelled', ' '));
  assert.equal(transitionOrder(changed, 'cancelled', 'Customer request').timeline.length, 2);
  assert.deepEqual(allowedOrderStatuses('delivered'), []);
  assert.deepEqual(allowedOrderStatuses('cancelled'), []);
});

test('demo orders are isolated fixtures, cover all stages and support Arabic numeric searches', () => {
  const first = createDemoOrders(), second = createDemoOrders();
  first[0].customerName = 'Changed';
  assert.notEqual(second[0].customerName, 'Changed');
  assert.equal(new Set(first.map(order => order.status)).size, 5);
  assert.ok(first.every(order => !order.customerPhone && order.id.startsWith('DEMO-')));
  assert.equal(filterOrders(second, { query: 'DEMO-٠٠١', status: 'all', type: 'all', sort: 'newest' })[0].id, 'DEMO-001');
});

test('print text escapes untrusted names and cannot insert scripts or markup', () => {
  assert.equal(escapeOrderText('<script>alert("x")</script> &'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp;');
  assert.equal(escapeOrderText(null), '');
});

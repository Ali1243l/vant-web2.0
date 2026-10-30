import test from 'node:test';
import assert from 'node:assert/strict';
import { campaignAudience, spreadsheetCell, escapeHtml, subscriberDetails, subscriberOrderTotals, httpUrl } from '../src/lib/adminAudience.ts';
const row = { email: ' buyer@example.com ', status: 'active', totalSpent: 0, tags: [] as string[] };
test('campaign audiences exclude unsubscribed, malformed and duplicate addresses including VIP', () => {
  const list = [row, { ...row, email: 'BUYER@example.com' }, { ...row, email: 'off@example.com', status: 'unsubscribed', tags: ['VIP'] }, { ...row, email: 'bad' }];
  assert.equal(campaignAudience(list, 'all').length, 1);
  assert.equal(campaignAudience(list, 'active').length, 1);
  assert.equal(campaignAudience(list, 'vip').length, 0);
  assert.equal(campaignAudience([{ ...row, tags: ['VIP'] }], 'vip').length, 1);
});
test('spreadsheet and HTML exports cannot evaluate contact text', () => {
  for (const value of ['=1+2', '+12345', '-5', '@SUM(1)', '  =HYPERLINK(1)']) assert.ok(spreadsheetCell(value).startsWith("'"));
  assert.equal(spreadsheetCell('normal'), 'normal');
  assert.equal(escapeHtml('<img src="x">&'), '&lt;img src=&quot;x&quot;&gt;&amp;');
});
test('contact metadata roundtrips without displaying arbitrary notes as phone numbers', () => {
  assert.deepEqual(subscriberDetails(JSON.stringify({ kind: 'vant-contact', name: 'Ali', phone: '+9647701234567' })), { kind: 'vant-contact', name: 'Ali', phone: '+9647701234567' });
  assert.equal(subscriberDetails('private customer note').phone, '');
  assert.equal(subscriberDetails('+964 770 1234567').phone, '+964 770 1234567');
});
test('subscriber value counts delivered orders by normalized email only', () => {
  const order = { customerEmail: 'BUYER@example.com', status: 'delivered', totalPrice: 25000 };
  assert.deepEqual(subscriberOrderTotals(row.email, [order, { ...order, status: 'cancelled' }, { ...order, customerEmail: 'another@example.com' }, { ...order, totalPrice: NaN }]), { totalOrders: 2, totalSpent: 25000 });
});

test('campaign links only accept public web URL protocols', () => {
  assert.equal(httpUrl('javascript:alert(1)'), '');
  assert.equal(httpUrl('data:text/html,<script>'), '');
  assert.equal(httpUrl('https://vant.example/shop'), 'https://vant.example/shop');
});

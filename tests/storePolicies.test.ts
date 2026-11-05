import test from 'node:test';
import assert from 'node:assert/strict';
import { policyIds, defaultPolicies, readPolicies, validPolicyPage, policyFromSearch, policyFooterLabel } from '../src/data/storePolicies.ts';

test('all published policies have matching bilingual content and preserve owner-approved dates and amounts', () => {
  for (const id of policyIds) {
    assert.ok(validPolicyPage(defaultPolicies[id]), id);
    for (const lang of ['ar', 'en'] as const) {
      assert.ok(!/\[Before publication|\[يُستكمل|مسودة للمراجعة|غير جاهز للنشر/.test(defaultPolicies[id][lang].body));
    }
  }
  assert.match(defaultPolicies.delivery.en.body, /2–6 calendar days from confirmation/);
  assert.match(defaultPolicies.delivery.en.body, /2–3 days within that total/);
  assert.match(defaultPolicies.returns.en.body, /one year from receipt/);
  assert.match(defaultPolicies.returns.en.body, /seven calendar days of VANT receiving/);
  assert.match(defaultPolicies.orders.en.body, /IQD 10,000 deposit requires IQD 12,000/);
});

test('saved copy survives reading, malformed pages fall back individually and HTML stays plain text', () => {
  const updated = { ...defaultPolicies.about, ar: { title: 'عن فانت الجديد', body: '<script>alert(1)</script>\n\nنص المتجر' } };
  const input = { about: updated, delivery: { ar: null }, extra: { title: 'ignored' } };
  const before = JSON.stringify(input);
  const pages = readPolicies(input);
  assert.deepEqual(pages.about, updated);
  assert.deepEqual(pages.delivery, defaultPolicies.delivery);
  assert.deepEqual(Object.keys(pages), [...policyIds]);
  assert.equal(JSON.stringify(input), before);
  for (const updated of ['2026-99-99', '2026-02-30', '', '2026-1-1']) assert.equal(validPolicyPage({ ...defaultPolicies.about, updated }), false);
  assert.equal(validPolicyPage({ ...defaultPolicies.about, en: { title: '', body: 'text' } }), false);
  assert.equal(validPolicyPage({ ...defaultPolicies.about, ar: { title: 'x', body: 'x'.repeat(24001) } }), false);
});

test('shareable policy links only open known pages and tolerate other URL parameters', () => {
  assert.equal(policyFromSearch('?policy=returns'), 'returns');
  assert.equal(policyFromSearch('?lang=en&policy=privacy'), 'privacy');
  for (const query of ['', '?policy=__proto__', '?policy=<script>', '?policy=not-a-page']) assert.equal(policyFromSearch(query), null);
});

test('compact footer labels preserve previously edited titles and separately saved labels', () => {
  assert.equal(policyFooterLabel('orders', defaultPolicies.orders, 'ar'), 'الشروط');
  const custom = { ...defaultPolicies.orders, ar: { ...defaultPolicies.orders.ar, title: 'شروط فانت المعدّلة' } };
  assert.equal(policyFooterLabel('orders', custom, 'ar'), 'شروط فانت المعدّلة');
  custom.ar = { ...custom.ar, label: 'الشراء' } as typeof custom.ar;
  const saved = readPolicies({ orders: custom });
  assert.equal(policyFooterLabel('orders', saved.orders, 'ar'), 'الشراء');
  assert.equal(policyFooterLabel('orders', saved.orders, 'en'), 'Terms');
  assert.equal(validPolicyPage({ ...custom, ar: { ...custom.ar, label: 'x'.repeat(65) } }), false);
});

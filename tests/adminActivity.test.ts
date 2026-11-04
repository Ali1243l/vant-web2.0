import test from 'node:test';
import assert from 'node:assert/strict';
import { activityChanges, activityDateBoundary, type ActivityEntry } from '../src/lib/adminActivity.ts';

test('audit comparison preserves zero, null, missing fields, nested changes and redacted values', () => {
  const entry: ActivityEntry = { id: 1, occurred_at: '', transaction_id: 1, actor_id: null, actor_kind: 'database', table_name: 'products', record_id: '1', action: 'UPDATE', changed_fields: ['price', 'notes', 'removed', 'settings'], before_data: { price: 10, removed: true, settings: { password: '[REDACTED]' } }, after_data: { price: 0, notes: null, settings: { password: '[REDACTED]', active: false } } };
  const changes = activityChanges(entry);
  assert.deepEqual(changes[0], { field: 'price', before: '10', after: '0' });
  assert.deepEqual(changes[1], { field: 'notes', before: '—', after: 'null' });
  assert.deepEqual(changes[2], { field: 'removed', before: 'true', after: '—' });
  assert.match(changes[3].after!, /"active": false/);
  assert.equal(entry.before_data!.price, 10);
});

test('audit date filters cover an entire Baghdad day using an exclusive end boundary', () => {
  assert.equal(activityDateBoundary('2026-11-05', false), '2026-11-04T21:00:00.000Z');
  assert.equal(activityDateBoundary('2026-11-05', true), '2026-11-05T21:00:00.000Z');
  assert.equal(activityDateBoundary('', true), null);
  assert.equal(activityDateBoundary('invalid', false), null);
  assert.equal(activityDateBoundary('2026-02-31', false), null);
});

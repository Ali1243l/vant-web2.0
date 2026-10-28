import assert from 'node:assert/strict';
import { test } from 'node:test';
import { saveOrderChange } from '../src/lib/saveOrderChange.ts';
import { normalizeOrders } from '../src/lib/orderModel.ts';

const row = () => ({ id: 'A', status: 'pending_payment', total_price: 25000, created_at: '2026-10-28T10:00:00Z', items: [], timeline: [], bespoke_details: { fabricSelection: 'cotton', privateField: 'preserve' } });
function database(source = row(), failure = '', concurrent = false) {
  const calls: any[] = [];
  const client = { from(table: string) {
    let patch: any;
    const request: any = {
      select() { return request; },
      eq(field: string, value: any) { calls.push({ field, value }); return request; },
      is(field: string, value: any) { calls.push({ field, value }); return request; },
      update(value: any) { patch = value; calls.push({ table, patch }); return request; },
      async single() {
        if (!patch) return { data: failure === 'read' ? null : source, error: failure === 'read' ? new Error('read') : null };
        if (failure === 'write' || concurrent) return { data: null, error: new Error('conflict or denied') };
        return { data: failure === 'unchanged' ? source : { ...source, ...patch }, error: null };
      },
    };
    return request;
  } };
  return { client, calls };
}

test('status saves update only the selected record and check status/history before confirming', async () => {
  const db = database();
  const previous = normalizeOrders([row()])[0];
  const saved = await saveOrderChange(db.client, previous, { status: 'processing', note: 'Ready' });
  assert.equal(saved.status, 'processing');
  assert.equal(saved.timeline.length, 1);
  assert.equal(previous.status, 'pending_payment');
  assert.ok(db.calls.some(call => call.field === 'id' && call.value === 'A'));
  assert.ok(db.calls.some(call => call.field === 'timeline' && call.value === '[]'));
  const patch = db.calls.find(call => call.patch).patch;
  assert.deepEqual(Object.keys(patch).sort(), ['status', 'timeline']);
});

test('read failures, denied writes, concurrent edits and stale status never report a successful save', async () => {
  const previous = normalizeOrders([row()])[0];
  for (const db of [database(row(), 'read'), database(row(), 'write'), database(row(), 'unchanged'), database(row(), '', true), database({ ...row(), status: 'shipped' })]) {
    await assert.rejects(saveOrderChange(db.client, previous, { status: 'processing' }));
    assert.equal(previous.status, 'pending_payment');
    assert.equal(previous.timeline.length, 0);
  }
});

test('note changes preserve unknown server fields and use a conditional details update', async () => {
  const db = database();
  const saved = await saveOrderChange(db.client, normalizeOrders([row()])[0], { notes: 'Fit notes' });
  const patch = db.calls.find(call => call.patch).patch;
  assert.equal(patch.bespoke_details.privateField, 'preserve');
  assert.equal(saved.bespokeDetails?.artisanNotes, 'Fit notes');
  assert.ok(db.calls.some(call => call.field === 'bespoke_details'));
});

test('local changes apply the same validation without cloud requests', async () => {
  const previous = normalizeOrders([row()])[0];
  assert.equal((await saveOrderChange(null, previous, { status: 'processing' })).status, 'processing');
  await assert.rejects(saveOrderChange(null, previous, { status: 'cancelled', note: '' }));
});

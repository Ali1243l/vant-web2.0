import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyShopper, newCartItem, applyShopperOperation, normalizeShopperDocument, validShopperOperation, type ShopperOperation } from '../src/lib/shopperModel.ts';
import { createShopperStore } from '../src/lib/shopperStore.ts';
import { mergeProducts } from '../src/lib/catalogIndex.ts';

const item = newCartItem('piece', 'M', 'black-id', 'Black', 'Shirt', '/shirt.webp', 25000);
function fixture() {
  const values = new Map<string, string>(), documents = new Map<string, ReturnType<typeof emptyShopper>>(), receipts = new Set<string>();
  const calls: ShopperOperation[][] = [], errors: string[] = [];
  let fail = false;
  const storage = { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const sync = async (owner: string, ops: ShopperOperation[]) => {
    calls.push(structuredClone(ops));
    if (fail) throw Error('offline');
    const doc = documents.get(owner) || emptyShopper();
    for (const op of ops) if (!receipts.has(owner + op.id)) { applyShopperOperation(doc, op); doc.revision++; receipts.add(owner + op.id); }
    documents.set(owner, doc);
    return { document: structuredClone(doc), acknowledged: ops.map(op => op.id) };
  };
  return { values, documents, calls, errors, storage, sync, setFail: (value: boolean) => { fail = value; }, store: () => createShopperStore(storage, sync, (_error, operation) => errors.push(operation)) };
}
test('five rapid changes update immediately but send one debounced batch', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(), store = f.store();
  await store.activate('owner'); f.calls.length = 0;
  for (let i = 0; i < 5; i++) store.change(item, 1);
  assert.equal(store.getSnapshot().items[0].quantity, 5); assert.equal(f.calls.length, 0);
  context.mock.timers.tick(501); await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.calls.length, 1); assert.equal(f.calls[0].length, 5); assert.equal(store.getSnapshot().status, 'synced');
  store.dispose();
});
test('guest merge survives failure/restart and imports only once without affecting other accounts', async () => {
  const f = fixture(); let store = f.store(); store.change(item, 2); store.toggleWishlist('piece'); store.setCoupon('TEN');
  f.setFail(true); await store.activate('A'); assert.equal(store.getSnapshot().items[0].quantity, 2);
  store.dispose(); store = f.store(); f.setFail(false); await store.activate('A');
  assert.equal(store.getSnapshot().items[0].quantity, 2); assert.ok(store.getSnapshot().wishlist.has('piece'));
  assert.equal(store.getSnapshot().coupon, 'TEN');
  await store.activate(null); assert.equal(store.getSnapshot().items.length, 0);
  await store.activate('A'); assert.equal(store.getSnapshot().items[0].quantity, 2);
  await store.activate('B'); assert.equal(store.getSnapshot().items.length, 0);
  assert.equal(f.documents.get('A')!.cart[item.id].quantity, 2); store.dispose();
});
test('offline operations remain durable, replay once and a second device sees changes', async () => {
  const f = fixture(), first = f.store(); await first.activate('A');
  f.setFail(true); first.change(item, 3); await first.refresh();
  assert.equal(first.getSnapshot().pending, 1); assert.equal(first.getSnapshot().status, 'error'); first.dispose();
  const restarted = f.store(); f.setFail(false); await restarted.activate('A');
  assert.equal(restarted.getSnapshot().items[0].quantity, 3);
  const deviceTwo = createShopperStore({ getItem: () => null, setItem: () => {} }, f.sync, () => {});
  await deviceTwo.activate('A'); assert.equal(deviceTwo.getSnapshot().items[0].quantity, 3);
  restarted.remove(item.id); await restarted.refresh(); await deviceTwo.refresh();
  assert.equal(deviceTwo.getSnapshot().items.length, 0);
  restarted.dispose(); deviceTwo.dispose();
});
test('deletion tombstones reject stale increments but allow a deliberate new addition', () => {
  const doc = emptyShopper(); doc.cart[item.id] = item; doc.revision = 3;
  applyShopperOperation(doc, { id: crypto.randomUUID(), kind: 'remove', key: item.id, base: 3 }); doc.revision++;
  applyShopperOperation(doc, { id: crypto.randomUUID(), kind: 'delta', key: item.id, item, delta: 1, base: 2 });
  assert.equal(doc.cart[item.id], undefined);
  applyShopperOperation(doc, { id: crypto.randomUUID(), kind: 'delta', key: item.id, item, delta: 1, base: 4, restore: true });
  assert.equal(doc.cart[item.id].quantity, 1);
});
test('cache failures are reported and the visible in-memory cart remains usable', () => {
  const errors: string[] = [];
  const store = createShopperStore({ getItem: () => { throw Error('denied'); }, setItem: () => { throw Error('quota'); } }, async () => { throw Error('offline'); }, (_e, operation) => errors.push(operation));
  store.change(item, 1); assert.equal(store.getSnapshot().items[0].quantity, 1); assert.equal(store.getSnapshot().status, 'memory'); assert.ok(errors.length); store.dispose();
});
test('malformed and prototype keys are rejected; composite identity separates sizes and colours', () => {
  assert.notEqual(item.id, newCartItem('piece', 'L', 'black-id', '', '', '', 1).id);
  assert.notEqual(item.id, newCartItem('piece', 'M', 'white-id', '', '', '', 1).id);
  assert.equal(validShopperOperation({ id: crypto.randomUUID(), base: 0, kind: 'wish', key: '__proto__', enabled: true }), false);
  assert.throws(() => normalizeShopperDocument({ ...emptyShopper(), revision: -1 }));
});
test('same-browser tabs converge without duplicating pending changes', () => {
  const f = fixture(), first = f.store(), second = f.store();
  first.change(item, 1); second.externalUpdate('vant_shopper_v1:guest');
  second.change(item, 1); first.externalUpdate('vant_shopper_v1:guest');
  second.externalUpdate('vant_shopper_v1:guest');
  assert.equal(first.getSnapshot().items[0].quantity, 2);
  assert.equal(second.getSnapshot().items[0].quantity, 2);
  first.dispose(); second.dispose();
});
test('late cloud responses cannot leak an old account into a newly selected account', async () => {
  let resolveOld: (value: any) => void = () => {};
  const store = createShopperStore({ getItem: () => null, setItem: () => {} }, async owner => owner === 'A' ? new Promise(resolve => { resolveOld = resolve; }) : { document: emptyShopper(), acknowledged: [] }, () => {});
  const old = store.activate('A'); await store.activate('B');
  const document = emptyShopper(); document.cart[item.id] = item; document.revision = 100;
  resolveOld({ document, acknowledged: [] }); await old;
  assert.equal(store.getSnapshot().owner, 'B'); assert.equal(store.getSnapshot().items.length, 0); store.dispose();
});
test('catalog merges updates in place and deduplicates within a page at 10, 1000 and 10000 items', () => {
  for (const size of [10, 1000, 10000]) {
    const previous = Array.from({ length: size }, (_, id) => ({ id, title: 'old' } as any));
    let reads = 0;
    const counted = previous.map(row => new Proxy(row, { get(target, key) { if (key === 'id') reads++; return target[key]; } }));
    const result = mergeProducts(counted, [{ id: 0, title: 'updated' }, { id: size, title: 'new' }, { id: size, title: 'latest' }] as any);
    assert.equal(result.length, size + 1); assert.equal(result[0].title, 'updated'); assert.equal(result[size].title, 'latest');
    assert.equal(reads, size, 'one ID read per existing row, not nested scans');
    assert.equal(previous[0].title, 'old');
  }
});

test('clearing a full cart persists once and guest additions during login are retained', async () => {
  const f = fixture(); let writes = 0;
  const storage = { ...f.storage, setItem: (key: string, value: string) => { writes++; f.storage.setItem(key, value); } };
  const store = createShopperStore(storage, f.sync, () => {});
  for (let i = 0; i < 200; i++) store.change(newCartItem(String(i), 'M', 'v', 'Black', 'Shirt', '', 1), 1);
  writes = 0; store.clear(); assert.equal(writes, 1); assert.equal(store.getSnapshot().items.length, 0); store.dispose();
  let release: () => void = () => {};
  const first = createShopperStore(f.storage, async (owner, ops) => { await new Promise<void>(resolve => { release = resolve; }); return f.sync(owner, ops); }, () => {});
  first.change(item, 2);
  const login = first.activate('A');
  const guestTab = f.store(); guestTab.change(item, 1);
  release(); await login;
  const remainingGuest = f.store();
  assert.equal(remainingGuest.getSnapshot().items[0].quantity, 1);
  assert.equal(f.documents.get('A')!.cart[item.id].quantity, 2);
  first.dispose(); guestTab.dispose(); remainingGuest.dispose();
});

test('offline reload can display the last account cache without authenticating or sending requests', async () => {
  const f = fixture(), first = f.store(); await first.activate('A'); first.change(item, 2); await first.refresh(); first.dispose();
  const calls = f.calls.length, offline = f.store(); offline.restoreCachedOwner();
  assert.equal(offline.getSnapshot().items[0].quantity, 2);
  assert.equal(offline.getSnapshot().status, 'offline'); assert.equal(f.calls.length, calls);
  await offline.activate(null); offline.dispose();
  const guest = f.store(); guest.restoreCachedOwner(); assert.equal(guest.getSnapshot().owner, null); guest.dispose();
});

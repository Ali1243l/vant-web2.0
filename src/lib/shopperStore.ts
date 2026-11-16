import { emptyShopper, normalizeCartItem, normalizeShopperDocument, validShopperOperation, optimisticShopper, type ShopperDocument, type ShopperOperation } from './shopperModel.ts';
import type { CartItem } from './cart.ts';

export type ShopperStatus = 'guest' | 'pending' | 'syncing' | 'synced' | 'offline' | 'error' | 'memory';
interface Saved { base: ShopperDocument; pending: ShopperOperation[]; guestId: string; acknowledged?: string[] }
export interface ShopperSnapshot { items: CartItem[]; wishlist: Set<string>; coupon: string; status: ShopperStatus; pending: number; notice: string; owner: string | null; revision: number }
type Sync = (owner: string, operations: ShopperOperation[]) => Promise<{ document: ShopperDocument; acknowledged: string[]; adjusted?: string[] }>;

// Operation IDs survive retries; server revisions prevent an old response replacing a new one.
export function createShopperStore(storage: Pick<Storage, 'getItem' | 'setItem'>, sync: Sync, report: (error: unknown, operation: string) => void) {
  let owner: string | null = null, epoch = 0, status: ShopperStatus = 'guest', notice = '';
  let saved: Saved = { base: emptyShopper(), pending: [], guestId: crypto.randomUUID() };
  let timer: ReturnType<typeof setTimeout> | undefined, running: Promise<void> | undefined;
  let failures = 0;
  const listeners = new Set<() => void>();
  let lastOperationTime = 0;
  let snapshot: ShopperSnapshot;
  const key = () => `vant_shopper_v1:${owner || 'guest'}`;
  const read = (): Saved => {
    try {
      const value = JSON.parse(storage.getItem(key()) || 'null');
      if (!value) return { base: emptyShopper(), pending: [], guestId: crypto.randomUUID() };
      if (!value.base || !Number.isSafeInteger(value.base.revision) || value.base.revision < 0 || !Array.isArray(value.pending)) throw Error('Invalid shopper cache');
      if (value.pending.length > 2000 || !value.pending.every(validShopperOperation)) throw Error('Invalid pending shopping changes');
      return { base: normalizeShopperDocument(value.base), pending: value.pending, guestId: value.guestId || crypto.randomUUID(), acknowledged: Array.isArray(value.acknowledged) ? value.acknowledged.slice(-2000) : [] };
    } catch (error) { report(error, 'shopper-cache-read'); notice = 'cache-unavailable'; return { base: emptyShopper(), pending: [], guestId: crypto.randomUUID() }; }
  };
  const emit = () => {
    const view = optimisticShopper(saved.base, saved.pending);
    const rows = Object.values(view.cart), ids = Object.keys(view.wishlist);
    const items = snapshot?.items.length === rows.length && rows.every((item, i) => JSON.stringify(item) === JSON.stringify(snapshot.items[i])) ? snapshot.items : rows;
    const wishlist = snapshot?.wishlist.size === ids.length && ids.every(id => snapshot.wishlist.has(id)) ? snapshot.wishlist : new Set(ids);
    snapshot = { items, wishlist, coupon: view.coupon, status, pending: owner ? saved.pending.length : 0, notice, owner, revision: view.revision };
    listeners.forEach(listener => listener());
  };
  const persist = () => {
    try { storage.setItem(key(), JSON.stringify(saved)); }
    catch (error) { status = 'memory'; notice = 'cache-unavailable'; report(error, 'shopper-cache-write'); }
  };
  const schedule = (delay = 500) => { if (timer) clearTimeout(timer); timer = setTimeout(() => { timer = undefined; void flush(); }, delay); (timer as any).unref?.(); };
  const flush = (): Promise<void> => {
    if (!owner) return Promise.resolve();
    if (running) return running;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { status = 'offline'; emit(); return Promise.resolve(); }
    const currentOwner = owner, currentEpoch = epoch, batch = saved.pending.slice(0, 200);
    status = 'syncing'; emit();
    running = (async () => {
      try {
        const result = await sync(currentOwner, batch);
        if (currentEpoch !== epoch) return;
        if (!result?.document || !Number.isSafeInteger(result.document.revision) || result.document.revision < saved.base.revision || !Array.isArray(result.acknowledged)) throw Error('Invalid shopper sync acknowledgment');
        const acknowledged = new Set(result.acknowledged);
        if (batch.some(op => !acknowledged.has(op.id))) throw Error('Incomplete shopper sync acknowledgment');
        const changed = result.document.revision > saved.base.revision && batch.length === 0;
        saved.base = normalizeShopperDocument(result.document);
        saved.pending = saved.pending.filter(operation => !acknowledged.has(operation.id));
        saved.acknowledged = [...new Set([...(saved.acknowledged || []), ...acknowledged])].slice(-2000);
        if (batch.some(op => op.kind === 'merge')) {
          const guestKey = 'vant_shopper_v1:guest';
          const guest = JSON.parse(storage.getItem(guestKey) || 'null');
          const imported = batch.find(op => op.kind === 'merge' && op.id === guest?.guestId);
          if (guest && imported) {
            const remaining = optimisticShopper(normalizeShopperDocument(guest.base), guest.pending.filter(validShopperOperation));
            for (const item of imported.cart || []) {
              const current = remaining.cart[item.id];
              if (current && current.quantity > item.quantity) remaining.cart[item.id] = { ...current, quantity: current.quantity - item.quantity };
              else delete remaining.cart[item.id];
            }
            for (const id of imported.wishlist || []) delete remaining.wishlist[id];
            remaining.revision++;
            storage.setItem(guestKey, JSON.stringify({ base: remaining, pending: [], guestId: crypto.randomUUID() }));
          }
        }
        failures = 0; status = saved.pending.length ? 'pending' : 'synced';
        notice = result.adjusted?.length ? 'conflict-reviewed' : batch.some(op => op.kind === 'merge') ? 'guest-merged' : changed ? 'updated-from-account' : '';
        persist(); emit();
      } catch (error) {
        if (currentEpoch !== epoch) return;
        failures++; status = 'error'; notice = 'sync-failed'; report(error, 'shopper-sync'); emit();
      } finally {
        if (currentEpoch === epoch) { running = undefined; if (saved.pending.length || failures) schedule(failures ? Math.min(300000, 15000 * 2 ** Math.min(failures - 1, 4)) : 500); }
      }
    })();
    return running;
  };
  const mutateMany = (operations: Omit<ShopperOperation, 'id' | 'base'>[]) => {
    const added = operations.map(operation => ({ ...operation, id: crypto.randomUUID(), base: saved.base.revision, at: lastOperationTime = Math.max(Date.now(), lastOperationTime + 1) }));
    if (!added.every(validShopperOperation) || saved.pending.length + added.length > 2000) { report(Error('Shopping operation limit'), 'shopper-change'); throw Error('Shopping change rejected; reconnect and retry'); }
    saved.pending.push(...added);
    if (owner) { status = 'pending'; schedule(); }
    else if (saved.pending.length >= 500) {
      saved.base = optimisticShopper(saved.base, saved.pending); saved.base.revision++;
      saved.acknowledged = [...(saved.acknowledged || []), ...saved.pending.map(row => row.id)].slice(-2000); saved.pending = [];
    }
    persist(); emit();
  };
  const mutate = (operation: Omit<ShopperOperation, 'id' | 'base'>) => mutateMany([operation]);
  saved = read();
  let hasGuestCache = false;
  try { hasGuestCache = !!storage.getItem('vant_shopper_v1:guest'); } catch (error) { report(error, 'shopper-cache-read'); notice = 'cache-unavailable'; }
  if (!hasGuestCache) {
    try {
      const legacy = JSON.parse(storage.getItem('vant_cart_items') || '[]');
      if (Array.isArray(legacy)) for (const raw of legacy) { const item = normalizeCartItem(raw); if (item) saved.base.cart[item.id] = item; }
      const wishlist = JSON.parse(storage.getItem('vant_wishlist') || '[]');
      if (Array.isArray(wishlist)) saved.base.wishlist = normalizeShopperDocument({ ...emptyShopper(), wishlist: Object.fromEntries(wishlist.slice(0, 2000).filter(id => typeof id === 'string').map(id => [id, true])) }).wishlist;
    } catch (error) { report(error, 'shopper-legacy-import'); notice = 'cache-unavailable'; }
    persist();
  }
  emit();
  return {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => snapshot,
    change(item: CartItem, delta: number) {
      const legacy = snapshot.items.find(row => row.productId === item.productId && row.size === item.size && !row.variantId && row.color === item.color);
      if (legacy) item = { ...item, id: legacy.id };
      const view = optimisticShopper(saved.base, saved.pending), previous = view.cart[item.id]?.quantity || 0;
      if (!previous && snapshot.items.length >= 200) throw Error('Cart limit');
      if (!Number.isSafeInteger(delta) || previous + delta > 99 || previous + delta < 0) throw Error('quantity');
      mutate({ kind: 'delta', key: item.id, item, delta, restore: !previous });
    },
    remove(id: string) { mutate({ kind: 'remove', key: id }); },
    clear() { mutateMany(snapshot.items.map(item => ({ kind: 'remove', key: item.id }))); },
    toggleWishlist(id: string) { if (!snapshot.wishlist.has(id) && snapshot.wishlist.size >= 2000) { notice = 'wishlist-limit'; emit(); return; } mutate({ kind: 'wish', key: id, enabled: !snapshot.wishlist.has(id) }); },
    setCoupon(code: string) { mutate({ kind: 'coupon', code }); },
    async activate(nextOwner: string | null) {
      if (nextOwner === owner) return;
      const guest = !owner ? snapshot : null;
      const guestId = saved.guestId;
      epoch++; failures = 0; if (timer) clearTimeout(timer); timer = undefined; running = undefined;
      owner = nextOwner; saved = read(); status = owner ? 'pending' : 'guest'; notice = owner ? 'merging' : '';
      try { storage.setItem('vant_shopper_last_owner', owner || ''); } catch (error) { report(error, 'shopper-owner-cache'); }
      if (owner && guest && (guest.items.length || guest.wishlist.size || guest.coupon) && !saved.pending.some(op => op.id === guestId)) saved.pending.push({ id: guestId, base: 0, kind: 'merge', cart: guest.items, wishlist: [...guest.wishlist], code: guest.coupon });
      persist(); emit(); if (owner) await flush();
    },
    async refresh() { await flush(); },
    restoreCachedOwner() {
      if (owner) return;
      try {
        const cached = storage.getItem('vant_shopper_last_owner');
        if (cached && /^[a-zA-Z0-9-]{1,120}$/.test(cached)) { owner = cached; saved = read(); status = 'offline'; notice = 'cached-session'; emit(); }
      } catch (error) { report(error, 'shopper-owner-cache'); }
    },
    externalUpdate(storageKey: string | null) {
      if (storageKey !== key()) return;
      const external = read();
      const acknowledged = new Set([...(saved.acknowledged || []), ...(external.acknowledged || [])]);
      const combined = new Map([...saved.pending, ...external.pending].filter(op => !acknowledged.has(op.id)).map(op => [op.id, op]));
      const base = external.base.revision > saved.base.revision ? external.base : saved.base;
      saved = { ...saved, base, guestId: [saved.guestId, external.guestId].sort()[0], pending: [...combined.values()].sort((a, b) => (a.at || 0) - (b.at || 0) || a.id.localeCompare(b.id)), acknowledged: [...acknowledged].sort().slice(-2000) };
      lastOperationTime = Math.max(lastOperationTime, ...saved.pending.map(op => op.at || 0));
      notice = 'updated-from-account'; status = owner ? saved.pending.length ? 'pending' : 'synced' : 'guest';
      try { if (JSON.stringify(saved) !== storage.getItem(key())) persist(); }
      catch (error) { status = 'memory'; notice = 'cache-unavailable'; report(error, 'shopper-tab-cache'); }
      emit(); if (owner) schedule();
    },
    offline() { status = owner ? 'offline' : 'guest'; notice = 'offline'; emit(); },
    sessionError() { status = owner ? 'error' : 'guest'; notice = 'account-unavailable'; emit(); },
    dispose() { epoch++; if (timer) clearTimeout(timer); listeners.clear(); },
  };
}

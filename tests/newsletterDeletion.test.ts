import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

test('a denied or zero-row cloud deletion cannot remove a local subscription or report success', async () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const stored = JSON.stringify([{ id: 'contact', email: 'test@example.test', status: 'active' }]);
  const values = new Map([['vant_subscribers_list_v2', stored]]);
  const fixture: any = { result: { data: [], error: null }, writes: 0, storageWrites: 0 };
  (globalThis as any).newsletterDeleteFixture = fixture;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => { fixture.writes++; values.set(key, value); } } });
  try {
    const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/lib/newsletter.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'delete-fixture', setup(builder) {
      builder.onResolve({ filter: /^\.\/(storage|supabase)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents: path === './supabase' ? 'export const supabase={from:()=>({delete:()=>({eq:()=>({select:async()=>globalThis.newsletterDeleteFixture.result})}),insert:async()=>({})}),storage:{from:()=>({upload:async()=>{globalThis.newsletterDeleteFixture.storageWrites++;return {error:null};}})}};' : 'export const uploadImageToSupabase=async()=>null; export const resolveStoredImages=v=>v;' }));
    } }] });
    const { removeSubscriber } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
    assert.equal(await removeSubscriber('contact'), false);
    fixture.result = { data: null, error: { message: 'permission denied' } };
    assert.equal(await removeSubscriber('contact'), false);
    assert.equal(values.get('vant_subscribers_list_v2'), stored); assert.equal(fixture.writes, 0);
    fixture.result = { data: [{ id: 'contact' }], error: null };
    assert.equal(await removeSubscriber('contact'), true);
    assert.equal(values.get('vant_subscribers_list_v2'), '[]');
    assert.equal(fixture.storageWrites, 0, 'subscriber contact lists must never be uploaded into the public image bucket');
  } finally {
    delete (globalThis as any).newsletterDeleteFixture;
    for (const [key, descriptor] of [['window', originalWindow], ['localStorage', originalStorage]] as const) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete (globalThis as any)[key]; }
  }
});

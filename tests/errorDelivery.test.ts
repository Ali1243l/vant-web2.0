import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

test('error capture registers once, removes secrets, persists failures and retries without public snapshots', async () => {
  const names = ['window', 'document', 'navigator', 'localStorage'];
  const originals = names.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  const values = new Map<string, string>();
  const listeners = new Map<string, Function[]>();
  const fixture: any = { fail: true, inserts: [], statusError: true };
  (globalThis as any).errorFixture = fixture;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { href: 'https://vant.test/?token=VERY_PRIVATE#access_token=VERY_PRIVATE' }, innerWidth: 390, innerHeight: 844, dispatchEvent: () => true, addEventListener: (name: string, callback: Function) => listeners.set(name, [...listeners.get(name) || [], callback]) } });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { visibilityState: 'visible', documentElement: { lang: 'ar' } } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true, userAgent: 'iPhone Mobile Safari' } });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => values.set(key, value) } });
  try {
    const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/lib/analytics/tracker.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'error-fixture', setup(builder) {
      builder.onResolve({ filter: /\/supabase$/ }, args => ({ path: args.path, namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `export const supabase={from:()=>({insert:async row=>{globalThis.errorFixture.inserts.push(row);return {error:globalThis.errorFixture.fail?{message:'offline'}:null};},select:()=>({eq:()=>({maybeSingle:async()=>({data:{id:'uuid',data:{}},error:null})})}),update:()=>({eq:()=>({select:()=>({maybeSingle:async()=>({data:null,error:{message:'denied'}})})})})})};` }));
    } }] });
    const tracker = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
    tracker.installErrorTracking(); tracker.installErrorTracking();
    assert.equal(listeners.get('error')!.length, 1); assert.equal(listeners.get('unhandledrejection')!.length, 1);
    const id = tracker.trackSystemError('Failure password=VERY_PRIVATE person@example.com', 'at https://vant.test/app.js?token=VERY_PRIVATE:1', { kind: 'save', operation: 'save-product' });
    assert.equal(tracker.trackSystemError('Failure password=VERY_PRIVATE person@example.com', 'at https://vant.test/app.js?token=VERY_PRIVATE:1', { kind: 'save', operation: 'save-product' }), id);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(fixture.inserts.length, 1);
    assert.ok(!JSON.stringify(fixture.inserts).includes('VERY_PRIVATE')); assert.ok(!JSON.stringify(fixture.inserts).includes('person@example.com'));
    const row = fixture.inserts[0]; assert.equal(row.device, 'mobile'); assert.equal(row.data.viewport, '390×844'); assert.equal(row.data.operation, 'save-product');
    assert.equal(JSON.parse(values.get('vant_error_queue_v1')!).length, 1);
    assert.equal(await tracker.updateSystemErrorStatus(id, 'resolved'), false);
    assert.equal(tracker.getStoredEvents()[0].data.status, 'open');
    fixture.fail = false;
    listeners.get('online')![0](); await new Promise(resolve => setImmediate(resolve));
    assert.equal(JSON.parse(values.get('vant_error_queue_v1')!).length, 0);
    assert.equal(fixture.inserts.length, 2);
  } finally {
    await new Promise(resolve => setTimeout(resolve, 5));
    delete (globalThis as any).errorFixture;
    for (const [key, descriptor] of originals) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete (globalThis as any)[key]; }
  }
});

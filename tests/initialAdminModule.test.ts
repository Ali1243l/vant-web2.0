import test from 'node:test';
import assert from 'node:assert/strict';
import { initialAdminModule, staleAdminModule } from '../src/lib/initialAdminModule.ts';

test('outdated admin entry modules recover once, preserve the admin destination and never reload an existing workspace', async () => {
  const originals = ['window', 'document', 'sessionStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  const saved = new Map<string, string>();
  let ready = false, reloads = 0, destination = '';
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { querySelector: () => ready ? {} : null } });
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: (key: string) => saved.get(key) || null, setItem: (key: string, value: string) => saved.set(key, value) } });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { href: 'https://example.test/?lang=ar', reload: () => reloads++ }, history: { state: {}, replaceState: (_state: unknown, _title: string, url: URL) => { destination = url.href; } } } });
  try {
    assert.equal(await initialAdminModule(async () => 'module'), 'module');
    assert.equal(staleAdminModule('ordinary data error'), false);
    const fail = async () => { throw new TypeError('Failed to fetch dynamically imported module: old.js'); };
    void initialAdminModule(fail);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(reloads, 1);
    assert.equal(new URL(destination).searchParams.get('lang'), 'ar');
    assert.ok(new URL(destination).searchParams.has('admin'));
    await assert.rejects(initialAdminModule(fail), /dynamically/);
    saved.clear(); ready = true;
    await assert.rejects(initialAdminModule(fail), /dynamically/);
    assert.equal(reloads, 1);
  } finally {
    for (const [key, original] of originals) { if (original) Object.defineProperty(globalThis, key, original); else delete (globalThis as any)[key]; }
  }
});

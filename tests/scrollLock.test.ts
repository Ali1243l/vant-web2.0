import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

test('nested overlays lock the viewport without turning body into a competing sticky scroll container', async () => {
  const cleanups: Array<() => void> = [];
  (globalThis as any).scrollLockEffect = (fn: () => (() => void) | undefined) => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup); };
  const originals = ['document', 'window'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  const html = { clientWidth: 380, style: { overflow: 'clip visible', overscrollBehavior: '' } };
  const body = { style: { overflow: 'clip visible', paddingRight: '', overscrollBehavior: '' } };
  const listeners = new Set<string>();
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { documentElement: html, body } });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { innerWidth: 390, addEventListener: (name: string) => listeners.add(name), removeEventListener: (name: string) => listeners.delete(name) } });
  try {
    const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/hooks/useScrollLock.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'scroll-fixture', setup(builder) {
      builder.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const useEffect=fn=>globalThis.scrollLockEffect(fn);' }));
    } }] });
    const { useScrollLock } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
    useScrollLock(true); useScrollLock(true);
    assert.equal(html.style.overflow, 'hidden');
    assert.equal(body.style.overflow, 'clip visible');
    assert.equal(body.style.paddingRight, '10px');
    cleanups[0](); assert.equal(html.style.overflow, 'hidden');
    assert.equal(listeners.size, 3);
    cleanups[1](); assert.equal(html.style.overflow, 'clip visible');
    assert.equal(body.style.paddingRight, '');
    assert.equal(listeners.size, 0);
  } finally {
    delete (globalThis as any).scrollLockEffect;
    for (const [key, original] of originals) { if (original) Object.defineProperty(globalThis, key, original); else delete (globalThis as any)[key]; }
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

test('opening and closing a modal moves focus without scrolling the storefront or header', async () => {
  const cleanups: Array<() => void> = [];
  (globalThis as any).modalFocusEffects = (fn: () => (() => void) | undefined) => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup); };
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const focused: unknown[] = [];
  const trigger = { isConnected: true, focus: (options: unknown) => focused.push(options) };
  const panel = { querySelectorAll: () => [], focus: (options: unknown) => focused.push(options) };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { activeElement: trigger, body: {}, querySelectorAll: () => [], addEventListener() {}, removeEventListener() {} } });
  try {
    const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/hooks/useModalFocus.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'focus-fixture', setup(builder) {
      builder.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const useRef=current=>({current}); export const useLayoutEffect=fn=>globalThis.modalFocusEffects(fn);' }));
    } }] });
    const { useModalFocus } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
    useModalFocus(true, { current: panel }, () => {});
    cleanups.forEach(fn => fn());
    await Promise.resolve();
    assert.deepEqual(focused, [{ preventScroll: true }, { preventScroll: true }]);
  } finally {
    delete (globalThis as any).modalFocusEffects;
    if (original) Object.defineProperty(globalThis, 'document', original); else delete (globalThis as any).document;
  }
});

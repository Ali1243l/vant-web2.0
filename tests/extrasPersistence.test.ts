import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

test('admin extras keep their previous state on rejection and serialize successful edits without overwriting unrelated sections', async () => {
  const fixture: any = { states: [], writes: [], save: async () => false };
  (globalThis as any).extrasFixture = fixture;
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem: (...args: unknown[]) => fixture.writes.push(args) } });
  try {
    const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/context/site_controls/useExtrasState.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'extras-fixture', setup(builder) {
      builder.onResolve({ filter: /^(react|.*\/storage|.*\/supabase)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents: path === 'react' ? 'export const useRef=current=>({current}); export const useEffect=()=>{}; export const useState=initial=>{const i=globalThis.extrasFixture.states.length; const v=typeof initial==="function"?initial():initial; globalThis.extrasFixture.states.push(v);return [v,next=>globalThis.extrasFixture.states[i]=next];};' : path.endsWith('/supabase') ? 'export const supabase={};' : 'export const saveSiteConfigToSupabase=(...args)=>globalThis.extrasFixture.save(...args);' }));
    } }] });
    const { useExtrasState } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
    const extras = useExtrasState();
    const before = JSON.stringify(fixture.states);
    assert.equal(await extras.updateSocialLink(extras.socialLinks[0].id, { handle: 'failed' }), false);
    assert.equal(JSON.stringify(fixture.states), before);
    assert.equal(fixture.writes.length, 0);
    let release!: () => void;
    const patches: any[] = [];
    fixture.save = async (patch: unknown, strict: boolean) => {
      assert.equal(strict, true); patches.push(patch);
      if (patches.length === 1) await new Promise<void>(resolve => { release = resolve; });
      return true;
    };
    const first = extras.updateSocialLink(extras.socialLinks[0].id, { handle: 'new-name' });
    const second = extras.updateSocialLink(extras.socialLinks[0].id, { href: 'https://example.test/new' });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(patches.length, 1);
    assert.equal(JSON.stringify(fixture.states), before);
    release();
    assert.deepEqual(await Promise.all([first, second]), [true, true]);
    assert.deepEqual(Object.keys(patches[0]), ['socialLinks']);
    assert.equal(patches[1].socialLinks[0].handle, 'new-name');
    assert.equal(patches[1].socialLinks[0].href, 'https://example.test/new');
    assert.equal(fixture.states[1][0].handle, 'new-name');
    assert.equal(await extras.updateSocialLink(extras.socialLinks[0].id, { href: 'javascript:alert(1)' }), false);
    assert.equal(patches.length, 2);
  } finally {
    delete (globalThis as any).extrasFixture;
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous); else delete (globalThis as any).localStorage;
  }
});

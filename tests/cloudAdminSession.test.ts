import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

test('admin reopening restores only a server-verified admin session and sign-out cancels pending restoration', async () => {
  const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/context/site_controls/useSiteSettingsAndAdmin.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'session-fixture', setup(builder) {
    builder.onResolve({ filter: /^(react|.*\/supabase|.*\/storage|.*\/safeStorage)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents: path === 'react'
      ? 'export const useState=value=>{const i=globalThis.adminSessionFixture.states.length;globalThis.adminSessionFixture.states.push(typeof value==="function"?value():value);return [globalThis.adminSessionFixture.states[i],value=>globalThis.adminSessionFixture.states[i]=value]}; export const useEffect=fn=>globalThis.adminSessionFixture.effects.push(fn); export const useCallback=fn=>fn;'
      : path.endsWith('/supabase') ? 'export const supabase={auth:{getUser:()=>globalThis.adminSessionFixture.getUser(),onAuthStateChange:fn=>{globalThis.adminSessionFixture.listener=fn;return {data:{subscription:{unsubscribe(){}}}}}},rpc:async()=>({data:globalThis.adminSessionFixture.admin,error:null})};'
      : path.endsWith('/safeStorage') ? 'export const safeStorage={getItem:()=>null,getItemJSON:(key,fallback)=>fallback};'
      : 'export const saveSiteConfigToSupabase=async()=>true;' }));
  } }] });
  const fixture: any = { states: [], effects: [], admin: false, getUser: async () => ({ data: { user: { id: 'user' } }, error: null }) };
  (globalThis as any).adminSessionFixture = fixture;
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  const session = new Map<string, string>();
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { setItem: (key: string, value: string) => session.set(key, value), removeItem: (key: string) => session.delete(key) } });
  const flush = () => new Promise(resolve => setTimeout(resolve, 10));
  try {
    const { useSiteSettingsAndAdmin } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
    useSiteSettingsAndAdmin();
    const cleanup = fixture.effects[0]();
    await flush();
    assert.equal(fixture.states[2], false);
    fixture.admin = true;
    fixture.listener('SIGNED_IN');
    await flush();
    assert.equal(fixture.states[2], true);
    assert.equal(session.get('vant_admin_auth_session'), 'true');
    let finish: (value: unknown) => void;
    fixture.getUser = () => new Promise(resolve => { finish = resolve; });
    fixture.listener('TOKEN_REFRESHED');
    await flush();
    fixture.listener('SIGNED_OUT');
    finish!({ data: { user: { id: 'admin' } }, error: null });
    await flush();
    assert.equal(fixture.states[2], false);
    assert.equal(session.has('vant_admin_auth_session'), false);
    cleanup();
  } finally {
    delete (globalThis as any).adminSessionFixture;
    if (previousStorage) Object.defineProperty(globalThis, 'sessionStorage', previousStorage);
    else delete (globalThis as any).sessionStorage;
  }
});

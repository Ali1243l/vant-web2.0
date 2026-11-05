import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

test('live config checks metadata, downloads changed content and always reads fresh before writes', async t => {
  t.mock.method(console, 'warn', () => {});
  const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/lib/storage.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'config-fixture', setup(builder) {
    builder.onResolve({ filter: /^\.\/supabase$/ }, args => ({ path: args.path, namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const supabase={storage:{from:()=>({upload:async()=>({error:null}),download:async()=>({data:await(await fetch("https://example.test/config.json")).blob(),error:null}),getPublicUrl:()=>({data:{publicUrl:"https://example.test/config.json"}})})}};' }));
  } }] });
  const { fetchSiteConfigFromSupabase: read, saveSiteConfigToSupabase: save } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  const originalFetch = globalThis.fetch;
  let modified = 'Wed, 04 Nov 2026 21:06:29 GMT';
  let version = 1;
  let failure = false;
  let metadataFailure = false;
  const requests: string[] = [];
  globalThis.fetch = async (_url, init) => {
    const method = init?.method || 'GET'; requests.push(method);
    if (failure || (metadataFailure && method === 'HEAD')) throw new Error('offline');
    return new Response(method === 'HEAD' ? null : JSON.stringify({ version }), { headers: { 'last-modified': modified } });
  };
  try {
    assert.equal((await read())?.version, 1);
    assert.equal((await read())?.version, 1);
    assert.deepEqual(requests.splice(0), ['GET', 'HEAD']);
    modified = 'Wed, 04 Nov 2026 21:07:29 GMT'; version = 2;
    assert.equal((await read())?.version, 2);
    assert.deepEqual(requests.splice(0), ['HEAD', 'GET']);
    metadataFailure = true;
    assert.equal((await read())?.version, 2);
    assert.deepEqual(requests.splice(0), ['HEAD', 'GET']);
    metadataFailure = false;
    await save({ currency: 'IQD' }, true);
    assert.deepEqual(requests.splice(0), ['GET']);
    await read();
    assert.deepEqual(requests.splice(0), ['GET']);
    failure = true;
    assert.equal(await read(false), null);
    assert.equal((await read())?.version, 2);
    assert.equal(await save({}, true), false);
  } finally { globalThis.fetch = originalFetch; }
});

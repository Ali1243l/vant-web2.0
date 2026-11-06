import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

test('cloud config saves serialize, retain unrelated sections and reject stale reads or failed writes', async () => {
  let config: any = { controls: { banner_hero_bg: { actionValue: 'https://example.test/old.jpg' }, unrelated: { label_ar: 'keep' } }, banner_hero_bg: 'https://example.test/old.jpg', trendItems: [{ id: 'kept' }] };
  let failRead = false, failWrite = false, uploads = 0;
  const fixture = {
    download: async () => failRead ? { error: { message: 'offline' } } : { data: new Blob([JSON.stringify(config)]) },
    upload: async (_path: string, blob: Blob) => { uploads++; if (failWrite) return { error: { message: 'permission denied' } }; config = JSON.parse(await blob.text()); return { error: null }; },
  };
  (globalThis as any).configSaveFixture = fixture;
  try {
    const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/lib/storage.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'cloud-config-fixture', setup(builder) {
      builder.onResolve({ filter: /^\.\/supabase$/ }, args => ({ path: args.path, namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const supabase={storage:{from:()=>({download:(...a)=>globalThis.configSaveFixture.download(...a),upload:(...a)=>globalThis.configSaveFixture.upload(...a)})}};' }));
    } }] });
    const { saveSiteConfigToSupabase, isConfigSavePending } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
    const first = saveSiteConfigToSupabase({ controls: { one: { enabled: false } } }, true);
    const second = saveSiteConfigToSupabase({ controls: { two: { label_en: 'saved' } } }, true);
    assert.equal(isConfigSavePending(), true);
    assert.deepEqual(await Promise.all([first, second]), [true, true]);
    assert.equal(config.controls.one.enabled, false); assert.equal(config.controls.two.label_en, 'saved');
    assert.equal(config.controls.unrelated.label_ar, 'keep'); assert.deepEqual(config.trendItems, [{ id: 'kept' }]);
    assert.equal(isConfigSavePending(), false);
    failRead = true;
    assert.equal(await saveSiteConfigToSupabase({ controls: { lost: {} } }, true), false);
    assert.equal(uploads, 2, 'a cached snapshot must not overwrite cloud data when the fresh read fails');
    failRead = false; failWrite = true;
    await assert.rejects(saveSiteConfigToSupabase({ controls: { lost: {} } }, true), /permission denied/);
    assert.equal(config.controls.lost, undefined); assert.equal(isConfigSavePending(), false);
    failWrite = false;
    assert.equal(await saveSiteConfigToSupabase({ controls: { banner_hero_bg: { actionValue: '' } } }, true), true);
    assert.equal(config.banner_hero_bg, ''); assert.equal(config.controls.banner_hero_bg.actionValue, '');
  } finally { delete (globalThis as any).configSaveFixture; }
});

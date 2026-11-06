import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { BANNER_THEMES, themeAppearance } from '../src/lib/bannerThemes.ts';

test('product photographs have no seasonal stamps or snow piles', async () => {
  const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/components/StoreSeasonAtmosphere.tsx', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', loader: { '.css': 'empty' } });
  const { StoreSeasonCard } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  for (const theme of BANNER_THEMES) {
    const markup = renderToStaticMarkup(React.createElement(StoreSeasonCard, { settings: themeAppearance(theme) }));
    assert.doesNotMatch(markup, /<svg|<img|snow-crown|snow-drift|store-season-photo-art|store-season-card-glyph/);
    if (theme.id === 'winter') assert.equal(markup, '');
  }
});

test('campaign illustrations have twelve distinct, self-contained compositions and no invented offer amounts', async () => {
  const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/components/SeasonalIllustration.tsx', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node' });
  const { default: Illustration } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  const drawings = BANNER_THEMES.map(theme => {
    const markup = renderToStaticMarkup(React.createElement(Illustration, { scene: theme.id }));
    assert.match(markup, /viewBox="0 0 300 300"/);
    assert.match(markup, /data-season-detail="[a-z-]+"/);
    assert.doesNotMatch(markup, /NaN|undefined|<text|<image|<filter|foreignObject|href=/);
    assert.ok(Buffer.byteLength(markup) < 6000, `${theme.id} artwork exceeds its inline size budget`);
    assert.ok((markup.match(/<[a-z][a-z-]*(?=[\s>])/g) || []).length < 80, `${theme.id} artwork has too many elements`);
    if (theme.id === 'ramadan') {
      for (const part of ['lantern-high', 'lantern-low']) {
        const lantern = markup.match(new RegExp(`<g data-season-part="${part}">([\\s\\S]*?)</g>`))?.[1];
        assert.ok(lantern, 'each lantern is one moving unit');
        assert.match(lantern, /V62|V108/, 'the cord moves with the lantern');
        assert.match(lantern, /fill="var\(--season-paper/, 'the glass moves with the body');
      }
    }
    return markup.replace(/data-season-illustration="[^"]+"/, '');
  });
  assert.equal(new Set(drawings).size, 12);
  assert.equal(renderToStaticMarkup(React.createElement(Illustration, { scene: 'none' })), '');
});

test('every seasonal margin has distinct lightweight scenery', async () => {
  const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/components/SeasonalBackdrop.tsx', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node' });
  const { default: Backdrop } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  const drawings = BANNER_THEMES.map(theme => {
    const markup = renderToStaticMarkup(React.createElement(Backdrop, { scene: theme.id }));
    assert.match(markup, /aria-hidden="true"/);
    assert.doesNotMatch(markup, /NaN|undefined|<text|<image|<filter|foreignObject|href=/);
    assert.ok(Buffer.byteLength(markup) < 4500);
    assert.ok((markup.match(/<[a-z][a-z-]*(?=[\s>])/g) || []).length < 60);
    return markup.replace(/data-season-backdrop="[^"]+"/, '');
  });
  assert.equal(new Set(drawings).size, 12);
  assert.equal(renderToStaticMarkup(React.createElement(Backdrop, { scene: 'none' })), '');
});

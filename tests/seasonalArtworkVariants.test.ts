import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { BANNER_THEMES, themeAppearance } from '../src/lib/bannerThemes.ts';
import { snowCaps } from '../src/lib/seasonalDistribution.ts';
import { readFileSync } from 'node:fs';

test('photographs stay free of decorative stamps; winter snow is a separate crown above the image', async () => {
  const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/components/StoreSeasonAtmosphere.tsx', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', loader: { '.css': 'empty' } });
  const { StoreSeasonCard, StoreSnowCrown } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  for (const theme of BANNER_THEMES) {
    const settings = themeAppearance(theme);
    const markup = renderToStaticMarkup(React.createElement(StoreSeasonCard, { settings }));
    assert.doesNotMatch(markup, /<svg|store-season-photo-art|store-season-card-glyph/);
    const crown = renderToStaticMarkup(React.createElement(StoreSnowCrown, { settings, variant: 0 }));
    if (theme.id === 'winter') assert.match(crown, /store-snow-crown/);
    else assert.equal(crown, '');
  }
  const settings = themeAppearance(BANNER_THEMES[0]);
  const crowns = Array.from({ length: 10 }, (_, variant) => renderToStaticMarkup(React.createElement(StoreSnowCrown, { settings, variant })));
  assert.equal(new Set(crowns.map(crown => crown.match(/src="[^"]+"/)?.[0])).size, 10);
  const artwork = snowCaps.map(path => readFileSync(new URL(`../public${path}`, import.meta.url), 'utf8'));
  assert.equal(new Set(artwork).size, 10);
  for (const svg of artwork) {
    assert.match(svg, /viewBox="0 0 384 16"/);
    assert.doesNotMatch(svg, /<script|<image|foreignObject|<ellipse/);
    assert.ok(Buffer.byteLength(svg) < 2000, 'snow crowns stay lightweight');
  }
  for (const patch of [{ motif: 'none' }, { motifOpacity: 0 }]) assert.equal(renderToStaticMarkup(React.createElement(StoreSnowCrown, { settings: { ...settings, ...patch }, variant: 0 })), '');
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

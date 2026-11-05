import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { BANNER_THEMES, themeAppearance } from '../src/lib/bannerThemes.ts';

test('all twelve store scenes contain ten genuinely different glyph geometries', async () => {
  const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/components/StoreSeasonAtmosphere.tsx', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', loader: { '.css': 'empty' } });
  const { StoreSeasonCard } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  for (const theme of BANNER_THEMES) {
    const glyphs = Array.from({ length: 10 }, (_, variant) => {
      const markup = renderToStaticMarkup(React.createElement(StoreSeasonCard, { settings: themeAppearance(theme), variant }));
      return markup.slice(markup.lastIndexOf('<svg'), markup.lastIndexOf('</svg>'));
    });
    assert.equal(new Set(glyphs).size, 10, theme.id);
  }
});

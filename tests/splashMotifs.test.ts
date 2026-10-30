import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, rmdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';

test('all eight loading motifs render in both appearances and the seven redesigns are distinct', () => {
  const directory = mkdtempSync(join(tmpdir(), 'vant-motif-check-'));
  const file = join(directory, 'check.cjs');
  try {
    const result = buildSync({ stdin: { resolveDir: fileURLToPath(new URL('../', import.meta.url)), contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import assert from 'node:assert/strict';
      import FashionMotifGraphic from './src/components/splash/FashionMotifGraphic';
      import StudioMotifGraphic from './src/components/splash/StudioMotifGraphic';
      import { AVAILABLE_SPLASH_MOTIFS } from './src/components/splash/splashMotifs';
      assert.equal(new Set(AVAILABLE_SPLASH_MOTIFS.map(row => row.id)).size, 8);
      const variants = new Set();
      for (const row of AVAILABLE_SPLASH_MOTIFS) for (const isDark of [true, false]) {
        const markup = renderToStaticMarkup(React.createElement(FashionMotifGraphic, { motif: row.id, isDark }));
        assert.ok(markup.includes('<svg'));
        assert.ok(!markup.includes('NaN'));
        if (row.id === 'tshirt_print') {
          assert.ok(!markup.includes('data-studio-motif'));
          assert.ok(markup.includes('M50 25 C40 25'));
        } else {
          assert.ok(markup.includes('data-studio-motif="' + row.id + '"'));
          assert.ok(markup.includes(isDark ? 'studio-motif--dark' : 'studio-motif--light'));
          if (isDark) variants.add(markup);
          const thumbnail = renderToStaticMarkup(React.createElement(StudioMotifGraphic, { motif: row.id, isDark, paused: true }));
          assert.ok(thumbnail.includes('studio-motif--paused'));
        }
      }
      assert.equal(variants.size, 7);
      for (const motif of ['unknown', '__proto__', 'constructor']) {
        const markup = renderToStaticMarkup(React.createElement(FashionMotifGraphic, { motif, isDark: true }));
        assert.ok(markup.includes('data-studio-motif="monogram"'));
      }
      console.log('motifs-ok');
    ` }, bundle: true, platform: 'node', format: 'cjs', write: false, loader: { '.css': 'empty' }, logLevel: 'silent' });
    writeFileSync(file, result.outputFiles[0].text);
    assert.equal(execFileSync(process.execPath, [file], { encoding: 'utf8' }).trim(), 'motifs-ok');
  } finally { rmSync(file, { force: true }); rmdirSync(directory); }
});

test('the user-selected T-shirt drawing and animation remain exactly unchanged', () => {
  const source = readFileSync(new URL('../src/components/splash/FashionMotifGraphic.tsx', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  const selected = source.slice(source.indexOf("  if (motif === 'tshirt_print')"), source.indexOf('  return null;')).trimEnd();
  assert.equal(createHash('sha256').update(selected).digest('hex'), '6bdca1b55e2f3503436696ccba8148632e44cee9c9b0b9036cb09d83debe53e7');
});

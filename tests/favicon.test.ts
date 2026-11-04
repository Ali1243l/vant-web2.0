import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('favicon assets provide real square PNGs and three valid ICO frames', () => {
  for (const [name, size] of [['favicon-96.png', 96], ['apple-touch-icon.png', 180]] as const) {
    const image = readFileSync(new URL(`../public/${name}`, import.meta.url));
    assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(image.readUInt32BE(16), size);
    assert.equal(image.readUInt32BE(20), size);
  }
  const ico = readFileSync(new URL('../public/favicon.ico', import.meta.url));
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  for (const [index, size] of [16, 32, 48].entries()) {
    const entry = 6 + index * 16;
    assert.equal(ico[entry], size);
    assert.equal(ico[entry + 1], size);
    const bytes = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    assert.ok(offset >= 54 && offset + bytes <= ico.length);
    assert.equal(ico.subarray(offset, offset + 8).toString('hex'), '89504e470d0a1a0a');
  }
});

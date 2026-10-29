import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateRecommendedSize, DEFAULT_MASTER_SIZES, validateMasterSize, activeSizeRows, sizeRange, parseFitMeasurement } from '../src/data/sizeGuide.ts';
const row = (extra = {}) => ({ ...DEFAULT_MASTER_SIZES[2], ...extra });

test('size recommendation requires both dimensions, includes boundaries and does not infer girth from weight', () => {
  assert.equal(calculateRecommendedSize(173, 66)?.size, 'M');
  assert.equal(calculateRecommendedSize(178, 75)?.size, 'M');
  assert.equal(calculateRecommendedSize(175, 80)?.size, undefined);
  assert.equal(calculateRecommendedSize(210, 70)?.isBespoke, true);
});
test('empty, disabled or malformed guides never crash or fall back to default recommendations', () => {
  for (const rows of [[], DEFAULT_MASTER_SIZES.map(r => ({ ...r, enabled: false })), [row({ minWeight: NaN })]]) {
    const result = calculateRecommendedSize(175, 70, rows);
    assert.equal(result?.size, undefined);
    assert.equal(result?.confidence, 'close');
  }
  assert.equal(calculateRecommendedSize(175, 70)?.size, 'M');
});
test('invalid and out of range calculator inputs cannot produce a result', () => {
  for (const pair of [[NaN, 70], [175, Infinity], [0, 70], [119, 70], [221, 70], [175, 29], [175, 201]]) {
    assert.equal(calculateRecommendedSize(pair[0], pair[1]), null);
  }
});
test('overlapping ranges choose normalized center distance and remain independent of display order', () => {
  const rows = [row({ id: 'b', size: 'B', minHeight: 160, maxHeight: 190, minWeight: 50, maxWeight: 90 }), row({ id: 'a', size: 'A' })];
  assert.equal(calculateRecommendedSize(175.5, 70.5, rows)?.size, 'A');
  assert.equal(calculateRecommendedSize(175.5, 70.5, [...rows].reverse())?.size, 'A');
  const tied = [row({ id: 'b', size: 'B' }), row({ id: 'a', size: 'A' })];
  assert.equal(calculateRecommendedSize(175, 70, tied)?.size, 'A');
});
test('admin validation rejects blank labels, duplicates, missing numbers and inverted boundaries', () => {
  assert.equal(validateMasterSize(row({ size: ' ' })), 'name');
  assert.equal(validateMasterSize(row({ id: 'new', size: ' m ' }), DEFAULT_MASTER_SIZES), 'duplicate');
  assert.equal(validateMasterSize(row(), DEFAULT_MASTER_SIZES), null);
  for (const extra of [{ minHeight: 180 }, { maxWeight: 60 }, { minHeight: 0 }, { maxHeight: 221 }, { minWeight: NaN }, { maxWeight: 201 }]) {
    assert.equal(validateMasterSize(row(extra)), 'range');
  }
});
test('displayed ranges use the calculator numbers even when legacy display text is stale', () => {
  const r = row({ height: 'wrong', weight: 'wrong' });
  assert.equal(sizeRange(r, 'height', false), '173 – 178 cm');
  assert.equal(sizeRange(r, 'weight', false), '66 – 75 kg');
  assert.equal(activeSizeRows([r, row({ id: 'bad', size: 'BAD', minWeight: Infinity })]).length, 1);
  assert.equal(activeSizeRows([r, row({ id: 'duplicate', size: ' m ' })]).length, 0);
});
test('custom names, decimal measurements and unusually high weights are governed by configured ranges', () => {
  const custom = row({ size: 'CUSTOM', minHeight: 150, maxHeight: 180, minWeight: 120, maxWeight: 160 });
  assert.equal(calculateRecommendedSize(155.5, 140.5, [custom])?.size, 'CUSTOM');
  assert.equal(calculateRecommendedSize(155.5, 140.5, [{ ...custom, enabled: false }])?.size, undefined);
});

test('measurement text accepts Arabic, Persian and English decimals but never silently strips junk', () => {
  for (const text of ['175', ' 175.5 ', '١٧٥٫٥', '۱۷۵.۵']) assert.equal(parseFitMeasurement(text), text.trim() === '175' ? 175 : 175.5);
  for (const text of ['', '1e2', '175cm', '17x5', '-175', '+175', '1,750', '175.', '175.555', 'Infinity', '١٧٥سم']) assert.equal(parseFitMeasurement(text), null);
  assert.equal(calculateRecommendedSize(parseFitMeasurement('١٧٥')!, parseFitMeasurement('٧٠')!)?.size, 'M');
});

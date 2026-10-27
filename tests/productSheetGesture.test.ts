import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldDismissProductSheet } from '../src/lib/productSheetGesture.ts';

test('a deliberate downward pull dismisses, while a short accidental movement stays open', () => {
  assert.equal(shouldDismissProductSheet(150, 0), true);
  assert.equal(shouldDismissProductSheet(12, 900), false);
  assert.equal(shouldDismissProductSheet(50, 100), false);
});
test('a downward flick dismisses but an upward gesture cannot', () => {
  assert.equal(shouldDismissProductSheet(40, 800), true);
  assert.equal(shouldDismissProductSheet(-120, -900), false);
});
test('invalid gesture coordinates never dismiss the product', () => {
  assert.equal(shouldDismissProductSheet(NaN, 900), false);
  assert.equal(shouldDismissProductSheet(120, Infinity), false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { splashCanFinish } from '../src/lib/splashLifecycle.ts';
test('loader cannot hide while data is loading even after its minimum display time', () => {
  assert.equal(splashCanFinish(false, true, true), false);
  assert.equal(splashCanFinish(false, false, false), false);
  assert.equal(splashCanFinish(false, false, true), true);
});
test('preview stays open when playback is complete, including after replay', () => {
  for (const loading of [true, false]) for (const elapsed of [true, false]) assert.equal(splashCanFinish(true, loading, elapsed), false);
});

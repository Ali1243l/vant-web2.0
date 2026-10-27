import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INITIAL_HEADER_SCROLL, nextHeaderScroll } from '../src/lib/headerScroll.ts';

test('downward scrolling compacts the toolbar and hides only categories', () => {
  const state = nextHeaderScroll(INITIAL_HEADER_SCROLL, 300);
  assert.equal(state.detached, true);
  assert.equal(state.categoriesVisible, false);
});

test('upward intent reveals categories; tiny reversals do not flicker them', () => {
  let state = nextHeaderScroll(INITIAL_HEADER_SCROLL, 300);
  state = nextHeaderScroll(state, 295);
  assert.equal(state.categoriesVisible, false);
  state = nextHeaderScroll(state, 280);
  assert.equal(state.categoriesVisible, true);
  state = nextHeaderScroll(state, 283);
  assert.equal(state.categoriesVisible, true);
  state = nextHeaderScroll(state, 310);
  assert.equal(state.categoriesVisible, false);
});

test('small scroll events accumulate and returning to top restores the full header', () => {
  let state = nextHeaderScroll(INITIAL_HEADER_SCROLL, 300);
  for (let y = 298; y >= 280; y -= 2) state = nextHeaderScroll(state, y);
  assert.equal(state.categoriesVisible, true);
  state = nextHeaderScroll(state, -20);
  assert.equal(state.categoriesVisible, true);
  assert.equal(state.detached, false);
  assert.equal(state.y, 0);
  assert.equal(nextHeaderScroll(state, NaN), state);
});

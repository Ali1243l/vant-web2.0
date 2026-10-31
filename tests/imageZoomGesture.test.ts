import assert from 'node:assert/strict';
import test from 'node:test';
import { cancelsImageHold, imageZoomPan, IMAGE_ZOOM_HOLD_MS } from '../src/lib/imageZoomGesture.ts';

test('a deliberate hold tolerates finger jitter but cancels swipes in either direction', () => {
  assert.ok(IMAGE_ZOOM_HOLD_MS >= 300);
  assert.equal(cancelsImageHold(100, 100, 103, 104), false);
  assert.equal(cancelsImageHold(100, 100, 109, 100), true);
  assert.equal(cancelsImageHold(100, 100, 100, 91), true);
  assert.equal(cancelsImageHold(100, 100, 106, 106), true);
  assert.equal(cancelsImageHold(100, 100, NaN, 100), true);
});

test('zoom pans toward details and clamps at image boundaries without invalid transforms', () => {
  assert.equal(imageZoomPan(100, 200, 1.8), 0);
  assert.equal(imageZoomPan(0, 200, 1.8), 80);
  assert.equal(imageZoomPan(200, 200, 1.8), -80);
  assert.equal(imageZoomPan(-999, 200, 1.8), 80);
  assert.equal(imageZoomPan(999, 200, 1.8), -80);
  assert.equal(imageZoomPan(10, 0, 1.8), 0);
  assert.equal(imageZoomPan(10, 200, 1), 0);
  assert.equal(imageZoomPan(NaN, 200, 1.8), 0);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { cancelsImageHold, imageDetailScale, imageLensAxis, imageLensOpacity, imageZoomPan, IMAGE_ZOOM_HOLD_MS } from '../src/lib/imageZoomGesture.ts';
import { zoomImageSource } from '../src/lib/responsiveImage.ts';

test('the lens starts fading just outside all four photo edges, including corners', () => {
  const opacity = (x: number, y: number) => imageLensOpacity(x, y, 80, 20, 300, 400);
  assert.equal(opacity(65, 220), 0);
  assert.equal(opacity(395, 220), 0);
  assert.equal(opacity(230, 5), 0);
  assert.equal(opacity(230, 435), 0);
  assert.equal(opacity(230, 220), 1);
  assert.ok(opacity(72, 220) > 0 && opacity(72, 220) < opacity(80, 220));
  assert.equal(opacity(80, 220), .5);
  assert.equal(opacity(72, 220), opacity(388, 220));
  assert.equal(opacity(72, 220), opacity(230, 12));
  assert.equal(opacity(72, 12), opacity(72, 220));
  assert.equal(imageLensOpacity(NaN, 0, 0, 0, 300, 400), 0);
});

test('a deliberate hold tolerates finger jitter but cancels swipes in either direction', () => {
  assert.ok(IMAGE_ZOOM_HOLD_MS >= 300);
  assert.equal(cancelsImageHold(100, 100, 103, 104), false);
  assert.equal(cancelsImageHold(100, 100, 109, 100), true);
  assert.equal(cancelsImageHold(100, 100, 100, 91), true);
  assert.equal(cancelsImageHold(100, 100, 106, 106), true);
  assert.equal(cancelsImageHold(100, 100, NaN, 100), true);
});

test('the edge lens and its magnified content stay inside the painted photo, including letterboxing', () => {
  for (const start of [0, 82]) for (const extent of [150, 300, 500]) for (const factor of [1, 1.4, 1.8]) {
    const diameter = Math.min(140, extent - 8);
    for (const point of [-999, start, start + extent / 2, start + extent, 9999]) {
      const axis = imageLensAxis(point, start, extent, diameter);
      assert.equal(axis.sample, axis.ring + diameter / 2);
      assert.ok(axis.ring >= start + 4 && axis.ring + diameter <= start + extent - 4);
      assert.ok(axis.sample - diameter / (2 * factor) >= start - 1e-9);
      assert.ok(axis.sample + diameter / (2 * factor) <= start + extent + 1e-9);
    }
  }
});

test('moving beyond a lens boundary cannot slide its content inside a stationary circle', () => {
  assert.deepEqual(imageLensAxis(0, 82, 300, 140), imageLensAxis(120, 82, 300, 140));
  assert.deepEqual(imageLensAxis(350, 82, 300, 140), imageLensAxis(999, 82, 300, 140));
});

test('raster detail scale respects source pixels and high density displays', () => {
  assert.equal(imageDetailScale(1600, 400, 1.8, 2), 1.8);
  assert.equal(imageDetailScale(800, 400, 1.8, 2), 1);
  assert.equal(imageDetailScale(300, 600, 1.8), 1);
  assert.equal(imageDetailScale(NaN, 400, 1.8), 1);
});

test('detail requests upgrade supported images without changing originals or signed links', () => {
  const original = 'https://images.unsplash.com/photo-example?w=800&q=80';
  const detail = new URL(zoomImageSource(original));
  assert.equal(detail.searchParams.get('w'), '1600');
  assert.equal(detail.searchParams.get('q'), '90');
  assert.equal(zoomImageSource('https://images.unsplash.com/photo-example?w=2400&q=95'), 'https://images.unsplash.com/photo-example?w=2400&q=95');
  for (const source of ['/uploaded.webp', 'data:image/svg+xml;base64,abc', 'https://example.com/pic.jpg', original + '&s=signature']) assert.equal(zoomImageSource(source), source);
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

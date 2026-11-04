import assert from 'node:assert/strict';
import test from 'node:test';
import { cancelsImageHold, imageDetailScale, imageLensAxis, imageLensClip, imageLensContentOffset, imageLensOpacity, imageZoomPan, IMAGE_ZOOM_HOLD_MS } from '../src/lib/imageZoomGesture.ts';
import { zoomImageSource } from '../src/lib/responsiveImage.ts';

test('the lens starts fading just outside all four photo edges, including corners', () => {
  const opacity = (x: number, y: number) => imageLensOpacity(x, y, 80, 20, 300, 400);
  assert.equal(opacity(65, 220), 0);
  assert.equal(opacity(395, 220), 0);
  assert.equal(opacity(230, 5), 0);
  assert.equal(opacity(230, 435), 0);
  assert.equal(opacity(230, 220), 1);
  assert.ok(opacity(72, 220) > 0 && opacity(72, 220) < opacity(80, 220));
  assert.equal(opacity(80, 220), 1);
  assert.equal(opacity(72, 220), opacity(388, 220));
  assert.equal(opacity(72, 220), opacity(230, 12));
  assert.equal(opacity(72, 12), opacity(72, 220));
  assert.equal(imageLensOpacity(NaN, 0, 0, 0, 300, 400), 0);
});

test('magnification preserves the pointer sample while its photo window aligns with original edges', () => {
  for (const start of [0, 28, 80]) for (const extent of [150, 300, 450]) for (const factor of [1, 1.2, 1.8]) {
    for (const point of [start, start + extent / 2, start + extent]) {
      const offset = imageLensContentOffset(point, start, extent, 140, factor);
      assert.equal(offset, 69 - point * factor);
      const clip = imageLensClip(point, start, extent, 140);
      const windowStart = point - 69 + clip.start;
      const windowEnd = point + 69 - clip.end;
      assert.ok(windowStart >= start && windowEnd <= start + extent);
      if (point - 69 < start) assert.equal(windowStart, start);
      if (point + 69 > start + extent) assert.equal(windowEnd, start + extent);
      assert.ok(point - 69 + offset + start * factor <= windowStart + 1e-9);
      assert.ok(point - 69 + offset + (start + extent) * factor >= windowEnd - 1e-9);
    }
  }
  assert.equal(imageLensContentOffset(230, 80, 300, 140, 1.8), 69 - 230 * 1.8);
});

test('a deliberate hold tolerates finger jitter but cancels swipes in either direction', () => {
  assert.ok(IMAGE_ZOOM_HOLD_MS >= 300);
  assert.equal(cancelsImageHold(100, 100, 103, 104), false);
  assert.equal(cancelsImageHold(100, 100, 109, 100), true);
  assert.equal(cancelsImageHold(100, 100, 100, 91), true);
  assert.equal(cancelsImageHold(100, 100, 106, 106), true);
  assert.equal(cancelsImageHold(100, 100, NaN, 100), true);
});

test('the lens center follows the pointer all the way to each photo edge', () => {
  for (const start of [0, 82]) for (const extent of [150, 300, 500]) {
    const diameter = Math.min(140, extent - 8);
    for (const point of [-999, start, start + extent / 2, start + extent, 9999]) {
      const axis = imageLensAxis(point, start, extent, diameter);
      assert.equal(axis.sample, axis.ring + diameter / 2);
      assert.equal(axis.sample, Math.max(start, Math.min(start + extent, point)));
      assert.ok(axis.ring >= start - diameter / 2 && axis.ring + diameter <= start + extent + diameter / 2);
    }
  }
});

test('half the circle extends beyond the photo when its center reaches an edge', () => {
  assert.equal(imageLensAxis(82, 82, 300, 140).ring, 12);
  assert.equal(imageLensAxis(382, 82, 300, 140).ring + 140, 452);
});

test('moving beyond a lens boundary cannot slide its content inside a stationary circle', () => {
  assert.deepEqual(imageLensAxis(0, 82, 300, 140), imageLensAxis(82, 82, 300, 140));
  assert.deepEqual(imageLensAxis(382, 82, 300, 140), imageLensAxis(999, 82, 300, 140));
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

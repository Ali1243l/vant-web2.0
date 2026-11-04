import test from 'node:test';
import assert from 'node:assert/strict';
import { convertedImageChoice, imageUploadPath, inspectImage, smartConvertImage } from '../src/lib/imageConversion.ts';

const svg = new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="blue"/></svg>'], { type: 'image/jpeg' });
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

test('content detection fixes misleading names and identifies animation containers', () => {
  const encode = (value: string) => new TextEncoder().encode(value);
  assert.equal(inspectImage(encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>')).type, 'image/svg+xml');
  assert.equal(inspectImage(new Uint8Array([255, 216, 255, 224])).type, 'image/jpeg');
  assert.equal(inspectImage(png).animated, false);
  assert.equal(inspectImage(encode('GIF89a')).animated, true);
  const webp = encode('RIFF0000WEBPVP8X0000\x02\x00\x00\x00');
  assert.equal(inspectImage(webp).animated, true);
  webp[4] = 0xc2; webp[5] = 0xa2;
  assert.equal(inspectImage(webp).type, 'image/webp');
  webp[20] = 0;
  assert.equal(inspectImage(webp).animated, false);
  const apng = new Uint8Array([...png, 0, 0, 0, 0, ...encode('acTL'), 0, 0, 0, 0]);
  assert.equal(inspectImage(apng).animated, true);
  assert.equal(inspectImage(encode('0000ftypavis0000')).animated, true);
  assert.throws(() => inspectImage(encode('<html>not an image</html>')));
});

test('uploads have a new immutable URL and the extension follows the encoded MIME', () => {
  assert.equal(imageUploadPath('catalog', '../Collection/photo.JPG', 'image/webp', 'v1'), 'catalog/collection/photo_v1.webp');
  assert.equal(imageUploadPath('catalog', 'Collection\\photo.JPG', 'image/png', 'v2'), 'catalog/collection/photo_v2.png');
  assert.notEqual(imageUploadPath('catalog', 'photo.jpg', 'image/jpeg'), imageUploadPath('catalog', 'photo.jpg', 'image/jpeg'));
  assert.throws(() => imageUploadPath('catalog', 'photo', 'text/html'));
});

test('already efficient originals avoid another lossy encode; conversion and resizing remain compulsory', () => {
  const original = new Blob([new Uint8Array(100)]);
  const larger = new Blob([new Uint8Array(110)]);
  const smaller = new Blob([new Uint8Array(50)]);
  assert.equal(convertedImageChoice(original, [larger], false, false), original);
  assert.equal(convertedImageChoice(original, [larger, smaller], false, false), smaller);
  assert.equal(convertedImageChoice(original, [larger], true, false), larger);
  assert.equal(convertedImageChoice(original, [larger], false, true), larger);
  assert.throws(() => convertedImageChoice(original, [], true, false));
});

async function withCanvas(options: { transparent?: boolean; unsupportedWebp?: boolean; failedDecode?: boolean; width?: number; height?: number }, run: (state: { canvas: any; formats: string[]; revoked: string[] }) => Promise<void>) {
  const previousImage = Object.getOwnPropertyDescriptor(globalThis, 'Image');
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const revoke = URL.revokeObjectURL;
  const revoked: string[] = [];
  const formats: string[] = [];
  const canvas = { width: 0, height: 0, getContext: () => ({ drawImage() {}, getImageData: () => ({ data: new Uint8ClampedArray([255, 255, 255, options.transparent ? 0 : 255]) }) }), toBlob: (callback: (blob: Blob) => void, type: string) => { formats.push(type); const actual = type === 'image/webp' && options.unsupportedWebp ? 'image/png' : type; callback(new Blob([new Uint8Array(actual === 'image/webp' ? 20 : 30)], { type: actual })); } };
  class TestImage {
    naturalWidth = options.width || 1080;
    naturalHeight = options.height || 1350;
    onload?: () => void;
    onerror?: () => void;
    set src(_value: string) { queueMicrotask(() => options.failedDecode ? this.onerror?.() : this.onload?.()); }
  }
  Object.defineProperty(globalThis, 'Image', { configurable: true, value: TestImage });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => canvas } });
  URL.revokeObjectURL = url => { revoked.push(url); revoke(url); };
  try { await run({ canvas, formats, revoked }); }
  finally {
    URL.revokeObjectURL = revoke;
    if (previousImage) Object.defineProperty(globalThis, 'Image', previousImage); else Reflect.deleteProperty(globalThis, 'Image');
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument); else Reflect.deleteProperty(globalThis, 'document');
  }
}

test('mislabelled SVG becomes a real raster without upscaling; temporary URLs are released', async () => {
  await withCanvas({}, async ({ canvas, revoked }) => {
    const converted = await smartConvertImage(svg);
    assert.equal(converted.type, 'image/webp');
    assert.equal(canvas.width, 1080);
    assert.equal(canvas.height, 1350);
    assert.equal(revoked.length, 1);
  });
  await withCanvas({ width: 4000, height: 2000 }, async ({ canvas }) => {
    await smartConvertImage(svg);
    assert.deepEqual([canvas.width, canvas.height], [2048, 1024]);
  });
});

test('transparent images never use JPEG; PNG fallback is named honestly on browsers without WebP encoding', async () => {
  await withCanvas({ transparent: true, unsupportedWebp: true }, async ({ formats }) => {
    assert.equal((await smartConvertImage(svg)).type, 'image/png');
    assert.deepEqual(formats, ['image/webp', 'image/png']);
  });
});

test('animated originals are decoded and validated but never flattened to a still image', async () => {
  await withCanvas({}, async ({ formats, revoked }) => {
    const gif = new Blob(['GIF89a'], { type: 'image/gif' });
    assert.equal(await smartConvertImage(gif), gif);
    assert.deepEqual(formats, []);
    assert.equal(revoked.length, 1);
  });
});

test('invalid files, external SVG dependencies and oversized dimensions fail before a replacement is returned', async () => {
  await assert.rejects(smartConvertImage(new Blob([])));
  await assert.rejects(smartConvertImage({ size: 21 * 1024 * 1024 } as Blob));
  await assert.rejects(smartConvertImage(new Blob(['not an image'], { type: 'image/jpeg' })));
  await assert.rejects(smartConvertImage(new Blob(['<svg><image href="https://other.test/a.png"/></svg>'])));
  await assert.rejects(smartConvertImage(svg, NaN));
  await withCanvas({ failedDecode: true }, async ({ revoked }) => { await assert.rejects(smartConvertImage(svg)); assert.equal(revoked.length, 1); });
  await withCanvas({ width: 10000, height: 10000 }, async ({ revoked }) => { await assert.rejects(smartConvertImage(svg)); assert.equal(revoked.length, 1); });
});

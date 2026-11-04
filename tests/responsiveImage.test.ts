import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { catalogImageProps, retryOriginalImage, vercelImageSource } from '../src/lib/responsiveImage.ts';

const source = 'https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/catalog/shirt.png';

test('only public catalog photos use the configured optimizer widths and quality', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')).images;
  for (const width of config.sizes) {
    const optimized = new URL(vercelImageSource(source, width), 'https://vant-web.vercel.app');
    assert.equal(optimized.pathname, '/_vercel/image');
    assert.equal(optimized.searchParams.get('url'), source);
    assert.equal(optimized.searchParams.get('w'), String(width));
    assert.ok(config.qualities.includes(Number(optimized.searchParams.get('q'))));
    assert.match(new URL(source).pathname, new RegExp(config.remotePatterns[0].pathname));
  }
  for (const input of [source + '?token=secret', source + '#fragment', source.replace('/public/', '/sign/'), source.replace('https:', 'http:'), source.replace('.supabase.co', '.supabase.co.evil.test'), source.replace('https://', 'https://user:secret@'), source.replace('.png', '.svg'), '/local.png', 'data:image/png;base64,abc']) {
    assert.equal(vercelImageSource(input, 400), input);
  }
  assert.equal(vercelImageSource(source, 123), source);
});

test('deployed catalog and thumbnails use responsive copies; local previews keep original URLs', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'location');
  try {
    Object.defineProperty(globalThis, 'location', { configurable: true, value: { hostname: 'vant-web.vercel.app' } });
    assert.match(catalogImageProps(source).srcSet!, /_vercel\/image/);
    assert.equal(catalogImageProps(source, '80px').sizes, '80px');
    Object.defineProperty(globalThis, 'location', { configurable: true, value: { hostname: '127.0.0.1' } });
    assert.deepEqual(catalogImageProps(source), {});
  } finally {
    if (previous) Object.defineProperty(globalThis, 'location', previous);
    else Reflect.deleteProperty(globalThis, 'location');
  }
});

test('optimizer failure retries the original exactly once, including a cached original', () => {
  const attributes = new Map([['src', source], ['srcset', 'optimized 400w'], ['sizes', '50vw']]);
  const image = { src: '', hasAttribute: (name: string) => attributes.has(name), removeAttribute: (name: string) => attributes.delete(name), getAttribute: (name: string) => attributes.get(name) || null };
  assert.equal(retryOriginalImage(image as unknown as HTMLImageElement), true);
  assert.equal(image.src, source);
  assert.equal(attributes.has('srcset'), false);
  assert.equal(attributes.has('sizes'), false);
  assert.equal(retryOriginalImage(image as unknown as HTMLImageElement), false);
});

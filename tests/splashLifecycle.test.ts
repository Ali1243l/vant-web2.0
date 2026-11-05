import test from 'node:test';
import assert from 'node:assert/strict';
import { splashCanFinish, waitForSplashImages } from '../src/lib/splashLifecycle.ts';
test('loader cannot hide while data is loading even after its minimum display time', () => {
  assert.equal(splashCanFinish(false, true, true), false);
  assert.equal(splashCanFinish(false, false, false), false);
  assert.equal(splashCanFinish(false, false, true), true);
});
test('preview stays open when playback is complete, including after replay', () => {
  for (const loading of [true, false]) for (const elapsed of [true, false]) assert.equal(splashCanFinish(true, loading, elapsed), false);
  assert.equal(splashCanFinish(true, true, true, true), false);
});

test('a slow or unavailable service cannot leave the live splash blocking indefinitely', () => {
  assert.equal(splashCanFinish(false, true, true, true), true);
});

test('initial photos wait for decode; cached, broken and aborted photos settle without duplicate downloads', async () => {
  class Photo extends EventTarget {
    complete = false;
    naturalWidth = 0;
    decodeCalls = 0;
    finishDecode!: () => void;
    decode() { this.decodeCalls++; return new Promise<void>(resolve => { this.finishDecode = resolve; }); }
  }
  const photo = new Photo(), broken = new Photo();
  const abort = new AbortController();
  let ready = false;
  const pending = waitForSplashImages([photo, broken] as unknown as HTMLImageElement[], abort.signal).then(() => { ready = true; });
  photo.dispatchEvent(new Event('load'));
  broken.dispatchEvent(new Event('error'));
  await Promise.resolve();
  assert.equal(ready, false);
  photo.finishDecode(); await pending;
  assert.equal(photo.decodeCalls, 1);
  photo.dispatchEvent(new Event('load'));
  assert.equal(photo.decodeCalls, 1);
  const cached = new Photo(); cached.complete = true; cached.naturalWidth = 400;
  const cachedReady = waitForSplashImages([cached] as unknown as HTMLImageElement[], abort.signal);
  cached.finishDecode(); await cachedReady;
  const stalled = new Photo();
  const stalledReady = waitForSplashImages([stalled] as unknown as HTMLImageElement[], abort.signal);
  abort.abort(); await stalledReady;
  stalled.dispatchEvent(new Event('load'));
  assert.equal(stalled.decodeCalls, 0);
});

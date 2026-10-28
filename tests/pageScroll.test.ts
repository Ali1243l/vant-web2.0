import test from 'node:test';
import assert from 'node:assert/strict';
import { createPageScroller, catalogScrollTarget } from '../src/lib/pageScroll.ts';

function viewport(initialY = 900, maximum = 2000) {
  let y = initialY;
  let time = 0;
  let nextId = 0;
  const frames = new Map<number, (time: number) => void>();
  const writes: number[] = [];
  const navigation = createPageScroller({
    readY: () => y, maxY: () => maximum,
    writeY: value => { y = value; writes.push(value); },
    requestFrame: callback => { frames.set(++nextId, callback); return nextId; },
    cancelFrame: id => { frames.delete(id); },
  });
  const tick = () => {
    time += 16;
    const pending = [...frames.values()]; frames.clear();
    pending.forEach(callback => callback(time));
  };
  return { navigation, writes, readY: () => y, tick, finish: () => { for (let i = 0; i < 100; i++) tick(); } };
}

test('back to top completes at zero even across header reveal thresholds', () => {
  const view = viewport();
  view.navigation.to(() => 0);
  view.finish();
  assert.equal(view.readY(), 0);
  assert.equal(view.navigation.isActive(), false);
  assert.ok(view.writes.every((y, index, values) => !index || y <= values[index - 1]));
});

test('catalog navigation waits for the collapsing banner and reserves the full header slot', () => {
  const view = viewport(0);
  let gridDocumentTop = 500;
  view.navigation.to(() => catalogScrollTarget(view.readY(), gridDocumentTop - view.readY(), 136), { settleLayout: true });
  for (let i = 0; i < 16; i++) { gridDocumentTop -= 16; view.tick(); }
  assert.equal(view.writes.length, 0);
  view.finish();
  assert.equal(view.readY(), 92);
  assert.equal(gridDocumentTop - view.readY(), 152);
});

test('a second button replaces a running journey; cancelled requests never resume', () => {
  const view = viewport();
  view.navigation.to(() => 0);
  for (let i = 0; i < 10; i++) view.tick();
  view.navigation.to(() => 400);
  view.finish();
  assert.equal(view.readY(), 400);
  view.navigation.to(() => 0);
  view.tick(); view.navigation.cancel();
  const position = view.readY();
  view.finish();
  assert.equal(view.readY(), position);
});

test('reduced motion jumps directly and destinations remain within the page', () => {
  const view = viewport(900, 1000);
  view.navigation.to(() => 5000, { reducedMotion: true });
  view.tick();
  assert.deepEqual(view.writes, [1000]);
  view.navigation.to(() => -100, { reducedMotion: true });
  view.tick();
  assert.equal(view.readY(), 0);
});

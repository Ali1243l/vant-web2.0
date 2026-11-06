import test from 'node:test';
import assert from 'node:assert/strict';
import { seasonalPositions, seasonalVariants } from '../src/lib/seasonalDistribution.ts';
import { HERO_SCENES } from '../src/lib/heroAppearance.ts';

test('every theme cycles through ten distinct designs without an adjacent repeat or render-time randomness', () => {
  for (const scene of HERO_SCENES) {
    const plan = seasonalVariants(scene, 100);
    assert.deepEqual(plan, seasonalVariants(scene, 100));
    assert.ok(plan.every((v, i) => i === 0 || v !== plan[i - 1]));
    for (let offset = 0; offset < 100; offset += 10) assert.equal(new Set(plan.slice(offset, offset + 10)).size, 10);
  }
  assert.deepEqual(seasonalVariants('winter', 0), []);
  assert.equal(seasonalVariants('winter', 7).length, 7);
  assert.notDeepEqual(seasonalVariants('winter', 10), seasonalVariants('spring', 10));
});

test('seasonal compositions have unique balanced clusters instead of one repeated scatter', () => {
  const layouts = Object.values(seasonalPositions);
  assert.equal(layouts.length, HERO_SCENES.length - 1);
  assert.equal(new Set(layouts.map(p => JSON.stringify(p))).size, layouts.length);
  for (const layout of layouts) {
    assert.ok(layout.length <= 10, 'keep ambient work below the previous twelve particles');
    assert.equal(new Set(layout.map(p => p.join(','))).size, layout.length);
    for (const [x, y] of layout) {
      assert.ok(x >= 0 && x <= 100 && y >= 0 && y <= 100);
      assert.ok(x < 35 || x > 65 || y < 8 || y > 92, 'leave the central reading area calm');
    }
  }
});

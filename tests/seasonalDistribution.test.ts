import test from 'node:test';
import assert from 'node:assert/strict';
import { seasonalVariants, snowCaps } from '../src/lib/seasonalDistribution.ts';
import { HERO_SCENES } from '../src/lib/heroAppearance.ts';

test('every theme cycles through ten distinct designs without an adjacent repeat or render-time randomness', () => {
  for (const scene of HERO_SCENES) {
    const plan = seasonalVariants(scene, 100);
    assert.deepEqual(plan, seasonalVariants(scene, 100));
    assert.ok(plan.every((v, i) => i === 0 || v !== plan[i - 1]));
    for (let offset = 0; offset < 100; offset += 10) assert.equal(new Set(plan.slice(offset, offset + 10)).size, 10);
  }
  assert.equal(new Set(snowCaps).size, 10);
  assert.deepEqual(seasonalVariants('winter', 0), []);
  assert.equal(seasonalVariants('winter', 7).length, 7);
  assert.notDeepEqual(seasonalVariants('winter', 10), seasonalVariants('spring', 10));
});

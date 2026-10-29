import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BANNER_THEMES, bannerThemeEdits, themeAppearance } from '../src/lib/bannerThemes.ts';
import { DEFAULT_HERO_APPEARANCE, HERO_APPEARANCE_CONTROL, parseHeroAppearance, heroBackgroundVariables } from '../src/lib/heroAppearance.ts';
import { buildBannerChanges } from '../src/lib/bannerEditor.ts';

test('all twelve themes survive shared validation and contain complete bilingual copy', () => {
  assert.equal(BANNER_THEMES.length, 12);
  assert.equal(new Set(BANNER_THEMES.map(theme => theme.id)).size, 12);
  assert.equal(BANNER_THEMES.filter(theme => theme.category === 'seasons').length, 4);
  for (const theme of BANNER_THEMES) {
    const edits = bannerThemeEdits(theme, undefined, true);
    const controls = Object.fromEntries(Object.keys(edits).map(id => [id, { id, visible: false, enabled: true }]));
    const saved = buildBannerChanges(controls as any, [], edits, {});
    const appearance = themeAppearance(theme);
    assert.deepEqual(parseHeroAppearance(saved.controls[HERO_APPEARANCE_CONTROL].actionValue), appearance);
    for (const [id, patch] of Object.entries(edits)) {
      if (id !== HERO_APPEARANCE_CONTROL) { assert.ok(patch.label_ar?.trim()); assert.ok(patch.label_en?.trim()); }
      assert.equal(saved.controls[id].visible, false);
    }
    for (const isAr of [true, false]) {
      const variables = heroBackgroundVariables(appearance, isAr);
      assert.equal(variables['--hero-accent'], theme.accent);
      assert.ok(!JSON.stringify(variables).includes('NaN'));
    }
  }
});

test('style-only selection preserves copy, image, visibility, crop and unrelated appearance settings', () => {
  const before = { ...DEFAULT_HERO_APPEARANCE, zoom: 120, positionX: 20, mobilePositionX: 70, height: 400, start: 90, middle: 90, end: 90 };
  const edits = bannerThemeEdits(BANNER_THEMES[0], JSON.stringify(before), false);
  assert.deepEqual(Object.keys(edits), [HERO_APPEARANCE_CONTROL]);
  const after = parseHeroAppearance(edits[HERO_APPEARANCE_CONTROL].actionValue);
  for (const key of ['zoom', 'positionX', 'mobilePositionX', 'height'] as const) assert.equal(after[key], before[key]);
  assert.deepEqual([after.start, after.middle, after.end], [0, 42, 100]);
  assert.equal(before.motif, 'none');
});

test('untrusted decoration settings are normalized and legacy banners keep no decoration', () => {
  assert.equal(parseHeroAppearance('{}').motif, 'none');
  const parsed = parseHeroAppearance(JSON.stringify({ motif: '<svg>', accentColor: 'url(x)', motifOpacity: 900 }));
  assert.equal(parsed.motif, 'none');
  assert.equal(parsed.accentColor, DEFAULT_HERO_APPEARANCE.accentColor);
  assert.equal(parsed.motifOpacity, 100);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_HERO_APPEARANCE, parseHeroAppearance, heroFadeAngle, heroBackgroundVariables } from '../src/lib/heroAppearance.ts';

test('old or malformed banner settings receive complete defaults', () => {
  for (const raw of [undefined, '', '{', 'null', '[]', '42']) assert.deepEqual(parseHeroAppearance(raw), DEFAULT_HERO_APPEARANCE);
});

test('fade stops stay ordered and numerical settings remain within bounds', () => {
  const settings = parseHeroAppearance(JSON.stringify({ start: 70, middle: 20, end: 10, zoom: 999, blur: -5, height: 'bad', darkColor: 'url(unsafe)', startOpacity: 500 }));
  assert.equal(settings.start, 70);
  assert.equal(settings.middle, 70);
  assert.equal(settings.end, 70);
  assert.equal(settings.zoom, 160);
  assert.equal(settings.blur, 0);
  assert.equal(settings.startOpacity, 100);
  assert.equal(settings.darkColor, DEFAULT_HERO_APPEARANCE.darkColor);
  assert.equal(settings.height, DEFAULT_HERO_APPEARANCE.height);
});

test('caption fade follows Arabic and English while custom mobile settings survive reload', () => {
  assert.equal(heroFadeAngle('caption', 0, true), 270);
  assert.equal(heroFadeAngle('caption', 0, false), 90);
  const value = { ...DEFAULT_HERO_APPEARANCE, mobileDirection: 'custom' as const, mobileAngle: 180, mobilePositionX: 90, endOpacity: 0 };
  const restored = parseHeroAppearance(JSON.stringify(value));
  assert.deepEqual(restored, value);
  const style = heroBackgroundVariables(restored, true);
  assert.equal(style['--hero-mobile-angle'], '180deg');
  assert.equal(style['--hero-mobile-image-position'], '90% 50%');
  assert.match(style['--hero-desktop-gradient'], /\/ 0\) 100%/);
  assert.match(style['--hero-mobile-gradient'], /\/ 0.65\) 100%/);
  assert.equal(heroBackgroundVariables({ ...restored, fadeEnabled: false }, true)['--hero-desktop-gradient'], 'none');
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_STORE_THEME, STORE_THEME_CONTROL, CUSTOM_THEMES_CONTROL, parseStoreTheme, paletteIssue, contrastRatio, onAccent, storeThemeVariables } from '../src/lib/storefrontTheme.ts';
import { BANNER_THEMES, themeStorePalette } from '../src/lib/bannerThemes.ts';
import { BANNER_TARGET_CONTROL, parseBannerTarget, matchesBannerTarget, hasUnloadedBannerProducts, bannerPageRequestKey } from '../src/lib/bannerTarget.ts';
import { buildBannerChanges, captureSavedTheme, parseSavedThemes, savedThemeEdits } from '../src/lib/bannerEditor.ts';
import { productMatchesQuery } from '../src/lib/search.ts';

test('store identity normalizes unsafe styles and legacy settings remain disabled', () => {
  for (const raw of [undefined, '', 'null', '{']) assert.deepEqual(parseStoreTheme(raw), DEFAULT_STORE_THEME);
  const parsed = parseStoreTheme(JSON.stringify({ enabled: 'true', radius: 900, spacing: -8, light: { background: 'url(x)' }, dark: { accent: '#123456' } }));
  assert.equal(parsed.enabled, false); assert.equal(parsed.radius, 28); assert.equal(parsed.spacing, 8);
  assert.equal(parsed.light.background, DEFAULT_STORE_THEME.light.background); assert.equal(parsed.dark.accent, '#123456');
});
test('all presets provide readable global palettes and automatic button text meets contrast', () => {
  assert.equal(paletteIssue(DEFAULT_STORE_THEME), null);
  assert.equal(paletteIssue({ ...DEFAULT_STORE_THEME, dark: { ...DEFAULT_STORE_THEME.dark, text: DEFAULT_STORE_THEME.dark.background } }), 'dark');
  for (const theme of BANNER_THEMES) {
    const store = themeStorePalette(theme, JSON.stringify({ radius: 11, spacing: 25 }));
    assert.equal(store.enabled, true); assert.equal(store.radius, 11); assert.equal(store.spacing, 25); assert.equal(paletteIssue(store), null);
    for (const mode of ['light', 'dark'] as const) {
      const variables = storeThemeVariables(store, mode);
      assert.equal(variables['--store-background'], store[mode].background);
      assert.ok(contrastRatio(store[mode].accent, variables['--store-on-accent']) >= 4.5);
      assert.ok(contrastRatio(variables['--store-link'], store[mode].surface) >= 4.5);
    }
  }
  for (const color of ['#777777', '#787878', '#888888', '#ffffff', '#000000']) assert.ok(contrastRatio(color, onAccent(color)) >= 4.5);
});
test('banner destination validates selections, deduplicates IDs and never broadens missing selections', () => {
  assert.deepEqual(parseBannerTarget(undefined), { mode: 'all_offers', productIds: [] });
  for (const raw of ['{', '{"mode":"wrong"}', '{"mode":"selected_offers","productIds":[]}', JSON.stringify({ mode: 'selected_products', productIds: [''] }), JSON.stringify({ mode: 'selected_products', productIds: Array.from({ length: 201 }, (_, i) => String(i)) })]) assert.throws(() => parseBannerTarget(raw, true));
  const target = parseBannerTarget(JSON.stringify({ mode: 'selected_offers', productIds: ['1', '1', 'deleted'] }), true);
  assert.deepEqual(target.productIds, ['1', 'deleted']);
  assert.equal(matchesBannerTarget({ id: 1, is_offer: true }, target), true);
  assert.equal(matchesBannerTarget({ id: 1, is_offer: false }, target), false);
  assert.equal(matchesBannerTarget({ id: 2, is_offer: true }, target), false);
  assert.equal(matchesBannerTarget({ id: 1 }, { ...target, mode: 'selected_products' }), true);
  assert.equal(hasUnloadedBannerProducts([{ id: 1 }], target), true);
  assert.equal(hasUnloadedBannerProducts([{ id: 1 }, { id: 'deleted' }], target), false);
  assert.equal(hasUnloadedBannerProducts([], null), false);
});
const controls = Object.fromEntries(['banner_hero_title', 'banner_hero_subtitle', 'banner_hero_tag', 'banner_hero_btn', 'banner_hero_bg', 'banner_hero_appearance', STORE_THEME_CONTROL, CUSTOM_THEMES_CONTROL, BANNER_TARGET_CONTROL].map(id => [id, { id, label_ar: 'نص', label_en: 'Text', visible: false, enabled: true, actionValue: id === 'banner_hero_bg' ? 'https://example.test/image.jpg' : '{}' }])) as any;
test('custom themes round-trip full appearance, palette, bilingual copy and photo without replacing destinations', () => {
  const captured = captureSavedTheme('custom-one', ' My theme ', controls);
  assert.equal(captured.name, 'My theme');
  const loaded = savedThemeEdits(parseSavedThemes(JSON.stringify([captured]), true)[0]);
  assert.equal(loaded.banner_hero_bg.actionValue, 'https://example.test/image.jpg');
  assert.equal(loaded.banner_hero_title.label_ar, 'نص');
  assert.equal(loaded[BANNER_TARGET_CONTROL], undefined); assert.equal(loaded[CUSTOM_THEMES_CONTROL], undefined);
  const result = buildBannerChanges(controls, [], loaded, {});
  assert.equal(result.controls.banner_hero_title.visible, false);
  captured.copy.banner_hero_title.label_ar = 'modified';
  assert.equal(controls.banner_hero_title.label_ar, 'نص');
  for (const raw of [JSON.stringify([captured, captured]), JSON.stringify([{ ...captured, name: '' }]), JSON.stringify([{ ...captured, image: 'javascript:alert(1)' }]), JSON.stringify(Array.from({ length: 21 }, (_, i) => ({ ...captured, id: String(i) })))]) assert.throws(() => parseSavedThemes(raw, true));
});
test('common save rejects unreadable published colors and empty target while preserving original state', () => {
  const theme = structuredClone(DEFAULT_STORE_THEME); theme.enabled = true; theme.light.text = theme.light.background;
  assert.throws(() => buildBannerChanges(controls, [], { [STORE_THEME_CONTROL]: { actionValue: JSON.stringify(theme) } }, {}), /contrast/);
  assert.throws(() => buildBannerChanges(controls, [], { [BANNER_TARGET_CONTROL]: { actionValue: '{"mode":"selected_products","productIds":[]}' } }, {}), /target/);
  assert.equal(controls[STORE_THEME_CONTROL].actionValue, '{}');
  const saved = buildBannerChanges(controls, [], { [CUSTOM_THEMES_CONTROL]: { actionValue: JSON.stringify([captureSavedTheme('a', 'A', controls)]) }, [BANNER_TARGET_CONTROL]: { actionValue: '{"mode":"selected_products","productIds":["1"]}' } }, {});
  assert.equal(parseSavedThemes(saved.controls[CUSTOM_THEMES_CONTROL].actionValue).length, 1);
  assert.deepEqual(parseBannerTarget(saved.controls[BANNER_TARGET_CONTROL].actionValue).productIds, ['1']);
});
test('older open sessions can save newly introduced controls using their default metadata', () => {
  const saved = buildBannerChanges({}, [], { [BANNER_TARGET_CONTROL]: { actionValue: '{"mode":"selected_products","productIds":["1"]}' }, [STORE_THEME_CONTROL]: { actionValue: JSON.stringify(DEFAULT_STORE_THEME) } }, {});
  assert.equal(saved.controls[BANNER_TARGET_CONTROL].id, BANNER_TARGET_CONTROL);
  assert.equal(saved.controls[STORE_THEME_CONTROL].category, 'hero_banner');
  assert.deepEqual(parseBannerTarget(saved.controls[BANNER_TARGET_CONTROL].actionValue).productIds, ['1']);
});
test('banner product search finds a SKU as well as bilingual product text', () => {
  const product = { id: '1', title: 'Winter shirt', title_ar: 'قميص الشتاء', sku: 'VANT-WIN-42' } as any;
  assert.equal(productMatchesQuery(product, 'vant-win-42'), true);
  assert.equal(productMatchesQuery(product, 'الشتاء'), true);
  assert.equal(productMatchesQuery(product, 'summer'), false);
});
test('empty banner results advance pages once per loaded set and defer to normal pagination once visible', () => {
  const target = { mode: 'selected_products' as const, productIds: ['later'] };
  const key = bannerPageRequestKey([{ id: 'first' }], target, false, 0);
  assert.ok(key);
  assert.equal(bannerPageRequestKey([{ id: 'first' }], target, false, 0), key);
  assert.notEqual(bannerPageRequestKey([{ id: 'first' }, { id: 'second' }], target, false, 0), key);
  assert.equal(bannerPageRequestKey([{ id: 'later' }], target, false, 1), null);
  assert.equal(bannerPageRequestKey([{ id: 'later' }], target, false, 0), null);
  assert.equal(bannerPageRequestKey([], null, false, 0), null);
  assert.equal(bannerPageRequestKey([], null, true, 0), 'offers:0');
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildBannerChanges, validateBannerFile, validBannerImage, validateWelcomeDraft, storeBannerDraft } from '../src/lib/bannerEditor.ts';
const controls = { banner_hero_title: { id: 'banner_hero_title', label_ar: 'old', label_en: 'old en', visible: true }, banner_hero_bg: { id: 'banner_hero_bg', actionValue: 'https://example.test/old.jpg' }, banner_hero_visible: { id: 'banner_hero_visible', visible: true }, banner_hero_appearance: { id: 'banner_hero_appearance', actionValue: '{}' }, unrelated: { id: 'unrelated', label_ar: 'keep' } } as any;
const trends = [{ id: 't1', category: 'shirts', titleAr: 'old', titleEn: 'old en', image: 'https://example.test/old.jpg' }] as any;

test('banner save produces one scoped patch and preserves unrelated controls, category and order', () => {
  const result = buildBannerChanges(controls, trends, { banner_hero_title: { label_ar: 'new' }, banner_hero_visible: { visible: false } }, { t1: { titleEn: 'New title' } });
  assert.equal(result.controls.banner_hero_title.label_en, 'old en');
  assert.equal(result.controls.unrelated, undefined);
  assert.equal(result.controls.banner_hero_visible.visible, false);
  assert.equal(result.trendItems[0].category, 'shirts');
  assert.equal(result.trendItems[0].id, 't1');
  assert.equal(result.trendItems[0].titleEn, 'New title');
  assert.equal(controls.banner_hero_title.label_ar, 'old');
  assert.equal(trends[0].titleEn, 'old en');
});
test('banner edits cannot mutate unrelated controls or trend identities', () => {
  assert.throws(() => buildBannerChanges(controls, trends, { unrelated: { label_ar: 'bad' } }, {}));
  assert.throws(() => buildBannerChanges(controls, trends, { banner_hero_title: { enabled: false } }, {}));
  assert.throws(() => buildBannerChanges(controls, trends, {}, { t1: { category: 'bad' } }));
  assert.throws(() => buildBannerChanges(controls, trends, {}, { missing: { titleAr: 'bad' } }));
});
test('blank text and unsafe image sources cannot be saved', () => {
  for (const image of ['javascript:alert(1)', 'https://name:secret@example.test/image.jpg', 'data:text/html;base64,AAAA', 'not a link']) {
    assert.equal(validBannerImage(image), false);
    assert.throws(() => buildBannerChanges(controls, trends, { banner_hero_bg: { actionValue: image } }, {}));
  }
  assert.equal(validBannerImage('https://example.test/picture.webp'), true);
  assert.equal(validBannerImage(''), true);
  assert.throws(() => buildBannerChanges(controls, trends, { banner_hero_title: { label_ar: ' ' } }, {}));
});
test('appearance values retain the existing shared clamping and ordered fade stops', () => {
  const result = buildBannerChanges(controls, trends, { banner_hero_appearance: { actionValue: JSON.stringify({ start: 90, middle: 20, end: -5, imageOpacity: 900 }) } }, {});
  const appearance = JSON.parse(result.controls.banner_hero_appearance.actionValue!);
  assert.equal(appearance.start, 90); assert.equal(appearance.middle, 90); assert.equal(appearance.end, 90); assert.equal(appearance.imageOpacity, 100);
});
test('file admission checks format, empty files and 10 MB before decoding or uploading', () => {
  assert.equal(validateBannerFile({ type: 'image/webp', size: 2048 }), true);
  for (const file of [{ type: 'image/svg+xml', size: 100 }, { type: 'image/png', size: 0 }, { type: 'image/jpeg', size: 11 * 1024 * 1024 }]) assert.equal(validateBannerFile(file), false);
});
const welcome = { welcome_title_ar: 'مرحبا', welcome_title_en: 'Welcome', welcome_message_ar: 'رسالة', welcome_message_en: 'Message', welcome_coupon_code: 'WELCOME15', welcome_discount_percent: 15, welcome_modal_enabled: false };
test('welcome draft validates both languages, code format and displayed percentage without delivery settings', () => {
  assert.equal(validateWelcomeDraft(welcome), null);
  assert.equal(validateWelcomeDraft({ ...welcome, welcome_message_en: '' }), 'text');
  assert.equal(validateWelcomeDraft({ ...welcome, welcome_coupon_code: 'BAD CODE' }), 'code');
  for (const value of [NaN, 0, -1, 100]) assert.equal(validateWelcomeDraft({ ...welcome, welcome_discount_percent: value }), 'discount');
  assert.equal(Object.hasOwn(welcome, 'welcome_auto_dispatch'), false);
});
test('a local quota failure rolls back a partial controls/trends write', () => {
  const values = new Map([['controls', 'old controls'], ['vant_custom_trends_v2', 'old trends']]);
  let writes = 0;
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { if (++writes === 2) throw new Error('quota'); values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  assert.throws(() => storeBannerDraft(storage, 'controls', { changed: true }, []));
  assert.equal(values.get('controls'), 'old controls');
  assert.equal(values.get('vant_custom_trends_v2'), 'old trends');
  storeBannerDraft(storage, 'controls', { changed: true }, []);
  assert.equal(values.get('controls'), '{"changed":true}');
  assert.equal(values.get('vant_custom_trends_v2'), '[]');
});

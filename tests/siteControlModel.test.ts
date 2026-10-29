import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_SITE_CONTROLS as defaults } from '../src/context/defaultSiteControls.ts';
import { controlKind, controlActive, resolveControl, controlHasText, controlResetPatch, buildControlChanges, normalizeControlPhone, controlWarnings, editControlDraft, bulkControlDraft, filterControls } from '../src/lib/siteControlModel.ts';

test('every registered control has deliberate visibility/enable semantics; actions stay visible while disabled', () => {
  for (const item of Object.values(defaults)) {
    for (const visible of [true, false]) for (const enabled of [true, false]) {
      const input = { ...item, visible, enabled }, resolved = resolveControl(input);
      assert.equal(controlActive(resolved), visible && enabled);
      assert.equal(resolved.visible, ['feature', 'text'].includes(controlKind(item.id)) ? visible && enabled : visible);
      assert.equal(input.visible, visible);
    }
  }
  assert.equal(controlHasText('card_price_tag'), false);
  assert.equal(controlHasText('btn_product_add_to_cart'), true);
});
test('save is a narrow patch, validates copy/state and cannot edit theme libraries or metadata', () => {
  const before = structuredClone(defaults);
  const saved = buildControlChanges(before, { btn_header_cart: { enabled: false, label_ar: 'سلتي' } });
  assert.deepEqual(Object.keys(saved), ['btn_header_cart']);
  assert.equal(saved.btn_header_cart.visible, true); assert.equal(saved.btn_header_cart.enabled, false);
  assert.equal(before.btn_header_cart.enabled, true);
  for (const edits of [{ store_theme: { enabled: false } }, { store_custom_themes: { actionValue: '[]' } }, { banner_hero_target: { actionValue: '{}' } }, { unknown: { enabled: false } }, { btn_header_cart: { id: 'bad' } }, { btn_header_cart: { enabled: 'false' } }, { card_price_tag: { label_ar: 'fake price' } }, { btn_header_cart: { label_ar: '' } }, { btn_header_cart: { label_en: 'x'.repeat(81) } }, { brand_kinetic_logo: { label_ar: 'x'.repeat(25) } }, JSON.parse('{"__proto__":{"visible":false}}'), { toString: { visible: false } }]) assert.throws(() => buildControlChanges(defaults, edits as any));
  assert.deepEqual(defaults.store_custom_themes, before.store_custom_themes);
});
test('WhatsApp input accepts international Arabic digits and never silently strips letters or URLs', () => {
  assert.equal(normalizeControlPhone('+٩٦٤ (٧٧٠) ١٢٣-٤٥٦٧'), '9647701234567');
  assert.equal(normalizeControlPhone('۹۶۴۷۷۰۱۲۳۴۵۶۷'), '9647701234567');
  for (const phone of ['abc9647701234567', 'https://wa.me/9647701234567', '123', '000000000', '1'.repeat(16)]) assert.throws(() => normalizeControlPhone(phone));
  assert.throws(() => buildControlChanges(defaults, { cfg_whatsapp_phone: { enabled: false } }));
  assert.equal(buildControlChanges({}, { cfg_whatsapp_phone: { actionValue: '+964 770 123 4567' } }).cfg_whatsapp_phone.id, 'cfg_whatsapp_phone');
});
test('bulk operations affect only matching switchable controls and undo restores a pristine draft', () => {
  const matches = ['btn_header_cart', 'enableCartAnimation', 'cfg_whatsapp_phone', 'store_theme', 'store_custom_themes'];
  const off = bulkControlDraft(defaults, {}, matches, 'enabled', false);
  assert.deepEqual(Object.keys(off), ['btn_header_cart', 'enableCartAnimation']);
  assert.deepEqual(bulkControlDraft(defaults, off, matches, 'enabled', true), {});
  const first = editControlDraft(defaults, {}, 'btn_header_cart', { label_ar: 'سلتي' });
  const next = editControlDraft(defaults, first, 'btn_header_cart', { enabled: false });
  assert.equal(first.btn_header_cart.enabled, undefined); assert.equal(next.btn_header_cart.label_ar, 'سلتي');
  assert.deepEqual(editControlDraft(defaults, next, 'btn_header_cart', controlResetPatch('btn_header_cart')), {});
  assert.throws(() => controlResetPatch('store_custom_themes'));
});
test('group/state/text search includes normalized Arabic and preserves changed controls across filters', () => {
  const edits = { btn_header_cart: { enabled: false } };
  const changed = { ...defaults.btn_header_cart, enabled: false };
  const items = [changed, defaults.cfg_whatsapp_phone, defaults.btn_header_search];
  assert.equal(filterControls(items, 'سلة', 'cart', 'disabled', edits).length, 1);
  assert.equal(filterControls(items, 'btn_header_cart', 'all', 'changed', edits)[0].id, 'btn_header_cart');
  assert.equal(filterControls(items, '', 'search_filter', 'all', edits)[0].id, 'btn_header_search');
  assert.equal(filterControls(items, 'nothing', 'all', 'all', edits).length, 0);
});
test('dependency warnings identify missing cart/wishlist access without mutating states', () => {
  assert.deepEqual(controlWarnings(defaults), []);
  const input = { ...defaults, btn_header_cart: { ...defaults.btn_header_cart, enabled: false }, btn_header_wishlist: { ...defaults.btn_header_wishlist, visible: false } };
  assert.deepEqual(controlWarnings(input), ['cart-entry', 'wishlist-entry']);
  assert.ok(controlWarnings({ ...defaults, btn_cart_whatsapp: { ...defaults.btn_cart_whatsapp, enabled: false } }).includes('cart-confirm'));
});
test('newsletter label override is explicit and a state-only change preserves legacy label sourcing', () => {
  assert.equal(buildControlChanges(defaults, { btn_newsletter_subscribe: { enabled: false } }).btn_newsletter_subscribe.actionValue, undefined);
  assert.equal(buildControlChanges(defaults, { btn_newsletter_subscribe: { label_ar: 'انضم الآن' } }).btn_newsletter_subscribe.actionValue, 'custom-label');
});
test('WhatsApp master stops all three order/inquiry routes without rewriting individual states or phone numbers', () => {
  const controls: typeof defaults = { ...defaults, feature_whatsapp: { ...defaults.feature_whatsapp, enabled: false } };
  for (const id of ['btn_product_whatsapp', 'btn_cart_whatsapp', 'btn_product_bespoke']) {
    const resolved = resolveControl(controls[id], controls);
    assert.equal(resolved.visible, true); assert.equal(resolved.enabled, false);
    assert.equal(controls[id].enabled, true);
  }
  assert.equal(resolveControl(controls.btn_header_cart, controls).enabled, true);
  assert.ok(filterControls(Object.values(controls), '', 'all', 'disabled', {}).some(item => item.id === 'btn_cart_whatsapp'));
  assert.equal(controlWarnings(controls).includes('whatsapp-master'), true);
  assert.equal(controls.cfg_whatsapp_phone.actionValue, defaults.cfg_whatsapp_phone.actionValue);
  assert.deepEqual(bulkControlDraft(defaults, {}, ['feature_whatsapp'], 'visible', false), {});
  assert.deepEqual(buildControlChanges(controls, { feature_whatsapp: controlResetPatch('feature_whatsapp') }).feature_whatsapp.enabled, true);
});

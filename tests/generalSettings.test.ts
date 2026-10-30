import test from 'node:test';
import assert from 'node:assert/strict';
import { generalSettingsPatch, validGeneralSettings } from '../src/lib/generalSettings.ts';
import { DEFAULT_SITE_SETTINGS } from '../src/context/siteControlsTypes.ts';
test('general edits are scoped and do not overwrite contact, newsletter or banner settings', () => {
  const draft = { ...DEFAULT_SITE_SETTINGS, loading_text_ar: 'New text', custom_store_url: 'https://another.example', welcome_modal_enabled: !DEFAULT_SITE_SETTINGS.welcome_modal_enabled };
  assert.deepEqual(generalSettingsPatch(draft, DEFAULT_SITE_SETTINGS), { loading_text_ar: 'New text' });
  assert.deepEqual(generalSettingsPatch(DEFAULT_SITE_SETTINGS, DEFAULT_SITE_SETTINGS), {});
});
test('general settings reject invalid motifs, empty loading text and blank maintenance notices', () => {
  assert.equal(validGeneralSettings(DEFAULT_SITE_SETTINGS), true);
  assert.equal(validGeneralSettings({ ...DEFAULT_SITE_SETTINGS, loading_text_ar: ' ' }), false);
  assert.equal(validGeneralSettings({ ...DEFAULT_SITE_SETTINGS, loading_text_en: 'a'.repeat(121) }), false);
  assert.equal(validGeneralSettings({ ...DEFAULT_SITE_SETTINGS, maintenance_mode: true, maintenance_message_ar: '' }), false);
  assert.equal(validGeneralSettings({ ...DEFAULT_SITE_SETTINGS, splash_motif: 'crown' as any }), false);
  assert.equal(validGeneralSettings({ ...DEFAULT_SITE_SETTINGS, splash_motif: 'needle_thread' }), true);
});

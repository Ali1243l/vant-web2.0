import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveStoreLanguage, STORE_TITLES } from '../src/lib/storeLanguage.ts';

test('a saved site language wins over device preferences', () => {
  assert.equal(resolveStoreLanguage('ar', ['en-US']), 'ar');
  assert.equal(resolveStoreLanguage('en', ['ar-IQ']), 'en');
});

test('first visits use a supported browser language and otherwise default to Arabic', () => {
  assert.equal(resolveStoreLanguage(null, ['en-GB', 'ar-IQ']), 'en');
  assert.equal(resolveStoreLanguage('invalid', ['AR-iq']), 'ar');
  assert.equal(resolveStoreLanguage(null, ['fr-FR', 'en-US']), 'en');
  assert.equal(resolveStoreLanguage(null, ['fr-FR']), 'ar');
  assert.equal(resolveStoreLanguage(null, []), 'ar');
});

test('both title variants retain the Arabic and Latin brand names', () => {
  assert.equal(STORE_TITLES.ar, 'فانت | VANT');
  assert.equal(STORE_TITLES.en, 'VANT | فانت');
});

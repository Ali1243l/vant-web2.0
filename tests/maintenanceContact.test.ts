import test from 'node:test';
import assert from 'node:assert/strict';
import { maintenanceContactUrl } from '../src/lib/maintenanceContact.ts';
test('maintenance contact obeys the WhatsApp master switch and never invents a fallback number', () => {
  assert.equal(maintenanceContactUrl('+964 770 123 4567', false), null);
  assert.equal(maintenanceContactUrl(undefined, true), null);
  assert.equal(maintenanceContactUrl('123', true), null);
  assert.equal(maintenanceContactUrl('bad9647701234567', true), null);
  assert.equal(maintenanceContactUrl('1234567890123456', true), null);
});
test('maintenance contact uses the configured phone and an inquiry message only', () => {
  const url = new URL(maintenanceContactUrl('+964 (770) 123-4567', true)!);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/9647701234567');
  assert.equal(url.searchParams.get('text'), 'مرحباً فانت، أود الاستفسار أثناء فترة صيانة المتجر.');
});

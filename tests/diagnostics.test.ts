import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnosticText, diagnosticPath, diagnosticDevice, diagnosticHint, errorFingerprint, sanitizeTelemetry } from '../src/lib/diagnostics.ts';

test('diagnostics redact credentials, recovery URLs and contact details before local or cloud recording', () => {
  const clean = diagnosticText('Failed https://vant.test/?access_token=private#refresh_token=hidden email=person@example.com {"password":"secret words"} Bearer eyJabc.defgh.ijkl +9647701234567');
  for (const value of ['private', 'hidden', 'person@example.com', 'secret words', 'eyJabc', '964770']) assert.ok(!clean.includes(value), value);
  assert.equal(diagnosticPath('https://user:pass@vant.test/?auth=recovery#token=abc'), 'https://vant.test/');
  assert.equal(diagnosticPath('/user/person%40example.com'), '/user/[email]');
  const payload = sanitizeTelemetry({ password: 'hidden', nested: { access_token: 'hidden', query: 'person@example.com', address: 'Street' }, amount: 25, value: Infinity });
  assert.deepEqual(payload, { password: '[redacted]', nested: { access_token: '[redacted]', query: '[email]', address: '[redacted]' }, amount: 25, value: null });
  assert.equal(diagnosticText('x'.repeat(5000)).length, 1000);
  assert.equal(diagnosticText('x'.repeat(2000000)).length, 1000, 'cap input before redaction so enormous stacks cannot stall capture');
  assert.equal(sanitizeTelemetry(Array.from({ length: 100 }, () => 'x')).length, 12);
});
test('device classification handles mobile lowercase, Safari and tablets without storing the complete user agent', () => {
  assert.deepEqual(diagnosticDevice('Mozilla iPhone Mobile Safari'), { device: 'mobile', browser: 'Safari', os: 'iOS' });
  assert.equal(diagnosticDevice('mozilla android tablet chrome').device, 'tablet');
  assert.equal(diagnosticDevice('Windows Chrome Edg/120').browser, 'Edge');
});
test('diagnostic hints remain hypotheses and fingerprints distinguish operation failures', () => {
  assert.equal(diagnosticHint('runtime', false, 'failed'), 'offline');
  assert.equal(diagnosticHint('runtime', true, 'Failed to fetch dynamically imported module'), 'asset-version');
  assert.equal(diagnosticHint('save', true, '42501 permission denied'), 'permission');
  assert.equal(diagnosticHint('runtime', true, 'unknown'), 'needs-investigation');
  assert.equal(errorFingerprint('same', 'at file.js:1', 'runtime'), errorFingerprint('same', 'at file.js:1', 'runtime'));
  assert.notEqual(errorFingerprint('same', '', 'runtime'), errorFingerprint('same', '', 'promise'));
});

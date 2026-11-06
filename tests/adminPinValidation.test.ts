import test from 'node:test';
import assert from 'node:assert/strict';
import { pinChangeIssue, readAdminPin, matchesAdminPin } from '../src/lib/adminPinValidation.ts';

test('the lock and security editor read the same stored code and accept no legacy bypass values', () => {
  const code = readAdminPin({ getItem: key => key === 'vant_admin_pass_v3' ? 'Sample-Code' : 'old-key-value' });
  assert.equal(code, 'Sample-Code');
  assert.equal(matchesAdminPin('Sample-Code', code), true);
  for (const input of ['sample-code', 'admin', '1234', '200710', 'old-key-value', '']) assert.equal(matchesAdminPin(input, code), false);
  assert.equal(matchesAdminPin('anything', ''), false);
  assert.equal(readAdminPin({ getItem: () => { throw Error('blocked'); } }), '');
});
test('access-code validation preserves password support and rejects incorrect current and mismatched confirmation', () => {
  assert.equal(pinChangeIssue('sample-old', 'sample-old', 'sample-new', 'sample-new'), null);
  assert.equal(pinChangeIssue('wrong', 'sample-old', 'sample-new', 'sample-new'), 'current');
  assert.equal(pinChangeIssue('', '', 'sample-new', 'sample-new'), 'current');
  assert.equal(pinChangeIssue('sample-old', 'sample-old', 'sample-new', 'other'), 'confirmation');
});
test('access-code validation bounds new values without rewriting existing credentials', () => {
  assert.equal(pinChangeIssue('old', 'old', '123', '123'), 'length');
  assert.equal(pinChangeIssue('old', 'old', 'x'.repeat(65), 'x'.repeat(65)), 'length');
  assert.equal(pinChangeIssue('old', 'old', ' new-code', ' new-code'), 'spaces');
  assert.equal(pinChangeIssue('old', 'old', 'new\ncode', 'new\ncode'), 'spaces');
  assert.equal(pinChangeIssue('sample-old', 'sample-old', 'sample-old', 'sample-old'), 'same');
});

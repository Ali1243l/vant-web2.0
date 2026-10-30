import test from 'node:test';
import assert from 'node:assert/strict';
import { pinChangeIssue } from '../src/lib/adminPinValidation.ts';
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

import test from 'node:test';
import assert from 'node:assert/strict';
import { reportCaughtError, setCaughtErrorReporter } from '../src/lib/caughtErrors.ts';
test('handled errors retain context and reporting failures cannot recurse', () => {
  const calls: string[] = [], warnings: unknown[][] = [], warn = console.warn;
  console.warn = (...args) => { warnings.push(args); };
  try {
    setCaughtErrorReporter((_error, operation) => { calls.push(operation); reportCaughtError(Error('nested'), 'nested'); throw Error('PRIVATE_SENTINEL'); });
    reportCaughtError(Error('problem'), 'cart-save');
    assert.deepEqual(calls, ['cart-save']);
    assert.ok(!JSON.stringify(warnings).includes('PRIVATE_SENTINEL'));
    setCaughtErrorReporter((_error, operation) => { calls.push(operation); });
    reportCaughtError(Error('retry'), 'cart-retry');
    assert.deepEqual(calls, ['cart-save', 'cart-retry']);
  } finally { console.warn = warn; }
});

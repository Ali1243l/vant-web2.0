import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/cart-quote.ts';

test('quote endpoint loads as a native server module and rejects invalid input before network access', async () => {
  const response: any = { code: 200, headers: {}, setHeader(key: string, value: string) { this.headers[key] = value; }, status(code: number) { this.code = code; return this; }, json(value: unknown) { this.value = value; return this; } };
  await handler({ method: 'POST', body: {} }, response);
  assert.equal(response.code, 400); assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.deepEqual(response.value, { error: 'cart' });
});

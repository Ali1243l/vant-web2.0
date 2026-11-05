import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import handler from '../api/send-welcome.ts';

async function request(method: string, body?: unknown) {
  const response = {
    statusCode: 200,
    payload: undefined as any,
    setHeader() {},
    status(code: number) { this.statusCode = code; return this; },
    json(value: unknown) { this.payload = value; return this; },
    end() { return this; },
  };
  await handler({ method, body }, response);
  return response;
}

test('rejects non-POST delivery requests', async () => {
  assert.equal((await request('GET')).statusCode, 405);
});

test('rejects malformed JSON and invalid body shapes', async () => {
  for (const body of ['{', null, [], 42, { email: 42 }, { email: 'invalid' }, { email: 'test@example.com', discountPercent: 101 }]) {
    assert.equal((await request('POST', body)).statusCode, 400);
  }
});

test('missing server key cannot be reported as an email sent', async () => {
  const originalKey = process.env.RESEND_API_KEY;
  const originalClientKey = process.env.VITE_RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  process.env.VITE_RESEND_API_KEY = 'client-keys-must-not-be-used';
  try {
    const response = await request('POST', { email: 'test@example.com' });
    assert.equal(response.statusCode, 503);
    assert.equal(response.payload.success, false);
    assert.equal(response.payload.emailSent, false);
  } finally {
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    if (originalClientKey === undefined) delete process.env.VITE_RESEND_API_KEY;
    else process.env.VITE_RESEND_API_KEY = originalClientKey;
  }
});

test('provider rejection is a failure; acceptance is a confirmed send', async () => {
  const originalKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_test_not_a_real_key';
  let providerStatus = 403;
  const fetchMock = mock.method(globalThis, 'fetch', async () => new Response(
    JSON.stringify(providerStatus === 200 ? { id: 'test-delivery' } : { name: 'validation_error', message: 'Denied' }),
    { status: providerStatus, headers: { 'Content-Type': 'application/json' } },
  ));
  try {
    const rejected = await request('POST', { email: 'test@example.com' });
    assert.equal(rejected.statusCode, 502);
    assert.equal(rejected.payload.success, false);
    assert.equal(rejected.payload.emailSent, false);
    providerStatus = 200;
    const accepted = await request('POST', { email: 'test@example.com' });
    assert.equal(accepted.statusCode, 200);
    assert.equal(accepted.payload.success, true);
    assert.equal(accepted.payload.emailSent, true);
    assert.equal(fetchMock.mock.callCount(), 2);
  } finally {
    fetchMock.mock.restore();
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  }
});

test('custom template image repair reaches the provider; temporary images prevent delivery', async () => {
  const originalKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_test_not_a_real_key';
  const base = 'https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/';
  let delivered: any;
  const fetchMock = mock.method(globalThis, 'fetch', async (_url: unknown, options: RequestInit) => {
    delivered = JSON.parse(options.body as string);
    return new Response(JSON.stringify({ id: 'image-fixture' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  try {
    const result = await request('POST', { email: 'test@example.com', html: `<img src="${base}${base}newsletter-banners/photo.jpg?a=1&amp;b=2">` });
    assert.equal(result.statusCode, 200);
    assert.equal(delivered.html, `<img src="${base}newsletter-banners/photo.jpg?a=1&amp;b=2">`);
    for (const src of ['blob:https://example.test/temporary', 'data:image/png;base64,AA==', 'http://localhost/photo.jpg']) {
      const rejected = await request('POST', { email: 'test@example.com', html: `<img src="${src}">` });
      assert.equal(rejected.statusCode, 422);
      assert.equal(rejected.payload.emailSent, false);
    }
    assert.equal(fetchMock.mock.callCount(), 1);
  } finally {
    fetchMock.mock.restore();
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  }
});

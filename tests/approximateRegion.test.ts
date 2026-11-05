import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import handler from '../api/visitor-region.ts';
import { normalizeApproximateRegion, approximateRegionLabel } from '../src/lib/approximateRegion.ts';
import { computeDashboardAnalytics } from '../src/admin/analytics/dashboardModel.ts';

test('coarse region validation drops raw IP/coordinates, handles unknowns and never guesses a governorate', () => {
  assert.deepEqual(normalizeApproximateRegion({ country: 'IQ', region: 'BG', ip: '192.0.2.1', latitude: 33, city: 'Baghdad' }), { country: 'IQ', region: 'BG' });
  for (const country of [null, '', 'ZZ', 'XX', 'Iraq', ['IQ'], '<script>']) assert.deepEqual(normalizeApproximateRegion({ country, region: 'BG' }), { country: null, region: null });
  assert.deepEqual(normalizeApproximateRegion({ country: 'IQ', region: 'Baghdad' }), { country: 'IQ', region: null });
  assert.match(approximateRegionLabel({ country: 'IQ', region: 'BG' }, 'ar'), /بغداد/);
  assert.match(approximateRegionLabel({ country: 'IQ', region: 'KR' }, 'en'), /IQ-KR/);
  assert.equal(approximateRegionLabel(null, 'en'), 'Unknown');
  assert.match(approximateRegionLabel({ country: 'US', region: 'CA' }, 'en'), /United States.*US-CA/);
});

test('region endpoint is uncached, read-only and ignores untrusted local headers', () => {
  const original = process.env.VERCEL;
  const response = () => ({ code: 200, data: null as any, headers: {} as Record<string, string>, setHeader(k: string, v: string) { this.headers[k] = v; }, status(code: number) { this.code = code; return this; }, json(data: unknown) { this.data = data; return this; } });
  const req = { method: 'GET', headers: { 'x-vercel-ip-country': 'IQ', 'x-vercel-ip-country-region': 'BG', 'x-forwarded-for': '192.0.2.1', 'x-vercel-ip-latitude': '33' } };
  try {
    delete process.env.VERCEL;
    const local = response(); handler(req, local);
    assert.deepEqual(local.data, { country: null, region: null });
    process.env.VERCEL = '1';
    const live = response(); handler(req, live);
    assert.deepEqual(live.data, { country: 'IQ', region: 'BG' });
    assert.equal(live.headers['Cache-Control'], 'private, no-store');
    const invalid = response(); handler({ ...req, method: 'POST' }, invalid);
    assert.equal(invalid.code, 405);
  } finally { if (original === undefined) delete process.env.VERCEL; else process.env.VERCEL = original; }
});

test('region lookup is deduplicated, does not send cookies and fails without blocking the storefront', async () => {
  const built = await build({ entryPoints: [fileURLToPath(new URL('../src/lib/approximateRegion.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node' });
  const source = 'data:text/javascript;base64,' + Buffer.from(built.outputFiles[0].text).toString('base64');
  let fail = false;
  const fetchMock = mock.method(globalThis, 'fetch', async (url: unknown, options: RequestInit) => {
    assert.equal(url, '/api/visitor-region');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.cache, 'no-store');
    assert.ok(options.signal);
    if (fail) throw new Error('offline');
    return new Response(JSON.stringify({ country: 'IQ', region: 'BG', ip: 'discard' }), { status: 200 });
  });
  try {
    const good = await import(source + '#good');
    const rows = await Promise.all([good.getApproximateRegion(), good.getApproximateRegion()]);
    assert.deepEqual(rows, [{ country: 'IQ', region: 'BG' }, { country: 'IQ', region: 'BG' }]);
    assert.equal(fetchMock.mock.callCount(), 1);
    fail = true;
    const offline = await import(source + '#offline');
    assert.deepEqual(await offline.getApproximateRegion(), { country: null, region: null });
  } finally { fetchMock.mock.restore(); }
});

test('geographic metadata is shown without inventing visits or buyer engagement', () => {
  const now = Date.now(), window = { startTime: now - 60000, endTime: now + 1 };
  const geo = { id: 'geo', type: 'visitor_region' as const, timestamp: now, device: 'desktop' as const, sessionId: 's', data: { visitorId: 'v', geo: { country: 'IQ', region: 'BG' } } };
  const metadataOnly = computeDashboardAnalytics([], [], [geo], window, now);
  assert.equal(metadataOnly.customerSessions.length, 0);
  assert.equal(metadataOnly.overview.uniqueVisitors, 0);
  const result = computeDashboardAnalytics([], [], [{ ...geo, id: 'view', type: 'page_view' as const, timestamp: now - 1000, data: { visitorId: 'v' } }, geo], window, now);
  assert.equal(result.overview.totalVisits, 1);
  assert.equal(result.customerSessions[0].engagementScore, 0);
  assert.deepEqual(result.customerSessions[0].geo, { country: 'IQ', region: 'BG' });
});

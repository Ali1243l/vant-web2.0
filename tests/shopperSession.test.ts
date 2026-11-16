import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

test('customer endpoint protects ownership and stores credentials only in HttpOnly cookies', async () => {
  const built = await build({ entryPoints: [fileURLToPath(new URL('../api/shopper-session.ts', import.meta.url))], bundle: true, write: false, platform: 'node', format: 'esm', plugins: [{ name: 'auth-fixture', setup(builder) {
    builder.onResolve({ filter: /^@supabase\/supabase-js$/ }, () => ({ path: 'fixture', namespace: 'test' }));
    builder.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: `export const createClient = () => ({ auth: {
      getUser: async token => ({ data: { user: token === 'access-test' ? {id:'owner',email_confirmed_at:'yes'} : null }, error:null }),
      refreshSession: async ({refresh_token}) => refresh_token === 'refresh-test' ? ({ data:{session:{access_token:'access-test',refresh_token:'refresh-test',expires_in:3600},user:{id:'owner',email_confirmed_at:'yes'}},error:null }) : ({ data:{session:null},error:{status:400} })
    }, rpc: async (_name, args) => ({data:{acknowledged:args.p_operations.map(op=>op.id),document:{revision:1}},error:null}) });` }));
  } }] });
  const { default: handler } = await import('data:text/javascript;base64,' + Buffer.from(built.outputFiles[0].text).toString('base64'));
  const previous = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_ANON_KEY, vercel: process.env.VERCEL };
  process.env.SUPABASE_URL = 'https://fixture.test'; process.env.SUPABASE_ANON_KEY = 'public-test'; process.env.VERCEL = '1';
  const call = async (method: string, body?: unknown, cookie = '', origin = 'https://vant.test') => {
    const result: any = { code: 200, headers: {}, status(code: number) { this.code = code; return this; }, json(value: unknown) { this.value = value; return this; }, setHeader(name: string, value: unknown) { this.headers[name] = value; } };
    await handler({ method, body, headers: { host: 'vant.test', origin, cookie } }, result);
    return result;
  };
  try {
    assert.deepEqual((await call('GET')).value, { owner: null });
    assert.equal((await call('POST', {action:'exchange',refreshToken:'refresh-test'}, '', 'bad origin')).code, 403);
    assert.equal((await call('POST', {action:'exchange',refreshToken:'refresh-test'}, '', 'https://attacker.test')).code, 403);
    const login = await call('POST', {action:'exchange',refreshToken:'refresh-test'});
    assert.deepEqual(login.value, {owner:'owner'});
    assert.equal(login.headers['Cache-Control'], 'no-store');
    assert.ok(login.headers['Set-Cookie'].every((cookie: string) => cookie.includes('HttpOnly; SameSite=Lax; Path=/api') && cookie.includes('; Secure')));
    assert.ok(!JSON.stringify(login.value).includes('test'));
    const cookie = 'vant_customer_access=access-test; vant_customer_refresh=refresh-test';
    assert.equal((await call('POST', {action:'sync',owner:'other',operations:[]}, cookie)).code, 403);
    assert.equal((await call('POST', {action:'sync',owner:'owner',operations:[]})).code, 401);
    assert.equal((await call('POST', {action:'sync',owner:'owner',operations:[]}, cookie)).code, 200);
    const invalid = await call('GET', undefined, 'vant_customer_refresh=expired');
    assert.equal(invalid.code, 200); assert.ok(invalid.headers['Set-Cookie'].every((value: string) => value.includes('Max-Age=0')));
  } finally {
    for (const [key, value] of Object.entries({ SUPABASE_URL: previous.url, SUPABASE_ANON_KEY: previous.key, VERCEL: previous.vercel })) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});

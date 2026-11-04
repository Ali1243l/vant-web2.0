import test from 'node:test';
import assert from 'node:assert/strict';
import { cloudSignInError, requireCloudAdmin } from '../src/lib/cloudAdminAccess.ts';

test('cloud sign-in explains actionable failures without exposing server error messages', () => {
  assert.match(cloudSignInError({ code: 'invalid_credentials' }, true), /Authentication → Users/);
  assert.match(cloudSignInError({ code: 'invalid_credentials' }, false), /not the Supabase dashboard password/);
  assert.match(cloudSignInError({ code: 'email_not_confirmed' }, false), /Confirm/);
  assert.match(cloudSignInError({ status: 429 }, false), /Wait/);
  assert.match(cloudSignInError({ code: 'user_banned' }, false), /suspended/);
  assert.match(cloudSignInError({ name: 'AuthRetryableFetchError' }, false), /connection/);
  assert.match(cloudSignInError({}, false), /settings and logs/);
});

test('cloud media requires a server-verified user and the existing admin role, never the local PIN alone', async () => {
  let roleChecks = 0;
  const client = { auth: { getUser: async () => ({ data: { user: { id: 'admin' } }, error: null as unknown }) }, rpc: async (name: string) => { assert.equal(name, 'is_admin'); roleChecks++; return { data: true as unknown, error: null as unknown }; } };
  await requireCloudAdmin(client);
  assert.equal(roleChecks, 1);
  client.auth.getUser = async () => ({ data: { user: null as any }, error: null });
  await assert.rejects(requireCloudAdmin(client));
  assert.equal(roleChecks, 1);
  client.auth.getUser = async () => ({ data: { user: { id: 'user' } }, error: null });
  client.rpc = async () => ({ data: false, error: null });
  await assert.rejects(requireCloudAdmin(client));
  client.rpc = async () => ({ data: 'true', error: null });
  await assert.rejects(requireCloudAdmin(client));
  client.rpc = async () => ({ data: true, error: new Error('offline') });
  await assert.rejects(requireCloudAdmin(client));
  await assert.rejects(requireCloudAdmin(null));
});

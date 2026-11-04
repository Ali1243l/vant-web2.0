import test from 'node:test';
import assert from 'node:assert/strict';
import { isPasswordRecoveryUrl, saveRecoveredPassword } from '../src/lib/passwordRecovery.ts';

test('recovery routing handles dashboard links, dedicated links and expired links without routing normal visits', () => {
  assert.equal(isPasswordRecoveryUrl('https://vant-web.vercel.app/?auth=recovery'), true);
  assert.equal(isPasswordRecoveryUrl('https://vant-web.vercel.app/#type=recovery&access_token=example'), true);
  assert.equal(isPasswordRecoveryUrl('https://vant-web.vercel.app/#error=access_denied&error_code=otp_expired'), true);
  assert.equal(isPasswordRecoveryUrl('https://vant-web.vercel.app/?admin'), false);
});

test('password recovery validates both inputs and server session before updating, and never reports failed writes as success', async () => {
  let updates = 0;
  const client = { auth: { getUser: async () => ({ data: { user: { id: 'user' } }, error: null as unknown }), updateUser: async (input: { password: string }) => { updates++; assert.equal(input.password, 'new-password-123'); return { error: null as any }; } } };
  await assert.rejects(saveRecoveredPassword(client, 'short', 'short'));
  await assert.rejects(saveRecoveredPassword(client, 'new-password-123', 'different-password'));
  assert.equal(updates, 0);
  await saveRecoveredPassword(client, 'new-password-123', 'new-password-123');
  assert.equal(updates, 1);
  client.auth.getUser = async () => ({ data: { user: null as any }, error: new Error('invalid session') });
  await assert.rejects(saveRecoveredPassword(client, 'new-password-123', 'new-password-123'));
  assert.equal(updates, 1);
  client.auth.getUser = async () => ({ data: { user: { id: 'user' } }, error: null });
  client.auth.updateUser = async () => ({ error: { code: 'weak_password' } });
  await assert.rejects(saveRecoveredPassword(client, 'new-password-123', 'new-password-123'), /شروط Supabase/);
});

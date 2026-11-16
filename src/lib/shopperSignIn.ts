export async function requestShopperLink(client: any, email: string, origin: string): Promise<void> {
  if (!client) throw Error('sync-unavailable');
  const ready = await client.rpc('shopper_sync_ready');
  if (ready.error || ready.data !== true) throw Error('sync-unavailable');
  const { error } = await client.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: new URL('/?shopper=1', origin).href } });
  if (error) throw error;
}

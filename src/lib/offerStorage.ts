const isOfferSnapshot = (value: unknown): value is { id: string }[] => Array.isArray(value) && value.every(row => row && typeof row === 'object' && typeof row.id === 'string');

export async function saveOfferSnapshot(client: any, offers: unknown[]): Promise<boolean> {
  if (!client || !isOfferSnapshot(offers)) return false;
  try {
    const { error } = await client.storage.from('product-images').upload('config/offers.json', new Blob([JSON.stringify(offers)], { type: 'application/json' }), {
      contentType: 'application/json', cacheControl: '0', upsert: true,
    });
    return !error;
  } catch { return false; }
}

export async function fetchOfferSnapshot(client: any, fetcher: typeof fetch = fetch): Promise<unknown[] | null> {
  if (!client) return null;
  try {
    const { data } = client.storage.from('product-images').getPublicUrl('config/offers.json');
    if (!data?.publicUrl) return null;
    const response = await fetcher(`${data.publicUrl}?t=${Date.now()}`, { cache: 'no-store' });
    if (response.ok) {
      const rows = await response.json();
      return isOfferSnapshot(rows) ? rows : null;
    }
    // Only a missing snapshot uses SQL; temporary errors must not resurrect old records.
    if (response.status !== 404) return null;
    const { data: rows, error } = await client.from('offers').select('*').order('created_at', { ascending: false });
    return !error && isOfferSnapshot(rows) ? rows : null;
  } catch { return null; }
}

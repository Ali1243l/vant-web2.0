export async function fetchCatalogPage(fetcher: typeof fetch, client: any, pageSize: number): Promise<{ data: any[]; count: number | null } | null> {
  try {
    const response = await fetcher('/api/products');
    if (response.ok) {
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) return { data: json.data, count: Number.isSafeInteger(json.count) && json.count >= 0 ? json.count : json.data.length };
    }
  } catch { /* The direct client can still work when the proxy is unavailable. */ }
  if (!client) return null;
  try {
    const { data, count, error } = await client.from('products').select('*, product_media(*)', { count: 'exact' }).order('created_at', { ascending: false }).range(0, pageSize - 1);
    return !error && Array.isArray(data) ? { data, count: Number.isSafeInteger(count) && count >= 0 ? count : data.length } : null;
  } catch { return null; }
}

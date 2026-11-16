export async function fetchCatalogPage(fetcher: typeof fetch, client: any, pageSize: number): Promise<{ data: any[]; count: number | null } | null> {
  // The catalog proxy exists only in local development; cloud visits use the paginated client first.
  if (client) {
    try {
      const { data, count, error } = await client.from('products').select('*, product_media(*)', { count: 'exact' }).order('created_at', { ascending: false }).order('id', { ascending: false }).range(0, pageSize - 1);
      if (!error && Array.isArray(data)) return { data, count: Number.isSafeInteger(count) && count >= 0 ? count : data.length };
      reportCaughtError(error || Error('Invalid catalog response'), 'catalog-direct');
    } catch (error) { reportCaughtError(error, 'catalog-direct'); }
  }
  try {
    const response = await fetcher('/api/products');
    if (response.ok) {
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) return { data: json.data, count: Number.isSafeInteger(json.count) && json.count >= 0 ? json.count : json.data.length };
    }
  } catch (error) { reportCaughtError(error, 'catalog-proxy'); }
  return null;
}
import { reportCaughtError } from './caughtErrors.ts';

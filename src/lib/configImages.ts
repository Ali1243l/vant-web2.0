/** Upload once per unique inline image; failed uploads leave the published config untouched. */
export async function externalizeConfigImages<T>(value: T, upload: (source: string) => Promise<string>): Promise<T> {
  const uploaded = new Map<string, string>();
  const visit = async (item: unknown): Promise<unknown> => {
    if (typeof item === 'string') {
      if (/^data:image\/(png|jpeg|webp);base64,/i.test(item)) {
        if (!uploaded.has(item)) {
          const url = await upload(item);
          const parsed = new URL(url);
          if (parsed.protocol !== 'https:' || parsed.hostname !== 'gjjsdnyfhhbacuciqwbq.supabase.co' || !parsed.pathname.startsWith('/storage/v1/object/public/product-images/')) throw new Error('Invalid uploaded image URL');
          uploaded.set(item, url);
        }
        return uploaded.get(item);
      }
      if (item.includes('data:image/') && /^\s*[\[{]/.test(item)) {
        let parsed: unknown;
        try { parsed = JSON.parse(item); } catch { return item; }
        return JSON.stringify(await visit(parsed));
      }
      return item;
    }
    if (Array.isArray(item)) { const rows: unknown[] = []; for (const row of item) rows.push(await visit(row)); return rows; }
    if (item && typeof item === 'object') {
      const entries: Array<[string, unknown]> = [];
      for (const [key, child] of Object.entries(item)) entries.push([key, await visit(child)]);
      return Object.fromEntries(entries);
    }
    return item;
  };
  return await visit(value) as T;
}

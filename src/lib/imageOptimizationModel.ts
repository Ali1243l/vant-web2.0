const origin = 'https://gjjsdnyfhhbacuciqwbq.supabase.co';
const publicPath = '/storage/v1/object/public/product-images/';

export function isStoreImage(source: string): boolean {
  try {
    const url = new URL(source);
    return url.origin === origin && !url.username && !url.password && !url.search && !url.hash && url.pathname.startsWith(publicPath) && /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(url.pathname);
  } catch { return false; }
}

export function collectStoreImages(value: unknown): string[] {
  const sources = new Set<string>();
  const visit = (item: unknown) => {
    if (typeof item === 'string') {
      if (isStoreImage(item) && !new URL(item).pathname.startsWith(publicPath + 'optimized/')) sources.add(item);
      else if (/^\s*[\[{]/.test(item)) { try { visit(JSON.parse(item)); } catch { /* Plain text is not a theme payload. */ } }
    }
    else if (Array.isArray(item)) item.forEach(visit);
    else if (item && typeof item === 'object') Object.values(item).forEach(visit);
  };
  visit(value);
  return [...sources];
}

export function replaceOptimizedImages<T>(value: T, replacements: Record<string, string> = {}): T {
  const visit = (item: any): any => {
    if (typeof item === 'string') {
      const target = Object.hasOwn(replacements, item) ? replacements[item] : undefined;
      if (typeof target === 'string' && isStoreImage(item) && isStoreImage(target) && new URL(target).pathname.startsWith(publicPath + 'optimized/')) return target;
      if (/^\s*[\[{]/.test(item)) {
        try { const parsed = JSON.parse(item); const replaced = visit(parsed); return JSON.stringify(parsed) === JSON.stringify(replaced) ? item : JSON.stringify(replaced); } catch { /* Keep non-JSON copy unchanged. */ }
      }
      return item;
    }
    if (Array.isArray(item)) return item.map(visit);
    if (item && typeof item === 'object') return Object.fromEntries(Object.entries(item).map(([key, entry]) => [key, key === 'image_optimizations' ? entry : visit(entry)]));
    return item;
  };
  return visit(value);
}

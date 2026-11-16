export function isShopperCallback(url: URL): boolean {
  const type = new URLSearchParams(url.hash.slice(1)).get('type');
  if (type === 'recovery' || url.searchParams.get('auth') === 'recovery') return false;
  return url.searchParams.get('shopper') === '1' || type === 'magiclink' || type === 'signup';
}

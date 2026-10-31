export interface CatalogImage { fit: 'contain' | 'cover'; x: number; y: number }
export const CATALOG_IMAGE_RATIO = '3 / 4';
export const DEFAULT_CATALOG_IMAGE: CatalogImage = { fit: 'cover', x: 50, y: 50 };

export function normalizeCatalogImage(value: unknown): CatalogImage {
  const raw = value && typeof value === 'object' ? value as Partial<CatalogImage> : {};
  const position = (number: unknown) => typeof number === 'number' && Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 50;
  return { fit: raw.fit === 'contain' ? 'contain' : 'cover', x: position(raw.x), y: position(raw.y) };
}

export function validCatalogImage(value: unknown): value is CatalogImage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const raw = value as CatalogImage;
  return ['contain', 'cover'].includes(raw.fit) && [raw.x, raw.y].every(number => typeof number === 'number' && Number.isFinite(number) && number >= 0 && number <= 100);
}

export function catalogImageStyle(value: unknown) {
  const image = normalizeCatalogImage(value);
  return { objectFit: image.fit, objectPosition: image.fit === 'cover' ? `${image.x}% ${image.y}%` : '50% 50%' };
}

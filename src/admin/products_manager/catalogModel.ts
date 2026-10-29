import { productCampaignPrice } from '../offers/offerModel.ts';
import type { Product, Offer } from '../useAdminBridge';

export const hasProductOffer = (product: Product) => !!product.isOnOffer && typeof product.salePrice === 'number' && product.salePrice > 0 && product.salePrice < product.price;
export const productSellingPrice = (product: Product) => hasProductOffer(product) ? product.salePrice! : product.price;
export function stockAvailability(stock: number | null, selected: NonNullable<Product['availabilityStatus']>) {
  if (selected === 'coming_soon') return selected;
  if (stock === 0) return 'sold_out';
  if (stock !== null && stock <= 5 && selected === 'in_stock') return 'limited';
  return selected;
}
export function recordedProductStock(product: { variants?: any[]; stock?: number; availability?: string }): number | null {
  if (product.variants?.length) return product.variants.every(variant => Number.isInteger(variant.stock) && variant.stock >= 0) ? product.variants.reduce((sum, variant) => sum + variant.stock, 0) : null;
  if (product.availability === 'sold_out') return 0;
  return Number.isInteger(product.stock) && product.stock! >= 0 ? product.stock! : null;
}
export function filterCatalog(products: Product[], filters: { search: string; category: string; status: string; min: number; max: number; sort: string }) {
  const query = filters.search.trim().toLowerCase();
  return products.filter(product => (!query || [product.name, product.nameEn, product.sku, product.id].some(value => String(value || '').toLowerCase().includes(query)))
    && (filters.category === 'all' || product.category === filters.category)
    && (filters.status === 'all' || product.status === filters.status)
    && productSellingPrice(product) >= filters.min && productSellingPrice(product) <= filters.max)
    .sort((a, b) => filters.sort === 'price-asc' ? productSellingPrice(a) - productSellingPrice(b) : filters.sort === 'price-desc' ? productSellingPrice(b) - productSellingPrice(a) : filters.sort === 'sales' ? b.salesCount - a.salesCount : filters.sort === 'stock' ? (a.stockKnown === false ? Infinity : a.stock) - (b.stockKnown === false ? Infinity : b.stock) : 0);
}

export function productPricePatch(current: Product, updates: Partial<Product>) {
  const base = updates.price ?? current.price;
  if (!Number.isFinite(base) || base <= 0) throw new Error('Price must be positive');
  const sale = Object.hasOwn(updates, 'salePrice') ? updates.salePrice : current.salePrice;
  const enabled = updates.isOnOffer ?? (Object.hasOwn(updates, 'salePrice') ? sale !== undefined : !!current.isOnOffer);
  if (!enabled) return { price: base, original_price: undefined, is_offer: false };
  if (typeof sale !== 'number' || !Number.isFinite(sale) || sale <= 0 || sale >= base) throw new Error('Sale price must be below regular price');
  return { price: sale, original_price: base, is_offer: true };
}

export function validateProductNumbers(price: string, sale: string, stock: string) {
  if (!Number.isFinite(Number(price)) || Number(price) <= 0) throw new Error('price');
  if (sale.trim() && (!Number.isFinite(Number(sale)) || Number(sale) <= 0 || Number(sale) >= Number(price))) throw new Error('sale');
  if (stock.trim() && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) throw new Error('stock');
}

export function productLink(origin: string, id: string | number) {
  const url = new URL('/', origin); url.searchParams.set('item', String(id)); return url.toString();
}

export function catalogOfferPlan(products: Product[], updates: { salePrice?: number; discountPercent?: number }, campaign?: Offer) {
  return products.map(product => {
    const salePrice = campaign ? productCampaignPrice(campaign, product.price) ?? undefined
      : updates.discountPercent !== undefined ? Math.round(product.price * (1 - updates.discountPercent / 100) / 250) * 250 : updates.salePrice;
    productPricePatch(product, { isOnOffer: true, salePrice });
    return { id: product.id, salePrice };
  });
}

import React from 'react';
import type { Product } from '../useAdminBridge';
import { formatCurrency } from '../format';
import { ProductActions, type ProductActionsProps } from './ProductActions';
import { hasProductOffer, productSellingPrice } from './catalogModel';

interface Props extends ProductActionsProps { filteredProducts: Product[] }
export const ProductsGridView: React.FC<Props> = props => <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
  {!props.filteredProducts.length && <p role="status" className="col-span-full text-center py-12 text-slate-400">{props.isAr ? 'لا توجد منتجات تطابق الفلاتر.' : 'No products match these filters.'}</p>}
  {props.filteredProducts.map(product => <article key={product.id} className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col">
    {product.imageUrl && <img src={product.imageUrl} alt={props.isAr ? product.name : product.nameEn || product.name} className="w-full aspect-[4/3] object-cover bg-slate-800" loading="lazy" />}
    <div className="p-4 flex-1 space-y-3"><p className="text-xs text-slate-400">{product.category}</p><h3 className="font-semibold text-white">{props.isAr ? product.name : product.nameEn || product.name}</h3><p className="text-[10px] text-slate-500 break-all" dir="ltr">{product.sku}</p><p className="text-lg font-bold text-emerald-300">{formatCurrency(productSellingPrice(product), 'IQD', props.isAr ? 'ar' : 'en')}{hasProductOffer(product) && <del className="ms-2 text-xs font-normal text-slate-500">{formatCurrency(product.price, 'IQD', props.isAr ? 'ar' : 'en')}</del>}</p><p className="text-xs text-slate-400">{product.stockKnown === false ? (props.isAr ? 'كمية المخزون غير مسجّلة' : 'Stock quantity not recorded') : `${product.stock} ${props.isAr ? 'قطعة' : 'units'}`} · {product.variants?.length ? (props.isAr ? product.variants.length + ' ألوان' : product.variants.length + ' colors') : (props.isAr ? 'بدون خيارات ألوان مستقلة' : 'No separate color variants')}</p><p className="text-xs text-slate-400">{product.sizes?.join(' · ') || '—'}</p></div>
    <div className="p-4 border-t border-slate-800"><ProductActions {...props} product={product} /></div>
  </article>)}
</div>;

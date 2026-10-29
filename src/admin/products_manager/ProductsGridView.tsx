import React from 'react';
import type { Product } from '../useAdminBridge';
import { formatCurrency } from '../format';
import { ProductActions, type ProductActionsProps } from './ProductActions';
import { hasProductOffer, productSellingPrice } from './catalogModel';

interface Props extends ProductActionsProps { filteredProducts: Product[] }
export const ProductsGridView: React.FC<Props> = props => (
  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
    {!props.filteredProducts.length && <p role="status" className="col-span-full text-center py-12 text-slate-400">{props.isAr ? 'لا توجد منتجات تطابق الفلاتر.' : 'No products match these filters.'}</p>}
    {props.filteredProducts.map(product => (
      <article key={product.id} className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col">
        <div className="relative bg-slate-950/60">
          {product.imageUrl && <img src={product.imageUrl} alt={props.isAr ? product.name : product.nameEn || product.name} className="w-full aspect-[4/3] object-contain p-3" loading="lazy" />}
          <span className={`absolute top-3 start-3 rounded-full border px-2.5 py-1 text-[11px] bg-slate-950/90 ${product.status === 'outOfStock' ? 'text-rose-300 border-rose-500/30' : 'text-slate-200 border-slate-700'}`}>
            {product.status === 'outOfStock' ? (props.isAr ? 'نفد المخزون' : 'Out of stock') : product.status === 'draft' ? (props.isAr ? 'قريباً' : 'Coming soon') : product.status === 'lowStock' ? (props.isAr ? 'محدود' : 'Limited') : (props.isAr ? 'متوفر' : 'Available')}
          </span>
        </div>
        <div className="p-4 flex-1 space-y-3">
          <p className="text-xs text-slate-400">{product.category}</p>
          <h3 className="font-semibold text-white leading-6">{props.isAr ? product.name : product.nameEn || product.name}</h3>
          <p className="text-[10px] text-slate-500 break-all" dir="ltr">{product.sku}</p>
          <div className="product-card-prices flex flex-wrap items-baseline gap-x-3 gap-y-1" dir="ltr">
            <bdi className="text-lg font-bold text-emerald-300">{formatCurrency(productSellingPrice(product), 'IQD', props.isAr ? 'ar' : 'en')}</bdi>
            {hasProductOffer(product) && <del className="text-xs text-slate-500"><bdi>{formatCurrency(product.price, 'IQD', props.isAr ? 'ar' : 'en')}</bdi></del>}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-slate-400">
            <span>{product.stockKnown === false ? (props.isAr ? 'الكمية غير مسجّلة' : 'Quantity not recorded') : `${product.stock} ${props.isAr ? 'قطعة' : 'units'}`}</span>
            {!!product.variants?.length && <span>{product.variants.length} {props.isAr ? 'ألوان' : 'colors'}</span>}
          </div>
          <p className="text-xs text-slate-300" dir="ltr">{product.sizes?.join(' · ') || '—'}</p>
        </div>
        <div className="p-4 border-t border-slate-800"><ProductActions {...props} product={product} showLabels /></div>
      </article>
    ))}
  </div>
);

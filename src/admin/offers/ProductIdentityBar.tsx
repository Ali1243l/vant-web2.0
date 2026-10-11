import React from 'react';
import { Tag, RotateCcw, Package } from 'lucide-react';
import type { Product } from '../useAdminBridge';
import { formatCurrency } from '../format';

interface ProductIdentityBarProps {
  product: Product;
  hasCurrentOffer: boolean;
  isAr: boolean;
  categoryCount: number;
  applyToCategory: boolean;
  setApplyToCategory: (val: boolean) => void;
  onRemoveOffer: (productId: string, removeFromAllInCategory?: boolean) => void;
  onClose: () => void;
}

export const ProductIdentityBar: React.FC<ProductIdentityBarProps> = ({
  product,
  hasCurrentOffer,
  isAr,
  categoryCount,
  applyToCategory,
  setApplyToCategory,
  onRemoveOffer,
  onClose,
}) => {
  return (
    <div className="space-y-3.5">
      {/* Product Identity & Quick Status Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 shadow-md">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            {product.imageUrl?.trim() ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-slate-800 border border-slate-700/80 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-500 shadow-md">
                <Tag className="w-6 h-6" />
              </div>
            )}
            {hasCurrentOffer && (
              <span className="absolute -top-1.5 -start-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-lg ring-2 ring-slate-950">
                %
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                {product.sku}
              </span>
              <span className="text-[11px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 truncate">
                {product.category}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white truncate mt-1">
              {isAr ? product.name : product.nameEn || product.name}
            </h4>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs">
              <span className="text-slate-400">
                {isAr ? 'السعر الأصلي: ' : 'Base Price: '}
                <strong className="text-white font-bold font-mono tracking-tight" dir="ltr">
                  {formatCurrency(product.price, 'IQD', 'en')}
                </strong>
              </span>
              {hasCurrentOffer && (
                <>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 shrink-0" />
                    {isAr ? 'العرض الحالي: ' : 'Active Sale: '}
                    <strong className="font-mono tracking-tight" dir="ltr">
                      {formatCurrency(product.salePrice || product.price, 'IQD', 'en')}
                    </strong>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Clear Offer if active */}
        {hasCurrentOffer && (
          <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            <button
              type="button"
              onClick={() => {
                onRemoveOffer(product.id, false);
                onClose();
              }}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title={isAr ? 'إلغاء العرض وإعادة السعر الأصلي' : 'Remove promo and restore price'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إلغاء العرض' : 'Clear Promo'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Bulk Category Application Toggle */}
      {categoryCount > 1 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/30 border border-indigo-500/30 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'تطبيق جماعي على كامل الفئة' : 'Bulk Category Application'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  {categoryCount} {isAr ? 'منتجات' : 'products'}
                </span>
              </p>
              <p className="text-slate-400 mt-0.5">
                {isAr
                  ? `تطبيق نفس العرض فوراً على جميع السلع التابعة لقسم "${product.category}" دون الحاجة لتكرار العملية.`
                  : `Apply the same discount and badge to all items in category "${product.category}".`}
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 shrink-0 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={applyToCategory}
              onChange={(e) => setApplyToCategory(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800 cursor-pointer"
            />
            <span className="text-xs font-bold text-indigo-300">
              {isAr ? 'تفعيل للكل' : 'Apply All'}
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

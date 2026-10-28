import React from 'react';
import { Tag } from 'lucide-react';
import type { Product, Language } from '../../types';

interface ProductHeaderInfoProps {
  displayCategory?: string;
  statusBadgeClasses: string;
  statusDotClass: string;
  statusBadgeLabel: string;
  displayTitle?: string;
  formatPrice: (price: number) => string;
  activePrice: number;
  product: Product;
  activeVariant?: {
    originalPrice?: number;
  } | null;
  lang: Language;
  availability: string;
  statusBannerText: string;
}

export const ProductHeaderInfo: React.FC<ProductHeaderInfoProps> = ({
  displayCategory,
  statusBadgeClasses,
  statusDotClass,
  statusBadgeLabel,
  displayTitle,
  formatPrice,
  activePrice,
  product,
  activeVariant,
  lang,
  availability,
  statusBannerText,
}) => {
  const originalPrice = activeVariant ? activeVariant.originalPrice : product.original_price;
  const hasDiscount = Boolean(originalPrice && originalPrice > activePrice);

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3">
      {/* 1. Header Metadata: Category + Availability Badge */}
      <div className="flex items-center gap-2 flex-wrap ">
        {displayCategory && (
          <span className="text-[11px] md:text-xs font-bold tracking-widest uppercase text-[#6b7280] dark:text-[#9ca3af]">
            {displayCategory}
          </span>
        )}
        {displayCategory && <span className="text-black/20 dark:text-white/20">•</span>}
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold border backdrop-blur-md ${statusBadgeClasses}`}>
          {statusDotClass && <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass}`} />}
          <span>{statusBadgeLabel}</span>
        </span>
      </div>

      {/* 2. Editorial Title */}
      <h2
        dir="auto"
        className="text-xl sm:text-2xl lg:text-[28px] font-extrabold leading-snug tracking-tight text-[#15171c] dark:text-white"
      >
        {displayTitle}
      </h2>

      {/* 3. Luxury Price & Offer Showcase */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="whitespace-nowrap text-2xl sm:text-3xl font-extrabold tabular-nums text-[#004ad7] dark:text-[#3b82f6] tracking-tight">
              {formatPrice(activePrice)}
            </p>
            {hasDiscount && (
              <span className="whitespace-nowrap text-xs sm:text-sm text-black/35 dark:text-white/40 line-through tabular-nums font-mono font-medium">
                {formatPrice(originalPrice!)}
              </span>
            )}
          </div>

          {(hasDiscount || (!product.variants?.length && product.is_offer)) && (
            <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold bg-[#004ad7]/10 dark:bg-[#3b82f6]/15 border border-[#004ad7]/25 dark:border-[#3b82f6]/35 text-[#004ad7] dark:text-[#60a5fa] shadow-2xs">
              <Tag className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
              <span>{lang === 'ar' ? (product.offer_badge_ar || 'عرض خاص') : (product.offer_badge_en || 'Special Offer')}</span>
              {hasDiscount && (
                <span dir="ltr" className="rounded-md bg-[#004ad7] dark:bg-[#3b82f6] text-white px-1.5 py-0.2 font-mono font-black text-[10px] md:text-xs">
                  -{Math.round(((originalPrice! - activePrice) / originalPrice!) * 100)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Single clean status strip if not regular in_stock */}
        {availability !== 'in_stock' && (
          <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 px-3 py-2 text-xs md:text-sm text-[#15171c] dark:text-white/85">
            <span className={`h-2 w-2 rounded-full shrink-0 ${statusDotClass || 'bg-[#004ad7]'}`} />
            <span dir="auto" className="leading-snug">{statusBannerText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductHeaderInfo;

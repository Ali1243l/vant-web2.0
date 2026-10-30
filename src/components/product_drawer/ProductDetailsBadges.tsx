import { controlActive } from '../../lib/siteControlModel';
import React from 'react';
import { Check, Copy, Share2, Truck, Sparkles } from 'lucide-react';
import type { Language } from '../../types';

interface ControlBadge {
  visible: boolean;
  label_ar: string;
  label_en: string;
}

interface ProductDetailsBadgesProps {
  shareControl: ControlBadge;
  copyControl: ControlBadge;
  deliveryBadgeControl: ControlBadge;
  craftBadgeControl: ControlBadge;
  lang: Language;
  displayDescription?: string;
  handleCopyTitle: () => void;
  copiedTitle: boolean;
  onOpenShareModal: () => void;
}

export const ProductDetailsBadges: React.FC<ProductDetailsBadgesProps> = ({
  shareControl,
  copyControl,
  deliveryBadgeControl,
  craftBadgeControl,
  lang,
  displayDescription,
  handleCopyTitle,
  copiedTitle,
  onOpenShareModal,
}) => {
  const isAr = lang === 'ar';

  return (
    <div className="flex flex-col gap-3.5">
      {/* 1. Editorial Description */}
      {displayDescription && (
        <details className="vant-product-disclosure" open>
          <summary className="min-h-11 flex items-center justify-between text-sm font-bold cursor-pointer">
            {isAr ? 'تفاصيل القطعة' : 'Product details'}<span aria-hidden="true">⌄</span>
          </summary>
          <p
            dir="auto"
            className="text-xs sm:text-[13px] leading-relaxed text-[#15171c]/75 dark:text-white/75"
          >
            {displayDescription}
          </p>
        </details>
      )}

      {/* 2. Cohesive Micro Highlights Grid (Delivery & Craftsmanship) */}
      {(deliveryBadgeControl.visible || craftBadgeControl.visible) && (
        <details className="vant-product-disclosure"><summary className="min-h-11 flex items-center justify-between cursor-pointer text-sm font-bold">{isAr ? 'التوصيل ومعلومات إضافية' : 'Delivery & additional information'}<span aria-hidden="true">⌄</span></summary><div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
          {deliveryBadgeControl.visible && (
            <div className="flex items-start gap-2.5 rounded-xl sm:rounded-2xl border border-black/6 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] p-3 transition-colors">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#004ad7]/10 dark:bg-[#3b82f6]/15 text-[#004ad7] dark:text-[#3b82f6] shrink-0 mt-0.5">
                <Truck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-[#15171c] dark:text-white block">
                  {isAr ? deliveryBadgeControl.label_ar : deliveryBadgeControl.label_en}
                </span>
                <span className="text-[10.5px] text-[#6b7280] dark:text-[#9ca3af] leading-normal block mt-0.5">
                  {isAr ? 'تواصل معنا لتأكيد موعد التوصيل وتفاصيل المعاينة' : 'Contact us to confirm delivery timing and inspection details'}
                </span>
              </div>
            </div>
          )}

          {craftBadgeControl.visible && (
            <div className="flex items-start gap-2.5 rounded-xl sm:rounded-2xl border border-black/6 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] p-3 transition-colors">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#004ad7]/10 dark:bg-[#3b82f6]/15 text-[#004ad7] dark:text-[#3b82f6] shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-[#15171c] dark:text-white block">
                  {isAr ? craftBadgeControl.label_ar : craftBadgeControl.label_en}
                </span>
                <span className="text-[10.5px] text-[#6b7280] dark:text-[#9ca3af] leading-normal block mt-0.5">
                  {isAr ? 'راجع وصف القطعة والخامات قبل اختيارك' : 'Review the description and materials before choosing'}
                </span>
              </div>
            </div>
          )}
        </div></details>
      )}

      {/* 3. Utility Actions (Copy Title & Share) - Understated Row */}
      {(shareControl.visible || copyControl.visible) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-black/5 dark:border-white/5">
          {copyControl.visible && (
            <button
              type="button"
              disabled={!controlActive(copyControl)} onClick={handleCopyTitle}
              className="relative flex h-11 items-center gap-1.5 rounded-lg border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/8 px-2.5 text-[11px] text-[#15171c] dark:text-white hover:border-[#004ad7] dark:hover:border-[#3b82f6] hover:text-[#004ad7] dark:hover:text-[#3b82f6] transition-all active:scale-95 cursor-pointer font-medium select-none"
              title={isAr ? copyControl.label_ar : copyControl.label_en}
            >
              {copiedTitle ? (
                <>
                  <Check className="h-3 w-3 text-[#004ad7] dark:text-[#3b82f6] shrink-0" />
                  <span className="font-bold text-[#004ad7] dark:text-[#3b82f6]">
                    {isAr ? 'تم النسخ' : 'Copied'}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-[#6b7280] dark:text-[#9ca3af] shrink-0" />
                  <span className="min-w-0 max-w-32 truncate">{isAr ? copyControl.label_ar : copyControl.label_en}</span>
                </>
              )}
            </button>
          )}

          {shareControl.visible && (
            <button
              type="button"
              disabled={!controlActive(shareControl)} onClick={onOpenShareModal}
              className="flex h-11 items-center gap-1.5 rounded-lg border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/8 px-2.5 text-[11px] text-[#15171c] dark:text-white hover:border-[#004ad7] dark:hover:border-[#3b82f6] hover:text-[#004ad7] dark:hover:text-[#3b82f6] transition-all active:scale-95 cursor-pointer font-medium select-none"
              title={isAr ? shareControl.label_ar : shareControl.label_en}
              aria-label={isAr ? shareControl.label_ar : shareControl.label_en}
            >
              <Share2 className="h-3 w-3 text-[#6b7280] dark:text-[#9ca3af] shrink-0" />
              <span className="min-w-0 max-w-32 truncate">{isAr ? shareControl.label_ar : shareControl.label_en}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetailsBadges;

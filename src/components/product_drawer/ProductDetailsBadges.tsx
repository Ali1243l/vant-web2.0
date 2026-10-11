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
  return (
    <>
      {/* Secondary Actions (Copy Title & Share) - Understated Pill Row */}
      {(shareControl.visible || copyControl.visible) && (
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          {copyControl.visible && (
            <button
              type="button"
              onClick={handleCopyTitle}
              className="relative flex h-8.5 items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/10 px-3 text-xs text-[#15171c] dark:text-white hover:border-[#004ad7] dark:hover:border-[#3b82f6] hover:text-[#004ad7] dark:hover:text-[#3b82f6] transition-all active:scale-95 cursor-pointer shadow-2xs font-semibold select-none"
              title={lang === 'ar' ? copyControl.label_ar : copyControl.label_en}
            >
              {copiedTitle ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#004ad7] dark:text-[#3b82f6] shrink-0" />
                  <span className="font-bold text-[#004ad7] dark:text-[#3b82f6]">
                    {lang === 'ar' ? 'تم النسخ' : 'Copied'}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#6b7280] dark:text-[#9ca3af] shrink-0" />
                  <span>
                    {lang === 'ar' ? copyControl.label_ar : copyControl.label_en}
                  </span>
                </>
              )}
            </button>
          )}

          {shareControl.visible && (
            <button
              type="button"
              onClick={onOpenShareModal}
              className="flex h-8.5 items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/10 px-3 text-xs text-[#15171c] dark:text-white hover:border-[#004ad7] dark:hover:border-[#3b82f6] hover:text-[#004ad7] dark:hover:text-[#3b82f6] transition-all active:scale-95 cursor-pointer shadow-2xs font-semibold select-none"
              title={lang === 'ar' ? shareControl.label_ar : shareControl.label_en}
              aria-label={lang === 'ar' ? shareControl.label_ar : shareControl.label_en}
            >
              <Share2 className="h-3.5 w-3.5 text-[#6b7280] dark:text-[#9ca3af] shrink-0" />
              <span>
                {lang === 'ar' ? shareControl.label_ar : shareControl.label_en}
              </span>
            </button>
          )}
        </div>
      )}

      <div className="h-px w-full bg-black/5 dark:bg-white/5" />

      {/* Editorial Description */}
      {displayDescription && (
        <p
          dir="auto"
          className="text-xs sm:text-sm leading-relaxed text-[#15171c]/70 dark:text-white/70"
        >
          {displayDescription}
        </p>
      )}

      {/* Cohesive Micro Highlights Grid (Delivery & Craftsmanship) */}
      {(deliveryBadgeControl.visible || craftBadgeControl.visible) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm pb-2">
          {deliveryBadgeControl.visible && (
            <div className="flex items-start gap-2.5 md:gap-3 rounded-xl md:rounded-2xl border border-black/6 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] p-2.5 md:p-3.5">
              <Truck className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-[#004ad7] dark:text-[#3b82f6] mt-0.5" />
              <div>
                <span className="font-bold text-[11px] md:text-xs text-[#15171c] dark:text-white block">
                  {lang === 'ar' ? deliveryBadgeControl.label_ar : deliveryBadgeControl.label_en}
                </span>
                <span className="text-[10px] md:text-[11px] text-[#6b7280] dark:text-[#9ca3af] leading-normal block mt-0.5">
                  {lang === 'ar' ? 'خلال 3 - 5 أيام مع حق الفحص والمعاينة عند الاستلام' : 'Within 3 - 5 days with inspection upon arrival'}
                </span>
              </div>
            </div>
          )}

          {craftBadgeControl.visible && (
            <div className="flex items-start gap-2.5 md:gap-3 rounded-xl md:rounded-2xl border border-black/6 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] p-2.5 md:p-3.5">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-[#004ad7] dark:text-[#3b82f6] mt-0.5" />
              <div>
                <span className="font-bold text-[11px] md:text-xs text-[#15171c] dark:text-white block">
                  {lang === 'ar' ? craftBadgeControl.label_ar : craftBadgeControl.label_en}
                </span>
                <span className="text-[10px] md:text-[11px] text-[#6b7280] dark:text-[#9ca3af] leading-normal block mt-0.5">
                  {lang === 'ar' ? 'حرفية يدوية بإتقان مع ضمان أصالة المظهر' : 'Handcrafted precision & authentic lookbook drop'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProductDetailsBadges;

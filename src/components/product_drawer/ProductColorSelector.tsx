import React from 'react';
import type { Product, Language } from '../../types';
import type { resolveProductColorVariants } from '../../lib/productVariants';

interface ProductColorSelectorProps {
  variantInfo: ReturnType<typeof resolveProductColorVariants> | null;
  product: Product | null;
  lang: Language;
  selectedColorIdx: number | null;
  setSelectedColorIdx: (idx: number | null) => void;
  hoverColorIdx: number | null;
  setHoverColorIdx: (idx: number | null) => void;
  defaultVariantIdx: number;
  onColorChange: () => void;
}

export const ProductColorSelector: React.FC<ProductColorSelectorProps> = ({
  variantInfo,
  product,
  lang,
  selectedColorIdx,
  setSelectedColorIdx,
  hoverColorIdx,
  setHoverColorIdx,
  defaultVariantIdx,
  onColorChange,
}) => {
  if (!variantInfo || (!variantInfo.hasMultipleColors && (!Array.isArray(product?.colors) || product.colors.length === 0))) {
    return null;
  }

  return (
    <div className="space-y-2.5 pt-0.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-bold text-[#15171c] dark:text-white uppercase tracking-wider">
            {lang === 'ar' ? 'اللون:' : 'Color:'}
          </span>
          {selectedColorIdx !== null ? (
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-bold text-[#004ad7] dark:text-[#3b82f6]">
                {variantInfo.variants[selectedColorIdx]?.colorNameAr || ''}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedColorIdx(null);
                  setHoverColorIdx(null);
                  onColorChange();
                }}
                className="text-[11px] font-semibold text-black/45 dark:text-white/50 hover:text-red-500 dark:hover:text-red-400 underline underline-offset-2 transition-colors cursor-pointer"
                title={lang === 'ar' ? 'إلغاء تحديد اللون' : 'Clear color selection'}
              >
                {lang === 'ar' ? 'إلغاء التحديد' : 'Deselect'}
              </button>
            </div>
          ) : hoverColorIdx !== null ? (
            <span className="text-xs md:text-sm font-semibold text-[#004ad7]/80 dark:text-[#3b82f6]/85">
              {variantInfo.variants[hoverColorIdx]?.colorNameAr || ''}
              <span className="text-[10px] text-black/40 dark:text-white/40 ms-1.5 font-normal">
                ({lang === 'ar' ? 'معاينة' : 'preview'})
              </span>
            </span>
          ) : (
            <span className="text-xs md:text-sm font-normal text-black/45 dark:text-white/45">
              {lang === 'ar' ? 'اختر لوناً' : 'Select a color'}
            </span>
          )}
        </div>
        {variantInfo.variants.length > 1 && (
          <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">
            {lang === 'ar' ? `${variantInfo.variants.length} ألوان متوفرة` : `${variantInfo.variants.length} colors`}
          </span>
        )}
      </div>

      {/* Compact Pure Color Swatches Strip */}
      <div className="flex flex-wrap gap-2">
        {variantInfo.variants.map((v, vIdx) => {
          const isSelected = selectedColorIdx === vIdx;
          const isHoveredPreview = selectedColorIdx === null && hoverColorIdx === vIdx;
          const isLight = v.hex.toLowerCase() === '#fafafc' || v.hex.toLowerCase() === '#f3efe6' || v.hex.toLowerCase() === '#ffffff';

          return (
            <button
              key={`${v.id}-${vIdx}`}
              type="button"
              onClick={() => {
                if (selectedColorIdx === vIdx) {
                  setSelectedColorIdx(defaultVariantIdx);
                  setHoverColorIdx(null);
                  onColorChange();
                } else {
                  setSelectedColorIdx(vIdx);
                  setHoverColorIdx(null);
                  onColorChange();
                }
              }}
              onMouseEnter={() => {
                if (selectedColorIdx !== vIdx) {
                  setHoverColorIdx(vIdx);
                  onColorChange();
                }
              }}
              onMouseLeave={() => {
                setHoverColorIdx(null);
                onColorChange();
              }}
              className={`group/color relative flex items-center gap-2 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-start transition-all duration-200 active:scale-95 cursor-pointer select-none ${
                isSelected
                  ? 'border-2 border-[#004ad7] dark:border-[#3b82f6] bg-[#004ad7]/12 dark:bg-[#3b82f6]/20 text-[#004ad7] dark:text-[#60a5fa] font-bold shadow-xs ring-2 ring-[#004ad7]/25 dark:ring-[#3b82f6]/30 scale-[1.02]'
                  : isHoveredPreview
                  ? 'border border-[#004ad7]/60 dark:border-[#3b82f6]/60 bg-[#004ad7]/6 dark:bg-[#3b82f6]/10 text-[#004ad7] dark:text-[#60a5fa]'
                  : 'border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:border-black/30 dark:hover:border-white/30 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-[#15171c] dark:text-white/90'
              }`}
              title={isSelected ? `${v.colorNameAr} (اضغط لإلغاء التحديد)` : v.colorNameAr}
              aria-label={v.colorNameAr}
            >
              <span
                className={`h-4.5 w-4.5 rounded-full shrink-0 transition-transform duration-200 ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-offset-[#f0f4ff] dark:ring-offset-[#161a22] ring-[#004ad7] dark:ring-[#3b82f6] scale-110 shadow-xs'
                    : isHoveredPreview
                    ? 'ring-1 ring-offset-1 ring-[#004ad7]/50 scale-105'
                    : isLight
                    ? 'border border-black/25 dark:border-white/30 shadow-2xs'
                    : 'border border-black/10 dark:border-white/10 shadow-2xs'
                }`}
                style={{ backgroundColor: v.hex }}
              />

              <span className={`text-xs ${isSelected ? 'font-bold' : isHoveredPreview ? 'font-semibold' : 'font-medium'}`}>
                {v.colorNameAr}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductColorSelector;

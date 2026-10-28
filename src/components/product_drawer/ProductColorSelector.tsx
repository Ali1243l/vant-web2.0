import { useEffect } from 'react';
import type { Language } from '../../types';
import type { ColorVariant } from '../../lib/productVariants';

interface Props {
  variants: ColorVariant[];
  lang: Language;
  selectedColorIdx: number;
  onSelectColor: (index: number) => void;
}

export default function ProductColorSelector({ variants, lang, selectedColorIdx, onSelectColor }: Props) {
  useEffect(() => {
    for (const variant of variants) {
      if (variant.images[0]) {
        const image = new Image();
        image.src = variant.images[0];
      }
    }
  }, [variants]);
  const isAr = lang === 'ar';
  const label = (variant: ColorVariant) => isAr ? variant.colorNameAr : variant.colorNameEn;
  return (
    <div className="product-color-selector" role="group" aria-label={isAr ? 'اختيار لون القطعة' : 'Choose piece color'}>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <p className="min-w-0 truncate font-semibold">
          <span className="font-normal text-black/50 dark:text-white/50">{isAr ? 'اللون: ' : 'Color: '}</span>
          {variants[selectedColorIdx] && label(variants[selectedColorIdx])}
        </p>
        <span className="shrink-0 text-[11px] text-black/50 dark:text-white/50">{isAr ? `${variants.length} ألوان` : `${variants.length} colors`}</span>
      </div>
      <div className="product-color-options no-scrollbar">
        {variants.map((variant, index) => <button
          key={variant.id} type="button" aria-label={label(variant)} aria-pressed={index === selectedColorIdx}
          onClick={() => onSelectColor(index)}
          className="product-color-option"
        >
          <span aria-hidden="true" className="h-4 w-4 shrink-0 rounded-full border border-black/20 dark:border-white/30" style={{ backgroundColor: variant.hex }} />
          <span>{label(variant)}</span>
        </button>)}
      </div>
    </div>
  );
}

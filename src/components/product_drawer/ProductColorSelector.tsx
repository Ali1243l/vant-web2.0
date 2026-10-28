import { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Language } from '../../types';
import type { ColorVariant } from '../../lib/productVariants';

interface Props {
  variants: ColorVariant[];
  lang: Language;
  selectedColorIdx: number;
  onSelectColor: (index: number) => void;
}

export default function ProductColorSelector({ variants, lang, selectedColorIdx, onSelectColor }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: false });
  const isAr = lang === 'ar';
  const label = (variant: ColorVariant) => isAr ? variant.colorNameAr : variant.colorNameEn;
  const updateEdges = () => {
    const rail = railRef.current;
    if (!rail?.firstElementChild || !rail.lastElementChild) return;
    const bounds = rail.getBoundingClientRect();
    const first = rail.firstElementChild.getBoundingClientRect();
    const last = rail.lastElementChild.getBoundingClientRect();
    setEdges({
      previous: isAr ? first.right > bounds.right + 1 : first.left < bounds.left - 1,
      next: isAr ? last.left < bounds.left - 1 : last.right > bounds.right + 1,
    });
  };
  const scrollColors = (forward: boolean) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: (forward ? 1 : -1) * (isAr ? -1 : 1) * rail.clientWidth * .75,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(rail);
    updateEdges();
    return () => observer.disconnect();
  }, [variants, isAr]);
  useEffect(() => {
    const rail = railRef.current;
    const selected = rail?.querySelector('[aria-pressed="true"]');
    if (!rail || !selected) return;
    const bounds = rail.getBoundingClientRect();
    const button = selected.getBoundingClientRect();
    // Only move the color rail; scrollIntoView would also move the product photo vertically.
    const left = button.left < bounds.left ? button.left - bounds.left : button.right > bounds.right ? button.right - bounds.right : 0;
    if (left) rail.scrollBy({ left, behavior: 'instant' });
  }, [selectedColorIdx, variants, isAr]);
  useEffect(() => {
    for (const variant of variants) {
      if (variant.images[0]) {
        const image = new Image();
        image.src = variant.images[0];
      }
    }
  }, [variants]);
  return (
    <div className="product-color-selector" dir={isAr ? 'rtl' : 'ltr'} role="group" aria-label={isAr ? 'اختيار لون القطعة' : 'Choose piece color'}>
      <div className="product-color-heading">
        <div className="min-w-0">
          <p className="text-[11px] text-black/50 dark:text-white/50">{isAr ? 'لون القطعة' : 'Piece color'}</p>
          <p className="truncate text-sm font-semibold" aria-live="polite">{variants[selectedColorIdx] && label(variants[selectedColorIdx])}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="px-1 text-[11px] text-black/50 dark:text-white/50">{variants.length} {isAr ? (variants.length >= 3 && variants.length <= 10 ? 'ألوان' : 'لون') : (variants.length === 1 ? 'color' : 'colors')}</span>
          {(edges.previous || edges.next) && <>
            <button type="button" className="product-color-scroll" disabled={!edges.previous} onClick={() => scrollColors(false)} aria-label={isAr ? 'الألوان السابقة' : 'Previous colors'}>{isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
            <button type="button" className="product-color-scroll" disabled={!edges.next} onClick={() => scrollColors(true)} aria-label={isAr ? 'الألوان التالية' : 'Next colors'}>{isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}</button>
          </>}
        </div>
      </div>
      <div ref={railRef} onScroll={updateEdges} className="product-color-options no-scrollbar">
        {variants.map((variant, index) => <button
          key={variant.id} type="button" aria-label={label(variant)} title={label(variant)} aria-pressed={index === selectedColorIdx}
          onClick={() => onSelectColor(index)}
          className="product-color-option"
        >
          <span aria-hidden="true" className="product-color-dot" style={{ backgroundColor: variant.hex }} />
          {index === selectedColorIdx && <span className="product-color-check" aria-hidden="true"><Check size={10} strokeWidth={3} /></span>}
        </button>)}
      </div>
    </div>
  );
}

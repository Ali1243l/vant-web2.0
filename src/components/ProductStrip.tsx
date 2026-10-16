import type { ReactNode } from 'react';
import type { Language, Product } from '../types';
import { useSiteControls } from '../context/SiteControlsContext';
import { cardImageUrl } from '../lib/utils';

interface Props {
  title: string;
  products: Product[];
  lang: Language;
  onSelect: (p: Product) => void;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

/** A small horizontal row of pieces (related pieces, recently viewed) */
export default function ProductStrip({ title, products, lang, onSelect, action, className = '', compact = false }: Props) {
  const { formatPrice } = useSiteControls();
  if (products.length === 0) return null;
  return (
    <section className={`rounded-[18px] sm:rounded-[22px] border border-black/5 dark:border-white/10 bg-white dark:bg-[#14171c] p-3.5 sm:p-4 ${className}`}>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[#15171c] dark:text-white">{title}</h3>
        {action}
      </div>
      <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
        {products.map((r) => (
          <button key={r.id} type="button" onClick={() => onSelect(r)} className={`${compact ? 'w-24 sm:w-28' : 'w-28 sm:w-32'} shrink-0 text-start cursor-pointer group`}>
            <div className="aspect-[3/4] overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
              {r.image_url?.trim() && (
                <img
                  src={cardImageUrl(r.image_url.trim(), 300)}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    if (e.currentTarget.src !== r.image_url.trim()) e.currentTarget.src = r.image_url.trim();
                  }}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <p className="mt-1.5 line-clamp-1 text-xs font-semibold text-[#15171c] dark:text-white">{lang === 'ar' && r.title_ar ? r.title_ar : r.title}</p>
            <p className="font-mono text-xs font-bold text-[#004ad7] dark:text-[#3b82f6]">{formatPrice(r.price)}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

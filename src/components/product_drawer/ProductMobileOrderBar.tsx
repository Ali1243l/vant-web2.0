import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import type { Product, Language } from '../../types';
import { trackEvent } from '../../lib/analytics';
import Spinner from '../ui/Spinner';

interface ProductMobileOrderBarProps {
  whatsappControl: {
    visible: boolean;
    label_ar: string;
    label_en: string;
  };
  selectedSize: string | null;
  lang: Language;
  activePrice: number;
  formatPrice: (price: number) => string;
  whatsappUrl: string;
  product: Product | null;
  displayTitle?: string;
  buttonLabel: string;
}

export const ProductMobileOrderBar: React.FC<ProductMobileOrderBarProps> = ({
  whatsappControl,
  selectedSize,
  lang,
  activePrice,
  formatPrice,
  whatsappUrl,
  product,
  displayTitle,
  buttonLabel,
}) => {
  const [isOrdering, setIsOrdering] = useState(false);

  if (!whatsappControl.visible) return null;

  const handleClick = () => {
    setIsOrdering(true);
    if (product) {
      trackEvent('whatsapp_order', {
        productId: product.id,
        title: displayTitle,
        size: selectedSize,
        isBespoke: false,
      });
    }
    setTimeout(() => {
      setIsOrdering(false);
    }, 2200);
  };

  return (
    <div className="md:hidden shrink-0 fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-[#16191f]/90 backdrop-blur-xl border-t border-black/5 dark:border-white/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-medium text-black/50 dark:text-white/50 truncate">
            {selectedSize ? `${lang === 'ar' ? 'المقاس المحدد:' : 'Selected:'} ${selectedSize}` : (lang === 'ar' ? 'السعر الكلي' : 'Total Price')}
          </span>
          <span className="text-lg font-extrabold text-[#004ad7] dark:text-[#3b82f6] tabular-nums tracking-tight">
            {formatPrice(activePrice)}
          </span>
        </div>

        <a
          href={isOrdering ? '#' : whatsappUrl}
          target={isOrdering ? '_self' : '_blank'}
          rel="noopener noreferrer"
          onClick={handleClick}
          aria-disabled={isOrdering}
          className={`flex-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#004ad7] hover:bg-[#003db3] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] text-white text-sm font-bold tracking-wide transition-all shadow-md shadow-[#004ad7]/25 dark:shadow-[#3b82f6]/30 ${
            isOrdering ? 'pointer-events-none opacity-90 cursor-wait' : 'active:scale-[0.98] cursor-pointer'
          }`}
        >
          {isOrdering ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner size="xs" color="#ffffff" />
              <span className="font-bold text-white text-xs truncate">
                {lang === 'ar' ? 'جاري التوجيه...' : 'Connecting...'}
              </span>
            </div>
          ) : (
            <>
              <MessageCircle className="h-4.5 w-4.5 fill-white/20 stroke-white stroke-[2]" />
              <span className="truncate">
                {selectedSize
                  ? `${lang === 'ar' ? whatsappControl.label_ar : whatsappControl.label_en} (${selectedSize})`
                  : buttonLabel || (lang === 'ar' ? whatsappControl.label_ar : whatsappControl.label_en)}
              </span>
            </>
          )}
        </a>
      </div>
    </div>
  );
};

export default ProductMobileOrderBar;

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import type { Product, Language } from '../../types';
import { trackEvent } from '../../lib/analytics';
import Spinner from '../ui/Spinner';

interface ProductOrderButtonProps {
  whatsappControl: {
    visible: boolean;
    label_ar: string;
    label_en: string;
  };
  whatsappUrl: string;
  product: Product | null;
  displayTitle?: string;
  selectedSize: string | null;
  buttonLabel: string;
  lang: Language;
}

export const ProductOrderButton: React.FC<ProductOrderButtonProps> = ({
  whatsappControl,
  whatsappUrl,
  product,
  displayTitle,
  selectedSize,
  buttonLabel,
  lang,
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
    <div className="pt-1 sm:pt-2 hidden md:block">
      <a
        href={isOrdering ? '#' : whatsappUrl}
        target={isOrdering ? '_self' : '_blank'}
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-disabled={isOrdering}
        className={`group relative flex h-12 md:h-13.5 lg:h-14 w-full items-center justify-center gap-2.5 md:gap-3 rounded-2xl bg-[#004ad7] hover:bg-[#003db3] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] text-white text-sm md:text-base font-bold tracking-wide transition-all shadow-md md:shadow-lg shadow-[#004ad7]/25 dark:shadow-[#3b82f6]/30 ${
          isOrdering ? 'pointer-events-none opacity-90 cursor-wait' : 'active:scale-[0.98] cursor-pointer'
        }`}
      >
        {isOrdering ? (
          <div className="flex items-center justify-center gap-2.5">
            <Spinner size="sm" color="#ffffff" />
            <span className="font-bold text-white text-sm md:text-base tracking-wide">
              {lang === 'ar' ? 'جاري توجيهك إلى واتساب...' : 'Connecting to WhatsApp...'}
            </span>
          </div>
        ) : (
          <>
            <MessageCircle className="h-4.5 w-4.5 md:h-5 md:w-5 fill-white/20 stroke-white stroke-[2]" />
            <span>
              {selectedSize
                ? `${lang === 'ar' ? whatsappControl.label_ar : whatsappControl.label_en} (${selectedSize})`
                : buttonLabel || (lang === 'ar' ? whatsappControl.label_ar : whatsappControl.label_en)}
            </span>
          </>
        )}
      </a>
    </div>
  );
};

export default ProductOrderButton;

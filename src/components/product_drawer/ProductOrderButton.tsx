import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { Product, Language } from '../../types';
import { trackEvent } from '../../lib/analytics';

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
  if (!whatsappControl.visible) return null;

  return (
    <div className="pt-1 sm:pt-2 hidden md:block">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (product) {
            trackEvent('whatsapp_order', {
              productId: product.id,
              title: displayTitle,
              size: selectedSize,
              isBespoke: false,
            });
          }
        }}
        className="group relative flex h-12 md:h-13.5 lg:h-14 w-full items-center justify-center gap-2.5 md:gap-3 rounded-2xl bg-[#004ad7] hover:bg-[#003db3] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] text-white text-sm md:text-base font-bold tracking-wide transition-all active:scale-[0.98] shadow-md md:shadow-lg shadow-[#004ad7]/25 dark:shadow-[#3b82f6]/30 cursor-pointer"
      >
        <MessageCircle className="h-4.5 w-4.5 md:h-5 md:w-5 fill-white/20 stroke-white stroke-[2]" />
        <span>
          {selectedSize
            ? `${lang === 'ar' ? whatsappControl.label_ar : whatsappControl.label_en} (${selectedSize})`
            : buttonLabel || (lang === 'ar' ? whatsappControl.label_ar : whatsappControl.label_en)}
        </span>
      </a>
    </div>
  );
};

export default ProductOrderButton;

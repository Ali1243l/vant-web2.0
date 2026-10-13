import React, { useState } from 'react';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import type { Product, Language } from '../../types';
import { trackEvent } from '../../lib/analytics';
import Spinner from '../ui/Spinner';
import CartInteractionWrapper from './CartInteractionWrapper';

interface ProductMobileOrderBarProps {
  whatsappControl: {
    visible: boolean;
    enabled?: boolean;
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
}) => {
  const [isOrdering, setIsOrdering] = useState(false);

  const isAr = lang === 'ar';

  const handleInquiryClick = () => {
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

  const handleAddToCartTrack = () => {
    if (product) {
      trackEvent('whatsapp_order', {
        productId: product.id,
        title: displayTitle,
        size: selectedSize,
        action: 'add_to_cart',
      });
    }
  };

  return (
    <div className="md:hidden shrink-0 fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#16191f]/95 backdrop-blur-xl border-t border-black/5 dark:border-white/10 px-3.5 py-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between gap-2.5 max-w-lg mx-auto">
        {/* Price display */}
        <div className="flex flex-col min-w-0 shrink-0">
          <span className="text-[10px] font-medium text-black/50 dark:text-white/50 truncate">
            {selectedSize ? `${isAr ? 'المقاس:' : 'Size:'} ${selectedSize}` : (isAr ? 'السعر الكلي' : 'Total Price')}
          </span>
          <span className="text-base font-extrabold text-[#004ad7] dark:text-[#3b82f6] tabular-nums tracking-tight">
            {formatPrice(activePrice)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          {/* 1. Add to Cart Button (with fly animation & counter) */}
          <div className="flex-1 min-w-[120px]">
            <CartInteractionWrapper
              productTitle={displayTitle || product?.title}
              productImage={product?.image_url}
              lang={lang}
              onAddToCart={handleAddToCartTrack}
            >
              <button
                type="button"
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#004ad7] hover:bg-[#003db3] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-[#004ad7]/20 active:scale-[0.98] cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4 fill-white/20 stroke-white stroke-[2]" />
                <span className="truncate">{isAr ? 'أضف للسلة' : 'Add to Cart'}</span>
              </button>
            </CartInteractionWrapper>
          </div>

          {/* 2. WhatsApp Inquiry Button */}
          {whatsappControl.visible && whatsappControl.enabled !== false && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleInquiryClick}
              title={isAr ? 'استفسار عبر واتساب' : 'Inquire via WhatsApp'}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border border-[#004ad7]/25 dark:border-[#3b82f6]/35 bg-[#004ad7]/8 hover:bg-[#004ad7]/15 dark:bg-[#3b82f6]/12 dark:hover:bg-[#3b82f6]/22 text-[#004ad7] dark:text-[#60a5fa] shadow-sm shrink-0 transition-all ${
                isOrdering ? 'opacity-90 cursor-wait' : 'active:scale-95 cursor-pointer'
              }`}
            >
              {isOrdering ? (
                <Spinner size="xs" color="#004ad7" />
              ) : (
                <MessageCircle className="h-5 w-5 fill-[#004ad7]/15 dark:fill-[#3b82f6]/20 stroke-[#004ad7] dark:stroke-[#60a5fa] stroke-[2]" />
              )}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductMobileOrderBar;

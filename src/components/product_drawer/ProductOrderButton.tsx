import React, { useState } from 'react';
import { MessageCircle, ShoppingCart, BellRing, Check } from 'lucide-react';
import type { Product, Language, ProductAvailability } from '../../types';
import { trackEvent } from '../../lib/analytics';
import Spinner from '../ui/Spinner';
import CartInteractionWrapper from './CartInteractionWrapper';

interface ProductOrderButtonProps {
  whatsappControl: {
    visible: boolean;
    enabled?: boolean;
    label_ar: string;
    label_en: string;
  };
  whatsappUrl: string;
  product: Product | null;
  displayTitle?: string;
  selectedSize: string | null;
  buttonLabel: string;
  lang: Language;
  price: number;
  colorLabel?: string;
  image?: string;
  canAddToCart: () => boolean;
  availability?: ProductAvailability;
}

const RESTOCK_KEY = 'vant_restock_requests';
const readRestockRequests = (): string[] => {
  try {
    const list = JSON.parse(localStorage.getItem(RESTOCK_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const ProductOrderButton: React.FC<ProductOrderButtonProps> = ({
  whatsappControl,
  whatsappUrl,
  product,
  displayTitle,
  selectedSize,
  lang,
  price,
  colorLabel,
  image,
  canAddToCart,
  availability,
}) => {
  const [isOrdering, setIsOrdering] = useState(false);
  const restockKey = `${product?.id ?? ''}|${selectedSize ?? ''}`;
  const [restockRequests, setRestockRequests] = useState(readRestockRequests);

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

  const inquiryText = selectedSize
    ? `${isAr ? 'استفسار عن المقاس' : 'Inquire Size'} (${selectedSize})`
    : isAr ? 'استفسار عبر واتساب' : 'Inquire via WhatsApp';

  const cartButtonText = selectedSize
    ? `${isAr ? 'أضف للسلة' : 'Add to Cart'} (${selectedSize})`
    : isAr ? 'أضف للسلة' : 'Add to Cart';

  // Sold-out and upcoming pieces can't go in the cart; the main button asks the shop to tell the customer instead
  if (availability === 'sold_out' || availability === 'coming_soon') {
    const isSoldOut = availability === 'sold_out';
    const requested = restockRequests.includes(restockKey);
    const label = requested
      ? isAr ? 'سجلنا طلبك، راح نبلغك' : "You're on the list"
      : isSoldOut
      ? isAr ? `بلغني من يتوفر${selectedSize ? ` (${selectedSize})` : ''}` : `Notify me when back${selectedSize ? ` (${selectedSize})` : ''}`
      : isAr ? `احجز قبل النزول${selectedSize ? ` (${selectedSize})` : ''}` : `Reserve before launch${selectedSize ? ` (${selectedSize})` : ''}`;
    return (
      <div className="pt-1 w-full">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            handleInquiryClick();
            const next = [...new Set([...restockRequests, restockKey])];
            setRestockRequests(next);
            try {
              localStorage.setItem(RESTOCK_KEY, JSON.stringify(next));
            } catch {}
          }}
          className={`flex h-11.5 sm:h-12 md:h-13 w-full items-center justify-center gap-2 rounded-xl md:rounded-2xl text-xs sm:text-sm md:text-base font-bold tracking-wide transition-all active:scale-[0.98] cursor-pointer ${
            requested
              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'bg-[#15171c] dark:bg-white text-white dark:text-[#15171c] shadow-md'
          }`}
        >
          {requested ? <Check className="h-4.5 w-4.5 shrink-0" /> : <BellRing className="h-4.5 w-4.5 shrink-0" />}
          <span className="truncate">{label}</span>
        </a>
        {!requested && (
          <p className="mt-2 text-center text-[11px] text-[#6b7280] dark:text-[#9ca3af]">
            {isAr ? 'نرسل طلبك على واتساب ونبلغك أول ما ترجع القطعة.' : 'We send your request on WhatsApp and message you as soon as it is back.'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="pt-1 flex flex-row md:flex-col items-center gap-2 md:gap-2.5 w-full">
      {/* 1. Primary Action: Add to Cart with Fly Animation & Counter */}
      <div className="flex-1 w-full min-w-0">
        <CartInteractionWrapper
          productId={product?.id}
          productTitle={displayTitle || product?.title}
          productImage={image || product?.image_url}
          price={price}
          size={selectedSize}
          color={colorLabel}
          canAdd={canAddToCart}
          lang={lang}
          onAddToCart={handleAddToCartTrack}
        >
          <button
            type="button"
            className="group relative flex h-11.5 sm:h-12 md:h-13 w-full items-center justify-center gap-2 rounded-xl md:rounded-2xl bg-[#004ad7] hover:bg-[#003db3] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] text-white text-xs sm:text-sm md:text-base font-bold tracking-wide transition-all shadow-md shadow-[#004ad7]/25 dark:shadow-[#3b82f6]/30 active:scale-[0.98] cursor-pointer"
          >
            <ShoppingCart className="h-4.5 w-4.5 fill-white/20 stroke-white stroke-[2] shrink-0" />
            <span className="truncate">{cartButtonText}</span>
          </button>
        </CartInteractionWrapper>
      </div>

      {/* 2. Secondary Action: WhatsApp Inquiry */}
      {whatsappControl.visible && whatsappControl.enabled !== false && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleInquiryClick}
          title={inquiryText}
          aria-label={inquiryText}
          className={`group relative flex h-11.5 sm:h-12 md:h-12 items-center justify-center gap-2 rounded-xl md:rounded-2xl border border-[#004ad7]/25 dark:border-[#3b82f6]/35 bg-[#004ad7]/8 hover:bg-[#004ad7]/15 dark:bg-[#3b82f6]/10 dark:hover:bg-[#3b82f6]/20 text-[#004ad7] dark:text-[#60a5fa] text-xs sm:text-sm md:text-base font-bold transition-all shadow-xs shrink-0 px-3.5 sm:px-4 md:px-0 md:w-full ${
            isOrdering ? 'opacity-90 cursor-wait' : 'active:scale-[0.98] cursor-pointer'
          }`}
        >
          {isOrdering ? (
            <div className="flex items-center justify-center gap-1.5">
              <Spinner size="xs" color="#004ad7" />
              <span className="font-bold text-[#004ad7] dark:text-[#60a5fa] text-xs hidden sm:inline">
                {isAr ? 'جاري التوجيه...' : 'Connecting...'}
              </span>
            </div>
          ) : (
            <>
              <MessageCircle className="h-4.5 w-4.5 fill-[#004ad7]/15 dark:fill-[#3b82f6]/20 stroke-[#004ad7] dark:stroke-[#60a5fa] stroke-[2] shrink-0" />
              <span className="hidden sm:inline md:inline">{inquiryText}</span>
              <span className="sm:hidden md:hidden text-xs">{isAr ? 'استفسار' : 'Inquire'}</span>
            </>
          )}
        </a>
      )}
    </div>
  );
};

export default ProductOrderButton;

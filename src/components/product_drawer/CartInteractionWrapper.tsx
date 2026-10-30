import { controlActive } from '../../lib/siteControlModel';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { useSiteControls } from '../../context/SiteControlsContext';
import type { Language } from '../../types';
import { cartItemId, changeCartQuantity, readCart, writeCart } from '../../lib/cart';

interface FlyingThumbnail {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  imgUrl: string;
}

interface CartInteractionWrapperProps {
  children?: React.ReactNode;
  productTitle?: string;
  productImage?: string;
  productId?: string | number;
  productPrice?: number;
  size?: string;
  color?: string;
  disabled?: boolean;
  lang?: Language;
  onAddToCart?: () => void;
  onQuantityChange?: (qty: number) => void;
  initialQuantity?: number;
  /** Force enable or override context site control */
  overrideEnableAnimation?: boolean;
  /** Optional custom CSS selector for cart target element */
  cartTargetSelector?: string;
  className?: string;
}

export const CartInteractionWrapper: React.FC<CartInteractionWrapperProps> = ({
  children,
  productTitle = '',
  productImage = '',
  productId,
  productPrice = 0,
  size,
  color,
  disabled = false,
  lang = 'ar',
  onAddToCart,
  onQuantityChange,
  initialQuantity = 0,
  overrideEnableAnimation,
  cartTargetSelector,
  className = '',
}) => {
  const { getControl } = useSiteControls();
  const addToCartBtnControl = getControl('btn_product_add_to_cart');
  const isButtonVisible =
    !addToCartBtnControl ||
    addToCartBtnControl.visible !== false;

  const cartAnimControl = getControl('enableCartAnimation');
  const isAnimationEnabled =
    overrideEnableAnimation !== undefined
      ? overrideEnableAnimation
      : cartAnimControl
      ? cartAnimControl.enabled !== false && cartAnimControl.visible !== false
      : true;

  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [flyingItems, setFlyingItems] = useState<FlyingThumbnail[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemId = cartItemId(productId ?? productTitle, size, color);

  useEffect(() => {
    const sync = () => setQuantity(readCart().find((item) => item.id === itemId)?.quantity ?? 0);
    sync();
    window.addEventListener('vant-cart-update', sync);
    return () => window.removeEventListener('vant-cart-update', sync);
  }, [itemId]);

  const triggerFlyAnimation = useCallback(
    (e?: React.MouseEvent) => {
      if (!isAnimationEnabled) return;

      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 2;

      if (e && e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        startX = rect.left + rect.width / 2 - 20;
        startY = rect.top + rect.height / 2 - 20;
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        startX = rect.left + rect.width / 2 - 20;
        startY = rect.top + rect.height / 2 - 20;
      }

      // Find cart target element (header wishlist/cart icon or floating icon)
      let targetEl: Element | null = null;
      if (cartTargetSelector) {
        targetEl = document.querySelector(cartTargetSelector);
      }
      if (!targetEl) {
        targetEl =
          document.querySelector('#header-cart-icon') ||
          document.querySelector('#floating-cart-icon') ||
          document.querySelector('header button[aria-label*="سلة"]') ||
          document.querySelector('header button[aria-label*="Cart"]');
      }

      let endX = window.innerWidth - 60;
      let endY = 30;

      if (targetEl) {
        const targetRect = targetEl.getBoundingClientRect();
        endX = targetRect.left + targetRect.width / 2 - 12;
        endY = targetRect.top + targetRect.height / 2 - 12;
      }

      const itemId = `fly-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const fallbackImage =
        productImage ||
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200&auto=format&fit=crop';

      setFlyingItems((prev) => [
        ...prev,
        {
          id: itemId,
          startX,
          startY,
          endX,
          endY,
          imgUrl: fallbackImage,
        },
      ]);
    },
    [isAnimationEnabled, productImage, cartTargetSelector]
  );

  const [cartError, setCartError] = useState('');
  const updateGlobalCartCount = (delta: number) => {
    try {
      const currentItems = readCart();
      const itemTitle = productTitle || 'قطعة مميزة من التشكيلة';
      const itemImage = productImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200&auto=format&fit=crop';

      const items = changeCartQuantity(currentItems, {
        id: itemId, title: itemTitle, image: itemImage,
        price: productPrice, quantity: 0, size, color,
      }, delta);

      const nextCount = writeCart(items);
      window.dispatchEvent(new CustomEvent('vant-cart-update', { detail: { count: nextCount, items } }));
      setCartError('');
      return true;
    } catch { setCartError(lang === 'ar' ? 'تعذّر حفظ السلة. حاول مجدداً.' : 'Could not save cart. Please retry.'); return false; }
  };

  const removeFlyingItem = useCallback((id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    // Dispatch bounce event to trigger header cart icon pulse
    window.dispatchEvent(new CustomEvent('vant-cart-bounce'));
  }, []);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled || !controlActive(addToCartBtnControl)) return;
    if (quantity >= 99) return;
    const nextQty = quantity + 1;
    if (!updateGlobalCartCount(1)) return;
    setQuantity(nextQty);
    if (quantity === 0) {
      if (onAddToCart) onAddToCart();
    }
    if (onQuantityChange) onQuantityChange(nextQty);
    triggerFlyAnimation(e);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled || !controlActive(addToCartBtnControl) || quantity <= 0) return;
    const nextQty = quantity - 1;
    if (!updateGlobalCartCount(-1)) return;
    setQuantity(nextQty);
    if (onQuantityChange) onQuantityChange(nextQty);
  };

  if (!isButtonVisible) return null;

  const isAr = lang === 'ar';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {cartError && <p role="alert" className="text-xs text-red-500 mb-2">{cartError}</p>}
      {/* 60fps Flying Image Drop Animation Overlay */}
      <AnimatePresence>
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{
              x: item.startX,
              y: item.startY,
              scale: 1,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              x: [item.startX, item.startX + (item.endX - item.startX) * 0.5, item.endX],
              y: [item.startY, Math.min(item.startY, item.endY) - 75, item.endY],
              scale: [1, 1.15, 0.2],
              rotate: [0, -10, 10, 0],
              opacity: [1, 0.9, 0],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={() => removeFlyingItem(item.id)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 99999,
              pointerEvents: 'none',
            }}
            className="w-13 h-13 rounded-2xl overflow-hidden shadow-2xl border-2 border-white dark:border-slate-800 bg-white shadow-[#004ad7]/30 ring-4 ring-[#004ad7]/20"
          >
            <img
              src={item.imgUrl}
              alt={productTitle || 'Product'}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Switcher: Add-to-Cart vs Blinkit-Style Counter */}
      <AnimatePresence mode="wait" initial={false}>
        {quantity === 0 ? (
          <motion.div
            key="add-button"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: isAnimationEnabled ? 0.18 : 0 }}
            onClick={handleIncrement}
            className="w-full"
          >
            {children ? (
              <fieldset disabled={disabled || !controlActive(addToCartBtnControl)} className="min-w-0">{children}</fieldset>
            ) : (
              <button
                disabled={disabled || !controlActive(addToCartBtnControl)}
                type="button"
                className="w-full h-12 md:h-13.5 lg:h-14 flex items-center justify-center gap-2.5 rounded-2xl bg-[#004ad7] hover:bg-[#003db3] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] text-white font-bold text-sm md:text-base shadow-md shadow-[#004ad7]/25 transition-all active:scale-[0.98] cursor-pointer"
              >
                <ShoppingCart className="w-4.5 h-4.5 fill-white/20 stroke-white stroke-[2]" />
                <span>{isAr ? addToCartBtnControl.label_ar : addToCartBtnControl.label_en}</span>
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="blinkit-counter"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: isAnimationEnabled ? 0.18 : 0 }}
            className="w-full h-12 md:h-13.5 lg:h-14 flex items-center justify-between p-1.5 rounded-2xl bg-[#004ad7] dark:bg-[#3b82f6] text-white shadow-lg shadow-[#004ad7]/30 border border-white/20 select-none"
          >
            {/* Decrement Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              disabled={disabled || !controlActive(addToCartBtnControl)} onClick={handleDecrement}
              aria-label={isAr ? 'تقليل الكمية' : 'Decrease quantity'}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
            >
              {quantity === 1 ? (
                <Trash2 className="w-4 h-4 text-white/90 stroke-[2.2]" />
              ) : (
                <Minus className="w-4 h-4 text-white stroke-[2.5]" />
              )}
            </motion.button>

            {/* Counter Label & Quantity Number */}
            <div className="flex flex-col items-center justify-center px-3 min-w-[80px]">
              <span className="text-[10px] font-medium text-white/75 leading-none">
                {isAr ? 'بالسلة' : 'In Cart'}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={quantity}
                  initial={{ y: -6, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 6, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.12 }}
                  className="font-mono font-black text-base md:text-lg leading-tight tabular-nums text-white"
                >
                  {quantity}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Increment Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              disabled={disabled || !controlActive(addToCartBtnControl)} onClick={handleIncrement}
              aria-label={isAr ? 'زيادة الكمية' : 'Increase quantity'}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/35 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartInteractionWrapper;

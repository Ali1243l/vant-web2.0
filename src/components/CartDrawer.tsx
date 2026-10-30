import CartCheckout from './CartCheckout';
import { controlActive } from '../lib/siteControlModel';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Language } from '../types';
import { DEFAULT_WHATSAPP_PHONE } from '../lib/constants';
import { useSiteControls } from '../context/SiteControlsContext';
import { useScrollLock } from '../hooks/useScrollLock';
import { useModalFocus } from '../hooks/useModalFocus';
import { readCart, writeCart, resolveWhatsAppPhone } from '../lib/cart';

export interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, lang }) => {
  const { getControl, formatPrice } = useSiteControls();
  const whatsappPhoneControl = getControl('cfg_whatsapp_phone');
  const checkoutControl = getControl('btn_cart_whatsapp');
  const whatsappPhone = resolveWhatsAppPhone(whatsappPhoneControl?.actionValue, DEFAULT_WHATSAPP_PHONE);

  const [cartError, setCartError] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      return readCart();
    } catch {
      return [];
    }
  });

  const syncCartState = () => {
    try {
      setCartItems(readCart());
    } catch {}
  };

  useEffect(() => {
    syncCartState();
    const handleUpdate = () => syncCartState();
    window.addEventListener('vant-cart-update', handleUpdate);
    return () => window.removeEventListener('vant-cart-update', handleUpdate);
  }, []);

  useScrollLock(isOpen);

  const panelRef = useRef<HTMLDivElement>(null);
  useModalFocus(isOpen, panelRef, onClose);

  const isAr = lang === 'ar';

  const updateQuantity = (id: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    saveAndNotify(updated);
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    saveAndNotify(updated);
  };

  const clearCart = () => {
    saveAndNotify([]);
  };

  const saveAndNotify = (items: CartItem[]) => {
    try {
      const totalCount = writeCart(items);
      setCartItems(items);
      setCartError('');
      window.dispatchEvent(new CustomEvent('vant-cart-update', { detail: { count: totalCount, items } }));
    } catch { setCartError(isAr ? 'تعذّر حفظ التغيير. السلة السابقة باقية؛ حاول مجدداً.' : 'Could not save this change. Your previous cart is unchanged; retry.'); }
  };
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-md touch-none"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={isAr ? 'سلة التسوق' : 'Shopping Cart'}
            tabIndex={-1}
            data-store-panel
            initial={{ x: isAr ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isAr ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`fixed top-0 bottom-0 ${isAr ? 'left-0' : 'right-0'} z-[9991] flex w-full max-w-md flex-col bg-white dark:bg-[#12151e] text-[#15171c] dark:text-white shadow-2xl border-l border-r border-black/10 dark:border-white/10`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-black/8 dark:border-white/10 px-5 py-4.5 bg-zinc-50/70 dark:bg-[#161922]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#004ad7]/10 dark:bg-[#3b82f6]/20 text-[#004ad7] dark:text-[#3b82f6]">
                  <ShoppingCart className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-wide">
                    {isAr ? 'سلة التسوق' : 'Shopping Cart'}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {isAr ? `${totalCount} قطعة في السلة` : `${totalCount} items in cart`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Item List */}
            <div data-scroll-lock-scrollable className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
              {cartError && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{cartError}</p>}
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 mb-4">
                    <ShoppingCart className="h-8 w-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                    {isAr ? 'سلة التسوق فارغة حالياً' : 'Your cart is empty'}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                    {isAr
                      ? 'اختر قطعك المفضلة من التشكيلة وأضفها للسلة لمراجعتها وإكمال الطلب.'
                      : 'Explore our curated lookbook and add pieces to your cart to review and checkout.'}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#004ad7] dark:bg-[#3b82f6] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
                  >
                    <span>{isAr ? 'استكشف التشكيلة' : 'Explore Collection'}</span>
                    {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const itemPrice = item.price;
                  const itemSubtotal = itemPrice * item.quantity;
                  const formattedSubtotal = formatPrice ? formatPrice(itemSubtotal) : `${itemSubtotal.toLocaleString()} د.ع`;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-black/8 dark:border-white/10 bg-zinc-50/60 dark:bg-[#181b26] transition-all hover:border-[#004ad7]/30"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-16 w-14 rounded-xl object-cover border border-black/10 dark:border-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.title}
                        </h4>
                        {(item.size || item.color) && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {item.size && `${isAr ? 'المقاس' : 'Size'}: ${item.size}`}
                            {item.size && item.color && ' • '}
                            {item.color && `${isAr ? 'اللون' : 'Color'}: ${item.color}`}
                          </p>
                        )}
                        <p className="text-xs font-extrabold text-[#004ad7] dark:text-[#60a5fa] mt-1">
                          {formattedSubtotal}
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="min-h-11 min-w-11 inline-flex items-center justify-center text-zinc-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                          title={isAr ? 'حذف من السلة' : 'Remove item'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <div className="flex items-center rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#12151e] p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            aria-label={isAr ? 'تقليل الكمية' : 'Decrease quantity'}
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={item.quantity >= 99}
                            onClick={() => updateQuantity(item.id, 1)}
                            aria-label={isAr ? 'زيادة الكمية' : 'Increase quantity'}
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {cartItems.length > 0 && <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/10">{checkoutControl.visible && <CartCheckout items={cartItems} lang={lang} phone={whatsappPhone} enabled={controlActive(checkoutControl)} label={isAr ? checkoutControl.label_ar : checkoutControl.label_en} format={formatPrice} />}<button type="button" onClick={clearCart} className="min-h-11 px-3 text-xs text-zinc-500 underline">{isAr ? 'تفريغ السلة' : 'Clear cart'}</button></div>}
            </div>

            {cartItems.length > 0 && <div className="shrink-0 border-t border-black/8 dark:border-white/10 px-5 py-3 bg-zinc-50/80 dark:bg-[#161922]" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}><p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{isAr ? 'راجع الكود والمبلغ أدناه قبل فتح واتساب.' : 'Review the code and amount below before opening WhatsApp.'}</p></div>}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

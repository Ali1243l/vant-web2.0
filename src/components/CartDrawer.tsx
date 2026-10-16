import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ShoppingBag, X, Plus, Minus, Trash2, MessageCircle, ArrowRight, ArrowLeft, History, RotateCcw, CheckCircle2 } from 'lucide-react';
import type { Language } from '../types';
import { resolveWhatsappPhone } from '../lib/constants';
import { useSiteControls } from '../context/SiteControlsContext';
import { submitStoreOrder } from '../lib/storage';
import { readCart, writeCart, cartTotal, readOrders, saveOrder, reorder, type CartItem, type PastOrder } from '../lib/cart';

const IRAQ_CITIES: [string, string][] = [
  ['بغداد', 'Baghdad'], ['البصرة', 'Basra'], ['نينوى', 'Nineveh'], ['أربيل', 'Erbil'], ['النجف', 'Najaf'],
  ['كربلاء', 'Karbala'], ['السليمانية', 'Sulaymaniyah'], ['كركوك', 'Kirkuk'], ['دهوك', 'Duhok'], ['الأنبار', 'Anbar'],
  ['بابل', 'Babil'], ['ديالى', 'Diyala'], ['ذي قار', 'Dhi Qar'], ['صلاح الدين', 'Saladin'], ['واسط', 'Wasit'],
  ['ميسان', 'Maysan'], ['المثنى', 'Muthanna'], ['القادسية', 'Qadisiyah'],
];

interface CustomerDetails {
  name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
}

const DETAILS_KEY = 'vant_customer_details';
const readDetails = (): CustomerDetails => {
  const empty = { name: '', phone: '', city: '', address: '', notes: '' };
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(DETAILS_KEY) || '{}') };
  } catch {
    return empty;
  }
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, lang }) => {
  const { getControl, formatPrice } = useSiteControls();
  const whatsappPhoneControl = getControl('cfg_whatsapp_phone');
  const whatsappPhone = resolveWhatsappPhone(whatsappPhoneControl?.actionValue);

  const [cartItems, setCartItems] = useState<CartItem[]>(readCart);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState<'cart' | 'details'>('cart');
  const [details, setDetails] = useState<CustomerDetails>(readDetails);
  const [view, setView] = useState<'cart' | 'orders'>('cart');
  const [orders, setOrders] = useState<PastOrder[]>(readOrders);
  const [justOrdered, setJustOrdered] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setView('cart');
      setJustOrdered(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || cartItems.length === 0) setStep('cart');
  }, [isOpen, cartItems.length]);

  useEffect(() => {
    // Rewrite once so the stored count matches after invalid legacy lines are dropped
    writeCart(readCart());
    const handleUpdate = () => setCartItems(readCart());
    window.addEventListener('vant-cart-update', handleUpdate);
    return () => window.removeEventListener('vant-cart-update', handleUpdate);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => opener?.focus?.();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

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

    setCartItems(updated);
    saveAndNotify(updated);
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    saveAndNotify(updated);
  };

  const clearCart = () => {
    setCartItems([]);
    saveAndNotify([]);
  };

  const saveAndNotify = writeCart;

  const totalPrice = cartTotal(cartItems);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const generateWhatsAppUrl = (orderId: string) => {
    if (cartItems.length === 0) return '#';
    const cleanPhone = whatsappPhone.replace(/\D/g, '');
    let text = isAr
      ? `مرحباً، أود طلب المشتريات التالية من التشكيلة (رقم الطلب ${orderId}):\n\n`
      : `Hello, I would like to order the following items from the collection (order ${orderId}):\n\n`;

    cartItems.forEach((item, idx) => {
      const subtotal = item.price * item.quantity;
      const priceStr = formatPrice ? formatPrice(subtotal) : `${subtotal.toLocaleString()} د.ع`;
      text += `${idx + 1}. *${item.title}*\n`;
      if (item.size) text += `   - ${isAr ? 'المقاس' : 'Size'}: ${item.size}\n`;
      if (item.color) text += `   - ${isAr ? 'اللون' : 'Color'}: ${item.color}\n`;
      text += `   - ${isAr ? 'الكمية' : 'Quantity'}: ${item.quantity}\n`;
      text += `   - ${isAr ? 'السعر' : 'Subtotal'}: ${priceStr}\n\n`;
    });

    const totalStr = formatPrice ? formatPrice(totalPrice) : `${totalPrice.toLocaleString()} د.ع`;
    text += isAr ? `*المجموع الكلي: ${totalStr}*\n` : `*Total Amount: ${totalStr}*\n`;
    text += isAr ? `\n*معلومات التوصيل*\n` : `\n*Delivery details*\n`;
    text += `${isAr ? 'الاسم' : 'Name'}: ${details.name.trim()}\n`;
    text += `${isAr ? 'الهاتف' : 'Phone'}: ${details.phone.trim()}\n`;
    text += `${isAr ? 'المحافظة' : 'City'}: ${details.city}\n`;
    text += `${isAr ? 'العنوان' : 'Address'}: ${details.address.trim()}\n`;
    if (details.notes.trim()) text += `${isAr ? 'ملاحظات' : 'Notes'}: ${details.notes.trim()}\n`;
    // Coupons arrive by email link (?coupon=); orders go by WhatsApp, so the shop applies the code by hand
    let coupon = '';
    try {
      coupon = localStorage.getItem('vant_applied_coupon') || '';
    } catch {}
    if (coupon) text += `${isAr ? 'كود الخصم' : 'Coupon code'}: ${coupon}\n`;
    text += isAr ? `الدفع عند الاستلام.` : `Cash on delivery.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

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
            className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-md"
          />

          {/* Drawer Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
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
                  <h2 id="cart-drawer-title" className="text-base font-bold tracking-wide">
                    {isAr ? 'سلة التسوق' : 'Shopping Cart'}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {isAr ? `${totalCount} قطعة في السلة` : `${totalCount} items in cart`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setOrders(readOrders());
                  setJustOrdered(false);
                  setView((v) => (v === 'orders' ? 'cart' : 'orders'));
                }}
                aria-pressed={view === 'orders'}
                className={`flex h-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all cursor-pointer ${
                  view === 'orders'
                    ? 'bg-[#004ad7] text-white'
                    : 'bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/20'
                }`}
              >
                <History className="h-4 w-4" />
                <span>{isAr ? 'طلباتي' : 'My orders'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                ref={closeButtonRef}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer"
                aria-label={isAr ? 'إغلاق السلة' : 'Close cart'}
              >
                <X className="h-5 w-5" />
              </button>
              </div>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {view === 'orders' ? (
                <div className="space-y-3">
                  {justOrdered && (
                    <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span>
                        {isAr
                          ? 'انفتح واتساب برسالة طلبك. إذا ما وصلت الرسالة، اضغط "إعادة الطلب" حتى ترجع القطع للسلة.'
                          : 'WhatsApp opened with your order. If it did not send, tap "Order again" to put the items back.'}
                      </span>
                    </div>
                  )}
                  {orders.length === 0 ? (
                    <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      {isAr ? 'ما عندك طلبات سابقة على هذا الجهاز.' : 'No past orders on this device yet.'}
                    </p>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="rounded-2xl border border-black/8 dark:border-white/10 bg-zinc-50/60 dark:bg-[#181b26] p-3.5">
                        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{order.id}</span>
                          <span>{new Date(order.date).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <ul className="mt-2 space-y-1 text-sm">
                          {order.items.map((item) => (
                            <li key={item.key} className="flex justify-between gap-2">
                              <span className="truncate">
                                {item.title}
                                {item.size && <span className="text-zinc-500"> · {item.size}</span>}
                              </span>
                              <span className="shrink-0 font-mono text-zinc-500">×{item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-mono text-sm font-extrabold text-[#004ad7] dark:text-[#60a5fa]">{formatPrice(order.total)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              reorder(order);
                              setJustOrdered(false);
                              setView('cart');
                            }}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#004ad7] dark:bg-[#3b82f6] px-4 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>{isAr ? 'إعادة الطلب' : 'Order again'}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : step === 'details' && cartItems.length > 0 ? (
                <form
                  id="checkout-details-form"
                  className="space-y-3.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!whatsappPhone) return; // no store number configured: keep the cart instead of sending it nowhere
                    try {
                      localStorage.setItem(DETAILS_KEY, JSON.stringify(details));
                    } catch {}
                    // The cart moves to "My orders", where one tap puts it back if the chat never went out
                    const order = saveOrder(cartItems);
                    window.open(generateWhatsAppUrl(order.id), '_blank', 'noopener,noreferrer');
                    submitStoreOrder(order, details);
                    writeCart([]);
                    setOrders(readOrders());
                    setJustOrdered(true);
                    setView('orders');
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="inline-flex items-center gap-1.5 min-h-10 text-xs font-semibold text-zinc-500 hover:text-[#004ad7] dark:hover:text-[#60a5fa] cursor-pointer"
                  >
                    {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    <span>{isAr ? 'رجوع للسلة' : 'Back to cart'}</span>
                  </button>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {isAr ? 'نحتاج هذه المعلومات حتى نوصل طلبك. تنحفظ على جهازك للطلب الجاي.' : 'We need these to deliver your order. They are saved on this device for next time.'}
                  </p>
                  {(
                    [
                      ['name', isAr ? 'الاسم الكامل' : 'Full name', 'name', 'text'],
                      ['phone', isAr ? 'رقم الهاتف' : 'Phone number', 'tel', 'tel'],
                    ] as const
                  ).map(([field, label, autoComplete, type]) => (
                    <label key={field} className="block">
                      <span className="block text-xs font-semibold mb-1.5">{label}</span>
                      <input
                        required
                        type={type}
                        autoComplete={autoComplete}
                        dir={type === 'tel' ? 'ltr' : undefined}
                        inputMode={type === 'tel' ? 'tel' : undefined}
                        pattern={type === 'tel' ? '[0-9٠-٩+ ]{10,15}' : undefined}
                        value={details[field]}
                        onChange={(e) => setDetails((d) => ({ ...d, [field]: e.target.value }))}
                        placeholder={type === 'tel' ? '07XX XXX XXXX' : undefined}
                        className="w-full h-12 rounded-xl border border-black/12 dark:border-white/15 bg-white dark:bg-[#181b26] px-3.5 text-base sm:text-sm outline-none focus:border-[#004ad7] dark:focus:border-[#3b82f6] focus:ring-2 focus:ring-[#004ad7]/20"
                      />
                    </label>
                  ))}
                  <label className="block">
                    <span className="block text-xs font-semibold mb-1.5">{isAr ? 'المحافظة' : 'Governorate'}</span>
                    <select
                      required
                      value={details.city}
                      onChange={(e) => setDetails((d) => ({ ...d, city: e.target.value }))}
                      className="w-full h-12 rounded-xl border border-black/12 dark:border-white/15 bg-white dark:bg-[#181b26] px-3 text-base sm:text-sm outline-none focus:border-[#004ad7] dark:focus:border-[#3b82f6] focus:ring-2 focus:ring-[#004ad7]/20"
                    >
                      <option value="" disabled>{isAr ? 'اختر المحافظة' : 'Choose governorate'}</option>
                      {IRAQ_CITIES.map(([ar, en]) => (
                        <option key={en} value={isAr ? ar : en}>{isAr ? ar : en}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold mb-1.5">{isAr ? 'العنوان (المنطقة وأقرب نقطة دالة)' : 'Address (area and nearest landmark)'}</span>
                    <input
                      required
                      autoComplete="street-address"
                      value={details.address}
                      onChange={(e) => setDetails((d) => ({ ...d, address: e.target.value }))}
                      className="w-full h-12 rounded-xl border border-black/12 dark:border-white/15 bg-white dark:bg-[#181b26] px-3.5 text-base sm:text-sm outline-none focus:border-[#004ad7] dark:focus:border-[#3b82f6] focus:ring-2 focus:ring-[#004ad7]/20"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold mb-1.5">{isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}</span>
                    <textarea
                      rows={2}
                      value={details.notes}
                      onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
                      className="w-full rounded-xl border border-black/12 dark:border-white/15 bg-white dark:bg-[#181b26] px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-[#004ad7] dark:focus:border-[#3b82f6] focus:ring-2 focus:ring-[#004ad7]/20 resize-none"
                    />
                  </label>
                </form>
              ) : cartItems.length === 0 ? (
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
                  const itemSubtotal = item.price * item.quantity;
                  const formattedSubtotal = formatPrice ? formatPrice(itemSubtotal) : `${itemSubtotal.toLocaleString()} د.ع`;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 p-3 rounded-2xl border border-black/8 dark:border-white/10 bg-zinc-50/60 dark:bg-[#181b26] transition-all hover:border-[#004ad7]/30"
                    >
                      {item.image && !brokenImages.has(item.id) ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          onError={() => setBrokenImages((prev) => new Set(prev).add(item.id))}
                          className="h-20 w-16 rounded-xl object-cover border border-black/10 dark:border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="flex h-20 w-16 items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 shrink-0">
                          <ShoppingBag className="h-6 w-6 stroke-[1.5]" aria-hidden="true" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
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
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                          aria-label={isAr ? 'حذف من السلة' : 'Remove item'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <div className="flex items-center rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#12151e] p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            aria-label={isAr ? 'تقليل الكمية' : 'Decrease quantity'}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            aria-label={isAr ? 'زيادة الكمية' : 'Increase quantity'}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            {cartItems.length > 0 && view === 'cart' && (
              <div className="border-t border-black/8 dark:border-white/10 px-5 py-4 bg-zinc-50/80 dark:bg-[#161922] space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                    {isAr ? 'المجموع الإجمالي:' : 'Total Amount:'}
                  </span>
                  <span className="text-base font-extrabold text-[#004ad7] dark:text-[#60a5fa] font-mono">
                    {formatPrice ? formatPrice(totalPrice) : `${totalPrice.toLocaleString()} د.ع`}
                  </span>
                </div>

                {step === 'details' && !whatsappPhone && (
                  <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {isAr
                      ? 'الطلبات متوقفة مؤقتاً لأن رقم واتساب المتجر مو مضبوط. تواصل ويانا من حساباتنا أسفل الصفحة.'
                      : "Ordering is paused because the store's WhatsApp number isn't set. Reach us through the links at the bottom of the page."}
                  </p>
                )}
                <button
                  type={step === 'details' ? 'submit' : 'button'}
                  disabled={step === 'details' && !whatsappPhone}
                  form={step === 'details' ? 'checkout-details-form' : undefined}
                  onClick={step === 'cart' ? () => setStep('details') : undefined}
                  className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#004ad7] hover:bg-[#003db3] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] text-white text-sm font-bold shadow-lg shadow-[#004ad7]/25 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="h-5 w-5 fill-white/20 stroke-white stroke-[2]" />
                  <span>
                    {step === 'cart'
                      ? isAr ? 'متابعة الطلب' : 'Continue to checkout'
                      : isAr ? 'إرسال الطلب عبر واتساب' : 'Send order via WhatsApp'}
                  </span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-zinc-400 hover:text-red-500 font-medium transition-colors cursor-pointer"
                  >
                    {isAr ? 'تفريغ السلة بالكامل' : 'Clear all items'}
                  </button>
                  <span className="text-[10.5px] text-zinc-400">
                    {isAr ? 'الدفع عند الاستلام داخل العراق' : 'Cash on Delivery in Iraq'}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

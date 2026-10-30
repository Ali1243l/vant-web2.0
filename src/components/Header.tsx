import { readCart } from '../lib/cart';
import { controlActive } from '../lib/siteControlModel';
import { useEffect, useLayoutEffect, useState, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { Search, Sun, Moon, Globe, Heart, ShoppingCart } from 'lucide-react';
import type { Language, Theme } from '../types';
import { useSiteControls } from '../context/SiteControlsContext';
import SearchOverlay from './SearchOverlay';
import { INITIAL_HEADER_SCROLL, nextHeaderScroll } from '../lib/headerScroll';

interface Props {
  children?: ReactNode;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchOpen: boolean;
  onToggleSearch: (open: boolean) => void;
  wishlistCount?: number;
  isWishlistOnly?: boolean;
  onToggleWishlistOnly?: () => void;
  onOpenCart?: () => void;
  isCartOpen?: boolean;
}

export default function Header({
  children,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  isSearchOpen,
  onToggleSearch,
  wishlistCount = 0,
  isWishlistOnly = false,
  onToggleWishlistOnly,
  onOpenCart,
  isCartOpen = false,
}: Props) {
  const { getControl } = useSiteControls();
  const searchControl = getControl('btn_header_search');
  const wishlistControl = getControl('btn_header_wishlist');
  const cartControl = getControl('btn_header_cart');
  const langControl = getControl('btn_header_lang');
  const themeControl = getControl('btn_header_theme');
  const logoControl = getControl('brand_kinetic_logo');

  const [scrolled, setScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  // Numeric endpoints avoid Framer's auto-height measurement, which restores
  // window scroll and interrupts a page navigation when the categories reveal.
  const categoryContentRef = useRef<HTMLDivElement>(null);
  const [categoryHeight, setCategoryHeight] = useState(0);
  useLayoutEffect(() => {
    const content = categoryContentRef.current;
    if (!content) return;
    const measure = () => setCategoryHeight(content.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [children]);
  const scrollState = useRef(INITIAL_HEADER_SCROLL);
  const reduceMotion = useReducedMotion();
  const [kineticLang, setKineticLang] = useState<'en' | 'ar'>(lang);
  const [cartCount, setCartCount] = useState<number>(() => {
    try {
      return readCart().reduce((sum, item) => sum + item.quantity, 0);
    } catch {
      return 0;
    }
  });
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  useEffect(() => {
    const handleCartUpdate = (e: Event) => {
      const customEv = e as CustomEvent;
      if (customEv.detail && typeof customEv.detail.count === 'number') {
        setCartCount(customEv.detail.count);
      } else {
        try {
          setCartCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
        } catch {}
      }
    };

    const handleCartBounce = () => {
      setIsCartBouncing(true);
      setTimeout(() => setIsCartBouncing(false), 600);
    };

    window.addEventListener('vant-cart-update', handleCartUpdate);
    window.addEventListener('vant-cart-bounce', handleCartBounce);
    return () => {
      window.removeEventListener('vant-cart-update', handleCartUpdate);
      window.removeEventListener('vant-cart-bounce', handleCartBounce);
    };
  }, []);

  const { scrollY } = useScroll();
  const updateScrollState = (position: number) => {
    if (document.documentElement.style.overflow === 'hidden') return;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const next = nextHeaderScroll(scrollState.current, Math.min(position, maxScroll));
    scrollState.current = next;
    setScrolled(next.detached);
    setShowCategories(next.categoriesVisible);
  };
  useMotionValueEvent(scrollY, 'change', updateScrollState);
  useEffect(() => { updateScrollState(window.scrollY); }, []);

  useEffect(() => {
    setKineticLang(lang);
  }, [lang]);

  useEffect(() => {
    const timer = setInterval(() => {
      setKineticLang((prev) => (prev === 'en' ? 'ar' : 'en'));
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header data-store-header data-detached={scrolled} className="store-header pointer-events-none sticky top-0 z-40 h-[120px] w-full shrink-0 sm:h-[136px]">
        <motion.div
          data-store-toolbar
          initial={false}
          animate={{ '--header-detach': scrolled ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="store-toolbar-surface pointer-events-auto mx-auto border bg-white/95 backdrop-blur-xl dark:bg-[#0d0f12]/95"
        >
            <div
              dir="ltr"
              style={{ direction: 'ltr' }}
              className="store-toolbar-actions mx-auto grid w-full grid-cols-[1fr_auto_1fr] items-center px-2 sm:px-6"
            >
              {/* Left Actions (Search Icon, Shopping Cart, Wishlist) */}
              <div className="flex items-center justify-start gap-0 sm:gap-2.5 min-w-0 [direction:ltr]">
                {searchControl.visible && (
                  <button
                    type="button"
                    disabled={!controlActive(searchControl)} onClick={() => onToggleSearch(true)}
                    className={`flex items-center justify-center rounded-full text-[#15171c]/80 dark:text-white/80 transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 cursor-pointer ${
                      'h-11 w-11'
                    }`}
                    aria-label={lang === 'ar' ? searchControl.label_ar : searchControl.label_en}
                    title={lang === 'ar' ? searchControl.label_ar : searchControl.label_en}
                  >
                    <Search className={`stroke-[1.8] transition-all ${scrolled ? 'h-4 w-4' : 'h-4.5 w-4.5'}`} />
                  </button>
                )}

                {/* 1. Dedicated Shopping Cart Icon Button */}
                {(!cartControl || cartControl.visible !== false) && (
                  <button
                    type="button"
                    id="header-cart-icon"
                    data-store-cart-active={isCartOpen || undefined}
                    disabled={!controlActive(cartControl)} onClick={onOpenCart}
                    className={`relative flex items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer ${
                      'h-11 w-11'
                    } ${
                      isCartOpen
                        ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30'
                        : 'text-[#15171c]/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    aria-label={lang === 'ar' ? cartControl.label_ar : cartControl.label_en}
                    title={lang === 'ar' ? cartControl?.label_ar || 'سلة التسوق' : cartControl?.label_en || 'Shopping Cart'}
                  >
                    <motion.div
                      animate={
                        isCartBouncing
                          ? { scale: [1, 1.45, 0.88, 1.2, 1], rotate: [0, -15, 12, -6, 0] }
                          : { scale: 1, rotate: 0 }
                      }
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                      className="flex items-center justify-center"
                    >
                      <ShoppingCart className={`stroke-[1.9] transition-all ${scrolled ? 'h-4 w-4' : 'h-4.5 w-4.5'}`} />
                    </motion.div>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        key={cartCount}
                        className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#004ad7] dark:bg-[#3b82f6] px-1 text-[9px] font-extrabold text-white shadow-sm ring-2 ring-white dark:ring-slate-900"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </button>
                )}

                {/* 2. Wishlist Button */}
                {wishlistControl.visible && onToggleWishlistOnly && (
                  <button
                    type="button"
                    disabled={!controlActive(wishlistControl)} onClick={onToggleWishlistOnly}
                    className={`relative hidden sm:flex items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer ${
                      'h-11 w-11'
                    } ${
                      isWishlistOnly
                        ? 'bg-[#004ad7]/15 dark:bg-[#3b82f6]/20 text-[#004ad7] dark:text-[#3b82f6]'
                        : 'text-[#15171c]/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    aria-label={lang === 'ar' ? wishlistControl.label_ar : wishlistControl.label_en}
                    title={lang === 'ar' ? wishlistControl.label_ar : wishlistControl.label_en}
                  >
                    <Heart className={`stroke-[1.8] transition-all ${scrolled ? 'h-4 w-4' : 'h-4.5 w-4.5'} ${isWishlistOnly ? 'fill-current' : ''}`} />
                    {wishlistCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#004ad7] dark:bg-[#3b82f6] px-0.5 text-[8.5px] font-bold text-white shadow-xs">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Logo (Center) */}
              {logoControl.visible && (
                <div className="store-brand-slot flex items-center justify-center">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.h1
                      key={kineticLang}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      onClick={() => {
                        setKineticLang((prev) => (prev === 'en' ? 'ar' : 'en'));
                      }}
                      className={`select-none transition-all duration-300 font-bold text-[#15171c] dark:text-white cursor-pointer text-center active:opacity-75 ${
                        scrolled
                          ? 'text-[15px] sm:text-[17px]'
                          : 'text-[18px] sm:text-[21px]'
                      } ${
                        kineticLang === 'ar'
                          ? 'tracking-[0.06em]'
                          : 'tracking-[0.28em] uppercase font-extrabold'
                      }`}
                      aria-label={kineticLang === 'ar' ? logoControl.label_ar : logoControl.label_en}
                    >
                      {kineticLang === 'ar' ? (logoControl.label_ar || 'فانت') : (logoControl.label_en || 'VANT')}
                    </motion.h1>
                  </AnimatePresence>
                </div>
              )}

              {/* Right Actions (Lang, Theme) */}
              <div className="flex items-center justify-end gap-0 sm:gap-2.5 min-w-0 [direction:ltr]">
                {themeControl.visible && (
                  <button
                    type="button"
                    disabled={!controlActive(themeControl)} onClick={onToggleTheme}
                    className={`relative flex items-center justify-center rounded-full text-[#15171c]/80 dark:text-white/80 transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer ${
                      'h-11 w-11'
                    }`}
                    aria-label={lang === 'ar' ? themeControl.label_ar : themeControl.label_en}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {theme === 'dark' ? (
                        <motion.div
                          key="sun"
                          initial={{ rotate: -120, scale: 0.3, opacity: 0 }}
                          animate={{ rotate: 0, scale: 1, opacity: 1 }}
                          exit={{ rotate: 120, scale: 0.3, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                          className="flex items-center justify-center text-[#3b82f6]"
                        >
                          <Sun className={`stroke-[1.8] transition-all ${scrolled ? 'h-4 w-4' : 'h-4.5 w-4.5'}`} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="moon"
                          initial={{ rotate: 120, scale: 0.3, opacity: 0 }}
                          animate={{ rotate: 0, scale: 1, opacity: 1 }}
                          exit={{ rotate: -120, scale: 0.3, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                          className="flex items-center justify-center text-[#15171c]"
                        >
                          <Moon className={`stroke-[1.8] transition-all ${scrolled ? 'h-4 w-4' : 'h-4.5 w-4.5'}`} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                )}

                {langControl.visible && (
                  <button
                    type="button"
                    disabled={!controlActive(langControl)} onClick={onToggleLang}
                    className={`group flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/15 bg-white/70 dark:bg-white/10 px-2.5 text-[11px] sm:text-xs font-bold tracking-wide text-[#15171c] dark:text-white transition-all hover:bg-black/5 dark:hover:bg-white/15 active:scale-95 cursor-pointer shadow-2xs ${
                      'h-11 min-w-11'
                    }`}
                    aria-label={lang === 'ar' ? langControl.label_ar : langControl.label_en}
                  >
                    <motion.span
                      key={lang}
                      initial={{ scale: 0.72, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                      className="hidden sm:inline-flex items-center justify-center text-black/60 dark:text-white/70 group-hover:text-black dark:group-hover:text-white"
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </motion.span>
                    <span className="sm:hidden" aria-hidden="true">{lang === 'ar' ? 'EN' : 'عربي'}</span><span className="hidden sm:inline max-w-[4.5rem] truncate">{lang === 'ar' ? langControl.label_ar : langControl.label_en}</span>
                  </button>
                )}
              </div>
            </div>

        {children && (
          <motion.div
            data-store-categories
            aria-hidden={!showCategories}
            inert={!showCategories}
            initial={false}
            animate={{ height: showCategories ? categoryHeight : 0, opacity: showCategories ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: showCategories ? 'visible' : 'hidden' }}
            className="store-category-rail w-full"
          >
            <div ref={categoryContentRef} className="flex min-w-0 items-center gap-1 px-1 sm:block sm:px-0">
              <div className="min-w-0 flex-1">{children}</div>
              {wishlistControl.visible && onToggleWishlistOnly && (
                <button type="button" disabled={!controlActive(wishlistControl)} onClick={onToggleWishlistOnly} aria-label={lang === 'ar' ? wishlistControl.label_ar : wishlistControl.label_en} aria-pressed={isWishlistOnly}
                  className={`relative pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:hidden ${isWishlistOnly ? 'bg-blue-500/15 text-blue-500' : 'text-black/65 dark:text-white/70'}`}>
                  <Heart size={18} strokeWidth={1.8} className={isWishlistOnly ? 'fill-current' : ''} />
                  {wishlistCount > 0 && <span className="absolute end-0 top-0 rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">{wishlistCount}</span>}
                </button>
              )}
            </div>
          </motion.div>
        )}
        </motion.div>
      </header>

      {/* 3. Isolated Search Overlay Component (fixed inset-0 z-[1000]) */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => onToggleSearch(false)}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        lang={lang}
      />
    </>
  );
}

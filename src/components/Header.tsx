import { useEffect, useState, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from 'framer-motion';
import { Search, Sun, Moon, Globe, Heart, ShoppingCart } from 'lucide-react';
import type { Language, Theme } from '../types';
import { useSiteControls } from '../context/SiteControlsContext';
import SearchOverlay from './SearchOverlay';
import { useCartCount } from '../lib/cart';

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
  const [kineticLang, setKineticLang] = useState<'en' | 'ar'>(lang);
  const cartCount = useCartCount();
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  useEffect(() => {
    const handleCartBounce = () => {
      setIsCartBouncing(true);
      setTimeout(() => setIsCartBouncing(false), 600);
    };

    window.addEventListener('vant-cart-bounce', handleCartBounce);
    return () => {
      window.removeEventListener('vant-cart-bounce', handleCartBounce);
    };
  }, []);

  const prevScrollY = useRef(0);

  // Motion scroll listener for the resizable navbar effect and scroll direction
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = prevScrollY.current;
    prevScrollY.current = latest;

    // Hysteresis deadband for scrolled/detached navbar state
    if (latest > 50) {
      setScrolled(true);
    } else if (latest < 20) {
      setScrolled(false);
    }

    // Direction-based reveal/collapse:
    // When near top (<= 40px), always keep categories visible
    // When scrolling down, smoothly hide categories to give maximum space for products
    // When scrolling up, smoothly reveal categories
    if (latest <= 40) {
      setShowCategories(true);
    } else {
      const diff = latest - previous;
      if (diff > 5) {
        setShowCategories(false);
      } else if (diff < -5) {
        setShowCategories(true);
      }
    }
  });

  // Scroll-linked (not toggled) shrink: every value follows the finger over the first 80px
  const progress = useTransform(scrollY, [0, 80], [0, 1], { clamp: true });
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches);
  const [isSm, setIsSm] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches);
  useEffect(() => {
    const md = window.matchMedia('(min-width: 768px)');
    const sm = window.matchMedia('(min-width: 640px)');
    const onChange = () => {
      setIsDesktop(md.matches);
      setIsSm(sm.matches);
    };
    md.addEventListener('change', onChange);
    sm.addEventListener('change', onChange);
    return () => {
      md.removeEventListener('change', onChange);
      sm.removeEventListener('change', onChange);
    };
  }, []);
  // Floating pill only from tablet up; on phones a pill squeezes the content, so the bar stays edge to edge
  const barWidth = useTransform(progress, (v) => (isDesktop ? `${100 - 6 * v}%` : '100%'));
  const barRadius = useTransform(progress, (v) => (isDesktop ? 24 * v : 0));
  const barY = useTransform(progress, (v) => (isDesktop ? 8 * v : 0));
  const barShadow = useTransform(progress, (v) => `0 12px 36px -10px rgba(0,0,0,${0.12 * v}), 0 2px 6px rgba(0,0,0,${0.04 * v})`);
  const topRowHeight = useTransform(progress, (v) => (isSm ? 64 : 56) - (isSm ? 14 : 10) * v);
  const logoScale = useTransform(progress, [0, 1], [1, 0.86]);

  // The header is fixed so collapsing the category row never shifts the page; this spacer holds its resting height
  const headerRef = useRef<HTMLElement>(null);
  const [restingHeight, setRestingHeight] = useState(118);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => {
      if (window.scrollY < 10) setRestingHeight(el.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      {/* Resizable Navbar Outer Wrapper */}
      <div aria-hidden="true" style={{ height: restingHeight }} />
      <header ref={headerRef} className="fixed top-0 inset-x-0 z-40 w-full">
        <motion.div
          animate={{
            backgroundColor: scrolled
              ? theme === 'dark'
                ? 'rgba(13, 15, 18, 0.88)'
                : 'rgba(255, 255, 255, 0.88)'
              : theme === 'dark'
              ? 'rgba(13, 15, 18, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            borderColor: scrolled
              ? theme === 'dark'
                ? 'rgba(255, 255, 255, 0.14)'
                : 'rgba(0, 0, 0, 0.1)'
              : theme === 'dark'
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(0, 0, 0, 0.06)',
          }}
          transition={{
            duration: 0.38,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            borderStyle: 'solid',
            borderWidth: '1px',
            width: barWidth,
            borderRadius: barRadius,
            y: barY,
            boxShadow: barShadow,
          }}
          className="mx-auto max-w-7xl xl:max-w-[1440px] backdrop-blur-md transition-colors"
        >
          <div className="mx-auto w-full px-3 sm:px-6 overflow-visible">
            {/* 1. Resizable Top Navigation Bar */}
            <motion.div
              dir="ltr"
              style={{ direction: 'ltr', height: topRowHeight }}
              className="flex items-center justify-between w-full"
            >
              {/* Left Actions (Search Icon, Shopping Cart, Wishlist) */}
              {/* On phones these actions live in MobileBottomNav; invisible keeps the logo centred */}
              <div className="flex items-center justify-start gap-1.5 sm:gap-2.5 min-w-[110px] sm:min-w-[140px] [direction:ltr] max-md:invisible">
                {searchControl.visible && (
                  <button
                    type="button"
                    onClick={() => onToggleSearch(true)}
                    className={`relative flex items-center justify-center rounded-full text-[#15171c]/80 dark:text-white/80 transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 cursor-pointer ${
                      'h-9 w-9 before:absolute before:-inset-1'
                    }`}
                    aria-label={lang === 'ar' ? 'فتح شريط البحث' : 'Open search'}
                    title={lang === 'ar' ? searchControl.label_ar : searchControl.label_en}
                  >
                    <Search className={`stroke-[1.8] transition-all ${scrolled ? 'h-4 w-4' : 'h-4.5 w-4.5'}`} />
                  </button>
                )}

                {/* 1. Dedicated Shopping Cart Icon Button */}
                {(!cartControl || (cartControl.visible !== false && cartControl.enabled !== false)) && (
                  <button
                    type="button"
                    id="header-cart-icon"
                    onClick={onOpenCart}
                    className={`relative flex items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer ${
                      'h-9 w-9 before:absolute before:-inset-1'
                    } ${
                      isCartOpen
                        ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30'
                        : 'text-[#15171c]/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    aria-label={lang === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
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
                    onClick={onToggleWishlistOnly}
                    className={`relative flex items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer ${
                      'h-9 w-9 before:absolute before:-inset-1'
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
                <motion.div style={{ scale: logoScale }} className="flex items-center justify-center">
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
                      className={`select-none transition-all duration-300 font-bold text-[#15171c] dark:text-white cursor-pointer text-center active:opacity-75 text-[18px] sm:text-[21px] ${
                        kineticLang === 'ar'
                          ? 'tracking-[0.06em]'
                          : 'tracking-[0.28em] uppercase font-extrabold'
                      }`}
                      aria-label={kineticLang === 'ar' ? 'فانت' : 'VANT'}
                    >
                      {kineticLang === 'ar' ? (logoControl.label_ar || 'فانت') : (logoControl.label_en || 'VANT')}
                    </motion.h1>
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Right Actions (Lang, Theme) */}
              <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 min-w-[80px] sm:min-w-[110px] [direction:ltr]">
                {themeControl.visible && (
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className={`relative flex items-center justify-center rounded-full text-[#15171c]/80 dark:text-white/80 transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer ${
                      'h-9 w-9 before:absolute before:-inset-1'
                    }`}
                    aria-label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
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
                    onClick={onToggleLang}
                    className={`group relative before:absolute before:-inset-1.5 flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/15 bg-white/70 dark:bg-white/10 px-2.5 text-[11px] sm:text-xs font-bold tracking-wide text-[#15171c] dark:text-white transition-all hover:bg-black/5 dark:hover:bg-white/15 active:scale-95 cursor-pointer shadow-2xs ${
                      scrolled ? 'h-7.5 sm:h-8' : 'h-8 sm:h-8.5'
                    }`}
                    aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                  >
                    <motion.span
                      key={lang}
                      initial={{ scale: 0.72, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                      className="inline-flex items-center justify-center text-black/60 dark:text-white/70 group-hover:text-black dark:group-hover:text-white"
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </motion.span>
                    <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
                  </button>
                )}
              </div>
            </motion.div>

            {/* 2. Collapsible CategoryFilter Bar */}
            <AnimatePresence initial={false}>
              {showCategories && children && (
                <motion.div
                  key="header-category-filter-wrapper"
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                    overflow: 'visible',
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    overflow: 'hidden',
                  }}
                  transition={{
                    duration: 0.32,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="w-full overflow-visible"
                >
                  <div className="w-full pb-2 pt-0.5 overflow-visible">
                    {children}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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

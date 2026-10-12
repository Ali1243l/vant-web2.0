import { useEffect, useState, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Search, Sun, Moon, Globe, Heart } from 'lucide-react';
import type { Language, Theme } from '../types';
import { useSiteControls } from '../context/SiteControlsContext';
import SearchOverlay from './SearchOverlay';

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
}: Props) {
  const { getControl } = useSiteControls();
  const searchControl = getControl('btn_header_search');
  const wishlistControl = getControl('btn_header_wishlist');
  const langControl = getControl('btn_header_lang');
  const themeControl = getControl('btn_header_theme');
  const logoControl = getControl('brand_kinetic_logo');

  const [scrolled, setScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [kineticLang, setKineticLang] = useState<'en' | 'ar'>(lang);
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
      <header className="sticky top-0 z-40 w-full">
        <motion.div
          animate={{
            width: scrolled ? '94%' : '100%',
            borderRadius: scrolled ? '24px' : '0px',
            y: scrolled ? 8 : 0,
            boxShadow: scrolled
              ? '0 12px 36px -10px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)'
              : 'none',
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
          }}
          className="mx-auto max-w-7xl xl:max-w-[1440px] backdrop-blur-md transition-colors"
        >
          <div className="mx-auto w-full px-3 sm:px-6 overflow-visible">
            {/* 1. Resizable Top Navigation Bar */}
            <div
              dir="ltr"
              style={{ direction: 'ltr' }}
              className={`flex items-center justify-between w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                scrolled ? 'h-11 sm:h-12' : 'h-14 sm:h-16'
              }`}
            >
              {/* Left Actions (Search Icon, Wishlist) */}
              <div className="flex items-center justify-start gap-1.5 sm:gap-2.5 min-w-[80px] sm:min-w-[110px] [direction:ltr]">
                {searchControl.visible && (
                  <button
                    type="button"
                    onClick={() => onToggleSearch(true)}
                    className={`flex items-center justify-center rounded-full text-[#15171c]/80 dark:text-white/80 transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 cursor-pointer ${
                      scrolled ? 'h-8 w-8' : 'h-9 w-9'
                    }`}
                    aria-label={lang === 'ar' ? 'فتح شريط البحث' : 'Open search'}
                    title={lang === 'ar' ? searchControl.label_ar : searchControl.label_en}
                  >
                    <Search className={`stroke-[1.8] transition-all ${scrolled ? 'h-4 w-4' : 'h-4.5 w-4.5'}`} />
                  </button>
                )}

                {wishlistControl.visible && onToggleWishlistOnly && (
                  <button
                    type="button"
                    onClick={onToggleWishlistOnly}
                    className={`relative flex items-center justify-center rounded-full transition-all active:scale-90 cursor-pointer ${
                      scrolled ? 'h-8 w-8' : 'h-9 w-9'
                    } ${
                      isWishlistOnly
                        ? 'bg-[#004ad7]/15 dark:bg-[#3b82f6]/20 text-[#004ad7] dark:text-[#3b82f6]'
                        : 'text-[#15171c]/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    aria-label={lang === 'ar' ? wishlistControl.label_ar : wishlistControl.label_en}
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
                <div className="flex items-center justify-center">
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
                      aria-label={kineticLang === 'ar' ? 'فانت' : 'VANT'}
                    >
                      {kineticLang === 'ar' ? (logoControl.label_ar || 'فانت') : (logoControl.label_en || 'VANT')}
                    </motion.h1>
                  </AnimatePresence>
                </div>
              )}

              {/* Right Actions (Lang, Theme) */}
              <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 min-w-[80px] sm:min-w-[110px] [direction:ltr]">
                {themeControl.visible && (
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className={`relative flex items-center justify-center rounded-full text-[#15171c]/80 dark:text-white/80 transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 cursor-pointer ${
                      scrolled ? 'h-8 w-8' : 'h-9 w-9'
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
                    className={`group flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/15 bg-white/70 dark:bg-white/10 px-2.5 text-[11px] sm:text-xs font-bold tracking-wide text-[#15171c] dark:text-white transition-all hover:bg-black/5 dark:hover:bg-white/15 active:scale-95 cursor-pointer shadow-2xs ${
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
            </div>

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

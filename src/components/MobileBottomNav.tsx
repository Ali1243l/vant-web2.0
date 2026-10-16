import { motion } from 'framer-motion';
import { Home, Search, Heart, ShoppingCart } from 'lucide-react';
import type { Language } from '../types';
import { useSiteControls } from '../context/SiteControlsContext';
import { useCartCount } from '../lib/cart';

interface Props {
  lang: Language;
  isWishlistOnly: boolean;
  wishlistCount: number;
  isCartOpen: boolean;
  onHome: () => void;
  onSearch: () => void;
  onToggleWishlist: () => void;
  onOpenCart: () => void;
}

/** Thumb-reach navigation for phones; the header keeps these actions from md up. */
export default function MobileBottomNav({
  lang,
  isWishlistOnly,
  wishlistCount,
  isCartOpen,
  onHome,
  onSearch,
  onToggleWishlist,
  onOpenCart,
}: Props) {
  const { getControl } = useSiteControls();
  const cartCount = useCartCount();
  const isAr = lang === 'ar';
  const cartControl = getControl('btn_header_cart');

  const items = [
    { key: 'home', show: true, icon: Home, label: isAr ? 'الرئيسية' : 'Home', active: !isWishlistOnly && !isCartOpen, badge: 0, onClick: onHome },
    { key: 'search', show: getControl('btn_header_search').visible, icon: Search, label: isAr ? 'البحث' : 'Search', active: false, badge: 0, onClick: onSearch },
    { key: 'wishlist', show: getControl('btn_header_wishlist').visible, icon: Heart, label: isAr ? 'المفضلة' : 'Wishlist', active: isWishlistOnly, badge: wishlistCount, onClick: onToggleWishlist },
    { key: 'cart', show: !cartControl || (cartControl.visible !== false && cartControl.enabled !== false), icon: ShoppingCart, label: isAr ? 'السلة' : 'Cart', active: isCartOpen, badge: cartCount, onClick: onOpenCart },
  ].filter((i) => i.show);

  return (
    <nav
      aria-label={isAr ? 'التنقل الرئيسي' : 'Main navigation'}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-[#0d0f12]/90 backdrop-blur-lg shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.12)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch justify-around px-2">
        {items.map(({ key, icon: Icon, label, active, badge, onClick }) => (
          <li key={key} className="flex-1">
            <button
              type="button"
              id={key === 'cart' ? 'floating-cart-icon' : undefined}
              onClick={onClick}
              aria-current={active ? 'page' : undefined}
              className={`relative flex h-15 w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer active:scale-95 ${
                active ? 'text-[#004ad7] dark:text-[#3b82f6]' : 'text-[#15171c]/55 dark:text-white/55'
              }`}
            >
              <span className="relative flex h-8 w-14 items-center justify-center">
                {active && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 rounded-full bg-[#004ad7]/10 dark:bg-[#3b82f6]/15"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon className={`relative h-5.5 w-5.5 stroke-[1.9] ${active && key === 'wishlist' ? 'fill-current' : ''}`} aria-hidden="true" />
                {badge > 0 && (
                  <span className="absolute top-0 ltr:right-2 rtl:left-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#004ad7] dark:bg-[#3b82f6] px-1 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-[#12151e]">
                    {badge}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

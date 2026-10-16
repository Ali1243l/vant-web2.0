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
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-black/8 dark:border-white/10 bg-white/95 dark:bg-[#12151e]/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch justify-around">
        {items.map(({ key, icon: Icon, label, active, badge, onClick }) => (
          <li key={key} className="flex-1">
            <button
              type="button"
              id={key === 'cart' ? 'floating-cart-icon' : undefined}
              onClick={onClick}
              aria-current={active ? 'page' : undefined}
              className={`relative flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold transition-colors cursor-pointer ${
                active ? 'text-[#004ad7] dark:text-[#3b82f6]' : 'text-[#15171c]/60 dark:text-white/60'
              }`}
            >
              <span className="relative">
                <Icon className={`h-5.5 w-5.5 stroke-[1.9] ${active && key === 'wishlist' ? 'fill-current' : ''}`} aria-hidden="true" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 ltr:-right-2.5 rtl:-left-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#004ad7] dark:bg-[#3b82f6] px-1 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-[#12151e]">
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

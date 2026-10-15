import { useEffect, useState } from 'react';
import { Home, Search, Heart, ShoppingBag, MessageCircle } from 'lucide-react';
import type { Language } from '../types';

interface Props {
  lang: Language;
  onHome: () => void;
  onSearch: () => void;
  onOpenCart: () => void;
  onToggleWishlist: () => void;
  isWishlistOnly: boolean;
  wishlistCount: number;
  whatsappUrl: string;
  hidden: boolean;
}

const readCartCount = (): number => {
  try {
    return parseInt(localStorage.getItem('vant_cart_count') || '0', 10) || 0;
  } catch {
    return 0;
  }
};

// Mobile-only bottom bar: keeps the actions a shopper uses most within thumb reach.
// Hidden on sm+ (desktop keeps the top header controls).
export default function MobileTabBar({
  lang,
  onHome,
  onSearch,
  onOpenCart,
  onToggleWishlist,
  isWishlistOnly,
  wishlistCount,
  whatsappUrl,
  hidden,
}: Props) {
  const [cartCount, setCartCount] = useState<number>(readCartCount);
  const isAr = lang === 'ar';

  useEffect(() => {
    const sync = () => setCartCount(readCartCount());
    window.addEventListener('vant-cart-update', sync);
    return () => window.removeEventListener('vant-cart-update', sync);
  }, []);

  if (hidden) return null;

  const itemBase =
    'relative flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[56px] text-[11px] font-semibold transition-colors active:scale-95';
  const idle = 'text-[#15171c]/65 dark:text-white/65';
  const active = 'text-[#004ad7] dark:text-[#3b82f6]';

  return (
    <nav
      aria-label={isAr ? 'التنقل السريع' : 'Quick navigation'}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#0d0f12]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <ul className="flex items-stretch px-1">
        <li className="flex flex-1">
          <button type="button" onClick={onHome} className={`${itemBase} ${idle}`}>
            <Home className="h-5 w-5" />
            <span>{isAr ? 'الرئيسية' : 'Home'}</span>
          </button>
        </li>
        <li className="flex flex-1">
          <button type="button" onClick={onSearch} className={`${itemBase} ${idle}`}>
            <Search className="h-5 w-5" />
            <span>{isAr ? 'بحث' : 'Search'}</span>
          </button>
        </li>
        <li className="flex flex-1">
          <button type="button" onClick={onOpenCart} className={`${itemBase} ${idle}`}>
            <span className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -end-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#004ad7] dark:bg-[#3b82f6] px-1 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-[#0d0f12]">
                  {cartCount}
                </span>
              )}
            </span>
            <span>{isAr ? 'السلة' : 'Cart'}</span>
          </button>
        </li>
        <li className="flex flex-1">
          <button
            type="button"
            onClick={onToggleWishlist}
            className={`${itemBase} ${isWishlistOnly ? active : idle}`}
            aria-pressed={isWishlistOnly}
          >
            <span className="relative">
              <Heart className={`h-5 w-5 ${isWishlistOnly ? 'fill-current' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -end-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#004ad7] dark:bg-[#3b82f6] px-1 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-[#0d0f12]">
                  {wishlistCount}
                </span>
              )}
            </span>
            <span>{isAr ? 'المفضلة' : 'Wishlist'}</span>
          </button>
        </li>
        <li className="flex flex-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${itemBase} ${idle}`}
          >
            <MessageCircle className="h-5 w-5" />
            <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}

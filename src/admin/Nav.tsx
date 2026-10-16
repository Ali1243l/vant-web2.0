import React from 'react';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  Lock,
  Store,
  ExternalLink,
  Sliders,
  X,
  Ruler,
  Image as ImageIcon,
  Gift,
  Globe,
  Download,
  KeyRound,
  Layers,
} from 'lucide-react';
import { useAdminBridge, AdminView } from './useAdminBridge';

interface NavProps {
  onItemClick?: () => void;
  collapsed?: boolean;
  onCloseAdmin?: () => void;
}

interface NavSection {
  title: string;
  titleEn: string;
  items: Array<{
    id: AdminView;
    label: string;
    labelEn: string;
    icon: React.ElementType;
    count?: number;
    badgeText?: string;
    isGlowingAmber?: boolean;
  }>;
}

export const Nav: React.FC<NavProps> = ({ onItemClick, collapsed = false, onCloseAdmin }) => {
  const { activeView, setActiveView, lang, products, offers, subscribers, orders = [], lock } = useAdminBridge();

  const isAr = lang === 'ar';

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending_payment').length;

  // Grouped by what the owner does day to day: sell, manage the shop, talk to customers, configure
  const sections: NavSection[] = [
    {
      title: 'المبيعات',
      titleEn: 'SALES',
      items: [
        { id: 'dashboard', label: 'الرئيسية', labelEn: 'Overview', icon: LayoutDashboard },
        {
          id: 'orders',
          label: 'الطلبات',
          labelEn: 'Orders',
          icon: ShoppingBag,
          count: pendingOrdersCount,
          isGlowingAmber: pendingOrdersCount > 0,
        },
        {
          id: 'offers',
          label: 'العروض والخصومات',
          labelEn: 'Offers & Promos',
          icon: Tag,
          count: offers.filter((o) => o.status === 'active').length,
        },
      ],
    },
    {
      title: 'المتجر',
      titleEn: 'STORE',
      items: [
        { id: 'products', label: 'المنتجات', labelEn: 'Products', icon: Package, count: products.length },
        { id: 'sizes', label: 'دليل المقاسات', labelEn: 'Size Guide', icon: Ruler },
        { id: 'banners', label: 'البانرات والصور', labelEn: 'Banners & Media', icon: ImageIcon },
        { id: 'welcome_modal', label: 'النافذة الترحيبية', labelEn: 'Welcome Popup', icon: Gift },
      ],
    },
    {
      title: 'العملاء',
      titleEn: 'CUSTOMERS',
      items: [
        { id: 'subscribers', label: 'المشتركين والحملات', labelEn: 'Subscribers & Campaigns', icon: Users, count: subscribers.length },
        { id: 'social', label: 'روابط التواصل', labelEn: 'Social Links', icon: Globe },
      ],
    },
    {
      title: 'الإعدادات',
      titleEn: 'SETTINGS',
      items: [
        { id: 'settings', label: 'الإعدادات العامة', labelEn: 'General Settings', icon: Store },
        { id: 'controls', label: 'أزرار وأقسام الموقع', labelEn: 'Site Controls', icon: Sliders },
        { id: 'widgets', label: 'استوديو الأدوات', labelEn: 'Widgets Studio', icon: Layers },
        { id: 'backup', label: 'النسخ الاحتياطي', labelEn: 'Backup', icon: Download },
        { id: 'security', label: 'الأمان ورمز الدخول', labelEn: 'Security & PIN', icon: KeyRound },
      ],
    },
  ];

  const handleSelect = (viewId: AdminView) => {
    setActiveView(viewId);
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <nav className="flex flex-col h-full select-none" aria-label="Main Navigation">
      {/* Brand / Logo section */}
      <div className={`px-5 py-5 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/40 ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#004ad7] to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950 shrink-0 font-bold text-lg tracking-wider">
            <Store className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden text-start">
              <span className="font-bold text-white text-base leading-tight truncate flex items-center gap-1.5">
                <span>VANT | فانت</span>
              </span>
              <span className="text-xs text-neutral-400 truncate">
                {isAr ? 'لوحة التحكم' : 'Admin'}
              </span>
            </div>
          )}
        </div>
        {/* In the phone drawer the drawer's own X closes the menu; this one would close the whole admin */}
        {!collapsed && onCloseAdmin && !onItemClick && (
          <button
            onClick={onCloseAdmin}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
            title={isAr ? 'العودة للمتجر' : 'Return to Boutique'}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Sections List */}
      <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto no-scrollbar">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 pb-1 text-[11px] font-bold tracking-wider text-slate-500 uppercase text-start">
                {isAr ? sec.title : sec.titleEn}
              </div>
            )}
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3 min-h-11 rounded-xl text-[15px] lg:text-sm font-medium transition-all group text-start relative cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80 border border-transparent'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? (isAr ? item.label : item.labelEn) : undefined}
                >
                  {isActive && (
                    <span
                      className={`absolute inset-y-1.5 ${
                        isAr ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'
                      } w-1 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]`}
                    />
                  )}

                  <div className="relative shrink-0">
                    <Icon
                      className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-indigo-400' : 'text-neutral-400 group-hover:text-neutral-200'
                      }`}
                    />
                    {collapsed && item.isGlowingAmber && (
                      <span className="absolute -top-1 -end-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping" />
                    )}
                    {collapsed && item.isGlowingAmber && (
                      <span className="absolute -top-1 -end-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                    )}
                  </div>

                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                      <span className="truncate">{isAr ? item.label : item.labelEn}</span>
                      <div className="flex items-center gap-1.5">
                        {item.badgeText && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                            {item.badgeText}
                          </span>
                        )}
                        {typeof item.count === 'number' && item.count > 0 && (
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all ${
                              item.isGlowingAmber
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.45)]'
                                : isActive
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        <div className="my-2 border-t border-slate-800/60" />

        {/* Lock Screen Shortcut Button */}
        <button
          onClick={() => {
            lock();
            if (onItemClick) onItemClick();
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 text-start cursor-pointer ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title={collapsed ? (isAr ? 'قفل الشاشة' : 'Lock Admin') : undefined}
        >
          <Lock className="w-4.5 h-4.5 text-amber-400 shrink-0" />
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span>{isAr ? 'قفل لوحة التحكم' : 'Lock Dashboard'}</span>
            </div>
          )}
        </button>

        {/* Live Storefront Link */}
        {onCloseAdmin && (
          <button
            onClick={() => {
              if (onCloseAdmin) onCloseAdmin();
              if (onItemClick) onItemClick();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 text-start cursor-pointer ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title={collapsed ? (isAr ? 'معاينة المتجر المباشر' : 'Live Storefront') : undefined}
          >
            <ExternalLink className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>{isAr ? 'الرجوع للمتجر' : 'Back to store'}</span>
              </div>
            )}
          </button>
        )}
      </div>
    </nav>
  );
};
export default Nav;

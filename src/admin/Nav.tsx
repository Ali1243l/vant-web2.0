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
  ChevronRight,
  TrendingUp,
  Sparkles,
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

  const sections: NavSection[] = [
    {
      title: 'المشاريع والكتالوج (Projects)',
      titleEn: 'PROJECTS & CATALOG',
      items: [
        {
          id: 'products',
          label: 'إدارة المنتجات والمشاريع',
          labelEn: 'Products & Projects',
          icon: Package,
          count: products.length,
        },
        {
          id: 'sizes',
          label: 'دليل المقاسات والأبعاد',
          labelEn: 'Size Guide & Specs',
          icon: Ruler,
        },
        {
          id: 'banners',
          label: 'البانرات والوسائط',
          labelEn: 'Banners & Media',
          icon: ImageIcon,
        },
        {
          id: 'welcome_modal',
          label: 'النافذة الترحيبية والهدايا',
          labelEn: 'Welcome Popup & Gift',
          icon: Gift,
        },
      ],
    },
    {
      title: 'المحفظة والمالية (Wallet)',
      titleEn: 'WALLET & REVENUE',
      items: [
        {
          id: 'dashboard',
          label: 'الرئيسية وتحليلات الأرباح',
          labelEn: 'Overview & Wallet Analytics',
          icon: LayoutDashboard,
        },
        {
          id: 'orders',
          label: 'الطلبات والكونسيرج',
          labelEn: 'Orders & Concierge',
          icon: ShoppingBag,
          count: pendingOrdersCount,
          isGlowingAmber: pendingOrdersCount > 0,
        },
        {
          id: 'offers',
          label: 'العروض وقسائم الخصم',
          labelEn: 'Offers & Promos',
          icon: Tag,
          count: offers.filter((o) => o.status === 'active').length,
        },
      ],
    },
    {
      title: 'الوحدات والأدوات (Widgets)',
      titleEn: 'WIDGETS & UI TOOLS',
      items: [
        {
          id: 'widgets',
          label: 'استوديو الأدوات والوحدات',
          labelEn: 'Widgets Studio & UI Tools',
          icon: Layers,
          badgeText: 'New',
        },
      ],
    },
    {
      title: 'الـ API والتكاملات (API & Cloud)',
      titleEn: 'API & INTEGRATIONS',
      items: [
        {
          id: 'controls',
          label: 'أزرار وتفاعل الموقع',
          labelEn: 'Buttons & Controls',
          icon: Sliders,
        },
        {
          id: 'subscribers',
          label: 'النشرات والعملاء',
          labelEn: 'Campaigns & Subscribers',
          icon: Users,
          count: subscribers.length,
        },
        {
          id: 'social',
          label: 'روابط التواصل والـ API',
          labelEn: 'Social & External APIs',
          icon: Globe,
        },
        {
          id: 'backup',
          label: 'النسخ الاحتياطي السحابي',
          labelEn: 'Cloud Backup & JSON',
          icon: Download,
        },
        {
          id: 'settings',
          label: 'إعدادات النظام العامة',
          labelEn: 'System Settings',
          icon: Store,
        },
      ],
    },
    {
      title: 'الأمان والوصول (Security)',
      titleEn: 'SECURITY & ACCESS',
      items: [
        {
          id: 'security',
          label: 'الأمان ورمز دخول الإدارة',
          labelEn: 'Security & Access PIN',
          icon: KeyRound,
        },
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
                <span>{isAr ? 'دار ڤانت (VANT)' : 'Maison VANT'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] inline-block shrink-0 animate-pulse" />
              </span>
              <span className="text-xs text-neutral-400 truncate">
                {isAr ? 'لوحة تحكم المتجر المتكاملة' : 'Admin Operations Hub'}
              </span>
            </div>
          )}
        </div>
        {!collapsed && onCloseAdmin && (
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
              <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase text-start">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group text-start relative cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80 border border-transparent'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? (isAr ? item.label : item.labelEn) : undefined}
                >
                  {isActive && (
                    <span
                      className={`absolute inset-y-1.5 ${
                        isAr ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'
                      } w-1 bg-blue-500`}
                    />
                  )}

                  <div className="relative shrink-0">
                    <Icon
                      className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-blue-400' : 'text-neutral-400 group-hover:text-neutral-200'
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
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
                            {item.badgeText}
                          </span>
                        )}
                        {typeof item.count === 'number' && item.count > 0 && (
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all ${
                              item.isGlowingAmber
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.45)]'
                                : isActive
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
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
              <span className="text-[10px] text-amber-400/80 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                PIN
              </span>
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
                <span>{isAr ? 'معاينة المتجر المباشر' : 'Live Storefront'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            )}
          </button>
        )}
      </div>
    </nav>
  );
};
export default Nav;

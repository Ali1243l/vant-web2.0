import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  Lock,
  Globe,
  ChevronDown,
  Store,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  LogOut,
  ShoppingBag,
  Tag,
  Package,
  Users,
  X,
  ExternalLink,
  Layers,
  Menu,
} from 'lucide-react';
import { useAdminBridge, AdminView } from './useAdminBridge';
import { Button } from './ui';

interface AdminHeaderProps {
  onOpenProductSheet?: () => void;
  onOpenOfferSheet?: () => void;
  onCloseAdmin?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenProductSheet,
  onOpenOfferSheet,
  onCloseAdmin,
}) => {
  const {
    activeView,
    setActiveView,
    lock,
    lang,
    toggleLang,
    currentStore,
    notifications,
    markNotificationsAsRead,
    products,
    subscribers,
    orders = [],
    setIsOfferModalOpen,
    siteSettings,
    updateSiteSettings,
    isLiveDatabase,
    isCloudSynced,
    refreshProducts,
    syncAllToSupabaseCloud,
    setIsDrawerOpen,
  } = useAdminBridge();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [logoutFeedback, setLogoutFeedback] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAr = lang === 'ar';
  const unreadCount = notifications.filter((n) => !n.read).length;

  const viewTitles: Record<AdminView, { ar: string; en: string }> = {
    dashboard: { ar: 'لوحة التحليلات وسلوك الزوار', en: 'Dashboard & Deep Analytics' },
    orders: { ar: 'إدارة الطلبات والكونسيرج الملكي', en: 'Order Management & VIP Concierge' },
    products: { ar: 'إدارة المنتجات والكتالوج', en: 'Product Catalog & Inventory' },
    sizes: { ar: 'دليل المقاسات والأبعاد الهندسية', en: 'Master Size Guide & Specs' },
    offers: { ar: 'العروض وقسائم الخصم الحصرية', en: 'Offers & Promo Codes' },
    banners: { ar: 'البانرات واستوديو وسائط المتجر', en: 'Banners, Media & Specs Studio' },
    welcome_modal: { ar: 'نافذة الترحيب وكوبون الزوار', en: 'Welcome Modal & VIP Voucher' },
    subscribers: { ar: 'استوديو النشرات والحملات البريدية', en: 'Campaign Studio & Subscribers' },
    controls: { ar: 'أزرار وخصائص تفاعل المتجر', en: 'Buttons & Interactive Controls' },
    social: { ar: 'روابط المنصات وقنوات التواصل', en: 'Social Media & Footer Links' },
    backup: { ar: 'تصدير البيانات والنسخ الاحتياطي', en: 'Multi-Format Export & Backup Hub' },
    settings: { ar: 'الإعدادات العامة وهوية المتجر', en: 'Master Site Controls & Settings' },
    security: { ar: 'الأمان ورمز دخول الإدارة', en: 'Security & Access Key' },
    widgets: { ar: 'استوديو الأدوات والوحدات المعيارية', en: 'Widgets Studio & UI Tools' },
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const matchingProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.nameEn && p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const matchingSubscribers = searchQuery.trim()
    ? subscribers.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingOrders = searchQuery.trim()
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerPhone.includes(searchQuery)
      ).slice(0, 3)
    : [];

  const handleSelectSearchResult = (view: AdminView) => {
    setActiveView(view);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setLogoutFeedback(true);
    setTimeout(() => {
      setLogoutFeedback(false);
      lock();
    }, 700);
  };

  const handleNewOfferClick = () => {
    if (onOpenOfferSheet) {
      onOpenOfferSheet();
    } else {
      setActiveView('offers');
      setIsOfferModalOpen(true);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Logout animation toast */}
      {logoutFeedback && (
        <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900 border border-amber-500/50 text-amber-300 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in zoom-in duration-200">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>{isAr ? 'جاري قفل الجلسة وتسجيل الخروج بأمان...' : 'Locking session and signing out safely...'}</span>
        </div>
      )}

      {/* Left section: Category Pill + View Title */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="lg:hidden -ms-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label={isAr ? 'فتح القائمة' : 'Open menu'}
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-lg text-[10.5px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/60">
          {isAr
            ? (activeView === 'products' || activeView === 'sizes' || activeView === 'banners' || activeView === 'welcome_modal'
                ? 'المشاريع'
                : activeView === 'dashboard' || activeView === 'orders' || activeView === 'offers'
                ? 'المحفظة'
                : activeView === 'widgets'
                ? 'الأدوات'
                : activeView === 'security'
                ? 'الأمان'
                : 'الـ API')
            : (activeView === 'products' || activeView === 'sizes' || activeView === 'banners' || activeView === 'welcome_modal'
                ? 'PROJECTS'
                : activeView === 'dashboard' || activeView === 'orders' || activeView === 'offers'
                ? 'WALLET'
                : activeView === 'widgets'
                ? 'WIDGETS'
                : activeView === 'security'
                ? 'SECURITY'
                : 'API')}
        </span>
        <h1 className="text-sm sm:text-base font-bold text-white truncate">
          {isAr ? viewTitles[activeView]?.ar : viewTitles[activeView]?.en}
        </h1>
      </div>

      {/* Right section: Search, Widgets Studio, Action Button, Notifications, Lang, Lock, User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Widgets Studio Button with Glowing Badge */}
        <button
          type="button"
          onClick={() => setActiveView('widgets')}
          className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
            activeView === 'widgets'
              ? 'bg-blue-600/25 text-blue-300 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
              : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 border-neutral-700 hover:border-blue-500/40'
          }`}
          title={isAr ? 'فتح استوديو الأدوات والوحدات' : 'Open Widgets Studio'}
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>{isAr ? 'الأدوات والوحدات' : 'Widgets'}</span>
          <span className="text-[9px] px-1 py-0.2 rounded font-bold uppercase bg-blue-500/30 text-blue-300">
            NEW
          </span>
        </button>

        {/* 1. Quick Search with Live Suggestions */}
        <div ref={searchContainerRef} className="relative hidden md:block w-48 lg:w-60">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder={isAr ? 'بحث سريع...' : 'Search...'}
            className="w-full bg-slate-800/70 border border-slate-700/70 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 ps-9 pe-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute end-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded font-mono pointer-events-none">
              ⌘K
            </kbd>
          )}

          {/* Quick Search Floating Results */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute start-0 top-full mt-2 w-72 lg:w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800/80 mb-1">
                {isAr ? 'نتائج البحث السريع' : 'Quick Search Results'}
              </div>

              {matchingProducts.length === 0 && matchingSubscribers.length === 0 && matchingOrders.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  {isAr ? 'لا توجد نتائج مطابقة' : 'No matching results'}
                </div>
              ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {matchingOrders.length > 0 && (
                    <div>
                      <div className="text-[10px] text-amber-400 font-semibold px-2 py-0.5">
                        {isAr ? 'الطلبات والكونسيرج' : 'Orders & Concierge'}
                      </div>
                      {matchingOrders.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => handleSelectSearchResult('orders')}
                          className="w-full text-start flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200 cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="font-mono text-indigo-300 font-bold">#{o.id}</span>
                          <span className="truncate flex-1">{o.customerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{o.status}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchingProducts.length > 0 && (
                    <div className="pt-1 border-t border-slate-800/60 mt-1">
                      <div className="text-[10px] text-indigo-400 font-semibold px-2 py-0.5">
                        {isAr ? 'المنتجات' : 'Products'}
                      </div>
                      {matchingProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectSearchResult('products')}
                          className="w-full text-start flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200 cursor-pointer"
                        >
                          {p.imageUrl?.trim() ? (
                            <img src={p.imageUrl} alt="" className="w-6 h-6 rounded object-cover bg-slate-800" />
                          ) : (
                            <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">•</div>
                          )}
                          <span className="truncate flex-1">{isAr ? p.name : p.nameEn || p.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{p.sku}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchingSubscribers.length > 0 && (
                    <div className="pt-1 border-t border-slate-800/60 mt-1">
                      <div className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5">
                        {isAr ? 'العملاء' : 'Subscribers'}
                      </div>
                      {matchingSubscribers.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleSelectSearchResult('subscribers')}
                          className="w-full text-start flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200 cursor-pointer"
                        >
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="truncate flex-1">{s.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{s.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Primary Quick Action Button */}
        {activeView === 'products' && onOpenProductSheet && (
          <Button
            size="sm"
            onClick={onOpenProductSheet}
            leftIcon={<Plus className="w-4 h-4" />}
            className="max-md:!hidden shadow-sm shadow-indigo-900/50"
          >
            {isAr ? 'منتج جديد' : 'New Product'}
          </Button>
        )}

        {activeView === 'offers' && (
          <Button
            size="sm"
            onClick={handleNewOfferClick}
            leftIcon={<Plus className="w-4 h-4" />}
            className="max-md:!hidden shadow-sm shadow-indigo-900/50"
          >
            {isAr ? 'كود جديد' : 'New Offer'}
          </Button>
        )}

        {activeView === 'dashboard' && onOpenProductSheet && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenProductSheet}
            leftIcon={<Plus className="w-4 h-4 text-indigo-400" />}
            className="hidden xl:inline-flex border-slate-700 hover:bg-slate-800"
          >
            {isAr ? 'إضافة منتج' : 'Add Product'}
          </Button>
        )}

        {activeView === 'subscribers' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveView('subscribers')}
            leftIcon={<Plus className="w-4 h-4 text-emerald-400" />}
            className="hidden xl:inline-flex border-slate-700 hover:bg-slate-800"
          >
            {isAr ? 'حملة جديدة' : 'New Campaign'}
          </Button>
        )}

        {/* 3. Notification Bell with interactive dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              if (!isNotifOpen) markNotificationsAsRead();
            }}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Notifications"
            title={isAr ? 'الإشعارات والتنبيهات' : 'Notifications'}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute end-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-semibold text-white">
                  {isAr ? 'الإشعارات والتنبيهات الحية' : 'Live Notifications'}
                </span>
                <span className="text-[11px] text-indigo-400 font-medium">
                  {notifications.length} {isAr ? 'تنبيهات' : 'alerts'}
                </span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-lg text-start transition-colors border ${
                      n.read ? 'bg-slate-800/40 border-slate-800/60' : 'bg-indigo-950/20 border-indigo-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-slate-200">
                      <span className="truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Language Switcher (عربي / EN) */}
        <button
          onClick={toggleLang}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          title={isAr ? 'التبديل إلى English' : 'التبديل إلى العربية'}
        >
          <Globe className="w-4 h-4 text-indigo-400" />
          <span className="uppercase text-[11px] font-bold">{lang === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* 5. Quick Screen Lock Button */}
        <button
          onClick={lock}
          className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
          title={isAr ? 'قفل لوحة التحكم (PIN)' : 'Lock Dashboard (PIN)'}
        >
          <Lock className="w-4.5 h-4.5 text-slate-400 hover:text-amber-400 transition-colors" />
        </button>

        {/* 6. Exit / Return to Boutique Button */}
        {onCloseAdmin && (
          <button
            onClick={onCloseAdmin}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
            title={isAr ? 'إغلاق لوحة الإدارة والعودة للمتجر' : 'Close Admin & Return to Store'}
            aria-label="Close Admin"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};
export default AdminHeader;

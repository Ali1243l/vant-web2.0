import React, { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Package,
  Ruler,
  Sparkles,
  Percent,
  Image as ImageIcon,
  Gift,
  Mail,
  Sliders,
  Globe,
  ShieldCheck,
  Download,
  KeyRound,
  Layers,
} from 'lucide-react';
import { useSiteControls } from '../context/SiteControlsContext';
import type { Product, Language, ProductAvailability } from '../types';
import {
  getAggregatedAnalytics,
  syncFromSupabaseCloud,
  type UserBehaviorStats,
} from '../lib/analytics';
import { getStoredSubscribers } from '../lib/newsletter';
const AdminAnalyticsDashboard = lazy(() => import('./AdminAnalyticsDashboard'));
const SocialLinksManager = lazy(() => import('./SocialLinksManager'));
const AdminNewsletterManager = lazy(() => import('./AdminNewsletterManager'));
const AdminOffersManager = lazy(() => import('./AdminOffersManager'));
const AdminSizesManager = lazy(() => import('./AdminSizesManager'));
const NewAdminApp = lazy(() => import('../admin/App'));
import AdminLockScreen from './admin_drawer/AdminLockScreen';
import AdminProductFormModal from './admin_drawer/AdminProductFormModal';
import AdminHeaderBar from './admin_drawer/AdminHeaderBar';
import AdminProductsManagerTab from './admin_drawer/AdminProductsManagerTab';
import AdminBackupTab from './admin_drawer/AdminBackupTab';
import AdminSecurityTab from './admin_drawer/AdminSecurityTab';
import AdminBannersStudioTab from './admin_drawer/AdminBannersStudioTab';
import AdminControlsTab from './admin_drawer/AdminControlsTab';
import { type TabType, type AdminNavGroup } from './admin_drawer/types';
import AdminSidebarNav from './admin_drawer/AdminSidebarNav';
import AdminSubTabsBar from './admin_drawer/AdminSubTabsBar';
const UIComponentsShowcase = lazy(() => import('./ui/UIComponentsShowcase'));

interface Props {
  lang?: Language;
}



export default function AdminDrawer({ lang = 'ar' }: Props) {
  const isAr = lang === 'ar';

  const {
    controls,
    toggleVisibility,
    updateControl,
    resetControl,
    resetAllControls,
    currencyCode,
    setCurrencyCode,
    formatPrice,
    products,
    loading,
    error: dbError,
    isLiveDatabase,
    lastSyncTime,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    resetProductsToDefault,
    exportAllDataJSON,
    importAllDataJSON,
    trendItems,
    updateTrendItem,
    resetTrendsToDefault,
    isAdminOpen,
    setIsAdminOpen,
    isAdminUnlocked,
    unlockAdmin,
    lockAdmin,
    setAdminPin,
    siteSettings,
    updateSiteSettings,
    isPreviewSplash,
    setIsPreviewSplash,
    isPreviewMaintenance,
    setIsPreviewMaintenance,
    isPreviewWelcomeModal,
    setIsPreviewWelcomeModal,
    isCloudSynced,
    syncAllToSupabaseCloud,
  } = useSiteControls();

  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [adminMode, setAdminMode] = useState<'new' | 'classic'>(() => {
    try {
      return (localStorage.getItem('vant_admin_interface_mode') as 'new' | 'classic') || 'new';
    } catch {
      return 'new';
    }
  });

  const toggleAdminMode = (mode: 'new' | 'classic') => {
    setAdminMode(mode);
    try {
      localStorage.setItem('vant_admin_interface_mode', mode);
    } catch {}
  };
  const [showTestsDropdown, setShowTestsDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const testsDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Group navigation definitions with live counts & badges
  const navGroups = useMemo<AdminNavGroup[]>(() => [
    {
      id: 'analytics_group',
      title: isAr ? 'التحليلات والمؤشرات' : 'Analytics & Insights',
      titleEn: 'Analytics',
      icon: BarChart3,
      items: [
        {
          id: 'analytics',
          label: isAr ? 'تحليل وسلوك الزوار المتقدم' : 'Behavior & Deep Analytics',
          labelEn: 'Analytics',
          icon: BarChart3,
          badge: null,
          description: isAr ? 'معدل التحويل، الزيارات المباشرة، وسلوك العملاء' : 'Conversion, visitors & telemetry',
        },
      ],
    },
    {
      id: 'catalog_group',
      title: isAr ? 'الكتالوج والمقاسات' : 'Catalog & Sizing',
      titleEn: 'Catalog & Sizing',
      icon: Package,
      items: [
        {
          id: 'products',
          label: isAr ? 'إدارة الكتالوج والمنتجات' : 'Catalog & Products',
          labelEn: 'Products',
          icon: Package,
          badge: products.length > 0 ? products.length : null,
          badgeColor: 'emerald',
          description: isAr ? 'إضافة وتعديل القطع، التوفر، وتحديث الأسعار' : 'Manage items, prices & availability',
        },
        {
          id: 'sizes',
          label: isAr ? 'دليل القياسات والأبعاد' : 'Size Guide & Specs',
          labelEn: 'Size Guide',
          icon: Ruler,
          badge: null,
          description: isAr ? 'جداول مقاسات الطول والوزن المعروضة للزبائن' : 'Height & weight size guidelines',
        },
      ],
    },
    {
      id: 'marketing_group',
      title: isAr ? 'العروض والتسويق' : 'Marketing & Offers',
      titleEn: 'Marketing & Offers',
      icon: Sparkles,
      items: [
        {
          id: 'offers',
          label: isAr ? 'التحكم بالعروض والخصومات' : 'Offers & Discounts',
          labelEn: 'Offers',
          icon: Percent,
          badge: products.filter((p) => p.is_offer).length > 0 ? products.filter((p) => p.is_offer).length : null,
          badgeColor: 'blue',
          description: isAr ? 'عروض التخفيض ونسب الخصم الحصرية' : 'Active discounts & deals',
        },
        {
          id: 'banners',
          label: isAr ? 'البانرات واستوديو النصوص' : 'Banners & Site Copy',
          labelEn: 'Banners & Copy',
          icon: ImageIcon,
          badge: null,
          description: isAr ? 'تخصيص بنر الترويسة والصور والنصوص الرئيسية' : 'Hero media, captions & studio',
        },
        {
          id: 'welcome_modal',
          label: isAr ? 'النافذة الترحيبية والخصم' : 'Welcome Modal & Voucher',
          labelEn: 'Welcome Popup',
          icon: Gift,
          badge: siteSettings.welcome_coupon_code || '15%',
          badgeColor: 'emerald',
          description: isAr ? 'كوبون الخصم الترحيبي عند فتح الموقع' : 'New visitor coupon & voucher popup',
        },
        {
          id: 'newsletter',
          label: isAr ? 'النشرة البريدية والعروض' : 'Newsletter & VIP',
          labelEn: 'Newsletter',
          icon: Mail,
          badge: getStoredSubscribers().length > 0 ? getStoredSubscribers().length : null,
          badgeColor: 'blue',
          description: isAr ? 'قائمة المشتركين وتصدير الإيميلات' : 'VIP subscribers & export',
        },
      ],
    },
    {
      id: 'design_group',
      title: isAr ? 'واجهة المتجر والتخصيص' : 'Store Appearance',
      titleEn: 'Controls & Appearance',
      icon: Sliders,
      items: [
        {
          id: 'controls',
          label: isAr ? 'أزرار الموقع والتفاعل' : 'Buttons & Interactive Controls',
          labelEn: 'Controls',
          icon: Sliders,
          badge: null,
          description: isAr ? 'أزرار واتساب، الاتصال، الإجراء السريع والفوتر' : 'Action buttons & store toggles',
        },
        {
          id: 'social',
          label: isAr ? 'روابط المنصات والفوتر' : 'Social & Footer Links',
          labelEn: 'Social Links',
          icon: Globe,
          badge: null,
          description: isAr ? 'إنستغرام، واتساب، تيك توك، تلغرام، وباقي القنوات' : 'Brand social profiles & icons',
        },
        {
          id: 'ui_components',
          label: isAr ? 'مكونات الواجهة (UI Kit)' : 'UI Kit Components',
          labelEn: 'UI Kit',
          icon: Layers,
          badge: '3 Primitives',
          badgeColor: 'purple',
          description: isAr ? 'معاينة تفاعلية لـ Pagination و DateRangePicker و RangeSlider' : 'Interactive Pagination, DatePicker & Slider showcase',
        },
      ],
    },
    {
      id: 'system_group',
      title: isAr ? 'النظام والأمان' : 'System & Security',
      titleEn: 'System & Security',
      icon: ShieldCheck,
      items: [
        {
          id: 'backup',
          label: isAr ? 'النسخ الاحتياطي والبيانات' : 'Backup & JSON Engine',
          labelEn: 'Backup',
          icon: Download,
          badge: null,
          description: isAr ? 'تصدير واستيراد الكتالوج وقاعدة البيانات كاملة' : 'Export & restore full database',
        },
        {
          id: 'security',
          label: isAr ? 'الأمان ورمز الدخول' : 'Security & PIN Access',
          labelEn: 'Security',
          icon: KeyRound,
          badge: null,
          description: isAr ? 'تغيير رمز المرور وقفل مركز العمليات' : 'Change credentials & access protection',
        },
      ],
    },
  ], [isAr, products, siteSettings.welcome_coupon_code]);

  // Find active group based on current active tab
  const currentActiveGroup = useMemo(() => {
    return navGroups.find((g) => g.items.some((item) => item.id === activeTab)) || navGroups[0];
  }, [navGroups, activeTab]);



  // Close dropdown menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (testsDropdownRef.current && !testsDropdownRef.current.contains(e.target as Node)) {
        setShowTestsDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(false);
  // Live Analytics Telemetry State
  const [analyticsStats, setAnalyticsStats] = useState<UserBehaviorStats>(() => getAggregatedAnalytics(products));

  // Lock background page scrollbars completely when Admin Command Center is open
  useEffect(() => {
    if (isAdminOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isAdminOpen]);

  useEffect(() => {
    if (!isAdminOpen) return;
    const handleAnalyticsUpdate = () => {
      setTimeout(() => {
        setAnalyticsStats(getAggregatedAnalytics(products));
      }, 0);
    };
    window.addEventListener('vant_analytics_updated', handleAnalyticsUpdate);
    const interval = setInterval(() => {
      handleAnalyticsUpdate();
    }, 15000);

    // Auto-sync from Supabase cloud when drawer is active on analytics
    if (activeTab === 'analytics') {
      syncFromSupabaseCloud().then(() => {
        setAnalyticsStats(getAggregatedAnalytics(products));
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('vant_analytics_updated', handleAnalyticsUpdate);
      clearInterval(interval);
    };
  }, [products, isAdminOpen, activeTab]);

  // Keep analytics fresh when admin drawer opens
  useEffect(() => {
    if (isAdminOpen) {
      setAnalyticsStats(getAggregatedAnalytics(products));
    }
  }, [isAdminOpen, products]);

  // Catalog CMS State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form State for Add / Edit Product
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formPrice, setFormPrice] = useState<number>(95000);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(115000);
  const [formIsOffer, setFormIsOffer] = useState<boolean>(false);
  const [formOfferBadgeAr, setFormOfferBadgeAr] = useState('عرض خاص');
  const [formOfferBadgeEn, setFormOfferBadgeEn] = useState('Special Offer');
  const [formCategory, setFormCategory] = useState('Tailoring');
  const [formCategoryAr, setFormCategoryAr] = useState('الأزياء الرسمية');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formExtraImages, setFormExtraImages] = useState('');
  const [formImagesList, setFormImagesList] = useState<string[]>([]);
  const [formAvailability, setFormAvailability] = useState<ProductAvailability>('in_stock');
  const [formTags, setFormTags] = useState('');
  const [formDescAr, setFormDescAr] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formMaterial, setFormMaterial] = useState('');
  const [formSizes, setFormSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const success = unlockAdmin(passwordInput.trim());
    if (success) {
      setPasswordError(false);
      setPasswordInput('');
    } else {
      setPasswordError(true);
    }
  };

  const handleOpenAddModal = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    setFormTitleAr('');
    setFormTitleEn('');
    setFormPrice(95000);
    setFormOriginalPrice(115000);
    setFormIsOffer(false);
    setFormOfferBadgeAr('عرض خاص');
    setFormOfferBadgeEn('Special Offer');
    setFormCategory('Tailoring');
    setFormCategoryAr('الأزياء الرسمية');
    setFormImageUrl('');
    setFormExtraImages('');
    setFormImagesList([]);
    setFormAvailability('in_stock');
    setFormTags('');
    setFormDescAr('');
    setFormDescEn('');
    setFormMaterial('');
    setFormSizes(['S', 'M', 'L', 'XL']);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setIsAddingNew(false);
    setFormTitleAr(p.title_ar || p.title);
    setFormTitleEn(p.title);
    setFormPrice(p.price);
    setFormOriginalPrice(p.original_price || Math.round(p.price * 1.25));
    setFormIsOffer(Boolean(p.is_offer));
    setFormOfferBadgeAr(p.offer_badge_ar || 'عرض خاص');
    setFormOfferBadgeEn(p.offer_badge_en || 'Special Offer');
    setFormCategory(p.category);
    setFormCategoryAr(p.category_ar || p.category);
    const initialImages = p.images && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : []);
    setFormImageUrl(p.image_url || initialImages[0] || '');
    setFormExtraImages(initialImages.slice(1).join('\n'));
    setFormImagesList(initialImages);
    setFormAvailability(p.availability || 'in_stock');
    setFormTags((p.tags || []).join(', '));
    setFormDescAr(p.description_ar || p.description || '');
    setFormDescEn(p.description || '');
    setFormMaterial(p.material || '');
    setFormSizes(p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL']);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryImg = formImageUrl.trim() || formImagesList[0] || '';
    const allImages = formImagesList.length > 0 ? formImagesList : (primaryImg ? [primaryImg] : []);

    const cleanTags = formTags
      .split(/[,،]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const productPayload: Omit<Product, 'id'> = {
      title: formTitleEn.trim() || formTitleAr.trim(),
      title_ar: formTitleAr.trim() || formTitleEn.trim(),
      price: Number(formPrice),
      original_price: formIsOffer ? Number(formOriginalPrice) : undefined,
      is_offer: formIsOffer,
      offer_badge_ar: formIsOffer ? formOfferBadgeAr.trim() : undefined,
      offer_badge_en: formIsOffer ? formOfferBadgeEn.trim() : undefined,
      category: formCategory.trim(),
      category_ar: formCategoryAr.trim(),
      image_url: primaryImg,
      images: allImages,
      availability: formAvailability,
      tags: cleanTags,
      description: formDescEn.trim(),
      description_ar: formDescAr.trim(),
      material: formMaterial.trim(),
      sizes: formSizes.length > 0 ? formSizes : ['M', 'L'],
    };

    if (isAddingNew) {
      addProduct(productPayload);
    } else if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
    }

    setEditingProduct(null);
    setIsAddingNew(false);
  };

  return (
    <Suspense fallback={<div role="status" className="fixed inset-0 z-[9999] bg-slate-950 text-white grid place-items-center">{isAr ? 'جاري تحميل الإدارة…' : 'Loading administration…'}</div>}>
    <AnimatePresence>
      {isAdminOpen && (
        <motion.div
          key="admin-drawer-root"
          initial={{ opacity: 0, scale: 0.985, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.985, y: 14 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col bg-[#08090d] text-[#f3f4f6] overflow-hidden select-none font-sans"
        >
          {/* Only show top operations command header when authenticated/unlocked */}
        {isAdminUnlocked && adminMode === "classic" && (
          <AdminHeaderBar
            isAr={isAr}
            siteSettings={siteSettings}
            updateSiteSettings={updateSiteSettings}
            controls={controls}
            toggleVisibility={toggleVisibility}
            analyticsStats={analyticsStats}
            isSyncing={isSyncing}
            setIsSyncing={setIsSyncing}
            setSyncToast={setSyncToast}
            syncAllToSupabaseCloud={syncAllToSupabaseCloud}
            showTestsDropdown={showTestsDropdown}
            setShowTestsDropdown={setShowTestsDropdown}
            testsDropdownRef={testsDropdownRef}
            setIsPreviewSplash={setIsPreviewSplash}
            setIsPreviewMaintenance={setIsPreviewMaintenance}
            setIsPreviewWelcomeModal={setIsPreviewWelcomeModal}
            adminMode={adminMode}
            toggleAdminMode={toggleAdminMode}
            currencyCode={currencyCode}
            setCurrencyCode={setCurrencyCode}
            lockAdmin={lockAdmin}
            onClose={() => setIsAdminOpen(false)}
          />
        )}

        {/* Locked Screen View (Discreet, Zero Info Leaks, Elegant Exit) */}
        {!isAdminUnlocked ? (
          <AdminLockScreen
            isAr={isAr}
            passwordInput={passwordInput}
            setPasswordInput={setPasswordInput}
            passwordError={passwordError}
            setPasswordError={setPasswordError}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleUnlock={handleUnlock}
            onClose={() => setIsAdminOpen(false)}
          />
        ) : (adminMode as string) === 'new' ? (
          /* New Modern Modular Admin Interface from GitHub */
          <div className="flex-1 overflow-y-auto bg-slate-950">
            <NewAdminApp onClose={() => setIsAdminOpen(false)} />
          </div>
        ) : (
          /* Unlocked Full-Screen Operations Dashboard */
          <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
            {/* Sidebar Command Navigation Tabs (Responsive: Grouped Accordions on Desktop, Mobile Dropdown + Pills on Mobile) */}
            <AdminSidebarNav
              isAr={isAr}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              navGroups={navGroups}
              currentActiveGroup={currentActiveGroup}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              mobileMenuRef={mobileMenuRef}
              siteSettings={siteSettings}
              updateSiteSettings={updateSiteSettings}
              controls={controls}
              toggleVisibility={toggleVisibility}
            />

            {/* Main Center Content Viewport */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0c0e15]">
              {/* Group Secondary Sub-Tabs Nav Bar (Integrated Header for Multi-item Sections) */}
              <AdminSubTabsBar
                currentActiveGroup={currentActiveGroup}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {/* TAB 1: DEEP BEHAVIORAL ANALYTICS & INTELLIGENCE SUITE */}
              {activeTab === 'analytics' && (
                <div className="space-y-6 max-w-6xl mx-auto">
                  <AdminAnalyticsDashboard
                    stats={analyticsStats}
                    products={products}
                    isAr={isAr}
                    onRefresh={async () => {
                      await syncFromSupabaseCloud();
                      setAnalyticsStats(getAggregatedAnalytics(products));
                    }}
                  />
                </div>
              )}

              {/* TAB 2: CATALOG & SPECIAL OFFERS CMS */}
              {activeTab === "products" && (
                <AdminProductsManagerTab
                  isAr={isAr}
                  products={products}
                  refreshProducts={refreshProducts}
                  addProduct={addProduct}
                  updateProduct={updateProduct}
                  deleteProduct={deleteProduct}
                  toggleProductAvailability={toggleProductAvailability}
                  handleOpenAddModal={handleOpenAddModal}
                  handleOpenEditModal={handleOpenEditModal}
                  analyticsStats={analyticsStats}
                />
              )}

              {/* TAB 2.2: MASTER SIZES & MEASUREMENTS CONTROL CENTER */}
              {activeTab === 'sizes' && (
                <div className="max-w-6xl mx-auto">
                  <AdminSizesManager isAr={isAr} />
                </div>
              )}

              {/* TAB 2.5: OFFERS & DISCOUNTS CONTROL CENTER */}
              {activeTab === 'offers' && (
                <div className="max-w-6xl mx-auto">
                  <AdminOffersManager
                    isAr={isAr}
                    onNavigateToStoreOffers={() => {
                      setIsAdminOpen(false);
                      // Trigger offers filter in store lookbook
                      const offersBtn = document.querySelector('[role="tab"][aria-selected="false"]') as HTMLElement;
                      if (offersBtn && offersBtn.innerText.includes('العروض')) {
                        offersBtn.click();
                      }
                    }}
                  />
                </div>
              )}

              {/* TAB 3: BANNERS & SITE COPY STUDIO */}
              {activeTab === "banners" && (
                <AdminBannersStudioTab isAr={isAr} />
              )}

              {/* TAB 3.5: SOCIAL & GLOBAL PLATFORMS */}
              {activeTab === 'social' && (
                <div className="max-w-6xl mx-auto">
                  <SocialLinksManager isAr={isAr} />
                </div>
              )}

              {/* TAB 4: BUTTONS & INTERACTIVE CONTROLS */}
              {activeTab === "controls" && (
                <AdminControlsTab isAr={isAr} />
              )}

              {/* TAB 5: BACKUP & MULTI-FORMAT EXPORT ENGINE */}
              {activeTab === "backup" && (
                <AdminBackupTab
                  isAr={isAr}
                  products={products}
                  exportAllDataJSON={exportAllDataJSON}
                  importAllDataJSON={importAllDataJSON}
                />
              )}

              {/* TAB: NEWSLETTER SUBSCRIBERS & VIP CAMPAIGNS */}
              {activeTab === 'newsletter' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  <AdminNewsletterManager lang={isAr ? 'ar' : 'en'} embedded={true} initialTab="subscribers" />
                </div>
              )}

              {/* TAB: WELCOME MODAL & VIP VOUCHER SETTINGS */}
              {activeTab === 'welcome_modal' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  <AdminNewsletterManager lang={isAr ? 'ar' : 'en'} embedded={true} initialTab="welcome_settings" />
                </div>
              )}

              {/* TAB 6: SECURITY & PASSWORD */}
              {activeTab === "security" && (
                <AdminSecurityTab isAr={isAr} />
              )}

              {/* TAB 7: VANT UI KIT COMPONENTS SHOWCASE */}
              {activeTab === 'ui_components' && (
                <div className="max-w-5xl mx-auto">
                  <UIComponentsShowcase lang={isAr ? 'ar' : 'en'} />
                </div>
              )}
            </main>
          </div>
        )}

        {/* ADD / EDIT PRODUCT MODAL */}
        <AdminProductFormModal
          isOpen={Boolean(isAddingNew || editingProduct)}
          isAddingNew={isAddingNew}
          editingProduct={editingProduct}
          isAr={isAr}
          formTitleAr={formTitleAr}
          setFormTitleAr={setFormTitleAr}
          formTitleEn={formTitleEn}
          setFormTitleEn={setFormTitleEn}
          formPrice={formPrice}
          setFormPrice={setFormPrice}
          formOriginalPrice={formOriginalPrice}
          setFormOriginalPrice={setFormOriginalPrice}
          formIsOffer={formIsOffer}
          setFormIsOffer={setFormIsOffer}
          formOfferBadgeAr={formOfferBadgeAr}
          setFormOfferBadgeAr={setFormOfferBadgeAr}
          formOfferBadgeEn={formOfferBadgeEn}
          setFormOfferBadgeEn={setFormOfferBadgeEn}
          formCategory={formCategory}
          setFormCategory={setFormCategory}
          formCategoryAr={formCategoryAr}
          setFormCategoryAr={setFormCategoryAr}
          formAvailability={formAvailability}
          setFormAvailability={setFormAvailability}
          formImagesList={formImagesList}
          setFormImagesList={setFormImagesList}
          formImageUrl={formImageUrl}
          setFormImageUrl={setFormImageUrl}
          setFormExtraImages={setFormExtraImages}
          formSizes={formSizes}
          setFormSizes={setFormSizes}
          formMaterial={formMaterial}
          setFormMaterial={setFormMaterial}
          formDescAr={formDescAr}
          setFormDescAr={setFormDescAr}
          formDescEn={formDescEn}
          setFormDescEn={setFormDescEn}
          handleSaveProductForm={handleSaveProductForm}
          onClose={() => {
            setIsAddingNew(false);
            setEditingProduct(null);
          }}
        />
        </motion.div>
      )}
    </AnimatePresence>
    </Suspense>
  );
}

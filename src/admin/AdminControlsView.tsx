import React, { useState } from 'react';
import { useAdminBridge } from './useAdminBridge';
import { useSiteControls, type SiteControlItem, DEFAULT_SITE_CONTROLS } from '../context/SiteControlsContext';
import { uploadImageToSupabase, fileToOptimizedDataUrl } from '../lib/storage';
import {
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Upload,
  Loader2,
  Search,
  MessageCircle,
  Share2,
  Copy,
  Ruler,
  Truck,
  ArrowUp,
  Heart,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Phone,
  Tag,
  Monitor,
  ShoppingCart,
  Power,
} from 'lucide-react';

interface PreviewProps {
  item: SiteControlItem;
  previewTheme: 'dark' | 'light';
  previewLang: 'ar' | 'en';
}

const ControlLivePreview: React.FC<PreviewProps> = ({ item, previewTheme, previewLang }) => {
  const isAr = previewLang === 'ar';
  const label = isAr ? item.label_ar || item.name_ar : item.label_en || item.name_en;
  const isDark = previewTheme === 'dark';

  return (
    <div
      className={`relative w-full rounded-xl p-4 overflow-hidden border transition-all duration-300 ${
        isDark
          ? 'bg-[#0e121a] border-slate-800 text-slate-100 shadow-inner'
          : 'bg-[#f8f9fa] border-slate-200 text-slate-900 shadow-inner'
      }`}
    >
      {/* Mini Mockup Window Header */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-black/5 dark:border-white/10 text-[10.5px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-red-400/80" />
          <span className="w-2 h-2 rounded-full bg-amber-400/80" />
          <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
          <span className="font-mono text-[10px] ms-1 text-slate-400 font-semibold">
            {isAr ? 'المعاينة الحية للزر كما يظهر للعميل' : 'Live Storefront Button Preview'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-md font-mono text-[9.5px] font-bold ${
              item.visible !== false && item.enabled !== false
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {item.visible !== false && item.enabled !== false
              ? isAr ? 'معروض للزوار' : 'Visible'
              : isAr ? 'مخفي ومعطل' : 'Hidden'}
          </span>
        </div>
      </div>

      {/* Render the Exact Live Element Mockup */}
      <div className="relative flex items-center justify-center min-h-[72px] py-2">
        {/* If control is toggled OFF, display informative translucent overlay */}
        {(item.visible === false || item.enabled === false) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-[2px] rounded-lg border border-rose-500/30 p-2 text-center animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
              <EyeOff className="w-4 h-4" />
              <span>{isAr ? 'معطل ومخفي من واجهة الموقع' : 'Disabled & Hidden from Storefront'}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {isAr ? 'انقر على مفتاح التفعيل بالأعلى لإظهاره فوراً' : 'Toggle power switch to re-enable'}
            </span>
          </div>
        )}

        {/* Dynamic Mock Element based on control ID and Category */}
        <div className={`transition-all duration-200 ${(item.visible === false || item.enabled === false) ? 'opacity-35 pointer-events-none filter blur-[0.5px]' : ''}`}>
          {/* Add to Cart Button */}
          {item.id === 'btn_product_add_to_cart' && (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-[#004ad7] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#004ad7]/30"
            >
              <ShoppingCart className="w-4.5 h-4.5 stroke-[2]" />
              <span>{label || (isAr ? 'أضف للسلة' : 'Add to Cart')}</span>
            </button>
          )}

          {/* Cart Animation & Blinkit Counter Preview */}
          {item.id === 'enableCartAnimation' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-between w-48 h-10 px-2.5 rounded-xl bg-[#004ad7] text-white shadow-md">
                <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">-</span>
                <span className="font-mono font-bold text-sm">1 {isAr ? 'بالسلة' : 'in cart'}</span>
                <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">+</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {isAr ? 'أنيميشن 60fps' : '60fps animation'}
              </span>
            </div>
          )}

          {/* Header Cart Icon */}
          {item.id === 'btn_header_cart' && (
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#004ad7] text-white shadow-md">
                <ShoppingCart className="w-5 h-5 stroke-[2]" />
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-400 px-1 text-[9px] font-extrabold text-white">
                  3
                </span>
              </div>
              <span className="text-xs text-slate-300 font-bold">{label || (isAr ? 'سلة التسوق' : 'Shopping Cart')}</span>
            </div>
          )}

          {/* WhatsApp Product Button */}
          {item.id === 'btn_product_whatsapp' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-[#004ad7]/30 bg-[#004ad7]/10 text-[#004ad7] dark:text-[#60a5fa] text-xs sm:text-sm font-bold shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-[#004ad7]/20 stroke-[#004ad7] dark:stroke-[#60a5fa] stroke-[2]" />
                <span>{label || (isAr ? 'استفسار عبر واتساب' : 'Inquire via WhatsApp')}</span>
              </button>
            </div>
          )}

          {/* Size Guide Button */}
          {item.id === 'btn_product_size_guide' && (
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#004ad7] dark:text-[#3b82f6] border border-black/10 dark:border-white/10 shadow-2xs ${
                isDark ? 'bg-white/[0.05]' : 'bg-black/[0.03]'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>{label || (isAr ? 'دليل القياسات الذكي' : 'Smart Fit Guide')}</span>
            </button>
          )}

          {/* Bespoke Button */}
          {item.id === 'btn_product_bespoke' && (
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{label || (isAr ? 'طلب تفصيل خاص عبر واتساب' : 'Inquire Bespoke on WhatsApp')}</span>
            </button>
          )}

          {/* Share Link */}
          {item.id === 'btn_product_share' && (
            <button
              type="button"
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{label || (isAr ? 'مشاركة' : 'Share')}</span>
            </button>
          )}

          {/* Copy Title */}
          {item.id === 'btn_product_copy' && (
            <button
              type="button"
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{label || (isAr ? 'نسخ الاسم' : 'Copy Title')}</span>
            </button>
          )}

          {/* Delivery Badge */}
          {item.id === 'sec_product_delivery_badge' && (
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
              <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{label || (isAr ? 'توصيل سريع لكافة المحافظات' : 'Nationwide Fast Delivery')}</span>
            </div>
          )}

          {/* Craft Badge */}
          {item.id === 'sec_product_craft_badge' && (
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{label || (isAr ? 'تفصيل فاخر وقصة إيطالية' : 'Luxury Italian Tailoring')}</span>
            </div>
          )}

          {/* Header Wishlist */}
          {item.id === 'btn_header_wishlist' && (
            <div className="flex items-center gap-1.5 p-2 rounded-full bg-slate-800 text-rose-400 border border-slate-700">
              <Heart className="w-4 h-4 fill-rose-500/30" />
              <span className="text-xs font-bold px-1">{label || (isAr ? 'المفضلة' : 'Wishlist')}</span>
            </div>
          )}

          {/* Header Search */}
          {item.id === 'btn_header_search' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs">
              <Search className="w-3.5 h-3.5" />
              <span>{label || (isAr ? 'بحث' : 'Search')}</span>
            </div>
          )}

          {/* Header Lang */}
          {item.id === 'btn_header_lang' && (
            <div className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold">
              {label || 'EN / عربي'}
            </div>
          )}

          {/* Header Theme */}
          {item.id === 'btn_header_theme' && (
            <div className="p-2 rounded-full bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
          )}

          {/* Back to Top Floating Button */}
          {item.id === 'btn_floating_back_to_top' && (
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
              <ArrowUp className="w-5 h-5" />
            </div>
          )}

          {/* Fallback for other items */}
          {![
            'btn_product_add_to_cart',
            'enableCartAnimation',
            'btn_header_cart',
            'btn_product_whatsapp',
            'btn_product_size_guide',
            'btn_product_bespoke',
            'btn_product_share',
            'btn_product_copy',
            'sec_product_delivery_badge',
            'sec_product_craft_badge',
            'btn_header_wishlist',
            'btn_header_search',
            'btn_header_lang',
            'btn_header_theme',
            'btn_floating_back_to_top',
          ].includes(item.id) && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>{label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AdminControlsView: React.FC = () => {
  const { lang: adminLang } = useAdminBridge();
  const isAr = adminLang === 'ar';

  const { controls, updateControl, resetControl, resetAllControls } = useSiteControls();

  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [previewLang, setPreviewLang] = useState<'ar' | 'en'>('ar');
  const [uploadingControlId, setUploadingControlId] = useState<string | null>(null);

  // Accordion expansion state per functional feature group
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    cart: true,
    whatsapp: true,
    wishlist: false,
    size_bespoke: false,
    search_filter: false,
    hero_banner: false,
    product_info: false,
    brand_footer: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const toggleCategoryExpand = (catKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  const expandAllCategories = () => {
    setExpandedCategories({
      cart: true,
      whatsapp: true,
      wishlist: true,
      size_bespoke: true,
      search_filter: true,
      hero_banner: true,
      product_info: true,
      brand_footer: true,
    });
  };

  const collapseAllCategories = () => {
    setExpandedCategories({
      cart: false,
      whatsapp: false,
      wishlist: false,
      size_bespoke: false,
      search_filter: false,
      hero_banner: false,
      product_info: false,
      brand_footer: false,
    });
  };

  const getItemCategory = (item: SiteControlItem): string => {
    const defCat = DEFAULT_SITE_CONTROLS[item.id]?.category;
    if (defCat) return defCat;

    if (item.category === 'header' || item.category === 'global' || item.category === 'footer') return 'brand_footer';
    if (item.category === 'product' || item.category === 'card') return 'product_info';
    if (item.category === 'banner') return 'hero_banner';
    if (item.category === 'filter') return 'search_filter';

    return item.category || 'brand_footer';
  };

  // Master group toggle logic
  const handleMasterCategoryToggle = (categoryKey: string) => {
    const itemsInCategory = Object.values(controls).filter((item) => {
      return getItemCategory(item) === categoryKey;
    });
    const anyActive = itemsInCategory.some((item) => item.visible !== false && item.enabled !== false);
    
    const nextState = !anyActive;
    
    itemsInCategory.forEach((item) => {
      updateControl(item.id, {
        visible: nextState,
        enabled: nextState,
      });
    });

    const catInfo = CATEGORY_GROUPS.find((c) => c.key === categoryKey);
    const catName = isAr ? catInfo?.title_ar : catInfo?.title_en;

    showToast(
      nextState
        ? (isAr ? `✓ تم تشغيل جميع عناصر ${catName}` : `Enabled all ${catName} controls`)
        : (isAr ? `✕ تم تعطيل جميع عناصر ${catName}` : `Disabled all ${catName} controls`)
    );
  };

  const toggleVisibility = (id: string) => {
    const current = controls[id];
    const isCurrentlyVisible = current?.visible !== false && current?.enabled !== false;
    const nextState = !isCurrentlyVisible;
    updateControl(id, {
      visible: nextState,
      enabled: nextState,
    });
  };

  const controlsList = Object.values(controls);

  // FUNCTIONAL FEATURE GROUPS DEFINITIONS
  const CATEGORY_GROUPS = [
    {
      key: 'cart',
      title_ar: '1. مجموعة ميزة سلة التسوق والشراء',
      title_en: '1. Shopping Cart & Purchasing Feature Group',
      description_ar: 'زر أضف للسلة والعداد الحركي، أيقونة السلة بالترويسة، وأنيميشن طيران الصورة',
      description_en: 'Add to Cart button & counter, Header Cart icon & drawer, Cart fly animation',
      icon: ShoppingCart,
    },
    {
      key: 'whatsapp',
      title_ar: '2. مجموعة ميزة الطلب والاستفسار عبر واتساب',
      title_en: '2. Direct WhatsApp Order & Inquiry Feature Group',
      description_ar: 'زر الاستفسار المباشر بصفحة القطعة ورقم الواتساب الرسمي للمبيعات',
      description_en: 'Direct WhatsApp inquiry button on product details & sales phone number',
      icon: MessageCircle,
    },
    {
      key: 'wishlist',
      title_ar: '3. مجموعة ميزة المفضلة والقطع المحفوظة',
      title_en: '3. Wishlist & Favorites Feature Group',
      description_ar: 'أيقونة المفضلة بالترويسة العلويّة وأيقونات القلوب الزجاجية على كروت المعروضات',
      description_en: 'Header wishlist icon filter & floating heart buttons on catalog product cards',
      icon: Heart,
    },
    {
      key: 'size_bespoke',
      title_ar: '4. مجموعة دليل القياسات والتفصيل الخاص',
      title_en: '4. Fit Guide & Bespoke Tailoring Feature Group',
      description_ar: 'حاسبة الطول والوزن، جدول المقاسات، وزر الخياطة والتفصيل الخاص Concierge',
      description_en: 'Smart fit recommender calculator, size guide table, & bespoke concierge button',
      icon: Ruler,
    },
    {
      key: 'search_filter',
      title_ar: '5. مجموعة ميزة البحث والتصفية والفلترة',
      title_en: '5. Search & Catalog Filters Feature Group',
      description_ar: 'زر البحث بالترويسة، شريط تصنيفات الكتالوج، فلاتر حالة التوفر والعروض الخاصة',
      description_en: 'Header search trigger, category pills bar, stock availability & offer filters',
      icon: Search,
    },
    {
      key: 'hero_banner',
      title_ar: '6. مجموعة البنر الترحيبي وسكشن التريند',
      title_en: '6. Welcome Hero Banner & Trends Feature Group',
      description_ar: 'البنر الرئيسي، العناوين الترحيبية، أزرار التصفح، وشريط كروت تريند الموسم',
      description_en: 'Main hero cover image, headline text, action CTA, and trend cards carousel',
      icon: Sparkles,
    },
    {
      key: 'product_info',
      title_ar: '7. مجموعة معلومات وشارات المنتج والمشاركة',
      title_en: '7. Product Badges, Shares, & Info Group',
      description_ar: 'شارات الخصم والتوفر، السعر، المشاركة، النسخ، التوصيل السريع، ومعاينة الماوس',
      description_en: 'Status/discount badges, price tags, share link, copy title, & delivery badges',
      icon: Tag,
    },
    {
      key: 'brand_footer',
      title_ar: '8. مجموعة الهوية والشريط السفلي',
      title_en: '8. Brand Identity & Footer Feature Group',
      description_ar: 'زر اللغة، الوضع الليلي، اللوجو الحركي، العودة للأعلى، والنشرة البريدية VIP',
      description_en: 'Language, dark/light theme, kinetic logo, back-to-top button, & VIP newsletter',
      icon: Monitor,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification Floating Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-medium text-xs shadow-2xl border border-indigo-400/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* View Title & Master Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">
              {isAr ? 'لوحة التحكم الشاملة بمجموعات المزايا والأزرار' : 'Functional Feature Groups & Storefront Controls'}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'تجميع المزايا والأزرار في مجموعات وظيفية متكاملة لتعطيل الميزة بكاملها أو تخصيص زر بزر'
              : 'Controls organized by functional feature groups to enable/disable entire features or fine-tune individual buttons'}
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={expandAllCategories}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors border border-slate-700"
          >
            {isAr ? 'توسيع كافة المجموعات' : 'Expand All'}
          </button>
          <button
            type="button"
            onClick={collapseAllCategories}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors border border-slate-700"
          >
            {isAr ? 'طي كافة المجموعات' : 'Collapse All'}
          </button>
          <button
            type="button"
            onClick={() => {
              resetAllControls();
              showToast(isAr ? '✓ تمت استعادة جميع الأزرار والمزايا للافتراضي' : 'Reset all controls');
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Preview Settings & Quick Search */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold">{isAr ? 'نمط المعاينة الحية:' : 'Live Preview:'}</span>
            {/* Dark / Light Preview Mode Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewTheme('dark')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  previewTheme === 'dark'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>{isAr ? 'المظهر الداكن' : 'Dark'}</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme('light')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  previewTheme === 'light'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>{isAr ? 'المظهر الفاتح' : 'Light'}</span>
              </button>
            </div>

            {/* Preview Lang Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewLang('ar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  previewLang === 'ar'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  previewLang === 'en'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث سريع عن أي ميزة أو زر بالاسم...' : 'Search features & buttons...'}
              className="w-full ps-9 pe-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ACCORDION DROPDOWN FUNCTIONAL FEATURE GROUPS */}
      <div className="space-y-4">
        {CATEGORY_GROUPS.map((cat) => {
          const CatIcon = cat.icon;
          const itemsInCategory = controlsList.filter((item) => {
            if (getItemCategory(item) !== cat.key) return false;
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
              item.id.toLowerCase().includes(q) ||
              (item.name_ar && item.name_ar.toLowerCase().includes(q)) ||
              (item.name_en && item.name_en.toLowerCase().includes(q)) ||
              (item.label_ar && item.label_ar.toLowerCase().includes(q)) ||
              (item.label_en && item.label_en.toLowerCase().includes(q))
            );
          });

          if (search.trim() && itemsInCategory.length === 0) return null;

          const isExpanded = search.trim() ? true : !!expandedCategories[cat.key];
          const activeCount = itemsInCategory.filter((i) => i.visible !== false && i.enabled !== false).length;
          const totalCount = itemsInCategory.length;
          const isAllActive = activeCount === totalCount && totalCount > 0;
          const isAnyActive = activeCount > 0;

          return (
            <div
              key={cat.key}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-lg transition-all"
            >
              {/* Accordion Group Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 border-b border-slate-800/80">
                <button
                  type="button"
                  onClick={() => toggleCategoryExpand(cat.key)}
                  className="flex items-center gap-3 flex-1 text-start cursor-pointer group"
                >
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {isAr ? cat.title_ar : cat.title_en}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isAllActive
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : isAnyActive
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {activeCount} / {totalCount} {isAr ? 'مفعل' : 'Active'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {isAr ? cat.description_ar : cat.description_en}
                    </p>
                  </div>
                </button>

                {/* Master Group Action Switch & Expand Toggle */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleMasterCategoryToggle(cat.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border shadow-sm ${
                      isAnyActive
                        ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30'
                        : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>
                      {isAnyActive
                        ? isAr ? 'إيقاف هذه الميزة بالكامل' : 'Disable Entire Feature'
                        : isAr ? 'تفعيل هذه الميزة بالكامل' : 'Enable Entire Feature'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCategoryExpand(cat.key)}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Accordion Items List Body */}
              {isExpanded && (
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 bg-slate-950/40">
                  {itemsInCategory.map((item) => {
                    const isVisible = item.visible !== false && item.enabled !== false;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isVisible
                            ? 'bg-slate-900/90 border-slate-800 shadow-md'
                            : 'bg-slate-950/70 border-slate-900 opacity-80'
                        }`}
                      >
                        <div>
                          {/* Card Header: Meta + Toggle */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                  {item.id}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    isVisible
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                  }`}
                                >
                                  {isVisible ? (isAr ? 'مفعل ومعروض' : 'Active') : (isAr ? 'معطل ومخفي' : 'Disabled')}
                                </span>
                              </div>

                              <h3 className="text-sm font-bold text-white mt-1.5 truncate">
                                {isAr ? item.name_ar || item.label_ar : item.name_en || item.label_en}
                              </h3>

                              {item.description_ar && (
                                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                  {isAr ? item.description_ar : item.description_en || item.description_ar}
                                </p>
                              )}
                            </div>

                            {/* Individual Eye Toggle Button */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  toggleVisibility(item.id);
                                  showToast(
                                    isVisible
                                      ? isAr
                                        ? `تم تعطيل وإخفاء: ${item.name_ar || item.id}`
                                        : `Disabled ${item.name_en || item.id}`
                                      : isAr
                                      ? `تم تشغيل وإظهار: ${item.name_ar || item.id}`
                                      : `Enabled ${item.name_en || item.id}`
                                  );
                                }}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isVisible
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'
                                }`}
                                title={
                                  isVisible
                                    ? isAr ? 'انقر للتعطيل والإخفاء من المتجر' : 'Click to disable'
                                    : isAr ? 'انقر للتشغيل والإظهار في المتجر' : 'Click to enable'
                                }
                              >
                                {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                <span className="text-xs font-bold hidden sm:inline">
                                  {isVisible ? (isAr ? 'مفعل' : 'Active') : (isAr ? 'معطل' : 'Off')}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* LIVE INTERACTIVE PREVIEW BOX */}
                          <div className="my-3">
                            <ControlLivePreview
                              item={item}
                              previewTheme={previewTheme}
                              previewLang={previewLang}
                            />
                          </div>
                        </div>

                        {/* Editable Fields Section */}
                        <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                                {isAr ? 'النص التفاعلي بالعربية' : 'Arabic Label'}
                              </label>
                              <input
                                type="text"
                                value={item.label_ar || ''}
                                onChange={(e) => updateControl(item.id, { label_ar: e.target.value })}
                                placeholder="النص بالعربية..."
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 outline-none transition-colors"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                                {isAr ? 'النص التفاعلي بالإنجليزية' : 'English Label'}
                              </label>
                              <input
                                type="text"
                                value={item.label_en || ''}
                                onChange={(e) => updateControl(item.id, { label_en: e.target.value })}
                                placeholder="Label in English..."
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 outline-none transition-colors"
                              />
                            </div>
                          </div>

                          {/* Action Value or Upload Field */}
                          {item.actionValue !== undefined && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-medium text-slate-400">
                                  {item.id.includes('phone')
                                    ? isAr ? 'رقم هاتف الواتساب الدولي (+964...)' : 'International Phone (+964...)'
                                    : item.id.includes('bg') || item.id.includes('image')
                                    ? isAr ? 'رابط الصورة أو رفع ملف مباشر' : 'Image URL or Upload File'
                                    : isAr ? 'قيمة الإجراء أو الرابط المستهدف' : 'Action Target URL'}
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={item.actionValue || ''}
                                  onChange={(e) => updateControl(item.id, { actionValue: e.target.value })}
                                  placeholder={item.id.includes('phone') ? '+9647XXXXXXXXX' : '#section or https://...'}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none transition-colors"
                                />
                                {(item.id.includes('bg') ||
                                  item.id.includes('image') ||
                                  item.id.includes('banner') ||
                                  item.id.includes('logo') ||
                                  (item.actionValue && item.actionValue.includes('http'))) && (
                                  <label className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                                    {uploadingControlId === item.id ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                        <span>...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>{isAr ? 'رفع ملف' : 'Upload'}</span>
                                      </>
                                    )}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={uploadingControlId === item.id}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setUploadingControlId(item.id);
                                          try {
                                            const url = await uploadImageToSupabase(file, 'controls');
                                            if (url) {
                                              updateControl(item.id, { actionValue: url });
                                              showToast(isAr ? '✓ تم رفع الصورة كملف بنجاح' : 'Image uploaded');
                                            }
                                          } catch {
                                            const fallback = await fileToOptimizedDataUrl(file);
                                            updateControl(item.id, { actionValue: fallback });
                                            showToast(isAr ? '✓ تم حفظ الصورة' : 'Image saved');
                                          } finally {
                                            setUploadingControlId(null);
                                          }
                                        }
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Footer Actions */}
                          <div className="flex items-center justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                resetControl(item.id);
                                showToast(isAr ? `تمت استعادة الزر: ${item.name_ar || item.id}` : `Reset ${item.id}`);
                              }}
                              className="text-[10.5px] text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>{isAr ? 'استعادة للافتراضي' : 'Reset to default'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminControlsView;

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
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ArrowDown,
  Mail,
  Instagram,
  Phone,
  Tag,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Monitor,
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
              item.visible
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {item.visible ? (isAr ? 'معروض للزوار' : 'Visible') : (isAr ? 'مخفي ومعطل' : 'Hidden')}
          </span>
        </div>
      </div>

      {/* Render the Exact Live Element Mockup */}
      <div className="relative flex items-center justify-center min-h-[72px] py-2">
        {/* If control is toggled OFF, display informative translucent overlay */}
        {!item.visible && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-[2px] rounded-lg border border-rose-500/30 p-2 text-center animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
              <EyeOff className="w-4 h-4" />
              <span>{isAr ? 'معطل ومخفي من واجهة الموقع' : 'Disabled & Hidden from Storefront'}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {isAr ? 'انقر على أيقونة العين بالأعلى لتفعيله فوراً' : 'Click the eye toggle above to re-enable'}
            </span>
          </div>
        )}

        {/* Dynamic Mock Element based on control ID and Category */}
        <div className={`transition-all duration-200 ${!item.visible ? 'opacity-35 pointer-events-none filter blur-[0.5px]' : ''}`}>
          {/* 1. WhatsApp Product Button */}
          {item.id === 'btn_product_whatsapp' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#004ad7] hover:bg-[#003db3] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#004ad7]/30 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white/20 stroke-white stroke-[2]" />
                <span>{label || (isAr ? 'طلب عبر واتساب' : 'Order via WhatsApp')}</span>
              </button>
            </div>
          )}

          {/* 2. Size Guide Button */}
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

          {/* 3. Bespoke Button */}
          {item.id === 'btn_product_bespoke' && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{label || (isAr ? 'طلب تفصيل خاص عبر واتساب' : 'Inquire Bespoke on WhatsApp')}</span>
            </button>
          )}

          {/* 4. Share Button */}
          {item.id === 'btn_product_share' && (
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/15 px-3 py-1.5 text-xs font-semibold ${
                isDark ? 'bg-white/[0.05] text-white' : 'bg-black/[0.03] text-slate-800'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{label || (isAr ? 'مشاركة' : 'Share')}</span>
            </button>
          )}

          {/* 5. Copy Title Button */}
          {item.id === 'btn_product_copy' && (
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/15 px-3 py-1.5 text-xs font-semibold ${
                isDark ? 'bg-white/[0.05] text-white' : 'bg-black/[0.03] text-slate-800'
              }`}
            >
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>{label || (isAr ? 'نسخ الاسم' : 'Copy Name')}</span>
            </button>
          )}

          {/* 6. Product Delivery Badge */}
          {item.id === 'sec_product_delivery_badge' && (
            <div
              className={`flex items-start gap-2.5 rounded-xl border p-2.5 max-w-sm ${
                isDark ? 'bg-white/[0.03] border-white/10 text-white' : 'bg-black/[0.02] border-black/8 text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4 text-[#004ad7] dark:text-[#3b82f6] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs block">{label || (isAr ? 'توصيل سريع لكافة المحافظات' : 'Nationwide Fast Delivery')}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {isAr ? 'خلال 3 - 5 أيام مع حق الفحص والمعاينة عند الاستلام' : 'Within 3 - 5 days with inspection guarantee'}
                </span>
              </div>
            </div>
          )}

          {/* 7. Product Craft Badge */}
          {item.id === 'sec_product_craft_badge' && (
            <div
              className={`flex items-start gap-2.5 rounded-xl border p-2.5 max-w-sm ${
                isDark ? 'bg-white/[0.03] border-white/10 text-white' : 'bg-black/[0.02] border-black/8 text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#004ad7] dark:text-[#3b82f6] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs block">{label || (isAr ? 'تفصيل فاخر وقصة إيطالية' : 'Luxury Italian Tailoring')}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {isAr ? 'حرفية يدوية بإتقان مع ضمان أصالة المظهر' : 'Handcrafted precision & authentic drop'}
                </span>
              </div>
            </div>
          )}

          {/* 8. Carousel Navigation Arrows */}
          {item.id === 'btn_product_carousel_nav' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-md ${
                  isDark ? 'bg-slate-900/90 border-white/15 text-white' : 'bg-white/90 border-black/10 text-slate-800'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-semibold text-slate-400">1 / 4</span>
              <button
                type="button"
                className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-md ${
                  isDark ? 'bg-slate-900/90 border-white/15 text-white' : 'bg-white/90 border-black/10 text-slate-800'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 9. Header Search Button */}
          {item.id === 'btn_header_search' && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-2xs ${
                isDark ? 'bg-white/[0.05] border-white/10 text-white' : 'bg-black/[0.03] border-black/10 text-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium">{label || (isAr ? 'بحث' : 'Search')}</span>
            </div>
          )}

          {/* 10. Header Wishlist Button */}
          {item.id === 'btn_header_wishlist' && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-2xs ${
                isDark ? 'bg-white/[0.05] border-white/10 text-white' : 'bg-black/[0.03] border-black/10 text-slate-800'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-[#004ad7] dark:text-[#3b82f6] fill-current" />
              <span className="text-xs font-semibold">{label || (isAr ? 'المفضلة' : 'Wishlist')}</span>
              <span className="w-4 h-4 rounded-full bg-[#004ad7] text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
            </div>
          )}

          {/* 11. Header Lang Button */}
          {item.id === 'btn_header_lang' && (
            <div
              className={`px-3 py-1.5 rounded-full border text-xs font-bold font-mono ${
                isDark ? 'bg-white/[0.05] border-white/10 text-white' : 'bg-black/[0.03] border-black/10 text-slate-800'
              }`}
            >
              {label || 'EN / عربي'}
            </div>
          )}

          {/* 12. Header Theme Button */}
          {item.id === 'btn_header_theme' && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                isDark ? 'bg-white/[0.05] border-white/10 text-white' : 'bg-black/[0.03] border-black/10 text-slate-800'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-amber-300" />
              <span>{label || (isAr ? 'المظهر' : 'Theme')}</span>
            </div>
          )}

          {/* 13. Brand Kinetic Logo */}
          {item.id === 'brand_kinetic_logo' && (
            <div className="flex flex-col items-center">
              <span className="font-extrabold tracking-widest text-lg sm:text-xl font-sans text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                {label || 'VANT · ڤانت'}
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-mono">HAUTE COUTURE</span>
            </div>
          )}

          {/* 14. Hero Banner Container */}
          {item.id === 'banner_hero_visible' && (
            <div className="w-full max-w-sm rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-slate-900/60 p-3 text-center">
              <span className="text-xs font-bold text-white block">
                {isAr ? 'البنر الترحيبي العريض' : 'Welcome Hero Banner'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {isAr ? 'يظهر في أعلى الكتالوج مع الصورة والبيان' : 'Appears at the top of the collection'}
              </span>
            </div>
          )}

          {/* 15. Hero Banner Tag */}
          {item.id === 'banner_hero_tag' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/15 text-[11px] font-semibold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-[#004ad7]" />
              <span>{label || (isAr ? 'ڤانت · كتالوج شتاء 2026' : 'MAISON VANT · WINTER CAPSULE 2026')}</span>
            </div>
          )}

          {/* 16. Hero Banner Title */}
          {item.id === 'banner_hero_title' && (
            <h3 className="text-sm font-bold text-center text-white max-w-md line-clamp-2">
              {label || (isAr ? 'الصياغة المعمارية للأزياء الهادئة' : 'Architectural Silhouettes')}
            </h3>
          )}

          {/* 17. Hero Banner Subtitle */}
          {item.id === 'banner_hero_subtitle' && (
            <p className="text-xs text-center text-slate-300 max-w-md line-clamp-2">
              {label || (isAr ? 'تصاميم تم تفصيلها بدقة هندسية في أرقى المعامل الإيطالية...' : 'Engineered with precision...')}
            </p>
          )}

          {/* 18. Hero Banner Action Button */}
          {item.id === 'banner_hero_btn' && (
            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold shadow-md cursor-pointer ${
                isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
              }`}
            >
              <span>{label || (isAr ? 'تصفح كافة القطع' : 'Browse All Pieces')}</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* 19. Hero Banner Background Image */}
          {item.id === 'banner_hero_bg' && (
            <div className="relative w-44 h-16 rounded-lg overflow-hidden border border-white/10 shadow-sm">
              <img
                src={item.actionValue || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80'}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded bg-black/60">
                  {isAr ? 'صورة الغلاف' : 'Cover Image'}
                </span>
              </div>
            </div>
          )}

          {/* 20. Trends Section Title */}
          {item.id === 'banner_trends_title' && (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white">{label || (isAr ? 'تريند موسم 2026' : 'Featured Trends 2026')}</h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                5 مختارات
              </span>
            </div>
          )}

          {/* 21. Trends Carousel Section */}
          {item.id === 'sec_trends_carousel' && (
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-14 h-18 rounded-lg bg-slate-800 border border-slate-700 p-1 flex flex-col justify-end text-center">
                  <span className="text-[8px] font-bold text-white truncate">تريند {i}</span>
                </div>
              ))}
            </div>
          )}

          {/* 22. Category Tabs Bar */}
          {item.id === 'sec_category_tabs' && (
            <div className="flex items-center gap-1.5 overflow-x-hidden">
              <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold shadow-2xs">
                {isAr ? 'الكل' : 'All'}
              </span>
              <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-400 text-[11px] font-medium">
                {isAr ? 'المعاطف' : 'Outerwear'}
              </span>
              <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-400 text-[11px] font-medium">
                {isAr ? 'التريكو' : 'Knitwear'}
              </span>
            </div>
          )}

          {/* 23. Availability Filter Dropdown */}
          {item.id === 'btn_filter_availability' && (
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border ${
                isDark ? 'bg-white/[0.05] border-white/10 text-white' : 'bg-black/[0.03] border-black/10 text-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              <span>{label || (isAr ? 'حالة التوفر' : 'Availability')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          )}

          {/* 24. Offers Filter Button */}
          {item.id === 'btn_filter_offers' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
              <Tag className="w-3.5 h-3.5" />
              <span>{label || (isAr ? 'العروضات والخصومات' : 'Offers & Discounts')}</span>
            </div>
          )}

          {/* 25. Card Wishlist Heart */}
          {item.id === 'card_wishlist_btn' && (
            <div className="relative w-20 h-20 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-rose-500 flex items-center justify-center shadow-md border border-white/20"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
          )}

          {/* 26. Card Status Badge */}
          {item.id === 'card_status_badge' && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#004ad7] text-white text-[10px] font-bold shadow-xs">
                %15-
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                {label || (isAr ? 'متوفر' : 'In Stock')}
              </span>
            </div>
          )}

          {/* 27. Card Price Tag */}
          {item.id === 'card_price_tag' && (
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-sm font-black text-[#004ad7] dark:text-[#3b82f6]">120,000 د.ع</span>
              <span className="text-xs text-slate-400 line-through">145,000 د.ع</span>
            </div>
          )}

          {/* 28. Card Category Label */}
          {item.id === 'card_category_label' && (
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              {label || (isAr ? 'الأزياء الرسمية · TAILORING' : 'Tailoring')}
            </span>
          )}

          {/* 29. Card Hover Preview */}
          {item.id === 'card_hover_preview' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAr ? 'تبديل الصورة التلقائي عند مرور الماوس' : 'Hover Cross-fade View'}</span>
            </div>
          )}

          {/* 30. Floating Back to Top Button */}
          {item.id === 'btn_floating_back_to_top' && (
            <button
              type="button"
              className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-lg ${
                isDark ? 'bg-slate-900 border-white/15 text-white' : 'bg-white border-black/10 text-slate-800'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}

          {/* 31. Newsletter VIP Subscription */}
          {item.id === 'sec_newsletter_subscription' && (
            <div className="flex items-center gap-2 max-w-sm rounded-xl border border-slate-700 bg-slate-900/90 p-2">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0 ms-1" />
              <span className="text-xs text-slate-400 flex-1 truncate">
                {isAr ? 'أدخل بريدك الإلكتروني...' : 'Enter your email...'}
              </span>
              <button type="button" className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
                {label || (isAr ? 'اشتراك' : 'Join')}
              </button>
            </div>
          )}

          {/* 32. Footer Social Links */}
          {item.id === 'footer_social_links' && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-700 bg-slate-800 text-[11px] text-white">
                <Instagram className="w-3 h-3 text-pink-400" />
                <span>@vant.atelier</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-700 bg-slate-800 text-[11px] text-white">
                <MessageCircle className="w-3 h-3 text-emerald-400" />
                <span>WhatsApp</span>
              </span>
            </div>
          )}

          {/* 33. Footer Copyright */}
          {item.id === 'footer_copyright_brand' && (
            <span className="text-xs text-slate-400 select-none">
              {label || (isAr ? 'ڤانت · كتالوج الأزياء الحصري © 2026' : 'VANT · Capsule Lookbook © 2026')}
            </span>
          )}

          {/* 34. Global Contact Phone Numbers */}
          {(item.id === 'cfg_whatsapp_phone' || item.id === 'cfg_bespoke_phone') && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
              <Phone className="w-3.5 h-3.5" />
              <span>{item.actionValue || '+964 770 000 0000'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AdminControlsView: React.FC = () => {
  const { lang } = useAdminBridge();
  const {
    controls,
    updateControl,
    toggleVisibility,
    resetAllControls,
    resetControl,
  } = useSiteControls();

  const isAr = lang === 'ar';
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [uploadingControlId, setUploadingControlId] = useState<string | null>(null);

  // Global Interactive Preview toggles
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [previewLang, setPreviewLang] = useState<'ar' | 'en'>(isAr ? 'ar' : 'en');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const controlsList = Object.values(controls) as SiteControlItem[];

  const filteredControls = controlsList.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchLabel =
        (item.label_en && item.label_en.toLowerCase().includes(q)) ||
        (item.label_ar && item.label_ar.includes(q)) ||
        (item.name_ar && item.name_ar.includes(q)) ||
        (item.name_en && item.name_en.toLowerCase().includes(q));
      const matchKey = item.id.toLowerCase().includes(q);
      return matchLabel || matchKey;
    }
    return true;
  });

  const categories = [
    { id: 'all', label: isAr ? 'كافة العناصر والأزرار' : 'All Controls & Buttons' },
    { id: 'header', label: isAr ? 'الترويسة والتنقل' : 'Header & Navigation' },
    { id: 'banner', label: isAr ? 'البانرات والواجهة' : 'Banners & Hero' },
    { id: 'filter', label: isAr ? 'الفلاتر والتصنيفات' : 'Filters & Categories' },
    { id: 'card', label: isAr ? 'كروت المنتجات' : 'Product Cards' },
    { id: 'product', label: isAr ? 'نافذة تفاصيل القطعة والشراء' : 'Product Details & CTA' },
    { id: 'footer', label: isAr ? 'الفوتر والأزرار العائمة' : 'Footer & Floating' },
    { id: 'global', label: isAr ? 'أرقام وإعدادات عامة' : 'Global Settings' },
  ];

  const visibleCount = controlsList.filter((c) => c.visible !== false).length;
  const hiddenCount = controlsList.length - visibleCount;

  const enableAll = () => {
    controlsList.forEach((c) => {
      if (c.visible === false) {
        updateControl(c.id, { visible: true, enabled: true });
      }
    });
    showToast(isAr ? '✓ تم تفعيل وتشغيل كافة الأزرار والسكشنات' : 'All controls enabled');
  };

  const disableAll = () => {
    if (window.confirm(isAr ? 'هل أنت متأكد من رغبتك بإخفاء كافة العناصر القابلة للتعطيل؟' : 'Disable all controls?')) {
      controlsList.forEach((c) => {
        updateControl(c.id, { visible: false });
      });
      showToast(isAr ? 'تم إخفاء العناصر' : 'All controls disabled');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 start-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-950 border border-emerald-500/50 text-emerald-300 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-violet-600/30">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-white">
                  {isAr ? 'التحكم الديناميكي الشامل بكافة أزرار وسكشنات الموقع' : 'Dynamic Controls & Live Button Studio'}
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300">
                  {controlsList.length} {isAr ? 'عنصر تحكم' : 'controls'}
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  {visibleCount} {isAr ? 'مفعل' : 'active'}
                </span>
                {hiddenCount > 0 && (
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
                    {hiddenCount} {isAr ? 'مخفي' : 'hidden'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                {isAr
                  ? 'يمكنك تشغيل أو إطفاء أي زر، سكشن، أو خيار في الموقع بضغطة زر مع معاينة حية وفورية لشكله قبل وبعد التعديل. تتزامن التغييرات فوراً مع واجهة العميل دون أي خلل.'
                  : 'Toggle on/off and live-customize every single button, banner, and section across the boutique with instant visual previews.'}
              </p>
            </div>
          </div>

          {/* Quick Global Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={enableAll}
              className="px-3 py-2 rounded-xl border border-emerald-600/30 bg-emerald-600/10 hover:bg-emerald-600/20 text-xs font-semibold text-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer"
              title={isAr ? 'تشغيل وتفعيل كافة العناصر' : 'Enable all'}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'تشغيل الكل' : 'Enable All'}</span>
            </button>

            <button
              onClick={disableAll}
              className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              title={isAr ? 'إخفاء كافة العناصر' : 'Disable all'}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{isAr ? 'إخفاء الكل' : 'Disable All'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(isAr ? 'هل أنت متأكد من استعادة كافة الأزرار والسكشنات لضبط المصنع الافتراضي؟' : 'Reset all controls to factory defaults?')) {
                  resetAllControls();
                  showToast(isAr ? '✓ تمت استعادة الإعدادات الافتراضية بنجاح' : 'Reset to defaults');
                }
              }}
              className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
            </button>
          </div>
        </div>

        {/* Studio Preview Mode Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAr ? 'نمط المعاينة الحية:' : 'Live Preview Settings:'}</span>
            </span>

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
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث سريع عن أي زر أو سكشن...' : 'Search controls & buttons...'}
              className="w-full ps-9 pe-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => {
          const isCurrent = filterCategory === c.id;
          const count = c.id === 'all' ? controlsList.length : controlsList.filter((item) => item.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-2 ${
                isCurrent
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800'
              }`}
            >
              <span>{c.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isCurrent ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controls Grid Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredControls.map((item) => {
          const isVisible = item.visible !== false;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isVisible
                  ? 'bg-slate-900/90 border-slate-800 shadow-md'
                  : 'bg-slate-950/70 border-slate-900 opacity-80'
              }`}
            >
              <div>
                {/* Card Header: Meta + Toggle */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {item.id}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800">
                        {item.category}
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

                    <h3 className="text-sm font-bold text-white mt-2 truncate">
                      {isAr ? item.name_ar || item.label_ar : item.name_en || item.label_en}
                    </h3>

                    {item.description_ar && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {isAr ? item.description_ar : item.description_en || item.description_ar}
                      </p>
                    )}
                  </div>

                  {/* Primary Power/Visibility Toggle Button */}
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

                {/* Optional Action / URL / Phone / Image Upload Field */}
                {item.actionValue !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-400">
                        {item.id.includes('phone')
                          ? isAr ? 'رقم هاتف الواتساب الدولي (+964...)' : 'International Phone (+964...)'
                          : item.id.includes('bg') || item.id.includes('image')
                          ? isAr ? 'رابط الصورة أو رفع ملف مباشر من جهازك' : 'Image URL or Upload File'
                          : isAr ? 'قيمة الإجراء أو الرابط المستهدف' : 'Action Target URL or Value'}
                      </label>
                      {(item.id.includes('bg') || item.id.includes('image') || item.id.includes('banner') || item.id.includes('logo')) && (
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>{isAr ? 'رفع ملف مدعوم' : 'File upload ready'}</span>
                        </span>
                      )}
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
                              <span>{isAr ? 'رفع...' : '...'}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isAr ? 'رفع ملف كصورة' : 'Upload'}</span>
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
                                    showToast(isAr ? '✓ تم رفع الصورة كملف بنجاح' : 'Image uploaded successfully');
                                  }
                                } catch (err) {
                                  const fallback = await fileToOptimizedDataUrl(file);
                                  updateControl(item.id, { actionValue: fallback });
                                  showToast(isAr ? '✓ تم حفظ الصورة كملف' : 'Image saved');
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

                {/* Footer Actions: Reset item to default */}
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
                    <span>{isAr ? 'استعادة هذا الزر للافتراضي' : 'Reset to default'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminControlsView;

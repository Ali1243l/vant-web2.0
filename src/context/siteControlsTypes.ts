import type { Product, ProductAvailability, TrendItem } from "../types";
import type { FooterSocialLink } from "../data/socialPlatforms";
import type { MasterSizeItem } from "../data/sizeGuide";

// Site controls, studio settings and types extracted from SiteControlsContext

export interface SiteControlItem {
  id: string;
  category: 'product' | 'header' | 'filter' | 'global' | 'banner' | 'card' | 'footer';
  name_ar: string;
  name_en: string;
  visible: boolean;
  enabled: boolean;
  label_ar: string;
  label_en: string;
  actionValue?: string; // Custom WhatsApp phone, URL, or target parameter
  description_ar?: string;
  description_en?: string;
}

export type CurrencyType = 'د.ع' | 'IQD' | 'USD';
export type CurrencyCode = CurrencyType;


export type SplashMotifType =
  | 'print_press'
  | 'tshirt_print'
  | 'embroidery'
  | 'hanger'
  | 'needle_thread'
  | 'mannequin'
  | 'monogram'
  | 'scissors';

export type LogoFontAr =
  | 'reem_kufi'
  | 'alexandria'
  | 'tajawal'
  | 'aref_ruqaa'
  | 'amiri'
  | 'almarai'
  | 'ibm_plex'
  | 'cairo'
  | 'marhey';
export type LogoFontEn = 'sans' | 'serif' | 'mono' | 'display';
export type LogoAnimation =
  | 'shimmer_shine'
  | 'gold_sparkle'
  | 'diamond_glint'
  | 'light_sweep'
  | 'neon_glow'
  | 'cyber_pulse'
  | 'breathing_ambient'
  | 'flare_burst'
  | 'iridescent_sheen'
  | 'twilight_aurora'
  | 'kinetic_flip'
  | 'flip_y'
  | 'coin_spin'
  | 'swing_pendulum'
  | 'tumble_roll'
  | 'fold_origami'
  | 'perspective_tilt'
  | 'isometric_float'
  | 'spin_slow_luxury'
  | 'roll_in_reveal'
  | 'float_hover'
  | 'gentle_pulse'
  | 'heartbeat'
  | 'magnetic_hover'
  | 'drift_wave'
  | 'levitation_zen'
  | 'spring_bounce'
  | 'elastic_snap'
  | 'jelly_wobble'
  | 'rubber_stretch'
  | 'typewriter_smooth'
  | 'glitch_cyber'
  | 'scanline_hologram'
  | 'matrix_reveal'
  | 'digital_flicker'
  | 'signal_interference'
  | 'decode_scramble'
  | 'pixel_fade'
  | 'hud_scanner'
  | 'laser_beam'
  | 'curtain_reveal'
  | 'blur_focus'
  | 'smoke_emerge'
  | 'zoom_pop'
  | 'slide_up_fade'
  | 'split_rejoin'
  | 'letter_cascade'
  | 'echo_ghost'
  | 'vignette_spotlight'
  | 'royal_stamp'
  | 'meteor_streak'
  | 'ripple_impact'
  | 'kaleidoscope'
  | 'infinity_loop'
  | 'vortex_twist'
  | 'minimal_static'
  | (string & {});
export type LogoColorTheme =
  | 'default'
  | 'gold_luxury'
  | 'silver_chrome'
  | 'cobalt_gradient'
  | 'emerald_velvet'
  | 'rose_opal'
  | 'custom_gradient';

export type NewsletterGradientTheme =
  | 'classic'
  | 'cobalt'
  | 'midnight'
  | 'minimal'
  | 'emerald'
  | 'amber'
  | 'gold_royal'
  | 'custom';

export interface SiteSettings {
  id?: string | number;
  maintenance_mode: boolean;
  loading_text_en: string;
  loading_text_ar: string;
  maintenance_message: string;
  maintenance_message_ar?: string;
  splash_motif?: SplashMotifType;
  welcome_title_ar?: string;
  welcome_title_en?: string;
  welcome_message_ar?: string;
  welcome_message_en?: string;
  welcome_coupon_code?: string;
  welcome_discount_percent?: number;
  welcome_modal_enabled?: boolean;
  welcome_auto_dispatch?: boolean;
  custom_store_url?: string;
  offers_banner_title_ar?: string;
  offers_banner_title_en?: string;
  offers_promo_code?: string;
  offers_default_discount?: number;

  // Brand Logo Studio Controls
  logo_text_ar?: string;
  logo_text_en?: string;
  logo_font_ar?: LogoFontAr;
  logo_font_en?: LogoFontEn;
  logo_animation?: LogoAnimation;
  logo_color_theme?: LogoColorTheme;
  logo_custom_color_from?: string;
  logo_custom_color_to?: string;
  logo_letter_spacing?: 'normal' | 'wide' | 'ultra_wide';
  logo_font_weight?: 'medium' | 'bold' | 'black';

  // Newsletter Section Complete Controls
  newsletter_badge_ar?: string;
  newsletter_badge_en?: string;
  newsletter_title_ar?: string;
  newsletter_title_en?: string;
  newsletter_subtitle_ar?: string;
  newsletter_subtitle_en?: string;
  newsletter_perk1_ar?: string;
  newsletter_perk1_en?: string;
  newsletter_perk2_ar?: string;
  newsletter_perk2_en?: string;
  newsletter_perk3_ar?: string;
  newsletter_perk3_en?: string;
  newsletter_input_placeholder_ar?: string;
  newsletter_input_placeholder_en?: string;
  newsletter_button_ar?: string;
  newsletter_button_en?: string;
  newsletter_privacy_ar?: string;
  newsletter_privacy_en?: string;
  newsletter_gradient_theme?: NewsletterGradientTheme;
  newsletter_custom_bg_from?: string;
  newsletter_custom_bg_to?: string;
  newsletter_glow_enabled?: boolean;

  updated_at?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  maintenance_mode: false,
  loading_text_en: 'INITIALIZING ARCHIVE',
  loading_text_ar: 'جاري تحميل الأرشيف وتجهيز التشكيلة',
  maintenance_message: 'We are preparing Volume 02. Please check back later.',
  maintenance_message_ar: 'نعمل حالياً على تجهيز التشكيلة الجديدة وتحديث النظام. يرجى العودة لاحقاً.',
  splash_motif: 'tshirt_print',
  welcome_title_ar: 'أهلاً بك في ڤانت!',
  welcome_title_en: 'Welcome to VANT!',
  welcome_message_ar: 'تم تفعيل اشتراكك بنجاح، وتم إرسال نسخة من العرض الترحيبي وكود الخصم إلى بريدك الإلكتروني.',
  welcome_message_en: 'Your subscription is active! A welcome voucher and discount code have been dispatched to your email.',
  welcome_coupon_code: 'VANT-WELCOME-15',
  welcome_discount_percent: 15,
  welcome_modal_enabled: true,
  welcome_auto_dispatch: true,
  custom_store_url: 'https://vant-web.vercel.app/',
  offers_banner_title_ar: 'قائمة العروض والخصومات الحصرية',
  offers_banner_title_en: 'Exclusive Offers & Private Archive Allocations',
  offers_promo_code: 'VANT-OFFERS-20',
  offers_default_discount: 20,

  // Brand Logo Studio Defaults (Enhanced default Arabic font to 'reem_kufi' and luxury typography)
  logo_text_ar: 'فانت',
  logo_text_en: 'VANT',
  logo_font_ar: 'reem_kufi',
  logo_font_en: 'sans',
  logo_animation: 'shimmer_shine',
  logo_color_theme: 'default',
  logo_custom_color_from: '#004ad7',
  logo_custom_color_to: '#3b82f6',
  logo_letter_spacing: 'wide',
  logo_font_weight: 'bold',

  // Newsletter Section Defaults
  newsletter_badge_ar: 'الوصول الحصري للأرشيف',
  newsletter_badge_en: 'Private Archive Access',
  newsletter_title_ar: 'ابقَ على اطّلاع على أحدث القطع',
  newsletter_title_en: 'Stay Updated on New Releases',
  newsletter_subtitle_ar: 'أدخل بريدك لتصلك إشعارات العروض الحصرية وإعادة توفير القطع فوراً.',
  newsletter_subtitle_en: 'Enter your email for private previews, restock alerts, and exclusive releases.',
  newsletter_perk1_ar: 'خصم 15% ترحيبي',
  newsletter_perk1_en: '15% Welcome Voucher',
  newsletter_perk2_ar: 'تنبيهات فورية',
  newsletter_perk2_en: 'Instant Alerts',
  newsletter_perk3_ar: 'إلغاء بنقرة واحدة',
  newsletter_perk3_en: '1-Click Unsubscribe',
  newsletter_input_placeholder_ar: 'أدخل بريدك الإلكتروني هنا...',
  newsletter_input_placeholder_en: 'Enter your email address here...',
  newsletter_button_ar: 'اشتراك',
  newsletter_button_en: 'Subscribe',
  newsletter_privacy_ar: 'خصوصيتك محمية. يمكنك إلغاء الاشتراك وحذف حسابك في أي وقت بنقرة واحدة.',
  newsletter_privacy_en: 'Privacy guaranteed. You can unsubscribe and delete your account anytime in one click.',
  newsletter_gradient_theme: 'classic',
  newsletter_custom_bg_from: '#004ad7',
  newsletter_custom_bg_to: '#1d4ed8',
  newsletter_glow_enabled: true,
};

export interface ProductEnhancement {
  title_ar?: string;
  category_ar?: string;
  is_offer?: boolean;
  original_price?: number;
  offer_badge_ar?: string;
  offer_badge_en?: string;
  tags?: string[];
  image_url?: string;
  images?: string[];
  aspect_ratio?: string;
  colors?: string[];
  variants?: any[];
  sku?: string;
}


export interface SiteControlsContextType {
  controls: Record<string, SiteControlItem>;
  getControl: (id: string) => SiteControlItem;
  toggleVisibility: (id: string) => void;
  toggleEnabled: (id: string) => void;
  updateControl: (id: string, updates: Partial<SiteControlItem>) => void;
  resetControl: (id: string) => void;
  resetAllControls: () => void;
  exportConfigJSON: () => string;
  importConfigJSON: (jsonString: string) => boolean;

  // Currency Support
  currency: CurrencyType;
  currencyCode: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  setCurrencyCode: (c: CurrencyType) => void;
  formatPrice: (price: number) => string;

  // Full Catalog CMS
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalProductsCount: number;
  error: string | null;
  isLiveDatabase: boolean;
  lastSyncTime: Date | null;
  refreshProducts: () => Promise<void>;
  loadMoreProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'> & { id?: string | number }) => Product;
  updateProduct: (id: string | number, updates: Partial<Product>) => void;
  deleteProduct: (id: string | number) => void;
  toggleProductAvailability: (id: string | number, status?: ProductAvailability) => void;
  resetProductsToDefault: () => void;
  importProductsJSON: (jsonString: string) => boolean;
  exportFullSystemJSON: () => string;
  importFullSystemJSON: (jsonString: string) => boolean;
  exportAllDataJSON: () => string;
  importAllDataJSON: (jsonString: string) => boolean;

  // Trend Cards Studio
  trendItems: TrendItem[];
  updateTrendItem: (id: string, updates: Partial<TrendItem>) => void;
  resetTrendsToDefault: () => void;

  // Social & Platforms Management (60+ Presets & Custom)
  socialLinks: FooterSocialLink[];
  updateSocialLink: (id: string, updates: Partial<FooterSocialLink>) => void;
  addSocialLink: (link: FooterSocialLink) => void;
  removeSocialLink: (id: string) => void;
  toggleSocialLinkActive: (id: string) => void;
  reorderSocialLinks: (reordered: FooterSocialLink[]) => void;
  resetSocialLinksToDefault: () => void;

  // Master Size Guide & Measurements Management
  masterSizes: MasterSizeItem[];
  updateMasterSize: (id: string, updates: Partial<MasterSizeItem>) => void;
  addMasterSize: (item: Omit<MasterSizeItem, 'id'> & { id?: string }) => void;
  deleteMasterSize: (id: string) => void;
  toggleMasterSize: (id: string) => void;
  reorderMasterSizes: (reordered: MasterSizeItem[]) => void;
  resetMasterSizesToDefault: () => void;

  // Admin Auth & State
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isAdminUnlocked: boolean;
  unlockAdmin: (pin: string) => boolean;
  lockAdmin: () => void;
  setAdminPin: (newPin: string) => void;

  // Global Site Settings (Maintenance Mode & Splash Preloader)
  siteSettings: SiteSettings;
  updateSiteSettings: (updates: Partial<SiteSettings>) => Promise<boolean>;
  isInitialSplashLoading: boolean;
  isPreviewSplash: boolean;
  setIsPreviewSplash: (show: boolean) => void;
  isPreviewMaintenance: boolean;
  setIsPreviewMaintenance: (show: boolean) => void;
  isPreviewWelcomeModal: boolean;
  setIsPreviewWelcomeModal: (show: boolean) => void;

  // Supabase Cloud Sync
  isCloudSynced: boolean;
  syncAllToSupabaseCloud: () => Promise<boolean>;
}


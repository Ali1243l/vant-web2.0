import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useSiteControls } from '../context/SiteControlsContext';
import type { Product as StoreProduct, ProductAvailability } from '../types';
import { getStoredSubscribers, addSubscriber as addStoredSubscriber, removeSubscriber as removeStoredSubscriber, syncSubscribersFromCloud, saveSubscribers } from '../lib/newsletter';
import { saveOrdersToSupabase, fetchOrdersFromSupabase, saveOffersToSupabase, fetchOffersFromSupabase } from '../lib/storage';

export type AdminView = 'dashboard' | 'orders' | 'products' | 'sizes' | 'offers' | 'banners' | 'subscribers' | 'welcome_modal' | 'controls' | 'social' | 'backup' | 'settings' | 'security';

export type OrderStatus = 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderType = 'ready_to_wear' | 'bespoke';

export interface OrderItem {
  productId: string;
  name: string;
  nameEn: string;
  imageUrl: string;
  price: number;
  quantity: number;
  selectedSize: string;
  fabricOption?: string;
}

export interface BespokeDetails {
  clientMeasurements?: {
    chest?: string;
    waist?: string;
    shoulder?: string;
    sleeveLength?: string;
    jacketLength?: string;
    collar?: string;
    height?: string;
    posture?: string;
  };
  artisanNotes?: string;
  fabricSelection?: string;
  urgency?: 'standard' | 'high_priority' | 'royal_vip';
  atelierMaster?: string;
  fittingDate?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  title: string;
  titleEn: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  orderDate: string;
  type: OrderType;
  isVip?: boolean;
  bespokeDetails?: BespokeDetails;
  timeline: OrderTimelineEvent[];
  paymentMethod: string;
  trackingNumber?: string;
}

export interface ProductVariant {
  id: string;
  colorNameAr: string; // e.g., 'أسود ملكي'
  colorNameEn: string; // e.g., 'Royal Black'
  colorHex: string; // e.g., '#000000' (For UI swatch rendering)
  price?: number; // Optional override: if set, overrides base price
  salePrice?: number; 
  stock: number;
  sizes: string[]; // Specific sizes available FOR THIS COLOR ONLY
  images: string[]; // Images specifically for this color
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  sku: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  status: 'active' | 'draft' | 'outOfStock' | 'lowStock';
  imageUrl: string;
  images?: string[];
  sizes?: string[];
  descriptionAr?: string;
  descriptionEn?: string;
  materialDetails?: string;
  availabilityStatus?: 'in_stock' | 'limited' | 'coming_soon' | 'sold_out';
  isOnOffer?: boolean;
  offerCampaign?: string;
  offerBadgeText?: string;
  salesCount: number;
  rating: number;
  createdAt: string;
  // Color Variants System (PIM)
  hasVariants?: boolean;
  variants?: ProductVariant[];
}

export interface Offer {
  id: string;
  title: string;
  titleEn: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend?: number;
  status: 'active' | 'scheduled' | 'expired';
  usedCount: number;
  maxUses?: number;
  startDate: string;
  endDate: string;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'unsubscribed';
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  lastOrderDate?: string;
  tags: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'stock' | 'system';
}

export interface SiteSettings {
  storeName: string;
  storeNameEn: string;
  currency: string;
  emailAlerts: boolean;
  smsAlerts: boolean;

  // 1. Global Maintenance Mode
  maintenanceMode: boolean;
  maintenanceMessageAr: string;
  maintenanceMessageEn: string;
  maintenanceEstimatedBack: string;

  // 2. Splash Screen Customizer
  splashMotif: 'hanger' | 'scissors' | 'monogram' | 'needle' | 'crown';
  splashTextAr: string;
  splashTextEn: string;
  splashDurationMs: number;

  // 3. Store Front Banners
  heroBannerBg: string;
  heroHeadlineAr: string;
  heroHeadlineEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroBadgeAr: string;
  heroBadgeEn: string;
  heroCtaTextAr: string;
  heroCtaTextEn: string;
  heroCtaLink: string;

  // 4. WhatsApp Multi-Number
  whatsappOrdersNumber: string;
  whatsappOrdersName: string;
  whatsappConciergeNumber: string;
  whatsappConciergeName: string;
  whatsappDefaultMsg: string;
  pin?: string;
}

export const defaultSiteSettings: SiteSettings = {
  storeName: 'دار ڤانت (Maison VANT)',
  storeNameEn: 'Maison VANT | Editorial Haute Streetwear',
  currency: 'IQD',
  emailAlerts: true,
  smsAlerts: false,
  pin: '1234',

  maintenanceMode: false,
  maintenanceMessageAr: 'نقوم حالياً بتجهيز وإطلاق المجموعة الحصرية الجديدة. سنعود لاستقبال طلباتكم قريباً جداً.',
  maintenanceMessageEn: 'We are currently curating and preparing our new exclusive collection. We will reopen shortly for orders.',
  maintenanceEstimatedBack: 'خلال ساعتين (2 Hours)',

  splashMotif: 'hanger',
  splashTextAr: 'دار ڤانت للأزياء • أصل التشكيلة والتريندات',
  splashTextEn: 'Maison VANT • Editorial Streetwear Catalogue',
  splashDurationMs: 2500,

  heroBannerBg: '',
  heroHeadlineAr: 'أصل التشكيلة والتريندات الحصرية',
  heroHeadlineEn: 'Curated Exclusive Collection & Trends',
  heroSubtitleAr: 'استكشف التشكيلة الحصرية من دار ڤانت مباشرة من قاعدة البيانات.',
  heroSubtitleEn: 'Explore curated haute streetwear pieces directly from our database.',
  heroBadgeAr: 'التشكيلة الحصرية • 2026',
  heroBadgeEn: 'Exclusive Archive • 2026',
  heroCtaTextAr: 'تصفح كافة القطع',
  heroCtaTextEn: 'Browse All Pieces',
  heroCtaLink: '#products',

  whatsappOrdersNumber: '',
  whatsappOrdersName: 'خدمة العملاء والطلبات',
  whatsappConciergeNumber: '',
  whatsappConciergeName: 'كونسيرج الاستفسارات',
  whatsappDefaultMsg: 'مرحباً، أود الاستفسار عن قطعة من دار ڤانت.',
};

interface AdminContextType {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  isLocked: boolean;
  lock: () => void;
  unlock: (pin: string) => boolean;
  pin: string;
  setPin: (pin: string) => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  toggleLang: () => void;
  currentStore: string;
  setCurrentStore: (store: string) => void;
  
  // Real Database & Cloud State
  isLiveDatabase: boolean;
  isCloudSynced: boolean;
  lastSyncTime: string | null;
  refreshProducts: () => Promise<void>;
  syncAllToSupabaseCloud: () => Promise<boolean>;

  // Data State
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'salesCount' | 'rating'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductOffer: (id: string) => void;
  
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id' | 'usedCount'>) => void;
  updateOffer: (id: string, offer: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  
  subscribers: Subscriber[];
  addSubscriber: (sub: Omit<Subscriber, 'id' | 'joinedDate' | 'totalOrders' | 'totalSpent'>) => void;
  deleteSubscriber: (id: string) => void;

  // Order Management System (OMS) & Concierge
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => void;
  updateOrderArtisanNotes: (id: string, notes: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'orderDate' | 'timeline'>) => void;

  notifications: NotificationItem[];
  markNotificationsAsRead: () => void;

  // Global modals state
  isOfferModalOpen: boolean;
  setIsOfferModalOpen: (open: boolean) => void;

  // Master Site Controls & Settings
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<{ success: boolean; syncedWithCloud: boolean }>;
}

const defaultProducts: Product[] = [];
const defaultOffers: Offer[] = [];
const defaultSubscribers: Subscriber[] = [];
const defaultNotifications: NotificationItem[] = [];
const defaultOrders: Order[] = [];

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const siteControls = useSiteControls();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState<boolean>(false);

  // Authentication & Locking directly tied to SiteControlsContext
  const isLocked = !siteControls.isAdminUnlocked;
  const lock = useCallback(() => {
    siteControls.lockAdmin();
  }, [siteControls]);

  const unlock = useCallback((enteredPin: string) => {
    return siteControls.unlockAdmin(enteredPin);
  }, [siteControls]);

  const pin = '1234';
  const setPin = useCallback((newPin: string) => {
    siteControls.setAdminPin(newPin);
  }, [siteControls]);

  // Language state
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const currentStore = siteControls.siteSettings.welcome_title_ar || 'دار ڤانت (VANT)';
  const setCurrentStore = useCallback((name: string) => {
    siteControls.updateSiteSettings({ welcome_title_ar: name });
  }, [siteControls]);

  // Bidirectional Product Adapter between StoreProduct and New Admin Product
  const mapStoreProductToAdminProduct = useCallback((sp: StoreProduct): Product => {
    const rawAvailability = sp.availability || 'in_stock';
    let status: 'active' | 'draft' | 'outOfStock' | 'lowStock' = 'active';
    let availabilityStatus: 'in_stock' | 'limited' | 'coming_soon' | 'sold_out' = 'in_stock';

    if (rawAvailability === 'sold_out') {
      status = 'outOfStock';
      availabilityStatus = 'sold_out';
    } else if (rawAvailability === 'limited') {
      status = 'lowStock';
      availabilityStatus = 'limited';
    } else if (rawAvailability === 'coming_soon') {
      status = 'draft';
      availabilityStatus = 'coming_soon';
    } else {
      status = 'active';
      availabilityStatus = 'in_stock';
    }

    const effectivePrice = sp.price || 0;
    const salePrice = (sp.is_offer && sp.original_price && sp.original_price > sp.price)
      ? sp.price
      : undefined;
    const basePrice = (sp.is_offer && sp.original_price && sp.original_price > sp.price)
      ? sp.original_price
      : effectivePrice;

    return {
      id: String(sp.id),
      name: sp.title_ar || sp.title,
      nameEn: sp.title,
      sku: 'VANT-' + sp.id,
      category: sp.category_ar || sp.category,
      price: basePrice,
      salePrice: salePrice,
      stock: rawAvailability === 'sold_out' ? 0 : 25,
      status,
      imageUrl: sp.image_url,
      images: sp.images && sp.images.length > 0 ? sp.images : [sp.image_url],
      sizes: sp.sizes || ['S', 'M', 'L', 'XL'],
      descriptionAr: sp.description_ar || sp.description,
      descriptionEn: sp.description,
      materialDetails: sp.material || 'صوف كشميري إيطالي نقي',
      availabilityStatus,
      isOnOffer: !!sp.is_offer,
      offerCampaign: sp.offer_badge_ar || 'عرض حصري',
      offerBadgeText: sp.offer_badge_ar || (sp.is_offer ? 'خصم خاص' : undefined),
      salesCount: 0,
      rating: 5.0,
      createdAt: sp.created_at ? sp.created_at.split('T')[0] : '2026-03-01',
      hasVariants: false,
    };
  }, []);

  // Orders Management System (OMS) state connected directly to Supabase
  const [orders, setOrders] = useState<Order[]>([]);

  // Sync products with SiteControlsContext and calculate real salesCount strictly from Supabase orders
  const products: Product[] = useMemo(() => {
    let baseProds: Product[] = [];
    if (siteControls.products && siteControls.products.length > 0) {
      baseProds = siteControls.products.map(mapStoreProductToAdminProduct);
    } else {
      baseProds = defaultProducts;
    }

    const salesMap = new Map<string, number>();
    (orders || []).filter((o) => o.status !== 'cancelled').forEach((order) => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const pId = String(item.productId || item.id || item.product_id || '');
          const qty = Number(item.quantity || item.qty || 1);
          if (pId) {
            salesMap.set(pId, (salesMap.get(pId) || 0) + qty);
          }
        });
      }
    });

    return baseProds.map((p) => ({
      ...p,
      salesCount: salesMap.get(String(p.id)) || 0,
    }));
  }, [siteControls.products, mapStoreProductToAdminProduct, orders]);

  // Derive product metrics helper
  const deriveProductMetricsFromVariants = (prod: Partial<Product>): Partial<Product> => {
    if (!prod.hasVariants || !prod.variants || prod.variants.length === 0) {
      return prod;
    }
    const totalStock = prod.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    const firstVariant = prod.variants[0];
    let effectivePrice = prod.price;
    if (typeof effectivePrice !== 'number' || effectivePrice <= 0) {
      effectivePrice = firstVariant?.price || 0;
    }
    let effectiveSalePrice = prod.salePrice;
    if ((typeof effectiveSalePrice !== 'number' || effectiveSalePrice <= 0) && firstVariant?.salePrice) {
      effectiveSalePrice = firstVariant.salePrice;
    }
    let status = prod.status || 'active';
    let availabilityStatus = prod.availabilityStatus || 'in_stock';
    if (totalStock === 0) {
      status = 'outOfStock';
      availabilityStatus = 'sold_out';
    } else if (totalStock <= 5) {
      status = 'lowStock';
      availabilityStatus = 'limited';
    } else if (status === 'outOfStock' || status === 'lowStock') {
      status = 'active';
      availabilityStatus = 'in_stock';
    }
    const variantImages = prod.variants.flatMap((v) => v.images || []).filter(Boolean);
    const variantSizes = Array.from(new Set(prod.variants.flatMap((v) => v.sizes || []))).filter(Boolean);
    const primaryImage =
      firstVariant?.images?.[0] ||
      (prod.imageUrl && !prod.imageUrl.includes('photo-1505740420928') ? prod.imageUrl : variantImages[0]) ||
      prod.imageUrl ||
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80';

    return {
      ...prod,
      stock: totalStock,
      price: effectivePrice,
      salePrice: effectiveSalePrice,
      status,
      availabilityStatus,
      imageUrl: primaryImage,
      images: prod.images && prod.images.length > 0 ? prod.images : (variantImages.length > 0 ? variantImages : [primaryImage]),
      sizes: variantSizes.length > 0 ? variantSizes : prod.sizes,
      isOnOffer: !!effectiveSalePrice && effectiveSalePrice > 0 && effectiveSalePrice < effectivePrice,
    };
  };

  const addProduct = useCallback((newProd: Omit<Product, 'id' | 'createdAt' | 'salesCount' | 'rating'>) => {
    const enriched = deriveProductMetricsFromVariants(newProd);
    let availability: ProductAvailability = 'in_stock';
    if (enriched.availabilityStatus === 'sold_out') availability = 'sold_out';
    else if (enriched.availabilityStatus === 'limited') availability = 'limited';
    else if (enriched.availabilityStatus === 'coming_soon') availability = 'coming_soon';

    const variantColors = (enriched.variants || [])
      .map((v) => v.colorNameAr || v.colorNameEn)
      .filter(Boolean);

    const allImages = enriched.images && enriched.images.length > 0
      ? enriched.images
      : [enriched.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80'];

    siteControls.addProduct({
      title: enriched.nameEn || enriched.name || 'New Item',
      title_ar: enriched.name,
      price: enriched.salePrice || enriched.price || 0,
      original_price: enriched.salePrice ? enriched.price : undefined,
      category: enriched.category || 'Outerwear',
      category_ar: enriched.category,
      sizes: enriched.sizes && enriched.sizes.length > 0 ? enriched.sizes : ['S', 'M', 'L', 'XL'],
      colors: variantColors.length > 0 ? variantColors : undefined,
      image_url: enriched.imageUrl || allImages[0],
      images: allImages,
      description: enriched.descriptionEn,
      description_ar: enriched.descriptionAr,
      material: enriched.materialDetails,
      availability,
      is_offer: enriched.isOnOffer,
      offer_badge_ar: enriched.offerBadgeText || enriched.offerCampaign,
    });
  }, [siteControls]);

  const updateProduct = useCallback((id: string, updated: Partial<Product>) => {
    const patch: Partial<StoreProduct> = {};
    if (updated.name) patch.title_ar = updated.name;
    if (updated.nameEn) patch.title = updated.nameEn;
    if (updated.price !== undefined) {
      if (updated.salePrice) {
        patch.price = updated.salePrice;
        patch.original_price = updated.price;
        patch.is_offer = true;
      } else {
        patch.price = updated.price;
        patch.is_offer = false;
      }
    } else if (updated.salePrice !== undefined) {
      patch.price = updated.salePrice;
      patch.is_offer = true;
    }
    if (updated.category) {
      patch.category = updated.category;
      patch.category_ar = updated.category;
    }
    if (updated.imageUrl) patch.image_url = updated.imageUrl;
    if (updated.images) patch.images = updated.images;
    if (updated.sizes) patch.sizes = updated.sizes;
    if (updated.descriptionAr) patch.description_ar = updated.descriptionAr;
    if (updated.descriptionEn) patch.description = updated.descriptionEn;
    if (updated.materialDetails) patch.material = updated.materialDetails;
    if (updated.availabilityStatus) {
      patch.availability = updated.availabilityStatus as ProductAvailability;
    }
    if (updated.isOnOffer !== undefined) {
      patch.is_offer = updated.isOnOffer;
    }
    if (updated.offerBadgeText || updated.offerCampaign) {
      patch.offer_badge_ar = updated.offerBadgeText || updated.offerCampaign;
    }

    siteControls.updateProduct(id, patch);
  }, [siteControls]);

  const deleteProduct = useCallback((id: string) => {
    siteControls.deleteProduct(id);
  }, [siteControls]);

  const toggleProductOffer = useCallback((id: string) => {
    const target = siteControls.products.find((p) => String(p.id) === String(id));
    if (target) {
      const willBeOffer = !target.is_offer;
      const basePrice = target.original_price || target.price;
      const newSalePrice = willBeOffer ? Math.round((basePrice * 0.85) / 500) * 500 : basePrice;
      siteControls.updateProduct(id, {
        is_offer: willBeOffer,
        original_price: willBeOffer ? basePrice : undefined,
        price: willBeOffer ? newSalePrice : basePrice,
        offer_badge_ar: willBeOffer ? 'خصم 15%' : undefined,
      });
    }
  }, [siteControls]);

  // Offers System (integrated with campaigns and synced with Supabase Cloud)
  const [offers, setOffers] = useState<Offer[]>(() => {
    try {
      const saved = localStorage.getItem('vant_offers_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultOffers;
  });

  // Load latest offers from Supabase on mount
  useEffect(() => {
    fetchOffersFromSupabase().then((remoteOffers) => {
      if (remoteOffers && Array.isArray(remoteOffers) && remoteOffers.length > 0) {
        setOffers(remoteOffers);
        try { localStorage.setItem('vant_offers_v1', JSON.stringify(remoteOffers)); } catch {}
      }
    }).catch(() => {});
  }, []);

  const addOffer = useCallback((newOff: Omit<Offer, 'id' | 'usedCount'>) => {
    const offer: Offer = {
      ...newOff,
      id: 'off-' + Date.now(),
      usedCount: 0,
    };
    setOffers((prev) => {
      const next = [offer, ...prev];
      try { localStorage.setItem('vant_offers_v1', JSON.stringify(next)); } catch {}
      saveOffersToSupabase(next);
      return next;
    });
  }, []);

  const updateOffer = useCallback((id: string, updated: Partial<Offer>) => {
    setOffers((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, ...updated } : o));
      try { localStorage.setItem('vant_offers_v1', JSON.stringify(next)); } catch {}
      saveOffersToSupabase(next);
      return next;
    });
  }, []);

  const deleteOffer = useCallback((id: string) => {
    setOffers((prev) => {
      const next = prev.filter((o) => o.id !== id);
      try { localStorage.setItem('vant_offers_v1', JSON.stringify(next)); } catch {}
      saveOffersToSupabase(next);
      return next;
    });
  }, []);

  // Subscribers adapter (bridged with newsletter.ts & Supabase Cloud)
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    const raw = getStoredSubscribers();
    if (raw && raw.length > 0) {
      return raw.map((s) => ({
        id: s.id,
        name: s.email.split('@')[0],
        email: s.email,
        phone: s.notes || '',
        status: s.status,
        totalOrders: 0,
        totalSpent: 0,
        joinedDate: s.subscribed_at ? s.subscribed_at.split('T')[0] : new Date().toISOString().split('T')[0],
        tags: s.tags || [],
      }));
    }
    return defaultSubscribers;
  });

  // Sync real subscribers from Supabase database on mount
  useEffect(() => {
    syncSubscribersFromCloud().then((cloudList) => {
      if (cloudList && Array.isArray(cloudList)) {
        setSubscribers(
          cloudList.map((s) => ({
            id: s.id,
            name: s.email.split('@')[0],
            email: s.email,
            phone: s.notes || '',
            status: s.status,
            totalOrders: 0,
            totalSpent: 0,
            joinedDate: s.subscribed_at ? s.subscribed_at.split('T')[0] : new Date().toISOString().split('T')[0],
            tags: s.tags || [],
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const addSubscriber = useCallback((newSub: Omit<Subscriber, 'id' | 'joinedDate' | 'totalOrders' | 'totalSpent'>) => {
    const sub: Subscriber = {
      ...newSub,
      id: 'sub-' + Date.now(),
      joinedDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
    };
    addStoredSubscriber(newSub.email);
    setSubscribers((prev) => [sub, ...prev]);
  }, []);

  const deleteSubscriber = useCallback((id: string) => {
    const target = subscribers.find((s) => s.id === id);
    if (target) {
      removeStoredSubscriber(target.email);
    }
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  }, [subscribers]);

  // Load orders from Supabase on mount
  useEffect(() => {
    async function loadOrders() {
      let data: any = null;
      let error: any = null;

      if (supabase) {
        try {
          const res = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          data = res.data;
          error = res.error;
          console.log("Supabase Fetch Result:", data);
          console.log("Supabase Fetch Error:", error);
        } catch (err) {
          error = err;
          console.log("Supabase Fetch Result:", null);
          console.log("Supabase Fetch Error:", err);
        }
      }

      if (!error && data && Array.isArray(data)) {
        const mappedOrders: Order[] = data.map((d: any) => {
          const parsedItems = Array.isArray(d.items)
            ? d.items
            : typeof d.items === 'string'
            ? (() => { try { return JSON.parse(d.items); } catch { return []; } })()
            : [];

          const parsedTimeline = Array.isArray(d.timeline)
            ? d.timeline
            : typeof d.timeline === 'string'
            ? (() => { try { return JSON.parse(d.timeline); } catch { return []; } })()
            : [];

          return {
            id: String(d.id || d.order_id || d.code || 'ORD-' + Math.floor(1000 + Math.random() * 9000)),
            customerName: d.customer_name || d.customerName || d.name || 'عميل كونسيرج',
            customerPhone: d.customer_phone || d.customerPhone || d.phone || '',
            customerEmail: d.customer_email || d.customerEmail || d.email || '',
            shippingAddress: d.shipping_address || d.shippingAddress || d.address || '',
            items: parsedItems,
            totalPrice: Number(d.total_price || d.totalPrice || d.total || d.amount || 0),
            status: d.status || 'pending_payment',
            orderDate: d.created_at || d.order_date || d.orderDate || new Date().toISOString(),
            type: d.type || 'ready_to_wear',
            isVip: Boolean(d.is_vip || d.isVip),
            bespokeDetails: d.bespoke_details || d.bespokeDetails,
            timeline: parsedTimeline,
            paymentMethod: d.payment_method || d.paymentMethod || 'cash_on_delivery',
            trackingNumber: d.tracking_number || d.trackingNumber,
          };
        });
        setOrders(mappedOrders);
        try { localStorage.setItem('vant_orders_v1', JSON.stringify(mappedOrders)); } catch {}
        return;
      }

      // Fallback: fetch orders stored in Supabase cloud storage if table does not exist
      if (!data) {
        const remoteOrders = await fetchOrdersFromSupabase();
        if (remoteOrders && Array.isArray(remoteOrders)) {
          setOrders(remoteOrders);
          try { localStorage.setItem('vant_orders_v1', JSON.stringify(remoteOrders)); } catch {}
          return;
        }
      }

      setOrders([]);
    }

    loadOrders();
  }, []);

  const updateOrderStatus = useCallback((id: string, newStatus: OrderStatus, note?: string) => {
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id !== id) return order;
        const now = new Date();
        const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
        const statusTitles: Record<OrderStatus, { ar: string; en: string }> = {
          pending_payment: { ar: 'بانتظار تأكيد الدفع', en: 'Pending Payment' },
          processing: { ar: 'جاري العمل في الأتيليه والتجهيز', en: 'In Atelier / Processing' },
          shipped: { ar: 'تم شحن الطلب وتحديد التتبع', en: 'Order Dispatched / Shipped' },
          delivered: { ar: 'تم التسليم بنجاح', en: 'Delivered Successfully' },
          cancelled: { ar: 'تم إلغاء الطلب', en: 'Order Cancelled' },
        };
        const newTimelineEvent: OrderTimelineEvent = {
          status: newStatus,
          title: statusTitles[newStatus]?.ar || newStatus,
          titleEn: statusTitles[newStatus]?.en || newStatus,
          timestamp,
          note: note || undefined,
        };
        return {
          ...order,
          status: newStatus,
          timeline: [...order.timeline, newTimelineEvent],
        };
      });
      try { localStorage.setItem('vant_orders_v1', JSON.stringify(updated)); } catch {}
      saveOrdersToSupabase(updated);
      return updated;
    });
  }, []);

  const updateOrderArtisanNotes = useCallback((id: string, notes: string) => {
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id !== id) return order;
        return {
          ...order,
          bespokeDetails: {
            ...order.bespokeDetails,
            artisanNotes: notes,
          },
        };
      });
      try { localStorage.setItem('vant_orders_v1', JSON.stringify(updated)); } catch {}
      saveOrdersToSupabase(updated);
      return updated;
    });
  }, []);

  const addOrder = useCallback((newOrderData: Omit<Order, 'id' | 'orderDate' | 'timeline'>) => {
    const now = new Date();
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
    const newOrder: Order = {
      ...newOrderData,
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      orderDate: timestamp,
      timeline: [
        {
          status: newOrderData.status,
          title: 'إنشاء الطلب الجديد',
          titleEn: 'Order Created',
          timestamp,
        },
      ],
    };
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try { localStorage.setItem('vant_orders_v1', JSON.stringify(updated)); } catch {}
      saveOrdersToSupabase(updated);
      return updated;
    });
  }, []);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);
  const markNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Site Settings adapter synced seamlessly with SiteControlsContext
  const siteSettings: SiteSettings = useMemo(() => {
    const sc = siteControls.siteSettings;
    return {
      storeName: sc.welcome_title_ar || 'دار ڤانت للأزياء الرفيعة',
      storeNameEn: sc.welcome_title_en || 'Maison VANT Haute Couture',
      currency: siteControls.currencyCode || 'IQD',
      emailAlerts: true,
      smsAlerts: false,
      pin: '1234',
      maintenanceMode: !!sc.maintenance_mode,
      maintenanceMessageAr: sc.maintenance_message_ar || 'نقوم حالياً بتجهيز وإطلاق المجموعة الحصرية الجديدة. سنعود لاستقبال طلباتكم الفاخرة قريباً جداً.',
      maintenanceMessageEn: sc.maintenance_message || 'We are currently curating and preparing our new exclusive collection.',
      maintenanceEstimatedBack: 'خلال وقت قصير',
      splashMotif: (sc.splash_motif === 'hanger' || sc.splash_motif === 'scissors' || sc.splash_motif === 'monogram')
        ? (sc.splash_motif as any)
        : 'hanger',
      splashTextAr: sc.loading_text_ar || 'ڤانت للأزياء • أصالة الحرفة الرفيعة',
      splashTextEn: sc.loading_text_en || 'VANT • High-Fashion & Modern Silhouettes',
      splashDurationMs: 2200,
      heroBannerBg: siteControls.controls['banner_hero_bg']?.actionValue || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
      heroHeadlineAr: siteControls.controls['banner_hero_title']?.label_ar || 'الصياغة المعمارية للأزياء الهادئة',
      heroHeadlineEn: siteControls.controls['banner_hero_title']?.label_en || 'Architectural Silhouettes in Virgin Wool',
      heroSubtitleAr: siteControls.controls['banner_hero_subtitle']?.label_ar || 'تصاميم تم تفصيلها بدقة هندسية في أرقى المعامل الإيطالية.',
      heroSubtitleEn: siteControls.controls['banner_hero_subtitle']?.label_en || 'Engineered with sculptural precision from virgin Italian wool.',
      heroBadgeAr: siteControls.controls['banner_hero_tag']?.label_ar || 'ڤانت · كتالوج موسم 2026',
      heroBadgeEn: siteControls.controls['banner_hero_tag']?.label_en || 'MAISON VANT · WINTER CAPSULE 2026',
      heroCtaTextAr: siteControls.controls['banner_hero_btn']?.label_ar || 'تصفح كافة القطع',
      heroCtaTextEn: siteControls.controls['banner_hero_btn']?.label_en || 'Browse All Pieces',
      heroCtaLink: '#products',
      whatsappOrdersNumber: siteControls.controls['cfg_whatsapp_phone']?.actionValue || '+9647701234567',
      whatsappOrdersName: 'قسم إدارة واستلام الطلبات الفورية',
      whatsappConciergeNumber: siteControls.controls['cfg_bespoke_phone']?.actionValue || '+9647809876543',
      whatsappConciergeName: 'كونسيرج التفصيل الخاص والخياطة الراقية',
      whatsappDefaultMsg: 'مرحباً، أود الاستفسار عن تفصيل قطعة خاصة من دار ڤانت.',
    };
  }, [siteControls.siteSettings, siteControls.currencyCode, siteControls.controls]);

  const updateSiteSettings = useCallback(async (partial: Partial<SiteSettings>): Promise<{ success: boolean; syncedWithCloud: boolean }> => {
    const scPatch: any = {};
    if (partial.maintenanceMode !== undefined) {
      scPatch.maintenance_mode = partial.maintenanceMode;
    }
    if (partial.maintenanceMessageAr !== undefined) {
      scPatch.maintenance_message_ar = partial.maintenanceMessageAr;
    }
    if (partial.maintenanceMessageEn !== undefined) {
      scPatch.maintenance_message = partial.maintenanceMessageEn;
    }
    if (partial.storeName !== undefined) {
      scPatch.welcome_title_ar = partial.storeName;
    }
    if (partial.storeNameEn !== undefined) {
      scPatch.welcome_title_en = partial.storeNameEn;
    }
    if (partial.splashTextAr !== undefined) {
      scPatch.loading_text_ar = partial.splashTextAr;
    }
    if (partial.splashTextEn !== undefined) {
      scPatch.loading_text_en = partial.splashTextEn;
    }
    if (partial.splashMotif !== undefined) {
      scPatch.splash_motif = partial.splashMotif;
    }
    if (partial.currency && (partial.currency === 'د.ع' || partial.currency === 'IQD' || partial.currency === 'USD')) {
      siteControls.setCurrencyCode(partial.currency as any);
    }
    if (partial.pin) {
      siteControls.setAdminPin(partial.pin);
    }
    if (partial.heroHeadlineAr) {
      siteControls.updateControl('banner_hero_title', { label_ar: partial.heroHeadlineAr });
    }
    if (partial.heroHeadlineEn) {
      siteControls.updateControl('banner_hero_title', { label_en: partial.heroHeadlineEn });
    }
    if (partial.heroSubtitleAr) {
      siteControls.updateControl('banner_hero_subtitle', { label_ar: partial.heroSubtitleAr });
    }
    if (partial.heroSubtitleEn) {
      siteControls.updateControl('banner_hero_subtitle', { label_en: partial.heroSubtitleEn });
    }
    if (partial.heroBannerBg) {
      siteControls.updateControl('banner_hero_bg', { actionValue: partial.heroBannerBg });
    }
    if (partial.whatsappOrdersNumber) {
      siteControls.updateControl('cfg_whatsapp_phone', { actionValue: partial.whatsappOrdersNumber });
    }
    if (partial.whatsappConciergeNumber) {
      siteControls.updateControl('cfg_bespoke_phone', { actionValue: partial.whatsappConciergeNumber });
    }

    await siteControls.updateSiteSettings(scPatch);
    return { success: true, syncedWithCloud: true };
  }, [siteControls]);

  // Sync document direction
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  return (
    <AdminContext.Provider
      value={{
        activeView,
        setActiveView,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
        isLocked,
        lock,
        unlock,
        pin,
        setPin,
        lang,
        setLang,
        toggleLang,
        currentStore,
        setCurrentStore,
        isLiveDatabase: siteControls.isLiveDatabase,
        isCloudSynced: siteControls.isCloudSynced,
        lastSyncTime: siteControls.lastSyncTime ? (siteControls.lastSyncTime instanceof Date ? siteControls.lastSyncTime.toISOString() : String(siteControls.lastSyncTime)) : null,
        refreshProducts: siteControls.refreshProducts,
        syncAllToSupabaseCloud: siteControls.syncAllToSupabaseCloud,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductOffer,
        offers,
        addOffer,
        updateOffer,
        deleteOffer,
        subscribers,
        addSubscriber,
        deleteSubscriber,
        orders,
        updateOrderStatus,
        updateOrderArtisanNotes,
        addOrder,
        notifications,
        markNotificationsAsRead,
        isOfferModalOpen,
        setIsOfferModalOpen,
        siteSettings,
        updateSiteSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminBridge = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminBridge must be used within an AdminProvider');
  }
  return context;
};

export default useAdminBridge;

import { supabase } from '../supabase';

export interface AnalyticsEvent {
  id: string;
  type:
    | 'page_view'
    | 'product_view'
    | 'wishlist_toggle'
    | 'size_select'
    | 'whatsapp_order'
    | 'search_query'
    | 'category_filter'
    | 'availability_filter'
    | 'fit_calculator'
    | 'image_slide'
    | 'size_guide_open'
    | 'coupon_copied'
    | 'engagement_heartbeat'
    | 'system_error';
  timestamp: number;
  device: 'mobile' | 'desktop' | 'tablet';
  sessionId: string;
  data: Record<string, any>;
  isCloudLog?: boolean;
}

// -------------------------------------------------------------
// ALGORITHM 1: HESITATION & ABANDONMENT WITH 1-CLICK RECOVERY
// -------------------------------------------------------------
export type HesitationType =
  | 'sizing_hesitation'
  | 'price_hesitation'
  | 'checkout_stalled'
  | 'catalog_bounce';

export interface HesitationSignal {
  id: string;
  sessionId: string;
  type: HesitationType;
  title: string;
  details: string;
  targetProductId?: string;
  targetProductTitle?: string;
  targetProductPrice?: number;
  targetSize?: string;
  dwellSeconds: number;
  hesitationScore: number; // 0 - 100
  urgency: 'critical' | 'high' | 'medium';
  suggestedAction: string;
  recoveryWhatsAppMessage: string;
  suggestedPromoCode?: string;
  timestamp: number;
  isFromCloud?: boolean;
}

// -------------------------------------------------------------
// ALGORITHM 2: CUSTOMER PERSONAS & INTENT SCORING (0 - 100)
// -------------------------------------------------------------
export type CustomerPersonaType =
  | 'vip'
  | 'high_intent'
  | 'hesitant_buyer'
  | 'deal_hunter'
  | 'fashion_enthusiast'
  | 'trend_explorer'
  | 'window_shopper';

export interface CustomerTasteFingerprint {
  primaryCategory: string;
  preferredSize?: string;
  avgViewedPrice: number;
  imageInteractionCount: number;
  fitCalculatorUsed: boolean;
  couponInteractions: number;
}

export interface CustomerSessionProfile {
  sessionId: string;
  device: 'mobile' | 'desktop' | 'tablet';
  governorate: string;
  firstSeen: number;
  lastSeen: number;
  durationSeconds: number;
  eventsCount: number;
  productsViewed: Array<{ id: string; title: string; views: number; lastTime: number }>;
  wishlistItems: Array<{ id: string; title: string }>;
  whatsappOrders: Array<{ id: string; title: string; size?: string; price?: number; time: number }>;
  sizesSelected: string[];
  searchQueries: string[];
  categoriesExplored: string[];
  leadScore: number; // 0 - 100
  intentTier: 'vip' | 'high_intent' | 'enthusiast' | 'explorer' | 'browser';
  isHesitantBuyer?: boolean;
  hesitationReason?: string;
  isFromCloud?: boolean;
  // Algorithmic Enrichments:
  persona: CustomerPersonaType;
  personaLabel: string;
  personaBadgeColor: string;
  tasteFingerprint: CustomerTasteFingerprint;
  hesitationSignal?: HesitationSignal;
  journeyTimeline: Array<{
    id: string;
    type: string;
    label: string;
    timestamp: number;
    elapsedFormatted: string;
    details?: string;
  }>;
}

// -------------------------------------------------------------
// ALGORITHM 3: PREDICTIVE DEMAND, SIZING MATRIX & SEARCH
// -------------------------------------------------------------
export interface DemandVelocityItem {
  id: string | number;
  title: string;
  views: number;
  wishlistAdds: number;
  whatsappClicks: number;
  velocityScore: number; // Dynamic real velocity rating
  demandStatus: 'hot_trending' | 'steady_interest' | 'cold_dormant';
  statusLabelAr: string;
  statusLabelEn: string;
  recommendedAction: string;
}

export interface UnmetSearchInsight {
  term: string;
  count: number;
  matchedResultsCount: number;
  status: 'found' | 'zero_results';
  suggestedAction: string;
}

export interface SizeDemandComparison {
  size: string;
  demandCount: number;
  demandPercentage: number;
  stockCount: number;
  stockPercentage: number;
  status: 'deficit_warning' | 'balanced' | 'surplus';
  statusLabelAr: string;
  recommendation: string;
}

export interface FunnelDropOffDiagnosis {
  catalogViews: number;
  productSheetOpens: number;
  sizeSelections: number;
  whatsappConversions: number;
  dropOffCatalogToProduct: number;
  dropOffProductToSize: number;
  dropOffSizeToOrder: number;
  step1ConversionRate: number; // % who inspect after viewing catalog
  step2ConversionRate: number; // % who select size after inspection
  step3ConversionRate: number; // % who order WhatsApp after choosing size
  overallConversionRate: number;
  primaryDropOffStage: 'inspection' | 'sizing' | 'whatsapp' | 'healthy';
  diagnosisMessage: string;
}

export interface SystemErrorLog {
  id: string;
  errorMessage: string;
  errorStack: string;
  errorSignature: string;
  status: 'open' | 'investigating' | 'resolved';
  isRegression?: boolean;
  timestamp: number;
  formattedTime: string;
  url: string;
  userAgent: string;
  device: string;
  sessionId: string;
  visitorId: string;
  visitCount: number;
  occurrencesCount?: number;
}

export interface UserBehaviorStats {
  totalPageViews: number;
  totalProductViews: number;
  totalWishlistAdds: number;
  totalWhatsAppClicks: number;
  uniqueVisitors: number;
  uniquePersistentVisitors: number;
  totalVisits: number;
  activeOnlineNow: number;
  avgSessionSeconds: number;
  conversionRate: number; // percentage
  topProducts: Array<{
    id: string | number;
    title: string;
    views: number;
    wishlistAdds: number;
    whatsappClicks: number;
    conversionPct: number;
  }>;
  popularSearches: Array<{
    term: string;
    count: number;
  }>;
  categoryDistribution: Record<string, number>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  governoratesDistribution: Array<{
    name_ar: string;
    name_en: string;
    count: number;
    percentage: number;
  }>;
  sizeDemandBreakdown: Array<{
    size: string;
    count: number;
    percentage: number;
  }>;
  customerSessions: CustomerSessionProfile[];
  hesitantBuyersCount: number;
  // Algorithmic Extensions:
  hesitationSignals: HesitationSignal[];
  demandVelocity: DemandVelocityItem[];
  unmetSearches: UnmetSearchInsight[];
  sizeStockMatrix: SizeDemandComparison[];
  personaDistribution: Record<CustomerPersonaType, number>;
  systemErrors: SystemErrorLog[];
  funnel: {
    catalogViews: number;
    productSheetOpens: number;
    sizeSelections: number;
    whatsappConversions: number;
  };
  funnelDiagnosis: FunnelDropOffDiagnosis;
  hourlyTraffic: Array<{
    hour: string;
    visitors: number;
  }>;
  lastEventTime: number | null;
}

export const STORAGE_KEY = 'vant_real_analytics_events_v3';
export const SESSION_ID_KEY = 'vant_visitor_session_id_v3';
export const PERSISTENT_VISITOR_ID_KEY = 'vant_persistent_visitor_id';
export const VISIT_COUNT_KEY = 'vant_visit_count';
export const LAST_ACTIVITY_KEY = 'vant_last_activity_timestamp';
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const TELEMETRY_FILE = 'telemetry/events_stream.json';

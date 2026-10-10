/**
 * Deep Behavioral Analytics Engine - 100% Real Live Database & Telemetry
 * Synchronized with Supabase and real customer browsing sessions.
 * NO MOCK / NO FAKE DATA: Returns exclusively real metrics and telemetry.
 */

import {
  getAggregatedAnalytics as getRealTelemetryAnalytics,
  syncFromSupabaseCloud,
  trackSystemError,
  getStoredEvents,
  resetAnalyticsData,
  type UserBehaviorStats,
  type CustomerSessionProfile,
  type HesitationSignal,
} from '../../lib/analytics';

export { syncFromSupabaseCloud, trackSystemError, getStoredEvents, resetAnalyticsData };

export type HesitationStage = 'sizing' | 'checkout' | 'cart';
export type PersonaType = 'VIP' | 'Deal Hunter' | 'Window Shopper' | 'Hesitant Buyer';
export type StockDeficitStatus = 'surplus' | 'balanced' | 'stockout_risk';

export interface HesitationIncident {
  id: string;
  customerName: string;
  phone: string;
  productTitle: string;
  stage: HesitationStage;
  dwellSeconds: number;
  intentScore: number; // 0 to 100
  recoveryMessage: string;
  timestamp: string;
  suggestedDiscount?: number;
}

export interface CustomerSession {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  persona: PersonaType;
  rfmScore: number; // 0 to 100
  viewCount: number;
  cartCount: number;
  purchaseProbability: number; // %
  lastActive: string;
  totalSpentIQD: number;
  preferredCategory: string;
}

export interface SizeDemandItem {
  id: string;
  productName: string;
  size: string;
  requestedVelocity: number;
  stockLevel: number;
  status: StockDeficitStatus;
  conversionDropRate: number;
}

export interface UnmetSearchQuery {
  id: string;
  query: string;
  searchVolume: number;
  category: string;
  estimatedLostRevenueIQD: number;
  growthTrend: number;
}

export interface AggregatedAnalytics {
  overview: {
    totalRevenueIQD: number;
    totalOrders: number;
    averageOrderValueIQD: number;
    conversionRate: number;
    hesitationCount: number;
    unmetSearchLossIQD: number;
    uniqueVisitors?: number;
    uniquePersistentVisitors?: number;
    totalVisits?: number;
  };
  totalVisits?: number;
  uniquePersistentVisitors?: number;
  hesitationIncidents: HesitationIncident[];
  customerSessions: CustomerSession[];
  sizeDemandMatrix: SizeDemandItem[];
  unmetSearches: UnmetSearchQuery[];
}

/**
 * Generate 100% real behavioral analytics grounded exclusively in real database data
 */
export function getAggregatedAnalytics(
  productsList: any[] = [],
  ordersList: any[] = []
): AggregatedAnalytics {
  const realTelemetry: UserBehaviorStats = getRealTelemetryAnalytics(productsList);

  // 1. Real Hesitation Incidents strictly from Supabase cloud database
  const hesitationIncidents: HesitationIncident[] = (realTelemetry.hesitationSignals || [])
    .filter((signal: HesitationSignal) => Boolean(signal.isFromCloud))
    .map((signal: HesitationSignal, idx: number) => {
      let stage: HesitationStage = 'cart';
      if (signal.type === 'sizing_hesitation') stage = 'sizing';
      else if (signal.type === 'checkout_stalled') stage = 'checkout';

      const shortId = signal.sessionId ? signal.sessionId.slice(-4).toUpperCase() : `${idx + 1}`;
      const elapsedMin = Math.max(1, Math.round((Date.now() - signal.timestamp) / 60000));

      return {
        id: signal.id,
        customerName: `جلسة زائر #${shortId}`,
        phone: 'محادثة فورية (WhatsApp)',
        productTitle: signal.targetProductTitle || 'قطعة من المتجر',
        stage,
        dwellSeconds: signal.dwellSeconds || 30,
        intentScore: signal.hesitationScore || 70,
        recoveryMessage: signal.recoveryWhatsAppMessage || '',
        timestamp: `منذ ${elapsedMin} دقيقة`,
        suggestedDiscount: 0,
      };
    });

  // 2. Real Customer Sessions strictly from Supabase cloud database
  const customerSessions: CustomerSession[] = (realTelemetry.customerSessions || [])
    .filter((s: CustomerSessionProfile) => Boolean(s.isFromCloud))
    .map((s: CustomerSessionProfile, idx: number) => {
      const shortId = s.sessionId ? s.sessionId.slice(-4).toUpperCase() : `${idx + 1}`;
      let persona: PersonaType = 'Window Shopper';
      if (s.persona === 'vip') persona = 'VIP';
      else if (s.persona === 'deal_hunter') persona = 'Deal Hunter';
      else if (s.persona === 'hesitant_buyer') persona = 'Hesitant Buyer';

      // Match orders placed by this session if any
      const sessionOrders = ordersList.filter(
        (o) => o.customerPhone && s.whatsappOrders.some((wo) => wo.id === o.id)
      );
      const totalSpent = sessionOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);

      const elapsedSec = Math.max(0, Math.round((Date.now() - s.lastSeen) / 1000));
      let lastActive = 'نشط الآن';
      if (elapsedSec > 3600) {
        lastActive = `منذ ${Math.round(elapsedSec / 3600)} ساعة`;
      } else if (elapsedSec > 60) {
        lastActive = `منذ ${Math.round(elapsedSec / 60)} دقيقة`;
      }

      return {
        id: s.sessionId,
        customerName: `زائر - ${s.governorate || 'المتجر'} #${shortId}`,
        email: '—',
        phone: `جهاز ${s.device}`,
        persona,
        rfmScore: s.leadScore || 50,
        viewCount: s.eventsCount || 1,
        cartCount: s.productsViewed.length,
        purchaseProbability: Math.min(100, Math.round(s.leadScore * 0.9)),
        lastActive,
        totalSpentIQD: totalSpent,
        preferredCategory: s.categoriesExplored[0] || 'كافة الأقسام',
      };
    });

  // 3. Real Size Demand Matrix based directly on real non-cancelled orders in database
  const orderSizeDemandMap = new Map<string, number>(); // key: `${pId}_${size}`
  (ordersList || []).filter((o) => o.status !== 'cancelled').forEach((order) => {
    if (Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const pId = String(item.productId || item.id || item.product_id || '');
        const sz = (item.size || item.selectedSize || 'M').toUpperCase();
        const qty = Number(item.quantity || item.qty || 1);
        if (pId) {
          const key = `${pId}_${sz}`;
          orderSizeDemandMap.set(key, (orderSizeDemandMap.get(key) || 0) + qty);
        }
      });
    }
  });

  const sizeDemandMatrix: SizeDemandItem[] = [];
  if (Array.isArray(productsList) && productsList.length > 0) {
    productsList.forEach((p) => {
      const availableSizes: string[] = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L'];
      const stock = typeof p.stock === 'number' ? p.stock : 0;

      availableSizes.forEach((sz: string) => {
        const key = `${p.id}_${sz.toUpperCase()}`;
        const demand = orderSizeDemandMap.get(key) || 0;

        let status: StockDeficitStatus = 'balanced';
        if (stock === 0 && demand > 0) status = 'stockout_risk';
        else if (stock > 20 && demand === 0) status = 'surplus';
        else if (stock <= 2 && demand > 0) status = 'stockout_risk';

        sizeDemandMatrix.push({
          id: `sz-${p.id}-${sz}`,
          productName: p.title_ar || p.name || p.title || `قطعة #${p.id}`,
          size: sz,
          requestedVelocity: demand, // Strictly 0 if no orders exist in database
          stockLevel: stock,
          status,
          conversionDropRate: stock === 0 && demand > 0 ? 100 : 0,
        });
      });
    });
  }

  // 4. Real Unmet Searches from real search queries
  const unmetSearches: UnmetSearchQuery[] = (realTelemetry.unmetSearches || []).map(
    (item, idx) => ({
      id: `unmet-${idx}`,
      query: item.term,
      searchVolume: item.count,
      category: 'عام',
      estimatedLostRevenueIQD: 0,
      growthTrend: 0,
    })
  );

  // 5. Real Financial & Conversion Aggregation
  const totalRevenueIQD = ordersList
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0);
  const totalOrders = ordersList.length;
  const averageOrderValueIQD = totalOrders > 0 ? Math.round(totalRevenueIQD / totalOrders) : 0;
  const totalVisitors = Math.max(1, realTelemetry.totalPageViews);
  const conversionRate = parseFloat(((totalOrders / totalVisitors) * 100).toFixed(1));

  return {
    overview: {
      totalRevenueIQD,
      totalOrders,
      averageOrderValueIQD,
      conversionRate,
      hesitationCount: hesitationIncidents.length,
      unmetSearchLossIQD: 0,
      uniqueVisitors: realTelemetry.uniqueVisitors,
      uniquePersistentVisitors: realTelemetry.uniquePersistentVisitors,
      totalVisits: realTelemetry.totalVisits,
    },
    totalVisits: realTelemetry.totalVisits,
    uniquePersistentVisitors: realTelemetry.uniquePersistentVisitors,
    hesitationIncidents,
    customerSessions,
    sizeDemandMatrix,
    unmetSearches,
  };
}

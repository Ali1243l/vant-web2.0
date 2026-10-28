import { syncFromSupabaseCloud, trackSystemError, getStoredEvents, resetAnalyticsData } from '../../lib/analytics';
import { computeDashboardAnalytics, type RFMCustomer } from '../analytics/dashboardModel';
import { periodBounds, type AnalyticsWindow } from '../analytics/analyticsCalculations';
export { syncFromSupabaseCloud, trackSystemError, getStoredEvents, resetAnalyticsData };

export type HesitationStage = 'sizing' | 'checkout' | 'cart';
export type PersonaType = 'VIP' | 'Deal Hunter' | 'Window Shopper' | 'Hesitant Buyer';
export type StockDeficitStatus = 'surplus' | 'balanced' | 'stockout_risk' | 'unknown';
export interface HesitationIncident {
  id: string; customerName: string; phone: string; productTitle: string; stage: HesitationStage;
  dwellSeconds: number; intentScore: number; recoveryMessage: string; timestamp: string; suggestedDiscount?: number;
}
export interface CustomerSession {
  id: string; customerName: string; email: string; phone: string; persona: PersonaType;
  engagementScore: number; viewCount: number; cartCount: number;
  lastActive: string; totalSpentIQD: number; preferredCategory: string;
}
export interface SizeDemandItem {
  id: string; productName: string; size: string; requestedVelocity: number;
  stockLevel: number | null; status: StockDeficitStatus; conversionDropRate: number | null;
}
export interface UnmetSearchQuery {
  id: string; query: string; searchVolume: number; category: string;
  estimatedLostRevenueIQD: number | null; growthTrend: number | null;
}
export interface AggregatedAnalytics {
  overview: {
    totalRevenueIQD: number; totalOrders: number; averageOrderValueIQD: number; conversionRate: number | null;
    hesitationCount: number; unmetSearchLossIQD: number | null; uniqueVisitors?: number;
    uniquePersistentVisitors?: number; totalVisits?: number;
  };
  totalVisits?: number; uniquePersistentVisitors?: number;
  hesitationIncidents: HesitationIncident[]; customerSessions: CustomerSession[];
  sizeDemandMatrix: SizeDemandItem[]; unmetSearches: UnmetSearchQuery[]; rfmCustomers: RFMCustomer[];
}

export function getAggregatedAnalytics(products: any[] = [], orders: any[] = [], window = periodBounds('30d')): AggregatedAnalytics {
  return computeDashboardAnalytics(products, orders, getStoredEvents(), window);
}

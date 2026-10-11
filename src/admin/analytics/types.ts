export type AnalyticsTab = 'overview' | 'hesitation' | 'personas' | 'demand-sizing' | 'system-health';
export type TimeRange = '7d' | '30d' | '90d' | 'year' | 'custom';
export type ChartMetric = 'both' | 'sales' | 'orders';

export interface ChartDataPoint {
  labelAr: string;
  labelEn: string;
  sales: number;
  orders: number;
}

export interface DatasetPeriod {
  titleAr: string;
  titleEn: string;
  subAr: string;
  subEn: string;
  points: ChartDataPoint[];
  totalRevenue: number;
  totalOrders: number;
  avgAov: number;
  growth: string;
  peakAr: string;
  peakEn: string;
  growthVal: number;
  prevRevenue: number;
  prevOrders: number;
  prevAov: number;
}

export interface KPICardStat {
  titleAr: string;
  titleEn: string;
  value: number | string;
  valueText?: string;
  isCurrency?: boolean;
  subAr: string;
  subEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface CategoryShareItem {
  nameAr: string;
  nameEn: string;
  sales: number;
  percentage: number;
  color: string;
}

export interface RecentOrderItem {
  id: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  status: string;
  statusLabelAr: string;
  statusLabelEn: string;
}

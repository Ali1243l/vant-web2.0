import React from 'react';
import { motion } from 'motion/react';
import { Layers } from 'lucide-react';
import { Card, StatusBadge, Button } from '../ui';
import { formatCurrency, formatNumber } from '../format';
import type { Product } from '../useAdminBridge';
import type {
  KPICardStat,
  DatasetPeriod,
  ChartDataPoint,
  ChartMetric,
  CategoryShareItem,
  RecentOrderItem,
  AnalyticsTab,
} from './types';

interface Props {
  stats: KPICardStat[];
  currentDataset: DatasetPeriod;
  chartData: ChartDataPoint[];
  maxSales: number;
  maxOrders: number;
  chartMetric: ChartMetric;
  setChartMetric: (metric: ChartMetric) => void;
  hoveredDataIndex: number | null;
  setHoveredDataIndex: (index: number | null) => void;
  setSelectedBarData: (bar: ChartDataPoint) => void;
  categoriesShare: CategoryShareItem[];
  analyticsData: any;
  setActiveTab: (tab: AnalyticsTab) => void;
  products: Product[];
  setActiveView: (view: any) => void;
  recentOrders: RecentOrderItem[];
  isAr: boolean;
}

export const OverviewTab: React.FC<Props> = ({
  stats,
  currentDataset,
  chartData,
  maxSales,
  maxOrders,
  chartMetric,
  setChartMetric,
  hoveredDataIndex,
  setHoveredDataIndex,
  setSelectedBarData,
  categoriesShare,
  analyticsData,
  setActiveTab,
  products,
  setActiveView,
  recentOrders,
  isAr,
}) => {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Card key={idx} hoverable className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">
                  {isAr ? s.titleAr : s.titleEn}
                </span>
                <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-2 mb-2">
                <span className="text-2xl font-bold text-white tracking-tight font-mono">
                  {s.valueText ||
                    (s.isCurrency
                      ? formatCurrency(s.value as number, 'IQD', isAr ? 'ar' : 'en')
                      : formatNumber(s.value as number, isAr ? 'ar' : 'en'))}
                </span>
              </div>

              <div className="text-[11px] text-slate-500">
                {isAr ? s.subAr : s.subEn}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2 columns) */}
        <Card className="lg:col-span-2 flex flex-col justify-between bg-slate-900/50 backdrop-blur-xl border-slate-800/80">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? currentDataset.titleAr : currentDataset.titleEn}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr ? currentDataset.subAr : currentDataset.subEn}
                </p>
              </div>

              {/* Interactive metric toggle buttons: Sales | Orders | Both */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setChartMetric('sales')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    chartMetric === 'sales'
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>{isAr ? 'المبيعات' : 'Sales'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('orders')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    chartMetric === 'orders'
                      ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{isAr ? 'الطلبات' : 'Orders'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('both')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    chartMetric === 'both'
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {isAr ? 'كلاهما (مقارنة)' : 'Both'}
                </button>
              </div>
            </div>

            {/* Interactive Bar Chart */}
            <div className="h-64 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2">
              {chartData.map((bar, index) => {
                const salesPercent = (bar.sales / maxSales) * 100;
                const ordersPercent = (bar.orders / maxOrders) * 100;
                const activeHeight =
                  chartMetric === 'sales'
                    ? salesPercent
                    : chartMetric === 'orders'
                    ? ordersPercent
                    : salesPercent;
                const isHovered = hoveredDataIndex === index;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredDataIndex(index)}
                    onMouseLeave={() => setHoveredDataIndex(null)}
                    onClick={() => setSelectedBarData(bar)}
                    title={isAr ? 'اضغط لعرض تفاصيل الفترة' : 'Click for period breakdown'}
                  >
                    {/* Tooltip on Hover */}
                    <div
                      className={`text-[10px] bg-slate-800 text-white px-2 py-1.5 rounded-lg border border-slate-700 shadow-xl pointer-events-none transition-opacity whitespace-nowrap z-20 ${
                        isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      }`}
                    >
                      <div className="font-mono font-bold text-indigo-300">
                        {formatCurrency(bar.sales, 'IQD', isAr ? 'ar' : 'en')}
                      </div>
                      <div className="text-emerald-400 font-medium">
                        {bar.orders} {isAr ? 'طلب مكتمل' : 'orders'}
                      </div>
                    </div>

                    {/* Bar visual */}
                    <div className="w-full bg-slate-800/60 rounded-t-lg relative flex items-end overflow-hidden h-44">
                      <div
                        style={{ height: `${activeHeight}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          chartMetric === 'orders'
                            ? isHovered
                              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40'
                              : 'bg-emerald-600/80 hover:bg-emerald-500'
                            : isHovered
                            ? 'bg-indigo-500 shadow-lg shadow-indigo-500/40'
                            : 'bg-indigo-600/80 hover:bg-indigo-500'
                        }`}
                      />
                    </div>

                    {/* Day / Period label */}
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                      {isAr ? bar.labelAr : bar.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">
              {isAr ? currentDataset.peakAr : currentDataset.peakEn}
            </span>
            <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              {currentDataset.growth} {isAr ? 'نمو مقارن' : 'Growth'}
            </span>
          </div>
        </Card>

        {/* Categories Share & Inventory Summary (1 column) */}
        <Card className="flex flex-col justify-between bg-slate-900/50 backdrop-blur-xl border-slate-800/80">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white">
                {isAr ? 'توزيع المبيعات حسب الفئة' : 'Sales by Category'}
              </h3>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              {categoriesShare.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  {isAr ? 'لا توجد تصنيفات مسجلة في قاعدة البيانات' : 'No categories recorded in database'}
                </div>
              ) : (
                categoriesShare.map((cat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">
                        {isAr ? cat.nameAr : cat.nameEn}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {formatCurrency(cat.sales, 'IQD', isAr ? 'ar' : 'en')} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${cat.percentage}%` }}
                        className={`h-full rounded-full ${cat.color}`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="my-6 border-t border-slate-800/80" />

            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">
                {isAr ? 'المؤشرات السلوكية المرصودة' : 'Behavioral Telemetry'}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 text-xs">
                <span className="text-slate-400">{isAr ? 'حالات التردد الحالية' : 'Hesitation Incidents'}</span>
                <span className="font-bold text-rose-400 font-mono">
                  {analyticsData.hesitationIncidents.length} {isAr ? 'حالات' : 'cases'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 text-xs">
                <span className="text-slate-400">{isAr ? 'فرص المبيعات الضائعة بالبحث' : 'Unmet Search Demand'}</span>
                <span className="font-bold text-amber-400 font-mono">
                  {formatCurrency(analyticsData.overview.unmetSearchLossIQD, 'IQD', isAr ? 'ar' : 'en')}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 text-xs">
                <span className="text-slate-400">{isAr ? 'جلسات المشترين النشطة' : 'Active Buyer Profiles'}</span>
                <span className="font-bold text-indigo-400 font-mono">
                  {analyticsData.customerSessions.length} {isAr ? 'جلسة' : 'sessions'}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('hesitation')}
            className="w-full mt-4"
          >
            {isAr ? 'فتح رادار التردد واسترجاع السلات' : 'Open Hesitation Recovery Engine'}
          </Button>
        </Card>
      </div>

      {/* Bottom Grid: Top Selling Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? 'أفضل المنتجات مبيعاً' : 'Top Performing Products'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'المنتجات ذات أعلى معدل طلب وإقبال' : 'Highest demand and order conversion'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveView('products')}>
              {isAr ? 'الكل' : 'View All'}
            </Button>
          </div>

          <div className="space-y-3">
            {products.slice(0, 4).map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {prod.imageUrl?.trim() ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-800 shrink-0 flex items-center justify-center text-slate-500 text-xs">
                      —
                    </div>
                  )}
                  <div className="min-w-0 text-start">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {isAr ? prod.name : prod.nameEn}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono">{prod.sku}</span>
                      <span>·</span>
                      <span className="text-indigo-400 font-medium">
                        {prod.salesCount} {isAr ? 'مبيعة' : 'sold'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-end shrink-0 ps-2">
                  <div className="text-xs font-bold text-white font-mono">
                    {formatCurrency(prod.price, 'IQD', isAr ? 'ar' : 'en')}
                  </div>
                  <div className="mt-1">
                    <StatusBadge
                      status={prod.status}
                      label={
                        prod.status === 'active'
                          ? (isAr ? 'متوفر' : 'In Stock')
                          : prod.status === 'lowStock'
                          ? (isAr ? 'منخفض' : 'Low')
                          : (isAr ? 'نفد' : 'Out')
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Orders Stream */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/80">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? 'آخر طلبات الشراء الواردة' : 'Recent Customer Orders'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'تحديث فوري لمعاملات الدفع والشحن' : 'Real-time order checkout activity'}
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                {isAr ? 'لا توجد طلبات مسجلة في قاعدة البيانات حتى الآن' : 'No customer orders recorded in database yet'}
              </div>
            ) : (
              recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800 text-start"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{ord.id}</span>
                      <span className="text-xs text-slate-300 font-medium">{ord.customer}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>{ord.date}</span>
                      <span>·</span>
                      <span>{ord.items} {isAr ? 'منتجات' : 'items'}</span>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-xs font-bold text-emerald-400 font-mono">
                      {formatCurrency(ord.total, 'IQD', isAr ? 'ar' : 'en')}
                    </div>
                    <div className="mt-1">
                      <StatusBadge
                        status={ord.status as any}
                        label={isAr ? ord.statusLabelAr : ord.statusLabelEn}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

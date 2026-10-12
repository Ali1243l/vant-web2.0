import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  CreditCard,
  Sparkles,
  Timer,
  Zap,
  Target,
  BarChart3,
  RefreshCw,
  ShieldAlert,
  Eye,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useAdminBridge } from './useAdminBridge';
import { DateRangeFilterWidget } from '../components/admin/widgets/DateRangeFilterWidget';
import {
  getAggregatedAnalytics,
  syncFromSupabaseCloud,
  resetAnalyticsData,
  getStoredEvents,
} from './lib/analytics';
import type {
  AnalyticsTab,
  TimeRange,
  ChartMetric,
  ChartDataPoint,
  KPICardStat,
} from './analytics/types';
import {
  computeDatasets,
  computeCategoriesShare,
  computeRecentOrders,
} from './analytics/analyticsCalculations';
import { OverviewTab } from './analytics/OverviewTab';
import { HesitationTab } from './analytics/HesitationTab';
import { PersonasTab } from './analytics/PersonasTab';
import { DemandSizingTab } from './analytics/DemandSizingTab';
import { SystemHealthTab } from './analytics/SystemHealthTab';
import { AnalyticsModals } from './analytics/AnalyticsModals';

export const AdminAnalyticsDashboard: React.FC = () => {
  const { lang, products, offers, subscribers, orders = [], setActiveView } = useAdminBridge();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [widgetDateRange, setWidgetDateRange] = useState<DateRange | undefined>(undefined);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const handleDateRangeWidgetChange = (range: DateRange | undefined) => {
    setWidgetDateRange(range);
    if (range?.from) {
      setCustomStartDate(format(range.from, 'yyyy-MM-dd'));
      if (range.to) {
        setCustomEndDate(format(range.to, 'yyyy-MM-dd'));
      } else {
        setCustomEndDate(format(range.from, 'yyyy-MM-dd'));
      }
      setTimeRange('custom');
    } else {
      setCustomStartDate('');
      setCustomEndDate('');
      setTimeRange('30d');
    }
  };
  const [showCustomDateModal, setShowCustomDateModal] = useState<boolean>(false);
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [refreshSeed, setRefreshSeed] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [chartMetric, setChartMetric] = useState<ChartMetric>('both');
  const [selectedBarData, setSelectedBarData] = useState<ChartDataPoint | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const isAr = lang === 'ar';

  // Live Reactive Telemetry Listener: Re-evaluate getAggregatedAnalytics whenever new events arrive
  useEffect(() => {
    const handleAnalyticsUpdate = () => {
      setRefreshSeed((prev) => prev + 1);
    };

    window.addEventListener('vant:analytics:heartbeat', handleAnalyticsUpdate);
    window.addEventListener('vant:order_created', handleAnalyticsUpdate);
    window.addEventListener('vant:hesitation_detected', handleAnalyticsUpdate);

    return () => {
      window.removeEventListener('vant:analytics:heartbeat', handleAnalyticsUpdate);
      window.removeEventListener('vant:order_created', handleAnalyticsUpdate);
      window.removeEventListener('vant:hesitation_detected', handleAnalyticsUpdate);
    };
  }, []);

  // Fetch real aggregated analytics from live products and orders
  const analyticsData = useMemo(
    () => getAggregatedAnalytics(products, orders),
    [products, orders, refreshSeed]
  );

  // Dynamic datasets computed strictly from real database orders with true date math
  const datasets = useMemo(
    () => computeDatasets(orders, isAr, customStartDate, customEndDate),
    [orders, isAr, customStartDate, customEndDate]
  );

  const currentDataset = datasets[timeRange];
  const chartData = currentDataset.points;
  const maxSales = Math.max(1, ...chartData.map((d) => d.sales));
  const maxOrders = Math.max(1, ...chartData.map((d) => d.orders));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncFromSupabaseCloud();
    } catch (err) {
      console.warn('Sync failed during refresh', err);
    } finally {
      setRefreshSeed((prev) => prev + 1);
      setIsRefreshing(false);
    }
  };

  const handleResetData = () => {
    setShowResetModal(true);
  };

  const confirmResetData = async () => {
    setIsResetting(true);
    try {
      await resetAnalyticsData();
      setRefreshSeed((prev) => prev + 1);
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setShowResetModal(false);
      }, 1200);
    } catch (err) {
      console.warn('Reset failed', err);
    } finally {
      setIsResetting(false);
    }
  };

  const systemErrorLogs = useMemo(() => {
    const allEvents = getStoredEvents();
    return allEvents.filter((ev) => ev.type === 'system_error');
  }, [refreshSeed]);

  const revenueGrowth = currentDataset.growthVal;
  const ordersGrowth =
    currentDataset.prevOrders > 0
      ? Math.round(
          ((currentDataset.totalOrders - currentDataset.prevOrders) / currentDataset.prevOrders) * 100
        )
      : currentDataset.totalOrders > 0
      ? 100
      : 0;
  const aovGrowth =
    currentDataset.prevAov > 0
      ? Math.round(((currentDataset.avgAov - currentDataset.prevAov) / currentDataset.prevAov) * 100)
      : currentDataset.avgAov > 0
      ? 100
      : 0;

  const stats: KPICardStat[] = [
    {
      titleAr: 'إجمالي الإيرادات (IQD)',
      titleEn: 'Total Revenue (IQD)',
      value: currentDataset.totalRevenue,
      isCurrency: true,
      subAr: isAr
        ? `من إجمالي ${currentDataset.totalOrders} طلب حقيقي مسجل`
        : `From ${currentDataset.totalOrders} real recorded orders`,
      subEn: `From ${currentDataset.totalOrders} real orders`,
      icon: DollarSign,
    },
    {
      titleAr: 'إجمالي الطلبات',
      titleEn: 'Total Orders',
      value: currentDataset.totalOrders,
      isCurrency: false,
      subAr: isAr
        ? `${orders.filter((o) => o.status === 'delivered').length} طلب تم تسليمه`
        : `${orders.filter((o) => o.status === 'delivered').length} delivered orders`,
      subEn: 'Delivered orders',
      icon: ShoppingBag,
    },
    {
      titleAr: 'متوسط قيمة الطلب (IQD)',
      titleEn: 'Average Order Value (IQD)',
      value: currentDataset.avgAov,
      isCurrency: true,
      subAr: isAr ? 'محسوب من طلبات قاعدة البيانات الحقيقية' : 'Calculated from real database orders',
      subEn: 'Based on real database orders',
      icon: CreditCard,
    },
    {
      titleAr: 'معدل التحويل الكلي',
      titleEn: 'Conversion Rate',
      value: 0,
      valueText: `${analyticsData.overview.conversionRate}%`,
      subAr: isAr ? 'نسبة التحويل من الزيارات الحقيقية' : 'Real visitor conversion rate',
      subEn: 'Real visitor conversion rate',
      icon: Users,
    },
    {
      titleAr: 'إجمالي الزيارات والزوار',
      titleEn: 'Total Visits & Persistent Visitors',
      value: 0,
      valueText: `${analyticsData.totalVisits || analyticsData.overview?.totalVisits || 0}`,
      subAr: isAr
        ? `عدد الزوار الفريدين: ${
            analyticsData.uniquePersistentVisitors ||
            analyticsData.overview?.uniquePersistentVisitors ||
            analyticsData.overview?.uniqueVisitors ||
            0
          } (Visitor ID)`
        : `Unique persistent visitors: ${
            analyticsData.uniquePersistentVisitors ||
            analyticsData.overview?.uniquePersistentVisitors ||
            analyticsData.overview?.uniqueVisitors ||
            0
          }`,
      subEn: `${
        analyticsData.uniquePersistentVisitors ||
        analyticsData.overview?.uniquePersistentVisitors ||
        0
      } unique persistent visitors`,
      icon: Eye,
    },
  ];

  // Category sales distribution derived strictly from real non-cancelled orders in database
  const categoriesShare = useMemo(
    () => computeCategoriesShare(products, orders, isAr),
    [products, orders, isAr]
  );

  // Real recent orders directly from database
  const recentOrders = useMemo(() => computeRecentOrders(orders, isAr), [orders, isAr]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleOpenWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabsConfig = [
    {
      id: 'overview' as const,
      labelAr: 'نظرة عامة وبيانية',
      labelEn: 'Overview & Bento',
      icon: BarChart3,
    },
    {
      id: 'hesitation' as const,
      labelAr: 'خوارزمية 1: كاشف التردد',
      labelEn: 'Algorithm 1: Hesitation Engine',
      icon: Timer,
      badge: `${analyticsData.hesitationIncidents.length}`,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'personas' as const,
      labelAr: 'خوارزمية 2: شخصيات المشترين',
      labelEn: 'Algorithm 2: Buyer Personas',
      icon: Target,
      badge: `${analyticsData.customerSessions.length}`,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'demand-sizing' as const,
      labelAr: 'خوارزمية 3: سرعة الطلب والمقاسات',
      labelEn: 'Algorithm 3: Demand Velocity',
      icon: Zap,
      badge: `${analyticsData.unmetSearches.length}`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'system-health' as const,
      labelAr: 'صحة النظام وسجلات الأخطاء',
      labelEn: 'System Health & Error Telemetry',
      icon: ShieldAlert,
      badge: `${systemErrorLogs.length}`,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* VANT UI Widgets Suite Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900/70 to-slate-900/40 border border-blue-500/25 backdrop-blur-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {isAr ? 'نظام الأدوات والوحدات المعيارية المدمج' : 'VANT UI Widgets Suite'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                {isAr ? 'مُفعّل' : 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تم دمج DateRangePicker (منتقي التواريخ الفاخر)، RangeSlider (سلايدر الأسعار)، و Pagination (التصفح المتجاوب).'
                : 'DateRangePicker, RangeSlider, and Pagination integrated across all management views.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('widgets')}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-blue-600/30 shrink-0"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>{isAr ? 'معاينة استوديو الأدوات (Widgets Studio)' : 'Open Widgets Studio'}</span>
        </button>
      </div>

      {/* Top Header Banner with Live Refresh and Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              {isAr ? 'محرك التحليلات السلوكية العميقة v2' : 'Deep Behavioral Analytics Engine v2'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isAr ? 'لوحة الذكاء السلوكي وتحليلات المتجر' : 'Store Behavioral Intelligence Hub'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {isAr
              ? 'رصد التردد، تصنيف المشترين RFM، وسرعة دوران مقاسات الكتالوج بالدينار العراقي.'
              : 'Hesitation radar, RFM buyer personas, sizing velocity & unmet demand intelligence in IQD.'}
          </p>
        </div>

        {/* Top Header Actions (Organized & Spaced Logically with Live DateRangeFilterWidget) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Live DateRangeFilterWidget directly in the dashboard toolbar */}
          {activeTab === 'overview' && (
            <DateRangeFilterWidget
              value={widgetDateRange}
              onChange={handleDateRangeWidgetChange}
              lang={isAr ? 'ar' : 'en'}
              label={isAr ? 'تصفية الفترة' : 'Date Range'}
              align="left"
            />
          )}

          {/* Time range segmented quick presets */}
          {activeTab === 'overview' && (
            <div className="flex items-center gap-0.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl shadow-inner">
              {[
                { id: '7d', labelAr: '7D', labelEn: '7D' },
                { id: '30d', labelAr: '30D', labelEn: '30D' },
                { id: '90d', labelAr: '90D', labelEn: '90D' },
                { id: 'year', labelAr: 'سنة', labelEn: 'Year' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTimeRange(t.id as TimeRange);
                    setWidgetDateRange(undefined);
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    timeRange === t.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {isAr ? t.labelAr : t.labelEn}
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons Group */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>
                {isRefreshing ? (isAr ? 'جاري التحديث...' : 'Updating...') : isAr ? 'تحديث' : 'Refresh'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-medium text-rose-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {isResetting ? (isAr ? 'جاري التصفير...' : 'Resetting...') : isAr ? 'تصفير العداد' : 'Purge Data'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar with Smooth Horizontal Touch Scrolling */}
      <div className="p-1.5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent shadow-lg shadow-black/20 w-full min-w-0 flex-nowrap touch-pan-x">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2.5 shrink-0 whitespace-nowrap select-none cursor-pointer ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/40"
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full border font-mono ${
                      isActive ? 'bg-white/20 text-white border-white/30' : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Animated Tab Content Container with AnimatePresence */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <OverviewTab
            stats={stats}
            currentDataset={currentDataset}
            chartData={chartData}
            maxSales={maxSales}
            maxOrders={maxOrders}
            chartMetric={chartMetric}
            setChartMetric={setChartMetric}
            hoveredDataIndex={hoveredDataIndex}
            setHoveredDataIndex={setHoveredDataIndex}
            setSelectedBarData={setSelectedBarData}
            categoriesShare={categoriesShare}
            analyticsData={analyticsData}
            setActiveTab={setActiveTab}
            products={products}
            setActiveView={setActiveView}
            recentOrders={recentOrders}
            isAr={isAr}
          />
        )}

        {activeTab === 'hesitation' && (
          <HesitationTab
            hesitationIncidents={analyticsData.hesitationIncidents}
            customerSessions={analyticsData.customerSessions}
            copiedMessageId={copiedMessageId}
            handleCopyMessage={handleCopyMessage}
            handleOpenWhatsApp={handleOpenWhatsApp}
            isAr={isAr}
          />
        )}

        {activeTab === 'personas' && (
          <PersonasTab customerSessions={analyticsData.customerSessions} isAr={isAr} />
        )}

        {activeTab === 'demand-sizing' && (
          <DemandSizingTab
            sizeDemandMatrix={analyticsData.sizeDemandMatrix}
            unmetSearches={analyticsData.unmetSearches}
            unmetSearchLossIQD={analyticsData.overview.unmetSearchLossIQD}
            isAr={isAr}
          />
        )}

        {activeTab === 'system-health' && (
          <SystemHealthTab
            systemErrorLogs={systemErrorLogs}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            handleRefresh={handleRefresh}
            isAr={isAr}
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnalyticsModals
        selectedBarData={selectedBarData}
        setSelectedBarData={setSelectedBarData}
        currentDataset={currentDataset}
        showCustomDateModal={showCustomDateModal}
        setShowCustomDateModal={setShowCustomDateModal}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        setTimeRange={setTimeRange}
        showResetModal={showResetModal}
        setShowResetModal={setShowResetModal}
        resetSuccess={resetSuccess}
        confirmResetData={confirmResetData}
        isResetting={isResetting}
        isAr={isAr}
      />
    </div>
  );
};

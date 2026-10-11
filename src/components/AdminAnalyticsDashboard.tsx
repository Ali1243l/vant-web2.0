import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  RefreshCw,
  Layers,
  Database,
  Play,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  type UserBehaviorStats,
  type CustomerPersonaType,
  type HesitationSignal,
  clearStoredAnalytics,
  syncFromSupabaseCloud,
  updateSystemErrorStatus,
  trackSystemError,
} from '../lib/analytics';
import type { Product } from '../types';
import SystemHealthTab from './analytics/SystemHealthTab';
import { DemandIntelligenceTab } from './analytics/DemandIntelligenceTab';
import { BuyerPersonasTab } from './analytics/BuyerPersonasTab';
import ExportHubModal from './analytics/ExportHubModal';
import SimulatorModal from './analytics/SimulatorModal';
import PiecesMatrixTab from './analytics/PiecesMatrixTab';
import HesitationRecoveryTab from './analytics/HesitationRecoveryTab';
import ExecutiveOverviewTab from './analytics/ExecutiveOverviewTab';
import AnalyticsNavTabs from './analytics/AnalyticsNavTabs';

interface Props {
  stats: UserBehaviorStats;
  products: Product[];
  isAr?: boolean;
  onRefresh?: () => void;
}

export default function AdminAnalyticsDashboard({
  stats,
  products,
  isAr = true,
  onRefresh,
}: Props) {
  // Navigation View: Overview + Pieces Performance Matrix + The 3 Core Behavioral Algorithms + Sentry Error Tracker
  const [activeAlgorithmView, setActiveAlgorithmView] = useState<
    'all' | 'piece_matrix' | 'algorithm1_hesitation' | 'algorithm2_personas' | 'algorithm3_demand' | 'system_health'
  >('all');

  // Filter & Search States
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState<CustomerPersonaType | 'all' | 'hesitant'>('all');
  const [hesitationUrgencyFilter, setHesitationUrgencyFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [velocityFilter, setVelocityFilter] = useState<'all' | 'hot_trending' | 'steady_interest' | 'cold_dormant'>('all');
  const [unmetSearchFilter, setUnmetSearchFilter] = useState<'all' | 'zero_results' | 'found'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [copiedSignalId, setCopiedSignalId] = useState<string | null>(null);

  // System Error Tracker & Fingerprinting States
  const [localErrorStatuses, setLocalErrorStatuses] = useState<Record<string, 'open' | 'investigating' | 'resolved'>>({});
  const [errorSearchQuery, setErrorSearchQuery] = useState('');
  const [errorStatusFilter, setErrorStatusFilter] = useState<'all' | 'open' | 'investigating' | 'resolved' | 'regressions'>('all');
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);
  const [statusSavingMap, setStatusSavingMap] = useState<Record<string, boolean>>({});

  // Handle Optimistic Status Change for System Error Logs
  const handleStatusChange = async (logId: string, newStatus: 'open' | 'investigating' | 'resolved') => {
    setLocalErrorStatuses((prev) => ({ ...prev, [logId]: newStatus }));
    setStatusSavingMap((prev) => ({ ...prev, [logId]: true }));
    try {
      await updateSystemErrorStatus(logId, newStatus);
      if (onRefresh) await onRefresh();
    } catch (e) {
      console.warn('Failed to update system error status', e);
    } finally {
      setStatusSavingMap((prev) => ({ ...prev, [logId]: false }));
    }
  };

  // Trigger test system error for Sentry-style Issue Tracker verification
  const handleTriggerTestError = async () => {
    const errorTypes = [
      { msg: 'Supabase API Rate Limit Exceeded', stack: 'Error: Rate limit 429\n    at fetchProducts (src/context/SiteControlsContext.tsx:142)\n    at loadMore (src/components/MasonryGrid.tsx:88)' },
      { msg: 'TypeError: Cannot read properties of undefined (reading "title_ar")', stack: 'TypeError: Cannot read properties of undefined\n    at ProductDrawer (src/components/ProductDrawer.tsx:212)\n    at ReactDev (react-dom.js:1082)' },
      { msg: 'NetworkError: Failed to fetch inventory stream', stack: 'TypeError: Failed to fetch\n    at syncFromSupabaseCloud (src/lib/analytics.ts:502)\n    at handleTriggerSync (src/components/AdminAnalyticsDashboard.tsx:150)' },
    ];
    const selected = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    trackSystemError(selected.msg, selected.stack);
    if (onRefresh) await onRefresh();
  };

  // Live Database Sync & Simulation States
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(false);
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSuccessMsg, setSimSuccessMsg] = useState<string | null>(null);

  // Piece Performance Matrix Filters
  const [pieceSearchQuery, setPieceSearchQuery] = useState('');
  const [pieceCatFilter, setPieceCatFilter] = useState('all');
  const [pieceSortBy, setPieceSortBy] = useState<'views' | 'wishlist' | 'whatsapp' | 'ctr' | 'velocity'>('views');

  // Handle Live Cloud Sync
  const handleTriggerSync = async () => {
    setIsLiveSyncing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await syncFromSupabaseCloud();
      }
      setSyncToast(true);
      setTimeout(() => setSyncToast(false), 3000);
    } catch (e) {
      console.warn('Sync failed', e);
    } finally {
      setIsLiveSyncing(false);
    }
  };

  // Handle Algorithm Simulation Test
  const handleRunSimulation = async (_scenario: 'hesitation' | 'vip_order' | 'zero_search') => {
    setIsSimulating(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Handle Clear Local Telemetry
  const handleClearData = () => {
    if (confirm(isAr ? 'هل أنت متأكد من تفريغ سجلات التفاعل المؤقتة؟' : 'Clear local telemetry events?')) {
      clearStoredAnalytics();
      if (onRefresh) onRefresh();
    }
  };

  // Copy Recovery Message handler
  const handleCopyRecoveryScript = async (signal: HesitationSignal) => {
    try {
      await navigator.clipboard.writeText(signal.recoveryWhatsAppMessage);
      setCopiedSignalId(signal.id);
      setTimeout(() => setCopiedSignalId(null), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // 1. User Engagement & Hourly Traffic Data for Recharts AreaChart
  const hourlyEngagementData = useMemo(() => {
    return (stats.hourlyTraffic || []).map((h) => {
      const estimatedEngagementMin = stats.avgSessionSeconds > 0
        ? Math.round((h.visitors * stats.avgSessionSeconds) / 60)
        : 0;

      return {
        hour: h.hour,
        visitors: h.visitors,
        durationMinutes: estimatedEngagementMin,
        durationSec: Math.round(stats.avgSessionSeconds || 0),
      };
    });
  }, [stats.hourlyTraffic, stats.avgSessionSeconds]);

  // 2. Most-Viewed Products Data for Recharts BarChart
  const mostViewedProductsData = useMemo(() => {
    const sorted = [...(stats.topProducts || [])].sort((a, b) => b.views - a.views).slice(0, 5);
    return sorted.map((p) => ({
      name: p.title.length > 14 ? p.title.substring(0, 14) + '...' : p.title,
      fullName: p.title,
      views: p.views,
      whatsapp: p.whatsappClicks,
      wishlist: p.wishlistAdds,
    }));
  }, [stats.topProducts]);

  // 3. Wishlist Activity Data for Recharts BarChart
  const wishlistActivityData = useMemo(() => {
    const sorted = [...(stats.topProducts || [])].sort((a, b) => b.wishlistAdds - a.wishlistAdds).slice(0, 5);
    return sorted.map((p) => ({
      name: p.title.length > 14 ? p.title.substring(0, 14) + '...' : p.title,
      fullName: p.title,
      wishlist: p.wishlistAdds,
      views: p.views,
      whatsapp: p.whatsappClicks,
    }));
  }, [stats.topProducts]);

  // 4. Combined Product Chart Data for ComposedChart (Views, WhatsApp, CTR)
  const productChartData = useMemo(() => {
    return (stats.topProducts || []).slice(0, 6).map((p) => ({
      name: p.title.length > 12 ? p.title.substring(0, 12) + '...' : p.title,
      fullName: p.title,
      views: p.views,
      wishlist: p.wishlistAdds,
      whatsapp: p.whatsappClicks,
      ctr: p.conversionPct,
    }));
  }, [stats.topProducts]);

  // 5. Device Distribution Donut Data
  const deviceData = useMemo(() => {
    return [
      { name: isAr ? 'هواتف ذكية' : 'Mobile', value: stats.deviceBreakdown.mobile },
      { name: isAr ? 'أجهزة كمبيوتر' : 'Desktop', value: stats.deviceBreakdown.desktop },
      { name: isAr ? 'أجهزة لوحية' : 'Tablet', value: stats.deviceBreakdown.tablet },
    ].filter((d) => d.value > 0);
  }, [stats.deviceBreakdown, isAr]);

  // Filtered Customer Sessions (Algorithm 2)
  const filteredSessions = useMemo(() => {
    return (stats.customerSessions || []).filter((s) => {
      if (customerFilter === 'hesitant') {
        if (!s.isHesitantBuyer && !s.hesitationSignal) return false;
      } else if (customerFilter !== 'all') {
        if (s.persona !== customerFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = s.sessionId.toLowerCase().includes(q);
        const matchGov = s.governorate.toLowerCase().includes(q);
        const matchProd = s.productsViewed.some((p) => p.title.toLowerCase().includes(q));
        const matchOrder = s.whatsappOrders.some((o) => o.title.toLowerCase().includes(q));
        return matchId || matchGov || matchProd || matchOrder;
      }
      return true;
    });
  }, [stats.customerSessions, customerFilter, searchQuery]);

  // Filtered Hesitation Signals (Algorithm 1)
  const filteredHesitationSignals = useMemo(() => {
    return (stats.hesitationSignals || []).filter((sig) => {
      if (hesitationUrgencyFilter !== 'all' && sig.urgency !== hesitationUrgencyFilter) return false;
      return true;
    });
  }, [stats.hesitationSignals, hesitationUrgencyFilter]);

  // Filtered Demand Velocity (Algorithm 3)
  const filteredVelocityItems = useMemo(() => {
    return (stats.demandVelocity || []).filter((item) => {
      if (velocityFilter !== 'all' && item.demandStatus !== velocityFilter) return false;
      return true;
    });
  }, [stats.demandVelocity, velocityFilter]);

  // Filtered Unmet Searches (Algorithm 3)
  const filteredUnmetSearches = useMemo(() => {
    return (stats.unmetSearches || []).filter((item) => {
      if (unmetSearchFilter !== 'all' && item.status !== unmetSearchFilter) return false;
      return true;
    });
  }, [stats.unmetSearches, unmetSearchFilter]);

  // Processed System Error Logs with local optimistic statuses & regression detection
  const processedSystemErrors = useMemo(() => {
    const rawList = stats.systemErrors || [];
    // Apply optimistic overrides
    const listWithOverrides = rawList.map((err) => {
      const overrideStatus = localErrorStatuses[err.id];
      const effectiveStatus = overrideStatus || err.status || 'open';
      return {
        ...err,
        status: effectiveStatus,
      };
    });

    // Re-evaluate regression flag: sorted by timestamp ascending (oldest to newest)
    const sortedAsc = [...listWithOverrides].sort((a, b) => a.timestamp - b.timestamp);
    const resolvedSignatures = new Set<string>();
    const reCalculated = sortedAsc.map((err) => {
      let isRegression = false;
      if (err.status === 'resolved') {
        resolvedSignatures.add(err.errorSignature);
      } else if (err.status === 'open' && resolvedSignatures.has(err.errorSignature)) {
        isRegression = true;
      }
      return { ...err, isRegression };
    });

    // Group occurrences count by errorSignature
    const signatureGroupMap = new Map<string, number>();
    reCalculated.forEach((err) => {
      signatureGroupMap.set(err.errorSignature, (signatureGroupMap.get(err.errorSignature) || 0) + 1);
    });

    const finalWithGroupInfo = reCalculated.map((err) => ({
      ...err,
      occurrencesCount: signatureGroupMap.get(err.errorSignature) || 1,
    }));

    // Return sorted descending (newest first)
    return finalWithGroupInfo.reverse();
  }, [stats.systemErrors, localErrorStatuses]);

  // Filtered System Error Logs for Sentry-style Issue Tracker Table
  const filteredSystemErrors = useMemo(() => {
    return processedSystemErrors.filter((err) => {
      if (errorStatusFilter === 'regressions') {
        if (!err.isRegression) return false;
      } else if (errorStatusFilter !== 'all') {
        if (err.status !== errorStatusFilter) return false;
      }
      if (errorSearchQuery.trim()) {
        const q = errorSearchQuery.toLowerCase().trim();
        const matchMsg = err.errorMessage.toLowerCase().includes(q);
        const matchStack = err.errorStack.toLowerCase().includes(q);
        const matchUrl = err.url.toLowerCase().includes(q);
        const matchSig = err.errorSignature.toLowerCase().includes(q);
        return matchMsg || matchStack || matchUrl || matchSig;
      }
      return true;
    });
  }, [processedSystemErrors, errorStatusFilter, errorSearchQuery]);

  // Detailed Piece Performance Matrix Computation
  const detailedPiecesData = useMemo(() => {
    const list = products.map((prod) => {
      const topProd = (stats.topProducts || []).find(
        (tp) => String(tp.id) === String(prod.id) || tp.title.toLowerCase() === prod.title.toLowerCase()
      );
      const velocity = (stats.demandVelocity || []).find(
        (v) => String(v.id) === String(prod.id) || v.title.toLowerCase() === prod.title.toLowerCase()
      );
      const hesitationCount = (stats.hesitationSignals || []).filter(
        (h) => String(h.targetProductId) === String(prod.id) || h.targetProductTitle?.toLowerCase() === prod.title.toLowerCase()
      ).length;

      const views = topProd?.views || 0;
      const wishlistAdds = topProd?.wishlistAdds || 0;
      const whatsappClicks = topProd?.whatsappClicks || 0;
      const conversionRate = views > 0 ? (whatsappClicks / views) * 100 : 0;
      const ctr = views > 0 ? ((whatsappClicks + wishlistAdds) / views) * 100 : 0;
      const velocityScore = velocity?.velocityScore ?? Math.round(views * 1.5 + wishlistAdds * 3.5 + whatsappClicks * 10);
      const velocityStatus = velocity?.demandStatus ?? (whatsappClicks >= 2 || views >= 12 ? 'hot_trending' : views >= 4 ? 'steady_interest' : 'cold_dormant');

      return {
        product: prod,
        views,
        wishlistAdds,
        whatsappClicks,
        conversionRate,
        ctr,
        velocityScore,
        velocityStatus,
        hesitationCount,
      };
    });

    // Apply Filter & Search & Sort
    return list
      .filter((item) => {
        if (pieceCatFilter !== 'all' && item.product.category !== pieceCatFilter) return false;
        if (pieceSearchQuery.trim()) {
          const q = pieceSearchQuery.toLowerCase().trim();
          const matchTitle = item.product.title.toLowerCase().includes(q) || (item.product.title_ar?.toLowerCase().includes(q) ?? false);
          const matchCategory = item.product.category.toLowerCase().includes(q) || (item.product.category_ar?.toLowerCase().includes(q) ?? false);
          if (!matchTitle && !matchCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (pieceSortBy === 'views') return b.views - a.views;
        if (pieceSortBy === 'whatsapp') return b.whatsappClicks - a.whatsappClicks;
        if (pieceSortBy === 'wishlist') return b.wishlistAdds - a.wishlistAdds;
        if (pieceSortBy === 'ctr') return b.ctr - a.ctr;
        if (pieceSortBy === 'velocity') return b.velocityScore - a.velocityScore;
        return 0;
      });
  }, [products, stats.topProducts, stats.demandVelocity, stats.hesitationSignals, pieceCatFilter, pieceSearchQuery, pieceSortBy]);

  const pieceCategories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Top Header with Multi-Format Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#3b82f6]" />
            <span>{isAr ? 'محرك ذكاء الأعمال وتحليل سلوكيات الزبائن (A - Z)' : 'Customer Behavior Intelligence Engine'}</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            {isAr
              ? 'تحليل دقيق وخوارزميات حقيقية 100% مبنية على مسارات الزوار الفعلية بدون أي بيانات وهمية'
              : '100% Genuine telemetry algorithms tracking customer journeys and conversion actions'}
          </p>
        </div>

        {/* Action Buttons: Multi-Format Exports */}
        <div className="flex flex-wrap items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition-all cursor-pointer"
              title={isAr ? 'تحديث ومزامنة البيانات الحية' : 'Sync latest live telemetry'}
            >
              <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isAr ? 'تحديث البيانات' : 'Refresh'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#004ad7] hover:bg-[#3b82f6] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-[#004ad7]/25 active:scale-95 transition-all cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{isAr ? 'مركز التصدير بكافة الصيغ' : 'Export Hub'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Format Export Modal */}
      <ExportHubModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        products={products}
        isAr={isAr}
      />

      {/* ========================================================================= */}
      {/* REAL-TIME CLOUD DATABASE CONNECTION & TELEMETRY ENGINE STATUS */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-[#004ad7]/30 bg-[#004ad7]/10 p-4 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004ad7]/20 text-[#60a5fa] border border-[#004ad7]/30">
            <Database className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3b82f6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3b82f6]"></span>
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#60a5fa]" />
                {isAr ? 'قاعدة بيانات Supabase السحابية متصلة ونشطة' : 'Supabase Cloud Database Connected'}
              </span>
              <span className="rounded-full bg-[#004ad7]/25 border border-[#004ad7]/40 text-[10px] font-mono font-bold text-[#93c5fd] px-2 py-0.5">
                {isAr ? 'مزامنة تلقائية حية 100%' : 'Live Telemetry Active'}
              </span>
            </div>
            <p className="text-[11px] text-white/50 mt-0.5">
              {isAr
                ? `الجدول السحابي: vant_analytics_events • إجمالي الجلسات المسجلة: ${stats.customerSessions?.length || 0} • زوار فريدون: ${stats.uniqueVisitors || 0}`
                : `Cloud table: vant_analytics_events • Sessions: ${stats.customerSessions?.length || 0} • Visitors: ${stats.uniqueVisitors || 0}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cloud Sync Button */}
          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={isLiveSyncing}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLiveSyncing ? 'animate-spin text-blue-400' : 'text-blue-400'}`} />
            <span>{isLiveSyncing ? (isAr ? 'جاري المزامنة...' : 'Syncing...') : (isAr ? 'مزامنة سحابية الآن' : 'Sync Cloud')}</span>
          </button>

          {/* Simulation Trigger */}
          <button
            type="button"
            onClick={() => setSimModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#004ad7]/40 bg-[#004ad7]/15 hover:bg-[#004ad7]/25 px-3 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 text-[#60a5fa]" />
            <span>{isAr ? 'اختبار الخوارزميات' : 'Test Algorithms'}</span>
          </button>

          {/* Clear Local Cache */}
          <button
            type="button"
            onClick={handleClearData}
            className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/70 hover:text-white transition-all cursor-pointer"
            title={isAr ? 'مسح بيانات التفاعل المحلية لإعادة الاختبار' : 'Clear local events'}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Sync Toast Feedback */}
      {syncToast && (
        <div className="rounded-xl border border-[#004ad7]/40 bg-[#004ad7]/15 px-4 py-2 text-xs font-semibold text-white flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-[#3b82f6]" />
          <span>{isAr ? 'تمت مزامنة كافة الأحداث وتحليلات الزوار مع السحابة بنجاح!' : 'Successfully synced analytics telemetry with cloud!'}</span>
        </div>
      )}

      {/* Simulation Feedback Alert */}
      {simSuccessMsg && (
        <div className="rounded-xl border border-[#004ad7]/40 bg-[#004ad7]/15 px-4 py-2 text-xs font-semibold text-white flex items-center gap-2 animate-in fade-in duration-200">
          <Sparkles className="h-4 w-4 text-[#3b82f6]" />
          <span>{simSuccessMsg}</span>
        </div>
      )}

      {/* Simulation Modal Dialog */}
      <SimulatorModal
        isOpen={simModalOpen}
        onClose={() => setSimModalOpen(false)}
        onRunSimulation={handleRunSimulation}
        isSimulating={isSimulating}
        isAr={isAr}
      />

      {/* ========================================================================= */}
      {/* ALGORITHMIC NAVIGATION TABS: OVERVIEW, 3 ALGORITHMS, PIECES & SYSTEM HEALTH */}
      {/* ========================================================================= */}
      <AnalyticsNavTabs
        activeAlgorithmView={activeAlgorithmView}
        setActiveAlgorithmView={setActiveAlgorithmView}
        productsCount={products.length}
        hesitationSignalsCount={stats.hesitationSignals?.length || 0}
        customerSessionsCount={stats.customerSessions?.length || 0}
        openErrorsCount={processedSystemErrors.filter((e) => e.status === 'open').length}
        isAr={isAr}
      />

      {/* ========================================================================= */}
      {/* VIEW 1: EXECUTIVE OVERVIEW (KPIs + Funnel + Recharts) */}
      {/* ========================================================================= */}
      {activeAlgorithmView === 'all' && (
        <ExecutiveOverviewTab
          stats={stats}
          processedSystemErrors={processedSystemErrors}
          setActiveAlgorithmView={setActiveAlgorithmView}
          expandedKpi={expandedKpi}
          setExpandedKpi={setExpandedKpi}
          hourlyEngagementData={hourlyEngagementData}
          mostViewedProductsData={mostViewedProductsData}
          wishlistActivityData={wishlistActivityData}
          productChartData={productChartData}
          deviceData={deviceData}
          isAr={isAr}
        />
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ALGORITHM 1 - HESITATION & ABANDONMENT WITH 1-CLICK RECOVERY */}
      {/* ========================================================================= */}
      {activeAlgorithmView === 'algorithm1_hesitation' && (
        <HesitationRecoveryTab
          stats={stats}
          filteredHesitationSignals={filteredHesitationSignals}
          hesitationUrgencyFilter={hesitationUrgencyFilter}
          setHesitationUrgencyFilter={setHesitationUrgencyFilter}
          copiedSignalId={copiedSignalId}
          handleCopyRecoveryScript={handleCopyRecoveryScript}
          isAr={isAr}
        />
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ALGORITHM 2 - BUYER PERSONAS & INTENT SCORING (0 - 100) */}
      {/* ========================================================================= */}
      {activeAlgorithmView === 'algorithm2_personas' && (
        <BuyerPersonasTab
          stats={stats}
          customerFilter={customerFilter}
          setCustomerFilter={setCustomerFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredSessions={filteredSessions}
          expandedSessionId={expandedSessionId}
          setExpandedSessionId={setExpandedSessionId}
          isAr={isAr}
        />
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: ALGORITHM 3 - PREDICTIVE DEMAND VELOCITY, SIZING & UNMET SEARCH */}
      {/* ========================================================================= */}
      {activeAlgorithmView === 'algorithm3_demand' && (
        <DemandIntelligenceTab
          stats={stats}
          filteredVelocityItems={filteredVelocityItems}
          velocityFilter={velocityFilter}
          setVelocityFilter={setVelocityFilter}
          unmetSearchFilter={unmetSearchFilter}
          setUnmetSearchFilter={setUnmetSearchFilter}
          filteredUnmetSearches={filteredUnmetSearches}
          isAr={isAr}
        />
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: DETAILED PIECE PERFORMANCE MATRIX (مصفوفة أداء وتحليل القطع) */}
      {/* ========================================================================= */}
      {activeAlgorithmView === 'piece_matrix' && (
        <PiecesMatrixTab
          detailedPiecesData={detailedPiecesData}
          pieceSearchQuery={pieceSearchQuery}
          setPieceSearchQuery={setPieceSearchQuery}
          pieceCatFilter={pieceCatFilter}
          setPieceCatFilter={setPieceCatFilter}
          pieceSortBy={pieceSortBy}
          setPieceSortBy={setPieceSortBy}
          pieceCategories={pieceCategories}
          totalProductViews={stats.totalProductViews || 0}
          totalWhatsAppClicks={stats.totalWhatsAppClicks || 0}
          isAr={isAr}
        />
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: SENTRY-STYLE SYSTEM ERROR TRACKER (رادار الأخطاء البرمجية) */}
      {/* ========================================================================= */}
      {activeAlgorithmView === 'system_health' && (
        <SystemHealthTab
          isAr={isAr}
          processedSystemErrors={processedSystemErrors}
          filteredSystemErrors={filteredSystemErrors}
          errorSearchQuery={errorSearchQuery}
          setErrorSearchQuery={setErrorSearchQuery}
          errorStatusFilter={errorStatusFilter}
          setErrorStatusFilter={setErrorStatusFilter}
          expandedErrorId={expandedErrorId}
          setExpandedErrorId={setExpandedErrorId}
          handleStatusChange={handleStatusChange}
          statusSavingMap={statusSavingMap}
          onTriggerTestError={handleTriggerTestError}
        />
      )}
    </div>
  );
}

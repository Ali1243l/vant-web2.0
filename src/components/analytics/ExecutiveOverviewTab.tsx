import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  AlertTriangle,
  Sparkles,
  Zap,
  ShieldCheck,
  Activity,
  Clock,
  Heart,
  MessageCircle,
  Layers,
  Eye,
  MousePointerClick,
  Smartphone,
} from 'lucide-react';
import type { UserBehaviorStats } from '../../lib/analytics';

const DEVICE_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
const VIEW_BAR_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8'];
const WISHLIST_BAR_COLORS = ['#f43f5e', '#fb7185', '#fda4af', '#e11d48', '#be123c'];

// Custom Luxury Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/20 bg-[#12151f]/95 p-3 shadow-2xl backdrop-blur-md text-xs z-50">
        <p className="font-bold text-white mb-1.5 pb-1 border-b border-white/10">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-white/70">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-white tabular-nums">
              {typeof entry.value === 'number'
                ? entry.dataKey === 'ctr'
                  ? `${entry.value}%`
                  : entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export interface ExecutiveOverviewTabProps {
  stats: UserBehaviorStats;
  processedSystemErrors: any[];
  setActiveAlgorithmView: (
    view: 'all' | 'piece_matrix' | 'algorithm1_hesitation' | 'algorithm2_personas' | 'algorithm3_demand' | 'system_health'
  ) => void;
  expandedKpi: string | null;
  setExpandedKpi: (kpi: string | null) => void;
  hourlyEngagementData: any[];
  mostViewedProductsData: any[];
  wishlistActivityData: any[];
  productChartData: any[];
  deviceData: any[];
  isAr?: boolean;
}

export const ExecutiveOverviewTab: React.FC<ExecutiveOverviewTabProps> = ({
  stats,
  processedSystemErrors,
  setActiveAlgorithmView,
  expandedKpi,
  setExpandedKpi,
  hourlyEngagementData,
  mostViewedProductsData,
  wishlistActivityData,
  productChartData,
  deviceData,
  isAr = true,
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Deep-Dive Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Algorithm 1 Highlight */}
        <div
          onClick={() => setActiveAlgorithmView('algorithm1_hesitation')}
          className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.05] hover:bg-rose-500/10 p-4 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span>{isAr ? 'الخوارزمية 1: كشف التردد' : 'Algorithm 1: Hesitation'}</span>
            </span>
            <span className="text-[11px] font-mono text-rose-300 font-bold group-hover:translate-x-[-4px] transition-transform">
              {isAr ? 'استعراض الحالات ↵' : 'Open ↵'}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.hesitationSignals?.length || 0}{' '}
            <span className="text-xs text-white/50 font-normal">{isAr ? 'حالة تردد نشطة' : 'signals'}</span>
          </div>
          <p className="text-[11px] text-white/60 line-clamp-1">
            {stats.hesitationSignals?.length > 0
              ? isAr
                ? `أعلى حالة حرجة: ${stats.hesitationSignals[0].title}`
                : stats.hesitationSignals[0].title
              : isAr
              ? 'لا توجد حالات تردد مسجلة حالياً.'
              : 'No active hesitation signals.'}
          </p>
        </div>

        {/* Algorithm 2 Highlight */}
        <div
          onClick={() => setActiveAlgorithmView('algorithm2_personas')}
          className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.05] hover:bg-amber-500/10 p-4 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>{isAr ? 'الخوارزمية 2: التنميط السلوكي' : 'Algorithm 2: Personas'}</span>
            </span>
            <span className="text-[11px] font-mono text-amber-300 font-bold group-hover:translate-x-[-4px] transition-transform">
              {isAr ? 'استعراض الزبائن ↵' : 'Open ↵'}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.customerSessions?.filter((s) => s.persona === 'vip' || s.persona === 'high_intent').length || 0}{' '}
            <span className="text-xs text-white/50 font-normal">{isAr ? 'عميل عالي الجاهزية (VIP)' : 'High Intent'}</span>
          </div>
          <p className="text-[11px] text-white/60 line-clamp-1">
            {isAr
              ? 'تنميط ذكي لـ 7 شخصيات متسوقين مع نقاط نية الشراء (0-100).'
              : 'Smart RFM & Intent scoring for 7 distinct personas.'}
          </p>
        </div>

        {/* Algorithm 3 Highlight */}
        <div
          onClick={() => setActiveAlgorithmView('algorithm3_demand')}
          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] hover:bg-emerald-500/10 p-4 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              <span>{isAr ? 'الخوارزمية 3: سرعة الطلب والمقاسات' : 'Algorithm 3: Demand & Sizing'}</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-300 font-bold group-hover:translate-x-[-4px] transition-transform">
              {isAr ? 'المصفوفة الكاملة ↵' : 'Open ↵'}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.demandVelocity?.filter((d) => d.demandStatus === 'hot_trending').length || 0}{' '}
            <span className="text-xs text-white/50 font-normal">{isAr ? 'قطع برواج عالي جداً' : 'Hot Trending'}</span>
          </div>
          <p className="text-[11px] text-white/60 line-clamp-1">
            {isAr
              ? 'مقارنة حية لطلب المقاسات مقابل المعروض وذكاء البحث المفقود.'
              : 'Live size vs stock comparison & zero-result search radar.'}
          </p>
        </div>

        {/* Sentry-Style Error Tracker Highlight */}
        <div
          onClick={() => setActiveAlgorithmView('system_health')}
          className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.05] hover:bg-rose-500/10 p-4 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>{isAr ? 'رادار مراقبة الأخطاء والصيانة' : 'Sentry Issue Tracker'}</span>
            </span>
            <span className="text-[11px] font-mono text-rose-300 font-bold group-hover:translate-x-[-4px] transition-transform">
              {isAr ? 'استعراض الأخطاء ↵' : 'Open ↵'}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            <span>{processedSystemErrors.filter((e) => e.status === 'open').length}</span>
            <span className="text-xs text-white/50 font-normal">{isAr ? 'أخطاء مفتوحة' : 'open issues'}</span>
            {processedSystemErrors.some((e) => e.isRegression) && (
              <span className="rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 px-2 py-0.5 text-[10px] font-bold animate-pulse">
                ⚠️ {isAr ? 'تكرار بعد الحل' : 'Regression'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/60 line-clamp-1">
            {processedSystemErrors.length > 0
              ? isAr
                ? `أحدث خطأ: ${processedSystemErrors[0].errorMessage}`
                : processedSystemErrors[0].errorMessage
              : isAr
              ? 'جميع الأكواد والخدمات السحابية تعمل باستقرار 100%.'
              : 'All system operations are healthy.'}
          </p>
        </div>
      </div>

      {/* Expandable KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Page Views */}
        <div
          onClick={() => setExpandedKpi(expandedKpi === 'views' ? null : 'views')}
          className={`rounded-2xl border transition-all cursor-pointer p-4 space-y-1.5 ${
            expandedKpi === 'views'
              ? 'border-[#3b82f6] bg-[#004ad7]/10 shadow-lg shadow-[#004ad7]/10'
              : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>{isAr ? 'إجمالي مشاهدات الكتالوج' : 'Total Page Views'}</span>
            <Activity className="h-4 w-4 text-[#3b82f6]" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {stats.totalPageViews.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/40">
            <span>{isAr ? `${stats.uniqueVisitors} زائر فريد` : `${stats.uniqueVisitors} unique`}</span>
            <span className="text-[#3b82f6] flex items-center gap-0.5">
              {expandedKpi === 'views' ? (isAr ? 'إخفاء' : 'Close') : isAr ? 'تفاصيل ▾' : 'Expand ▾'}
            </span>
          </div>
          {expandedKpi === 'views' && (
            <div className="pt-2 border-t border-white/10 text-xs space-y-1 text-white/70 animate-fade-in">
              <div className="flex justify-between">
                <span>{isAr ? 'المتصلون حالياً:' : 'Active now:'}</span>
                <span className="text-emerald-400 font-bold">{stats.activeOnlineNow}</span>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? 'معدل التصفح للزائر:' : 'Views per visitor:'}</span>
                <span className="font-mono">
                  {(stats.totalPageViews / Math.max(1, stats.uniqueVisitors)).toFixed(1)}x
                </span>
              </div>
            </div>
          )}
        </div>

        {/* KPI 2: Engagement Duration */}
        <div
          onClick={() => setExpandedKpi(expandedKpi === 'engagement' ? null : 'engagement')}
          className={`rounded-2xl border transition-all cursor-pointer p-4 space-y-1.5 ${
            expandedKpi === 'engagement'
              ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
              : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>{isAr ? 'متوسط مدة الجلسة' : 'Avg Session Duration'}</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tabular-nums">
            {Math.floor(stats.avgSessionSeconds / 60)}m {stats.avgSessionSeconds % 60}s
          </div>
          <div className="flex items-center justify-between text-[10px] text-emerald-400/70">
            <span>{isAr ? 'تفاعل نشط' : 'Active browse time'}</span>
            <span className="text-emerald-400 flex items-center gap-0.5">
              {expandedKpi === 'engagement' ? (isAr ? 'إخفاء' : 'Close') : isAr ? 'تفاصيل ▾' : 'Expand ▾'}
            </span>
          </div>
          {expandedKpi === 'engagement' && (
            <div className="pt-2 border-t border-white/10 text-xs space-y-1 text-white/70 animate-fade-in">
              <div className="flex justify-between">
                <span>{isAr ? 'جلسات أطول من دقيقتين:' : 'Sessions > 2min:'}</span>
                <span className="text-emerald-400 font-bold">
                  {stats.customerSessions.filter((s) => s.durationSeconds > 120).length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* KPI 3: Wishlist Adds */}
        <div
          onClick={() => setExpandedKpi(expandedKpi === 'wishlist' ? null : 'wishlist')}
          className={`rounded-2xl border transition-all cursor-pointer p-4 space-y-1.5 ${
            expandedKpi === 'wishlist'
              ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10'
              : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>{isAr ? 'إضافات المفضلة' : 'Wishlist Adds'}</span>
            <Heart className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 tabular-nums">
            {stats.totalWishlistAdds.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[10px] text-rose-400/70">
            <span>{isAr ? 'رغبة شراء' : 'Intent signals'}</span>
            <span className="text-rose-400 flex items-center gap-0.5">
              {expandedKpi === 'wishlist' ? (isAr ? 'إخفاء' : 'Close') : isAr ? 'تفاصيل ▾' : 'Expand ▾'}
            </span>
          </div>
          {expandedKpi === 'wishlist' && (
            <div className="pt-2 border-t border-white/10 text-xs space-y-1 text-white/70 animate-fade-in">
              <div className="flex justify-between">
                <span>{isAr ? 'نسبة حفظ القطع:' : 'Save rate:'}</span>
                <span className="font-mono">
                  {stats.totalProductViews > 0
                    ? ((stats.totalWishlistAdds / stats.totalProductViews) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          )}
        </div>

        {/* KPI 4: WhatsApp Orders & Conversion Rate */}
        <div
          onClick={() => setExpandedKpi(expandedKpi === 'conversion' ? null : 'conversion')}
          className={`rounded-2xl border transition-all cursor-pointer p-4 space-y-1.5 ${
            expandedKpi === 'conversion'
              ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
              : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>{isAr ? 'طلبات الواتساب والتحويل' : 'WhatsApp Orders'}</span>
            <MessageCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tabular-nums">
            {stats.totalWhatsAppClicks}
          </div>
          <div className="flex items-center justify-between text-[10px] text-emerald-400/70">
            <span>{isAr ? `معدل التحويل: ${stats.conversionRate}%` : `${stats.conversionRate}% CTR`}</span>
            <span className="text-amber-400 flex items-center gap-0.5">
              {expandedKpi === 'conversion' ? (isAr ? 'إخفاء' : 'Close') : isAr ? 'تفاصيل ▾' : 'Expand ▾'}
            </span>
          </div>
          {expandedKpi === 'conversion' && (
            <div className="pt-2 border-t border-white/10 text-xs space-y-1 text-white/70 animate-fade-in">
              <div className="flex justify-between">
                <span>{isAr ? 'التحويل من المشاهدة للطلب:' : 'Views to Order:'}</span>
                <span className="font-mono text-emerald-400 font-bold">{stats.conversionRate}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Conversion Funnel & Bottleneck Diagnosis */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#3b82f6]" />
              <span>{isAr ? 'مسار تجربة وتحويل العميل (Conversion Funnel)' : 'Conversion Funnel Progression'}</span>
            </h3>
            <p className="text-[11px] text-white/50 mt-0.5">
              {isAr
                ? 'تتبع انتقال الزائر عبر الخطوات الأربع مع كشف مواضع التسرب السلوكي تلقائياً'
                : 'Drop-off analysis across each conversion step'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/60">{isAr ? 'التحويل الإجمالي:' : 'Overall:'}</span>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400">
              {stats.conversionRate}%
            </span>
          </div>
        </div>

        {/* 4-Step Interactive Funnel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span className="font-semibold text-white/70">{isAr ? '1. تصفح الكتالوج' : '1. Catalog Views'}</span>
              <span className="font-mono text-[10px] text-white/40">100%</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">
              {stats.funnel.catalogViews.toLocaleString()}
            </div>
            <div className="text-[10px] text-white/40">
              {isAr ? 'إجمالي زيارات واجهة المتجر' : 'Boutique lookbook visits'}
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white/70">{isAr ? '2. فحص القطعة' : '2. Piece Inspection'}</span>
              <span className="font-mono text-[11px] text-[#3b82f6] font-bold">
                {stats.funnelDiagnosis.step1ConversionRate}%
              </span>
            </div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">
              {stats.funnel.productSheetOpens.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/40">{isAr ? 'فتح تفاصيل القطع' : 'Product sheet opens'}</span>
              {stats.funnelDiagnosis.dropOffCatalogToProduct > 0 && (
                <span className="text-amber-400 font-mono">
                  🔻 -{stats.funnelDiagnosis.dropOffCatalogToProduct} {isAr ? 'تسرب' : 'drop'}
                </span>
              )}
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white/70">{isAr ? '3. تحديد المقاس' : '3. Sizing Selection'}</span>
              <span className="font-mono text-[11px] text-purple-400 font-bold">
                {stats.funnelDiagnosis.step2ConversionRate}%
              </span>
            </div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">
              {stats.funnel.sizeSelections.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/40">{isAr ? 'اختيار مقاس محدد' : 'Selected size'}</span>
              {stats.funnelDiagnosis.dropOffProductToSize > 0 && (
                <span className="text-amber-400 font-mono">
                  🔻 -{stats.funnelDiagnosis.dropOffProductToSize} {isAr ? 'تسرب' : 'drop'}
                </span>
              )}
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400">{isAr ? '4. طلب الواتساب' : '4. WhatsApp Order'}</span>
              <span className="font-mono text-[11px] text-emerald-400 font-bold">
                {stats.funnelDiagnosis.step3ConversionRate}%
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
              {stats.funnel.whatsappConversions.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-emerald-400/70">{isAr ? 'إرسال محادثة الطلب' : 'WhatsApp clicks'}</span>
              {stats.funnelDiagnosis.dropOffSizeToOrder > 0 && (
                <span className="text-rose-400 font-mono">
                  🔻 -{stats.funnelDiagnosis.dropOffSizeToOrder} {isAr ? 'تردد' : 'stalled'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Diagnosis Banner */}
        <div className="rounded-2xl border border-white/10 bg-black/50 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>
                {isAr ? 'تشخيص الخوارزمية لنقاط الهدر والتوصية العلاجية:' : 'Algorithmic Bottleneck Diagnosis:'}
              </span>
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                stats.funnelDiagnosis.primaryDropOffStage === 'healthy'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {stats.funnelDiagnosis.primaryDropOffStage === 'inspection'
                ? isAr
                  ? '⚠️ تسرب التصفح الأولي'
                  : 'Catalog Drop'
                : stats.funnelDiagnosis.primaryDropOffStage === 'sizing'
                ? isAr
                  ? '⚠️ تردد عند اختيار المقاس'
                  : 'Sizing Hesitation'
                : stats.funnelDiagnosis.primaryDropOffStage === 'whatsapp'
                ? isAr
                  ? '⚠️ تردد عند زر الواتساب'
                  : 'WhatsApp Hesitation'
                : isAr
                ? '✨ مسار تحويل ممتاز'
                : 'Healthy Funnel'}
            </span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            {stats.funnelDiagnosis.diagnosisMessage}
          </p>
        </div>
      </div>

      {/* User Engagement Area Chart */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>
                {isAr
                  ? '📈 مخطط تفاعل المستخدمين وساعات الذروة (User Engagement Analytics)'
                  : 'User Engagement Analytics'}
              </span>
            </h3>
            <p className="text-[11px] text-white/50 mt-0.5">
              {isAr
                ? 'توزيع مدة مكوث وتفاعل الزوار بالدقائق وعدد الزيارات على مدار ساعات اليوم'
                : 'Total engagement minutes and visitor traffic distribution'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              {isAr ? 'دقائق التفاعل' : 'Engagement Min'}
            </span>
            <span className="flex items-center gap-1.5 text-[#3b82f6] font-mono">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
              {isAr ? 'الزوار النشطون' : 'Visitors'}
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyEngagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="durationMinutes"
                name={isAr ? 'دقائق التفاعل' : 'Engagement (Min)'}
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#engagementGradient)"
              />
              <Area
                type="monotone"
                dataKey="visitors"
                name={isAr ? 'الزوار' : 'Visitors'}
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#visitorsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Charts Grid: Most-Viewed Products & Wishlist Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most-Viewed Products */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#3b82f6]" />
                <span>{isAr ? '👗 القطع الأكثر مشاهدة (Most-Viewed Products)' : 'Most-Viewed Products'}</span>
              </h3>
              <p className="text-[11px] text-white/50 mt-0.5">
                {isAr ? 'ترتيب القطع حسب عدد مرات المعاينة الحقيقية' : 'Ranking products by customer view frequency'}
              </p>
            </div>
          </div>
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostViewedProductsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" name={isAr ? 'المشاهدات' : 'Views'} fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {mostViewedProductsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={VIEW_BAR_COLORS[index % VIEW_BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wishlist Activity */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-400" />
                <span>{isAr ? '💖 نشاط قائمة المفضلة (Wishlist Activity)' : 'Wishlist Activity'}</span>
              </h3>
              <p className="text-[11px] text-white/50 mt-0.5">
                {isAr
                  ? 'القطع الأكثر حفظاً وإضافة لقائمة الرغبات لدى المتسوقين'
                  : 'Most-saved pieces in shoppers wishlists'}
              </p>
            </div>
          </div>
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wishlistActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="wishlist" name={isAr ? 'إضافات المفضلة' : 'Wishlist Adds'} fill="#f43f5e" radius={[6, 6, 0, 0]}>
                  {wishlistActivityData.map((_, index) => (
                    <Cell key={`cell-w-${index}`} fill={WISHLIST_BAR_COLORS[index % WISHLIST_BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Piece CTR & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-cyan-400" />
                <span>
                  {isAr ? 'معدل الضغطات والتحويل للقطع (Click-Through Rates)' : 'Piece CTR & Actions Performance'}
                </span>
              </h3>
              <p className="text-[11px] text-white/50 mt-0.5">
                {isAr
                  ? 'مقارنة المشاهدات مع طلبات الواتساب ونسبة النقر لكل قطعة'
                  : 'Views vs WhatsApp conversion rate per piece'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-[#3b82f6]">■ {isAr ? 'مشاهدات' : 'Views'}</span>
              <span className="flex items-center gap-1 text-[#10b981]">■ {isAr ? 'واتساب' : 'WhatsApp'}</span>
            </div>
          </div>
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={productChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="rgba(245, 158, 11, 0.7)"
                  fontSize={10}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="views" name={isAr ? 'المشاهدات' : 'Views'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar
                  yAxisId="left"
                  dataKey="whatsapp"
                  name={isAr ? 'طلبات الواتساب' : 'WhatsApp Orders'}
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ctr"
                  name={isAr ? 'نسبة النقر (CTR)' : 'CTR %'}
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown Donut */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-purple-400" />
              <span>{isAr ? 'توزيع الأجهزة والمنصات' : 'Device Distribution'}</span>
            </h3>
            <p className="text-[11px] text-white/50 mt-0.5">
              {isAr ? 'نسبة استخدام الموبايل والكمبيوتر' : 'Mobile vs Desktop traffic'}
            </p>
          </div>
          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {deviceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-white tabular-nums">
                {stats.deviceBreakdown.mobile}%
              </span>
              <span className="text-[9px] text-white/50">{isAr ? 'موبايل' : 'Mobile'}</span>
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                {isAr ? 'الهواتف الذكية' : 'Mobile'}
              </span>
              <span className="font-mono font-bold text-white">{stats.deviceBreakdown.mobile}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                {isAr ? 'أجهزة الكمبيوتر' : 'Desktop'}
              </span>
              <span className="font-mono font-bold text-white">{stats.deviceBreakdown.desktop}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveOverviewTab;

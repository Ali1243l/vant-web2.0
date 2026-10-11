import React from 'react';
import { Zap, Flame, Tag, Search } from 'lucide-react';
import type { UserBehaviorStats } from '../../lib/analytics';

export interface VelocityItem {
  id: string;
  title: string;
  velocityScore: number;
  views: number;
  wishlistAdds: number;
  whatsappClicks: number;
  demandStatus: 'hot_trending' | 'steady_interest' | 'cold_dormant';
  statusLabelAr: string;
  recommendedAction: string;
}

export interface UnmetSearchItem {
  term: string;
  count: number;
  status: 'zero_results' | 'found';
  suggestedAction: string;
}

export interface DemandIntelligenceTabProps {
  stats: UserBehaviorStats;
  filteredVelocityItems: VelocityItem[];
  velocityFilter: 'all' | 'hot_trending' | 'steady_interest' | 'cold_dormant';
  setVelocityFilter: React.Dispatch<
    React.SetStateAction<'all' | 'hot_trending' | 'steady_interest' | 'cold_dormant'>
  >;
  unmetSearchFilter: 'all' | 'zero_results' | 'found';
  setUnmetSearchFilter: React.Dispatch<React.SetStateAction<'all' | 'zero_results' | 'found'>>;
  filteredUnmetSearches: UnmetSearchItem[];
  isAr?: boolean;
}

export const DemandIntelligenceTab: React.FC<DemandIntelligenceTabProps> = ({
  stats,
  filteredVelocityItems,
  velocityFilter,
  setVelocityFilter,
  unmetSearchFilter,
  setUnmetSearchFilter,
  filteredUnmetSearches,
  isAr = true,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.08] via-[#12151f] to-black p-5 sm:p-6 backdrop-blur-md space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-400" />
          <span>
            {isAr
              ? 'الخوارزمية 3: سرعة الطلب اللحظي، مصفوفة المقاسات، وذكاء البحث المفقود'
              : 'Algorithm 3: Demand Velocity, Size Matrix & Search Intelligence'}
          </span>
        </h3>
        <p className="text-xs text-white/60">
          {isAr
            ? 'خوارزمية تنبؤية لقياس سرعة إقبال الزبائن على القطع (Velocity Index)، ومقارنة طلب المقاسات مع المتوفر في المخزون، ورصد الكلمات المفقودة التي يبحث عنها العملاء'
            : 'Real-time velocity scoring, size demand vs live inventory balancing, and zero-result search radar'}
        </p>
      </div>

      {/* Section 1: Demand Velocity Ranking */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="h-4 w-4 text-rose-500" />
              <span>
                {isAr
                  ? 'مؤشر سرعة الطلب اللحظي للقطع (Demand Velocity Index)'
                  : 'Demand Velocity Matrix'}
              </span>
            </h4>
            <p className="text-[11px] text-white/50 mt-0.5">
              {isAr
                ? 'حساب سرعة الإقبال المرجحة (المشاهدات × 1 + المفضلة × 3.5 + نقرات الواتساب × 10)'
                : 'Velocity = (Views*1) + (Wishlist*3.5) + (WhatsApp*10)'}
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'all', label: isAr ? 'الكل' : 'All' },
                { id: 'hot_trending', label: isAr ? '🔥 رواج عالي' : 'Hot Trending' },
                { id: 'steady_interest', label: isAr ? '⚡ اهتمام مستقر' : 'Steady' },
                { id: 'cold_dormant', label: isAr ? '❄️ منخفض' : 'Cold' },
              ] as const
            ).map((vf) => (
              <button
                key={vf.id}
                type="button"
                onClick={() => setVelocityFilter(vf.id)}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                  velocityFilter === vf.id
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'border-white/10 bg-black/40 text-white/60 hover:text-white'
                }`}
              >
                {vf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Velocity Ranking Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-white/10 text-white/40 pb-2">
                <th className="py-2 px-3 font-semibold text-start">
                  {isAr ? 'القطعة' : 'Piece'}
                </th>
                <th className="py-2 px-3 font-semibold text-center">
                  {isAr ? 'مؤشر السرعة' : 'Velocity'}
                </th>
                <th className="py-2 px-3 font-semibold text-center">
                  {isAr ? 'المشاهدات' : 'Views'}
                </th>
                <th className="py-2 px-3 font-semibold text-center">
                  {isAr ? 'المفضلة' : 'Wishlist'}
                </th>
                <th className="py-2 px-3 font-semibold text-center">
                  {isAr ? 'طلبات الواتساب' : 'WhatsApp'}
                </th>
                <th className="py-2 px-3 font-semibold text-center">
                  {isAr ? 'الحالة والتوصية' : 'Status & Action'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVelocityItems.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-medium text-white max-w-xs truncate">{p.title}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                    {p.velocityScore}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-white/80">{p.views}</td>
                  <td className="py-3 px-3 text-center font-mono text-rose-400">
                    {p.wishlistAdds}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">
                    {p.whatsappClicks}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex flex-col items-center gap-0.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          p.demandStatus === 'hot_trending'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : p.demandStatus === 'steady_interest'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-white/5 text-white/50 border-white/10'
                        }`}
                      >
                        {p.statusLabelAr}
                      </span>
                      <span className="text-[9px] text-white/40 max-w-xs truncate">
                        {p.recommendedAction}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Size Demand vs Live Stock Matrix */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="pb-2 border-b border-white/10">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Tag className="h-4 w-4 text-purple-400" />
            <span>
              {isAr
                ? 'مصفوفة توازن المقاسات الحية (Size Demand vs Live Stock Matrix)'
                : 'Size Demand vs Stock Matrix'}
            </span>
          </h4>
          <p className="text-[11px] text-white/50 mt-0.5">
            {isAr
              ? 'مقارنة حقيقية 100% بين طلبات القياس للزبائن والمعروض الفعلي في الكتالوج لتفادي نفاد المقاسات'
              : 'Inventory balance radar comparing customer clicks against current stock'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.sizeStockMatrix?.map((sm) => (
            <div
              key={sm.size}
              className={`rounded-2xl border p-3.5 text-center space-y-2 transition-all ${
                sm.status === 'deficit_warning'
                  ? 'border-rose-500/40 bg-rose-500/[0.06] shadow-lg shadow-rose-500/5'
                  : sm.status === 'surplus'
                  ? 'border-amber-500/30 bg-amber-500/[0.04]'
                  : 'border-white/10 bg-black/40'
              }`}
            >
              <span className="text-lg font-bold font-mono text-white block">[{sm.size}]</span>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/40">{isAr ? 'الطلب:' : 'Demand:'}</span>
                  <span className="font-mono font-bold text-amber-400">
                    {sm.demandPercentage}%
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/40">{isAr ? 'المتوفر:' : 'Stock:'}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {sm.stockPercentage}%
                  </span>
                </div>
              </div>

              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold border block truncate ${
                  sm.status === 'deficit_warning'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : sm.status === 'surplus'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {sm.statusLabelAr}
              </span>

              <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed">
                {sm.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Unmet Search Intelligence */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="h-4 w-4 text-cyan-400" />
              <span>
                {isAr
                  ? 'ذكاء البحث والطلب غير الملبى (Unmet Search Intelligence)'
                  : 'Unmet Search Radar'}
              </span>
            </h4>
            <p className="text-[11px] text-white/50 mt-0.5">
              {isAr
                ? 'رصد الكلمات التي يبحث عنها الزبائن ولم يجدوا لها نتائج في المتجر (فرص بيع ضائعة)'
                : 'Identifying zero-result queries to bridge inventory gaps'}
            </p>
          </div>

          {/* Unmet Filter */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setUnmetSearchFilter('all')}
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                unmetSearchFilter === 'all'
                  ? 'bg-[#004ad7] border-[#004ad7] text-white'
                  : 'border-white/10 bg-black/40 text-white/60'
              }`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setUnmetSearchFilter('zero_results')}
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                unmetSearchFilter === 'zero_results'
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'border-white/10 bg-black/40 text-rose-300'
              }`}
            >
              {isAr ? '🚨 طلبات بدون نتائج (0)' : 'Zero Results'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {filteredUnmetSearches.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/40">
              {isAr ? 'لا توجد عمليات بحث مسجلة حالياً.' : 'No search queries recorded yet.'}
            </div>
          ) : (
            filteredUnmetSearches.map((s) => (
              <div
                key={s.term}
                className={`rounded-2xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  s.status === 'zero_results'
                    ? 'border-rose-500/30 bg-rose-500/[0.04]'
                    : 'border-white/10 bg-black/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${
                      s.status === 'zero_results'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}
                  >
                    {s.status === 'zero_results' ? '0' : '✓'}
                  </span>
                  <div>
                    <span className="font-bold text-white text-xs">"{s.term}"</span>
                    <p className="text-[11px] text-white/60 mt-0.5">{s.suggestedAction}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-white/80">
                    {s.count} {isAr ? 'عملية بحث' : 'searches'}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      s.status === 'zero_results'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {s.status === 'zero_results'
                      ? isAr
                        ? 'مفقود في الكتالوج'
                        : 'Zero Results'
                      : isAr
                      ? 'متوفر'
                      : 'Matched'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

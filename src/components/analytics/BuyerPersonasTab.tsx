import React from 'react';
import { Sparkles, Search, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import type { UserBehaviorStats, CustomerSessionProfile, CustomerPersonaType } from '../../lib/analytics';

export interface BuyerPersonasTabProps {
  stats: UserBehaviorStats;
  customerFilter: CustomerPersonaType | 'all' | 'hesitant';
  setCustomerFilter: React.Dispatch<React.SetStateAction<CustomerPersonaType | 'all' | 'hesitant'>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredSessions: CustomerSessionProfile[];
  expandedSessionId: string | null;
  setExpandedSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  isAr?: boolean;
}

export const BuyerPersonasTab: React.FC<BuyerPersonasTabProps> = ({
  stats,
  customerFilter,
  setCustomerFilter,
  searchQuery,
  setSearchQuery,
  filteredSessions,
  expandedSessionId,
  setExpandedSessionId,
  isAr = true,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Persona Distribution Cards Grid */}
      <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.05] via-[#12151f] to-black p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span>
              {isAr
                ? 'الخوارزمية 2: التنميط السلوكي وتصنيف نية الشراء (Buyer Personas 0 - 100)'
                : 'Algorithm 2: Customer Personas & RFM/Intent Scoring'}
            </span>
          </h3>
          <p className="text-xs text-white/60 mt-1">
            {isAr
              ? 'تصنيف تلقائي متقدم لكل زائر وفق معادلة نية الشراء وبصمة الذوق وتعمق التصفح لاستخراج الشخصيات السلوكية الـ 7'
              : 'Automated visitor classification based on lead scoring, dwell time, and catalog engagement depth'}
          </p>
        </div>

        {/* Persona Grid (Clickable Filters) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
          {(
            [
              {
                id: 'all',
                icon: '🌐',
                label: isAr ? 'كافة الزوار' : 'All',
                count: stats.customerSessions?.length || 0,
                color: 'border-white/10',
              },
              {
                id: 'vip',
                icon: '👑',
                label: isAr ? 'نخبوي جاهز (VIP)' : 'VIP',
                count: stats.personaDistribution?.vip || 0,
                color: 'border-amber-500/40 text-amber-300',
              },
              {
                id: 'high_intent',
                icon: '💎',
                label: isAr ? 'اهتمام عالي' : 'High Intent',
                count: stats.personaDistribution?.high_intent || 0,
                color: 'border-emerald-500/40 text-emerald-300',
              },
              {
                id: 'hesitant_buyer',
                icon: '⏳',
                label: isAr ? 'متردد بحاجة لحافز' : 'Hesitant',
                count: stats.personaDistribution?.hesitant_buyer || 0,
                color: 'border-rose-500/40 text-rose-300',
              },
              {
                id: 'deal_hunter',
                icon: '🏷️',
                label: isAr ? 'باحث عروض' : 'Deal Hunter',
                count: stats.personaDistribution?.deal_hunter || 0,
                color: 'border-purple-500/40 text-purple-300',
              },
              {
                id: 'fashion_enthusiast',
                icon: '👗',
                label: isAr ? 'متذوق أزياء' : 'Enthusiast',
                count: stats.personaDistribution?.fashion_enthusiast || 0,
                color: 'border-cyan-500/40 text-cyan-300',
              },
              {
                id: 'trend_explorer',
                icon: '🔍',
                label: isAr ? 'مستكشف صيحات' : 'Explorer',
                count: stats.personaDistribution?.trend_explorer || 0,
                color: 'border-blue-500/40 text-blue-300',
              },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setCustomerFilter(p.id)}
              className={`rounded-2xl border p-3 text-center transition-all cursor-pointer space-y-1 ${
                customerFilter === p.id
                  ? 'bg-white/15 border-white shadow-md scale-102'
                  : 'bg-black/40 hover:bg-black/60 ' + p.color
              }`}
            >
              <span className="text-base block">{p.icon}</span>
              <span className="text-xs font-bold text-white block truncate">{p.label}</span>
              <span className="text-sm font-bold font-mono text-white/90 tabular-nums block">
                {p.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Sessions List */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'بحث بمعرف الجلسة، المحافظة، أو القطع المعاينة...'
                  : 'Search by session, governorate, or items...'
              }
              className="w-full rounded-xl border border-white/15 bg-black/40 pr-10 pl-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          <div className="text-xs text-white/50">
            {isAr
              ? `عرض ${filteredSessions.length} من أصل ${
                  stats.customerSessions?.length || 0
                } زبون`
              : `Showing ${filteredSessions.length} sessions`}
          </div>
        </div>

        {/* Sessions Cards */}
        <div className="space-y-2.5">
          {filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/40 border border-white/5 rounded-3xl bg-black/20">
              {isAr ? 'لا توجد جلسات مسجلة ضمن هذا التصنيف' : 'No customer sessions matching filter'}
            </div>
          ) : (
            filteredSessions.slice(0, 20).map((session) => {
              const isExpanded = expandedSessionId === session.sessionId;
              return (
                <div
                  key={session.sessionId}
                  className={`rounded-2xl border transition-all ${
                    isExpanded
                      ? 'border-[#004ad7]/60 bg-[#12151f] shadow-xl'
                      : 'border-white/10 bg-black/30 hover:bg-black/50'
                  }`}
                >
                  {/* Summary Row */}
                  <div
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.sessionId)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${session.personaBadgeColor}`}
                      >
                        {session.persona === 'vip'
                          ? '👑'
                          : session.persona === 'high_intent'
                          ? '💎'
                          : session.persona === 'hesitant_buyer'
                          ? '⏳'
                          : session.persona === 'deal_hunter'
                          ? '🏷️'
                          : session.persona === 'fashion_enthusiast'
                          ? '👗'
                          : '🔍'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-white">
                            {session.sessionId.substring(0, 14)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.2 text-[10px] font-bold border ${session.personaBadgeColor}`}
                          >
                            {session.personaLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-white/50 mt-1">
                          <span>📍 {session.governorate}</span>
                          <span>📱 {session.device}</span>
                          <span>
                            ⏱️ {Math.floor(session.durationSeconds / 60)}m{' '}
                            {session.durationSeconds % 60}s
                          </span>
                          <span>🎯 {session.eventsCount} تفاعل</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-end">
                        <span className="text-[10px] text-white/40 block">
                          {isAr ? 'نقاط العميل' : 'Lead Score'}
                        </span>
                        <span
                          className={`text-sm font-bold font-mono tabular-nums ${
                            session.leadScore >= 80
                              ? 'text-amber-400'
                              : session.leadScore >= 50
                              ? 'text-emerald-400'
                              : 'text-white/70'
                          }`}
                        >
                          {session.leadScore} / 100
                        </span>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-white/60">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details: Taste Fingerprint + Timeline */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4 sm:p-5 bg-black/40 rounded-b-2xl space-y-4 animate-fade-in">
                      {/* Taste Fingerprint Grid */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>
                            {isAr
                              ? 'بصمة الذوق والاهتمام السلوكي (Taste & Intent Fingerprint):'
                              : 'Taste & Intent Fingerprint:'}
                          </span>
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
                          <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                            <span className="text-[10px] text-white/40 block">
                              {isAr ? 'القسم الأكثر تصفحاً' : 'Primary Category'}
                            </span>
                            <span className="font-semibold text-white mt-0.5 block truncate">
                              {session.tasteFingerprint.primaryCategory}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                            <span className="text-[10px] text-white/40 block">
                              {isAr ? 'المقاس المفضل المرجح' : 'Preferred Size'}
                            </span>
                            <span className="font-semibold text-emerald-400 font-mono mt-0.5 block">
                              {session.tasteFingerprint.preferredSize
                                ? `[${session.tasteFingerprint.preferredSize}]`
                                : isAr
                                ? 'غير محدد'
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                            <span className="text-[10px] text-white/40 block">
                              {isAr ? 'متوسط سعر القطع المعاينة' : 'Avg Viewed Price'}
                            </span>
                            <span className="font-semibold text-amber-400 font-mono mt-0.5 block">
                              {session.tasteFingerprint.avgViewedPrice > 0
                                ? `${session.tasteFingerprint.avgViewedPrice.toLocaleString()} د.ع`
                                : isAr
                                ? 'تصفح عام'
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                            <span className="text-[10px] text-white/40 block">
                              {isAr ? 'فحص الصور والحاسبة' : 'Gallery & Fit Finder'}
                            </span>
                            <span className="font-semibold text-cyan-300 mt-0.5 block">
                              {session.tasteFingerprint.imageInteractionCount} تقليب{' '}
                              {session.tasteFingerprint.fitCalculatorUsed ? '· حاسبة ✓' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Chronological Action Timeline */}
                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-400" />
                          <span>
                            {isAr
                              ? 'الخط الزمني لكافة حركات العميل في المتجر (Chronological Timeline):'
                              : 'Chronological Timeline:'}
                          </span>
                        </span>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {session.journeyTimeline.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-2.5 rounded-lg bg-white/[0.02] border border-white/5 p-2 text-xs"
                            >
                              <span className="font-mono text-[10px] text-white/40 shrink-0 mt-0.5">
                                {new Date(item.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold text-white/90">{item.label}</span>
                                {item.details && (
                                  <p className="text-[10px] text-white/50">{item.details}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerPersonasTab;

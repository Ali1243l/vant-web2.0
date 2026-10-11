import React from 'react';
import {
  AlertTriangle,
  Check,
  MessageCircle,
  Copy,
  Send,
} from 'lucide-react';
import type { UserBehaviorStats, HesitationSignal } from '../../lib/analytics';

export interface HesitationRecoveryTabProps {
  stats: UserBehaviorStats;
  filteredHesitationSignals: HesitationSignal[];
  hesitationUrgencyFilter: 'all' | 'critical' | 'high' | 'medium';
  setHesitationUrgencyFilter: (filter: 'all' | 'critical' | 'high' | 'medium') => void;
  copiedSignalId: string | null;
  handleCopyRecoveryScript: (signal: HesitationSignal) => void;
  isAr?: boolean;
}

export const HesitationRecoveryTab: React.FC<HesitationRecoveryTabProps> = ({
  stats,
  filteredHesitationSignals,
  hesitationUrgencyFilter,
  setHesitationUrgencyFilter,
  copiedSignalId,
  handleCopyRecoveryScript,
  isAr = true,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Urgency Filters */}
      <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-500/[0.08] via-[#12151f] to-black p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              <span>
                {isAr
                  ? 'الخوارزمية 1: كشف التردد والاحتباس ومحرك الاستعادة الفورية'
                  : 'Algorithm 1: Hesitation & 1-Click Recovery Engine'}
              </span>
            </h3>
            <p className="text-xs text-white/60 mt-1">
              {isAr
                ? 'رصد الزبائن الذين توقفوا قبل إتمام الطلب (حيرة في المقاس، التردد عند السعر، أو التوقف عند زر الواتساب) مع توليد رسائل وحوافز استعادة مخصصة فورية'
                : 'Real-time bottleneck detection with tailored recovery messaging and promo incentives'}
            </p>
          </div>

          {/* Urgency Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'all', label_ar: 'كافة الحالات', count: stats.hesitationSignals?.length || 0 },
                {
                  id: 'critical',
                  label_ar: '🚨 حرج (عند زر الطلب)',
                  count: stats.hesitationSignals?.filter((s) => s.urgency === 'critical').length || 0,
                },
                {
                  id: 'high',
                  label_ar: '⚠️ عالي (حيرة مقاس/سعر)',
                  count: stats.hesitationSignals?.filter((s) => s.urgency === 'high').length || 0,
                },
                {
                  id: 'medium',
                  label_ar: '💡 متوسط (استكشاف)',
                  count: stats.hesitationSignals?.filter((s) => s.urgency === 'medium').length || 0,
                },
              ] as const
            ).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setHesitationUrgencyFilter(u.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  hesitationUrgencyFilter === u.id
                    ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                    : 'border-white/10 bg-black/40 text-white/70 hover:text-white'
                }`}
              >
                <span>{u.label_ar}</span>
                <span className="font-mono text-[10px] font-bold opacity-80">({u.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <span className="text-[11px] text-white/50 block">
              {isAr ? 'إجمالي الحالات المترددة' : 'Total Hesitant'}
            </span>
            <span className="text-xl font-bold font-mono text-white mt-0.5 block">
              {stats.hesitationSignals?.length || 0}
            </span>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-3">
            <span className="text-[11px] text-rose-300 block">
              {isAr ? 'حالات حرجة تتطلب تدخلاً' : 'Critical Leads'}
            </span>
            <span className="text-xl font-bold font-mono text-rose-400 mt-0.5 block">
              {stats.hesitationSignals?.filter((s) => s.urgency === 'critical').length || 0}
            </span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <span className="text-[11px] text-white/50 block">
              {isAr ? 'تردد في تحديد المقاس' : 'Sizing Hesitation'}
            </span>
            <span className="text-xl font-bold font-mono text-purple-400 mt-0.5 block">
              {stats.hesitationSignals?.filter((s) => s.type === 'sizing_hesitation').length || 0}
            </span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <span className="text-[11px] text-white/50 block">
              {isAr ? 'تردد في السعر والقيمة' : 'Price Hesitation'}
            </span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">
              {stats.hesitationSignals?.filter((s) => s.type === 'price_hesitation').length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Hesitant Signals List */}
      <div className="space-y-3">
        {filteredHesitationSignals.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center space-y-2">
            <Check className="h-8 w-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">
              {isAr ? 'لا توجد حالات تردد مرصودة حالياً' : 'No Hesitant Leads Detected'}
            </h4>
            <p className="text-xs text-white/50 max-w-md mx-auto">
              {isAr
                ? 'جميع الزوار الحاليين ينتقلون بسلاسة أو يقومون بالطلب دون عوائق سلوكية واضحة.'
                : 'Visitors are currently flowing smoothly with no significant drop-offs.'}
            </p>
          </div>
        ) : (
          filteredHesitationSignals.map((signal) => (
            <div
              key={signal.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-3.5 ${
                signal.urgency === 'critical'
                  ? 'border-rose-500/40 bg-gradient-to-r from-rose-500/[0.06] via-[#12151f] to-black shadow-lg shadow-rose-500/5'
                  : signal.urgency === 'high'
                  ? 'border-amber-500/30 bg-[#12151f]'
                  : 'border-white/10 bg-black/40'
              }`}
            >
              {/* Signal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${
                      signal.urgency === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : signal.urgency === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}
                  >
                    {signal.urgency === 'critical' ? '🚨' : signal.urgency === 'high' ? '⚠️' : '💡'}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>{signal.title}</span>
                      <span className="font-mono text-[10px] text-white/40">
                        ({signal.sessionId.substring(0, 10)})
                      </span>
                    </h4>
                    <p className="text-[11px] text-white/60 mt-0.5">{signal.details}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-end">
                    <span className="text-[10px] text-white/40 block">
                      {isAr ? 'مؤشر التردد' : 'Hesitation Score'}
                    </span>
                    <span className="text-sm font-bold font-mono text-rose-400 tabular-nums">
                      {signal.hesitationScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Context Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-[10px] text-white/40 block">
                    {isAr ? 'القطعة المعنية والمقاس:' : 'Piece & Size:'}
                  </span>
                  <span className="font-semibold text-white mt-0.5 block truncate">
                    {signal.targetProductTitle || 'غير محدد'} {signal.targetSize && `[${signal.targetSize}]`}
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-[10px] text-white/40 block">
                    {isAr ? 'مدة المكوث والتأمل:' : 'Dwell Time:'}
                  </span>
                  <span className="font-mono font-semibold text-amber-300 mt-0.5 block">
                    {Math.floor(signal.dwellSeconds / 60)}m {signal.dwellSeconds % 60}s
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-[10px] text-white/40 block">
                    {isAr ? 'الإجراء العلاجي المقترح:' : 'Prescribed Action:'}
                  </span>
                  <span className="font-semibold text-emerald-400 mt-0.5 block truncate">
                    {signal.suggestedAction}
                  </span>
                </div>
              </div>

              {/* Pre-written Luxury WhatsApp Recovery Script */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" />
                    <span>
                      {isAr
                        ? 'نص رسالة الاستعادة المخصصة (جاهز للإرسال الفوري):'
                        : 'Tailored Recovery Message:'}
                    </span>
                  </span>
                  {signal.suggestedPromoCode && (
                    <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                      كوبون: {signal.suggestedPromoCode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-sans bg-black/40 p-2.5 rounded-lg border border-white/5 select-all">
                  "{signal.recoveryWhatsAppMessage}"
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyRecoveryScript(signal)}
                    className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer"
                  >
                    {copiedSignalId === signal.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{isAr ? 'تم النسخ بنجاح ✓' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>{isAr ? 'نسخ نص الرسالة' : 'Copy Script'}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(signal.recoveryWhatsAppMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isAr ? 'فتح محادثة واتساب للمتابعة' : 'Open WhatsApp Chat'}</span>
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HesitationRecoveryTab;

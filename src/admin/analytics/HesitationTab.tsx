import React from 'react';
import { motion } from 'motion/react';
import { Timer, MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import { Card, Button } from '../ui';
import type { HesitationIncident, CustomerSession } from '../lib/analytics';

interface Props {
  hesitationIncidents: HesitationIncident[];
  customerSessions: CustomerSession[];
  copiedMessageId: string | null;
  handleCopyMessage: (id: string, text: string) => void;
  handleOpenWhatsApp: (phone: string, text: string) => void;
  isAr: boolean;
}

export const HesitationTab: React.FC<Props> = ({
  hesitationIncidents,
  customerSessions,
  copiedMessageId,
  handleCopyMessage,
  handleOpenWhatsApp,
  isAr,
}) => {
  return (
    <motion.div
      key="hesitation"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Algorithm 1 Intro Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-slate-900/60 border border-rose-500/20 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              <Timer className="w-4 h-4 text-rose-400" />
              <span>
                {isAr
                  ? 'خوارزمية رادار التردد اللحظي (Hesitation Engine)'
                  : 'Algorithm 1: Sizing & Checkout Dwell Radar'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {isAr
                ? 'جلسات تحتاج مراجعة ومساعدة'
                : 'Sessions that may need assistance'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              {isAr
                ? 'إشارة تفسيرية: خمول 5 دقائق على الأقل، و30 ثانية بين أول وآخر حدث، مع اختيار مقاس أو إضافة للسلة أو استخدام دليل المقاس مرتين. لا تؤكد هجر الشراء، والجلسة المجهولة لا تتيح التواصل.'
                : 'Rule-based signal: at least 5 minutes idle and 30 seconds between recorded events, plus a size choice, cart addition or repeated fit guidance. It does not prove abandonment; anonymous sessions cannot be contacted.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[110px]">
              <div className="text-2xl font-bold font-mono text-rose-400">
                {hesitationIncidents.length}
              </div>
              <div className="text-[10px] text-slate-400">
                {isAr ? 'حالات نشطة حالياً' : 'Active Dropoffs'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[110px]">
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {(() => {
                  if (hesitationIncidents.length > 0) {
                    const sum = hesitationIncidents.reduce(
                      (acc, inc) => acc + (inc.intentScore || 0),
                      0
                    );
                    return Math.round(sum / hesitationIncidents.length);
                  }
                  if (customerSessions.length > 0) {
                    const sum = customerSessions.reduce(
                      (acc, sess) => acc + sess.engagementScore,
                      0
                    );
                    return Math.round(sum / customerSessions.length);
                  }
                  return 0;
                })()}
                /100
              </div>
              <div className="text-[10px] text-slate-400">
                {isAr ? 'متوسط التفاعل المرصود' : 'Observed engagement average'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hesitation Incidents List */}
      <div className="space-y-4">
        {hesitationIncidents.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
            <Timer className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-300">
              {isAr ? 'لا توجد حالات تردد مسجلة حالياً' : 'No Hesitation Incidents Detected'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {isAr
                ? 'يقوم النظام بمراقبة سلوك الزوار في المتجر ورصد أي تردد عند اختيار المقاس أو الدفع في الوقت الفعلي عند حدوثه.'
                : 'The engine monitors live visitor sizing and checkout dwell times in real time.'}
            </p>
          </div>
        ) : (
          hesitationIncidents.map((incident) => {
            const isCopied = copiedMessageId === incident.id;
            const stageLabel =
              incident.stage === 'sizing'
                ? isAr
                  ? 'تردد في تحديد المقاس'
                  : 'Sizing Picker Stalled'
                : incident.stage === 'checkout'
                ? isAr
                  ? 'تردد في صفحة الدفع'
                  : 'Checkout Form Stalled'
                : isAr
                ? 'توقف عند السلة'
                : 'Cart Dwell Stalled';

            return (
              <Card
                key={incident.id}
                className="p-5 bg-slate-900/50 backdrop-blur-xl border-slate-800/80 hover:border-slate-700/80 transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Customer & Product details */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center font-bold text-white text-base shrink-0">
                      {incident.customerName.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-bold text-white text-sm sm:text-base">
                          {incident.customerName}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {incident.phone}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] text-slate-400">
                          {incident.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
                        <span className="text-slate-300 font-medium">
                          {incident.productTitle}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          <Timer className="w-3 h-3 text-amber-400" />
                          <span>
                            {stageLabel} ({incident.dwellSeconds} {isAr ? 'ثانية' : 'sec'})
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Intent Gauge */}
                  <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 shrink-0">
                    <div className="text-start">
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        {isAr ? 'مؤشر نية الشراء' : 'Intent Score'}
                      </div>
                      <div className="text-lg font-bold font-mono text-emerald-400">
                        {incident.intentScore}/100
                      </div>
                    </div>
                    <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${incident.intentScore}%` }}
                        className={`h-full rounded-full ${
                          incident.intentScore > 85 ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Generated Recovery WhatsApp Message Banner */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-start">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-0.5">
                        {isAr
                          ? 'رسالة واتساب المقترحة للاسترجاع (Generated Recovery Message):'
                          : 'Suggested WhatsApp Hook:'}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        "{incident.recoveryMessage}"
                      </p>
                    </div>
                  </div>

                  {/* Recovery Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyMessage(incident.id, incident.recoveryMessage)}
                      leftIcon={
                        isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )
                      }
                      className="text-slate-300 hover:text-white"
                    >
                      {isCopied ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الرسالة' : 'Copy'}
                    </Button>

                    <Button
                      variant="emerald"
                      size="sm"
                      onClick={() =>
                        handleOpenWhatsApp(incident.phone, incident.recoveryMessage)
                      }
                      disabled={!/^\+?\d{7,15}$/.test(incident.phone)}
                      title={!incident.phone ? (isAr ? 'الجلسة مجهولة ولا تحتوي رقم تواصل' : 'Anonymous session without a contact number') : undefined}
                      leftIcon={<ExternalLink className="w-3.5 h-3.5 text-white" />}
                      className="bg-emerald-600 hover:bg-emerald-500 font-semibold"
                    >
                      {isAr ? 'فتح محادثة واتساب' : 'Open WhatsApp'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

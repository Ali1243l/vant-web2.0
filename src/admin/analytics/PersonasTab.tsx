import React from 'react';
import { motion } from 'motion/react';
import { Target } from 'lucide-react';
import { Card } from '../ui';
import { formatCurrency } from '../format';
import type { CustomerSession } from '../lib/analytics';

interface Props {
  customerSessions: CustomerSession[];
  isAr: boolean;
}

export const PersonasTab: React.FC<Props> = ({ customerSessions, isAr }) => {
  return (
    <motion.div
      key="personas"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Algorithm 2 Intro Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/60 border border-indigo-500/20 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>
                {isAr
                  ? 'خوارزمية تصنيف المشترين (RFM Buyer Personas)'
                  : 'Algorithm 2: Behavioral Personas & RFM Lead Scoring'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {isAr
                ? 'تصنيف زوار المتجر وتحديد النتيجة القياسية (RFM Score 0–100)'
                : 'Classify Customer Sessions & Compute RFM Lead Scores (0-100)'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              {isAr
                ? 'تحديد نمط كل زائر تلقائياً (عميل VIP، صائد العروض، متصفح عابر، أو متردد) لحساب احتمالية إتمام الشراء وتوجيه الحملات الترويجية المناسبة.'
                : 'Segments incoming traffic into behavioral archetypes (VIP, Deal Hunter, Window Shopper, Hesitant) based on session activity, cart intent, and purchase history.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 shrink-0">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">
                {isAr ? 'عملاء VIP' : 'VIP Buyers'}
              </span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {customerSessions.filter((s) => s.persona === 'VIP').length}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">
                {isAr ? 'صيادو الصفقات' : 'Deal Hunters'}
              </span>
              <span className="text-lg font-bold font-mono text-indigo-400">
                {customerSessions.filter((s) => s.persona === 'Deal Hunter').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Persona Sessions Table Card */}
      <Card className="p-0 overflow-hidden bg-slate-900/50 backdrop-blur-xl border-slate-800/80">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-start">{isAr ? 'العميل والجلسة' : 'Customer Session'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'نمط المشتري (Persona)' : 'Persona Archetype'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'درجة RFM (0-100)' : 'RFM Lead Score'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'احتمالية الشراء' : 'Purchase Prob.'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'التفاعل بالسلة' : 'Activity'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'إجمالي المشتريات (IQD)' : 'Total Spent (IQD)'}</th>
                <th className="py-3.5 px-4 text-end">{isAr ? 'الحالة' : 'Activity'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customerSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    {isAr
                      ? 'لا توجد جلسات عملاء مسجلة في قاعدة البيانات حالياً'
                      : 'No customer sessions recorded in database yet'}
                  </td>
                </tr>
              ) : (
                customerSessions.map((session) => {
                  const personaConfig = {
                    VIP: {
                      labelAr: 'عميل مميز (VIP)',
                      labelEn: 'VIP Patron',
                      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                      dot: 'bg-emerald-400',
                    },
                    'Deal Hunter': {
                      labelAr: 'صائد صفقات (Deal Hunter)',
                      labelEn: 'Deal Hunter',
                      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
                      dot: 'bg-indigo-400',
                    },
                    'Window Shopper': {
                      labelAr: 'متصفح عابر (Window Shopper)',
                      labelEn: 'Window Shopper',
                      badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
                      dot: 'bg-slate-400',
                    },
                    'Hesitant Buyer': {
                      labelAr: 'مشترٍ متردد (Hesitant)',
                      labelEn: 'Hesitant Buyer',
                      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                      dot: 'bg-amber-400',
                    },
                  };

                  const currentP = personaConfig[session.persona];

                  return (
                    <tr key={session.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm">{session.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{session.phone}</div>
                      </td>

                      {/* Persona Tag */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${currentP.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${currentP.dot}`} />
                          <span>{isAr ? currentP.labelAr : currentP.labelEn}</span>
                        </span>
                      </td>

                      {/* RFM Score Progress */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm min-w-[28px]">
                            {session.rfmScore}
                          </span>
                          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${session.rfmScore}%` }}
                              className={`h-full rounded-full ${
                                session.rfmScore >= 85
                                  ? 'bg-emerald-400'
                                  : session.rfmScore >= 70
                                  ? 'bg-indigo-400'
                                  : 'bg-amber-400'
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Purchase Probability */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-emerald-400 font-mono text-sm">
                          %{session.purchaseProbability}
                        </span>
                      </td>

                      {/* Activity */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                        <span className="font-semibold text-white">{session.viewCount}</span>{' '}
                        {isAr ? 'مشاهدة' : 'views'}
                        <span className="text-slate-500 mx-1.5">/</span>
                        <span className="font-semibold text-indigo-400">{session.cartCount}</span>{' '}
                        {isAr ? 'بالسلة' : 'carted'}
                      </td>

                      {/* Total Spent in Iraqi Dinar */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-white">
                        {formatCurrency(session.totalSpentIQD, 'IQD', isAr ? 'ar' : 'en')}
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-end whitespace-nowrap">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {session.lastActive}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { Eye, RotateCcw, Trash2 } from 'lucide-react';
import { Card, StatusBadge } from '../ui';
import type { SentCampaignRecord } from './types';
import { templatePresets } from './presets';

interface Props {
  sentHistory: SentCampaignRecord[];
  setPreviewingHistoryItem: (item: SentCampaignRecord | null) => void;
  handleLoadCampaignFromHistory: (item: SentCampaignRecord) => void;
  handleDeleteHistoryItem: (id: string) => void;
  isAr: boolean;
}

export const CampaignHistoryTab: React.FC<Props> = ({
  sentHistory,
  setPreviewingHistoryItem,
  handleLoadCampaignFromHistory,
  handleDeleteHistoryItem,
  isAr,
}) => {
  return (
    <motion.div
      key="tab-history"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Top Performance Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <div className="text-xs text-slate-400 mb-1">{isAr ? 'إجمالي الحملات المرسلة' : 'Total Campaigns Sent'}</div>
          <div className="text-2xl font-bold text-white">{sentHistory.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'أرشيف الإرسال الكامل' : 'All dispatched messages'}</p>
        </Card>

        <Card>
          <div className="text-xs text-slate-400 mb-1">{isAr ? 'متوسط نسبة الفتح' : 'Avg. Open Rate'}</div>
          <div className="text-2xl font-bold text-indigo-400">
            —
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'غير متاح بدون ربط تتبّع فعلي' : 'Unavailable without verified tracking'}</p>
        </Card>

        <Card>
          <div className="text-xs text-slate-400 mb-1">{isAr ? 'متوسط النقر والتفاعل' : 'Avg. Click Rate'}</div>
          <div className="text-2xl font-bold text-emerald-400">
            —
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'غير متاح بدون ربط تتبّع فعلي' : 'Unavailable without verified tracking'}</p>
        </Card>

        <Card>
          <div className="text-xs text-slate-400 mb-1">{isAr ? 'إجمالي الرسائل المستلمة' : 'Total Reach'}</div>
          <div className="text-2xl font-bold text-white">
            {sentHistory.reduce((acc, c) => acc + c.recipientsCount, 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'وصول ناجح للمشتركين' : 'Delivered recipients'}</p>
        </Card>
      </div>

      {/* History List Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-start">{isAr ? 'اسم الحملة وعنوان البريد' : 'Campaign & Subject'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'تاريخ الإرسال' : 'Sent Date'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'المستلمون' : 'Recipients'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'قناة الإرسال' : 'Channel'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'نسبة الفتح' : 'Open Rate'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="py-3.5 px-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sentHistory.map((item) => {
                const preset = templatePresets[item.templateType];
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Subject & Type */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{item.subject}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border ${preset?.badgeBg}`}>
                          {preset ? (isAr ? preset.nameAr : preset.nameEn) : item.templateType}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {item.id}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-300 font-mono text-xs whitespace-nowrap">
                      {item.sentDate}
                    </td>

                    {/* Recipients Count */}
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {item.recipientsCount} {isAr ? 'مشترك' : 'users'}
                    </td>

                    {/* Dispatch Channel */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {item.channel === 'resend'
                          ? 'Resend API'
                          : item.channel === 'mailto'
                          ? 'Mailto Broadcast'
                          : 'Direct Simulator'}
                      </span>
                    </td>

                    {/* Open Rate */}
                    <td className="py-3 px-4 font-bold text-emerald-400 whitespace-nowrap">
                      —
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge
                        status={item.status === 'delivered' ? 'active' : 'warning'}
                        label={
                          item.status === 'delivered'
                            ? isAr
                              ? 'تم التسليم'
                              : 'Delivered'
                            : isAr
                            ? 'قيد الإرسال'
                            : 'Sending'
                        }
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-end whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewingHistoryItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title={isAr ? 'معاينة القالب والتفاصيل' : 'Preview Details'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleLoadCampaignFromHistory(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title={isAr ? 'إعادة استخدام القالب والنصوص' : 'Reuse Template'}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title={isAr ? 'حذف من السجل' : 'Delete Record'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {sentHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">
                    {isAr
                      ? 'لا توجد حملات مرسلة. الإرسال الآلي متوقف؛ يمكنك تصميم القوالب ومعاينتها.'
                      : 'No sent campaigns in history. Dispatch your first campaign from the Studio tab!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};

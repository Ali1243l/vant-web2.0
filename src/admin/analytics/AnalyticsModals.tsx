import React from 'react';
import { Modal, Button } from '../ui';
import { formatCurrency, formatPercent } from '../format';
import type { ChartDataPoint, DatasetPeriod } from './types';

interface Props {
  selectedBarData: ChartDataPoint | null;
  setSelectedBarData: (data: ChartDataPoint | null) => void;
  currentDataset: DatasetPeriod;
  isAr: boolean;
}

export const AnalyticsModals: React.FC<Props> = ({ selectedBarData, setSelectedBarData, currentDataset, isAr }) => {
  if (!selectedBarData) return null;
  return (
    <Modal
      isOpen
      onClose={() => setSelectedBarData(null)}
      title={isAr ? `تفاصيل الفترة: ${selectedBarData.labelAr}` : `Period details: ${selectedBarData.labelEn}`}
      description={isAr ? 'إيراد الطلبات المسلّمة وعدد الطلبات المسجّلة غير الملغية' : 'Delivered revenue and recorded non-cancelled order count'}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
            <span className="text-slate-400 block mb-1">{isAr ? 'إيراد الطلبات المسلّمة' : 'Delivered revenue'}</span>
            <span className="text-lg font-bold text-white font-mono">{formatCurrency(selectedBarData.sales, 'IQD', isAr ? 'ar' : 'en')}</span>
            <span className="text-indigo-300 block mt-1">{formatPercent(currentDataset.totalRevenue > 0 ? Math.round(selectedBarData.sales / currentDataset.totalRevenue * 1000) / 10 : 0)} {isAr ? 'من إجمالي الإيراد بالفترة' : 'of period revenue'}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
            <span className="text-slate-400 block mb-1">{isAr ? 'الطلبات المسجّلة' : 'Recorded orders'}</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{selectedBarData.orders}</span>
            <span className="text-emerald-300 block mt-1">{formatPercent(currentDataset.totalOrders > 0 ? Math.round(selectedBarData.orders / currentDataset.totalOrders * 1000) / 10 : 0)} {isAr ? 'من إجمالي الطلبات بالفترة' : 'of period orders'}</span>
          </div>
        </div>
        <p className="text-slate-400 leading-6">{isAr ? 'التاريخ هو تاريخ تسجيل الطلب. عدد الطلبات يشمل قيد التجهيز والشحن، والإيراد يحتسب المسلّم فقط؛ لذلك مو كل طلب ظاهر يعني بيعاً مسلّماً.' : 'Dates use order creation time. Order counts include processing and shipping; revenue includes delivered orders only.'}</p>
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button size="sm" onClick={() => setSelectedBarData(null)}>{isAr ? 'إغلاق النافذة' : 'Close'}</Button>
        </div>
      </div>
    </Modal>
  );
};

import React from 'react';
import { Calendar, RotateCcw, Check } from 'lucide-react';
import { Modal, Button } from '../ui';
import { formatCurrency, formatPercent } from '../format';
import type { ChartDataPoint, DatasetPeriod, TimeRange } from './types';

interface Props {
  selectedBarData: ChartDataPoint | null;
  setSelectedBarData: (data: ChartDataPoint | null) => void;
  currentDataset: DatasetPeriod;
  showCustomDateModal: boolean;
  setShowCustomDateModal: (show: boolean) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  setTimeRange: (range: TimeRange) => void;
  showResetModal: boolean;
  setShowResetModal: (show: boolean) => void;
  resetSuccess: boolean;
  confirmResetData: () => Promise<void>;
  isResetting: boolean;
  isAr: boolean;
}

export const AnalyticsModals: React.FC<Props> = ({
  selectedBarData,
  setSelectedBarData,
  currentDataset,
  showCustomDateModal,
  setShowCustomDateModal,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  setTimeRange,
  showResetModal,
  setShowResetModal,
  resetSuccess,
  confirmResetData,
  isResetting,
  isAr,
}) => {
  return (
    <>
      {/* Selected Bar Details Modal */}
      {selectedBarData && (
        <Modal
          isOpen={!!selectedBarData}
          onClose={() => setSelectedBarData(null)}
          title={
            isAr
              ? `تحليل أداء فترة: ${selectedBarData.labelAr}`
              : `Telemetry Breakdown: ${selectedBarData.labelEn}`
          }
          description={
            isAr
              ? 'بيانات المبيعات وحجم الطلبات ومؤشرات التحويل المرصودة'
              : 'Sales volume, completed orders and conversion telemetry'
          }
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <span className="text-slate-400 block mb-1 font-medium">
                  {isAr ? 'إجمالي المبيعات' : 'Total Revenue'}
                </span>
                <span className="text-lg font-bold text-white font-mono">
                  {formatCurrency(selectedBarData.sales, 'IQD', isAr ? 'ar' : 'en')}
                </span>
                <span className="text-[10px] text-indigo-400 block mt-1">
                  {currentDataset.totalRevenue > 0
                    ? `${formatPercent(
                        Math.round((selectedBarData.sales / currentDataset.totalRevenue) * 1000) / 10
                      )} ${isAr ? 'من إجمالي الفترة' : 'of period total'}`
                    : '0%'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-slate-400 block mb-1 font-medium">
                  {isAr ? 'الطلبات المكتملة' : 'Completed Orders'}
                </span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {selectedBarData.orders} {isAr ? 'طلب' : 'orders'}
                </span>
                <span className="text-[10px] text-emerald-300 block mt-1">
                  {currentDataset.totalOrders > 0
                    ? `${formatPercent(
                        Math.round((selectedBarData.orders / currentDataset.totalOrders) * 1000) / 10
                      )} ${isAr ? 'من إجمالي الطلبات' : 'of period orders'}`
                    : '0%'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <div className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{isAr ? 'ملخص تحليلي حقيقي' : 'Database Telemetry Summary'}</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                {isAr
                  ? `سجلت هذه الفترة ${selectedBarData.orders} طلب بإجمالي مبيعات قدره ${formatCurrency(
                      selectedBarData.sales,
                      'IQD',
                      'ar'
                    )} مباشرة من قاعدة البيانات.`
                  : `This period recorded ${selectedBarData.orders} orders with total sales of ${formatCurrency(
                      selectedBarData.sales,
                      'IQD',
                      'en'
                    )} directly from database.`}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button size="sm" onClick={() => setSelectedBarData(null)}>
                {isAr ? 'إغلاق النافذة' : 'Close'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Custom Date Range Selection Modal */}
      {showCustomDateModal && (
        <Modal
          isOpen={showCustomDateModal}
          onClose={() => setShowCustomDateModal(false)}
          title={isAr ? 'تحديد فترة زمنية مخصصة' : 'Set Custom Date Range'}
          description={
            isAr
              ? 'اختر تاريخ البداية والنهاية لتصفية المبيعات والبيانات الحية'
              : 'Select start and end dates to filter live sales telemetry'
          }
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1.5 font-medium">
                  {isAr ? 'من تاريخ (تاريخ البداية)' : 'From Date (Start)'}
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1.5 font-medium">
                  {isAr ? 'إلى تاريخ (تاريخ النهاية)' : 'To Date (End)'}
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                {isAr
                  ? `الفترة المحددة: ${customStartDate || 'غير محدد'} إلى ${customEndDate || 'اليوم'}`
                  : `Selected Range: ${customStartDate || 'All time'} to ${customEndDate || 'Today'}`}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
              >
                {isAr ? 'إعادة ضبط' : 'Reset'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setTimeRange('custom');
                  setShowCustomDateModal(false);
                }}
              >
                {isAr ? 'تطبيق الفلتر' : 'Apply Filter'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Purge & Reset Confirmation Modal */}
      {showResetModal && (
        <Modal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          title={
            isAr
              ? 'تصفير قاعدة بيانات سجلات التتبع بالكامل'
              : 'Purge All Telemetry Logs'
          }
          description={
            isAr
              ? 'تصفير وإعادة تعيين جميع عدادات الزيارات وسجلات الأخطاء والأحداث إلى صفر.'
              : 'Permanently purge all visitor logs and telemetry from Supabase and client storage.'
          }
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            {resetSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Check className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-white text-sm">
                  {isAr
                    ? 'تم تصفير الداتابيس والسجلات بنجاح 100%!'
                    : 'Database Logs Purged 100% Successfully!'}
                </h5>
                <p className="text-slate-400 text-xs">
                  {isAr
                    ? 'تم مسح كافة سجلات الزوار والأحداث وإرجاع العدادات كلياً إلى 0.'
                    : 'All telemetry events cleared. Visit counters reset to zero.'}
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white mb-1">
                      {isAr
                        ? 'هل أنت تأكد من البدء باختبار جديد وتصفير العداد؟'
                        : 'Are you sure you want to purge all telemetry logs?'}
                    </h5>
                    <p className="text-slate-400">
                      {isAr
                        ? 'سيتم حذف كافة سجلات الزيارات والجلسات المسجلة كلياً من جدول logs في Supabase والذاكرة المحلية، وتصفير جميع العدادات إلى 0 لبدء اختبار حي جديد.'
                        : 'This action will permanently delete all session logs from Supabase and local storage, resetting all metrics back to 0.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResetModal(false)}
                    disabled={isResetting}
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={confirmResetData}
                    isLoading={isResetting}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
                  >
                    {isAr ? 'تأكيد التصفير 100%' : 'Confirm Purge 100%'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

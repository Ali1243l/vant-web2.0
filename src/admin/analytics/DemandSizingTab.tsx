import React from 'react';
import { motion } from 'motion/react';
import { Zap, AlertTriangle, Search } from 'lucide-react';
import { Card } from '../ui';
import { formatCurrency } from '../format';
import type { SizeDemandItem, UnmetSearchQuery } from '../lib/analytics';

interface Props {
  sizeDemandMatrix: SizeDemandItem[];
  unmetSearches: UnmetSearchQuery[];
  unmetSearchLossIQD: number;
  isAr: boolean;
}

export const DemandSizingTab: React.FC<Props> = ({
  sizeDemandMatrix,
  unmetSearches,
  unmetSearchLossIQD,
  isAr,
}) => {
  return (
    <motion.div
      key="demand-sizing"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Algorithm 3 Intro Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-slate-900/60 border border-amber-500/20 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>
                {isAr
                  ? 'خوارزمية سرعة الطلب والمقاسات (Demand Velocity Matrix)'
                  : 'Algorithm 3: Size Demand & Unmet Search Intelligence'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {isAr
                ? 'مصفوفة توازن المقاسات وتحليل الكلمات البحثية غير الملباة'
                : 'Size Request-to-Stock Ratios & Unmet Customer Searches'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              {isAr
                ? 'مقارنة حجم الطلب الفعلي على كل مقاس مقابل المخزون المتوفر للتنبؤ بنفاد السلع وتفادي انخفاض المبيعات، مع كشف عمليات البحث التي لم تسفر عن نتائج لتحديد المنتجات المطلوبة في السوق العراقي.'
                : 'Evaluates size velocity against available inventory to flag stockout risks and highlights zero-result customer searches indicating unmet market demand in IQD.'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[140px] shrink-0">
            <div className="text-xs text-slate-400 mb-0.5">
              {isAr ? 'خسائر البحث غير الملبى' : 'Unmet Demand Loss'}
            </div>
            <div className="text-base font-bold font-mono text-amber-400">
              {formatCurrency(unmetSearchLossIQD, 'IQD', isAr ? 'ar' : 'en')}
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Section 1: Sizing Velocity Table */}
      <Card className="p-5 bg-slate-900/50 backdrop-blur-xl border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white">
              {isAr ? 'مصفوفة استهلاك وتوفر المقاسات (Size Demand Matrix)' : 'Size Request vs. Stock Matrix'}
            </h4>
            <p className="text-xs text-slate-400">
              {isAr ? 'مقارنة معدل اختيار المقاس مع المخزون المتبقي ومعدل انخفاض التحويل' : 'Compare requested velocity with inventory buffer'}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 font-mono">
            {sizeDemandMatrix.length} {isAr ? 'مقاسات مرصودة' : 'tracked sizes'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase">
                <th className="py-3 px-3 text-start">{isAr ? 'المنتج' : 'Product'}</th>
                <th className="py-3 px-3 text-start">{isAr ? 'المقاس / الحجم' : 'Size / Variant'}</th>
                <th className="py-3 px-3 text-start">{isAr ? 'سرعة الطلب (7 أيام)' : 'Weekly Velocity'}</th>
                <th className="py-3 px-3 text-start">{isAr ? 'المخزون المتبقي' : 'In Stock'}</th>
                <th className="py-3 px-3 text-start">{isAr ? 'هبوط التحويل' : 'Dropoff Rate'}</th>
                <th className="py-3 px-3 text-end">{isAr ? 'حالة التوازن' : 'Deficit Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sizeDemandMatrix.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    {isAr ? 'لا توجد بيانات مقاسات مسجلة في قاعدة البيانات حالياً' : 'No size demand telemetry recorded yet'}
                  </td>
                </tr>
              ) : (
                sizeDemandMatrix.map((item) => {
                  const isRisk = item.status === 'stockout_risk';
                  const isSurplus = item.status === 'surplus';

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-medium text-white">{item.productName}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs font-semibold border border-slate-700">
                          {item.size}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-200">
                        <strong>{item.requestedVelocity}</strong> {isAr ? 'طلب' : 'reqs'}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className={item.stockLevel <= 3 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {item.stockLevel} {isAr ? 'قطعة' : 'units'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-rose-400 font-semibold">
                        %{item.conversionDropRate}
                      </td>
                      <td className="py-3 px-3 text-end whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                            isRisk
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : isSurplus
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                          }`}
                        >
                          {isRisk ? (
                            <>
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              <span>{isAr ? 'خطر نفاد حاد' : 'Stockout Risk'}</span>
                            </>
                          ) : isSurplus ? (
                            <span>{isAr ? 'فائض مخزون' : 'Surplus'}</span>
                          ) : (
                            <span>{isAr ? 'متوازن' : 'Balanced'}</span>
                          )}
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

      {/* Matrix Section 2: Unmet Search Intelligence */}
      <Card className="p-5 bg-slate-900/50 backdrop-blur-xl border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span>
                {isAr
                  ? 'ذكاء عمليات البحث غير الملباة (Unmet Search Intelligence)'
                  : 'Unmet Search Intelligence'}
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'كلمات بحث العملاء التي لم تسفر عن نتائج، مع القيمة التقديرية للإيرادات المفقودة'
                : 'Zero-result product queries highlighting immediate inventory expansion opportunities'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {unmetSearches.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              {isAr ? 'لا توجد عمليات بحث بدون نتائج مسجلة حتى الآن' : 'No zero-result searches recorded'}
            </div>
          ) : (
            unmetSearches.map((unmet) => (
              <div
                key={unmet.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] text-indigo-400 font-semibold">{unmet.category}</span>
                    <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                      +{unmet.growthTrend}% {isAr ? 'نمو' : 'trend'}
                    </span>
                  </div>
                  <h5 className="font-bold text-white text-xs leading-snug">
                    "{unmet.query}"
                  </h5>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'عمليات البحث' : 'Searches'}</span>
                    <span className="font-bold font-mono text-white">{unmet.searchVolume}</span>
                  </div>
                  <div className="text-end">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'الإيراد المفقود' : 'Est. Lost Rev.'}</span>
                    <span className="font-bold font-mono text-amber-400">
                      {formatCurrency(unmet.estimatedLostRevenueIQD, 'IQD', isAr ? 'ar' : 'en')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </motion.div>
  );
};

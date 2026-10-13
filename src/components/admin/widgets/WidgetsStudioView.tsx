import React, { useState } from 'react';
import { Layers, Calendar, Sliders, Check, Copy } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { PaginationWidget } from './PaginationWidget';
import { DateRangeFilterWidget } from './DateRangeFilterWidget';
import { PriceRangeFilterWidget } from './PriceRangeFilterWidget';

interface Props {
  lang?: 'ar' | 'en';
}

export function WidgetsStudioView({ lang = 'ar' }: Props) {
  const isAr = lang === 'ar';

  // Demo States
  const [currentPage, setCurrentPage] = useState(2);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 14),
    to: new Date(),
  });
  const [priceRange, setPriceRange] = useState<number[]>([25000, 150000]);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-indigo-900/30 via-slate-900/60 to-slate-900/30 border border-indigo-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isAr ? 'استوديو الأدوات والوحدات المعيارية (Admin Widgets Studio)' : 'Admin Widgets Studio'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isAr
                ? 'وحدات جاهزة للاستخدام في شريط الأدوات، الجداول، وتقارير المبيعات مبنية على مكتبات Radix UI و Framer Motion.'
                : 'Reusable modular widgets for data tables, toolbars, and filters built with Radix UI & Framer Motion.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* WIDGET 1: Pagination Widget */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                01 / Widgets
              </div>
              <h3 className="text-base font-bold text-white">
                PaginationWidget.tsx
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'وحدة تصفح الجداول المتجاوبة مع اختيار عدد العناصر لكل صفحة وقراءة إحصائية.'
                  : 'Responsive data table pagination bar with page size selector and item counter.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'pagination',
                  `<PaginationWidget\n  currentPage={${currentPage}}\n  totalItems={85}\n  pageSize={${pageSize}}\n  onPageChange={setCurrentPage}\n  onPageSizeChange={setPageSize}\n  lang="${lang}"\n/>`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              {copiedCode === 'pagination' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isAr ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{isAr ? 'نسخ الكود' : 'Copy Code'}</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="text-[11px] font-mono text-slate-500 uppercase">
              {isAr ? 'المعاينة الحية:' : 'Live Widget Demo:'}
            </div>
            <PaginationWidget
              currentPage={currentPage}
              totalItems={85}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              lang={lang}
              itemLabel={isAr ? 'طلب' : 'orders'}
            />
          </div>
        </div>

        {/* WIDGET 2: Date Range Filter Widget */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                02 / Widgets
              </div>
              <h3 className="text-base font-bold text-white">
                DateRangeFilterWidget.tsx
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'منتقي التاريخ المنبثق (z-[99999] و absolute) المخصص لتقارير المبيعات وتحليلات الزوار.'
                  : 'Isolated date range popover filter widget with presets and reset action.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'daterange',
                  `<DateRangeFilterWidget\n  value={dateRange}\n  onChange={setDateRange}\n  lang="${lang}"\n  label="${isAr ? 'فترة الطلبات' : 'Orders Period'}"\n/>`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              {copiedCode === 'daterange' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isAr ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{isAr ? 'نسخ الكود' : 'Copy Code'}</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="text-[11px] font-mono text-slate-500 uppercase">
              {isAr ? 'المعاينة الحية:' : 'Live Widget Demo:'}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <DateRangeFilterWidget
                value={dateRange}
                onChange={setDateRange}
                lang={lang}
                label={isAr ? 'فترة المبيعات والتقارير' : 'Sales & Reports Window'}
              />

              <div className="text-xs font-mono text-slate-400 ps-2">
                {isAr ? 'النطاق الفعّال:' : 'Active Window:'}{' '}
                <span className="text-indigo-400">
                  {dateRange?.from?.toLocaleDateString() || 'None'} – {dateRange?.to?.toLocaleDateString() || 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET 3: Price Range Filter Widget */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                03 / Widgets
              </div>
              <h3 className="text-base font-bold text-white">
                PriceRangeFilterWidget.tsx
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'وحدة تصفية الأسعار بالدينار العراقي المبنية على Radix Slider مع التلميح العائم الذكي (Tooltip).'
                  : 'Radix Slider price filter with animated tooltip follow-through.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'price',
                  `<PriceRangeFilterWidget\n  value={priceRange}\n  onChange={setPriceRange}\n  min={0}\n  max={300000}\n  step={5000}\n  currency="${isAr ? 'د.ع' : 'IQD'}"\n  lang="${lang}"\n/>`
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-750 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors shadow-xs cursor-pointer"
            >
              {copiedCode === 'price' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isAr ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{isAr ? 'نسخ الكود' : 'Copy Code'}</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">
              {isAr ? 'المعاينة الحية:' : 'Live Widget Demo:'}
            </div>
            <div className="max-w-md">
              <PriceRangeFilterWidget
                value={priceRange}
                onChange={setPriceRange}
                min={0}
                max={300000}
                step={5000}
                currency={isAr ? 'د.ع' : 'IQD'}
                lang={lang}
                onReset={() => setPriceRange([0, 300000])}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WidgetsStudioView;

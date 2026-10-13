import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Calendar, Sliders, FileCode, Check, Copy } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { Pagination } from './Pagination';
import { DateRangePicker } from './DateRangePicker';
import { RangeSlider } from './RangeSlider';

interface Props {
  lang?: 'ar' | 'en';
}

export function UIComponentsShowcase({ lang = 'ar' }: Props) {
  const isAr = lang === 'ar';

  // 1. Pagination Demo State
  const [currentPage, setCurrentPage] = useState(3);
  const [totalPages] = useState(12);

  // 2. DateRangePicker Demo State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  // 3. RangeSlider Demo State (In Iraqi Dinar IQD / د.ع)
  const [priceRange, setPriceRange] = useState<number[]>([25000, 150000]);
  const [discountPercent, setDiscountPercent] = useState<number[]>([35]);

  // Code copy feedback
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyCode = (snippetName: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(snippetName);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-6 pb-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-indigo-900/30 via-slate-900/60 to-slate-900/30 border border-indigo-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-950">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              {isAr ? 'مكتبة مكونات الواجهة الموحدة (VANT UI Kit)' : 'VANT Unified UI Components'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {isAr
                ? 'مكونات أساسية مبنية ومصممة بأعلى معايير الأناقة مع دعم كامل للشاشات المختلفة واللغتين العربية والإنجليزية.'
                : 'Foundational primitives crafted with high fidelity, responsive layout, and bilingual support.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 3 Components */}
      <div className="grid grid-cols-1 gap-6">
        {/* COMPONENT 1: Pagination */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 backdrop-blur-xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                01 / Components
              </span>
              <h4 className="text-base font-bold text-slate-100">
                Pagination.tsx
              </h4>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'تصفح الصفحات بتصميم متجاوب: في الشاشات الصغيرة يعرض رقم الصفحة وأزرار التنقل فقط.'
                  : 'Responsive pagination: collapses to compact page counter & navigation on mobile.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                copyCode(
                  'pagination',
                  `<Pagination\n  currentPage={${currentPage}}\n  totalPages={${totalPages}}\n  onPageChange={setCurrentPage}\n  lang="${lang}"\n/>`
                )
              }
              className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-1.5 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors shadow-xs cursor-pointer"
            >
              {copiedSnippet === 'pagination' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isAr ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{isAr ? 'نسخ الاستدعاء' : 'Copy Usage'}</span>
                </>
              )}
            </button>
          </div>

          {/* Live Interactive Preview */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center gap-4">
            <div className="text-xs font-mono text-slate-400">
              {isAr ? 'معاينة حية تفاعلية:' : 'Live Interactive Preview:'}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              lang={lang}
              showFirstLast={true}
            />

            <div className="text-xs font-semibold text-slate-300">
              {isAr ? `الصفحة النشطة حالياً: ${currentPage}` : `Current active page: ${currentPage}`}
            </div>
          </div>
        </div>

        {/* COMPONENT 2: DateRangePicker */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 backdrop-blur-xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                02 / Components
              </span>
              <h4 className="text-base font-bold text-slate-100">
                DateRangePicker.tsx
              </h4>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'منتقي التاريخ بنظام Pop-over معزول تماماً مع فترات سريعة ودعم العربية.'
                  : 'Date range picker with isolated popover and quick presets.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                copyCode(
                  'daterangepicker',
                  `<DateRangePicker\n  value={dateRange}\n  onChange={setDateRange}\n  lang="${lang}"\n  showPresets={true}\n/>`
                )
              }
              className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-full border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {copiedSnippet === 'daterangepicker' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500">{isAr ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{isAr ? 'نسخ الاستدعاء' : 'Copy Usage'}</span>
                </>
              )}
            </button>
          </div>

          {/* Live Interactive Preview */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/60 flex flex-col items-start gap-4">
            <div className="text-xs font-mono text-slate-400">
              {isAr ? 'معاينة حية تفاعلية:' : 'Live Interactive Preview:'}
            </div>

            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              lang={lang}
              showPresets={true}
            />

            <div className="text-xs font-mono text-slate-400">
              {isAr ? 'النطاق المختار حالياً:' : 'Selected Range:'}{' '}
              {dateRange?.from?.toLocaleDateString() || 'None'} –{' '}
              {dateRange?.to?.toLocaleDateString() || 'None'}
            </div>
          </div>
        </div>

        {/* COMPONENT 3: RangeSlider */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 backdrop-blur-xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                03 / Components
              </span>
              <h4 className="text-base font-bold text-slate-100">
                RangeSlider.tsx
              </h4>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'شريط تمرير مع تلميح متحرك (Tooltip) يطفو فوق المقبض بنعومة أثناء السحب.'
                  : 'Radix Slider primitive with smooth floating tooltip following thumbs.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                copyCode(
                  'rangeslider',
                  `<RangeSlider\n  value={priceRange}\n  onValueChange={setPriceRange}\n  min={10000}\n  max={250000}\n  step={5000}\n  formatValue={(v) => \`\${v.toLocaleString()} ${isAr ? 'د.ع' : 'IQD'}\`}\n  label="${isAr ? 'نطاق السعر (بالدينار العراقي)' : 'Price Range (IQD)'}"\n/>`
                )
              }
              className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-1.5 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors shadow-xs cursor-pointer"
            >
              {copiedSnippet === 'rangeslider' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isAr ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{isAr ? 'نسخ الاستدعاء' : 'Copy Usage'}</span>
                </>
              )}
            </button>
          </div>

          {/* Live Interactive Preview */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-6 max-w-xl">
            <div className="text-xs font-mono text-slate-400">
              {isAr ? 'معاينة حية تفاعلية:' : 'Live Interactive Preview:'}
            </div>

            {/* Example 1: Dual Thumb Range (Price in Iraqi Dinar) */}
            <RangeSlider
              label={isAr ? 'تصفية نطاق السعر بالدينار العراقي (Dual Handles)' : 'Price Range Filter (Dual Handles - IQD)'}
              value={priceRange}
              onValueChange={setPriceRange}
              min={10000}
              max={250000}
              step={5000}
              formatValue={(val) => (isAr ? `${val.toLocaleString()} د.ع` : `${val.toLocaleString()} IQD`)}
            />

            {/* Example 2: Single Thumb (Discount %) */}
            <RangeSlider
              label={isAr ? 'نسبة الخصم المئوية (Single Handle)' : 'Discount Percentage (Single Handle)'}
              value={discountPercent}
              onValueChange={setDiscountPercent}
              min={0}
              max={100}
              step={5}
              formatValue={(val) => `%${val}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UIComponentsShowcase;

import React from 'react';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  FileText,
} from 'lucide-react';
import {
  downloadAnalyticsExcel,
  downloadAnalyticsCSV,
  downloadAnalyticsJSON,
  downloadAnalyticsHTMLReport,
  downloadAnalyticsMarkdown,
} from '../../lib/analytics';
import type { Product } from '../../types';

export interface ExportHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  isAr?: boolean;
}

export const ExportHubModal: React.FC<ExportHubModalProps> = ({
  isOpen,
  onClose,
  products,
  isAr = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-[#12151f] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004ad7]/20 text-[#3b82f6] border border-[#004ad7]/30">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? 'تصدير بيانات المتجر والعملاء (Multi-Format Export)' : 'Multi-Format Data Export Hub'}
              </h3>
              <p className="text-xs text-white/50">
                {isAr ? 'اختر الصيغة المناسبة لتنزيل البيانات والتحليلات بالكامل' : 'Select desired format to download all analytics & customer records'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Excel XML */}
          <button
            type="button"
            onClick={() => {
              downloadAnalyticsExcel(products);
              onClose();
            }}
            className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-start hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Excel Workbook (.xls)</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">موصى به</span>
              </div>
              <p className="text-[11px] text-white/60 mt-1">
                {isAr ? 'مصنف إكسل احترافي متعدد الأوراق بتنسيق رسمي' : 'Multi-sheet workbook with styled formatting'}
              </p>
            </div>
          </button>

          {/* 2. CSV */}
          <button
            type="button"
            onClick={() => {
              downloadAnalyticsCSV(products);
              onClose();
            }}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-start hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004ad7]/20 text-[#3b82f6] group-hover:scale-105 transition-transform">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">CSV (Excel UTF-8 BOM)</span>
              <p className="text-[11px] text-white/60 mt-1">
                {isAr ? 'ملف CSV يدعم اللغة العربية بالكامل دون رموز مشوهة' : 'Arabic UTF-8 compatible CSV export'}
              </p>
            </div>
          </button>

          {/* 3. JSON */}
          <button
            type="button"
            onClick={() => {
              downloadAnalyticsJSON(products);
              onClose();
            }}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-start hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">Raw JSON Feed (.json)</span>
              <p className="text-[11px] text-white/60 mt-1">
                {isAr ? 'البيانات الخام الكاملة لكافة الأحداث والخطوط الزمنية' : 'Raw full payload for programmatic consumption'}
              </p>
            </div>
          </button>

          {/* 4. HTML Report */}
          <button
            type="button"
            onClick={() => {
              downloadAnalyticsHTMLReport(products);
              onClose();
            }}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-start hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">Executive HTML Report (.html)</span>
              <p className="text-[11px] text-white/60 mt-1">
                {isAr ? 'تقرير تنفيذي فاخر قابل للطباعة والحفظ كملف PDF' : 'Ready-to-print luxury dashboard report'}
              </p>
            </div>
          </button>

          {/* 5. Markdown Summary */}
          <button
            type="button"
            onClick={() => {
              downloadAnalyticsMarkdown(products);
              onClose();
            }}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-start hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">Markdown Summary (.md)</span>
              <p className="text-[11px] text-white/60 mt-1">
                {isAr ? 'ملخص تنفيذي بصيغة ماركداون للمشاركة الفورية' : 'Markdown summary formatted for quick sharing'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportHubModal;

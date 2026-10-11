import React, { useState } from 'react';
import {
  Download,
  Layers,
  FileSpreadsheet,
  FileCode,
  Printer,
  FileText,
  Copy,
  Check,
  Upload,
} from 'lucide-react';
import type { Product } from '../../types';
import {
  downloadAnalyticsExcel,
  downloadAnalyticsCSV,
  downloadAnalyticsJSON,
  downloadAnalyticsHTMLReport,
  downloadAnalyticsMarkdown,
} from '../../lib/analytics';

interface AdminBackupTabProps {
  isAr: boolean;
  products: Product[];
  exportAllDataJSON: () => string;
  importAllDataJSON: (jsonStr: string) => boolean;
}

export const AdminBackupTab: React.FC<AdminBackupTabProps> = ({
  isAr,
  products,
  exportAllDataJSON,
  importAllDataJSON,
}) => {
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-2 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Download className="h-5 w-5 text-cyan-400" />
          <span>{isAr ? 'مركز تصدير البيانات والنسخ الاحتياطي متعدد الصيغ' : 'Multi-Format Export & Backup Hub'}</span>
        </h2>
        <p className="text-xs text-white/60 mt-0.5">
          {isAr
            ? 'تصدير وسحب بيانات المتجر والكتالوج وسلوكيات الزوار بكافة الصيغ العالمية بنقرة واحدة'
            : 'Export catalog, customer behavior, and sales metrics in Excel, CSV, JSON, PDF & Markdown'}
        </p>
      </div>

      {/* Multi-Format Export Station */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#3b82f6]" />
            <span>{isAr ? 'سحب وتصدير التحليلات وسجلات الزبائن (Multi-Format Downloads)' : 'Multi-Format Telemetry & Customer Exports'}</span>
          </h3>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
            {isAr ? 'جاهز للتنزيل الفوري' : 'Instant Generation'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {/* Excel */}
          <button
            type="button"
            onClick={() => downloadAnalyticsExcel(products)}
            className="flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] hover:bg-emerald-500/[0.12] p-4 text-start transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 font-mono">.XLS / EXCEL</span>
            </div>
            <span className="font-bold text-xs text-white block">{isAr ? 'جدول إكسل متكامل' : 'Excel Workbook'}</span>
            <span className="text-[10px] text-white/50 mt-1 block">{isAr ? 'أوراق عمل منسقة للـ KPIs والقطع والزبائن' : 'Multi-sheet workbook with styled KPIs'}</span>
          </button>

          {/* CSV */}
          <button
            type="button"
            onClick={() => downloadAnalyticsCSV(products)}
            className="flex flex-col justify-between rounded-2xl border border-blue-500/30 bg-blue-500/[0.05] hover:bg-blue-500/[0.12] p-4 text-start transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                <Download className="h-5 w-5" />
              </div>
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-300 font-mono">.CSV / UTF-8</span>
            </div>
            <span className="font-bold text-xs text-white block">{isAr ? 'ملف بيانات CSV' : 'CSV Dataset'}</span>
            <span className="text-[10px] text-white/50 mt-1 block">{isAr ? 'ترميز عربي متوافق 100% مع Excel' : 'UTF-8 with BOM encoding for Arabic'}</span>
          </button>

          {/* JSON */}
          <button
            type="button"
            onClick={() => downloadAnalyticsJSON(products)}
            className="flex flex-col justify-between rounded-2xl border border-purple-500/30 bg-purple-500/[0.05] hover:bg-purple-500/[0.12] p-4 text-start transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                <FileCode className="h-5 w-5" />
              </div>
              <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 font-mono">.JSON</span>
            </div>
            <span className="font-bold text-xs text-white block">{isAr ? 'ملف بيانات هيكلية JSON' : 'Structured JSON'}</span>
            <span className="text-[10px] text-white/50 mt-1 block">{isAr ? 'بيانات كاملة للربط البرمجي السحابي' : 'Complete dataset for APIs & database'}</span>
          </button>

          {/* HTML / PDF */}
          <button
            type="button"
            onClick={() => downloadAnalyticsHTMLReport(products)}
            className="flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-amber-500/[0.05] hover:bg-amber-500/[0.12] p-4 text-start transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                <Printer className="h-5 w-5" />
              </div>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 font-mono">.PDF / PRINT</span>
            </div>
            <span className="font-bold text-xs text-white block">{isAr ? 'تقرير تنفيذي PDF / طباعة' : 'Printable PDF Report'}</span>
            <span className="text-[10px] text-white/50 mt-1 block">{isAr ? 'مستند فاخر للطباعة المباشرة والأرشفة' : 'Executive report formatted for print/PDF'}</span>
          </button>

          {/* Markdown */}
          <button
            type="button"
            onClick={() => downloadAnalyticsMarkdown(products)}
            className="flex flex-col justify-between rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.05] hover:bg-cyan-500/[0.12] p-4 text-start transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 font-mono">.MD</span>
            </div>
            <span className="font-bold text-xs text-white block">{isAr ? 'ملخص ماركداون' : 'Markdown Report'}</span>
            <span className="text-[10px] text-white/50 mt-1 block">{isAr ? 'ملف نصي منسق للإرسال والمشاركة' : 'Text summary formatted for quick sharing'}</span>
          </button>
        </div>
      </div>

      {/* System Backup & JSON Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">
            {isAr ? 'تصدير نسخة احتياطية كاملة' : 'Export Full Backup'}
          </h3>
          <p className="text-xs text-white/60 leading-relaxed">
            {isAr
              ? 'يشمل كافة القطع والعروض والأسعار والصور والبنرات ونصوص الموقع في ملف واحد.'
              : 'Downloads all catalog pieces, custom offers, banners and site controls.'}
          </p>

          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const json = exportAllDataJSON();
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `vant_full_backup_${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#004ad7] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#004ad7]/90 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>{isAr ? 'تحميل JSON' : 'Download JSON'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(exportAllDataJSON());
                setCopiedJSON(true);
                setTimeout(() => setCopiedJSON(false), 2000);
              }}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              {copiedJSON ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copiedJSON ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ' : 'Copy')}</span>
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">
            {isAr ? 'استيراد واستعادة من ملف JSON' : 'Import & Restore from JSON'}
          </h3>
          <textarea
            rows={3}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{"controls": {...}, "products": [...]}'
            className="w-full rounded-2xl border border-white/15 bg-black/40 p-3 text-xs font-mono text-white outline-none focus:border-[#3b82f6]"
          />
          {importError && (
            <p className="text-xs text-red-400">{importError}</p>
          )}
          <button
            type="button"
            onClick={() => {
              const success = importAllDataJSON(importText);
              if (success) {
                alert(isAr ? 'تمت استعادة البيانات بنجاح!' : 'Restored successfully!');
                setImportText('');
                setImportError(null);
              } else {
                setImportError(isAr ? 'صيغة JSON غير صالحة' : 'Invalid JSON format');
              }
            }}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>{isAr ? 'استعادة وتطبيق الآن' : 'Import & Restore'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBackupTab;

import { parseCatalogBackup, PREVIOUS_CATALOG_BACKUP, type CatalogBackup } from '../lib/catalogBackup';
import React, { useState, useEffect, useRef } from 'react';
import { useAdminBridge } from './useAdminBridge';
import { useSiteControls } from '../context/SiteControlsContext';
import {
  downloadAnalyticsCSV,
  downloadAnalyticsExcel,
  downloadAnalyticsJSON,
  downloadAnalyticsHTMLReport,
  downloadAnalyticsMarkdown,
} from '../lib/analytics';
import {
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  FileCode,
  FileText,
  Printer,
  Upload,
  Layers,
  Database,
  RefreshCw,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const AdminBackupView: React.FC = () => {
  const { lang, products } = useAdminBridge();
  const { controls, exportAllDataJSON, importAllDataJSON, syncAllToSupabaseCloud } = useSiteControls();
  const isAr = lang === 'ar';

  const [copiedJSON, setCopiedJSON] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [preview, setPreview] = useState<CatalogBackup | null>(null);
  const previewRef = useRef<HTMLElement>(null);
  const reviewButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (preview) previewRef.current?.focus(); }, [preview]);
  const [previousBackup, setPreviousBackup] = useState(() => { try { return localStorage.getItem(PREVIOUS_CATALOG_BACKUP) || ''; } catch { return ''; } });
  const [feedback, setFeedback] = useState('');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  const handleCopyJSON = async () => {
    setFeedback('');
    try {
      await navigator.clipboard.writeText(exportAllDataJSON());
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2000);
    } catch { setFeedback(isAr ? 'تعذّر النسخ. حمّل ملف النسخة بدلاً من ذلك.' : 'Copy failed. Download the backup file instead.'); }
  };

  const handleDownloadFullJSON = () => {
    const json = exportAllDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vant_catalog_controls_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reviewImport = () => {
    setImportSuccess(false);
    try { setPreview(parseCatalogBackup(importText, controls)); setImportError(null); }
    catch { setPreview(null); setImportError(isAr ? 'الملف غير متوافق: راجع الإصدار وبنية المنتجات والأسعار والصور وعناصر التحكم. لم تتغير أي بيانات.' : 'Invalid backup: check version, products, prices, images and controls. No data changed.'); }
  };
  const handleImport = () => {
    if (!preview) return;
    const ok = importAllDataJSON(importText);
    if (ok) {
      setImportSuccess(true);
      setImportError(null);
      setPreview(null);
      setImportText('');
      setPreviousBackup(localStorage.getItem(PREVIOUS_CATALOG_BACKUP) || '');
    } else { setImportError(isAr ? 'تعذّرت الاستعادة أو حفظ نسخة الرجوع. لم تُطبّق التغييرات.' : 'Restore or recovery backup failed. Changes were not applied.'); }
  };

  const handleCloudSync = async () => {
    setIsCloudSyncing(true);
    setFeedback('');
    try {
      const ok = await syncAllToSupabaseCloud();
      setFeedback(ok ? (isAr ? 'تمت مزامنة إعدادات الواجهة. هذا لا يزامن الطلبات أو مخزون المنتجات.' : 'Display settings synced. Orders and product stock are not synced by this action.') : (isAr ? 'تعذّرت المزامنة. لم يتم تأكيد حفظ سحابي.' : 'Sync failed. Cloud saving was not confirmed.'));
    } catch { setFeedback(isAr ? 'تعذّرت المزامنة. حاول لاحقاً.' : 'Sync failed. Try again later.'); }
    finally { setIsCloudSyncing(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {isAr ? 'التقارير ونسخة الكتالوج وعناصر المتجر' : 'Reports & catalog/control backup'}
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  Excel • CSV • JSON • PDF • MD
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'تقارير التحليلات ونسخة JSON للمنتجات وعناصر التحكم والعملة فقط. الطلبات والمشتركون وروابط التواصل ودليل المقاسات وإعدادات النظام الأخرى غير مشمولة بالنسخة.'
                  : 'Analytics reports and a JSON backup of products, controls and currency only. Orders, subscribers, social links, sizing and other system settings are excluded.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCloudSync}
            disabled={isCloudSyncing}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-950 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'مزامنة السحابة الآن' : 'Sync Cloud Now'}</span>
          </button>
        </div>
      </div>

      {feedback && <p role="status" className="rounded-xl border border-slate-700 p-4 text-sm text-slate-200">{feedback}</p>}
      {/* Multi-Format Export Station */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'تنزيل التقارير والبيانات الفورية' : 'Instant Dataset Downloads'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? 'اختر الصيغة المناسبة لتصدير السجلات والكتالوج والتحليلات:' : 'Choose your desired export format:'}
            </p>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {isAr ? 'توليد فوري' : 'Live Generation'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
          {/* Excel */}
          <button
            type="button"
            onClick={() => downloadAnalyticsExcel(products as any)}
            className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-start transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">.XLS</span>
            </div>
            <div className="text-xs font-bold text-white">{isAr ? 'جدول إكسل' : 'Excel Sheet'}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'جداول مبيعات ومخزون' : 'Formatted spreadsheets'}</div>
          </button>

          {/* CSV */}
          <button
            type="button"
            onClick={() => downloadAnalyticsCSV(products as any)}
            className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-start transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">.CSV</span>
            </div>
            <div className="text-xs font-bold text-white">{isAr ? 'ملف CSV' : 'CSV Raw'}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'بيانات مفصولة بفواصل' : 'Comma-separated values'}</div>
          </button>

          {/* JSON */}
          <button
            type="button"
            onClick={() => downloadAnalyticsJSON(products as any)}
            className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-start transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCode className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">.JSON</span>
            </div>
            <div className="text-xs font-bold text-white">{isAr ? 'بيانات JSON' : 'JSON Object'}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'بيانات تقرير التحليلات' : 'Analytics report data'}</div>
          </button>

          {/* PDF / Print */}
          <button
            type="button"
            onClick={() => downloadAnalyticsHTMLReport(products as any)}
            className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-start transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">.PDF</span>
            </div>
            <div className="text-xs font-bold text-white">{isAr ? 'تقرير تنفيذي PDF' : 'PDF / Print'}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'مستند فاخر للطباعة' : 'Printable luxury report'}</div>
          </button>

          {/* Markdown */}
          <button
            type="button"
            onClick={() => downloadAnalyticsMarkdown(products as any)}
            className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-start transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded">.MD</span>
            </div>
            <div className="text-xs font-bold text-white">{isAr ? 'تقرير ماركداون' : 'Markdown'}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'نصي منسق للنشر' : 'Clean text report'}</div>
          </button>
        </div>
      </div>

      {/* Full Backup & JSON Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Full Store Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'نسخة الكتالوج وعناصر التحكم' : 'Catalog & controls backup'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isAr
              ? 'تشمل المنتجات والأسعار والعروض المرتبطة بالمنتج وعناصر التحكم والعملة. ليست نسخة كاملة لكل بيانات المتجر.'
              : 'Includes products, product prices/offers, controls and currency only. This is not a full-system backup.'}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleDownloadFullJSON}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-950 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تحميل ملف النسخة الاحتياطية' : 'Download Backup File'}</span>
            </button>

            <button
              onClick={handleCopyJSON}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              {copiedJSON ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedJSON ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy JSON')}</span>
            </button>
          </div>
        </div>

        {/* Import & Restore */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'استيراد واستعادة من ملف JSON' : 'Import & Restore from JSON'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isAr
              ? 'ألصق النسخة ثم راجع التغييرات. تُحفظ نسخة رجوع محلية قبل التطبيق؛ حمّل نسخة خارج المتصفح أيضاً. الاستعادة محلية لهذا المتصفح ولا تستورد المنتجات إلى قاعدة البيانات السحابية.'
              : 'Paste a backup and review changes. A local recovery copy is saved before applying; also download a copy outside the browser. Restore is local to this browser and does not import products into the cloud database.'}
          </p>

          <textarea
            dir="ltr" spellCheck={false}
            aria-label={isAr ? 'بيانات نسخة الكتالوج' : 'Catalog backup JSON'}
            rows={3}
            value={importText}
            onChange={(e) => { setImportText(e.target.value); setPreview(null); setImportSuccess(false); setImportError(null); }}
            placeholder='{"version":"2.0","currency":"IQD","controls":{...},"products":[...]}'
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono outline-none focus:border-indigo-500"
          />

          {importError && (
            <div role="alert" className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Check className="w-4 h-4 shrink-0" />
              <span>{isAr ? 'تمت استعادة محتويات النسخة. نسخة الرجوع متاحة أدناه.' : 'Backup contents restored. The recovery copy is available below.'}</span>
            </div>
          )}

          <button
            ref={reviewButtonRef}
            onClick={reviewImport}
            disabled={!importText.trim()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'فحص النسخة ومراجعتها' : 'Validate & review backup'}</span>
          </button>
          {preview && <section ref={previewRef} tabIndex={-1} aria-label={isAr ? 'مراجعة الاستعادة' : 'Restore review'} className="rounded-xl border border-amber-500/40 p-4 space-y-3">
            <h4 className="font-bold">{isAr ? 'راجع قبل استبدال البيانات' : 'Review before replacing data'}</h4>
            <p className="text-sm text-slate-300">{isAr ? `المنتجات: ${preview.products ? `${products.length} ← ${preview.products.length} (استبدال القائمة)` : 'بدون تغيير'} · عناصر التحكم: ${Object.keys(preview.controls || {}).length} · العملة: ${preview.currency || 'بدون تغيير'}` : `Products: ${preview.products ? `${products.length} → ${preview.products.length} (replace list)` : 'unchanged'} · Controls: ${Object.keys(preview.controls || {}).length} · Currency: ${preview.currency || 'unchanged'}`}</p>
            <div className="flex flex-wrap gap-3"><button type="button" onClick={handleImport} className="min-h-11 rounded-xl bg-indigo-600 px-4 text-sm font-bold">{isAr ? 'تطبيق الاستعادة وحفظ نسخة رجوع' : 'Apply restore & save recovery copy'}</button><button type="button" onClick={() => { setPreview(null); queueMicrotask(() => reviewButtonRef.current?.focus()); }} className="min-h-11 px-4">{isAr ? 'إلغاء' : 'Cancel'}</button></div>
          </section>}
          {previousBackup && <button type="button" className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm" onClick={() => { setImportText(previousBackup); setPreview(null); setImportSuccess(false); setImportError(null); }}>{isAr ? 'تحميل النسخة السابقة للمراجعة قبل استرجاعها' : 'Load previous copy for review before restoring'}</button>}

        </div>
      </div>
    </div>
  );
};

export default AdminBackupView;

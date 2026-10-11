import React from 'react';
import {
  Bug,
  AlertCircle,
  RotateCcw,
  CheckCircle,
  Search,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import type { SystemErrorLog } from '../../lib/analytics';

interface SystemErrorCardProps {
  err: SystemErrorLog;
  expandedErrorId: string | null;
  setExpandedErrorId: React.Dispatch<React.SetStateAction<string | null>>;
  handleStatusChange: (logId: string, newStatus: 'open' | 'investigating' | 'resolved') => Promise<void>;
  statusSavingMap: Record<string, boolean>;
  isAr?: boolean;
}

const SystemErrorCard: React.FC<SystemErrorCardProps> = ({
  err,
  expandedErrorId,
  setExpandedErrorId,
  handleStatusChange,
  statusSavingMap,
  isAr = true,
}) => {
  const isExpanded = expandedErrorId === err.id;
  const isSaving = statusSavingMap[err.id];

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden ${
        err.status === 'open'
          ? 'border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-[#12151f] to-black'
          : err.status === 'investigating'
          ? 'border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-[#12151f] to-black'
          : 'border-emerald-500/20 bg-black/40'
      }`}
    >
      <div
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors cursor-pointer"
        onClick={() => setExpandedErrorId(isExpanded ? null : err.id)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="shrink-0 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            SYSTEM_ERROR
          </span>
          <div className="space-y-1 flex-1 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-white leading-snug break-words">
              {err.errorMessage}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono flex-wrap">
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">
                ⏱️ {new Date(err.timestamp).toLocaleTimeString()}
              </span>
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 truncate max-w-[220px]">
                🌐 {err.url}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Dropdown & Status Controls */}
        <div className="flex items-center gap-2 shrink-0 ml-auto z-50" onClick={(e) => e.stopPropagation()}>
          {err.isRegression && (
            <span className="rounded-lg bg-rose-500/20 px-2 py-1 text-[10px] font-bold text-rose-400 border border-rose-500/40 animate-pulse">
              ⚠️ {isAr ? 'متكرر' : 'Regression'}
            </span>
          )}
          
          <select
            disabled={statusSavingMap[err.id]}
            value={err.status || 'open'}
            onChange={(e) => {
              e.stopPropagation();
              handleStatusChange(err.id, e.target.value as any);
            }}
            className="rounded-md border border-white/20 bg-[#12151f] px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-rose-500 cursor-pointer shadow-md"
          >
            <option value="open">🔴 {isAr ? 'غير محلول' : 'Open'}</option>
            <option value="investigating">🟡 {isAr ? 'قيد الفحص' : 'Investigating'}</option>
            <option value="resolved">🟢 {isAr ? 'تم الحل' : 'Resolved'}</option>
          </select>

          <button
            type="button"
            onClick={() => setExpandedErrorId(isExpanded ? null : err.id)}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 bg-black/80 border-t border-white/10 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Stack Trace
            </span>
            <div className="rounded-xl border border-white/10 bg-black p-4 font-mono text-[10px] text-rose-300/90 overflow-x-auto leading-relaxed max-h-[250px] scrollbar-thin">
              <pre className="whitespace-pre-wrap break-all">
                {err.errorStack || 'No stack trace available.'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export interface SystemHealthTabProps {
  processedSystemErrors: SystemErrorLog[];
  filteredSystemErrors: SystemErrorLog[];
  expandedErrorId: string | null;
  setExpandedErrorId: React.Dispatch<React.SetStateAction<string | null>>;
  handleStatusChange: (logId: string, newStatus: 'open' | 'investigating' | 'resolved') => Promise<void>;
  statusSavingMap: Record<string, boolean>;
  errorSearchQuery: string;
  setErrorSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  errorStatusFilter: 'all' | 'open' | 'investigating' | 'resolved' | 'regressions';
  setErrorStatusFilter: React.Dispatch<
    React.SetStateAction<'all' | 'open' | 'investigating' | 'resolved' | 'regressions'>
  >;
  isAr?: boolean;
}

export const SystemHealthTab: React.FC<SystemHealthTabProps> = ({
  processedSystemErrors,
  filteredSystemErrors,
  expandedErrorId,
  setExpandedErrorId,
  handleStatusChange,
  statusSavingMap,
  errorSearchQuery,
  setErrorSearchQuery,
  errorStatusFilter,
  setErrorStatusFilter,
  isAr = true,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-10">
      {/* Header Card */}
      <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-950/30 via-black/40 to-slate-900/40 p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Bug className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>
                  {isAr
                    ? 'رادار أخطاء النظام وتحليل الثبات (System Health & Issue Tracker)'
                    : 'System Health & Issue Tracker'}
                </span>
              </h3>
              <p className="text-xs text-white/50 mt-1">
                {isAr
                  ? 'رصد ذكي للأخطاء البرمجية، التجميع التلقائي للمشاكل المتشابهة، وتتبع تكرار الأخطاء المحلولة'
                  : 'Smart error fingerprinting, automated grouping, and regression detection for production stability'}
              </p>
            </div>
          </div>

          {/* Error Stats */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-mono font-bold text-white">
                {isAr ? 'مفتوح: ' : 'Open: '}
                <strong className="text-rose-400">
                  {processedSystemErrors.filter((e) => e.status === 'open').length}
                </strong>
              </span>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-white">
                {isAr ? 'قيد التحقيق: ' : 'Investigating: '}
                <strong className="text-amber-400">
                  {processedSystemErrors.filter((e) => e.status === 'investigating').length}
                </strong>
              </span>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-white">
                {isAr ? 'محلول: ' : 'Resolved: '}
                <strong className="text-emerald-400">
                  {processedSystemErrors.filter((e) => e.status === 'resolved').length}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tracker Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-white/10">
          {/* Search */}
          <div className="sm:col-span-7 relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={errorSearchQuery}
              onChange={(e) => setErrorSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث في رسائل الخطأ، الروابط، أو البصمة الإلكترونية...'
                  : 'Search error messages, URLs, or fingerprints...'
              }
              className="w-full rounded-xl border border-white/15 bg-black/50 py-2.5 pr-10 pl-4 text-xs text-white placeholder-white/40 focus:border-rose-500 focus:outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-5 flex items-center gap-2">
            <select
              value={errorStatusFilter}
              onChange={(e) => setErrorStatusFilter(e.target.value as any)}
              className="flex-1 rounded-xl border border-white/15 bg-black/50 py-2.5 px-3 text-xs text-white focus:border-rose-500 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#12151f] text-white">
                {isAr ? 'كافة الحالات (All Issues)' : 'All Issues'}
              </option>
              <option value="open" className="bg-[#12151f] text-rose-400">
                {isAr ? '🔴 أخطاء مفتوحة (Open)' : 'Open Issues'}
              </option>
              <option value="investigating" className="bg-[#12151f] text-amber-400">
                {isAr ? '🟡 قيد التحقيق (Investigating)' : 'Investigating'}
              </option>
              <option value="resolved" className="bg-[#12151f] text-emerald-400">
                {isAr ? '🟢 قضايا محلولة (Resolved)' : 'Resolved Issues'}
              </option>
              <option value="regressions" className="bg-[#12151f] text-rose-500 font-bold">
                {isAr ? '🚨 تكرار الأخطاء المحلولة (Regressions)' : 'Regressions'}
              </option>
            </select>

            <button
              type="button"
              onClick={() => {
                setErrorSearchQuery('');
                setErrorStatusFilter('all');
              }}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              title={isAr ? 'إعادة ضبط' : 'Reset'}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Issue List as Flexbox CARDS */}
      <div className="space-y-3">
        {filteredSystemErrors.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-16 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                {isAr ? 'النظام مستقر تماماً' : 'System is Healthy'}
              </h4>
              <p className="text-sm text-white/50 mt-1">
                {isAr
                  ? 'لا توجد أخطاء مسجلة تطابق معايير البحث الحالية.'
                  : 'No system errors found matching your filters.'}
              </p>
            </div>
          </div>
        ) : (
          filteredSystemErrors.map((err) => (
            <SystemErrorCard
              key={err.id}
              err={err}
              expandedErrorId={expandedErrorId}
              setExpandedErrorId={setExpandedErrorId}
              handleStatusChange={handleStatusChange}
              statusSavingMap={statusSavingMap}
              isAr={isAr}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SystemHealthTab;

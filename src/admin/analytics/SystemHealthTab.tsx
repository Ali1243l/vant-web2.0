import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Check, Search } from 'lucide-react';
import { Card, Button, Input } from '../ui';
import { filterErrorLogs } from './dashboardModel';

interface Props {
  systemErrorLogs: any[];
  searchFilter: string;
  setSearchFilter: (query: string) => void;
  isAr: boolean;
}

export const SystemHealthTab: React.FC<Props> = ({
  systemErrorLogs,
  searchFilter,
  setSearchFilter,
  isAr,
}) => {
  const filteredLogs = filterErrorLogs(systemErrorLogs, searchFilter);
  return (
    <motion.div
      key="system-health"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* System Health Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-rose-950/30 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl ${
              systemErrorLogs.length === 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  systemErrorLogs.length === 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {systemErrorLogs.length === 0
                  ? isAr
                    ? 'لا أخطاء مرصودة بالفترة'
                    : 'No recorded errors in this period'
                  : isAr
                  ? `تم رصد ${systemErrorLogs.length} أخطاء`
                  : `${systemErrorLogs.length} Errors Detected`}
              </span>
              <span className="text-xs text-slate-400">{isAr ? 'سجل أخطاء المتصفح' : 'Browser error log'}</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {isAr
                ? 'مركز تشخيص صحة النظام وسجلات الأخطاء'
                : 'System Health Diagnostic & Error Center'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'أخطاء المتصفح المرصودة فقط؛ فحص السيرفر يحتاج سجلات ومراقبة منفصلة.'
                : 'Recorded browser errors only; server diagnosis requires separate logs and monitoring.'}
            </p>
          </div>
        </div>

      </div>

      {/* Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800/80">
          <span className="text-xs font-medium text-slate-400 block mb-1">
            {isAr ? 'إجمالي الأخطاء المسجلة' : 'Total Recorded Errors'}
          </span>
          <span className="text-2xl font-bold font-mono text-white">
            {systemErrorLogs.length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {isAr ? 'خلال الفترة المختارة' : 'Within the selected period'}
          </span>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <span className="text-xs font-medium text-slate-400 block mb-1">
            {isAr ? 'أنواع الأخطاء الفريدة' : 'Unique Error Types'}
          </span>
          <span className="text-2xl font-bold font-mono text-indigo-400">
            {new Set(systemErrorLogs.map((e) => e.data?.errorMessage)).size}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {isAr ? 'رسائل أخطاء مختلفة' : 'Distinct error messages'}
          </span>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <span className="text-xs font-medium text-slate-400 block mb-1">
            {isAr ? 'توافر الخدمة' : 'Service availability'}
          </span>
          <span
            className={`text-2xl font-bold font-mono ${
              systemErrorLogs.length === 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            —
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {isAr ? 'يتطلب مراقبة توافر مستقلة؛ عدد الأخطاء لا يقيس التوافر.' : 'Requires an uptime monitor; error counts do not measure availability.'}
          </span>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <span className="text-xs font-medium text-slate-400 block mb-1">
            {isAr ? 'سجلات سحابية مرصودة' : 'Observed cloud records'}
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {systemErrorLogs.filter(event => event.isCloudLog).length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {isAr ? 'عدد السجلات ذات مصدر سحابي ضمن الفترة' : 'Records marked as cloud-sourced in this period'}
          </span>
        </Card>
      </div>

      {/* Error Telemetry Table */}
      <Card className="bg-slate-900/50 border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white">
              {isAr ? 'سجلات الأخطاء البرمجية بالتفصيل' : 'Detailed Error Telemetry Logs'}
            </h4>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'قائمة بالأخطاء المرصودة من متصفحات العملاء مع المسار ورسالة الخطأ'
                : 'Live error list captured from client browsers with stack traces and URLs'}
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2">
            <Input
              aria-label={isAr ? 'البحث في سجل الأخطاء' : 'Search error log'}
              placeholder={isAr ? 'بحث في الأخطاء...' : 'Search errors...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              icon={Search}
            />
            <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
              <span role="status">{filteredLogs.length} / {systemErrorLogs.length} {isAr ? 'نتيجة' : 'results'}</span>
              {searchFilter && <Button size="sm" variant="ghost" onClick={() => setSearchFilter('')}>{isAr ? 'مسح البحث' : 'Clear search'}</Button>}
            </div>
          </div>
        </div>

        {systemErrorLogs.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <Check className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-bold text-white">
              {isAr ? 'لا توجد أخطاء مسجلة بالنظام' : 'No System Errors Recorded'}
            </h5>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isAr
                ? 'لم تصل أخطاء متصفح خلال الفترة المختارة. هذا لا يؤكد سلامة السيرفر أو جميع رحلات الاستخدام.'
                : 'No browser errors were recorded in this period. This does not certify server availability or every user journey.'}
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <p role="status" className="py-10 text-center text-sm text-slate-400">{isAr ? 'ماكو أخطاء تطابق البحث. جرّب كلمة ثانية أو امسح البحث.' : 'No errors match this search. Try another term or clear the search.'}</p>
        ) : (
          <div className="space-y-3">
            {filteredLogs
              .map((err) => (
                <div
                  key={err.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        SYSTEM_ERROR
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(err.timestamp).toLocaleString(isAr ? 'ar-IQ' : 'en-US')}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex flex-wrap items-center gap-3 break-all">
                      <span>ID: {err.data?.visitorId || 'pvid_anon'}</span>
                      <span>Visit #{err.data?.visitCount || 1}</span>
                      <span>{err.device}</span>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-rose-400 font-mono break-all">
                    {err.data?.errorMessage || 'Unknown Error Message'}
                  </div>

                  {err.data?.url && (
                    <div className="text-[11px] text-slate-400 font-mono break-all">
                      <span className="text-slate-500">{isAr ? 'المسار: ' : 'URL: '}</span>
                      {err.data.url}
                    </div>
                  )}

                  {err.data?.errorStack && (
                    <div className="mt-2 p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-36">
                      {err.data.errorStack}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

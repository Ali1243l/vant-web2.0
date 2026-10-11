import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Sparkles, Check, Search } from 'lucide-react';
import { Card, Button, Input } from '../ui';
import { trackSystemError } from '../lib/analytics';

interface Props {
  systemErrorLogs: any[];
  searchFilter: string;
  setSearchFilter: (query: string) => void;
  handleRefresh: () => void;
  isAr: boolean;
}

export const SystemHealthTab: React.FC<Props> = ({
  systemErrorLogs,
  searchFilter,
  setSearchFilter,
  handleRefresh,
  isAr,
}) => {
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
                    ? 'النظام عملي 100%'
                    : '100% Operational'
                  : isAr
                  ? `تم رصد ${systemErrorLogs.length} أخطاء`
                  : `${systemErrorLogs.length} Errors Detected`}
              </span>
              <span className="text-xs text-slate-400">| Sentry-Grade Telemetry</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {isAr
                ? 'مركز تشخيص صحة النظام وسجلات الأخطاء'
                : 'System Health Diagnostic & Error Center'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'رصد تلقائي لأخطاء المتجر والاستجابات بدون الحاجة لفحص سجلات Vercel.'
                : 'Automatic telemetry tracking of client errors & unhandled rejections without checking server logs.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              trackSystemError(
                'Manual Diagnostic Test Error: Testing Telemetry System',
                'Error: Diagnostic stack trace generated at ' +
                  new Date().toISOString() +
                  '\n    at TestButton.onClick (AdminAnalyticsDashboard.tsx)'
              );
              handleRefresh();
            }}
            className="bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-300 border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 ml-1 text-amber-400" />
            {isAr ? 'إرسال خطأ تشخيصي تجريبي' : 'Trigger Diagnostic Test Error'}
          </Button>
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
            {isAr ? 'منذ بدء التشغيل' : 'Since session start'}
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
            {isAr ? 'مؤشر سلامة النظام' : 'System Health Score'}
          </span>
          <span
            className={`text-2xl font-bold font-mono ${
              systemErrorLogs.length === 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {systemErrorLogs.length === 0
              ? '100%'
              : `${Math.max(60, 100 - systemErrorLogs.length * 5)}%`}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {systemErrorLogs.length === 0
              ? isAr
                ? 'ممتاز، لا توجد أخطاء'
                : 'Excellent, no errors'
              : isAr
              ? 'يتطلب المعاينة'
              : 'Needs inspection'}
          </span>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <span className="text-xs font-medium text-slate-400 block mb-1">
            {isAr ? 'تزامن قاعدة البيانات' : 'Supabase Telemetry Sync'}
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {isAr ? 'نشط' : 'Active'}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            {isAr ? 'جدول logs متصل 100%' : 'Table logs synced'}
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

          <div className="w-full sm:w-64">
            <Input
              placeholder={isAr ? 'بحث في الأخطاء...' : 'Search errors...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              icon={Search}
            />
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
                ? 'جميع الخدمات والواجهات البرمجية تعمل بكفاءة عالية واستقرار 100%. سيتم تسجيل أي خطأ يظهر للعملاء تلقائياً هنا.'
                : 'All app features and user journeys are operating cleanly at 100% stability. Any client-side runtime errors will automatically log here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {systemErrorLogs
              .filter((e) => {
                if (!searchFilter.trim()) return true;
                const q = searchFilter.toLowerCase();
                const msg = (e.data?.errorMessage || '').toLowerCase();
                const url = (e.data?.url || '').toLowerCase();
                const pid = (e.data?.visitorId || '').toLowerCase();
                return msg.includes(q) || url.includes(q) || pid.includes(q);
              })
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
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
                      <span>ID: {err.data?.visitorId || 'pvid_anon'}</span>
                      <span>Visit #{err.data?.visitCount || 1}</span>
                      <span>{err.device}</span>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-rose-400 font-mono break-all">
                    {err.data?.errorMessage || 'Unknown Error Message'}
                  </div>

                  {err.data?.url && (
                    <div className="text-[11px] text-slate-400 font-mono">
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

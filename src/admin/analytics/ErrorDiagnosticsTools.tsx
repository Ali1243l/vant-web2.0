import { useEffect, useState } from 'react';
import { errorDeliveryStatus, flushDiagnosticQueue } from '../../lib/errorDelivery';
import { trackSystemError } from '../../lib/analytics/tracker';
import { supabase } from '../../lib/supabase';
import { requireCloudAdmin } from '../../lib/cloudAdminAccess';
import { Button } from '../ui';

const legacyFiles = ['telemetry/events_stream.json', 'config/newsletter_subscribers.json'];
export default function ErrorDiagnosticsTools({ isAr }: { isAr: boolean }) {
  const [delivery, setDelivery] = useState(errorDeliveryStatus);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const t = (ar: string, en: string) => isAr ? ar : en;
  useEffect(() => { const update = () => setDelivery(errorDeliveryStatus()); window.addEventListener('vant_error_delivery', update); return () => window.removeEventListener('vant_error_delivery', update); }, []);
  return <section aria-label={t('سلامة تسجيل الأخطاء', 'Error recording health')} className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-4">
    <h4 className="font-bold">{t('وصول سجل الأخطاء', 'Error log delivery')}</h4>
    <p className="text-xs leading-6 text-slate-300">{t('المعلّق على هذا الجهاز', 'Pending on this device')}: {delivery.pending} · {t('آخر تسليم سحابي بهذه الجلسة', 'Last cloud delivery in this session')}: {delivery.lastSuccess ? new Date(delivery.lastSuccess).toLocaleString(isAr ? 'ar-IQ' : 'en-US', { timeZone: 'Asia/Baghdad' }) : '—'}</p>
    {delivery.lastFailure && <p role="status" className="text-xs text-amber-300">{t('آخر محاولة لم تصل؛ السجل يبقى محلياً ويعاد إرساله عند رجوع الاتصال.', 'The last attempt failed; records stay locally and retry when connectivity returns.')}</p>}
    {!!delivery.dropped && <p role="alert" className="text-xs text-amber-300">{t('امتلأت قائمة الانتظار؛ عدد السجلات الأقدم المستبعدة', 'Queue full; older records dropped')}: {delivery.dropped}</p>}
    <div className="flex flex-wrap gap-2"><Button type="button" disabled={busy} className="min-h-11" onClick={async () => {
      setBusy(true); setNotice('');
      try { if (supabase) await requireCloudAdmin(supabase); trackSystemError('VANT diagnostic check — no customer action failed', '', { kind: 'diagnostic', operation: 'admin-log-check' }); const ok = await flushDiagnosticQueue(); setNotice(ok ? t('تم تسليم سجل الفحص. حدّث الأحداث لرؤيته في القائمة.', 'Check record delivered. Refresh events to view it.') : t('لم يتأكد التسليم؛ راجع الاتصال وتسجيل حساب الإدارة. سجل الفحص محلي.', 'Delivery is unconfirmed. Check connectivity/admin sign-in; the check is local.')); }
      catch { setNotice(t('سجّل دخول حساب إدارة المتجر أولاً؛ رمز القفل وحده لا يكفي.', 'Sign in with the store admin account first; the local lock code is not enough.')); }
      finally { setBusy(false); }
    }}>{t('تجربة تسجيل آمنة', 'Run safe recording check')}</Button><Button type="button" variant="secondary" disabled={busy || !delivery.pending} className="min-h-11" onClick={async () => { setBusy(true); try { await flushDiagnosticQueue(); } finally { setBusy(false); } }}>{t('إعادة إرسال المعلّق', 'Retry pending')}</Button></div>
    <details className="border-t border-slate-700 pt-3 text-xs"><summary className="min-h-11 cursor-pointer font-semibold">{t('إزالة ملفات عامة قديمة', 'Remove legacy public files')}</summary><p className="my-3 leading-6 text-slate-400">{t('النسخ القديمة قد تحتوي بيانات خاصة. الكود الجديد لا ينشئها. هذا الإجراء يحذف الملفين المحددين فقط نهائياً؛ جداول المشتركين والأخطاء والصور والكتالوج تبقى.', 'Old snapshots may contain private data. New code no longer creates them. This permanently removes only these two files; database records and catalog images remain.')}</p><ul dir="ltr" className="break-all text-slate-300">{legacyFiles.map(path => <li key={path}>{path}</li>)}</ul><Button type="button" variant="secondary" disabled={busy} className="mt-3 min-h-11" onClick={async () => {
      if (!window.confirm(t('حذف نهائي لهذين الملفين العامين فقط؟\n', 'Permanently delete only these public snapshots?\n') + legacyFiles.join('\n'))) return;
      setBusy(true); setNotice('');
      try { await requireCloudAdmin(supabase); const result = await supabase!.storage.from('product-images').remove(legacyFiles); if (result.error) throw result.error; setNotice(t('تمت إزالة النسخ العامة القديمة. النسخ المخبأة لدى وسيط خارجي قد تبقى حتى انتهاء الكاش.', 'Legacy public snapshots removed. Third-party caches may persist until expiry.')); }
      catch { setNotice(t('لم يتأكد حذف الملفات. راجع حساب الإدارة وصلاحيات التخزين.', 'File removal was not confirmed. Check admin sign-in and storage permissions.')); }
      finally { setBusy(false); }
    }}>{t('حذف النسخ العامة القديمة', 'Delete legacy public snapshots')}</Button></details>
    {notice && <p role="status" className="text-xs leading-6 text-blue-300">{notice}</p>}
  </section>;
}

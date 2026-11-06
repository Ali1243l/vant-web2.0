import { useCallback, useEffect, useRef, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { useAdminBridge } from './useAdminBridge';
import { supabase } from '../lib/supabase';
import { requireCloudAdmin } from '../lib/cloudAdminAccess';
import { ACTIVITY_TABLES, activityChanges, activityDateBoundary, type ActivityEntry } from '../lib/adminActivity';
import { Button, Card } from './ui';
import { Sheet } from './Sheet';

const PAGE_SIZE = 25;
const initialFilters = { table: '', action: '', from: '', to: '' };
export function AdminActivityView() {
  const { lang } = useAdminBridge();
  const isAr = lang === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<ActivityEntry[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<ActivityEntry | null>(null);
  const [detailsBusy, setDetailsBusy] = useState(false);
  const request = useRef(0);
  const detailRequest = useRef(0);
  const load = useCallback(async () => {
    const current = ++request.current;
    setBusy(true); setError(''); setRows([]);
    try {
      const client = supabase;
      await requireCloudAdmin(client);
      if (!client) return;
      if (filters.from && filters.to && filters.from > filters.to) throw new Error('date');
      let query = client.from('admin_activity').select('id,occurred_at,transaction_id,actor_id,actor_kind,table_name,record_id,action,changed_fields,file_before:before_data->>name,file_after:after_data->>name').order('occurred_at', { ascending: false }).order('id', { ascending: false });
      if (filters.table) query = query.eq('table_name', filters.table);
      if (filters.action) query = query.eq('action', filters.action);
      const from = activityDateBoundary(filters.from, false), to = activityDateBoundary(filters.to, true);
      if (from) query = query.gte('occurred_at', from);
      if (to) query = query.lt('occurred_at', to);
      const { data, error } = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
      if (error) throw error;
      if (current !== request.current) return;
      setRows((data || []).slice(0, PAGE_SIZE) as ActivityEntry[]); setHasMore((data || []).length > PAGE_SIZE);
    } catch {
      if (current === request.current) setError(lang === 'ar' ? 'تعذّر تحميل السجل. تحقق من جلسة أدمن المتجر ونطاق التاريخ ثم أعد المحاولة.' : 'Could not load activity. Check your cloud admin session and date range, then retry.');
    } finally { if (current === request.current) setBusy(false); }
  }, [filters, page, lang]);
  useEffect(() => { void load(); return () => { request.current++; detailRequest.current++; }; }, [load]);
  const inspect = async (entry: ActivityEntry) => {
    const current = ++detailRequest.current;
    setSelected(entry); setDetailsBusy(true); setError('');
    try {
      await requireCloudAdmin(supabase);
      const { data, error } = await supabase!.from('admin_activity').select('*').eq('id', entry.id).single();
      if (error) throw error;
      if (current === detailRequest.current) setSelected(data as ActivityEntry);
    } catch { if (current === detailRequest.current) { setError(t('تعذّر تحميل التفاصيل.', 'Could not load details.')); setSelected(null); } }
    finally { if (current === detailRequest.current) setDetailsBusy(false); }
  };
  const label = (entry: ActivityEntry) => t(ACTIVITY_TABLES[entry.table_name]?.ar || entry.table_name, ACTIVITY_TABLES[entry.table_name]?.en || entry.table_name);
  const action = (value: string) => value === 'INSERT' ? t('إضافة', 'Created') : value === 'DELETE' ? t('حذف', 'Deleted') : t('تعديل', 'Updated');
  const timestamp = (value: string) => new Intl.DateTimeFormat(isAr ? 'ar-IQ' : 'en-GB', { timeZone: 'Asia/Baghdad', dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value));
  return <div className="min-w-0 space-y-5">
    <Card className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-3 text-2xl font-bold"><History size={24}/>{t('سجل النشاط', 'Activity log')}</h2><Button type="button" variant="outline" disabled={busy} onClick={() => void load()} leftIcon={<RefreshCw size={16}/>}>{t('تحديث', 'Refresh')}</Button></div><p className="text-sm leading-7 text-slate-400">{t('تغييرات ناجحة مسجّلة من قاعدة البيانات · التوقيت: بغداد. يبدأ التسجيل من تفعيل السجل ولا يعيد بناء الماضي.', 'Successful database changes · Baghdad time. Recording starts when auditing is enabled; past history is unavailable.')}</p><p className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-xs leading-6 text-amber-200">{t('يشمل الجداول ورفع وتعديل وحذف ملفات المتجر. للملفات يظهر الاسم وبيانات الملف قبل وبعد، وليس محتوى إعدادات الثيم أو الأزرار داخل الملف. المسودات ومحاولات الدخول والعمليات الفاشلة خارج هذا السجل. الحقول السرية محجوبة.', 'Covers database tables and store file uploads, updates and deletions. File entries show names and metadata, not theme or control values inside the file. Drafts, sign-in attempts and failed writes are excluded. Secret fields are redacted.')}</p></Card>
    <Card><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      <label key="table" className="text-sm">{t('القسم', 'Section')}<select value={filters.table} onChange={e => { setFilters(f => ({ ...f, table: e.target.value })); setPage(0); }} className="mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3"><option value="">{t('كل الأقسام', 'All sections')}</option>{Object.entries(ACTIVITY_TABLES).map(([key, value]) => <option key={key} value={key}>{isAr ? value.ar : value.en}</option>)}</select></label>,
      <label key="action" className="text-sm">{t('العملية', 'Action')}<select value={filters.action} onChange={e => { setFilters(f => ({ ...f, action: e.target.value })); setPage(0); }} className="mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3"><option value="">{t('كل العمليات', 'All actions')}</option>{['INSERT', 'UPDATE', 'DELETE'].map(value => <option key={value} value={value}>{action(value)}</option>)}</select></label>,
      ...(['from', 'to'] as const).map(key => <label key={key} className="text-sm">{key === 'from' ? t('من تاريخ', 'From date') : t('إلى تاريخ', 'To date')}<input type="date" value={filters[key]} onChange={e => { setFilters(f => ({ ...f, [key]: e.target.value })); setPage(0); }} className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-3"/></label>),
    ]}</div></Card>
    {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
    <div aria-busy={busy} className="space-y-3">{busy ? <Card><p role="status">{t('جارِ تحميل السجل…', 'Loading activity…')}</p></Card> : rows.length ? rows.map(entry => <Card key={entry.id}><div className="flex min-w-0 flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1 space-y-2"><p className="font-semibold">{action(entry.action)} · {label(entry)}</p><p className="break-all text-xs text-slate-400" dir="ltr">#{entry.id} · {entry.file_after || entry.file_before || entry.record_id}</p><p className="text-sm text-slate-300">{timestamp(entry.occurred_at)}</p><p className="break-all text-xs text-slate-400">{entry.actor_kind === 'admin' ? t('أدمن', 'Admin') : entry.actor_kind === 'user' ? t('مستخدم', 'User') : t('قاعدة البيانات / خدمة', 'Database / service')} · {entry.actor_id || '—'}</p><p className="text-xs text-slate-400">{t('الحقول المتغيرة', 'Changed fields')}: {entry.changed_fields.join('، ')}</p></div><Button type="button" variant="outline" onClick={() => void inspect(entry)}>{t('قبل وبعد', 'Before & after')}</Button></div></Card>) : !error && <Card><p className="text-sm leading-7 text-slate-400">{t('لا توجد تغييرات مطابقة. تظهر العمليات الناجحة الجديدة تلقائياً في قاعدة السجل؛ اضغط تحديث لجلبها.', 'No matching changes. New successful writes are recorded in the database; refresh to load them.')}</p></Card>}</div>
    <div className="flex flex-wrap items-center justify-between gap-3"><Button type="button" variant="outline" disabled={busy || page === 0} onClick={() => setPage(p => p - 1)}>{t('السابق', 'Previous')}</Button><span className="text-sm text-slate-400">{t('صفحة', 'Page')} {page + 1}</span><Button type="button" variant="outline" disabled={busy || !hasMore || !!error} onClick={() => setPage(p => p + 1)}>{t('التالي', 'Next')}</Button></div>
    <Sheet isOpen={!!selected} onClose={() => { detailRequest.current++; setSelected(null); setDetailsBusy(false); }} title={t('تفاصيل التغيير', 'Change details')} description={selected ? `${label(selected)} · ${timestamp(selected.occurred_at)}` : ''} widthClass="max-w-4xl">
      {detailsBusy ? <p role="status">{t('جارِ تحميل التفاصيل…', 'Loading details…')}</p> : selected && <div className="space-y-5 select-text"><p className="break-all text-xs text-slate-400">{t('المعاملة', 'Transaction')}: {selected.transaction_id} · {selected.record_id}</p>{activityChanges(selected).map(change => <section key={change.field} className="space-y-3"><h3 className="break-all font-semibold text-indigo-300">{change.field}</h3><div className="grid gap-3 md:grid-cols-2">{(['before', 'after'] as const).map(side => <div key={side} className="min-w-0 rounded-xl border border-slate-700 bg-slate-950 p-3"><h4 className="mb-3 text-sm text-slate-400">{side === 'before' ? t('قبل', 'Before') : t('بعد', 'After')}</h4><pre dir="auto" className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-6">{change[side]}</pre></div>)}</div></section>)}</div>}
    </Sheet>
  </div>;
}

import React, { useEffect, useState } from 'react';
import { Plus, Search, Copy, Pencil, Trash2 } from 'lucide-react';
import { useAdminBridge, type Offer } from './useAdminBridge';
import { Button, Input } from './ui';
import { Sheet } from './Sheet';
import { formatCurrency } from './format';
import { offerBoundary, offerDay, offerState, parseOfferNumber, quoteOffer, validateOffer, type OfferState } from './offers/offerModel';

export const AdminOffersManager: React.FC = () => {
  const { offers, addOffer, updateOffer, deleteOffer, lang, isOfferModalOpen, setIsOfferModalOpen } = useAdminBridge();
  const isAr = lang === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;
  const money = (value: number) => formatCurrency(value, 'IQD', isAr ? 'ar' : 'en');
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState<Offer | null>(null);
  const [removing, setRemoving] = useState<Offer | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [minimum, setMinimum] = useState('');
  const [maximum, setMaximum] = useState('');
  const [start, setStart] = useState(offerDay());
  const [end, setEnd] = useState(offerDay(Date.now() + 30 * 86400000));
  const [enabled, setEnabled] = useState(true);
  const [sample, setSample] = useState('');
  useEffect(() => { setError(''); }, [title, titleEn, code, type, value, minimum, maximum, start, end, enabled]);
  const labels: Record<OfferState, string> = {
    active: t('ضمن الصلاحية', 'Within validity'), scheduled: t('مجدول', 'Scheduled'), paused: t('موقوف', 'Paused'), expired: t('منتهي', 'Expired'), exhausted: t('مستنفد', 'Limit reached'), invalid: t('يحتاج تصحيحاً', 'Needs correction'),
  };
  const message = (issue: string) => ({
    title: t('اكتب عنوان الحملة.', 'Enter a campaign title.'), code: t('الكود: 3–40 حرفاً إنجليزياً أو رقماً مع - أو _ فقط.', 'Code: 3–40 English letters/digits, - or _.'),
    duplicate: t('هذا الكود موجود مسبقاً.', 'This code already exists.'), amount: t('النسبة أكبر من صفر وأقل من 100؛ المبلغ الثابت عدد صحيح موجب بالدينار.', 'Percentage must be above zero and below 100; fixed IQD must be a positive integer.'),
    minimum: t('الحد الأدنى مبلغ صحيح غير سالب.', 'Minimum spend must be a nonnegative integer.'), limit: t('حد الاستخدام عدد صحيح موجب ولا يقل عن الاستخدام المسجّل.', 'Usage limit must be a positive integer, no lower than recorded usage.'),
    dates: t('راجع التاريخين: تاريخ البداية لا يتجاوز نهاية الصلاحية.', 'Check dates: start must not be after expiry.'), status: t('حالة العرض غير صالحة.', 'Invalid campaign status.'),
    busy: t('انتظر اكتمال العملية الحالية.', 'Wait for the current operation.'), save: t('تعذر الحفظ السحابي. بقيت البيانات كما هي؛ حاول مرة ثانية.', 'Cloud save failed. Data remains unchanged; try again.'),
  }[issue] || t('تعذر إكمال العملية. راجع الاتصال وحاول ثانية.', 'Could not complete the operation. Check connectivity and try again.'));
  const fill = (offer?: Offer) => {
    setTitle(offer?.title || ''); setTitleEn(offer?.titleEn || ''); setCode(offer?.code || ''); setType(offer?.discountType === 'fixed' ? 'fixed' : 'percentage');
    setValue(offer ? String(offer.discountValue) : ''); setMinimum(offer?.minSpend === undefined ? '' : String(offer.minSpend)); setMaximum(offer?.maxUses === undefined ? '' : String(offer.maxUses));
    setStart(offer && Number.isFinite(offerBoundary(offer.startDate)) ? offerDay(offerBoundary(offer.startDate)) : offerDay());
    setEnd(offer && Number.isFinite(offerBoundary(offer.endDate, true)) ? offerDay(offerBoundary(offer.endDate, true)) : offerDay(Date.now() + 30 * 86400000));
    setEnabled(!offer || !['paused', 'expired'].includes(offer.status)); setSample(''); setError('');
  };
  useEffect(() => { if (isOfferModalOpen && !editing) fill(); }, [isOfferModalOpen]);
  const close = () => { if (!busy) { setIsOfferModalOpen(false); setEditing(null); setError(''); } };
  const proposal: Offer = {
    id: editing?.id || '', title: title.trim(), titleEn: titleEn.trim() || title.trim(), code: code.trim().toUpperCase(), discountType: type, discountValue: parseOfferNumber(value),
    minSpend: minimum.trim() ? parseOfferNumber(minimum) : undefined, maxUses: maximum.trim() ? parseOfferNumber(maximum) : undefined,
    status: enabled ? 'active' : 'paused', usedCount: editing?.usedCount || 0, startDate: start, endDate: end,
  };
  const issue = validateOffer(proposal, offers) || (proposal.maxUses !== undefined && proposal.maxUses < proposal.usedCount ? 'limit' : null);
  const preview = !issue ? quoteOffer(proposal, parseOfferNumber(sample), now) : null;
  const save = async () => {
    if (busy) return;
    if (issue) { setError(message(issue)); return; }
    setBusy(true); setError('');
    try {
      const destination = editing ? await updateOffer(editing.id, proposal) : await addOffer(proposal);
      setNotice(destination === 'cloud' ? t('تم حفظ سجل الحملة سحابياً. لم تتغير أسعار المنتجات أو السلة.', 'Campaign record saved to cloud. Product and cart prices were not changed.') : t('تم الحفظ محلياً فقط؛ الاتصال السحابي غير مهيّأ.', 'Saved locally only; cloud connection is not configured.'));
      setIsOfferModalOpen(false); setEditing(null);
    } catch (err) { setError(message(err instanceof Error ? err.message : 'save')); }
    finally { setBusy(false); }
  };
  const toggle = async (offer: Offer) => {
    if (busy) return;
    setBusy(true); setNotice('');
    try { const destination = await updateOffer(offer.id, { status: ['paused', 'expired'].includes(offer.status) ? 'active' : 'paused' }); setNotice(destination === 'cloud' ? t('تم حفظ حالة الحملة سحابياً. أسعار المنتجات المطبّقة سابقاً لا تتغير تلقائياً.', 'Campaign state saved to cloud. Previously applied product prices do not change automatically.') : t('تم تغيير الحالة محلياً فقط.', 'State changed locally only.')); }
    catch (err) { setNotice(message(err instanceof Error ? err.message : 'save')); }
    finally { setBusy(false); }
  };
  const filtered = offers.filter(offer => (filter === 'all' || offerState(offer, now) === filter) && [offer.title, offer.titleEn, offer.code].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
  const counts = { active: offers.filter(o => offerState(o, now) === 'active').length, scheduled: offers.filter(o => offerState(o, now) === 'scheduled').length };
  return <div className="offers-manager min-w-0 space-y-5 pb-8">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-white">{t('الحملات وأكواد الخصم', 'Campaigns & discount codes')}</h2><p className="mt-2 text-sm text-slate-400">{t('إدارة الصلاحية والشروط، مع معاينة حساب الخصم قبل الحفظ.', 'Manage validity and conditions, and preview discounts before saving.')}</p></div><Button className="min-h-11" disabled={busy} leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); fill(); setIsOfferModalOpen(true); }}>{t('إنشاء حملة', 'Create campaign')}</Button></div>
    <p className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm leading-6 text-slate-300">{t('هذه سجلات حملات. أكواد الخصم وحدود الاستخدام غير مرتبطة بتحصيل الطلبات حالياً، ولا تضيف خصماً في السلة. تطبيق حملة على سعر منتج إجراء منفصل من الكتالوج، ولا ينتهي تلقائياً بانتهاء الحملة.', 'These are campaign records. Coupon codes and usage limits are not connected to order redemption and do not discount the cart. Applying a campaign to product prices is a separate catalog action; those prices do not expire automatically.')}</p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[[t('كل الحملات', 'All campaigns'), offers.length], [labels.active, counts.active], [labels.scheduled, counts.scheduled], [t('الاستخدام المسجّل', 'Recorded uses'), offers.reduce((sum, o) => sum + (Number.isSafeInteger(o.usedCount) && o.usedCount > 0 ? o.usedCount : 0), 0)]].map(([label, count]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-xl font-bold text-white">{count}</p></div>)}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Input label={t('بحث بالعنوان أو الكود', 'Search title or code')} icon={Search} value={search} onChange={e => setSearch(e.target.value)} className="min-h-11" /><label className="text-xs text-slate-300">{t('حالة الحملة', 'Campaign state')}<select aria-label={t('حالة الحملة', 'Campaign state')} value={filter} onChange={e => setFilter(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white"><option value="all">{t('جميع الحالات', 'All states')}</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
    {notice && <p role="status" className="rounded-xl border border-slate-700 p-3 text-sm text-slate-200">{notice}</p>}
    <p role="status" className="text-xs text-slate-400">{t(`${filtered.length} من ${offers.length} حملة · الصلاحية بتوقيت بغداد`, `${filtered.length} of ${offers.length} campaigns · Baghdad time`)}</p>
    {!filtered.length && <div className="rounded-2xl border border-dashed border-slate-700 py-12 px-4 text-center"><h3 className="font-bold text-white">{t(offers.length ? 'لا توجد نتائج مطابقة' : 'لا توجد حملات محفوظة', offers.length ? 'No matching campaigns' : 'No saved campaigns')}</h3><p className="mt-2 text-sm text-slate-400">{t('أنشئ حملة أو غيّر البحث والحالة للعثور عليها.', 'Create a campaign or adjust search and state.')}</p>{(search || filter !== 'all') && <Button variant="secondary" className="mt-4 min-h-11" onClick={() => { setSearch(''); setFilter('all'); }}>{t('مسح الفلاتر', 'Clear filters')}</Button>}</div>}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{filtered.map(offer => { const state = offerState(offer, now); return <article key={offer.id} className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="min-w-0 flex-1 font-bold text-white break-words">{isAr ? offer.title : offer.titleEn || offer.title}</h3><span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-indigo-200">{labels[state]}</span></div>
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-3"><code dir="ltr" className="min-w-0 flex-1 break-all font-bold text-white">{offer.code}</code><Button variant="secondary" disabled={busy} className="min-h-11" aria-label={t(`نسخ ${offer.code}`, `Copy ${offer.code}`)} onClick={async () => { try { await navigator.clipboard.writeText(offer.code); setNotice(t('تم نسخ الكود.', 'Code copied.')); } catch { setNotice(t('تعذر النسخ. يمكنك تحديد الكود ونسخه يدوياً.', 'Copy failed. Select and copy the code manually.')); } }}><Copy className="h-4 w-4" /></Button></div>
      <p className="text-xl font-bold text-indigo-300"><bdi dir="ltr">{Number.isFinite(offer.discountValue) ? offer.discountType === 'percentage' ? `${offer.discountValue}%` : money(offer.discountValue) : '—'}</bdi></p>
      <dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">{t('البداية', 'Starts')}</dt><dd className="break-all text-slate-200"><bdi>{offer.startDate}</bdi></dd></div><div><dt className="text-slate-500">{t('النهاية', 'Ends')}</dt><dd className="break-all text-slate-200"><bdi>{offer.endDate}</bdi></dd></div><div><dt className="text-slate-500">{t('أدنى شراء', 'Minimum spend')}</dt><dd className="break-all text-slate-200"><bdi>{offer.minSpend === undefined ? '—' : money(offer.minSpend)}</bdi></dd></div><div><dt className="text-slate-500">{t('الاستخدام المسجّل / الحد', 'Recorded uses / limit')}</dt><dd dir="ltr" className="text-slate-200">{offer.usedCount} / {offer.maxUses ?? '∞'}</dd></div></dl>
      <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-3"><Button variant="secondary" className="min-h-11" disabled={busy} leftIcon={<Pencil className="h-4 w-4" />} aria-label={t(`تعديل ${offer.code}`, `Edit ${offer.code}`)} onClick={() => { setEditing(offer); fill(offer); setIsOfferModalOpen(true); }}>{t('تعديل', 'Edit')}</Button><Button variant="secondary" className="min-h-11" disabled={busy || ['expired', 'exhausted', 'invalid'].includes(state)} onClick={() => toggle(offer)}>{t(state === 'paused' ? 'استئناف' : 'إيقاف', state === 'paused' ? 'Resume' : 'Pause')}</Button><Button variant="secondary" className="min-h-11 text-rose-300" disabled={busy} aria-label={t(`حذف ${offer.code}`, `Delete ${offer.code}`)} onClick={() => { setError(''); setRemoving(offer); }}><Trash2 className="h-4 w-4" /></Button></div>
    </article>; })}</div>
    <Sheet isOpen={isOfferModalOpen} onClose={close} title={t(editing ? 'تعديل الحملة' : 'إنشاء حملة', editing ? 'Edit campaign' : 'Create campaign')} description={t('الحفظ يسجل الحملة فقط. نهاية اليوم محسوبة بتوقيت بغداد.', 'Saving records the campaign only. End dates include the full Baghdad day.')} footer={<div className="space-y-3">{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}<div className="flex gap-2"><Button className="min-h-11" isLoading={busy} onClick={save}>{t('حفظ الحملة', 'Save campaign')}</Button><Button variant="secondary" className="min-h-11" disabled={busy} onClick={close}>{t('إلغاء', 'Cancel')}</Button></div></div>}>
      <form onSubmit={e => e.preventDefault()}><fieldset disabled={busy} className="space-y-4">
        <Input label={t('العنوان بالعربي', 'Arabic title')} value={title} maxLength={160} onChange={e => setTitle(e.target.value)} className="min-h-11" />
        <Input label={t('العنوان بالإنجليزي (اختياري)', 'English title (optional)')} value={titleEn} maxLength={160} onChange={e => setTitleEn(e.target.value)} className="min-h-11" />
        <Input label={t('كود الحملة', 'Campaign code')} dir="ltr" value={code} maxLength={40} onChange={e => setCode(e.target.value.toUpperCase())} className="min-h-11" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="text-xs text-slate-300">{t('نوع الخصم', 'Discount type')}<select aria-label={t('نوع الخصم', 'Discount type')} value={type} onChange={e => setType(e.target.value as 'percentage' | 'fixed')} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white"><option value="percentage">{t('نسبة مئوية', 'Percentage')}</option><option value="fixed">{t('مبلغ ثابت IQD', 'Fixed IQD')}</option></select></label><Input label={t('قيمة الخصم', 'Discount value')} dir="ltr" inputMode="decimal" value={value} onChange={e => setValue(e.target.value)} className="min-h-11" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Input label={t('أدنى شراء IQD (اختياري)', 'Minimum spend IQD (optional)')} dir="ltr" inputMode="numeric" value={minimum} onChange={e => setMinimum(e.target.value)} className="min-h-11" /><Input label={t('حد الاستخدام المخطط (اختياري)', 'Planned usage limit (optional)')} dir="ltr" inputMode="numeric" value={maximum} onChange={e => setMaximum(e.target.value)} className="min-h-11" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Input label={t('تاريخ البداية', 'Start date')} type="date" value={start} onChange={e => setStart(e.target.value)} className="min-h-11" /><Input label={t('تاريخ النهاية', 'End date')} type="date" value={end} onChange={e => setEnd(e.target.value)} className="min-h-11" /></div>
        <label className="flex min-h-11 items-center gap-3 text-sm text-slate-200"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />{t('السماح باستخدام الحملة ضمن الصلاحية', 'Allow campaign use within its validity')}</label>
        <section className="space-y-3 rounded-xl border border-slate-700 p-4"><h3 className="font-bold text-white">{t('معاينة حسابية فقط', 'Calculation preview only')}</h3><Input label={t('مبلغ الشراء للاختبار IQD', 'Sample subtotal IQD')} dir="ltr" inputMode="numeric" value={sample} onChange={e => setSample(e.target.value)} className="min-h-11" /><p role="status" className="text-sm leading-6 text-indigo-200">{preview ? t(`الخصم ${money(preview.discount)} · المتبقي ${money(preview.total)}`, `Discount ${money(preview.discount)} · Total ${money(preview.total)}`) : t('أكمل البيانات وأدخل مبلغاً يحقق الشروط؛ الحملة يجب أن تكون ضمن الصلاحية وغير موقوفة.', 'Complete valid details and a qualifying subtotal; the campaign must be within validity and not paused.')}</p></section>
      </fieldset></form>
    </Sheet>
    <Sheet isOpen={!!removing} onClose={() => { if (!busy) setRemoving(null); }} title={t('تأكيد حذف الحملة', 'Confirm campaign deletion')} footer={<div className="space-y-3">{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}<div className="flex gap-2"><Button variant="danger" className="min-h-11" isLoading={busy} onClick={async () => { if (!removing || busy) return; setBusy(true); try { const destination = await deleteOffer(removing.id); setRemoving(null); setNotice(destination === 'cloud' ? t('حُذف سجل الحملة سحابياً. أسعار المنتجات السابقة لم تتغير.', 'Campaign record deleted from cloud. Existing product prices were not changed.') : t('حُذف السجل محلياً فقط.', 'Record deleted locally only.')); } catch (err) { setError(message(err instanceof Error ? err.message : 'save')); } finally { setBusy(false); } }}>{t('حذف السجل', 'Delete record')}</Button><Button variant="secondary" className="min-h-11" disabled={busy} onClick={() => setRemoving(null)}>{t('إلغاء', 'Cancel')}</Button></div></div>}><p className="text-sm leading-7 text-slate-300">{t(`حذف الحملة ${removing?.code || ''}؟ يمكنك إيقافها للحفاظ على سجلها. حذفها لا يلغي خصومات المنتجات المطبّقة سابقاً.`, `Delete ${removing?.code || ''}? Pause it to preserve its record. Deleting does not remove previously applied product discounts.`)}</p></Sheet>
  </div>;
};
export default AdminOffersManager;

import React, { useState } from 'react';
import { Plus, Search, ArrowUp, ArrowDown, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { useSiteControls } from '../context/SiteControlsContext';
import { Sheet } from '../admin/Sheet';
import { Button, Input } from '../admin/ui';
import { activeSizeRows, calculateRecommendedSize, parseFitMeasurement, sizeRange, validateMasterSize, type MasterSizeItem } from '../data/sizeGuide';

export default function AdminSizesManager({ isAr = true }: { isAr?: boolean }) {
  const { masterSizes, updateMasterSize, addMasterSize, deleteMasterSize, toggleMasterSize, reorderMasterSizes, resetMasterSizesToDefault } = useSiteControls();
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<MasterSizeItem | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmAction, setConfirmAction] = useState<MasterSizeItem | 'reset' | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const t = (ar: string, en: string) => isAr ? ar : en;
  const active = activeSizeRows(masterSizes);
  const invalid = masterSizes.filter(row => validateMasterSize(row, masterSizes));
  const overlapping = active.some((row, index) => active.slice(index + 1).some(other =>
    Math.max(row.minHeight, other.minHeight) <= Math.min(row.maxHeight, other.maxHeight)
    && Math.max(row.minWeight, other.minWeight) <= Math.min(row.maxWeight, other.maxWeight)));
  const parsedHeight = parseFitMeasurement(height);
  const parsedWeight = parseFitMeasurement(weight);
  const result = parsedHeight === null || parsedWeight === null ? null : calculateRecommendedSize(parsedHeight, parsedWeight, masterSizes);
  const filtered = masterSizes.filter(row => [row.size, sizeRange(row, 'height', isAr), sizeRange(row, 'weight', isAr), row.note_ar, row.note_en].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
  const openEditor = (row?: MasterSizeItem) => {
    setError('');
    setDraft(row ? { ...row } : { id: '', size: '', height: '', weight: '', minHeight: 160, maxHeight: 185, minWeight: 55, maxWeight: 80, enabled: true });
  };
  const save = () => {
    if (!draft) return;
    const issue = validateMasterSize(draft, masterSizes);
    if (issue) {
      setError(issue === 'name' ? t('اكتب رمز المقاس.', 'Enter a size label.') : issue === 'duplicate' ? t('رمز المقاس موجود مسبقاً.', 'This size label already exists.') : t('أدخل حدوداً صحيحة: الطول 120–220 سم والوزن 30–200 كغم، والأدنى لا يتجاوز الأعلى.', 'Use valid ranges: height 120–220 cm, weight 30–200 kg, minimum no greater than maximum.'));
      return;
    }
    const next = { ...draft, size: draft.size.trim().toUpperCase(), height: sizeRange(draft, 'height'), weight: sizeRange(draft, 'weight') };
    if (draft.id) updateMasterSize(draft.id, next);
    else { const { id, ...item } = next; addMasterSize(item); }
    setDraft(null);
    setNotice(t('تم تطبيق المقاس في هذه الجلسة. المزامنة السحابية تعمل بالخلفية.', 'Size applied in this session. Cloud sync runs in the background.'));
  };
  const move = (index: number, delta: number) => {
    const next = [...masterSizes];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    reorderMasterSizes(next);
  };
  const bounds = [
    ['minHeight', 'أدنى طول (سم)', 'Min height (cm)'], ['maxHeight', 'أعلى طول (سم)', 'Max height (cm)'],
    ['minWeight', 'أدنى وزن (كغم)', 'Min weight (kg)'], ['maxWeight', 'أعلى وزن (كغم)', 'Max weight (kg)'],
  ] as const;
  return <div className="sizes-manager min-w-0 space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-xl font-bold text-white">{t('المقاسات ونطاقات القياس', 'Sizes & measurement ranges')}</h2><p className="mt-2 text-sm text-slate-400">{t('الأرقام نفسها تُستخدم في الجدول وحاسبة المتجر. التعديلات تطبّق عند الحفظ.', 'The table and calculator use the same numbers. Edits apply when saved.')}</p></div>
      <Button onClick={() => openEditor()} leftIcon={<Plus className="h-4 w-4" />} className="min-h-11">{t('إضافة مقاس', 'Add size')}</Button>
    </div>
    <div className="grid grid-cols-3 gap-2 text-center text-sm">
      {[[t('كل المقاسات', 'Total sizes'), masterSizes.length], [t('مفعّلة', 'Enabled'), active.length], [t('مخفية', 'Hidden'), masterSizes.filter(row => !row.enabled).length]].map(([label, count]) => <div key={label} className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/50 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-xl font-bold text-white">{count}</p></div>)}
    </div>
    <p className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm leading-6 text-slate-300">{t('الاقتراح يعتمد على وجود الطول والوزن معاً ضمن نطاق المقاس. عند تداخل النطاقات تُختار المطابقة الأقرب لمركز النطاقين، بدون الاعتماد على ترتيب العرض. هذا دليل تقريبي؛ قياسات الصدر والخصر وقصّة القطعة غير محسوبة.', 'A match requires both height and weight within a size range. Overlaps use the closest normalized range centers, independently of display order. Guidance is approximate; chest, waist and garment cut are not measured.')}</p>
    {(invalid.length > 0 || overlapping || active.length === 0) && <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{t(`${invalid.length} صف يحتاج تصحيحاً · ${overlapping ? 'توجد نطاقات متداخلة.' : 'لا توجد نطاقات متداخلة.'} الصفوف غير الصالحة أو المخفية لا تدخل بالحساب.${active.length ? '' : ' لا توجد مقاسات صالحة مفعّلة.'}`, `${invalid.length} rows need correction · ${overlapping ? 'Ranges overlap.' : 'No overlapping ranges.'} Invalid or hidden rows are excluded.${active.length ? '' : ' No valid enabled sizes.'}`)}</p>}
    {notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}
    <div className="flex flex-wrap gap-3 items-end">
      <div className="min-w-0 flex-1 basis-52"><Input label={t('بحث المقاسات', 'Search sizes')} icon={Search} value={search} onChange={e => setSearch(e.target.value)} className="min-h-11" /></div>
      <Button variant="secondary" className="min-h-11" aria-pressed={showPreview} onClick={() => setShowPreview(!showPreview)}>{t(showPreview ? 'إخفاء المعاينة' : 'معاينة جدول الزبون', showPreview ? 'Hide preview' : 'Preview customer chart')}</Button>
      <Button variant="secondary" className="min-h-11" disabled={masterSizes.length < 2} onClick={() => { reorderMasterSizes([...masterSizes].sort((a, b) => a.minWeight - b.minWeight || a.minHeight - b.minHeight || a.size.localeCompare(b.size))); setNotice(t('تم ترتيب العرض حسب أدنى وزن ثم أدنى طول.', 'Display sorted by minimum weight, then minimum height.')); }}>{t('ترتيب حسب القياسات', 'Sort by measurements')}</Button>
    </div>
    {showPreview && <div className="overflow-x-auto rounded-xl border border-slate-700" role="region" aria-label={t('معاينة جدول المقاسات', 'Size chart preview')} tabIndex={0}><table className="w-full text-sm text-slate-200"><caption className="p-3 text-start text-slate-400">{t('المقاسات المفعّلة فقط · سم وكغم', 'Enabled sizes only · cm and kg')}</caption><thead><tr>{[t('المقاس', 'Size'), t('الطول', 'Height'), t('الوزن', 'Weight')].map(label => <th scope="col" key={label} className="p-3 text-start">{label}</th>)}</tr></thead><tbody>{active.map(row => <tr key={row.id} className="border-t border-slate-800"><th scope="row" className="p-3 text-start">{row.size}</th><td className="p-3 whitespace-nowrap"><bdi dir="ltr">{sizeRange(row, 'height', isAr)}</bdi></td><td className="p-3 whitespace-nowrap"><bdi dir="ltr">{sizeRange(row, 'weight', isAr)}</bdi></td></tr>)}</tbody></table>{!active.length && <p className="p-4 text-slate-400">{t('لا توجد مقاسات مفعّلة.', 'No enabled sizes.')}</p>}</div>}
    <section className="rounded-xl border border-slate-700 p-4 space-y-3" aria-label={t('فحص الحاسبة', 'Calculator check')}>
      <h3 className="font-bold text-white">{t('جرّب الحاسبة بدون حفظ بيانات', 'Check the calculator without saving data')}</h3>
      <div className="grid grid-cols-2 gap-3"><Input label={t('الطول (سم)', 'Height (cm)')} type="text" inputMode="decimal" maxLength={8} dir="ltr" value={height} onChange={e => setHeight(e.target.value)} className="min-h-11" /><Input label={t('الوزن (كغم)', 'Weight (kg)')} type="text" inputMode="decimal" maxLength={8} dir="ltr" value={weight} onChange={e => setWeight(e.target.value)} className="min-h-11" /></div>
      <p role="status" className="text-sm leading-6 text-indigo-200">{result ? `${isAr ? result.title_ar : result.title_en} — ${isAr ? result.note_ar : result.note_en}` : t('أدخل طولاً من 120 إلى 220 سم ووزناً من 30 إلى 200 كغم.', 'Enter height 120–220 cm and weight 30–200 kg.')}</p>
    </section>
    <div className="space-y-3">{filtered.map(row => { const index = masterSizes.findIndex(item => item.id === row.id); return <article key={row.id} className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-white break-all">{row.size} <span className="ms-2 text-xs font-normal text-slate-400">{t(row.enabled ? 'مفعّل' : 'مخفي', row.enabled ? 'Enabled' : 'Hidden')}</span></h3><div className="flex gap-2"><Button variant="secondary" className="min-h-11 min-w-11" aria-label={t(`تقديم ${row.size}`, `Move ${row.size} up`)} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp className="h-4 w-4" /></Button><Button variant="secondary" className="min-h-11 min-w-11" aria-label={t(`تأخير ${row.size}`, `Move ${row.size} down`)} disabled={index === masterSizes.length - 1} onClick={() => move(index, 1)}><ArrowDown className="h-4 w-4" /></Button></div></div>
      <div className="grid grid-cols-2 gap-2 text-sm text-slate-300"><p>{t('الطول', 'Height')}<br /><bdi dir="ltr">{sizeRange(row, 'height', isAr)}</bdi></p><p>{t('الوزن', 'Weight')}<br /><bdi dir="ltr">{sizeRange(row, 'weight', isAr)}</bdi></p></div>
      {(isAr ? row.note_ar : row.note_en) && <p className="text-sm text-slate-400 break-words">{isAr ? row.note_ar : row.note_en}</p>}
      <div className="grid grid-cols-3 gap-2"><Button variant="secondary" className="min-h-11 px-2" aria-label={t(`تعديل ${row.size}`, `Edit ${row.size}`)} onClick={() => openEditor(row)} leftIcon={<Pencil className="h-4 w-4" />}>{t('تعديل', 'Edit')}</Button><Button variant="secondary" className="min-h-11 px-2" aria-label={t(row.enabled ? `إخفاء ${row.size}` : `تفعيل ${row.size}`, row.enabled ? `Hide ${row.size}` : `Enable ${row.size}`)} aria-pressed={row.enabled} onClick={() => { toggleMasterSize(row.id); setNotice(t('تم تغيير الظهور في هذه الجلسة.', 'Visibility changed in this session.')); }}>{t(row.enabled ? 'إخفاء' : 'تفعيل', row.enabled ? 'Hide' : 'Enable')}</Button><Button variant="secondary" className="min-h-11 px-2 text-rose-300" aria-label={t(`حذف ${row.size}`, `Delete ${row.size}`)} onClick={() => setConfirmAction(row)} leftIcon={<Trash2 className="h-4 w-4" />}>{t('حذف', 'Delete')}</Button></div>
    </article>; })}{!filtered.length && <p role="status" className="py-8 text-center text-slate-400">{t('لا توجد مقاسات مطابقة.', 'No matching sizes.')}</p>}</div>
    <div className="border-t border-slate-800 pt-4 space-y-2"><Button variant="secondary" className="min-h-11" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirmAction('reset')}>{t('استعادة المقاسات الافتراضية', 'Restore default sizes')}</Button><p className="text-xs leading-5 text-slate-500">{t('دليل عام للمتجر؛ إخفاء المقاس هنا لا يغيّر مخزون المنتجات. الحفظ السحابي بالخلفية ولا يُؤكّد من هذه الشاشة.', 'This is a store-wide guide; hiding a size does not change product stock. Background cloud saving is not confirmed by this screen.')}</p></div>
    <Sheet isOpen={!!draft} onClose={() => setDraft(null)} title={t(draft?.id ? 'تعديل المقاس' : 'إضافة مقاس', draft?.id ? 'Edit size' : 'Add size')} footer={<div className="space-y-3">{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}<div className="flex gap-2"><Button className="min-h-11" onClick={save}>{t('حفظ المقاس', 'Save size')}</Button><Button variant="secondary" className="min-h-11" onClick={() => setDraft(null)}>{t('إلغاء', 'Cancel')}</Button></div></div>}>
      {draft && <form className="space-y-5" onSubmit={e => { e.preventDefault(); save(); }}>
        <Input label={t('رمز المقاس', 'Size label')} maxLength={30} value={draft.size} onChange={e => setDraft({ ...draft, size: e.target.value })} className="min-h-11" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{bounds.map(([key, ar, en]) => <Input key={key} label={t(ar, en)} dir="ltr" type="number" min={key.includes('Height') ? 120 : 30} max={key.includes('Height') ? 220 : 200} step="any" value={Number.isFinite(draft[key]) ? draft[key] : ''} onChange={e => setDraft({ ...draft, [key]: e.target.value === '' ? NaN : Number(e.target.value) })} className="min-h-11" />)}</div>
        <Input label={t('ملاحظة بالعربي (اختياري)', 'Arabic note (optional)')} value={draft.note_ar || ''} onChange={e => setDraft({ ...draft, note_ar: e.target.value })} className="min-h-11" />
        <Input label={t('ملاحظة بالإنجليزي (اختياري)', 'English note (optional)')} value={draft.note_en || ''} onChange={e => setDraft({ ...draft, note_en: e.target.value })} className="min-h-11" />
        <p className="text-sm text-slate-400">{t('نص نطاق الطول والوزن يُولّد من الأرقام أعلاه لمنع اختلاف الجدول عن الحاسبة.', 'Displayed ranges are generated from the numbers above so the chart and calculator stay consistent.')}</p>
        <button type="submit" className="sr-only" tabIndex={-1}>{t('حفظ', 'Save')}</button>
      </form>}
    </Sheet>
    <Sheet isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title={t('تأكيد تغيير دليل المقاسات', 'Confirm size guide change')} footer={<div className="flex gap-2"><Button variant="danger" className="min-h-11" onClick={() => { if (confirmAction === 'reset') resetMasterSizesToDefault(); else if (confirmAction) deleteMasterSize(confirmAction.id); setConfirmAction(null); setNotice(t('تم تطبيق التغيير في هذه الجلسة.', 'Change applied in this session.')); }}>{t('تأكيد', 'Confirm')}</Button><Button variant="secondary" className="min-h-11" onClick={() => setConfirmAction(null)}>{t('إلغاء', 'Cancel')}</Button></div>}><p className="text-slate-300 leading-7">{confirmAction === 'reset' ? t('هذا يستبدل دليل المقاسات الحالي بالقيم الافتراضية. لا يغيّر مخزون المنتجات.', 'This replaces the current guide with defaults. Product stock stays unchanged.') : t(`حذف المقاس ${confirmAction?.size || ''} من الدليل؟ يمكنك إخفاؤه بدلاً من الحذف.`, `Delete ${confirmAction && confirmAction.size || ''} from the guide? You can hide it instead.`)}</p></Sheet>
  </div>;
}

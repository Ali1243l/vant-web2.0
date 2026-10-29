import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { parseBannerTarget, matchesBannerTarget, type BannerTarget } from '../lib/bannerTarget';
import { productMatchesQuery } from '../lib/search';
import { Button, Input } from './ui';

export default function BannerTargetEditor({ isAr, raw, onChange }: { isAr: boolean; raw?: string; onChange: (target: BannerTarget) => void }) {
  const { products, loading, loadingMore, hasMore, loadMore, error } = useProducts();
  const target = parseBannerTarget(raw);
  const [query, setQuery] = useState('');
  const t = (ar: string, en: string) => isAr ? ar : en;
  const selectable = products.filter(p => !p.is_demo && (target.mode !== 'selected_offers' || p.is_offer) && productMatchesQuery(p, query));
  const missing = target.productIds.filter(id => !products.some(p => String(p.id) === id));
  const shown = products.filter(p => matchesBannerTarget(p, target));
  return <section aria-label={t('وجهة زر البانر', 'Banner button destination')} className="min-w-0 space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
    <h3 className="font-bold text-white">{t('شنو يظهر عند الضغط على زر البانر؟', 'What does the banner button show?')}</h3>
    <label className="block space-y-2 text-sm text-slate-300"><span>{t('نوع الوجهة', 'Destination type')}</span><select aria-label={t('نوع الوجهة', 'Destination type')} value={target.mode} onChange={e => onChange({ mode: e.target.value as BannerTarget['mode'], productIds: target.productIds })} className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"><option value="all_offers">{t('كل العروض الحالية', 'All current offers')}</option><option value="selected_offers">{t('عروض أختارها بنفسي', 'Offers I select')}</option><option value="selected_products">{t('مجموعة قطع أختارها بنفسي', 'Products I select')}</option></select></label>
    <p className="text-xs leading-5 text-slate-400">{t('هذا الاختيار خاص بزر البانر؛ تبويب العروض العام يبقى يعرض كل العروض. القطعة التي يُلغى وسم عرضها من الكتالوج تخرج من «عروض أختارها»؛ لا تتغير أسعارها هنا.', 'This selection only affects the banner button; the general Offers tab still shows all offers. Removing a piece’s offer flag in the catalog excludes it from selected offers. This does not edit prices.')}</p>
    {target.mode !== 'all_offers' && <><Input label={t('بحث بالاسم أو رمز القطعة', 'Search by name or SKU')} value={query} onChange={e => setQuery(e.target.value)} className="min-h-11" /><p role="status" className="text-xs text-blue-300">{target.productIds.length} {t('محددة', 'selected')} · {shown.length} {t('مطابقة من القطع المحمّلة', 'matching loaded pieces')}</p>
      <div className="max-h-80 space-y-2 overflow-y-auto overscroll-contain rounded-lg border border-slate-700 p-2">{selectable.map(p => <label key={p.id} className="flex min-h-16 cursor-pointer items-center gap-3 rounded-lg bg-slate-950 p-2 text-sm text-slate-200"><input type="checkbox" checked={target.productIds.includes(String(p.id))} onChange={e => onChange({ ...target, productIds: e.target.checked ? [...target.productIds, String(p.id)] : target.productIds.filter(id => id !== String(p.id)) })} className="h-5 w-5 shrink-0 accent-blue-600" /><img src={p.image_url} alt="" className="h-12 w-10 shrink-0 rounded object-cover" /><span className="min-w-0 break-words">{isAr ? p.title_ar || p.title : p.title}<small className="mt-1 block text-slate-400">{p.is_offer ? t('عليه عرض', 'On offer') : t('سعر اعتيادي', 'Regular price')} · {p.price.toLocaleString('en-US')} IQD</small></span></label>)}{!selectable.length && <p className="p-3 text-sm text-slate-400">{loading ? t('جاري تحميل القطع…', 'Loading pieces…') : t('لا توجد قطع مطابقة بالبيانات المحمّلة.', 'No matching loaded pieces.')}</p>}</div>
      {!target.productIds.length && <p className="text-xs text-amber-200">{t('حدد قطعة واحدة على الأقل قبل الحفظ.', 'Select at least one piece before saving.')}</p>}
      {!!missing.length && <div className="space-y-2"><p className="text-xs text-amber-200">{t('معرّفات محددة غير محمّلة أو محذوفة؛ تبقى محفوظة حتى تزيلها:', 'Selected IDs not loaded or deleted; they stay selected until removed:')}</p>{missing.map(id => <Button key={id} type="button" variant="secondary" onClick={() => onChange({ ...target, productIds: target.productIds.filter(value => value !== id) })}>{t('إزالة', 'Remove')} {id}</Button>)}</div>}
    </>}
    {hasMore && <Button type="button" variant="secondary" isLoading={loadingMore} onClick={() => void loadMore()}>{t('تحميل قطع إضافية للاختيار', 'Load more pieces to select')}</Button>}{error && <p role="alert" className="text-sm text-rose-300">{t('تعذر تحميل جزء من الكتالوج؛ لا تُحذف اختياراتك السابقة.', 'Some catalog data could not be loaded; existing selections are retained.')}</p>}
  </section>;
}

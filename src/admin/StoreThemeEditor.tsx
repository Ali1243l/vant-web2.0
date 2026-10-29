import { useState, type CSSProperties } from 'react';
import { parseStoreTheme, paletteIssue, storeThemeVariables, type StoreTheme, type StorePalette } from '../lib/storefrontTheme';
import { Button } from './ui';

export default function StoreThemeEditor({ isAr, raw, image, onChange }: { isAr: boolean; raw?: string; image: string; onChange: (theme: StoreTheme) => void }) {
  const theme = parseStoreTheme(raw);
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const t = (ar: string, en: string) => isAr ? ar : en;
  const set = (patch: Partial<StoreTheme>) => onChange({ ...theme, ...patch });
  const issue = paletteIssue(theme);
  return <section aria-label={t('تخصيص هوية المتجر', 'Customize store identity')} className="min-w-0 space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
    <h3 className="font-bold text-white">{t('الثيم على المتجر كله', 'Theme the whole store')}</h3>
    <label className="flex min-h-11 items-center gap-3 text-sm text-slate-200"><input type="checkbox" checked={theme.enabled} onChange={e => set({ enabled: e.target.checked })} className="h-5 w-5 accent-blue-600" />{t('تطبيق الهوية على الهيدر والبطاقات والأزرار والفوتر والنوافذ', 'Apply identity to the header, cards, buttons, footer and panels')}</label>
    <p className="text-xs leading-5 text-slate-400">{t('إلغاء التفعيل يرجع شكل المتجر الأساسي مع الاحتفاظ بألوانك. صور القطع ولوحة الإدارة لا تتلوّن. المعاينة أدناه محلية حتى تحفظ.', 'Disable to restore the original store style while keeping your palette. Product photos and admin remain unchanged. This preview is local until Save.')}</p>
    <div role="group" aria-label={t('وضع معاينة هوية المتجر', 'Store identity preview mode')} className="flex gap-2">{(['light', 'dark'] as const).map(value => <Button key={value} type="button" variant={mode === value ? 'primary' : 'secondary'} className="min-h-11" aria-pressed={mode === value} onClick={() => setMode(value)}>{value === 'light' ? t('فاتح', 'Light') : t('داكن', 'Dark')}</Button>)}</div>
    <div data-storefront-theme="preview" className="store-theme-preview min-w-0 overflow-hidden rounded-xl border p-4 space-y-4" style={storeThemeVariables(theme, mode) as CSSProperties}>
      <div data-store-toolbar className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"><b>VANT</b><span>{t('بحث · سلة · اللغة', 'Search · Cart · Language')}</span></div>
      <div className="grid min-w-0 gap-4 min-[450px]:grid-cols-2"><div className="space-y-2"><h4 className="text-lg font-bold">{t('إطلالة الموسم تبدأ هنا', 'Your seasonal look starts here')}</h4><p data-store-muted className="text-sm leading-6">{t('خلفية هادئة، نص واضح، وألوان تربط تفاصيل المتجر.', 'A considered background, readable text and a consistent palette.')}</p><span data-store-primary className="inline-flex min-h-11 items-center px-4 text-xs font-bold">{t('تصفح التشكيلة', 'Browse collection')}</span></div><article data-store-card className="min-w-0 overflow-hidden border"><img src={image} alt="" className="h-24 w-full object-cover" /><div className="p-3"><h5 className="font-semibold">{t('معاينة بطاقة قطعة', 'Product card preview')}</h5><span data-store-price className="text-sm font-bold">IQD 25,000</span></div></article></div>
      <div data-store-footer className="border-t pt-3 text-xs">{t('فانت · المتجر', 'VANT · Store')}</div>
    </div>
    <details className="rounded-lg border border-slate-700 p-3"><summary className="min-h-11 cursor-pointer text-sm font-semibold text-white">{t('تعديل الألوان والتفاصيل', 'Edit palette & details')}</summary>
      <p className="mb-3 text-xs leading-5 text-slate-400">{t('تعدّل الآن ألوان الوضع', 'Editing palette for')} {mode === 'light' ? t('الفاتح', 'light mode') : t('الداكن', 'dark mode')}</p>
      <div className="grid gap-3 sm:grid-cols-2">{([['background', 'خلفية الصفحة', 'Page background'], ['surface', 'خلفية البطاقات والقوائم', 'Card & panel background'], ['text', 'النص الرئيسي', 'Primary text'], ['muted', 'النص الثانوي', 'Secondary text'], ['accent', 'الأزرار واللون المميز', 'Buttons & accent'], ['border', 'الحدود والفواصل', 'Borders']] as const).map(([key, ar, en]) => <label key={key} className="flex min-h-11 items-center justify-between gap-3 text-xs text-slate-300"><span>{t(ar, en)}</span><input aria-label={t(ar, en)} type="color" value={theme[mode][key]} onChange={e => set({ [mode]: { ...theme[mode], [key as keyof StorePalette]: e.target.value } })} className="h-11 w-12 shrink-0 rounded" /></label>)}</div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{([['radius', 'استدارة البطاقات', 'Card corners', 0, 28], ['spacing', 'المسافة بين القطع', 'Product spacing', 8, 32]] as const).map(([key, ar, en, min, max]) => <label key={key} className="text-xs text-slate-300"><span>{t(ar, en)} · {theme[key]} px</span><input aria-label={t(ar, en)} type="range" min={min} max={max} value={theme[key]} onChange={e => set({ [key]: Number(e.target.value) })} className="min-h-11 w-full accent-blue-600" /></label>)}</div>
      <label className="flex min-h-11 items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={theme.pillButtons} onChange={e => set({ pillButtons: e.target.checked })} className="h-5 w-5 accent-blue-600" />{t('أزرار بحواف دائرية كاملة', 'Pill-shaped buttons')}</label>
    </details>
    {issue && <p role="alert" className="rounded-lg border border-amber-500/30 p-3 text-sm text-amber-200">{t('تباين النص غير كافٍ في الوضع', 'Text contrast is too low in')} {issue === 'light' ? t('الفاتح', 'light mode') : t('الداكن', 'dark mode')}{t('؛ عدّل النص أو الخلفية قبل نشر الهوية. لون نص الأزرار يُختار تلقائياً حسب الوضوح.', '; adjust text or background before publishing. Button text color is chosen automatically for readability.')}</p>}
  </section>;
}

import { useState } from 'react';
import { catalogImageStyle, normalizeCatalogImage, CATALOG_IMAGE_RATIO, type CatalogImage } from '../../lib/catalogImage';

export function ProductCatalogImageSection({ images, value, onChange, isAr }: { images: string[]; value?: CatalogImage; onChange: (value: CatalogImage) => void; isAr: boolean }) {
  const image = normalizeCatalogImage(value);
  const [selected, setSelected] = useState('');
  const [failed, setFailed] = useState('');
  const source = images.includes(selected) ? selected : images[0];
  const t = (ar: string, en: string) => isAr ? ar : en;
  return <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 sm:p-5 space-y-4" aria-label={t('صورة بطاقة الكتالوج', 'Catalog card image')}>
    <header className="space-y-2"><h3 className="text-base font-bold text-white">{t('صورة بطاقة الكتالوج', 'Catalog card image')} <span dir="ltr" className="text-xs text-slate-400">3:4</span></h3><p className="text-xs leading-relaxed text-slate-400">{t('إطار موحّد بالقائمة لكل الأجهزة. التعديل يخص العرض فقط؛ الصورة الأصلية داخل تفاصيل المنتج تبقى كاملة. المعاينة لا تُطبّق قبل حفظ المنتج.', 'One catalog frame across devices. Display settings only; the original image stays complete in product details. Preview changes apply only after saving the product.')}</p></header>
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-3">
        <label className="block text-sm text-slate-200">{t('طريقة العرض', 'Image display')}<select className="mt-2 min-h-11 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 text-sm" value={image.fit} onChange={event => onChange({ ...image, fit: event.target.value as CatalogImage['fit'] })}><option value="contain">{t('إظهار الصورة كاملة', 'Show full image')}</option><option value="cover">{t('ملء الإطار وقص الأطراف', 'Fill frame & crop edges')}</option></select></label>
        <p className="text-xs leading-relaxed text-slate-400">{image.fit === 'contain' ? t('بدون قص. الفراغات تتبع خلفية البطاقة.', 'No cropping. Empty space uses the card background.') : t('اختر موضع الجزء المهم من الصورة، وراجع عدم قص القطعة.', 'Choose the important area and check that the garment is not cropped.')}</p>
        <fieldset disabled={image.fit !== 'cover'} className="space-y-4 disabled:opacity-45">
          <legend className="text-sm mb-3">{t('موضع القص', 'Crop position')}</legend>
          {(['x', 'y'] as const).map(axis => <label key={axis} className="block text-xs space-y-2"><span className="flex justify-between gap-2"><span>{axis === 'x' ? t('أفقي: اليسار ← اليمين', 'Horizontal: left → right') : t('عمودي: الأعلى ← الأسفل', 'Vertical: top → bottom')}</span><output dir="ltr">{image[axis]}%</output></span><input aria-label={axis === 'x' ? t('موضع القص الأفقي', 'Horizontal crop position') : t('موضع القص العمودي', 'Vertical crop position')} dir="ltr" type="range" min="0" max="100" step="1" value={image[axis]} onChange={event => onChange({ ...image, [axis]: Number(event.target.value) })} className="w-full min-h-11 accent-indigo-500" /></label>)}
          <button type="button" className="min-h-11 rounded-xl border border-slate-600 px-3 text-xs" onClick={() => onChange({ ...image, x: 50, y: 50 })}>{t('توسيط الصورة', 'Center image')}</button>
        </fieldset>
      </div>
      <div className="space-y-3 min-w-0">
        {images.length > 1 && <label className="block text-xs">{t('الصورة المستخدمة للمعاينة', 'Preview image')}<select value={source} onChange={event => setSelected(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-600 bg-slate-950 px-3">{images.map((url, index) => <option key={url} value={url}>{t('الصورة', 'Image')} {index + 1}</option>)}</select></label>}
        <div className="catalog-image-frame relative mx-auto w-full max-w-[260px] overflow-hidden rounded-2xl border border-slate-600 bg-slate-100 dark:bg-[#181a1d]" style={{ aspectRatio: CATALOG_IMAGE_RATIO }}>
          {source && failed !== source ? <img onError={() => setFailed(source)} src={source} alt={t('معاينة صورة بطاقة الكتالوج', 'Catalog card image preview')} className="absolute inset-0 h-full w-full" style={catalogImageStyle(image)} /> : <p className="absolute inset-0 grid place-items-center p-5 text-center text-xs text-slate-400"><span>{source ? t('تعذّر تحميل الصورة.', 'Image could not load.') : t('أضف صورة للمنتج حتى تظهر المعاينة.', 'Add a product image to preview.')}</span>{source && <button type="button" onClick={() => setFailed('')} className="min-h-11 underline">{t('إعادة المحاولة', 'Retry')}</button>}</p>}
        </div><p className="text-center text-xs text-slate-400">{t('نفس الإطار على الهاتف والكمبيوتر', 'Same frame on phone and desktop')}</p>
      </div>
    </div>
    <p className="text-xs leading-relaxed text-slate-400">{t('إذا تستخدم التخزين السحابي: بعد حفظ المنتج، انشر التخصيصات من الإعدادات ← النسخ الاحتياطي ← مزامنة السحابة.', 'Using cloud storage? After saving the product, publish customizations from Settings → Backup → Sync Cloud.')}</p>
  </section>;
}

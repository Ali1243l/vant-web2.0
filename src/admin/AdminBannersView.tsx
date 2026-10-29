import React, { useEffect, useRef, useState } from 'react';
import { useAdminBridge } from './useAdminBridge';
import { useSiteControls } from '../context/SiteControlsContext';
import { Button, Input } from './ui';
import HeroAppearanceEditor from './HeroAppearanceEditor';
import BannerThemeLibrary from './BannerThemeLibrary';
import { bannerThemeEdits } from '../lib/bannerThemes';
import { HERO_APPEARANCE_CONTROL } from '../lib/heroAppearance';
import { fileToOptimizedDataUrl, uploadDataUrlToSupabase } from '../lib/storage';
import { isSupabaseConfigured } from '../lib/supabase';
import { buildBannerChanges, validateBannerFile, type BannerEdits, type TrendEdits } from '../lib/bannerEditor';
import type { SiteControlItem } from '../context/siteControlsTypes';
import { HERO_BANNER_IMAGE } from '../lib/constants';

export const AdminBannersView: React.FC = () => {
  const { lang, setHasUnsavedChanges } = useAdminBridge();
  const { controls, trendItems, saveBannerEdits } = useSiteControls();
  const isAr = lang === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;
  const [section, setSection] = useState('themes');
  const [language, setLanguage] = useState<'ar' | 'en'>(isAr ? 'ar' : 'en');
  const [edits, setEdits] = useState<BannerEdits>({});
  const [trendEdits, setTrendEdits] = useState<TrendEdits>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const libraryRef = useRef<HTMLDivElement>(null);
  const themePreviewRef = useRef<HTMLDivElement>(null);
  const dirty = !!Object.keys(edits).length || !!Object.keys(trendEdits).length;
  useEffect(() => { setHasUnsavedChanges(dirty); return () => setHasUnsavedChanges(false); }, [dirty, setHasUnsavedChanges]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const draftControls = Object.fromEntries(Object.entries(controls).map(([id, row]) => [id, { ...row, ...edits[id] }]));
  const draftTrends = trendItems.map(row => ({ ...row, ...trendEdits[row.id] }));
  const patchControl = (id: string, patch: Partial<SiteControlItem>) => { setEdits(prev => ({ ...prev, [id]: { ...prev[id], ...patch } })); setError(''); setNotice(''); };
  const patchTrend = (id: string, patch: TrendEdits[string]) => { setTrendEdits(prev => ({ ...prev, [id]: { ...prev[id], ...patch } })); setError(''); setNotice(''); };
  const prepareImage = async (file: File, trendId?: string) => {
    if (!validateBannerFile(file)) { setError(t('اختر صورة JPG أو PNG أو WebP، بحجم لا يتجاوز 10 ميغابايت.', 'Choose JPG, PNG or WebP up to 10 MB.')); return; }
    setBusy(true); setError('');
    const localUrl = URL.createObjectURL(file);
    try {
      const image = new Image(); image.src = localUrl; await image.decode();
      if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 32000000) throw new Error('image');
      const optimized = await fileToOptimizedDataUrl(file, 1920, 1600, 0.86);
      if (trendId) patchTrend(trendId, { image: optimized }); else patchControl('banner_hero_bg', { actionValue: optimized });
      setNotice(t('الصورة جاهزة للمعاينة فقط. تُرفع وتُطبّق عند الحفظ.', 'Image prepared for preview only. Upload and apply with Save.'));
    } catch { setError(t('تعذر قراءة الصورة، أو أبعادها كبيرة جداً. جرّب صورة أصغر وصالحة.', 'Image could not be decoded or is too large. Try a smaller valid image.')); }
    finally { URL.revokeObjectURL(localUrl); setBusy(false); }
  };
  const save = async () => {
    if (busy || !dirty) return;
    setBusy(true); setError(''); setNotice('');
    try {
      buildBannerChanges(controls, trendItems, edits, trendEdits);
      const nextEdits = structuredClone(edits), nextTrends = structuredClone(trendEdits);
      if (isSupabaseConfigured) {
        const upload = async (value: string, folder: string) => {
          if (!value.startsWith('data:')) return value;
          const url = await uploadDataUrlToSupabase(value, folder);
          if (!url.startsWith('https://')) throw new Error('upload');
          return url;
        };
        if (nextEdits.banner_hero_bg?.actionValue) nextEdits.banner_hero_bg.actionValue = await upload(nextEdits.banner_hero_bg.actionValue, 'banners');
        for (const row of Object.values(nextTrends)) if (row.image) row.image = await upload(row.image, 'trends');
      }
      const destination = await saveBannerEdits(nextEdits, nextTrends);
      setEdits({}); setTrendEdits({});
      setNotice(destination === 'cloud' ? t('تم حفظ البانر والبطاقات سحابياً.', 'Banner and cards saved to cloud.') : t('تم تطبيق التغييرات محلياً فقط؛ السحابة غير مهيّأة.', 'Changes applied locally only; cloud is not configured.'));
    } catch (err) {
      const issue = err instanceof Error ? err.message : '';
      setError(issue === 'text' ? t('أكمل النصوص ولا تتجاوز 1000 حرف للحقل.', 'Complete the text fields, up to 1000 characters each.') : issue === 'image' ? t('رابط الصورة غير صالح. استخدم رابط HTTP/HTTPS مباشر أو اختر ملفاً.', 'Invalid image URL. Use a direct HTTP/HTTPS link or select a file.') : t('تعذر الحفظ. المسودة باقية؛ راجع الاتصال والصور وحاول مجدداً.', 'Save failed. Your draft remains; check connection and images and retry.'));
    } finally { setBusy(false); }
  };
  const languagePicker = <div role="group" aria-label={t('لغة المحتوى', 'Content language')} className="flex gap-2">{(['ar', 'en'] as const).map(value => <Button type="button" key={value} variant={language === value ? 'primary' : 'secondary'} className="min-h-11" aria-pressed={language === value} onClick={() => setLanguage(value)}>{value === 'ar' ? 'العربية' : 'English'}</Button>)}</div>;
  const imageInput = (trendId?: string) => <label className="block space-y-2 text-xs text-slate-300"><span>{t('اختيار صورة للمعاينة · JPG / PNG / WebP · حتى 10 MB', 'Select preview image · JPG / PNG / WebP · up to 10 MB')}</span><input type="file" accept="image/jpeg,image/png,image/webp" className="block min-h-11 w-full min-w-0 rounded-lg border border-slate-700 p-2 text-xs file:me-2 file:rounded file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-white" onChange={e => { const file = e.target.files?.[0]; if (file) void prepareImage(file, trendId); e.target.value = ''; }} /></label>;
  return <div className="banner-manager min-w-0 space-y-5">
    <header><h2 className="text-xl font-bold text-white">{t('البانر وبطاقات الموسم', 'Banner & seasonal cards')}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{t('اختر القسم، عدّل وعاين، ثم احفظ. لا تتغير واجهة الزبون أثناء تعديل المسودة.', 'Choose a section, edit and preview, then save. Draft edits do not change the storefront.')}</p></header>
    <nav aria-label={t('أقسام تحرير البانر', 'Banner editor sections')} className="grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-900 p-2 sm:grid-cols-4">{[['themes', 'ثيمات الموسم', 'Seasonal themes'], ['content', 'النصوص والظهور', 'Text & visibility'], ['appearance', 'الصورة والمظهر', 'Image & appearance'], ['trends', 'بطاقات الموسم', 'Seasonal cards']].map(([id, ar, en]) => <button key={id} type="button" aria-pressed={section === id} onClick={() => setSection(id)} className={`min-h-11 min-w-0 rounded-lg px-2 text-xs font-semibold ${section === id ? 'bg-[#004ad7] text-white' : 'text-slate-300 hover:bg-slate-800'}`}>{t(ar, en)}</button>)}</nav>
    <fieldset disabled={busy} className="min-w-0 space-y-5">
      {section === 'themes' && <>
        <div ref={libraryRef} className="scroll-mt-24">
        <BannerThemeLibrary isAr={isAr} image={draftControls.banner_hero_bg?.actionValue || HERO_BANNER_IMAGE} appearance={draftControls[HERO_APPEARANCE_CONTROL]?.actionValue} onSelect={(theme, includeCopy) => {
          const patch = bannerThemeEdits(theme, draftControls[HERO_APPEARANCE_CONTROL]?.actionValue, includeCopy);
          setEdits(prev => {
            const next = { ...prev };
            for (const [id, value] of Object.entries(patch)) next[id] = { ...next[id], ...value };
            return next;
          });
          setError(''); setNotice(t(`تم اختيار «${theme.nameAr}» للمسودة. راجع المعاينة ثم احفظ.`, `“${theme.nameEn}” selected for this draft. Review the preview, then save.`));
          themePreviewRef.current?.scrollIntoView({ block: 'start' });
        }} />
        </div>
        <div ref={themePreviewRef} className="scroll-mt-24 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-white">{t('معاينة اختيارك وتخصيصه', 'Preview & customize your selection')}</h3><Button type="button" variant="secondary" className="min-h-11" onClick={() => libraryRef.current?.scrollIntoView({ block: 'start' })}>{t('اختيار ثيم آخر', 'Choose another theme')}</Button></div>
        {!draftControls.banner_hero_visible?.visible && <p role="status" className="rounded-lg border border-amber-500/30 p-3 text-sm text-amber-200">{t('البانر مخفي حالياً. فعّل ظهوره من «النصوص والظهور» حتى يظهر الثيم للزبائن بعد الحفظ.', 'The banner is currently hidden. Enable it in Text & visibility to show the theme to customers after saving.')}</p>}
        {languagePicker}
        <HeroAppearanceEditor isAr={isAr} previewIsAr={language === 'ar'} controls={draftControls} onChange={patchControl} />
        </div>
      </>}
      {section === 'content' && <section className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <label className="flex min-h-11 items-center justify-between gap-3 text-sm text-slate-200"><span>{t('إظهار البانر الرئيسي للزبائن', 'Show the main storefront banner')}</span><input type="checkbox" checked={draftControls.banner_hero_visible?.visible ?? true} onChange={e => patchControl('banner_hero_visible', { visible: e.target.checked })} className="h-5 w-5 accent-blue-600" /></label>
        {languagePicker}
        {[['banner_hero_title', 'عنوان البانر', 'Banner headline'], ['banner_hero_subtitle', 'النص الوصفي', 'Description'], ['banner_hero_tag', 'النص الصغير أعلى العنوان', 'Small label above headline'], ['banner_hero_btn', 'نص زر التصفح', 'Browse button label']].map(([id, ar, en], index) => <label key={id} className="block space-y-2 text-sm text-slate-300"><span>{t(ar, en)} · {language === 'ar' ? 'العربية' : 'English'}</span><textarea rows={index < 2 ? 3 : 1} maxLength={1000} dir={language === 'ar' ? 'rtl' : 'ltr'} value={draftControls[id]?.[language === 'ar' ? 'label_ar' : 'label_en'] || ''} onChange={e => patchControl(id, { [language === 'ar' ? 'label_ar' : 'label_en']: e.target.value })} className="block min-h-11 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-blue-500 focus:outline-none" /></label>)}
        <p className="text-xs text-slate-500">{t('زر البانر يفتح قسم العروض حسب سلوك المتجر الحالي. معاينة الصورة والنص موجودة بقسم الصورة والمظهر.', 'The banner button opens offers using the current storefront behavior. Preview image and text in Image & appearance.')}</p>
      </section>}
      {section === 'appearance' && <section className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <div><h3 className="font-bold text-white">{t('صورة البانر', 'Banner image')}</h3><p className="mt-1 text-xs leading-5 text-slate-400">{t('يفضل 1920 × 600 بكسل. موضع الصورة والتدرّج يحددان الجزء الظاهر على الجوال والكمبيوتر.', 'Recommended 1920 × 600 px. Image position and fade control the visible crop on phone and desktop.')}</p></div>
        {imageInput()}
        <Input label={t('أو رابط صورة مباشر', 'Or a direct image URL')} dir="ltr" value={draftControls.banner_hero_bg?.actionValue?.startsWith('data:') ? '' : draftControls.banner_hero_bg?.actionValue || ''} placeholder="https://..." onChange={e => patchControl('banner_hero_bg', { actionValue: e.target.value.trim() })} className="min-h-11" />
        <p className="text-xs text-slate-500">{t('ترك الرابط فارغاً يرجع الصورة الافتراضية. لإخفاء الصورة، اجعل ظهور الصورة 0% في إعدادات الحجم والموضع.', 'An empty URL uses the default image. Set image opacity to 0% to hide photography.')}</p>
        {languagePicker}
        <HeroAppearanceEditor isAr={isAr} previewIsAr={language === 'ar'} controls={draftControls} onChange={patchControl} />
      </section>}
      {section === 'trends' && <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-white">{t('بطاقات الموسم', 'Seasonal cards')}</h3><p className="mt-1 text-xs text-slate-400">{t('تعديل كل بطاقة بصورة مستقلة؛ التصنيف وترتيب البطاقات يبقيان كما هما.', 'Edit each card independently; category mapping and order are preserved.')}</p></div>{languagePicker}</div>
        <div className="grid gap-4 xl:grid-cols-2">{draftTrends.map(row => <article key={row.id} className="min-w-0 space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4"><h4 className="font-bold text-white">{language === 'ar' ? row.titleAr : row.titleEn}</h4><img src={row.image || HERO_BANNER_IMAGE} alt={language === 'ar' ? row.titleAr : row.titleEn} className="aspect-[4/3] w-full rounded-lg bg-slate-950 object-cover" />{imageInput(row.id)}
          <Input id={`${row.id}-image-url`} label={t('رابط صورة البطاقة', 'Card image URL')} dir="ltr" value={row.image?.startsWith('data:') ? '' : row.image} onChange={e => patchTrend(row.id, { image: e.target.value.trim() })} className="min-h-11" />
          {[[language === 'ar' ? 'titleAr' : 'titleEn', 'العنوان', 'Title'], [language === 'ar' ? 'subtitleAr' : 'subtitleEn', 'الوصف المختصر', 'Short description'], [language === 'ar' ? 'tagAr' : 'tagEn', 'الشارة', 'Badge']].map(([key, ar, en]) => <Input key={key} id={`${row.id}-${key}`} label={`${t(ar, en)} · ${language === 'ar' ? 'العربية' : 'English'}`} dir={language === 'ar' ? 'rtl' : 'ltr'} value={String(row[key as keyof typeof row] || '')} maxLength={1000} onChange={e => patchTrend(row.id, { [key]: e.target.value })} className="min-h-11" />)}
        </article>)}</div>{!draftTrends.length && <p role="status" className="p-5 text-slate-400">{t('لا توجد بطاقات موسم محفوظة.', 'No seasonal cards saved.')}</p>}
      </section>}
    </fieldset>
    <footer className="sticky bottom-0 z-20 space-y-3 rounded-xl border border-slate-700 bg-slate-950/95 p-3 backdrop-blur-sm">
      <p className="text-xs text-slate-400">{dirty ? t('تعديلات غير محفوظة · احفظ قبل مغادرة الصفحة.', 'Unsaved changes · save before leaving this page.') : t('لا توجد تغييرات غير محفوظة.', 'No unsaved changes.')}</p>
      {notice && <p role="status" className="text-sm text-blue-300">{notice}</p>}{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      <div className="flex gap-2"><Button type="button" disabled={!dirty} isLoading={busy} onClick={save} className="min-h-11">{t('حفظ التغييرات', 'Save changes')}</Button><Button type="button" variant="secondary" disabled={busy || !dirty} onClick={() => { setEdits({}); setTrendEdits({}); setError(''); setNotice(''); }} className="min-h-11">{t('إلغاء المسودة', 'Discard draft')}</Button></div>
    </footer>
  </div>;
};
export default AdminBannersView;

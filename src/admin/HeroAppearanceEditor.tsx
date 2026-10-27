import { useState, type CSSProperties } from 'react';
import { useSiteControls } from '../context/SiteControlsContext';
import HeroBannerBackground from '../components/HeroBannerBackground';
import { HERO_BANNER_IMAGE } from '../lib/constants';
import { DEFAULT_HERO_APPEARANCE, HERO_APPEARANCE_CONTROL, parseHeroAppearance, heroBackgroundVariables, type HeroAppearance } from '../lib/heroAppearance';

export default function HeroAppearanceEditor({ isAr }: { isAr: boolean }) {
  const { getControl, updateControl } = useSiteControls();
  const settings = parseHeroAppearance(getControl(HERO_APPEARANCE_CONTROL).actionValue);
  const [previewDark, setPreviewDark] = useState(true);
  const [mobile, setMobile] = useState(false);
  const image = getControl('banner_hero_bg').actionValue || HERO_BANNER_IMAGE;
  const set = (patch: Partial<HeroAppearance>) => updateControl(HERO_APPEARANCE_CONTROL, { actionValue: JSON.stringify(parseHeroAppearance(JSON.stringify({ ...settings, ...patch }))) });
  const directionOptions = [['caption', 'من جهة النص تلقائياً', 'From caption (auto)'], ['left', 'من اليسار', 'From left'], ['right', 'من اليمين', 'From right'], ['top', 'من الأعلى', 'From top'], ['bottom', 'من الأسفل', 'From bottom'], ['custom', 'زاوية مخصصة', 'Custom angle']];
  const slider = (key: keyof HeroAppearance, ar: string, en: string, min = 0, max = 100, unit = '%') => (
    <label key={key} className="block space-y-2 text-xs text-slate-300">
      <span className="flex justify-between gap-3"><span>{isAr ? ar : en}</span><output className="font-mono text-blue-300" dir="ltr">{String(settings[key])}{unit}</output></span>
      <input aria-label={isAr ? ar : en} className="w-full accent-blue-500 cursor-pointer" dir="ltr" type="range" min={min} max={max} value={Number(settings[key])} onChange={(e) => set({ [key]: Number(e.target.value) })} />
    </label>
  );

  return (
    <section aria-label={isAr ? 'تخصيص صورة وتدرّج البانر' : 'Banner image and fade editor'} className="space-y-5 border-t border-slate-700 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="font-bold text-white">{isAr ? 'الصورة والتدرّج' : 'Image & fade'}</h3><p className="mt-1 text-xs text-slate-400">{isAr ? 'معاينة بنفس طبقات المتجر. التغييرات تُحفظ تلقائياً، وإعدادات الموبايل مستقلة.' : 'Uses the storefront layers. Changes save automatically; mobile has its own settings.'}</p></div>
        <button type="button" onClick={() => set(DEFAULT_HERO_APPEARANCE)} className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200">{isAr ? 'إعادة ضبط المظهر' : 'Reset appearance'}</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={previewDark} onClick={() => setPreviewDark(!previewDark)} className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200">{isAr ? (previewDark ? 'معاينة فاتحة' : 'معاينة داكنة') : (previewDark ? 'Preview light' : 'Preview dark')}</button>
        <button type="button" aria-pressed={mobile} onClick={() => setMobile(!mobile)} className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200">{isAr ? (mobile ? 'معاينة الكمبيوتر' : 'معاينة الموبايل') : (mobile ? 'Preview desktop' : 'Preview mobile')}</button>
        <button type="button" onClick={() => set({ startOpacity: 98, middleOpacity: 90, endOpacity: 12, middle: 55 })} className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200">{isAr ? 'أولوية وضوح النص' : 'Caption first'}</button>
        <button type="button" onClick={() => set({ startOpacity: 90, middleOpacity: 55, endOpacity: 0, middle: 35 })} className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200">{isAr ? 'إظهار الصورة أكثر' : 'More photography'}</button>
      </div>
      <div data-hero-preview-theme={previewDark ? 'dark' : 'light'} className={`${mobile ? 'hero-preview-mobile max-w-[390px]' : ''} mx-auto w-full`}>
        <div data-hero-preview dir={isAr ? 'rtl' : 'ltr'} className="hero-editorial relative flex items-center overflow-hidden rounded-2xl border border-slate-600 p-5" style={{ ...heroBackgroundVariables(settings, isAr), backgroundColor: previewDark ? '#0d0f14' : '#ffffff', color: previewDark ? '#ffffff' : '#15171c' } as CSSProperties}>
          <HeroBannerBackground image={image} settings={settings} isAr={isAr} />
          <div className="relative z-10 max-w-[75%] space-y-3">
            <p className="text-xs">{isAr ? getControl('banner_hero_tag').label_ar : getControl('banner_hero_tag').label_en}</p>
            <h4 className="text-xl font-bold leading-relaxed">{isAr ? getControl('banner_hero_title').label_ar : getControl('banner_hero_title').label_en}</h4>
            <p className="text-xs leading-6">{isAr ? getControl('banner_hero_subtitle').label_ar : getControl('banner_hero_subtitle').label_en}</p>
          </div>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-200"><input type="checkbox" checked={settings.fadeEnabled} onChange={(e) => set({ fadeEnabled: e.target.checked })} className="accent-blue-500" />{isAr ? 'تفعيل تدرّج حماية النص' : 'Enable caption fade'}</label>
      <fieldset className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><legend className="mb-4 text-sm font-semibold text-white">{isAr ? 'اتجاه التدرّج وألوانه' : 'Fade direction & colors'}</legend>
        {(['direction', 'mobileDirection'] as const).map((key) => <label key={key} className="space-y-2 text-xs text-slate-300"><span>{isAr ? (key === 'direction' ? 'الاتجاه على الكمبيوتر' : 'الاتجاه على الموبايل') : (key === 'direction' ? 'Desktop direction' : 'Mobile direction')}</span><select aria-label={isAr ? (key === 'direction' ? 'اتجاه تدرّج الكمبيوتر' : 'اتجاه تدرّج الموبايل') : key} value={settings[key]} onChange={(e) => set({ [key]: e.target.value })} className="w-full rounded-lg border border-slate-600 bg-slate-900 p-2.5">{directionOptions.map(([value, ar, en]) => <option key={value} value={value}>{isAr ? ar : en}</option>)}</select></label>)}
        {settings.direction === 'custom' && slider('angle', 'زاوية الكمبيوتر', 'Desktop angle', 0, 360, '°')}
        {settings.mobileDirection === 'custom' && slider('mobileAngle', 'زاوية الموبايل', 'Mobile angle', 0, 360, '°')}
        {(['lightColor', 'darkColor'] as const).map((key) => <label key={key} className="flex items-center justify-between gap-3 text-xs text-slate-300"><span>{isAr ? (key === 'lightColor' ? 'لون التدرّج بالوضع الفاتح' : 'لون التدرّج بالوضع الداكن') : (key === 'lightColor' ? 'Light theme fade color' : 'Dark theme fade color')}</span><input aria-label={key} type="color" value={settings[key]} onChange={(e) => set({ [key]: e.target.value })} className="h-9 w-12 cursor-pointer rounded" /></label>)}
      </fieldset>
      <fieldset className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><legend className="mb-4 text-sm font-semibold text-white">{isAr ? 'نقاط التدرّج — من جهة النص إلى الصورة' : 'Fade stops — from caption to image'}</legend>
        {slider('start', 'موضع بداية التدرّج', 'Fade start')}{slider('middle', 'موضع منتصف التدرّج', 'Fade middle')}{slider('end', 'موضع نهاية التدرّج', 'Fade end')}
        {slider('startOpacity', 'كثافة البداية', 'Start opacity')}{slider('middleOpacity', 'كثافة المنتصف', 'Middle opacity')}{slider('endOpacity', 'كثافة النهاية', 'End opacity')}
        {slider('mobileStartOpacity', 'كثافة البداية — موبايل', 'Mobile start opacity')}{slider('mobileMiddleOpacity', 'كثافة المنتصف — موبايل', 'Mobile middle opacity')}{slider('mobileEndOpacity', 'كثافة النهاية — موبايل', 'Mobile end opacity')}
      </fieldset>
      <fieldset className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><legend className="mb-4 text-sm font-semibold text-white">{isAr ? 'ضبط الصورة والأبعاد' : 'Image & dimensions'}</legend>
        {slider('imageOpacity', 'ظهور الصورة', 'Image opacity')}{slider('brightness', 'إضاءة الصورة', 'Brightness', 30, 150)}{slider('contrast', 'تباين الصورة', 'Contrast', 50, 150)}
        {slider('zoom', 'تكبير الصورة', 'Image zoom', 100, 160)}{slider('blur', 'تمويه الصورة', 'Image blur', 0, 20, 'px')}
        {slider('positionX', 'موضع الصورة الأفقي — كمبيوتر', 'Desktop image X')}{slider('positionY', 'موضع الصورة العمودي — كمبيوتر', 'Desktop image Y')}
        {slider('mobilePositionX', 'موضع الصورة الأفقي — موبايل', 'Mobile image X')}{slider('mobilePositionY', 'موضع الصورة العمودي — موبايل', 'Mobile image Y')}
        {slider('height', 'ارتفاع البانر — كمبيوتر', 'Desktop height', 200, 600, 'px')}{slider('mobileHeight', 'ارتفاع البانر — موبايل', 'Mobile height', 240, 640, 'px')}
      </fieldset>
    </section>
  );
}

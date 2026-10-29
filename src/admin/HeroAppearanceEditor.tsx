import { useState, type CSSProperties } from 'react';
import { DEFAULT_SITE_CONTROLS } from '../context/defaultSiteControls';
import type { SiteControlItem } from '../context/siteControlsTypes';
import HeroBannerBackground from '../components/HeroBannerBackground';
import { HERO_BANNER_IMAGE } from '../lib/constants';
import { DEFAULT_HERO_APPEARANCE, HERO_APPEARANCE_CONTROL, parseHeroAppearance, heroBackgroundVariables, type HeroAppearance } from '../lib/heroAppearance';

export default function HeroAppearanceEditor({ isAr, previewIsAr, controls, onChange }: { isAr: boolean; previewIsAr: boolean; controls: Record<string, SiteControlItem>; onChange: (id: string, patch: Partial<SiteControlItem>) => void }) {
  const getControl = (id: string) => controls[id] || DEFAULT_SITE_CONTROLS[id];
  const settings = parseHeroAppearance(getControl(HERO_APPEARANCE_CONTROL).actionValue);
  const [previewDark, setPreviewDark] = useState(true);
  const [mobile, setMobile] = useState(false);
  const image = getControl('banner_hero_bg').actionValue || HERO_BANNER_IMAGE;
  const set = (patch: Partial<HeroAppearance>) => onChange(HERO_APPEARANCE_CONTROL, { actionValue: JSON.stringify(parseHeroAppearance(JSON.stringify({ ...settings, ...patch }))) });
  const directionOptions = [['caption', 'من جهة النص تلقائياً', 'From caption (auto)'], ['left', 'من اليسار', 'From left'], ['right', 'من اليمين', 'From right'], ['top', 'من الأعلى', 'From top'], ['bottom', 'من الأسفل', 'From bottom'], ['custom', 'زاوية مخصصة', 'Custom angle']];
  const slider = (key: keyof HeroAppearance, ar: string, en: string, min = 0, max = 100, unit = '%') => (
    <label key={key} className="block space-y-2 text-xs text-slate-300">
      <span className="flex justify-between gap-3"><span>{isAr ? ar : en}</span><output className="font-mono text-blue-300" dir="ltr">{String(settings[key])}{unit}</output></span>
      <input aria-label={isAr ? ar : en} className="min-h-11 w-full accent-blue-500 cursor-pointer" dir="ltr" type="range" min={min} max={max} value={Number(settings[key])} onChange={(e) => set({ [key]: Number(e.target.value) })} />
    </label>
  );

  return (
    <section aria-label={isAr ? 'تخصيص صورة وتدرّج البانر' : 'Banner image and fade editor'} className="space-y-5 border-t border-slate-700 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="font-bold text-white">{isAr ? 'الصورة والتدرّج' : 'Image & fade'}</h3><p className="mt-1 text-xs text-slate-400">{isAr ? 'معاينة محلية بنفس طبقات المتجر. التغييرات لا تُنشر حتى تضغط حفظ. إعدادات الجوال مستقلة.' : 'Local preview using the storefront layers. Publish with Save; mobile settings are separate.'}</p></div>
        <button type="button" onClick={() => set(DEFAULT_HERO_APPEARANCE)} className="min-h-11 rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200">{isAr ? 'إعادة ضبط المظهر' : 'Reset appearance'}</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setPreviewDark(!previewDark)} className="min-h-11 rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200">{isAr ? (previewDark ? 'معاينة فاتحة' : 'معاينة داكنة') : (previewDark ? 'Preview light' : 'Preview dark')}</button>
        <button type="button" onClick={() => setMobile(!mobile)} className="min-h-11 rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200">{isAr ? (mobile ? 'معاينة الكمبيوتر' : 'معاينة الموبايل') : (mobile ? 'Preview desktop' : 'Preview mobile')}</button>
        <button type="button" onClick={() => set(mobile ? { mobileStartOpacity: 98, mobileMiddleOpacity: 90, mobileEndOpacity: 65 } : { startOpacity: 98, middleOpacity: 90, endOpacity: 12 })} className="min-h-11 rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200">{isAr ? 'أولوية وضوح النص' : 'Caption first'}</button>
        <button type="button" onClick={() => set(mobile ? { mobileStartOpacity: 90, mobileMiddleOpacity: 55, mobileEndOpacity: 15 } : { startOpacity: 90, middleOpacity: 55, endOpacity: 0 })} className="min-h-11 rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200">{isAr ? 'إظهار الصورة أكثر' : 'More photography'}</button>
      </div>
      <div data-hero-preview-theme={previewDark ? 'dark' : 'light'} className={`${mobile ? 'hero-preview-mobile max-w-[390px]' : ''} mx-auto w-full`}>
        <div data-hero-preview dir={previewIsAr ? 'rtl' : 'ltr'} className="hero-editorial relative flex items-center overflow-hidden rounded-2xl border border-slate-600 p-5" style={{ ...heroBackgroundVariables(settings, previewIsAr), backgroundColor: previewDark ? '#0d0f14' : '#ffffff', color: previewDark ? '#ffffff' : '#15171c' } as CSSProperties}>
          <HeroBannerBackground image={image} settings={settings} isAr={previewIsAr} />
          <div className="relative z-10 max-w-[75%] break-words space-y-3">
            <p className="text-xs">{previewIsAr ? getControl('banner_hero_tag').label_ar : getControl('banner_hero_tag').label_en}</p>
            <h4 className="text-xl font-bold leading-relaxed">{previewIsAr ? getControl('banner_hero_title').label_ar : getControl('banner_hero_title').label_en}</h4>
            <p className="text-xs leading-6">{previewIsAr ? getControl('banner_hero_subtitle').label_ar : getControl('banner_hero_subtitle').label_en}</p>
            {getControl('banner_hero_btn').visible && <span className={`inline-flex min-h-11 items-center rounded-full px-4 text-xs font-bold ${previewDark ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'}`}>{previewIsAr ? getControl('banner_hero_btn').label_ar : getControl('banner_hero_btn').label_en}</span>}
          </div>
        </div>
      </div>
      <details className="rounded-xl border border-slate-700 p-4"><summary className="min-h-11 cursor-pointer text-sm font-semibold text-white">{isAr ? 'زخرفة الثيم ولونه' : 'Theme decoration & accent'}</summary><div className="mt-4 grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-xs text-slate-300"><span>{isAr ? 'زخرفة المناسبة' : 'Occasion decoration'}</span><select aria-label={isAr ? 'زخرفة المناسبة' : 'Occasion decoration'} value={settings.motif} onChange={e => set({ motif: e.target.value as HeroAppearance['motif'] })} className="min-h-11 w-full rounded-lg border border-slate-600 bg-slate-900 p-2.5">{[['none', 'بدون زخرفة', 'None'], ['snow', 'ثلج', 'Snow'], ['sun', 'شمس', 'Sun'], ['bloom', 'زهرة', 'Flower'], ['leaf', 'ورقة خريف', 'Autumn leaf'], ['celebration', 'نجوم احتفالية', 'Celebration stars'], ['crescent', 'هلال', 'Crescent'], ['gift', 'هدية', 'Gift'], ['sale', 'بطاقة عرض', 'Offer tag'], ['school', 'دراسة', 'Study']].map(([id, ar, en]) => <option key={id} value={id}>{isAr ? ar : en}</option>)}</select></label>
        <label className="flex min-h-11 items-center justify-between gap-3 text-xs text-slate-300"><span>{isAr ? 'لون الزخرفة' : 'Decoration color'}</span><input aria-label={isAr ? 'لون الزخرفة' : 'Decoration color'} type="color" value={settings.accentColor} onChange={e => set({ accentColor: e.target.value })} className="h-11 w-12 rounded" /></label>
        {slider('motifOpacity', 'وضوح الزخرفة', 'Decoration opacity')}
      </div></details>
      <label className="flex min-h-11 items-center gap-2 text-sm text-slate-200"><input type="checkbox" checked={settings.fadeEnabled} onChange={(e) => set({ fadeEnabled: e.target.checked })} className="accent-blue-500" />{isAr ? 'تفعيل تدرّج حماية النص' : 'Enable caption fade'}</label>
      <details className="rounded-xl border border-slate-700 p-4"><summary className="min-h-11 cursor-pointer text-sm font-semibold text-white">{isAr ? 'اتجاه التدرّج وألوانه' : 'Fade direction & colors'}</summary><div className="mt-4 grid gap-5 sm:grid-cols-2">
        {(['direction', 'mobileDirection'] as const).map((key) => <label key={key} className="space-y-2 text-xs text-slate-300"><span>{isAr ? (key === 'direction' ? 'الاتجاه على الكمبيوتر' : 'الاتجاه على الموبايل') : (key === 'direction' ? 'Desktop direction' : 'Mobile direction')}</span><select aria-label={isAr ? (key === 'direction' ? 'اتجاه تدرّج الكمبيوتر' : 'اتجاه تدرّج الموبايل') : key} value={settings[key]} onChange={(e) => set({ [key]: e.target.value })} className="w-full rounded-lg border border-slate-600 bg-slate-900 p-2.5">{directionOptions.map(([value, ar, en]) => <option key={value} value={value}>{isAr ? ar : en}</option>)}</select></label>)}
        {settings.direction === 'custom' && slider('angle', 'زاوية الكمبيوتر', 'Desktop angle', 0, 360, '°')}
        {settings.mobileDirection === 'custom' && slider('mobileAngle', 'زاوية الموبايل', 'Mobile angle', 0, 360, '°')}
        {(['lightColor', 'darkColor'] as const).map((key) => <label key={key} className="flex items-center justify-between gap-3 text-xs text-slate-300"><span>{isAr ? (key === 'lightColor' ? 'لون التدرّج بالوضع الفاتح' : 'لون التدرّج بالوضع الداكن') : (key === 'lightColor' ? 'Light theme fade color' : 'Dark theme fade color')}</span><input aria-label={isAr ? (key === 'lightColor' ? 'لون التدرّج بالوضع الفاتح' : 'لون التدرّج بالوضع الداكن') : (key === 'lightColor' ? 'Light theme fade color' : 'Dark theme fade color')} type="color" value={settings[key]} onChange={(e) => set({ [key]: e.target.value })} className="h-11 w-12 cursor-pointer rounded" /></label>)}
      </div></details>
      <details className="rounded-xl border border-slate-700 p-4"><summary className="min-h-11 cursor-pointer text-sm font-semibold text-white">{isAr ? 'نقاط التدرّج — من جهة النص إلى الصورة' : 'Fade stops — from caption to image'}</summary><div className="mt-4 grid gap-5 sm:grid-cols-2">
        {slider('start', 'موضع بداية التدرّج', 'Fade start')}{slider('middle', 'موضع منتصف التدرّج', 'Fade middle')}{slider('end', 'موضع نهاية التدرّج', 'Fade end')}
        {slider('startOpacity', 'كثافة البداية', 'Start opacity')}{slider('middleOpacity', 'كثافة المنتصف', 'Middle opacity')}{slider('endOpacity', 'كثافة النهاية', 'End opacity')}
        {slider('mobileStartOpacity', 'كثافة البداية — موبايل', 'Mobile start opacity')}{slider('mobileMiddleOpacity', 'كثافة المنتصف — موبايل', 'Mobile middle opacity')}{slider('mobileEndOpacity', 'كثافة النهاية — موبايل', 'Mobile end opacity')}
      </div></details>
      <details className="rounded-xl border border-slate-700 p-4"><summary className="min-h-11 cursor-pointer text-sm font-semibold text-white">{isAr ? 'ضبط الصورة والأبعاد' : 'Image & dimensions'}</summary><div className="mt-4 grid gap-5 sm:grid-cols-2">
        {slider('imageOpacity', 'ظهور الصورة', 'Image opacity')}{slider('brightness', 'إضاءة الصورة', 'Brightness', 30, 150)}{slider('contrast', 'تباين الصورة', 'Contrast', 50, 150)}
        {slider('zoom', 'تكبير الصورة', 'Image zoom', 100, 160)}{slider('blur', 'تمويه الصورة', 'Image blur', 0, 20, 'px')}
        {slider('positionX', 'موضع الصورة الأفقي — كمبيوتر', 'Desktop image X')}{slider('positionY', 'موضع الصورة العمودي — كمبيوتر', 'Desktop image Y')}
        {slider('mobilePositionX', 'موضع الصورة الأفقي — موبايل', 'Mobile image X')}{slider('mobilePositionY', 'موضع الصورة العمودي — موبايل', 'Mobile image Y')}
        {slider('height', 'ارتفاع البانر — كمبيوتر', 'Desktop height', 200, 600, 'px')}{slider('mobileHeight', 'ارتفاع البانر — موبايل', 'Mobile height', 240, 640, 'px')}
      </div></details>
    </section>
  );
}

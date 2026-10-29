import { useState } from 'react';
import { Check, Palette } from 'lucide-react';
import HeroBannerBackground from '../components/HeroBannerBackground';
import { BANNER_THEMES, themeAppearance, type BannerTheme, type ThemeCategory } from '../lib/bannerThemes';
import { parseHeroAppearance } from '../lib/heroAppearance';

export default function BannerThemeLibrary({ isAr, image, appearance, onSelect }: { isAr: boolean; image: string; appearance?: string; onSelect: (theme: BannerTheme, includeCopy: boolean) => void }) {
  const [category, setCategory] = useState<ThemeCategory | 'all'>('all');
  const [includeCopy, setIncludeCopy] = useState(false);
  const current = parseHeroAppearance(appearance);
  const themes = BANNER_THEMES.filter(theme => category === 'all' || theme.category === category);
  const t = (ar: string, en: string) => isAr ? ar : en;
  return <section aria-label={t('مكتبة الثيمات الموسمية', 'Seasonal theme library')} className="min-w-0 space-y-4">
    <div className="rounded-xl border border-blue-500/20 bg-slate-900 p-4 sm:p-5">
      <div className="flex items-center gap-2"><Palette className="h-5 w-5 text-blue-400" /><h3 className="font-bold text-white">{t('موسم جديد، نفس هوية فانت', 'A new season, the same VANT identity')}</h3></div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{t('12 ثيماً جاهزاً للبانر وهوية المتجر بالكامل. اختَر ثم خصّص الألوان والتفاصيل واحفظ ثيمك الخاص أدناه. صورتك وموضعها يبقيان كما هما؛ النشر بزر الحفظ فقط.', '12 themes for the banner and the whole store. Choose, customize the palette and details, and save your own theme below. Your photo and crop are preserved; publish only with Save.')}</p>
      <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-200"><input type="checkbox" checked={includeCopy} onChange={e => setIncludeCopy(e.target.checked)} className="h-5 w-5 shrink-0 accent-blue-600" /><span>{t('استبدال نصوص البانر أيضاً بنصوص الثيم باللغتين', 'Also replace both languages of banner copy with theme copy')}</span></label>
      <p className="mt-1 text-xs leading-5 text-slate-500">{t('الثيم لا يغيّر الأسعار. حدّد القطع أو العروض المرتبطة بزر البانر من «وجهة زر البانر»، واحفظ نسختك من «هوية المتجر وثيماتي».', 'Themes do not change prices. Select linked pieces in Banner destination and save your own preset in Store identity & my themes.')}</p>
    </div>
    <div role="group" aria-label={t('تصفية الثيمات', 'Filter themes')} className="grid grid-cols-2 gap-2 sm:grid-cols-4">{([['all', 'الكل', 'All'], ['seasons', 'الفصول', 'Seasons'], ['occasions', 'المناسبات', 'Occasions'], ['offers', 'العروض', 'Offers']] as const).map(([id, ar, en]) => <button key={id} type="button" aria-pressed={category === id} onClick={() => setCategory(id)} className={`min-h-11 rounded-lg border px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${category === id ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'}`}>{t(ar, en)}</button>)}</div>
    <div className="grid min-w-0 grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-3">{themes.map(theme => {
      const selected = current.motif === theme.motif && current.accentColor === theme.accent && current.lightColor === theme.light && current.darkColor === theme.dark;
      return <button type="button" key={theme.id} aria-label={`${t('اختيار ثيم', 'Choose theme')} ${t(theme.nameAr, theme.nameEn)}`} aria-pressed={selected} onClick={() => onSelect(theme, includeCopy)} className={`min-w-0 overflow-hidden rounded-xl border text-start transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${selected ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-700 hover:border-slate-400'}`}>
        <div data-hero-preview-theme="dark" className="relative h-28 overflow-hidden bg-slate-950"><HeroBannerBackground image={image} settings={themeAppearance(theme)} isAr={isAr} /><span className="absolute inset-x-4 bottom-4 max-w-[60%] text-xs font-bold leading-5 text-white">{t(theme.titleAr, theme.titleEn)}</span></div>
        <div className="flex min-h-16 items-center justify-between gap-2 bg-slate-900 px-3 py-3"><span className="min-w-0"><span className="block text-sm font-semibold text-white">{t(theme.nameAr, theme.nameEn)}</span><span className="mt-1 block text-xs text-slate-400">{selected ? t('النمط الحالي · قابل للتعديل', 'Current style · editable') : t('اختيار ومعاينة', 'Choose & preview')}</span></span>{selected ? <Check className="h-5 w-5 shrink-0 text-blue-400" /> : <span className="h-4 w-4 shrink-0 rounded-full border border-white/20" style={{ backgroundColor: theme.accent }} />}</div>
      </button>;
    })}</div>
  </section>;
}

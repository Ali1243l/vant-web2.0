import React, { useEffect, useState } from 'react';
import { Check, Eye, Settings, Wrench, Shirt, CheckCircle2 } from 'lucide-react';
import { useAdminBridge } from './useAdminBridge';
import { useSiteControls } from '../context/SiteControlsContext';
import { supabase } from '../lib/supabase';
import { generalSettingsPatch, validGeneralSettings } from '../lib/generalSettings';
import StudioMotifGraphic from '../components/splash/StudioMotifGraphic';
import MaintenanceScreen from '../components/MaintenanceScreen';
import SplashLoader, { AVAILABLE_SPLASH_MOTIFS } from '../components/SplashLoader';
import { Button, Card, Input, Switch } from './ui';

export const SettingsView: React.FC = () => {
  const { lang, setActiveView, setHasUnsavedChanges } = useAdminBridge();
  const { siteSettings, updateSiteSettings } = useSiteControls();
  const isAr = lang === 'ar';
  const [base, setBase] = useState(siteSettings);
  const [draft, setDraft] = useState(siteSettings);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [maintenancePreview, setMaintenancePreview] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [notice, setNotice] = useState('');
  const dirty = Object.keys(generalSettingsPatch(draft, base)).length > 0;
  useEffect(() => { if (!dirty) { setBase(siteSettings); setDraft(siteSettings); } }, [siteSettings, dirty]);
  useEffect(() => { setHasUnsavedChanges(dirty); return () => setHasUnsavedChanges(false); }, [dirty, setHasUnsavedChanges]);
  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);
  const edit = (patch: Partial<typeof draft>) => { setDraft(current => ({ ...current, ...patch })); setNotice(''); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || !dirty) return;
    if (!validGeneralSettings(draft)) { setNotice(isAr ? 'راجع النصوص المطلوبة وحدود عدد الأحرف.' : 'Check required texts and character limits.'); return; }
    setSaving(true);
    try {
      if (!await updateSiteSettings(generalSettingsPatch(draft, base))) throw new Error('save');
      setBase(draft);
      setNotice(supabase ? (isAr ? 'تم حفظ الإعدادات في قاعدة البيانات.' : 'Settings saved to database.') : (isAr ? 'تم الحفظ على هذا المتصفح فقط.' : 'Saved in this browser only.'));
    } catch { setNotice(isAr ? 'تعذّر الحفظ. مسودتك باقية؛ حاول مرة ثانية.' : 'Save failed. Your draft remains; retry.'); }
    finally { setSaving(false); }
  };
  return <form onSubmit={save} className="min-w-0 max-w-5xl space-y-5 pb-6">
    <Card className="space-y-3">
      <div className="flex items-center gap-3"><Settings className="text-indigo-400 shrink-0" /><h2 className="text-xl font-bold text-white">{isAr ? 'إعدادات المتجر' : 'Store settings'}</h2></div>
      <p className="text-sm text-slate-400">{isAr ? 'عدّل، عاين، ثم احفظ. الصيانة لا تُطبّق قبل الحفظ.' : 'Edit, preview, then save. Maintenance applies only after saving.'}</p>
      <p className="text-xs text-slate-300">{isAr ? 'الحالة المنشورة: ' : 'Published status: '}{siteSettings.maintenance_mode ? (isAr ? 'قيد الصيانة' : 'Maintenance') : (isAr ? 'المتجر مفتوح' : 'Store open')}</p>
    </Card>
    <fieldset disabled={saving} className="min-w-0 space-y-5">
      <Card className="min-w-0 overflow-hidden space-y-5 border-indigo-500/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3"><span className="rounded-xl border border-indigo-500/25 bg-indigo-500/10 p-3 text-indigo-400"><Wrench size={20} /></span><div><h3 className="text-lg font-bold text-white">{isAr ? 'واجهة صيانة المتجر' : 'Store maintenance page'}</h3><p className="mt-1 text-xs leading-6 text-slate-400">{isAr ? 'رسالة واضحة للزائر أثناء التوقف المؤقت. عدّل النصوص ثم عاين قبل التطبيق.' : 'A clear visitor message during a temporary pause. Edit and preview before applying.'}</p></div></div>
          <Button type="button" variant="outline" className="min-h-11" leftIcon={<Eye size={16} />} onClick={() => setMaintenancePreview(true)}>{isAr ? 'معاينة واجهة الصيانة' : 'Preview maintenance page'}</Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-700/70 bg-slate-950/50 p-4">
          <div><p className="text-sm font-semibold text-slate-200">{isAr ? 'حالة المتجر بعد الحفظ' : 'Store state after saving'}</p><p className="mt-1 text-xs text-slate-400">{draft.maintenance_mode ? (isAr ? 'ستظهر واجهة الصيانة للزوّار.' : 'Visitors will see the maintenance page.') : (isAr ? 'المتجر متاح للزوّار.' : 'The store is open to visitors.')}</p></div>
          <Switch checked={draft.maintenance_mode} onChange={value => edit({ maintenance_mode: value })} label={isAr ? 'تفعيل الصيانة بعد الحفظ' : 'Enable maintenance on save'} />
        </div>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          {(['ar', 'en'] as const).map(language => { const key = language === 'ar' ? 'maintenance_message_ar' : 'maintenance_message'; return <div key={language} className="min-w-0"><label htmlFor={`maintenance-message-${language}`} className="mb-2 block text-xs font-medium text-slate-300">{language === 'ar' ? (isAr ? 'رسالة الصيانة بالعربية' : 'Maintenance notice · Arabic') : (isAr ? 'رسالة الصيانة بالإنجليزية' : 'Maintenance notice · English')}</label><textarea id={`maintenance-message-${language}`} dir={language === 'ar' ? 'rtl' : 'ltr'} rows={4} maxLength={600} required={draft.maintenance_mode} value={draft[key] || ''} onChange={event => edit({ [key]: event.target.value })} className="min-h-28 w-full resize-y rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm leading-7 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" /><p dir="ltr" className="mt-1 text-end text-[11px] text-slate-500">{(draft[key] || '').length} / 600</p></div>; })}
        </div>
        <p className="rounded-xl border border-indigo-500/15 bg-indigo-500/5 px-4 py-3 text-xs leading-6 text-slate-300">{isAr ? 'المعاينة تعرض هذه المسودة فقط، ولا تقفل المتجر أو ترسل رسائل. دخول الإدارة يبقى متاحاً عند تطبيق الصيانة.' : 'Preview uses this draft only. It does not close the store or send messages. Admin access remains available when maintenance is applied.'}</p>
      </Card>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-white">{isAr ? 'شاشة التحميل' : 'Loading screen'}</h3><Button type="button" variant="outline" leftIcon={<Eye className="w-4 h-4" />} onClick={() => setPreview(true)}>{isAr ? 'معاينة المسودة' : 'Preview draft'}</Button></div>
        <fieldset className="min-w-0"><legend className="mb-2 text-sm font-semibold text-slate-200">{isAr ? 'اختر نموذج التحميل' : 'Choose a loading motif'}</legend><p className="mb-4 text-xs leading-6 text-slate-400">{isAr ? 'اختيار النموذج يغيّر المسودة فقط. عاين ثم احفظ للنشر.' : 'Selecting a motif changes the draft only. Preview, then save to publish.'}</p><div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {AVAILABLE_SPLASH_MOTIFS.map(option => <label key={option.id} className={`relative flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-indigo-400 ${draft.splash_motif === option.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-950/30 hover:border-slate-500'}`}>
            <input type="radio" name="splash-motif" value={option.id} checked={draft.splash_motif === option.id} onChange={() => edit({ splash_motif: option.id })} className="sr-only" />
            <span aria-hidden="true" className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-950 p-2">{option.id === 'tshirt_print' ? <Shirt className="h-8 w-8 text-blue-300" strokeWidth={1.3} /> : <StudioMotifGraphic motif={option.id} isDark paused />}</span>
            <span className="min-w-0 flex-1"><span className="block text-xs font-semibold leading-6 text-white">{isAr ? option.titleAr : option.titleEn}</span><span className="block text-[11px] leading-5 text-slate-400">{isAr ? option.subtitleAr : option.subtitleEn}</span>{option.id === siteSettings.splash_motif && <span className="mt-1 inline-block rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">{isAr ? 'المنشور حالياً' : 'Currently published'}</span>}</span>
            <span aria-hidden="true" className="w-4 shrink-0 text-indigo-300">{draft.splash_motif === option.id && <CheckCircle2 size={16} />}</span>
          </label>)}
        </div></fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={isAr ? 'نص التحميل بالعربية' : 'Loading text · Arabic'} dir="rtl" required maxLength={120} value={draft.loading_text_ar} onChange={e => edit({ loading_text_ar: e.target.value })} />
          <Input label={isAr ? 'نص التحميل بالإنجليزية' : 'Loading text · English'} dir="ltr" required maxLength={120} value={draft.loading_text_en} onChange={e => edit({ loading_text_en: e.target.value })} />
        </div>
      </Card>
      <Card className="space-y-3"><h3 className="font-bold text-white">{isAr ? 'تخصيص أقسام المتجر' : 'Customize store sections'}</h3><p className="text-xs text-slate-400">{isAr ? 'اسم المتجر في عناصر المتجر. التواصل والنسخ الاحتياطي والأمان من التبويبات بالأعلى.' : 'Store name is in Store elements. Contact, backups and security are in the tabs above.'}</p><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setActiveView('controls')}>{isAr ? 'عناصر المتجر والهوية' : 'Store elements & identity'}</Button><Button type="button" variant="outline" onClick={() => setActiveView('banners')}>{isAr ? 'البانر والترحيب' : 'Banner & welcome'}</Button></div></Card>
    </fieldset>
    <div className="sticky bottom-0 z-10 space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
      <p role="status" className="text-sm text-slate-300">{notice || (dirty ? (isAr ? 'تغييرات غير محفوظة' : 'Unsaved changes') : (isAr ? 'كل التغييرات محفوظة' : 'All changes saved'))}</p>
      <div className="flex flex-wrap gap-2"><Button type="submit" isLoading={saving} disabled={!dirty} leftIcon={<Check className="w-4 h-4" />}>{isAr ? 'حفظ التغييرات' : 'Save changes'}</Button><Button type="button" variant="outline" disabled={!dirty || saving} onClick={() => { setDraft(siteSettings); setBase(siteSettings); setNotice(''); }}>{isAr ? 'إلغاء المسودة' : 'Discard draft'}</Button></div>
    </div>
    {maintenancePreview && <MaintenanceScreen isPreview maintenanceMessageAr={draft.maintenance_message_ar} maintenanceMessage={draft.maintenance_message} theme={previewTheme} onToggleTheme={() => setPreviewTheme(value => value === 'dark' ? 'light' : 'dark')} onClosePreview={() => setMaintenancePreview(false)} />}
    {preview && <SplashLoader isLoading={false} isPreview theme={previewTheme} onToggleTheme={() => setPreviewTheme(value => value === 'dark' ? 'light' : 'dark')} loadingTextAr={draft.loading_text_ar} loadingTextEn={draft.loading_text_en} motif={draft.splash_motif} onClosePreview={() => setPreview(false)} />}
  </form>;
};
export default SettingsView;

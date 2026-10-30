import React, { useEffect, useState } from 'react';
import { Check, Eye, Settings } from 'lucide-react';
import { useAdminBridge } from './useAdminBridge';
import { useSiteControls } from '../context/SiteControlsContext';
import { supabase } from '../lib/supabase';
import { generalSettingsPatch, validGeneralSettings } from '../lib/generalSettings';
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
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4"><h3 className="font-bold text-white">{isAr ? 'صيانة المتجر' : 'Store maintenance'}</h3><Switch checked={draft.maintenance_mode} onChange={value => edit({ maintenance_mode: value })} label={isAr ? 'تفعيل الصيانة بعد الحفظ' : 'Enable maintenance on save'} /></div>
        <p className="text-xs text-slate-400">{isAr ? 'عند التطبيق يرى الزائر رسالة الصيانة وتبقى الإدارة متاحة.' : 'When applied, visitors see the maintenance notice; admin access remains available.'}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={isAr ? 'رسالة الصيانة بالعربية' : 'Maintenance notice · Arabic'} dir="rtl" maxLength={600} required={draft.maintenance_mode} value={draft.maintenance_message_ar || ''} onChange={e => edit({ maintenance_message_ar: e.target.value })} />
          <Input label={isAr ? 'رسالة الصيانة بالإنجليزية' : 'Maintenance notice · English'} dir="ltr" maxLength={600} required={draft.maintenance_mode} value={draft.maintenance_message} onChange={e => edit({ maintenance_message: e.target.value })} />
        </div>
      </Card>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-white">{isAr ? 'شاشة التحميل' : 'Loading screen'}</h3><Button type="button" variant="outline" leftIcon={<Eye className="w-4 h-4" />} onClick={() => setPreview(true)}>{isAr ? 'معاينة المسودة' : 'Preview draft'}</Button></div>
        <label className="block text-sm text-slate-300">{isAr ? 'الرسم المتحرك' : 'Animation'}<select className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3" value={draft.splash_motif} onChange={e => edit({ splash_motif: e.target.value as typeof draft.splash_motif })}>{AVAILABLE_SPLASH_MOTIFS.map(motif => <option key={motif.id} value={motif.id}>{isAr ? motif.titleAr : motif.titleEn}</option>)}</select></label>
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
    {preview && <SplashLoader isLoading={false} isPreview loadingTextAr={draft.loading_text_ar} loadingTextEn={draft.loading_text_en} motif={draft.splash_motif} onClosePreview={() => setPreview(false)} />}
  </form>;
};
export default SettingsView;

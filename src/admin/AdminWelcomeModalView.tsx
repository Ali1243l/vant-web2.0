import React, { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import { useAdminBridge } from './useAdminBridge';
import { useSiteControls } from '../context/SiteControlsContext';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '../context/siteControlsTypes';
import { Button, Input } from './ui';
import { toEnglishDigits } from './format';
import { validateWelcomeDraft } from '../lib/bannerEditor';

const welcomeFields = (settings: SiteSettings) => ({
  welcome_title_ar: settings.welcome_title_ar ?? DEFAULT_SITE_SETTINGS.welcome_title_ar!,
  welcome_title_en: settings.welcome_title_en ?? DEFAULT_SITE_SETTINGS.welcome_title_en!,
  welcome_message_ar: settings.welcome_message_ar ?? DEFAULT_SITE_SETTINGS.welcome_message_ar!,
  welcome_message_en: settings.welcome_message_en ?? DEFAULT_SITE_SETTINGS.welcome_message_en!,
  welcome_coupon_code: settings.welcome_coupon_code ?? DEFAULT_SITE_SETTINGS.welcome_coupon_code!,
  welcome_discount_percent: settings.welcome_discount_percent ?? 15,
  welcome_modal_enabled: settings.welcome_modal_enabled ?? true,
});
export const AdminWelcomeModalView: React.FC = () => {
  const { lang, setHasUnsavedChanges } = useAdminBridge();
  const { siteSettings, updateSiteSettings } = useSiteControls();
  const isAr = lang === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;
  const [draft, setDraft] = useState(() => welcomeFields(siteSettings));
  const [changed, setChanged] = useState(false);
  useEffect(() => { setHasUnsavedChanges(changed); return () => setHasUnsavedChanges(false); }, [changed, setHasUnsavedChanges]);
  const [language, setLanguage] = useState<'ar' | 'en'>(isAr ? 'ar' : 'en');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [percentage, setPercentage] = useState(String(draft.welcome_discount_percent));
  useEffect(() => { if (!changed) { const next = welcomeFields(siteSettings); setDraft(next); setPercentage(String(next.welcome_discount_percent)); } }, [siteSettings, changed]);
  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [changed]);
  const edit = (patch: Partial<typeof draft>) => { setDraft(prev => ({ ...prev, ...patch })); setChanged(true); setError(''); setNotice(''); };
  const save = async () => {
    if (busy || !changed) return;
    const next = { ...draft, welcome_coupon_code: draft.welcome_coupon_code.trim().toUpperCase(), welcome_discount_percent: Number(toEnglishDigits(percentage)) };
    const issue = validateWelcomeDraft(next);
    if (issue) { setError(issue === 'code' ? t('الكود يجب أن يحتوي 3–40 حرفاً إنجليزياً أو رقماً مع - أو _ فقط.', 'Code must be 3–40 English letters/digits, - or _.') : issue === 'discount' ? t('أدخل نسبة أكبر من صفر وأقل من 100.', 'Enter a percentage above zero and below 100.') : t('أكمل العنوان والرسالة باللغتين، حتى 1000 حرف للحقل.', 'Complete title and message in both languages, up to 1000 characters per field.')); return; }
    setBusy(true); setError('');
    try {
      await updateSiteSettings(next);
      setChanged(false);
      setNotice(t('تم تطبيق إعدادات النافذة في هذه الجلسة. المزامنة السحابية بالخلفية، ولا يتم تأكيدها من هذه الشاشة.', 'Popup settings applied in this session. Background cloud synchronization is not confirmed by this screen.'));
    } catch { setError(t('تعذر حفظ الإعدادات. المسودة باقية للمراجعة.', 'Could not save settings. Your draft remains available.')); }
    finally { setBusy(false); }
  };
  const titleKey = language === 'ar' ? 'welcome_title_ar' : 'welcome_title_en';
  const messageKey = language === 'ar' ? 'welcome_message_ar' : 'welcome_message_en';
  return <div className="welcome-editor min-w-0 space-y-5">
    <header><h2 className="text-xl font-bold text-white">{t('نافذة الترحيب', 'Welcome popup')}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{t('تظهر بعد نجاح الاشتراك في النشرة، وليست نافذة تلقائية لكل زيارة. هذه الصفحة تعدّل محتواها وظهورها فقط.', 'Appears after a successful newsletter signup, not automatically on every visit. This page controls popup content and visibility only.')}</p></header>
    <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:items-start">
      <form onSubmit={e => e.preventDefault()}><fieldset disabled={busy} className="min-w-0 space-y-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <label className="flex min-h-11 items-center justify-between gap-3 text-sm text-slate-200"><span>{t('إظهار نافذة الترحيب بعد الاشتراك', 'Show popup after signup')}</span><input type="checkbox" checked={draft.welcome_modal_enabled} onChange={e => edit({ welcome_modal_enabled: e.target.checked })} className="h-5 w-5 accent-blue-600" /></label>
        <div role="group" aria-label={t('لغة المحتوى', 'Content language')} className="flex gap-2">{(['ar', 'en'] as const).map(value => <Button type="button" key={value} className="min-h-11" variant={language === value ? 'primary' : 'secondary'} aria-pressed={language === value} onClick={() => setLanguage(value)}>{value === 'ar' ? 'العربية' : 'English'}</Button>)}</div>
        <Input label={t('عنوان نافذة الترحيب', 'Popup headline')} dir={language === 'ar' ? 'rtl' : 'ltr'} maxLength={1000} value={draft[titleKey]} onChange={e => edit({ [titleKey]: e.target.value })} className="min-h-11" />
        <label className="block space-y-2 text-sm text-slate-300"><span>{t('الرسالة الترحيبية', 'Welcome message')} · {language === 'ar' ? 'العربية' : 'English'}</span><textarea rows={5} dir={language === 'ar' ? 'rtl' : 'ltr'} maxLength={1000} value={draft[messageKey]} onChange={e => edit({ [messageKey]: e.target.value })} className="block w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-blue-500" /></label>
        <div className="space-y-4 border-t border-slate-700 pt-4"><h3 className="font-bold text-white">{t('الكود المعروض', 'Displayed code')}</h3><Input label={t('كود الترحيب', 'Welcome code')} dir="ltr" maxLength={40} value={draft.welcome_coupon_code} onChange={e => edit({ welcome_coupon_code: e.target.value.toUpperCase() })} className="min-h-11" /><Input label={t('نسبة الخصم المعروضة (%)', 'Displayed discount (%)')} dir="ltr" inputMode="decimal" value={percentage} onChange={e => { setPercentage(e.target.value); setChanged(true); setError(''); setNotice(''); }} className="min-h-11" /><p className="text-xs leading-5 text-slate-400">{t('هذه بيانات العرض داخل النافذة فقط. كتابة الكود هنا لا تنشئ حملة خصم ولا تطبّق خصماً على طلب.', 'These values only appear in the popup. Entering a code here does not create a discount campaign or apply a discount to an order.')}</p></div>
      </fieldset></form>
      <aside className="min-w-0 space-y-3 lg:sticky lg:top-20" aria-label={t('معاينة محتوى الترحيب', 'Welcome content preview')}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold text-white">{t('معاينة المحتوى · لا تُرسل رسالة', 'Content preview · no message is sent')}</h3><span className="text-xs text-slate-400">{draft.welcome_modal_enabled ? t('مفعّلة عند الحفظ', 'Enabled on save') : t('مخفية عند الحفظ', 'Hidden on save')}</span></div>
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-w-0 rounded-2xl border border-blue-500/20 bg-[#0f121a] p-5 text-center text-white space-y-4"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#004ad7]"><Gift className="h-6 w-6" /></div><h4 className="break-words text-xl font-bold">{draft[titleKey]}</h4><p className="break-words text-sm leading-7 text-slate-300">{draft[messageKey]}</p><div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 space-y-3"><div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300"><span>{language === 'ar' ? 'كوبون الخصم الترحيبي' : 'Welcome discount coupon'}</span><bdi className="text-blue-300">{percentage || '—'}%</bdi></div><p dir="ltr" className="break-all rounded-lg bg-black/40 p-3 font-mono font-bold text-blue-300">{draft.welcome_coupon_code || '—'}</p></div><div className="rounded-xl bg-[#004ad7] p-3 text-sm font-semibold">{language === 'ar' ? 'تصفح التشكيلة واستخدم الخصم' : 'Explore pieces with discount'}</div></div>
        <p className="text-xs leading-5 text-slate-500">{t('المعاينة تعرض المسودة حتى لو كانت النافذة مخفية. الإيميلات وإعدادات إرسالها مستقلة ولم تُعدّل هنا.', 'Draft content remains previewable when the popup is hidden. Email delivery settings are separate and are not edited here.')}</p>
      </aside>
    </div>
    <footer className="sticky bottom-0 z-20 space-y-3 rounded-xl border border-slate-700 bg-slate-950/95 p-3 backdrop-blur-sm"><p className="text-xs text-slate-400">{changed ? t('تعديلات غير محفوظة · احفظ قبل مغادرة الصفحة.', 'Unsaved changes · save before leaving this page.') : t('لا توجد تغييرات غير محفوظة.', 'No unsaved changes.')}</p>{notice && <p role="status" className="text-sm text-blue-300">{notice}</p>}{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}<div className="flex gap-2"><Button type="button" className="min-h-11" disabled={!changed} isLoading={busy} onClick={save}>{t('حفظ إعدادات الترحيب', 'Save welcome settings')}</Button><Button type="button" variant="secondary" className="min-h-11" disabled={busy || !changed} onClick={() => { setDraft(welcomeFields(siteSettings)); setPercentage(String(siteSettings.welcome_discount_percent ?? 15)); setChanged(false); setError(''); setNotice(''); }}>{t('إلغاء المسودة', 'Discard draft')}</Button></div></footer>
  </div>;
};
export default AdminWelcomeModalView;

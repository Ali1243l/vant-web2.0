import { useEffect, useState } from 'react';
import { useSiteControls } from '../context/SiteControlsContext';
import { useAdminBridge } from './useAdminBridge';
import { policyIds, readPolicies, validPolicyPage, type PolicyId } from '../data/storePolicies';
import { PolicyArticle } from '../components/StorePolicies';
import { supabase } from '../lib/supabase';
import { Button, Card } from './ui';

export default function AdminPoliciesView() {
  const { siteSettings, updateSiteSettings } = useSiteControls();
  const { lang, setHasUnsavedChanges } = useAdminBridge();
  const isAr = lang === 'ar';
  const pages = readPolicies(siteSettings.legal_pages);
  const [id, setId] = useState<PolicyId>('about');
  const [base, setBase] = useState(pages.about);
  const [draft, setDraft] = useState(pages.about);
  const [language, setLanguage] = useState<'ar' | 'en'>(lang);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(base);
  useEffect(() => { if (!dirty) { const page = readPolicies(siteSettings.legal_pages)[id]; setBase(page); setDraft(page); } }, [siteSettings.legal_pages, id, dirty]);
  useEffect(() => { setHasUnsavedChanges(dirty); return () => setHasUnsavedChanges(false); }, [dirty, setHasUnsavedChanges]);
  useEffect(() => { if (!dirty) return; const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; }; window.addEventListener('beforeunload', guard); return () => window.removeEventListener('beforeunload', guard); }, [dirty]);
  const save = async () => {
    if (saving || !dirty) return;
    const next = { ...draft, updated: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Baghdad', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()) };
    if (!validPolicyPage(next)) { setNotice(isAr ? 'راجع العناوين والنصوص باللغتين وحدود الأحرف.' : 'Check both languages and character limits.'); return; }
    setSaving(true); setNotice('');
    try {
      if (!await updateSiteSettings({ legal_pages: { ...readPolicies(siteSettings.legal_pages), [id]: next } })) throw new Error('save');
      setBase(next); setDraft(next);
      setNotice(supabase ? (isAr ? 'حُفظت الصفحة، وتظهر للزوار عند تحميل الموقع.' : 'Saved. Visitors see this version when loading the site.') : (isAr ? 'حُفظت بهذا المتصفح فقط؛ قاعدة البيانات غير متصلة.' : 'Saved in this browser only; database not connected.'));
    } catch { setNotice(isAr ? 'تعذّر الحفظ. مسودتك باقية؛ حاول مجدداً.' : 'Save failed. Your draft is preserved; retry.'); }
    finally { setSaving(false); }
  };
  return <section className="max-w-5xl min-w-0 space-y-5 select-text">
    <Card className="space-y-2"><h2 className="text-xl font-bold">{isAr ? 'صفحات المتجر والسياسات' : 'Store pages & policies'}</h2><p className="text-sm text-slate-400">{isAr ? 'كل الروابط تظهر بأسفل المتجر. عدّل كل لغة، عاين، ثم احفظ للنشر. احفظ أو ألغِ المسودة قبل الانتقال لصفحة ثانية.' : 'All links appear in the footer. Edit each language, preview, then save to publish. Save or discard your draft before choosing another page.'}</p></Card>
    <fieldset disabled={saving} className="min-w-0 space-y-5">
      <nav aria-label={isAr ? 'اختيار صفحة السياسة' : 'Choose policy page'} className="flex flex-wrap gap-2">{policyIds.map(key => <Button key={key} type="button" variant={key === id ? 'primary' : 'secondary'} disabled={dirty && key !== id} onClick={() => { setId(key); setNotice(''); }}>{pages[key][lang].title}</Button>)}</nav>
      <Card className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2">{(['ar', 'en'] as const).map(key => <Button key={key} type="button" variant={language === key ? 'primary' : 'secondary'} onClick={() => setLanguage(key)}>{key === 'ar' ? 'العربية' : 'English'}</Button>)}</div><Button type="button" variant="outline" onClick={() => setPreview(!preview)}>{isAr ? (preview ? 'إخفاء المعاينة' : 'معاينة المسودة') : (preview ? 'Hide preview' : 'Preview draft')}</Button></div>
        <label className="block text-sm space-y-2"><span>{isAr ? 'عنوان الصفحة والرابط في الفوتر' : 'Page title and footer label'}</span><input dir={language === 'ar' ? 'rtl' : 'ltr'} maxLength={140} value={draft[language].title} onChange={event => { setDraft({ ...draft, [language]: { ...draft[language], title: event.target.value } }); setNotice(''); }} className="w-full min-h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white" /></label>
        <label className="block text-sm space-y-2"><span>{isAr ? 'نص الصفحة — افصل الفقرات بسطر فارغ' : 'Page text — separate paragraphs with a blank line'}</span><textarea dir={language === 'ar' ? 'rtl' : 'ltr'} rows={16} maxLength={24000} value={draft[language].body} onChange={event => { setDraft({ ...draft, [language]: { ...draft[language], body: event.target.value } }); setNotice(''); }} className="w-full min-h-72 bg-slate-950 border border-slate-700 rounded-xl p-4 leading-8 text-white resize-y" /></label>
        <p className="text-xs text-slate-400">{draft[language].body.length.toLocaleString()} / 24,000 · {isAr ? 'النص يُعرض كما كتبته؛ لا يحتاج كوداً أو HTML.' : 'Plain text; no code or HTML required.'}</p>
      </Card>
      {preview && <div className="rounded-2xl border border-slate-700 bg-white dark:bg-[#0c0e12] p-5 sm:p-8"><PolicyArticle page={draft} lang={language} /></div>}
      <div className="flex flex-wrap gap-3"><Button type="button" disabled={!dirty} isLoading={saving} onClick={save}>{isAr ? 'حفظ ونشر الصفحة' : 'Save & publish page'}</Button><Button type="button" variant="secondary" disabled={!dirty} onClick={() => { setDraft(base); setNotice(''); }}>{isAr ? 'إلغاء المسودة' : 'Discard draft'}</Button></div>
    </fieldset>
    {notice && <p role="status" aria-live="polite" className="p-4 border border-slate-700 rounded-xl text-sm text-slate-200">{notice}</p>}
  </section>;
}

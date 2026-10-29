import { useState } from 'react';
import { captureSavedTheme, parseSavedThemes, savedThemeEdits, type BannerEdits } from '../lib/bannerEditor';
import { CUSTOM_THEMES_CONTROL } from '../lib/storefrontTheme';
import type { SiteControlItem } from '../context/siteControlsTypes';
import { Button, Input } from './ui';

export default function CustomThemeLibrary({ isAr, controls, onPatch }: { isAr: boolean; controls: Record<string, SiteControlItem>; onPatch: (patch: BannerEdits) => void }) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const themes = parseSavedThemes(controls[CUSTOM_THEMES_CONTROL]?.actionValue);
  const t = (ar: string, en: string) => isAr ? ar : en;
  const save = () => {
    try {
      if (themes.some(theme => theme.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase() && theme.id !== editingId)) throw new Error('name');
      const entry = captureSavedTheme(editingId || crypto.randomUUID(), name, controls);
      const next = editingId ? themes.map(theme => theme.id === editingId ? entry : theme) : [...themes, entry];
      parseSavedThemes(JSON.stringify(next), true);
      onPatch({ [CUSTOM_THEMES_CONTROL]: { actionValue: JSON.stringify(next) } });
      setEditingId(null); setName(''); setMessage(t('أُضيف إلى مسودة المكتبة. اضغط «حفظ التغييرات» لنشر المكتبة.', 'Added to the library draft. Publish the library with Save changes.'));
    } catch { setMessage(t('راجع الاسم (1–80 حرفاً، بدون تكرار)، والنصوص باللغتين، وتباين الألوان. الحد 20 ثيماً.', 'Check the unique name (1–80 characters), bilingual copy and palette contrast. Maximum 20 themes.')); }
  };
  return <section aria-label={t('مكتبتي الخاصة للثيمات', 'My custom theme library')} className="min-w-0 space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
    <h3 className="font-bold text-white">{t('ثيماتي الخاصة', 'My custom themes')}</h3>
    <p className="text-xs leading-6 text-slate-400">{t('عدّل هوية المتجر والتدرّج والصورة والنصوص أولاً، ثم سمِّ الثيم واحفظه هنا لإعادة استخدامه. وجهة زر البانر مستقلة ولا تتبدل بتحميل ثيم.', 'Customize the store identity, fade, photo and bilingual copy, then name and save the theme here for reuse. Banner destination is separate and is not changed by loading a theme.')}</p>
    <Input label={t('اسم الثيم الخاص', 'Custom theme name')} maxLength={80} value={name} onChange={e => setName(e.target.value)} className="min-h-11" />
    <div className="flex flex-wrap gap-2"><Button type="button" className="min-h-11" onClick={save}>{editingId ? t('تحديث نسخة الثيم بالمسودة', 'Update theme in draft') : t('إضافة الإعدادات الحالية كثيم جديد', 'Add current settings as a new theme')}</Button>{editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setName(''); setMessage(''); }}>{t('إلغاء التحديث', 'Cancel update')}</Button>}</div>
    {message && <p role="status" className="text-sm text-blue-300">{message}</p>}
    {!themes.length && <p className="text-sm text-slate-400">{t('ما عندك ثيمات خاصة بعد. تگدر تبدأ من ثيم جاهز وتعدّل كل تفاصيله.', 'No custom themes yet. Start from a preset and customize its details.')}</p>}
    <div className="space-y-3">{themes.map(theme => <article key={theme.id} className="min-w-0 rounded-lg border border-slate-700 p-3"><div className="mb-3 flex items-center gap-3"><span className="h-6 w-6 shrink-0 rounded-full border border-white/20" style={{ backgroundColor: theme.store.dark.accent }} /><h4 className="min-w-0 break-words font-semibold text-white">{theme.name}</h4></div><div className="flex flex-wrap gap-2"><Button type="button" variant="secondary" onClick={() => { onPatch(savedThemeEdits(theme)); setMessage(t('تم تحميل الثيم للمسودة فقط. عاينه ثم احفظ لتطبيقه.', 'Theme loaded into the draft. Preview, then Save to apply.')); }}>{t('تحميل للمعاينة', 'Load into preview')}</Button><Button type="button" variant="secondary" onClick={() => { setEditingId(theme.id); setName(theme.name); setMessage(t('عدّل الإعدادات الحالية ثم اضغط تحديث نسخة الثيم لاستبدال هذه النسخة بالمسودة.', 'Adjust current settings, then update this theme to replace its draft copy.')); }}>{t('استبدال بالإعدادات الحالية', 'Replace with current settings')}</Button><Button type="button" variant="secondary" onClick={() => { onPatch({ [CUSTOM_THEMES_CONTROL]: { actionValue: JSON.stringify(themes.filter(row => row.id !== theme.id)) } }); if (editingId === theme.id) { setEditingId(null); setName(''); } setMessage(t('أُزيل من مسودة المكتبة فقط؛ إلغاء المسودة يرجعه قبل الحفظ.', 'Removed from the library draft; Discard restores it before Save.')); }}>{t('إزالة من المكتبة', 'Remove from library')}</Button></div></article>)}</div>
  </section>;
}

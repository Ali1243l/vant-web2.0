import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useAdminBridge } from './useAdminBridge';
import { pinChangeIssue } from '../lib/adminPinValidation';
import { Button, Card, Input } from './ui';

export const AdminSecurityView: React.FC = () => {
  const { lang, pin, setPin, lock } = useAdminBridge();
  const isAr = lang === 'ar';
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const t = (ar: string, en: string) => isAr ? ar : en;
  const messages = {
    current: t('رمز الدخول الحالي غير صحيح.', 'The current access code is incorrect.'),
    length: t('الرمز الجديد يجب أن يحتوي 4–64 حرفاً أو رقماً.', 'Use 4–64 characters for the new code.'),
    spaces: t('احذف المسافات من بداية ونهاية الرمز وأي محارف تحكم.', 'Remove leading/trailing spaces and control characters.'),
    same: t('اختر رمزاً مختلفاً عن الرمز الحالي.', 'Choose a different code from the current one.'),
    confirmation: t('تأكيد الرمز غير مطابق.', 'The confirmation does not match.'),
  };
  const edit = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => { setter(value); setError(''); setSuccess(false); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setSuccess(false);
    const issue = pinChangeIssue(current, pin, next, confirmation);
    if (issue) { setError(messages[issue]); return; }
    try {
      setPin(next);
      setCurrent(''); setNext(''); setConfirmation(''); setShow(false); setError(''); setSuccess(true);
    } catch { setError(t('تعذّر حفظ الرمز في المتصفح. لم يتم تأكيد التغيير؛ حاول ثانية.', 'Could not save the code in this browser. The change is not confirmed; retry.')); }
  };
  return <div className="min-w-0 max-w-3xl mx-auto space-y-5">
    <Card className="space-y-3"><div className="flex items-start gap-3"><div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-indigo-400"><KeyRound className="w-5 h-5" /></div><div className="min-w-0"><h2 className="text-xl font-bold text-white">{t('الأمان ورمز الدخول', 'Security & access code')}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{t('إدارة قفل لوحة التحكم على هذا المتصفح.', 'Manage the admin lock in this browser.')}</p></div></div></Card>
    <div className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm leading-6 text-slate-300"><ShieldCheck className="mt-1 w-5 h-5 shrink-0 text-indigo-400" /><p>{t('هذا رمز قفل محلي لهذا المتصفح، ولا يغيّر صلاحيات قاعدة البيانات أو حساب الاستضافة. لا ترسله لأي شخص.', 'This is a local browser lock. It does not change database permissions or your hosting account. Keep the code private.')}</p></div>
    <Card><form onSubmit={submit} className="space-y-5">
      <div><h3 className="font-bold text-white">{t('تغيير رمز الدخول', 'Change access code')}</h3><p className="mt-2 text-xs leading-6 text-slate-400">{t('يمكن استعمال الحروف والأرقام. الحد الأدنى 4 خانات؛ يُفضّل 8 خانات أو أكثر.', 'Letters and numbers are supported. Minimum 4 characters; 8 or more is preferable.')}</p></div>
      <Input label={t('رمز الدخول الحالي', 'Current access code')} type={show ? 'text' : 'password'} dir="ltr" autoComplete="current-password" required value={current} onChange={e => edit(setCurrent, e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t('رمز الدخول الجديد', 'New access code')} type={show ? 'text' : 'password'} dir="ltr" autoComplete="new-password" minLength={4} maxLength={64} required value={next} onChange={e => edit(setNext, e.target.value)} />
        <Input label={t('تأكيد الرمز الجديد', 'Confirm new code')} type={show ? 'text' : 'password'} dir="ltr" autoComplete="new-password" minLength={4} maxLength={64} required value={confirmation} onChange={e => edit(setConfirmation, e.target.value)} />
      </div>
      <Button type="button" variant="ghost" aria-pressed={show} onClick={() => setShow(value => !value)} className="min-h-11" leftIcon={show ? <EyeOff size={17} /> : <Eye size={17} />}>{show ? t('إخفاء الرموز', 'Hide codes') : t('إظهار الرموز', 'Show codes')}</Button>
      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
      {success && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{t('تم حفظ الرمز على هذا المتصفح. استعمل الرمز الجديد عند الدخول القادم.', 'Code saved in this browser. Use the new code at your next login.')}</p>}
      <div className="flex flex-wrap gap-3 border-t border-slate-800 pt-4"><Button type="submit" disabled={!current || !next || !confirmation} className="min-h-11 h-auto py-3 flex-1">{t('حفظ رمز الدخول', 'Save access code')}</Button><Button type="button" variant="outline" className="min-h-11 h-auto py-3" leftIcon={<Lock size={16} />} onClick={lock}>{t('قفل الإدارة الآن', 'Lock admin now')}</Button></div>
      <p className="text-xs leading-6 text-slate-500">{t('قفل الإدارة يطلب رمز الدخول مجدداً. تغيير الرمز يتم بواسطتك فقط.', 'Locking admin asks for the access code again. Only you should submit a code change.')}</p>
    </form></Card>
  </div>;
};
export default AdminSecurityView;

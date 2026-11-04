import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { saveRecoveredPassword } from '../lib/passwordRecovery';

export default function PasswordRecovery({ invalidLink }: { invalidLink: boolean }) {
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    document.title = 'استعادة كلمة المرور | VANT';
    const client = supabase;
    if (!client) { setChecking(false); return; }
    let mounted = true;
    const check = async () => {
      try {
        const { data, error } = await client.auth.getUser();
        if (mounted) setReady(!invalidLink && !error && !!data.user);
      } catch { if (mounted) setReady(false); }
      finally { if (mounted) setChecking(false); }
    };
    void check();
    const { data } = client.auth.onAuthStateChange(() => { setTimeout(() => { if (mounted) void check(); }, 0); });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, [invalidLink]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !ready) return;
    setBusy(true); setMessage('');
    try {
      await saveRecoveredPassword(supabase, password, confirmation);
      setPassword(''); setConfirmation(''); setSaved(true);
      window.history.replaceState(null, '', '/?auth=recovery');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذّر حفظ كلمة المرور.'); }
    finally { setBusy(false); }
  };
  return <main dir="rtl" className="flex min-h-dvh items-center justify-center bg-slate-950 px-5 py-12 text-slate-100">
    <section aria-labelledby="recovery-title" className="w-full max-w-md space-y-6 rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8">
      <p dir="ltr" className="text-center text-lg font-bold tracking-[.3em]">VANT</p>
      <div><h1 id="recovery-title" className="text-2xl font-bold">{saved ? 'تم تحديث كلمة المرور' : 'تعيين كلمة مرور الحساب'}</h1><p className="mt-3 text-sm leading-7 text-slate-400">هذه كلمة مرور حساب المتجر السحابي، وهي مستقلة عن رمز قفل لوحة الإدارة.</p></div>
      {checking ? <p role="status">جارِ التحقق من رابط الاستعادة…</p> : saved ? <p role="status" className="text-emerald-300">حُفظت كلمة المرور الجديدة. ارجع إلى الإدارة وسجّل الدخول بحساب المتجر لإكمال تحسين الصور.</p> : ready ? <form onSubmit={submit} className="space-y-5">
        <fieldset disabled={busy} className="space-y-5">
          <label className="block text-sm">كلمة المرور الجديدة<input type="password" autoComplete="new-password" dir="ltr" required minLength={12} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 text-base"/></label>
          <label className="block text-sm">تأكيد كلمة المرور<input type="password" autoComplete="new-password" dir="ltr" required minLength={12} maxLength={128} value={confirmation} onChange={event => setConfirmation(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 text-base"/></label>
          <p className="text-xs leading-6 text-slate-400">12 حرفاً على الأقل. استخدم كلمة فريدة واحفظها بمكان آمن.</p>
          <button type="submit" className="min-h-12 w-full rounded-xl bg-blue-600 px-4 font-semibold disabled:opacity-50">{busy ? 'جارِ الحفظ…' : 'حفظ كلمة المرور الجديدة'}</button>
        </fieldset>
      </form> : <div className="space-y-3 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm leading-7"><h2 className="font-semibold text-amber-200">الرابط غير متاح أو انتهت صلاحيته</h2><p>اطلب رسالة جديدة من تفاصيل حسابك في Supabase عبر Send password recovery، ثم افتح رابط أحدث رسالة مرة واحدة.</p><p>إذا رجعك الرابط إلى localhost، صحّح Site URL من Authentication → URL Configuration إلى https://vant-web.vercel.app أولاً.</p></div>}
      {message && <p role="alert" className="text-sm leading-7 text-rose-300">{message}</p>}
      <a href="/?admin" className="inline-flex min-h-11 items-center text-sm text-blue-300 underline underline-offset-4">العودة إلى إدارة المتجر</a>
    </section>
  </main>;
}

import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Wand2 } from 'lucide-react';
import { optimizeCloudImages, type ImageOptimizationProgress } from '../../lib/optimizeCloudImages';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { cloudSignInError, requireCloudAdmin } from '../../lib/cloudAdminAccess';

export function CloudImageOptimizer({ isAr, onComplete }: { isAr: boolean; onComplete: () => void }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<ImageOptimizationProgress | null>(null);
  const [message, setMessage] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const stopped = useRef(false);
  const running = useRef(false);
  useEffect(() => () => { stopped.current = true; }, []);
  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    const check = async () => { try { await requireCloudAdmin(supabase); if (mounted) setAuthorized(true); } catch { if (mounted) setAuthorized(false); } };
    void check();
    const { data } = supabase.auth.onAuthStateChange(() => { setTimeout(() => { if (mounted) void check(); }, 0); });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);
  const start = async () => {
    if (running.current) return;
    running.current = true; stopped.current = false; setBusy(true); setMessage('');
    try {
      const result = await optimizeCloudImages(setProgress, () => stopped.current);
      setMessage(result.blocked || (result.failed && !result.optimized) ? (isAr ? 'المعالجة لم تكتمل. الملفات الأصلية محفوظة؛ راجع سبب الخطأ أدناه قبل إعادة المحاولة.' : 'Processing could not complete. Originals are intact; check the error below before retrying.') : (isAr ? 'حُفظت النسخ الناجحة بالسحابة. الملفات الأصلية محفوظة؛ يمكنك إعادة التشغيل للمحاولات المتبقية.' : 'Successful copies saved to the cloud. Originals remain available; rerun to retry remaining images.'));
      onComplete();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذّرت معالجة الصور.'); }
    finally { running.current = false; setBusy(false); }
  };
  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || signingIn) return;
    setSigningIn(true); setMessage('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error(cloudSignInError(error, isAr));
      await requireCloudAdmin(supabase);
      setPassword(''); setAuthorized(true);
      await start();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذّر تسجيل الدخول.'); }
    finally { setSigningIn(false); }
  };
  return <section className="space-y-3 rounded-2xl border border-indigo-500/25 bg-slate-900/60 p-4" aria-busy={busy}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0 flex-1"><h3 className="font-semibold text-white">{isAr ? 'تحسين صور المتجر تلقائياً' : 'Automatic store image optimization'}</h3><p className="mt-1 text-xs leading-relaxed text-slate-400">{isAr ? 'الصور الجديدة تُجهّز تلقائياً. للصور القديمة: شغّل المعالجة مرة واحدة لتشمل المنتجات والألوان والبانرات، مع إبقاء الأصول. أبقِ لوحة الإدارة مفتوحة إلى اكتمال المعالجة.' : 'New uploads are optimized automatically. Run once for existing product, color and banner images while preserving originals. Keep this panel open until completion.'}</p></div><button type="button" disabled={busy || !isSupabaseConfigured || !authorized || signingIn} onClick={start} className="flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white disabled:opacity-50"><Wand2 size={16}/>{isAr ? 'تحسين كل صور المتجر' : 'Optimize all store images'}</button>{busy && <button type="button" onClick={() => { stopped.current = true; }} className="min-h-11 rounded-xl border border-slate-600 px-3 text-sm text-slate-200">{isAr ? 'إيقاف بعد الصورة الحالية' : 'Stop after current image'}</button>}</div>
    {!isSupabaseConfigured && <p className="text-xs text-amber-300">{isAr ? 'المعالجة السحابية متاحة بالنسخة المتصلة بـSupabase.' : 'Cloud processing requires a Supabase connection.'}</p>}
    {isSupabaseConfigured && !authorized && <form onSubmit={signIn} className="space-y-3 rounded-xl border border-slate-700 p-3">
      <p className="text-xs leading-relaxed text-slate-300">{isAr ? 'رفع الصور يحتاج جلسة حساب أدمن المتجر المسجّل في Supabase Auth. سجّل الدخول مرة واحدة لتفعيل الرفع والتحسين تلقائياً.' : 'Image uploads require the store admin account in Supabase Auth. Sign in once to enable automatic uploads and optimization.'}</p>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs text-slate-300">{isAr ? 'بريد أدمن المتجر' : 'Store admin email'}<input type="email" required autoComplete="username" dir="ltr" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-white"/></label><label className="text-xs text-slate-300">{isAr ? 'كلمة مرور حساب المتجر' : 'Store account password'}<input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-white"/></label></div>
      <button type="button" aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} className="inline-flex min-h-11 items-center gap-2 text-sm text-blue-300">{showPassword ? <EyeOff size={18} aria-hidden="true"/> : <Eye size={18} aria-hidden="true"/>}{isAr ? (showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور') : (showPassword ? 'Hide password' : 'Show password')}</button>
      <button type="submit" disabled={signingIn || busy} className="min-h-11 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{signingIn ? (isAr ? 'جارِ التحقق...' : 'Verifying...') : (isAr ? 'تسجيل الدخول وبدء التحسين' : 'Sign in and optimize')}</button>
    </form>}
    {authorized && <p className="text-xs text-emerald-300">{isAr ? 'جلسة أدمن Supabase متصلة · الرفع التلقائي متاح' : 'Supabase admin connected · automatic uploads enabled'}</p>}
    {progress && <div className="space-y-2 text-xs text-slate-300"><progress className="w-full accent-indigo-500" value={progress.done} max={progress.total || 1} aria-label={isAr ? 'تقدم تحسين الصور' : 'Image optimization progress'}/><p role="status">{progress.done} / {progress.total} · {isAr ? 'محسّنة' : 'Optimized'}: {progress.optimized} · {isAr ? 'لا تحتاج تحويل' : 'Already efficient'}: {progress.skipped} · {isAr ? 'تعذّرت وبقيت أصولها' : 'Failed, originals retained'}: {progress.failed} · {isAr ? 'التوفير' : 'Saved'}: {(progress.savedBytes / 1024 / 1024).toFixed(2)} MB</p></div>}
    {message && <p role="status" className="text-xs leading-relaxed text-indigo-200">{message}</p>}
    {progress?.lastError && <p role="alert" className="break-words text-xs leading-relaxed text-amber-300">{progress.lastError}</p>}
  </section>;
}

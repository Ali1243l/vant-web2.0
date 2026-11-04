import { useEffect, useRef, useState } from 'react';
import { Wand2 } from 'lucide-react';
import { optimizeCloudImages, type ImageOptimizationProgress } from '../../lib/optimizeCloudImages';
import { isSupabaseConfigured } from '../../lib/supabase';

export function CloudImageOptimizer({ isAr, onComplete }: { isAr: boolean; onComplete: () => void }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<ImageOptimizationProgress | null>(null);
  const [message, setMessage] = useState('');
  const stopped = useRef(false);
  const running = useRef(false);
  useEffect(() => () => { stopped.current = true; }, []);
  const start = async () => {
    if (running.current) return;
    running.current = true; stopped.current = false; setBusy(true); setMessage('');
    try {
      await optimizeCloudImages(setProgress, () => stopped.current);
      setMessage(isAr ? 'حُفظت النسخ الناجحة بالسحابة. الملفات الأصلية محفوظة؛ يمكنك إعادة التشغيل للمحاولات المتبقية.' : 'Successful copies saved to the cloud. Originals remain available; rerun to retry remaining images.');
      onComplete();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذّرت معالجة الصور.'); }
    finally { running.current = false; setBusy(false); }
  };
  return <section className="space-y-3 rounded-2xl border border-indigo-500/25 bg-slate-900/60 p-4" aria-busy={busy}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0 flex-1"><h3 className="font-semibold text-white">{isAr ? 'تحسين صور المتجر تلقائياً' : 'Automatic store image optimization'}</h3><p className="mt-1 text-xs leading-relaxed text-slate-400">{isAr ? 'الصور الجديدة تُجهّز تلقائياً. للصور القديمة: شغّل المعالجة مرة واحدة لتشمل المنتجات والألوان والبانرات، مع إبقاء الأصول. أبقِ لوحة الإدارة مفتوحة إلى اكتمال المعالجة.' : 'New uploads are optimized automatically. Run once for existing product, color and banner images while preserving originals. Keep this panel open until completion.'}</p></div><button type="button" disabled={busy || !isSupabaseConfigured} onClick={start} className="flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white disabled:opacity-50"><Wand2 size={16}/>{isAr ? 'تحسين كل صور المتجر' : 'Optimize all store images'}</button>{busy && <button type="button" onClick={() => { stopped.current = true; }} className="min-h-11 rounded-xl border border-slate-600 px-3 text-sm text-slate-200">{isAr ? 'إيقاف بعد الصورة الحالية' : 'Stop after current image'}</button>}</div>
    {!isSupabaseConfigured && <p className="text-xs text-amber-300">{isAr ? 'المعالجة السحابية متاحة بالنسخة المتصلة بـSupabase.' : 'Cloud processing requires a Supabase connection.'}</p>}
    {progress && <div className="space-y-2 text-xs text-slate-300"><progress className="w-full accent-indigo-500" value={progress.done} max={progress.total || 1} aria-label={isAr ? 'تقدم تحسين الصور' : 'Image optimization progress'}/><p role="status">{progress.done} / {progress.total} · {isAr ? 'محسّنة' : 'Optimized'}: {progress.optimized} · {isAr ? 'لا تحتاج تحويل' : 'Already efficient'}: {progress.skipped} · {isAr ? 'تعذّرت وبقيت أصولها' : 'Failed, originals retained'}: {progress.failed} · {isAr ? 'التوفير' : 'Saved'}: {(progress.savedBytes / 1024 / 1024).toFixed(2)} MB</p></div>}
    {message && <p role="status" className="text-xs leading-relaxed text-indigo-200">{message}</p>}
  </section>;
}

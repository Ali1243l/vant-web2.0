import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, X } from 'lucide-react';
import type { Language } from '../../types';

export default function ProductImageZoom({ src, title, lang, onClose }: {
  src: string; title: string; lang: Language; onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [failed, setFailed] = useState(false);
  const isAr = lang === 'ar';
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => { dialog?.close(); if (opener?.isConnected) opener.focus({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTo({ left: (viewport.scrollWidth - viewport.clientWidth) / 2, top: (viewport.scrollHeight - viewport.clientHeight) / 2, behavior: 'instant' });
  }, [scale]);

  return createPortal(<dialog ref={dialogRef} className="product-image-zoom" aria-label={isAr ? 'تكبير صورة القطعة' : 'Piece image zoom'}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => event.stopPropagation()}>
    <header dir={isAr ? 'rtl' : 'ltr'} className="product-image-zoom-toolbar">
      <p className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</p>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" disabled={scale === 1 || failed} onClick={() => setScale(scale - 1)} aria-label={isAr ? 'تصغير الصورة' : 'Zoom out'}><Minus size={20} /></button>
        <output aria-live="polite" className="w-12 text-center text-sm tabular-nums" dir="ltr">{scale * 100}%</output>
        <button type="button" disabled={scale === 3 || failed} onClick={() => setScale(scale + 1)} aria-label={isAr ? 'تقريب الصورة' : 'Zoom in'}><Plus size={20} /></button>
        <button type="button" autoFocus onClick={onClose} aria-label={isAr ? 'إغلاق التكبير' : 'Close zoom'}><X size={20} /></button>
      </div>
    </header>
    <p className="px-4 py-2 text-center text-xs text-black/60 dark:text-white/65">{isAr ? 'قرّب بأزرار + و −، ثم مرّر لاستكشاف التفاصيل.' : 'Zoom with + and −, then scroll to explore the details.'}</p>
    <div ref={viewportRef} data-scroll-lock-native className="product-image-zoom-viewport" tabIndex={0} aria-label={isAr ? 'الصورة المكبرة، مرّر للتحريك' : 'Enlarged image, scroll to pan'}>
      {failed ? <p role="status" className="p-6 text-center">{isAr ? 'تعذّر تحميل الصورة. أغلق التكبير وحاول مجدداً.' : 'Image could not load. Close zoom and try again.'}</p> :
        <div style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}><img src={src} alt={title} draggable={false} referrerPolicy="no-referrer" onError={() => setFailed(true)} /></div>}
    </div>
  </dialog>, document.body);
}

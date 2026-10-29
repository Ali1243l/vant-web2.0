import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, useDragControls, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Language } from '../../types';
import { shouldDismissProductSheet } from '../../lib/productSheetGesture';

interface Props {
  title: string;
  lang: Language;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  suspended?: boolean;
  busy?: boolean;
}

/** The header and footer never scroll; the content has one native scroll owner. */
export default function ProductSheet({ title, lang, onClose, children, footer, suspended, busy }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragControls = useDragControls();
  const reduceMotion = useReducedMotion();
  const isAr = lang === 'ar';

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus({ preventScroll: true });
    return () => { if (opener?.isConnected) opener.focus({ preventScroll: true }); };
  }, []);

  return createPortal(
    <>
      <motion.div
        className="product-sheet-backdrop fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        onClick={onClose} aria-hidden="true"
      />
      <div className="product-sheet-positioner pointer-events-none fixed inset-0 z-[1001] flex items-end justify-center md:items-center md:p-6">
        <motion.section
          data-store-panel
          ref={panelRef}
          role="dialog" aria-modal="true" aria-label={title} aria-busy={busy || undefined}
          dir={isAr ? 'rtl' : 'ltr'} tabIndex={-1}
          className="product-sheet pointer-events-auto flex w-full flex-col overflow-hidden border border-black/10 bg-white text-[#15171c] shadow-2xl dark:border-white/10 dark:bg-[#101216] dark:text-white"
          initial={{ y: reduceMotion ? 0 : '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }} exit={{ y: reduceMotion ? 0 : '100%', opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          drag="y" dragListener={false} dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.75 }} dragMomentum={false}
          onDragEnd={(_, info) => {
            if (shouldDismissProductSheet(info.offset.y, info.velocity.y)) onClose();
          }}
          onKeyDown={(event) => {
            if (suspended || event.key !== 'Tab') return;
            const controls = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]') || [])
              .filter(element => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (!first) { event.preventDefault(); return; }
            if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
              event.preventDefault(); last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault(); first.focus();
            }
          }}
        >
          <header
            className="product-sheet-topbar shrink-0 select-none border-b border-black/8 dark:border-white/8"
            onPointerDown={event => {
              if (suspended || event.button !== 0 || !window.matchMedia('(max-width: 767px)').matches || (event.target as Element).closest('button')) return;
              dragControls.start(event);
            }}
          >
            <button ref={closeRef} type="button" onClick={onClose} className="product-sheet-close" aria-label={isAr ? 'إغلاق' : 'Close'}>
              <X size={20} strokeWidth={1.7} />
            </button>
            <div
              data-sheet-drag-handle role="button" tabIndex={0}
              aria-label={isAr ? 'اسحب للأسفل لإغلاق المنتج' : 'Drag down to close product'}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClose(); } }}
              className="product-sheet-grip flex h-full flex-col items-center justify-center gap-1.5 rounded-lg outline-offset-2"
            >
              <span className="h-1 w-9 rounded-full bg-black/20 dark:bg-white/25 md:hidden" />
              <span className="text-[11px] font-medium text-black/50 dark:text-white/55">{isAr ? 'تفاصيل القطعة' : 'Piece details'}</span>
            </div>
            <span dir="ltr" className="text-center text-[10px] font-extrabold tracking-[0.18em]">VANT</span>
          </header>
          <div data-product-scroll data-scroll-lock-native className="product-sheet-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
          {footer && <footer className="product-sheet-footer shrink-0 border-t border-black/8 bg-white dark:border-white/10 dark:bg-[#101216]">{footer}</footer>}
        </motion.section>
      </div>
    </>, document.body,
  );
}

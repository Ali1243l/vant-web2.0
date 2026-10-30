import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, RotateCcw, Sun, Moon, X } from 'lucide-react';
import type { SplashMotifType } from '../context/SiteControlsContext';
import type { Theme } from '../types';
import { splashCanFinish } from '../lib/splashLifecycle';
import FashionMotifGraphic from './splash/FashionMotifGraphic';
import './SplashLoader.css';

export { AVAILABLE_SPLASH_MOTIFS, type MotifOption } from './splash/splashMotifs';
interface Props {
  isLoading: boolean;
  loadingTextEn?: string;
  loadingTextAr?: string;
  motif?: SplashMotifType;
  theme?: Theme;
  onToggleTheme?: () => void;
  isPreview?: boolean;
  onClosePreview?: () => void;
  onFinished?: () => void;
}
export default function SplashLoader({ isLoading, loadingTextEn = 'Preparing the collection', loadingTextAr = 'جاري تجهيز التشكيلة', motif = 'hanger', theme = 'dark', onToggleTheme, isPreview = false, onClosePreview, onFinished }: Props) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [elapsed, setElapsed] = useState(false);
  const [replay, setReplay] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onClosePreview, onFinished });
  callbacks.current = { onClosePreview, onFinished };
  const ready = isPreview ? elapsed : !isLoading;
  const isDark = theme === 'dark';
  useEffect(() => {
    setElapsed(false);
    const timer = window.setTimeout(() => setElapsed(true), isPreview ? 1200 : 320);
    return () => window.clearTimeout(timer);
  }, [isPreview, replay]);
  useEffect(() => {
    if (splashCanFinish(isPreview, isLoading, elapsed)) setVisible(false);
  }, [isPreview, isLoading, elapsed]);
  useEffect(() => {
    if (!visible) return;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = bodyOverflow; };
  }, [visible]);
  useEffect(() => {
    if (!isPreview || !visible) return;
    const previous = document.activeElement as HTMLElement | null;
    const buttons = () => Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') || []);
    buttons()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setVisible(false); }
      if (event.key !== 'Tab') return;
      const items = buttons(), first = items[0], last = items[items.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', keydown);
    return () => { window.removeEventListener('keydown', keydown); if (previous?.isConnected) previous.focus(); };
  }, [isPreview, visible]);
  const finished = () => { if (isPreview) callbacks.current.onClosePreview?.(); else callbacks.current.onFinished?.(); };
  return createPortal(<AnimatePresence onExitComplete={finished}>{visible && <motion.div
    key="vant-loader" ref={panel} initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.22 }}
    role={isPreview ? 'dialog' : undefined} aria-modal={isPreview ? true : undefined} aria-label={isPreview ? 'معاينة شاشة التحميل' : undefined}
    className={`vant-loader ${isDark ? 'vant-loader--dark' : 'vant-loader--light'} ${reduced ? 'vant-loader--reduced' : ''}`}>
    <header className="vant-loader-header">
      <div className="vant-loader-mark" dir="ltr"><span className="vant-loader-dot" />VANT<span className="vant-loader-divider" />{isPreview ? 'معاينة' : 'التشكيلة'}</div>
      <div className="vant-loader-actions">
        {onToggleTheme && <button type="button" onClick={onToggleTheme} aria-label="تبديل مظهر شاشة التحميل">{isDark ? <Sun size={17} /> : <Moon size={17} />}</button>}
        {isPreview && <><button type="button" onClick={() => { setElapsed(false); setReplay(value => value + 1); }} aria-label="إعادة معاينة التحميل"><RotateCcw size={17} /><span>إعادة</span></button><button type="button" onClick={() => setVisible(false)} aria-label="إغلاق معاينة التحميل"><X size={18} /><span>إغلاق</span></button></>}
      </div>
    </header>
    <section className="vant-loader-center" aria-labelledby="vant-loader-title">
      <div className="vant-loader-art" aria-hidden="true" key={replay}>{reduced ? <span className="vant-loader-static-v">V</span> : <FashionMotifGraphic motif={motif} isDark={isDark} />}</div>
      <div className="vant-loader-eyebrow" dir="ltr">THE VANT COLLECTION</div>
      <h1 id="vant-loader-title" dir="ltr">VANT<span dir="rtl">فانت</span></h1>
      <p className="vant-loader-description">تفاصيل تُختار بعناية.<br /><span dir="ltr">Considered in every detail.</span></p>
      <div className="vant-loader-status" role="status" aria-live="polite" aria-atomic="true">
        <span className="vant-loader-status-icon" aria-hidden="true">{ready ? <Check size={17} /> : <span className="vant-loader-wait" />}</span>
        <div><p dir="rtl">{ready ? (isPreview ? 'اكتملت المعاينة' : 'التشكيلة جاهزة') : loadingTextAr}</p><p dir="ltr">{ready ? (isPreview ? 'Preview complete · replay or close' : 'Ready to explore') : loadingTextEn}</p></div>
      </div>
    </section>
    <footer className="vant-loader-footer">
      <div className="vant-loader-footer-label"><span>{isPreview ? 'معاينة فقط · بدون تغيير إعدادات المتجر' : 'أهلاً بك في فانت'}</span><ArrowUpRight size={17} aria-hidden="true" /></div>
      <div className={`vant-loader-track ${ready ? 'vant-loader-track--ready' : ''}`} role="progressbar" aria-label={isPreview ? 'معاينة التحميل' : 'تجهيز المتجر'} aria-valuetext={ready ? (isPreview ? 'اكتملت المعاينة' : 'جاهز') : 'جاري التجهيز'}><span /></div>
    </footer>
  </motion.div>}</AnimatePresence>, document.body);
}

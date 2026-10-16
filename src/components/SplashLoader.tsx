import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import type { SplashMotifType } from '../context/SiteControlsContext';
import type { Theme } from '../types';
import BrandLogo from './splash/BrandLogo';

interface Props {
  isLoading: boolean;
  loadingTextEn?: string;
  loadingTextAr?: string;
  /** Kept for App.tsx compatibility; the splash no longer draws motif graphics. */
  motif?: SplashMotifType;
  theme?: Theme;
  onToggleTheme?: () => void;
  isPreview?: boolean;
  onClosePreview?: () => void;
  onFinished?: () => void;
}

const MIN_VISIBLE_MS = 400;
const MAX_VISIBLE_MS = 4000;
// Old stock texts from settings; swap them for a short friendly line.
const STOCK_TEXTS = ['INITIALIZING ARCHIVE', 'جاري تحميل الأرشيف وتجهيز التشكيلة', 'جاري تجهيز الكتالوج والقطع الحصرية'];

export default function SplashLoader({
  isLoading,
  loadingTextEn,
  loadingTextAr,
  theme,
  isPreview = false,
  onClosePreview,
  onFinished,
}: Props) {
  const [visible, setVisible] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);
  const reduceMotion = useReducedMotion();

  const isDark = theme ? theme === 'dark' : document.documentElement.classList.contains('dark');
  const root = document.documentElement;
  const isAr = root.dir === 'rtl' || root.lang.startsWith('ar');
  const pick = (text: string | undefined, fallback: string) =>
    text?.trim() && !STOCK_TEXTS.includes(text.trim()) ? text.trim() : fallback;
  const text = isAr ? pick(loadingTextAr, 'لحظة ونجهزلك التشكيلة') : pick(loadingTextEn, 'Getting the collection ready');

  // Minimum visible time + hard cap so a stalled load never traps the visitor.
  useEffect(() => {
    if (isPreview) return;
    const min = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    const cap = setTimeout(() => setVisible(false), MAX_VISIBLE_MS);
    return () => {
      clearTimeout(min);
      clearTimeout(cap);
    };
  }, [isPreview]);

  useEffect(() => {
    if (!isPreview && minElapsed && !isLoading) setVisible(false);
  }, [isPreview, minElapsed, isLoading]);

  // Lock page scroll while the splash covers the store.
  useEffect(() => {
    if (!visible) return;
    const html = document.documentElement;
    const prev = [html.style.overflow, document.body.style.overflow];
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev[0];
      document.body.style.overflow = prev[1];
    };
  }, [visible]);

  const handleExitComplete = () => {
    onFinished?.();
    if (isPreview) onClosePreview?.();
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="vant-splash"
          role="status"
          aria-live="polite"
          aria-label={text}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.15 : 0.3, ease: 'easeOut' } }}
          className={`fixed inset-0 z-[9999] flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-4 font-sans select-none ${
            isDark ? 'bg-[#0d0f12] text-[#f3f4f6]' : 'bg-[#f8f9fa] text-[#15171c]'
          }`}
          style={{
            paddingTop: 'max(1rem, env(safe-area-inset-top))',
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          }}
        >
          {isPreview && (
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label={isAr ? 'إغلاق المعاينة' : 'Close preview'}
              className={`absolute top-[max(1rem,env(safe-area-inset-top))] end-4 inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-xs font-semibold shadow-sm transition-colors cursor-pointer ${
                isDark
                  ? 'border-white/15 bg-[#181b22] text-[#f3f4f6] hover:bg-white/10'
                  : 'border-black/10 bg-white text-[#15171c] hover:bg-black/[0.04]'
              }`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span>{isAr ? 'إغلاق المعاينة' : 'Close preview'}</span>
            </button>
          )}

          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex w-full max-w-xs flex-col items-center gap-6 text-center"
          >
            <BrandLogo className="text-[26px] sm:text-[34px]" />

            <div
              className={`relative h-[3px] w-40 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-black/[0.08]'}`}
              aria-hidden="true"
            >
              <motion.span
                className={`absolute inset-y-0 left-0 w-1/3 rounded-full ${isDark ? 'bg-[#3b82f6]' : 'bg-[#004ad7]'}`}
                initial={{ x: reduceMotion ? '100%' : '-100%' }}
                animate={reduceMotion ? undefined : { x: '300%' }}
                transition={{ duration: 1.1, ease: 'easeInOut', repeat: Infinity }}
              />
            </div>

            <p
              dir={isAr ? 'rtl' : 'ltr'}
              className={`text-sm font-medium ${isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}
            >
              {text}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

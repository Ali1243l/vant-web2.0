import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SplashMotifType } from '../context/SiteControlsContext';
import type { Theme } from '../types';
import FashionMotifGraphic from './splash/FashionMotifGraphic';
import Spinner from './ui/Spinner';

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

export default function SplashLoader({
  isLoading,
  loadingTextEn = 'INITIALIZING ARCHIVE',
  loadingTextAr = 'جاري تجهيز الكتالوج والقطع الحصرية',
  motif = 'hanger',
  theme = 'dark',
  onToggleTheme,
  isPreview = false,
  onClosePreview,
  onFinished,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [nameToggle, setNameToggle] = useState<'en' | 'ar'>('en');

  const isDark = theme === 'dark';

  // Calm, luxury bilingual rhythm (switches every 2.8s)
  useEffect(() => {
    const interval = setInterval(() => {
      setNameToggle((prev) => (prev === 'en' ? 'ar' : 'en'));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Smooth cinematic progress bar interpolation with balanced luxury pacing
  useEffect(() => {
    setProgress(0);
    setShouldRender(true);

    let timer: NodeJS.Timeout;
    const startTime = Date.now();
    const duration = isPreview ? 1500 : 850; // Snappy & ultra-fluid load for instant store responsiveness

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        timer = setTimeout(updateProgress, 16);
      }
    };

    updateProgress();

    return () => clearTimeout(timer);
  }, [isPreview, replayKey]);

  // Real visitor auto-exit once progress reaches 100% and data is ready
  useEffect(() => {
    if (!isPreview && progress >= 100) {
      const exitDelay = isLoading ? 120 : 60;
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, exitDelay);
      return () => clearTimeout(timeout);
    }
  }, [isPreview, isLoading, progress]);

  // Strict page scroll locking while Splash Loader is displayed
  useEffect(() => {
    if (shouldRender) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevBodyTouchAction = document.body.style.touchAction;
      const prevHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.body.style.touchAction = prevBodyTouchAction;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [shouldRender]);

  const handleExitComplete = () => {
    onFinished?.();
    if (isPreview) {
      onClosePreview?.();
    }
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {shouldRender && (
        <motion.div
          key={`vant-splash-screen-${replayKey}`}
          initial={{ opacity: 1, y: 0 }}
          exit={{
            y: '-100%',
            opacity: 0.98,
            transition: {
              duration: 0.38,
              ease: [0.22, 1, 0.36, 1], // Couture velvet curtain lift (crisp & silky)
            },
          }}
          onClick={() => {
            if (!isPreview && progress > 40) {
              setShouldRender(false);
            }
          }}
          className={`fixed inset-0 h-[100dvh] min-h-[100dvh] w-full z-[9999] flex flex-col items-center justify-between select-none overflow-hidden touch-none overscroll-none transition-colors duration-500 font-sans border-b ${
            isDark
              ? 'bg-[#07090e] text-white border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.8)]'
              : 'bg-gradient-to-b from-[#ffffff] via-[#f7f9fd] to-[#edf2f9] text-[#06080e] border-black/10 shadow-[0_20px_50px_rgba(0,74,215,0.15)]'
          }`}
        >
          {/* Ambient Luxury Spotlight (Responsive to Dark / Blue Mode vs White Mode) */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[320px] w-[320px] sm:h-[560px] sm:w-[560px] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              isDark
                ? 'bg-[radial-gradient(ellipse_at_center,rgba(0,74,215,0.24),transparent_70%)]'
                : 'bg-[radial-gradient(ellipse_at_center,rgba(0,74,215,0.14)_0%,rgba(99,102,241,0.06)_42%,transparent_70%)]'
            }`}
          />

          {/* Top Bar with Brand Badge & Controls */}
          <motion.div
            exit={{ opacity: 0, y: -20, transition: { duration: 0.25, ease: 'easeIn' } }}
            className="w-full pt-4 sm:pt-10 px-4 sm:px-12 flex flex-wrap items-center justify-between gap-2 sm:gap-3 z-10 text-[9.5px] sm:text-[10.5px] font-mono tracking-wider sm:tracking-widest uppercase"
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#004ad7] animate-pulse" />
              <span className={`font-bold tracking-[0.2em] sm:tracking-[0.25em] ${isDark ? 'text-white/80' : 'text-[#06080e]'}`}>
                VANT
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isPreview ? (
                <>
                  <span
                    className={`rounded-full px-2.5 sm:px-3 py-1 font-bold text-[9.5px] sm:text-[10px] tracking-wider uppercase border ${
                      isDark
                        ? 'bg-white/10 text-white/90 border-white/20'
                        : 'bg-white/80 text-[#06080e] border-black/15 shadow-sm'
                    }`}
                  >
                    {progress >= 100 ? 'PREVIEW READY' : 'PREVIEWING'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setReplayKey((k) => k + 1)}
                    className={`rounded-full px-2.5 sm:px-3 py-1 font-bold text-[9.5px] sm:text-[10.5px] cursor-pointer transition-all active:scale-95 border ${
                      isDark
                        ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                        : 'bg-white/90 hover:bg-white text-[#06080e] border-black/15 shadow-sm'
                    }`}
                  >
                    إعادة التشغيل ↻
                  </button>

                  <button
                    type="button"
                    onClick={() => setShouldRender(false)}
                    className={`rounded-full px-3 sm:px-3.5 py-1 font-extrabold text-[10px] sm:text-[11px] cursor-pointer transition-all active:scale-95 shadow-md ${
                      isDark ? 'bg-white hover:bg-white/90 text-black' : 'bg-[#06080e] hover:bg-black text-white'
                    }`}
                  >
                    ✕ إغلاق
                  </button>
                </>
              ) : (
                <span className={`tracking-[0.2em] sm:tracking-[0.3em] font-light text-[9.5px] sm:text-[10.5px] ${isDark ? 'text-white/40' : 'text-[#06080e]/60'}`}>
                  COLLECTION 2026
                </span>
              )}
            </div>
          </motion.div>

          {/* Centerpiece: Precision Fashion Graphic + Bilingual Kinetic VANT */}
          <motion.div
            exit={{
              scale: 1.04,
              y: -25,
              opacity: 0,
              filter: 'blur(10px)',
              transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
            }}
            className="flex flex-col items-center justify-center text-center px-4 sm:px-6 z-10 my-auto w-full max-w-xl space-y-3.5 sm:space-y-6"
          >
            {/* Fashion Graphic Container with Balanced Proportions */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center"
            >
              <FashionMotifGraphic motif={motif} isDark={isDark} />
            </motion.div>

            {/* Calm, Silk-Smooth Bilingual Morphing Brand Name (VANT <-> ڤانت) */}
            <div className="h-20 sm:h-36 flex items-center justify-center relative w-full overflow-hidden">
              <AnimatePresence mode="wait">
                {nameToggle === 'en' ? (
                  <motion.div
                    key="brand-en"
                    initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center"
                  >
                    <h1
                      className={`font-black text-4xl xs:text-5xl sm:text-7xl md:text-8xl tracking-[0.22em] sm:tracking-[0.28em] pl-[0.22em] sm:pl-[0.28em] uppercase ${
                        isDark
                          ? 'text-white drop-shadow-[0_0_40px_rgba(59,130,246,0.35)]'
                          : 'text-[#06080e] drop-shadow-[0_8px_32px_rgba(0,74,215,0.18)]'
                      }`}
                    >
                      VANT
                    </h1>
                    <span
                      className={`block mt-1.5 sm:mt-2.5 text-[9px] xs:text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.45em] uppercase font-semibold pl-[0.3em] sm:pl-[0.45em] ${
                        isDark ? 'text-white/50' : 'text-[#06080e]/75'
                      }`}
                    >
                      EDITORIAL STREETWEAR
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="brand-ar"
                    initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center"
                    dir="rtl"
                  >
                    <h1
                      className={`font-black text-4xl xs:text-5xl sm:text-7xl md:text-8xl tracking-wide sm:tracking-wider ${
                        isDark
                          ? 'text-white drop-shadow-[0_0_40px_rgba(59,130,246,0.35)]'
                          : 'text-[#06080e] drop-shadow-[0_8px_32px_rgba(0,74,215,0.18)]'
                      }`}
                    >
                      ڤــانـت
                    </h1>
                    <span
                      className={`block mt-1.5 sm:mt-2.5 text-[11px] sm:text-sm tracking-wide sm:tracking-widest font-semibold ${
                        isDark ? 'text-white/60' : 'text-[#06080e]/80'
                      }`}
                    >
                      أزياء راقية وتصاميم حصرية
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dynamic Status / Loading Message (High-Contrast Glass Pill) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className={`rounded-xl sm:rounded-2xl border px-4 py-2.5 sm:px-6 sm:py-3.5 max-w-xs sm:max-w-md w-full space-y-1 sm:space-y-1.5 backdrop-blur-2xl transition-all ${
                isDark
                  ? 'border-white/10 bg-white/[0.03] shadow-2xl text-white'
                  : 'border-black/[0.08] bg-white/80 shadow-[0_12px_40px_rgba(0,74,215,0.10),0_2px_8px_rgba(0,0,0,0.04)] text-[#06080e]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    progress >= 100
                      ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                      : 'bg-[#004ad7] animate-ping'
                  }`}
                />
                <p
                  className={`text-[10.5px] sm:text-xs font-mono tracking-wider sm:tracking-widest uppercase font-bold ${
                    isDark ? 'text-white/90' : 'text-[#06080e]'
                  }`}
                >
                  {progress >= 100 ? 'READY FOR ARCHIVE' : loadingTextEn}
                </p>
              </div>
              <p
                dir="rtl"
                className={`text-[11px] sm:text-[13px] font-semibold ${
                  isDark ? 'text-white/60' : 'text-[#06080e]/80'
                }`}
              >
                {progress >= 100 ? 'اكتمل التجهيز · جاري عرض التشكيلة' : loadingTextAr}
              </p>
            </motion.div>
          </motion.div>

          {/* Bottom Hairline Progress Bar & Metrics */}
          <motion.div
            exit={{ opacity: 0, y: 20, transition: { duration: 0.25, ease: 'easeIn' } }}
            className="w-full pb-5 sm:pb-10 px-5 sm:px-12 z-10 space-y-2 sm:space-y-2.5 max-w-2xl mx-auto"
          >
            <div
              className={`flex items-center justify-between text-[9.5px] sm:text-[10.5px] font-mono tracking-wider ${
                isDark ? 'text-white/50' : 'text-[#06080e]/75'
              }`}
            >
              <span className="flex items-center gap-2">
                <Spinner size="xs" color="#004ad7" />
                <span className="tracking-widest uppercase font-semibold">{progress >= 100 ? 'READY' : 'LOADING'}</span>
              </span>
              <span className={`tabular-nums font-black text-xs ${isDark ? 'text-white' : 'text-[#004ad7]'}`}>{progress}%</span>
            </div>

            {/* Minimalist 2px Monochrome & Blue Hairline Track */}
            <div
              className={`relative h-[2px] w-full overflow-hidden rounded-full ${
                isDark ? 'bg-white/10' : 'bg-black/[0.08]'
              }`}
            >
              <motion.div
                className={`h-full bg-gradient-to-r ${
                  isDark
                    ? 'from-[#004ad7] via-[#3b82f6] to-white'
                    : 'from-[#004ad7] via-[#2563eb] to-[#06080e]'
                }`}
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

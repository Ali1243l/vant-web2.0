import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowDown, Sparkles, X, ArrowUpRight, Compass } from 'lucide-react';
import type { Product, Language } from '../../types';
import { useSiteControls } from '../../context/SiteControlsContext';

export interface HeroParallaxProps {
  products?: Product[];
  heroImage?: string;
  models?: string[];
  lang?: Language;
  title?: string;
  subtitle?: string;
  onExplore?: () => void;
  isOpen?: boolean;
  onDismiss?: () => void;
  onSelectProduct?: (product: Product) => void;
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
}

// Fallback high-fashion editorial streetwear model image for initial testing
const DEFAULT_TEST_IMAGE =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1800&auto=format&fit=crop';

export const HeroParallax: React.FC<HeroParallaxProps> = ({
  products = [],
  heroImage,
  models = [],
  lang = 'ar',
  title,
  subtitle,
  onExplore,
  isOpen = true,
  onDismiss,
  onSelectProduct,
  onSelectCategory,
  activeCategory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAr = lang === 'ar';
  const { getControl } = useSiteControls();

  // Admin controls integration: whatever image admin uploads is used here
  const heroBgControl = getControl('banner_hero_bg');
  const heroTitleControl = getControl('banner_hero_title');
  const heroSubtitleControl = getControl('banner_hero_subtitle');
  const heroTagControl = getControl('banner_hero_tag');
  const heroBtnControl = getControl('banner_hero_btn');

  const adminImage = heroBgControl?.actionValue?.trim();
  // Display priority: explicit heroImage prop > admin uploaded image > default test image
  const displayImage = heroImage || (adminImage && adminImage.length > 0 ? adminImage : DEFAULT_TEST_IMAGE);

  // 1. Scroll-driven motion with framer-motion useScroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Smooth out parallax transforms with high-response springs for cinematic liquid motion
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  // Layer 2: Bold "VANT" background typography parallax (drifts upward & fades gently)
  const yVant = useTransform(smoothProgress, [0, 1], [-40, -180]);
  const opacityVant = useTransform(smoothProgress, [0, 0.65, 1], [0.85, 0.45, 0.1]);
  const scaleVant = useTransform(smoothProgress, [0, 1], [0.98, 1.08]);

  // Layer 1: Single Hero Model Image parallax
  const yCenterModel = useTransform(smoothProgress, [0, 1], [-20, 80]);
  const scaleCenter = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.015, 0.98]);

  // Layer 3: Light geometric accents & metadata badges (fast high-velocity parallax)
  const yGeometricFast = useTransform(smoothProgress, [0, 1], [60, -220]);
  const yGeometricSlow = useTransform(smoothProgress, [0, 1], [20, -100]);
  const rotateDashedRing = useTransform(smoothProgress, [0, 1], [0, 90]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.section
        ref={containerRef}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        aria-label="VANT Haute Parallax Hero"
        className="relative w-full overflow-hidden select-none my-3 md:my-6 rounded-3xl border border-black/8 dark:border-white/10 bg-gradient-to-b from-white/40 via-white/10 to-transparent dark:from-white/[0.03] dark:via-transparent dark:to-transparent backdrop-blur-md shadow-xs"
      >
        {/* Dismiss Button (Discreet Luxury Close) */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={isAr ? 'إغلاق البانر' : 'Dismiss banner'}
            className="absolute top-4 end-4 z-40 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[#15171c]/70 dark:text-white/70 backdrop-blur-md transition-all hover:bg-black/10 dark:hover:bg-white/20 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Ambient Subtle Glow Orbs (Zero solid colors, fully theme-adaptive) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[380px] w-[620px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,74,215,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent_70%)] blur-3xl"
        />

        {/* ============================================================== */}
        {/* LAYER 2: BOLD "VANT" CINEMATIC TYPOGRAPHY BACKGROUND           */}
        {/* ============================================================== */}
        <motion.div
          style={{ y: yVant, opacity: opacityVant, scale: scaleVant }}
          aria-hidden="true"
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0"
        >
          <div className="relative flex flex-col items-center justify-center">
            {/* Giant Latin Kinetic Logo */}
            <h1 className="text-[17vw] sm:text-[18vw] lg:text-[19vw] font-black uppercase tracking-[0.16em] leading-none text-black/[0.04] dark:text-white/[0.06] font-sans antialiased text-center">
              VANT
            </h1>

            {/* Arabic Kinetic Watermark */}
            <span className="absolute -bottom-4 sm:-bottom-8 text-[4vw] sm:text-[3.2vw] font-black tracking-[0.3em] text-black/[0.03] dark:text-white/[0.04]">
              فـانـت • خريف وشتاء
            </span>
          </div>
        </motion.div>

        {/* ============================================================== */}
        {/* LAYER 3: LIGHT GEOMETRIC ELEMENTS & METADATA ACCENTS           */}
        {/* ============================================================== */}
        <motion.div
          style={{ y: yGeometricFast }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 p-5 sm:p-8 flex flex-col justify-between"
        >
          {/* Top Geometry Line & Badges */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <span className="text-black/30 dark:text-white/30 font-mono text-[10px] sm:text-xs">
                + 33.3152° N, 44.3661° E
              </span>
              <span className="h-3 w-px bg-black/10 dark:bg-white/15" />
              <div className="flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/10 bg-white/60 dark:bg-white/5 px-2.5 py-0.5 backdrop-blur-md text-[9.5px] sm:text-[10.5px] font-mono uppercase tracking-wider text-black/70 dark:text-white/80">
                <Sparkles className="h-2.5 w-2.5 text-[#004ad7] dark:text-[#60a5fa]" />
                <span>HAUTE COUTURE 2026</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-black/30 dark:text-white/30 font-mono text-xs">
              <span>[ VANT-LAB // VOL. 04 ]</span>
            </div>
          </div>

          {/* Bottom Floating Technical Details */}
          <div className="flex items-end justify-between w-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-mono font-medium tracking-wide text-black/60 dark:text-white/60">
                  {isAr ? 'الإصدار الحصري متوفر الآن' : 'EDITORIAL DROP ACTIVE'}
                </span>
              </div>
              <span className="text-[9px] font-mono text-black/30 dark:text-white/30">
                FABRICATED IN LIMITED EDITIONS
              </span>
            </div>

            {/* Rotating Subtle Geometry Compass */}
            <motion.div
              style={{ rotate: rotateDashedRing }}
              className="hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-black/15 dark:border-white/20 text-black/30 dark:text-white/30"
            >
              <Compass className="h-5 w-5 stroke-[1.4]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Corner Micro Geometric Crosshairs */}
        <div aria-hidden="true" className="pointer-events-none absolute top-3 left-3 text-black/20 dark:text-white/25 font-mono text-xs">+</div>
        <div aria-hidden="true" className="pointer-events-none absolute top-3 right-3 text-black/20 dark:text-white/25 font-mono text-xs">+</div>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 text-black/20 dark:text-white/25 font-mono text-xs">+</div>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 text-black/20 dark:text-white/25 font-mono text-xs">+</div>

        {/* ============================================================== */}
        {/* LAYER 1: MODELS SHOWCASE & INTERACTIVE EDITORIAL CARDS         */}
        {/* ============================================================== */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-12 sm:pb-14 flex flex-col items-center">
          {/* Header Narrative & Action Trigger */}
          <motion.div
            style={{ y: yGeometricSlow }}
            className="text-center max-w-2xl mb-8 sm:mb-12 relative z-30"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-black/8 dark:border-white/15 bg-white/70 dark:bg-white/10 px-3 py-1 mb-3.5 backdrop-blur-md shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#004ad7] dark:bg-[#3b82f6]" />
              <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#15171c] dark:text-white">
                {title || (isAr ? 'المجموعة الحصرية 2026' : 'EDITORIAL PARALLAX DROP 2026')}
              </span>
            </div>

            <p className="text-xs sm:text-sm md:text-[15px] font-normal leading-relaxed text-[#15171c]/80 dark:text-neutral-300 max-w-xl mx-auto px-4">
              {subtitle ||
                (isAr
                  ? 'أناقة الستريت وير المعاصر بقصات أوفرسايزد وتفاصيل فاخرة منتقاة بعناية لتعكس هويتك المتفردة.'
                  : 'Contemporary oversized streetwear silhouettes engineered with high-density textiles and luxury tailoring.')}
            </p>

            {/* Explore Button */}
            {onExplore && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onExplore}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#15171c] dark:bg-white text-white dark:text-[#15171c] px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all hover:opacity-90 active:scale-95 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <span>{isAr ? 'تصفح التشكيلة الكاملة' : 'Explore Collection'}</span>
                  <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Cinematic Single-Image Parallax Showcase (Connected to Admin Upload) */}
          <div className="relative w-full max-w-5xl flex items-center justify-center">
            <motion.div
              style={{
                y: yCenterModel,
                scale: scaleCenter,
              }}
              whileHover={{ scale: 1.015 }}
              onClick={onExplore}
              className="relative w-full max-w-5xl h-[320px] sm:h-[420px] md:h-[500px] lg:h-[540px] rounded-3xl md:rounded-[36px] overflow-hidden border border-black/12 dark:border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] bg-black/5 dark:bg-white/5 backdrop-blur-md cursor-pointer transition-shadow hover:shadow-[0_28px_75px_-15px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_30px_85px_-15px_rgba(0,0,0,0.95)] z-20 group ring-1 ring-black/5 dark:ring-white/10"
            >
              <img
                src={displayImage}
                alt={isAr ? (heroTitleControl?.label_ar || 'بانر فانت الحصري') : (heroTitleControl?.label_en || 'VANT Editorial Hero')}
                loading="eager"
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-104"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-5 sm:p-8 md:p-10 text-white">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 dark:bg-white/15 px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    <span>{isAr ? (heroTagControl?.label_ar || 'الإصدار الحصري 2026') : (heroTagControl?.label_en || 'EXCLUSIVE DROP 2026')}</span>
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-white/80 tracking-wider">
                    [ MAISON VANT // PARALLAX ]
                  </span>
                </div>

                <h2 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight max-w-2xl drop-shadow-md">
                  {isAr
                    ? (heroTitleControl?.label_ar || 'الصياغة المعمارية للأزياء الهادئة — قطع نادرة من الصوف الإيطالي والكشمير')
                    : (heroTitleControl?.label_en || 'Architectural Silhouettes & Luxury High-Streetwear')}
                </h2>

                <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-white/15">
                  <span className="text-xs sm:text-sm text-neutral-300 font-medium">
                    {isAr ? (heroSubtitleControl?.label_ar || 'انقر لتصفح كامل التشكيلة والمعروضات') : (heroSubtitleControl?.label_en || 'Click to explore the full collection')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all">
                    <span>{isAr ? (heroBtnControl?.label_ar || 'تصفح الكتالوج') : (heroBtnControl?.label_en || 'Explore Catalog')}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
};

export default HeroParallax;

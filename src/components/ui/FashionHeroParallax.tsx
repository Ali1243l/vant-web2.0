import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';

export interface LookbookItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  tag?: string;
}

export interface FashionHeroParallaxProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  items?: {
    center: LookbookItem;
    left: LookbookItem;
    right: LookbookItem;
  };
}

const DEFAULT_ITEMS: {
  center: LookbookItem;
  left: LookbookItem;
  right: LookbookItem;
} = {
  center: {
    id: 'hero-center',
    title: 'OVERSIZED PUFFER & CARGO',
    subtitle: 'Editorial Look 01',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    tag: 'NEW DROP 2026',
  },
  left: {
    id: 'hero-left',
    title: 'MONOCHROME GRAPHIC HOODIE',
    subtitle: 'Editorial Look 02',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    tag: 'ESSENTIALS',
  },
  right: {
    id: 'hero-right',
    title: 'CYBERPUNK UTILITY VEST',
    subtitle: 'Editorial Look 03',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop',
    tag: 'LIMITED',
  },
};

/**
 * FashionHeroParallax Component
 * Luxury Streetwear Hero Section featuring Parallax Depth Effect.
 * Uses Framer Motion's useScroll and useTransform for multi-speed Y-axis translation.
 */
export const FashionHeroParallax: React.FC<FashionHeroParallaxProps> = ({
  badge = 'URBAN STREETWEAR 2026',
  title = 'NEW COLLECTION',
  subtitle = 'Elevate your aesthetic with oversized silhouettes, heavyweight textiles & technical streetwear design.',
  ctaText = 'DISCOVER LOOKBOOK',
  onCtaClick,
  items = DEFAULT_ITEMS,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll position within the hero viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Distinct parallax velocities (Y-axis translate) for 3 depth layers
  const yLeft = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const yCenter = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const yRight = useTransform(scrollYProgress, [0, 1], [0, 300]);

  // Subtle organic rotation & scale transforms
  const rotateLeft = useTransform(scrollYProgress, [0, 1], [-2, -7]);
  const rotateRight = useTransform(scrollYProgress, [0, 1], [2, 7]);
  const scaleCenter = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  // Smooth fade-out for headline & CTA during scroll down
  const titleOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.45], [0, -70]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[140vh] w-full bg-neutral-950 text-white overflow-hidden select-none"
    >
      {/* Ambient glowing atmosphere overlays */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Sticky Fullscreen Hero Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between px-4 sm:px-8 py-8 sm:py-12 overflow-hidden">
        
        {/* Animated Headline Overlay */}
        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="relative z-30 flex flex-col items-center text-center max-w-4xl mx-auto pt-4 sm:pt-10"
        >
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs tracking-widest font-mono uppercase text-white/90 mb-4 shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{badge}</span>
            </div>
          )}

          <h1 className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent drop-shadow-2xl">
            {title}
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-base text-neutral-300 max-w-xl font-light leading-relaxed px-4">
            {subtitle}
          </p>

          {ctaText && (
            <button
              onClick={onCtaClick}
              className="mt-6 px-8 py-3.5 rounded-full bg-white text-black font-semibold tracking-wider text-xs uppercase hover:bg-neutral-200 transition-all shadow-2xl hover:scale-105 active:scale-95"
            >
              {ctaText}
            </button>
          )}
        </motion.div>

        {/* 3-Image Parallax Lookbook Grid */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-4 sm:px-12">
          <div className="grid grid-cols-12 gap-4 sm:gap-8 w-full max-w-7xl items-center">
            
            {/* Left Lookbook Card (Fast Scroll) */}
            <motion.div
              style={{ y: yLeft, rotate: rotateLeft }}
              className="col-span-3 hidden sm:block pointer-events-auto"
            >
              <div className="group relative rounded-2xl overflow-hidden border border-white/15 bg-neutral-900/80 shadow-2xl backdrop-blur-sm aspect-[3/4]">
                <img
                  src={items.left.imageUrl}
                  alt={items.left.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  {items.left.tag && (
                    <span className="text-[10px] font-mono tracking-widest uppercase bg-white/20 text-white px-2 py-0.5 rounded backdrop-blur-md">
                      {items.left.tag}
                    </span>
                  )}
                  <p className="text-xs font-bold uppercase mt-1 text-white line-clamp-1">
                    {items.left.title}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Center Main Lookbook Card (Primary Depth) */}
            <motion.div
              style={{ y: yCenter, scale: scaleCenter }}
              className="col-span-12 sm:col-span-6 pointer-events-auto z-20"
            >
              <div className="group relative rounded-3xl overflow-hidden border border-white/20 bg-neutral-900 shadow-2xl aspect-[3/4] max-h-[50vh] sm:max-h-[60vh] mx-auto">
                <img
                  src={items.center.imageUrl}
                  alt={items.center.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    {items.center.tag && (
                      <span className="text-xs font-mono tracking-widest uppercase bg-primary text-white px-2.5 py-1 rounded-md">
                        {items.center.tag}
                      </span>
                    )}
                    <h3 className="text-base sm:text-2xl font-black uppercase text-white mt-2">
                      {items.center.title}
                    </h3>
                    {items.center.subtitle && (
                      <p className="text-xs text-neutral-300 font-mono mt-0.5">
                        {items.center.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Lookbook Card (Fast Offset Scroll) */}
            <motion.div
              style={{ y: yRight, rotate: rotateRight }}
              className="col-span-3 hidden sm:block pointer-events-auto"
            >
              <div className="group relative rounded-2xl overflow-hidden border border-white/15 bg-neutral-900/80 shadow-2xl backdrop-blur-sm aspect-[3/4]">
                <img
                  src={items.right.imageUrl}
                  alt={items.right.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  {items.right.tag && (
                    <span className="text-[10px] font-mono tracking-widest uppercase bg-white/20 text-white px-2 py-0.5 rounded backdrop-blur-md">
                      {items.right.tag}
                    </span>
                  )}
                  <p className="text-xs font-bold uppercase mt-1 text-white line-clamp-1">
                    {items.right.title}
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="relative z-30 flex flex-col items-center justify-center gap-1 text-neutral-400 text-[10px] sm:text-xs font-mono tracking-widest pb-2"
        >
          <span>SCROLL TO EXPLORE</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-white/70" />
        </motion.div>

      </div>
    </section>
  );
};

export default FashionHeroParallax;

import React from 'react';
import { motion } from 'framer-motion';
import type { SplashMotifType } from '../../context/SiteControlsContext';
import StudioMotifGraphic from './StudioMotifGraphic';
import ChiseledLuxuryV from './ChiseledLuxuryV';

export interface FashionMotifGraphicProps {
  motif: SplashMotifType;
  isDark: boolean;
}

export default function FashionMotifGraphic({ motif, isDark }: { motif: SplashMotifType; isDark: boolean }) {
  const mainStroke = isDark ? '#ffffff' : '#090a0f';
  const subStroke = isDark ? '#94a3b8' : '#334155';
  const faintStroke = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(9,10,15,0.22)';
  const cobalt = isDark ? '#3b82f6' : '#004ad7';
  const garmentFill = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(9,10,15,0.025)';

  if (motif !== 'tshirt_print') return <StudioMotifGraphic motif={motif} isDark={isDark} />;

  if (motif === 'tshirt_print') {
    return (
      <motion.div
        animate={{ y: [0, -3.5, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 ${
          isDark
            ? 'filter drop-shadow-[0_12px_28px_rgba(59,130,246,0.18)]'
            : 'filter drop-shadow-[0_12px_28px_rgba(0,74,215,0.10)]'
        }`}
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Subtle Garment Fill (Underneath, No Center Stroke) */}
          <path
            d="M50 25 C40 25 34 22 34 18 L14 27 L17 47 L28 42 L27 82 Q50 86 73 82 L72 42 L83 47 L86 27 L66 18 C60 22 40 25 50 25 Z"
            fill={garmentFill}
            stroke="none"
          />

          {/* Left Half of T-Shirt Silhouette (Outer boundary only, NO center line) */}
          <motion.path
            d="M50 25 C40 25 34 22 34 18 L14 27 L17 47 L28 42 L27 82 Q38 85 50 86"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            stroke={mainStroke}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Half of T-Shirt Silhouette (Outer boundary only, NO center line) */}
          <motion.path
            d="M50 25 C60 25 66 22 66 18 L86 27 L83 47 L72 42 L73 82 Q62 85 50 86"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            stroke={mainStroke}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Ribbed Crewneck Collar */}
          <motion.path
            d="M34 18 C40 25 60 25 66 18"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            stroke={cobalt}
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {/* Back Collar Line */}
          <motion.path
            d="M34 18 C42 14 58 14 66 18"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            stroke={subStroke}
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* Clean Sleeve Stitch Accents */}
          <motion.line
            x1="16" y1="43" x2="26" y2="39"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.45 }}
            stroke={subStroke}
            strokeWidth="1.2"
            strokeDasharray="1.5 1.5"
          />
          <motion.line
            x1="84" y1="43" x2="74" y2="39"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.45 }}
            stroke={subStroke}
            strokeWidth="1.2"
            strokeDasharray="1.5 1.5"
          />

          {/* Bottom Hem Double Stitch Line */}
          <motion.path
            d="M28 80 Q50 84 72 80"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.7, pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            stroke={subStroke}
            strokeWidth="1.2"
            strokeDasharray="2 1.5"
          />

          {/* Screen Print Registration Corner Markers */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            transition={{ delay: 0.5 }}
            stroke={faintStroke}
            strokeWidth="1.2"
          >
            <path d="M35 34 H38 M35 34 V37" />
            <path d="M65 34 H62 M65 34 V37" />
            <path d="M35 64 H38 M35 64 V61" />
            <path d="M65 64 H62 M65 64 V61" />
          </motion.g>

          {/* Chiseled Roman V Monogram on Chest */}
          <ChiseledLuxuryV
            isDark={isDark}
            cobalt={cobalt}
            mainStroke={mainStroke}
            delay={0.35}
          />
        </svg>

        {/* Dynamic Fabric Print Sheen Sweep */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full blur-xl pointer-events-none ${isDark ? 'bg-[#3b82f6]/15' : 'bg-[#004ad7]/10'} animate-pulse`}
        />
      </motion.div>
    );
  }
  return null;
}

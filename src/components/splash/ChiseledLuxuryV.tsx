import React from 'react';
import { motion } from 'framer-motion';

export interface ChiseledLuxuryVProps {
  isDark: boolean;
  cobalt: string;
  mainStroke: string;
  delay?: number;
}

/**
 * Bold, Clean Chiseled Luxury V Monogram (Haute-Couture Architectural Typography)
 * Completely removed any cutting lines, slashes, or crystals; pure, prestigious typographic clarity.
 */
export default function ChiseledLuxuryV({
  isDark,
  cobalt,
  mainStroke,
  delay = 0.35,
}: ChiseledLuxuryVProps) {
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24, delay }}
    >
      {/* Soft Ambient Print Aura behind the V (Calibrated for Dark & Light Mode) */}
      <motion.ellipse
        cx="50"
        cy="48"
        rx="16"
        ry="11"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: isDark ? [0.15, 0.45, 0.15] : [0.08, 0.22, 0.08],
          scale: [0.85, 1.25, 0.85],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
        fill={cobalt}
        className="blur-md pointer-events-none"
      />

      {/* Left Serif (Top) */}
      <motion.line
        x1="36"
        y1="33"
        x2="45"
        y2="33"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.1, ease: [0.16, 1, 0.3, 1] }}
        stroke={cobalt}
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Bold Architectural Left Stem */}
      <motion.line
        x1="41"
        y1="33"
        x2="50"
        y2="62"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.65, delay: delay + 0.15, ease: [0.16, 1, 0.3, 1] }}
        stroke={cobalt}
        strokeWidth="3.8"
        strokeLinecap="round"
      />

      {/* Right Serif (Top) */}
      <motion.line
        x1="55"
        y1="33"
        x2="64"
        y2="33"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.1, ease: [0.16, 1, 0.3, 1] }}
        stroke={mainStroke}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Refined Hairline Right Stem */}
      <motion.line
        x1="59"
        y1="33"
        x2="50"
        y2="62"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.65, delay: delay + 0.15, ease: [0.16, 1, 0.3, 1] }}
        stroke={mainStroke}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </motion.g>
  );
}

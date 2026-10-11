import React from 'react';
import { motion } from 'framer-motion';
import type { SplashMotifType } from '../../context/SiteControlsContext';
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

  // 1. Screen Print Squeegee & Laser Heat Press on Authentic Streetwear Tee
  if (motif === 'print_press') {
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

          {/* Ribbed Collar Band */}
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

          {/* Sleeve Fold Lines */}
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

          {/* Bottom Hem Stitching */}
          <motion.path
            d="M28 80 Q50 84 72 80"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.7, pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            stroke={subStroke}
            strokeWidth="1.2"
            strokeDasharray="2 1.5"
          />

          {/* Chiseled Roman V Monogram on Chest */}
          <ChiseledLuxuryV
            isDark={isDark}
            cobalt={cobalt}
            mainStroke={mainStroke}
            delay={0.35}
          />
        </svg>

        {/* Ambient Print Curing Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`absolute bottom-2 h-3 w-20 rounded-full blur-md ${isDark ? 'bg-[#3b82f6]/30' : 'bg-[#004ad7]/20'} animate-pulse`}
        />
      </motion.div>
    );
  }

  // 2. VANT Streetwear Crewneck T-Shirt & DTG Print (Iconic, Simple, Clear)
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

  // 3. Royal Atelier Embroidery Hoop & Stitches
  if (motif === 'embroidery') {
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36"
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer Bamboo Embroidery Hoop */}
          <motion.circle
            cx="50"
            cy="50"
            r="32"
            initial={{ pathLength: 0, rotate: -90 }}
            animate={{ pathLength: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            stroke={mainStroke}
            strokeWidth="2.6"
          />
          {/* Hoop Metal Screw Tightener */}
          <motion.rect
            x="44"
            y="12"
            width="12"
            height="6"
            rx="1.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            fill={cobalt}
            stroke={cobalt}
          />
          <line x1="42" y1="15" x2="58" y2="15" stroke={mainStroke} strokeWidth="1.6" />

          {/* Chiseled Monogram V Embroidered inside Fabric */}
          <ChiseledLuxuryV
            isDark={isDark}
            cobalt={cobalt}
            mainStroke={mainStroke}
            delay={0.25}
          />

          {/* Fine Embroidery Cross Stitches Around Hoop Fabric */}
          <motion.path
            d="M32 46 L36 50 M36 46 L32 50 M64 46 L68 50 M68 46 L64 50 M48 30 L52 34 M52 30 L48 34 M48 70 L52 74 M52 70 L48 74"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            transition={{ delay: 0.55 }}
            stroke={subStroke}
            strokeWidth="1.4"
          />
        </svg>
      </motion.div>
    );
  }

  // 4. Architectural Coat Hanger & Silk Drape
  if (motif === 'hanger') {
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36"
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Chrome Swivel Hook */}
          <motion.path
            d="M50 24 C50 15 58 11 64 16 C69 22 62 30 50 33 L50 38"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            stroke={cobalt}
            strokeWidth="2.8"
          />
          {/* Sculpted Wood Coat Hanger Shoulders */}
          <motion.path
            d="M50 38 L14 60 C9 63 13 67 20 67 L80 67 C87 67 91 63 86 60 Z"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            stroke={mainStroke}
            strokeWidth="2.6"
          />
          {/* Flowing Silk Drape Line */}
          <motion.path
            d="M26 67 Q50 76 74 67"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeInOut' }}
            stroke={cobalt}
            strokeWidth="2.2"
          />
        </svg>
        {/* Center Faceted Diamond Stud */}
        <div className={`absolute top-[40px] left-1/2 -translate-x-1/2 h-2.5 w-2.5 rotate-45 ${isDark ? 'bg-[#3b82f6] shadow-[0_0_12px_#3b82f6]' : 'bg-[#004ad7] shadow-[0_0_10px_#004ad7]'}`} />
      </motion.div>
    );
  }

  // 5. Sartorial Tailor Needle & Silk Thread
  if (motif === 'needle_thread') {
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36"
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Polished Sewing Needle */}
          <motion.path
            d="M26 72 L78 26"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            stroke={mainStroke}
            strokeWidth="3"
          />
          {/* Needle Eyelet */}
          <motion.ellipse
            cx="76"
            cy="28"
            rx="3.4"
            ry="1.6"
            transform="rotate(-40 76 28)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            stroke={cobalt}
            fill={cobalt}
          />
          {/* Undulating Cobalt Silk Thread Wave */}
          <motion.path
            d="M76 28 Q96 18 88 40 T54 48 T20 62 T10 52"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeInOut' }}
            stroke={cobalt}
            strokeWidth="2.6"
          />
          {/* Stitch Seam Guidelines */}
          <motion.path
            d="M32 50 L38 56 M38 50 L32 56 M58 64 L64 70 M64 64 L58 70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            transition={{ delay: 0.5 }}
            stroke={subStroke}
            strokeWidth="1.4"
          />
        </svg>
      </motion.div>
    );
  }

  // 6. Couture Mannequin & Ribbon Measuring Tape
  if (motif === 'mannequin') {
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36"
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Neck Finial */}
          <motion.circle
            cx="50"
            cy="18"
            r="3.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            stroke={cobalt}
            fill={cobalt}
          />
          <motion.line x1="50" y1="21.5" x2="50" y2="28" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} stroke={mainStroke} />
          {/* Tailor Torso Form */}
          <motion.path
            d="M34 29 C36 40 40 44 38 60 L62 60 C60 44 64 40 66 29 Z"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            stroke={mainStroke}
          />
          {/* Measuring Tape with Tick Marks winding around torso */}
          <motion.path
            d="M36 35 Q50 47 64 35 M40 49 Q50 56 60 49"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeInOut' }}
            stroke={cobalt}
            strokeDasharray="2.5 2"
          />
          {/* Stand Base */}
          <motion.line x1="50" y1="60" x2="50" y2="78" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} stroke={mainStroke} transition={{ delay: 0.3 }} />
          <motion.line x1="38" y1="78" x2="62" y2="78" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} stroke={subStroke} transition={{ delay: 0.4 }} strokeWidth="2.5" />
        </svg>
      </motion.div>
    );
  }

  // 7. Tailoring Shears & Silk Fabric
  if (motif === 'scissors') {
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36"
      >
        <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Left Blade & Loop */}
          <motion.path
            d="M26 62 C18 62 18 52 26 52 C32 52 38 57 52 45 L86 28"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            stroke={mainStroke}
          />
          {/* Right Blade & Loop */}
          <motion.path
            d="M26 32 C18 32 18 42 26 42 C32 42 38 37 52 49 L86 66"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            stroke={mainStroke}
          />
          {/* Pivot Screw */}
          <motion.circle cx="52" cy="47" r="3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} fill={cobalt} stroke={cobalt} />
          {/* Fabric Drape Guidelines */}
          <motion.path
            d="M62 47 Q78 42 94 47"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.75 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            stroke={cobalt}
            strokeDasharray="2.5 2"
          />
        </svg>
      </motion.div>
    );
  }

  // 8. Geometric Monogram Emblem
  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative flex items-center justify-center h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36"
    >
      <svg viewBox="0 0 100 95" className="h-full w-full fill-none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer Diamond Shield */}
        <motion.polygon
          points="50,15 88,47 50,79 12,47"
          initial={{ pathLength: 0, rotate: -10 }}
          animate={{ pathLength: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          stroke={mainStroke}
          strokeWidth="2.6"
        />
        {/* Chiseled Monogram V inside Emblem */}
        <ChiseledLuxuryV
          isDark={isDark}
          cobalt={cobalt}
          mainStroke={mainStroke}
          delay={0.25}
        />
        {/* Orbital Compass Arc */}
        <motion.path
          d="M8 47 A42 22 0 0 1 92 47"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.65 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          stroke={cobalt}
          strokeDasharray="3 3"
        />
      </svg>
    </motion.div>
  );
}

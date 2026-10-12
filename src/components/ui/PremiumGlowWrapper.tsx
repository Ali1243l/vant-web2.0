import React from 'react';
import { motion } from 'framer-motion';

export interface PremiumGlowWrapperProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  [key: string]: any;
}

/**
 * PremiumGlowWrapper Component
 * Ultra-smooth spring hover animation that subtly lifts the product card (y: -5, scale: 1.02)
 * with a soft luxury box shadow (shadow-2xl shadow-black/10 or subtle primary accent shadow).
 */
export const PremiumGlowWrapper: React.FC<PremiumGlowWrapperProps> = ({
  children,
  className = '',
  borderColor,
  ...restProps
}) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`group relative rounded-2xl md:rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/60 dark:hover:shadow-[#004ad7]/10 transition-shadow duration-300 ${className}`}
    >
      <div className="relative z-10 w-full h-full rounded-2xl md:rounded-3xl overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};

export default PremiumGlowWrapper;

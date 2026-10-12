import React from 'react';
import { motion } from 'framer-motion';

export interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blur?: string;
  once?: boolean;
  [key: string]: any;
}

/**
 * BlurFade Component
 * Apple-style scroll reveal effect: smooth transition from blurred opacity offset (opacity: 0, filter: blur(10px), y: 20)
 * to crisp focused state (opacity: 1, filter: blur(0px), y: 0) using Framer Motion whileInView.
 */
export const BlurFade: React.FC<BlurFadeProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  yOffset = 20,
  blur = '10px',
  once = true,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        filter: `blur(${blur})`,
        y: yOffset,
      }}
      whileInView={{
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
      }}
      viewport={{ once, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default BlurFade;

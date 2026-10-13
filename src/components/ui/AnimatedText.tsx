import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  once?: boolean;
  staggerDelay?: number;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className = '',
  as = 'h2',
  once = true,
}) => {
  if (!text || typeof text !== 'string') return null;

  const Component = motion[as] || motion.h2;

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once, margin: '-50px' }}
    >
      {text}
    </Component>
  );
};

export default AnimatedText;

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion';
import { imageLensAxis, imageDetailScale, measureZoomImage } from '../../lib/imageZoomGesture';

export interface LensProps {
  children: React.ReactNode;
  zoomFactor?: number;
  lensSize?: number;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

/** Mouse inspection stays local to the image; keyboard users can move the same lens. */
export const Lens: React.FC<LensProps> = ({ children, zoomFactor = 1.8, lensSize = 140, className = '', ariaLabel = 'Enter to magnify, arrows to explore, Escape to stop', disabled = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [bounds, setBounds] = useState({ width: 0, height: 0, diameter: lensSize, factor: zoomFactor });
  const reducedMotion = useReducedMotion();
  const sampleX = useMotionValue(0);
  const sampleY = useMotionValue(0);
  const ringX = useMotionValue(0);
  const ringY = useMotionValue(0);
  useEffect(() => { if (disabled) { setHovered(false); setKeyboard(false); } }, [disabled]);
  useEffect(() => {
    const reset = () => { setHovered(false); setKeyboard(false); };
    window.addEventListener('resize', reset);
    window.addEventListener('blur', reset);
    return () => { window.removeEventListener('resize', reset); window.removeEventListener('blur', reset); };
  }, []);
  const diameter = bounds.diameter;
  const radius = diameter / 2;
  const left = useMotionTemplate`${ringX}px`;
  const top = useMotionTemplate`${ringY}px`;
  const innerLeft = useMotionTemplate`calc(${radius}px - ${sampleX}px * ${bounds.factor})`;
  const innerTop = useMotionTemplate`calc(${radius}px - ${sampleY}px * ${bounds.factor})`;
  const move = (x: number, y: number) => {
    const geometry = containerRef.current && measureZoomImage(containerRef.current);
    if (!geometry || geometry.width <= 8 || geometry.height <= 8) return false;
    const { image, bounds: rect, width, height, left, top } = geometry;
    const diameter = Math.min(lensSize, width - 8, height - 8);
    const factor = /\.svg(?:[?#]|$)|^data:image\/svg/i.test(image.currentSrc) ? zoomFactor : imageDetailScale(image.naturalWidth, width, zoomFactor, window.devicePixelRatio || 1);
    setBounds(previous => previous.width === rect.width && previous.height === rect.height && previous.diameter === diameter && previous.factor === factor ? previous : { width: rect.width, height: rect.height, diameter, factor });
    const horizontal = imageLensAxis(x, left, width, diameter);
    const vertical = imageLensAxis(y, top, height, diameter);
    sampleX.set(horizontal.sample); sampleY.set(vertical.sample);
    ringX.set(horizontal.ring); ringY.set(vertical.ring);
    return x >= left && x <= left + width && y >= top && y <= top + height;
  };
  return <div ref={containerRef} className={`relative overflow-hidden select-none ${hovered && !disabled ? 'cursor-none' : ''} ${className}`}
    tabIndex={disabled ? -1 : 0} role="group" aria-label={ariaLabel}
    onPointerMove={event => {
      if (disabled || event.pointerType !== 'mouse') return;
      const rect = event.currentTarget.getBoundingClientRect();
      const inside = move(event.clientX - rect.left, event.clientY - rect.top);
      setHovered(Boolean(inside));
      setKeyboard(false);
    }}
    onPointerLeave={() => { setHovered(false); setKeyboard(false); }} onBlur={() => setKeyboard(false)}
    onKeyDown={event => {
      if (disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); event.stopPropagation();
        move(event.currentTarget.clientWidth / 2, event.currentTarget.clientHeight / 2);
        setKeyboard(!keyboard);
      } else if (keyboard && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape'].includes(event.key)) {
        event.preventDefault(); event.stopPropagation();
        if (event.key === 'Escape') { setKeyboard(false); setHovered(false); }
        else move(sampleX.get() + (event.key === 'ArrowRight' ? 24 : event.key === 'ArrowLeft' ? -24 : 0), sampleY.get() + (event.key === 'ArrowDown' ? 24 : event.key === 'ArrowUp' ? -24 : 0));
      }
    }}>
    <div className="relative h-full w-full">{children}</div>
    <AnimatePresence>{!disabled && (hovered || keyboard) && <motion.div aria-hidden="true" data-image-lens
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .12 }}
      className="pointer-events-none absolute z-30 overflow-hidden rounded-full border border-white/60 shadow-md"
      style={{ left, top, width: diameter, height: diameter }}>
      <motion.div className="absolute" style={{ width: bounds.width, height: bounds.height, left: innerLeft, top: innerTop, scale: bounds.factor, transformOrigin: '0 0' }}>{children}</motion.div>
    </motion.div>}</AnimatePresence>
  </div>;
};

/**
 * Ambient Rays Background SVG graphic for showcase cards
 */
export const Rays: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      className={`absolute inset-0 pointer-events-none w-full h-full opacity-40 mix-blend-screen ${className}`}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_f_rays)">
        <ellipse cx="200" cy="180" rx="140" ry="100" fill="url(#paint0_linear_rays)" />
      </g>
      <defs>
        <filter id="filter0_f_rays" x="20" y="20" width="360" height="320" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <linearGradient id="paint0_linear_rays" x1="60" y1="80" x2="340" y2="280" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#8B5CF6" stopOpacity="0.5" />
          <stop offset="1" stopColor="#EC4899" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/**
 * Ambient Beams Background SVG graphic for showcase cards
 */
export const Beams: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      className={`absolute inset-0 pointer-events-none w-full h-full opacity-30 ${className}`}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M-50 200 L450 0 M-50 250 L450 50 M-50 300 L450 100" stroke="url(#beams_grad)" strokeWidth="1.5" strokeDasharray="6 6" />
      <defs>
        <linearGradient id="beams_grad" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" stopOpacity="0.6" />
          <stop offset="1" stopColor="#A855F7" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Lens;

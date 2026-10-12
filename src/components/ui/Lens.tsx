import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';

export interface LensProps {
  children: React.ReactNode;
  zoomFactor?: number;
  lensSize?: number;
  isStatic?: boolean;
  position?: { x: number; y: number };
  hovering?: boolean;
  setHovering?: (hovering: boolean) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Lens Component
 * Ultra-precise luxury optical magnifying glass.
 * Uses strict circle clip-path and absolute positioning calculation to guarantee zero edge bleeding.
 * Automatically hides default cursor on hover and renders a realistic glass reflection.
 */
export const Lens: React.FC<LensProps> = ({
  children,
  zoomFactor = 1.5,
  lensSize = 140,
  isStatic = false,
  position = { x: 0, y: 0 },
  hovering: externalHovering,
  setHovering: externalSetHovering,
  className = '',
  ariaLabel = 'Magnified view',
}) => {
  const [internalHovering, setInternalHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isHovered = externalHovering !== undefined ? externalHovering : internalHovering;

  const setHoveredState = useCallback(
    (state: boolean) => {
      if (externalSetHovering) {
        externalSetHovering(state);
      } else {
        setInternalHovering(state);
      }
    },
    [externalSetHovering]
  );

  // Motion values for ultra-smooth 60fps cursor tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Measure container dimensions on mount and resize
  const updateContainerDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    }
  }, []);

  useEffect(() => {
    updateContainerDimensions();
    window.addEventListener('resize', updateContainerDimensions);
    return () => window.removeEventListener('resize', updateContainerDimensions);
  }, [updateContainerDimensions]);

  // Detect coarse pointers / mobile viewports
  useEffect(() => {
    const checkTouch = () => {
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const isMobileWidth = window.innerWidth < 768;
      setIsTouchDevice(hasCoarsePointer || isMobileWidth);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || isStatic) return;

    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    if (containerSize.width !== rect.width || containerSize.height !== rect.height) {
      setContainerSize({ width: rect.width, height: rect.height });
    }

    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Strict clamping inside container bounds
    const radius = lensSize / 2;
    const clampedX = Math.max(radius, Math.min(rect.width - radius, rawX));
    const clampedY = Math.max(radius, Math.min(rect.height - radius, rawY));

    mouseX.set(clampedX);
    mouseY.set(clampedY);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    updateContainerDimensions();
    handleMouseMove(e);
    setHoveredState(true);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    setHoveredState(false);
  };

  // Active tracking coordinates
  const activeX = isStatic ? position.x : mouseX;
  const activeY = isStatic ? position.y : mouseY;

  // Lens circle outer position
  const ringLeft = useMotionTemplate`calc(${activeX}px - ${lensSize / 2}px)`;
  const ringTop = useMotionTemplate`calc(${activeY}px - ${lensSize / 2}px)`;

  // Inner zoomed image alignment offset
  // Calculates exact top-left position so (activeX, activeY) is placed directly at circle center
  const innerLeft = useMotionTemplate`calc(${lensSize / 2}px - ${activeX}px * ${zoomFactor})`;
  const innerTop = useMotionTemplate`calc(${lensSize / 2}px - ${activeY}px * ${zoomFactor})`;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${
        isHovered && !isTouchDevice ? 'cursor-none' : ''
      } ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base Normal Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">{children}</div>

      {/* Magnified Lens Overlay (Desktop / Pointer Active Only) */}
      {!isTouchDevice && (
        <AnimatePresence>
          {(isHovered || isStatic) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute pointer-events-none z-30 rounded-full overflow-hidden border border-white/40 dark:border-white/60 shadow-[0_12px_32px_rgba(0,0,0,0.5),inset_0_0_18px_rgba(255,255,255,0.25)] backdrop-blur-[1px]"
              style={{
                width: lensSize,
                height: lensSize,
                left: ringLeft,
                top: ringTop,
                clipPath: 'circle(50% at center)',
                WebkitClipPath: 'circle(50% at center)',
              }}
              aria-label={ariaLabel}
            >
              {/* Glossy Glass Specular Highlight Sheen */}
              <div className="absolute inset-0 z-20 pointer-events-none rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30 border border-white/20" />

              {/* Inner Scaled Content clipped strictly inside the circular lens container */}
              <motion.div
                className="absolute pointer-events-none z-10"
                style={{
                  width: containerSize.width || '100%',
                  height: containerSize.height || '100%',
                  left: innerLeft,
                  top: innerTop,
                  transform: `scale(${zoomFactor})`,
                  transformOrigin: '0 0',
                }}
              >
                <div className="w-full h-full flex items-center justify-center">{children}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
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

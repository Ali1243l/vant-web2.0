import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useSpring } from 'framer-motion';

export interface MobileTouchZoomProps {
  children: React.ReactNode;
  zoomFactor?: number;
  className?: string;
}

/**
 * MobileTouchZoom Component (Hold & Pan UX)
 * Designed for Mobile Touch Devices.
 * - TouchStart: Instantly zooms in around the touch point with smooth spring physics.
 * - TouchMove: Pans image opposite to touch location to reveal fine product details.
 * - TouchEnd/TouchCancel: Resets scale and position with a smooth spring bounce back to default.
 */
export const MobileTouchZoom: React.FC<MobileTouchZoomProps> = ({
  children,
  zoomFactor = 1.85,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTouching, setIsTouching] = useState(false);

  // Framer Motion Springs for fluid 60fps spring animations
  const scale = useSpring(1, { stiffness: 320, damping: 28 });
  const translateX = useSpring(0, { stiffness: 320, damping: 28 });
  const translateY = useSpring(0, { stiffness: 320, damping: 28 });

  const updatePanPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Clamp touch point strictly within image bounds
      const touchX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const touchY = Math.max(0, Math.min(rect.height, clientY - rect.top));

      // Calculate relative coordinate from center [-1, 1]
      const relativeX = (touchX / rect.width - 0.5) * 2;
      const relativeY = (touchY / rect.height - 0.5) * 2;

      // Maximum allowable translation to keep zoomed image edges aligned
      const maxPanX = (rect.width * (zoomFactor - 1)) / 2;
      const maxPanY = (rect.height * (zoomFactor - 1)) / 2;

      translateX.set(-relativeX * maxPanX);
      translateY.set(-relativeY * maxPanY);
    },
    [translateX, translateY, zoomFactor]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length !== 1) return;

      setIsTouching(true);
      scale.set(zoomFactor);

      const touch = e.touches[0];
      updatePanPosition(touch.clientX, touch.clientY);
    },
    [scale, updatePanPosition, zoomFactor]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isTouching || e.touches.length !== 1) return;

      const touch = e.touches[0];
      updatePanPosition(touch.clientX, touch.clientY);
    },
    [isTouching, updatePanPosition]
  );

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
    scale.set(1);
    translateX.set(0);
    translateY.set(0);
  }, [scale, translateX, translateY]);

  // Lock document body / native page scroll during touch drag gesture
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventNativeScroll = (e: TouchEvent) => {
      if (e.touches.length === 1 && isTouching) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    // Attach non-passive native touch listener to reliably prevent touch scroll
    el.addEventListener('touchmove', preventNativeScroll, { passive: false });
    return () => {
      el.removeEventListener('touchmove', preventNativeScroll);
    };
  }, [isTouching]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative overflow-hidden touch-none select-none ${className}`}
      style={{ touchAction: 'none' }}
    >
      <motion.div
        style={{
          scale,
          x: translateX,
          y: translateY,
        }}
        className="w-full h-full origin-center flex items-center justify-center"
      >
        {children}
      </motion.div>

      {/* Subtle indicator ring while panning on mobile */}
      {isTouching && (
        <div className="absolute inset-0 pointer-events-none border border-primary/30 rounded-lg shadow-inner transition-opacity duration-200" />
      )}
    </div>
  );
};

export default MobileTouchZoom;

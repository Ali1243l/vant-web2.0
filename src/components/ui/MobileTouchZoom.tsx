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
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Framer Motion Springs for fluid 60fps spring animations
  const scale = useSpring(1, { stiffness: 320, damping: 28 });
  const translateX = useSpring(0, { stiffness: 320, damping: 28 });
  const translateY = useSpring(0, { stiffness: 320, damping: 28 });

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

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
      if (e.touches.length !== 1) {
        clearHoldTimer();
        return;
      }

      const touch = e.touches[0];
      startPosRef.current = { x: touch.clientX, y: touch.clientY };
      clearHoldTimer();

      // Activate hold-to-zoom after a brief stationary press so normal swipes/scrolls remain effortless
      holdTimerRef.current = setTimeout(() => {
        setIsTouching(true);
        scale.set(zoomFactor);
        updatePanPosition(touch.clientX, touch.clientY);
      }, 220);
    },
    [clearHoldTimer, scale, updatePanPosition, zoomFactor]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      if (!isTouching) {
        const dx = Math.abs(touch.clientX - startPosRef.current.x);
        const dy = Math.abs(touch.clientY - startPosRef.current.y);
        if (dx > 8 || dy > 8) {
          clearHoldTimer();
        }
        return;
      }

      updatePanPosition(touch.clientX, touch.clientY);
    },
    [clearHoldTimer, isTouching, updatePanPosition]
  );

  const handleTouchEnd = useCallback(() => {
    clearHoldTimer();
    if (isTouching) {
      setIsTouching(false);
      scale.set(1);
      translateX.set(0);
      translateY.set(0);
    }
  }, [clearHoldTimer, isTouching, scale, translateX, translateY]);

  useEffect(() => {
    return () => clearHoldTimer();
  }, [clearHoldTimer]);

  // Lock native scroll only while active hold-to-zoom is engaged
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isTouching) return;

    const preventNativeScroll = (e: TouchEvent) => {
      if (e.touches.length === 1 && isTouching) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

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
      className={`relative overflow-hidden select-none ${isTouching ? 'touch-none' : 'touch-pan-y'} ${className}`}
      style={{ touchAction: isTouching ? 'none' : 'pan-y' }}
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

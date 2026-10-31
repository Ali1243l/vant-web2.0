import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { cancelsImageHold, imageZoomPan, IMAGE_ZOOM_HOLD_MS } from '../../lib/imageZoomGesture';

export interface MobileTouchZoomProps {
  children: React.ReactNode;
  zoomFactor?: number;
  className?: string;
}

/** Only a stationary hold takes over the gesture; ordinary swipes stay native. */
export default function MobileTouchZoom({ children, zoomFactor = 1.8, className = '' }: MobileTouchZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [touching, setTouching] = useState(false);
  const reducedMotion = useReducedMotion();
  const scale = useMotionValue(1);
  const smoothScale = useSpring(scale, { stiffness: 280, damping: 32 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 280, damping: 32 });
  const smoothY = useSpring(y, { stiffness: 280, damping: 32 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    let startX = 0;
    let startY = 0;
    const clearTimer = () => { if (timer.current !== null) clearTimeout(timer.current); timer.current = null; };
    const reset = () => {
      clearTimer(); active.current = false; setTouching(false);
      scale.set(1); x.set(0); y.set(0);
    };
    const pan = (touch: Touch) => {
      const rect = element.getBoundingClientRect();
      x.set(imageZoomPan(touch.clientX - rect.left, rect.width, zoomFactor));
      y.set(imageZoomPan(touch.clientY - rect.top, rect.height, zoomFactor));
    };
    const start = (event: TouchEvent) => {
      reset();
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      startX = touch.clientX; startY = touch.clientY;
      timer.current = setTimeout(() => {
        timer.current = null; active.current = true; setTouching(true);
        pan(touch); scale.set(zoomFactor);
      }, IMAGE_ZOOM_HOLD_MS);
    };
    const move = (event: TouchEvent) => {
      if (event.touches.length !== 1) { reset(); return; }
      const touch = event.touches[0];
      if (!active.current) {
        if (cancelsImageHold(startX, startY, touch.clientX, touch.clientY)) clearTimer();
        return;
      }
      if (event.cancelable) event.preventDefault();
      pan(touch);
    };
    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchmove', move, { passive: false });
    element.addEventListener('touchend', reset);
    element.addEventListener('touchcancel', reset);
    document.addEventListener('visibilitychange', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('resize', reset);
    return () => {
      clearTimer(); active.current = false;
      element.removeEventListener('touchstart', start);
      element.removeEventListener('touchmove', move);
      element.removeEventListener('touchend', reset);
      element.removeEventListener('touchcancel', reset);
      document.removeEventListener('visibilitychange', reset);
      window.removeEventListener('blur', reset);
      window.removeEventListener('resize', reset);
    };
  }, [scale, x, y, zoomFactor]);

  return <div ref={containerRef} data-touch-zoom={touching ? 'active' : 'idle'}
    className={`relative overflow-hidden select-none ${className}`}
    style={{ touchAction: 'pan-x pan-y pinch-zoom', WebkitTouchCallout: 'none' }}
    onContextMenu={event => { if (timer.current !== null || active.current) event.preventDefault(); }}>
    <motion.div style={{ scale: reducedMotion ? scale : smoothScale, x: reducedMotion ? x : smoothX, y: reducedMotion ? y : smoothY }} className="h-full w-full origin-center">{children}</motion.div>
  </div>;
}

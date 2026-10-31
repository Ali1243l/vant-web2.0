import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { cancelsImageHold, imageDetailScale, imageZoomPan, measureZoomImage, IMAGE_ZOOM_HOLD_MS } from '../../lib/imageZoomGesture';

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
    let geometry: ReturnType<typeof measureZoomImage> = null;
    let factor = zoomFactor;
    const clearTimer = () => { if (timer.current !== null) clearTimeout(timer.current); timer.current = null; };
    const reset = () => {
      clearTimer(); active.current = false; setTouching(false);
      scale.set(1); x.set(0); y.set(0);
    };
    const pan = (touch: Touch) => {
      if (!geometry) return;
      const { bounds, left, top, width, height } = geometry;
      x.set(imageZoomPan(touch.clientX - bounds.left - left, width, factor));
      y.set(imageZoomPan(touch.clientY - bounds.top - top, height, factor));
    };
    const start = (event: TouchEvent) => {
      reset();
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      geometry = measureZoomImage(element);
      if (!geometry || touch.clientX < geometry.bounds.left + geometry.left || touch.clientX > geometry.bounds.left + geometry.left + geometry.width || touch.clientY < geometry.bounds.top + geometry.top || touch.clientY > geometry.bounds.top + geometry.top + geometry.height) return;
      startX = touch.clientX; startY = touch.clientY;
      timer.current = setTimeout(() => {
        timer.current = null;
        const image = geometry!.image;
        factor = /\.svg(?:[?#]|$)|^data:image\/svg/i.test(image.currentSrc) ? zoomFactor : imageDetailScale(image.naturalWidth, geometry!.width, zoomFactor, window.devicePixelRatio || 1);
        if (factor <= 1) return;
        active.current = true; setTouching(true);
        pan(touch); scale.set(factor);
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

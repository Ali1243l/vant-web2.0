import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

export interface MobileTouchZoomProps {
  children: React.ReactNode;
  zoomFactor?: number;
  className?: string;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const MAX_SCALE = 4;

/**
 * Phone image zoom: double-tap to zoom in/out at the tapped point, pinch to zoom freely,
 * drag to pan while zoomed. Unzoomed touches pass through, so the gallery still swipes
 * and the page still scrolls.
 */
export const MobileTouchZoom: React.FC<MobileTouchZoomProps> = ({ children, zoomFactor = 2.2, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  // Plain motion values so pan and pinch track the finger 1:1; only zoom in/out is animated
  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ease = { type: 'tween', duration: 0.22, ease: [0.16, 1, 0.3, 1] } as const;

  const lastTap = useRef(0);
  const start = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0 });
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

  const panLimits = (s: number) => {
    const r = containerRef.current?.getBoundingClientRect();
    return r ? { mx: (r.width * (s - 1)) / 2, my: (r.height * (s - 1)) / 2 } : { mx: 0, my: 0 };
  };

  const setPan = (nx: number, ny: number, s: number) => {
    const { mx, my } = panLimits(s);
    x.set(clamp(nx, -mx, mx));
    y.set(clamp(ny, -my, my));
  };

  const reset = () => {
    animate(scale, 1, ease);
    animate(x, 0, ease);
    animate(y, 0, ease);
    setZoomed(false);
  };

  const zoomAt = (clientX: number, clientY: number) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    const { mx, my } = panLimits(zoomFactor);
    animate(scale, zoomFactor, ease);
    animate(x, clamp(-(clientX - r.left - r.width / 2) * (zoomFactor - 1), -mx, mx), ease);
    animate(y, clamp(-(clientY - r.top - r.height / 2) * (zoomFactor - 1), -my, my), ease);
    setZoomed(true);
  };

  const distance = (t: React.TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinch.current = { dist: distance(e.touches), scale: scale.get() };
      e.stopPropagation();
      return;
    }
    const t = e.touches[0];
    start.current = last.current = { x: t.clientX, y: t.clientY };
    if (zoomed) e.stopPropagation();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (pinch.current && e.touches.length === 2) {
      const s = clamp((pinch.current.scale * distance(e.touches)) / pinch.current.dist, 1, MAX_SCALE);
      scale.set(s);
      setPan(x.get(), y.get(), s);
      e.stopPropagation();
      return;
    }
    if (!zoomed || e.touches.length !== 1) return;
    const t = e.touches[0];
    setPan(x.get() + t.clientX - last.current.x, y.get() + t.clientY - last.current.y, scale.get());
    last.current = { x: t.clientX, y: t.clientY };
    e.stopPropagation();
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (pinch.current) {
      if (e.touches.length < 2) {
        pinch.current = null;
        if (scale.get() < 1.08) reset();
        else setZoomed(true);
      }
      e.stopPropagation();
      return;
    }
    const t = e.changedTouches[0];
    const isTap = Math.hypot(t.clientX - start.current.x, t.clientY - start.current.y) < 10;
    if (zoomed) e.stopPropagation();
    if (!isTap) return;
    const now = Date.now();
    if (now - lastTap.current < 300) {
      lastTap.current = 0;
      if (zoomed) reset();
      else zoomAt(t.clientX, t.clientY);
    } else {
      lastTap.current = now;
    }
  };

  // While zoomed or pinching, the finger belongs to the image: no page scroll, no browser zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const block = (e: TouchEvent) => {
      if ((zoomed || e.touches.length > 1) && e.cancelable) e.preventDefault();
    };
    el.addEventListener('touchmove', block, { passive: false });
    return () => el.removeEventListener('touchmove', block);
  }, [zoomed]);

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      // The gallery swipes on pointer events; keep them away from it while the image is zoomed
      onPointerDown={(e) => zoomed && e.stopPropagation()}
      onPointerMove={(e) => zoomed && e.stopPropagation()}
      onPointerUp={(e) => zoomed && e.stopPropagation()}
      className={`relative overflow-hidden select-none ${className}`}
      style={{ touchAction: zoomed ? 'none' : 'pan-y' }}
    >
      <motion.div style={{ scale, x, y }} className="w-full h-full origin-center flex items-center justify-center will-change-transform">
        {children}
      </motion.div>
    </div>
  );
};

export default MobileTouchZoom;

import React, { useState } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface RangeSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  minStepsBetweenThumbs?: number;
  formatValue?: (val: number) => string;
  label?: string;
  className?: string;
  disabled?: boolean;
  showTooltip?: 'always' | 'hover' | 'drag';
}

export function RangeSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenThumbs = 0,
  formatValue = (val) => `${val}`,
  label,
  className,
  disabled = false,
  showTooltip = 'drag',
}: RangeSliderProps) {
  const [activeThumb, setActiveThumb] = useState<number | null>(null);
  const [hoveredThumb, setHoveredThumb] = useState<number | null>(null);

  // Ensure safe value bounds
  const safeValue = Array.isArray(value) && value.length > 0 ? value : [min, max];

  return (
    <div className={cn('w-full select-none space-y-2', className)}>
      {/* Optional Top Label & Current Values Header */}
      {label && (
        <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-300">
          <span>{label}</span>
          <span className="font-mono font-semibold text-indigo-400">
            {safeValue.length === 1
              ? formatValue(safeValue[0])
              : `${formatValue(safeValue[0])} – ${formatValue(safeValue[1] ?? safeValue[0])}`}
          </span>
        </div>
      )}

      {/* Slider Track Container (Enforce dir="ltr" for standard min->max physics) */}
      <div dir="ltr" className="relative w-full py-1">
        {/* Radix Slider Root */}
        <SliderPrimitive.Root
          dir="ltr"
          value={safeValue}
          onValueChange={onValueChange}
          min={min}
          max={max}
          step={step}
          minStepsBetweenThumbs={minStepsBetweenThumbs}
          disabled={disabled}
          className={cn(
            'relative flex w-full touch-none select-none items-center py-4 cursor-pointer',
            disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
          )}
        >
          {/* Slider Track with interior shadow and rounded capsule shape */}
          <SliderPrimitive.Track className="relative h-2.5 sm:h-3 w-full grow overflow-hidden rounded-full bg-slate-800/90 border border-slate-700/60 shadow-inner">
            {/* Active Range Fill with vibrant glowing gradient and glow shadow */}
            <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-500 shadow-[0_0_14px_rgba(99,102,241,0.5)] rounded-full" />
          </SliderPrimitive.Track>

          {/* Thumbs with Dynamic Animated Tooltips & Tactile Feedback */}
          {safeValue.map((val, index) => {
            const isDragging = activeThumb === index;
            const isHovered = hoveredThumb === index;

            const isTooltipVisible =
              showTooltip === 'always' ||
              (showTooltip === 'hover' && (isHovered || isDragging)) ||
              (showTooltip === 'drag' && (isDragging || isHovered));

            return (
              <SliderPrimitive.Thumb
                key={index}
                onPointerDown={() => setActiveThumb(index)}
                onPointerUp={() => setActiveThumb(null)}
                onMouseEnter={() => setHoveredThumb(index)}
                onMouseLeave={() => setHoveredThumb(null)}
                className={cn(
                  'relative block h-5.5 w-5.5 sm:h-6 sm:w-6 rounded-full border-2 border-indigo-400',
                  'bg-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.6),0_0_12px_rgba(99,102,241,0.4)]',
                  'outline-none cursor-grab active:cursor-grabbing',
                  'transition-transform duration-150 ease-out',
                  'hover:scale-115 active:scale-125 focus-visible:ring-4 focus-visible:ring-indigo-500/40',
                  isDragging && 'scale-125 ring-4 ring-indigo-500/35 border-white'
                )}
              >
                {/* Center glowing indicator jewel */}
                <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-indigo-400 pointer-events-none shadow-xs" />

                {/* Floating Animated Tooltip with spring motion accurately centered above Thumb */}
                <AnimatePresence>
                  {isTooltipVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.85 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.9 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                      className={cn(
                        'pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-50',
                        'whitespace-nowrap rounded-xl px-2.5 py-1',
                        'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-mono font-bold shadow-xl shadow-indigo-600/35 border border-indigo-400/40',
                        'text-[11px] backdrop-blur-md'
                      )}
                    >
                      <span>{formatValue(val)}</span>
                      {/* Tooltip Downward Caret */}
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-indigo-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </SliderPrimitive.Thumb>
            );
          })}
        </SliderPrimitive.Root>

        {/* Min & Max Range Labels (dir="ltr") */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-0.5 mt-0.5">
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 font-semibold">{formatValue(min)}</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 font-semibold">{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
}

export default RangeSlider;

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
        <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <span>{label}</span>
          <span className="font-mono font-semibold text-[#004ad7] dark:text-[#3b82f6]">
            {safeValue.length === 1
              ? formatValue(safeValue[0])
              : `${formatValue(safeValue[0])} – ${formatValue(safeValue[1] ?? safeValue[0])}`}
          </span>
        </div>
      )}

      {/* Slider Track Container (Enforce dir="ltr" for standard min->max physics) */}
      <div dir="ltr" className="relative w-full">
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
          {/* Slider Track */}
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-black/8 dark:bg-white/10 backdrop-blur-md">
            {/* Active Range Fill (no transition-all to allow immediate 60fps responsive dragging) */}
            <SliderPrimitive.Range className="absolute h-full bg-[#004ad7] dark:bg-[#3b82f6] rounded-full" />
          </SliderPrimitive.Track>

          {/* Thumbs with Dynamic Animated Tooltips */}
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
                  'relative block h-5 w-5 rounded-full border-2 border-[#004ad7] dark:border-[#3b82f6]',
                  'bg-white dark:bg-[#111319] shadow-[0_2px_8px_rgba(0,0,0,0.18)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.6)]',
                  'outline-none cursor-grab active:cursor-grabbing',
                  'hover:scale-110 focus-visible:ring-4 focus-visible:ring-[#004ad7]/25 dark:focus-visible:ring-[#3b82f6]/30',
                  isDragging && 'scale-120 ring-4 ring-[#004ad7]/25 dark:ring-[#3b82f6]/30'
                )}
              >
                {/* Floating Animated Tooltip accurately centered above Thumb */}
                <AnimatePresence>
                  {isTooltipVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.9 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className={cn(
                        'pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 z-50',
                        'whitespace-nowrap rounded-lg px-2 py-0.5',
                        'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950',
                        'text-[10.5px] font-mono font-bold shadow-lg'
                      )}
                    >
                      <span>{formatValue(val)}</span>
                      {/* Tooltip Downward Caret */}
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-neutral-900 dark:border-t-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </SliderPrimitive.Thumb>
            );
          })}
        </SliderPrimitive.Root>

        {/* Min & Max Range Labels (dir="ltr") */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 dark:text-neutral-500 px-0.5 mt-0.5">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
}

export default RangeSlider;

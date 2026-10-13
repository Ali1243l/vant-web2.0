import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, X, RotateCcw, Check } from 'lucide-react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfDay,
  isSameDay,
} from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { enUS } from 'date-fns/locale/en-US';
import { cn } from '../../lib/utils';

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  lang?: 'ar' | 'en';
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  align?: 'auto' | 'left' | 'right' | 'start' | 'end';
  showPresets?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  lang = 'ar',
  className,
  placeholder,
  disabled = false,
  align = 'auto',
  showPresets = true,
}: DateRangePickerProps) {
  const isAr = lang === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(value);
  const [resolvedAlign, setResolvedAlign] = useState<'left' | 'right'>('left');
  const [dropUp, setDropUp] = useState(false);

  // Sync internal state when external prop value changes
  useEffect(() => {
    setSelectedRange(value);
  }, [value]);

  // Dynamic collision detection: Calculate vertical & horizontal placement
  useEffect(() => {
    if (!isOpen) return;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = 570;
      const popoverHeight = 360;
      const spaceRight = window.innerWidth - rect.left;
      const spaceLeft = rect.right;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Vertical flip detection
      if (spaceBelow < popoverHeight && spaceAbove > popoverHeight) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }

      // Horizontal alignment calculation
      if (align === 'left') {
        setResolvedAlign('left');
      } else if (align === 'right') {
        setResolvedAlign('right');
      } else {
        // Auto alignment based on language and available margins
        if (isAr) {
          // In RTL layout:
          if (spaceRight >= popoverWidth && rect.left < popoverWidth) {
            setResolvedAlign('left'); // grows towards center/right
          } else if (spaceLeft >= popoverWidth) {
            setResolvedAlign('right'); // grows towards left
          } else {
            setResolvedAlign('left');
          }
        } else {
          // In LTR layout:
          if (spaceRight >= popoverWidth) {
            setResolvedAlign('left');
          } else {
            setResolvedAlign('right');
          }
        }
      }
    }
  }, [isOpen, align, isAr]);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    if (onChange) {
      onChange(range);
    }
  };

  // Quick preset ranges
  const presets = useMemo(() => {
    const today = startOfDay(new Date());
    return [
      {
        id: 'today',
        label: isAr ? 'اليوم' : 'Today',
        range: { from: today, to: today },
      },
      {
        id: 'yesterday',
        label: isAr ? 'أمس' : 'Yesterday',
        range: { from: subDays(today, 1), to: subDays(today, 1) },
      },
      {
        id: 'last7',
        label: isAr ? 'آخر 7 أيام' : 'Last 7 Days',
        range: { from: subDays(today, 6), to: today },
      },
      {
        id: 'last30',
        label: isAr ? 'آخر 30 يوماً' : 'Last 30 Days',
        range: { from: subDays(today, 29), to: today },
      },
      {
        id: 'thisMonth',
        label: isAr ? 'هذا الشهر' : 'This Month',
        range: { from: startOfMonth(today), to: endOfMonth(today) },
      },
    ];
  }, [isAr]);

  // Format button label text
  const formattedText = useMemo(() => {
    if (!selectedRange?.from) {
      return placeholder || (isAr ? 'اختر النطاق الزمني...' : 'Select date range...');
    }
    const currentLocale = isAr ? arSA : enUS;
    const fromStr = format(selectedRange.from, 'd MMM yyyy', { locale: currentLocale });
    if (!selectedRange.to || isSameDay(selectedRange.from, selectedRange.to)) {
      return fromStr;
    }
    const toStr = format(selectedRange.to, 'd MMM yyyy', { locale: currentLocale });
    return `${fromStr} - ${toStr}`;
  }, [selectedRange, isAr, placeholder]);

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block text-start select-none z-30', className)}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. Trigger Component */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          'group flex items-center justify-between gap-2.5 h-10 px-3.5 rounded-2xl border transition-all duration-200 active:scale-98 cursor-pointer shadow-xs',
          isOpen
            ? 'border-indigo-500/60 bg-slate-900 text-white ring-2 ring-indigo-500/20 shadow-indigo-500/10'
            : 'border-slate-800 bg-slate-950/80 hover:bg-slate-900 hover:border-slate-700 text-slate-200',
          disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
        )}
      >
        <div className="flex items-center gap-2 text-xs sm:text-[13px] font-medium text-slate-200 truncate">
          <CalendarIcon className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="truncate">{formattedText}</span>
        </div>

        {selectedRange?.from ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(undefined);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                handleSelect(undefined);
              }
            }}
            className="p-1 rounded-full text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors inline-flex items-center justify-center cursor-pointer"
            title={isAr ? 'إعادة ضبط' : 'Clear'}
          >
            <X className="h-3 w-3" />
          </span>
        ) : null}
      </div>

      {/* 2. Absolute Isolated Popover (strictly themed to slate-900 & indigo) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: dropUp ? -8 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: dropUp ? -8 : 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            className={cn(
              'absolute z-[99999]',
              dropUp ? 'bottom-full mb-2' : 'top-full mt-2',
              resolvedAlign === 'left' ? 'left-0' : 'right-0',
              'flex flex-col md:flex-row rounded-3xl border border-slate-800/90',
              'bg-slate-900/98 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.65),0_4px_16px_rgba(0,0,0,0.4)]',
              'p-3.5 sm:p-4.5 text-slate-100 max-w-[calc(100vw-1.5rem)] overflow-hidden'
            )}
          >
            {/* Quick Presets Sidebar */}
            {showPresets && (
              <div
                className={cn(
                  'flex md:flex-col gap-1 pb-3 md:pb-0 md:pe-3 border-b md:border-b-0 border-slate-800/80 shrink-0 overflow-x-auto no-scrollbar',
                  isAr ? 'md:border-l' : 'md:border-r'
                )}
              >
                <div className="hidden md:block px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none mb-1">
                  {isAr ? 'فترات سريعة' : 'Quick Presets'}
                </div>
                {presets.map((preset) => {
                  const isCurrent =
                    selectedRange?.from &&
                    selectedRange?.to &&
                    isSameDay(selectedRange.from, preset.range.from) &&
                    isSameDay(selectedRange.to, preset.range.to);

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelect(preset.range)}
                      className={cn(
                        'flex items-center justify-between whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer',
                        isCurrent
                          ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30 shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      )}
                    >
                      <span>{preset.label}</span>
                      {isCurrent && <Check className="h-3 w-3 ms-2 shrink-0 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Calendar View Area with styled DayPicker variables harmonized to indigo & slate */}
            <div className="flex flex-col items-center pt-2 md:pt-0 md:ps-3">
              <style>{`
                .vant-daypicker-wrap {
                  --rdp-accent-color: #6366f1;
                  --rdp-accent-background-color: rgba(99, 102, 241, 0.15);
                  --rdp-day-height: 36px;
                  --rdp-day-width: 36px;
                  --rdp-day_button-height: 36px;
                  --rdp-day_button-width: 36px;
                  --rdp-day_button-border-radius: 9999px;
                  --rdp-selected-border: 2px solid #6366f1;
                  --rdp-range_start-date-background-color: #6366f1;
                  --rdp-range_start-color: #ffffff;
                  --rdp-range_start-background: rgba(99, 102, 241, 0.25);
                  --rdp-range_middle-background-color: rgba(99, 102, 241, 0.2);
                  --rdp-range_middle-color: #c7d2fe;
                  --rdp-range_end-date-background-color: #6366f1;
                  --rdp-range_end-color: #ffffff;
                  --rdp-range_end-background: rgba(99, 102, 241, 0.25);
                  --rdp-today-color: #818cf8;
                }
                .vant-daypicker-wrap .rdp-root {
                  color: #e2e8f0;
                }
                .vant-daypicker-wrap .rdp-day_button {
                  font-size: 13px;
                  font-weight: 500;
                  color: #cbd5e1;
                }
                .vant-daypicker-wrap .rdp-day_button:hover {
                  background-color: rgba(255, 255, 255, 0.08);
                  color: #ffffff;
                }
                .vant-daypicker-wrap .rdp-selected .rdp-day_button,
                .vant-daypicker-wrap .rdp-range_start .rdp-day_button,
                .vant-daypicker-wrap .rdp-range_end .rdp-day_button {
                  background-color: #6366f1 !important;
                  color: #ffffff !important;
                  font-weight: 700;
                  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
                }
                .vant-daypicker-wrap .rdp-range_middle {
                  background-color: rgba(99, 102, 241, 0.2) !important;
                }
                .vant-daypicker-wrap .rdp-range_middle .rdp-day_button {
                  color: #c7d2fe !important;
                  border-radius: 0;
                }
                .vant-daypicker-wrap .rdp-chevron {
                  fill: #818cf8;
                }
                .vant-daypicker-wrap .rdp-button_previous,
                .vant-daypicker-wrap .rdp-button_next {
                  border-radius: 9999px;
                  cursor: pointer;
                  color: #94a3b8;
                }
                .vant-daypicker-wrap .rdp-button_previous:hover,
                .vant-daypicker-wrap .rdp-button_next:hover {
                  background-color: rgba(255, 255, 255, 0.1);
                  color: #ffffff;
                }
              `}</style>

              <div className="vant-daypicker-wrap">
                <DayPicker
                  mode="range"
                  selected={selectedRange}
                  onSelect={handleSelect}
                  locale={isAr ? arSA : enUS}
                  dir={isAr ? 'rtl' : 'ltr'}
                  className="vant-day-picker p-0 select-none text-xs sm:text-sm"
                  classNames={{
                    months: 'flex flex-col sm:flex-row gap-4',
                    month: 'space-y-3',
                    month_caption: 'flex justify-between items-center px-1 font-semibold text-slate-100',
                    caption_label: 'text-xs sm:text-sm font-bold tracking-wide text-slate-200',
                    nav: 'flex items-center gap-1',
                    month_grid: 'w-full border-collapse space-y-1',
                    weekdays: 'flex mb-1',
                    weekday: 'text-slate-500 font-semibold text-[11px] sm:text-xs w-9 text-center py-1 select-none',
                    week: 'flex w-full mt-1',
                    day: 'h-9 w-9 text-center text-xs p-0 relative font-medium focus-within:relative focus-within:z-20',
                    day_button: 'h-9 w-9 p-0 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer',
                    today: 'border border-indigo-400/50 font-bold text-indigo-300',
                    outside: 'opacity-25 text-slate-600 pointer-events-none',
                    disabled: 'opacity-20 cursor-not-allowed',
                  }}
                />
              </div>

              {/* Action Bar (Apply & Reset) */}
              <div className="flex w-full items-center justify-between pt-3 mt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleSelect(undefined)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  {isAr ? 'تطبيق النطاق' : 'Apply Range'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DateRangePicker;

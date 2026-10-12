import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, X, RotateCcw, Check } from 'lucide-react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format, subDays, startOfMonth, endOfMonth, isSameDay, startOfDay } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { cn } from '../../lib/utils';

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  lang?: 'ar' | 'en';
  placeholder?: string;
  className?: string;
  showPresets?: boolean;
  disabled?: boolean;
  align?: 'auto' | 'left' | 'right' | 'start' | 'end';
}

export function DateRangePicker({
  value,
  onChange,
  lang = 'ar',
  placeholder,
  className,
  showPresets = true,
  disabled = false,
  align = 'auto',
}: DateRangePickerProps) {
  const isAr = lang === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const [resolvedAlign, setResolvedAlign] = useState<'left' | 'right'>('right');

  // Sync internal state if controlled value changes
  useEffect(() => {
    setSelectedRange(value);
  }, [value]);

  // Dynamic responsive alignment calculation to strictly avoid off-screen overflow
  useEffect(() => {
    if (!isOpen) return;

    if (align === 'left' || align === 'right') {
      setResolvedAlign(align);
      return;
    }
    if (align === 'start') {
      setResolvedAlign(isAr ? 'right' : 'left');
      return;
    }
    if (align === 'end') {
      setResolvedAlign(isAr ? 'left' : 'right');
      return;
    }

    // Auto calculate based on viewport boundaries
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = 550;
      const spaceOnLeft = rect.right;
      const spaceOnRight = window.innerWidth - rect.left;

      if (isAr) {
        // In RTL: if expanding to the left causes clipping (rect.right < 550)
        // and there is more room on the right, align left so it grows to the right!
        if (spaceOnLeft < popoverWidth && spaceOnRight >= spaceOnLeft) {
          setResolvedAlign('left');
        } else {
          setResolvedAlign('right');
        }
      } else {
        if (spaceOnRight < popoverWidth && spaceOnLeft >= spaceOnRight) {
          setResolvedAlign('right');
        } else {
          setResolvedAlign('left');
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
      className={cn('relative inline-block text-start select-none', className)}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. Trigger Component (accessible div role="button" preventing nested button issues) */}
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
          'group flex items-center justify-between gap-2.5 h-10 px-3.5 rounded-2xl border transition-all duration-200 active:scale-98 cursor-pointer shadow-2xs',
          isOpen
            ? 'border-[#004ad7]/40 dark:border-[#3b82f6]/40 bg-white dark:bg-[#12141a] ring-2 ring-[#004ad7]/15 dark:ring-[#3b82f6]/20'
            : 'border-black/8 dark:border-white/10 bg-white/70 dark:bg-[#12141a]/70 hover:bg-white dark:hover:bg-[#151821] hover:border-black/15 dark:hover:border-white/20',
          disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
        )}
      >
        <div className="flex items-center gap-2 text-xs sm:text-[13px] font-medium text-neutral-800 dark:text-neutral-200 truncate">
          <CalendarIcon className="h-4 w-4 text-[#004ad7] dark:text-[#3b82f6] shrink-0" />
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
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors inline-flex items-center justify-center cursor-pointer"
            title={isAr ? 'إعادة ضبط' : 'Clear'}
          >
            <X className="h-3 w-3" />
          </span>
        ) : null}
      </div>

      {/* 2. Absolute Isolated Popover (with smart viewport boundary alignment & no clipping) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            className={cn(
              'absolute top-full mt-2 z-[99999]',
              resolvedAlign === 'left' ? 'left-0' : 'right-0',
              'flex flex-col md:flex-row rounded-3xl border border-black/10 dark:border-white/15',
              'bg-white/95 dark:bg-[#111319]/95 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.25),0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_28px_65px_rgba(0,0,0,0.9)]',
              'p-3 sm:p-4 text-neutral-900 dark:text-white max-w-[calc(100vw-1.5rem)] overflow-hidden'
            )}
          >
            {/* Quick Presets Sidebar */}
            {showPresets && (
              <div
                className={cn(
                  'flex md:flex-col gap-1 pb-3 md:pb-0 md:pe-3 border-b md:border-b-0 border-black/6 dark:border-white/8 shrink-0 overflow-x-auto no-scrollbar',
                  isAr ? 'md:border-l' : 'md:border-r'
                )}
              >
                <div className="hidden md:block px-2.5 py-1 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider select-none mb-1">
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
                          ? 'bg-[#004ad7]/12 dark:bg-[#3b82f6]/18 text-[#004ad7] dark:text-[#60a5fa] font-bold ring-1 ring-[#004ad7]/20 dark:ring-[#3b82f6]/30'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/8 hover:text-black dark:hover:text-white'
                      )}
                    >
                      <span>{preset.label}</span>
                      {isCurrent && <Check className="h-3 w-3 ms-2 shrink-0 opacity-80" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Calendar View Area with styled DayPicker variables */}
            <div className="flex flex-col items-center pt-2 md:pt-0 md:ps-3">
              <style>{`
                .vant-daypicker-wrap {
                  --rdp-accent-color: #3b82f6;
                  --rdp-accent-background-color: rgba(59, 130, 246, 0.15);
                  --rdp-day-height: 36px;
                  --rdp-day-width: 36px;
                  --rdp-day_button-height: 36px;
                  --rdp-day_button-width: 36px;
                  --rdp-day_button-border-radius: 9999px;
                  --rdp-selected-border: 2px solid #3b82f6;
                  --rdp-range_start-date-background-color: #3b82f6;
                  --rdp-range_start-color: #ffffff;
                  --rdp-range_start-background: rgba(59, 130, 246, 0.2);
                  --rdp-range_middle-background-color: rgba(59, 130, 246, 0.15);
                  --rdp-range_middle-color: #60a5fa;
                  --rdp-range_end-date-background-color: #3b82f6;
                  --rdp-range_end-color: #ffffff;
                  --rdp-range_end-background: rgba(59, 130, 246, 0.2);
                  --rdp-today-color: #3b82f6;
                }
                .vant-daypicker-wrap .rdp-root {
                  color: inherit;
                }
                .vant-daypicker-wrap .rdp-day_button {
                  font-size: 13px;
                  font-weight: 500;
                  color: inherit;
                }
                .vant-daypicker-wrap .rdp-day_button:hover {
                  background-color: rgba(255, 255, 255, 0.08);
                }
                .vant-daypicker-wrap .rdp-selected .rdp-day_button,
                .vant-daypicker-wrap .rdp-range_start .rdp-day_button,
                .vant-daypicker-wrap .rdp-range_end .rdp-day_button {
                  background-color: #3b82f6 !important;
                  color: #ffffff !important;
                  font-weight: 700;
                }
                .vant-daypicker-wrap .rdp-range_middle {
                  background-color: rgba(59, 130, 246, 0.18) !important;
                }
                .vant-daypicker-wrap .rdp-range_middle .rdp-day_button {
                  color: #93c5fd !important;
                  border-radius: 0;
                }
                .vant-daypicker-wrap .rdp-chevron {
                  fill: #3b82f6;
                }
                .vant-daypicker-wrap .rdp-button_previous,
                .vant-daypicker-wrap .rdp-button_next {
                  border-radius: 9999px;
                  cursor: pointer;
                }
                .vant-daypicker-wrap .rdp-button_previous:hover,
                .vant-daypicker-wrap .rdp-button_next:hover {
                  background-color: rgba(255, 255, 255, 0.1);
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
                    month_caption: 'flex justify-between items-center px-1 font-semibold text-neutral-900 dark:text-white',
                    caption_label: 'text-xs sm:text-sm font-bold tracking-wide',
                    nav: 'flex items-center gap-1',
                    month_grid: 'w-full border-collapse space-y-1',
                    weekdays: 'flex mb-1',
                    weekday: 'text-neutral-400 dark:text-neutral-500 font-semibold text-[11px] sm:text-xs w-9 text-center py-1 select-none',
                    week: 'flex w-full mt-1',
                    day: 'h-9 w-9 text-center text-xs p-0 relative font-medium focus-within:relative focus-within:z-20',
                    day_button: 'h-9 w-9 p-0 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer',
                    today: 'border border-[#3b82f6]/50 font-bold',
                    outside: 'opacity-30 text-neutral-400 pointer-events-none',
                    disabled: 'opacity-20 cursor-not-allowed',
                  }}
                />
              </div>

              {/* Action Bar (Apply & Reset) */}
              <div className="flex w-full items-center justify-between pt-3 mt-2 border-t border-black/6 dark:border-white/8">
                <button
                  type="button"
                  onClick={() => handleSelect(undefined)}
                  className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-full bg-[#004ad7] dark:bg-[#3b82f6] text-white dark:text-[#111319] text-xs font-bold transition-all hover:opacity-90 active:scale-95 shadow-xs cursor-pointer"
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

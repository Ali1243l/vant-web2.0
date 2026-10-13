import React from 'react';
import { DateRangePicker } from '../../ui/DateRangePicker';
import type { DateRange } from 'react-day-picker';
import { Calendar, RotateCcw } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface DateRangeFilterWidgetProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  lang?: 'ar' | 'en';
  label?: string;
  className?: string;
  showReset?: boolean;
  align?: 'auto' | 'left' | 'right' | 'start' | 'end';
}

export function DateRangeFilterWidget({
  value,
  onChange,
  lang = 'ar',
  label,
  className,
  showReset = true,
  align = 'auto',
}: DateRangeFilterWidgetProps) {
  const isAr = lang === 'ar';
  const defaultLabel = isAr ? 'تصفية الفترة الزمنية' : 'Date Range Filter';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={cn(
        'relative flex items-center gap-2.5 p-2 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xs select-none',
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 ps-2 hidden sm:flex">
        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
        <span>{label || defaultLabel}:</span>
      </div>

      <DateRangePicker
        value={value}
        onChange={onChange}
        lang={lang}
        showPresets={true}
        align={align}
        placeholder={isAr ? 'اختر الفترة...' : 'Select range...'}
      />

      {showReset && value?.from && (
        <button
          type="button"
          onClick={() => onChange?.(undefined)}
          className="p-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={isAr ? 'إعادة ضبط التاريخ' : 'Reset date filter'}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default DateRangeFilterWidget;

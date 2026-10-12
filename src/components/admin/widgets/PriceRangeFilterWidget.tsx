import React, { useState, useEffect } from 'react';
import { RangeSlider } from '../../ui/RangeSlider';
import { Tag, RotateCcw } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface PriceRangeFilterWidgetProps {
  value: number[];
  onChange: (val: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
  lang?: 'ar' | 'en';
  label?: string;
  className?: string;
  onReset?: () => void;
}

export function PriceRangeFilterWidget({
  value,
  onChange,
  min = 0,
  max = 2000,
  step = 25,
  currency = '$',
  lang = 'ar',
  label,
  className,
  onReset,
}: PriceRangeFilterWidgetProps) {
  const isAr = lang === 'ar';
  const defaultLabel = isAr ? 'تصفية الأسعار' : 'Price Filter';

  const safeVal: [number, number] = [
    typeof value?.[0] === 'number' ? value[0] : min,
    typeof value?.[1] === 'number' ? value[1] : max,
  ];

  const [minInput, setMinInput] = useState<string>(String(safeVal[0]));
  const [maxInput, setMaxInput] = useState<string>(String(safeVal[1]));

  useEffect(() => {
    setMinInput(String(safeVal[0]));
  }, [safeVal[0]]);

  useEffect(() => {
    setMaxInput(String(safeVal[1]));
  }, [safeVal[1]]);

  const formatPrice = (val: number) => {
    return isAr ? `${val.toLocaleString()} ${currency}` : `${currency}${val.toLocaleString()}`;
  };

  const commitMin = (valStr: string) => {
    const raw = Number(valStr.replace(/[^0-9]/g, ''));
    if (!isNaN(raw) && valStr.trim() !== '') {
      const clamped = Math.min(Math.max(min, raw), safeVal[1]);
      onChange([clamped, safeVal[1]]);
      setMinInput(String(clamped));
    } else {
      setMinInput(String(safeVal[0]));
    }
  };

  const commitMax = (valStr: string) => {
    const raw = Number(valStr.replace(/[^0-9]/g, ''));
    if (!isNaN(raw) && valStr.trim() !== '') {
      const clamped = Math.max(Math.min(max, raw), safeVal[0]);
      onChange([safeVal[0], clamped]);
      setMaxInput(String(clamped));
    } else {
      setMaxInput(String(safeVal[1]));
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={cn(
        'flex flex-col gap-2.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xs text-xs select-none min-w-[260px]',
        className
      )}
    >
      <div className="flex items-center justify-between text-slate-300 font-medium">
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-[#3b82f6]" />
          <span>{label || defaultLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              title={isAr ? 'إعادة ضبط' : 'Reset'}
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Numeric Quick Input Fields */}
      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 flex-1">
          <span className="text-slate-500">{isAr ? 'من:' : 'Min:'}</span>
          <input
            type="text"
            inputMode="numeric"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={() => commitMin(minInput)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitMin(minInput);
              }
            }}
            className="w-full bg-transparent text-slate-200 outline-none text-end font-mono"
          />
          <span className="text-slate-500 text-[10px]">{currency}</span>
        </div>

        <span className="text-slate-600">–</span>

        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1 flex-1">
          <span className="text-slate-500">{isAr ? 'إلى:' : 'Max:'}</span>
          <input
            type="text"
            inputMode="numeric"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={() => commitMax(maxInput)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitMax(maxInput);
              }
            }}
            className="w-full bg-transparent text-slate-200 outline-none text-end font-mono"
          />
          <span className="text-slate-500 text-[10px]">{currency}</span>
        </div>
      </div>

      {/* Core Slider */}
      <RangeSlider
        value={safeVal}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        formatValue={formatPrice}
        showTooltip="drag"
      />
    </div>
  );
}

export default PriceRangeFilterWidget;

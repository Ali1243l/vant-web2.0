import React from 'react';
import {
  Percent,
  TrendingDown,
  Coins,
  Sliders,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import type { Product } from '../useAdminBridge';
import { formatCurrency, toEnglishDigits } from '../format';
import { Button, Input } from '../ui';
import { getBadgePresets, fixedDeductionPresets } from './presets';

interface CustomOfferTabProps {
  product: Product;
  isAr: boolean;
  pricingMode: 'percent' | 'fixedPrice';
  setPricingMode: (mode: 'percent' | 'fixedPrice') => void;
  discountPercent: number;
  setDiscountPercent: (val: number) => void;
  customSalePrice: string;
  setCustomSalePrice: (val: string) => void;
  customBadgeText: string;
  setCustomBadgeText: (val: string) => void;
  currentFinalSalePrice: number;
  calculatedCustomPrice: number;
  customSavings: number;
  actualSavingsPct: number;
  applyToCategory: boolean;
  categoryCount: number;
  adjustPriceBy: (amount: number) => void;
  roundToNearestDinar: (unit: 500 | 1000) => void;
  onApplyCustomOffer: () => void;
  onClose: () => void;
}

export const CustomOfferTab: React.FC<CustomOfferTabProps> = ({
  product,
  isAr,
  pricingMode,
  setPricingMode,
  discountPercent,
  setDiscountPercent,
  customSalePrice,
  setCustomSalePrice,
  customBadgeText,
  setCustomBadgeText,
  currentFinalSalePrice,
  calculatedCustomPrice,
  customSavings,
  actualSavingsPct,
  applyToCategory,
  categoryCount,
  adjustPriceBy,
  roundToNearestDinar,
  onApplyCustomOffer,
  onClose,
}) => {
  const badgePresets = getBadgePresets(isAr);

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Quick Percentage Slider & Preset Chips */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-indigo-400" />
            <span>{isAr ? 'حدد نسبة الخصم والتخفيض (%):' : 'Select Discount Percentage (%):'}</span>
          </label>
          <span className="text-sm font-extrabold font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
            %{discountPercent} OFF
          </span>
        </div>

        {/* Quick Percent Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => {
                setPricingMode('percent');
                setDiscountPercent(pct);
              }}
              className={`flex-1 py-1.5 px-2 sm:px-3 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                pricingMode === 'percent' && discountPercent === pct
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-950'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              %{pct}
            </button>
          ))}
        </div>

        {/* Custom Range Slider */}
        <input
          type="range"
          min="5"
          max="80"
          step="1"
          value={discountPercent}
          onChange={(e) => {
            setPricingMode('percent');
            setDiscountPercent(Number(e.target.value));
          }}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* 2. Interactive IQD Quick Deductions & Steppers */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>
              {isAr ? 'خصم مبالغ مباشرة بالدينار العراقي:' : 'Fixed IQD Amount Deductions:'}
            </span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {isAr ? 'تخصيص فوري' : 'Instant Deduction'}
          </span>
        </div>

        {/* Fixed IQD Deduction Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {fixedDeductionPresets.map((amount) => {
            const isAffordable = product.price > amount + 1000;
            return (
              <button
                key={amount}
                type="button"
                disabled={!isAffordable}
                onClick={() => {
                  setPricingMode('fixedPrice');
                  const targetPrice = Math.max(500, product.price - amount);
                  setCustomSalePrice(targetPrice.toString());
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer ${
                  !isAffordable
                    ? 'opacity-40 cursor-not-allowed bg-slate-900/40 text-slate-600 border-slate-800/40'
                    : 'bg-slate-900/80 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                -{formatCurrency(amount, 'IQD', 'en')}
              </button>
            );
          })}
        </div>

        {/* Quick Steppers & Rounders */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-medium me-1">
              {isAr ? 'تعديل دقيق:' : 'Nudge:'}
            </span>
            <button
              type="button"
              onClick={() => adjustPriceBy(-5000)}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-rose-400 font-mono font-bold cursor-pointer"
              title={isAr ? 'تخفيض السعر بـ 5,000 دينار' : '-5,000 IQD'}
            >
              -5K
            </button>
            <button
              type="button"
              onClick={() => adjustPriceBy(-1000)}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-rose-300 font-mono font-bold cursor-pointer"
              title={isAr ? 'تخفيض السعر بـ 1,000 دينار' : '-1,000 IQD'}
            >
              -1K
            </button>
            <button
              type="button"
              onClick={() => adjustPriceBy(1000)}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-emerald-300 font-mono font-bold cursor-pointer"
              title={isAr ? 'زيادة السعر بـ 1,000 دينار' : '+1,000 IQD'}
            >
              +1K
            </button>
            <button
              type="button"
              onClick={() => adjustPriceBy(5000)}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-emerald-400 font-mono font-bold cursor-pointer"
              title={isAr ? 'زيادة السعر بـ 5,000 دينار' : '+5,000 IQD'}
            >
              +5K
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-medium me-1">
              {isAr ? 'جبر الألف:' : 'Round IQD:'}
            </span>
            <button
              type="button"
              onClick={() => roundToNearestDinar(500)}
              className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[11px] font-bold font-mono cursor-pointer"
            >
              ~500 IQD
            </button>
            <button
              type="button"
              onClick={() => roundToNearestDinar(1000)}
              className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[11px] font-bold font-mono cursor-pointer"
            >
              ~1,000 IQD
            </button>
          </div>
        </div>
      </div>

      {/* Manual Price Input Switch */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            {isAr ? 'أو كتابة السعر النهائي يدوياً (IQD):' : 'Or Manual Sale Price (IQD):'}
          </span>
          <button
            type="button"
            onClick={() => {
              if (pricingMode === 'percent') {
                setPricingMode('fixedPrice');
                setCustomSalePrice(toEnglishDigits(calculatedCustomPrice).toString());
              } else {
                setPricingMode('percent');
              }
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer font-medium"
          >
            {pricingMode === 'percent'
              ? isAr
                ? 'التبديل إلى إدخال السعر يدوياً'
                : 'Switch to Manual Price'
              : isAr
              ? 'التبديل إلى النسبة المئوية %'
              : 'Switch to Percentage %'}
          </button>
        </div>

        {pricingMode === 'fixedPrice' && (
          <Input
            type="text"
            inputMode="numeric"
            dir="ltr"
            className="font-mono text-left tracking-wider font-bold text-white text-base"
            placeholder="140000"
            value={customSalePrice}
            onChange={(e) =>
              setCustomSalePrice(toEnglishDigits(e.target.value).replace(/[^0-9.]/g, ''))
            }
            icon={TrendingDown}
            action={
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                IQD
              </span>
            }
          />
        )}
      </div>

      {/* Ready-Made Badge Shortcuts (1-Click Fill) */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          {isAr
            ? 'اختر شارة ترويجية جاهزة أو اكتب شارة مخصصة:'
            : 'Choose Promo Badge Template or Custom Text:'}
        </label>
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {badgePresets.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => setCustomBadgeText(b.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                customBadgeText === b.value
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <Input
          placeholder={
            isAr ? 'مثال: خصم حصري، عرض لفترة محدودة، صفقة اليوم' : 'e.g. Exclusive Deal, Limited Offer'
          }
          value={customBadgeText}
          onChange={(e) => setCustomBadgeText(e.target.value)}
          icon={Sparkles}
        />
      </div>

      {/* Margin Safety & Profitability Indicator */}
      {actualSavingsPct > 50 ? (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            {isAr
              ? `تنبيه هامش الربح: نسبة التخفيض (${actualSavingsPct}%) مرتفعة جداً. تأكد أن سعر التكلفة مغطى بالكامل.`
              : `Margin Warning: Discount (${actualSavingsPct}%) exceeds 50%. Ensure cost price is fully covered.`}
          </span>
        </div>
      ) : actualSavingsPct > 0 ? (
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            {isAr
              ? `هامش متوازن: خصم جذاب للعميل بنسبة ${actualSavingsPct}% لتحفيز الشراء السريع.`
              : `Optimal promotional discount (${actualSavingsPct}%) to accelerate checkout.`}
          </span>
        </div>
      ) : null}

      {/* Live Interactive Storefront Preview Card */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/50 border border-indigo-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              {isAr ? 'معاينة السعر النهائي للزبون في المتجر:' : 'Final Storefront Sale Price Preview:'}
            </span>
            {customBadgeText.trim() && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{customBadgeText.trim()}</span>
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2.5 mt-1.5" dir="ltr">
            <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {formatCurrency(currentFinalSalePrice, 'IQD', 'en')}
            </span>
            <span className="text-xs text-slate-400 line-through font-mono">
              {formatCurrency(product.price, 'IQD', 'en')}
            </span>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center sm:text-end shrink-0 shadow-sm">
          <span>
            {isAr ? 'وفر للزبون: ' : 'Customer Saves: '}
            <strong dir="ltr" className="font-mono inline-block">
              {formatCurrency(customSavings, 'IQD', 'en')}
            </strong>
          </span>
          <span className="block text-[11px] text-emerald-400/80 font-mono mt-0.5">
            ({actualSavingsPct}% OFF)
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-800/80">
        <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
          {isAr ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onApplyCustomOffer}
          leftIcon={<Check className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          {applyToCategory
            ? isAr
              ? `تطبيق العرض على جميع منتجات فئة ${product.category} (${categoryCount})`
              : `Apply Promo to All ${categoryCount} ${product.category} Items`
            : isAr
            ? 'تطبيق العرض على هذه القطعة'
            : 'Apply Promo to Item'}
        </Button>
      </div>
    </div>
  );
};

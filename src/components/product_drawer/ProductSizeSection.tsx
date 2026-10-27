import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Check, AlertCircle, X } from 'lucide-react';
import type { Product, Language } from '../../types';
import { calculateRecommendedSize } from '../../data/sizeGuide';
import { trackEvent } from '../../lib/analytics';

interface ProductSizeSectionProps {
  renderedSizes: string[];
  availableSizes: Set<string>;
  selectedSize: string | null;
  onSizeClick: (size: string) => void;
  sizeFeedback: string | null;
  isSoldOut: boolean;
  lang: Language;
  sizeGuideControl: {
    visible: boolean;
    label_ar: string;
    label_en: string;
  };
  showSizeGuide: boolean;
  setShowSizeGuide: React.Dispatch<React.SetStateAction<boolean>>;
  masterSizes: any[];
  bespokeControl: {
    visible: boolean;
    label_ar: string;
    label_en: string;
  };
  bespokeWhatsappUrl: string;
  product: Product | null;
  displayTitle?: string;
  calcHeight: string;
  setCalcHeight: (h: string) => void;
  calcWeight: string;
  setCalcWeight: (w: string) => void;
}

export const ProductSizeSection: React.FC<ProductSizeSectionProps> = ({
  renderedSizes,
  availableSizes,
  selectedSize,
  onSizeClick,
  sizeFeedback,
  isSoldOut,
  lang,
  sizeGuideControl,
  showSizeGuide,
  setShowSizeGuide,
  masterSizes,
  bespokeControl,
  bespokeWhatsappUrl,
  product,
  displayTitle,
  calcHeight,
  setCalcHeight,
  calcWeight,
  setCalcWeight,
}) => {
  const [sizeGuideTab, setSizeGuideTab] = useState<'calculator' | 'table'>('calculator');

  const dynamicRecommendation = useMemo(() => {
    if (calcHeight.length !== 3) return null;
    if (calcWeight.length < 2) return null;
    const h = parseInt(calcHeight, 10);
    const w = parseInt(calcWeight, 10);
    if (isNaN(h) || isNaN(w) || h < 120 || h > 220 || w < 30 || w > 200) return null;
    return calculateRecommendedSize(h, w, masterSizes);
  }, [calcHeight, calcWeight, masterSizes]);

  if (renderedSizes.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Sizing Header Row: Title + Guide Trigger */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-bold text-[#15171c] dark:text-white uppercase tracking-wider">
            {lang === 'ar' ? 'المقاس:' : 'Size:'}
          </span>
          {selectedSize ? (
            <span className="rounded-lg bg-[#004ad7] text-white px-2 py-0.5 md:px-3 md:py-1 text-xs md:text-sm font-bold shadow-2xs">
              {selectedSize}
            </span>
          ) : (
            <span className="text-xs md:text-sm text-[#6b7280] dark:text-[#9ca3af]">
              {lang === 'ar' ? 'يرجى اختيار مقاسك' : 'Please select'}
            </span>
          )}
        </div>

        {sizeGuideControl.visible && (
          <button
            type="button"
            onClick={() => {
              const next = !showSizeGuide;
              setShowSizeGuide(next);
              if (next && product) {
                trackEvent('size_guide_open', { productId: product.id, title: displayTitle });
              }
            }}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/8 dark:border-white/10 text-xs font-semibold text-[#004ad7] dark:text-[#3b82f6] hover:bg-[#004ad7]/10 dark:hover:bg-[#3b82f6]/15 cursor-pointer transition-all active:scale-95"
          >
            <Ruler className="h-3.5 w-3.5" />
            <span>{lang === 'ar' ? sizeGuideControl.label_ar : sizeGuideControl.label_en}</span>
          </button>
        )}
      </div>

      {/* Size Selection Grid */}
      <ul className="flex flex-wrap gap-2 sm:gap-2.5">
        {renderedSizes.map((size) => {
          const isAvailable = availableSizes.has(size.toUpperCase());
          const isSelected = selectedSize === size;

          return (
            <li key={size}>
              <button
                type="button"
                onClick={() => onSizeClick(size)}
                className={`flex h-11 min-w-[44px] sm:h-11 sm:min-w-[48px] md:h-11.5 md:min-w-[52px] px-3 sm:px-4 items-center justify-center rounded-xl md:rounded-2xl border text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'border-[#004ad7] bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 ring-2 ring-[#004ad7]/30 dark:border-[#3b82f6] dark:bg-[#3b82f6]'
                    : isAvailable
                    ? 'border-black/12 dark:border-white/15 bg-white dark:bg-[#20242c] text-[#15171c] dark:text-white hover:border-[#004ad7] dark:hover:border-[#3b82f6]'
                    : 'border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] text-black/30 dark:text-white/25 line-through hover:border-black/20'
                }`}
                aria-pressed={isSelected}
                aria-label={`${size} ${isAvailable ? 'available' : isSoldOut ? 'sold out' : 'out of stock'}`}
              >
                {size}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Size selection feedback banner */}
      {sizeFeedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-2.5 md:p-3 text-xs md:text-sm transition-colors ${
            selectedSize && availableSizes.has(selectedSize)
              ? 'bg-[#004ad7]/8 dark:bg-[#3b82f6]/15 text-[#004ad7] dark:text-[#3b82f6] border border-[#004ad7]/20 dark:border-[#3b82f6]/30'
              : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#15171c] dark:text-white/85 border border-black/5 dark:border-white/10'
          }`}
        >
          {selectedSize && availableSizes.has(selectedSize) ? (
            <Check className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-[#004ad7] dark:text-[#3b82f6]" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-[#004ad7] dark:text-[#3b82f6]" />
          )}
          <span className="font-medium">{sizeFeedback}</span>
        </div>
      )}

      {/* Tabbed Expandable Size Guide (Calculators & Tables) */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#1e222a] p-3.5 sm:p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-1.5 bg-black/[0.04] dark:bg-white/[0.05] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSizeGuideTab('calculator')}
                  className={`rounded-lg px-2.5 py-1 md:px-4 md:py-2 text-[11px] md:text-xs font-bold transition-all cursor-pointer ${
                    sizeGuideTab === 'calculator'
                      ? 'bg-white dark:bg-[#14171f] text-[#004ad7] dark:text-[#60a5fa] shadow-2xs'
                      : 'text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white'
                  }`}
                >
                  {lang === 'ar' ? 'حاسبة المقاس' : 'Fit Calculator'}
                </button>
                <button
                  type="button"
                  onClick={() => setSizeGuideTab('table')}
                  className={`rounded-lg px-2.5 py-1 md:px-4 md:py-2 text-[11px] md:text-xs font-bold transition-all cursor-pointer ${
                    sizeGuideTab === 'table'
                      ? 'bg-white dark:bg-[#14171f] text-[#004ad7] dark:text-[#60a5fa] shadow-2xs'
                      : 'text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white'
                  }`}
                >
                  {lang === 'ar' ? 'جدول المقاسات' : 'Size Table'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="text-[#6b7280] dark:text-[#9ca3af] hover:text-black dark:hover:text-white cursor-pointer p-1.5 md:p-2 rounded-lg"
                aria-label={lang === 'ar' ? 'إغلاق الدليل' : 'Close guide'}
              >
                <X className="h-4 w-4 md:h-4.5 md:w-4.5" />
              </button>
            </div>

            {/* TAB 1: Smart Fit Recommender */}
            {sizeGuideTab === 'calculator' && (
              <div className="space-y-3">
                <span className="text-[11px] md:text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] block">
                  {lang === 'ar'
                    ? 'أدخل طولك ووزنك لاقتراح المقاس المثالي فوراً:'
                    : 'Enter your height and weight for an instant fit recommendation:'}
                </span>

                <div className="grid grid-cols-2 gap-2.5 md:gap-3.5">
                  <div>
                    <label className="text-[10px] md:text-xs text-[#6b7280] dark:text-[#9ca3af] block mb-1">
                      {lang === 'ar' ? 'الطول (120 - 220 سم)' : 'Height (120 - 220 cm)'}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={3}
                      placeholder={lang === 'ar' ? 'مثال: 175' : 'e.g. 175'}
                      value={calcHeight}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                        setCalcHeight(val);
                      }}
                      className="w-full rounded-lg md:rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#16191f] px-2.5 py-1.5 md:py-2.5 md:px-3 text-xs md:text-sm text-[#15171c] dark:text-white outline-none focus:border-[#004ad7]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] md:text-xs text-[#6b7280] dark:text-[#9ca3af] block mb-1">
                      {lang === 'ar' ? 'الوزن (30 - 200 كغم)' : 'Weight (30 - 200 kg)'}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={3}
                      placeholder={lang === 'ar' ? 'مثال: 72' : 'e.g. 72'}
                      value={calcWeight}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                        setCalcWeight(val);
                      }}
                      className="w-full rounded-lg md:rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#16191f] px-2.5 py-1.5 md:py-2.5 md:px-3 text-xs md:text-sm text-[#15171c] dark:text-white outline-none focus:border-[#004ad7]"
                    />
                  </div>
                </div>

                {dynamicRecommendation && (
                  <motion.div
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl md:rounded-2xl p-3 md:p-3.5 border flex flex-col gap-2 ${
                      dynamicRecommendation.isBespoke
                        ? 'border-amber-500/30 bg-amber-500/[0.08] dark:bg-amber-500/[0.1]'
                        : 'border-[#004ad7]/20 bg-[#004ad7]/[0.05] dark:bg-[#3b82f6]/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs md:text-sm text-[#15171c] dark:text-white font-medium">
                          {lang === 'ar' ? 'المقاس المقترح:' : 'Recommended Fit:'}
                        </span>
                        <span
                          className={`rounded-md md:rounded-lg px-2 py-0.5 md:px-2.5 md:py-1 text-xs md:text-sm font-bold text-white shadow-2xs ${
                            dynamicRecommendation.isBespoke
                              ? 'bg-amber-600 dark:bg-amber-500'
                              : 'bg-[#004ad7] dark:bg-[#3b82f6]'
                          }`}
                        >
                          {dynamicRecommendation.displaySize}
                        </span>
                      </div>

                      {dynamicRecommendation.isBespoke ? (
                        bespokeControl.visible ? (
                          <a
                            href={bespokeWhatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg md:rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 px-2.5 py-1 md:px-3.5 md:py-1.5 text-[11px] md:text-xs font-semibold text-white shadow-2xs cursor-pointer"
                          >
                            {lang === 'ar' ? bespokeControl.label_ar : bespokeControl.label_en}
                          </a>
                        ) : null
                      ) : dynamicRecommendation.size ? (
                        <button
                          type="button"
                          onClick={() => onSizeClick(dynamicRecommendation.size!)}
                          className="rounded-lg md:rounded-xl bg-[#004ad7] dark:bg-[#3b82f6] px-2.5 py-1 md:px-3.5 md:py-1.5 text-[11px] md:text-xs font-semibold text-white shadow-2xs cursor-pointer active:scale-95"
                        >
                          {lang === 'ar'
                            ? `اختيار مقاس (${dynamicRecommendation.displaySize})`
                            : `Select (${dynamicRecommendation.displaySize})`}
                        </button>
                      ) : null}
                    </div>

                    <p className="text-[10px] md:text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
                      {lang === 'ar' ? dynamicRecommendation.note_ar : dynamicRecommendation.note_en}
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* TAB 2: Measurements Table */}
            {sizeGuideTab === 'table' && (
              <div className="space-y-2.5">
                <div className="rounded-xl sm:rounded-2xl border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-black/30 overflow-hidden">
                  <table className="w-full text-center text-xs md:text-sm">
                    <thead>
                      <tr className="text-[#6b7280] dark:text-[#9ca3af] border-b border-black/8 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04]">
                        <th className="py-2.5 px-3 md:py-3 md:px-4 font-bold text-start w-[30%]">{lang === 'ar' ? 'المقاس' : 'Size'}</th>
                        <th className="py-2.5 px-3 md:py-3 md:px-4 font-bold w-[35%]">{lang === 'ar' ? 'الطول' : 'Height'}</th>
                        <th className="py-2.5 px-3 md:py-3 md:px-4 font-bold w-[35%]">{lang === 'ar' ? 'الوزن' : 'Weight'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs md:text-sm">
                      {masterSizes.filter((r) => r.enabled).map((row) => {
                        const isRowSelected = selectedSize === row.size;
                        return (
                          <tr
                            key={row.id || row.size}
                            onClick={() => onSizeClick(row.size)}
                            className={`transition-colors cursor-pointer ${
                              isRowSelected
                                ? 'bg-[#004ad7]/12 dark:bg-[#3b82f6]/20 font-bold text-[#004ad7] dark:text-[#3b82f6]'
                                : 'text-[#15171c] dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                            title={lang === 'ar' ? `انقر لاختيار مقاس (${row.size})` : `Click to select (${row.size})`}
                          >
                            <td className="py-2.5 px-3 md:py-3 md:px-4 font-bold text-start font-sans">
                              <span className="inline-flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full transition-transform ${isRowSelected ? 'bg-[#004ad7] dark:bg-[#3b82f6] scale-125' : 'bg-black/20 dark:bg-white/20'}`} />
                                <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-xs md:text-sm font-bold">{row.size}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 md:py-3 md:px-4 tabular-nums font-medium text-zinc-700 dark:text-zinc-200">{row.height || '—'}</td>
                            <td className="py-2.5 px-3 md:py-3 md:px-4 tabular-nums font-medium text-zinc-700 dark:text-zinc-200">{row.weight || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10.5px] md:text-xs text-[#6b7280] dark:text-[#9ca3af] text-center">
                  {lang === 'ar' ? 'انقر على أي مقاس لاعتماده فوراً للقطعة' : 'Tap any size row to select it instantly'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSizeSection;

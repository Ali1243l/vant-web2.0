import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Button } from '../ui';
import { ImageUploader } from '../components/ImageUploader';
import {
  Palette,
  Layers,
  Plus,
  Trash2,
  ChevronDown,
  Shirt,
  Sparkles,
  Loader2,
  Wand2,
  Image as ImageIcon,
} from 'lucide-react';
import { toEnglishDigits } from '../format';
import type { ProductVariant } from '../useAdminBridge';
import {
  LUXURY_COLOR_PRESETS,
  STANDARD_SIZES,
  type ProductFormData,
} from './productFormTypes';

interface Props {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  isAr: boolean;
  totalVariantsStock: number;
  expandedVariantIds: Record<string, boolean>;
  toggleVariantExpand: (id: string) => void;
  handleAddNewVariant: (preset?: { ar: string; en: string; hex: string }) => void;
  handleDeleteVariant: (id: string) => void;
  updateVariant: (id: string, updates: Partial<ProductVariant>) => void;
  translatingField: string | null;
  handleMagicTranslate: (
    text: string,
    targetField: string,
    isVariant?: boolean,
    variantId?: string
  ) => void;
  handleAutoDetectVariantColor: (variantId: string) => void;
  toggleVariantSize: (variantId: string, size: string) => void;
  removeVariantSize: (variantId: string, size: string) => void;
  variantShowCustom: Record<string, boolean>;
  variantCustomSizeInputs: Record<string, string>;
  setVariantCustomSizeInputs: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  addVariantCustomSize: (variantId: string) => void;
  handleVariantImageDrop: (variantId: string, files: File[]) => void;
}

export const ProductColorVariantsSection: React.FC<Props> = ({
  formData,
  setFormData,
  isAr,
  totalVariantsStock,
  expandedVariantIds,
  toggleVariantExpand,
  handleAddNewVariant,
  handleDeleteVariant,
  updateVariant,
  translatingField,
  handleMagicTranslate,
  handleAutoDetectVariantColor,
  toggleVariantSize,
  removeVariantSize,
  variantShowCustom,
  variantCustomSizeInputs,
  setVariantCustomSizeInputs,
  addVariantCustomSize,
  handleVariantImageDrop,
}) => {
  return (
    <>
      {/* ======================================================== */}
      {/* COLOR VARIANTS TOGGLE SWITCH & ARCHITECTURE BANNER */}
      {/* ======================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900/80 to-slate-950/80 border border-indigo-500/30 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                formData.hasVariants
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {isAr
                    ? 'تفعيل خيارات الألوان (Color Variants)'
                    : 'Enable Color Variants System'}
                </h3>
                {formData.hasVariants && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {isAr ? 'مُفعل' : 'Active'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'إدارة المنتج تحت موديل واحد مع صور، أسعار، ومخزون ومقاسات منفصلة لكل لون.'
                  : 'Group multiple colors under one product with unique image galleries, stock, sizes, and pricing per color.'}
              </p>
            </div>
          </div>

          {/* Sleek Toggle Switch */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs font-semibold text-slate-300">
              {formData.hasVariants ? (isAr ? 'مفعل' : 'Enabled') : isAr ? 'معطل' : 'Disabled'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={formData.hasVariants}
              onClick={() => {
                const nextState = !formData.hasVariants;
                setFormData((prev) => {
                  let nextVariants = prev.variants;
                  if (nextState && nextVariants.length === 0) {
                    const baseP = parseFloat(prev.price) || 0;
                    const baseSp = prev.salePrice ? parseFloat(prev.salePrice) : undefined;
                    nextVariants = [
                      {
                        id: `var-${Date.now()}`,
                        colorNameAr: 'أسود ملكي',
                        colorNameEn: 'Royal Black',
                        colorHex: '#0f172a',
                        price: baseP > 0 ? baseP : undefined,
                        salePrice: baseSp,
                        stock: parseInt(prev.stock, 10) || 15,
                        sizes: prev.sizes.length > 0 ? prev.sizes : ['M', 'L', 'XL'],
                        images: prev.images.length > 0 ? [...prev.images] : [],
                      },
                    ];
                  }
                  return {
                    ...prev,
                    hasVariants: nextState,
                    variants: nextVariants,
                  };
                });
              }}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                formData.hasVariants ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.hasVariants ? (isAr ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CASE A: COLOR VARIANTS BUILDER (WHEN ENABLED) */}
      {/* ======================================================== */}
      {formData.hasVariants && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Variants Control Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                    {isAr ? 'منشئ خيارات الألوان (Variants Builder)' : 'Color Variants Builder'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? `إجمالي المخزون المحسوب: ${totalVariantsStock} قطعة عبر ${formData.variants.length} ألوان`
                      : `Total Stock across ${formData.variants.length} colors: ${totalVariantsStock} units`}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddNewVariant()}
                leftIcon={<Plus className="w-4 h-4" />}
                className="cursor-pointer"
              >
                {isAr ? 'إضافة لون مخصص جديد' : 'Add Custom Color'}
              </Button>
            </div>

            {/* Quick Preset Palette Badges */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {isAr
                    ? 'إضافة سريعة بنقرة واحدة من لوحة الألوان التجارية الشائعة:'
                    : 'Quick 1-click addition from commercial retail presets:'}
                </span>
              </label>

              <div className="flex flex-wrap gap-2">
                {LUXURY_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => handleAddNewVariant(preset)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/80 text-xs text-slate-300 flex items-center gap-2 transition-all cursor-pointer group"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{isAr ? preset.ar : preset.en}</span>
                    <Plus className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List of Variant Cards with Framer Motion layout & AnimatePresence */}
          <div className="space-y-3.5">
            <AnimatePresence initial={false}>
              {formData.variants.map((variant, index) => {
                const isExpanded = expandedVariantIds[variant.id] ?? true;
                const variantStockNum = Number(variant.stock) || 0;
                const hasCustomSize = variantShowCustom[variant.id];

                return (
                  <motion.div
                    key={variant.id}
                    layout
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md overflow-hidden transition-colors hover:border-slate-700/80 shadow-md"
                  >
                    {/* Variant Card Header (Collapsible & Summary) */}
                    <div
                      onClick={() => toggleVariantExpand(variant.id)}
                      className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer select-none bg-slate-950/40 hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Color Swatch Dot */}
                        <div
                          className="w-8 h-8 rounded-xl border-2 border-slate-700/80 shadow-md flex items-center justify-center relative shrink-0 transition-transform group-hover:scale-105"
                          style={{ backgroundColor: variant.colorHex }}
                        >
                          <span className="text-[10px] font-mono font-bold text-white drop-shadow">
                            #{index + 1}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-white">
                              {variant.colorNameAr || (isAr ? 'لون بدون اسم' : 'Unnamed Color')}
                            </h4>
                            {variant.colorNameEn && (
                              <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                                ({variant.colorNameEn})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-mono text-slate-400">
                              {variant.colorHex}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[11px] text-indigo-400 font-semibold">
                              {variantStockNum} {isAr ? 'قطعة بالمخزن' : 'in stock'}
                            </span>
                            {variant.images && variant.images.length > 0 && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-[11px] text-slate-400">
                                  {variant.images.length} {isAr ? 'صور' : 'photos'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions: Delete & Chevron */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(variant.id)}
                          title={isAr ? 'حذف هذا اللون' : 'Delete Variant'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleVariantExpand(variant.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-indigo-400' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Variant Card Expanded Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-slate-800/80 p-4 sm:p-5 space-y-4"
                        >
                          {/* Row 1: Color Names & Hex Color Picker */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <Input
                              label={isAr ? 'اسم اللون (عربي)' : 'Color Name (Arabic)'}
                              placeholder={isAr ? 'مثال: أسود، كحلي، زيتي' : 'e.g. Black, Navy'}
                              required
                              value={variant.colorNameAr}
                              onChange={(e) =>
                                updateVariant(variant.id, { colorNameAr: e.target.value })
                              }
                            />

                            <Input
                              label={isAr ? 'اسم اللون (إنجليزي)' : 'Color Name (English)'}
                              placeholder="e.g. Black, Navy, Olive"
                              value={variant.colorNameEn}
                              onChange={(e) =>
                                updateVariant(variant.id, { colorNameEn: e.target.value })
                              }
                              action={
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMagicTranslate(
                                      variant.colorNameAr,
                                      `var-${variant.id}`,
                                      true,
                                      variant.id
                                    )
                                  }
                                  disabled={translatingField === `var-${variant.id}`}
                                  title={isAr ? 'ترجمة اسم هذا اللون سحرياً' : 'Magic Translate color name'}
                                  className="p-1 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/15 border border-indigo-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {translatingField === `var-${variant.id}` ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                  )}
                                </button>
                              }
                            />

                            {/* Native & Hex Color Picker */}
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                {isAr ? 'كود اللون (Hex Swatch)' : 'Color Code & Swatch'}
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="relative w-9 h-9.5 shrink-0 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 cursor-pointer">
                                  <input
                                    type="color"
                                    value={variant.colorHex}
                                    onChange={(e) =>
                                      updateVariant(variant.id, { colorHex: e.target.value })
                                    }
                                    className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer opacity-100"
                                  />
                                </div>
                                <input
                                  type="text"
                                  dir="ltr"
                                  placeholder="#000000"
                                  value={variant.colorHex}
                                  onChange={(e) =>
                                    updateVariant(variant.id, { colorHex: e.target.value })
                                  }
                                  className="flex-1 bg-slate-900 border border-slate-800 font-mono text-xs text-white rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                                />
                                {variant.images && variant.images.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleAutoDetectVariantColor(variant.id)}
                                    title={
                                      isAr
                                        ? 'استخراج اللون تلقائياً من الصورة الأولى'
                                        : 'Auto-detect color from 1st image'
                                    }
                                    className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 hover:text-indigo-200 transition-colors shrink-0 cursor-pointer"
                                  >
                                    <Wand2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Row 2: Pricing & Stock for this color */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <Input
                              label={isAr ? 'السعر لهذا اللون (IQD)' : 'Color Price (IQD)'}
                              type="text"
                              inputMode="numeric"
                              dir="ltr"
                              className="font-mono text-left tracking-wider font-bold"
                              placeholder={
                                formData.price
                                  ? `${formData.price} (${isAr ? 'الأساسي' : 'base'})`
                                  : '45000'
                              }
                              value={variant.price !== undefined ? variant.price.toString() : ''}
                              onChange={(e) => {
                                const val = toEnglishDigits(e.target.value).replace(/[^0-9.]/g, '');
                                updateVariant(variant.id, {
                                  price: val ? parseFloat(val) : undefined,
                                });
                              }}
                              action={<span className="text-[11px] font-mono text-slate-400">IQD</span>}
                            />

                            <Input
                              label={isAr ? 'سعر الخصم لهذا اللون (IQD)' : 'Color Sale Price (IQD)'}
                              type="text"
                              inputMode="numeric"
                              dir="ltr"
                              className="font-mono text-left tracking-wider font-bold"
                              placeholder={
                                formData.salePrice
                                  ? `${formData.salePrice} (${isAr ? 'الأساسي' : 'base'})`
                                  : 'اختياري'
                              }
                              value={
                                variant.salePrice !== undefined
                                  ? variant.salePrice.toString()
                                  : ''
                              }
                              onChange={(e) => {
                                const val = toEnglishDigits(e.target.value).replace(/[^0-9.]/g, '');
                                updateVariant(variant.id, {
                                  salePrice: val ? parseFloat(val) : undefined,
                                });
                              }}
                              action={<span className="text-[11px] font-mono text-slate-400">IQD</span>}
                            />

                            <Input
                              label={isAr ? 'المخزون المتاح لهذا اللون' : 'Stock for this color'}
                              type="text"
                              inputMode="numeric"
                              dir="ltr"
                              className="font-mono text-left tracking-wider font-bold"
                              placeholder="15"
                              required
                              value={variant.stock.toString()}
                              onChange={(e) => {
                                const val = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                                updateVariant(variant.id, {
                                  stock: val ? parseInt(val, 10) : 0,
                                });
                              }}
                              action={
                                <span className="text-[11px] text-slate-400">
                                  {isAr ? 'قطعة' : 'units'}
                                </span>
                              }
                            />
                          </div>

                          {/* Row 3: Specific Size Matrix for THIS Color */}
                          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                                <Shirt className="w-3.5 h-3.5 text-indigo-400" />
                                <span>
                                  {isAr
                                    ? 'المقاسات المتوفرة لهذا اللون فقط:'
                                    : 'Available Sizes for this color:'}
                                </span>
                              </label>
                              <span className="text-[11px] text-slate-400">
                                {variant.sizes.length} {isAr ? 'مقاس محدد' : 'sizes selected'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {STANDARD_SIZES.map((size) => {
                                const isCustom = size === 'Custom';
                                const isSelected = isCustom ? hasCustomSize : variant.sizes.includes(size);

                                return (
                                  <button
                                    key={size}
                                    type="button"
                                    onClick={() => toggleVariantSize(variant.id, size)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all select-none cursor-pointer flex items-center gap-1 ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                                    }`}
                                  >
                                    <span>{size}</span>
                                    {isSelected && !isCustom && (
                                      <span
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeVariantSize(variant.id, size);
                                        }}
                                        className="hover:text-rose-300 text-white/80 ms-0.5"
                                      >
                                        ×
                                      </span>
                                    )}
                                  </button>
                                );
                              })}

                              {variant.sizes
                                .filter((s) => !STANDARD_SIZES.slice(0, 7).includes(s))
                                .map((custSize) => (
                                  <span
                                    key={custSize}
                                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-600/20 text-violet-300 border border-violet-500/40 flex items-center gap-1"
                                  >
                                    <span>{custSize}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeVariantSize(variant.id, custSize)}
                                      className="hover:text-rose-400 text-violet-400 cursor-pointer"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                            </div>

                            {hasCustomSize && (
                              <div className="flex items-center gap-2 pt-1 animate-in fade-in">
                                <input
                                  type="text"
                                  placeholder={
                                    isAr
                                      ? 'مقاس مخصص (مثال: 4XL، 50، 52، تفصيل خاص)'
                                      : 'Custom size (e.g. 4XL, 50, 52, Bespoke)'
                                  }
                                  value={variantCustomSizeInputs[variant.id] || ''}
                                  onChange={(e) =>
                                    setVariantCustomSizeInputs((prev) => ({
                                      ...prev,
                                      [variant.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addVariantCustomSize(variant.id);
                                    }
                                  }}
                                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => addVariantCustomSize(variant.id)}
                                >
                                  {isAr ? 'إضافة' : 'Add'}
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Row 4: Dedicated Image Uploader for THIS Variant */}
                          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                                <span>
                                  {isAr
                                    ? `معرض صور هذا اللون (${variant.colorNameAr}):`
                                    : `Media gallery for ${variant.colorNameEn || 'this color'}:`}
                                </span>
                              </label>
                              <span className="text-[11px] font-mono text-slate-400">
                                {variant.images.length}/6 {isAr ? 'صور' : 'photos'}
                              </span>
                            </div>

                            <ImageUploader
                              images={variant.images}
                              onChange={(imgs) => updateVariant(variant.id, { images: imgs })}
                              maxFiles={8}
                              onRawFiles={(files) => handleVariantImageDrop(variant.id, files)}
                              enableAutoColorSort={true}
                              dropzoneTitle={
                                isAr ? (
                                  <>
                                    اسحب القمصان هنا أو <span className="text-indigo-400 underline">استعرض الملفات</span>
                                  </>
                                ) : (
                                  <>
                                    Drop shirts here or <span className="text-indigo-400 underline">browse files</span>
                                  </>
                                )
                              }
                              dropzoneSubtitle={
                                isAr
                                  ? '✨ قراءة ذكية لدرجات القماش: يحتفظ بصور هذا اللون هنا، ويقسم باقي الألوان في كروت منفصلة تلقائياً!'
                                  : '✨ Auto-reads fabric colors: retains matching shirts here, and auto-generates cards for other colors!'
                              }
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
};

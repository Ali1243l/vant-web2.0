import React from 'react';
import { Input, Button } from '../ui';
import { ImageUploader } from '../components/ImageUploader';
import {
  Image as ImageIcon,
  Box,
  Shirt,
  Plus,
  X,
  Check,
} from 'lucide-react';
import { toEnglishDigits } from '../format';
import { STANDARD_SIZES, type ProductFormData } from './productFormTypes';

interface Props {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  isAr: boolean;
  onBaseImageDrop: (files: File[]) => void;
  toggleSize: (size: string) => void;
  addCustomSize: () => void;
  removeSize: (size: string) => void;
  customSizeInput: string;
  setCustomSizeInput: (val: string) => void;
  showCustomInput: boolean;
  setShowCustomInput: (val: boolean) => void;
}

export const ProductSingleMediaSection: React.FC<Props> = ({
  formData,
  setFormData,
  isAr,
  onBaseImageDrop,
  toggleSize,
  addCustomSize,
  removeSize,
  customSizeInput,
  setCustomSizeInput,
  showCustomInput,
  setShowCustomInput,
}) => {
  return (
    <>
      {/* Base Image Uploader */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-200">
              {isAr ? 'صور المنتج ومعرض الوسائط' : 'Product Media & Gallery'}
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {formData.images.length}/12 {isAr ? 'صور' : 'photos'}
          </span>
        </div>

        <ImageUploader
          images={formData.images}
          onChange={(imgs) => setFormData((prev) => ({ ...prev, images: imgs }))}
          maxFiles={12}
          onRawFiles={onBaseImageDrop}
          enableAutoColorSort={true}
          dropzoneTitle={
            isAr ? (
              <>
                اسحب كل القمصان أو المنتجات هنا ليتم قراءتها وتقسيمها، أو{' '}
                <span className="text-indigo-400 underline">استعرض الملفات</span>
              </>
            ) : (
              <>
                Drop all shirts or products here to auto-read and split, or{' '}
                <span className="text-indigo-400 underline">browse files</span>
              </>
            )
          }
          dropzoneSubtitle={
            isAr
              ? 'يمكن اقتراح مجموعات ألوان من الصور. راجع النتائج وحدد الأسعار والكميات والمقاسات قبل الحفظ.'
              : '✨ Color AI: Drop all shirts at once to auto-read fabric colors and split into variants with stock & pricing with zero clicks!'
          }
        />
      </div>

      {/* Base Inventory & Stock */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Box className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-200">
            {isAr ? 'المخزون وحالة التوفر والنشر' : 'Stock & Availability Status'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label={isAr ? 'كمية المخزون المتاحة' : 'Available Stock'}
            type="text"
            inputMode="numeric"
            dir="ltr"
            className="font-mono text-left tracking-wider font-bold"
            placeholder="15"
            required
            value={formData.stock}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                stock: toEnglishDigits(e.target.value).replace(/[^0-9]/g, ''),
              }))
            }
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'حالة التوفر (Availability)' : 'Availability Status'}
            </label>
            <select
              value={formData.availabilityStatus}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  availabilityStatus: e.target.value as any,
                }))
              }
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="in_stock">{isAr ? 'متوفر بالمخزن (In Stock)' : 'In Stock'}</option>
              <option value="limited">{isAr ? 'كمية محدودة (Limited)' : 'Limited Stock'}</option>
              <option value="coming_soon">{isAr ? 'قريباً (Coming Soon)' : 'Coming Soon'}</option>
              <option value="sold_out">{isAr ? 'نفد بالكامل (Sold Out)' : 'Sold Out'}</option>
            </select>
          </div>


        </div>
      </div>

      {/* Base Sizes Matrix */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Shirt className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-200">
              {isAr ? 'المقاسات والأحجام المتاحة' : 'Available Sizes Matrix'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {formData.sizes.length} {isAr ? 'مقاسات مختارة' : 'sizes selected'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STANDARD_SIZES.map((size) => {
            const isCustom = size === 'Custom';
            const isSelected = isCustom ? showCustomInput : formData.sizes.includes(size);

            return (
              <button
                key={size}
                type="button"
                onClick={() => {
                  if (isCustom) {
                    setShowCustomInput(!showCustomInput);
                  } else {
                    toggleSize(size);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {isSelected && !isCustom && <Check className="w-3 h-3" />}
                {isCustom && <Plus className="w-3 h-3" />}
                <span>{size}</span>
              </button>
            );
          })}
        </div>

        {/* Custom size input */}
        {showCustomInput && (
          <div className="flex items-center gap-2 pt-2 animate-in fade-in duration-200 max-w-sm">
            <Input
              placeholder={isAr ? 'أدخل المقاس (مثال: 4XL, 42, 32W)' : 'Enter custom size'}
              value={customSizeInput}
              onChange={(e) => setCustomSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomSize();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addCustomSize}
              className="shrink-0"
            >
              {isAr ? 'إضافة' : 'Add'}
            </Button>
          </div>
        )}

        {/* Selected custom badges */}
        {formData.sizes.filter((s) => !STANDARD_SIZES.includes(s)).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {formData.sizes
              .filter((s) => !STANDARD_SIZES.includes(s))
              .map((cs) => (
                <span
                  key={cs}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                >
                  {cs}
                  <button
                    type="button"
                    onClick={() => removeSize(cs)}
                    className="hover:text-red-400 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>
    </>
  );
};

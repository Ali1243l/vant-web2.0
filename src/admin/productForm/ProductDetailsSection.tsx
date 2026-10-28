import React from 'react';
import { Input } from '../ui';
import { Box, FileText, Loader2, Sparkles } from 'lucide-react';
import type { ProductFormData } from './productFormTypes';

interface Props {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  isAr: boolean;
  totalVariantsStock: number;
  translatingField: string | null;
  onMagicTranslate: (text: string, targetField: keyof ProductFormData) => void;
}

export const ProductDetailsSection: React.FC<Props> = ({
  formData,
  setFormData,
  isAr,
  totalVariantsStock,
  translatingField,
  onMagicTranslate,
}) => {
  return (
    <>
      {/* Module: Publishing & Availability status for variants products */}
      {formData.hasVariants && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Box className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                {isAr ? 'حالة النشر والتوفر الإجمالية' : 'Overall Publishing & Availability Status'}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {totalVariantsStock} {isAr ? 'قطعة إجمالية' : 'Total Stock'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? 'حالة التوفر' : 'Availability Status'}
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
      )}

      {/* Module: Materials & Bilingual Descriptions */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-200">
            {isAr ? 'الخامات وتفاصيل الوصف' : 'Materials & Descriptions'}
          </h3>
        </div>

        <Input
          label={isAr ? 'الخامات وتفاصيل القماش / المواد (Material Details)' : 'Material & Fabric Specs'}
          placeholder={
            isAr
              ? 'مثال: قطن بيما بيروفي 100%، خياطة يدوية مزدوجة، مقاوم للانكماش'
              : 'e.g. 100% Peruvian Pima Cotton, Bespoke Double Stitch, Anti-Shrink'
          }
          value={formData.materialDetails}
          onChange={(e) => setFormData((prev) => ({ ...prev, materialDetails: e.target.value }))}
          action={
            <button
              type="button"
              onClick={() => onMagicTranslate(formData.materialDetails, 'materialDetails')}
              disabled={translatingField === 'materialDetails'}
              title={isAr ? 'ترجمة وتنسيق الخامات تلقائياً' : 'Translate specs into English'}
              className="p-1 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/15 border border-indigo-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {translatingField === 'materialDetails' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
          }
        />

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'وصف المنتج التفصيلي (باللغة العربية)' : 'Detailed Description (Arabic)'}
            </label>
            <textarea
              rows={3}
              placeholder={
                isAr
                  ? 'اكتب وصفاً تسويقياً شاملاً للمنتج ومزاياه واستخداماته وخيارات ألوانه...'
                  : 'Enter Arabic product description...'
              }
              value={formData.descriptionAr}
              onChange={(e) => setFormData((prev) => ({ ...prev, descriptionAr: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isAr ? 'وصف المنتج التفصيلي (باللغة الإنجليزية)' : 'Detailed Description (English)'}
              </label>
              <button
                type="button"
                onClick={() => onMagicTranslate(formData.descriptionAr, 'descriptionEn')}
                disabled={translatingField === 'descriptionEn'}
                title={isAr ? 'ترجمة الوصف تلقائياً من العربية' : 'Translate description from Arabic'}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/15 border border-indigo-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {translatingField === 'descriptionEn' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{isAr ? 'ترجمة سحرية (Magic Translate)' : 'Magic Translate'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Enter comprehensive English product copy, features, color stories, and specs..."
              value={formData.descriptionEn}
              onChange={(e) => setFormData((prev) => ({ ...prev, descriptionEn: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </>
  );
};

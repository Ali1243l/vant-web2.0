import React from 'react';
import { Input } from '../ui';
import { Info, Sparkles, Loader2, Coins } from 'lucide-react';
import { toEnglishDigits, formatCurrency } from '../format';
import type { ProductFormData } from './productFormTypes';

interface Props {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  isAr: boolean;
  translateNotice: string | null;
  translatingField: string | null;
  onMagicTranslate: (text: string, targetField: keyof ProductFormData) => void;
  hasDiscount: boolean;
  computedDiscountPercent: number;
  computedSavings: number;
}

export const ProductBasicInfoSection: React.FC<Props> = ({
  formData,
  setFormData,
  isAr,
  translateNotice,
  translatingField,
  onMagicTranslate,
  hasDiscount,
  computedDiscountPercent,
  computedSavings,
}) => {
  return (
    <>
      {/* Module: Basic Product Information & SKU */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-200">
              {isAr ? 'البيانات الأساسية والتصنيف' : 'Basic Info & Category'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            SKU: {formData.sku}
          </span>
        </div>

        {translateNotice && (
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{translateNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={isAr ? 'اسم المنتج (عربي)' : 'Product Title (Arabic)'}
            placeholder={isAr ? 'مثال: تيشيرت بيما قطن ملكي مطرز' : 'e.g. Royal Embroidered Tee'}
            required
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />

          <Input
            label={isAr ? 'اسم المنتج (إنجليزي)' : 'Product Title (English)'}
            placeholder="e.g. Royal Embroidered Pima Cotton Tee"
            value={formData.nameEn}
            onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
            action={
              <button
                type="button"
                onClick={() => onMagicTranslate(formData.name, 'nameEn')}
                disabled={translatingField === 'nameEn'}
                title={isAr ? 'ترجمة سحرية من الاسم العربي' : 'Magic Translate from Arabic Title'}
                className="p-1 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/15 border border-indigo-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {translatingField === 'nameEn' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'التصنيف / الفئة' : 'Category'}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="ملابس وأزياء">{isAr ? 'ملابس وأزياء عامة' : 'Apparel'}</option>
              <option value="المعاطف والسترات">{isAr ? 'المعاطف والسترات الكشمير' : 'Coats & Outerwear'}</option>
              <option value="الأزياء الرسمية">{isAr ? 'الأزياء الرسمية والبدلات (Bespoke)' : 'Formal & Tailoring'}</option>
              <option value="التريكو والصوف">{isAr ? 'التريكو وصوف الميرينو' : 'Knitwear & Cashmere'}</option>
              <option value="القمصان والتيشيرت">{isAr ? 'القمصان والتيشيرتات الملكية' : 'Shirts & Tees'}</option>
              <option value="الأحذية">{isAr ? 'الأحذية الجلدية الكلاسيكية' : 'Footwear'}</option>
              <option value="الإكسسوارات">{isAr ? 'الحقائب والإكسسوارات الفاخرة' : 'Leather Goods & Accessories'}</option>
            </select>
          </div>

          <Input
            label={isAr ? 'رمز التخزين التعريفي (SKU)' : 'SKU Identifier'}
            placeholder="TEE-7701"
            required
            dir="ltr"
            className="font-mono text-left tracking-wider"
            value={formData.sku}
            onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
          />
        </div>
      </div>

      {/* Module: Pricing in Iraqi Dinar & Live Promo Preview */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-200">
              {isAr ? 'التسعير الأساسي بالدينار العراقي والعروض' : 'Base Pricing & Promo (IQD)'}
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            IQD
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={
              isAr
                ? formData.hasVariants
                  ? 'السعر الأساسي المعتمد (IQD) - يمكن تخصيصه لكل لون'
                  : 'السعر الأساسي (IQD)'
                : formData.hasVariants
                ? 'Base Regular Price (IQD) - Overridable per variant'
                : 'Regular Price (IQD)'
            }
            type="text"
            inputMode="numeric"
            dir="ltr"
            className="font-mono text-left tracking-wider font-bold"
            placeholder="45000"
            required
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                price: toEnglishDigits(e.target.value).replace(/[^0-9.]/g, ''),
              }))
            }
            action={<span className="text-xs font-mono font-bold text-slate-400">IQD</span>}
          />

          <Input
            label={isAr ? 'سعر الخصم / التخفيض (اختياري - IQD)' : 'Sale Price (Optional - IQD)'}
            type="text"
            inputMode="numeric"
            dir="ltr"
            className="font-mono text-left tracking-wider font-bold"
            placeholder="39000"
            value={formData.salePrice}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                salePrice: toEnglishDigits(e.target.value).replace(/[^0-9.]/g, ''),
              }))
            }
            action={<span className="text-xs font-mono font-bold text-slate-400">IQD</span>}
          />
        </div>

        {/* Dynamic Live Discount Box */}
        {hasDiscount && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-indigo-950/40 to-emerald-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {isAr
                  ? `خصم مباشر مفعل بنسبة %${computedDiscountPercent}`
                  : `Active promo discount of ${computedDiscountPercent}% OFF`}
              </span>
            </div>
            <div className="text-xs font-medium text-emerald-300 flex items-center gap-1.5" dir="ltr">
              <span>{isAr ? 'توفير الزبون: ' : 'Customer Saves: '}</span>
              <strong className="font-mono font-bold text-emerald-400">
                {formatCurrency(computedSavings, 'IQD', 'en')}
              </strong>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

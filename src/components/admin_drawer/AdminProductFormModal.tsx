import React from 'react';
import { motion } from 'framer-motion';
import { Package, X, Coins } from 'lucide-react';
import ImageUploader from '../ImageUploader';
import { ALL_SIZES, type Product, type ProductAvailability } from '../../types';

export interface AdminProductFormModalProps {
  isOpen: boolean;
  isAddingNew: boolean;
  editingProduct: Product | null;
  isAr?: boolean;
  formTitleAr: string;
  setFormTitleAr: (val: string) => void;
  formTitleEn: string;
  setFormTitleEn: (val: string) => void;
  formPrice: number;
  setFormPrice: (val: number) => void;
  formOriginalPrice: number;
  setFormOriginalPrice: (val: number) => void;
  formIsOffer: boolean;
  setFormIsOffer: (val: boolean) => void;
  formOfferBadgeAr: string;
  setFormOfferBadgeAr: (val: string) => void;
  formOfferBadgeEn: string;
  setFormOfferBadgeEn: (val: string) => void;
  formCategory: string;
  setFormCategory: (val: string) => void;
  formCategoryAr: string;
  setFormCategoryAr: (val: string) => void;
  formAvailability: ProductAvailability;
  setFormAvailability: (val: ProductAvailability) => void;
  formImagesList: string[];
  setFormImagesList: (val: string[]) => void;
  formImageUrl: string;
  setFormImageUrl: (val: string) => void;
  setFormExtraImages: (val: string) => void;
  formSizes: string[];
  setFormSizes: (val: string[]) => void;
  formMaterial: string;
  setFormMaterial: (val: string) => void;
  formDescAr: string;
  setFormDescAr: (val: string) => void;
  formDescEn: string;
  setFormDescEn: (val: string) => void;
  handleSaveProductForm: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const AdminProductFormModal: React.FC<AdminProductFormModalProps> = ({
  isOpen,
  isAddingNew,
  editingProduct,
  isAr = true,
  formTitleAr,
  setFormTitleAr,
  formTitleEn,
  setFormTitleEn,
  formPrice,
  setFormPrice,
  formOriginalPrice,
  setFormOriginalPrice,
  formIsOffer,
  setFormIsOffer,
  formOfferBadgeAr,
  setFormOfferBadgeAr,
  formOfferBadgeEn,
  setFormOfferBadgeEn,
  formCategory,
  setFormCategory,
  formCategoryAr,
  setFormCategoryAr,
  formAvailability,
  setFormAvailability,
  formImagesList,
  setFormImagesList,
  formImageUrl,
  setFormImageUrl,
  setFormExtraImages,
  formSizes,
  setFormSizes,
  formMaterial,
  setFormMaterial,
  formDescAr,
  setFormDescAr,
  formDescEn,
  setFormDescEn,
  handleSaveProductForm,
  onClose,
}) => {
  if (!isOpen && !isAddingNew && !editingProduct) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative flex flex-col w-full max-w-2xl h-[90vh] max-h-[90vh] rounded-3xl border border-white/15 bg-[#12151e] shadow-2xl overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-5 py-4 bg-[#151926]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-400" />
            <span>
              {isAddingNew
                ? isAr
                  ? 'إضافة قطعة جديدة للكتالوج'
                  : 'Add New Piece to Catalog'
                : isAr
                ? 'تعديل تفاصيل القطعة'
                : 'Edit Piece Details'}
            </span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form Scrollable */}
        <form
          onSubmit={handleSaveProductForm}
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 touch-pan-y"
        >
          {/* Titles AR & EN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1">
                {isAr ? 'اسم القطعة (العربية)' : 'Title (Arabic)'} *
              </label>
              <input
                type="text"
                required
                value={formTitleAr}
                onChange={(e) => setFormTitleAr(e.target.value)}
                placeholder="مثال: سترة صوف كشمير عاجية"
                className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1">
                {isAr ? 'اسم القطعة (الإنجليزية)' : 'Title (English)'} *
              </label>
              <input
                type="text"
                required
                value={formTitleEn}
                onChange={(e) => setFormTitleEn(e.target.value)}
                placeholder="e.g. Sculptural Double-Breasted Blazer"
                className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>

          {/* Pricing & Offers Section */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-amber-400" />
                <span>{isAr ? 'التسعير والعروض الخاصة' : 'Pricing & Offers'}</span>
              </span>

              {/* Offer Switch */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-white/70">
                  {isAr ? 'تفعيل كعرض خاص (Discount Offer)' : 'Special Offer'}
                </span>
                <input
                  type="checkbox"
                  checked={formIsOffer}
                  onChange={(e) => setFormIsOffer(e.target.checked)}
                  className="h-4 w-4 rounded accent-rose-500 cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">
                  {formIsOffer
                    ? isAr
                      ? 'سعر البيع بعد العرض (النهائي)'
                      : 'Offer Price (Final)'
                    : isAr
                    ? 'السعر'
                    : 'Price'}{' '}
                  *
                </label>
                <input
                  type="number"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className={`h-10 w-full rounded-xl border px-3 text-xs font-bold outline-none ${
                    formIsOffer
                      ? 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                      : 'border-white/15 bg-black/40 text-white'
                  }`}
                />
              </div>

              {formIsOffer && (
                <div>
                  <label className="text-xs text-white/70 block mb-1">
                    {isAr
                      ? 'السعر الأصلي قبل الخصم (للمقارنة والشطب)'
                      : 'Original Price (Strikethrough)'}
                  </label>
                  <input
                    type="number"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white/70 outline-none"
                  />
                  {formOriginalPrice > formPrice && (
                    <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">
                      {isAr
                        ? `نسبة الخصم: ${Math.round(
                            ((formOriginalPrice - formPrice) / formOriginalPrice) * 100
                          )}% توفير`
                        : `Savings: ${Math.round(
                            ((formOriginalPrice - formPrice) / formOriginalPrice) * 100
                          )}% off`}
                    </span>
                  )}
                </div>
              )}
            </div>

            {formIsOffer && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-white/70 block mb-1">
                    {isAr ? 'نص شارة العرض (العربية)' : 'Offer Badge (AR)'}
                  </label>
                  <input
                    type="text"
                    value={formOfferBadgeAr}
                    onChange={(e) => setFormOfferBadgeAr(e.target.value)}
                    placeholder="عرض خاص / خصم 20%"
                    className="h-9 w-full rounded-lg border border-rose-500/30 bg-black/40 px-2.5 text-xs text-rose-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/70 block mb-1">
                    {isAr ? 'نص شارة العرض (الإنجليزية)' : 'Offer Badge (EN)'}
                  </label>
                  <input
                    type="text"
                    value={formOfferBadgeEn}
                    onChange={(e) => setFormOfferBadgeEn(e.target.value)}
                    placeholder="Special Offer / 20% OFF"
                    className="h-9 w-full rounded-lg border border-rose-500/30 bg-black/40 px-2.5 text-xs text-rose-200 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1">
                {isAr ? 'القسم (Category)' : 'Category'} *
              </label>
              <select
                value={formCategory}
                onChange={(e) => {
                  setFormCategory(e.target.value);
                  if (e.target.value === 'Tailoring') setFormCategoryAr('الأزياء الرسمية');
                  else if (e.target.value === 'Outerwear') setFormCategoryAr('المعاطف والسترات');
                  else if (e.target.value === 'Knitwear') setFormCategoryAr('التريكو والصوف');
                  else if (e.target.value === 'Leather Goods') setFormCategoryAr('الجلود الراقية');
                  else if (e.target.value === 'Footwear') setFormCategoryAr('الأحذية');
                  else if (e.target.value === 'Bespoke') setFormCategoryAr('التفصيل الخاص');
                }}
                className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none cursor-pointer"
              >
                <option value="Tailoring">Tailoring (الأزياء الرسمية)</option>
                <option value="Outerwear">Outerwear (المعاطف والسترات)</option>
                <option value="Knitwear">Knitwear (التريكو والصوف)</option>
                <option value="Leather Goods">Leather Goods (الجلود الراقية)</option>
                <option value="Footwear">Footwear (الأحذية)</option>
                <option value="Bespoke">Bespoke (التفصيل الخاص)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1">
                {isAr ? 'حالة التوفر' : 'Availability'} *
              </label>
              <select
                value={formAvailability}
                onChange={(e) => setFormAvailability(e.target.value as ProductAvailability)}
                className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none cursor-pointer"
              >
                <option value="in_stock">{isAr ? 'متوفر وجاهز للشحن الفوري' : 'In Stock'}</option>
                <option value="sold_out">{isAr ? 'منتهي من المخزون' : 'Sold Out'}</option>
                <option value="coming_soon">{isAr ? 'إصدار قادم قريباً' : 'Coming Soon'}</option>
                <option value="limited">{isAr ? 'كمية محدودة جداً' : 'Limited Archive'}</option>
              </select>
            </div>
          </div>

          {/* File, Folder, and URL Image Management with ImageUploader */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <ImageUploader
              images={formImagesList}
              primaryImage={formImageUrl || formImagesList[0]}
              onPrimaryChange={(pri) => {
                setFormImageUrl(pri);
                const reordered = [pri, ...formImagesList.filter((x) => x !== pri)];
                setFormImagesList(reordered);
                setFormExtraImages(reordered.slice(1).join('\n'));
              }}
              onChange={(newImgs) => {
                setFormImagesList(newImgs);
                setFormImageUrl(newImgs[0] || '');
                setFormExtraImages(newImgs.slice(1).join('\n'));
              }}
              isAr={isAr}
              recommendedSpec="1200 × 1500 px (4:5)"
              allowMultiple={true}
            />
          </div>

          {/* Available Sizes Selection */}
          <div>
            <label className="text-xs font-semibold text-white/70 block mb-1.5">
              {isAr ? 'المقاسات المتوفرة للقطعة' : 'Available Sizes'}
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => {
                const isSelected = formSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setFormSizes(formSizes.filter((s) => s !== size));
                      } else {
                        setFormSizes([...formSizes, size]);
                      }
                    }}
                    className={`h-8 w-11 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#004ad7] border-[#004ad7] text-white shadow-xs'
                        : 'border-white/15 bg-black/30 text-white/60 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material & Description */}
          <div>
            <label className="text-xs font-semibold text-white/70 block mb-1">
              {isAr ? 'الخامة والقماش' : 'Material & Fabric'}
            </label>
            <input
              type="text"
              value={formMaterial}
              onChange={(e) => setFormMaterial(e.target.value)}
              placeholder="مثال: 100% صوف إيطالي عيار 150"
              className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1">
                {isAr ? 'الوصف (العربية)' : 'Description (Arabic)'}
              </label>
              <textarea
                rows={2}
                value={formDescAr}
                onChange={(e) => setFormDescAr(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/40 p-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1">
                {isAr ? 'الوصف (الإنجليزية)' : 'Description (English)'}
              </label>
              <textarea
                rows={2}
                value={formDescEn}
                onChange={(e) => setFormDescEn(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/40 p-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
            >
              {isAddingNew
                ? isAr
                  ? 'إضافة القطعة للكتالوج'
                  : 'Add Piece'
                : isAr
                ? 'حفظ التعديلات'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminProductFormModal;

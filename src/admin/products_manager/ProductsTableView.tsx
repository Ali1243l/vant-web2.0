import React from 'react';
import { Package, Edit2, Tag, Check, Link2, Copy, Trash2, Sparkles } from 'lucide-react';
import { Product } from '../useAdminBridge';
import { formatCurrency } from '../format';
import { Card, StatusBadge } from '../ui';

interface ProductsTableViewProps {
  isAr: boolean;
  filteredProducts: Product[];
  totalCatalogCount: number;
  activeOffersCount: number;
  copiedId: string | null;
  onQuickEdit: (p: Product) => void;
  onOpenOfferModal: (p: Product) => void;
  onCopyLink: (p: Product) => void;
  onDuplicate: (p: Product) => void;
  onDeleteConfirm: (id: string) => void;
}

export const ProductsTableView: React.FC<ProductsTableViewProps> = ({
  isAr,
  filteredProducts,
  totalCatalogCount,
  activeOffersCount,
  copiedId,
  onQuickEdit,
  onOpenOfferModal,
  onCopyLink,
  onDuplicate,
  onDeleteConfirm,
}) => {
  return (
    <Card className="p-0 overflow-hidden border border-slate-800/80 bg-slate-900/90 rounded-2xl shadow-xl w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-start border-collapse min-w-[1020px]">
          <thead>
            <tr className="border-b border-slate-800/90 bg-slate-900/95 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th className="py-4.5 px-6 text-start">{isAr ? 'المنتج والتفاصيل' : 'Product & Details'}</th>
              <th className="py-4.5 px-6 text-start">{isAr ? 'التصنيف' : 'Category'}</th>
              <th className="py-4.5 px-6 text-start">{isAr ? 'المقاسات المتاحة' : 'Available Sizes'}</th>
              <th className="py-4.5 px-6 text-start">{isAr ? 'السعر والعرض' : 'Price & Promo'}</th>
              <th className="py-4.5 px-6 text-start">{isAr ? 'المخزون' : 'Stock'}</th>
              <th className="py-4.5 px-6 text-start">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="py-4.5 px-6 text-end">
                {isAr ? 'الإجراءات السريعة (Quick Actions)' : 'Quick Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {filteredProducts.map((p) => {
              const hasOffer = p.isOnOffer || !!p.salePrice;
              const isCopied = copiedId === p.id;
              return (
                <tr
                  key={p.id}
                  className="hover:bg-slate-850/60 transition-colors group cursor-default"
                >
                  {/* Product Name, Image & Tags */}
                  <td className="py-4.5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        {p.imageUrl?.trim() ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-slate-800 border border-slate-700/80 shadow-md group-hover:scale-[1.02] transition-transform"
                          />
                        ) : (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-500 shadow-md">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                        {hasOffer && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenOfferModal(p);
                            }}
                            className="absolute -top-2 -start-2 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-lg ring-2 ring-slate-950 cursor-pointer hover:scale-110 transition-transform"
                            title={isAr ? 'عرض ترويجي نشط (انقر للتعديل)' : 'Active Promo (Click to edit)'}
                          >
                            %
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-white text-sm sm:text-base leading-snug truncate max-w-md xl:max-w-xl 2xl:max-w-2xl">
                            {isAr ? p.name : p.nameEn || p.name}
                          </h4>
                          {hasOffer && (
                            <button
                              type="button"
                              onClick={() => onOpenOfferModal(p)}
                              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35 hover:bg-amber-500/25 flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                              title={isAr ? 'تعديل أو تغيير قائمة العرض' : 'Edit or change promo campaign'}
                            >
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>
                                {p.offerCampaign ||
                                  p.offerBadgeText ||
                                  (isAr ? 'عرض نشط' : 'Active Offer')}
                              </span>
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 font-mono">
                          <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
                            SKU: {p.sku}
                          </span>
                          {p.images && p.images.length > 1 && (
                            <span className="text-[11px] text-slate-400 font-sans">
                              ({p.images.length} {isAr ? 'صور' : 'photos'})
                            </span>
                          )}
                          {p.hasVariants && p.variants && p.variants.length > 0 && (
                            <div className="flex items-center gap-1.5 ms-1 font-sans">
                              <div className="flex items-center -space-x-1 rtl:space-x-reverse">
                                {p.variants.slice(0, 4).map((v) => (
                                  <span
                                    key={v.id}
                                    className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm inline-block shrink-0"
                                    style={{ backgroundColor: v.colorHex }}
                                    title={`${v.colorNameAr} (${v.colorNameEn})`}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] font-semibold text-indigo-400">
                                {p.variants.length} {isAr ? 'ألوان' : 'colors'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4.5 px-6 whitespace-nowrap">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {p.category}
                    </span>
                  </td>

                  {/* Sizes */}
                  <td className="py-4.5 px-6">
                    <div className="flex flex-wrap gap-1.5 max-w-[160px] xl:max-w-[260px]">
                      {p.sizes && p.sizes.length > 0 ? (
                        p.sizes.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/70 shadow-2xs"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          {isAr ? 'قياسي / موحد' : 'Standard'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Price & Offer */}
                  <td className="py-4.5 px-6 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div className="flex items-baseline gap-2 font-mono">
                        <span className="text-base font-extrabold text-white tracking-tight">
                          {formatCurrency(p.salePrice || p.price, 'IQD', 'en')}
                        </span>
                        {p.salePrice && (
                          <span className="text-xs text-slate-500 line-through">
                            {formatCurrency(p.price, 'IQD', 'en')}
                          </span>
                        )}
                      </div>
                      {p.salePrice && (
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                          <span>
                            {isAr ? 'توفير' : 'Save'}{' '}
                            {formatCurrency(p.price - p.salePrice, 'IQD', 'en')}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-4.5 px-6 whitespace-nowrap">
                    <div
                      className={`text-sm font-bold flex items-center gap-1.5 ${
                        p.stock === 0
                          ? 'text-rose-400'
                          : p.stock <= 5
                          ? 'text-amber-400'
                          : 'text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          p.stock === 0
                            ? 'bg-rose-500'
                            : p.stock <= 5
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span>
                        {p.stock} {isAr ? 'قطعة' : 'units'}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4.5 px-6 whitespace-nowrap">
                    <StatusBadge
                      status={p.status}
                      label={
                        p.status === 'active'
                          ? isAr
                            ? 'متوفر نشط'
                            : 'Active'
                          : p.status === 'lowStock'
                          ? isAr
                            ? 'مخزون منخفض'
                            : 'Low Stock'
                          : p.status === 'outOfStock'
                          ? isAr
                            ? 'نفد المخزون'
                            : 'Out of Stock'
                          : isAr
                          ? 'مسودة'
                          : 'Draft'
                      }
                    />
                  </td>

                  {/* Quick Actions */}
                  <td className="py-4.5 px-6 text-end whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onQuickEdit(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                        title={isAr ? 'تعديل بيانات المنتج' : 'Edit Product'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenOfferModal(p)}
                        className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                          hasOffer
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shadow-sm shadow-amber-500/20'
                            : 'bg-slate-800/90 text-slate-300 border-slate-700/70 hover:text-amber-300 hover:border-amber-500/40 hover:bg-slate-800'
                        }`}
                        title={
                          isAr
                            ? hasOffer
                              ? 'تعديل العرض الترويجي النشط أو إزالته'
                              : 'تخصيص عرض خاص أو إضافة لقائمة عروض (تخفيضات الشتاء وغيرها)'
                            : 'Configure promo offer or assign to campaign'
                        }
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>
                          {hasOffer ? (isAr ? 'عرض نشط' : 'On Sale') : (isAr ? 'إضافة عرض' : 'Offer')}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onCopyLink(p)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-800/90 text-slate-400 border-slate-700/70 hover:text-white hover:border-slate-600'
                        }`}
                        title={isAr ? 'نسخ رابط المنتج المباشر' : 'Copy Product Link'}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicate(p)}
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/90 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
                        title={isAr ? 'تكرار / مضاعفة المنتج' : 'Duplicate Product'}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteConfirm(p.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/90 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                        title={isAr ? 'حذف المنتج' : 'Delete Product'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            {isAr ? 'عرض' : 'Showing'}{' '}
            <strong className="text-white">{filteredProducts.length}</strong>{' '}
            {isAr ? 'من أصل' : 'of'}{' '}
            <strong className="text-white">{totalCatalogCount}</strong>{' '}
            {isAr ? 'منتجات في الكتالوج' : 'products in catalog'}
          </span>
          <span>·</span>
          <span className="text-amber-400 font-medium">
            {activeOffersCount}{' '}
            {isAr ? 'منتجات ضمن العروض النشطة' : 'active promotional items'}
          </span>
        </div>
      </div>
    </Card>
  );
};

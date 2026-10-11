import React from 'react';
import { Package, Edit2, Tag, Check, Link2, Trash2, Palette } from 'lucide-react';
import { Product } from '../useAdminBridge';
import { formatCurrency } from '../format';
import { Button, Card, StatusBadge } from '../ui';

interface ProductsGridViewProps {
  isAr: boolean;
  filteredProducts: Product[];
  copiedId: string | null;
  onQuickEdit: (p: Product) => void;
  onOpenOfferModal: (p: Product) => void;
  onCopyLink: (p: Product) => void;
  onDeleteConfirm: (id: string) => void;
}

export const ProductsGridView: React.FC<ProductsGridViewProps> = ({
  isAr,
  filteredProducts,
  copiedId,
  onQuickEdit,
  onOpenOfferModal,
  onCopyLink,
  onDeleteConfirm,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredProducts.map((p) => {
        const hasOffer = p.isOnOffer || !!p.salePrice;
        const isCopied = copiedId === p.id;
        return (
          <Card
            key={p.id}
            className="p-0 overflow-hidden border border-slate-800 bg-slate-900 flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div>
              {/* Product Thumbnail Banner */}
              <div className="relative aspect-video w-full bg-slate-800 overflow-hidden flex items-center justify-center">
                {p.imageUrl?.trim() ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Package className="w-10 h-10 text-slate-600" />
                )}
                {/* Badges Overlay */}
                <div className="absolute top-3 end-3 flex items-center gap-1.5">
                  <StatusBadge status={p.status} />
                </div>
                {hasOffer && (
                  <div className="absolute top-3 start-3">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenOfferModal(p);
                      }}
                      className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1 cursor-pointer hover:bg-amber-400 transition-colors"
                    >
                      <span>%</span>
                      <span>
                        {p.offerCampaign || p.offerBadgeText || (isAr ? 'عرض خاص' : 'Promo')}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Body Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {p.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">SKU: {p.sku}</span>
                </div>
                <h3 className="font-bold text-white text-base line-clamp-1 mt-2">
                  {isAr ? p.name : p.nameEn || p.name}
                </h3>

                {/* Color Variants Swatches in Grid Card */}
                {p.hasVariants && p.variants && p.variants.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center -space-x-1.5 rtl:space-x-reverse">
                      {p.variants.slice(0, 5).map((v) => (
                        <span
                          key={v.id}
                          className="w-4 h-4 rounded-full border-2 border-slate-900 shadow-sm inline-block shrink-0"
                          style={{ backgroundColor: v.colorHex }}
                          title={`${v.colorNameAr} (${v.colorNameEn})`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      {p.variants.length} {isAr ? 'خيارات ألوان' : 'color variants'}
                    </span>
                  </div>
                )}

                {/* Sizing tags */}
                {p.sizes && p.sizes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {p.sizes.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {s}
                      </span>
                    ))}
                    {p.sizes.length > 4 && (
                      <span className="text-xs text-slate-500">+{p.sizes.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 pt-0 space-y-3">
              {/* Pricing row in Iraqi Dinars */}
              <div className="flex items-center justify-between pt-3.5 border-t border-slate-800">
                <div dir="ltr">
                  <span className="text-lg font-extrabold text-white font-mono tracking-tight">
                    {formatCurrency(p.salePrice || p.price, 'IQD', 'en')}
                  </span>
                  {p.salePrice && (
                    <span className="text-xs text-slate-500 line-through ms-2 font-mono">
                      {formatCurrency(p.price, 'IQD', 'en')}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {p.stock} {isAr ? 'في المخزن' : 'in stock'}
                </span>
              </div>

              {/* Quick Actions Bar */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  {/* Quick Edit */}
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => onQuickEdit(p)}
                    className="flex-1 text-xs"
                  >
                    {isAr ? 'تعديل سريع' : 'Quick Edit'}
                  </Button>
                  {/* Open Offer Modal */}
                  <button
                    type="button"
                    onClick={() => onOpenOfferModal(p)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      hasOffer
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300 hover:border-amber-500/40'
                    }`}
                    title={
                      isAr
                        ? hasOffer
                          ? 'تعديل العرض النشط أو إزالته'
                          : 'تخصيص عرض خاص أو إضافة لقائمة عروض (تخفيضات الشتاء وغيرها)'
                        : 'Configure promo or assign to campaign'
                    }
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => onCopyLink(p)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                    }`}
                    title={isAr ? 'نسخ الرابط' : 'Copy Link'}
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
                  </button>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onDeleteConfirm(p.id)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
                    title={isAr ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

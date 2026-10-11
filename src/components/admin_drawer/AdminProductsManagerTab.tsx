import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  RotateCcw,
  Search,
  Tag,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Edit3,
  Trash2,
} from 'lucide-react';
import type { Product, ProductAvailability } from '../../types';
import type { UserBehaviorStats } from '../../lib/analytics';
import { useSiteControls } from '../../context/SiteControlsContext';

interface AdminProductsManagerTabProps {
  isAr: boolean;
  products: Product[];
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string | number, updates: Partial<Product>) => void;
  deleteProduct: (id: string | number) => void;
  toggleProductAvailability: (id: string | number, status: ProductAvailability) => void;
  handleOpenAddModal: () => void;
  handleOpenEditModal: (p: Product) => void;
  analyticsStats: UserBehaviorStats;
}

export const AdminProductsManagerTab: React.FC<AdminProductsManagerTabProps> = ({
  isAr,
  products,
  refreshProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  handleOpenAddModal,
  handleOpenEditModal,
  analyticsStats,
}) => {
  const { formatPrice } = useSiteControls();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [onlyOffersFilter, setOnlyOffersFilter] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string | number>>(new Set());
  const [copiedLinkProductId, setCopiedLinkProductId] = useState<string | number | null>(null);

  // Available Categories derived from products
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (onlyOffersFilter && !p.is_offer) return false;
      if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) return false;
      if (productSearch.trim()) {
        const query = productSearch.toLowerCase().trim();
        const titleEnMatch = p.title?.toLowerCase().includes(query);
        const titleArMatch = p.title_ar?.toLowerCase().includes(query);
        const descMatch = p.description?.toLowerCase().includes(query) || p.description_ar?.toLowerCase().includes(query);
        const materialMatch = p.material?.toLowerCase().includes(query);
        const tagsMatch = p.tags?.some((t) => t.toLowerCase().includes(query));
        return titleEnMatch || titleArMatch || descMatch || materialMatch || tagsMatch;
      }
      return true;
    });
  }, [products, onlyOffersFilter, selectedCategoryFilter, productSearch]);

  const handleQuickToggleOffer = (p: Product) => {
    const updatedStatus = !p.is_offer;
    updateProduct(p.id, {
      is_offer: updatedStatus,
      original_price: updatedStatus ? (p.original_price || Math.round(p.price * 1.25)) : undefined,
      offer_badge_ar: updatedStatus ? (p.offer_badge_ar || 'عرض خاص') : undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Bar with Add and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-400" />
            <span>{isAr ? 'إدارة الكتالوج والعروض والتخفيضات' : 'Catalog & Special Offers CMS'}</span>
          </h2>
          <p className="text-xs text-white/60 mt-0.5">
            {isAr
              ? `إجمالي القطع في المعرض: ${products.length} قطعة (${products.filter((p) => p.is_offer).length} عروض خاصة نشطة)`
              : `Total pieces: ${products.length} (${products.filter((p) => p.is_offer).length} active offers)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {syncToast && (
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg animate-fade-in">
              {isAr ? '✓ تم تحديث ومزامنة البيانات مع Supabase' : '✓ Synced with Supabase'}
            </span>
          )}

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{isAr ? 'إضافة قطعة جديدة' : 'Add New Piece'}</span>
          </button>

          <button
            type="button"
            disabled={isSyncing}
            onClick={async () => {
              setIsSyncing(true);
              await refreshProducts();
              setIsSyncing(false);
              setSyncToast(true);
              setTimeout(() => setSyncToast(false), 3000);
            }}
            title={isAr ? 'مزامنة مع قاعدة البيانات السحابية Supabase' : 'Sync with Supabase'}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-[#3b82f6]' : ''}`} />
            <span className="hidden sm:inline">
              {isSyncing ? (isAr ? 'جارِ المزامنة...' : 'Syncing...') : (isAr ? 'مزامنة Supabase' : 'Sync Supabase')}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="flex flex-wrap items-center gap-2.5 bg-white/[0.03] border border-white/10 rounded-2xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم، الخامة، أو الوسم...' : 'Search pieces by title, fabric, tags...'}
            className="h-10 w-full rounded-xl border border-white/10 bg-black/40 ltr:pl-9 rtl:pr-9 ltr:pr-3 rtl:pl-3 text-xs text-white placeholder-white/40 outline-none focus:border-[#3b82f6]"
          />
        </div>

        {/* Offers Only Toggle */}
        <button
          type="button"
          onClick={() => setOnlyOffersFilter(!onlyOffersFilter)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all cursor-pointer ${
            onlyOffersFilter
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-xs'
              : 'border-white/10 bg-black/30 text-white/60 hover:text-white'
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          <span>{isAr ? 'عروض وتخفيضات فقط' : 'Offers Only'}</span>
        </button>

        {/* Category Filter Dropdown */}
        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none cursor-pointer"
        >
          <option value="all">{isAr ? 'كافة الأقسام' : 'All Categories'}</option>
          {availableCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredProducts.map((p) => {
          const displayTitle = isAr && p.title_ar ? p.title_ar : p.title;
          const isExpanded = expandedProductIds.has(p.id);
          const allImages = (p.images && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : [])
            .map((s) => s?.trim())
            .filter(Boolean) as string[];

          // Calculate piece-specific live engagement from analyticsStats
          const pieceStats = analyticsStats.topProducts.find((tp) => String(tp.id) === String(p.id)) || {
            views: 0,
            wishlistAdds: 0,
            whatsappClicks: 0,
            conversionPct: 0,
          };

          // Calculate Discount & Margin
          const discountAmount = p.is_offer && p.original_price ? p.original_price - p.price : 0;
          const discountPct =
            p.is_offer && p.original_price && p.original_price > 0
              ? Math.round((discountAmount / p.original_price) * 100)
              : 0;

          return (
            <div
              key={p.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between ${
                isExpanded
                  ? 'border-[#004ad7]/60 bg-[#12151f] shadow-2xl md:col-span-2 lg:col-span-3'
                  : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.04]'
              }`}
            >
              <div className="p-3.5">
                {/* Card Header & Summary */}
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      const next = new Set(expandedProductIds);
                      if (isExpanded) next.delete(p.id);
                      else next.add(p.id);
                      setExpandedProductIds(next);
                    }}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 cursor-pointer group"
                  >
                    {p.image_url?.trim() ? (
                      <img
                        src={p.image_url}
                        alt={displayTitle}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white/30 text-[10px]">
                        —
                      </div>
                    )}
                    {p.is_offer && (
                      <span className="absolute top-1 ltr:left-1 rtl:right-1 rounded-md bg-rose-600 px-1 py-0.2 text-[8px] font-bold text-white shadow-xs">
                        {p.offer_badge_ar || 'خصم'}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold">
                      {isExpanded ? (isAr ? 'طي ▴' : 'Collapse') : (isAr ? 'توسيع ▾' : 'Expand')}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4
                        onClick={() => {
                          const next = new Set(expandedProductIds);
                          if (isExpanded) next.delete(p.id);
                          else next.add(p.id);
                          setExpandedProductIds(next);
                        }}
                        className="text-xs font-bold text-white truncate cursor-pointer hover:text-[#3b82f6] transition-colors"
                        title={displayTitle}
                      >
                        {displayTitle}
                      </h4>

                      {/* Quick Expand Toggle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const next = new Set(expandedProductIds);
                          if (isExpanded) next.delete(p.id);
                          else next.add(p.id);
                          setExpandedProductIds(next);
                        }}
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-white/50 block font-mono">{p.category}</span>

                    <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold ${p.is_offer ? 'text-rose-400' : 'text-[#3b82f6]'}`}>
                        {formatPrice(p.price)}
                      </span>
                      {p.is_offer && p.original_price && (
                        <span className="text-[10px] line-through text-white/40">
                          {formatPrice(p.original_price)}
                        </span>
                      )}
                      {p.is_offer && discountPct > 0 && (
                        <span className="rounded bg-rose-500/20 px-1 py-0.2 text-[9px] font-bold text-rose-300">
                          -{discountPct}%
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${
                            p.availability === 'sold_out'
                              ? 'bg-rose-500'
                              : p.availability === 'coming_soon'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span className="text-[10px] text-white/60">
                          {p.availability === 'sold_out'
                            ? isAr
                              ? 'منتهي'
                              : 'Sold Out'
                            : p.availability === 'coming_soon'
                            ? isAr
                              ? 'قريباً'
                              : 'Coming'
                            : isAr
                            ? 'متوفر'
                            : 'In Stock'}
                        </span>
                      </div>

                      {/* Quick stats counter */}
                      <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                        <span>👁️ {pieceStats.views}</span>
                        <span>💬 {pieceStats.whatsappClicks}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* EXPANDED RICH DETAILS SECTION (Visible when clicked) */}
                {/* ========================================================= */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-fade-in">
                    {/* 1. Piece Multi-Angle Gallery Thumbnails */}
                    <div>
                      <span className="text-[11px] font-bold text-white/70 block mb-2">
                        {isAr ? `معرض صور القطعة (${allImages.length} صور مرفوعة)` : `Gallery Angles (${allImages.length} images)`}
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {allImages.map((img, imgIdx) =>
                          img?.trim() ? (
                            <a
                              key={imgIdx}
                              href={img.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-white/10 hover:border-[#3b82f6] transition-all"
                            >
                              <img src={img.trim()} alt="" className="h-full w-full object-cover" />
                              <span className="absolute bottom-0.5 ltr:right-0.5 rtl:left-0.5 rounded bg-black/70 px-1 text-[8px] text-white/80 font-mono">
                                #{imgIdx + 1}
                              </span>
                            </a>
                          ) : null
                        )}
                      </div>
                    </div>

                    {/* 2. Piece Live Analytics & CTR Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center">
                        <span className="text-[10px] text-white/50 block">{isAr ? 'المشاهدات' : 'Views'}</span>
                        <span className="text-sm font-bold text-[#3b82f6] font-mono tabular-nums">{pieceStats.views}</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center">
                        <span className="text-[10px] text-white/50 block">{isAr ? 'المفضلة' : 'Wishlist'}</span>
                        <span className="text-sm font-bold text-rose-400 font-mono tabular-nums">{pieceStats.wishlistAdds}</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center">
                        <span className="text-[10px] text-white/50 block">{isAr ? 'طلبات الواتساب' : 'WhatsApp'}</span>
                        <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">{pieceStats.whatsappClicks}</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center">
                        <span className="text-[10px] text-white/50 block">{isAr ? 'نسبة النقر (CTR)' : 'CTR %'}</span>
                        <span className="text-sm font-bold text-amber-400 font-mono tabular-nums">{pieceStats.conversionPct}%</span>
                      </div>
                    </div>

                    {/* 3. Sizing, Fabric, and Descriptions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-1.5">
                        <span className="text-[11px] font-bold text-white/60 block">{isAr ? 'المقاسات المتاحة:' : 'Sizes:'}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(p.sizes || ['S', 'M', 'L', 'XL']).map((sz) => (
                            <span key={sz} className="rounded-lg bg-white/10 border border-white/10 px-2 py-0.5 text-[11px] font-bold font-mono text-white">
                              {sz}
                            </span>
                          ))}
                        </div>

                        {p.material && (
                          <div className="pt-1 text-[11px] text-white/70">
                            <span className="text-white/40">{isAr ? 'الخامة والقماش: ' : 'Fabric: '}</span>
                            <span className="font-medium text-white">{p.material}</span>
                          </div>
                        )}

                        {p.tags && p.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-1">
                            {p.tags.map((t) => (
                              <span key={t} className="rounded-md bg-[#004ad7]/15 text-[#3b82f6] px-1.5 py-0.2 text-[10px]">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-1">
                        <span className="text-[11px] font-bold text-white/60 block">{isAr ? 'الوصف والتفاصيل:' : 'Description:'}</span>
                        <p className="text-[11px] text-white/80 line-clamp-3 leading-relaxed">
                          {isAr ? p.description_ar || p.description || 'لا يوجد وصف مخصص' : p.description || p.description_ar}
                        </p>
                      </div>
                    </div>

                    {/* 4. Quick Action Utilities */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/?product=${p.id}`);
                          setCopiedLinkProductId(p.id);
                          setTimeout(() => setCopiedLinkProductId(null), 2000);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-all cursor-pointer"
                      >
                        {copiedLinkProductId === p.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedLinkProductId === p.id ? (isAr ? 'تم نسخ الرابط!' : 'Copied!') : (isAr ? 'نسخ رابط القطعة' : 'Copy Link')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newPayload: Omit<Product, 'id'> = {
                            title: `${p.title} (Copy)`,
                            title_ar: p.title_ar ? `${p.title_ar} (نسخة)` : undefined,
                            price: p.price,
                            original_price: p.original_price,
                            is_offer: p.is_offer,
                            offer_badge_ar: p.offer_badge_ar,
                            offer_badge_en: p.offer_badge_en,
                            category: p.category,
                            category_ar: p.category_ar,
                            image_url: p.image_url,
                            images: p.images,
                            availability: p.availability,
                            tags: p.tags,
                            description: p.description,
                            description_ar: p.description_ar,
                            material: p.material,
                            sizes: p.sizes,
                          };
                          addProduct(newPayload);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 text-purple-400" />
                        <span>{isAr ? 'استنساخ القطعة' : 'Duplicate Piece'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Action Footer Buttons */}
              <div className="p-3.5 pt-2 border-t border-white/10 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  {/* Toggle Offer Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickToggleOffer(p)}
                    title={isAr ? 'تبديل حالة العرض الخاص' : 'Toggle Special Offer'}
                    className={`rounded-lg px-2 py-1 text-[10px] font-semibold border transition-all cursor-pointer ${
                      p.is_offer
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
                    }`}
                  >
                    {p.is_offer ? (isAr ? 'عرض نشط' : 'Offer ON') : (isAr ? '+ عرض' : 'Set Offer')}
                  </button>

                  {/* Toggle Availability Quick Selector */}
                  <select
                    value={p.availability || 'in_stock'}
                    onChange={(e) => toggleProductAvailability(p.id, e.target.value as ProductAvailability)}
                    className="h-7 rounded-lg border border-white/10 bg-black/40 px-1 text-[10px] text-white outline-none cursor-pointer"
                  >
                    <option value="in_stock">{isAr ? 'متوفر' : 'Stock'}</option>
                    <option value="sold_out">{isAr ? 'منتهي' : 'Sold'}</option>
                    <option value="coming_soon">{isAr ? 'قريباً' : 'Soon'}</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(p)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/80 hover:bg-[#004ad7] hover:text-white transition-all cursor-pointer"
                    title={isAr ? 'تعديل كامل' : 'Edit Piece'}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(isAr ? `هل أنت متأكد من حذف قطعة "${displayTitle}"؟` : `Delete product "${p.title}"?`)) {
                        deleteProduct(p.id);
                      }
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                    title={isAr ? 'حذف القطعة' : 'Delete Piece'}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminProductsManagerTab;

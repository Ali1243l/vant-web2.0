import React, { useState } from 'react';
import { useAdminBridge, Product } from './useAdminBridge';
import { filterCatalog, hasProductOffer, productSellingPrice, productLink, catalogOfferPlan } from './products_manager/catalogModel';
import { ProductFormSheet } from './ProductFormSheet';
import { ProductOfferModal } from './ProductOfferModal';
import { ProductsManagerHeader } from './products_manager/ProductsManagerHeader';
import { ProductsTableView } from './products_manager/ProductsTableView';
import { ProductsGridView } from './products_manager/ProductsGridView';
import { DeleteProductModal } from './products_manager/DeleteProductModal';
import ToastNotification from '../components/ToastNotification';
import { PaginationWidget } from '../components/admin/widgets/PaginationWidget';
import { useSiteControls } from '../context/SiteControlsContext';

export const ProductsManager: React.FC = () => {
  const { products, deleteProduct, addProduct, updateProduct, offers, addOffer, lang } = useAdminBridge();
  const isAr = lang === 'ar';
  const catalog = useSiteControls();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'sales' | 'stock'>('default');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => window.innerWidth < 768 ? 'grid' : 'table');

  // VANT UI Widgets States: RangeSlider & Pagination
  const [priceRange, setPriceRange] = useState<number[]>([0, Number.MAX_SAFE_INTEGER]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // Sheet & Modal state
  const [initialProduct, setInitialProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Offer Customization Modal State
  const [selectedProductForOffer, setSelectedProductForOffer] = useState<Product | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Quick Action Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Categories list
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Show temporary toast notification
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Filter products with Search, Category, Status, and Price Range Slider Widget
  const priceCeiling = Math.max(1, ...products.map(productSellingPrice));
  const filteredProducts = filterCatalog(products, { search, category: selectedCategory, status: selectedStatus, min: priceRange[0], max: priceRange[1], sort: sortBy });
  // Paginated slice for current page
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  // Open Offer Modal
  const handleOpenOfferModal = (p: Product) => {
    setSelectedProductForOffer(p);
    setIsOfferModalOpen(true);
  };

  // Apply Offer
  const handleApplyOffer = (
    productId: string,
    updates: {
      isOnOffer: boolean;
      salePrice?: number;
      offerCampaign?: string;
      offerBadgeText?: string;
      discountPercent?: number;
    },
    applyToAllInCategory?: boolean
  ) => {
    if (applyToAllInCategory && catalog.hasMore) { showToast(isAr ? 'حمّل بقية الكتالوج قبل تطبيق عرض على فئة كاملة.' : 'Load the rest of the catalog before applying a category-wide offer.', 'error'); return false; }
    try {
      const product = products.find(item => item.id === productId);
      if (!product) throw new Error('Product not found');
      const targets = applyToAllInCategory ? products.filter(item => item.category === product.category) : [product];
      const campaign = updates.offerCampaign ? offers.find(offer => offer.code === updates.offerCampaign || offer.title === updates.offerCampaign || offer.titleEn === updates.offerCampaign) : undefined;
      if (updates.offerCampaign && !campaign) throw new Error('Campaign no longer exists');
      const plan = catalogOfferPlan(targets, applyToAllInCategory ? updates : { salePrice: updates.salePrice }, campaign);
      for (const item of plan) updateProduct(item.id, { ...updates, salePrice: item.salePrice });
      showToast(isAr ? `حُدثت بيانات العرض في الكتالوج (${plan.length} منتج).` : `Catalog offer updated (${plan.length} products).`, 'info');
      return true;
    } catch { showToast(isAr ? 'لم يُطبق العرض: راجع السعر والخصم لكل منتج.' : 'Offer not applied: check each product price and discount.', 'error'); return false; }
  };
  // Remove Offer
  const handleRemoveOffer = (productId: string, removeFromAllInCategory?: boolean) => {
    if (removeFromAllInCategory && catalog.hasMore) { showToast(isAr ? 'حمّل بقية الكتالوج قبل تعديل فئة كاملة.' : 'Load the rest of the catalog before changing a whole category.', 'error'); return; }
    const prod = products.find((item) => item.id === productId);
    const prodName = isAr ? prod?.name : prod?.nameEn || prod?.name;

    if (removeFromAllInCategory && prod?.category) {
      const categoryProducts = products.filter((p) => p.category === prod.category && (p.isOnOffer || !!p.salePrice));
      categoryProducts.forEach((p) => {
        updateProduct(p.id, {
          isOnOffer: false,
          salePrice: undefined,
          offerCampaign: undefined,
          offerBadgeText: undefined,
        });
      });
      showToast(
        isAr
          ? `تم إلغاء العروض من جميع منتجات فئة "${prod.category}" (${categoryProducts.length} منتجات).`
          : `Promo removed from all products in category "${prod.category}".`,
        'info'
      );
    } else {
      updateProduct(productId, {
        isOnOffer: false,
        salePrice: undefined,
        offerCampaign: undefined,
        offerBadgeText: undefined,
      });
      showToast(
        isAr
          ? `تم إلغاء العرض الترويجي وإعادة السعر الأصلي لـ "${prodName}".`
          : `Promo removed and original price restored for "${prodName}".`,
        'info'
      );
    }
  };

  // Quick Edit
  const handleQuickEdit = (p: Product) => {
    setInitialProduct(null);
    setEditingProduct(p);
    setIsSheetOpen(true);
  };

  // Copy Link
  const handleCopyLink = async (p: Product) => {
    try {
      await navigator.clipboard.writeText(productLink(window.location.origin, p.id));
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 2500);
      showToast(isAr ? 'تم نسخ رابط المنتج.' : 'Product link copied.');
    } catch { showToast(isAr ? 'تعذر نسخ الرابط؛ تحقق من صلاحية الحافظة.' : 'Could not copy the link; check clipboard permission.', 'error'); }
  };
  const handleDuplicate = (p: Product) => {
    setEditingProduct(null);
    setInitialProduct({ ...structuredClone(p), name: `${p.name} — نسخة`, sku: `${p.sku}-COPY-${Date.now().toString(36)}` });
    setIsSheetOpen(true);
  };
  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteProduct(deleteConfirmId);
      setDeleteConfirmId(null);
      showToast(isAr ? 'تم حذف المنتج من الكتالوج.' : 'Product removed from catalog.', 'info');
    }
  };

  const totalUnits = filteredProducts.reduce((sum, p) => sum + (p.stockKnown === false ? 0 : p.stock), 0);
  const activeOffersCount = filteredProducts.filter(hasProductOffer).length;
  const outOfStockCount = filteredProducts.filter((p) => p.stockKnown !== false && p.stock === 0).length;

  return (
    <div className="products-manager space-y-5 pb-12 relative w-full min-w-0">
      {/* Toast Notification Banner */}
      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage(null)}
        position="bottom-start"
      />

      {/* Header and Filter Controls */}
      <ProductsManagerHeader
        isAr={isAr}
        productsCount={products.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onNewProduct={() => {
          setInitialProduct(null);
          setEditingProduct(null);
          setIsSheetOpen(true);
        }}
        search={search}
        setSearch={value => { setSearch(value); setCurrentPage(1); }}
        selectedCategory={selectedCategory}
        setSelectedCategory={value => { setSelectedCategory(value); setCurrentPage(1); }}
        categories={categories}
        selectedStatus={selectedStatus}
        setSelectedStatus={value => { setSelectedStatus(value); setCurrentPage(1); }}
        sortBy={sortBy}
        setSortBy={value => { setSortBy(value); setCurrentPage(1); }}
        filteredCount={filteredProducts.length}
        totalUnits={totalUnits}
        unknownStockCount={filteredProducts.filter(product => product.stockKnown === false).length}
        priceCeiling={priceCeiling}
        onResetFilters={() => { setSearch(''); setSelectedCategory('all'); setSelectedStatus('all'); setSortBy('default'); setPriceRange([0, Number.MAX_SAFE_INTEGER]); setCurrentPage(1); }}
        activeOffersCount={activeOffersCount}
        outOfStockCount={outOfStockCount}
        priceRange={priceRange}
        setPriceRange={(range) => {
          setPriceRange(range);
          setCurrentPage(1);
        }}
        onResetPriceRange={() => {
          setPriceRange([0, Number.MAX_SAFE_INTEGER]);
          setCurrentPage(1);
        }}
      />

      {catalog.hasMore && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 p-4"><p className="text-xs text-slate-400">{isAr ? `الفلاتر تشمل المنتجات المحمّلة فقط (${products.length} من ${catalog.totalProductsCount}).` : `Filters apply to loaded products only (${products.length} of ${catalog.totalProductsCount}).`}</p><button type="button" disabled={catalog.loadingMore} onClick={() => void catalog.loadMoreProducts()} className="min-h-11 rounded-lg border border-indigo-500/40 px-4 text-sm text-indigo-200 disabled:opacity-50">{isAr ? (catalog.loadingMore ? 'جاري التحميل...' : 'تحميل المزيد من الكتالوج') : (catalog.loadingMore ? 'Loading...' : 'Load more catalog items')}</button></div>}
      {/* Main View Mode: Table or Grid with Paginated Items */}
      {viewMode === 'table' ? (
        <ProductsTableView
          isAr={isAr}
          filteredProducts={paginatedProducts}
          totalCatalogCount={products.length}
          activeOffersCount={activeOffersCount}
          copiedId={copiedId}
          onQuickEdit={handleQuickEdit}
          onOpenOfferModal={handleOpenOfferModal}
          onCopyLink={handleCopyLink}
          onDeleteConfirm={(id) => setDeleteConfirmId(id)}
          onDuplicate={handleDuplicate}
        />
      ) : (
        <ProductsGridView
          isAr={isAr}
          filteredProducts={paginatedProducts}
          copiedId={copiedId}
          onQuickEdit={handleQuickEdit}
          onOpenOfferModal={handleOpenOfferModal}
          onCopyLink={handleCopyLink}
          onDeleteConfirm={(id) => setDeleteConfirmId(id)}
          onDuplicate={handleDuplicate}
        />
      )}

      {/* Pagination Widget for Products */}
      {filteredProducts.length > 0 && (
        <div className="pt-2">
          <PaginationWidget
            currentPage={safeCurrentPage}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 8, 12, 24]}
            lang={isAr ? 'ar' : 'en'}
            itemLabel={isAr ? 'منتج' : 'products'}
          />
        </div>
      )}

      {/* Product Form Slide-over Sheet */}
      <ProductFormSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        editingProduct={editingProduct}
        initialProduct={initialProduct}
      />

      {/* Product Offer Assignment / Customization Modal */}
      {isOfferModalOpen && selectedProductForOffer && (
        <ProductOfferModal
          isOpen={isOfferModalOpen}
          onClose={() => {
            setIsOfferModalOpen(false);
            setSelectedProductForOffer(null);
          }}
          product={selectedProductForOffer}
          products={products}
          offers={offers}
          onApplyOffer={handleApplyOffer}
          onRemoveOffer={handleRemoveOffer}
          onAddNewOfferCampaign={addOffer}
          isAr={isAr}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteProductModal
        productName={products.find(product => product.id === deleteConfirmId)?.name}
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        isAr={isAr}
      />
    </div>
  );
};

export default ProductsManager;
